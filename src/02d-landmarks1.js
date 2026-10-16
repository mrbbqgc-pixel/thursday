// =====================================================================
// 02d LANDMARKS (1): local frames, parking helpers, The Market Hall, the Civic Center, Vista Town Center
// A landmark is written once in local coordinates with its front towards local +z, then turned in quarter turns:
// r=0 front faces south (+z), r=1 east (+x), r=2 north (-z), r=3 west (-x).
// =====================================================================
function TF(cx,cz,r){const c=[1,0,-1,0][r],s=[0,1,0,-1][r],F={cx,cz,r,ry:r*PI/2};
  F.p=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c];
  F.b=(lx,lz,lw,ld)=>{const p=F.p(lx,lz);return r%2?[p[0],p[1],ld,lw]:[p[0],p[1],lw,ld];};
  const smap=[[0,1,2,3],[2,3,1,0],[1,0,3,2],[3,2,0,1]][r];F.s=k=>smap[k];
  F.rect=(lx0,lz0,lx1,lz1)=>{const a=F.p(lx0,lz0),b=F.p(lx1,lz1);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];};
  F.box=(lx,y,lz,lw,h,ld,col,top)=>{const b=F.b(lx,lz,lw,ld);boxC(M.flat,b[0],y,b[1],b[2],h,b[3],col,top);};
  F.side=(lx,lz,lw,ld,y0,h,side,cells,tint)=>{const b=F.b(lx,lz,lw,ld);wallSide(b[0],b[1],b[2],b[3],y0,h,F.s(side),cells,tint);};
  F.put=(g,lx,y,lz,ry,sx,sy,sz,col,mat)=>{const p=F.p(lx,lz);put(mat||M.flat,g,p[0],y,p[1],(ry||0)+F.ry,sx,sy,sz,col);};
  F.post=(lx,lz,h,rad,col,y0)=>{const p=F.p(lx,lz);post(p[0],p[1],h,rad,col,y0);};
  F.solid=(lx,lz,lw,ld,h,y0,kind)=>{const b=F.b(lx,lz,lw,ld);return solid(b[0],b[1],b[2],b[3],h,y0,kind);};
  F.sign=(t,lx,y,lz,lry,w,h,bg,fg,flush)=>{const p=F.p(lx,lz);sign(t,p[0],y,p[1],(lry||0)+F.ry,w,h,bg,fg,flush);};
  F.board=(uv,lx,y,lz,lry,w,h,both)=>{const p=F.p(lx,lz);boardQ(uv,p[0],y,p[1],(lry||0)+F.ry,w,h,both);};
  F.flat=(mat,lx0,lz0,lx1,lz1,y,rp)=>{const q=F.rect(lx0,lz0,lx1,lz1);flat(mat,q[0],q[1],q[2],q[3],y,rp);};
  F.lot=(lx0,lz0,lx1,lz1,alongLX)=>{const q=F.rect(lx0,lz0,lx1,lz1);lotFlat(q[0],q[1],q[2],q[3],r%2?!alongLX:!!alongLX);};
  F.pad=(lx0,lz0,lx1,lz1,top,swl)=>{const q=F.rect(lx0,lz0,lx1,lz1),m=[[0,1,2,3],[3,2,0,1],[1,0,3,2],[2,3,1,0]][r];swl=swl||[0,0,0,0];pad2(q[0],q[1],q[2],q[3],top,[swl[m[0]],swl[m[1]],swl[m[2]],swl[m[3]]]);};
  F.car=(lx,lz,alongLX,col,type,lite)=>{const p=F.p(lx,lz);return park(p[0],p[1],r%2?!alongLX:!!alongLX,col,type,lite);};
  F.tree=(lx,lz,sc,ty)=>{const p=F.p(lx,lz);trees.push([p[0],p[1],sc||1,ty||0]);};F.palm=(lx,lz)=>{const p=F.p(lx,lz);palms.push([p[0],p[1]]);};
  F.fan=(lx,lz,h)=>{const p=F.p(lx,lz);fans.push([p[0],p[1],h||rr(11,17)]);};
  F.lamp=(lx,lz,ty,ry,sc)=>{const p=F.p(lx,lz);lamps.push([p[0],p[1],ty||0,(ry||0)+F.ry,sc||1]);};
  F.cover=(lx,lz)=>{const p=F.p(lx,lz);lowCover.push(p);};F.barrel=(lx,lz)=>{const p=F.p(lx,lz);barrelSpots.push(p);};
  F.shade=(lx,lz,lw,ld,y)=>{const b=F.b(lx,lz,lw,ld);shadeRect(b[0],b[1],b[2],b[3],y);};
  F.block=(lx,lz,lw,ld,h,o)=>{const b=F.b(lx,lz,lw,ld);o=Object.assign({},o||{});o.front=F.s(o.front===undefined?1:o.front);return block(b[0],b[1],b[2],b[3],h,o);};
  F.shops=(lx,lz,lw,ld,o)=>{const b=F.b(lx,lz,lw,ld);return stripShops(b[0],b[1],b[2],b[3],F.s(1),o);};
  F.wall=(lx0,lz0,lx1,lz1,h,tint,pil)=>{const a=F.p(lx0,lz0),b=F.p(lx1,lz1);wallLine(a[0],a[1],b[0],b[1],h,tint,pil);};
  F.chain=(lx0,lz0,lx1,lz1,h)=>{const a=F.p(lx0,lz0),b=F.p(lx1,lz1);chainLink(a[0],a[1],b[0],b[1],h);};
  F.planter=(lx,lz,lw,ld,tree)=>{const b=F.b(lx,lz,lw,ld);planter(b[0],b[1],b[2],b[3],tree);};
  F.bench=(lx,lz,alongLX)=>{const p=F.p(lx,lz);bench(p[0],p[1],r%2?!alongLX:!!alongLX);};
  F.picnic=(lx,lz,alongLX)=>{const p=F.p(lx,lz);picnic(p[0],p[1],r%2?!alongLX:!!alongLX);};
  F.label=(lx,lz,t,k)=>{const p=F.p(lx,lz);label(p[0],p[1],t,k);};
  return F;}
function roomFor(x,z,w,d){const i0=Math.floor((x-w/2+1000)/16),i1=Math.floor((x+w/2+1000)/16),j0=Math.floor((z-d/2+1000)/16),j1=Math.floor((z+d/2+1000)/16);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const L=roomBins.get(i*4096+j);if(!L)continue;for(const c of L)if(c.y0<1.6&&x-w/2<c.x1+.4&&x+w/2>c.x0-.4&&z-d/2<c.z1+.4&&z+d/2>c.z0-.4)return false;}return true;}
// a coarse spatial hash of the colliders made so far, refreshed lazily, so that parking checks stay cheap
const roomBins=new Map();let roomN=0;
function roomSync(){for(;roomN<colliders.length;roomN++){const c=colliders[roomN],i0=Math.floor((c.x0+1000)/16),i1=Math.floor((c.x1+1000)/16),j0=Math.floor((c.z0+1000)/16),j1=Math.floor((c.z1+1000)/16);
  if((i1-i0+1)*(j1-j0+1)>400)continue;for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=i*4096+j;let L=roomBins.get(k);if(!L){L=[];roomBins.set(k,L);}L.push(c);}}}
function park(x,z,alongX,col,type,lite){type=type||carType();const V=VEH[type];roomSync();if(roomFor(x,z,alongX?V.len:V.wid,alongX?V.wid:V.len))return car(x,z,alongX,col,type,lite);return null;}
// cars in the stalls of a lot laid with F.lot from (lx0,lz0): fill = share of stalls taken
function lotCars(F,lx0,lz0,lx1,lz1,alongLX,fill,lite){fill*=.26;const L1=alongLX?lx1-lx0:lz1-lz0,L2=alongLX?lz1-lz0:lx1-lx0;
  for(let m=0;m*18.6<L2-5;m++)for(const rv of [2.75,15.85]){if(m*18.6+rv>L2-2.5)continue;for(let s=0;(s+1)*2.75<=L1-.3;s++){if(rnd()>fill)continue;const a=s*2.75+1.375,b=m*18.6+rv;
      if(alongLX)F.car(lx0+a,lz0+b,false,undefined,undefined,lite===undefined?2:lite);else F.car(lx0+b,lz0+a,true,undefined,undefined,lite===undefined?2:lite);}}
  for(let m=0;m*18.6<L2-1;m+=3)for(let s=24;s<L1-6;s+=60){const b=m*18.6+.2;if(alongLX)F.lamp(lx0+s,lz0+b,3);else F.lamp(lx0+b,lz0+s,3);}}
// ---------- The Market Hall: a barn-like food hall on Haven, patio with tables and a small stage on its north side. Local front (+z) faces north.
function marketHall(cx,cz){const F=TF(cx,cz,2),hw=22,hd=12,hz=-4,rc=0x3f5a4a,wt=0xb8452f,pz=hz+hd;
  const b=F.b(0,hz,2*hw,2*hd);
  anchor(b[0],b[1],()=>{for(let s=0;s<4;s++){const n=Math.max(1,Math.round((s<2?2*hw:2*hd)/4));const cells=s===1?cyc(['barn','storeD','barn','store'],n):s===0?cyc(['barn','doorMetal','barn','barn'],n):cyc(['barn','store','barn'],n);
      F.side(0,hz,2*hw,2*hd,0,4.6,s,cells,wt);}
    const top=gableRoofE(CE,b[0],b[1],b[2],b[3],4.6,.62,rc,.8,'corr','barn',wt);
    const m=F.b(0,hz,2*hw-10,5);gableRoofE(CE,m[0],m[1],m[2],m[3],top-.3,.4,shade(rc,.9),.4,'corr','office',0xffffff);boxC(M.flat,m[0],top-1.9,m[1],m[2],1.6,m[3],0x2f4f5c);
    for(const x of [-12,12]){F.box(x,PADY,pz+.2,5.2,3.8,.2,0xb8452f);F.box(x,PADY+3.75,pz+.3,6.4,.12,.3,0x2b2621);}
    F.shade(0,hz,2*hw,2*hd,PADY);});
  F.solid(0,hz,2*hw,2*hd,9,0,1);buildings.push({x:b[0],z:b[1],w:b[2],d:b[3],h:4.6,flat:false});
  F.sign('THE MARKET HALL',0,7.4,pz+.9,0,13,2,'#2b2621','#f1d38a',true);F.sign('THE MARKET HALL',0,7.4,hz-hd-.9,PI,13,2,'#2b2621','#f1d38a',true);
  // patio: decomposed granite, tables with umbrellas, string lights, planters; the stage at the far end
  F.flat(M.plazaO,-hw,pz,hw,pz+28,PADY+.004,8);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++){const x=-18+i*12+rr(-1,1),z=pz+5+j*7;F.picnic(x,z,true);const um=pick([0xb3261e,0xe2b93b,0x2f7d4f,0xf4f0e7]),p=F.p(x,z);
    anchor(p[0],p[1],()=>{post(p[0],p[1],2.6,.04,0xd9d3c6,PADY);put(M.flat,GEO.cone8,p[0],PADY+2.2,p[1],0,1.6,.55,1.6,um);});}
  for(const x of [-hw+1,0,hw-1])for(const z of [pz+1,pz+26])F.post(x,z,5,.08,0x3a3128,PADY);
  stringLights.push(...[[-hw+1,pz+1,0,pz+26],[0,pz+1,hw-1,pz+26],[-hw+1,pz+26,hw-1,pz+26],[-hw+1,pz+1,hw-1,pz+1],[0,pz+1,-hw+1,pz+26]].map(q=>{const a=F.p(q[0],q[1]),c=F.p(q[2],q[3]);return[a[0],a[1],c[0],c[1],4.8];}));
  for(const x of [-hw+2,hw-2])F.planter(x,pz+14,2.2,6,2);F.cover(-hw+3,pz+22);F.cover(hw-3,pz+22);
  const sz=pz+32;F.box(0,PADY,sz,12,.9,6,0x7a5a3a,0x8a6a45);F.solid(0,sz,12,6,1.02,0,5);F.cover(0,sz-3.4);
  for(const x of [-5.6,5.6])for(const z of [sz-2.7,sz+2.7])F.post(x,z,4.4,.1,0x2b2621,PADY+.9);F.box(0,PADY+5.3,sz,12.6,.2,6.6,0x3f5a4a);
  for(const x of [-6.8,6.8]){F.box(x,PADY,sz-2.4,1,1.8,.8,0x1c1a18);F.solid(x,sz-2.4,1,.8,1.9,0,5);}
  F.board(strip('livemusic','LIVE MUSIC THURSDAYS','#2b2621','#f1d38a','bold 26px Arial'),0,PADY+4.35,sz-3.1,0,6,1.1);
  for(const z of [pz+6,pz+20])F.fan(hw+3,z,rr(12,15));F.tree(-hw-4,pz+10,1.1,1);F.tree(-hw-4,hz,1,1);
  F.label(0,0,'THE MARKET HALL',1);return F;}
const stringLights=[];
// ---------- Civic Center: a long two-story civic building with an arcade, a paved plaza with a round fountain, planters and low walls
function civicCenter(R){const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1;pad2(x0,z0,x1,z1,M.grass,[SWA,0,SWA,0]);mapR(x0,z0,x1,z1,'#c4cf9f');
  const px0=x0+3,px1=x0+78,pz0=z0+38,pz1=z0+128,fx=(px0+px1)/2-6,fz=(pz0+pz1)/2;flat(M.plazaO,px0,pz0,px1,pz1,PADY+.004,8);mapR(px0,pz0,px1,pz1,'#d9c3ae');
  // fountain: two tiers in a round basin (cover)
  anchor(fx,fz,()=>{put(M.flat,GEO.cyl12,fx,PADY,fz,0,7,.6,7,0xcfc6b4);put(M.flat,GEO.cyl12,fx,PADY+.55,fz,0,6.5,.05,6.5,0x4a8ab0);put(M.flat,GEO.cyl8,fx,PADY,fz,0,1.2,2.2,1.2,0xcfc6b4);
    put(M.flat,GEO.cyl12,fx,PADY+2.2,fz,0,2.6,.3,2.6,0xcfc6b4);put(M.flat,GEO.cyl12,fx,PADY+2.45,fz,0,2.3,.04,2.3,0x6aa7c8);put(M.flat,GEO.cyl8,fx,PADY+2.5,fz,0,.35,1.1,.35,0xcfc6b4);
    put(M.flat,GEO.coneO,fx,PADY+.6,fz,0,2.2,2.4,2.2,0xcfe6f2);blob(fx,fz,7.6,7.6,PADY);});
  solid(fx,fz,9.6,9.6,.75,0,5);solid(fx,fz,1.8,1.8,3.4);for(const a of [0,1,2,3]){const an=a*PI/2+PI/4;lowCover.push([fx+Math.cos(an)*7.6,fz+Math.sin(an)*7.6]);}
  // the open arena around it: planters, benches and low seat walls at the edges, nothing in the middle 50 m
  for(const p of [[px0+6,pz0+6],[px1-6,pz0+6],[px0+6,pz1-6],[px1-6,pz1-6]])planter(p[0],p[1],4,4,1);
  for(const p of [[fx-24,fz-12],[fx+22,fz+14],[fx-22,fz+16],[fx+24,fz-14]])planter(p[0],p[1],5,2,false);
  for(const z of [pz0+20,pz1-20]){bench(px0+2,z,false);}for(const x of [fx-12,fx+12]){bench(x,pz0+2,true);bench(x,pz1-2,true);}
  wallLine(px0+1,pz0+1,px0+20,pz0+1,.7,0xcfc6b4);wallLine(px1-20,pz1-1,px1-1,pz1-1,.7,0xcfc6b4);lowCover.push([px0+10,pz0+1],[px1-10,pz1-1]);
  for(const p of [[px0+2,pz0+30],[px0+2,pz1-30],[px1+2,pz0+12],[px1+2,pz1-12]])fans.push([p[0],p[1],rr(13,17)]);
  for(let z=pz0+8;z<pz1-6;z+=16)lamps.push([px1-3,z,1,0,1]);
  // civic building: two stories, arcade along the plaza, a squat tower at the entry
  const bx0=px1+6,bx1=Math.min(x1-6,bx0+56),bz0=z0+24,bz1=pz1+6,bw=bx1-bx0,bd=bz1-bz0,bx=(bx0+bx1)/2,bz=(bz0+bz1)/2,tint=0xe9dcc4;
  anchor(bx,bz,()=>{for(let s=0;s<4;s++){const n=segs(s<2?bw:bd);wallSideE(CE,bx,bz,bw,bd,0,4,s,cyc(s===2?['arcade']:['hwinW','stucco'],n),tint);wallSideE(CE,bx,bz,bw,bd,4,4,s,cyc(['hwinA','stucco'],n),tint);}
    hipRoof(bx,bz,bw,bd,8,.32,0xa65a3c,.7);
    const tx=bx0-1,tz=bz;boxE(CE,tx,0,tz,8,13,8,tint,cuv(CI.stucco));wallSideE(CE,tx,tz,8,8,9,3,2,['hwinA'],tint);hipRoof(tx,tz,8,8,13,.5,0xa65a3c,.6);
    shadeRect(bx,bz,bw,bd,PADY,1.6);});
  solid(bx,bz,bw,bd,9,0,1);solid(bx0-1,bz,8,8,15,0,1);buildings.push({x:bx,z:bz,w:bw,d:bd,h:8,flat:false});belfries.push({x:bx0-1,y:13,z:bz});
  sign('CIVIC CENTER',bx0-5.1,7,bz,-PI/2,7,1.4,'#f4ecd8','#3a3128',true);
  // a library annex along Foothill and a parking lot behind
  block(bx,z0+11,Math.min(bw,40),12,5,{front:2,fc:['glassFront','stucco'],sc:['stucco','hwinW'],tint:0xe3d3b8});
  const lz0=bz1+6;if(z1-lz0>20){lotFlat(bx0-4,lz0,x1-2,lz0+18.6*Math.floor((z1-lz0-2)/18.6),true);const F=TF(0,0,0);lotCars(F,bx0-4,lz0,x1-2,lz0+18.6*Math.floor((z1-lz0-2)/18.6),true,.4);}
  label(fx,fz,'CIVIC CENTER',1);return{fx,fz};}
// ---------- Vista Town Center: four big boxes in a row, a huge lot in front, pad restaurants on Foothill
function townCenter(R){const x0=R.x0,z0=R.z0,x1=R.x1,z1=R.z1,F=TF(0,0,0);pad2(x0,z0,x1,z1,M.pad,[0,SWA,SWA,0]);mapR(x0,z0,x1,z1,'#b7b3ab');
  const bz0=z0+4,bd=38,names=[['HOME CENTER','#f4f0e7','#d86a1f'],['SUPERMARKET','#f4f0e7','#b3261e'],['OFFICE SUPPLY','#f4f0e7','#1d3f7a'],['CINEMA 12','#15110c','#e2b93b']];let x=x0+6;const ws=[62,48,40,52];
  for(let k=0;k<4;k++){const w=Math.min(ws[k],x1-6-x);if(w<25)break;bigBox(x+w/2,bz0+bd/2,w,bd,1,names[k][0],{bg:names[k][1],fg:names[k][2],band:[0xb7472a,0x2f6a3a,0x1d3f7a,0x6a3d8f][k],h:k===3?11:9});x+=w+4;}
  const lz0=bz0+bd+8,nm=Math.floor((z1-lz0-26)/18.6),lz1=lz0+nm*18.6;lotFlat(x0+4,lz0,x1-4,lz1,true);lotCars(F,x0+4,lz0,x1-4,lz1,true,.25);
  flat(M.asphaltO,x0+4,bz0+bd+1,x1-4,lz0,PADY+.004,10);flat(M.asphaltO,x0+4,lz1,x1-4,z1-SWA-1,PADY+.004,10);
  // pads along Foothill
  const pz=z1-SWA-14;block(x0+40,pz,18,12,5.2,{front:1,fc:['storeD','glassFront'],tint:0xe8d8bc,band:0xb3261e});faceQuad(x0+40,pz,18,12,1,0,8,4.2,.9,signUV(8));
  block(x1-40,pz,16,12,5.2,{front:1,fc:['storeD','store'],tint:0xe3cfb0,band:0x2f7d4f});faceQuad(x1-40,pz,16,12,1,0,8,4.2,.9,signUV(1));
  for(let xx=x0+12;xx<x1-8;xx+=22)fans.push([xx,z1-SWA-2,rr(12,17)]);
  pylon(strip('vtc','VISTA TOWN CENTER','#3a3128','#f1d38a','bold 30px "Arial Narrow",Arial'),(x0+x1)/2,z1-SWA-3,0,9,0xe3d3b8,strip('vtc2','HOME · FOOD · MOVIES','#f4f0e7','#3a3128'));
  label((x0+x1)/2,(z0+z1)/2,'VISTA TOWN CENTER',1);}
