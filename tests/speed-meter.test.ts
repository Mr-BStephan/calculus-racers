import {it,expect} from 'vitest';
import {speedBlocks} from '../src/speed-meter';
it('uses the same growing green/yellow/red blocks for controls and local aim',()=>{const blocks=speedBlocks(40);expect(blocks).toHaveLength(18);expect(blocks.every(b=>b.active)).toBe(true);expect(new Set(blocks.map(b=>b.color)).size).toBe(3);expect(blocks[0].height).toBeLessThan(blocks[17].height);expect(speedBlocks(5).filter(b=>b.active)).toHaveLength(1);expect(speedBlocks(20).filter(b=>b.active).length).toBeGreaterThan(1);expect(speedBlocks(20).filter(b=>b.active).length).toBeLessThan(18);});
