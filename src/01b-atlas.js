// =====================================================================
// 01b FACADE ATLAS (part 1): one 2048 px texture of wall pieces, 256 px = 4 m per cell.
// Alpha is a tint mask: opaque pixels take the building's paint colour, half-alpha pixels (doors, glass, signs) keep their own.
// Southern California around 2000: clean stucco, white vinyl windows with grids, sectional garage doors, tile roofs, slump-block walls.
// =====================================================================
const AS=2048,AC_=256,atlasC=document.createElement('canvas');atlasC.width=atlasC.height=AS;
const ag=atlasC.getContext('2d'),CELL_IX={};
let cellN=0;
// cell 56 (bottom-left) holds the white texel used by plain vertex-coloured geometry, so it is never handed out
function cell(name,fn){if(cellN===56)cellN++;const i=cellN++,x=(i%8)*AC_,y=Math.floor(i/8)*AC_;CELL_IX[name]=i;ag.save();ag.beginPath();ag.rect(x,y,AC_,AC_);ag.clip();ag.translate(x,y);fn(ag);ag.restore();return i;}
// mark a rectangle of the current cell as "keeps its own colour"
function keep(g,x,y,w,h){g.save();g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,w,h);g.restore();}
function cuv(i){const x=(i%8)*AC_,y=Math.floor(i/8)*AC_;return[(x+.7)/AS,1-(y+AC_-.7)/AS,(x+AC_-.7)/AS,1-(y+.7)/AS];}
const PXM=64; // pixels per metre (vertically, and horizontally on a 4 m segment)
function stucco(g,base,dado){g.fillStyle=base||'#efeae0';g.fillRect(0,0,256,256);noise(g,256,256,650,.045);
  for(let k=0;k<6;k++){g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.ellipse(rnd()*256,rnd()*256,rr(20,60),rr(8,20),rnd()*3,0,7);g.fill();}
  if(dado){g.fillStyle='rgba(60,45,30,.16)';g.fillRect(0,256-dado,256,dado);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,256-dado-2,256,2);}
  const gr=g.createLinearGradient(0,230,0,256);gr.addColorStop(0,'rgba(90,70,50,0)');gr.addColorStop(1,'rgba(90,70,50,.15)');g.fillStyle=gr;g.fillRect(0,230,256,26);
  g.fillStyle='rgba(70,60,50,.25)';g.fillRect(0,249,256,2);}
function frameR(g,x,y,w,h,col,t){g.fillStyle=col;g.fillRect(x-t,y-t,w+2*t,h+2*t);}
function glass(g,x,y,w,h,dark){const gr=g.createLinearGradient(x,y,x+w*.4,y+h);gr.addColorStop(0,dark?'#2e3a40':'#4b6573');gr.addColorStop(.5,dark?'#1a2226':'#26363f');gr.addColorStop(1,'#172129');g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.fillStyle='rgba(205,225,235,.17)';g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.55,y);g.lineTo(x+w*.2,y+h);g.lineTo(x,y+h);g.fill();}
function sillShadow(g,x,y,w){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-4,y,w+8,4);}
// house window: foam trim surround, white vinyl frame, colonial grids
function hwin(g,x,y,w,h,arch,grid){const t=7;g.fillStyle='#f3eee2';g.fillRect(x-t,y-t,w+2*t,h+2*t+3);if(arch){g.beginPath();g.ellipse(x+w/2,y,w/2+t,arch+t,0,PI,0);g.fill();}
  sillShadow(g,x-t,y+h+t+3,w+2*t-8);g.fillStyle='#fbfaf6';g.fillRect(x-2,y-2,w+4,h+4);if(arch){g.beginPath();g.ellipse(x+w/2,y,w/2+2,arch+2,0,PI,0);g.fill();}
  glass(g,x+2,y+2,w-4,h-4);if(arch){g.save();g.beginPath();g.ellipse(x+w/2,y+1,w/2-2,arch-1,0,PI,0);g.clip();glass(g,x,y-arch,w,arch+2);g.restore();}
  g.strokeStyle='#f6f4ee';g.lineWidth=2.4;g.beginPath();g.moveTo(x+w/2,y-(arch||0));g.lineTo(x+w/2,y+h);g.stroke();
  if(grid!==false){g.lineWidth=1.6;g.beginPath();const nx=w>110?6:4;for(let k=1;k<nx;k++)if(k!==nx/2){g.moveTo(x+k*w/nx,y);g.lineTo(x+k*w/nx,y+h);}for(const f of [1/3,2/3]){g.moveTo(x,y+h*f);g.lineTo(x+w,y+h*f);}g.stroke();}
  // a hint of curtains or blinds
  g.fillStyle=pick(['rgba(235,225,205,.35)','rgba(245,240,230,.3)','rgba(200,170,140,.3)']);g.fillRect(x+3,y+3,w*.2,h-6);g.fillRect(x+w*.8-3,y+3,w*.2,h-6);
  keep(g,x-t,y-t-(arch?arch+1:0),w+2*t,h+2*t+(arch?arch+1:0)+6);}
// ---- plain walls (tinted)
cell('stucco',g=>stucco(g));
cell('dado',g=>stucco(g,null,50));
cell('block',g=>{g.fillStyle='#c9c6bf';g.fillRect(0,0,256,256);noise(g,256,256,1300,.07);g.strokeStyle='rgba(60,55,48,.42)';g.lineWidth=1.4;
  for(let r=0;r<20;r++){const y=r*12.8;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(r%2)*12.8;x<256;x+=25.6){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+12.8);g.stroke();}}});
// slump-block garden wall, drawn for segments 8 m wide (32 px/m across, 64 px/m up): blocks 0.4 x 0.2 m
cell('wall8',g=>{g.fillStyle='#bdb3a2';g.fillRect(0,0,256,256);for(let r=0;r<20;r++){const y=256-(r+1)*12.8;for(let x=(r%2)*6.4-6.4;x<256;x+=12.8){const k=rr(.9,1.06);
      g.fillStyle='rgb('+Math.round(222*k)+','+Math.round(214*k)+','+Math.round(198*k)+')';g.beginPath();g.moveTo(x+1.2,y+11.8);g.lineTo(x+1,y+3);g.quadraticCurveTo(x+1.5,y+1,x+4,y+1.2);g.lineTo(x+9,y+1.2);g.quadraticCurveTo(x+11.4,y+1,x+11.8,y+3.5);g.lineTo(x+11.6,y+11.8);g.fill();
      g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+2,y+1.6,8,1.4);}}noise(g,256,256,900,.06);
  g.fillStyle='rgba(80,70,55,.18)';g.fillRect(0,236,256,20);});
// ---- house pieces
cell('hwin',g=>{stucco(g);hwin(g,80,118,96,78);});
cell('hwinA',g=>{stucco(g);hwin(g,88,124,80,72,26,true);});
cell('hwinW',g=>{stucco(g);hwin(g,46,122,164,72);});
cell('hdoor',g=>{stucco(g);// recessed entry with an arch, wood door with an oval light, a sidelight and a porch lamp
  g.fillStyle='#e9e2d2';g.beginPath();g.moveTo(68,256);g.lineTo(68,96);g.ellipse(128,96,60,40,0,PI,0);g.lineTo(188,256);g.fill();
  const gr=g.createLinearGradient(0,70,0,256);gr.addColorStop(0,'rgba(60,45,30,.55)');gr.addColorStop(1,'rgba(60,45,30,.25)');g.fillStyle=gr;g.beginPath();g.moveTo(78,256);g.lineTo(78,98);g.ellipse(128,98,50,32,0,PI,0);g.lineTo(178,256);g.fill();
  g.fillStyle='#6b4a2d';g.fillRect(98,121,60,135);g.strokeStyle='rgba(30,18,8,.5)';g.lineWidth=2;g.strokeRect(104,190,48,56);g.fillStyle='#2b3a42';g.beginPath();g.ellipse(128,150,16,24,0,0,7);g.fill();
  g.strokeStyle='#d8c9a0';g.lineWidth=2;g.stroke();g.fillStyle='#2b3a42';g.fillRect(162,124,12,124);g.fillStyle='#c8b06a';g.fillRect(146,188,4,10);
  g.fillStyle='#3a2f25';g.fillRect(190,124,9,16);g.fillStyle='#f6e6b8';g.fillRect(192,128,5,9);keep(g,66,52,136,204);});
// two-car sectional door, drawn for a 6.4 m wide face (40 px/m across): 4.9 x 2.15 m
cell('garage',g=>{stucco(g);const x=30,y=118,w=196,h=138;g.fillStyle='#f3eee2';g.fillRect(x-8,y-9,w+16,h+9);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,w,5);
  g.fillStyle='#ece8de';g.fillRect(x,y+5,w,h-5);for(let r=0;r<4;r++){const py=y+5+r*33.25;g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,py+31,w,2);
    for(let k=0;k<8;k++){const px=x+5+k*23.9;g.fillStyle='rgba(255,255,255,.55)';g.fillRect(px,py+5,20,2);g.fillStyle='rgba(0,0,0,.13)';g.fillRect(px,py+22,20,2);g.fillRect(px+18,py+5,2,19);}}
  g.fillStyle='rgba(110,90,60,.18)';g.fillRect(x,y+h-10,w,10);keep(g,x-8,y-9,w+16,h+9);});
// ---- doors and shop fronts
cell('doorMetal',g=>{stucco(g,null,40);const x=96,y=120,w=64,h=136;frameR(g,x,y,w,h,'#d9d3c6',5);g.fillStyle='#d8d5cc';g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(x+8,y+10,48,116);
  g.fillStyle='#777';g.fillRect(x+52,y+70,5,9);g.fillStyle='#2b2621';g.fillRect(x+16,y-22,32,8);keep(g,x-5,y-24,w+10,h+24);});
cell('doorGlass',g=>{stucco(g);const x=64,y=112,w=128,h=144;frameR(g,x,y,w,h,'#8f8a80',6);glass(g,x,y,w,h);g.strokeStyle='#8f8a80';g.lineWidth=5;g.beginPath();g.moveTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.moveTo(x,y+26);g.lineTo(x+w,y+26);g.stroke();
  g.fillStyle='#d9d9d2';g.fillRect(x+w/2-12,y+84,7,22);g.fillRect(x+w/2+5,y+84,7,22);keep(g,x-6,y-6,w+12,h+6);});
// storefront: dark bronze aluminium, glass from 0.3 to 3 m, transom; a glimpse of the shop inside
function storefront(g,door){const y0=64,y1=237;g.fillStyle='#3e352d';g.fillRect(0,y0-6,256,y1-y0+19);
  const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#2a2622');gr.addColorStop(1,'#141210');g.fillStyle=gr;g.fillRect(4,y0,248,y1-y0);
  for(let r=0;r<3;r++){g.fillStyle='rgba(120,100,70,.5)';g.fillRect(12,y0+70+r*30,232,3);for(let k=0;k<18;k++){g.fillStyle=pick(['#b3261e','#e2b93b','#2f7d4f','#e9e5da','#1d3f7a','#d98a4e']);g.globalAlpha=.45;g.fillRect(14+k*12.8,y0+54+r*30+rnd()*4,9,15-rnd()*4);g.globalAlpha=1;}}
  g.fillStyle='rgba(215,235,245,.16)';g.beginPath();g.moveTo(4,y0);g.lineTo(150,y0);g.lineTo(60,y1);g.lineTo(4,y1);g.fill();
  g.fillStyle='#3e352d';g.fillRect(0,y0+38,256,6);for(const x of [0,126,250])g.fillRect(x,y0,6,y1-y0);
  if(door){g.fillRect(96,y0+44,4,y1-y0-44);g.fillRect(156,y0+44,4,y1-y0-44);g.fillStyle='#c9c4b8';g.fillRect(104,y0+120,48,5);g.fillStyle='#f4f0e7';g.fillRect(110,y0+60,36,12);g.fillStyle='#b3261e';g.font='bold 10px Arial';g.textAlign='center';g.fillText('OPEN',128,y0+70);}
  else{g.fillStyle='#f4f0e7';g.globalAlpha=.85;g.fillRect(rr(20,60),rr(y0+50,y0+80),rr(26,40),rr(30,44));g.globalAlpha=1;}
  g.fillStyle='#8f8a80';g.fillRect(0,y1,256,4);keep(g,0,y0-6,256,y1-y0+19);}
cell('store',g=>{stucco(g);storefront(g,false);});
cell('storeD',g=>{stucco(g);storefront(g,true);});
cell('glassFront',g=>{stucco(g);const y=92,h=164;g.fillStyle='#8f8a80';g.fillRect(0,y-6,256,h+6);glass(g,6,y,116,h-10);glass(g,134,y,116,h-10);
  for(const p of [[18,150,40,56,'#e2b93b'],[70,160,36,44,'#f4f0e7'],[150,146,44,60,'#b3261e'],[204,166,34,40,'#f4f0e7']]){g.fillStyle=p[4];g.globalAlpha=.8;g.fillRect(p[0],p[1],p[2],p[3]);g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.4)';for(let k=0;k<3;k++)g.fillRect(p[0]+5,p[1]+10+k*10,p[2]-10,3);}
  keep(g,0,y-6,256,h+6);});
cell('schoolWin',g=>{stucco(g,null,70);const x=24,y=96,w=208,h=62;frameR(g,x,y,w,h,'#ece6d6',5);glass(g,x,y,w,h);g.strokeStyle='#ece6d6';g.lineWidth=3;for(let k=1;k<4;k++){g.beginPath();g.moveTo(x+k*w/4,y);g.lineTo(x+k*w/4,y+h);g.stroke();}
  g.fillStyle='#cfc8b8';g.fillRect(x-8,y+h+5,w+16,6);keep(g,x-5,y-5,w+10,h+16);});
// office ribbon window: reflective blue-green glass band
cell('office',g=>{stucco(g,'#e6e2d8');const y=70,h=128;const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#5d7f8a');gr.addColorStop(.45,'#2f4f5c');gr.addColorStop(1,'#203a44');g.fillStyle=gr;g.fillRect(0,y,256,h);
  g.fillStyle='rgba(220,235,240,.18)';g.beginPath();g.moveTo(30,y);g.lineTo(140,y);g.lineTo(80,y+h);g.lineTo(0,y+h);g.lineTo(0,y+20);g.fill();
  g.fillStyle='#55605f';for(let x=0;x<=256;x+=64)g.fillRect(x-2,y,4,h);g.fillRect(0,y+h-3,256,3);keep(g,0,y,256,h);});
// tilt-up concrete panel (warehouses), drawn for an 8 m wide face of any height
cell('tilt',g=>{g.fillStyle='#d8d3c8';g.fillRect(0,0,256,256);noise(g,256,256,1500,.05);for(let k=0;k<5;k++){g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,rnd()*256,256,rr(6,20));}
  g.fillStyle='rgba(60,55,45,.5)';g.fillRect(0,58,256,3);g.fillRect(0,64,256,2);g.fillRect(0,0,3,256);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(3,0,2,256);
  const gr=g.createLinearGradient(0,0,0,30);gr.addColorStop(0,'rgba(80,70,55,.25)');gr.addColorStop(1,'rgba(80,70,55,0)');g.fillStyle=gr;g.fillRect(0,0,256,30);
  g.fillStyle='rgba(90,75,55,.18)';g.fillRect(0,236,256,20);});
// truck dock: roll-up door above a 1.2 m dock, black seals and bumpers (8 m face, lower 4 m)
cell('dock',g=>{g.fillStyle='#d8d3c8';g.fillRect(0,0,256,256);noise(g,256,256,1200,.05);g.fillStyle='rgba(60,55,45,.5)';g.fillRect(0,0,3,256);
  const x=80,w=96,y=13,yb=179;g.fillStyle='#1e1d1b';g.fillRect(x-10,y-8,w+20,yb-y+8);g.fillStyle='#b9bcbb';g.fillRect(x,y,w,yb-y);for(let k=y;k<yb;k+=6){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,k,w,2);}
  g.fillStyle='#ece3c8';g.fillRect(x+30,y+10,36,10);g.fillStyle='#8c8c86';g.fillRect(x-12,yb,w+24,77);g.fillStyle='#151413';g.fillRect(x+4,yb+6,16,40);g.fillRect(x+w-20,yb+6,16,40);
  g.fillStyle='#e2b93b';g.fillRect(x-12,yb,w+24,4);keep(g,x-12,y-8,w+24,256-y+8);});
cell('corr',g=>{g.fillStyle='#d7dbdc';g.fillRect(0,0,256,256);for(let x=0;x<256;x+=8){g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x,0,3,256);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x+4,0,2,256);}
  noise(g,256,256,400,.05);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,126,256,3);});
// board and batten barn siding
cell('barn',g=>{g.fillStyle='#d9d0c2';g.fillRect(0,0,256,256);for(let x=0;x<256;x+=21.3){g.fillStyle='rgba('+(rnd()<.5?'0,0,0':'255,240,220')+','+rr(.02,.08).toFixed(2)+')';g.fillRect(x,0,21.3,256);
    g.fillStyle='rgba(40,25,15,.35)';g.fillRect(x,0,2,256);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+3,0,4,256);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+7,0,2,256);}noise(g,256,256,900,.06);});
cell('brick',g=>{g.fillStyle='#c98f6f';g.fillRect(0,0,256,256);for(let r=0;r<32;r++)for(let x=(r%2)*16-16;x<256;x+=32){g.fillStyle='rgba('+(rnd()<.5?'60,25,10':'255,220,190')+','+rr(.03,.16).toFixed(2)+')';g.fillRect(x+1,r*8+1,30,6);}
  g.strokeStyle='rgba(235,225,210,.5)';g.lineWidth=1;for(let r=0;r<=32;r++){g.beginPath();g.moveTo(0,r*8);g.lineTo(256,r*8);g.stroke();}noise(g,256,256,400,.06);});
cell('stone',g=>{g.fillStyle='#d8d0c0';g.fillRect(0,0,256,256);noise(g,256,256,1200,.08);g.strokeStyle='rgba(70,60,45,.35)';g.lineWidth=1.5;
  for(let r=0;r<12;r++){const y=r*21.3;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(r%2)*24+rr(-6,6);x<256;x+=rr(30,58)){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+21.3);g.stroke();}}});
// open arch of an arcade: the shadowed walk behind it keeps its colour
cell('arcade',g=>{stucco(g);g.fillStyle='#e9e2d2';g.beginPath();g.moveTo(26,256);g.lineTo(26,110);g.ellipse(128,110,102,62,0,PI,0);g.lineTo(230,256);g.fill();
  const gr=g.createLinearGradient(0,50,0,256);gr.addColorStop(0,'#3a3128');gr.addColorStop(1,'#6a5d4e');g.fillStyle=gr;g.beginPath();g.moveTo(34,256);g.lineTo(34,112);g.ellipse(128,112,94,56,0,PI,0);g.lineTo(222,256);g.fill();
  storefrontMini(g);keep(g,24,46,208,210);});
function storefrontMini(g){g.fillStyle='#2a2622';g.fillRect(58,140,140,116);g.fillStyle='rgba(215,235,245,.16)';g.fillRect(60,142,60,112);g.fillStyle='#3e352d';g.fillRect(126,140,4,116);}
// roof tiles (concrete S-tile courses); the roof colour comes from the vertex tint
cell('tile',g=>{g.fillStyle='#cfcfcf';g.fillRect(0,0,256,256);const ch=16,cw=18.3;
  for(let r=0;r<16;r++){const y=r*ch;for(let k=0;k<14;k++){const x=k*cw+(r%2)*0,v=rr(.84,1.12),c=Math.round(200*v);
      const gr=g.createLinearGradient(x,0,x+cw,0);gr.addColorStop(0,'rgb('+Math.round(c*.78)+','+Math.round(c*.78)+','+Math.round(c*.78)+')');gr.addColorStop(.3,'rgb('+Math.min(255,c+40)+','+Math.min(255,c+40)+','+Math.min(255,c+40)+')');
      gr.addColorStop(.62,'rgb('+c+','+c+','+c+')');gr.addColorStop(1,'rgb('+Math.round(c*.66)+','+Math.round(c*.66)+','+Math.round(c*.66)+')');g.fillStyle=gr;g.fillRect(x,y,cw,ch);}
    g.fillStyle='rgba(0,0,0,.32)';g.fillRect(0,y+ch-3,256,3);}noise(g,256,256,900,.07);});
// fixed colours that any face can sample (they keep their colour whatever the tint)
const SWCOL=[0xf4f1ea,0xe8dcc0,0x4a3426,0x1c1a18,0x26343d,0xb8bcbc,0xb5583a,0xa9a59c,0x7a5a3a,0x3f6b3a,0xb3261e,0x1d3f7a,0xe2b93b,0x3d9ad0,0x2f8f8a,0x6a3d8f,
  0xd8412f,0x2f7d4f,0xf0a030,0x8c9396,0x5b4a3c,0xc9c4b8,0x15110c,0x9a2a22];
const SWN={trim:0,cream:1,brown:2,black:3,glass:4,alu:5,terra:6,conc:7,wood:8,green:9,red:10,blue:11,yellow:12,pool:13,teal:14,purple:15,lred:16,lgreen:17,orange:18,steel:19,dbrown:20,stone:21,ink:22,maroon:23};
cell('swatch',g=>{SWCOL.forEach((c,k)=>{g.fillStyle=css(c);g.fillRect((k%8)*32,Math.floor(k/8)*32,32,32);});keep(g,0,0,256,96);});
function swUV(k){const c=cuv(CELL_IX.swatch),x=(k%8)*32+16,y=Math.floor(k/8)*32+16,u=c[0]+(c[2]-c[0])*x/256,v=c[3]-(c[3]-c[1])*y/256;return[u,v,u,v];}
cell('planks',g=>{g.fillStyle='#8a6a45';g.fillRect(0,0,256,256);for(let r=0;r<8;r++){g.fillStyle='rgba('+(rnd()<.5?'0,0,0':'255,230,190')+','+rr(.04,.14).toFixed(2)+')';g.fillRect(0,r*32,256,30);g.fillStyle='rgba(30,18,8,.5)';g.fillRect(0,r*32+30,256,2);}
  noise(g,256,256,600,.08);g.strokeStyle='rgba(30,18,8,.6)';g.lineWidth=10;g.strokeRect(5,5,246,246);g.beginPath();g.moveTo(8,8);g.lineTo(248,248);g.stroke();keep(g,0,0,256,256);});
cell('sandbag',g=>{g.fillStyle='#b9a47a';g.fillRect(0,0,256,256);noise(g,256,256,1200,.09);for(let r=0;r<8;r++)for(let x=(r%2)*32-32;x<256;x+=64){g.strokeStyle='rgba(60,45,25,.55)';g.lineWidth=2.5;g.beginPath();g.ellipse(x+32,r*32+16,31,15,0,0,7);g.stroke();
    g.fillStyle='rgba(255,240,200,.08)';g.beginPath();g.ellipse(x+32,r*32+11,22,6,0,0,7);g.fill();}keep(g,0,0,256,256);});
// brown "Historic Route 66" sign with the shield
cell('r66',g=>{g.fillStyle='#6b4a2b';g.fillRect(0,0,256,256);g.strokeStyle='#f4f0e7';g.lineWidth=6;g.strokeRect(8,8,240,240);g.fillStyle='#f4f0e7';g.textAlign='center';g.textBaseline='middle';
  g.font='900 34px "Arial Narrow",Arial,sans-serif';g.fillText('HISTORIC',128,40);g.beginPath();g.moveTo(68,66);g.lineTo(188,66);g.quadraticCurveTo(196,92,184,112);g.quadraticCurveTo(200,176,128,214);g.quadraticCurveTo(56,176,72,112);g.quadraticCurveTo(60,92,68,66);g.fill();
  g.strokeStyle='#15110c';g.lineWidth=4;g.stroke();g.fillStyle='#15110c';g.font='900 22px Arial,sans-serif';g.fillText('ROUTE',128,90);g.fillRect(76,104,104,3);g.font='900 66px "Arial Narrow",Arial,sans-serif';g.fillText('66',128,152);
  g.fillStyle='#f4f0e7';g.font='900 26px "Arial Narrow",Arial,sans-serif';g.fillText('CALIFORNIA',128,234);keep(g,0,0,256,256);});
