import type {Course} from './physics';
import {appearance} from './characters';
export const progressRatio=(x:number,finish:number)=>Number.isFinite(x)&&finish>0?Math.max(0,Math.min(1,x/finish)):0;
export const racerOpacity=(local:boolean,spectator:boolean,distancePixels:number)=>local||spectator?1:distancePixels<80?.25:.65;
type MapRacer={id:string;sprite:number;color?:number;position:{x:number;y:number};finished?:boolean};
export function drawProgressMap(c:CanvasRenderingContext2D,w:number,course:Course,racers:MapRacer[],localId:string,camera:number,scale:number){
 const left=18,top=52,width=w-36,height=66;if(width<120)return;
 c.save();c.fillStyle='#fffdf2b8';c.strokeStyle='#ffffffaa';c.lineWidth=1;c.beginPath();c.roundRect(left,top,width,height,10);c.fill();c.stroke();
 const x=(value:number)=>left+18+progressRatio(value,course.length)*(width-36),topY=Math.max(25,...course.polygons.flatMap(p=>p.map(v=>v.y))),y=(value:number)=>top+height-15-Math.max(0,value)/topY*27;
 c.save();c.beginPath();c.rect(left+10,top+22,width-20,height-28);c.clip();c.fillStyle='#285a491c';c.strokeStyle='#386b58b0';c.lineWidth=2;
 for(const p of course.polygons){c.beginPath();p.forEach((v,i)=>{if(i)c.lineTo(x(v.x),y(v.y));else c.moveTo(x(v.x),y(v.y));});c.closePath();c.fill();c.stroke();}
 c.fillStyle='#37566c0a';c.strokeStyle='#37566c50';c.lineWidth=1;const a=x(camera),b=x(camera+w/scale);c.fillRect(a,top+24,Math.max(1,b-a),height-32);c.strokeRect(a,top+24,Math.max(1,b-a),height-32);c.restore();
 c.fillStyle='#f09345a0';const target=x(course.finish);c.fillRect(target-3,top+25,6,height-35);c.beginPath();c.moveTo(target,top+25);c.lineTo(target+10,top+29);c.lineTo(target,top+33);c.fill();
 const mine=racers.find(r=>r.id===localId),ordered=[...racers].sort((a,b)=>Number(a.id===localId)-Number(b.id===localId));
 for(const r of ordered){const local=r.id===localId;c.globalAlpha=local?1:.7;c.fillStyle=appearance(r.sprite,r.color).fill;c.strokeStyle=local?'#17334b':'#ffffff';c.lineWidth=local?2.5:1;c.beginPath();c.arc(x(r.position.x),Math.max(top+29,Math.min(top+height-12,y(r.position.y)-4)),local?6:3.5,0,Math.PI*2);c.fill();c.stroke();}c.globalAlpha=1;
 c.fillStyle='#294d5d';c.font='bold 9px system-ui';c.fillText('COURSE MAP',left+12,top+14);const label=mine?`YOU · ${Math.round(progressRatio(mine.position.x,course.finish)*100)}%`:`${racers.length} RACERS`;c.textAlign='right';c.fillText(label,left+width-12,top+14);c.restore();
}
