// =====================================================================
// 06a WEAPONS: definitions, first-person models, explosions, destructible props, grenades, pickups
// =====================================================================
const G={state:'menu',mode:'mission',time:0,score:0,vig:0,flash:0,prompt:'',stage:0,stats:{kills:0,heads:0,shots:0,hits:0,deaths:0,time:0},
  lkp:{x:0,z:0,age:99},budget:0,arcs:[],toasts:[]};
const WDEF={
  m4:{name:'M4 CARBINE',auto:true,rate:.08,mag:30,max:210,dmg:34,head:3,rng:[45,110,.7],hip:.03,ads:.0035,kick:.0105,kickH:.005,adsFov:48,reload:2.1,pellets:1,speed:1,snd:'m4',adsT:.19,sight:.085,mz:-.6},
  ak:{name:'AK-47',auto:true,rate:.1,mag:30,max:180,dmg:42,head:3,rng:[40,100,.7],hip:.034,ads:.005,kick:.016,kickH:.008,adsFov:50,reload:2.5,pellets:1,speed:.98,snd:'ak',adsT:.21,sight:.08,mz:-.62},
  smg:{name:'MP5',auto:true,rate:.07,mag:30,max:180,dmg:24,head:2.5,rng:[18,50,.55],hip:.024,ads:.006,kick:.007,kickH:.005,adsFov:54,reload:1.9,pellets:1,speed:1.06,snd:'smg',adsT:.15,sight:.08,mz:-.42},
  pistol:{name:'M9 PISTOL',auto:false,rate:.13,mag:15,max:75,dmg:30,head:2.6,rng:[18,45,.55],hip:.02,ads:.006,kick:.014,kickH:.006,adsFov:58,reload:1.5,pellets:1,speed:1.08,snd:'pistol',adsT:.12,sight:.062,mz:-.2},
  shotgun:{name:'M870 SHOTGUN',auto:false,rate:.85,mag:6,max:36,dmg:15,head:1.6,rng:[9,26,.25],hip:.055,ads:.042,kick:.05,kickH:.012,adsFov:58,reload:.5,shell:true,pellets:9,speed:.97,snd:'shotgun',adsT:.2,sight:.07,mz:-.7},
  dmr:{name:'M14 DMR',auto:false,rate:.34,mag:10,max:60,dmg:92,head:2.5,rng:[120,220,.85],hip:.06,ads:.0006,kick:.03,kickH:.006,adsFov:15,reload:2.7,pellets:1,speed:.94,snd:'dmr',adsT:.28,sight:.11,mz:-.72,scope:true},
  lmg:{name:'M249 SAW',auto:true,rate:.075,mag:100,max:200,dmg:36,head:2.6,rng:[50,120,.7],hip:.045,ads:.007,kick:.009,kickH:.007,adsFov:52,reload:4.6,pellets:1,speed:.86,snd:'lmg',adsT:.32,sight:.1,mz:-.66}};
const gunRoot=new T.Group();camera.add(gunRoot);gunRoot.scale.setScalar(.8);
// First-person models: the weapons of the world (gunBuild in 05, with the parts that only show up close) and the player's own hands and
// forearms (skin from AVATAR, a flannel's sleeves). Each is a group: the gun, then the arms (rebuilt by vmSkin when the avatar changes).
// The barrel points to -z; the line of sight is at height D.sight above the origin.
const VM={},gunMat=new T.MeshPhongMaterial({vertexColors:true,shininess:34,specular:0x3a3a3a}),vmArmMat=L({vertexColors:true});
for(const id in WDEF){const g=new T.Group(),b=new GB();gunBuild(b,id,1);g.add(new T.Mesh(b.build(),gunMat));const a=new T.Mesh(new T.BufferGeometry(),vmArmMat);g.add(a);
  g.userData.arms=a;g.visible=false;gunRoot.add(g);VM[id]=g;}
// a point of a frame (origin o, axes u (up) and f (back)) in the weapon frame
const vmP=(o,t,p)=>{const c=Math.cos(t),s=Math.sin(t);return[o[0]+p[0],o[1]+p[1]*c+p[2]*s,o[2]-p[1]*s+p[2]*c];};
// the firing hand round the pistol grip (grip frame: y up the grip, z towards the back), and the other hand under the handguard
function vmHands(b,id,sk,sl){const H=HOLD[id]||HOLD.m4,X=SXC,sw=(pts,r,c,n)=>fgSweep(b,X,0,pts,r,n||7,c===undefined?sk:c),pis=!!H.pis,
    go=[0,H.g[1]-.01,H.g[2]],gt=pis?.2:.29,G=p=>vmP(go,gt,p),fy=pis?0:H.f[1]+.04,F=p=>[p[0],p[1]+fy,p[2]+H.f[2]],arm=sl||sk;
  sw([[.022,.05,.012],[.026,.02,.016],[.026,-.015,.016],[.023,-.045,.012]].map(G),[[.012,.024],[.014,.028],[.014,.028],[.012,.022]]);           // palm on the right side and back
  [.012,-.01,-.032].forEach((y,k)=>{const r=.0095-k*.0007;sw([[.026,y,-.006],[.02,y,-.03],[.002,y,-.038],[-.014,y,-.029],[-.018,y,-.02]].map(G),[r,r,r*.95,r*.88,r*.7]);});
  sw([[.025,.04,-.008],[.02,.045,-.032],[.01,.047,-.052],[.005,.045,-.06]].map(G),[.0095,.009,.0085,.006]);                                // trigger finger
  sw([[.016,.06,.026],[.008,.07,.012],[-.008,.071,-.004],[-.017,.066,-.017],[-.019,.063,-.022]].map(G),[.011,.0105,.0095,.0085,.006]);       // thumb over the top
  sw([[.026,-.02,.035],[.04,-.05,.12],[.085,-.11,.32],[.13,-.17,.55]].map(G),[.026,.034,.042,.046],arm,8);                                   // wrist and forearm
  if(sl)sw([[.04,-.05,.1],[.044,-.056,.13]].map(G),[.04,.04],shade(sl,.8),8);                                                                // sleeve cuff
  if(pis){const L0=p=>vmP(go,gt,p);sw([[-.024,.03,.012],[-.028,0,.012],[-.026,-.03,.01]].map(L0),[[.012,.024],[.013,.027],[.012,.024]]);      // the other hand round the grip
    [.006,-.016,-.038].forEach((y,k)=>sw([[-.026,y,-.004],[-.03,y,-.04],[-.01,y,-.058],[.016,y,-.058],[.03,y,-.046]].map(L0),[.0095,.0092,.009,.0085,.007]));
    sw([[-.03,.04,.004],[-.028,.044,-.03],[-.024,.044,-.05]].map(L0),[.011,.0095,.004]);sw([[-.03,-.02,.04],[-.07,-.06,.14],[-.15,-.13,.36],[-.2,-.18,.55]].map(L0),[.026,.034,.042,.046],arm,8);
    if(sl)sw([[-.07,-.06,.12],[-.075,-.065,.15]].map(L0),[.04,.04],shade(sl,.8),8);return;}
  sw([[-.006,-.044,.045],[-.008,-.046,.01],[-.006,-.044,-.03]].map(F),[[.028,.012],[.032,.013],[.027,.011]]);                                // palm under the handguard
  [.026,.009,-.008,-.025].forEach((z,k)=>{const r=k===3?.0082:.0095;sw([[-.022,-.036,z],[-.038,-.014,z],[-.036,.01,z],[-.024,.025,z],[-.016,.028,z]].map(F),[r,r,r*.95,r*.85,r*.65]);});
  sw([[.012,-.042,.032],[.028,-.03,.016],[.034,-.01,-.006],[.033,0,-.02]].map(F),[.011,.0105,.009,.007]);                               // thumb along the right side
  sw([[-.008,-.06,.05],[-.04,-.1,.15],[-.12,-.2,.38],[-.18,-.27,.6]].map(F),[.027,.034,.042,.046],arm,8);
  if(sl)sw([[-.04,-.1,.14],[-.045,-.105,.17]].map(F),[.04,.04],shade(sl,.8),8);}
function vmSkin(){const A=AVATAR,sl=A.shirtStyle==='flannel'?A.shirt:null;for(const id in VM){const b=new GB();vmHands(b,id,A.skin,sl);const m=VM[id].userData.arms;m.geometry.dispose();m.geometry=b.build();}}
// muzzle flash: four spiky stars in one texture; each shot picks one, turns and sizes it; some shots leave a wisp of smoke
const flashTex=tex(128,128,(g)=>{g.clearRect(0,0,128,128);for(let q=0;q<4;q++){const cx=(q&1)*64+32,cy=(q>>1)*64+32,n=[4,5,6,8][q];g.save();g.translate(cx,cy);g.rotate(q*.4);
    const gr=g.createRadialGradient(0,0,1,0,0,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,232,170,.9)');gr.addColorStop(1,'rgba(255,170,50,0)');g.fillStyle=gr;
    g.beginPath();for(let k=0;k<n*2;k++){const a=k/(n*2)*TAU,r=k%2?6+rnd()*3:18+rnd()*13;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
    g.fillStyle='rgba(255,255,240,.95)';g.beginPath();g.arc(0,0,5,0,TAU);g.fill();g.restore();}});
flashTex.repeat.set(.5,.5);
const flash=new T.Sprite(new T.SpriteMaterial({map:flashTex,color:0xffd890,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));flash.scale.set(.3,.3,1);flash.visible=false;gunRoot.add(flash);
// one shot's flash (both views) and its smoke; the barrel smokes for a moment after a burst (vmSmoke, every frame)
function vmFlash(D,tp,m){const q=(R()*4)|0;flashTex.offset.set((q&1)*.5,(q>>1)*.5);flash.material.rotation=R()*TAU;const k=R2(.7,1.3)*(D.shell?1.6:D.snd==='lmg'||D.snd==='ak'?1.2:D.snd==='pistol'?.8:1);
  flash.scale.set(.3*k,.3*k,1);if(tp){tpFlash.scale.set(.42*k,.42*k,1);tpFlash.material.rotation=flash.material.rotation;}
  P.burstN=(P.burstN||0)+1;if(R()<.3||D.shell)puff(m.x,m.y,m.z,0xcfc8bc,.05,.24,.5,.28,R2(-.2,.2)+P.vx*.3,R2(.4,.8),R2(-.2,.2)+P.vz*.3,false,true);}
const vmSm=new T.Vector3();
function vmSmoke(D,tp){if(!(P.burstN>0)||P.fireT>-.22)return;const n=Math.min(4,1+(P.burstN/4|0));P.burstN=0;
  if(tp)avMuzzle(vmSm,D);else{camera.updateMatrixWorld();vmSm.set(0,.02,D.mz);gunRoot.localToWorld(vmSm);}
  for(let k=0;k<n;k++)puff(vmSm.x,vmSm.y+k*.03,vmSm.z,0xbdb6aa,.04+k*.02,.3+k*.12,.9+k*.35,.26,R2(-.12,.12)+P.vx*.2,R2(.3,.6),R2(-.12,.12)+P.vz*.2,false,true);}

// ---------- explosions and destructible props
const pending=[],fires=[];
function damageProp(c,dmg){if(!c||!(c.hp>0))return;c.hp-=dmg;if(c.hp<=0){c.hp=0;pending.push({c,t:R2(.05,.3)});}
  else if(c.kind===2&&c.hp<90&&R()<.5)smoke((c.x0+c.x1)/2,1.4,(c.z0+c.z1)/2,.8,1.4);}
// rep: this is a copy of something that happened on another player's machine (owner), so it only shows and hurts me
function blowProp(c,rep,owner){const x=(c.x0+c.x1)/2,z=(c.z0+c.z1)/2;if(c.off||c.wrecked)return;c.hp=0;if(MP.on&&!rep)mpEvent('pb',0,[c.id]);
  if(c.kind===3||c.kind===4){c.off=true;if(c.ref)scene.remove(c.ref);const k=cellOf(x,z);if(k>=0)blocked[k]=0;explode(x,.6,z,c.kind===4?9:7.5,c.kind===4?175:150,true,rep,owner);if(c.kind===4)fires.push({x,y:.4,z,t:9,n:0});}
  else if(c.kind===2){c.wrecked=true;wreck(c.ref);explode(x,.8,z,6.5,130,true,rep,owner);fires.push({x,y:1,z,t:14,n:0});}}
function blownList(){const L=[];for(let k=0;k<colliders.length&&L.length<900;k++){const c=colliders[k];if((c.off||c.wrecked)&&c.kind>=2&&c.kind<=4)L.push(c.id);}return L;}
function blowQuiet(c){if(!c||c.off||c.wrecked||!(c.kind>=2&&c.kind<=4)||!c.ref)return;c.hp=0;
  if(c.kind===2){c.wrecked=true;wreck(c.ref);}else{c.off=true;scene.remove(c.ref);const k=cellOf((c.x0+c.x1)/2,(c.z0+c.z1)/2);if(k>=0)blocked[k]=0;}}
function explode(x,y,z,rad,dmg,byPlayer,rep,owner){fxExplosion(x,y,z,rad);sndBoom(x,z);const dp=Math.hypot(x-P.x,z-P.z);shake=Math.max(shake,clamp(1.3-dp/28,0,1));G.flash=Math.max(G.flash,clamp(.5-dp/40,0,.5));
  const hit=(tx,ty,tz)=>{const d=Math.hypot(tx-x,ty-y,tz-z);if(d>=rad)return 0;return(1-d/rad)*(los(x,y+.7,z,tx,ty,tz)?1:.25);};
  if(P.alive){const k=hit(P.x,P.y+1,P.z);if(k>0&&mpBlast(rep,owner))hurt(dmg*k*.7,x,z);}
  if(rep){noiseEvent(x,z,130);return;} // a copy: its owner's machine deals with soldiers and props
  for(const list of [foes,allies])for(let i=list.length-1;i>=0;i--){const s=list[i];if(!s.alive)continue;const k=hit(s.x,chestY(s),s.z);if(k>0)damageSoldier(s,dmg*k,1,x,z,byPlayer,true);}
  const st=++stamp,i0=clamp(Math.floor((x-rad-BX0)/BS),0,BW-1),i1=clamp(Math.floor((x+rad-BX0)/BS),0,BW-1),j0=clamp(Math.floor((z-rad-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((z+rad-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const l=bins[j*BW+i];for(let q=0;q<l.length;q++){const c=l[q];if(c.st===st||c.off||!(c.hp>0))continue;c.st=st;
    const d=Math.hypot(clamp(x,c.x0,c.x1)-x,clamp(z,c.z0,c.z1)-z);if(d<rad)damageProp(c,dmg*(1-d/rad)*1.4);}}
  noiseEvent(x,z,130);}
function updProps(dt){for(let k=pending.length-1;k>=0;k--){const p=pending[k];p.t-=dt;if(p.t<=0){pending.splice(k,1);blowProp(p.c);}}
  for(let k=fires.length-1;k>=0;k--){const f=fires[k];f.t-=dt;f.n-=dt;if(f.t<=0){fires.splice(k,1);continue;}
    if(f.n<=0){f.n=.11;puff(f.x+R2(-.7,.7),f.y+R2(0,.5),f.z+R2(-.7,.7),0xff8a24,.5,1.3,.5,.9,0,2.2,0,true,true);if(R()<.4)smoke(f.x,f.y+1.4,f.z,1.3,2.6);}}}

// ---------- grenades
const nades=[],nadeGeo=new T.SphereGeometry(.07,8,6),nadeMat=L({color:0x2c3323});
function spawnNade(x,y,z,vx,vy,vz,fuse,byPlayer){const m=new T.Mesh(nadeGeo,nadeMat),n={m,x,y,z,vx,vy,vz,fuse,byPlayer,rest:false,rep:false,by:0};m.position.set(x,y,z);scene.add(m);nades.push(n);return n;}
function updNades(dt){for(let k=nades.length-1;k>=0;k--){const n=nades[k];n.fuse-=dt;
  if(!n.rest){n.vy-=14*dt;let rem=dt;
    for(let it=0;it<3&&rem>1e-4;it++){const sp=Math.hypot(n.vx,n.vy,n.vz);if(sp<.05){n.rest=true;break;}const dx=n.vx/sp,dy=n.vy/sp,dz=n.vz/sp,step=sp*rem,t=rayWorld(n.x,n.y,n.z,dx,dy,dz,step+.08);
      if(t<step+.08){const nx=RHnx,ny=RHny,nzz=RHnz;if(!nx&&!ny&&!nzz){n.rest=true;break;}const tt=Math.max(0,t-.08);n.x+=dx*tt;n.y+=dy*tt;n.z+=dz*tt;
        const vn=n.vx*nx+n.vy*ny+n.vz*nzz;n.vx=(n.vx-1.38*vn*nx)*.74;n.vy=(n.vy-1.38*vn*ny)*.74;n.vz=(n.vz-1.38*vn*nzz)*.74;rem*=1-tt/Math.max(step,1e-5);
        if(sp>3)sndUi('pin');if(ny>.5&&Math.abs(n.vy)<1.3){n.vy=0;if(Math.hypot(n.vx,n.vz)<.6){n.rest=true;break;}}}
      else{n.x+=dx*step;n.y+=dy*step;n.z+=dz*step;rem=0;}}
    if(n.y<.07)n.y=.07;n.m.position.set(n.x,n.y,n.z);}
  if(n.fuse<=0){if(n.rep&&n.fuse>-1.5)continue; // a copy waits for its owner's word; it is tidied away if none comes
    scene.remove(n.m);nades.splice(k,1);if(!n.rep){explode(n.x,n.y,n.z,8.5,170,n.byPlayer);if(MP.on)mpBoom(n.x,n.y,n.z,8.5,170,n.byPlayer?0:1);}}}}

// ---------- pickups: dropped weapons, ammo, medkits, supply crates
const picks=[],pickGeo=new T.BoxGeometry(.5,.5,.5);
const pickMat={med:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#f4f0e7';g.fillRect(0,0,w,h);g.fillStyle='#2f7d4f';g.fillRect(24,10,16,44);g.fillRect(10,24,44,16);})}),
  ammo:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#5d6336';g.fillRect(0,0,w,h);g.strokeStyle='#2b2621';g.lineWidth=4;g.strokeRect(3,3,58,58);g.fillStyle='#ffb23e';
    g.font='bold 20px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('AMMO',32,33);})}),
  nade:L({color:0x2c3323}),crate:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#4c5a3a';g.fillRect(0,0,w,h);g.strokeStyle='#23291b';g.lineWidth=5;g.strokeRect(3,3,58,58);g.fillStyle='#f3e8d3';
    g.font='bold 15px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('SUPPLY',32,33);})})};
function addPick(kind,x,z,o){o=o||{};let m;
  if(kind==='w'){m=new T.Mesh(weaponGeo(o.id),solMat);m.scale.setScalar(1.25);m.castShadow=true;}
  else if(kind==='crate'){m=new T.Mesh(new T.BoxGeometry(1.3,.8,.9),pickMat.crate);m.castShadow=true;}
  else if(kind==='nade'){m=new T.Mesh(new T.SphereGeometry(.16,8,6),pickMat.nade);}
  else m=new T.Mesh(pickGeo,pickMat[kind]);
  m.position.set(x,kind==='crate'?.4:.55,z);scene.add(m);const p={kind,x,z,m,t:kind==='crate'?1e9:(o.life||50),id:o.id||'',mag:o.mag||0,res:o.res||0};picks.push(p);return p;}
function clearPicks(){for(const p of picks)scene.remove(p.m);picks.length=0;}
