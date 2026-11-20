/* Builds the class-period deck. Run: node games/_build.mjs */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

const shell = (file, title, tag, hint, bodyBg, extraCss, script) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Lumen Arcade</title>
<link rel="stylesheet" href="chrome.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:${bodyBg}}
canvas{display:block;width:100%;height:100%;touch-action:none}
#hud{position:fixed;inset:0;pointer-events:none;font-family:"Segoe UI",ui-sans-serif,system-ui,sans-serif;color:rgba(232,238,250,.74)}
#title{position:absolute;top:68px;left:32px;letter-spacing:.28em;text-transform:uppercase;font-size:11px}
#title b{display:block;font-size:28px;color:#f4f7ff;margin-top:6px;letter-spacing:.08em}
#meta{position:absolute;top:28px;right:220px;text-align:right;font-size:12px;letter-spacing:.06em;line-height:1.7}
#hint{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);font-size:13px;text-align:center;background:rgba(8,10,20,.5);border:1px solid rgba(255,255,255,.1);padding:10px 16px;border-radius:999px;transition:opacity 1s;max-width:92vw}
${extraCss || ""}
</style></head><body>
<a class="back" href="../index.html">Arcade</a>
<canvas id="c"></canvas>
<div id="hud"><div id="title">${tag}<b>${title}</b></div><div id="meta"><div id="m1"></div><div id="m2"></div></div>
<div id="hint">${hint}</div></div>
<script src="catalog.js"></script><script src="hopper.js"></script>
<script>
const canvas=document.getElementById("c"),ctx=canvas.getContext("2d");
const dpr=Math.min(devicePixelRatio||1,2);
let W=0,H=0;
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(typeof onResize==="function")onResize();}
addEventListener("resize",resize);resize();
const $=id=>document.getElementById(id);
const hint=$("hint");setTimeout(()=>hint.style.opacity=".16",8000);
const rnd=()=>Math.random();
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
let mx=-999,my=-999,down=false;
addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY;});
addEventListener("pointerdown",e=>{if(e.target.closest("a,button"))return;down=true;mx=e.clientX;my=e.clientY;if(typeof onDown==="function")onDown(e);});
addEventListener("pointerup",e=>{down=false;if(typeof onUp==="function")onUp(e);});
addEventListener("pointerleave",()=>{down=false;});
${script}
if(typeof onResize==="function")onResize();
requestAnimationFrame(function frame(t){draw(t);requestAnimationFrame(frame);});
</script></body></html>
`;

const toys = [];

/* ---------- 1 Rain On Glass ---------- */
toys.push(["rain-on-glass.html", shell("rain","Rain On Glass","weather","drag a drop to steal its path · Space new shower","#14181e","",`
const drops=[];
function shower(){drops.length=0;for(let i=0;i<70;i++)drops.push(make(rnd()*W,rnd()*H));}
function make(x,y){return{x,y,s:1.2+rnd()*2.4,w:0,grab:false};}
let hold=null;
function onDown(){hold=null;let best=26;for(const d of drops){const k=Math.hypot(d.x-mx,d.y-my);if(k<best){best=k;hold=d;}}}
function onResize(){if(!drops.length)shower();}
addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();shower();}});
function draw(){
  ctx.fillStyle="#14181e";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(180,200,220,.05)";
  for(let y=0;y<H;y+=28)ctx.fillRect(0,y,W,1);
  for(const d of drops){
    if(d===hold&&down){d.x=mx;d.y=my;d.w=0;}
    else{d.w+=0.02+d.s*0.01;d.y+=d.s*(0.35+d.w);d.x+=Math.sin(d.y*0.02)*0.4;
      if(d.y>H+10){d.y=-10;d.x=rnd()*W;d.w=0;}}
    const g=ctx.createLinearGradient(d.x,d.y-16,d.x,d.y+10);
    g.addColorStop(0,"rgba(190,220,255,0)");g.addColorStop(1,"rgba(190,220,255,.85)");
    ctx.strokeStyle=g;ctx.lineWidth=d===hold?2.4:1.3;
    ctx.beginPath();ctx.moveTo(d.x,d.y-18);ctx.quadraticCurveTo(d.x+2,d.y,d.x,d.y+8);ctx.stroke();
  }
  $("m1").textContent="drops · "+drops.length;
  $("m2").textContent=hold&&down?"stolen":"falling";
}
`)]);

/* ---------- 2 Firefly Jar ---------- */
toys.push(["firefly-jar.html", shell("f","Firefly Jar","night","click to catch · shake the cursor fast to release","#0c1210","",`
const flies=[];
for(let i=0;i<26;i++)flies.push({x:rnd(),y:rnd(),a:rnd()*6,s:0.3+rnd(),caught:false,ph:rnd()*6});
let px=0,py=0,shake=0;
function draw(t){
  shake=lerp(shake,Math.hypot(mx-px,my-py),0.4);px=mx;py=my;
  if(shake>46)for(const f of flies)f.caught=false;
  ctx.fillStyle="#0c1210";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(210,230,200,.28)";ctx.lineWidth=3;
  const jx=W*0.5,jy=H*0.56,rw=Math.min(W,H)*0.26,rh=Math.min(W,H)*0.34;
  ctx.beginPath();ctx.ellipse(jx,jy,rw,rh,0,0,6.3);ctx.stroke();
  ctx.beginPath();ctx.ellipse(jx,jy-rh,rw*0.55,16,0,0,6.3);ctx.stroke();
  let held=0;
  for(const f of flies){
    f.a+=0.01+f.s*0.01;
    if(!f.caught){f.x+=Math.cos(f.a)*0.003;f.y+=Math.sin(f.a*1.3)*0.003;
      const dx=f.x*W-jx,dy=f.y*H-jy;
      if(dx*dx/(rw*rw)+dy*dy/(rh*rh)<1)f.caught=true;
    } else {held++;
      const ang=f.a*2+f.ph;
      f.x=(jx+Math.cos(ang)*(rw*0.7))/W;f.y=(jy+Math.sin(ang*1.4)*(rh*0.7))/H;}
    const x=f.x*W,y=f.y*H,gl=0.35+0.65*Math.abs(Math.sin(t*0.003+f.ph));
    ctx.fillStyle=\`rgba(210,255,140,\${gl})\`;
    ctx.beginPath();ctx.arc(x,y,f.caught?3.2:2.2,0,6.3);ctx.fill();
  }
  $("m1").textContent="in the jar · "+held; $("m2").textContent="shake · "+shake.toFixed(0);
}
function onDown(){for(const f of flies){if(Math.hypot(f.x*W-mx,f.y*H-my)<20)f.caught=true;}}
`)]);

/* ---------- 3 Constellation Desk ---------- */
toys.push(["constellation-desk.html", shell("c","Constellation Desk","stars","drag between stars to draw · C clears the figure","#07091a","",`
const stars=[];
function sky(){stars.length=0;const n=36;for(let i=0;i<n;i++)stars.push({x:60+rnd()*(W-120),y:70+rnd()*(H-140)});}
const lines=[];let from=null;
function nearest(x,y){let b=null,d=28;for(const s of stars){const k=Math.hypot(s.x-x,s.y-y);if(k<d){d=k;b=s;}}return b;}
function onResize(){if(stars.length===0)sky();}
function onDown(){from=nearest(mx,my);}
function onUp(){const to=nearest(mx,my);if(from&&to&&from!==to)lines.push([from,to]);from=null;}
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="c")lines.length=0;});
function draw(){
  ctx.fillStyle="#07091a";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(190,210,255,.8)";ctx.lineWidth=1.2;
  for(const [a,b] of lines){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  if(from&&down){ctx.strokeStyle="rgba(190,210,255,.4)";ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(mx,my);ctx.stroke();}
  for(const s of stars){ctx.fillStyle="#eef3ff";ctx.fillRect(s.x,s.y,2,2);}
  $("m1").textContent="stars · "+stars.length; $("m2").textContent="lines · "+lines.length;
}
`)]);

/* ---------- 4 Paper Boats ---------- */
toys.push(["paper-boats.html", shell("p","Paper Boats","current","click to fold a boat · move the cursor to blow","#10243a","",`
const boats=[];
function onDown(){boats.push({x:mx,y:my,vx:0,vy:-0.4,ph:rnd()*6});}
function draw(t){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#1c3e62");g.addColorStop(1,"#0c1e30");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let y=H*0.45;y<H;y+=22){ctx.strokeStyle="rgba(255,255,255,.05)";ctx.beginPath();
    for(let x=0;x<=W;x+=12){const yy=y+Math.sin(x*0.02+t*0.001+y)*3;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}
  for(const b of boats){
    const wx=(mx-b.x)*0.0008,wy=(my-b.y)*0.0005;
    b.vx=lerp(b.vx,wx+Math.sin(t*0.0007+b.ph)*0.3,0.02);
    b.vy=lerp(b.vy,wy+0.15,0.02);
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<0)b.x+=W;if(b.x>W)b.x-=W;if(b.y>H-10)b.y=H*0.5;
    ctx.fillStyle="#f4efe2";
    ctx.beginPath();ctx.moveTo(b.x-14,b.y);ctx.lineTo(b.x,b.y-16);ctx.lineTo(b.x+14,b.y);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e4d3b0";ctx.fillRect(b.x-8,b.y-4,16,4);
  }
  $("m1").textContent="boats · "+boats.length; $("m2").textContent="wind from the cursor";
}
`)]);

/* ---------- 5 Sand Garden ---------- */
toys.push(["sand-garden.html", shell("s","Sand Garden","rake","drag to rake · the grooves stay","#c2a36b","#hud{color:rgba(60,40,16,.75)}#title b{color:#2c2112}",`
let img=null;
function fresh(){ctx.fillStyle="#c2a36b";ctx.fillRect(0,0,W,H);
  for(let i=0;i<4000;i++){ctx.fillStyle=\`rgba(90,60,20,\${rnd()*0.15})\`;ctx.fillRect(rnd()*W,rnd()*H,1.4,1.4);}
  img=ctx.getImageData(0,0,canvas.width,canvas.height);}
function onResize(){fresh();}
let lx=0,ly=0,been=false;
function draw(){
  if(img)ctx.putImageData(img,0,0);
  if(down){if(been){ctx.strokeStyle="rgba(90,62,28,.9)";ctx.lineWidth=14;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(mx,my);ctx.stroke();
    ctx.strokeStyle="rgba(255,236,200,.35)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(lx,ly-4);ctx.lineTo(mx,my-4);ctx.stroke();}
    lx=mx;ly=my;been=true;img=ctx.getImageData(0,0,canvas.width,canvas.height);
  } else been=false;
  $("m1").textContent="rake"; $("m2").textContent=down?"carving":"still";
}
`)]);

/* ---------- 6 Marble Run ---------- */
toys.push(["marble-run.html", shell("m","Marble Run","drop","click empty space to plant a peg · click the marble to drop it again","#10141c","",`
const pegs=[];const marbles=[];
function seed(){pegs.length=0;for(let r=0;r<9;r++)for(let c=0;c<8;c++)pegs.push({x:W*0.2+c*(W*0.075)+(r%2?W*0.03:0),y:120+r*52});}
function onResize(){if(!pegs.length)seed();}
function onDown(){const m=marbles[0];if(m&&Math.hypot(m.x-mx,m.y-my)<18){m.x=W/2;m.y=40;m.vx=0;m.vy=0;return;}
  pegs.push({x:mx,y:my});}
if(!marbles.length)marbles.push({x:400,y:40,vx:0,vy:0});
function draw(){
  ctx.fillStyle="#10141c";ctx.fillRect(0,0,W,H);
  for(const p of pegs){ctx.fillStyle="#d8e2f0";ctx.beginPath();ctx.arc(p.x,p.y,5,0,6.3);ctx.fill();}
  for(const m of marbles){
    m.vy+=0.18;m.x+=m.vx;m.y+=m.vy;m.vx*=0.995;
    for(const p of pegs){const dx=m.x-p.x,dy=m.y-p.y,d=Math.hypot(dx,dy);if(d<16&&d>0){const nx=dx/d,ny=dy/d;m.x=p.x+nx*16;m.y=p.y+ny*16;
      const dot=m.vx*nx+m.vy*ny;m.vx=(m.vx-2*dot*nx)*0.72;m.vy=(m.vy-2*dot*ny)*0.72;}}
    if(m.y>H-12){m.y=H-12;m.vy*=-0.3;}
    if(m.x<12||m.x>W-12){m.vx*=-0.5;m.x=clamp(m.x,12,W-12);}
    ctx.fillStyle="#ffb25a";ctx.beginPath();ctx.arc(m.x,m.y,9,0,6.3);ctx.fill();
  }
  $("m1").textContent="pegs · "+pegs.length; $("m2").textContent="one marble";
}
`)]);

/* ---------- 7 Bubble Wrap ---------- */
toys.push(["bubble-wrap.html", shell("b","Bubble Wrap","pop","click a bubble to pop it · popped ones seal back","#e7eef6","#hud{color:rgba(30,40,60,.8)}#title b{color:#1c2433}",`
const cells=[];const COLS=14;
function grid(){cells.length=0;const s=Math.min(W/(COLS+1),70);for(let y=s;y<H-40;y+=s)for(let x=s;x<W-20;x+=s)cells.push({x,y,r:s*0.38,pop:0});}
function onResize(){grid();}
function onDown(){for(const c of cells)if(Math.hypot(c.x-mx,c.y-my)<c.r)c.pop=1;}
function draw(t){
  ctx.fillStyle="#e7eef6";ctx.fillRect(0,0,W,H);
  let up=0;
  for(const c of cells){if(c.pop>0)c.pop=Math.max(0,c.pop-0.004);else up++;
    ctx.beginPath();ctx.arc(c.x,c.y,c.r*(1-c.pop*0.7),0,6.3);
    ctx.fillStyle=c.pop>0.2?"#d5deea":"#f7fbff";ctx.fill();
    ctx.strokeStyle="rgba(80,110,150,.45)";ctx.stroke();
    if(c.pop<0.2){ctx.fillStyle="rgba(255,255,255,.8)";ctx.beginPath();ctx.arc(c.x-c.r*0.3,c.y-c.r*0.3,c.r*0.22,0,6.3);ctx.fill();}}
  $("m1").textContent="sealed · "+up; $("m2").textContent="popped · "+(cells.length-up);
}
`)]);

/* ---------- 8 Kaleido Press ---------- */
toys.push(["kaleido-press.html", shell("k","Kaleido Press","fold","hold to stamp a bloom · it keeps spinning after","#0d0a16","",`
const stamps=[];
function onDown(){stamps.push({x:mx-W/2,y:my-H/2,h:rnd()*360,a:0,s:0.4+rnd()*0.8});if(stamps.length>40)stamps.shift();}
function draw(t){
  ctx.fillStyle="rgba(13,10,22,.35)";ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2,H/2);
  const n=8;
  for(const s of stamps){s.a+=0.004*s.s;
    for(let i=0;i<n;i++){ctx.save();ctx.rotate(i*(6.2832/n)+s.a);
      ctx.fillStyle=\`hsla(\${s.h},80%,68%,.55)\`;
      ctx.beginPath();ctx.ellipse(s.x,s.y,16*s.s,7*s.s,0.6,0,6.3);ctx.fill();
      ctx.scale(1,-1);ctx.beginPath();ctx.ellipse(s.x,s.y,16*s.s,7*s.s,0.6,0,6.3);ctx.fill();
      ctx.restore();}}
  ctx.restore();
  $("m1").textContent="blooms · "+stamps.length; $("m2").textContent="8-fold";
}
`)]);

/* ---------- 9 Tide Clock ---------- */
toys.push(["tide-clock.html", shell("t","Tide Clock","time","a clock with no hands · the ring fills and empties","#07141c","",`
function draw(t){
  ctx.fillStyle="#07141c";ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2+10,R=Math.min(W,H)*0.30;
  const tide=(Math.sin(t*0.00025)+1)/2;
  ctx.strokeStyle="rgba(180,220,230,.35)";ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(cx,cy,R,0,6.2832);ctx.stroke();
  ctx.fillStyle="rgba(120,190,210,.85)";
  ctx.beginPath();ctx.arc(cx,cy,R-8,-1.5708,-1.5708+tide*6.2832);ctx.lineTo(cx,cy);ctx.fill();
  for(let i=0;i<12;i++){const a=i/12*6.2832-1.5708;ctx.fillStyle="#d5eef2";ctx.fillRect(cx+Math.cos(a)*R-1,cy+Math.sin(a)*R-6,2,12);}
  ctx.fillStyle="#e7f6f8";ctx.font="16px Segoe UI, sans-serif";ctx.textAlign="center";
  ctx.fillText(tide>0.5?"flood":"ebb",cx,cy+6);
  $("m1").textContent="tide · "+Math.round(tide*100)+"%";
  $("m2").textContent="one full tide, slow";
}
`)]);

/* ---------- 10 Shadow Puppets ---------- */
toys.push(["shadow-puppets.html", shell("s","Shadow Puppets","lamp","drag the shapes · they throw big shadows","#1a120c","",`
const bits=[{k:"bird",x:0,y:0,sc:1},{k:"hand",x:0,y:0,sc:1},{k:"house",x:0,y:0,sc:1}];
let drag=null;
function onResize(){bits[0].x=W*0.35;bits[0].y=H*0.45;bits[1].x=W*0.55;bits[1].y=H*0.5;bits[2].x=W*0.45;bits[2].y=H*0.62;}
function shape(k,x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();
  if(k==="bird"){ctx.moveTo(-40,0);ctx.quadraticCurveTo(-10,-30,30,-8);ctx.quadraticCurveTo(10,8,-40,0);}
  else if(k==="hand"){ctx.rect(-24,-30,48,60);ctx.rect(-8,-70,16,46);ctx.rect(14,-60,12,40);}
  else {ctx.rect(-30,-20,60,40);ctx.moveTo(-36,-20);ctx.lineTo(0,-50);ctx.lineTo(36,-20);}
  ctx.fill();ctx.restore();}
function hit(b){return Math.hypot(b.x-mx,b.y-my)<40;}
function onDown(){drag=[...bits].reverse().find(hit)||null;}
function draw(){
  if(drag&&down){drag.x=mx;drag.y=my;}
  const g=ctx.createRadialGradient(W/2,H*0.2,30,W/2,H*0.2,H);
  g.addColorStop(0,"#f0d2a0");g.addColorStop(1,"#1a120c");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const lx=W/2,ly=H*0.18;
  ctx.fillStyle="rgba(0,0,0,.55)";
  for(const b of bits){const dx=b.x-lx,dy=b.y-ly;shape(b.k,b.x+dx*1.3,b.y+dy*1.3,2.4);}
  ctx.fillStyle="#140e0a";
  for(const b of bits)shape(b.k,b.x,b.y,1);
  $("m1").textContent="three puppets"; $("m2").textContent=drag?"dragging "+drag.k:"pick one up";
}
`)]);

/* A compact parametric family: each spec is a genuinely different rule,
   written out so the page stands alone. */
function family(file, title, tag, hint, bg, boot, step, paint, status) {
  toys.push([file, shell(file, title, tag, hint, bg, "", `
let items=[];
${boot}
function draw(t){
  ${step}
  ctx.fillStyle="${bg}";ctx.fillRect(0,0,W,H);
  ${paint}
  const st=(${status});
  const row=typeof st==="function"?st():st;
  $("m1").textContent=row[0]; $("m2").textContent=row[1];
}
`)]);
}

family("moss-grow.html","Moss","slow","click damp ground · growth is patient","#10160f",
`function onDown(){items.push({x:mx,y:my,r:2});}`,
`for(const m of items){m.r=Math.min(m.r+0.05+0.004*items.length,150);
  for(const o of items){if(o!==m){const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<m.r+o.r&&d>1){m.r-=0.02;}}}}`,
`for(const m of items){const g=ctx.createRadialGradient(m.x,m.y,2,m.x,m.y,m.r);
  g.addColorStop(0,"rgba(120,170,80,.9)");g.addColorStop(1,"rgba(40,70,30,0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,6.3);ctx.fill();}`,
`["patches · "+items.length,"still spreading"]`);

family("comet-scribble.html","Comet Scribble","trail","move · the tail cools from white to ash","#06070d",
`let prev=[];`,
`prev.push({x:mx,y:my,life:1}); if(prev.length>90)prev.shift(); for(const p of prev)p.life*=0.985;`,
`ctx.lineCap="round"; for(let i=1;i<prev.length;i++){const a=prev[i-1],b=prev[i];
  ctx.strokeStyle=\`rgba(\${180+b.life*75},\${190+b.life*65},255,\${b.life})\`; ctx.lineWidth=b.life*8;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}`,
`["tail · "+prev.length,"heat · "+(prev.length?prev[prev.length-1].life.toFixed(2):"0")]`);

family("pendulum-wave.html","Pendulum Wave","row","a row of swings · they braid, then agree","#0d1018",
`function onResize(){items=[];const n=18;for(let i=0;i<n;i++)items.push(i);} `,
`const beats=40;`,
`const n=items.length; for(let i=0;i<n;i++){const x=W*(0.08+0.84*i/Math.max(1,n-1));
  const period=1.2+i*0.06; const ang=Math.sin(t/1000*(6.2832/period))*0.9;
  const x2=x+Math.sin(ang)*70, y2=90+Math.cos(ang)*150;
  ctx.strokeStyle="rgba(220,230,245,.7)"; ctx.beginPath();ctx.moveTo(x,70);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.fillStyle="#f2f6ff"; ctx.beginPath();ctx.arc(x2,y2,7,0,6.3);ctx.fill();}`,
`["bobs · "+items.length,"no two share a period"]`);

family("lantern-river.html","Lantern River","float","click to set one adrift","#0c1520",
`function onDown(){items.push({x:mx,y:H*0.15+rnd()*40,vy:0.3+rnd()*0.4,ph:rnd()*6,r:10+rnd()*8});}`,
`for(const L of items){L.y=(L.y||H*0.2)+L.vy; L.x+=Math.sin(t*0.001+L.ph)*0.6; if(L.y>H+20)L.y=-20;}`,
`for(const L of items){ctx.fillStyle="rgba(255,170,70,.9)"; ctx.beginPath();ctx.arc(L.x,L.y,L.r,0,6.3);ctx.fill();
  ctx.fillStyle="rgba(255,220,150,.5)"; ctx.beginPath();ctx.arc(L.x,L.y,L.r*2.2,0,6.3);ctx.fill();}`,
`["lanterns · "+items.length,"current steady"]`);

family("static-radio.html","Static Radio","dial","move across the screen · stations hide in the noise","#100e12",
`const bands=[{f:0.18,name:"harbor"},{f:0.37,name:"night mail"},{f:0.55,name:"weather"},{f:0.73,name:"classroom"},{f:0.9,name:"static hymn"}];`,
`const tune=clamp(mx/Math.max(1,W),0,1); let heard="noise"; let gain=0;
  for(const b of bands){const g=Math.max(0,1-Math.abs(tune-b.f)*10); if(g>gain){gain=g;heard=b.name;}}`,
`for(let i=0;i<80;i++){const y=i/80*H; ctx.strokeStyle=\`rgba(220,230,210,\${0.05+rnd()*0.08*(1-gain)})\`;
  ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y+rnd()*6);ctx.stroke();}
  ctx.fillStyle="#f4f7ff"; ctx.font="28px Segoe UI, sans-serif"; ctx.textAlign="center";
  ctx.globalAlpha=0.3+gain*0.7; ctx.fillText(heard,W/2,H/2); ctx.globalAlpha=1;
  ctx.fillStyle="#ffb25a"; ctx.fillRect(tune*W-1,0,2,H);`,
`["dial · "+Math.round(tune*100), heard]`);

family("origami-flock.html","Origami Flock","fold","click to crease a bird into the flock","#101826",
`function onDown(){items.push({x:mx,y:my,a:rnd()*6,s:0.6+rnd()*0.8,sp:0.4+rnd()*0.6});}`,
`for(const b of items){b.a+=0.01; b.x+=Math.cos(b.a)*b.sp; b.y+=Math.sin(b.a*1.7)*b.sp*0.6;
  if(b.x<0)b.x+=W; if(b.x>W)b.x-=W; if(b.y<0)b.y+=H; if(b.y>H)b.y-=H;}`,
`ctx.fillStyle="#f6f1e6"; for(const b of items){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);
  ctx.scale(b.s,b.s); ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(0,-7);ctx.lineTo(18,0);ctx.lineTo(0,7);ctx.fill();
  ctx.restore();}`,
`["flock · "+items.length,"creased by hand"]`);

family("dew-web.html","Dew Web","morning","strands sag · click one to pluck it","#0e1412",
`function onResize(){items=[]; const hub={x:W/2,y:H/2}; for(let i=0;i<16;i++){const a=i/16*6.2832;
  items.push({x:hub.x+Math.cos(a)*Math.min(W,H)*0.34,y:hub.y+Math.sin(a)*Math.min(W,H)*0.34,k:0,a});}}`,
`for(const s of items)s.k*=0.96;`,
`ctx.strokeStyle="rgba(220,235,230,.6)"; ctx.lineWidth=1; const hubx=W/2,huby=H/2;
  for(const s of items){const sag=14+s.k*30; ctx.beginPath();ctx.moveTo(hubx,huby);
  ctx.quadraticCurveTo((hubx+s.x)/2,(huby+s.y)/2+sag,s.x,s.y); ctx.stroke();
  ctx.fillStyle="rgba(230,245,255,.85)"; ctx.beginPath();ctx.arc((hubx+s.x)/2,(huby+s.y)/2+sag*0.6,2.4,0,6.3);ctx.fill();}
  if(down){let best=null,bd=40; for(const s of items){const d=Math.hypot(s.x-mx,s.y-my); if(d<bd){bd=d;best=s;}} if(best)best.k=1;}`,
`["strands · "+items.length,"dew holding"]`);

family("echo-well.html","Echo Well","drop","click to drop a stone · rings return late","#0a1018",
`function onDown(){items.push({x:mx,y:my,born:t0(),rings:[0,0,0]});}
function t0(){return performance.now();}`,
`const now=performance.now();`,
`ctx.strokeStyle="rgba(180,210,240,.8)"; for(const s of items){const age=(now-s.born)/1000;
  for(let i=0;i<3;i++){const rr=(age-i*0.45)*90; if(rr>0&&rr<Math.max(W,H)){ctx.globalAlpha=Math.max(0,1-rr/600);
    ctx.beginPath();ctx.arc(s.x,s.y,rr,0,6.3);ctx.stroke();ctx.globalAlpha=1;}}}`,
`["stones · "+items.length,"listening"]`);

family("frost-pane.html","Frost Pane","cold","hold to breathe a clear patch · frost grows back","#cfe3f2","#hud{color:rgba(30,40,60,.8)}#title b{color:#16202c}",
`let warm=[];`,
`if(down)warm.push({x:mx,y:my,r:46,life:1}); warm=warm.filter(w=>w.life>0.02); for(const w of warm)w.life*=0.985;`,
`ctx.fillStyle="rgba(255,255,255,.55)"; for(let i=0;i<220;i++){const x=(i*97%1000)/1000*W,y=(i*57%1000)/1000*H;
  ctx.fillRect(x,y,1.5,1.5);} ctx.globalCompositeOperation="destination-out";
  for(const w of warm){ctx.fillStyle=\`rgba(0,0,0,\${w.life})\`; ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,6.3);ctx.fill();}
  ctx.globalCompositeOperation="source-over";`,
`["breaths · "+warm.length,"frost returns"]`);

family("gear-garden.html","Gear Garden","mesh","click to drop a gear · it turns with its neighbors","#14161c",
`function onDown(){items.push({x:mx,y:my,r:24+rnd()*18,teeth:8+(rnd()*5|0),a:0,dir:1});
  for(const g of items){for(const o of items){if(o!==g&&Math.hypot(o.x-g.x,o.y-g.y)<o.r+g.r+6)g.dir=-o.dir;}}}`,
`if(items[0])items[0].a+=0.01; for(let i=1;i<items.length;i++){const g=items[i]; let spin=0.004*g.dir;
  for(const o of items)if(o!==g&&Math.hypot(o.x-g.x,o.y-g.y)<o.r+g.r+8)spin=-(o.r/g.r)*0.01*(o===items[0]?1:o.dir);
  g.a+=spin;}`,
`for(const g of items){ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a); ctx.strokeStyle="#d5dbe8"; ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,0,g.r*0.55,0,6.3);ctx.stroke();
  for(let i=0;i<g.teeth;i++){const a=i/g.teeth*6.2832; ctx.beginPath();
    ctx.moveTo(Math.cos(a)*g.r*0.7,Math.sin(a)*g.r*0.7); ctx.lineTo(Math.cos(a)*g.r,Math.sin(a)*g.r); ctx.stroke();}
  ctx.restore();}`,
`["gears · "+items.length,"meshed"]`);

family("ink-blot.html","Ink Blot","fold","click to drip · it mirrors across the spine","#efe6d4","#hud{color:rgba(40,30,16,.8)}#title b{color:#24180e}",
`function onDown(){items.push({x:mx,y:my,r:14+rnd()*34,h:rnd()*40});}`,
`const fold=W/2;`,
`ctx.fillStyle="#efe6d4"; for(const b of items){const side=b.x<fold?1:-1;
  for(const s of [1,-1]){ctx.fillStyle=\`hsla(\${20+b.h},45%,22%,.8)\`; ctx.beginPath();
    ctx.ellipse(fold+s*Math.abs(b.x-fold),b.y,b.r,b.r*0.72,b.h,0,6.3);ctx.fill();}}
  ctx.strokeStyle="rgba(80,50,20,.4)"; ctx.beginPath();ctx.moveTo(fold,0);ctx.lineTo(fold,H);ctx.stroke();`,
`["blots · "+items.length,"folded on the spine"]`);

family("magnet-dust.html","Magnet Dust","field","move · filings stand along the field","#161616","",
`const dust=[]; for(let i=0;i<700;i++)dust.push({x:rnd(),y:rnd()});`,
`const fx=mx,fy=my;`,
`ctx.strokeStyle="rgba(220,220,230,.75)"; ctx.lineWidth=1; for(const d of dust){const x=d.x*W,y=d.y*H;
  const ang=Math.atan2(y-fy,x-fx); const len=8; ctx.beginPath();
  ctx.moveTo(x-Math.cos(ang)*len,y-Math.sin(ang)*len); ctx.lineTo(x+Math.cos(ang)*len,y+Math.sin(ang)*len); ctx.stroke();}
  ctx.fillStyle="#ff8080"; ctx.beginPath();ctx.arc(fx,fy,8,0,6.3);ctx.fill();`,
`["filings · "+dust.length,"two poles, one cursor"]`);

family("moon-phase-dial.html","Moon Dial","night","move left to right to walk a month","#070910","",
`const names=["new","waxing crescent","first quarter","waxing gibbous","full","waning gibbous","last quarter","waning crescent"];`,
``,
`const p=clamp(mx/Math.max(1,W),0,1); const cx=W/2,cy=H/2,R=Math.min(W,H)*0.22;
  ctx.fillStyle="#efe8d6"; ctx.beginPath();ctx.arc(cx,cy,R,0,6.3);ctx.fill();
  ctx.fillStyle="#070910"; const phase=(p*2-1); ctx.beginPath();ctx.arc(cx,cy,R,0,6.2832);ctx.fill();
  ctx.fillStyle="#efe8d6"; ctx.beginPath(); ctx.ellipse(cx,cy,Math.abs(phase)*R,R,0,phase>0?-1.57:1.57,phase>0?1.57:4.71);ctx.fill();
  if(phase>0){ctx.beginPath();ctx.arc(cx,cy,R,-1.57,1.57);ctx.fill();} else {ctx.beginPath();ctx.arc(cx,cy,R,1.57,4.71);ctx.fill();}
  const name=names[Math.min(7,(p*8)|0)];`,
`["phase · "+name,"drag the month"]`);

family("pebble-stack.html","Pebble Stack","balance","click to set a stone · too wide and the tower tips","#1a1c20","",
`let lean=0,fallen=false; function onDown(){if(fallen){items.length=0;lean=0;fallen=false;return;}
  const top=items.length?items[items.length-1].y-26:H-40; const cx=items.length?items[items.length-1].x:W/2;
  const off=mx-cx; items.push({x:cx+off*0.25,y:top,w:40+rnd()*26,off}); if(Math.abs(off)>70)fallen=true;}`,
`if(fallen)lean=lerp(lean,1,0.04);`,
`ctx.fillStyle="#c9c2b2"; for(let i=0;i<items.length;i++){const p=items[i]; ctx.save();
  ctx.translate(p.x+lean*i*8,p.y+lean*i*2); ctx.rotate(lean*i*0.05); ctx.fillRect(-p.w/2,-12,p.w,22); ctx.restore();}`,
`[fallen?"tipped — click to rebuild":"stones · "+items.length, fallen?"on the floor":"holding"]`);

family("ripple-desk.html","Ripple Desk","tap","every click is a stone","#0e1a22","",
`function onDown(){items.push({x:mx,y:my,born:performance.now()});}`,
`const now=performance.now(); items=items.filter(s=>now-s.born<4000);`,
`ctx.strokeStyle="rgba(190,220,235,.8)"; for(const s of items){const r=(now-s.born)/12; ctx.globalAlpha=Math.max(0,1-r/340);
  ctx.beginPath();ctx.arc(s.x,s.y,r,0,6.3);ctx.stroke(); ctx.globalAlpha=1;}`,
`["ripples · "+items.length,"the tray is wide"]`);

family("snow-globe.html","Snow Globe","shake","click to shake · watch it settle","#0e1420","",
`const flakes=[]; for(let i=0;i<160;i++)flakes.push({x:rnd(),y:rnd(),s:0.4+rnd()*1.4,v:0}); let shake=0;
function onDown(){shake=1;}`,
`shake*=0.97;`,
`const cx=W/2,cy=H/2+10,R=Math.min(W,H)*0.32; ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.3);ctx.clip();
  ctx.fillStyle="#16304a"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#f4f7ff"; for(const f of flakes){f.v=lerp(f.v,0.15+f.s*0.2,0.02); f.y+=f.v/H*(1-shake);
    f.x+=Math.sin(t*0.001+f.y*8)*0.0008+ (shake*(rnd()-0.5)*0.02); if(f.y>1)f.y=0; if(f.x<0||f.x>1)f.x=rnd();
    ctx.globalAlpha=0.5+f.s*0.4; ctx.fillRect(f.x*W,f.y*H,2*f.s,2*f.s);} ctx.restore(); ctx.globalAlpha=1;
  ctx.strokeStyle="rgba(230,236,245,.5)"; ctx.lineWidth=3; ctx.beginPath();ctx.arc(cx,cy,R,0,6.3);ctx.stroke();`,
`["flakes · "+flakes.length, shake>0.05?"shaken":"settling"]`);

family("starling-murmur.html","Starlings","flock","steer with the cursor · they never touch","#070a12","",
`for(let i=0;i<90;i++)items.push({x:rnd()*900,y:rnd()*600,vx:0,vy:0});`,
`for(const b of items){b.vx=lerp(b.vx,(mx-b.x)*0.002,0.03); b.vy=lerp(b.vy,(my-b.y)*0.002,0.03);
  for(const o of items){if(o===b)continue; const dx=b.x-o.x,dy=b.y-o.y,d=dx*dx+dy*dy; if(d<360&&d>1){b.vx+=dx/d*6; b.vy+=dy/d*6;}}
  const sp=Math.hypot(b.vx,b.vy)||1; b.vx=b.vx/sp*2.2; b.vy=b.vy/sp*2.2; b.x+=b.vx; b.y+=b.vy;}`,
`ctx.fillStyle="#e9eef8"; for(const b of items){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
  ctx.fillRect(-5,-1.2,10,2.4); ctx.restore();}`,
`["birds · "+items.length,"a hand's width apart"]`);

family("string-lights.html","String Lights","hang","click to pin a bulb · the wire finds the sag","#120e16","",
`function onDown(){items.push({x:mx,y:my});}`,
``,
`if(items.length){ctx.strokeStyle="rgba(40,30,24,.9)"; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<items.length;i++){const p=items[i]; if(i===0){ctx.moveTo(80,70); ctx.lineTo(p.x,p.y);} else {
    const a=items[i-1]; const mx2=(a.x+p.x)/2, my2=Math.max(a.y,p.y)+Math.hypot(p.x-a.x,p.y-a.y)*0.25;
    ctx.quadraticCurveTo(mx2,my2,p.x,p.y);} } ctx.stroke();
  for(const p of items){ctx.fillStyle="#ffd28a"; ctx.beginPath();ctx.arc(p.x,p.y,7,0,6.3);ctx.fill();
    ctx.fillStyle="rgba(255,200,120,.25)"; ctx.beginPath();ctx.arc(p.x,p.y,18,0,6.3);ctx.fill();}}`,
`["bulbs · "+items.length,"wire sagging"]`);

family("sundial.html","Sundial","shadow","move the sun across the sky · read the shadow","#20304a","",
``,
``,
`const sun=clamp(mx/Math.max(1,W),0.05,0.95); const alt=Math.sin(sun*3.1416);
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,alt>0.2?"#7eb0e0":"#20304a"); g.addColorStop(1,"#c9844a");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const sx=sun*W, sy=H*0.75-alt*H*0.6; ctx.fillStyle="#fff4d2"; ctx.beginPath();ctx.arc(sx,sy,22,0,6.3);ctx.fill();
  const bx=W/2,by=H*0.78; ctx.fillStyle="#2a2118"; ctx.fillRect(bx-6,by-70,12,70);
  const ang=Math.atan2(by-(by-70)-sy?0:0,1); const dx=(bx-sx),dy=(by-sy); const len=220;
  const nx=dx/(Math.hypot(dx,dy)||1), ny=dy/(Math.hypot(dx,dy)||1);
  ctx.strokeStyle="rgba(20,14,8,.55)"; ctx.lineWidth=10; ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-nx*len,by-ny*len*0.3);ctx.stroke();`,
`()=>{const h=Math.round(6+clamp(mx/Math.max(1,W),0,1)*12); return ["hour · "+((h%12)||12)+(h<12?"am":"pm"),"sun altitude · "+Math.round(Math.sin(clamp(mx/Math.max(1,W),0,1)*3.1416)*100)+"%"];}`);

family("typewriter-rain.html","Typewriter Rain","keys","letters fall · type one to catch it","#14120e","",
`const glyphs="abcdefghijklmnopqrstuvwxyz"; let score=0,miss=0; let next=0;
addEventListener("keydown",e=>{const ch=e.key.toLowerCase(); if(glyphs.includes(ch)){const i=items.findIndex(L=>L.ch===ch); if(i>=0){items.splice(i,1);score++;}}});`,
`if(t>next){next=t+700; items.push({ch:glyphs[rnd()*glyphs.length|0],x:40+rnd()*(W-80),y:-10,s:0.6+rnd()*0.8});}
for(const L of items){L.y+=L.s*1.6; if(L.y>H-20){miss++;L.y=-9999;}} items=items.filter(L=>L.y>-100);`,
`ctx.fillStyle="#f3ecdf"; ctx.font="28px Georgia, serif"; ctx.textAlign="center";
for(const L of items)ctx.fillText(L.ch,L.x,L.y);`,
`["caught · "+score,"missed · "+miss]`);

family("wind-chime.html","Wind Chime","strike","move near the tubes · they sing when they collide","#10161c","",
`function onResize(){items=[]; const n=7; for(let i=0;i<n;i++)items.push({x:W*0.3+i*38,y:H*0.28,len:70+i*18,ang:0,va:0});}
let strikes=0;`,
`for(const c of items){const push=clamp((mx-c.x)*0.00005, -0.02,0.02); c.va+=push-c.ang*0.01; c.va*=0.98; c.ang+=c.va;}
for(let i=0;i<items.length-1;i++){const a=items[i],b=items[i+1]; if(Math.abs(a.ang-b.ang)>0.35 && Math.abs(a.va)+Math.abs(b.va)>0.02){strikes++; a.va*=-0.4; b.va*=-0.4;}}`,
`const top=H*0.2; ctx.strokeStyle="#c8d0dc"; ctx.beginPath();ctx.moveTo(items[0]?items[0].x-20:0,top);ctx.lineTo(items.length?items[items.length-1].x+20:0,top);ctx.stroke();
for(const c of items){const x2=c.x+Math.sin(c.ang)*c.len,y2=c.y+Math.cos(c.ang)*c.len; ctx.strokeStyle="#d9e2ee"; ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(c.x,top);ctx.lineTo(x2,y2);ctx.stroke();}`,
`["tubes · "+items.length,"strikes · "+strikes]`);

family("yarn-ball.html","Yarn Ball","tangle","drag · the loose end remembers","#1a1420","",
`let path=[]; let last=0;`,
`if(down && t-last>16){last=t; path.push({x:mx,y:my}); if(path.length>600)path.shift();}`,
`ctx.strokeStyle="#e7b0c4"; ctx.lineWidth=2.2; ctx.lineJoin="round"; ctx.beginPath();
for(let i=0;i<path.length;i++){const p=path[i]; i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);} ctx.stroke();
if(path.length){ctx.fillStyle="#f6d5e0"; ctx.beginPath();ctx.arc(path[path.length-1].x,path[path.length-1].y,4,0,6.3);ctx.fill();}`,
`["length · "+path.length,"still holding the end"]`);

family("aurora-curtain.html","Aurora","sky","drag · the curtain folds and keeps falling","#05070e","",
`const cols=80; const band=[]; for(let i=0;i<cols;i++)band.push(0.35);`,
`const col=clamp(Math.round(mx/W*(cols-1)),0,cols-1); if(down)band[col]=clamp(my/H,0.1,0.9);
for(let i=0;i<cols;i++)band[i]=lerp(band[i],0.35+Math.sin(t*0.0004+i*0.3)*0.08,0.01);`,
`for(let i=0;i<cols;i++){const x=i/cols*W; const g=ctx.createLinearGradient(0,band[i]*H-80,0,band[i]*H+140);
  g.addColorStop(0,"rgba(80,255,180,0)"); g.addColorStop(0.5,"rgba(110,255,190,.55)"); g.addColorStop(1,"rgba(80,120,255,0)");
  ctx.fillStyle=g; ctx.fillRect(x,band[i]*H-80,W/cols+1,220);}`,
`["folds · "+cols,"falling"]`);

family("balance-scale.html","Balance","weigh","click a pan to drop a weight","#1c1a16","",
`let L=0,R=0,ang=0; function onDown(){ if(mx<W/2)L++; else R++; }`,
`const target=clamp((R-L)*0.08,-0.5,0.5); ang=lerp(ang,target,0.08);`,
`const cx=W/2,cy=H*0.4; ctx.strokeStyle="#e6d7b8"; ctx.lineWidth=3; ctx.beginPath();ctx.moveTo(cx,cy+80);ctx.lineTo(cx,cy);ctx.stroke();
ctx.save();ctx.translate(cx,cy);ctx.rotate(ang); ctx.beginPath();ctx.moveTo(-160,0);ctx.lineTo(160,0);ctx.stroke();
ctx.fillStyle="#c9b89a"; ctx.fillRect(-180,-8,36,16); ctx.fillRect(144,-8,36,16);
ctx.fillStyle="#f0e2c8"; for(let i=0;i<L;i++)ctx.fillRect(-174,8+i*7,24,6); ctx.restore();
ctx.save();ctx.translate(cx,cy);ctx.rotate(ang); ctx.fillStyle="#f0e2c8"; for(let i=0;i<R;i++)ctx.fillRect(150,8+i*7,24,6); ctx.restore();`,
`["left · "+L+"   right · "+R, Math.abs(L-R)<1?"even":"arguing"]`);

family("candle-row.html","Candle Row","flame","click a wick · wave the cursor to pass it on","#160e0c","",
`function onResize(){items=[]; for(let i=0;i<9;i++)items.push({x:W*(0.12+i*0.09),y:H*0.62,lit:i===4,heat:i===4?1:0});}`,
`let wind=(mx-W/2)/W; for(const c of items){c.heat=lerp(c.heat,c.lit?1:0,0.05);}
for(let i=0;i<items.length;i++){const c=items[i]; if(!c.lit)continue; const dir=wind>0?1:-1; const n=items[i+dir];
  if(n && Math.abs(wind)>0.25 && !n.lit)n.heat+=0.01; if(n&&n.heat>0.6)n.lit=true;}`,
`for(const c of items){ctx.fillStyle="#f4efe4"; ctx.fillRect(c.x-7,c.y,14,70);
  if(c.heat>0.05){ctx.fillStyle=\`rgba(255,\${140+c.heat*80},60,\${c.heat})\`; ctx.beginPath();
    ctx.ellipse(c.x+wind*16,c.y-16,6,14+c.heat*6,wind*0.4,0,6.3);ctx.fill();}}`,
`["lit · "+items.filter(c=>c.lit).length,"wind · "+(wind>0.25?"east":wind<-0.25?"west":"still")]`);

family("cloud-watch.html","Cloud Watch","slow","they pull apart on their own","#8eb4d6","#hud{color:rgba(20,30,50,.8)}#title b{color:#142033}",
`for(let i=0;i<5;i++)items.push({x:rnd()*800,y:80+rnd()*300,s:0.6+rnd(),name:["a boat","a dog","a hand","a hill","a fish"][i]});`,
`for(const c of items){c.x+=0.15*c.s; if(c.x>W+80)c.x=-80;}`,
`ctx.fillStyle="rgba(255,255,255,.85)"; for(const c of items){ctx.beginPath();ctx.ellipse(c.x,c.y,50*c.s,26*c.s,0,0,6.3);ctx.fill();
  ctx.beginPath();ctx.ellipse(c.x+30*c.s,c.y+6,30*c.s,20*c.s,0,0,6.3);ctx.fill();
  ctx.fillStyle="rgba(20,30,50,.55)"; ctx.font="13px Segoe UI"; ctx.fillText(c.name,c.x-20,c.y+46); ctx.fillStyle="rgba(255,255,255,.85)";}`,
`["clouds · "+items.length,"none of them last"]`);

family("domino-spiral.html","Domino Spiral","fall","click to stand one · press Space to tip the first","#20242c","",
`let tip=false; function onDown(){items.push({x:mx,y:my,f:0});} addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();tip=true;}});`,
`if(tip&&items[0])items[0].f=Math.min(1,items[0].f+0.08);
for(let i=1;i<items.length;i++){const a=items[i-1],b=items[i]; if(a.f>0.7&&Math.hypot(a.x-b.x,a.y-b.y)<36)b.f=Math.min(1,b.f+0.1);}`,
`for(const d of items){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.f*1.4); ctx.fillStyle="#f4f1ea"; ctx.fillRect(-4,-28,8,32);ctx.restore();}`,
`["standing · "+items.filter(d=>d.f<1).length, tip?"falling":"space to tip"]`);

family("drip-castle.html","Drip Castle","wet","hold to drip · the pile slumps","#d8c3a0","#hud{color:rgba(50,36,18,.85)}#title b{color:#2a1c0e}",
`const cols=60; const h=[]; for(let i=0;i<cols;i++)h.push(0);`,
`const c=clamp(Math.round(mx/W*(cols-1)),0,cols-1); if(down)h[c]+=1.2;
for(let k=0;k<4;k++)for(let i=1;i<cols-1;i++){const m=(h[i-1]+h[i]+h[i+1])/3; h[i]=lerp(h[i],m,0.15);} `,
`ctx.fillStyle="#e7d3ad"; const cw=W/cols; for(let i=0;i<cols;i++){ctx.fillRect(i*cw,H-h[i],cw+1,h[i]);}`,
`()=>{const peak=Math.max(...h); return ["peak · "+Math.round(peak),"slumping"];}`);

family("eclipse-cards.html","Eclipse Cards","stack","click to flip a card · each sky hides the last","#100c18","",
`const skies=["#1b2440","#40241b","#14302a","#2a1840","#3a3014"]; let top=0;
function onDown(){top=(top+1)%skies.length; items.push(top);} `,
``,
`for(let i=0;i<5;i++){const k=(top+5-i)%5; ctx.fillStyle=skies[k]; const o=i*14;
  ctx.fillRect(W*0.25+o,H*0.2+o,W*0.5,H*0.55);
  ctx.fillStyle="rgba(255,244,220,.8)"; ctx.beginPath();ctx.arc(W*0.5+o,H*0.42+o,30-i*4,0,6.3);ctx.fill();}`,
`["flipped · "+items.length,"five skies"]`);

family("fern-unfurl.html","Fern","grow","hold · a frond unfurls, then curls shut","#0e1610","",
`let open=0;`,
`open=lerp(open,down?1:0,0.03);`,
`ctx.strokeStyle="#b7d39a"; ctx.lineWidth=2; ctx.translate(W/2,H*0.8);
function frond(len,ang,depth){if(depth<=0||len<4)return; ctx.save();ctx.rotate(ang*(1.4-open));
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len);ctx.stroke(); ctx.translate(0,-len);
  frond(len*0.62,-0.7,depth-1); frond(len*0.62,0.7,depth-1); ctx.restore();}
frond(90*open+10,0,6); ctx.setTransform(dpr,0,0,dpr,0,0);`,
`()=>["open · "+Math.round(open*100)+"%", down?"unfurling":"curling shut"]`);

family("floating-lanterns.html","Floating Lanterns","rise","hold on one to warm it · warm ones climb","#0c1018","",
`for(let i=0;i<6;i++)items.push({x:W?0:0,y:0,heat:0}); let ready=false;`,
`if(!ready&&W){items.forEach((L,i)=>{L.x=W*(0.2+i*0.12);L.y=H*0.75;});ready=true;}
for(const L of items){const near=Math.hypot(L.x-mx,L.y-my)<40; if(down&&near)L.heat=Math.min(1,L.heat+0.02); else L.heat*=0.99;
  L.y-=L.heat*1.4; if(L.y<40)L.y=H*0.8;}`,
`for(const L of items){ctx.fillStyle=\`rgba(255,\${150+L.heat*80},80,\${0.4+L.heat*0.6})\`; ctx.beginPath();ctx.arc(L.x,L.y,14,0,6.3);ctx.fill();
  ctx.strokeStyle="rgba(255,220,170,.6)"; ctx.strokeRect(L.x-10,L.y-12,20,28);}`,
`["aloft · "+items.filter(L=>L.heat>0.4).length,"warm to rise"]`);

family("glass-harmonica.html","Glass Harmonica","rim","circle the cursor · speed chooses the glass","#141820","",
`let ang=0,last=0,speed=0,note=""; const notes=["C","D","E","G","A","C2"];`,
`const a=Math.atan2(my-H/2,mx-W/2); let d=a-last; if(d>3)d-=6.28; if(d<-3)d+=6.28; speed=lerp(speed,Math.abs(d),0.2); last=a;
note=notes[clamp(speed*8|0,0,notes.length-1)];`,
`const cx=W/2,cy=H/2; for(let i=6;i>=1;i--){ctx.strokeStyle="rgba(210,225,235,.35)"; ctx.lineWidth=8;
  ctx.beginPath();ctx.arc(cx,cy,30+i*24,0,6.3);ctx.stroke();}
ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath();ctx.arc(cx,cy,30+clamp(speed*8|0,0,5)*24+24,0,6.3);ctx.stroke();
ctx.fillStyle="#f4f7ff"; ctx.font="32px Segoe UI"; ctx.textAlign="center"; ctx.fillText(note,cx,cy+8);`,
`()=>["glass · "+note,"faster circles, higher glass"]`);

family("honey-drip.html","Honey","slow","drag a thread · it stretches, then snaps back","#c9842a","#hud{color:rgba(40,22,4,.85)}#title b{color:#2a1604}",
`let tip=null,anchor=null; function onDown(){anchor={x:mx,y:my};tip={x:mx,y:my};}
function onUp(){anchor=null;}`,
`if(anchor){tip.x=lerp(tip.x,mx,0.15); tip.y=lerp(tip.y,my,0.08)+0.6;}`,
`if(anchor){ctx.strokeStyle="rgba(90,40,4,.9)"; ctx.lineWidth=6; ctx.lineCap="round"; ctx.beginPath();
  ctx.moveTo(anchor.x,anchor.y); ctx.quadraticCurveTo((anchor.x+tip.x)/2,(anchor.y+tip.y)/2+20,tip.x,tip.y); ctx.stroke();}`,
`()=>[anchor?"stretching":"pinch and pull","it always snaps"]`);

family("hourglass.html","Hourglass","wait","click to flip · grains pile into a slope","#1a1612","",
`let upper=240,lower=0,flip=1; function onDown(){flip*=-1;}`,
`if(flip>0&&upper>0){upper-=0.4;lower+=0.4;} else if(flip<0&&lower>0){lower-=0.4;upper+=0.4;}`,
`const cx=W/2,top=H*0.25,bot=H*0.78; ctx.strokeStyle="#e6d8c0"; ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cx-70,top);ctx.lineTo(cx+70,top);ctx.lineTo(cx,H*0.5);ctx.lineTo(cx+70,bot);ctx.lineTo(cx-70,bot);ctx.lineTo(cx,H*0.5);ctx.closePath();ctx.stroke();
ctx.fillStyle="#e3c27a"; const pile=Math.sqrt(lower)*3; ctx.beginPath();ctx.moveTo(cx-pile,bot-4);ctx.lineTo(cx+pile,bot-4);ctx.lineTo(cx,bot-4-pile);ctx.fill();
ctx.fillRect(cx-2,H*0.5,4,Math.min(40,upper*0.2));`,
`()=>["upper · "+Math.round(upper),"lower · "+Math.round(lower)]`);

family("ice-crack.html","Ice","thaw","click · cracks race, frost seals them","#d5e4ee","#hud{color:rgba(24,40,60,.85)}#title b{color:#163044}",
`function onDown(){const segs=[]; let x=mx,y=my,a=rnd()*6; for(let i=0;i<8;i++){a+=rnd()-0.5; const nx=x+Math.cos(a)*30,ny=y+Math.sin(a)*30; segs.push({x,y,nx,ny,life:1}); x=nx;y=ny;} items.push(segs);}`,
`for(const s of items)for(const g of s)g.life*=0.992; items=items.filter(s=>s[0].life>0.05);`,
`ctx.lineWidth=1.4; for(const s of items)for(const g of s){ctx.strokeStyle=\`rgba(40,70,100,\${g.life})\`; ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.nx,g.ny);ctx.stroke();}`,
`()=>["cracks · "+items.length,"healing"]`);

family("jellyfish-drift.html","Jellyfish","pulse","they pulse up · the cursor is a current","#07141e","",
`for(let i=0;i<8;i++)items.push({x:rnd()*800,y:rnd()*500,ph:rnd()*6,r:18+rnd()*16});`,
`for(const j of items){const pulse=(Math.sin(t*0.003+j.ph)+1)/2; j.y-=0.25+pulse*0.5; j.x+=Math.sin(t*0.001+j.ph)*0.4+(mx-j.x)*0.002;
  if(j.y<-40)j.y=H+20;}`,
`for(const j of items){const pulse=(Math.sin(t*0.003+j.ph)+1)/2; ctx.fillStyle="rgba(180,140,255,.35)";
  ctx.beginPath();ctx.ellipse(j.x,j.y,j.r,j.r*(0.6+pulse*0.3),0,0,6.3);ctx.fill();
  ctx.strokeStyle="rgba(200,170,255,.5)"; for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(j.x+(k-1.5)*6,j.y);
    ctx.quadraticCurveTo(j.x+(k-1.5)*10,j.y+40,j.x+(k-1.5)*4,j.y+70+pulse*10);ctx.stroke();}}`,
`()=>["drifting · "+items.length,"current from the cursor"]`);

family("koi-pond.html","Koi Pond","still","they follow, then lose interest","#0e2430","",
`const cols=["#f2f2f2","#e25b45","#f0b429","#1c1c1c"]; for(let i=0;i<7;i++)items.push({x:200+i*60,y:200,a:0,interest:0,c:cols[i%4]});`,
`for(const k of items){const dx=mx-k.x,dy=my-k.y,d=Math.hypot(dx,dy)||1; k.interest=lerp(k.interest,d<220?1:0,0.01);
  const tx=Math.atan2(dy,dx); k.a=lerp(k.a,tx,0.04*k.interest+0.005); k.x+=Math.cos(k.a)*(0.5+k.interest); k.y+=Math.sin(k.a)*(0.5+k.interest);}`,
`for(const k of items){ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a); ctx.fillStyle=k.c;
  ctx.beginPath();ctx.ellipse(0,0,18,7,0,0,6.3);ctx.fill(); ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-26,-7);ctx.lineTo(-26,7);ctx.fill(); ctx.restore();}`,
`()=>["koi · "+items.length,"easily bored"]`);

family("leaf-fall.html","Leaf Fall","autumn","click a falling leaf to catch it","#3a2a22","",
`let caught=0,pile=0; function spawn(){items.push({x:rnd()*W,y:-10,s:0.7+rnd(),a:rnd()*6,caught:false});}
setInterval(()=>{if(items.length<12)spawn();},500);
function onDown(){for(const L of items)if(!L.caught&&Math.hypot(L.x-mx,L.y-my)<20){L.caught=true;caught++;}}`,
`for(const L of items){if(L.caught){L.x=lerp(L.x,40+caught*8,0.1);L.y=lerp(L.y,H-30,0.1);} else {L.y+=L.s*1.3;L.x+=Math.sin(L.y*0.02)*0.8;L.a+=0.02;
  if(L.y>H-8){pile++;L.y=-999;}} } items=items.filter(L=>L.y>-100);`,
`ctx.fillStyle="#e07a3d"; for(const L of items){ctx.save();ctx.translate(L.x,L.y);ctx.rotate(L.a); ctx.beginPath();ctx.ellipse(0,0,8,4,0,0,6.3);ctx.fill();ctx.restore();}`,
`()=>["caught · "+caught,"on the ground · "+pile]`);

family("lighthouse.html","Lighthouse","sweep","the beam turns · click a ship to mark it seen","#0c1420","",
`for(let i=0;i<5;i++)items.push({x:80+i*(W?0:0),y:0,seen:false}); let ready=false;`,
`if(!ready&&W){items.forEach((s,i)=>{s.x=W*(0.15+i*0.16);s.y=H*0.62;});ready=true;}
const ang=(t*0.0004)%6.2832; const bx=W*0.5,by=H*0.78;
for(const s of items){const a=Math.atan2(s.y-by,s.x-bx); let d=Math.abs(a-ang); if(d>3.14)d=6.28-d; if(d<0.12)s.seen=true;}`,
`ctx.fillStyle="#d8c7a2"; ctx.fillRect(W*0.5-8,H*0.5,16,H*0.3); ctx.fillStyle="rgba(255,244,200,.18)";
ctx.beginPath();ctx.moveTo(W*0.5,H*0.5); ctx.arc(W*0.5,H*0.5,Math.max(W,H),(t*0.0004)%6.28-0.18,(t*0.0004)%6.28+0.18);ctx.fill();
for(const s of items){ctx.fillStyle=s.seen?"#9fd7c4":"#f4f7ff"; ctx.fillRect(s.x,s.y,22,8);}`,
`()=>["seen · "+items.filter(s=>s.seen).length+" / "+items.length,"beam turning"]`);

family("match-strike.html","Match Strike","flare","drag fast to strike · the flare dies if you wait","#1a1410","",
`let heat=0,px=0,py=0,lit=0;`,
`const v=Math.hypot(mx-px,my-py); px=mx;py=my; if(down&&v>30)heat=1; heat*=0.985; lit=heat;`,
`if(heat>0.05){const g=ctx.createRadialGradient(mx,my,4,mx,my,40+heat*80); g.addColorStop(0,"rgba(255,220,140,.9)"); g.addColorStop(1,"rgba(255,80,20,0)");
  ctx.fillStyle=g; ctx.beginPath();ctx.arc(mx,my,40+heat*80,0,6.3);ctx.fill();}`,
`()=>["flare · "+Math.round(heat*100)+"%", heat>0.4?"lit":"drag faster"]`);

family("meteor-watch.html","Meteor Watch","night","click a streak before it is gone","#06070e","",
`let seen=0,missed=0; function onDown(){for(const m of items)if(!m.dead&&Math.hypot(m.x-mx,m.y-my)<24){m.dead=true;seen++;}}`,
`if(rnd()<0.02)items.push({x:rnd()*W,y:rnd()*H*0.6,vx:3+rnd()*4,vy:1+rnd()*2,life:1,dead:false});
for(const m of items){if(m.dead)continue; m.x+=m.vx;m.y+=m.vy;m.life-=0.008; if(m.life<=0){m.dead=true;missed++;}} items=items.filter(m=>!m.dead);`,
`ctx.strokeStyle="#f4f7ff"; ctx.lineWidth=2; for(const m of items){ctx.globalAlpha=m.life; ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.vx*4,m.y-m.vy*4);ctx.stroke();} ctx.globalAlpha=1;`,
`()=>["caught · "+seen,"burned out · "+missed]`);

family("milk-crown.html","Milk Crown","drop","click · a crown rises and falls","#f4f6f8","#hud{color:rgba(30,36,48,.8)}#title b{color:#1c2430}",
`function onDown(){items.push({x:mx,y:my,born:performance.now()});}`,
`const now=performance.now(); items=items.filter(c=>now-c.born<900);`,
`ctx.fillStyle="#f7fbff"; for(const c of items){const u=(now-c.born)/900; const h=Math.sin(u*3.1416)*46; ctx.strokeStyle="rgba(80,100,130,.8)";
  ctx.beginPath(); for(let i=0;i<=16;i++){const a=i/16*6.2832; const r=14+u*20; const yy=c.y-h*Math.abs(Math.sin(i)); i?ctx.lineTo(c.x+Math.cos(a)*r,yy):ctx.moveTo(c.x+Math.cos(a)*r,yy);} ctx.stroke();}`,
`()=>["crowns · "+items.length,"they never stay"]`);

family("mirror-lake.html","Mirror Lake","still","the reflection lags behind you","#0e1c28","",
`let rx=0,ry=0;`,
`rx=lerp(rx,mx,0.04); ry=lerp(ry,my,0.04);`,
`const mid=H*0.5; ctx.fillStyle="#16344a"; ctx.fillRect(0,0,W,mid); ctx.fillStyle="#0e2432"; ctx.fillRect(0,mid,W,H-mid);
ctx.fillStyle="#f4f7ff"; ctx.beginPath();ctx.arc(mx,Math.min(my,mid-8),8,0,6.3);ctx.fill();
ctx.fillStyle="rgba(244,247,255,.55)"; ctx.beginPath();ctx.arc(rx,mid+(mid-Math.min(ry,mid-8)),8,0,6.3);ctx.fill();`,
`()=>["lag · "+Math.round(Math.hypot(mx-rx,my-ry)),"it forgives slowly"]`);

family("mobius-walk.html","Mobius Walk","loop","drag to turn a surface with one side","#12141c","",
`let rot=0.4; function onDown(){} addEventListener("pointermove",()=>{if(down)rot+=0.01;});`,
``,
`ctx.translate(W/2,H/2); ctx.rotate(rot); ctx.strokeStyle="#d6e0f5"; ctx.lineWidth=8;
for(let i=0;i<=180;i++){const u=i/180*6.2832; const x=(90+30*Math.cos(u/2))*Math.cos(u), y=(90+30*Math.cos(u/2))*Math.sin(u)*0.5;
  i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); ctx.setTransform(dpr,0,0,dpr,0,0);`,
`()=>["twist · one","drag to turn"]`);

family("moth-to-flame.html","Moth","night","move the lamp · they orbit and never land","#100c0a","",
`for(let i=0;i<12;i++)items.push({a:rnd()*6,d:40+rnd()*120,s:0.01+rnd()*0.02});`,
``,
`ctx.fillStyle="#ffb060"; ctx.beginPath();ctx.arc(mx,my,10,0,6.3);ctx.fill();
ctx.fillStyle="#f4f7ff"; for(const m of items){m.a+=m.s; const x=mx+Math.cos(m.a)*m.d,y=my+Math.sin(m.a)*m.d*0.7;
  ctx.save();ctx.translate(x,y);ctx.rotate(m.a); ctx.fillRect(-5,-2,10,4); ctx.restore();}`,
`()=>["moths · "+items.length,"none arrive"]`);

family("newton-cradle.html","Newton Cradle","click","click a ball to lift and release","#16181e","",
`function onResize(){items=[]; for(let i=0;i<5;i++)items.push({x:W*0.4+i*36,ang:0,va:0});}
let lift=-1; function onDown(){lift=0;} function onUp(){lift=-1;}`,
`if(lift===0&&items[0]){items[0].ang=-0.8;} else if(items.length){items[0].va+=-items[0].ang*0.02; items[0].ang+=items[0].va; items[0].va*=0.99;
  const last=items[items.length-1]; if(Math.abs(items[0].ang)<0.05&&Math.abs(items[0].va)>0.02){last.va=items[0].va; items[0].va=0;}
  last.va+=-last.ang*0.02; last.ang+=last.va; last.va*=0.99;}`,
`const y0=H*0.35; if(items.length){ctx.strokeStyle="#cfd6e4"; ctx.beginPath();ctx.moveTo(items[0].x-10,y0);ctx.lineTo(items[items.length-1].x+10,y0);ctx.stroke();}
for(const b of items){const x=b.x+Math.sin(b.ang)*90,y=y0+Math.cos(b.ang)*90; ctx.strokeStyle="#aeb6c6"; ctx.beginPath();ctx.moveTo(b.x,y0);ctx.lineTo(x,y);ctx.stroke();
  ctx.fillStyle="#e8edf6"; ctx.beginPath();ctx.arc(x,y,14,0,6.3);ctx.fill();}`,
`()=>["balls · "+items.length,"the far side answers"]`);

family("night-train.html","Night Train","window","lights pass · click one to follow it","#0a0c12","",
`let follow=null; function onDown(){follow=items.find(L=>Math.hypot(L.x-mx,L.y-my)<16)||follow;}`,
`if(rnd()<0.05)items.push({x:W+10,y:60+rnd()*(H-120),s:2+rnd()*3}); for(const L of items)L.x-=L.s; items=items.filter(L=>L.x>-20);`,
`ctx.fillStyle="#0a0c12"; for(const L of items){ctx.fillStyle=L===follow?"#ffd28a":"rgba(255,244,220,.8)"; ctx.fillRect(L.x,L.y,8,4);
  if(L===follow){ctx.strokeStyle="rgba(255,210,140,.6)"; ctx.strokeRect(L.x-20,L.y-30,48,64);}}`,
`()=>["lights · "+items.length, follow?"following one":"watching"]`);

family("oil-swirl.html","Oil Swirl","slow","drag color through water · it will not mix","#0e1a20","",
`let blobs=[]; function onDown(){blobs.push({x:mx,y:my,hx:mx,hy:my,r:20+rnd()*30,h:rnd()*360});}`,
`for(const b of blobs){b.x=lerp(b.x,b.hx,0.02); b.y=lerp(b.y,b.hy,0.02); if(down){const d=Math.hypot(b.x-mx,b.y-my); if(d<80){b.x+=(mx-b.x)*0.05;b.y+=(my-b.y)*0.05;}}}`,
`for(const b of blobs){ctx.fillStyle=\`hsla(\${b.h},80%,60%,.65)\`; ctx.beginPath();ctx.ellipse(b.x,b.y,b.r,b.r*0.6,b.h,0,6.3);ctx.fill();}`,
`()=>["colors · "+blobs.length,"still separate"]`);

family("paper-plane.html","Paper Plane","fold","flick by dragging, then release","#d7e4f2","#hud{color:rgba(24,36,56,.85)}#title b{color:#182438}",
`let p={x:0,y:0,vx:0,vy:0},sx=0,sy=0,armed=false; function onResize(){p.x=W*0.2;p.y=H*0.5;}
function onDown(){sx=mx;sy=my;armed=true;} function onUp(){if(armed){p.vx=(mx-sx)*0.12; p.vy=(my-sy)*0.12; armed=false;}}`,
`p.vy+=0.05; p.vx*=0.995; p.x+=p.vx; p.y+=p.vy; if(p.y>H-20){p.y=H-20;p.vy*=-0.2;p.vx*=0.8;}`,
`ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx||0.001)); ctx.fillStyle="#f7f4ee";
ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(-16,-10);ctx.lineTo(-8,0);ctx.lineTo(-16,10);ctx.fill(); ctx.restore();`,
`()=>["speed · "+Math.hypot(p.vx,p.vy).toFixed(1),"drag, then let go"]`);

family("pebble-pond.html","Pebble Pond","skip","drag flat and release · steep throws sink","#123044","",
`let stones=[],sx=0,sy=0; function onDown(){sx=mx;sy=my;}
function onUp(){const vx=(mx-sx)*0.1, vy=(my-sy)*0.1; stones.push({x:sx,y:sy,vx,vy,skips:Math.abs(vy)<Math.abs(vx)?3:0});}`,
`for(const s of stones){s.x+=s.vx;s.y+=s.vy;s.vy+=0.03; if(s.skips>0&&s.vy>1){s.vy*=-0.6;s.skips--;}} stones=stones.filter(s=>s.y<H+20);`,
`ctx.fillStyle="#f4f7ff"; for(const s of stones){ctx.beginPath();ctx.arc(s.x,s.y,4,0,6.3);ctx.fill();}`,
`()=>["in the air · "+stones.length,"flat throws skip"]`);

family("pinwheel.html","Pinwheel","breath","it spins only while the cursor keeps moving","#16302a","",
`let ang=0,px=0,py=0,blow=0;`,
`blow=lerp(blow,Math.hypot(mx-px,my-py),0.2); px=mx;py=my; ang+=blow*0.01;`,
`ctx.save();ctx.translate(W/2,H/2);ctx.rotate(ang); const cols=["#e25b45","#f0d060","#7ec8a3","#6cb6ff"];
for(let i=0;i<4;i++){ctx.rotate(1.5708); ctx.fillStyle=cols[i]; ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(40,-30,0,-80);ctx.fill();}
ctx.restore();`,
`()=>["spin · "+blow.toFixed(1), blow>4?"turning":"still"]`);

family("planetarium.html","Planetarium","dome","drag the sky · drawn lines stay with their stars","#07091a","",
`const stars=[]; for(let i=0;i<50;i++)stars.push({x:rnd()*2000-200,y:rnd()*1200-100}); let camx=0,camy=0,drawLine=null;
function onDown(){drawLine={x:mx-camx,y:my-camy};} function onUp(){if(drawLine){items.push([drawLine,{x:mx-camx,y:my-camy}]);drawLine=null;}}`,
`if(down){camx+=(mx-(W/2))*0; }`,
`ctx.fillStyle="#eef"; for(const s of stars)ctx.fillRect(s.x+camx,s.y+camy,2,2);
ctx.strokeStyle="rgba(200,216,255,.8)"; for(const [a,b] of items){ctx.beginPath();ctx.moveTo(a.x+camx,a.y+camy);ctx.lineTo(b.x+camx,b.y+camy);ctx.stroke();}`,
`()=>["figures · "+items.length,"drag to connect"]`);

family("prism-split.html","Prism","light","move the beam · white goes in, color comes out","#120e16","",
``,
``,
`const x=clamp(mx,80,W-80); ctx.strokeStyle="#f4f7ff"; ctx.lineWidth=3; ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(x-40,H/2);ctx.stroke();
ctx.fillStyle="rgba(230,230,240,.8)"; ctx.beginPath();ctx.moveTo(x-40,H/2-40);ctx.lineTo(x+30,H/2);ctx.lineTo(x-40,H/2+40);ctx.fill();
const cols=["#ff6b6b","#ffb454","#ffe66b","#8dce7a","#6cb6ff","#8a7bff"];
cols.forEach((c,i)=>{ctx.strokeStyle=c; ctx.beginPath();ctx.moveTo(x+30,H/2);ctx.lineTo(W,H/2-50+i*20);ctx.stroke();});`,
`()=>["beam","one way in, six out"]`);

family("rainstick.html","Rainstick","turn","move up and down to tip it","#2a2118","",
`let grains=[]; for(let i=0;i<40;i++)grains.push({y:rnd()}); let tip=0.5;`,
`tip=lerp(tip,clamp(my/Math.max(1,H),0,1),0.05); for(const g of grains){g.y+= (tip-0.5)*0.02; g.y=clamp(g.y,0,1);}`,
`ctx.save();ctx.translate(W/2,H/2);ctx.rotate((tip-0.5)*1.2); ctx.strokeStyle="#c8b498"; ctx.lineWidth=16; ctx.beginPath();ctx.moveTo(0,-H*0.35);ctx.lineTo(0,H*0.35);ctx.stroke();
ctx.fillStyle="#e6d3a0"; for(const g of grains)ctx.fillRect(-3,-H*0.34+g.y*H*0.68,6,4); ctx.restore();`,
`()=>["seeds · "+grains.length,"tip to pour"]`);

family("river-stones.html","River Stones","step","click the next stone · each landing sinks it","#1a3a44","",
`function onResize(){items=[]; let x=60; while(x<W-40){items.push({x,y:H*0.6+rnd()*30,sink:0}); x+=50+rnd()*40;}}
let at=0; function onDown(){const n=items[at+1]; if(n&&Math.hypot(n.x-mx,n.y-my)<30){at++; n.sink+=6;}}`,
``,
`items.forEach((s,i)=>{ctx.fillStyle=i===at?"#f0e2c4":"#b7c4c0"; ctx.beginPath();ctx.ellipse(s.x,s.y+s.sink,18,10,0,0,6.3);ctx.fill();});`,
`()=>["step · "+at+" / "+Math.max(0,items.length-1),"stones sink"]`);

family("sail-boats.html","Sailboats","wind","click a boat to turn its sail","#1c4e6e","",
`for(let i=0;i<4;i++)items.push({x:80+i*120,y:0,sail:0.4}); let ready=false;
function onDown(){const b=items.find(s=>Math.hypot(s.x-mx,s.y-my)<30); if(b)b.sail=b.sail>0? -0.6:0.6;}`,
`if(!ready&&H){items.forEach((b,i)=>{b.y=H*(0.3+i*0.12);});ready=true;} const wind=0.8;
for(const b of items)b.x+=wind*b.sail*0.6; for(const b of items)if(b.x>W+20)b.x=-20;`,
`for(const b of items){ctx.fillStyle="#f4efe4"; ctx.fillRect(b.x-12,b.y,24,6); ctx.strokeStyle="#f7f7f2"; ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+b.sail*20,b.y-28);ctx.stroke();}`,
`()=>["boats · "+items.length,"click to tack"]`);

family("salt-lamp.html","Salt Lamp","glow","move close to warm it","#1a1210","",
`let heat=0;`,
`const d=Math.hypot(mx-W/2,my-H*0.6); heat=lerp(heat,clamp(1-d/300,0,1),0.02);`,
`const g=ctx.createRadialGradient(W/2,H*0.6,10,W/2,H*0.6,80+heat*160); g.addColorStop(0,\`rgba(255,\${120+heat*80},60,\${0.3+heat*0.6})\`); g.addColorStop(1,"rgba(255,80,20,0)");
ctx.fillStyle=g; ctx.beginPath();ctx.arc(W/2,H*0.6,80+heat*160,0,6.3);ctx.fill();
ctx.fillStyle="#e7b89a"; ctx.beginPath();ctx.moveTo(W/2,H*0.4);ctx.lineTo(W/2+40,H*0.75);ctx.lineTo(W/2-40,H*0.75);ctx.fill();`,
`()=>["warmth · "+Math.round(heat*100)+"%","stays restless"]`);

family("sand-timer-race.html","Two Timers","pour","click a side to pinch that neck","#201c16","",
`let a=200,b=200,pa=false,pb=false; function onDown(){if(mx<W/2)pa=!pa; else pb=!pb;}`,
`if(!pa&&a>0)a-=0.5; if(!pb&&b>0)b-=0.5;`,
`ctx.fillStyle="#e3c27a"; ctx.fillRect(W*0.25-20,H*0.3,40,a); ctx.fillRect(W*0.75-20,H*0.3,40,b);
ctx.fillStyle="#f4efe4"; ctx.font="14px Segoe UI"; ctx.textAlign="center"; ctx.fillText(pa?"pinched":"running",W*0.25,H*0.25); ctx.fillText(pb?"pinched":"running",W*0.75,H*0.25);`,
`()=>["left · "+Math.round(a),"right · "+Math.round(b)]`);

family("sea-glass.html","Sea Glass","shore","click a piece to tumble it smoother","#16343e","",
`const cols=["#8fbfb2","#d7e4c8","#e7d2b4","#b7c7d6"]; for(let i=0;i<10;i++)items.push({x:60+i*8,y:0,e:rnd()*8,c:cols[i%4],s:0});
let ready=false; function onDown(){const g=items.find(p=>Math.hypot(p.x-mx,p.y-my)<20); if(g){g.s=Math.min(1,g.s+0.25); g.e*=0.6;}}`,
`if(!ready&&H){items.forEach((p,i)=>{p.x=W*(0.15+(i%5)*0.15); p.y=H*(0.35+(i/5|0)*0.2);}); ready=true;}`,
`for(const p of items){ctx.fillStyle=p.c; ctx.beginPath();ctx.ellipse(p.x,p.y,16-p.s*4,11-p.s*2,p.e,0,6.3);ctx.fill();}`,
`()=>["smooth · "+items.filter(p=>p.s>0.7).length,"rough · "+items.filter(p=>p.s<=0.7).length]`);

family("signal-flags.html","Signal Flags","spell","type · the line hoists a flag per letter","#0e2430","",
`let word=""; const hue=ch=>((ch.charCodeAt(0)-97)*24+180);
addEventListener("keydown",e=>{if(e.key==="Backspace")word=word.slice(0,-1); else if(/^[a-z]$/i.test(e.key)&&word.length<16)word+=e.key.toUpperCase();});`,
``,
`ctx.strokeStyle="#d5e0ea"; ctx.beginPath();ctx.moveTo(80,40);ctx.lineTo(80+word.length*36,40);ctx.stroke();
for(let i=0;i<word.length;i++){ctx.fillStyle=\`hsl(\${hue(word[i])},70%,60%)\`; ctx.fillRect(80+i*36,40,26,18);
  ctx.fillStyle="#07141c"; ctx.font="12px Segoe UI"; ctx.fillText(word[i],86+i*36,53);}`,
`()=>["flags · "+word.length, word||"type a letter"]`);

family("slime-mold.html","Slime Mold","seek","click to drop food · a path grows toward it","#10140e","",
`let foods=[]; let net=[]; function onDown(){foods.push({x:mx,y:my}); net.push({x:W/2,y:H/2,tx:mx,ty:my,u:0});}`,
`for(const n of net){n.u=Math.min(1,n.u+0.004);}`,
`ctx.strokeStyle="rgba(210,190,60,.9)"; ctx.lineWidth=3; ctx.lineCap="round"; for(const n of net){ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(lerp(n.x,n.tx,n.u),lerp(n.y,n.ty,n.u));ctx.stroke();}
ctx.fillStyle="#e6d27a"; for(const f of foods){ctx.beginPath();ctx.arc(f.x,f.y,6,0,6.3);ctx.fill();}`,
`()=>["food · "+foods.length,"paths keep the short way"]`);

family("smoke-ring.html","Smoke Ring","puff","click · a ring widens as it climbs","#1a1c20","",
`function onDown(){items.push({x:mx,y:my,r:8,life:1});}`,
`for(const r of items){r.y-=1.1; r.r+=0.6; r.life*=0.985;} items=items.filter(r=>r.life>0.05);`,
`for(const r of items){ctx.strokeStyle=\`rgba(230,230,235,\${r.life})\`; ctx.lineWidth=3; ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*0.35,0,0,6.3);ctx.stroke();}`,
`()=>["rings · "+items.length,"widening"]`);

family("soap-film.html","Soap Film","stretch","drag the frame wider · it thins, flashes, pops","#10202a","",
`let width=120,thin=0,popped=false; `,
`if(down)width=clamp(Math.abs(mx-W/2)*2,40,W*0.8); thin=clamp((width-120)/400,0,1); if(thin>0.92)popped=true; if(!down&&popped){popped=false;width=120;}`,
`if(!popped){ctx.strokeStyle="#d5e6ee"; ctx.strokeRect(W/2-width/2,H*0.3,width,H*0.35);
  ctx.fillStyle=\`hsla(\${180+thin*140},80%,70%,\${0.25+thin*0.4})\`; ctx.fillRect(W/2-width/2,H*0.3,width,H*0.35);}`,
`()=>[popped?"popped":"stretch · "+Math.round(width), popped?"release to start again":"thinning"]`);

family("spider-line.html","Spider Line","cast","flick · the line sticks and sags","#12160e","",
`let lines=[]; let sx=0,sy=0; function onDown(){sx=mx;sy=my;} function onUp(){lines.push({x:sx,y:sy,nx:mx,ny:my});}`,
``,
`ctx.strokeStyle="rgba(230,230,220,.8)"; for(const L of lines){ctx.beginPath();ctx.moveTo(L.x,L.y);
  ctx.quadraticCurveTo((L.x+L.nx)/2,(L.y+L.ny)/2+40,L.nx,L.ny); ctx.stroke();}`,
`()=>["lines · "+lines.length,"every cast sticks"]`);

family("spiral-stair.html","Spiral Stair","climb","scroll to climb a stair that does not end","#16141c","",
`let climb=0; addEventListener("wheel",e=>{e.preventDefault(); climb+=e.deltaY*0.02;},{passive:false});`,
``,
`const cx=W/2,cy=H/2; for(let i=0;i<40;i++){const a=(i+climb)*0.5; const r=30+(i%12)*8; const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*0.6;
  ctx.fillStyle=\`hsl(\${30+(i%12)*8},30%,\${40+(i%8)*5}%)\`; ctx.fillRect(x,y,26,10);}`,
`()=>["steps climbed · "+Math.round(Math.abs(climb)),"no top"]`);

family("stamp-garden.html","Stamp Garden","press","each click is a new block · overlaps mix","#efe6d2","#hud{color:rgba(40,30,16,.85)}#title b{color:#24180e}",
`const blocks=["circle","square","triangle","ring"]; function onDown(){items.push({x:mx,y:my,k:blocks[items.length%4],h:(items.length*47)%360});}`,
``,
`for(const s of items){ctx.fillStyle=\`hsla(\${s.h},55%,40%,.8)\`; ctx.beginPath();
  if(s.k==="circle")ctx.arc(s.x,s.y,18,0,6.3); else if(s.k==="square"){ctx.rect(s.x-16,s.y-16,32,32);} else if(s.k==="ring"){ctx.arc(s.x,s.y,16,0,6.3);ctx.stroke();}
  else {ctx.moveTo(s.x,s.y-18);ctx.lineTo(s.x+16,s.y+14);ctx.lineTo(s.x-16,s.y+14);} if(s.k!=="ring")ctx.fill(); else {ctx.lineWidth=4;ctx.stroke();}}`,
`()=>["stamps · "+items.length,"four blocks"]`);

family("star-map-fold.html","Star Map","crease","click to fold · stars jump the crease","#0c1224","",
`for(let i=0;i<30;i++)items.push({x:rnd(),y:rnd(),side:1}); let folded=false; function onDown(){folded=!folded;
  if(folded)for(const s of items){if(Math.abs(s.x-0.5)<0.06)s.side*=-1;}}`,
``,
`ctx.strokeStyle="rgba(200,216,255,.4)"; ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
ctx.fillStyle="#eef3ff"; for(const s of items){const x=folded&&s.x>0.5?1-s.x:s.x; ctx.fillRect(x*W,s.y*H,2,2);}`,
`()=>[folded?"folded":"open","stars on the crease switch pages"]`);

family("stone-skip-well.html","Skip Well","count","click to skip toward the middle","#102028","",
`let skips=0,sinking=false,x=0,y=0,vx=0; function onResize(){x=40;y=H*0.5;}
function onDown(){if(sinking){sinking=false;x=40;skips=0;vx=0;return;} vx=4;}`,
`if(vx){x+=vx; const cx=W/2; if(x>cx){skips++; vx=0; sinking=true;}}`,
`ctx.strokeStyle="rgba(200,220,230,.5)"; ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)*0.28,0,6.3);ctx.stroke();
ctx.fillStyle="#f4f7ff"; ctx.beginPath();ctx.arc(sinking?W/2:x,sinking?H/2:y,5,0,6.3);ctx.fill();`,
`()=>["skips before the drop · "+skips, sinking?"down the well":"click to throw"]`);

family("storm-glass.html","Storm Glass","watch","crystals grow and shrink on their own","#14202a","",
`for(let i=0;i<18;i++)items.push({a:rnd()*6,len:10+rnd()*40,ph:rnd()*6});`,
`for(const c of items)c.len=20+Math.sin(t*0.0003+c.ph)*18+10;`,
`ctx.save();ctx.translate(W/2,H/2); for(const c of items){ctx.save();ctx.rotate(c.a); ctx.strokeStyle="rgba(220,235,240,.8)";
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(c.len,0);ctx.stroke(); ctx.restore();} ctx.restore();
ctx.strokeStyle="rgba(220,230,235,.4)"; ctx.beginPath();ctx.arc(W/2,H/2,90,0,6.3);ctx.stroke();`,
`()=>["crystals · "+items.length,"no forecast attached"]`);

family("string-phone.html","String Phone","pull","click to pluck · the far cup answers late","#201a16","",
`let pulse=[],delay=0; function onDown(){pulse.push({u:0});}`,
`for(const p of pulse)p.u+=0.01; const arrived=pulse.filter(p=>p.u>=1).length; pulse=pulse.filter(p=>p.u<1.15);`,
`ctx.strokeStyle="#e6d8c4"; ctx.beginPath();ctx.moveTo(80,H/2);ctx.lineTo(W-80,H/2);ctx.stroke();
ctx.fillStyle="#c9b89a"; ctx.fillRect(60,H/2-16,28,32); ctx.fillRect(W-88,H/2-16,28,32);
for(const p of pulse){ctx.fillStyle="#f4f7ff"; ctx.beginPath();ctx.arc(lerp(80,W-80,Math.min(1,p.u)),H/2,5,0,6.3);ctx.fill();}`,
`()=>["on the string · "+pulse.length,"the far cup waits"]`);

family("sun-print.html","Sun Print","fade","click to lay an object down · the rest darkens","#cfe3d6","#hud{color:rgba(20,40,30,.85)}#title b{color:#143024}",
`function onDown(){items.push({x:mx,y:my,k:items.length%3});} let exp=0;`,
`exp=Math.min(1,exp+0.0015);`,
`ctx.fillStyle=\`rgba(20,70,90,\${exp*0.85})\`; for(const o of items){ctx.save();ctx.translate(o.x,o.y); ctx.fillStyle="#e7f2ea";
  if(o.k===0)ctx.fillRect(-20,-20,40,40); else if(o.k===1){ctx.beginPath();ctx.arc(0,0,18,0,6.3);ctx.fill();}
  else {ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(16,16);ctx.lineTo(-16,16);ctx.fill();} ctx.restore();}`,
`()=>["objects · "+items.length,"exposure · "+Math.round(exp*100)+"%"]`);

family("tea-steep.html","Tea","wait","color leaves the bag · move to stir","#3a2418","",
`let strength=0,stir=0,px=0;`,
`strength=Math.min(1,strength+0.0008+(stir>6?0.0015:0)); stir=lerp(stir,Math.abs(mx-px),0.3); px=mx;`,
`const g=ctx.createRadialGradient(W/2,H*0.6,10,W/2,H*0.6,180); g.addColorStop(0,\`rgba(90,30,10,\${strength})\`); g.addColorStop(1,"rgba(90,30,10,0)");
ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.strokeStyle="#e6d2b0"; ctx.strokeRect(W/2-14,H*0.28,28,36);`,
`()=>["steeped · "+Math.round(strength*100)+"%", stir>6?"stirring":"waiting"]`);

family("telescope.html","Telescope","pan","only a small circle of sky is honest","#06070e","",
`const field=[]; for(let i=0;i<120;i++)field.push({x:rnd()*2000-200,y:rnd()*1400-200});`,
``,
`ctx.save(); ctx.beginPath();ctx.arc(mx,my,90,0,6.3);ctx.clip(); ctx.fillStyle="#10162a"; ctx.fillRect(0,0,W,H);
ctx.fillStyle="#f4f7ff"; for(const s of field)ctx.fillRect(s.x,s.y,2,2); ctx.restore();
ctx.strokeStyle="rgba(230,236,245,.4)"; ctx.beginPath();ctx.arc(mx,my,90,0,6.3);ctx.stroke();`,
`()=>["aperture","the rest is rumor"]`);

family("thermos.html","Thermos","hold","click to pour · every pour loses heat","#1c1814","",
`let heat=1,poured=0; function onDown(){if(heat>0.05){poured++; heat*=0.72;}}`,
``,
`ctx.fillStyle="#d9cbb8"; ctx.fillRect(W*0.3,H*0.35,40,120); ctx.fillStyle=\`rgba(255,\${80+heat*140},60,\${heat})\`; ctx.fillRect(W*0.34,H*0.4,32,100*heat);
ctx.fillStyle="#f4efe4"; ctx.font="16px Segoe UI"; ctx.fillText("pours "+poured,W*0.5,H*0.5);`,
`()=>["heat left · "+Math.round(heat*100)+"%","each pour spends some"]`);

family("thunder-sheet.html","Thunder Sheet","shake","grab and move · the rumble follows","#18140e","",
`let energy=0,px=0,py=0;`,
`if(down)energy=lerp(energy,Math.hypot(mx-px,my-py),0.4); else energy*=0.96; px=mx;py=my;`,
`ctx.strokeStyle=\`rgba(230,220,200,\${0.3+Math.min(0.7,energy/40)})\`; ctx.lineWidth=2;
for(let i=0;i<12;i++){const y=H*(0.2+i*0.05)+Math.sin(t*0.01+i)*energy; ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-40,y);ctx.stroke();}`,
`()=>["rumble · "+energy.toFixed(0),"shake a corner"]`);

family("tide-pool.html","Tide Pool","wait","the water drops on its own","#12323c","",
`let level=1; const things=["star","shell","crab","anemone","coin"];`,
`level=Math.max(0.15,level-0.00035);`,
`ctx.fillStyle="rgba(80,150,170,.35)"; ctx.fillRect(0,H*level,W,H); ctx.fillStyle="#f4efe4"; ctx.font="16px Segoe UI"; ctx.textAlign="center";
things.forEach((n,i)=>{const y=H*(0.3+i*0.12); if(y>H*level)ctx.fillText(n,W/2,y);});`,
`()=>["water · "+Math.round(level*100)+"%","wait, it is leaving"]`);

family("top-spin.html","Top","flick","drag fast and release","#201812","",
`let ang=0,spin=0,px=0,wander=0; function onUp(){spin+= (mx-px)*0.02;}`,
`px=mx; spin*=0.995; ang+=spin*0.05; wander=Math.sin(t*0.002)*(1-Math.min(1,Math.abs(spin)/20))*40;`,
`ctx.save();ctx.translate(W/2+wander,H*0.55);ctx.rotate(ang); ctx.fillStyle="#e25b45"; ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(16,20);ctx.lineTo(-16,20);ctx.fill(); ctx.restore();`,
`()=>["spin · "+Math.abs(spin).toFixed(1), Math.abs(spin)<2?"wobbling":"asleep"]`);

family("train-set.html","Train Set","loop","drag to lay track · the engine takes it","#1c2430","",
`let track=[]; let lastT=0; function onDown(){track=[];} `,
`if(down&&t-lastT>30){lastT=t; track.push({x:mx,y:my});}
const eng=track.length?track[Math.floor(t/80)%track.length]:null;`,
`ctx.strokeStyle="#cfd6e2"; ctx.lineWidth=4; ctx.beginPath(); track.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
if(eng){ctx.fillStyle="#e25b45"; ctx.fillRect(eng.x-8,eng.y-8,16,16);}`,
`()=>["track points · "+track.length,"drag a loop"]`);

family("tumble-weed.html","Tumbleweed","wind","move to blow · it snags, then rolls","#2a2418","",
`let x=100,vx=0,snag=0;`,
`const wind=(mx-x)*0.002; vx=lerp(vx,wind,0.02); if(Math.abs(vx)<0.2)snag=Math.min(1,snag+0.01); else snag*=0.95; x+=vx*(1-snag*0.8); if(x>W+20)x=-20; if(x<-20)x=W+20;`,
`ctx.save();ctx.translate(x,H*0.7);ctx.rotate(x*0.05); ctx.strokeStyle="#d8c39a"; for(let i=0;i<6;i++){ctx.rotate(1); ctx.beginPath();ctx.arc(0,0,16+i*2,0,4);ctx.stroke();} ctx.restore();`,
`()=>["snag · "+Math.round(snag*100)+"%","blow from the cursor"]`);

family("umbrella.html","Umbrella","rain","move to tilt · drops run to the low edge","#223044","",
`let drops=[]; for(let i=0;i<50;i++)drops.push({x:rnd(),y:rnd()});`,
`const tilt=clamp((mx-W/2)/W,-0.5,0.5); for(const d of drops){d.y+=0.006; if(d.y>0.55&&d.y<0.62)d.x+=tilt*0.01; if(d.y>1){d.y=0;d.x=rnd();}}`,
`ctx.strokeStyle="#f4f7ff"; ctx.lineWidth=3; ctx.beginPath();ctx.arc(W/2,H*0.6,90,3.2+tilt,6.3+tilt);ctx.stroke();
ctx.fillStyle="rgba(220,235,255,.8)"; for(const d of drops)ctx.fillRect(d.x*W,d.y*H,1.5,6);`,
`()=>["tilt · "+tilt.toFixed(2),"low edge spills"]`);

family("velvet-rope.html","Velvet Rope","queue","drag the rope · the line follows","#241820","",
`let rope=0.5; const people=[]; for(let i=0;i<9;i++)people.push(i);`,
`if(down)rope=clamp(mx/W,0.2,0.8);`,
`ctx.strokeStyle="#a3143a"; ctx.lineWidth=4; ctx.beginPath();ctx.moveTo(W*0.2,H*rope);ctx.lineTo(W*0.8,H*rope);ctx.stroke();
people.forEach((p,i)=>{const y=H*rope+30+i*28; ctx.fillStyle="#e6d8c8"; ctx.beginPath();ctx.arc(W*0.5,y,8,0,6.3);ctx.fill();});`,
`()=>["in line · "+people.length,"rope sets the front"]`);

family("vinyl.html","Vinyl","drop","click to lower the needle · it drifts","#16141c","",
`let downNeedle=false,dust=0; function onDown(){downNeedle=!downNeedle; dust=0;}`,
`if(downNeedle)dust=Math.min(1,dust+0.002);`,
`ctx.save();ctx.translate(W/2,H/2);ctx.rotate(t*0.01); ctx.fillStyle="#1a1a1a"; ctx.beginPath();ctx.arc(0,0,120,0,6.3);ctx.fill();
ctx.strokeStyle="rgba(255,255,255,.15)"; for(let r=30;r<120;r+=8){ctx.beginPath();ctx.arc(0,0,r,0,6.3);ctx.stroke();} ctx.restore();
if(downNeedle){ctx.strokeStyle="#f4f7ff"; ctx.beginPath();ctx.moveTo(W/2+150,H/2-80);ctx.lineTo(W/2+dust*40,H/2);ctx.stroke();}`,
`()=>[downNeedle?"needle down":"click to drop", downNeedle?"dust · "+Math.round(dust*100)+"%":"waiting"]`);

family("walking-bass.html","Walking Bass","step","click for the next note · never the same one twice","#14161e","",
`const scale=["C","E","G","A","B","D"]; let last=-1,step=0; function onDown(){let n=rnd()*scale.length|0; if(n===last)n=(n+1)%scale.length; last=n; items.push(scale[n]); step++;}`,
``,
`ctx.fillStyle="#f4f7ff"; ctx.font="28px Georgia, serif"; ctx.textAlign="center"; items.slice(-8).forEach((n,i)=>ctx.fillText(n,W*(0.15+i*0.1),H/2));`,
`()=>["steps · "+step, items.length?items[items.length-1]:"click"]`);

family("washing-line.html","Washing Line","peg","click to peg a shirt · wind lifts the empty side","#8fb4d4","#hud{color:rgba(20,30,50,.85)}#title b{color:#162033}",
`function onDown(){items.push({u:clamp(mx/W,0.1,0.9)});}`,
`const wind=Math.sin(t*0.001)*0.3;`,
`ctx.strokeStyle="#223"; ctx.beginPath();ctx.moveTo(40,H*0.4);ctx.quadraticCurveTo(W/2,H*0.4+40,W-40,H*0.4);ctx.stroke();
ctx.fillStyle="#f4f7ff"; for(const s of items){const x=s.u*W; ctx.fillRect(x,H*0.42,24,30);}`,
`()=>["pegs · "+items.length,"gust · "+wind.toFixed(2)]`);

family("water-clock.html","Water Clock","drip","one bowl fills, tips, and starts the next","#142028","",
`let fill=[0,0,0],cur=0;`,
`fill[cur]+=0.004; if(fill[cur]>=1){fill[cur]=0; cur=(cur+1)%3;}`,
`for(let i=0;i<3;i++){const x=W*(0.25+i*0.25); ctx.strokeStyle="#d5e6ee"; ctx.strokeRect(x-30,H*0.45,60,80);
  ctx.fillStyle="rgba(140,190,210,.8)"; ctx.fillRect(x-30,H*0.45+80-76*fill[i],60,76*fill[i]);}`,
`()=>["bowl · "+(cur+1),"filling"]`);

family("wave-tank.html","Wave Tank","push","click to push the paddle · the far wall answers","#0e2430","",
`const N=48; const y=new Array(N).fill(0),v=new Array(N).fill(0); function onDown(){v[2]+=-4;}`,
`for(let i=1;i<N-1;i++)v[i]+= (y[i-1]+y[i+1]-2*y[i])*0.06; for(let i=0;i<N;i++){v[i]*=0.992; y[i]+=v[i];}`,
`ctx.beginPath(); for(let i=0;i<N;i++){const x=i/(N-1)*W; i?ctx.lineTo(x,H*0.5+y[i]*20):ctx.moveTo(x,H*0.5+y[i]*20);} ctx.strokeStyle="#bfe6f2"; ctx.stroke();`,
`()=>["cells · "+N,"reflections come back"]`);

family("weather-vane.html","Weather Vane","turn","it hunts the cursor and overshoots","#243044","",
`let ang=0,va=0;`,
`const target=Math.atan2(my-H/2,mx-W/2); let d=target-ang; if(d>3.14)d-=6.28; if(d<-3.14)d+=6.28; va+=d*0.01; va*=0.92; ang+=va;`,
`ctx.save();ctx.translate(W/2,H/2);ctx.rotate(ang); ctx.fillStyle="#f4f7ff"; ctx.fillRect(-60,-3,120,6); ctx.fillRect(40,-14,8,16); ctx.restore();`,
`()=>["overshoot","it never quite stops"]`);

family("well-bucket.html","Well","haul","click to lower · it comes up heavier","#1c1814","",
`let depth=0,going=true,loads=0; function onDown(){going=!going; if(!going)loads++;}`,
`depth=clamp(depth+(going?0.004:-0.002),0,1);`,
`ctx.strokeStyle="#c8b498"; ctx.beginPath();ctx.moveTo(W/2,40);ctx.lineTo(W/2,40+depth*(H*0.7));ctx.stroke();
ctx.fillStyle="#b08968"; ctx.fillRect(W/2-16,40+depth*(H*0.7),32,24);`,
`()=>["depth · "+Math.round(depth*100)+"%","hauled · "+loads]`);

family("willow.html","Willow","wind","branches trail the gust","#16301c","",
`let gust=0;`,
`gust=lerp(gust,(mx-W/2)/80,0.02);`,
`ctx.strokeStyle="#d5e6c8"; ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(W/2,H);ctx.lineTo(W/2,H*0.35);ctx.stroke();
for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(W/2,H*0.4); ctx.quadraticCurveTo(W/2+i*30+gust*20,H*0.6,W/2+i*50+gust*60,H*0.85);ctx.stroke();}`,
`()=>["gust · "+gust.toFixed(2),"they follow late"]`);

family("window-frost-name.html","Window Frost","write","drag a name · frost closes over it","#c5d6e4","#hud{color:rgba(20,36,56,.85)}#title b{color:#163044}",
`let marks=[]; function onDown(){} `,
`if(down)marks.push({x:mx,y:my,life:1}); for(const m of marks)m.life*=0.997; marks=marks.filter(m=>m.life>0.05);`,
`ctx.fillStyle="rgba(255,255,255,.5)"; for(let i=0;i<300;i++)ctx.fillRect((i*97%997)/997*W,(i*53%991)/991*H,1.4,1.4);
ctx.globalCompositeOperation="destination-out"; for(const m of marks){ctx.fillStyle=\`rgba(0,0,0,\${m.life})\`; ctx.beginPath();ctx.arc(m.x,m.y,14,0,6.3);ctx.fill();}
ctx.globalCompositeOperation="source-over";`,
`()=>["marks · "+marks.length,"closing over"]`);

family("wire-loop.html","Wire Loop","steady","guide the cursor along the wire","#1a1c22","",
`let hits=0,was=false;`,
`const y=H*0.5+Math.sin(mx*0.01)*70; const touch=Math.abs(my-y)<16; if(touch&&!was)hits++; was=touch;`,
`ctx.strokeStyle="#d5dbe6"; ctx.lineWidth=3; ctx.beginPath(); for(let x=40;x<W-40;x+=8){const yy=H*0.5+Math.sin(x*0.01)*70; x===40?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke();
ctx.strokeStyle=touch?"#e25b45":"#f4f7ff"; ctx.beginPath();ctx.arc(mx,my,12,0,6.3);ctx.stroke();`,
`()=>["touches · "+hits, touch?"buzz":"clear"]`);

family("wish-paper.html","Wish Paper","burn","type a wish, press Enter · it burns and lifts","#1c1410","",
`let wish="",ashes=[]; addEventListener("keydown",e=>{if(e.key==="Enter"&&wish){for(let i=0;i<wish.length;i++)ashes.push({ch:wish[i],x:W/2+(i-wish.length/2)*16,y:H*0.6,vy:-1,life:1}); wish="";}
  else if(e.key==="Backspace")wish=wish.slice(0,-1); else if(e.key.length===1&&wish.length<24)wish+=e.key;});`,
`for(const a of ashes){a.y+=a.vy; a.life*=0.99;} ashes=ashes.filter(a=>a.life>0.05);`,
`ctx.fillStyle="#f4efe4"; ctx.font="24px Georgia, serif"; ctx.textAlign="center"; ctx.fillText(wish,W/2,H*0.6);
for(const a of ashes){ctx.globalAlpha=a.life; ctx.fillStyle="#e25b45"; ctx.fillText(a.ch,a.x,a.y);} ctx.globalAlpha=1;`,
`()=>["wish", ashes.length?"rising":"enter to burn"]`);

family("wood-grain.html","Wood Grain","follow","the line never repeats · trace it","#6b3e22","#hud{color:rgba(255,236,214,.8)}#title b{color:#f4e4d4}",
``,
``,
`ctx.lineWidth=1.4; for(let i=0;i<40;i++){ctx.strokeStyle="rgba(40,18,8,.45)"; ctx.beginPath();
  for(let x=0;x<=W;x+=10){const y=i*18+Math.sin(x*0.01+i)*10+Math.sin(x*0.003*i)*16; x?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke();}`,
`()=>["rings","no two boards match"]`);

family("wool-card.html","Wool","pull","drag · fibers catch and line up","#d8cbb8","#hud{color:rgba(40,30,20,.85)}#title b{color:#24180e}",
`for(let i=0;i<80;i++)items.push({x:rnd()*900,y:rnd()*600,a:rnd()*3});`,
`if(down)for(const f of items){const d=Math.hypot(f.x-mx,f.y-my); if(d<80){f.x+=(mx-f.x)*0.05; f.a=lerp(f.a,0,0.1);}}`,
`ctx.strokeStyle="#6b5344"; for(const f of items){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a); ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke(); ctx.restore();}`,
`()=>["fibers · "+items.length,"align as you pull"]`);

family("x-ray-leaf.html","X-Ray Leaf","hold","hold still · the veins fade in","#102018","",
`let still=0,px=0,py=0;`,
`if(Math.hypot(mx-px,my-py)<2)still=Math.min(1,still+0.005); else still*=0.98; px=mx;py=my;`,
`ctx.save();ctx.translate(W/2,H/2); ctx.strokeStyle=\`rgba(180,230,190,\${0.2+still*0.8})\`; ctx.lineWidth=2;
function vein(len,ang,d){if(d<=0)return; ctx.save();ctx.rotate(ang); ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len);ctx.stroke(); ctx.translate(0,-len);
  vein(len*0.7,-0.5,d-1); vein(len*0.7,0.5,d-1); ctx.restore();} vein(80,0,5+Math.round(still*3)); ctx.restore();`,
`()=>["focus · "+Math.round(still*100)+"%","keep still"]`);

family("yarn-crawl.html","Yarn Crawl","knit","the stitch walks where you point","#2a1420","",
`let x=0,y=0,ready=false; const stitches=[];`,
`if(!ready&&W){x=W/2;y=H/2;ready=true;} const dx=mx-x,dy=my-y,d=Math.hypot(dx,dy)||1; if(d>12){x+=dx/d*1.6;y+=dy/d*1.6; if(stitches.length===0||Math.hypot(stitches[stitches.length-1].x-x,stitches[stitches.length-1].y-y)>10)stitches.push({x,y});}`,
`ctx.strokeStyle="#e7b0c8"; ctx.lineWidth=2; ctx.beginPath(); stitches.forEach((s,i)=>{const o=Math.sin(i)*4; i?ctx.lineTo(s.x,s.y+o):ctx.moveTo(s.x,s.y+o);}); ctx.stroke();`,
`()=>["stitches · "+stitches.length,"point somewhere"]`);

family("yoyo.html","Yo-yo","throw","click to throw · it climbs back","#1c1820","",
`let y=0,vy=0,thrown=false,ready=false; function onDown(){if(!thrown){thrown=true;vy=6;}}`,
`if(!ready&&H){y=H*0.3;ready=true;} if(thrown){vy+=0.25; y+=vy; if(y>H*0.8){y=H*0.8; vy=-Math.abs(vy)*0.72;} if(Math.abs(vy)<0.6&&y<H*0.4){thrown=false;}}`,
`ctx.strokeStyle="#f4f7ff"; ctx.beginPath();ctx.moveTo(W/2,40);ctx.lineTo(W/2,y);ctx.stroke();
ctx.fillStyle="#e25b45"; ctx.beginPath();ctx.arc(W/2,y,16,0,6.3);ctx.fill();`,
`()=>[thrown?"out":"wound","click to throw"]`);

family("zen-bell.html","Zen Bell","strike","click once","#141614","",
`let struck=0; function onDown(){if(!struck)struck=performance.now();}`,
`const age=struck?(performance.now()-struck)/1000:0;`,
`ctx.strokeStyle="rgba(230,230,220,.8)"; ctx.lineWidth=3; ctx.beginPath();ctx.arc(W/2,H/2,40,0.4,2.7);ctx.stroke();
if(struck){ctx.globalAlpha=Math.max(0,1-age/6); ctx.beginPath();ctx.arc(W/2,H/2,40+age*40,0,6.3);ctx.stroke(); ctx.globalAlpha=1;}`,
`()=>[struck?"ringing":"waiting","once is enough"]`);

family("ziggurat.html","Ziggurat","stack","click to lay a course · each one must be smaller","#2a2016","",
`let width=260,msg="lay a course"; function onDown(){const w=40+rnd()*220; if(w<width){items.push(w);width=w;msg="course laid";} else msg="too wide";}`,
``,
`let y=H*0.8; for(let i=items.length-1;i>=0;i--){const w=items[i]; ctx.fillStyle=\`hsl(\${28+i*6},40%,\${40+i}%)\`; ctx.fillRect(W/2-w/2,y-18,w,18); y-=18;}`,
`()=>["courses · "+items.length,msg]`);

family("zodiac-wheel.html","Zodiac Wheel","turn","drag across to spin","#100c18","",
`const signs=["ram","bull","twins","crab","lion","maiden","scales","scorpion","archer","goat","water","fish"];
let rot=0; addEventListener("pointermove",()=>{if(down)rot+=0.01;});`,
``,
`ctx.save();ctx.translate(W/2,H/2);ctx.rotate(rot); ctx.fillStyle="#f4efe4"; ctx.font="13px Segoe UI"; ctx.textAlign="center";
for(let i=0;i<12;i++){const a=i/12*6.2832; ctx.fillText(signs[i],Math.cos(a)*140,Math.sin(a)*140);} ctx.restore();
ctx.strokeStyle="rgba(244,239,228,.4)"; ctx.beginPath();ctx.arc(W/2,H/2,140,0,6.3);ctx.stroke();`,
`()=>["signs · 12","drag to turn the year"]`);

family("zone-plate.html","Zone Plate","focus","move left to right · a point appears, then smears","#101014","",
``,
``,
`const f=clamp(mx/Math.max(1,W),0,1); const cx=W/2,cy=H/2; for(let i=1;i<18;i++){ctx.strokeStyle=i%2?"#f4f7ff":"#101014"; ctx.lineWidth=2+f*3;
  ctx.beginPath();ctx.arc(cx,cy,i*i*0.6*(0.4+f),0,6.3);ctx.stroke();}
ctx.fillStyle=\`rgba(255,255,255,\${Math.max(0,1-Math.abs(f-0.5)*4)})\`; ctx.beginPath();ctx.arc(cx,cy,4,0,6.3);ctx.fill();`,
`()=>["focus · "+Math.round((1-Math.abs(clamp(mx/Math.max(1,W),0,1)-0.5)*2)*100)+"%","slide"]`);

family("zoo-of-lines.html","Zoo of Lines","sort","lines copy their neighbors, badly","#14161c","",
`for(let i=0;i<24;i++)items.push({x:40+i*30,ang:rnd()*6,want:0});`,
`for(let i=0;i<items.length;i++){const a=items[i]; const n=items[(i+1)%items.length]; a.want=n.ang+(down?0.4:0); a.ang=lerp(a.ang,a.want,0.05);}`,
`ctx.strokeStyle="#d6deee"; ctx.lineWidth=2; for(const L of items){ctx.save();ctx.translate(L.x,H/2);ctx.rotate(L.ang); ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,20);ctx.stroke(); ctx.restore();}`,
`()=>["lines · "+items.length,"hold to disturb them"]`);

let n = 0;
for (const [file, html] of toys) {
  writeFileSync(join(dir, file), html);
  n++;
}
console.log("wrote " + n);
