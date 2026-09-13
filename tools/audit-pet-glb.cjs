/* Validate embedded GLBs with Khronos Validator and decoded glTF-Transform arrays.
 * node tools/audit-pet-glb.cjs --deps <node_modules> [pet ids...]
 * Dependencies: gltf-validator, @gltf-transform/core, @gltf-transform/extensions,
 * draco3dgltf. The supplied dependency directory avoids changing app packages.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dependencyIndex = args.indexOf('--deps');
if (dependencyIndex >= 0 && !args[dependencyIndex + 1]) throw Error('Pass --deps <node_modules>');
const dependencyRoot = dependencyIndex >= 0 ? path.resolve(args.splice(dependencyIndex, 2)[1]) : null;
const dependency = name => require(dependencyRoot ? path.join(dependencyRoot, name) : name);
const validator = dependency('gltf-validator');
const { NodeIO } = dependency('@gltf-transform/core');
const { ALL_EXTENSIONS } = dependency('@gltf-transform/extensions');
const draco = dependency('draco3dgltf');
const project = path.resolve(__dirname, '..');
const output = path.join(project, 'output/all-pets-review');
const ids = args.length ? args : ['doubao', 'deepseek', 'workbuddy', 'codex', 'yuanbao'];
function transformPoint(p, m) {
  return [0, 1, 2].map(i => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i]);
}
function summarizeAnimation(animation) {
  let duration = 0, changedChannels = 0;
  const targetCounts = {};
  for (const channel of animation.listChannels()) {
    const sampler = channel.getSampler();
    const input = sampler.getInput().getArray();
    const output = sampler.getOutput();
    const values = output.getArray();
    const width = output.getElementSize();
    duration = Math.max(duration, ...input);
    targetCounts[channel.getTargetPath()] = (targetCounts[channel.getTargetPath()] || 0) + 1;
    let varies = false;
    for (let index = width; index < values.length; index++) {
      if (Math.abs(values[index] - values[index % width]) > 1e-6) { varies = true; break; }
    }
    if (varies) changedChannels++;
  }
  return { name: animation.getName(), durationSeconds: duration,
    channels: animation.listChannels().length, changedChannels, targetCounts };
}
async function audit(id, io) {
  const filename = path.join(project, 'pets', id + '.glb');
  const bytes = fs.readFileSync(filename);
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) {
    throw Error(id + ': invalid GLB header');
  }
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString('utf8'));
  const uris = [...(json.buffers || []), ...(json.images || [])].map(item => item.uri).filter(Boolean);
  const externalURIs = uris.filter(uri => !uri.startsWith('data:'));
  const standard = await validator.validateBytes(new Uint8Array(bytes), {
    uri: id + '.glb', maxIssues: 200,
    externalResourceFunction: uri => Promise.reject(Error('External resource forbidden: ' + uri))
  });
  const doc = await io.readBinary(new Uint8Array(bytes));
  const root = doc.getRoot();
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let triangles = 0, vertices = 0, primitives = 0, skinVertices = 0, mixedVertices = 0;
  let invalidWeights = 0, invalidJoints = 0, maxWeightSumError = 0, invalidNormals = 0, invalidUVs = 0;
  let primitivesWithUV = 0, primitivesWithSkin = 0, missingTextureUV = 0, activeJoints = new Set();
  const nodeBounds = [];
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const matrix = node.getWorldMatrix();
    const skin = node.getSkin();
    const jointCount = skin ? skin.listJoints().length : 0;
    const localBounds = { name: node.getName(), min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (const primitive of mesh.listPrimitives()) {
      primitives++;
      const positions = primitive.getAttribute('POSITION');
      const normals = primitive.getAttribute('NORMAL');
      const uvs = primitive.getAttribute('TEXCOORD_0');
      const weights = primitive.getAttribute('WEIGHTS_0');
      const joints = primitive.getAttribute('JOINTS_0');
      const material = primitive.getMaterial();
      const textured = material && (material.getBaseColorTexture() || material.getNormalTexture() ||
        material.getMetallicRoughnessTexture() || material.getOcclusionTexture() || material.getEmissiveTexture());
      vertices += positions.getCount();
      if (primitive.getMode() === 4) triangles += (primitive.getIndices()?.getCount() || positions.getCount()) / 3;
      if (uvs) primitivesWithUV++;
      if (textured && !uvs) missingTextureUV++;
      if (weights && joints && skin) primitivesWithSkin++;
      const position = [], normal = [], uv = [], weight = [], joint = [];
      for (let index = 0; index < positions.getCount(); index++) {
        const point = transformPoint(positions.getElement(index, position), matrix);
        for (let axis = 0; axis < 3; axis++) {
          bounds.min[axis] = Math.min(bounds.min[axis], point[axis]);
          bounds.max[axis] = Math.max(bounds.max[axis], point[axis]);
          localBounds.min[axis] = Math.min(localBounds.min[axis], point[axis]);
          localBounds.max[axis] = Math.max(localBounds.max[axis], point[axis]);
        }
        if (normals) {
          normals.getElement(index, normal);
          if (Math.abs(Math.hypot(...normal) - 1) > 0.02) invalidNormals++;
        }
        if (uvs && !uvs.getElement(index, uv).every(Number.isFinite)) invalidUVs++;
        if (weights && joints && skin) {
          skinVertices++;
          weights.getElement(index, weight);
          joints.getElement(index, joint);
          const error = Math.abs(weight.reduce((a, b) => a + b, 0) - 1);
          maxWeightSumError = Math.max(maxWeightSumError, error);
          if (error > 1e-4 || weight.some(value => !Number.isFinite(value) || value < 0)) invalidWeights++;
          if (weight.filter(value => value > 1e-4).length > 1) mixedVertices++;
          for (let slot = 0; slot < joint.length; slot++) {
            if (joint[slot] >= jointCount || joint[slot] < 0 || !Number.isInteger(joint[slot])) invalidJoints++;
            if (weight[slot] > 1e-4) activeJoints.add(skin.listJoints()[joint[slot]]?.getName());
          }
        }
      }
    }
    nodeBounds.push(localBounds);
  }
  bounds.size = bounds.max.map((value, i) => value - bounds.min[i]);
  const animations = root.listAnimations().map(summarizeAnimation);
  const requiredAnimations = ['Idle', 'React'].every(name => animations.some(a => a.name === name && a.durationSeconds > 0 && a.changedChannels > 0));
  // Rigid toys and robots can animate nodes without artificial skinning or UVs.
  // Existing skin data must still be valid; textured primitives require UVs.
  const validSkinData = invalidWeights === 0 && invalidJoints === 0;
  const passed = standard.issues.numErrors === 0 && externalURIs.length === 0 && bounds.size.every(value => value > 0.05) &&
    requiredAnimations && validSkinData && missingTextureUV === 0 && invalidUVs === 0 && invalidNormals === 0;
  return {
    id, file: 'pets/' + id + '.glb', bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'), headerValid: true, externalURIs,
    generator: json.asset?.generator, extensions: json.extensionsUsed || [],
    khronos: { version: validator.version(), ...standard.issues },
    geometry: { triangles, vertices, primitives, meshes: root.listMeshes().length, bounds, primitivesWithUV, missingTextureUV, invalidUVs, invalidNormals },
    skin: { skins: root.listSkins().length, joints: root.listSkins().map(s => s.listJoints().map(j => j.getName())),
      primitivesWithSkin, skinVertices, mixedVertices, invalidWeights, invalidJoints, maxWeightSumError, activeJoints: [...activeJoints] },
    materials: root.listMaterials().map(m => ({ name: m.getName(), alphaMode: m.getAlphaMode(), doubleSided: m.getDoubleSided(),
      baseColorTexture: m.getBaseColorTexture()?.getName() || null })),
    textures: root.listTextures().map(t => ({ name: t.getName(), mimeType: t.getMimeType(), bytes: t.getImage()?.length || 0, size: t.getSize() })),
    animations, requiredAnimations, nodeBounds, passed,
    performanceNotes: [
      ...(primitives > 100 ? ['More than 100 primitives; merge parts sharing material and skin before mobile optimization.'] : []),
      ...(triangles > 150000 ? ['More than 150k triangles; reduce hidden geometry or add a mobile LOD after visual review.'] : []),
      ...(bytes.length > 10000000 ? ['More than 10 MB; consider Draco and texture sizing before publication.'] : [])
    ]
  };
}
(async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco.createDecoderModule() });
  const report = { generatedAt: new Date().toISOString(), method: 'Khronos glTF Validator plus glTF-Transform decoded accessor audit',
    limitations: 'Technical asset checks do not certify visual likeness, seam quality or animation intersections.', models: [] };
  for (const id of ids) {
    const result = await audit(id, io);
    report.models.push(result);
    console.log(JSON.stringify({ id, passed: result.passed, bytes: result.bytes, triangles: result.geometry.triangles,
      primitives: result.geometry.primitives, animations: result.animations, errors: result.khronos.numErrors, warnings: result.khronos.numWarnings }));
  }
  report.passed = report.models.every(model => model.passed);
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'glb-audit.json'), JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
