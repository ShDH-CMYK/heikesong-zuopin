"""Reproducible, volumetric whale-maid character. Blender 4.5 LTS.

Run: blender --background --python tools/build-deepseek.py
Z up; front is -Y. References are optional, editor-only and never exported.
Image textures are authored by build-deepseek-textures.py before this script.
"""
import bpy, bmesh, math, json, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'pets'
REVIEW = ROOT / 'output' / 'model-review'
REVIEW.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for d in list(bpy.data.materials): bpy.data.materials.remove(d)
CHAR = bpy.data.collections.new('DeepSeek | editable character'); bpy.context.scene.collection.children.link(CHAR)
MESHES = []

def material(name, color, rough=.5, metallic=0, texture=None):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metallic
    if texture:
        im=bpy.data.images.load(str(OUT/'textures'/texture)); im.pack()
        t=m.node_tree.nodes.new('ShaderNodeTexImage'); t.image=im
        m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
    return m

skin=material('Porcelain warm skin',(.95,.75,.68),.62)
hair=material('Indigo to ocean | painted hair',(.15,.2,.5),.56,0,'deepseek-hair.png')
hairdark=material('Hair groove indigo',(.045,.06,.16),.5)
hairlight=material('Hair glints',(.23,.36,.69),.34)
navy=material('Midnight blue cotton',(.035,.045,.12),.72)
skirtmat=material('Gold ocean embroidery | skirt',(.04,.05,.13),.65,0,'deepseek-skirt.png')
white=material('Warm ivory lace',(.97,.93,.88),.72)
apronmat=material('Painted whale apron',(.97,.94,.90),.67,0,'deepseek-apron.png')
blue=material('Blue satin ribbons',(.07,.34,.57),.38)
gold=material('Champagne embroidery',(.63,.45,.22),.4,.35)
ink=material('Soft ink eyelashes',(.025,.012,.027),.56)
eyeWhite=material('Eye whites',(.99,.94,.94),.28)
iris=material('Ocean iris | painted',(.08,.33,.8),.25,0,'deepseek-iris.png')
blush=material('Soft cheek rose',(.96,.53,.55),.8)

def finish(obj,name,mat,bone='spine',weight=None):
    obj.name=name
    for c in list(obj.users_collection): c.objects.unlink(obj)
    CHAR.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active=obj; obj.select_set(True)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    obj.select_set(False)
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    for p in obj.data.polygons:p.use_smooth=True
    if not obj.data.uv_layers: obj.data.uv_layers.new(name='UVMap')
    if weight:
        groups={}
        for v in obj.data.vertices:
            for bn,w in weight(v.co).items():
                if w>0:
                    if bn not in groups:groups[bn]=obj.vertex_groups.new(name=bn)
                    groups[bn].add([v.index],w,'REPLACE')
    else:
        g=obj.vertex_groups.new(name=bone);g.add(list(range(len(obj.data.vertices))),1,'REPLACE')
    MESHES.append(obj);return obj

def uvmesh(name,verts,faces,uvs,mat,bone='spine',weight=None):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    uv=me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        for li in poly.loop_indices:uv.data[li].uv=uvs[me.loops[li].vertex_index]
    o=bpy.data.objects.new(name,me);CHAR.objects.link(o)
    return finish(o,name,mat,bone,weight)

def sphere(name,loc,scale,mat,bone='spine',seg=40,rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc)
    o=bpy.context.object;o.scale=scale
    return finish(o,name,mat,bone)

def curve(name,points,radius,mat,bone='spine'):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=radius;cu.bevel_resolution=3
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for b,p in zip(sp.bezier_points,points):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,cu);CHAR.objects.link(o)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
    return finish(o,name,mat,bone)

def interpolate(points,per=7):
    a=[Vector(p) for p in points];res=[]
    for k in range(len(a)-1):
        p0=a[max(0,k-1)];p1=a[k];p2=a[k+1];p3=a[min(len(a)-1,k+2)]
        for j in range(per):
            t=j/per;res.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
    return res+[a[-1]]

def lock(name,points,widths,depths,mat=hair,bone='head',weight=None,segments=20):
    rows=interpolate([(*p,w,d) for p,w,d in zip(points,widths,depths)])
    vs=[];uv=[];fs=[]
    for j,r in enumerate(rows):
        tang=Vector(rows[min(j+1,len(rows)-1)][:3])-Vector(rows[max(j-1,0)][:3]);tang.normalize()
        axis=tang.cross(Vector((0,1,0))).normalized()
        depth=tang.cross(axis).normalized()
        for i in range(segments+1):
            a=2*pi*i/segments
            p=Vector(r[:3])+axis*r[3]*cos(a)+depth*r[4]*sin(a)
            vs.append(p);uv.append((i/segments,max(0,min(1,(p.z-1.0)/3.3)) if mat==hair else 1-j/(len(rows)-1)))
    for j in range(len(rows)-1):
        for i in range(segments):
            n=j*(segments+1)+i;fs.append((n,n+1,n+segments+2,n+segments+1))
    fs.append(tuple(range(segments-1,-1,-1)));fs.append(tuple((len(rows)-1)*(segments+1)+i for i in range(segments)))
    return uvmesh(name,vs,fs,uv,mat,bone,weight)

def tube(name,points,radii,mat,bone='spine',weight=None,segments=20):
    rows=interpolate([(*p,r) for p,r in zip(points,radii)],8);vs=[];uv=[];fs=[]
    for j,r in enumerate(rows):
        tang=Vector(rows[min(j+1,len(rows)-1)][:3])-Vector(rows[max(j-1,0)][:3]);tang.normalize()
        ref=Vector((0,1,0)) if abs(tang.y)<.9 else Vector((1,0,0))
        u=tang.cross(ref).normalized();v=tang.cross(u).normalized()
        for i in range(segments+1):
            a=2*pi*i/segments;p=Vector(r[:3])+r[3]*(cos(a)*u+sin(a)*v)
            vs.append(p);uv.append((i/segments,1-j/(len(rows)-1)))
    for j in range(len(rows)-1):
        for i in range(segments):
            n=j*(segments+1)+i;fs.append((n,n+1,n+segments+2,n+segments+1))
    fs.append(tuple(range(segments-1,-1,-1)));fs.append(tuple((len(rows)-1)*(segments+1)+i for i in range(segments)))
    return uvmesh(name,vs,fs,uv,mat,bone,weight)

def lathe(name,rows,mat,bone='spine',pleats=0):
    vs=[];uv=[];fs=[];N=96
    for j,(z,rx,ry) in enumerate(rows):
        for i in range(N+1):
            a=2*pi*i/N;wave=1+pleats*cos(16*a)*(1-j/(len(rows)*1.5))
            vs.append((rx*cos(a)*wave,ry*sin(a)*wave,z));uv.append((i/N,(z-rows[0][0])/(rows[-1][0]-rows[0][0])))
    for j in range(len(rows)-1):
        for i in range(N):
            n=j*(N+1)+i;fs.append((n,n+1,n+N+2,n+N+1))
    fs.append(tuple(range(N-1,-1,-1)));fs.append(tuple((len(rows)-1)*(N+1)+i for i in range(N)))
    return uvmesh(name,vs,fs,uv,mat,bone)

def bow(name,pos,size,bone='spine',mat=blue):
    x,y,z=pos
    for s in [-1,1]:
        # Full, curved ribbon loops, plus folded ribbon tails.
        o=sphere(name+' loop', (x+s*size*.52,y,z+.02), (size*.53,size*.22,size*.38),mat,bone)
        curve(name+' crease',[(x+s*size*.16,y-size*.20,z),(x+s*size*.48,y-size*.24,z+.02),(x+s*size*.83,y-size*.16,z+.15*size)],.009,navy,bone)
        lock(name+' ribbon',[(x+s*size*.15,y+.01,z-.04),(x+s*size*.38,y-.01,z-size*.48),(x+s*size*.52,y,z-size*.79)],[size*.16,size*.18,size*.20],[.035,.028,.012],mat,bone)
    sphere(name+' knot',pos,(size*.20,size*.27,size*.24),mat,bone)

def hair_weights(v):
    t=max(0,min(.72,(2.9-v.z)/2.1));return {'head':1-t,'hair':t}
def tail_weights(v):
    t=max(0,min(1,(v.x-.55)/.7));return {'tail':1-t,'flukes':t}

# Character dimensions in model units, measured against the three supplied views.
# Feet 0.05; hem 0.75; waist 1.75; chin 2.56; crown 4.25; head : body ~ 1 : 1.
for s,side in [(-1,'L'),(1,'R')]:
    sphere('Stocking '+side,(s*.29,0,.49),(.185,.21,.38),white,'leg.'+side)
    sphere('Mary Jane shoe '+side,(s*.29,-.12,.20),(.225,.34,.17),navy,'leg.'+side)
    curve('Shoe strap '+side,[(s*.29-.17,-.22,.31),(s*.29,-.37,.32),(s*.29+.17,-.22,.31)],.027,white,'leg.'+side)
    sphere('Shoe pearl '+side,(s*.29+.13,-.33,.31),(.037,.027,.035),gold,'leg.'+side)
sphere('Body below fitted dress',(0,0,1.96),(.43,.29,.60),skin)
sphere('Neck',(0,0,2.52),(.19,.19,.26),skin,'head')
lathe('Fitted maid bodice',[(1.7,.38,.27),(1.88,.43,.30),(2.12,.48,.32),(2.32,.45,.30),(2.43,.30,.23)],navy)
lathe('Pleated skirt, closed volume',[(.79,1.02,.65),(.87,1.06,.67),(1.02,1.00,.62),(1.25,.84,.52),(1.50,.63,.40),(1.76,.39,.285)],skirtmat,pleats=.033)
lathe('Ivory underskirt',[(.66,1.02,.67),(.72,1.09,.69),(.85,1.07,.68),(.91,.96,.60)],white,pleats=.026)
for z,rx,ry,ma in [(.78,1.072,.692,gold),(.93,1.035,.65,gold),(1.76,.405,.305,white)]:
    curve('Hem piping',[(rx*cos(i*2*pi/64),ry*sin(i*2*pi/64),z) for i in range(65)],.015,ma)
for i in range(48):
    a=2*pi*i/48
    # Lace scallops are rounded three-dimensional threads, never alpha planes.
    pts=[]
    for j in range(9):
        b=a+(j/8-.5)*2*pi/48;zz=.685-.055*sin(pi*j/8)
        pts.append((1.07*cos(b),.695*sin(b),zz))
    curve('Scalloped petticoat lace',pts,.018,white)
    sphere('Lace eyelet pearl',(1.08*cos(a),.70*sin(a),.72),(.021,.021,.021),gold,seg=12,rings=8)

# Front apron patch with custom UV from straight waistband to rounded lower edge.
vs=[];uv=[];fs=[];nu=32;nv=24
for j in range(nv+1):
    t=j/nv
    for i in range(nu+1):
        u=i/nu;x=(u*2-1)*(.34+.26*t)
        z=1.76-t*(.78-.20*abs(2*u-1)**3)
        y=-.32-.35*t+.12*(x/.9)**2
        vs.append((x,y-.022,z));uv.append((u,1-t))
for j in range(nv):
    for i in range(nu):
        n=j*(nu+1)+i;fs.append((n,n+1,n+nu+2,n+nu+1))
ap=uvmesh('Whale emblem apron',vs,fs,uv,apronmat)
bpy.context.view_layer.objects.active=ap;ap.select_set(True)
mod=ap.modifiers.new('Sewn fabric thickness','SOLIDIFY');mod.thickness=.025;bpy.ops.object.modifier_apply(modifier=mod.name);ap.select_set(False)
edge=[vs[j*(nu+1)] for j in range(nv+1)]+[vs[nv*(nu+1)+i] for i in range(1,nu+1)]+[vs[j*(nu+1)+nu] for j in range(nv-1,-1,-1)]
curve('Apron stitched border',[(x,y-.026,z) for x,y,z in edge],.018,white)
for i in range(0,len(edge),2):
    x,y,z=edge[i];sphere('Apron gathered ruffle',(x*1.055,y+.006,z),(.051,.042,.045),white,seg=16,rings=10)
for s in [-1,1]:
    curve('Apron shoulder strap',[(s*.30,-.335,1.78),(s*.31,-.34,2.12),(s*.34,-.27,2.40),(s*.33,.10,2.39),(s*.29,.28,1.78)],.043,white)
    for z in [1.93,2.06,2.19,2.30]:sphere('Strap ruffle',(s*.36,-.345,z),(.060,.039,.062),white,seg=16,rings=10)
for z in [1.92,2.05,2.17]:
    for x in [-.12,.12]:sphere('Bodice pearl',(x,-.326,z),(.022,.022,.022),gold,seg=12,rings=8)
bow('Collar bow',(0,-.38,2.35),.25)
sphere('Collar brooch',(0,-.46,2.35),(.06,.025,.079),gold)
sphere('Brooch sapphire',(0,-.483,2.35),(.039,.016,.053),blue)
bow('Back waist bow',(0,.39,1.75),.34,mat=white)
for s in [-1,1]:bow('Hem ribbon',(s*.70,-.50,.97),.17,mat=navy)

for s,side in [(-1,'L'),(1,'R')]:
    shoulder=(s*.43,0,2.30);elbow=(s*.65,-.015,1.95);wrist=(s*.79,-.08,1.58)
    def armweight(v,side=side):
        t=max(0,min(1,(2.07-v.z)/.29));return {'arm.'+side:1-t,'forearm.'+side:t}
    tube('Puffed sleeve '+side,[shoulder,(s*.56,0,2.18),elbow,wrist],[.18,.22,.16,.145],navy,weight=armweight)
    tube('Ivory cuff '+side,[(s*.77,-.07,1.68),(s*.80,-.08,1.58)],[.17,.174],white,'forearm.'+side)
    tube('Navy cuff band '+side,[(s*.76,-.07,1.73),(s*.78,-.075,1.65)],[.175,.177],navy,'forearm.'+side)
    sphere('Cuff button '+side,(s*.78,-.245,1.69),(.03,.025,.03),gold,'forearm.'+side)
    sphere('Palm '+side,(s*.82,-.09,1.46),(.132,.111,.145),skin,'hand.'+side)
    for n in range(4):sphere('Finger '+side,(s*.82+(n-1.5)*.046,-.135,1.40+abs(n-1.5)*.018),(.030,.062,.064),skin,'hand.'+side,seg=20,rings=12)
    sphere('Thumb '+side,(s*.71,-.13,1.47),(.055,.079,.074),skin,'hand.'+side)

# Rounded chibi head: closed smooth mesh, front is negative Y.
sphere('Sculpted rounded face',(0,-.025,3.34),(1.00,.64,.88),skin,'head',96,64)
for s in [-1,1]:
    sphere('Ear',(s*.91,-.035,3.08),(.15,.13,.22),skin,'head')
    # Eye surround and whites follow the front cheek curvature.
    x=s*.39
    sphere('Eye white',(x,-.625,3.22),(.266,.066,.285),eyeWhite,'head')
    # Convex textured iris disk with circular UV; not a reference plane.
    vs=[(x,-.712,3.21)];uv=[(.5,.5)];fs=[];N=64;R=10
    for j in range(1,R+1):
        r=j/R
        for i in range(N+1):
            a=i*2*pi/N;vs.append((x+.192*r*cos(a),-.694-.018*(1-r*r),3.21+.258*r*sin(a)));uv.append((.5+.5*r*cos(a),.5+.5*r*sin(a)))
    for i in range(N):fs.append((0,1+i,2+i))
    for j in range(R-1):
        for i in range(N):
            n=1+j*(N+1)+i;fs.append((n,n+N+1,n+N+2,n+1))
    uvmesh('Painted convex iris',vs,fs,uv,iris,'head')
    curve('Upper sculpted eyelash',[(x-.26,-.663,3.39),(x-.17,-.682,3.49),(x+.08,-.690,3.51),(x+.26,-.643,3.41)],.028,ink,'head')
    curve('Outer lash flick',[(x+s*.22,-.652,3.43),(x+s*.31,-.621,3.47),(x+s*.33,-.610,3.49)],.024,ink,'head')
    curve('Eyebrow',[(x-.16,-.555,3.67),(x,-.585,3.70),(x+.15,-.555,3.67)],.012,hairdark,'head')
    sphere('Rosy cheek',(s*.61,-.534,2.95),(.105,.016,.044),blush,'head',32,16)
sphere('Subtle nose tip',(0,-.659,3.04),(.044,.030,.043),skin,'head',32,20)
curve('Tiny expressive mouth',[(-.043,-.615,2.87),(0,-.631,2.88),(.043,-.615,2.867)],.012,ink,'head')

# Hair cap: smooth back/side shell with an open face, never covering the eyes.
vs=[];uv=[];fs=[];N=96;R=28
for j in range(R+1):
    for i in range(N+1):
        a=2*pi*i/N;front=max(0,-sin(a));tmax=2.17-.96*front**2
        t=.007+j/R*tmax
        vs.append((1.055*sin(t)*cos(a),.045+.70*sin(t)*sin(a),3.39+.92*cos(t)));uv.append((i/N,1-j/R*.55))
for j in range(R):
    for i in range(N):
        n=j*(N+1)+i;fs.append((n,n+1,n+N+2,n+N+1))
cap=uvmesh('Hair crown sculpted shell',vs,fs,uv,hair,'head')
bpy.context.view_layer.objects.active=cap;cap.select_set(True);m=cap.modifiers.new('Crown thickness','SOLIDIFY');m.thickness=.045;bpy.ops.object.modifier_apply(modifier=m.name);cap.select_set(False)
# Continuous rear mass underneath relief locks, with roots buried in the crown.
lock('Continuous long hair foundation',[(0,.30,4.12),(0,.37,3.60),(0,.38,2.85),(0,.38,2.0),(0,.38,1.30),(0,.38,1.10)],[.34,.88,.97,1.03,.93,.65],[.19,.30,.31,.26,.18,.05],weight=hair_weights,segments=64)
# Layered rear locks. Thickness varies along each lock and narrows into curled tips.
for i in range(9):
    x=(i-4)*.205;outer=abs(x)
    pts=[(x*.70,.30,3.96),(x*1.08,.53,3.06),(x*1.12,.56,2.12),(x*1.17,.49,1.39),(x*1.13+.10*sin(i),.40,1.05+.09*cos(i)),(x*1.19+.18*sin(i),.38,1.17+.08*cos(i))]
    lock('Rear layered hair %02d'%i,pts,[.10,.29,.27,.24,.10,.002],[.06,.135,.145,.12,.06,.002],weight=hair_weights)
for s in [-1,1]:
    for k in range(3):
        lock('Flowing side hair',[(s*(.73+k*.025),.05+k*.12,3.85),(s*(1.00+k*.055),.04+k*.12,2.65),(s*(.94+k*.12),.02+k*.12,2.00),(s*(1.16+k*.055),.04+k*.09,1.51),(s*(1.26+k*.035),.10,1.69)],[.09,.23,.20,.16,.002],[.08,.14,.13,.10,.002],weight=hair_weights)
    # Face framing locks come forward of ears, but stay outside eyes.
    lock('Face framing curl',[(s*.60,-.36,4.10),(s*.91,-.47,3.51),(s*.94,-.45,2.94),(s*.80,-.47,2.69),(s*.70,-.50,2.31),(s*.83,-.49,2.38)],[.11,.20,.19,.16,.12,.002],[.09,.15,.14,.12,.08,.002],bone='head')
    curve('Face lock strand',[(s*.87,-.604,3.66),(s*1.00,-.56,3.14),(s*.88,-.59,2.78),(s*.78,-.565,2.42)],.009,hairdark,'head')
# Bangs sweep from parting to pointed ends; center lock is longer.
for x,end,lean in [(-.53,3.51,-.10),(-.29,3.48,-.13),(0,3.37,.07),(.30,3.62,.12),(.57,3.48,.16)]:
    lock('Sculpted fringe',[(x*.42,-.25,4.24),(x*.85,-.58,4.02),(x,-.73,3.75),(x+lean,-.755,end)],[.09,.24,.19,.002],[.08,.14,.105,.002],bone='head')
curve('Whale ahoge',[(.03,.00,4.23),(.01,-.01,4.63),(-.40,-.01,4.72),(-.67,-.07,4.44)],.040,hair,'head')

# Maid headdress: padded band + individual lace scallops + blue temple bows.
pts=[]
for i in range(41):
    a=.08+pi*.84*i/40;pts.append((1.06*cos(a),.00,3.40+1.02*sin(a)))
curve('Padded maid headband',pts,.076,navy,'head')
for i in range(19):
    a=.12+pi*.81*i/18;x=1.075*cos(a);z=3.40+1.06*sin(a)
    sphere('Headband gathered lace',(x,.023,z),(.113,.061,.125),white,'head',24,16)
    sphere('Lace inset bead',(x,-.045,z),(.022,.015,.022),gold,'head',16,10)
for s in [-1,1]:
    bow('Temple satin bow',(s*1.055,-.14,3.53),.21,'head')
    # Whale-like side frill, with a full rounded outer lip.
    lock('Temple flared fin',[(s*.94,.005,3.49),(s*1.14,.005,3.33),(s*1.40,.025,3.29)],[.11,.19,.005],[.11,.09,.004],hair,'head')
    curve('Temple ivory frill',[(s*1.00,-.061,3.28),(s*1.18,-.07,3.22),(s*1.38,.005,3.28)],.045,white,'head')

# Complete thick tail from sacrum, curling outward below the rear hair.
tailpath=[(0,.26,1.66),(.12,.53,1.38),(.35,.75,1.02),(.76,.82,.93),(1.08,.79,1.10)]
tube('Whale tail peduncle',tailpath,[.17,.19,.17,.125,.09],hair,weight=tail_weights,segments=32)
for side in [-1,1]:
    # Closed lens sections, organic swept fluke outlines in X/Z plane.
    if side==1:pts=[(1.03,.79,1.07),(1.27,.79,1.22),(1.50,.81,1.32),(1.72,.82,1.48)];ws=[.07,.17,.14,.005]
    else:pts=[(1.03,.79,1.07),(.94,.81,1.28),(.93,.83,1.52),(1.04,.85,1.72)];ws=[.07,.17,.14,.005]
    lock('Sculpted whale fluke',pts,ws,[.065,.085,.065,.004],hair,'flukes',segments=32)
    for shift in [-.035,.035]:curve('Fluke raised vein',[(p[0]+shift,p[1]-.075,p[2]) for p in pts],.010,blue,'flukes')

# Voxel sculpt the rear mass and crown into one continuous surface, preserving
# separate fringe/face curls. This removes visible intersections at the roots.
hairparts=[o for o in MESHES if o.name.startswith(('Hair crown','Continuous long hair','Rear layered hair','Flowing side hair'))]
bpy.ops.object.select_all(action='DESELECT')
for o in hairparts:o.select_set(True);MESHES.remove(o)
bpy.context.view_layer.objects.active=hairparts[0];bpy.ops.object.join();mass=bpy.context.object
mass.vertex_groups.clear()
rem=mass.modifiers.new('Sculpt union of hair masses','REMESH');rem.mode='VOXEL';rem.voxel_size=.024;rem.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=rem.name)
sm=mass.modifiers.new('Sculpt smooth root transitions','SMOOTH');sm.factor=1.1;sm.iterations=7;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=mass.modifiers.new('Web topology reduction','DECIMATE');dec.ratio=.72;bpy.ops.object.modifier_apply(modifier=dec.name)
uv=mass.data.uv_layers.new(name='Cylindrical hair UV')
for poly in mass.data.polygons:
    for li in poly.loop_indices:
        v=mass.data.vertices[mass.data.loops[li].vertex_index].co
        uv.data[li].uv=((math.atan2(v.y,v.x)/(2*pi)+.5)%1,max(0,min(1,(v.z-1)/3.3)))
mass.data.materials.clear();finish(mass,'Sculpted continuous rear hair',hair,weight=hair_weights)

# Actual armature and normalized vertex groups. Accessories share deformation groups.
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='DeepSeek_Rig'
eb=rig.data.edit_bones;eb.remove(eb[0])
def bone(name,head,tail,parent=None):
    b=eb.new(name);b.head=head;b.tail=tail
    if parent:b.parent=eb[parent]
bone('root',(0,0,.10),(0,0,.55))
bone('spine',(0,0,1.65),(0,0,2.46),'root')
bone('head',(0,0,2.46),(0,0,3.68),'spine')
bone('hair',(0,.38,2.88),(0,.47,1.25),'head')
bone('tail',(0,.27,1.64),(.65,.79,.99),'spine')
bone('flukes',(.65,.79,.99),(1.34,.82,1.44),'tail')
for s,side in [(-1,'L'),(1,'R')]:
    bone('arm.'+side,(s*.43,0,2.30),(s*.65,-.015,1.95),'spine')
    bone('forearm.'+side,(s*.65,-.015,1.95),(s*.79,-.08,1.58),'arm.'+side)
    bone('hand.'+side,(s*.79,-.08,1.58),(s*.82,-.09,1.40),'forearm.'+side)
    bone('leg.'+side,(s*.29,0,1.15),(s*.29,-.05,.22),'root')
bpy.ops.object.mode_set(mode='OBJECT')
rig.show_in_front=True
for o in MESHES:
    mod=o.modifiers.new('Weighted character skin','ARMATURE');mod.object=rig;o.parent=rig

scene=bpy.context.scene;scene.render.fps=30
def make_action(name,frames):
    rig.animation_data_create();rig.animation_data.action=None
    for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0)
    for f in frames:
        t=f/frames[-1];w=sin(2*pi*t);pulse=sin(pi*t)**2
        for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
        if name=='Idle':
            rig.pose.bones['spine'].location.z=.018*w
            rig.pose.bones['head'].rotation_euler=(.016*w,.025*w,.014*w)
            rig.pose.bones['hair'].rotation_euler=(.035*w,.018*w,0)
            rig.pose.bones['tail'].rotation_euler=(.05*w,.065*w,.10*w)
            rig.pose.bones['flukes'].rotation_euler=(.03*w,0,.10*w)
            for side in ['L','R']:rig.pose.bones['arm.'+side].rotation_euler.x=.025*w
        else:
            rig.pose.bones['head'].rotation_euler=(.06*pulse,-.08*pulse,.10*pulse)
            rig.pose.bones['arm.R'].rotation_euler=(.12*pulse,.10*pulse,-.83*pulse)
            rig.pose.bones['forearm.R'].rotation_euler=(.14*pulse,0,-.30*pulse)
            rig.pose.bones['hand.R'].rotation_euler.y=.35*sin(6*pi*t)*pulse
            rig.pose.bones['tail'].rotation_euler.z=.25*sin(4*pi*t)*pulse
            rig.pose.bones['flukes'].rotation_euler.y=.20*sin(4*pi*t)*pulse
            rig.pose.bones['hair'].rotation_euler.x=.08*sin(2*pi*t)
            rig.pose.bones['spine'].location.z=.04*pulse
        for p in rig.pose.bones:
            p.keyframe_insert(data_path='rotation_euler',frame=f,group=p.name)
            p.keyframe_insert(data_path='location',frame=f,group=p.name)
    action=rig.animation_data.action;action.name=name
    track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,action);track.mute=True
    rig.animation_data.action=None
    return action
idle=make_action('Idle',list(range(0,121,10)));react=make_action('React',list(range(0,61,5)))
for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
scene.frame_set(0)

# Optional orthographic reference alignment is visible/editable in Blender only.
refs=bpy.data.collections.new('Reference alignment | never exported');scene.collection.children.link(refs)
refdir=Path('D:/OneDrive/Desktop/素材')
for name,file,loc,rot,size in [
    ('FRONT | floor=0 crown=4.7','微信图片_20260912052134_1119_895.jpg',(0,1.5,2.39),(pi/2,0,0),5.20),
    ('SIDE | same floor and crown','微信图片_20260912052134_1120_895.jpg',(-2.0,0,2.39),(pi/2,0,pi/2),5.35),
    ('BACK | same floor and crown','微信图片_20260912052135_1121_895.jpg',(0,-1.5,2.39),(pi/2,0,pi),5.18)]:
    if not (refdir/file).exists():continue
    im=bpy.data.images.load(str(refdir/file));im.pack();o=bpy.data.objects.new(name,None);refs.objects.link(o)
    o.empty_display_type='IMAGE';o.data=im;o.empty_display_size=size;o.location=loc;o.rotation_euler=rot;o.color[3]=.28;o.hide_render=True;o.hide_viewport=True

# Merge temporary export copies by material for fewer web draw calls. Editable
# source meshes remain separate in the .blend; all bone vertex groups survive.
exportcopies=[]
for ma in {o.data.materials[0] for o in MESHES}:
    copies=[];bpy.ops.object.select_all(action='DESELECT')
    for src in [o for o in MESHES if o.data.materials[0]==ma]:
        c=src.copy();c.data=src.data.copy();CHAR.objects.link(c);c.select_set(True);copies.append(c)
    bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join()
    c=bpy.context.object;c.name='Web | '+ma.name
    # Keep the editable sculpt dense; simplify only the downloadable runtime copy.
    if len(c.data.polygons)>2000:
        de=c.modifiers.new('Web mesh simplification','DECIMATE');de.ratio=.55
        bpy.ops.object.modifier_apply(modifier=de.name)
    exportcopies.append(c)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in exportcopies:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(OUT/'deepseek.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_frame_range=False,export_skins=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_anim_slide_to_zero=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
for o in exportcopies:bpy.data.objects.remove(o,do_unlink=True)

# Studio setup is stored in the .blend, excluded from the glTF selection.
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world.color=(.25,.25,.25);scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.17,.23,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
def area(name,pos,energy,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,2.5))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-4,-6,7),650,5);area('Cool fill',(4,-3,4),430,4);area('Hair rim',(2,4,6),800,3)
bpy.ops.object.camera_add(location=(0,-10,2.4));cam=bpy.context.object;cam.name='Review camera';scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=5.55
def camera(pos):cam.location=pos;cam.rotation_euler=(Vector((.12,0,2.42))-cam.location).to_track_quat('-Z','Y').to_euler()
camera((.12,-10,2.42))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'deepseek.blend'),compress=True)
stats={'meshes':len(MESHES),'vertices':sum(len(o.data.vertices) for o in MESHES),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in MESHES),'bones':len(rig.data.bones),'actions':[a.name for a in [idle,react]],'height_units':4.8,'coordinate_system':'Blender Z up / front -Y; glTF Y up / front +Z','method':'Scripted sculptural meshes with UV-painted textures and armature weights; no image-plane body'}
(REVIEW/'build-stats.json').write_text(json.dumps(stats,indent=2),encoding='utf-8');print('MODEL_STATS',json.dumps(stats))
if '--no-render' not in sys.argv:
    for label,pos in [('front',(.12,-10,2.42)),('side',(10,0,2.42)),('back',(.12,10,2.42)),('three-quarter',(7,-10,5.0))]:
        camera(pos);scene.render.filepath=str(REVIEW/(label+'.png'));bpy.ops.render.render(write_still=True)
print('DEEPSEEK_BUILD_COMPLETE')
