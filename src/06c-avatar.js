// =====================================================================
// 06c AVATAR: the player's own body for the third-person view: the soldier rig and its animation, dressed as a person
// =====================================================================
// The whole look comes from AVATAR, so that a real person's look (from photos) can be dropped in later with setAvatar({...}):
// colours, hair (short, buzz, braids, bald), shirt (tee, jersey, flannel), hat (null or {type:'cap',col}) and face: a square picture
// of the face (a canvas, an image, or a data: URL; never a link to another site), eyes about 45% down, shown on the front of the head.
// face:null draws a plain placeholder face.
const AVATAR={name:'RAY',skin:0x8d5a3b,hair:0x15110c,hairStyle:'short',shirt:0xf2efe6,shirtStyle:'tee',pants:0x2b3a55,shoes:0xf4f0e7,hat:null,face:null};
// one texture for the whole body: cloth weave (left), a plain white strip (skin, hair, shoes, the gun) and the face (right half)
const avCv=document.createElement('canvas');avCv.width=256;avCv.height=128;
const avTex=new T.CanvasTexture(avCv);avTex.anisotropy=MAXA;
const avMat=L({vertexColors:true,map:avTex,skinning:true});
function avFacePlain(g,A){const sk=A.skin,dk=c=>css(shade(sk,c)),X=x=>192-x*60,Y=y=>64-y*60;
  g.fillStyle=css(sk);g.fillRect(128,0,128,128);
  const gr=g.createRadialGradient(192,60,20,192,64,66);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.16)');g.fillStyle=gr;g.fillRect(128,0,128,128);
  for(const s of [-1,1]){g.fillStyle=dk(.78);g.beginPath();g.ellipse(X(s*.36),Y(.15),9,5,0,0,TAU);g.fill(); // eye socket
    g.fillStyle='#efe9df';g.beginPath();g.ellipse(X(s*.36),Y(.12),6.5,3.4,0,0,TAU);g.fill();
    g.fillStyle='#3a2416';g.beginPath();g.arc(X(s*.36)+s*.5,Y(.12),3,0,TAU);g.fill();g.fillStyle='#0d0907';g.beginPath();g.arc(X(s*.36)+s*.5,Y(.12),1.4,0,TAU);g.fill();
    g.strokeStyle=css(shade(A.hair,1.2));g.lineWidth=1.6;g.beginPath();g.moveTo(X(s*.36)-7,Y(.15));g.quadraticCurveTo(X(s*.36),Y(.2),X(s*.36)+7,Y(.15));g.stroke(); // lid
    g.fillStyle=css(A.hair);g.beginPath();g.moveTo(X(s*.14),Y(.31));g.lineTo(X(s*.58),Y(.33));g.lineTo(X(s*.58),Y(.38));g.lineTo(X(s*.14),Y(.37));g.closePath();g.fill();} // flat brows
  g.fillStyle=dk(.84);g.beginPath();g.moveTo(X(-.05),Y(.08));g.lineTo(X(-.1),Y(-.2));g.lineTo(X(.1),Y(-.2));g.lineTo(X(.05),Y(.08));g.closePath();g.fill(); // nose
  g.fillStyle=dk(.62);for(const s of [-1,1]){g.beginPath();g.ellipse(X(s*.07),Y(-.21),2.6,1.6,0,0,TAU);g.fill();}
  g.fillStyle=dk(.6);g.fillRect(X(.22),Y(-.42)-1.5,X(-.22)-X(.22),3);g.fillStyle=dk(.8);g.fillRect(X(.16),Y(-.42)+1.5,X(-.16)-X(.16),2.5); // mouth
  g.fillStyle=dk(.9);g.fillRect(X(.12),Y(-.66),X(-.12)-X(.12),2);}
let avFaceSrc=null;
function avPaint(){const g=avCv.getContext('2d'),A=AVATAR;g.fillStyle='#f3f3f3';g.fillRect(0,0,128,128);
  g.fillStyle='rgba(0,0,0,.035)';for(let y=0;y<104;y+=2)g.fillRect(0,y,128,1);for(let x=1;x<128;x+=3)g.fillRect(x,0,1,104);
  for(let k=0;k<500;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.3)':'rgba(0,0,0,.05)';g.fillRect(R()*128,R()*104,1+R()*2,1);}
  g.fillStyle='#fff';g.fillRect(0,105,128,23);
  avFacePlain(g,A);const f=A.face;
  if(f){if(typeof f==='string'){if(/^data:image\//.test(f)){if(!avFaceSrc||avFaceSrc.src!==f){const im=new Image();im.onload=()=>{if(AVATAR.face===f)avPaint();};im.src=f;avFaceSrc=im;}
        if(avFaceSrc.complete&&avFaceSrc.naturalWidth)g.drawImage(avFaceSrc,128,0,128,128);}}
    else if(f.width)try{g.drawImage(f,128,0,128,128);}catch(e){}}
  avTex.needsUpdate=true;}
// geometry: low-poly pieces; uv mode 0 = plain white, 1 = cloth, 2 = the face (its own uv)
const AG={j:new T.SphereGeometry(1,6,4),head:new T.SphereGeometry(1,10,7),cap:new T.SphereGeometry(1,10,5,0,TAU,0,PI/2),
  limb:new T.CylinderGeometry(1,.85,1,7,1,true),torso:new T.CylinderGeometry(1,.82,1,9,1),hem:new T.CylinderGeometry(.85,1,1,9,1,true),face:new T.SphereGeometry(1,8,5,PI*1.5-1.2,2.4,.98,1.54)};
AG.limb.translate(0,-.5,0);AG.torso.translate(0,.5,0);AG.hem.translate(0,-.5,0);
{const p=AG.face.attributes.position,u=AG.face.attributes.uv;for(let i=0;i<p.count;i++)u.setXY(i,.75-p.getX(i)*.235,.5+p.getY(i)*.47);}
function avAdd(b,mode,geo,x,y,z,rx,ry,rz,sx,sy,sz,col){const k=b.u.length;b.add(geo,x,y,z,rx,ry,rz,sx,sy,sz,col);const u=b.u;
  for(let i=k;i<u.length;i+=2){if(mode===1){u[i]=.01+u[i]*.48;u[i+1]=.2+u[i+1]*.78;}else if(mode===0){u[i]=.25;u[i+1]=.05;}}}
// a piece from point a to point c (pieces grow along +y from their base)
const _sq=new T.Quaternion(),_sq2=new T.Quaternion(),_sv=new T.Vector3(),_sy=new T.Vector3(0,1,0),SE=new T.Euler();
function segRot(ax,ay,az,bx,by,bz,spin){_sv.set(bx-ax,by-ay,bz-az);const l=_sv.length()||1e-6;_sv.multiplyScalar(1/l);_sq.setFromUnitVectors(_sy,_sv);
  if(spin){_sq2.setFromAxisAngle(_sy,spin);_sq.multiply(_sq2);}SE.setFromQuaternion(_sq,'YXZ');return l;}
function avParts(){const A=AVATAR,sk=A.skin,sh=A.shirt,pa=A.pants,st=A.shirtStyle,hr=A.hair,o={};
  const trim=st==='jersey'?(((sh>>16&255)+(sh>>8&255)+(sh&255))>380?0x1d3f7a:0xf2efe6):0;
  let b=new GB(); // upper body, origin at the waist
  avAdd(b,1,AG.torso,0,0,0,0,0,0,.235,.53,.145,sh);
  for(const s of [-1,1])avAdd(b,st==='jersey'?0:1,AG.j,s*.255,.45,0,0,0,0,.084,.076,.088,st==='jersey'?sk:sh);
  if(st==='jersey'){for(const s of [-1,1])avAdd(b,1,GEO.box,s*.2,.08,0,0,0,s*.08,.02,.4,.2,trim);
    avAdd(b,1,AG.limb,0,.555,0,0,0,0,.075,.04,.07,trim);}
  if(st==='flannel'){avAdd(b,1,GEO.box,0,.06,-.128,0,0,0,.15,.44,.03,0xf2efe6);for(const s of [-1,1])avAdd(b,1,GEO.box,s*.085,.04,-.132,0,0,0,.028,.46,.03,shade(sh,.78));}
  avAdd(b,0,AG.limb,0,.62,0,0,0,0,.055,.11,.055,sk);                                       // neck
  avAdd(b,0,AG.head,0,.69,0,0,0,0,.108,.128,.118,sk);avAdd(b,2,AG.face,0,.69,0,0,0,0,.1092,.1294,.1194,0xffffff);
  for(const s of [-1,1])avAdd(b,0,AG.j,s*.108,.685,.005,0,0,0,.02,.034,.026,shade(sk,.94)); // ears
  const hs=A.hairStyle;
  if(hs==='short')avAdd(b,0,AG.cap,0,.69,.006,.5,0,0,.117,.139,.128,hr);
  else if(hs==='buzz')avAdd(b,0,AG.cap,0,.69,.004,.52,0,0,.117,.139,.127,mixc(hr,sk,.3));
  else if(hs==='braids'){avAdd(b,0,AG.cap,0,.69,.005,.5,0,0,.116,.138,.127,hr);
    for(let k=0;k<5;k++){const x=-.07+k*.035,l=segRot(x,.72,.08,x*1.25,.5,.15);avAdd(b,0,GEO.rod,x,.72,.08,SE.x,SE.y,SE.z,.013,l,.013,shade(hr,1.15));}}
  if(A.hat&&A.hat.type==='cap'){const c=A.hat.col===undefined?0x1d3f7a:A.hat.col;avAdd(b,1,AG.cap,0,.73,.005,.16,0,0,.122,.095,.132,c);avAdd(b,1,GEO.box,0,.728,-.14,-.1,0,0,.19,.012,.12,shade(c,.85));}
  o.up=b.build();
  b=new GB();avAdd(b,1,AG.torso,0,-.13,0,0,0,0,.215,.23,.148,pa);                          // jeans
  if(st==='flannel'||st==='tee')avAdd(b,1,AG.hem,0,.07,0,0,0,0,.226,.15,.158,st==='tee'?sh:shade(sh,.9));  // untucked hem
  else avAdd(b,0,AG.torso,0,.03,0,0,0,0,.222,.04,.152,0x2a2420);                          // belt under the jersey
  o.hips=b.build();
  b=new GB();
  if(st==='tee'){avAdd(b,1,AG.j,0,-.07,0,0,0,0,.067,.125,.07,sh);avAdd(b,0,AG.limb,0,0,0,0,0,0,.054,.36,.054,sk);avAdd(b,0,AG.j,0,-.36,0,0,0,0,.048,.05,.048,sk);}
  else if(st==='jersey'){avAdd(b,0,AG.limb,0,.02,0,0,0,0,.058,.38,.058,sk);avAdd(b,0,AG.j,0,-.36,0,0,0,0,.048,.05,.048,sk);}
  else{avAdd(b,1,AG.limb,0,.02,0,0,0,0,.07,.38,.07,sh);avAdd(b,1,AG.j,0,-.36,0,0,0,0,.058,.058,.058,sh);}
  o.arm=b.build();
  b=new GB();if(st==='flannel'){avAdd(b,1,AG.limb,0,0,0,0,0,0,.058,.25,.058,sh);avAdd(b,1,AG.limb,0,-.2,0,0,0,0,.054,.05,.054,shade(sh,.75));}
  else avAdd(b,0,AG.limb,0,0,0,0,0,0,.048,.27,.048,sk);
  avAdd(b,0,AG.j,0,-.31,0,0,0,0,.042,.062,.05,sk);o.fore=b.build();
  b=new GB();avAdd(b,1,AG.limb,0,.04,0,0,0,0,.118,.49,.122,pa);avAdd(b,1,AG.j,0,-.45,-.012,0,0,0,.095,.085,.098,pa);o.thigh=b.build(); // baggy jeans
  b=new GB();avAdd(b,1,AG.limb,0,0,0,0,0,0,.098,.33,.102,pa);avAdd(b,1,AG.limb,0,-.27,0,0,0,0,.108,.13,.112,shade(pa,.9)); // stacked at the shoe
  avAdd(b,0,AG.j,0,-.425,-.045,0,0,0,.064,.055,.135,A.shoes);avAdd(b,0,GEO.box,0,-.485,-.04,0,0,0,.13,.03,.27,shade(A.shoes,.86));o.shin=b.build(); // sneakers
  return o;}
// skinned geometry like rigGeo (05), with this module's parts and uv
const avGeoC={};let avP=null;
function avRig(wid){if(avGeoC[wid])return avGeoC[wid];if(!avP)avP=avParts();const G0=avP,W=[];for(let k=0;k<11;k++){const p=JOINT[k].slice(),q=PARENT[k];if(q>=0){p[0]+=W[q][0];p[1]+=W[q][1];p[2]+=W[q][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.fore,3],[G0.arm,4],[G0.fore,5],[weaponGeo(wid),6],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],b=it[1],o=it[2]||W[b],Pp=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k=p.length/3;
    for(let i=0;i<Pp.count;i++){p.push(Pp.getX(i)+o[0],Pp.getY(i)+o[1],Pp.getZ(i)+o[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));
      if(b===6)u.push(.25,.05);else u.push(U.getX(i),U.getY(i));si.push(b,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return avGeoC[wid]=g;}
// the figure: same bones as a soldier, so animSoldier poses it
const PAV=(()=>{const g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(JOINT[k][0],JOINT[k][1],JOINT[k][2]);B.push(b);if(PARENT[k]>=0)B[PARENT[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);avPaint();const mesh=new T.SkinnedMesh(avRig('m4'),avMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);g.visible=false;scene.add(g);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10],wid:'m4',yaw:0,ph:0,moveAmt:0,crouch:0,run:false,lowered:true,aimP:0,flinch:0,deadT:0,sc:1};})();
function setAvatar(cfg){Object.assign(AVATAR,cfg||{});avP=null;for(const k in avGeoC){avGeoC[k].dispose();delete avGeoC[k];}PAV.mesh.geometry=avRig(PAV.wid);avPaint();}
// muzzle flash at the avatar's gun
const tpFlash=new T.Sprite(flash.material);tpFlash.scale.set(.42,.42,1);tpFlash.visible=false;scene.add(tpFlash);
function avMuzzle(v,D){PAV.g.updateMatrixWorld(true);v.set(0,.01,D.mz*.95);PAV.wp.localToWorld(v);return v;}
// called from updCamera every frame of play
function updAvatar(dt){const show=VIEW.on&&VIEW.sc<.5&&VIEW.d>.6&&P.alive;PAV.g.visible=show;if(!show)return;
  const wid=curW().id;if(PAV.wid!==wid){PAV.wid=wid;PAV.mesh.geometry=avRig(wid);}
  PAV.g.rotation.x=0;PAV.g.rotation.z=0;PAV.deadT=0;PAV.body.rotation.set(0,0,0);PAV.up.rotation.set(0,0,0);PAV.wp.scale.setScalar(1);PAV.wp.position.set(JOINT[6][0],JOINT[6][1],JOINT[6][2]);PAV.wp.rotation.set(0,0,0);PAV.lL.rotation.z=PAV.lR.rotation.z=0;
  if(P.bike){rideAvatar(dt);return;}
  const mv=P.speed>.5,aim=P.ads>.05||P.wantAds||P.fireT>-.9||P.nadeT>.4||P.meleeT>0,my=Math.atan2(-P.vx,-P.vz);
  // facing: where the player aims, else where they walk; standing still keeps the last heading (turn the camera to see the face)
  const ty=aim?P.yaw:mv?my:PAV.yaw;PAV.yaw+=angDiff(ty,PAV.yaw)*Math.min(1,dt*(aim?18:9));
  // the legs walk in the direction of travel: the hips turn towards it, the chest keeps the aim, backwards plays the gait in reverse
  let rel=mv?angDiff(my,PAV.yaw):0,dir=1;if(rel>1.8){rel-=PI;dir=-1;}else if(rel<-1.8){rel+=PI;dir=-1;}
  PAV.ph+=P.speed*dt*(P.sprinting?2.1:2.6)*dir;PAV.moveAmt=lerp(PAV.moveAmt,clamp(P.speed/3,0,1),Math.min(1,dt*10));
  PAV.crouch=lerp(PAV.crouch,Math.max(P.crouch,P.ground?0:.35,P.stumT>0?.4:0),Math.min(1,dt*12));
  PAV.run=P.sprinting;PAV.lowered=P.sprinting||!aim;PAV.aimP=aim?clamp(P.pitch,-.8,.8):0;PAV.flinch=(P.stumT>0||P.hurtT<.12)?1:0;
  animSoldier(PAV,dt);
  const tw=clamp(rel,-.9,.9)*PAV.moveAmt;PAV.body.rotation.y=tw;PAV.up.rotation.y=-tw;
  if(P.reloading){PAV.wp.rotation.x-=.4;PAV.aL.rotation.x-=.35;PAV.fL.rotation.x+=.6;}
  if(P.meleeT>0){const ml=Math.sin(clamp(P.meleeT/.5,0,1)*PI);PAV.aL.rotation.set(.5+ml*1.2,0,.25);PAV.fL.rotation.x=.2;}
  if(P.nadeT>.5){const k=Math.sin(clamp((1-P.nadeT)/.5,0,1)*PI);PAV.aL.rotation.set(-2.2*k+.8*(1-k),0,.3);PAV.fL.rotation.x=.4;}
  PAV.g.position.set(P.x,P.y,P.z);PAV.g.rotation.y=PAV.yaw;}
// called from the frame loop in every state: hides the figure outside play; when the player is down it falls and the camera looks at it
function avatarFrame(dt){const st=G.state;if(st==='menu'||st==='win'||st==='lost'){PAV.g.visible=false;tpFlash.visible=false;if(P.bike)dismountBike(2);return;}
  if(P.alive||!VIEW.on||(st!=='dead'&&st!=='play'))return;
  PAV.deadT+=dt;const k=Math.min(1,PAV.deadT/.45),e=k*k*(3-2*k),a=PAV.yaw,c=Math.cos(a),s=Math.sin(a);PAV.g.visible=true;tpFlash.visible=false;
  PAV.g.position.set(P.x,P.y+e*.13,P.z);PAV.g.rotation.set(e*1.5,a,0);PAV.body.position.y=0;PAV.body.rotation.set(0,0,0);PAV.up.rotation.set(0,0,0);
  PAV.aL.rotation.set(.4,0,-e*1.1);PAV.aR.rotation.set(.3,0,e*.9);PAV.fL.rotation.x=.2;PAV.fR.rotation.x=.3;PAV.lL.rotation.x=e*.3;PAV.kL.rotation.x=0;PAV.lR.rotation.x=0;PAV.kR.rotation.x=-e*.7;
  // camera: up and to the side of the body, pulled in if a wall is in the way
  const lx=2.2,ly=2.4+e*.8,lz=-1.8,wx=lx*c+lz*s,wz=-lx*s+lz*c,hx=P.x+.9*s,hz=P.z+.9*c,d=Math.hypot(wx,ly,wz),t=rayWorld(hx,P.y+.4,hz,wx/d,ly/d,wz/d,d),q=Math.min(1,Math.max(.2,t-.3)/d);
  camera.position.set(hx+wx*q,P.y+.4+ly*q,hz+wz*q);camera.lookAt(hx,P.y+.25,hz);}
