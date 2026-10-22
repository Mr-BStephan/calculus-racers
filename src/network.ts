import {initializeApp} from 'firebase/app';
import {getAuth,setPersistence,browserSessionPersistence,signInAnonymously,signInWithPopup,GoogleAuthProvider,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getDatabase,ref,get,set,update,remove,onValue,onDisconnect,serverTimestamp,connectDatabaseEmulator,runTransaction,type Database} from 'firebase/database';
import type {Control,Launch} from './race';
import {snapshotRound,type Scorecard,type RoundScore} from './scorecard';
import {islandRows,islandSeed,type IslandHistory} from './island-classroom';
import {validateNickname} from './names';
import {validateStudentId} from './credits';
import {validateAppearance} from './characters';
export type Racer={name:string;sprite:number;color?:number;width?:number;height?:number;launch?:Launch};
export type Submission={epoch:number;angle:number;power:number;at:number};
export type Room={control:Control;racers:Record<string,Racer>;submissions:Record<string,Submission>;presence:Record<string,boolean>;members:Record<string,string>;bans:Record<string,boolean>;scorecard:Scorecard;islandRounds:IslandHistory;joining?:boolean};
export type Admission={owner:string;joining:boolean;expires:number};
const emulated=import.meta.env.VITE_USE_EMULATORS==='true';
export const configured=!!import.meta.env.VITE_FIREBASE_CONFIG||emulated;
export const cleanName=validateNickname;
export class Network{
 db:Database; auth; uid=''; teacher=false; code=''; owner=false; playing=false; connected=false; offset=0; private stops:(()=>void)[]=[];private globalStops:(()=>void)[]=[];
 constructor(){const config=emulated?{apiKey:'demo-key',authDomain:'localhost',databaseURL:'http://127.0.0.1:9000?ns=demo-calculus-racers',projectId:'demo-calculus-racers'}:JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);const app=initializeApp(config);this.auth=getAuth(app);this.db=getDatabase(app);if(emulated){connectAuthEmulator(this.auth,'http://127.0.0.1:9099',{disableWarnings:true});connectDatabaseEmulator(this.db,'127.0.0.1',9000);}}
 async init(){await setPersistence(this.auth,browserSessionPersistence);await this.auth.authStateReady();if(!this.auth.currentUser)await signInAnonymously(this.auth);this.uid=this.auth.currentUser!.uid;this.globalStops.push(onValue(ref(this.db,'.info/serverTimeOffset'),s=>this.offset=s.val()??0));this.globalStops.push(onValue(ref(this.db,'.info/connected'),s=>{this.connected=s.val()===true;if(this.connected&&this.code&&(!this.owner||this.playing))void this.presence().catch(()=>{});}));}
 now(){return Date.now()+this.offset;}
 async teacherLogin(){if(emulated)await signInWithEmailAndPassword(this.auth,'teacher@example.test','emulator-only-password');else await signInWithPopup(this.auth,new GoogleAuthProvider());this.uid=this.auth.currentUser!.uid;this.teacher=(await get(ref(this.db,`teachers/${this.uid}`))).val()===true;if(!this.teacher)throw new Error('This account is not on the teacher allowlist. Ask the Firebase project administrator to add its UID.');}
 async create(){if(!this.teacher)throw new Error('Teacher sign-in required.');for(let attempt=0;attempt<5;attempt++){const bytes=crypto.getRandomValues(new Uint8Array(6));const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const code=[...bytes].map(b=>alphabet[b%alphabet.length]).join('');const adm={owner:this.uid,joining:true,expires:this.now()+6*3600000};const tx=await runTransaction(ref(this.db,`admission/${code}`),old=>old?undefined:adm);if(!tx.committed)continue;await set(ref(this.db,`rooms/${code}`),{control:{epoch:1,course:0,phase:'lobby',startsAt:0}});this.code=code;this.owner=true;sessionStorage.setItem('cr-room',code);return code;}throw new Error('Could not reserve a room code. Retry.');}
 async join(code:string,name:string,sprite:number,color=0,playHost=false,width=1,height=1){validateAppearance(sprite,color,width,height);const checkedName=cleanName(name);code=code.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))throw new Error('Enter the six-character room code.');const adm=(await get(ref(this.db,`admission/${code}`))).val() as Admission|null;if(!adm||adm.expires<this.now())throw new Error('Room missing or expired. Ask your teacher for a new code.');this.owner=adm.owner===this.uid;const membership=ref(this.db,`rooms/${code}/members/${this.uid}`);const existing=(await get(membership)).exists();this.playing=existing;if(!this.owner||playHost||existing){if(!existing){if(!adm.joining&&!this.owner)throw new Error('Joining is closed.');let admitted=false;const start=crypto.getRandomValues(new Uint8Array(1))[0]%40;for(let i=0;i<40;i++){const slot=String((start+i)%40);try{await update(ref(this.db,`rooms/${code}`),{[`members/${this.uid}`]:slot,[`slots/${slot}`]:this.uid});admitted=true;break;}catch{/* an occupied slot or denied admission cannot be overwritten */}}if(!admitted)throw new Error('Room full, joining closed, or admission denied. Ask your teacher.');}const racer=ref(this.db,`rooms/${code}/racers/${this.uid}`);if(!(await get(racer)).exists())await set(racer,{name:checkedName,sprite,color,width,height});this.playing=true;}this.code=code;sessionStorage.setItem('cr-room',code);await this.presence();}
 async presence(){if(!this.code||this.owner&&!this.playing)return;const p=ref(this.db,`rooms/${this.code}/presence/${this.uid}`);await onDisconnect(p).remove();await set(p,true);}
 watch(cb:(room:Room)=>void,error:(e:Error)=>void){this.stops.forEach(f=>f());let subStop:(()=>void)|undefined,subKey='';this.stops=[()=>subStop?.()];const room:Room={control:{epoch:1,course:0,phase:'lobby',startsAt:0},racers:{},submissions:{},members:{},presence:{},bans:{},scorecard:{},islandRounds:{}};this.stops.push(onValue(ref(this.db,`admission/${this.code}/joining`),s=>{room.joining=s.val()===true;if(room.control.epoch)cb({...room});},error));for(const key of ['control','racers','presence','members','scorecard','islandRounds'] as const)this.stops.push(onValue(ref(this.db,`rooms/${this.code}/${key}`),s=>{(room[key] as unknown)=s.val()??{};if(key==='control'&&room.control.epoch){const all=this.owner||room.control.phase==='fired'||room.control.phase==='ended';const next=all?'all':'self';if(next!==subKey){subStop?.();subKey=next;room.submissions={};subStop=onValue(ref(this.db,`rooms/${this.code}/submissions${all?'':`/${this.uid}`}`),snapshot=>{room.submissions=all?snapshot.val()??{}:snapshot.exists()?{[this.uid]:snapshot.val()}:{};cb({...room});},error);}}if(room.control.epoch)cb({...room});},error));}
 async joining(open:boolean){await update(ref(this.db,`admission/${this.code}`),{joining:open});}
 async control(control:Control,scores?:Record<string,RoundScore|null>|null){
  if(!this.owner)throw new Error('Room owner required');
  const changes:Record<string,unknown>={control};
  if(scores===null)changes.islandRounds=null;
  else if(control.soloIsland){const history=(await get(ref(this.db,`rooms/${this.code}/islandRounds`))).val()??{};if(!history[String(control.epoch)])changes[`islandRounds/${control.epoch}`]={epoch:control.epoch,startsAt:control.startsAt};const old=Object.keys(history).sort((a,b)=>Number(a)-Number(b));for(const key of old.slice(0,Math.max(0,old.length-19)))changes[`islandRounds/${key}`]=null;}

  if(scores===null)changes.scorecard=null;
  else if(scores)for(const [course,score]of Object.entries(scores)){
   if(!score){changes[`scorecard/${course}`]=null;continue;}
   // Freeze first: all launches accepted before this write are included in
   // the subsequent server read; later launch writes are denied by rules.
   const path=`rooms/${this.code}`,prior=(await get(ref(this.db,`${path}/control`))).val() as Control;
   if(prior.epoch!==score.epoch)throw new Error('The round changed. Wait for the host controls to refresh.');
   if(prior.phase!=='ended')await set(ref(this.db,`${path}/control`),{...prior,phase:'ended',endsAt:serverTimestamp()});
   const frozen=(await get(ref(this.db,`${path}/control`))).val() as Control;
   if(frozen.epoch!==prior.epoch||frozen.phase!=='ended')throw new Error('The host changed the round while scores were being saved. Please retry.');
   const racers=(await get(ref(this.db,`${path}/racers`))).val()??{};
   if(!this.connected)throw new Error('Connection lost while saving scores. Reconnect and retry; the round remains frozen.');
   changes[`scorecard/${course}`]=snapshotRound(frozen,racers,frozen.endsAt??this.now())??null;
   if(control.phase==='ended'&&control.epoch===prior.epoch)changes.control={...control,endsAt:frozen.endsAt};
  }
  await update(ref(this.db,`rooms/${this.code}`),changes);
 }
 async rename(name:string){await set(ref(this.db,`rooms/${this.code}/racers/${this.uid}/name`),cleanName(name));}
 async appearance(sprite:number|undefined,color:number|undefined){validateAppearance(sprite??0,color??0);await update(ref(this.db,`rooms/${this.code}/racers/${this.uid}`),{...(sprite!==undefined?{sprite}:{}),...(color!==undefined?{color}:{})});}
 async submitIsland(epoch:number,angle:number,power:number){if(!this.connected)throw new Error('Reconnect before confirming your shot.');const p=ref(this.db,`rooms/${this.code}/islandRounds/${epoch}/shots/${this.uid}`);await set(p,{epoch,angle,power,at:serverTimestamp()});return(await get(p)).val() as Submission;}
 private creditStops:(()=>void)[]=[];
 async creditOwner(){return(await get(ref(this.db,`admission/${this.code}/owner`))).val() as string;}
 watchCredits(owner:string,cb:(credits:Record<string,any>)=>void,error:(e:Error)=>void){if(!this.owner)return;this.creditStops.push(onValue(ref(this.db,`teacherCredits/${owner}`),s=>cb(s.val()??{}),error));}
 watchMyCredit(owner:string,epoch:number,cb:(value:any)=>void,error:(e:Error)=>void){const stop=onValue(ref(this.db,`teacherCredits/${owner}/${this.code}/${epoch}/${this.uid}`),s=>cb(s.val()),error);this.creditStops.push(stop);return stop;}
 async readCredits(){if(!this.owner)throw new Error('Teacher access required.');return (await get(ref(this.db,`teacherCredits/${this.uid}`))).val()??{};}
 async verifyCredit(owner:string,epoch:number,uid:string){if(!this.owner||owner!==this.uid)throw new Error('Host verification required.');const record=(await get(ref(this.db,`rooms/${this.code}/islandRounds/${epoch}`))).val();if(!record)return;const rows=islandRows({[epoch]:record},{[uid]:{name:'Racer'}},epoch,this.now());if(rows.find(r=>r.id===uid)?.status!=='Success')return;const shot=record.shots[uid];await runTransaction(ref(this.db,`teacherCredits/${owner}/${this.code}/${epoch}/${uid}`),old=>old??{eligible:true,seed:islandSeed(epoch,uid),angle:shot.angle,power:shot.power,earnedAt:serverTimestamp()});}
 async claimCredit(owner:string,epoch:number,name:string,period:number,studentId:string){studentId=validateStudentId(studentId);name=name.trim();if(name.length<2||name.length>80||/[<>\r\n\t]/.test(name)||!Number.isInteger(period)||period<1||period>8)throw new Error('Enter your full name and period (1–8).');await set(ref(this.db,`teacherCredits/${owner}/${this.code}/${epoch}/${this.uid}/details`),{name,studentId,period,at:serverTimestamp()});}
 async launch(event:Omit<Launch,'at'>){if(!this.connected)throw new Error('Connection lost. Wait to reconnect or switch to offline practice.');await set(ref(this.db,`rooms/${this.code}/racers/${this.uid}/launch`),{...event,at:serverTimestamp()});}
 async submit(epoch:number,angle:number,power:number){if(!this.connected)throw new Error('Reconnect before locking your shot.');await set(ref(this.db,`rooms/${this.code}/submissions/${this.uid}`),{epoch,angle,power,at:serverTimestamp()});}
 async kick(uid:string){const slot=(await get(ref(this.db,`rooms/${this.code}/members/${uid}`))).val();const changes:Record<string,unknown>={[`bans/${uid}`]:true,[`members/${uid}`]:null,[`racers/${uid}`]:null,[`presence/${uid}`]:null,[`submissions/${uid}`]:null};if(slot!==null)changes[`slots/${slot}`]=null;await update(ref(this.db,`rooms/${this.code}`),changes);}
 async destroyRoom(){if(this.owner){await remove(ref(this.db,`rooms/${this.code}`));await remove(ref(this.db,`admission/${this.code}`));}this.close();}
 close(){this.creditStops.forEach(f=>f());this.creditStops=[];this.stops.forEach(f=>f());this.stops=[];this.globalStops.forEach(f=>f());this.globalStops=[];if(this.code&&(!this.owner||this.playing))void remove(ref(this.db,`rooms/${this.code}/presence/${this.uid}`)).catch(()=>{});this.code='';sessionStorage.removeItem('cr-room');}
}
