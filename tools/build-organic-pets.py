"""Stylized solid-mesh reconstructions of the supplied doubao/yuanbao portraits.
Blender 4.5: blender --background --python tools/build-organic-pets.py
Preserves editable components; not a scan or exact likeness reconstruction.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'pets'; REVIEW=ROOT/'output'/'all-pets-review'; REVIEW.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene; scene.render.fps=30
assets=[]; current=[]; current_rig=None

def material(name,c,metal=0,rough=.48):
    m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    return m
skin=material('Warm porcelain skin',(1,.74,.46),0,.58)
facegold=material('Golden cream face',(1,.84,.53),0,.48)
cream=material('Ivory wool',(.93,.79,.55),0,.76)
red=material('Vermilion scarf',(.67,.035,.024),0,.62)
redlight=material('Scarlet trim',(.89,.095,.037),0,.57)
hair=material('Ink brown hair',(.025,.018,.016),0,.38)
hairlight=material('Hair soft edge',(.065,.043,.031),0,.44)
brown=material('Chocolate eyes',(.12,.035,.011),0,.25)
white=material('Eye glints',(1,.96,.8),0,.22)
blush=material('Peach cheeks',(1,.4,.19),0,.65)
gold=material('Warm polished gold',(1,.54,.055),.55,.3)
goldlight=material('Gold edge',(1,.77,.18),.48,.26)
golddark=material('Amber seams',(.55,.22,.015),.5,.38)

def rig(name,headz,armz):
    global current,current_rig
    current=[]
    bpy.ops.object.armature_add(enter_editmode=True);r=bpy.context.object;r.name=name+'_Rig'
    eb=r.data.edit_bones;eb.remove(eb[0])
    for n,h,t,p in [('root',(0,0,0),(0,0,.35),None),('body',(0,0,.5),(0,0,headz-.3),'root'),('head',(0,0,headz),(0,0,headz+.6),'body'),('arm.L',(-.49,0,armz),(-.8,0,armz-.5),'body'),('arm.R',(.49,0,armz),(.8,0,armz-.5),'body'),('scarf',(-.2,-.3,1.88),(-.9,-.3,1.75),'body'),('halo',(0,0,3.4),(0,0,3.65),'head')]:
        b=eb.new(n);b.head=h;b.tail=t
        if p:b.parent=eb[p]
    bpy.ops.object.mode_set(mode='OBJECT');current_rig=r;r.show_in_front=True
    return r

def finish(ob,name,ma,bone='body',smooth=True):
    ob.name=name;ob.data.materials.append(ma)
    if smooth:
        for p in ob.data.polygons:p.use_smooth=True
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    vg=ob.vertex_groups.new(name=bone);vg.add(list(range(len(ob.data.vertices))),1,'REPLACE')
    mod=ob.modifiers.new('Rigid weighted part','ARMATURE');mod.object=current_rig
    ob.parent=current_rig;current.append(ob);return ob

def ball(n,pos,size,ma,b='body',seg=24,rings=14,smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos);o=bpy.context.object;o.scale=size;return finish(o,n,ma,b,smooth)

def box(n,pos,size,ma,b='body',bevel=.06):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        m=o.modifiers.new('Soft toy edges','BEVEL');m.width=bevel;m.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
    return finish(o,n,ma,b)

def mesh(n,verts,faces,ma,b='body',smooth=True):
    me=bpy.data.meshes.new(n);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(n,me);scene.collection.objects.link(o)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    return finish(o,n,ma,b,smooth)

def shell(n,rings,ma,b='body',steps=40,pleat=0):
    verts=[]
    for z,rx,ry in rings:
        for i in range(steps):
            a=2*pi*i/steps;f=1+pleat*cos(10*a);verts.append((rx*cos(a)*f,ry*sin(a)*f,z))
    faces=[]
    for j in range(len(rings)-1):
        for i in range(steps):faces.append((j*steps+i,j*steps+(i+1)%steps,(j+1)*steps+(i+1)%steps,(j+1)*steps+i))
    faces.append(tuple(reversed(range(steps))));faces.append(tuple((len(rings)-1)*steps+i for i in range(steps)))
    return mesh(n,verts,faces,ma,b)

def line(n,pts,r,ma,b='body'):
    cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.resolution_u=8;cu.bevel_depth=r;cu.bevel_resolution=2
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
    for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    ob=bpy.data.objects.new(n,cu);scene.collection.objects.link(ob);bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,n,ma,b)

def plaque(n,polygon,y,depth,ma,b='head',bevel=.035):
    verts=[(x,y+d,z) for d in [-depth/2,depth/2] for x,z in polygon];k=len(polygon)
    faces=[tuple(reversed(range(k))),tuple(range(k,2*k))]+[(i,(i+1)%k,(i+1)%k+k,i+k) for i in range(k)]
    ob=mesh(n,verts,faces,ma,b,False)
    if bevel:
        bpy.context.view_layer.objects.active=ob;m=ob.modifiers.new('Rounded edges','BEVEL');m.width=bevel;m.segments=3;bpy.ops.object.modifier_apply(modifier=m.name)
        # Applied bevel adds vertices; extend the part's bone weights.
        ob.vertex_groups[b].add(list(range(len(ob.data.vertices))),1,'REPLACE')
    return ob

def facial(z,y,spacing=.23,size=.06):
    for s in [-1,1]:
        ball('Eye',(s*spacing,y,z), (size,.037,size*1.24),brown,'head',20,12)
        ball('Eye sparkle',(s*spacing-.014,y-.034,z+.025),(.018,.009,.023),white,'head',12,8)
        ball('Cheek',(s*(spacing+.13),y+.028,z-.15),(.074,.018,.036),blush,'head',16,10)
    line('Smile',[(-.075,y-.012,z-.17),(0,y-.027,z-.206),(.075,y-.012,z-.17)],.012,brown,'head')

def actions(r,name):
    for actionname,end in [('Idle',120),('React',60)]:
        r.animation_data_create();r.animation_data.action=None
        for frame in range(0,end+1,5):
            t=frame/end;w=sin(2*pi*t);p=sin(pi*t)**2
            for b in r.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
            if actionname=='Idle':
                r.pose.bones['body'].location.z=.018*w;r.pose.bones['head'].rotation_euler.y=.026*w
                r.pose.bones['scarf'].rotation_euler.x=.035*w;r.pose.bones['halo'].rotation_euler.y=.04*w
            else:
                r.pose.bones['root'].location.z=(.085 if name=='yuanbao' else .032)*p
                r.pose.bones['head'].rotation_euler.y=.11*w*p;r.pose.bones['head'].rotation_euler.x=.04*p
                r.pose.bones['arm.R'].rotation_euler.z=-.62*p;r.pose.bones['arm.R'].rotation_euler.x=.18*sin(6*pi*t)*p
                r.pose.bones['arm.L'].rotation_euler.z=.18*p;r.pose.bones['scarf'].rotation_euler.x=.12*w*p
                r.pose.bones['halo'].rotation_euler.z=.2*w*p
            for b in r.pose.bones:
                b.keyframe_insert(data_path='location',frame=frame);b.keyframe_insert(data_path='rotation_euler',frame=frame)
        a=r.animation_data.action;a.name=name+'_'+actionname
        track=r.animation_data.nla_tracks.new();track.name=actionname;track.strips.new(actionname,0,a);track.mute=True;r.animation_data.action=None
    for b in r.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
    scene.frame_set(0)

def export(name,r):
    # Combine components by material while retaining vertex groups, then reattach rig.
    groups={}
    for o in list(current):groups.setdefault(o.data.materials[0].name,[]).append(o)
    merged=[]
    for key,obs in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for ob in obs:ob.select_set(True)
        bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();merged.append(bpy.context.object)
    actions(r,name)
    bpy.ops.object.select_all(action='DESELECT');r.select_set(True)
    for ob in merged:ob.select_set(True)
    bpy.context.view_layer.objects.active=r
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_frame_range=False,export_yup=True,export_skins=True,export_anim_slide_to_zero=True,export_draco_mesh_compression_enable=False)
    # Normalize exported action names; exporter NLA mode uses track names.
    tris=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in merged)
    stats={'id':name,'triangles':tris,'vertices':sum(len(o.data.vertices) for o in merged),'meshes':len(merged),'bones':len(r.data.bones),'glbBytes':(OUT/(name+'.glb')).stat().st_size,'animations':{'Idle':4,'React':2},'method':'Stylized solid-mesh reconstruction from supplied front portrait; unseen sides inferred; simple rigid part weights; no texture projection'}
    assets.append((name,r,merged,stats));print('EXPORTED',json.dumps(stats),flush=True)
    for ob in [r]+merged:ob.hide_render=True

def doubao():
    r=rig('doubao',2.12,1.76)
    # Legs, thick boots and pleated skirt.
    for s in [-1,1]:
        ball('Leg',(s*.23,0,.47),(.15,.16,.35),skin)
        box('Wool sock',(s*.23,-.012,.24),(.29,.32,.28),cream,bevel=.035)
        box('Red boot',(s*.23,-.10,.095),(.35,.5,.19),red,bevel=.055)
    shell('Pleated red skirt',[(.54,.58,.38),(.6,.59,.39),(.9,.47,.32),(1.03,.40,.29)],redlight,pleat=.035)
    shell('Cream coat',[(.89,.57,.36),(.98,.57,.37),(1.45,.47,.31),(1.79,.33,.25)],cream)
    line('Coat front piping',[(0,-.382,.92),(0,-.348,1.23),(0,-.277,1.65)],.017,red)
    for z,y in [(1.40,-.331),(1.19,-.365)]:ball('Red button',(.11,y-.015,z),(.032,.02,.032),red)
    for s in [-1,1]:
        line('Pocket piping',[(s*.29,-.335,1.14),(s*.43,-.28,1.05)],.025,red)
        ob=ball('Coat sleeve',(s*.55,0,1.36),(.20,.23,.48),cream,'arm.L' if s<0 else 'arm.R');ob.rotation_euler.y=-s*.31
        ob=box('Scarlet cuff',(s*.68,-.004,1.0),(.36,.37,.14),redlight,'arm.L' if s<0 else 'arm.R',.035);ob.rotation_euler.y=-s*.22
        ball('Mitten',(s*.7,-.008,.86),(.13,.14,.19),skin,'arm.L' if s<0 else 'arm.R')
    ball('Neck',(0,0,1.95),(.20,.18,.23),skin,'head')
    ball('Round face',(0,-.065,2.6),(.64,.49,.64),skin,'head',32,20)
    for s in [-1,1]:ball('Ear',(s*.625,-.004,2.5),(.12,.105,.16),skin,'head')
    # Closed black bob forms a full back of head, with layered bangs at the front.
    ball('Bob back',(0,.22,2.6),(.72,.48,.76),hair,'head',32,20)
    ball('Hair crown',(0,.015,3.02),(.67,.47,.37),hair,'head',28,14)
    for s in [-1,1]:
        ball('Bob side',(s*.59,.02,2.60),(.19,.43,.65),hair,'head',20,14)
        line('Bob edge',[(s*.63,-.21,3.04),(s*.7,-.18,2.66),(s*.63,-.05,2.04)],.048,hairlight,'head')
    for idx,poly in enumerate([
        [(-.57,3.16),(-.12,3.29),(-.28,2.91),(-.54,2.76)],
        [(-.17,3.29),(.16,3.27),(.19,2.89),(-.14,2.89)],
        [(.12,3.27),(.52,3.12),(.60,2.79),(.33,2.86)]]):
        plaque('Layered bang '+str(idx),poly,-.425,.18,hair,'head',.035)
    facial(2.58,-.553,.22,.045)
    # Scarf ring with thick fabric, hanging and wind-swept tails.
    shell('Red scarf collar',[(1.77,.43,.34),(1.82,.48,.37),(2.03,.47,.36),(2.08,.38,.29)],red)
    plaque('Scarf fold',[(-.40,2.04),(.13,2.03),(.31,1.85),(-.27,1.80)],-.369,.075,redlight,'body',.025)
    plaque('Scarf hanging',[(-.29,1.85),(-.02,1.84),(-.11,1.17),(-.40,1.21)],-.40,.075,redlight,'body',.025)
    for i in range(5):line('Scarf fringe',[(-.36+i*.053,-.434,1.23),(-.385+i*.053,-.435,1.13)],.014,red,'body')
    plaque('Flowing scarf',[(-.34,1.98),(-.60,1.82),(-1.14,1.88),(-1.18,1.64),(-.69,1.57),(-.33,1.77)],.075,.075,red,'scarf',.04)
    for i in range(4):line('Wind fringe',[(-1.12,.045,1.67+i*.057),(-1.27,.045,1.67+i*.057)],.018,redlight,'scarf')
    export('doubao',r)

def yuanbao():
    r=rig('yuanbao',1.91,1.57)
    for s in [-1,1]:
        ball('Gold leg',(s*.34,0,.37),(.27,.32,.34),gold)
        box('Gold foot',(s*.34,-.10,.115),(.51,.59,.23),goldlight,bevel=.075)
    ball('Round gold body',(0,0,1.03),(.73,.51,.82),gold,'body',28,18)
    ball('Belly highlight',(0,-.31,1.14),(.58,.24,.57),goldlight,'body',24,16)
    for s in [-1,1]:
        b='arm.L' if s<0 else 'arm.R'
        ob=ball('Gold arm',(s*.73,.02,1.20),(.24,.27,.5),gold,b);ob.rotation_euler.y=-s*.28
        ball('Gold mitten',(s*.84,-.045,.85),(.21,.23,.25),goldlight,b)
    # Three-dimensional ingot helmet: raised left/right horns and full rear bowl.
    box('Ingot helmet core',(0,0,2.35),(1.88,1.18,1.18),gold,'head',.25)
    ball('Ingot top dome',(0,.025,2.91),(.66,.49,.36),goldlight,'head',16,10,False)
    for s in [-1,1]:
        poly=[(s*.56,2.90),(s*1.16,3.13),(s*1.37,2.9),(s*1.08,2.09),(s*.68,1.94)]
        if s<0:poly.reverse()
        plaque('Ingot horn',poly,0,1.05,gold,'head',.075)
        line('Ingot upper rolled lip',[(s*.45,-.50,2.86),(s*.88,-.5,2.97),(s*1.20,-.40,3.07)],.055,goldlight,'head')
    # The face is a convex cream insert set into a raised gold rim.
    ball('Face gold rim',(0,-.567,2.36),(.75,.12,.49),golddark,'head',28,18)
    ball('Cream round face',(0,-.641,2.36),(.702,.13,.447),facegold,'head',32,20)
    facial(2.44,-.77,.285,.083)
    # Full torus halo floats above the crown.
    bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=10,location=(0,0,3.47),major_radius=.39,minor_radius=.024)
    finish(bpy.context.object,'Gold halo',goldlight,'halo')
    # Small solid five-point stars beside the halo are part of the character silhouette.
    for s in [-1,1]:
        poly=[]
        for i in range(10):
            a=pi/2+i*pi/5;ra=.105 if i%2==0 else .047;poly.append((s*.70+ra*cos(a),3.37+ra*sin(a)))
        plaque('Lucky star',poly,0,.06,goldlight,'halo',.005)
    export('yuanbao',r)

doubao();yuanbao()
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=600;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.11,.14,.19,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for n,pos,power in [('Key',(-4,-5,6),500),('Fill',(4,-3,3),320),('Rim',(2,4,5),600)]:
    d=bpy.data.lights.new(n,'AREA');d.energy=power;d.shape='DISK';d.size=4;o=bpy.data.objects.new(n,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1.7))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Organic pets review camera';cam.data.type='ORTHO';cam.data.ortho_scale=4.05;scene.camera=cam
for name,r,obs,stats in assets:
    for ob in [r]+obs:ob.hide_render=False
    for view,pos in [('front',(0,-9,1.75)),('side',(9,0,1.75)),('back',(0,9,1.75)),('quarter',(6,-9,3.4))]:
        cam.location=pos;cam.rotation_euler=(Vector((0,0,1.75))-cam.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(REVIEW/(name+'-'+view+'.png'));bpy.ops.render.render(write_still=True)
    r.animation_data.action=bpy.data.actions[name+'_React'];scene.frame_set(25)
    cam.location=(0,-9,1.75);cam.rotation_euler=(Vector((0,0,1.75))-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(REVIEW/(name+'-react.png'));bpy.ops.render.render(write_still=True)
    r.animation_data.action=None
    for bone in r.pose.bones:bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
    scene.frame_set(0)
    for ob in [r]+obs:ob.hide_render=True
    (REVIEW/(name+'-stats.json')).write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf8')
# Both editable characters in one source file, separated for convenient inspection.
for i,(name,r,obs,stats) in enumerate(assets):
    for ob in [r]+obs:ob.hide_render=False
    r.location.x=(i-.5)*3.4
scene['source']='User supplied pets/doubao.png and pets/yuanbao.png; stylized solid-mesh reconstruction; rear surfaces inferred from front reference.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'organic-pets.blend'),compress=True)
print('ORGANIC_PETS_COMPLETE',flush=True)
