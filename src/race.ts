import {simulate,pointAt,type Course,type Point} from './physics';
export type Control={epoch:number;course:number;phase:'lobby'|'practice'|'race'|'ended'|'study'|'fired';startsAt:number;endsAt?:number;mission?:number;studySeconds?:number;reveal?:boolean;strokeScoring?:boolean};
export type Launch={epoch:number;seq:number;x:number;y:number;angle:number;power:number;at:number};
export function canLaunch(c:Control,t:number):boolean{return(c.phase==='practice'||c.phase==='race')&&t>=c.startsAt;}
const cache=new WeakMap<Launch,ReturnType<typeof simulate>>();
export function replay(course:Course,c:Control,e:Launch|undefined,now:number):{position:Point;flying:boolean;finishedAt?:number}{
 if(c.phase==='ended')now=Math.min(now,c.endsAt??now);
 if(!e||e.epoch!==c.epoch||e.at<c.startsAt||e.at>now)return{position:course.checkpoints[0],flying:false};
 let f=cache.get(e);if(!f){f=simulate(course,{x:e.x,y:e.y},e.angle,e.power);cache.set(e,f);}
 const time=(now-e.at)/1000,flying=time<f.duration;
 return{position:flying?pointAt(f,time):f.end,flying,finishedAt:!flying&&!f.recovered&&f.end.x>=course.finish?e.at+f.duration*1000:undefined};
}
export function leaderboard<T extends {id:string;x:number;finishedAt?:number}>(rows:T[]):T[]{return[...rows].sort((a,b)=>{if(a.finishedAt!==undefined||b.finishedAt!==undefined)return(a.finishedAt??Infinity)-(b.finishedAt??Infinity)||a.id.localeCompare(b.id);return b.x-a.x||a.id.localeCompare(b.id);});}
