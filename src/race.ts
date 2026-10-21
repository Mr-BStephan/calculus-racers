import {simulate,pointAt,isGoal,type Course,type Point} from './physics';
export type Control={epoch:number;course:number;phase:'lobby'|'practice'|'race'|'ended'|'study'|'fired';startsAt:number;endsAt?:number;mission?:number;studySeconds?:number;reveal?:boolean;strokeScoring?:boolean;trainingFlag?:number;soloIsland?:boolean};
export type Launch={epoch:number;seq:number;x:number;y:number;angle:number;power:number;at:number};
export function canLaunch(c:Control,t:number):boolean{return(c.phase==='practice'||c.phase==='race')&&t>=c.startsAt;}
export function previewMode(c:Control,enabled:boolean,flying:boolean):'none'|'direction'|'trajectory'{if(!enabled||flying||c.mission!==undefined)return'none';return c.phase==='practice'?'trajectory':c.phase==='race'?'direction':'none';}
const cache=new WeakMap<Launch,ReturnType<typeof simulate>>();
export function replay(course:Course,c:Control,e:Launch|undefined,now:number):{position:Point;flying:boolean;finishedAt?:number;overshot?:boolean}{
 if(c.phase==='ended')now=Math.min(now,c.endsAt??now);
 if(!e||e.epoch!==c.epoch||e.at<c.startsAt||e.at>now)return{position:course.checkpoints[0],flying:false};
 let f=cache.get(e);if(!f){f=simulate(course,{x:e.x,y:e.y},e.angle,e.power);cache.set(e,f);}
 const time=(now-e.at)/1000,flying=time<f.duration;
 const overshot=!f.recovered&&f.end.x>course.finish&&!isGoal(course,f.end),recovery=[...course.checkpoints].reverse().find(p=>p.x<=e.x&&p.x<course.finish)??course.checkpoints[0];
 return{position:flying?pointAt(f,time):overshot?recovery:f.end,flying,overshot:!flying&&overshot,finishedAt:!flying&&!f.recovered&&isGoal(course,f.end)?e.at+f.duration*1000:undefined};
}
export function leaderboard<T extends {id:string;x:number;finishedAt?:number}>(rows:T[]):T[]{return[...rows].sort((a,b)=>{if(a.finishedAt!==undefined||b.finishedAt!==undefined)return(a.finishedAt??Infinity)-(b.finishedAt??Infinity)||a.id.localeCompare(b.id);return b.x-a.x||a.id.localeCompare(b.id);});}
