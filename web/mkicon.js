// render icon.svg to the PNG icons at the repo root: NODE_PATH=../test/node_modules node mkicon.js
const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');
(async()=>{
  const svg=fs.readFileSync(path.join(__dirname,'icon.svg'),'utf8');
  // the word mark's font, from the vendor folder (no outside requests)
  const font=fs.readFileSync(path.join(__dirname,'vendor/fonts/saira-stencil-one-latin-400-normal.woff2')).toString('base64');
  const css="@font-face{font-family:'Saira Stencil One';src:url(data:font/woff2;base64,"+font+") format('woff2')}";
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  for(const s of [180,64,192,512]){
    const pg=await b.newPage({viewport:{width:s,height:s},deviceScaleFactor:1});
    await pg.setContent('<style>'+css+'html,body{margin:0;background:#15110c}svg{display:block;width:'+s+'px;height:'+s+'px}</style>'+svg+'<p style="font-family:Saira Stencil One;position:absolute;left:-99px">THU</p>');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(100);
    await pg.screenshot({path:path.join(__dirname,'..','icon-'+s+'.png'),clip:{x:0,y:0,width:s,height:s}});
    await pg.close();
  }
  await b.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
