// =====================================================================
// 03b STREET FURNITURE + SKY: street lights, traffic signals, power lines, string lights, chain-link mesh, barrels, fuel pumps,
// freeway traffic, the San Gabriel Mountains, sky and sun
// =====================================================================
GEO.taper6=cylG(.7,1,1,6,true);GEO.lens=new T.PlaneGeometry(1,1);GEO.lens.rotateX(PI/2); // downward-facing quad
{ // 0 median lamp with two arms, 1 plaza globe, 2 cobra head on one arm, 3 parking-lot shoebox pair, 4 Promenade lantern post, 5 tract cobra head on a concrete pole
 const a=new GB(),steel=0x9aa1a3;a.add(GEO.tube6,0,0,0,0,0,0,.1,8,.1,steel);a.add(GEO.tube6,0,0,0,0,0,0,.2,.5,.2,0x6f7577);
 for(const s of [-1,1]){a.add(GEO.rod,0,7.9,0,0,0,-s*(PI/2-.25),.05,2.1,.05,steel);a.add(GEO.box,s*2.1,8.35,0,0,0,0,.75,.12,.3,0x5a5f61);a.add(GEO.box,s*2.1,8.3,0,0,0,0,.6,.05,.22,0xf6efcf);}
 bake(a.build(),M.flat,lamps.filter(l=>l[2]===0),(o,p)=>{o.position.set(p[0],.2,p[1]);o.rotation.y=p[3]||0;});
 const b=new GB();b.add(GEO.tube6,0,0,0,0,0,0,.14,.5,.14,0x2b2621);b.add(GEO.rod,0,.5,0,0,0,0,.055,3,.055,0x2b2621);b.add(GEO.cyl6,0,3.5,0,0,0,0,.16,.1,.16,0x2b2621);b.add(GEO.blob,0,3.86,0,0,0,0,.3,.3,.3,0xf6efcf);
 bake(b.build(),M.flat,lamps.filter(l=>l[2]===1),(o,p)=>o.position.set(p[0],PADY,p[1]));
 const c=new GB();c.add(GEO.taper6,0,0,0,0,0,0,.16,9,.16,steel);c.add(GEO.rod3,0,8.5,0,PI/2-.12,0,0,.05,2.6,.05,steel);c.add(GEO.box,0,8.5,2.7,0,0,0,.42,.22,.85,0x8c9396);c.add(GEO.lens,0,8.49,2.7,0,0,0,.32,1,.6,0xf6efcf);
 bake(c.build(),M.flat,lamps.filter(l=>l[2]===2),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[3]||0;o.scale.setScalar(p[4]||1);});
 const d=new GB();d.add(GEO.taper6,0,0,0,0,0,0,.14,9.5,.14,0x5a4a3c);d.add(GEO.box,0,9.3,0,0,0,0,1.8,.12,.12,0x3a3128);for(const s of [-1,1]){d.add(GEO.box,s*.85,9.02,0,0,0,0,.55,.26,.75,0x3a3128);d.add(GEO.lens,s*.85,9.01,0,0,0,0,.45,1,.6,0xf6efcf);}
 d.add(GEO.cyl6,0,0,0,0,0,0,.35,.7,.35,0xb9b4a8);bake(d.build(),M.flat,lamps.filter(l=>l[2]===3),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=(p[3]||0)+PI/2;});
 const e=new GB();e.add(GEO.taper,0,0,0,0,0,0,.12,4.4,.12,0x1c1a18);e.add(GEO.box,0,4.2,0,0,0,0,1.5,.08,.08,0x1c1a18);for(const s of [-1,1]){e.add(GEO.cyl6,s*.7,3.7,0,0,0,0,.2,.5,.2,0xf6efcf);e.add(GEO.cone8,s*.7,4.2,0,0,0,0,.26,.3,.26,0x1c1a18);}
 bake(e.build(),M.flat,lamps.filter(l=>l[2]===4),(o,p)=>o.position.set(p[0],PADY,p[1]));
 const f=new GB();f.add(GEO.taper6,0,0,0,0,0,0,.19,7.6,.19,0xbdb8ac,(x,y,z)=>.92+(y>4?.05:0));f.add(GEO.rod3,0,7.15,0,PI/2-.2,0,0,.045,2.15,.045,0x9aa1a3);f.add(GEO.box,0,7.31,2.15,0,0,0,.38,.2,.78,0x8c9396);
 f.add(GEO.lens,0,7.3,2.15,0,0,0,.3,1,.56,0xf6efcf);bake(f.build(),M.flat,lamps.filter(l=>l[2]===5),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[3]||0;});
 lamps.forEach(l=>solid(l[0],l[1],.3,.3,l[2]===1||l[2]===4?4.2:8.5*(l[4]||1)));}
// traffic signals: the arms over the north-south roads show green, the others red
for(const s of signalArms){const [px,pz,dx,dz,L0,green]=s;
  anchor(px,pz,()=>{put(M.flat,GEO.taper6,px,0,pz,0,.17,7,.17,0x5a5f55);put(M.flat,GEO.box,px+dx*L0/2,6.55,pz+dz*L0/2,dx?PI/2:0,.14,.14,L0,0x5a5f55);
    for(const t of [L0*.45,L0*.9]){const hx=px+dx*t,hz=pz+dz*t;put(M.flat,GEO.box,hx,5.35,hz,0,.36,1.1,.36,0xd8b02a);
      for(let k=0;k<3;k++){const y=6.12-k*.34,col=k===(green?2:0)?(green?0x3dff7a:0xff3a2a):0x2a2622,o=.19;
        for(const sd of [-1,1]){const ox=dx?0:sd*o,oz=dx?sd*o:0,hw=.12;if(dx)quadC(M.flat,[hx-hw*sd,y-.12,hz+oz],[hx+hw*sd,y-.12,hz+oz],[hx+hw*sd,y+.12,hz+oz],[hx-hw*sd,y+.12,hz+oz],0,0,sd,col);
          else quadC(M.flat,[hx+ox,y-.12,hz+hw*sd],[hx+ox,y-.12,hz-hw*sd],[hx+ox,y+.12,hz-hw*sd],[hx+ox,y+.12,hz+hw*sd],sd,0,0,col);}}}});}
{ // wooden power poles with a crossarm; wires sag between neighbours. String lights over the Market Hall patio share the line mesh.
 const b=new GB(),w=0x6b5138;b.add(GEO.tube6,0,0,0,0,0,0,.13,9.5,.13,w);b.add(GEO.box,0,8.6,0,0,0,0,.12,.12,2.3,w);for(const s of [-1,0,1])b.add(GEO.rod,0,8.72,s*1,0,0,0,.05,.16,.05,0xd9d9d2);
 const b2=new GB();b2.add(GEO.tube6,0,0,0,0,0,0,.12,9.4,.12,w);b2.add(GEO.box,0,8.6,0,0,0,0,.11,.11,2.3,w);for(const s of [-1,1])b2.add(GEO.rod3,0,8.72,s,0,0,0,.05,.16,.05,0xd9d9d2); // back-lot pole
 b.add(GEO.cyl6,.22,6.4,0,0,0,0,.24,.8,.24,0x8c9396);bake(b.build(),M.flat,poles.filter((p,k)=>!p[3]||k%5===0),(o,p)=>{o.position.set(p[0],0,p[1]);o.rotation.y=p[2]?PI/2:0;});
 bake(b2.build(),M.flat,poles.filter((p,k)=>p[3]&&k%5!==0),(o,p)=>{o.position.set(p[0],0,p[1]);o.rotation.y=p[2]?PI/2:0;});poles.forEach(p=>solid(p[0],p[1],.3,.3,9));
 const pts=[],cols=[];const seg=(a,b,c)=>{pts.push(...a,...b);cols.push(...c,...c);};
 for(let k=0;k<poles.length-1;k++){const A=poles[k],B=poles[k+1];if(A[2]!==B[2]||Math.hypot(A[0]-B[0],A[1]-B[1])>50)continue;
   for(const s of [-1,0,1])for(let q=0;q<4;q++){const t0=q/4,t1=(q+1)/4,sag=t=>8.85-1.6*t*(1-t),ox=A[2]?s:0,oz=A[2]?0:s;
     seg([lerp(A[0],B[0],t0)+ox,sag(t0),lerp(A[1],B[1],t0)+oz],[lerp(A[0],B[0],t1)+ox,sag(t1),lerp(A[1],B[1],t1)+oz],[.17,.15,.13]);}}
 for(const s of stringLights)for(let q=0;q<6;q++){const t0=q/6,t1=(q+1)/6,sag=t=>s[4]-1.2*t*(1-t);seg([lerp(s[0],s[2],t0),sag(t0),lerp(s[1],s[3],t0)],[lerp(s[0],s[2],t1),sag(t1),lerp(s[1],s[3],t1)],[1,.86,.55]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('color',new T.Float32BufferAttribute(cols,3));
 const ln=new T.LineSegments(g,new T.LineBasicMaterial({vertexColors:true}));ln.frustumCulled=false;scene.add(ln);}
{ // chain-link mesh panels: one see-through batch for every fence in town
 M.chain=new T.MeshBasicMaterial({transparent:true,side:T.DoubleSide,depthWrite:false,map:tex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(150,158,160,.75)';g.lineWidth=1.4;
   for(let k=-64;k<128;k+=8){g.beginPath();g.moveTo(k,0);g.lineTo(k+64,64);g.moveTo(k,64);g.lineTo(k+64,0);g.stroke();}},true)});
 for(const f of fenceMesh){const x0=f[0]-f[2]/2,x1=f[0]+f[2]/2,z0=f[1]-f[3]/2,z1=f[1]+f[3]/2,L0=Math.max(f[2],f[3]);quad(M.chain,[x0,.05,z0],[x1,.05,z1],[x1,f[4],z1],[x0,f[4],z0],0,0,1,L0/1.2,f[4]/1.2);}
 // wire baskets of the shopping carts (their frames are baked in 03a): four sides and the floor of a box, wider at the top
 for(const c of cartSpots){const cs=Math.cos(c[2]),sn=Math.sin(c[2]),P=(lx,y,lz)=>[c[0]+lx*cs+lz*sn,PADY+y,c[1]-lx*sn+lz*cs],b=[[-.22,.42,-.36],[.22,.42,-.36],[.22,.42,.32],[-.22,.42,.32]],t=[[-.27,.95,-.42],[.27,.95,-.42],[.27,.95,.4],[-.27,.95,.4]];
   for(let k=0;k<4;k++){const j=(k+1)%4;quad(M.chain,P(...b[k]),P(...b[j]),P(...t[j]),P(...t[k]),0,0,1,.9,.9);}quad(M.chain,P(...b[0]),P(...b[1]),P(...b[2]),P(...b[3]),0,1,0,.9,1.3);}}
// explosive barrels and fuel pumps are separate objects so they can be destroyed
{const pts=[];for(const q of [[0,0],[.4,0],[.42,.03],[.42,.36],[.44,.38],[.42,.4],[.42,.74],[.44,.76],[.42,.78],[.42,1.12],[.4,1.15],[.34,1.15],[.34,1.12],[0,1.12]])pts.push(new T.Vector2(q[0],q[1]));
 const barrelGeo=new T.LatheGeometry(pts,12),barrelMat=L({color:0xb3261e});
 for(const s of barrelSpots){const m=new T.Mesh(barrelGeo,barrelMat);m.position.set(s[0],0,s[1]);m.castShadow=true;addProp(m);const c=solid(s[0],s[1],.84,.84,1.15,0,3);c.hp=40;c.ref=m;}
 const b=new GB();b.add(GEO.box,0,0,0,0,0,0,.62,1.5,.42,0xe9e6dc);b.add(GEO.box,0,1.5,0,0,0,0,.7,.34,.5,0x1d6f9a);b.add(GEO.box,0,.95,.215,0,0,0,.46,.36,.02,0x15110c);b.add(GEO.box,0,.95,-.215,0,0,0,.46,.36,.02,0x15110c);
 b.add(GEO.box,0,.5,.215,0,0,0,.5,.3,.02,0xb3261e);b.add(GEO.box,0,.5,-.215,0,0,0,.5,.3,.02,0xb3261e);b.add(GEO.cyl6,.36,.5,0,0,0,0,.035,.8,.035,0x1b1a19);b.add(GEO.cyl6,-.36,.5,0,0,0,0,.035,.8,.035,0x1b1a19);
 b.add(GEO.box,0,0,0,0,0,0,.66,.12,.46,0x8c9396);const pumpGeo=b.build();
 for(const p of pumps){const m=new T.Mesh(pumpGeo,vcMat);m.position.set(p[0],PADY+.18,p[1]);m.rotation.y=p[2]?PI/2:0;m.castShadow=true;addProp(m);
   const c=solid(p[0],p[1],p[2]?.5:.7,p[2]?.7:.5,2.1,0,4);c.hp=90;c.ref=m;}}
// traffic on the freeway deck (scenery: no colliders)
for(const c of fwyCars)vehicle(c[3],c[0],c[1],false,pick(carCols),1,true,false,c[2],6.4);
// San Gabriel Mountains: a wall of ridges across the whole northern horizon, hazy blue-grey, snow streaks on the high peaks.
// They ride with the camera like the sky. Bearings in degrees from north (east positive).
const sierra=new T.Group();scene.add(sierra);
{const pk=(b,c,h,w)=>h*Math.exp(-((b-c)*(b-c))/(2*w*w));
 const far=b=>Math.max(170+50*Math.sin(b*.09),pk(b,-18,430,10)+pk(b,-9,385,6)+pk(b,4,400,8)+pk(b,15,370,7)+pk(b,-34,300,11)+pk(b,-60,250,14)+pk(b,72,300,20)+pk(b,94,270,12))+40*Math.sin(b*.23)-(b>38&&b<52?45*Math.sin((b-38)/14*PI):0);
 const mid=b=>Math.max(80,far(b)*.66+30*Math.sin(b*.31)+18*Math.sin(b*.77)),near=b=>Math.max(40,(b>-80&&b<62?110+50*Math.sin(b*.2+1)+26*Math.sin(b*.53):50)-(b>36&&b<54?40:0));
 const hz=0xd9ccb4;
 for(const lay of [[2050,0x9ba6b7,far,1,0x9fa9b8],[1720,0x8a93a2,mid,2,0x8e96a2],[1420,0x84836f,near,3,0x8a8670]]){const p=[],c=[],ix=[];let n=0;
   for(let b=-104;b<=104;b+=1.2,n++){const br=b*PI/180,x=lay[0]*Math.sin(br),z=-lay[0]*Math.cos(br),edge=clamp(Math.min(b+104,104-b)/22,0,1),h=(lay[2](b)+rr(-12,12))*edge+4,snow=lay[3]===1&&h>370&&rnd()<.7,sd=snow?rr(.02,.12)*h:6;
     const hc=mixc(lay[1],hz,.6),top=snow?0xeef2f6:shade(lay[1],1.06),sub=snow?shade(lay[1],1.08):lay[1];
     for(const q of [[-14,hc],[h*.55,mixc(lay[1],hz,.22)],[h-sd,sub],[h,top]]){p.push(x,q[0],z);c.push((q[1]>>16&255)/255,(q[1]>>8&255)/255,(q[1]&255)/255);}
     if(b<104-.01){const a=n*4;for(let r=0;r<3;r++)ix.push(a+r,a+r+1,a+r+4,a+r+1,a+r+5,a+r+4);}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setIndex(ix);
   const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,fog:false,side:T.DoubleSide,depthWrite:false}));m.renderOrder=-9+lay[3];m.frustumCulled=false;sierra.add(m);}}
const sky=new T.Mesh(new T.SphereGeometry(2400,32,16),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,
  map:tex(1024,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a66ad');gr.addColorStop(.3,'#6fa4d2');gr.addColorStop(.44,'#c9d3d2');gr.addColorStop(.485,'#e6cfa8');
    gr.addColorStop(.5,'#e3c7a0');gr.addColorStop(1,'#e3c7a0');g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let k=0;k<26;k++){const cx=rnd()*w,cy=h*rr(.25,.43),rx=rr(40,130),ry=rr(5,13);for(let q=0;q<7;q++){const x=cx+rr(-rx,rx),y=cy+rr(-ry,ry),r=rr(18,46);
      for(const ox of [-w,0,w]){const cg=g.createRadialGradient(x+ox,y,1,x+ox,y,r);cg.addColorStop(0,'rgba(255,250,240,.2)');cg.addColorStop(1,'rgba(255,250,240,0)');g.fillStyle=cg;g.fillRect(x+ox-r,y-r,2*r,2*r);}}}})}));
sky.renderOrder=-10;scene.add(sky);
const glow=tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,'rgba(255,244,214,.95)');
  gr.addColorStop(.4,'rgba(255,220,160,.25)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const sunSprite=new T.Sprite(new T.SpriteMaterial({map:glow,fog:false,depthWrite:false,transparent:true}));sunSprite.scale.set(520,520,1);scene.add(sunSprite);
