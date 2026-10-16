// Minifies a script read from stdin with terser and writes it to stdout (used by web/build.py for the game script of index.html).
// Local names are shortened and dead code dropped; property names are kept (the tests and window.__game rely on them).
const {minify}=require('terser');
let src='';process.stdin.setEncoding('utf8');process.stdin.on('data',d=>src+=d);
process.stdin.on('end',async()=>{
  const r=await minify(src,{compress:{passes:2},mangle:true,format:{comments:false,ascii_only:false}});
  process.stdout.write(r.code);
});
