/** Claims are private, cumulative per teacher, and still require roster verification. */
export function validateStudentId(value:string){const id=value.trim().toUpperCase();if(!/^[A-Z0-9][A-Z0-9-]{2,23}$/.test(id))throw new Error('Enter your student ID (3–24 letters, digits or hyphens).');return id;}
export type CreditStudent={studentId:string;name:string;period:number;rounds:number;rooms:string[];lastAt:number};
export function creditRoster(credits:Record<string,any>):CreditStudent[]{
 const students=new Map<string,CreditStudent>();
 for(const [code,rounds]of Object.entries(credits))for(const records of Object.values(rounds as Record<string,any>))for(const record of Object.values(records as Record<string,any>)){
  const r=record as any,d=r.details;if(!r.eligible||!d)continue;
  let studentId='';try{if(typeof d.studentId==='string')studentId=validateStudentId(d.studentId);}catch{/* Preserve older claims for teacher review. */}
  const key=studentId?'id:'+studentId:'legacy:'+d.name.trim().replace(/\s+/g,' ').toLowerCase()+':'+d.period,lastAt=Number(d.at??r.earnedAt??0),old=students.get(key);
  if(old){old.rounds++;if(!old.rooms.includes(code))old.rooms.push(code);if(lastAt>=old.lastAt){old.name=d.name;old.period=d.period;old.lastAt=lastAt;}}
  else students.set(key,{studentId,name:d.name,period:d.period,rounds:1,rooms:[code],lastAt});
 }
 return [...students.values()].sort((a,b)=>a.period-b.period||a.name.localeCompare(b.name));
}
/** Repeat successes stay as evidence; award one point per student, not per room. */
export function creditCsv(credits:Record<string,any>){
 const cell=(v:unknown)=>{let text=String(v).replace(/[\u0000-\u001f\u007f]/g,' ');if(/^\s*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
 return [['Student ID','Name','Period','Extra credit points','Successful rounds','Rooms','Classroom status'],...creditRoster(credits).map(r=>[r.studentId,r.name,r.period,1,r.rounds,r.rooms.join(' '),'Needs roster verification; not uploaded'+(r.studentId?'':' (missing student ID)')])].map(row=>row.map(cell).join(',')).join('\r\n');
}
