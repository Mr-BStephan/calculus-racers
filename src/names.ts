import policy from './name-policy.json';
const substitutions:Record<string,string>=policy.substitutions;
const pattern=(word:string)=>[...word].map(c=>substitutions[c]??c).join('[ _-]*');
const forbidden=new RegExp(policy.blockedFragments.map(pattern).join('|')+'|(^|[ _-])('+policy.blockedWords.map(pattern).join('|')+')($|[ _-])','i');
export function validateNickname(input:string):string{
 const name=input.trim();
 if(!name||name.length>18||!/^[a-zA-Z0-9 _-]+$/.test(name)||!/[a-zA-Z0-9]/.test(name))throw new Error('Choose a made-up racer name with 1–18 letters, numbers, spaces, _ or -.');
 if(forbidden.test(name))throw new Error('That racer name is not allowed. Please choose a friendly nickname.');
 return name;
}
export function displayNickname(name:string):string{try{return validateNickname(name);}catch{return'Racer';}}
