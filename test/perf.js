// load-time measurement of the built site: node perf.js [--cpu N] [--mobile] [--artifact] [--runs N] [--profile out.cpuprofile]
// --dir DIR measures another build. Prints: cpuMenu (main-thread CPU ms until the menu is up, the least noisy number), script start (T0), town build (window.__game.buildMs), first menu frame, play-ready (first frames after Start) and
// WebGL program link time, all in ms from navigation start. --cpu N slows the CPU N times (Chrome DevTools Emulation), to approximate a phone.
const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');const http=require('http');
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1];},has=n=>process.argv.includes(n);
const INIT=`(()=>{const P=window.__perf={progs:0,linkMs:0,frames:[]};let gv;Object.defineProperty(window,'__game',{configurable:true,get(){return gv;},set(v){gv=v;P.built=Math.round(performance.now());}});
  for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!C)continue;const lp=C.prototype.linkProgram,gp=C.prototype.getProgramParameter;
    C.prototype.linkProgram=function(p){P.progs++;return lp.call(this,p);};
    C.prototype.getProgramParameter=function(p,n){const t=performance.now();const r=gp.call(this,p,n);P.linkMs+=performance.now()-t;return r;};}
  const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=cb=>raf(t=>{const a=performance.now();cb(t);if(window.__game&&P.frames.length<400)P.frames.push([Math.round(a),Math.round(performance.now()-a),window.__game.G.state]);});})();`;
(async()=>{
  const dir=path.resolve(arg('--dir')||path.join(__dirname,'..'));
  const server=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
    if(p==='/__artifact.html'){const h=fs.readFileSync(path.join(dir,'src/operacion-insurgentes.html'),'utf8').replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/web/vendor/three.min.js').replace(/<link rel="stylesheet"[^>]*>/,'');
      r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end('<!doctype html><html><head><meta charset="utf-8"></head><body>'+h+'</body></html>');return;}
    const f=path.join(dir,p);if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});fs.createReadStream(f).pipe(r);});
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const url='http://127.0.0.1:'+server.address().port+(has('--artifact')?'/__artifact.html':'/');
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const runs=+(arg('--runs')||1),cpu=+(arg('--cpu')||1),out=[];
  for(let k=0;k<runs;k++){
    const mobile=has('--mobile');
    const ctx=await b.newContext(mobile?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}});
    const pg=await ctx.newPage();pg.setDefaultTimeout(300000);await pg.addInitScript(INIT);
    const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    const cdp=await ctx.newCDPSession(pg);await cdp.send('Performance.enable',{timeDomain:'threadTicks'});if(cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
    const prof=arg('--profile');if(prof){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');}
    await pg.goto(url);
    await pg.waitForFunction(()=>window.__perf.frames.length>=3,null,{timeout:300000,polling:100});
    if(prof){const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(prof,JSON.stringify(profile));}
    const m=await pg.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const P=window.__perf;
      return {t0:P.built-window.__game.buildMs,built:P.built,dcl:Math.round(n.domContentLoadedEventEnd),build:window.__game.buildMs,firstFrameStart:P.frames[0][0],firstFrameMs:P.frames[0][1],menuReady:P.frames[0][0]+P.frames[0][1],progsMenu:P.progs,linkMs:Math.round(P.linkMs),
        heapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):0};});
    {const r=await cdp.send('Performance.getMetrics');const g=k=>(r.metrics.find(x=>x.name===k)||{}).value||0;m.cpuMenu=Math.round(g('ThreadTime')*1000);m.taskMenu=Math.round(g('TaskDuration')*1000);m.scriptMenu=Math.round(g('ScriptDuration')*1000);}
    await pg.waitForTimeout(500);
    const t0=await pg.evaluate(()=>performance.now());
    await pg.evaluate(()=>{document.getElementById('btnStart').click();});
    await pg.waitForFunction(()=>{const f=window.__perf.frames;let n=0;for(const x of f)if(x[2]==='play')n++;return n>=2;},null,{timeout:300000,polling:50});
    const p=await pg.evaluate(t0=>{const f=window.__perf.frames.filter(x=>x[2]==='play');return {playReady:Math.round(f[1][0]+f[1][1]-t0),firstPlayFrame:f[0][1],progsPlay:window.__perf.progs};},t0);
    Object.assign(m,p);m.errors=errs.length;out.push(m);console.log(JSON.stringify(m));
    await ctx.close();
  }
  if(runs>1){const med=k=>{const v=out.map(o=>o[k]).sort((a,b)=>a-b);return v[v.length>>1];};const mn=k=>Math.min(...out.map(o=>o[k]));console.log('min',JSON.stringify(Object.fromEntries(Object.keys(out[0]).map(k=>[k,mn(k)]))));console.log('median',JSON.stringify(Object.fromEntries(Object.keys(out[0]).map(k=>[k,med(k)]))));}
  await b.close();server.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
