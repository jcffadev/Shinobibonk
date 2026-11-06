import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/jcffa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server=await createServer({server:{host:'127.0.0.1',port:5176,strictPort:true}});await server.listen();
let browser;const checks=[],errors=[],missing=[];
try {
browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--mute-audio','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()===404&&!r.url().endsWith('favicon.ico'))missing.push(r.url());});
const wait=()=>page.waitForTimeout(300);
const debug=async(method,...args)=>page.evaluate(([m,a])=>window.__shinobiTest[m](...a),[method,args]);
const state=()=>debug('inspect');
const start=async()=>{
 await page.getByRole('button',{name:'Planejar missão →',exact:true}).click();
 await page.getByRole('button',{name:'Escolher missão →',exact:true}).click();
 await page.getByRole('button',{name:/Começar!/}).click();await wait();
};
await page.goto('http://127.0.0.1:5176/?test=1');
await page.getByRole('button',{name:'Escolher shinobi',exact:false}).click();
assert.equal(await page.locator('.character-card').count(),24);checks.push('24 shinobis selecionáveis');
await page.getByLabel('Aldeia').selectOption('Vila da Areia');assert.equal(await page.locator('.character-card').count(),3);checks.push('Filtro Areia: Gaara / Temari / Kankuro');
await page.getByRole('button',{name:'Limpar filtros'}).click();
await page.screenshot({path:'artifacts/roster.png'});
await start();
assert.equal((await state()).form,'Academia');assert.equal((await state()).stats.maxHp,85);
assert.equal((await state()).enemies.filter(e=>e.heroId).length,0);checks.push('Relógio começa sem guardião antecipado');
await page.waitForTimeout(1500);assert.equal((await state()).atlasReady,true);checks.push('Textura PNG do personagem carregada');
await page.screenshot({path:'artifacts/combat.png'});
await page.keyboard.press('w');const before=(await state()).player;
await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');
assert.ok(Math.hypot((await state()).player.x-before.x,(await state()).player.z-before.z)>1);checks.push('Movimento WASD');
await debug('clearEnemies');await debug('reward');await wait();
const low=(await state()).choice;assert.ok(low.filter(c=>c.kind==='skill').every(c=>c.name==='Kage Bunshin'));checks.push('Rasengan bloqueado nos níveis iniciais');
const uses=(await state()).uses;await page.keyboard.press('f');assert.equal((await state()).uses.reroll,uses.reroll-1);
await page.keyboard.press('z');let chosen=(await state()).choice.findIndex(c=>c.kind!=='stat');const bannedName=(await state()).choice[chosen].name;await page.keyboard.press(String(chosen+1));assert.equal((await state()).uses.ban,2);assert.ok(!(await state()).choice.some(c=>c.name===bannedName));await page.keyboard.press('x');assert.equal((await state()).uses.skip,2);checks.push('Atualizar, banir e pular debitam usos; banimento exclui futuras ofertas');
await debug('dismiss');await debug('setLevel',10);await debug('reward');await wait();
assert.equal((await state()).form,'Clássico');let selected=(await state()).choice.findIndex(c=>c.kind==='skill');assert.ok(selected>=0);
const offer=(await state()).choice[selected];await page.keyboard.press(String(selected+1));assert.equal((await state()).skills[offer.name],offer.name==='Kage Bunshin'?2:1);assert.deepEqual((await state()).growth[offer.name],offer.growth);checks.push('Afixos sorteados aplicados à habilidade escolhida');
for(const [lv,form] of [[25,'Shippuden'],[50,'Manto da Kyuubi']]){await debug('setLevel',lv);assert.equal((await state()).form,form);}
checks.push('Naruto evolui nos níveis 10 / 25 / 50 com troca de forma');
await debug('setLevel',10);await debug('dismiss');await wait();await debug('clearEnemies');
await debug('defeatMega','temari');await wait();assert.match(await page.locator('.sealing-modal').innerText(),/Temari/);
await page.screenshot({path:'artifacts/sealing.png'});
await page.keyboard.press('e');for(let n=0;n<40&&!(await state()).allies.includes('temari');n++)await page.waitForTimeout(250);assert.ok((await state()).allies.includes('temari'));
await page.keyboard.press('Enter');await debug('dismiss');await wait();checks.push('Selamento mostra e recruta Temari após animação');
await debug('recruitAlly','gaara');assert.equal((await state()).synergy,false);await debug('recruitAlly','kankuro');assert.equal((await state()).synergy,true);checks.push('Sinergia só ativa com os três suportes da Areia');
await debug('clearEnemies');await debug('target',2);await debug('setCrit',2);await debug('learn','Rasengan');
await page.keyboard.press('h');await wait();const damageBefore=(await state()).totalDamage;
await debug('cast','Rasengan');await wait();const hidden=await state();assert.ok(hidden.totalDamage>damageBefore);assert.equal(hidden.hiddenEffects,true);assert.equal(hidden.visibleShots,0);assert.equal(hidden.visibleNumbers,0);checks.push('H oculta projéteis/números sem impedir dano');
await page.keyboard.press('h');await debug('cast','Rasengan');await wait();await page.screenshot({path:'artifacts/rasengan.png'});
await debug('setChakra');await page.keyboard.press('r');assert.ok((await state()).chakra<100);await page.locator('.ultimate-auto-mark').click();assert.equal((await state()).autoUlt,true);checks.push('Ultimate R e selo AUTO');
await page.keyboard.press('y');assert.equal((await state()).autoUlt,false);await page.keyboard.press('y');assert.equal((await state()).autoUlt,true);checks.push('Tecla Y alterna a Ultimate automática');
await debug('clearEnemies');await debug('dismiss');await wait();await debug('defeatMega','neji');await page.keyboard.press('g');await wait();
assert.equal((await state()).sealing,null);await page.keyboard.press('e');await wait();assert.equal((await state()).choice.length,3);await page.keyboard.press('1');await wait();checks.push('Recusa G deixa kunai grátis com três escolhas');
await debug('dismiss');await debug('setMoney',100);await debug('pickup','kunai');await wait();await page.keyboard.press('e');await wait();assert.equal((await state()).paidWeapons,1);assert.equal((await state()).runMoney,80);await page.keyboard.press('1');await wait();
await debug('dismiss');await debug('pickup','kunai');await wait();await page.keyboard.press('e');await wait();assert.equal((await state()).paidWeapons,2);assert.equal((await state()).runMoney,50);await page.keyboard.press('1');await wait();checks.push('Kunais custam 20 e depois 30 Ryu');
await debug('grantItem','Pedra da Juventude');await debug('grantItem','Kunai Afiada');await debug('dismiss');await wait();
await page.keyboard.press('p');await wait();const details=page.locator('.sheet-column').first().locator('details');await details.first().evaluate(el=>el.open=true);await details.first().scrollIntoViewIfNeeded();assert.ok(await page.locator('.pool-icon-row .catalog-icon').count()>0);checks.push('Ícones no pool de itens da ficha');
await page.screenshot({path:'artifacts/sheet-pool.png'});await page.getByRole('button',{name:'Continuar missão',exact:true}).click();await wait();
await page.keyboard.press('m');await page.locator('.world-map').click({position:{x:120,y:120}});await wait();assert.ok(await page.locator('.known-map-event').count()>0);await page.getByRole('button',{name:'Fechar · Esc'}).click();checks.push('Mapa M recebe marcação por clique');
await debug('dismiss');await debug('finishMission');await wait();await page.getByRole('heading',{name:'Missão concluída!'}).waitFor({state:'visible',timeout:8000});checks.push('Portal de saída conclui a missão com vitória');
const walletNow=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sb_admin_wallet_v1')));
const afterVictory=await walletNow();await page.waitForTimeout(1500);
assert.equal((await walletNow()).balance,afterVictory.balance);assert.ok(afterVictory.balance-afterVictory.spent>999999);assert.ok(await page.getByText('Lamens',{exact:false}).first().isVisible());checks.push('Vitória credita Lamens uma única vez e mostra no resumo');
await page.getByRole('button',{name:'Preparar outra missão'}).click();
await page.getByRole('button',{name:'Itens',exact:true}).click();
await page.getByLabel('Raridade').selectOption('Raro');await page.getByLabel('Atributo',{exact:true}).selectOption('Chance crítica');
assert.equal(await page.locator('.shop-card').count(),1);
const beforeBuy=(await walletNow()).balance;
await page.locator('.shop-card').getByRole('button',{name:'Desbloquear',exact:false}).click();
assert.equal((await walletNow()).balance,beforeBuy-300);
await page.getByRole('button',{name:'Reset ↺'}).click();assert.equal((await walletNow()).spent,0);assert.equal((await walletNow()).balance,beforeBuy+(afterVictory.spent));checks.push('Compra administrativa, filtros de crítico e reembolso do reset');
await page.getByRole('button',{name:'Shinobis',exact:true}).click();await page.locator('.character-card').filter({hasText:'Hashirama'}).click();await start();
const ratio=await page.evaluate(()=>{const d=window.__shinobiTest;d.clearEnemies();d.setCrit(-10);d.target(1.2);let previous=d.inspect().totalDamage;d.cast('Estacas Mokuton');const first=d.inspect().totalDamage-previous;d.grantItem('Selo de Senjutsu');previous=d.inspect().totalDamage;d.cast('Estacas Mokuton');return (d.inspect().totalDamage-previous)/first;});
assert.ok(Math.abs(ratio-1.2)<1e-8);checks.push('Hashirama recebe exatamente +20% de dano após infusão Sábia');
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar e sair',exact:true}).click();await page.getByRole('button',{name:'Shinobis',exact:true}).click();await page.locator('.character-card').filter({hasText:'Itachi'}).click();await start();
const slept=await page.evaluate(()=>{const d=window.__shinobiTest;d.clearEnemies();d.target(1);for(let n=0;n<8;n++)d.grantItem('Olhos do Rastreador');let applied=false;for(let n=0;n<20;n++){d.cast('Corvos Ilusórios');applied ||= d.inspect().enemies.some(e=>e.control==='Dormir'&&e.controlTime>0);}return applied;});
assert.equal(slept,true);checks.push('Genjutsu aplica Dormir em um inimigo real');
await page.keyboard.press('p');await wait();await page.screenshot({path:'artifacts/genjutsu-sheet.png'});


assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);checks.push('Sem exceções JavaScript ou assets 404');
console.log(JSON.stringify({checks,errors,missing},null,2));fs.writeFileSync('artifacts/runtime-checks.json',JSON.stringify({date:new Date().toISOString(),checks,errors,missing},null,2));
}finally{await browser?.close();await server.close();}



