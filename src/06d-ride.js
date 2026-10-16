// =====================================================================
// 06d RIDE: lowrider bicycles: parked bikes to ride, riding and crashing, and a bike model for AI riders
// =====================================================================
// API for the mission code:
//   spawnBike(x,z,yaw,col) -> bike (parked; "Hold USE to ride" when close; no collider)   mountBike(b)   dismountBike()   P.bike (or null)
//   bikeMesh(col) -> a standalone bike for under an AI rider: s.g.add(m); every frame rideAnim(s,crank) poses the rider and
//   bikeSpin(m,dist,crank,steer) turns its wheels (dist: metres rolled this frame)   updBikes(dt): runs from updPlayer every frame
//   clearBikes(): removes every bike (for a mission reset)
// Riding (single player and local in multiplayer; other players see the usual soldier figure): W pedals up to about 9 m/s with
// momentum, S brakes (then walks the bike back), the bike steers towards where you look and A/D or the stick also turn the view;
// while aiming the bike holds its line and A/D steer it. Only the pistol fires, one-handed, and firing stops the pedalling (you coast).
// No sprint, jump, crouch or knife. Third person while riding. A wall hit above about 5 m/s throws you off with a short stumble.
const bikes=[],RIDE={hold:0,prev:-1,near:null,on:'Hold <b>'+(isTouch?'USE':'F')+'</b> to ride',off:'<b>'+(isTouch?'USE':'F')+'</b> get off'},BIKE_COLS=[0x9c1236,0x1557a8,0x6a2a93,0x16805a,0xc4901c];
// one texture: a spoked wheel with whitewalls (cut out between the spokes) on the left, plain white on the right
const bikeTex=tex(256,128,(g)=>{g.clearRect(0,0,256,128);g.fillStyle='#fff';g.fillRect(128,0,128,128);
  const ring=(r1,r0,c)=>{g.fillStyle=c;g.beginPath();g.arc(64,64,r1,0,TAU);g.arc(64,64,r0,0,TAU,true);g.fill();};
  ring(63,52,'#1c1c1e');ring(52,44.5,'#f4f2ec');ring(44.5,39,'#e3e8ec');ring(41,40,'#9aa3aa');
  g.strokeStyle='#eef2f5';g.lineWidth=1.3;for(let k=0;k<40;k++){const a=k/40*TAU,b=a+(k%2?.6:-.6);g.beginPath();g.moveTo(64+Math.cos(a)*7,64+Math.sin(a)*7);g.lineTo(64+Math.cos(b)*40,64+Math.sin(b)*40);g.stroke();}
  g.fillStyle='#eef2f5';g.beginPath();g.arc(64,64,9,0,TAU);g.fill();g.fillStyle='#8f989f';g.beginPath();g.arc(64,64,3.5,0,TAU);g.fill();});
const bikeMat=new T.MeshPhongMaterial({vertexColors:true,map:bikeTex,alphaTest:.45,skinning:true,shininess:70,specular:0x8a8a8a});
// bike frame: faces -z, ground at y 0; rear axle z .62, front axle z -.72, wheels 20 inch; bones 0 frame, 1 bars and fork, 2 front wheel, 3 rear wheel, 4 cranks
const BK={R:.255,BB:[0,.25,-.05],ZR:.2,FA:[0,.255,-.72],RA:[0,.255,.62],ST:[0,.6,-.56]},bikeGeoC={};
function bkSeg(b,geo,a,c,r,col,n,tw){if(!n){const l=segRot(a[0],a[1],a[2],c[0],c[1],c[2]);b.add(geo,a[0],a[1],a[2],SE.x,SE.y,SE.z,r,l,r,col);return;}
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,p0=[lerp(a[0],c[0],t0),lerp(a[1],c[1],t0),lerp(a[2],c[2],t0)],p1=[lerp(a[0],c[0],t1),lerp(a[1],c[1],t1),lerp(a[2],c[2],t1)];
    const l=segRot(p0[0],p0[1],p0[2],p1[0],p1[1],p1[2],k*tw);b.add(geo,p0[0],p0[1],p0[2],SE.x,SE.y,SE.z,r,l,r,col);}}
function bkPlain(b){for(let i=0;i<b.u.length;i+=2){b.u[i]=.75;b.u[i+1]=.5;}}
function bkWheel(b){const R=BK.R;b.add(GEO.tube8,-.026,0,0,0,0,-PI/2,R*.985,.052,R*.985,0x1c1c1e);bkPlain(b);const k=b.u.length;
  for(const s of [-1,1])b.add(bkDisc,s*.027,0,0,0,s*PI/2,0,R*2,R*2,1,0xffffff);for(let i=k;i<b.u.length;i+=2)b.u[i]*=.5;return b;}
const bkDisc=new T.PlaneGeometry(1,1);
function bikeGeo(col){if(bikeGeoC[col])return bikeGeoC[col];
  const CH=0xd8dde2,CD=0x9aa2a8,seat=0xf1ebdf,BB=BK.BB,rod=GEO.rod,bx=GEO.box,parts=[];let b=new GB();
  // frame in candy paint: head tube, cantilever top tube sweeping down to the rear axle, curved down tube, seat tube, stays
  bkSeg(b,rod,[0,.5,-.585],[0,.71,-.535],.026,col);
  const top=[[0,.67,-.545],[0,.61,-.26],[0,.54,.04],[0,.43,.36],[0,.3,.6]];for(let k=0;k<4;k++)bkSeg(b,rod,top[k],top[k+1],.021,col);
  bkSeg(b,rod,[0,.53,-.575],[0,.34,-.33],.023,col);bkSeg(b,rod,[0,.34,-.33],BB,.023,col);bkSeg(b,rod,BB,[0,.6,.12],.02,col);
  for(const s of [-1,1]){bkSeg(b,rod,[s*.035,BB[1],BB[2]],[s*.045,.26,.62],.014,col);bkSeg(b,rod,[s*.03,.6,.12],[s*.045,.27,.6],.013,col);}
  b.add(bx,.06,.19,.27,0,0,0,.012,.11,.64,col);b.add(bx,.06,.25,.27,0,0,0,.016,.012,.64,CH);                // chain guard with a chrome edge
  // banana seat on a chrome strut, and the tall twisted sissy bar
  bkSeg(b,rod,[0,.58,.1],[0,.64,.24],.012,CH);b.add(AG.j,0,.66,.24,-.1,0,0,.105,.048,.27,seat);b.add(GEO.box,0,.62,.24,-.1,0,0,.2,.02,.44,col);
  for(const s of [-1,1]){bkSeg(b,bx,[s*.075,.64,.42],[s*.07,1.27,.55],.018,CH,2,.8);bkSeg(b,rod,[s*.075,.64,.42],[s*.05,.27,.62],.01,CH);}
  bkSeg(b,rod,[-.07,1.27,.55],[0,1.33,.56],.012,CH);bkSeg(b,rod,[.07,1.27,.55],[0,1.33,.56],.012,CH);
  // rear fender
  b.add(bkFend,0,BK.RA[1],BK.RA[2],0,0,-PI/2,.3,.075,.3,CH);
  bkPlain(b);parts.push([b,0]);
  // bars and springer fork (turn with the steering)
  b=new GB();for(const s of [-1,1]){bkSeg(b,rod,[s*.052,.62,-.56],[s*.052,.3,-.7],.014,CH);bkSeg(b,rod,[s*.055,.69,-.62],[s*.055,.26,-.75],.012,CH);
    bkSeg(b,bx,[s*.14,.8,-.5],[s*.26,1.1,-.42],.02,CH,2,.8);bkSeg(b,rod,[s*.26,1.1,-.42],[s*.26,1.1,-.25],.019,seat);}
  b.add(bx,0,.6,-.57,0,0,0,.14,.04,.07,CH);bkSeg(b,rod,[0,.6,-.6],[0,.71,-.62],.026,CD);bkSeg(b,rod,[0,.7,-.535],[0,.8,-.5],.017,CH);bkSeg(b,rod,[-.14,.8,-.5],[.14,.8,-.5],.014,CH);
  b.add(bkFendF,0,BK.FA[1],BK.FA[2],0,0,-PI/2,.29,.07,.29,CH);bkPlain(b);parts.push([b,1]);
  parts.push([bkWheel(new GB()),2,BK.FA]);parts.push([bkWheel(new GB()),3,BK.RA]);
  // cranks and pedals (bind pose: right crank forward)
  b=new GB();bkSeg(b,rod,[-.075,BB[1],BB[2]],[.075,BB[1],BB[2]],.016,CD);
  bkSeg(b,rod,[.075,BB[1],BB[2]],[.075,BB[1],BB[2]-.14],.012,CH);bkSeg(b,rod,[-.075,BB[1],BB[2]],[-.075,BB[1],BB[2]+.14],.012,CH);
  b.add(bx,.12,BB[1]-.015,BB[2]-.14,0,0,0,.08,.03,.05,0x2a2a2c);b.add(bx,-.12,BB[1]-.015,BB[2]+.14,0,0,0,.08,.03,.05,0x2a2a2c);bkPlain(b);parts.push([b,4]);
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of parts){const g=it[0],bo=it[1],o=it[2]||[0,0,0],k=p.length/3;
    for(let i=0;i<g.p.length/3;i++){p.push(g.p[i*3]+o[0],g.p[i*3+1]+o[1],g.p[i*3+2]+o[2]);n.push(g.n[i*3],g.n[i*3+1],g.n[i*3+2]);c.push(g.c[i*3],g.c[i*3+1],g.c[i*3+2]);u.push(g.u[i*2],g.u[i*2+1]);si.push(bo,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.i.length;i++)ix.push(k+g.i[i]);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,.6,0),1.3);return bikeGeoC[col]=g;}
const bkFend=new T.CylinderGeometry(1,1,1,9,1,true,PI*4/3,2.4),bkFendF=new T.CylinderGeometry(1,1,1,6,1,true,PI*1.5-.85,1.7);
// a bike model: a group facing -z with the skinned mesh and its bones (one draw call)
function bikeModel(col){const g=new T.Group();g.rotation.order='YXZ';const B=[];
  const pos=[[0,0,0],[BK.ST[0],BK.ST[1],BK.ST[2]],[BK.FA[0]-BK.ST[0],BK.FA[1]-BK.ST[1],BK.FA[2]-BK.ST[2]],BK.RA,BK.BB],par=[-1,0,1,0,0];
  for(let k=0;k<5;k++){const b=new T.Bone();b.position.set(pos[k][0],pos[k][1],pos[k][2]);B.push(b);if(par[k]>=0)B[par[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const m=new T.SkinnedMesh(bikeGeo(col),bikeMat);m.castShadow=true;g.add(m);m.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.scale.set(.75,1,1.45);sh.position.y=.03;sh.renderOrder=2;g.add(sh);g.userData.B=B;return g;}
function bikeMesh(col){const o=new T.Group(),m=bikeModel(col===undefined?RP(BIKE_COLS):col);m.position.z=-BK.ZR;o.add(m);o.userData.B=m.userData.B;return o;}
function bikeSpin(m,dist,crank,steer){const B=m.userData.B;B[2].rotation.x-=dist/BK.R;B[3].rotation.x-=dist/BK.R;if(crank!==undefined)B[4].rotation.x=crank;if(steer!==undefined)B[1].rotation.y=steer;}
function spawnBike(x,z,yaw,col){col=col===undefined?RP(BIKE_COLS):col;const b={g:bikeModel(col),x,z,y:0,yaw:yaw||0,col,v:0,steer:0,lean:0,wr:0,cr:0,fallen:false,riding:false};
  b.B=b.g.userData.B;scene.add(b.g);bikes.push(b);bikePose(b);return b;}
// world bikes (b.world, parked round town by 06e) stay and go back to where they were parked; the others (the trail chase's) go
function clearBikes(){if(P.bike)dismountBike(2);for(let k=bikes.length-1;k>=0;k--){const b=bikes[k];if(!b.world){scene.remove(b.g);bikes.splice(k,1);continue;}
  b.x=b.home[0];b.z=b.home[1];b.yaw=b.home[2];b.y=0;b.v=0;b.fallen=false;b.riding=false;bikePose(b);}}
function bikePose(b){const lean=b.riding?b.lean:b.fallen?1.42:.11;b.g.position.set(b.x,b.y+(b.fallen&&!b.riding?.04:0),b.z);b.g.rotation.set(0,b.yaw,lean);
  b.B[1].rotation.y=b.riding?b.steer*.45:b.fallen?0:.35;b.B[2].rotation.x=b.B[3].rotation.x=b.wr;b.B[4].rotation.x=b.cr;}
function mountBike(b){if(!b||P.bike||!P.alive||b.riding)return;P.bike=b;b.riding=true;b.fallen=false;b.v=0;b.steer=0;b.lean=0;RIDE.hold=0;
  P.x=b.x;P.z=b.z;P.vx=P.vz=0;P.yaw=b.yaw;P.pitch=-.08;P.crouching=false;P.sprinting=false;P.stumT=0;pushOut(P,.45,P.y);
  RIDE.prev=P.cur;let pi=-1;for(let k=0;k<P.slots.length;k++)if(P.slots[k].id==='pistol')pi=k;
  if(pi>=0&&pi!==P.cur){cancelReload();P.swapT=0;P.swapTo=-1;P.cur=pi;showWeapon();}VIEW.d=Math.min(VIEW.d,1.5);sndUi('click');}
// how: 0 step off to the left, 1 thrown off (crash, or down), 2 just let go (teleport, reset)
function dismountBike(how){const b=P.bike;if(!b)return;how=how|0;P.bike=null;b.riding=false;b.steer=0;b.lean=0;
  if(how!==2){b.x=P.x;b.z=P.z;}b.v=0;
  if(how===1){b.fallen=true;P.stumT=.85;P.punch+=.05;P.roll+=R2(-.12,.12);shake=Math.max(shake,.45);sndUi('hurt');const fx=-Math.sin(b.yaw),fz=-Math.cos(b.yaw);P.vx=-fx*1.6;P.vz=-fz*1.6;}
  else if(how===0){const lx=-Math.cos(b.yaw),lz=Math.sin(b.yaw);P.x+=lx*.75;P.z+=lz*.75;pushOut(P,.45,P.y);P.vx=P.vz=0;sndUi('click');}
  if(RIDE.prev>=0&&RIDE.prev<P.slots.length&&RIDE.prev!==P.cur&&P.alive){cancelReload();P.cur=RIDE.prev;showWeapon();}RIDE.prev=-1;bikePose(b);}
// pedalling, braking and steering (from updPlayer, instead of walking)
function rideMove(dt,f,s){const b=P.bike,aim=P.ads>.1||P.wantAds||IN.fire||P.fireT>-.35,pedal=f>.1&&!IN.fire&&P.stumT<=0;
  let a=pedal?4.6*f*(1-b.v/9.3):f<-.1?(b.v>.15?-9*-f:-1.8*-f):0;a-=(.16+.0055*b.v*b.v)*(b.v>0?1:b.v<0?-1:0);
  b.v=clamp(b.v+a*dt,-1.3,9.3);if(!pedal&&f>=-.1&&Math.abs(b.v)<.06)b.v=0;
  const sf=clamp(Math.abs(b.v)/1.2,0,1),rate=lerp(2.5,1.2,clamp(Math.abs(b.v)/9.3,0,1))*sf;
  let st;if(aim)st=-s;else{P.yaw-=s*1.7*dt*(.35+.65*sf);st=clamp(angDiff(P.yaw,b.yaw)*2.4,-1,1);}
  b.steer+=(clamp(st,-1,1)-b.steer)*Math.min(1,dt*8);const yr=b.steer*rate*(b.v<0?-1:1);b.yaw+=yr*dt;
  b.lean+=(clamp(yr*b.v*.045,-.38,.38)-b.lean)*Math.min(1,dt*5);
  P.vx=-Math.sin(b.yaw)*b.v;P.vz=-Math.cos(b.yaw)*b.v;
  b.wr-=b.v*dt/BK.R;if(pedal)b.cr+=Math.max(0,b.v)*dt*1.5+dt*1.2;}
// walls: the front wheel is kept out too; a hard hit throws the rider off, a glancing one costs speed
const bkProbe={x:0,z:0};
function rideCollide(px,pz,dt){const b=P.bike,fx=-Math.sin(b.yaw),fz=-Math.cos(b.yaw);bkProbe.x=P.x+fx*.75;bkProbe.z=P.z+fz*.75;pushOut(bkProbe,.26,P.y);
  P.x+=bkProbe.x-(P.x+fx*.75);P.z+=bkProbe.z-(P.z+fz*.75);pushOut(P,.45,P.y);
  const want=b.v*dt,got=(P.x-px)*fx+(P.z-pz)*fz;if(Math.abs(want)<1e-5)return;
  if(b.v>5.2&&got<want*.35){b.x=P.x;b.z=P.z;dismountBike(1);toast('CRASHED');return;}
  if(got<want*.92)b.v=b.v>0?Math.max(0,got/dt):Math.min(0,got/dt);}
// seated rider: two-bone reach in the side plane (thigh/shin, arm/forearm)
function ik2(a,b,L1,L2,dy,dz,arm){const d=clamp(Math.hypot(dy,dz),Math.abs(L1-L2)+.02,L1+L2-.005),al=Math.atan2(-dz,-dy),
  c1=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1)),c2=Math.acos(clamp((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1));
  if(arm){a.rotation.x=al-c1;b.rotation.x=PI-c2;}else{a.rotation.x=al+c1;b.rotation.x=-(PI-c2);}}
// pose any soldier-rig figure (s: body, up, aL, fL, aR, fR, lL, kL, lR, kR, wp) on a bike at crank angle cr; its origin sits BK.ZR behind the bike's
const RO={footDown:false,aim:undefined,twist:0},RO0={};
function rideAnim(s,cr,o){o=o||RO0;const lean=-.3,hy=.755,by=BK.BB[1],bz=BK.BB[2]-BK.ZR,sn=Math.sin(cr),cs=Math.cos(cr);
  s.body.position.y=hy-.9;s.body.rotation.set(0,0,0);s.up.rotation.set(lean,o.twist||0,0);
  if(o.footDown){s.lL.rotation.set(.08,0,.22);s.kL.rotation.x=-.08;}else ik2(s.lL,s.kL,.46,.42,by-sn*.14+.06-hy,bz+cs*.14,false);
  ik2(s.lR,s.kR,.46,.42,by+sn*.14+.06-hy,bz-cs*.14,false);
  // hands on the grips; shoulders are 0.47 up the leaned chest
  const shy=hy-.9+1+.47*Math.cos(lean),shz=.47*Math.sin(lean),gy=1.1,gz=-.33-BK.ZR;
  ik2(s.aL,s.fL,.36,.33,gy-shy,gz-shz,true);s.aL.rotation.x-=lean;s.aL.rotation.y=0;s.aL.rotation.z=.12;
  if(o.aim!==undefined){const a=PI/2+o.aim-lean;s.aR.rotation.set(a,0,-.12);s.fR.rotation.x=.06;s.wp.scale.setScalar(1);s.wp.position.set(.28,.47-.64*Math.cos(a),-.64*Math.sin(a));s.wp.rotation.set(a-PI/2,0,0);}
  else{ik2(s.aR,s.fR,.36,.33,gy-shy,gz-shz,true);s.aR.rotation.x-=lean;s.aR.rotation.y=0;s.aR.rotation.z=-.12;s.wp.scale.setScalar(.001);}
  if(s.ftL){s.ftL.rotation.set(-(s.lL.rotation.x+s.kL.rotation.x)*.85,0,0);s.ftR.rotation.set(-(s.lR.rotation.x+s.kR.rotation.x)*.85,0,0);}if(s.hd)s.hd.rotation.set(.3,(o.twist||0)*.6,0);}
function rideAvatar(dt){const b=P.bike,c=Math.cos(b.yaw),s=Math.sin(b.yaw),pis=curW().id==='pistol',aim=pis&&(P.ads>.1||P.wantAds||IN.fire||P.fireT>-.6);
  PAV.yaw=b.yaw;PAV.g.position.set(b.x+s*BK.ZR,b.y,b.z+c*BK.ZR);PAV.g.rotation.set(0,b.yaw,b.lean);
  const tw=aim?clamp(angDiff(P.yaw,b.yaw),-1.1,1.1):0;
  RO.footDown=Math.abs(b.v)<.35&&IN.f<.1;RO.aim=aim?clamp(P.pitch,-.9,.9):undefined;RO.twist=tw;rideAnim(PAV,b.cr,RO);}
// every frame of play: the ridden bike follows the player; near a parked one, hold USE to get on
function updBikes(dt){const b=P.bike;vehFrame(dt); // (drive) parked cars, culling and the USE latch (06e)
  if(b){if(!P.alive){dismountBike(1);return;}
    if(Math.hypot(P.x-b.x,P.z-b.z)>4){dismountBike(2);return;} // moved by a restart or a respawn: the bike stays where it was
    b.x=P.x;b.z=P.z;b.y=P.y;bikePose(b);
    G.prompt=RIDE.off;if(IN.use){IN.use=false;dismountBike(0);}return;}
  if(!P.alive)return;let near=null,nd=1.9;
  for(let k=0;k<bikes.length;k++){const q=bikes[k];if(q.riding||!q.g.visible||q.off)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<nd&&Math.abs(q.y-P.y)<1.2){nd=d;near=q;}}
  // a borrowable car whose door is closer than any bike (06e) takes the USE button instead
  const cn=carNear();if(cn&&(!near||cn.d<nd)){RIDE.near=null;RIDE.hold=0;carPrompt(cn.k,dt);return;}DRV.hold=0;
  RIDE.near=near;if(!near){RIDE.hold=0;return;}
  G.prompt=RIDE.on;if(IN.useHeld&&!DRV.latch){RIDE.hold+=dt;if(RIDE.hold>.35){mountBike(near);DRV.latch=true;}}else RIDE.hold=0;}
// test and debugging hooks (added to window.__game by the frame-loop module)
const MECH={rayWorld,VIEW,setViewMode,toggleView,PAV,AVATAR,setAvatar,bikes,spawnBike,mountBike,dismountBike,bikeMesh,bikeSpin,rideAnim,clearBikes,avRig,bikeGeo,updBikes,
  animDeath,rigGeo,weaponGeo,VM,vmSkin,updAvatar,figBones,avMat,armsOn};
