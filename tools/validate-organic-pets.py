"""Validate the uncompressed, rigid-part organic pet GLBs without whale-specific rules."""
from pathlib import Path
import importlib.util, json, math

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('glb_reader',Path(__file__).with_name('validate-deepseek.py'))
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)

def validate(name):
    g=reader.GLB(ROOT/'pets'/(name+'.glb'));j=g.json;errors=[]
    vertices=triangles=unweighted=invalid=0
    for mesh_name,p in g.primitives():
        a=p['attributes'];pos=g.accessor(a['POSITION']);js=g.accessor(a['JOINTS_0']);ws=g.accessor(a['WEIGHTS_0']);vertices+=len(pos)
        ind=g.accessor(p['indices']);triangles+=len(ind)//3
        if any(i[0]>=len(pos) for i in ind):errors.append('invalid indices')
        for co,joint,weight in zip(pos,js,ws):
            if not all(math.isfinite(v) for v in co):errors.append('non-finite position')
            if sum(weight)<1e-8:unweighted+=1
            if abs(sum(weight)-1)>1e-4 or any(w<0 for w in weight) or any(v<0 or v>=len(j['skins'][0]['joints']) for v in joint):invalid+=1
    animations=[]
    for a in j.get('animations',[]):
        duration=max(max(t[0] for t in g.accessor(s['input'])) for s in a['samplers'])
        changing=sum(len(set(g.accessor(s['output'])))>1 for s in a['samplers'])
        animations.append({'name':a['name'],'durationSeconds':duration,'changingChannels':changing})
        if not changing:errors.append('static animation '+a['name'])
    if {a['name']:a['durationSeconds'] for a in animations}!={'Idle':4.,'React':2.}:errors.append('animation contract')
    if unweighted or invalid:errors.append('invalid weights')
    if triangles>=50000:errors.append('triangle budget')
    if g.size>=2000000:errors.append('file budget')
    report={'passed':not errors,'errors':errors,'asset':g.identity(),'triangles':triangles,'vertices':vertices,'unweightedVertices':unweighted,'invalidWeightsOrJoints':invalid,'bones':len(j['skins'][0]['joints']),'animations':animations,'binding':'Rigid toy parts intentionally use single-bone weights; no tail/forearm blend requirement.'}
    (ROOT/'output'/'all-pets-review'/(name+'-validation.json')).write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
    return not errors

if __name__=='__main__':
    passed=[validate(n) for n in ['doubao','yuanbao']]
    raise SystemExit(0 if all(passed) else 1)
