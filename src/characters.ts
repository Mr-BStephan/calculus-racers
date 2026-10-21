export const palette=['#ff905e','#7bdcb6','#b7a0ff','#ffd36e','#77c9ff','#ff91be','#d6e57d','#f2ae7e','#ef6478','#45b9b0','#8290ee','#c9d5df'];
export const colorNames=['Coral','Mint','Lavender','Sunshine','Sky','Pink','Lime','Peach','Ruby','Teal','Indigo','Silver'];
export const spriteNames=['Fox','Frog','Bunny','Chick','Penguin','Cat','Sprout','Bear','Raccoon','Owl','Axolotl','Turtle','Dragon','Robot','Octopus','Unicorn'];
const defaults=[0,1,2,3,4,5,6,7,8,9,10,1,6,11,4,2];
export function validateAppearance(sprite:number,color?:number,width=1,height=1):void{if(![width,height].every(v=>Number.isFinite(v)&&v>=.75&&v<=1.35))throw new Error('Character width and height must be 75–135%.');if(!Number.isInteger(sprite)||sprite<0||sprite>=spriteNames.length||color!==undefined&&(!Number.isInteger(color)||color<0||color>=palette.length))throw new Error('Choose a supported racer and color.');}
export function appearance(sprite:number,color?:number):{name:string;fill:string;color:number}{const id=Number.isInteger(sprite)&&sprite>=0&&sprite<spriteNames.length?sprite:0;const tint=color!==undefined&&Number.isInteger(color)&&color>=0&&color<palette.length?color:defaults[id];return{name:spriteNames[id],fill:palette[tint],color:tint};}

/** Same original procedural art is used on the course and in the picker. */
export function drawCharacter(c:CanvasRenderingContext2D,x:number,y:number,id:number,color?:number,width=1,height=1){
 const {fill}=appearance(id,color);c.save();c.translate(x,y);c.scale(cosmeticScale(width),cosmeticScale(height));c.translate(0,-13);c.strokeStyle='#19354f';c.lineWidth=1.6;c.lineJoin='round';c.fillStyle=fill;
 const ellipse=(x:number,y:number,rx:number,ry:number,rotation=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill();c.stroke();};
 const triangle=(a:number[],b:number[],d:number[])=>{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();c.fill();c.stroke();};
 // Silhouette details come first so their bases disappear behind the body.
 if([0,5,9,15].includes(id))for(const sign of [-1,1])triangle([sign*4,-7],[sign*11,-23],[sign*16,0]);
 if(id===2)for(const sign of [-1,1])ellipse(sign*6,-17,4,12,sign*.2);
 if([7,8].includes(id))for(const sign of [-1,1])ellipse(sign*10,-11,6,6);
 if(id===6){c.fillStyle='#47aa72';ellipse(5,-21,8,4,-.6);c.fillStyle=fill;c.beginPath();c.moveTo(0,-10);c.lineTo(0,-21);c.stroke();}
 if(id===10)for(const sign of [-1,1])for(const offset of [-9,0,9]){c.beginPath();c.moveTo(sign*11,-2);c.lineTo(sign*23,-7+offset);c.lineWidth=3;c.stroke();ellipse(sign*23,-7+offset,2.7,2.7);}c.lineWidth=1.6;
 if(id===11)for(const sign of [-1,1]){ellipse(sign*13,11,6,4);ellipse(sign*15,-1,5,4);}
 if(id===12){for(const sign of [-1,1]){triangle([sign*9,2],[sign*27,-10],[sign*22,10]);triangle([sign*5,-10],[sign*9,-23],[sign*12,-9]);}triangle([8,12],[25,15],[17,4]);}
 if(id===13){c.beginPath();c.moveTo(0,-13);c.lineTo(0,-24);c.stroke();ellipse(0,-25,3,3);for(const sign of [-1,1]){c.beginPath();c.roundRect(sign*15-3,-4,6,12,2);c.fill();c.stroke();}}
 if(id===14)for(let i=0;i<5;i++)ellipse(-14+i*7,14,5,6,i%2?.25:-.25);
 if(id===15){c.fillStyle='#ffe09a';triangle([-4,-13],[0,-31],[5,-13]);c.fillStyle=fill;}
 c.beginPath();c.roundRect(-14,-12,28,28,id===13?4:11);c.fill();c.stroke();
 if(id===1)for(const sign of [-1,1])ellipse(sign*9,-10,5,5);
 if(id===8){c.fillStyle='#19354f99';ellipse(0,0,13,7);}
 c.fillStyle='#ffffff88';c.beginPath();c.ellipse(0,8,9,6,0,0,Math.PI*2);c.fill();
 if(id===11){c.strokeStyle='#19354f66';c.beginPath();c.moveTo(-9,8);c.lineTo(9,8);c.moveTo(0,4);c.lineTo(0,14);c.stroke();c.strokeStyle='#19354f';}
 if(id===9){c.fillStyle='#fffce5';for(const sign of [-1,1])ellipse(sign*6,-2,6,7);}
 if(id===4){c.fillStyle='#ffffffbb';c.beginPath();c.ellipse(0,6,10,10,0,0,Math.PI*2);c.fill();}
 c.fillStyle='#19354f';for(const eyeX of [-5,5]){c.beginPath();c.arc(eyeX,-1,1.7,0,Math.PI*2);c.fill();}
 if([3,4,9].includes(id)){c.fillStyle='#f1ad51';triangle([-3,3],[3,3],[0,7]);}else{c.beginPath();c.arc(0,4,3,0,Math.PI);c.stroke();}
 if(id===5){c.beginPath();for(const sign of [-1,1]){c.moveTo(sign*8,4);c.lineTo(sign*18,2);c.moveTo(sign*8,6);c.lineTo(sign*18,7);}c.stroke();}
 if(id===13){c.strokeStyle='#fff9';c.beginPath();c.moveTo(-7,9);c.lineTo(7,9);c.stroke();}
 c.fillStyle='#ed7b8a88';c.fillRect(-10,2,4,2);c.fillRect(7,2,4,2);c.restore();
}

export function paintPortrait(canvas:HTMLCanvasElement,sprite:number,color?:number,width=1,height=1){const c=canvas.getContext('2d')!;const size=canvas.width/2;c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,size,size);c.save();c.translate(size/2,size*.86);const scale=size/(58*Math.max(1,cosmeticScale(width),cosmeticScale(height)));c.scale(scale,scale);drawCharacter(c,0,0,sprite,color,width,height);c.restore();}

export const cosmeticScale=(value?:number)=>Number.isFinite(value)&&value!>=.75&&value!<=1.35?value!:1;
