import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const GOLD = '#edc780';
const BLUE = '#91dfff';
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {const x = clamp(v); return x*x*(3-2*x);};
const range = (f: number, a: number, b: number) => smooth((f-a)/(b-a));
const gauss = (x: number) => Math.exp(-x*x/2);
// Fixed seed: every frame is a pure function of frame number and particle index.
const rng = (seed: number) => {let n = seed >>> 0; return () => {n = (Math.imul(n,1664525)+1013904223) >>> 0; return (n+1)/4294967297;};};
const random = rng(950713);
const particles = Array.from({length:4200}, (_,i) => {
 // Standardized sum of 48 independent uniform trials (central limit theorem).
 let sum=0; for(let trial=0;trial<48;trial++) sum+=random()-.5;
 const x = sum/Math.sqrt(48/12);
 return {x, y: random(), z:random(), seed:random()*Math.PI*2, initialX:random()*2500-290, initialY:random()*1500-210, r:0.65+random()*1.7, gold:i%5===0, delay:random()*50};
});

function project(x:number, y:number, z:number, f:number) {
 const orbit = range(f,330,500)*0.19 - range(f,730,850)*0.12;
 const tail = range(f,540,720);
 const zoom = 1+tail*1.75;
 const px = x*Math.cos(orbit)+z*Math.sin(orbit);
 const pz = -x*Math.sin(orbit)+z*Math.cos(orbit);
 const perspective = 1300/(1300+pz);
 return {x:960+(px-tail*570)*perspective*zoom, y:760+(y+tail*80)*perspective*zoom, scale:perspective*zoom};
}
const curve = (f:number, depth=0) => Array.from({length:221},(_,i)=> {
 const x=-3.8+i*7.6/220;
 const p=project(x*235,-gauss(x)*410,depth,f);
 return `${i===0?'M':'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
}).join(' ');

const ParticleField: React.FC<{frame:number}> = ({frame:f}) => {
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=> {
  const ctx=ref.current?.getContext('2d'); if(!ctx)return;
  ctx.clearRect(0,0,1920,1080);
  const settle=range(f,150,330); const fade=1-range(f,750,875);
  ctx.globalCompositeOperation='lighter';
  // Batched paths keep thousands of deterministic particles economical to render.
  for(let color=0;color<2;color++) for(let layer=0;layer<3;layer++) {
   ctx.beginPath();
   for(const p of particles) {
    if(Number(p.gold)!==color || Math.floor(p.z*3)!==layer)continue;
    const appear=range(f,p.delay,p.delay+85); if(appear<=0)continue;
    const floatingX=p.initialX+Math.sin(f*0.013+p.seed)*27;
    const floatingY=p.initialY+Math.cos(f*0.009+p.seed)*32;
    const target=project(p.x*235,-p.y*gauss(p.x)*410,(p.z-.5)*240,f);
    const trial= (1-settle)*range(f,150,210)*Math.sin(p.seed+f*.08)*90;
    const x=floatingX*(1-settle)+target.x*settle;
    const y=floatingY*(1-settle)+target.y*settle+trial;
    const dissolve=range(f,750,880);
    const dx=x+Math.cos(p.seed)*dissolve*190;
    const dy=y-dissolve*(80+p.z*180);
    const r=p.r*appear*(.7+target.scale*.3);
    ctx.moveTo(dx+r,dy);ctx.arc(dx,dy,r,0,Math.PI*2);
   }
   ctx.fillStyle=color?GOLD:BLUE;ctx.globalAlpha=(.25+layer*.18)*fade;
   ctx.fill();
  }
  // Sparse larger luminous points, with an explicit radial falloff.
  for(let i=0;i<particles.length;i+=61) {
   const p=particles[i];const appear=range(f,p.delay,p.delay+85);
   const target=project(p.x*235,-p.y*gauss(p.x)*410,(p.z-.5)*240,f);
   const x=p.initialX*(1-settle)+target.x*settle;
   const y=p.initialY*(1-settle)+target.y*settle;
   const g=ctx.createRadialGradient(x,y,0,x,y,13);g.addColorStop(0,p.gold?'#ffd990':'#b9eaff');g.addColorStop(1,'transparent');
   ctx.globalAlpha=fade*appear*(.4+.2*Math.sin(f*.03+p.seed));ctx.fillStyle=g;ctx.fillRect(x-13,y-13,26,26);
  }
  ctx.globalAlpha=1;
 },[f]);
 return <canvas ref={ref} width={1920} height={1080} style={{position:'absolute',inset:0}}/>;
};

const Caption: React.FC<{frame:number;start:number;end:number;children:React.ReactNode;small?:boolean}> = ({frame,start,end,children,small}) => {
 const opacity=range(frame,start,start+22)*(1-range(frame,end-25,end));
 const lift=(1-range(frame,start,start+35))*24;
 return <div style={{position:'absolute',top:small?455:175,width:'100%',textAlign:'center',opacity,transform:`translateY(${lift}px)`,fontFamily:'"Noto Serif CJK SC", serif',fontSize:small?68:57,fontWeight:500,letterSpacing:8,color:'#f3eee4',textShadow:'0 0 35px #e9c17a33'}}>{children}</div>;
};

export const ProbabilityFilm: React.FC = () => {
 const f=useCurrentFrame();const curveOpacity=range(f,330,365)*(1-range(f,748,810));
 const trace=interpolate(f,[330,475],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const tail=range(f,540,630)*(1-range(f,730,765));
 const title=range(f,50,85)*(1-range(f,125,150));
 return <AbsoluteFill style={{background:'#030609',overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 64%, #102330 0%, #080e16 38%, #020305 80%)',opacity:.75}}/>
  <svg width="1920" height="1080" style={{position:'absolute'}}>
   <defs><filter id="glow"><feGaussianBlur stdDeviation="8"/></filter><linearGradient id="line"><stop stopColor="#9fe6ff"/><stop offset=".5" stopColor={GOLD}/><stop offset="1" stopColor="#fff1c7"/></linearGradient></defs>
   <g opacity={range(f,220,330)*(1-range(f,735,810))*.16} stroke={BLUE} fill="none">
    {[0,1,2,3].map(i=><path key={i} d={curve(f,(i-1.5)*125)} strokeWidth="1"/>)}
    {[-3,-2,-1,0,1,2,3].map(x=> {const a=project(x*235,0,-150,f),b=project(x*235,0,150,f);return <path key={x} d={`M${a.x},${a.y} L${b.x},${b.y}`}/>;})}
   </g>
  </svg>
  <ParticleField frame={f}/>
  <svg width="1920" height="1080" style={{position:'absolute'}}>
   <g opacity={curveOpacity} fill="none" stroke="url(#line)" strokeDasharray={`${trace} 1`}>
    <path d={curve(f)} pathLength={1} strokeWidth="13" filter="url(#glow)" opacity=".55"/>
    <path d={curve(f)} pathLength={1} strokeWidth="2.8"/>
   </g>
   {f>=540 && f<780 && (()=> {const p=project(2.65*235,-gauss(2.65)*410,0,f);return <g opacity={tail}><circle cx={p.x} cy={p.y} r={13+Math.sin(f*.1)*3} fill="none" stroke={GOLD}/><circle cx={p.x} cy={p.y} r="4" fill="#fff0bf"/><path d={`M${p.x},${p.y+25}v65h130`} fill="none" stroke={GOLD} opacity=".6"/><text x={p.x+145} y={p.y+95} fill={GOLD} fontSize="24" fontFamily="sans-serif">P(Z ≥ 2.65) ≈ 0.40%</text></g>;})()}
  </svg>
  <div style={{position:'absolute',left:90,top:64,color:'#afc5cf',fontFamily:'sans-serif',fontSize:17,letterSpacing:5,opacity:.6*(1-range(f,825,890))}}>VIBE 知识大赏 <span style={{marginLeft:30,color:GOLD}}>01 / 概率的几何</span></div>
  <div style={{position:'absolute',bottom:83,left:92,color:BLUE,fontFamily:'monospace',fontSize:20,letterSpacing:2,opacity:range(f,345,390)*(1-range(f,530,555))}}>f(x) = exp(−x² / 2) / √(2π)</div>
  <div style={{position:'absolute',bottom:83,right:92,color:'#839aa8',fontFamily:'sans-serif',fontSize:16,letterSpacing:3,opacity:range(f,175,220)*(1-range(f,310,335))}}>重复试验 / 独立、同分布的样本均值趋于钟形</div>
  <div style={{position:'absolute',top:345,width:'100%',textAlign:'center',color:GOLD,fontFamily:'"Noto Serif CJK SC",serif',fontSize:82,letterSpacing:15,opacity:title}}>如果概率有形状</div>
  <Caption frame={f} start={5} end={149}>运气，真的存在形状吗？</Caption>
  <Caption frame={f} start={335} end={535}>随机之中，也有规律。</Caption>
  <Caption frame={f} start={545} end={746}>罕见，不等于不可能。</Caption>
  <Caption frame={f} start={765} end={900} small>概率不是命运的预言。</Caption>
  <div style={{position:'absolute',top:575,width:'100%',textAlign:'center',color:GOLD,fontFamily:'sans-serif',fontSize:19,letterSpacing:9,opacity:range(f,800,840)*(1-range(f,875,900))}}>它描述可能，而非注定</div>
  <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse, transparent 38%, #000000aa 100%)'}}/>
 </AbsoluteFill>;
};
