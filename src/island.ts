import {simulationSeconds,playbackMs} from './timing';
import {simulate,pointAt,isGoal,type Course,type Flight} from './physics';
export type IslandMission={seed:number;x:number;y:number;angle:number;speed:number;course:Course};
export function generateIsland(seed:number):IslandMission{
 if(!Number.isSafeInteger(seed)||seed<0)throw new Error('Invalid island seed');
 const x=40+(seed%15)*3,y=8+(Math.floor(seed/15)%5)*4,angle=55;
 const r=angle*Math.PI/180,speed=Math.sqrt(9.8*x*x/(2*Math.cos(r)**2*(x*Math.tan(r)-y)));
 const course:Course={id:'solo-island',name:'One-Shot Island Championship',description:'One island. One shot. Make it count.',gravity:9.8,length:180,color:'#70d4b0',finish:x,finishY:y,finishRadius:6,checkpoints:[{x:0,y:0}],polygons:[[{x:-8,y:0},{x:6,y:0},{x:6,y:-6},{x:-8,y:-6}],[{x:x-6,y},{x:x+6,y},{x:x+3,y:y-7},{x:x-4,y:y-9}]]};
 return{seed,x,y,angle,speed,course};
}
export class IslandRound{
 mission:IslandMission;shot?:{at:number;angle:number;speed:number;flight:Flight};
 constructor(seed:number){this.mission=generateIsland(seed);}
 launch(angle:number,speed:number,at:number){if(this.shot)throw new Error('One shot per island. Try a new island.');if(!Number.isFinite(at))throw new Error('Invalid launch time');this.shot={at,angle,speed,flight:simulate(this.mission.course,{x:0,y:0},angle,speed)};}
 state(now:number){const shot=this.shot;if(!shot)return{position:{x:0,y:0},flying:false,done:false,won:false};const elapsed=simulationSeconds(now-shot.at),f=shot.flight,done=now>=shot.at+playbackMs(f.duration);return{position:pointAt(f,elapsed),flying:now>=shot.at&&!done,done,won:done&&!f.recovered&&isGoal(this.mission.course,f.end)};}
}
