// =====================================================================
// 05 SOLDIERS: people made of smooth lofted shapes (one skinned mesh each), arms that reach for the weapon, walk and run cycles,
// death falls, hit volumes
// =====================================================================
// Kingsley Prime Security (KPS): four kinds of hostile. The squad: Junebug and Mr. Pennington. 'ally' is a team mate in multiplayer.
// Bobo is his own kind: no gun, 1.35 times the size, eight times the health; he ends up on your side (07b).
const KIND={
  rifle:{hp:100,spd:3.6,acc:.42,dmg:13,range:75,rof:.11,burst:[3,5],pause:[.7,1.6],snd:'ak',pref:26,label:'Security officer',drop:'ak'},
  rush:{hp:80,spd:5.4,acc:.3,dmg:8,range:28,rof:.075,burst:[5,9],pause:[.4,.9],snd:'smg',pref:8,label:'Rapid responder',drop:'smg'},
  heavy:{hp:330,spd:2.3,acc:.34,dmg:10,range:70,rof:.09,burst:[9,15],pause:[1.2,2.2],snd:'lmg',pref:20,label:'Riot specialist',drop:'lmg',sc:1.14,headK:1.5},
  mark:{hp:90,spd:0,acc:.8,dmg:58,range:170,rof:1,burst:[1,1],pause:[2.6,3.6],snd:'dmr',pref:90,label:'Rooftop spotter',drop:'dmr'},
  ally:{hp:260,spd:4.6,acc:.5,dmg:30,range:80,rof:.1,burst:[3,5],pause:[.5,1.2],snd:'m4',pref:20,label:'',drop:null},
  june:{hp:260,spd:4.6,acc:.42,dmg:16,range:60,rof:.08,burst:[4,7],pause:[.6,1.3],snd:'smg',pref:16,label:'',drop:null},
  penn:{hp:260,spd:4.4,acc:.72,dmg:48,range:110,rof:.5,burst:[1,2],pause:[1,1.8],snd:'dmr',pref:30,label:'',drop:null},
  bobo:{hp:800,spd:2.4,acc:0,dmg:0,range:0,rof:1,burst:[0,0],pause:[1,1],snd:'m4',pref:0,label:'Bobo',drop:null,sc:1.35,headK:1.5,allyHp:1500}};
// cloth weave and faint wear (kept for other modules' simple meshes and the weapon pick-ups)
const solMat=L({vertexColors:true,map:tex(64,64,(g,w,h)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);for(let k=0;k<26;k++){g.fillStyle=rnd()<.5?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(3,9),rr(2,6),rnd()*3,0,7);g.fill();}
  noise(g,w,h,500,.12);},true)});
GEO.limb=new T.CylinderGeometry(1,.8,1,8,1,true);GEO.limb.translate(0,-.5,0); // tapered, hangs down from its origin
GEO.ball=new T.SphereGeometry(1,8,6);GEO.cap=new T.SphereGeometry(1,10,5,0,TAU,0,PI/2);GEO.torso=new T.CylinderGeometry(1,.8,1,10,2);GEO.torso.translate(0,.5,0);

// ---------- figure toolkit
// fgPatch: a smooth surface through a grid of points F(i,j,out): rings i = 0..m-1, columns j = 0..n (F is also asked for j = -1 and n+1, so
// the normals of a part of a ring match the rest of it). It faces away from o.inn (a point, or function(i,out) giving one per ring).
// o.col: colour or function(i,j,x,y,z); o.uv(u,v,x,y,z,out) maps the patch's own u (round) and v (along) into the texture atlas.
const FQ=[0,0,0],FA0=[0,0,0],FB0=[0,0,0],FC0=[0,0,0],FD0=[0,0,0],FU=[0,0],FI=[0,0,0];
function fgPatch(b,m,n,F,o){const k0=b.p.length/3,cf=typeof o.col==='function'?o.col:null,c0=o.col||0,inn=o.inn,ap=[];let vote=0;
  for(let i=0;i<m;i++){let deg=1;const i1=Math.min(m-1,i+1),i0=Math.max(0,i-1);
    if(typeof inn==='function')inn(i,FI);else if(inn){FI[0]=inn[0];FI[1]=inn[1];FI[2]=inn[2];}
    for(let j=0;j<=n;j++){F(i,j,FQ);const x=FQ[0],y=FQ[1],z=FQ[2];F(i,j+1,FA0);F(i,j-1,FB0);
      let ax=FA0[0]-FB0[0],ay=FA0[1]-FB0[1],az=FA0[2]-FB0[2];
      if(ax*ax+ay*ay+az*az<1e-12){const q=i?i-1:1;F(q,j+1,FA0);F(q,j-1,FB0);ax=FA0[0]-FB0[0];ay=FA0[1]-FB0[1];az=FA0[2]-FB0[2];}else deg=0;
      F(i1,j,FC0);F(i0,j,FD0);const lx=FC0[0]-FD0[0],ly=FC0[1]-FD0[1],lz=FC0[2]-FD0[2];
      let nx=ly*az-lz*ay,ny=lz*ax-lx*az,nz=lx*ay-ly*ax;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
      if(inn)vote+=nx*(x-FI[0])+ny*(y-FI[1])+nz*(z-FI[2]);
      b.p.push(x,y,z);b.n.push(nx,ny,nz);const c=cf?cf(i,j,x,y,z):c0;b.c.push((c>>16&255)/255,(c>>8&255)/255,(c&255)/255);
      const u=j/n,v=m>1?i/(m-1):0;if(o.uv)o.uv(u,v,x,y,z,FU);else{FU[0]=u;FU[1]=v;}b.u.push(FU[0],FU[1]);}
    ap.push(deg);}
  // a ring shrunk to a point: its normals are the average of its columns
  for(let i=0;i<m;i++)if(ap[i]){let sx=0,sy=0,sz=0;for(let j=0;j<=n;j++){const q=(k0+i*(n+1)+j)*3;sx+=b.n[q];sy+=b.n[q+1];sz+=b.n[q+2];}const l=Math.hypot(sx,sy,sz)||1;
    for(let j=0;j<=n;j++){const q=(k0+i*(n+1)+j)*3;b.n[q]=sx/l;b.n[q+1]=sy/l;b.n[q+2]=sz/l;}}
  const flip=vote<0;if(flip)for(let q=k0*3;q<b.n.length;q++)b.n[q]=-b.n[q];
  for(let i=0;i<m-1;i++)for(let j=0;j<n;j++){const a=k0+i*(n+1)+j,c=a+n+1;
    if(!ap[i]){if(flip)b.i.push(a,a+1,c);else b.i.push(a,c,a+1);}if(!ap[i+1]){if(flip)b.i.push(a+1,c+1,c);else b.i.push(a+1,c,c+1);}}
  return b;}
// rings [t, rx, rA, cx, cA, lift, rB, col]: t runs along the axis (y; z with o.ax), rx is the half-width, rA/rB the half-depth in front and
// behind (below and above with o.ax), cx/cA the centre; lift moves the front of the ring along the axis. o.sq < 1 squares the section off;
// o.a0..o.a1 (turns) draws part of the ring; o.ang a list of angles (turns); o.rad(a,i) scales the radius, o.dy(a,i) moves it along the axis.
function fgRing(R,n,o){const sq=o.sq||1,a0=o.a0||0,da=((o.a1===undefined?1:o.a1)-a0)/n,ang=o.ang,ax=o.ax,rad=o.rad,dy=o.dy;
  return(i,j,q)=>{const r=R[i];let t;if(ang){const N=ang.length-1;t=j<0?ang[N-1]-1:j>N?ang[1]+1:ang[j];}else t=a0+j*da;const a=t*TAU,c=Math.cos(a),s=Math.sin(a),
    pc=sq===1?c:Math.sign(c)*Math.pow(Math.abs(c),sq),ps=sq===1?s:Math.sign(s)*Math.pow(Math.abs(s),sq),f=rad?rad(a,i):1,
    d=s<0?r[2]:(r[6]===undefined?r[2]:r[6]),x=(r[3]||0)+r[1]*pc*f,w=(r[4]||0)+d*ps*f,u=r[0]+(r[5]||0)*(s<0?-s:0)+(dy?dy(a,i):0);
    if(ax){q[0]=x;q[1]=w;q[2]=u;}else{q[0]=x;q[1]=u;q[2]=w;}return q;};}
// a tube through rings, in a figure context X (atlas cell per mode, vertex colours)
function fgTube(b,X,R,n,o){const md=o.mode||0,ax=o.ax;const N=o.ang?o.ang.length-1:n;
  return fgPatch(b,R.length,N,fgRing(R,N,o),{col:o.col!==undefined?(typeof o.col==='function'?o.col:X.vc(md,o.col)):(i)=>X.vc(md,R[i][7]===undefined?o.c:R[i][7]),
    inn:o.inn||((i,q)=>{const r=R[i];q[0]=r[3]||0;if(ax){q[1]=r[4]||0;q[2]=r[0];}else{q[1]=r[0];q[2]=r[4]||0;}return q;}),
    uv:o.uv||((u,v,x,y,z,q)=>X.uv(md,u,v,q))});}
// a primitive (box, rod...) with its uv moved into the atlas cell of mode m
function fgAdd(b,X,m,geo,x,y,z,rx,ry,rz,sx,sy,sz,c){const k=b.u.length;b.add(geo,x,y,z,rx,ry,rz,sx,sy,sz,X.vc(m,c));
  for(let i=k;i<b.u.length;i+=2){X.uv(m,b.u[i],b.u[i+1],FU);b.u[i]=FU[0];b.u[i+1]=FU[1];}return b;}
// a primitive that grows along +y, stretched from point a to point c
const FGE=new T.Euler(),_fq=new T.Quaternion(),_fv=new T.Vector3(),_fy=new T.Vector3(0,1,0);
function fgSeg(b,X,m,geo,ax,ay,az,cx,cy,cz,w,d,c){_fv.set(cx-ax,cy-ay,cz-az);const l=_fv.length()||1e-6;_fv.multiplyScalar(1/l);_fq.setFromUnitVectors(_fy,_fv);FGE.setFromQuaternion(_fq,'YXZ');
  return fgAdd(b,X,m,geo,ax,ay,az,FGE.x,FGE.y,FGE.z,w,l,d===undefined?w:d,c);}
// a tube along a path of points with radii (fingers, straps, a ponytail); faces outwards
function fgSweep(b,X,m,pts,rads,n,c){const M=pts.length,TT=[],NN=[],BB=[];
  for(let k=0;k<M;k++){const a=pts[Math.max(0,k-1)],e=pts[Math.min(M-1,k+1)];let tx=e[0]-a[0],ty=e[1]-a[1],tz=e[2]-a[2];const l=Math.hypot(tx,ty,tz)||1;tx/=l;ty/=l;tz/=l;
    let ux=0,uy=1,uz=0;if(Math.abs(ty)>.9){ux=0;uy=0;uz=-1;}let nx=uy*tz-uz*ty,ny=uz*tx-ux*tz,nz=ux*ty-uy*tx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    TT.push([tx,ty,tz]);NN.push([nx,ny,nz]);BB.push([ty*nz-tz*ny,tz*nx-tx*nz,tx*ny-ty*nx]);}
  return fgPatch(b,M,n,(i,j,q)=>{const a=j/n*TAU,r=rads[i],ca=Math.cos(a)*(r.length?r[0]:r),sa=Math.sin(a)*(r.length?r[1]:r),p=pts[i],N=NN[i],B=BB[i];q[0]=p[0]+N[0]*ca+B[0]*sa;q[1]=p[1]+N[1]*ca+B[1]*sa;q[2]=p[2]+N[2]*ca+B[2]*sa;return q;},
    {col:X.vc(m,c),inn:(i,q)=>{q[0]=pts[i][0];q[1]=pts[i][1];q[2]=pts[i][2];return q;},uv:(u,v,x,y,z,q)=>X.uv(m,u,v,q)});}
// the head: a profile of rings (waist frame: y up from the waist, front -z) with a rounded crown; fgHead(y,a) is a point on it, off
// pushes it out along the surface (hair, caps, a beard follow the same skull)
const HK=[[.47,.054,.052,.054,.008],[.535,.05,.048,.051,.008],[.582,.057,.066,.06,-.006],[.607,.069,.086,.072,-.01],[.645,.074,.095,.088,-.005],[.69,.078,.1,.099,-.002],[.727,.08,.096,.103,0],[.75,.08,.101,.104,.001],[.772,.077,.095,.102,.003]],HTOP=.83;
function fgHeadR(y,a,q){let rx,rf,rb,cz;if(y>=.772){const t=Math.min(1,(y-.772)/(HTOP-.772)),k=Math.sqrt(Math.max(0,1-t*t));rx=.077*k;rf=.095*k;rb=.102*k;cz=.003+.006*t;}
  else{let k=0;while(k<HK.length-2&&y>HK[k+1][0])k++;const A=HK[k],B=HK[k+1],t=clamp((y-A[0])/(B[0]-A[0]),0,1);rx=lerp(A[1],B[1],t);rf=lerp(A[2],B[2],t);rb=lerp(A[3],B[3],t);cz=lerp(A[4],B[4],t);}
  const s=Math.sin(a);q[0]=rx*Math.cos(a);q[1]=y;q[2]=cz+(s<0?rf:rb)*s;return q;}
const HQ1=[0,0,0],HQ2=[0,0,0],HQ3=[0,0,0],HQ4=[0,0,0];
function fgHead(y,a,off,q){fgHeadR(y,a,q);if(!off)return q;if(y>=HTOP-1e-4){q[1]+=off;return q;}
  fgHeadR(y,a+.02,HQ1);fgHeadR(y,a-.02,HQ2);fgHeadR(Math.min(HTOP,y+.004),a,HQ3);fgHeadR(y-.004,a,HQ4);
  const ax=HQ1[0]-HQ2[0],ay=HQ1[1]-HQ2[1],az=HQ1[2]-HQ2[2],lx=HQ3[0]-HQ4[0],ly=HQ3[1]-HQ4[1],lz=HQ3[2]-HQ4[2];let nx=ly*az-lz*ay,ny=lz*ax-lx*az,nz=lx*ay-ly*ax;
  const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;if(nx*q[0]+ny*(q[1]-.69)+nz*(q[2]-.004)<0){nx=-nx;ny=-ny;nz=-nz;}q[0]+=nx*off;q[1]+=ny*off;q[2]+=nz*off;return q;}
// a shell over the skull from a hairline (a function of the angle) to the crown: hair, caps, helmets. th(a,t): thickness, t 0 at the edge
function fgShell(b,X,m,hl,th,col,rings,n,a0,a1){const R=rings||[0,.3,.62,.86,1];n=n||12;a0=a0||0;a1=a1===undefined?1:a1;const da=(a1-a0)/n;
  return fgPatch(b,R.length,n,(i,j,q)=>{const a=(a0+j*da)*TAU,y0=hl(a),t=R[i],y=y0+(HTOP-y0)*t;fgHead(Math.min(HTOP,y),a,th(a,t),q);return q;},
    {col:typeof col==='function'?col:X.vc(m,col),inn:[0,.69,.004],uv:(u,v,x,y,z,q)=>X.uv(m,u,v,q)});}
// the soldier atlas (128 x 128): cloth weave, a face (only darker marks, so it suits every skin tone), hair strands, Junebug's loud print,
// the souvenir print on Bobo's shirt, the KPS patch and a white texel. Vertex colours tint the plain cells.
const FCELL={11:[0,.5,.5,.5],1:[0,.5,.5,.5],2:[.5,.5,.5,.5],3:[0,0,.5,.5],4:[0,.5,.5,.5],5:[0,.5,.5,.5],6:[.5,.25,.5,.25],7:[.5,0,.25,.25],8:[.75,.125,.25,.125]};
const FIGT=tex(128,128,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,128,128);
  g.fillStyle='#dcdcdc';g.fillRect(0,0,64,64);for(let y=0;y<64;y+=2){g.fillStyle='rgba(0,0,0,.035)';g.fillRect(0,y,64,1);}for(let x=0;x<64;x+=3){g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x,0,1,64);}
  for(let k=0;k<22;k++){g.fillStyle=rnd()<.5?'rgba(255,255,255,.09)':'rgba(0,0,0,.06)';g.beginPath();g.ellipse(rnd()*64,rnd()*64,rr(3,8),rr(2,5),rnd()*3,0,7);g.fill();}noise(g,64,64,300,.1);
  // the face: x = 64 + (hx + .1) * 320, y = (.815 - hy) * 320 (head frame, metres)
  const X=hx=>64+(hx+.1)*320,Y=hy=>(.815-hy)*320,E=(x,y,rx,ry,a)=>{g.fillStyle='rgba(0,0,0,'+a+')';g.beginPath();g.ellipse(X(x),Y(y),rx,ry,0,0,TAU);g.fill();};
  let gr=g.createLinearGradient(64,0,128,0);gr.addColorStop(0,'rgba(0,0,0,.16)');gr.addColorStop(.3,'rgba(0,0,0,0)');gr.addColorStop(.7,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.16)');g.fillStyle=gr;g.fillRect(64,0,64,64);
  gr=g.createLinearGradient(0,40,0,64);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=gr;g.fillRect(64,40,64,24);
  for(const s of [-1,1]){E(s*.033,.729,7.5,4.2,.2);E(s*.033,.727,3.6,1.5,.55);E(s*.034,.727,1.6,1.4,.45);
    g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.moveTo(X(s*.012),Y(.751));g.quadraticCurveTo(X(s*.032),Y(.762),X(s*.056),Y(.752));g.lineTo(X(s*.054),Y(.747));g.quadraticCurveTo(X(s*.032),Y(.755),X(s*.013),Y(.746));g.fill();
    E(s*.009,.671,1.4,1,.45);E(s*.016,.69,1.5,5,.08);E(s*.05,.668,6,8,.06);}
  E(0,.649,7.5,1.1,.42);E(0,.656,6,1.6,.12);E(0,.641,5,1.5,.1);E(0,.612,6,2.5,.06);
  // hair: strands along v
  g.fillStyle='#d4d4d4';g.fillRect(0,64,64,64);for(let k=0;k<160;k++){const x=rnd()*64,y=64+rnd()*64,l=rr(6,20);g.strokeStyle=rnd()<.6?'rgba(0,0,0,'+rr(.08,.25).toFixed(2)+')':'rgba(255,255,255,'+rr(.1,.3).toFixed(2)+')';g.lineWidth=rr(.6,1.4);
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+rr(-2,2),y+l/2,x+rr(-3,3),y+l);g.stroke();}
  // Junebug's print: big flowers and leaves on teal
  g.fillStyle='#16a19c';g.fillRect(64,64,64,32);const C=['#f4c542','#f0684f','#f6f1e4','#0d6f6b'];
  for(let k=0;k<30;k++){const x=64+rnd()*64,y=64+rnd()*32,c=C[k%4];g.fillStyle=c;if(k%4===3){g.beginPath();g.ellipse(x,y,rr(2,4),rr(5,7),rnd()*3,0,TAU);g.fill();}
    else{for(let p=0;p<5;p++){const a=p/5*TAU;g.beginPath();g.ellipse(x+Math.cos(a)*2.2,y+Math.sin(a)*2.2,1.8,1.2,a,0,TAU);g.fill();}g.fillStyle='#f6f1e4';g.beginPath();g.arc(x,y,.9,0,TAU);g.fill();}}
  // the souvenir shirt: sky blue, a sun over a palm and waves (front), plain elsewhere
  g.fillStyle=css(shade(0x8fd0ef,.86));g.fillRect(64,96,32,32);noise(g,32,32,90,.08,64,96);g.fillStyle='#ffcf3a';g.beginPath();g.arc(84,105,4.5,0,TAU);g.fill();g.strokeStyle='#2f9a52';g.lineWidth=1.4;
  for(const a of [-.9,-.3,.4,1]){g.beginPath();g.moveTo(80,108);g.quadraticCurveTo(80+Math.cos(a-1.57)*4,104,80+Math.sin(a)*6,108+Math.cos(a)*2);g.stroke();}g.strokeStyle='#7a5a32';g.lineWidth=1.3;g.beginPath();g.moveTo(80,108);g.quadraticCurveTo(81,113,79,118);g.stroke();
  g.strokeStyle='#2f6fd8';g.lineWidth=1.2;for(const y of [119,122]){g.beginPath();for(let x=72;x<=92;x+=2)g.lineTo(x,y+Math.sin(x*.9)*1);g.stroke();}g.fillStyle='#d8412f';g.fillRect(73,123,18,2);
  // KPS patch: black letters on gold
  g.fillStyle='#e2b53e';g.fillRect(96,96,32,16);g.fillStyle='#17181b';g.font='bold 11px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('KPS',112,104.5);
  g.fillStyle='#fff';g.fillRect(96,112,32,16);});
const SXC={uv(m,u,v,q){const c=FCELL[m];if(!c){q[0]=.875;q[1]=.06;return q;}const e=1.5/128;q[0]=c[0]+e+clamp(u,0,1)*(c[2]-2*e);q[1]=c[1]+e+clamp(v,0,1)*(c[3]-2*e);return q;},
  vc(m,c){return m>=6&&m<=8?0xffffff:c;},face:true};
// ---------- one person's parts, from a look L (the old UNI fields still work). X: the figure context (atlas mapping, vertex colours).
// Every part is in the frame of its bone (the hips, the chest and the head in the waist frame). Returns
// {up, hips, armL/R, foreL/R, thighL/R, shinL/R, footL/R, head}.
function figParts(L,X){const o={},sk=L.skin||0xc68e64,Wd=L.w||1,BL=L.belly||0,kps=!!L.patch,S=L.shirt===undefined?0x8a8f96:L.shirt,Sm=L.shirtMode||(L.print?6:1),
    sl=L.sleeve||(L.sl?'long':'short'),cut=L.cut||(L.baggy?'baggy':L.shorts?'shorts':'reg'),tuck=L.tuck!==undefined?L.tuck:kps,Pn=L.pants===undefined?0x3a4458:L.pants,
    gl=L.glove||sk,aw=L.armW||1,lw=L.legW||1,rise=L.rise===undefined?.035:L.rise,hatT=(L.hat==='hair'||L.hat==='none')?null:L.hat,hairC=L.hair!==undefined?L.hair:(L.hat==='hair'?L.hatC:0x1d1610),
    hs=L.hairStyle||'short',shoeT=L.shoeType||(kps||L.boot?'boot':'sneaker'),shoe=L.shoe===undefined?(shoeT==='boot'?0x1c1a18:0x2a2a2c):L.shoe,am=Sm===7?1:Sm;
  const tb=(b,R,n,op)=>fgTube(b,X,R,n,op),bx=(b,m,x,y,z,rx,ry,rz,sx,sy,sz,c)=>fgAdd(b,X,m,GEO.box,x,y,z,rx,ry,rz,sx,sy,sz,c);
  let b=new GB();
  // the chest: from the shirt's hem (tucked in, or over the jeans) to the base of the neck; a belly pushes the front out
  const crop=L.crop,hem=crop!==undefined?crop:L.hemY!==undefined?L.hemY:tuck?rise-.06:rise+.006,tank=sl==='none',
    TR=[[hem,.158*Wd+(tuck?0:.006),.104+BL*.6,0,-BL*.3,0,.1],[Math.max(hem+.04,.03),.151*Wd,.1+BL,0,-BL*.45,0,.097],[.15,.156*Wd,.107+BL*.7,0,-BL*.3,0,.101],[.26,.169*Wd,.117+BL*.25,0,-BL*.1,0,.107],
      [.35,.18*Wd,.12,0,0,0,.11],[.41,.185*Wd,.112,0,.002,0,.106],[.455,.174*Wd,.093,0,.006,0,.093],[.5,.122*Wd,.074,0,.008,0,.077],[.535,.07,.058,0,.008,0,.06]].filter((r,i)=>i===0||r[0]>hem+.02);
  if(crop!==undefined)tb(b,[[rise-.01,.152*Wd,.1+BL*.9,0,-BL*.4,0,.096],[(rise+crop)/2,.15*Wd,.102+BL,0,-BL*.45,0,.095],[crop+.03,.153*Wd,.104+BL*.8,0,-BL*.35,0,.098]],10,{c:sk,sq:.85}); // the belly the shirt does not reach
  tb(b,TR,10,{sq:.85,mode:Sm,col:tank&&!X.paint?(i,j,x,y)=>X.vc(Sm,(y>.36&&Math.abs(x)>.1+(.5-y)*.3)?sk:S):S});
  if(L.chestPrint){const R0=TR,Fp=(i,j,q)=>{const y=[.15,.26,.35,.415][i],a=(.62+j*.26/6)*TAU;let k=0;while(k<R0.length-2&&y>R0[k+1][0])k++;const A=R0[k],B=R0[k+1],t=clamp((y-A[0])/(B[0]-A[0]),0,1),
      rx=lerp(A[1],B[1],t)+.003,rz=lerp(A[2],B[2],t)+.003,cz=lerp(A[4]||0,B[4]||0,t),c=Math.cos(a),sn=Math.sin(a);q[0]=rx*Math.sign(c)*Math.pow(Math.abs(c),.85);q[1]=y;q[2]=cz-rz*Math.pow(Math.abs(sn),.85);return q;};
    fgPatch(b,4,6,Fp,{col:X.vc(L.chestPrint,0xffffff),inn:[0,.3,0],uv:(u,v,x,y,z,q)=>X.uv(L.chestPrint,(x+.15)/.3,(y-.15)/.27,q)});}
  if(crop!==undefined||!tuck)tb(b,[[hem,TR[0][1],TR[0][2],0,TR[0][4],0,TR[0][6]],[hem+.003,TR[0][1]-.012,TR[0][2]-.012,0,TR[0][4],0,TR[0][6]-.012]],10,{sq:.85,c:shade(S,.7),inn:[0,hem+.1,0]});
  const col=L.collar||(kps||L.tie?'polo':'crew');
  if(col==='polo'){tb(b,[[.497,.096*Wd,.08,0,.006,-.032,.083],[.552,.077,.065,0,.006,-.05,.067]],10,{c:shade(S,.9),mode:am});bx(b,am,0,.4,-.121,-.16,0,0,.032,.1,.008,shade(S,.88));}
  else if(col==='crew')tb(b,[[.52,.074*Wd,.062,0,.008,0,.064],[.533,.066,.055,0,.008,0,.058]],10,{c:L.collarC!==undefined?L.collarC:shade(S,.82),mode:L.collarC!==undefined?0:am});
  if(L.tie){bx(b,1,0,.21,-.124,-.05,0,0,.036,.27,.01,0x1b1c20);bx(b,0,.1,.36,-.123,0,0,0,.05,.05,.01,KPS_GOLD);}
  if(L.lanyard){for(const s of [-1,1])fgSeg(b,X,0,GEO.box,s*.055,.52,-.06,s*.012,.26,-.124,.013,.006,L.lanyard);bx(b,0,0,.17,-.128,0,0,0,.065,.09,.008,0xf4f3ee);bx(b,0,0,.24,-.129,0,0,0,.065,.02,.008,L.lanyard);}
  // vest: plate carrier with cut-outs at the arms, straps over the shoulders, the KPS patch, pouches and a radio
  if(L.vest&&L.vest!=='rig'){const V=L.vest,P0=L.pouch||shade(V,.8),h=L.heavy?1:0,e=h?.026:0;
    tb(b,[[h?.0:.09,.174*Wd+e,.128+BL*.6+e,0,-BL*.3,0,.119+e],[.22,.182*Wd+e,.136+BL*.2+e,0,-BL*.1,0,.124+e],[.33,.19*Wd+e,.136+e,0,0,0,.125+e],[.43,.18*Wd+e,.121+e,0,.004,0,.119+e],[.445,.16*Wd,.1,0,.004,0,.1]],8,
      {sq:.6,c:V,mode:1,dy:(a,i)=>{const c=Math.pow(Math.abs(Math.cos(a)),3);return i>=3?-.115*c:i===2?-.03*c:0;}});
    for(const s of [-1,1])bx(b,1,s*.112,.43,-.11,0,0,0,.062,.035,.22,shade(V,.92));
    bx(b,8,0,.215,.127+e,0,0,0,.2,.085,.006,0xffffff);bx(b,8,-.085,.315,-.138-e,0,0,0,.075,.04,.006,0xffffff);
    for(const x of h?[-.08,.03]:[-.07,.01])bx(b,1,x,.1+(h?.02:0),-.145-e,0,0,0,.07,.105,.045,P0);
    bx(b,0,.105,.25,-.142-e,0,0,0,.045,.085,.026,0x15151a);fgAdd(b,X,0,GEO.rod,.115,.33,-.142-e,0,0,0,.005,.12,.005,0x111114);
    if(h){bx(b,1,0,.505,-.04,0,0,0,.2,.05,.17,V);bx(b,1,0,-.1,-.135,0,0,0,.2,.16,.03,V);}}            // riot collar and groin plate
  else if(L.vest==='rig'){const P0=L.pouch||0x2c2f33;bx(b,1,0,.15,-.14,0,0,0,.3,.16,.045,P0);for(const x of [-.095,0,.095])bx(b,1,x,.17,-.17,0,0,0,.08,.13,.04,shade(P0,.85));
    for(const s of [-1,1])fgSeg(b,X,1,GEO.box,s*.11,.3,-.135,s*.115,.5,0,.04,.012,shade(P0,.9));fgSeg(b,X,1,GEO.box,-.12,.5,.08,.12,.15,.12,.04,.012,shade(P0,.9));}
  if(L.pack)bx(b,1,0,.12,.115,-.04,0,0,.24,.3,.085,shade(L.vest&&L.vest!=='rig'?L.vest:L.pouch||0x2c2f33,.88));
  if(L.radio&&!L.vest){bx(b,0,.1,.3,-.123,0,0,0,.04,.075,.022,0x15151a);fgAdd(b,X,0,GEO.rod,.108,.37,-.123,0,0,0,.004,.1,.004,0x111114);}
  o.up=b.build();
  // arms: the shoulder joint is the arm's origin; a sleeve with a hem, bare skin below it
  for(const s of [-1,1]){b=new GB();const A=[[.055,.046*aw,.05*aw,-s*.024,0],[.015,.062*aw,.06*aw,-s*.004,0],[-.06,.062*aw,.058*aw,s*.004,.002],[-.17,.052*aw,.053*aw,0,.004],[-.28,.046*aw,.047*aw,0,.002],[-.36,.042*aw,.043*aw,0,0]],
      big=r=>[r[0],r[1]+.008,r[2]+.008,r[3],r[4]],NA=7;
    const SC=L.sleeveC===undefined?S:L.sleeveC;
    if(sl==='long')tb(b,A.map(big),NA,{c:SC,mode:am});
    else if(tank)tb(b,A,NA,{c:sk});
    else{const e=sl==='rolled'?-.3:-.165,er=sl==='rolled'?[.06,.061]:[.063,.062].map(v=>v*aw);
      const dw=aw>1?1+(aw-1)*.7:1;tb(b,[[.05,.05*dw,.055*dw,-s*.03,0],[.012,.068*dw,.067*dw,-s*.006,0],sl==='rolled'?[-.2,.06,.061,0,.003]:null,[e,er[0],er[1],0,.003]].filter(r=>r),NA,{c:SC,mode:am});
      tb(b,[[e,er[0],er[1],0,.003],[e+.004,er[0]-.011,er[1]-.01,0,.003]],NA,{c:shade(SC,.7),inn:[0,e+.06,0]});
      tb(b,[[e+.03,.051*aw,.052*aw,0,.004],[-.28,.046*aw,.047*aw,0,.002],[-.36,.042*aw,.043*aw,0,0]],NA,{c:sk});}
    if(kps)bx(b,0,s*(.068*aw+(sl==='long'?.008:.012)),-.12,0,0,0,0,.006,.065,.055,L.patch);
    if(L.pads)bx(b,1,s*.025,-.1,0,0,0,s*.12,.09,.16,.13,L.vest||0x1f2124);
    o[s<0?'armL':'armR']=b.build();
    // forearm and hand: a loose fist, the palm towards the body, the fingers curled in
    b=new GB();const FR=[[.03,.042*aw,.043*aw,0,-.002],[-.04,.046*aw,.045*aw,0,-.004],[-.15,.039*aw,.036*aw,0,0],[-.25,.029*aw,.026*aw,0,0]];
    if(sl==='long')tb(b,[[.03,.05,.051,0,-.002],[-.04,.054,.053,0,-.004],[-.15,.047,.045,0,0],[-.25,.037,.035,0,0]],7,{c:SC,mode:am});
    else tb(b,FR,7,{c:sk});
    const hw=aw>1?1+(aw-1)*.6:1;
    tb(b,[[-.245,.024*hw,.028*hw,0,0],[-.29,.021*hw,.041*hw,-s*.002,-.002],[-.345,.023*hw,.044*hw,-s*.005,0],[-.4,.022*hw,.035*hw,-s*.012,.001],[-.422,.004,.006,-s*.015,0]],6,{c:gl});
    fgSeg(b,X,0,GEO.rod,-s*.01,-.275,-.032*hw,-s*.02,-.345,-.042*hw,.011*hw,.011*hw,gl);
    if(L.watch&&s<0)tb(b,[[-.215,.032,.03],[-.24,.031,.029]],7,{c:L.watch});
    if(L.bracelet&&s>0)tb(b,[[-.21,.034*aw,.032*aw],[-.235,.032*aw,.03*aw]],7,{c:L.bracelet});
    o[s<0?'foreL':'foreR']=b.build();}
  // hips: trousers from the waistband down to the crotch, a belt; KPS wear a duty belt with a holster
  b=new GB();const hw2=(cut==='baggy'?1.06:1)*Wd,hd=cut==='baggy'?1.1:1,HP=[[rise,.147*hw2,.097+BL*.3,0,-BL*.15,0,.094],[Math.min(rise-.03,-.04),.157*hw2,(.101+BL*.2)*hd,0,-BL*.08,0,.106*hd],[-.11,.165*hw2,.102*hd,0,.002,0,.114*hd],
    [-.18,.16*hw2,.097*hd,0,.004,0,.11*hd],[-.248,.112*hw2,.074*hd,0,.002,0,.08*hd],[-.272,.004,.004,0,0,0,.004]];
  tb(b,HP,10,{c:Pn,mode:L.seat?5:4,sq:.9});
  if(L.belt!==0&&cut!=='cutoff'){const bc=L.belt||(kps?0x17171a:0x2a2420),bw=kps?.045:.032,y0=rise-bw-.002;
    tb(b,[[y0,.153*hw2+.004,.1+BL*.25,0,-BL*.12,0,.1],[rise-.002,.148*hw2+.004,.098+BL*.3,0,-BL*.14,0,.096]],10,{c:bc,sq:.9});bx(b,0,0,y0+.004,-.103-BL*.42,0,0,0,.05,bw-.008,.008,kps?0x6e6e6e:0xb59a52);
    if(kps){bx(b,0,.165*Wd,-.15,.02,0,0,.05,.05,.19,.095,0x15151a);bx(b,0,-.15*Wd,-.05,-.075,0,.5,0,.05,.06,.04,0x1d1d20);}}
  o.hips=b.build();
  // legs
  const bag=cut==='baggy',sho=cut==='shorts'||cut==='cutoff';
  for(const s of [-1,1]){b=new GB();
    const TH=bag?[[.06,.088,.09,-s*.035,0],[0,.108,.11,-s*.014,.003],[-.22,.112,.115,0,.002],[-.44,.1,.102,0,-.004],[-.48,.1,.101,0,-.004]]
      :[[.06,.078*lw,.08*lw,-s*.035,0],[0,.094*lw,.098*lw,-s*.01,.003],[-.2,.086*lw,.089*lw,0,.002],[-.42,.071*lw,.073*lw,0,-.004],[-.47,.069*lw,.071*lw,0,-.004]];
    if(sho){const e=cut==='cutoff'?-.2:-.25,r=[.1*lw,.103*lw].map(v=>v*1.06);tb(b,[TH[0],TH[1],[e,r[0]*.92,r[1]*.92,0,.003]],8,{c:Pn,mode:4});
      tb(b,[[e,r[0]*.92,r[1]*.92,0,.003],[e+.003,r[0]*.92-.016,r[1]*.92-.016,0,.003]],8,{c:cut==='cutoff'?mixc(Pn,0xffffff,.45):shade(Pn,.65),inn:[0,e+.06,0]});
      tb(b,[[e+.03,.082*lw,.085*lw,0,.003],[-.32,.07*lw,.072*lw,0,0],[-.42,.062*lw,.065*lw,0,-.004],[-.47,.059*lw,.062*lw,0,-.004]],8,{c:sk});}
    else tb(b,TH,8,{c:Pn,mode:4});
    o[s<0?'thighL':'thighR']=b.build();
    b=new GB();
    if(sho){tb(b,[[.04,.058*lw,.06*lw],[-.04,.059*lw,.064*lw,0,.006],[-.12,.058*lw,.066*lw,0,.012],[-.24,.045*lw,.048*lw,0,.002],[-.33,.036*lw,.038*lw],[-.37,.035*lw,.037*lw]],8,{c:sk});
      if(L.sock)tb(b,[[-.235,.048,.05,0,.002],[-.33,.04,.041],[-.37,.039,.04]],8,{c:L.sock});}
    else if(bag){tb(b,[[.04,.1,.102],[-.12,.097,.099],[-.27,.097,.099],[-.325,.1,.103,0,-.004]],8,{c:Pn,mode:4,dy:(a,i)=>i===3?-.012*Math.max(0,Math.sin(a)):0});tb(b,[[-.325,.1,.103,0,-.004],[-.322,.05,.052]],8,{c:shade(Pn,.6),inn:[0,-.28,0],dy:(a,i)=>i===0?-.012*Math.max(0,Math.sin(a)):0});}
    else tb(b,shoeT==='boot'?[[.04,.07,.072,0,-.003],[-.06,.068,.07,0,.004],[-.2,.064,.066],[-.27,.062,.064]]:[[.04,.07,.072,0,-.003],[-.06,.068,.07,0,.004],[-.2,.064,.066],[-.32,.062,.064],[-.345,.063,.065]],8,{c:Pn,mode:4});
    o[s<0?'shinL':'shinR']=b.build();
    // feet: the ankle is the origin, the sole is at y -.07. Sneakers (white sole), boots, loafers or flip-flops
    b=new GB();const sole=L.sole===undefined?(shoeT==='sneaker'?0xeceae4:shoeT==='boot'?0x232120:0x3a2a1e):L.sole;
    if(shoeT==='flip'){tb(b,[[.07,.012,.012,0,-.035,0,.012],[.055,.04*lw,.03,0,-.04,0,.03],[0,.047*lw,.03,0,-.04,0,.045],[-.08,.052*lw,.025,0,-.045,0,.03],[-.15,.052*lw,.02,0,-.05,0,.018],[-.19,.04*lw,.015,0,-.052,0,.012],[-.205,.01,.006,0,-.054,0,.006]],8,{ax:1,c:sk,sq:.8});
      tb(b,[[.08,.03,.006,0,-.066,0,.006],[.06,.05*lw,.006,0,-.066,0,.006],[-.1,.06*lw,.006,0,-.066,0,.006],[-.2,.048*lw,.006,0,-.066,0,.006],[-.222,.012,.006,0,-.066,0,.006]],6,{ax:1,c:sole,sq:.4});
      for(const q of [-1,1])fgSeg(b,X,0,GEO.box,0,-.04,-.15,q*.05*lw,-.062,-.07,.012,.006,L.strap||0x2bb3a0);}
    else{const bt=shoeT==='boot',lf=shoeT==='loafer',hi=bt?.06:lf?-.012:0,SH=[[.07,.016,.014,0,-.045,0,.014],[.05,.04,.03,0,-.042,0,.05+hi],[.0,.047,.033,0,-.039,0,.062+hi*.5],[-.085,.05,.033,0,-.042,0,.042],
        [-.162,.045,.029,0,-.047,0,.025],[-.207,.01,.008,0,-.05,0,.006]];
      tb(b,SH,6,{ax:1,sq:.8,ang:[0,.15,.35,.5,.6,.9,1],col:(i,j)=>X.vc(0,j===4||j===5?sole:shoe),rad:(a)=>Math.sin(a)<-.5?1.07:1});
      if(bt)tb(b,[[-.01,.052,.054,0,0],[.12,.052,.053,0,.002]],7,{c:shoe});
      else if(L.laces!==0&&!lf)fgSeg(b,X,0,GEO.box,0,.026,-.0,0,-.004,-.085,.032,.008,L.laces||0xf4f2ec);}
    o[s<0?'footL':'footR']=b.build();}
  // head: neck and skull in one, the face (front) on the face cell, ears, a nose; hair, hats, glasses and facial hair
  b=new GB();const HY=[.47,.582,.607,.645,.69,.727,.75,.775,.807,HTOP],nb=X.hq?8:6,nw=L.neckW||1,HF=(i,j,q,a0,da)=>{const a=(a0+j*da)*TAU;fgHeadR(HY[i],a,q);if(i<1){q[0]*=nw;q[2]=(q[2]-.008)*nw+.008;}return q;};
  fgPatch(b,HY.length,4,(i,j,q)=>HF(i,j,q,7/12,1/12),{col:X.vc(2,sk),inn:(i,q)=>{q[0]=0;q[1]=HY[i];q[2]=0;return q;},uv:(u,v,x,y,z,q)=>X.uv(X.face?2:0,(x+.1)/.2,(y-.615)/.2,q)});
  fgPatch(b,HY.length,nb,(i,j,q)=>HF(i,j,q,11/12,2/3/nb),{col:X.vc(0,sk),inn:(i,q)=>{q[0]=0;q[1]=HY[i];q[2]=0;return q;},uv:(u,v,x,y,z,q)=>X.uv(0,u,v,q)});
  fgPatch(b,2,4,(i,j,q)=>{if(i){q[0]=0;q[1]=.673;q[2]=-.122;return q;}const a=j/4*TAU;q[0]=Math.cos(a)*.013;q[1]=.69+Math.sin(a)*(Math.sin(a)>0?.024:.021);q[2]=-.099+Math.abs(Math.cos(a))*.003;return q;},
    {col:X.vc(2,shade(sk,.97)),inn:[0,.69,0],uv:(u,v,x,y,z,q)=>X.uv(X.face?2:0,(x+.1)/.2,(y-.615)/.2,q)});
  for(const s of [-1,1])bx(b,0,s*.077,.668,.014,0,s*.3,0,.018,.054,.03,shade(sk,.94));
  // hair: a shell over the skull from the hairline; the style sets the hairline, the thickness and the fade
  const fr=a=>-Math.sin(a),HL=(f0,f1,f2)=>a=>{const f=fr(a);return f0+f1*f-f2*f*f;};
  if(!hatT||hatT==='cap'||hatT==='capb'){
    if(hs==='short'||hs==='crop')fgShell(b,X,3,HL(.725,.058,.017),(a,t)=>t?(hs==='crop'?.008:.011)*(.45+.55*t)+(t>.5?.004:0)*(hs==='short'?1:0):.002,
      (i,j,x,y,z)=>X.vc(3,i===0?mixc(hairC,sk,.45):y<.72&&z>-.03?mixc(hairC,sk,.3):hairC),X.hq?[0,.12,.35,.65,.88,1]:[0,.35,.75,1],X.hq?12:10);
    else if(hs==='buzz')fgShell(b,X,3,HL(.725,.055,.02),(a,t)=>t?.004:.0015,(i)=>X.vc(3,mixc(hairC,sk,i?.38:.6)),X.hq?null:[0,.4,.8,1],X.hq?12:10);
    else if(hs==='braids'){fgShell(b,X,3,HL(.722,.058,.02),(a,t)=>.006+.006*Math.abs(Math.sin(a*7))*(1-t*.6),hairC,[0,.25,.5,.75,1],16);
      for(let k=0;k<5;k++){const x=(k-2)*.026,z=.085-Math.abs(x)*.4;fgSweep(b,X,3,[[x,.72,z],[x*1.15,.64,z+.03],[x*1.25,.56,z+.05],[x*1.3,.5,z+.055]],[.012,.011,.01,.003],5,hairC);}}
    else if(hs==='pony'){fgShell(b,X,3,HL(.742,.05,.03),(a,t)=>.007*(.6+.4*t),hairC);bx(b,0,0,.715,.105,-.3,0,0,.04,.03,.03,0x2b2b2b);
      fgSweep(b,X,3,[[0,.725,.11],[0,.66,.15],[0,.58,.165],[0,.5,.16],[0,.45,.15]],[.03,.034,.03,.022,.004],6,hairC);}
    else if(hs==='side')fgShell(b,X,3,HL(.705,.03,.02),(a,t)=>.007*(1-t),(i,j,x,y)=>X.vc(3,y>.76?sk:hairC),[0,.3,.55]);}
  // hats
  if(hatT==='cap'||hatT==='capb'){const hc=L.hatC===undefined?0x17181b:L.hatC,bk=hatT==='capb';fgShell(b,X,11,HL(.747,.01,0),(a,t)=>.016,hc,[0,.5,.85,1],10);
    const B=(i,j,q)=>{const a=(bk?(1/12+j*(1/3)/5):(7/12+j*(1/3)/5))*TAU;fgHead(.747+.01*fr(a),a,.017,q);if(i){const r=Math.hypot(q[0],q[2]-.004)||1;q[0]+=q[0]/r*.075;q[2]+=(q[2]-.004)/r*.075;q[1]-=.014;}return q;};
    fgPatch(b,2,5,B,{col:X.vc(11,shade(hc,.92)),inn:[0,.62,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});fgPatch(b,2,5,B,{col:X.vc(11,shade(hc,.8)),inn:[0,.9,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});
    if(kps)bx(b,8,0,.762,bk?.112:-.112,bk?.25:-.25,0,0,.05,.028,.004,0xffffff);}
  else if(hatT==='helmet'){const hc=L.hatC===undefined?0x2a2c30:L.hatC;fgShell(b,X,11,HL(.712,.026,.012),()=>.027,hc,[0,.35,.75,1],10);
    fgPatch(b,2,10,(i,j,q)=>{const a=j/10*TAU;fgHead(.712+.026*fr(a)-.012*fr(a)*fr(a),a,i?.04:.026,q);if(i)q[1]-=.004;return q;},{col:X.vc(11,shade(hc,.8)),inn:[0,.85,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});
    if(L.visor){const up=L.visorUp?1:0;fgPatch(b,2,5,(i,j,q)=>{const a=(7/12+j*(1/3)/5)*TAU;fgHead(up?(i?.81:.76):(i?.745:.632),a,up?.042:.045,q);return q;},{col:X.vc(0,L.visor),inn:[0,.69,0],uv:(u,v,x,y,z,q)=>X.uv(0,u,v,q)});}
    if(kps)bx(b,8,0,.79,-.112,-.45,0,0,.05,.026,.004,0xffffff);}
  else if(hatT==='bucket'){const hc=L.hatC===undefined?0xb8ab84:L.hatC;fgShell(b,X,11,HL(.735,.012,0),(a,t)=>.017+.01*t,hc,[0,.5,1],10);
    const B=(i,j,q)=>{const a=j/10*TAU;fgHead(.735+.012*fr(a),a,.018,q);if(i){const r=Math.hypot(q[0],q[2]-.004)||1;q[0]+=q[0]/r*.062;q[2]+=(q[2]-.004)/r*.062;q[1]-=.03;}return q;};
    fgPatch(b,2,10,B,{col:X.vc(11,shade(hc,.93)),inn:[0,.62,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});fgPatch(b,2,10,B,{col:X.vc(11,shade(hc,.75)),inn:[0,.9,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});
    tb(b,[[.742,.1,.12,0,.004,0,.124],[.758,.096,.114,0,.004,0,.119]],10,{c:shade(hc,.7)});}
  else if(hatT==='beanie'){const hc=L.hatC===undefined?0x1d1e22:L.hatC;fgShell(b,X,11,HL(.73,.012,0),(a,t)=>.014+.008*t,hc,[0,.4,.8,1],10);
    fgPatch(b,2,10,(i,j,q)=>{const a=j/10*TAU;fgHead(.73+.012*fr(a)+i*.035,a,.022,q);return q;},{col:X.vc(11,shade(hc,.85)),inn:[0,.75,0],uv:(u,v,x,y,z,q)=>X.uv(11,u,v,q)});}
  if(L.shades)bx(b,0,0,.714,-.105,0,0,0,.155,.028,.016,0x0f0f11);
  if(L.glasses)for(const s of [-1,1])bx(b,0,s*.034,.716,-.106,0,0,0,.05,.028,.006,0x3a3a3a);
  if(L.stache)bx(b,0,0,.655,-.102,.15,0,0,.05,.016,.012,L.stache);
  if(L.beard)fgPatch(b,3,6,(i,j,q)=>{const a=(7/12-.03+j*(1/3+.06)/6)*TAU;fgHead([.6,.632,.668][i],a,i===2?.004:.008,q);return q;},{col:X.vc(3,L.beard),inn:[0,.66,0],uv:(u,v,x,y,z,q)=>X.uv(3,u,v,q)});
  if(L.headset){bx(b,0,.083,.68,-.015,0,0,0,.02,.05,.045,0x15151a);fgSeg(b,X,0,GEO.rod,.08,.69,-.04,.03,.66,-.11,.005,.005,0x15151a);}
  if(L.headK){const k=L.headK;for(let i=0;i<b.p.length;i+=3){b.p[i]*=k;b.p[i+1]=.5+(b.p[i+1]-.5)*k;b.p[i+2]*=k;}} // a bigger head (round the base of the neck)
  o.head=b.build();return o;}
// what each kind wears (old fields: shirt, sl, pants, vest, pouch, patch, hat, hatC, skin, glove, pack, tie, heavy, visor, shades, headset, print,
// baggy, lanyard, shorts, sock, glasses, stache, belt, shoe; new: sleeve, collar, cut, hair, hairStyle, hatC, beard, w, belly, crop, ...)
const KPS_GOLD=0xe2b53e,KHAKI=0xb29c70;
const UNI={
  rifle:{shirt:0x24262c,pants:KHAKI,vest:0x474c47,pouch:0x2c2f33,patch:KPS_GOLD,hat:'cap',hatC:0x17181b,skin:0xc68e64,glove:0x24231f,radio:1},
  rush:{shirt:0x8d939a,sl:1,pants:KHAKI,vest:'rig',pouch:0x2c2f33,patch:KPS_GOLD,hat:'capb',hatC:0x17181b,skin:0x7a4e32,glove:0x24231f,tie:1},
  heavy:{shirt:0x24262c,sl:1,pants:0xa8936a,vest:0x1f2124,heavy:1,pads:1,pouch:0x2c2f33,patch:KPS_GOLD,hat:'helmet',hatC:0x2a2c30,visor:0x2e3d48,skin:0xe0ae88,glove:0x24231f,w:1.06},
  mark:{shirt:0x7e848a,sl:1,pants:KHAKI,vest:0x50554c,pouch:0x3a3d38,patch:KPS_GOLD,hat:'cap',hatC:0x17181b,shades:1,headset:1,skin:0x9c6a48,glove:0x24231f,pack:1},
  ally:{shirt:0x4b5d7e,sl:1,pants:0x3a4d6b,hat:'hair',hatC:0x221a14,skin:0xb07d58,shoe:0xdedbd2,collar:'crew',tuck:false},
  june:{shirt:0xffffff,print:1,shirtMode:6,collar:'polo',pants:0x48668f,baggy:1,hat:'hair',hatC:0x16110d,hairStyle:'short',skin:0x8a5a3c,shoe:0xe9e6dc,lanyard:0x2f6fd8,tuck:false,watch:0xd8d4c8},
  penn:{shirt:0xecebe4,collar:'polo',pants:0xc4ae82,shorts:1,sock:0xf2f1ec,hat:'bucket',hatC:0xb8ab84,skin:0xe8bf9c,shoe:0x5a3e2a,shoeType:'loafer',glasses:1,stache:0xc9c5bf,belt:0x5a3e2a,tuck:true,belly:.03,hair:0xc9c5bf,hairStyle:'side'}};
// four looks per kind, so a squad of guards is not four copies of one man
const UVAR={
  rifle:[{},{skin:0x6e4630,hat:'hair',hatC:0x15100c,hairStyle:'buzz',shades:1,vest:0x2a2c2e},{skin:0xe1b593,hat:'helmet',hatC:0x34373a,vest:0x56594f,stache:0x5a4030},{skin:0xa5704c,vest:0,w:1.07,belly:.025,beard:0x2a1d14,hatC:0x24262c}],
  rush:[{},{skin:0xd9a882,hat:'hair',hatC:0x6a4a2a,hairStyle:'crop',sleeve:'rolled'},{skin:0x5c3a26,hat:'cap',shades:1},{skin:0xb98258,hat:'beanie',beard:0x1d1612,sleeve:'rolled'}],
  heavy:[{},{skin:0x7a4e32,visorUp:1},{skin:0xc68e64,vest:0x2b2f2a,visorUp:1,stache:0x3a2a1e},{skin:0x9c6a48,w:1.1,belly:.02}],
  mark:[{},{skin:0xe0ae88,beard:0x8a6a48,shades:0,glasses:1},{skin:0x6e4630,hat:'hair',hatC:0x120d0a,hairStyle:'buzz'},{skin:0xb07d58,hat:'capb',beard:0x2a1d14}],
  ally:[{},{skin:0x7a4e32,hat:'hair',hatC:0x0f0b08,hairStyle:'buzz',shirt:0x3c4f70},{skin:0xe0b090,hatC:0x6a4a2a,shirt:0x52668a,beard:0x5a4030},{skin:0x9c6a48,hat:'cap',hatC:0x2a3a5a,shirt:0x44587a}]};
const partGeo={};
function lookOf(kind,v){const V=UVAR[kind];return Object.assign({},UNI[kind]||UNI.ally,V?V[(v|0)%V.length]:null);}
function parts(kind,v){v=v|0;const key=kind+':'+v;if(partGeo[key])return partGeo[key];return partGeo[key]=kind==='bobo'?boboParts():figParts(lookOf(kind,v),SXC);}
// Bobo: a giant in a souvenir T-shirt a size too small (his belly shows), denim cut-offs, flip-flops, a ponytail and a gold bracelet
function boboParts(){return figParts({skin:0xc98d68,w:1.25,belly:.1,armW:1.65,legW:1.55,neckW:1.5,shirt:0x8fd0ef,chestPrint:7,collar:'crew',crop:.075,tuck:false,
  pants:0x56698a,cut:'cutoff',rise:.0,headK:1.1,shoeType:'flip',sole:0x30302e,strap:0x2bb3a0,hair:0x1d1712,hairStyle:'pony',bracelet:0xd6b24a,stache:0x1d1712},SXC);}

// ---------- weapons in the world (in hands and on the ground): the barrel points to -z, the origin is on the bore above the grip
const wGeo={};
function weaponGeo(id){if(wGeo[id])return wGeo[id];const b=new GB();gunBuild(b,id,0);return wGeo[id]=b.build();}
// a side profile (x forward, y up) extruded to its width, flat-shaded edges; uv at the white texel
function gpro(b,pts,w,c,bev){const g=profile(pts,w,bev||0);fgAdd(b,SXC,0,g,0,0,0,0,0,0,1,1,1,c);}
const GK=0x232528,GK2=0x3a3d41,WOOD=0x6b4426,GRN=0x4c5a3a;
// the weapons themselves, shared by the world models (hi 0) and the first-person models (hi 1, more parts); hands are added by 06a
function gunBuild(b,id,hi){const X=SXC,bx=(x,y,z,w,h,d,c,rx,ry,rz)=>fgAdd(b,X,0,GEO.box,x,y,z,rx||0,ry||0,rz||0,w,h,d,c),
    cy=(r,l,z,y,c,g,x)=>fgAdd(b,X,0,g||GEO.tube6,x||0,y||0,z,-PI/2,0,0,r,l,r,c===undefined?GK:c),bv=hi?.004:0,pr=(p,w,c)=>gpro(b,p,w,c,bv);
  if(id==='ak'){pr([[-.17,.03],[.12,.04],[.17,.035],[.19,.0],[.19,-.035],[.1,-.042],[-.17,-.042]],.046,GK);                                  // receiver with its dust cover
    pr([[-.17,.022],[-.2,.02],[-.44,-.03],[-.45,-.1],[-.4,-.105],[-.2,-.04],[-.17,-.04]],.04,WOOD);                                            // wooden stock
    pr([[-.1,-.04],[-.06,-.04],[-.09,-.15],[-.135,-.15]],.034,WOOD);pr([[.03,-.04],[.1,-.04],[.14,-.13],[.2,-.22],[.14,-.25],[.08,-.16],[.06,-.11]],.028,GK2); // grip, banana magazine
    pr([[.19,.0],[.4,.0],[.42,-.012],[.42,-.04],[.19,-.04]],.05,WOOD);pr([[.21,.012],[.39,.012],[.39,.04],[.22,.04]],.038,WOOD);                  // handguards
    cy(.009,.3,-.42,-.008);cy(.008,.21,-.2,.03,GK2);cy(.014,.05,-.68,-.008,GK2);bx(0,-.008,-.62,.03,.075,.022,GK);bx(0,.05,-.6,.006,.032,.006,GK);  // barrel, gas tube, brake, front sight
    bx(0,.035,-.05,.03,.03,.06,GK);for(const x of [-.009,.009])bx(x,.065,-.05,.01,.015,.012,GK);bx(0,-.065,-.02,.012,.012,.08,GK);if(hi){bx(.026,-.005,-.06,.012,.014,.03,GK2);bx(0,.04,-.25,.034,.012,.02,GK);bx(.025,-.012,-.06,.004,.014,.12,GK2);bx(0,-.058,-.035,.006,.022,.008,GK2);
      for(const x of [-.012,.012])bx(x,.03,-.6,.004,.05,.012,GK);}}  // rear sight, trigger guard; up close: charging handle, selector, trigger, front sight ears
  else if(id==='smg'){pr([[-.15,.035],[.16,.035],[.18,.02],[.18,-.03],[.06,-.035],[-.15,-.035]],.046,GK);                                     // receiver
    pr([[-.1,-.035],[-.055,-.035],[-.085,-.14],[-.13,-.14]],.034,GK2);pr([[.02,-.035],[.07,-.035],[.1,-.2],[.055,-.21]],.026,GK2);                 // grip, curved magazine
    pr([[.18,.02],[.31,.012],[.31,-.034],[.18,-.04]],.05,GK2);cy(.011,.07,-.31,0);cy(.017,.025,-.29,.075,GK2);bx(0,.04,-.3,.012,.04,.008,GK);       // handguard, barrel, front sight
    bx(0,.035,.06,.028,.025,.04,GK);cy(.016,.012,.07,.078,GK,GEO.tube8);for(const x of [-.014,.014])bx(x,-.012,.15,.006,.006,.2,GK2);bx(0,-.07,.33,.034,.1,.024,GK2);bx(0,-.065,.0,.012,.012,.07,GK);  // rear drum, stock rails and butt, trigger guard
    if(hi){cy(.012,.12,.16,.03,GK2,GEO.cyl6);bx(.028,.005,-.1,.012,.012,.03,GK2);}}
  else if(id==='lmg'){pr([[-.18,.05],[.2,.05],[.22,.02],[.22,-.045],[-.18,-.055]],.068,GK);bx(0,.05,-.06,.064,.02,.27,GK2);bx(0,.08,.03,.014,.028,.1,GK);bx(0,.105,.03,.024,.012,.14,GK); // receiver, feed cover, carry handle
    pr([[-.18,.035],[-.42,.03],[-.43,-.1],[-.33,-.09],[-.18,-.05]],.05,GK);pr([[-.12,-.05],[-.07,-.05],[-.1,-.155],[-.15,-.155]],.036,GK2);         // stock, grip
    bx(-.03,-.205,-.05,.11,.15,.14,GRN);bx(-.03,-.065,-.05,.08,.02,.1,shade(GRN,.75));pr([[.22,.03],[.42,.024],[.42,-.03],[.22,-.04]],.058,GK2);  // ammo box, its top, handguard
    cy(.014,.24,-.42,.005);cy(.02,.06,-.66,.005,GK2);bx(0,.03,-.55,.026,.026,.03,GK);bx(0,.055,-.55,.006,.045,.008,GK);for(const x of [-.01,.01])bx(x,.075,.12,.008,.025,.025,GK);  // barrel, flash hider, gas block, front and rear sights
    for(const s of [-1,1])fgAdd(b,X,0,GEO.rod,s*.018,-.025,-.53,2.55,0,s*.25,.008,.27,.008,GK2);bx(0,-.065,-.02,.012,.012,.08,GK);if(hi)bx(.04,-.01,.06,.014,.016,.05,GK2);}
  else if(id==='dmr'){pr([[-.5,-.005],[-.21,.02],[.3,.02],[.33,-.01],[.33,-.03],[.06,-.045],[-.09,-.045],[-.16,-.03],[-.3,-.1],[-.5,-.105]],.052,WOOD); // one-piece wooden stock
    bx(0,.018,-.06,.046,.026,.3,GK);bx(0,-.115,.49,.052,.11,.014,GK);pr([[-.0,-.045],[.07,-.045],[.06,-.165],[-.01,-.165]],.03,GK2);              // receiver, butt plate, magazine
    cy(.012,.4,-.33,.01);cy(.016,.06,-.75,.01,GK2);bx(0,.022,-.7,.008,.045,.008,GK);bx(0,-.065,.01,.012,.012,.08,GK);                              // barrel, flash hider, front sight, trigger guard
    cy(.02,.3,.14,.085,GK,hi?GEO.cyl8:GEO.cyl6);cy(.03,.07,-.16,.085,GK,hi?GEO.cyl8:GEO.tube6);if(hi)cy(.026,.06,.2,.085,GK,GEO.cyl8);bx(0,.03,-.02,.02,.04,.12,GK);  // scope with its bells and mount
    if(hi){cy(.023,.012,.05,.085,GK2,GEO.tube8);cy(.023,.012,-.08,.085,GK2,GEO.tube8);bx(0,.115,-.02,.014,.014,.02,GK2);bx(.028,.085,-.02,.014,.014,.02,GK2);bx(.032,.0,.0,.012,.014,.04,GK2);}} // rings, turrets, bolt
  else if(id==='shotgun'){pr([[-.15,.035],[.15,.04],[.17,.0],[.17,-.04],[-.15,-.04]],.05,GK);pr([[-.42,.005],[-.15,.03],[-.15,-.04],[-.2,-.05],[-.32,-.09],[-.42,-.1]],.044,WOOD); // receiver, stock
    cy(.016,.5,-.17,.018);cy(.015,.34,-.17,-.022,GK2);cy(.028,.17,-.25,-.022,WOOD,GEO.cyl8);for(const z of [-.28,-.34,-.39])bx(0,-.052,z,.058,.008,.014,shade(WOOD,.7)); // barrel, tube, pump
    bx(0,.033,-.66,.008,.025,.008,0xd8c070);bx(0,-.065,.02,.012,.012,.08,GK);bx(0,-.105,.43,.046,.105,.012,GK);if(hi){bx(.026,-.005,-.06,.006,.03,.06,GK2);bx(0,-.058,-.0,.006,.022,.008,GK2);bx(0,.04,.06,.012,.008,.16,GK2);}}
  else if(id==='pistol'){pr([[-.04,.045],[.19,.045],[.2,.012],[.05,.006],[-.04,.006]],.032,GK);pr([[-.03,.006],[.19,.006],[.19,-.02],[.04,-.02],[.0,-.04],[-.04,-.04]],.03,GK2); // slide, frame
    pr([[-.045,-.04],[.015,-.04],[-.01,-.125],[-.07,-.12]],.03,GK2);bx(0,-.04,-.02,.01,.01,.05,GK);if(hi){bx(0,.03,.045,.008,.022,.012,GK2);bx(0,-.03,-.005,.005,.018,.007,GK2);bx(0,.045,.03,.026,.008,.06,GK2);bx(0,.045,-.185,.006,.012,.008,GK);for(const x of [-.008,.008])bx(x,.045,.03,.005,.012,.008,GK);}}
  else if(id==='none')bx(0,0,0,.001,.001,.001,GK); // Bobo needs no gun
  else{pr([[-.2,.03],[-.16,.03],[-.16,.05],[.17,.05],[.18,.0],[.17,-.04],[.12,-.045],[.12,-.065],[.05,-.065],[.05,-.045],[-.16,-.045],[-.2,-.03]],.048,GK); // M4: receiver, magazine well
    pr([[-.2,.012],[-.42,.02],[-.43,-.05],[-.37,-.09],[-.42,-.1],[-.3,-.1],[-.2,-.03]],.04,GK2);pr([[-.1,-.04],[-.05,-.04],[-.085,-.15],[-.13,-.15]],.034,GK2); // stock, grip
    pr([[.055,-.06],[.115,-.06],[.1,-.25],[.03,-.235]],.026,GK2);cy(.029,.25,-.17,.002,GK2,GEO.cyl8);if(hi)for(const y of [.035,-.031])bx(0,y,-.42,.034,.008,.24,GK);  // magazine, handguard (rails up close)
    cy(.01,.2,-.42,.002);cy(.014,.05,-.6,.002,GK2);bx(0,.02,-.445,.03,.035,.03,GK);bx(0,.055,-.445,.006,.032,.008,GK);                           // barrel, flash hider, gas block, front sight
    bx(0,.05,-.14,.032,.01,.28,GK2);bx(0,.06,.09,.03,.01,.04,GK);for(const x of [-.011,.011])bx(x,.06,.09,.008,.03,.03,GK);bx(0,-.065,.0,.012,.012,.08,GK);
    if(hi){bx(-.026,-.0,.12,.01,.014,.05,GK2);bx(.026,-.01,.02,.012,.03,.016,GK);for(const x of [-.031,.031])bx(x,-.012,-.42,.008,.028,.24,GK);for(let z=-.19;z>-.42;z-=.045)bx(0,.043,z,.036,.005,.014,GK2);
      for(let z=-.25;z<.0;z+=.05)bx(0,.06,z,.034,.004,.016,GK);cy(.008,.03,.12,.026,GK2,GEO.cyl6,.026);bx(.0245,-.005,-.04,.004,.024,.065,0x121315);bx(-.025,-.03,.045,.004,.02,.016,GK2);
      bx(0,-.058,-.015,.006,.022,.008,GK2);for(const x of [-.009,.009])bx(x,.04,-.445,.004,.05,.03,GK);}}}  // up close: rails and their slots, forward assist, ejection port, bolt catch, trigger, sight ears
// where the hands go on each weapon (weapon frame): g the firing hand (palm centre), f the other hand; the butt's z and height
const HOLD={m4:{g:[.026,-.085,.09],f:[-.03,-.04,-.25],b:.42,by:-.03},ak:{g:[.026,-.09,.1],f:[-.03,-.04,-.29],b:.44,by:-.06},smg:{g:[.026,-.085,.085],f:[-.03,-.045,-.22],b:.33,by:-.04},
  lmg:{g:[.03,-.1,.11],f:[-.035,-.05,-.3],b:.42,by:-.03},dmr:{g:[.026,-.085,.13],f:[-.034,-.05,-.27],b:.48,by:-.05},shotgun:{g:[.026,-.085,.13],f:[-.034,-.045,-.32],b:.42,by:-.045},
  pistol:{g:[.022,-.08,.03],f:[-.028,-.086,.025],b:0,by:0,pis:1},none:{g:[.02,-.1,0],f:[-.02,-.1,0],b:0,by:0,none:1}};
const KW={rifle:'ak',rush:'smg',heavy:'lmg',mark:'dmr',ally:'m4',june:'smg',penn:'dmr',bobo:'none'};
const footShade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:M.shade.map}),
  footGeo=(()=>{const g=new T.PlaneGeometry(1.5,1.5);g.rotateX(-PI/2);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,.02+u.getX(i)*.46);return g;})();
// ---------- the rig: one skinned mesh per person (a single draw call). Bones 0 hips, 1 chest, 2/3 left arm and forearm, 4/5 right,
// 6 weapon, 7/8 left thigh and shin, 9/10 right; and three more: 11/12 the feet (ankles), 13 the head. Joints blend over a few centimetres.
const skinMat=L({vertexColors:true,map:solMat.map,skinning:true}),figMat=L({vertexColors:true,map:FIGT,skinning:true}),rigCache={};
const JOINT=[[0,0,0],[0,1,0],[-.19,.46,0],[0,-.36,0],[.19,.46,0],[0,-.36,0],[.12,.36,-.42],[-.1,.9,0],[0,-.46,0],[.1,.9,0],[0,-.46,0],[0,-.37,0],[0,-.37,0],[0,.56,0]],
  PARENT=[-1,0,1,2,1,4,1,0,7,0,9,8,10,1],NB=JOINT.length;
const JK={bobo:JOINT.map((p,k)=>k===2?[-.225,.46,0]:k===4?[.225,.46,0]:k===7?[-.12,.9,0]:k===9?[.12,.9,0]:p)};
function rigJ(kind){const J=JK[kind]||JOINT,P=PARENT,W=[];for(let k=0;k<NB;k++){const p=J[k].slice(),q=P[k];if(q>=0){p[0]+=W[q][0];p[1]+=W[q][1];p[2]+=W[q][2];}W.push(p);}return{J,P,W};}
// where a vertex of bone b blends into a neighbour: [other bone, joint, side (+1: the other bone is above), range]
function seams(W){const s=[];s[0]=[[1,W[1][1],1,.06]];s[1]=[[0,W[1][1],-1,.06]];
  for(const [a,f] of [[2,3],[4,5]]){s[a]=[[1,W[a][1]+.035,1,.05],[f,W[f][1],-1,.045]];s[f]=[[a,W[f][1],1,.045]];}
  for(const [t,n,ft] of [[7,8,11],[9,10,12]]){s[t]=[[0,W[t][1]+.03,1,.08],[n,W[n][1],-1,.05]];s[n]=[[t,W[n][1],1,.05],[ft,W[ft][1],-1,.035]];s[ft]=[[n,W[ft][1],1,.035]];}
  s[13]=[[1,W[13][1]-.01,-1,.04]];s[6]=[];return s;}
// list: [geometry, bone, offset (default: the bone's joint)]; wuv: uv for the weapon's vertices
function skinGeo(list,kind,wuv){const R=rigJ(kind),W=R.W,SM=seams(W),p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],bn=it[1],o=it[2]||W[bn],Pp=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k=p.length/3,sm=SM[bn]||[];
    for(let i=0;i<Pp.count;i++){const x=Pp.getX(i)+o[0],y=Pp.getY(i)+o[1],z=Pp.getZ(i)+o[2];p.push(x,y,z);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));
      if(bn===6&&wuv)u.push(wuv[0],wuv[1]);else u.push(U.getX(i),U.getY(i));
      let b2=-1,w2=0;for(const q of sm){const d=(y-q[1])*q[2],w=clamp(.5+.5*d/q[3],0,1);if(w>w2){w2=w;b2=q[0];}}
      // the seat of the trousers follows the thigh on its side
      if(bn===0&&y<W[7][1]+.04){const t=clamp((W[7][1]+.04-y)/.1,0,1)*clamp(Math.abs(x)/.07,0,1)*.62;if(t>w2){w2=t;b2=x<0?7:9;}}
      if(w2>.002){si.push(bn,b2,0,0);sw.push(1-w2,w2,0,0);}else{si.push(bn,0,0,0);sw.push(1,0,0,0);}}
    for(let i=0;i<g.index.count;i++)ix.push(k+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return g;}
function figList(G0,wg){const w=[0,1,0];return[[G0.hips,0,w],[G0.up,1,w],[G0.armL,2],[G0.foreL,3],[G0.armR,4],[G0.foreR,5],[wg,6],[G0.thighL,7],[G0.shinL,8],[G0.thighR,9],[G0.shinR,10],[G0.footL,11],[G0.footR,12],[G0.head,13,w]];}
function rigGeo(kind,wid,v){wid=wid||KW[kind]||'none';v=v|0;const key=kind+'/'+wid+'/'+v;if(rigCache[key])return rigCache[key];
  return rigCache[key]=skinGeo(figList(parts(kind,v),weaponGeo(wid)),kind);}
// bones for a figure: returns the handles every pose function uses
function figBones(kind){const R=rigJ(kind),B=[];for(let k=0;k<NB;k++){const b=new T.Bone();b.position.set(R.J[k][0],R.J[k][1],R.J[k][2]);B.push(b);if(R.P[k]>=0)B[R.P[k]].add(b);}return{B,J:R.J};}
function buildSoldier(kind,wid,v){const g=new T.Group();g.rotation.order='YXZ';const FB=figBones(kind),B=FB.B;wid=wid||KW[kind]||'none';
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(rigGeo(kind,wid,v),figMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);
  if(KIND[kind]&&KIND[kind].sc)g.scale.setScalar(KIND[kind].sc);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10],ftL:B[11],ftR:B[12],hd:B[13],J:FB.J,wid};}
const allyMark=tex(32,32,(g,w,h)=>{g.fillStyle='#8ec1e6';g.strokeStyle='#15110c';g.lineWidth=3;g.beginPath();g.moveTo(16,27);g.lineTo(4,8);g.lineTo(28,8);g.closePath();g.fill();g.stroke();});
const foes=[],allies=[],corpses=[];let nidSeq=0;
function addMark(s){const sp=new T.Sprite(new T.SpriteMaterial({map:allyMark,depthTest:false,transparent:true,sizeAttenuation:false}));sp.scale.set(.028,.028,1);sp.position.y=2.25;sp.renderOrder=50;s.g.add(sp);s.mark=sp;}
function addSoldier(team,kind,x,z,o){o=o||{};const v=o.v===undefined?(nidSeq+1)&3:o.v&3,m=buildSoldier(kind,o.wid,v),K=KIND[kind];
  const s={team,kind,K,x,z,y0:o.y0||0,yaw:o.yaw===undefined?R()*TAU:o.yaw,hp:K.hp,maxHp:K.hp,alive:true,sc:K.sc||1,v,
    crouch:0,wantCrouch:false,ph:R()*6,moveAmt:0,mx:0,mz:0,run:false,aimP:0,lowered:!o.aware,
    aware:!!o.aware,spot:0,target:null,seeT:99,lkx:x,lkz:z,cover:null,coverT:0,phase:'hide',phaseT:R2(.3,1.2),pushT:R2(6,12),
    burst:0,burstT:0,shootT:R2(.4,1.2),reactT:0,flinch:0,stuckT:0,lastX:x,lastZ:z,strafe:R()<.5?-1:1,strafeT:R2(1,3),percT:R()*.25,
    post:o.post||{x,z},post2:o.post2||null,patrolT:R2(1,5),goingBack:false,isStatic:!!o.isStatic,aimT:0,nadeT:R2(8,16),revealT:0,
    name:o.name||'',downT:0,deadT:0,fall:1,goal:null,goalT:0,searchT:0,stepD:0,tag:o.tag||'',nid:++nidSeq,
    g:m.g,mesh:m.mesh,body:m.body,up:m.up,aL:m.aL,aR:m.aR,fL:m.fL,fR:m.fR,wp:m.wp,lL:m.lL,lR:m.lR,kL:m.kL,kR:m.kR,ftL:m.ftL,ftR:m.ftR,hd:m.hd,J:m.J,wid:m.wid,mark:null};
  s.g.position.set(x,s.y0,z);s.g.rotation.y=s.yaw;
  if(team===0)addMark(s);
  scene.add(s.g);(o.list||(team?foes:allies)).push(s);return s;}
// another weapon in the hands of a soldier that already exists (the stand-ins for other players swap weapons)
function setSoldierWeapon(s,wid){s.wid=wid;s.mesh.geometry=rigGeo(s.kind,wid,s.v);}
function removeSoldier(s){scene.remove(s.g);}

// ---------- posing
const ease=k=>k<0?0:k>1?1:k*k*(3-2*k),_wq=new T.Vector3(),_m1=new T.Matrix4();
// two-bone reach: arm bone a (shoulder sh) and forearm f put the palm (L2 down the forearm) on the point t of the chest frame, the elbow
// towards the pole p
function armReach(a,f,sh,tx,ty,tz,px,py,pz,L1,L2){let dx=tx-sh[0],dy=ty-sh[1],dz=tz-sh[2];const D0=Math.hypot(dx,dy,dz)||1e-6;dx/=D0;dy/=D0;dz/=D0;
  const D=clamp(D0,Math.abs(L1-L2)+.01,L1+L2-.002),ca=clamp((L1*L1+D*D-L2*L2)/(2*L1*D),-1,1),sa=Math.sqrt(1-ca*ca),flex=PI-Math.acos(clamp((L1*L1+L2*L2-D*D)/(2*L1*L2),-1,1));
  const pd=px*dx+py*dy+pz*dz;let qx=px-pd*dx,qy=py-pd*dy,qz=pz-pd*dz;const ql=Math.hypot(qx,qy,qz)||1;qx/=ql;qy/=ql;qz/=ql;
  const ux=dx*ca+qx*sa,uy=dy*ca+qy*sa,uz=dz*ca+qz*sa,ex=ux*L1,ey=uy*L1,ez=uz*L1;let fx=dx*D-ex,fy=dy*D-ey,fz=dz*D-ez;const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
  const fu=fx*ux+fy*uy+fz*uz;let wx=fx-fu*ux,wy=fy-fu*uy,wz=fz-fu*uz;const wl=Math.hypot(wx,wy,wz);if(wl<1e-4){wx=-qx;wy=-qy;wz=-qz;}else{wx/=wl;wy/=wl;wz/=wl;}
  const Yx=-ux,Yy=-uy,Yz=-uz,Zx=-wx,Zy=-wy,Zz=-wz;_m1.set(Yy*Zz-Yz*Zy,Yx,Zx,0,Yz*Zx-Yx*Zz,Yy,Zy,0,Yx*Zy-Yy*Zx,Yz,Zz,0,0,0,0,1);a.quaternion.setFromRotationMatrix(_m1);f.rotation.set(flex,0,0);}
// the weapon's pose in the chest frame: shouldered (aiming), low ready, or carried across the chest when running; then the hands go on it.
// s.lw (0 shouldered .. 1 lowered), s.spr (sprint carry), s.wpP (extra pitch), s.kick (recoil)
const _wv=new T.Vector3();
function holdPose(s,ap){const H=HOLD[s.wid]||HOLD.m4,lw=s.lw,sp=(s.spr||0)*lw,k=s.kick||0;if(H.none)return;
  let qx,qy,qz,px,py,pz;
  if(H.pis){qx=lerp(.05,.12,lw);qy=lerp(.6,.32,lw);qz=lerp(-.46,-.3,lw);px=lerp(ap,-.65,lw);py=lerp(.14,.15,lw);pz=0;}
  else{qx=lerp(.12,.13,lw);qy=lerp(.5,.39,lw);qz=lerp(-.075,-.13,lw);px=lerp(ap,-.72,lw);py=lerp(.38,.42,lw);pz=lerp(0,.25,lw);
    if(sp>0){qx=lerp(qx,.16,sp);qy=lerp(qy,.26,sp);qz=lerp(qz,-.2,sp);px=lerp(px,.6,sp);py=lerp(py,.95,sp);pz=lerp(pz,.35,sp);}}
  s.wp.rotation.set(px+(s.wpP||0)+k*.12,py,pz,'YXZ');_wv.set(0,H.by,H.b-k*.035).applyQuaternion(s.wp.quaternion);s.wp.position.set(qx-_wv.x,qy-_wv.y,qz-_wv.z);}
// the hands on the weapon (or, with s.lh = [x,y,z] in the chest frame, the left hand somewhere else)
function armsOn(s){const H=HOLD[s.wid]||HOLD.m4,J=s.J||JOINT,q=s.wp.quaternion,p=s.wp.position,lw=s.lw;if(H.none)return;
  _wq.set(H.g[0],H.g[1],H.g[2]).applyQuaternion(q).add(p);armReach(s.aR,s.fR,J[4],_wq.x,_wq.y,_wq.z,lerp(1,.5,lw),lerp(-.55,-1,lw),lerp(.25,.35,lw),.36,.33);
  if(s.lh){const h=s.lh;armReach(s.aL,s.fL,J[2],h[0],h[1],h[2],-.6,-1,.2,.36,.33);}
  else{_wq.set(H.f[0],H.f[1],H.f[2]).applyQuaternion(q).add(p);armReach(s.aL,s.fL,J[2],_wq.x,_wq.y,_wq.z,-.35,-1,.1,.36,.33);}}
// walk (0) or run (1), and the legs and hips for a gait phase ph
const bump=(x,c,w)=>{let d=x-c;d-=TAU*Math.round(d/TAU);return Math.abs(d)<w?.5+.5*Math.cos(d/w*PI):0;};
// knee bend through the stride (swing, then a little at the footfall) and the foot's roll (toe off, heel strike)
function gaitKnee(p,r,m){return-((lerp(1.0,1.75,r)*bump(p,-.55+.15*r,1.35)+lerp(.15,.55,r)*bump(p,2.3,1.)+.03)*m);}
function gaitFoot(p,m){return(-.42*bump(p,-1.75,.75)+.14*bump(p,1.45,.6)+.08*bump(p,-.2,.9))*m;}
function legPose(s,dt){const c=s.crouch,m=s.moveAmt,ph=s.ph;s.gt=lerp(s.gt===undefined?0:s.gt,s.run?1:0,Math.min(1,dt*5));const r=s.gt,kn=c*(1-m)*(s.down?0:1);
  const A=lerp(.43,.66,r)*m,fb=lerp(.02,.16,r)*m,sL=Math.sin(ph),sR=-sL;
  let hL=A*sL+fb,hR=A*sR+fb,kL=gaitKnee(ph,r,m),kR=gaitKnee(ph+PI,r,m);
  // crouch: a squat while moving, one knee down when still
  hL=hL*(1-c)+c*lerp(.95,1.35,kn);kL=kL*(1-c)+c*lerp(-1.55,-1.48,kn);hR=hR*(1-c)+c*lerp(.95,-.32,kn);kR=kR*(1-c)+c*lerp(-1.55,-1.3,kn);
  s.lL.rotation.set(hL,0,.03+c*.12*(1-kn));s.lR.rotation.set(hR,0,-.03-c*.12*(1-kn)+c*kn*.08);s.kL.rotation.x=kL;s.kR.rotation.x=kR;
  if(s.ftL){s.ftL.rotation.x=-(hL+kL)*lerp(.75,1,c)+gaitFoot(ph,m)*(1-c);s.ftR.rotation.x=-(hR+kR)*lerp(.75,1,c)+gaitFoot(ph+PI,m)*(1-c)-c*kn*1.2;}
  // hips: down at each footfall, sway and turn with the stride
  const L0=.88,drop=L0*(1-Math.cos(A))*.85*(1-r*.5)*(.5-.5*Math.cos(2*ph)),bounce=r*m*.05*Math.abs(Math.sin(ph+.4));
  s.body.position.y=-c*lerp(.28,.41,kn)+.006*m-drop+bounce-r*m*.035;s.body.rotation.set(0,-.13*sL*m*(1-c),.035*Math.sin(ph*2+.5)*m*(1-r*.4));return r;}
// pose and limb animation: legs and hips, chest and head, the weapon and both hands
function animSoldier(s,dt){if(s.kind==='bobo'){animBobo(s,dt);return;}if(s.ride&&s.bikeM){animRider(s,dt);return;}
  const g=s.g;g.rotation.x=0;g.rotation.z=0;const t=G.time+(s.nid||0)*1.7,m=s.moveAmt,c=s.crouch;
  const r=legPose(s,dt),low=s.lowered?1:0;s.lw=lerp(s.lw===undefined?low:s.lw,low,Math.min(1,dt*6));const lw=s.lw;
  if(s.revealT>(s.rvl||0)+.5)s.kick=1;s.rvl=s.revealT;if(s.kick>0)s.kick=Math.max(0,s.kick-dt*9);
  const br=Math.sin(t*1.6)*(1-m*.6),fl=s.flinch>0?Math.min(1,s.flinch*5):0,ap=clamp(s.aimP,-.9,.9);
  // chest: leans into a run, breathes, blades to the target when the weapon is up, flinches when hit
  s.up.rotation.x=-lerp(.05,.24,r)*m-.18*c+ap*(1-lw)*.55-fl*.2+br*.012;s.up.rotation.y=-.38*(1-lw)+.16*Math.sin(s.ph)*m*(1-c)*.5+fl*.12*((s.nid||0)&1?1:-1);
  s.spr=r*m;holdPose(s,ap*.45);
  if(s.down){s.body.position.y=-.62;s.lL.rotation.set(1.45,0,.25);s.lR.rotation.set(1.25,0,-.2);s.kL.rotation.x=-.5;s.kR.rotation.x=-1.6;if(s.ftL){s.ftL.rotation.x=.3;s.ftR.rotation.x=.6;}
    s.up.rotation.x=-.25;s.up.rotation.y=0;s.wp.rotation.x-=.4;}
  if(s.unarmed||(HOLD[s.wid]&&HOLD[s.wid].none)){const sw=Math.sin(s.ph)*m;s.aL.rotation.set(-sw*lerp(.5,.9,r)+r*m*.2,0,-.13);s.aR.rotation.set(sw*lerp(.5,.9,r)+r*m*.2,0,.13);s.fL.rotation.x=lerp(.25,1.1,r*m)+Math.max(0,-sw)*.3;s.fR.rotation.x=lerp(.25,1.1,r*m)+Math.max(0,sw)*.3;}
  else armsOn(s);
  // head: looks along the sights, turns back from the blade, bobs a little
  if(s.hd)s.hd.rotation.set(-ap*(1-lw)*.45-(1-lw)*.18+lerp(.06,.18,r)*m+c*.1,.38*(1-lw)+Math.sin(t*.37)*.25*lw*(1-m)*(s.aware?0:1),(1-lw)*.1);}
// the fall: a hit from the front throws the soldier onto his back, one from behind drops him to his knees and forward, or he crumples
// sideways; the pose is a function of the time since the hit, so it settles and never twitches
function animDeath(s){const e=ease(s.deadT/.5),e2=ease((s.deadT-.22)/.5),k=s.fall>0?((s.nid&3)===3?2:0):(s.nid&1)?1:2,g=s.g,side=(s.nid&2)?1:-1;
  s.body.rotation.set(0,0,0);s.up.rotation.y=0;s.up.rotation.z=0;if(s.hd)s.hd.rotation.set(0,0,0);
  if(k===0){g.rotation.x=1.5*e;g.rotation.z=0;g.position.y=s.y0+e*.14;s.body.position.y=0;                            // backwards, arms thrown out, a knee up
    s.up.rotation.x=.22*e-.1*e2;s.aL.rotation.set(1.6*e,0,-1.25*e);s.aR.rotation.set(1.3*e,0,1.05*e);s.fL.rotation.x=.45*e;s.fR.rotation.x=.9*e;
    s.lL.rotation.set(.3*e,0,.1*e);s.lR.rotation.set(.95*e,0,-.18*e);s.kL.rotation.x=-.25*e;s.kR.rotation.x=-1.45*e;if(s.hd)s.hd.rotation.set(.35*e,.5*e*side,0);}
  else if(k===1){const kn=ease(s.deadT/.3);g.rotation.z=0;g.rotation.x=-1.45*e2;g.position.y=s.y0+e2*.1-kn*.4*(1-e2*.65);s.body.position.y=0; // onto the knees, then face down
    s.lL.rotation.set(1.5*kn-1.42*e2,0,.08);s.lR.rotation.set(1.5*kn-1.3*e2,0,-.08);s.kL.rotation.x=-2.3*kn+1.95*e2;s.kR.rotation.x=-2.3*kn+2.05*e2;
    s.up.rotation.x=.5*kn-.25*e2;s.aL.rotation.set(.6+1.3*e2,0,-.35-.55*e2);s.aR.rotation.set(.4+1.7*e2,0,.5+.45*e2);s.fL.rotation.x=.6;s.fR.rotation.x=.3;if(s.hd)s.hd.rotation.set(-.3*kn+.2*e2,.7*e2*side,0);}
  else{g.rotation.x=.18*e;g.rotation.z=side*1.45*e;g.position.y=s.y0+e*.2;s.body.position.y=0;                            // crumples sideways
    s.up.rotation.x=.35*e;s.aL.rotation.set(.9*e,0,side>0?-1.4*e:-.2*e);s.aR.rotation.set(.7*e,0,side>0?.2*e:1.4*e);s.fL.rotation.x=.8*e;s.fR.rotation.x=.95*e;
    s.lL.rotation.set(.9*e,0,.15*e);s.lR.rotation.set(.3*e,0,-.1*e);s.kL.rotation.x=-1.25*e;s.kR.rotation.x=-.5*e;if(s.hd)s.hd.rotation.set(.2*e,0,side*.5*e);}
  if(s.ftL){s.ftL.rotation.x=-.5*e;s.ftR.rotation.x=-.6*e;}}
// Bobo has no gun: arms swing, and his moves have poses of their own (s.bs: walk, wind, charge, stun, slamUp, slam, grab, throw, punch, sit, up)
function animBobo(s,dt){s.up.rotation.z=0;const m=s.moveAmt,ph=s.ph,st=s.bs||'walk',k=s.bT||0,sw=Math.sin(ph)*(s.run?.95:.55)*m;s.g.rotation.x=0;s.g.rotation.z=0;
  let by=Math.abs(Math.sin(ph))*.05*m,lean=-.08*m*(s.run?3:1),aL=-sw*.8,aR=sw*.8,zL=-.2,zR=.2,fL=.25,fR=.25,lL=sw,lR=-sw,
    kL=-Math.max(0,Math.sin(ph+PI*.5))*.8*m,kR=-Math.max(0,Math.sin(ph+PI*1.5))*.8*m,hx=0,hz=0;
  if(st==='wind'){const p=Math.sin(k*13);lean=-.38;by=-.1;aL=-.45;aR=-.45;zL=-.5;zR=.5;fL=fR=.9;lL=.3;lR=-.35+p*.35;kL=-.55;kR=-.3-Math.max(0,p)*.5;hx=.35;}  // head down, scraping a foot
  else if(st==='charge'){lean=-.6;aL=aR=.95;zL=-.35;zR=.35;fL=fR=.7;hx=.4;}
  else if(st==='slamUp'){const e=Math.min(1,k/.45);lean=.22*e;aL=aR=2.9*e;zL=-.18;zR=.18;fL=fR=.35;by=.03*e;hx=-.2*e;}
  else if(st==='slam'){const e=Math.min(1,k/.1);lean=.22-.9*e;aL=aR=2.9-2*e;fL=fR=.3;by=-.28*e;kL=kR=-.75*e;lL=lR=.5*e;hx=.3*e;}
  else if(st==='stun'){lean=-.45+Math.sin(G.time*5)*.05;aL=aR=.35;fL=fR=.45;by=-.1;lL=lR=.15;kL=kR=-.3;hx=.3;hz=Math.sin(G.time*2.3)*.15;}
  else if(st==='grab'||st==='throw'){aL=aR=1.45;zL=-.05;zR=.05;fL=fR=.3;lean=.05;if(st==='throw'){const e=Math.min(1,k/.22);aR=1.45-1.1*e;aL=1.45+.7*e;lean=.05-.35*e;}}
  else if(st==='punch'){const e=Math.sin(Math.min(1,k/.35)*PI);aR=.35+1.25*e;fR=1.3-1.2*e;lean=-.18*e;}
  else if(st==='scoot'||st==='swing'||st==='wobble'){by=-.5+Math.sin(G.time*20)*.012;lean=-.12;aL=aR=1.2;zL=-.12;zR=.12;fL=fR=.45;lL=lR=1.38;kL=kR=-1.6; // knees up, on a scooter far too small
    if(st==='swing'){const e=Math.min(1,k/.5);zR=.12+1.35*e;aR=1.2-.9*e;fR=.45-.4*e;lean=-.12+.15*e;}
    else if(st==='wobble'){const q=1-k/1.3;s.up.rotation.z=Math.sin(k*14)*.3*q;aL=1.2+Math.sin(k*17)*.7*q;aR=1.2-Math.sin(k*15)*.7*q;}}
  else if(st==='sit'||st==='up'){const e=st==='sit'?Math.min(1,k/.6):Math.max(0,1-k/.9),q=1-e;
    by=by*q-.8*e;lean=lean*q+.18*e;aL=aL*q+.6*e;aR=aR*q+.6*e;fL=fL*q+1*e;fR=fR*q+1*e;zL=-.2*q-.35*e;zR=.2*q+.35*e;lL=lL*q+1.45*e;lR=lR*q+1.4*e;kL=kL*q-.15*e;kR=kR*q-.1*e;hx=.25*e;}
  s.body.position.y=by;s.body.rotation.set(0,0,0);s.up.rotation.x=lean;s.up.rotation.y=0;s.aL.rotation.set(aL,0,zL);s.aR.rotation.set(aR,0,zR);s.fL.rotation.x=fL;s.fR.rotation.x=fR;
  s.lL.rotation.set(lL,0,.04);s.lR.rotation.set(lR,0,-.04);s.kL.rotation.x=kL;s.kR.rotation.x=kR;s.wp.position.y=.36;
  if(s.ftL){s.ftL.rotation.x=-(lL+kL)*.7;s.ftR.rotation.x=-(lR+kR)*.7;}if(s.hd)s.hd.rotation.set(-lean*.5+hx,0,hz);}
// a squad mate on a lowrider bike: the shared rider pose (06d) at a crank angle that follows the distance ridden, wheels turning
function animRider(s,dt){const d=(s.ph-(s.rph===undefined?s.ph:s.rph))/2.4;s.rph=s.ph;s.g.rotation.x=0;s.g.rotation.z=0;if(s.hd)s.hd.rotation.set(.1,0,0);
  if(typeof rideAnim==='function'){rideAnim(s,s.ph*1.1);if(s.bikeM&&typeof bikeSpin==='function')bikeSpin(s.bikeM,Math.max(0,d),s.ph*1.1,0);return;}
  s.body.position.y=-.3;s.up.rotation.x=-.3;s.aL.rotation.set(1.25,0,-.12);s.aR.rotation.set(1.25,0,.12);s.fL.rotation.x=s.fR.rotation.x=.35;}
// ray against soldiers: head sphere, torso and leg cylinders. Result in RS.
const RS={s:null,t:0,zone:1};
function raySoldiers(list,ox,oy,oz,dx,dy,dz,maxT){let bt=maxT;RS.s=null;const a=dx*dx+dz*dz;
  for(let k=0;k<list.length;k++){const s=list[k];if(!s.alive)continue;const cx=ox-s.x,cz=oz-s.z,sc=s.sc,low=s.crouch*.45*sc;
    let cy=oy-(s.y0+1.67*sc-low),b=cx*dx+cy*dy+cz*dz,c=cx*cx+cy*cy+cz*cz-.046*sc*sc,disc=b*b-c;
    if(disc>0){const t=-b-Math.sqrt(disc);if(t>0&&t<bt){bt=t;RS.s=s;RS.zone=0;}}
    if(a>1e-9){b=cx*dx+cz*dz;c=cx*cx+cz*cz-.12*sc*sc;disc=b*b-a*c;
      if(disc>0){const t=(-b-Math.sqrt(disc))/a;if(t>0&&t<bt){const y=oy+dy*t-s.y0;if(y>0&&y<1.56*sc-low){bt=t;RS.s=s;RS.zone=y>(.9-s.crouch*.45)*sc?1:2;}}}}}
  RS.t=bt;return RS.s;}
const eyeY=s=>s.y0+(1.6-s.crouch*.5)*s.sc,chestY=s=>s.y0+(1.25-s.crouch*.42)*s.sc;
