// HUD coverage: the summed bounding-box area of the visible HUD pieces and touch buttons, as a share of the screen (used by hud*.json)
(()=>{const W=innerWidth,H=innerHeight,sel=['#objPanel','#feed p','#compass','#area','#boss','#mini','#trb .hb','#bc','#kills p','#banT','#banS','.tb','#prompt','#wp','#vitals','#ammo'];
 const vis=e=>{if(!e.getClientRects().length)return 0;let o=1;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||n.hidden)return 0;o*=+s.opacity;}return o>.05;};
 const seen=new Set(),parts=[];let sum=0;
 for(const q of sel)for(const e of document.querySelectorAll(q)){if(seen.has(e)||!vis(e))continue;seen.add(e);let r=e.getBoundingClientRect();
   if(e.id==='banT'&&e.firstChild){const g=document.createRange();g.selectNodeContents(e);r=g.getBoundingClientRect();}
   const w=Math.max(0,Math.min(W,r.right)-Math.max(0,r.left)),h=Math.max(0,Math.min(H,r.bottom)-Math.max(0,r.top)),a=w*h;if(a<1)continue;sum+=a;parts.push((e.id||q)+':'+Math.round(a/W/H*1000)/10);}
 return {pct:Math.round(sum/W/H*1000)/10,parts};})()
