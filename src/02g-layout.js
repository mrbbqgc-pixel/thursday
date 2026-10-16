// =====================================================================
// 02g LAYOUT: Rancho Cucamonga around 2000, compressed to 30 % of the real distances (buildings stay real size)
// Origin = Haven Ave x Foothill Blvd (34.1063 N, 117.5759 W). x = (lon+117.5759)*27654, z = -(lat-34.1063)*33285.
// Arterials straightened from the Census (TIGER) lines; the 15 freeway is the diagonal east edge.
// =====================================================================
const BOUND={x0:-540,x1:1480,z0:-700,z1:1200};
// I-15 centre line (TIGER), north to south
const FWY=[[1830,-830],[1572,-506],[1172,0],[1138,76],[1036,181],[983,256],[936,339],[908,405],[890,463],[872,554],[864,650],[858,760],[858,1500]];
function fwX(z){if(z<=FWY[0][1])return FWY[0][0];for(let k=0;k<FWY.length-1;k++){const a=FWY[k],b=FWY[k+1];if(z<=b[1])return lerp(a[0],b[0],(z-a[1])/(b[1]-a[1]));}return 858;}
const FWH=20,fwEdge=z=>fwX(z)-FWH-14; // west foot of the freeway berm: nothing playable east of it
// main streets: half width of the roadway (curb to centre), median width, lane texture
const NSA=[{k:'ARCH',n:'ARCHIBALD AVE',x:-484,hw:11,mat:'road4c'},{k:'HERM',n:'HERMOSA AVE',x:-249,hw:8,mat:'road4u'},{k:'HAVEN',n:'HAVEN AVE',x:0,hw:15,med:6,mat:'road6',palm:1},
  {k:'MILL',n:'MILLIKEN AVE',x:481,hw:13,med:5,mat:'road4m'},{k:'ROCH',n:'ROCHESTER AVE',x:836,hw:10,mat:'road4c',z1:382},{k:'DAYC',n:'DAY CREEK BLVD',x:1078,hw:12,med:5,mat:'road4m',z1:0,palm:1}];
const EWA=[{k:'BL',n:'BASE LINE RD',z:-504,hw:12,med:5,mat:'road4m'},{k:'CH',n:'CHURCH ST',z:-260,hw:10,mat:'road4c'},{k:'FH',n:'FOOTHILL BLVD',z:0,hw:15,med:6,mat:'road6',palm:1},
  {k:'AR',n:'ARROW RTE',z:236,hw:10,mat:'road4c'},{k:'JE',n:'JERSEY BLVD',z:382,hw:8,mat:'road4u',x1:836},{k:'SIX',n:'6TH ST',z:670,hw:9,mat:'road4c'},
  {k:'FOUR',n:'4TH ST',z:962,hw:12,mat:'road4c'},{k:'OMP',n:'ONTARIO MILLS PKWY',z:1214,hw:11,mat:'road4m',x0:490}];
for(const a of NSA){a.z0=a.z0===undefined?-1000:a.z0;a.z1=a.z1===undefined?1500:a.z1;}
for(const b of EWA){b.x0=b.x0===undefined?-1000:b.x0;b.x1=b.x1===undefined?fwX(b.z)+70:b.x1;}
const AV={},STR={};for(const a of NSA)AV[a.k]=a;for(const b of EWA)STR[b.k]=b;
const TRK=476; // Metrolink / BNSF main line
// the Pacific Electric Trail (old interurban right of way): straight west of Milliken, then south-east to Base Line by the freeway
const trailZ=x=>x<=600?-636:x>=1500?-510:lerp(-636,-510,(x-600)/900),TRW=9;
const ISEC=[];for(const a of NSA)for(const b of EWA)if(b.z>=a.z0-1&&b.z<=a.z1+1&&a.x>=b.x0-1&&a.x<=b.x1+1)ISEC.push({a,b,x:a.x,z:b.z});
const SPN=[];for(const i of ISEC)if(i.x>BOUND.x0&&i.x<BOUND.x1&&i.z>BOUND.z0&&i.z<BOUND.z1)SPN.push([i.x,i.z]);

flat(M.sand,-3000,-3000,3000,3000,0,12);
// ---------- road surfaces: lane texture between intersections, plain asphalt inside them
function roadSeg(mat,x0,z0,x1,z1,alongZ,W){const L0=alongZ?z1-z0:x1-x0;if(L0<=.05)return;const y=.03,step=W*Math.max(1,Math.floor(150/W));
  for(let s=0;s<L0-.01;s+=step){const e=Math.min(L0,s+step),v1=(e-s)/W;
    if(alongZ)quad(mat,[x0,y,z0+e],[x1,y,z0+e],[x1,y,z0+s],[x0,y,z0+s],0,1,0,1,v1);else quad(mat,[x0+e,y,z1],[x0+e,y,z0],[x0+s,y,z0],[x0+s,y,z1],0,1,0,1,v1);}
  mapR(x0,z0,x1,z1,'#6b6761');}
const medianPalms=[];
for(const a of NSA){const cz=ISEC.filter(i=>i.a===a).map(i=>[i.z,i.b.hw]).sort((p,q)=>p[0]-q[0]);let z=a.z0;
  for(const c of cz){roadSeg(M[a.mat],a.x-a.hw,z,a.x+a.hw,c[0]-c[1],true,2*a.hw);if(a.med)medianRun(a,z,c[0]-c[1],true);z=c[0]+c[1];}
  if(z<a.z1)roadSeg(M[a.mat],a.x-a.hw,z,a.x+a.hw,a.z1,true,2*a.hw);if(a.med&&z<a.z1)medianRun(a,z,a.z1,true);}
for(const b of EWA){const cx=ISEC.filter(i=>i.b===b).map(i=>[i.x,i.a.hw]).sort((p,q)=>p[0]-q[0]);let x=b.x0;
  for(const c of cx){roadSeg(M[b.mat],x,b.z-b.hw,c[0]-c[1],b.z+b.hw,false,2*b.hw);if(b.med)medianRun(b,x,c[0]-c[1],false);x=c[0]+c[1];}
  if(x<b.x1)roadSeg(M[b.mat],x,b.z-b.hw,b.x1,b.z+b.hw,false,2*b.hw);if(b.med&&x<b.x1)medianRun(b,x,b.x1,false);}
for(const i of ISEC){flat(M.asphalt,i.x-i.a.hw,i.z-i.b.hw,i.x+i.a.hw,i.z+i.b.hw,.03,10);mapR(i.x-i.a.hw,i.z-i.b.hw,i.x+i.a.hw,i.z+i.b.hw,'#6b6761');
  // crosswalks (two white bars) and stop bars on every approach
  const y=.045,ha=i.a.hw,hb=i.b.hw;
  for(const s of [-1,1]){flat(M.lineW,i.x-ha,i.z+s*(hb+.6)-.15,i.x+ha,i.z+s*(hb+.6)+.15,y,1);flat(M.lineW,i.x-ha,i.z+s*(hb+3.4)-.15,i.x+ha,i.z+s*(hb+3.4)+.15,y,1);
    flat(M.lineW,i.x+s*(ha+.6)-.15,i.z-hb,i.x+s*(ha+.6)+.15,i.z+hb,y,1);flat(M.lineW,i.x+s*(ha+3.4)-.15,i.z-hb,i.x+s*(ha+3.4)+.15,i.z+hb,y,1);
    // stop bars on the incoming half of each approach
    flat(M.lineW,s<0?i.x-ha:i.x+(i.a.med||0)/2,i.z+s*(hb+4.6)-.22,s<0?i.x-(i.a.med||0)/2:i.x+ha,i.z+s*(hb+4.6)+.22,y,1);
    flat(M.lineW,i.x+s*(ha+4.6)-.22,s>0?i.z-hb:i.z+(i.b.med||0)/2,i.x+s*(ha+4.6)+.22,s>0?i.z-(i.b.med||0)/2:i.z+hb,y,1);}}
// raised landscaped median between two intersections, broken for left-turn pockets and for the trail crossing
function medianRun(r,a,b,alongZ){a+=24;b-=24;const cuts=[];const lo=alongZ?BOUND.z0-60:BOUND.x0-60,hi=alongZ?BOUND.z1+60:BOUND.x1+60;
  if(alongZ){const tz=trailZ(r.x);if(tz>a-10&&tz<b+10)cuts.push([tz-8,tz+8]);}
  let s=a;for(const c of cuts.concat([[b,b]])){const e=Math.min(c[0],b);if(e-s>6){const m=r.med/2;if(alongZ)pad2(r.x-m,s,r.x+m,e,M.grass,[0,0,0,0]);else pad2(s,r.z-m,e,r.z+m,M.grass,[0,0,0,0]);
      for(let t=Math.max(s+5,lo);t<Math.min(e-4,hi);t+=r.palm?22:26){const p=alongZ?[r.x,t]:[t,r.z];if(!alongZ&&t>fwEdge(r.z)-6)continue;if(r.palm)fans.push([p[0],p[1],rr(13,19)]);else trees.push([p[0],p[1],rr(.85,1.1),r.k==='BL'?5:0]);}}s=Math.max(s,c[1]);}}

// ---------- tract builder. A rectangle R between curb lines gets local streets, cul-de-sacs, an entry collector, lots with houses, walls.
// R = {x0,z0,x1,z1,k:[N,S,W,E]} with side kinds 'A' (arterial: sidewalk, parkway, block wall) or 'W' (wall at the edge: trail, park, school).
// Local frame: u runs along the streets, v across them; o.swap makes the streets run north-south.
const HWL=4.5,HWC=5.5,SWC=1.8,PK=3,RBUL=9.5,tracts=[];
let auntRo=null;
const HOODB={x0:AV.HERM.x+AV.HERM.hw,x1:AV.HAVEN.x-AV.HAVEN.hw,z0:STR.BL.z+STR.BL.hw,z1:STR.CH.z-STR.CH.hw}; // 02j-home hook: this block (Hermosa-Haven, Base Line-Church) is built by 02j-home.js
function tract(R,o){if(R.x0>=HOODB.x0-1&&R.x1<=HOODB.x1+1&&R.z0>=HOODB.z0-1&&R.z1<=HOODB.z1+1){tracts.push({R,vs:[],coll:[],sw:false});return{vs:[],coll:[],lots:[]};} // 02j-home hook: no generic streets or lots here
  o=o||{};const sw=!!o.swap,P=sw?(u,v)=>[v,u]:(u,v)=>[u,v],rw=r=>sw?[1,0,3,2][r]:r,
  U0=sw?R.z0:R.x0,U1=sw?R.z1:R.x1,V0=sw?R.x0:R.z0,V1=sw?R.x1:R.z1,K=sw?[R.k[2],R.k[3],R.k[0],R.k[1]]:R.k.slice(),pk=o.pk||[PK,PK,PK,PK];
  const ins=k=>K[k]==='A'?SWA+pk[k]:.5,uL0=U0+ins(2),uL1=U1-ins(3),vL0=V0+ins(0),vL1=V1-ins(1);
  const W4=(a)=>sw?[a[2],a[3],a[0],a[1]]:a;   // local [v0,v1,u0,u1] -> world [N,S,W,E]
  const rect=(u0,v0,u1,v1)=>{const a=P(u0,v0),b=P(u1,v1);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];};
  const padL=(u0,v0,u1,v1,s)=>{const r=rect(u0,v0,u1,v1);pad2(r[0],r[1],r[2],r[3],M.grass,W4(s));mapR(r[0],r[1],r[2],r[3],'#c4cf9f');};
  const wallL=(u0,v0,u1,v1,pil,tint)=>{const a=P(u0,v0),b=P(u1,v1);wallLine(a[0],a[1],b[0],b[1],1.85,tint,pil);};
  const gateL=(u0,v0,u1,v1)=>{const a=P(u0,v0),b=P(u1,v1);gateLine(a[0],a[1],b[0],b[1]);};
  const flatL=(mat,u0,v0,u1,v1,y,rp)=>{const r=rect(u0,v0,u1,v1);if(r[2]-r[0]>.05&&r[3]-r[1]>.05)flat(mat,r[0],r[1],r[2],r[3],y,rp);};
  const tree=(u,v,s,t)=>{const p=P(u,v);trees.push([p[0],p[1],s,t]);};
  // streets across the depth: rows of lots back to back, about 21 to 30 m deep
  const D=vL1-vL0;let vs=o.streets;
  if(!vs){let n=Math.max(1,Math.round(D/62));while(n>1&&(D-12*n)/(2*n)<21)n--;const rd=(D-12*n)/(2*n);vs=[];for(let i=0;i<n;i++)vs.push(vL0+rd*(2*i+1)+12*i+6);}
  const ns=vs.length,coll=o.coll!==undefined?o.coll:((uL1-uL0)>150?[Math.round(lerp(uL0,uL1,rr(.38,.62)))]:[]);
  // street ends: 'open' (out to the arterial) or 'bulb' (cul-de-sac). Without a collector one end must be open.
  const ends=vs.map((v,i)=>{const e=o.ends&&o.ends[i]?o.ends[i].slice():[K[2]==='A'&&rnd()<.25?'open':'bulb',K[3]==='A'&&rnd()<.25?'open':'bulb'];
    if(!coll.length&&e[0]!=='open'&&e[1]!=='open'){if(K[2]==='A')e[0]='open';else e[1]='open';}return e;});
  const cex=[o.cexit?o.cexit[0]:K[0]==='A',o.cexit?o.cexit[1]:K[1]==='A'];
  const roads=[],bulbs=[],lotRows=[];
  for(const uc of coll){const cv0=cex[0]?V0:vs[0]-HWL,cv1=cex[1]?V1:vs[ns-1]+HWL;roads.push({u0:uc-HWC,u1:uc+HWC,v0:cv0,v1:cv1,c:1});const a=P(uc-HWC,cv0),b=P(uc+HWC,cv1);
    roadSeg(M.road2,Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]),!sw,2*HWC);
    for(const v of vs)SPN.push(P(uc,v));if(cex[0])SPN.push(P(uc,V0+3));if(cex[1])SPN.push(P(uc,V1-3));}
  const stops=[uL0].concat(coll,[uL1]);
  vs.forEach((v,i)=>{for(let k=0;k<stops.length-1;k++){const lo=k===0,hi=k===stops.length-2;
      const eL=lo?ends[i][0]:'c',eH=hi?ends[i][1]:'c';
      const ER=RBUL+1.5+3+12+4,segA=lo?uL0:stops[k]+HWC+SWC+3,segB=hi?uL1:stops[k+1]-HWC-SWC-3;
      let ubL=null,ubH=null,endL=false,endH=false;
      if(eL==='bulb'){if(o.bulbAt&&o.bulbAt[i]&&o.bulbAt[i][0]!==undefined)ubL=o.bulbAt[i][0];else{endL=segB-segA>ER+60;ubL=endL?uL0+ER:uL0+RBUL+2;}}
      if(eH==='bulb'){if(o.bulbAt&&o.bulbAt[i]&&o.bulbAt[i][1]!==undefined)ubH=o.bulbAt[i][1];else{endH=segB-segA>ER+60;ubH=endH?uL1-ER:uL1-RBUL-2;}}
      const ra=eL==='open'?U0:eL==='bulb'?ubL+RBUL-1:stops[k]+HWC,rb=eH==='open'?U1:eH==='bulb'?ubH-RBUL+1:stops[k+1]-HWC;
      if(rb>ra){roads.push({u0:ra,u1:rb,v0:v-HWL,v1:v+HWL});flatL(M.asphalt,ra,v-HWL,rb,v+HWL,.03,10);const r=rect(ra,v-HWL,rb,v+HWL);mapR(r[0],r[1],r[2],r[3],'#77736c');}
      if(ubL!==null)bulbs.push([ubL,v,-1,endL]);if(ubH!==null)bulbs.push([ubH,v,1,endH]);
      for(const side of [-1,1])lotRows.push({v,side,a:eL==='open'?uL0:segA,b:eH==='open'?uL1:segB,ubL,ubH,i,aunt:side>0&&!!(o.bulbAt&&o.bulbAt[i]&&o.bulbAt[i][0]!==undefined)});
      SPN.push(P((ra+rb)/2,v));}});
  // pads: everything inside R that is not road
  const ub=[U0,U1];for(const r of roads){ub.push(Math.max(U0,Math.min(U1,r.u0)),Math.max(U0,Math.min(U1,r.u1)));}
  const xs=[...new Set(ub.map(q=>Math.round(q*100)/100))].sort((p,q)=>p-q),ivs=[];
  for(let i=0;i<xs.length-1;i++){const a=xs[i],b=xs[i+1];if(b-a<.05)continue;const m=(a+b)/2,cov=roads.filter(r=>r.u0<=m&&r.u1>=m).sort((p,q)=>p.v0-q.v0),gaps=[];let cur=V0,ck='R';
    for(const r of cov){if(r.v0>cur+.05)gaps.push([cur,r.v0,ck,r.c?'c':'s']);if(r.v1>cur){cur=r.v1;ck=r.c?'c':'s';}}if(V1>cur+.05)gaps.push([cur,V1,ck,'R']);ivs.push({a,b,gaps,cov});}
  const key=g=>g.map(q=>q.join(',')).join(';');
  for(let i=0;i<ivs.length;i++){const I=ivs[i];let j=i;while(j+1<ivs.length&&key(ivs[j+1].gaps)===key(I.gaps)&&ivs[j+1].a===ivs[j].b)j++;const a=I.a,b=ivs[j].b,L=i>0?ivs[i-1]:null,Rn=j+1<ivs.length?ivs[j+1]:null;
    for(const g of I.gaps){const sk=(k,t)=>t==='R'?(K[k]==='A'?SWA:0):t==='c'?SWC:SWL;
      const side=(N,isLo)=>{if(isLo?a<=U0+.01:b>=U1-.01)return K[isLo?2:3]==='A'?SWA:0;if(!N)return-1;const c=N.cov.find(r=>r.c&&r.v0<=g[0]+.01&&r.v1>=g[1]-.01);return c?SWC:-1;};
      padL(a,g[0],b,g[1],[sk(0,g[2]),sk(1,g[3]),side(L,true),side(Rn,false)]);}
    i=j;}
  // cul-de-sac bulbs: an asphalt disc with a sidewalk ring laid over the pads, a short ramp up from the street
  for(const bb of bulbs){const c=P(bb[0],bb[1]),y=PADY+.006,n=16;
    for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,p=(r,a)=>[c[0]+Math.cos(a)*r,y,c[1]+Math.sin(a)*r];
      quad(M.asphaltO,[c[0],y,c[1]],p(RBUL,a1),p(RBUL,a0),[c[0],y,c[1]],0,1,0,1,1);quad(M.walkO,p(RBUL,a0),p(RBUL,a1),p(RBUL+1.5,a1),p(RBUL+1.5,a0),0,1,0,.4,.4);
      quadC(M.flat,[p(RBUL,a0)[0],y+.004,p(RBUL,a0)[2]],[p(RBUL,a1)[0],y+.004,p(RBUL,a1)[2]],[p(RBUL+.25,a1)[0],y+.004,p(RBUL+.25,a1)[2]],[p(RBUL+.25,a0)[0],y+.004,p(RBUL+.25,a0)[2]],0,1,0,C.curb);}
    const ru=bb[0]-bb[2]*(RBUL-1),r0=P(ru-bb[2]*2.5,bb[1]-HWL),r1=P(ru,bb[1]+HWL),lo=[Math.min(r0[0],r1[0]),Math.min(r0[1],r1[1]),Math.max(r0[0],r1[0]),Math.max(r0[1],r1[1])];
    // ramp: street level at the street end, pad level at the disc
    const hiU=P(ru,0),loU=P(ru-bb[2]*2.5,0),yl=.031,yh=PADY+.005;
    if(!sw){const xa=Math.min(hiU[0],loU[0]),xb=Math.max(hiU[0],loU[0]),ya=hiU[0]<loU[0]?yh:yl,yb=hiU[0]<loU[0]?yl:yh;quad(M.asphaltO,[xa,ya,lo[3]],[xb,yb,lo[3]],[xb,yb,lo[1]],[xa,ya,lo[1]],0,1,0,1,1);}
    else{const za=Math.min(hiU[1],loU[1]),zb=Math.max(hiU[1],loU[1]),ya=hiU[1]<loU[1]?yh:yl,yb=hiU[1]<loU[1]?yl:yh;quad(M.asphaltO,[lo[0],yb,zb],[lo[2],yb,zb],[lo[2],ya,za],[lo[0],ya,za],0,1,0,1,1);}
    mapR(c[0]-RBUL,c[1]-RBUL,c[0]+RBUL,c[1]+RBUL,'#77736c');SPN.push(c);}
  // walls: arterial sides (with pilasters), edges, the rear lines between back-to-back rows, along the collector
  const gapsU=coll.map(uc=>[uc-HWC-SWC-2,uc+HWC+SWC+2]);
  const runWall=(fixed,alongU,a,b,gaps,pil)=>{let s=a;for(const g of gaps.slice().sort((p,q)=>p[0]-q[0]).concat([[b,b]])){const e=Math.min(g[0],b);if(e-s>.6){if(alongU)wallL(s,fixed,e,fixed,pil);else wallL(fixed,s,fixed,e,pil);}s=Math.max(s,g[1]);}};
  runWall(vL0,true,uL0,uL1,cex[0]?gapsU:[],K[0]==='A'?12:0);runWall(vL1,true,uL0,uL1,cex[1]?gapsU:[],K[1]==='A'?12:0);
  const gapsV=s=>vs.map((v,i)=>ends[i][s]==='open'?[v-HWL-SWL-2,v+HWL+SWL+2]:null).filter(Boolean);
  runWall(uL0,false,vL0,vL1,gapsV(0),K[2]==='A'?12:0);runWall(uL1,false,vL0,vL1,gapsV(1),K[3]==='A'?12:0);
  const rear=[];for(let i=0;i<ns-1;i++)rear.push((vs[i]+vs[i+1])/2);
  for(const rv of rear)runWall(rv,true,uL0,uL1,coll.map(uc=>[uc-HWC-SWC-2.5,uc+HWC+SWC+2.5]),0);
  // arterial parkway: a row of trees in front of the wall
  for(let s=0;s<4;s++){if(K[s]!=='A')continue;const along=s<2,fix=s===0?V0+SWA+pk[0]/2:s===1?V1-SWA-pk[1]/2:s===2?U0+SWA+pk[2]/2:U1-SWA-pk[3]/2,a=along?uL0:vL0,b=along?uL1:vL1,ty=o.wind&&o.wind.indexOf('NSWE'[sw?[2,3,0,1][s]:s])>=0?5:-1;
    for(let t=a+6;t<b-4;t+=ty===5?13:rr(24,32)){const u=along?t:fix,v=along?fix:t;let skip=false;for(const g of (along?(s===0?(cex[0]?gapsU:[]):(cex[1]?gapsU:[])):gapsV(s-2)))if(t>g[0]-3&&t<g[1]+3)skip=true;if(skip)continue;
      if(ty===5)tree(u,v,rr(.9,1.15),5);else if(rnd()<.18){const p=P(u,v);fans.push([p[0],p[1],rr(11,17)]);}else tree(u,v,rr(.85,1.15),pick([0,2,3,0,6]));}}
  // ---------- lots
  const tintN=()=>pick(wallCols),roofN=()=>pick(roofCols),only1=!!o.older,lotsAll=[];
  const rowRear=(r)=>{const i=r.i;if(r.side<0)return i===0?vL0:rear[i-1];return i===ns-1?vL1:rear[i];};
  const bulbDz=(ul,uh,ubb)=>{if(ubb===null||ubb===undefined)return 0;const du=ubb<ul?ul-ubb:ubb>uh?ubb-uh:0,Rr=RBUL+1.5;return du>=Rr?0:Math.sqrt(Rr*Rr-du*du);};
  for(const r of lotRows){const vR=rowRear(r),depth=Math.abs(r.v-vR)-HWL-SWL;if(depth<17)continue;
    const pickT=(maxD)=>{for(let t=0;t<12;t++){const k=only1?pick([2,3,6,7]):Math.floor(rnd()*HT.length);if(HT[k].D<=maxD)return k;}return-1;};
    // lay lots out: first one centred on a bulb if there is one, then towards the other end
    const L=[],hiB=r.ubH!==null,loB=r.ubL!==null;let dir=hiB&&!loB?-1:1;let cur=dir>0?r.a:r.b;
    const place=(uc,w,k,ex)=>L.push({u:uc,w,k,ex:ex||0});
    if(hiB){const k=pickT(depth-8);if(k>=0){const w=HT[k].W+rr(2.6,3.6);place(r.ubH,w,k);if(dir<0)cur=r.ubH-w/2;else r.bEff=r.ubH-w/2;}}
    if(loB){const k=r.aunt?0:pickT(depth-8);if(k>=0){const w=HT[k].W+rr(2.6,3.6),ex=r.aunt?5.5:0;place(r.ubL,w,k,ex);if(dir>0)cur=r.ubL+w/2+ex;}}
    const lim=dir>0?(r.bEff!==undefined?r.bEff:r.b):r.a;
    for(let g=0;g<40;g++){const room=Math.abs(lim-cur);const k=pickT(depth-8);if(k<0)break;let w=HT[k].W+rr(2.4,4);if(room<HT[k].W+1.6)break;if(room-w<HT[k].W*0.6)w=Math.min(room,w+room-w);
      place(cur+dir*w/2,w,k);cur+=dir*w;}
    L.sort((p,q)=>p.u-q.u);
    const fr=r.side<0?0:2,sg=r.side;                        // north row faces +v (r 0), south row faces -v (r 2)
    for(const l of L){const H=HT[l.k],bz=Math.max(bulbDz(l.u-l.w/2,l.u+l.w/2,r.ubL),bulbDz(l.u-l.w/2,l.u+l.w/2,r.ubH)),vF=r.v+sg*Math.max(HWL+SWL,bz);
      let set=bz>HWL+SWL?rr(3.4,4.4):rr(5.6,6.6);if(Math.abs(vF-vR)-set-H.D<3)set=Math.max(3,Math.abs(vF-vR)-H.D-3);if(Math.abs(vF-vR)-set-H.D<2){l.skip=1;continue;}
      const vc=vF+sg*(set+H.D/2),wc=P(l.u,vc),tint=tintN(),rf=roofN(),hz=house(wc[0],wc[1],rw(fr),l.k,tint,rf);l.vc=vc;l.vf=vF+sg*set;l.vb=vc+sg*H.D/2;l.vF=vF;l.W=H.W;
      // driveway and front walk (local coordinates of the template: x -> u, z -> v, flipped for the south row)
      const gU=sw?hz.gar[1]:hz.gar[0],du=sw?hz.door[1]:hz.door[0];l.gU=gU;
      flatL(M.walkO,gU-2.8,Math.min(r.v+sg*HWL,l.vf),gU+2.8,Math.max(r.v+sg*HWL,l.vf),PADY+.003,6);
      flatL(M.walkO,du-.6,Math.min(vF,vc+sg*(H.D/2-.4)),du+.6,Math.max(vF,vc+sg*(H.D/2-.4)),PADY+.003,6);
      // yard life
      const sideU=gU>l.u?-1:1,fy=Math.abs(l.vf-vF);
      if(fy>3.2&&rnd()<.25){const t=rnd();if(t<.08){const p=P(l.u+sideU*(H.W/2-1.5),vF-sg*fy*.55);fans.push([p[0],p[1],rr(9,14)]);}else tree(l.u+sideU*(H.W/2-2),vF-sg*Math.min(fy*.5,3.2),rr(.7,1.05),pick([0,1,2,3,0,2,6]));}
      if(rnd()<.45){const p=P(l.u+sideU*rr(1,H.W/2-1),l.vf-sg*.9);shrubs.push([p[0],p[1],rr(.55,.9)]);}
      const by=Math.abs(vR-l.vb);
      if(by>5&&rnd()<.1)tree(l.u+rr(-l.w/3,l.w/3),vR-sg*2.4,rr(.8,1.2),pick([0,4,2,0,6]));
      if(by>7.5&&rnd()<.3){const pv=(l.vb+vR)/2,a=P(l.u-3.2,pv-1.7),b=P(l.u+3.2,pv+1.7),a2=P(l.u-4.3,pv-2.6),b2=P(l.u+4.3,pv+2.6),y=PADY+.004;
        const q=(p0,p1,yy,col)=>{const x0=Math.min(p0[0],p1[0]),x1=Math.max(p0[0],p1[0]),z0=Math.min(p0[1],p1[1]),z1=Math.max(p0[1],p1[1]);quadC(M.flat,[x0,yy,z1],[x1,yy,z1],[x1,yy,z0],[x0,yy,z0],0,1,0,col);};
        anchor(wc[0],wc[1],()=>{q(a2,b2,y,0xd8d2c4);q(a,b,y+.004,0x4aa3d8);});mapR(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]),'#4aa3d8');}
      if(rnd()<.24){const p=P(gU+(gU>l.u?3.4:-3.4),r.v+sg*(HWL+.55));trashBins(p[0],p[1],rw(fr));}
      if(rnd()<.2&&fy>5.4){const p=P(gU+rr(-1,1),l.vf-sg*2.8);car(p[0],p[1],sw,undefined,undefined,2);}
      else if(rnd()<.05&&fy>5.4&&!only1){const p=P(gU+(gU>l.u?-1:1)*0,l.vf-sg*3.4);rvs.push([p[0],p[1],sw?1:0]);}
      if(rnd()<.14){const a=P(gU,l.vf-sg*.05),fa=rw(fr)*PI/2;anchor(a[0],a[1],()=>{put(M.flat,GEO.box,a[0]+Math.sin(fa)*.25,3.05,a[1]+Math.cos(fa)*.25,fa,1.2,.8,.06,0xf4f1ea);put(M.flat,GEO.tube8,a[0]+Math.sin(fa)*.55,3.1,a[1]+Math.cos(fa)*.55,0,.23,.04,.23,0xd8412f);});}
      if(rnd()<.12){const p=P(l.u+(gU>l.u?-1:1)*(H.W/2-1.2),l.vb-sg*.6);dishes.push([p[0],H.st*2.85-.2,p[1],rw(fr)*PI/2+rr(-.5,.5)]);}
      if(Math.abs(wc[0]-(-227))<3&&Math.abs(wc[1]-(-300))<12&&!auntRo){auntRo={x:wc[0],z:wc[1],l,r,P,sg};l.aunt=1;}
      lotsAll.push(l);}
    // gates between neighbours, side walls back to the rear line, and the end walls of the row
    const Lp=L.filter(l=>!l.skip);
    for(let k=0;k<Lp.length;k++){const l=Lp[k],nx=Lp[k+1],bnd=l.u+l.w/2+l.ex;
      if(nx){const g=r.side<0?Math.min(l.vf,nx.vf)-2.2:Math.max(l.vf,nx.vf)+2.2,ok=r.side<0?g>Math.max(l.vb,nx.vb)+.5:g<Math.min(l.vb,nx.vb)-.5;
        if(ok){if(!l.aunt&&!nx.aunt)gateL(l.u+l.W/2,g,nx.u-nx.W/2,g);else{gateL(l.aunt?bnd:l.u+l.W/2,g,nx.aunt?bnd:nx.u-nx.W/2,g);}wallL(bnd,g,bnd,vR,0,C.greyWall);}
        else wallL(bnd,l.vF+sg*1,bnd,vR,0,C.greyWall);}
      if(k===0){const e=l.u-l.w/2,g=l.vf+sg*2.2;if(!l.aunt)gateL(e,g,l.u-l.W/2,g);wallL(e,g,e,vR,0,C.greyWall);}
      if(k===Lp.length-1){const e=l.u+l.w/2+l.ex,g=r.side<0?l.vf-2.2:l.vf+2.2;if(!l.aunt)gateL(l.u+l.W/2,g,e,g);wallL(e,g,e,vR,0,C.greyWall);}}
    // mailbox cluster and a street light every few lots, the odd car at the curb
    for(let k=0;k<Lp.length;k+=5){const l=Lp[k],p=P(l.u+l.w/2-1,r.v+sg*(HWL+.7));mailboxes.push([p[0],p[1]]);}
    if(r.side<0)for(let k=2;k<Lp.length;k+=6){const l=Lp[k],p=P(l.u+l.w/2,r.v-(HWL+.5));lamps.push([p[0],p[1],2,(sw?0:PI/2)+(sw?PI:0),.75]);}
    for(let k=0;k<Lp.length;k++)if(rnd()<.07){const l=Lp[k],p=P(l.u+(l.gU>l.u?-l.w/2+3:l.w/2-3),r.v+sg*(HWL-1.15));car(p[0],p[1],!sw,undefined,undefined,1);}}
  // end lots facing the bulbs, with gates back to the side walls
  for(const bb of bulbs){if(!bb[3])continue;const dir=bb[2],k=Math.floor(rnd()*HT.length),H=HT[k],uf=bb[0]+dir*(RBUL+1.5+3.2),uc=uf+dir*H.D/2;if(dir>0?uc+H.D/2>uL1-3:uc-H.D/2<uL0+3)continue;
    const wc=P(uc,bb[1]),fr=dir>0?3:1,hz=house(wc[0],wc[1],rw(fr),k,tintN(),roofN());
    const gv=sw?hz.gar[0]:hz.gar[1];flatL(M.walkO,Math.min(bb[0]+dir*RBUL,uf),gv-2.8,Math.max(bb[0]+dir*RBUL,uf),gv+2.8,PADY+.003,6);
    const ug=uf+dir*2.2;
    for(const s of [-1,1]){const rv=s<0?(()=>{for(let i=rear.length-1;i>=0;i--)if(rear[i]<bb[1])return rear[i];return vL0;})():(()=>{for(const q of rear)if(q>bb[1])return q;return vL1;})();
      gateL(ug,bb[1]+s*H.W/2,ug,bb[1]+s*(H.W/2+1.4));wallL(ug,bb[1]+s*(H.W/2+1.4),ug,rv,0,C.greyWall);}
    if(rnd()<.6)tree(uc+dir*(H.D/2+3),bb[1]+rr(-6,6),rr(.9,1.2),pick([0,4,2]));}
  // stop signs where the streets meet the collector, a light at each corner
  for(const uc of coll)for(const v of vs)for(const s of [-1,1]){const p=P(uc+s*(HWC+SWC*.5),v+s*(HWL+SWL*.6));stopSigns.push([p[0],p[1],rw(s<0?3:1)*PI/2]);}
  for(const uc of coll){for(let v=V0+20;v<V1-10;v+=48){const p=P(uc+HWC+.6,v);lamps.push([p[0],p[1],2,rw(3)*PI/2,.8]);}
    for(let v=V0+8;v<V1-6;v+=rr(22,28)){let skip=false;for(const q of vs)if(Math.abs(v-q)<HWL+SWL+4)skip=true;if(skip)continue;for(const s of [-1,1])tree(uc+s*(HWC+SWC+1.5),v,rr(.75,1),pick([0,1,2]));}}
  tracts.push({R,vs,coll,sw});return{vs,coll,lots:lotsAll};}
const shrubs=[],rvs=[],dishes=[],mailboxes=[],stopSigns=[];
// filler houses beyond the playable edge (no colliders, about 60 vertices each): a box with two cells a side and a plain hip roof
const HF=[[13,9,1],[15,9.5,1],[11,10,2],[12.5,9,2]].map(v=>{const A=new TB(),R=new TB(),h=v[2]*2.85;for(let s=0;s<4;s++)wallSideE(A,0,0,v[0],v[1],0,h,s,s===1?['hwinW','garage']:s===0?['hwin','hwin']:['stucco'],0xffffff);
  hipRoofE(R,0,0,v[0],v[1],h,.36,0xffffff,.4,false,0,40);return{wall:A.geo(),roof:R.geo()};});
function filler(x0,z0,x1,z1,swap){const sw=!!swap;for(let v=(sw?x0:z0)+14;v<(sw?x1:z1)-10;v+=64)for(const s of [-1,1])for(let u=(sw?z0:x0)+10;u<(sw?z1:x1)-10;u+=rr(22,28)){
    const k=Math.floor(rnd()*HF.length),p=sw?[v+s*14,u]:[u,v+s*14],r=sw?(s<0?1:3):(s<0?0:2);put(M.wall,HF[k].wall,p[0],0,p[1],r*PI/2,1,1,1,pick(wallCols));put(M.wall,HF[k].roof,p[0],0,p[1],r*PI/2,1,1,1,pick(roofCols));
    if(rnd()<.1)trees.push([p[0]+rr(-6,6),p[1]+rr(-6,6),rr(.8,1.2),pick([0,4,2,5])]);}
  mapR(x0,z0,x1,z1,'#c9cba6');}
