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
function ground(col,n,a,extra,sz){sz=sz||128;return L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,
  map:tex(sz,sz,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);noise(g,w,h,n,a);if(extra)extra(g,w,h);},true)});}
const ruts=v=>(g,w,h)=>{g.strokeStyle='rgba(90,65,35,.13)';g.lineWidth=7;for(const q of [78,178]){g.beginPath();if(v){g.moveTo(q,0);g.lineTo(q,h);}else{g.moveTo(0,q);g.lineTo(w,q);}g.stroke();}
  for(let k=0;k<40;k++){g.fillStyle='rgba(110,85,50,'+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(.6,2.2),0,7);g.fill();}};
// asphalt base shared by every road texture
const asphC=document.createElement('canvas');asphC.width=asphC.height=512;
{const g=asphC.getContext('2d');g.fillStyle='#4f4c48';g.fillRect(0,0,512,512);noise(g,512,512,9000,.1);
 for(let k=0;k<10;k++){g.strokeStyle='rgba(20,18,16,.16)';g.lineWidth=1;g.beginPath();let x=rnd()*512,y=rnd()*512;g.moveTo(x,y);for(let s=0;s<5;s++){x+=rr(-14,14);y+=rr(-14,14);g.lineTo(x,y);}g.stroke();}
 for(let k=0;k<8;k++){g.fillStyle='rgba(120,112,100,.1)';g.fillRect(rnd()*512,rnd()*512,rr(20,70),rr(14,50));}}
// a road texture: across the road u = 0..1 over W metres, along it one tile is W metres; marks = [centre m, width m, colour, dashes per tile (0 = solid)]
function roadMat(W,marks,wear){return L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);const k=512/W;
  if(wear)for(const c of wear){const gr=g.createLinearGradient((c-1.2)*k,0,(c+1.2)*k,0);gr.addColorStop(0,'rgba(20,18,16,0)');gr.addColorStop(.5,'rgba(20,18,16,.22)');gr.addColorStop(1,'rgba(20,18,16,0)');g.fillStyle=gr;g.fillRect((c-1.2)*k,0,2.4*k,h);}
  for(const m of marks){g.fillStyle=m[2];const x=(m[0]-m[1]/2)*k,ww=Math.max(2,m[1]*k);if(!m[3])g.fillRect(x,0,ww,h);else{const cy=h/m[3];for(let q=0;q<m[3];q++)g.fillRect(x,q*cy,ww,cy*.3);}}
  noise(g,512,512,1500,.06);},true)});}
const WH='#e9e6dc',YE='#e2b93b';
const M={
  sand:L({map:tex(256,256,(g,w,h)=>{g.fillStyle='#ab9f78';g.fillRect(0,0,w,h);noise(g,w,h,4000,.1);
    for(let k=0;k<70;k++){g.fillStyle='rgba('+(rnd()<.5?'110,100,55':'150,120,80')+','+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(1,4),0,7);g.fill();}
    for(let k=0;k<14;k++){g.fillStyle='rgba(225,205,160,.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(14,40),rr(6,16),rnd()*3,0,7);g.fill();}},true)}),
  pad:ground('#c4c1b9',1500,.06,null,128),
  walk:ground('#c9c4b8',1400,.06,(g,w,h)=>{g.strokeStyle='rgba(70,65,55,.32)';g.lineWidth=1.5;for(let k=0;k<=w;k+=64){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let k=0;k<3;k++){g.strokeStyle='rgba(50,45,38,.25)';g.lineWidth=1;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let s=0;s<4;s++){x+=rr(-20,20);y+=rr(-20,20);g.lineTo(x,y);}g.stroke();}},256),
  asphalt:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:(()=>{const t=new T.CanvasTexture(asphC);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=MAXA;return t;})()}),
  dirt:ground('#bf9f6c',4000,.09,ruts(true),256),dirtX:ground('#bf9f6c',4000,.09,ruts(false),256),
  court:ground('#6f8f88',500,.06),plaza:ground('#d2b49a',1300,.07,(g,w,h)=>{g.strokeStyle='rgba(120,80,60,.3)';g.lineWidth=1.5;for(let k=0;k<=w;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2){g.fillStyle='rgba(150,95,70,.15)';g.fillRect(i*32,j*32,32,32);}}),
  grass:ground('#6c9a48',2400,.1,(g,w,h)=>{for(let k=0;k<30;k++){g.fillStyle='rgba('+(rnd()<.5?'40,80,30':'150,170,80')+',.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(8,30),rr(6,20),rnd()*3,0,7);g.fill();}},256),
  dry:ground('#a99f6c',2600,.1,(g,w,h)=>{for(let k=0;k<40;k++){g.fillStyle='rgba('+(rnd()<.5?'120,110,60':'190,170,120')+',.16)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(6,26),rr(4,14),rnd()*3,0,7);g.fill();}},256),
  infield:ground('#b98a5a',700,.08),conc:ground('#c2bdb2',1500,.06,(g,w,h)=>{g.strokeStyle='rgba(70,65,55,.25)';g.lineWidth=1;for(let k=0;k<=w;k+=128){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},256),
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
  lot:L({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(256,512,(g,w,h)=>{g.drawImage(asphC,0,0,256,512,0,0,256,512);const ku=256/11,kv=512/18.6;g.fillStyle='#e6e3da';
    for(const r of [[0,5.5],[13.1,18.6]])for(let s=0;s<4;s++)g.fillRect(s*2.75*ku-1,r[0]*kv,3,(r[1]-r[0])*kv);g.fillRect(0,0,w,2);g.fillRect(0,h-2,w,2);
    for(let s=0;s<4;s++)for(const r of [2.6,15.9]){g.fillStyle='rgba(20,18,16,.25)';g.beginPath();g.ellipse((s+.5)*2.75*ku,r*kv,10,16,0,0,7);g.fill();}},true)}),
  // rail ballast with ties under two tracks (5 m apart), 12 m across
  ballast:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{g.fillStyle='#8f877b';g.fillRect(0,0,w,h);noise(g,w,h,9000,.16);const k=256/12;
    for(const c of [3.5,8.5])for(let y=0;y<h;y+=12.8){g.fillStyle='rgba(70,52,36,.95)';g.fillRect((c-1.35)*k,y,2.7*k,5.4);g.fillStyle='rgba(0,0,0,.25)';g.fillRect((c-1.35)*k,y+5.4,2.7*k,1.5);}
    for(const c of [3.5,8.5])for(const s of [-.72,.72]){g.fillStyle='rgba(40,30,22,.45)';g.fillRect((c+s)*k-3,0,6,h);}},true)}),
  // dynamic objects
  white:L({color:0xf4f0e7}),dark:L({color:0x2b2621}),metal:L({color:0xb3b9bb}),wood:L({color:0x6b5138}),concrete:L({color:0xa9a59c}),red:L({color:0xb3261e}),green:L({color:0x2f7d4f}),
  blue:L({color:0x1d3f7a}),yellow:L({color:0xe2b93b}),bronze:L({color:0x7c6238}),olive:L({color:0x5b6140})};
// overlays that lie on top of another ground surface get a stronger depth offset than the surface below
for(const k of ['walk','asphalt','grass','conc','dry','plaza','dirt'])
  {const m=M[k].clone();m.polygonOffsetFactor=m.polygonOffsetUnits=-2;M[k+'O']=m;}
for(const k of ['court','infield'])M[k].polygonOffsetFactor=M[k].polygonOffsetUnits=-2;
// chunked, vertex-coloured materials
M.wall=L({map:ATLAS,vertexColors:true});
M.wall.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv);float tintK=clamp(texelColor.a*2.0-1.0,0.0,1.0);diffuseColor.rgb*=texelColor.rgb;')
  .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vec3(1.0),vColor,tintK);');};
M.flat=L({vertexColors:true});M.flat.userData.alias=M.wall;
M.paint=new T.MeshPhongMaterial({vertexColors:true,shininess:55,specular:0x4a4a4a});
// soft contact shadows: left half of the texture is a round blob, right half a strip that is dark along v=0
M.shade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:tex(128,64,(g,w,h)=>{
  const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(20,14,8,.5)');gr.addColorStop(.55,'rgba(20,14,8,.3)');gr.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const g2=g.createLinearGradient(0,64,0,0);g2.addColorStop(0,'rgba(20,14,8,.42)');g2.addColorStop(.35,'rgba(20,14,8,.16)');g2.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=g2;g.fillRect(66,0,60,64);})});
for(const k of ['wall','flat','paint','shade']){M[k].userData.chunk=1;M[k].userData.cast=k!=='shade';}
const C={white:0xf4f0e7,dark:0x2b2621,metal:0xb3b9bb,steel:0x8c9396,wood:0x6b5138,concrete:0xa9a59c,red:0xb3261e,green:0x2f7d4f,blue:0x1d3f7a,yellow:0xe2b93b,bronze:0x7c6238,olive:0x5b6140,
  stone:0xcfc6b4,curb:0xbdb7aa,glass:0x1c2830,tire:0x1d1c1b,rust:0x8a5a3c,roofs:[0xbcb09e,0xc9c0ae,0xd9d2c4,0xa7826a,0xb9a58c],tile:0xb5583a,lamina:0xa9b0b1,
  blockWall:0xd2c4aa,greyWall:0xbfb8aa};
// house stucco (beige, tan, peach, white) and concrete roof tile colours of a 1990s tract
const wallCols=[0xeee3cb,0xe6d4b2,0xead2b4,0xf3ece0,0xdcc8a6,0xe9d9c1,0xd8c39f,0xf1e7d4,0xe8c6a4,0xdcbf98,0xe3d7bf,0xefdcc0,0xd6c7ae,0xeadfcc];
const roofCols=[0xb5583a,0xa14a33,0x9c5a40,0x8a5a46,0xb86a48,0x7e5c4c,0xa86650,0x94786a,0xb0533c,0x8c4a38];
