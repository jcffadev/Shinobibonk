import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HEROES, HERO_BY_ID } from '../src/game/heroes.ts';
import { NPC_ALLIES } from '../src/game/npcs.ts';
import { allyAttackInterval, allyBuffText } from '../src/game/allies.ts';
import { calculateStats } from '../src/game/progression.ts';
import { menuPortraitRegion } from '../src/game/evolution.ts';
import { load } from './helpers/load.mjs';

const {AllyCards}=await load('/src/ui/AllyCards.tsx');
const {RunSheet}=await load('/src/ui/RunSheet.tsx');

const markup = (component, props, ...children) => renderToStaticMarkup(createElement(component, props, ...children));
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('HUD usa a mesma linha e o retrato do seletor para cada shinobi e NPC de apoio',async()=>{
  const all=[...HEROES,...Object.values(NPC_ALLIES).filter(ally=>!HERO_BY_ID[ally.id])];
  for(const {id,name} of all){
    const html=markup(AllyCards,{allies:[id],affinity:{[id]:0},slots:5,charge:.5});
    assert.ok(html.includes(markup('strong',{},name)),name+' completo');
    assert.match(html,/Afinidade 1\/5/);
    const {path,cols,rows,index}=menuPortraitRegion(id);
    assert.ok(html.includes(path),name+' usa o retrato do seletor');
    const atlas=readFileSync(new URL('../public'+path,import.meta.url));
    assert.ok(index>=0&&index<cols*rows&&atlas.readUInt32BE(16)>=cols&&atlas.readUInt32BE(20)>=rows,name+' tem célula no atlas');
  }
  const allies=all.slice(-5).map(h=>h.id);
  const team=markup(AllyCards,{allies,slots:5,charge:.8});
  assert.equal((team.match(/class="ally-card"/g)||[]).length,5);
  assert.equal((team.match(/<progress/g)||[]).length,1,'a equipe divide uma barra');
  assert.equal(markup(AllyCards,{allies:[],slots:3,charge:0}),'');
  const css=read('src/allies.css');
  assert.match(css,/\.ally-info strong,\.synergy-row b\{[^}]*overflow-wrap:anywhere/);
  assert.doesNotMatch(css,/text-overflow\s*:\s*ellipsis|:nth-child\(n\+3\)/);
  assert.match(read('src/hud-layout.css'),/grid-template-rows:auto auto minmax\(0,1fr\)/,'a lista usa o espaço abaixo da ficha e da barra de missão');
});

test('a ficha conserva a passiva, o ataque e a recarga real do ajudante',async()=>{
  const hero=HERO_BY_ID.naruto;
  const stats={...calculateStats(hero.id,9),allySpeed:1.3,attackSpeed:1.25,allyBuff:1};
  const world={allies:['iruka'],affinity:{iruka:0},level:9,stats,items:{},setups:[],synergies:[],
    hp:60,maxHp:60,elapsed:120,kills:0,totalDamage:0,runMoney:0,xp:0,xpNext:30,difficultyScale:1,
    chakra:0,pills:{},techniques:[],skillLevels:{},banned:[]};
  const html=markup(RunSheet,{hero,world,planned:[],pool:[],onContinue(){},onMap(){}});
  const detail=html.match(/<article class="sheet-tile support-detail">.*?<\/article>/)?.[0]??'';
  const cooldown=allyAttackInterval(9,1.3,1.25).toLocaleString('pt-BR',{maximumFractionDigits:1});
  assert.ok(detail.includes('Iruka Umino'));
  assert.ok(detail.includes('Afinidade 1/5'));
  assert.ok(detail.includes(HERO_BY_ID.iruka.techniques.find(t=>!t.setup&&t.unlockLevel<=world.level).name));
  assert.ok(detail.replace(/<[^>]*>/g,'').includes(allyBuffText('iruka',1,0)));
  assert.ok(detail.includes(cooldown+' s'));
  assert.match(read('src/scene/GameCanvas.tsx'),/allyAttackInterval\(level,stats\.allySpeed,stats\.attackSpeed\)/);
});
