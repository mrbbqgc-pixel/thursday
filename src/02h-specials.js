// =====================================================================
// 02h WHAT STANDS WHERE: every block between the main streets gets its tract, landmark, shops or warehouses
// =====================================================================
const xE=k=>AV[k].x+AV[k].hw,xW=k=>AV[k].x-AV[k].hw,zS=k=>STR[k].z+STR[k].hw,zN=k=>STR[k].z-STR[k].hw,TN=-636-TRW,TS=-636+TRW,RAILN=TRK-10,RAILS=TRK+10;
const kept={},BLOCKS=tracts; // kept: old name read by the test tail; BLOCKS: exported to the test hook
const RR=(x0,z0,x1,z1,k,sw)=>({x0,z0,x1,z1,k:k||['A','A','A','A'],sw});
// stepped pads along the freeway's diagonal edge
function padStair(x0,z0,z1,top,step,sw){for(let z=z0;z<z1-.1;z+=step){const ze=Math.min(z1,z+step),xe=Math.min(fwEdge(z),fwEdge(ze))-2;if(xe-x0<4)continue;pad2(x0,z,xe,ze,top,[z===z0?sw[0]:-1,ze>=z1?sw[1]:-1,sw[2],0]);mapR(x0,z,xe,ze,'#cbc6b8');}}
// greenbelt between a straight tract edge and the slanting trail corridor
function greenbelt(xa,xb,zf,north){for(let x=xa;x<xb-.5;x+=24){const e=Math.min(xb,x+24),ca=trailZ(x)+(north?-TRW:TRW),cb=trailZ(e)+(north?-TRW:TRW);
    if(north)qUp(M.grassO,[x,.03,zf],[e,.03,zf],[e,.03,cb],[x,.03,ca],(e-x)/8,Math.abs(ca-zf)/8);else qUp(M.grassO,[x,.03,ca],[e,.03,cb],[e,.03,zf],[x,.03,zf],(e-x)/8,Math.abs(zf-ca)/8);
    mapR(x,Math.min(zf,ca,cb),e,Math.max(zf,ca,cb),'#a9c98c');const m=(x+e)/2,cz=trailZ(m)+(north?-TRW:TRW);for(let k=0;k<1;k++)if(Math.abs(zf-cz)>6)trees.push([m+rr(-9,9),lerp(cz,zf,rr(.25,.75)),rr(.9,1.3),pick([1,2,4,0,5])]);}}

// ---------- north of the trail (mostly beyond the north edge: one street and a row inside the playing area)
filler(-1000,-860,1700,-726);filler(-760,-726,-566,1210,true);
tract(RR(-562,-722,xW('ARCH'),TN,['W','W','W','A']),{coll:[]});
tract(RR(xE('ARCH'),-722,xW('HERM'),TN,['W','W','A','A']),{coll:[]});
tract(RR(xE('HERM'),-722,xW('HAVEN'),TN,['W','W','A','A']),{coll:[]});
tract(RR(xE('HAVEN'),-722,xW('MILL'),TN,['W','W','A','A']));
tract(RR(xE('MILL'),-722,xW('ROCH'),TN-2,['W','W','A','A']));greenbelt(600,xW('ROCH'),TN-2,true);
tract(RR(xE('ROCH'),-722,xW('DAYC'),trailZ(xE('ROCH'))-TRW-2,['W','W','A','A']),{coll:[]});greenbelt(xE('ROCH'),xW('DAYC'),trailZ(xE('ROCH'))-TRW-2,true);
tract(RR(xE('DAYC'),-722,1470,trailZ(xE('DAYC'))-TRW-2,['W','W','A','W']),{coll:[]});greenbelt(xE('DAYC'),1470,trailZ(xE('DAYC'))-TRW-2,true);
// ---------- between the trail and Base Line; Central Park and the Haven trailhead
tract(RR(-562,TS,xW('ARCH'),zN('BL'),['W','A','W','A']),{coll:[]});
tract(RR(xE('ARCH'),TS,xW('HERM'),zN('BL'),['W','A','A','A']),{cexit:[false,true]});
tract(RR(xE('HERM'),TS,xW('HAVEN'),zN('BL'),['W','A','A','A']),{cexit:[false,true]});
{const x0=xE('HAVEN'),F=TF(0,0,0);pad2(x0,TS,x0+48,zN('BL'),M.grass,[0,SWA,SWA,0]);mapR(x0,TS,x0+48,zN('BL'),'#b9c79a');F.lot(x0+SWA+2,TS+2,x0+46,TS+2+18.6,true);lotCars(F,x0+SWA+2,TS+2,x0+46,TS+2+18.6,true,.3);
 postSign(strip('peth','TRAILHEAD · PACIFIC ELECTRIC TRAIL','#5b3a22','#f1e6c8','bold 20px "Arial Narrow",Arial'),x0+8,TS+24,PI/2,2.6,.65,1.3);
 for(let z=TS+26;z<zN('BL')-4;z+=12)trees.push([x0+rr(8,40),z,rr(.9,1.2),pick([1,2,0])]);label(x0+24,TS+12,'TRAILHEAD',0);}
tract(RR(xE('HAVEN')+48,TS,330,zN('BL'),['W','A','W','W']),{coll:[]});
// Central Park: a big open lawn (the Bobo arena), a dog park, a playground, the community center, the trailhead lot
{const x0=330,x1=xW('MILL'),z0=TS,z1=zN('BL');park2(RR(x0,z0,x1,z1,null,[0,SWA,0,SWA]),'CENTRAL PARK',{keep:[350,-610,470,-526],play:[x0+16,z1-20],shelter:[x0+18,z0+30],rest:[x0+16,z0+48],
   paths:[[x0+4,(z0+z1)/2-1.2,x1-4,(z0+z1)/2+1.2]],benches:[[392,-592,1],[448,-592,1],[392,-540,1],[448,-540,1],[372,-566,0],[468,-566,0]]});
 for(const q of [[400,-575],[438,-552],[452,-598]])trees.push([q[0],q[1],rr(1.1,1.3),pick([0,2])]);
 // dog park: fenced, with a couple of agility pieces (cover)
 const dx0=x0+4,dz0=z1-34;chainLink(dx0,dz0,dx0+24,dz0,1.5);chainLink(dx0,dz0,dx0,z1-6,1.5);chainLink(dx0+24,dz0,dx0+24,z1-14,1.5);chainLink(dx0,z1-6,dx0+18,z1-6,1.5);
 for(const q of [[dx0+8,dz0+10],[dx0+16,dz0+20]])crate(q[0],q[1],1.1,0x8fb0c0);label(dx0+12,dz0+14,'DOG PARK',0);
 block(x1-24,z0+16,30,14,4.4,{front:2,fc:['glassFront','doorGlass','hwinW'],sc:['stucco','hwinW'],tint:0xe8dcc4,band:0x2f6a5a});label(x1-24,z0+16,'COMMUNITY CENTER',0);
 const F=TF(0,0,0);F.lot(x1-40,z1-20,x1-3,z1-1.4,true);lotCars(F,x1-40,z1-20,x1-3,z1-1.4,true,.3);}
tract(RR(xE('MILL'),trailZ(xW('ROCH'))+TRW+2,xW('ROCH'),zN('BL'),['W','A','A','A']),{coll:[]});greenbelt(600,xW('ROCH'),trailZ(xW('ROCH'))+TRW+2,false);
{const z0=trailZ(xW('ROCH'))+TRW+2;greenbelt(xE('MILL'),600,z0,false);}
park2(RR(xE('ROCH'),trailZ(xW('DAYC'))+TRW+1,xW('DAYC'),zN('BL'),null,[0,SWA,SWA,SWA]),'VICTORIA GREENBELT',{play:[960,-530],shelter:[900,-530]});greenbelt(xE('ROCH'),xW('DAYC'),trailZ(xW('DAYC'))+TRW+1,false);
greenbelt(xE('DAYC'),1440,zN('BL'),false);
// ---------- Base Line to Church: Terra Linda and its neighbours. Aunt Ro's cul-de-sac is the west end of the third street.
tract(RR(-562,zS('BL'),xW('ARCH'),zN('CH'),['A','A','W','A']),{swap:true,coll:[]});
tract(RR(xE('ARCH'),zS('BL'),xW('HERM'),zN('CH'),['A','A','A','A']),{wind:'N'});
const TL=tract(RR(xE('HERM'),zS('BL'),xW('HAVEN'),zN('CH'),['A','A','A','A']),{streets:[-452,-386,-320],coll:[-120],pk:[PK,PK,1.5,PK],ends:[['bulb','bulb'],['open','bulb'],['bulb','bulb']],bulbAt:[null,null,[-227,undefined]],wind:'N'});
tract(RR(xE('HAVEN'),zS('BL'),xW('MILL'),zN('CH'),['A','A','A','A']),{coll:[150,330]});
tract(RR(xE('MILL'),zS('BL'),xW('ROCH'),zN('CH'),['A','A','A','A']),{swap:true});
tract(RR(xE('ROCH'),zS('BL'),xW('DAYC'),zN('CH'),['A','A','A','A']));
tract(RR(xE('DAYC'),zS('BL'),1340,zN('CH'),['A','A','A','W']),{swap:true,wind:'E'});
// ---------- Church to Foothill
tract(RR(-562,zS('CH'),xW('ARCH'),zN('FH'),['A','A','W','A']),{swap:true,coll:[]});
tract(RR(xE('ARCH'),zS('CH'),xW('HERM'),zN('FH'),['A','A','A','A']),{swap:true});
park2(RR(xE('HERM'),zS('CH'),-158,-116,null,[SWA,0,SWA,0]),'CHURCH ST PARK',{field:[-205,-150,52,0],play:[-180,-232],rest:[-226,-232],shelter:[-178,-132]});
school(RR(-158,zS('CH'),xW('HAVEN'),-116,null,[SWA,0,0,SWA]),'ELEMENTARY SCHOOL',2);
tract(RR(xE('HERM'),-116,xW('HAVEN'),zN('FH'),['W','A','A','A']),{coll:[]});
apartments(RR(xE('HAVEN'),zS('CH'),117,-132,null,[SWA,0,SWA,0]),{name:'TERRA LINDA APARTMENTS'});
school(RR(117,zS('CH'),247,-132,null,[SWA,0,0,0]),'MIDDLE SCHOOL',2);
park2(RR(247,zS('CH'),354,-132,null,[SWA,0,0,0]),'COYOTE PARK',{field:[300,-200,48,0],play:[332,-150],shelter:[270,-150]});
apartments(RR(354,zS('CH'),xW('MILL'),-132,null,[SWA,0,0,SWA]));
townCenter(RR(xE('HAVEN'),-132,342,zN('FH')));
stripCenter(RR(342,-132,xW('MILL'),zN('FH'),null,[0,SWA,0,SWA]),1,'PALM COURT CENTER',{fill:.4});
tract(RR(xE('MILL'),zS('CH'),xW('ROCH'),-102,['A','W','A','A']),{coll:[]});
stripCenter(RR(xE('MILL'),-102,702,zN('FH'),null,[0,SWA,SWA,0]),1,'SUNSET MARKETPLACE',{sign0:4});
{const F=TF(0,0,0);pad2(702,-102,xW('ROCH'),zN('FH'),M.pad,[0,SWA,0,SWA]);fastFood(728,-48,0,8,0xb3261e);gasStation(800,-46,0,0xd8412f);}
tract(RR(xE('ROCH'),zS('CH'),xW('DAYC'),-102,['A','W','A','A']));
stripCenter(RR(xE('ROCH'),-102,xW('DAYC'),zN('FH'),null,[0,SWA,SWA,SWA]),1,'CITRUS CROSSING',{sign0:16});
promenade(1150,-160);
// ---------- Foothill to Arrow: Route 66 strip, the Civic Center, the Market Hall, the ballpark
tract(RR(-562,zS('FH'),xW('ARCH'),zN('AR'),['A','A','W','A']),{swap:true,coll:[],older:true});
stripCenter(RR(xE('ARCH'),zS('FH'),xW('HERM'),94,null,[SWA,0,SWA,SWA]),0,'DESERT ROSE PLAZA',{sign0:12});
tract(RR(xE('ARCH'),94,xW('HERM'),zN('AR'),['W','A','A','A']),{older:true,coll:[]});
stripCenter(RR(xE('HERM'),zS('FH'),-90,122,null,[SWA,0,SWA,0]),0,'MOTHER ROAD PLAZA',{sign0:0,fill:.3});
{pad2(-90,zS('FH'),xW('HAVEN'),122,M.pad,[SWA,0,0,SWA]);mapR(-90,zS('FH'),xW('HAVEN'),122,'#b7b3ab');gasStation(-56,40,2,0x1d6f9a);fastFood(-56,98,3,17,0x2f7d4f);}
tract(RR(xE('HERM'),122,xW('HAVEN'),zN('AR'),['W','A','A','A']),{older:true,coll:[]});
civicCenter(RR(xE('HAVEN'),zS('FH'),152,152));
{pad2(xE('HAVEN'),152,152,zN('AR'),M.grass,[0,SWA,SWA,0]);mapR(xE('HAVEN'),152,152,zN('AR'),'#b7b3ab');marketHall(40,205);
 const F=TF(0,0,0);F.lot(80,158,148,158+18.6*3,false);lotCars(F,80,158,148,158+18.6*3,false,.45);}
officePark(RR(152,zS('FH'),337,zN('AR'),null,[SWA,SWA,0,0]),{name:'OFFICE PARK'});
apartments(RR(337,zS('FH'),xW('MILL'),zN('AR'),null,[SWA,SWA,0,SWA]),{name:'APARTMENTS'});
{const x0=xE('MILL'),F=TF(0,0,0);pad2(x0,zS('FH'),705,zN('AR'),M.pad,[SWA,SWA,SWA,0]);mapR(x0,zS('FH'),705,zN('AR'),'#b7b3ab');
 F.shops(600,40,150,18,{sign0:20});const nm=4;F.lot(x0+4,64,700,64+18.6*nm,true);lotCars(F,x0+4,64,700,64+18.6*nm,true,.3);label(600,140,'BALLPARK PARKING',0);}
pad2(705,zS('FH'),xW('ROCH'),65,M.grass,[SWA,0,0,SWA]);pad2(705,195,xW('ROCH'),zN('AR'),M.grass,[0,SWA,0,SWA]);pad2(825,65,xW('ROCH'),195,M.grass,[0,0,0,SWA]);
mapR(705,zS('FH'),xW('ROCH'),zN('AR'),'#c4cf9f');for(let x=712;x<820;x+=18){fans.push([x,zS('FH')+SWA+3,rr(12,16)]);fans.push([x+9,zN('AR')-SWA-3,rr(12,16)]);}
ballpark(765,130);
{padStair(xE('ROCH'),zS('FH'),zN('AR'),M.pad,20,[SWA,SWA,SWA]);bigBox(890,150,80,56,2,'HOME IMPROVEMENT',{band:0xd86a1f,fg:'#d86a1f'});const F=TF(0,0,0);
 F.lot(xE('ROCH')+4,22,1060,22+18.6*2,true);lotCars(F,xE('ROCH')+4,22,1060,22+18.6*2,true,.3);label(900,100,'HOME IMPROVEMENT',0);}
// ---------- south of Arrow: offices along Haven, the industrial park, the station, the outlets
tract(RR(-562,zS('AR'),xW('ARCH'),zN('JE'),['A','A','W','A']),{swap:true,coll:[],older:true});
tract(RR(xE('ARCH'),zS('AR'),xW('HERM'),zN('JE'),['A','A','A','A']),{older:true,swap:true,coll:[]});
industrial(RR(xE('HERM'),zS('AR'),xW('HAVEN'),zN('JE')),{len:110});
{pad2(xE('HAVEN'),zS('AR'),150,zN('JE'),M.grass,[SWA,SWA,SWA,0]);mapR(xE('HAVEN'),zS('AR'),150,zN('JE'),'#c4cf9f');office(48,285,40,24,5,{front:2});office(48,345,36,22,4,{front:2});
 const F=TF(0,0,0);F.lot(80,262,146,262+18.6*5,false);lotCars(F,80,262,146,262+18.6*5,false,.35);for(let z=260;z<370;z+=20)fans.push([20,z,rr(14,18)]);label(60,310,'CORPORATE CENTER',0);}
industrial(RR(150,zS('AR'),xW('MILL'),zN('JE'),null,[SWA,SWA,0,SWA]),{len:160});
industrial(RR(xE('MILL'),zS('AR'),xW('ROCH'),zN('JE')),{len:160});
padStair(xE('ROCH'),zS('AR'),RAILN,M.dry,20,[SWA,0,SWA]);
for(const q of [[xE('ARCH'),xW('HERM')],[xE('HERM'),xW('HAVEN')],[xE('HAVEN'),382]])industrial(RR(q[0],zS('JE'),q[1],RAILN,null,[SWA,0,SWA,SWA]),{len:120,dep:40});
{pad2(382,zS('JE'),xW('MILL'),RAILN,M.grass,[SWA,0,0,SWA]);mapR(382,zS('JE'),xW('MILL'),RAILN,'#b7b3ab');station(440,476);const F=TF(0,0,0);F.lot(388,zS('JE')+3,464,zS('JE')+3+18.6*2,true);lotCars(F,388,zS('JE')+3,464,zS('JE')+3+18.6*2,true,.5);}
industrial(RR(xE('MILL'),zS('JE'),xW('ROCH'),RAILN,null,[SWA,0,SWA,SWA]),{len:150,dep:36});
tract(RR(-562,zS('JE'),xW('ARCH'),RAILN,['A','W','W','A']),{swap:true,coll:[],older:true});
for(const zb of [[RAILS,zN('SIX')],[zS('SIX'),zN('FOUR')]]){
  industrial(RR(-562,zb[0],xW('ARCH'),zb[1],null,[0,0,0,SWA]),{len:140});industrial(RR(xE('ARCH'),zb[0],xW('HERM'),zb[1]),{len:120});industrial(RR(xE('HERM'),zb[0],xW('HAVEN'),zb[1]),{len:120});
  {pad2(xE('HAVEN'),zb[0],140,zb[1],M.grass,[SWA,SWA,SWA,0]);mapR(xE('HAVEN'),zb[0],140,zb[1],'#c4cf9f');for(let z=zb[0]+30;z<zb[1]-30;z+=70)office(55,z,44,26,zb[0]<600?3:6,{front:2});
   const F=TF(0,0,0);F.lot(84,zb[0]+6,138,zb[0]+6+18.6*Math.floor((zb[1]-zb[0]-12)/18.6),false);lotCars(F,84,zb[0]+6,138,zb[0]+6+18.6*Math.floor((zb[1]-zb[0]-12)/18.6),false,.3);}
  industrial(RR(140,zb[0],xW('MILL'),zb[1],null,[SWA,SWA,0,SWA]),{len:170});
  const xr=Math.min(fwEdge(zb[0]),fwEdge(zb[1]))-2;if(xr-xE('MILL')>60)industrial(RR(xE('MILL'),zb[0],xr,zb[1],null,[SWA,SWA,SWA,0]),{len:160});}
label(330,800,'INDUSTRIAL PARK',1);
industrial(RR(-562,zS('FOUR'),xW('ARCH'),zN('OMP'),null,[SWA,SWA,0,SWA]),{len:140});industrial(RR(xE('ARCH'),zS('FOUR'),xW('HERM'),zN('OMP')),{len:120});industrial(RR(xE('HERM'),zS('FOUR'),xW('HAVEN'),zN('OMP')),{len:120});
{const x0=xE('HAVEN'),x1=xW('MILL');pad2(x0,zS('FOUR'),x1,zN('OMP'),M.pad,[SWA,SWA,SWA,SWA]);mapR(x0,zS('FOUR'),x1,zN('OMP'),'#b7b3ab');
 block(70,1040,60,22,13,{front:1,floors:4,fc:['hwin','hwinW'],sc:['hwin','stucco'],tint:0xe6d0b0,band:0x2f6a5a});block(200,1040,60,22,13,{front:1,floors:4,fc:['hwin','hwinW'],sc:['hwin','stucco'],tint:0xd8c4a8,band:0x7a1f3d});
 for(const p of [[320,1010,0,9],[380,1010,0,17],[440,1010,0,28]])fastFood(p[0],p[1],p[2],p[3]);const F=TF(0,0,0);F.lot(x0+6,1080,x1-6,1080+18.6*5,true);lotCars(F,x0+6,1080,x1-6,1080+18.6*5,true,.35);
 for(let x=x0+10;x<x1;x+=26)fans.push([x,zS('FOUR')+SWA+1.5,rr(13,17)]);label(160,1060,'HOTELS',0);}
const OUT=outlets();
// beyond the freeway (out of reach): a band of plain houses so the far side is not empty
for(let z=-560;z<900;z+=160){const xa=Math.max(fwX(z),fwX(z+160))+46;filler(xa,z,xa+300,z+160);}
filler(-1000,1236,860,1370);
// ---------- districts for the area name on the HUD (first match wins)
const AREAS=[[330,-627,477,-516,'Central Park'],[-241,-250,-160,-118,'Church St Park'],[-156,-250,-15,-118,'Elementary School'],
  [120,-250,245,-135,'Middle School'],[250,-250,352,-135,'Coyote Park'],[15,-130,340,-15,'Sierra Town Center'],[1080,-250,1400,-15,'Rancho Promenade'],[15,15,150,150,'Civic Center'],[15,150,150,226,'The Market Hall'],
  [700,60,830,200,'Ballpark'],[380,390,480,500,'Metrolink Station'],[500,970,830,1210,'Inland Empire Outlets'],[-260,-330,-200,-270,'Aunt Ro\'s Street'],[-1000,-30,1300,30,'Route 66'],[-1000,476,1000,1210,'Industrial Park'],
  [-1000,236,1000,476,'Arrow Corridor'],[-500,-500,-10,-20,'Terra Linda'],[-1000,-20,0,236,'Old Cucamonga'],[0,-520,840,-20,'Terra Vista'],[840,-700,1500,-20,'Etiwanda'],[-1000,-760,1500,-500,'Alta Loma'],[0,0,1000,236,'Haven Corridor']];
for(const a of [[-250,-380,'TERRA LINDA'],[400,-380,'TERRA VISTA'],[1000,-380,'ETIWANDA'],[-360,140,'OLD CUCAMONGA']])label(a[0],a[1],a[2],1);
// quiet zones (school grounds): nothing spawns or is fought over there. The old name is kept for the modules that use it.
function inQuiet(x,z){for(const q of QUIET)if(x>q[0]&&x<q[2]&&z>q[1]&&z<q[3])return true;return false;}
const inCemetery=inQuiet;
