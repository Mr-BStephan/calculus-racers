import {test,expect} from '@playwright/test';
test('host sends two students into independent local island rounds and controls returning',async({browser,baseURL})=>{
 const contexts=await Promise.all([browser.newContext(),browser.newContext(),browser.newContext()]);const [host,a,b]=await Promise.all(contexts.map(c=>c.newPage()));
 const errors:string[]=[];for(const p of [host,a,b])p.on('pageerror',e=>errors.push(e.message));
 try{await Promise.all([host,a,b].map(p=>p.goto(baseURL!)));await host.locator('#teacher-open').click();await host.locator('#teacher-login').click();await expect(host.locator('#room-code')).toHaveText(/^[A-Z2-9]{6}$/);const code=(await host.locator('#room-code').textContent())!;
 for(const [i,p]of [a,b].entries()){await p.locator('#nickname').fill('Island '+(i+1));await p.locator('#join-open').click();await p.locator('#code').fill(code);await p.locator('#join-submit').click();await expect(p.locator('#join-dialog')).toBeHidden();}
 await host.locator('#champ').click();for(const p of [host,a,b])await expect(p.locator('#island-mode')).toBeVisible();await a.locator('#island-angle-number').fill('5');await a.locator('#island-power-number').fill('5');await a.locator('#island-lock').click();await a.locator('#island-fire').click();await expect(a.locator('#island-lock')).toBeDisabled();await expect(b.locator('#island-lock')).toBeEnabled();
 const r=await fetch(`http://127.0.0.1:9000/rooms/${code}.json?ns=demo-calculus-racers`,{headers:{Authorization:'Bearer owner'}}),room=await r.json();expect(room.control.soloIsland).toBe(true);expect(Object.values(room.racers).every((p:any)=>!p.launch)).toBe(true);expect(room.submissions).toBeUndefined();
 await host.locator('#island-exit').click();await host.locator('#next-level').click();for(const p of [a,b])await expect(p.locator('#island-mode')).toBeHidden();await host.locator('#destroy-room').click();expect(errors).toEqual([]);
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});
