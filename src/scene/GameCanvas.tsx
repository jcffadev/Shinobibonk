import { POWERLEVEL_ATTRIBUTES, rollPowerlevel, readPowerlevel, type Powerlevel } from '../game/powerlevel';
import { createGroundMaterial, createSky, groundHeight, trailX, RENDERED_GROUND_SIZE } from './terrainArt';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { activeTuning, dropChance, tuneThreat } from '../game/tuning';
import { createBossCombat, type BossState } from './bossCombat';
import { makeDropSprite } from './dropSprites';
import { currentSettings, translateKey, pixelRatioFor } from '../game/settings';
import { ENEMY_TIERS, ELITE_CHANCE, BASE_LOOT, lootScale, eliteHpRamp, megaEliteHp, rollMegaSchedule, type EnemyTier } from '../game/enemyTiers';
import { sealedHeroes, sealForAccount, unlockedHeroes, addResearch, researchGain, RESEARCH_RULES } from '../game/account';
import { createTotemBar } from './narutoTotem';
import { NPC_ALLIES, NPC_RULES, TOTEM_RULES, dealBonuses, dealLabel, dealText, pctText, rollEbisuDeals, rollIrukaLegendary, rollIrukaLesson, type StatDeal } from '../game/npcs';
import { alliesBonuses, allyBuffText, affinityLevel, affinityFactor, maxAffinityPoints, AFFINITY_RULES, ALLY_BUFFS } from '../game/allies';
import { readSettings } from '../game/settings';
import { DebugPanel, type DebugApi } from '../ui/DebugPanel';
import { compactNumber } from '../game/format';
import { createPlayerMotion } from './playerMotion';
import { createPerfMonitor } from './perfMonitor';
import { mergedTechnique, type TechniqueMerge } from '../game/techniqueMerge';
import { createAtlasEffect } from './atlasEffects';
import { createGamabunta, GAMABUNTA_IGNITION, GAMABUNTA_TIME } from './gamabunta';
import { createEnemyRenderer, ENEMY_FRAME } from './enemyRenderer';
import { createHeightField } from './heightField';
import { createDamageNumbers } from './damageNumbers';
import { BIJUU_BY_ID, bijuuLamens, rollBijuu } from '../game/bijuu';
import { MAP_SIZE, WORLD_LIMIT, ZONE_SECONDS, ACTOR_SCALE, ATTACK_SCALE } from '../game/worldScale';
import { playSfx, playTechniqueSound } from '../audio/sfx';
import { choiceCount, choiceUses, weaponPrice, jiraiyaRolls, prioritySlots, PRIORITY_WEIGHT } from '../game/preparation';
import { merchantPrice, merchantRerollPrice, itemSalePrice } from '../game/itemTrade';
import { ITEM_BY_NAME, rollItems, type Item, type Rarity, type StatKey } from '../game/catalog';
import { HEROES, HERO_BY_ID, familyOf, DETERMINATION, skillPool, heroAffinity, isProjectileUltimate, NATURE_BONUS, sandSynergy, ultimateBase, type Technique, type Control } from '../game/heroes';
import { activeSynergies, synergyBonuses, type ActiveSynergy } from '../game/synergy';
import { ZONES as BASE_ZONES, GUARDIAN_RULES, guardianHpMultiplier, guardianVitality, guardianDefense } from '../game/missions';
import { MAP_BY_ID, type MapId } from '../game/maps';
import { UNLOCK_MISSIONS, missingRequirements } from '../game/unlockMissions';
import { formAt, portraitRegion } from '../game/evolution';
import { NO_GROWTH, rollGrowth, growthText, ELEMENT_KEY, SENJUTSU, hasSenjutsu, setupNumbers, techniqueDetail, type SkillGrowth } from '../game/combat';
import type { Bonuses } from '../game/catalog';
import { animateTechniqueVisual, techniqueImpact, techniqueVisual, disposeObject } from './techniqueEffects';
import { calculateStats, difficultyAt, incomingDamage, rollCritical, MISSION_TIER, ENEMY_SCALING, FINAL_SWARM, xpToLevelUp, effectiveLootLuck, type Difficulty, type Stats } from '../game/progression';
import { PILL_NAMES, PILL_BY_NAME, PILL_SLOTS, PILL_RARITY_POWER, pillOfferText, pillEffectText, canGrantPill, grantPill } from '../game/pills';
import { rollRarityTier, RARITY_ORDER } from '../game/combat';
import { ROULETTE_BY_ID, ROULETTE_RULES, BLESSINGS, BAD_LUCK, rouletteWeights, roulettePressure, rollRoulette, rouletteCost, seededRng, spendBonuses, type RouletteCasaId, type RoulettePrize, type RouletteView } from '../game/roulette';

export type LevelOffer = { merge?:TechniqueMerge; id: string; kind: 'skill'|'pill'|'item'|'stat'; name: string; rarity: Rarity; icon: string; description: string; planned?: boolean; price?:number; growth?:SkillGrowth; bonus?:Bonuses; deal?:StatDeal; disabled?:string; /** Tela de substituição de ajudantes (choiceLevel −7): id do ajudante e se é o recém-derrotado. */ allyId?:string; allyNew?:boolean };
export type WorldSnapshot = { enemyCount?:number; powerlevel?:Powerlevel; allyCharge:number; victory:boolean; remaining:number; /** FINAL SWARM: segundos sobrevividos após o relógio da zona zerar (0/ausente = relógio normal). */ overtime?:number; hiddenEffects:boolean; totalDamage:number; skillDamage:Record<string,number>; skillGrowth:Record<string,SkillGrowth>; techniques:Technique[]; synergy:boolean; synergies:ActiveSynergy[]; setups:{name:string;remaining:number;duration:number}[]; zone:number; phase?:'zone'|'arena'|'exit'; bijuu?:string; bijuuReward?:number; plansUsed?:number; skillTimers?:Record<string,{remaining:number;total:number;duration:number}>; boss:string; defenseProgress:number; banned:string[]; hp: number; maxHp:number; stats:Stats; defeated:boolean; allyDamage:number; difficultyScale:number; level: number; xp: number; xpNext: number; chakra: number; kills: number; runMoney: number; elapsed: number; fps: number; kunai: number; shuriken: number; luck:number; autoUlt:boolean; allies:string[]; /** Pontos de afinidade por ajudante (src/game/allies.ts). */ affinity:Record<string,number>; weather:string; toast:string; interaction:{name:string;description:string}|null; items: Record<string, number>; pills: Record<string, number>; pillQuality?:Record<string,number>; skillLevels: Record<string,number>; choice: { level: number; cards: LevelOffer[]; sale?:number; rerollCost?:number }|null; sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete';account?:boolean}|null; pickups:{kind:string;x:number;z:number;id?:string;name?:string}[];enemies: { x: number; z: number }[]; /** Marcadores VISTOS em tela (eventos/NPCs, Naruto Totem, mega elites/guardião) para mapa e minimapa. */ events: { id: string; name: string; x: number; z: number; icon: string; kind?:'event'|'enemy'; portrait?:string; guardian?:boolean; active?:boolean }[]; explored: { x: number; z: number }[]; player: { x: number; z: number; heading?:number }; ping: {x:number;z:number}|null; /** Rota do mapa (um alvo por vez): distância em metros e posição do alvo na tela (NDC −1..1). */ route?:RouteView|null; routeNotice?:{text:string;kind:'arrived'|'lost'|'set'}|null; effects: number; choices:{reroll:number;skip:number;ban:number;banning:boolean}; weaponCost:number; merchantRerollCost?:number; tsunadeSpinCost?:number; permanent:Record<string,number>; totem?:{hp:number;maxHp:number;remaining:number}|null; roulette?:RouletteView|null };
export type RouteView = { id:string; kind:'event'|'enemy'|'pickup'|'ping'; name:string; x:number; z:number; distance:number; screen:{x:number;y:number} };
/** Run salva (Esc → Salvar e sair, salvamento automático e ao fechar o navegador). */
export const SAVED_RUN_KEY='sb_saved_run_v1';
type PendingPrize = string | { pill:string; amount:number; rarity:Rarity; source:'roulette'|'drop' };
type PortalKind='zone'|'arena'|'exit';
type CampaignSave={start:number;merges?:TechniqueMerge[];megaSchedule?:number[];accountEncounters?:number;plans:number;arena:boolean;reward:number;bijuu:string;portal?:{kind:PortalKind;x:number;z:number};boss?:{id:string;hp:number;maxHp:number};locations?:{id:string;x:number;z:number}[];pickups?:{kind:MapPickup['kind'];x:number;z:number;discovered:boolean}[]};
export type SavedRun={powerlevel?:Powerlevel;v:1;heroId:string;mission:Difficulty;mapId:MapId;savedAt:number;elapsed:number;zone:number;level:number;xp:number;xpNext:number;kills:number;runMoney:number;kunai:number;shuriken:number;chakra:number;hp:number;bonusHp:number;totalDamage:number;allyDamage:number;skillDamage:Record<string,number>;knownItems:Record<string,number>;knownPills:Record<string,number>;pillQuality?:Record<string,number>;skillLevels:Record<string,number>;growth:Record<string,SkillGrowth>;allies:string[];allyAffinity:Record<string,number>;runBuffs:Bonuses;uses:{reroll:number;skip:number;ban:number};banned:string[];events:{id:string;active:boolean;uses:number;discovered:boolean}[];explored:string[];ryuSpent:number;rouletteSpins:number;paidWeapons:number;guardianSpawned:boolean;shikamaruPlans:number;megaElitesSpawned:number;zoneDifficulty:number;xpMultiplier:number;lootMultiplier:number;totemSpawned:boolean;pendingItemRewards:number;defenseDone:boolean;player:{x:number;z:number};accountTried:string[]; campaign?:CampaignSave; merchant?:{purchases:number;rerolls:number;stock:(string|null)[]}; rouletteItems?:PendingPrize[]; rouletteSession?:{pending:RoulettePrize[];sessionSpins:number;sessionSpent:number}|null};
/** Drops no chão. 'lamens' é o Ryu da run (nome legado); 'ramen' é a tigela de lamen que cura. */
type Drop = { mesh: THREE.Sprite; type: 'xp' | 'lamens' | 'chakra' | 'pill' | 'item' | 'ramen'; value: number; name: string; born: number; magnet: boolean; speed: number };
/**
 * Coleta por ímã: o drop fica no chão por DROP_RULES.settle s; dentro da área de coleta (stats.pickup) ele voa até o
 * personagem e só é coletado ao encostar (DROP_RULES.touch m). Teto de drops vivos: acima de DROP_RULES.cap, XP/Ryu/Chakra
 * novos se fundem ao drop do mesmo tipo mais próximo (performance com milhares de inimigos).
 */
export const DROP_RULES = { settle: .35, touch: .75, magnetSpeed: 9, magnetAccel: 30, cap: 260, mergeRadius: 6 };
/** Reposição da horda: até `perFrame` spawns por quadro; com a tela vazia o ritmo vai a ×(1+refill) do valor de difficultyAt. */
export const SPAWN_RULES = { perFrame: 40, swarmPerFrame: 120, refill: 2 };
/**
 * Escolha involuntária (pedido do usuário, 06/11/2026: "ele está pegando pílula sozinho"): a única fonte de pílula é a carta
 * escolhida na subida de nível, mas um novo conjunto de cartas surge na hora (vários níveis seguidos, troca/banimento) sob o
 * cursor liberado pela trava do ponteiro. Um clique ou tecla 1–9 dado para a tela anterior caía na carta nova — muitas vezes
 * uma pílula. Cada conjunto novo de cartas fica `armSeconds` sem aceitar clique, número, E ou V.
 */
export const CHOICE_GUARD = { armSeconds: .5 };
/**
 * Altares por raridade ("Altar · Normal/Incomum/Raro/Épico/Lendário", 8 por zona). Pisar no círculo (radius m) já começa a
 * contar, sem E; dentro sobe 1 s por segundo até seconds[tier]; fora do círculo a barra cai decayPerSecond[tier] (fração da
 * barra por segundo): Normal 4%/s (~25 s para zerar) … Lendário 18%/s (~5,5 s). Cada altar guarda o próprio progresso.
 */
export const ALTAR_RULES = { radius: 3, seconds: [10, 14, 18, 23, 30], decayPerSecond: [.04, .06, .09, .13, .18] };
/** Tigela de lamen de cura: chance por abate e fração do HP máximo curada. */
export const RAMEN_DROP = { chance: .05, heal: .35 };
type Enemy = { ranged?:number; motion?:ReturnType<typeof createPlayerMotion>; motionLevel?:number; moveAfter?:number; moveTime?:number; jumping?:boolean; heroId?:string; elite?:boolean; guardian?:boolean; control?:Control; controlTime?:number; burn?:number; sprite: THREE.Sprite; hp: number; speed: number; hitTimer: number; windup?:number; attackPoint?:THREE.Vector3; marker?:THREE.Mesh; poison?:{remaining:number;dps:number}; slow?:number; challenge?:boolean; megaElite?:boolean; boss?:BossState; /** Tipo do inimigo (src/game/enemyTiers.ts), fração de dano bloqueada e multiplicador de dano do golpe. */ tier?:EnemyTier; defense?:number; dmgMult?:number; /** Shinobi para selar: libera na conta. */ account?:boolean; maxHp?:number; shikamaruPlans?:number; hpMultiplier?:number; guardianZone?:number; bijuu?:boolean; totem?:boolean; clone?:boolean; /** Mapa: id estável do mega elite e se já foi visto em tela. */ uid?:number; seen?:boolean };
type MapPickup = { id:string; kind:'kunai'|'shuriken'|'ryu'|'sealDrop'; name:string; x:number; z:number; mesh:THREE.Object3D; active:boolean; discovered?:boolean };
type Projectile = {mesh:THREE.Object3D;direction:THREE.Vector3;remaining:number;speed:number;radius:number;technique:Technique;origin:THREE.Vector3;hit:Set<Enemy>;growth:SkillGrowth;ally?:boolean;bounces:number;range:number};
/** Setup (buff puro) ativo no jogador. */
type ActiveSetup = {name:string;remaining:number;duration:number;bonuses:Bonuses;sage:boolean};
/** Preparo base (s) até o acerto das técnicas sem projétil; dividido pela velocidade de projétil. */
const IMPACT_DELAY = { Taijutsu: .14, other: .24 };
export const emptySnapshot: WorldSnapshot = { allyCharge:0, victory:false,remaining:600,hiddenEffects:false,totalDamage:0,skillDamage:{},skillGrowth:{},techniques:skillPool('naruto'),synergy:false,synergies:[],setups:[],zone:1,boss:'',defenseProgress:0,banned:[],hp: 130, maxHp:130, stats:calculateStats('naruto',1), defeated:false, allyDamage:0, difficultyScale:1, level: 1, xp: 0, xpNext: 30, chakra: 0, kills: 0, runMoney: 0, elapsed: 0, fps: 0, kunai: 0, shuriken: 0, luck:0,autoUlt:false,allies:[],affinity:{},weather:'',toast:'',interaction:null,items: {}, pills: {}, skillLevels: {}, choice:null,sealing:null,pickups:[], enemies: [], events: [], explored: [{x:0,z:0}], player: { x: 0, z: 0 }, ping:null, effects: 0,choices:{reroll:3,skip:3,ban:3,banning:false},weaponCost:20,permanent:{} };

export function captureGamePointer() {
  const shell=document.querySelector<HTMLElement>('.game-shell');
  if(!shell||document.pointerLockElement===shell||!shell.requestPointerLock)return;
  try {void shell.requestPointerLock()?.catch(()=>{});} catch { /* navegador sem captura disponível */ }
}

export function GameCanvas({ heroId, mission, mapId='folha', resume=null, itemPool, preparation, enabled, paused, onSnapshot, onPanel, debug=false }: { heroId: string; mission:Difficulty; mapId?:MapId; resume?:SavedRun|null; itemPool:Item[]; preparation:{permanent:Record<string,number>;archivedSkills:string[];planned?:string[];trained?:string[];priorityItems?:string[]}; enabled: boolean; paused: boolean; onSnapshot: (snapshot: WorldSnapshot) => void; onPanel: (panel: 'map' | 'quickmap' | 'sheet' | 'pause' | null) => void; debug?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const params=new URLSearchParams(location.search);
  const testPointer=import.meta.env.DEV&&params.has('test')&&params.get('pointer')!=='real';
  // Modo debug (F9, só no servidor de desenvolvimento): o painel e seus ganchos só existem com debug=true.
  // Os parâmetros salvos em `tuning` valem sempre, com ou sem o painel.
  const [debugOpen,setDebugOpen]=useState(false);
  const debugOpenRef=useRef(false);debugOpenRef.current=debug&&debugOpen;
  const debugRef = useRef(debug); debugRef.current = debug;
  const debugApiRef = useRef<DebugApi|null>(null);
  const getDebugApi = useCallback(() => debugRef.current ? debugApiRef.current : null, []);
  const onSnapshotRef = useRef(onSnapshot); onSnapshotRef.current = onSnapshot;
  const onPanelRef = useRef(onPanel); onPanelRef.current = onPanel;
  const enabledRef = useRef(enabled); enabledRef.current = enabled;
  const pausedRef = useRef(paused); pausedRef.current = paused;

  const preparationRef=useRef(preparation);preparationRef.current=preparation;
  const itemPoolRef=useRef(itemPool);itemPoolRef.current=itemPool;
  useEffect(() => {
    const container = host.current; if (!container) return;
    const pointerSurface=container.closest<HTMLElement>('.game-shell');
    // Estado do modo debug: god mode e congelamento só são alterados pelo painel debug.
    const debugState={god:false,frozen:false};
    const tune=()=>activeTuning();const runCleanups:(()=>void)[]=[];
    /** Sorte: chance de +1 carta nas ofertas (até 60% com Sorte 90+). */
    const lootLuck=()=>effectiveLootLuck(stats.luck,elapsed);
    const offerCount=()=>choiceCount(permanent,lootLuck());const heroNature=heroAffinity(heroId);let lastFrameAt=0;
    // Multiplicador de HP já aplicado aos inimigos vivos; mudar no painel reescala os vivos na hora.
    let appliedEnemyHp=tune().enemyHp;
    // Ameaça atual com os parâmetros salvos do debug (todos 1 = igual a difficultyAt).
    // Escala pelo tempo TOTAL da run (antes era o tempo da zona, que zerava a cada zona); FINAL SWARM após o relógio da zona zerar.
    const threatNow=()=>{const t=tuneThreat(difficultyAt(mission,arena?ZONE_SECONDS:elapsed,zoneDifficulty*(1+.33*shikamaruPlans)*Math.max(.2,1+ex('threat')),overtimeNow()),tune());const density=Math.max(.2,1+ex('enemyCount'));return {...t,spawnPerSecond:t.spawnPerSecond*density,spawnInterval:t.spawnInterval/density,cap:Math.min(t.swarm>1?FINAL_SWARM.maxEnemies:ENEMY_SCALING.maxEnemies,Math.max(1,Math.round(t.cap*density)))};};
    const hero=HERO_BY_ID[heroId]??HEROES[0],techniques=skillPool(hero.id,sealedHeroes()),growth:Record<string,SkillGrowth>={},cooldowns:Record<string,number>={},runBuffs:Bonuses={},skillDamage:Record<string,number>={};
    let zoneStart=0,plansUsed=0,arena=false,bijuuReward=0,defeatedBijuu='',finalSwarmAnnounced=false,spawnBudget=0;
    let portal:{kind:PortalKind;x:number;z:number;mesh:THREE.Group}|null=null;
    let totalDamage=0,hiddenEffects=currentSettings().hideMyAttacks,victory=false,zone=1,ambushTimer=8,guardianSpawned=false,shikamaruPlans=0,defenseTime=0,defenseActive=false,defenseDone=false;
    const config=preparationRef.current,permanent={...config.permanent},uses=choiceUses(permanent),banned=new Set<string>();let banning=false,paidWeapons=0;
    const MAP=MAP_BY_ID[mapId]??MAP_BY_ID.folha,ZONES=MAP.zones.map((z,i)=>({...BASE_ZONES[i],...z}));let weatherDef=MAP.weathers[Math.floor(Math.random()*MAP.weathers.length)];let weather=weatherDef.name;const sky=createSky();const applyWeather=()=>{sky.update(weatherDef.sky);scene.background=sky.texture;scene.fog=new THREE.Fog(weatherDef.sky,weatherDef.near,weatherDef.far);};const scene = new THREE.Scene();applyWeather();
    const camera = new THREE.OrthographicCamera(-12, 12, 7, -7, .1, 240);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(pixelRatioFor(currentSettings())); renderer.outputColorSpace = THREE.SRGBColorSpace; container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight('#d4e9ff', '#35402d', 2.4)); const sun = new THREE.DirectionalLight('#ffe6b0', 3); sun.position.set(-8, 18, 7); scene.add(sun);
    const terrainHeight=createHeightField((x:number,z:number)=>groundHeight(MAP.id,x,z),MAP_SIZE/2);
    const groundLook=createGroundMaterial(MAP);
    const terrainGeometry=new THREE.PlaneGeometry(RENDERED_GROUND_SIZE,RENDERED_GROUND_SIZE,224,224);
    const terrainPositions=terrainGeometry.attributes.position;
    for(let i=0;i<terrainPositions.count;i++)terrainPositions.setZ(i,terrainHeight(terrainPositions.getX(i),-terrainPositions.getY(i)));
    terrainGeometry.computeVertexNormals();
    const ground=new THREE.Mesh(terrainGeometry,groundLook.material);
    ground.rotation.x=-Math.PI/2;scene.add(ground);
    const texture = new THREE.TextureLoader().load('/assets/shinobi-sprites-atlas.png'); texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;const orochimaruTexture=new THREE.TextureLoader().load('/assets/orochimaru-sprite.svg');orochimaruTexture.colorSpace=THREE.SRGBColorSpace;orochimaruTexture.magFilter=THREE.NearestFilter;orochimaruTexture.minFilter=THREE.NearestFilter;
    // Inimigos comuns/elite: o Sprite vira só dado (posição/escala/cor de acerto) e é desenhado em lote instanciado (enemyRenderer.ts).
    const enemyRenderer=createEnemyRenderer(scene),damageNumbers=createDamageNumbers(scene);const ELITE_TINT=new THREE.Color('#ffb969'),WHITE_TINT=new THREE.Color('#ffffff');
    const makeSprite=(index:number,w=1.8,h=2.2)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial());enemyRenderer.adopt(sp,index);sp.scale.set(w*ACTOR_SCALE,h*ACTOR_SCALE,1);return sp;};
    /** Contorno colorido (elite amarelo, Mega Elite vermelho, Shinobi para selar ciano): cópia da silhueta pintada de cor sólida, um pouco maior, desenhada atrás. Materiais por cor ficam em cache. */
    const addOutline=(target:THREE.Sprite,color:string)=>{if(enemyRenderer.isBatched(target)){enemyRenderer.outline(target,color);return;}const mat=new THREE.SpriteMaterial({map:target.material.map,transparent:true,depthWrite:false,alphaTest:.1});const rgb=new THREE.Color(color);mat.onBeforeCompile=(shader)=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb = vec3('+rgb.r.toFixed(3)+','+rgb.g.toFixed(3)+','+rgb.b.toFixed(3)+');');};mat.customProgramCacheKey=()=>'outline-'+color;const outline=new THREE.Sprite(mat);outline.scale.set(1.14,1.08,1);outline.renderOrder=1;target.renderOrder=2;outline.raycast=()=>{};target.add(outline);};
    const heroTextures=new Map<string,THREE.Texture>();
    const heroMaterial=(id:string,lv=1)=>{const r=portraitRegion(id,lv),key=r.path+':'+r.index;let map=heroTextures.get(key);if(!map){map=new THREE.TextureLoader().load(r.path);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(1/r.cols,1/r.rows);map.offset.set((r.index%r.cols)/r.cols,(r.rows-1-Math.floor(r.index/r.cols))/r.rows);heroTextures.set(key,map);}return new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false});};
    const makeHero=(id:string,lv=1)=>{const sprite=new THREE.Sprite(heroMaterial(id,lv));sprite.scale.set(1.65*ACTOR_SCALE,2.25*ACTOR_SCALE,1);return sprite;};
    const player=makeHero(heroId);player.position.y=terrainHeight(0,0)+1.15;scene.add(player);
    const playerMotion=createPlayerMotion(scene,player,heroId);
    let moving=false;
    const heading=new THREE.Vector3(0,0,-1),dashHeading=new THREE.Vector3();
    const jumpDuration=.54,slideDuration=.24;
    let jumpTime=0,jumpHeight=0,slideTime=0,slideRecovery=0;
    let sandGlideLeft=0;
    const sandCloud=familyOf(heroId)==='gaara'&&formAt(heroId).level>=15
      ? new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:'#d9a66d',flatShading:true}))
      : null;
    if(sandCloud){sandCloud.visible=false;sandCloud.scale.set(.9,.24,.72);scene.add(sandCloud);runCleanups.push(()=>disposeObject(sandCloud));}
    const cameraTarget=new THREE.Vector3(0,terrainHeight(0,0)+1.15,0);
    const environmentMaps=new Map<number,THREE.Texture>(),decor:THREE.Sprite[]=[];
    const environmentSprite=(index:number,width:number,height:number)=>{let map=environmentMaps.get(index);if(!map){map=new THREE.TextureLoader().load('/assets/environment-v2.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(.25,.5);map.offset.set((index%4)*.25,(1-Math.floor(index/4))*.5);environmentMaps.set(index,map);}const obj=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false}));obj.scale.set(width,height,1);return obj;};
    const scenery=(index:number,x:number,z:number,w:number,h:number)=>{const obj=environmentSprite(index,w,h);if(MAP.scenery.tint!=='#ffffff')obj.material.color.set(MAP.scenery.tint);obj.position.set(x,terrainHeight(x,z)+h*.45,z);scene.add(obj);decor.push(obj);};
    // Keep paths and the spawn clearing open; scatter foliage across hills.
    const sceneryWeights=MAP.scenery.weights,sceneryTotal=sceneryWeights.reduce((a,b)=>a+b,0);for(let i=0;i<Math.round(MAP.scenery.count*1.65);i++){const x=(Math.random()-.5)*(MAP_SIZE-8),z=(Math.random()-.5)*(MAP_SIZE-8);if(Math.hypot(x,z)<6||Math.abs(x-trailX(z))<2.5)continue;let roll=Math.random()*sceneryTotal,kind=0;while(kind<3&&roll>=sceneryWeights[kind]){roll-=sceneryWeights[kind];kind++;}scenery(kind,x,z,kind===3?2.4:3.2,kind===3?1.8:4.2);}
    scenery(4,0,-12,7,6);for(const [x,z] of [[-7,-17],[7,-18],[-10,18],[12,19]])scenery(7,x,z,5.5,5.5);
    if(MAP.id==='folha'){
      const landmarks=[{x:0,z:-52,w:22,h:15},{x:30,z:24,w:6.6,h:10},{x:53,z:24,w:6.6,h:10}];
      for(const [index,{x,z,w,h}] of landmarks.entries()){
        const map=new THREE.TextureLoader().load('/assets/leaf-landmarks-v1.png');
        map.colorSpace=THREE.SRGBColorSpace;map.minFilter=map.magFilter=THREE.NearestFilter;map.generateMipmaps=false;
        map.repeat.set(1/3,1);map.offset.set(index/3,0);
        const landmark=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.12}));
        landmark.scale.set(w,h,1);landmark.center.set(.5,.03);landmark.position.set(x,terrainHeight(x,z)-.14,z);scene.add(landmark);decor.push(landmark);
      }
      for(const [x,z] of [[-9,-15],[8,-17],[-10,-22],[9,-25]])scenery(5,x,z,5,5);
    }
    const eventDefs=[{id:'shikamaru',name:'Plano do Shikamaru',x:14,z:8,icon:'♟️',sprite:8},{id:'guardian-seal',name:'Portal do Guardião · Myōjinmon',x:2,z:-12,icon:'⛩️',sprite:4},{id:'challenge',name:'Altar de desafio',x:-14,z:9,icon:'⛩️',sprite:9},{id:'orochimaru',name:'Maldição de Orochimaru',x:9,z:-18,icon:'🐍',sprite:10},{id:'altar',name:'Altar para proteger',x:-17,z:-13,icon:'🛕',sprite:11},{id:'trader',name:'Mercador de itens',x:-3,z:18,icon:'🥷',sprite:8},{id:'slot',name:'Roleta da Tsunade',x:5,z:18,icon:'🎰',sprite:8},{id:'arsenal',name:'Arsenal da Tenten',x:-21,z:-1,icon:'🗡️',sprite:8},{id:'sapos-sabios',name:'Sapos Sábios · Monte Myōboku',x:-25,z:18,icon:'🐸',sprite:8},{id:'ichiraku',name:'Barraca Ichiraku',x:13,z:21,icon:'🍜',sprite:8},{id:'ebisu',name:'Treino de Elite do Ebisu',x:25,z:5,icon:'🕶',sprite:8},{id:'iruka',name:'Aula do Iruka',x:-24,z:14,icon:'📚',sprite:8}];
    const altarRarities:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
    const allEvents=[...eventDefs.filter(e=>e.id!=='altar').map(e=>({...e,altarTier:undefined as number|undefined})),...Array.from({length:8},(_,i)=>{const tier=i<5?i:Math.floor(Math.random()*5);return {id:'altar-'+i,name:'Altar · '+(tier===0?'Normal':altarRarities[tier]),x:0,z:0,icon:'🛕',sprite:11,altarTier:tier};})];
    const events=allEvents.map(def=>{const gate=def.id==='guardian-seal';const obj=environmentSprite(gate?4:def.id==='ichiraku'?5:def.id==='trader'?7:6,gate?5.6:def.id==='ichiraku'?4:3.2,gate?5:def.id==='ichiraku'?3.4:3.2);if(def.id==='slot'||def.id==='arsenal'||def.id==='shikamaru'||def.id==='ebisu'||def.id==='iruka'||def.id==='sapos-sabios'){obj.material.dispose();obj.material=heroMaterial(def.id==='slot'?'tsunade':def.id==='arsenal'?'tenten':def.id);}if(def.id==='orochimaru'){obj.material.dispose();obj.material=heroMaterial('orochimaru');obj.scale.set(2.2,3.1,1);}obj.scale.multiplyScalar(ACTOR_SCALE);obj.position.set(def.x,terrainHeight(def.x,def.z)+obj.scale.y*.45,def.z);obj.visible=false;scene.add(obj);return { ...def, obj, discovered:false, uses:0, active:true };});
    const occluders=[...decor,...events.filter(event=>['ichiraku','trader','guardian-seal'].includes(event.id)).map(event=>event.obj)];
    const ichiraku=events.find(event=>event.id==='ichiraku')!;
    const teuchi=makeHero('teuchi');
    teuchi.center.set(.5,0);
    scene.add(teuchi);
    function placeTeuchi(){
      const x=ichiraku.x+1.1,z=ichiraku.z+1.45;
      teuchi.position.set(x,terrainHeight(x,z),z);
      teuchi.visible=ichiraku.obj.visible;
    }
    function scatterEvents(){
      const spots:{x:number;z:number}[]=[];
      for(const e of events){
        let x=0,z=0;
        for(let n=0;n<80;n++){
          const radius=e.id==='guardian-seal'?14+Math.random()*16:13+Math.random()*55;
          const angle=Math.random()*Math.PI*2;x=Math.cos(angle)*radius;z=Math.sin(angle)*radius;
          if(spots.every(p=>Math.hypot(p.x-x,p.z-z)>8))break;
        }
        spots.push({x,z});e.x=x;e.z=z;e.active=true;e.uses=0;e.discovered=false;
        e.obj.visible=false;e.obj.position.set(x,terrainHeight(x,z)+e.obj.scale.y*.45,z);if(e===ichiraku)placeTeuchi();
      }
    }
    scatterEvents();
    const altarCircle=new THREE.Mesh(new THREE.RingGeometry(2.94,3,48),new THREE.MeshBasicMaterial({color:'#d6b87a',transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));
    altarCircle.rotation.x=-Math.PI/2;altarCircle.visible=false;scene.add(altarCircle);
    let defenseAltar:(typeof events)[number]|null=null;
    const altarTimes=ALTAR_RULES.seconds;
    /** Progresso guardado por altar (segundos equivalentes); cada altar cai sozinho enquanto o jogador está fora do círculo. */
    const altarProgress=new Map<(typeof events)[number],number>();
    function startAltar(e:(typeof events)[number]){
      if(defenseAltar&&defenseAltar!==e)altarProgress.set(defenseAltar,defenseTime);
      defenseTime=altarProgress.get(e)??0;
      defenseAltar=e;defenseActive=true;defenseDone=false;
      altarCircle.position.set(e.x,terrainHeight(e.x,e.z)+.13,e.z);altarCircle.visible=true;
      eventToast=e.name+' · fique dentro do círculo · fora dele o progresso cai';
    }
    function tickAltar(dt:number){
      // Pisar no círculo de qualquer altar ativo já começa/retoma a contagem (não precisa de E).
      if(!arena)for(const a of events){if(a.altarTier===undefined||!a.active)continue;const inA=Math.hypot(player.position.x-a.x,player.position.z-a.z)<=ALTAR_RULES.radius;
        if(inA&&a!==defenseAltar){a.discovered=true;a.obj.visible=true;startAltar(a);}
        else if(!inA&&a!==defenseAltar){const p=altarProgress.get(a)??0;if(p>0)altarProgress.set(a,Math.max(0,p-dt*ALTAR_RULES.decayPerSecond[a.altarTier]*altarTimes[a.altarTier]));}}
      const e=defenseAltar;if(!e||!defenseActive)return;
      const tier=e.altarTier??0,inside=Math.hypot(player.position.x-e.x,player.position.z-e.z)<=ALTAR_RULES.radius;
      // Dentro: +1 s por segundo. Fora: cai decayPerSecond[tier] da barra por segundo (mais raro = cai mais rápido).
      defenseTime=Math.max(0,defenseTime+(inside?dt:-dt*ALTAR_RULES.decayPerSecond[tier]*altarTimes[tier]));
      (altarCircle.material as THREE.MeshBasicMaterial).color.set(inside?'#ffd76a':'#ff5a4d');
      if(!inside&&defenseTime<=0){altarProgress.delete(e);defenseActive=false;defenseAltar=null;altarCircle.visible=false;return;}
      if(defenseTime<altarTimes[tier])return;
      altarProgress.delete(e);
      defenseActive=false;defenseDone=true;e.active=false;altarCircle.visible=false;
      const favored=eligibleItemPool().filter(i=>i.rarity===altarRarities[tier]);
      const count=offerCount(),prize=drawStock(1,knownItems,Math.random,favored);
      prize.push(...drawStock(count-prize.length,knownItems,Math.random,eligibleItemPool().filter(i=>!prize.includes(i))));
      choiceLevel=0;banning=false;choiceData=prize.length?prize.map(toOffer):null;
      keys.clear();eventToast=e.name+' · 100% · escolha sua recompensa';snapshotTimer=0;
    }
    // Arsenal da Tenten (NPC, antes Kakashi): forja uma cópia de 1 item que o jogador já carrega. A escolha usa choiceLevel=-1; o evento só é gasto ao copiar.
    let kakashiEvent:(typeof events)[number]|null=null;
    const enemyList:Enemy[]=[],drops:Drop[]=[],shots:Projectile[]=[],keys=new Set<string>(),knownItems:Record<string,number>={},knownPills:Record<string,number>={},pillQuality:Record<string,number>={},skillLevels:Record<string,number>={},exploredCells=new Map<string,{x:number;z:number}>(),pickups:MapPickup[]=[],allies:string[]=[];let choiceData:LevelOffer[]|null=null,choiceLevel=1,kunai=0,shuriken=0,sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete';account?:boolean}|null=null,sealTimer=0,damageMultiplier=1,luck=0;
    const pendingSeals:{heroId:string;target:string;phase:'ready';account?:boolean}[]=[];
    /** Afinidade por ajudante (pontos; src/game/allies.ts) e candidato da tela de substituição (choiceLevel −7). */
    const allyAffinity:Record<string,number>={};let replaceCandidate:{heroId:string;target:string}|null=null;
    // Roleta da Tsunade (src/game/roulette.ts): overlay aberto pausa a run como as telas de escolha. Prêmios/penalidades ficam pendentes
    // e só são entregues ao sair. ryuSpent = total de Ryu gasto na run (kunais, roleta, Ichiraku) → buff de dano da Carteira Gama-chan.
    let roulette:{pending:RoulettePrize[];sessionSpins:number;sessionSpent:number}|null=null,rouletteSpins=0,rouletteSeq=0,ryuSpent=0,rouletteRng:()=>number=Math.random;
    const rouletteItems:PendingPrize[]=[];
    const merchant={purchases:0,rerolls:0,stock:[] as (string|null)[]};
    const powerlevel:Powerlevel={};
    let bonusHp=0,defeated=false,invulnerability=0,allyDamage=0,pendingItemRewards=0;
    let stats=calculateStats(heroId,1,{},{},0,permanent),allyTimer=0;
    const allyActors:THREE.Sprite[]=[];
    const sageAura=createAtlasEffect('sage');sageAura.sprite.visible=false;scene.add(sageAura.sprite);runCleanups.push(sageAura.dispose);
    const allyMotions=new Map<THREE.Sprite,ReturnType<typeof createPlayerMotion>>();
    const activeSetups:ActiveSetup[]=[],pendingHits:{time:number;run:()=>void}[]=[];
    /** Teste: força a chance da linha Senjutsu (null = valor normal). */
    let senjutsuOverride:number|null=null,senjutsuProcs=0;
    const sageModeActive=()=>activeSetups.some(s=>s.sage);
    /** Intervalo do ataque dos ajudantes: velocidade dos ajudantes × metade do bônus de velocidade de ataque do herói. */
    const allyInterval=()=>1.5/Math.max(.1,stats.allySpeed*(1+(stats.attackSpeed-1)*.5));
    const refreshStats=(healGrowth=false)=>{const oldMax=stats.maxHp;
      // Buffs da run = escolhas de "Powerlevel" + buff único de cada ajudante (× força de suporte) + sinergia da Areia. Recalculado das fontes a cada quadro.
      const buffs:Bonuses={...runBuffs};for(const [key,value] of Object.entries(alliesBonuses(allies,stats.allyBuff,allyAffinity)))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      // Sinergias de aldeia/organização (src/game/synergy.ts); Irmãos da Areia completos mantêm +12 armadura / +15% dano.
      for(const [key,value] of Object.entries(synergyBonuses(activeSynergies(heroId,allies))))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      // Setups ativos (Portões, Byakugou, Modo Sábio...): bônus temporários, somados enquanto durarem.
      for(const setup of activeSetups)for(const [key,value] of Object.entries(setup.bonuses))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      // Buff por Ryu gasto (Carteira Gama-chan): recalculado de itens possuídos + total gasto.
      for(const [key,value] of Object.entries(spendBonuses(knownItems,ryuSpent)))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      stats=calculateStats(heroId,level,knownItems,knownPills,bonusHp,permanent,buffs,powerlevel,pillQuality);{const tp=tune();stats.maxHp*=tp.playerHp;stats.armor*=tp.playerArmor;stats.moveSpeed*=tp.playerMove;stats.attackSpeed*=tp.playerAttackSpeed;stats.projectileSpeed*=tp.playerProjectileSpeed;stats.area*=tp.playerArea;stats.crit*=tp.playerCrit;stats.critDamage*=tp.playerCritDamage;stats.regen*=tp.playerRegen;stats.pickup*=tp.playerPickup;stats.luck*=tp.playerLuck;}luck=stats.luck;hp=Math.min(stats.maxHp,hp+(healGrowth?Math.max(0,stats.maxHp-oldMax):0));};
    // Mecânicas de item (catálogo): soma de bônus por chave, recalculada das fontes junto com os atributos.
    const ex=(key:StatKey)=>stats.extra[key]||0;
    // Economia expansiva: preços crescem por uso e por minuto de run (itemTrade.ts/preparation.ts/roulette.ts).
    const kunaiPrice=()=>Math.round(weaponPrice(paidWeapons,elapsed)*(1-Math.min(.4,ex('kunaiDiscount')))*tune().kunaiPrice);
    const slotPrice=()=>rouletteCost(rouletteSpins,ex('slotDiscount'),elapsed);
    let timeSinceHit=99,rushTimer=0,shieldReady=true,shieldTimer=0,emergencyCd=0,periodicTimer=30,boltTimer=2.5,beamTimer=6,freezeCd=0,ultBuffTimer=0,stillTime=0,revives35=0,revives60=0;
    const lastPos=new THREE.Vector3();
    /** Multiplicador temporário de velocidade de ataque: Selo de Adrenalina, Postura de Pedra parado e Pergaminho do Hokage após a Ultimate. */
    const tempAttackSpeed=()=>1+(rushTimer>0?.12:0)+(ex('stance')>0&&stillTime>.5?.08:0)+(ultBuffTimer>0?.3:0);
    const grantItem=(name:string)=>{const item=ITEM_BY_NAME[name];if(!item||(knownItems[name]||0)>=item.max)return;knownItems[name]=(knownItems[name]||0)+1;refreshStats(true);};
    // Afinidade inicial: Nv. 1 (0 pontos) para quem entra por selamento/substituição; Iruka (NPC) entra no máximo.
    const recruitAlly=(id:string)=>{if(allyActors.length>=stats.supportSlots||allies.includes(id))return false;const sprite=makeHero(id);sprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(sprite);allyActors.push(sprite);allyMotions.set(sprite,createPlayerMotion(scene,sprite,id,false));allies.push(id);allyAffinity[id]=id==='iruka'?maxAffinityPoints():0;addRing(sprite.position,'#61ffa8',1);refreshStats(true);return true;};
    /** Remove um ajudante da equipe (substituição). Não concede nada. */
    const dismissAlly=(id:string)=>{const i=allies.indexOf(id);if(i<0)return false;const sprite=allyActors[i];scene.remove(sprite);allyMotions.get(sprite)?.dispose();allyMotions.delete(sprite);sprite.material.dispose();allyActors.splice(i,1);allies.splice(i,1);delete allyAffinity[id];refreshStats();return true;};
    const allyName=(id:string)=>HERO_BY_ID[id]?.name??NPC_ALLIES[id]?.name??id;
    /** Soma pontos de afinidade (até o máximo) e avisa quando sobe de nível. */
    const gainAffinity=(id:string,points:number)=>{if(!(id in allyAffinity))return;const before=affinityLevel(allyAffinity[id]);allyAffinity[id]=Math.min(maxAffinityPoints(),allyAffinity[id]+points);const after=affinityLevel(allyAffinity[id]);if(after>before)eventToast=`Afinidade com ${allyName(id)}: Nv. ${after}/${AFFINITY_RULES.max} · passiva em ${Math.round(affinityFactor(allyAffinity[id])*100)}%`;};
    /** Cartas da tela de substituição (choiceLevel −7): ajudantes atuais + o novo. Clicar no novo = dispensar. */
    const replaceCards=(candidate:{heroId:string;target:string}):LevelOffer[]=>[...allies.map(id=>{const pts=allyAffinity[id]??0,lv=affinityLevel(pts);return {id:'replace-'+id,kind:'stat' as const,name:allyName(id),rarity:'Raro' as Rarity,icon:'🤝',allyId:id,description:`Substituir: ${allyName(id)} sai da equipe (afinidade Nv. ${lv}/${AFFINITY_RULES.max}, passiva ${ALLY_BUFFS[id]?.title??''}: ${allyBuffText(id,stats.allyBuff,pts)}; máx. ${allyBuffText(id,stats.allyBuff)}) e ${candidate.target} entra no Nv. 1.`};}),{id:'replace-new-'+candidate.heroId,kind:'stat',name:candidate.target,rarity:'Épico',icon:'✨',allyId:candidate.heroId,allyNew:true,description:`Dispensar ${candidate.target}: ele não entra e você não ganha nada. Passiva no Nv. 1: ${allyBuffText(candidate.heroId,stats.allyBuff,0)}; máx. ${allyBuffText(candidate.heroId,stats.allyBuff)}.`}];
    const openReplace=(candidate:{heroId:string;target:string})=>{replaceCandidate={heroId:candidate.heroId,target:candidate.target};sealing=null;choiceLevel=-7;banning=false;choiceData=replaceCards(replaceCandidate);keys.clear();eventToast=`Equipe cheia (${allies.length}/${stats.supportSlots}): escolha quem sai ou dispense ${candidate.target}.`;};
    /** Próximo selamento da fila; com a animação desligada (Configurações) sela direto, sem card. */
    const nextSeal=():void=>{const p=pendingSeals.shift();if(!p){sealing=null;return;}startSeal(p);};
    const startSeal=(p:{heroId:string;target:string;phase:'ready';account?:boolean}):void=>{if(readSettings().sealAnimation){sealing=p;return;}sealing=null;if(p.account){sealForAccount(p.heroId);eventToast=p.target+' foi selado e agora está DESBLOQUEADO na sua conta (animação de captura desligada).';playSfx('pickup');nextSeal();return;}if(allies.includes(p.heroId)){eventToast=p.target+' já está na equipe.';nextSeal();return;}if(allyActors.length>=stats.supportSlots){openReplace(p);return;}recruitAlly(p.heroId);eventToast=p.target+' foi selado direto e entrou na equipe (animação de captura desligada nas Configurações).';playSfx('pickup');nextSeal();};
    const resolveReplace=(offer:LevelOffer|null)=>{const candidate=replaceCandidate;if(!candidate)return;if(!offer||offer.allyNew){eventToast=candidate.target+' foi dispensado. Nenhuma recompensa.';}else if(offer.allyId&&dismissAlly(offer.allyId)){recruitAlly(candidate.heroId);eventToast=`${allyName(offer.allyId)} saiu; ${candidate.target} entrou na equipe (afinidade Nv. 1).`;playSfx('pickup');}replaceCandidate=null;choiceData=null;keys.clear();nextSeal();};
    const revealAround=(x:number,z:number)=>{const cx=Math.round(x/5),cz=Math.round(z/5);for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){if(ox*ox+oz*oz>2)continue;const gx=cx+ox,gz=cz+oz,key=`${gx},${gz}`;if(!exploredCells.has(key))exploredCells.set(key,{x:gx*5,z:gz*5});}};revealAround(0,0);
    const pillNames=PILL_NAMES;
    skillLevels[hero.skills[0]]=1;
    const toOffer=(item:Item,index:number):LevelOffer=>({id:item.id+'-'+index,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:item.description+' Você tem '+(knownItems[item.name]||0)+'/'+item.max+'.'});
    const eligibleItemPool=()=>itemPoolRef.current.filter(i=>!banned.has(i.name));
    const drawStock=(count:number, owned=knownItems, rng=Math.random, pool=eligibleItemPool())=>
      rollItems(pool,owned,lootLuck(),count,rng,(config.priorityItems??[]).slice(0,prioritySlots(permanent)),PRIORITY_WEIGHT);
    const merchantRerollCost=()=>merchantRerollPrice(merchant.rerolls,ex('slotDiscount'),elapsed);
    const saleValue=()=>Math.max(0,...(choiceData??[]).map(card=>(card.kind==='item'||card.kind==='pill')?itemSalePrice(card.rarity):0));
    function showMerchant(){
      if(!merchant.stock.length) merchant.stock=drawStock(4).map(i=>i.name);
      choiceLevel=-8;banning=false;keys.clear();
      choiceData=Array.from({length:4},(_,index)=>{
        const name=merchant.stock[index],item=name?ITEM_BY_NAME[name]:undefined;
        if(!item) return {id:'merchant-empty-'+index,kind:'stat',name:'Sem oferta',icon:'—',rarity:'Comum',description:'Role novamente para buscar outra oferta.',disabled:'Sem estoque'};
        const price=merchantPrice(item.rarity,merchant.purchases,elapsed);
        const disabled=(knownItems[item.name]||0)>=item.max?'Limite de cópias atingido':runMoney<price?'Ryu insuficiente':undefined;
        return {...toOffer(item,index),price,disabled};
      });
      snapshotTimer=0;
    }
    function rerollMerchant(){
      if(choiceLevel!==-8||!choiceData||runMoney<merchantRerollCost()) return;
      const cost=merchantRerollCost();
      const other=eligibleItemPool().filter(i=>!merchant.stock.includes(i.name));
      const next=drawStock(4,knownItems,Math.random,other);
      next.push(...drawStock(4-next.length,knownItems,Math.random,eligibleItemPool().filter(i=>!next.includes(i))));
      if(!next.length){eventToast='O mercador não tem itens elegíveis.';snapshotTimer=0;return;}
      runMoney-=cost;ryuSpent+=cost;merchant.rerolls++;
      merchant.stock=next.map(i=>i.name);refreshStats();showMerchant();
    }
    function buyMerchant(index:number, offer:LevelOffer){
      const item=ITEM_BY_NAME[offer.name];
      if(!item||merchant.stock[index]!==item.name||(knownItems[item.name]||0)>=item.max) return;
      const price=merchantPrice(item.rarity,merchant.purchases,elapsed);
      if(runMoney<price) return;
      runMoney-=price;ryuSpent+=price;merchant.purchases++;merchant.stock[index]=null;
      grantItem(item.name);playSfx('pickup');showMerchant();
    }
    function showRouletteItem(){
      while(rouletteItems.length){
        const prize=rouletteItems[0];
        let card:LevelOffer|undefined;
        if(typeof prize==='string'){
          const item=ITEM_BY_NAME[prize];
          if(item&&(knownItems[item.name]||0)<item.max)card=toOffer(item,0);
          else if(item)runMoney+=itemSalePrice(item.rarity);
        }else if(prize?.source==='roulette')runMoney+=itemSalePrice(prize.rarity);
        if(card){choiceLevel=-9;banning=false;choiceData=[card];keys.clear();snapshotTimer=0;return;}
        rouletteItems.shift();
      }
    }
    function finishRouletteItem(){
      rouletteItems.shift();choiceData=null;keys.clear();snapshotTimer=0;showRouletteItem();
    }
    function sellLoot(){
      if(!choiceData||(choiceLevel!==0&&choiceLevel!==-9)||banning) return;
      const value=saleValue();
      if(!value) return;
      runMoney+=value;eventToast='Recompensa vendida · +'+compactNumber(value)+' Ryu';playSfx('pickup');
      if(choiceLevel===-9){finishRouletteItem();saveRun();}
      else {choiceData=null;keys.clear();snapshotTimer=0;}
    }
    const rollMegaLoot=():LevelOffer[]|null=>{const rolled=drawStock(offerCount());if(rolled.length)return rolled.map(toOffer);eventToast='Sem itens elegíveis no pool.';return null;};
    /** Afixos acumulados de uma técnica somados a um afixo oferecido (para mostrar os números após a escolha). */
    const growthAfter=(name:string,extra:SkillGrowth):SkillGrowth=>{const g={...(growth[name]??NO_GROWTH)};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])g[key]+=extra[key]||0;return g;};
    const knowsSageMode=()=>techniques.some(t=>t.setup?.sage&&skillLevels[t.name]);
    /** Técnicas que ainda podem ser aprendidas/melhoradas agora (mesma regra das cartas de level-up). */
    const eligibleSkills=()=>{const learned=Object.keys(skillLevels).length,maxSkills=permanent['Quarta técnica']?4:3;
      return techniques.filter(t=>t.unlockLevel<=level&&!config.archivedSkills.includes(t.name)&&!banned.has(t.name)&&!consumedTechniques.has(t.name)&&(skillLevels[t.name]||0)<9+ex('skillCap')&&((skillLevels[t.name]||0)>0||learned<maxSkills));};
    /** Pílulas que ainda podem subir (fora do limite de níveis e de tipos). Pílula no limite NUNCA aparece (cartas, roleta, drops). */
    const eligiblePills=()=>pillNames.filter(name=>!banned.has(name)&&canGrantPill(knownPills,name,ex('pillCap')));
    const grantTraining=()=>{const attribute=rollPowerlevel(stats);powerlevel[attribute]=(powerlevel[attribute]??0)+1;refreshStats(true);return attribute;};
    /** A Sorte altera a potência da pílula, que sempre avança um nível. */
    const pillOffer=(pill:string):LevelOffer=>{const rarity=RARITY_ORDER[rollRarityTier(lootLuck())];return {id:'pill-'+pill,kind:'pill',name:pill,rarity,icon:PILL_BY_NAME[pill]?.glyph??'💊',description:pillOfferText(pill,knownPills[pill]||0,ex('pillCap'),rarity)};};
    const rollLevelOffers=():LevelOffer[]=>{
      const skills=eligibleSkills();
      // Level-up oferece SOMENTE técnicas e pílulas (itens vêm apenas de recompensas via rollMegaLoot).
      // Regra: até 2 técnicas; o restante são pílulas distintas; se faltar um tipo, completa com o outro.
      const total=offerCount(),cards:LevelOffer[]=[];
      const pills=eligiblePills();
      const skillCard=(index?:number)=>{const t=skills.splice(index??Math.floor(Math.random()*skills.length),1)[0],roll=rollGrowth(lootLuck(),t),current=skillLevels[t.name]||0;cards.push({id:'skill-'+t.name,kind:'skill',name:t.name,rarity:roll.rarity,growth:roll.growth,icon:'⚔️',description:(current?'Nível '+current+' → '+(current+1):'Nova técnica · '+t.school+' · '+t.shape)+'. '+growthText(roll.growth,t)+(t.status?' · '+t.status:'')+' — '+techniqueDetail(t,growthAfter(t.name,roll.growth),stats.sage>0,knowsSageMode())});};
      const pillCard=()=>{const pill=pills.splice(Math.floor(Math.random()*pills.length),1)[0];cards.push(pillOffer(pill));};
      const skillTarget=Math.max(Math.min(2,skills.length),total-pills.length);
      while(cards.length<skillTarget&&skills.length)skillCard();
      while(cards.length<total&&pills.length)pillCard();
      while(cards.length<total&&skills.length)skillCard();
      // Treinamento com Jiraiya (Passivas Shinobi): cada espaço que acerta sua chance traz 1 técnica favorita (★) elegível
      // que ainda não está na oferta, substituindo uma técnica não favorita (ou, sem ela, a última pílula).
      const favorites=new Set(config.trained??[]);
      for(let hits=favorites.size?jiraiyaRolls(permanent):0;hits>0;hits--){
        const fav=skills.filter(t=>favorites.has(t.name));if(!fav.length)break;
        const t=fav[Math.floor(Math.random()*fav.length)];skills.splice(skills.indexOf(t),1);
        let slot=cards.findIndex(c=>c.kind==='skill'&&!favorites.has(c.name));if(slot<0)slot=cards.map(c=>c.kind).lastIndexOf('pill');if(slot<0&&cards.length>=total)slot=cards.length-1;
        skills.unshift(t);skillCard(0);const card=cards.pop()!;
        card.planned=true;card.description='Treinamento com Jiraiya · '+card.description;
        if(slot>=0&&cards.length>=total)cards[slot]=card;else cards.push(card);
      }
      return cards.slice(0,total);
    };
    // Barraca Ichiraku: esquecer pílula/técnica pagando Ryu, quantas vezes quiser (choiceLevel=-2; evento nunca se esgota).
    const forgetPrice=(level:number)=>10+5*Math.max(1,level);
    const merges=new Map<string,TechniqueMerge>();
    const consumedTechniques=new Set<string>();
    function openSages(){
      const learned=techniques.filter(t=>skillLevels[t.name]&&!t.setup&&!merges.has(t.name));
      choiceLevel=-6;choiceData=[];banning=false;keys.clear();snapshotTimer=0;
      for(let i=0;i<learned.length;i++)for(let j=i+1;j<learned.length;j++){
        const a=learned[i],b=learned[j];
        for(const kind of ['fuse','combine'] as const){
          const merge:TechniqueMerge={kind,names:[a.name,b.name]};
          choiceData.push({id:kind+'-'+i+'-'+j,kind:'stat',rarity:kind==='fuse'?'Épico':'Raro',icon:kind==='fuse'?'✦':'⛓',
            name:(kind==='fuse'?'Fundir':'Combinar')+' · '+a.name+' / '+b.name,merge,
            description:kind==='fuse'?`${a.element} + ${b.element} · técnica nova no nível 1, ×2 de dano sobre a média e afixos somados.`:'As duas técnicas atacam juntas no mesmo espaço. Cada uma causa ×1,5 de dano.'});
        }
      }
    }
    function applyMerge(merge:TechniqueMerge){
      const merged=mergedTechnique(merge,techniques);
      if(!merged||merge.names.some(name=>!skillLevels[name]||merges.has(name)))return;
      const [a,b]=merge.names.map(name=>growth[name]??NO_GROWTH);
      growth[merged.name]=merge.kind==='fuse'?{damage:a.damage+b.damage,area:a.area+b.area,haste:a.haste+b.haste,duration:a.duration+b.duration}:{...NO_GROWTH};
      for(const name of merge.names){delete skillLevels[name];delete cooldowns[name];consumedTechniques.add(name);}
      techniques.push(merged);merges.set(merged.name,merge);skillLevels[merged.name]=1;
      choiceData=null;keys.clear();snapshotTimer=0;eventToast=merged.name+' entrou no kit';saveRun();
    }
    function openIchiraku(){
      const learned=Object.entries(skillLevels).filter(([,lv])=>lv>0),pills=Object.entries(knownPills).filter(([,lv])=>lv>0);
      const cards:LevelOffer[]=[];
      // A última técnica não pode ser esquecida: o personagem precisa atacar.
      if(learned.length>1)for(const [name,lv] of learned){const t=techniques.find(x=>x.name===name);cards.push({id:'forget-skill-'+name,kind:'skill',name,rarity:'Comum',icon:'⚔️',price:forgetPrice(lv),description:t?[t.school,t.element,t.shape,t.setup?.summary??(t.status?'Aplica '+t.status.toLowerCase()+' quando o status ativa.':'Causa dano aos alvos no alcance.'),growthText(growth[name]??NO_GROWTH,t)].filter(Boolean).join(' · '):''});}
      for(const [name,lv] of pills)cards.push({id:'forget-pill-'+name,kind:'pill',name,rarity:'Comum',icon:'💊',price:forgetPrice(lv),description:pillEffectText(name,lv+(pillQuality[name]||0))});
      choiceLevel=-2;banning=false;choiceData=cards;keys.clear();snapshotTimer=0;eventToast='Teuchi: bem-vindo à Barraca Ichiraku.';
    }
    function forgetAtIchiraku(offer:LevelOffer){
      const level=offer.kind==='pill'?knownPills[offer.name]||0:skillLevels[offer.name]||0,price=forgetPrice(level);
      if(runMoney<price){eventToast=`Ichiraku: faltam ${compactNumber(price-runMoney)} Ryu para esquecer ${offer.name}.`;return;}
      runMoney-=price;ryuSpent+=price;
      if(offer.kind==='pill'){delete knownPills[offer.name];delete pillQuality[offer.name];}
      else{delete skillLevels[offer.name];delete growth[offer.name];delete cooldowns[offer.name];const active=activeSetups.findIndex(a=>a.name===offer.name);if(active>=0)activeSetups.splice(active,1);}
      refreshStats();playSfx('pickup');
      eventToast=`Ichiraku: ${offer.name} esquecida por ${compactNumber(price)} Ryu.`;
      openIchiraku();
    }
    // ───── Roleta da Tsunade (evento 'slot'; regras em src/game/roulette.ts) ─────
    // E abre o overlay (TsunadeRoulette.tsx). Cada giro cobra na hora (custo cresce por giro na run) e guarda o resultado;
    // tudo (prêmios E penalidades) só é aplicado ao sair. Buff/debuff entram como bônus temporários em activeSetups
    // (somados do zero em refreshStats e removidos ao expirar → sem resíduo).
    const roulettePressureNow=()=>roulettePressure(zoneDifficulty,zone,mission);
    const rouletteWeightsNow=()=>rouletteWeights(stats.luck,roulettePressureNow());
    function rouletteView():RouletteView|null{if(!roulette)return null;return{cost:slotPrice(),spins:rouletteSpins,sessionSpins:roulette.sessionSpins,sessionSpent:roulette.sessionSpent,ryuSpent,discount:Math.min(ROULETTE_RULES.maxDiscount,ex('slotDiscount')),money:runMoney,luck:stats.luck,pressure:roulettePressureNow(),weights:rouletteWeightsNow(),pending:roulette.pending.map(p=>({...p}))};}
    function openRoulette(){if(!roulette){roulette={pending:[],sessionSpins:0,sessionSpent:0};keys.clear();snapshotTimer=0;eventToast='Roleta da Tsunade: E gira · segure E para giro rápido · Esc sai e recebe.';}return rouletteView();}
    function spinRoulette(forced?:RouletteCasaId):{ok:boolean;reason?:string;prize?:RoulettePrize;view:RouletteView|null}{
      if(!roulette)return{ok:false,reason:'A roleta está fechada.',view:null};
      const cost=slotPrice();if(runMoney<cost)return{ok:false,reason:`Faltam ${compactNumber(cost-runMoney)} Ryu para girar (${compactNumber(cost)} Ryu).`,view:rouletteView()};
      runMoney-=cost;ryuSpent+=cost;rouletteSpins++;roulette.sessionSpins++;roulette.sessionSpent+=cost;
      const id:RouletteCasaId=forced&&forced!=='pill'&&ROULETTE_BY_ID[forced]?forced:rollRoulette(rouletteWeightsNow(),rouletteRng);
      const casa=ROULETTE_BY_ID[id],prize:RoulettePrize={seq:++rouletteSeq,id,label:casa.label,icon:casa.icon,kind:casa.kind,detail:casa.description,cost};
      if(id==='ryu'){prize.amount=cost*2;prize.detail=`+${compactNumber(prize.amount)} Ryu`;}
      else if(id==='item'||id==='jackpot'){
        const reserved={...knownItems};
        for(const pending of roulette.pending) if(pending.item) reserved[pending.item]=(reserved[pending.item]||0)+1;
        const item=drawStock(1,reserved,rouletteRng)[0];
        prize.item=item?.name;prize.amount=(id==='jackpot'?cost*3:0)+(item?0:itemSalePrice('Comum'));
        prize.label=item?.name??'Ryu · pool esgotado';
        prize.detail=(item?item.rarity+' · '+item.description+' Ao sair: E pega ou V vende por '+compactNumber(itemSalePrice(item.rarity))+' Ryu.':'Sem item elegível.')+(prize.amount?' +'+compactNumber(prize.amount)+' Ryu.':'');
      }
      else if(id==='lose'){prize.amount=cost;prize.detail=`−${compactNumber(prize.amount)} Ryu ao sair`;}
      else if(id==='buff'){prize.blessing=Math.floor(rouletteRng()*BLESSINGS.length)%BLESSINGS.length;prize.label=BLESSINGS[prize.blessing].name;prize.detail=`${BLESSINGS[prize.blessing].text} por ${ROULETTE_RULES.buffDuration} s`;}
      else if(id==='debuff')prize.detail=`${BAD_LUCK.text} por ${ROULETTE_RULES.debuffDuration} s`;
      else if(id==='ambush'){prize.amount=ROULETTE_RULES.ambushBase+2*zone;prize.detail=`${prize.amount} inimigos ao sair`;}
      roulette.pending.push(prize);snapshotTimer=0;
      return{ok:true,prize:{...prize},view:rouletteView()};
    }
    function applyTimedBuff(name:string,bonuses:Bonuses,duration:number){const cur=activeSetups.find(a=>a.name===name);if(cur){cur.remaining=duration;cur.duration=duration;cur.bonuses={...bonuses};}else activeSetups.push({name,remaining:duration,duration,bonuses:{...bonuses},sage:false});}
    function closeRoulette(){if(!roulette)return null;const delivered=roulette.pending;roulette=null;keys.clear();
      let gained=0,lost=0,ambush=0,itemChoices=0;const blessingCount:Record<number,number>={};
      for(const p of delivered){
        if(p.id==='kunai')kunai++;else if(p.id==='shuriken')shuriken++;
        else if(p.id==='pill')gained+=itemSalePrice((p.rarity as Rarity)??'Comum'); // prêmio de save anterior
        else if(p.id==='ryu')gained+=p.amount||0;
        else if(p.id==='jackpot'||p.id==='item'){gained+=p.amount||0;if(p.item){rouletteItems.push(p.item);itemChoices++;}}
        else if(p.id==='buff'){blessingCount[p.blessing??0]=(blessingCount[p.blessing??0]||0)+1;}
        else if(p.id==='debuff')applyTimedBuff(BAD_LUCK.name,BAD_LUCK.bonuses,ROULETTE_RULES.debuffDuration);
        else if(p.id==='lose')lost+=p.amount||0;
        else if(p.id==='ambush')ambush+=p.amount||0;
      }
      // Bênçãos iguais acumulam (até 3×) em vez de se sobrescrever; cada uma entregue de verdade.
      for(const [index,count] of Object.entries(blessingCount)){const b=BLESSINGS[Number(index)],stacks=Math.min(3,count),bonuses:Bonuses={};for(const [k,v] of Object.entries(b.bonuses))bonuses[k as keyof Bonuses]=(v as number)*stacks;applyTimedBuff(b.name,bonuses,ROULETTE_RULES.buffDuration);}
      runMoney+=gained;const paid=Math.min(runMoney,lost);runMoney-=paid;
      for(let n=0;n<Math.min(ambush,Math.max(0,threatNow().cap-enemyList.length));n++)spawnEnemy();
      refreshStats(true);invulnerability=Math.max(invulnerability,1.2);snapshotTimer=0;
      eventToast=delivered.length?`Roleta da Tsunade: ${delivered.length} resultado(s) entregue(s)${gained?' · +'+compactNumber(gained)+' Ryu':''}${paid?' · −'+compactNumber(paid)+' Ryu':''}${itemChoices?' · '+itemChoices+' prêmio(s) para escolher':''}${ambush?' · emboscada de '+ambush+' ninjas!':''}`:'Roleta da Tsunade: você saiu sem girar.';
      if(delivered.length)playSfx('pickup');
      showRouletteItem();saveRun();
      return delivered;
    }
    function rewardAction(action:'reroll'|'skip'|'ban'){
      if(choiceData&&choiceLevel===-8){if(action==='reroll')rerollMerchant();else if(action==='skip'){choiceData=null;keys.clear();snapshotTimer=0;}return;}
      if(choiceData&&(choiceLevel===-9))return;
      // Substituição de ajudantes (−7): X dispensa o novo shinobi (sem recompensa).
      if(choiceData&&choiceLevel===-7){if(action==='skip')resolveReplace(null);return;}
      // Ebisu/Iruka: só X (sair sem gastar o evento); no pergaminho lendário, X volta ao menu da Iruka.
      if(choiceData&&choiceLevel<=-3){if(action!=='skip')return;if(choiceLevel===-6){choiceData=null;return;}if(choiceLevel===-5){choiceLevel=-4;choiceData=irukaMenu();keys.clear();return;}const who=npcEvent?.id==='ebisu'?'Ebisu':'Iruka';npcEvent=null;choiceData=null;keys.clear();eventToast=who+': volte quando quiser (a oferta continua guardada).';return;}
      if(choiceData&&choiceLevel===-2){if(action==='skip'){choiceData=null;keys.clear();eventToast='Volte à Barraca Ichiraku quando quiser.';}return;}
      // Na cópia do Kakashi não há atualizar/banir; X só fecha sem gastar o evento nem usos.
      if(choiceData&&choiceLevel===-1){if(action==='skip'){choiceData=null;kakashiEvent=null;keys.clear();eventToast='Arsenal da Tenten: cópia adiada. Volte quando quiser.';}return;}
      if(!choiceData||defeated||sealing||uses[action]<=0)return;
      if(action==='ban'){banning=!banning;snapshotTimer=0;return;}
      uses[action]--;banning=false;
      if(action==='skip'){choiceData=null;keys.clear();eventToast='Recompensa pulada; usos restantes: '+uses.skip;}
      else choiceData=choiceLevel===0?rollMegaLoot():rollLevelOffers();
    }
    function openKakashi(event:(typeof events)[number]){
      const copyable=Object.entries(knownItems).filter(([name,count])=>count>0&&ITEM_BY_NAME[name]&&count<ITEM_BY_NAME[name].max).map(([name])=>ITEM_BY_NAME[name]);
      if(!copyable.length){eventToast=Object.keys(knownItems).length?'Arsenal da Tenten: todos os itens da sua bolsa já estão no limite.':'Arsenal da Tenten: você ainda não tem itens na bolsa para copiar.';return;}
      const order=['Lendário','Épico','Raro','Incomum','Comum'];copyable.sort((a,b)=>order.indexOf(a.rarity)-order.indexOf(b.rarity));
      choiceLevel=-1;banning=false;kakashiEvent=event;keys.clear();
      choiceData=copyable.map((item,i)=>({id:'copy-'+item.id+'-'+i,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:'Copiar: '+item.description+' Você tem '+knownItems[item.name]+'/'+item.max+' → '+(knownItems[item.name]+1)+'.'}));
      eventToast='Arsenal da Tenten: escolha um item da sua bolsa para a Tenten forjar uma cópia.';
    }
    // Ebisu (choiceLevel −3) e Iruka (−4 menu, −5 pergaminho lendário): NPCs não jogáveis (src/game/npcs.ts), 1 uso por zona.
    // Ganhos e custos entram em runBuffs, que refreshStats soma do zero a cada quadro (sem buff residual). Cancelar não gasta o evento
    // e mantém as mesmas ofertas (reabrir não sorteia de novo).
    let npcEvent:(typeof events)[number]|null=null,ebisuDeals:StatDeal[]|null=null,irukaLesson:StatDeal|null=null,irukaScroll:StatDeal[]|null=null;
    const npcDeals:{source:string;deal:StatDeal}[]=[];
    const canLose=(key:StatKey,cost:number)=>(stats.extra[key]||0)-cost>=NPC_RULES.costFloor;
    const dealCard=(id:string,d:StatDeal,rarity:Rarity,icon:string,note:string):LevelOffer=>({id,kind:'stat',name:`+${pctText(d.value)} ${dealLabel(d.key)}`,rarity,icon,deal:d,description:`Ganha +${pctText(d.value)} de ${dealLabel(d.key)}.`+(d.costKey&&d.cost?` Em troca, perde −${pctText(d.cost)} de ${dealLabel(d.costKey)}${note}.`:` Sem custo.`)+' Vale até o fim da run.'});
    function applyDeal(source:string,d:StatDeal){for(const [key,value] of Object.entries(dealBonuses(d)))runBuffs[key as keyof Bonuses]=(runBuffs[key as keyof Bonuses]||0)+(value as number);npcDeals.push({source,deal:d});refreshStats(true);playSfx('pickup');}
    function finishNpc(message:string){if(npcEvent){npcEvent.active=false;if(npcEvent.id==='ebisu')ebisuDeals=null;else{irukaLesson=null;irukaScroll=null;}}npcEvent=null;choiceData=null;keys.clear();eventToast=message;}
    function openEbisu(event:(typeof events)[number]){
      ebisuDeals??=rollEbisuDeals(canLose);if(!ebisuDeals.length){ebisuDeals=null;eventToast='Ebisu: nenhum atributo seu aguenta o custo da troca agora.';return false;}
      npcEvent=event;choiceLevel=-3;banning=false;keys.clear();
      choiceData=ebisuDeals.map((d,i)=>dealCard('ebisu-'+i,d,'Épico','🕶',' (10% a mais que o ganho)'));
      eventToast='Ebisu: treino de elite. Todo ganho cobra 10% a mais em outro atributo.';return true;
    }
    function irukaMenu():LevelOffer[]{
      irukaLesson??=rollIrukaLesson();const joined=allies.includes('iruka'),full=allyActors.length>=stats.supportSlots;
      return [
        {...dealCard('iruka-lesson',irukaLesson,'Incomum','📖',''),name:'Lição rápida · '+dealText(irukaLesson)},
        {id:'iruka-scroll',kind:'stat',name:'Pergaminho lendário',rarity:'Lendário',icon:'📜',description:`Abre 3 atributos de nível lendário (valor máximo). Você escolhe 1 e perde −${pctText(NPC_RULES.irukaLegendaryCost)} de outro atributo seu, mostrado na carta antes de confirmar.`},
        {id:'iruka-ally',kind:'stat',name:'Iruka entra na equipe',rarity:'Raro',icon:'🧑‍🏫',disabled:joined?'Iruka já está na equipe.':full?`Vagas de suporte cheias (${allyActors.length}/${stats.supportSlots}).`:undefined,description:`Iruka vira ajudante com afinidade máxima: passiva Lições da Academia +${pctText(NPC_RULES.irukaAllyExp)} de experiência (× força de suporte) e ataque com kunai. Não é shinobi jogável. Ocupa 1 vaga de suporte (${allyActors.length}/${stats.supportSlots}).`},
      ];
    }
    function openIruka(event:(typeof events)[number]){npcEvent=event;choiceLevel=-4;banning=false;keys.clear();choiceData=irukaMenu();eventToast='Iruka: escolha uma das 3 aulas.';return true;}
    function openIrukaScroll(){irukaScroll??=rollIrukaLegendary(canLose);if(!irukaScroll.length){irukaScroll=null;eventToast='Iruka: nenhum atributo seu aguenta o custo de 20% agora.';return;}choiceLevel=-5;choiceData=irukaScroll.map((d,i)=>dealCard('iruka-scroll-'+i,d,'Lendário','📜',''));keys.clear();}
    function chooseNpcOffer(offer:LevelOffer){
      if(choiceLevel===-6&&offer.merge){applyMerge(offer.merge);return;}
      if(offer.disabled){eventToast='Iruka: '+offer.disabled;return;}
      if(choiceLevel===-3&&offer.deal){applyDeal('Ebisu',offer.deal);finishNpc('Ebisu: '+dealText(offer.deal)+'.');return;}
      if(choiceLevel===-5&&offer.deal){applyDeal('Iruka · pergaminho lendário',offer.deal);finishNpc('Iruka: '+dealText(offer.deal)+'.');return;}
      if(choiceLevel!==-4)return;
      if(offer.id==='iruka-scroll'){openIrukaScroll();return;}
      if(offer.id==='iruka-ally'){if(!recruitAlly('iruka')){eventToast='Iruka: não há vaga de suporte livre.';choiceData=irukaMenu();return;}finishNpc(`Iruka entrou na equipe: +${pctText(NPC_RULES.irukaAllyExp*stats.allyBuff)} de experiência.`);return;}
      if(offer.deal){applyDeal('Iruka · lição',offer.deal);finishNpc('Iruka: '+dealText(offer.deal)+'.');}
    }
    // Naruto Totem: evento fixo no minuto 7 (7:00 → 6:00 do relógio regressivo). Invoca clones das sombras que correm até o jogador.
    let totem:Enemy|null=null,totemBar:ReturnType<typeof createTotemBar>|null=null,totemSpawned=false,totemDiscovered=false,totemCloneTimer=0,totemResult:''|'derrotado'|'expirou'='',pendingLevels=0;
    const totemPos=new THREE.Vector3();
    function chooseLevelOffer(index:number){const offer=choiceData?.[index];if(!offer||offer.disabled)return;
      if(choiceLevel===-8){buyMerchant(index,offer);return;}
      if(choiceLevel===-9){const item=ITEM_BY_NAME[offer.name];if(item&&(knownItems[item.name]||0)<item.max){grantItem(item.name);playSfx('pickup');}else{const value=saleValue();runMoney+=value;eventToast=offer.name+' já está no limite: convertido em '+compactNumber(value)+' Ryu';}finishRouletteItem();saveRun();return;}
      if(choiceLevel===-7){resolveReplace(offer);return;}
      if(choiceLevel<=-3){chooseNpcOffer(offer);return;}
      if(choiceLevel===-2){forgetAtIchiraku(offer);return;}
      if(choiceLevel===-1){grantItem(offer.name);if(kakashiEvent)kakashiEvent.active=false;kakashiEvent=null;choiceData=null;keys.clear();eventToast='Tenten forjou uma cópia de '+offer.name+' (agora '+(knownItems[offer.name]||0)+'/'+(ITEM_BY_NAME[offer.name]?.max??'?')+').';playSfx('pickup');return;}
      if(banning){if(offer.kind==='stat'){eventToast='Vitalidade é a opção de reserva e não pode ser banida.';return;}banned.add(offer.name);uses.ban--;banning=false;eventToast=offer.name+' banido da run em todos os níveis e raridades';const cards=choiceLevel===0?rollMegaLoot():rollLevelOffers();choiceData=cards?.length?cards:null;snapshotTimer=0;return;}if(offer.kind==='skill'){if(familyOf(heroId)==='naruto'&&offer.name==='Invocação do Sapo'&&!skillLevels[offer.name]&&!hiddenEffects)showGamabunta(player.position,player.position.clone().add(heading),true);if(!hero.skills.includes(offer.name))addResearch(offer.name,researchGain(skillLevels[offer.name]?RESEARCH_RULES.perLevel:RESEARCH_RULES.perLearn,permanent['Pesquisa']||0));skillLevels[offer.name]=Math.min(9+ex('skillCap'),(skillLevels[offer.name]||0)+1);const previous=growth[offer.name]??{...NO_GROWTH};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])previous[key]+=offer.growth?.[key]||0;growth[offer.name]=previous;}if(offer.kind==='pill'&&grantPill(knownPills,offer.name,ex('pillCap')))pillQuality[offer.name]=(pillQuality[offer.name]||0)+PILL_RARITY_POWER[offer.rarity]-1;if(offer.kind==='item')grantItem(offer.name);if(offer.kind==='stat'&&offer.bonus){for(const key of Object.keys(offer.bonus) as (keyof Bonuses)[])runBuffs[key]=(runBuffs[key]||0)+(offer.bonus[key]||0);}refreshStats(true);choiceData=null;keys.clear();}
    let yaw=Math.PI/4, pitch=.74, zoom=currentSettings().cameraDistance, spawnTimer=1,megaSchedule=rollMegaSchedule(),megaElitesSpawned=0,accountEncounters=0,snapshotTimer=0,chakra=0,hp=stats.maxHp,level=1,xp=0,xpNext=30,kills=0,runMoney=0,frames=0,fps=0,fpsTimer=0,autoUlt=currentSettings().autoUltimate,last=performance.now(),elapsed=0,eventToast='',zoneDifficulty=1,xpMultiplier=1,lootMultiplier=1;
    const enemyWeapons=['Kunai','Shuriken','Shuriken Fūma'] as const;
    const enemyShots:{object:THREE.Object3D;direction:THREE.Vector3;life:number;speed:number;damage:number;radius:number}[]=[];
    const shadowClones:{sprite:THREE.Sprite;motion:ReturnType<typeof createPlayerMotion>;target:Enemy;life:number;technique:Technique;growth:SkillGrowth;ally:boolean;level:number}[]=[];
    const effects:THREE.Mesh[]=[],visuals:{object:THREE.Object3D;life:number;tick?:(dt:number)=>void}[]=[],numbers:{sprite:THREE.Sprite;life:number}[]=[];let currentPing:{x:number;z:number}|null=null;
    // ───── Rota do mapa (M/Tab) ─────
    // Um único alvo de rastreio por vez: ícone visto (evento/NPC, mega elite/guardião/totem, recompensa no chão) OU ping livre.
    // Escolher outro alvo substitui o anterior; repetir o mesmo alvo limpa. A < ROUTE_ARRIVE m: "Chegou!" e a rota some.
    // Se o alvo deixa de existir (evento usado, inimigo derrotado, recompensa coletada), a rota é limpa com aviso.
    const ROUTE_ARRIVE=3;
    /** Shinobi para selar: no máximo 1 por run (o 1º encontro especial). Em testes automáticos (?test) não surge sozinho. */
    let targetYaw=yaw,targetPitch=pitch,targetZoom=zoom;
    let forceElite=false,nextAccountAt=0,rightDownX=0,rightDownY=0;
    // ───── Alvo fixo (clique com o botão direito, sem arrastar) ─────
    // Prioridade: guardião/chefe > Mega Elite / Shinobi para selar > elite amarelo > maior HP, entre os inimigos visíveis até 30 m.
    // As técnicas miram o alvo fixo quando ele está no alcance; clicar de novo solta. Mover o mouse gira a câmera.
    let lockedTarget:Enemy|null=null;
    const targetMarker=new THREE.Mesh(new THREE.RingGeometry(.9,1.15,32),new THREE.MeshBasicMaterial({color:'#ff3355',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));targetMarker.rotation.x=-Math.PI/2;targetMarker.visible=false;
    const targetPriority=(e:Enemy)=>e.guardian||e.boss?4:e.megaElite||e.account?3:e.elite?2:1;
    function toggleTargetLock(){if(lockedTarget){lockedTarget=null;eventToast='Alvo solto.';return;}const visible=enemyList.filter(e=>!e.clone&&viewFrustum.containsPoint(e.sprite.position)&&Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<30);visible.sort((a,b)=>targetPriority(b)-targetPriority(a)||b.hp-a.hp);lockedTarget=visible[0]??null;eventToast=lockedTarget?'Alvo fixado: '+(lockedTarget.heroId?HERO_BY_ID[lockedTarget.heroId]?.name??'inimigo':lockedTarget.elite?'elite':'inimigo')+' (clique direito solta)':'Nenhum inimigo visível para fixar.';}
    function updateTargetMarker(){if(lockedTarget&&!enemyList.includes(lockedTarget))lockedTarget=null;if(!targetMarker.parent)scene.add(targetMarker);targetMarker.visible=!!lockedTarget;if(lockedTarget){const p=lockedTarget.sprite.position;targetMarker.position.set(p.x,terrainHeight(p.x,p.z)+.12,p.z);targetMarker.rotation.z+=.04;const s=lockedTarget.megaElite?1.6:lockedTarget.elite?1.25:1;targetMarker.scale.set(s,s,s);}}const accountTried=new Set<string>();
    /** Shinobis de conta que podem surgir agora (missão cumprida nesta run; versões só jogando com a versão anterior `playWith`). */
    function accountCandidates(){return HEROES.filter(h=>{const m=UNLOCK_MISSIONS[h.id];return m&&!accountTried.has(h.id)&&m.map===mapId&&m.difficulty===mission&&elapsed>=m.minute*60&&kills>=m.kills&&(!m.playWith||m.playWith===heroId)&&missingRequirements(h.id,sealedHeroes()).length===0&&!unlockedHeroes().has(h.id)&&h.id!==heroId&&!allies.includes(h.id);});}const testRun=import.meta.env.DEV&&new URLSearchParams(location.search).has('test');
    /** Frustum da câmera no último quadro: o mapa só mostra o que está/esteve na tela. */
    const viewFrustum=new THREE.Frustum();const perfMonitor=createPerfMonitor();
    /** Pontos de inimigos para minimapa/mapa: só os visíveis, fundidos em células de MAP_DOT_CELL m e limitados a MAP_DOT_CAP
     *  (antes: 1 elemento React por inimigo a cada 0,2 s — com 1600 inimigos isso dominava o tempo de quadro). */
    const MAP_DOT_CELL=1.5,MAP_DOT_CAP=300,mapDotCells=new Set<number>();
    function mapEnemyDots(){mapDotCells.clear();const out:{x:number;z:number}[]=[];for(const e of enemyList){const p=e.sprite.position;if(!viewFrustum.containsPoint(p))continue;const key=(Math.round(p.x/MAP_DOT_CELL)+4096)*8192+Math.round(p.z/MAP_DOT_CELL)+4096;if(mapDotCells.has(key))continue;mapDotCells.add(key);out.push({x:p.x,z:p.z});if(out.length>=MAP_DOT_CAP)break;}return out;}
    type RouteTarget={kind:RouteView['kind'];id:string;name:string;x:number;z:number};
    let route:RouteTarget|null=null,routeNotice:{text:string;kind:'arrived'|'lost'|'set';until:number}|null=null,megaUid=0;
    const routeProbe=new THREE.Vector3();
    const megaName=(e:Enemy)=>(e.guardian?'Guardião · ':e.account?'Shinobi para selar · ':'Mega Elite · ')+(HERO_BY_ID[e.heroId??'']?.name??'?');
    const routeDistance=(t:{x:number;z:number})=>Math.hypot(t.x-player.position.x,t.z-player.position.z);
    const notifyRoute=(text:string,kind:'arrived'|'lost'|'set')=>{routeNotice={text,kind,until:performance.now()+(kind==='set'?1800:2600)};eventToast=text;snapshotTimer=0;};
    /** Alvo visto e ainda existente pelo id do mapa; null se sumiu ou nunca foi visto. */
    function findRouteTarget(id:string):RouteTarget|null{
      if(id==='portal')return portal?{kind:'event',id,name:portalTitle(portal.kind),x:portal.x,z:portal.z}:null;
      if(id==='ping')return currentPing?{kind:'ping',id,name:'Ping',x:currentPing.x,z:currentPing.z}:null;
      if(id==='naruto-totem')return totem&&totemDiscovered?{kind:'enemy',id,name:'Naruto Totem',x:totem.sprite.position.x,z:totem.sprite.position.z}:null;
      if(id.startsWith('mega-')){const e=enemyList.find(e=>e.uid!==undefined&&'mega-'+e.uid===id&&e.seen);return e?{kind:'enemy',id,name:megaName(e),x:e.sprite.position.x,z:e.sprite.position.z}:null;}
      if(id.startsWith('pickup-')){const p=pickups.find(p=>p.id===id&&p.active&&p.discovered);return p?{kind:'pickup',id,name:p.name,x:p.x,z:p.z}:null;}
      const ev=events.find(e=>e.id===id&&e.discovered&&e.active);return ev?{kind:'event',id,name:ev.name,x:ev.x,z:ev.z}:null;
    }
    function clearRoute(text?:string,kind:'arrived'|'lost'|'set'='lost'){if(route?.kind==='ping')currentPing=null;route=null;if(text)notifyRoute(text,kind);snapshotTimer=0;}
    /** Define a rota (id do marcador); o mesmo id de novo ou null limpa. */
    function setRoute(id:string|null){
      if(!id||route?.id===id){if(route)clearRoute('Rota limpa.','lost');return false;}
      const t=findRouteTarget(id);if(!t){eventToast='Esse alvo não está disponível para rota.';snapshotTimer=0;return false;}
      if(route?.kind==='ping'&&t.kind!=='ping')currentPing=null;
      route=t;notifyRoute(`Rota para ${t.name} · ${Math.round(routeDistance(t))} m`,'set');return true;
    }
    /** Ping livre no mapa: marca 📍 e vira o alvo da rota (substitui rota de ícone). */
    function setPingRoute(x:number,z:number){currentPing={x:THREE.MathUtils.clamp(x,-WORLD_LIMIT,WORLD_LIMIT),z:THREE.MathUtils.clamp(z,-WORLD_LIMIT,WORLD_LIMIT)};route={kind:'ping',id:'ping',name:'Ping',...currentPing};notifyRoute(`Ping marcado · ${Math.round(routeDistance(route))} m`,'set');}
    /** Por quadro: acompanha alvos móveis, detecta chegada e alvo que deixou de existir. */
    function updateRoute(){
      if(!route)return;
      if(route.kind!=='ping'){const t=findRouteTarget(route.id);
        if(!t){const name=route.name,kind=route.kind;
          // Consumido com o jogador ao lado (ex.: E no evento antes de cruzar os 3 m) conta como chegada.
          if(routeDistance(route)<=4.2){clearRoute('Chegou! '+name,'arrived');playSfx('pickup');}
          else clearRoute(kind==='enemy'?`${name} foi derrotado ou sumiu: rota limpa.`:kind==='pickup'?`${name} foi coletado: rota limpa.`:`${name} já foi usado: rota limpa.`,'lost');
          return;}
        route.x=t.x;route.z=t.z;}
      if(routeDistance(route)<ROUTE_ARRIVE){const name=route.name;clearRoute('Chegou! '+(route.kind==='ping'?'Ping alcançado':name),'arrived');playSfx('pickup');}
    }
    function routeView():RouteView|null{if(!route)return null;routeProbe.set(route.x,terrainHeight(route.x,route.z)+1,route.z).project(camera);return{id:route.id,kind:route.kind,name:route.name,x:route.x,z:route.z,distance:Math.round(routeDistance(route)*10)/10,screen:{x:routeProbe.x,y:routeProbe.y}};}
    /** Marcadores do mapa: só o que já foi visto em tela. */
    function mapMarkers():WorldSnapshot['events']{return [
      ...(portal?[{id:'portal',name:portalTitle(portal.kind),x:portal.x,z:portal.z,icon:portal.kind==='arena'?'bijuu-portal':'🌀',kind:'event' as const,active:true}]:[]),
      ...events.filter(e=>e.discovered).map(e=>({id:e.id,name:e.name,x:e.x,z:e.z,icon:e.icon,kind:'event' as const,active:e.active})),
      ...(totem&&totemDiscovered?[{id:'naruto-totem',name:'Naruto Totem',x:totem.sprite.position.x,z:totem.sprite.position.z,icon:'🍥',kind:'enemy' as const,portrait:'naruto',active:true}]:[]),
      ...enemyList.filter(e=>e.megaElite&&e.seen&&e.uid!==undefined).map(e=>({id:'mega-'+e.uid,name:megaName(e),x:e.sprite.position.x,z:e.sprite.position.z,icon:e.guardian?'👑':e.account?'🔓':'💀',kind:'enemy' as const,portrait:e.heroId,guardian:!!e.guardian,active:true}))];}
    let quickMapHeld=false;
    // CHOICE_GUARD: só aceita escolha depois que o mesmo conjunto de cartas ficou armSeconds na tela. Testes automáticos
    // (?test sem &guard=1) dispensam a espera para não depender do FPS do navegador headless.
    let guardedChoice:LevelOffer[]|null=null,guardedSince=0;const guardOff=testPointer&&!params.has('guard');
    const choiceArmed=()=>{const now=performance.now();if(choiceData!==guardedChoice){guardedChoice=choiceData;guardedSince=now;return guardOff;}return guardOff||now-guardedSince>=CHOICE_GUARD.armSeconds*1000;};
    const recaptureAfterChoice=()=>{if(!testPointer&&!choiceData&&!roulette&&!sealing&&!pausedRef.current&&!defeated&&!victory)captureGamePointer();};
    const onKeyDown=(e:KeyboardEvent)=>{const rawKey=e.key.toLowerCase(),key=rawKey==='escape'?rawKey:translateKey(rawKey);if(!key)return; if(e.target instanceof HTMLElement&&e.target.matches('input,select,textarea'))return;if(e.repeat&&['m','tab','p','e','r','g','y','h'].includes(key))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(key))e.preventDefault();if(!enabledRef.current||defeated||victory||debugOpenRef.current)return;if(document.querySelector('.game-panel-backdrop.over-choice')){if(key==='escape'||key==='p')onPanelRef.current(null);return;}if(key==='p'&&(sealing||choiceData||roulette)){if(sealing?.phase!=='sealing')onPanelRef.current('sheet');return;}if(roulette)return;/* Roleta aberta: TsunadeRoulette.tsx trata E/Esc/F/X. */if(sealing){if(key==='e'&&sealing.phase==='ready'&&sealing.account){sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;eventToast='O selo está prendendo o chakra do shinobi…';playSfx('ultimate');}else if(key==='g'&&sealing.phase==='ready'&&sealing.account){const lost=sealing.target;nextSeal();eventToast=lost+' escapou: não foi desbloqueado na conta.';}else if(key==='e'&&sealing.phase==='ready'){if(allies.includes(sealing.heroId)){eventToast=sealing.target+' já está na equipe: G para receber um item.';return;}if(allyActors.length>=stats.supportSlots){openReplace(sealing);return;}sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;eventToast='O selo está prendendo o chakra do inimigo…';playSfx('ultimate');}else if(key==='g'&&sealing.phase==='ready'){spawnPickup('sealDrop',player.position.x,player.position.z);nextSeal();eventToast='Selamento recusado: recolha o drop do mega elite para escolher um item';}else if((key==='enter'||key==='e')&&sealing.phase==='complete'){nextSeal();if(!sealing&&!replaceCandidate)eventToast='Shinobi selado e adicionado à equipe desta missão';}recaptureAfterChoice();return;}if(choiceData){if(key==='escape'){if(choiceLevel===-8&&!document.querySelector('.game-panel-backdrop')){rewardAction('skip');recaptureAfterChoice();}else onPanelRef.current(null);return;}if(e.repeat||pausedRef.current&&document.querySelector('.game-panel-backdrop'))return;if(!choiceArmed())return;if(key==='v')sellLoot();else if(key==='e'&&choiceLevel===-9)chooseLevelOffer(0);else if(key==='f')rewardAction('reroll');else if(key==='x')rewardAction('skip');else if(key==='z')rewardAction('ban');else if(/^[1-9]$/.test(key))chooseLevelOffer(Number(key)-1);recaptureAfterChoice();return;}if(key==='m'){quickMapHeld=false;onPanelRef.current('map');return;}if(key==='tab'){if(!pausedRef.current){quickMapHeld=true;onPanelRef.current('quickmap');}return;}if(key==='p'){quickMapHeld=false;onPanelRef.current('sheet');return;}if(key==='escape'&&quickMapHeld){quickMapHeld=false;onPanelRef.current(null);return;}if(pausedRef.current){if(key==='escape')onPanelRef.current(null);return;}if(key==='g'){/* G marca 📍 aqui sem rota; se a rota era um ping, ela é substituída. */if(route?.kind==='ping')clearRoute();currentPing={x:player.position.x,z:player.position.z};return;}if(key==='e'){interact();return;}if(key==='escape'){onPanelRef.current('pause');return;}if(!testPointer&&!pointerLocked())return;if(key==='h'){hiddenEffects=!hiddenEffects;for(const effect of effects)effect.visible=!hiddenEffects;for(const shot of shots)shot.mesh.visible=!hiddenEffects;for(const fx of visuals)fx.object.visible=!hiddenEffects;for(const n of numbers)n.sprite.visible=!hiddenEffects;return;}if(key==='y'){onToggleAuto();return;}if(key==='r'){castUltimate();return;}if(key===' '){if(sandCloud)keys.add(' ');if(!e.repeat&&!jumpTime&&!slideTime){jumpTime=jumpDuration;sandGlideLeft=sandCloud ? .9 : 0;}return;}if(key==='shift'){if(!e.repeat&&!jumpTime&&!slideRecovery){readMovement(dashHeading);if(dashHeading.lengthSq())dashHeading.normalize();else dashHeading.copy(heading);slideTime=slideDuration;slideRecovery=.9;invulnerability=Math.max(invulnerability,.14);}return;}keys.add(key);};
    // Ultimate automática: tecla Y ou clique no selo AUTO do botão R (evento shinobi-toggle-auto-ult).
    function onToggleAuto(){if(enabledRef.current&&!defeated&&!victory)autoUlt=!autoUlt;}window.addEventListener('shinobi-toggle-auto-ult',onToggleAuto);
    const onKeyUp=(e:KeyboardEvent)=>{const raw=e.key.toLowerCase(),key=translateKey(raw)||raw;keys.delete(key);keys.delete(raw);if(key==='tab'&&quickMapHeld){quickMapHeld=false;onPanelRef.current(null);}};
    let lastPointer: { x:number; y:number }|undefined;
    const resetPointer=()=>{lastPointer=undefined;};
    const onBlur=()=>{keys.clear();quickMapHeld=false;resetPointer();moving=false;if(enabledRef.current&&!pausedRef.current&&!defeated&&!victory&&!choiceData&&!roulette&&!sealing){pausedRef.current=true;onPanelRef.current('pause');}};
    const onHidden=()=>{if(document.hidden)onBlur();};document.addEventListener('visibilitychange',onHidden);runCleanups.push(()=>document.removeEventListener('visibilitychange',onHidden));
    const pointerLocked=()=>Boolean(pointerSurface&&document.pointerLockElement===pointerSurface);
    const cameraCanMove=()=>enabledRef.current&&!debugOpenRef.current&&!pausedRef.current&&!choiceData&&!roulette&&!sealing&&!defeated&&!victory;
    const turnCamera=(dx:number,dy:number)=>{
      const settings=currentSettings();
      targetYaw-=dx*.006*settings.mouseSensitivity;
      targetPitch=THREE.MathUtils.clamp(targetPitch+dy*.004*settings.mouseSensitivity*(settings.invertY?-1:1),.12,1.48);
    };
    const onLockedMove=(e:MouseEvent)=>{if(pointerLocked()&&cameraCanMove())turnCamera(e.movementX,e.movementY);};
    const onLockedRight=(e:MouseEvent)=>{if(pointerLocked()&&e.button===2&&cameraCanMove())toggleTargetLock();};
    const onLockedContext=(e:MouseEvent)=>{if(pointerLocked())e.preventDefault();};
    let hadLock=pointerLocked();
    const onLockChange=()=>{const locked=pointerLocked();if(hadLock&&!locked&&cameraCanMove()){keys.clear();quickMapHeld=false;pausedRef.current=true;onPanelRef.current('pause');}hadLock=locked;resetPointer();};
    document.addEventListener('pointerlockchange',onLockChange);
    document.addEventListener('mousemove',onLockedMove);
    document.addEventListener('mouseup',onLockedRight);
    document.addEventListener('contextmenu',onLockedContext);
    runCleanups.push(()=>{document.removeEventListener('pointerlockchange',onLockChange);document.removeEventListener('mousemove',onLockedMove);document.removeEventListener('mouseup',onLockedRight);document.removeEventListener('contextmenu',onLockedContext);});
    const ichirakuRay=new THREE.Raycaster(), clickPoint=new THREE.Vector2();
    const clickIchiraku=(e:MouseEvent)=>{
      if(!cameraCanMove()||e.button!==0||!teuchi.visible||!ichiraku.active||Math.hypot(player.position.x-ichiraku.x,player.position.z-ichiraku.z)>3.6)return false;
      const bounds=container.getBoundingClientRect();
      clickPoint.set(pointerLocked()?0:2*(e.clientX-bounds.left)/bounds.width-1,pointerLocked()?0:1-2*(e.clientY-bounds.top)/bounds.height);
      ichirakuRay.setFromCamera(clickPoint,camera);
      if(!ichirakuRay.intersectObject(ichiraku.obj,false).length&&!ichirakuRay.intersectObject(teuchi,false).length)return false;
      openIchiraku();
      return true;
    };
    const onLockedClick=(e:MouseEvent)=>{if(pointerLocked())clickIchiraku(e);};
    document.addEventListener('click',onLockedClick);
    runCleanups.push(()=>document.removeEventListener('click',onLockedClick));
    const onDown=(e:PointerEvent)=>{if(e.button===0&&!pointerLocked()&&cameraCanMove()&&!clickIchiraku(e))captureGamePointer();if(e.button===2){rightDownX=e.clientX;rightDownY=e.clientY;}};
    const onMove=(e:PointerEvent)=>{
      const previous=lastPointer;
      lastPointer={x:e.clientX,y:e.clientY};
      if(!testPointer||!previous||e.pointerType!=='mouse'||pointerLocked()||!cameraCanMove())return;
      turnCamera(e.clientX-previous.x,e.clientY-previous.y);
    };
    const onUp=(e:PointerEvent)=>{if(!pointerLocked()&&e.button===2&&Math.hypot(e.clientX-rightDownX,e.clientY-rightDownY)<6)toggleTargetLock();};const onContext=(e:MouseEvent)=>e.preventDefault();
    const onWheel=(e:WheelEvent)=>{if(!cameraCanMove())return;targetZoom=THREE.MathUtils.clamp(targetZoom+Math.sign(e.deltaY)*1.6,10,32);};
    const onLockedWheel=(e:WheelEvent)=>{if(pointerLocked())onWheel(e);};
    document.addEventListener('wheel',onLockedWheel,{passive:true});runCleanups.push(()=>document.removeEventListener('wheel',onLockedWheel));
    const onPing=(event:Event)=>{const p=(event as CustomEvent<{x:number;z:number}>).detail;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z))setPingRoute(p.x,p.z);};window.addEventListener('shinobi-ping',onPing);
    // Mapa: clique num ícone visto → rota (mesmo id de novo ou id null limpa).
    const onRoute=(event:Event)=>{const d=(event as CustomEvent<{id:string|null}>).detail;if(!enabledRef.current||defeated||victory)return;setRoute(d?.id??null);};window.addEventListener('shinobi-route',onRoute);
    // Clique numa carta (qualquer quantidade de cartas, ex.: cópia do Kakashi com muitos itens).
    const onChoose=(event:Event)=>{const detail=(event as CustomEvent<number|{index:number;id:string}>).detail;const index=typeof detail==='number'?detail:detail?.index??-1;if(detail&&typeof detail==='object'&&choiceData?.[index]?.id!==detail.id)return;if(!enabledRef.current||defeated||victory||!choiceData||sealing||!Number.isInteger(index))return;if(document.querySelector('.game-panel-backdrop'))return;if(!choiceArmed())return;chooseLevelOffer(index);recaptureAfterChoice();};window.addEventListener('shinobi-choose',onChoose);
    const onTrade=(event:Event)=>{if(!enabledRef.current||defeated||victory||!choiceData||sealing||document.querySelector('.game-panel-backdrop'))return;const action=(event as CustomEvent<string>).detail;if(action==='sell')sellLoot();else if(choiceLevel===-8&&action==='reroll')rerollMerchant();else if(choiceLevel===-8&&action==='exit')rewardAction('skip');recaptureAfterChoice();};
    window.addEventListener('shinobi-trade',onTrade);runCleanups.push(()=>window.removeEventListener('shinobi-trade',onTrade));
    // Roleta da Tsunade: a UI pede giro/saída por evento síncrono e lê a resposta em detail.result.
    const onRoulette=(event:Event)=>{const d=(event as CustomEvent<{action:string;result?:unknown}>).detail;if(!d||!enabledRef.current||defeated||victory)return;if(d.action==='spin')d.result=spinRoulette();else if(d.action==='exit'){d.result=closeRoulette();recaptureAfterChoice();}else if(d.action==='view')d.result=rouletteView();};window.addEventListener('shinobi-roulette',onRoulette);
    window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);
    container.addEventListener('pointerdown',onDown);container.addEventListener('pointermove',onMove);container.addEventListener('pointerup',onUp);container.addEventListener('pointercancel',resetPointer);container.addEventListener('pointerleave',resetPointer);container.addEventListener('contextmenu',onContext);container.addEventListener('wheel',onWheel,{passive:true});
    let aspect=1;
    const projectCamera=()=>{camera.left=-zoom*aspect/2;camera.right=zoom*aspect/2;camera.top=zoom/2;camera.bottom=-zoom/2;camera.updateProjectionMatrix();};
    const resize=()=>{const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;aspect=w/h;projectCamera();renderer.setSize(w,h);};resize();const observer=new ResizeObserver(resize);observer.observe(container);
    const v1=new THREE.Vector3(),v2=new THREE.Vector3(),dir=new THREE.Vector3(),offset=new THREE.Vector3();
    function readMovement(out:THREE.Vector3) {
      v1.set(-Math.sin(yaw),0,-Math.cos(yaw));
      v2.set(Math.cos(yaw),0,-Math.sin(yaw));
      out.set(0,0,0);
      if(keys.has('w')||keys.has('arrowup'))out.add(v1);
      if(keys.has('s')||keys.has('arrowdown'))out.sub(v1);
      if(keys.has('d')||keys.has('arrowright'))out.add(v2);
      if(keys.has('a')||keys.has('arrowleft'))out.sub(v2);
    }
    const addRing=(position:THREE.Vector3,color:string,size:number)=>{if(hiddenEffects)return;const ring=new THREE.Mesh(new THREE.TorusGeometry(size,.11,6,24),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.copy(position);ring.position.y=terrainHeight(position.x,position.z)+.18;scene.add(ring);effects.push(ring);};
    // Chefes (mega elites e guardiões): barra de vida 3D e técnicas do personagem com aviso no chão.
    let playerSlow=0;
    /** Todo dano recebido passa aqui: escudo, evasão, armadura (+Postura de Pedra), espinhos, adrenalina, fumaça, gelo de Haku e ressurreição. */
    function damagePlayer(raw:number,attacker?:Enemy,slow=0){
      if(invulnerability>0||defeated||debugState.god)return false;
      if(ex('shield')>0&&shieldReady){shieldReady=false;shieldTimer=14;invulnerability=.25;addRing(player.position,'#7fd3ff',1.1);eventToast='Escudo de Chakra bloqueou o golpe!';return false;}
      if(Math.random()<stats.evasion)return false;
      playerMotion.hurt();hp=Math.max(0,hp-incomingDamage(raw,stats.armor*(ex('stance')>0&&stillTime>.5?1.3:1)));invulnerability=.25;timeSinceHit=0;addRing(player.position,'#ff535a',.8);
      if(slow>0){playerSlow=Math.max(playerSlow,slow);eventToast='Você foi atingido e está lento!';}
      if(attacker&&ex('thorns')>0&&enemyList.includes(attacker))takeDamage(attacker,ex('thorns'),'#ffd27a',false,0,'Espinhos');
      if(ex('rush')>0)rushTimer=3;
      if(ex('smoke')>0&&Math.random()<ex('smoke')){invulnerability=1.5;eventToast='Fumaça densa: invisível por 1,5 s';}
      if(ex('freezeOnHit')>0&&freezeCd<=0){freezeCd=20;for(const e of enemyList)if(Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<5){e.control='Paralisar';e.controlTime=3;}addRing(player.position,'#9fe7ff',5);eventToast='Espelho de Gelo: inimigos congelados!';}
      if(hp<=0){
        if(revives60<ex('revive60')){revives60++;hp=stats.maxHp*.6;invulnerability=2.5;addRing(player.position,'#b28bff',4);eventToast='Rinne Tensei: você voltou com 60% do HP!';}
        else if(revives35<ex('revive35')){revives35++;hp=stats.maxHp*.35;invulnerability=2.5;addRing(player.position,'#fff195',4);eventToast='Pergaminho de Ressurreição: você voltou com 35% do HP!';}
        else{defeated=true;keys.clear();eventToast='Missão encerrada: seu shinobi caiu.';}
      }
      return true;
    }
    /** Pergaminho Chidori Nagashi: a cada 2,5 s, raios em 3 (+1 por cópia extra) inimigos a até 8 m; 30% de paralisar 1 s. */
    function castBolts(){
      const count=2+ex('bolts'),damage=stats.damage*1.3*damageMultiplier*tune().playerDamage;
      const near=enemyList.filter(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<8).sort((a,b)=>a.sprite.position.distanceToSquared(player.position)-b.sprite.position.distanceToSquared(player.position)).slice(0,count);
      for(const e of near){addRing(e.sprite.position,'#ffe86b',.6);if(Math.random()<.3){e.control='Paralisar';e.controlTime=1;}takeDamage(e,damage,'#fff7a8',false,0,'Chidori Nagashi');}
    }
    /** Chamas de Amaterasu: a cada 6 s, o inimigo mais forte a até 12 m sofre um golpe forte e queima; explosão de 2,5 m em volta. */
    function castBeam(){
      const near=enemyList.filter(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<12);
      const target=near.sort((a,b)=>b.hp-a.hp)[0];if(!target)return;
      const damage=stats.damage*4*ex('beam')*damageMultiplier*tune().playerDamage,center=target.sprite.position.clone();
      addRing(center,'#2a1630',2.5);
      for(const e of [...enemyList]){const d=Math.hypot(e.sprite.position.x-center.x,e.sprite.position.z-center.z);if(e===target||d<2.5){e.burn=3*stats.duration;takeDamage(e,e===target?damage:damage*.5,'#3b1f45',false,0,'Amaterasu');}}
    }
    const bossCombat=createBossCombat({scene,player,height:terrainHeight,zone:()=>zone,hidden:()=>hiddenEffects,
      hitPlayer:(base,slow)=>{damagePlayer(base*threatNow().damage,undefined,slow);}});
    function spawnEnemy(challenge=false,megaElite=false,guardian=false,forcedId?:string,accountSeal=false){const t=tune(),candidates=megaElite&&!guardian&&!forcedId?HEROES.filter(h=>h.family===h.id&&!allies.includes(h.id)&&!enemyList.some(enemy=>enemy.heroId===h.id)):[],id=forcedId??(guardian?ZONES[zone-1].guardians[Math.floor(Math.random()*ZONES[zone-1].guardians.length)]:candidates[Math.floor(Math.random()*candidates.length)]?.id)??heroId,angle=Math.random()*Math.PI*2;if(accountSeal)megaElite=true;const swarmRing=!challenge&&!megaElite&&!guardian&&overtimeNow()>0,r=challenge?7:megaElite?12:swarmRing?FINAL_SWARM.spawnRing[0]+Math.random()*(FINAL_SWARM.spawnRing[1]-FINAL_SWARM.spawnRing[0]):10+Math.random()*8,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),elite=!megaElite&&!challenge&&(forceElite||Math.random()<ELITE_CHANCE*t.eliteRate);
      const tier:EnemyTier=accountSeal?'account':guardian?'mega':megaElite?'mega':elite?'elite':'normal',T=ENEMY_TIERS[tier];const e=megaElite?makeHero(id,Math.max(1,level)):makeSprite(Math.floor(Math.random()*4),elite?1.9:1.55,elite?2.5:2);if(megaElite)e.scale.multiplyScalar(1.4);e.position.set(x,terrainHeight(x,z)+(megaElite?1.6:1),z);if(elite)addOutline(e,'#ffd21f');else if(accountSeal)addOutline(e,'#5ff0ff');else if(megaElite&&!guardian)addOutline(e,'#ff4d6d');scene.add(e);const threat=threatNow();const hpBase=accountSeal?T.hp*t.accountHp:elite?T.hp*t.eliteHp*eliteHpRamp(tier,zoneElapsed()):challenge?30:T.hp*(mission==='Genin'?.8+.2*Math.min(1,elapsed/210):1);const enemy:Enemy={sprite:e,hp:guardian?guardianHpNow(threat.hp):megaElite&&!accountSeal?megaEliteHp(elapsed,t.megaHp*t.enemyHp*MISSION_TIER[mission]*zoneDifficulty*(1+.33*shikamaruPlans)*Math.max(.2,1+ex('threat'))):Math.round(hpBase*threat.hp),speed:megaElite?2.6:elite?3.8:2.8+Math.random()*.8,hitTimer:.2,challenge,megaElite,elite,guardian,heroId:megaElite?id:undefined,tier,account:accountSeal,defense:guardian?guardianDefense(elapsed):Math.min(.85,T.defense*(tier==='elite'?t.eliteDefense:tier==='mega'&&!guardian?t.megaDefense*(.60+.40*Math.min(1,elapsed/480)):1)+(threat.armor??0)),dmgMult:guardian?2.2:T.damage*(tier==='elite'?t.eliteDamage:tier==='mega'?t.megaDamage:1)};if(guardian){enemy.hpMultiplier=guardianHpMultiplier(zoneElapsed());enemy.shikamaruPlans=shikamaruPlans;enemy.guardianZone=zone;}enemy.maxHp=enemy.hp;if(tier==='normal'&&!challenge&&Math.random()<.07+.13*Math.min(1,elapsed/300))enemy.ranged=Math.floor(Math.random()*enemyWeapons.length);enemy.moveAfter=elapsed+3+Math.random()*5;if(megaElite){enemy.uid=++megaUid;enemy.motionLevel=level;enemy.motion=createPlayerMotion(scene,e,id,false);}enemyList.push(enemy);if(megaElite&&!accountSeal)bossCombat.attach(enemy,enemy.hp,guardian);return enemy;}
    // Guardião (chefe final da zona): 1 por zona. Invocado pelo jogador no Selo do guardião (E).
    function zoneElapsed(){return Math.max(0,elapsed-zoneStart);}
    /** FINAL SWARM: segundos sobrevividos depois que o relógio da zona zerou (0 = relógio ainda correndo; arena não tem swarm). */
    function overtimeNow(){return arena?0:Math.max(0,zoneElapsed()-ZONE_SECONDS);}
    const guardianHpNow=(hp=threatNow().hp)=>guardianVitality(hp,elapsed,zoneElapsed(),overtimeNow(),zone);
    function summonGuardian(){if(guardianSpawned||arena||portal)return null;guardianSpawned=true;const seal=events.find(e=>e.id==='guardian-seal');if(seal)seal.active=false;const g=spawnEnemy(false,true,true);if(seal){g.sprite.position.set(seal.x,terrainHeight(seal.x,seal.z)+g.sprite.scale.y*.46,seal.z);addRing(g.sprite.position,'#ffd07c',2.3);}eventToast='Guardião invocado! '+HERO_BY_ID[g.heroId!].name+' · HP ×'+(g.hpMultiplier??1).toFixed(2)+(shikamaruPlans?' · Plano do Shikamaru '+shikamaruPlans+'/'+GUARDIAN_RULES.shikamaruMaxPlans:'');return g;}
    const gamabuntaSheet=new THREE.TextureLoader().load('/assets/gamabunta-oil-v1.png');
    gamabuntaSheet.colorSpace=THREE.SRGBColorSpace;
    gamabuntaSheet.minFilter=gamabuntaSheet.magFilter=THREE.NearestFilter;
    gamabuntaSheet.generateMipmaps=false;
    runCleanups.push(()=>gamabuntaSheet.dispose());
    const totemHands=new THREE.TextureLoader().load('/assets/shinobi-motion/naruto-hand-seal-v1.png');
    totemHands.colorSpace=THREE.SRGBColorSpace;
    totemHands.minFilter=totemHands.magFilter=THREE.NearestFilter;
    totemHands.generateMipmaps=false;
    totemHands.repeat.set(.25,.25);totemHands.offset.set(.25,.5);
    runCleanups.push(()=>totemHands.dispose());
    /** O Totem mantém o selo de mãos. Os clones usam a locomoção do Naruto Clássico. */
    function spawnTotem(){if(totemSpawned)return null;totemSpawned=true;totemDiscovered=false;totemResult='';totemCloneTimer=1;
      const angle=Math.random()*Math.PI*2,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*TOTEM_RULES.distance,-44,44),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*TOTEM_RULES.distance,-44,44);
      const sprite=makeHero('naruto-genin',10);sprite.material.map=totemHands;sprite.material.alphaTest=.55;sprite.scale.multiplyScalar(1.5);sprite.position.set(x,terrainHeight(x,z)+1.7,z);scene.add(sprite);totemPos.set(x,0,z);
      const hp=TOTEM_RULES.baseHp*threatNow().hp;totem={sprite,hp,maxHp:hp,speed:0,hitTimer:99,totem:true};enemyList.push(totem);
      totemBar=createTotemBar(scene);totemBar.follow(sprite);totemBar.draw(1,TOTEM_RULES.end-elapsed);
      eventToast=`Naruto Totem apareceu a ${TOTEM_RULES.distance} m! Destrua-o antes de 6:00 para ganhar ${TOTEM_RULES.levels} níveis. Ele invoca clones das sombras sem parar.`;return totem;}
    /** Clone das sombras: nasce perto do Totem e persegue o jogador correndo. */
    function spawnTotemClone(){const angle=Math.random()*Math.PI*2,r=TOTEM_RULES.radiusMin+Math.random()*(TOTEM_RULES.radius-TOTEM_RULES.radiusMin),x=THREE.MathUtils.clamp(totemPos.x+Math.cos(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(totemPos.z+Math.sin(angle)*r,-WORLD_LIMIT,WORLD_LIMIT);
      const sprite=makeHero('naruto-genin',10);sprite.scale.multiplyScalar(.82);sprite.position.set(x,terrainHeight(x,z)+1,z);scene.add(sprite);const hp=TOTEM_RULES.cloneHp*threatNow().hp;
      enemyList.push({sprite,hp,maxHp:hp,speed:TOTEM_RULES.cloneSpeed,hitTimer:.3,clone:true,motionLevel:10,motion:createPlayerMotion(scene,sprite,'naruto-genin',false)});}
    /** Clones somem em fumaça (sem recompensa) quando o totem cai ou expira. */
    function dispelClones(){for(const e of enemyList.filter(e=>e.clone)){disposeEnemySprite(e);enemyList.splice(enemyList.indexOf(e),1);if(!hiddenEffects)addRing(e.sprite.position,'#f2f2f2',.5);}}
    function disposeEnemySprite(e:Enemy){e.motion?.dispose();scene.remove(e.sprite);e.sprite.material.dispose();for(const child of e.sprite.children)if(child instanceof THREE.Sprite)child.material.dispose();if(e.marker){scene.remove(e.marker);e.marker.geometry.dispose();(e.marker.material as THREE.Material).dispose();e.marker=undefined;}}
    function endTotem(result:'derrotado'|'expirou'){if(!totem)return;const t=totem;totem=null;totemResult=result;const i=enemyList.indexOf(t);if(i>=0)enemyList.splice(i,1);disposeEnemySprite(t);totemBar?.dispose();totemBar=null;dispelClones();
      if(result==='derrotado'){kills++;pendingLevels+=TOTEM_RULES.levels;addRing(t.sprite.position,'#ffb34d',3);playSfx('ultimate');eventToast=`Naruto Totem derrotado! +${TOTEM_RULES.levels} níveis (escolha técnicas e pílulas).`;}
      else eventToast='O Naruto Totem sumiu às 6:00 · sem recompensa.';}
    /** Por quadro: surge aos 180 s, invoca clones, some aos 240 s. */
    function updateTotem(dt:number){
      if(!totemSpawned&&elapsed>=TOTEM_RULES.start&&elapsed<TOTEM_RULES.end)spawnTotem();
      if(!totem)return;
      if(elapsed>=TOTEM_RULES.end){endTotem('expirou');return;}
      totem.sprite.position.y=terrainHeight(totem.sprite.position.x,totem.sprite.position.z)+1.7;totemBar?.follow(totem.sprite);totemBar?.draw(totem.hp/(totem.maxHp||1),TOTEM_RULES.end-elapsed);
      totemCloneTimer-=dt;if(totemCloneTimer<=0){totemCloneTimer=TOTEM_RULES.interval;const alive=enemyList.reduce((n,e)=>n+(e.clone?1:0),0);for(let n=0;n<Math.min(TOTEM_RULES.perWave,TOTEM_RULES.maxClones-alive);n++)spawnTotemClone();}
    }
    // Plano do Shikamaru: cada acionamento dá +1 kunai grátis ao derrotar o guardião desta zona (limite 3 por zona, sem penalidade).
    function useShikamaruPlan(){const max=GUARDIAN_RULES.shikamaruMaxPlans;if(shikamaruPlans>=max){eventToast=`Plano do Shikamaru: limite de ${max}/${max} atingido nesta zona`;return false;}shikamaruPlans++;plansUsed++;const ratio=(1+.33*shikamaruPlans)/(1+.33*(shikamaruPlans-1));for(const enemy of enemyList){enemy.hp*=ratio;if(enemy.maxHp)enemy.maxHp*=ratio;bossCombat.rescale(enemy,ratio);}const ev=events.find(e=>e.id==='shikamaru');if(ev)ev.uses=shikamaruPlans;for(const e of enemyList)if(e.guardian&&e.guardianZone===zone)e.shikamaruPlans=shikamaruPlans;eventToast=`Plano do Shikamaru ${shikamaruPlans}/${max}: ${shikamaruPlans*33}% mais dificuldade nesta zona · +33% HP da Bijuu por plano · ${1+shikamaruPlans} kunais`;return true;}
    const pickupTextures=new Map<string,THREE.Texture>();
    function spawnPickup(kind:MapPickup['kind'],x:number,z:number){const icon=kind==='shuriken'?'shuriken':'kunai';let mesh:THREE.Object3D;if(kind==='ryu'){mesh=makeDropSprite('ryu',0);mesh.scale.set(1.5,1.5,1);}else{mesh=makeDropSprite(kind==='sealDrop'?'kunaiFree':icon,0);mesh.scale.set(1.6,1.6,1);}mesh.position.set(x,terrainHeight(x,z)+.7,z);scene.add(mesh);pickups.push({id:'pickup-'+pickups.length,kind,name:kind==='sealDrop'?'Kunai de recompensa grátis':kind==='ryu'?'Bolsa de Ryu':kind==='kunai'?'Kunai':'Shuriken',x,z,mesh,active:true});}
    function scatterPickups(){
      const count=Math.round((36+zone*8)*tune().mapPickups);
      for(let i=0;i<count;i++){
        const kind=i%5<3?'ryu':i%5===3?'kunai':'shuriken';
        const angle=Math.random()*Math.PI*2,radius=i<6?9+Math.random()*12:16+Math.random()*55;
        spawnPickup(kind,Math.cos(angle)*radius,Math.sin(angle)*radius);
      }
    }
    scatterPickups();
    const portalTitle=(kind:PortalKind)=>kind==='zone'?'Portal da próxima zona':kind==='arena'?'Portal para a Bijuu':'Portal de saída';
    function openPortal(kind:PortalKind,x:number,z:number){
      const mesh=new THREE.Group(),color=kind==='exit'?'#ffcf76':kind==='arena'?'#cc84ff':'#73e8de';
      mesh.add(new THREE.Mesh(new THREE.TorusGeometry(1.25,.1,8,36),new THREE.MeshBasicMaterial({color})),
        new THREE.Mesh(new THREE.CircleGeometry(1.18,36),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false})));
      mesh.position.set(x,terrainHeight(x,z)+1.24,z);scene.add(mesh);portal={kind,x,z,mesh};snapshotTimer=0;
    }
    function clearZone(){
      for(const clone of shadowClones)disposeShadowClone(clone);
      shadowClones.length=0;
      for(const shot of enemyShots){shot.object.removeFromParent();disposeObject(shot.object);}
      enemyShots.length=0;
      for(const enemy of enemyList)disposeEnemySprite(enemy);
      enemyList.length=0;
      for(const d of drops)scene.remove(d.mesh);drops.length=0;
      for(const p of pickups)scene.remove(p.mesh);pickups.length=0;
      for(const shot of shots){scene.remove(shot.mesh);disposeObject(shot.mesh);}shots.length=0;
      for(const fx of visuals){scene.remove(fx.object);disposeObject(fx.object);}visuals.length=0;
      pendingHits.length=0;totem=null;totemBar?.dispose();totemBar=null;totemDiscovered=false;
      pendingSeals.length=0;lockedTarget=null;currentPing=null;clearRoute();exploredCells.clear();
      defenseAltar=null;defenseActive=false;defenseTime=0;defenseDone=false;altarCircle.visible=false;altarProgress.clear();
      ebisuDeals=null;irukaLesson=null;irukaScroll=null;npcEvent=null;
    }
    function spawnBijuu(id=rollBijuu().id,saved?:{hp:number;maxHp:number},arrivalOvertime=0){
      const sprite=makeHero(id);sprite.scale.set(5,5.5,1);
      sprite.position.set(0,terrainHeight(0,-8)+2.5,-8);scene.add(sprite);
      const threat=tuneThreat(difficultyAt(mission,elapsed,zoneDifficulty*(1+.33*plansUsed),arrivalOvertime),tune());
      const maxHp=saved?.maxHp??Math.max(4600,Math.round(guardianVitality(threat.hp,elapsed,ZONE_SECONDS,arrivalOvertime,3)*2.4));
      const beast:Enemy={heroId:id,bijuu:true,guardian:true,megaElite:true,hp:saved?.hp??maxHp,maxHp,sprite,speed:1.7,hitTimer:.5,dmgMult:2.1,defense:guardianDefense(elapsed,true),uid:++megaUid};
      enemyList.push(beast);bossCombat.attach(beast,maxHp,true);return beast;
    }
    function enterPortal(){
      if(!portal)return;
      const {kind,mesh}=portal;portal=null;scene.remove(mesh);disposeObject(mesh);keys.clear();
      if(kind==='exit'){victory=true;snapshotTimer=0;eventToast='Missão concluída!';return;}
      const arrivalOvertime=overtimeNow();
      clearZone();zoneStart=elapsed;player.position.set(0,terrainHeight(0,0)+.75,0);revealAround(0,0);
      invulnerability=2;
      if(kind==='arena'){
        arena=true;weather='Arena da Bijuu';scene.background=new THREE.Color('#282441');scene.fog=new THREE.Fog('#282441',15,55);
        for(const e of events){e.active=false;e.discovered=false;e.obj.visible=false;}teuchi.visible=false;
        const beast=spawnBijuu(undefined,undefined,arrivalOvertime);eventToast=BIJUU_BY_ID[beast.heroId!].name+' · Fase 1/3';
      }else{
        zone++;guardianSpawned=false;shikamaruPlans=0;zoneDifficulty=1;xpMultiplier=1;lootMultiplier=1;
        spawnTimer=1;ambushTimer=8;megaSchedule=rollMegaSchedule();megaElitesSpawned=0;accountEncounters=0;nextAccountAt=elapsed+20;totemSpawned=false;
        weatherDef=MAP.weathers[Math.floor(Math.random()*MAP.weathers.length)];weather=weatherDef.name;applyWeather();
        scatterEvents();scatterPickups();eventToast='Zona '+zone+' · 10:00 · explore os novos eventos';
      }
      snapshotTimer=0;saveRun();
    }
    /**
     * Recompensa do guardião: antes as kunais grátis caíam em x+0, x+1, x+2 em cima do portal. O E checava o portal
     * PRIMEIRO (raio 2,2 m), então a primeira tecla perto das kunais entrava no portal e `clearZone` apagava as demais
     * (o jogador só pegava 1). Agora a coleta próxima tem prioridade e o portal avisa enquanto houver kunai grátis no chão.
     */
    let portalWarnedAt=-99;
    function interact(){let bestPickup:MapPickup|undefined,bestDistance=2;for(const pickup of pickups){if(!pickup.active)continue;const d=Math.hypot(pickup.x-player.position.x,pickup.z-player.position.z);if(d<bestDistance){bestDistance=d;bestPickup=pickup;}}if(!bestPickup&&portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<2.2){const left=pickups.filter(p=>p.active&&p.kind==='sealDrop').length;if(left&&elapsed-portalWarnedAt>4){portalWarnedAt=elapsed;eventToast=`Ainda há ${left} kunai${left>1?'s':''} grátis no chão. Recolha antes ou aperte E de novo para entrar no portal.`;return;}enterPortal();return;}if(arena&&!bestPickup)return;if(bestPickup){if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){const cost=kunaiPrice();if(runMoney<cost){eventToast='São necessários '+compactNumber(cost)+' Ryu para abrir esta recompensa.';return;}runMoney-=cost;ryuSpent+=cost;paidWeapons++;}bestPickup.active=false;scene.remove(bestPickup.mesh);if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){if(bestPickup.kind==='kunai')kunai++;else shuriken++;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}else if(bestPickup.kind==='sealDrop'){choiceLevel=0;choiceData=rollMegaLoot();eventToast=`Sorte ${luck}: escolha o item deixado pelo mega elite`;}else runMoney+=14+zone*6;if(bestPickup.kind!=='sealDrop')eventToast=`${bestPickup.name} coletado`;playSfx('pickup');return;}const event=events.filter(e=>e.active).sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0];if(!event||Math.hypot(event.x-player.position.x,event.z-player.position.z)>3.6)return;if(event.id==='shikamaru'){useShikamaruPlan();return;}if(event.id==='guardian-seal'){summonGuardian();return;}if(event.id==='orochimaru'){event.active=false;zoneDifficulty*=1.2;xpMultiplier*=1.25;lootMultiplier*=1.25;eventToast='Maldição de Orochimaru: +20% dificuldade · +25% XP e saque';return;}if(event.id==='arsenal'){openKakashi(event);return;}if(event.id==='ebisu'){openEbisu(event);return;}if(event.id==='iruka'){openIruka(event);return;}if(event.id==='sapos-sabios'){openSages();return;}if(event===ichiraku){openIchiraku();return;}if(event.id==='trader'){showMerchant();return;}if(event.id==='slot'){openRoulette();return;}if(event.altarTier!==undefined){startAltar(event);return;}event.active=false;for(let i=0;i<6;i++)spawnEnemy(true);eventToast=`Desafio iniciado em ${event.name}: derrote a horda para receber uma kunai grátis`;
    }
    function addDrop(position:THREE.Vector3,type:Drop['type'],value:number,name=''){if(drops.length>=DROP_RULES.cap&&(type==='xp'||type==='lamens'||type==='chakra')){let best:Drop|undefined,bd=Infinity;for(const d of drops){if(d.type!==type)continue;const dd=Math.hypot(d.mesh.position.x-position.x,d.mesh.position.z-position.z);if(dd<bd){bd=dd;best=d;}}if(best){best.value+=value;return;}}const orb=makeDropSprite(type==='lamens'?'ryu':type,value);if(currentSettings().discreetDrops){orb.scale.multiplyScalar(.7);orb.userData.baseScale*=.7;}orb.position.copy(position);orb.position.x+=(Math.random()-.5)*.7;orb.position.z+=(Math.random()-.5)*.7;orb.position.y=terrainHeight(orb.position.x,orb.position.z)+.55;scene.add(orb);drops.push({mesh:orb,type,value,name,born:elapsed,magnet:false,speed:0});}
    function removeEnemy(enemy:Enemy){const i=enemyList.indexOf(enemy);if(i<0)return;
      // Naruto Totem e clones: recompensas próprias (2 níveis / só XP), nunca selamento nem saque de mega elite.
      if(enemy.totem){endTotem('derrotado');return;}
      if(enemy.bijuu){defeatedBijuu=BIJUU_BY_ID[enemy.heroId!].name;enemyList.splice(i,1);disposeEnemySprite(enemy);kills++;bijuuReward=bijuuLamens(MISSION_TIER[mission],plansUsed);openPortal('exit',enemy.sprite.position.x,enemy.sprite.position.z);eventToast=defeatedBijuu+' derrotada · +'+bijuuReward+' Lamens no portal de saída';saveRun();return;}
      if(enemy.clone){const at=enemy.sprite.position.clone();enemyList.splice(i,1);disposeEnemySprite(enemy);kills++;addDrop(at,'xp',Math.round(TOTEM_RULES.cloneXp*xpMultiplier));if(!hiddenEffects)addRing(at,'#f2f2f2',.45);return;}const defeatedAt=enemy.sprite.position.clone();disposeEnemySprite(enemy);enemyList.splice(i,1);bossCombat.dispose(enemy);kills++;if(ex('killHeal')>0&&!defeated&&Math.random()<ex('killHeal'))hp=Math.min(stats.maxHp,hp+stats.maxHp*.02);if(enemy.account){const pending={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready' as const,account:true};eventToast='Shinobi para selar derrotado: E sela e DESBLOQUEIA '+pending.target+' na sua conta';if(sealing||replaceCandidate)pendingSeals.push(pending);else startSeal(pending);return;}if(enemy.megaElite&&!enemy.guardian){const pending={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready' as const};eventToast='Mega elite derrotado: escolha selar com E ou recusar com G';if(sealing||replaceCandidate)pendingSeals.push(pending);else startSeal(pending);}for(const id of allies)gainAffinity(id,AFFINITY_RULES.perKill);if(enemy.guardian){const plans=Math.min(GUARDIAN_RULES.shikamaruMaxPlans,enemy.shikamaruPlans??0);for(let n=0;n<1+plans;n++){const angle=Math.PI/2+n*Math.PI*2/(1+plans);spawnPickup('sealDrop',defeatedAt.x+Math.cos(angle)*3.4,defeatedAt.z+Math.sin(angle)*3.4);}openPortal(zone===3?'arena':'zone',defeatedAt.x,defeatedAt.z);eventToast='Portal aberto! Guardião derrotado. '+(1+plans)+' kunai'+(plans?'s grátis no chão (Plano do Shikamaru +'+plans+').':' grátis no chão.');}if(enemy.challenge&&!enemyList.some(e=>e.challenge)){spawnPickup('sealDrop',defeatedAt.x,defeatedAt.z);eventToast='Desafio concluído: kunai grátis no chão';}const t=tune(),tierKey:EnemyTier=enemy.guardian?'mega':enemy.tier??'normal',boosted=tierKey!=='normal',loot=lootScale(tierKey,enemy.maxHp??0,ENEMY_TIERS.normal.hp*threatNow().hp,MISSION_TIER[mission])*(tierKey==='elite'?t.eliteLoot:tierKey==='mega'?t.megaLoot:1),pieces=tierKey==='mega'?3:1;addDrop(defeatedAt,'xp',Math.round(BASE_LOOT.xp*loot*xpMultiplier*(1+Math.max(0,elapsed/60-3)*.075)));if(Math.random()<Math.min(RAMEN_DROP.chance,dropChance(RAMEN_DROP.chance,t.ramenDrop)))addDrop(defeatedAt,'ramen',RAMEN_DROP.heal*t.ramenHeal);if(boosted||Math.random()<dropChance(Math.min(.95,BASE_LOOT.ryuChance*lootMultiplier),t.ryuDrop))for(let n=0;n<pieces;n++)addDrop(defeatedAt,'lamens',Math.max(1,Math.round(BASE_LOOT.ryu*lootMultiplier*loot/pieces)));if(boosted||Math.random()<dropChance(BASE_LOOT.chakraChance,t.chakraDrop))for(let n=0;n<(tierKey==='mega'?2:1);n++)addDrop(defeatedAt,'chakra',Math.round(BASE_LOOT.chakra*Math.sqrt(loot)*t.chakraGain));
      // SEM drop de item por abate (pedido do usuário, 06/11/2026): itens só por kunai/shuriken/eventos com interação.
      // Antes: 1,8% por abate (×Sorte) virava pendingItemRewards ao ser puxado pelo ímã — com emboscadas e horda grande, chovia item sem interação.
      playSfx('impact');}
    function damageNumber(position:THREE.Vector3,amount:number,tier=0){if(hiddenEffects||!currentSettings().damageNumbers||numbers.length>60||amount<.5)return;/* Textura por rótulo em cache e sprite do pool (damageNumbers.ts). */const sprite=damageNumbers.spawn(amount,tier);sprite.position.set(position.x+(Math.random()-.5)*.5,position.y+1.5,position.z);numbers.push({sprite,life:.8});}
    function takeDamage(enemy:Enemy,damage:number,color:string,fromAlly=false,tier=0,name='Status'){if(!enemyList.includes(enemy))return;if(enemy.defense)damage*=1-enemy.defense;if(enemy.account&&damage>=1)damage=Math.max(damage,(enemy.maxHp||1)*.10);const dealt=Math.min(enemy.hp,damage);if(fromAlly)allyDamage+=dealt;else{totalDamage+=dealt;skillDamage[name]=(skillDamage[name]||0)+dealt;if(ex('lifesteal')>0&&!defeated)hp=Math.min(stats.maxHp,hp+dealt*ex('lifesteal'));}enemy.hp-=damage;
      // Lâmina do Carrasco: inimigos comuns abaixo de 8% (+4 pontos por cópia extra) morrem na hora.
      const executeAt=ex('execute')>0?.04*(ex('execute')/.08+1):0;if(executeAt>0&&enemy.hp>0&&!enemy.megaElite&&!enemy.guardian&&!enemy.totem&&enemy.hp<(enemy.maxHp||0)*executeAt)enemy.hp=0;damageNumber(enemy.sprite.position,damage,tier);if(enemy.hp<=0)removeEnemy(enemy);else if(!hiddenEffects){enemy.sprite.material.color.set(color);}}
    /** Multiplicador de dano dos itens para uma técnica do jogador contra este inimigo. */
    function itemDamageBonus(enemy:Enemy,t:Technique){
      const elements=t.ultimate?[...new Set(Object.values(ELEMENT_KEY))]:[ELEMENT_KEY[t.element],...(t.secondaryElement?[ELEMENT_KEY[t.secondaryElement]]:[])];
      let bonus=(1+elements.reduce((sum,key)=>sum+ex(key),0))*(t.ultimate||t.school==='Genjutsu'?stats.genjutsu:1);
      // Natureza do shinobi: técnicas do elemento base (afinidade) causam ×NATURE_BONUS.
      if(t.element!=='Neutro'&&t.element===heroNature)bonus*=NATURE_BONUS;
      // Infusão Sábia (Selo de Senjutsu ou Modo Sábio ativo): a técnica também conta como elemento Sábio.
      if(!t.ultimate&&t.element!=='Sábio'&&(stats.sage>0||sageModeActive()))bonus*=1+ex('elSabio');
      if(enemy.elite||enemy.megaElite||enemy.guardian)bonus*=1+ex('eliteDamage');
      if((enemy.controlTime||0)>0||(enemy.slow||0)>0)bonus*=1+ex('controlledDamage');
      const statuses=[(enemy.controlTime||0)>0,(enemy.burn||0)>0,!!enemy.poison,(enemy.slow||0)>0].filter(Boolean).length;
      bonus*=1+Math.min(.3,statuses*ex('statusStack'));
      bonus*=1+ex('lowHpDamage')*Math.min(1,Math.max(0,(1-hp/stats.maxHp)/.75));
      bonus*=1+Math.min(ex('noHitDamage'),timeSinceHit*.04);
      bonus*=1+Math.min(.3,Math.floor(kills/100)*ex('killDamage'));
      if(t.ultimate||t.school==='Taijutsu')bonus*=1+Math.min(.5,stats.armor*ex('armorPhysical'));
      if(ex('bigCrit')>0&&Math.random()<ex('bigCrit'))bonus*=8;
      return bonus;
    }
    function hit(enemy:Enemy,t:Technique,g:SkillGrowth,origin:THREE.Vector3,ally=false){if(!enemyList.includes(enemy))return;const crit=rollCritical(stats.crit,stats.critDamage),school=t.ultimate?stats.physical*stats.ninjutsu:t.school==='Taijutsu'?stats.physical:t.school==='Ninjutsu'?stats.ninjutsu:1,sage=t.element==='Sábio'||stats.sage>0||(!ally&&sageModeActive()),passive=!ally&&DETERMINATION[heroId]!==undefined?1+DETERMINATION[heroId]*(1-hp/stats.maxHp):!ally&&familyOf(heroId)==='hashirama'&&sage?1.2:!ally&&familyOf(heroId)==='tenten'&&(t.element==='Neutro'||t.shape==='Projétil'||t.shape==='Em V')?1.5:1;
      const damage=stats.damage*t.power*(1+g.damage)*(!ally&&config.trained?.includes(t.name)?1.15:1)*school*passive*crit.multiplier*(ally?.65*stats.allyDamage:damageMultiplier*tune().playerDamage*itemDamageBonus(enemy,t));
      if(enemy.control==='Dormir')enemy.controlTime=0;
      const status=t.status??(stats.status>0?'Lentidão':undefined);if(status&&Math.random()<Math.min(.95,(t.status?t.statusChance:0)+stats.status)){const duration=(status==='Lentidão'?1.8:.65)*stats.duration*(1+g.duration);if(status==='Empurrar'){const away=enemy.sprite.position.clone().sub(origin);away.y=0;enemy.sprite.position.addScaledVector(away.normalize(),1.4);}else{enemy.control=status;enemy.controlTime=duration;if(status==='Lentidão')enemy.slow=duration;}}
      if(t.secondaryStatus&&Math.random()<Math.min(.95,(t.secondaryStatusChance??0)+stats.status)){
        if(t.secondaryStatus==='Lentidão')enemy.slow=Math.max(enemy.slow??0,1.8*stats.duration*(1+g.duration));
        else if(t.secondaryStatus==='Empurrar')enemy.sprite.position.addScaledVector(enemy.sprite.position.clone().sub(origin).setY(0).normalize(),1.4);
        else if(!enemy.controlTime){enemy.control=t.secondaryStatus;enemy.controlTime=.65*stats.duration*(1+g.duration);}
      }
      if(stats.poison>0)enemy.poison={remaining:3*stats.duration*(1+g.duration),dps:damage*stats.poison*(1+ex('statusDamage'))/3};if(t.burn)enemy.burn=2*stats.duration*(1+g.duration);
      // Gatilhos por acerto dos itens (só técnicas do jogador).
      if(!ally){
        if(Math.random()<ex('burnChance'))enemy.burn=2*stats.duration;
        if(Math.random()<ex('poisonChance'))enemy.poison={remaining:3*stats.duration,dps:damage*.35*(1+ex('statusDamage'))/3};
        if(Math.random()<ex('sleepChance')){enemy.control='Dormir';enemy.controlTime=2*stats.duration;}
        if(Math.random()<ex('rootChance')){enemy.control='Paralisar';enemy.controlTime=1.2*stats.duration;}
        if(Math.random()<ex('chillChance')){enemy.control='Lentidão';enemy.controlTime=1.8*stats.duration;enemy.slow=1.8*stats.duration;}
      }
      if(!hiddenEffects&&visuals.length<24){
        const impact=techniqueImpact(t);
        impact.position.copy(enemy.sprite.position);
        impact.quaternion.copy(camera.quaternion);
        scene.add(impact);visuals.push({object:impact,life:.2});
      }
      takeDamage(enemy,damage,t.color,ally,crit.tier,t.name);
      // Linha Senjutsu (modo sábio): Ninjutsu infundido com Sábio tem chance de um golpe extra de 1,5× o dano deste acerto.
      if(!ally&&hasSenjutsu(t,stats.sage>0||sageModeActive())&&enemyList.includes(enemy)&&Math.random()<(senjutsuOverride??SENJUTSU.chance)){senjutsuProcs++;takeDamage(enemy,damage*SENJUTSU.multiplier,SENJUTSU.color,false,crit.tier,t.name);}
    }
    /** Setup (buff puro): só ativa com inimigo a até 9 m; sem acúmulo, reativar renova a duração. Não usa velocidade de ataque nem velocidade de projétil. */
    function activateSetup(t:Technique,g:SkillGrowth){
      if(!enemyList.some(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<=t.range))return false;
      const s=setupNumbers(t,g),current=activeSetups.find(a=>a.name===t.name);
      if(current&&!s.stack){current.remaining=s.duration;current.duration=s.duration;current.bonuses=s.bonuses;}
      else activeSetups.push({name:t.name,remaining:s.duration,duration:s.duration,bonuses:s.bonuses,sage:s.sage});
      refreshStats();playerMotion.attack();addRing(player.position,t.color,1);addRing(player.position,t.color,.6);playTechniqueSound(t);return true;
    }
    function disposeShadowClone(clone:(typeof shadowClones)[number]){
      clone.sprite.removeFromParent();clone.sprite.material.dispose();clone.motion.dispose();
    }
    function showGamabunta(origin:THREE.Vector3,target:THREE.Vector3,preview=false){
      const effect=createGamabunta(gamabuntaSheet,origin,target,v2,preview);
      scene.add(effect.group);effect.group.visible=!hiddenEffects;
      let age=0;
      visuals.push({object:effect.group,life:GAMABUNTA_TIME,tick:dt=>effect.tick(age+=dt)});
    }
    function castTechnique(t:Technique,origin:THREE.Vector3,g:SkillGrowth,ally=false,instant=false,allyMotion?:ReturnType<typeof createPlayerMotion>,part=false):boolean{
      const merge=!part&&merges.get(t.name);
      if(merge&&merge.kind==='combine'){
        const casts=merge.names.map(name=>{const source=techniques.find(tech=>tech.name===name);const base=growth[name]??NO_GROWTH;return source&&castTechnique({...source,power:source.power*1.5},origin,{damage:g.damage+base.damage,area:g.area+base.area,haste:g.haste+base.haste,duration:g.duration+base.duration},ally,instant,allyMotion,true);});
        return casts.some(Boolean);
      }
      if(t.setup)return ally?false:activateSetup(t,g);
      // Modo Sábio: taijutsu corpo a corpo do jogador vira golpe em área ao redor (raio ×1,8, escala com área).
      const sageArea=!ally&&sageModeActive()&&t.school==='Taijutsu'&&t.shape==='Corpo a corpo';
      const range=ATTACK_SCALE*t.range*(sageArea?1.8:1)*(1+Math.min(1,(level-1)*.005))*Math.sqrt(stats.area*(1+g.area));const target=(lockedTarget&&enemyList.includes(lockedTarget)&&Math.hypot(lockedTarget.sprite.position.x-origin.x,lockedTarget.sprite.position.z-origin.z)<=range)?lockedTarget:enemyList.filter(e=>Math.hypot(e.sprite.position.x-origin.x,e.sprite.position.z-origin.z)<=range).sort((a,b)=>a.sprite.position.distanceToSquared(origin)-b.sprite.position.distanceToSquared(origin))[0];if(!target)return false;const direction=target.sprite.position.clone().sub(origin);direction.y=0;direction.normalize();
      const projectile=['Projétil','Em V','Onda'].includes(t.shape);
      const academyThrow=!ally&&heroId==='naruto'&&projectile&&/shuriken|kunai/i.test(t.name);
      if(t.name==='Kage Bunshin'||t.name==='Técnica de Substituição'){
        if(shadowClones.length>=12)return false;
        const cloneLevel=ally?1:level,cloneId=t.name==='Kage Bunshin'?(!ally&&familyOf(heroId)==='naruto'?heroId:'naruto'):heroId,sprite=makeHero(cloneId,cloneLevel);
        sprite.position.copy(origin);sprite.visible=!hiddenEffects;scene.add(sprite);
        shadowClones.push({sprite,motion:createPlayerMotion(scene,sprite,cloneId,false),target,life:1.9,technique:t,growth:g,ally,level:cloneLevel});
      }else if(t.name==='Invocação do Sapo'&&familyOf(heroId)==='naruto'&&!ally){
        const impact=target.sprite.position.clone(),fire={...t,element:'Fogo' as const,burn:true};
        if(!hiddenEffects)showGamabunta(origin,impact);
        pendingHits.push({time:GAMABUNTA_IGNITION,run:()=>{const radius=1.65*Math.sqrt(stats.area*(1+g.area));for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-impact.x,enemy.sprite.position.z-impact.z)<radius)hit(enemy,fire,g,impact);}});
      }else if(projectile){const launch=()=>{const count=t.shape==='Em V'?2:1;/* Projétil fracionário (sinergia da Folha, afinidade): chance por disparo de +1. */const chance=stats.projectileChance,projectiles=Math.floor(stats.projectiles)+Math.floor(chance)+(Math.random()<chance%1?1:0);for(let i=0;i<Math.min(12,count+projectiles-1);i++){const spread=t.shape==='Em V'?(i%2?.2:-.2):(i-(projectiles-1)/2)*.1,aim=direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread),object=techniqueVisual(t,()=>makeHero(ally?'naruto':heroId,ally?1:level));object.position.copy(origin);animateTechniqueVisual(object,0,aim);object.scale.multiplyScalar(ATTACK_SCALE);object.visible=!hiddenEffects;scene.add(object);shots.push({mesh:object,direction:aim,remaining:range,range,speed:(t.name.includes('Bunshin')?6:10)*stats.projectileSpeed,radius:ATTACK_SCALE*(t.shape==='Onda'?.85:.4)*Math.sqrt(stats.area*(1+g.area)),technique:t,origin:origin.clone(),hit:new Set(),growth:g,ally,bounces:!ally&&(t.shape==='Projétil'||t.shape==='Em V')?stats.bounce:0});}};
        if(academyThrow&&!instant)pendingHits.push({time:.12,run:launch});
        else launch();
      }
      else{const center=['Área'].includes(t.shape)?target.sprite.position:origin,radius=t.shape==='Área'||t.shape==='Órbita'?ATTACK_SCALE*(t.shape==='Área'?1.2:1.7)*Math.sqrt(stats.area*(1+g.area)):range;
        // Golpes e lançamentos sem projétil têm um preparo curto até o acerto, reduzido pela velocidade de projétil.
        const resolve=()=>{
        for(const enemy of [...enemyList]){const delta=enemy.sprite.position.clone().sub(origin);delta.y=0;const d=delta.length(),along=delta.dot(direction),cross=Math.abs(delta.x*direction.z-delta.z*direction.x);let inside=false;if(t.shape==='Linha')inside=along>=0&&along<=range&&cross<ATTACK_SCALE*.65*Math.sqrt(stats.area*(1+g.area));else if(t.shape==='Cone')inside=d<=range&&(d<.2||delta.normalize().dot(direction)>.65);else inside=Math.hypot(enemy.sprite.position.x-center.x,enemy.sprite.position.z-center.z)<=radius;if(inside)hit(enemy,t,g,origin,ally);}
        const object=techniqueVisual(t);if(t.secondaryElement){const secondary=techniqueVisual({...t,name:'Fusão '+t.secondaryElement,element:t.secondaryElement});secondary.rotation.y=Math.PI/3;object.add(secondary);}object.position.copy(center);animateTechniqueVisual(object,0,direction);object.scale.multiplyScalar(Math.max(.55,radius));object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.35});if(sageArea)addRing(center,SENJUTSU.color,Math.min(radius,4));};
        const delay=(t.school==='Taijutsu'?IMPACT_DELAY.Taijutsu:IMPACT_DELAY.other)/Math.max(.3,stats.projectileSpeed);
        if(instant||delay<=0)resolve();else pendingHits.push({time:delay,run:resolve});}
      const motion=ally?allyMotion:playerMotion;
      if(!t.ultimate)motion?.attack(t.school==='Taijutsu'||academyThrow,direction.dot(v2)<0,false,t.school!=='Taijutsu'?undefined:t.name==='Furacão da Folha'||t.name==='Lótus Primária'?'kick':'punch',/Bunshin|Caixão de Areia/.test(t.name),direction.dot(v1)>.001);
      if(!ally)playTechniqueSound(t);return true;
    }
    function castUltimate(){if(chakra<100||defeated||pausedRef.current||choiceData||sealing||roulette)return;chakra=0;playerMotion.attack(false,undefined,true,familyOf(heroId)==='lee'?'kick':familyOf(heroId)==='guy'?'punch':undefined,/Bunshin/.test(hero.ultimate));if(ex('ultReset')>0){for(const k of Object.keys(cooldowns))cooldowns[k]=0;ultBuffTimer=6;eventToast='Pergaminho do Hokage: técnicas recarregadas e +30% de velocidade de ataque';}playSfx('ultimate');const projectile=isProjectileUltimate(heroId),t:Technique={...ultimateBase(hero),name:hero.ultimate,power:6,range:Math.max(8,ultimateBase(hero).range),ultimate:true,shape:projectile?'Projétil':'Área',setup:undefined};playTechniqueSound(t,true);if(projectile){castTechnique(t,player.position,NO_GROWTH,false,true);return;}const object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(player.position);object.scale.multiplyScalar(2.8);object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.7});for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<4.2*Math.sqrt(stats.area))hit(enemy,t,NO_GROWTH,player.position);}
    renderer.setAnimationLoop((now)=>{choiceArmed();if(pointerLocked()&&!cameraCanMove())document.exitPointerLock();if(debugOpenRef.current)keys.clear();const fpsCap=currentSettings().fpsLimit;if(fpsCap>0&&now-lastFrameAt<1000/fpsCap-1)return;lastFrameAt=now;const perfT0=performance.now();const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;if(enabledRef.current&&!pausedRef.current&&!choiceData&&!roulette&&!defeated&&!victory&&!debugState.frozen&&(pointerLocked()||testPointer||debugOpenRef.current||sealing)){
      refreshStats();invulnerability=Math.max(0,invulnerability-dt);playerSlow=Math.max(0,playerSlow-dt);
      // Temporizadores dos itens.
      timeSinceHit+=dt;rushTimer=Math.max(0,rushTimer-dt);freezeCd=Math.max(0,freezeCd-dt);ultBuffTimer=Math.max(0,ultBuffTimer-dt);emergencyCd=Math.max(0,emergencyCd-dt);
      stillTime=Math.hypot(player.position.x-lastPos.x,player.position.z-lastPos.z)>.001?0:stillTime+dt;lastPos.copy(player.position);
      if(!shieldReady){shieldTimer-=dt;if(shieldTimer<=0)shieldReady=true;}
      if(!defeated&&ex('emergencyHeal')>0&&emergencyCd<=0&&hp>0&&hp<stats.maxHp*.3){hp=Math.min(stats.maxHp,hp+stats.maxHp*.35);emergencyCd=45;addRing(player.position,'#7dffb0',1.4);eventToast='Fruta Medicinal: +35% de HP';}
      if(!defeated&&ex('periodicHeal')>0){periodicTimer-=dt;if(periodicTimer<=0){periodicTimer=30;if(hp<stats.maxHp){hp=Math.min(stats.maxHp,hp+stats.maxHp*.12);addRing(player.position,'#7dffb0',1.2);}}}
      // Procs de item com golpe (raios/chamas) também seguem a velocidade de ataque.
      if(!defeated&&!sealing&&ex('bolts')>0){boltTimer-=dt;if(boltTimer<=0){boltTimer=2.5/Math.max(.2,stats.attackSpeed);castBolts();}}
      if(!defeated&&!sealing&&ex('beam')>0){beamTimer-=dt;if(beamTimer<=0){beamTimer=6/Math.max(.2,stats.attackSpeed);castBeam();}}
      // Setups: a duração corre só fora do selamento; ao expirar, os atributos voltam a ser recalculados das fontes.
      if(!sealing){let expired=false;for(let i=activeSetups.length-1;i>=0;i--){activeSetups[i].remaining-=dt;if(activeSetups[i].remaining<=0){activeSetups.splice(i,1);expired=true;}}if(expired)refreshStats();}
      if(!sealing){elapsed+=dt;
        // FINAL SWARM (pedido do usuário): o relógio zerar NÃO encerra a run. Aviso grande, o relógio passa a contar o tempo sobrevivido
        // (+mm:ss) e a dificuldade triplica (HP, dano, defesa, quantidade) e cresce com o tempo (FINAL_SWARM em progression.ts).
        // O guardião/portal continuam funcionando: vencer o guardião e entrar no portal leva à próxima zona (relógio novo) ou à arena.
        if(overtimeNow()>0&&!finalSwarmAnnounced){finalSwarmAnnounced=true;eventToast='FINAL SWARM! O tempo acabou: sobreviva o máximo que puder · dificuldade ×3 e subindo.';playSfx('ultimate');snapshotTimer=0;}
        else if(overtimeNow()<=0)finalSwarmAnnounced=false;}if(sealing?.phase==='sealing'){sealTimer+=dt;if(sealTimer>=2.7){sealing.phase='complete';if(sealing.account){sealForAccount(sealing.heroId);eventToast=sealing.target+' foi selado e agora está DESBLOQUEADO na sua conta para as próximas missões';}else{recruitAlly(sealing.heroId);eventToast=sealing.target+' foi selado e agora luta ao seu lado';}}}if(!sealing){if(!arena&&zoneElapsed()>=(megaSchedule[megaElitesSpawned]??Infinity)/Math.max(.1,tune().megaRate)&&enemyList.length<(overtimeNow()>0?FINAL_SWARM.maxEnemies:ENEMY_SCALING.maxEnemies)){spawnEnemy(false,true);megaElitesSpawned++;eventToast='Alerta: um Mega Elite surgiu naturalmente nesta zona!';}
      // Missões de desbloqueio (src/game/unlockMissions.ts): o Shinobi para selar de cada shinobi bloqueado surge só no mapa e na
      // dificuldade da missão dele. Até dois candidatos elegíveis por zona, com intervalo sorteado. Testes não geram.
      if(!arena&&!testRun&&!sealing&&accountEncounters<2&&elapsed>=nextAccountAt&&enemyList.length<ENEMY_SCALING.maxEnemies){const candidates=accountCandidates();const candidate=candidates[Math.floor(Math.random()*candidates.length)];if(candidate){accountTried.add(candidate.id);accountEncounters++;nextAccountAt=elapsed+40+Math.random()*35;spawnEnemy(false,false,false,candidate.id,true);const m=UNLOCK_MISSIONS[candidate.id];eventToast=(m.legendary?'LENDÁRIO! ':'')+'Missão '+m.title+': '+candidate.name+' apareceu · derrote e sele para desbloquear na conta!';}else nextAccountAt=elapsed+5;}const speed=stats.moveSpeed*(weatherDef.slow??1)*(playerSlow>0?.55:1)*(rushTimer>0?1.2:1);readMovement(dir);
      const gliding=jumpTime>0&&jumpTime<=jumpDuration*.5&&sandGlideLeft>0&&keys.has(' ');
      if(gliding)sandGlideLeft=Math.max(0,sandGlideLeft-dt);else jumpTime=Math.max(0,jumpTime-dt);
      jumpHeight=jumpTime>0?Math.sin(Math.PI*jumpTime/jumpDuration)*1.3:0;
      slideRecovery=Math.max(0,slideRecovery-dt);
      const dashing=slideTime>0;
      if(dashing){dir.copy(dashHeading);slideTime=Math.max(0,slideTime-dt);}
      const wasMoving=moving;moving=dir.lengthSq()>0;if(moving){dir.normalize();
        if(wasMoving&&!dashing){
          const turn=Math.atan2(heading.z*dir.x-heading.x*dir.z,heading.dot(dir));
          const angle=Math.atan2(heading.x,heading.z)+turn*(1-Math.exp(-28*dt));
          heading.set(Math.sin(angle),0,Math.cos(angle));
        }else heading.copy(dir);
        player.position.addScaledVector(heading,speed*dt*(slideTime>0?2.6:1));player.position.x=THREE.MathUtils.clamp(player.position.x,-WORLD_LIMIT,WORLD_LIMIT);player.position.z=THREE.MathUtils.clamp(player.position.z,-WORLD_LIMIT,WORLD_LIMIT);revealAround(player.position.x,player.position.z);}
      player.position.y=terrainHeight(player.position.x,player.position.z)+1.15+jumpHeight;
      const threat=threatNow();
      if(tune().enemyHp!==appliedEnemyHp){const ratio=tune().enemyHp/Math.max(.01,appliedEnemyHp);for(const e of enemyList){e.hp*=ratio;if(e.maxHp)e.maxHp*=ratio;bossCombat.rescale(e,ratio);}appliedEnemyHp=tune().enemyHp;}
      if(!arena)updateTotem(dt);
      ambushTimer-=dt;if(!arena&&ambushTimer<=0){for(let n=0;n<Math.min(8+zone*2,threat.cap-enemyList.length);n++)spawnEnemy();ambushTimer=18+Math.random()*12;eventToast='Emboscada! Ninjas cercando a área.';}
      tickAltar(dt);
      // Spawn em LOTE (antes: 1 inimigo por intervalo, ~5/s aos 8 min — o jogador matava mais rápido do que nascia e a horda ficava em ~60).
      // Orçamento contínuo = spawns/s × dt; abaixo do teto a reposição acelera (até ×SPAWN_RULES.refill com a tela vazia); máximo SPAWN_RULES.perFrame por quadro.
      spawnTimer-=dt;if(!arena&&spawnTimer<=0){const perFrame=threat.swarm>1?SPAWN_RULES.swarmPerFrame:SPAWN_RULES.perFrame,deficit=Math.max(0,1-enemyList.length/Math.max(1,threat.cap));spawnBudget=Math.min(perFrame,spawnBudget+dt/Math.max(.001,threat.spawnInterval)*(1+SPAWN_RULES.refill*deficit));let made=0;while(spawnBudget>=1&&enemyList.length<threat.cap&&made<perFrame){spawnEnemy();spawnBudget--;made++;}if(enemyList.length>=threat.cap)spawnBudget=Math.min(spawnBudget,1);}
      hp=Math.min(stats.maxHp,hp+dt*stats.regen);
      for(let i=enemyShots.length-1;i>=0;i--){
        const shot=enemyShots[i],position=shot.object.position,step=shot.speed*dt;
        const px=player.position.x-position.x,pz=player.position.z-position.z;
        const along=THREE.MathUtils.clamp(px*shot.direction.x+pz*shot.direction.z,0,step);
        const hit=Math.hypot(px-along*shot.direction.x,pz-along*shot.direction.z)<shot.radius&&jumpHeight<.65;
        if(hit)damagePlayer(shot.damage);
        shot.life-=dt;
        if(hit||shot.life<=0){shot.object.removeFromParent();disposeObject(shot.object);enemyShots.splice(i,1);continue;}
        position.addScaledVector(shot.direction,step);
        position.y=terrainHeight(position.x,position.z)+.68;
        if(shot.object instanceof THREE.Sprite)shot.object.material.rotation+=dt*12;
      }
      for(const enemy of [...enemyList]){
        if(enemy.poison){const duration=Math.min(dt,enemy.poison.remaining);enemy.poison.remaining-=duration;takeDamage(enemy,enemy.poison.dps*duration,'#b67bff');if(!enemyList.includes(enemy))continue;if(enemy.poison.remaining<=0)enemy.poison=undefined;}
        enemy.sprite.material.color.lerp(enemy.elite?ELITE_TINT:WHITE_TINT,dt*6);if(enemy.burn){enemy.burn-=dt;takeDamage(enemy,stats.damage*.15*dt*(1+ex('statusDamage')),'#ff9b46');if(!enemyList.includes(enemy))continue;}if(enemy.totem)continue;enemy.controlTime=Math.max(0,(enemy.controlTime||0)-dt);enemy.slow=Math.max(0,(enemy.slow||0)-dt);const stunned=!enemy.bijuu&&enemy.controlTime>0&&enemy.control!=='Lentidão';const casting=enemy.boss?bossCombat.update(enemy,dt,Boolean(enemy.guardian||enemy.megaElite&&!enemy.account)&&!stunned&&enemy.windup===undefined&&!defeated):false;if(defeated)break;
        const sprite=enemy.sprite,batched=enemyRenderer.isBatched(sprite),motion=enemy.motion;
        dir.set(player.position.x-sprite.position.x,0,player.position.z-sprite.position.z);
        const distance=dir.length(),left=dir.dot(v2)<0,back=dir.dot(v1)>0;
        const ranged=enemy.ranged!==undefined,reach=ranged?8:enemy.megaElite?1.6:1;
        const movingEnemy=!stunned&&!casting&&enemy.windup===undefined&&distance>reach&&enemy.speed>0;
        const mobilizes=(batched||motion)&&movingEnemy;
        if(mobilizes&&distance>2.8&&distance<7.5&&elapsed>=(enemy.moveAfter??Infinity)){
          enemy.jumping=Math.random()<.5;
          enemy.moveTime=enemy.jumping?jumpDuration:slideDuration;
          enemy.moveAfter=elapsed+4+Math.random()*7;
        }
        const actionDuration=enemy.jumping?jumpDuration:slideDuration;
        enemy.moveTime=mobilizes?Math.max(0,(enemy.moveTime??0)-dt):0;
        const movingSpecial=enemy.moveTime>0,progress=1-enemy.moveTime/actionDuration;
        const leap=movingSpecial&&enemy.jumping?Math.sin(progress*Math.PI)*.72:0;
        const striking=enemy.windup!==undefined&&enemy.windup<=.2;
        if(batched){
          sprite.userData.flipped=left;
          sprite.userData.frame=striking?ENEMY_FRAME.attack:movingSpecial?(enemy.jumping?ENEMY_FRAME.jump:ENEMY_FRAME.dash)
            :movingEnemy?Math.floor(elapsed*10+sprite.id%3)%3:1;
        }
        if(motion&&((striking&&(enemy.windup??0)+dt>.2)||(casting&&enemy.boss?.cast&&enemy.boss.cast.windup<=.2&&enemy.boss.cast.windup+dt>.2))){
          const cast=enemy.boss?.cast;
          motion.attack(false,left,!!cast?.ultimate,['lee','guy'].includes(enemy.heroId??'')?'kick':undefined);
        }
        if(stunned||casting){
          if(!motion)continue;
        }
        else if(enemy.windup!==undefined){enemy.windup-=dt;if(enemy.marker)enemy.marker.userData.opacity=.3+(1-Math.max(0,enemy.windup)/.65)*.5;
          if(enemy.windup<=0){const radius=enemy.megaElite?1.7:1;if(ranged&&enemy.attackPoint&&enemyShots.length<80){
            const weapon=enemy.ranged!,fuma=weapon===2,direction=enemy.attackPoint.clone().sub(sprite.position).setY(0).normalize();

            const object=makeDropSprite(weapon===0?'kunai':'shuriken',0);object.scale.setScalar(fuma?1.1:.69);object.material.color.set(fuma?'#ff8f65':'#ffccd1');object.material.rotation=Math.atan2(direction.dot(v1),direction.dot(v2));object.position.copy(sprite.position).addScaledVector(direction,.45);scene.add(object);
            enemyShots.push({object,direction,life:1.25,speed:fuma?8:12,damage:(fuma?11:7)*threat.damage,radius:fuma?.72:.42});
          }else if(!ranged&&enemy.attackPoint&&Math.hypot(player.position.x-enemy.attackPoint.x,player.position.z-enemy.attackPoint.z)<radius&&invulnerability<=0){
            damagePlayer(10*(enemy.dmgMult??1)*threat.damage,enemy);
          }if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();enemy.marker=undefined;}enemy.windup=undefined;enemy.hitTimer=(ranged?2.25:.9)/threat.attackRate;}
        }else{enemy.hitTimer-=dt;if(distance>reach){if(moving&&distance>2.8&&distance<12)dir.addScaledVector(heading,Math.min(1.4,distance*.14));dir.normalize();enemy.sprite.position.addScaledVector(dir,enemy.speed*threat.speed*(enemy.slow?.75:1)*(movingSpecial?(enemy.jumping?1.2:1.85):1)*dt);enemy.sprite.position.y=terrainHeight(enemy.sprite.position.x,enemy.sprite.position.z)+enemy.sprite.scale.y*.46+leap;}
          else if(enemy.hitTimer<=0){enemy.windup=Math.max(.28,.65/Math.sqrt(threat.attackRate));enemy.attackPoint=player.position.clone();/* Aviso no chão desenhado em lote (enemyRenderer); o Mesh é só dado. */const marker=enemyRenderer.marker(ranged?.7:enemy.megaElite?1.7:1);marker.position.set(enemy.attackPoint.x,terrainHeight(enemy.attackPoint.x,enemy.attackPoint.z)+.2,enemy.attackPoint.z);enemy.marker=marker;}
        }
        if(motion){
          motion.update(dt,terrainHeight(sprite.position.x,sprite.position.z),1,1,movingEnemy,back,left,enemy.motionLevel??1,leap,movingSpecial&&!enemy.jumping,false,progress,progress);
          const outline=sprite.children[0];
          if(outline instanceof THREE.Sprite){outline.material.map=sprite.material.map;outline.material.rotation=sprite.material.rotation;}
        }
        if(defeated)break;
      }
      bossCombat.updateEffects(dt);updateTargetMarker();
      // Aliados seguem em formação, atacam automaticamente e fornecem regeneração de suporte.
      allyTimer-=dt;if(!defeated&&!sealing)for(const id of allies)gainAffinity(id,dt*AFFINITY_RULES.perSecond);
      for(let i=0;i<allyActors.length;i++){
        const ally=allyActors[i],angle=i*Math.PI*.8+1,motion=allyMotions.get(ally);
        const goal=new THREE.Vector3(player.position.x+Math.cos(angle)*2.6,0,player.position.z+Math.sin(angle)*2.6);
        dir.copy(goal).sub(ally.position);dir.y=0;
        const gap=dir.length(),follows=gap>.25,dash=follows&&slideTime>0;
        dir.normalize();
        if(gap>12)ally.position.copy(goal);
        else if(follows)ally.position.addScaledVector(dir,Math.min((speed+2)*(dash?2:1)*dt,gap));
        const floor=terrainHeight(ally.position.x,ally.position.z);
        ally.position.y=floor+ally.scale.y*.5+jumpHeight;
        const allyId=allies[i],form=formAt(allyId,level).level;
        if(ally.userData.form!==form){ally.material.dispose();ally.material=heroMaterial(allyId,level);ally.userData.form=form;}
        if(allyTimer<=0&&!defeated){
          const kit=HERO_BY_ID[allyId]?.techniques.filter(t=>!t.setup&&t.unlockLevel<=level)??[NPC_ALLIES[allyId].technique];
          const index=(ally.userData.nextTechnique??0)%Math.max(1,kit.length);
          if(kit[index]&&castTechnique(kit[index],ally.position,NO_GROWTH,true,false,motion))ally.userData.nextTechnique=index+1;
        }
        motion?.update(dt,floor,1,1,follows,dir.dot(v1)>0,dir.dot(v2)<0,level,jumpHeight,dash,false,1-jumpTime/jumpDuration,1-slideTime/slideDuration);
      }if(allyTimer<=0)allyTimer=allyInterval();
      if(!defeated){
      chakra=Math.min(100,chakra+100*dt/55*stats.ultimateRate*tune().ultimateRate);if(autoUlt&&chakra>=100)castUltimate();
      for(const t of techniques){if(!skillLevels[t.name])continue;cooldowns[t.name]=(cooldowns[t.name]||0)-dt;if(cooldowns[t.name]<=0){const g=growth[t.name]??NO_GROWTH;if(castTechnique(t,player.position,g))cooldowns[t.name]=t.setup?setupNumbers(t,g).cooldown:t.cooldown/Math.max(.1,stats.attackSpeed*(1+g.haste)*tempAttackSpeed());}}
      for(let i=pendingHits.length-1;i>=0;i--){pendingHits[i].time-=dt;if(pendingHits[i].time<=0){const p=pendingHits.splice(i,1)[0];p.run();}}
      for(let i=shadowClones.length-1;i>=0;i--){
        const clone=shadowClones[i],sprite=clone.sprite;clone.life-=dt;sprite.visible=!hiddenEffects;
        if(!enemyList.includes(clone.target)||clone.life<=0){disposeShadowClone(clone);shadowClones.splice(i,1);continue;}
        const target=clone.target.sprite.position;dir.copy(target).sub(sprite.position).setY(0);
        const gap=dir.length();dir.normalize();
        if(gap<=.76){
          const substitution=clone.technique.name==='Técnica de Substituição';
          const radius=.9*Math.sqrt(stats.area*(1+clone.growth.area));
          const victims=substitution?enemyList.filter(e=>Math.hypot(e.sprite.position.x-target.x,e.sprite.position.z-target.z)<=radius):[clone.target];
          for(const victim of victims)hit(victim,clone.technique,clone.growth,sprite.position,clone.ally);
          if(!hiddenEffects){
            if(substitution){const wood=techniqueVisual({...clone.technique,name:'Técnica de Substituição'});wood.position.copy(target);scene.add(wood);visuals.push({object:wood,life:.38});}
            addRing(sprite.position,substitution?'#e4ba80':'#e4ecff',substitution?radius:.68);
          }
          disposeShadowClone(clone);shadowClones.splice(i,1);continue;
        }
        sprite.position.addScaledVector(dir,Math.min(gap-.63,dt*(clone.technique.name==='Técnica de Substituição'?13:8.2)*stats.projectileSpeed));
        clone.motion.update(dt,terrainHeight(sprite.position.x,sprite.position.z),1,1,true,dir.dot(v1)>0,dir.dot(v2)<0,clone.level,0,false,false,0,0);
      }
      for(let i=shots.length-1;i>=0;i--){const shot=shots[i],travel=Math.min(shot.remaining,shot.speed*dt);shot.mesh.position.addScaledVector(shot.direction,travel);shot.mesh.position.y=terrainHeight(shot.mesh.position.x,shot.mesh.position.z)+1.1;shot.remaining-=travel;animateTechniqueVisual(shot.mesh,dt,shot.direction);
        for(const enemy of [...enemyList])if(!shot.hit.has(enemy)&&Math.hypot(enemy.sprite.position.x-shot.mesh.position.x,enemy.sprite.position.z-shot.mesh.position.z)<shot.radius+.4){shot.hit.add(enemy);hit(enemy,shot.technique,shot.growth,shot.origin,shot.ally);if(shot.technique.shape==='Projétil')shot.remaining=0;}
        // Ricochete (Seixo Polido do Rio): ao terminar, o projétil salta para o inimigo mais próximo ainda não atingido (até 6 m).
        if(shot.remaining<=0&&shot.bounces>0&&shot.hit.size>0){const next=enemyList.filter(e=>!shot.hit.has(e)&&Math.hypot(e.sprite.position.x-shot.mesh.position.x,e.sprite.position.z-shot.mesh.position.z)<6).sort((a,b)=>a.sprite.position.distanceToSquared(shot.mesh.position)-b.sprite.position.distanceToSquared(shot.mesh.position))[0];if(next){shot.bounces--;shot.direction.copy(next.sprite.position).sub(shot.mesh.position);shot.direction.y=0;shot.direction.normalize();shot.remaining=Math.min(shot.range,6.5);}}
        if(shot.remaining<=0){scene.remove(shot.mesh);disposeObject(shot.mesh);shots.splice(i,1);}}
      for(let i=drops.length-1;i>=0;i--){const drop=drops[i];{const base=drop.mesh.userData.baseScale||1;if(drop.type==='lamens')drop.mesh.scale.x=base*Math.max(.18,Math.abs(Math.cos(elapsed*3.2+i)));else{const pulse=1+Math.sin(elapsed*4+i)*.06;drop.mesh.scale.set(base*pulse,base*pulse,1);}}const ddx=player.position.x-drop.mesh.position.x,ddz=player.position.z-drop.mesh.position.z,dist=Math.hypot(ddx,ddz);
        if(!drop.magnet&&elapsed-drop.born>=DROP_RULES.settle&&dist<stats.pickup){drop.magnet=true;drop.speed=DROP_RULES.magnetSpeed*.4;}
        if(drop.magnet){drop.speed+=DROP_RULES.magnetAccel*dt;const step=Math.min(dist,drop.speed*dt);if(dist>0){drop.mesh.position.x+=ddx/dist*step;drop.mesh.position.z+=ddz/dist*step;}drop.mesh.position.y=player.position.y-.2;}
        else drop.mesh.position.y=terrainHeight(drop.mesh.position.x,drop.mesh.position.z)+.55+Math.sin(elapsed*3+i)*.1;
        if(drop.magnet&&dist-(drop.speed*dt)<=DROP_RULES.touch){
          if(drop.type==='xp')xp+=Math.round(drop.value*stats.xpGain*tune().xpGain);
          if(drop.type==='lamens')runMoney+=Math.round(drop.value*stats.moneyGain*tune().moneyGain);
          if(drop.type==='chakra')chakra=Math.min(100,chakra+drop.value);
          // 'item' não é mais gerado por abate; um drop legado não abre recompensa (itens só com interação).
          if(drop.type==='ramen'){hp=Math.min(stats.maxHp,hp+stats.maxHp*drop.value);if(!hiddenEffects)addRing(player.position,'#7dffb0',1.2);}
          if(currentSettings().pickupFx!=='nenhum'&&frames%3===0)playSfx('pickup');scene.remove(drop.mesh);drops.splice(i,1);
        }
      }
      if(!choiceData&&!sealing&&rouletteItems.length)showRouletteItem();
      if(!choiceData&&!sealing){if(xp>=xpNext||pendingLevels>0){if(pendingLevels>0)pendingLevels--;else xp-=xpNext;const oldForm=formAt(heroId,level).level;level++;refreshStats(true);xpNext=Math.ceil(xpToLevelUp(level)*tune().xpCurve);if(formAt(heroId,level).level!==oldForm){player.material.dispose();player.material=heroMaterial(heroId,level);eventToast=hero.name+' evoluiu: '+formAt(heroId,level).name+' · +25% do HP base';addRing(player.position,'#fff195',3);}choiceLevel=level;const offers=rollLevelOffers();choiceData=offers.length?offers:null;if(!offers.length){const attribute=grantTraining();eventToast='Nível '+level+' · '+POWERLEVEL_ATTRIBUTES[attribute]+' +0,8% extra (crescimento padrão também aplicado)';}invulnerability=3;keys.clear();}else if(pendingItemRewards>0){pendingItemRewards--;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}}
      } // Vivo
      } // Fora do ritual de selamento
      for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.scale.multiplyScalar(1+dt*2.4);const mat=fx.material as THREE.MeshBasicMaterial;mat.opacity-=dt*1.35;if(mat.opacity<=0){scene.remove(fx);fx.geometry.dispose();mat.dispose();effects.splice(i,1);}}
      for(let i=visuals.length-1;i>=0;i--){const fx=visuals[i];fx.life-=dt;fx.tick?.(dt);animateTechniqueVisual(fx.object,dt);if(fx.object instanceof THREE.LineSegments&&fx.object.userData.impact){fx.object.quaternion.copy(camera.quaternion);fx.object.scale.setScalar(1.4-3*fx.life);fx.object.material.opacity=Math.max(0,fx.life*5);}if(fx.life<=0){scene.remove(fx.object);disposeObject(fx.object);visuals.splice(i,1);}}
      for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.sprite.position.y+=dt*1.3;n.sprite.material.opacity=Math.max(0,n.life/.8);if(n.life<=0){damageNumbers.recycle(n.sprite);numbers.splice(i,1);}}
      // Só registra o evento depois que ele entra no campo visível da câmera.
      const frustum=viewFrustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      for(const event of events){if(!event.discovered&&frustum.containsPoint(event.obj.position)&&event.obj.position.distanceTo(player.position)<60){event.discovered=true;event.obj.visible=true;if(event===ichiraku)placeTeuchi();}}
      if(totem&&!totemDiscovered&&frustum.containsPoint(totem.sprite.position)&&totem.sprite.position.distanceTo(player.position)<60)totemDiscovered=true;
      for(const pickup of pickups){if(!pickup.discovered&&frustum.containsPoint(pickup.mesh.position)&&pickup.mesh.position.distanceTo(player.position)<60)pickup.discovered=true;}
      // Mega elites/guardiões entram no mapa só depois de vistos na câmera.
      for(const e of enemyList){if(e.megaElite&&!e.seen&&frustum.containsPoint(e.sprite.position)&&e.sprite.position.distanceTo(player.position)<40)e.seen=true;}
      }
      yaw=THREE.MathUtils.damp(yaw,targetYaw,22,dt);
      pitch=THREE.MathUtils.damp(pitch,targetPitch,20,dt);
      if(Math.abs(zoom-targetZoom)>.005){zoom=THREE.MathUtils.damp(zoom,targetZoom,16,dt);projectCamera();}
      if(scene.fog instanceof THREE.Fog){const extra=zoom*.65+10;scene.fog.near=weatherDef.near+extra;scene.fog.far=weatherDef.far+extra;}const targetHeight=terrainHeight(player.position.x,player.position.z)+1.15;
      const jumpedZone=Math.hypot(cameraTarget.x-player.position.x,cameraTarget.z-player.position.z)>10;
      cameraTarget.set(player.position.x,jumpedZone?targetHeight:THREE.MathUtils.damp(cameraTarget.y,targetHeight,10,dt),player.position.z);
      const orbitDistance=zoom*1.65+10;
      const ox=Math.sin(yaw),oz=Math.cos(yaw);
      const scanDistance=Math.min(140,(zoom*.5+4)/Math.sin(pitch));
      // Deixa deitar a câmera em terreno aberto e sobe o necessário para não ocultar o jogador atrás de encostas.
      let viewPitch=pitch;
      for(let d=5;d<=scanDistance;d+=3){
        const surface=terrainHeight(cameraTarget.x+ox*d,cameraTarget.z+oz*d);
        viewPitch=Math.max(viewPitch,Math.atan2(surface-cameraTarget.y+1.1,d));
      }
      offset.set(ox*Math.cos(viewPitch),Math.sin(viewPitch),oz*Math.cos(viewPitch)).multiplyScalar(orbitDistance);
      // Em ortográfica, o chão visível na parte de baixo pode cair atrás da origem da câmera.
      const near=Math.min(.1,orbitDistance-(zoom*.5+4)/Math.sin(viewPitch));
      if(Math.abs(camera.near-near)>.05){camera.near=near;camera.updateProjectionMatrix();}
      camera.position.copy(cameraTarget).add(offset);
      camera.position.y=Math.max(camera.position.y,terrainHeight(camera.position.x,camera.position.z)+1.2);
      const viewX=camera.position.x-player.position.x,viewZ=camera.position.z-player.position.z,viewLength=Math.hypot(viewX,viewZ);
      for(const obj of occluders){const dx=obj.position.x-player.position.x,dz=obj.position.z-player.position.z;const depth=(dx*viewX+dz*viewZ)/viewLength,side=Math.abs(dx*viewZ-dz*viewX)/viewLength;const overlap=depth>0&&depth<obj.scale.y+2&&side<obj.scale.x*.45;obj.material.opacity=THREE.MathUtils.damp(obj.material.opacity,overlap?.22:1,20,dt);}
      camera.lookAt(cameraTarget);camera.updateMatrixWorld();
      if(enabledRef.current&&!defeated&&!victory)updateRoute();if(routeNotice&&performance.now()>routeNotice.until){routeNotice=null;snapshotTimer=0;}
      frames++;fpsTimer+=dt;if(fpsTimer>=.5){fps=Math.round(frames/fpsTimer);frames=0;fpsTimer=0;}snapshotTimer-=dt;if(snapshotTimer<=0){onSnapshotRef.current({enemyCount:enemyList.length,powerlevel:{...powerlevel},allyCharge:allyActors.length?Math.min(1,Math.max(0,1-allyTimer/allyInterval())):0,victory,remaining:Math.max(0,ZONE_SECONDS-zoneElapsed()),overtime:overtimeNow(),phase:portal?.kind==='exit'?'exit':arena?'arena':'zone',bijuu:enemyList.find(e=>e.bijuu)?.boss?.name??defeatedBijuu,bijuuReward,plansUsed,hiddenEffects,totalDamage:Math.round(totalDamage),skillDamage:{...skillDamage},skillGrowth:{...growth},techniques:techniques.filter(t=>skillLevels[t.name]||(!banned.has(t.name)&&!config.archivedSkills.includes(t.name)&&!consumedTechniques.has(t.name))),banned:[...banned],synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),setups:activeSetups.map(s=>({name:s.name,remaining:s.remaining,duration:s.duration})),zone,skillTimers:Object.fromEntries(techniques.filter(t=>skillLevels[t.name]).map(t=>{const g=growth[t.name]??NO_GROWTH;return [t.name,{remaining:Math.max(0,cooldowns[t.name]||0),total:t.setup?setupNumbers(t,g).cooldown:t.cooldown/Math.max(.1,stats.attackSpeed*(1+g.haste)*tempAttackSpeed()),duration:activeSetups.find(setup=>setup.name===t.name)?.remaining??0}];})),boss:enemyList.filter(e=>e.guardian).map(e=>(e.bijuu?e.boss?.name+' · Fase '+e.boss?.phase+'/3':HERO_BY_ID[e.heroId!].name)+' · '+compactNumber(Math.ceil(e.hp))+'/'+compactNumber(e.maxHp??e.hp)+' HP'+(e.shikamaruPlans?' · +'+e.shikamaruPlans+' kunai (Shikamaru)':'')).join(', '),defenseProgress:defenseActive&&defenseAltar?Math.floor(defenseTime/altarTimes[defenseAltar.altarTier??0]*100):0,hp:Math.ceil(hp),maxHp:stats.maxHp,stats:{...stats},defeated,allyDamage:Math.round(allyDamage),difficultyScale:threatNow().hp,level,xp,xpNext,chakra,kills,runMoney,elapsed,fps,kunai,shuriken,luck,autoUlt,allies:[...allies],affinity:{...allyAffinity},weather,toast:eventToast,interaction:(()=>{if(sealing)return{name:`Mega Elite · ${sealing.target}`,description:sealing.phase==='ready'?'E sela · G recusa e deixa um drop':sealing.phase==='sealing'?'Concluindo o jutsu de selamento…':'Enter para continuar'};if(portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<3.2)return{name:portalTitle(portal.kind),description:portal.kind==='exit'?'E · finalizar e receber '+bijuuReward+' Lamens':'E · atravessar portal'};const p=pickups.find(p=>p.active&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<3.2);if(p)return{name:p.name,description:p.kind==='kunai'||p.kind==='shuriken'?'E · '+compactNumber(kunaiPrice())+' Ryu · escolher 1 de '+offerCount()+' itens':'E · coletar recompensa grátis'};const e=events.find(e=>e.active&&Math.hypot(e.x-player.position.x,e.z-player.position.z)<3.6);return e?{name:e.name,description:e.id==='guardian-seal'?`E · invocar o guardião agora · ~${compactNumber(guardianHpNow())} HP · ${Math.round(guardianDefense(elapsed)*100)}% de defesa`:e.id==='slot'?`E · abrir a roleta · giro ${compactNumber(slotPrice())} Ryu (×${String(ROULETTE_RULES.costGrowth).replace('.',',')} por giro e sobe com o tempo) · Sorte ${stats.luck}`:e.id==='shikamaru'?(shikamaruPlans>=GUARDIAN_RULES.shikamaruMaxPlans?`Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · limite atingido nesta zona`:`E · Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · +1 kunai ao derrotar o guardião`):"Aperte E para interagir"}:null;})(),pickups:pickups.filter(p=>p.active&&p.discovered).map(p=>({kind:p.kind,x:p.x,z:p.z,id:p.id,name:p.name})),items:{...knownItems},pills:{...knownPills},pillQuality:{...pillQuality},skillLevels:{...skillLevels},choice:choiceData?{level:choiceLevel,cards:choiceData,sale:choiceLevel===0||choiceLevel===-9?saleValue():undefined,rerollCost:choiceLevel===-8?merchantRerollCost():undefined}:null,sealing:sealing?{...sealing}:null,enemies:mapEnemyDots(),events:mapMarkers(),route:routeView(),routeNotice:routeNotice?{text:routeNotice.text,kind:routeNotice.kind}:null,roulette:rouletteView(),totem:totem?{hp:Math.ceil(totem.hp),maxHp:Math.ceil(totem.maxHp||0),remaining:Math.max(0,TOTEM_RULES.end-elapsed)}:null,explored:[...exploredCells.values()],player:{x:player.position.x,z:player.position.z,heading:Math.atan2(heading.x,-heading.z)},ping:currentPing,effects:effects.length,choices:{...uses,banning},weaponCost:kunaiPrice(),merchantRerollCost:merchantRerollCost(),tsunadeSpinCost:slotPrice(),permanent});snapshotTimer=.2;}
      const sliding=slideTime>0;
      const facing=sliding?dashHeading:heading;
      const viewBack=facing.dot(v1) > (sliding ? .001 : .18);
      const viewLeft=facing.dot(v2) < (sliding ? -.001 : -.18);
      playerMotion.update(pausedRef.current||choiceData||roulette||sealing?0:dt,terrainHeight(player.position.x,player.position.z),hp,stats.maxHp,moving&&!defeated&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(key=>keys.has(key)),viewBack,viewLeft,level,jumpHeight,sliding,Math.abs(heading.dot(v1))>.32&&Math.abs(heading.dot(v2))>.32,1-jumpTime/jumpDuration,1-slideTime/slideDuration);
      if(sandCloud){sandCloud.visible=jumpHeight>0&&!defeated&&keys.has(' ')&&sandGlideLeft>0&&jumpTime<=jumpDuration*.5;sandCloud.position.set(player.position.x,player.position.y-player.scale.y*.5-.18,player.position.z);}
      if(portal)portal.mesh.rotation.y=yaw;
      sageAura.sprite.visible=enabledRef.current&&!hiddenEffects&&sageModeActive()&&!defeated;
      if(sageAura.sprite.visible){sageAura.sprite.position.copy(player.position);sageAura.sprite.position.y+=.43;sageAura.frame(Math.floor(elapsed*9)%4);}
      enemyRenderer.sync(enemyList);const perfT1=performance.now();renderer.render(scene,camera);perfMonitor.record(perfT0,perfT1,performance.now());
    });
    const debugWindow=window as unknown as {__shinobiTest?:Record<string,unknown>};
    // ───── Salvar e retomar a run (Esc → "Salvar e sair", salvamento automático e ao fechar o navegador) ─────
    // Salva o progresso da run (tempo, abates, nível, itens, pílulas, técnicas, ajudantes, eventos, mapa explorado...).
    // Hordas, drops e projéteis vivos não são salvos: voltam a surgir naturalmente ao retomar.
    function serializeRun():SavedRun{return {powerlevel:{...powerlevel},v:1,heroId,mission,mapId,savedAt:Date.now(),elapsed,zone,level,xp,xpNext,kills,runMoney,kunai,shuriken,chakra,hp,bonusHp,totalDamage,allyDamage,skillDamage:{...skillDamage},knownItems:{...knownItems},knownPills:{...knownPills},pillQuality:{...pillQuality},skillLevels:{...skillLevels},growth:JSON.parse(JSON.stringify(growth)),allies:[...allies],allyAffinity:{...allyAffinity},runBuffs:{...runBuffs},uses:{...uses},banned:[...banned],events:events.map(e=>({id:e.id,active:e.active,uses:e.uses,discovered:!!e.discovered})),explored:[...exploredCells.keys()],ryuSpent,rouletteSpins,paidWeapons,guardianSpawned,shikamaruPlans,megaElitesSpawned,zoneDifficulty,xpMultiplier,lootMultiplier,totemSpawned,pendingItemRewards,defenseDone,player:{x:player.position.x,z:player.position.z},accountTried:[...accountTried],merchant:{...merchant,stock:[...merchant.stock]},rouletteItems:[...rouletteItems],rouletteSession:roulette,campaign:{start:zoneStart,merges:[...merges.values()],megaSchedule:[...megaSchedule],accountEncounters,plans:plansUsed,arena,reward:bijuuReward,bijuu:defeatedBijuu,portal:portal?{kind:portal.kind,x:portal.x,z:portal.z}:undefined,boss:enemyList.filter(e=>e.bijuu).map(e=>({id:e.heroId!,hp:e.hp,maxHp:e.maxHp!}))[0],locations:events.map(e=>({id:e.id,x:e.x,z:e.z})),pickups:pickups.filter(p=>p.active).map(p=>({kind:p.kind,x:p.x,z:p.z,discovered:!!p.discovered}))}};}
    function saveRun(){if(defeated||victory)return;try{localStorage.setItem(SAVED_RUN_KEY,JSON.stringify(serializeRun()));}catch{/* sem armazenamento */}}
    function restoreRun(s:SavedRun){Object.assign(powerlevel,readPowerlevel(s.powerlevel));elapsed=s.elapsed;zone=s.zone;const camp=s.campaign;zoneStart=camp?.start??Math.max(0,(zone-1)*200);for(const plan of camp?.merges??[]){const technique=mergedTechnique(plan,techniques);if(technique){techniques.push(technique);merges.set(technique.name,plan);plan.names.forEach(name=>consumedTechniques.add(name));}}megaSchedule=camp?.megaSchedule??megaSchedule;accountEncounters=camp?.accountEncounters??0;plansUsed=camp?.plans??s.shikamaruPlans;arena=camp?.arena??false;bijuuReward=camp?.reward??0;defeatedBijuu=camp?.bijuu??'';level=s.level;xp=s.xp;xpNext=s.xpNext;kills=s.kills;runMoney=s.runMoney;kunai=s.kunai;shuriken=s.shuriken;chakra=s.chakra;bonusHp=s.bonusHp;totalDamage=s.totalDamage;allyDamage=s.allyDamage;Object.assign(skillDamage,s.skillDamage);Object.assign(knownItems,s.knownItems);Object.assign(knownPills,Object.fromEntries(Object.entries(s.knownPills).filter(([name,lv])=>PILL_BY_NAME[name]&&lv>0).sort((a,b)=>b[1]-a[1]).slice(0,PILL_SLOTS)));Object.assign(pillQuality,s.pillQuality??{});Object.assign(skillLevels,s.skillLevels);Object.assign(growth,s.growth);Object.assign(runBuffs,s.runBuffs);Object.assign(uses,s.uses);for(const b of s.banned)banned.add(b);
      for(const saved of s.events){const e=events.find(x=>x.id===saved.id);if(e){e.active=saved.active;e.uses=saved.uses;e.discovered=saved.discovered;e.obj.visible=saved.discovered;}}
      for(const key of s.explored){const [gx,gz]=key.split(',').map(Number);exploredCells.set(key,{x:gx*5,z:gz*5});}
      ryuSpent=s.ryuSpent;rouletteSpins=s.rouletteSpins;paidWeapons=s.paidWeapons;guardianSpawned=!!camp?.portal||arena;if(!guardianSpawned){const seal=events.find(e=>e.id==='guardian-seal');if(seal)seal.active=true;}shikamaruPlans=s.shikamaruPlans;megaElitesSpawned=s.megaElitesSpawned;zoneDifficulty=s.zoneDifficulty;xpMultiplier=s.xpMultiplier;lootMultiplier=s.lootMultiplier;totemSpawned=s.totemSpawned;pendingItemRewards=s.pendingItemRewards;defenseDone=s.defenseDone;for(const id of s.accountTried)accountTried.add(id);
      if(s.merchant)Object.assign(merchant,s.merchant);rouletteItems.push(...(s.rouletteItems??[]));
      roulette=s.rouletteSession??null;rouletteSeq=roulette?.pending.at(-1)?.seq??0;
      for(const point of camp?.locations??[]){const e=events.find(e=>e.id===point.id);if(e){e.x=point.x;e.z=point.z;e.obj.position.set(e.x,terrainHeight(e.x,e.z)+e.obj.scale.y*.45,e.z);}}
      if(camp?.pickups){for(const p of pickups)scene.remove(p.mesh);pickups.length=0;for(const p of camp.pickups){spawnPickup(p.kind,p.x,p.z);pickups.at(-1)!.discovered=p.discovered;}}
      if(camp?.portal)openPortal(camp.portal.kind,camp.portal.x,camp.portal.z);
      if(arena){weather='Arena da Bijuu';for(const e of events)e.obj.visible=false;if(camp?.boss)spawnBijuu(camp.boss.id,camp.boss);}placeTeuchi();
      refreshStats();for(const id of s.allies)recruitAlly(id);Object.assign(allyAffinity,s.allyAffinity);refreshStats();hp=Math.min(stats.maxHp,s.hp);if(!roulette)showRouletteItem();
      player.position.set(s.player.x,terrainHeight(s.player.x,s.player.z)+1.15,s.player.z);player.material.dispose();player.material=heroMaterial(heroId,level);invulnerability=3;eventToast='Missão retomada de onde parou.';}
    if(resume&&resume.heroId===heroId)restoreRun(resume);
    const onSettings=()=>{const S=currentSettings();renderer.setPixelRatio(pixelRatioFor(S));targetZoom=S.cameraDistance;resize();};window.addEventListener('shinobi-settings',onSettings);runCleanups.push(()=>window.removeEventListener('shinobi-settings',onSettings));
    const autosave=window.setInterval(()=>{if(enabledRef.current&&!pausedRef.current)saveRun();},15000);
    const onPageHide=()=>saveRun();window.addEventListener('pagehide',onPageHide);window.addEventListener('beforeunload',onPageHide);
    const onSaveEvent=()=>saveRun();window.addEventListener('shinobi-save',onSaveEvent);
    const onForfeit=()=>{if(defeated||victory)return;hp=0;defeated=true;eventToast='Você desistiu da missão.';};window.addEventListener('shinobi-forfeit',onForfeit);
    const onStuck=()=>{const len=Math.hypot(player.position.x,player.position.z)||1,step=Math.min(8,len);player.position.x-=player.position.x/len*step;player.position.z-=player.position.z/len*step;player.position.y=terrainHeight(player.position.x,player.position.z)+1.15;invulnerability=Math.max(invulnerability,2);eventToast='Preso? Você foi movido para uma área livre.';};window.addEventListener('shinobi-stuck',onStuck);
    runCleanups.push(()=>{window.clearInterval(autosave);window.removeEventListener('pagehide',onPageHide);window.removeEventListener('beforeunload',onPageHide);window.removeEventListener('shinobi-save',onSaveEvent);window.removeEventListener('shinobi-forfeit',onForfeit);window.removeEventListener('shinobi-stuck',onStuck);});    if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test'))debugWindow.__shinobiTest={
      finishMission:()=>{victory=true;snapshotTimer=0;eventToast='Missão concluída!';return victory;},
      dropShowcase:()=>{const p=player.position;const list:[Drop['type'],number][]=[['xp',8],['xp',25],['xp',100],['chakra',9],['lamens',3],['ramen',RAMEN_DROP.heal],['pill',1],['item',1]];list.forEach(([type,value],n)=>{const at=new THREE.Vector3(p.x-5.6+n*1.6,0,p.z+3.2);addDrop(at,type,value,type==='pill'?Object.keys(knownPills)[0]||'':'');});return drops.length;},
      drops:()=>drops.map(d=>({type:d.type,value:d.value,scale:+d.mesh.scale.y.toFixed(2)})),
      grantItem,spawn:(id:string)=>spawnEnemy(false,true,false,id),defeatMega:(id:string)=>{const e=spawnEnemy(false,true,false,id);removeEnemy(e);},
      reward:()=>{choiceLevel=level;const cards=rollLevelOffers();choiceData=cards.length?cards:null;},kakashi:()=>{openKakashi(events.find(e=>e.id==='arsenal')!);return choiceLevel;},kakashiActive:()=>events.find(e=>e.id==='arsenal')!.active,arsenal:()=>{openKakashi(events.find(e=>e.id==='arsenal')!);return choiceLevel;},accountShinobi:(id:string)=>{const e=spawnEnemy(false,false,false,id,true);e.speed=0;return {tier:e.tier,hp:e.maxHp,defense:e.defense};},spawnElite:()=>{forceElite=true;const e=spawnEnemy();forceElite=false;const a=Math.random()*6.28;e.sprite.position.set(player.position.x+Math.cos(a)*5,e.sprite.position.y,player.position.z+Math.sin(a)*5);e.speed=0;return {tier:e.tier,hp:e.maxHp,defense:e.defense,dmg:e.dmgMult};},enemyTiers:()=>enemyList.map(e=>({tier:e.tier,account:!!e.account,hp:Math.round(e.hp)})),killAll:()=>{for(const e of [...enemyList])if(!e.totem)takeDamage(e,1e9,'#fff');},ichiraku:()=>{openIchiraku();return choiceLevel;},teuchi:()=>({visible:teuchi.visible,offset:teuchi.position.distanceTo(ichiraku.obj.position),x:ichiraku.x,z:ichiraku.z}),grantPill:(name:string)=>{grantPill(knownPills,name,ex('pillCap'));refreshStats(true);},loot:()=>{choiceLevel=0;choiceData=rollMegaLoot();},
      setLevel:(n:number)=>{level=n;player.material.dispose();player.material=heroMaterial(heroId,n);refreshStats(true);},
      clearDrops:()=>{for(const drop of drops)scene.remove(drop.mesh);drops.length=0;},
      learn:(name:string)=>{skillLevels[name]=1;},clearEnemies:()=>{for(const e of [...enemyList]){scene.remove(e.sprite);if(e.marker)scene.remove(e.marker);bossCombat.dispose(e);}enemyList.length=0;},
      setTime:(n:number)=>{elapsed=n;},
      // Perfil de desempenho: horda de N inimigos comuns num disco ao redor do jogador (HP alto para sobreviverem aos golpes) e leitura do quadro.
      horde:(n:number,radius=14,hpEach=1e6,move=true)=>{for(let k=0;k<n;k++){const e=spawnEnemy(),a=Math.random()*Math.PI*2,r=2+Math.sqrt(Math.random())*radius,x=player.position.x+Math.cos(a)*r,z=player.position.z+Math.sin(a)*r;e.sprite.position.set(x,terrainHeight(x,z)+e.sprite.scale.y*.46,z);e.hp=hpEach;e.maxHp=hpEach;if(!move)e.speed=0;}return enemyList.length;},
      perf:(reset=false)=>{const out={...perfMonitor.read(),fpsHud:fps,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs?.length??0,sceneChildren:scene.children.length,instances:enemyRenderer.stats(),numberCache:damageNumbers.stats(),elites:enemyList.filter(e=>e.elite).length,enemies:enemyList.length,effects:effects.length,visuals:visuals.length,numbers:numbers.length,drops:drops.length,shots:shots.length,heap:(performance as unknown as {memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize??0};if(reset)perfMonitor.reset();return out;},
      teleport:(x:number,z:number)=>{player.position.set(x,terrainHeight(x,z)+1.15,z);},
      setMoney:(n:number)=>{runMoney=n;},pickup:(kind:MapPickup['kind'])=>spawnPickup(kind,player.position.x,player.position.z),dismiss:()=>{choiceData=null;sealing=null;xp=0;},
      addXp:(n:number)=>{xp+=n;},setChakra:()=>{chakra=100;},setHp:(n:number)=>{hp=n;},
      target:(distance=2)=>{const e=spawnEnemy();e.sprite.position.copy(player.position).add(new THREE.Vector3(distance,0,0));e.hp=10000;e.speed=0;return enemyList.length;},
      cast:(name:string)=>{const t=techniques.find(t=>t.name===name);return t?castTechnique(t,player.position,growth[name]??NO_GROWTH,false,true):false;},
      // Testes de velocidade/setup/Senjutsu.
      castDelayed:(name:string)=>{const t=techniques.find(t=>t.name===name);return t?castTechnique(t,player.position,growth[name]??NO_GROWTH):false;},
      senjutsu:(chance:number|null)=>{senjutsuOverride=chance;},
      combat:()=>({projectileSpeed:stats.projectileSpeed,attackSpeed:stats.attackSpeed,bounce:stats.bounce,shots:shots.map(s=>({name:s.technique.name,speed:s.speed,bounces:s.bounces})),pendingHits:pendingHits.map(p=>p.time),setups:activeSetups.map(s=>({...s})),sageMode:sageModeActive(),senjutsuProcs,cooldowns:{...cooldowns},allyInterval:allyInterval(),damage:stats.damage,move:stats.moveSpeed}),
      setRunBuff:(key:string,value:number)=>{runBuffs[key as keyof Bonuses]=value;refreshStats();},
      setGrowth:(name:string,g:Partial<SkillGrowth>)=>{growth[name]={...NO_GROWTH,...g};},
      setCrit:(n:number)=>{runBuffs.crit=n;refreshStats();},recruitAlly,
      hurt:(n:number)=>damagePlayer(n),
      summonGuardian:()=>{const g=summonGuardian();return g?{heroId:g.heroId,maxHp:g.maxHp,hpMultiplier:g.hpMultiplier}:null;},shikamaru:()=>useShikamaruPlan(),
      freeKunai:()=>pickups.filter(p=>p.active&&p.kind==='sealDrop').map(p=>({x:p.x,z:p.z})),portalAt:()=>portal?{x:portal.x,z:portal.z,kind:portal.kind}:null,
      accountCandidates:(setKills?:number)=>{if(setKills!==undefined)kills=setKills;return accountCandidates().map(h=>h.id);},
      defeatGuardian:()=>{const g=enemyList.find(e=>e.guardian);if(!g)return null;const before=pickups.filter(p=>p.active&&p.kind==='sealDrop').length;removeEnemy(g);return pickups.filter(p=>p.active&&p.kind==='sealDrop').length-before;},
      guardian:()=>({zone,zoneElapsed:zoneElapsed(),spawned:guardianSpawned,shikamaruPlans,hpMultiplierNow:guardianHpMultiplier(zoneElapsed()),alive:enemyList.filter(e=>e.guardian).map(e=>({heroId:e.heroId,hp:e.hp,maxHp:e.maxHp,hpMultiplier:e.hpMultiplier,shikamaruPlans:e.shikamaruPlans})),freeKunaiOnGround:pickups.filter(p=>p.active&&p.kind==='sealDrop').length,kunai,shuriken,toast:eventToast}),
      // Roleta da Tsunade: abrir, girar N vezes sem animação (semente/casa forçada), estado, sair, simulação estatística.
      sageAuraVisible:()=>sageAura.sprite.visible,
      sages:()=>{openSages();return choiceData?.length??0;},
      cloneMotion:()=>shadowClones.map(clone=>clone.motion.state()),
      gamabuntaPhase:()=>visuals.find(effect=>effect.object.userData.gamabuntaPhase)?.object.userData.gamabuntaPhase,
      totemMotion:()=>({sign:totem?.sprite.material.map===totemHands,clones:enemyList.filter(e=>e.clone).map(e=>({pose:e.motion?.state(),distance:Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)}))}),
      spawnRanged:()=>{const enemy=spawnEnemy();enemy.ranged=2;enemy.speed=0;enemy.sprite.position.copy(player.position).add(new THREE.Vector3(5,0,0));return enemy.hp;},
      rangedState:()=>({foes:enemyList.filter(e=>e.ranged!==undefined).length,shots:enemyShots.length}),
      enemyFrames:()=>enemyList.filter(e=>enemyRenderer.isBatched(e.sprite)).map(e=>e.sprite.userData.frame as number),
      supportMotion:()=>[...allyMotions.values()].map(motion=>({pose:motion.state(),atlas:motion.atlas()})),
      motion:()=>({pose:playerMotion.state(),atlas:playerMotion.atlas(),flipped:(player.material.map?.repeat.x??1)<0,jumpHeight,slideTime,slideRecovery,x:player.position.x,z:player.position.z,cameraHeight:cameraTarget.y,pitch,yaw,zoom}),
      campaign:()=>({zone,zoneElapsed:zoneElapsed(),arena,portal:portal?.kind,plansUsed,bijuuReward,beast:enemyList.find(e=>e.bijuu)?.heroId,events:events.map(e=>({id:e.id,x:e.x,z:e.z})),ryu:pickups.filter(p=>p.active&&p.kind==='ryu').length}),
      enterPortal:()=>enterPortal(),
      bossArt:(id:string)=>{
        const beast=enemyList.find(e=>e.bijuu&&e.heroId===id)??spawnBijuu(id);
        const art=beast.sprite.material.map?.image as HTMLImageElement|undefined;
        return art?.naturalWidth?art.src:'';
      },
      merchant:()=>showMerchant(),
      roulette:{
        open:()=>openRoulette(),
        seed:(n:number|null)=>{rouletteRng=n==null?Math.random:seededRng(n);},
        spin:(n=1,forced?:RouletteCasaId)=>{const out:unknown[]=[];for(let i=0;i<n;i++){const r=spinRoulette(forced);out.push(r.ok?r.prize:r.reason);if(!r.ok)break;}return out;},
        state:()=>({open:!!roulette,view:rouletteView(),cost:slotPrice(),spins:rouletteSpins,ryuSpent,runMoney,kunai,shuriken,pendingItemRewards,luck:stats.luck,zoneDifficulty,zone,damage:stats.damage,setups:activeSetups.map(s=>({name:s.name,remaining:s.remaining,bonuses:{...s.bonuses}})),pills:{...knownPills},enemies:enemyList.length,choice:!!choiceData,toast:eventToast}),
        exit:()=>closeRoulette(),
        sim:(luck:number,pressure:number,n=20000,seed=1)=>{const w=rouletteWeights(luck,pressure),rng=seededRng(seed),count:Record<string,number>={};for(let i=0;i<n;i++){const id=rollRoulette(w,rng);count[id]=(count[id]||0)+1;}let good=0,bad=0;for(const [id,c] of Object.entries(count)){const k=ROULETTE_BY_ID[id as RouletteCasaId].kind;if(k==='bom')good+=c;else if(k==='ruim')bad+=c;}return{weights:w,count,good:good/n,bad:bad/n};},
        setCurse:(v:number)=>{zoneDifficulty=v;},setZone:(z:number)=>{zone=z;},
      },
      // Ebisu / Iruka / Naruto Totem.
      ebisu:()=>{openEbisu(events.find(e=>e.id==='ebisu')!);return choiceLevel;},iruka:()=>{openIruka(events.find(e=>e.id==='iruka')!);return choiceLevel;},
      npcState:()=>({choiceLevel,choice:choiceData,deals:npcDeals.map(d=>({...d})),runBuffs:{...runBuffs},extra:{...stats.extra},allies:[...allies],slots:stats.supportSlots,xpGain:stats.xpGain,ebisuActive:events.find(e=>e.id==='ebisu')!.active,irukaActive:events.find(e=>e.id==='iruka')!.active}),
      // Aliados/afinidade/substituição (testes do navegador).
      recruit:(id:string)=>recruitAlly(id),affinity:()=>({...allyAffinity}),addAffinity:(id:string,n:number)=>{gainAffinity(id,n);refreshStats();return allyAffinity[id];},
      replaceState:()=>({choiceLevel:choiceData?choiceLevel:null,candidate:replaceCandidate,allies:[...allies],affinity:{...allyAffinity},sealing:sealing?{...sealing}:null,pending:pendingSeals.length,cards:choiceData?.map(c=>({name:c.name,allyId:c.allyId,allyNew:c.allyNew})),synergies:activeSynergies(heroId,allies).map(s=>({id:s.id,tier:s.tier,members:s.members,bonuses:s.bonuses})),projectiles:stats.projectiles,projectileChance:stats.projectileChance,xpGain:stats.xpGain,pickup:stats.pickup,damage:stats.damage,toast:eventToast}),
      fillAllies:(n:number)=>{const ids=HEROES.filter(h=>h.family===h.id).map(h=>h.id).filter(id=>id!==heroId&&!allies.includes(id));for(let k=0;k<n&&ids.length;k++)recruitAlly(ids.shift()!);return allies.length;},
      totem:()=>({spawned:totemSpawned,alive:!!totem,hp:totem?.hp??0,maxHp:totem?.maxHp??0,discovered:totemDiscovered,result:totemResult,clones:enemyList.filter(e=>e.clone).length,enemies:enemyList.length,pendingLevels,level,xp,xpNext,elapsed,kills,sealing,choiceLevel:choiceData?choiceLevel:null,drops:drops.filter(d=>d.type==='xp').length,mapEvent:totemDiscovered&&!!totem}),
      damageTotem:(n:number)=>{if(totem)takeDamage(totem,n,'#ffffff');return totem?.hp??0;},
      killClones:(n=999)=>{let k=0;for(const e of enemyList.filter(e=>e.clone).slice(0,n)){takeDamage(e,1e9,'#ffffff');k++;}return k;},
      collectDrops:()=>{for(const d of drops){d.mesh.position.set(player.position.x,d.mesh.position.y,player.position.z);d.born=-99;}},
      // Mapa/rota: definir rota por id de marcador, ping livre, inspecionar distância, revelar/consumir eventos e teleportar perto.
      mapRoute:{
        set:(id:string|null)=>setRoute(id),ping:(x:number,z:number)=>{setPingRoute(x,z);return routeView();},clear:()=>setRoute(null),
        state:()=>({route:routeView(),notice:routeNotice?{text:routeNotice.text,kind:routeNotice.kind}:null,ping:currentPing,player:{x:player.position.x,z:player.position.z},markers:mapMarkers().map(m=>m.id),toast:eventToast}),
        discover:(id?:string)=>{let n=0;for(const e of events)if(!id||e.id===id){e.discovered=true;e.obj.visible=true;if(e===ichiraku)placeTeuchi();n++;}return n;},
        discovered:()=>events.filter(e=>e.discovered).map(e=>e.id),
        consume:(id:string)=>{const e=events.find(e=>e.id===id);if(e)e.active=false;return !!e;},
        near:(id:string,d=6)=>{const t=findRouteTarget(id)??events.find(e=>e.id===id);if(!t)return null;const x=THREE.MathUtils.clamp(t.x+d,-WORLD_LIMIT,WORLD_LIMIT),z=t.z;player.position.set(x,terrainHeight(x,z)+1.15,z);return routeDistance(t);},
        step:(dx:number,dz:number)=>{const x=THREE.MathUtils.clamp(player.position.x+dx,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(player.position.z+dz,-WORLD_LIMIT,WORLD_LIMIT);player.position.set(x,terrainHeight(x,z)+1.15,z);return route?routeDistance(route):null;},
        god:(on=true)=>{debugState.god=on;},
        megaSeen:(id:string,x?:number,z?:number)=>{const e=spawnEnemy(false,true,false,id);e.seen=true;e.speed=0;e.control='Paralisar';e.controlTime=1e9;if(x!==undefined&&z!==undefined)e.sprite.position.set(x,terrainHeight(x,z)+1.6,z);return 'mega-'+e.uid;},
        kill:(markerId:string)=>{const e=enemyList.find(e=>'mega-'+e.uid===markerId);if(!e)return false;removeEnemy(e);sealing=null;pendingSeals.length=0;return true;},
      },
      inspect:()=>({skillDamage:{...skillDamage},kunaiPrice:kunaiPrice(),defeated,pills:{...knownPills},hp,chakra,autoUlt,player:{x:player.position.x,z:player.position.z},atlasReady:!!(player.material.map?.image as HTMLImageElement)?.width,visibleShots:shots.filter(s=>s.mesh.visible).length,impacts:visuals.filter(fx=>fx.object.userData.impact&&fx.object.visible).length,visibleNumbers:numbers.filter(n=>n.sprite.visible).length,heroId,level,form:formAt(heroId,level).name,hiddenEffects,totalDamage,stats,allies,synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),skills:{...skillLevels},growth:{...growth},enemies:enemyList.map(e=>({maxHp:e.boss?.maxHp,casting:e.boss?.cast?.technique.name,bar:!!e.boss?.bar.parent,hp:e.hp,heroId:e.heroId,control:e.control,controlTime:e.controlTime})),items:{...knownItems},uses:{...uses},paidWeapons,runMoney,choice:choiceData,sealing,elapsed}),
    };
    // API do painel debug. GameCanvas só a entrega com debug=true (servidor de desenvolvimento).
    const disposeEnemy=(e:Enemy)=>{bossCombat.dispose(e);scene.remove(e.sprite);e.sprite.material.dispose();if(e.marker){scene.remove(e.marker);e.marker.geometry.dispose();(e.marker.material as THREE.Material).dispose();}};
    debugApiRef.current={
      inspect:()=>({hp,maxHp:stats.maxHp,level,xp,xpNext,chakra,runMoney,elapsed,zone,enemies:enemyList.length,megaElites:enemyList.filter(e=>e.megaElite).length,kills,god:debugState.god,frozen:debugState.frozen,stats:{...stats},threat:threatNow(),items:{...knownItems},pills:{...knownPills}}),
      grantItem,
      grantPill:(name:string)=>{if(grantPill(knownPills,name,ex('pillCap'))){refreshStats(true);eventToast='Debug: '+name+' concedida';}else eventToast='Debug: '+name+' já está no limite';},
      levelUp:()=>{xp=Math.max(xp,xpNext);},
      setLevel:(n:number)=>{const next=Math.max(1,Math.min(99,Math.floor(n)||1));level=next;xp=0;xpNext=Math.ceil(xpToLevelUp(level)*tune().xpCurve);player.material.dispose();player.material=heroMaterial(heroId,level);refreshStats(true);},
      heal:()=>{hp=stats.maxHp;},
      setGod:(on:boolean)=>{debugState.god=on;if(on)hp=stats.maxHp;},
      fillChakra:()=>{chakra=100;},
      addMoney:(n:number)=>{if(Number.isFinite(n))runMoney=Math.max(0,runMoney+Math.round(n));},
      spawnMega:(id:string)=>{if(HERO_BY_ID[id]){spawnEnemy(false,true,false,id);eventToast='Debug: mega elite '+HERO_BY_ID[id].name+' gerado';}},
      clearEnemies:()=>{for(const e of enemyList)disposeEnemy(e);enemyList.length=0;},
      // Sem teto de 10 min: avançar além do relógio da zona entra no FINAL SWARM.
      advanceTime:(s:number)=>{if(Number.isFinite(s))elapsed=Math.max(0,elapsed+s);},
      setFrozen:(on:boolean)=>{debugState.frozen=on;},
    };
    onSnapshotRef.current({...emptySnapshot,hp:stats.maxHp,maxHp:stats.maxHp,stats,permanent,skillLevels:{...skillLevels},choices:{...uses,banning:false}});
    return()=>{shadowClones.forEach(disposeShadowClone);playerMotion.dispose();allyMotions.forEach(motion=>motion.dispose());enemyList.forEach(enemy=>enemy.motion?.dispose());runCleanups.forEach(fn=>fn());debugApiRef.current=null;delete debugWindow.__shinobiTest;environmentMaps.forEach(t=>t.dispose());heroTextures.forEach(t=>t.dispose());pickupTextures.forEach(t=>t.dispose());damageNumbers.dispose();enemyRenderer.dispose();observer.disconnect();renderer.setAnimationLoop(null);renderer.dispose();window.removeEventListener('shinobi-ping',onPing);window.removeEventListener('shinobi-route',onRoute);window.removeEventListener('shinobi-choose',onChoose);window.removeEventListener('shinobi-roulette',onRoulette);window.removeEventListener('shinobi-toggle-auto-ult',onToggleAuto);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);container.removeEventListener('pointerdown',onDown);container.removeEventListener('pointermove',onMove);container.removeEventListener('pointerup',onUp);container.removeEventListener('pointercancel',resetPointer);container.removeEventListener('pointerleave',resetPointer);container.removeEventListener('contextmenu',onContext);container.removeEventListener('wheel',onWheel);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}});groundLook.dispose();sky.texture.dispose();texture.dispose();orochimaruTexture.dispose();container.removeChild(renderer.domElement);};
  }, [heroId,mission,mapId]);
  return <><div className={`scene${enabled&&!paused&&!debugOpen?' scene-live':''}`} ref={host} aria-label="Cena 3D isométrica do ShinobiBonk" />{debug&&enabled&&<DebugPanel getApi={getDebugApi} open={debugOpen} setOpen={setDebugOpen}/>}</>;
}


