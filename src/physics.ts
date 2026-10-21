export type Point = {x:number;y:number};
export type Course = {id:string;name:string;description:string;gravity:number;length:number;color:string;polygons:Point[][];checkpoints:Point[];finish:number;finishY?:number;finishRadius?:number};
export const goalPoint=(c:Course):Point=>({x:c.finish,y:c.finishY??c.checkpoints.at(-1)!.y});
export const isGoal=(c:Course,p:Point):boolean=>Math.hypot(p.x-c.finish,p.y-goalPoint(c).y)<=(c.finishRadius??6)+1e-9;
export type RollSegment={start:Point;end:Point;duration:number;speed:number;acceleration:number};
export type Flight = {start:Point;end:Point;impact:Point;vx:number;vy:number;gravity:number;duration:number;peak:number;recovered:boolean;roll?:RollSegment[]};
export const STEP=1/120;
export function validateSettings(angle:number,power:number){if(!Number.isFinite(angle)||!Number.isFinite(power)||angle<5||angle>85||power<5||power>35)throw new Error('Angle must be 5–85° and speed 5–35 m/s.');}
export function pointAt(f:Flight,t:number):Point{t=Math.max(0,Math.min(t,f.duration));return{x:f.start.x+f.vx*t,y:f.start.y+f.vy*t-f.gravity*t*t/2};}
function roots(a:number,b:number,c:number):number[]{if(Math.abs(a)<1e-12)return Math.abs(b)>1e-12?[-c/b]:[];const d=b*b-4*a*c;if(d<0)return[];return[(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)];}
export function simulate(c:Course,p:Point,angle:number,power:number):Flight{
 validateSettings(angle,power);if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!(c.gravity>0))throw new Error('Invalid physical conditions');
 const rad=angle*Math.PI/180,vx=power*Math.cos(rad),vy=power*Math.sin(rad);
 const f:Flight={start:{...p},end:{...p},impact:{...p},vx,vy,gravity:c.gravity,duration:60,peak:vy*vy/(2*c.gravity),recovered:false};
 // Solve exact ballistic intersection with each segment, then choose the first
 // contact in fixed time intervals. No frame-rate dependence or chord error.
 const contacts:{t:number;safe:boolean;poly:Point[];edge:number}[]=[];
 for(const poly of c.polygons){const orientation=Math.sign(poly.reduce((sum,a,i)=>{const b=poly[(i+1)%poly.length];return sum+a.x*b.y-b.x*a.y;},0));for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y;
  for(const t of roots(c.gravity*dx/2,vx*dy-vy*dx,(p.x-a.x)*dy-(p.y-a.y)*dx)){
   if(t< -1e-7||t>60)continue;const zero=t<=1e-7;if(zero&&(vx*dy-vy*dx)*orientation>=-1e-9)continue;const q={x:p.x+vx*t,y:p.y+vy*t-c.gravity*t*t/2};const u=((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy);
   if(u>=-1e-9&&u<=1+1e-9)contacts.push({poly,edge:i,t:Math.max(0,t),safe:!zero&&dx>0&&Math.abs(dy/dx)<=1.2&&vy-c.gravity*t<vx*dy/dx});
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
 if(hit?.safe){f.roll=downhill(hit.poly,hit.edge,f.impact,c.gravity);f.end=f.roll.at(-1)?.end??f.impact;}
 return f;
}

// Arcade settling: 9× downhill acceleration, capped at 24 m/s. Flat ground and
// local valleys stop motion; no momentum carries a racer up the next hill.
const ROLL_CAP=24;
function rollDistance(speed:number,a:number,t:number){const accelerating=Math.min(t,(ROLL_CAP-speed)/a);return speed*accelerating+a*accelerating*accelerating/2+ROLL_CAP*(t-accelerating);}
function downhill(poly:Point[],edge:number,start:Point,gravity:number):RollSegment[]{
 const segments:RollSegment[]=[];let position=start,speed=0;
 for(let n=0;n<poly.length;n++){
  const a=poly[edge],b=poly[(edge+1)%poly.length];
  if(b.x<=a.x||Math.abs(b.y-a.y)<1e-8)break;
  const direction=b.y<a.y?1:-1,end=direction===1?b:a;
  if(end.y>position.y+1e-8)break;
  const length=Math.hypot(end.x-position.x,end.y-position.y);
  if(length>1e-8){const acceleration=9*gravity*Math.abs(b.y-a.y)/Math.hypot(b.x-a.x,b.y-a.y),toCap=(ROLL_CAP-speed)/acceleration,capDistance=speed*toCap+acceleration*toCap*toCap/2,duration=length<=capDistance?2*length/(Math.sqrt(speed*speed+2*acceleration*length)+speed):toCap+(length-capDistance)/ROLL_CAP;segments.push({start:position,end,duration,speed,acceleration});speed=Math.min(ROLL_CAP,speed+acceleration*duration);}
  position=end;const next=(edge+direction+poly.length)%poly.length,na=poly[next],nb=poly[(next+1)%poly.length],destination=direction===1?nb:na;
  if(nb.x<=na.x||destination.y>=position.y-1e-8)break;
  edge=next;
 }
 return segments;
}
export const settleDuration=(f:Flight)=>f.duration+(f.roll??[]).reduce((sum,s)=>sum+s.duration,0);
export function shotPointAt(f:Flight,time:number):Point{
 if(time<=f.duration)return pointAt(f,time);
 let t=time-f.duration;
 for(const s of f.roll??[]){if(t<s.duration){const distance=rollDistance(s.speed,s.acceleration,Math.max(0,t)),length=Math.hypot(s.end.x-s.start.x,s.end.y-s.start.y),u=Math.min(1,distance/length);return{x:s.start.x+(s.end.x-s.start.x)*u,y:s.start.y+(s.end.y-s.start.y)*u};}t-=s.duration;}
 return f.end;
}
