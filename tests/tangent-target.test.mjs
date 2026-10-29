import test from 'node:test';
import assert from 'node:assert/strict';
const physics = await import('../public/tangent-target/physics.mjs').catch(() => ({}));
test('counterclockwise tangent at rightmost point points up, including translated circles', () => {
  assert.equal(typeof physics.orbit, 'function');
  const p = physics.orbit({h:2,k:-1,r:5},0);
  assert.deepEqual(p, {x:7,y:-1,dx:0,dy:1});
});
test('velocity is perpendicular to radius at every release angle', () => {
  assert.equal(typeof physics.orbit, 'function');
  for(let a=0;a<6.3;a+=.07){const p=physics.orbit({h:2,k:3,r:5},a);assert.ok(Math.abs((p.x-2)*p.dx+(p.y-3)*p.dy)<1e-10);}
});
test('slopes accept fractions and decimals, handle vertical and reject malformed numbers', () => {
  assert.equal(typeof physics.parseSlope, 'function');
  assert.equal(physics.parseSlope('-3/4'),-.75);
  assert.equal(physics.parseSlope(' .75 '),.75);
  assert.equal(physics.parseSlope('undefined'),Infinity);
  for(const value of ['', '1/0','2cats','1/2/3']) assert.ok(Number.isNaN(physics.parseSlope(value)));
});
test('segment collision catches a fast shot crossing a small target but not one behind it',()=>{
  assert.equal(typeof physics.segmentDistance,'function');
  assert.equal(physics.segmentDistance({x:0,y:0},{x:10,y:0},{x:5,y:0}),0);
  assert.equal(physics.segmentDistance({x:0,y:0},{x:10,y:0},{x:-5,y:0}),5);
});
test('constant velocity agrees across frame rates',()=>{
  assert.equal(typeof physics.advance,'function');
  const shot={x:3,y:4,dx:-.8,dy:.6};
  let p={...shot}; for(let i=0;i<120;i++) p=physics.advance(p,1/120,5);
  const q=physics.advance(shot,1,5);assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<1e-10);
});
test('seeded rounds repeat and targets lie on a reachable forward ray',()=>{
  assert.equal(typeof physics.round,'function');
  assert.deepEqual(physics.round('CLASS-3'),physics.round('CLASS-3'));
  for(let i=0;i<100;i++){const r=physics.round(String(i));const p=physics.orbit(r.circle,r.solution);const end=physics.advance(p,1,20);assert.ok(physics.segmentDistance(p,end,r.target)<1e-9);}
});
