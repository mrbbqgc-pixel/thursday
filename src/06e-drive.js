// =====================================================================
// 06e DRIVE: cars you can borrow, lowrider bikes parked round town, and other players' bikes and cars in multiplayer
// =====================================================================
// A few parked cars are borrowable (picked by position while the town is built, so every machine builds the same town): they are not
// baked into the chunk meshes but drawn as meshes of their own (one draw call each, plus a contact shadow when close), and their
// colliders move with them when they are parked somewhere else. Hold USE (F on a keyboard) near one to get in, hold it again to get out.
// Driving: W/S or the stick's up/down throttle, brake and reverse; A/D or the stick's left/right steer; Space is a handbrake. Up to
// about 25 m/s. No shooting from a car; damage taken inside is reduced. Walls stop the car (it slides along a glancing wall); people
// stop it too (the car is pushed back, nobody is run over). Chase camera (first person: the driver's seat); dragging the view looks round, it swings back.
// API: carEnter(k) carExit(how) (how: 0 get out beside it, 1 thrown out (killed inside), 2 let go where it stands: teleport, reset)
//   P.car (or null) DRV.cars driveUpdate(dt) carCamera(dt) carHurt(dmg) carsReset() vehStage(st) vehPack() vehRx(a) vehPuppet(pl,s,dt)
// Hooks elsewhere: 02c vehicle() (carBorrow), 02j anyCar (no baked shadow), 06b updPlayer/updCamera/hurt/updPicks, 06d updBikes,
// 08 stageStart/resetWorldState, 08d mpPack/mpState/mpSnap/mpApply/mpPuppets.

// While the town is built (02c vehicle() calls this, hoisted; nothing from this module exists yet): is the car at (x,z) one to borrow?
// The list is of positions (cars of the start block, strip malls, the Market Hall, Sierra Town Center, the Promenade, the ballpark, the
// outlets lot); a match is drawn by 06e, the caller bakes nothing.
function carBorrow(type,x,z,ry,y,col,col2){if(type==='bus'||y>1)return null;const S=carBorrow,L=S.L||(S.L=[]),
  W=S.W||(S.W=[[-57,-369],[-61,-386],[-80,-325],[-164,41],[-120,54],[-276,50],[83,162],[83,263],[152,-48],[202,-61],[1110,-180],[1188,-193],[446,-70],[615,67],[660,995],[647,1013],[515,1060]]);
  for(const w of W){if(w[2]||Math.abs(w[0]-x)>1.2||Math.abs(w[1]-z)>1.2)continue;w[2]=1;const o={type,x,z,ry,y,col,col2};L.push(o);return{B:{mesh:null},v0:0,v1:0,x,z,type,dyn:o};}
  return null;}

const DRV={cars:[],hold:0,latch:false,near:null,lookT:0,camYaw:0,camD:6,eng:null,rem:new Map(),init:false,
  on:'Hold <b>'+(isTouch?'USE':'F')+'</b> to drive',off:'Hold <b>'+(isTouch?'USE':'F')+'</b> to get out',VMAX:25,VREV:7};
const CAR_TYPES=['sedan','pickup','minivan','suv','van','lowrider'];
function carGeoD(type,col,col2){const B={p:[],n:[],c:[],i:[]};pushCar(B,VEH[type].full,0,0,0,0,col,col2);const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(B.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(B.n,3));g.setAttribute('color',new T.Float32BufferAttribute(B.c,3));g.setIndex(B.i);
  g.computeBoundingSphere();return g;}
// a car facing -z with its contact shadow: two draw calls close up, one further off
function carModel(type,col,col2){const V=VEH[type],g=new T.Group(),m=new T.Mesh(carGeoD(type,col,col2),M.paint);m.castShadow=true;g.add(m);
  const sh=new T.Mesh(footGeo,footShade);sh.scale.set(V.wid*1.3/1.5,1,V.len*1.16/1.5);sh.position.y=.02;sh.renderOrder=2;g.add(sh);g.userData.m=m;g.userData.sh=sh;return g;}
if(typeof P!=='undefined'){P.car=null; // (the static-world test runs this file without the game around it)
  for(const c of cars){const o=c.ref&&c.ref.dyn;if(!o)continue;const g=carModel(o.type,o.col,o.col2);g.position.set(o.x,o.y,o.z);g.rotation.y=o.ry;scene.add(g);
    c.ref.B.mesh=g.userData.m;c.ref.v1=g.userData.m.geometry.attributes.position.count; // a wreck (06a) chars this mesh
    DRV.cars.push({c,o,V:VEH[o.type],g,x:o.x,z:o.z,y:o.y,yaw:o.ry,vx:0,vz:0,steer:0,ok:true,cells:null,home:[o.x,o.z,o.ry,o.y,c.x0,c.z0,c.x1,c.z1]});}
  // lowrider bikes parked round town: the start block (one by the start house's garage), the parks, the strip malls, the Market Hall,
  // the Promenade, the station, the outlets, and both ends of the Pacific Electric Trail (clear of the stage-5 chase)
  for(const q of [[-56.4,-373.8,2.5],[-77,-347,0],[-150,21,1.6],[62,172,0],[1140,-98,1.6],[-350,trailZ(-350)+3.5,-1.57],[900,trailZ(900)+3.5,1.57],[318,-206,.4],
    [-205,-160,2],[452,-575,-1],[600,1020,1.6],[430,465,0],[198,-20,1]]){const p=bikeSpot(q[0],q[1]);if(!p)continue;const b=spawnBike(p[0],p[1],q[2],BIKE_COLS[bikes.length%BIKE_COLS.length]);b.world=true;b.home=[b.x,b.z,b.yaw];}}
// a clear spot for a parked bike near (x,z): nothing within 0.7 m
function bikeSpot(x,z){const pr={x:0,z:0};for(let r=0;r<6;r+=.5)for(let k=0;k<(r?12:1);k++){const a=k/12*TAU;pr.x=x+Math.cos(a)*r;pr.z=z+Math.sin(a)*r;pushOut(pr,.7,0);
  if(Math.hypot(pr.x-x-Math.cos(a)*r,pr.z-z-Math.sin(a)*r)<.01&&floorAt(pr.x,pr.z,0)<.3)return[pr.x,pr.z];}return null;}

// ---------- colliders that move: out of the spatial bins and back in; a parked car's cells leave the navigation grid
function binDel(c){const i0=clamp(Math.floor((c.x0-1-BX0)/BS),0,BW-1),i1=clamp(Math.floor((c.x1+1-BX0)/BS),0,BW-1),j0=clamp(Math.floor((c.z0-1-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((c.z1+1-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const l=bins[j*BW+i],k=l.indexOf(c);if(k>=0)l.splice(k,1);}}
function carCells(k,on){if(!on){if(k.cells)for(const q of k.cells)blocked[q]=0;k.cells=null;return;}if(k.cells)return;const c=k.c;k.cells=[];
  for(let j=Math.floor((c.z0-NZ0)/CELL);j<=Math.floor((c.z1-NZ0)/CELL);j++)for(let i=Math.floor((c.x0-NX0)/CELL);i<=Math.floor((c.x1-NX0)/CELL);i++){if(i<0||j<0||i>=NW||j>=NH)continue;
    const q=j*NW+i,x=NX0+(i+.5)*CELL,z=NZ0+(j+.5)*CELL;if(!blocked[q]&&x>c.x0-.3&&x<c.x1+.3&&z>c.z0-.3&&z<c.z1+.3){blocked[q]=1;k.cells.push(q);}}}
// park car k where it stands: its collider is the box round its footprint (as for the cars parked at an angle in 02j)
function carPark(k){const c=k.c,V=k.V,cy=Math.abs(Math.cos(k.yaw)),sy=Math.abs(Math.sin(k.yaw)),w=(cy*V.wid+sy*V.len)*.86,d=(sy*V.wid+cy*V.len)*.86;
  binDel(c);c.x0=k.x-w/2;c.x1=k.x+w/2;c.z0=k.z-d/2;c.z1=k.z+d/2;c.off=false;binAdd(c);carCells(k,true);}
function carsReset(){if(P.car)carExit(2);vehUi();for(const k of DRV.cars){if(k.c.wrecked)continue;const h=k.home;carCells(k,false);binDel(k.c);
  k.x=h[0];k.z=h[1];k.yaw=h[2];k.y=h[3];k.c.x0=h[4];k.c.z0=h[5];k.c.x1=h[6];k.c.z1=h[7];k.c.off=false;binAdd(k.c);k.vx=k.vz=0;k.steer=0;carPose(k);}}
function carPose(k){k.g.position.set(k.x,k.y,k.z);k.g.rotation.set(0,k.yaw,0);}

// ---------- every frame of play (from updBikes, or from driveUpdate in a car): culling, the USE latch, the first-frame checks
// the touch layout while driving or riding (00-page.html: body.drv, body.ride)
function vehUi(){const d=!!P.car,r=!!P.bike;if(DRV.ui!==(d?2:r?1:0)){DRV.ui=d?2:r?1:0;document.body.classList.toggle('drv',d);document.body.classList.toggle('ride',r);}}
function vehFrame(dt){if(!IN.useHeld)DRV.latch=false;vehUi();
  if(!DRV.init){DRV.init=true; // nothing to borrow next to an objective you hold USE at (the command post's generator)
    const pl=ST.filter(t=>t.type==='plant');for(const k of DRV.cars)if(pl.some(t=>Math.hypot(t.x-k.x,t.z-k.z)<45))k.ok=false;for(const b of bikes)if(b.world&&pl.some(t=>Math.hypot(t.x-b.x,t.z-b.z)<45))b.off=true;}
  const cx=camera.position.x,cz=camera.position.z;
  for(const k of DRV.cars){const d=Math.hypot(k.x-cx,k.z-cz);k.g.visible=d<200||k===P.car;k.g.userData.sh.visible=d<75;}
  for(const b of bikes)if(b.world)b.g.visible=!b.off&&(b.riding||Math.hypot(b.x-cx,b.z-cz)<140);
  if(DRV.rem.size){const now=performance.now();for(const [id,e] of DRV.rem){if(!MP.on||!MP.players.has(id)){scene.remove(e.g);DRV.rem.delete(id);}else if(now-e.seen>600)e.g.visible=false;}}}
// the borrowable car whose door (or body) is within reach, and how far
const _dn={k:null,d:0};
function carNear(){if(P.car||P.bike||!P.alive)return null;let best=null,bd=2.1;
  for(const k of DRV.cars){if(!k.ok||k.c.wrecked||!k.g.visible)continue;const dx=P.x-k.x,dz=P.z-k.z;if(Math.abs(dx)>6||Math.abs(dz)>6)continue;
    const fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw),lf=dx*fx+dz*fz,lr=dx*-fz+dz*fx,hl=k.V.len/2,hw=k.V.wid/2,
      body=Math.hypot(Math.max(0,Math.abs(lf)-hl),Math.max(0,Math.abs(lr)-hw))+.9,door=Math.hypot(lf-.25,lr+hw+.45),d=Math.min(body,door);
    if(d<bd){bd=d;best=k;}}
  if(!best)return null;_dn.k=best;_dn.d=bd;return _dn;}
function carPrompt(k,dt){G.prompt=DRV.on;if(IN.useHeld&&!DRV.latch){DRV.hold+=dt;if(DRV.hold>.35)carEnter(k);}else DRV.hold=0;}

// ---------- getting in and out
function carEnter(k){if(P.car||P.bike||!P.alive||!k||k.c.wrecked)return false;P.car=k;k.c.off=true;carCells(k,false);DRV.hold=0;DRV.latch=true;RIDE.hold=0;
  k.vx=k.vz=0;k.steer=0;k.y=Math.min(k.y,.05);P.x=k.x;P.z=k.z;P.y=0;P.vx=P.vz=P.vy=0;P.crouching=false;P.crouch=0;P.sprinting=false;P.wantAds=false;P.ads=0;cancelReload();IN.fire=false;
  P.yaw=k.yaw;P.pitch=-.17;DRV.camYaw=k.yaw;DRV.lookT=0;DRV.camD=Math.min(DRV.camD,4);carDoor(k.x,k.z);return true;}
function carExit(how){const k=P.car;if(!k)return false;how=how|0;
  if(how!==2){const p=exitSpot(k);if(!p&&how===0){toast('NO ROOM TO GET OUT');DRV.latch=true;return false;}P.car=null;carPark(k);if(p){P.x=p[0];P.z=p[1];}else pushOut(P,.45,0);}
  else{P.car=null;carPark(k);}
  P.y=0;P.vx=P.vz=P.vy=0;P.speed=0;k.vx=k.vz=0;k.steer=0;DRV.hold=0;DRV.latch=true;VIEW.d=.5;engSound(0,0);vehUi();if(how!==2)carDoor(k.x,k.z);return true;}
// beside the driver's door if there is room there, else the other door, the ends, a little further out
function exitSpot(k){const fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw),rx=-fz,rz=fx,hl=k.V.len/2,hw=k.V.wid/2,pr={x:0,z:0},C=[];
  for(const o of [.8,1.6,2.6])C.push([-.25,-(hw+o)],[-.25,hw+o],[hl+o,0],[-(hl+o),0],[1.2,-(hw+o)],[1.2,hw+o]);
  for(const strict of [true,false])for(const q of C){const x=k.x+fx*q[0]+rx*q[1],z=k.z+fz*q[0]+rz*q[1];if(x<BOUND.x0+1||x>BOUND.x1-1||z<BOUND.z0+1||z>BOUND.z1-1)continue;
    pr.x=x;pr.z=z;pushOut(pr,.5,0);if(Math.hypot(pr.x-x,pr.z-z)>.02||floorAt(x,z,0)>.3)continue;if(strict&&!freeSpot(x,z))continue;
    if(rayWorld(k.x,1,k.z,x-k.x,0,z-k.z,1)<.98)continue; // (rayWorld takes a direction; this one is unnormalised, so t is a fraction of the way)
    DRV.exitFree=strict;return[x,z];}
  for(let r=3.5;r<8;r+=1.5)for(let q=0;q<16;q++){const x=k.x+Math.cos(q/16*TAU)*r,z=k.z+Math.sin(q/16*TAU)*r;pr.x=x;pr.z=z;pushOut(pr,.5,0); // a wider ring, as a last resort
    if(Math.hypot(pr.x-x,pr.z-z)<.02&&floorAt(x,z,0)<.3&&x>BOUND.x0+1&&x<BOUND.x1-1&&z>BOUND.z0+1&&z<BOUND.z1-1){DRV.exitFree=freeSpot(x,z);return[x,z];}}
  return null;}
// damage inside a car: reduced; a hit that would kill throws you out first, so you go down on the street
function carHurt(dmg){dmg*=.6;if(P.alive&&G.state==='play'&&P.hp-dmg*G.dmgK<=0&&!(MP.on&&P.spawnT>0)){const k=P.car;if(!carExit(1)&&P.car)carExit(2);if(k)P.yaw=k.yaw;}return dmg;}
// mission stages: a warp or the trail chase gets you out first (08 stageStart)
function vehStage(st){const far=st.warp&&farFrom(st.spawn);if(P.car&&(far||st.type==='chase')){if(!carExit(0))carExit(2);}if(P.bike&&P.bike.world&&far)dismountBike(0);}

// ---------- driving (from updPlayer, instead of walking)
const _cb={x:0,z:0};
function driveUpdate(dt){const k=P.car,V=k.V;vehFrame(dt);
  if(!P.alive){carExit(1);return;}
  if(Math.hypot(P.x-k.x,P.z-k.z)>4){carExit(2);return;} // moved by a respawn or a restart: the car stays where it was
  IN.jump=IN.crouchT=IN.reload=IN.swap=IN.nade=IN.melee=false;IN.fire=false;P.wantAds=false;P.ads=0;P.fireT=Math.max(P.fireT,.2);if(P.sprintLock>0)P.sprintLock-=dt;
  let f=clamp(IN.f,-1,1),s=clamp(IN.s,-1,1);const hb=!!(typeof keys!=='undefined'&&keys.Space);
  // hold USE: brake, and get out once slow
  if(IN.useHeld&&!DRV.latch){f=0;const sp=Math.hypot(k.vx,k.vz);if(sp>3)k.vx*=Math.exp(-3*dt),k.vz*=Math.exp(-3*dt);else{DRV.hold+=dt;if(DRV.hold>.35){if(carExit(0))return;}}}else DRV.hold=0;
  let fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw),rx=-fz,rz=fx,vf=k.vx*fx+k.vz*fz,vl=k.vx*rx+k.vz*rz;
  let a=0;if(f>.05)a=vf<-.4?14*f:8.5*f*(1-Math.pow(clamp(vf/(DRV.VMAX+.5),0,1),2));else if(f<-.05)a=vf>.4?14*f:vf>-DRV.VREV?5*f:0;
  const sg=vf>0?1:vf<0?-1:0;a-=sg*(.35+.0016*vf*vf+(hb?6:0));const v0=vf;vf+=a*dt;
  if(sg&&Math.sign(vf)!==sg&&!(f*sg<-.05&&Math.abs(v0)<.45))vf=0; // brakes and drag stop the car; they do not push it back
  if(Math.abs(f)<.05&&Math.abs(vf)<.15)vf=0;vl*=Math.exp(-(hb?1.4:9)*dt);
  k.steer+=(s-k.steer)*Math.min(1,dt*(Math.abs(s)>Math.abs(k.steer)?5:8));const ang=k.steer*lerp(.62,.16,clamp(Math.abs(vf)/DRV.VMAX,0,1));
  k.yaw-=vf*Math.tan(ang)/2.75*(hb?1.45:1)*dt;
  fx=-Math.sin(k.yaw);fz=-Math.cos(k.yaw);rx=-fz;rz=fx;k.vx=fx*vf+rx*vl;k.vz=fz*vf+rz*vl;
  // move in short steps so that nothing thin is skipped at speed; walls and people push back
  const dist=Math.hypot(k.vx,k.vz)*dt,n=Math.max(1,Math.ceil(dist/.3));let imp=0,ix=0,iz=0;
  for(let q=0;q<n;q++){k.x=clamp(k.x+k.vx*dt/n,BOUND.x0+2,BOUND.x1-2);k.z=clamp(k.z+k.vz*dt/n,BOUND.z0+2,BOUND.z1-2);
    for(let it=0;it<3;it++){if(!carSolids(k))break;const vn=k.vx*_cb.x+k.vz*_cb.z;if(vn<0){if(-vn>imp){imp=-vn;ix=_cb.x;iz=_cb.z;}k.vx-=1.25*vn*_cb.x;k.vz-=1.25*vn*_cb.z;k.vx*=.97;k.vz*=.97;}}
    carPeople(k);}
  if(imp>3.5){shake=Math.max(shake,clamp(imp/22,.12,.6));const hx=k.x-ix*k.V.wid*.5,hz=k.z-iz*k.V.wid*.5;dust(hx,.6,hz,imp>9?3:1);if(imp>9){sndBobo('thud',hx,hz);if(imp>11)spark(hx,.7,hz);}else sndUi('hit');
    if(imp>16)hurt((imp-16)*2.2,hx,hz);}
  k.y+=(.05-k.y)*Math.min(1,dt*4);P.x=k.x;P.z=k.z;P.y=0;P.vx=k.vx;P.vz=k.vz;P.speed=Math.hypot(k.vx,k.vz);P.ground=true;P.crouch=0;
  carPose(k);k.g.rotation.z=clamp(-k.steer*vf*.004,-.05,.05);k.g.rotation.x=clamp(-a*.0025,-.025,.03);
  P.hurtT+=dt;if(P.hurtT>4.5&&P.hp<100)P.hp=Math.min(100,P.hp+20*dt);if(Math.hypot(P.x-P.stillX,P.z-P.stillZ)>3.5){P.stillX=P.x;P.stillZ=P.z;P.stillT=0;}else P.stillT+=dt;
  if(P.flashT>0)P.flashT-=dt;flash.visible=false;tpFlash.visible=false;P.recoil=0;P.kick*=Math.exp(-dt*13);P.punch*=Math.exp(-dt*7);P.roll*=Math.exp(-dt*6);
  engSound(1,Math.abs(vf),f);if(P.speed>12)noiseEvent(P.x,P.z,25,true);
  if(isTouch||P.speed<4||DRV.hold>0)G.prompt=DRV.off;} // (on a keyboard only when slow: the prompt would sit on the car; on a phone it is beside USE)
// static colliders against the car's box (separating axes: x, z and the car's own two): the deepest overlap pushes the car out.
// Returns true and the push direction in _cb when there was one. Kerbs and pads (under 0.35 m), awnings and roofs (from 1.3 m) do not count.
function carSolids(k){const fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw),rx=-fz,rz=fx,hl=k.V.len/2*.96,hw=k.V.wid/2*.94,st=++stamp;let best=0,bx=0,bz=0,hit=false;
  for(let p=0;p<5;p++){const px=k.x+(p===0?0:(p<3?1:-1)*fx*hl+(p%2?1:-1)*rx*hw),pz=k.z+(p===0?0:(p<3?1:-1)*fz*hl+(p%2?1:-1)*rz*hw),list=binAt(px,pz);
    for(let q=0;q<list.length;q++){const c=list[q];if(c.st===st)continue;c.st=st;if(c.off||c===k.c||c.y1<.35||c.y0>1.3)continue;
      const ex=(c.x1-c.x0)/2,ez=(c.z1-c.z0)/2,dx=(c.x0+c.x1)/2-k.x,dz=(c.z0+c.z1)/2-k.z;if(Math.abs(dx)>ex+hl+.1||Math.abs(dz)>ez+hl+.1)continue;
      let mo=1e9,mx=0,mz=0;
      for(let ax=0;ax<4;ax++){const axx=ax===0?1:ax===1?0:ax===2?fx:rx,azz=ax===0?0:ax===1?1:ax===2?fz:rz,
          ra=hl*Math.abs(fx*axx+fz*azz)+hw*Math.abs(rx*axx+rz*azz),rb=ex*Math.abs(axx)+ez*Math.abs(azz),dd=dx*axx+dz*azz,o=ra+rb-Math.abs(dd);
        if(o<=0){mo=-1;break;}if(o<mo){mo=o;const sgn=dd>0?-1:1;mx=axx*sgn;mz=azz*sgn;}}
      if(mo>0&&mo>best){best=mo;bx=mx;bz=mz;hit=true;}}}
  if(!hit)return false;k.x+=bx*(best+.002);k.z+=bz*(best+.002);_cb.x=bx;_cb.z=bz;return true;}
// people, dogs, other players and moving traffic: circles. The car is pushed back off them and stops; nobody is run over.
// (A car standing still is left alone: whoever walks into it is moved aside instead.)
function carPeople(k){const fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw),rx=-fz,rz=fx,hl=k.V.len/2,hw=k.V.wid/2,moving=Math.hypot(k.vx,k.vz)>.6;
  const one=(e,ex,ez,r,y)=>{if(y>1.2)return;const dx=ex-k.x,dz=ez-k.z;if(Math.abs(dx)>hl+r+.5||Math.abs(dz)>hl+r+.5)return;const lf=dx*fx+dz*fz,lr=dx*rx+dz*rz,pf=hl+r-Math.abs(lf),pr=hw+r-Math.abs(lr);if(pf<=0||pr<=0)return;
    if(!moving&&e){const m=pf<pr?pf:pr,sx=pf<pr?fx*Math.sign(lf):rx*Math.sign(lr),sz=pf<pr?fz*Math.sign(lf):rz*Math.sign(lr);e.x+=sx*m;e.z+=sz*m;pushOut(e,.4,0);return;}
    let nx,nz,m;if(pf<pr){m=pf;nx=-fx*Math.sign(lf);nz=-fz*Math.sign(lf);}else{m=pr;nx=-rx*Math.sign(lr);nz=-rz*Math.sign(lr);}
    k.x+=nx*m;k.z+=nz*m;const vn=k.vx*nx+k.vz*nz;if(vn<0){k.vx-=1.1*vn*nx;k.vz-=1.1*vn*nz;k.vx*=.6;k.vz*=.6;}};
  for(let L=0;L<3;L++){const A=L===0?foes:L===1?allies:(typeof civs!=='undefined'?civs:[]);for(let i=0;i<A.length;i++){const e=A[i];if(!e.alive||e.gone||e.remote||(e.g&&!e.g.visible))continue;one(e,e.x,e.z,e.kind==='bobo'?.75:.42,e.y0||0);}}
  if(typeof dogs!=='undefined')for(const d of dogs)if(d.on)one(null,d.x,d.z,.35,0);
  if(MP.on)for(const L of [MP.rivals,MP.mates])for(const s of L){if(!s.alive)continue;if(s.inCar){const e=DRV.rem.get(s.pid);if(e){const ff=-Math.sin(e.yaw),fz2=-Math.cos(e.yaw),q=VEH[e.type].len/4,r=VEH[e.type].wid/2;one(null,s.x+ff*q,s.z+fz2*q,r,0);one(null,s.x-ff*q,s.z-fz2*q,r,0);}}else one(null,s.x,s.z,.42,s.y0||0);}
  if(typeof traffic!=='undefined')for(const c of traffic){if(!c.on)continue;const ff=-Math.sin(c.yaw),fz2=-Math.cos(c.yaw),q=c.V.len/4,r=c.V.wid/2;one(null,c.x+ff*q,c.z+fz2*q,r,0);one(null,c.x-ff*q,c.z-fz2*q,r,0);}}

// ---------- the camera: in third person a chase camera behind and above, swinging round behind the car as it drives; dragging the
// view looks round for a moment. Pulled in when a wall is behind. In first person the driver's seat (VIEW switches).
function carCamera(dt){const k=P.car,sp=Math.hypot(k.vx,k.vz);VIEW.on=true;VIEW.sc=0;gunRoot.visible=false;PAV.g.visible=false;tpFlash.visible=false;
  if(Math.abs(angDiff(P.yaw,DRV.camYaw))>.002)DRV.lookT=1.4;else if(DRV.lookT>0)DRV.lookT-=dt;
  const vf=k.vx*-Math.sin(k.yaw)+k.vz*-Math.cos(k.yaw),back=vf<-2.5&&IN.f<-.2,want=k.yaw+(back?PI:0),fol=DRV.lookT>0?0:clamp(sp/4,.35,1)*3;
  P.yaw+=angDiff(want,P.yaw)*Math.min(1,dt*fol);if(DRV.lookT<=0)P.pitch+=((viewTP()?-.17:-.06)-P.pitch)*Math.min(1,dt*2);P.pitch=clamp(P.pitch,-.85,.35);DRV.camYaw=P.yaw;
  if(!viewTP()){const fx=-Math.sin(k.yaw),fz=-Math.cos(k.yaw); // first person: the driver's seat, looking over the hood
    camera.position.set(k.x+fx*.05+fz*.36,k.y+k.V.h*.78,k.z+fz*.05-fx*.36);camera.rotation.set(P.pitch+P.punch,P.yaw,0);const fv=P.baseFov+clamp(sp/DRV.VMAX,0,1)*6;
    if(Math.abs(camera.fov-fv)>.02){camera.fov+=(fv-camera.fov)*Math.min(1,dt*6);camera.updateProjectionMatrix();}return;}
  const cp=Math.cos(P.pitch),dx=Math.sin(P.yaw)*cp,dy=-Math.sin(P.pitch),dz=Math.cos(P.yaw)*cp,D=lerp(6.2,7.4,clamp(sp/DRV.VMAX,0,1)),tx=k.x,ty=k.y+1.55,tz=k.z,
    t=rayWorld(tx,ty,tz,dx,dy,dz,D+.3),want2=t<D+.3?Math.max(1.2,t-.35):D;
  if(want2<DRV.camD)DRV.camD=want2;else DRV.camD+=(want2-DRV.camD)*Math.min(1,dt*3);
  const sh=shake?shake*.07:0;camera.position.set(tx+dx*DRV.camD+(sh?R2(-sh,sh):0),Math.max(.6,ty+dy*DRV.camD)+(sh?R2(-sh,sh):0),tz+dz*DRV.camD+(sh?R2(-sh,sh):0));
  camera.rotation.set(P.pitch+P.punch,P.yaw,0);const fov=P.baseFov*.9+clamp(sp/DRV.VMAX,0,1)*9;
  if(Math.abs(camera.fov-fov)>.02){camera.fov+=(fov-camera.fov)*Math.min(1,dt*6);camera.updateProjectionMatrix();}}

// ---------- sound: an engine that follows the speed (and fades by itself when frames stop coming: pause, menu), a door
function engSound(on,v,f){if(!AU.ctx)return;try{const c=AU.ctx,t=c.currentTime;
  if(!DRV.eng){if(!on)return;const o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='square';o.frequency.value=40;o2.frequency.value=20;
    lp.type='lowpass';lp.frequency.value=520;g.gain.value=0;o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(AU.master);o.start();o2.start();DRV.eng={o,o2,lp,g};}
  const E=DRV.eng,gear=v<7?v/7:v<15?(v-7)/8:(v-15)/10,rpm=36+gear*34+v*1.3+(f>.1?6:0);E.o.frequency.setTargetAtTime(rpm,t,.08);E.o2.frequency.setTargetAtTime(rpm/2,t,.08);E.lp.frequency.setTargetAtTime(380+v*22+(f>.1?260:0),t,.1);
  E.g.gain.cancelScheduledValues(t);E.g.gain.setTargetAtTime(on&&AU.on?.05+(f>.1?.035:0)+v*.0012:0,t,.06);if(on)E.g.gain.setTargetAtTime(0,t+.3,.08);}catch(e){}}
function carDoor(x,z){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,8),o=aOut(.35*s.vol,s.pan);nz(o,.09,900,200,1);osc(o,'sine',95,55,.12,.5);}catch(e){}}

// ---------- multiplayer: what I am riding or driving, in my state report; other players' bikes and cars
// 0 on foot; [1, bike colour, yaw*1000, lean*1000]; [2, car type, paint, second tone, yaw*1000]
function vehPack(){const k=P.car;if(k)return[2,Math.max(0,CAR_TYPES.indexOf(k.o.type)),k.o.col|0,k.o.col2|0,Math.round(angDiff(k.yaw,0)*1000)];
  const b=P.bike;if(b)return[1,Math.max(0,BIKE_COLS.indexOf(b.col)),Math.round(angDiff(b.yaw,0)*1000),Math.round(clamp(b.lean,-1,1)*1000)];return 0;}
// every number checked and bounded; anything odd is read as 'on foot'
function vehRx(a){if(!Array.isArray(a)||a.length<4||a.length>6)return 0;const n=[];for(let i=0;i<a.length;i++){const v=+a[i];if(!isFinite(v))return 0;n.push(Math.round(v));}
  if(n[0]===1){if(Math.abs(n[2])>3300||Math.abs(n[3])>1000)return 0;return[1,clamp(n[1],0,BIKE_COLS.length-1),n[2],n[3]];}
  if(n[0]===2&&n.length===5){if(Math.abs(n[4])>3300)return 0;return[2,clamp(n[1],0,CAR_TYPES.length-1),clamp(n[2],0,0xffffff),clamp(n[3],0,0xffffff),n[4]];}return 0;}
// from mpPuppets, after the stand-in s of player pl has been placed: put it on a bike, or draw a car where it is (and hide the figure)
function vehPuppet(pl,s,dt){const v=pl.veh||0,kind=v?v[0]:0;
  if(kind===1){if(!s.bikeM||s.bikeC!==v[1]){if(s.bikeM)s.g.remove(s.bikeM);s.bikeM=bikeMesh(BIKE_COLS[v[1]]);s.bikeC=v[1];s.g.add(s.bikeM);}s.ride=true;
    s.g.rotation.y=s.yaw=v[2]/1000;s.g.rotation.z=v[3]/1000;}
  else if(s.bikeM&&s.bikeC!==undefined){s.g.remove(s.bikeM);s.bikeM=null;s.bikeC=undefined;s.ride=false;s.g.rotation.z=0;}
  let e=DRV.rem.get(pl.id);
  if(kind===2){const type=CAR_TYPES[v[1]],key=type+'/'+v[2]+'/'+v[3];if(!e||e.key!==key){if(e){scene.remove(e.g);e.g.userData.m.geometry.dispose();}
      e={g:carModel(type,v[2],v[3]),key,type,yaw:v[4]/1000,seen:0};scene.add(e.g);DRV.rem.set(pl.id,e);}
    e.yaw+=angDiff(v[4]/1000,e.yaw)*Math.min(1,dt*12);e.seen=performance.now();e.g.visible=true;e.g.position.set(s.x,(s.y0||0)+.05,s.z);e.g.rotation.y=e.yaw;s.g.visible=false;s.inCar=true;}
  else{if(e)e.g.visible=false;if(s.inCar){s.inCar=false;s.g.visible=s.alive;}}}

// test and debugging hooks (window.__game, through MECH)
if(typeof MECH!=='undefined')Object.assign(MECH,{RHc:()=>RHc,DRV,carEnter,carExit,carNear,carsReset,vehPack,vehRx,exitSpot,CAR_TYPES});
