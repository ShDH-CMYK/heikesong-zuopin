"""Validate DeepSeek GLB structure and a separately decoded companion's arrays.

Python's standard library does NOT decode Draco. Produce a companion with a
trusted glTF decoder first (for example glTF-Transform dedup, with no geometric
optimization), then pass both paths. Their SHA-256 hashes are recorded; matching
metadata is checked, but is not an independent proof of the decoding process.

python tools/validate-deepseek.py pets/deepseek.glb \
  output/model-review/deepseek-dedup.glb --output output/model-review/validation.json
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

COMPONENTS = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2),
              5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
WIDTHS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
TOLERANCE = 1e-4


class GLB:
    def __init__(self, path):
        self.path = Path(path)
        data = self.path.read_bytes()
        if len(data) < 20 or struct.unpack_from('<III', data) != (0x46546C67, 2, len(data)):
            raise ValueError(f'Invalid GLB header: {path}')
        self.digest = hashlib.sha256(data).hexdigest()
        self.size = len(data)
        self.json = None
        self.bin = None
        pos = 12
        while pos < len(data):
            size, kind = struct.unpack_from('<II', data, pos)
            pos += 8
            chunk = data[pos:pos + size]
            if len(chunk) != size:
                raise ValueError('Truncated GLB chunk')
            if kind == 0x4E4F534A:
                self.json = json.loads(chunk)
            elif kind == 0x004E4942:
                self.bin = chunk
            pos += size
        if pos != len(data) or self.json is None or self.bin is None:
            raise ValueError('GLB must contain JSON and BIN chunks')

    def accessor(self, index):
        a = self.json['accessors'][index]
        if 'sparse' in a:
            raise ValueError('This validator explicitly does not support sparse accessors')
        if 'bufferView' not in a:
            raise ValueError('Accessor has no decoded bufferView; decode Draco first')
        view = self.json['bufferViews'][a['bufferView']]
        if view.get('buffer', 0) != 0:
            raise ValueError('External buffers are not supported')
        fmt, size = COMPONENTS[a['componentType']]
        width = WIDTHS[a['type']]
        if a['type'] == 'MAT4' and size != 4:
            raise ValueError('Only float MAT4 accessors are supported')
        stride = view.get('byteStride', width * size)
        offset = view.get('byteOffset', 0) + a.get('byteOffset', 0)
        end = offset + max(0, a['count'] - 1) * stride + width * size
        if stride < width * size or end > view.get('byteOffset', 0) + view['byteLength'] or end > len(self.bin):
            raise ValueError('Accessor exceeds buffer bounds')
        rows = [struct.unpack_from('<' + fmt * width, self.bin, offset + i * stride)
                for i in range(a['count'])]
        if a.get('normalized'):
            limits = {5120: 127, 5121: 255, 5122: 32767, 5123: 65535}
            if a['componentType'] not in limits:
                raise ValueError('Invalid normalized accessor component type')
            limit = limits[a['componentType']]
            rows = [tuple(max(-1, x / limit) for x in row) for row in rows]
        return rows

    def primitives(self):
        return [(m.get('name', str(mi)), p) for mi, m in enumerate(self.json.get('meshes', []))
                for p in m.get('primitives', [])]

    def joint_names(self, skin):
        return [self.json['nodes'][i].get('name', str(i)) for i in skin['joints']]

    def identity(self):
        return {'path': self.path.as_posix(), 'bytes': self.size, 'sha256': self.digest}


def validate(final, decoded):
    errors = []
    def check(ok, message):
        if not ok:
            errors.append(message)
    check('KHR_draco_mesh_compression' not in decoded.json.get('extensionsRequired', []),
          'Companion still requires Draco decoding')
    final_prims, prims = final.primitives(), decoded.primitives()
    check(len(final_prims) == len(prims), 'Final/decoded primitive counts differ')
    final_skins = final.json.get('skins', [])
    skins = decoded.json.get('skins', [])
    check(bool(skins), 'No skin found')
    check([final.joint_names(s) for s in final_skins] == [decoded.joint_names(s) for s in skins],
          'Final/decoded joint names or order differ')
    skin_by_mesh = {}
    for node in decoded.json.get('nodes', []):
        if 'mesh' in node:
            check('skin' in node, f'Mesh node {node.get("name")} has no skin')
            if 'skin' in node:
                skin_by_mesh[node['mesh']] = node['skin']
    for si, skin in enumerate(skins):
        bind = decoded.accessor(skin['inverseBindMatrices'])
        check(len(bind) == len(skin['joints']), f'Skin {si}: inverse-bind count mismatch')
        check(all(math.isfinite(v) for row in bind for v in row), f'Skin {si}: nonfinite inverse-bind matrix')

    stats = []
    mixed = Counter()
    totals = Counter()
    minimum, maximum = [math.inf] * 3, [-math.inf] * 3
    max_sum_error = 0.0
    primitive_index = 0
    for mesh_index, mesh in enumerate(decoded.json.get('meshes', [])):
        names = decoded.joint_names(skins[skin_by_mesh[mesh_index]])
        for p in mesh['primitives']:
            label = f'{mesh.get("name", mesh_index)} / {primitive_index}'
            check('KHR_draco_mesh_compression' not in p.get('extensions', {}), label + ': compressed companion primitive')
            attrs = p['attributes']
            check(all(x in attrs for x in ['POSITION', 'JOINTS_0', 'WEIGHTS_0', 'TEXCOORD_0']), label + ': missing required attribute')
            check('JOINTS_1' not in attrs and 'WEIGHTS_1' not in attrs, label + ': extra influence set unsupported by this asset validator')
            positions = decoded.accessor(attrs['POSITION'])
            joints = decoded.accessor(attrs['JOINTS_0'])
            weights = decoded.accessor(attrs['WEIGHTS_0'])
            check(len(positions) == len(joints) == len(weights), label + ': attribute counts differ')
            count = len(positions)
            fp = final_prims[primitive_index][1]
            check(set(fp['attributes']) == set(attrs), label + ': final/decoded attribute semantics differ')
            for semantic, accessor_index in attrs.items():
                fa = final.json['accessors'][fp['attributes'][semantic]]
                da = decoded.json['accessors'][accessor_index]
                check(all(fa[k] == da[k] for k in ['count', 'type', 'componentType']), label + ': final/decoded descriptor differs: ' + semantic)
                values = decoded.accessor(accessor_index)
                check(all(math.isfinite(v) for row in values for v in row), label + ': nonfinite ' + semantic)
                check(len(values) == count, label + ': unequal vertex attribute counts')
            invalid_joints = invalid_weights = unweighted = sum_failures = mixed_count = 0
            for j, w in zip(joints, weights):
                invalid_joints += int(any(int(v) != v or v < 0 or v >= len(names) for v in j))
                invalid_weights += int(any(not math.isfinite(v) or v < 0 or v > 1 + TOLERANCE for v in w))
                total = sum(w)
                unweighted += int(total <= 1e-8)
                error = abs(total - 1)
                max_sum_error = max(max_sum_error, error)
                sum_failures += int(error > TOLERANCE)
                active = sorted(set(names[int(b)] for b, weight in zip(j, w)
                                    if weight > 1e-6 and 0 <= int(b) < len(names)))
                if len(active) > 1:
                    mixed_count += 1
                    mixed[' + '.join(active)] += 1
            for pos in positions:
                for axis in range(3):
                    minimum[axis] = min(minimum[axis], pos[axis])
                    maximum[axis] = max(maximum[axis], pos[axis])
            indices = decoded.accessor(p['indices'])
            check(all(0 <= i[0] < count and int(i[0]) == i[0] for i in indices), label + ': triangle index out of range')
            check(p.get('mode', 4) == 4 and len(indices) % 3 == 0, label + ': expected triangles')
            row = {'mesh': mesh.get('name'), 'vertices': count, 'triangles': len(indices) // 3,
                   'uvSets': sorted(x for x in attrs if x.startswith('TEXCOORD_')),
                   'mixedWeightVertices': mixed_count, 'invalidJointVertices': invalid_joints,
                   'invalidWeightVertices': invalid_weights, 'unweightedVertices': unweighted,
                   'weightSumFailures': sum_failures}
            stats.append(row)
            for key in ['vertices', 'triangles', 'mixedWeightVertices', 'invalidJointVertices', 'invalidWeightVertices', 'unweightedVertices', 'weightSumFailures']:
                totals[key] += row[key]
            check(not any([invalid_joints, invalid_weights, unweighted, sum_failures]), label + ': invalid skin weights/joints')
            primitive_index += 1
    size = [b - a for a, b in zip(minimum, maximum)]
    check(all(math.isfinite(x) and x > .1 for x in size), 'Model lacks nonzero XYZ volume')
    check(any('tail' in k and 'flukes' in k for k in mixed), 'No mixed tail/fluke vertices')
    check(any('arm.' in k and 'forearm.' in k for k in mixed), 'No mixed arm/forearm vertices')

    animations = []
    final_actions = {a['name']: a for a in final.json.get('animations', [])}
    for animation in decoded.json.get('animations', []):
        name = animation['name']
        check(name in final_actions, 'Animation absent in final: ' + name)
        targets, changed = set(), 0
        duration = 0.0
        for ci, channel in enumerate(animation['channels']):
            sampler = animation['samplers'][channel['sampler']]
            times = decoded.accessor(sampler['input'])
            values = decoded.accessor(sampler['output'])
            check(all(math.isfinite(x[0]) for x in times), name + ': nonfinite key times')
            check(all(a[0] < b[0] for a, b in zip(times, times[1:])), name + ': nonincreasing key times')
            check(all(math.isfinite(v) for row in values for v in row), name + ': nonfinite animated value')
            check(len(times) == len(values), name + ': key/value count mismatch')
            duration = max(duration, times[-1][0])
            changed += int(any(row != values[0] for row in values[1:]))
            targets.add(decoded.json['nodes'][channel['target']['node']]['name'])
            # Animation arrays are uncompressed in the final GLB; compare directly.
            fc = final_actions[name]['channels'][ci]
            fs = final_actions[name]['samplers'][fc['sampler']]
            check(times == final.accessor(fs['input']) and values == final.accessor(fs['output']), name + ': decoded/final animation arrays differ')
            check(channel['target']['path'] == fc['target']['path'] and
                  decoded.json['nodes'][channel['target']['node']]['name'] == final.json['nodes'][fc['target']['node']]['name'], name + ': decoded/final target differs')
        check(changed > 0, name + ': no changing animation channels')
        animations.append({'name': name, 'durationSeconds': duration, 'channels': len(animation['channels']),
                           'changingChannels': changed, 'targetBones': sorted(targets)})
    durations = {a['name']: a['durationSeconds'] for a in animations}
    check(durations.get('Idle') == 4 and durations.get('React') == 2, 'Expected Idle=4s and React=2s')
    check(len(final_actions) == len(animations), 'Final/decoded animation counts differ')
    return {'passed': not errors, 'errors': errors,
            'method': 'Final compressed GLB metadata plus numeric arrays in supplied decoded companion. Python does not decode Draco. Companion provenance must be established by the external decoder invocation; matching descriptors alone do not prove provenance.',
            'final': final.identity(), 'decodedCompanion': decoded.identity(),
            'generatedAtUtc': datetime.now(timezone.utc).isoformat(),
            'skinCount': len(skins), 'jointNames': [decoded.joint_names(s) for s in skins],
            'weightTolerance': TOLERANCE, 'maximumWeightSumError': max_sum_error,
            'totals': dict(totals), 'mixedWeightGroups': dict(mixed),
            'meshLocalBounds': {'min': minimum, 'max': maximum, 'size': size},
            'animations': animations, 'primitives': stats}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('final_glb')
    p.add_argument('decoded_glb')
    p.add_argument('--output', default='output/model-review/validation.json')
    args = p.parse_args()
    try:
        report = validate(GLB(args.final_glb), GLB(args.decoded_glb))
    except (ValueError, KeyError, IndexError, OSError, struct.error) as exc:
        report = {'passed': False, 'errors': [str(exc)], 'method': 'Validation aborted; no numeric success claimed.'}
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['passed', 'errors', 'totals', 'maximumWeightSumError', 'mixedWeightGroups'] if k in report}, ensure_ascii=False, indent=2))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
