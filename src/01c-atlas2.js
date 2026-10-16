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
// random numbers for the dressing pass come from a side stream, so the layout of the town stays as it was
// colliders made inside are tagged 'dress', and the layout's own room checks (roomFor) do not see them
function isoR(fn){const s0=seed,c0=colliders.length;seed=(Math.imul(s0^0x5bd1e995,0x9e3779b1)^0x27d4eb2f)>>>0;try{return fn();}finally{seed=s0;for(let k=c0;k<colliders.length;k++)colliders[k].dress=1;}}
// ---- lived-in tract and strip-mall pieces (dressing pass): bronze sliders, shutters, arched entries, windowed and open garages,
// stone wainscot, weathered stucco, dark gable trim, flat concrete tile, back-of-strip grime, and a cell of small decals (see DUV)
isoR(()=>{
function bronzeWin(g,x,y,w,h,n){g.fillStyle='#f4efe4';g.fillRect(x-9,y-8,w+18,h+20);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-9,y+h+9,w+18,3);
  g.fillStyle='#4a3a2c';g.fillRect(x-3,y-3,w+6,h+6);glass(g,x,y,w,h,true);g.fillStyle='#4a3a2c';for(let k=1;k<n;k++)g.fillRect(x+k*w/n-2,y,4,h);
  g.fillStyle=pick(['rgba(225,210,185,.4)','rgba(200,180,150,.35)','rgba(240,235,225,.3)']);g.fillRect(x+3,y+3,w/n*.5,h-6);keep(g,x-3,y-3,w+6,h+6);}
cell('hwinB',g=>{stucco(g);bronzeWin(g,82,118,92,76,2);});
cell('hwinBW',g=>{stucco(g);bronzeWin(g,44,120,168,74,3);});
cell('hwinS',g=>{stucco(g);hwin(g,86,118,84,78);for(const x of [52,174]){g.fillStyle='#2c3a32';g.fillRect(x,111,30,94);g.fillStyle='rgba(0,0,0,.35)';for(let y=116;y<200;y+=6)g.fillRect(x+3,y,24,2);
  g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+3,111,2,94);keep(g,x,111,30,94);}});
cell('hdoorA',g=>{stucco(g);g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.moveTo(54,256);g.lineTo(54,104);g.ellipse(128,104,74,62,0,PI,0);g.lineTo(202,256);g.fill();
  const gr=g.createLinearGradient(0,50,0,256);gr.addColorStop(0,'#2a2018');gr.addColorStop(1,'#4c3d2f');g.fillStyle=gr;g.beginPath();g.moveTo(66,256);g.lineTo(66,108);g.ellipse(128,108,62,52,0,PI,0);g.lineTo(190,256);g.fill();
  g.fillStyle='#7a4a2a';g.fillRect(100,126,56,130);g.strokeStyle='rgba(20,12,6,.55)';g.lineWidth=2;for(const y of [134,174,214])g.strokeRect(106,y,44,34);g.fillStyle='#c8b06a';g.fillRect(146,192,4,10);
  g.strokeStyle='#1c1a18';g.lineWidth=2.5;for(let x=72;x<186;x+=9){g.beginPath();g.moveTo(x,256);g.lineTo(x,Math.max(70,108-Math.sqrt(Math.max(0,62*62-(x-128)*(x-128)))*52/62+4));g.stroke();}
  g.fillStyle='#1c1a18';g.fillRect(66,150,124,3);g.fillStyle='#3a2f25';g.fillRect(208,120,10,18);g.fillStyle='#f6e6b8';g.fillRect(210,124,6,10);keep(g,52,40,170,216);});
// garage doors drawn like 'garage' (6.4 m face, 40 px/m across); the white door has a row of small windows across the top section
function garageBase(g,col,rowFn){const x=30,y=118,w=196,h=138;g.fillStyle='#f3eee2';g.fillRect(x-8,y-9,w+16,h+9);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,w,5);
  g.fillStyle=col;g.fillRect(x,y+5,w,h-5);for(let r=0;r<4;r++){const py=y+5+r*33.25;g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,py+31,w,2);rowFn(r,x,py,w);}
  g.fillStyle='rgba(110,90,60,.2)';g.fillRect(x,y+h-10,w,10);keep(g,x-8,y-9,w+16,h+9);}
cell('garageW',g=>{stucco(g);garageBase(g,'#f1eee6',(r,x,py,w)=>{for(let k=0;k<8;k++){const px=x+5+k*23.9;if(r===0){g.fillStyle='#26343d';g.fillRect(px+3,py+9,14,12);g.fillStyle='rgba(205,225,235,.25)';g.fillRect(px+3,py+9,6,12);
      g.fillStyle='#f1eee6';g.fillRect(px+9,py+9,2,12);}else{g.fillStyle='rgba(255,255,255,.5)';g.fillRect(px,py+5,20,2);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(px,py+22,20,2);g.fillRect(px+18,py+5,2,19);}}});});
cell('garageO',g=>{stucco(g);const x=30,y=118,w=196,h=138;g.fillStyle='#f3eee2';g.fillRect(x-8,y-9,w+16,h+9);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#1b1714');gr.addColorStop(1,'#3a332c');g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.fillStyle='#e9e5da';g.fillRect(x,y,w,16);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y+16,w,3);g.fillStyle='#6b5a46';g.fillRect(x+8,y+40,70,4);g.fillRect(x+8,y+74,70,4);
  for(let k=0;k<9;k++){g.fillStyle=pick(['#b48a5a','#a07850','#c9a36a','#d8412f','#1d6f9a','#e9e5da']);g.fillRect(x+10+(k%5)*13,y+(k<5?24:58),11,16);}
  g.fillStyle='#d9d6cc';g.fillRect(x+150,y+36,30,98);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+150,y+76,30,2);g.fillRect(x+174,y+46,2,22);
  g.fillStyle='#2b4a6a';g.fillRect(x+96,y+96,40,42);g.fillStyle='#8c8f8f';g.fillRect(x+94,y+92,44,6);g.fillStyle='#2b2621';g.beginPath();g.arc(x+110,y+128,9,0,7);g.fill();keep(g,x-8,y-9,w+16,h+9);});
cell('stoneW',g=>{stucco(g);const y0=196;g.fillStyle='#bdb2a0';g.fillRect(0,y0,256,60);for(let r=0;r<5;r++)for(let x=-rr(0,20);x<256;){const w=rr(16,34),hh=rr(9,13);
    g.fillStyle=pick(['#cdbfa8','#b9a990','#d8ccb6','#a8987e','#c4b49a','#9a8c76']);g.beginPath();g.ellipse(x+w/2,y0+5+r*11.4+rr(-1,1),w/2-1,hh/2,0,0,7);g.fill();x+=w;}
  noise(g,256,60,500,.08,0,y0);g.fillStyle='#d9d2c4';g.fillRect(0,y0-6,256,7);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,y0+1,256,2);keep(g,0,y0-6,256,62);});
cell('stuccoP',g=>{stucco(g);for(let k=0;k<5;k++){const x=rr(0,240),gr=g.createLinearGradient(0,rr(0,60),0,256);gr.addColorStop(0,'rgba(70,55,40,0)');gr.addColorStop(.5,'rgba(70,55,40,.1)');gr.addColorStop(1,'rgba(70,55,40,.2)');g.fillStyle=gr;g.fillRect(x,0,rr(14,40),256);}
  g.strokeStyle='rgba(50,40,30,.32)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();let x=rr(20,236),y=rr(10,120);g.moveTo(x,y);for(let s=0;s<6;s++){x+=rr(-9,9);y+=rr(6,16);g.lineTo(x,y);}g.stroke();}
  for(let k=0;k<5;k++){const x=rr(10,230),y=rr(20,220);g.fillStyle='rgba(255,252,245,.32)';g.beginPath();g.ellipse(x,y,rr(6,18),rr(4,10),rnd()*3,0,7);g.fill();}
  for(let k=0;k<3;k++){const x=rr(20,220),y=rr(150,230),w=rr(8,22),h=rr(5,12);g.fillStyle='#cfc8ba';g.fillRect(x,y,w,h);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y+h,w,1.5);keep(g,x,y,w,h);}
  const gr=g.createLinearGradient(0,200,0,256);gr.addColorStop(0,'rgba(80,62,45,0)');gr.addColorStop(1,'rgba(80,62,45,.3)');g.fillStyle=gr;g.fillRect(0,200,256,56);});
cell('trimT',g=>{stucco(g);g.fillStyle='#3a2e26';const bd=[[70,0,9,256],[182,0,9,256],[0,238,256,10],[79,150,103,8]];for(const q of bd)g.fillRect(q[0],q[1],q[2],q[3]);
  g.fillStyle='#2b2621';g.fillRect(110,92,36,40);g.fillStyle='rgba(255,255,255,.12)';for(let y=96;y<130;y+=6)g.fillRect(112,y,32,2);for(const q of bd)keep(g,q[0],q[1],q[2],q[3]);keep(g,110,92,36,40);});
cell('tileF',g=>{g.fillStyle='#cfcfcf';g.fillRect(0,0,256,256);const ch=14.2,cw=32;for(let r=0;r<18;r++){const y=r*ch;for(let k=-1;k<9;k++){const x=k*cw+(r%2)*cw/2,c=Math.round(196*rr(.86,1.1));
    g.fillStyle='rgb('+c+','+c+','+c+')';g.fillRect(x+1,y,cw-2,ch);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+cw-2,y,2,ch);}g.fillStyle='rgba(0,0,0,.34)';g.fillRect(0,y+ch-3,256,3);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,y,256,2);}
  noise(g,256,256,900,.08);});
cell('grime',g=>{stucco(g,null,40);for(let k=0;k<6;k++){const x=rr(0,246),gr=g.createLinearGradient(0,0,0,rr(90,220));gr.addColorStop(0,'rgba(60,45,30,.35)');gr.addColorStop(1,'rgba(60,45,30,0)');g.fillStyle=gr;g.fillRect(x,0,rr(3,10),256);}
  for(let k=0;k<26;k++){g.fillStyle='rgba(40,32,24,'+rr(.08,.22).toFixed(2)+')';g.beginPath();g.ellipse(rr(0,256),rr(222,256),rr(4,16),rr(2,7),0,0,7);g.fill();}
  g.fillStyle='rgba(30,25,20,.35)';g.fillRect(0,244,256,12);g.fillStyle='#9a9d9b';g.fillRect(150,120,30,42);g.fillStyle='#6f7270';g.fillRect(154,126,22,14);g.fillStyle='#e8e4d8';g.beginPath();g.arc(165,150,6,0,7);g.fill();
  g.fillStyle='#55595a';g.fillRect(60,40,40,22);g.fillStyle='rgba(0,0,0,.4)';for(let y=43;y<60;y+=4)g.fillRect(62,y,36,2);keep(g,150,120,30,42);keep(g,60,40,40,22);});
cell('decals',g=>{const T0=(t,x,y,fs,col,w,f)=>{g.fillStyle=col;g.font=(f||'900 ')+fs+'px "Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y,w);};
  const board=(x,y,w,h,bg,bd)=>{g.fillStyle=bg;g.fillRect(x,y,w,h);if(bd){g.strokeStyle=bd;g.lineWidth=3;g.strokeRect(x+3,y+3,w-6,h-6);}};
  // row 0: FOR SALE yard sign (no names or numbers), NOW OPEN and SALE banners
  board(2,2,92,60,'#f6f2e8','#b3261e');T0('FOR',48,18,18,'#1d3f7a',80);T0('SALE',48,40,26,'#b3261e',84);g.fillStyle='#1d3f7a';g.fillRect(18,52,60,3);
  board(96,2,158,28,'#b3261e');T0('NOW OPEN',175,17,22,'#f6f2e8',150);board(96,34,158,28,'#f1d000');T0('SALE',175,49,24,'#b3261e',150);
  // row 1: GRAND OPENING, FOR LEASE, a bus-bench advert, ICE
  board(2,66,124,28,'#e2b93b');T0('GRAND OPENING',64,81,19,'#b3261e',118);board(130,66,124,28,'#f6f2e8','#1d3f7a');T0('FOR LEASE',192,81,19,'#1d3f7a',116);
  board(2,98,124,28,'#2f6a3a');T0('AUTO INSURANCE · LOW RATES',64,113,13,'#f6f2e8',118,'bold ');board(130,98,60,28,'#f6f2e8','#3d9ad0');T0('ICE',160,113,20,'#3d9ad0',52);
  board(194,98,60,28,'#2f6a3a');T0('NO DUMPING',224,113,11,'#f6f2e8',56,'bold ');
  // row 2: three newspaper box fronts, a payphone, CART RETURN and FIRE LANE plates
  [['#1d3f7a','NEWS','#f6f2e8'],['#f6f2e8','DAILY','#b3261e'],['#e2b93b','FREE','#15110c']].forEach((n,k)=>{const x=2+k*48;board(x,130,44,62,n[0]);g.fillStyle='#e9e5da';g.fillRect(x+5,134,34,26);
    g.fillStyle='rgba(30,30,30,.55)';for(let r=0;r<5;r++)g.fillRect(x+8,137+r*4.5,28,2);g.fillStyle='rgba(205,225,235,.3)';g.fillRect(x+5,134,14,26);T0(n[1],x+22,170,13,n[2],38);g.fillStyle='#55595a';g.fillRect(x+30,178,6,9);});
  board(146,130,44,62,'#9aa1a3');g.fillStyle='#1d3f7a';g.fillRect(146,130,44,12);T0('PHONE',168,136,10,'#f6f2e8',40);g.fillStyle='#2b2621';g.fillRect(152,146,12,34);g.fillStyle='#6f7577';for(let r=0;r<4;r++)for(let c=0;c<3;c++)g.fillRect(170+c*6,150+r*7,4,5);
  board(194,130,60,28,'#f6f2e8','#1d3f7a');T0('CART',224,140,11,'#1d3f7a',52);T0('RETURN',224,151,10,'#1d3f7a',52);board(194,162,60,30,'#b3261e');T0('FIRE LANE',224,177,12,'#f6f2e8',54);
  // row 3: a blue tarp, BEWARE OF DOG, NEIGHBORHOOD WATCH
  g.fillStyle='#2f6fb3';g.fillRect(2,196,92,58);for(let k=0;k<9;k++){g.strokeStyle='rgba(10,30,60,'+rr(.12,.3).toFixed(2)+')';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(rr(2,94),196);g.quadraticCurveTo(rr(2,94),225,rr(2,94),254);g.stroke();}
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(2,196,92,3);g.fillStyle='#d9d9d2';for(const q of [[6,200],[88,200],[6,250],[88,250],[47,200],[47,250]])g.fillRect(q[0],q[1],3,3);
  board(98,196,74,28,'#e2b93b');T0('BEWARE OF DOG',135,210,12,'#15110c',68);board(98,228,156,26,'#f6f2e8','#15110c');T0('NEIGHBORHOOD WATCH',176,241,14,'#15110c',146);
  board(176,196,78,28,'#15110c');T0('SLOW · CHILDREN',215,210,11,'#e2b93b',72,'bold ');keep(g,0,0,256,256);});
});
// atlas rectangle of a pixel sub-rectangle of a cell (u0, v0 at the bottom, u1, v1 at the top, like cuv)
function subUV(ci,x,y,w,h){const cx=(ci%8)*AC_,cy=Math.floor(ci/8)*AC_;return[(cx+x+.6)/AS,1-(cy+y+h-.6)/AS,(cx+x+w-.6)/AS,1-(cy+y+.6)/AS];}
const DUV={forSale:subUV(CELL_IX.decals,2,2,92,60),open:subUV(CELL_IX.decals,96,2,158,28),sale:subUV(CELL_IX.decals,96,34,158,28),grand:subUV(CELL_IX.decals,2,66,124,28),lease:subUV(CELL_IX.decals,130,66,124,28),
  benchAd:subUV(CELL_IX.decals,2,98,124,28),ice:subUV(CELL_IX.decals,130,98,60,28),noDump:subUV(CELL_IX.decals,194,98,60,28),news:[0,1,2].map(k=>subUV(CELL_IX.decals,2+k*48,130,44,62)),phone:subUV(CELL_IX.decals,146,130,44,62),
  cart:subUV(CELL_IX.decals,194,130,60,28),fire:subUV(CELL_IX.decals,194,162,60,30),tarp:subUV(CELL_IX.decals,2,196,92,58),dog:subUV(CELL_IX.decals,98,196,74,28),watch:subUV(CELL_IX.decals,98,228,156,26),slow:subUV(CELL_IX.decals,176,196,78,28)};
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
const macroC=document.createElement('canvas');macroC.width=macroC.height=64;
{const g=macroC.getContext('2d'),N=64,im=g.createImageData(N,N),D=im.data,sm=t=>t*t*(3-2*t);D.fill(255);
 for(const [n,wt] of [[4,.5],[8,.32],[16,.18]]){const a=new Float32Array(n*n);for(let i=0;i<n*n;i++)a[i]=rnd();
   for(let y=0;y<N;y++){const fy=y/N*n,j=fy|0,q=sm(fy-j),j1=(j+1)%n;for(let x=0;x<N;x++){const fx=x/N*n,i=fx|0,u=sm(fx-i),i1=(i+1)%n,k=(y*N+x)*4;
     const v=wt*lerp(lerp(a[j*n+i],a[j*n+i1],u),lerp(a[j1*n+i],a[j1*n+i1],u),q);D[k]=n===4?v*255/.5:D[k];D[k+1]=n===8?v*255/.32:D[k+1];D[k+2]=n===16?v*255/.18:D[k+2];}}}
 for(let k=0;k<D.length;k+=4){const v=(D[k]*.5+D[k+1]*.32+D[k+2]*.18)/255;D[k]=D[k+1]=D[k+2]=255;D[k+3]=Math.round(255*(.6+.4*clamp((v-.28)/.44,0,1)));}
 g.putImageData(im,0,0);}
function macroAlpha(g,w,h){g.save();g.globalCompositeOperation='destination-in';g.drawImage(macroC,0,0,w,h);g.restore();}
// lo..hi: colour factors at the two ends of the macro noise; sc: macro scale in texture tiles
// The factors and the scale are uniforms (rounded as they used to be written into the shader), so every macro material shares one
// shader program: fewer programs to compile before the first frame.
function macroMat(m,sc,lo,hi){const v3=a=>new T.Vector3(+a[0].toFixed(3),+a[1].toFixed(3),+a[2].toFixed(3)),
    U={macLo:{value:v3(lo)},macHi:{value:v3(hi)},macSc:{value:+sc.toFixed(4)}};
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);s.fragmentShader='uniform vec3 macLo;\nuniform vec3 macHi;\nuniform float macSc;\n'+s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n\tdiffuseColor.rgb*=mix(macLo,macHi,clamp((texture2D(map,mat2(.8,-.6,.6,.8)*vUv*macSc+vec2(.37,.71)).a-.6)*2.5,0.,1.));\n\tdiffuseColor.a=1.0;');};
  m.customProgramCacheKey=()=>'mac';return m;}
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
  const bl=pats.map(p=>[.22,.32,.42].map(a=>'rgba('+p[0]+','+p[1]+','+p[2]+','+a+')'));
  for(let k=0;k<blades;k++){const p=Math.floor(rnd()*pats.length),x=rnd()*w,y=rnd()*h;g.fillStyle=bl[p][Math.floor(rnd()*3)];g.fillRect(x,y,1,rr(2,4));}
  noise(g,w,h,1600,.07);}
// asphalt base shared by every road texture: sun-faded grey, aggregate, darker patch repairs, crack-seal "tar snakes"
const asphC=document.createElement('canvas');asphC.width=asphC.height=512;
{const g=asphC.getContext('2d');g.fillStyle='#6b6863';g.fillRect(0,0,512,512);noise(g,512,512,8500,.13);
 for(let k=0;k<4;k++){const x=rnd()*512,y=rnd()*512,pw=rr(40,110),ph=rr(30,80);for(const ox of [-512,0,512])for(const oy of [-512,0,512]){g.fillStyle='rgba(58,56,52,.13)';g.fillRect(x+ox,y+oy,pw,ph);
   g.strokeStyle='rgba(40,38,35,.12)';g.lineWidth=1;g.strokeRect(x+ox,y+oy,pw,ph);}}
 for(let k=0;k<26;k++){const x=rnd()*512,y=rnd()*512,r=rr(20,60),lt=rnd()<.5;for(const ox of [-512,0,512])for(const oy of [-512,0,512]){if(x+ox+r<0||x+ox-r>512||y+oy+r<0||y+oy-r>512)continue;
   const gr=g.createRadialGradient(x+ox,y+oy,1,x+ox,y+oy,r);gr.addColorStop(0,lt?'rgba(150,145,136,.12)':'rgba(40,38,35,.14)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x+ox-r,y+oy-r,2*r,2*r);}}
 for(let k=0;k<9;k++){g.strokeStyle='rgba(32,30,28,'+rr(.14,.26).toFixed(2)+')';g.lineWidth=rr(1,1.8);g.lineJoin='round';g.beginPath();let x=rnd()*512,y=rnd()*512;g.moveTo(x,y);
   const hz=rnd()<.5;for(let s=0;s<9;s++){x+=hz?rr(8,26):rr(-10,10);y+=hz?rr(-10,10):rr(8,26);g.lineTo(x,y);}g.stroke();}
 noise(g,512,512,3000,.05);}
// a road texture: across the road u = 0..1 over W metres, along it one tile is W metres; marks = [centre m, width m, colour, dashes per tile (0 = solid)]
function roadMat(W,marks,wear){return macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);const k=512/W;
  if(wear)for(const c of wear){const gr=g.createLinearGradient((c-1.2)*k,0,(c+1.2)*k,0);gr.addColorStop(0,'rgba(20,18,16,0)');gr.addColorStop(.5,'rgba(20,18,16,.24)');gr.addColorStop(1,'rgba(20,18,16,0)');g.fillStyle=gr;g.fillRect((c-1.2)*k,0,2.4*k,h);}
  for(const m of marks){g.fillStyle=m[2];const x=(m[0]-m[1]/2)*k,ww=Math.max(2,m[1]*k);if(!m[3])g.fillRect(x,0,ww,h);else{const cy=h/m[3];for(let q=0;q<m[3];q++)g.fillRect(x,q*cy,ww,cy*.3);}}
  noise(g,512,512,1500,.07);macroAlpha(g,w,h);},true)}),W>20?.09:.16,[.84,.84,.85],[1.08,1.07,1.05]);}
const WH='#dedbd0',YE='#d9b146';
const M={
  sand:L({map:tex(256,256,(g,w,h)=>{g.fillStyle='#ab9f78';g.fillRect(0,0,w,h);noise(g,w,h,4000,.1);
    for(let k=0;k<70;k++){g.fillStyle='rgba('+(rnd()<.5?'110,100,55':'150,120,80')+','+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(1,4),0,7);g.fill();}
    for(let k=0;k<14;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(14,40),rr(6,16),.12,'rgb(225,205,160)');},true)}),
  pad:macroMat(ground('#bcb8ae',1500,.06,(g,w,h)=>{for(let k=0;k<7;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(8,24),rr(6,18),.09,'rgb(90,84,74)');
    g.fillStyle='rgba(60,56,50,.2)';for(const q of [0,64]){g.fillRect(q,0,1,h);g.fillRect(0,q,w,1);}},128,true),.11,[.84,.84,.85],[1.04,1.03,1.02]),
  walk:macroMat(ground('#c1bbae',1400,.06,(g,w,h)=>{for(let k=0;k<10;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(8,30),rr(6,20),.07,rnd()<.6?'rgb(95,88,76)':'rgb(240,235,225)');
    g.strokeStyle='rgba(70,65,55,.32)';g.lineWidth=1.5;for(let k=0;k<=w;k+=64){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let k=0;k<3;k++){g.strokeStyle='rgba(50,45,38,.25)';g.lineWidth=1;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let s=0;s<4;s++){x+=rr(-20,20);y+=rr(-20,20);g.lineTo(x,y);}g.stroke();}},256,true),.1,[.9,.9,.9],[1.03,1.03,1.02]),
  asphalt:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(512,512,(g,w,h)=>{g.drawImage(asphC,0,0);macroAlpha(g,w,h);},true)}),.12,[.84,.84,.85],[1.08,1.07,1.05]),
  dirt:ground('#b39770',4000,.09,ruts(true),256),dirtX:ground('#b39770',4000,.09,ruts(false),256),
  court:ground('#6f8f88',500,.06),plaza:ground('#cdb39d',1300,.07,(g,w,h)=>{g.strokeStyle='rgba(120,80,60,.3)';g.lineWidth=1.5;for(let k=0;k<=w;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2){g.fillStyle='rgba(150,95,70,.13)';g.fillRect(i*32,j*32,32,32);}}),
  grass:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{turfPaint(g,w,h,'#6c7b49',[[86,104,60],[96,114,64],[74,92,54],[138,134,88],[124,126,80],[110,118,70]],4000);macroAlpha(g,w,h);},true)}),
    .14,[.92,1.0,.9],[1.2,1.06,.74]),
  dry:macroMat(L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(256,256,(g,w,h)=>{turfPaint(g,w,h,'#9e9568',[[128,118,76],[150,138,94],[110,108,66],[170,156,112],[96,100,60]],3200);macroAlpha(g,w,h);},true)}),
    .14,[.92,.94,.9],[1.08,1.04,.96]),
  infield:ground('#b98a5a',700,.08),conc:macroMat(ground('#bab5aa',1500,.06,(g,w,h)=>{for(let k=0;k<8;k++)wblob(g,w,h,rnd()*w,rnd()*h,rr(10,40),rr(8,30),.07,'rgb(90,84,74)');
    g.strokeStyle='rgba(70,65,55,.25)';g.lineWidth=1;for(let k=0;k<=w;k+=128){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},256,true),.1,[.86,.86,.86],[1.04,1.03,1.02]),
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
// soft contact shadows: left half of the texture is a round blob, right half a strip that is dark along v=0.
// Double-sided: the strips round building footprints (shadeRect) are wound facing down and were culled until now.
M.shade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:tex(128,64,(g,w,h)=>{
  const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(20,16,12,.5)');gr.addColorStop(.55,'rgba(20,16,12,.3)');gr.addColorStop(1,'rgba(20,16,12,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const g2=g.createLinearGradient(0,64,0,0);g2.addColorStop(0,'rgba(20,16,12,.36)');g2.addColorStop(.3,'rgba(20,16,12,.15)');g2.addColorStop(.7,'rgba(20,16,12,.04)');g2.addColorStop(1,'rgba(20,16,12,0)');g.fillStyle=g2;g.fillRect(66,0,60,64);})});
rndSkip(seedMat,309622);
for(const k of ['wall','flat','paint','shade']){M[k].userData.chunk=1;M[k].userData.cast=k!=='shade';}
const C={white:0xf4f0e7,dark:0x2b2621,metal:0xb3b9bb,steel:0x8c9396,wood:0x6b5138,concrete:0xa9a59c,red:0xb3261e,green:0x2f7d4f,blue:0x1d3f7a,yellow:0xe2b93b,bronze:0x7c6238,olive:0x5b6140,
  stone:0xcfc6b4,curb:0xbdb7aa,glass:0x1c2830,tire:0x1d1c1b,rust:0x8a5a3c,roofs:[0xbcb09e,0xc9c0ae,0xd9d2c4,0xa7826a,0xb9a58c],tile:0xb5583a,lamina:0xa9b0b1,
  blockWall:0xd2c4aa,greyWall:0xbfb8aa};
// house stucco (beige, tan, peach, white) and concrete roof tile colours of a 1990s tract
const wallCols=[0xeee3cb,0xe6d4b2,0xead2b4,0xf3ece0,0xdcc8a6,0xe9d9c1,0xd8c39f,0xf1e7d4,0xe8c6a4,0xdcbf98,0xe3d7bf,0xefdcc0,0xd6c7ae,0xeadfcc];
const roofCols=[0xb5583a,0xa14a33,0x9c5a40,0x8a5a46,0xb86a48,0x7e5c4c,0xa86650,0x94786a,0xb0533c,0x8c4a38];
