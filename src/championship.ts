import {validateSettings} from './physics';
export type Mission={checkpointX:number;checkpointY:number;targetX:number;gravity:number;a:number;b:number;angle:number;speed:number};
export function missionFromPoints(x:number,y:number,target:number):Mission{
 if(!(x>0&&x<target&&y>0))throw new Error('Invalid three-point mission');
 const a=y/(x*(x-target)),b=-a*target,angle=Math.atan(b)*180/Math.PI,speed=Math.sqrt(-9.8/(2*a*Math.cos(angle*Math.PI/180)**2));
 validateSettings(angle,speed);return{checkpointX:x,checkpointY:y,targetX:target,gravity:9.8,a,b,angle,speed};
}
export function generateMission(seed:number):Mission{const n=Math.abs(Math.trunc(seed));const target=32+(n%9)*4;return missionFromPoints(target/2,8+(Math.floor(n/9)%8)*2,target);}
export function trajectoryY(x:number,angle:number,speed:number,g:number):number{const r=angle*Math.PI/180;return x*Math.tan(r)-g*x*x/(2*speed*speed*Math.cos(r)**2);}
export function scoreShot(m:Mission,angle:number,speed:number):{landing:number;distance:number;checkpointError:number;points:number;duration:number}{
 validateSettings(angle,speed);const r=angle*Math.PI/180,duration=2*speed*Math.sin(r)/m.gravity,landing=speed*Math.cos(r)*duration,distance=Math.abs(landing-m.targetX);
 const checkpointError=Math.abs(trajectoryY(m.checkpointX,angle,speed,m.gravity)-m.checkpointY);
 return{landing,distance,checkpointError,points:Math.max(0,Math.round(1000-25*Math.max(0,distance-.15)-50*Math.max(0,checkpointError-.15))),duration};
}
