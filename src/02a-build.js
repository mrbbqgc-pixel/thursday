// =====================================================================
// 02a BUILDINGS: wall runs from the atlas, hip and gable tile roofs, the tract-house templates, shops, big boxes, warehouses
// Frame: north-up. x = east, z = south (north is -z), metres; origin Haven Ave x Foothill Blvd.
// Sides: 0 = north face (-z), 1 = south face (+z), 2 = west face (-x), 3 = east face (+x)
// =====================================================================
const ROT_DEG=0,PADY=.12;
const palms=[],fans=[],trees=[],lamps=[],poles=[],tinacos=[],buildings=[],labels=[],barrelSpots=[],lowCover=[],MAPR=[],QUIET=[];
function mapR(x0,z0,x1,z1,col){MAPR.push([x0,z0,x1,z1,col]);}
function triC(mat,a,b,c,nx,ny,nz,col){const B=bat(mat,a[0],a[2]),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);B.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);B.c.push(r,g,bl,r,g,bl,r,g,bl);if(B.uv)B.u.push(WU,WV,WU,WV,WU,WV);B.i.push(k,k+1,k+2);}
// quad with its own uv per corner (uv: 8 numbers) or an atlas rectangle (4 numbers)
function quadUV(mat,a,b,c,d,nx,ny,nz,col,uv){const B=bat(mat,a[0],a[2]),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);B.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz,nx,ny,nz);B.c.push(r,g,bl,r,g,bl,r,g,bl,r,g,bl);
  if(B.uv){if(uv.length===8)B.u.push(uv[0],uv[1],uv[2],uv[3],uv[4],uv[5],uv[6],uv[7]);else B.u.push(uv[0],uv[1],uv[2],uv[1],uv[2],uv[3],uv[0],uv[3]);}B.i.push(k,k+1,k+2,k,k+2,k+3);}
// emitters: TB collects a template geometry (stamped later with put), CE writes straight into the chunk batches
function TB(){this.p=[];this.n=[];this.c=[];this.u=[];this.i=[];}
TB.prototype.q=function(a,b,c,d,nx,ny,nz,col,uv){const k=this.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(let j=0;j<4;j++){this.n.push(nx,ny,nz);this.c.push(r,g,bl);}
  if(uv.length===8)for(let j=0;j<8;j++)this.u.push(uv[j]);else this.u.push(uv[0],uv[1],uv[2],uv[1],uv[2],uv[3],uv[0],uv[3]);this.i.push(k,k+1,k+2,k,k+2,k+3);};
TB.prototype.geo=function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.i);return g;};
const CE={q:(a,b,c,d,nx,ny,nz,col,uv)=>quadUV(M.wall,a,b,c,d,nx,ny,nz,col,uv)};
const WUV=[WU,WV,WU,WV];
// one face of a box, split into segments that each show an atlas cell (cells listed left to right as seen from outside)
function wallSideE(E,x,z,w,d,y0,h,side,cells,tint){const n=cells.length,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,y1=y0+h,vk=Math.min(h,4)/4;
  for(let k=0;k<n;k++){const c=cuv(CI[cells[k]]),f0=k/n,f1=(k+1)/n,v1=c[1]+(c[3]-c[1])*vk;let a,b,nx=0,nz=0;
    if(side===1){a=[lerp(x0,x1,f0),z1];b=[lerp(x0,x1,f1),z1];nz=1;}else if(side===0){a=[lerp(x1,x0,f0),z0];b=[lerp(x1,x0,f1),z0];nz=-1;}
    else if(side===3){a=[x1,lerp(z1,z0,f0)];b=[x1,lerp(z1,z0,f1)];nx=1;}else{a=[x0,lerp(z0,z1,f0)];b=[x0,lerp(z0,z1,f1)];nx=-1;}
    E.q([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],nx,0,nz,side>1?shade(tint,.93):tint,[c[0],c[1],c[2],v1]);}}
function wallSide(x,z,w,d,y0,h,side,cells,tint){wallSideE(CE,x,z,w,d,y0,h,side,cells,tint);}
const segs=L0=>Math.max(1,Math.round(L0/3.6));
function rep(name,n){const a=[];for(let k=0;k<n;k++)a.push(name);return a;}
const cyc=(pat,n)=>{const a=[];for(let k=0;k<n;k++)a.push(pat[k%pat.length]);return a;};
// box with every face sampling one uv rectangle (a swatch, a cell or the white texel); no bottom
function boxE(E,x,y,z,w,h,d,col,uv,top){const x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2,cs=shade(col,.93);uv=uv||WUV;
  E.q([x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],0,0,1,col,uv);E.q([x1,y,z0],[x0,y,z0],[x0,y1,z0],[x1,y1,z0],0,0,-1,col,uv);
  E.q([x1,y,z1],[x1,y,z0],[x1,y1,z0],[x1,y1,z1],1,0,0,cs,uv);E.q([x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],-1,0,0,cs,uv);
  E.q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,top===undefined?col:top,uv);}
// ---------- roofs
// hip roof over (x,z,w,d) with eaves at e. Tiles come from the 'tile' cell, the roof colour is the tint; fascia and soffit go to TR in a fixed swatch colour.
function hipRoofE(E,x,z,w,d,e,pitch,col,ov,TR,trimK,ms,rcell){ov=ov===undefined?.45:ov;ms=ms||6;if(TR===undefined||TR===null)TR=E;const sw=w<d,A=sw?d:w,Bd=sw?w:d,X0=-A/2-ov,X1=A/2+ov,Z1=Bd/2+ov,run=Bd/2+ov,rise=run*pitch;
  const c=cuv(CI[rcell||'tile']),du=c[2]-c[0],dv=c[3]-c[1],Ln=Math.hypot(run,rise),ny=run/Ln,nh=rise/Ln,cb=shade(col,.88),ce=shade(col,.94);
  const P=(a,y,b)=>sw?[x+b,y,z+a]:[x+a,y,z+b];
  const em=(E2,p0,p1,p2,p3,na,nyy,nb,cc,uv)=>{if(sw)E2.q(P(...p0),P(...p3),P(...p2),P(...p1),nb,nyy,na,cc,uv.length===8?[uv[0],uv[1],uv[6],uv[7],uv[4],uv[5],uv[2],uv[3]]:uv);
    else E2.q(P(...p0),P(...p1),P(...p2),P(...p3),na,nyy,nb,cc,uv);};
  const cuts=(a0,a1,mids)=>{const pts=[a0].concat(mids.filter(m=>m>a0+.01&&m<a1-.01),[a1]),o=[a0];for(let k=1;k<pts.length;k++){const L0=pts[k]-pts[k-1],n=Math.max(1,Math.ceil(L0/ms-.001));for(let q=1;q<=n;q++)o.push(pts[k-1]+L0*q/n);}return o;};
  const ta=a=>Math.min(1,Math.min(a-X0,X1-a)/run);
  const ca=cuts(X0,X1,[X0+run,X1-run]);
  for(let k=0;k<ca.length-1;k++){const a0=ca[k],a1=ca[k+1],t0=ta(a0),t1=ta(a1),us=Math.min(1,(a1-a0)/4)*du;
    em(E,[a0,e,Z1],[a1,e,Z1],[a1,e+t1*rise,Z1-t1*run],[a0,e+t0*rise,Z1-t0*run],0,ny,nh,col,[c[0],c[1],c[0]+us,c[1],c[0]+us,c[1]+t1*dv,c[0],c[1]+t0*dv]);
    em(E,[a1,e,-Z1],[a0,e,-Z1],[a0,e+t0*rise,-Z1+t0*run],[a1,e+t1*rise,-Z1+t1*run],0,ny,-nh,cb,[c[0],c[1],c[0]+us,c[1],c[0]+us,c[1]+t0*dv,c[0],c[1]+t1*dv]);}
  const tb=b=>Math.min(1,Math.min(b+Z1,Z1-b)/run),cb2=cuts(-Z1,Z1,[0]);
  for(let k=0;k<cb2.length-1;k++){const b0=cb2[k],b1=cb2[k+1],s0=tb(b0),s1=tb(b1),us=Math.min(1,(b1-b0)/4)*du;
    em(E,[X0,e,b0],[X0,e,b1],[X0+s1*run,e+s1*rise,b1],[X0+s0*run,e+s0*rise,b0],-nh,ny,0,ce,[c[0],c[1],c[0]+us,c[1],c[0]+us,c[1]+s1*dv,c[0],c[1]+s0*dv]);
    em(E,[X1,e,b1],[X1,e,b0],[X1-s0*run,e+s0*rise,b0],[X1-s1*run,e+s1*rise,b1],nh,ny,0,ce,[c[0],c[1],c[0]+us,c[1],c[0]+us,c[1]+s0*dv,c[0],c[1]+s1*dv]);}
  if(TR===false)return e+rise;
  // soffit underneath and a fascia board round the eaves
  const tu=swUV(trimK===undefined?SWN.trim:trimK),fy=e-.22;
  em(TR,[X0,e-.01,-Z1],[X1,e-.01,-Z1],[X1,e-.01,Z1],[X0,e-.01,Z1],0,-1,0,0xffffff,tu);
  em(TR,[X0,fy,Z1],[X1,fy,Z1],[X1,e+.03,Z1],[X0,e+.03,Z1],0,0,1,0xffffff,tu);em(TR,[X1,fy,-Z1],[X0,fy,-Z1],[X0,e+.03,-Z1],[X1,e+.03,-Z1],0,0,-1,0xffffff,tu);
  em(TR,[X0,fy,-Z1],[X0,fy,Z1],[X0,e+.03,Z1],[X0,e+.03,-Z1],-1,0,0,0xffffff,tu);em(TR,[X1,fy,Z1],[X1,fy,-Z1],[X1,e+.03,-Z1],[X1,e+.03,Z1],1,0,0,0xffffff,tu);
  return e+rise;}
function hipRoof(x,z,w,d,e,pitch,col,ov,trimK){return hipRoofE(CE,x,z,w,d,e,pitch,col,ov,CE,trimK);}
// gable roof; ridge along the long axis. roofCell is tinted by col, the gable triangles take wallCell and wallTint.
function gableRoofE(E,x,z,w,d,e,pitch,col,ov,roofCell,wallCell,wallTint,alongZ,GT){ov=ov===undefined?.45:ov;const sw=alongZ===undefined?w<d:!!alongZ,A=sw?d:w,Bd=sw?w:d,X0=-A/2-ov,X1=A/2+ov,Z1=Bd/2+ov,run=Bd/2+ov,rise=run*pitch;
  const c=cuv(CI[roofCell||'tile']),du=c[2]-c[0],Ln=Math.hypot(run,rise),ny=run/Ln,nh=rise/Ln,P=(a,y,b)=>sw?[x+b,y,z+a]:[x+a,y,z+b];
  const em=(p0,p1,p2,p3,na,nyy,nb,cc,uv)=>{if(sw)E.q(P(...p0),P(...p3),P(...p2),P(...p1),nb,nyy,na,cc,uv.length===8?[uv[0],uv[1],uv[6],uv[7],uv[4],uv[5],uv[2],uv[3]]:uv);else E.q(P(...p0),P(...p1),P(...p2),P(...p3),na,nyy,nb,cc,uv);};
  const n=Math.max(1,Math.ceil((X1-X0)/6)),us=Math.min(1,(X1-X0)/n/4)*du;
  for(let k=0;k<n;k++){const a0=lerp(X0,X1,k/n),a1=lerp(X0,X1,(k+1)/n);
    em([a0,e,Z1],[a1,e,Z1],[a1,e+rise,0],[a0,e+rise,0],0,ny,nh,col,[c[0],c[1],c[0]+us,c[3]]);em([a1,e,-Z1],[a0,e,-Z1],[a0,e+rise,0],[a1,e+rise,0],0,ny,-nh,shade(col,.88),[c[0],c[1],c[0]+us,c[3]]);
    em([a0,e+rise,.02],[a1,e+rise,.02],[a1,e+rise,-.02],[a0,e+rise,-.02],0,1,0,shade(col,.8),[c[0],c[1],c[0]+us,c[1]+.002]);}
  if(GT===false)return e+rise;if(GT){E=GT;}  // GT: where the gable walls and the soffit go (a template keeps them with the walls)
  const g=cuv(CI[wallCell||'stucco']),gm=(g[0]+g[2])/2,hb=Bd/2,ar=hb*pitch,gv=g[1]+(g[3]-g[1])*Math.min(1,ar/4);
  em([-A/2,e,-hb],[-A/2,e,hb],[-A/2,e+ar,0],[-A/2,e+ar,0],-1,0,0,shade(wallTint,.93),[g[0],g[1],g[2],g[1],gm,gv,gm,gv]);
  em([A/2,e,hb],[A/2,e,-hb],[A/2,e+ar,0],[A/2,e+ar,0],1,0,0,shade(wallTint,.93),[g[0],g[1],g[2],g[1],gm,gv,gm,gv]);
  em([X0,e-.01,-Z1],[X1,e-.01,-Z1],[X1,e-.01,Z1],[X0,e-.01,Z1],0,-1,0,0xffffff,swUV(SWN.cream));
  return e+rise;}
// soft dark strips on the ground around a footprint
function shadeRect(x,z,w,d,y,r){y=(y||0)+.012;r=r||1.2;const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,u0=.53,u1=.97;
  quadC(M.shade,[x0,y,z1],[x1,y,z1],[x1,y,z1+r],[x0,y,z1+r],0,1,0,0,u0,.02,u1,.98);quadC(M.shade,[x1,y,z0],[x0,y,z0],[x0,y,z0-r],[x1,y,z0-r],0,1,0,0,u0,.02,u1,.98);
  quadC(M.shade,[x1,y,z1],[x1,y,z0],[x1+r,y,z0],[x1+r,y,z1],0,1,0,0,u0,.02,u1,.98);quadC(M.shade,[x0,y,z0],[x0,y,z1],[x0-r,y,z1],[x0-r,y,z0],0,1,0,0,u0,.02,u1,.98);}
function blob(x,z,rx,rz,y){y=(y||0)+.014;quadC(M.shade,[x-rx,y,z+rz],[x+rx,y,z+rz],[x+rx,y,z-rz],[x-rx,y,z-rz],0,1,0,0,.02,.02,.48,.98);}
// flat roof with a projecting cap
function roofFlat(x,z,w,d,h,col,corn){boxC(M.flat,x,h-.2,z,w+.24,.2,d+.24,corn,col);}
const SD=[[0,-1],[0,1],[-1,0],[1,0]]; // outward direction of each side
const awnCols=[0xb3261e,0x2f7d4f,0x1d3f7a,0xe2b93b,0x6a3d8f,0xd98a4e,0x2f8f8a,0x15110c];
function awning(x,z,w,d,side,len,y1,col){const s=SD[side],ax=side<2,o=1.25,hl=len/2;y1=y1||2.95;const y0=y1-.45;col=col===undefined?pick(awnCols):col;
  const P=(u,v,yy)=>ax?[x+u,yy,z+s[1]*(d/2+v)]:[x+s[0]*(w/2+v),yy,z+u];const a=P(-hl,0,y1),b=P(hl,0,y1),c=P(hl,o,y0),e=P(-hl,o,y0),f=P(hl,o,y0-.22),g2=P(-hl,o,y0-.22);
  const flip=side===0||side===3;
  if(flip){quadC(M.flat,a,b,c,e,0,.94,0,col);quadC(M.flat,e,c,b,a,0,-1,0,shade(col,.6));quadC(M.flat,g2,f,c,e,s[0],0,s[1],shade(col,.85));}
  else{quadC(M.flat,e,c,b,a,0,.94,0,col);quadC(M.flat,a,b,c,e,0,-1,0,shade(col,.6));quadC(M.flat,e,c,f,g2,s[0],0,s[1],shade(col,.85));}}
// a flat sign quad on a face (uv rect), standing out o metres from the face of a box (x,z,w,d) on its side
function faceQuad(x,z,w,d,side,u,len,y,h,uv,o,col){const s=SD[side],hl=len/2;o=o||.06;col=col===undefined?0xffffff:col;let a,b;
  if(side===1){a=[x+u-hl,z+d/2+o];b=[x+u+hl,z+d/2+o];}else if(side===0){a=[x-u+hl,z-d/2-o];b=[x-u-hl,z-d/2-o];}else if(side===3){a=[x+w/2+o,z-u+hl];b=[x+w/2+o,z-u-hl];}else{a=[x-w/2-o,z+u-hl];b=[x-w/2-o,z+u+hl];}
  quadUV(M.wall,[a[0],y,a[1]],[b[0],y,b[1]],[b[0],y+h,b[1]],[a[0],y+h,a[1]],s[0],0,s[1],col,uv);}

// ---------- tract houses: a dozen templates (one and two stories, attached two-car garage, hip tile roofs), stamped with put()
// Local frame: the front (garage door, entry) faces +z; the footprint is centred on the origin.
// Each template comes in six styles (HSTY), so a street mixes window types, entries, garage doors, trim and roofs without extra cost:
// 0 classic (white vinyl grids), 1 ranch (bronze sliders, arched entry, brick chimney), 2 shutters and a porch, 3 stone wainscot,
// 4 steep front gable with dark trim (two-story), 5 older and weathered (stained stucco, bronze sliders).
const HT=[],HV=[];
const HSTY=[{m:{},trim:SWN.trim},{m:{hwin:'hwinB',hwinW:'hwinBW',hwinA:'hwinB',hdoor:'hdoorA',garage:'garageW'},trim:SWN.cream,brick:1,chim:1},
  {m:{hwin:'hwinS',garage:'garageW'},trim:SWN.trim,porch:1},{m:{},trim:SWN.dbrown,stone:1,brick:1},{m:{hwinA:'hwin',garage:'garageW'},trim:SWN.ink,gable:1},
  {m:{hwin:'hwinB',hwinW:'hwinBW',hwinA:'hwinB',stucco:'stuccoP'},trim:SWN.brown,chim:1}];
function mkHouse(mw,md,st,g,gf,fc,uc,chim,S){S=S||HSTY[0];const mp=c=>S.m[c]||c,mpa=a=>a.map(mp),GW=6.4,GD=6.8,W=mw+GW,H1=2.85,hm=st*H1,mx0=g>0?-W/2:W/2-mw,mx1=mx0+mw,gx0=g>0?mx1:mx0-GW,
  zmin=Math.min(-md,gf-GD),zmax=Math.max(0,gf),zo=-(zmin+zmax)/2,zf=zo,mcx=(mx0+mx1)/2,mcz=zf-md/2,gcx=gx0+GW/2,gcz=zf+gf-GD/2,A=new TB(),R=new TB(),RF=new TB();
  for(let s=0;s<4;s++){const n=Math.max(1,Math.round((s<2?mw:md)/4.6));const gs=(g>0&&s===3)||(g<0&&s===2);
    wallSideE(A,mcx,mcz,mw,md,0,H1,s,mpa(s===1?fc:s===0?cyc(['hwin','hwinW','stucco'],n):cyc(gs?['stucco']:['stucco','hwin'],n)),0xffffff);
    if(st>1)wallSideE(A,mcx,mcz,mw,md,H1,H1,s,mpa(s===1?uc:s===0?cyc(['hwin','stucco','hwin'],n):cyc(['hwin','stucco'],n)),0xffffff);}
  for(let s=0;s<4;s++)wallSideE(A,gcx,gcz,GW,GD,0,H1,s,s===1?[mp('garage')]:[mp('stucco')],0xffffff);
  const gab=S.gable&&st>1,pm=st>1?.36:.4,tk=S.trim;let top;
  for(const q of [[R,'tile'],[RF,'tileF']]){const E2=q[0],trim=E2===R?A:false;
    if(gab)top=gableRoofE(E2,mcx,mcz,mw,md,hm,.78,0xffffff,.5,q[1],'trimT',0xffffff,true,E2===R?A:false);else top=hipRoofE(E2,mcx,mcz,mw,md,hm,pm,0xffffff,.5,trim,tk,8,q[1]);
    hipRoofE(E2,gcx,gcz,GW,GD,H1,.33,0xffffff,.45,false,0,8,q[1]);}
  if(gab){const u=swUV(tk);for(const s of [-1,1]){const zz=mcz+s*(md/2+.02),a0=s>0?mx0:mx1,a1=s>0?mx1:mx0;A.q([a0,hm-.12,zz],[a1,hm-.12,zz],[a1,hm+.1,zz],[a0,hm+.1,zz],0,0,s,0xffffff,u);}}
  const ch=chim||S.chim;if(ch){const cx=g>0?mx0+.1:mx1-.1,cz=mcz-md*.15,cu=cuv(CI[S.brick?'brick':'stucco']),cv=S.brick?[cu[0],cu[1],cu[0]+(cu[2]-cu[0])*.3,cu[1]+(cu[3]-cu[1])*.9]:[cu[0],cu[1],cu[2],cu[1]+.02];
    boxE(A,cx,0,cz,1.1,top+.7,1.5,0xffffff,cv);boxE(A,cx,top+.7,cz,1.3,.18,1.7,0xffffff,swUV(S.brick?SWN.conc:SWN.dbrown));}
  // a step and a little porch slab at the door
  let di=fc.indexOf('hdoor');if(di<0)di=0;const dx=mx0+(di+.5)*mw/fc.length;boxE(A,dx,0,zf+.6,2,.16,1.2,0xffffff,swUV(SWN.conc));
  // stone wainscot along the front (not across the door) and round the garage corners
  if(S.stone){const su=cuv(CI.stoneW),sv=[su[0],su[1]+.0006,su[2],su[1]+(su[3]-su[1])*.22];for(let k=0;k<fc.length;k++){if(k===di)continue;const a0=mx0+k*mw/fc.length,a1=a0+mw/fc.length;A.q([a0,0,zf+.02],[a1,0,zf+.02],[a1,.9,zf+.02],[a0,.9,zf+.02],0,0,1,0xffffff,sv);}
    for(const s of [-1,1]){const a0=gcx+s*(GW/2-.7),a1=gcx+s*GW/2;A.q([Math.min(a0,a1),0,gcz+GD/2+.02],[Math.max(a0,a1),0,gcz+GD/2+.02],[Math.max(a0,a1),.9,gcz+GD/2+.02],[Math.min(a0,a1),.9,gcz+GD/2+.02],0,0,1,0xffffff,sv);}}
  // porch: a shed roof on two white posts over the entry (one-story houses)
  const posts=[];if(S.porch&&st===1){const pw=3.8,pd=2,y0=2.55,y1=2.3,ze=zf+pd,tu=cuv(CI.tile),wu=swUV(SWN.trim);
    for(const s of [-1,1]){boxE(A,dx+s*(pw/2-.15),0,ze-.15,.18,y1,.18,0xffffff,wu);posts.push([dx+s*(pw/2-.15),ze-.15]);}
    const nl=Math.hypot(pd,y0-y1),ny=pd/nl,nz=(y0-y1)/nl;for(const E2 of [R,RF])E2.q([dx-pw/2,y1,ze],[dx+pw/2,y1,ze],[dx+pw/2,y0,zf],[dx-pw/2,y0,zf],0,ny,nz,0xffffff,[tu[0],tu[1],tu[0]+(tu[2]-tu[0])*.9,tu[1]+(tu[3]-tu[1])*.5]);
    A.q([dx+pw/2,y1-.02,ze],[dx-pw/2,y1-.02,ze],[dx-pw/2,y0-.02,zf],[dx+pw/2,y0-.02,zf],0,-1,0,0xffffff,wu);A.q([dx-pw/2,y1-.2,ze+.01],[dx+pw/2,y1-.2,ze+.01],[dx+pw/2,y1,ze+.01],[dx-pw/2,y1,ze+.01],0,0,1,0xffffff,wu);}
  // overlays a house may get: the garage door rolled up (things inside), a blue tarp on the front slope of the roof
  const G2=new TB(),gu=cuv(CI.garageO),gz=zf+gf+.015;G2.q([gcx-GW/2,0,gz],[gcx+GW/2,0,gz],[gcx+GW/2,H1,gz],[gcx-GW/2,H1,gz],0,0,1,0xffffff,[gu[0],gu[1],gu[2],gu[1]+(gu[3]-gu[1])*H1/4]);
  let tarp=null;if(!gab){const TP=new TB(),Z1=md/2+.5,ty=zz=>hm+(Z1-(zz-mcz))*pm+.05,za=mcz+md/2-.3,zb=za-2,xa=mcx-1.2+(g>0?.3:-.3),xb=xa+2.4,nl=Math.hypot(1,pm);
    TP.q([xa,ty(za),za],[xb,ty(za),za],[xb,ty(zb),zb],[xa,ty(zb),zb],0,1/nl,pm/nl,0xffffff,DUV.tarp);tarp=TP.geo();}
  return{wall:A.geo(),roof:R.geo(),roofF:RF.geo(),W,D:zmax-zmin,st,boxes:[[mcx,mcz,mw,md,hm+1.6],[gcx,gcz,GW,GD,H1+1.1]],gar:[gcx,zf+gf],door:[dx,zf],posts,open:G2.geo(),tarp};}
{const V=[[9.6,10.4,2,1,1.2,['hwinW','hwin','hdoor'],['hwin','hwinA','hwin'],0],[12,9.6,1,-1,2.4,['hdoor','hwinW','hwin'],null,1],[11,10,2,-1,0,['hdoor','hwinW','hwin'],['hwin','hwin','hwinA'],0],
   [10.4,10.8,1,1,3.2,['hwin','hwinW','hdoor'],null,1],[8.4,11.2,2,1,2,['hwinA','hdoor'],['hwin','hwin'],0],[12.8,10,2,-1,.6,['hdoor','hwinW','hwinA','hwin'],['hwin','hwinA','hwinA','hwin'],1]];
 for(const v of V)for(const m of [1,-1]){const a=[v[0],v[1],v[2],v[3]*m,v[4],m>0?v[5]:v[5].slice().reverse(),v[6]&&(m>0?v[6]:v[6].slice().reverse()),v[7]];
   HT.push(mkHouse(...a));HV.push(HSTY.map(S=>mkHouse(...a,S)));}}
// local (lx,lz) of a template turned r quarter turns (r=0 faces south, 1 east, 2 north, 3 west) -> world
const rotP=(x,z,r,lx,lz)=>r===0?[x+lx,z+lz]:r===1?[x+lz,z-lx]:r===2?[x-lx,z-lz]:[x-lz,z+lx];
const rotB=(x,z,r,b)=>{const p=rotP(x,z,r,b[0],b[1]);return r%2?[p[0],p[1],b[3],b[2]]:[p[0],p[1],b[2],b[3]];};
// o (optional): {s: style 0..5, f: flat concrete tile, open: garage door up, tarp: tarp on the roof}
function house(x,z,r,k,tint,roof,o){o=o||{};const H=o.s?HV[k][o.s]:HT[k],ry=r*PI/2;put(M.wall,H.wall,x,0,z,ry,1,1,1,tint);put(M.wall,o.f?H.roofF:H.roof,x,0,z,ry,1,1,1,roof);
  if(o.open)put(M.wall,H.open,x,0,z,ry,1,1,1,tint);if(o.tarp&&H.tarp)put(M.wall,H.tarp,x,0,z,ry,1,1,1,0xffffff);
  for(const b of H.boxes){const q=rotB(x,z,r,b);solid(q[0],q[1],q[2],q[3],b[4],0,1);}for(const p of H.posts){const q=rotP(x,z,r,p[0],p[1]);solid(q[0],q[1],.3,.3,2.4,0,0);}
  const m=rotB(x,z,r,H.boxes[0]);anchor(x,z,()=>shadeRect(m[0],m[1],m[2],m[3],PADY,1));buildings.push({x:m[0],z:m[1],w:m[2],d:m[3],h:H.st*2.85,flat:false});
  return{gar:rotP(x,z,r,H.gar[0],H.gar[1]),door:rotP(x,z,r,H.door[0],H.door[1])};}

// ---------- commercial
// strip of shops: one story with storefront bays, a covered walk with a tile mansard and the shop names on it. front = side index.
function stripShops(x,z,w,d,front,o){o=o||{};const tint=o.tint===undefined?pick([0xeee3cb,0xe8d8bc,0xf1ebe0,0xe3cfb0]):o.tint,h=5.4,ax=front<2,flen=ax?w:d,n=Math.max(2,Math.round(flen/4.2)),s=SD[front];
  anchor(x,z,()=>{for(let q=0;q<4;q++){const len=q<2?w:d,m=segs(len);
      if(q===front){const cells=[];for(let k=0;k<n;k++)cells.push(k%3===1?'storeD':rnd()<.12?'dado':'store');wallSideE(CE,x,z,w,d,0,4,q,cells,tint);wallSideE(CE,x,z,w,d,4,h-4,q,rep('stucco',n),tint);}
      else wallSideE(CE,x,z,w,d,0,h,q,q===(front^1)?cyc(['grime','doorMetal','dado','grime'],m):rep('dado',m),tint);}
    roofFlat(x,z,w,d,h+.12,0xcfc8bc,shade(tint,.85));
    for(let k=0;k<Math.round(w*d/180);k++)boxC(M.flat,x+rr(-w/3,w/3),h,z+rr(-d/3,d/3),1.4,.8,1.1,0xc9ccc8,0xb3b6b2);
    // covered walk: slab on square stucco piers, a sloped band of tile above it
    const dep=3,cx=x+s[0]*(w/2+dep/2),cz=z+s[1]*(d/2+dep/2),sl=ax?flen:dep,sd=ax?dep:flen;boxC(M.flat,cx,3.55,cz,sl+.3,.25,sd+.3,shade(tint,.95),0xd7cfc0);
    const np=Math.max(2,Math.round(flen/7));for(let k=0;k<=np;k++){const u=-flen/2+.3+(flen-.6)*k/np,px=ax?x+u:x+s[0]*(w/2+dep-.3),pz=ax?z+s[1]*(d/2+dep-.3):z+u;boxC(M.flat,px,0,pz,.5,3.55,.5,tint);}
    const tu=cuv(CI.tile),rc=o.roof===undefined?C.tile:o.roof,y0=3.8,y1=h+.05,ox=dep+.2,ni=ax?[0,0,s[1]]:[s[0],0,0];
    for(let k=0;k<n;k++){const u0=-flen/2+flen*k/n,u1=-flen/2+flen*(k+1)/n,P=(u,v,y)=>ax?[x+u,y,z+s[1]*(d/2+v)]:[x+s[0]*(w/2+v),y,z+u];
      let a=P(u0,ox,y0),b=P(u1,ox,y0),c=P(u1,.3,y1),e=P(u0,.3,y1);if(front===0||front===3){const t=a;a=b;b=t;const t2=c;c=e;e=t2;}
      const nl=Math.hypot(1.5,ox-.3);quadUV(M.wall,a,b,c,e,ni[0]*1.5/nl,(ox-.3)/nl,ni[2]*1.5/nl,rc,[tu[0],tu[1],tu[0]+(tu[2]-tu[0])*.9,tu[3]]);
      if(o.signs!==false&&rnd()<.85)faceQuad(x,z,w,d,front,(u0+u1)/2*(front===0||front===3?-1:1),Math.min(3.6,flen/n-.4),3.82,.8,signUV(o.sign0===undefined?(shopK++):o.sign0+k),dep+.32);}
    shadeRect(x,z,w,d,PADY,1.4);});
  solid(x,z,w,d,h+.2,0,1);solid(x+s[0]*(w/2+1.5),z+s[1]*(d/2+1.5),ax?flen:3,ax?3:flen,.25,3.55,0);buildings.push({x,z,w,d,h,flat:true});
  isoR(()=>shopLife(x,z,w,d,front,n,3));return tint;}
let shopK=0;
// generic flat-roofed block: cells per side given as patterns (front side 'fc', others 'sc'), optional band and upper floors
function block(x,z,w,d,h,o){o=o||{};const front=o.front===undefined?1:o.front,tint=o.tint===undefined?0xece5d6:o.tint,fc=o.fc||['store','storeD','store'],sc=o.sc||['dado'],fl=o.floors||1,fh=h/fl;
  anchor(x,z,()=>{for(let s=0;s<4;s++){const n=o.seg?Math.max(1,Math.round((s<2?w:d)/o.seg)):segs(s<2?w:d);
      for(let f=0;f<fl;f++){const cells=f===0?cyc(s===front?fc:sc,n):cyc(s===front?(o.up||o.fc||['stucco']):(o.sup||sc),n);wallSideE(CE,x,z,w,d,f*fh,fh,s,cells,tint);}}
    roofFlat(x,z,w,d,h+(o.parapet||.12),o.roof||0xcfc8bc,o.band===undefined?shade(tint,.84):o.band);
    if(o.band!==undefined)boxC(M.flat,x,h-.7,z,w+.14,.55,d+.14,o.band);
    if(!o.noAC)for(let k=0;k<Math.round(w*d/200);k++)boxC(M.flat,x+rr(-w/3,w/3),h+(o.parapet||.12),z+rr(-d/3,d/3),1.4,.8,1.1,0xc9ccc8,0xb3b6b2);
    shadeRect(x,z,w,d,PADY,1.4);});
  solid(x,z,w,d,h+.3,0,1);buildings.push({x,z,w,d,h,flat:true});return tint;}
// big-box store: tall tilt-up walls, a raised entry portal with glass at the bottom and the store's name
function bigBox(x,z,w,d,front,name,o){o=o||{};const h=o.h||9,tint=o.tint===undefined?pick([0xe8dcc6,0xd9d2c4,0xe3d6c0]):o.tint,ax=front<2,flen=ax?w:d,s=SD[front],pw=Math.min(22,flen*.4);
  anchor(x,z,()=>{for(let q=0;q<4;q++){const len=q<2?w:d,n=Math.max(1,Math.round(len/8));
      if(q===front){const nb=Math.max(2,Math.round(flen/8)),cells=[];for(let k=0;k<nb;k++)cells.push(Math.abs(k-(nb-1)/2)<pw/16?'glassFront':'tilt');wallSideE(CE,x,z,w,d,0,4,q,cells,tint);wallSideE(CE,x,z,w,d,4,h-4,q,rep('tilt',nb),tint);}
      else{wallSideE(CE,x,z,w,d,0,h,q,cyc(q===(front^1)?['tilt','dock','tilt']:['tilt'],n),tint);}}
    roofFlat(x,z,w,d,h+.3,0xcfc8bc,o.band===undefined?shade(tint,.8):o.band);if(o.band!==undefined)boxC(M.flat,x,h-1.1,z,w+.14,.9,d+.14,o.band);
    // portal
    const px=x+s[0]*(w/2+.6),pz=z+s[1]*(d/2+.6),pd=1.2;boxC(M.flat,px,0,pz,ax?pw:pd,h+3.2,ax?pd:pw,shade(tint,1.04),0xd7cfc0);
    const fu=cuv(CI.glassFront);faceQuad(px,pz,ax?pw:pd,ax?pd:pw,front,0,pw-2.4,PADY,3.8,[fu[0],fu[1]+(fu[3]-fu[1])*.02,fu[2],fu[1]+(fu[3]-fu[1])*.62],.02);
    boxC(M.flat,x+s[0]*(w/2+pd+1.5),3.9,z+s[1]*(d/2+pd+1.5),ax?pw-2:3,.25,ax?3:pw-2,0xd7cfc0);
    for(let k=0;k<Math.round(w*d/400);k++)boxC(M.flat,x+rr(-w/3,w/3),h+.3,z+rr(-d/3,d/3),2,1,1.5,0xc9ccc8,0xb3b6b2);
    shadeRect(x,z,w,d,PADY,2);});
  isoR(()=>shopLife(x,z,w,d,front,0,0,pw));
  if(name){const sy=h-.6,px=x+s[0]*(w/2+1.25),pz=z+s[1]*(d/2+1.25);sign(name,px,sy+.6,pz,[PI,0,-PI/2,PI/2][front],Math.min(pw-2,name.length*1.3+2),2.2,o.bg||'#f4f0e7',o.fg||'#b3261e',true);}
  solid(x,z,w,d,h+.4,0,1);solid(x+s[0]*(w/2+.6),z+s[1]*(d/2+.6),ax?pw:1.2,ax?1.2:pw,h+3.2,0,1);buildings.push({x,z,w,d,h,flat:true});return tint;}
// tilt-up warehouse with truck doors along one side; trailers backed up to some of them
const trailers=[];
function warehouse(x,z,w,d,dock,o){o=o||{};const h=o.h||rr(9,12),tint=o.tint===undefined?pick([0xd8d3c8,0xe0dbd0,0xcfd2d0,0xd9cfc0]):o.tint,band=o.band===undefined?pick([0x5f7f95,0x6b8a6e,0x8a6a5a,0x4f6680,0x9a8f7a]):o.band;
  anchor(x,z,()=>{for(let q=0;q<4;q++){const len=q<2?w:d,n=Math.max(1,Math.round(len/8));
      if(q===dock){const cells=[];for(let k=0;k<n;k++)cells.push(k%2?'dock':'tilt');wallSideE(CE,x,z,w,d,0,4,q,cells,tint);wallSideE(CE,x,z,w,d,4,h-4,q,rep('tilt',n),tint);}
      else wallSideE(CE,x,z,w,d,0,h,q,rep('tilt',n),tint);}
    roofFlat(x,z,w,d,h+.4,0xc9c4ba,shade(tint,.86));boxC(M.flat,x,h-1.6,z,w+.1,.5,d+.1,band);
    // office corner: blue glass and a canopy
    const ofs=(dock^1),s=SD[ofs],ax=ofs<2,ow=16,ox=x+(ax?-w/2+ow/2+2:s[0]*(w/2+.15)),oz=z+(ax?s[1]*(d/2+.15):-d/2+ow/2+2);
    faceQuad(x,z,w,d,ofs,ax?(ofs===1?-w/2+ow/2+2:w/2-ow/2-2):(ofs===3?d/2-ow/2-2:-d/2+ow/2+2),ow,1,4,cuv(CI.office),.04,0xffffff);
    shadeRect(x,z,w,d,PADY,2.2);});
  // trailers at the doors
  const s=SD[dock],ax=dock<2,len=ax?w:d,n=Math.max(1,Math.round(len/8));
  for(let k=1;k<n;k+=2)if(rnd()<.45){const u=-len/2+(k+.5)*len/n,tx=ax?x+u:x+s[0]*(w/2+7.6),tz=ax?z+s[1]*(d/2+7.6):z+u;trailers.push([tx,tz,ax?0:1]);}
  solid(x,z,w,d,h+.5,0,1);buildings.push({x,z,w,d,h,flat:true});return tint;}
// ---------- dressing: life round a shop building (side stream). Behind it dumpsters with grease stains; on a strip's covered walk (dep metres
// deep, n bays) banners under the roof edge, a payphone and newspaper boxes; a big box (pw: portal width) gets them by its doors.
function shopLife(x,z,w,d,front,n,dep,pw){const s=SD[front],b=SD[front^1],ax=front<2,flen=ax?w:d,ryF=Math.atan2(s[0],s[1]),ryB=Math.atan2(b[0],b[1]),
    W=(u,v,sd)=>ax?[x+u,z+sd[1]*(d/2+v)]:[x+sd[0]*(w/2+v),z+u];
  const nd=Math.max(1,Math.round(flen/(dep?24:30)));for(let k=0;k<nd;k++){if(rnd()<.25)continue;const u=-flen/2+flen*(k+.5)/nd+rr(-3,3),p=W(u,1.25,b);
    dumpSpots.push([p[0],p[1],ryB+rr(-.08,.08),Math.floor(rnd()*3)]);const c=solid(p[0],p[1],ax?2:1.5,ax?1.5:2,1.35,0,5);lowCover.push([p[0],p[1]]);
    for(let j=0;j<2;j++){const q=W(u+rr(-1.5,1.5),rr(.6,3),b);stain(q[0],q[1],rr(.4,.9),rr(.3,.8),rnd()*3,PADY);}}
  if(dep){for(let k=0;k<n;k++){if(rnd()>.26)continue;const u=-flen/2+flen*(k+.5)/n,p=W(u,dep-.12,s),uv=pick([DUV.open,DUV.sale,DUV.sale,DUV.grand,DUV.lease]);anchor(p[0],p[1],()=>boardQ(uv,p[0],2.72,p[1],ryF,Math.min(2.6,flen/n-.8),.55,true));}
    if(rnd()<.8){const k=Math.floor(rnd()*n),u=-flen/2+flen*(k+.5)/n,p=W(u+rr(-1,1),dep-.55,s);phoneSpots.push([p[0],p[1],ryF+PI]);solid(p[0],p[1],.5,.5,2.1,0,0);}
    if(rnd()<.85){const k=Math.floor(rnd()*n),u=-flen/2+flen*(k+.5)/n,m=2+Math.floor(rnd()*3);for(let j=0;j<m;j++){const p=W(u+(j-(m-1)/2)*.56,dep-.45,s);newsSpots.push([p[0],p[1],ryF,Math.floor(rnd()*3)]);}}}
  else if(pw){for(const e of [-1,1]){if(rnd()<.4)continue;const p=W(e*(pw/2+1.5),2.6,s);phoneSpots.push([p[0],p[1],ryF]);solid(p[0],p[1],.5,.5,2.1,0,0);}
    const m=2+Math.floor(rnd()*2);for(let j=0;j<m;j++){const p=W(-pw/2-3+j*.56,2.2,s);newsSpots.push([p[0],p[1],ryF+PI,Math.floor(rnd()*3)]);}}}
// mid-rise office: ribbon windows on every floor
function office(x,z,w,d,floors,o){o=o||{};const tint=o.tint===undefined?pick([0xe6e2d8,0xd8d2c4,0xcfc9bc]):o.tint,h=floors*4;
  anchor(x,z,()=>{for(let q=0;q<4;q++){const n=Math.max(1,Math.round((q<2?w:d)/6));for(let f=0;f<floors;f++)wallSideE(CE,x,z,w,d,f*4,4,q,rep(f===0&&q===(o.front===undefined?1:o.front)?'glassFront':'office',n),tint);}
    roofFlat(x,z,w,d,h+.5,0xcfc8bc,shade(tint,.8));boxC(M.flat,x,h+.5,z,w*.4,2.2,d*.4,shade(tint,.9));shadeRect(x,z,w,d,PADY,2);});
  solid(x,z,w,d,h+.6,0,1);buildings.push({x,z,w,d,h,flat:true});}
// two-story apartment building with a hip tile roof and outside stairs
function apartment(x,z,w,d,front,o){o=o||{};const tint=o.tint===undefined?pick(wallCols):o.tint,roof=o.roof===undefined?pick(roofCols):o.roof,s=SD[front],ax=front<2;
  anchor(x,z,()=>{for(let q=0;q<4;q++){const n=segs(q<2?w:d),fp=q===front?['hwin','doorMetal','hwinW','doorMetal']:q===(front^1)?['hwinW','hwin']:['stucco','hwin'];
      wallSideE(CE,x,z,w,d,0,2.9,q,cyc(fp,n),tint);wallSideE(CE,x,z,w,d,2.9,2.9,q,cyc(q===front?['hwin','doorMetal','hwin']:['hwin','stucco'],n),tint);}
    hipRoof(x,z,w,d,5.8,.32,roof,.5);
    // balcony walkway and a stair at each end
    const bx=x+s[0]*(w/2+.8),bz=z+s[1]*(d/2+.8),bl=(ax?w:d)-1;boxC(M.flat,bx,2.75,bz,ax?bl:1.6,.18,ax?1.6:bl,0xd7cfc0);boxC(M.flat,bx+s[0]*.75,2.93,bz+s[1]*.75,ax?bl:.06,1,ax?.06:bl,0x4a4038);
    shadeRect(x,z,w,d,PADY,1.2);});
  solid(x,z,w,d,7.4,0,1);buildings.push({x,z,w,d,h:5.8,flat:false});}
