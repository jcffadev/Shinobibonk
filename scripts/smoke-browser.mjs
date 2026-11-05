import { chromium } from 'file:///C:/Users/jcffa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { createServer } from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:5176,strictPort:true}});await server.listen();
const browser=await chromium.launch({headless:true,executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.log('PAGEERROR',e.message));page.on('console',msg=>{if(msg.type()==='error')console.log('CONSOLE',msg.text());});
await page.goto('http://127.0.0.1:5176/?test=1');await page.getByRole('button',{name:'Escolher shinobi',exact:false}).click();
await page.screenshot({path:'artifacts/roster.png'});
console.log('ROSTER',await page.locator('.character-card').count());
await page.getByRole('button',{name:'Planejar missão →',exact:true}).click();await page.getByRole('button',{name:'Escolher missão →',exact:true}).click();
await page.getByRole('button',{name:'Iniciar missão Genin',exact:false}).click();
await page.waitForTimeout(3000);await page.screenshot({path:'artifacts/combat.png'});
console.log('RUNTIME',await page.evaluate(()=>window.__shinobiTest?.inspect()));
await page.keyboard.press('p');await page.waitForTimeout(500);await page.screenshot({path:'artifacts/sheet.png'});
await browser.close();await server.close();




