"""Build volumetric robot pets from the supplied PNG design references.

Run: blender --background --python tools/build-robot-pets.py [-- --no-render]
Blender coordinates Z up / front -Y; exported glTF Y up / front +Z.
Every visible part is mesh geometry. Rigid mechanical pieces carry bone weights.
"""
import bpy, bmesh, math, json, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'pets'
REVIEW = ROOT / 'output' / 'all-pets-review'
REVIEW.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene; scene.render.fps=30; scene.frame_start=0; scene.frame_end=120
M={}; parts=[]; current=None

def material(name,color,metal=0.0,rough=.36,emission=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal; bs.inputs['Roughness'].default_value=rough
    if emission:
        bs.inputs['Emission Color'].default_value=(*color,1); bs.inputs['Emission Strength'].default_value=emission
    M[name]=m; return m

material('mint enamel',(.075,.64,.59),.24)
material('mint highlights',(.18,.83,.73),.12)
material('petrol recess',(.018,.12,.14),.32)
material('warm ivory',(.89,.86,.67),.02,.48)
material('eye slate',(.07,.19,.22),.08)
material('eye shine',(.78,.96,.95),.05,.28)
material('amber warning',(.98,.43,.055),.18)
material('violet enamel',(.33,.04,.7),.38)
material('orchid trim',(.65,.13,.87),.27)
material('indigo casing',(.07,.045,.39),.4)
material('cobalt trim',(.10,.19,.8),.38)
material('screen glass',(.055,.008,.17),.3,.22)
material('screen violet',(.30,.014,.59),.13,.29,.7)
material('pixel glow',(.83,.40,1),.0,.25,2.4)
material('cyan diode',(.08,.81,1),.1,.24,1.8)
material('vent graphite',(.025,.035,.075),.5)
material('screw chrome',(.43,.55,.65),.72,.26)

def finish(ob,name,mat,bone):
    ob.name=name; ob.data.materials.append(M[mat]); parts.append((ob,bone))
    for c in list(ob.users_collection): c.objects.unlink(ob)
    current.objects.link(ob)
    return ob

def box(name,loc,size,mat,bone,bevel=.07):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); ob=bpy.context.object
    ob.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=ob.modifiers.new('Machined rounded edge','BEVEL'); mod.width=bevel; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=ob.modifiers.new('Weighted hard surface normals','WEIGHTED_NORMAL'); mod.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in ob.data.polygons:p.use_smooth=True
    return finish(ob,name,mat,bone)

def sphere(name,loc,size,mat,bone):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc)
    ob=bpy.context.object; ob.scale=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in ob.data.polygons:p.use_smooth=True
    return finish(ob,name,mat,bone)

def cylinder(name,loc,radius,depth,mat,bone,axis='Z',vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    ob=bpy.context.object
    if axis=='X':ob.rotation_euler[1]=pi/2
    if axis=='Y':ob.rotation_euler[0]=pi/2
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    mod=ob.modifiers.new('Rim bevel','BEVEL');mod.width=min(.025,depth/5);mod.segments=2
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in ob.data.polygons:p.use_smooth=True
    return finish(ob,name,mat,bone)

def tube(name,points,radius,mat,bone):
    cv=bpy.data.curves.new(name,'CURVE');cv.dimensions='3D';cv.resolution_u=2
    cv.bevel_depth=radius;cv.bevel_resolution=2;cv.use_fill_caps=True
    sp=cv.splines.new('POLY');sp.points.add(len(points)-1)
    for p,xyz in zip(sp.points,points):p.co=(*xyz,1)
    ob=bpy.data.objects.new(name,cv);current.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,name,mat,bone)

def plate(name,xz,y,thick,mat,bone):
    # A closed extruded polygon in the face plane; visible thickness at all angles.
    n=len(xz);verts=[(x,y+d,z) for d in [-thick/2,thick/2] for x,z in xz]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
    ob=bpy.data.objects.new(name,me);current.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    b=ob.modifiers.new('Soft polygon perimeter','BEVEL');b.width=.016;b.segments=2
    bpy.ops.object.modifier_apply(modifier=b.name)
    return finish(ob,name,mat,bone)

def screw(name,loc,bone,axis='Y'):
    cylinder(name,loc,.043,.022,'screw chrome',bone,axis,16)

def make_workbuddy():
    box('Battery torso',(0,0,1.44),(1.22,.80,1.04),'mint enamel','body',.07)
    box('Top shoulder deck',(0,0,1.98),(1.15,.77,.08),'mint highlights','body',.025)
    cylinder('Telescopic neck',(0,0,2.065),.22,.17,'petrol recess','body')
    box('Rounded CRT housing',(0,.025,2.77),(1.68,1.11,1.43),'mint enamel','head',.22)
    box('Front seafoam bezel',(0,-.535,2.77),(1.58,.16,1.34),'mint highlights','head',.21)
    box('Inset dark screen gasket',(0,-.635,2.77),(1.30,.085,1.09),'petrol recess','head',.18)
    box('Warm matte face',(0,-.686,2.77),(1.24,.06,1.02),'warm ivory','head',.17)
    for s in [-1,1]:
        x=.34*s
        # Each tired eye has its own drooping lid and lighter lower segment.
        box('Drooping eye '+str(s),(x,-.73,2.78),(.31,.06,.34),'eye slate','head',.07)
        box('Heavy lower iris '+str(s),(x,-.766,2.704),(.27,.025,.135),'petrol recess','head',.048)
        lid=box('Tired angled eyelid '+str(s),(x,-.777,2.922),(.34,.025,.055),'warm ivory','head',.02)
        lid.rotation_euler[1]=s*.20
        glint=box('Eye square glint '+str(s),(x-s*.022,-.79,2.816),(.067,.018,.042),'eye shine','head',.01)
        glint.rotation_euler[1]=s*.2
        box('Amber cheek '+str(s),(s*.46,-.733,2.52),(.16,.029,.10),'amber warning','head',.028)
        tube('Worried brow '+str(s),[(x-s*.145,-.739,3.028),(x,-.749,3.015),(x+s*.075,-.735,3.082)],.015,'mint enamel','head')
        cylinder('Ear socket '+str(s),(s*.89,.04,2.75),.31,.21,'petrol recess','head','X')
        cylinder('Ivory ear ring '+str(s),(s*1.01,.04,2.75),.285,.17,'warm ivory','head','X')
        cylinder('Mint ear cap '+str(s),(s*1.105,.04,2.75),.225,.052,'mint enamel','head','X')
        for z in [2.45,2.57,2.69]:box('Rear speaker slot',(s*.5,.597,z),(.23,.021,.038),'petrol recess','head',.012)
    tube('Downturned small mouth',[(.105*sin(t),-.741,2.411+.052*cos(t)) for t in [(-pi/2+i*pi/16) for i in range(17)]],.017,'eye slate','head')
    tube('Ivory headphone bridge',[(.89*cos(t),.16,2.91+.70*sin(t)) for t in [i*pi/24 for i in range(25)]],.065,'warm ivory','head')
    cylinder('Top beacon base',(-.08,-.015,3.50),.118,.10,'petrol recess','head')
    sphere('Ivory standby beacon',(-.08,-.015,3.595),(.082,.082,.095),'warm ivory','head')
    tube('Antenna stalk',[(.54,.22,3.42),(.61,.22,3.87)],.032,'petrol recess','head')
    sphere('Mint antenna sphere',(.61,.22,3.895),(.074,.074,.09),'mint highlights','head')
    box('Battery ivory badge',(0,-.444,1.49),(.76,.16,.65),'warm ivory','body',.105)
    box('Battery dark recess',(0,-.536,1.52),(.53,.035,.205),'petrol recess','body',.036)
    for x,mat in [(-.15,'mint highlights'),(0,'eye shine'),(.15,'amber warning')]:
        box('Battery segment '+mat,(x,-.565,1.52),(.142,.025,.106),mat,'body',.009)
    box('Rear maintenance cover',(0,.421,1.48),(.86,.055,.70),'mint highlights','body',.06)
    for i in range(5):box('Back cooling vent',(0,.457,1.36+i*.073),(.51,.027,.023),'petrol recess','body',.009)
    for x in [-.33,.33]:
        for z in [1.24,1.73]:screw('Torso access screw',(x,.467,z),'body')
    for s in [-1,1]:
        tag='L' if s<0 else 'R'; arm='arm.'+tag; fore='forearm.'+tag
        cylinder('Shoulder drive '+tag,(s*.66,0,1.75),.18,.18,'petrol recess',arm,'X')
        up=box('Angled upper arm '+tag,(s*.77,-.005,1.62),(.31,.43,.37),'mint enamel',arm,.04);up.rotation_euler[1]=-s*.19
        box('Shoulder warning panel '+tag,(s*.78,-.245,1.68),(.16,.035,.18),'amber warning',arm,.016)
        cylinder('Elbow axle '+tag,(s*.81,0,1.35),.115,.32,'petrol recess',fore,'X')
        low=box('Tapered forearm '+tag,(s*.845,-.005,1.16),(.31,.38,.42),'mint highlights',fore,.025);low.rotation_euler[1]=-s*.1
        cylinder('Wrist swivel '+tag,(s*.865,-.006,.905),.105,.13,'petrol recess',fore)
        box('Pincer palm '+tag,(s*.86,-.012,.81),(.29,.29,.18),'mint enamel',fore,.025)
        for d in [-1,1]:
            claw=box('Amber finger '+tag+str(d),(s*.86+d*.105,-.03,.70),(.095,.27,.19),'amber warning',fore,.032);claw.rotation_euler[1]=d*.22
        box('Hip socket '+tag,(s*.33,.025,.879),(.38,.39,.20),'petrol recess','leg.'+tag,.025)
        box('Mint shin '+tag,(s*.33,.015,.585),(.36,.39,.48),'mint enamel','leg.'+tag,.036)
        box('Shoe sole '+tag,(s*.33,-.095,.055),(.48,.65,.11),'petrol recess','leg.'+tag,.035)
        box('Block boot '+tag,(s*.33,-.105,.22),(.49,.66,.28),'mint highlights','leg.'+tag,.045)

def make_codex():
    box('Angular torso',(0,0,1.56),(1.28,.86,1.05),'violet enamel','body',.035)
    box('Cobalt torso back',(0,.39,1.56),(1.19,.19,1.00),'indigo casing','body',.025)
    box('Waist swivel',(0,0,.999),(.62,.51,.19),'indigo casing','body',.018)
    box('Violet belt',(0,0,.88),(1.25,.78,.22),'orchid trim','body',.025)
    box('Square neck',(0,0,2.15),(.59,.48,.19),'indigo casing','body',.028)
    box('Boxy terminal head',(0,.04,2.82),(1.55,1.04,1.22),'violet enamel','head',.045)
    box('Cobalt side casing',(0,.29,2.82),(1.51,.59,1.17),'cobalt trim','head',.035)
    box('Orchid front rim',(0,-.517,2.82),(1.58,.135,1.23),'orchid trim','head',.035)
    corner=[(-.57,2.33),(.57,2.33),(.65,2.43),(.65,3.21),(.54,3.31),(-.54,3.31),(-.65,3.21),(-.65,2.43)]
    plate('Octagonal display inset',corner,-.612,.06,'indigo casing','head')
    corner=[(x*.91,2.82+(z-2.82)*.9) for x,z in corner]
    plate('Emissive terminal screen',corner,-.653,.029,'screen violet','head')
    for i in range(24):box('CRT scanline %02d'%i,(0,-.674,2.405+i*.035),(.97,.008,.006),'violet enamel','head',.001)
    for s in [-1,1]:
        sphere('Pixel eye '+str(s),(s*.25,-.701,2.93),(.062,.028,.094),'pixel glow','head')
        cylinder('Ear swivel '+str(s),(s*.84,.03,2.82),.30,.16,'indigo casing','head','X')
        cylinder('Cobalt headset cup '+str(s),(s*.947,.03,2.82),.282,.17,'cobalt trim','head','X')
        cylinder('Violet cup inset '+str(s),(s*1.043,.03,2.82),.218,.04,'indigo casing','head','X')
        cylinder('Outer driver '+str(s),(s*1.07,.03,2.82),.169,.022,'violet enamel','head','X')
        for z in [2.47,2.57,2.67]:box('Head side vent',(s*.775,.22,z),(.016,.26,.033),'vent graphite','head',.008)
    tube('Smile pixels',[(.17*cos(t),-.709,2.765+.075*sin(t)) for t in [pi+i*pi/16 for i in range(17)]],.026,'pixel glow','head')
    # Broad faceted headphone arch with two offset rails and solid bridge plates.
    tube('Headband cobalt rail',[(.88*cos(t),.13,2.99+.82*sin(t)) for t in [i*pi/28 for i in range(29)]],.075,'cobalt trim','head')
    tube('Headband violet rail',[(.82*cos(t),-.03,3.0+.77*sin(t)) for t in [i*pi/28 for i in range(29)]],.062,'orchid trim','head')
    for a in [.52,.83,1.15,1.48,1.8,2.12,2.45,2.7]:
        tube('Headband bridge',[(.86*cos(a),-.02,3.0+.79*sin(a)),(.86*cos(a),.14,3.0+.79*sin(a))],.054,'cobalt trim','head')
    box('Code panel bezel',(0,-.469,1.61),(.99,.10,.74),'orchid trim','body',.06)
    box('Dark code monitor',(0,-.532,1.61),(.88,.035,.635),'screen glass','body',.045)
    # Abstract readable code marks, built as tiny emissive bars instead of a texture plane.
    for row,(width,offset) in enumerate([(.34,-.18),(.57,-.06),(.47,-.11),(.27,-.22)]):
        z=1.78-row*.09
        box('Code row %02d'%row,(offset,-.559,z),(width,.012,.018),'pixel glow' if row%2==0 else 'cyan diode','body',.003)
        box('Code indentation',( -.34,-.559,z),(.03,.014,.027),'orchid trim','body',.003)
    tube('Code bracket left',[(-.24,-.569,1.385),(-.27,-.569,1.415),(-.24,-.569,1.445)],.008,'pixel glow','body')
    tube('Code bracket right',[(.02,-.569,1.385),(.05,-.569,1.415),(.02,-.569,1.445)],.008,'pixel glow','body')
    tube('Code slash',[(-.13,-.569,1.378),(-.10,-.569,1.449)],.009,'cyan diode','body')
    sphere('Monitor status LED',(.32,-.565,1.365),(.018,.011,.018),'pixel glow','body')
    box('Rear heatsink bed',(0,.525,1.58),(.88,.12,.78),'vent graphite','body',.025)
    for i in range(8):box('Rear cooling fin %02d'%i,(0,.625,1.255+i*.087),(.96,.17,.029),'cobalt trim','body',.006)
    for x in [-.37,.37]:
        for z in [1.19,1.99]:screw('Rear service screw',(x,.529,z),'body')
    for s in [-1,1]:
        tag='L' if s<0 else 'R';arm='arm.'+tag;fore='forearm.'+tag
        cylinder('Purple shoulder bearing '+tag,(s*.66,0,1.92),.17,.20,'indigo casing',arm,'X')
        armor=box('Angular shoulder armor '+tag,(s*.82,-.02,1.90),(.40,.49,.28),'cobalt trim' if s>0 else 'orchid trim',arm,.018);armor.rotation_euler[1]=-s*.16
        box('Upper servo link '+tag,(s*.80,0,1.63),(.24,.30,.30),'indigo casing',arm,.012)
        cylinder('Elbow pin '+tag,(s*.84,0,1.44),.095,.34,'cobalt trim',fore,'X')
        armor=box('Square gauntlet '+tag,(s*.866,-.014,1.29),(.38,.47,.39),'violet enamel',fore,.018);armor.rotation_euler[1]=-s*.10
        box('Dark wrist '+tag,(s*.88,0,1.025),(.19,.25,.13),'indigo casing',fore,.015)
        # Open angular grasping claw, with a real central recess through the fingers.
        x=s*.89
        pts=[(x-.21,.97),(x+.18,.97),(x+.23,.72),(x+.08,.57),(x-.03,.65),(x+.08,.77),(x+.035,.84),(x-.09,.83),(x-.13,.69),(x-.24,.73)]
        plate('Hexagonal claw '+tag,pts,-.005,.35,'orchid trim' if s<0 else 'cobalt trim',fore)
        box('Thigh block '+tag,(s*.33,0,.66),(.34,.35,.28),'violet enamel','leg.'+tag,.015)
        box('Knee cuff '+tag,(s*.33,-.006,.477),(.45,.43,.18),'orchid trim','leg.'+tag,.014)
        box('Lower leg piston '+tag,(s*.33,0,.285),(.31,.34,.24),'indigo casing','leg.'+tag,.012)
        box('Flat boot sole '+tag,(s*.33,-.12,.038),(.54,.70,.076),'indigo casing','leg.'+tag,.012)
        box('Square mechanical boot '+tag,(s*.33,-.12,.15),(.54,.70,.23),'violet enamel','leg.'+tag,.018)
        box('Boot toe cap '+tag,(s*.33,-.41,.16),(.53,.15,.23),'orchid trim','leg.'+tag,.012)

def bind_and_animate(asset):
    # A rigid skin is appropriate for manufactured pieces: every mesh vertex has weight 1.
    bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name=asset+'_Rig'
    for c in list(rig.users_collection):c.objects.unlink(rig)
    current.objects.link(rig);eb=rig.data.edit_bones;eb.remove(eb[0])
    locations={'root':((0,0,0),(0,0,.3),None),'body':((0,0,.90),(0,0,2.05),'root'),
        'head':((0,0,2.08),(0,0,2.88),'body')}
    for s,side in [(-1,'L'),(1,'R')]:
        locations['arm.'+side]=((s*.65,0,1.85),(s*.82,0,1.40),'body')
        locations['forearm.'+side]=((s*.82,0,1.40),(s*.88,0,.82),'arm.'+side)
        locations['leg.'+side]=((s*.33,0,.89),(s*.33,0,.16),'root')
    for name,(h,t,parent) in locations.items():
        b=eb.new(name);b.head=h;b.tail=t
        if parent:b.parent=eb[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    for ob,bone in parts:
        group=ob.vertex_groups.new(name=bone);group.add(list(range(len(ob.data.vertices))),1,'REPLACE')
    bpy.ops.object.select_all(action='DESELECT')
    for ob,bone in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0][0];bpy.ops.object.join();mesh=bpy.context.object;mesh.name=asset+'_MechanicalMesh'
    mesh.parent=rig;mod=mesh.modifiers.new('Rigid mechanical articulation','ARMATURE');mod.object=rig
    rig.show_in_front=True;acts={}
    for name,end in [('Idle',120),('React',60)]:
        rig.animation_data_create();rig.animation_data.action=None
        for frame in range(0,end+1,5):
            t=frame/end;wave=sin(2*pi*t);pulse=sin(pi*t)**2
            for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
            if name=='Idle':
                rig.pose.bones['body'].rotation_euler[1]=.015*wave
                rig.pose.bones['head'].rotation_euler[2]=(.055 if asset=='workbuddy' else .035)*wave
                rig.pose.bones['head'].rotation_euler[0]=.022*sin(2*pi*t)
                rig.pose.bones['forearm.R'].rotation_euler[1]=.035*wave
            else:
                # Bone-local Y follows the neck's vertical axis: use it for an actual head turn.
                rig.pose.bones['head'].rotation_euler[1]=(.17 if asset=='workbuddy' else .22)*sin(4*pi*t)*pulse
                rig.pose.bones['head'].rotation_euler[2]=.045*pulse
                rig.pose.bones['head'].rotation_euler[0]=(.09 if asset=='workbuddy' else -.045)*pulse
                rig.pose.bones['arm.R'].rotation_euler[2]=-.52*pulse
                rig.pose.bones['arm.R'].rotation_euler[0]=-.16*pulse
                rig.pose.bones['forearm.R'].rotation_euler[0]=-.78*pulse
                rig.pose.bones['forearm.R'].rotation_euler[1]=.19*sin(6*pi*t)*pulse
                rig.pose.bones['body'].rotation_euler[1]=-.025*pulse
            for b in rig.pose.bones:
                b.keyframe_insert('rotation_euler',frame=frame,group=b.name);b.keyframe_insert('location',frame=frame,group=b.name)
        a=rig.animation_data.action;a.name=name
        track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,a);track.mute=True
        rig.animation_data.action=None;acts[name]=a
    for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
    scene.frame_set(0);bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
    bpy.ops.export_scene.gltf(filepath=str(OUT/(asset+'.glb')),export_format='GLB',use_selection=True,
        export_animations=True,export_animation_mode='ACTIONS',export_anim_single_armature=False,export_frame_range=False,export_skins=True,
        export_yup=True,export_normals=True,export_materials='EXPORT',export_anim_slide_to_zero=True,
        export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
    mesh.data.calc_loop_triangles()
    stats={'triangles':len(mesh.data.loop_triangles),'vertices':len(mesh.data.vertices),'bones':len(rig.data.bones),
        'glbBytes':(OUT/(asset+'.glb')).stat().st_size,'animations':{'Idle':4,'React':2},
        'source':'Procedural solid geometry guided by supplied '+asset+'.png',
        'materials':len(mesh.data.materials),'orientation':'glTF +Z front, Y up, sole at y=0',
        'limitations':'Stylized design reconstruction, not an exact image-to-mesh reconstruction; rigid mechanical joints, no facial blendshapes.'}
    print('ROBOT_EXPORTED',asset,json.dumps(stats),flush=True)
    for name,a in acts.items():a.name=asset+'_'+name
    return rig,mesh,acts,stats

all_models={}
for asset,builder in [('workbuddy',make_workbuddy),('codex',make_codex)]:
    current=bpy.data.collections.new(asset);scene.collection.children.link(current);parts=[]
    builder();rig,mesh,acts,stats=bind_and_animate(asset);all_models[asset]=(current,rig,mesh,acts,stats)
    current.hide_render=True

scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=640;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX';scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.17,.19,.25,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.55
review_collection=bpy.data.collections.new('Review lights and camera');scene.collection.children.link(review_collection)
for name,pos,energy in [('Key',(-4,-5,7),650),('Fill',(4,-3,4),400),('Rim',(3,4,6),750)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=4
    ob=bpy.data.objects.new(name,d);review_collection.objects.link(ob);ob.location=pos
    ob.rotation_euler=(Vector((0,0,2))-ob.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Robot review camera');cam=bpy.data.objects.new('Robot review camera',d);review_collection.objects.link(cam)
scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=4.65
def camera(pos):cam.location=pos;cam.rotation_euler=(Vector((0,0,1.95))-cam.location).to_track_quat('-Z','Y').to_euler()
camera((6,-10,4.4))
scene['asset_notes']='Independent editable solid robot reconstructions from workbuddy.png and codex.png. Select one collection; muted NLA tracks hold Idle and React actions.'
all_models['workbuddy'][0].hide_render=False
# Store both at a shared canonical origin; independent collections provide clean exports.
all_models['codex'][0].hide_viewport=True
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'robot-pets.blend'),compress=True)
all_models['codex'][0].hide_viewport=False
(REVIEW/'robot-build-stats.json').write_text(json.dumps({a:r[4] for a,r in all_models.items()},indent=2),encoding='utf-8')
if '--no-render' not in sys.argv:
    for asset,(collection,rig,mesh,acts,stats) in all_models.items():
        for c,*_ in all_models.values():c.hide_render=True
        collection.hide_render=False
        for name,pos in [('front',(0,-10,1.95)),('side',(10,0,1.95)),('back',(0,10,1.95)),('quarter',(6,-10,4.4))]:
            camera(pos);scene.frame_set(0);scene.render.filepath=str(REVIEW/(asset+'-'+name+'.png'));bpy.ops.render.render(write_still=True)
        rig.animation_data.action=acts['React'];scene.frame_set(25);camera((4,-10,3.4))
        scene.render.filepath=str(REVIEW/(asset+'-react.png'));bpy.ops.render.render(write_still=True)
        rig.animation_data.action=None
print('ROBOT_BUILD_COMPLETE',flush=True)
