// =====================================================================
// 02c VEHICLES: side profiles extruded across the width, so cars have real hoods, cabins and wheel arches
// Local frame of a vehicle geometry: length along z, width along x, wheels on y=0. Cars of around 2000:
// sedans, pickups, minivans, boxy SUVs, the odd lowrider; parked ones far from the action use a lighter build.
// =====================================================================
function profile(pts,width,bevel,arches,cs){const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);
  // the underside runs front to back with a round cut-out over each wheel
  if(arches){const y=pts[pts.length-1][1];for(const a of arches){s.lineTo(a+.43,y);s.absarc(a,y,.43,0,PI,false);}s.lineTo(pts[0][0],y);}
  s.closePath();const g=new T.ExtrudeGeometry(s,{depth:width-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:cs||3});
  g.translate(0,0,-(width-2*bevel)/2);g.rotateY(PI/2);return weld(g);}
const VEH={};
{ const D=(name,len,wid,h,body,glass,roof,wheels,wr,o)=>{VEH[name]=Object.assign({len,wid,h,body:profile(body,wid,.07,wheels.map(w=>w),3),glass:profile(glass,wid-.32,.05),roof,wheels,wr,
     lite:profile(body,wid,0,null),liteG:profile(glass,wid-.3,0)},o||{});};
  D('sedan',4.7,1.8,1.42,[[-2.3,.3],[-2.35,.62],[-2.28,.88],[-1.5,.95],[1.0,.95],[1.8,.84],[2.3,.7],[2.35,.34]],[[-1.75,.93],[-1.2,1.38],[.25,1.4],[1.0,.93]],[-.5,1.39,1.45,1.48],[1.42,-1.4],.33);
  D('pickup',5.3,1.92,1.75,[[-2.6,.42],[-2.65,.8],[-2.6,1.08],[-.35,1.08],[1.25,1.08],[1.9,1.0],[2.58,.9],[2.65,.44]],[[-.38,1.06],[-.2,1.68],[.85,1.7],[1.42,1.06]],[.32,1.69,1.2,1.62],[1.66,-1.55],.4,{bed:[-1.48,1.085,1.95,1.6]});
  D('minivan',4.95,1.9,1.75,[[-2.45,.36],[-2.5,.9],[-2.42,1.05],[1.2,1.05],[2.2,.86],[2.48,.66],[2.5,.38]],[[-2.42,1.03],[-2.3,1.68],[.9,1.7],[1.9,1.02]],[-.7,1.69,3.2,1.66],[1.55,-1.5],.35);
  D('suv',4.75,1.88,1.85,[[-2.35,.46],[-2.38,1.02],[-2.3,1.12],[1.35,1.12],[2.1,1.0],[2.35,.8],[2.38,.48]],[[-2.28,1.1],[-2.2,1.8],[1.0,1.82],[1.42,1.1]],[-.6,1.81,3.0,1.66],[1.5,-1.45],.4);
  D('van',4.9,1.9,1.95,[[-2.4,.36],[-2.45,.9],[-2.42,1.12],[1.7,1.12],[2.3,1.0],[2.45,.7],[2.45,.4]],[[-2.36,1.1],[-2.3,1.86],[1.25,1.9],[1.78,1.1]],[-.5,1.89,3.5,1.7],[1.5,-1.45],.36);
  D('bus',11,2.6,3.1,[[-5.4,.5],[-5.5,1.2],[-5.46,1.5],[5.2,1.5],[5.5,1.2],[5.5,.5]],[[-5.4,1.48],[-5.38,2.5],[5.0,2.5],[5.36,1.48]],[-.2,2.5,10.5,2.56],[3.6,-3.4],.5,{roofH:.5});
  GEO.wheel=new T.CylinderGeometry(1,1,1,9);GEO.wheel.rotateZ(PI/2);GEO.hub=new T.CylinderGeometry(1,1,1,6,1,true);GEO.hub.rotateZ(PI/2);GEO.wheelL=new T.CylinderGeometry(1,1,1,6,1,false);GEO.wheelL.rotateZ(PI/2);}
const carCols=[0xb3261e,0xf4f0e7,0x2d4a6e,0x8a8f93,0x2b2621,0x3f6b4a,0xc9c2b0,0x7a3b1e,0xf4f0e7,0xd9d2c4,0x6d7f8c,0x9a2a22,0x2f5a5a,0xb9b4a6,0x5a2a4a,0xd8d0b8];
const cars=[];
// draws a vehicle into the paint batch of its chunk and remembers the vertex range, so a wreck can be recoloured in place
function vehicle(type,x,z,alongX,col,dir,lite,low,ryO,yO){const V=VEH[type],ry=ryO!==undefined?ryO:(alongX?PI/2:0)+(dir<0?PI:0),B=bat(M.paint,x,z),v0=B.p.length/3,yb=(lite===2?PADY:0)+(yO||0),ly0=(low?-.12:0)+yb;
  anchor(x,z,()=>{const P=(lx,ly,lz,g,sx,sy,sz,c)=>{const ca=Math.cos(ry),sa=Math.sin(ry);put(M.paint,g,x+lx*ca+lz*sa,ly+ly0,z-lx*sa+lz*ca,ry,sx,sy,sz,c);};
    P(0,0,0,lite?V.lite:V.body,1,1,1,col);P(0,0,0,lite?V.liteG:V.glass,1,1,1,C.glass);
    const rf=V.roof;P(0,rf[1],-rf[0],GEO.box,rf[3],V.roofH||.05,rf[2],type==='bus'?0xf4f0e7:col);
    if(V.bed){const b=V.bed;P(0,b[1],-b[0],GEO.box,b[3],.02,b[2],0x1a1816);}
    for(const wz of V.wheels){if(lite){P(0,V.wr+yb-ly0,-wz,GEO.wheelL,V.wid-.16,V.wr,V.wr,C.tire);continue;}for(const s of [-1,1]){P(s*(V.wid/2-.13),V.wr+yb-ly0,-wz,GEO.wheel,.25,V.wr,V.wr,C.tire);P(s*(V.wid/2-.01),V.wr+yb-ly0,-wz,GEO.hub,.03,V.wr*.5,V.wr*.5,low?0xe0e0e0:0x9a9c9a);}}
    if(!lite){const fz=V.len/2-.02,ly=type==='bus'?1.0:type==='sedan'?.66:.84;
      for(const s of [-1,1]){P(s*(V.wid/2-.32),ly,-fz,GEO.box,.34,.14,.06,0xf2ecd2);P(s*(V.wid/2-.3),ly,fz-.02,GEO.box,.3,.14,.06,0xa02018);}
      P(0,type==='bus'?.62:.4,-fz-.04,GEO.box,V.wid-.1,.16,.12,0x3a3b3c);P(0,type==='bus'?.62:.4,fz+.02,GEO.box,V.wid-.1,.16,.12,0x3a3b3c);}
    if(!yO)blob(x,z,alongX?V.len*.58:V.wid*.72,alongX?V.wid*.72:V.len*.58,lite===2?PADY:0);});
  return{B,v0,v1:B.p.length/3,x,z,w:alongX?V.len:V.wid,d:alongX?V.wid:V.len,h:V.h,type};}
const carType=()=>{const r=rnd();return r<.36?'sedan':r<.58?'pickup':r<.78?'minivan':r<.93?'suv':'van';};
// a parked car is a destructible collider (its index is shared in multiplayer, so generation order must not depend on chance outside rnd())
function car(x,z,alongX,col,type,lite){type=type||carType();const low=type==='sedan'&&rnd()<.06,r=vehicle(type,x,z,alongX,col===undefined?(low?pick([0x6a2a8a,0xb03a1e,0x1f5a8a]):pick(carCols)):col,rnd()<.5?1:-1,lite,low);
  const c=solid(x,z,r.w,r.d,type==='van'?1.9:type==='pickup'||type==='suv'||type==='minivan'?1.6:1.42,0,2);c.hp=260;c.ref=r;cars.push(c);return c;}
function bus(x,z,alongX){const r=vehicle('bus',x,z,alongX,0xe9e5da,1);solid(x,z,r.w,r.d,3,0,0);}
// burn a car out in place: char the paint and let the body sag
function wreck(r){const m=r.B.mesh;if(!m)return;const P=m.geometry.attributes.position,Cc=m.geometry.attributes.color;
  for(let i=r.v0;i<r.v1;i++){const k=.07+Math.random()*.1;Cc.setXYZ(i,k*1.15,k,k*.9);const y=P.getY(i);if(y>.5)P.setY(i,.5+(y-.5)*.8);}
  P.needsUpdate=true;Cc.needsUpdate=true;}
