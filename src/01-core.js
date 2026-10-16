(function(){'use strict';
// =====================================================================
// 01 CORE: renderer, helpers, chunked static-geometry batching, colliders
// =====================================================================
const $=id=>document.getElementById(id),T0=performance.now();
function fail(msg){$('menuMsg').textContent=msg;$('btnStart').hidden=true;$('btnSurvival').hidden=true;$('btnMapMenu').hidden=true;}
if(!window.THREE){fail('The 3D engine could not load. Check your connection, then reload the page.');return;}
const T=THREE,PI=Math.PI,TAU=PI*2;
let seed=20261012;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
// leave the shared stream as if n draws had been made since s: a block whose look changes keeps the town laid out the same
function rndSkip(s,n){let A=1664525,Cc=1013904223,a=1,c=0;for(;n>0;n>>>=1){if(n&1){a=Math.imul(a,A)>>>0;c=(Math.imul(c,A)+Cc)>>>0;}Cc=(Math.imul(Cc,A)+Cc)>>>0;A=Math.imul(A,A)>>>0;}
  seed=(Math.imul(a,s)+c)>>>0;}
const rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
const R=Math.random,R2=(a,b)=>a+R()*(b-a),RP=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function angDiff(a,b){let d=a-b;if(d>64||d<-64)d-=TAU*Math.round(d/TAU);while(d>PI)d-=TAU;while(d<-PI)d+=TAU;return d;}

const canvas=$('view');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(e){fail('This browser could not start 3D graphics. Try a current version of Chrome or Safari.');return;}
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
if(isTouch)document.body.classList.add('touch');
const Q={shadows:!isTouch,pr:Math.min(window.devicePixelRatio||1,isTouch?1.5:2),maxFoes:isTouch?10:14,far:isTouch?430:560};
// distance detail (03c cullChunks): beyond DET_D[t] metres (nearest edge of a chunk) objects smaller than DET_R[t] (bounding radius) are not drawn
const DET_D=[150,260],DET_R=[.7,2];
renderer.setPixelRatio(Q.pr);
if(Q.shadows){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
// ---------- light and colour
// Lighting is computed in linear light and filmic (ACES) tone mapped to sRGB. Every colour in the code stays an sRGB hex as authored:
// Color.setHex converts it on the way in, vertex colours are converted in the vertex shader (color_vertex below), and canvas
// textures are stored as sRGB (decoded by the GPU on WebGL2, in the shader on WebGL1). three r128 mixes fog in after tone mapping
// and output encoding, so fog colours are display colours.
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
{const sh=T.Color.prototype.setHex;T.Color.prototype.setHex=function(h){sh.call(this,h);return this.convertSRGBToLinear();};}
const HWSRGB=renderer.capabilities.isWebGL2;
function srgbTex(t){if(HWSRGB)t.internalFormat='SRGB8_ALPHA8';else t.encoding=T.sRGBEncoding;return t;}
{const CT=T.CanvasTexture;T.CanvasTexture=class extends CT{constructor(...a){super(...a);srgbTex(this);}};}
// late-afternoon sun from the west-southwest (x east, z south), 28 degrees up
const SUN=new T.Vector3(-0.83,0.47,0.30).normalize();
// Aerial haze: the fog takes the colour of the horizon in the direction it is seen (warm and bright towards the sun, a pale smoggy
// grey elsewhere). hazeRGB is that colour (0..1 display values) for a unit direction; the fog shader below computes the same per vertex,
// the sky paints it on its horizon, and the mountains fade into it.
const FOG_A=[.84,.83,.80],FOG_S=[.98,.90,.75];
function hazeK(dx,dy,dz){const s=Math.max(0,dx*SUN.x+dy*SUN.y+dz*SUN.z);return s*s*s;}
function hazeRGB(dx,dy,dz){const k=hazeK(dx,dy,dz);return[lerp(FOG_A[0],FOG_S[0],k),lerp(FOG_A[1],FOG_S[1],k),lerp(FOG_A[2],FOG_S[2],k)];}
{const S=T.ShaderChunk,v3=a=>'vec3('+a.map(x=>x.toFixed(4)).join(',')+')';
 // vertex colours are authored in sRGB
 S.color_pars_vertex+='\n#ifdef USE_COLOR\nvec3 srgbL(vec3 c){return mix(pow(c*.9478672986+vec3(.0521327014),vec3(2.4)),c*.0773993808,vec3(lessThanEqual(c,vec3(.04045))));}\n#endif';
 S.color_vertex=S.color_vertex.replace('vColor *= color;','#ifdef USE_COLOR_ALPHA\n\tvColor *= vec4(srgbL(color.rgb),color.a);\n#else\n\tvColor *= srgbL(color);\n#endif');
 // fog: tinted by view direction (per vertex), plus a thin haze that starts at the camera
 // a sun-bleached grade: the filmic curve gives back a little less saturation than it takes in
 S.tonemapping_pars_fragment=S.tonemapping_pars_fragment.replace('color = ACESOutputMat * color;\n\treturn saturate( color );','color = saturate( ACESOutputMat * color );\n\treturn mix( vec3( dot( color, vec3( .2126, .7152, .0722 ) ) ), color, .84 );');
 S.fog_pars_vertex='#ifdef USE_FOG\n\tvarying float fogDepth;\n\tvarying vec3 fogTint;\n\tuniform vec3 fogColor;\n#endif';
 S.fog_vertex='#ifdef USE_FOG\n\tfogDepth = - mvPosition.z;\n\tvec3 fogW = ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;\n\tfloat fogS = max( dot( fogW, '+v3([SUN.x,SUN.y,SUN.z])+' ) / max( length( fogW ), 1e-4 ), 0.0 );\n\tfogTint = mix( fogColor, '+v3(FOG_S)+', fogS * fogS * fogS );\n#endif';
 S.fog_pars_fragment='#ifdef USE_FOG\n\tvarying float fogDepth;\n\tvarying vec3 fogTint;\n\tuniform float fogNear;\n\tuniform float fogFar;\n#endif';
 S.fog_fragment='#ifdef USE_FOG\n\tfloat fogFactor = 1.0 - ( 1.0 - smoothstep( fogNear, fogFar, fogDepth ) ) * exp( - fogDepth * .00045 );\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogTint, fogFactor );\n#endif';}
const scene=new T.Scene();
scene.fog=new T.Fog(0,Q.far*.2,Q.far);scene.fog.color.setRGB(FOG_A[0],FOG_A[1],FOG_A[2]);
const camera=new T.PerspectiveCamera(74,1,0.08,2600);
camera.rotation.order='YXZ';
scene.add(camera);
// skylight from a clear blue sky, warm bounce from sun-baked ground: shade falls cool blue-grey, sunlit faces warm
const hemi=new T.HemisphereLight(0xa5c3ea,0x8f8270,0.75);scene.add(hemi);
const sun=new T.DirectionalLight(0xffdcb4,2.4);scene.add(sun);scene.add(sun.target);
// desktop shadows: a 2048 map over 160 m, a little ahead of the camera (crisp edges; the low sun makes them long)
if(Q.shadows){sun.castShadow=true;const s=sun.shadow;s.mapSize.set(2048,2048);s.camera.left=-80;s.camera.right=80;s.camera.top=80;s.camera.bottom=-80;
  s.camera.near=20;s.camera.far=520;s.bias=-0.0004;s.normalBias=0.4;}
// the shadow box follows the view 35 m ahead and moves in whole shadow texels of the light's frame, so shadow edges never swim
const SBX=new T.Vector3().crossVectors(new T.Vector3(0,1,0),SUN).normalize(),SBY=new T.Vector3().crossVectors(SUN,SBX),_sf=new T.Vector3();
function sunFollow(x,z){camera.getWorldDirection(_sf);const hl=Math.hypot(_sf.x,_sf.z)||1,cx=x+_sf.x/hl*35,cz=z+_sf.z/hl*35,sc=sun.shadow.camera,tx=(sc.right-sc.left)/sun.shadow.mapSize.x;
  const a=Math.round((cx*SBX.x+cz*SBX.z)/tx)*tx,b=Math.round((cx*SBY.x+cz*SBY.z)/tx)*tx,c=cx*SUN.x+cz*SUN.z;
  _sf.copy(SBX).multiplyScalar(a).addScaledVector(SBY,b).addScaledVector(SUN,c);sun.target.position.copy(_sf);sun.position.copy(_sf).addScaledVector(SUN,260);sun.target.updateMatrixWorld();}
sunFollow(0,0);

const MAXA=Math.min(8,renderer.capabilities.getMaxAnisotropy());
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=MAXA;return t;}
// speckle: n tiny rects, each black or white at a random alpha. (fast) The alpha goes through globalAlpha and the colour string is
// only set when it changes (parsing a new rgba() string per rect was half the cost); same draws from rnd(), same picture.
function noise(g,w,h,n,a,x0,y0){x0=x0||0;y0=y0||0;if(n<=0)return;const ga=g.globalAlpha;let last=-1,al='';
  for(let k=0;k<n;k++){const b=rnd()<.5?0:1;al=(rnd()*a).toFixed(3);if(b!==last){g.fillStyle=b?'#ffffff':'#000000';last=b;}g.globalAlpha=ga*+al;
    g.fillRect(x0+rnd()*w,y0+rnd()*h,1+rnd()*2,1+rnd()*2);}
  g.globalAlpha=ga;g.fillStyle='rgba('+(last?'255,255,255,':'0,0,0,')+al+')';}
const L=o=>new T.MeshLambertMaterial(o);
// colour helpers: hex int -> shaded hex int
function shade(h,k){return(clamp(Math.round((h>>16&255)*k),0,255)<<16)|(clamp(Math.round((h>>8&255)*k),0,255)<<8)|clamp(Math.round((h&255)*k),0,255);}
function mixc(a,b,t){return(Math.round(lerp(a>>16&255,b>>16&255,t))<<16)|(Math.round(lerp(a>>8&255,b>>8&255,t))<<8)|Math.round(lerp(a&255,b&255,t));}
const css=h=>'#'+('00000'+h.toString(16)).slice(-6);

// ---------- static geometry
// Ground materials tile and are batched once for the whole map. Everything else is vertex-coloured and
// batched per 128 m chunk and material, so distant chunks are culled.
const CH=128,chunks=new Map(),globals=new Map();
let ANCH=null; // while set, all chunked geometry goes to the chunk of this point (keeps one object in one buffer)
// A material may be an alias of another (plain colours ride in the facade material, on a white texel), so they share buffers.
const WU=.003,WV=.003;
// (fast) A batch array: push() and length like a plain array, but kept in a typed array that doubles when full (much less copying
// and garbage than a growing JS array of 1.4M vertices). a.subarray(0,length) is the content. Positions and uvs end up as 32-bit
// floats anyway; normals and colours keep 64 bits until mkMesh (03c) quantizes them, so the numbers are exactly as before.
class VBuf{constructor(A){this.a=new A(96);this.length=0;}
  grow(n){let c=this.a.length*2;while(c<n)c*=2;const b=new this.a.constructor(c);b.set(this.a);this.a=b;}
  push(...v){const l=this.length,n=v.length;if(l+n>this.a.length)this.grow(l+n);const a=this.a;for(let j=0;j<n;j++)a[l+j]=v[j];return this.length=l+n;}
  view(){return this.a.subarray(0,this.length);}}
const vbP=()=>new VBuf(Float32Array),vbN=()=>new VBuf(Float64Array),vbI=()=>new VBuf(Uint32Array);
function bat(mat,x,z){
  if(!mat.userData.chunk){let b=globals.get(mat);if(!b){b={p:vbP(),n:vbN(),u:vbP(),i:vbI()};globals.set(mat,b);}return b;}
  if(mat.userData.alias)mat=mat.userData.alias;
  if(ANCH){x=ANCH[0];z=ANCH[1];}
  const key=Math.floor(x/CH)+','+Math.floor(z/CH);let m=chunks.get(key);if(!m){m=new Map();chunks.set(key,m);}
  let b=m.get(mat);if(!b){b={p:vbP(),n:vbN(),u:vbP(),c:vbN(),i:vbI(),mesh:null,uv:!!mat.map,det:[]};m.set(mat,b);}return b;}
function anchor(x,z,fn){const o=ANCH;ANCH=[x,z];try{return fn();}finally{ANCH=o;}}
// tiling ground quad (global batch)
function quad(mat,a,b,c,d,nx,ny,nz,u1,v1){const B=bat(mat,a[0],a[2]),k=B.p.length/3;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
  for(let q=0;q<4;q++)B.n.push(nx,ny,nz);
  B.u.push(0,0,u1,0,u1,v1,0,v1);B.i.push(k,k+1,k+2,k,k+2,k+3);}
// ground rectangle; large ones are cut into pieces of at most 160 m so that no triangle is huge
function flat(mat,x0,z0,x1,z1,y,rep){const nx=Math.max(1,Math.ceil((x1-x0)/160)),nz=Math.max(1,Math.ceil((z1-z0)/160));
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=lerp(x0,x1,i/nx),b=lerp(x0,x1,(i+1)/nx),c=lerp(z0,z1,j/nz),d=lerp(z0,z1,(j+1)/nz);
    quad(mat,[a,y,d],[b,y,d],[b,y,c],[a,y,c],0,1,0,(b-a)/rep,(d-c)/rep);}}
// vertex-coloured quad in a chunk batch; uv = atlas rectangle (u0,v0)-(u1,v1) when the material is textured
function quadC(mat,a,b,c,d,nx,ny,nz,col,u0,v0,u1,v1){const B=bat(mat,a[0],a[2]),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
  B.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz,nx,ny,nz);B.c.push(r,g,bl,r,g,bl,r,g,bl,r,g,bl);
  if(B.uv){if(mat.map&&u0!==undefined)B.u.push(u0,v0,u1,v0,u1,v1,u0,v1);else B.u.push(WU,WV,WU,WV,WU,WV,WU,WV);}
  B.i.push(k,k+1,k+2,k,k+2,k+3);}
// vertex-coloured box with its base at y (no bottom face); top can take its own colour
function boxC(mat,x,y,z,w,h,d,col,top,skip){const x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2,cs=shade(col,.93);
  if(skip!==1)quadC(mat,[x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],0,0,1,col);if(skip!==0)quadC(mat,[x1,y,z0],[x0,y,z0],[x0,y1,z0],[x1,y1,z0],0,0,-1,col);
  if(skip!==3)quadC(mat,[x1,y,z1],[x1,y,z0],[x1,y1,z0],[x1,y1,z1],1,0,0,cs);if(skip!==2)quadC(mat,[x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],-1,0,0,cs);
  quadC(mat,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,top===undefined?col:top);}
// append any BufferGeometry, transformed, with one colour (multiplied by the geometry's own vertex colours if present)
const _m4=new T.Matrix4(),_n3=new T.Matrix3(),_v=new T.Vector3(),_q=new T.Quaternion(),_e=new T.Euler(),_s=new T.Vector3(),_p=new T.Vector3();
function pushGeo(mat,geo,m4,col){_n3.getNormalMatrix(m4);const P=geo.attributes.position,N=geo.attributes.normal,U=geo.attributes.uv,Cc=geo.attributes.color,ix=geo.index;
  _v.setFromMatrixPosition(m4);const B=bat(mat,_v.x,_v.z),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255,tx=B.uv,own=!!mat.map&&!!U;
  if(P.isInterleavedBufferAttribute||N.isInterleavedBufferAttribute||(Cc&&Cc.isInterleavedBufferAttribute)||(own&&U.isInterleavedBufferAttribute)||(ix&&ix.isInterleavedBufferAttribute)){
    for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(m4);B.p.push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();B.n.push(_v.x,_v.y,_v.z);
      if(Cc)B.c.push(r*Cc.getX(i),g*Cc.getY(i),bl*Cc.getZ(i));else B.c.push(r,g,bl);if(tx){if(own)B.u.push(U.getX(i),U.getY(i));else B.u.push(WU,WV);}}}
  else{ // (fast) the same arithmetic as Vector3.applyMatrix4 / applyMatrix3 / normalize, on the plain arrays: identical numbers, no per-vertex calls
    const e=m4.elements,f=_n3.elements,pa=P.array,ps=P.itemSize,na=N.array,ns=N.itemSize,ca=Cc?Cc.array:null,cs=Cc?Cc.itemSize:0,ua=own?U.array:null,us=own?U.itemSize:0,bp=B.p,bn=B.n,bc=B.c,bu=B.u;
    const e0=e[0],e1=e[1],e2=e[2],e3=e[3],e4=e[4],e5=e[5],e6=e[6],e7=e[7],e8=e[8],e9=e[9],e10=e[10],e11=e[11],e12=e[12],e13=e[13],e14=e[14],e15=e[15];
    const f0=f[0],f1=f[1],f2=f[2],f3=f[3],f4=f[4],f5=f[5],f6=f[6],f7=f[7],f8=f[8];
    for(let i=0,n=P.count;i<n;i++){let x=pa[i*ps],y=pa[i*ps+1],z=pa[i*ps+2];const w=1/(e3*x+e7*y+e11*z+e15);
      bp.push((e0*x+e4*y+e8*z+e12)*w,(e1*x+e5*y+e9*z+e13)*w,(e2*x+e6*y+e10*z+e14)*w);
      x=na[i*ns];y=na[i*ns+1];z=na[i*ns+2];const nx=f0*x+f3*y+f6*z,ny=f1*x+f4*y+f7*z,nz=f2*x+f5*y+f8*z,q=1/(Math.sqrt(nx*nx+ny*ny+nz*nz)||1);
      bn.push(nx*q,ny*q,nz*q);
      if(ca)bc.push(r*ca[i*cs],g*ca[i*cs+1],bl*ca[i*cs+2]);else bc.push(r,g,bl);if(tx){if(ua)bu.push(ua[i*us],ua[i*us+1]);else bu.push(WU,WV);}}}
  const i0=B.i.length;if(ix){const ia=ix.array,bi=B.i;for(let i=0,n=ix.count;i<n;i++)bi.push(k+ia[i]);}else for(let i=0;i<P.count;i++)B.i.push(k+i);
  if(B.det){if(!geo.boundingSphere)geo.computeBoundingSphere();detMark(B,i0,geo.boundingSphere.radius*m4.getMaxScaleOnAxis());}}
// distance detail: a small object baked into a chunk remembers its index range and size, and the chunk drops it when it is far (03c)
function detMark(B,i0,size){if(!B.det||size>=DET_R[DET_R.length-1])return;const d=B.det,n=d.length;if(n&&d[n-1]===i0&&d[n-3]===size)d[n-1]=B.i.length;else d.push(size,i0,B.i.length);}
// convenience: place a geometry with position, y-rotation and scale (rx/rz optional)
function put(mat,geo,x,y,z,ry,sx,sy,sz,col,rx,rz){_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);
  _m4.compose(_p,_q,_s);pushGeo(mat,geo,_m4,col);}

// ---------- colliders (axis-aligned boxes in the town frame)
// kind: 0 generic, 1 building, 2 car, 3 barrel, 4 fuel pump, 5 low cover
const colliders=[],farCull=[];
// small stand-alone meshes (signs, flags, barrels) are hidden beyond the fog like the chunks
function addProp(m){scene.add(m);farCull.push(m);return m;}
function solid(x,z,w,d,h,y0,kind){const c={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y0||0,y1:(y0||0)+h,kind:kind||0,off:false,hp:0,ref:null,id:colliders.length};
  colliders.push(c);return c;}

// merge identical vertices of a non-indexed geometry (extrusions and polyhedra come without an index)
function weld(g){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,map=new Map(),p=[],n=[],u=[],ix=[],id=g.index,cnt=id?id.count:P.count;
  for(let i=0;i<cnt;i++){const k=id?id.getX(i):i,key=Math.round(P.getX(k)*400)+','+Math.round(P.getY(k)*400)+','+Math.round(P.getZ(k)*400)+','+Math.round(N.getX(k)*30)+','+Math.round(N.getY(k)*30)+','+Math.round(N.getZ(k)*30);
    let j=map.get(key);if(j===undefined){j=p.length/3;map.set(key,j);p.push(P.getX(k),P.getY(k),P.getZ(k));n.push(N.getX(k),N.getY(k),N.getZ(k));if(U)u.push(U.getX(k),U.getY(k));}ix.push(j);}
  const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(p,3));o.setAttribute('normal',new T.Float32BufferAttribute(n,3));if(U)o.setAttribute('uv',new T.Float32BufferAttribute(u,2));o.setIndex(ix);return o;}
// shared unit geometries for props (bases at y=0 unless noted)
function cylG(rt,rb,h,seg,open){const g=new T.CylinderGeometry(rt,rb,h,seg,1,!!open);g.translate(0,h/2,0);return g;}
const GEO={cyl8:cylG(1,1,1,8),cyl12:cylG(1,1,1,12),cyl6:cylG(1,1,1,6),taper:cylG(.7,1,1,8),cone8:new T.ConeGeometry(1,1,8),cone4:new T.ConeGeometry(1,1,4),
  sph:new T.SphereGeometry(1,10,7),sphLo:new T.SphereGeometry(1,7,5),dome:new T.SphereGeometry(1,12,6,0,TAU,0,PI/2),box:new T.BoxGeometry(1,1,1),
  tube8:cylG(1,1,1,8,true),tube6:cylG(1,1,1,6,true),rod:cylG(1,1,1,5,true),blob:new T.SphereGeometry(1,7,5),coneO:new T.ConeGeometry(1,1,8,1,true)};
GEO.coneO.translate(0,.5,0);
GEO.cone8.translate(0,.5,0);GEO.cone4.translate(0,.5,0);GEO.box.translate(0,.5,0);
