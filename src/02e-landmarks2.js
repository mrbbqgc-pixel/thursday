// =====================================================================
// 02e LANDMARKS (2): schools (quiet scenery), parks, gas stations, fast-food pads, strip centers, apartments, office parks
// =====================================================================
function hoop(x,z,ry){anchor(x,z,()=>{post(x,z,3.05,.07,0x8c9396,PADY);put(M.flat,GEO.box,x+Math.sin(ry)*.5,PADY+2.6,z+Math.cos(ry)*.5,ry,1.2,.9,.06,0xf4f0e7);put(M.flat,GEO.tube8,x+Math.sin(ry)*.85,PADY+2.95,z+Math.cos(ry)*.85,0,.24,.03,.24,0xd8412f);});solid(x,z,.2,.2,3);}
function flagpole(x,z,h){anchor(x,z,()=>{post(x,z,h,.07,0xd9d9d2,PADY);put(M.flat,GEO.sph,x,h+PADY,z,0,.14,.14,.14,0xe2b93b);});
  const f=new T.Mesh(new T.PlaneGeometry(2.6,1.5),flagMat);f.position.set(x+1.35,h-.8,z);addProp(f);solid(x,z,.2,.2,h);}
const flagMat=new T.MeshBasicMaterial({side:T.DoubleSide,map:tex(128,64,(g,w,h)=>{for(let k=0;k<13;k++){g.fillStyle=k%2?'#f4f0e7':'#b3261e';g.fillRect(0,k*h/13,w,h/13+1);}g.fillStyle='#1d3f7a';g.fillRect(0,0,w*.42,h*7/13);
  g.fillStyle='#f4f0e7';for(let i=0;i<6;i++)for(let j=0;j<5;j++)g.fillRect(4+i*8.5,3+j*6.5,2,2);})});
// ---------- school: fenced campus, classroom wings with covered walks, portables, blacktop, a ball field. Quiet scenery.
function school(R,name,r){const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1,cx=(x0+x1)/2,cz=(z0+z1)/2,F=TF(cx,cz,r),LW=r%2?z1-z0:x1-x0,LD=r%2?x1-x0:z1-z0,hw=LW/2,hd=LD/2;
  pad2(x0,z0,x1,z1,M.grass,R.sw||[0,0,0,0]);mapR(x0,z0,x1,z1,'#b9cf9a');QUIET.push([x0-2,z0-2,x1+2,z1+2]);
  const e=1.5;F.chain(-hw+e,-hd+e,hw-e,-hd+e,2.4);F.chain(-hw+e,-hd+e,-hw+e,hd-e,2.4);F.chain(hw-e,-hd+e,hw-e,hd-e,2.4);F.chain(-hw+e,hd-e,-6,hd-e,2.4);F.chain(6,hd-e,hw-e,hd-e,2.4);
  // classroom wings along the front, a covered walk, the office with the marquee
  const tint=0xe8dcc0,cw=Math.min(LW-24,64);F.block(0,hd-14,cw,9,3.8,{front:1,fc:['schoolWin','schoolWin','doorMetal'],sc:['stucco'],tint,band:0x2d5a8a,noAC:true});
  F.box(0,3.25,hd-7.6,cw,.2,3.2,0xe9e4d8);for(let k=0;k<=Math.round(cw/5);k++)F.post(-cw/2+.2+(cw-.4)*k/Math.round(cw/5),hd-6.2,3.25,.07,0x2d5a8a,PADY);
  const wd=Math.min(LD-40,50);F.block(-hw+12,hd-30-wd/2,9,wd,3.8,{front:3,fc:['schoolWin','doorMetal'],sc:['stucco'],tint,band:0x2d5a8a,noAC:true});
  for(let k=0;k<3;k++)F.block(-hw+28+k*12,hd-34,9,7,3,{front:1,fc:['schoolWin','doorMetal'],sc:['stucco'],tint:0xd9cdb4,noAC:true});
  // blacktop with hoops, the field with a backstop
  F.flat(M.asphaltO,-hw+24,hd-60,-hw+24+Math.min(36,LW-50),hd-40,PADY+.004,10);for(let k=0;k<2;k++){const hx=-hw+30+k*16;const p=F.p(hx,hd-58.5),q=F.p(hx,hd-41.5);hoop(p[0],p[1],F.ry);hoop(q[0],q[1],F.ry+PI);}
  const fx=hw-26,fz=-hd+26;F.flat(M.infield,fx-14,fz-14,fx+4,fz+4,PADY+.006,6);for(const s of [-1,1]){const p=F.p(fx-14+s*.01,fz-14);}
  const bp=F.p(fx-16,fz-16);anchor(bp[0],bp[1],()=>{F.put(GEO.box,fx-16,0,fz-12,0,.06,4,8,0x9aa0a2);F.put(GEO.box,fx-12,0,fz-16,0,8,4,.06,0x9aa0a2);});F.solid(fx-16,fz-12,.2,8,4);F.solid(fx-12,fz-16,8,.2,4);
  const fp=F.p(-6,hd-4);flagpole(fp[0],fp[1],9);
  for(let k=0;k<5;k++)F.tree(-hw+8+k*(LW-16)/4,hd-4,rr(.9,1.2),pick([0,2,3]));
  F.board(strip('sch'+name,name,'#f4f0e7','#2d5a8a','bold 30px "Arial Narrow",Arial',true),9,PADY+.6,hd-.6,0,6.4,1.6,true);F.box(9,PADY,hd-.6,6.8,.6,.4,0xcfc6b4);
  F.label(0,0,name,0);}
// ---------- parks: lawns, trees, a ball field, a playground, a picnic shelter and restrooms
function playground(x,z){anchor(x,z,()=>{flat(M.dirtO,x-7,z-6,x+7,z+6,PADY+.004,4);
    put(M.flat,GEO.box,x-3,PADY,z-2,0,2.4,1.6,2.4,0xe2b93b);put(M.flat,GEO.cone4,x-3,PADY+1.6,z-2,PI/4,2,1.2,2,0xd8412f);put(M.flat,GEO.box,x-.6,PADY+.2,z-2,-.5,.9,.1,3,0x2f8f8a,0.0,.5);
    for(const s of [-1,1]){put(M.flat,GEO.tube6,x+3+s*1.6,PADY,z+2,0,.06,2.4,.06,0x1d3f7a);}put(M.flat,GEO.box,x+3,PADY+2.4,z+2,0,3.4,.1,.1,0x1d3f7a);
    for(const s of [-.7,.7])put(M.flat,GEO.box,x+3+s,PADY+.5,z+2,0,.45,.05,.2,0x15110c);});solid(x-3,z-2,2.4,2.4,1.6,0,5);lowCover.push([x-3,z-2]);}
function shelter(x,z,w,d){anchor(x,z,()=>{for(const a of [-1,1])for(const b of [-1,1])post(x+a*(w/2-.4),z+b*(d/2-.4),2.6,.1,0x5a4a3c,PADY);hipRoof(x,z,w,d,2.75,.45,0x8a5a46,.4,SWN.dbrown);
    for(const s of [-1,1])picnic(x+s*w/4,z,true);});}
function ballField(x,z,size,r){const F=TF(x,z,r),s=size;F.flat(M.infield,-s*.32,-s*.32,s*.12,s*.12,PADY+.006,6);
  for(const p of [[0,0],[-s*.28,0],[-s*.28,-s*.28],[0,-s*.28]])F.box(p[0],PADY+.01,p[1],.4,.06,.4,0xf4f0e7);
  F.put(GEO.box,s*.16,0,s*.06,0,.06,4.5,s*.2,0x9aa0a2);F.put(GEO.box,s*.06,0,s*.16,0,s*.2,4.5,.06,0x9aa0a2);F.solid(s*.16,s*.06,.2,s*.2,4.5);F.solid(s*.06,s*.16,s*.2,.2,4.5);
  for(const q of [[s*.2,-s*.3],[-s*.3,s*.2]]){F.box(q[0],PADY,q[1],q[0]>0?2:6,.9,q[0]>0?6:2,0x9aa0a2,0xb9bcbb);F.solid(q[0],q[1],q[0]>0?2:6,q[0]>0?6:2,1,0,5);F.cover(q[0],q[1]);}}
function park2(R,name,o){o=o||{};const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1;pad2(x0,z0,x1,z1,M.grass,R.sw||[SWA,SWA,SWA,SWA]);mapR(x0,z0,x1,z1,'#9cc184');
  const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
  // trees in clumps round the edges, an open middle
  for(let k=0;k<Math.round((w+d)/18);k++){const t=rnd()*2*(w+d);let x,z;if(t<w){x=x0+t;z=z0+rr(5,12);}else if(t<2*w){x=x0+t-w;z=z1-rr(5,12);}else if(t<2*w+d){x=x0+rr(5,12);z=z0+t-2*w;}else{x=x1-rr(5,12);z=z0+t-2*w-d;}
    if(o.keep&&x>o.keep[0]&&x<o.keep[2]&&z>o.keep[1]&&z<o.keep[3])continue;trees.push([x,z,rr(.9,1.35),pick([0,2,1,4,0,3])]);}
  if(o.field)ballField(o.field[0],o.field[1],o.field[2]||50,o.field[3]||0);
  if(o.play)playground(o.play[0],o.play[1]);if(o.shelter)shelter(o.shelter[0],o.shelter[1],8,6);
  if(o.rest)block(o.rest[0],o.rest[1],7,5,3,{front:1,fc:['doorMetal','stucco','doorMetal'],sc:['block'],tint:0xd8cfbf,noAC:true});
  if(o.paths)for(const p of o.paths)flat(M.walkO,p[0],p[1],p[2],p[3],PADY+.004,6);
  if(o.benches)for(const b of o.benches)bench(b[0],b[1],!!b[2]);
  label(cx,cz,name,0);}
// ---------- gas station of around 2000: canopy with a coloured band, pump islands, a food mart, the price sign. front = side to the street.
const pumps=[];
function gasStation(cx,cz,r,band){const F=TF(cx,cz,r),cz2=6;band=band||0x1d6f9a;
  const p0=F.p(0,cz2);anchor(p0[0],p0[1],()=>{for(const a of [-1,1])for(const b of [-1,1]){F.put(GEO.box,a*7,PADY,cz2+b*3.4,0,.5,4.9,.5,0xf4f0e7);F.solid(a*7,cz2+b*3.4,.6,.6,5);}
    F.box(0,5,cz2,19,.8,11.6,0xf4f0e7,0xd9d2c4);F.box(0,5.18,cz2,19.2,.35,11.8,band);F.box(0,4.96,cz2,18.4,.05,11,0xf2f2ec);F.solid(0,cz2,19,11.6,.8,5);
    for(const s of [-3.6,3.6]){F.box(s,PADY,cz2,1.4,.18,6,0xd9d3c6);const p=F.p(s,cz2);pumps.push([p[0],p[1],r%2===0]);}
    const b=F.b(0,cz2,19,11.6);blob(b[0],b[1],b[2]/2+1,b[3]/2+1,PADY);});
  F.block(0,-12,20,10,4.2,{front:1,fc:['glassFront','storeD','glassFront'],sc:['dado','doorMetal'],tint:0xf2efe6,band});
  F.board(strip('foodmart','FOOD MART','#f4f0e7','#1d3f7a','900 34px "Arial Narrow",Arial'),0,3.3,-6.85,0,6,1.1);
  const pp=F.p(9.5,17);pylon(strip('gasP','GAS','#1d6f9a','#f4f0e7','900 44px "Arial Narrow",Arial'),pp[0],pp[1],F.ry,7,0xf2efe6,strip('gas159','UNLEADED  1.59⁹','#15110c','#f1d38a','bold 28px "Arial Narrow",Arial'));
  F.barrel(8,-15);F.barrel(-9,-17.5);F.cover(9,-6);label(cx,cz,'GAS STATION',0);return F;}
// ---------- fast-food pad with a drive-through lane and a pole sign. front = side to the street.
function fastFood(cx,cz,r,sk,band){const F=TF(cx,cz,r);F.flat(M.asphaltO,-14,-14,14,14,PADY+.004,10);
  F.block(0,-2,15,11,4.6,{front:1,fc:['glassFront','storeD','glassFront'],sc:['stucco','store'],tint:pick([0xf2e6c8,0xe8d0b0,0xf1ebe0]),band:band||0xb3261e});
  F.flat(M.lineW,-11.5,-10,-11.3,8,PADY+.01,1);F.box(-9.6,PADY,4,.8,1.4,.6,0x3a3128);F.board(signUV(sk),0,3.6,3.62,0,5,1.1);
  const pp=F.p(11,12);anchor(pp[0],pp[1],()=>{post(pp[0],pp[1],9,.18,0xd9d9d2);boardQ(signUV(sk),pp[0],8,pp[1],F.ry,4,1.2,true);});solid(pp[0],pp[1],.4,.4,9);
  for(const q of [[-6,10],[6,10]])F.car(q[0],q[1],false,undefined,undefined,2);}
// ---------- strip center: shops along the back of a pad, the lot in front, a pylon. R in world, front = side facing the street (0..3)
function stripCenter(R,front,name,o){o=o||{};const cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2,r=[2,0,3,1][front],F=TF(cx,cz,r),LW=r%2?R.z1-R.z0:R.x1-R.x0,LD=r%2?R.x1-R.x0:R.z1-R.z0,hw=LW/2,hd=LD/2;
  pad2(R.x0,R.z0,R.x1,R.z1,M.pad,R.sw||[SWA,SWA,SWA,SWA]);mapR(R.x0,R.z0,R.x1,R.z1,'#b7b3ab');
  const sd=o.depth||20,sw=Math.min(o.len||LW-14,LW-10),sx=o.sx||0;F.shops(sx,-hd+3+sd/2,sw,sd,{tint:o.tint,sign0:o.sign0});
  const lz0=-hd+3+sd+5,nm=Math.max(1,Math.floor((LD-sd-14)/18.6));F.lot(-hw+4,lz0,hw-4,lz0+nm*18.6,true);lotCars(F,-hw+4,lz0,hw-4,lz0+nm*18.6,true,o.fill||.35);
  F.flat(M.asphaltO,-hw+4,-hd+3+sd+3.2,hw-4,lz0,PADY+.004,10);if(lz0+nm*18.6<hd-SWA-1)F.flat(M.asphaltO,-hw+4,lz0+nm*18.6,hw-4,hd-SWA-1,PADY+.004,10);
  for(let x=-hw+8;x<hw-6;x+=24)F.fan(x,hd-SWA-1.5,rr(11,16));
  if(name)pylon(strip('sc'+name,name,'#3a3128','#f1d38a','bold 30px "Arial Narrow",Arial'),...F.p(hw-6,hd-SWA-3),F.ry,7.5,0xe8d8bc,strip('sc2'+name,o.sub||'SHOPS · DINING','#f4f0e7','#3a3128'));
  F.label(sx,0,name||'SHOPS',0);return F;}
// ---------- apartments: two-story buildings round a court with carports
function apartments(R,o){o=o||{};const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1;pad2(x0,z0,x1,z1,M.grass,R.sw||[SWA,SWA,SWA,SWA]);mapR(x0,z0,x1,z1,'#c4cf9f');
  const w=x1-x0,d=z1-z0;wallLine(x0+SWA+2,z0+SWA+2,x1-SWA-2,z0+SWA+2,1.6,C.blockWall,12);
  const nb=Math.max(1,Math.floor((w-16)/42));for(let i=0;i<nb;i++){const bx=x0+10+21+i*42;for(let z=z0+18;z<z1-16;z+=30){const front=((z-z0-18)/30)%2?0:1;apartment(bx,z,34,12,front);
      flat(M.asphaltO,bx-17,z+(front?9:-13),bx+17,z+(front?13:-9),PADY+.004,10);}}
  for(let k=0;k<Math.round(w*d/700);k++){const x=rr(x0+6,x1-6),z=rr(z0+6,z1-6);roomSync();if(roomFor(x,z,3,3))trees.push([x,z,rr(.8,1.2),pick([0,2,3,6])]);}
  label((x0+x1)/2,(z0+z1)/2,o.name||'APARTMENTS',0);}
// ---------- office park: two-story mirrored-glass offices with palms and lots
function officePark(R,o){o=o||{};const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1,F=TF(0,0,0);pad2(x0,z0,x1,z1,M.grass,R.sw||[SWA,SWA,SWA,SWA]);mapR(x0,z0,x1,z1,'#c4cf9f');
  const w=x1-x0,d=z1-z0,fl=o.floors||2;let k=0;
  for(let x=x0+8;x+40<x1-4;x+=52)for(let z=z0+10;z+30<z1-4;z+=62){office(x+20,z+12,40,22,fl+(k++%3===0&&o.tall?2:0),{front:1});
    const lz=z+26,lz1=Math.min(z1-4,lz+18.6*2);if(lz1-lz>16){F.lot(x,lz,x+40,lz+18.6*Math.floor((lz1-lz)/18.6),true);lotCars(F,x,lz,x+40,lz+18.6*Math.floor((lz1-lz)/18.6),true,.3);}
    for(const s of [-1,1])fans.push([x+20+s*22,z+12,rr(13,18)]);}
  label((x0+x1)/2,(z0+z1)/2,o.name||'OFFICES',0);}
