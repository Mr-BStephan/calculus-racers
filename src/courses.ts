import type {Course} from './physics';
const ground=(x:number,y:number,w:number,h=40)=>[{x,y},{x:x+w,y},{x:x+w,y:y-h},{x,y:y-h}];
export const courses:Course[]=[
 {id:'meadow',name:'Training Meadow',description:'Level 1 · Gentle terrain. Learn angle, speed and precise landings.',gravity:9.8,length:240,color:'#67cd94',finish:225,checkpoints:[{x:2,y:0},{x:82,y:3},{x:162,y:0}],polygons:[[{x:0,y:0},{x:45,y:0},{x:80,y:3},{x:110,y:3},{x:150,y:0},{x:240,y:0},{x:240,y:-40},{x:0,y:-40}]]},
 {id:'canyon',name:'Canyon Crossing',description:'Level 3 · Clear gaps and reach elevated shelves.',gravity:9.8,length:380,color:'#e6ac73',finish:365,checkpoints:[{x:2,y:0},{x:102,y:8},{x:212,y:4},{x:292,y:10}],polygons:[ground(0,0,65),ground(90,8,65),ground(185,4,70),ground(280,10,100)]},
 {id:'moon',name:'Moon Islands',description:'Level 4 · Low gravity, long gaps and precise floating-island landings.',gravity:1.62,length:1100,color:'#b7abf3',finish:1075,checkpoints:[{x:2,y:0},{x:272,y:12},{x:572,y:22},{x:842,y:8}],polygons:[ground(0,0,200,12),ground(260,12,210,12),ground(560,22,210,12),ground(830,8,270,12)]},
 {id:'summit',name:'Summit Gauntlet',description:'Level 5 · Combine slopes, walls, gaps and a precise final landing.',gravity:9.8,length:510,color:'#76c6de',finish:495,checkpoints:[{x:2,y:0},{x:137,y:5},{x:267,y:0},{x:397,y:6}],polygons:[[{x:0,y:0},{x:45,y:0},{x:65,y:12},{x:85,y:0},{x:105,y:0},{x:105,y:-40},{x:0,y:-40}],ground(130,5,105),ground(260,0,100),ground(390,6,120),ground(177,5,3,-13),ground(306,0,3,-18)]},
 {id:'hills',name:'Rolling Hills',description:'Level 2 · Read the slopes. Match your angle to rising ground.',gravity:9.8,length:300,color:'#94c777',finish:285,checkpoints:[{x:2,y:0},{x:122,y:0},{x:244,y:2}],polygons:[[{x:0,y:0},{x:40,y:0},{x:60,y:12},{x:90,y:12},{x:115,y:0},{x:150,y:0},{x:180,y:18},{x:210,y:18},{x:240,y:2},{x:300,y:2},{x:300,y:-40},{x:0,y:-40}]]}
];
// Preserve existing saved map IDs: meadow=0, canyon=1, moon=2, summit=3; hills is appended.
export const courseOrder=[0,4,1,2,3];
export const raceCourses=courseOrder.map(i=>courses[i]);
export const nextCourse=(current:number)=>courseOrder[(courseOrder.indexOf(current)+1)%courseOrder.length];
export function randomTrainingFlag(previous:number,entropy:number):number{const positions=Array.from({length:37},(_,i)=>40+i*5).filter(x=>x!==previous);if(!Number.isInteger(entropy)||entropy<0)throw new Error('Invalid random seed');return positions[entropy%positions.length];}
export function courseFor(control:{course:number;phase:string;trainingFlag?:number;mission?:number}):Course{
 const base=courses[control.course],x=control.trainingFlag;
 if(control.course!==0||control.phase!=='practice'||control.mission!==undefined||x===undefined||!Number.isInteger(x)||x<40||x>220||x%5!==0)return base;
 for(const poly of base.polygons)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(b.x>a.x&&x>=a.x&&x<=b.x)return{...base,finish:x,finishY:a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x)};}
 return base;
}
