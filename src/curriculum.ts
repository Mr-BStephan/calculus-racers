import type { Flight, Course } from './physics';
export interface CurriculumMode {id:string;title:string;observations(flight:Flight,course:Course):{label:string;value:number;unit:string}[];challenge?(flight:Flight,course:Course):{prompt:string;assumptions:string[]};}
export const experimentation:CurriculumMode={id:'unit2',title:'Experimentation',observations:f=>[{label:'Simulated flight time',value:f.duration,unit:'s'},{label:'Distance',value:f.impact.x-f.start.x,unit:'m'},{label:'Peak above launch',value:f.peak,unit:'m'}]};
