// =====================================================================
// 03b STREET FURNITURE + SKY: street lights, traffic signals, power lines, string lights, chain-link mesh, barrels, fuel pumps,
// freeway traffic, the San Gabriel Mountains, sky and sun
// =====================================================================
{ // 0 median lamp with two arms, 1 plaza globe, 2 cobra head on one arm (scaled down in the tracts), 3 parking-lot shoebox pair, 4 Promenade lantern post
 const a=new GB(),steel=0x9aa1a3;a.add(GEO.tube6,0,0,0,0,0,0,.1,8,.1,steel);a.add(GEO.tube6,0,0,0,0,0,0,.2,.5,.2,0x6f7577);
 for(const s of [-1,1]){a.add(GEO.rod,0,7.9,0,0,0,-s*(PI/2-.25),.05,2.1,.05,steel);a.add(GEO.box,s*2.1,8.35,0,0,0,0,.75,.12,.3,0x5a5f61);a.add(GEO.box,s*2.1,8.3,0,0,0,0,.6,.05,.22,0xf6efcf);}
 bake(a.build(),M.flat,lamps.filter(l=>l[2]===0),(o,p)=>{o.position.set(p[0],.2,p[1]);o.rotation.y=p[3]||0;});
 const b=new GB();b.add(GEO.tube6,0,0,0,0,0,0,.14,.5,.14,0x2b2621);b.add(GEO.rod,0,.5,0,0,0,0,.055,3,.055,0x2b2621);b.add(GEO.cyl6,0,3.5,0,0,0,0,.16,.1,.16,0x2b2621);b.add(GEO.blob,0,3.86,0,0,0,0,.3,.3,.3,0xf6efcf);
 bake(b.build(),M.flat,lamps.filter(l=>l[2]===1),(o,p)=>o.position.set(p[0],PADY,p[1]));
 const c=new GB();c.add(GEO.taper,0,0,0,0,0,0,.16,9,.16,steel);c.add(GEO.rod,0,8.5,0,PI/2-.12,0,0,.05,2.6,.05,steel);c.add(GEO.box,0,8.62,2.7,0,0,0,.42,.2,.85,0x8c9396);c.add(GEO.box,0,8.5,2.7,0,0,0,.32,.04,.6,0xf6efcf);
 bake(c.build(),M.flat,lamps.filter(l=>l[2]===2),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=p[3]||0;o.scale.setScalar(p[4]||1);});
 const d=new GB();d.add(GEO.taper,0,0,0,0,0,0,.14,9.5,.14,0x5a4a3c);d.add(GEO.box,0,9.3,0,0,0,0,1.8,.12,.12,0x3a3128);for(const s of [-1,1]){d.add(GEO.box,s*.85,9.15,0,0,0,0,.55,.24,.75,0x3a3128);d.add(GEO.box,s*.85,9.02,0,0,0,0,.45,.03,.6,0xf6efcf);}
 d.add(GEO.cyl8,0,0,0,0,0,0,.35,.7,.35,0xb9b4a8);bake(d.build(),M.flat,lamps.filter(l=>l[2]===3),(o,p)=>{o.position.set(p[0],PADY,p[1]);o.rotation.y=(p[3]||0)+PI/2;});
 const e=new GB();e.add(GEO.taper,0,0,0,0,0,0,.12,4.4,.12,0x1c1a18);e.add(GEO.box,0,4.2,0,0,0,0,1.5,.08,.08,0x1c1a18);for(const s of [-1,1]){e.add(GEO.cyl6,s*.7,3.7,0,0,0,0,.2,.5,.2,0xf6efcf);e.add(GEO.cone8,s*.7,4.2,0,0,0,0,.26,.3,.26,0x1c1a18);}
 bake(e.build(),M.flat,lamps.filter(l=>l[2]===4),(o,p)=>o.position.set(p[0],PADY,p[1]));
 lamps.forEach(l=>solid(l[0],l[1],.3,.3,l[2]===1||l[2]===4?4.2:8.5*(l[4]||1)));}
// traffic signals: the arms over the north-south roads show green, the others red
for(const s of signalArms){const [px,pz,dx,dz,L0,green]=s;
  anchor(px,pz,()=>{put(M.flat,GEO.taper,px,0,pz,0,.17,7,.17,0x5a5f55);put(M.flat,GEO.box,px+dx*L0/2,6.55,pz+dz*L0/2,dx?PI/2:0,.14,.14,L0,0x5a5f55);
    for(const t of [L0*.45,L0*.9]){const hx=px+dx*t,hz=pz+dz*t;put(M.flat,GEO.box,hx,5.35,hz,0,.36,1.1,.36,0xd8b02a);
      for(let k=0;k<3;k++){const y=6.12-k*.34,col=k===(green?2:0)?(green?0x3dff7a:0xff3a2a):0x2a2622,o=.19;
        for(const sd of [-1,1]){const ox=dx?0:sd*o,oz=dx?sd*o:0,hw=.12;if(dx)quadC(M.flat,[hx-hw*sd,y-.12,hz+oz],[hx+hw*sd,y-.12,hz+oz],[hx+hw*sd,y+.12,hz+oz],[hx-hw*sd,y+.12,hz+oz],0,0,sd,col);
          else quadC(M.flat,[hx+ox,y-.12,hz+hw*sd],[hx+ox,y-.12,hz-hw*sd],[hx+ox,y+.12,hz-hw*sd],[hx+ox,y+.12,hz+hw*sd],sd,0,0,col);}}}});}
{ // wooden power poles with a crossarm; wires sag between neighbours. String lights over the Market Hall patio share the line mesh.
 const b=new GB(),w=0x6b5138;b.add(GEO.tube6,0,0,0,0,0,0,.13,9.5,.13,w);b.add(GEO.box,0,8.6,0,0,0,0,.12,.12,2.3,w);for(const s of [-1,0,1])b.add(GEO.rod,0,8.72,s*1,0,0,0,.05,.16,.05,0xd9d9d2);
 b.add(GEO.cyl6,.22,6.4,0,0,0,0,.24,.8,.24,0x8c9396);bake(b.build(),M.flat,poles,(o,p)=>{o.position.set(p[0],0,p[1]);o.rotation.y=p[2]?PI/2:0;});poles.forEach(p=>solid(p[0],p[1],.3,.3,9));
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
 for(const f of fenceMesh){const x0=f[0]-f[2]/2,x1=f[0]+f[2]/2,z0=f[1]-f[3]/2,z1=f[1]+f[3]/2,L0=Math.max(f[2],f[3]);quad(M.chain,[x0,.05,z0],[x1,.05,z1],[x1,f[4],z1],[x0,f[4],z0],0,0,1,L0/1.2,f[4]/1.2);}}
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
const seedSky=seed;
// Sky colour (0..1 display values) for a unit direction: deep blue overhead, paler towards the horizon, brighter and warmer round the
// sun, and at the horizon exactly the haze colour the fog uses in that direction (hazeRGB), so distant blocks melt into it.
function skyRGB(dx,dy,dz){const hz=hazeRGB(dx,dy,dz);if(dy<=0)return hz;
  const t=Math.pow(dy,.62),G=t<.26?[lerp(.77,.62,t/.26),lerp(.83,.75,t/.26),lerp(.88,.87,t/.26)]:t<.62?[lerp(.62,.45,(t-.26)/.36),lerp(.75,.63,(t-.26)/.36),lerp(.87,.83,(t-.26)/.36)]:[lerp(.45,.32,(t-.62)/.38),lerp(.63,.51,(t-.62)/.38),lerp(.83,.76,(t-.62)/.38)];
  const w=Math.exp(-dy/.075),s=Math.max(0,dx*SUN.x+dy*SUN.y+dz*SUN.z),s2=s*s,s4=s2*s2,s8=s4*s4,s64=s8*s8*s8*s8*s8*s8*s8*s8,gl=Math.min(1,s8*.3+s64*.45);
  return [lerp(lerp(G[0],hz[0],w),1,gl),lerp(lerp(G[1],hz[1],w),.97,gl),lerp(lerp(G[2],hz[2],w),.9,gl)];}
// San Gabriel Mountains: a wall of ridges across the whole northern horizon, lit from the west-southwest (slopes that face the sun
// lighter and warmer), fading with height and distance into the sky behind them: farther ridges lighter and bluer, every foot lost
// in the horizon haze. Snow streaks on the high peaks. They ride with the camera like the sky. Bearings in degrees from north (east positive).
const sierra=new T.Group();scene.add(sierra);
{const pk=(b,c,h,w)=>h*Math.exp(-((b-c)*(b-c))/(2*w*w));
 const far=b=>Math.max(170+50*Math.sin(b*.09),pk(b,-18,430,10)+pk(b,-9,385,6)+pk(b,4,400,8)+pk(b,15,370,7)+pk(b,-34,300,11)+pk(b,-60,250,14)+pk(b,72,300,20)+pk(b,94,270,12))+40*Math.sin(b*.23)-(b>38&&b<52?45*Math.sin((b-38)/14*PI):0);
 const mid=b=>Math.max(80,far(b)*.66+30*Math.sin(b*.31)+18*Math.sin(b*.77)),near=b=>Math.max(40,(b>-80&&b<62?110+50*Math.sin(b*.2+1)+26*Math.sin(b*.53):50)-(b>36&&b<54?40:0));
 const c3=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
 // radius, height, sunlit colour, shaded colour, haze left at the crest, order
 for(const lay of [[2050,far,0x8f9aac,0x707d95,.44,1],[1720,mid,0x8d898e,0x69707f,.32,2],[1420,near,0x8a8266,0x5c5e50,.2,3]]){const p=[],c=[],ix=[],R0=lay[0],H=[],B=[];
   for(let b=-104;b<=104.01;b+=1.2){const edge=clamp(Math.min(b+104,104-b)/22,0,1);B.push(b);H.push((lay[1](b)+rr(-12,12))*edge+4);}
   const lit=c3(lay[2]),shd=c3(lay[3]),step=1.2*PI/180*R0;
   B.forEach((b,i)=>{const br=b*PI/180,sx=Math.sin(br),sz=-Math.cos(br),x=R0*sx,z=R0*sz,h=H[i];
     // rise per metre towards the east: such a slope faces the low western sun
     const sl=(H[Math.min(i+2,H.length-1)]-H[Math.max(i-2,0)])/(4*step),L0=clamp(.5+sl*.85+rr(-.03,.03),0,1),rock=mix3(shd,lit,L0);
     const snowK=lay[5]===1?clamp((h-385)/45,0,1)*(.7+.3*Math.sin(b*.9)):0,snow=snowK>.05,sd=snowK*.07*h,snowC=mix3([.78,.82,.88],[.96,.96,.97],L0);
     for(const q of [[-60,0],[h*.12,.12],[h*.3,.3],[h*.55,.55],[h-sd-4,.94],[h,1]]){const y=q[0],t=q[1],el=Math.atan2(y,R0),ce=Math.cos(el);
       const base=snow&&t>.9?(y>=h-.01?mix3(rock,snowC,snowK):mix3(rock,snowC,.6*snowK)):rock,sk=skyRGB(sx*ce,Math.sin(el),sz*ce),hzK=lay[4]+(1-lay[4])*Math.pow(1-t,1.7),col=mix3(base,sk,hzK);
       p.push(x,y,z);c.push(col[0],col[1],col[2]);}
     if(i<B.length-1){const a=i*6;for(let r=0;r<5;r++)ix.push(a+r,a+r+1,a+r+6,a+r+1,a+r+7,a+r+6);}});
   // colours are display values: the vertex shader takes them to linear and the output encoding brings them back unchanged
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setIndex(ix);
   // the ridges write depth, so the far floor (fully fogged) cannot paint over their feet; the plain in front still hides their base
   const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false,side:T.DoubleSide}));m.renderOrder=-10+lay[5];m.frustumCulled=false;sierra.add(m);}}
// the sky dome, painted per pixel from skyRGB (equirectangular: column = bearing, row = elevation), with a few thin cirrus streaks
const sky=new T.Mesh(new T.SphereGeometry(2400,32,16),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,toneMapped:false,
  map:tex(512,256,(g,w,h)=>{const im=g.createImageData(w,h),D=im.data,cs=[],sn=[];for(let x=0;x<w;x++){const ph=(x+.5)/w*TAU;cs.push(-Math.cos(ph));sn.push(Math.sin(ph));}
    for(let y=0;y<h;y++){const th=(y+.5)/h*PI,st=Math.sin(th),ct=Math.cos(th);for(let x=0;x<w;x++){const v=skyRGB(cs[x]*st,ct,sn[x]*st),k=(y*w+x)*4;D[k]=v[0]*255;D[k+1]=v[1]*255;D[k+2]=v[2]*255;D[k+3]=255;}}
    g.putImageData(im,0,0);g.lineCap='round';
    for(let k=0;k<11;k++){const cx=rnd()*w,cy=h*rr(.2,.42),len=rr(30,90),cur=rr(-14,14),tilt=rr(-6,6);
      for(const ox of [-w,0,w])for(const [lw,a] of [[9,.035],[5,.045],[2.2,.06]]){g.strokeStyle='rgba(255,252,246,'+a+')';g.lineWidth=lw*(cy/h+.5);g.beginPath();g.moveTo(cx+ox-len/2,cy-tilt);
        g.quadraticCurveTo(cx+ox,cy+cur,cx+ox+len/2,cy+tilt);g.stroke();}}})}));
sky.renderOrder=-10;scene.add(sky);
// the sun: a hard white core in a warm glow. It blooms a little when looked at, and a veil of glare (#glare) follows it on screen
// while it is in view and not behind a building (one ray through the collider grid per frame).
const glow=tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.07,'rgba(255,253,246,1)');gr.addColorStop(.11,'rgba(255,240,210,.7)');
  gr.addColorStop(.25,'rgba(255,226,180,.26)');gr.addColorStop(.55,'rgba(255,215,165,.08)');gr.addColorStop(1,'rgba(255,210,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
rndSkip(seedSky,1275); // the stream as the town had it before this section changed
const sunSprite=new T.Sprite(new T.SpriteMaterial({map:glow,fog:false,depthWrite:false,transparent:true,toneMapped:false}));sunSprite.scale.set(560,560,1);scene.add(sunSprite);
{const v=new T.Vector3(),el=$('glare');let gk=0,gx=-1e4,gy=-1e4,go=-1,see=1;
 scene.onBeforeRender=(r,s,cam)=>{cam.getWorldDirection(v);const d=v.dot(SUN),f=clamp((d-.55)/.42,0,1),k=f*f*(3-2*f);
   if(d>.3){const p=cam.position;see=lerp(see,rayWorld(p.x,p.y,p.z,SUN.x,SUN.y,SUN.z,140)<140?0:1,.25);}else see=1;
   gk=lerp(gk,k*see,.3);sunSprite.scale.set(560*(1+.65*gk),560*(1+.65*gk),1);sunSprite.material.opacity=.85+.15*gk;sunSprite.updateMatrixWorld();
   if(!el)return;let o=0;
   if(gk>.01){v.copy(cam.position).addScaledVector(SUN,1000).project(cam);if(v.z<1){o=gk*.6;const x=(v.x*.5+.5)*innerWidth,y=(.5-v.y*.5)*innerHeight;
     if(Math.abs(x-gx)>1||Math.abs(y-gy)>1){gx=x;gy=y;el.style.transform='translate3d('+Math.round(x)+'px,'+Math.round(y)+'px,0)';}}}
   if(Math.abs(o-go)>.01){go=o;el.style.opacity=o.toFixed(2);}};}
