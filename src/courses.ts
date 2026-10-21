import type {Course} from './physics';
const ground=(x:number,y:number,w:number,h=40)=>[{x,y},{x:x+w,y},{x:x+w,y:y-h},{x,y:y-h}];
export const courses:Course[]=[
 {id:'meadow',name:'Training Meadow',description:'Find your rhythm. Gentle hills, big possibilities.',gravity:9.8,length:240,color:'#67cd94',finish:225,checkpoints:[{x:2,y:0},{x:82,y:3},{x:162,y:0}],polygons:[[{x:0,y:0},{x:45,y:0},{x:80,y:3},{x:110,y:3},{x:150,y:0},{x:240,y:0},{x:240,y:-40},{x:0,y:-40}]]},
 {id:'canyon',name:'Canyon Race',description:'Clear the gaps. Stick the landing.',gravity:9.8,length:380,color:'#e6ac73',finish:365,checkpoints:[{x:2,y:0},{x:102,y:8},{x:212,y:4},{x:292,y:10}],polygons:[ground(0,0,65),ground(90,8,65),ground(185,4,70),ground(280,10,100)]},
 {id:'moon',name:'Moon Dash',description:'Less gravity. More airtime. Aim for the stars.',gravity:1.62,length:1100,color:'#b7abf3',finish:1075,checkpoints:[{x:2,y:0},{x:272,y:12},{x:572,y:22},{x:842,y:8}],polygons:[ground(0,0,200),ground(260,12,210),ground(560,22,210),ground(830,8,270)]},
 {id:'championship',name:'Championship',description:'Hills, walls and bold lines. Find your own route.',gravity:9.8,length:510,color:'#76c6de',finish:495,checkpoints:[{x:2,y:0},{x:137,y:5},{x:267,y:0},{x:397,y:6}],polygons:[[{x:0,y:0},{x:45,y:0},{x:65,y:12},{x:85,y:0},{x:105,y:0},{x:105,y:-40},{x:0,y:-40}],ground(130,5,105),ground(260,0,100),ground(390,6,120),ground(177,5,3,-13),ground(306,0,3,-18)]}
];
