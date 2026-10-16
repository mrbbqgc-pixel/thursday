// =====================================================================
// 03c WORLD MESHES + NAVIGATION: chunk meshes and culling, spatial bins, rays, collision, flow fields, map image
// =====================================================================
const chunkMeshes=[];function freeArr(){this.array=null;}
// normals and colours of the static town are stored as bytes; the car paint stays in floats because wrecks rewrite it
function mkMesh(b,mat){const g=new T.BufferGeometry(),small=mat!==M.paint&&!!mat.userData.chunk;g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
  if(small){const n=new Int8Array(b.n.length);for(let i=0;i<n.length;i++)n[i]=Math.round(b.n[i]*127);g.setAttribute('normal',new T.BufferAttribute(n,3,true));}
  else g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));
  if(b.u.length)g.setAttribute('uv',new T.Float32BufferAttribute(b.u,2));
  if(b.c&&mat.vertexColors){if(small){const c=new Uint8Array(b.c.length);for(let i=0;i<c.length;i++)c[i]=Math.round(clamp(b.c[i],0,1)*255);g.setAttribute('color',new T.BufferAttribute(c,3,true));}
    else g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));}
  g.setIndex(b.i);
  // far versions of the index without the small objects (see detMark): one per distance tier
  if(b.det&&b.det.length){const L=[g.index];for(let t=0;t<DET_R.length;t++){const keep=new Uint8Array(b.i.length/3+1).fill(1),d=b.det;let n=0;for(let q=0;q<d.length;q+=3)if(d[q]<DET_R[t])for(let k=d[q+1]/3;k<d[q+2]/3;k++)keep[k]=0;
      const out=[];for(let k=0;k<b.i.length;k+=3)if(keep[k/3])out.push(b.i[k],b.i[k+1],b.i[k+2]);if(out.length===b.i.length){L.push(L[L.length-1]);continue;}
      const A=new (b.p.length/3>65535?Uint32Array:Uint16Array)(out),at=new T.BufferAttribute(A,1);at.onUpload(freeArr);L.push(at);}
    if(L.some(a=>a!==L[0])){g.userData.lod=L;g.userData.tier=0;}}
  b.p=b.n=b.u=b.c=b.i=null;if(mat!==M.paint)for(const k in g.attributes)g.attributes[k].onUpload(freeArr);const m=new T.Mesh(g,mat);m.matrixAutoUpdate=false;return m;}
globals.forEach((b,mat)=>{const m=mkMesh(b,mat);m.receiveShadow=true;m.frustumCulled=false;scene.add(m);});
chunks.forEach((mm,key)=>mm.forEach((b,mat)=>{if(!b.p.length)return;const m=mkMesh(b,mat);m.geometry.computeBoundingSphere();{const c=key.split(','),f=mat===M.frond?1:.5,u=m.geometry.userData;u.cx=(+c[0]+f)*CH;u.cz=(+c[1]+f)*CH;u.ce=CH*f*1.2;} // cell centre (cut-outs: 256 m squares, see cutA)m.castShadow=!!mat.userData.cast;m.receiveShadow=mat!==M.shade;if(mat===M.shade)m.renderOrder=2;
  b.mesh=m;scene.add(m);chunkMeshes.push(m);}));
// hide chunks beyond the fog
let viewFar=Q.far;
// fog and draw distance: the menu flyover sees farther than the player on foot
function setView(far,nearK){if(far===viewFar&&scene.fog.near===far*nearK)return;viewFar=far;scene.fog.near=far*nearK;scene.fog.far=far;}
// beyond the fog nothing is drawn; contact shadows and decals stop at SHADE_D; far chunks drop their small objects (DET_D, DET_R)
const SHADE_D=230;
function cullChunks(x,z){for(let k=0;k<chunkMeshes.length;k++){const m=chunkMeshes[k],g=m.geometry,s=g.boundingSphere,dx=s.center.x-x,dz=s.center.z-z,d2=dx*dx+dz*dz,r=viewFar+s.radius;
    m.visible=d2<r*r&&(m.material!==M.shade||d2<(SHADE_D+s.radius)*(SHADE_D+s.radius));
    if(m.visible&&g.userData.lod){const e=Math.hypot(g.userData.cx-x,g.userData.cz-z)-g.userData.ce;let t=0;while(t<DET_D.length&&e>DET_D[t])t++;if(t!==g.userData.tier){g.userData.tier=t;g.setIndex(g.userData.lod[t]);}}}
  const r2=(viewFar+40)*(viewFar+40);for(let k=0;k<farCull.length;k++){const m=farCull[k],dx=m.position.x-x,dz=m.position.z-z;if(m.parent)m.visible=dx*dx+dz*dz<r2;}}

// ---------- spatial bins (16 m cells) for rays and collision
const BS=16,BX0=-700,BZ0=-800,BW=139,BH=129,bins=[];for(let k=0;k<BW*BH;k++)bins.push([]);
function binAdd(c){c.st=0;const i0=clamp(Math.floor((c.x0-1-BX0)/BS),0,BW-1),i1=clamp(Math.floor((c.x1+1-BX0)/BS),0,BW-1),
  j0=clamp(Math.floor((c.z0-1-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((c.z1+1-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)bins[j*BW+i].push(c);}
colliders.forEach(binAdd);
const binAt=(x,z)=>bins[clamp(Math.floor((z-BZ0)/BS),0,BH-1)*BW+clamp(Math.floor((x-BX0)/BS),0,BW-1)];
let RHc=null,RHnx=0,RHny=0,RHnz=0,stamp=1;
// nearest hit distance along a ray (maxT if none); sets RHc (collider or null for ground) and the hit normal
function rayWorld(ox,oy,oz,dx,dy,dz,maxT){let best=maxT;RHc=null;RHnx=0;RHny=0;RHnz=0;
  if(dy<-1e-9){const t=-oy/dy;if(t<best){best=t;RHny=1;}}
  let ci=clamp(Math.floor((ox-BX0)/BS),0,BW-1),cj=clamp(Math.floor((oz-BZ0)/BS),0,BH-1);
  const sx=dx>0?1:-1,sz=dz>0?1:-1,fx=Math.abs(dx)>1e-9,fz=Math.abs(dz)>1e-9,tdx=fx?BS/Math.abs(dx):1e30,tdz=fz?BS/Math.abs(dz):1e30;
  let tmx=fx?((BX0+(ci+(dx>0?1:0))*BS)-ox)/dx:1e30,tmz=fz?((BZ0+(cj+(dz>0?1:0))*BS)-oz)/dz:1e30;const st=++stamp;
  for(;;){const list=bins[cj*BW+ci];
    for(let k=0;k<list.length;k++){const c=list[k];if(c.st===st||c.off)continue;c.st=st;let t0=0,t1=best,ax=-1,a,b,s;
      if(!fx){if(ox<c.x0||ox>c.x1)continue;}else{a=(c.x0-ox)/dx;b=(c.x1-ox)/dx;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=0;}if(b<t1)t1=b;if(t0>t1)continue;}
      if(!fz){if(oz<c.z0||oz>c.z1)continue;}else{a=(c.z0-oz)/dz;b=(c.z1-oz)/dz;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=2;}if(b<t1)t1=b;if(t0>t1)continue;}
      if(dy>-1e-9&&dy<1e-9){if(oy<c.y0||oy>c.y1)continue;}else{a=(c.y0-oy)/dy;b=(c.y1-oy)/dy;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=1;}if(b<t1)t1=b;if(t0>t1)continue;}
      best=t0;RHc=c;RHnx=ax===0?-sx:0;RHnz=ax===2?-sz:0;RHny=ax===1?(dy>0?-1:1):0;}
    const te=tmx<tmz?tmx:tmz;if(best<=te)break;
    if(tmx<tmz){ci+=sx;tmx+=tdx;if(ci<0||ci>=BW)break;}else{cj+=sz;tmz+=tdz;if(cj<0||cj>=BH)break;}}
  return best;}
function los(ax,ay,az,bx,by,bz){const dx=bx-ax,dy=by-ay,dz=bz-az,d=Math.hypot(dx,dy,dz);if(d<.05)return true;
  return rayWorld(ax,ay,az,dx/d,dy/d,dz/d,d)>=d-.04;}
function pushOut(e,r,feet){const list=binAt(e.x,e.z);for(let k=0;k<list.length;k++){const c=list[k];if(c.off||c.y0>feet+1.7||c.y1<feet+.25)continue;
  const nx=Math.max(c.x0,Math.min(e.x,c.x1)),nz=Math.max(c.z0,Math.min(e.z,c.z1));const dx=e.x-nx,dz=e.z-nz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
  if(d2>1e-8){const d=Math.sqrt(d2);e.x=nx+dx/d*r;e.z=nz+dz/d*r;}
  else{const l=e.x-c.x0,rt=c.x1-e.x,u=e.z-c.z0,dn=c.z1-e.z,m=Math.min(l,rt,u,dn);if(m===l)e.x=c.x0-r;else if(m===rt)e.x=c.x1+r;else if(m===u)e.z=c.z0-r;else e.z=c.z1+r;}}}
function floorAt(x,z,feet){let f=0;const list=binAt(x,z);for(let k=0;k<list.length;k++){const c=list[k];
  if(!c.off&&c.y0===0&&c.y1<=feet+.3&&c.y1>f&&x>c.x0-.15&&x<c.x1+.15&&z>c.z0-.15&&z<c.z1+.15)f=c.y1;}return f;}

// ---------- navigation grid (3 m cells) with windowed flow fields
const CELL=3,NX0=-560,NZ0=-720,NW=687,NH=647,blocked=new Uint8Array(NW*NH);
function blockCollider(c){if(c.y0>1.2||c.y1<.5)return;const w=c.x1-c.x0,d=c.z1-c.z0;
  if(Math.max(w,d)<1.6)return;                       // posts, trunks, crates: walked around, not routed around
  const thin=Math.min(w,d)<1.6,m=thin?.05:.7;        // walls, sandbags and barriers block every cell they touch
  const i0=Math.max(0,Math.floor((c.x0-m-NX0)/CELL)),i1=Math.min(NW-1,Math.floor((c.x1+m-NX0)/CELL)),j0=Math.max(0,Math.floor((c.z0-m-NZ0)/CELL)),j1=Math.min(NH-1,Math.floor((c.z1+m-NZ0)/CELL));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(thin){blocked[j*NW+i]=1;continue;}
    const x=NX0+(i+.5)*CELL,z=NZ0+(j+.5)*CELL;if(x>c.x0-.7&&x<c.x1+.7&&z>c.z0-.7&&z<c.z1+.7)blocked[j*NW+i]=1;}}
colliders.forEach(blockCollider);
const cellOf=(x,z)=>{const i=Math.floor((x-NX0)/CELL),j=Math.floor((z-NZ0)/CELL);return(i<0||j<0||i>=NW||j>=NH)?-1:j*NW+i;};
function makeField(whole){return{d:new Int16Array(NW*NH).fill(-1),q:new Int32Array(whole?NW*NH:42000),n:0,x:0,z:0};} // whole: a field that can cover the entire map (the test bot)
function flow(F,px,pz,maxD){const d=F.d,q=F.q;for(let k=0;k<F.n;k++)d[q[k]]=-1;F.n=0;F.x=px;F.z=pz;const s=cellOf(px,pz);if(s<0)return;
  let qh=0,qt=0;const cap=q.length-4;d[s]=0;q[qt++]=s;
  while(qh<qt){const c=q[qh++],dd=d[c]+1;if(dd>maxD||qt>cap)continue;const i=c%NW,j=(c-i)/NW;
    if(i>0&&d[c-1]<0&&!blocked[c-1]){d[c-1]=dd;q[qt++]=c-1;}
    if(i<NW-1&&d[c+1]<0&&!blocked[c+1]){d[c+1]=dd;q[qt++]=c+1;}
    if(j>0&&d[c-NW]<0&&!blocked[c-NW]){d[c-NW]=dd;q[qt++]=c-NW;}
    if(j<NH-1&&d[c+NW]<0&&!blocked[c+NW]){d[c+NW]=dd;q[qt++]=c+NW;}}
  F.n=qt;}
// unit direction that descends the field from (x,z); falls back to the straight line when off the field
const FD={x:0,z:0};
function flowDir(F,x,z){const c=cellOf(x,z),d=F.d;let bx=F.x-x,bz=F.z-z;const bl=Math.hypot(bx,bz)||1;bx/=bl;bz/=bl;
  if(c>=0){const i=c%NW,j=(c-i)/NW;let bd=d[c]<0?32767:d[c],bi=-1,bj=-1;
    for(let oj=-1;oj<=1;oj++)for(let oi=-1;oi<=1;oi++){if(!oi&&!oj)continue;const ni=i+oi,nj=j+oj;if(ni<0||nj<0||ni>=NW||nj>=NH)continue;
      const n=nj*NW+ni;if(blocked[n]||d[n]<0)continue;if(oi&&oj&&(blocked[j*NW+ni]||blocked[nj*NW+i]))continue;const dd=d[n]+(oi&&oj?.4:0);if(dd<bd){bd=dd;bi=ni;bj=nj;}}
    if(bi>=0){const tx=NX0+(bi+.5)*CELL-x,tz=NZ0+(bj+.5)*CELL-z,tl=Math.hypot(tx,tz)||1;bx=tx/tl;bz=tz/tl;}}
  FD.x=bx;FD.z=bz;return FD;}
// cells connected to the street network: nothing is ever spawned in a sealed yard, in a school or east of the freeway
const reach=new Uint8Array(NW*NH);{const q=new Int32Array(NW*NH);let qh=0,qt=0;
  for(const i of ISEC){if(i.x<BOUND.x0||i.x>BOUND.x1||i.z<BOUND.z0||i.z>BOUND.z1)continue;const s=cellOf(i.x,i.z);if(s>=0&&!blocked[s]&&!reach[s]){reach[s]=1;q[qt++]=s;}}
  while(qh<qt){const c=q[qh++],i=c%NW,j=(c-i)/NW;if(i>0&&!reach[c-1]&&!blocked[c-1]){reach[c-1]=1;q[qt++]=c-1;}if(i<NW-1&&!reach[c+1]&&!blocked[c+1]){reach[c+1]=1;q[qt++]=c+1;}
    if(j>0&&!reach[c-NW]&&!blocked[c-NW]){reach[c-NW]=1;q[qt++]=c-NW;}if(j<NH-1&&!reach[c+NW]&&!blocked[c+NW]){reach[c+NW]=1;q[qt++]=c+NW;}}}
function freeSpot(x,z){const c=cellOf(x,z);return c>=0&&!blocked[c]&&reach[c]===1&&x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<BOUND.z1&&x<fwX(z)+FWH+15&&!inQuiet(x,z);}

// ---------- map image (1 px per metre) used by the minimap and the tactical map
const MX0=-560,MZ0=-720,MAPW=2060,MAPH=1940,mapC=document.createElement('canvas');mapC.width=MAPW;mapC.height=MAPH;
{const g=mapC.getContext('2d'),X=x=>x-MX0,Z=z=>z-MZ0;g.fillStyle='#cfc3a4';g.fillRect(0,0,MAPW,MAPH);
 for(const r of MAPR){g.fillStyle=r[4];g.fillRect(X(r[0]),Z(r[1]),r[2]-r[0],r[3]-r[1]);}
 if(typeof hoodMap==='function')hoodMap(g,X,Z); // 02j-home hook: the curved streets and turned houses of the start block
 // the freeway, the tracks and the trail on top
 g.lineCap='round';g.strokeStyle='#bdb59f';g.lineWidth=2*FWH+28;g.beginPath();FWY.forEach((p,k)=>k?g.lineTo(X(p[0]),Z(p[1])):g.moveTo(X(p[0]),Z(p[1])));g.stroke();
 g.strokeStyle='#8d8a84';g.lineWidth=2*FWH;g.stroke();g.strokeStyle='#e2b93b';g.lineWidth=1.5;g.stroke();
 g.strokeStyle='#5d5650';g.lineWidth=3;g.setLineDash([6,4]);g.beginPath();g.moveTo(X(-1000),Z(TRK));g.lineTo(X(fwX(TRK)+60),Z(TRK));g.stroke();g.setLineDash([]);
 g.strokeStyle='#b07a4a';g.lineWidth=3;g.beginPath();g.moveTo(X(-1000),Z(trailZ(-1000)));g.lineTo(X(600),Z(trailZ(600)));g.lineTo(X(1400),Z(trailZ(1400)));g.stroke();
 g.fillStyle='#8a7a66';for(const c of colliders)if(c.kind===1)g.fillRect(X(c.x0),Z(c.z0),c.x1-c.x0,c.z1-c.z0);
 g.fillStyle='rgba(120,160,200,.25)';for(const q of QUIET)g.fillRect(X(q[0]),Z(q[1]),q[2]-q[0],q[3]-q[1]);
 // the playable edge
 g.strokeStyle='rgba(21,17,12,.35)';g.lineWidth=3;g.strokeRect(X(BOUND.x0),Z(BOUND.z0),BOUND.x1-BOUND.x0,BOUND.z1-BOUND.z0);}
