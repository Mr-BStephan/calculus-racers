import { describe, it, expect } from 'vitest';
import { simulate, pointAt, type Course } from '../src/physics';
import { courses } from '../src/courses';
const flat: Course = { id: 'flat', name:'Flat', gravity:10, length:200, color:'#abc', description:'', polygons:[[{x:0,y:0},{x:200,y:0},{x:200,y:-20},{x:0,y:-20}]], checkpoints:[{x:2,y:0}], finish:190 };
describe('ballistic engine',()=>{
 it('blocks a launch pointing into the slope immediately',()=>{const c={...flat,polygons:[[{x:0,y:0},{x:100,y:60},{x:100,y:-20},{x:0,y:-20}]]};const f=simulate(c,{x:50,y:30},5,20);expect(f.duration).toBe(0);expect(f.recovered).toBe(true);});
 it('matches analytic range and flight time on level ground',()=>{const f=simulate(flat,{x:2,y:0},45,20);expect(f.end.x).toBeCloseTo(42,2);expect(f.duration).toBeCloseTo(2.828427,3);expect(f.peak).toBeCloseTo(10,2);});
 it('is deterministic across independent simulations',()=>{expect(simulate(flat,{x:2,y:0},68,31)).toEqual(simulate(flat,{x:2,y:0},68,31));});
 it('resolves first thin wall instead of tunneling',()=>{const c={...flat,polygons:[...flat.polygons,[{x:4,y:-1},{x:4.01,y:-1},{x:4.01,y:30},{x:4,y:30}]]};const f=simulate(c,{x:2,y:0},5,40);expect(f.impact.x).toBeCloseTo(4,4);expect(f.recovered).toBe(true);expect(f.end).toEqual({x:2,y:0});});
 it('recovers a missed gap to the last checkpoint',()=>{const c={...flat,polygons:[[{x:0,y:0},{x:4,y:0},{x:4,y:-20},{x:0,y:-20}]]};expect(simulate(c,{x:2,y:0},45,20).recovered).toBe(true);});
 it('rejects out-of-range and nonfinite launch settings',()=>{for(const [a,p] of [[0,20],[90,20],[45,41],[NaN,20],[45,Infinity]])expect(()=>simulate(flat,{x:2,y:0},a,p)).toThrow();});
 it('samples the same midpoint irrespective of rendering frames',()=>{const f=simulate(flat,{x:2,y:0},45,20);expect(pointAt(f,1).x).toBeCloseTo(16.1421356,5);expect(pointAt(f,1).y).toBeCloseTo(9.1421356,5);});
 it('lands on a slope at its actual height',()=>{const c={...flat,polygons:[[{x:0,y:0},{x:100,y:20},{x:100,y:-20},{x:0,y:-20}]]};const f=simulate(c,{x:2,y:0.4},45,20);expect(f.end.y).toBeCloseTo(f.end.x*.2,4);expect(f.end.x).toBeGreaterThan(20);});
 it('all four courses are finishable with valid settings',()=>{for(const c of courses){let p=c.checkpoints[0];let reached=false;for(let n=0;n<20;n++){let best=simulate(c,p,45,20);for(let a=10;a<=80;a+=5)for(let v=10;v<=40;v+=2){const f=simulate(c,p,a,v);if(!f.recovered&&f.end.x>best.end.x)best=f;}p=best.end;if(p.x>=c.finish){reached=true;break;}}expect(reached,c.name).toBe(true);}});
});
