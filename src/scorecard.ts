import {replay,type Control} from './race';
import {courses,courseOrder} from './courses';
import type {Racer} from './network';
export type CourseScore={strokes:number;finished:boolean};
export type RoundScore={epoch:number;closedAt?:number;results:Record<string,CourseScore>};
export type Scorecard=Record<string,RoundScore>;
export function snapshotRound(control:Control,racers:Record<string,Racer>,now:number):RoundScore|undefined{
 if(control.mission!==undefined||!['race','ended'].includes(control.phase)||Object.keys(racers).length===0)return;
 return{epoch:control.epoch,closedAt:control.endsAt??now,results:Object.fromEntries(Object.entries(racers).map(([id,r])=>{const event=r.launch?.epoch===control.epoch?r.launch:undefined;return[id,{strokes:event?.seq??0,finished:replay(courses[control.course],control,event,now).finishedAt!==undefined}];}))};
}
export function scoreRows(card:Scorecard,racers:{id:string;name:string;strokes:number;finished:boolean}[],control:Control):{id:string;name:string;total:number;completed:number;courses:(CourseScore|undefined)[]}[]{
 return racers.map(r=>{const scores=courseOrder.map(i=>card[String(i)]?.results[r.id]);
 if(control.mission===undefined&&['race','ended'].includes(control.phase)&&card[String(control.course)]?.epoch!==control.epoch)scores[courseOrder.indexOf(control.course)]={strokes:r.strokes,finished:r.finished};
 return{id:r.id,name:r.name,courses:scores,total:scores.reduce((sum,s)=>sum+(s?.strokes??0),0),completed:scores.filter(s=>s?.finished).length};
 }).sort((a,b)=>b.completed-a.completed||a.total-b.total||a.id.localeCompare(b.id));
}
