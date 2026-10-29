import {TAU,orbit,advance,segmentDistance,parseSlope,slope,round} from './physics.mjs';

const $=id=>document.getElementById(id), canvas=$('board'), ctx=canvas.getContext('2d');
const W=900,H=680, teal='#328b79',coral='#da6783';
let S=42;
let mode='arcade', phase='ready', data, angle=0, shot=null, release=null, trail=[], particles=[];
let score=0,streak=0,level=1,correct=0,attempts=0,question=0,paused=false,last=0,clock=0;
let closest=Infinity, shotTime=0, activeCode='', memory=new Map(), storageWarning=false, audio;
let difficulty=3;
let landed=false, resultTime=0, shotRadius=null;
const fmt=n=>Math.abs(n)<.00001?'0':Number(n.toFixed(3)).toString();
const xy=p=>`(${fmt(p.x)}, ${fmt(p.y)})`;
const color=()=>mode==='calculus'?'#8863b4':mode==='oneshot'?'#ab791f':teal;
const screen=p=>({x:W/2+p.x*S,y:H/2-p.y*S});
function say(text,type=''){ $('feedback').textContent=text;$('feedback').className=`feedback ${type}`; }
function readResult(code){
  try {
    const result=JSON.parse(localStorage.getItem(`tangent-target-v1:${code}`));
    storageWarning=false;
    return memory.get(code)||result;
  }catch{storageWarning=true;return memory.get(code);}
}
function saveResult(result){
  try {
    const key=`tangent-target-v1:${activeCode}`, serialized=JSON.stringify(result);
    localStorage.setItem(key,serialized);
    if(localStorage.getItem(key)!==serialized)throw new Error('Storage verification failed');
    memory.set(activeCode,result);
    storageWarning=false;
    return true;
  }catch{storageWarning=true;return false;}
}
function equation({h,k,r}){const term=(v,n)=>n===0?v:`(${v} ${n<0?'+':'−'} ${Math.abs(n)})`;return `${term('x',h)}² + ${term('y',k)}² = ${r*r}`;}
function direction(p){const x=Math.abs(p.dx)<1e-8?'':p.dx>0?'right':'left',y=Math.abs(p.dy)<1e-8?'':p.dy>0?'up':'down';return [y,x].filter(Boolean).join('-');}
function explain(){const m=slope(release);return `Release ${xy(release)}. ${Number.isFinite(m)?`y′ = −(${fmt(release.x-data.circle.h)})/(${fmt(release.y-data.circle.k)}) = ${fmt(m)}. Tangent: y − (${fmt(release.y)}) = ${fmt(m)}[x − (${fmt(release.x)})].`:`y′ is undefined. Vertical tangent: x = ${fmt(release.x)}.`} Velocity points ${direction(release).replace('-',' and ')}.`;}
function updatePoint(){const p=orbit(data.circle,angle);$('point').textContent=`Release P = ${xy(p)}${mode==='oneshot'?` · Target T = ${xy(data.target)}`:''}`;$('angle-output').textContent=`${fmt(angle*180/Math.PI)}°`;}
function updateStats(){$('score').textContent=String(score).padStart(4,'0');$('streak').textContent=mode==='calculus'?`${correct}/${attempts}`:mode==='oneshot'?(phase==='ready'?'1':'0'):`${streak}×`;}
function setControls(){
  const done=phase==='done',flying=phase==='flight';
  $('difficulty').disabled=done||flying;
  $('launch').hidden=mode==='calculus'||done||flying;
  $('launch').textContent=mode==='oneshot'?'Lock in & launch ↗':phase==='ready'?'Start orbit ↗':'Release! ↗';
  $('launch').disabled=paused;
  $('next').hidden=!done||mode==='oneshot';
  $('pause').hidden=mode!=='arcade'||(phase!=='orbit'&&phase!=='flight');
  $('pause').textContent=paused?'Resume':'Pause';
  for(const el of [$('angle'),$('angle-number')]) el.disabled=mode==='oneshot'&&(done||flying);
  $('answer-form').hidden=mode!=='calculus'||done||flying;
  $('state-label').textContent=paused?'PAUSED':({ready:'READY',orbit:'IN ORBIT',flight:'SHOT IN FLIGHT',done:'ROUND COMPLETE'}[phase]);
  updateStats();
}
function setup(){
  S=mode==='arcade'?23:42;
  shotRadius=null;
  landed=false;
  phase='ready';paused=false;shot=null;release=null;trail=[];particles=[];closest=Infinity;shotTime=0;
  $('confirm').close();$('answer').value='';$('direction').value='';
  if(mode==='oneshot'){
    activeCode=$('round-code').value.trim().toUpperCase()||'TANGENT-01';$('round-code').value=activeCode;
    data=round(activeCode);angle=0;score=0;$('angle').value=0;$('angle-number').value=0;
    const previous=readResult(activeCode);
    if(previous){phase='done';score=previous.score||0;angle=previous.angle||0;release=orbit(data.circle,angle);say(previous.message||'This round has already been attempted. Use a new code for a new official round.');}
    else say('Calculate your release angle. No tangent preview in competition. Each score is out of 1,000.');
    $('angle').value=$('angle-number').value=Number((angle*180/Math.PI).toFixed(1));
    if(storageWarning) say('Browser storage is unavailable. Official shots are blocked until the attempt can be saved. Arcade and Calculus remain available.','error');
  }else if(mode==='calculus'){
    // Rational unit-circle points keep slope work exact and include vertical tangents.
    const points=[[3,4],[0,5],[5,0],[-4,3],[-3,-4],[4,-3],[0,-5],[-5,0]];
    const [x,y]=points[question%points.length],circle={h:question%3-1,k:Math.floor(question/3)%3-1,r:5};
    angle=Math.atan2(y,x);const p=orbit(circle,angle),t=advance(p,1,2.7);
    data={circle,solution:angle,target:{x:t.x,y:t.y}};
    say('Find the slope and use the counterclockwise motion to choose the velocity direction.');
  }else{
    data=round(`arcade-${Math.random()}`);angle=Math.random()*TAU;
    data.distanceVariation=Math.random();
    applyDistance();
    say(`Target ${level}. Start the orbit, then press Space or Release when the tangent points at the target.`);
  }
  $('equation').textContent=equation(data.circle);updatePoint();setControls();
}
function changeMode(next){
  mode=next;document.body.dataset.mode=mode;score=0;streak=0;level=1;correct=0;attempts=0;question=0;
  for(const b of document.querySelectorAll('[data-mode]')) if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  $('board-label').textContent=mode==='arcade'?'ARCADE / FREE PLAY':mode==='calculus'?'CALCULUS / SLOPE LAB':'ONE-SHOT / CLASS CHALLENGE';
  $('mode-kicker').textContent=mode==='arcade'?'TRUST YOUR TIMING':mode==='calculus'?'KNOW YOUR DIRECTION':'PRECISION OVER REACTION';
  $('mode-title').textContent=mode==='arcade'?'Catch the tangent.':mode==='calculus'?'Work it out.':'Make your one shot.';
  $('instructions').textContent=mode==='arcade'?'The raccoon holds a rope and swings around the post. Release when its tangent points into the basket.':mode==='calculus'?'The raccoon is frozen at P. Calculate the tangent slope, then predict its counterclockwise velocity direction.': 'Use the circle and target coordinates to choose your release point. Prepare as long as you need. Then take one official shot.';
  $('score-label').textContent=mode==='oneshot'?'ACCURACY / 1000':'SCORE';$('streak-label').textContent=mode==='calculus'?'SOLVED / TRIES':mode==='oneshot'?'SHOTS LEFT':'STREAK';
  $('math').hidden=mode==='arcade';$('challenge').hidden=mode!=='oneshot';
  $('speed').hidden=$('speed-label').hidden=mode!=='arcade';$('hints').disabled=mode==='oneshot';
  $('difficulty-control').hidden=mode!=='arcade';
  $('lesson').hidden=!$('hints').checked||mode==='oneshot';
  setup();
}
function beep(hit){if(!$('sound').checked)return;try{audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(hit?660:180,audio.currentTime);o.frequency.exponentialRampToValueAtTime(hit?1100:90,audio.currentTime+.15);g.gain.setValueAtTime(.06,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.start();o.stop(audio.currentTime+.2);}catch{}}
function fire(){if(phase==='flight'||phase==='done')return;shotRadius=targetRadius();release=orbit(data.circle,angle);shot={...release};trail=[{...release}];phase='flight';shotTime=0;closest=Infinity;setControls();}
function launch(){
  if(paused||phase==='flight'||phase==='done')return;
  if(mode==='oneshot'){$('confirm-text').textContent=`Round ${activeCode}: release at ${fmt(angle*180/Math.PI)}°. This will use your only official attempt on this browser.`;$('confirm').showModal();return;}
  if(mode==='arcade'&&phase==='ready'){phase='orbit';say('Watch the direction of motion. Space or Release sends the ball along its tangent.');setControls();return;}
  fire();
}
function finish(hit){
  landed=hit;resultTime=clock;
  phase='done';paused=false;beep(hit);
  if(hit)for(let i=0;i<36;i++)particles.push({x:shot.x,y:shot.y,dx:(Math.random()-.5)*5,dy:(Math.random()-.5)*5,life:.6+Math.random()*.6});
  if(mode==='oneshot'){
    score=Math.max(0,Math.round(1000*(1-Math.min(closest,3)/3)));
    const result=`${hit?'Target hit!':'Shot complete.'} ${score}/1,000 · closest center distance ${fmt(closest)} units.\n${explain()}`;
    const message=`${result}\nYour official attempt is saved. Use a new round code to play again.`;
    if(saveResult({score,angle,message}))say(message,hit?'success':'');
    else {
      const warning=`${result}\nYour final score could not be saved. The attempt remains used; reloading may show the reserved score of 0. Record this displayed result before leaving.`;
      memory.set(activeCode,{score,angle,message:warning});say(warning,'error');
    }
  }else if(mode==='arcade'){
    if(hit){streak++;const points=100+Math.min(streak-1,9)*25;score+=points;level++;say(`Sweet shot! +${points} points · ${streak} hit streak.\nYour raccoon landed the snack! It followed its instantaneous velocity. Next target gets a little smaller.`,'success');}
    else{streak=0;say(`Missed by ${fmt(closest)} units from the target center. A soft landing in the leaves! Watch the swing direction, not the radius. Try the next target.`);}
  }else{score+=100;say(`Tangent confirmed! +100 points.\n${explain()}\nSlope describes the line; the velocity vector chooses which way along it.`,'success');}
  setControls();
}
function targetRadius(){return shotRadius??(mode==='arcade'?Math.max(.18,.9-(difficulty-1)*.16-(level-1)*.015):.32);}
function step(dt){
  clock+=dt;
  if(!paused&&phase==='orbit')angle=(angle+dt*Number($('speed').value)*1.15)%TAU;
  if(!paused&&phase==='flight'){
    const before=shot;shot=advance(shot,dt,mode==='arcade'?7:5);shotTime+=dt;
    const distance=segmentDistance(before,shot,data.target);closest=Math.min(closest,distance);
    trail.push({x:shot.x,y:shot.y});if(trail.length>180)trail.shift();
    // Judge at closest approach, so accuracy is independent of frame rate.
    const projection=(data.target.x-shot.x)*shot.dx+(data.target.y-shot.y)*shot.dy;
    const hit=closest<=targetRadius()+.13;
    // A miss must still visibly fly: targets behind the launch point must not
    // end a shot on its first frame. Keep swept-distance scoring unchanged.
    if((projection<=0&&(hit||shotTime>=.9))||shotTime>5)finish(hit);
  }
  particles=particles.map(p=>({...advance(p,dt,1),life:p.life-dt})).filter(p=>p.life>0);
}
function line(a,b,c,width=1,dash=[]){const p=screen(a),q=screen(b);ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=c;ctx.lineWidth=width;ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([]);}
function circle(p,r,fill,stroke,width=1){const q=screen(p);ctx.beginPath();ctx.arc(q.x,q.y,r*S,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function label(text,p,c='#76677e',size=12){const q=screen(p);ctx.font=`${size}px Segoe UI, sans-serif`;ctx.fillStyle=c;ctx.textAlign='center';ctx.fillText(text,q.x,q.y);}
function oval(x,y,rx,ry,fill,stroke){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function raccoon(p,happy=false){
  const q=screen(p);ctx.save();ctx.translate(q.x,q.y);
  if(happy)ctx.rotate(Math.sin((clock-resultTime)*12)*.12*Math.max(0,1-(clock-resultTime)/2));
  oval(1,17,18,5,'#49694b20');
  // Original procedural character style from Calculus Racers: rounded body,
  // outlined ears, eye mask, tiny smile and blush. Tail trails in flight.
  ctx.save();ctx.translate(15,10);ctx.rotate(phase==='flight'?.8:.4);
  oval(0,0,7,17,'#a3a7b2','#4e5064');
  ctx.save();ctx.beginPath();ctx.ellipse(0,0,7,17,0,0,TAU);ctx.clip();
  ctx.fillStyle='#5b5b70';for(let y=-13;y<18;y+=8)ctx.fillRect(-9,y,18,4);ctx.restore();ctx.restore();
  for(const side of [-1,1]){oval(side*11,-13,7,8,'#939aa8','#4e5064');oval(side*11,-13,3.5,4,'#efb6bd');}
  ctx.beginPath();ctx.roundRect(-15,-13,30,31,11);ctx.fillStyle='#b7bdc9';ctx.fill();ctx.strokeStyle='#4e5064';ctx.lineWidth=1.6;ctx.stroke();
  oval(0,10,10,6,'#f9f3e8');oval(0,-2,14,7,'#56586e');
  for(const side of [-1,1]){
    oval(side*6,-2,3,3.5,'#fffaf3');oval(side*6,-1,1.5,2,'#30354c');
    oval(side*10,6,3,1.8,'#eaa2af');oval(side*15,8,4,4,'#a8afbc','#4e5064');
  }
  oval(0,3,2.5,2,'#414357');ctx.beginPath();ctx.arc(0,6,3,0,Math.PI);ctx.strokeStyle='#414357';ctx.lineWidth=1.2;ctx.stroke();
  ctx.restore();
}
function basket(p,r){
  const q=screen(p),size=18;ctx.save();ctx.translate(q.x,q.y);ctx.scale(r*S/size,r*S/size);
  oval(0,7,size+12,size+8,'#49694b20');
  ctx.beginPath();ctx.arc(0,-4,size+8,Math.PI,TAU);ctx.lineWidth=6;ctx.strokeStyle='#a57243';ctx.stroke();
  oval(0,2,size+9,size+7,'#dba36b','#976844');
  ctx.save();ctx.beginPath();ctx.ellipse(0,2,size+8,size+6,0,0,TAU);ctx.clip();
  ctx.strokeStyle='#ba824f';ctx.lineWidth=2;
  for(let n=-size-10;n<size+10;n+=7){ctx.beginPath();ctx.moveTo(n,-size-8);ctx.lineTo(n,size+9);ctx.moveTo(-size-10,n);ctx.lineTo(size+10,n);ctx.stroke();}ctx.restore();
  oval(0,0,size+3,size+3,'#fff4df','#a57243');
  ctx.save();ctx.beginPath();ctx.arc(0,0,size,0,TAU);ctx.clip();ctx.fillStyle='#f4bec6';
  for(let x=-size;x<size;x+=8)for(let y=-size;y<size;y+=8)if((Math.round((x+size)/8)+Math.round((y+size)/8))%2===0)ctx.fillRect(x,y,8,8);ctx.restore();
  // Pink circular landing zone matches the mathematical target radius.
  ctx.beginPath();ctx.arc(0,0,size,0,TAU);ctx.lineWidth=2;ctx.strokeStyle='#be5476';ctx.stroke();
  ctx.restore();
}
function leaves(p){
  const q=screen(p);ctx.save();ctx.translate(Math.max(28,Math.min(W-28,q.x)),Math.max(28,Math.min(H-28,q.y)));
  for(let i=0;i<9;i++){ctx.save();ctx.rotate(i*2.4);oval(8+i%3*3,0,12,5,['#b2c889','#e4ba79','#d99873'][i%3]);ctx.restore();}ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,W,H);const c=color(),o=data.circle,p=shot||orbit(o,angle);
  ctx.fillStyle='#f3f4df';ctx.fillRect(0,0,W,H);
  // Border foliage stays outside the playable clearing.
  for(let i=0;i<18;i++){const x=i*59-15;oval(x,8,33,24,i%2?'#d5e3b7':'#c4d8a5');oval(x,H+3,36,23,i%2?'#c4d8a5':'#d5e3b7');}
  if(mode!=='arcade'||$('hints').checked){
    for(let i=-10;i<=10;i++)line({x:i,y:-8},{x:i,y:8},i===0?'#bac5a5':'#e2e6d1');
    for(let i=-8;i<=8;i++)line({x:-11,y:i},{x:11,y:i},i===0?'#bac5a5':'#e2e6d1');
  }
  if(mode!=='arcade'){for(let i=-8;i<=8;i+=2){if(i){label(String(i),{x:i,y:-.4});if(Math.abs(i)<8)label(String(i),{x:-.35,y:i});}}label('x',{x:10.25,y:-.4});label('y',{x:.35,y:7.5});}
  circle({x:o.h,y:o.k},o.r,`${c}05`,`${c}70`,2);
  // A short arrow on the orbit makes the direction of rotation unambiguous.
  const ap=orbit(o,2.2),aq=advance(ap,1,.35);line(ap,aq,c,2);const as=screen(aq);ctx.save();ctx.translate(as.x,as.y);ctx.rotate(Math.atan2(-ap.dy,ap.dx));ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-6,-4);ctx.lineTo(-6,4);ctx.fill();ctx.restore();
  const center={x:o.h,y:o.k};circle(center,.27,'#bd8e5d','#896440',2);circle(center,.17,null,'#9e744b');circle(center,.06,'#80603d');
  label(mode==='arcade'?'SWING POST':`C ${xy(center)}`,{x:o.h,y:o.k-.55},'#76677e',11);
  const r=targetRadius();basket(data.target,r);label('PICNIC BASKET',{x:data.target.x,y:data.target.y+r+.5},'#a24b67',10);
  if(!shot){line(center,p,'#8e7048',5);line(center,p,'#d8b985',2,[4,3]);}
  const showRay=mode==='arcade'&&$('hints').checked||phase==='done';
  if(showRay){const origin=release||p;line(advance(origin,-1,2),advance(origin,1,14),`${c}80`,1.5,[7,7]);}
  if(trail.length>1){ctx.beginPath();trail.forEach((v,i)=>{const q=screen(v);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();}
  if(mode==='arcade'&&phase==='orbit')for(let i=12;i>0;i--){const t=orbit(o,angle-i*.028);circle(t,.08,`${c}${Math.round(80*(1-i/13)).toString(16).padStart(2,'0')}`);}
  if(phase==='done'&&!landed)leaves(p);
  const actor=phase==='done'?(landed?data.target:{x:Math.max(-10,Math.min(10,p.x)),y:Math.max(-7,Math.min(7,p.y))}):p;
  raccoon(actor,phase==='done'&&landed);
  // The small marker identifies the exact tracked point beneath the cosmetic sprite.
  circle(actor,.13,null,`${c}80`,1);
  if(mode!=='arcade'&&!shot)label('P',{x:p.x+.4,y:p.y+.4},c,15);
  for(const v of particles)label('✦',v,'#c59030',12);
  if(phase==='ready'&&mode==='arcade'){label('SWING. LET GO. LAND THE SNACK.' ,{x:0,y:-6.8},'#76677e',13);}
  if(paused){ctx.fillStyle='#07101cbb';ctx.fillRect(0,0,W,H);label('PAUSED',{x:0,y:0},'#eaf1fa',28);}
}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(!document.hidden)step(dt);draw();requestAnimationFrame(frame);}
function setAngle(deg){if(mode!=='oneshot'||phase!=='ready'||!Number.isFinite(deg))return;deg=Math.max(0,Math.min(359.9,deg));angle=deg*Math.PI/180;$('angle').value=deg;$('angle-number').value=Number(deg.toFixed(1));updatePoint();}
function applyDistance(){
  const minimum=3+(difficulty-1)*2,maximum=minimum+1;
  const distance=minimum+data.distanceVariation;
  const target=advance(orbit(data.circle,data.solution),1,distance);
  data.target={x:target.x,y:target.y};
  // Arcade uses a fixed 23 pixels/unit so increasing distance never zooms away.
  $('difficulty-output').textContent=`${difficulty} · ${['Cozy','Gentle','Lively','Zippy','Spicy'][difficulty-1]}`;
  $('difficulty-help').textContent=`Target distance: ${minimum}–${maximum} units along its winning tangent. Basket diameter: ${fmt(targetRadius()*2)} units. Higher difficulty means farther, smaller baskets. Fine-tune speed below.`;
}
function setDifficulty(value){
  if(mode!=='arcade'||phase==='flight'||phase==='done'||!Number.isFinite(value))return;
  difficulty=Math.max(1,Math.min(5,Math.round(value)));
  $('difficulty').value=difficulty;
  $('speed').value=(.4+(difficulty-1)*1.4).toFixed(1);
  $('speed-output').textContent=`${$('speed').value}×`;
  applyDistance();
}
document.querySelectorAll('button[data-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
$('launch').onclick=launch;
$('next').onclick=()=>{question++;setup();};
$('pause').onclick=()=>{paused=!paused;setControls();};
$('hints').onchange=()=>{$('lesson').hidden=!$('hints').checked||mode==='oneshot';};
$('speed').oninput=()=>{$('speed-output').textContent=`${$('speed').value}×`;};
$('difficulty').oninput=e=>setDifficulty(Number(e.target.value));
$('restart').onclick=()=>{if(mode==='oneshot'){$('round-code').value=`ROUND-${Math.random().toString(36).slice(2,8).toUpperCase()}`;setup();}else changeMode(mode);};
$('load-round').onclick=setup;
$('angle').oninput=e=>setAngle(Number(e.target.value));$('angle-number').oninput=e=>{if(e.target.value!=='')setAngle(Number(e.target.value));};
$('cancel').onclick=()=>$('confirm').close();
$('official').onclick=()=>{
  if(phase!=='ready'){$('confirm').close();return;}
  const previous=readResult(activeCode);
  if(previous){setup();return;}
  $('confirm').close();
  if(storageWarning||!saveResult({score:0,angle,message:'This round’s official shot was used. If the page closed during flight, the attempt scores 0. Choose a new code for a new round.'})){
    say('Could not save and verify your attempt in browser storage. No shot was launched. Check available browser storage and try again, or play Arcade or Calculus.','error');return;
  }
  fire();
};
$('answer-form').onsubmit=e=>{
  e.preventDefault();if(mode!=='calculus'||phase!=='ready')return;
  const expected=slope(orbit(data.circle,angle)),answer=parseSlope($('answer').value),dir=$('direction').value;
  if(Number.isNaN(answer)||!dir){say('Enter a number, fraction, or “undefined”, and choose a velocity direction.','error');return;}
  attempts++;const rightSlope=expected===Infinity?answer===Infinity:Number.isFinite(answer)&&Math.abs(answer-expected)<.005;
  if(!rightSlope||dir!==direction(orbit(data.circle,angle))){say(`${!rightSlope?'Check the slope.':'The slope is right!'} ${!rightSlope?($('hints').checked?'Use offsets from the center: −(x − h)/(y − k).':'Try the slope again.'):'Check the velocity direction: the raccoon is swinging counterclockwise.'}`,'error');updateStats();return;}
  correct++;say('Correct slope and direction. Let’s test your prediction.','success');fire();
};
document.addEventListener('keydown',e=>{
  if($('confirm').open||/INPUT|SELECT|TEXTAREA|SUMMARY|A/.test(e.target.tagName))return;
  if(e.target.tagName==='BUTTON'&&!['launch','next'].includes(e.target.id))return;
  if(e.code==='Space'&&mode==='arcade'){
    e.preventDefault();
    if(e.repeat)return;
    if(phase==='done'){question++;setup();}
    launch();
    return;
  }
  if(e.repeat)return;
  if(e.code==='KeyP'&&mode==='arcade'&&(phase==='orbit'||phase==='flight')){paused=!paused;setControls();}
  if(e.code==='KeyR')$('restart').click();
});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&mode==='arcade'&&(phase==='orbit'||phase==='flight')){paused=true;setControls();}});
let dragging=false;
function drag(e){if(!dragging)return;const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;const a=Math.atan2((H/2-y)/S-data.circle.k,(x-W/2)/S-data.circle.h);setAngle((a*180/Math.PI+360)%360);}
canvas.onpointerdown=e=>{if(mode==='oneshot'&&phase==='ready'){dragging=true;canvas.setPointerCapture(e.pointerId);drag(e);}};
canvas.onpointermove=drag;canvas.onpointerup=()=>dragging=false;canvas.onpointercancel=()=>dragging=false;
changeMode('arcade');requestAnimationFrame(frame);
