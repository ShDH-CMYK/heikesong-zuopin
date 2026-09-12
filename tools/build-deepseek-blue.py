"""Import the user-supplied Blue OBJ/PBR asset, rig, simplify and export.

blender --background --python tools/build-deepseek-blue.py -- --source /path/to/Blue
Run prepare-blue-textures.py first. Original asset and UVs remain the source;
this script does not claim to have authored the supplied character design.
"""
import argparse, hashlib, json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector
from math import sin, pi

p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--no-render',action='store_true');args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'pets';REVIEW=ROOT/'output'/'blue-review';REVIEW.mkdir(parents=True,exist_ok=True)
objfile=next(args.source.glob('*.obj'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.fps=30;scene.frame_start=0;scene.frame_end=120
bpy.ops.wm.obj_import(filepath=str(objfile),forward_axis='NEGATIVE_Z',up_axis='Y')
meshes=[o for o in scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();original=bpy.context.object;original.name='Blue original | full resolution'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
lo=Vector(tuple(min(v.co[i] for v in original.data.vertices) for i in range(3)));hi=Vector(tuple(max(v.co[i] for v in original.data.vertices) for i in range(3)));size=hi-lo
offset=Vector(((hi.x+lo.x)/2,(hi.y+lo.y)/2,lo.z));scale=4.7/size.z
for v in original.data.vertices:v.co=(v.co-offset)*scale
for poly in original.data.polygons:poly.use_smooth=True
original.data.uv_layers.active.name='Blue original UV'
raw_stats={'vertices':len(original.data.vertices),'triangles':len(original.data.polygons)}

def texture(nodes,path,color=False):
    im=bpy.data.images.load(str(path),check_existing=True)
    im.colorspace_settings.name='sRGB' if color else 'Non-Color';im.pack()
    t=nodes.new('ShaderNodeTexImage');t.image=im;return t
def make_material(name,web=False):
    ma=bpy.data.materials.new(name);ma.use_nodes=True;n=ma.node_tree.nodes;n.clear();l=ma.node_tree.links
    principled=n.new('ShaderNodeBsdfPrincipled');out=n.new('ShaderNodeOutputMaterial');l.new(principled.outputs['BSDF'],out.inputs['Surface'])
    if web:
        base=texture(n,OUT/'blue-textures'/'basecolor.jpg',True);normal=texture(n,OUT/'blue-textures'/'normal.png');orm=texture(n,OUT/'blue-textures'/'orm.png')
        sep=n.new('ShaderNodeSeparateColor');l.new(orm.outputs['Color'],sep.inputs['Color']);l.new(sep.outputs['Green'],principled.inputs['Roughness']);l.new(sep.outputs['Blue'],principled.inputs['Metallic'])
    else:
        base=texture(n,args.source/'texture_pbr_20250901.png',True);normal=texture(n,args.source/'texture_pbr_20250901_normal.png')
        rough=texture(n,args.source/'texture_pbr_20250901_roughness.png');metal=texture(n,args.source/'texture_pbr_20250901_metallic.png')
        l.new(rough.outputs['Color'],principled.inputs['Roughness']);l.new(metal.outputs['Color'],principled.inputs['Metallic'])
    l.new(base.outputs['Color'],principled.inputs['Base Color'])
    normalmap=n.new('ShaderNodeNormalMap');normalmap.inputs['Strength'].default_value=.65;l.new(normal.outputs['Color'],normalmap.inputs['Color']);l.new(normalmap.outputs['Normal'],principled.inputs['Normal'])
    return ma
original.data.materials.clear();original.data.materials.append(make_material('Blue | original 4K PBR'))
source_collection=bpy.data.collections.new('SOURCE | original 998k triangles');scene.collection.children.link(source_collection)
for c in list(original.users_collection):c.objects.unlink(original)
source_collection.objects.link(original)
web=original.copy();web.data=original.data.copy();scene.collection.objects.link(web);web.name='DeepSeek | Blue web mesh'
bpy.ops.object.select_all(action='DESELECT');web.select_set(True);bpy.context.view_layer.objects.active=web
dec=web.modifiers.new('Web simplification, preserve UV seams','DECIMATE');dec.ratio=.18;bpy.ops.object.modifier_apply(modifier=dec.name)
web.data.materials.clear();web.data.materials.append(make_material('Blue | web 2K PBR',True))
source_collection.hide_render=True;source_collection.hide_viewport=True

bpy.ops.object.armature_add(enter_editmode=True);rig=bpy.context.object;rig.name='DeepSeek_Rig';eb=rig.data.edit_bones;eb.remove(eb[0])
def bone(name,head,tail,parent=None):
    b=eb.new(name);b.head=head;b.tail=tail
    if parent:b.parent=eb[parent]
bone('root',(0,0,.08),(0,0,.55));bone('spine',(0,0,1.4),(0,0,2.52),'root');bone('head',(0,-.05,2.52),(0,0,3.75),'spine')
bone('hair',(0,.55,3.0),(0,.65,1.2),'head');bone('tail',(0,.5,1.05),(0,1.0,.86),'spine');bone('flukes',(0,1,.86),(.45,1.22,.82),'tail')
for sign,side in [(-1,'L'),(1,'R')]:
    bone('arm.'+side,(sign*.52,-.28,2.16),(sign*.72,-.42,1.75),'spine')
    bone('forearm.'+side,(sign*.72,-.42,1.75),(sign*.86,-.58,1.43),'arm.'+side)
    bone('hand.'+side,(sign*.86,-.58,1.43),(sign*.90,-.62,1.27),'forearm.'+side)
    bone('leg.'+side,(sign*.30,0,.7),(sign*.30,-.05,.10),'root')
bpy.ops.object.mode_set(mode='OBJECT');rig.show_in_front=True
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def weights(v):
    x,y,z=v;h=smooth(2.12,2.87,z);w={'head':h,'spine':1-h}
    # Leave fused dress/hair largely together. Soft masks keep little nods gentle.
    hairw=smooth(.16,.67,y)*smooth(.85,1.25,z)*(1-smooth(2.75,3.4,z))*.65
    tailw=smooth(.65,1.10,y)*(1-smooth(.93,1.26,z))
    for bn,mix in [('hair',hairw),('tail',tailw*.65),('flukes',tailw*.35)]:
        w={k:a*(1-mix) for k,a in w.items()};w[bn]=w.get(bn,0)+mix
    arm=smooth(.55,.93,abs(x))*(1-smooth(-.25,.2,y))*smooth(1.12,1.4,z)*(1-smooth(2.0,2.3,z))*.85
    side='L' if x<0 else 'R';fore=1-smooth(1.5,1.95,z)
    w={k:a*(1-arm) for k,a in w.items()};w['arm.'+side]=arm*(1-fore);w['forearm.'+side]=arm*fore
    leg=(1-smooth(.5,.79,z))*(1-smooth(.35,.7,y));w={k:a*(1-leg) for k,a in w.items()};w['leg.'+side]=leg
    pairs=sorted(((k,a) for k,a in w.items() if a>1e-5),key=lambda kv:kv[1],reverse=True)[:4];total=sum(a for k,a in pairs)
    return {k:a/total for k,a in pairs}
for ob in [web,original]:
    groups={b.name:ob.vertex_groups.new(name=b.name) for b in rig.data.bones}
    for v in ob.data.vertices:
        for bn,w in weights(v.co).items():groups[bn].add([v.index],w,'REPLACE')
    mod=ob.modifiers.new('Blue gentle deformation rig','ARMATURE');mod.object=rig;ob.parent=rig

def action(name,end):
    rig.animation_data_create();rig.animation_data.action=None
    for frame in range(0,end+1,5):
        t=frame/end;wave=sin(2*pi*t);pulse=sin(pi*t)**2
        for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
        if name=='Idle':
            rig.pose.bones['spine'].location.z=.012*wave;rig.pose.bones['head'].rotation_euler.y=.014*wave
            rig.pose.bones['hair'].rotation_euler.x=.014*wave;rig.pose.bones['tail'].rotation_euler.z=.035*wave;rig.pose.bones['flukes'].rotation_euler.y=.04*wave
        else:
            rig.pose.bones['head'].rotation_euler=(.045*sin(2*pi*t)*pulse,-.04*pulse,.045*pulse)
            rig.pose.bones['spine'].location.z=.025*pulse
            rig.pose.bones['arm.R'].rotation_euler.y=.07*pulse;rig.pose.bones['forearm.R'].rotation_euler.y=.06*pulse
            rig.pose.bones['hair'].rotation_euler.x=.025*sin(2*pi*t)
            rig.pose.bones['tail'].rotation_euler.z=.11*sin(4*pi*t)*pulse;rig.pose.bones['flukes'].rotation_euler.y=.13*sin(4*pi*t)*pulse
        for b in rig.pose.bones:
            b.keyframe_insert(data_path='rotation_euler',frame=frame,group=b.name);b.keyframe_insert(data_path='location',frame=frame,group=b.name)
    a=rig.animation_data.action;a.name=name;track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,a);track.mute=True;rig.animation_data.action=None;return a
idle=action('Idle',120);react=action('React',60)
for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
scene.frame_set(0)
bpy.ops.object.select_all(action='DESELECT');web.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(OUT/'deepseek.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_frame_range=False,export_skins=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_anim_slide_to_zero=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_generic_quantization=16)

scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=760;scene.render.resolution_y=880;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX'
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.13,.16,.22,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
for name,pos,power in [('Key',(-4,-6,7),650),('Fill',(4,-3,4),430),('Rim',(2,4,6),650)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=5;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,2.4))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Blue review camera';cam.data.type='ORTHO';cam.data.ortho_scale=5.5;scene.camera=cam
def camera(pos):cam.location=pos;cam.rotation_euler=(Vector((0,0,2.35))-cam.location).to_track_quat('-Z','Y').to_euler()
camera((0,-10,2.35));scene.frame_set(0)
# Eliminate unused imported materials/images; keep original and web PBR packed.
bpy.ops.outliner.orphans_purge(do_recursive=True)
scene['asset_source']='User supplied Blue.rar; original OBJ + PBR textures; cleaned and rigged by script'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'deepseek.blend'),compress=True)
stats={'source':'Blue.rar supplied by user','sourceObjSHA256':hashlib.sha256(objfile.read_bytes()).hexdigest(),'original':raw_stats,'web':{'vertices':len(web.data.vertices),'triangles':len(web.data.polygons),'glbBytes':(OUT/'deepseek.glb').stat().st_size},'bones':len(rig.data.bones),'animations':{'Idle':4,'React':2},'textures':'original 4K packed in blend; web 2K basecolor, normal, packed roughness/metallic','orientation':'Blender Z up, front -Y; glTF Y up, front +Z','normalStrength':.65,'notes':'Original topology and UV retained; export decimated to 18%. Fused topology uses gentle motions, no full humanoid retargeting.'}
(REVIEW/'build-stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
if not args.no_render:
    for name,pos in [('front',(0,-10,2.35)),('side',(10,0,2.35)),('back',(0,10,2.35)),('three-quarter',(7,-10,4.4))]:
        camera(pos);scene.render.filepath=str(REVIEW/(name+'.png'));bpy.ops.render.render(write_still=True)
    rig.animation_data.action=react;scene.frame_set(20);camera((0,-10,2.35));scene.render.filepath=str(REVIEW/'react.png');bpy.ops.render.render(write_still=True)
print('BLUE_BUILD_COMPLETE',json.dumps(stats),flush=True)
