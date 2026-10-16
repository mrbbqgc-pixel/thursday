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
function lotFlat(x0,z0,x1,z1,alongX,y){y=y===undefined?PADY+.004:y;const L1=alongX?11:18.6,L2=alongX?18.6:11,su=Math.max(11,Math.floor(150/11)*11),sv=Math.max(18.6,Math.floor(150/18.6)*18.6),
  pu=alongX?su:sv,pv=alongX?sv:su;
  for(let xa=x0;xa<x1-.01;xa+=pu)for(let za=z0;za<z1-.01;za+=pv){const xb=Math.min(x1,xa+pu),zb=Math.min(z1,za+pv);
    if(alongX)quad(M.lot,[xa,y,zb],[xb,y,zb],[xb,y,za],[xa,y,za],0,1,0,(xb-xa)/11,(zb-za)/18.6);
    else quad(M.lot,[xa,y,za],[xa,y,zb],[xb,y,zb],[xb,y,za],0,1,0,(zb-za)/11,(xb-xa)/18.6);}
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
function gateLine(x0,z0,x1,z1){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),len=ax?Math.abs(x1-x0):Math.abs(z1-z0);if(len<.3)return;const cx=(x0+x1)/2,cz=(z0+z1)/2,w=ax?len:.12,d=ax?.12:len,u=cuv(CI.barn),uv=[u[0],u[1],u[0]+(u[2]-u[0])*Math.min(1,len/4),u[1]+(u[3]-u[1])*.45];
  anchor(cx,cz,()=>{for(const s of ax?[0,1]:[2,3])faceQuad(cx,cz,w,d,s,0,len,0,1.8,uv,.001,0xb59a78);quadC(M.flat,[cx-w/2,1.8,cz+d/2],[cx+w/2,1.8,cz+d/2],[cx+w/2,1.8,cz-d/2],[cx-w/2,1.8,cz-d/2],0,1,0,0x8a7258);});
  solid(cx,cz,w,d,1.86,0,0);}
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
function trashBins(x,z,r){const cs=[0x2b2d2c,0x2f6a3a,0x2d4f8a];anchor(x,z,()=>{for(let k=0;k<2+(rnd()<.4?1:0);k++){const p=rotP(x,z,r,(k-1)*.85,0);put(M.flat,GEO.box,p[0],PADY,p[1],r*PI/2+rr(-.2,.2),.62,1.02,.7,cs[k%3]);}});}
function busStop(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry);anchor(x,z,()=>{put(M.flat,GEO.box,x,2.3,z,ry,3.6,.08,1.5,0x8c9396);
    for(const e of [-1.6,1.6])put(M.flat,GEO.box,x+c*e-s*.6,PADY,z-s*e-c*.6,ry,.08,2.3,.08,0x6f7577);put(M.flat,GEO.box,x-s*.68,PADY,z-c*.68,ry,3.2,1.8,.04,0x9fb3bd);
    put(M.flat,GEO.box,x,PADY+.42,z,ry,2.6,.06,.4,0x6f7577);});}
