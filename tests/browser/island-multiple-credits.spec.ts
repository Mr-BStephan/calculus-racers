import {test,expect} from '@playwright/test';

test('every successful student receives a private claim in the same championship round',async({browser,baseURL})=>{
 const contexts=await Promise.all(Array.from({length:4},()=>browser.newContext()));
 const [host,...students]=await Promise.all(contexts.map(c=>c.newPage()));
 try{
  await Promise.all([host,...students].map(p=>p.goto(baseURL!)));
  await host.locator('#teacher-open').click();await host.locator('#teacher-login').click();
  await expect(host.locator('#room-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code=(await host.locator('#room-code').textContent())!;
  await Promise.all(students.map(async(p,i)=>{await p.locator('#nickname').fill('Credit Comet '+(i+1));await p.locator('#join-open').click();await p.locator('#code').fill(code);await p.locator('#join-submit').click();await expect(p.locator('#join-dialog')).toBeHidden();}));
  await host.locator('#champ').click();
  await Promise.all(students.map(async(p,i)=>{
   await expect(p.locator('#island-mode')).toBeVisible();await expect(p.locator('#island-lock')).toBeEnabled();
   const text=(await p.locator('#island-coordinates').textContent())!,[x,y]=text.match(/centre \((\d+), (\d+)\)/)!.slice(1).map(Number),r=55*Math.PI/180,v=Math.sqrt(9.8*x*x/(2*Math.cos(r)**2*(x*Math.tan(r)-y)));
   await p.locator('#island-angle-number').fill(i===2?'5':'55');await p.locator('#island-power-number').fill(i===2?'5':v.toFixed(5));
   await p.locator('#island-lock').click();await p.locator('#island-fire').click();
  }));
  await host.reload();await expect(host.locator('#island-mode')).toBeVisible();
  for(const p of students.slice(0,2)){await expect(p.locator('#island-result')).toContainText('PERFECT LANDING',{timeout:15000});await expect(p.locator('#island-credit')).toBeVisible({timeout:15000});}
  await expect(students[2].locator('#island-credit')).toBeHidden();
  await Promise.all(students.slice(0,2).map(async(p,i)=>{await p.locator('#island-credit-name').fill('Synthetic Winner '+(i+1));await p.locator('#island-credit-period').selectOption(String(i+1));await p.locator('#island-credit-save').click();await expect(p.locator('#island-credit-status')).toContainText('Saved privately');}));
  for(let i=0;i<2;i++)expect(await students[i].locator('body').innerText()).not.toContain('Synthetic Winner '+(2-i));
  await host.locator('#island-exit').click();const download=host.waitForEvent('download');await host.locator('#export-credits').click();const stream=await(await download).createReadStream();let csv='';for await(const chunk of stream!)csv+=chunk.toString();expect(csv).toContain('Synthetic Winner 1');expect(csv).toContain('Synthetic Winner 2');
  await host.locator('#destroy-room').click();
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});
