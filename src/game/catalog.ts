export type Rarity = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
export type StatKey = 'health'|'damage'|'defense'|'move'|'normal'|'element'|'crit'|'critDamage'|'cool'|'gold'|'exp'|'area'|'projectiles'|'dodge'|'duration'|'dot'|'status'|'attackSpeed'|'luck'|'pickup'|'pickupFlat'|'regen'|'support'|'allyDamage'|'allySpeed'|'allyBuff'|'sage';
export type Bonuses = Partial<Record<StatKey, number>>;
export type Item = { id:string; name:string; rarity:Rarity; cost:number; icon:string; sprite:number; max:number; description:string; bonuses:Bonuses };
const item = (id:string,name:string,rarity:Rarity,sprite:number,max:number,description:string,bonuses:Bonuses):Item => ({id,name,rarity,sprite,max,description,bonuses,icon:'◆',cost:({Comum:0,Incomum:150,Raro:300,'Épico':500,'Lendário':900})[rarity]});
// Migrado do catálogo legado (24), hub/cena (+3) e documento de aliados (+4).
// Números e limites ainda são balanceamento de protótipo.
export const ITEMS:Item[] = [
  item('damage','Pergaminho de Força','Comum',3,10,'+20% de dano total.',{damage:.2}),
  item('bandana','Bandana Reforçada','Comum',4,10,'+10 pontos de armadura.',{defense:10}),
  item('sandals','Sandálias Leves','Comum',5,10,'+13% de velocidade de movimento.',{move:.13}),
  item('coins','Bolsa de Moedas','Comum',8,10,'+30% de Ryu recebido por drops.',{gold:.3}),
  item('life','Talismã de Vida','Comum',15,10,'+40 HP máximo. Recupera o HP acrescentado.',{health:40}),
  item('pickup','Bolsa de Lamens do Naruto','Incomum',8,10,'+30% de alcance de coleta. Não concede Lamens.',{pickup:.3}),
  item('taijutsu','Luvas de Taijutsu','Incomum',0,10,'+25% de dano físico.',{normal:.25}),
  item('ninjutsu','Selo de Ninjutsu','Incomum',1,10,'+25% de dano de ninjutsu e Ultimate.',{element:.25}),
  item('chakra','Chakra Concentrado','Incomum',9,10,'+25% de velocidade de recarga da Ultimate; não fornece carga instantânea.',{cool:.25}),
  item('experience','Pedra da Juventude','Incomum',10,10,'+25% de experiência recebida e +2 m de alcance de coleta.',{exp:.25,pickupFlat:2}),
  item('luck','Colar do Primeiro Hokage','Raro',2,5,'+15 de Sorte. Melhora a raridade das ofertas de itens.',{luck:15}),
  item('critical','Pergaminho de Crítico','Raro',7,10,'+8 pontos percentuais de chance crítica. Acima de 100%, aumenta a chance de mega crítico.',{crit:.08}),
  item('cooldown','Ampulheta de Recarga','Raro',6,5,'+13% de velocidade de recarga da Ultimate.',{cool:.13}),
  item('area','Selo de Área','Raro',1,5,'+22% de raio dos ataques em área.',{area:.22}),
  item('duration','Amuleto da Duração','Raro',2,5,'+30% de duração de efeitos de status.',{duration:.3}),
  item('tracker','Olhos do Rastreador','Raro',7,5,'+12 pontos percentuais de chance de status (Genjutsu). Técnicas sem status passam a aplicar lentidão.',{status:.12}),
  item('fortune','Talismã da Sorte','Raro',2,5,'+8 de Sorte para as próximas ofertas.',{luck:8}),
  item('clone','Clone Adicional','Épico',11,3,'+1 projétil por disparo; prioriza outro inimigo.',{projectiles:1}),
  item('dodge','Pérola da Esquiva','Épico',2,5,'+9 pontos percentuais de evasão.',{dodge:.09}),
  item('poison','Anel do Veneno','Épico',14,3,'Ataques envenenam por 3 s: 35% do dano do impacto ao longo da duração base.',{dot:.35}),
  item('speed','Selo de Velocidade','Épico',5,5,'+20% de velocidade dos ataques automáticos.',{attackSpeed:.2}),
  item('recruit','Pergaminho de Recrutamento','Épico',11,1,'+1 vaga de suporte nesta run.',{support:1}),
  item('mantle','Manto da Sorte','Raro',4,10,'+35 de Sorte.',{luck:35}),
  item('sage','Armadura do Sábio','Lendário',4,2,'+12% dano, HP, movimento e cadência; +12 armadura.',{damage:.12,move:.12,attackSpeed:.12,defense:12}),
  item('lee','Remédio do Rock Lee','Lendário',0,1,'Punho Bêbado: +20% dano, +20% cadência, +15% movimento e +10 pontos de evasão.',{damage:.2,attackSpeed:.2,move:.15,dodge:.1}),
  item('insignia','Insígnia da Fortuna','Lendário',8,2,'+65% de Ryu recebido por drops.',{gold:.65}),
  item('tenten','Shuriken Selo da Tenten','Lendário',1,1,'+30% dano total. E sela instantaneamente um mega elite já derrotado.',{damage:.3}),
  item('commander','Insígnia do Comandante','Raro',7,5,'+12% de dano dos aliados.',{allyDamage:.12}),
  item('drum','Tambor de Guerra','Épico',6,3,'+15% de cadência dos aliados.',{allySpeed:.15}),
  item('banner','Estandarte da Aliança','Lendário',11,1,'+20% de força dos buffs dos ajudantes.',{allyBuff:.2}),
  item('cooperation','Selo de Cooperação','Raro',1,5,'+10% dano dos aliados e +5% de força dos buffs dos ajudantes.',{allyDamage:.1,allyBuff:.05}),
  item('crit-damage','Kunai Afiada','Comum',1,10,'+10 pontos percentuais de dano crítico (250% → 260% na primeira cópia).',{critDamage:.1}),
  item('crit-lens','Lente de Precisão','Incomum',7,10,'+20 pontos percentuais de dano crítico.',{critDamage:.2}),
  item('crit-seal','Selo do Golpe Fatal','Épico',7,10,'+40 pontos percentuais de dano crítico.',{critDamage:.4}),
  item('precision-seal','Selo de Precisão','Épico',7,10,'+15 pontos percentuais de chance crítica, incluindo a faixa de mega crítico.',{crit:.15}),
  item('sage-infusion','Selo de Senjutsu','Épico',3,1,'Infunde todas as técnicas com Modo Sábio. Ativa o bônus de +20% de dano sábio de Hashirama.',{sage:1}),
];
export const ITEM_BY_NAME = Object.fromEntries(ITEMS.map(i=>[i.name,i])) as Record<string,Item>;
export function availableItems(unlocked:readonly string[], archived:readonly string[], allForPrototype:boolean) {
  return ITEMS.filter(i=>!archived.includes(i.id)&&(allForPrototype||i.rarity==='Comum'||unlocked.includes(i.id)));
}
export function rollItems(pool:readonly Item[], owned:Record<string,number>, luck:number, count:number, rng= Math.random):Item[] {
  const eligible=pool.filter(i=>(owned[i.name]||0)<i.max), result:Item[]=[];
  const rarities:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
  while(eligible.length&&result.length<count){
    // Divide pelo número de itens de cada raridade para o tamanho do catálogo não enviesar os pesos.
    const weights=eligible.map(i=>{const n=rarities.indexOf(i.rarity);return [90,9.889,.1,.01,.001][n]*Math.pow(1+Math.min(500,Math.max(0,luck))/100,n)/eligible.filter(j=>j.rarity===i.rarity).length;});
    let roll=rng()*weights.reduce((a,b)=>a+b,0), index=weights.length-1;
    for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0){index=i;break;}}
    result.push(eligible.splice(index,1)[0]);
  }
  return result;
}
