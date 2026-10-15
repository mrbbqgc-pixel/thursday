// =====================================================================
// 05 SOLDIERS: rounded articulated models (merged per body part), animation, hit volumes
// =====================================================================
// Kingsley Prime Security (KPS): four kinds of hostile. The squad: Junebug and Mr. Pennington. 'ally' is a team mate in multiplayer.
// Bobo is his own kind: no gun, 1.35 times the size, eight times the health; he ends up on your side (07b).
const KIND={
  rifle:{hp:100,spd:3.6,acc:.42,dmg:13,range:75,rof:.11,burst:[3,5],pause:[.7,1.6],snd:'ak',pref:26,label:'Security officer',drop:'ak'},
  rush:{hp:80,spd:5.4,acc:.3,dmg:8,range:28,rof:.075,burst:[5,9],pause:[.4,.9],snd:'smg',pref:8,label:'Rapid responder',drop:'smg'},
  heavy:{hp:330,spd:2.3,acc:.34,dmg:10,range:70,rof:.09,burst:[9,15],pause:[1.2,2.2],snd:'lmg',pref:20,label:'Riot specialist',drop:'lmg',sc:1.14,headK:1.5},
  mark:{hp:90,spd:0,acc:.8,dmg:58,range:170,rof:1,burst:[1,1],pause:[2.6,3.6],snd:'dmr',pref:90,label:'Rooftop spotter',drop:'dmr'},
  ally:{hp:260,spd:4.6,acc:.5,dmg:30,range:80,rof:.1,burst:[3,5],pause:[.5,1.2],snd:'m4',pref:20,label:'',drop:null},
  june:{hp:260,spd:4.6,acc:.42,dmg:16,range:60,rof:.08,burst:[4,7],pause:[.6,1.3],snd:'smg',pref:16,label:'',drop:null},
  penn:{hp:260,spd:4.4,acc:.72,dmg:48,range:110,rof:.5,burst:[1,2],pause:[1,1.8],snd:'dmr',pref:30,label:'',drop:null},
  bobo:{hp:800,spd:2.4,acc:0,dmg:0,range:0,rof:1,burst:[0,0],pause:[1,1],snd:'m4',pref:0,label:'Bobo',drop:null,sc:1.35,headK:1.5,allyHp:1500}};
// cloth weave and faint wear, multiplied over the vertex colours
const solMat=L({vertexColors:true,map:tex(64,64,(g,w,h)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);for(let k=0;k<26;k++){g.fillStyle=rnd()<.5?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(3,9),rr(2,6),rnd()*3,0,7);g.fill();}
  noise(g,w,h,500,.12);},true)});
GEO.limb=new T.CylinderGeometry(1,.8,1,8,1,true);GEO.limb.translate(0,-.5,0); // tapered, hangs down from its origin
GEO.ball=new T.SphereGeometry(1,8,6);GEO.cap=new T.SphereGeometry(1,10,5,0,TAU,0,PI/2);GEO.torso=new T.CylinderGeometry(1,.8,1,10,2);GEO.torso.translate(0,.5,0);
// what each kind wears. sl: long sleeves; vest: plate carrier colour, 'rig' for a chest rig; hat: cap, capb (backwards), helmet, bucket, hair
const KPS_GOLD=0xe2b53e,KHAKI=0xb29c70;
const UNI={
  rifle:{shirt:0x24262c,pants:KHAKI,vest:0x474c47,pouch:0x2c2f33,patch:KPS_GOLD,hat:'cap',hatC:0x17181b,skin:0xc68e64,glove:0x24231f,pack:1},
  rush:{shirt:0x8d939a,sl:1,pants:KHAKI,vest:'rig',pouch:0x2c2f33,patch:KPS_GOLD,hat:'capb',hatC:0x17181b,skin:0x7a4e32,glove:0x24231f,tie:1},
  heavy:{shirt:0x24262c,pants:0xa8936a,vest:0x1f2124,heavy:1,pouch:0x2c2f33,patch:KPS_GOLD,hat:'helmet',hatC:0x2a2c30,visor:0x2e3d48,skin:0xe0ae88,glove:0x24231f,pack:1},
  mark:{shirt:0x7e848a,sl:1,pants:KHAKI,vest:0x50554c,pouch:0x3a3d38,patch:KPS_GOLD,hat:'cap',hatC:0x17181b,shades:1,headset:1,skin:0x9c6a48,glove:0x24231f,pack:1},
  ally:{shirt:0x4b5d7e,sl:1,pants:0x3a4d6b,hat:'hair',hatC:0x221a14,skin:0xb07d58,shoe:0xdedbd2},
  june:{shirt:0x16a19c,print:[0xf4c542,0xf0684f,0xf6f1e4],pants:0x48668f,baggy:1,hat:'hair',hatC:0x16110d,skin:0x8a5a3c,shoe:0xe9e6dc,lanyard:0x2f6fd8},
  penn:{shirt:0xecebe4,pants:0xc4ae82,shorts:1,sock:0xf2f1ec,hat:'bucket',hatC:0xb8ab84,skin:0xe8bf9c,shoe:0x5a3e2a,glasses:1,stache:0xc9c5bf,belt:0x5a3e2a}};
const partGeo={};
// body parts of one kind of soldier. Origins sit on the joints; the front is -z.
function parts(kind){if(partGeo[kind])return partGeo[kind];if(kind==='bobo')return partGeo[kind]=boboParts();
  const L=UNI[kind],S=L.shirt,Pn=L.pants,skin=L.skin,shoe=L.shoe||0x1c1a18,glove=L.glove||skin,kps=!!L.patch,o={};
  let b=new GB(); // upper body, origin at the waist
  b.add(GEO.torso,0,0,0,0,0,0,.25,.54,.15,S);b.add(GEO.ball,-.25,.47,0,0,0,0,.1,.09,.11,S);b.add(GEO.ball,.25,.47,0,0,0,0,.1,.09,.11,S);
  if(L.print)for(let k=0;k<26;k++){const a=k*2.4,y=.05+(k*.173%1)*.42,q=.8+.2*y/.54;b.add(GEO.ball,Math.sin(a)*.25*q,y,Math.cos(a)*.152*q,0,a,k,.05,.035,.012,L.print[k%3]);} // a loud print all round
  if(L.vest==='rig'){b.add(GEO.box,0,.22,-.165,0,0,0,.34,.17,.05,L.pouch);for(const x of [-.1,0,.1])b.add(GEO.box,x,.24,-.2,0,0,0,.085,.12,.04,0x23252a);}
  else if(L.vest){b.add(GEO.torso,0,.08,-.005,0,0,0,.265,.4,.175,L.vest);for(const x of [-.14,0,.14])b.add(GEO.box,x,.1,-.19,0,0,0,.1,.14,.06,L.pouch);b.add(GEO.box,.17,.3,-.17,0,0,0,.08,.1,.05,0x15151a);}
  if(L.heavy){b.add(GEO.torso,0,.02,0,0,0,0,.3,.5,.2,L.vest);b.add(GEO.ball,0,.52,0,0,0,0,.2,.08,.16,L.vest);}
  if(kps){b.add(GEO.box,-.1,.33,-.2,0,0,0,.1,.065,.016,L.patch);b.add(GEO.box,0,.27,.19,0,0,0,.24,.09,.016,L.patch); // the KPS patch on the chest and the back
    for(const x of [-.07,0,.07])b.add(GEO.box,x,.285,.197,0,0,0,.035,.06,.01,0x17181b);}
  if(L.tie){b.add(GEO.box,0,.24,-.153,0,0,0,.035,.2,.012,0x1b1c20);b.add(GEO.box,.11,.38,-.16,0,0,0,.05,.05,.012,KPS_GOLD);}
  if(L.pack)b.add(GEO.ball,0,.3,.2,0,0,0,.17,.2,.09,L.vest||L.pouch);
  if(L.lanyard){b.add(GEO.box,-.06,.3,-.15,0,0,-.28,.014,.24,.01,L.lanyard);b.add(GEO.box,.06,.3,-.15,0,0,.28,.014,.24,.01,L.lanyard);b.add(GEO.box,0,.2,-.16,0,0,0,.07,.095,.012,0xf4f3ee);b.add(GEO.box,0,.27,-.166,0,0,0,.07,.022,.012,L.lanyard);}
  b.add(GEO.cyl8,0,.52,0,0,0,0,.06,.1,.065,skin);b.add(GEO.ball,0,.69,0,0,0,0,.105,.125,.115,skin);
  if(L.hat==='cap'||L.hat==='capb'){const f=L.hat==='cap'?-1:1;b.add(GEO.cap,0,.715,0,0,0,0,.118,.095,.128,L.hatC);b.add(GEO.box,0,.712,f*.15,f*.12,0,0,.19,.018,.11,L.hatC);if(kps)b.add(GEO.box,0,.74,-f*.118,0,0,0,.05,.03,.01,L.patch);}
  else if(L.hat==='helmet'){b.add(GEO.cap,0,.69,0,0,0,0,.135,.14,.15,L.hatC);b.add(GEO.cyl8,0,.68,0,0,0,0,.14,.03,.155,shade(L.hatC,.8));b.add(GEO.box,0,.6,-.125,0,0,0,.2,.1,.025,L.visor);b.add(GEO.box,0,.78,-.12,.3,0,0,.06,.035,.01,L.patch);}
  else if(L.hat==='bucket'){b.add(GEO.cap,0,.72,0,0,0,0,.12,.09,.13,L.hatC);b.add(GEO.cyl12,0,.712,0,0,0,0,.2,.018,.21,L.hatC);b.add(GEO.cyl12,0,.725,0,0,0,0,.123,.02,.133,shade(L.hatC,.75));}
  else b.add(GEO.cap,0,.705,.012,0,0,0,.112,.085,.122,L.hatC);
  if(L.shades)b.add(GEO.box,0,.665,-.104,0,0,0,.17,.035,.022,0x0f0f11);
  if(L.headset){b.add(GEO.cyl8,.1,.66,0,0,0,PI/2,.035,.03,.035,0x15151a);b.add(GEO.box,.08,.62,-.08,0,-.5,0,.012,.012,.1,0x15151a);}
  if(L.glasses){b.add(GEO.box,-.04,.675,-.108,0,0,0,.05,.028,.008,0x3a3a3a);b.add(GEO.box,.04,.675,-.108,0,0,0,.05,.028,.008,0x3a3a3a);}
  if(L.stache)b.add(GEO.box,0,.625,-.108,0,0,0,.075,.018,.014,L.stache);
  if(kps){b.add(GEO.box,-.335,.38,0,0,0,0,.03,.11,.12,L.patch);b.add(GEO.box,.335,.38,0,0,0,0,.03,.11,.12,L.patch);}
  o.up=b.build();
  const bag=L.baggy?1.22:1;
  b=new GB();b.add(GEO.torso,0,-.1,0,0,0,0,.215*bag,.2,.145*bag,Pn);b.add(GEO.torso,0,.03,0,0,0,0,.225*bag,.05,.155*bag,L.belt||0x2a2622);if(kps)b.add(GEO.box,.22,-.06,-.02,0,0,0,.07,.16,.12,L.pouch);o.hips=b.build();
  b=new GB();if(L.sl){b.add(GEO.limb,0,0,0,0,0,0,.065,.36,.065,S);b.add(GEO.ball,0,-.36,0,0,0,0,.055,.055,.055,S);}
  else{b.add(GEO.limb,0,0,0,0,0,0,.07,.17,.07,S);b.add(GEO.limb,0,-.15,0,0,0,0,.056,.21,.056,skin);b.add(GEO.ball,0,-.36,0,0,0,0,.05,.05,.05,skin);}o.arm=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.052,.27,.052,L.sl?S:skin);b.add(GEO.ball,0,-.31,0,0,0,0,.048,.065,.052,glove);o.fore=b.build();
  b=new GB();if(L.shorts){b.add(GEO.limb,0,.03,0,0,0,0,.1,.3,.105,Pn);b.add(GEO.limb,0,-.25,0,0,0,0,.075,.2,.08,skin);b.add(GEO.ball,0,-.45,-.02,0,0,0,.07,.075,.07,skin);}
  else{b.add(GEO.limb,0,.03,0,0,0,0,.095*bag,.47,.1*bag,Pn);b.add(GEO.ball,0,-.45,-.02,0,0,0,.075*bag,.08,.075*bag,Pn);}o.thigh=b.build();
  b=new GB();if(L.shorts){b.add(GEO.limb,0,0,0,0,0,0,.07,.16,.075,skin);b.add(GEO.limb,0,-.13,0,0,0,0,.066,.2,.07,L.sock);}else b.add(GEO.limb,0,0,0,0,0,0,.07*bag,.36,.075*bag,Pn);
  b.add(GEO.limb,0,-.3,0,0,0,0,.062,.14,.07,shoe);b.add(GEO.ball,0,-.435,-.05,0,0,0,.06,.05,.125,shoe);if(!kps)b.add(GEO.box,0,-.49,-.05,0,0,0,.125,.02,.25,0xe8e4da);o.shin=b.build();
  return partGeo[kind]=o;}
// Bobo: a giant in a souvenir T-shirt a size too small, denim cut-offs and flip-flops, with a ponytail
function boboParts(){const skin=0xc98d68,S=0x8fd0ef,Sh=0x56698a,hair=0x1d1712,o={};let b=new GB();
  b.add(GEO.torso,0,0,0,0,0,0,.33,.3,.25,skin);b.add(GEO.ball,0,.15,-.07,0,0,0,.3,.21,.25,skin);                 // the belly the shirt does not reach
  b.add(GEO.torso,0,.2,0,0,0,0,.37,.38,.27,S);b.add(GEO.ball,0,.4,-.05,0,0,0,.34,.2,.26,S);b.add(GEO.ball,-.33,.5,0,0,0,0,.13,.11,.13,S);b.add(GEO.ball,.33,.5,0,0,0,0,.13,.11,.13,S);
  b.add(GEO.ball,0,.46,-.285,0,0,0,.075,.075,.02,0xffcf3a);b.add(GEO.box,.05,.33,-.3,0,0,.25,.016,.11,.012,0x7a5a32);for(const a of [-.9,-.3,.4,1])b.add(GEO.box,.07,.43,-.305,0,0,a,.012,.07,.01,0x2f9a52);
  b.add(GEO.box,-.06,.3,-.302,0,0,0,.13,.022,.01,0xd8412f);                                                         // a palm, a sun and the name of a beach town
  b.add(GEO.cyl8,0,.54,0,0,0,0,.11,.1,.11,skin);b.add(GEO.ball,0,.72,0,0,0,0,.13,.145,.13,skin);b.add(GEO.ball,0,.63,-.04,0,0,0,.115,.06,.1,skin);
  b.add(GEO.cap,0,.745,.02,-.2,0,0,.133,.085,.135,hair);b.add(GEO.ball,0,.7,.13,0,0,0,.035,.035,.035,0x2b2b2b);b.add(GEO.cyl8,0,.47,.17,-.25,0,0,.033,.24,.03,hair); // ponytail
  b.add(GEO.box,0,.585,-.115,0,0,0,.045,.022,.014,hair);b.add(GEO.box,-.045,.718,-.122,0,0,.1,.06,.016,.01,hair);b.add(GEO.box,.045,.718,-.122,0,0,-.1,.06,.016,.01,hair);o.up=b.build();
  b=new GB();b.add(GEO.torso,0,-.14,0,0,0,0,.3,.26,.22,Sh);b.add(GEO.torso,0,.08,0,0,0,0,.31,.06,.23,skin);o.hips=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.125,.14,.125,S);b.add(GEO.limb,0,-.1,0,0,0,0,.105,.28,.105,skin);b.add(GEO.ball,0,-.36,0,0,0,0,.09,.09,.09,skin);o.arm=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.09,.27,.09,skin);b.add(GEO.ball,0,-.33,0,0,0,0,.08,.09,.075,skin);b.add(GEO.cyl8,0,-.27,0,0,0,0,.075,.025,.075,0xd6b24a);o.fore=b.build();
  b=new GB();b.add(GEO.limb,0,.03,0,0,0,0,.15,.36,.15,Sh);b.add(GEO.limb,0,-.3,0,0,0,0,.11,.17,.11,skin);b.add(GEO.ball,0,-.45,-.02,0,0,0,.1,.1,.1,skin);o.thigh=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.1,.38,.1,skin);b.add(GEO.ball,0,-.43,-.06,0,0,0,.075,.045,.13,skin);b.add(GEO.box,0,-.495,-.06,0,0,0,.16,.018,.3,0x30302e);
  b.add(GEO.box,0,-.48,-.1,0,0,0,.14,.03,.035,0x2bb3a0);o.shin=b.build();return o;}
// third-person and pick-up weapon models; the barrel points to -z, origin at the grip
const wGeo={};
function weaponGeo(id){if(wGeo[id])return wGeo[id];const b=new GB(),k=0x1c1c1e,k2=0x303236,wd=0x6b4a2a,tube=(r,l,z,y,c)=>b.add(GEO.tube6,0,y||0,z,-PI/2,0,0,r,l,r,c||k);
  if(id==='ak'){b.add(GEO.box,0,-.04,.02,0,0,0,.05,.08,.32,k);b.add(GEO.box,0,-.035,-.27,0,0,0,.052,.06,.2,wd);tube(.012,.3,-.37,.015);tube(.009,.2,-.3,.045,k2);b.add(GEO.box,0,.03,-.62,0,0,0,.012,.05,.012,k);
    b.add(GEO.box,0,-.17,-.06,.3,0,0,.036,.13,.07,k2);b.add(GEO.box,0,-.27,-.11,.65,0,0,.036,.11,.065,k2);b.add(GEO.box,0,-.13,.1,-.25,0,0,.04,.11,.05,wd);b.add(GEO.box,0,-.06,.2,-.12,0,0,.04,.085,.26,wd);}
  else if(id==='smg'){b.add(GEO.box,0,-.04,-.02,0,0,0,.05,.085,.3,k);tube(.02,.1,-.17,.0,k2);tube(.011,.08,-.27,.0);b.add(GEO.box,0,-.2,-.06,.12,0,0,.034,.17,.045,k2);b.add(GEO.box,0,-.13,.08,-.25,0,0,.04,.1,.05,k);b.add(GEO.box,0,-.01,.13,0,0,0,.03,.03,.2,k2);b.add(GEO.box,0,-.07,.32,0,0,0,.03,.1,.03,k2);}
  else if(id==='lmg'){b.add(GEO.box,0,-.05,0,0,0,0,.07,.11,.42,k);tube(.016,.4,-.21,.0);tube(.03,.2,-.21,.0,k2);b.add(GEO.box,-.02,-.2,-.05,0,0,0,.12,.13,.14,0x4c5a3a);b.add(GEO.box,0,-.14,.12,-.25,0,0,.04,.1,.05,k);
    b.add(GEO.box,0,-.07,.21,-.08,0,0,.05,.1,.25,k);b.add(GEO.box,0,.05,-.05,0,0,0,.03,.03,.1,k2);for(const s of [-1,1])b.add(GEO.rod,s*.02,-.03,-.5,2.5,0,s*.3,.008,.26,.008,k2);}
  else if(id==='dmr'){b.add(GEO.box,0,-.045,.04,0,0,0,.055,.075,.5,wd);tube(.013,.46,-.21,.01);b.add(GEO.box,0,-.15,-.06,.1,0,0,.04,.12,.065,k2);b.add(GEO.box,0,-.07,.38,-.1,0,0,.05,.095,.24,wd);
    b.add(GEO.cyl8,0,.075,.12,-PI/2,0,0,.026,.3,.026,k);b.add(GEO.cyl8,0,.075,-.17,-PI/2,0,0,.033,.05,.033,k);b.add(GEO.box,0,.025,.02,0,0,0,.02,.04,.03,k);b.add(GEO.box,0,.025,-.1,0,0,0,.02,.04,.03,k);}
  else if(id==='shotgun'){b.add(GEO.box,0,-.04,.02,0,0,0,.05,.08,.28,k);tube(.017,.5,-.12,.012);tube(.016,.34,-.14,-.03,k2);b.add(GEO.box,0,-.07,-.34,0,0,0,.055,.05,.18,wd);b.add(GEO.box,0,-.075,.28,-.12,0,0,.045,.085,.26,wd);}
  else if(id==='none')b.add(GEO.box,0,0,0,0,0,0,.001,.001,.001,k); // Bobo needs no gun
  else if(id==='pistol'){b.add(GEO.box,0,.005,-.07,0,0,0,.032,.045,.19,k);b.add(GEO.box,0,-.1,-.01,.22,0,0,.03,.11,.048,k2);}
  else{b.add(GEO.box,0,-.04,.01,0,0,0,.05,.085,.3,k);b.add(GEO.cyl8,0,-.005,-.39,-PI/2,0,0,.03,.24,.03,k2);tube(.011,.2,-.39,-.005);b.add(GEO.box,0,.05,-.56,0,0,0,.012,.05,.012,k);b.add(GEO.box,0,.03,.0,0,0,0,.03,.03,.14,k2);
    b.add(GEO.box,0,-.2,-.05,.12,0,0,.034,.17,.06,k2);b.add(GEO.box,0,-.13,.1,-.25,0,0,.04,.1,.05,k);b.add(GEO.cyl8,0,-.02,.42,-PI/2,0,0,.02,.22,.02,k);b.add(GEO.box,0,-.055,.36,0,0,0,.04,.1,.12,k);}
  return wGeo[id]=b.build();}
const KW={rifle:'ak',rush:'smg',heavy:'lmg',mark:'dmr',ally:'m4',june:'smg',penn:'dmr',bobo:'none'};
const footShade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:M.shade.map}),
  footGeo=(()=>{const g=new T.PlaneGeometry(1.5,1.5);g.rotateX(-PI/2);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,.02+u.getX(i)*.46);return g;})();
// One skinned mesh per soldier: every body part is rigidly bound to its joint, so a whole soldier is a single draw call.
const skinMat=L({vertexColors:true,map:solMat.map,skinning:true}),rigCache={};
const JOINT=[[0,0,0],[0,1,0],[-.3,.47,0],[0,-.36,0],[.3,.47,0],[0,-.36,0],[.12,.36,-.42],[-.12,.9,0],[0,-.46,0],[.12,.9,0],[0,-.46,0]],PARENT=[-1,0,1,2,1,4,1,0,7,0,9];
// bones: 0 body, 1 upper body, 2/3 left arm and forearm, 4/5 right, 6 weapon, 7/8 left thigh and shin, 9/10 right
function rigGeo(kind,wid){wid=wid||KW[kind];const key=kind+'/'+wid;if(rigCache[key])return rigCache[key];const G0=parts(kind),W=[];for(let k=0;k<11;k++){const p=JOINT[k].slice(),q=PARENT[k];if(q>=0){p[0]+=W[q][0];p[1]+=W[q][1];p[2]+=W[q][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.fore,3],[G0.arm,4],[G0.fore,5],[weaponGeo(wid),6],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],b=it[1],o=it[2]||W[b],P=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k=p.length/3;
    for(let i=0;i<P.count;i++){p.push(P.getX(i)+o[0],P.getY(i)+o[1],P.getZ(i)+o[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));u.push(U.getX(i),U.getY(i));si.push(b,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return rigCache[key]=g;}
function buildSoldier(kind,wid){const g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(JOINT[k][0],JOINT[k][1],JOINT[k][2]);B.push(b);if(PARENT[k]>=0)B[PARENT[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(rigGeo(kind,wid),skinMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);
  if(KIND[kind].sc)g.scale.setScalar(KIND[kind].sc);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10]};}
const allyMark=tex(32,32,(g,w,h)=>{g.fillStyle='#8ec1e6';g.strokeStyle='#15110c';g.lineWidth=3;g.beginPath();g.moveTo(16,27);g.lineTo(4,8);g.lineTo(28,8);g.closePath();g.fill();g.stroke();});
const foes=[],allies=[],corpses=[];let nidSeq=0;
function addMark(s){const sp=new T.Sprite(new T.SpriteMaterial({map:allyMark,depthTest:false,transparent:true,sizeAttenuation:false}));sp.scale.set(.028,.028,1);sp.position.y=2.25;sp.renderOrder=50;s.g.add(sp);s.mark=sp;}
function addSoldier(team,kind,x,z,o){o=o||{};const m=buildSoldier(kind,o.wid),K=KIND[kind];
  const s={team,kind,K,x,z,y0:o.y0||0,yaw:o.yaw===undefined?R()*TAU:o.yaw,hp:K.hp,maxHp:K.hp,alive:true,sc:K.sc||1,
    crouch:0,wantCrouch:false,ph:R()*6,moveAmt:0,mx:0,mz:0,run:false,aimP:0,lowered:!o.aware,
    aware:!!o.aware,spot:0,target:null,seeT:99,lkx:x,lkz:z,cover:null,coverT:0,phase:'hide',phaseT:R2(.3,1.2),pushT:R2(6,12),
    burst:0,burstT:0,shootT:R2(.4,1.2),reactT:0,flinch:0,stuckT:0,lastX:x,lastZ:z,strafe:R()<.5?-1:1,strafeT:R2(1,3),percT:R()*.25,
    post:o.post||{x,z},post2:o.post2||null,patrolT:R2(1,5),goingBack:false,isStatic:!!o.isStatic,aimT:0,nadeT:R2(8,16),revealT:0,
    name:o.name||'',downT:0,deadT:0,fall:1,goal:null,goalT:0,searchT:0,stepD:0,tag:o.tag||'',nid:++nidSeq,
    g:m.g,mesh:m.mesh,body:m.body,up:m.up,aL:m.aL,aR:m.aR,fL:m.fL,fR:m.fR,wp:m.wp,lL:m.lL,lR:m.lR,kL:m.kL,kR:m.kR,mark:null};
  s.g.position.set(x,s.y0,z);s.g.rotation.y=s.yaw;
  if(team===0)addMark(s);
  scene.add(s.g);(o.list||(team?foes:allies)).push(s);return s;}
// another weapon in the hands of a soldier that already exists (the stand-ins for other players swap weapons)
function setSoldierWeapon(s,wid){s.mesh.geometry=rigGeo(s.kind,wid);}
function removeSoldier(s){scene.remove(s.g);}
// pose and limb animation
function animSoldier(s,dt){if(s.kind==='bobo'){animBobo(s,dt);return;}if(s.ride&&s.bikeM){animRider(s);return;}const c=s.crouch,m=s.moveAmt,ph=s.ph,sw=Math.sin(ph)*(s.run?.95:.65)*m;
  s.body.position.y=-.42*c+Math.abs(Math.sin(ph))*.035*m;
  // positive x rotation swings a hanging limb forward (towards -z)
  s.lL.rotation.x=1.15*c+sw;s.lR.rotation.x=1.15*c-sw;
  s.kL.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*.5))*.75*m;s.kR.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*1.5))*.75*m;
  const low=s.lowered?1:0,L0=s.up.userData.low===undefined?low:s.up.userData.low,lw=L0+(low-L0)*Math.min(1,dt*6);s.up.userData.low=lw;
  s.up.rotation.x=-.1*m*(s.run?2.2:1)-.22*c+s.aimP*(1-lw)-(s.flinch>0?.18:0);
  s.aR.rotation.set(.75-lw*.35,0,-.1);s.fR.rotation.x=1.25-lw*.5;s.aL.rotation.set(1.2-lw*.5,0,.5);s.fL.rotation.x=.3;
  s.wp.rotation.x=-lw*.6;s.wp.position.y=.36-lw*.12;}
// Bobo has no gun: arms swing, and his moves have poses of their own (s.bs: walk, wind, charge, stun, slamUp, slam, grab, throw, punch, sit, up)
function animBobo(s,dt){s.up.rotation.z=0;const m=s.moveAmt,ph=s.ph,st=s.bs||'walk',k=s.bT||0,sw=Math.sin(ph)*(s.run?.95:.55)*m;
  let by=Math.abs(Math.sin(ph))*.05*m,lean=-.08*m*(s.run?3:1),aL=-sw*.8,aR=sw*.8,zL=-.24,zR=.24,fL=.25,fR=.25,lL=sw,lR=-sw,
    kL=-Math.max(0,Math.sin(ph+PI*.5))*.8*m,kR=-Math.max(0,Math.sin(ph+PI*1.5))*.8*m;
  if(st==='wind'){const p=Math.sin(k*13);lean=-.38;by=-.1;aL=-.45;aR=-.45;zL=-.55;zR=.55;fL=fR=.9;lL=.3;lR=-.35+p*.35;kL=-.55;kR=-.3-Math.max(0,p)*.5;}  // head down, scraping a foot
  else if(st==='charge'){lean=-.6;aL=aR=.95;zL=-.4;zR=.4;fL=fR=.7;}
  else if(st==='slamUp'){const e=Math.min(1,k/.45);lean=.22*e;aL=aR=2.9*e;zL=-.2;zR=.2;fL=fR=.35;by=.03*e;}
  else if(st==='slam'){const e=Math.min(1,k/.1);lean=.22-.9*e;aL=aR=2.9-2*e;fL=fR=.3;by=-.28*e;kL=kR=-.75*e;lL=lR=.5*e;}
  else if(st==='stun'){lean=-.45+Math.sin(G.time*5)*.05;aL=aR=.35;fL=fR=.45;by=-.1;lL=lR=.15;kL=kR=-.3;}
  else if(st==='grab'||st==='throw'){aL=aR=1.45;zL=-.05;zR=.05;fL=fR=.3;lean=.05;if(st==='throw'){const e=Math.min(1,k/.22);aR=1.45-1.1*e;aL=1.45+.7*e;lean=.05-.35*e;}}
  else if(st==='punch'){const e=Math.sin(Math.min(1,k/.35)*PI);aR=.35+1.25*e;fR=1.3-1.2*e;lean=-.18*e;}
  else if(st==='scoot'||st==='swing'||st==='wobble'){by=-.5+Math.sin(G.time*20)*.012;lean=-.12;aL=aR=1.2;zL=-.15;zR=.15;fL=fR=.45;lL=lR=1.38;kL=kR=-1.6; // knees up, on a scooter far too small
    if(st==='swing'){const e=Math.min(1,k/.5);zR=.15+1.35*e;aR=1.2-.9*e;fR=.45-.4*e;lean=-.12+.15*e;}
    else if(st==='wobble'){const q=1-k/1.3;s.up.rotation.z=Math.sin(k*14)*.3*q;aL=1.2+Math.sin(k*17)*.7*q;aR=1.2-Math.sin(k*15)*.7*q;}}
  else if(st==='sit'||st==='up'){const e=st==='sit'?Math.min(1,k/.6):Math.max(0,1-k/.9),q=1-e;
    by=by*q-.8*e;lean=lean*q+.18*e;aL=aL*q+.6*e;aR=aR*q+.6*e;fL=fL*q+1*e;fR=fR*q+1*e;zL=-.24*q-.35*e;zR=.24*q+.35*e;lL=lL*q+1.45*e;lR=lR*q+1.4*e;kL=kL*q-.15*e;kR=kR*q-.1*e;}
  s.body.position.y=by;s.up.rotation.x=lean;s.aL.rotation.set(aL,0,zL);s.aR.rotation.set(aR,0,zR);s.fL.rotation.x=fL;s.fR.rotation.x=fR;
  s.lL.rotation.x=lL;s.lR.rotation.x=lR;s.kL.rotation.x=kL;s.kR.rotation.x=kR;s.wp.position.y=.36;}
// a squad mate on a lowrider bike: sitting low, pedalling, hands on the bars
function animRider(s){const p=s.ph;s.body.position.y=-.3;s.up.rotation.x=-.3;s.up.rotation.z=0;s.aL.rotation.set(1.25,0,-.12);s.aR.rotation.set(1.25,0,.12);s.fL.rotation.x=s.fR.rotation.x=.35;
  s.lL.rotation.x=1.05+Math.sin(p)*.35;s.lR.rotation.x=1.05-Math.sin(p)*.35;s.kL.rotation.x=-1.25-Math.cos(p)*.3;s.kR.rotation.x=-1.25+Math.cos(p)*.3;s.wp.rotation.x=-.7;s.wp.position.y=.24;}
// ray against soldiers: head sphere, torso and leg cylinders. Result in RS.
const RS={s:null,t:0,zone:1};
function raySoldiers(list,ox,oy,oz,dx,dy,dz,maxT){let bt=maxT;RS.s=null;const a=dx*dx+dz*dz;
  for(let k=0;k<list.length;k++){const s=list[k];if(!s.alive)continue;const cx=ox-s.x,cz=oz-s.z,sc=s.sc,low=s.crouch*.45*sc;
    let cy=oy-(s.y0+1.67*sc-low),b=cx*dx+cy*dy+cz*dz,c=cx*cx+cy*cy+cz*cz-.046*sc*sc,disc=b*b-c;
    if(disc>0){const t=-b-Math.sqrt(disc);if(t>0&&t<bt){bt=t;RS.s=s;RS.zone=0;}}
    if(a>1e-9){b=cx*dx+cz*dz;c=cx*cx+cz*cz-.12*sc*sc;disc=b*b-a*c;
      if(disc>0){const t=(-b-Math.sqrt(disc))/a;if(t>0&&t<bt){const y=oy+dy*t-s.y0;if(y>0&&y<1.56*sc-low){bt=t;RS.s=s;RS.zone=y>(.9-s.crouch*.45)*sc?1:2;}}}}}
  RS.t=bt;return RS.s;}
const eyeY=s=>s.y0+(1.6-s.crouch*.5)*s.sc,chestY=s=>s.y0+(1.25-s.crouch*.42)*s.sc;
