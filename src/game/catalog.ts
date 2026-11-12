export type Rarity = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
/**
 * Atributos que itens/pílulas/buffs podem dar. Os do primeiro bloco viram campos de `Stats`;
 * os do segundo bloco (mecânicas de item) ficam em `Stats.extra` e são lidos pela simulação (GameCanvas).
 */
export type StatKey = 'health'|'damage'|'defense'|'move'|'normal'|'element'|'crit'|'critDamage'|'cool'|'gold'|'exp'|'area'|'projectiles'|'projectileChance'|'dodge'|'duration'|'dot'|'status'|'attackSpeed'|'projectileSpeed'|'luck'|'pickup'|'pickupFlat'|'regen'|'support'|'allyDamage'|'allySpeed'|'allyBuff'|'sage'
  // Dano por elemento da técnica (+%) e Genjutsu (escola)
  |'elFogo'|'elAgua'|'elVento'|'elTerra'|'elRaio'|'elMadeira'|'elAreia'|'elSombra'|'elNeutro'|'elSabio'|'genjutsu'
  // Mecânicas de item
  |'healthPct'|'regenMult'|'eliteDamage'|'controlledDamage'|'statusStack'|'lowHpDamage'|'noHitDamage'|'killDamage'|'armorPhysical'|'bigCrit'
  |'lifesteal'|'thorns'|'killHeal'|'execute'|'burnChance'|'poisonChance'|'sleepChance'|'rootChance'|'chillChance'|'statusDamage'
  |'revive35'|'revive60'|'shield'|'rush'|'stance'|'smoke'|'emergencyHeal'|'periodicHeal'|'bolts'|'beam'|'freezeOnHit'
  |'bounce'|'kunaiDiscount'|'slotDiscount'|'enemyCount'|'threat'|'pillCap'|'skillCap'|'ultReset'
  // Caça-Níquel da Tsunade: +dano a cada 250 Ryu gastos na run (src/game/roulette.ts · spendBonuses)
  |'spendDamage';
export type Bonuses = Partial<Record<StatKey, number>>;
export type Item = { id:string; name:string; rarity:Rarity; cost:number; icon:string; sprite:number; max:number; description:string; bonuses:Bonuses };
const COST:Record<Rarity,number>={Comum:0,Incomum:150,Raro:300,'Épico':500,'Lendário':900};
const item = (id:string,name:string,rarity:Rarity,sprite:number,max:number,description:string,bonuses:Bonuses):Item => ({id,name,rarity,sprite,max,description,bonuses,icon:'◆',cost:COST[rarity]});
/** "Sem limite" da referência vira 10 cópias (convenção do projeto). */
const ANY=10;
// Ícones (atlas 4×4): 0 cabaça · 1 shuriken com selo · 2 colar · 3 pergaminho de força · 4 bandana · 5 amuleto de corrida
// 6 ampulheta · 7 pergaminho explosivo · 8 bolsa · 9 cristal roxo · 10 cristal azul · 11 pergaminho de equipe · 12–14 cápsulas · 15 anel
const el=(id:string,name:string,key:StatKey,label:string,sprite:number)=>item(id,name,'Comum',sprite,ANY,`+28% de dano de técnicas ${label} e +3% de dano total.`,{[key]:.28,damage:.03});

/**
 * Catálogo no formato da referência (raridade · efeito · gatilho · limite), com nomes do mundo ninja
 * e valores levemente alterados. Só entram efeitos que a simulação executa de verdade.
 * Números são balanceamento provisório.
 */
export const ITEMS:Item[] = [
  // ───── Comum ─────
  item('coins','Bolsa de Moedas','Comum',8,ANY,'+22% de Ryu recebido.',{gold:.22}),
  item('herbal-tea','Chá Medicinal','Comum',0,8,'6% de chance por abate de curar 2% do HP máximo.',{killHeal:.06}),
  item('ryo-nugget','Pepita de Ryo','Comum',8,5,'Kunais/shurikens do mapa custam 8% menos (até −40%) e +5% de Ryu.',{kunaiDiscount:.08,gold:.05}),
  el('el-fire','Pergaminho Katon','elFogo','de Fogo',7),
  el('el-water','Pergaminho Suiton','elAgua','de Água',10),
  el('el-wind','Pergaminho Fuuton','elVento','de Vento',5),
  el('el-earth','Pergaminho Doton','elTerra','de Terra',3),
  el('el-lightning','Pergaminho Raiton','elRaio','de Raio',9),
  el('el-wood','Pergaminho Mokuton','elMadeira','de Madeira',13),
  el('el-sand','Pergaminho Jiton de Areia','elAreia','de Areia',0),
  el('el-shadow','Pergaminho das Sombras','elSombra','de Sombra',11),
  el('el-neutral','Pergaminho Shinobi','elNeutro','neutras (armas e golpes)',1),
  // Específicos pedidos: Jutsu Sábio (elemento Sábio) e Genjutsu (escola), no mesmo molde dos pergaminhos de elemento.
  item('el-sage','Pergaminho do Monte Myoboku','Comum',2,ANY,'+28% de dano de técnicas Sábias (Senjutsu) e +3% de dano total.',{elSabio:.28,damage:.03}),
  item('genjutsu-scroll','Pergaminho Genjutsu','Comum',9,ANY,'+28% de dano de técnicas de Genjutsu e +3% de dano total.',{genjutsu:.28,damage:.03}),
  item('smoke','Bomba de Fumaça','Comum',0,ANY,'+4,5 pontos percentuais de evasão.',{dodge:.045}),
  item('exorcist','Etiqueta Exorcista','Comum',1,ANY,'+16% de dano contra elites, mega elites e guardiões.',{eliteDamage:.16}),
  item('wire','Fio de Aço Ninja','Comum',1,5,'4% de chance por acerto de prender o inimigo (Paralisar 1,2 s).',{rootChance:.04}),
  item('pickup','Ímã de Chakra','Comum',5,ANY,'+1,6 m de alcance de coleta.',{pickupFlat:1.6}),
  item('bandana','Bandana Reforçada','Comum',4,ANY,'+6 pontos de armadura.',{defense:6}),
  item('tanzaku','Amuleto Tanzaku','Comum',2,ANY,'+10 de Sorte e +3 pontos percentuais de chance crítica.',{luck:10,crit:.03}),
  item('life','Bolinho de Arroz','Comum',15,ANY,'+16 HP máximo.',{health:16}),
  item('balm','Bálsamo Medicinal','Comum',0,ANY,'+0,6 HP/s de regeneração.',{regen:.6}),
  item('sandals','Sandálias Leves','Comum',5,ANY,'+7% de velocidade de movimento.',{move:.07}),
  item('critical','Luneta Ninja','Comum',7,ANY,'+6 pontos percentuais de chance crítica.',{crit:.06}),
  item('area-seal','Selo de Expansão','Comum',11,ANY,'+10% de raio dos ataques em área.',{area:.1}),
  // Velocidade de projétil (referência: lente de mira): viagem de projéteis mais rápida e golpes/lançamentos com menos preparo.
  item('sniper-lens','Lente do Atirador','Comum',7,ANY,'+14% de velocidade de projétil e +3 pontos percentuais de chance crítica.',{projectileSpeed:.14,crit:.03}),

  // ───── Incomum ─────
  item('adrenaline','Selo de Adrenalina','Incomum',5,3,'Ao ser atingido: +20% de movimento e +12% de velocidade de ataque por 3 s.',{rush:1}),
  item('sleep-incense','Incenso do Sono','Incomum',2,3,'2,5% de chance por acerto de fazer o inimigo Dormir por 2 s.',{sleepChance:.025}),
  item('vampire-root','Raiz Vampira','Incomum',13,ANY,'Recupera 3% do dano causado como HP.',{lifesteal:.03}),
  item('chains','Correntes de Selamento','Incomum',15,5,'+20% de dano contra inimigos atordoados, paralisados, adormecidos ou lentos.',{controlledDamage:.2}),
  item('katon-orb','Esfera Katon','Incomum',7,5,'5% de chance por acerto de queimar e +10% de dano de status (queimadura/veneno).',{burnChance:.05,statusDamage:.1}),
  item('gold-tooth','Dente de Ouro','Incomum',8,3,'O Caça-Níquel da Tsunade e a atualização do Mercador custam 8% menos (até −24%).',{slotDiscount:.08}),
  item('akimichi-box','Marmita Akimichi','Incomum',8,ANY,'+1,2 HP/s de regeneração.',{regen:1.2}),
  item('green-tea','Chá Verde de Konoha','Incomum',13,3,'Ajudantes causam +25% de dano e atacam 15% mais rápido.',{allyDamage:.25,allySpeed:.15}),
  item('duration','Selo de Persistência','Incomum',6,ANY,'+20% de duração de efeitos de status.',{duration:.2}),
  item('experience','Pedra da Juventude','Incomum',10,ANY,'+15% de experiência recebida.',{exp:.15}),
  item('stone-stance','Postura de Pedra','Incomum',4,3,'Parado: +30% de armadura e +8% de velocidade de ataque até se mover.',{stance:1}),
  item('rhythm','Ritmo Ininterrupto','Incomum',6,ANY,'Sem levar golpes, o dano sobe 4% por segundo, até +40%. Zera ao ser atingido.',{noHitDamage:.4}),
  item('taijutsu','Luvas de Taijutsu','Incomum',3,ANY,'+15% de dano de Taijutsu.',{normal:.15}),
  item('poison-herb','Erva Venenosa','Incomum',13,ANY,'+30% de dano de queimadura e veneno.',{statusDamage:.3}),
  item('swift-kunai','Kunai Ágil','Incomum',1,ANY,'+10% de velocidade de ataque.',{attackSpeed:.1}),
  item('crit-damage','Kunai Afiada','Incomum',1,ANY,'+30 pontos percentuais de dano crítico.',{critDamage:.3}),
  item('repel','Incenso Repelente','Incomum',2,3,'−8% de inimigos no mapa e +6% de movimento.',{enemyCount:-.08,move:.06}),
  item('thorn-armor','Armadura de Espinhos','Incomum',4,ANY,'Inimigos que te acertam sofrem 25 de dano.',{thorns:25}),
  item('blood-shell','Concha Sanguinária','Incomum',15,ANY,'Recupera 0,8% do dano causado como HP.',{lifesteal:.008}),
  item('emergency-fruit','Fruta Medicinal','Incomum',13,ANY,'+10 HP máximo; abaixo de 30% de HP, recupera 35% (a cada 45 s).',{health:10,emergencyHeal:1}),
  item('dense-smoke','Fumaça Densa','Incomum',0,ANY,'Ao ser atingido: 25% de chance de ficar invisível (invulnerável) por 1,5 s; +3% de evasão.',{smoke:.25,dodge:.03}),
  item('hyoton','Pergaminho Hyoton','Incomum',10,5,'6% de chance por acerto de congelar parcialmente (Lentidão) e +3 de armadura.',{chillChance:.06,defense:3}),
  item('poison','Anel do Veneno','Incomum',15,5,'6% de chance por acerto de envenenar e +10 pontos percentuais de chance de status.',{poisonChance:.06,status:.1}),
  item('taunt-flute','Flauta Provocadora','Incomum',2,5,'+12% de inimigos no mapa, +10% de experiência e +5 de Sorte.',{enemyCount:.12,exp:.1,luck:5}),
  item('tracker','Olhos do Rastreador','Incomum',7,ANY,'+25 pontos percentuais de chance de status (Genjutsu). Técnicas sem status passam a aplicar lentidão.',{status:.25}),
  item('ninjutsu','Selo de Ninjutsu','Incomum',11,ANY,'+15% de dano de Ninjutsu e da Ultimate.',{element:.15}),
  // Referência: pedra lisa (ricochete + velocidade de projétil).
  item('river-pebble','Seixo Polido do Rio','Incomum',1,3,'+1 ricochete em projéteis (Projétil e Em V) e +9% de velocidade de projétil.',{bounce:1,projectileSpeed:.09}),
  item('cooldown','Ampulheta de Recarga','Incomum',6,5,'+12% de velocidade de recarga da Ultimate. Não dá carga instantânea.',{cool:.12}),

  // ───── Raro ─────
  item('jonin-vest','Colete Jonin','Raro',4,ANY,'+12 de armadura e +12% de HP máximo.',{defense:12,healthPct:.12}),
  item('toxic-sludge','Lodo Venenoso','Raro',13,ANY,'+2 HP/s de regeneração e +20% de dano de queimadura e veneno.',{regen:2,statusDamage:.2}),
  item('gate-band','Faixa dos Oito Portões','Raro',3,5,'+35% de dano de Taijutsu e −8% de velocidade de ataque.',{normal:.35,attackSpeed:-.08}),
  item('wind-scarf','Cachecol do Vento','Raro',5,5,'+20% de movimento e +10% de velocidade de ataque.',{move:.2,attackSpeed:.1}),
  item('chakra-goggles','Óculos de Chakra','Raro',10,5,'+35% de dano de Ninjutsu e −8% de velocidade de ataque.',{element:.35,attackSpeed:-.08}),
  item('study-scroll','Pergaminho de Estudo','Raro',11,ANY,'+25% de experiência e +2 m de alcance de coleta.',{exp:.25,pickupFlat:2}),
  item('five-elements','Selo dos Cinco Elementos','Raro',11,3,'+6% de dano por status diferente no inimigo (controle, queimadura, veneno, lentidão), até +30%.',{statusStack:.06}),
  item('chakra-shield','Escudo de Chakra','Raro',9,2,'Bloqueia totalmente o próximo golpe a cada 14 s.',{shield:1}),
  item('kubikiribocho','Lâmina Kubikiribocho','Raro',1,4,'3% de chance por acerto de causar ×8 de dano.',{bigCrit:.03}),
  item('damage','Selo Amaldiçoado','Raro',3,5,'+30% de dano total e −10% de HP máximo.',{damage:.3,healthPct:-.1}),
  item('training-weights','Pesos de Treinamento','Raro',4,3,'+50% de experiência e −10% de movimento.',{exp:.5,move:-.1}),
  item('banner','Estandarte da Aliança','Raro',11,2,'+40% de força dos buffs dos ajudantes.',{allyBuff:.4}),
  // PROPOSTO (11/11/2026): efeito provisório até o usuário confirmar o que a Isca deve fazer.
  item('shinobi-bait','Isca Shinobi','Raro',8,3,'+15% de inimigos no mapa, +12% de Ryu recebido e +8% de experiência.',{enemyCount:.15,gold:.12,exp:.08}),
  item('executioner','Lâmina do Carrasco','Raro',1,4,'Inimigos comuns abaixo de 8% do HP morrem na hora (+4 pontos por cópia extra).',{execute:.08}),
  item('luck','Colar do Primeiro Hokage','Raro',2,ANY,'+20 de Sorte. Melhora a raridade das ofertas de itens.',{luck:20}),
  // Referência: porta-moedas (buff por dinheiro gasto). A carteira de sapo do Naruto.
  item('gama-chan','Carteira Gama-chan','Raro',8,1,'+12% de Ryu recebido, Caça-Níquel da Tsunade e atualização do Mercador 6% mais baratos e +1% de dano a cada 250 Ryu gastos na run (kunais, caça-níquel, Ichiraku), até +30%.',{gold:.12,slotDiscount:.06,spendDamage:.01}),
  item('herb-tea','Chá de Ervas','Raro',0,3,'A cada 30 s, se estiver ferido, cura 12% do HP máximo.',{periodicHeal:1}),

  // ───── Épico ─────
  item('insignia','Insígnia da Fortuna','Épico',8,ANY,'+40% de Ryu recebido e +30 de Sorte.',{gold:.4,luck:30}),
  item('crit-seal','Selo do Golpe Fatal','Épico',7,ANY,'+40 pontos percentuais de dano crítico e +8 de chance crítica.',{critDamage:.4,crit:.08}),
  item('chidori-nagashi','Pergaminho Chidori Nagashi','Épico',9,3,'A cada 2,5 s, raios atingem 3 inimigos próximos (+1 por cópia extra) e podem paralisar.',{bolts:1}),
  item('speed','Selo de Velocidade','Épico',5,ANY,'+20% de velocidade de ataque dos ataques automáticos.',{attackSpeed:.2}),
  item('pill-gourd','Cabaça de Pílulas','Épico',0,1,'Pílulas podem subir mais 2 níveis (até 12).',{pillCap:2}),
  item('clone','Clone Adicional','Épico',11,3,'+1 projétil em todas as técnicas; prioriza outro inimigo.',{projectiles:1}),
  item('samurai-armor','Armadura Samurai','Épico',4,3,'+20 de armadura, +15% de HP máximo, 40 de dano a quem te acerta e −5% de movimento.',{defense:20,healthPct:.15,thorns:40,move:-.05}),
  item('kyuubi-rage','Fúria da Kyuubi','Épico',9,1,'Até +60% de dano com 25% de HP ou menos; −25% de regeneração.',{lowHpDamage:.6,regenMult:-.25}),
  item('shinigami-cloak','Manto do Shinigami','Épico',11,2,'+1% de dano a cada 100 abates na run (até +30%).',{killDamage:.01}),
  item('revive','Pergaminho de Ressurreição','Épico',3,2,'Revive uma vez com 35% do HP (uma vez por cópia).',{revive35:1}),
  item('recruit','Pergaminho de Recrutamento','Épico',11,1,'+1 vaga de ajudante nesta run.',{support:1}),
  item('wide-seal','Selo de Área Ampla','Épico',10,ANY,'+15% de dano total e +15% de área.',{damage:.15,area:.15}),
  item('iron-club','Clava de Ferro','Épico',3,2,'+1% de dano de Taijutsu a cada 2 de armadura (até +50%).',{armorPhysical:.005}),
  item('sage-infusion','Selo de Senjutsu','Épico',2,1,'Infunde todas as técnicas com o elemento Sábio e dá a linha Senjutsu (modo sábio) às técnicas de Ninjutsu. Ativa o bônus de +20% de dano sábio de Hashirama.',{sage:1}),

  // ───── Lendário ─────
  item('haku-mirror','Espelho de Gelo de Haku','Lendário',10,1,'+15% de dano; ao ser atingido, congela inimigos próximos por 3 s (a cada 20 s).',{damage:.15,freezeOnHit:1}),
  item('sage','Armadura do Sábio','Lendário',4,2,'+30% de dano total e +20% de velocidade de ataque.',{damage:.3,attackSpeed:.2}),
  item('rinne-tensei','Rinne Tensei','Lendário',9,3,'Revive uma vez com 60% do HP (uma vez por cópia).',{revive60:1}),
  item('red-moon','Olho da Lua Vermelha','Lendário',9,2,'+2 projéteis e +25% de área.',{projectiles:2,area:.25}),
  item('hokage-scroll','Pergaminho do Hokage','Lendário',3,1,'Ultimate recarrega 25% mais rápido; ao usá-la, as técnicas recarregam e ganham +30% de velocidade de ataque por 6 s.',{cool:.25,ultReset:1}),
  item('tenten','Shuriken Selo da Tenten','Lendário',1,1,'+25% de dano total. E sela instantaneamente um mega elite já derrotado.',{damage:.25}),
  item('kurama-chakra','Chakra da Kurama','Lendário',9,1,'+20% de dano de Ninjutsu, +15% de área e Ultimate recarrega 40% mais rápido.',{element:.2,area:.15,cool:.4}),
  item('amaterasu','Chamas de Amaterasu','Lendário',7,2,'+10% de dano; a cada 6 s, chamas negras atingem o inimigo mais forte por perto e explodem em volta (queimam).',{damage:.1,beam:1}),
  item('forbidden-scroll','Pergaminho Proibido','Lendário',3,1,'Técnicas podem subir mais 2 níveis (até 11).',{skillCap:2}),
  item('lee','Remédio do Rock Lee','Lendário',0,1,'Punho Bêbado: +20% dano, +20% velocidade de ataque, +15% movimento e +10 pontos de evasão.',{damage:.2,attackSpeed:.2,move:.15,dodge:.1}),
];
export const ITEM_BY_NAME = Object.fromEntries(ITEMS.map(i=>[i.name,i])) as Record<string,Item>;
export function availableItems(unlocked:readonly string[], archived:readonly string[], allForPrototype:boolean) {
  return ITEMS.filter(i=>!archived.includes(i.id)&&(allForPrototype||i.rarity==='Comum'||unlocked.includes(i.id)));
}
/**
 * Pesos por raridade (Comum, Incomum, Raro, Épico, Lendário). Recalibrado em 06/11/2026 (pedido do usuário: a Sorte quase não
 * mudava as cartas). bonus = Sorte/50 (até 6). Raro ou melhor: Sorte 0 ≈ 0,7% · 20 ≈ 6% · 50 ≈ 15% · 100 ≈ 26%.
 */
/**
 * Revisão 06/11/2026 (Sorte 360 ainda trazia muito Comum): o peso do Comum cai 2× mais rápido (÷(1+bonus×1,2)).
 * Sorte 300+ (bonus 6): Comum ≈ 4% · Incomum ≈ 49% · Raro ≈ 23% · Épico ≈ 17% · Lendário ≈ 7% (nunca 100% de nada).
 */
export function luckRarityWeights(luck:number){
  const bonus=Math.min(6,Math.max(0,luck)/50);
  return [90/(1+bonus*1.2),9.889+20*bonus,.6+10*bonus,.1+3*Math.pow(bonus,1.5),.02+Math.pow(bonus,1.6)];
}
/**
 * Sorteio de itens: primeiro a RARIDADE (pesos da Sorte), depois o item dentro dela. Se a raridade sorteada não tem item elegível
 * no pool (não desbloqueado com Lamens ou já no limite de cópias), desce para a raridade elegível mais próxima ABAIXO (e só então
 * acima) — antes o peso das raridades vazias era redistribuído por todo o pool, então Sorte alta com poucos itens raros
 * desbloqueados caía em Comum. O pool continua sendo só Comuns + desbloqueados (desbloquear só adiciona ao pool).
 * `priority`: ids marcados como Prioridade na Bolsa da Missão; o peso deles é multiplicado por `priorityWeight` (não garante).
 */
export function rollItems(pool:readonly Item[], owned:Record<string,number>, luck:number, count:number, rng= Math.random, priority:readonly string[]=[], priorityWeight=1):Item[] {
  const eligible=pool.filter(i=>(owned[i.name]||0)<i.max), result:Item[]=[];
  const rarities:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
  const rarityWeights=luckRarityWeights(luck),total=rarityWeights.reduce((a,b)=>a+b,0);
  while(eligible.length&&result.length<count){
    let roll=rng()*total,tier=4;
    for(let i=0;i<5;i++){roll-=rarityWeights[i];if(roll<0){tier=i;break;}}
    const order=[tier,...Array.from({length:tier},(_,k)=>tier-1-k),...Array.from({length:4-tier},(_,k)=>tier+1+k)];
    const rarity=rarities[order.find(n=>eligible.some(i=>i.rarity===rarities[n]))!];
    const options=eligible.filter(i=>i.rarity===rarity),weights=options.map(i=>priority.includes(i.id)?priorityWeight:1);
    let pick=rng()*weights.reduce((a,b)=>a+b,0),index=options.length-1;
    for(let i=0;i<weights.length;i++){pick-=weights[i];if(pick<0){index=i;break;}}
    result.push(eligible.splice(eligible.indexOf(options[index]),1)[0]);
  }
  return result;
}
