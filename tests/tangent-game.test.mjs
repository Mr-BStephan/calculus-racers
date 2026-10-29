import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as physics from '../public/tangent-target/physics.mjs';

// Execute the real game and its event handlers without a browser. Only platform
// boundaries (DOM, Canvas, storage and frame scheduling) are substituted.
const html=readFileSync(new URL('../public/tangent-target/index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../public/tangent-target/game.mjs',import.meta.url),'utf8').replace(/^import .*;\r?\n/,'');
function storage(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
function game(store=storage()){
  const els=new Map([...html.matchAll(/id="([^"]+)"/g)].map(([,id])=>[id,{value:'',textContent:'',hidden:false,disabled:false,checked:false,dataset:{},setAttribute(){},close(){this.open=false;},showModal(){this.open=true;},click(){this.onclick?.();}}]));
  els.get('speed').value='1';els.get('round-code').value='TANGENT-01';els.get('hints').checked=true;
  els.get('board').getContext=()=>new Proxy({}, {get:()=>()=>{},set:()=>true});
  const modes=['arcade','calculus','oneshot'].map(mode=>({tagName:'BUTTON',dataset:{mode},setAttribute(){}}));
  const events={};const document={body:{dataset:{}},hidden:false,getElementById:id=>{assert.ok(els.has(id),`missing HTML element ${id}`);return els.get(id);},querySelectorAll:()=>modes,addEventListener:(name,fn)=>events[name]=fn};
  const context=vm.createContext({...physics,document,localStorage:store,requestAnimationFrame(){}});
  vm.runInContext(source,context);
  return {el:id=>els.get(id),mode:name=>modes.find(x=>x.dataset.mode===name).onclick(),run:code=>vm.runInContext(code,context),events,document};
}
function official(g){g.el('launch').click();g.el('official').click();}
test('failed reservation writes prevent an official launch and explain storage failure',()=>{
  const g=game({getItem:()=>null,setItem(){throw new Error('quota');}});g.mode('oneshot');official(g);
  assert.equal(g.run('phase'),'ready');assert.match(g.el('feedback').textContent,/storage|save/i);assert.equal(g.run('shot'),null);
});
test('silently discarded writes also prevent an official launch',()=>{
  const g=game({getItem:()=>null,setItem(){}});g.mode('oneshot');official(g);assert.equal(g.run('phase'),'ready');
});
test('unreadable storage prevents launch instead of overwriting an unknown attempt',()=>{
  const g=game({getItem(){throw new Error('denied');},setItem(){}});g.mode('oneshot');official(g);assert.equal(g.run('phase'),'ready');
});
test('reservation survives reload, consumes shot during flight, and restores angle inputs',()=>{
  const store=storage(),g=game(store);g.mode('oneshot');g.run('setAngle(123.4)');official(g);
  assert.equal(g.run('phase'),'flight');assert.equal(g.el('streak').textContent,'0');
  const reload=game(store);reload.mode('oneshot');assert.equal(reload.run('phase'),'done');
  assert.equal(Number(reload.el('angle').value),123.4);assert.equal(Number(reload.el('angle-number').value),123.4);
});
test('result write failure preserves reservation and never claims final score saved',()=>{
  const store=storage(),g=game(store);g.mode('oneshot');official(g);store.setItem=()=>{throw new Error('quota');};g.run('step(5)');
  assert.equal(g.run('phase'),'done');assert.match(g.el('feedback').textContent,/could not.*sav|not saved/i);
  const reload=game(store);reload.mode('oneshot');assert.equal(reload.run('phase'),'done');assert.equal(reload.run('score'),0);
});
test('perfect seeded shot scores 1000, cannot be replayed, and new code starts fresh',()=>{
  const g=game();g.mode('oneshot');g.run('setAngle(data.solution*180/Math.PI)');official(g);g.run('step(2)');
  assert.equal(g.run('score'),1000);assert.equal(g.run('phase'),'done');g.el('load-round').click();assert.equal(g.run('phase'),'done');
  g.el('round-code').value='NEW-ROUND';g.el('load-round').click();assert.equal(g.run('phase'),'ready');
});
test('calculus checks fractions, direction and vertical tangents across repeat play',()=>{
  const g=game();g.mode('calculus');const submit=()=>g.el('answer-form').onsubmit({preventDefault(){}});
  g.el('answer').value='-3/4';g.el('direction').value='down-right';submit();assert.equal(g.run('phase'),'ready');
  g.el('direction').value='up-left';submit();assert.equal(g.run('phase'),'flight');g.run('step(1)');assert.equal(g.run('score'),100);
  g.el('next').click();g.el('answer').value='0';g.el('direction').value='left';submit();g.run('step(1)');assert.equal(g.run('score'),200);
  g.el('next').click();g.el('answer').value='undefined';g.el('direction').value='up';submit();g.run('step(1)');assert.equal(g.run('score'),300);assert.match(g.el('feedback').textContent,/Vertical tangent/);
});
test('arcade keyboard launch, pause, hit, next target and hidden-tab pause',()=>{
  const g=game();const key=code=>g.events.keydown({code,target:{tagName:'BODY'},preventDefault(){}});
  key('Space');assert.equal(g.run('phase'),'orbit');key('KeyP');const a=g.run('angle');g.run('step(.2)');assert.equal(g.run('angle'),a);
  key('KeyP');g.run('angle=data.solution');key('Space');g.run('step(2)');assert.equal(g.run('score'),100);assert.equal(g.run('streak'),1);
  g.el('next').click();key('Space');g.document.hidden=true;g.events.visibilitychange();assert.equal(g.run('paused'),true);
});
test('difficulty increases forward target distance and orbit speed, preserving reachable targets',()=>{
  const g=game();
  g.run('setDifficulty(1)');
  const easy=g.run('Math.hypot(data.target.x-orbit(data.circle,data.solution).x,data.target.y-orbit(data.circle,data.solution).y)');
  const slow=Number(g.el('speed').value);
  g.run('setDifficulty(5)');
  const hard=g.run('Math.hypot(data.target.x-orbit(data.circle,data.solution).x,data.target.y-orbit(data.circle,data.solution).y)');
  assert.ok(hard>easy);assert.ok(Number(g.el('speed').value)>slow);
  assert.ok(g.run('segmentDistance(orbit(data.circle,data.solution),advance(orbit(data.circle,data.solution),1,20),data.target)')<1e-9);
  g.el('launch').click();g.el('launch').click();assert.equal(g.el('difficulty').disabled,true);
});
test('Space cycles completed shots into an orbiting next target and fires with focused action buttons',()=>{
  const g=game();const space=(id='launch',repeat=false)=>g.events.keydown({code:'Space',repeat,target:{tagName:'BUTTON',id},preventDefault(){}});
  space();assert.equal(g.run('phase'),'orbit');
  g.run('angle=data.solution');space();assert.equal(g.run('phase'),'flight');
  space();assert.equal(g.run('phase'),'flight');g.run('step(2)');assert.equal(g.run('phase'),'done');
  space('next');assert.equal(g.run('phase'),'orbit');assert.equal(g.run('score'),100);
  space('next',true);assert.equal(g.run('phase'),'orbit');
  space('next');assert.equal(g.run('phase'),'flight');
});
