// =====================================================================
// 02f LANDMARKS (3): the ballpark, the Metrolink station and the tracks, Rancho Promenade, Inland Empire Outlets,
// the industrial park, the 15 freeway on its berm, the Pacific Electric Trail
// =====================================================================
const belfries=[];
// ground quad that always faces up, whatever the order of its corners
function qUp(mat,a,b,c,d,u1,v1){const e1=[b[0]-a[0],b[2]-a[2]],e2=[c[0]-b[0],c[2]-b[2]];if(e1[1]*e2[0]-e1[0]*e2[1]<0)quad(mat,d,c,b,a,0,1,0,u1,v1);else quad(mat,a,b,c,d,0,1,0,u1,v1);}
// a straight wall drawn at any angle (sound walls, the outfield fence); colliders are added by the caller
function slantWall(x0,z0,x1,z1,y0,h,tint,cellN,thick){const L0=Math.hypot(x1-x0,z1-z0);if(L0<.2)return;const nx=(z1-z0)/L0,nz=-(x1-x0)/L0,t=(thick||.3)/2,n=Math.max(1,Math.round(L0/8)),c=cuv(CI[cellN||'wall8']),vk=Math.min(h,4)/4,v1=c[1]+(c[3]-c[1])*vk;
  anchor((x0+x1)/2,(z0+z1)/2,()=>{for(let k=0;k<n;k++){const a=[lerp(x0,x1,k/n),lerp(z0,z1,k/n)],b=[lerp(x0,x1,(k+1)/n),lerp(z0,z1,(k+1)/n)];
      quadUV(M.wall,[b[0]+nx*t,y0,b[1]+nz*t],[a[0]+nx*t,y0,a[1]+nz*t],[a[0]+nx*t,y0+h,a[1]+nz*t],[b[0]+nx*t,y0+h,b[1]+nz*t],nx,0,nz,tint,[c[0],c[1],c[2],v1]);
      quadUV(M.wall,[a[0]-nx*t,y0,a[1]-nz*t],[b[0]-nx*t,y0,b[1]-nz*t],[b[0]-nx*t,y0+h,b[1]-nz*t],[a[0]-nx*t,y0+h,a[1]-nz*t],-nx,0,-nz,shade(tint,.92),[c[0],c[1],c[2],v1]);}
    quadC(M.flat,[x0-nx*t,y0+h,z0-nz*t],[x1-nx*t,y0+h,z1-nz*t],[x1+nx*t,y0+h,z1+nz*t],[x0+nx*t,y0+h,z0+nz*t],0,1,0,shade(tint,.85));});}
// colliders along a slanted line: a chain of small boxes
function slantSolid(x0,z0,x1,z1,h,step,kind){const L0=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L0/(step||3)));for(let k=0;k<n;k++){const xa=lerp(x0,x1,k/n),za=lerp(z0,z1,k/n),xb=lerp(x0,x1,(k+1)/n),zb=lerp(z0,z1,(k+1)/n);
  solid((xa+xb)/2,(za+zb)/2,Math.max(.4,Math.abs(xb-xa)+.3),Math.max(.4,Math.abs(zb-za)+.3),h,0,kind||0);}}
// ---------- the ballpark: home plate in the south-west corner so both foul lines run along the axes, stands behind them
function ballpark(cx,cz){const x0=cx-60,x1=cx+60,z0=cz-65,z1=cz+65,hx=x0+16,hz=z1-16,Rf=96;
  pad2(x0,z0,x1,z1,M.grass,[0,0,0,0]);mapR(x0,z0,x1,z1,'#8fb383');
  flat(M.infield,hx-2,hz-30,hx+30,hz+2,PADY+.006,6);flat(M.grassO,hx+4,hz-23.5,hx+23.5,hz-4,PADY+.01,8);
  anchor(hx+13.7,hz-13.7,()=>{put(M.flat,GEO.cyl12,hx+13.7,PADY,hz-13.7,0,2.6,.3,2.6,0xb98a5a);for(const p of [[0,0],[27.4,0],[27.4,-27.4],[0,-27.4]])boxC(M.flat,hx+p[0],PADY+.01,hz+p[1],.5,.08,.5,0xf4f0e7);
    put(M.flat,GEO.cyl12,hx,PADY,hz,0,4,.02,4,0xb98a5a);});
  // outfield wall: an arc of padded panels with sponsors' colours, foul poles at the ends
  const n=30,ads=[0x1d3f7a,0x2f7d4f,0xb3261e,0xe2b93b,0x15110c,0x6a3d8f];
  for(let k=0;k<n;k++){const a0=k/n*PI/2,a1=(k+1)/n*PI/2,p0=[hx+Math.cos(a0)*Rf,hz-Math.sin(a0)*Rf],p1=[hx+Math.cos(a1)*Rf,hz-Math.sin(a1)*Rf];
    slantWall(p0[0],p0[1],p1[0],p1[1],0,3,ads[k%ads.length],'tilt',.4);slantSolid(p0[0],p0[1],p1[0],p1[1],3,3);}
  for(const p of [[hx+Rf,hz],[hx,hz-Rf]]){anchor(p[0],p[1],()=>post(p[0],p[1],14,.15,0xe2b93b));solid(p[0],p[1],.4,.4,14);}
  // grandstands: stepped seating along the first and third base lines and behind home, a roof over the top rows
  const steps=8;anchor(hx,hz,()=>{for(let k=0;k<steps;k++){const h=.6+k*.55,col=k%2?0x2d5a8a:0x3a6aa0;boxC(M.flat,hx+38,0,hz+3+k*1.2,64,h,1.2,0xa9a59c,col);boxC(M.flat,hx-3-k*1.2,0,hz-38,1.2,h,64,0xa9a59c,col);}
    for(let k=0;k<steps;k++)boxC(M.flat,hx-3-k*.85,0,hz+3+k*.85,6+k*1.7,.6+k*.55,6+k*1.7,0xa9a59c,k%2?0x2d5a8a:0x3a6aa0);
    boxC(M.flat,hx+34,7.6,hz+8,60,.3,8,0xd9d4c8);boxC(M.flat,hx-8,7.6,hz-34,8,.3,60,0xd9d4c8);for(let k=0;k<6;k++){post(hx+6+k*11,hz+11.5,7.6,.15,0x8c9396);post(hx-11.5,hz-6-k*11,7.6,.15,0x8c9396);}
    boxC(M.flat,hx-9,4.6,hz+9,9,3.2,9,0xe9dcc4,0xd9d4c8);});
  for(let k=0;k<steps;k++){solid(hx+38,hz+3+k*1.2,64,1.2,.6+k*.55);solid(hx-3-k*1.2,hz-38,1.2,64,.6+k*.55);}
  solid(hx-9,hz+9,10,10,7.8,0,1);
  // the stadium shell on the street sides, the gate and its sign
  for(const s of [['x',z1-.5],['z',x0+.5]]){if(s[0]==='x')wallLine(x0+20,s[1],x1-2,s[1],4.2,0xe3d3b8,8);else wallLine(s[1],z0+2,s[1],z1-20,4.2,0xe3d3b8,8);}
  wallLine(x1-.5,z0+2,x1-.5,z1-2,3,0xe3d3b8,10);wallLine(x0+2,z0+.5,x1-2,z0+.5,3,0xe3d3b8,10);
  block(x0+9,z1-9,14,14,6,{front:1,fc:['arcade'],sc:['arcade'],tint:0xe3d3b8,band:0x2d5a8a});
  sign('THE BALLPARK',x0+9,7.2,z1-1.8,0,10,1.6,'#2d5a8a','#f4f0e7',true);sign('THE BALLPARK',x0+1.8,7.2,z1-9,-PI/2,10,1.6,'#2d5a8a','#f4f0e7',true);
  // light towers and the scoreboard
  for(const p of [[x0+6,z0+40],[x0+40,z1-4],[x1-4,z1-40],[x1-30,z0+6],[x0+6,z0+6]]){anchor(p[0],p[1],()=>{post(p[0],p[1],24,.35,0x8c9396);boxC(M.flat,p[0],24,p[1],4,2.2,.5,0x4a4c4c);for(let i=0;i<4;i++)for(let j=0;j<2;j++)boxC(M.flat,p[0]-1.5+i,24.3+j*.95,p[1]+.26,.75,.75,.05,0xfdf6d8);});solid(p[0],p[1],.8,.8,24);}
  const sb=[hx+Rf*.62,hz-Rf*.92];anchor(sb[0],sb[1],()=>{for(const s of [-5,5])post(sb[0]+s,sb[1],6,.25,0x4a4c4c);boxC(M.flat,sb[0],6,sb[1],14,6,.6,0x23382c);
    boardQ(strip('score','HOME 0   VISITORS 0','#1c2a22','#e2b93b','bold 28px "Arial Narrow",Arial'),sb[0],8,sb[1]+.32,0,12,3);});solid(sb[0],sb[1],14,.8,12);
  for(const q of [[hx+40,hz-40],[hx+10,hz-60],[hx+60,hz-12]])lowCover.push(q);
  label(cx,cz,'THE BALLPARK',1);}
// ---------- the main line: ballast and two tracks the whole way across, crossing gates at the avenues, the station with its platforms
function railway(){const z=TRK,cuts=NSA.filter(a=>a.z0<z&&a.z1>z).map(a=>[a.x-a.hw,a.x+a.hw]).sort((p,q)=>p[0]-q[0]),xe=fwX(z)+90;let x=-1000;
  for(const c of cuts.concat([[xe,xe]])){if(c[0]>x){for(let s=x;s<c[0];s+=144){const e=Math.min(c[0],s+144);quad(M.ballast,[e,.02,z+6],[e,.02,z-6],[s,.02,z-6],[s,.02,z+6],0,1,0,1,(e-s)/12);}mapR(x,z-6,c[0],z+6,'#8f877b');}x=c[1];}
  for(let s=-1000;s<xe;s+=64)anchor(s+32,z,()=>{for(const tz of [-2.5,2.5])for(const o of [-.72,.72])boxC(M.flat,s+32,.02,z+tz+o,64,.17,.08,0x6a625a,0x9aa0a2);});
  for(const a of NSA){if(!(a.z0<z&&a.z1>z))continue;for(const s of [-1,1]){const px=a.x+s*(a.hw+1.2),pz=z+s*-8;anchor(px,pz,()=>{post(px,pz,4.2,.1,0xe9e6dc);
      put(M.flat,GEO.box,px,3.3,pz,PI/4,.08,.22,1.6,0xf4f0e7);put(M.flat,GEO.box,px,3.3,pz,-PI/4,.08,.22,1.6,0xf4f0e7);for(const o of [-.35,.35])put(M.flat,GEO.cyl8,px+o,2.5,pz,0,.13,.26,.13,0xb3261e);
      put(M.flat,GEO.box,px,4.2,pz,0,.12,6,.12,0xd8412f);});solid(px,pz,.3,.3,4.2);}}}
function station(cx,cz){const z=TRK;
  for(const s of [-1,1]){const pz=z+s*9;boxC(M.flat,cx-18,0,pz,80,.25,6,0xbab4a8,0xc8c2b6);solid(cx-18,pz,80,6,.26,0,0);mapR(cx-58,pz-3,cx+22,pz+3,'#c8c2b6');
    for(let k=0;k<4;k++){const sx=cx-49+k*20;anchor(sx,pz,()=>{for(const o of [-3,3])post(sx+o,pz-s*.8,3.4,.09,0x2d4f6a,.25);hipRoof(sx,pz,8,4.2,3.65,.4,C.tile,.3,SWN.cream);});}
    for(let k=0;k<3;k++)bench(cx-39+k*20,pz-s*1.6,true,0x2d4f6a);}
  // depot: mission revival, tile roof, a little bell tower
  const dz=z-26,dx=cx-20;block(dx,dz,22,10,4.2,{front:1,fc:['arcade','doorGlass','arcade'],sc:['hwinA','stucco'],tint:0xeee3cb,noAC:true,roof:0xc9c0ae});
  anchor(dx,dz,()=>{hipRoof(dx,dz,22,10,4.2,.36,C.tile,.6);boxE(CE,dx+12,0,dz,4,9,4,0xeee3cb,cuv(CI.stucco));hipRoof(dx+12,dz,4,4,9,.8,C.tile,.4);});solid(dx+12,dz,4,4,10,0,1);
  belfries.push({x:dx+12,y:9,z:dz});sign('RANCHO CUCAMONGA',dx,3.5,dz+5.12,0,9,.9,'#2d4f6a','#f4f0e7',true);
  // the train in the station (on the south track) and a freight standing east of Milliken
  trainCars.push([cx-48,z+2.5,22,1],[cx-21,z+2.5,26,0],[cx+7,z+2.5,26,0]);
  for(let k=0;k<9;k++)trainCars.push([cx+92+k*16.5,z-2.5,15,2+(k%3)]);
  label(cx,cz,'METROLINK STATION',0);}
const trainCars=[];
// ---------- Rancho Promenade: an outdoor main street of two-story shops running north-south, a fountain plaza with a little train loop
function promenade(cx,cz){const mz0=-218,mz1=-76,mw=14,x0=cx-mw/2,x1=cx+mw/2,rd=26;
  flat(M.plazaO,x0,mz0,x1,mz1,PADY+.004,8);mapR(x0-rd,mz0,x1+rd,mz1,'#d9c3ae');
  // storefront rows, broken by the plaza and by narrow passages
  const tints=[0xeee3cb,0xe0c49c,0xf1ebe0,0xd9b48c,0xe8d8bc,0xc98f6f,0xeadfcc,0xd8c0a0];
  for(const s of [-1,1]){let z=mz0;const rx=cx+s*(mw/2+rd/2);while(z<mz1-6){if(z>cz-24&&z<cz+20){z=cz+20;continue;}let L0=Math.min(rr(16,26),mz1-z);if(z<cz-24&&z+L0>cz-24)L0=cz-24-z;if(L0<8){z+=L0;continue;}
      const bz=z+L0/2,brick=rnd()<.25,tint=pick(tints),fr=s<0?3:2;block(rx,bz,rd,L0,8.4,{front:fr,floors:2,fc:['store','storeD','store'],up:brick?['hwinA','brick']:['hwinA','office','hwinA'],sc:brick?['brick']:['dado'],sup:brick?['brick']:['stucco'],tint,band:shade(tint,.75),parapet:.9});
      awning(rx,bz,rd,L0,fr,L0*.8,3.1);if(rnd()<.9)faceQuad(rx,bz,rd,L0,fr,0,Math.min(4,L0-2),4.3,.9,signUV(shopK++),.08);
      z+=L0+(rnd()<.35?3:0);}}
  // north anchor: a department store across the head of the street; cinema at the south-east
  bigBox(cx,mz0-13,64,24,1,'DEPARTMENT STORE',{h:11,band:0x7a1f3d,fg:'#7a1f3d'});
  // fountain plaza: round paving, a two-tier fountain, the little train on its loop, a clock tower
  const n=24;for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,R2=21,y=PADY+.005;quad(M.plazaO,[cx,y,cz],[cx+Math.cos(a1)*R2,y,cz+Math.sin(a1)*R2],[cx+Math.cos(a0)*R2,y,cz+Math.sin(a0)*R2],[cx,y,cz],0,1,0,2,2);}
  anchor(cx,cz,()=>{put(M.flat,GEO.cyl12,cx,PADY,cz,0,5.5,.6,5.5,0xcfc6b4);put(M.flat,GEO.cyl12,cx,PADY+.55,cz,0,5,.05,5,0x4a8ab0);put(M.flat,GEO.cyl8,cx,PADY,cz,0,1,2.4,1,0xcfc6b4);
    put(M.flat,GEO.cyl12,cx,PADY+2.4,cz,0,2.2,.3,2.2,0xcfc6b4);put(M.flat,GEO.coneO,cx,PADY+.6,cz,0,4.4,1.8,4.4,0xcfe6f2);blob(cx,cz,6,6,PADY);
    for(let k=0;k<48;k++){const a=k/48*TAU;for(const rr2 of [12.6,13.4])boxC(M.flat,cx+Math.cos(a)*rr2,PADY,cz+Math.sin(a)*rr2,.12,.08,.12,0x6a625a);}
    // the little train: engine and two open cars on the loop
    for(let k=0;k<3;k++){const a=1.1+k*.24,x=cx+Math.cos(a)*13,z=cz+Math.sin(a)*13,ry=-a;put(M.flat,GEO.box,x,PADY+.2,z,ry,1.3,k?.7:1.3,2.4,k?0x2f7d4f:0xb3261e);if(!k)put(M.flat,GEO.cyl8,x,PADY+1.5,z,0,.25,.6,.25,0x15110c);}});
  solid(cx,cz,7.5,7.5,.75,0,5);solid(cx,cz,1.6,1.6,3);for(let k=0;k<3;k++){const a=1.1+k*.24;solid(cx+Math.cos(a)*13,cz+Math.sin(a)*13,1.6,1.6,1.3,0,5);}
  const tx=cx+16,tz=cz-17;block(tx,tz,5,5,12,{front:2,fc:['hwinA'],sc:['stucco'],tint:0xe8d8bc,noAC:true});anchor(tx,tz,()=>hipRoof(tx,tz,5,5,12,.9,C.tile,.5));belfries.push({x:tx,y:12,z:tz});
  // street furniture: lamps, planters with trees, benches, kiosks
  for(let z=mz0+6;z<mz1-3;z+=14){if(Math.abs(z-cz)<22)continue;lamps.push([x0+.8,z,4,0,1],[x1-.8,z+7,4,0,1]);planter(cx,z+3.5,1.6,4,1);}
  for(const q of [[cx-4.5,cz-30],[cx+4.5,cz+28],[cx-4.5,cz+44],[cx+4.5,cz-50]]){block(q[0],q[1],2.4,3.6,2.6,{front:q[0]<cx?3:2,fc:['store'],sc:['dado'],tint:0x2d5a4a,noAC:true});}
  for(const q of [[cx-15,cz-10,0],[cx+15,cz+10,0],[cx-10,cz+16,1],[cx+10,cz-16,1]])bench(q[0],q[1],!!q[2]);
  for(const q of [[cx-18,cz+5],[cx+18,cz-5],[cx-6,cz-19],[cx+6,cz+19]])palms.push(q);
  for(const s of [-1,1])for(let z=mz0+2;z<mz1;z+=40)fans.push([cx+s*(mw/2+rd+1.5),z,rr(13,17)]);
  // parking: west between Day Creek and the shops, south toward Foothill, east up to the freeway
  const F=TF(0,0,0),wx0=AV.DAYC.x+AV.DAYC.hw,lx1=x0-rd-2,pz0=STR.CH.z+STR.CH.hw,pz1=STR.FH.z-STR.FH.hw;
  for(let z=pz0;z<pz1-.1;z+=20){const ze=Math.min(pz1,z+20);pad2(wx0,z,fwEdge(ze)-2,ze,M.pad,[z===pz0?SWA:-1,ze>=pz1?SWA:-1,SWA,0]);mapR(wx0,z,fwEdge(ze)-2,ze,'#b7b3ab');}
  if(lx1-wx0-4>17)for(let z=mz0-2;z<mz1-20;z+=58){const z1=Math.min(z+55.8,mz1);F.lot(wx0+4,z,wx0+4+18.6,z1,false);lotCars(F,wx0+4,z,wx0+4+18.6,z1,false,.4);}
  F.lot(wx0+4,mz1+8,fwEdge(-20)-6,mz1+8+18.6*2,true);lotCars(F,wx0+4,mz1+8,fwEdge(-20)-6,mz1+8+18.6*2,true,.3);
  for(let z=mz0+4;z<mz1-10;z+=18.6*2+6){const ex0=x1+rd+4,ex1=fwEdge(z+40)-4;if(ex1-ex0<22)continue;F.lot(ex0,z,ex1,z+18.6*2,true);lotCars(F,ex0,z,ex1,z+18.6*2,true,.35);}
  pylon(strip('prom','RANCHO PROMENADE','#2d4f3a','#f1d38a','bold 30px "Arial Narrow",Arial'),cx-30,STR.FH.z-STR.FH.hw-4,0,9,0xd9b48c,strip('prom2','SHOP · DINE · PLAY','#f4f0e7','#2d4f3a'));
  sign('RANCHO PROMENADE',cx,6.4,mz1+.6,0,12,1.6,'#2d4f3a','#f1d38a',true);anchor(cx,mz1,()=>{for(const s of [-1,1])boxC(M.flat,cx+s*7.5,0,mz1+.5,1.4,7.2,1.4,0xd9b48c);boxC(M.flat,cx,7.2,mz1+.5,16.4,1,1.4,0xd9b48c);});
  for(const s of [-1,1])solid(cx+s*7.5,mz1+.5,1.4,1.4,7.2);
  label(cx,cz,'RANCHO PROMENADE',1);}
// ---------- Inland Empire Outlets: a vast single-story mall ringed by parking, entrance courts; the south-west court stays open
function outlets(){const X0=535,X1=805,Z0=1035,Z1=1185,cx0=X0+44,cz0=1137,tint=0xe9dfcb,bands=[0x2f8f8a,0x6a3d8f,0xe2b93b,0xd8412f];
  pad2(AV.MILL.x+AV.MILL.hw,STR.FOUR.z+STR.FOUR.hw,fwEdge(1000)-2,STR.OMP.z-STR.OMP.hw,M.pad,[SWA,SWA,SWA,0]);
  const part=(x0,z0,x1,z1,o)=>{const w=x1-x0,d=z1-z0,x=(x0+x1)/2,z=(z0+z1)/2;anchor(x,z,()=>{for(let s=0;s<4;s++){const n=Math.max(1,Math.round((s<2?w:d)/8));wallSideE(CE,x,z,w,d,0,10,s,cyc(o&&o.cells&&o.cells[s]||['tilt'],n),tint);}
      roofFlat(x,z,w,d,10.6,0xd2cbbf,0xcfc4b0);for(let k=0;k<Math.round(w*d/700);k++)boxC(M.flat,x+rr(-w/2.6,w/2.6),10.6,z+rr(-d/2.6,d/2.6),3,1.2,3,0x9fb7c4,0xc9d8de);shadeRect(x,z,w,d,PADY,2.5);});
    solid(x,z,w,d,11,0,1);buildings.push({x,z,w,d,h:10,flat:true});};
  part(cx0,Z0,X1,Z1,{cells:[['tilt','tilt','store','storeD','store'],['tilt'],['tilt','store','storeD'],['tilt']]});part(X0,Z0,cx0,cz0,{cells:[['tilt'],['store','storeD','store'],['tilt','storeD'],['tilt']]});
  // colour bands
  for(const q of [[cx0,Z0,X1,Z1],[X0,Z0,cx0,cz0]])boxC(M.flat,(q[0]+q[2])/2,8.4,(q[1]+q[3])/2,q[2]-q[0]+.2,1.1,q[3]-q[1]+.2,bands[0]);
  // entrance pavilions: tall arched portals with the name
  for(const e of [[640,Z0,1],[740,Z0,1],[X0,1080,2],[X1,1110,3]]){const ax=e[2]<2,px=ax?e[0]:e[0]+(e[2]===2?-3:3),pz=ax?e[1]-3:e[1],w=ax?22:6,d=ax?6:22,b=bands[(e[0]+e[1])%4];
    block(px,pz,w,d,14,{front:e[2]===1?0:e[2],fc:['glassFront','storeD','glassFront'],sc:['tilt'],tint:shade(tint,1.03),band:b,noAC:true});
    sign('INLAND EMPIRE OUTLETS',px+(ax?0:(e[2]===2?-3.1:3.1)),11.6,pz+(ax?-3.1:0),[0,0,PI,-PI/2,PI/2][e[2]+1]||PI,16,1.8,css(b),'#f4f0e7',true);
    for(const s of [-1,1])fans.push([ax?px+s*14:px+(e[2]===2?-6:6),ax?pz-6:pz+s*14,rr(14,18)]);}
  // the south-west court: storefronts round it, planters, kiosks, a canopy; Kingsley's command post sits in here
  const cxm=(X0+cx0)/2,czm=(cz0+Z1)/2;flat(M.plazaO,X0,cz0,cx0,Z1,PADY+.004,8);mapR(X0,cz0,cx0,Z1,'#d9c3ae');
  for(const q of [[X0+8,cz0+10],[cx0-8,Z1-10],[X0+10,Z1-8]])planter(q[0],q[1],3,3,1);
  for(const q of [[cxm-6,czm+4],[cxm+8,czm-8]])block(q[0],q[1],3,3,2.6,{front:1,fc:['store'],sc:['dado'],tint:0x6a3d8f,noAC:true});
  anchor(cxm,czm,()=>{for(const p of [[cx0-21,cz0+1],[cx0-1,cz0+1],[cx0-21,cz0+23],[cx0-1,cz0+23]])post(p[0],p[1],7,.18,0xd9d4c8);boxC(M.flat,cx0-11,7,cz0+12,21,.3,23,0xd9d4c8);});
  sign('OUTLETS',cx0-.6,7.6,czm,-PI/2,8,1.4,'#2f8f8a','#f4f0e7',true);
  // the parking that rings it
  const F=TF(0,0,0),lz0=STR.FOUR.z+STR.FOUR.hw+SWA+3;F.lot(X0-30,lz0,X1+10,lz0+18.6*2,true);lotCars(F,X0-30,lz0,X1+10,lz0+18.6*2,true,.33);
  F.lot(AV.MILL.x+AV.MILL.hw+SWA+3,lz0+18.6*2+4,X0-6,Z1+8,false);lotCars(F,AV.MILL.x+AV.MILL.hw+SWA+3,lz0+18.6*2+4,X0-6,Z1+8,false,.3);
  flat(M.asphaltO,X0-30,Z1+2,X1+12,STR.OMP.z-STR.OMP.hw-SWA,PADY+.004,10);flat(M.asphaltO,X1+2,Z0-4,fwEdge(1100)-4,Z1+2,PADY+.004,10);
  for(let k=0;k<8;k++)trailers.push([X1+8,Z0+12+k*16,0]);
  label(670,1110,'INLAND EMPIRE OUTLETS',1);return{court:[cxm,czm]};}
// ---------- industrial park: tilt-up warehouses with truck courts; R in world, docks face dockSide
function industrial(R,o){o=o||{};const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1,w=x1-x0,d=z1-z0;pad2(x0,z0,x1,z1,M.dry,R.sw||[SWA,SWA,SWA,SWA]);mapR(x0,z0,x1,z1,'#cbc6b8');
  const alongX=w>=d,n=Math.max(1,Math.round((alongX?w:d)/(o.len||150))),gap=10;
  for(let i=0;i<n;i++){const a=(alongX?x0:z0)+6+i*((alongX?w:d)-12)/n,b=a+((alongX?w:d)-12)/n-gap,L0=b-a;if(L0<30)continue;
    const dep=Math.min((alongX?d:w)-48,o.dep||70);if(dep<20)continue;const front=alongX?(rnd()<.5?0:1):(rnd()<.5?2:3),dock=front^1;
    const cxw=alongX?(a+b)/2:(front===2?x0+30+dep/2:x1-30-dep/2),czw=alongX?(front===0?z0+30+dep/2:z1-30-dep/2):(a+b)/2;
    warehouse(cxw,czw,alongX?L0:dep,alongX?dep:L0,dock,{});
    // truck court behind, a strip of parking and lawn in front
    const s=SD[dock];const tc=[alongX?a:cxw+s[0]*(dep/2),alongX?czw+s[1]*(dep/2):a,alongX?b:cxw+s[0]*(dep/2+24),alongX?czw+s[1]*(dep/2+24):b];
    flat(M.concO,Math.min(tc[0],tc[2]),Math.min(tc[1],tc[3]),Math.max(tc[0],tc[2]),Math.max(tc[1],tc[3]),PADY+.004,8);
    const sf=SD[front],pc=[alongX?a:cxw+sf[0]*(dep/2+3),alongX?czw+sf[1]*(dep/2+3):a,alongX?b:cxw+sf[0]*(dep/2+21.6),alongX?czw+sf[1]*(dep/2+21.6):b];
    const F=TF(0,0,0),lx0=Math.min(pc[0],pc[2]),lz0=Math.min(pc[1],pc[3]),lx1=Math.max(pc[0],pc[2]),lz1=Math.max(pc[1],pc[3]);
    if(alongX){F.lot(lx0,lz0,lx1,lz0+18.6,true);lotCars(F,lx0,lz0,lx1,lz0+18.6,true,.25);}else{F.lot(lx0,lz0,lx0+18.6,lz1,false);lotCars(F,lx0,lz0,lx0+18.6,lz1,false,.25);}
    for(let t=a+4;t<b-2;t+=30){const p=alongX?[t,front===0?z0+4:z1-4]:[front===2?x0+4:x1-4,t];trees.push([p[0],p[1],rr(.9,1.2),pick([4,0,5])]);}
    if(rnd()<.5)barrelSpots.push([alongX?a+3:cxw+s[0]*(dep/2+3),alongX?czw+s[1]*(dep/2+3):a+3]);}
  if(o.name)label((x0+x1)/2,(z0+z1)/2,o.name,0);}
// ---------- the 15 freeway: an eight-lane deck on a berm with sound walls, bridges where the streets pass under, traffic
const fwyCars=[];
function freeway(){const zs=[];for(let z=-830;z<1500;z+=12)zs.push(z);const crossings=EWA.map(b=>[b.z,b.hw+6]).concat([[TRK,10]]),under=z=>crossings.find(c=>Math.abs(z-c[0])<c[1]);
  const Y=6.4;for(let k=0;k<zs.length-1;k++){const za=zs[k],zb=zs[k+1],xa=fwX(za),xb=fwX(zb),L0=Math.hypot(xb-xa,zb-za),nx=-(zb-za)/L0,nz=(xb-xa)/L0; // n points west
    const P=(x,z,o,y)=>[x+nx*o,y,z+nz*o],u=under((za+zb)/2),mz=(za+zb)/2;
    qUp(M.fwy,P(xb,zb,FWH,Y),P(xb,zb,-FWH,Y),P(xa,za,-FWH,Y),P(xa,za,FWH,Y),1,L0/40);
    if(!u){qUp(M.dry,P(xb,zb,FWH+16,0),P(xb,zb,FWH,Y),P(xa,za,FWH,Y),P(xa,za,FWH+16,0),1.4,L0/12);qUp(M.dry,P(xa,za,-FWH-16,0),P(xa,za,-FWH,Y),P(xb,zb,-FWH,Y),P(xb,zb,-FWH-16,0),1.4,L0/12);}
    else{const c=[(xa+xb)/2,mz];anchor(c[0],c[1],()=>{const q=(o,y)=>[P(xa,za,o,y),P(xb,zb,o,y)];const a=q(FWH,Y-1.4),b=q(-FWH,Y-1.4);
        quadC(M.flat,a[1],a[0],b[0],b[1],0,-1,0,0x8f8a80);quadC(M.flat,P(xa,za,FWH,Y-1.4),P(xb,zb,FWH,Y-1.4),P(xb,zb,FWH,Y),P(xa,za,FWH,Y),nx,0,nz,0xb9b4a8);
        quadC(M.flat,P(xb,zb,-FWH,Y-1.4),P(xa,za,-FWH,Y-1.4),P(xa,za,-FWH,Y),P(xb,zb,-FWH,Y),-nx,0,-nz,0xb9b4a8);});}
    // west sound wall on the deck edge, median barrier
    slantWall(P(xa,za,FWH-.3,0)[0],za+nz*(FWH-.3),P(xb,zb,FWH-.3,0)[0],zb+nz*(FWH-.3),Y,u?1.1:4.2,0xc9bba0,u?'tilt':'wall8',.35);
    anchor((xa+xb)/2,mz,()=>{const m0=P(xa,za,0,Y),m1=P(xb,zb,0,Y);quadC(M.flat,[m1[0]-nx*.3,Y+.9,m1[2]-nz*.3],[m0[0]-nx*.3,Y+.9,m0[2]-nz*.3],[m0[0]+nx*.3,Y+.9,m0[2]+nz*.3],[m1[0]+nx*.3,Y+.9,m1[2]+nz*.3],0,1,0,0xc4bfb4);
      quadC(M.flat,[m0[0]+nx*.3,Y,m0[2]+nz*.3],[m1[0]+nx*.3,Y,m1[2]+nz*.3],[m1[0]+nx*.3,Y+.9,m1[2]+nz*.3],[m0[0]+nx*.3,Y+.9,m0[2]+nz*.3],nx,0,nz,0xb4afa5);
      quadC(M.flat,[m1[0]-nx*.3,Y,m1[2]-nz*.3],[m0[0]-nx*.3,Y,m0[2]-nz*.3],[m0[0]-nx*.3,Y+.9,m0[2]-nz*.3],[m1[0]-nx*.3,Y+.9,m1[2]-nz*.3],-nx,0,-nz,0xb4afa5);});
    if(u&&k%2===0){for(const o of [FWH-2,0,-FWH+2]){const p=P(mz>=0?xa:xa,za,o,0);anchor(p[0],p[2],()=>put(M.flat,GEO.box,p[0],0,p[2],Math.atan2(xb-xa,zb-za),1.2,Y-1.4,1.2,0xb9b4a8));}}
    if(rnd()<.55){const lane=pick([-1,1])*rr(4,16),p=P((xa+xb)/2,mz,lane,Y);fwyCars.push([p[0],p[2],Math.atan2(xb-xa,zb-za)+(lane>0?0:PI),pick(['sedan','pickup','minivan','suv','sedan'])]);}}
  // the boundary: a chain of boxes along the foot of the berm (also under the bridges, where a fence and barricades close the road)
  for(let z=BOUND.z0-4;z<BOUND.z1+4;z+=4){const xe=fwEdge(z+2);if(xe>BOUND.x1+10)continue;solid(xe+16,z+2,32,4.2,14,0,0);}
  for(const c of crossings){const z=c[0];if(z<BOUND.z0||z>BOUND.z1)continue;const xe=fwEdge(z);if(xe>BOUND.x1)continue;chainLink(xe,z-c[1]+5,xe,z+c[1]-5,2.6);
    for(let t=-c[1]+7;t<c[1]-6;t+=3.6)barrier(xe-1.2,z+t,false,0xd6c08a);
    boardQ(strip('closed','ROAD CLOSED','#f4f0e7','#b3261e','900 36px "Arial Narrow",Arial',true),xe-2.4,1.2,z,-PI/2,2.6,.65,true);}
  // big green signs over the deck at the crossings
  for(const b of [STR.FH,STR.AR,STR.FOUR]){const x=fwX(b.z-30),z=b.z-30;sign('15 NORTH\nBarstow',x-8,Y+8.5,z,0,9,3,'#1f6b45','#f4f0e7',true);sign('15 SOUTH\nSan Diego',x+8,Y+8.5,z+.2,PI,9,3,'#1f6b45','#f4f0e7',true);
    anchor(x,z,()=>{post(x-FWH+1,z,Y+10,.3,0x8c9396,Y);post(x+FWH-1,z,Y+10,.3,0x8c9396,Y);boxC(M.flat,x,Y+9.9,z,2*FWH,.4,.4,0x8c9396);});}}
// ---------- Pacific Electric Trail: a concrete bike path and a dirt riding path between rail fences, trees and shrubs; nothing stands on the path
function peTrail(){const cuts=NSA.map(a=>[a.x-a.hw,a.x+a.hw]).sort((p,q)=>p[0]-q[0]),X0=-1000,X1=1500,brk=[600];
  const strips=[[-TRW,-2.6,M.grassO],[-2.6,1.0,M.walkO],[1.0,3.0,M.dryO],[3.0,5.5,M.dirtO],[5.5,TRW,M.grassO]];
  let x=X0;for(const c of cuts.concat([[X1,X1]])){const e=Math.min(c[0],X1);if(e>x+1){const pts=[x];for(const b of brk)if(b>x&&b<e)pts.push(b);pts.push(e);
      for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],za=trailZ(a),zb=trailZ(b);
        for(const s of strips){const y=s[2]===M.walkO?.05:.04;quad(s[2],[a,y,za+s[1]],[b,y,zb+s[1]],[b,y,zb+s[0]],[a,y,za+s[0]],0,1,0,(b-a)/6,(s[1]-s[0])/6);}
        for(let q=a;q<b;q+=12){const e=Math.min(b,q+12),z0=Math.min(trailZ(q),trailZ(e)),z1=Math.max(trailZ(q),trailZ(e));mapR(q,z0-TRW,e,z1+TRW,'#b9c79a');mapR(q,z0-2.6,e,z1+1,'#e6e0d0');}
        // rail fences either side of the riding path, trees and shrubs on the edges, markers every 120 m
        for(let t=a+3;t<b-3;t+=26){const t2=Math.min(b-3,t+24);railFence(t,trailZ(t)+3.1,t2,trailZ(t2)+3.1);railFence(t,trailZ(t)+5.6,t2,trailZ(t2)+5.6);}
        for(let t=a+6;t<b-5;t+=rr(18,26)){const s=rnd()<.5?-1:1;trees.push([t,trailZ(t)+(s<0?-rr(5,7):rr(6.6,7.6)),rr(.8,1.15),pick([1,2,1,2,0,6])]);if(rnd()<.5)shrubs.push([t+rr(-3,3),trailZ(t)+(s<0?rr(-8,-6):rr(7,8.4)),rr(.6,1)]);}
        for(let t=Math.ceil(a/120)*120;t<b-4;t+=120){postSign(strip('pet','PACIFIC ELECTRIC TRAIL','#5b3a22','#f1e6c8','bold 24px "Arial Narrow",Arial'),t,trailZ(t)-3.2,0,1.8,.45,1.1);bench(t+5,trailZ(t)-3.6,true);}
        for(let t=Math.ceil(a/40)*40;t<b;t+=40)SPN.push([t,trailZ(t)-.8]);}}
    // crossing: a ladder crosswalk over the avenue, trail signs at both sides
    if(c[0]<X1){const xa=c[0],xb=c[1],z=trailZ((xa+xb)/2);for(let t=xa+.4;t<xb-.3;t+=1.2)flat(M.lineW,t,z-2.4,t+.6,z+.8,.046,1);
      for(const q of [[xa-1.4,z-3.6,-PI/2],[xb+1.4,z+2.4,PI/2]])postSign(strip('xing','TRAIL XING','#e2b93b','#15110c','900 34px "Arial Narrow",Arial',true),q[0],q[1],q[2],1.1,.55,1.6);}
    x=Math.max(x,c[1]);}
  label(-250,-650,'PACIFIC ELECTRIC TRAIL',0);label(860,-612,'PACIFIC ELECTRIC TRAIL',0);}
