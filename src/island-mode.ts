import {validateSettings} from './physics';
import {IslandRound} from './island';
import {Renderer} from './render';
import {mountAimControls} from './aim-controls';
import {sound} from './sound';
type Look={name:string;sprite:number;color:number;width:number;height:number};
export class IslandMode{
 root=document.createElement('section');renderer:Renderer;round=new IslandRound(0);key='';active=false;confirming=false;lastDone=false;frame=0;error='';pendingSettings?:{angle:number;speed:number};
 constructor(private look:()=>Look,private muted:()=>boolean){
  this.root.id='island-mode';this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-label','Solo Island Championship');
  this.root.innerHTML=`<header class="island-header"><div><span class="eyebrow">SOLO · ONE SHOT</span><h1>Island Championship</h1></div><button id="island-exit">Back to classroom / practice</button></header>
  <div class="island-brief"><strong id="island-coordinates"></strong><span>g = 9.8 m/s² · No air resistance · Land on the island</span></div>
  <div class="island-arena"><canvas id="island-canvas" aria-label="Coordinate grid with launch platform at zero and one floating target island"></canvas><div id="island-countdown" class="countdown" hidden></div><div class="island-result" id="island-result" role="status" hidden></div></div>
  <div class="island-console"><label class="slider-block"><span>Launch angle <span><input id="island-angle-number" aria-label="Island launch angle in degrees" type="number" required min="5" max="85" step="0.001" value="45"> °</span></span><input id="island-angle" type="range" min="5" max="85" step="0.001" value="45"></label><label class="slider-block"><span>Initial speed <span><input id="island-power-number" aria-label="Island initial speed" type="number" required min="5" max="40" step="0.00001" value="20"> m/s</span></span><input id="island-power" type="range" min="5" max="40" step="0.00001" value="20"></label>
  <div class="island-actions"><button id="island-lock" class="accent">LOCK ONE SHOT ↗</button><div id="island-confirm" hidden><span id="island-settings"></span><button id="island-fire" class="accent">Confirm & launch</button><button id="island-cancel">Keep calculating</button></div><button id="island-retry" disabled>New island →</button><small id="island-status">Calculate first. No practice shots or trajectory preview.</small></div></div>
  <details class="island-equations"><summary>Reference equations & assumptions</summary><span>y = ax² + bx + c · dy/dx = 2ax + b · tan(θ) = initial slope · y(x) = x tan(θ) − gx²/(2v₀²cos²θ). Start at (0, 0); metres and seconds; constant gravity; character size does not affect collisions.</span></details>`;
  document.body.append(this.root);this.renderer=new Renderer(this.el<HTMLCanvasElement>('canvas'));
  for(const k of ['angle','power']){const range=this.el<HTMLInputElement>(k),num=this.el<HTMLInputElement>(k+'-number');range.oninput=()=>num.value=range.value;num.oninput=()=>{if(num.validity.valid)range.value=num.value;};}
  mountAimControls(this.root,'island-');
  this.el('exit').onclick=()=>this.close();this.el('cancel').onclick=()=>{this.confirming=false;this.el('confirm').hidden=true;};
  this.el('lock').onclick=()=>{if(this.round.shot)return;const angle=Number(this.el<HTMLInputElement>('angle-number').value),speed=Number(this.el<HTMLInputElement>('power-number').value);if(!this.el<HTMLInputElement>('angle-number').validity.valid||!this.el<HTMLInputElement>('power-number').validity.valid){this.error='Use angle 5–85° and speed 5–40 m/s.';return;}try{validateSettings(angle,speed);}catch{this.error='Use angle 5–85° and speed 5–40 m/s.';return;}this.error='';this.confirming=true;this.pendingSettings={angle,speed};this.el('settings').textContent=`${angle}° · ${speed} m/s. This is your only shot.`;this.el('confirm').hidden=false;};
  this.el('fire').onclick=()=>{if(!this.confirming||this.round.shot)return;try{this.round.launch(this.pendingSettings!.angle,this.pendingSettings!.speed,Date.now()+3000);}catch(e){this.confirming=false;this.el('confirm').hidden=true;this.error=e instanceof Error?e.message:'Check launch settings.';return;}this.confirming=false;this.el('confirm').hidden=true;this.save();sound('launch',this.muted());};
  this.el('retry').onclick=()=>{if(!this.round.state(Date.now()).done)return;this.newRound();};
 }
 el<T extends HTMLElement=HTMLElement>(id:string){return this.root.querySelector<T>('#island-'+id)!;}
 open(key:string){if(this.active&&this.key===key)return;this.key=key;this.root.hidden=false;document.body.classList.add('island-open');this.active=true;this.confirming=false;this.lastDone=false;this.el('confirm').hidden=true;try{const saved=JSON.parse(sessionStorage.getItem('cr-island:'+key)??'null');if(saved){this.round=new IslandRound(saved.seed);if(saved.shot)this.round.launch(saved.shot.angle,saved.shot.speed,saved.shot.at);}else this.newRound();}catch{this.newRound();}if(this.round.shot){for(const [k,v]of [['angle',this.round.shot.angle],['power',this.round.shot.speed]] as const){this.el<HTMLInputElement>(k).value=String(v);this.el<HTMLInputElement>(k+'-number').value=String(v);this.el(k+'-number').dispatchEvent(new Event('input'));}}this.error='';this.updateCoordinates();cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(t=>this.draw(t));this.el('exit').focus();}
 close(){cancelAnimationFrame(this.frame);this.active=false;this.root.hidden=true;document.body.classList.remove('island-open');}
 private save(){const s=this.round.shot;sessionStorage.setItem('cr-island:'+this.key,JSON.stringify({seed:this.round.mission.seed,shot:s?{angle:s.angle,speed:s.speed,at:s.at}:undefined}));}
 private newRound(){let seed=crypto.getRandomValues(new Uint32Array(1))[0];if(seed%75===this.round.mission.seed%75)seed++;this.round=new IslandRound(seed);this.error='';this.lastDone=false;this.el('result').hidden=true;this.save();this.updateCoordinates();}
 private updateCoordinates(){const m=this.round.mission;this.el('coordinates').textContent=`Start (0, 0) → Island centre (${m.x}, ${m.y}) m · Landing strip x = ${m.x-6}…${m.x+6}, y = ${m.y}`;}
 private draw(t:number){if(!this.active)return;const state=this.round.state(Date.now()),shot=this.round.shot,look=this.look(),count=shot?Math.ceil((shot.at-Date.now())/1000):0;
  this.renderer.draw({course:this.round.mission.course,racers:[{id:'solo',...look,position:state.position,flying:state.flying,finished:state.won}],localId:'solo',spectator:false,now:t,celebrate:state.won,bounds:{minX:-12,maxX:145,minY:-12,maxY:88}});
  const countdown=this.el('countdown');countdown.hidden=count<=0;countdown.textContent=String(count);
  for(const k of ['angle','angle-number','power','power-number'])this.el<HTMLInputElement>(k).disabled=!!shot||this.confirming;
  this.el<HTMLButtonElement>('lock').disabled=!!shot;this.el('lock').textContent=shot?'SHOT USED · 1 / 1':'LOCK ONE SHOT ↗';this.el<HTMLButtonElement>('retry').disabled=!state.done;
  this.el('status').textContent=this.error|| (state.done?'One shot complete. New island gives you a fresh problem.':shot?'Settings locked. Watch your landing.':'Calculate first. No practice shots or trajectory preview.');
  if(state.done){this.el('result').hidden=false;this.el('result').textContent=state.won?'✦ PERFECT LANDING! ✦':'MISSED THE ISLAND · TRY A NEW MAP';if(!this.lastDone)sound(state.won?'win':'land',this.muted());this.lastDone=true;}
  this.frame=requestAnimationFrame(n=>this.draw(n));
 }
}
