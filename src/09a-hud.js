// =====================================================================
// 09a HUD: objective panel, compass tape, rotating minimap, waypoint, feeds, tactical map, menus
// =====================================================================
const el={};['hud','menu','mapOver','objText','objFill','squad','compass','area','mini','feed','kills','hpFill','stFill','stance','weapon','mag','res','nades','objBar','stBar','cross','hit','dmg','nade','vig','scope','flash',
  'wp','wpD','prompt','banner','banT','banS','fade','boss','bossFill','stick','knob','menuTitle','menuMsg','menuStats','btnStart','btnSurvival','btnMapMenu','btnQuit','btnUse','bigmap','optSens','optSnd','optShadow','btnAds','btnCrouch','controls','opts']
  .forEach(k=>el[k]=$(k));
// the version shown on the menu. Each revision goes up by 0.001: Update 1.003, 1.004, ...
const GAME_VER='Update 1.004';$('ver').textContent=GAME_VER;
const COL={bone:'#f3e8d3',sun:'#ffb23e',blood:'#d8412f',sky:'#8ec1e6',ink:'#15110c',agave:'#86c2a2'};
function setT(e,v){if(e._v!==v){e._v=v;e.textContent=v;}}
function setH(e,v){if(e._v!==v){e._v=v;e.innerHTML=v;}}
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let bannerT=0;
function banner(t,s){if(MP.on&&MP.host&&mpMode().coop)mpEvent('ban',0,[t,s||'']); // in co-op the host's banners and radio are everybody's
  el.banT.textContent=t;el.banS.textContent=s||'';el.banS.hidden=!s;el.banner.classList.add('on');bannerT=2.6;}
const feedL=[],killL=[];
function radio(who,text){if(MP.on&&MP.host&&mpMode().coop&&who!=='TIP')mpEvent('rad',0,[who,text]);const p=document.createElement('p');p.innerHTML='<b>'+esc(who)+'</b> '+esc(text);el.feed.appendChild(p);feedL.push({p,t:clamp(2.2+String(text).length*.045,3,6)});while(feedL.length>2)el.feed.removeChild(feedL.shift().p);sndUi('radio');}
function killFeed(pts,label){const p=document.createElement('p');p.innerHTML='<b>'+esc(pts)+'</b> '+esc(label);el.kills.appendChild(p);killL.push({p,t:2.2});if(killL.length>3)el.kills.removeChild(killL.shift().p);}
function clearFeeds(){el.area._v='';for(const f of feedL)el.feed.removeChild(f.p);feedL.length=0;for(const f of killL)el.kills.removeChild(f.p);killL.length=0;}
// area name for the HUD: landmarks first, then the districts
function colonia(x,z){if(x<1400&&Math.abs(z-trailZ(x))<TRW+1&&!(x>330&&x<AV.MILL.x&&z>-628))return'Pacific Electric Trail';for(const a of AREAS)if(x>=a[0]&&x<=a[2]&&z>=a[1]&&z<=a[3])return a[4];return'Rancho Cucamonga';}
// game position -> real coordinates through the frame formula (30 % compression about Haven x Foothill)
const SB=Math.sin(ROT_DEG*PI/180),CB=Math.cos(ROT_DEG*PI/180);
function latlon(x,z){return[34.1063-z/33285,117.5759-x/27654];}
const bearing=()=>((ROT_DEG-P.yaw*180/PI)%360+360)%360;
const cg=el.compass.getContext('2d'),mg=el.mini.getContext('2d'),NAMES8=['N','NE','E','SE','S','SW','W','NW'];
function drawCompass(){const W=600,H=36,b=bearing(),ppd=W/110;cg.clearRect(0,0,W,H);cg.textAlign='center';cg.textBaseline='middle';cg.shadowColor='rgba(0,0,0,.8)';cg.shadowBlur=3;
  for(let d=Math.ceil((b-55)/5)*5;d<=b+55;d+=5){const x=W/2+(d-b)*ppd,dd=((d%360)+360)%360;cg.fillStyle=COL.bone;
    if(dd%45===0){cg.font='700 '+(dd%90?19:22)+'px "Saira Condensed","Arial Narrow",Arial,sans-serif';cg.fillStyle=dd===0?COL.sun:COL.bone;cg.fillText(NAMES8[dd/45],x,15);}
    else if(dd%15===0){cg.globalAlpha=.8;cg.fillRect(x-1,25,2,9);cg.globalAlpha=1;}
    else{cg.globalAlpha=.55;cg.fillRect(x-1,28,2,6);cg.globalAlpha=1;}}
  if(OBJ.show){const ob=bearingOf(OBJ.x-P.x,OBJ.z-P.z);let df=((ob-b+540)%360)-180;df=clamp(df,-52,52);const x=W/2+df*ppd;cg.fillStyle=COL.sun;cg.beginPath();cg.moveTo(x,22);cg.lineTo(x+6,29);cg.lineTo(x,36);cg.lineTo(x-6,29);cg.closePath();cg.fill();}
  cg.shadowBlur=0;cg.fillStyle=COL.sun;cg.fillRect(W/2-1.5,0,3,6);}
const MS_=236,MRAD=78;
function drawMini(){const k=MS_/(MRAD*2),c=MS_/2,Rm=MRAD*1.45;mg.clearRect(0,0,MS_,MS_);mg.save();mg.beginPath();mg.arc(c,c,c,0,TAU);mg.clip();mg.translate(c,c);mg.rotate(P.yaw);
  mg.drawImage(mapC,P.x-MX0-Rm,P.z-MZ0-Rm,Rm*2,Rm*2,-Rm*k,-Rm*k,Rm*2*k,Rm*2*k);
  const pt=(x,z,far)=>{let dx=x-P.x,dz=z-P.z;const d=Math.hypot(dx,dz);if(d>MRAD-5){if(!far)return null;dx*=(MRAD-5)/d;dz*=(MRAD-5)/d;}return[dx*k,dz*k,d>MRAD-5];};
  for(const p of picks){const q=pt(p.x,p.z);if(!q)continue;mg.fillStyle=p.kind==='crate'?COL.agave:p.kind==='med'?'#2f7d4f':COL.sun;mg.fillRect(q[0]-3,q[1]-3,6,6);}
  mg.strokeStyle=COL.ink;mg.lineWidth=1.5;
  for(const s of foes){if(!s.alive||s.revealT<=0)continue;const q=pt(s.x,s.z);if(!q)continue;mg.fillStyle=COL.blood;mg.globalAlpha=clamp(s.revealT,.25,1);mg.beginPath();mg.arc(q[0],q[1],5,0,TAU);mg.fill();mg.stroke();mg.globalAlpha=1;}
  for(const s of allies){const q=pt(s.x,s.z,true);mg.fillStyle=s.down?COL.blood:COL.sky;mg.beginPath();mg.arc(q[0],q[1],4.5,0,TAU);mg.fill();mg.stroke();}
  if(MP.on){for(const s of MP.mates){if(!s.g.visible)continue;const q=pt(s.x,s.z,true);mg.fillStyle=s.alive?COL.sky:COL.blood;mg.beginPath();mg.arc(q[0],q[1],4.5,0,TAU);mg.fill();mg.stroke();}
    for(const s of MP.rivals){if(!s.alive||s.revealT<=0)continue;const q=pt(s.x,s.z);if(!q)continue;mg.fillStyle=COL.blood;mg.globalAlpha=clamp(s.revealT,.25,1);mg.beginPath();mg.arc(q[0],q[1],5,0,TAU);mg.fill();mg.stroke();mg.globalAlpha=1;}
    if(mpMode().vs){const A=arena();mg.strokeStyle=COL.sun;mg.lineWidth=2.5;mg.strokeRect((A.x0-P.x)*k,(A.z0-P.z)*k,(A.x1-A.x0)*k,(A.z1-A.z0)*k);mg.strokeStyle=COL.ink;mg.lineWidth=1.5;}}
  if(OBJ.show){const q=pt(OBJ.x,OBJ.z,true);mg.fillStyle=COL.sun;mg.save();mg.translate(q[0],q[1]);mg.rotate(PI/4);mg.fillRect(-5,-5,10,10);mg.strokeRect(-5,-5,10,10);mg.restore();}
  // real north on the rim
  mg.fillStyle=COL.bone;mg.font='700 20px Arial,sans-serif';mg.textAlign='center';mg.textBaseline='middle';const nx=-SB*(c-13),nz=-CB*(c-13);mg.save();mg.translate(nx,nz);mg.rotate(-P.yaw);mg.fillText('N',0,0);mg.restore();
  mg.restore();mg.fillStyle='#ffffff';mg.strokeStyle=COL.ink;mg.lineWidth=2;mg.beginPath();mg.moveTo(c,c-10);mg.lineTo(c+7,c+8);mg.lineTo(c,c+4);mg.lineTo(c-7,c+8);mg.closePath();mg.fill();mg.stroke();}
const wv=new T.Vector3();
function drawWaypoint(){const W=window.innerWidth,H=window.innerHeight,d=Math.hypot(OBJ.x-P.x,OBJ.z-P.z);if(!OBJ.show||d<5){el.wp.hidden=true;return;}
  wv.set(OBJ.x,OBJ.y,OBJ.z).project(camera);let x=wv.x,y=wv.y;if(wv.z>1){x=-x;y=-y;}
  if(wv.z>1||Math.abs(x)>.9||Math.abs(y)>.8){const m=Math.max(Math.abs(x)/.9,Math.abs(y)/.8,1e-3);x/=m;y/=m;if(wv.z>1&&Math.abs(y)<.8&&Math.abs(x)<.9){y=-.8;}}
  el.wp.hidden=false;el.wp.style.left=((x*.5+.5)*W).toFixed(0)+'px';el.wp.style.top=((-y*.5+.5)*H).toFixed(0)+'px';setT(el.wpD,Math.round(d)+' m');}
let hudK=0,nadeEls=[],objNewT=0,areaT=0;
function hud(dt){const w=curW(),D=WDEF[w.id];hudK++;
  const key=OBJ.text+'|'+OBJ.sub;if(el.objText._k!==key){if(el.objText._t!==OBJ.text){el.objText._t=OBJ.text;el.objText.classList.add('new');objNewT=3;} // a new objective shows in the sun colour for a moment
    el.objText._k=key;el.objText.innerHTML=esc(OBJ.text)+(OBJ.sub?'<span class="lbl">'+esc(OBJ.sub)+'</span>':'');}
  if(objNewT>0){objNewT-=dt;if(objNewT<=0)el.objText.classList.remove('new');}
  const pw=Math.round(OBJ.prog*100);if(el.objFill._v!==pw){el.objFill._v=pw;el.objFill.style.width=pw+'%';el.objBar.hidden=pw<=0;}
  if(el.squad.children.length!==allies.length){el.squad.textContent='';for(const a of allies){const r=document.createElement('div');r.className='sq';r.innerHTML='<span>'+esc(a.name)+'</span><div><i></i></div>';el.squad.appendChild(r);a.row=r;a.bar=r.querySelector('i');}}
  let sqN=0;for(const a of allies){if(!a.row)continue;const v=Math.round(clamp(a.hp/a.maxHp,0,1)*100);if(a.bar._v!==v){a.bar._v=v;a.bar.style.width=v+'%';}const dn=!!a.down;if(a.row._d!==dn){a.row._d=dn;a.row.classList.toggle('down',dn);}const ok=!dn&&v>=70;if(a.row._o!==ok){a.row._o=ok;a.row.classList.toggle('ok',ok);}if(!ok)sqN++;}
  {const h=sqN===0;if(el.squad._h!==h){el.squad._h=h;el.squad.hidden=h;}} // the squad shows only while someone is hurt or down
  const hp=Math.max(0,Math.ceil(P.hp));if(el.hpFill._v!==hp){el.hpFill._v=hp;el.hpFill.style.width=hp+'%';el.hpFill.classList.toggle('low',hp<35);}
  const st=Math.round(P.stam*100);if(el.stFill._v!==st){el.stFill._v=st;el.stFill.style.width=st+'%';el.stBar.classList.toggle('full',st>=100);}
  setT(el.stance,P.bike?'RIDING':P.crouch>.5?'CROUCHED':'');setT(el.weapon,D.name+(P.reloading?' · RELOADING':''));setT(el.mag,String(w.mag));
  const low=w.mag<=D.mag*.25;if(el.mag._l!==low){el.mag._l=low;el.mag.classList.toggle('low',low);}setT(el.res,'/ '+w.res);setT(el.nades,String(P.nades));
  // crosshair follows the real spread ((mech) in third person the lines stay up while aiming: there are no sights)
  const scoped=D.scope&&P.ads>.9,showX=!scoped&&(P.ads<.6||VIEW.on)&&!P.sprinting&&P.alive,showC=!scoped&&P.alive&&!P.sprinting;if(el.cross._s!==showC){el.cross._s=showC;el.cross.hidden=!showC;}
  if(el.cross._t!==showX){el.cross._t=showX;for(let k=0;k<4;k++)el.cross.children[k].hidden=!showX;}if(el.scope._s!==scoped){el.scope._s=scoped;el.scope.hidden=!scoped;}
  if(showX){const gap=Math.round(clamp(curSpread(D)*window.innerHeight/(camera.fov*PI/180),4,60));if(el.cross._g!==gap){el.cross._g=gap;const c=el.cross.children;
      c[0].style.top=(-gap-8)+'px';c[1].style.top=gap+'px';c[2].style.left=(-gap-8)+'px';c[3].style.left=gap+'px';}}
  if(G.hitT>0){G.hitT-=dt;const cls=G.hitKill?'on kill':'on';if(el.hit.className!==cls)el.hit.className=cls;if(G.hitT<=0)el.hit.className='';}
  const ac=el.dmg.children;for(let k=0;k<3;k++){const a=G.arcs[k],e=ac[k];if(a&&a.t>0){a.t-=dt;const dx=a.x-P.x,dz=a.z-P.z,ang=Math.atan2(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw),-dx*Math.sin(P.yaw)-dz*Math.cos(P.yaw));
      e.style.opacity=clamp(a.t,0,1).toFixed(2);e.style.transform='rotate('+ang.toFixed(3)+'rad)';}else if(e.style.opacity!=='0')e.style.opacity='0';}
  {const o=Math.max(G.vig,P.hp<35?.4:0,G.supp*.25);G.vig=Math.max(0,G.vig-dt*1.3);const s=o.toFixed(2);if(el.vig._o!==s){el.vig._o=s;el.vig.style.opacity=s;}}
  {G.flash=Math.max(0,G.flash-dt*1.6);const s=G.flash.toFixed(2);if(el.flash._o!==s){el.flash._o=s;el.flash.style.opacity=s;}}
  setH(el.prompt,G.prompt);const hp2=!G.prompt;if(el.prompt._h!==hp2){el.prompt._h=hp2;el.prompt.hidden=hp2;if(isTouch)el.btnUse.hidden=hp2;}
  // grenade warnings
  let n=0;for(const g of nades){const dx=g.x-P.x,dz=g.z-P.z,d=Math.hypot(dx,dz);if(d>11)continue;let e=nadeEls[n];if(!e){e=document.createElement('i');e.textContent='!';el.nade.appendChild(e);nadeEls[n]=e;}
    e.hidden=false;e.style.transform='rotate('+Math.atan2(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw),-dx*Math.sin(P.yaw)-dz*Math.cos(P.yaw)).toFixed(3)+'rad)';n++;}
  for(let k=n;k<nadeEls.length;k++)nadeEls[k].hidden=true;
  for(let k=feedL.length-1;k>=0;k--){const f=feedL[k];f.t-=dt;if(f.t<=0){el.feed.removeChild(f.p);feedL.splice(k,1);}else if(f.t<1)f.p.style.opacity=f.t.toFixed(2);}
  for(const t of G.toasts)killFeed('',t.t);G.toasts.length=0;
  for(let k=killL.length-1;k>=0;k--){const f=killL[k];f.t-=dt;if(f.t<=0){el.kills.removeChild(f.p);killL.splice(k,1);}else if(f.t<.6)f.p.style.opacity=(f.t/.6).toFixed(2);}
  if(bannerT>0){bannerT-=dt;if(bannerT<=0)el.banner.classList.remove('on');}
  // Bobo's health bar while he is the fight (on the machine that runs him)
  {const B=MS.boss&&!MS.bossDown&&G.mode==='mission'&&MS.st&&MS.st.type==='boss'?MS.boss:null,on=!!B&&B.aware;if(el.boss._on!==on){el.boss._on=on;el.boss.hidden=!on;}
    if(on){const v=Math.round(clamp(B.hp/B.maxHp,0,1)*100);if(el.bossFill._v!==v){el.bossFill._v=v;el.bossFill.style.width=v+'%';}}}
  if(MP.on)mpHud(dt);drawWaypoint();if(hudK%2===0)drawMini();if(hudK%3===0)drawCompass();
  if(hudK%20===0){const a=colonia(P.x,P.z);if(el.area._v!==a){setT(el.area,a);el.area.classList.add('on');areaT=3.5;}} // the place name shows for a few seconds when it changes
  if(areaT>0){areaT-=dt;if(areaT<=0)el.area.classList.remove('on');}}
// ---------- tactical map
function drawBigMap(){if(el.bigmap.width!==MAPW){el.bigmap.width=MAPW;el.bigmap.height=MAPH;}const g=el.bigmap.getContext('2d'),X=x=>x-MX0,Z=z=>z-MZ0;g.drawImage(mapC,0,0);g.textAlign='center';g.textBaseline='middle';
  g.font='600 14px "Saira Condensed","Arial Narrow",Arial,sans-serif';g.fillStyle='rgba(21,17,12,.78)';
  // main street names: avenues run up the page, streets across, repeated along their length where nothing else is written
  const taken=[],free=r=>!taken.some(q=>r[0]<q[0]+q[2]&&r[0]+r[2]>q[0]&&r[1]<q[1]+q[3]&&r[1]+r[3]>q[1]);
  for(const a of NSA)for(const z of [-560,-130,330,800,1120]){if(z<a.z0+30||z>a.z1-30)continue;const w=g.measureText(a.n).width/2+4,r=[X(a.x)-9,Z(z)-w,18,2*w];if(!free(r))continue;taken.push(r);
    g.save();g.translate(X(a.x),Z(z));g.rotate(-PI/2);g.fillText(a.n,0,0);g.restore();}
  for(const b of EWA)for(const x of [-380,-120,250,680,1000,1300]){if(x<b.x0+30||x>b.x1-30||x>fwX(b.z)-40)continue;const w=g.measureText(b.n).width/2+4,r=[X(x)-w,Z(b.z)-9,2*w,18];if(!free(r))continue;taken.push(r);g.fillText(b.n,X(x),Z(b.z));}
  g.save();g.translate(X(fwX(300)+30),Z(300));g.rotate(-1.1);g.fillText('15 FREEWAY',0,0);g.restore();g.fillText('METROLINK',X(-250),Z(TRK)-12);
  const placed=[];for(const l of labels.slice().sort((a,b)=>b.k-a.k)){g.font=(l.k?'700 20px':'600 15px')+' "Saira Condensed","Arial Narrow",Arial,sans-serif';const w=g.measureText(l.t).width+10,h=l.k?24:20;let x=clamp(X(l.x)-w/2,4,MAPW-w-4),y=Z(l.z)-h/2;
    for(let t=0;t<4;t++){if(placed.some(p=>x<p[0]+p[2]&&x+w>p[0]&&y<p[1]+p[3]&&y+h>p[1]))y+=(t%2?-1:1)*(h+2)*(t+1);else break;}placed.push([x,y,w,h]);
    g.fillStyle=l.k?'rgba(21,17,12,.9)':'rgba(21,17,12,.72)';g.fillRect(x,y,w,h);g.fillStyle=l.k?COL.sun:COL.bone;g.fillText(l.t,x+w/2,y+h/2+1);}
  // true north arrow
  g.save();g.translate(MAPW-110,930);g.rotate(Math.atan2(-SB,CB));g.fillStyle='rgba(21,17,12,.85)';g.beginPath();g.arc(0,0,46,0,TAU);g.fill();g.fillStyle=COL.bone;g.beginPath();g.moveTo(0,-36);g.lineTo(10,8);g.lineTo(0,2);g.lineTo(-10,8);g.closePath();g.fill();
  g.font='700 20px Arial,sans-serif';g.fillText('N',0,26);g.restore();
  if(G.state!=='menu'&&G.state!=='win'){if(OBJ.show){g.fillStyle=COL.sun;g.strokeStyle=COL.ink;g.lineWidth=3;g.save();g.translate(X(OBJ.x),Z(OBJ.z));g.rotate(PI/4);g.fillRect(-11,-11,22,22);g.strokeRect(-11,-11,22,22);g.restore();}
    for(const a of allies){g.fillStyle=COL.sky;g.beginPath();g.arc(X(a.x),Z(a.z),7,0,TAU);g.fill();}
    if(MP.on){for(const a of MP.mates)if(a.g.visible){g.fillStyle=a.alive?COL.sky:COL.blood;g.beginPath();g.arc(X(a.x),Z(a.z),7,0,TAU);g.fill();}
      if(mpMode().vs){const A=arena();g.strokeStyle=COL.sun;g.lineWidth=4;g.strokeRect(X(A.x0),Z(A.z0),A.x1-A.x0,A.z1-A.z0);}}
    g.save();g.translate(X(P.x),Z(P.z));g.rotate(-P.yaw);g.fillStyle='#fff';g.strokeStyle=COL.ink;g.lineWidth=3;g.beginPath();g.moveTo(0,-16);g.lineTo(11,12);g.lineTo(0,6);g.lineTo(-11,12);g.closePath();g.fill();g.stroke();g.restore();}}
// ---------- menus
let menuMode='main';
function showMenu(mode,title,msg,stats){menuMode=mode;$('tagline').hidden=mode!=='main';el.menuTitle.textContent=title;el.menuMsg.textContent=msg;el.menuStats.hidden=!stats;el.menuStats.textContent='';
  if(stats)stats.forEach(s=>{const d=document.createElement('div'),a=document.createElement('dt'),b=document.createElement('dd');a.textContent=s[0];b.textContent=s[1];d.append(a,b);el.menuStats.append(d);});
  const mission=G.mode==='mission',mp=MP.on&&mode!=='main';mpClose();
  el.btnStart.textContent=mode==='main'?(SAVE.stage>0?'Continue mission':'Start mission'):mode==='pause'?'Resume':mode==='dead'?(mission?'Retry from checkpoint':'Try again'):mode==='mpend'?'Back to lobby':'Play again';
  el.btnStart.hidden=mode==='mpend'&&!MP.host;
  el.btnSurvival.textContent=mode==='pause'&&mission?'Restart checkpoint':'Survival';el.btnSurvival.hidden=(mode==='pause'&&!mission)||mode==='dead'||mp;
  el.btnQuit.hidden=(mode==='win'&&!mp)||(mode==='main'&&!(SAVE.stage>0));el.btnQuit.textContent=mode==='main'?'New mission':mp?'Leave game':'Quit to menu';
  mpEl.btnMp.hidden=!NET.ok||mode!=='main';el.btnMapMenu.hidden=mode==='mpend';$('lOptDiff').hidden=mp; // in a multiplayer game the host's lobby sets the difficulty
  el.controls.hidden=mode==='dead'||mode==='win'||mode==='mpend';el.menu.hidden=false;el.menu.scrollTop=0;}
function statList(){const s=G.stats,acc=s.shots?Math.round(s.hits/s.shots*100):0,m=Math.floor(s.time/60),sec=Math.floor(s.time%60);
  return[['Score',G.score],['Kills',s.kills],['Headshots',s.heads],['Accuracy',acc+'%'],['Time',m+':'+String(sec).padStart(2,'0')]];}
