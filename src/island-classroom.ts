import {playbackMs} from './timing';
import {generateIsland} from './island';
import {simulate,isGoal} from './physics';
import type {Submission} from './network';
import {displayNickname} from './names';
export type IslandRecord={epoch:number;startsAt:number;shots?:Record<string,Submission>};
export type IslandHistory=Record<string,IslandRecord>;
export function islandSeed(epoch:number,uid:string){let hash=0;for(const c of uid)hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return (epoch%75+hash%75)%75;}
export type IslandRow={id:string;epoch:number;round:number;name:string;status:'Success'|'Fail'|'No shot'|'In flight';timeMs?:number};
const scoreCache=new WeakMap<Submission,{success:boolean;duration:number}>();
export function islandRows(history:IslandHistory,racers:Record<string,{name:string}>,_activeEpoch:number|undefined,now:number):IslandRow[]{
 const rows:IslandRow[]=[];
 Object.values(history).sort((a,b)=>a.epoch-b.epoch).forEach((round,index)=>{for(const id of new Set([...Object.keys(racers),...Object.keys(round.shots??{})])){const shot=round.shots?.[id];let status:IslandRow['status']='No shot',timeMs:number|undefined;
  if(shot?.epoch===round.epoch){try{let score=scoreCache.get(shot);if(!score){const mission=generateIsland(islandSeed(round.epoch,id)),flight=simulate(mission.course,{x:0,y:0},shot.angle,shot.power);score={success:!flight.recovered&&isGoal(mission.course,flight.end),duration:flight.duration};scoreCache.set(shot,score);}status=now<shot.at+3000+playbackMs(score.duration)?'In flight':score.success?'Success':'Fail';if(status==='Success'||status==='Fail')timeMs=score.duration*1000;}catch{status='Fail';}}
  rows.push({id,epoch:round.epoch,round:index+1,name:displayNickname(racers[id]?.name??'Racer'),status,...(timeMs!==undefined?{timeMs}:{})});
 }});return rows;
}
export class IslandScoreboard{
 element=document.createElement('section');private signature='';
 constructor(parent:HTMLElement,id:string){this.element.id=id;this.element.className='stroke-scoreboard island-scoreboard';this.element.innerHTML='<div class="scoreboard-heading"><h2>Championship score sheet</h2><span>ONE SHOT PER HOST ROUND</span></div><div class="scoreboard-scroll"><table><thead><tr><th>Racer</th><th>Round</th><th>Result</th><th>Sim. flight time</th></tr></thead><tbody></tbody></table></div>';parent.append(this.element);}
 render(rows:IslandRow[],localId:string){const signature=JSON.stringify([rows,localId]);if(signature===this.signature)return;this.signature=signature;this.element.hidden=!rows.length;const body=this.element.querySelector('tbody')!;body.replaceChildren();for(const row of [...rows].reverse()){const tr=document.createElement('tr');if(row.id===localId)tr.className='you';for(const text of [row.name,String(row.round),row.status,row.timeMs===undefined?'—':(row.timeMs/1000).toFixed(2)+' s']){const td=document.createElement('td');td.textContent=text;tr.append(td);}body.append(tr);}}
}
