import {TAU,orbit,advance,segmentDistance,parseSlope,slope,round} from './physics.mjs';

const $=id=>document.getElementById(id), canvas=$('board'), ctx=canvas.getContext('2d');
const W=900,H=680,S=42, teal='#5ce8c1',coral='#ff826f';
let mode='arcade', phase='ready', data, angle=0, shot=null, release=null, trail=[], particles=[];
let score=0,streak=0,level=1,correct=0,attempts=0,question=0,paused=false,last=0,clock=0;
let closest=Infinity, shotTime=0, activeCode='', memory=new Map(), storageWarning=false, audio;
const fmt=n=>Math.abs(n)<.00001?'0':Number(n.toFixed(3)).toString();
const xy=p=>`(${fmt(p.x)}, ${fmt(p.y)})`;
const color=()=>mode==='calculus'?'#b5a1ff':mode==='oneshot'?'#f3cc76':teal;
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
  $('instructions').textContent=mode==='arcade'?'The ball leaves in the direction it is moving. Release when that path lines up with the target.':mode==='calculus'?'The ball is frozen at P. Calculate the tangent slope, then predict its counterclockwise velocity direction.': 'Use the circle and target coordinates to choose your release point. Prepare as long as you need. Then take one official shot.';
  $('score-label').textContent=mode==='oneshot'?'ACCURACY / 1000':'SCORE';$('streak-label').textContent=mode==='calculus'?'SOLVED / TRIES':mode==='oneshot'?'SHOTS LEFT':'STREAK';
  $('math').hidden=mode==='arcade';$('challenge').hidden=mode!=='oneshot';
  $('speed').hidden=$('speed-label').hidden=mode!=='arcade';$('hints').disabled=mode==='oneshot';
  $('lesson').hidden=!$('hints').checked||mode==='oneshot';
  setup();
}
function beep(hit){if(!$('sound').checked)return;try{audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(hit?660:180,audio.currentTime);o.frequency.exponentialRampToValueAtTime(hit?1100:90,audio.currentTime+.15);g.gain.setValueAtTime(.06,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.start();o.stop(audio.currentTime+.2);}catch{}}
function fire(){if(phase==='flight'||phase==='done')return;release=orbit(data.circle,angle);shot={...release};trail=[{...release}];phase='flight';shotTime=0;closest=Infinity;setControls();}
function launch(){
  if(paused||phase==='flight'||phase==='done')return;
  if(mode==='oneshot'){$('confirm-text').textContent=`Round ${activeCode}: release at ${fmt(angle*180/Math.PI)}°. This will use your only official attempt on this browser.`;$('confirm').showModal();return;}
  if(mode==='arcade'&&phase==='ready'){phase='orbit';say('Watch the direction of motion. Space or Release sends the ball along its tangent.');setControls();return;}
  fire();
}
function finish(hit){
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
    if(hit){streak++;const points=100+Math.min(streak-1,9)*25;score+=points;level++;say(`Nailed it! +${points} points · ${streak} hit streak.\nThe ball followed its instantaneous velocity. Next target gets a little smaller.`,'success');}
    else{streak=0;say(`Missed by ${fmt(closest)} units from the target center. Watch the direction the ball is moving, not the radius. Try the next target.`);}
  }else{score+=100;say(`Tangent confirmed! +100 points.\n${explain()}\nSlope describes the line; the velocity vector chooses which way along it.`,'success');}
  setControls();
}
function targetRadius(){return mode==='arcade'?Math.max(.23,.65-(level-1)*.035):.32;}
function step(dt){
  clock+=dt;
  if(!paused&&phase==='orbit')angle=(angle+dt*Number($('speed').value)*1.15)%TAU;
  if(!paused&&phase==='flight'){
    const before=shot;shot=advance(shot,dt,mode==='arcade'?7:5);shotTime+=dt;
    const distance=segmentDistance(before,shot,data.target);closest=Math.min(closest,distance);
    trail.push({x:shot.x,y:shot.y});if(trail.length>180)trail.shift();
    // Judge at closest approach, so accuracy is independent of frame rate.
    const projection=(data.target.x-shot.x)*shot.dx+(data.target.y-shot.y)*shot.dy;
    if(projection<=0||shotTime>5)finish(closest<=targetRadius()+.13);
  }
  particles=particles.map(p=>({...advance(p,dt,1),life:p.life-dt})).filter(p=>p.life>0);
}
function line(a,b,c,width=1,dash=[]){const p=screen(a),q=screen(b);ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=c;ctx.lineWidth=width;ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([]);}
function circle(p,r,fill,stroke,width=1){const q=screen(p);ctx.beginPath();ctx.arc(q.x,q.y,r*S,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function label(text,p,c='#a6b6cc',size=12){const q=screen(p);ctx.font=`${size}px Segoe UI, sans-serif`;ctx.fillStyle=c;ctx.textAlign='center';ctx.fillText(text,q.x,q.y);}
function draw(){
  ctx.clearRect(0,0,W,H);const c=color(),o=data.circle,p=shot||orbit(o,angle);
  for(let i=-10;i<=10;i++)line({x:i,y:-8},{x:i,y:8},i===0?'#33465d':'#1a293d');
  for(let i=-8;i<=8;i++)line({x:-11,y:i},{x:11,y:i},i===0?'#33465d':'#1a293d');
  if(mode!=='arcade'){for(let i=-8;i<=8;i+=2){if(i){label(String(i),{x:i,y:-.4});if(Math.abs(i)<8)label(String(i),{x:-.35,y:i});}}label('x',{x:10.25,y:-.4});label('y',{x:.35,y:7.5});}
  circle({x:o.h,y:o.k},o.r,`${c}05`,`${c}70`,2);
  // A short arrow on the orbit makes the direction of rotation unambiguous.
  const ap=orbit(o,2.2),aq=advance(ap,1,.35);line(ap,aq,c,2);const as=screen(aq);ctx.save();ctx.translate(as.x,as.y);ctx.rotate(Math.atan2(-ap.dy,ap.dx));ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-6,-4);ctx.lineTo(-6,4);ctx.fill();ctx.restore();
  circle({x:o.h,y:o.k},.055,c);label(mode==='arcade'?'ORBIT':`C ${xy({x:o.h,y:o.k})}`,{x:o.h,y:o.k-.5},'#869db7',11);
  const r=targetRadius();circle(data.target,r+.15+Math.sin(clock*3)*.035,null,`${coral}22`,2);circle(data.target,r,`${coral}12`,coral,2);circle(data.target,r*.48,null,`${coral}90`,1.5);circle(data.target,.055,coral);label('TARGET',{x:data.target.x,y:data.target.y+r+.4},coral,10);
  if(!shot){line({x:o.h,y:o.k},p,`${c}60`,1.5,[5,5]);}
  const showRay=mode==='arcade'&&$('hints').checked||phase==='done';
  if(showRay){const origin=release||p;line(advance(origin,-1,2),advance(origin,1,14),`${c}80`,1.5,[7,7]);}
  if(trail.length>1){ctx.beginPath();trail.forEach((v,i)=>{const q=screen(v);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();}
  if(mode==='arcade'&&phase==='orbit')for(let i=12;i>0;i--){const t=orbit(o,angle-i*.028);circle(t,.08,`${c}${Math.round(80*(1-i/13)).toString(16).padStart(2,'0')}`);}
  ctx.shadowBlur=20;ctx.shadowColor=c;circle(p,.14,c);ctx.shadowBlur=0;circle(p,.25,null,`${c}60`);
  if(mode!=='arcade'&&!shot)label('P',{x:p.x+.4,y:p.y+.4},c,15);
  for(const v of particles)circle(v,.045,coral);
  if(phase==='ready'&&mode==='arcade'){label('ONE ORBIT. INFINITE POSSIBILITIES.',{x:0,y:-6.8},'#a2b4ca',13);}
  if(paused){ctx.fillStyle='#07101cbb';ctx.fillRect(0,0,W,H);label('PAUSED',{x:0,y:0},'#eaf1fa',28);}
}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(!document.hidden)step(dt);draw();requestAnimationFrame(frame);}
function setAngle(deg){if(mode!=='oneshot'||phase!=='ready'||!Number.isFinite(deg))return;deg=Math.max(0,Math.min(359.9,deg));angle=deg*Math.PI/180;$('angle').value=deg;$('angle-number').value=Number(deg.toFixed(1));updatePoint();}
document.querySelectorAll('button[data-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
$('launch').onclick=launch;
$('next').onclick=()=>{question++;setup();};
$('pause').onclick=()=>{paused=!paused;setControls();};
$('hints').onchange=()=>{$('lesson').hidden=!$('hints').checked||mode==='oneshot';};
$('speed').oninput=()=>{$('speed-output').textContent=`${$('speed').value}×`;};
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
  if(!rightSlope||dir!==direction(orbit(data.circle,angle))){say(`${!rightSlope?'Check the slope.':'The slope is right!'} ${!rightSlope?($('hints').checked?'Use offsets from the center: −(x − h)/(y − k).':'Try the slope again.'):'Check the velocity direction: the ball is moving counterclockwise.'}`,'error');updateStats();return;}
  correct++;say('Correct slope and direction. Let’s test your prediction.','success');fire();
};
document.addEventListener('keydown',e=>{
  if(e.repeat||$('confirm').open||/INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName))return;
  if(e.code==='Space'&&mode==='arcade'){e.preventDefault();launch();}
  if(e.code==='KeyP'&&mode==='arcade'&&(phase==='orbit'||phase==='flight')){paused=!paused;setControls();}
  if(e.code==='KeyR')$('restart').click();
});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&mode==='arcade'&&(phase==='orbit'||phase==='flight')){paused=true;setControls();}});
let dragging=false;
function drag(e){if(!dragging)return;const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;const a=Math.atan2((H/2-y)/S-data.circle.k,(x-W/2)/S-data.circle.h);setAngle((a*180/Math.PI+360)%360);}
canvas.onpointerdown=e=>{if(mode==='oneshot'&&phase==='ready'){dragging=true;canvas.setPointerCapture(e.pointerId);drag(e);}};
canvas.onpointermove=drag;canvas.onpointerup=()=>dragging=false;canvas.onpointercancel=()=>dragging=false;
changeMode('arcade');requestAnimationFrame(frame);
