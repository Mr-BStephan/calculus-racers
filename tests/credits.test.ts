import {it,expect} from 'vitest';
import {creditCsv,creditRoster,validateStudentId} from '../src/credits';
it('exports one point per normalized name/period and neutralizes CSV formulas',()=>{const row={eligible:true,details:{name:'Synthetic Student',period:3}},csv=creditCsv({ROOM:{a:{x:row},b:{x:{...row,details:{name:' synthetic   student ',period:3}},y:{eligible:true,details:{name:'=SYNTHETIC',period:4}}}}});expect(csv).toContain('"3","1","2"');expect(csv).toContain("'=SYNTHETIC");expect(csv).toContain('Needs roster verification; not uploaded');});

it('neutralizes leading tabs and spaces before spreadsheet formulas',()=>{const csv=creditCsv({ROOM:{round:{a:{eligible:true,details:{name:'\t=1+1',period:1}},b:{eligible:true,details:{name:'  @SUM(1)',period:2}}}}});expect(csv).toContain("' =1+1");expect(csv).toContain("'  @SUM(1)");});


it('combines student IDs across rooms, anonymous sessions and periods while retaining legacy claims',()=>{
 const claim=(name:string,studentId:string|undefined,period:number,at:number)=>({eligible:true,details:{name,studentId,period,at}});
 const credits={OLD:{1:{a:claim('Old spelling','001234',1,1),legacy:claim('Legacy Student',undefined,3,1)}},NEW:{2:{b:claim('Current spelling','001234',2,2),c:claim('Different Student','001235',2,2)}}};
 const rows=creditRoster(credits);expect(rows).toHaveLength(3);expect(rows.find(r=>r.studentId==='001234')).toMatchObject({name:'Current spelling',period:2,rounds:2,rooms:['OLD','NEW']});
 const csv=creditCsv(credits);expect(csv).toContain('Student ID');expect(csv).toContain('"001234","Current spelling","2","1","2"');expect(csv).toContain('Legacy Student');
});
it('normalizes student IDs without losing leading zeros and rejects invalid inputs',()=>{expect(validateStudentId(' 001234 ')).toBe('001234');expect(validateStudentId('ab-123')).toBe('AB-123');for(const id of ['', '12', '=1+1','<123>','x'.repeat(25)])expect(()=>validateStudentId(id)).toThrow();});
