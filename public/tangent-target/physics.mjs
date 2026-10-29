export const TAU = Math.PI * 2;
export function orbit({h,k,r}, angle) {
  const cos=Math.cos(angle), sin=Math.sin(angle);
  return {x:h+r*cos,y:k+r*sin,dx:sin===0?0:-sin,dy:cos};
}
export function advance(p,dt,speed) { return {...p,x:p.x+p.dx*speed*dt,y:p.y+p.dy*speed*dt}; }
export function segmentDistance(a,b,p) {
  const x=b.x-a.x,y=b.y-a.y,l=x*x+y*y;
  const t=l?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/l)):0;
  return Math.hypot(p.x-a.x-t*x,p.y-a.y-t*y);
}
export function parseSlope(value) {
  const s=value.trim().toLowerCase().replace(/−/g,'-');
  if(['undefined','vertical','∞','infinity'].includes(s)) return Infinity;
  const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  if(!new RegExp(`^${number}(?:\\s*/\\s*${number})?$`).test(s)) return NaN;
  const [a,b]=s.split('/').map(Number);
  return b===0?NaN:b===undefined?a:a/b;
}
export function slope(p) {return Math.abs(p.dx)<1e-10?Infinity:p.dy/p.dx;}
export function round(code) {
  let seed=2166136261;for(const c of code) seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const circle={h:Math.floor(random()*3)-1,k:Math.floor(random()*3)-1,r:3};
  const solution=Math.floor(random()*360)*Math.PI/180;
  const p=orbit(circle,solution), target=advance(p,1,4+random()*1.5);
  return {circle,solution,target:{x:target.x,y:target.y}};
}
