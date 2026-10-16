// =====================================================================
// 02i STREET DRESSING: the trail, the tracks, the freeway; signals with street-name signs, Route 66 shields, street lights,
// bus stops, power lines, tract monuments, Kingsley's barricades and command post, spawn points along the avenues
// =====================================================================
peTrail();railway();freeway();
const inB=(x,z,m)=>x>BOUND.x0-m&&x<BOUND.x1+m&&z>BOUND.z0-m&&z<BOUND.z1+m;
// ---------- traffic signals on mast arms; the name of the cross street hangs on each arm
const signalArms=[];
for(const i of ISEC){if(!inB(i.x,i.z,40))continue;const ha=i.a.hw,hb=i.b.hw,nA=strip('st'+i.a.k,i.a.n,'#1f6b45','#f4f0e7','bold 34px "Arial Narrow",Arial',true),nB=strip('st'+i.b.k,i.b.n,'#1f6b45','#f4f0e7','bold 34px "Arial Narrow",Arial',true);
  // corner: [sx, sz, arm direction x, arm direction z, arm length, sign uv, green?]
  for(const c of [[-1,1,1,0,ha,nB,1],[1,-1,-1,0,ha,nB,1],[1,1,0,-1,hb,nA,0],[-1,-1,0,1,hb,nA,0]]){const px=i.x+c[0]*(ha+1.1),pz=i.z+c[1]*(hb+1.1);signalArms.push([px,pz,c[2],c[3],Math.min(c[4]+.5,14),c[6]]);
    const L0=Math.min(c[4]+.5,14),ry=Math.atan2(c[2],c[3])+PI/2;anchor(px,pz,()=>{boardQ(c[5],px+c[2]*2.4,6.75,pz+c[3]*2.4,Math.atan2(c[3],-c[2])*0+(c[2]?(c[1]>0?0:PI):(c[0]>0?PI/2:-PI/2)),2.6,.52,true);
      if(i.b.k==='FH'&&c[2])boardQ(cuv(CI.r66),px+c[2]*4.4,6.6,pz,c[1]>0?0:PI,.8,.8,true);});solid(px,pz,.35,.35,6.6);}}
// ---------- Route 66 shields along Foothill, street lights along every avenue, bus stops
for(let x=-500;x<1200;x+=160)for(const s of [-1,1]){const z=s*(STR.FH.hw+1.2),xx=x+(s>0?80:0);if(ISEC.some(i=>i.b===STR.FH&&Math.abs(i.x-xx)<i.a.hw+8))continue;postSign(cuv(CI.r66),xx,z,s<0?0:PI,1.1,1.1,1.6);}
function avenueLights(r,ns){const L0=ns?r.z0:r.x0,L1=ns?r.z1:r.x1,lim=ns?[BOUND.z0-50,BOUND.z1+50]:[BOUND.x0-50,BOUND.x1+50];
  for(let t=Math.max(L0,lim[0]);t<Math.min(L1,lim[1]);t+=64)for(const s of [-1,1]){const u=t+(s>0?32:0);if(ISEC.some(i=>(ns?i.a===r:i.b===r)&&Math.abs((ns?i.z:i.x)-u)<(ns?i.b.hw:i.a.hw)+6))continue;
    if(ns&&Math.abs(trailZ(r.x)-u)<12)continue;const p=ns?[r.x+s*(r.hw+.7),u]:[u,r.z+s*(r.hw+.7)];if(!ns&&p[0]>fwEdge(p[1])-4)continue;
    lamps.push([p[0],p[1],2,ns?(s<0?PI/2:-PI/2):(s<0?0:PI),1]);if(rnd()<.3&&inB(p[0],p[1],0))SPN.push([p[0]+(ns?s*1.5:0),p[1]+(ns?0:s*1.5)]);}}
for(const a of NSA)avenueLights(a,true);for(const b of EWA)avenueLights(b,false);
for(const q of [[-300,STR.FH.z+STR.FH.hw+1.2,0],[260,STR.FH.z-STR.FH.hw-1.2,PI],[640,STR.FH.z+STR.FH.hw+1.2,0],[AV.HAVEN.x+AV.HAVEN.hw+1.2,-380,PI/2],[AV.HAVEN.x-AV.HAVEN.hw-1.2,140,-PI/2],[AV.MILL.x+AV.MILL.hw+1.2,600,PI/2]])busStop(q[0],q[1],q[2]);
// ---------- wooden power poles along Arrow, Jersey and 6th, wires between them
for(const b of [STR.AR,STR.JE,STR.SIX])for(let x=Math.max(b.x0,-700);x<Math.min(b.x1,fwEdge(b.z)-6);x+=42){if(ISEC.some(i=>i.b===b&&Math.abs(i.x-x)<i.a.hw+5))continue;poles.push([x,b.z+b.hw+3.2,0]);}
// ---------- tract monuments at the Terra Linda entries
for(const q of [[-120,zS('BL')+SWA+1.2,0],[-120,zN('CH')-SWA-1.2,PI]])for(const s of [-1,1]){const x=q[0]+s*(HWC+SWC+4.5),z=q[1];anchor(x,z,()=>{boxE(CE,x,0,z,5.2,1.3,.7,0xffffff,cuv(CI.stone));boxC(M.flat,x,1.3,z,5.4,.12,.8,0xb5583a);
    boardQ(strip('tl','TERRA LINDA','#e9e1cc','#5b3a22','bold 36px Georgia,serif'),x,.35,z+(q[2]?-.36:.36),q[2],3.6,.8,false);});solid(x,z,5.2,.7,1.4,0,5);lowCover.push([x,z]);}
// ---------- Kingsley Prime's barricades round the places they hold, and the command post in the outlet mall's south-west court
const KTAN=0xd6c08a;
for(const b of [[-150,64,1],[-118,64,1],[-86,64,1],[-60,70,0],[1150,-126,1],[1144,-198,1],[1156,-198,1],[30,152,1],[52,152,1],[-232,-318,0],[-224,-334,1]])barrier(b[0],b[1],!!b[2],KTAN);
for(const s of [[1150,-142,4,1],[1136,-160,4,0],[-140,72,4.5,1],[46,166,4,1]])sandbags(s[0],s[1],s[2],!!s[3]);
{const cx=OUT.court[0],cz=OUT.court[1];
 for(const t of [[cx-8,cz+6,6,4],[cx+4,cz+12,5,4]]){anchor(t[0],t[1],()=>{boxC(M.flat,t[0],0,t[1],t[2],2.2,t[3],0x5f5a48);put(M.flat,GEO.cone4,t[0],2.2,t[1],PI/4,t[2]*.72,1.2,t[3]*.72,0x6a6450);blob(t[0],t[1],t[2]/2+.6,t[3]/2+.6,PADY);});solid(t[0],t[1],t[2],t[3],2.6,0,1);}
 anchor(cx+12,cz-6,()=>{post(cx+12,cz-6,14,.12,0x8c9396);put(M.flat,GEO.dome,cx+12.4,11,cz-6,0,.9,.4,.9,0xe9e6dc,PI/2.4);});solid(cx+12,cz-6,.4,.4,14);
 for(const b of [[cx-14,cz-12,0],[cx-14,cz-8,0],[cx-18,cz+14,1],[cx+2,cz-14,1],[cx+18,cz+18,1]])barrier(b[0],b[1],!!b[2],KTAN);
 for(const s of [[cx-2,cz,3.4,1],[cx+8,cz+2,3.4,0],[cx-12,cz+18,3,1]])sandbags(s[0],s[1],s[2],!!s[3]);
 for(const c of [[cx+14,cz+6,1.2],[cx+15.4,cz+6.2,1],[cx-4,cz-10,1.1]])crate(c[0],c[1],c[2],0x9a9478);
 barrelSpots.push([cx+10,cz+14],[cx-16,cz+2]);label(cx,cz,'KINGSLEY COMMAND POST',0);}
barrelSpots.push([-70,60],[-40,62],[1160,-90],[54,148],[660,1012]);
// ---------- spawn points: intersections, tract streets and trail stops were added on the way; plus the big lots
for(const q of [[-150,40],[190,-60],[600,90],[650,1000],[520,1100],[1120,-120],[900,60],[440,420],[60,250]])SPN.push(q);
for(let k=SPN.length-1;k>=0;k--)if(!inB(SPN[k][0],SPN[k][1],-4))SPN.splice(k,1);
