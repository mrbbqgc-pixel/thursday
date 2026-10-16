// =====================================================================
// 02j HOME: the start neighbourhood, at FULL scale, in the block between Hermosa Ave, Haven Ave, Church St and Base Line Rd.
// Its local streets are the real ones (US Census TIGER/Line, public domain) for lon -117.5786..-117.5759, lat 34.1182..34.1203,
// mapped 1:1: x = (lon+117.5759)*92180, z = -(lat-34.11925)*110950-380. Streets that leave that window run straight on to the
// arterial; dead ends get a cul-de-sac bulb. The generic tract builder skips this block (hook in 02g: HOODB).
// Curved streets are laid from one smooth distance field (asphalt, rolled curb, parkway, sidewalk), lots face the streets,
// rotated houses use the 02a templates; walls and houses on rotated lines get axis-aligned staircase colliders.
// No street-name signs on these streets, no house numbers, no names.
// =====================================================================
const HOOD={foot:[]};
{
const B=HOODB,HW=5.5,CB=.5,PKW=1.9,SWK=1.2,WR=HW+CB+PKW+SWK,RB=11.5,AWI=5,YR=.032; // half asphalt, rolled curb, parkway, sidewalk; bulb radius; arterial wall inset
// centre lines (game frame). IW = Ironwood St running on into Mesada St (one through street with the big curve), MN = Marine Ave north of
// Ironwood, SG = Sago Ct (cul-de-sac), MS = Marine Ave south of its knuckle (cul-de-sac bulb at its west end). Ends past the block edge are
// extended straight into the arterial; Sago Ct's bulb is pulled 45 m south so that it fits inside the block (the window ends at Base Line).
const RAW={IW:[[-252,-446.15],[-240.7,-446],[-186,-443.4],[-167.9,-442.6],[-151,-439.4],[-140.1,-436.3],[-131.4,-432.6],[-116.1,-424.6],[-104,-416.3],[-96.6,-411.3],[-89.7,-405.4],
    [-82.4,-397],[-74,-380.8],[-71.3,-373.5],[-70.9,-371.3],[-68.4,-358.1],[-66.8,-316.5],[-66.6,-260]],
  MN:[[-167.7,-500],[-167.8,-468.8],[-167.9,-442.6]],
  SG:[[-89.7,-405.4],[-82.7,-412],[-76.3,-418.9],[-73.3,-422.5],[-70.1,-428],[-66.6,-439.2],[-65.4,-446],[-65.3,-450]],
  MS:[[-189.4,-360.4],[-180.1,-360.9],[-169.9,-359.6],[-165.5,-357.5],[-160.9,-353.5],[-159.7,-351.7],[-153.3,-343.1],[-150.8,-337],[-150.3,-331],[-151.7,-315.8],[-153.7,-306.9],[-161.4,-283.5],[-167,-258.3]]};
const chaikin=(p,n)=>{for(let k=0;k<n;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]],[.25*a[0]+.75*b[0],.25*a[1]+.75*b[1]]);}q.push(p[p.length-1]);p=q;}return p;};
const cum=p=>{const s=[0];for(let i=1;i<p.length;i++)s.push(s[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return s;};
function resample(p,step){const s=cum(p),L=s[s.length-1],n=Math.max(1,Math.round(L/step)),o=[];let j=0;
  for(let k=0;k<=n;k++){const t=L*k/n;while(j<p.length-2&&s[j+1]<t)j++;const f=clamp((t-s[j])/((s[j+1]-s[j])||1),0,1);o.push([lerp(p[j][0],p[j+1][0],f),lerp(p[j][1],p[j+1][1],f)]);}return o;}
// a street: points every ~2 m with arc length, unit tangent and normal n = (-tz, tx); side +1 is the n side
function mkStreet(k,pts){const p=resample(chaikin(pts,3),2),s=cum(p),t=[],n=[];
  for(let i=0;i<p.length;i++){const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;t.push([(b[0]-a[0])/l,(b[1]-a[1])/l]);n.push([-(b[1]-a[1])/l,(b[0]-a[0])/l]);}
  return{k,p,s,t,n,L:s[s.length-1]};}
const S={};for(const k in RAW)S[k]=mkStreet(k,RAW[k]);
// nearest point on a street: distance, arc length, side, foot point
function near(st,x,z){const p=st.p;let bd=1e18,bi=0,bt=0;
  for(let i=0;i<p.length-1;i++){const ax=p[i][0],az=p[i][1],dx=p[i+1][0]-ax,dz=p[i+1][1]-az,l2=dx*dx+dz*dz||1;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,d=ex*ex+ez*ez;if(d<bd){bd=d;bi=i;bt=t;}}
  const fx=lerp(p[bi][0],p[bi+1][0],bt),fz=lerp(p[bi][1],p[bi+1][1],bt),n=st.n[bi];return{d:Math.sqrt(bd),s:lerp(st.s[bi],st.s[bi+1],bt),side:((x-fx)*n[0]+(z-fz)*n[1])>=0?1:-1,fx,fz};}
// position, tangent and normal at arc length s
function at(st,s){s=clamp(s,0,st.L);let i=0;while(i<st.p.length-2&&st.s[i+1]<s)i++;const f=(s-st.s[i])/((st.s[i+1]-st.s[i])||1),a=st.p[i],b=st.p[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/l,tz=(b[1]-a[1])/l;
  return{x:lerp(a[0],b[0],f),z:lerp(a[1],b[1],f),tx,tz,nx:-tz,nz:tx};}
// Sago Ct and Marine Ave north start / end on the through street: snap them onto its smoothed line
{const q=near(S.IW,S.SG.p[0][0],S.SG.p[0][1]);S.SG.p[0]=[q.fx,q.fz];const r=near(S.IW,S.MN.p[S.MN.p.length-1][0],S.MN.p[S.MN.p.length-1][1]);S.MN.p[S.MN.p.length-1]=[r.fx,r.fz];}
// cul-de-sac bulbs: centre and the street they end
const BULB=[{k:'SGb',st:'SG',c:S.SG.p[S.SG.p.length-1],end:1},{k:'MSb',st:'MS',c:S.MS.p[0],end:0}];
// "distance" to each label: streets by their centre line, bulbs by their centre less (RB-HW), so the curb line is at HW for every one
const LAB=['IW','MN','SG','MS','SGb','MSb'];
function dLab(k,x,z){const b=BULB.find(q=>q.k===k);if(b)return Math.hypot(x-b.c[0],z-b.c[1])-(RB-HW);return near(S[k],x,z).d;}
const inset=(x,z)=>Math.min(x-B.x0,B.x1-x,z-B.z0,B.z1-z); // >0 inside the block (from the arterial curb lines)
// ---------- lots. The frontage (back of the sidewalk) along both sides of the through street and of Marine Ave south is cut into lots;
// round each bulb, pie slices. A lot side line is a ray along the street normal that ends at the arterial wall, where another street (or
// another stretch of the same street) gets nearer, short of any street, or on an earlier lot. The short branches (Marine Ave north of
// Ironwood, the Sago Ct stub) get no lots of their own: the corner lots and the pie lots wrap round along them.
const LOTS=[],POLY=[];
const pip=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function rayEnd(k,x,z,dx,dz,s0,max,ign){
  const ok=(px,pz)=>{if(inset(px,pz)<AWI+.3)return false;const own=k.length>2?{d:dLab(k,px,pz),s:s0}:near(S[k],px,pz);if(k.length<=2&&Math.abs(own.s-s0)>4)return false;
    for(const o of LAB){if(o===k)continue;const d=dLab(o,px,pz);if(d<WR+1)return false;if(!(ign&&ign.indexOf(o)>=0)&&d<own.d-.01)return false;}
    for(const P of POLY)if(pip(P,px,pz))return false;return true;};
  let t=1,lx=x,lz=z;for(;t<=max;t+=1){const px=x+dx*t,pz=z+dz*t;if(!ok(px,pz))break;lx=px;lz=pz;}
  if(t<=max){let a=t-1,b=t;for(let q=0;q<4;q++){const m=(a+b)/2;if(ok(x+dx*m,z+dz*m))a=m;else b=m;}return[x+dx*a,z+dz*a,a];}
  return[lx,lz,max];}
// frontage test: true, or the label that is in the way
function frontOK(k,side,s){const st=S[k],q=at(st,s),fx=q.x+q.nx*side*WR,fz=q.z+q.nz*side*WR;if(inset(fx,fz)<AWI+4)return'art';
  const own=near(st,fx,fz);if(own.d<WR-.3||Math.abs(own.s-s)>3)return'fold'; // inside of a tight bend
  for(const o of LAB){if(o===k)continue;if(o.length<=2){const r=near(S[o],fx,fz);if(r.d<WR+7&&!(TEE[o]&&TEE[o][1]===k&&Math.abs(r.s-TEE[o][0])<.6))return o;}
    else if(dLab(o,fx,fz)<WR+3.5)return o;}return true;}
// branch streets that end on the through street: their end is no obstacle on the far side of it
const TEE={MN:[S.MN.L,'IW'],SG:[0,'IW']};
function runs(k,side){const st=S[k],R=[];let a=-1,why=null,prevWhy=null;
  for(let s=0;s<=st.L;s+=1){const ok=frontOK(k,side,s);if(ok===true&&a<0){a=s;why=prevWhy;}if((ok!==true||s+1>st.L)&&a>=0){const b=ok===true?s:s-1;if(b-a>12)R.push([a,b,why,ok===true?null:ok]);a=-1;}if(ok!==true)prevWhy=ok;}return R;}
// cut a run [a,b] into lots: each lot is made just wide enough (19.5 to 22.5 m between its side lines, measured 6 and 18 m deep) for a house
const fr=(st,s,side)=>{const q=at(st,s);return{x:q.x+q.nx*side*WR,z:q.z+q.nz*side*WR,nx:q.nx*side,nz:q.nz*side};};
const wAt=(A,Bq,v)=>Math.hypot(A.x+A.nx*v-Bq.x-Bq.nx*v,A.z+A.nz*v-Bq.z-Bq.nz*v);
function cut(st,side,a,b){const out=[];let s=a;
  while(b-s>14){const want=rr(19.5,22.5),A=fr(st,s,side);let e=s+14;
    for(;e<b;e+=.5){const Bq=fr(st,e,side);if(Math.min(wAt(A,Bq,6),wAt(A,Bq,18))>=want)break;}
    if(e>=b||b-e<12){if(out.length&&b-s<12){out[out.length-1][1]=b;break;}if(out.length&&b-s<19){const m=(out[out.length-1][0]+b)/2;out[out.length-1][1]=m;out.push([m,b]);break;}e=b;}out.push([s,e]);s=e;}
  if(!out.length&&b-a>10)out.push([a,b]);return out;}
const START={x:-46,z:-372}; // the start house (reference point: the middle of the house)
const PIN=(()=>{const q=near(S.IW,START.x,START.z),c=at(S.IW,q.s);return{s:q.s,side:q.side,s0:q.s-9.4,s1:q.s+9.6,nx:c.nx*q.side,nz:c.nz*q.side};})();
const wrap=w=>w==='MN'||w==='SG'?[w]:null;
function lotsAlong(k,side){const st=S[k];
  for(const r of runs(k,side)){let parts=[[r[0],r[1]]],pin=null;
    if(k==='IW'&&side===PIN.side&&PIN.s0>r[0]&&PIN.s1<r[1]){parts=[[r[0],PIN.s0],[PIN.s1,r[1]]];pin=[PIN.s0,PIN.s1,1];}
    let C=[];for(const p of parts)C=C.concat(cut(st,side,p[0],p[1]));if(pin)C.push(pin);C.sort((p,q)=>p[0]-q[0]);
    // all side lines of the run first (so that the run's own lots do not stop them); the start house's lot has parallel side lines
    const BD=new Map();
    for(const c of C)for(const s of [c[0],c[1]]){const key=s.toFixed(2);if(BD.has(key))continue;const q=at(st,s),f=[q.x+q.nx*side*WR,q.z+q.nz*side*WR];let nx=q.nx*side,nz=q.nz*side;
      if(pin&&(Math.abs(s-PIN.s0)<.01||Math.abs(s-PIN.s1)<.01)){nx=PIN.nx;nz=PIN.nz;}
      const ign=Math.abs(s-r[0])<.01?wrap(r[2]):Math.abs(s-r[1])<.01?wrap(r[3]):null,e=rayEnd(k,f[0],f[1],nx,nz,s,44,ign);BD.set(key,{F:f,R:[e[0],e[1]],d:e[2]});}
    const add=[];for(const c of C){const b0=BD.get(c[0].toFixed(2)),b1=BD.get(c[1].toFixed(2)),sm=(c[0]+c[1])/2,qm=at(st,sm);let nx=qm.nx*side,nz=qm.nz*side;if(c[2]){nx=PIN.nx;nz=PIN.nz;}
      const fm=c[2]?[(b0.F[0]+b1.F[0])/2,(b0.F[1]+b1.F[1])/2]:[qm.x+qm.nx*side*WR,qm.z+qm.nz*side*WR];
      add.push({k,side,s0:c[0],s1:c[1],F0:b0.F,F1:b1.F,R0:b0.R,R1:b1.R,d0:b0.d,d1:b1.d,nx,nz,fm,start:!!c[2],w:Math.hypot(b1.F[0]-b0.F[0],b1.F[1]-b0.F[1])});}
    for(const l of add){LOTS.push(l);POLY.push([l.F0,l.F1,l.R1,l.R0]);}}}
// bulb lots: pie slices round the bulb, from beside the stub on one side round to the other; they wrap along the stub
for(const b of BULB){const st=S[b.st],tq=at(st,b.end?st.L:0),ux=b.end?tq.tx:-tq.tx,uz=b.end?tq.tz:-tq.tz,base=Math.atan2(-uz,-ux),RF=RB+(WR-HW),th0=Math.asin((WR+3.2)/RF);
  const A0=base+th0,A1=base+TAU-th0,n=Math.max(3,Math.round((A1-A0)*RF/14)),R=[];
  for(let i=0;i<=n;i++){const a=lerp(A0,A1,i/n),f=[b.c[0]+Math.cos(a)*RF,b.c[1]+Math.sin(a)*RF],e=rayEnd(b.k,f[0],f[1],Math.cos(a),Math.sin(a),0,38,[b.st]);R.push({a,F:f,R:[e[0],e[1]],d:e[2]});}
  for(let i=0;i<n;i++){const p=R[i],q=R[i+1],am=(p.a+q.a)/2;
    LOTS.push({k:b.k,side:1,s0:p.a,s1:q.a,F0:p.F,F1:q.F,R0:p.R,R1:q.R,d0:p.d,d1:q.d,nx:Math.cos(am),nz:Math.sin(am),fm:[b.c[0]+Math.cos(am)*RF,b.c[1]+Math.sin(am)*RF],bulb:b,w:RF*(q.a-p.a)});}
  for(let i=LOTS.length-n;i<LOTS.length;i++){const l=LOTS[i];POLY.push([l.F0,l.F1,l.R1,l.R0]);}}
for(const k of ['IW','MS'])for(const side of [-1,1])lotsAlong(k,side);
// ---------- houses: one 02a template per lot, facing the street. Lot frame: u along the frontage (= the template's local +x), v into the lot.
const loc=(l,p)=>{const dx=p[0]-l.fm[0],dz=p[1]-l.fm[1];return[-dx*l.nz+dz*l.nx,dx*l.nx+dz*l.nz];};
const wor=(l,u,v)=>[l.fm[0]-l.nz*u+l.nx*v,l.fm[1]+l.nx*u+l.nz*v];
const uAt=(P,v)=>{const t=(v-P[0][1])/((P[1][1]-P[0][1])||1e-6);return lerp(P[0][0],P[1][0],t);};
// the u range of the lot between its two side lines over the depths v0..v1
function span(l,v0,v1){const A=[loc(l,l.F0),loc(l,l.R0)],Bq=[loc(l,l.F1),loc(l,l.R1)];let lo=-1e9,hi=1e9;
  for(const v of [v0,(v0+v1)/2,v1]){const a=uAt(A,v),b=uAt(Bq,v);lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}return[lo,hi,Math.min(A[1][1],Bq[1][1])];}
// footprint boxes of template k in the lot frame (u0,u1,v0,v1), house centre (uc,vc)
const boxesL=(k,uc,vc)=>HT[k].boxes.map(b=>[uc+b[0]-b[2]/2,uc+b[0]+b[2]/2,vc-b[1]-b[3]/2,vc-b[1]+b[3]/2,b[4]]);
const one=[],two=[];for(let k=0;k<HT.length;k++)(HT[k].st>1?two:one).push(k);
// does the rectangle u0..u1 x v0..v1 (lot frame) lie inside the lot?
function fits(P,u0,u1,v0,v1){for(const q of [[u0,v0],[u1,v0],[u1,v1],[u0,v1]])if(!pip(P,q[0],q[1]))return false;for(const p of P)if(p[0]>u0&&p[0]<u1&&p[1]>v0&&p[1]<v1)return false;return true;}
for(const l of LOTS){if(l.start)continue;const pie=!!l.bulb,tries=[],P=[l.F0,l.F1,l.R1,l.R0].map(p=>loc(l,p));
  const nb=LOTS.some(o=>o.start&&o.k===l.k&&o.side===l.side&&(Math.abs(o.s0-l.s1)<.01||Math.abs(o.s1-l.s0)<.01));
  for(let q=0;q<10;q++)tries.push(nb||rnd()<.72?pick(one):pick(two));tries.push(...one);if(!nb)tries.push(...two);
  const um=(P[0][0]+P[1][0])/2;let done=false;
  for(const k of tries){const H=HT[k],y=pie?2.5:4;
    for(let set=pie?4.6:rr(5.6,7.2);set<(pie?13:11)&&!done;set+=.6)for(let o=0;o<=16&&!done;o++){const uc=um+(o%2?1:-1)*Math.ceil(o/2)*1.1;
      if(!fits(P,uc-H.W/2-1.1,uc+H.W/2+1.1,set,set+H.D+y))continue;const vc=set+H.D/2,c=wor(l,uc,vc);
      l.house={k,uc,vc,set,x:c[0],z:c[1],ry:Math.atan2(-l.nx,-l.nz),bx:boxesL(k,uc,vc)};done=true;}
    if(done)break;}}
// ---------- walls: side lines from just behind the house fronts to the rear, rear lines, gates across the side yards
const WALLS=[],GATES=[];
const gateD=l=>l.house?Math.max(...l.house.bx.map(b=>b[2]))+.9:l.start?9:4.5;
const segOn=(F,R,d)=>{const L=Math.hypot(R[0]-F[0],R[1]-F[1]);if(L-d<.8)return null;const t=d/L;return[lerp(F[0],R[0],t),lerp(F[1],R[1],t),R[0],R[1]];};
const onArt=p=>inset(p[0],p[1])<AWI+.6;
// side lines between neighbours; at the end of a row the side line runs back from the gate depth, or, next to an arterial,
// a return wall runs from the side line to the arterial wall (the strip in front of it stays open lawn)
const artPt=p=>{const d=[p[0]-B.x0,B.x1-p[0],p[1]-B.z0,B.z1-p[1]],i=d.indexOf(Math.min(...d));return i===0?[B.x0+AWI,p[1]]:i===1?[B.x1-AWI,p[1]]:i===2?[p[0],B.z0+AWI]:[p[0],B.z1-AWI];};
function endWall(F,R,d){const w=segOn(F,R,d);if(!w)return;if(inset(F[0],F[1])<AWI+4.6&&inset(R[0],R[1])<AWI+4.6){const q=artPt([w[0],w[1]]);WALLS.push([w[0],w[1],q[0],q[1],'end']);}else WALLS.push(w.concat('end'));}
{let prev=null;for(const l of LOTS){const same=prev&&prev.k===l.k&&prev.side===l.side&&Math.abs(prev.s1-l.s0)<.01;
   if(!same){if(prev)endWall(prev.F1,prev.R1,gateD(prev));endWall(l.F0,l.R0,gateD(l));}
   else{const w=segOn(l.F0,l.R0,Math.max(gateD(prev),gateD(l)));if(w)WALLS.push(w.concat('side'));}
   prev=l;}
 if(prev)endWall(prev.F1,prev.R1,gateD(prev));}
// rear lines (skipped along the arterial wall, and where a neighbour's rear line already runs)
for(const l of LOTS){if(onArt(l.R0)&&onArt(l.R1))continue;const a=l.R0,b=l.R1,L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.6)continue;
  const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;let dup=false;
  for(const w of WALLS){if(w[4]!=='rear')continue;const dx=w[2]-w[0],dz=w[3]-w[1],l2=dx*dx+dz*dz||1,t=clamp(((mx-w[0])*dx+(mz-w[1])*dz)/l2,0,1),ex=w[0]+dx*t-mx,ez=w[1]+dz*t-mz;
    if(ex*ex+ez*ez<2.2&&Math.abs((dx*(b[1]-a[1])-dz*(b[0]-a[0]))/Math.sqrt(l2)/L)<.45){dup=true;break;}}
  if(!dup)WALLS.push([a[0],a[1],b[0],b[1],'rear']);}
// gates: from the house side to the lot line, at the gate depth
for(const l of LOTS){if(!l.house)continue;const g=gateD(l)-.3,A=[loc(l,l.F0),loc(l,l.R0)],Bq=[loc(l,l.F1),loc(l,l.R1)],ua=uAt(A,g),ub=uAt(Bq,g),
  bx=l.house.bx.filter(b=>g>b[2]&&g<b[3]),hu0=Math.min(...(bx.length?bx:l.house.bx).map(b=>b[0])),hu1=Math.max(...(bx.length?bx:l.house.bx).map(b=>b[1]));
  for(const e of [[Math.min(ua,ub),hu0],[hu1,Math.max(ua,ub)]])if(e[1]-e[0]>.3){const p=wor(l,e[0],g),q=wor(l,e[1],g);GATES.push([p[0],p[1],q[0],q[1]]);}}
HOOD.S=S;HOOD.LOTS=LOTS;HOOD.BULB=BULB;HOOD.near=near;HOOD.at=at;HOOD.WALLS=WALLS;HOOD.GATES=GATES;HOOD.wor=wor;HOOD.loc=loc;
//---8<--- (the layout above runs on its own in the layout test; below, the geometry)
// ---------- materials: worn, cracked and patched asphalt; decomposed granite for the dry yards
M.hoodRoad=L({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);g.fillStyle='rgba(95,90,82,.18)';g.fillRect(0,0,w,h);noise(g,w,h,5000,.07);
  const line=(x,y,n,st,col,lw)=>{g.strokeStyle=col;g.lineWidth=lw;g.beginPath();g.moveTo(x,y);let a=rnd()*TAU;for(let k=0;k<n;k++){a+=rr(-.7,.7);x+=Math.cos(a)*st;y+=Math.sin(a)*st;g.lineTo(x,y);}g.stroke();};
  for(let k=0;k<7;k++)line(rnd()*w,rnd()*h,16,rr(8,16),'rgba(18,17,16,.55)',rr(1.4,3.2));   // sealed cracks
  for(let k=0;k<26;k++)line(rnd()*w,rnd()*h,7,rr(5,10),'rgba(25,24,22,.4)',1);             // hairline cracks
  {const cx=380,cy=380;for(let k=0;k<40;k++)line(cx+rr(-50,50),cy+rr(-40,40),3,rr(5,9),'rgba(25,24,22,.45)',1);}   // a patch of alligator cracking
  for(let k=0;k<5;k++){g.fillStyle='rgba(140,132,118,.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(30,80),rr(10,30),rnd()*3,0,7);g.fill();}},true)});
M.gravel=ground('#b6a283',5200,.13,(g,w,h)=>{for(let k=0;k<160;k++){const r=rr(1,3.2);g.fillStyle=pick(['#cfc3ad','#8f7f68','#a8977c','#d9cfbd','#7d6e5b']);g.beginPath();g.ellipse(rnd()*w,rnd()*h,r,r*.8,rnd()*3,0,7);g.fill();}},256);
// ---------- the street surfaces from one smooth distance field D: D = HW on the curb line. Bands: asphalt (D<HW), rolled curb, parkway,
// sidewalk, lawn. Streets, bulbs and the four arterial edges are blended with a smooth minimum, which rounds every corner.
const FH=.5,FX0=B.x0-1.25,FZ0=B.z0-1.25,FNX=Math.round((B.x1-B.x0+2.5)/FH)+1,FNZ=Math.round((B.z1-B.z0+2.5)/FH)+1,FN=FNX*FNZ;
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const DF=new Float32Array(FN).fill(99),TMP=new Float32Array(FN);
{const RM=17;
 const raster=(st,bl)=>{TMP.fill(99);const p=st.p;
   for(let i=0;i<p.length-1;i+=2){const a=p[i],b=p[Math.min(p.length-1,i+2)],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;
     const i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-RM-FX0)/FH)),i1=Math.min(FNX-1,Math.ceil((Math.max(a[0],b[0])+RM-FX0)/FH)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-RM-FZ0)/FH)),j1=Math.min(FNZ-1,Math.ceil((Math.max(a[1],b[1])+RM-FZ0)/FH));
     for(let j=j0;j<=j1;j++){const z=FZ0+j*FH;for(let ii=i0;ii<=i1;ii++){const x=FX0+ii*FH;let t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;const ex=a[0]+dx*t-x,ez=a[1]+dz*t-z,d=Math.sqrt(ex*ex+ez*ez),o=j*FNX+ii;if(d<TMP[o])TMP[o]=d;}}}
   if(bl){const c=bl.c,r=RB-HW+RM,i0=Math.max(0,Math.floor((c[0]-r-FX0)/FH)),i1=Math.min(FNX-1,Math.ceil((c[0]+r-FX0)/FH)),j0=Math.max(0,Math.floor((c[1]-r-FZ0)/FH)),j1=Math.min(FNZ-1,Math.ceil((c[1]+r-FZ0)/FH));
     for(let j=j0;j<=j1;j++)for(let ii=i0;ii<=i1;ii++){const o=j*FNX+ii,d=Math.hypot(FX0+ii*FH-c[0],FZ0+j*FH-c[1])-(RB-HW);TMP[o]=smin(TMP[o],d,6);}}
   for(let o=0;o<FN;o++)if(TMP[o]<98)DF[o]=smin(DF[o],TMP[o],7);};
 raster(S.IW);raster(S.MN);raster(S.SG,BULB[0]);raster(S.MS,BULB[1]);
 for(let j=0;j<FNZ;j++)for(let i=0;i<FNX;i++){const o=j*FNX+i;DF[o]=smin(DF[o],HW+inset(FX0+i*FH,FZ0+j*FH),8);}}
// marching squares: closed loops round {F >= lev}; adjacent cells share edge points, saddles follow the cell centre
const NXT=new Int32Array(2*FN),EX=new Float32Array(2*FN),EZ=new Float32Array(2*FN);
function contours(F,lev){NXT.fill(-1);
  const ptH=(i,j)=>{const id=j*FNX+i,a=F[id],b=F[id+1],t=(lev-a)/(b-a);EX[id]=FX0+(i+t)*FH;EZ[id]=FZ0+j*FH;return id;},
    ptV=(i,j)=>{const id=FN+j*FNX+i,a=F[j*FNX+i],b=F[(j+1)*FNX+i],t=(lev-a)/(b-a);EX[id]=FX0+i*FH;EZ[id]=FZ0+(j+t)*FH;return id;};
  for(let j=0;j<FNZ-1;j++)for(let i=0;i<FNX-1;i++){const o=j*FNX+i,cr=[F[o]>=lev,F[o+1]>=lev,F[o+FNX+1]>=lev,F[o+FNX]>=lev];
    if(cr[0]===cr[1]&&cr[1]===cr[2]&&cr[2]===cr[3])continue;
    const E=e=>e===0?ptH(i,j):e===1?ptV(i+1,j):e===2?ptH(i,j+1):ptV(i,j),en=[],ex=[];
    for(let e=0;e<4;e++){const p=cr[e],q=cr[(e+1)%4];if(p!==q)(p?ex:en).push(e);}
    if(en.length===1)NXT[E(en[0])]=E(ex[0]);
    else{const ctr=(F[o]+F[o+1]+F[o+FNX+1]+F[o+FNX])/4>=lev;
      for(const a of en){let b=-1;if(!ctr){for(let s=1;s<4;s++)if(ex.indexOf((a+s)%4)>=0){b=(a+s)%4;break;}}else{for(let s=1;s<4;s++)if(ex.indexOf((a+4-s)%4)>=0){b=(a+4-s)%4;break;}}NXT[E(a)]=E(b);}}}
  const loops=[];for(let id=0;id<2*FN;id++){if(NXT[id]<0)continue;const L0=[];let c=id;while(c>=0&&NXT[c]>=0){L0.push([EX[c],EZ[c]]);const n=NXT[c];NXT[c]=-1;c=n;}if(L0.length>3)loops.push(simp(L0,.035));}
  return loops;}
// drop points that stay within eps of the chord (closed loop)
function simp(P,eps){const o=[P[0]];let a=0;
  for(let i=1;i<P.length;i++){const b=(i+1)%P.length,A=P[a],Bp=P[b],dx=Bp[0]-A[0],dz=Bp[1]-A[1],l=Math.hypot(dx,dz)||1;let ok=l<6;
    if(ok)for(let j=a+1;j<=i;j++){if(Math.abs((P[j][0]-A[0])*dz-(P[j][1]-A[1])*dx)/l>eps){ok=false;break;}}
    if(!ok){o.push(P[i]);a=i;}}return o;}
const area=P=>{let s=0;for(let i=0,j=P.length-1;i<P.length;j=i++)s+=(P[j][0]-P[i][0])*(P[j][1]+P[i][1]);return s/2;};
// triangulate a region (outer loops with the loops inside them as holes), faces turned up
function region(outer,inner){const out=[];for(const A of outer){if(Math.abs(area(A))<1)continue;const holes=inner.filter(h=>pip(A,h[0][0],h[0][1]));
    const V=A.concat(...holes),f=T.ShapeUtils.triangulateShape(A.map(p=>new T.Vector2(p[0],p[1])),holes.map(h=>h.map(p=>new T.Vector2(p[0],p[1]))));
    const tris=f.map(t=>{const a=V[t[0]],b=V[t[1]],c=V[t[2]];return(b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1])>0?[t[0],t[1],t[2]]:[t[0],t[2],t[1]];});
    out.push({V,tris,nA:A.length});}return out;}
function emitG(mat,R,y,rep){const Bt=bat(mat,0,0);for(const r of R){const k0=Bt.p.length/3;for(const p of r.V){Bt.p.push(p[0],y,p[1]);Bt.n.push(0,1,0);Bt.u.push(p[0]/rep,p[1]/rep);}for(const t of r.tris)Bt.i.push(k0+t[0],k0+t[1],k0+t[2]);}}
{const ND=new Float32Array(FN);for(let j=0;j<FNZ;j++)for(let i=0;i<FNX;i++){const o=j*FNX+i,x=FX0+i*FH,z=FZ0+j*FH;ND[o]=inset(x,z)>0?-DF[o]:-99;}
 const asph=contours(ND,-HW),L1=contours(DF,HW),L2=contours(DF,HW+CB),L3=contours(DF,HW+CB+PKW),L4=contours(DF,WR);
 emitG(M.hoodRoad,region(asph,[]),YR,19);
 emitG(M.grass,region(L2,L3),PADY,8);emitG(M.walk,region(L3,L4),PADY,6);emitG(M.grass,region(L4,[]),PADY,8);
 // rolled curb: from the gutter (street level) up to the parkway, light concrete with a dirty gutter line; baked per chunk
 for(const r of region(L1,L2)){const V=r.V;for(const t of r.tris){const P=t.map(q=>V[q]),hi=t.map(q=>q>=r.nA),cx=(P[0][0]+P[1][0]+P[2][0])/3,cz=(P[0][1]+P[1][1]+P[2][1])/3,Bt=bat(M.flat,cx,cz),k=Bt.p.length/3;
   for(let q=0;q<3;q++){Bt.p.push(P[q][0],hi[q]?PADY+.004:YR+.002,P[q][1]);Bt.n.push(0,1,0);const c=hi[q]?0xc9c4b9:0x8f8a80;Bt.c.push((c>>16&255)/255,(c>>8&255)/255,(c&255)/255);Bt.u.push(WU,WV);}Bt.i.push(k,k+1,k+2);}}
 HOOD.asph=asph;HOOD.walk=[L3,L4];}
// ---------- things at any angle. strips(): cover a convex polygon (world x,z) with axis-aligned boxes 'step' wide across its longer side
function strips(P,h,kind,step,y0){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  const ax=x1-x0>=z1-z0,a0=ax?x0:z0,a1=ax?x1:z1,n=Math.max(1,Math.round((a1-a0)/step)),out=[];
  for(let k=0;k<n;k++){const a=lerp(a0,a1,k/n),b=lerp(a0,a1,(k+1)/n),m=(a+b)/2;let lo=1e9,hi=-1e9;
    for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],pa=ax?p[0]:p[1],qa=ax?q[0]:q[1];if((pa-m)*(qa-m)>0||pa===qa)continue;const v=lerp(ax?p[1]:p[0],ax?q[1]:q[0],(m-pa)/(qa-pa));lo=Math.min(lo,v);hi=Math.max(hi,v);}
    if(hi-lo<.02)continue;out.push(ax?solid(m,(lo+hi)/2,b-a,hi-lo,h,y0||0,kind):solid((lo+hi)/2,m,hi-lo,b-a,h,y0||0,kind));}
  return out;}
const upTri=(mat,a,b,c,col)=>{if((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0)triC(mat,a,b,c,0,1,0,col);else triC(mat,a,c,b,0,1,0,col);};
// a flat polygon (world [x,z] points, convex or a fan from the first point) in a global ground material, world-aligned uv
function groundPoly(mat,P,y,rep){const Bt=bat(mat,0,0),k0=Bt.p.length/3;for(const p of P){Bt.p.push(p[0],y,p[1]);Bt.n.push(0,1,0);Bt.u.push(p[0]/rep,p[1]/rep);}
  for(let i=1;i<P.length-1;i++){const a=P[0],b=P[i],c=P[i+1];if((b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1])>0)Bt.i.push(k0,k0+i,k0+i+1);else Bt.i.push(k0,k0+i+1,k0+i);}}
// soft contact shadow along the edges of a convex footprint
function shadePoly(P,y,r){const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length;y+=.012;
  for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],ex=q[0]-p[0],ez=q[1]-p[1],l=Math.hypot(ex,ez)||1;let nx=-ez/l,nz=ex/l;if(nx*((p[0]+q[0])/2-cx)+nz*((p[1]+q[1])/2-cz)<0){nx=-nx;nz=-nz;}
    const a=[p[0],y,p[1]],b=[q[0],y,q[1]],c=[q[0]+nx*r,y,q[1]+nz*r],d=[p[0]+nx*r,y,p[1]+nz*r];
    if((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0)quadC(M.shade,a,b,c,d,0,1,0,0,.53,.02,.97,.98);else quadC(M.shade,b,a,d,c,0,1,0,0,.53,.02,.97,.98);}}
// block wall / wooden gate / iron fence from (ax,az) to (bx,bz), at any angle
function anyWall(ax,az,bx,bz,h,tint,cell,thick){const L0=Math.hypot(bx-ax,bz-az);if(L0<.25)return;const ux=(bx-ax)/L0,uz=(bz-az)/L0,nx=-uz,nz=ux,t=(thick||.2)/2,cu=cuv(CI[cell]),seg=cell==='barn'?4:8,n=Math.max(1,Math.round(L0/seg)),v1=cu[1]+(cu[3]-cu[1])*Math.min(h,4)/4;
  anchor((ax+bx)/2,(az+bz)/2,()=>{for(let k=0;k<n;k++){const f0=k/n,f1=(k+1)/n,p0=[ax+ux*L0*f0,az+uz*L0*f0],p1=[ax+ux*L0*f1,az+uz*L0*f1],uw=Math.min(1,L0/n/seg),uv=[cu[0],cu[1],cu[0]+(cu[2]-cu[0])*uw,v1];
      const A=[p0[0]+nx*t,0,p0[1]+nz*t],Bq=[p1[0]+nx*t,0,p1[1]+nz*t],A2=[p0[0]-nx*t,0,p0[1]-nz*t],B2=[p1[0]-nx*t,0,p1[1]-nz*t];
      quadUV(M.wall,A,Bq,[Bq[0],h,Bq[2]],[A[0],h,A[2]],nx,0,nz,tint,uv);quadUV(M.wall,B2,A2,[A2[0],h,A2[2]],[B2[0],h,B2[2]],-nx,0,-nz,shade(tint,.95),uv);}
    const ct=shade(tint,cell==='barn'?.78:.9),o=t+(cell==='barn'?0:.035),e=cell==='barn'?0:.035,q0=[ax-ux*e,az-uz*e],q1=[bx+ux*e,bz+uz*e];
    upTri(M.flat,[q0[0]+nx*o,h,q0[1]+nz*o],[q1[0]+nx*o,h,q1[1]+nz*o],[q1[0]-nx*o,h,q1[1]-nz*o],ct);upTri(M.flat,[q0[0]+nx*o,h,q0[1]+nz*o],[q1[0]-nx*o,h,q1[1]-nz*o],[q0[0]-nx*o,h,q0[1]-nz*o],ct);
    for(const s of [[ax,az,-1],[bx,bz,1]])quadC(M.flat,[s[0]-nx*t,0,s[1]-nz*t],[s[0]+nx*t,0,s[1]+nz*t],[s[0]+nx*t,h,s[1]+nz*t],[s[0]-nx*t,h,s[1]-nz*t],ux*s[2],0,uz*s[2],shade(tint,.86));});
  strips([[ax-nx*t,az-nz*t],[bx-nx*t,bz-nz*t],[bx+nx*t,bz+nz*t],[ax+nx*t,az+nz*t]],h+.05,0,1.6);}
// wrought-iron fence or gate: posts, rails and pickets
function ironFence(ax,az,bx,bz,h,col){const L0=Math.hypot(bx-ax,bz-az);if(L0<.2)return;const ry=Math.atan2(bx-ax,bz-az),n=Math.max(2,Math.round(L0/.13)),cx=(ax+bx)/2,cz=(az+bz)/2;col=col===undefined?0x1b1b1c:col;
  anchor(cx,cz,()=>{for(const y of [.1,h-.12])put(M.flat,GEO.box,cx,y,cz,ry,.04,.04,L0,col);
    for(let k=0;k<=n;k++){const f=k/n,x=lerp(ax,bx,f),z=lerp(az,bz,f),post=k===0||k===n;put(M.flat,GEO.box,x,0,z,ry,post?.08:.022,post?h+.08:h,post?.08:.022,col);if(!post&&k%2)put(M.flat,GEO.cone4,x,h,z,ry,.03,.09,.03,col);}});
  const nx=-(bz-az)/L0*.05,nz=(bx-ax)/L0*.05;strips([[ax-nx,az-nz],[bx-nx,bz-nz],[bx+nx,bz+nz],[ax+nx,az+nz]],h,0,1.6);}
// a 02a house template at any angle; on lots that are nearly on the grid the 02a builder itself places it
const stuccoW=[0xf3ece0,0xf1e7d4,0xeee3cb,0xeadfcc,0xe9d9c1,0xefdcc0,0xe6d4b2,0xf4efe6,0xdcc8a6,0xe8c6a4],roofRO=[0xb5583a,0xb0533c,0xb86a48,0xa14a33,0x9c5a40,0xa86650,0xb06040,0x94786a];
const toW=(h,lx,lz)=>{const c=Math.cos(h.ry),s=Math.sin(h.ry);return[h.x+lx*c+lz*s,h.z-lx*s+lz*c];};
function anyHouse(h,tint,roof){const H=HT[h.k],q=h.ry/(PI/2),r=Math.round(q);
  const snap=Math.abs(q-r)<.045;if(snap)h.ry=r*PI/2;
  h.foot=H.boxes.map(b=>[toW(h,b[0]-b[2]/2,b[1]-b[3]/2),toW(h,b[0]+b[2]/2,b[1]-b[3]/2),toW(h,b[0]+b[2]/2,b[1]+b[3]/2),toW(h,b[0]-b[2]/2,b[1]+b[3]/2)]);
  if(snap){house(h.x,h.z,((r%4)+4)%4,h.k,tint,roof);return;}
  put(M.wall,H.wall,h.x,0,h.z,h.ry,1,1,1,tint);put(M.wall,H.roof,h.x,0,h.z,h.ry,1,1,1,roof);
  H.boxes.forEach((b,i)=>strips(h.foot[i],b[4],0,1));anchor(h.x,h.z,()=>shadePoly(h.foot[0],PADY,1));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of h.foot[0]){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  buildings.push({x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,h:H.st*2.85,flat:false});}

M.gravelO=M.gravel.clone();M.gravelO.polygonOffsetFactor=M.gravelO.polygonOffsetUnits=-2;
// small props, baked with put(): a young street tree on two stakes, a post mailbox, a cobra-head light on a concrete pole, wheeled bins
function youngTree(x,z,s){s=s||1;anchor(x,z,()=>{put(M.flat,GEO.tube6,x,PADY,z,0,.05*s,2.3*s,.05*s,0x6e5c4a);for(const e of [-1,1])put(M.flat,GEO.box,x+e*.32,PADY,z,0,.05,1.9,.05,0xb49a74);
  put(M.flat,GEO.box,x,1.45,z,0,.66,.04,.04,0x3a3128);const g=pick([0x6f8f45,0x7a9a4c,0x8a9a52,0x66884a]);put(M.flat,GEO.sphLo,x,2.35*s+.2,z,rnd()*3,.72*s,.62*s,.72*s,g);put(M.flat,GEO.sphLo,x+.25,2.05*s+.2,z-.15,rnd()*3,.45*s,.4*s,.45*s,shade(g,.9));});solid(x,z,.2,.2,2.4,0,0);}
function postBox(x,z,ry,col,deco){anchor(x,z,()=>{const c=Math.cos(ry),sn=Math.sin(ry);put(M.flat,GEO.box,x,PADY,z,ry,.1,1.05,.1,col);put(M.flat,GEO.box,x,PADY,z,ry,.3,.05,.3,shade(col,.92));
  put(M.flat,GEO.box,x,1.05+PADY,z,ry,.26,.26,.46,col);put(M.flat,GEO.cyl8,x,1.31+PADY,z,ry,.13,.04,.23,shade(col,.95),0,PI/2);
  if(deco){put(M.flat,GEO.box,x,1.42+PADY,z,ry,.32,.05,.52,col);put(M.flat,GEO.cone4,x,1.47+PADY,z,ry+PI/4,.26,.16,.26,col);put(M.flat,GEO.box,x,.55+PADY,z,ry,.14,.06,.3,col);}});solid(x,z,.32,.32,1.4,0,5);}
function cobra(x,z,ry){anchor(x,z,()=>{const c=Math.sin(ry),s=Math.cos(ry);put(M.flat,GEO.taper,x,PADY,z,0,.17,8.6,.17,0xb8b3a8);put(M.flat,GEO.cyl8,x,PADY,z,0,.24,.5,.24,0xa9a49a);
  put(M.flat,GEO.rod,x,8.25,z,ry,.05,2.5,.05,0x9aa0a0,PI/2-.14);put(M.flat,GEO.box,x+c*2.55,8.47,z+s*2.55,ry,.42,.16,.82,0x8c9396);put(M.flat,GEO.box,x+c*2.55,8.38,z+s*2.55,ry,.32,.04,.58,0xf6efcf);});solid(x,z,.36,.36,8.6,0,0);}
function bins(x,z,ry){const cs=[0x2b2d2c,0x2f6a3a,0x2d4f8a],c=Math.cos(ry),s=Math.sin(ry);anchor(x,z,()=>{for(let k=0;k<2+(rnd()<.4?1:0);k++){const o=(k-1)*.85;put(M.flat,GEO.box,x+c*o,YR,z-s*o,ry+rr(-.2,.2),.62,1.02,.7,cs[k%3]);}});}
function agave(x,z,s){anchor(x,z,()=>{for(let k=0;k<9;k++){const a=k/9*TAU+rr(-.2,.2);put(M.flat,GEO.cone4,x+Math.sin(a)*.12*s,PADY,z+Math.cos(a)*.12*s,a,.09*s,rr(.7,1)*s,.03*s,0x7d9878,rr(.55,.9),0);}});}
function cactus(x,z){anchor(x,z,()=>{put(M.flat,GEO.sph,x,PADY+.22,z,0,.32,.36,.32,0x5d7d3c);put(M.flat,GEO.sph,x,PADY+.52,z,0,.08,.05,.08,0xd8a03a);});}
function boulder(x,z,s){anchor(x,z,()=>put(M.flat,GEO.sphLo,x,PADY,z,rnd()*3,.55*s,.36*s,.42*s,pick([0x8f8370,0x9a8e78,0x7f7564])));}
// a parked car at any angle (a destructible like the others: its collider is the box round its footprint)
function anyCar(x,z,ry,type,col,lite,y){type=type||carType();const r=vehicle(type,x,z,false,col===undefined?pick(carCols):col,1,lite,false,ry,y);const V=VEH[type],c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));
  if(y)anchor(x,z,()=>blob(x,z,(c*V.wid+s*V.len)*.62,(s*V.wid+c*V.len)*.62,PADY));
  const k=solid(x,z,(c*V.wid+s*V.len)*.86,(s*V.wid+c*V.len)*.86,type==='van'?1.9:type==='pickup'||type==='suv'||type==='minivan'?1.6:1.42,0,2);k.hp=260;k.ref=r;cars.push(k);return k;}
// ---------- the lots: house, driveway with its apron over the parkway, front walk, lawn, yard life
const curbHit=(l,p)=>{const f=l.bulb?((x,z)=>Math.hypot(x-l.bulb.c[0],z-l.bulb.c[1])-(RB-HW)):((x,z)=>near(S[l.k],x,z).d);if(f(p[0]-l.nx*6,p[1]-l.nz*6)>HW+CB+.05)return null;let a=0,b=6;for(let q=0;q<14;q++){const m=(a+b)/2;if(f(p[0]-l.nx*m,p[1]-l.nz*m)>HW+CB+.05)a=m;else b=m;}return[p[0]-l.nx*a,p[1]-l.nz*a];};
const DRIVE=[];
for(const l of LOTS){if(l.start)continue;const h=l.house,W=(u,v)=>wor(l,u,v),A=[loc(l,l.F0),loc(l,l.R0)],Bq=[loc(l,l.F1),loc(l,l.R1)],ry=Math.atan2(-l.nx,-l.nz);
  const sideU=v=>{const a=uAt(A,v),b=uAt(Bq,v);return[Math.min(a,b),Math.max(a,b)];};
  if(!h){// a corner lot without a house: lawn, a couple of big trees, shrubs along its walls
    const c=W((sideU(6)[0]+sideU(6)[1])/2,Math.min(12,(l.d0+l.d1)/4));trees.push([c[0],c[1],rr(1.05,1.3),pick([0,2,3,0,4])]);for(let k=0;k<4;k++){const p=W(rr(sideU(4)[0]+2,sideU(4)[1]-2),rr(3,8));shrubs.push([p[0],p[1],rr(.6,1)]);}
    if(rnd()<.6){const p=W(rr(sideU(3)[0]+2,sideU(3)[1]-2),-2.15);youngTree(p[0],p[1]);}continue;}
  const H=HT[h.k];anyHouse(h,pick(stuccoW),pick(roofRO));
  const ug=h.uc+H.gar[0],vg=h.vc-H.gar[1],ud=h.uc+H.door[0],vd=h.vc-H.door[1];
  const d0=W(ug-2.9,vg),d1=W(ug+2.9,vg),f0=W(ug-2.9,0),f1=W(ug+2.9,0),c0=curbHit(l,W(ug-3.7,0)),c1=curbHit(l,W(ug+3.7,0));
  groundPoly(M.walkO,[d0,d1,f1,f0],PADY+.003,6);if(c0&&c1){groundPoly(M.walkO,[f0,f1,c1,c0],PADY+.003,6);DRIVE.push([(c0[0]+c1[0])/2,(c0[1]+c1[1])/2,ug,l]);}
  {const vw=Math.min(vd,vg)-1.1,e=ud<ug?ug-2.9:ug+2.9;groundPoly(M.walkO,[W(ud-.6,vd),W(ud+.6,vd),W(ud+.6,vw),W(ud-.6,vw)],PADY+.003,6);
   if(Math.abs(ud-e)>.8)groundPoly(M.walkO,[W(Math.min(ud,e),vw+.55),W(Math.max(ud,e),vw+.55),W(Math.max(ud,e),vw-.55),W(Math.min(ud,e),vw-.55)],PADY+.003,6);}
  // lawn: lush, patchy or gravel with succulents
  const su=sideU(h.set*.5),yards=[[su[0]+.3,ug-3.1],[ug+3.1,su[1]-.3]].filter(q=>q[1]-q[0]>1.2),lt=rnd();
  if(lt>.6&&lt<.84){for(let k=0;k<rr(2,4.5);k++){const y=pick(yards);if(!y)break;const pu=rr(y[0]+.8,y[1]-.8),pv=rr(1,h.set-1.2),R0=rr(.45,1.25),P=[];for(let q=0;q<8;q++){const a=q/8*TAU,r=R0*rr(.6,1.15);P.push(W(pu+Math.cos(a)*r,pv+Math.sin(a)*r*.8));}groundPoly(M.dryO,P,PADY+.0025,6);}}
  else if(lt>=.84){for(const y of yards){groundPoly(M.gravelO,[W(y[0],.25),W(y[1],.25),W(y[1],h.set-.35),W(y[0],h.set-.35)],PADY+.0025,6);
      for(let k=0;k<Math.max(1,Math.round((y[1]-y[0])/3));k++){const p=W(rr(y[0]+.6,y[1]-.6),rr(.9,h.set-1.2)),t=rnd();if(t<.4)agave(p[0],p[1],rr(.8,1.2));else if(t<.65)cactus(p[0],p[1]);else boulder(p[0],p[1],rr(.6,1.2));}}}
  // shrubs along the front, a tree in the yard, the street tree and the mailbox in the parkway
  for(let k=0;k<3;k++)if(rnd()<.7){const y=pick(yards),pu=rr(y[0]+.5,y[1]-.5),p=W(pu,h.set-.75);shrubs.push([p[0],p[1],rr(.5,.9)]);}
  if(rnd()<.42&&yards.length){const y=yards[yards.length>1&&rnd()<.5?1:0],p=W(rr(y[0]+1.6,y[1]-1.6),rr(2.4,Math.max(2.6,h.set-2.6)));if(rnd()<.08)fans.push([p[0],p[1],rr(9,14)]);else trees.push([p[0],p[1],rr(.75,1.05),pick([0,2,3,6,0,2,1])]);}
  {const su0=sideU(0),pu=ug>(su0[0]+su0[1])/2?Math.max(su0[0]+2,ug-7):Math.min(su0[1]-2,ug+7);if(rnd()<.62){const p=W(pu,-2.15);youngTree(p[0],p[1],rr(.85,1.1));}}
  if(rnd()<.86){const s=ud<ug?-1:1,p=W(ug+s*3.95,-2.75);postBox(p[0],p[1],ry+(s<0?0:0),rnd()<.5?0x1d1d1e:0xf1efe8,rnd()<.25);}
  if(rnd()<.4){const s=ud<ug?1:-1,p=W(ug+s*4.3,-(SWK+PKW+CB+.45));bins(p[0],p[1],ry);}
  // cars in the driveway (nose to the garage), the odd one at the curb
  if(rnd()<.5){const two=rnd()<.35,o=two?1.45:rr(-.5,.5);for(const e of two?[-1,1]:[0]){const p=W(ug+o*e,vg-2.75-rr(0,.6));anyCar(p[0],p[1],ry+rr(-.04,.04),undefined,undefined,2);}}
  else if(rnd()<.12){const p=W(ug+(ud<ug?6.5:-6.5),-(SWK+PKW+CB+1.3));anyCar(p[0],p[1],ry+PI/2+(rnd()<.5?PI:0),undefined,undefined,1);}
  if(rnd()<.13){const p=W(ug,vg+.05),fa=ry;anchor(p[0],p[1],()=>{put(M.flat,GEO.box,p[0]+Math.sin(fa)*.25,3.05,p[1]+Math.cos(fa)*.25,fa,1.2,.8,.06,0xf4f1ea);put(M.flat,GEO.tube8,p[0]+Math.sin(fa)*.55,3.1,p[1]+Math.cos(fa)*.55,0,.23,.04,.23,0xd8412f);});}
  if(rnd()<.12){const p=W(h.uc+(ud<ug?-1:1)*(H.W/2-1.6),h.vc+H.D/2-.8);dishes.push([p[0],H.st*2.85-.2,p[1],ry+PI+rr(-.5,.5)]);}
  // gates across the side yards (wood, now and then wrought iron)
}
// ---------- the start house, from the owner's reference photos (visual reference only): two stories of off-white stucco under a tall front
// gable of brown concrete tile (the long north slope sweeps down over a single-story wing), charcoal half-timber trim, the two-car garage
// in front with a row of little arched windows, a tall white wing wall and a dark pergola over the entry court, a wrought-iron gate in the
// entry, two columnar cypresses, white-bark birches on the north lot line. Local frame: x to the right as seen from the street (south),
// y up, z toward the street; the garage front is at z = 0. Nothing on it carries a number or a name.
{const l=LOTS.find(q=>q.start),SET=7.6,O=wor(l,0,SET),ry=Math.atan2(-l.nx,-l.nz),cs=Math.cos(ry),sn=Math.sin(ry);
 const P3=(x,y,z)=>[O[0]+x*cs+z*sn,y,O[1]-x*sn+z*cs],N3=(x,y,z)=>[x*cs+z*sn,y,-x*sn+z*cs],P2=(x,z)=>{const p=P3(x,0,z);return[p[0],p[2]];};
 const STU=0xfdfcf8,TRIM=0x2f3235,ROOF=0x8f5b45,WOOD=0x3d3129,GLASS=0x2c3a43,WHITE=0xf5f3ee;
 const q4=(a,b,c,d,col,uv,n)=>{const w=n.length===3?N3(n[0],n[1],n[2]):n;quadUV(M.wall,P3(...a),P3(...b),P3(...c),P3(...d),w[0],w[1],w[2],col,uv||WUV);};
 const tri=(a,b,c,ua,ub,uc,n,col)=>{const A=P3(...a),Bt=bat(M.wall,A[0],A[2]),k=Bt.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255,w=N3(n[0],n[1],n[2]);
   for(const p of [A,P3(...b),P3(...c)]){Bt.p.push(p[0],p[1],p[2]);Bt.n.push(w[0],w[1],w[2]);Bt.c.push(r,g,bl);}Bt.u.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);Bt.i.push(k,k+1,k+2);};
 // plain box in the house frame (no bottom)
 const lbox=(x0,x1,y0,y1,z0,z1,col)=>{q4([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col,null,[0,0,1]);q4([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col,null,[0,0,-1]);
   q4([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],shade(col,.93),null,[1,0,0]);q4([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],shade(col,.93),null,[-1,0,0]);q4([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],col,null,[0,1,0]);};
 // a board between two points of the house frame (cross-section w x h, h measured square to the board in its vertical plane)
 const board=(a,b,w,h,col)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L0=Math.hypot(dx,dy,dz),wp=P3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),yaw=ry+Math.atan2(dx,dz)-PI/2,pit=Math.atan2(dy,Math.hypot(dx,dz));
   put(M.flat,GEO.box,wp[0],wp[1]-h/2,wp[2],yaw,L0,h,w,col,0,pit);};
 // a stucco wall in the plane z=k (ax 'z') or x=k (ax 'x'), from a0 to a1 along it, from y0 up to top(a); 4 m atlas cells, cells listed per row
 function wall(ax,k,a0,a1,y0,top,out,rows,tint,breaks){const right=ax==='z'?out>0:out<0,n=ax==='z'?[0,0,out]:[out,0,0],cuts=[a0];
   for(let a=a0+4;a<a1-.05;a+=4)cuts.push(a);for(const b of breaks||[])if(b>a0+.05&&b<a1-.05)cuts.push(b);cuts.push(a1);cuts.sort((p,q)=>p-q);
   const pt=(a,y)=>ax==='z'?[a,y,k]:[k,y,a];
   for(let c=0;c<cuts.length-1;c++){const c0=cuts[c],c1=cuts[c+1],t0=top(c0),t1=top(c1);
     for(let r=0;y0+r*2.85<Math.max(t0,t1)-.02;r++){const yb=y0+r*2.85,yt=yb+2.85,rl=rows[Math.min(r,rows.length-1)]||['stucco'],cu=cuv(CI[rl[c%rl.length]]);
       // the column trapezoid clipped to yb..yt
       let P=[[c0,y0],[c1,y0],[c1,t1],[c0,t0]];const clip=(P,yv,keepAbove)=>{const o=[];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],pin=keepAbove?p[1]>=yv:p[1]<=yv,qin=keepAbove?q[1]>=yv:q[1]<=yv;
           if(pin)o.push(p);if(pin!==qin){const t=(yv-p[1])/(q[1]-p[1]);o.push([lerp(p[0],q[0],t),yv]);}}return o;};
       P=clip(clip(P,yb,true),yt,false);if(P.length<3)continue;
       const uv=p=>{const fu=right?(p[0]-c0)/4:(c1-p[0])/4,fv=(p[1]-yb)/4;return[cu[0]+(cu[2]-cu[0])*fu,cu[1]+(cu[3]-cu[1])*fv];};
       for(let i=1;i<P.length-1;i++){let a=P[0],b=P[i],d=P[i+1];if(!right){const t=b;b=d;d=t;}tri(pt(a[0],a[1]),pt(b[0],b[1]),pt(d[0],d[1]),uv(a),uv(b),uv(d),n,ax==='x'?shade(tint,.95):tint);}}}}
 // the roof: ridge at x=3.55, 9.0 m; the south slope (47 deg) to the eave over the two-story box, the long north slope (34 deg) down over the wing
 const XR=3.55,YRg=9.0,TS=1.07,TN=.667,yS=x=>YRg-(x-XR)*TS,yN=x=>YRg-(XR-x)*TN,roofY=x=>x>XR?yS(x):yN(x),ZF=.45,ZB=-10.45;
 const tile=cuv(CI.tile);
 function slope(xe,xr,z0,z1,sMin){const run=Math.abs(xr-xe),rise=Math.abs(roofY(xr)-roofY(xe)),SL=Math.hypot(run,rise),dirx=Math.sign(xr-xe),nrm=[-dirx*rise/SL,run/SL,0];
   const zc=[z0];for(let z=z0+4;z<z1-.05;z+=4)zc.push(z);zc.push(z1);
   for(let i=0;i<zc.length-1;i++)for(let s0=sMin||0;s0<SL-.02;s0+=4){const s1=Math.min(SL,s0+4),pa=s=>[xe+dirx*run*s/SL,roofY(xe)+rise*s/SL],A=pa(s0),Bp=pa(s1),uw=(zc[i+1]-zc[i])/4,vh=(s1-s0)/4;
     const du=tile[2]-tile[0],dv=tile[3]-tile[1],uv=[tile[0],tile[1],tile[0]+du*uw,tile[1],tile[0]+du*uw,tile[1]+dv*vh,tile[0],tile[1]+dv*vh];
     // tiles face up; on the right-hand (south) slope the eave edge runs to +z on the left as seen from the eave
     const a=[A[0],A[1],zc[dirx<0?i+1:i]],b=[A[0],A[1],zc[dirx<0?i:i+1]],c=[Bp[0],Bp[1],zc[dirx<0?i:i+1]],d=[Bp[0],Bp[1],zc[dirx<0?i+1:i]];
     q4(a,b,c,d,ROOF,uv,nrm);q4(b,a,d,c,shade(ROOF,.55),null,[-nrm[0],-nrm[1],0]);}}
 anchor(O[0],O[1],()=>{
  slope(6.85,XR,ZB,ZF);                                   // south slope
  slope(-6.6,XR,ZB,-3.2);slope(-6.6,XR,-3.2,ZF,Math.hypot(3.6,3.6*TN));   // north slope: over the wing, and in front only from the wing wall up
  board([XR,YRg+.06,ZB],[XR,YRg+.06,ZF],.3,.14,shade(ROOF,.75));
  for(const e of [[[6.85,yS(6.85),ZF],[XR,YRg,ZF]],[[XR,YRg,ZF],[-3.0,yN(-3.0),ZF]],[[-3.0,yN(-3.0),-3.2],[-6.6,yN(-6.6),-3.2]],[[6.85,yS(6.85),ZB],[XR,YRg,ZB]],[[XR,YRg,ZB],[-6.6,yN(-6.6),ZB]]])
    board([e[0][0],e[0][1]+.02,e[0][2]+.03],[e[1][0],e[1][1]+.02,e[1][2]+.03],.07,.24,TRIM);
  board([-3.0,yN(-3.0)-.1,ZF],[-3.0,yN(-3.0)-.1,-3.2],.07,.2,TRIM);board([6.85,yS(6.85)-.1,ZF],[6.85,yS(6.85)-.1,ZB],.07,.2,TRIM);board([-6.6,yN(-6.6)-.1,-3.2],[-6.6,yN(-6.6)-.1,ZB],.07,.2,TRIM);
  // walls: the two-story box x -1.9..6.1, z -10..0; the wing x -6.2..-1.9, z -10..-3.6; the tall wing wall (pillar) x -3..-1.9
  const gT=x=>roofY(x)-.1;
  wall('z',0,-1.9,6.1,2.6,gT,1,[['stucco'],['stucco']],STU,[XR]);               // front, above the garage and the entry
  {const cu=cuv(CI.garage),v1=cu[1]+(cu[3]-cu[1])*2.6/4;q4([-.35,0,0],[6.1,0,0],[6.1,2.6,0],[-.35,2.6,0],STU,[cu[0],cu[1],cu[2],v1],[0,0,1]);}
  wall('x',6.1,-10,0,0,()=>yS(6.1)-.1,1,[['hwin','stucco','stucco'],['stucco','hwin','stucco'],['stucco']],STU);
  wall('z',-10,-1.9,6.1,0,gT,-1,[['hwin','stucco'],['hwin','stucco']],STU,[XR]);
  wall('x',-1.9,-3.6,-.6,0,()=>yN(-1.9)-.1,-1,[['stucco']],STU);
  wall('z',-3.6,-6.2,-1.9,0,gT,1,[['hwinW','stucco']],STU);wall('x',-6.2,-10,-3.6,0,()=>yN(-6.2)-.1,-1,[['stucco','hwin']],STU);wall('z',-10,-6.2,-1.9,0,gT,-1,[['stucco','hwin']],STU);
  wall('z',.3,-3.0,-1.9,0,()=>4.55,1,[['stucco'],['stucco']],STU);wall('x',-3.0,-.6,.3,0,()=>4.55,-1,[['stucco'],['stucco']],STU);wall('x',-1.9,-.6,.3,0,()=>4.55,1,[['stucco'],['stucco']],STU);wall('z',-.6,-3.0,-1.9,0,()=>4.55,-1,[['stucco'],['stucco']],STU);wall('x',-1.9,-1.6,-.6,0,()=>2.6,1,[['stucco']],STU);lbox(-3.02,-1.88,4.55,4.62,-.62,.32,shade(STU,.9));
  // the entry recess: back wall with the door, side walls, ceiling; the iron gate across it
  wall('z',-1.6,-1.9,-.35,0,()=>2.6,1,[['stucco']],STU);wall('x',-.35,-1.6,0,0,()=>2.6,-1,[['stucco']],STU);
  q4([-1.9,2.6,0],[-.35,2.6,0],[-.35,2.6,-1.6],[-1.9,2.6,-1.6],shade(STU,.8),null,[0,-1,0]);
  lbox(-1.5,-.55,0,2.12,-1.6,-1.54,0x5b3b27);lbox(-1.58,-.47,2.12,2.2,-1.6,-1.53,WHITE);lbox(-.78,-.7,1.0,1.08,-1.54,-1.5,0xc9b27a);
  // second floor: the window in its charcoal frame, the band at the floor line, the vertical boards, the vent near the peak
  lbox(-1.9,6.1,2.6,2.82,0,.07,TRIM);lbox(3.48,3.63,2.82,yS(3.63)-.15,0,.07,TRIM);lbox(5.13,5.28,2.82,yS(5.28)-.12,0,.07,TRIM);
  lbox(3.63,5.13,3.46,3.6,0,.07,TRIM);lbox(3.63,5.13,5.1,5.24,0,.07,TRIM);
  lbox(3.74,5.02,3.7,5.0,0,.05,WHITE);lbox(3.82,4.94,3.78,4.92,.03,.06,GLASS);lbox(4.36,4.4,3.78,4.92,.06,.075,WHITE);lbox(3.82,4.94,4.33,4.37,.06,.075,WHITE);
  lbox(2.86,3.36,7.5,8.12,0,.05,0x4b4a47);for(let k=0;k<5;k++)lbox(2.9,3.32,7.56+k*.11,7.6+k*.11,.05,.075,0x6c6a65);
  lbox(-1.62,-.62,3.05,4.75,0,.05,WHITE);lbox(-1.54,-.7,3.12,4.68,.03,.06,GLASS);
  // the garage door's row of little arched windows, the lantern and a blank plaque by the garage
  for(let k=0;k<8;k++){const x=.41+(k+.5)*4.94/8,y0=1.76,y1=1.96,hw=.19,z=.014;lbox(x-hw,x+hw,y0,y1,0,z,0x2a3238);
    for(let q=0;q<4;q++){const a0=PI*q/4,a1=PI*(q+1)/4;tri([x,y1,z],[x+Math.cos(a0)*hw,y1+Math.sin(a0)*.08,z],[x+Math.cos(a1)*hw,y1+Math.sin(a1)*.08,z],[WU,WV],[WU,WV],[WU,WV],[0,0,1],0x2a3238);}}
  lbox(-.24,-.04,2.1,2.44,0,.17,0x1c1c1d);lbox(-.21,-.07,2.15,2.39,.17,.18,0xf3dfa6);lbox(-.3,.04,1.62,1.8,0,.03,0x2b2b2b);
  // pergola over the entry court: two posts, two beams, rafters; the court paving and a low planter wall
  for(const z of [0,-3.4])lbox(-6.18,-5.96,0,2.62,z-.11,z+.11,WOOD);
  for(const z of [.02,-3.38])lbox(-6.45,-1.9,2.62,2.86,z-.08,z+.08,WOOD);
  for(let x=-6.25;x<-2.9;x+=.55)lbox(x-.045,x+.045,2.86,3.05,-3.8,.5,shade(WOOD,1.08));
  lbox(-6.4,-3.6,0,.55,.25,.5,STU);lbox(-6.45,-3.55,.55,.62,.22,.53,shade(STU,.88));});
 {const c=[P2(-6.2,-3.6),P2(-1.9,-3.6),P2(-1.9,.3),P2(-6.2,.3)];groundPoly(M.walkO,c,PADY+.004,3);groundPoly(M.walkO,[P2(-2.1,.3),P2(.2,.3),P2(.2,1.5),P2(-2.1,1.5)],PADY+.004,6);}
 // the driveway (wide, flaring toward the street) and its apron over the parkway
 {const d=[P2(-.3,0),P2(6.35,0),P2(6.9,SET),P2(-.75,SET)];groundPoly(M.walkO,d,PADY+.003,6);const a=P2(-.75,SET),b=P2(6.9,SET),ca=curbHit(l,P2(-1.5,SET)),cb=curbHit(l,P2(7.6,SET));if(ca&&cb)groundPoly(M.walkO,[a,b,cb,ca],PADY+.003,6);
  DRIVE.push([(a[0]+b[0])/2,(a[1]+b[1])/2,0,l]);}
 // colliders: the two-story box, the wing, the wing wall, the pergola posts, the planter wall; footprint for the map and the shadows
 const B2=[P2(-1.9,-10),P2(6.1,-10),P2(6.1,0),P2(-1.9,0)],WG=[P2(-6.2,-10),P2(-1.9,-10),P2(-1.9,-3.6),P2(-6.2,-3.6)],PL=[P2(-3,-.6),P2(-1.9,-.6),P2(-1.9,.3),P2(-3,.3)];
 strips(B2,9.2,0,.8);strips(WG,5.4,0,.8);strips(PL,4.6,0,.5);strips([P2(-6.4,.25),P2(-3.6,.25),P2(-3.6,.5),P2(-6.4,.5)],.62,5,1);
 for(const z of [0,-3.4]){const p=P2(-6.07,z);solid(p[0],p[1],.3,.3,2.7,0,0);}
 anchor(O[0],O[1],()=>{shadePoly(B2,PADY,1.1);shadePoly(WG,PADY,.9);});
 HOOD.foot.push(B2,WG);HOOD.start={x:O[0],z:O[1],ry,B2,P3,P2};
 {let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of B2.concat(WG)){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}buildings.push({x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,h:6,flat:false});}
 // gates: wrought iron across the entry and to the right of the garage; a wooden one from the wing to the north lot line
 const g1=P2(-1.9,.06),g2=P2(-.35,.06);ironFence(g1[0],g1[1],g2[0],g2[1],2.05);
 {const A=[loc(l,l.F0),loc(l,l.R0)],Bq=[loc(l,l.F1),loc(l,l.R1)],uS=Math.max(uAt(A,SET+1.4),uAt(Bq,SET+1.4)),uN=Math.min(uAt(A,SET+3.6),uAt(Bq,SET+3.6));
  const s1=P2(6.1,-1.4),s2=P2(uS,-1.4);ironFence(s1[0],s1[1],s2[0],s2[1],1.6);const n1=P2(-6.2,-3.6),n2=P2(uN,-3.6);anyWall(n1[0],n1[1],n2[0],n2[1],1.8,0xb59a78,'barn',.12);}
 // two cypresses by the entry, birches on the north lot line, shrubs, a hedge with river rock on the south line, a patchy lawn
 const cyp=(x,z,h)=>{const p=P2(x,z);anchor(p[0],p[1],()=>{put(M.flat,GEO.sph,p[0],h*.5+PADY,p[1],0,.44,h*.5,.44,0x2a4628);put(M.flat,GEO.sph,p[0],h*.3+PADY,p[1],0,.47,h*.3,.47,0x24401f);put(M.flat,GEO.cyl6,p[0],PADY,p[1],0,.1,.4,.1,0x4a3b2c);});solid(p[0],p[1],.5,.5,h,0,0);};
 cyp(-2.5,.85,4.1);cyp(-.55,.8,3.9);
 const birch=(x,z,s)=>{const p=P2(x,z);anchor(p[0],p[1],()=>{for(let k=0;k<3;k++){const a=k*2.1+rr(-.3,.3),lean=rr(.08,.16),h=rr(6,7.4)*s;put(M.flat,GEO.tube6,p[0]+Math.sin(a)*.18,PADY,p[1]+Math.cos(a)*.18,a,.075*s,h,.075*s,0xe9e5dc,lean,0);
      for(let q=0;q<4;q++){const y=rr(1,h*.8),bx=p[0]+Math.sin(a)*(.18+lean*y),bz=p[1]+Math.cos(a)*(.18+lean*y);put(M.flat,GEO.box,bx,y,bz,a,.16*s,.05,.16*s,0x3b3832);}
      for(let q=0;q<7;q++){const y=h*rr(.5,.98),r=rr(.35,.62)*s,bx=p[0]+Math.sin(a)*(.18+lean*y)+rr(-.5,.5),bz=p[1]+Math.cos(a)*(.18+lean*y)+rr(-.5,.5);put(M.flat,GEO.sphLo,bx+rr(-.6,.6),y,bz+rr(-.6,.6),rnd()*3,r,r*.6,r,pick([0xa3ad5f,0x93a356,0xb5b56a,0x8f9a52]));}}});solid(p[0],p[1],.5,.5,6,0,0);};
 birch(-9.6,5.3,1);birch(-10,1.6,.9);
 for(const q of [[-5.8,1.1,.9],[-4.6,1.0,.75],[-6.6,-.6,.8],[-6.9,-2.6,.7],[6.9,-.8,.7]]){const p=P2(q[0],q[1]);shrubs.push([p[0],p[1],q[2]]);}
 {const A=[loc(l,l.F0),loc(l,l.R0)],Bq=[loc(l,l.F1),loc(l,l.R1)];for(let v=.9;v<SET+1;v+=1.15){const u=Math.max(uAt(A,v),uAt(Bq,v))-1.1,p=wor(l,u,v);shrubs.push([p[0],p[1],rr(.55,.8)]);const r=wor(l,u-.9,v+.4);boulder(r[0],r[1],rr(.35,.55));}}
 for(const q of [[-3.5,4.2,1.3],[-6.5,6.2,1.0],[8.3,4.9,.9]]){const P=[];for(let k=0;k<8;k++){const a=k/8*TAU,r=q[2]*rr(.6,1.1);P.push(P2(q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.7));}groundPoly(M.dryO,P,PADY+.0025,6);}
 // street tree, the white post mailbox at the curb, and the two cars in the driveway (a white sedan and a silver SUV, nose to the garage)
 {const t=wor(l,-5.6,-2.15);youngTree(t[0],t[1],1);const m=wor(l,-1.35,-2.75);postBox(m[0],m[1],ry,0xf4f2ec,true);}
 {const a=P2(1.45,3.15),b=P2(4.6,2.95);anyCar(a[0],a[1],ry+.015,'sedan',0xf2f0ea,false,PADY);anyCar(b[0],b[1],ry-.01,'suv',0xb7bab9,false,PADY);}
 HOOD.spawn=(()=>{const p=P2(2.9,7.9);return[p[0],p[1],Math.atan2(l.nx,l.nz)];})();}
for(const g of GATES){if(rnd()<.72)anyWall(g[0],g[1],g[2],g[3],1.8,0xb59a78,'barn',.12);else ironFence(g[0],g[1],g[2],g[3],1.6);}
for(const w of WALLS)anyWall(w[0],w[1],w[2],w[3],1.85,w[4]==='rear'?C.greyWall:pick([C.greyWall,C.blockWall]),'wall8');
// ---------- the arterial edges: block wall with pilasters (gaps where the streets come out), street trees in the parkway
const DAT=(x,z)=>{const i=clamp(Math.round((x-FX0)/FH),0,FNX-1),j=clamp(Math.round((z-FZ0)/FH),0,FNZ-1);return DF[j*FNX+i];};
for(const e of [[B.x0+AWI,B.z0+AWI,B.x0+AWI,B.z1-AWI],[B.x1-AWI,B.z0+AWI,B.x1-AWI,B.z1-AWI],[B.x0+AWI,B.z0+AWI,B.x1-AWI,B.z0+AWI],[B.x0+AWI,B.z1-AWI,B.x1-AWI,B.z1-AWI]]){
  const L0=Math.hypot(e[2]-e[0],e[3]-e[1]);let a=-1;
  for(let t=0;t<=L0+.01;t+=.5){const x=lerp(e[0],e[2],t/L0),z=lerp(e[1],e[3],t/L0),ok=DAT(x,z)>WR+1.2;
    if(ok&&a<0)a=t;if((!ok||t+.5>L0)&&a>=0){const b=ok?t:t-.5;if(b-a>.8)wallLine(lerp(e[0],e[2],a/L0),lerp(e[1],e[3],a/L0),lerp(e[0],e[2],b/L0),lerp(e[1],e[3],b/L0),1.85,C.blockWall,12);a=-1;}}
  for(let t=10;t<L0-6;t+=rr(17,24)){const x=lerp(e[0],e[2],t/L0),z=lerp(e[1],e[3],t/L0);if(DAT(x,z)<WR+4)continue;const ox=e[0]===e[2]?(e[0]<-100?-1:1):0,oz=e[0]===e[2]?0:(e[1]<-400?-1:1),px=x+ox*(AWI-1.45),pz=z+oz*(AWI-1.45);
    if(rnd()<.5)youngTree(px,pz,rr(1,1.25));else trees.push([x+ox*.75,z+oz*.75,rr(.85,1.1),pick([0,2,5,0])]);}}
// ---------- street lights (cobra heads on concrete poles, in the parkway) and spawn points along the streets
for(const k of ['IW','MN','SG','MS']){const st=S[k];let side=1;
  for(let s=14;s<st.L-6;s+=rr(48,58)){let ok=false,x=0,z=0;for(let tr=0;tr<8&&!ok;tr++){const q=at(st,s+tr*2.5),px=q.x+q.nx*side*(HW+CB+.55),pz=q.z+q.nz*side*(HW+CB+.55);
      if(inset(px,pz)<4||DRIVE.some(d=>Math.hypot(d[0]-px,d[1]-pz)<4.2))continue;let bad=false;for(const o of LAB)if(o!==k&&dLab(o,px,pz)<WR+2)bad=true;if(bad)continue;ok=true;x=px;z=pz;}
    if(ok)cobra(x,z,Math.atan2(-at(st,s).nx*side,-at(st,s).nz*side));side=-side;}
  for(let s=8;s<st.L-4;s+=24){const q=at(st,s);if(inset(q.x,q.z)>8)SPN.push([q.x,q.z]);}}
for(const b of BULB)SPN.push([b.c[0],b.c[1]]);
// asphalt patches (darker, newer asphalt over old cuts) and the odd oil stain, as translucent decals
for(const k of ['IW','MN','SG','MS']){const st=S[k];for(let s=rr(5,30);s<st.L-5;s+=rr(25,60)){const q=at(st,s),o=rr(-3.2,3.2),cx=q.x+q.nx*o,cz=q.z+q.nz*o;if(inset(cx,cz)<2)continue;
  const L0=rr(1.4,4.5),W0=rr(.9,2.4),P=[[-L0,-W0],[L0,-W0],[L0,W0],[-L0,W0]].map(e=>[cx+q.tx*e[0]+q.nx*e[1],YR+.004,cz+q.tz*e[0]+q.nz*e[1]]);
  anchor(cx,cz,()=>{if((P[1][2]-P[0][2])*(P[2][0]-P[0][0])-(P[1][0]-P[0][0])*(P[2][2]-P[0][2])>0)quadC(M.shade,P[0],P[1],P[2],P[3],0,1,0,0,.53,.02,.97,.03);else quadC(M.shade,P[1],P[0],P[3],P[2],0,1,0,0,.53,.02,.97,.03);});}}
mapR(B.x0,B.z0,B.x1,B.z1,'#c4cf9f');
for(const l of LOTS)if(l.house&&l.house.foot)HOOD.foot.push(...l.house.foot);
// the Aunt Ro's street area name now belongs on Mesada, round the start house
{const i=AREAS.findIndex(a=>a[4]==='Aunt Ro\'s Street');if(i>=0)AREAS.splice(i,1);AREAS.unshift([-112,-425,-15,-330,'Aunt Ro\'s Street']);}
}
// 03c hook: the block's streets and houses on the map image
function hoodMap(g,X,Z){g.fillStyle='#77736c';for(const P of HOOD.asph){g.beginPath();P.forEach((p,k)=>k?g.lineTo(X(p[0]),Z(p[1])):g.moveTo(X(p[0]),Z(p[1])));g.closePath();g.fill();}
  g.fillStyle='#8a7a66';for(const P of HOOD.foot){g.beginPath();P.forEach((p,k)=>k?g.lineTo(X(p[0]),Z(p[1])):g.moveTo(X(p[0]),Z(p[1])));g.closePath();g.fill();}}
