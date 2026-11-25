import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, skillPool, ultimateBase } from '../src/game/heroes.ts';
import { ITEMS, ITEM_BY_NAME } from '../src/game/catalog.ts';
import {
  ELEMENT_KEY, NO_GROWTH, affectedTechniques, hasSenjutsu, techniqueHitDamage,
} from '../src/game/combat.ts';
import { calculateStats } from '../src/game/progression.ts';

const baseline = calculateStats('auditoria',1);
const subject = { ...HEROES[0].techniques[0], name:'Katon de teste', element:'Fogo', school:'Ninjutsu', power:1 };
const buffs = (...names) => calculateStats('auditoria',1,Object.fromEntries(names.map(name=>[name,1])));
const hit = (t,stats,options) => techniqueHitDamage(t,NO_GROWTH,stats,options);
const close = (actual,expected,label) => assert.ok(Math.abs(actual-expected)<1e-9*Math.max(1,expected),label ?? (actual+' ≠ '+expected));

test('cada técnica do elenco recebe os itens de dano compatíveis com escola e elementos',()=>{
  const sealed = new Set(HEROES.map(hero=>hero.id));
  const attacks = new Map();
  for(const hero of HEROES){
    for(const technique of skillPool(hero.id,sealed)){
      if(!technique.setup)attacks.set(technique.name+'|'+technique.school+'|'+technique.element+'|'+technique.secondaryElement,technique);
    }
    attacks.set(hero.id+'-ultimate',{...ultimateBase(hero),name:hero.ultimate,ultimate:true,setup:undefined});
  }
  assert.ok(attacks.size>=300);
  const elementKeys = Object.values(ELEMENT_KEY);
  const items = ITEMS.filter(item=>['damage','normal','element','genjutsu','armorPhysical',...elementKeys].some(key=>item.bonuses[key]));
  for(const item of items){
    const after = buffs(item.name);
    const b = item.bonuses;
    for(const t of attacks.values()){
      const schools = t.ultimate?['normal','element','genjutsu']:[{Taijutsu:'normal',Ninjutsu:'element',Genjutsu:'genjutsu'}[t.school]];
      const school = schools.reduce((factor,key)=>factor*(1+(b[key]??0)),1);
      const elements = t.ultimate?elementKeys:[...new Set([t.element,t.secondaryElement].filter(Boolean).map(name=>ELEMENT_KEY[name]))];
      const element = 1+elements.reduce((sum,key)=>sum+(b[key]??0),0);
      const armor = t.ultimate||t.school==='Taijutsu'?1+Math.min(.5,after.armor*(b.armorPhysical??0)):1;
      close(hit(t,after),hit(t,baseline)*(1+(b.damage??0))*school*element*armor,t.name+' · '+item.name);
    }
  }
});

test('Ninjutsu, elemento, dano total e afixos são etapas independentes',()=>{
  const raw = hit(subject,baseline);
  const seal = 'Selo de Ninjutsu', katon = 'Pergaminho Katon';
  close(hit(subject,buffs(seal)),raw*1.15);
  close(hit({...subject,school:'Taijutsu'},buffs(seal)),raw);
  close(hit(subject,buffs(seal,katon)),raw*1.15*1.28*1.03);
  const built = calculateStats('auditoria',1,{[seal]:2,[katon]:1});
  const growth = {...NO_GROWTH,damage:1};
  close(techniqueHitDamage(subject,growth,built,{affinity:'Fogo',trained:true}),raw*2*1.3*1.28*1.03*1.5*1.15);
  const fusion = {...subject,secondaryElement:'Água'}, suiton = 'Pergaminho Suiton';
  close(hit(fusion,buffs(katon,suiton)),raw*1.56*1.06);
  assert.deepEqual(affectedTechniques(ITEM_BY_NAME[suiton],[fusion,subject]),[fusion.name]);
  close(hit({...subject,secondaryElement:'Fogo'},buffs(katon)),raw*1.28*1.03);
});

test('Genjutsu de suporte e infusão Sábia usam a linha certa sem repetir elemento',()=>{
  const illusion = {...subject,school:'Genjutsu'};
  const gen = buffs('Pergaminho Genjutsu');
  close(hit(illusion,gen,{ally:true}),hit(illusion,baseline,{ally:true})*1.28*1.03);
  const sageScroll = 'Pergaminho do Monte Myoboku';
  const sage = buffs(sageScroll);
  const withSecondary = {...subject,secondaryElement:'Sábio'};
  close(hit(withSecondary,sage,{sageInfused:true}),hit(subject,baseline)*1.28*1.03);
  assert.equal(hasSenjutsu(withSecondary,false),true);
  close(hit(illusion,sage,{sageInfused:true}),hit(illusion,baseline)*1.28*1.03);
  assert.equal(hasSenjutsu(illusion,true),false);
  assert.deepEqual(affectedTechniques(ITEM_BY_NAME[sageScroll],[subject],true),[subject.name]);
});
