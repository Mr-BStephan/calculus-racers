// Local disposable emulator only. Never points to production.
const auth='http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const identity={email:'teacher@example.test',password:'emulator-only-password',returnSecureToken:true};
let response=await fetch(`${auth}/accounts:signUp?key=demo-key`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(identity)});
let data=await response.json();
if(!response.ok){response=await fetch(`${auth}/accounts:signInWithPassword?key=demo-key`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(identity)});data=await response.json();}
if(!response.ok||!data.localId)throw new Error('Start the local Auth emulator before seeding.');
const result=await fetch(`http://127.0.0.1:9000/teachers/${data.localId}.json?ns=demo-calculus-racers`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:'true'});
if(!result.ok)throw new Error('Could not seed local teacher allowlist.');
console.log('Disposable local emulator teacher ready. No production data accessed.');
