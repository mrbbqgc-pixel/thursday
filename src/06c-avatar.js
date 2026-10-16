// =====================================================================
// 06c AVATAR: the player's own body for the third-person view: the figure toolkit and rig of 05, dressed and textured as a person
// =====================================================================
// The whole look comes from AVATAR, so that a real person's look (from photos) can be dropped in later with setAvatar({...}):
// colours, hair (short, buzz, braids, bald), shirt (tee, jersey, flannel), hat (null or {type:'cap',col}) and face: a square picture
// of the face (a canvas, an image, or a data: URL; never a link to another site), eyes about 45% down, shown on the front of the head.
// face:null draws a plain placeholder face. Optional: number (on a jersey's back), shoeSole, belt.
const AVATAR={name:'RAY',skin:0x8d5a3b,hair:0x15110c,hairStyle:'short',shirt:0xf2efe6,shirtStyle:'tee',pants:0x2b3a55,shoes:0xf4f0e7,hat:null,face:null};
// one texture for the whole body (256 x 256): the shirt (top left), the face (top right), denim for the legs and for the seat with its
// pockets (left), hair strands, and a white texel for everything coloured by its vertices (skin, shoes, the gun)
const avCv=document.createElement('canvas');avCv.width=256;avCv.height=256;
const avTex=new T.CanvasTexture(avCv);avTex.anisotropy=MAXA;
const avMat=L({vertexColors:true,map:avTex,skinning:true});
const AVCELL={1:[0,.5,.5,.5],6:[0,.5,.5,.5],7:[0,.5,.5,.5],2:[.5,.5,.5,.5],3:[.5,.25,.25,.25],4:[0,.25,.5,.25],5:[0,0,.5,.25]};
// colours painted into the texture: a vertex then only says how much darker it is than the painted colour
const avRat=(c,b)=>{let o=0;for(const sh of [16,8,0]){const x=c>>sh&255,y=b>>sh&255;o|=(y?clamp(Math.round(x/y*255),0,255):255)<<sh;}return o;};
const AVC={uv(m,u,v,q){const c=AVCELL[m];if(!c){q[0]=.875;q[1]=.125;return q;}const e=2/256;q[0]=c[0]+e+clamp(u,0,1)*(c[2]-2*e);q[1]=c[1]+e+clamp(v,0,1)*(c[3]-2*e);return q;},
  vc(m,c){const A=AVATAR;return m===1||m===6||m===7?avRat(c,A.shirt):m===4||m===5?avRat(c,A.pants):m===2?avRat(c,A.skin):c;},face:true,paint:true,hq:true};
// a point (u,v) of a cell on the canvas
const avXY=(m,u,v)=>{const c=AVCELL[m];return[(c[0]+u*c[2])*256,(1-c[1]-v*c[3])*256];};
// the placeholder face, drawn in the head's own frame (metres): x = 128 + (hx + .1) * 640, y = (.815 - hy) * 640
function avFacePlain(g,A){const sk=A.skin,dk=c=>css(shade(sk,c)),X=x=>128+(x+.1)*640,Y=y=>(.815-y)*640;
  g.fillStyle=css(sk);g.fillRect(128,0,128,128);
  let gr=g.createLinearGradient(128,0,256,0);gr.addColorStop(0,'rgba(0,0,0,.14)');gr.addColorStop(.28,'rgba(0,0,0,0)');gr.addColorStop(.72,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.14)');g.fillStyle=gr;g.fillRect(128,0,128,128);
  gr=g.createLinearGradient(0,82,0,128);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=gr;g.fillRect(128,82,128,46);
  for(const s of [-1,1]){const ex=X(s*.033),ey=Y(.727);g.fillStyle=dk(.8);g.beginPath();g.ellipse(ex,ey-1,15,8.5,0,0,TAU);g.fill();           // eye socket
    g.fillStyle='#ebe4da';g.beginPath();g.ellipse(ex,ey,10,4.4,0,0,TAU);g.fill();g.fillStyle='#3a2416';g.beginPath();g.arc(ex+s*.6,ey,4,0,TAU);g.fill();
    g.fillStyle='#0d0907';g.beginPath();g.arc(ex+s*.6,ey,1.8,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(ex+s*.6-1.8,ey-2.2,1.4,1.4);
    g.strokeStyle=css(shade(sk,.45));g.lineWidth=2.2;g.beginPath();g.moveTo(ex-11,ey);g.quadraticCurveTo(ex,ey-7.5,ex+11,ey-.5);g.stroke();           // upper lid
    g.strokeStyle=dk(.7);g.lineWidth=1;g.beginPath();g.moveTo(ex-9,ey+3.5);g.quadraticCurveTo(ex,ey+6,ex+9,ey+3);g.stroke();
    g.fillStyle=css(A.hair);g.beginPath();g.moveTo(X(s*.012),Y(.751));g.quadraticCurveTo(X(s*.032),Y(.763),X(s*.058),Y(.751));g.lineTo(X(s*.056),Y(.745));g.quadraticCurveTo(X(s*.032),Y(.754),X(s*.013),Y(.745));g.fill(); // brow
    g.fillStyle=dk(.94);g.beginPath();g.ellipse(X(s*.05),Y(.665),12,14,0,0,TAU);g.fill();}                                                        // cheek shading
  g.fillStyle=dk(.86);g.beginPath();g.moveTo(X(-.006),Y(.72));g.lineTo(X(-.016),Y(.676));g.lineTo(X(.016),Y(.676));g.lineTo(X(.006),Y(.72));g.closePath();g.fill(); // nose
  g.fillStyle=dk(.55);for(const s of [-1,1]){g.beginPath();g.ellipse(X(s*.009),Y(.671),3.2,2,0,0,TAU);g.fill();}
  g.fillStyle=dk(.7);g.beginPath();g.ellipse(X(0),Y(.645),17,6,0,0,TAU);g.fill();g.fillStyle=dk(.6);g.beginPath();g.ellipse(X(0),Y(.652),16,3.2,0,PI,TAU);g.fill(); // lips
  g.strokeStyle=dk(.42);g.lineWidth=1.6;g.beginPath();g.moveTo(X(-.025),Y(.649));g.quadraticCurveTo(X(0),Y(.646),X(.025),Y(.649));g.stroke();
  g.fillStyle=dk(.9);g.beginPath();g.ellipse(X(0),Y(.616),14,6,0,0,TAU);g.fill();}
let avFaceSrc=null;const avFaceCv=document.createElement('canvas');avFaceCv.width=avFaceCv.height=128;
// the picture over the placeholder, its edges faded into the skin so the sides of the head match
function avFacePic(g,im){const c=avFaceCv.getContext('2d');c.globalCompositeOperation='source-over';c.clearRect(0,0,128,128);try{c.drawImage(im,0,0,128,128);}catch(e){return;}
  const gr=c.createRadialGradient(64,58,34,64,62,66);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');c.globalCompositeOperation='destination-in';c.fillStyle=gr;c.fillRect(0,0,128,128);
  c.globalCompositeOperation='source-over';g.drawImage(avFaceCv,128,0);}
function avPaint(){const g=avCv.getContext('2d'),A=AVATAR,st=A.shirtStyle||'tee',S=A.shirt,Pn=A.pants;g.fillStyle='#fff';g.fillRect(0,0,256,256);
  // shirt (u round from the right side: .25 the back, .75 the front; v from the hem to the neck)
  g.fillStyle=css(S);g.fillRect(0,0,128,128);
  if(st==='flannel'){const d=css(shade(S,.55)),l=css(mixc(S,0xffffff,.3));g.globalAlpha=.55;for(let x=0;x<128;x+=16){g.fillStyle=d;g.fillRect(x,0,6,128);g.fillStyle=l;g.fillRect(x+10,0,2,128);}
    for(let y=0;y<128;y+=16){g.fillStyle=d;g.fillRect(0,y,128,6);g.fillStyle=l;g.fillRect(0,y+10,128,2);}g.globalAlpha=1;
    const [fx]=avXY(1,.75,0);g.fillStyle='#f2efe6';g.fillRect(fx-7,16,14,112);g.fillStyle=css(shade(S,.6));g.fillRect(fx-9,16,2.5,112);g.fillRect(fx+6.5,16,2.5,112);}  // open over a white tee
  else if(st==='jersey'){g.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<128;y+=3)for(let x=(y%6?0:1.5);x<128;x+=3)g.fillRect(x,y,1.2,1.2);
    const tr=((S>>16&255)+(S>>8&255)+(S&255))>380?'#1d3f7a':'#f2efe6',num=String(A.number===undefined?4:A.number);
    for(const u of [0,.5,1]){const [x,y]=avXY(1,u,.86);g.fillStyle=tr;g.beginPath();g.ellipse(x,y,15,44,0,0,TAU);g.fill();g.fillStyle=css(A.skin);g.beginPath();g.ellipse(x,y,12,41,0,0,TAU);g.fill();} // arm holes with trim
    g.fillStyle=tr;g.textAlign='center';g.textBaseline='middle';const txt=(u,v,px)=>{const [x,y]=avXY(1,u,v);g.save();g.translate(x,y);g.scale(-1,1);g.font='bold '+px+'px Arial,sans-serif';g.fillText(num,0,0);g.restore();};txt(.25,.45,40);txt(.75,.6,20);} // the cell runs right to left round the body
  else{g.fillStyle='rgba(0,0,0,.03)';for(let y=0;y<128;y+=2)g.fillRect(0,y,128,1);}
  for(let k=0;k<700;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.14)':'rgba(0,0,0,.05)';g.fillRect(R()*128,R()*128,1+R()*2,1);}       // weave
  g.strokeStyle='rgba(0,0,0,.09)';g.lineWidth=2;for(let k=0;k<9;k++){const y=18+k*9+R()*4,x=R()*128;g.beginPath();g.moveTo(x-18,y+4);g.quadraticCurveTo(x,y-2,x+20,y+3);g.stroke();} // folds round the waist and back
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,122,128,6);g.fillRect(0,0,128,4);for(const u of [0,.5])g.fillRect(avXY(1,u,0)[0]-1,0,2,128);g.fillRect(126,0,2,128); // hems and side seams
  // face
  avFacePlain(g,A);const f=A.face;
  if(f){if(typeof f==='string'){if(/^data:image\//.test(f)){if(!avFaceSrc||avFaceSrc.src!==f){const im=new Image();im.onload=()=>{if(AVATAR.face===f)avPaint();};im.src=f;avFaceSrc=im;}
        if(avFaceSrc.complete&&avFaceSrc.naturalWidth)avFacePic(g,avFaceSrc);}}
    else if(f.width)avFacePic(g,f);}
  // denim (the legs: u .75 the front; v down the thigh, then down the shin) and the seat with its back pockets
  for(const m of [4,5]){const c=AVCELL[m],x0=c[0]*256,y0=(1-c[1]-c[3])*256,w=c[2]*256,h=c[3]*256;g.fillStyle=css(Pn);g.fillRect(x0,y0,w,h);
    g.strokeStyle='rgba(255,255,255,.06)';g.lineWidth=1;for(let k=-h;k<w;k+=3){g.beginPath();g.moveTo(x0+k,y0+h);g.lineTo(x0+k+h,y0);g.stroke();}
    for(let k=0;k<500;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)';g.fillRect(x0+R()*w,y0+R()*h,1+R()*3,1);}}
  {const gr=g.createRadialGradient(...avXY(4,.75,.45),2,...avXY(4,.75,.45),40);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,128,128,64); // worn front
    g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=1.5;for(let k=0;k<6;k++){const [x,y]=avXY(4,R(),.86+R()*.12);g.beginPath();g.moveTo(x-12,y);g.quadraticCurveTo(x,y+3,x+12,y);g.stroke();} // stacked at the shoes
    g.fillStyle='rgba(0,0,0,.14)';for(const u of [0,.5])g.fillRect(avXY(4,u,0)[0]-1,128,2,64);g.fillRect(126,128,2,64);}
  for(const s of [-1,1]){const [x,y]=avXY(5,.25+s*.1,.33),w=16,h=26;g.fillStyle=css(shade(Pn,.84));g.beginPath();g.moveTo(x-w/2,y-h/2);g.lineTo(x+w/2,y-h/2);g.lineTo(x+w/2-1,y+h/2-4);g.lineTo(x,y+h/2);g.lineTo(x-w/2+1,y+h/2-4);g.closePath();g.fill();
    g.strokeStyle='rgba(214,170,90,.55)';g.lineWidth=1;g.stroke();}                                                                         // back pockets with stitching
  for(const u of [.07,.19,.31,.43,.57,.69,.81,.93]){const [x,y]=avXY(5,u,.03);g.fillStyle=css(shade(Pn,.8));g.fillRect(x-1.5,y-6,3,7);}      // belt loops
  // hair strands, tinted by the vertices
  g.fillStyle='#d2d2d2';g.fillRect(128,128,64,64);for(let k=0;k<200;k++){const x=128+R()*64,y=128+R()*64,l=5+R()*14;g.strokeStyle=R()<.6?'rgba(0,0,0,'+(.08+R()*.2).toFixed(2)+')':'rgba(255,255,255,'+(.1+R()*.25).toFixed(2)+')';
    g.lineWidth=.6+R()*.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+R()*4-2,y+l/2,x+R()*6-3,y+l);g.stroke();}
  avTex.needsUpdate=true;}
// the look the figure builder (05) takes, from AVATAR
function avLook(){const A=AVATAR,st=A.shirtStyle||'tee',hs=A.hairStyle||'short',tr=((A.shirt>>16&255)+(A.shirt>>8&255)+(A.shirt&255))>380?0x1d3f7a:0xf2efe6,h=A.hat&&A.hat.type==='cap'?A.hat:null;
  return{skin:A.skin,shirt:A.shirt,sleeve:st==='jersey'?'none':st==='flannel'?'long':'short',collar:st==='flannel'?'polo':'crew',collarC:st==='jersey'?tr:undefined,tuck:false,
    hemY:st==='jersey'?-.12:undefined,pants:A.pants,cut:'baggy',rise:-.035,seat:1,belt:A.belt===undefined?0x2a2420:A.belt,shoeType:'sneaker',shoe:A.shoes,sole:A.shoeSole===undefined?0xbfb6a6:A.shoeSole,
    hair:A.hair,hairStyle:hs==='bald'?'none':hs,hat:h?'cap':null,hatC:h?(h.col===undefined?0x1d3f7a:h.col):undefined,laces:shade(A.shoes,.86)};}
// a piece from point a to point c (pieces grow along +y from their base); also used by the bikes (06d)
const _sq=new T.Quaternion(),_sq2=new T.Quaternion(),_sv=new T.Vector3(),_sy=new T.Vector3(0,1,0),SE=new T.Euler();
function segRot(ax,ay,az,bx,by,bz,spin){_sv.set(bx-ax,by-ay,bz-az);const l=_sv.length()||1e-6;_sv.multiplyScalar(1/l);_sq.setFromUnitVectors(_sy,_sv);
  if(spin){_sq2.setFromAxisAngle(_sy,spin);_sq.multiply(_sq2);}SE.setFromQuaternion(_sq,'YXZ');return l;}
const AG={j:new T.SphereGeometry(1,6,4)}; // a cheap round piece (the bikes use it)
// skinned geometry of the figure with a weapon, like rigGeo (05)
const avGeoC={};let avP=null;
function avParts(){return figParts(avLook(),AVC);}
function avRig(wid){if(avGeoC[wid])return avGeoC[wid];if(!avP)avP=avParts();return avGeoC[wid]=skinGeo(figList(avP,weaponGeo(wid)),'',[.875,.125]);}
// the figure: the same bones as a soldier, so animSoldier poses it
const PAV=(()=>{const g=new T.Group();g.rotation.order='YXZ';const FB=figBones(''),B=FB.B;
  g.add(B[0]);g.updateMatrixWorld(true);avPaint();const mesh=new T.SkinnedMesh(avRig('m4'),avMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);g.visible=false;scene.add(g);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10],ftL:B[11],ftR:B[12],hd:B[13],J:FB.J,wid:'m4',
    yaw:0,ph:0,moveAmt:0,crouch:0,run:false,lowered:true,aimP:0,flinch:0,deadT:0,sc:1,nid:1,y0:0,fall:1,kick:0,lh:null,lhv:[0,0,0]};})();
function setAvatar(cfg){Object.assign(AVATAR,cfg||{});avP=null;for(const k in avGeoC){avGeoC[k].dispose();delete avGeoC[k];}PAV.mesh.geometry=avRig(PAV.wid);avPaint();if(typeof vmSkin==='function')vmSkin();}
// muzzle flash at the avatar's gun
const tpFlash=new T.Sprite(flash.material);tpFlash.scale.set(.42,.42,1);tpFlash.visible=false;scene.add(tpFlash);
function avMuzzle(v,D){PAV.g.updateMatrixWorld(true);v.set(0,.01,D.mz*.98);PAV.wp.localToWorld(v);return v;}
// the left hand during a reload: to the magazine, down to a pouch with it, back with a new one, back on the gun (weapon frame, then chest)
const _av=new T.Vector3();
function avReloadHand(t,id){const H=HOLD[id]||HOLD.m4,q=PAV.wp.quaternion,p=PAV.wp.position,o=PAV.lhv;
  if(WDEF[id].shell){const k=Math.sin(clamp(t,0,1)*PI);_av.set(lerp(H.f[0],-.03,k),lerp(H.f[1],-.06,k),lerp(H.f[2],.03,k)).applyQuaternion(q).add(p);o[0]=_av.x;o[1]=_av.y;o[2]=_av.z;return o;}
  const mz=id==='pistol'?.03:id==='lmg'?-.05:-.08,my=id==='pistol'?-.13:id==='lmg'?-.2:-.2,
    K=t<.2?[t/.2,0]:t<.45?[1,(t-.2)/.25]:t<.7?[1,1-(t-.45)/.25]:[1-(t-.7)/.3,0],a=ease(K[0]),b=ease(K[1]);
  _av.set(lerp(H.f[0],-.02,a),lerp(H.f[1],my,a),lerp(H.f[2],mz,a)).applyQuaternion(q).add(p);
  o[0]=lerp(_av.x,-.1,b);o[1]=lerp(_av.y,.12,b);o[2]=lerp(_av.z,-.17,b);return o;}
// called from updCamera every frame of play
function updAvatar(dt){const show=VIEW.on&&VIEW.sc<.5&&VIEW.d>.6&&P.alive;PAV.g.visible=show;if(!show)return;
  const wid=curW().id;if(PAV.wid!==wid){PAV.wid=wid;PAV.mesh.geometry=avRig(wid);}
  PAV.g.rotation.x=0;PAV.g.rotation.z=0;PAV.deadT=0;PAV.body.rotation.set(0,0,0);PAV.up.rotation.set(0,0,0);PAV.wp.scale.setScalar(1);PAV.wp.position.set(JOINT[6][0],JOINT[6][1],JOINT[6][2]);PAV.wp.rotation.set(0,0,0);
  PAV.lL.rotation.z=PAV.lR.rotation.z=0;PAV.ftL.rotation.set(0,0,0);PAV.ftR.rotation.set(0,0,0);PAV.hd.rotation.set(0,0,0);PAV.lh=null;
  if(P.bike){rideAvatar(dt);return;}
  const mv=P.speed>.5,aim=P.ads>.05||P.wantAds||P.fireT>-.9||P.nadeT>.4||P.meleeT>0,my=Math.atan2(-P.vx,-P.vz);
  // facing: where the player aims, else where they walk; standing still keeps the last heading (turn the camera to see the face)
  const ty=aim?P.yaw:mv?my:PAV.yaw;PAV.yaw+=angDiff(ty,PAV.yaw)*Math.min(1,dt*(aim?18:9));
  // the legs walk in the direction of travel: the hips turn towards it, the chest keeps the aim, backwards plays the gait in reverse
  let rel=mv?angDiff(my,PAV.yaw):0,dir=1;if(rel>1.8){rel-=PI;dir=-1;}else if(rel<-1.8){rel+=PI;dir=-1;}
  // a walk below about 3.5 m/s, a jog at the normal 5 m/s, a run when sprinting: longer strides at a lower cadence
  const sp=P.speed,rk=P.sprinting?1:clamp((sp-3.2)/2,0,.8);PAV.ph+=sp*dt*lerp(2.55,1.6,rk)*dir;PAV.runK=rk;
  PAV.moveAmt=lerp(PAV.moveAmt,clamp(sp/3,0,1),Math.min(1,dt*10));
  PAV.crouch=lerp(PAV.crouch,Math.max(P.crouch,P.ground?0:.35,P.stumT>0?.4:0),Math.min(1,dt*12));
  PAV.run=P.sprinting;PAV.lowered=P.sprinting||!aim;PAV.aimP=aim?clamp(P.pitch,-.8,.8):0;PAV.flinch=(P.stumT>0||P.hurtT<.12)?1:0;PAV.kick=Math.max(PAV.kick,P.kick*.8);
  animSoldier(PAV,dt);
  const tw=clamp(rel,-.9,.9)*PAV.moveAmt;PAV.body.rotation.y+=tw;PAV.up.rotation.y-=tw;
  if(P.reloading){const D=curD(),t=D.shell?1-P.reloadT/D.reload:clamp(1-P.reloadT/(D.reload*(curW().mag===0?1.12:1)),0,1);
    PAV.wp.rotation.z+=.45*Math.sin(clamp(t*1.4,0,1)*PI*.5);PAV.wp.rotation.x+=.18;PAV.lh=avReloadHand(t,wid);armsOn(PAV);}
  if(P.meleeT>0){const ml=Math.sin(clamp(P.meleeT/.5,0,1)*PI);PAV.lh=null;PAV.aL.rotation.set(.5+ml*1.2,0,.25);PAV.fL.rotation.x=.2;}
  if(P.nadeT>.5){const k=Math.sin(clamp((1-P.nadeT)/.5,0,1)*PI);PAV.aL.rotation.set(-2.2*k+.8*(1-k),0,.3);PAV.fL.rotation.x=.4;}
  PAV.g.position.set(P.x,P.y,P.z);PAV.g.rotation.y=PAV.yaw;}
// called from the frame loop in every state: hides the figure outside play; when the player is down it falls and the camera looks at it
function avatarFrame(dt){const st=G.state;if(st==='menu'||st==='win'||st==='lost'){PAV.g.visible=false;tpFlash.visible=false;if(P.bike)dismountBike(2);return;}
  if(P.alive||!VIEW.on||(st!=='dead'&&st!=='play'))return;
  if(PAV.deadT===0){PAV.fall=R()<.55?1:-1;PAV.nid=(R()*4)|0;PAV.wp.scale.setScalar(.001);}
  PAV.deadT+=dt;const k=Math.min(1,PAV.deadT/.45),e=k*k*(3-2*k),a=PAV.yaw,c=Math.cos(a),s=Math.sin(a);PAV.g.visible=true;tpFlash.visible=false;
  PAV.y0=P.y;PAV.g.position.set(P.x,P.y,P.z);PAV.g.rotation.y=a;animDeath(PAV);
  // camera: up and to the side of the body, pulled in if a wall is in the way
  const lx=2.2,ly=2.4+e*.8,lz=-1.8,wx=lx*c+lz*s,wz=-lx*s+lz*c,hx=P.x+.9*s*PAV.fall,hz=P.z+.9*c*PAV.fall,d=Math.hypot(wx,ly,wz),t=rayWorld(hx,P.y+.4,hz,wx/d,ly/d,wz/d,d),q=Math.min(1,Math.max(.2,t-.3)/d);
  camera.position.set(hx+wx*q,P.y+.4+ly*q,hz+wz*q);camera.lookAt(hx,P.y+.25,hz);}
if(typeof vmSkin==='function')vmSkin(); // the first-person arms take the avatar's skin
