import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/jcffa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server=await createServer({server:{host:'127.0.0.1',port:5176,strictPort:true}});await server.listen();
let browser,performanceSample;const checks=[],errors=[],missing=[];
try {
browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--mute-audio','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&/shader error|VALIDATE_STATUS/i.test(m.text()))errors.push(m.text());});
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
await page.getByRole('button',{name:'Bolsa da Missão',exact:true}).click();
const rarityGroup=page.getByRole('group',{name:'Filtrar itens por raridade'});
await rarityGroup.getByRole('button',{name:'Raro',exact:true}).click();
const bagCards=page.locator('.bag-card');
assert.ok(await bagCards.count()>0);
assert.equal(await bagCards.count(),await page.locator('.bag-card.rarity-raro').count());
await page.getByRole('searchbox',{name:'Buscar itens da bolsa'}).fill('Colete Jonin');
assert.equal(await bagCards.count(),1);
await page.getByRole('tab',{name:/Bloqueado/}).click();
assert.ok(await bagCards.count()<=1);
await page.getByRole('button',{name:'SHINOBIBONK'}).click();
checks.push('Bolsa da Missão combina raridade, busca e aba de estado');
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
for(const [level,form] of [[10,'classico'],[25,'shippuden'],[50,'kyuubi']]){
 await debug('dismiss');await debug('clearEnemies');await debug('clearDrops');await debug('setLevel',level);
 await wait();
 await page.keyboard.down('w');
 try {
   await page.waitForFunction(name=>window.__shinobiTest.motion().atlas.endsWith(name),`naruto-${form}-motion-v1.png`,{timeout:7000});
 } catch(error) {
   console.error({form,motion:await debug('motion'),choice:(await state()).choice,errors,missing});
   throw error;
 }
 await page.keyboard.up('w');
}
checks.push('Evoluções do Naruto carregam a folha da forma atual');
await debug('setLevel',10);
await debug('target',1);
assert.equal(await debug('cast','Invocação do Sapo'),true);
await page.waitForFunction(()=>window.__shinobiTest.motion().atlas.endsWith('/naruto-classico-action-v1.png'));
checks.push('Naruto Clássico usa quadros de lançamento com a roupa da forma');
await debug('setLevel',1);
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
await page.keyboard.press('h');
const impact=await page.evaluate(()=>{const d=window.__shinobiTest;d.cast('Rasengan');return d.inspect().impacts;});
assert.ok(impact>0);
await page.screenshot({path:'artifacts/rasengan.png'});
checks.push('Rasengan exibe impacto no inimigo quando H está desativado');
await debug('setChakra');await page.keyboard.press('r');assert.ok((await state()).chakra<100);await page.locator('.ultimate-auto-mark').click();assert.equal((await state()).autoUlt,true);checks.push('Ultimate R e selo AUTO');
await page.keyboard.press('y');assert.equal((await state()).autoUlt,false);await page.keyboard.press('y');assert.equal((await state()).autoUlt,true);checks.push('Tecla Y alterna a Ultimate automática');
await debug('clearEnemies');await debug('dismiss');await wait();await debug('defeatMega','neji');await page.keyboard.press('g');await wait();
assert.equal((await state()).sealing,null);await page.keyboard.press('e');await wait();assert.equal((await state()).choice.length,3);await page.keyboard.press('1');await wait();checks.push('Recusa G deixa kunai grátis com três escolhas');
await debug('dismiss');await debug('clearEnemies');await debug('clearDrops');await debug('setMoney',100);await debug('pickup','kunai');await wait();await page.keyboard.press('e');await wait();assert.equal((await state()).paidWeapons,1);assert.equal((await state()).runMoney,80);await page.keyboard.press('1');await wait();
await debug('dismiss');await debug('clearEnemies');await debug('clearDrops');await debug('pickup','kunai');await wait();await page.keyboard.press('e');await wait();assert.equal((await state()).paidWeapons,2);assert.equal((await state()).runMoney,50);await page.keyboard.press('1');await wait();checks.push('Kunais custam 20 e depois 30 Ryu');
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
await debug('clearEnemies');await debug('clearDrops');
for(const [level,atlas,key] of [[1,'hashirama-walk-v1.png','w'],[20,'hashirama-20-walk-v1.png','s']]){
 await debug('setLevel',level);
 await page.keyboard.down(key);
 await page.waitForFunction(name=>window.__shinobiTest.motion().atlas.endsWith(name),atlas);
 await page.keyboard.up(key);
}
assert.equal((await state()).form,'Modo Sábio');
await debug('setLevel',1);
checks.push('Hashirama usa a folha direcional da forma atual, incluindo Modo Sábio');
const ratio=await page.evaluate(()=>{const d=window.__shinobiTest;d.clearEnemies();d.setCrit(-10);d.senjutsu(0);d.target(1.2);let previous=d.inspect().totalDamage;d.cast('Estacas Mokuton');const first=d.inspect().totalDamage-previous;d.grantItem('Selo de Senjutsu');previous=d.inspect().totalDamage;d.cast('Estacas Mokuton');return (d.inspect().totalDamage-previous)/first;});
assert.ok(Math.abs(ratio-1.2)<1e-8);checks.push('Hashirama recebe exatamente +20% de dano após infusão Sábia');
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Salvar e sair',exact:true}).click();await page.getByRole('button',{name:'Shinobis',exact:true}).click();await page.locator('.character-card').filter({hasText:'Itachi'}).click();await start();
const slept=await page.evaluate(()=>{const d=window.__shinobiTest;d.clearEnemies();d.target(1);for(let n=0;n<8;n++)d.grantItem('Olhos do Rastreador');let applied=false;for(let n=0;n<20;n++){d.cast('Corvos Ilusórios');applied ||= d.inspect().enemies.some(e=>e.control==='Dormir'&&e.controlTime>0);}return applied;});
assert.equal(slept,true);checks.push('Genjutsu aplica Dormir em um inimigo real');
await page.keyboard.press('p');await wait();await page.screenshot({path:'artifacts/genjutsu-sheet.png'});

await page.getByRole('button',{name:'Continuar missão',exact:true}).click();
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Salvar e sair',exact:true}).click();
await page.getByRole('button',{name:'Shinobis',exact:true}).click();
await page.locator('.character-card').filter({hasText:'Asuma'}).click();
await start();
assert.equal((await state()).heroId,'asuma');
await page.waitForFunction(()=>window.__shinobiTest.inspect().atlasReady);
await debug('clearEnemies');
await page.keyboard.down('w');
await page.waitForFunction(()=>window.__shinobiTest.motion().pose==='walk');
await page.keyboard.up('w');
await page.keyboard.press('Space');
await page.waitForFunction(()=>window.__shinobiTest.motion().pose==='jump');
await page.waitForFunction(()=>window.__shinobiTest.motion().jumpHeight===0);
await page.keyboard.press('Shift');
await page.waitForFunction(()=>window.__shinobiTest.motion().pose==='dash');
checks.push('Asuma carrega seu atlas e usa caminhada, pulo e dash');
await page.mouse.move(720,510);
const cameraBefore=await debug('motion');
await page.mouse.move(770,285,{steps:10});
const cameraAfter=await debug('motion');
assert.ok(cameraAfter.yaw!==cameraBefore.yaw&&cameraAfter.pitch<.3);
await page.screenshot({path:'artifacts/camera-horizonte.png'});
checks.push('Movimento do mouse inclina a câmera sem botão até perto do horizonte');

await debug('setMoney',10000);
await page.evaluate(()=>{
 const r=window.__shinobiTest.roulette;
 const view=r.open();if(view.weights.pill!==0)throw Error('Roleta ainda sorteia pílula');
 r.spin(2,'item');r.exit();
});
const prize=page.getByRole('dialog',{name:'Prêmio da Tsunade'});
await prize.waitFor();
const beforePrizes=await state();
await prize.getByRole('button',{name:/Vender/}).click();
await page.waitForFunction(()=>window.__shinobiTest.inspect().choice?.[0]?.kind==='item');
assert.deepEqual((await state()).pills,beforePrizes.pills);
await page.keyboard.press('e');
await prize.waitFor({state:'hidden'});
assert.deepEqual((await state()).pills,beforePrizes.pills);
assert.equal(Object.values((await state()).items).reduce((n,k)=>n+k,0),1);
checks.push('Prêmios em sequência: vender primeiro item e receber o segundo com E');

await debug('clearEnemies');await debug('setTime',600);await page.evaluate(()=>window.__shinobiTest.mapRoute.god(true));await debug('horde',1600,14,1e6,true);
await page.waitForFunction(()=>Number(document.querySelector('.runtime-readout')?.textContent?.match(/(\d+) inimigos vivos/)?.[1])>=1600);
assert.ok((await debug('perf')).instances.bodies>300);
await debug('perf',true);await page.waitForTimeout(2500);
const load=await debug('perf');
assert.ok(load.enemies>=1600&&load.frames>0);
performanceSample={renderer:'Edge headless · ANGLE/SwiftShader',enemies:load.enemies,seconds:load.seconds,fps:load.fps,cpuUpdateMs:load.updateMs,cpuRenderMs:load.renderMs,drawCalls:load.calls,instances:load.instances};
await page.evaluate(()=>window.__shinobiTest.mapRoute.god(false));
checks.push('Horda passa de 300 e o HUD mostra 1.600 inimigos');

await debug('setTime',20);await debug('clearEnemies');await debug('clearDrops');
await debug('setRunBuff','luck',500);
let pillCard;
for(let n=0;n<30&&!pillCard;n++){
 await debug('reward');
 pillCard=(await state()).choice.find(c=>c.kind==='pill'&&c.rarity!=='Comum');
}
assert.ok(pillCard);
await page.getByRole('button',{name:new RegExp(pillCard.name)}).click();
assert.equal((await state()).pills[pillCard.name],1);
await debug('setRunBuff','luck',0);
for(let n=0;n<100;n++){
 await debug('reward');
 if((await state()).choice.some(c=>c.name===pillCard.name))break;
}
await page.getByRole('button',{name:/Banir/}).click();
await page.getByRole('button',{name:new RegExp(pillCard.name)}).click();
await debug('setLevel',30);
for(let n=0;n<20;n++){
 await debug('reward');
 assert.ok((await state()).choice.every(c=>c.name!==pillCard.name));
}
assert.equal((await state()).pills[pillCard.name],1);
checks.push('Pílula rara sobe um nível e seu banimento exclui todas as raridades e níveis');
await debug('dismiss');
await page.locator('.level-choice-backdrop').waitFor({state:'hidden'});
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Desistir',exact:true}).click();
const confirm=page.getByRole('button',{name:'Realmente deseja desistir? Clique novamente'});
await confirm.waitFor();
assert.equal((await state()).defeated,false);
await confirm.click();
await page.getByRole('button',{name:'Ir para o menu'}).click();
await page.getByRole('button',{name:'Jogar como convidado',exact:false}).waitFor();
checks.push('Desistência exige dois cliques na pausa e resumo volta ao menu');

await page.getByRole('button',{name:'Escolher shinobi',exact:false}).click();
await page.locator('.character-card').filter({hasText:'Sasuke'}).click();
await start();
assert.equal(await page.locator('.scene').evaluate(el=>getComputedStyle(el).cursor),'none');
assert.equal(await page.locator('.vitamin-row').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
await debug('clearEnemies');await debug('clearDrops');
await page.keyboard.press('Space');
await page.waitForFunction(()=>{const m=window.__shinobiTest.motion();return m.pose==='jump'&&m.atlas.endsWith('/sasuke-classico-action-v1.png');});
await page.waitForFunction(()=>window.__shinobiTest.motion().jumpHeight===0);
await page.keyboard.press('Shift');
await page.waitForFunction(()=>{const m=window.__shinobiTest.motion();return m.pose==='dash'&&m.atlas.endsWith('/sasuke-classico-action-v1.png');});
await page.waitForFunction(()=>window.__shinobiTest.motion().slideTime===0);
await debug('target',1);assert.equal(await debug('cast','Kunai Tática'),true);
await page.waitForFunction(()=>{const m=window.__shinobiTest.motion();return m.pose==='attack'&&m.atlas.endsWith('/sasuke-classico-action-v1.png');});
checks.push('Sasuke inicial usa quadros de ataque, pulo e dash; cursor e fundo do dock estão ocultos');

for(const id of ['chomei','gyuki']){
 await debug('clearEnemies');
 await page.waitForFunction(name=>window.__shinobiTest.bossArt(name).endsWith('/bijuu/'+name+'-v2.png'),id);
}
checks.push('Chōmei e Gyūki usam as novas texturas na cena');

assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);checks.push('Sem exceções JavaScript ou assets 404');
console.log(JSON.stringify({checks,errors,missing,performanceSample},null,2));fs.writeFileSync('artifacts/runtime-checks.json',JSON.stringify({date:new Date().toISOString(),checks,errors,missing,performanceSample},null,2));
}finally{await browser?.close();await server.close();}



