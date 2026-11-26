import { ITEM_BY_NAME, type Bonuses } from './catalog.ts';
import { HEROES, HERO_BY_ID, familyOf } from './heroes.ts';
import { applyPowerlevel, type Powerlevel } from './powerlevel.ts';
import { PHARMACOLOGY_MAX, pillBonuses } from './pills.ts';
export type Difficulty='Genin'|'Chunin'|'Jonin'|'Kage';
export type Stats={sage:number;maxHp:number;damage:number;armor:number;moveSpeed:number;attackSpeed:number;
  /** Velocidade de projétil: ×viagem dos projéteis e ÷tempo de preparo (golpe/lançamento) das técnicas sem projétil. */
  projectileSpeed:number;bounce:number;crit:number;critDamage:number;evasion:number;regen:number;luck:number;pickup:number;xpGain:number;moneyGain:number;ultimateRate:number;area:number;projectiles:number;
  /** Chance por disparo de +1 projétil (fração de projétil de sinergias/afinidade; a parte ≥1 vira projétil garantido). */
  projectileChance:number;duration:number;poison:number;status:number;physical:number;ninjutsu:number;genjutsu:number;supportSlots:number;allyDamage:number;allySpeed:number;allyBuff:number;
  /** Soma bruta de todos os bônus (itens, pílulas, buffs da run); a simulação lê daqui as mecânicas de item (elementos, procs, roubo de vida...). */
  extra:Bonuses};
export const HERO_BASE=Object.fromEntries(HEROES.map(h=>[h.id,h.base]));
/** Parâmetros da curva de dano por nível (lidos por heroDamageScale; o simulador de dano testa variações em memória). */
export const HERO_DAMAGE_CURVE={open:.74,openLevels:14,perLevel:.04,cubicDivisor:72,power:3};
export function heroDamageScale(level:number) {
  const levels=Math.max(0,level-1),c=HERO_DAMAGE_CURVE;
  return (c.open+(1-c.open)*Math.min(1,levels/c.openLevels))*(1+levels*c.perLevel)*(1+levels/c.cubicDivisor)**c.power;
}
/**
 * Crescimento do HP base por nível (Rodada 55 — pedido do usuário: "Scale de HP ainda muito alto… level 415 e estou com
 * 1613 de HP é muita coisa"). Antes (rodada 54): `1 + 0,032n + 0,00022n²` (quadrático: Nv. 415 ≈ ×52 → ~2.960 HP sem itens).
 * Agora o ganho por nível desacelera (hiperbólico): `1 + 0,04n / (1 + n/150)` — ~4%/nível no início (Nv. 1–25 um pouco acima do antigo),
 * ~1/4 disso no Nv. 150 e teto assintótico ×7. Nv. 10 ×1,34 · 50 ×2,51 · 100 ×3,39 · 200 ×4,42 · 415 ×5,40.
 * Valores PROPOSTOS — o usuário testa e ajustamos.
 */
export const HP_GROWTH={perLevel:.04,softLevels:150};
export function heroHpScale(level:number) {
  const levels=Math.max(0,level-1);
  return 1+HP_GROWTH.perLevel*levels/(1+levels/HP_GROWTH.softLevels);
}
export function effectiveLootLuck(luck:number, elapsed:number) {
  return luck*(.2+.8*Math.min(1,Math.max(0,elapsed)/150));
}
/**
 * Rodada 76 (simulador de partidas, scripts/simulate-run.mjs): o nível disparava (Nv 67 aos 5 min no Genin; Nv 10.000–25.000 em 2 h)
 * e o dano do jogador passava a vida dos monstros em centenas de vezes. A XP pedida fica igual até o Nv 10 (abertura) e sobe
 * linearmente até ×XP_RULES.scale no Nv 60, mantendo esse fator depois.
 */
export const XP_RULES={from:10,to:60,scale:5};
export const xpCurveScale=(level:number)=>1+(XP_RULES.scale-1)*Math.min(1,Math.max(0,(level-XP_RULES.from)/(XP_RULES.to-XP_RULES.from)));
export function xpToLevelUp(level:number) {
  const levels=Math.max(0,level-1);
  return level<=1?30:(18+6*levels+.08*levels**2/(1+levels/250))*xpCurveScale(level);
}
/**
 * Regeneração base de todo shinobi (25/11/2026 — usuário: "Ajustar regeneração por segundo para todos os personagens, iniciar
 * com 1,0. Alguns estão começando com menos de 1.0"). A regeneração própria do personagem (passiva) soma por cima.
 */
export const BASE_REGEN=1;
export function calculateStats(heroId:string,level:number,items:Record<string,number>={},pills:Record<string,number>={},bonusHp=0,permanent:Record<string,number>={},runBuffs:Bonuses={},powerlevel:Powerlevel={},pillQuality:Record<string,number>={}):Stats {
  const base=HERO_BASE[heroId]??HERO_BASE.naruto,n=Math.max(0,level-1),b:Bonuses={...HERO_BY_ID[heroId]?.bonuses};
  for(const [key,value] of Object.entries(runBuffs)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  for(const [name,count] of Object.entries(items)){const item=ITEM_BY_NAME[name];if(!item)continue;for(const [key,value] of Object.entries(item.bonuses)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value*Math.min(item.max,Math.max(0,count));}}
  const pillCap=Math.min(PHARMACOLOGY_MAX,Math.max(0,permanent['Farmacologia Ninja']||0));
  // Pílulas: bônus por nível vindos de src/game/pills.ts, recalculados sempre a partir de knownPills.
  for(const [key,value] of Object.entries(pillBonuses(pills, (b.pillCap ?? 0)+pillCap,pillQuality))){const k=key as keyof Bonuses;b[k]=(b[k]||0)+(value||0);}
  const p=(name:string)=>Math.max(0,Math.min(10,permanent[name]||0));
  const permanentScale=.08+.92*Math.min(1,n/24);
  const scaled=(name:string)=>p(name)*permanentScale;
  // Passivas Shinobi que viram mecânicas da run (src/game/preparation.ts): entram em `extra` para a simulação ler (pillCap, revive35...).
  const perm:Bonuses={regen:scaled('Chakra Curativo')*.2,area:scaled('Expansão')*.03,cool:scaled('Meditação de Chakra')*.04,pillCap,revive35:Math.min(1,p('Selo de Ressurreição'))};
  for(const [key,value] of Object.entries(perm)){if(!value)continue;const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  const add=(key:keyof Bonuses)=>b[key]||0;
  const baseHp=46+.085*Math.min(215,base.hp);
  const armorByLevel=base.armor*(1+n*.01)+n*.25;
  return applyPowerlevel({
    sage:add('sage'),maxHp:Math.round((baseHp*heroHpScale(level)+add('health')+bonusHp+scaled('Resistência')*3)*Math.max(.1,1+add('healthPct'))),
    damage:base.damage*heroDamageScale(level)*(1+add('damage')+scaled('Treinamento')*.04)*(familyOf(heroId)==='gaara'?1+(armorByLevel+add('defense')+scaled('Colete Shinobi')*2)*.01:1),
    armor:armorByLevel+add('defense')+scaled('Colete Shinobi')*2,
    crit:Math.max(0,base.crit+n*.0015+add('crit')+scaled('Precisão')*.01),critDamage:2.5+add('critDamage'),
    evasion:Math.min(.6,add('dodge')),regen:(BASE_REGEN+base.regen+n*.04+add('regen'))*Math.max(0,1+add('regenMult')),luck:Math.floor(n/3)+add('luck')+scaled('Fortuna')*2,
    pickup:2.5*(1+add('pickup'))+add('pickupFlat')+scaled('Magnetismo')*.6,xpGain:1+add('exp')+scaled('Estudo')*.05,moneyGain:1+add('gold')+scaled('Comércio')*.05,
    ultimateRate:1+add('cool'),area:1+add('area'),projectiles:1+add('projectiles'),projectileChance:Math.max(0,add('projectileChance')),
    duration:1+add('duration'),poison:add('dot'),status:Math.min(.9,add('status')),physical:1+add('normal'),ninjutsu:1+add('element'),genjutsu:1+add('genjutsu'),attackSpeed:Math.max(.2,1+n*.008+add('attackSpeed')+scaled('Celeridade')*.02),projectileSpeed:Math.max(.3,1+add('projectileSpeed')),bounce:Math.floor(add('bounce')),moveSpeed:base.speed*Math.max(.3,1+n*.002+add('move')+scaled('Agilidade')*.025),extra:{...b},
    supportSlots:3+Math.min(1,add('support'))+Math.min(1,p('Suporte adicional')),allyDamage:1+add('allyDamage'),allySpeed:1+add('allySpeed'),allyBuff:1+add('allyBuff'),
  },powerlevel);
}
/** Escala das missões sobre a base Genin (o que é salvo no debug vale como Genin e é multiplicado por isto). */
export const MISSION_TIER:Record<Difficulty,number>={Genin:1,Chunin:1.4,Jonin:1.9,Kage:2.6};
/**
 * Rodada 76 (pedido do usuário: "balancear as outras dificuldades também, considerando que nosso Kage é a dificuldade máxima do jogo de referência"):
 * vida do MONSTRO COMUM por dificuldade (Kage ≈ 2× o Genin, como o material de referência mostrou) e abertura de nascimentos
 * por dificuldade. O MISSION_TIER continua valendo para dano, velocidade, elites, Mega Elites e chefes.
 */
export const MISSION_HP:Record<Difficulty,number>={Genin:1,Chunin:1.3,Jonin:1.6,Kage:2};
/** Fator da vida do comum sobre a ameaça da missão (a ameaça já traz o MISSION_TIER). */
export const normalHpFactor=(rank:Difficulty)=>MISSION_HP[rank]/MISSION_TIER[rank];
/** Abertura calma (Rodada 76): nascimentos por s e teto de vivos começam baixos e se misturam à curva normal com peso (min/minutes)². */
export const OPENING={minutes:4,perMinute:.5,capBase:8,capPerMinute:10};
/** Termo extra de vida por dificuldade: só começa depois de `delay` min e chega ao teto em `spread` min (antes: do 0 ao teto em 2,1 min). */
export const HP_RAMP={delay:2,spread:4};
/**
 * Rampa do meio (26/11/2026 — usuário: "no jogo referencia aos 5min+ se você não tiver uma build boa, feito fusão, ter itens,
 * pouco level você já começa tomar dano/morrer" → "Sim, calibrar"). Simulador: aos 5 min até a conta nova matava o comum com
 * 15–37× a vida dele num golpe. Entre `from` e `to` minutos de zona a vida dos monstros ganha um fator que cresce de ×1 até
 * ×`max` (exponencial), depois volta devagar a ×1 até os 30 min de zona; os 2 primeiros minutos não mudam. Calibrado em scripts/simulate-early.mjs.
 */
export const MID_HP_RAMP={from:2,to:8,fadeUntil:30,max:12};
/** Sobe de ×1 (2 min) a ×max (8 min) e volta a ×1 aos fadeUntil min de zona, mais devagar que o crescimento normal da vida
 * (a vida total nunca cai). O Final Swarm a partir de +20 min fica como estava (calibrado para +30 ser quase impossível). */
export const midHpRamp=(minutes:number)=>{const M=MID_HP_RAMP;if(minutes<=M.to)return Math.pow(M.max,Math.max(0,(minutes-M.from)/(M.to-M.from)));return Math.pow(M.max,Math.max(0,1-(minutes-M.to)/(M.fadeUntil-M.to)));};
/** Rodada 76 (pedido: "talvez eles estarem um pouquinho mais longe… as emboscadas também devem ser eventos com maiores intervalos"):
 * nos 2 primeiros min de cada zona os comuns nascem a 16–24 m (antes 10–18 m); emboscada a partir de 2:30 e a cada 50–80 s (antes 30 s e 18–30 s). */
export const SPAWN_RING = { openingSeconds: 120, opening: [16, 24] as const };
export const AMBUSH_RULES = { first: 150, min: 50, spread: 30 };
/**
 * Escala dos inimigos com o tempo DA ZONA (Rodada 55: reinicia do minuto 0 a cada zona — antes era o tempo total da run).
 * `seconds` = zoneElapsed no GameCanvas; ZONE_DIFFICULTY, missão e +% de inimigos/ameaça entram por cima. Valores provisórios; o debug multiplica por cima.
 * Revisão 06/11/2026 (pedido do usuário: "8 min e só 60 bichos", "HP/dano baixíssimos"):
 * - HP  = tier × (1 + min × hpLinear) × hpPerMinute^min      → Genin: 2 min ×2,1 · 5 min ×5,0 · 8 min ×10,4 · 10 min ×16 · 15 min ×46 · 30 min ×660
 * - Dano= tier × (1 + min × damageLinear) × damagePerMinute^min → 10 min ×5,4 · 30 min ×40
 * - Teto da horda = (capBase + capLinear×min + capQuad×min²) × (0,85 + tier×0,15), até maxEnemies (1600 no Genin aos 10 min)
 * - Spawns por segundo = (spawnBase + spawnPerMinute×min) × √tier, até maxSpawnPerSecond (o jogo repõe em lote, sem 1-por-quadro)
 * Revisão 11/11/2026 (pedidos do usuário: "dificulte mais o early game de todos os modos de jogo" + "verifique o nível de dificuldade de scale de cada nível de dificuldade"):
 * - O Genin perdeu o desconto de 66% inicial: TODAS as dificuldades nascem na base cheia do tier, em suas devidas proporções (1 / 1,4 / 1,9 / 2,6).
 * - Base do minuto 0 subiu: HP × hpBase e dano × damageBase (1,45):
 * Rodada 47 (pedido do usuário: "aumentar cerca de 200% a dificuldade, diminuir dano inicial dos personagens,
 * aumentar hp/defesa dos mob's" — Genin; se fácil no Genin, fácil em todos, nas devidas proporções do tier):
 * - hpBase 1,6 → 3,2 (HP inicial dos inimigos ×2) e defesa inicial dobrada (armorPerMinute 0,015→0,03 · maxArmor 0,6→0,72);
 * - dano base dos heróis ×0,55 → ×0,41 (heroes.ts, −25%);
 * - dificuldade total ≈ ×2,8–3,1 no minuto 0 (valores PROPOSTOS pela sessão; o usuário testa a gameplay e ajustamos).
 *   HP   = tier × (hpBase + min×hpLinear) × hpPerMinute^min
 *   Dano = tier × (damageBase + min×damageLinear) × damagePerMinute^min
 *   O efeito extra é máximo no início e decai proporcionalmente (5 min: ×1,20 · 10 min: ×1,13 · 30 min: ×1,05) — o late game já é íngreme por si (1,17^min).
 * - Escala individual por zona (fase): ZONE_DIFFICULTY (zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38), aplicada em GameCanvas (zoneDifficulty).
 * Rodada 50 (pedido do usuário: "114 monstros aos 1 min é bem expressivo · diminua um pouco a escada de monstros vivos no início,
 * mas progressivo tempo + %inimigos por itens/debuffs") — escada de monstros VIVOS reduzida ~40% no early game (PROPOSTO, o usuário testa e ajustamos):
 * - capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8 → 1 min = 91 vivos (era 156) · 5 min = 391 (era 670) · 8 min = 695 (era 1189) · 10 min = 936 (era 1.600) · teto 1600 atingido ~15 min (era ~10 min).
 * - O %inimigos de itens/pílulas/debuffs (enemyCount: Incenso Repelente −8% · Flauta Provocadora +12% · Pílula de Incenso +10%)
 *   JÁ multiplica o cap (densidade em GameCanvas.threatNow) e continua progressivo com o tempo — apenas a escada-base ficou mais suave.
 */
export const ENEMY_SCALING={hpBase:3.2,hpLinear:.3,hpPerMinute:1.17,damageBase:1.45,damageLinear:.2,damagePerMinute:1.06,maxEnemies:1600,capBase:36,capLinear:52,capQuad:3.8,spawnBase:2,spawnPerMinute:6,maxSpawnPerSecond:90,armorPerMinute:.03,maxArmor:.72};
/** Escala individual por zona (fase): cada fase nasce mais forte que a anterior (HP, dano, spawn e pressão de roleta). Pedido do usuário (11/11): "verifique o nível de dificuldade também individual para cada fase do jogo". */
export const ZONE_DIFFICULTY:Record<number,number>={1:1,2:1.18,3:1.38};
/**
 * Resistência por zona (26/11/2026 — usuário: "Quero ver se conseguimos melhorar a curva de dificuldade do jogo a progressão
 * está muito alta" → "a progressão deveria ser pela zona mesmo… Não acumulativo para partida toda, a única coisa seria a
 * dificuldade" + "deixe o dano como está, só armadura e vida"). Cada zona recomeça a curva do minuto 0, mas o personagem chega
 * com o nível e os itens da zona anterior: no simulador o golpe passava a vida do comum 2.143× (entrada da zona 2) e 10.573×
 * (zona 3). A zona multiplica só a VIDA (`hp`) e soma DEFESA (`armor`, até 97%); o dano segue ZONE_DIFFICULTY.
 * Calibrado em scripts/simulate-run.mjs (build boa em poucos golpes por monstro em todas as zonas).
 */
export const ZONE_TOUGHNESS:Record<number,{hp:number;armor:number}>={1:{hp:1,armor:0},2:{hp:6,armor:.05},3:{hp:20,armor:.1}};
/**
 * FINAL SWARM: quando o relógio da zona zera, o jogo NÃO acaba; conta o tempo sobrevivido e a dificuldade triplica na hora
 * (HP, dano, defesa e quantidade/spawn) e cresce growthPerMinute a cada minuto sobrevivido (além da escala normal por tempo).
 * Quantidade (correção 06/11/2026 — "os monstros pararam de aumentar em 300 no Final Swarm"): antes o teto do swarm era
 * cortado em ENEMY_SCALING.maxEnemies (1600, já atingido aos 10 min), então a horda NÃO triplicava; e o spawn ×3 perdia
 * para o abate de builds fortes, que matavam tudo ao nascer (equilíbrio em ~300). Agora:
 * - teto do swarm = teto normal (até 1600) × fator do swarm (×3, +25%/min), limitado a FINAL_SWARM.maxEnemies (performance);
 * - reposição mínima: o spawn por segundo nunca fica abaixo de teto ÷ refillSeconds (a horda volta ao teto em ~refillSeconds);
 * - os inimigos do swarm nascem num anel mais largo (spawnRing, metros do jogador), fora do alcance imediato das técnicas.
 * O debug (F9, "Teto de inimigos vivos") multiplica por cima e também respeita FINAL_SWARM.maxEnemies.
 * Rodada 48 (pedido do usuário: "o final swarm sempre vai ter o máximo de 1600 monstros, porém não vai bater
 * final swarm e já chegar nesse número; até +7 min o aumento é progressivo; após +7 min = 1600 em tela"):
 * - teto do swarm = FINAL_SWARM.maxEnemies (1600, antes 8000);
 * - rampa: em swarm o multiplicador sobre o teto normal cresce com swarmRamp = min(1, overtime/60/rampMinutes),
 *   então a horda NÃO salta para o teto na hora — sobe progressivamente e só atinge 1600 a partir de ~+7 min;
 * - os monstros seguem evoluindo (HP/dano/defesa) com o tempo, forçando o fim da run.
 * Rodada 49 (pedido do usuário: "a progressão deve limitar no máximo 800 monstros até chegar no +4minutos em final
 * swarm, para ai sim ir aumentando até chegar a 1600 monstros TOTAIS e o máximo de cap de monstros invocando na tela!"): 
 * - o teto do swarm começa em min(teto normal, 800) e fica estável até +4 min (240 s) — nunca salta direto para 1600;
 * - de +4 a +7 min (420 s) sobe linearmente até FINAL_SWARM.maxEnemies (1600); após +7 min = 1600 fixo (teto absoluto);
 * - defesa em profundidade: hard cap 1600 por quadro em GameCanvas (remove excedentes comuns, nunca bosses)
 *   e cap na emboscada de campo (startFieldAmbush) — nada passa de 1600 por qualquer rota de spawn.
 */
/** 25/11/2026 — decisão do usuário: o Final Swarm entra com ×2 (antes ×3), junto com os afixos de dano pela metade (GROWTH_ROLLS). */
export const FINAL_SWARM={multiplier:2,growthPerMinute:.25,maxArmor:.85,maxEnemies:1600,rampMinutes:7,ramp800Cap:800,ramp800Seconds:240,rampSeconds:420,refillSeconds:4,spawnRing:[14,28] as const};
/**
 * Orçamento de nascimentos do quadro (26/11/2026 — usuário: "No final swarm só tava aparecendo 400 monstros, precisamos que a
 * progressão vá até os 1600… Isso para todas as zonas, na zona 1 a progressão funcionou direito"). Fora do swarm: ritmo normal
 * (1/spawnInterval, acelerado até ×(1+refill) quando a tela está vazia). No Final Swarm o quadro também repõe tudo o que falta
 * até o teto (até `perFrame`): nas zonas 2 e 3 o herói já chega forte e a horda recomeça fraca, então ele matava mais rápido
 * (~1.265 abates/s numa run de 76 min) do que o ritmo normal repunha (~1.200/s no máximo) e a tela parava em ~400.
 */
export function spawnBudgetFor(budget:number,dt:number,spawnInterval:number,alive:number,cap:number,swarm:boolean,perFrame:number,refill:number){
  const deficit=Math.max(0,1-alive/Math.max(1,cap));
  const paced=budget+dt/Math.max(.001,spawnInterval)*(1+refill*deficit);
  return Math.min(perFrame,swarm?Math.max(paced,cap-alive):paced);
}
/** Multiplicador do FINAL SWARM para `overtimeSeconds` sobrevividos após o relógio zerar (1 = fora do swarm). */
export function finalSwarmFactor(overtimeSeconds:number,rank:Difficulty='Genin'){return overtimeSeconds>0?FINAL_SWARM.multiplier*(1+FINAL_SWARM.growthPerMinute*overtimeSeconds/60)*(1+SWARM_COMPOUND.perMinute*MISSION_HP[rank])**(overtimeSeconds/60):1;}
/** Rodada 76: no Final Swarm a ameaça também compõe por minuto, mais rápido nas dificuldades altas (Genin +perMinute, Kage +2×perMinute). */
export const SWARM_COMPOUND={perMinute:.1};
/**
 * Degraus do Final Swarm (25/11/2026 — usuário: "A cada 5min no final swarm ter um buff consideravel nos inimigos
 * dano/armadura/vida"): a cada `seconds` de Final Swarm os inimigos ganham +`hp` de vida, +`damage` de dano (multiplicativo)
 * e +`armor` de defesa, que pode passar do teto normal do swarm até `armorCap`.
 */
/** 26/11/2026 (usuário: "Eu estava vivo 10m do Final Swarm e meu personagem estava dando overkill em tudo! Precisamos aumentar mais a defesa/vida/dano"): por degrau k, vida ×(1+1·k), dano ×(1+0,5·k), +3·k pontos de defesa (eram 0,5 / 0,3 / 2). */
export const SWARM_STEP={seconds:300,hp:1,damage:.5,armor:.03,armorCap:.97};
export const swarmStep=(overtimeSeconds:number)=>overtimeSeconds>0?Math.floor(overtimeSeconds/SWARM_STEP.seconds):0;
/**
 * Degraus que escalam (26/11/2026 — usuário: "Precisamos buffar mais a armadura dos monstros e o HP com o passar do tempo, tem um
 * jogo aqui de um amigo testando que ele esta no final swarm em +30mins já… 30min de final swarm deveria ser 'quase'
 * impossível a build tem que estar muito perfeita · Buffar dos monstros: Hp/Vida/dano"). O degrau k vale k vezes o anterior:
 * vida ×(1 + 0,5·k), dano ×(1 + 0,3·k) e +2·k pontos de defesa, acumulando. Aos +30 min (6 degraus): vida ×315 (era ×11,4),
 * dano ×61 (era ×4,8) e +42 pontos de defesa até 97% (era +12 até 95%).
 */
const stepProduct=(step:number,per:number)=>{let total=1;for(let k=1;k<=step;k++)total*=1+per*k;return total;};
export const swarmStepHp=(step:number)=>stepProduct(step,SWARM_STEP.hp);
export const swarmStepDamage=(step:number)=>stepProduct(step,SWARM_STEP.damage);
export const swarmStepArmor=(step:number)=>SWARM_STEP.armor*step*(step+1)/2;
/** O Genin ganha pressão aos poucos, mantendo a abertura e os outros ranks. */
export const GENIN_PRESSURE={startMinute:1,fullMinute:5,damage:.07,attackRate:.06,armor:.09};
export function difficultyAt(rank:Difficulty,seconds:number,curse=1,overtimeSeconds=0){
  const tier=MISSION_TIER[rank], minutes=Math.max(0,seconds)/60, S=ENEMY_SCALING, swarm=finalSwarmFactor(overtimeSeconds,rank), step=swarmStep(overtimeSeconds);
  // Revisão 11/11/2026: sem desconto de early game em nenhum rank — cada dificuldade escala em sua devida proporção (tier).
  const opening=.34+.66*Math.min(1,minutes);
  const geninPressure=rank==='Genin'?Math.max(0,Math.min(1,(minutes-GENIN_PRESSURE.startMinute)/(GENIN_PRESSURE.fullMinute-GENIN_PRESSURE.startMinute))):0;
  const baseCap=Math.min(S.maxEnemies,Math.floor((S.capBase+S.capLinear*minutes+S.capQuad*minutes*minutes)*(.85+tier*.15)*opening));
  const swarmRamp=swarm>1?Math.min(1,overtimeSeconds/60/FINAL_SWARM.rampMinutes):1;
  // Rodada 49 — rampa do FINAL SWARM: teto em min(teto normal, 800) até +4 min (240 s), depois sobe linearmente
  // até 1600 (teto absoluto) a +7 min (420 s). Fora do swarm o teto normal (máx. 1600) se aplica.
  const cap=swarm>1?(()=>{const base=Math.min(baseCap,FINAL_SWARM.ramp800Cap);if(overtimeSeconds<=FINAL_SWARM.ramp800Seconds)return base;const t=Math.min(1,(overtimeSeconds-FINAL_SWARM.ramp800Seconds)/Math.max(1,FINAL_SWARM.rampSeconds-FINAL_SWARM.ramp800Seconds));return Math.min(FINAL_SWARM.maxEnemies,Math.floor(base+(FINAL_SWARM.maxEnemies-base)*t));})():baseCap;
  const baseSpawn=Math.min(S.maxSpawnPerSecond,(S.spawnBase+S.spawnPerMinute*minutes)*Math.sqrt(tier)*opening*(.8+.2*Math.min(1,minutes)))*(swarm>1?1+(swarm-1)*swarmRamp:1);
  const opened=swarm>1?1:Math.min(1,(minutes/OPENING.minutes)**2);
  const spawnPerSecond=swarm>1?Math.max(baseSpawn,cap/FINAL_SWARM.refillSeconds):MISSION_HP[rank]*(1+OPENING.perMinute*minutes)*(1-opened)+baseSpawn*opened;
  const openCap=swarm>1?cap:Math.max(1,Math.round((OPENING.capBase+OPENING.capPerMinute*minutes)*MISSION_HP[rank]*(1-opened)+cap*opened));
  return {hp:tier*(S.hpBase+minutes*S.hpLinear)*Math.pow(S.hpPerMinute,minutes)*(1+Math.min(1.4,Math.max(0,minutes-HP_RAMP.delay)*1.4/HP_RAMP.spread)*.19*(tier-1)/.4)*midHpRamp(minutes)*curse*swarm*swarmStepHp(step),damage:tier*(S.damageBase+minutes*S.damageLinear)*Math.pow(S.damagePerMinute,minutes)*curse*swarm*(1+GENIN_PRESSURE.damage*geninPressure)*swarmStepDamage(step),
    speed:Math.min(2.5,1+(tier-1)*.18+minutes*.025),attackRate:(1+(tier-1)*.2+minutes*.08+GENIN_PRESSURE.attackRate*geninPressure)*curse,
    spawnPerSecond,spawnInterval:1/spawnPerSecond,
    cap:openCap,
    armor:swarm>1?Math.min(Math.min(SWARM_STEP.armorCap,FINAL_SWARM.maxArmor+swarmStepArmor(step)),minutes*S.armorPerMinute*swarm+swarmStepArmor(step)):Math.min(S.maxArmor,minutes*S.armorPerMinute+GENIN_PRESSURE.armor*geninPressure),swarm};
}
export function incomingDamage(raw:number,armor:number){return Math.max(1,raw*100/(100+Math.max(0,armor)));}
export function rollCritical(chance:number,criticalMultiplier=2.5,rng=Math.random):{tier:0|1|2;multiplier:number}{
  if(chance>=1)return rng()<Math.min(1,chance-1)?{tier:2,multiplier:criticalMultiplier+.5}:{tier:1,multiplier:criticalMultiplier};
  return rng()<Math.max(0,chance)?{tier:1,multiplier:criticalMultiplier}:{tier:0,multiplier:1};
}

export type Threat=ReturnType<typeof difficultyAt>;
/**
 * Multiplicador de ameaça de uma zona (Rodada 55): dificuldade própria da zona (ZONE_DIFFICULTY) × planos do Shikamaru
 * (+33% cada; desde 25/11/2026 só no chefe da zona — Guardião e Bijū) × bônus de ameaça dos itens/eventos (mínimo ×0,2).
 */
export function zoneCurse(zoneMultiplier:number,shikamaruPlans:number,threatBonus:number){return zoneMultiplier*(1+.33*shikamaruPlans)*Math.max(.2,1+threatBonus);}
/**
 * Ameaça dos monstros numa zona (Rodada 55 — pedido do usuário: "ao passar de zona, resetar e voltar do início a
 * progressão dos monstros… mas claro os buffs de %+inimigos/+%hordas… deve influenciar"). `zoneSeconds` é o tempo DA ZONA
 * (cada zona recomeça do 0). `enemyCountBonus` (+% de inimigos) multiplica spawn e teto de vivos por cima da escala,
 * respeitando o teto absoluto (1.600 fora do Final Swarm). `tuning` aplica os parâmetros do debug (identidade nos testes).
 */
export function zoneThreat(mission:Difficulty,zoneSeconds:number,curse:number,overtimeSeconds:number,enemyCountBonus:number,tuning:(t:Threat)=>Threat=t=>t,zone=1):Threat{
  const t=tuning(difficultyAt(mission,zoneSeconds,curse,overtimeSeconds));const density=Math.max(.2,1+enemyCountBonus);
  const tough=ZONE_TOUGHNESS[zone]??ZONE_TOUGHNESS[1];
  return {...t,hp:t.hp*tough.hp,armor:Math.min(SWARM_STEP.armorCap,t.armor+tough.armor),spawnPerSecond:t.spawnPerSecond*density,spawnInterval:t.spawnInterval/density,cap:Math.min(t.swarm>1?FINAL_SWARM.maxEnemies:ENEMY_SCALING.maxEnemies,Math.max(1,Math.round(t.cap*density)))};
}
