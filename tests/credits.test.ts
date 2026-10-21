import {it,expect} from 'vitest';
import {creditCsv} from '../src/credits';
it('exports one point per normalized name/period and neutralizes CSV formulas',()=>{const row={eligible:true,details:{name:'Synthetic Student',period:3}},csv=creditCsv({ROOM:{a:{x:row},b:{x:{...row,details:{name:' synthetic   student ',period:3}},y:{eligible:true,details:{name:'=SYNTHETIC',period:4}}}}});expect(csv).toContain('"3","1","2"');expect(csv).toContain("'=SYNTHETIC");expect(csv).toContain('Needs roster verification; not uploaded');});

it('neutralizes leading tabs and spaces before spreadsheet formulas',()=>{const csv=creditCsv({ROOM:{round:{a:{eligible:true,details:{name:'\t=1+1',period:1}},b:{eligible:true,details:{name:'  @SUM(1)',period:2}}}}});expect(csv).toContain("' =1+1");expect(csv).toContain("'  @SUM(1)");});
