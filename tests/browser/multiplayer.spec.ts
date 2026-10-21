import {test,expect} from '@playwright/test';
// Requires Auth + RTDB emulators, seed:emulator, and VITE_USE_EMULATORS=true.
// Three isolated contexts give two distinct anonymous identities and a teacher.
test('two independent racers join, launch together, rejoin and obey teacher control',async({browser,baseURL})=>{
 const contexts=await Promise.all([browser.newContext(),browser.newContext(),browser.newContext()]);
 const [teacher,a,b]=await Promise.all(contexts.map(c=>c.newPage()));const errors:string[]=[];for(const p of [teacher,a,b])p.on('pageerror',e=>errors.push(e.message));
 try{
  await Promise.all([teacher,a,b].map(p=>p.goto(baseURL!)));
  await teacher.locator('#teacher-open').click();await teacher.locator('#teacher-login').click();await expect(teacher.locator('#room-code')).toHaveText(/^[A-Z2-9]{6}$/,{timeout:20000});const code=(await teacher.locator('#room-code').textContent())!;
  for(const [p,name] of [[a,'Comet A'],[b,'Comet B']] as const){await p.locator('#nickname').fill(name);await p.locator('#join-open').click();await p.locator('#code').fill(code);await p.locator('#join-submit').click();await expect(p.locator('#join-dialog')).not.toBeVisible({timeout:15000});}
  await expect(teacher.locator('#leaderboard li')).toHaveCount(2);await teacher.locator('#practice').click();await expect(a.locator('#launch')).toBeEnabled();await expect(b.locator('#launch')).toBeEnabled();
  await Promise.all([a.locator('#launch').click(),b.locator('#launch').click()]);await expect(a.locator('#strokes')).toHaveText('1');await expect(b.locator('#strokes')).toHaveText('1');await expect(teacher.locator('#leaderboard')).toContainText('Comet A');
  await a.reload();await expect(a.locator('#connection')).toContainText(code);await expect(a.locator('#strokes')).toHaveText('1');await expect(teacher.locator('#leaderboard li')).toHaveCount(2);
  await teacher.locator('#joining').click();await b.reload();await expect(b.locator('#connection')).toContainText(code);await expect(b.locator('#strokes')).toHaveText('1');
  await teacher.locator('#race').click();await expect(a.locator('#countdown')).toBeVisible();await expect(a.locator('#launch')).toBeDisabled();await expect(a.locator('#launch')).toBeEnabled({timeout:10000});await expect(b.locator('#launch')).toBeEnabled();await expect(a.locator('#preview-label')).toContainText('Show launch direction');
  await Promise.all([a.locator('#launch').click(),b.locator('#launch').click()]);await expect(a.locator('#launch')).toHaveText('IN FLIGHT…');await expect(b.locator('#launch')).toHaveText('IN FLIGHT…');await expect(a.locator('#launch')).toBeEnabled({timeout:12000});await teacher.locator('#end').click();await expect(teacher.locator('#leaderboard')).toContainText('42 m');await expect(a.locator('#launch')).toBeDisabled();
  await teacher.locator('#champ').click();await expect(a.locator('#mission')).toBeVisible();await a.locator('#angle-number').fill('50.194');await a.locator('#power-number').fill('19.95996');await a.locator('#launch').click();await a.locator('#confirm-shot').click();await expect(a.locator('#launch')).toHaveText('SHOT LOCKED ✓');
  await expect(b.locator('#leaderboard')).not.toContainText('LOCKED');await expect(teacher.locator('#end')).toBeDisabled();await b.locator('#angle-number').fill('50.194');await b.locator('#power-number').fill('19.95996');await b.locator('#launch').click();await b.locator('#confirm-shot').click();await expect(b.locator('#launch')).toHaveText('SHOT LOCKED ✓');
  // Test harness advances the server-owned deadline in the DISPOSABLE emulator.
  const response=await fetch(`http://127.0.0.1:9000/rooms/${code}/control.json?ns=demo-calculus-racers`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({startsAt:Date.now()-1000})});expect(response.ok).toBe(true);
  await expect(teacher.locator('#fire')).toBeEnabled();await teacher.locator('#fire').click();await expect(a.locator('#countdown')).toBeVisible();await expect(teacher.locator('#leaderboard')).toContainText('pts',{timeout:15000});
  await teacher.screenshot({path:'test-results/multiplayer-teacher.png',fullPage:true});
  await teacher.getByRole('button',{name:'Remove Comet A'}).click();await expect(teacher.locator('#leaderboard li')).toHaveCount(1);expect(errors).toEqual([]);
  await teacher.locator('#destroy-room').click();
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});
