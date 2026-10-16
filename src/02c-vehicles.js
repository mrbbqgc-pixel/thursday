// =====================================================================
// 02c VEHICLES: cars of around 2000 built from side profiles (rounded noses and decks, wheel arches, a cabin in body colour with
// pillars and glass, hubbed wheels, bumpers and lights). Local frame of a vehicle: length along z with the front towards -z,
// width along x, wheels on y=0. Three levels of detail: 'full' (moving traffic), 'mid' (parked where people play), 'lo' (far lots,
// the freeway deck). Every vertex is either painted (body colour, or the second tone of a two-tone car) or keeps its own colour.
// =====================================================================
// a side profile extruded across the width (the weapons are built with it too)
function profile(pts,width,bevel,arches,cs){const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);
  if(arches){const y=pts[pts.length-1][1];for(const a of arches){s.lineTo(a+.43,y);s.absarc(a,y,.43,0,PI,false);}s.lineTo(pts[0][0],y);}
  s.closePath();const g=new T.ExtrudeGeometry(s,{depth:width-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:cs||3});
  g.translate(0,0,-(width-2*bevel)/2);g.rotateY(PI/2);return weld(g);}
GEO.wheel=new T.CylinderGeometry(1,1,1,9);GEO.wheel.rotateZ(PI/2);GEO.hub=new T.CylinderGeometry(1,1,1,6,1,true);GEO.hub.rotateZ(PI/2);GEO.wheelL=new T.CylinderGeometry(1,1,1,6,1,false);GEO.wheelL.rotateZ(PI/2);
// template: positions, normals, colours, paint mask (0 own colour, 1 body paint, 2 second tone), indices
function CT(){this.p=[];this.n=[];this.c=[];this.m=[];this.i=[];}
CT.prototype.v=function(x,y,z,nx,ny,nz,col,m){const k=this.p.length/3;this.p.push(x,y,z);this.n.push(nx,ny,nz);this.c.push((col>>16&255)/255,(col>>8&255)/255,(col&255)/255);this.m.push(m);return k;};
CT.prototype.q=function(a,b,c,d,nx,ny,nz,col,m){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];if((uy*vz-uz*vy)*nx+(uz*vx-ux*vz)*ny+(ux*vy-uy*vx)*nz<0){const t=b;b=d;d=t;}
  const k=this.v(a[0],a[1],a[2],nx,ny,nz,col,m);this.v(b[0],b[1],b[2],nx,ny,nz,col,m);this.v(c[0],c[1],c[2],nx,ny,nz,col,m);this.v(d[0],d[1],d[2],nx,ny,nz,col,m);this.i.push(k,k+1,k+2,k,k+2,k+3);};
CT.prototype.t=function(a,b,c,nx,ny,nz){const P=this.p,ux=P[3*b]-P[3*a],uy=P[3*b+1]-P[3*a+1],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vy=P[3*c+1]-P[3*a+1],vz=P[3*c+2]-P[3*a+2];
  if((uy*vz-uz*vy)*nx+(uz*vx-ux*vz)*ny+(ux*vy-uy*vx)*nz<0)this.i.push(a,c,b);else this.i.push(a,b,c);};
// extrude a side profile (closed outline of [L, y], L forwards) across the width +-hw. zone(L,y,ny) -> [colour, mask] for the walls,
// cap = [colour, mask] for the two flat sides; walls whose normals meet at less than about 40 degrees share smoothed normals.
function extrudeCT(t,pts,hw,cap,zone){const n=pts.length,P=pts.map(q=>new T.Vector2(q[0],q[1]));if(T.ShapeUtils.isClockWise(P)){P.reverse();pts=pts.slice().reverse();}
  const tri=T.ShapeUtils.triangulateShape(P,[]);
  for(const s of [-1,1]){const base=t.p.length/3;for(const q of pts)t.v(s*hw,q[1],-q[0],s,0,0,cap[0],cap[1]);for(const f of tri)t.t(base+f[0],base+f[1],base+f[2],s,0,0);}
  const en=[];for(let k=0;k<n;k++){const a=pts[k],b=pts[(k+1)%n],dl=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dl,dy)||1;en.push([dy/l,-dl/l]);} // outward normal in (L, y) for a CCW outline
  const zk=k=>{const a=pts[k],b=pts[(k+1)%n];return zone((a[0]+b[0])/2,(a[1]+b[1])/2,en[k][1]);};
  const vid=[];for(let k=0;k<n;k++){const pk=(k+n-1)%n,z0=zk(pk),z1=zk(k),sm=en[pk][0]*en[k][0]+en[pk][1]*en[k][1]>.76&&z0[0]===z1[0]&&z0[1]===z1[1];
    const mk=(e,z)=>{const nl=Math.hypot(e[0],e[1])||1;return[t.v(-hw,pts[k][1],-pts[k][0],0,e[1]/nl,-e[0]/nl,z[0],z[1]),t.v(hw,pts[k][1],-pts[k][0],0,e[1]/nl,-e[0]/nl,z[0],z[1])];};
    if(sm){const v=mk([en[pk][0]+en[k][0],en[pk][1]+en[k][1]],z1);vid.push([v,v]);}else vid.push([mk(en[pk],z0),mk(en[k],z1)]);}
  for(let k=0;k<n;k++){if(en[k][1]<-.7)continue;const a=vid[k][1],b=vid[(k+1)%n][0];t.i.push(a[0],b[0],b[1],a[0],b[1],a[1]);}}
// axle: an n-sided tyre across the car with a hub on each outer face. lv: 0 full (whole tread, a crisp hub), 1 lower tread and a hub fading
// to the rim, 2 lower tread and plain fans; ww: white walls (lowrider)
function axleCT(t,L,r,hw,n,hub,ww,lv){const ang=k=>k/n*TAU-PI/2+PI/n;
  for(let k=0;k<n;k++){const a0=ang(k),a1=ang(k+1),am=(a0+a1)/2,ny=Math.sin(am),nz=Math.cos(am);if(lv&&ny>.2)continue;
    t.q([-hw,r+Math.sin(a0)*r,-L+Math.cos(a0)*r],[hw,r+Math.sin(a0)*r,-L+Math.cos(a0)*r],[hw,r+Math.sin(a1)*r,-L+Math.cos(a1)*r],[-hw,r+Math.sin(a1)*r,-L+Math.cos(a1)*r],0,ny,nz,0x1d1c1b,0);}
  for(const s of [-1,1]){const x=s*(hw+.004),rings=ww?[[.55,hub],[.72,0xe8e6e0],[1,0x1d1c1b]]:lv===0?[[.62,mixc(hub,0x1d1c1b,.25)],[1,0x1d1c1b]]:[[1,0x1d1c1b]],ids=[];
    const c0=lv===2&&!ww?-1:t.v(x,r,-L,s,0,0,hub,0);
    for(const g of rings){const row=[];for(let k=0;k<n;k++)row.push(t.v(x,r+Math.sin(ang(k))*r*g[0],-L+Math.cos(ang(k))*r*g[0],s,0,0,g[1],0));ids.push(row);}
    const fan=(a,b,c)=>t.t(a,b,c,s,0,0);
    if(c0<0){for(let k=1;k<n-1;k++)fan(ids[0][0],ids[0][k],ids[0][k+1]);continue;}
    for(let k=0;k<n;k++){const j=(k+1)%n;fan(c0,ids[0][j],ids[0][k]);for(let q=0;q<ids.length-1;q++){fan(ids[q][k],ids[q][j],ids[q+1][j]);fan(ids[q][k],ids[q+1][j],ids[q+1][k]);}}}}
function archPts(out,a,r,y,degs){for(const d of degs){const t=d*PI/180;out.push([a+Math.cos(t)*r,y+Math.sin(t)*r]);}}
const VEH={};
// D: name, length, width, height, body outline (front at +L, from the front bumper's foot over the top to the rear's foot), cabin outline,
// wheel positions (L), wheel radius, beltline [L of B-pillar or null], options
{ const GLS=0x1f2a31,BUMP=0x4a4c4e,HEAD=0xeae4cc,TAIL=0xa3221b;
  const D=(name,len,wid,h,body,cab,wheels,wr,o)=>{o=o||{};const hw=wid/2,ch=hw-(o.tumble||.17),bump=o.bump===undefined?BUMP:o.bump,bl=len/2;
    const zone=(L,y,ny)=>((Math.abs(L)>bl-.14&&y<.62&&ny<.5)||(y<.36&&ny<-.2))?[bump,bump===null?1:0]:[0xffffff,1];
    const mk=tier=>{const t=new CT(),pts=[];const lo=tier==='lo',lv=tier==='full'?0:lo?2:1,ns=tier==='full'?8:tier==='mid'?7:5,degs=tier==='full'?[0,50,90,130,180]:[0,60,120,180];
      // body: the outline runs from the front foot over the top to the rear foot, then back along the bottom through the arches
      for(const q of body)pts.push(q);const yb=body[body.length-1][1];
      if(!lo){const ws=wheels.slice().sort((p,q)=>p-q);for(const a of ws){const r=wr+.09;pts.push([a-r,yb]);const tmp=[];archPts(tmp,a,r,yb,degs);for(let k=tmp.length-2;k>0;k--)pts.push(tmp[k]);pts.push([a+r,yb]);}}
      // the closing edge back to the front foot is implicit
      const fixed=[];for(const q of pts)fixed.push(q);extrudeCT(t,fixed.slice().reverse(),hw,[0xffffff,1],zone);
      // round the corners in plan: the nose and the tail are narrower than the flanks
      const ik=(hw-(o.round===undefined?.16:o.round))/hw;for(let k=0;k<t.p.length/3;k++)if(Math.abs(t.p[3*k+2])>bl-.1)t.p[3*k]*=ik;
      // cabin: glass all round, roof in the second tone, B-pillars (and the A and C pillars on the full model)
      extrudeCT(t,cab.slice().reverse(),ch,[GLS,0],(L,y,ny)=>ny>.95?[0xffffff,2]:[GLS,0]);
      const cy0=cab[0][1],cy1=Math.max(...cab.map(q=>q[1]))-.04;if(!lo)for(const b of o.pillars||[])for(const s of [-1,1]){const x=s*(ch+.006);t.q([x,cy0,-(b+.07)],[x,cy0,-(b-.07)],[x,cy1,-(b-.07)],[x,cy1,-(b+.07)],s,0,0,0xffffff,2);}
      // wheels
      const hub=o.hub||0xa8aaa8;for(const a of wheels)axleCT(t,a,wr,hw-.04,ns,hub,o.ww&&!lo,lv);
      // lights: headlamps and tail lamps on the end faces (one strip each on the cheap model)
      const fz=-(bl+.012),rz=bl+.012,hy=o.hy||[.56,.68],ty=o.ty||[.6,.76];
      if(lo){t.q([-hw+.14,hy[0],fz],[hw-.14,hy[0],fz],[hw-.14,hy[1],fz],[-hw+.14,hy[1],fz],0,0,-1,0x9a9886,0);t.q([hw-.12,ty[0],rz],[-hw+.12,ty[0],rz],[-hw+.12,ty[1],rz],[hw-.12,ty[1],rz],0,0,1,TAIL,0);}
      else{for(const s of [-1,1]){const x0=s>0?hw-.12:-hw+.12,x1=s>0?hw-.5:-hw+.5,a=Math.min(x0,x1),b=Math.max(x0,x1);t.q([a,hy[0],fz],[b,hy[0],fz],[b,hy[1],fz],[a,hy[1],fz],0,0,-1,HEAD,0);
          if(lv===0)t.q([b,ty[0],rz],[a,ty[0],rz],[a,ty[1],rz],[b,ty[1],rz],0,0,1,TAIL,0);}
        if(lv===0)t.q([-hw+.52,hy[0]+.01,fz-.002],[hw-.52,hy[0]+.01,fz-.002],[hw-.52,hy[1]-.01,fz-.002],[-hw+.52,hy[1]-.01,fz-.002],0,0,-1,o.grille||0x2a2b2c,0);
        else t.q([hw-.1,ty[0],rz],[-hw+.1,ty[0],rz],[-hw+.1,ty[1],rz],[hw-.1,ty[1],rz],0,0,1,TAIL,0);}
      if(o.bed){const b=o.bed;t.q([-hw+.1,b[1]+.005,-b[0]+b[2]/2],[hw-.1,b[1]+.005,-b[0]+b[2]/2],[hw-.1,b[1]+.005,-b[0]-b[2]/2],[-hw+.1,b[1]+.005,-b[0]-b[2]/2],0,1,0,0x232220,0);}
      if(tier==='full'){const mz=-(cab[0][0]-.15),my=cab[0][1]+.08;for(const s of [-1,1])t.q([s*(ch+.02),my,mz],[s*(hw+.14),my,mz],[s*(hw+.14),my+.14,mz],[s*(ch+.02),my+.14,mz],0,0,-1,0xffffff,1);}
      const g={p:new Float32Array(t.p),n:new Float32Array(t.n),c:new Float32Array(t.c),m:new Uint8Array(t.m),i:t.i};return g;};
    VEH[name]=Object.assign({len,wid,h,wheels,wr,full:mk('full'),mid:mk('mid'),lo:mk('lo')},o);};
  // 90s mid-size sedan: rounded nose, sloping glass, a short high deck
  D('sedan',4.75,1.78,1.4,[[2.4,.34],[2.4,.68],[2.28,.8],[1.0,.93],[-1.6,.95],[-2.33,.86],[-2.4,.66],[-2.37,.32]],
    [[1.02,.93],[.2,1.37],[-.15,1.4],[-.9,1.39],[-1.08,1.35],[-1.62,.95]],[1.42,-1.42],.33,{pillars:[-.35]});
  // full-size pickup: square nose, cab, a long bed
  D('pickup',5.3,1.92,1.78,[[2.65,.44],[2.66,.86],[2.56,1.03],[.95,1.1],[-2.64,1.1],[-2.66,.9],[-2.62,.42]],
    [[.95,1.1],[.6,1.66],[.45,1.7],[-.35,1.7],[-.42,1.66],[-.42,1.1]],[1.66,-1.55],.4,{bed:[-1.53,1.1,2.2],hy:[.66,.82],ty:[.7,.95],tumble:.12});
  // minivan: a one-box shape with a sloping nose
  D('minivan',4.95,1.88,1.74,[[2.48,.36],[2.5,.66],[2.38,.84],[1.25,1.06],[-2.35,1.08],[-2.5,.96],[-2.46,.34]],
    [[1.25,1.06],[.62,1.6],[.4,1.68],[-2.1,1.7],[-2.38,1.6],[-2.44,1.08]],[1.56,-1.5],.34,{pillars:[-.2,-1.25],ty:[.62,.98]});
  // sport utility: boxy with rounded corners, a tall cabin
  D('suv',4.75,1.86,1.84,[[2.36,.48],[2.38,.86],[2.28,1.02],[1.32,1.12],[-2.25,1.14],[-2.38,1.04],[-2.38,.5]],
    [[1.32,1.12],[.95,1.74],[.75,1.8],[-2.05,1.8],[-2.28,1.72],[-2.32,1.12]],[1.48,-1.46],.4,{pillars:[-.25,-1.25],hy:[.7,.84],ty:[.78,1.02],tumble:.13});
  // full-size van: a long box, the windows only up front
  D('van',4.95,1.9,1.98,[[2.46,.38],[2.47,.88],[2.38,1.1],[1.62,1.2],[-2.42,1.2],[-2.47,1.1],[-2.47,.38]],
    [[1.62,1.2],[1.15,1.86],[.95,1.92],[-2.38,1.92],[-2.44,1.86],[-2.44,1.2]],[1.5,-1.45],.36,{pillars:[.45],ty:[.7,1.05],tumble:.06});
  D('bus',11,2.6,3.1,[[5.5,.5],[5.52,1.2],[5.46,1.5],[-5.46,1.5],[-5.52,1.2],[-5.5,.5]],[[5.4,1.5],[5.36,2.5],[5.2,2.56],[-5.36,2.56],[-5.42,2.5],[-5.42,1.5]],[3.6,-3.4],.5,
    {pillars:[3.6,2,.4,-1.2,-2.8,-4.4],hy:[.7,.95],ty:[.75,1.1],tumble:.04});
  // lowrider: an older long, low sedan with a flat hood and deck, chrome wire wheels with white walls
  D('lowrider',5.1,1.9,1.3,[[2.55,.3],[2.56,.6],[2.46,.73],[.8,.79],[-2.45,.77],[-2.55,.62],[-2.55,.3]],
    [[.82,.79],[.25,1.24],[0,1.27],[-.95,1.27],[-1.05,1.24],[-1.28,.79]],[1.62,-1.58],.3,{pillars:[-.42],hub:0xe6e8ea,ww:1,bump:0xd8dadb,hy:[.5,.6],ty:[.5,.62],tumble:.14});}
const carCols=[0xb3261e,0xf4f0e7,0x2d4a6e,0x8a8f93,0x2b2621,0x3f6b4a,0xc9c2b0,0x7a3b1e,0xf4f0e7,0xd9d2c4,0x6d7f8c,0x9a2a22,0x2f5a5a,0xb9b4a6,0x5a2a4a,0xd8d0b8];
const cars=[];
let carLo=false; // set while far lots are filled: their cars use the cheapest model
const _cv=new T.Vector3(),_cn=new T.Vector3(),_cm=new T.Matrix4(),_cq=new T.Quaternion(),_cs=new T.Vector3(1,1,1),_cp=new T.Vector3(),_ce=new T.Euler(),_cn3=new T.Matrix3();
// write a template into a paint batch: paint goes on mask 1, the second tone on mask 2
function pushCar(B,g,x,y,z,ry,col,col2){_ce.set(0,ry,0);_cq.setFromEuler(_ce);_cp.set(x,y,z);_cm.compose(_cp,_cq,_cs);_cn3.getNormalMatrix(_cm);const k0=B.p.length/3,P=g.p,N=g.n,C=g.c,Mk=g.m,
  r1=(col>>16&255)/255,g1=(col>>8&255)/255,b1=(col&255)/255,r2=(col2>>16&255)/255,g2=(col2>>8&255)/255,b2=(col2&255)/255;
  for(let i=0;i<Mk.length;i++){_cv.set(P[3*i],P[3*i+1],P[3*i+2]).applyMatrix4(_cm);B.p.push(_cv.x,_cv.y,_cv.z);_cn.set(N[3*i],N[3*i+1],N[3*i+2]).applyMatrix3(_cn3).normalize();B.n.push(_cn.x,_cn.y,_cn.z);
    const m=Mk[i];if(m===1)B.c.push(C[3*i]*r1,C[3*i+1]*g1,C[3*i+2]*b1);else if(m===2)B.c.push(C[3*i]*r2,C[3*i+1]*g2,C[3*i+2]*b2);else B.c.push(C[3*i],C[3*i+1],C[3*i+2]);}
  for(const i of g.i)B.i.push(k0+i);}
// draws a vehicle into the paint batch of its chunk and remembers the vertex range, so a wreck can be recoloured in place.
// lite: falsy = full model, 1 = parked at street level, 2 = parked on a raised lot, true = the cheapest model; col2: second tone (roof and pillars)
function vehicle(type,x,z,alongX,col,dir,lite,low,ryO,yO,col2){const V=VEH[type],ry=ryO!==undefined?ryO:(alongX?PI/2:0)+(dir<0?PI:0),B=bat(M.paint,x,z),v0=B.p.length/3,yb=(lite===2?PADY:0)+(yO||0),ly0=(low&&type!=='lowrider'?-.12:0)+yb;
  {const bw=typeof carBorrow==='function'&&carBorrow(type,x,z,ry,ly0,col,col2===undefined?col:col2);if(bw)return Object.assign(bw,{w:alongX?V.len:V.wid,d:alongX?V.wid:V.len,h:V.h});} // (drive) a car you can borrow is a mesh of its own (06e), not baked
  anchor(x,z,()=>{pushCar(B,!lite?V.full:(lite===true||carLo)?V.lo:V.mid,x,ly0,z,ry,col,col2===undefined?col:col2);
    if(!yO)blob(x,z,alongX?V.len*.58:V.wid*.72,alongX?V.wid*.72:V.len*.58,lite===2?PADY:0);});
  return{B,v0,v1:B.p.length/3,x,z,w:alongX?V.len:V.wid,d:alongX?V.wid:V.len,h:V.h,type};}
const carType=()=>{const r=rnd();return r<.36?'sedan':r<.58?'pickup':r<.78?'minivan':r<.93?'suv':'van';};
// paint of a car that has stood in the sun for years: chalky and pale
const sunFade=c=>mixc(mixc(c,0x9a968e,.25),0xe2ded4,.3);
// a parked car is a destructible collider (its index is shared in multiplayer, so generation order must not depend on chance outside rnd())
function car(x,z,alongX,col,type,lite){type=type||carType();const low=type==='sedan'&&rnd()<.06;col=col===undefined?(low?pick([0x6a2a8a,0xb03a1e,0x1f5a8a]):pick(carCols)):col;const dir=rnd()<.5?1:-1;
  // the look (lowrider body, faded or two-tone paint) comes from the side stream, so the town's layout does not depend on it
  const lk=isoR(()=>{const o={t:low?'lowrider':type,c:col,c2:col};const k=rnd();
    if(low){o.c=pick([0x5a1e6e,0x7a1a2a,0x1f5a7a,0xb08a2a,0x2a6a5a,0x8a1e4a]);if(rnd()<.55)o.c2=pick([0xf4f0e7,0xe8dcc0,0x2b2621]);}
    else if(k<.16)o.c=o.c2=sunFade(col);else if(k<.24&&type!=='van')o.c2=pick([0xf4f0e7,0xc9c2b0,0x2b2621,0x8a8f93]);else if(k<.27){o.c=sunFade(col);o.c2=pick([0x8a8f93,0x6e6a64]);}
    return o;});
  const r=vehicle(lk.t,x,z,alongX,lk.c,dir,lite,low,undefined,undefined,lk.c2);
  const c=solid(x,z,r.w,r.d,type==='van'?1.9:type==='pickup'||type==='suv'||type==='minivan'?1.6:low?1.3:1.42,0,2);c.hp=260;c.ref=r;cars.push(c);return c;}
function bus(x,z,alongX){const r=vehicle('bus',x,z,alongX,0xe9e5da,1,1,false,undefined,undefined,0xe9e5da);solid(x,z,r.w,r.d,3,0,0);}
// burn a car out in place: char the paint and let the body sag
function wreck(r){const m=r.B.mesh;if(!m)return;const P=m.geometry.attributes.position,Cc=m.geometry.attributes.color;
  for(let i=r.v0;i<r.v1;i++){const k=.07+Math.random()*.1;Cc.setXYZ(i,k*1.15,k,k*.9);const y=P.getY(i);if(y>.5)P.setY(i,.5+(y-.5)*.8);}
  P.needsUpdate=true;Cc.needsUpdate=true;}
