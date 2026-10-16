// =====================================================================
// 03a PROPS: geometry builder, vegetation (fan palms, Canary palms, street and yard trees, eucalyptus windrows, shrubs)
// and small furniture, all baked into the chunk batches
// =====================================================================
// GB merges primitives into one vertex-coloured geometry. add(geo, x,y,z, rx,ry,rz, sx,sy,sz, colour, shadeFn)
function GB(){this.p=[];this.n=[];this.c=[];this.u=[];this.i=[];}
GB.prototype.add=function(geo,x,y,z,rx,ry,rz,sx,sy,sz,col,fn){_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);_m4.compose(_p,_q,_s);_n3.getNormalMatrix(_m4);
  const P=geo.attributes.position,N=geo.attributes.normal,U=geo.attributes.uv,ix=geo.index,k=this.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,b=(col&255)/255;
  for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_m4);this.p.push(_v.x,_v.y,_v.z);const f=fn?fn(_v.x,_v.y,_v.z):1;this.c.push(r*f,g*f,b*f);
    _v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();this.n.push(_v.x,_v.y,_v.z);if(U)this.u.push(U.getX(i),U.getY(i));else this.u.push(0,0);}
  if(ix)for(let i=0;i<ix.count;i++)this.i.push(k+ix.getX(i));else for(let i=0;i<P.count;i++)this.i.push(k+i);return this;};
GB.prototype.build=function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.i);return g;};
const vcMat=L({vertexColors:true});
// static props are baked into the chunk batches so that they are culled with the rest of the town
const _o=new T.Object3D();
function bake(geo,mat,list,fn){list.forEach((p,k)=>{_o.position.set(0,0,0);_o.rotation.set(0,0,0);_o.scale.set(1,1,1);fn(_o,p,k);_o.updateMatrix();pushGeo(mat,geo,_o.matrix,0xffffff);});}
// ---------- palm leaves, drawn into the top of the cut-out texture FRT (02b): a feather frond (Canary palm), below it a fan leaf (Mexican fan palm)
const frondTex=FRT;((g,w)=>{g.clearRect(0,0,w,128);const h=64;for(let x=4;x<w-2;x+=5){const t=x/w,len=(h/2-2)*Math.sin(Math.min(1,t*1.5)*PI*.5)*(1-.55*t*t)+2;
    for(const s of [-1,1]){g.fillStyle=pick(['#3c7a35','#356e30','#44883a','#2f6229','#4b8f3f']);g.beginPath();g.moveTo(x-2,h/2);g.lineTo(x+7+rnd()*3,h/2+s*len);g.lineTo(x+3,h/2);g.fill();}}
  g.fillStyle='#7d8a4a';g.fillRect(0,h/2-1.5,w,3);
  // fan: segments radiating from the bottom centre, split tips
  for(let a=0;a<=40;a++){const an=PI*(.06+.88*a/40),r1=rr(.86,1),x1=128+Math.cos(an)*122*r1,y1=127-Math.sin(an)*62*r1;g.strokeStyle=pick(['#4f7f3a','#5a8a42','#467536','#62904a']);g.lineWidth=rr(4,6);
    g.beginPath();g.moveTo(128,126);g.lineTo(x1,y1);g.stroke();g.strokeStyle='rgba(30,50,20,.6)';g.lineWidth=1;g.beginPath();g.moveTo(128+Math.cos(an)*30,127-Math.sin(an)*15);g.lineTo(x1,y1);g.stroke();}
  g.fillStyle='#6b6a3a';g.beginPath();g.ellipse(128,127,16,8,0,PI,0);g.fill();})(FRT.image.getContext('2d'),256);FRT.needsUpdate=true;
function frondGeo(len,wid,rise,droop){const N=5,p=[],n=[],u=[],ix=[];for(let k=0;k<=N;k++){const t=k/N,x=len*t,y=rise*t-droop*t*t,w=wid*(.35+.65*Math.sin(Math.min(1,t*1.6)*PI*.5))*(1-.4*t*t);
    p.push(x,y+.12*w,-w,x,y,0,x,y+.12*w,w);for(let q=0;q<3;q++){n.push(0,1,0);}u.push(t,.875,t,.9375,t,1);
    if(k<N){const a=k*3;ix.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);return g;}
// fan leaf: a quad tilted out from the crown centre
const fanLeaf=(()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,-.1,-1.1,0,-.1,1.1,0,1.25,1.1,0,1.25,-1.1],3));g.setAttribute('normal',new T.Float32BufferAttribute([1,.3,0,1,.3,0,1,.3,0,1,.3,0],3));
  g.setAttribute('uv',new T.Float32BufferAttribute([0,.75,1,.75,1,.875,0,.875],2));g.setIndex([0,1,2,0,2,3]);return g;})();
{ // Canary Island date palms (entries, the Promenade)
 const b=new GB(),f1=frondGeo(3.3,.62,1.5,2.3),f2=frondGeo(3,.55,.4,2.6);
 for(let k=0;k<8;k++)b.add(f1,0,0,0,rr(-.2,.2),k/8*TAU+rr(-.15,.15),0,rr(.85,1.1),1,1,0xffffff);
 for(let k=0;k<5;k++)b.add(f2,0,-.1,0,rr(-.2,.2),(k+.5)/5*TAU,0,rr(.8,1),1,1,0xc9d6a0);
 const crown=b.build(),tg=new T.CylinderGeometry(.3,.42,1,7,3,true);tg.translate(0,.5,0);
 const t2=new GB();t2.add(tg,0,0,0,0,0,0,1,1,1,0x8a7355,(x,y,z)=>(Math.round(y*8)%2?.82:1.04)+rr(-.04,.04));t2.add(GEO.blob,0,1,0,0,0,0,.55,.22,.55,0x6a6a3a);const trunk=t2.build();
 palms.forEach(p=>{p[2]=rr(5,7.5);p[3]=rnd()*TAU;solid(p[0],p[1],.7,.7,p[2]);});
 bake(trunk,M.flat,palms,(o,p)=>{o.position.set(p[0],0,p[1]);o.scale.set(1,p[2],1);});
 bake(crown,M.frond,palms,(o,p,k)=>{o.position.set(p[0],p[2],p[1]);o.rotation.y=k*1.7;const s=.95+(k%5)*.06;o.scale.set(s,s,s);});}
{ // Mexican fan palms: tall thin trunk, a skirt of dead fronds, a round head of fans
 const t=new GB(),tg=new T.CylinderGeometry(.62,1,1,6,1,true);tg.translate(0,.5,0);t.add(tg,0,0,0,0,0,0,.24,1,.24,0x8f7b62,(x,y,z)=>.9+rr(-.06,.06));const trunk=t.build();
 const sk=new GB();sk.add(GEO.taper,0,-.9,0,0,0,0,.46,1,.46,0x9a8460,(x,y,z)=>.75+.25*clamp((y+1.15)/1.25,0,1));const skirt=sk.build();
 const c=new GB();for(let k=0;k<11;k++){const a=k/11*TAU+rr(-.15,.15),el=k%3===0?-.5:k%3===1?.25:.85;c.add(fanLeaf,Math.cos(a)*.3,.05,-Math.sin(a)*.3,0,a,el,1.5,1.5,1.5,k%2?0xffffff:0xd8e0c0);}
 const crown=c.build();
 fans.forEach(p=>solid(p[0],p[1],.5,.5,p[2]));
 bake(trunk,M.flat,fans,(o,p,k)=>{o.position.set(p[0],0,p[1]);o.scale.set(1,p[2],1);o.rotation.z=((k%7)-3)*.006;});
 bake(skirt,M.flat,fans,(o,p)=>{o.position.set(p[0],p[2],p[1]);});
 bake(crown,M.frond,fans,(o,p,k)=>{o.position.set(p[0],p[2]+.1,p[1]);o.rotation.y=k*2.3;const s=1+(k%4)*.08;o.scale.set(s,s,s);});}
// ---------- trees: 0 round shade tree, 1 jacaranda (in flower), 2 pepper tree, 3 magnolia, 4 pine, 5 eucalyptus, 6 crape myrtle,
// 7 multi-trunk white birch, 8 Italian cypress, 9 young street tree tied to two stakes
function lumpy(geo,k){const g=geo.clone(),P=g.attributes.position,seen={};for(let i=0;i<P.count;i++){const key=Math.round(P.getX(i)*50)+','+Math.round(P.getY(i)*50)+','+Math.round(P.getZ(i)*50),f=seen[key]||(seen[key]=1+rr(-k,k));P.setXYZ(i,P.getX(i)*f,P.getY(i)*f,P.getZ(i)*f);}
  g.computeVertexNormals();return g;}
GEO.blobT=new T.SphereGeometry(1,5,3);GEO.blobM=new T.SphereGeometry(1,6,3);GEO.rod3=cylG(1,1,1,3,true);
function treeGeo(type){const b=new GB();let nb=0;const BL=()=>lumpy(nb++?GEO.blobT:GEO.blobM,.18),lit=(lo,hi,y0,y1)=>(x,y,z)=>lo+(hi-lo)*clamp((y-y0)/(y1-y0),0,1)+rr(-.06,.06);
  const TK=GEO.tube6;
  if(type===0){b.add(TK,0,0,0,0,0,0,.17,2.6,.17,0x6b5138);for(const q of [[0,3.6,0,2.2,1.9,2.1],[-1.1,3.1,.6,1.6,1.3,1.5]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],0x3f7d3a,lit(.55,1,2.2,4.8));}
  else if(type===1){b.add(TK,0,0,0,0,0,.1,.15,2.6,.15,0x5a4a3c);for(const q of [[0,3.5,0,2.3,1.5,2.2,0x8a72c8],[1.2,3.1,-.6,1.5,1.2,1.4,0x7a8a4a]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],q[6],lit(.6,1,2.4,4.2));}
  else if(type===2){b.add(TK,0,0,0,0,0,-.15,.22,2.2,.22,0x5f4a36);for(const q of [[0,3.2,0,2.4,1.5,2.4],[-1.8,2.5,.4,1.6,1.4,1.4],[1.7,2.6,-.5,1.5,1.4,1.5]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],0x7d9a4c,lit(.62,1,1.2,4.4));}
  else if(type===3){b.add(TK,0,0,0,0,0,0,.16,2,.16,0x5a4a3c);b.add(BL(),0,3.3,0,0,rnd()*3,0,1.9,2.9,1.9,0x2f5a2a,lit(.55,1,1.4,6));}
  else if(type===4){b.add(TK,0,0,0,0,0,.04,.2,7.5,.2,0x5f4a36);for(const q of [[0,8,0,2.3,1.3,2.2],[-1.4,6.7,.6,1.5,.9,1.4],[.6,9.2,-.3,1.4,1,1.4]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],0x3b5a33,lit(.6,1,6,10));}
  else if(type===5){b.add(TK,0,0,0,0,0,.05,.22,11,.16,0xd8cfbf,(x,y,z)=>.9+rr(-.08,.08));for(const q of [[0,11.6,0,2.3,3,2.1],[-1,8.6,.5,1.6,2,1.4],[.4,13.6,.1,1.4,1.8,1.4]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],0x82927a,lit(.65,1,7,15));}
  else if(type===6){for(const a of [0,3.1])b.add(GEO.rod,Math.cos(a)*.2,0,Math.sin(a)*.2,Math.sin(a)*.2,0,Math.cos(a)*.2,.07,1.8,.07,0x8a7766);b.add(BL(),0,2.3,0,0,rnd()*3,0,1.5,1.2,1.5,0xc8708e,lit(.65,1,1.4,3.2));}
  else if(type===7){for(let k=0;k<3;k++){const a=k*2.1+rr(-.3,.3),tl=rr(.12,.2);b.add(GEO.rod3,Math.cos(a)*.15,0,Math.sin(a)*.15,Math.sin(a)*tl,0,-Math.cos(a)*tl,rr(.07,.1),rr(4.6,6),.08,0xe9e5dc,(x,y,z)=>rnd()<.25?.55:1);}
    for(const q of [[.4,4.8,.2,1.4,1.8],[-.5,5.8,-.3,1.2,1.6]])b.add(lumpy(GEO.blobT,.25),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[3],0x8ea24e,lit(.6,1,3.6,7));}
  else if(type===8){b.add(lumpy(GEO.blobT,.08),0,2.6,0,0,rnd()*3,0,.62,2.8,.62,0x2f4f2a,lit(.55,1,0,5.4));b.add(GEO.rod,0,0,0,0,0,0,.08,.4,.08,0x5a4a3c);}
  else{b.add(GEO.rod,0,0,0,0,0,.03,.05,2.3,.05,0x6b5a44);for(const s of [-1,1])b.add(GEO.rod3,s*.28,0,0,0,0,0,.035,2,.035,0xc8b08a);
    b.add(lumpy(GEO.blobT,.2),0,2.6,0,0,rnd()*3,0,.95,.85,.95,0x6f9a44,lit(.6,1,1.8,3.4));}
  return b.build();}
trees.forEach(t=>solid(t[0],t[1],.45,.45,2.6*t[2]));
for(let ty=0;ty<10;ty++){const g=treeGeo(ty),g2=treeGeo(ty);bake(g,M.flat,trees.filter((t,k)=>t[3]===ty&&k%2===0),(o,p,k)=>{o.position.set(p[0],PADY*.5,p[1]);o.rotation.y=k*2.1;o.scale.setScalar(p[2]);});
  bake(g2,M.flat,trees.filter((t,k)=>t[3]===ty&&k%2===1),(o,p,k)=>{o.position.set(p[0],PADY*.5,p[1]);o.rotation.y=k*1.3;o.scale.setScalar(p[2]);});}
// ---------- shrubs, and small furniture: cluster mailboxes, satellite dishes, stop signs, RVs, truck trailers, trains
{const b=new GB();b.add(GEO.blobT,0,.3,0,0,0,0,1.1,.62,1,0x4f7a3a,(x,y,z)=>.6+.5*clamp(y/.8,0,1)+rr(-.08,.08));
 bake(b.build(),M.flat,shrubs,(o,p,k)=>{o.position.set(p[0],PADY*.5,p[1]);o.scale.setScalar(p[2]);o.rotation.y=k;});}
{const b=new GB();b.add(GEO.box,0,0,0,0,0,0,.3,1,.3,0x6f7577);b.add(GEO.box,0,1,0,0,0,0,1.1,.5,.45,0xb9bcbb);b.add(GEO.box,0,1.5,0,0,0,0,1.2,.06,.55,0x8c9396);
 bake(b.build(),M.flat,mailboxes,(o,p)=>o.position.set(p[0],PADY,p[1]));mailboxes.forEach(p=>solid(p[0],p[1],1,.5,1.5,0,5));}
{const b=new GB();b.add(GEO.dome,0,0,0,PI/2.6,0,0,.42,.16,.42,0xe9e6dc);b.add(GEO.rod,0,-.2,.1,.6,0,0,.03,.5,.03,0x8c9396);bake(b.build(),M.flat,dishes,(o,p)=>{o.position.set(p[0],p[1],p[2]);o.rotation.y=p[3];});}
{const b=new GB();b.add(GEO.tube6,0,0,0,0,0,0,.04,2.4,.04,0x8c9396);b.add(GEO.cyl8,0,2.4,0,PI/2,PI/8,0,.34,.04,.34,0xb3261e);b.add(GEO.cyl8,0,2.4,-.012,PI/2,PI/8,0,.37,.02,.37,0xf4f0e7);
 bake(b.build(),M.flat,stopSigns,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{const b=new GB();b.add(GEO.box,0,.5,0,0,0,0,2.4,2.7,7.6,0xf1eee6);b.add(GEO.box,0,1.3,0,0,0,0,2.42,.3,7.62,0x8a5a3c);b.add(GEO.box,0,2.2,-3.2,0,0,0,2.2,.5,1.2,0xe0dcd2);
 for(const z of [-1,1])b.add(GEO.wheel,0,.42,z*1.2,0,0,0,2.3,.42,.42,C.tire);bake(b.build(),M.flat,rvs,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2]?PI/2:0;});
 rvs.forEach(p=>solid(p[0],p[1],p[2]?7.6:2.4,p[2]?2.4:7.6,3.2,0,0));}
{const b=new GB();b.add(GEO.box,0,1.2,0,0,0,0,2.6,2.8,14.6,0xe6e6e0);b.add(GEO.box,0,.6,-6.3,0,0,0,2.2,.6,1.4,0x4a4c4c);for(const z of [-6.6,-5.4])b.add(GEO.wheel,0,.5,z,0,0,0,2.4,.5,.5,C.tire);b.add(GEO.box,0,.6,5.5,0,0,0,.3,.6,.3,0x4a4c4c);
 bake(b.build(),M.flat,trailers,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2]?PI/2:0;});trailers.forEach(p=>{const c=solid(p[0],p[1],p[2]?14.6:2.6,p[2]?2.6:14.6,4,0,0);lowCover.push([p[0],p[1]]);});}
{const mk=(len,h,col,band,win)=>{const b=new GB();b.add(GEO.box,0,1,0,0,0,0,3,h,len-.6,col);if(band)b.add(GEO.box,0,1+h*.18,0,0,0,0,3.04,.4,len-.62,band);if(win)b.add(GEO.box,0,1+h*.55,0,0,0,0,3.05,.9,len-2,0x1c2830);
   for(const z of [-len/2+3,len/2-3])b.add(GEO.box,0,.5,z,0,0,0,2.6,1,2.6,0x2b2b2a);return b.build();};
 const G=[mk(26,4.6,0xe9e6dc,0x2d5a8a,1),mk(22,3.6,0xe9e6dc,0x2d5a8a,1),mk(15,3.4,0x8a4a32),mk(15,3.4,0x9a8a5a),mk(15,3.4,0x6a3a32)];
 for(let t=0;t<5;t++)bake(G[t],M.flat,trainCars.filter(c=>c[3]===t),(o,p)=>{o.position.set(p[0],.2,p[1]);o.rotation.y=PI/2;});
 trainCars.forEach(c=>{solid(c[0],c[1],c[2]-.6,3,c[3]<2?5.6:4.4,0,0);lowCover.push([c[0],c[1]-2.2],[c[0],c[1]+2.2]);});}
// ---------- dressing pass: bins, curbside post mailboxes, yard signs, toys, boats, hedges, boulders, portable hoops, dry fronds under the fan palms
function bakeC(geo,mat,list,fn,cf){list.forEach((p,k)=>{_o.position.set(0,0,0);_o.rotation.set(0,0,0);_o.scale.set(1,1,1);fn(_o,p,k);_o.updateMatrix();pushGeo(mat,geo,_o.matrix,cf(p,k));});}
// a box with no bottom that is wider at the top (w0 x d0 at the base, w1 x d1 at the top)
function taperE(E,x,y,z,w0,d0,w1,d1,h,col,top,uv){uv=uv||WUV;const a=[[x-w0/2,z+d0/2],[x+w0/2,z+d0/2],[x+w0/2,z-d0/2],[x-w0/2,z-d0/2]],b=[[x-w1/2,z+d1/2],[x+w1/2,z+d1/2],[x+w1/2,z-d1/2],[x-w1/2,z-d1/2]],y1=y+h;
  for(let k=0;k<4;k++){const j=(k+1)%4;E.q([a[k][0],y,a[k][1]],[a[j][0],y,a[j][1]],[b[j][0],y1,b[j][1]],[b[k][0],y1,b[k][1]],[0,1,0,-1][k],0,[1,0,-1,0][k],k%2?shade(col,.93):col,uv);}
  E.q([b[0][0],y1,b[0][1]],[b[1][0],y1,b[1][1]],[b[2][0],y1,b[2][1]],[b[3][0],y1,b[3][1]],0,1,0,top===undefined?col:top,uv);}
const pq=(E,a,b,c,d,col,uv,n)=>{n=n||[0,0,1];E.q(a,b,c,d,n[0],n[1],n[2],col,uv||WUV);};
{ // wheeled bins: black (trash), green (yard waste), blue (recycling)
 const t=new TB();taperE(t,0,0,0,.56,.6,.62,.7,.98,0xffffff,0xcfcfcf);const g=t.geo(),cs=[0x2b2d2c,0x2f6a3a,0x2d4f8a];
 bakeC(g,M.flat,binSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];},p=>cs[p[3]]);}
{ // white post mailbox with a peaked top
 const t=new TB();taperE(t,0,0,0,.1,.1,.08,.08,1.06,0xf2efe6);boxE(t,0,1.06,0,.26,.24,.5,0xf2efe6);
 for(const s of [-1,1])t.q([s*.15,1.3,.27],[s*.15,1.3,-.27],[0,1.42,-.27],[0,1.42,.27],s*.6,.8,0,0xe6e2d8,WUV);t.q([-.15,1.3,.27],[.15,1.3,.27],[0,1.42,.27],[0,1.42,.27],0,0,1,0xf2efe6,WUV);
 t.q([-.1,1.1,.252],[.1,1.1,.252],[.1,1.26,.252],[-.1,1.26,.252],0,0,1,0x3a3a38,WUV);
 bake(t.geo(),M.flat,postBoxes,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ // FOR SALE yard sign hanging from a white post and arm
 const t=new TB();taperE(t,0,0,0,.08,.08,.07,.07,1.3,0xf4f1ea);boxE(t,.4,1.18,0,.86,.06,.06,0xf4f1ea);
 t.q([.1,.62,.02],[.76,.62,.02],[.76,1.08,.02],[.1,1.08,.02],0,0,1,0xffffff,DUV.forSale);t.q([.76,.62,-.02],[.1,.62,-.02],[.1,1.08,-.02],[.76,1.08,-.02],0,0,-1,0xffffff,DUV.forSale);
 bake(t.geo(),M.wall,yardSigns,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ // toys on the lawn: a plastic slide, a pedal car, a little playhouse
 const a=new TB();boxE(a,-.45,0,0,.5,.9,.6,0xe2b93b,0xd8412f);boxE(a,-.45,.9,0,.56,.08,.66,0xd8412f);
 const sl=new TB();sl.q([-.2,.85,.25],[-.2,.85,-.25],[.85,.05,-.25],[.85,.05,.25],.6,.8,0,0x1d6f9a,WUV);sl.q([.85,.05,.25],[.85,.05,-.25],[-.2,.85,-.25],[-.2,.85,.25],-.6,-.8,0,0x1d6f9a,WUV);
 const b=new TB();boxE(b,0,.12,0,.55,.35,.95,0xd8412f,0xd8412f);boxE(b,0,.47,-.08,.5,.3,.45,0xe2b93b);for(const q of [[-.3,.33],[.3,.33],[-.3,-.33],[.3,-.33]])boxE(b,q[0],0,q[1],.08,.22,.22,0x1c1b1a);
 const c=new TB();boxE(c,0,0,0,.95,.8,.8,0xe9e5da);c.q([-.55,.8,.48],[.55,.8,.48],[.55,1.15,0],[-.55,1.15,0],0,.8,.6,0x2f7d4f,WUV);c.q([.55,.8,-.48],[-.55,.8,-.48],[-.55,1.15,0],[.55,1.15,0],0,.8,-.6,0x2f7d4f,WUV);
 c.q([-.2,0,.405],[.2,0,.405],[.2,.6,.405],[-.2,.6,.405],0,0,1,0xd8412f,WUV);
 const G=[(()=>{const t=new TB();for(const q of [a,sl])for(const k of ['p','n','c','u'])t[k].push(...q[k]);for(const i of a.i)t.i.push(i);const o=a.p.length/3;for(const i of sl.i)t.i.push(i+o);return t.geo();})(),b.geo(),c.geo()];
 for(let v=0;v<3;v++)bake(G[v],M.flat,toySpots.filter(p=>p[3]===v),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ // a boat on its trailer (white hull, a blue or tan cover, an outboard), parked beside the driveway
 const t=new TB();taperE(t,0,.55,-.3,1.3,4.6,2.1,5.4,.8,0xf4f1ea,0x2d5a8a);t.q([-1.05,1.35,2.4],[1.05,1.35,2.4],[0,1.35,3.4],[0,1.35,3.4],0,1,0,0x2d5a8a,WUV);
 t.q([1.05,1.35,2.4],[-1.05,1.35,2.4],[0,.6,3.2],[0,.6,3.2],0,-.3,1,0xe9e5da,WUV);for(const s of [-1,1])t.q(s>0?[1.05,1.35,2.4]:[0,.6,3.2],s>0?[0,.6,3.2]:[-1.05,1.35,2.4],s>0?[0,1.35,3.4]:[-1.05,1.35,2.4],s>0?[0,1.35,3.4]:[0,1.35,3.4],s,.3,.5,0xe9e5da,WUV);
 boxE(t,0,.75,-3.25,.35,.95,.4,0x2b2d2c);boxE(t,0,.3,0,.12,.12,6.4,0x5a5f61);for(const s of [-1,1])boxE(t,s*.95,0,-.4,.22,.55,.55,0x1c1b1a);boxE(t,0,.12,3.5,.08,.5,.08,0x5a5f61);
 bake(t.geo(),M.flat,boatSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ // clipped hedge along a house front (stretched along its length), boulders in gravel yards
 const t=new TB();taperE(t,0,0,0,1,.62,.96,.56,.78,0x3f6a32,0x557d3e);bake(t.geo(),M.flat,hedgeSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];o.scale.set(p[3],1,1);});
 const b=new GB();b.add(lumpy(new T.SphereGeometry(1,4,2),.25),0,0,0,0,0,0,1,.62,1,0xb7aa96,(x,y,z)=>.75+.3*clamp(y/.6,0,1));bake(b.build(),M.flat,rockSpots,(o,p)=>{o.position.set(p[0],PADY-.05,p[1]);o.rotation.y=p[3];o.scale.setScalar(p[2]);});}
{ // portable basketball hoop on a weighted base at the end of the driveway
 const t=new TB();boxE(t,0,0,0,.62,.3,.95,0x2b2d2c);taperE(t,0,.3,-.3,.11,.11,.08,.08,2.9,0x8c9396);boxE(t,0,2.55,-.06,1.12,.74,.05,0xf4f0e7);
 t.q([-.16,2.62,-.03],[.16,2.62,-.03],[.16,2.86,-.03],[-.16,2.86,-.03],0,0,1,0xd8412f,WUV);boxE(t,0,2.8,.2,.46,.03,.4,0xd8412f);
 bake(t.geo(),M.flat,hoopPoles,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
// dry fronds dropped under a quarter of the fan palms
isoR(()=>{for(const f of fans)if(rnd()<.28)for(let k=0;k<1+(rnd()<.4?1:0);k++){const a=rnd()*TAU,r=rr(.8,2.6);cutF(f[0]+Math.cos(a)*r,f[1]+Math.sin(a)*r,PADY+.012,rr(1,1.5),rr(1.1,1.7),rnd()*TAU,CUT.frondD);}});
// ---------- dressing pass, commercial: dumpsters, shopping carts (their wire baskets are added with the chain-link mesh in 03b), cart corrals,
// payphones, newspaper boxes, bus-bench adverts, the gas station's ice chest
{ const t=new TB();taperE(t,0,.1,0,1.85,1.3,1.95,1.45,1.15,0xffffff);for(const s of [-1,1])t.q([s>0?0:-.98,1.25,-.74],[s>0?.98:0,1.25,-.74],[s>0?.98:0,1.34,.74],[s>0?0:-.98,1.34,.74],0,.99,.06,0x1c1b1a,WUV);
  t.q([-.98,1.25,.74],[.98,1.25,.74],[.98,1.34,.74],[-.98,1.34,.74],0,0,1,0x1c1b1a,WUV);for(const s of [-1,1])boxE(t,s*1.0,.55,0,.12,.25,.9,0x9a9a9a);for(const s of [-1,1])boxE(t,s*.7,0,0,.14,.1,1.2,0x2b2b2a);
  t.q([-.42,.6,.735],[.42,.6,.735],[.42,.98,.735],[-.42,.98,.735],0,0,1,0xffffff,DUV.noDump);const cs=[0x2f5a3a,0x2d4f7a,0x6a4a32];
  bakeC(t.geo(),M.wall,dumpSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];},p=>cs[p[3]]);}
{ const t=new TB();boxE(t,0,.12,0,.5,.03,.82,0x9aa0a2);for(const s of [-1,1])boxE(t,s*.22,.16,.36,.03,.86,.03,0x9aa0a2);boxE(t,0,1.0,.42,.52,.04,.05,0xc8202a);boxE(t,0,.4,-.05,.46,.03,.7,0x9aa0a2);
  for(const q of [[-.2,-.34],[.2,-.34],[-.2,.34],[.2,.34]])boxE(t,q[0],0,q[1],.04,.12,.08,0x1c1b1a);bake(t.geo(),M.flat,cartSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ const t=new TB();for(const s of [-1,1]){boxE(t,s*.55,.92,0,.06,.06,3.6,0x8c9396);boxE(t,s*.55,.5,0,.05,.05,3.6,0x8c9396);for(const e of [-1,1])taperE(t,s*.55,0,e*1.78,.07,.07,.06,.06,.95,0x8c9396);}
  boxE(t,0,.92,-1.8,1.16,.06,.06,0x8c9396);taperE(t,0,0,1.85,.06,.06,.05,.05,1.45,0x8c9396);t.q([-.32,1.12,1.88],[.32,1.12,1.88],[.32,1.42,1.88],[-.32,1.42,1.88],0,0,1,0xffffff,DUV.cart);
  t.q([.32,1.12,1.82],[-.32,1.12,1.82],[-.32,1.42,1.82],[.32,1.42,1.82],0,0,-1,0xffffff,DUV.cart);bake(t.geo(),M.wall,corralSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ const t=new TB();taperE(t,0,0,0,.14,.14,.12,.12,1.05,0x7a8082);boxE(t,0,1.02,0,.44,.62,.24,0x9aa1a3);t.q([-.2,1.06,.122],[.2,1.06,.122],[.2,1.6,.122],[-.2,1.6,.122],0,0,1,0xffffff,DUV.phone);
  boxE(t,0,1.66,-.02,.56,.07,.36,0x2d4f8a);for(const s of [-1,1])boxE(t,s*.27,1.0,-.02,.03,.66,.36,0x2d4f8a);bake(t.geo(),M.wall,phoneSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ const cs=[0x1d3f7a,0xf2efe6,0xe2b93b];for(let v=0;v<3;v++){const t=new TB();taperE(t,0,0,0,.3,.3,.28,.28,.34,0x5a5f61);boxE(t,0,.34,0,.44,.62,.4,cs[v]);t.q([-.21,.36,.202],[.21,.36,.202],[.21,.94,.202],[-.21,.94,.202],0,0,1,0xffffff,DUV.news[v]);
  bake(t.geo(),M.wall,newsSpots.filter(p=>p[3]===v),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}}
{ const t=new TB();boxE(t,0,.42,.08,1.9,.07,.45,0x7a5a3a);for(const s of [-1,1])boxE(t,s*.8,0,.08,.07,.42,.4,0x3a3a38);boxE(t,0,.5,-.17,1.9,.62,.06,0x2f6a3a);
  t.q([.93,.54,-.205],[-.93,.54,-.205],[-.93,1.08,-.205],[.93,1.08,-.205],0,0,-1,0xffffff,DUV.benchAd);t.q([-.93,.54,-.135],[.93,.54,-.135],[.93,1.08,-.135],[-.93,1.08,-.135],0,0,1,0xffffff,DUV.benchAd);
  bake(t.geo(),M.wall,adBenches,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
{ const t=new TB();boxE(t,0,0,0,1.4,1.12,.75,0xf2efe6);t.q([-.5,.45,.377],[.5,.45,.377],[.5,.9,.377],[-.5,.9,.377],0,0,1,0xffffff,DUV.ice);bake(t.geo(),M.wall,iceSpots,(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[2];});}
