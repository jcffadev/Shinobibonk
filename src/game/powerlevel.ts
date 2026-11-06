import type { Stats } from './progression.ts';

/** Recompensa extra por nível sem upgrades elegíveis, separada do crescimento normal. */
export const POWERLEVEL_RATE = .008;
export const POWERLEVEL_ATTRIBUTES = {
  maxHp:'HP', damage:'Dano', armor:'Armadura', moveSpeed:'Movimento',
  attackSpeed:'Velocidade de ataque', projectileSpeed:'Velocidade de projétil',
  crit:'Chance crítica', critDamage:'Dano crítico', regen:'Regeneração',
  luck:'Sorte', pickup:'Coleta', xpGain:'Experiência', moneyGain:'Ryu recebido',
  ultimateRate:'Recarga da Ultimate', area:'Área', duration:'Duração',
  physical:'Taijutsu', ninjutsu:'Ninjutsu', genjutsu:'Genjutsu',
} as const;
export type PowerlevelAttribute = keyof typeof POWERLEVEL_ATTRIBUTES;
export type Powerlevel = Partial<Record<PowerlevelAttribute,number>>;

export function readPowerlevel(value: unknown):Powerlevel {
  const result:Powerlevel={};
  if(!value||typeof value!=='object')return result;
  for(const key of Object.keys(POWERLEVEL_ATTRIBUTES) as PowerlevelAttribute[]){
    const count=(value as Powerlevel)[key];
    if(typeof count==='number'&&Number.isFinite(count)&&count>0)result[key]=Math.floor(count);
  }
  return result;
}

/** +0,8% por sorteio sobre o atributo calculado; acumulação aditiva, não +0,8 ponto percentual. */
export function applyPowerlevel(stats:Stats,levels:Powerlevel):Stats {
  const result={...stats};
  for(const [key,count] of Object.entries(readPowerlevel(levels)))
    result[key as PowerlevelAttribute]*=1+POWERLEVEL_RATE*count;
  return result;
}

/** Não sorteia atributos zerados: multiplicar zero seria uma recompensa vazia. */
export function rollPowerlevel(stats:Stats,rng=Math.random):PowerlevelAttribute {
  const keys=(Object.keys(POWERLEVEL_ATTRIBUTES) as PowerlevelAttribute[]).filter(key=>Number.isFinite(stats[key])&&stats[key]>0);
  return keys[Math.min(keys.length-1,Math.max(0,Math.floor(rng()*keys.length)))]??'maxHp';
}
