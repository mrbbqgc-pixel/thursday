// =====================================================================
// 08 MISSION: THURSDAY's stages, garrisons, reinforcements, checkpoints, the squad's lines, Bobo's fight, the command post, survival
// =====================================================================
// The THURSDAY mission in the shared world frame (origin Haven Ave x Foothill Blvd, x east, z south, 30% distances).
// talk: [seconds after the stage starts, who, line]; outro: the same, from the moment the stage is done.
// warp: a far stage. When the stage before it is done the screen fades to black on warpLine, and everyone is set down at its spawn (banner warpBan).
// chase: the trail. Bobo follows on his scooter, chase metres behind the start; the bikes come from the bike module when it is there.
const ST=[
 {key:'street',title:'Clear the security patrol off Aunt Ro\'s street',x:-84,z:-404,r:46,type:'eliminate',spawn:[-60.3,-366.6,1.758], // spawn: the start house's driveway, facing Mesada St
  groups:[{x:-82,z:-399,r:8,units:{rifle:2}},{x:-102,z:-416,r:9,units:{rifle:1,rush:1}},{x:-71,z:-428,r:8,units:{rifle:2}}],marks:0,reinf:{at:.5,n:3,kinds:['rifle','rush'],dir:[-1,0]},
  talk:[[0,'AUNT RO','Ray. Wake up. There are men in khakis on my street, and they are standing on the Hendersons\' lawn.'],[4,'RAY','It\'s seven in the morning.'],
   [7.5,'AUNT RO','It\'s Thursday. Get them off my street. Junebug, Mr. Pennington, go with him.'],[11.5,'JUNEBUG','Cuz! Welcome to the suburbs! It\'s not usually like this. Usually it\'s leaf blowers.']],
  outro:[[0,'AUNT RO','Street is clear. Now the cul-de-sac. The neighbours are trying to get their cars out.']]},
 {key:'culdesac',title:'Hold the cul-de-sac while the neighbours get out',x:-65.3,z:-450,r:26,type:'hold',time:45,spawn:[-67,-432,0], // the Sago Ct bulb
  waves:[{t:3,n:4,kinds:['rifle','rush'],dir:[-1,0]},{t:16,n:5,kinds:['rifle','rifle','rush'],dir:[0,1]},{t:30,n:5,kinds:['rifle','rush','heavy'],dir:[-1,0]}],
  talk:[[0,'AUNT RO','Hold the cul-de-sac. Nobody leaves without their good casserole dish, and that takes time.'],
   [5,'KINGSLEY','(loudspeaker) Residents of Terra Linda, this is Chet Kingsley. Please stay indoors while we improve your lifestyle.'],
   [12,'MR. PENNINGTON','Here they come. Through the side yards. Over my roses.'],[22,'JUNEBUG','Mr. P, how many you got? I got like... forty.'],[25,'MR. PENNINGTON','You have two, son.']],
  outro:[[0,'AUNT RO','Everybody is out. Good. Kingsley has the strip mall on Route 66 now. Go take it back. I need stamps.']]},
 {key:'route66',title:'Route 66: clear the strip mall and the gas station',x:-120,z:30,r:60,type:'eliminate',spawn:[-250,-60,PI],
  warp:true,warpLine:['JUNEBUG','Foothill is a long walk, cuz. Everybody in the minivan.'],warpBan:['ROUTE 66','FOOTHILL BLVD'],
  groups:[{x:-200,z:-6,r:12,units:{rifle:2}},{x:-150,z:32,r:22,units:{rifle:3,rush:1}},{x:-62,z:25,r:14,units:{rifle:2,heavy:1}}],marks:1,reinf:{at:.5,n:4,kinds:['rifle','rush'],dir:[1,0]},
  talk:[[0,'AUNT RO','Kingsley has the strip mall and the gas station on Foothill. That is where I buy my lottery tickets. Clear it.'],
   [5,'JUNEBUG','The donut place is in there, cuz. If they touched the donut place, it\'s personal.'],[10,'RAY','They put a checkpoint on Route 66. Isn\'t that, like, a historic road?'],
   [14,'MR. PENNINGTON','Watch the roofs, son. Security guards love a roof.']],
  outro:[[0,'AUNT RO','The strip mall is ours. Next, the Market Hall on Haven. They are eating the free samples.']]},
 {key:'market',title:'Retake the Market Hall on Haven',x:40,z:205,r:50,type:'capture',spawn:[-4,135,PI],
  groups:[{x:6,z:170,r:10,units:{rifle:2}},{x:40,z:185,r:16,units:{rifle:3,rush:1}},{x:42,z:212,r:18,units:{rifle:2,rush:1,heavy:1}}],marks:1,reinf:{at:.45,n:4,kinds:['rifle','rifle','rush'],dir:[0,1]},
  talk:[[0,'JUNEBUG','The Market Hall! Best tacos in the Inland Empire, and the security guards are eating them. For free.'],
   [5,'AUNT RO','Retake the hall. Do not shoot the espresso machine. It was a gift to the community.'],
   [10,'KINGSLEY','(loudspeaker) Attention diners. The Market Hall is now a Kingsley Prime Lifestyle Experience. Please enjoy responsibly.'],
   [15,'RAY','I just wanted a breakfast burrito.']],
  outro:[[0,'AUNT RO','The hall is ours. Ray, the Civic Center is just north of you. There is... a situation.']]},
 {key:'trail',title:'Ride the Pacific Electric Trail to Central Park',x:420,z:-560,r:30,type:'chase',spawn:[6,-637,-PI/2],chase:42,
  warp:true,warpLine:['JUNEBUG','I know a shortcut. It goes through the Hendersons\' backyard.'],warpBan:['PACIFIC ELECTRIC TRAIL','THE HAVEN TRAILHEAD'],
  groups:[{x:140,z:-630,r:8,units:{rifle:2}},{x:265,z:-642,r:8,units:{rifle:1,rush:1}},{x:405,z:-606,r:10,units:{rifle:2}}],marks:0,
  talk:[[0,'JUNEBUG','Lowriders, cuz! The Pacific Electric Trail runs all the way to Central Park. Nobody catches us on these.'],
   [4.5,'AUNT RO','Ray. Junebug. A very large man on a very small scooter is coming up the trail behind you. That is Bobo. Pedal.'],
   [9.5,'BOBO','KINGSLEY BOYS! YOU TOWED MY CAR!'],[13,'RAY','I don\'t even have a car! This is Junebug\'s bike!'],
   [17,'JUNEBUG','Don\'t slow down, cuz! If he gets close, he swings!'],[24,'MR. PENNINGTON','I\'m at Central Park, son. Bring him to the lawn. Plenty of room on the lawn.']],
  outro:[[0,'BOBO','End of the trail, bike boy. Get off the bike.'],[2.6,'AUNT RO','Knock him down, Ray. Do NOT kill him. He is a neighbour, and he is on the board.']]},
 {key:'bobo',title:'Knock Bobo down on the Central Park lawn',x:420,z:-541,r:45,type:'boss',spawn:[420,-588,PI],
  talk:[[0,'JUNEBUG','Bobo used to wrestle. On TV. He threw a guy through a buffet table once. Two buffet tables.'],
   [4.5,'MR. PENNINGTON','When he puts his head down, step aside, son. Then let him have it.'],[9.5,'AUNT RO','And mind the lawn. The city just reseeded it.']],
  outro:[[1,'AUNT RO','Bobo is with us now. Lord help Kingsley Prime.']]},
 {key:'promenade',title:'Fight down the Promenade to the fountain',x:1150,z:-160,r:45,type:'capture',spawn:[1150,-12,0],
  warp:true,warpLine:['JUNEBUG','Everybody in the van! Bobo, you take the scooter.'],warpBan:['RANCHO PROMENADE','TWENTY MINUTES LATER'],
  groups:[{x:1150,z:-55,r:12,units:{rifle:2}},{x:1150,z:-105,r:16,units:{rifle:2,rush:1}},{x:1150,z:-160,r:22,units:{rifle:3,heavy:1,rush:1}},{x:1150,z:-215,r:14,units:{rifle:2}}],
  marks:2,reinf:{at:.5,n:4,kinds:['rifle','rush'],dir:[0,-1]},
  talk:[[1,'AUNT RO','Kingsley moved his people into the Promenade. They closed the fountain. On a THURSDAY.'],[5.5,'BOBO','My car is here. I can feel it.'],
   [9.5,'KINGSLEY','(loudspeaker) Shoppers, the Promenade is closed for a private lifestyle event. Your loyalty points will not be honored.'],
   [15,'JUNEBUG','Straight down the main street, cuz. Do not stop at the pretzel place. I know you want to.']],
  outro:[[0,'BOBO','Not here. They took my car to the outlets. With Princess\'s bed in the back seat.'],
   [3,'AUNT RO','The outlets are where Kingsley set up his command post. End this. I have book club at seven.']]},
 {key:'lot',title:'Storm the outlets parking lot',x:440,z:1105,r:55,type:'eliminate',spawn:[420,1018,PI],
  warp:true,warpLine:['JUNEBUG','Next stop, the outlets. I know a shortcut. It\'s the freeway.'],warpBan:['INLAND EMPIRE OUTLETS','THURSDAY, 11:40 AM'],
  groups:[{x:430,z:1060,r:16,units:{rifle:3}},{x:450,z:1120,r:18,units:{rifle:2,rush:2}},{x:440,z:1170,r:14,units:{rifle:2,heavy:1}}],marks:1,reinf:{at:.5,n:4,kinds:['rifle','rush','heavy'],dir:[1,0]},
  talk:[[1,'AUNT RO','Kingsley\'s command post is in the south-west court. Clear the parking lot first.'],[5.5,'JUNEBUG','My kiosk is in there. Phone covers. If they touched my phone covers...'],
   [10,'MR. PENNINGTON','Long sightlines, son. Stay low between the cars.'],[16,'KINGSLEY','(loudspeaker) This is Chet Kingsley. I would like to speak to whoever is in charge of the HOA.'],
   [20,'AUNT RO','Oh, you will, Chet.']],
  outro:[[0,'BOBO','THERE. My car! On the tow truck, next to the command post!']]},
 {key:'cmd',title:'Cut the power at Kingsley\'s command post',x:540,z:1170,r:4.6,type:'plant',spawn:[470,1165,-PI/2],defend:20,away:[-30,-8],last:true,endT:7.5,
  groups:[{x:532,z:1162,r:12,units:{rifle:3,heavy:1}},{x:512,z:1180,r:10,units:{rush:2}}],marks:0,
  waves:[{t:2,n:4,kinds:['rifle','rush'],dir:[1,0]},{t:10,n:4,kinds:['rifle','rifle','heavy'],dir:[0,-1]}],
  talk:[[0,'AUNT RO','The generator behind the command post runs everything. Get on the panel and overload it.'],[4.5,'RAY','Shouldn\'t somebody call the police?'],
   [7.5,'AUNT RO','I called the HOA. That is better.']],
  outro:[[0,'KINGSLEY','(loudspeaker) Okay. Okay! The lifestyle district is... postponed. Indefinitely.'],[2.5,'BOBO','I got my car back. Princess, Daddy is coming home.'],
   [5,'AUNT RO','Mission complete, Ray. I\'m pulling up in the minivan. Wipe your feet.']]}];
const SURV={x:-65.3,z:-450,spawn:[-65.3,-444,0]}; // survival: hold the cul-de-sac, the Sago Ct bulb (the co-op guests start here too)
const SQUAD=[['june','JUNEBUG'],['penn','PENNINGTON']];
// what the squad says. {d} is a direction
const VOX={
  june:{contact:['Yo! Khakis, {d} side!','Cuz! {d}! They\'re {d}!','Polo shirts to the {d}. So many polo shirts.'],down:['Junebug is down! Ray, help your cousin up. Stand next to him.','Junebug is hit! Get over there, Ray. He owes me rent.'],
    up:['I\'m good! I\'m good. Nobody saw that.','I\'m up! Tell my kiosk I love it.'],nade:['Grenade! GRENADE! Move, cuz!','Something just bounced over here! Move!']},
  penn:{contact:['Movement, {d}. Polo shirts.','Contact, {d}. They\'re on the Hendersons\' lawn again.','{d}. I see him.'],down:['Mr. Pennington is down! Ray, get him up. He is the HOA treasurer.','Mr. Pennington is hit! Stand by him, Ray. He is too stubborn to stay down.'],
    up:['Just a scratch. Mostly my pride.','Back on my feet. Where were we.'],nade:['Grenade, son. I\'d move.','Grenade. Everybody off the lawn.']},
  bobo:{contact:['Over there. {d}. Bobo sees them.','{d}. Leave them to Bobo.'],down:['Bobo is down! Give him a minute, Ray. He has done this on live television.'],up:['Bobo is UP.','Bobo is back. Bobo is still angry.']}};
const vox=(s,k)=>RP((VOX[s.kind]||VOX.june)[k]);
const BOBO_LINES={spot:['YOU. Kingsley boy. Where. Is. My. CAR.'],charge:['Ten years in the ring, kid!','Hold STILL!','This one is for my car!','Princess, close your eyes!'],
  grab:['Gotcha. Up you go.','Come here, little guy.'],swing:['Clothesline TIME!','Bobo is coming through!','Get OFF that bike!'],whiff:['Whoa. Whoa. WHOA.','Missed. Bobo meant to do that.'],wall:['Ow. Who put that there.','That wall was not there yesterday.'],hurt1:['Princess hits harder than that. She weighs four pounds.'],hurt2:['Okay. Now Bobo is mad.']};
const BOSS_TALK=[[0,'BOBO','Okay. OKAY. Bobo is sitting down. My knees are done.'],[2.6,'RAY','I\'m not with them, man. I don\'t even have a car.'],
  [5.4,'BOBO','...No car? Then who towed MY car?'],[8,'AUNT RO','Kingsley Prime did, Bobo. They painted your curb red last night. Without a permit.'],
  [11.2,'BOBO','With Princess\'s bed in the back seat. ...Where are they.'],[14,'JUNEBUG','The Promenade, big man. Ride with us. Or, you know. Take the scooter.']];
const KQ=[['RAY','Should\'ve stayed in the city.'],['RAY','That\'s one. I think. I wasn\'t counting.'],['RAY','This was supposed to be a quiet neighbourhood.'],['JUNEBUG','Ohh! Cuz! You see that?'],
  ['JUNEBUG','That\'s a lifetime ban from the food court, buddy.'],['MR. PENNINGTON','Good shot. Mind the hydrangeas.'],['MR. PENNINGTON','Clean. Like my edging.'],
  ['AUNT RO','That is a VIOLATION of the CC&Rs.'],['AUNT RO','And STAY off the grass.'],['AUNT RO','Write him up, Ray.']],
  KQA=[['JUNEBUG','I got one! Did anybody see? Nobody saw.'],['MR. PENNINGTON','Got him. Off my lawn.'],['JUNEBUG','That one\'s going on the kiosk flyer.']],
  CKPT=[['AUNT RO','Back on your feet, Ray. We are not done.'],['AUNT RO','From the top. And stay out of the flower beds this time.'],['JUNEBUG','Okay, cuz. Again. But cooler this time.'],['MR. PENNINGTON','Deep breath, son. Again.']];
const MS={knocks:0,fading:false,knockT:0,chaser:null,chaseL:[],chasePos:null,parkS:null,stall:0,tip:0,i:-1,st:null,prog:0,t:0,phase:'',init:1,reinfDone:false,waveK:0,done:false,nextT:0,plantT:0,defT:0,loadout:null,jam:null,surv:null,
  boss:null,bossDown:false,talkT:0,npc:null,q:[],clock:0,kqT:0};
const OBJ={text:'',sub:'',prog:0,x:0,z:0,y:1.8,show:false};
const TIPS=isTouch?['Tap AIM to look down the sights. CROUCH behind cars and block walls; the security guards do the same.','Hostiles show on the minimap when they fire. Red arcs point to where shots come from.','NADE throws a grenade. USE swaps your weapon for one on the ground. Red barrels and fuel pumps explode.']
  :['Hold the right mouse button to aim down the sights. Crouch with C behind cars and block walls; the security guards do the same.','Hostiles show on the minimap when they fire. Red arcs point to where shots come from.','G throws a grenade. F swaps your weapon for one on the ground. Red barrels and fuel pumps explode.'];
// radio lines on a timer: [seconds from now, who, line]
function sayLater(L){if(!L)return;for(const l of L)MS.q.push({t:MS.clock+l[0],who:l[1],text:l[2]});}
function updTalk(dt){MS.clock+=dt;for(let k=0;k<MS.q.length;k++){const q=MS.q[k];if(q.t<=MS.clock){MS.q.splice(k,1);k--;radio(q.who,q.text);}}}
// now and then someone has something to say about a kill
function killQuip(byPlayer){if(G.mode!=='mission'&&G.mode!=='survival')return;if(MS.clock<MS.kqT||R()>(byPlayer?.35:.25))return;MS.kqT=MS.clock+22;const q=RP(byPlayer?KQ:KQA);radio(q[0],q[1]);}
const squadOK=()=>!(MP.on&&(mpMode().vs||MP.players.size>1)); // with other players there is no AI squad
const plantPrompt=()=>'Hold <b>'+(isTouch?'USE':'F')+'</b> to overload the generator',PLANT_AWAY='Get clear of the generator';
const waveQ=[];
function aliveFoes(tag){let n=0;for(let k=0;k<foes.length;k++)if(foes[k].alive&&(!tag||foes[k].tag===tag))n++;return n;}
function foesNear(x,z,r){let n=0;for(let k=0;k<foes.length;k++){const s=foes[k];if(s.alive&&s.y0<.5&&Math.hypot(s.x-x,s.z-z)<r)n++;}return n;}
function spotNear(x,z,r,tries){for(let k=0;k<(tries||30);k++){const a=R()*TAU,d=Math.sqrt(R())*r,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(freeSpot(px,pz))return[px,pz];}return null;}
function garrison(grp,tag){const covers=lowCover.filter(c=>Math.hypot(c[0]-grp.x,c[1]-grp.z)<grp.r);
  for(const kind in grp.units)for(let k=0,n=Math.max(1,Math.round(grp.units[kind]*coScale()));k<n;k++){let p=null;if(covers.length&&R()<.7){const c=RP(covers);p=spotNear(c[0],c[1],2.6,12);}
    if(!p)p=spotNear(grp.x,grp.z,grp.r,40);if(!p)continue;const o={tag,post:{x:p[0],z:p[1]},yaw:Math.atan2(-(P.x-p[0]),-(P.z-p[1]))+R2(-1.2,1.2)};
    if(kind==='rifle'&&R()<.35){const q=spotNear(p[0],p[1],14,10);if(q)o.post2={x:q[0],z:q[1]};}addSoldier(1,kind,p[0],p[1],o);}}
function spawnMark(pos,tag){return addSoldier(1,'mark',pos.x,pos.z,{y0:pos.y,isStatic:true,tag,yaw:Math.atan2(-(P.x-pos.x),-(P.z-pos.z))});}
function roofSpot(x,z,minD,maxD){let best=null,bs=-1;for(let k=0;k<buildings.length;k++){const b=buildings[k];if(!b.flat||b.h<3.2||b.h>7)continue;const d=Math.hypot(b.x-x,b.z-z);if(d<minD||d>maxD)continue;
    const sc=R();if(sc>bs){bs=sc;best=b;}}
  return best?{x:clamp(x,best.x-best.w/2+.9,best.x+best.w/2-.9),y:best.h,z:clamp(z,best.z-best.d/2+.9,best.z+best.d/2-.9)}:null;}
// reinforcements arrive from a street corner out of the player's sight and head for (tx,tz)
function spawnWave(n,kinds,tx,tz,dir,tag){n=Math.min(Math.round(n*coScale()),foeCap()+2-aliveFoes());if(n<=0)return 0;const H=humans();let best=null,bs=-1e9;
  for(let k=0;k<50;k++){const s=RP(SPN);let dP=H.length?1e9:Math.hypot(s[0]-tx,s[1]-tz);for(const h of H)dP=Math.min(dP,Math.hypot(s[0]-h.x,s[1]-h.z));if(dP<55||dP>150||!freeSpot(s[0],s[1]))continue;
    let sc=-Math.abs(dP-95)*.02+R();if(dir){const dx=s[0]-tx,dz=s[1]-tz,l=Math.hypot(dx,dz)||1;sc+=(dx*dir[0]+dz*dir[1])/l*1.5;}
    for(const h of H)if(los(s[0],1.6,s[1],h.x,(h===P?P.y:h.y0)+1.6,h.z)){sc-=3;break;}if(sc>bs){bs=sc;best=s;}}
  if(!best)return 0;
  for(let k=0;k<n;k++){const p=spotNear(best[0],best[1],6,12)||best;waveQ.push({t:k*.35,kind:kinds[Math.floor(R()*kinds.length)],x:p[0],z:p[1],tag});}
  if(G.lkp.age>10){G.lkp.x=tx;G.lkp.z=tz;G.lkp.age=6;}return n;}
function updWaves(dt){for(let k=waveQ.length-1;k>=0;k--){const w=waveQ[k];w.t-=dt;if(w.t<=0){waveQ.splice(k,1);const s=addSoldier(1,w.kind,w.x,w.z,{aware:true,tag:w.tag});s.lkx=G.lkp.x;s.lkz=G.lkp.z;}}}
// Kingsley's command post (the objective of the 'plant' stage): a generator trailer with its control panel and light mast, a canopy
// and a folding table. The names makeJammer/removeJammer stay: the co-op code calls them.
let jamGeo=null;
function jammerGeo(){if(jamGeo)return jamGeo;const b=new GB(),blk=0x1d1f23,dk=0x2a2b2e,gold=KPS_GOLD;
  b.add(GEO.box,0,.38,0,0,0,0,1.6,.14,3.3,dk);for(const s of [-1,1])b.add(GEO.wheel,s*.86,.38,.35,0,0,0,.3,.38,.38,0x1b1a19);b.add(GEO.box,0,.4,-2.25,0,0,0,.12,.1,1.3,dk);
  b.add(GEO.box,0,.52,.1,0,0,0,1.5,1.25,2.7,blk);b.add(GEO.box,0,1.42,.1,0,0,0,1.52,.12,2.72,gold);b.add(GEO.box,0,1.77,.1,0,0,0,1.4,.06,2.5,dk);
  for(const z of [-.7,-.3,.1,.5,.9])b.add(GEO.box,-.76,.75,z,0,0,0,.02,.55,.2,0x15161a);                                   // vents
  b.add(GEO.box,.77,.75,-.75,0,0,0,.06,.6,.75,0x8a8f94);b.add(GEO.ball,.82,1.22,-.5,0,0,0,.06,.06,.06,0xd8412f);b.add(GEO.box,.84,.85,-.95,0,0,.4,.05,.3,.06,0xd8412f); // the panel, its lamp and lever
  b.add(GEO.cyl8,-.4,1.83,.95,0,0,0,.08,.55,.08,0x3a3b3e);b.add(GEO.rod,.45,1.83,1.15,0,0,0,.045,3.3,.045,0x8c9396);b.add(GEO.box,.45,5.1,1.15,0,0,0,.7,.32,.22,0xf2efe2);
  const cx=-3.6;for(const q of [[-1.45,-1.45],[1.45,-1.45],[-1.45,1.45],[1.45,1.45]])b.add(GEO.rod,cx+q[0],0,q[1],0,0,0,.035,2.4,.035,0x8c9396);
  b.add(GEO.box,cx,2.4,0,0,0,0,3.1,.08,3.1,blk);b.add(GEO.box,cx,2.2,-1.56,0,0,0,3.1,.22,.02,gold);b.add(GEO.box,cx,2.2,1.56,0,0,0,3.1,.22,.02,gold);
  b.add(GEO.box,cx,.72,0,0,0,0,1.8,.05,.75,0xdcdcd6);for(const q of [[-.8,-.3],[.8,-.3],[-.8,.3],[.8,.3]])b.add(GEO.rod,cx+q[0],0,q[1],0,0,0,.02,.72,.02,0x55575a);
  b.add(GEO.box,cx-.3,.77,0,0,0,0,.42,.03,.3,0x23252a);b.add(GEO.box,cx-.3,.8,.14,-.3,0,0,.42,.28,.02,0x23252a);b.add(GEO.box,cx+.45,.77,-.1,0,0,0,.18,.28,.12,0x2c2f33);
  return jamGeo=b.build();}
const plantSt=()=>ST.find(t=>t.type==='plant');
function makeJammer(){removeJammer(false);const st=plantSt(),x=st.x,z=st.z,g=new T.Mesh(jammerGeo(),vcMat);g.position.set(x,0,z);g.castShadow=true;
  scene.add(g);const c=solid(x,z,1.7,3.4,1.9);binAdd(c);blockCollider(c);MS.jam={g,c,x,z};}
function removeJammer(boom,rep){const j=MS.jam;if(!j)return;scene.remove(j.g);j.c.off=true;MS.jam=null;
  if(boom){if(MP.on&&MP.host&&!rep)mpEvent('jam',0,[]);explode(j.x,1.2,j.z,9.5,200,true,rep,0);const w=new T.Mesh(jammerGeo(),char);w.position.set(j.x,-.12,j.z);w.scale.set(1,.72,1);scene.add(w);fires.push({x:j.x,y:1.2,z:j.z,t:16,n:0});}}
// THURSDAY has no helicopter. These stay for the co-op code, which shows one on stages marked 'heli' (there are none).
const heli={g:null,on:false,landed:false,x:0,y:0,z:0};
function makeHeli(){}function updHeli(){}function hideHeli(){heli.on=false;}
// warping to a far stage: fade to black as the last stage ends, set everyone down at the new spawn, fade back in
function fadeCut(){const f=el.fade;if(!f)return;f.style.transition='none';f.style.opacity='1';void f.offsetWidth;f.style.transition='opacity 1.4s ease-in .5s';f.style.opacity='0';}
function warpOut(nx){if(MS.fading)return;MS.fading=true;const f=el.fade;if(f){f.style.transition='opacity .7s ease-in';f.style.opacity='1';}if(nx.warpLine)radio(nx.warpLine[0],nx.warpLine[1]);}
const farFrom=sp=>humans().some(h=>Math.hypot(h.x-sp[0],h.z-sp[1])>150);
function safeSpot(sp){return freeSpot(sp[0],sp[1])?[sp[0],sp[1]]:(spotNear(sp[0],sp[1],12,60)||[sp[0],sp[1]]);}
function warpTo(st,i){const p=safeSpot(st.spawn);P.x=p[0];P.z=p[1];P.y=0;P.yaw=st.spawn[2];P.vx=P.vz=P.vy=0;fadeCut();
  for(const a of allies){const q=spotNear(P.x,P.z,6,30)||p;a.x=q[0];a.z=q[1];a.g.position.set(a.x,0,a.z);}
  if(st.warpBan)banner(st.warpBan[0],st.warpBan[1]);if(MP.on&&MP.host)mpEvent('ckpt',0,[i]);} // in co-op the guests are set down at the spawn as well
// ---------- the trail. The bikes are the bike module's (spawnBike, mountBike, dismountBike, bikeMesh); every call is guarded so the game runs without it.
let scootG=null;
function scooterGeo(){if(scootG)return scootG;const b=new GB(),mint=0x9ad8c4,dk=0x2a2b2e; // sized to look tiny under Bobo, who is scaled 1.35
  b.add(GEO.box,0,.1,-.02,0,0,0,.26,.05,.62,mint);b.add(GEO.box,0,.1,.16,0,0,0,.28,.24,.34,mint);b.add(GEO.box,0,.34,.2,0,0,0,.22,.06,.3,0x3a2a20);
  b.add(GEO.box,0,.1,-.34,-.15,0,0,.26,.42,.05,mint);b.add(GEO.cyl8,0,.18,-.37,-.2,0,0,.022,.46,.022,0x8c9396);b.add(GEO.box,0,.62,-.44,0,0,0,.42,.03,.03,dk);
  b.add(GEO.ball,0,.5,-.4,0,0,0,.05,.05,.03,0xf6efd2);for(const z of [-.36,.3])b.add(GEO.wheel,0,.1,z,0,0,0,.06,.1,.1,0x1b1a19);return scootG=b.build();}
function scooterMesh(){const m=new T.Mesh(scooterGeo(),vcMat);m.castShadow=true;return m;}
const bikeApi=()=>typeof spawnBike==='function'&&typeof mountBike==='function';
function offBike(){if(P.bike&&typeof dismountBike==='function'){try{dismountBike();}catch(e){}}}
function chaseStart(st){const back=st.chase+15*Math.min(3,MS.knocks),sx=st.spawn[0]+Math.sin(st.spawn[2])*back,sz=st.spawn[1]+Math.cos(st.spawn[2])*back,p=safeSpot([sx,sz]);MS.chaseL=[];
  const b=addSoldier(1,'bobo',p[0],p[1],{list:MS.chaseL,yaw:st.spawn[2],aware:true});boboPrep(b);boboSet(b,'scoot');b.scoot=scooterMesh();b.g.add(b.scoot);b.swingCD=3;b.whiff=0;MS.chaser=b; // not a hostile: bullets do not stop him
  if(bikeApi()&&!P.bike){try{mountBike(spawnBike(P.x,P.z,P.yaw));}catch(e){}}
  for(const a of allies){if(a.kind==='june'){a.ride=true;if(typeof bikeMesh==='function'&&!a.bikeM){try{a.bikeM=bikeMesh();a.g.add(a.bikeM);}catch(e){a.bikeM=null;}}}
    else if(a.kind==='penn'){a.parked=true;a.g.visible=false;a.x=st.x+6;a.z=st.z+4;}}} // Mr. Pennington waits at the park
function chaseEnd(keep){const b=MS.chaser;if(b){if(keep){MS.chasePos=[b.x,b.z];const m=scooterMesh();m.position.set(b.x,0,b.z);m.rotation.y=b.yaw+.4;m.scale.setScalar(1.35);scene.add(m);MS.parkS=m;}removeSoldier(b);}
  MS.chaser=null;MS.chaseL=[];MS.knockT=0;scootSound(false);
  for(const a of allies){if(a.ride){a.ride=false;if(a.bikeM){a.g.remove(a.bikeM);a.bikeM=null;}}if(a.parked){a.parked=false;a.g.visible=true;const q=spotNear(P.x,P.z,6,30)||[P.x,P.z];a.x=q[0];a.z=q[1];a.g.position.set(a.x,0,a.z);}}}
// Bobo on the scooter: keeps up with whatever speed you go, closes in when you slow down, and swings when he is alongside (the first swing misses;
// after each knock-off he starts 15 m further back, up to three times)
function updChase(s,dt){s.bT+=dt;s.swingCD-=dt;s.mx=0;s.mz=0;s.spd=0;const d=Math.hypot(P.x-s.x,P.z-s.z),pv=P.alive?(P.speed||0):0;
  if(MS.knockT>0){}
  else if(s.bs==='scoot'||s.bs==='swing'){const sp=s.bs==='swing'?Math.max(pv,6):clamp(d>45?pv+4:d>14?pv+.6:pv-.8,5.5,14);moveToward(s,P.x,P.z,sp,null);face(s,s.x+s.mx*3,s.z+s.mz*3,dt,5);
    if(s.bs==='scoot'&&d<3.8&&s.swingCD<=0&&P.alive){boboSet(s,'swing');sndBobo('roar',s.x,s.z);if(R()<.6)radio('BOBO',RP(BOBO_LINES.swing));}
    else if(s.bs==='swing'&&s.bT>=.5){s.swingCD=2.5;if(s.whiff<1||d>3.3){s.whiff++;boboSet(s,'wobble');sndBobo('punch',s.x,s.z);if(R()<.7)radio('BOBO',RP(BOBO_LINES.whiff));}else{boboSet(s,'scoot');knockOff(s);}}}
  else if(s.bs==='wobble'){s.mx=-Math.sin(s.yaw);s.mz=-Math.cos(s.yaw);s.spd=3;if(s.bT>=1.3)boboSet(s,'scoot');}
  stepSoldier(s,dt);animSoldier(s,dt);scootSound(true,s.x,s.z,s.spd);}
function knockOff(s){const kx=P.x-s.x,kz=P.z-s.z,l=Math.hypot(kx,kz)||1;
  if(MP.on){hurt(45,s.x,s.z);if(P.alive){P.vx=kx/l*9;P.vz=kz/l*9;P.vy=4;P.ground=false;}return;} // with other players nobody goes back for one
  MS.knocks++;offBike();P.vx=kx/l*9;P.vz=kz/l*9;P.vy=4.5;P.ground=false;sndBobo('thud',P.x,P.z);boboShake(P.x,P.z,1.2);G.vig=1;
  banner('KNOCKED OFF','BOBO CAUGHT YOU');radio('JUNEBUG','Cuz! He clotheslined you right off the bike!');MS.knockT=2.2;}
// Junebug rides next to you on the trail
function updRider(s,dt){s.mx=0;s.mz=0;s.spd=0;const cy=Math.cos(P.yaw),sy=Math.sin(P.yaw),gx=P.x-cy*2.6+sy*1.6,gz=P.z+sy*2.6+cy*1.6,d=Math.hypot(gx-s.x,gz-s.z);
  if(d>45){const q=spotNear(gx,gz,4,20);if(q){s.x=q[0];s.z=q[1];}}
  if(d>.8){moveToward(s,gx,gz,Math.min(14,1.5+d*2),null);face(s,s.x+s.mx*3,s.z+s.mz*3,dt,6);}else{s.yaw+=clamp(angDiff(P.yaw,s.yaw),-dt*3,dt*3);s.g.rotation.y=s.yaw;}
  s.lowered=true;s.crouch=0;stepSoldier(s,dt);animSoldier(s,dt);}
// Bobo on the squad from the stage after his fight; not before it
function syncBobo(i){const bi=ST.findIndex(t=>t.type==='boss'),b=allies.find(a=>a.kind==='bobo');
  if(i<=bi&&b){removeSoldier(b);allies.splice(allies.indexOf(b),1);}
  else if(i>bi&&!b&&squadOK()){const p=spotNear(P.x,P.z,6,30)||[P.x,P.z],n=addSoldier(0,'bobo',p[0],p[1],{name:'BOBO',aware:true});boboPrep(n);n.yielded=true;n.maxHp=n.hp=n.K.allyHp;boboSet(n,'walk');}}
function stageStart(i,again){MS.i=i;const st=ST[i];MS.st=st;MS.prog=0;MS.t=0;MS.stall=0;MS.tip=0;MS.lastN=-1;MS.hinted=false;MS.phase='';MS.reinfDone=false;MS.waveK=0;MS.done=false;MS.plantT=0;MS.defT=0;G.stage=i;
  MS.boss=null;MS.bossDown=false;MS.talkT=0;if(!again)MS.knocks=0;
  if(st.warp&&farFrom(st.spawn))warpTo(st,i);else if(MS.fading)fadeCut();MS.fading=false;
  if(MS.chaser||allies.some(a=>a.ride||a.parked))chaseEnd(false);if(st.type!=='chase')offBike();
  syncBobo(i);
  MS.loadout={slots:P.slots.map(w=>({id:w.id,mag:w.mag,res:w.res})),cur:P.cur,nades:P.nades};saveGame();
  if(st.groups)st.groups.forEach(g=>garrison(g,st.key));
  for(let k=0;k<(st.marks||0);k++){const r=roofSpot(st.x,st.z,22,62);if(r)spawnMark(r,st.key);}
  if(st.type==='chase')chaseStart(st);
  if(st.type==='boss'){const c=MS.chasePos,p=(c&&Math.hypot(c[0]-st.x,c[1]-st.z)<90&&freeSpot(c[0],c[1]))?c:spotNear(st.x,st.z,6,40)||[st.x,st.z],b=addSoldier(1,'bobo',p[0],p[1],{tag:st.key,yaw:Math.atan2(-(P.x-p[0]),-(P.z-p[1]))});boboPrep(b);b.hp=b.maxHp=b.K.hp*coScale();MS.boss=b;}
  MS.init=Math.max(1,aliveFoes(st.key));
  if(st.type==='plant')makeJammer();
  OBJ.text=st.title;OBJ.sub='';OBJ.prog=0;OBJ.x=st.x;OBJ.z=st.z;OBJ.show=true;
  if(again){const q=RP(CKPT);radio(q[0],q[1]);}else sayLater(st.talk);}
function stageDone(){const st=MS.st;MS.done=true;if(st.type==='chase')chaseEnd(true);MS.nextT=st.endT||(st.type==='reach'?.1:3.2);G.score+=500;sndUi('obj');
  if(st.last)banner('MISSION COMPLETE','KINGSLEY PRIME IS OUT OF RANCHO');else if(st.type!=='reach')banner('OBJECTIVE COMPLETE',st.title.toUpperCase());
  sayLater(st.outro);if(st.type!=='reach'&&!st.last){const p=spotNear(st.x,st.z,7,30);if(p)coCrate(p[0],p[1]);}
  for(const a of allies){if(a.down){a.down=false;a.alive=true;a.up.rotation.z=0;if(a.kind==='bobo')boboSet(a,'up');}if(a.kind==='bobo'&&a.bs==='sit')boboSet(a,'up');a.hp=a.maxHp;}
  if(MS.npc){removeSoldier(MS.npc);MS.npc=null;}}
function stageUpdate(dt){const st=MS.st;if(!st)return;
  if(MS.done){MS.nextT-=dt;const nx=ST[MS.i+1];if(nx&&nx.warp&&MS.nextT<.9&&farFrom(nx.spawn))warpOut(nx);if(MS.nextT<=0){if(MS.i+1<ST.length)stageStart(MS.i+1);else missionWon();}return;}
  MS.t+=dt;const dMe=P.alive?Math.hypot(P.x-st.x,P.z-st.z):1e9;let dP=dMe;for(const m of MP.mates)if(m.alive)dP=Math.min(dP,Math.hypot(m.x-st.x,m.z-st.z)); // the nearest player counts
  const inZone=dP<st.r;OBJ.x=st.x;OBJ.z=st.z;OBJ.y=1.8;
  if(MS.i===0&&!SAVE.tips&&MS.tip<3&&MS.t>16+MS.tip*12){radio('TIP',TIPS[MS.tip++]);if(MS.tip>=3){SAVE.tips=true;saveGame();}}
  if(st.reinf&&!MS.reinfDone&&aliveFoes(st.key)<=MS.init*(1-st.reinf.at)){MS.reinfDone=true;spawnWave(st.reinf.n,st.reinf.kinds,st.x,st.z,st.reinf.dir,st.key);}
  if(st.type==='capture'){const near=foesNear(st.x,st.z,st.r+8);
    if(inZone&&near===0)MS.prog+=dt/6;else if(!inZone)MS.prog=Math.max(0,MS.prog-dt/12);
    // if the last defenders are hiding, mark them on the minimap
    if(inZone&&near>0){MS.stall+=dt;if(MS.stall>9)for(const s of foes)if(s.alive&&Math.hypot(s.x-st.x,s.z-st.z)<st.r+8&&s.revealT<1)s.revealT=1;}else MS.stall=0;
    OBJ.sub=near?'Security guards in the area: '+near:inZone?'Taking it back':'Move to the marker';if(MS.prog>=1)stageDone();}
  else if(st.type==='hold'){if(inZone)MS.prog+=dt/st.time;const el=MS.prog*st.time;
    while(MS.waveK<st.waves.length&&el>=st.waves[MS.waveK].t){const w=st.waves[MS.waveK++];spawnWave(w.n,w.kinds,st.x,st.z,w.dir,st.key);}
    OBJ.sub=inZone?Math.max(0,Math.ceil(st.time-el))+' s to go':'Get back to the cul-de-sac';if(MS.prog>=1)stageDone();}
  else if(st.type==='plant'){const j=MS.jam;
    if(MS.phase===''){OBJ.sub=foesNear(st.x,st.z,26)?'Fight through to the generator':'Overload the generator';
      if(j&&dP<st.r){if(dMe<st.r)G.prompt=plantPrompt();let planting=dMe<st.r&&IN.useHeld;
        if(!planting)for(const m of MP.mates){const pl=MP.players.get(m.pid);if(m.alive&&pl&&pl.use&&Math.hypot(m.x-st.x,m.z-st.z)<st.r){planting=true;break;}}
        if(planting){MS.plantT+=dt;OBJ.sub='Overloading the generator';MS.prog=MS.plantT/2.2*.3;
          if(MS.plantT>=2.2){MS.phase='defend';MS.defT=st.defend;sndUi('pin');radio('AUNT RO','It is going to blow in '+st.defend+' seconds. Keep them off the panel and get back.');}}
        else MS.plantT=Math.max(0,MS.plantT-dt);}}
    else{MS.defT-=dt;const el=st.defend-MS.defT;while(MS.waveK<st.waves.length&&el>=st.waves[MS.waveK].t){const w=st.waves[MS.waveK++];spawnWave(w.n,w.kinds,st.x,st.z,w.dir,st.key);}
      MS.prog=.3+.7*el/st.defend;OBJ.sub='Generator blows in '+Math.max(0,Math.ceil(MS.defT))+' s. '+(dP<11?'GET CLEAR':'You are clear');if(dMe<11&&MS.defT<8)G.prompt=PLANT_AWAY;if(MS.defT<=0){removeJammer(true);stageDone();}}}
  else if(st.type==='eliminate'){const n=aliveFoes(st.key);MS.prog=1-n/MS.init;OBJ.sub='Security guards left: '+n;if(n!==MS.lastN){MS.lastN=n;MS.stall=0;}else MS.stall+=dt;
    // point at the nearest one left once few remain or the hunt has stalled; a marker up in the air means a rooftop
    if(n>0&&(n<=3||MS.stall>18)){let b=null,bd=1e9,high=0;for(const s of foes)if(s.alive&&s.tag===st.key){if(s.revealT<1)s.revealT=1;if(s.y0>2)high++;const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}
      if(b){OBJ.x=b.x;OBJ.z=b.z;OBJ.y=b.y0+1.8;}if(high===n&&!MS.hinted){MS.hinted=true;radio('MR. PENNINGTON','Last one is up on a roof, son. Back off and aim high.');}}
    if(n===0)stageDone();}
  else if(st.type==='boss'){const b=MS.boss;
    if(!MS.bossDown){OBJ.sub=b?'Knock him down. Do not kill him.':'';MS.prog=b?1-b.hp/b.maxHp:0;if(b){OBJ.x=b.x;OBJ.z=b.z;OBJ.y=3.3;}}
    else{if(MS.talkT===0){sayLater(BOSS_TALK);for(const f of foes)if(f.alive&&f.tag===st.key)f.aware=false;}MS.talkT+=dt;MS.prog=1;OBJ.sub='Bobo is thinking it over';if(b){OBJ.x=b.x;OBJ.z=b.z;OBJ.y=3.3;}
      if(MS.npc){MS.npc.bT+=dt;animSoldier(MS.npc,dt);}
      if(MS.talkT>=16.5)stageDone();}}
  else if(st.type==='chase'){const b=MS.chaser;if(b)updChase(b,dt);
    if(MS.knockT>0){MS.knockT-=dt;OBJ.sub='Bobo got you';if(MS.knockT<=0){restartCheckpoint();return;}}
    else{const gap=b?Math.hypot(b.x-P.x,b.z-P.z):99;OBJ.sub=gap<8?'BOBO IS RIGHT BEHIND YOU':'Bobo is '+Math.round(gap)+' m behind';}
    MS.prog=clamp(1-Math.hypot(P.x-st.x,P.z-st.z)/Math.hypot(st.spawn[0]-st.x,st.spawn[1]-st.z),0,1);if(inZone&&MS.knockT<=0)stageDone();}
  else if(st.type==='reach'){OBJ.sub='';if(inZone)stageDone();}
  OBJ.prog=clamp(MS.prog,0,1);}
function resetWorldState(){clearSoldiers();clearPicks();if(typeof clearBikes==='function')clearBikes();for(const n of nades)scene.remove(n.m);nades.length=0;waveQ.length=0;hideHeli();G.arcs.length=0;G.lkp.age=99;G.vig=0;G.supp=0;
  lifeReset(); // (life) civilians, traffic and birds go; the casualty rule itself lives in 07c
  P.vx=P.vz=P.vy=0;P.hp=100;P.alive=true;P.stam=1;P.crouching=false;P.crouch=0;P.ads=0;P.wantAds=false;P.reloading=false;P.swapT=0;P.swapTo=-1;P.meleeT=0;P.recoil=0;P.pitch=0;P.punch=0;P.roll=0;P.hurtT=9;
  IN.fire=false;IN.useHeld=false;P.spawnT=0;MS.q.length=0;MS.boss=null;MS.bossDown=false;if(MS.npc){removeSoldier(MS.npc);MS.npc=null;}if(el.fade){el.fade.style.transition='none';el.fade.style.opacity='0';}MS.fading=false;
  chaseEnd(false);offBike();if(MS.parkS){scene.remove(MS.parkS);MS.parkS=null;}MS.chasePos=null;}
function placeSquad(){if(!squadOK()){for(const a of allies)removeSoldier(a);allies.length=0;return;} // the other players are the squad
  for(const q of SQUAD)if(!allies.some(a=>a.kind===q[0]))addSoldier(0,q[0],P.x,P.z,{name:q[1],aware:true});
  allies.forEach((a,k)=>{const p=spotNear(P.x+Math.sin(P.yaw)*4,P.z+Math.cos(P.yaw)*4,5,30)||[P.x,P.z];a.x=p[0];a.z=p[1];a.hp=a.maxHp;a.alive=true;a.down=false;a.target=null;a.up.rotation.z=0;a.g.position.set(a.x,0,a.z);a.g.visible=true;
    if(a.kind==='bobo')boboSet(a,'walk');});}
function startMission(stage){G.mode='mission';resetWorldState();removeJammer(false);const st=ST[stage],sp=safeSpot(st.spawn);P.x=sp[0];P.z=sp[1];P.y=0;P.yaw=st.spawn[2];
  giveLoadout();if(stage>0)for(const w of P.slots)w.res=Math.round(WDEF[w.id].max*.72);
  G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};placeSquad();stageStart(stage);
  banner('THURSDAY',stage?'RANCHO CUCAMONGA · THE DAY BEFORE THE WEEKEND':'RANCHO CUCAMONGA · 7:02 AM');}
function restartCheckpoint(){resetWorldState();removeJammer(false);const st=MS.st,sp=safeSpot(st.spawn),L0=MS.loadout;P.x=sp[0];P.z=sp[1];P.y=0;P.yaw=st.spawn[2];
  P.slots=L0.slots.map(w=>({id:w.id,mag:WDEF[w.id].mag,res:Math.max(w.res,Math.round(WDEF[w.id].max*.6))}));P.cur=L0.cur;P.nades=Math.max(3,L0.nades);showWeapon();
  placeSquad();stageStart(MS.i,true);if(MP.on&&MP.host)mpEvent('ckpt',0,[MS.i]);}
function startSurvival(){G.mode='survival';resetWorldState();removeJammer(false);MS.st=null;MS.i=-1;const sp=safeSpot(SURV.spawn);P.x=sp[0];P.z=sp[1];P.y=0;P.yaw=SURV.spawn[2];giveLoadout();
  G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};placeSquad();syncBobo(-1);MS.surv={wave:0,t:4,live:false,left:0};
  OBJ.text='Hold the cul-de-sac';OBJ.sub='';OBJ.prog=0;OBJ.x=SURV.x;OBJ.z=SURV.z;OBJ.show=false;banner('SURVIVAL','HOLD THE CUL-DE-SAC AS LONG AS YOU CAN');
  sayLater([[1.5,'AUNT RO','They just keep coming, Ray. Hold the cul-de-sac. Nobody parks on my street.']]);}
const WAVE_LINES=[['AUNT RO','Another wave. I am writing ALL of them up.'],['JUNEBUG','More khakis! Where do they keep coming from?'],['MR. PENNINGTON','Here we go again. Mind the sprinklers.'],['RAY','I could be on a couch right now.']];
function survivalUpdate(dt){const S=MS.surv;if(!S)return;
  const H=humans();let cx=0,cz=0;for(const h of H){cx+=h.x/H.length;cz+=h.z/H.length;}if(!H.length){cx=SURV.x;cz=SURV.z;} // where the players are, or the cul-de-sac if nobody is standing
  if(!S.live){S.t-=dt;OBJ.sub='Next wave in '+Math.max(0,Math.ceil(S.t))+' s';if(S.t<=0){S.wave++;S.live=true;S.left=Math.round((4+S.wave*2)*coScale());S.st=0;banner('WAVE '+S.wave,'');
      if(S.wave>1&&R()<.6){const q=RP(WAVE_LINES);radio(q[0],q[1]);}
      if(S.wave>=4&&S.wave%2===0){const r=roofSpot(cx,cz,25,60);if(r)spawnMark(r,'sv');}}return;}
  S.st-=dt;if(S.left>0&&S.st<=0){S.st=3;const kinds=S.wave<2?['rifle']:S.wave<4?['rifle','rifle','rush']:['rifle','rifle','rush','heavy'];
    S.left-=spawnWave(Math.min(S.left,4),kinds,cx,cz,null,'sv');}
  const n=aliveFoes()+waveQ.length;OBJ.text='Hold the cul-de-sac · Wave '+S.wave;OBJ.sub='Security guards: '+(n+Math.max(0,S.left));
  if(S.left<=0&&n===0){S.live=false;S.t=7;G.score+=250*S.wave;sndUi('obj');banner('WAVE '+S.wave+' CLEAR','+'+250*S.wave);if(S.wave%2===0){const p=spotNear(cx,cz,8,30);if(p)coCrate(p[0],p[1]);}
    for(const a of allies){if(a.down){a.down=false;a.alive=true;a.up.rotation.z=0;}a.hp=a.maxHp;}}}
function missionUpdate(dt){updTalk(dt);updWaves(dt);if(G.mode==='mission')stageUpdate(dt);else survivalUpdate(dt);}
