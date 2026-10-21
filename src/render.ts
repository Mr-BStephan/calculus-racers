import {pointAt,type Course,type Flight,type Point} from './physics';
import type {Mission} from './championship';
import {appearance,drawCharacter,palette as colors} from './characters';
export {palette as colors,spriteNames} from './characters';
export type DrawRacer={id:string;name:string;sprite:number;color?:number;position:Point;flying:boolean;finished?:boolean};
export type Scene={course:Course;racers:DrawRacer[];localId:string;spectator:boolean;aimAngle?:number;preview?:Flight;mission?:Mission;solution?:Flight;now:number;celebrate:boolean};
type Particle={x:number;y:number;vx:number;vy:number;life:number;color:string};
export class Renderer{
 ctx:CanvasRenderingContext2D;w=1000;h=450;camera=0;scale=5;lift=0;particles:Particle[]=[];lastStates=new Map<string,boolean>();last=0;destroyed=false;
 constructor(public canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;const dpr=Math.min(devicePixelRatio,2);canvas.width=r.width*dpr;canvas.height=r.height*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);});resize.observe(canvas);}
 screen(p:Point):Point{return{x:(p.x-this.camera)*this.scale,y:this.h*.78-(p.y-this.lift)*this.scale};}
 burst(p:Point,color:string,n=12){for(let i=0;i<n;i++)this.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*12,vy:Math.random()*15,life:.6+Math.random()*.4,color});if(this.particles.length>280)this.particles.splice(0,this.particles.length-280);}
 draw(s:Scene){const c=this.ctx,w=this.w,h=this.h,dt=Math.min(.04,(s.now-this.last)/1000||.016);this.last=s.now;
  const local=s.racers.find(r=>r.id===s.localId)??s.racers[0];const xs=s.racers.map(r=>r.position.x),ys=s.racers.map(r=>r.position.y);
  let desired=s.course.id==='moon'?2.8:6;
  if(s.mission)desired=Math.min(w/(s.mission.targetX*1.55),h/65);
  else if(s.spectator&&xs.length>1)desired=Math.min(desired,w/(Math.max(...xs)-Math.min(...xs)+70),h/(Math.max(...ys)-Math.min(...ys)+60));
  desired=Math.max(.5,desired);this.scale+=(desired-this.scale)*.07;
  const focus=s.mission?0:s.spectator&&xs.length?((Math.max(...xs)+Math.min(...xs))/2-w/this.scale*.5):(local?.position.x??0)-w/this.scale*.3;
  this.camera+=(Math.max(s.mission?-8: -4,Math.min(focus,s.course.length-w/this.scale+8))-this.camera)*.08;
  const lift=s.mission?0:Math.max(0,(s.spectator?Math.max(...ys,0):local?.position.y??0)-h*.48/this.scale);this.lift+=(lift-this.lift)*.07;
  const moon=s.course.id==='moon';const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,moon?'#20284f':'#b6e8ee');sky.addColorStop(1,moon?'#6d6ba5':'#eef5d9');c.fillStyle=sky;c.fillRect(0,0,w,h);
  if(moon){c.fillStyle='#fff8';for(let i=0;i<65;i++){const x=(i*137.3)%w,y=(i*79.7)%(h*.65);c.fillRect(x,y,i%4===0?3:1.5,1.5);}}
  else{c.fillStyle='#fff9';for(let i=0;i<7;i++){const x=((i*237-this.camera*1.4)%(w+250)+w+250)%(w+250)-90,y=45+(i%3)*28;c.beginPath();c.ellipse(x,y,47,12,0,0,Math.PI*2);c.ellipse(x+27,y-8,25,18,0,0,Math.PI*2);c.fill();}}
  c.fillStyle=moon?'#595c89':'#95c7b4';c.beginPath();c.moveTo(0,h);for(let x=0;x<=w+40;x+=40)c.lineTo(x,h*.64+Math.sin(x*.006+this.camera*.012)*25+Math.cos(x*.017)*18);c.lineTo(w,h);c.fill();
  c.fillStyle=moon?'#454d7b':'#78bda3';c.beginPath();c.moveTo(0,h);for(let x=0;x<=w+40;x+=40)c.lineTo(x,h*.74+Math.sin(x*.009+this.camera*.025)*23);c.lineTo(w,h);c.fill();
  if(s.mission)this.grid(s.mission);
  for(const poly of s.course.polygons){c.beginPath();poly.forEach((p,i)=>{const a=this.screen(p);if(i)c.lineTo(a.x,a.y);else c.moveTo(a.x,a.y);});c.closePath();c.fillStyle=moon?'#8d89ab':'#b87c55';c.fill();c.strokeStyle=moon?'#c7c6df':s.course.color;c.lineWidth=7;c.lineJoin='round';c.stroke();c.save();c.clip();c.fillStyle=moon?'#ffffff18':'#603e2524';for(let x=0;x<w;x+=27)for(let y=h*.4;y<h;y+=30)c.fillRect(x+((y/30)%2)*8,y,3,3);c.restore();}
  if(!s.mission){for(const cp of s.course.checkpoints.slice(1)){const p=this.screen(cp);c.fillStyle='#fff';c.fillRect(p.x,p.y-30,2,30);c.fillStyle='#f3c86a';c.beginPath();c.moveTo(p.x+2,p.y-30);c.lineTo(p.x+18,p.y-24);c.lineTo(p.x+2,p.y-18);c.fill();}
   const p=this.screen({x:s.course.finish,y:s.course.checkpoints.at(-1)!.y});c.fillStyle='#17334b';c.fillRect(p.x,p.y-88,4,88);for(let row=0;row<4;row++)for(let col=0;col<5;col++){c.fillStyle=(row+col)%2?'#fff':'#17334b';c.fillRect(p.x+4+col*8,p.y-88+row*8+Math.sin(s.now/230+col)*2,8,8);}c.fillStyle='#17334b';c.font='bold 10px system-ui';c.fillText('FINISH',p.x-17,p.y+20);}
  if(s.aimAngle!==undefined&&local&&!local.flying){const p=this.screen(local.position),a=s.aimAngle*Math.PI/180;c.save();c.translate(p.x,p.y-5);c.rotate(-a);c.strokeStyle='#234c68aa';c.fillStyle='#234c68aa';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.moveTo(19,0);c.lineTo(65,0);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(73,0);c.lineTo(62,-5);c.lineTo(62,5);c.closePath();c.fill();c.restore();}
  if(s.preview)this.path(s.preview,'#234c6899',true);
  if(s.solution){this.path(s.solution,'#f68b58',false);const p=pointAt(s.solution,(s.now/1000)%(s.solution.duration+1));this.sprite(this.screen(p),3,'Solution',true,s.now);}
  for(const r of s.racers){const prev=this.lastStates.get(r.id);if(prev!==undefined&&prev!==r.flying)this.burst(r.position,appearance(r.sprite,r.color).fill,r.flying?12:20);this.lastStates.set(r.id,r.flying);const p=this.screen(r.position);this.sprite(p,r.sprite,r.name,r.flying,s.now,r.id===s.localId,r.color);}
  const winner=s.racers.find(r=>r.finished)??local??s.racers[0];if(s.celebrate&&Math.random()<.2&&winner)this.burst({...winner.position,y:winner.position.y+12},colors[Math.floor(Math.random()*8)],5);
  for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=18*dt;const q=this.screen(p);c.globalAlpha=Math.max(0,p.life);c.fillStyle=p.color;c.fillRect(q.x,q.y,4,4);}c.globalAlpha=1;this.particles=this.particles.filter(p=>p.life>0);
 }
 path(f:Flight,color:string,dashed:boolean){const c=this.ctx;c.save();c.strokeStyle=color;c.lineWidth=2;if(dashed)c.setLineDash([4,7]);c.beginPath();for(let i=0;i<=100;i++){const p=this.screen(pointAt(f,f.duration*i/100));if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);}c.stroke();c.restore();}
 grid(m:Mission){const c=this.ctx;c.save();c.lineWidth=1;c.font='10px system-ui';for(let x=0;x<=m.targetX*1.5;x+=5){const p=this.screen({x,y:0});c.strokeStyle='#244b6020';c.beginPath();c.moveTo(p.x,15);c.lineTo(p.x,this.h-15);c.stroke();c.fillStyle='#25465a';c.fillText(String(x),p.x+3,p.y+16);}for(let y=0;y<60;y+=5){const p=this.screen({x:0,y});c.strokeStyle='#244b6020';c.beginPath();c.moveTo(0,p.y);c.lineTo(this.w,p.y);c.stroke();c.fillStyle='#25465a';c.fillText(String(y),p.x-17,p.y-3);}for(const [x,y,label] of [[0,0,'START'],[m.checkpointX,m.checkpointY,'CHECKPOINT'],[m.targetX,0,'TARGET']] as const){const p=this.screen({x,y});c.strokeStyle=label==='TARGET'?'#f06f41':'#225670';c.lineWidth=2;for(const radius of [7,13,20]){c.beginPath();c.arc(p.x,p.y,radius,0,Math.PI*2);c.stroke();}c.fillStyle='#1d3f56';c.font='bold 11px system-ui';c.fillText(`${label} (${x}, ${y})`,p.x-25,p.y-29);}c.restore();}
 sprite(p:Point,index:number,name:string,flying:boolean,now:number,local=false,color?:number){const c=this.ctx;c.save();c.translate(p.x,p.y+(flying?Math.sin(now/80)*1.5:0));if(flying)c.rotate(-.12);c.fillStyle='#17334b22';c.beginPath();c.ellipse(0,4,13,4,0,0,Math.PI*2);c.fill();drawCharacter(c,0,0,index,color);
  c.restore();c.save();c.font=`${local?'bold ':''}11px system-ui`;const text=name.slice(0,18),width=c.measureText(text).width;c.fillStyle=local?'#17334b':'#ffffffdd';c.beginPath();c.roundRect(p.x-width/2-7,p.y-55,width+14,19,6);c.fill();c.fillStyle=local?'#fff':'#19354f';c.textAlign='center';c.fillText(text,p.x,p.y-42);c.restore();}
}
