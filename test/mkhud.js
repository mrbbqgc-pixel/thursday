// writes hud1.json (play screens for the HUD check; run with --ios, --mobile or none): start house with the splash and radio, a firefight, bike, survival
const fs=require('fs'),cov=fs.readFileSync(__dirname+'/hudcov.js','utf8').trim().replace(/^\/\/.*\n/,'');
const S=[{"eval":"document.getElementById('btnStart').click()"},{"wait":600},{"eval":"(()=>{window.__game.setViewMode(true);return window.__game.VIEW.tp})()","log":"third person"},
 {"eval":"(()=>{const g=window.__game;g.sim(45,1/30);return {state:g.G.state,obj:g.OBJ.text,feed:[...document.querySelectorAll('#feed p')].map(p=>p.textContent)}})()","log":"start"},
 {"wait":300},{"shot":"hud-start"},{"eval":cov,"log":"coverage start"},
 {"eval":"(()=>{const g=window.__game;g.sim(150,1/30);g.allies[0].hp=g.allies[0].maxHp*.4;g.P.hp=58;g.radio('JUNEBUG','Cuz, they got a golf cart. A golf cart, Ray.');g.G.toasts.push({t:'+100 Security down'});g.sim(3,1/30);return {hp:g.P.hp,feed:document.querySelectorAll('#feed p').length}})()","log":"fight"},
 {"wait":300},{"shot":"hud-fight"},{"eval":cov,"log":"coverage fight"},
 {"eval":"(()=>{const g=window.__game;for(let k=0;k<8;k++){g.P.hp=100;g.sim(30,1/30);}return {state:g.G.state}})()","log":"quiet"},{"wait":300},{"shot":"hud-quiet"},{"eval":cov,"log":"coverage quiet"},
 {"eval":"(()=>{const g=window.__game;g.startMission(4);g.enterPlay();g.sim(60,1/30);return {bike:!!g.P.bike,obj:g.OBJ.text,stance:document.getElementById('stance').textContent}})()","log":"bike"},
 {"wait":300},{"shot":"hud-bike"},{"eval":cov,"log":"coverage bike"},
 {"eval":"(()=>{const g=window.__game;g.startMission(5);g.enterPlay();g.sim(30,1/30);const B=g.MS.boss;if(B){B.aware=true;B.hp=B.maxHp*.6;}g.sim(5,1/30);return {boss:!document.getElementById('boss').hidden}})()","log":"boss"},
 {"wait":300},{"shot":"hud-boss"},
 {"eval":"(()=>{const g=window.__game;g.startSurvival();g.enterPlay();g.sim(260,1/30);return {obj:g.OBJ.text,sub:g.OBJ.sub,wave:g.MS.surv&&g.MS.surv.wave}})()","log":"survival"},
 {"wait":300},{"shot":"hud-surv"},{"eval":cov,"log":"coverage survival"}];
fs.writeFileSync(__dirname+'/hud1.json',JSON.stringify(S,null,0).replace(/\},\{/g,'},\n {'));
