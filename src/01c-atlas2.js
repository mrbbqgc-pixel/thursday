// =====================================================================
// 01c FACADE ATLAS (part 2): sign strips + MATERIALS (ground, roads with painted lanes, parking lots, rail ballast)
// =====================================================================
// shop signs: 4 strips of 256 x 64 px (4 m x 1 m) per cell; channel letters keep their colour, the band takes the facade tint
const shopSigns=[['DONUTS','#d8412f'],['TACOS','#2f7d4f'],['LAUNDROMAT','#1d3f7a'],['VIDEO RENTALS','#6a3d8f'],['PIZZA','#b3261e'],['CLEANERS','#1d6f9a'],['MATTRESS','#1d3f7a'],['PAGERS & CELL','#d86a1f'],
  ['BURGERS','#b3261e'],['TERIYAKI','#9a2a22'],['HAIR SALON','#b03a73'],['INSURANCE','#1d3f7a'],['DENTIST','#2f8f8a'],['PET SUPPLY','#2f7d4f'],['BIKE SHOP','#d86a1f'],['TAX SERVICE','#15110c'],
  ['SHOE REPAIR','#5b4a3c'],['CHINESE FOOD','#b3261e'],['FROZEN YOGURT','#b03a73'],['BAGELS','#8a4b12'],['BOOKS','#1f5d3a'],['MUSIC & CDs','#6a3d8f'],['ONE-HOUR PHOTO','#d8412f'],['SANDWICHES','#2f7d4f'],
  ['TOYS','#1d6f9a'],['OPTOMETRIST','#1d3f7a'],['PHARMACY','#b3261e'],['SUSHI','#15110c'],['ICE CREAM','#d86a1f'],['COFFEE','#5b3a22'],['FLORIST','#b03a73'],['TUXEDO','#15110c']];
const signCell0=cellN;
for(let c=0;c<8;c++)cell('signs'+c,g=>{for(let j=0;j<4;j++){const s=shopSigns[c*4+j],y=j*64;g.fillStyle='#ece6da';g.fillRect(0,y,256,64);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,y+60,256,4);
    g.font='900 40px "Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.28)';g.fillText(s[0],130,y+36,226);g.fillStyle=s[1];g.fillText(s[0],128,y+33,226);
    const w=Math.min(226,g.measureText(s[0]).width)+12;keep(g,128-w/2,y+8,w,52);}});
function signUV(k){k%=shopSigns.length;const c=cuv(signCell0+(k>>2)),j=k&3,vh=(c[3]-c[1])/4;return[c[0],c[3]-(j+1)*vh+.0004,c[2],c[3]-j*vh-.0004];}
// text strips on solid boards (street names, monuments, small signs): made on demand, 4 per cell
const txtUV={};let txtCell=-1,txtN=4;
function strip(key,text,bg,fg,font,border){if(txtUV[key])return txtUV[key];if(txtN>=4){txtCell=cell('txt'+cellN,()=>{});txtN=0;}const j=txtN++,x=(txtCell%8)*AC_,y=Math.floor(txtCell/8)*AC_+j*64;
  ag.save();ag.beginPath();ag.rect(x,y,256,64);ag.clip();ag.fillStyle=bg;ag.fillRect(x,y,256,64);if(border){ag.strokeStyle=fg;ag.lineWidth=3;ag.strokeRect(x+4,y+4,248,56);}
  ag.fillStyle=fg;ag.font=font||'bold 32px "Arial Narrow",Arial,sans-serif';ag.textAlign='center';ag.textBaseline='middle';ag.fillText(text,x+128,y+34,236);
  ag.globalCompositeOperation='destination-out';ag.fillStyle='rgba(0,0,0,.5)';ag.fillRect(x,y,256,64);ag.restore();
  const c=cuv(txtCell),vh=(c[3]-c[1])/4;return txtUV[key]=[c[0],c[3]-(j+1)*vh+.0004,c[2],c[3]-j*vh-.0004];}
const ATLAS=new T.CanvasTexture(atlasC);ATLAS.anisotropy=MAXA;
const CI=CELL_IX;
function atlasDone(){ag.fillStyle='#fff';ag.fillRect(0,AS-24,24,24);ATLAS.needsUpdate=true;} // white texel for plain vertex-coloured geometry (see WU, WV)
atlasDone();

// ---------- materials
const seedMat=seed; // (the textures below draw their own randomness; rndSkip at the end keeps the town's stream unchanged)
// Ground textures tile every few metres. To hide the repeat, their alpha channel (unused: the ground is opaque) holds a smooth,
// tileable noise that the shader samples a second time at a much larger, rotated scale (macro): dry patches on lawns, darker
// repairs and faded stretches on asphalt, stains on concrete.
const macroC=document.createElement('canvas');macroC.width=macroC.height=128;
{const g=macroC.getContext('2d'),N=128,im=g.createImageData(N,N),oct=[[4,.5],[8,.32],[16,.18]].map(o=>{const a=[];for(let i=0;i<o[0]*o[0];i++)a.push(rnd());return[o[0],o[1],a];}),sm=t=>t*t*(3-2*t);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(const [n,wt,a] of oct){const fx=x/N*n,fy=y/N*n,i=Math.floor(fx),j=Math.floor(fy),u=sm(fx-i),q=sm(fy-j),i1=(i+1)%n,j1=(j+1)%n;
     v+=wt*lerp(lerp(a[j*n+i],a[j*n+i1],u),lerp(a[j1*n+i],a[j1*n+i1],u),q);}
   const k=(y*N+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=255;im.data[k+3]=Math.round(255*(.6+.4*clamp((v-.28)/.44,0,1)));}
 g.putImageData(im,0,0);}
function macroAlpha(g,w,h){g.save();g.globalCompositeOperation='destination-in';g.drawImage(macroC,0,0,w,h);g.restore();}
// lo..hi: colour factors at the two ends of the macro noise; sc: macro scale in texture tiles
function macroMat(m,sc,lo,hi){const v3=a=>'vec3('+a.map(x=>x.toFixed(3)).join(',')+')',key='mac'+sc+lo+hi;
  m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n\tdiffuseColor.rgb*=mix('+v3(lo)+','+v3(hi)+',clamp((texture2D(map,mat2(.8,-.6,.6,.8)*vUv*'+sc.toFixed(4)+'+vec2(.37,.71)).a-.6)*2.5,0.,1.));\n\tdiffuseColor.a=1.0;');};
  m.customProgramCacheKey=()=>key;return m;}
// soft blob that wraps round the tile edges
function wblob(g,w,h,x,y,rx,ry,a,fill){for(const ox of [-w,0,w])for(const oy of [-h,0,h]){if(x+ox+rx<0||x+ox-rx>w||y+oy+ry<0||y+oy-ry>h)continue;
  g.fillStyle=fill;g.globalAlpha=a;g.beginPath();g.ellipse(x+ox,y+oy,rx,ry,0,0,7);g.fill();}g.globalAlpha=1;}
const rgbStr=c=>'rgb('+c[0]+','+c[1]+','+c[2]+')';
function ground(col,n,a,extra,sz,mac){sz=sz||128;return L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,
  map:tex(sz,sz,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);noise(g,w,h,n,a);if(extra)extra(g,w,h);if(mac)macroAlpha(g,w,h);},true)});}
const ruts=v=>(g,w,h)=>{g.strokeStyle='rgba(90,65,35,.13)';g.lineWidth=7;for(const q of [78,178]){g.beginPath();if(v){g.moveTo(q,0);g.lineTo(q,h);}else{g.moveTo(0,q);g.lineTo(w,q);}g.stroke();}
  for(let k=0;k<40;k++){g.fillStyle='rgba(110,85,50,'+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(.6,2.2),0,7);g.fill();}};
// lawn: a slightly dry Southern California green; darker lush clumps, straw-coloured dry spots, blades as short streaks
function turfPaint(g,w,h,base,pats,blades){g.fillStyle=base;g.fillRect(0,0,w,h);
  for(let k=0;k<26;k++){const p=pick(pats);wblob(g,w,h,rnd()*w,rnd()*h,rr(14,48),rr(10,36),rr(.08,.16),rgbStr(p));}
  for(let k=0;k<70;k++){const p=pick(pats);wblob(g,w,h,rnd()*w,rnd()*h,rr(3,10),rr(2,8),rr(.12,.3),rgbStr(p));}
  for(let k=0;k<blades;k++){const p=pick(pats),x=rnd()*w,y=rnd()*h;g.fillStyle='rgba('+p[0]+','+p[1]+','+p[2]+','+rr(.18,.45).toFixed(2)+')';g.fillRect(x,y,1,rr(2,4));}
  noise(g,w,h,1600,.07);}
// asphalt base shared by every road texture: sun-faded grey, aggregate, darker patch repairs, crack-seal "tar snakes"
const asphC=document.createElement('canvas');asphC.width=asphC.height=512;
{const g=asphC.getContext('2d');g.fillStyle='#6b6863';g.fillRect(0,0,512,512);noise(g,512,512,16000,.11);
 for(let k=0;k<4;k++){const x=rnd()*512,y=rnd()*512,pw=rr(40,110),ph=rr(30,80);for(const ox of [-512,0,512])for(const oy of [-512,0,512]){g.fillStyle='rgba(58,56,52,.13)';g.fillRect(x+ox,y+oy,pw,ph);
   g.strokeStyle='rgba(40,38,35,.12)';g.lineWidth=1;g.strokeRect(x+ox,y+oy,pw,ph);}}
 for(let k=0;k<26;k++){const x=rnd()*512,y=rnd()*512,r=rr(20,60);for(const ox of [-512,0,512])for(const oy of [-512,0,512]){const gr=g.createRadialGradient(x+ox,y+oy,1,x+ox,y+oy,r);
   const lt=rnd()<.5;gr.addColorStop(0,lt?'rgba(150,145,136,.12)':'rgba(40,38,35,.14)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x+ox-r,y+oy-r,2*r,2*r);}}
 for(let k=0;k<9;k++){g.strokeStyle='rgba(32,30,28,'+rr(.14,.26).toFixed(2)+')';g.lineWidth=rr(1,1.8);g.lineJoin='round';g.beginPath();let x=rnd()*512,y=rnd()*512;g.moveTo(x,y);
   const hz=rnd()<.5;for(let s=0;s<9;s++){x+=hz?rr(8,26):rr(-10,10);y+=hz?rr(-10,10):rr(8,26);g.lineTo(x,y);}g.stroke();}
 noise(g,512,512,3000,.05);}
// a road texture: across the road u = 0..1 over W metres, along it one tile is W metres; marks = [centre m, width m, colour, dashes per tile (0 = solid)]
function roadMat(W,marks,wear){return macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);const k=512/W;
  if(wear)for(const c of wear){const gr=g.createLinearGradient((c-1.2)*k,0,(c+1.2)*k,0);gr.addColorStop(0,'rgba(20,18,16,0)');gr.addColorStop(.5,'rgba(20,18,16,.24)');gr.addColorStop(1,'rgba(20,18,16,0)');g.fillStyle=gr;g.fillRect((c-1.2)*k,0,2.4*k,h);}
  for(const m of marks){g.fillStyle=m[2];const x=(m[0]-m[1]/2)*k,ww=Math.max(2,m[1]*k);if(!m[3])g.fillRect(x,0,ww,h);else{const cy=h/m[3];for(let q=0;q<m[3];q++)g.fillRect(x,q*cy,ww,cy*.3);}}
  noise(g,512,512,2500,.07);macroAlpha(g,w,h);},true)}),W>20?.09:.16,[.84,.84,.85],[1.08,1.07,1.05]);}
const WH='#dedbd0',YE='#d9b146';
const M={
  sand:L({map:tex(256,256,(g,w,h)=>{g.fillStyle='#ab9f78';g.fillRect(0,0,w,h);noise(g,w,h,4000,.1);
    for(let k=0;k<70;k++){g.fillStyle='rgba('+(rnd()<.5?'110,100,55':'150,120,80')+','+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(1,4),0,7);g.fill();}
    for(let k=0;k<14;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(14,40),rr(6,16),.12,'rgb(225,205,160)');},true)}),
  pad:macroMat(ground('#bcb8ae',1500,.06,(g,w,h)=>{for(let k=0;k<6;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(8,24),rr(6,18),.08,'rgb(90,84,74)');},128,true),.11,[.9,.9,.91],[1.04,1.03,1.02]),
  walk:macroMat(ground('#c1bbae',1400,.06,(g,w,h)=>{for(let k=0;k<10;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(8,30),rr(6,20),.07,rnd()<.6?'rgb(95,88,76)':'rgb(240,235,225)');
    g.strokeStyle='rgba(70,65,55,.32)';g.lineWidth=1.5;for(let k=0;k<=w;k+=64){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let k=0;k<3;k++){g.strokeStyle='rgba(50,45,38,.25)';g.lineWidth=1;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let s=0;s<4;s++){x+=rr(-20,20);y+=rr(-20,20);g.lineTo(x,y);}g.stroke();}},256,true),.1,[.9,.9,.9],[1.03,1.03,1.02]),
  asphalt:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);macroAlpha(g,w,h);},true)}),.12,[.84,.84,.85],[1.08,1.07,1.05]),
  dirt:ground('#b39770',4000,.09,ruts(true),256),dirtX:ground('#b39770',4000,.09,ruts(false),256),
  court:ground('#6f8f88',500,.06),plaza:ground('#cdb39d',1300,.07,(g,w,h)=>{g.strokeStyle='rgba(120,80,60,.3)';g.lineWidth=1.5;for(let k=0;k<=w;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2){g.fillStyle='rgba(150,95,70,.13)';g.fillRect(i*32,j*32,32,32);}}),
  grass:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{turfPaint(g,w,h,'#6c7b49',[[86,104,60],[96,114,64],[74,92,54],[138,134,88],[124,126,80],[110,118,70]],5200);macroAlpha(g,w,h);},true)}),
    .14,[.92,1.0,.9],[1.2,1.06,.74]),
  dry:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{turfPaint(g,w,h,'#9e9568',[[128,118,76],[150,138,94],[110,108,66],[170,156,112],[96,100,60]],4200);macroAlpha(g,w,h);},true)}),
    .14,[.92,.94,.9],[1.08,1.04,.96]),
  infield:ground('#b98a5a',700,.08),conc:macroMat(ground('#bab5aa',1500,.06,(g,w,h)=>{for(let k=0;k<8;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(10,40),rr(8,30),.07,'rgb(90,84,74)');
    g.strokeStyle='rgba(70,65,55,.25)';g.lineWidth=1;for(let k=0;k<=w;k+=128){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},256,true),.1,[.9,.9,.9],[1.04,1.03,1.02]),
  line:L({color:0xe2b93b,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
  lineW:L({color:0xe9e6dc,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
  field:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(64,64,(g,w,h)=>{g.fillStyle='#a88a5c';g.fillRect(0,0,w,h);g.fillStyle='#55753a';for(let x=0;x<w;x+=16)g.fillRect(x+3,0,9,h);noise(g,w,h,240,.08);},true)}),
  fallow:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(64,64,(g,w,h)=>{g.fillStyle='#a98556';g.fillRect(0,0,w,h);g.fillStyle='#96744a';for(let x=0;x<w;x+=8)g.fillRect(x,0,3,h);noise(g,w,h,240,.08);},true)}),
  // roads: 6 lanes and a median (Foothill, Haven), 4 lanes and a median, 4 lanes and a centre turn lane, 4 lanes undivided, 2-lane collector, freeway deck
  road6:roadMat(30,[[11.9,.15,YE],[18.1,.15,YE],[8.4,.15,WH,3],[4.8,.15,WH,3],[21.6,.15,WH,3],[25.2,.15,WH,3],[1.3,.15,WH],[28.7,.15,WH]],[3,6.6,10.2,19.8,23.4,27]),
  road4m:roadMat(26,[[10.4,.15,YE],[15.6,.15,YE],[6.9,.15,WH,2],[19.1,.15,WH,2],[3.2,.15,WH],[22.8,.15,WH]],[5,8.7,17.3,21]),
  road4c:roadMat(22,[[9.2,.12,YE],[9.5,.12,YE,4],[12.5,.12,YE,4],[12.8,.12,YE],[5.6,.15,WH,2],[16.4,.15,WH,2],[2,.15,WH],[20,.15,WH]],[3.8,7.4,14.6,18.2]),
  road4u:roadMat(16,[[7.85,.12,YE],[8.15,.12,YE],[4,.14,WH,1],[12,.14,WH,1]],[2,6,10,14]),
  road2:roadMat(11,[[5.35,.1,YE],[5.65,.1,YE]],[2.8,8.2]),
  fwy:roadMat(40,[[3,.2,YE],[37,.2,WH],[6.7,.15,WH,4],[10.4,.15,WH,4],[14,.15,WH,4],[26,.15,WH,4],[29.6,.15,WH,4],[33.3,.15,WH,4],[17.6,.2,YE],[22.4,.2,WH]],[5,8.5,12,15.6,24.4,28,31.5,35]),
  // parking: one tile = 4 stalls (11 m) across by a double row with its aisle (18.6 m)
  lot:macroMat(L({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(256,512,(g,w,h)=>{g.drawImage(asphC,0,0,256,512,0,0,256,512);const ku=256/11,kv=512/18.6;g.fillStyle='#dcd9cf';
    for(const r of [[0,5.5],[13.1,18.6]])for(let s=0;s<4;s++)g.fillRect(s*2.75*ku-1,r[0]*kv,3,(r[1]-r[0])*kv);g.fillRect(0,0,w,2);g.fillRect(0,h-2,w,2);
    for(let s=0;s<4;s++)for(const r of [2.6,15.9]){g.fillStyle='rgba(20,18,16,'+rr(.16,.32).toFixed(2)+')';g.beginPath();g.ellipse((s+.5)*2.75*ku+rr(-4,4),r*kv+rr(-6,6),rr(8,12),rr(12,20),0,0,7);g.fill();}macroAlpha(g,w,h);},true)}),.13,[.86,.86,.87],[1.07,1.06,1.04]),
  // rail ballast with ties under two tracks (5 m apart), 12 m across
  ballast:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{g.fillStyle='#8f877b';g.fillRect(0,0,w,h);noise(g,w,h,9000,.16);const k=256/12;
    for(const c of [3.5,8.5])for(let y=0;y<h;y+=12.8){g.fillStyle='rgba(70,52,36,.95)';g.fillRect((c-1.35)*k,y,2.7*k,5.4);g.fillStyle='rgba(0,0,0,.25)';g.fillRect((c-1.35)*k,y+5.4,2.7*k,1.5);}
    for(const c of [3.5,8.5])for(const s of [-.72,.72]){g.fillStyle='rgba(40,30,22,.45)';g.fillRect((c+s)*k-3,0,6,h);}},true)}),
  // dynamic objects
  white:L({color:0xf4f0e7}),dark:L({color:0x2b2621}),metal:L({color:0xb3b9bb}),wood:L({color:0x6b5138}),concrete:L({color:0xa9a59c}),red:L({color:0xb3261e}),green:L({color:0x2f7d4f}),
  blue:L({color:0x1d3f7a}),yellow:L({color:0xe2b93b}),bronze:L({color:0x7c6238}),olive:L({color:0x5b6140})};
// overlays that lie on top of another ground surface get a stronger depth offset than the surface below
for(const k of ['walk','asphalt','grass','conc','dry','plaza','dirt'])
  {const m=M[k].clone();m.polygonOffsetFactor=m.polygonOffsetUnits=-2;m.onBeforeCompile=M[k].onBeforeCompile;m.customProgramCacheKey=M[k].customProgramCacheKey;M[k+'O']=m;}
for(const k of ['court','infield'])M[k].polygonOffsetFactor=M[k].polygonOffsetUnits=-2;
// chunked, vertex-coloured materials
// Ambient occlusion at the foot of everything that stands on the ground: vertical faces darken over their lowest metre
// (mostly the skylight, a little of the sun), which grounds walls, curbs, posts and trunks. Costs one varying and a smoothstep.
M.wall=L({map:ATLAS,vertexColors:true});
M.wall.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <fog_pars_vertex>','#include <fog_pars_vertex>\nvarying vec2 vAO;')
    .replace('#include <fog_vertex>','#include <fog_vertex>\n\tvAO=vec2((modelMatrix*vec4(transformed,1.0)).y,1.0-abs(objectNormal.y));');
  s.fragmentShader=s.fragmentShader.replace('#include <fog_pars_fragment>','#include <fog_pars_fragment>\nvarying vec2 vAO;')
    .replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(texture2D(map,vUv));float tintK=clamp(texelColor.a*2.0-1.0,0.0,1.0);diffuseColor.rgb*=texelColor.rgb;')
    .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vec3(1.0),vColor,tintK);')
    .replace('#include <aomap_fragment>','float aoK=1.0-.55*vAO.y*(1.0-smoothstep(0.0,1.2,vAO.x));reflectedLight.indirectDiffuse*=aoK;reflectedLight.directDiffuse*=mix(1.0,aoK,.6);');};
M.flat=L({vertexColors:true});M.flat.userData.alias=M.wall;
M.paint=new T.MeshPhongMaterial({vertexColors:true,shininess:55,specular:0x4a4a4a});
// soft contact shadows: left half of the texture is a round blob, right half a strip that is dark along v=0
M.shade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:tex(128,64,(g,w,h)=>{
  const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(20,14,8,.5)');gr.addColorStop(.55,'rgba(20,14,8,.3)');gr.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const g2=g.createLinearGradient(0,64,0,0);g2.addColorStop(0,'rgba(20,14,8,.42)');g2.addColorStop(.35,'rgba(20,14,8,.16)');g2.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=g2;g.fillRect(66,0,60,64);})});
rndSkip(seedMat,309622);
for(const k of ['wall','flat','paint','shade']){M[k].userData.chunk=1;M[k].userData.cast=k!=='shade';}
const C={white:0xf4f0e7,dark:0x2b2621,metal:0xb3b9bb,steel:0x8c9396,wood:0x6b5138,concrete:0xa9a59c,red:0xb3261e,green:0x2f7d4f,blue:0x1d3f7a,yellow:0xe2b93b,bronze:0x7c6238,olive:0x5b6140,
  stone:0xcfc6b4,curb:0xbdb7aa,glass:0x1c2830,tire:0x1d1c1b,rust:0x8a5a3c,roofs:[0xbcb09e,0xc9c0ae,0xd9d2c4,0xa7826a,0xb9a58c],tile:0xb5583a,lamina:0xa9b0b1,
  blockWall:0xd2c4aa,greyWall:0xbfb8aa};
// house stucco (beige, tan, peach, white) and concrete roof tile colours of a 1990s tract
const wallCols=[0xeee3cb,0xe6d4b2,0xead2b4,0xf3ece0,0xdcc8a6,0xe9d9c1,0xd8c39f,0xf1e7d4,0xe8c6a4,0xdcbf98,0xe3d7bf,0xefdcc0,0xd6c7ae,0xeadfcc];
const roofCols=[0xb5583a,0xa14a33,0x9c5a40,0x8a5a46,0xb86a48,0x7e5c4c,0xa86650,0x94786a,0xb0533c,0x8c4a38];
