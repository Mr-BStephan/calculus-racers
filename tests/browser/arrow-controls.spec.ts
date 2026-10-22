import {test,expect} from '@playwright/test';

test('arrow shortcuts adjust angle and power globally, preserve typing, and respect locks',async({page})=>{
 await page.goto('/');
 await page.locator('#launch').focus();
 await page.keyboard.press('ArrowUp');await expect(page.locator('#angle-number')).toHaveValue('46');
 await page.keyboard.press('ArrowDown');await expect(page.locator('#angle-number')).toHaveValue('45');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#power-number')).toHaveValue('21');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('#power-number')).toHaveValue('20');
 await page.keyboard.press('Shift+ArrowRight');await expect(page.locator('#power-number')).toHaveValue('20.1');
 await page.locator('#protractor').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#power-number')).toHaveValue('21.1');await expect(page.locator('#angle-number')).toHaveValue('45');
 await page.locator('#power-number').fill('35');await page.keyboard.press('ArrowRight');await expect(page.locator('#power-number')).toHaveValue('35');
 await page.evaluate(()=>{const i=document.createElement('input');i.id='typing-test';document.body.append(i);i.focus();});
 await page.keyboard.press('ArrowDown');await expect(page.locator('#angle-number')).toHaveValue('45');
 await page.evaluate(async()=>{document.querySelector('#island-mode')!.remove();document.querySelector('#island-credit')!.remove();const path='/src/island-mode.ts';const {IslandMode}=await import(path);const m=new IslandMode(()=>({name:'Keys Test',sprite:0,color:0,width:1,height:1}),()=>true);(window as any).__keys=m;m.open('keys',{seed:0,host:true,canPlay:true,now:()=>Date.now(),next:async()=>{},submit:async(angle:number,power:number)=>({epoch:1,angle,power,at:Date.now()})});});
 await page.keyboard.press('ArrowUp');await expect(page.locator('#island-angle-number')).toHaveValue('46');await expect(page.locator('#angle-number')).toHaveValue('45');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#island-power-number')).toHaveValue('21');
 await page.locator('#island-lock').click();await page.keyboard.press('ArrowUp');await expect(page.locator('#island-angle-number')).toHaveValue('46');
 await page.locator('#island-exit').click();await page.keyboard.press('ArrowDown');await expect(page.locator('#angle-number')).toHaveValue('44');
 await page.evaluate(()=>{const m=(window as any).__keys;m.open('keys-again',m.managed);});
 await page.locator('#island-lock').click();
 await page.locator('#island-fire').click();await page.keyboard.press('ArrowLeft');await expect(page.locator('#island-power-number')).toHaveValue('21');
});
