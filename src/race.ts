import {simulate,shotPointAt,settleDuration,isGoal,type Course,type Point} from './physics';
export type Control={epoch:number;course:number;phase:'lobby'|'practice'|'race'|'ended'|'study'|'fired';startsAt:number;endsAt?:number;mission?:number;studySeconds?:number;reveal?:boolean;strokeScoring?:boolean;trainingFlag?:number;soloIsland?:boolean};
export type Launch={epoch:number;seq:number;x:number;y:number;angle:number;power:number;at:number};
export function canLaunch(c:Control,t:number):boolean{return(c.phase==='practice'||c.phase==='race')&&t>=c.startsAt;}
export function previewMode(c:Control,enabled:boolean,flying:boolean):'none'|'direction'|'trajectory'{if(!enabled||flying||c.mission!==undefined)return'none';return c.phase==='practice'&&c.course===0?'trajectory':c.phase==='practice'||c.phase==='race'?'direction':'none';}
const cache=new WeakMap<Launch,ReturnType<typeof simulate>>();
export function replay(course:Course,c:Control,e:Launch|undefined,now:number):{position:Point;flying:boolean;rolling:boolean;moving:boolean;finishedAt?:number;overshot?:boolean}{
 if(c.phase==='ended')now=Math.min(now,c.endsAt??now);
 if(!e||e.epoch!==c.epoch||e.at<c.startsAt||e.at>now)return{position:course.checkpoints[0],flying:false,rolling:false,moving:false};
 let f=cache.get(e);if(!f){try{f=simulate(course,{x:e.x,y:e.y},e.angle,e.power);cache.set(e,f);}catch{return{position:course.checkpoints[0],flying:false,rolling:false,moving:false};}}
 const time=(now-e.at)/1000,flying=time<f.duration,moving=time<settleDuration(f),rolling=!flying&&moving;
 const overshot=!f.recovered&&f.end.x>course.finish&&!isGoal(course,f.end),recovery=[...course.checkpoints].reverse().find(p=>p.x<=e.x&&p.x<course.finish)??course.checkpoints[0];
 return{position:moving?shotPointAt(f,time):overshot?recovery:f.end,flying,rolling,moving,overshot:!moving&&overshot,finishedAt:!moving&&!f.recovered&&isGoal(course,f.end)?e.at+settleDuration(f)*1000:undefined};
}
export function compareScore(a:{strokes:number;timeMs?:number},b:{strokes:number;timeMs?:number}){return a.strokes-b.strokes||((a.timeMs??Infinity)-(b.timeMs??Infinity))||0;}
export function leaderboard<T extends {id:string;x:number;seq?:number;finishedAt?:number}>(rows:T[]):T[]{return[...rows].sort((a,b)=>{if(a.finishedAt!==undefined&&b.finishedAt!==undefined)return compareScore({strokes:a.seq??0,timeMs:a.finishedAt},{strokes:b.seq??0,timeMs:b.finishedAt})||a.id.localeCompare(b.id);if(a.finishedAt!==undefined||b.finishedAt!==undefined)return a.finishedAt!==undefined?-1:1;return b.x-a.x||a.id.localeCompare(b.id);});}
