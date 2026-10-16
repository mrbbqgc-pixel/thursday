// =====================================================================
// 07c LIFE: the neighbourhood, in single player only. People walk the sidewalks, shop fronts, lot aisles, park paths and the Pacific
// Electric Trail; neighbours water lawns, wash cars, mow and blow leaves; people sit on benches; everybody runs for it when the shooting
// starts. A few cars drive the arterials, a flock of crows and a hawk, neighbourhood sound. Nothing here exists in a multiplayer game
// (lifeUpdate clears it when MP.on); resetWorldState clears it through lifeReset. None of it is on the minimap; the AI ignores it.
// =====================================================================
const civs=[],dogs=[],traffic=[],LIFE={on:false,test:false,alarm:99,nx:0,nz:0,hurtN:0,killN:0,hurtAll:0,killAll:0,stage:-9,failT:0,spawnT:0,nearT:0,near:[],
  shoutT:0,sayT:0,scareT:0,civN:isTouch?6:10,dogN:isTouch?1:2,carN:isTouch?3:4,chase:false,spr:null,sprT:0,emit:{},yard:{water:null,wash:null,gard:null}};
// gunfire and explosions (hook in noiseEvent, 07a): everybody in earshot runs for it
function lifeNoise(x,z,rad){if(!LIFE.on||rad<30)return;LIFE.alarm=0;LIFE.nx=x;LIFE.nz=z;}
const onArt=(x,z)=>{for(const a of NSA)if(Math.abs(x-a.x)<a.hw&&z>a.z0&&z<a.z1)return true;for(const b of EWA)if(Math.abs(z-b.z)<b.hw&&x>b.x0&&x<b.x1)return true;return false;};
const nearTrail=(x,z)=>Math.abs(z-trailZ(x))<17;
// out of the player's sight: behind the camera, or hidden by the town
function unseen(x,z){const c=camera.position,dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz)||1;if((dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw))/d<.3)return true;return!los(c.x,c.y,c.z,x,1.6,z);}

// ---------- lanes: straight walking lines, joined where they cross or meet end to end
const LANES=[];
function laneAdd(ax,az,bx,bz,k,o){
  if(ax===bx){if(ax<BOUND.x0+2||ax>BOUND.x1-2)return null;az=clamp(az,BOUND.z0+3,BOUND.z1-3);bz=clamp(bz,BOUND.z0+3,BOUND.z1-3);}
  else if(az===bz){if(az<BOUND.z0+2||az>BOUND.z1-2)return null;ax=clamp(ax,BOUND.x0+3,BOUND.x1-3);bx=clamp(bx,BOUND.x0+3,BOUND.x1-3);}
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);if(len<8)return null;
  const L0=Object.assign({ax,az,bx,bz,dx:dx/len,dz:dz/len,len,k,J:[],y:k==='trail'?.05:PADY,inx:0,inz:0,id:LANES.length},o||{});LANES.push(L0);return L0;}
const lnX=(L0,t,o)=>L0.ax+L0.dx*t-L0.dz*o,lnZ=(L0,t,o)=>L0.az+L0.dz*t+L0.dx*o;
// arterial sidewalks, 1.5 m in from the curb
for(const a of NSA)for(const s of [-1,1])laneAdd(a.x+s*(a.hw+1.5),a.z0,a.x+s*(a.hw+1.5),a.z1,'ave');
for(const b of EWA)for(const s of [-1,1]){const z=b.z+s*(b.hw+1.5);laneAdd(b.x0,z,Math.min(b.x1,fwEdge(z)-8),z,'ave');}
// tract streets: both sidewalks of every street and collector
for(const t of tracts){const R0=t.R,sw=t.sw,Q=sw?(u,v)=>[v,u]:(u,v)=>[u,v],U0=sw?R0.z0:R0.x0,U1=sw?R0.z1:R0.x1,V0=sw?R0.x0:R0.z0,V1=sw?R0.x1:R0.z1;
  for(const v of t.vs)for(const s of [-1,1]){const a=Q(U0+1.5,v+s*5.75),b=Q(U1-1.5,v+s*5.75);laneAdd(a[0],a[1],b[0],b[1],'side');}
  for(const uc of t.coll)for(const s of [-1,1]){const a=Q(uc+s*6.8,V0+1.5),b=Q(uc+s*6.8,V1-1.5);laneAdd(a[0],a[1],b[0],b[1],'side');}}
// strip centers: the covered walk in front of the shops (in: the way into them), the lot aisles, a walk at each end out to the street
function shopLanes(x0,z0,x1,z1,front){const cx=(x0+x1)/2,cz=(z0+z1)/2,r=[2,0,3,1][front],F=TF(cx,cz,r),LW=r%2?z1-z0:x1-x0,LD=r%2?x1-x0:z1-z0,hw=LW/2,hd=LD/2,sw=Math.min(LW-14,LW-10),fz=-hd+23;
  const a=F.p(-sw/2+1.5,fz+1.5),b=F.p(sw/2-1.5,fz+1.5),q=F.p(0,fz),p=F.p(0,fz+1.5);laneAdd(a[0],a[1],b[0],b[1],'shop',{inx:(q[0]-p[0])/1.5,inz:(q[1]-p[1])/1.5});
  const lz0=fz+5,nm=Math.max(1,Math.floor((LD-34)/18.6));for(let m=0;m<nm;m++){const c=F.p(-hw+5,lz0+m*18.6+9.3),d=F.p(hw-5,lz0+m*18.6+9.3);laneAdd(c[0],c[1],d[0],d[1],'lot');}
  for(const s of [-1,1]){const c=F.p(s*(hw-3),fz+1.5),d=F.p(s*(hw-3),hd-3);laneAdd(c[0],c[1],d[0],d[1],'lot');}}
shopLanes(342,-132,xW('MILL'),zN('FH'),1);shopLanes(xE('MILL'),-102,702,zN('FH'),1);shopLanes(xE('ROCH'),-102,xW('DAYC'),zN('FH'),1);
shopLanes(xE('ARCH'),zS('FH'),xW('HERM'),94,0);shopLanes(xE('HERM'),zS('FH'),-90,122,0);
laneAdd(527,50.5,673,50.5,'shop',{inx:0,inz:-1});                                                                                   // the ballpark shops
for(const s of [-1,1]){laneAdd(1150+s*2.2,-216,1150+s*2.2,-178,'shop',{inx:s,inz:0});laneAdd(1150+s*2.2,-142,1150+s*2.2,-78,'shop',{inx:s,inz:0});} // the Promenade and its plaza
laneAdd(1139,-178,1161,-178,'shop');laneAdd(1139,-142,1161,-142,'shop');laneAdd(1139,-178,1139,-142,'shop');laneAdd(1161,-178,1161,-142,'shop');
for(const z of [181.5,188.5])laneAdd(22.5,z,57.5,z,'shop');laneAdd(19.5,194.8,60.5,194.8,'shop',{inx:0,inz:1});for(const x of [28,41.5,52])laneAdd(x,171.5,x,194.8,'shop'); // the Market Hall patio
laneAdd(590,1027,800,1027,'shop',{inx:0,inz:1});laneAdd(531,1040,531,1066,'shop',{inx:1,inz:0});laneAdd(531,1094,531,1134,'shop',{inx:1,inz:0});              // the outlets
for(const z of [988.3,1006.9])laneAdd(507,z,813,z,'lot');laneAdd(508.3,1024,508.3,1188,'lot');for(const x of [598.5,698.5,791])laneAdd(x,988.3,x,1027,'lot');
laneAdd(334,-571.5,464,-571.5,'park');                                                                                                // Central Park
laneAdd(-536,trailZ(0)-.8,600,trailZ(0)-.8,'trail');laneAdd(600,trailZ(600)-.8,1420,trailZ(1420)-.8,'trail');                         // the bike path of the trail
for(let i=0;i<LANES.length;i++){const A=LANES[i],ax0=Math.min(A.ax,A.bx)-3,ax1=Math.max(A.ax,A.bx)+3,az0=Math.min(A.az,A.bz)-3,az1=Math.max(A.az,A.bz)+3;
  for(let j=i+1;j<LANES.length;j++){const B=LANES[j];if(Math.max(B.ax,B.bx)<ax0||Math.min(B.ax,B.bx)>ax1||Math.max(B.az,B.bz)<az0||Math.min(B.az,B.bz)>az1)continue;
    let t=-1,u=-1;const den=A.dx*B.dz-A.dz*B.dx;
    if(Math.abs(den)>.3){const wx=B.ax-A.ax,wz=B.az-A.az;t=(wx*B.dz-wz*B.dx)/den;u=(wx*A.dz-wz*A.dx)/den;if(t<-2.5||t>A.len+2.5||u<-2.5||u>B.len+2.5)continue;}
    else{let f=false;for(const ta of [0,A.len])for(const ub of [0,B.len])if(!f&&Math.hypot(lnX(A,ta,0)-lnX(B,ub,0),lnZ(A,ta,0)-lnZ(B,ub,0))<1.5){t=ta;u=ub;f=true;}if(!f)continue;}
    A.J.push({t:clamp(t,0,A.len),l:j,u:clamp(u,0,B.len)});B.J.push({t:clamp(u,0,B.len),l:i,u:clamp(t,0,A.len)});}}
for(const L0 of LANES)L0.J.sort((p,q)=>p.t-q.t);
function nearLanes(){const out=[];for(const L0 of LANES){const t=clamp((P.x-L0.ax)*L0.dx+(P.z-L0.az)*L0.dz,0,L0.len);if(Math.hypot(L0.ax+L0.dx*t-P.x,L0.az+L0.dz*t-P.z)<108)out.push(L0);}LIFE.near=out;}
function nearLane(x,z,maxD){let best=null,bd=maxD;for(const L0 of LIFE.near.length?LIFE.near:LANES){if(L0.k==='trail'&&LIFE.chase)continue;const t=clamp((x-L0.ax)*L0.dx+(z-L0.az)*L0.dz,0,L0.len),d=Math.hypot(L0.ax+L0.dx*t-x,L0.az+L0.dz*t-z);if(d<bd){bd=d;best=[L0,t];}}return best;}

// ---------- places where people stay a while: benches and picnic tables, front yards with a house behind, cars in driveways
const SEATS=[],YARDS=[],DRIVES=[];
for(const c of colliders){if(c.kind!==5)continue;const w=c.x1-c.x0,d=c.z1-c.z0,x=(c.x0+c.x1)/2,z=(c.z0+c.z1)/2,ax=w>d,is=(a,b)=>Math.abs(Math.max(w,d)-a)<.01&&Math.abs(Math.min(w,d)-b)<.01;if(inQuiet(x,z))continue;
  if(Math.abs(c.y1-.9)<.01&&is(2,.5))for(const q of [-.48,.48])SEATS.push({x:x+(ax?q:.08),z:z+(ax?.08:q),yaw:ax?PI:-PI/2,used:0});
  else if(Math.abs(c.y1-.8)<.01&&is(2.2,1.6))for(const s of [-1,1])SEATS.push({x:x+(ax?R2(-.5,.5):s*.72),z:z+(ax?s*.72:R2(-.5,.5)),yaw:ax?(s>0?0:PI):(s>0?PI/2:-PI/2),used:0});}
for(const t of tracts){const R0=t.R,sw=t.sw,Q=sw?(u,v)=>[v,u]:(u,v)=>[u,v],U0=sw?R0.z0:R0.x0,U1=sw?R0.z1:R0.x1,uq=Q(1,0);
  for(const v of t.vs)for(const s of [-1,1]){const n=Q(0,s);for(let u=U0+14;u<U1-12;u+=19){const p=Q(u,v+s*8.4);if(!freeSpot(p[0],p[1]))continue;
      const d=rayWorld(p[0],1,p[1],n[0],0,n[1],14);if(d<2.5||d>13.5||!RHc||RHc.kind!==1)continue;
      YARDS.push({x:p[0],z:p[1],nx:n[0],nz:n[1],ux:uq[0],uz:uq[1],hd:d,used:0,mow:freeSpot(p[0]+uq[0]*3,p[1]+uq[1]*3)&&freeSpot(p[0]-uq[0]*3,p[1]-uq[1]*3)});}}}
for(const c of cars){const x=(c.x0+c.x1)/2,z=(c.z0+c.z1)/2;for(const t of tracts){const R0=t.R;if(x<R0.x0||x>R0.x1||z<R0.z0||z>R0.z1)continue;
    const sw=t.sw,v=sw?x:z,lv=sw?c.x1-c.x0:c.z1-c.z0;let bv=t.vs[0];for(const q of t.vs)if(Math.abs(v-q)<Math.abs(v-bv))bv=q;const dv=Math.abs(v-bv);
    if(lv>3.5&&dv>7.5&&dv<14)DRIVES.push({c,x,z,sw,sg:Math.sign(v-bv),hu:(sw?c.z1-c.z0:c.x1-c.x0)/2,hv:lv/2,used:0});break;}}

// ---------- people: ordinary suburban adults around 2000 on the soldier rig (same bones, so the same hit volumes), no weapon, one skinned mesh each
const CG={torso:new T.CylinderGeometry(1,.82,1,10,1),limb:new T.CylinderGeometry(1,.82,1,7,1,true),ring:new T.CylinderGeometry(1,1,1,10,1,true),ball:new T.SphereGeometry(1,8,6),blob:new T.SphereGeometry(1,6,4),
  cap:new T.SphereGeometry(1,8,4,0,TAU,0,PI/2),cyl:new T.CylinderGeometry(1,1,1,8),disc:new T.CylinderGeometry(1,1,1,12),box:new T.BoxGeometry(1,1,1),flare:new T.CylinderGeometry(.62,1,1,10,1,true)};
CG.torso.translate(0,.5,0);CG.limb.translate(0,-.5,0);CG.ring.translate(0,-.5,0);CG.cyl.translate(0,.5,0);CG.disc.translate(0,.5,0);CG.box.translate(0,.5,0);CG.flare.translate(0,-.5,0);
const civMat=L({vertexColors:true,skinning:true,map:tex(64,64,(g,w,h)=>{g.fillStyle='#dcdcdc';g.fillRect(0,0,w,h);for(let k=0;k<22;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.1)':'rgba(0,0,0,.06)';g.beginPath();g.ellipse(R()*w,R()*h,R2(3,9),R2(2,6),R()*3,0,7);g.fill();}
  for(let k=0;k<380;k++){g.fillStyle='rgba('+(R()<.5?'0,0,0,':'255,255,255,')+(R()*.09).toFixed(3)+')';g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}},true)});
// bones as the soldier's: 0 body, 1 upper body, 2/3 left arm and forearm, 4/5 right, 6 (unused), 7/8 left thigh and shin, 9/10 right
const CJ=[[0,0,0],[0,1,0],[-.3,.47,0],[0,-.36,0],[.3,.47,0],[0,-.36,0],[.12,.36,-.42],[-.12,.9,0],[0,-.46,0],[.12,.9,0],[0,-.46,0]],CP=[-1,0,1,2,1,4,1,0,7,0,9];
function civJoints(o){const J=CJ.map(q=>q.slice()),w=o.wide*(o.f?.9:1);J[2][0]=-.3*w;J[4][0]=.3*w;return J;}
const SKIN=[0xf1cba9,0xe2b08c,0xc99068,0xab7652,0x8c5c3e,0x6c4430,0xd9a982],HAIRC=[0x1d1712,0x2e2218,0x5a3d26,0x8a6a42,0xc8ad7c],TOPC=[0xf4f0e7,0x8fb7d6,0xc8362b,0xe3c35c,0x4f8a3c,0x2d4a6e,0xe59a7a,0x7a3b5e,0x3a3a3e,0xd98a4e,0xb9d6a1,0xe8c2d4,0x5aa0a0,0x9c4a3a],
  JEANC=[0x3a4e6e,0x2f3f58,0x4a6488,0x5b6f8f],PANTC=[0xc4ae82,0x9c8b6a,0xb8a888,0x2a2a2e,0x6f6f74],SHORTC=[0xc4ae82,0x4a6488,0x2d4a6e,0xe9e4d8,0x5d6b4a],DRESSC=[0xe2b93b,0xc8362b,0x8fb7d6,0xf4f0e7,0x2f7d4f,0xe8a0b0,0x6a3d8f,0xf0a050],
  TRACKC=[0x1d3f7a,0x2f2f33,0x7a1f3d,0x2f6a5a,0x6a3d8f],CAPC=[0xc8362b,0x1d3f7a,0x2f2f33,0xf4f0e7,0x2f7d4f,0xe2b93b],BAGC=[0xb08a5a,0xf2f0ea,0xc8362b,0x2d4a6e,0xe2b93b,0x2f7d4f,0x6a3d8f];
// what one person wears, by what they are doing: polos, tees, tanks, sundresses, tracksuits, a bathrobe; caps, visors, sun hats
function civOutfit(role){const f=R()<.5,old=R()<.22,o={role,f,old,skin:RP(SKIN),hair:old?RP([0x8b8783,0xdcd8d0,0xb7b2aa]):RP(HAIRC),hs:f?RP(['long','pony','bun','bob','long']):RP(['short','short','crew','bald']),
    hat:'',hatC:RP(CAPC),top:RP(f?['tee','tee','polo','tank','dress','button']:['tee','tee','polo','polo','button','tank']),topC:RP(TOPC),bot:RP(f?['jeans','shorts','skirt','khakis']:['jeans','khakis','shorts','khakis']),botC:0,
    shoe:RP([0x2a2622,0xe8e4da,0x6b4a2a,0x3a3a3e,0xd8d4cc]),sole:0xe8e4da,wide:R2(.93,1.08),belly:!f&&R()<.22,glasses:old&&R()<.6,stache:!f&&R()<.16,sock:false,flip:false,glove:0,bag:0,bag2:0,purse:false,prop:'',phones:false,print:R()<.4?RP(TOPC):0,bikeC:0};
  if(o.top==='dress')o.topC=RP(DRESSC);if(R()<.15)o.hat=f?'sun':'cap';
  if(role==='jog'){o.top=RP(['tank','tee','tee','track']);o.bot=o.top==='track'?'track':'shorts';o.topC=o.top==='track'?RP(TRACKC):RP([0xf4f0e7,0xc8362b,0x8fb7d6,0xe3c35c,0x2f2f33,0xe8a0b0]);o.shoe=0xf4f2ec;o.sock=true;o.hat=RP(['cap','visor','band','']);o.phones=R()<.45;if(f&&o.hs!=='bob')o.hs='pony';o.print=0;}
  else if(role==='bike'){o.top=RP(['tee','tank','polo']);o.bot='shorts';o.hat='helmet';o.hatC=RP([0xe2b93b,0xc8362b,0xf4f0e7,0x2d4a6e]);o.shoe=0xe8e4da;o.sock=true;o.bikeC=RP([0x2f8f8a,0xc8362b,0x1d3f7a,0xe8a0b0,0xf4f0e7,0x2f7d4f]);}
  else if(role==='water'){if(R()<.45){o.top='robe';o.topC=RP([0xe9e2d2,0x8fb7d6,0xd8a0a8,0x7a3b5e]);}else{o.top='tee';o.bot='shorts';}o.flip=true;o.shoe=RP([0x2a2622,0x2d6fd8,0x6b4a2a]);o.prop='hose';o.hat=R()<.3?'sun':'';}
  else if(role==='wash'){o.top=RP(['tank','tee']);o.bot='shorts';o.flip=R()<.6;o.prop='sponge';o.hat=R()<.4?'cap':'';}
  else if(role==='mow'||role==='blow'){o.top=RP(['button','tee','track']);o.topC=o.top==='track'?RP(TRACKC):RP([0x8a8f93,0x6d7f8c,0xc4ae82,0x4f8a3c,0xf4f0e7,0x3a4e6e]);o.bot=o.top==='track'?'track':'jeans';o.glove=0xc9b48a;o.prop=role;o.hat=RP(['sun','cap','sun']);o.print=0;}
  else if(role==='shop'){o.bag=RP(BAGC);if(R()<.5)o.bag2=RP(BAGC);o.purse=f&&R()<.45;}
  if(o.bot==='skirt'&&!f)o.bot='khakis';o.botC=o.bot==='jeans'?RP(JEANC):o.bot==='shorts'?RP(SHORTC):o.bot==='skirt'?RP(DRESSC):o.bot==='track'?o.topC:RP(PANTC);
  if(role==='jog'&&o.bot==='shorts')o.botC=RP([0x2a2a2e,0x1d3f7a,0x8a8f93,0xc8362b]);if(role==='mow'||role==='blow')o.botC=RP(JEANC);
  if(o.hat==='sun')o.hatC=RP([0xd9c38a,0xf2efe6,0xe8c2d4,0xd9c38a]);
  return o;}
// the body parts of one outfit; origins on the joints, front towards -z (as the soldiers')
function civParts(o){const S=o.skin,T1=o.topC,H=o.hair,w=o.wide*(o.f?.9:1),top=o.top,sl=top==='track'||top==='button'||top==='robe',bare=top==='tank'||top==='dress',
    skirt=top==='dress'||top==='robe'||o.bot==='skirt',legC=o.botC,shortLeg=skirt||o.bot==='shorts',out={};let b=new GB();
  // upper body, origin at the waist
  b.add(CG.torso,0,0,0,0,0,0,.235*w,.53,.145,T1);if(o.belly)b.add(CG.ball,0,.2,-.05,0,0,0,.21*w,.2,.15,T1);
  b.add(CG.blob,-.245*w,.46,0,0,0,0,.09,.085,.1,bare?S:T1);b.add(CG.blob,.245*w,.46,0,0,0,0,.09,.085,.1,bare?S:T1);
  if(bare){b.add(CG.blob,0,.47,0,0,0,0,.19*w,.075,.13,S);if(top==='dress')for(const s of [-1,1])b.add(CG.box,s*.1*w,.36,-.004,0,0,0,.03,.16,.152,T1);}
  if(top==='polo'||top==='button'){b.add(CG.ring,0,.6,0,0,0,0,.072,.065,.078,T1);b.add(CG.box,0,top==='button'?.04:.36,-.147,0,0,0,.022,top==='button'?.48:.15,.01,shade(T1,.84));}
  else if(top==='track')b.add(CG.box,0,0,-.147,0,0,0,.014,.53,.01,0xe9e5dc);
  else if(top==='robe'){for(const s of [-1,1])b.add(CG.box,s*.055,.22,-.148,0,0,s*.35,.04,.3,.01,shade(T1,.86));b.add(CG.ring,0,.16,0,0,0,0,.24*w,.04,.15,shade(T1,.8));}
  else if(top==='tee'&&o.print)b.add(CG.box,0,.24,-.148,0,0,0,.12,.1,.01,o.print);
  if(o.purse){b.add(CG.box,0,.18,-.146,0,0,.75,.016,.42,.01,0x5a3e2a);b.add(CG.box,.2*w,-.12,.02,0,0,0,.06,.18,.2,0x7a3b1e);}
  if(o.prop==='blow'){b.add(CG.box,0,.06,.17,0,0,0,.3,.38,.18,0xd8412f);b.add(CG.cyl,0,.2,.26,PI/2,0,0,.08,.1,.08,0x2a2a2a);}
  b.add(CG.limb,0,.62,0,0,0,0,.055,.12,.06,S);b.add(CG.ball,0,.69,0,0,0,0,.1,.122,.112,S);b.add(CG.blob,0,.668,-.106,0,0,0,.02,.028,.024,shade(S,.92));
  const hs=o.hs;if(hs==='bald')b.add(CG.ring,0,.72,.012,0,0,0,.106,.06,.116,H);
  else{const big=hs==='bob'||hs==='long';b.add(CG.cap,0,.705,.012,0,0,0,big?.114:.109,hs==='crew'?.108:.118,big?.124:.12,H);
    if(hs==='long')b.add(CG.box,0,.5,.055,0,0,0,.2,.22,.06,H);else if(hs==='bob')b.add(CG.ring,0,.72,.008,0,0,0,.117,.12,.125,H);
    else if(hs==='pony')b.add(CG.limb,0,.73,.1,-.45,0,0,.032,.2,.032,H);else if(hs==='bun')b.add(CG.blob,0,.8,.07,0,0,0,.052,.05,.052,H);}
  for(const s of [-1,1])b.add(CG.box,s*.036,.686,-.104,0,0,0,.02,.013,.008,0x221a14);b.add(CG.box,0,.638,-.103,0,0,0,.034,.007,.006,shade(S,.7));       // eyes, mouth
  if(o.stache)b.add(CG.box,0,.645,-.108,0,0,0,.06,.016,.012,H);if(o.glasses){for(const s of [-1,1])b.add(CG.ring,s*.037,.7,-.106,PI/2,0,0,.026,.008,.018,0x3a3836);b.add(CG.box,0,.69,-.112,0,0,0,.022,.006,.006,0x3a3836);}
  const hc=o.hatC;
  if(o.hat==='cap'){b.add(CG.cap,0,.72,0,0,0,0,.117,.106,.127,hc);b.add(CG.box,0,.71,-.15,0,0,0,.18,.016,.11,hc);}
  else if(o.hat==='visor'){b.add(CG.ring,0,.775,0,0,0,0,.113,.035,.123,hc);b.add(CG.box,0,.74,-.15,0,0,0,.18,.016,.1,hc);}
  else if(o.hat==='band')b.add(CG.ring,0,.77,0,0,0,0,.111,.03,.121,hc);
  else if(o.hat==='sun'){b.add(CG.disc,0,.74,0,0,0,0,.25,.016,.25,hc);b.add(CG.cap,0,.745,0,0,0,0,.12,.105,.13,hc);b.add(CG.ring,0,.78,0,0,0,0,.123,.028,.133,shade(hc,.6));}
  else if(o.hat==='helmet'){b.add(CG.cap,0,.715,.01,0,0,0,.135,.13,.15,hc);b.add(CG.box,0,.7,-.16,.3,0,0,.13,.02,.05,0x2a2a2a);}
  if(o.phones){b.add(CG.box,0,.815,0,0,0,0,.21,.016,.025,0x2a2a2a);for(const s of [-1,1])b.add(CG.blob,s*.108,.69,0,0,0,0,.025,.035,.035,0x2a2a2a);}
  out.up=b.build();
  // hips: trousers or shorts, or the skirt of a dress or a robe
  b=new GB();
  if(top==='dress'||top==='robe')b.add(CG.flare,0,.1,0,0,0,0,.215*w,top==='robe'?.62:.55,.17,T1);
  else{b.add(CG.torso,0,-.1,0,0,0,0,.205*w,.2,.14,legC);if(o.bot==='skirt')b.add(CG.flare,0,0,0,0,0,0,.21*w,.46,.165,legC);if(top==='polo'||top==='button')b.add(CG.ring,0,.06,0,0,0,0,.208*w,.045,.143,0x2a2622);}
  out.hips=b.build();
  b=new GB();if(sl){b.add(CG.limb,0,0,0,0,0,0,.064,.36,.064,T1);b.add(CG.blob,0,-.36,0,0,0,0,.054,.054,.054,T1);if(top==='track')for(const s of [-1,1])b.add(CG.box,s*.058,-.34,0,0,0,0,.01,.34,.025,0xf4f0e7);}
  else if(bare){b.add(CG.limb,0,0,0,0,0,0,.057,.36,.057,S);b.add(CG.blob,0,-.36,0,0,0,0,.047,.047,.047,S);}
  else{b.add(CG.limb,0,.01,0,0,0,0,.071,.17,.071,T1);b.add(CG.limb,0,-.14,0,0,0,0,.054,.22,.054,S);b.add(CG.blob,0,-.36,0,0,0,0,.047,.047,.047,S);}
  out.arm=b.build();
  const fore=p=>{const g=new GB();g.add(CG.limb,0,0,0,0,0,0,.05,.27,.05,sl?T1:S);if(sl&&top!=='robe')g.add(CG.ring,0,-.25,0,0,0,0,.046,.04,.046,S);g.add(CG.blob,0,-.31,0,0,0,0,.044,.06,.05,o.glove||S);
    if(p==='bag'||p==='bag2'){const c=p==='bag'?o.bag:o.bag2;g.add(CG.box,0,-.69,0,0,0,0,.24,.3,.12,c);g.add(CG.box,0,-.39,0,0,0,0,.012,.06,.1,shade(c,.7));}
    else if(p==='hose')g.add(CG.cyl,0,-.47,-.01,0,0,0,.022,.13,.022,0x2f7d4f);else if(p==='sponge')g.add(CG.box,0,-.42,-.02,0,0,0,.1,.06,.07,0xe8d23a);
    else if(p==='blow')g.add(CG.cyl,0,-1,-.03,0,0,0,.034,.66,.034,0x3a3b3e);return g.build();};
  out.foreL=fore(o.bag2?'bag2':'');out.foreR=fore(o.bag?'bag':o.prop==='hose'?'hose':o.prop==='sponge'?'sponge':o.prop==='blow'?'blow':'');
  b=new GB();if(skirt){b.add(CG.limb,0,.03,0,0,0,0,.08,.47,.085,S);b.add(CG.blob,0,-.44,-.01,0,0,0,.062,.062,.062,S);}
  else if(o.bot==='shorts'){b.add(CG.limb,0,.03,0,0,0,0,.097,.25,.102,legC);b.add(CG.limb,0,-.2,0,0,0,0,.072,.26,.076,S);b.add(CG.blob,0,-.44,-.01,0,0,0,.064,.064,.064,S);}
  else{b.add(CG.limb,0,.03,0,0,0,0,.093,.47,.098,legC);b.add(CG.blob,0,-.44,-.01,0,0,0,.071,.071,.071,legC);}
  out.thigh=b.build();
  b=new GB();b.add(CG.limb,0,0,0,0,0,0,shortLeg?.062:.069,.37,shortLeg?.066:.073,shortLeg?S:legC);if(o.sock)b.add(CG.limb,0,-.27,0,0,0,0,.058,.11,.062,0xf4f2ec);
  if(o.flip){b.add(CG.blob,0,-.435,-.05,0,0,0,.045,.03,.1,S);b.add(CG.box,0,-.47,-.05,0,0,0,.1,.016,.25,o.shoe);}
  else{b.add(CG.blob,0,-.425,-.05,0,0,0,.058,.048,.122,o.shoe);b.add(CG.box,0,-.47,-.05,0,0,0,.112,.022,.25,o.sole);}
  out.shin=b.build();
  // things that go with the body: a lawn mower pushed ahead, a beach cruiser (the body sits .3 lower when riding), a bucket
  if(o.prop==='mow'||o.bikeC||o.prop==='sponge'){b=new GB();
    if(o.prop==='mow'){b.add(CG.box,0,.05,-1.12,0,0,0,.52,.2,.6,0xc8362b);b.add(CG.cyl,0,.25,-1.16,0,0,0,.13,.15,.13,0x2a2a2a);for(const x of [-.25,.3])for(const z of [-.9,-1.36])b.add(CG.disc,x,.09,z,0,0,PI/2,.09,.05,.09,0x1b1a19);
      for(const s of [-1,1])b.add(CG.box,s*.2,.2,-.86,.53,0,0,.025,.86,.025,0x9aa1a3);b.add(CG.box,0,.9,-.43,0,0,0,.44,.025,.025,0x2a2a2a);}
    if(o.bikeC){const y=.3,fc=o.bikeC,rod=(y0,z0,y1,z1,r,c)=>b.add(CG.cyl,0,y0+y,z0,Math.atan2(z1-z0,y1-y0),0,0,r,Math.hypot(y1-y0,z1-z0),r,c);
      for(const z of [-.62,.5]){b.add(CG.disc,.02,.34+y,z,0,0,PI/2,.34,.04,.34,0x1b1a19);b.add(CG.disc,.025,.34+y,z,0,0,PI/2,.27,.05,.27,0xc9ccc8);}
      rod(.3,-.02,.66,.12,.022,fc);rod(.3,-.02,.84,-.48,.025,fc);rod(.63,.1,.83,-.46,.02,fc);rod(.85,-.48,.34,-.62,.018,fc);rod(.3,-.02,.34,.5,.016,fc);rod(.64,.12,.34,.5,.014,fc);rod(.84,-.48,.98,-.5,.018,0x9aa1a3);
      b.add(CG.box,0,.66+y,.12,0,0,0,.12,.05,.24,0x2a2622);b.add(CG.box,0,.98+y,-.5,0,0,0,.56,.025,.025,0x9aa1a3);}
    if(o.prop==='sponge'){b.add(CG.cyl,.62,0,-.15,0,0,0,.15,.3,.15,0x2d6fd8);b.add(CG.disc,.62,.27,-.15,0,0,0,.13,.02,.13,0xd6eef8);}
    out.root=b.build();}
  return out;}
function civGeo(o){const G0=civParts(o),J=civJoints(o),W=[];for(let q=0;q<11;q++){const p=J[q].slice(),pr=CP[q];if(pr>=0){p[0]+=W[pr][0];p[1]+=W[pr][1];p[2]+=W[pr][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.foreL,3],[G0.arm,4],[G0.foreR,5],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];if(G0.root)list.push([G0.root,0,[0,0,0]]);
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],bn=it[1],of=it[2]||W[bn],Pp=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k0=p.length/3;
    for(let i=0;i<Pp.count;i++){p.push(Pp.getX(i)+of[0],Pp.getY(i)+of[1],Pp.getZ(i)+of[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));u.push(U.getX(i),U.getY(i));si.push(bn,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k0+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return g;}
function addCiv(x,z,role,o){o=o||civOutfit(role);const J=civJoints(o),g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(J[k][0],J[k][1],J[k][2]);B.push(b);if(CP[k]>=0)B[CP[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(civGeo(o),civMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const c={civ:true,role,o,x,z,y0:PADY,yW:PADY,yT:0,yaw:R()*TAU,hp:60,alive:true,sc:1,crouch:0,ph:R()*6,ph0:R()*9,moveAmt:0,run:role==='jog',mx:0,mz:0,spd:0,st:'walk',t:R2(8,30),
    L:null,lt:0,dir:1,off:0,side:0,sideT:0,probeT:R()*.3,stuckT:0,stuckN:0,lastX:x,lastZ:z,flinch:0,dog:-1,lead:null,mate:null,home:null,seat:null,yard:null,drive:null,scared:false,hurt:false,gone:false,
    deadT:0,fall:1,visT:R(),bike:role==='bike',crank:0,cruise:role==='jog'?R2(2.6,3.2):role==='bike'?R2(4.3,5.4):role==='shop'?R2(1,1.2):role==='dog'?R2(1,1.15):R2(1.2,1.45),
    g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10]};
  g.position.set(x,c.y0,z);g.rotation.y=c.yaw;scene.add(g);civs.push(c);return c;}
function removeCiv(c){scene.remove(c.g);try{c.mesh.geometry.dispose();c.mesh.skeleton.dispose();}catch(e){}
  if(c.dog>=0&&dogs[c.dog]){dogs[c.dog].on=false;dogs[c.dog].owner=null;}c.dog=-1;if(c.seat){c.seat.used=0;c.seat=null;}if(c.yard){c.yard.used=0;c.yard=null;}if(c.drive){c.drive.used=0;c.drive=null;}
  for(const k in LIFE.yard)if(LIFE.yard[k]===c)LIFE.yard[k]=null;for(const o of civs){if(o.lead===c)o.lead=null;if(o.mate===c)o.mate=null;}}

// ---------- what people say and shout
const CIV_HURT=['Ray! Those are taxpayers!','Watch your fire! That is a neighbour!','Ray, we fine the neighbours. We do not shoot them.','Check your fire! The khakis are the bad guys. KHAKIS!','Not the residents, Ray! I have to live with these people.'];
const CIV_ROLE={jog:'Ray! You shot a jogger. They are annoying, but they are not the enemy.',dog:'Ray! He was walking his DOG.',bike:'Not the cyclist, Ray! He has the right of way.',water:'Ray! That is Mr. Henderson! He was watering his lawn!',
  wash:'Ray! That man was washing his car!',mow:'Ray! He was mowing! That is a CC and R compliance activity!',blow:'Ray! The leaf blower guy is a neighbour too. Probably.',shop:'Ray! She was SHOPPING.',sit:'Ray! He was sitting on a bench!'};
const CIV_KILL=['Ray. Hold your fire. HOLD. YOUR. FIRE.','Somebody call an ambulance. And then call the HOA.','That was a resident, Ray. One more and we are starting over.'];
function sndShout(x,z,f,pain){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,10);if(s.d>90)return;const c=AU.ctx,t=c.currentTime,o=aOut((pain?.3:.2)*s.vol,s.pan),os=c.createOscillator(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain(),
    f0=(f?300:185)*R2(.9,1.15),d=pain?.55:.3;os.type='sawtooth';os.frequency.setValueAtTime(f0*.9,t);os.frequency.linearRampToValueAtTime(f0*(pain?1.6:1.35),t+d*.3);os.frequency.linearRampToValueAtTime(f0*(pain?1.1:.95),t+d);
  f1.type='bandpass';f1.frequency.value=pain?950:760;f1.Q.value=2.4;f2.type='lowpass';f2.frequency.value=Math.min(2600,s.lp);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(1,t+.04);g.gain.setValueAtTime(1,t+d*.7);g.gain.exponentialRampToValueAtTime(.001,t+d);
  os.connect(f1);f1.connect(f2);f2.connect(g);g.connect(o);os.start(t);os.stop(t+d+.05);}catch(e){}}
function sndBark(x,z,n,far){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,far?40:10);if(s.d>170)return;const o=aOut((far?.1:.24)*s.vol,s.pan);
  for(let k=0;k<n;k++){const d=k*R2(.22,.34);osc(o,'sawtooth',far?260:340,far?150:200,.1,.5,d);osc(o,'square',far?130:170,far?90:120,.09,.22,d);}}catch(e){}}
function sndHorn(x,z){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,20),o=aOut(.2*s.vol,s.pan);osc(o,'square',392,392,.42,.28);osc(o,'square',494,494,.42,.2);}catch(e){}}

// ---------- behaviour
function lifeBusy(x,z){if(LIFE.test)return false;if(LIFE.alarm<25&&Math.hypot(x-LIFE.nx,z-LIFE.nz)<95)return true;
  for(let k=0;k<foes.length;k++){const s=foes[k];if(s.alive&&Math.abs(s.x-x)<46&&Math.abs(s.z-z)<46&&Math.hypot(s.x-x,s.z-z)<(s.aware?46:30))return true;}
  const st=MS.st;if(G.mode==='mission'&&st&&!MS.done&&st.type!=='chase'&&Math.hypot(x-st.x,z-st.z)<st.r+25&&(aliveFoes(st.key)>0||st.type!=='eliminate'))return true;
  return G.mode==='survival'&&Math.hypot(x-SURV.x,z-SURV.z)<95;}
const laneOK=(c,N)=>c.bike?N.k==='trail':LIFE.chase&&N.k==='trail'?false:c.role==='shop'?N.k==='shop'||N.k==='lot'||N.k==='ave':N.k==='lot'?false:N.k==='shop'?c.role==='walk'||c.role==='sit':true;
function civScare(c){if(!c.alive||c.scared)return;c.scared=true;if(c.seat){c.seat.used=0;c.seat=null;}c.st='startle';c.t=R2(.15,.6);
  if(LIFE.shoutT<=0&&R()<.6){LIFE.shoutT=.45;sndShout(c.x,c.z,c.o.f,false);}}
function civFlee(c){c.run=true;c.cruise=c.bike?R2(7,8.5):R2(4.3,5.5);c.t=R2(10,16);c.crouch=0;
  if(c.lead&&c.lead.alive){c.st='follow';return;}c.lead=null;
  if(c.home){c.st='home';return;}                                                                 // people at home run indoors
  if(!c.L){const q=nearLane(c.x,c.z,24);if(q){c.L=q[0];c.lt=q[1];c.off=0;}}
  if(!c.L){c.st='away';return;}
  const ax=c.x-LIFE.nx,az=c.z-LIFE.nz;c.dir=(c.L.dx*ax+c.L.dz*az)>=0?1:-1;
  if(c.L.inx&&R()<.6){c.st='home';c.home=[c.x+c.L.inx*6,c.z+c.L.inz*6];return;}                     // into the nearest shop
  c.st='flee';}
// steering along the current lane (with a sidestep round posts), and what happens at crossings and ends
function civLaneMove(c,dt,sp){const L0=c.L;if(c.sideT>0)c.sideT-=dt;else c.side=0;const la=clamp(c.lt+c.dir*2.2,0,L0.len),tx=lnX(L0,la,c.off+c.side),tz=lnZ(L0,la,c.off+c.side),dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz)||1;
  c.mx=dx/d;c.mz=dz/d;c.spd=sp;face(c,c.x+c.mx,c.z+c.mz,dt,c.run?8:5);
  c.probeT-=dt;if(c.probeT<=0){c.probeT=.3;const reach=c.bike?3:1.5,t=rayWorld(c.x,c.y0+.9,c.z,c.mx,0,c.mz,reach);
    if(t<reach&&RHc){if(Math.max(RHc.x1-RHc.x0,RHc.z1-RHc.z0)<1.3&&c.sideT<=0){c.side=(R()<.5?-1:1)*.95;c.sideT=2.2;}else if(c.st==='flee'){c.st='hide';c.t=R2(4,8);}else c.dir=-c.dir;}
    else if(inQuiet(c.x+c.mx*3,c.z+c.mz*3))c.dir=-c.dir;}}
function civTake(c,j,atEnd){const N=LANES[j.l];if(!laneOK(c,N))return false;const ends=j.u<1?[1]:j.u>N.len-1?[-1]:[1,-1];
  if(c.st==='flee'){const ax=c.x-LIFE.nx,az=c.z-LIFE.nz,al=Math.hypot(ax,az)||1;let bd=0,bs=atEnd?-9:(c.L.dx*c.dir*ax+c.L.dz*c.dir*az)/al;
    for(const e of ends){const s=(N.dx*e*ax+N.dz*e*az)/al+R()*.25;if(s>bs){bs=s;bd=e;}}if(!bd)return false;c.L=N;c.lt=j.u;c.dir=bd;return true;}
  if(!atEnd&&R()>(c.role==='dog'?.4:c.role==='jog'?.22:.3))return false;
  const e=RP(ends),tt=clamp(j.u+e*6,0,N.len),tx=lnX(N,tt,0),tz=lnZ(N,tt,0);if(inQuiet(tx,tz)||lifeBusy(tx,tz))return false;
  c.L=N;c.lt=j.u;c.dir=e;c.off=R2(-.25,.25);return true;}
function civLaneAdvance(c){const L0=c.L,t0=c.lt,t1=clamp((c.x-L0.ax)*L0.dx+(c.z-L0.az)*L0.dz,0,L0.len);c.lt=t1;if(c.st!=='walk'&&c.st!=='flee'&&c.st!=='leave')return;
  for(const j of L0.J){if(j.t===t0||(j.t-t0)*(j.t-t1)>0)continue;if((j.t<1&&c.dir<0)||(j.t>L0.len-1&&c.dir>0))continue;if(civTake(c,j,false))return;}
  if((c.dir>0&&t1>L0.len-.7)||(c.dir<0&&t1<.7)){const end=c.dir>0?L0.len:0;for(const j of L0.J)if(Math.abs(j.t-end)<3&&civTake(c,j,true))return;
    if(c.st==='flee'){c.st='hide';c.t=R2(4,8);}else c.dir=-c.dir;}}
function civIdle(c){c.t=R2(12,35);if(c.role==='jog'||c.role==='bike'||c.lead||c.st!=='walk')return;
  if(R()<.55){c.st='pause';c.t=R2(2,5);c.look=c.L&&c.L.inx&&R()<.75?Math.atan2(-c.L.inx,-c.L.inz):c.yaw+R2(-1.6,1.6);}}
function civStand(c){const q=nearLane(c.x,c.z,22);if(!q||!laneOK(c,q[0])){c.t=R2(20,40);return;}if(c.seat){c.seat.used=0;c.seat=null;}c.L=q[0];c.lt=q[1];c.dir=R()<.5?1:-1;c.off=R2(-.2,.2);
  c.st='join';c.tx=lnX(q[0],q[1],c.off);c.tz=lnZ(q[0],q[1],c.off);c.crouch=0;}
// at home: water the lawn (the hose sweeps), wash the car (a shuffle along it now and then), mow or blow up and down the yard
function civYard(c,dt){c.t-=dt;
  if(c.st==='water'){const d=Math.hypot(c.ax-c.x,c.az-c.z);if(d>.4){c.mx=(c.ax-c.x)/d;c.mz=(c.az-c.z)/d;c.spd=.8;}
    const want=c.yaw0+Math.sin(G.time*.35+c.ph0)*.7;c.yaw+=clamp(angDiff(want,c.yaw),-dt,dt);c.g.rotation.y=c.yaw;}
  else if(c.st==='wash'){if(c.t<=0){c.t=R2(4,9);c.wv=R2(-c.lv,c.lv);}const tx=c.ax+c.vx*c.wv,tz=c.az+c.vz*c.wv,d=Math.hypot(tx-c.x,tz-c.z);
    if(d>.3){c.mx=(tx-c.x)/d;c.mz=(tz-c.z)/d;c.spd=.7;}c.yaw+=clamp(angDiff(c.yaw0,c.yaw),-dt*3,dt*3);c.g.rotation.y=c.yaw;}
  else{const tx=c.ax+c.ux*c.mw*c.sd3,tz=c.az+c.uz*c.mw*c.sd3,d=Math.hypot(tx-c.x,tz-c.z);if(d<.45||c.stuckN>0){c.sd3=-c.sd3;c.pauseT=.8;c.stuckN=0;}
    if(c.pauseT>0){c.pauseT-=dt;face(c,c.ax+c.ux*c.mw*c.sd3,c.az+c.uz*c.mw*c.sd3,dt,2.5);}else{c.mx=(tx-c.x)/d;c.mz=(tz-c.z)/d;c.spd=c.st==='mow'?.75:.35;face(c,tx,tz,dt,2.5);}}}
function updCiv(c,dt){c.mx=0;c.mz=0;c.spd=0;if(c.flinch>0)c.flinch-=dt;const dn=Math.hypot(c.x-LIFE.nx,c.z-LIFE.nz);
  if(!c.scared&&LIFE.alarm<1.2&&dn<115)civScare(c);
  if(!c.L&&(c.st==='walk'||c.st==='flee')){const q=nearLane(c.x,c.z,30);if(q&&laneOK(c,q[0])){c.L=q[0];c.lt=q[1];c.off=0;}else if(c.st==='flee'){c.st='away';c.t=R2(4,7);}else{c.st='pause';c.t=R2(3,6);c.look=c.yaw;}}
  const st=c.st;
  if(st==='walk'){civLaneMove(c,dt,c.cruise);c.t-=dt;if(c.t<=0)civIdle(c);}
  else if(st==='pause'){c.t-=dt;face(c,c.x-Math.sin(c.look),c.z-Math.cos(c.look),dt,2.5);if(c.t<=0){c.st='walk';c.t=R2(12,35);}}
  else if(st==='follow'){const L1=c.lead;if(!L1||!L1.alive||L1.gone){c.lead=null;if(c.scared)civFlee(c);else{c.st='walk';if(!c.L)c.st='away';}}
    else{const tx=L1.x+Math.cos(L1.yaw)*c.pside*.75,tz=L1.z-Math.sin(L1.yaw)*c.pside*.75,d=Math.hypot(tx-c.x,tz-c.z);
      if(L1.st==='pause'&&!c.scared){if(d>1.4){c.mx=(tx-c.x)/d;c.mz=(tz-c.z)/d;c.spd=1.2;}face(c,L1.x,L1.z,dt,4);}
      else if(d>.3){c.mx=(tx-c.x)/d;c.mz=(tz-c.z)/d;c.spd=Math.min(c.scared?6:2.2,(L1.spd||L1.cruise)*(d>1.5?1.35:1));face(c,c.x+c.mx,c.z+c.mz,dt,6);}
      else face(c,c.x-Math.sin(L1.yaw),c.z-Math.cos(L1.yaw),dt,4);c.run=L1.run;if(L1.gone)c.gone=true;}}
  else if(st==='sit'){c.t-=dt;if(c.t<=0)civStand(c);}
  else if(st==='join'){const d=Math.hypot(c.tx-c.x,c.tz-c.z);if(d<.6){c.st='walk';c.t=R2(10,30);}else{c.mx=(c.tx-c.x)/d;c.mz=(c.tz-c.z)/d;c.spd=1.2;face(c,c.tx,c.tz,dt,5);}}
  else if(st==='water'||st==='wash'||st==='mow'||st==='blow')civYard(c,dt);
  else if(st==='startle'){c.t-=dt;c.crouch=Math.min(.55,c.crouch+dt*4);face(c,LIFE.nx,LIFE.nz,dt,7);if(c.t<=0)civFlee(c);}
  else if(st==='flee'){civLaneMove(c,dt,c.cruise);c.t-=dt;if((dn>80&&LIFE.alarm>2.5)||c.t<=0){c.st='leave';c.run=false;c.cruise=c.bike?5:1.7;}}
  else if(st==='leave'){if(c.L)civLaneMove(c,dt,c.cruise);else{const ax=c.x-LIFE.nx,az=c.z-LIFE.nz,al=Math.hypot(ax,az)||1;c.mx=ax/al;c.mz=az/al;c.spd=1.6;face(c,c.x+c.mx,c.z+c.mz,dt,4);}}
  else if(st==='home'){const d=Math.hypot(c.home[0]-c.x,c.home[1]-c.z);if(d<1||c.stuckN>0)c.gone=true;else{c.mx=(c.home[0]-c.x)/d;c.mz=(c.home[1]-c.z)/d;c.spd=c.cruise;face(c,c.home[0],c.home[1],dt,9);
      c.probeT-=dt;if(c.probeT<=0){c.probeT=.2;if(rayWorld(c.x,c.y0+.9,c.z,c.mx,0,c.mz,.9)<.9)c.gone=true;}}}
  else if(st==='away'){const ax=c.x-LIFE.nx,az=c.z-LIFE.nz,al=Math.hypot(ax,az)||1;c.mx=ax/al;c.mz=az/al;c.spd=c.cruise;face(c,c.x+c.mx,c.z+c.mz,dt,8);c.t-=dt;if(c.t<=0||dn>70){c.st='leave';c.run=false;}}
  else if(st==='hide'){c.crouch=Math.min(.8,c.crouch+dt*3);face(c,LIFE.nx,LIFE.nz,dt,3);c.t-=dt;if(LIFE.alarm<.5&&dn<25){c.crouch=0;c.st='away';c.t=R2(4,7);}else if(LIFE.alarm>10&&c.t<=0){c.crouch=0;c.st='leave';c.run=false;c.cruise=1.6;}}
  stepCiv(c,dt);if(c.L&&(c.st==='walk'||c.st==='flee'||c.st==='leave'))civLaneAdvance(c);animCiv(c,dt);}
function stepCiv(c,dt){let mx=c.mx,mz=c.mz;const sp=c.spd,still=c.st==='sit';
  if(!still)for(let k=0;k<civs.length;k++){const o=civs[k];if(o===c||!o.alive||o===c.lead||o.lead===c)continue;const ax=c.x-o.x,az=c.z-o.z,a2=ax*ax+az*az;if(a2<.7&&a2>1e-4){const a=Math.sqrt(a2);mx+=ax/a*.5;mz+=az/a*.5;}}
  let px=0,pz=0;if(!still){if(P.alive){const ax=c.x-P.x,az=c.z-P.z,a2=ax*ax+az*az;if(a2<4.8&&a2>1e-4){const a=Math.sqrt(a2);px=ax/a*2.4;pz=az/a*2.4;}}   // step aside for the player
    for(const L1 of [allies,foes])for(let k=0;k<L1.length;k++){const o=L1[k];if(!o.alive)continue;const ax=c.x-o.x,az=c.z-o.z,a2=ax*ax+az*az;if(a2<1.6&&a2>1e-4){const a=Math.sqrt(a2);px+=ax/a*1.8;pz+=az/a*1.8;}}}
  const ox=c.x,oz=c.z;if(sp>0&&(mx||mz)){const l=Math.max(1,Math.hypot(mx,mz));c.x+=mx/l*sp*dt;c.z+=mz/l*sp*dt;}if(px||pz){c.x+=px*dt;c.z+=pz*dt;}
  if(c.x!==ox||c.z!==oz){pushOut(c,c.bike?.4:.34,0);for(let k=0;k<traffic.length;k++)if(traffic[k].on)carPush(traffic[k],c,.35);c.x=clamp(c.x,BOUND.x0,BOUND.x1);c.z=clamp(c.z,BOUND.z0,BOUND.z1);}
  const moved=Math.hypot(c.x-ox,c.z-oz);c.moveAmt=lerp(c.moveAmt,clamp(moved/Math.max(dt,1e-4)/(c.run?3.4:1.5),0,1),Math.min(1,dt*8));if(moved>0){c.ph+=moved*(c.run?2.1:2.6);if(c.bike)c.crank+=moved*2.4;}
  if(sp>0&&!still){c.stuckT+=dt;if(c.stuckT>1.2){if(Math.hypot(c.x-c.lastX,c.z-c.lastZ)<.35*sp){c.stuckN++;if(c.st==='walk'||c.st==='leave')c.dir=-c.dir;else if(c.st==='flee'){c.st='hide';c.t=R2(3,6);}else if(c.st==='join')c.st='walk';if(c.stuckN>4)c.gone=true;}else if(c.st!=='mow'&&c.st!=='blow')c.stuckN=0;
      c.stuckT=0;c.lastX=c.x;c.lastZ=c.z;}}else c.stuckT=0;
  c.yT-=dt;if(c.yT<=0){c.yT=.25;c.yW=c.st==='sit'?0:c.L&&c.L.k==='trail'&&Math.abs(c.z-trailZ(c.x))<3?.05:onArt(c.x,c.z)?0:PADY;}c.y0+=(c.yW-c.y0)*Math.min(1,dt*8);c.g.position.set(c.x,c.y0,c.z);}
// poses: walking and jogging, riding, sitting, the jobs at home, ducking with the hands over the head
function animCiv(c,dt){const m=c.moveAmt,ph=c.ph,run=c.run,st=c.st,T0=G.time+c.ph0,sw=Math.sin(ph)*(run?.95:.62)*m;
  let by=Math.abs(Math.sin(ph))*.03*m*(run?1.6:1),lean=-.05*m*(run?2.6:1),turn=0,aL=-sw*.9,aR=sw*.9,zL=.08,zR=-.08,fL=.15+(run?1.05:.12*m),fR=fL,lL=sw,lR=-sw,
    kL=-Math.max(0,Math.sin(ph+PI*.5))*.8*m*(run?1.35:1),kR=-Math.max(0,Math.sin(ph+PI*1.5))*.8*m*(run?1.35:1),cr=c.crouch;
  if(c.o.bag&&!run){aR=sw*.25;fR=.1;}if(c.o.bag2&&!run){aL=-sw*.25;fL=.1;}if(c.dog>=0&&!run){aL=.35;fL=.5;}
  if(c.bike){const p=c.crank;by=-.3;lean=-.32;aL=aR=1.2;zL=-.1;zR=.1;fL=fR=.35;lL=1.05+Math.sin(p)*.38;lR=1.05-Math.sin(p)*.38;kL=-1.25-Math.cos(p)*.32;kR=-1.25+Math.cos(p)*.32;cr=0;}
  else if(st==='sit'){by=-.36;lean=.08;lL=lR=1.45;kL=kR=-1.45;aL=aR=.55;fL=fR=.9;zL=.15;zR=-.15;cr=0;turn=Math.sin(T0*.3)*.25;}
  else if(st==='water'){aR=.95;fR=.25;zR=-.05;aL=.45;fL=.6;}
  else if(st==='wash'){const q=T0*5.5;lean=.3;aR=1.05+Math.sin(q)*.28;zR=-.25+Math.cos(q)*.22;fR=.45;aL=.2;fL=.4;}
  else if(st==='mow'){aL=aR=.75;fL=fR=.45;zL=-.05;zR=.05;lean=-.12;}
  else if(st==='blow'){aR=.55;fR=.3;aL=.15;fL=.5;turn=Math.sin(T0*1.3)*.45;}
  else if(st==='pause'||(st==='follow'&&c.lead&&c.lead.st==='pause')){const talk=c.mate||c.lead;turn=Math.sin(T0*.7)*.2;if(talk&&!c.o.bag){aR=.3+Math.sin(T0*3.1)*.18;fR=.7+Math.sin(T0*2.3)*.25;}else{aL=-.04;aR=.04;fL=fR=.18;lean=.02;}}
  else if(st==='startle'||st==='hide'){aL=aR=2.5;zL=.45;zR=-.45;fL=fR=1.7;lean=.25;}
  if(cr>0){by-=.42*cr;lL+=1.1*cr;lR+=1.1*cr;kL-=1.9*cr;kR-=1.9*cr;}
  c.body.position.y=by;c.up.rotation.set(lean-(c.flinch>0?.15:0),turn,0);c.aL.rotation.set(aL,0,zL);c.aR.rotation.set(aR,0,zR);c.fL.rotation.x=fL;c.fR.rotation.x=fR;
  c.lL.rotation.x=lL;c.lR.rotation.x=lR;c.kL.rotation.x=kL;c.kR.rotation.x=kR;}
// the player hurt a civilian: Aunt Ro on the radio, 200 points off, and the third one killed in a stage fails it
function civHurt(c,dmg,fx,fz,byPlayer){if(!c.alive||!LIFE.on)return;c.hp-=dmg;c.flinch=.3;if(!c.scared){LIFE.nx=fx;LIFE.nz=fz;civScare(c);c.t=.05;}sndShout(c.x,c.z,c.o.f,true);
  if(byPlayer&&!c.hurt){c.hurt=true;LIFE.hurtN++;LIFE.hurtAll++;G.score-=200;killFeed('-200','Civilian hurt');if(LIFE.sayT<=G.time){LIFE.sayT=G.time+4;radio('AUNT RO',CIV_ROLE[c.role]&&R()<.6?CIV_ROLE[c.role]:RP(CIV_HURT));}}
  if(c.hp>0)return;c.alive=false;c.deadT=0;const hx=c.x-fx,hz=c.z-fz;c.fall=(hx*-Math.sin(c.yaw)+hz*-Math.cos(c.yaw))<0?1:-1;c.crouch=0;c.body.position.y=c.bike?-.3:0;
  c.lL.rotation.x=c.lR.rotation.x=c.kL.rotation.x=c.kR.rotation.x=0;if(c.dog>=0&&dogs[c.dog]){dogs[c.dog].panic=6;}if(c.seat){c.seat.used=0;c.seat=null;}
  if(!byPlayer)return;LIFE.killN++;LIFE.killAll++;
  if(LIFE.killN>=3&&G.mode==='mission'&&LIFE.failT<=0&&!MS.done){LIFE.failT=2;banner('MISSION FAILED','TOO MANY NEIGHBOURS HURT');radio('AUNT RO','That is it. We start over, and you are on probation, Ray.');}
  else if(LIFE.sayT<=G.time+3){LIFE.sayT=G.time+5;radio('AUNT RO',RP(CIV_KILL));}}
// hooks for fire() (06b) and explode() (06a)
function lifeRay(ox,oy,oz,dx,dy,dz,maxT){if(!LIFE.on||!civs.length)return null;const s0=RS.s,t0=RS.t,z0=RS.zone,h=raySoldiers(civs,ox,oy,oz,dx,dy,dz,maxT);if(!h){RS.s=s0;RS.t=t0;RS.zone=z0;}return h;}
function lifeBlast(x,y,z,rad,dmg,byPlayer){if(!LIFE.on)return;for(let k=0;k<civs.length;k++){const c=civs[k];if(!c.alive)continue;const cy=c.y0+1.1,d=Math.hypot(c.x-x,cy-y,c.z-z);if(d>=rad)continue;
    const q=(1-d/rad)*(los(x,y+.7,z,c.x,cy,c.z)?1:.25);if(q>0)civHurt(c,dmg*q,x,z,byPlayer);}}

// ---------- spawning: out of sight, 38 to 105 m away, never where the fighting is; a third of the time someone at home or on a bench
const ROLE_BY={side:[['walk',3],['jog',2.5],['dog',2.5],['pair',1.5]],ave:[['walk',4],['jog',3],['pair',2]],shop:[['shop',6],['pair',2],['walk',1]],lot:[['shop',8],['walk',1]],
  park:[['walk',3],['dog',3],['jog',2],['pair',2]],trail:[['bike',5],['jog',3],['walk',2]]};
function wpick(L1){let s=0;for(const q of L1)s+=q[1];let r=R()*s;for(const q of L1){r-=q[1];if(r<=0)return q[0];}return L1[0][0];}
function spotOK(x,z,d,fx,fz){if(d<(LIFE.test?4:38)||d>(LIFE.test?70:105))return false;if(!freeSpot(fx===undefined?x:fx,fz===undefined?z:fz)||lifeBusy(x,z)||(LIFE.chase&&nearTrail(x,z)))return false;
  for(const c of civs)if(Math.abs(c.x-x)<4&&Math.abs(c.z-z)<4)return false;return LIFE.test||unseen(x,z);}
function trySpawnLane(){const N=LIFE.near;if(!N.length)return false;
  for(let k=0;k<12;k++){const L0=RP(N),t=R()*L0.len,off=R2(-.25,.25),x=lnX(L0,t,off),z=lnZ(L0,t,off);if(!spotOK(x,z,Math.hypot(x-P.x,z-P.z)))continue;
    let role=wpick(ROLE_BY[L0.k]);if(role==='dog'&&!dogs.some(d=>!d.on))role='walk';if(role==='bike'&&LIFE.chase)continue;
    const c=addCiv(x,z,role==='pair'?'walk':role);c.L=L0;c.lt=t;c.off=off;c.dir=R()<.5?1:-1;c.y0=c.yW=L0.y;c.yaw=c.dir>0?Math.atan2(-L0.dx,-L0.dz):Math.atan2(L0.dx,L0.dz);c.g.rotation.y=c.yaw;
    if(role==='pair'){const o=addCiv(x+R2(-.4,.4),z+R2(-.4,.4),'walk');o.lead=c;o.st='follow';o.pside=c.off>0?-1:1;o.L=L0;o.lt=t;o.y0=o.yW=L0.y;o.yaw=c.yaw;c.mate=o;c.cruise=Math.min(c.cruise,1.3);}
    if(role==='dog')attachDog(c);return true;}return false;}
function trySpawnSit(){const cand=SEATS.filter(s=>!s.used&&Math.abs(s.x-P.x)<106&&Math.abs(s.z-P.z)<106);for(let k=0;k<6&&cand.length;k++){const S0=RP(cand);if(!spotOK(S0.x,S0.z,Math.hypot(S0.x-P.x,S0.z-P.z),S0.x-Math.sin(S0.yaw)*1.4,S0.z-Math.cos(S0.yaw)*1.4))continue;
    const c=addCiv(S0.x,S0.z,'sit');c.st='sit';c.seat=S0;S0.used=1;c.yaw=S0.yaw;c.g.rotation.y=c.yaw;c.t=R2(30,90);c.crouch=.8;c.y0=c.yW=0;return true;}return false;}
function trySpawnYard(){const opts=[];if(!LIFE.yard.water)opts.push('water');if(!LIFE.yard.wash&&DRIVES.length)opts.push('wash');if(!LIFE.yard.gard)opts.push(R()<.5?'mow':'blow');if(!opts.length)return false;const role=RP(opts);
  if(role==='wash'){const cand=DRIVES.filter(D=>!D.used&&!D.c.wrecked&&Math.abs(D.x-P.x)<100&&Math.abs(D.z-P.z)<100);for(let k=0;k<6&&cand.length;k++){const D=RP(cand),s=R()<.5?-1:1,uq=D.sw?[0,1]:[1,0],vq=D.sw?[1,0]:[0,1],x=D.x+uq[0]*s*(D.hu+.75),z=D.z+uq[1]*s*(D.hu+.75);
      if(!spotOK(x,z,Math.hypot(x-P.x,z-P.z),D.x+uq[0]*s*(D.hu+2.4),D.z+uq[1]*s*(D.hu+2.4)))continue;const c=addCiv(x,z,'wash');c.st='wash';c.drive=D;D.used=1;LIFE.yard.wash=c;c.ax=x;c.az=z;c.vx=vq[0];c.vz=vq[1];c.lv=D.hv*.55;c.wv=0;c.t=R2(3,8);
      c.yaw=c.yaw0=Math.atan2(uq[0]*s,uq[1]*s);c.g.rotation.y=c.yaw;c.home=[D.x+vq[0]*D.sg*(D.hv+2.2),D.z+vq[1]*D.sg*(D.hv+2.2)];return true;}return false;}
  const cand=YARDS.filter(Y=>!Y.used&&(role!=='mow'||Y.mow)&&Math.abs(Y.x-P.x)<100&&Math.abs(Y.z-P.z)<100&&!(LIFE.spr&&LIFE.spr.Y===Y));
  for(let k=0;k<6&&cand.length;k++){const Y=RP(cand);if(!spotOK(Y.x,Y.z,Math.hypot(Y.x-P.x,Y.z-P.z)))continue;const c=addCiv(Y.x,Y.z,role),s=R()<.5?-1:1;c.st=role;c.yard=Y;Y.used=1;c.ax=Y.x;c.az=Y.z;c.ux=Y.ux;c.uz=Y.uz;c.home=[Y.x+Y.nx*(Y.hd-.5),Y.z+Y.nz*(Y.hd-.5)];
    if(role==='water'){LIFE.yard.water=c;const fx=Y.ux*s+Y.nx*.35,fz=Y.uz*s+Y.nz*.35;c.yaw=c.yaw0=Math.atan2(-fx,-fz);c.hose=[Y.x+Y.nx*(Y.hd-.12)-Y.ux*s*1.8,Y.z+Y.nz*(Y.hd-.12)-Y.uz*s*1.8];}
    else{LIFE.yard.gard=c;c.mw=role==='mow'?3:2.5;c.sd3=s;c.pauseT=0;c.yaw=Math.atan2(-Y.ux*s,-Y.uz*s);}
    c.g.rotation.y=c.yaw;return true;}return false;}
function lifeSpawn(){let n=0,yard=0,sit=0;for(const c of civs)if(c.alive&&!c.gone&&c.st!=='leave'){n++;if(c.yard||c.drive)yard++;if(c.st==='sit')sit++;}if(n>=LIFE.civN)return false;
  const r=R();if(r<.24&&yard<2&&trySpawnYard())return true;if(r<.36&&sit<2&&trySpawnSit())return true;return trySpawnLane();}
function lifeSpawnN(n){nearLanes();let k=0;for(let i=0;i<n*25&&k<n;i++)if(lifeSpawn())k++;return k;} // for the tests

// ---------- dogs on leads (not hittable): one skinned mesh for all of them (root, body, head, four legs, tail per dog)
const DOG={mesh:null,cols:[0xc8a060,0x2a2622,0xe9e2d2,0x8a6a44,0x6b5a4a]},DJ=[[0,0,0],[0,0,0],[0,.52,-.3],[-.08,.42,-.2],[.08,.42,-.2],[-.08,.42,.2],[.08,.42,.2],[0,.5,.28]];
function dogGeo(){const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  const add=(g,bone,x,y,z,rx,sx,sy,sz,col)=>{_e.set(rx||0,0,0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy,sz);_m4.compose(_p,_q,_s);_n3.getNormalMatrix(_m4);
    const Pp=g.attributes.position,N=g.attributes.normal,k0=p.length/3,r=(col>>16&255)/255,gg=(col>>8&255)/255,b=(col&255)/255;
    for(let i=0;i<Pp.count;i++){_v.fromBufferAttribute(Pp,i).applyMatrix4(_m4);p.push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();n.push(_v.x,_v.y,_v.z);c.push(r,gg,b);u.push(.5,.5);si.push(bone,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k0+g.index.getX(i));};
  for(let d=0;d<LIFE.dogN;d++){const b0=d*8,col=DOG.cols[d%DOG.cols.length],c2=shade(col,.82),J=(k,g,x,y,z,rx,sx,sy,sz,cc)=>add(g,b0+k,x+DJ[k][0],y+DJ[k][1],z+DJ[k][2],rx,sx,sy,sz,cc);
    J(1,CG.ball,0,.42,0,0,.13,.14,.3,col);J(1,CG.ball,0,.46,-.24,0,.1,.1,.1,col);J(2,CG.ball,0,0,-.06,0,.09,.085,.1,col);J(2,CG.box,0,-.04,-.17,0,.07,.06,.12,c2);J(2,CG.blob,0,-.02,-.235,0,.025,.02,.025,0x1d1c1a);
    for(const s of [-1,1])J(2,CG.box,s*.07,.06,-.02,-.4,.035,.09,.02,c2);J(2,CG.ring,0,-.04,.04,1.4,.06,.03,.06,0xc8362b);
    for(let l=0;l<4;l++)J(3+l,CG.limb,0,0,0,0,.03,.4,.03,l<2?col:c2);J(7,CG.cyl,0,0,0,.7,.02,.26,.02,col);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);return g;}
{const B=[],roots=[];for(let d=0;d<LIFE.dogN;d++){const r=new T.Bone(),bd=new T.Bone(),hd=new T.Bone(),tl=new T.Bone();hd.position.set(DJ[2][0],DJ[2][1],DJ[2][2]);tl.position.set(DJ[7][0],DJ[7][1],DJ[7][2]);r.add(bd);bd.add(hd);bd.add(tl);
    const legs=[];for(let l0=3;l0<7;l0++){const l=new T.Bone();l.position.set(DJ[l0][0],DJ[l0][1],DJ[l0][2]);bd.add(l);legs.push(l);}B.push(r,bd,hd,legs[0],legs[1],legs[2],legs[3],tl);roots.push({r,bd,hd,legs,tl});r.position.y=-50;}
 const m=new T.SkinnedMesh(dogGeo(),civMat);for(const o of roots)m.add(o.r);m.updateMatrixWorld(true);m.bind(new T.Skeleton(B));m.frustumCulled=false;m.castShadow=true;m.visible=false;scene.add(m);DOG.mesh=m;
 roots.forEach((b,i)=>dogs.push({i,b,on:false,owner:null,x:0,z:0,y:0,yaw:0,ph:0,moveAmt:0,st:'trot',t:0,barkT:0,hop:0,lie:0,panic:0,side:1,sc:1,g:{rotation:{y:0}}}));}
function attachDog(c){const d=dogs.find(q=>!q.on);if(!d)return;d.on=true;d.owner=c;c.dog=d.i;d.x=c.x+.8;d.z=c.z;d.yaw=c.yaw;d.st='trot';d.t=R2(5,12);d.side=R()<.5?-1:1;d.sc=R2(.7,1.05);d.panic=0;d.b.r.scale.setScalar(d.sc);}
function updDog(d,dt){const o=d.owner;if(!o||civs.indexOf(o)<0){d.on=false;d.owner=null;d.b.r.position.y=-50;return;}let sp=0;d.t-=dt;if(d.barkT>0)d.barkT-=dt;if(d.hop>0)d.hop-=dt;
  if(!o.alive||d.panic>0){d.panic-=dt;if(d.panic<=0&&!o.alive){d.on=false;d.owner=null;o.dog=-1;d.b.r.position.y=-50;return;}const ax=d.x-P.x,az=d.z-P.z,al=Math.hypot(ax,az)||1;face(d,d.x+ax/al,d.z+az/al,dt,6);sp=6;}
  else{const gx=o.x+Math.cos(o.yaw)*.9*d.side-Math.sin(o.yaw)*.4,gz=o.z-Math.sin(o.yaw)*.9*d.side-Math.cos(o.yaw)*.4,dd=Math.hypot(gx-d.x,gz-d.z);
    if(d.st==='sniff'){if(d.t<=0||dd>2.6){d.st='trot';d.t=R2(6,16);}}
    else{if(dd>.35){sp=Math.min(o.run?7:2.8,dd*2.4+(o.spd||0)*.6);face(d,gx,gz,dt,8);}else d.yaw+=clamp(angDiff(o.yaw,d.yaw),-dt*3,dt*3);
      if(d.t<=0&&!o.run){d.t=R2(6,16);if(R()<.5&&o.st==='walk'){d.st='sniff';d.t=R2(2,4);o.st='pause';o.t=d.t;o.look=Math.atan2(-(d.x-o.x),-(d.z-o.z));}}}
    if(Math.hypot(d.x-P.x,d.z-P.z)<6&&d.barkT<=0&&P.alive){d.barkT=R2(2,5);sndBark(d.x,d.z,R()<.5?1:2,false);d.hop=.3;}}
  const ox=d.x,oz=d.z;if(sp){d.x+=-Math.sin(d.yaw)*sp*dt;d.z+=-Math.cos(d.yaw)*sp*dt;pushOut(d,.25,0);d.x=clamp(d.x,BOUND.x0,BOUND.x1);d.z=clamp(d.z,BOUND.z0,BOUND.z1);}
  const moved=Math.hypot(d.x-ox,d.z-oz);d.moveAmt=lerp(d.moveAmt,clamp(moved/Math.max(dt,1e-4)/2.4,0,1.4),Math.min(1,dt*10));if(moved>0)d.ph+=moved*5.5/d.sc;d.y+=(o.y0-d.y)*Math.min(1,dt*6);
  const b=d.b,m=d.moveAmt,sw=Math.sin(d.ph)*.6*m,ys=d.st==='sniff'?-.6:d.hop>0?.35:0;
  b.r.position.set(d.x,d.y+Math.abs(Math.sin(d.ph))*.02*m+(d.hop>0?Math.sin(d.hop/.3*PI)*.06:0),d.z);b.r.rotation.y=d.yaw;b.hd.rotation.x=ys+Math.sin(G.time*1.7+d.ph)*.05;
  b.legs[0].rotation.x=sw;b.legs[1].rotation.x=-sw;b.legs[2].rotation.x=-sw;b.legs[3].rotation.x=sw;b.tl.rotation.y=Math.sin(G.time*(d.hop>0?14:4)+d.ph)*(d.hop>0?.6:.3);}

// ---------- traffic: a few cars on the arterials, in their real lanes (right-hand traffic), about 12 m/s. Lane centres from the road textures.
const TROADS=[STR.FH,AV.HAVEN,STR.BL,AV.MILL,AV.DAYC,STR.CH].map(r=>{const ns=NSA.indexOf(r)>=0,q={road6:[30,[4.8,8.4]],road4m:[26,[4.3,8]],road4c:[22,[3.6,7.2]]}[r.mat]||[22,[3.6]],k=2*r.hw/q[0],stops=[];
  for(const i of ISEC)if(ns?i.a===r:i.b===r)stops.push([ns?i.z:i.x,ns?i.b.hw:i.a.hw,0]);if(ns)stops.push([trailZ(r.x),TRW+1,1]);
  return{r,ns,lanes:q[1].map(v=>v*k),stops,s0:ns?Math.max(r.z0,BOUND.z0+8):Math.max(r.x0,BOUND.x0+8),s1:ns?Math.min(r.z1,BOUND.z1-8):Math.min(r.x1,fwEdge(r.z)-20)};});
const tgCache={};
// the parked cars' builder (02c) as one moving mesh: body, glass, roof, wheels, lights, bumpers
function trafficGeo(type,col){const key=type+'/'+col;if(tgCache[key])return tgCache[key];const V=VEH[type],b=new GB(),A=(g,x,y,z,sx,sy,sz,c)=>b.add(g,x,y,z,0,0,0,sx,sy,sz,c);
  A(V.body,0,0,0,1,1,1,col);A(V.glass,0,0,0,1,1,1,C.glass);const rf=V.roof;A(GEO.box,0,rf[1],-rf[0],rf[3],V.roofH||.05,rf[2],col);if(V.bed)A(GEO.box,0,V.bed[1],-V.bed[0],V.bed[3],.02,V.bed[2],0x1a1816);
  for(const wz of V.wheels)for(const s of [-1,1]){A(GEO.wheel,s*(V.wid/2-.13),V.wr,-wz,.25,V.wr,V.wr,C.tire);A(GEO.hub,s*(V.wid/2-.01),V.wr,-wz,.03,V.wr*.5,V.wr*.5,0x9a9c9a);}
  const fz=V.len/2-.02,ly=type==='sedan'?.66:.84;for(const s of [-1,1]){A(GEO.box,s*(V.wid/2-.32),ly,-fz,.34,.14,.06,0xf2ecd2);A(GEO.box,s*(V.wid/2-.3),ly,fz-.02,.3,.14,.06,0xa02018);}
  A(GEO.box,0,.4,-fz-.04,V.wid-.1,.16,.12,0x3a3b3c);A(GEO.box,0,.4,fz+.02,V.wid-.1,.16,.12,0x3a3b3c);return tgCache[key]=b.build();}
for(let k=0;k<LIFE.carN;k++){const m=new T.Mesh(trafficGeo('sedan',carCols[0]),vcMat);m.castShadow=true;m.visible=false;scene.add(m);const col=solid(-9999,-9999,.1,.1,1.5,0,2);col.st=0;
  traffic.push({m,col,on:false,retry:R2(.5,3),type:'sedan',V:VEH.sedan,R0:TROADS[0],dir:1,off:0,s:0,x:0,z:0,yaw:0,spd:0,cruise:12,hold:false,stopS:null,stopD:null,dec:new Map(),chkT:0,cells:null,stopT:0,blockT:0,hornT:0,visT:0});}
function binAddU(c){const i0=clamp(Math.floor((c.x0-1-BX0)/BS),0,BW-1),i1=clamp(Math.floor((c.x1+1-BX0)/BS),0,BW-1),j0=clamp(Math.floor((c.z0-1-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((c.z1+1-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const l=bins[j*BW+i];if(l.indexOf(c)<0)l.push(c);}}
function carPos(c){const r=c.R0.r;if(c.R0.ns){c.x=r.x+(c.dir<0?c.off:-c.off);c.z=c.s;c.yaw=c.dir<0?0:PI;}else{c.x=c.s;c.z=r.z+(c.dir>0?c.off:-c.off);c.yaw=c.dir>0?-PI/2:PI/2;}c.m.position.set(c.x,.03,c.z);c.m.rotation.y=c.yaw;}
function carPlace(c){for(let k=0;k<14;k++){const R0=RP(TROADS),dir=R()<.5?1:-1,off=RP(R0.lanes),s=R2(R0.s0,R0.s1),r=R0.r,x=R0.ns?r.x+(dir<0?off:-off):s,z=R0.ns?s:r.z+(dir>0?off:-off),d=Math.hypot(x-P.x,z-P.z);
    if(d<70||d>230||!(LIFE.test||unseen(x,z)))continue;if(traffic.some(o=>o!==c&&o.on&&Math.hypot(o.x-x,o.z-z)<30))continue;if(ISEC.some(i=>Math.abs(i.x-x)<i.a.hw+7&&Math.abs(i.z-z)<i.b.hw+7))continue;if(LIFE.chase&&nearTrail(x,z))continue;
    const type=RP(['sedan','sedan','pickup','minivan','suv','sedan','van']);c.type=type;c.V=VEH[type];c.m.geometry=trafficGeo(type,RP(carCols));c.R0=R0;c.dir=dir;c.off=off;c.s=s;c.spd=R2(8,11);c.cruise=R2(11,13.5);
    c.hold=false;c.stopS=null;c.stopD=null;c.dec=new Map();c.chkT=0;c.stopT=0;c.blockT=0;c.on=true;c.m.visible=true;carPos(c);return true;}return false;}
function carFree(c){const q=c.col;q.x0=q.x1=q.z0=q.z1=-9999;if(c.cells){for(const k of c.cells)blocked[k]=0;c.cells=null;}}
function carOff(c){c.on=false;c.m.visible=false;c.retry=R2(1,4);carFree(c);}
// a car that has stopped is a collider (cover; bullets spark off it), and its cells leave the navigation grid so soldiers and the bot go round it
function carSolid(c){if(c.cells)return;const q=c.col,ns=c.R0.ns,hl=c.V.len/2,hw=c.V.wid/2;q.x0=c.x-(ns?hw:hl);q.x1=c.x+(ns?hw:hl);q.z0=c.z-(ns?hl:hw);q.z1=c.z+(ns?hl:hw);q.y1=c.V.h;binAddU(q);c.cells=[];
  for(let j=Math.floor((q.z0-NZ0)/CELL);j<=Math.floor((q.z1-NZ0)/CELL);j++)for(let i=Math.floor((q.x0-NX0)/CELL);i<=Math.floor((q.x1-NX0)/CELL);i++){if(i<0||j<0||i>=NW||j>=NH)continue;const k=j*NW+i;if(!blocked[k]){blocked[k]=1;c.cells.push(k);}}}
// push someone out of a moving car's two end circles
function carPush(c,e,r){const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),L0=c.V.len/4,rr0=c.V.wid/2+r;if(Math.abs(e.x-c.x)>4||Math.abs(e.z-c.z)>4)return;
  for(const s of [-1,1]){const cx=c.x+fx*L0*s,cz=c.z+fz*L0*s,dx=e.x-cx,dz=e.z-cz,d2=dx*dx+dz*dz;if(d2<rr0*rr0&&d2>1e-6){const d=Math.sqrt(d2);e.x=cx+dx/d*rr0;e.z=cz+dz/d*rr0;}}}
// the next stop line ahead: a red light now and then at the big intersections; the trail crossing stays closed during the chase
function carNext(c){c.stopS=null;c.stopD=null;let best=1e9;for(const X of c.R0.stops){const S=X[0]-c.dir*(X[1]+4.6+c.V.len/2+.3),g=(S-c.s)*c.dir;if(g<-.3||g>55)continue;
    let d=c.dec.get(X);if(!d){d={red:!X[2]&&R()<.35,t:R2(3,7)};c.dec.set(X,d);}if((X[2]?LIFE.chase:d.red)&&g<best){best=g;c.stopS=S;c.stopD=d;}}}
function updCar(c,dt){if(!c.on){c.retry-=dt;if(c.retry<=0){c.retry=R2(.6,1.2);carPlace(c);}return;}
  const dp=Math.hypot(c.x-P.x,c.z-P.z);if(dp>270){c.visT-=dt;if(c.visT<=0){c.visT=.5;if(unseen(c.x,c.z)){carOff(c);return;}}}
  if(dp>430||c.s<c.R0.s0-2||c.s>c.R0.s1+2){carOff(c);return;}
  if(LIFE.alarm<1.5&&Math.hypot(c.x-LIFE.nx,c.z-LIFE.nz)<120)c.hold=true;else if(c.hold&&LIFE.alarm>22)c.hold=false;   // shooting nearby: stop and stay put
  c.chkT-=dt;if(c.chkT<=0){c.chkT=.25;carNext(c);}
  let want=c.hold?0:c.cruise,who=false;
  if(c.stopS!==null){const g=(c.stopS-c.s)*c.dir;if(g<.6){want=0;if(c.spd<.5&&c.stopD&&c.stopD.red){c.stopD.t-=dt;if(c.stopD.t<=0)c.stopD.red=false;}}else want=Math.min(want,Math.sqrt(9*g));}
  const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),hl=c.V.len/2;let gap=99;
  const chk=(x,z,len,p)=>{const dx=x-c.x,dz=z-c.z,a=dx*fx+dz*fz;if(a<=0||a>28||Math.abs(-dx*fz+dz*fx)>2.1)return;const g=a-hl-len;if(g<gap){gap=g;who=p;}};
  if(P.alive)chk(P.x,P.z,.4,true);for(const L1 of [civs,foes,allies])for(let k=0;k<L1.length;k++){const e=L1[k];if(e.alive)chk(e.x,e.z,.4,true);}
  for(const d of dogs)if(d.on)chk(d.x,d.z,.4,true);for(const o of traffic)if(o!==c&&o.on)chk(o.x,o.z,o.V.len/2,false);
  if(gap<99)want=Math.min(want,Math.max(0,(gap-2.2)*1.4));
  if(who&&gap<8&&c.spd<1&&!c.hold){c.blockT+=dt;if(c.blockT>4&&c.hornT<=0){c.hornT=R2(5,9);sndHorn(c.x,c.z);}}else c.blockT=0;if(c.hornT>0)c.hornT-=dt;
  c.spd+=clamp(want-c.spd,-dt*8,dt*2.6);if(c.spd<.02)c.spd=0;if(c.spd>0){c.s+=c.dir*c.spd*dt;carPos(c);}
  if(P.alive)carPush(c,P,.45);for(const L1 of [allies,foes])for(let k=0;k<L1.length;k++){const e=L1[k];if(e.alive&&e.y0<.5)carPush(c,e,.4);}
  if(c.spd<.3){c.stopT+=dt;if(c.stopT>.8)carSolid(c);}else{c.stopT=0;if(c.cells)carFree(c);}}

// ---------- birds: one point cloud (a flock of crows on a wire, a roof edge or a lawn, scattering at gunshots and circling back) and a hawk up high.
// Each point picks its frame from a small strip: perched, wings up, wings down.
const BIRD={n:isTouch?9:13,pts:null,pos:null,fr:null,mode:'ground',cx:0,cy:0,cz:0,t:0,fly:0,wire:null,roof:null,b:[],hk:{a:0,cx:0,cz:0,tx:0,tz:0,r:30,y:50,t:0}};
const birdTex=tex(128,32,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#17140f';
  g.beginPath();g.ellipse(15,20,7,4.5,-.2,0,7);g.fill();g.beginPath();g.arc(22,14,3.6,0,7);g.fill();g.beginPath();g.moveTo(25,13);g.lineTo(30,14.5);g.lineTo(25,16);g.fill();g.beginPath();g.moveTo(9,21);g.lineTo(2,26);g.lineTo(10,24);g.fill();g.fillRect(13,24,1.5,5);g.fillRect(17,24,1.5,5);
  g.beginPath();g.ellipse(48,19,6,3,0,0,7);g.fill();g.beginPath();g.moveTo(47,18);g.quadraticCurveTo(40,7,33,4);g.lineTo(37,11);g.quadraticCurveTo(42,15,46,20);g.fill();g.beginPath();g.moveTo(49,18);g.quadraticCurveTo(56,7,63,4);g.lineTo(59,11);g.quadraticCurveTo(54,15,50,20);g.fill();
  g.beginPath();g.ellipse(80,15,6,3,0,0,7);g.fill();g.beginPath();g.moveTo(79,15);g.quadraticCurveTo(72,15,65,22);g.lineTo(70,21);g.quadraticCurveTo(75,18,80,17);g.fill();g.beginPath();g.moveTo(81,15);g.quadraticCurveTo(88,15,95,22);g.lineTo(90,21);g.quadraticCurveTo(85,18,80,17);g.fill();});
const birdMat=new T.ShaderMaterial({uniforms:{map:{value:birdTex},k:{value:400}},
  vertexShader:'attribute float fr;attribute float ps;uniform float k;varying float vf;void main(){vf=fr;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(ps*k/max(.5,-mv.z),1.0,64.0);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D map;varying float vf;void main(){vec4 c=texture2D(map,vec2((gl_PointCoord.x+floor(vf+.5))*.25,1.0-gl_PointCoord.y));if(c.a<.45)discard;gl_FragColor=vec4(c.rgb,1.0);}'});
{const n=BIRD.n+1,g=new T.BufferGeometry();BIRD.pos=new Float32Array(n*3);BIRD.fr=new Float32Array(n);const ps=new Float32Array(n);for(let k=0;k<n;k++){ps[k]=k<BIRD.n?R2(.38,.48):1.6;BIRD.pos[k*3+1]=-50;}
 g.setAttribute('position',new T.BufferAttribute(BIRD.pos,3));g.setAttribute('fr',new T.BufferAttribute(BIRD.fr,1));g.setAttribute('ps',new T.BufferAttribute(ps,1));
 const p=new T.Points(g,birdMat);p.frustumCulled=false;p.visible=false;scene.add(p);BIRD.pts=p;for(let k=0;k<BIRD.n;k++)BIRD.b.push({x:0,y:-50,z:0,tx:0,ty:0,tz:0,t:R2(.5,3),ph:R()*TAU,r:R2(6,12),h:R2(5,10),hop:0});}
function birdSpot(){const r=R();BIRD.wire=null;BIRD.roof=null;
  if(r<.38){const W=[];for(let k=0;k<poles.length-1;k++){const A=poles[k],B=poles[k+1];if(A[2]!==B[2]||Math.hypot(A[0]-B[0],A[1]-B[1])>50)continue;const d=Math.hypot((A[0]+B[0])/2-P.x,(A[1]+B[1])/2-P.z);if(d>18&&d<80)W.push([A,B]);}
    if(W.length){BIRD.mode='wire';BIRD.wire=RP(W);BIRD.cx=(BIRD.wire[0][0]+BIRD.wire[1][0])/2;BIRD.cz=(BIRD.wire[0][1]+BIRD.wire[1][1])/2;BIRD.cy=8.5;}}
  if(!BIRD.wire&&r<.72){const F=[];for(const b of buildings){if(!b.flat||b.h>12)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);if(d>22&&d<75)F.push(b);}
    if(F.length){const b=RP(F),sx=R()<.5?-1:1,ax=R()<.5;BIRD.mode='roof';BIRD.roof={b,ax,sx};BIRD.cx=ax?b.x:b.x+sx*b.w/2;BIRD.cz=ax?b.z+sx*b.d/2:b.z;BIRD.cy=b.h+.25;}}
  if(!BIRD.wire&&!BIRD.roof){BIRD.mode='ground';for(let k=0;k<24;k++){const a=R()*TAU,d=R2(16,55),x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(freeSpot(x,z)&&!onArt(x,z)&&!lifeBusy(x,z)){BIRD.cx=x;BIRD.cz=z;BIRD.cy=PADY;break;}}}
  BIRD.t=R2(25,55);for(const b of BIRD.b)birdPerch(b);}
function birdPerch(b){if(BIRD.mode==='wire'){const A=BIRD.wire[0],B=BIRD.wire[1],t=R2(.12,.88),s=RP([-1,0,1]);b.tx=lerp(A[0],B[0],t)+(A[2]?s:0);b.tz=lerp(A[1],B[1],t)+(A[2]?0:s);b.ty=8.85-1.6*t*(1-t)+.13;}
  else if(BIRD.mode==='roof'){const q=BIRD.roof,b0=q.b,t=R2(-.42,.42);b.tx=q.ax?b0.x+t*b0.w:BIRD.cx;b.tz=q.ax?BIRD.cz:b0.z+t*b0.d;b.ty=BIRD.cy;}
  else{b.tx=BIRD.cx+R2(-3.5,3.5);b.tz=BIRD.cz+R2(-3.5,3.5);b.ty=BIRD.cy+.14;}}
function birdScatter(t){if(BIRD.fly>0)return;BIRD.fly=t;for(const b of BIRD.b){b.ph=R()*TAU;b.x=b.tx;b.z=b.tz;b.y=b.ty;}sndFlutter(BIRD.cx,BIRD.cz);}
function updBirds(dt){const pos=BIRD.pos,fr=BIRD.fr,n=BIRD.n;birdMat.uniforms.k.value=renderer.domElement.height/(2*Math.tan(camera.fov*PI/360));
  if(LIFE.alarm<1&&Math.hypot(BIRD.cx-LIFE.nx,BIRD.cz-LIFE.nz)<90)birdScatter(R2(7,11));else if(BIRD.mode==='ground'&&Math.hypot(BIRD.cx-P.x,BIRD.cz-P.z)<5)birdScatter(4);
  BIRD.t-=dt;if(Math.hypot(BIRD.cx-P.x,BIRD.cz-P.z)>115||(BIRD.t<=0&&BIRD.fly<=0&&unseen(BIRD.cx,BIRD.cz))){birdSpot();for(const b of BIRD.b){b.x=b.tx;b.y=b.ty;b.z=b.tz;}}
  if(BIRD.fly>0){BIRD.fly-=dt;
    for(let i=0;i<n;i++){const b=BIRD.b[i];b.ph+=dt*(1.1+i*.03);const r=b.r*Math.min(1,BIRD.fly),gx=BIRD.cx+Math.cos(b.ph)*r,gz=BIRD.cz+Math.sin(b.ph)*r,gy=b.ty+b.h*Math.min(1,BIRD.fly/2),land=BIRD.fly<1.5,k=Math.min(1,dt*(land?3:2.5));
      b.x+=((land?b.tx:gx)-b.x)*k;b.z+=((land?b.tz:gz)-b.z)*k;b.y+=((land?b.ty:gy)-b.y)*Math.min(1,dt*2.5);pos[i*3]=b.x;pos[i*3+1]=b.y+Math.sin(G.time*16+b.ph)*.03;pos[i*3+2]=b.z;fr[i]=Math.sin(G.time*15+b.ph*3)>0?1:2;}
    if(BIRD.fly<=0)for(const b of BIRD.b){b.x=b.tx;b.z=b.tz;b.y=b.ty;}}
  else for(let i=0;i<n;i++){const b=BIRD.b[i];b.t-=dt;if(b.t<=0){b.t=R2(.8,4);if(BIRD.mode==='ground'&&R()<.6){b.tx+=R2(-.5,.5);b.tz+=R2(-.5,.5);b.hop=.25;}}if(b.hop>0)b.hop-=dt;
    b.x+=(b.tx-b.x)*Math.min(1,dt*3);b.z+=(b.tz-b.z)*Math.min(1,dt*3);b.y=b.ty+(b.hop>0?Math.sin(b.hop/.25*PI)*.12:0);pos[i*3]=b.x;pos[i*3+1]=b.y;pos[i*3+2]=b.z;fr[i]=b.hop>.1?1:0;}
  // the hawk circles slowly over the open lots and parks round the player
  const H=BIRD.hk;H.t-=dt;if(H.t<=0){H.t=R2(40,80);const a=R()*TAU,d=R2(60,130);H.tx=P.x+Math.cos(a)*d;H.tz=P.z+Math.sin(a)*d;H.y=R2(40,58);H.r=R2(22,38);if(!H.cx&&!H.cz){H.cx=H.tx;H.cz=H.tz;}}
  H.cx+=(H.tx-H.cx)*Math.min(1,dt*.05);H.cz+=(H.tz-H.cz)*Math.min(1,dt*.05);H.a+=dt*.17;pos[n*3]=H.cx+Math.cos(H.a)*H.r;pos[n*3+1]=H.y+Math.sin(H.a*2.3)*2;pos[n*3+2]=H.cz+Math.sin(H.a)*H.r;fr[n]=Math.sin(H.a*9)>.92?2:1;
  BIRD.pts.geometry.attributes.position.needsUpdate=true;BIRD.pts.geometry.attributes.fr.needsUpdate=true;}

// ---------- water and dust: one point cloud (hoses, a sprinkler, car-wash drips, grass clippings); hoses and leads: one line batch; soft contact shadows: one mesh
const LP={n:96,k:0,pts:null,pos:new Float32Array(96*3),col:new Float32Array(96*3),v:new Float32Array(96*3),life:new Float32Array(96)};
{const g=new T.BufferGeometry();for(let i=0;i<LP.n;i++)LP.pos[i*3+1]=-50;g.setAttribute('position',new T.BufferAttribute(LP.pos,3));g.setAttribute('color',new T.BufferAttribute(LP.col,3));
 LP.pts=new T.Points(g,new T.PointsMaterial({size:.075,map:dot,vertexColors:true,transparent:true,depthWrite:false,opacity:.85}));LP.pts.frustumCulled=false;LP.pts.visible=false;scene.add(LP.pts);}
function lpEmit(x,y,z,vx,vy,vz,col,life){const i=LP.k=(LP.k+1)%LP.n,j=i*3;LP.pos[j]=x;LP.pos[j+1]=y;LP.pos[j+2]=z;LP.v[j]=vx;LP.v[j+1]=vy;LP.v[j+2]=vz;LP.life[i]=life;LP.col[j]=(col>>16&255)/255;LP.col[j+1]=(col>>8&255)/255;LP.col[j+2]=(col&255)/255;}
function lpUpdate(dt){const p=LP.pos,v=LP.v;for(let i=0;i<LP.n;i++){if(LP.life[i]<=0)continue;const j=i*3;LP.life[i]-=dt;v[j+1]-=9.8*dt;p[j]+=v[j]*dt;p[j+1]+=v[j+1]*dt;p[j+2]+=v[j+2]*dt;if(p[j+1]<.1||LP.life[i]<=0){LP.life[i]=0;p[j+1]=-50;}}
  LP.pts.geometry.attributes.position.needsUpdate=true;LP.pts.geometry.attributes.color.needsUpdate=true;}
const emitter=(k,dt,rate)=>{const e=LIFE.emit;e[k]=(e[k]||0)+dt*rate;const n=Math.floor(e[k]);e[k]-=n;return n;};
const LL={n:32,k:0,seg:null,pos:new Float32Array(32*6),col:new Float32Array(32*6)};
{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(LL.pos,3));g.setAttribute('color',new T.BufferAttribute(LL.col,3));LL.seg=new T.LineSegments(g,new T.LineBasicMaterial({vertexColors:true}));LL.seg.frustumCulled=false;LL.seg.visible=false;scene.add(LL.seg);}
function llPt(k,x,y,z,col){LL.pos[k*3]=x;LL.pos[k*3+1]=y;LL.pos[k*3+2]=z;LL.col[k*3]=(col>>16&255)/255;LL.col[k*3+1]=(col>>8&255)/255;LL.col[k*3+2]=(col&255)/255;}
function llLine(pts,col){for(let q=0;q<pts.length-1&&LL.k<LL.n;q++){const a=pts[q],b=pts[q+1];llPt(LL.k*2,a[0],a[1],a[2],col);llPt(LL.k*2+1,b[0],b[1],b[2],col);LL.k++;}}
const LSH={n:24,m:null,pos:new Float32Array(24*12)};
{const g=new T.BufferGeometry(),uv=new Float32Array(LSH.n*8),ix=[];for(let i=0;i<LSH.n;i++){uv.set([.02,.02,.48,.02,.48,.98,.02,.98],i*8);ix.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);}
 g.setAttribute('position',new T.BufferAttribute(LSH.pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(ix);
 LSH.m=new T.Mesh(g,new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:M.shade.map}));LSH.m.frustumCulled=false;LSH.m.renderOrder=2;LSH.m.visible=false;scene.add(LSH.m);}
function lshQuad(k,x,y,z,rx,rz){const p=LSH.pos,j=k*12;p[j]=x-rx;p[j+1]=y;p[j+2]=z+rz;p[j+3]=x+rx;p[j+4]=y;p[j+5]=z+rz;p[j+6]=x+rx;p[j+7]=y;p[j+8]=z-rz;p[j+9]=x-rx;p[j+10]=y;p[j+11]=z-rz;}
// per frame: water from the hose, suds, clippings and blown dust; the hose and the leads; the shadow blobs
function lifeFx(dt){
  for(const c of civs){if(!c.alive)continue;const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
    if(c.st==='water'){const nx=c.x+fx*.62+rx*.2,ny=c.y0+1.12,nzz=c.z+fz*.62+rz*.2;for(let q=emitter('w'+c.ph0,dt,42);q>0;q--)lpEmit(nx,ny,nzz,fx*R2(3.6,4.6)+R2(-.3,.3),R2(1.9,2.6),fz*R2(3.6,4.6)+R2(-.3,.3),0xdcecf6,1.2);}
    else if(c.st==='wash'){for(let q=emitter('s'+c.ph0,dt,9);q>0;q--)lpEmit(c.x+fx*.55+rx*.25,c.y0+R2(.6,1.1),c.z+fz*.55+rz*.25,R2(-.2,.2),0,R2(-.2,.2),0xf4f6f8,.8);}
    else if(c.st==='mow'&&c.spd>0){for(let q=emitter('m'+c.ph0,dt,12);q>0;q--)lpEmit(c.x+fx*1.1+rx*.3,c.y0+.2,c.z+fz*1.1+rz*.3,rx*R2(1,2),R2(.6,1.4),rz*R2(1,2),0x6f9a3c,.6);}
    else if(c.st==='blow'){for(let q=emitter('b'+c.ph0,dt,4);q>0;q--)dust(c.x+fx*1.3+R2(-.4,.4),c.y0+.15,c.z+fz*1.3+R2(-.4,.4),1);}}
  const S=LIFE.spr;if(S){S.t-=dt;if(S.t<=0){S.t=.14;S.a+=S.back?-.35:.11;if(S.a>S.a1)S.back=true;else if(S.a<S.a0)S.back=false;}for(let q=emitter('spr',dt,30);q>0;q--)lpEmit(S.x,PADY+.25,S.z,Math.cos(S.a)*R2(5.4,6.4),R2(2.6,3.3),Math.sin(S.a)*R2(5.4,6.4),0xdcecf6,1.4);}
  LL.k=0;for(const c of civs){if(!c.alive)continue;
    if(c.dog>=0&&dogs[c.dog]&&dogs[c.dog].on){const d=dogs[c.dog],hx=c.x+Math.cos(c.yaw)*-.32-Math.sin(c.yaw)*.25,hz=c.z-Math.sin(c.yaw)*-.32-Math.cos(c.yaw)*.25,hy=c.y0+.85,dx=d.x-Math.sin(d.yaw)*.25*d.sc,dz=d.z-Math.cos(d.yaw)*.25*d.sc,dy=d.y+.5*d.sc;
      llLine([[hx,hy,hz],[lerp(hx,dx,.33),lerp(hy,dy,.33)-.12,lerp(hz,dz,.33)],[lerp(hx,dx,.66),lerp(hy,dy,.66)-.1,lerp(hz,dz,.66)],[dx,dy,dz]],0x8a2a22);}
    if(c.st==='water'&&c.hose){const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),hx=c.x+fx*.5+Math.cos(c.yaw)*.2,hz=c.z+fz*.5-Math.sin(c.yaw)*.2,y=c.y0+.04;
      llLine([[c.hose[0],.5,c.hose[1]],[c.hose[0],y,c.hose[1]],[lerp(c.hose[0],c.x,.5)+.6,y,lerp(c.hose[1],c.z,.5)-.4],[c.x+.3,y,c.z+.2],[c.x,c.y0+.5,c.z],[hx,c.y0+1.02,hz]],0x2f6a3a);}}
  LL.seg.geometry.setDrawRange(0,LL.k*2);LL.seg.geometry.attributes.position.needsUpdate=true;LL.seg.geometry.attributes.color.needsUpdate=true;
  let k=0;for(const c of civs){if(k>=LSH.n)break;if(c.alive)lshQuad(k++,c.x,c.y0+.025,c.z,.5,.5);}
  for(const d of dogs)if(d.on&&k<LSH.n)lshQuad(k++,d.x,d.y+.025,d.z,.42*d.sc,.42*d.sc);
  for(const c of traffic)if(c.on&&k<LSH.n){const ns=c.R0.ns;lshQuad(k++,c.x,.05,c.z,ns?c.V.wid*.72:c.V.len*.58,ns?c.V.len*.58:c.V.wid*.72);}
  LSH.m.geometry.setDrawRange(0,k*6);LSH.m.geometry.attributes.position.needsUpdate=true;}
// a sprinkler ticking round on a lawn near the player (tracts only)
function updSpr(dt){LIFE.sprT-=dt;const S=LIFE.spr;if(S&&Math.hypot(S.x-P.x,S.z-P.z)>110){if(S.Y)S.Y.used=0;LIFE.spr=null;}
  if(LIFE.sprT>0)return;LIFE.sprT=R2(6,12);if(LIFE.spr)return;const cand=YARDS.filter(Y=>!Y.used&&Math.abs(Y.x-P.x)<70&&Math.abs(Y.z-P.z)<70);if(!cand.length)return;const Y=RP(cand);if(lifeBusy(Y.x,Y.z)&&!LIFE.test)return;
  const a=Math.atan2(Y.uz,Y.ux)+(R()<.5?0:PI);Y.used=1;LIFE.spr={Y,x:Y.x+Y.nx*1.5,z:Y.z+Y.nz*1.5,a,a0:a-1.3,a1:a+1.3,back:false,t:0};}

// ---------- sound: quiet and placed in the world. Loops fade out by themselves when the game stops refreshing them (pause, menus).
const AMB={lp:{},t:{bark:R2(6,14),gust:R2(9,20),train:R2(30,70),caw:R2(8,18),hawk:R2(50,90),gard:R2(8,20),upd:0},gard:null};
function noiseSrc(c){const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;s.start(0,R()*.9);return s;}
function panOut(c,g){const pn=c.createStereoPanner?c.createStereoPanner():null;if(pn){g.connect(pn);pn.connect(AU.master);}else g.connect(AU.master);return pn;}
function ambLoop(k,make){if(!AU.ctx||!AU.on||!AU.noise)return null;let q=AMB.lp[k];if(!q){try{q=make(AU.ctx);AMB.lp[k]=q;}catch(e){AMB.lp[k]=q={g:null};}}return q.g?q:null;}
function ambSet(q,vol,pan){if(!q)return;try{const t=AU.ctx.currentTime,g=q.g.gain;g.cancelScheduledValues(t);g.setTargetAtTime(vol,t,.15);g.setTargetAtTime(0,t+.45,.2);if(q.pn)q.pn.pan.setTargetAtTime(clamp(pan,-1,1),t,.15);}catch(e){}}
function mkFwy(c){const g=c.createGain(),f=c.createBiquadFilter(),f2=c.createBiquadFilter(),g2=c.createGain();g.gain.value=0;f.type='lowpass';f.frequency.value=260;f2.type='bandpass';f2.frequency.value=1000;f2.Q.value=.5;g2.gain.value=.12;
  noiseSrc(c).connect(f);f.connect(g);noiseSrc(c).connect(f2);f2.connect(g2);g2.connect(g);return{g,pn:panOut(c,g)};}
function mkSpr(c){const g=c.createGain(),f=c.createBiquadFilter(),am=c.createGain(),lfo=c.createOscillator(),lg=c.createGain();g.gain.value=0;f.type='highpass';f.frequency.value=2800;am.gain.value=.5;lfo.type='square';lfo.frequency.value=6.5;lg.gain.value=.5;
  lfo.connect(lg);lg.connect(am.gain);noiseSrc(c).connect(f);f.connect(am);am.connect(g);lfo.start();return{g,pn:panOut(c,g)};}
function mkMow(c){const g=c.createGain(),o=c.createOscillator(),f=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain(),f2=c.createBiquadFilter(),g2=c.createGain();g.gain.value=0;o.type='sawtooth';o.frequency.value=92;lfo.frequency.value=7;lg.gain.value=4;
  lfo.connect(lg);lg.connect(o.frequency);f.type='lowpass';f.frequency.value=650;f2.type='lowpass';f2.frequency.value=420;g2.gain.value=.5;noiseSrc(c).connect(f2);f2.connect(g2);g2.connect(g);o.connect(f);f.connect(g);o.start();lfo.start();return{g,pn:panOut(c,g)};}
function mkBlow(c){const g=c.createGain(),f=c.createBiquadFilter(),o=c.createOscillator(),f2=c.createBiquadFilter(),g2=c.createGain();g.gain.value=0;f.type='bandpass';f.frequency.value=1700;f.Q.value=.9;o.type='sawtooth';o.frequency.value=230;f2.type='lowpass';f2.frequency.value=800;g2.gain.value=.35;
  noiseSrc(c).connect(f);f.connect(g);o.connect(f2);f2.connect(g2);g2.connect(g);o.start();return{g,pn:panOut(c,g)};}
function mkCar(c){const g=c.createGain(),f=c.createBiquadFilter(),o=c.createOscillator(),og=c.createGain();g.gain.value=0;f.type='lowpass';f.frequency.value=230;o.type='sawtooth';o.frequency.value=55;og.gain.value=.3;
  noiseSrc(c).connect(f);f.connect(g);o.connect(og);og.connect(g);o.start();return{g,pn:panOut(c,g),o};}
// a Metrolink train somewhere on the tracks: the grade-crossing pattern, long, long, short, long
function sndTrain(){if(!AU.ctx||!AU.on)return;try{const x=clamp(P.x+R2(-260,260),BOUND.x0,fwX(TRK)),s=spatial(x,TRK,180),vol=.15*s.vol,pan=s.pan,lp=Math.min(1100,s.lp),c=AU.ctx,o=aOut(vol,pan),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.connect(o);
  const t0=c.currentTime+.05;for(const p of [[0,1.1],[1.35,1],[2.6,.38],[3.15,1.5]])for(const hz of [311,370,466]){const os=c.createOscillator(),g=c.createGain(),t=t0+p[0];os.type='sawtooth';os.frequency.setValueAtTime(hz*.985,t);os.frequency.linearRampToValueAtTime(hz,t+.12);
    g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.3,t+.08);g.gain.setValueAtTime(.3,t+p[1]-.1);g.gain.exponentialRampToValueAtTime(.001,t+p[1]+.15);os.connect(g);g.connect(f);os.start(t);os.stop(t+p[1]+.2);}}catch(e){}}
function sndGust(){if(!AU.ctx||!AU.on)return;try{const c=AU.ctx,t=c.currentTime,o=aOut(.1,R2(-.6,.6)),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),d=R2(2.5,4.5);s.buffer=AU.noise;s.loop=true;f.type='bandpass';f.Q.value=.6;
  f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(R2(700,1100),t+d*.45);f.frequency.linearRampToValueAtTime(250,t+d);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(1,t+d*.4);g.gain.linearRampToValueAtTime(.001,t+d);
  s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+d+.1);}catch(e){}}
function sndCaw(x,z,n){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,14);if(s.d>110)return;const o=aOut(.09*s.vol,s.pan),c=AU.ctx;
  for(let k=0;k<n;k++){const t=c.currentTime+k*R2(.32,.45),os=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();os.type='sawtooth';os.frequency.setValueAtTime(520,t);os.frequency.exponentialRampToValueAtTime(380,t+.22);
    f.type='bandpass';f.frequency.value=1300;f.Q.value=1.8;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(1,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.24);os.connect(f);f.connect(g);g.connect(o);os.start(t);os.stop(t+.26);}}catch(e){}}
function sndFlutter(x,z){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,10);if(s.d>80)return;const o=aOut(.14*s.vol,s.pan),c=AU.ctx,t=c.currentTime,src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=AU.noise;f.type='bandpass';f.frequency.value=900;f.Q.value=.8;
  g.gain.setValueAtTime(0,t);for(let k=0;k<14;k++){const q=t+k*.055+R()*.01;g.gain.setValueAtTime(.9*(1-k/16),q);g.gain.setValueAtTime(.05,q+.025);}g.gain.setValueAtTime(0,t+.85);src.connect(f);f.connect(g);g.connect(o);src.start(t,R()*.5);src.stop(t+.9);}catch(e){}}
function sndHawk(x,z){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,60),o=aOut(.05*s.vol,s.pan),c=AU.ctx,t=c.currentTime,os=c.createOscillator(),g=c.createGain();os.type='sine';os.frequency.setValueAtTime(2700,t);os.frequency.exponentialRampToValueAtTime(1700,t+.9);
  g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(1,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+1);os.connect(g);g.connect(o);os.start(t);os.stop(t+1.05);}catch(e){}}
function ambient(dt){if(!AU.ctx||!AU.on)return;for(const k in AMB.t)AMB.t[k]-=dt;
  if(AMB.t.upd<=0){AMB.t.upd=.1;
    {const fx=fwX(P.z),d=Math.max(0,fx-FWH-P.x);ambSet(ambLoop('fwy',mkFwy),d<900?.075/(1+d/140):0,spatial(fx,P.z,60).pan);}            // the 15: a steady hum from the east
    if(LIFE.spr){const s=spatial(LIFE.spr.x,LIFE.spr.z,6),v=s.d<50?.055*s.vol:0,p=s.pan;ambSet(ambLoop('spr',mkSpr),v,p);}
    // the nearest gardener, or one somewhere down the street
    let g=null,gd=130;for(const c of civs)if(c.alive&&(c.st==='mow'||c.st==='blow')){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<gd){gd=d;g=c;}}
    if(AMB.t.gard<=0){AMB.t.gard=R2(25,50);const a=R()*TAU,d=R2(70,130);AMB.gard=R()<.55&&YARDS.some(Y=>Math.abs(Y.x-P.x)<160&&Math.abs(Y.z-P.z)<160)?{x:P.x+Math.cos(a)*d,z:P.z+Math.sin(a)*d,k:R()<.5?'mow':'blow'}:null;}
    const src=g?{x:g.x,z:g.z,k:g.st}:AMB.gard;for(const k of ['mow','blow']){if(!src||src.k!==k){if(AMB.lp[k]&&AMB.lp[k].g)ambSet(AMB.lp[k],0,0);continue;}const s=spatial(src.x,src.z,20),v=.08*s.vol,p=s.pan;ambSet(ambLoop(k,k==='mow'?mkMow:mkBlow),v,p);}
    // the nearest moving car
    let best=null,bv=0,bp=0;for(const c of traffic){if(!c.on||c.spd<.5)continue;const s=spatial(c.x,c.z,16),v=s.vol*Math.min(1,c.spd/7);if(v>bv){bv=v;bp=s.pan;best=c;}}
    const q=ambLoop('car',mkCar);if(q){ambSet(q,Math.min(.22,bv*.35),bp);if(best&&q.o)try{q.o.frequency.setTargetAtTime(42+best.spd*2.4,AU.ctx.currentTime,.2);}catch(e){}}}
  if(AMB.t.bark<=0){AMB.t.bark=R2(9,22);const a=R()*TAU,d=R2(40,120);sndBark(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d,2+Math.floor(R()*3),true);}
  if(AMB.t.gust<=0){AMB.t.gust=R2(12,30);sndGust();}
  if(AMB.t.train<=0){AMB.t.train=R2(70,150);sndTrain();}
  if(AMB.t.caw<=0){AMB.t.caw=R2(10,24);if(BIRD.fly<=0&&BIRD.pts.visible)sndCaw(BIRD.cx,BIRD.cz,1+Math.floor(R()*3));}
  if(AMB.t.hawk<=0){AMB.t.hawk=R2(60,120);sndHawk(BIRD.pos[BIRD.n*3],BIRD.pos[BIRD.n*3+2]);}}

// ---------- entry points
function lifeReset(){for(const c of civs)removeCiv(c);civs.length=0;for(const d of dogs){d.on=false;d.owner=null;d.b.r.position.y=-50;}DOG.mesh.visible=false;
  for(const c of traffic){c.on=false;c.m.visible=false;c.retry=R2(.5,2.5);carFree(c);}BIRD.pts.visible=false;BIRD.fly=0;LP.pts.visible=false;for(let i=0;i<LP.n;i++){LP.life[i]=0;LP.pos[i*3+1]=-50;}
  LL.seg.visible=false;LSH.m.visible=false;if(LIFE.spr&&LIFE.spr.Y)LIFE.spr.Y.used=0;for(const Y of YARDS)Y.used=0;for(const D of DRIVES)D.used=0;for(const S0 of SEATS)S0.used=0;
  Object.assign(LIFE,{on:false,alarm:99,hurtN:0,killN:0,stage:-9,failT:0,spawnT:0,nearT:0,near:[],spr:null,sprT:2,chase:false,emit:{},yard:{water:null,wash:null,gard:null}});}
function lifeStart(){LIFE.on=true;LIFE.alarm=99;DOG.mesh.visible=true;BIRD.pts.visible=true;LP.pts.visible=true;LL.seg.visible=true;LSH.m.visible=true;BIRD.fly=0;nearLanes();birdSpot();for(const b of BIRD.b){b.x=b.tx;b.y=b.ty;b.z=b.tz;}BIRD.hk.t=0;BIRD.hk.cx=BIRD.hk.cz=0;}
function lifeUpdate(dt){if(MP.on){if(LIFE.on)lifeReset();return;}if(!LIFE.on)lifeStart();
  LIFE.alarm+=dt;if(LIFE.shoutT>0)LIFE.shoutT-=dt;
  if(MS.i!==LIFE.stage){LIFE.stage=MS.i;LIFE.hurtN=0;LIFE.killN=0;LIFE.failT=0;}
  if(LIFE.failT>0){LIFE.failT-=dt;if(LIFE.failT<=0){restartCheckpoint();return;}}
  // hostiles firing count as noise too (the player's shots and every explosion come through noiseEvent)
  LIFE.scareT-=dt;if(LIFE.scareT<=0){LIFE.scareT=.1;for(let k=0;k<foes.length;k++){const s=foes[k];if(s.alive&&s.revealT>2.85){lifeNoise(s.x,s.z,90);break;}}}
  const ch=G.mode==='mission'&&!!MS.st&&MS.st.type==='chase'&&!MS.done;if(ch&&!LIFE.chase)for(const c of civs)if(c.bike||nearTrail(c.x,c.z))c.gone=true;LIFE.chase=ch;  // the trail stays clear for the chase
  LIFE.nearT-=dt;if(LIFE.nearT<=0){LIFE.nearT=1;nearLanes();}
  LIFE.spawnT-=dt;if(LIFE.spawnT<=0){LIFE.spawnT=.35;lifeSpawn();}
  for(let k=civs.length-1;k>=0;k--){const c=civs[k],d=Math.hypot(c.x-P.x,c.z-P.z);
    if(!c.alive){if(c.deadT<1.3)updCorpse(c,dt);else c.deadT+=dt;c.visT-=dt;if(d>160||(d>80&&c.visT<=0&&(c.visT=.5,unseen(c.x,c.z)))){removeCiv(c);civs.splice(k,1);}continue;}
    let drop=c.gone||d>170;if(!drop&&(d>125||c.st==='leave')){c.visT-=dt;if(c.visT<=0){c.visT=.4;drop=unseen(c.x,c.z);}}
    if(drop){removeCiv(c);civs.splice(k,1);continue;}updCiv(c,dt);}
  for(const d of dogs)if(d.on)updDog(d,dt);
  for(const c of traffic)updCar(c,dt);
  updBirds(dt);updSpr(dt);lifeFx(dt);lpUpdate(dt);ambient(dt);}
const LIFEX={civs,traffic,dogs,LIFE,BIRD,LANES,SEATS,YARDS,DRIVES,addCiv,civHurt,lifeSpawnN,lifeReset,lifeUpdate};
