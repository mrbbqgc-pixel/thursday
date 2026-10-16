// Multiplayer and the vehicles you can borrow: a guest who drives a car is drawn in that car on the host's screen (and the figure is
// hidden), a guest on a lowrider bike is drawn on a bike, getting out shows the figure again, and odd vehicle fields are refused.
const {lab}=require('./mplab');
(async()=>{const L=await lab(2);const {ev,until,ok}=L;
  await ev(0,"new Promise(r=>__game.mpCreate('ANA',e=>r(e)))");const code=await ev(0,'__game.NET.code');
  await ev(1,"new Promise(r=>__game.mpJoin('"+code+"','BETO',2,e=>r(e)))");await until(0,"__game.MP.players.size===2",8000,'two players in the lobby');
  await ev(0,"(__game.mpSetCfg('arena','route66'),__game.mpStart(),1)");for(const k of [0,1])await until(k,"__game.G.state==='play'&&__game.P.alive",8000,'player '+k+' is in the match');
  const gid=await ev(1,'__game.MP.me');
  console.log('--- the guest borrows a car');
  const r=await ev(1,`(()=>{const g=__game,P=g.P,k=g.DRV.cars.find(c=>Math.abs(c.x+164)<2&&Math.abs(c.z-41)<2);P.spawnT=0;P.x=k.x+2.2;P.z=k.z;g.sim(1,1/30);const inCar=g.carEnter(k);g.BOT.on=true;g.BOT.f=1;g.BOT.s=0;return {inCar,type:k.o.type,col:k.o.col}})()`);
  ok(r.inCar,'the guest is in the car',r);
  await L.sleep(1500);await ev(1,"(__game.BOT.f=0,1)");await L.sleep(800);
  const h=await until(0,`(()=>{const g=__game,pl=g.MP.players.get(${gid}),e=g.DRV.rem.get(${gid});if(!pl||!pl.s||!e||!e.g.visible)return false;return {veh:pl.veh,car:[+e.g.position.x.toFixed(1),+e.g.position.z.toFixed(1)],fig:[+pl.s.x.toFixed(1),+pl.s.z.toFixed(1)],figVis:pl.s.g.visible,type:e.type}})()`,6000,'the host draws a car for the guest');
  const gp=await ev(1,"(()=>{const k=__game.P.car;return k?[+k.x.toFixed(1),+k.z.toFixed(1),+(Math.hypot(k.vx,k.vz)).toFixed(1)]:null})()");
  if(h){ok(h.type===r.type&&h.veh[2]===r.col,'the same type and paint as the guest\'s car',[h.type,h.veh]);ok(!h.figVis,'the guest\'s figure is hidden inside it');
    ok(Math.hypot(h.car[0]-gp[0],h.car[1]-gp[1])<3&&Math.hypot(h.car[0]+164,h.car[1]-41)>2,'where the guest has driven it',{host:h.car,guest:gp});}
  console.log('--- the guest gets out, then rides a bike');
  await ev(1,"(__game.carExit(0),1)");
  await until(0,`(()=>{const g=__game,pl=g.MP.players.get(${gid}),e=g.DRV.rem.get(${gid});return pl.veh===0&&(!e||!e.g.visible)&&pl.s.g.visible})()`,4000,'out of the car: the host hides the car and shows the figure');
  const b=await ev(1,`(()=>{const g=__game,P=g.P;let b=null,bd=1e9;for(const q of g.bikes)if(q.world){const d=Math.hypot(q.x+150,q.z-21);if(d<bd){bd=d;b=q;}}P.x=b.x+.8;P.z=b.z;g.sim(1,1/30);g.mountBike(b);g.BOT.on=true;g.BOT.f=1;return {riding:P.bike===b,col:b.col}})()`);
  ok(b.riding,'the guest is on a bike',b);await L.sleep(1200);
  const hb=await until(0,`(()=>{const g=__game,pl=g.MP.players.get(${gid});return pl.veh&&pl.veh[0]===1&&pl.s.bikeM&&pl.s.ride&&pl.s.g.visible?{veh:pl.veh}:false})()`,4000,'the host draws the guest on a bike');
  if(hb)ok(hb.veh[1]===[0x9c1236,0x1557a8,0x6a2a93,0x16805a,0xc4901c].indexOf(b.col),'in the bike\'s colour',[hb.veh,b.col]);
  await ev(1,"(__game.BOT.f=0,__game.BOT.on=false,__game.IN.use=true,1)");
  await until(0,`(()=>{const pl=__game.MP.players.get(${gid});return pl.veh===0&&!pl.s.bikeM&&!pl.s.ride})()`,4000,'off the bike: the host takes the bike away');
  console.log('--- odd vehicle fields');
  const odd=await ev(0,"(()=>{const f=__game.vehRx;return [f(0),f('x'),f([2,1,2,3,99999]),f([2,99,1e9,-5,100]),f([1,7,100,5000]),f([1,-3,100,200]),f([2,NaN,1,1,1]),f([3,1,1,1]),f(new Array(50).fill(1))]})()");
  ok(JSON.stringify(odd)==='[0,0,0,[2,5,16777215,0,100],0,[1,0,100,200],0,0,0]','refused or bounded',odd);
  ok((await ev(0,'__game.G.errN||0'))===0&&(await ev(1,'__game.G.errN||0'))===0,'no errors inside the game loop');
  await L.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
