// =====================================================================
// 02b PADS + STREET PROPS: kerbed pads with sidewalks, block walls, parking lots, signs, cover, small furniture
// =====================================================================
const SWA=2.0,SWL=1.5,SW=SWA; // sidewalk widths: arterials, tract streets
// raised pad with curbs. sw = sidewalk width on each side [N,S,W,E] (0: curb but no walk, -1: no curb either). top: material or null.
function pad2(x0,z0,x1,z1,top,sw,rp){sw=sw||[SWA,SWA,SWA,SWA];const y=PADY,c=C.curb;if(x1-x0<.2||z1-z0<.2)return;
  if(sw[1]>=0)quadC(M.flat,[x0,0,z1],[x1,0,z1],[x1,y,z1],[x0,y,z1],0,0,1,c);if(sw[0]>=0)quadC(M.flat,[x1,0,z0],[x0,0,z0],[x0,y,z0],[x1,y,z0],0,0,-1,c);
  if(sw[3]>=0)quadC(M.flat,[x1,0,z1],[x1,0,z0],[x1,y,z0],[x1,y,z1],1,0,0,shade(c,.93));if(sw[2]>=0)quadC(M.flat,[x0,0,z0],[x0,0,z1],[x0,y,z1],[x0,y,z0],-1,0,0,shade(c,.93));
  const n=Math.max(0,sw[0]),s=Math.max(0,sw[1]),w=Math.max(0,sw[2]),e=Math.max(0,sw[3]);
  if(n)flat(M.walk,x0,z0,x1,z0+n,y,6);if(s)flat(M.walk,x0,z1-s,x1,z1,y,6);if(w)flat(M.walk,x0,z0+n,x0+w,z1-s,y,6);if(e)flat(M.walk,x1-e,z0+n,x1,z1-s,y,6);
  if(top)flat(top,x0+w,z0+n,x1-e,z1-s,y,rp||8);}
// parking lot surface (aisles along x when alongX), laid in whole modules from (x0,z0)
let lotWorn=false; // set by lotCars' caller chain: about half the lots have worn, faded striping
function lotFlat(x0,z0,x1,z1,alongX,y){lotWorn=isoR(()=>rnd()<.5);y=y===undefined?PADY+.004:y;const L1=alongX?11:18.6,L2=alongX?18.6:11,su=Math.max(11,Math.floor(150/11)*11),sv=Math.max(18.6,Math.floor(150/18.6)*18.6),
  pu=alongX?su:sv,pv=alongX?sv:su;
  for(let xa=x0;xa<x1-.01;xa+=pu)for(let za=z0;za<z1-.01;za+=pv){const xb=Math.min(x1,xa+pu),zb=Math.min(z1,za+pv);
    const lm=lotWorn?M.lotF:M.lot;if(alongX)quad(lm,[xa,y,zb],[xb,y,zb],[xb,y,za],[xa,y,za],0,1,0,(xb-xa)/11,(zb-za)/18.6);
    else quad(lm,[xa,y,za],[xa,y,zb],[xb,y,zb],[xb,y,za],0,1,0,(zb-za)/11,(xb-xa)/18.6);}
  mapR(x0,z0,x1,z1,'#a3a09a');}
// ---------- block walls (6 ft slump block). Axis-aligned line from (x0,z0) to (x1,z1).
function wallLine(x0,z0,x1,z1,h,tint,pil){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),len=ax?Math.abs(x1-x0):Math.abs(z1-z0);if(len<.4)return;h=h||1.85;tint=tint===undefined?C.blockWall:tint;
  const cx=(x0+x1)/2,cz=(z0+z1)/2,t=.2,w=ax?len:t,d=ax?t:len,n=Math.max(1,Math.round(len/8));
  anchor(cx,cz,()=>{wallSideE(CE,cx,cz,w,d,0,h,ax?0:2,rep('wall8',n),tint);wallSideE(CE,cx,cz,w,d,0,h,ax?1:3,rep('wall8',n),tint);
    const ct=shade(tint,.9);quadC(M.flat,[cx-w/2-.04,h,cz+d/2+.04],[cx+w/2+.04,h,cz+d/2+.04],[cx+w/2+.04,h,cz-d/2-.04],[cx-w/2-.04,h,cz-d/2-.04],0,1,0,ct);
    if(ax){quadC(M.flat,[cx+w/2,0,cz+d/2],[cx+w/2,0,cz-d/2],[cx+w/2,h,cz-d/2],[cx+w/2,h,cz+d/2],1,0,0,ct);quadC(M.flat,[cx-w/2,0,cz-d/2],[cx-w/2,0,cz+d/2],[cx-w/2,h,cz+d/2],[cx-w/2,h,cz-d/2],-1,0,0,ct);}
    else{quadC(M.flat,[cx-w/2,0,cz+d/2],[cx+w/2,0,cz+d/2],[cx+w/2,h,cz+d/2],[cx-w/2,h,cz+d/2],0,0,1,ct);quadC(M.flat,[cx+w/2,0,cz-d/2],[cx-w/2,0,cz-d/2],[cx-w/2,h,cz-d/2],[cx+w/2,h,cz-d/2],0,0,-1,ct);}
    if(pil){const np=Math.floor(len/pil);for(let k=1;k<np;k++){const u=-len/2+k*len/np;boxC(M.flat,ax?cx+u:cx,0,ax?cz:cz+u,.5,h+.25,.5,shade(tint,.96),ct);}}});
  solid(cx,cz,w,d,h+.05,0,0);}
// a wooden side-yard gate between two houses (a short wall in wood)
function gateLine(x0,z0,x1,z1,iron){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),len=ax?Math.abs(x1-x0):Math.abs(z1-z0);if(len<.3)return;
  if(iron){const n=Math.max(1,Math.round(len/1.7)),cx=(x0+x1)/2,cz=(z0+z1)/2;anchor(cx,cz,()=>{for(let k=0;k<n;k++){const t=(k+.5)/n,px=lerp(x0,x1,t),pz=lerp(z0,z1,t);cutQ(px,pz,PADY,len/n+.02,1.65,ax?0:PI/2,CUT.iron,0xffffff);}
      for(const e of [0,1])put(M.flat,GEO.box,e?x1:x0,PADY,e?z1:z0,0,.09,1.72,.09,0x1c1b1a);});const cl=Math.max(len,1.7),c=solid(cx,cz,ax?cl:.12,ax?.12:cl,1.8,0,0);c.see=true;return;}const cx=(x0+x1)/2,cz=(z0+z1)/2,w=ax?len:.12,d=ax?.12:len,u=cuv(CI.barn),uv=[u[0],u[1],u[0]+(u[2]-u[0])*Math.min(1,len/4),u[1]+(u[3]-u[1])*.45];
  anchor(cx,cz,()=>{for(const s of ax?[0,1]:[2,3])faceQuad(cx,cz,w,d,s,0,len,0,1.8,uv,.001,0xb59a78);quadC(M.flat,[cx-w/2,1.8,cz+d/2],[cx+w/2,1.8,cz+d/2],[cx+w/2,1.8,cz-d/2],[cx-w/2,1.8,cz-d/2],0,1,0,0x8a7258);});
  const cl=Math.max(len,1.7);solid(cx,cz,ax?cl:w,ax?d:cl,1.86,0,0);} // at least 1.7 m, so that the navigation grid closes the gap
// white rail fence (trails, ranch edges): posts and three rails, no collider unless asked
function railFence(x0,z0,x1,z1,col,coll){col=col===undefined?0xf1eee6:col;const L0=Math.hypot(x1-x0,z1-z0);if(L0<.5)return;const n=Math.max(1,Math.round(L0/2.6)),ang=Math.atan2(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;
  anchor(cx,cz,()=>{for(let k=0;k<=n;k++){const x=lerp(x0,x1,k/n),z=lerp(z0,z1,k/n);put(M.flat,GEO.box,x,0,z,ang,.12,1.25,.12,col);}
    for(const y of [.45,.8,1.15])put(M.flat,GEO.box,cx,y,cz,ang,.05,.12,L0,col);});
  if(coll){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0);solid(cx,cz,ax?L0:.15,ax?.15:L0,1.25,0,0);}}
// chain-link fence (schools, dog park, freeway): posts and a see-through mesh panel (bullets pass, people do not)
function chainLink(x0,z0,x1,z1,h){h=h||2.4;const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),len=ax?Math.abs(x1-x0):Math.abs(z1-z0);if(len<.3)return;const cx=(x0+x1)/2,cz=(z0+z1)/2,n=Math.max(1,Math.round(len/3));
  anchor(cx,cz,()=>{for(let k=0;k<=n;k++){const u=-len/2+k*len/n;put(M.flat,GEO.tube6,ax?cx+u:cx,0,ax?cz:cz+u,0,.04,h,.04,0x9aa0a2);}
    put(M.flat,GEO.box,cx,h-.04,cz,0,ax?len:.05,.05,ax?.05:len,0x9aa0a2);put(M.flat,GEO.box,cx,.05,cz,0,ax?len:.04,.04,ax?.04:len,0x9aa0a2);});
  fenceMesh.push([cx,cz,ax?len:0,ax?0:len,h]);const c=solid(cx,cz,ax?len:.1,ax?.1:len,h,0,0);c.see=true;}
const fenceMesh=[];
// ---------- signs (each is its own small textured mesh: used for the big landmark names only)
function sign(text,x,y,z,ry,w,h,bg,fg,flush){const m=new T.MeshBasicMaterial({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(512,Math.max(32,Math.pow(2,Math.round(Math.log2(Math.max(32,512*h/w))))),(g,W,H)=>{
    g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(7,7,W-14,H-14);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
    const ls=text.split('\n'),fs=Math.min((H-24)/ls.length/1.1,84);g.font='bold '+fs+'px Arial,sans-serif';
    ls.forEach((s,k)=>g.fillText(s,W/2,H/2+(k-(ls.length-1)/2)*fs*1.1,W-44));})});
  const p=new T.Mesh(new T.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.y=ry;addProp(p);
  if(!flush){const b=new T.Mesh(p.geometry,M.dark);b.position.copy(p.position);b.rotation.y=ry+PI;addProp(b);}}
// a board from a text strip baked into the chunks (no draw call): faces direction ry (0 = +z); both = also on the back
function boardQ(uv,x,y,z,ry,w,h,both,col){const c=Math.cos(ry),s=Math.sin(ry),hx=c*w/2,hz=-s*w/2,o=.02,nx=s,nz=c;col=col===undefined?0xffffff:col;
  quadUV(M.wall,[x-hx+nx*o,y,z-hz+nz*o],[x+hx+nx*o,y,z+hz+nz*o],[x+hx+nx*o,y+h,z+hz+nz*o],[x-hx+nx*o,y+h,z-hz+nz*o],nx,0,nz,col,uv);
  if(both)quadUV(M.wall,[x+hx-nx*o,y,z+hz-nz*o],[x-hx-nx*o,y,z-hz-nz*o],[x-hx-nx*o,y+h,z-hz-nz*o],[x+hx-nx*o,y+h,z+hz-nz*o],-nx,0,-nz,col,uv);
  else quadC(M.flat,[x+hx-nx*o,y,z+hz-nz*o],[x-hx-nx*o,y,z-hz-nz*o],[x-hx-nx*o,y+h,z-hz-nz*o],[x+hx-nx*o,y+h,z+hz-nz*o],-nx,0,-nz,0x8c9396);}
const post=(x,z,h,r,col,y0)=>put(M.flat,GEO.tube6,x,y0||0,z,0,r,h,r,col===undefined?C.steel:col);
// sign on a single post (text strip), e.g. trail markers, small notices
function postSign(uv,x,z,ry,w,h,y,col){anchor(x,z,()=>{post(x,z,y+h,.05,0x8c9396);boardQ(uv,x+Math.sin(ry)*.06,y,z+Math.cos(ry)*.06,ry,w,h,true,col);});}
// tall pylon sign (strip malls, gas): text strip on a stucco pylon
function pylon(uv,x,z,ry,h,tint,uv2){h=h||7;tint=tint===undefined?0xe8dcc6:tint;const c=Math.cos(ry),s=Math.sin(ry);
  anchor(x,z,()=>{put(M.flat,GEO.box,x,0,z,ry,2.6,h,.6,tint);put(M.flat,GEO.box,x,h,z,ry,3,.25,.8,shade(tint,.85));
    boardQ(uv,x,h-2.2,z,ry,2.4,.9,true);if(uv2)boardQ(uv2,x,h-3.4,z,ry,2.4,.9,true);});solid(x,z,Math.abs(c)*2.6+Math.abs(s)*.6,Math.abs(s)*2.6+Math.abs(c)*.6,h);}
function label(x,z,t,k){labels.push({x,z,t,k:k||0});}
// ---------- cover and furniture
GEO.bag=new T.SphereGeometry(1,6,4);
function sandbags(x,z,len,alongX){const n=Math.max(2,Math.round(len/.74)),bl=len/n;
  anchor(x,z,()=>{for(let ly=0;ly<3;ly++)for(let k=0;k<n-(ly%2);k++){const u=-len/2+bl*(k+.5+(ly%2)*.5),col=shade(0xb9a47a,rr(.86,1.08));
      put(M.flat,GEO.bag,alongX?x+u:x+rr(-.04,.04),.16+ly*.27,alongX?z+rr(-.04,.04):z+u,alongX?0:PI/2,bl*.56,.17,.3,col);}blob(x,z,alongX?len/2+.5:.9,alongX?.9:len/2+.5);});
  solid(x,z,alongX?len:.8,alongX?.8:len,.95,0,5);lowCover.push([x,z]);}
{const s=new T.Shape();s.moveTo(-.3,0);s.lineTo(.3,0);s.lineTo(.3,.08);s.lineTo(.2,.26);s.lineTo(.1,.5);s.lineTo(.08,1.05);s.lineTo(-.08,1.05);s.lineTo(-.1,.5);s.lineTo(-.2,.26);s.lineTo(-.3,.08);s.closePath();
  GEO.jersey=new T.ExtrudeGeometry(s,{depth:3.2,bevelEnabled:false});GEO.jersey.translate(0,0,-1.6);}
// K-rail; Kingsley's are painted their corporate tan
function barrier(x,z,alongX,col){put(M.flat,GEO.jersey,x,0,z,alongX?PI/2:0,1,1,1,col===undefined?shade(0xb4afa5,rr(.9,1.05)):col);anchor(x,z,()=>blob(x,z,alongX?2:.7,alongX?.7:2));
  solid(x,z,alongX?3.2:.6,alongX?.6:3.2,1.05,0,5);lowCover.push([x,z]);}
function crate(x,z,s,tint){anchor(x,z,()=>{boxE(CE,x,0,z,s,s,s,tint===undefined?0xffffff:tint,cuv(CI.planks));blob(x,z,s*.8,s*.8);});solid(x,z,s,s,s,0,5);if(s>.9)lowCover.push([x,z]);}
// concrete planter with a shrub (cover in plazas and lots)
function planter(x,z,w,d,tree,col){anchor(x,z,()=>{boxC(M.flat,x,PADY,z,w,.6,d,col===undefined?0xd2c8b4:col,0x6a5640);put(M.flat,GEO.sphLo,x,PADY+.6,z,rnd()*3,w*.42,.55,d*.42,0x557a3c);blob(x,z,w/2+.4,d/2+.4,PADY);});
  solid(x,z,w,d,.75,0,5);lowCover.push([x,z]);if(tree)trees.push([x,z,rr(.9,1.15),tree===true?0:tree]);}
function bench(x,z,alongX,col){col=col===undefined?0x7a5a3a:col;const w=alongX?2:.5,d=alongX?.5:2;
  anchor(x,z,()=>{boxC(M.flat,x,PADY+.4,z,w,.07,d,col);boxC(M.flat,x+(alongX?0:-.22),PADY+.47,z+(alongX?-.22:0),alongX?w:.06,.42,alongX?.06:d,col);
    for(const e of [-1,1])boxC(M.flat,x+(alongX?e*.8:0),PADY,z+(alongX?0:e*.8),alongX?.07:.45,.4,alongX?.45:.07,0x3a3a38);});solid(x,z,w,d,.9,0,5);}
function picnic(x,z,alongX){anchor(x,z,()=>{const w=alongX?2.2:1.6,d=alongX?1.6:2.2;boxC(M.flat,x,PADY+.72,z,alongX?2.2:.8,.06,alongX?.8:2.2,0x8a6a45);
    for(const s of [-1,1])boxC(M.flat,x+(alongX?0:s*.7),PADY+.42,z+(alongX?s*.7:0),alongX?2.2:.3,.05,alongX?.3:2.2,0x8a6a45);
    for(const s of [-1,1])boxC(M.flat,x+(alongX?s*.8:0),PADY,z+(alongX?0:s*.8),alongX?.08:1.5,.72,alongX?1.5:.08,0x5a4a3a);});solid(x,z,alongX?2.2:1.6,alongX?1.6:2.2,.8,0,5);}
function trashCan(x,z){anchor(x,z,()=>put(M.flat,GEO.cyl8,x,PADY,z,0,.32,.95,.32,0x6a6458));solid(x,z,.6,.6,1,0,5);}
// wheeled bins at the curb: it is Thursday, trash day
function trashBins(x,z,r,off){for(let k=0;k<2+(rnd()<.4?1:0);k++){const p=rotP(x,z,r,(k-1)*.85,0),a=r*PI/2+rr(-.2,.2);if(!off)binSpots.push([p[0],p[1],a,k%3]);}} // baked in 03a; off: not out today
function busStop(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry);anchor(x,z,()=>{put(M.flat,GEO.box,x,2.3,z,ry,3.6,.08,1.5,0x8c9396);
    for(const e of [-1.6,1.6])put(M.flat,GEO.box,x+c*e-s*.6,PADY,z-s*e-c*.6,ry,.08,2.3,.08,0x6f7577);put(M.flat,GEO.box,x-s*.68,PADY,z-c*.68,ry,3.2,1.8,.04,0x9fb3bd);
    put(M.flat,GEO.box,x,PADY+.42,z,ry,2.6,.06,.4,0x6f7577);});}
// ---------- dressing pass: cut-out texture, extra ground materials, decals and small-prop lists (all baked into the chunk batches)
// FRT holds the palm fronds (top 128 px, drawn in 03a) and below them 64 px cut-out tiles: CUT[name] is the uv rectangle of a tile
const FRT=new T.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=256;c.height=512;return c;})());FRT.anisotropy=MAXA;
const CUT={};
isoR(()=>{const g=FRT.image.getContext('2d'),T6=(n,c,r,fn)=>{const x=c*64,y=128+r*64;g.save();g.beginPath();g.rect(x+1,y+1,62,62);g.clip();g.translate(x,y);fn();g.restore();
    CUT[n]=[(x+1.5)/256,1-(y+62.5)/512,(x+62.5)/256,1-(y+1.5)/512];},E=(x,y,rx,ry,a,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,a||0,0,7);g.fill();};
  const bush=(fl,k)=>{for(let i=0;i<70;i++){const a=rnd()*PI,r=rr(4,28);E(32+Math.cos(a)*r*1.05,62-Math.sin(a)*r*1.9,rr(2.5,5),rr(2,3.6),rnd()*3,pick(['#2e5a2a','#3a6b32','#26491f','#44743a']));}
    for(let i=0;i<k;i++){const a=rnd()*PI,r=rr(2,27);E(32+Math.cos(a)*r*1.05,60-Math.sin(a)*r*1.9,rr(2,4.2),rr(1.8,3.4),rnd()*3,pick(fl));}};
  T6('boug',0,0,()=>bush(['#d81f7a','#e8409a','#c2186a','#f060a8','#b0185e'],110));
  T6('rose',1,0,()=>{bush(['#2e5a2a'],0);for(let i=0;i<16;i++){const a=rnd()*PI,r=rr(4,24),x=32+Math.cos(a)*r,y=58-Math.sin(a)*r*1.8,c=pick(['#c8202a','#e05a78','#f4f0e7','#d8412f','#f2a0b0']);E(x,y,3.4,3,0,c);E(x,y,1.4,1.2,0,'rgba(80,20,20,.6)');}});
  T6('weed',2,0,()=>{for(let i=0;i<46;i++){const a=PI*rr(.12,.88),l=rr(18,60),x0=32+rr(-6,6);g.strokeStyle=pick(['#7d9a3c','#9aa84a','#b8b06a','#6a8a34','#c9b878']);g.lineWidth=rr(1.2,2.4);
    g.beginPath();g.moveTo(x0,63);g.quadraticCurveTo(x0+Math.cos(a)*l*.4,63-Math.sin(a)*l*.6,x0+Math.cos(a)*l*.75,63-Math.sin(a)*l);g.stroke();}});
  T6('agave',3,0,()=>{for(let i=0;i<15;i++){const a=PI*(.08+.84*i/14)+rr(-.06,.06),l=rr(30,40)*(1-.35*Math.abs(Math.cos(a))),c=pick(['#7f9a92','#8aa8a0','#6f8c84','#98b2a8']);
    g.fillStyle=c;g.beginPath();g.moveTo(32-5*Math.sin(a),63);g.lineTo(32+Math.cos(a)*l,63-Math.sin(a)*l*1.4);g.lineTo(32+5*Math.sin(a),63);g.fill();}});
  T6('petals',0,1,()=>{for(let i=0;i<520;i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*31;if(rnd()>1.15-r/31)continue;E(32+Math.cos(a)*r,32+Math.sin(a)*r,rr(.8,1.8),rr(.6,1.3),rnd()*3,pick(['#8a62c8','#9a72d8','#7a56b4','#a888e0']));}});
  T6('frondD',1,1,()=>{g.strokeStyle='#8a6a42';g.lineWidth=3;g.beginPath();g.moveTo(32,63);g.lineTo(32,40);g.stroke();for(let a=0;a<=26;a++){const an=PI*(.1+.8*a/26),r1=rr(.8,1);g.strokeStyle=pick(['#a8875a','#9a7a4e','#b8986a','#8a6a42']);
    g.lineWidth=rr(2,3.4);g.beginPath();g.moveTo(32,40);g.lineTo(32+Math.cos(an)*30*r1,40-Math.sin(an)*38*r1);g.stroke();}});
  T6('crack',2,1,()=>{for(const q of [[1.15,'rgba(38,35,32,1)',30],[.8,'rgba(48,45,41,1)',36]]){g.strokeStyle=q[1];g.lineWidth=q[0];g.beginPath();let x=0,y=q[2]+rr(-3,3);g.moveTo(x,y);while(x<64){x+=rr(2,5);y=clamp(y+rr(-2.2,2.2),12,52);g.lineTo(x,y);}g.stroke();}});
  T6('tar',3,1,()=>{g.strokeStyle='rgba(14,12,10,1)';g.lineWidth=3.2;g.lineCap='round';for(let k=0;k<5;k++){g.beginPath();let x=rr(0,64),y=rr(0,64);g.moveTo(x,y);for(let s=0;s<6;s++){x+=rr(-12,12);y+=rr(-12,12);g.lineTo(x,y);}g.stroke();}});
  T6('iron',0,2,()=>{g.fillStyle='#1c1b1a';g.fillRect(0,10,64,3);g.fillRect(0,52,64,3);g.fillRect(0,60,64,3);for(let x=2;x<64;x+=8){g.fillRect(x,6,2.4,57);g.beginPath();g.moveTo(x-1.5,7);g.lineTo(x+1.2,1);g.lineTo(x+3.9,7);g.fill();}
    g.strokeStyle='#1c1b1a';g.lineWidth=1.6;for(let x=6;x<64;x+=16){g.beginPath();g.arc(x+1.2,20,3.4,0,7);g.stroke();}});
  T6('dryP',1,2,()=>{for(let i=0;i<9;i++){const x=rr(8,56),y=rr(8,56);for(let k=0;k<14;k++)E(x+rr(-9,9),y+rr(-7,7),rr(2,6),rr(1.5,4.5),rnd()*3,pick(['#a49a66','#9a8f5c','#ada27a','#8e855a','#968c62']));}});
  T6('rocks',2,2,()=>{for(let x=-2;x<66;){const w=rr(5,10);E(x+w/2,58,w/2,rr(3.5,6),0,pick(['#cfc8ba','#b8b0a2','#9e978a','#d9d2c4','#a8a092']));x+=w-1;}});
  T6('leaves',3,2,()=>{for(let i=0;i<70;i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*30;E(32+Math.cos(a)*r,32+Math.sin(a)*r,rr(1.2,2.6),rr(.7,1.4),rnd()*3,pick(['#9a7a3c','#b08a44','#7a6a34','#c4a050','#6a5a2c']));}});
  T6('spray',0,3,()=>{for(let i=0;i<260;i++){const a=PI*rr(.1,.9),r=Math.pow(rnd(),.7)*30;E(32+Math.cos(a)*r,62-Math.sin(a)*r*1.6,rr(.5,1.2),rr(.5,1.1),0,pick(['#eef6fa','#d8ecf4','#ffffff','#c8e0ec']));}});
  FRT.needsUpdate=true;});
M.frond=L({map:FRT,alphaTest:.45,side:T.DoubleSide,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});M.frond.userData.chunk=1;M.frond.userData.cast=true;
// decomposed-granite gravel for xeriscaped yards, and a parking lot whose striping has worn and faded
isoR(()=>{M.gravelO=ground('#b3a08a',2600,.14,(g,w,h)=>{for(let k=0;k<420;k++){g.fillStyle=pick(['rgba(120,105,90,.5)','rgba(215,205,190,.5)','rgba(150,130,110,.45)','rgba(90,80,70,.35)']);g.beginPath();g.arc(rnd()*w,rnd()*h,rr(.6,1.8),0,7);g.fill();}},256);
  M.gravelO.polygonOffsetFactor=M.gravelO.polygonOffsetUnits=-2;
  M.lotF=L({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(256,512,(g,w,h)=>{g.drawImage(asphC,0,0,256,512,0,0,256,512);g.fillStyle='rgba(20,18,16,.08)';g.fillRect(0,0,w,h);const ku=256/11,kv=512/18.6;
    for(const r of [[0,5.5],[13.1,18.6]])for(let s=0;s<4;s++){let y=r[0]*kv;while(y<r[1]*kv){const l=rr(8,40);g.fillStyle='rgba(225,222,212,'+rr(.18,.5).toFixed(2)+')';g.fillRect(s*2.75*ku-1,y,3,Math.min(l,r[1]*kv-y));y+=l+rr(0,14);}}
    g.fillStyle='rgba(225,222,212,.3)';g.fillRect(0,0,w,2);g.fillRect(0,h-2,w,2);
    for(let s=0;s<4;s++)for(const r of [2.6,15.9]){g.fillStyle='rgba(20,18,16,'+rr(.1,.28).toFixed(2)+')';g.beginPath();g.ellipse((s+.5)*2.75*ku+rr(-4,4),r*kv+rr(-8,8),rr(5,9),rr(8,14),rr(-.3,.3),0,7);g.fill();}},true)});});
// cut-out pieces: a vertical quad facing ry (0 = +z) and visible from both sides, two crossed quads, a quad lying on the ground.
// They are gathered in 256 m squares (one batch, one draw call, for four chunks): cutA(x,z) is the anchor of the square.
const cutA=(x,z)=>[Math.floor(x/256)*256+64,Math.floor(z/256)*256+64];
function cutQ(x,z,y,w,h,ry,uv,col){const c=Math.cos(ry)*w/2,s=Math.sin(ry)*w/2,o=ANCH;ANCH=cutA(x,z);const B=bat(M.frond,x,z),i0=B.i.length;quadC(M.frond,[x-c,y,z+s],[x+c,y,z-s],[x+c,y+h,z-s],[x-c,y+h,z+s],Math.sin(ry),0,Math.cos(ry),col===undefined?0xffffff:col,uv[0],uv[1],uv[2],uv[3]);detMark(B,i0,Math.max(w,h)/2);ANCH=o;}
function cutX(x,z,y,w,h,uv,col,ry){ry=ry||0;cutQ(x,z,y,w,h,ry,uv,col);cutQ(x,z,y,w,h,ry+PI/2,uv,col);}
function cutF(x,z,y,w,d,ry,uv,col){const c=Math.cos(ry),s=Math.sin(ry),ax=c*w/2,az=-s*w/2,bx=s*d/2,bz=c*d/2,o=ANCH;ANCH=cutA(x,z);const B=bat(M.frond,x,z),i0=B.i.length;
  quadC(M.frond,[x-ax+bx,y,z-az+bz],[x+ax+bx,y,z+az+bz],[x+ax-bx,y,z+az-bz],[x-ax-bx,y,z-az-bz],0,1,0,col===undefined?0xffffff:col,uv[0],uv[1],uv[2],uv[3]);detMark(B,i0,Math.max(w,d)/2);ANCH=o;}
// dark decals in the contact-shadow batch: an oil stain or a grease spot (round), a tyre mark (a long thin smear)
function stain(x,z,rx,rz,ry,y){y=(y===undefined?PADY:y)+.016;const c=Math.cos(ry),s=Math.sin(ry),ax=c*rx,az=-s*rx,bx=s*rz,bz=c*rz;
  quadC(M.shade,[x-ax+bx,y,z-az+bz],[x+ax+bx,y,z+az+bz],[x+ax-bx,y,z+az-bz],[x-ax-bx,y,z-az-bz],0,1,0,0,.02,.02,.48,.98);}
function smear(x,z,len,wid,ry,y){y=(y===undefined?PADY:y)+.016;const c=Math.cos(ry),s=Math.sin(ry),ax=s*len/2,az=c*len/2,bx=c*wid/2,bz=-s*wid/2;
  quadC(M.shade,[x-ax-bx,y,z-az-bz],[x-ax+bx,y,z-az+bz],[x+ax+bx,y,z+az+bz],[x+ax-bx,y,z+az-bz],0,1,0,0,.6,.3,.9,.3);}
// lists of small props that 03a bakes from templates: [x, z, ry, variant]
const binSpots=[],postBoxes=[],yardSigns=[],toySpots=[],boatSpots=[],cartSpots=[],corralSpots=[],dumpSpots=[],phoneSpots=[],newsSpots=[],adBenches=[],hedgeSpots=[],rockSpots=[],iceSpots=[],hoopPoles=[];
// a strip of cut-out quads standing on the line from a to b (river-rock edging), one tile every seg metres
function cutL(a,b,y,h,uv,col,seg){const L0=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L0/(seg||1.3))),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
  for(let k=0;k<n;k++){const t=(k+.5)/n;cutQ(lerp(a[0],b[0],t),lerp(a[1],b[1],t),y,L0/n+.02,h,ry,uv,col);}}
