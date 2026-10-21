export type Point = {x:number;y:number};
export type Course = {id:string;name:string;description:string;gravity:number;length:number;color:string;polygons:Point[][];checkpoints:Point[];finish:number};
export type Flight = {start:Point;end:Point;impact:Point;vx:number;vy:number;gravity:number;duration:number;peak:number;recovered:boolean};
export const STEP=1/120;
export function validateSettings(angle:number,power:number){if(!Number.isFinite(angle)||!Number.isFinite(power)||angle<5||angle>85||power<5||power>40)throw new Error('Angle must be 5–85° and speed 5–40 m/s.');}
export function pointAt(f:Flight,t:number):Point{t=Math.max(0,Math.min(t,f.duration));return{x:f.start.x+f.vx*t,y:f.start.y+f.vy*t-f.gravity*t*t/2};}
function roots(a:number,b:number,c:number):number[]{if(Math.abs(a)<1e-12)return Math.abs(b)>1e-12?[-c/b]:[];const d=b*b-4*a*c;if(d<0)return[];return[(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)];}
export function simulate(c:Course,p:Point,angle:number,power:number):Flight{
 validateSettings(angle,power);if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!(c.gravity>0))throw new Error('Invalid physical conditions');
 const rad=angle*Math.PI/180,vx=power*Math.cos(rad),vy=power*Math.sin(rad);
 const f:Flight={start:{...p},end:{...p},impact:{...p},vx,vy,gravity:c.gravity,duration:60,peak:vy*vy/(2*c.gravity),recovered:false};
 // Solve exact ballistic intersection with each segment, then choose the first
 // contact in fixed time intervals. No frame-rate dependence or chord error.
 const contacts:{t:number;safe:boolean}[]=[];
 for(const poly of c.polygons){const orientation=Math.sign(poly.reduce((sum,a,i)=>{const b=poly[(i+1)%poly.length];return sum+a.x*b.y-b.x*a.y;},0));for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y;
  for(const t of roots(c.gravity*dx/2,vx*dy-vy*dx,(p.x-a.x)*dy-(p.y-a.y)*dx)){
   if(t< -1e-7||t>60)continue;const zero=t<=1e-7;if(zero&&(vx*dy-vy*dx)*orientation>=-1e-9)continue;const q={x:p.x+vx*t,y:p.y+vy*t-c.gravity*t*t/2};const u=((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy);
   if(u>=-1e-9&&u<=1+1e-9)contacts.push({t:Math.max(0,t),safe:!zero&&dx>0&&Math.abs(dy/dx)<=1.2&&vy-c.gravity*t<vx*dy/dx});
  }
 }}
 contacts.sort((a,b)=>a.t-b.t);const first=contacts[0];
 const death=roots(-c.gravity/2,vy,p.y+35).filter(t=>t>0).sort((a,b)=>a-b)[0]??60;
 const hit=first&&first.t<=death?first:undefined;
 const endTime=hit?.t??death;
 // Tick index bounds time progression; terminal contact retains exact root.
 const ticks=Math.ceil(endTime/STEP);f.duration=Math.min(ticks*STEP,endTime);
 f.impact=pointAt(f,f.duration);f.peak=Math.max(0,vy*Math.min(vy/c.gravity,f.duration)-c.gravity*Math.min(vy/c.gravity,f.duration)**2/2);
 f.recovered=!hit?.safe;f.end=f.recovered?{...([...c.checkpoints].reverse().find(cp=>cp.x<=p.x+1e-7)??c.checkpoints[0])}:f.impact;
 return f;
}
