import { POWERLEVEL_ATTRIBUTES, readPowerlevel, rollPowerlevel, type Powerlevel, type PowerlevelAttribute } from '../game/powerlevel';
import { createGroundMaterial, createSky, groundHeight, terrainOccludesActor, trailX, RENDERED_GROUND_SIZE, REGIONAL_PLACES, HAGOROMO_ARENA } from './terrainArt';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { activeTuning, dropChance, tuneThreat } from '../game/tuning';
import { createHagoromoSeal } from './hagoromoVisual';
import { createBossCombat, BIJUU_SIZE, type BossState } from './bossCombat';
import { createPickupShadows } from './dropSprites';
import { createDropModels, monsterDropScale, pickupScrollVariant, restDrop, type MonsterDropKind, type ThrownWeapon } from './dropModels';
import { currentSettings, translateKey, pixelRatioFor, CAMERA_ZOOM, CAMERA_VIEW, perspectiveDistance } from '../game/settings';
import { createMovementInput, createQuickMapInput } from '../game/movementInput';
import { firstProjectileContact, projectileContact, projectileSpread, selectCombatTarget } from '../game/targetFocus';
import { AKATSUKI_AMBUSH, AKATSUKI_MEMBERS, akatsukiAmbushHp, zetsuEmergence, type AmbushMemberSave } from '../game/akatsukiAmbush';
import { ENEMY_TIERS, eliteSpawnChance, BASE_LOOT, ENEMY_XP_MULTIPLIER, commonEnemyProjectile, lootScale, xpDropValue, xpLoot, eliteHpRamp, capMegaEliteHp, megaEliteHp, rollMegaSchedule, type EnemyTier } from '../game/enemyTiers';
import { completeEventDuel, sealedHeroes, sealForAccount, unlockedHeroes, addResearch, researchGain, RESEARCH_RULES } from '../game/account';
import { createTotemBar } from './narutoTotem';
import { NPC_ALLIES, NPC_RULES, TOTEM_RULES, dealBonuses, dealLabel, dealText, pctText, rollEbisuDeals, rollIrukaLegendary, rollIrukaLesson, type StatDeal } from '../game/npcs';
import { alliesBonuses, allyAttackInterval, allyBuffText, affinityLevel, affinityFactor, maxAffinityPoints, AFFINITY_RULES, ALLY_BUFFS } from '../game/allies';
import { readSettings, saveSettings, shouldAutoPick } from '../game/settings';
import { DebugPanel, type DebugApi } from '../ui/DebugPanel';
import { compactNumber } from '../game/format';
import { createPlayerMotion, movementFacing, stableFacing } from './playerMotion';
import { createFallenBody, type FallenBody } from './fallenShinobi';
import { createRewardBeacon, type RewardBeacon } from './rewardBeacon';
import { createPerfMonitor } from './perfMonitor';
import { recentStreak, extendStreak, type KillStreak } from '../game/killStreak';
import { combineBonus, combinedPart, fusionBonus, kekkeiFusion, legacyFusion, mergedTechnique, sagesMergeCandidates, techniqueLevelCap, type TechniqueMerge } from '../game/techniqueMerge';
import { createAtlasEffect } from './atlasEffects';
import { createGamabunta, GAMABUNTA_IGNITION, GAMABUNTA_TIME } from './gamabunta';
import { createKuroari, KUROARI_ART, puppetArt, KUROARI_STRIKE, KUROARI_TIME } from './kuroari';
import { createEnemyRenderer, ENEMY_FRAME } from './enemyRenderer';
import { focusOpacity, setFocusView } from './playerFocus';
import { cameraHeightAboveTerrain, createHeightField, footHeight, GROUND_DEPTH_OFFSET } from './heightField';
import { createTerrainGeometry } from './terrainGeometry';
import { createChakraFeet, createSplashes, createWater, RIPPLES, SPLASH, waterDistance, waterSurfaceAt } from './water';
import { createLandscape } from './landscape';
import { createMapBoundary } from './mapBoundary';
import { createMemorialStone } from './memorialStone';
import { MEMORIAL } from './leafLandmarkLayout';
import { loadArchitectureAtlas } from './villageArchitecture';
import { advanceShinra, shinraDone, shinraLift, startShinra, SHINRA, type ShinraState } from '../game/shinraTensei';
import { createDamageNumbers } from './damageNumbers';
import { SEAL_RULES, sealDue, sealLabel, sealSequence } from '../game/handSeals';
import { EVENT_DUEL_BY_ID, duelOpponent, duelReady } from '../game/events';
import { bijuuDefense, bijuuPlans, bijuuSpawnPoint, BIJUU_BY_ID, bijuuLamens, bijuuVitality, rollBijuu } from '../game/bijuu';
import { createSolids, COLLISION_RULES } from './collision';
import { createVillageLayout, villageGroundBands, missionMapLayout, shuffledVillageSites, villageDeck, villageSurface, type MapLayout } from './villageLayout';
import { createVillageGround, villageWater } from './villageTerrain';
import { createVillageScenery } from './villageScenery';
import { createMissionStructures, type MissionStructure } from './missionStructures';
import { createMissionNpcs, missionNpcForEvent, type MissionNpc } from './missionNpcs';
import { villageRandom } from './villageDistricts';
import { createVillageTraversal, moveVillageActor } from './villageTraversal';
import { MAP_SIZE, WORLD_LIMIT, ZONE_SECONDS, ACTOR_SCALE, ATTACK_SCALE, PLAYER_SIZE } from '../game/worldScale';
import { playHurt, playSfx, playTechniqueSound } from '../audio/sfx';
import { createDamageFlash, flashStrength, impactOpacity, registerHit, vignetteOpacity } from '../game/damageFeedback';
// Rodada 42 — trilha sonora: "The Raising Fighting Spirit" ao iniciar a luta contra a bijū (também está no pool de run).
import { playBijuu } from '../audio/music';
import { choiceCount, choiceUses, weaponPrice, jiraiyaRolls, prioritySlots, PRIORITY_WEIGHT } from '../game/preparation';
import { merchantPrice, merchantRerollPrice, itemSalePrice } from '../game/itemTrade';
import { ITEM_BY_NAME, currentItemName, rollItems, type Item, type Rarity, type StatKey } from '../game/catalog';
import { HEROES, HERO_BY_ID, familyOf, versionForEncounter, skillPool, heroAffinity, isProjectileUltimate, sandSynergy, ultimateBase, type Technique, type Control } from '../game/heroes';
import { activeSynergies, synergyBonuses, type ActiveSynergy } from '../game/synergy';
import { ZONES as BASE_ZONES, GUARDIAN_RULES, guardianHpMultiplier, guardianVitality, guardianDefense, guardianAttackMultiplier } from '../game/missions';
import { MAP_BY_ID, type MapId, WEATHER_EVENTS, WEATHER_BY_MAP, WEATHER_EVENT_DURATION, weatherWait, planZoneWeather, type WeatherEventId, type WeatherPlan } from '../game/maps';
import { canLockTarget, mistVisibility, ZABUZA_MIST } from '../game/zabuzaMist';
import { addChill, addPoisonStack, chillSlow, controlResist, damageStatusCount, deathBurstKind, freezeTarget, isFrozen, poisonMultiplier, reactionsFor, STATUS_RULES, statusDamageMultiplier, tickStatus } from '../game/statusRules';
import { FALLEN_TRAP, trapIsElite, trapRing } from '../game/fallenTrap';
import { BOSS_POWER, bossHpWithFloor, singleTargetDps } from '../game/bossScaling';
import { YOUTH_FIGHTER_HP, YOUTH_GOALS, YOUTH_TEXT, rollYouthChallenge, tickYouth, youthBonuses, youthChallengeText, youthSpots, type YouthChallengeId, type YouthDifficulty, type YouthRun } from '../game/youthTraining';
import { HAGOROMO, HAGOROMO_WAVES, TOOL_BY_ID, chooseTool, createHagoromo, addHagoromoKills, hagoromoRecharges, nextHagoromoStage, rollHagoromoRarity, rollToolOffers, toolBonuses, waveSpots, type HagoromoEncounterHud, type HagoromoState, type SageTool } from '../game/hagoromoTraining';
import { UNLOCK_MISSIONS, missingRequirements } from '../game/unlockMissions';
import { formAt, portraitRegion } from '../game/evolution';
import { NO_GROWTH, rollGrowth, growthText, SENJUTSU, hasSenjutsu, techniqueHitDamage, techniquePassiveMultiplier, setupNumbers, attackCooldown, BURN_CHANCE, POISON_CHANCE, techniqueCritical, techniqueDetail, techniqueProc, TECHNIQUE_SCALE, elementMultiplier, thornsDamage, aimedCenter, MELEE_IMPACT, type SkillGrowth } from '../game/combat';
import type { Bonuses } from '../game/catalog';
import { animateTechniqueVisual, techniqueVisual, cachedTechniqueVisual, hasSignatureVisual, disposeObject } from './techniqueEffects';
import { createParticleFx } from './particleFx';
import { createTechniqueAreas, CONE_COS } from './techniqueAreas';
import { createVirtualCursor } from './virtualCursor';
import { createSusanooFx } from './susanooFx';
import { susanooStyleFor } from '../game/susanoo';
import { zoneThreat, zoneCurse, calculateStats, incomingDamage, rollCritical, MISSION_TIER, normalHpFactor, SPAWN_RING, AMBUSH_RULES, ENEMY_SCALING, FINAL_SWARM, ZONE_DIFFICULTY, xpToLevelUp, effectiveLootLuck, type Difficulty, type Stats } from '../game/progression';
import { buildAltarOffers, extraStrikes } from '../game/altarRewards';
import { collectedXp, createGroundDropIndex, DROP_CELL_SIZE, dropCanMagnetize, magnetSpeed, xpCollectedAtPortal } from '../game/drops';
import { castProgress, blendFog, mistHides, isChanneling, CAST_DISTANCE } from '../game/weatherCast';
import { PILL_NAMES, PILL_BY_NAME, PILL_SLOTS, PILL_RARITY_POWER, pillOfferText, pillEffectText, canGrantPill, grantPill } from '../game/pills';
import { rollRarityTier, RARITY_ORDER, SHAPE_RADIUS } from '../game/combat';
import { ROULETTE_CASAS, ROULETTE_BY_ID, ROULETTE_RULES, BLESSINGS, BAD_LUCK, SLOT_COMBOS, slotKakuzuRyu, rouletteWeights, roulettePressure, rollRoulette, rouletteCost, seededRng, spendBonuses, type SlotComboId, type RoulettePrize, type RouletteView } from '../game/roulette';

export type LevelOffer = { merge?:TechniqueMerge; id: string; kind: 'skill'|'pill'|'item'|'stat'; name: string; rarity: Rarity; icon: string; description: string; planned?: boolean; price?:number; growth?:SkillGrowth; bonus?:Bonuses; deal?:StatDeal; disabled?:string; /** Tela de substituição de ajudantes (choiceLevel −7): id do ajudante e se é o recém-derrotado. */ allyId?:string; allyNew?:boolean };
export type WorldSnapshot = { /** Rodada 98: Treinamento da Juventude (painel e desafio em andamento). */ youth?:{panel:boolean;challenge:YouthChallengeId|null;run:{challenge:YouthChallengeId;difficulty:YouthDifficulty;timeLeft:number;progress:number;goal:number}|null}; /** Rodada 97: Treinamento do Hagoromo (chaves, progresso, ferramentas). */ hagoromo?:{keys:number;progress:number;need:number;tools:string[];active:boolean;recharge:boolean;stage?:HagoromoEncounterHud}; killStreak?:number; sagesUsed?:boolean; enemyCount?:number; powerlevel?:Powerlevel; allyCharge:number; victory:boolean; remaining:number; protection?:'temporary'|'debug'; /** FINAL SWARM: segundos sobrevividos após o relógio da zona zerar (0/ausente = relógio normal). */ overtime?:number; hiddenEffects:boolean; totalDamage:number; skillDamage:Record<string,number>; skillGrowth:Record<string,SkillGrowth>; techniques:Technique[]; synergy:boolean; synergies:ActiveSynergy[]; setups:{name:string;remaining:number;duration:number}[]; zone:number; phase?:'zone'|'arena'|'exit'; bijuu?:string; bijuuReward?:number; plansUsed?:number; skillTimers?:Record<string,{remaining:number;total:number;duration:number}>; boss:string; defenseProgress:number; banned:string[]; hp: number; maxHp:number; stats:Stats; defeated:boolean; allyDamage:number; difficultyScale:number; level: number; xp: number; xpNext: number; chakra: number; kills: number; runMoney: number; elapsed: number; fps: number; kunai: number; shuriken: number; luck:number; autoUlt:boolean; allies:string[]; /** Pontos de afinidade por ajudante (src/game/allies.ts). */ affinity:Record<string,number>; weather:string;weatherEvent?:WeatherEventId;weatherRemaining?:number; toast:string; interaction:{name:string;description:string;key?:string}|null; items: Record<string, number>; pills: Record<string, number>; pillQuality?:Record<string,number>; skillLevels: Record<string,number>; choice: { level: number; cards: LevelOffer[]; sale?:number; rerollCost?:number }|null; sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete';account?:boolean}|null; pickups:{kind:string;x:number;z:number;id?:string;name?:string}[];enemies: { x: number; z: number }[]; /** Marcos fixos e marcadores dinâmicos vistos em tela, para o mapa e minimapa. */ events: { id: string; name: string; x: number; z: number; icon: string; kind?:'event'|'enemy'|'landmark'; portrait?:string; guardian?:boolean; active?:boolean }[]; explored: { x: number; z: number }[]; player: { x: number; z: number; heading?:number }; ping: {x:number;z:number}|null; /** Rota do mapa (um alvo por vez): distância em metros e posição do alvo na tela (NDC −1..1). */ route?:RouteView|null; routeNotice?:{text:string;kind:'arrived'|'lost'|'set'}|null; effects: number; choices:{reroll:number;skip:number;ban:number;banning:boolean}; weaponCost:number; merchantRerollCost?:number; tsunadeSpinCost?:number; permanent:Record<string,number>; totem?:{hp:number;maxHp:number;remaining:number}|null; roulette?:RouletteView|null };
export type RouteView = { id:string; kind:'event'|'enemy'|'pickup'|'ping'; name:string; x:number; z:number; distance:number; screen:{x:number;y:number} };
/** Run salva (Esc → Salvar e sair, salvamento automático e ao fechar o navegador). */
export const SAVED_RUN_KEY='sb_saved_run_v1';
type PendingPrize = string | { pill:string; amount:number; rarity:Rarity; source:'roulette'|'drop' };
type PortalKind='zone'|'arena'|'exit';
type ActiveWeatherEvent={id:WeatherEventId;until:number;elite:string;x:number;z:number;castEnd?:number;openingMega?:boolean};
type SavedBijuu={id:string;hp:number;maxHp:number;x?:number;z?:number;overtime?:number};
type CampaignSave={openingMegaSpawned?:boolean;akatsukiAmbush?:AmbushMemberSave[];weatherPlan?:WeatherPlan;altarBlessing?:{tier:number;name:string;offers:LevelOffer[]};weatherEvent?:ActiveWeatherEvent;nextWeatherAt?:number;fallenMegas?:{heroId:string;x:number;z:number;account?:boolean}[];start:number;pendingLevels?:number;sagesUsedZone?:number;merges?:TechniqueMerge[];megaSchedule?:number[];accountEncounters?:number;plans:number;arena:boolean;reward:number;bijuu:string;portal?:{kind:PortalKind;x:number;z:number};boss?:SavedBijuu;locations?:{id:string;x:number;z:number}[];pickups?:{kind:MapPickup['kind'];x:number;z:number;discovered:boolean}[]};
export type SavedRun={/** Duelo de evento em andamento (src/game/events.ts). */ eventDuel?:string;hagoromo?:HagoromoState;mapLayout?:MapLayout;villageSeed?:number;surfaceElevation?:number;rankTicket?:{id:string;owner:string};killStreak?:KillStreak;powerlevel?:Powerlevel;v:1;heroId:string;mission:Difficulty;mapId:MapId;savedAt:number;elapsed:number;zone:number;level:number;xp:number;xpNext:number;kills:number;runMoney:number;kunai:number;shuriken:number;chakra:number;hp:number;bonusHp:number;totalDamage:number;allyDamage:number;skillDamage:Record<string,number>;knownItems:Record<string,number>;knownPills:Record<string,number>;pillQuality?:Record<string,number>;skillLevels:Record<string,number>;growth:Record<string,SkillGrowth>;allies:string[];allyAffinity:Record<string,number>;runBuffs:Bonuses;uses:{reroll:number;skip:number;ban:number};banned:string[];events:{id:string;active:boolean;uses:number;discovered:boolean}[];explored:string[];ryuSpent:number;rouletteSpins:number;paidWeapons:number;guardianSpawned:boolean;shikamaruPlans:number;megaElitesSpawned:number;zoneDifficulty:number;xpMultiplier:number;lootMultiplier:number;totemSpawned:boolean;pendingItemRewards:number;defenseDone:boolean;player:{x:number;z:number};accountTried:string[]; campaign?:CampaignSave; merchant?:{purchases:number;rerolls:number;stock:(string|null)[];prices?:number[]}; rouletteItems?:PendingPrize[]; rouletteSession?:{pending:RoulettePrize[];sessionSpins:number;sessionSpent:number}|null};
/** Recompensas atraídas pelo jogador. O bolinho de arroz cura uma fração do HP máximo. */
type Drop = { mesh: THREE.Object3D; type: MonsterDropKind; value: number; name: string; born: number; magnet: boolean; speed: number };
/**
 * Coleta por ímã: o drop fica no chão por DROP_RULES.settle s; dentro da área de coleta (stats.pickup) ele voa até o
 * personagem e só é coletado ao encostar (DROP_RULES.touch m). Uma célula fora do alcance guarda todos os drops no
 * ponto original até o jogador voltar até eles ou ativar o ímã de mapa inteiro.
 */
/** Kage Bunshin: raio (m) da explosão do clone; atinge todos os inimigos dentro dele, não só o alvo. */
export const KAGE_BUNSHIN_RADIUS = 1.5;
/** Ultimate do Naruto Academia (Oiroke no Jutsu): dano em área e atordoamento; chefes ficam menos tempo. Sem figura explícita: só fumaça. */
export const SEXY_JUTSU = { name: 'Jutsu Sexy', radius: 6.5, stun: 3.5, bossStun: 1.2 };
export const DROP_RULES = { settle: .35, touch: .75, magnetSpeed: 9, magnetAccel: 30 };
const makeDropIndex=()=>createGroundDropIndex((drop:Drop)=>drop.mesh.position);
/** Reposição da horda: até `perFrame` spawns por quadro; com a tela vazia o ritmo vai a ×(1+refill) do valor de difficultyAt. */
export const SPAWN_RULES = { perFrame: 40, swarmPerFrame: 120, refill: 2 };
/**
 * Escolha involuntária (pedido do usuário, 06/11/2026: "ele está pegando pílula sozinho"): a única fonte de pílula é a carta
 * escolhida na subida de nível, mas um novo conjunto de cartas surge na hora (vários níveis seguidos, troca/banimento) sob o
 * cursor liberado pela trava do ponteiro. Um clique ou tecla 1–9 dado para a tela anterior caía na carta nova — muitas vezes
 * uma pílula. Cada conjunto novo de cartas fica `armSeconds` sem aceitar clique, número, E ou V.
 */
export const CHOICE_GUARD = { armSeconds: .2 }; // Rodada 48 — engasgada ao interagir (E) e ao escolher (1-2-3-4): 0,5 s de trava era perceptível; caiu para 0,2 s
/**
 * Altares por raridade ("Altar · Normal/Incomum/Raro/Épico/Lendário", 8 por zona). Pisar no círculo (radius m) já começa a
 * contar, sem E; dentro sobe 1 s por segundo até seconds[tier]; fora do círculo a barra cai decayPerSecond[tier] (fração da
 * barra por segundo): Normal 4%/s (~25 s para zerar) … Lendário 18%/s (~5,5 s). Cada altar guarda o próprio progresso.
 */
export const ALTAR_RULES = { radius: 3, seconds: [10, 14, 18, 23, 30], decayPerSecond: [.04, .06, .09, .13, .18] };
/** Bênção do altar (Rodada 51/55): valores, sorteio e textos em src/game/altarRewards.ts (lógica pura, testada em tests/). */
export { ALTAR_BUFF_BASE, ALTAR_BUFF_POOL } from '../game/altarRewards';
/** Bolinho de arroz: chance por abate e fração do HP máximo curada. */
export const RAMEN_DROP = { chance: .025, heal: .35 };
type Enemy = { arrivalGuard?:number; bossDamageScale?:number; summonedAt?:number; summonedOvertime?:number; /** Rodada 103: Resfriado (acúmulos e tempo até sumir), molhado (s) e acúmulos de veneno. */ chill?:number; chillTime?:number; wet?:number; poisonStacks?:number; /** Rodada 98: Guy/Lee do Treinamento da Juventude. */ youth?: boolean; /** Rodada 97: inimigo das hordas do Treinamento do Hagoromo. */ hagoromo?: boolean; openingMega?:boolean; bodyAmbush?: MapPickup; /** Rodada 63: intervalo entre os selos da conjuração do clima. */ sealTimer?:number; ranged?:number; motion?:ReturnType<typeof createPlayerMotion>; motionLevel?:number; moveAfter?:number; moveTime?:number; jumping?:boolean; heroId?:string; elite?:boolean; guardian?:boolean; control?:Control; controlTime?:number; burn?:number; /** Queimadura vinda da explosão da Esfera Katon (não explode de novo). */ burstBurn?:boolean; sprite: THREE.Sprite; hp: number; speed: number; hitTimer: number; windup?:number; attackPoint?:THREE.Vector3; marker?:THREE.Mesh; poison?:{remaining:number;dps:number}; slow?:number; challenge?:boolean; megaElite?:boolean; boss?:BossState; /** Tipo do inimigo (src/game/enemyTiers.ts), fração de dano bloqueada e multiplicador de dano do golpe. */ tier?:EnemyTier; defense?:number; dmgMult?:number; /** Shinobi para selar: libera na conta. */ account?:boolean; maxHp?:number; shikamaruPlans?:number; hpMultiplier?:number; guardianZone?:number; bijuu?:boolean; totem?:boolean; fixedArt?:MissionNpc; clone?:boolean; /** Mapa: id estável do mega elite e se já foi visto em tela. */ uid?:number; seen?:boolean };
type MapPickup = { id:string; kind:'kunai'|'shuriken'|'ryu'|'sealDrop'|'cursedShuriken'|'ninjaBody'; name:string; x:number; z:number; mesh:THREE.Object3D; active:boolean; discovered?:boolean };
type Projectile = {mesh:THREE.Object3D;direction:THREE.Vector3;remaining:number;speed:number;radius:number;technique:Technique;origin:THREE.Vector3;hit:Set<Enemy>;growth:SkillGrowth;ally?:boolean;bounces:number;effectLevel?:number;range:number};
/** Setup (buff puro) ativo no jogador. */
type ActiveSetup = {name:string;remaining:number;duration:number;bonuses:Bonuses;sage:boolean};
/** Preparo base (s) até o acerto das técnicas sem projétil; dividido pela velocidade de projétil. */
const IMPACT_DELAY = { Taijutsu: .14, other: .24 };
/** Câmera (rodada 55): piso do pitch (rad) e quanto do corpo (m acima dos pés) uma encosta pode cobrir antes de o scan subir o ângulo. */
const CAMERA_MIN_PITCH = .03;
export const emptySnapshot: WorldSnapshot = { allyCharge:0, victory:false,remaining:600,hiddenEffects:false,totalDamage:0,skillDamage:{},skillGrowth:{},techniques:skillPool('naruto'),synergy:false,synergies:[],setups:[],zone:1,boss:'',defenseProgress:0,banned:[],hp: 130, maxHp:130, stats:calculateStats('naruto',1), defeated:false, allyDamage:0, difficultyScale:1, level: 1, xp: 0, xpNext: 30, chakra: 0, kills: 0, runMoney: 0, elapsed: 0, fps: 0, kunai: 0, shuriken: 0, luck:0,autoUlt:false,allies:[],affinity:{},weather:'',toast:'',interaction:null,items: {}, pills: {}, skillLevels: {}, choice:null,sealing:null,pickups:[], enemies: [], events: [], explored: [{x:0,z:0}], player: { x: 0, z: 0 }, ping:null, effects: 0,choices:{reroll:3,skip:3,ban:3,banning:false},weaponCost:20,permanent:{} };

export function captureGamePointer() {
  const shell=document.querySelector<HTMLElement>('.game-shell');
  if(!shell||document.pointerLockElement===shell||!shell.requestPointerLock)return;
  // Raw input do navegador (Pointer Lock 2.0): movimento do mouse 1:1, sem a aceleração do sistema operacional. Navegadores antigos ignoram a opção e o lock segue funcionando.
  try {void shell.requestPointerLock({unadjustedMovement:true})?.catch(()=>{});} catch { /* navegador sem captura disponível */ }
}

export type GamePanel = 'map' | 'quickmap' | 'sheet' | 'pause' | null;
const isMapPanel=(panel:GamePanel)=>panel==='map'||panel==='quickmap';

export function GameCanvas({ eventDuel, heroId, mission, mapId='folha', resume=null, itemPool, preparation, enabled, paused, panel, onSnapshot, onPanel, getRankTicket, debug=false }: { getRankTicket?:()=>SavedRun['rankTicket']; heroId: string; mission:Difficulty; mapId?:MapId; resume?:SavedRun|null; itemPool:Item[]; preparation:{permanent:Record<string,number>;archivedSkills:string[];planned?:string[];trained?:string[];priorityItems?:string[]}; enabled: boolean; paused: boolean; panel: GamePanel; onSnapshot: (snapshot: WorldSnapshot) => void; onPanel: (panel: GamePanel) => void; debug?: boolean; /** Duelo de evento escolhido na aba Eventos. */ eventDuel?: string }) {
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
  const panelRef = useRef(panel);
  const suppressUnlockPauseUntil = useRef(0);
  useLayoutEffect(()=>{
    if(panel===null&&isMapPanel(panelRef.current))suppressUnlockPauseUntil.current=performance.now()+800;
    panelRef.current=panel;
  },[panel]);

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
    // Rodada 55 (pedido do usuário: "ao passar de zona, resetar e voltar do início a progressão dos monstros"): escala pelo
    // tempo DA ZONA (zoneElapsed) — cada zona recomeça do minuto 0 (densidade, vivos, HP/dano, Final Swarm), com o multiplicador
    // da zona (ZONE_DIFFICULTY), a missão e os +% de inimigos/ameaça (enemyCount/threat) por cima. Arena da bijū = zona cheia (600 s).
    const threatNow=()=>zoneThreat(mission,arena?ZONE_SECONDS:zoneElapsed(),zoneCurse(zoneDifficulty,shikamaruPlans,ex('threat')),overtimeNow(),ex('enemyCount'),t=>tuneThreat(t,tune()));
    // Rodada 97: Treinamento do Hagoromo — chaves, ferramentas do Sábio e o evento em andamento.
    const hagoromo=createHagoromo();let hagoromoBossDown=false,hagoromoEvent:{rarity:SageTool['rarity'];wave:number;origin:{x:number;z:number};mega:Enemy|null;completed:boolean;outsideEnemies:Enemy[];outsideDrops:ReturnType<typeof makeDropIndex>}|null=null;
    const hero=HERO_BY_ID[heroId]??HEROES[0],techniques=skillPool(hero.id,sealedHeroes()),growth:Record<string,SkillGrowth>={},cooldowns:Record<string,number>={},runBuffs:Bonuses={},skillDamage:Record<string,number>={};
    let zoneStart=0,plansUsed=0,arena=false,bijuuReward=0,defeatedBijuu='',finalSwarmAnnounced=false,spawnBudget=0,pickupClock=0,globalMagnetUntil=0,/** Relógio só de animação: nunca para (o elapsed da missão para no Treinamento do Hagoromo e deixava a horda congelada). */animClock=0;
    let portal:{kind:PortalKind;x:number;z:number;mesh:THREE.Group}|null=null;
    let totalDamage=0,hiddenEffects=currentSettings().hideMyAttacks,victory=false,zone=1,ambushTimer=AMBUSH_RULES.first,guardianSpawned=false,shikamaruPlans=0,defenseTime=0,defenseActive=false,defenseDone=false;
    const config=preparationRef.current,permanent={...config.permanent},uses=choiceUses(permanent),banned=new Set<string>();let banning=false,paidWeapons=0;
    const MAP=MAP_BY_ID[mapId]??MAP_BY_ID.folha,ZONES=MAP.zones.map((z,i)=>({...BASE_ZONES[i],...z}));const weatherDef=MAP.weathers.find(w=>w.name==='Sol do deserto')??MAP.weathers[0];let weather=weatherDef.name,nextWeatherAt=weatherWait();const sky=createSky();const applyWeather=()=>{sky.update(weatherDef.sky);scene.background=sky.texture;};const scene = new THREE.Scene();applyWeather();
    // Rodada 85 (pedido do usuário: câmera e cenário "ainda muito precários"): perspectiva por padrão, com horizonte;
    // a ortográfica antiga continua nas Configurações (Vista da câmera). A escolha vale para a missão inteira.
    const perspective=currentSettings().cameraProjection!=='ortografica';
    const camera:THREE.OrthographicCamera|THREE.PerspectiveCamera = perspective?new THREE.PerspectiveCamera(CAMERA_VIEW.fov,16/9,.3,700):new THREE.OrthographicCamera(-12, 12, 7, -7, .1, 240);
    // Placa de vídeo: o jogador escolhe em Gráficos (powerPreference do contexto). Trocar em tempo real recria o contexto (onSettings).
    const GPU_PREF = { auto: 'default', desempenho: 'high-performance', integrada: 'low-power' } as const;
    const createRenderer = () => { const r = new THREE.WebGLRenderer({ antialias: false, powerPreference: GPU_PREF[currentSettings().gpu] }); r.setPixelRatio(pixelRatioFor(currentSettings())); r.outputColorSpace = THREE.SRGBColorSpace; return r; };
    let renderer = createRenderer(); container.appendChild(renderer.domElement); let activeGpu = currentSettings().gpu;
    scene.add(new THREE.HemisphereLight('#d4e9ff', '#35402d', 2.4)); const sun = new THREE.DirectionalLight('#ffe6b0', 3); sun.position.set(-8, 18, 7); scene.add(sun);
    // Rodada 95: a grade cobre todo o chão desenhado (não só a área de jogo): pintura do chão, malha e água leem dela.
    const mapLayout:MapLayout=enabledRef.current?missionMapLayout(resume):'mapas_basicos';
    const villageSeed=mapLayout==='vilas'?(resume?resume.villageSeed??0:1+Math.floor(Math.random()*0xffff_fffe)):undefined;
    const village=villageSeed===undefined?null:createVillageLayout(MAP.id,villageSeed);
    const waters=village?villageWater(MAP.id):undefined;
    const exactGround=village&&waters?createVillageGround(village,waters):(x:number,z:number)=>groundHeight(MAP.id,x,z);
    const terrainHeight=createHeightField(exactGround,RENDERED_GROUND_SIZE/2);
    const villageShadows=!!village;
    let shadowX=Infinity,shadowZ=Infinity,shadowSize=0;
    scene.add(sun.target);
    function updateVillageLight(x:number,z:number){
      const quality=currentSettings().quality;
      const size=villageShadows&&quality!=='baixa'?(quality==='alta'?2048:1024):0;
      if(size!==shadowSize||renderer.shadowMap.enabled!==Boolean(size)){
        renderer.shadowMap.enabled=Boolean(size);
        renderer.shadowMap.type=THREE.PCFShadowMap;
        renderer.shadowMap.autoUpdate=false;
        sun.castShadow=Boolean(size);
        sun.shadow.map?.dispose();
        sun.shadow.map=null;
        if(size)sun.shadow.mapSize.setScalar(size);
        shadowSize=size;shadowX=Infinity;shadowZ=Infinity;
      }
      if(!size||Math.hypot(x-shadowX,z-shadowZ)<4)return;
      shadowX=Math.round(x/2)*2;
      shadowZ=Math.round(z/2)*2;
      sun.position.set(shadowX-13,29,shadowZ+12);
      sun.target.position.set(shadowX,0,shadowZ);
      const box=sun.shadow.camera;
      box.left=-28;box.right=28;box.bottom=-28;box.top=28;box.far=70;box.near=.5;
      box.updateProjectionMatrix();
      sun.shadow.normalBias=.16;
      sun.shadow.bias=-.00015;
      renderer.shadowMap.needsUpdate=true;
    }
    runCleanups.push(()=>sun.shadow.dispose());
    let villageActive=!!village;
    // Rodada 88 (pedido do usuário: "as vezes o pé do personagem está indo para abaixo do solo… corrigir em todos os mapas…
    // todos os personagens"): personagens ficam de pé no ponto MAIS ALTO do chão sob os pés (raio FOOT_RADIUS). Na encosta
    // de um terraço o chão logo à frente é mais alto que o centro e escondia os pés.
    // Rodada 89: sobre lagos e rios os personagens andam na superfície da água (como os ninjas com chakra na obra).
    const standHeight=(x:number,z:number)=>village&&villageActive
      ?Math.max(footHeight(terrainHeight,x,z),waterSurfaceAt(MAP.id,x,z,waters),villageDeck(village,terrainHeight,x,z))
      :Math.max(footHeight(terrainHeight,x,z),waterSurfaceAt(MAP.id,x,z));
    const itemSurface=(x:number,z:number)=>Math.max(terrainHeight(x,z),waterSurfaceAt(MAP.id,x,z,waters),
      village&&villageActive?villageDeck(village,terrainHeight,x,z):-Infinity);
    const hagoromoSeal=createHagoromoSeal(scene,HAGOROMO_ARENA.x,itemSurface(HAGOROMO_ARENA.x,HAGOROMO_ARENA.z),HAGOROMO_ARENA.z);
    runCleanups.push(hagoromoSeal.dispose);
    const solids=createSolids();
    // Partículas das técnicas (natureza × forma) e Susanoo procedural: pools fixos, só visual (particleFx.ts / susanooFx.ts).
    const particles=createParticleFx(scene,terrainHeight),susanoo=createSusanooFx(scene,particles,terrainHeight);particles.setHidden(hiddenEffects);susanoo.setHidden(hiddenEffects);
    runCleanups.push(()=>{susanoo.dispose();particles.dispose();});
    // Rodada 55: contorno + preenchimento das áreas reais das técnicas do jogador (só visual; src/scene/techniqueAreas.ts).
    const areas=createTechniqueAreas(scene,terrainHeight);runCleanups.push(()=>areas.dispose());
    const groundLook=village&&waters
      ?createGroundMaterial(MAP,terrainHeight,{
        waters, seed:village.seed, surface:(x,z)=>villageSurface(village,x,z),
        bands:(x,z)=>villageGroundBands(village,x,z),
      })
      :createGroundMaterial(MAP,terrainHeight);
    const terrainGeometry=createTerrainGeometry(MAP.id,terrainHeight,waters);
    // Rodada 88: o chão recua um pouco na profundidade, para a base dos sprites não ser cortada pela encosta.
    groundLook.material.polygonOffset=true;groundLook.material.polygonOffsetFactor=GROUND_DEPTH_OFFSET.factor;groundLook.material.polygonOffsetUnits=GROUND_DEPTH_OFFSET.units;
    const ground=new THREE.Mesh(terrainGeometry,groundLook.material);
    ground.receiveShadow=villageShadows;scene.add(ground);
    const water=village?createWater(scene,MAP.id,terrainHeight,waters):createWater(scene,MAP.id,terrainHeight);runCleanups.push(()=>water.dispose());
    // Rodada 91: ondas dos passos e brilho de chakra nos pés sobre a água.
    const chakraFeet=createChakraFeet(scene);runCleanups.push(()=>chakraFeet.dispose());let rippleTimer=0,wasAirborne=false;
    // Rodada 99: respingos e ondas dos outros atores na água.
    const splashes=createSplashes(scene);runCleanups.push(()=>splashes.dispose());let othersRippleTimer=0,othersRippleIndex=0;
    // Rodada 89: paisagem de fundo pintada (panorama da vila) em volta do mapa.
    const landscape=createLandscape(scene,MAP.id);runCleanups.push(()=>landscape.dispose());
    const boundary=createMapBoundary(MAP.id,terrainHeight,standHeight);
    scene.add(boundary.root);
    boundary.root.visible=enabledRef.current;
    runCleanups.push(()=>boundary.dispose());
    const texture = new THREE.TextureLoader().load('/assets/shinobi-sprites-atlas.png'); texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;const orochimaruTexture=new THREE.TextureLoader().load('/assets/orochimaru-sprite.svg');orochimaruTexture.colorSpace=THREE.SRGBColorSpace;orochimaruTexture.magFilter=THREE.NearestFilter;orochimaruTexture.minFilter=THREE.NearestFilter;
    // Inimigos comuns/elite: o Sprite vira só dado (posição/escala/cor de acerto) e é desenhado em lote instanciado (enemyRenderer.ts).
    const enemyRenderer=createEnemyRenderer(scene),damageNumbers=createDamageNumbers(scene);const ELITE_TINT=new THREE.Color('#ffb969'),WHITE_TINT=new THREE.Color('#ffffff');
    const makeSprite=(index:number,w=1.8,h=2.2)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial());enemyRenderer.adopt(sp,index);sp.scale.set(w*ACTOR_SCALE,h*ACTOR_SCALE,1);return sp;};
    /** Contorno colorido (elite amarelo, Mega Elite vermelho, Shinobi para selar ciano): cópia da silhueta pintada de cor sólida, um pouco maior, desenhada atrás. Materiais por cor ficam em cache. */
    const addOutline=(target:THREE.Sprite,color:string)=>{if(enemyRenderer.isBatched(target)){enemyRenderer.outline(target,color);return;}const mat=new THREE.SpriteMaterial({map:target.material.map,transparent:true,depthWrite:false,alphaTest:.1});const rgb=new THREE.Color(color);mat.onBeforeCompile=(shader)=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb = vec3('+rgb.r.toFixed(3)+','+rgb.g.toFixed(3)+','+rgb.b.toFixed(3)+');');};mat.customProgramCacheKey=()=>'outline-'+color;const outline=new THREE.Sprite(mat);outline.scale.set(1.14,1.08,1);outline.renderOrder=1;target.renderOrder=2;outline.raycast=()=>{};target.add(outline);};
    const heroTextures=new Map<string,THREE.Texture>();
    const heroMaterial=(id:string,lv=1)=>{const r=portraitRegion(id,lv),key=r.path+':'+r.index;let map=heroTextures.get(key);if(!map){map=new THREE.TextureLoader().load(r.path);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;map.generateMipmaps=true;map.repeat.set(1/r.cols,1/r.rows);map.offset.set((r.index%r.cols)/r.cols,(r.rows-1-Math.floor(r.index/r.cols))/r.rows);heroTextures.set(key,map);}return new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false});};
    const makeHero=(id:string,lv=1,size=1)=>{const sprite=new THREE.Sprite(heroMaterial(id,lv));const scale=ACTOR_SCALE*size;sprite.scale.set(1.65*scale,2.25*scale,1);return sprite;};
    const player=makeHero(heroId,1,PLAYER_SIZE);player.position.y=standHeight(0,0)+player.scale.y*.5;scene.add(player);
    const playerMotion=createPlayerMotion(scene,player,heroId,true,PLAYER_SIZE);
    const focusView = new Float64Array(9);
    // Rodada 96: na névoa do Zabuza (com ele vivo) os personagens só aparecem a até 3 m do jogador.
    let zabuzaMistActive=false;
    const enemyOpacity=(sprite:THREE.Sprite)=>{const focus=focusOpacity(focusView,player.position,player.scale,sprite.position,sprite.scale);return zabuzaMistActive?Math.min(focus,mistVisibility(Math.hypot(sprite.position.x-player.position.x,sprite.position.z-player.position.z))):focus;};
    let moving=false;
    const heading=new THREE.Vector3(0,0,-1),dashHeading=new THREE.Vector3();
    const jumpDuration=.54,slideDuration=.24;
    let jumpTime=0,jumpHeight=0,slideTime=0,slideRecovery=0;
    /** Rodada 93: Shinra Tensei do Pain em andamento (levitação + ondas repetidas). */
    let shinra:ShinraState|null=null,shinraTech:Technique|null=null,shinraRadius=0;
    let sandGlideLeft=0;
    const sandCloud=familyOf(heroId)==='gaara'&&formAt(heroId).level>=15
      ? new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:'#d9a66d',flatShading:true}))
      : null;
    if(sandCloud){sandCloud.visible=false;sandCloud.scale.set(.9,.24,.72);scene.add(sandCloud);runCleanups.push(()=>disposeObject(sandCloud));}
    const cameraTarget=new THREE.Vector3(0,standHeight(0,0)+player.scale.y*.5,0);
    const environmentMaps=new Map<number,THREE.Texture>(),decor:THREE.Sprite[]=[];
    const environmentSprite=(index:number,width:number,height:number)=>{let map=environmentMaps.get(index);if(!map){map=new THREE.TextureLoader().load('/assets/environment-v2.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(.25,.5);map.offset.set((index%4)*.25,(1-Math.floor(index/4))*.5);environmentMaps.set(index,map);}const obj=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false}));obj.scale.set(width,height,1);return obj;};
    const civicScene=village&&waters?createVillageScenery(scene,MAP,village,terrainHeight,waters,solids,environmentSprite):null;
    if(civicScene){decor.push(...civicScene.sprites);runCleanups.push(()=>civicScene.dispose());}
    let legacyMemorial:THREE.Group|null=null;
    const traversal=createVillageTraversal(solids.all);
    let walkingFloor=standHeight(0,0);
    if(!village){
    const scenery=(index:number,x:number,z:number,w:number,h:number)=>{const obj=environmentSprite(index,w,h);if(MAP.scenery.tint!=='#ffffff')obj.material.color.set(MAP.scenery.tint);obj.position.set(x,terrainHeight(x,z)+h*.45,z);scene.add(obj);decor.push(obj);return obj;};
    /** Rodada 70: sprite de cada árvore/rocha, para remover junto com o sólido quando ficar dentro de uma construção. */
    const sceneryBySolid=new Map<object,THREE.Sprite>();
    // Keep paths and the spawn clearing open; scatter foliage across hills.
    const sceneryWeights=MAP.scenery.weights,sceneryTotal=sceneryWeights.reduce((a,b)=>a+b,0);for(let i=0;i<Math.round(MAP.scenery.count*1.65);i++){const x=(Math.random()-.5)*(MAP_SIZE-8),z=(Math.random()-.5)*(MAP_SIZE-8);if(Math.hypot(x,z)<6||Math.abs(x-trailX(z))<2.5||waterDistance(MAP.id,x,z).outside<1.5)continue;if(Math.hypot(x-HAGOROMO_ARENA.x,z-HAGOROMO_ARENA.z)<HAGOROMO_ARENA.r+1.5)continue;let roll=Math.random()*sceneryTotal,kind=0;while(kind<3&&roll>=sceneryWeights[kind]){roll-=sceneryWeights[kind];kind++;}sceneryBySolid.set(solids.add(x,z,COLLISION_RULES.scenery[kind]),scenery(kind,x,z,kind===3?2.4:3.2,kind===3?1.8:4.2));}
    if(MAP.id==='folha'){scenery(4,0,-12,7,6);for(const [x,z] of [[-7,-17],[7,-18],[-10,18],[12,19]]){scenery(7,x,z,5.5,5.5);solids.addBuilding(x,z,5.5);}}
    if(MAP.id==='folha'){
      const landmarks=[{x:0,z:-52,w:22,h:15},{x:30,z:24,w:6.6,h:10},{x:53,z:24,w:6.6,h:10}];
      for(const [index,{x,z,w,h}] of landmarks.entries()){
        const map=new THREE.TextureLoader().load('/assets/leaf-landmarks-v1.png');
        map.colorSpace=THREE.SRGBColorSpace;map.minFilter=map.magFilter=THREE.NearestFilter;map.generateMipmaps=false;
        map.repeat.set(1/3,1);map.offset.set(index/3,0);
        const landmark=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.12}));
        landmark.scale.set(w,h,1);landmark.center.set(.5,.03);landmark.position.set(x,terrainHeight(x,z)-.14,z);scene.add(landmark);decor.push(landmark);solids.addBuilding(x,z,w);
      }
      for(const [x,z] of [[-9,-15],[8,-17],[-10,-22],[9,-25]]){scenery(5,x,z,5,5);solids.addBuilding(x,z,5);}
      const memorialAtlas=loadArchitectureAtlas();
      const memorial=createMemorialStone(terrainHeight,solids,memorialAtlas);
      legacyMemorial=memorial;
      scene.add(memorial);
      runCleanups.push(()=>{memorial.removeFromParent();disposeObject(memorial);memorialAtlas.dispose();});
      for(const [dx,dz] of [[-7,-2],[7,-2],[-6,5],[6,5],[0,-8]])scenery(0,MEMORIAL.x+dx,MEMORIAL.z+dz,3.4,3.8);
    }else{
      const row={areia:0,pedra:1,nevoa:2}[MAP.id];
      for(const {x,z,w,h,column} of REGIONAL_PLACES){
        const key=100+row*3+column;
        let map=environmentMaps.get(key);
        if(!map){
          map=new THREE.TextureLoader().load('/assets/regional-landmarks-v1.png');
          map.colorSpace=THREE.SRGBColorSpace;map.minFilter=map.magFilter=THREE.NearestFilter;map.generateMipmaps=false;
          map.repeat.set(1/3,1/3);map.offset.set(column/3,(2-row)/3);environmentMaps.set(key,map);
        }
        const structure=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.12}));
        structure.scale.set(w,h,1);structure.center.set(.5,.03);
        structure.position.set(x,terrainHeight(x,z)-.1,z);scene.add(structure);decor.push(structure);solids.addBuilding(x,z,w);
      }
    }
    // Rodada 97: floresta em volta da clareira do Treinamento do Hagoromo.
    for(let k=0;k<22;k++){const a=k/22*Math.PI*2,r=HAGOROMO_ARENA.r+2.4+(k%3)*.9;scenery(k%4===0?1:0,HAGOROMO_ARENA.x+Math.cos(a)*r,HAGOROMO_ARENA.z+Math.sin(a)*r,3.4,3.8);}
    // Rodada 70: sem árvore/rocha escondida dentro de construção (bloqueava o caminho sem aparecer).
    solids.prune(COLLISION_RULES.sceneryClearance,solid=>{const obj=sceneryBySolid.get(solid);if(!obj)return;scene.remove(obj);obj.material.dispose();decor.splice(decor.indexOf(obj),1);sceneryBySolid.delete(solid);});
    }
    const eventDefs=[{id:'shikamaru',name:'Plano do Shikamaru',x:14,z:8,icon:'♟️',sprite:8},{id:'guardian-seal',name:'Portal do Guardião · Myōjinmon',x:2,z:-12,icon:'⛩️',sprite:4},{id:'challenge',name:'Emboscada da Akatsuki',x:-14,z:9,icon:'akatsuki-cloud',sprite:9},{id:'orochimaru',name:'Maldição de Orochimaru',x:9,z:-18,icon:'🐍',sprite:10},{id:'altar',name:'Altar para proteger',x:-17,z:-13,icon:'🛕',sprite:11},{id:'trader',name:'Mercador de itens',x:-3,z:18,icon:'🥷',sprite:8},{id:'slot',name:'Caça-Níquel da Tsunade',x:5,z:18,icon:'🎰',sprite:8},{id:'arsenal',name:'Arsenal da Tenten',x:-21,z:-1,icon:'🗡️',sprite:8},{id:'sapos-sabios',name:'Sapos Sábios · Monte Myōboku',x:-25,z:18,icon:'🐸',sprite:8},{id:'ichiraku',name:'Barraca Ichiraku',x:13,z:21,icon:'🍜',sprite:8},{id:'ebisu',name:'Treino de Elite do Ebisu',x:25,z:5,icon:'🕶',sprite:8},{id:'iruka',name:'Aula do Iruka',x:-24,z:14,icon:'📚',sprite:8},{id:'youth',name:'Treinamento da Juventude · Might Guy',x:-30,z:-42,icon:'🔥',sprite:8}];
    const altarColors=['#cbd5e1','#4cda83','#5daafa','#bb78f3','#ffcb55'];
    const altarRarities:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
    const allEvents=[...eventDefs.filter(e=>e.id!=='altar').map(e=>({...e,altarTier:undefined as number|undefined})),...Array.from({length:8},(_,i)=>{const tier=i<5?i:Math.floor(Math.random()*5);return {id:'altar-'+i,name:'Altar · '+(tier===0?'Normal':altarRarities[tier]),x:0,z:0,icon:'🛕',sprite:11,altarTier:tier};})];
    const eventStructures=createMissionStructures();
    const missionNpcs=createMissionNpcs();
    runCleanups.push(eventStructures.dispose,missionNpcs.dispose);
    const events=allEvents.map(def=>{
      const gate=def.id==='guardian-seal';
      const structure:MissionStructure|undefined=gate?'guardian':def.id==='ichiraku'?'ramen'
        :def.id==='trader'?'merchant':def.altarTier!==undefined?'altar':undefined;
      const addedSize=village&&def.altarTier===undefined&&!gate?1.17:1;
      let obj:THREE.Group;
      let fadeMaterials:THREE.Material[];
      const npcId=missionNpcForEvent(def.id),actor=npcId?missionNpcs.create(npcId):undefined;
      if(actor)runCleanups.push(actor.dispose);
      if(structure){
        const color=def.altarTier===undefined?0xffffff:parseInt(altarColors[def.altarTier].slice(1),16);
        ({obj,fadeMaterials}=eventStructures.make(structure,color));
        const w=(gate?5.6:structure==='ramen'?4:3.2)*ACTOR_SCALE*addedSize;
        const h=(gate?5:structure==='ramen'?3.4:3.2)*ACTOR_SCALE*addedSize;
        obj.scale.set(w,h,w);
      }else{
        const scale=ACTOR_SCALE*addedSize;
        const h=def.id==='challenge'?2.05:def.id==='sapos-sabios'?1.8:1.85;
        obj=actor!.root;
        obj.scale.setScalar(h*scale);
        fadeMaterials=[];
      }
      const groundOffset=structure?obj.scale.y*.45:0;
      obj.position.set(def.x,standHeight(def.x,def.z)+groundOffset,def.z);
      obj.visible=false;
      scene.add(obj);
      return {...def,obj,actor,groundOffset,fadeMaterials,discovered:false,uses:0,active:true};
    });
    const occluders=[
      ...decor.map(obj=>({obj,fadeMaterials:[obj.material]})),
      ...events.filter(event=>['ichiraku','trader','guardian-seal'].includes(event.id)),
    ];
    const ichiraku=events.find(event=>event.id==='ichiraku')!;
    const zetsuEvent=events.find(event=>event.id==='challenge')!;
    let zetsuRise=0;
    function updateZetsu(dt:number){
      const {x,z,obj}=zetsuEvent;
      if(arena||!zetsuEvent.active){obj.visible=false;return;}
      if(Math.hypot(player.position.x-x,player.position.z)<=AKATSUKI_AMBUSH.reveal)zetsuEvent.discovered=true;
      obj.visible=zetsuEvent.discovered;
      if(!obj.visible||zetsuRise>=AKATSUKI_AMBUSH.riseTime)return;
      zetsuRise=Math.min(AKATSUKI_AMBUSH.riseTime,zetsuRise+dt);
      obj.position.y=standHeight(x,z)+obj.scale.y*(zetsuEmergence(zetsuRise)-1);
    }
    const teuchiActor=missionNpcs.create('teuchi'),teuchi=teuchiActor.root;
    runCleanups.push(teuchiActor.dispose);
    const teuchiScale=ACTOR_SCALE*(village?1.17:1);
    teuchi.scale.setScalar(1.76*teuchiScale);
    scene.add(teuchi);
    function placeTeuchi(){
      const x=ichiraku.x+1.1,z=ichiraku.z+1.45;
      teuchi.position.set(x,standHeight(x,z),z);
      teuchi.visible=ichiraku.obj.visible;
    }
    function scatterEvents(){
      zetsuRise=0;
      const spots:{x:number;z:number}[]=[];
      const siteSeed=(villageSeed??0)^Math.imul(zone,0x9e3779b1);
      const sites=village?shuffledVillageSites(village,siteSeed):[];
      const random=village?villageRandom(siteSeed^0xce7161b7):Math.random;
      for(const e of events){
        let x=0,z=0;
        const altar=e.id.startsWith('altar');
        const guardian=e.id==='guardian-seal';
        const margin=altar?5:COLLISION_RULES.placementMargin;
        const free=(x:number,z:number)=>spots.every(p=>Math.hypot(p.x-x,p.z-z)>(village?6:8))&&solids.isFree(x,z,margin,!!village);
        const dry=(x:number,z:number)=>waterSurfaceAt(MAP.id,x,z,waters)===-Infinity;
        const site=!altar?sites.find(point=>(!guardian||Math.hypot(point.x,point.z)<=31)
          &&free(point.x,point.z)&&dry(point.x,point.z)):undefined;
        if(site){x=site.x;z=site.z;}
        else {
          let placed=false;
          for(let n=0;n<80;n++){
            const radius=guardian?14+random()*16:13+random()*55;
            const angle=random()*Math.PI*2;x=Math.cos(angle)*radius;z=Math.sin(angle)*radius;
            if(free(x,z)&&(!village||dry(x,z))){placed=true;break;}
          }
          // Busca exaustiva só se a faixa sorteada estiver ocupada.
          if(village&&!placed){
            search: for(let z0=-70;z0<=70;z0+=4)for(let x0=-70;x0<=70;x0+=4){
              if(Math.hypot(x0,z0)>13&&free(x0,z0)&&dry(x0,z0)){x=x0;z=z0;break search;}
            }
          }
        }
        spots.push({x,z});e.x=x;e.z=z;e.active=true;e.uses=0;e.discovered=guardian;
        e.obj.visible=guardian;e.obj.position.set(x,standHeight(x,z)+e.groundOffset,z);if(e===ichiraku)placeTeuchi();
      }
    }
    scatterEvents();
    const altarCircle=new THREE.Mesh(new THREE.RingGeometry(ALTAR_RULES.radius-.28,ALTAR_RULES.radius,48),new THREE.MeshBasicMaterial({color:'#d6b87a',transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));
    altarCircle.rotation.x=-Math.PI/2;altarCircle.visible=false;scene.add(altarCircle);
    let defenseAltar:(typeof events)[number]|null=null;
    const altarTimes=ALTAR_RULES.seconds;
    /** Progresso guardado por altar (segundos equivalentes); cada altar cai sozinho enquanto o jogador está fora do círculo. */
    const altarProgress=new Map<(typeof events)[number],number>();
    function startAltar(e:(typeof events)[number]){
      if(defenseAltar===e)return;
      if(defenseAltar&&defenseAltar!==e)altarProgress.set(defenseAltar,defenseTime);
      defenseTime=altarProgress.get(e)??0;
      defenseAltar=e;defenseActive=true;defenseDone=false;
      const floor=terrainHeight(e.x,e.z);
      const ring=altarCircle.geometry.attributes.position;
      for(let i=0;i<ring.count;i++){
        const x=e.x+ring.getX(i),z=e.z-ring.getY(i);
        ring.setZ(i,terrainHeight(x,z)-floor);
      }
      ring.needsUpdate=true;
      altarCircle.geometry.computeBoundingSphere();
      altarCircle.position.set(e.x,floor+.13,e.z);altarCircle.visible=true;
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
      altarCircle.material.color.set(altarColors[tier]);
      altarCircle.material.opacity=inside?.65:.27;
      if(!inside&&defenseTime<=0){altarProgress.delete(e);defenseActive=false;defenseAltar=null;altarCircle.visible=false;return;}
      if(defenseTime<altarTimes[tier])return;
      altarProgress.delete(e);
      defenseActive=false;defenseDone=true;e.active=false;altarCircle.visible=false;
      openAltarBlessing(tier,e.name);
    }
    let pendingAltar:{tier:number;name:string}|undefined;
    function openAltarBlessing(tier:number,name:string){
      pendingAltar={tier,name};
      choiceLevel=-10;
      choiceData=buildAltarOffers(tier,stats.luck);
      keys.clear();eventToast=name+' conquistado';snapshotTimer=0;saveRun();
    }
    // Arsenal da Tenten (NPC, antes Kakashi): forja uma cópia de 1 item que o jogador já carrega. A escolha usa choiceLevel=-1; o evento só é gasto ao copiar.
    let kakashiEvent:(typeof events)[number]|null=null;
    const enemyList:Enemy[]=[],shots:Projectile[]=[],keys=new Set<string>(),knownItems:Record<string,number>={},knownPills:Record<string,number>={},pillQuality:Record<string,number>={},skillLevels:Record<string,number>={},exploredCells=new Map<string,{x:number;z:number}>(),pickups:MapPickup[]=[],allies:string[]=[];let choiceData:LevelOffer[]|null=null,choiceLevel=1,kunai=0,shuriken=0,sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete';account?:boolean}|null=null,sealTimer=0,damageMultiplier=1,luck=0;
    let drops=makeDropIndex();
    const hagoromoGround=makeDropIndex();
    type SealCandidate={heroId:string;target:string;phase:'ready';account?:boolean};
    // Rodada 55 — corpo caído (src/scene/fallenShinobi.ts): cambaleia, cai, fica deitado com halo na cor do contorno.
    const fallenMegas:{candidate:SealCandidate;body:FallenBody}[]=[];
    const sealRadius=10;
    function closestFallenMega(){
      if(!fallenMegas.length)return;
      const distanceTo=(x:number,z:number)=>Math.hypot(x-player.position.x,z-player.position.z);
      let closest:typeof fallenMegas[number]|undefined;
      let distance=sealRadius;
      for(const event of events){
        if(!event.active||event.altarTier!==undefined)continue;
        const d=distanceTo(event.x,event.z);
        if(d<=3.6)distance=Math.min(distance,d);
      }
      for(const pickup of pickups){
        if(!pickup.active||pickup.kind==='sealDrop'||pickup===activeBody)continue;
        const d=distanceTo(pickup.x,pickup.z);
        if(d<2)distance=Math.min(distance,d);
      }
      if(portal){
        const d=distanceTo(portal.x,portal.z);
        if(d<2.2)distance=Math.min(distance,d);
      }
      for(const entry of fallenMegas){
        if(!entry.body.ready)continue;
        const d=Math.hypot(entry.body.position.x-player.position.x,entry.body.position.z-player.position.z);
        if(d<=distance){closest=entry;distance=d;}
      }
      return closest;
    }
    function removeFallenMega(entry:typeof fallenMegas[number]){
      entry.body.dispose();
      fallenMegas.splice(fallenMegas.indexOf(entry),1);
    }
    /** Rodada 55: corpo do Mega Elite (vermelho) / Shinobi para selar (ciano) caindo e deitado; `instant` = restauração do save (já deitado). */
    function layFallenShinobi(heroId:string,x:number,z:number,account=false,lv=level,instant=false){
      const source=makeHero(heroId,Math.max(1,lv));
      const body=createFallenBody({scene,map:source.material.map!,width:source.scale.x*1.4,height:source.scale.y*1.4,x,z,ground:itemSurface,
        color:account?'#5ff0ff':'#ff4d6d',right:v2,awayFrom:player.position,instant,areaRadius:sealRadius});
      source.material.dispose();
      return body;
    }
    const pendingSeals:SealCandidate[]=[];
    /** Afinidade por ajudante (pontos; src/game/allies.ts) e candidato da tela de substituição (choiceLevel −7). */
    const allyAffinity:Record<string,number>={};let replaceCandidate:{heroId:string;target:string}|null=null;
    // Caça-Níquel da Tsunade (src/game/roulette.ts, ex-"Roleta da Tsunade"): overlay aberto pausa a run como as telas de escolha.
    // Prêmios/penalidades ficam pendentes e só são entregues ao sair (ao sair, armadilhas shinobi explodem matando monstros próximos).
    // ryuSpent = total de Ryu gasto na run (kunais, caça-níquel, Ichiraku) → buff de dano da Carteira Gama-chan.
    let roulette:{pending:RoulettePrize[];sessionSpins:number;sessionSpent:number}|null=null,rouletteSpins=0,rouletteSeq=0,ryuSpent=0,rouletteRng:()=>number=Math.random;
    const rouletteItems:PendingPrize[]=[];
    const merchant={purchases:0,rerolls:0,stock:[] as (string|null)[],prices:[] as number[]};
    const powerlevel:Powerlevel={};
    let bonusHp=0,defeated=false,invulnerability=0,allyDamage=0,pendingItemRewards=0;
    let stats=calculateStats(heroId,1,{},{},0,permanent),allyTimer=0;
    const allyActors:THREE.Sprite[]=[];
    const sageAura=createAtlasEffect('sage');sageAura.sprite.visible=false;scene.add(sageAura.sprite);runCleanups.push(sageAura.dispose);
    const allyMotions=new Map<THREE.Sprite,ReturnType<typeof createPlayerMotion>>();
    // Kuri (rodada 41): marionete de máscara de raposa do Kankuro — companheira PERMANENTE (estilo Kiba+Akamaru).
    // Não consome vaga de suporte e NÃO entra em `allies` (sem afinidade, não é dispensável, não vaza para a
    // UI de equipe); ataca em silêncio (ally=true) com timer próprio, fora de fase dos ajudantes.
    // Caminha/ataca com o mesmo controlador do jogador (família 'kuri', folhas registradas em directionalArt).
    const companionId=familyOf(heroId)==='kankuro'?'kuri':familyOf(heroId)==='kiba'?'akamaru':undefined;
    const kuriSprite=companionId?makeHero(companionId):null;
    if(kuriSprite){kuriSprite.scale.multiplyScalar(companionId==='akamaru'?.64:.85);kuriSprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(kuriSprite);}
    const kuriMotion=kuriSprite&&companionId?createPlayerMotion(scene,kuriSprite,companionId,false):null;
    let kuriTimer=0;
    const activeSetups:ActiveSetup[]=[],pendingHits:{time:number;run:()=>void}[]=[];
    /** Evento do anime (src/game/events.ts): o oponente do duelo aparece depois do minuto e dos abates; selar marca o duelo. */
    const duelId=resume?.eventDuel??eventDuel,duel=duelId?EVENT_DUEL_BY_ID[duelId]:undefined,duelFoe=duel?duelOpponent(duel,heroId,familyOf):undefined;
    let duelWon=false;
    function accountSeal(id:string){sealForAccount(id);if(!duel||id!==duelFoe||duelWon)return '';duelWon=true;completeEventDuel(duel.id,heroId);return ' · Prova Chūnin: duelo "'+duel.title+'" vencido!';}
    /** Teste: força a chance da linha Senjutsu (null = valor normal). */
    let senjutsuOverride:number|null=null,senjutsuProcs=0;
    const sageModeActive=()=>activeSetups.some(s=>s.sage);
    /** Intervalo do ataque dos ajudantes: velocidade dos ajudantes × metade do bônus de velocidade de ataque do herói. */
    const allyInterval=()=>allyAttackInterval(level,stats.allySpeed,stats.attackSpeed);
    const refreshStats=(healGrowth=false)=>{const oldMax=stats.maxHp;
      // Buffs da run = escolhas de "Powerlevel" + buff único de cada ajudante (× força de suporte) + sinergia da Areia. Recalculado das fontes a cada quadro.
      const buffs:Bonuses={...runBuffs};for(const [key,value] of Object.entries(toolBonuses(hagoromo.tools)))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);for(const [key,value] of Object.entries(alliesBonuses(allies,stats.allyBuff,allyAffinity)))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
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
    const slotPrice=()=>rouletteCost(rouletteSpins,ex('slotDiscount'),elapsed,zone);
    let timeSinceHit=99,rushTimer=0,shieldReady=true,shieldTimer=0,emergencyCd=0,periodicTimer=30,boltTimer=2.5,beamTimer=6,freezeCd=0,ultBuffTimer=0,stillTime=0,revives35=0,revives60=0;
    const lastPos=new THREE.Vector3();
    /** Multiplicador temporário de velocidade de ataque: Selo de Adrenalina, Postura de Pedra parado e Pergaminho do Hokage após a Ultimate. */
    const tempAttackSpeed=()=>1+(rushTimer>0?.12:0)+(ex('stance')>0&&stillTime>.5?.08:0)+(ultBuffTimer>0?.3:0);
    const grantItem=(name:string)=>{const item=ITEM_BY_NAME[name];if(!item||(knownItems[name]||0)>=item.max)return;knownItems[name]=(knownItems[name]||0)+1;pendingLevels+=item.levelsOnAcquire??0;refreshStats(true);};
    // Afinidade inicial: Nv. 1 (0 pontos) para quem entra por selamento/substituição; Iruka (NPC) entra no máximo.
    /** Já há um ajudante desta família na equipe (versões contam como a mesma família). */
    const hasAllyFamily=(id:string)=>allies.some(a=>familyOf(a)===familyOf(id));
    const recruitAlly=(id:string,maxAffinity=false)=>{if(allyActors.length>=stats.supportSlots||hasAllyFamily(id))return false;const sprite=makeHero(id);sprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(sprite);sprite.userData.form=formAt(id).level;allyActors.push(sprite);allyMotions.set(sprite,createPlayerMotion(scene,sprite,id,false));allies.push(id);allyAffinity[id]=maxAffinity?maxAffinityPoints():0;addRing(sprite.position,'#61ffa8',1);refreshStats(true);return true;};
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
    const startSeal=(p:{heroId:string;target:string;phase:'ready';account?:boolean}):void=>{if(readSettings().sealAnimation){sealing=p;return;}sealing=null;if(p.account){const duelNote=accountSeal(p.heroId);eventToast=p.target+' foi selado e agora está DESBLOQUEADO na sua conta (animação de captura desligada).'+duelNote;playSfx('pickup');nextSeal();return;}if(hasAllyFamily(p.heroId)){eventToast=p.target+' já está na equipe.';nextSeal();return;}if(allyActors.length>=stats.supportSlots){openReplace(p);return;}recruitAlly(p.heroId);eventToast=p.target+' foi selado direto e entrou na equipe (animação de captura desligada nas Configurações).';playSfx('pickup');nextSeal();};
    const resolveReplace=(offer:LevelOffer|null)=>{const candidate=replaceCandidate;if(!candidate)return;if(!offer||offer.allyNew){eventToast=candidate.target+' foi dispensado. Nenhuma recompensa.';}else if(offer.allyId&&dismissAlly(offer.allyId)){recruitAlly(candidate.heroId);eventToast=`${allyName(offer.allyId)} saiu; ${candidate.target} entrou na equipe (afinidade Nv. 1).`;playSfx('pickup');}replaceCandidate=null;choiceData=null;keys.clear();nextSeal();};
    const revealAround=(x:number,z:number)=>{const cx=Math.round(x/5),cz=Math.round(z/5);for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){if(ox*ox+oz*oz>2)continue;const gx=cx+ox,gz=cz+oz,key=`${gx},${gz}`;if(!exploredCells.has(key))exploredCells.set(key,{x:gx*5,z:gz*5});}};revealAround(0,0);
    const pillNames=PILL_NAMES;
    skillLevels[hero.skills[0]]=1;
    const toOffer=(item:Item,index:number):LevelOffer=>({id:item.id+'-'+index,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:item.description+' Você tem '+(knownItems[item.name]||0)+'/'+item.max+'.'});
    const eligibleItemPool=()=>itemPoolRef.current.filter(i=>!banned.has(i.name));
    const drawStock=(count:number, owned=knownItems, rng=Math.random, pool=eligibleItemPool())=>
      rollItems(pool,owned,lootLuck(),count,rng,(config.priorityItems??[]).slice(0,prioritySlots(permanent)),PRIORITY_WEIGHT);
    const merchantRerollCost=()=>merchantRerollPrice(merchant.rerolls,ex('slotDiscount'));
    const saleValue=()=>Math.max(0,...(choiceData??[]).map(card=>(card.kind==='item'||card.kind==='pill')?itemSalePrice(card.rarity):0));
    function quoteMerchantStock(){
      merchant.prices=merchant.stock.map(name=>name&&ITEM_BY_NAME[name]
        ?merchantPrice(ITEM_BY_NAME[name].rarity,merchant.purchases,elapsed,merchant.rerolls):0);
    }
    function setMerchantStock(names:readonly string[]){
      merchant.stock=Array.from({length:4},(_,index)=>names[index]??null);
      quoteMerchantStock();
    }
    function showMerchant(){
      if(!merchant.stock.length)setMerchantStock(drawStock(4).map(i=>i.name));
      // Saves anteriores guardam os itens sem a cotação.
      if(merchant.prices.length!==merchant.stock.length)quoteMerchantStock();
      choiceLevel=-8;banning=false;keys.clear();
      choiceData=Array.from({length:4},(_,index)=>{
        const name=merchant.stock[index],item=name?ITEM_BY_NAME[name]:undefined;
        if(!item) return {id:'merchant-empty-'+index,kind:'stat',name:'Sem oferta',icon:'—',rarity:'Comum',description:'Role novamente para buscar outra oferta.',disabled:'Sem estoque'};
        const price=merchant.prices[index];
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
      runMoney-=cost;ryuSpent+=cost;merchant.rerolls++;markNpcUsed('trader');
      setMerchantStock(next.map(i=>i.name));refreshStats();showMerchant();
    }
    function buyMerchant(index:number, offer:LevelOffer){
      const item=ITEM_BY_NAME[offer.name];
      if(!item||merchant.stock[index]!==item.name||(knownItems[item.name]||0)>=item.max) return;
      const price=merchant.prices[index];
      if(runMoney<price) return;
      runMoney-=price;ryuSpent+=price;merchant.purchases++;merchant.stock[index]=null;markNpcUsed('trader');
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
      return techniques.filter(t=>t.unlockLevel<=level&&!config.archivedSkills.includes(t.name)&&!banned.has(t.name)&&!consumedTechniques.has(t.name)&&(skillLevels[t.name]||0)<techniqueLevelCap(t,ex('skillCap'))&&((skillLevels[t.name]||0)>0||learned<maxSkills));};
    /** Pílulas que ainda podem subir (fora do limite de níveis e de tipos). Pílula no limite NUNCA aparece (cartas, roleta, drops). */
    const eligiblePills=()=>pillNames.filter(name=>!banned.has(name)&&canGrantPill(knownPills,name,ex('pillCap')));
    /** Pool de técnicas e pílulas esgotado: o level-up TREINA UM ATRIBUTO ALEATÓRIO (+0,6% — POWERLEVEL_RATE).
     * Rodada 48 (usuário: "ele treina TODOS os atributos aleatoriamente" + HUD flutuante "Treinamento - <atributo> +0,6%").
     * Substitui a regra anterior de "só Sorte" (11/11/2026); a exceção "somente na utilidade só sorte" segue em aberto p/ confirmação. */
    const grantTraining=():PowerlevelAttribute=>{const attribute=rollPowerlevel(stats);powerlevel[attribute]=(powerlevel[attribute]??0)+1;refreshStats(true);return attribute;};
    /** A Sorte altera a potência da pílula, que sempre avança um nível. */
    const pillOffer=(pill:string):LevelOffer=>{const rarity=RARITY_ORDER[rollRarityTier(lootLuck())];return {id:'pill-'+pill,kind:'pill',name:pill,rarity,icon:PILL_BY_NAME[pill]?.glyph??'💊',description:pillOfferText(pill,knownPills[pill]||0,ex('pillCap'),rarity)};};
    const rollLevelOffers=():LevelOffer[]=>{
      const skills=eligibleSkills();
      // Level-up oferece SOMENTE técnicas e pílulas (itens vêm apenas de recompensas via rollMegaLoot).
      // Regra: até 2 técnicas; o restante são pílulas distintas; se faltar um tipo, completa com o outro.
      const pills=eligiblePills();
      if(!skills.length&&!pills.length)return [];
      const total=offerCount(),cards:LevelOffer[]=[];
      const skillCard=(index?:number)=>{const t=skills.splice(index??Math.floor(Math.random()*skills.length),1)[0],roll=rollGrowth(lootLuck(),t),current=skillLevels[t.name]||0;cards.push({id:'skill-'+t.name,kind:'skill',name:t.name,rarity:roll.rarity,growth:roll.growth,icon:'⚔️',description:(current?'Nível '+current+' → '+(current+1):'Nova técnica · '+t.school+' · '+t.shape)+'. '+growthText(roll.growth,t)+(t.status?' · '+t.status:'')+' — '+techniqueDetail(t,growthAfter(t.name,roll.growth),stats.sage>0,knowsSageMode(),current+1,stats.status)});};
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
    let nextTrainingNotice=0;
    function openLevelReward(){
      const offers=rollLevelOffers();
      choiceData=offers.length?offers:null;
      snapshotTimer=0;
      // 25/11/2026: opção "Pegar sozinha a única carta" (Configurações) — com 1 carta só, escolhe sem abrir a tela.
      if(choiceData&&shouldAutoPick(choiceData,currentSettings().autoPickSingle)){const only=choiceData[0].name;chooseLevelOffer(0);eventToast='Escolha automática: '+only;return;}
      if(choiceData){keys.clear();return;}
      const attribute=grantTraining(),notice=POWERLEVEL_ATTRIBUTES[attribute]+' +0,6%';
      eventToast='Nível '+level+' · Treinamento: '+notice;
      if(!hiddenEffects&&elapsed>=nextTrainingNotice){
        nextTrainingNotice=elapsed+.4;
        const hud=damageNumbers.spawnText('Treinamento · '+notice);
        hud.position.set(player.position.x,player.position.y+2.3,player.position.z);
        numbers.push({sprite:hud,life:.9});
      }
    }
    // Barraca Ichiraku: esquecer pílula/técnica pagando Ryu, quantas vezes quiser (choiceLevel=-2; evento nunca se esgota).
    const forgetPrice=(level:number)=>10+5*Math.max(1,level);
    const merges=new Map<string,TechniqueMerge>();
    const consumedTechniques=new Set<string>();
    let sagesKind:TechniqueMerge['kind']='fuse',sagesUsedZone=0;
    const sagesCandidates=()=>sagesMergeCandidates(techniques,skillLevels,ex('skillCap'))
      .filter(t=>!merges.has(t.name)&&!consumedTechniques.has(t.name));
    function openSages(kind:TechniqueMerge['kind']=sagesKind){
      sagesKind=kind;
      choiceLevel=-6;choiceData=[];banning=false;keys.clear();snapshotTimer=0;
      if(sagesUsedZone===zone)return;
      const candidates=sagesCandidates();
      for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){
        const a=candidates[i],b=candidates[j];
        { const kind=sagesKind;
          const merge:TechniqueMerge={kind,names:[a.name,b.name]};
          const result=mergedTechnique(merge,candidates,familyOf(heroId));
          const clan=kind==='fuse'&&fusionBonus(a,b,familyOf(heroId))>0?' · +15% de dano ('+(a.element===b.element?'mesma natureza':'Kekkei Genkai da linhagem')+')':'';
          if(!result||merges.has(result.name))continue;
          const recipe=kekkeiFusion(result.name);
          choiceData.push({id:kind+'-'+i+'-'+j,kind:'stat',rarity:kind==='fuse'?'Épico':'Raro',icon:kind==='fuse'?'✦':'⛓',
            name:recipe?result.name:(kind==='fuse'?'Fundir':'Combinar')+' · '+a.name+' / '+b.name,merge,
            description:(recipe?recipe.summary:kind==='fuse'?`${a.element} + ${b.element} · técnica nova no nível 1, ×2 de dano sobre a média e afixos somados.`:'As duas técnicas atacam juntas no mesmo espaço. Cada uma causa ×1,5 de dano e ganha '+combineBonus(a,b).label+'.')+clan});
        }
      }
    }
    function applyMerge(merge:TechniqueMerge){
      if(sagesUsedZone===zone)return;
      const merged=mergedTechnique(merge,sagesCandidates(),familyOf(heroId));
      if(!merged||merges.has(merged.name))return;
      sagesUsedZone=zone;markNpcUsed('sapos-sabios');
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
      runMoney-=price;ryuSpent+=price;markNpcUsed('ichiraku');
      if(offer.kind==='pill'){delete knownPills[offer.name];delete pillQuality[offer.name];}
      else{delete skillLevels[offer.name];delete growth[offer.name];delete cooldowns[offer.name];const active=activeSetups.findIndex(a=>a.name===offer.name);if(active>=0)activeSetups.splice(active,1);}
      refreshStats();playSfx('pickup');
      eventToast=`Ichiraku: ${offer.name} esquecida por ${compactNumber(price)} Ryu.`;
      openIchiraku();
    }
    // ───── Caça-Níquel da Tsunade (evento 'slot'; regras em src/game/roulette.ts) ─────
    // E abre o overlay (TsunadeRoulette.tsx). Cada giro cobra na hora (custo cresce por giro na run, por minuto de run e por zona)
    // e guarda o resultado; tudo (prêmios E penalidades) só é aplicado ao sair. Buff/debuff entram como bônus temporários em activeSetups
    // (somados do zero em refreshStats e removidos ao expirar → sem resíduo). Os 5 combos de 3 iguais (Tsunade/Jiraiya/Hiruzen/Hidan/
    // Kakuzu) entregam bônus permanentes da run (runBuffs) ou itens/Ryu na saída; o jogador fica seguro durante a interação.
    const roulettePressureNow=()=>roulettePressure(zoneDifficulty,zone,mission);
    const rouletteWeightsNow=()=>rouletteWeights(stats.luck,roulettePressureNow());
    function rouletteView():RouletteView|null{if(!roulette)return null;return{cost:slotPrice(),spins:rouletteSpins,sessionSpins:roulette.sessionSpins,sessionSpent:roulette.sessionSpent,ryuSpent,discount:Math.min(ROULETTE_RULES.maxDiscount,ex('slotDiscount')),money:runMoney,luck:stats.luck,pressure:roulettePressureNow(),weights:rouletteWeightsNow(),pending:roulette.pending.map(p=>({...p}))};}
    function openRoulette(){if(!roulette){roulette={pending:[],sessionSpins:0,sessionSpent:0};keys.clear();snapshotTimer=0;eventToast='Caça-Níquel da Tsunade: E gira · segure E para giro rápido · Esc sai e recebe (você fica seguro até sair).';}return rouletteView();}
    function spinRoulette(forced?:SlotComboId):{ok:boolean;reason?:string;prize?:RoulettePrize;view:RouletteView|null}{
      if(!roulette)return{ok:false,reason:'A roleta está fechada.',view:null};
      const cost=slotPrice();if(runMoney<cost)return{ok:false,reason:`Faltam ${compactNumber(cost-runMoney)} Ryu para girar (${compactNumber(cost)} Ryu).`,view:rouletteView()};
      runMoney-=cost;ryuSpent+=cost;rouletteSpins++;roulette.sessionSpins++;roulette.sessionSpent+=cost;markNpcUsed('slot');
      const id=ROULETTE_CASAS.find(c=>c.id===forced)?.id??rollRoulette(rouletteWeightsNow(),rouletteRng);
      const casa=ROULETTE_BY_ID[id],prize:RoulettePrize={seq:++rouletteSeq,id,label:casa.label,icon:casa.icon,kind:casa.kind,detail:casa.description,cost};
      if(id==='tsunade'){prize.label=`3 Tsunades · ${SLOT_COMBOS.tsunade.name}`;prize.detail=`+${Math.round(SLOT_COMBOS.tsunade.threat*100)}% de dificuldade e +${Math.round(SLOT_COMBOS.tsunade.enemyCount*100)}% de monstros até o fim da run (mais XP e Ryu).`;}
      else if(id==='jiraiya'){prize.label=`3 Jirayas · ${SLOT_COMBOS.jiraiya.name}`;prize.detail='1 item Raro ou superior ao sair (E pega · V vende).';}
      else if(id==='hiruzen'){prize.label=`3 Hiruzens · ${SLOT_COMBOS.hiruzen.name}`;prize.detail=`${SLOT_COMBOS.hiruzen.choices} escolhas de item ao sair (E pega · V vende).`;}
      else if(id==='hidan'){prize.label=`3 Hidan · ${SLOT_COMBOS.hidan.name}`;prize.detail=`−${Math.round(SLOT_COMBOS.hidan.hpLoss*100)}% do HP total (não mata) e +${Math.round(SLOT_COMBOS.hidan.threat*100)}% de dificuldade/monstros até o fim da run.`;}
      else if(id==='kakuzu'){prize.label=`3 Kakuzus · ${SLOT_COMBOS.kakuzu.name}`;prize.detail=`+${compactNumber(slotKakuzuRyu(stats.luck,roulettePressureNow()))} Ryu ao sair (sobe com sua Sorte e com a dificuldade do jogo).`;}
      roulette.pending.push(prize);snapshotTimer=0;
      return{ok:true,prize:{...prize},view:rouletteView()};
    }
    function applyTimedBuff(name:string,bonuses:Bonuses,duration:number){const cur=activeSetups.find(a=>a.name===name);if(cur){cur.remaining=duration;cur.duration=duration;cur.bonuses={...bonuses};}else activeSetups.push({name,remaining:duration,duration,bonuses:{...bonuses},sage:false});}
    function closeRoulette(){if(!roulette)return null;const delivered=roulette.pending;roulette=null;keys.clear();
      let gained=0,lost=0,ambush=0,itemChoices=0;const blessingCount:Record<number,number>={};
      // Itens dos combos (Jiraiya/Hiruzen) reservam as cópias já entregues nesta saída para não passar do máximo do item.
      const comboReserved:Record<string,number>={...knownItems};
      for(const p of delivered)if(p.item)comboReserved[p.item]=(comboReserved[p.item]||0)+1;
      const drawComboItem=(pool:Item[]=eligibleItemPool())=>{const it=drawStock(1,comboReserved,rouletteRng,pool)[0];if(!it)return null;comboReserved[it.name]=(comboReserved[it.name]||0)+1;rouletteItems.push(it.name);itemChoices++;return it;};
      for(const p of delivered){
        if(p.id==='kunai')kunai++;else if(p.id==='shuriken')shuriken++;
        else if(p.id==='pill')gained+=itemSalePrice((p.rarity as Rarity)??'Comum'); // prêmio de save anterior
        else if(p.id==='ryu')gained+=p.amount||0;
        else if(p.id==='jackpot'||p.id==='item'){gained+=p.amount||0;if(p.item){rouletteItems.push(p.item);itemChoices++;}}
        else if(p.id==='buff'){blessingCount[p.blessing??0]=(blessingCount[p.blessing??0]||0)+1;}
        else if(p.id==='debuff')applyTimedBuff(BAD_LUCK.name,BAD_LUCK.bonuses,ROULETTE_RULES.debuffDuration);
        else if(p.id==='lose')lost+=p.amount||0;
        else if(p.id==='ambush')ambush+=p.amount||0;
        // ───── Combos de 3 iguais (rodada 37) ─────
        else if(p.id==='tsunade'){runBuffs.threat=(runBuffs.threat||0)+SLOT_COMBOS.tsunade.threat;runBuffs.enemyCount=(runBuffs.enemyCount||0)+SLOT_COMBOS.tsunade.enemyCount;}
        else if(p.id==='hidan'){hp=Math.max(1,hp-Math.round(stats.maxHp*SLOT_COMBOS.hidan.hpLoss));runBuffs.threat=(runBuffs.threat||0)+SLOT_COMBOS.hidan.threat;runBuffs.enemyCount=(runBuffs.enemyCount||0)+SLOT_COMBOS.hidan.enemyCount;}
        else if(p.id==='jiraiya')drawComboItem(eligibleItemPool().filter(i=>['Raro','Épico','Lendário'].includes(i.rarity)));
        else if(p.id==='hiruzen'){for(let n=0;n<SLOT_COMBOS.hiruzen.choices;n++)drawComboItem();}
        else if(p.id==='kakuzu')gained+=slotKakuzuRyu(stats.luck,roulettePressureNow());
      }
      // Bênçãos iguais acumulam (até 3×) em vez de se sobrescrever; cada uma entregue de verdade.
      for(const [index,count] of Object.entries(blessingCount)){const b=BLESSINGS[Number(index)],stacks=Math.min(3,count),bonuses:Bonuses={};for(const [k,v] of Object.entries(b.bonuses))bonuses[k as keyof Bonuses]=(v as number)*stacks;applyTimedBuff(b.name,bonuses,ROULETTE_RULES.buffDuration);}
      runMoney+=gained;const paid=Math.min(runMoney,lost);runMoney-=paid;
      for(let n=0;n<Math.min(ambush,Math.max(0,threatNow().cap-enemyList.length));n++)spawnEnemy();
      // Emboscada invertida (rodada 37): ao sair, armadilhas shinobi/papéis bomba explodem ao redor do jogador matando os
      // monstros próximos (o jogador estava seguro durante a interação; a horda retoma o ataque em seguida). Totens/Bijuus/Guardiões
      // têm fluxo próprio e não entram nas armadilhas.
      let trapped=0;const trapRadius=8;for(const e of [...enemyList]){if(e.totem||e.bijuu||e.guardian)continue;if(Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<=trapRadius){takeDamage(e,(e.hp||1)*3,'#ff8f3d',false,0,'Armadilhas shinobi');trapped++;}}if(trapped){addRing(player.position,'#ff8f3d',trapRadius);playSfx('explosion');}
      refreshStats(true);invulnerability=Math.max(invulnerability,1.2);snapshotTimer=0;
      eventToast=delivered.length?`Caça-Níquel da Tsunade: ${delivered.length} resultado(s) entregue(s)${gained?' · +'+compactNumber(gained)+' Ryu':''}${paid?' · −'+compactNumber(paid)+' Ryu':''}${itemChoices?' · '+itemChoices+' prêmio(s) para escolher':''}${trapped?' · '+trapped+' monstro(s) nas armadilhas shinobi':''}${ambush?' · emboscada de '+ambush+' ninjas!':''}`:'Caça-Níquel da Tsunade: você saiu sem girar.';
      if(delivered.length)playSfx('pickup');
      showRouletteItem();saveRun();
      return delivered;
    }
    function rewardAction(action:'reroll'|'skip'|'ban'){
      if(choiceData&&(choiceLevel===-11||choiceLevel===-12)){if(action==='skip')skipHagoromoOffer();return;}
      if(choiceData&&choiceLevel===-13){if(action==='skip'){choiceData=null;keys.clear();eventToast='Might Guy: volte quando quiser!';snapshotTimer=0;}return;}
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
      else if(choiceLevel===0)choiceData=rollMegaLoot();
      else openLevelReward();
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
        {id:'iruka-ally',kind:'stat',name:'Iruka entra na equipe',rarity:'Raro',icon:'🧑‍🏫',disabled:joined?'Iruka já está na equipe.':full?`Vagas de suporte cheias (${allyActors.length}/${stats.supportSlots}).`:undefined,description:`Iruka vira ajudante com afinidade máxima: passiva Lições da Academia +${pctText(NPC_RULES.irukaAllyExp)} de experiência (× força de suporte) e ataque com kunai. Ocupa 1 vaga de suporte (${allyActors.length}/${stats.supportSlots}).`},
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
      if(offer.id==='iruka-ally'){if(!recruitAlly('iruka',true)){eventToast='Iruka: não há vaga de suporte livre.';choiceData=irukaMenu();return;}finishNpc(`Iruka entrou na equipe: +${pctText(NPC_RULES.irukaAllyExp*stats.allyBuff)} de experiência.`);return;}
      if(offer.deal){applyDeal('Iruka · lição',offer.deal);finishNpc('Iruka: '+dealText(offer.deal)+'.');}
    }
    // Naruto Totem: evento fixo no minuto 7 (7:00 → 6:00 do relógio regressivo). Invoca clones das sombras que correm até o jogador.
    let totem:Enemy|null=null,totemBar:ReturnType<typeof createTotemBar>|null=null,totemSpawned=false,totemDiscovered=false,totemCloneTimer=0,totemResult:''|'derrotado'|'expirou'='',pendingLevels=0;
    const totemPos=new THREE.Vector3();
    // ===== Rodada 98: Treinamento da Juventude (regras em src/game/youthTraining.ts) =====
    let youthEvent:(typeof events)[number]|null=null,youthOffer:YouthChallengeId|null=null,youthRun:(YouthRun&{killsAt:number;fighter:Enemy|null;spots:{x:number;z:number;mesh:THREE.Mesh;done:boolean}[]})|null=null;
    const youthSpotMaterial=new THREE.MeshBasicMaterial({color:'#7dff9a',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
    runCleanups.push(()=>youthSpotMaterial.dispose());
    function openYouth(event:(typeof events)[number]){
      if(youthRun){eventToast='Might Guy: termine o desafio atual primeiro!';return;}
      youthEvent=event;youthOffer??=rollYouthChallenge();
      choiceLevel=-13;choiceData=[];banning=false;keys.clear();snapshotTimer=0;
    }
    function clearYouthRun(){
      if(!youthRun)return;
      for(const spot of youthRun.spots){scene.remove(spot.mesh);spot.mesh.geometry.dispose();}
      const fighter=youthRun.fighter;
      if(fighter&&enemyList.includes(fighter)){enemyList.splice(enemyList.indexOf(fighter),1);bossCombat.dispose(fighter);disposeEnemySprite(fighter);}
      youthRun=null;snapshotTimer=0;
    }
    function startYouth(difficulty:YouthDifficulty){
      if(choiceLevel!==-13||!youthOffer)return;
      const challenge=youthOffer,{goal,seconds}=YOUTH_GOALS[challenge][difficulty];
      choiceData=null;keys.clear();youthOffer=null;if(youthEvent)youthEvent.active=false;
      youthRun={challenge,difficulty,timeLeft:seconds,progress:0,goal,killsAt:kills,fighter:null,spots:[]};
      if(challenge==='spots')for(const p of youthSpots(player.position.x,player.position.z,goal)){const x=THREE.MathUtils.clamp(p.x,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(p.z,-WORLD_LIMIT,WORLD_LIMIT);const mesh=new THREE.Mesh(new THREE.RingGeometry(.7,1.1,24),youthSpotMaterial);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,standHeight(x,z)+.08,z);scene.add(mesh);youthRun.spots.push({x,z,mesh,done:false});}
      if(challenge==='guy'||challenge==='lee'){const fighter=spawnEnemy(false,true,false,versionForEncounter(challenge,zone,mission));fighter.youth=true;fighter.hp*=YOUTH_FIGHTER_HP[difficulty];fighter.maxHp=(fighter.maxHp??fighter.hp)*YOUTH_FIGHTER_HP[difficulty];const x=player.position.x+v1.x*7,z=player.position.z+v1.z*7;fighter.sprite.position.set(x,standHeight(x,z)+fighter.sprite.scale.y*.46,z);fighter.seen=true;youthRun.fighter=fighter;}
      eventToast='Might Guy: '+YOUTH_TEXT+'! '+youthChallengeText(challenge,difficulty);playSfx('ultimate');snapshotTimer=0;
    }
    function tickYouthRun(dt:number){
      if(!youthRun)return;
      const run=youthRun;
      if(run.challenge==='spots')for(const spot of run.spots)if(!spot.done&&Math.hypot(player.position.x-spot.x,player.position.z-spot.z)<1.6){spot.done=true;scene.remove(spot.mesh);run.progress++;addRing(player.position,'#7dff9a',1.4);snapshotTimer=0;}
      if(run.challenge==='kills')run.progress=kills-run.killsAt;
      if(run.challenge==='guy'||run.challenge==='lee')run.progress=run.fighter&&!enemyList.includes(run.fighter)?1:0;
      const result=tickYouth(run,dt);
      if(result==='win'){const bonus=youthBonuses(run.difficulty);for(const [key,value] of Object.entries(bonus))runBuffs[key as StatKey]=(runBuffs[key as StatKey]??0)+(value??0);refreshStats(true);eventToast=`Might Guy: A JUVENTUDE EXPLODIU! Todos os atributos melhoraram (${run.difficulty}).`;playSfx('pickup');clearYouthRun();saveRun();}
      else if(result==='lose'){eventToast='Might Guy: o tempo acabou… treine mais e volte na próxima zona!';clearYouthRun();}
    }
    function failYouthNoHit(){if(youthRun?.challenge==='nohit'){eventToast='Might Guy: você foi acertado! O desafio acabou.';clearYouthRun();}}
    // ===== Rodada 97: Treinamento do Hagoromo (regras em src/game/hagoromoTraining.ts) =====
    const TOOL_ICONS:Record<string,string>={amuleto:'🧿',particulas:'✨',shakujo:'🔱',espada:'🗡️',bashosen:'🪭',kokinjo:'🪢',benihisago:'🏺',kohaku:'⚱️',shichiseiken:'⚔️'};
    const hasTool=(id:string)=>hagoromo.tools.includes(id);
    const toolDamage=(power:number)=>stats.damage*TECHNIQUE_SCALE*power*damageMultiplier*tune().playerDamage;
    let lastToolKills=0,pendingTool:string|null=null,toolCritAt=-1e9,toolSmokeAt=-1e9;
    const toolTimers={polar:0,spread:0,wind:0,blades:0},ropeAt=new WeakMap<Enemy,number>();
    function activateHagoromo(){
      if(!enabledRef.current||pausedRef.current||debugOpenRef.current||hagoromoEvent||arena||defeated||victory||sealing||choiceData||roulette)return;
      if(hagoromo.keys<=0){eventToast=hagoromoRecharges('classico',hagoromoBossDown)?`Treinamento do Hagoromo: faltam ${HAGOROMO.killsPerKey-hagoromo.progress} abates para a próxima chave.`:'Treinamento do Hagoromo: sem recarga depois do chefe da zona (volta na próxima zona).';snapshotTimer=0;return;}
      hagoromo.keys--;const rarity=rollHagoromoRarity();
      hagoromoEvent={rarity,wave:0,origin:{x:player.position.x,z:player.position.z},mega:null,completed:false,
        outsideEnemies:enemyList.splice(0),outsideDrops:drops};
      drops=hagoromoGround;
      for(const enemy of hagoromoEvent.outsideEnemies){
        enemy.sprite.visible=false;
        if(enemy.fixedArt)enemy.fixedArt.root.visible=false;
        if(enemy.boss){enemy.boss.bar.visible=false;if(enemy.boss.cast)enemy.boss.cast.marker.visible=false;}
      }
      zabuzaMistActive=false;
      enemyShots.length=0;
      for(const shot of shots){scene.remove(shot.mesh);disposeObject(shot.mesh);}
      shots.length=0;pendingHits.length=0;
      traversal.reset();walkingFloor=standHeight(HAGOROMO_ARENA.x,HAGOROMO_ARENA.z);
      player.position.set(HAGOROMO_ARENA.x,walkingFloor+player.scale.y*.5,HAGOROMO_ARENA.z);
      lockedTarget=null;addRing(player.position,'#c9b8ff',3);
      spawnHagoromoWave();playSfx('ultimate');
      eventToast=`Treinamento do Hagoromo (${rarity}) · ${HAGOROMO_WAVES[rarity].waves} hordas de ${HAGOROMO_WAVES[rarity].perWave} e um Mega Elite`;snapshotTimer=0;
    }
    function spawnHagoromoWave(){
      if(!hagoromoEvent)return;
      const count=HAGOROMO_WAVES[hagoromoEvent.rarity].perWave;
      for(const spot of waveSpots(HAGOROMO_ARENA.x,HAGOROMO_ARENA.z,count)){const e=spawnEnemy(true);e.challenge=false;e.hagoromo=true;e.sprite.position.set(spot.x,standHeight(spot.x,spot.z)+e.sprite.scale.y*.46,spot.z);}
      hagoromoEvent.wave++;eventToast=`Treinamento do Hagoromo · horda ${hagoromoEvent.wave}/${HAGOROMO_WAVES[hagoromoEvent.rarity].waves}`;snapshotTimer=0;
    }
    const toolCard=(tool:SageTool,label=''):LevelOffer=>({id:'hagoromo:'+tool.id,kind:'stat',name:tool.name,rarity:tool.rarity,icon:TOOL_ICONS[tool.id]??'◆',description:(label?label+' · ':'')+tool.stat+'. '+tool.detail});
    function finishHagoromo(){
      if(!hagoromoEvent)return;
      const {origin,rarity,outsideEnemies,outsideDrops}=hagoromoEvent;hagoromoEvent=null;
      for(const drop of drops.pulled()){creditDrop(drop);drops.collect(drop);}
      drops=outsideDrops;
      enemyList.push(...outsideEnemies);
      for(const enemy of outsideEnemies){if(enemy.boss?.cast)enemy.boss.cast.marker.visible=true;}
      lockedTarget=null;traversal.reset();
      player.position.set(origin.x,standHeight(origin.x,origin.z)+player.scale.y*.5,origin.z);addRing(player.position,'#c9b8ff',3);
      const offers=rollToolOffers(hagoromo.tools,rarity);
      if(!offers.length){eventToast='Treinamento do Hagoromo concluído · você já tem todas as ferramentas.';snapshotTimer=0;saveRun();return;}
      choiceLevel=-11;choiceData=offers.map(tool=>toolCard(tool));banning=false;keys.clear();snapshotTimer=0;saveRun();
    }
    function closeHagoromo(message:string){choiceData=null;keys.clear();eventToast=message;refreshStats(true);playSfx('pickup');snapshotTimer=0;saveRun();}
    function chooseHagoromoOffer(offer:LevelOffer){
      const id=offer.id.replace('hagoromo:','');if(!TOOL_BY_ID[id])return;
      if(choiceLevel===-11){
        if(hagoromo.tools.length<HAGOROMO.maxTools){hagoromo.tools=chooseTool(hagoromo.tools,id);closeHagoromo('Ferramenta do Sábio: '+TOOL_BY_ID[id].name);return;}
        // Com as 3: "Manter?" — clicar na nova dispensa; clicar numa que já tem troca (pedido do usuário).
        pendingTool=id;choiceLevel=-12;choiceData=[toolCard(TOOL_BY_ID[id],'Nova · clique para dispensar'),...hagoromo.tools.map(t=>toolCard(TOOL_BY_ID[t],'Clique para trocar por '+TOOL_BY_ID[id].name))];keys.clear();snapshotTimer=0;return;
      }
      if(choiceLevel===-12&&pendingTool){
        const added=pendingTool;pendingTool=null;const replace=id===added?undefined:id;
        hagoromo.tools=chooseTool(hagoromo.tools,added,replace);
        closeHagoromo(replace?TOOL_BY_ID[replace].name+' trocada por '+TOOL_BY_ID[added].name:TOOL_BY_ID[added].name+' dispensada');
      }
    }
    function skipHagoromoOffer(){const kept=pendingTool;pendingTool=null;closeHagoromo(kept?TOOL_BY_ID[kept].name+' dispensada':'Treinamento do Hagoromo: nenhuma ferramenta escolhida');}
    function tickHagoromo(dt:number){
      if(hagoromoEvent){
        // Fica dentro da clareira enquanto o treinamento durar.
        const dx=player.position.x-HAGOROMO_ARENA.x,dz=player.position.z-HAGOROMO_ARENA.z,d=Math.hypot(dx,dz);
        if(d>HAGOROMO.arenaRadius){player.position.x=HAGOROMO_ARENA.x+dx/d*HAGOROMO.arenaRadius;player.position.z=HAGOROMO_ARENA.z+dz/d*HAGOROMO.arenaRadius;}
        const next=nextHagoromoStage(hagoromoEvent.rarity,hagoromoEvent.wave,enemyList.some(e=>e.hagoromo),!!hagoromoEvent.mega);
        if(next==='wave')spawnHagoromoWave();
        if(next==='boss'){
          const m=spawnEnemy(false,true);
          const direction=d>3?-1:1,x=player.position.x+(d>3?dx/d:v1.x)*6*direction,z=player.position.z+(d>3?dz/d:v1.z)*6*direction;
          m.sprite.position.set(x,standHeight(x,z)+m.sprite.scale.y*.46,z);
          m.hagoromo=true;m.seen=true;m.arrivalGuard=1;hagoromoEvent.mega=m;
          addRing(m.sprite.position,'#c9b8ff',3);
          eventToast='Treinamento do Hagoromo · o Mega Elite chegou!';snapshotTimer=0;
        }
        if(next==='reward'&&!hagoromoEvent.completed){
          hagoromoEvent.completed=true;snapshotTimer=0;
          eventToast='Treino concluído · recolha os drops e aperte E para voltar.';
        }
      }
      if(!hagoromo.tools.length){lastToolKills=kills;return;}
      const near=(r:number,cx=player.position.x,cz=player.position.z)=>enemyList.filter(e=>(!hagoromoEvent||e.hagoromo)&&Math.hypot(e.sprite.position.x-cx,e.sprite.position.z-cz)<r);
      if(lastToolKills>kills)lastToolKills=kills;
      while(kills-lastToolKills>=100){lastToolKills+=100;
        if(hasTool('amuleto')){for(const e of near(6))if(!e.bijuu){e.control='Paralisar';e.controlTime=Math.max(e.controlTime||0,1);}addRing(player.position,'#ffe08a',6);}
        if(hasTool('benihisago')){const ryu=Math.round(kunaiPrice()*1.5);runMoney+=ryu;eventToast='Benihisago: +'+compactNumber(ryu)+' Ryu';}
      }
      if(hasTool('particulas')&&(toolTimers.polar-=dt)<=0){toolTimers.polar=8;for(const drop of drops.near(player.position.x,player.position.z,7))if(drop.mesh.position.distanceTo(player.position)<7)pullDrop(drop);addRing(player.position,'#b9e6ff',7);}
      if(hasTool('shakujo')&&(toolTimers.spread-=dt)<=0){toolTimers.spread=6;const source=near(8).find(e=>(e.controlTime||0)>0&&e.control);if(source){for(const e of near(3,source.sprite.position.x,source.sprite.position.z).filter(e=>e!==source&&!e.bijuu).slice(0,2)){e.control=source.control;e.controlTime=Math.max(e.controlTime||0,source.controlTime||1);}addRing(source.sprite.position,'#d8b7ff',3);}}
      if(hasTool('bashosen')&&(toolTimers.wind-=dt)<=0){toolTimers.wind=8;for(const e of near(8)){takeDamage(e,toolDamage(3),'#c8f5ff',false,0,'Bashōsen');if(!e.bijuu&&!e.guardian){const away=e.sprite.position.clone().sub(player.position).setY(0);if(away.lengthSq()>1e-6)e.sprite.position.addScaledVector(away.normalize(),2);}}addRing(player.position,'#c8f5ff',8);}
      if(hasTool('shichiseiken')&&(toolTimers.blades-=dt)<=0){toolTimers.blades=7;for(const e of near(15).sort((a,b)=>b.hp-a.hp).slice(0,7)){takeDamage(e,toolDamage(8),'#fff6c2',false,0,'Shichiseiken');addRing(e.sprite.position,'#fff6c2',1);}}
    }
    const hagoromoPhase=()=>hagoromoEvent?.completed?'complete':hagoromoEvent?.mega?'boss':hagoromoEvent?'wave':null;
    function hagoromoStage():HagoromoEncounterHud|undefined{
      const event=hagoromoEvent,phase=hagoromoPhase();
      if(!event||!phase)return;
      return {rarity:event.rarity,wave:event.wave,total:HAGOROMO_WAVES[event.rarity].waves,remaining:enemyList.length,phase};
    }
    function toolHitHooks(enemy:Enemy,damage:number,critical:boolean){
      if(!hagoromo.tools.length)return;
      const now=performance.now()/1000;
      if(critical&&hasTool('espada')&&now-toolCritAt>=.4){toolCritAt=now;
        const dir=enemy.sprite.position.clone().sub(player.position).setY(0);
        if(dir.lengthSq()>1e-6){dir.normalize();let cut=0;for(const e of [...enemyList]){if(e===enemy||cut>=3)continue;const rel=e.sprite.position.clone().sub(enemy.sprite.position).setY(0),along=rel.dot(dir);if(along>0&&along<6&&rel.addScaledVector(dir,-along).length()<.9){takeDamage(e,damage*.5,'#ffd27a',false,0,'Espada');cut++;}}}
      }
      if(critical&&hasTool('kohaku')&&now-toolSmokeAt>=2){toolSmokeAt=now;
        for(const e of enemyList)if(!e.bijuu&&Math.hypot(e.sprite.position.x-enemy.sprite.position.x,e.sprite.position.z-enemy.sprite.position.z)<4){e.slow=Math.max(e.slow??0,2);e.hitTimer=Math.max(e.hitTimer,2);}
        addRing(enemy.sprite.position,'#d9d9d9',4);
      }
      if(hasTool('kokinjo')&&(enemy.elite||enemy.megaElite)&&!enemy.bijuu&&now-(ropeAt.get(enemy)??-1e9)>=10){ropeAt.set(enemy,now);enemy.control='Paralisar';enemy.controlTime=Math.max(enemy.controlTime||0,1.5);addRing(enemy.sprite.position,'#ffd64a',1.2);}
    }
    function chooseLevelOffer(index:number){const offer=choiceData?.[index];if(!offer||offer.disabled)return;
      if(choiceLevel===-11||choiceLevel===-12){chooseHagoromoOffer(offer);return;}
      if(choiceLevel===-10&&offer.bonus){
        for(const [key,value] of Object.entries(offer.bonus))runBuffs[key as StatKey]=(runBuffs[key as StatKey]??0)+value;
        eventToast=(pendingAltar?.name??'Altar')+' · '+offer.name;
        pendingAltar=undefined;choiceData=null;keys.clear();refreshStats(true);playSfx('pickup');snapshotTimer=0;saveRun();return;
      }
      if(choiceLevel===-8){buyMerchant(index,offer);return;}
      if(choiceLevel===-9){const item=ITEM_BY_NAME[offer.name];if(item&&(knownItems[item.name]||0)<item.max){grantItem(item.name);playSfx('pickup');}else{const value=saleValue();runMoney+=value;eventToast=offer.name+' já está no limite: convertido em '+compactNumber(value)+' Ryu';}finishRouletteItem();saveRun();return;}
      if(choiceLevel===-7){resolveReplace(offer);return;}
      if(choiceLevel<=-3){chooseNpcOffer(offer);return;}
      if(choiceLevel===-2){forgetAtIchiraku(offer);return;}
      if(choiceLevel===-1){grantItem(offer.name);if(kakashiEvent)kakashiEvent.active=false;kakashiEvent=null;choiceData=null;keys.clear();eventToast='Tenten forjou uma cópia de '+offer.name+' (agora '+(knownItems[offer.name]||0)+'/'+(ITEM_BY_NAME[offer.name]?.max??'?')+').';playSfx('pickup');return;}
      if(banning){if(offer.kind==='stat'){eventToast='Vitalidade é a opção de reserva e não pode ser banida.';return;}banned.add(offer.name);uses.ban--;banning=false;eventToast=offer.name+' banido da run em todos os níveis e raridades';if(choiceLevel===0)choiceData=rollMegaLoot();else openLevelReward();snapshotTimer=0;return;}if(offer.kind==='skill'){if(familyOf(heroId)==='naruto'&&offer.name==='Invocação do Sapo'&&!skillLevels[offer.name]&&!hiddenEffects)showGamabunta(player.position,player.position.clone().add(heading),true);if(!hero.skills.includes(offer.name))addResearch(offer.name,researchGain(skillLevels[offer.name]?RESEARCH_RULES.perLevel:RESEARCH_RULES.perLearn,permanent['Pesquisa']||0));skillLevels[offer.name]=Math.min(techniqueLevelCap(offer,ex('skillCap')),(skillLevels[offer.name]||0)+1);const previous=growth[offer.name]??{...NO_GROWTH};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])previous[key]+=offer.growth?.[key]||0;growth[offer.name]=previous;}if(offer.kind==='pill'&&grantPill(knownPills,offer.name,ex('pillCap')))pillQuality[offer.name]=(pillQuality[offer.name]||0)+PILL_RARITY_POWER[offer.rarity]-1;if(offer.kind==='item')grantItem(offer.name);if(offer.kind==='stat'&&offer.bonus){for(const key of Object.keys(offer.bonus) as (keyof Bonuses)[])runBuffs[key]=(runBuffs[key]||0)+(offer.bonus[key]||0);}refreshStats(true);choiceData=null;keys.clear();}
    let streak: KillStreak = { count:0, lastAt:0 };
    const countKill = () => { kills += 1; streak = extendStreak(streak, elapsed); addHagoromoKills(hagoromo, 1, { inEvent: !!hagoromoEvent, recharge: hagoromoRecharges('classico', hagoromoBossDown) }); };
    let openingMegaSpawned=false;
    let yaw=village?0:Math.PI/4, targetYaw=yaw, pitch=perspective?CAMERA_VIEW.pitch:.55, targetPitch=pitch, zoom=currentSettings().cameraDistance, spawnTimer=1,megaSchedule=rollMegaSchedule(),megaElitesSpawned=0,accountEncounters=0,snapshotTimer=0,chakra=0,hp=stats.maxHp,level=1,xp=0,xpNext=30,kills=0,runMoney=0,frames=0,fps=0,fpsTimer=0,autoUlt=currentSettings().autoUltimate,last=performance.now(),elapsed=0,eventToast='',zoneDifficulty=1,xpMultiplier=1,lootMultiplier=1;
    const enemyWeapons=['Kunai','Shuriken','Shuriken Fūma'] as const;
    const enemyShots:{object:THREE.Object3D;type:ThrownWeapon;direction:THREE.Vector3;life:number;speed:number;damage:number;radius:number}[]=[];
    const shadowClones:{sprite:THREE.Sprite;motion:ReturnType<typeof createPlayerMotion>;target:Enemy;life:number;technique:Technique;growth:SkillGrowth;ally:boolean;level:number}[]=[];
    const effects:THREE.Mesh[]=[],visuals:{object:THREE.Object3D;life:number;tick?:(dt:number)=>void}[]=[],numbers:{sprite:THREE.Sprite;life:number}[]=[];let currentPing:{x:number;z:number}|null=null;
    // ───── Rota do mapa (M/Tab) ─────
    // Um único alvo de rastreio por vez: ícone visto (evento/NPC, mega elite/guardião/totem, recompensa no chão) OU ping livre.
    // Escolher outro alvo substitui o anterior; repetir o mesmo alvo limpa. A < ROUTE_ARRIVE m: "Chegou!" e a rota some.
    // Se o alvo deixa de existir (evento usado, inimigo derrotado, recompensa coletada), a rota é limpa com aviso.
    const ROUTE_ARRIVE=3;
    /** Shinobi para selar: no máximo 1 por run (o 1º encontro especial). Em testes automáticos (?test) não surge sozinho. */
    let targetZoom=zoom;
    let forceElite=false,nextAccountAt=0,rightDownX=0,rightDownY=0;
    // ───── Alvo fixo (clique com o botão direito, sem arrastar) ─────
    // Prioridade: guardião/chefe > Mega Elite / Shinobi para selar > elite amarelo > maior HP, entre os inimigos visíveis até 30 m.
    // As técnicas miram o alvo fixo quando ele está no alcance; clicar de novo solta. Mover o mouse gira a câmera.
    let lockedTarget:Enemy|null=null;
    const activeFocus=()=>canLockTarget(zabuzaMistActive)?lockedTarget:null;
    const targetMarker=new THREE.Mesh(new THREE.RingGeometry(.9,1.15,32),new THREE.MeshBasicMaterial({color:'#ff3355',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));targetMarker.rotation.x=-Math.PI/2;targetMarker.visible=false;
    const targetPriority=(e:Enemy)=>e.guardian||e.boss?4:e.megaElite||e.account?3:e.elite?2:1;
    function toggleTargetLock(){if(lockedTarget){lockedTarget=null;eventToast='Alvo solto.';return;}if(!canLockTarget(zabuzaMistActive)){eventToast='Névoa do Zabuza: não dá para fixar alvo.';return;}const visible=enemyList.filter(e=>!e.clone&&viewFrustum.containsPoint(e.sprite.position)&&Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<30);visible.sort((a,b)=>targetPriority(b)-targetPriority(a)||b.hp-a.hp);lockedTarget=visible[0]??null;eventToast=lockedTarget?'Alvo fixado: '+(lockedTarget.heroId?HERO_BY_ID[lockedTarget.heroId]?.name??'inimigo':lockedTarget.elite?'elite':'inimigo')+' (clique direito solta)':'Nenhum inimigo visível para fixar.';}
    function updateTargetMarker(){if(lockedTarget&&!enemyList.includes(lockedTarget))lockedTarget=null;if(lockedTarget&&!canLockTarget(zabuzaMistActive)){lockedTarget=null;eventToast='A névoa do Zabuza fez você perder o alvo.';}if(!targetMarker.parent)scene.add(targetMarker);targetMarker.visible=!!lockedTarget;if(lockedTarget){const p=lockedTarget.sprite.position;targetMarker.position.set(p.x,terrainHeight(p.x,p.z)+.12,p.z);targetMarker.rotation.z+=.04;const s=lockedTarget.megaElite?1.6:lockedTarget.elite?1.25:1;targetMarker.scale.set(s,s,s);}}const accountTried=new Set<string>();
    /** Shinobis de conta que podem surgir agora (missão cumprida nesta run; versões só jogando com a versão anterior `playWith`). */
    function accountCandidates(){return HEROES.filter(h=>{const m=UNLOCK_MISSIONS[h.id];return m&&!accountTried.has(h.id)&&m.map===mapId&&m.difficulty===mission&&elapsed>=m.minute*60&&kills>=m.kills&&(!m.playWith||m.playWith===heroId)&&missingRequirements(h.id,sealedHeroes()).length===0&&!unlockedHeroes().has(h.id)&&h.id!==heroId&&!allies.includes(h.id);});}const testRun=import.meta.env.DEV&&new URLSearchParams(location.search).has('test');
    /** Frustum da câmera no último quadro: o mapa só mostra o que está/esteve na tela. */
    const viewFrustum=new THREE.Frustum();const perfMonitor=createPerfMonitor();
    /** Pontos de inimigos para minimapa/mapa: só os visíveis, fundidos em células de MAP_DOT_CELL m e limitados a MAP_DOT_CAP
     *  (antes: 1 elemento React por inimigo a cada 0,2 s — com 1600 inimigos isso dominava o tempo de quadro). */
    const MAP_DOT_CELL=1.5,MAP_DOT_CAP=300,mapDotCells=new Set<number>();
    function mapEnemyDots(){if(mistHides(weatherEvent,elapsed))return [];mapDotCells.clear();const out:{x:number;z:number}[]=[];for(const e of enemyList){const p=e.sprite.position;if(!viewFrustum.containsPoint(p))continue;const key=(Math.round(p.x/MAP_DOT_CELL)+4096)*8192+Math.round(p.z/MAP_DOT_CELL)+4096;if(mapDotCells.has(key))continue;mapDotCells.add(key);out.push({x:p.x,z:p.z});if(out.length>=MAP_DOT_CAP)break;}return out;}
    type RouteTarget={kind:RouteView['kind'];id:string;name:string;x:number;z:number};
    let route:RouteTarget|null=null,routeNotice:{text:string;kind:'arrived'|'lost'|'set';until:number}|null=null,megaUid=0;
    const routeProbe=new THREE.Vector3();
    const megaName=(e:Enemy)=>e.bijuu?(e.boss?.name??'Bijū'):(e.hagoromo?'Treinamento do Hagoromo · ':e.guardian?'Guardião · ':e.account?'Shinobi para selar · ':'Mega Elite · ')+(HERO_BY_ID[e.heroId??'']?.name??'?');
    function markNpcUsed(id:string){
      const event=events.find(entry=>entry.id===id);
      if(event)event.uses++;
      snapshotTimer=0;
    }
    const mapEventAvailable=(event:(typeof events)[number])=>event.active&&event.uses===0&&(event.discovered||event.id==='guardian-seal')&&(event.id!=='sapos-sabios'||sagesUsedZone!==zone);
    const routeDistance=(t:{x:number;z:number})=>Math.hypot(t.x-player.position.x,t.z-player.position.z);
    const notifyRoute=(text:string,kind:'arrived'|'lost'|'set')=>{routeNotice={text,kind,until:performance.now()+(kind==='set'?1800:2600)};eventToast=text;snapshotTimer=0;};
    /** Alvo visto e ainda existente pelo id do mapa; null se sumiu ou nunca foi visto. */
    function findRouteTarget(id:string):RouteTarget|null{
      if(id==='portal')return portal?{kind:'event',id,name:portalTitle(portal.kind),x:portal.x,z:portal.z}:null;
      if(id==='ping')return currentPing?{kind:'ping',id,name:'Ping',x:currentPing.x,z:currentPing.z}:null;
      if(id==='naruto-totem')return totem&&totemDiscovered?{kind:'enemy',id,name:'Naruto Totem',x:totem.sprite.position.x,z:totem.sprite.position.z}:null;
      if(id.startsWith('mega-')){const e=enemyList.find(e=>e.uid!==undefined&&'mega-'+e.uid===id&&e.seen);return e?{kind:'enemy',id,name:megaName(e),x:e.sprite.position.x,z:e.sprite.position.z}:null;}
      if(id.startsWith('pickup-')){const p=pickups.find(p=>p.id===id&&p.active&&p.discovered);return p?{kind:'pickup',id,name:p.name,x:p.x,z:p.z}:null;}
      const landmark=villageActive?civicScene?.landmarks.find(point=>point.id===id):undefined;
      if(landmark)return {...landmark,kind:'event'};
      const ev=events.find(e=>e.id===id&&mapEventAvailable(e));return ev?{kind:'event',id,name:ev.name,x:ev.x,z:ev.z}:null;
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
    /** Marcos fixos e marcadores dinâmicos já vistos em tela. */
    function mapMarkers():WorldSnapshot['events']{
      const mist=!hagoromoEvent&&mistHides(weatherEvent,elapsed);
      const objectives:WorldSnapshot['events']=[];
      if(portal&&!hagoromoEvent)objectives.push({id:'portal',name:portalTitle(portal.kind),x:portal.x,z:portal.z,icon:portal.kind==='arena'?'bijuu-portal':'🌀',kind:'event',active:true});
      const markerForBoss=(e:Enemy)=>({id:'mega-'+e.uid,name:megaName(e),x:e.sprite.position.x,z:e.sprite.position.z,icon:e.bijuu?'guardian-bijuu':e.guardian?'👑':e.account?'🔓':'💀',kind:'enemy' as const,portrait:e.bijuu?undefined:e.heroId,guardian:!!e.guardian,active:true});
      for(const boss of enemyList)if(boss.guardian||boss===hagoromoEvent?.mega)objectives.push(markerForBoss(boss));
      if(mist){
        const boss=enemyList.find(enemy=>enemy.heroId===weatherEvent?.elite&&!enemy.guardian);
        if(boss&&routeDistance(boss.sprite.position)<ZABUZA_MIST.reveal)objectives.push(markerForBoss(boss));
        return objectives;
      }
      if(hagoromoEvent)return objectives;
      return [
      ...objectives,
      ...(villageActive?(civicScene?.landmarks??[]).map(point=>({...point,kind:'landmark' as const})):[]),
      ...events.filter(mapEventAvailable).map(e=>({id:e.id,name:e.name,x:e.x,z:e.z,icon:e.icon,kind:'event' as const,active:e.active})),
      ...(totem&&totemDiscovered?[{id:'naruto-totem',name:'Naruto Totem',x:totem.sprite.position.x,z:totem.sprite.position.z,icon:'🍥',kind:'enemy' as const,portrait:'naruto',active:true}]:[]),
      // Rodada 55: corpo caído esperando o E (retrato + ⛓) no minimapa e no mapa.
      ...fallenMegas.map(f=>({id:'fallen-'+f.candidate.heroId,name:f.candidate.target+(f.candidate.account?' · Shinobi para selar caído (E)':' · Mega Elite caído (E)'),x:f.body.position.x,z:f.body.position.z,icon:'⛓',kind:'enemy' as const,portrait:f.candidate.heroId,active:true})),
      ...enemyList.filter(e=>e.megaElite&&!e.guardian&&e.seen&&e.uid!==undefined).map(markerForBoss)];}
    const quickMap=createQuickMapInput(open=>showPanel(open?'quickmap':null));
    /** Botão direito segurado com o Tab aberto: a kunai do cursor aparece para marcar rota. */
    let quickCursor=false;
    function showPanel(next:GamePanel){
      if(next===null)suppressUnlockPauseUntil.current=performance.now()+800;
      if(next!=='quickmap'){quickMap.clear();quickCursor=false;}
      panelRef.current=next;
      onPanelRef.current(next);
    }
    // CHOICE_GUARD: só aceita escolha depois que o mesmo conjunto de cartas ficou armSeconds na tela. Testes automáticos
    // (?test sem &guard=1) dispensam a espera para não depender do FPS do navegador headless — vale também para
    // ?test=1&pointer=real, onde o clique na carta tem de re-acionar o ponteiro sem depender do relógio do headless.
    let guardedChoice:LevelOffer[]|null=null,guardedSince=0;const guardOff=import.meta.env.DEV&&params.has('test')&&!params.has('guard');
    const choiceArmed=()=>{const now=performance.now();if(choiceData!==guardedChoice){guardedChoice=choiceData;guardedSince=now;return guardOff;}return guardOff||now-guardedSince>=CHOICE_GUARD.armSeconds*1000;};
    const recaptureAfterChoice=()=>{if(!testPointer&&!choiceData&&!roulette&&!sealing&&!pausedRef.current&&!defeated&&!victory)captureGamePointer();};
    function setHiddenEffects(value:boolean){
      hiddenEffects=value;
      particles.setHidden(value);
      susanoo.setHidden(value);
      for(const effect of effects)effect.visible=!value;
      for(const shot of shots)shot.mesh.visible=!value;
      for(const fx of visuals)fx.object.visible=!value;
      for(const number of numbers)number.sprite.visible=!value;
    }
    const movementInput=createMovementInput();
    const onKeyDown=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.matches('input,select,textarea'))return;
      const rawKey=e.key.toLowerCase();
      if(rawKey==='tab'){
        if(enabledRef.current&&!debugOpenRef.current&&!defeated&&!victory)quickMap.press(e,cameraCanMove(),panelRef.current==='quickmap');
        return;
      }
      const key=rawKey==='escape'?rawKey:translateKey(rawKey);
      if(!key||e.repeat&&['m','p','e','r','g','y','h'].includes(key))return;
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();
      if(!enabledRef.current||defeated||victory||debugOpenRef.current)return;movementInput.press(e.code||rawKey,key);if(document.querySelector('.game-panel-backdrop.over-choice')){if(key==='escape'||key==='p')onPanelRef.current(null);return;}if(key==='p'&&(sealing||choiceData||roulette)){if(sealing?.phase!=='sealing')onPanelRef.current('sheet');return;}if(roulette)return;/* Roleta aberta: TsunadeRoulette.tsx trata E/Esc/F/X. */if(sealing){if(key==='e'&&sealing.phase==='ready'&&sealing.account){sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;eventToast='O selo está prendendo o chakra do shinobi…';playSfx('ultimate');}else if(key==='g'&&sealing.phase==='ready'&&sealing.account){const lost=sealing.target;nextSeal();eventToast=lost+' escapou: não foi desbloqueado na conta.';}else if(key==='e'&&sealing.phase==='ready'){if(hasAllyFamily(sealing.heroId)){eventToast=sealing.target+' já está na equipe: G para receber um item.';return;}if(allyActors.length>=stats.supportSlots){openReplace(sealing);return;}sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;eventToast='O selo está prendendo o chakra do inimigo…';playSfx('ultimate');}else if(key==='g'&&sealing.phase==='ready'){spawnPickup('sealDrop',player.position.x,player.position.z);nextSeal();eventToast='Selamento recusado: siga a luz verde do pergaminho para escolher um item';}else if((key==='enter'||key==='e')&&sealing.phase==='complete'){nextSeal();if(!sealing&&!replaceCandidate)eventToast='Shinobi selado e adicionado à equipe desta missão';}recaptureAfterChoice();return;}if(choiceData){if(key==='escape'){if(choiceLevel===-8&&!document.querySelector('.game-panel-backdrop')){rewardAction('skip');recaptureAfterChoice();}else onPanelRef.current(null);return;}if(e.repeat||pausedRef.current&&document.querySelector('.game-panel-backdrop'))return;if(!choiceArmed())return;if(key==='v')sellLoot();else if(key==='e'&&choiceLevel===-9)chooseLevelOffer(0);else if(key==='f')rewardAction('reroll');else if(key==='x')rewardAction('skip');else if(key==='z')rewardAction('ban');else if(/^[1-9]$/.test(key))chooseLevelOffer(Number(key)-1);recaptureAfterChoice();return;}
      if(key==='m'){showPanel(panelRef.current==='map'?null:'map');return;}
      if(key==='p'){showPanel(pausedRef.current?null:'sheet');return;}
      if(key==='escape'&&panelRef.current==='quickmap'){showPanel(null);return;}
      if(pausedRef.current){if(key==='escape')showPanel(null);return;}
      if(key==='g'){/* G marca 📍 aqui sem rota; se a rota era um ping, ela é substituída. */if(route?.kind==='ping')clearRoute();currentPing={x:player.position.x,z:player.position.z};return;}if(key==='e'){interact();return;}if(key==='escape'){showPanel('pause');return;}if(!testPointer&&!pointerLocked())captureGamePointer();if(key==='h'){setHiddenEffects(!hiddenEffects);return;}if(key==='c')activateHagoromo();if(key==='y'){onToggleAuto();return;}if(key==='r'){castUltimate();return;}if(key===' '){if(sandCloud)keys.add(' ');if(!e.repeat&&!jumpTime&&!slideTime){readMovement(dir);if(villageActive&&traversal.jump(player.position,dir.lengthSq()?dir.normalize():heading,standHeight(player.position.x,player.position.z)))return;jumpTime=jumpDuration;sandGlideLeft=sandCloud ? .9 : 0;}return;}if(key==='shift'){if(!e.repeat&&!jumpTime&&!slideRecovery&&!traversal.climbing){readMovement(dashHeading);if(dashHeading.lengthSq())dashHeading.normalize();else dashHeading.copy(heading);slideTime=slideDuration;slideRecovery=.9;invulnerability=Math.max(invulnerability,.14);}return;}};
    // Ultimate automática: tecla Y ou clique no selo AUTO do botão R (evento shinobi-toggle-auto-ult).
    // Rodada 88 (pedido do usuário: "Se no ultimo jogo eu deixei a ultimate automática, na próxima partida, ela já começa automática"):
    // a troca na partida fica salva nas Configurações (Ultimate automática ao começar).
    function onToggleAuto(){if(!enabledRef.current||defeated||victory)return;autoUlt=!autoUlt;const saved=readSettings();if(saved.autoUltimate!==autoUlt)saveSettings({...saved,autoUltimate:autoUlt});}window.addEventListener('shinobi-toggle-auto-ult',onToggleAuto);
    window.addEventListener('shinobi-hagoromo',activateHagoromo);
    runCleanups.push(()=>window.removeEventListener('shinobi-hagoromo',activateHagoromo));
    // Rodada 98: o painel do Might Guy começa o desafio na dificuldade escolhida.
    const onYouth=(event:Event)=>startYouth((event as CustomEvent<YouthDifficulty>).detail);window.addEventListener('shinobi-youth',onYouth);
    const onKeyUp=(e:KeyboardEvent)=>{
      const raw=e.key.toLowerCase();
      if(raw==='tab'||e.code==='Tab'){quickMap.release(panelRef.current==='quickmap');return;}
      movementInput.release(e.code||raw);
      keys.delete(translateKey(raw)||raw);keys.delete(raw);
    };
    let lastPointer: { x:number; y:number }|undefined;
    const resetPointer=()=>{lastPointer=undefined;};
    const onBlur=()=>{
      keys.clear();movementInput.clear();quickMap.clear();resetPointer();moving=false;
      if(cameraCanMove()){pausedRef.current=true;showPanel('pause');}
      else if(panelRef.current==='quickmap')showPanel(null);
    };
    const onHidden=()=>{if(document.hidden)onBlur();};document.addEventListener('visibilitychange',onHidden);runCleanups.push(()=>document.removeEventListener('visibilitychange',onHidden));
    const pointerLocked=()=>Boolean(pointerSurface&&document.pointerLockElement===pointerSurface);
    const cameraCanMove=()=>enabledRef.current&&!debugOpenRef.current&&!pausedRef.current&&!choiceData&&!roulette&&!sealing&&!defeated&&!victory;
    const turnCamera=(dx:number,dy:number)=>{
      const settings=currentSettings();
      // 1:1 direto, sem amortecimento: giro constante = movimento × sensibilidade configurada (sem aceleração, rodada 29).
      // Rodada 44 (pedido do usuário: "rawinputmouse ainda está esquisito" + "câmera muito rápida" + "deitar mais a câmera"):
      // taxa única e simétrica yaw/pitch (antes 0.006/0.004 = assimetria 1.5:1) e ~58% mais calma; piso do pitch deitado
      // (0.05 rad ≈ 3°, antes 0.12 ≈ 7°) para o ângulo baixo do jogo de referência. Proteções de ângulo baixo já existentes:
      // scan de terreno que auto-sobe em encostas, câmera nunca abaixo do chão (terrainHeight+1.2) e near ≤ −70 m.
      // Rodada 55 (pedido: "ser possível deitar mais a câmera"): piso 0.05 → CAMERA_MIN_PITCH (0.03 rad ≈ 1,7°); o que
      // travava na prática era o scan de terreno (exigia ver até os pés) e a trava de altura da câmera — ver o laço da câmera.
      targetYaw-=dx*.0025*settings.mouseSensitivity;
      targetPitch=THREE.MathUtils.clamp(targetPitch+dy*.0025*settings.mouseSensitivity*(settings.invertY?-1:1),CAMERA_MIN_PITCH,1.48);
    };
    let cameraViewPitch=pitch;
    // Rodada 58 (pedido: "o jogo deve prender o mouse na tela… apenas se dermos alttab ou tecla Windows, sair, ai o jogo
    // pausa"): com uma tela aberta por cima do jogo (cartas, roleta, selamento, NPC, mapa, ficha P) o ponteiro continua
    // preso e uma kunai virtual faz o papel do cursor (src/scene/virtualCursor.ts). Esc (regra do navegador), Alt+Tab e a
    // tecla Windows soltam o ponteiro; perder o foco pausa (onBlur).
    const cursorEl=document.createElement('div');cursorEl.className='virtual-cursor';cursorEl.setAttribute('aria-hidden','true');document.body.appendChild(cursorEl);
    const cursor=createVirtualCursor({elementFromPoint:(x,y)=>document.elementFromPoint(x,y),width:()=>window.innerWidth,height:()=>window.innerHeight,
      draw:(x,y,visible)=>{cursorEl.style.display=visible?'block':'none';cursorEl.style.transform=`translate(${x}px,${y}px)`;}});
    /** Tela de interface aberta durante a missão (o ponteiro fica preso e a kunai virtual aparece). */
    /**
     * Tab (25/11/2026 — pedido do usuário: "Quando apertamos tab deve ser possível girar a tela"): com o mapa rápido aberto o
     * mouse gira a câmera; segurar o botão direito mostra a kunai do cursor para marcar rota no mapa.
     */
    const onQuickCursor=(e:MouseEvent)=>{if(!e.isTrusted||e.button!==2||panelRef.current!=='quickmap')return;quickCursor=e.type==='mousedown';};
    document.addEventListener('mousedown',onQuickCursor,true);document.addEventListener('mouseup',onQuickCursor,true);
    runCleanups.push(()=>{document.removeEventListener('mousedown',onQuickCursor,true);document.removeEventListener('mouseup',onQuickCursor,true);});
    const overlayUi=()=>enabledRef.current&&((panelRef.current==='quickmap'&&quickCursor)||!cameraCanMove())&&!debugOpenRef.current&&!defeated&&!victory;
    const forwardButton=(e:MouseEvent)=>{if(!e.isTrusted||!cursor.isActive())return;e.preventDefault();e.stopImmediatePropagation();if(e.type==='mousedown')cursor.down(e.button);else if(e.type==='mouseup')cursor.up(e.button);};
    const forwardWheel=(e:WheelEvent)=>{if(!e.isTrusted||!cursor.isActive())return;e.stopImmediatePropagation();cursor.wheel(e.deltaY);};
    for(const type of ['mousedown','mouseup','click','contextmenu','pointerdown','pointerup','auxclick'])document.addEventListener(type,forwardButton as EventListener,true);
    document.addEventListener('wheel',forwardWheel,{capture:true,passive:true});
    runCleanups.push(()=>{for(const type of ['mousedown','mouseup','click','contextmenu','pointerdown','pointerup','auxclick'])document.removeEventListener(type,forwardButton as EventListener,true);document.removeEventListener('wheel',forwardWheel,{capture:true});cursor.setActive(false);cursorEl.remove();});
    const onLockedMove=(e:MouseEvent)=>{if(!e.isTrusted)return;if(cursor.isActive())cursor.move(e.movementX*.55,e.movementY*.55);else if(pointerLocked()&&cameraCanMove())turnCamera(e.movementX,e.movementY);};
    const onLockedRight=(e:MouseEvent)=>{if(pointerLocked()&&e.button===2&&cameraCanMove()&&panelRef.current!=='quickmap')toggleTargetLock();};
    const onLockedContext=(e:MouseEvent)=>{if(pointerLocked())e.preventDefault();};
    let hadLock=pointerLocked();
    const onLockChange=()=>{
      const locked=pointerLocked();
      if(hadLock&&!locked&&panelRef.current!=='quickmap'){
        keys.clear();
        if(!panelRef.current&&suppressUnlockPauseUntil.current<=performance.now()&&cameraCanMove()){
          pausedRef.current=true;showPanel('pause');
        }
      }
      hadLock=locked;resetPointer();
    };
    document.addEventListener('pointerlockchange',onLockChange);
    document.addEventListener('mousemove',onLockedMove);
    document.addEventListener('mouseup',onLockedRight);
    document.addEventListener('contextmenu',onLockedContext);
    runCleanups.push(()=>{document.removeEventListener('pointerlockchange',onLockChange);document.removeEventListener('mousemove',onLockedMove);document.removeEventListener('mouseup',onLockedRight);document.removeEventListener('contextmenu',onLockedContext);});
    const npcRay=new THREE.Raycaster(), clickPoint=new THREE.Vector2();
    const clickFieldNpc=(e:MouseEvent)=>{
      if(hagoromoEvent||panelRef.current==='quickmap'||!cameraCanMove()||e.button!==0)return false;
      const nearZetsu=zetsuEvent.active&&zetsuEvent.obj.visible&&Math.hypot(player.position.x-zetsuEvent.x,player.position.z-zetsuEvent.z)<=AKATSUKI_AMBUSH.interact;
      const nearIchiraku=teuchi.visible&&ichiraku.active&&Math.hypot(player.position.x-ichiraku.x,player.position.z-ichiraku.z)<=3.6;
      if(!nearZetsu&&!nearIchiraku)return false;
      const bounds=container.getBoundingClientRect();
      clickPoint.set(pointerLocked()?0:2*(e.clientX-bounds.left)/bounds.width-1,pointerLocked()?0:1-2*(e.clientY-bounds.top)/bounds.height);
      npcRay.setFromCamera(clickPoint,camera);
      if(nearZetsu&&npcRay.intersectObject(zetsuEvent.obj,true).length&&startAkatsukiAmbush())return true;
      if(!nearIchiraku||(!npcRay.intersectObject(ichiraku.obj,true).length&&!npcRay.intersectObject(teuchi,true).length))return false;
      openIchiraku();
      return true;
    };
    const onLockedClick=(e:MouseEvent)=>{if(pointerLocked())clickFieldNpc(e);};
    document.addEventListener('click',onLockedClick);
    runCleanups.push(()=>document.removeEventListener('click',onLockedClick));
    const onDown=(e:PointerEvent)=>{if(e.button===0&&!pointerLocked()&&cameraCanMove()&&!clickFieldNpc(e))captureGamePointer();if(e.button===2){rightDownX=e.clientX;rightDownY=e.clientY;}};
    const onMove=(e:PointerEvent)=>{
      const previous=lastPointer;
      lastPointer={x:e.clientX,y:e.clientY};
      if(!testPointer||!previous||e.pointerType!=='mouse'||pointerLocked()||!cameraCanMove())return;
      turnCamera(e.clientX-previous.x,e.clientY-previous.y);
    };
    const onUp=(e:PointerEvent)=>{if(!pointerLocked()&&e.button===2&&Math.hypot(e.clientX-rightDownX,e.clientY-rightDownY)<6)toggleTargetLock();};const onContext=(e:MouseEvent)=>e.preventDefault();
    const onWheel=(e:WheelEvent)=>{if(!cameraCanMove())return;targetZoom=THREE.MathUtils.clamp(targetZoom+Math.sign(e.deltaY)*CAMERA_ZOOM.step,CAMERA_ZOOM.min,CAMERA_ZOOM.max);};
    const onLockedWheel=(e:WheelEvent)=>{if(pointerLocked())onWheel(e);};
    document.addEventListener('wheel',onLockedWheel,{passive:true});runCleanups.push(()=>document.removeEventListener('wheel',onLockedWheel));
    const onPing=(event:Event)=>{const p=(event as CustomEvent<{x:number;z:number}>).detail;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z))setPingRoute(p.x,p.z);};window.addEventListener('shinobi-ping',onPing);
    // Mapa: clique num ícone visto → rota (mesmo id de novo ou id null limpa).
    const onRoute=(event:Event)=>{const d=(event as CustomEvent<{id:string|null}>).detail;if(!enabledRef.current||defeated||victory)return;setRoute(d?.id??null);};window.addEventListener('shinobi-route',onRoute);
    // Clique numa carta (qualquer quantidade de cartas, ex.: cópia do Kakashi com muitos itens).
    const onChoose=(event:Event)=>{const detail=(event as CustomEvent<number|{index:number;id:string}>).detail;const index=typeof detail==='number'?detail:detail?.index??-1;if(detail&&typeof detail==='object'&&choiceData?.[index]?.id!==detail.id)return;if(!enabledRef.current||defeated||victory||!choiceData||sealing||!Number.isInteger(index))return;if(document.querySelector('.game-panel-backdrop'))return;if(!choiceArmed())return;chooseLevelOffer(index);recaptureAfterChoice();};window.addEventListener('shinobi-choose',onChoose);
    const onSagesTab=(event:Event)=>{const kind=(event as CustomEvent<string>).detail;if(choiceLevel===-6&&choiceData&&(kind==='fuse'||kind==='combine'))openSages(kind);};
    window.addEventListener('shinobi-sages-tab',onSagesTab);runCleanups.push(()=>window.removeEventListener('shinobi-sages-tab',onSagesTab));
    const onTrade=(event:Event)=>{if(!enabledRef.current||defeated||victory||!choiceData||sealing||document.querySelector('.game-panel-backdrop'))return;const action=(event as CustomEvent<string>).detail;if(action==='sell')sellLoot();else if(choiceLevel===-8&&action==='reroll')rerollMerchant();else if(choiceLevel===-8&&action==='exit')rewardAction('skip');recaptureAfterChoice();};
    window.addEventListener('shinobi-trade',onTrade);runCleanups.push(()=>window.removeEventListener('shinobi-trade',onTrade));
    // Caça-Níquel da Tsunade: a UI pede giro/saída por evento síncrono e lê a resposta em detail.result.
    const onRoulette=(event:Event)=>{const d=(event as CustomEvent<{action:string;result?:unknown}>).detail;if(!d||!enabledRef.current||defeated||victory)return;if(d.action==='spin')d.result=spinRoulette();else if(d.action==='exit'){d.result=closeRoulette();recaptureAfterChoice();}else if(d.action==='view')d.result=rouletteView();};window.addEventListener('shinobi-roulette',onRoulette);
    window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);
    container.addEventListener('pointerdown',onDown);container.addEventListener('pointermove',onMove);container.addEventListener('pointerup',onUp);container.addEventListener('pointercancel',resetPointer);container.addEventListener('pointerleave',resetPointer);container.addEventListener('contextmenu',onContext);container.addEventListener('wheel',onWheel,{passive:true});
    let aspect=1;
    const projectCamera=()=>{if(camera instanceof THREE.PerspectiveCamera){camera.aspect=aspect;camera.updateProjectionMatrix();return;}camera.left=-zoom*aspect/2;camera.right=zoom*aspect/2;camera.top=zoom/2;camera.bottom=-zoom/2;camera.updateProjectionMatrix();};
    const resize=()=>{const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;aspect=w/h;projectCamera();renderer.setSize(w,h);};resize();const observer=new ResizeObserver(resize);observer.observe(container);
    const v1=new THREE.Vector3(),v2=new THREE.Vector3(),dir=new THREE.Vector3(),enemyTravel=new THREE.Vector3(),offset=new THREE.Vector3();
    let moveVertical=0,moveHorizontal=0;
    function readMovement(out:THREE.Vector3) {
      const {vertical,horizontal}=movementInput.axes();
      moveVertical=vertical;moveHorizontal=horizontal;
      out.copy(v1).multiplyScalar(vertical).addScaledVector(v2,horizontal);
    }
    // Cache de geometria dos anéis: mesmo visual (torus .11 por tamanho), sem realocar geometria a cada anel nem
    // liberar a cache ao terminar o anel — só no unmount, via runCleanups.
    const ringGeometryCache=new Map<string,THREE.TorusGeometry>();const ringGeometries=new Set<THREE.BufferGeometry>();
    const ringGeometryFor=(size:number)=>{const k=size.toFixed(2);let g=ringGeometryCache.get(k);if(!g){g=new THREE.TorusGeometry(size,.11,6,24);ringGeometryCache.set(k,g);ringGeometries.add(g);}return g;};
    runCleanups.push(()=>{for(const g of ringGeometries)g.dispose();});
    const addRing=(position:THREE.Vector3,color:string,size:number)=>{if(hiddenEffects)return;const ring=new THREE.Mesh(ringGeometryFor(size),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.copy(position);ring.position.y=terrainHeight(position.x,position.z)+.18;scene.add(ring);effects.push(ring);};
    // Chefes (mega elites e guardiões): barra de vida 3D e técnicas do personagem com aviso no chão.
    let playerSlow=0;
    /** Clarão da cena e vinheta das bordas, acionados pela perda real de HP. */
    const damageFlash=createDamageFlash();
    const damageVignette=container.querySelector<HTMLElement>('.player-damage-vignette');
    const damageImpact=container.querySelector<HTMLElement>('.player-damage-impact');
    /** Todo dano recebido passa aqui: escudo, evasão, armadura (+Postura de Pedra), espinhos, adrenalina, fumaça, gelo de Haku e ressurreição. */
    function damagePlayer(raw:number,attacker?:Enemy,slow=0){
      if(invulnerability>0||defeated||debugState.god)return false;
      if(ex('shield')>0&&shieldReady){shieldReady=false;shieldTimer=14;invulnerability=.25;addRing(player.position,'#7fd3ff',1.1);eventToast='Escudo de Chakra bloqueou o golpe!';return false;}
      if(Math.random()<stats.evasion)return false;
      const hpBefore=hp;
      // Rodada 98: no desafio "não ser acertado" do Might Guy, qualquer golpe que passe das defesas encerra o desafio.
      const youthHit=()=>{if(hp<hpBefore)failYouthNoHit();};queueMicrotask(youthHit);
      hp=Math.max(0,hp-incomingDamage(raw,stats.armor*(ex('stance')>0&&stillTime>.5?1.3:1)));
      invulnerability=.25;timeSinceHit=0;
      if(hp<hpBefore){
        playerMotion.hurt();
        damageNumber(player.position,hpBefore-hp,0,true);
        snapshotTimer=0;
        registerHit(damageFlash,performance.now(),hpBefore-hp,stats.maxHp);
        playHurt(flashStrength(hpBefore-hp,stats.maxHp));
        addRing(player.position,'#ff535a',.8);
      }
      if(slow>0){playerSlow=Math.max(playerSlow,slow);eventToast='Você foi atingido e está lento!';}
      if(attacker&&ex('thorns')>0&&enemyList.includes(attacker))takeDamage(attacker,thornsDamage(ex('thorns'),stats.armor,stats.damage)*damageMultiplier*tune().playerDamage,'#ffd27a',false,0,'Espinhos');
      if(ex('rush')>0)rushTimer=3;
      if(ex('smoke')>0&&Math.random()<ex('smoke')){invulnerability=1.5;eventToast='Fumaça densa: invisível por 1,5 s';}
      if(ex('freezeOnHit')>0&&freezeCd<=0){freezeCd=20;for(const e of enemyList)if(Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<5)freezeTarget(e,3);addRing(player.position,'#9fe7ff',5);eventToast='Espelho de Gelo: inimigos congelados!';}
      if(hp<=0){
        if(revives60<ex('revive60')){revives60++;hp=stats.maxHp*.6;invulnerability=2.5;addRing(player.position,'#b28bff',4);eventToast='Rinne Tensei: você voltou com 60% do HP!';}
        else if(revives35<ex('revive35')){revives35++;hp=stats.maxHp*.35;invulnerability=2.5;addRing(player.position,'#fff195',4);eventToast=heroId==='hidan'&&revives35===1?'Imortalidade de Jashin: você voltou com 35% do HP!':'Você voltou com 35% do HP!';}
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
      for(const e of [...enemyList]){const d=Math.hypot(e.sprite.position.x-center.x,e.sprite.position.z-center.z);if(e===target||d<2.5){e.burn=3*stats.duration;e.burstBurn=false;takeDamage(e,e===target?damage:damage*.5,'#3b1f45',false,0,'Amaterasu');}}
    }
    const bossCombat=createBossCombat({scene,player,height:itemSurface,zone:()=>zone,hidden:()=>hiddenEffects,susanoo,
      hitPlayer:(base,slow,gravity,center)=>{if(!damagePlayer(base*threatNow().damage,undefined,slow)||!gravity||!center)return;const direction=center.clone().sub(player.position).setY(0), distance=direction.length();const step=gravity==='push'?-2:Math.min(2.25,Math.max(0,distance-.7));player.position.addScaledVector(direction.normalize(),step);if(!arena)solids.resolve(player.position);},viewRight:()=>v2,viewForward:()=>v1});
    function spawnEnemy(challenge=false,megaElite=false,guardian=false,forcedId?:string,accountSeal=false,openingMega=!openingMegaSpawned,akatsuki?:AmbushMemberSave){const t=tune(),candidates=megaElite&&!guardian&&!forcedId?HEROES.filter(h=>h.family===h.id&&!hasAllyFamily(h.id)&&!enemyList.some(enemy=>enemy.heroId&&familyOf(enemy.heroId)===h.id)):[],naturalFamily=candidates[Math.floor(Math.random()*candidates.length)]?.id,id=forcedId??(guardian?ZONES[zone-1].guardians[Math.floor(Math.random()*ZONES[zone-1].guardians.length)]:naturalFamily?versionForEncounter(naturalFamily,zone,mission):heroId),angle=Math.random()*Math.PI*2;if(accountSeal)megaElite=true;const swarmRing=!challenge&&!megaElite&&!guardian&&overtimeNow()>0,r=challenge?7:megaElite?12:swarmRing?FINAL_SWARM.spawnRing[0]+Math.random()*(FINAL_SWARM.spawnRing[1]-FINAL_SWARM.spawnRing[0]):zoneElapsed()<SPAWN_RING.openingSeconds?SPAWN_RING.opening[0]+Math.random()*(SPAWN_RING.opening[1]-SPAWN_RING.opening[0]):10+Math.random()*8,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),elite=!megaElite&&!challenge&&(forceElite||Math.random()<eliteSpawnChance(t.eliteRate,ex('eliteSpawn')));
      const tier:EnemyTier=accountSeal?'account':guardian?'mega':megaElite?'mega':elite?'elite':'normal',T=ENEMY_TIERS[tier];const e=megaElite?makeHero(id,Math.max(1,level)):makeSprite(Math.floor(Math.random()*4),elite?1.9:1.55,elite?2.5:2);if(megaElite)e.scale.multiplyScalar(1.4);e.position.set(akatsuki?.x??x,terrainHeight(akatsuki?.x??x,akatsuki?.z??z)+(megaElite?1.6:1),akatsuki?.z??z);if(elite)addOutline(e,'#ffd21f');else if(accountSeal)addOutline(e,'#5ff0ff');else if(megaElite&&!guardian)addOutline(e,'#ff4d6d');scene.add(e);const threat=threatNow();const hpBase=accountSeal?T.hp*t.accountHp:elite?T.hp*t.eliteHp*eliteHpRamp(tier,zoneElapsed()):challenge?30:T.hp;const isMegaEncounter=tier==='mega'&&!guardian&&!akatsuki;
      if(isMegaEncounter)openingMegaSpawned=true;
      const hp=akatsuki?.hp??(guardian?guardianHpNow(threat.hp):isMegaEncounter?megaEliteHp(zoneElapsed(),t.megaHp*t.enemyHp*MISSION_TIER[mission]*zoneDifficulty*(1+.33*shikamaruPlans)*Math.max(.2,1+ex('threat')),Math.random,openingMega):Math.round(hpBase*threat.hp*(tier==='normal'&&!challenge?normalHpFactor(mission):1)));
      const enemy:Enemy={sprite:e,hp,openingMega:isMegaEncounter&&openingMega,speed:megaElite?2.6:elite?3.8:2.8+Math.random()*.8,hitTimer:.2,challenge,megaElite,elite,guardian,heroId:megaElite?id:undefined,tier,account:accountSeal,defense:guardian?guardianDefense(elapsed,false,overtimeNow(),zone,shikamaruPlans):Math.min(.85,T.defense*(tier==='elite'?t.eliteDefense:tier==='mega'&&!guardian?t.megaDefense*(.60+.40*Math.min(1,zoneElapsed()/480)):1)+(threat.armor??0)),dmgMult:guardian?2.2:T.damage*(tier==='elite'?t.eliteDamage:tier==='mega'?t.megaDamage:1)};if(guardian){enemy.summonedAt=elapsed;enemy.summonedOvertime=overtimeNow();enemy.bossDamageScale=guardianAttackMultiplier(elapsed,overtimeNow(),zone);enemy.dmgMult=2.2*enemy.bossDamageScale;enemy.hpMultiplier=guardianHpMultiplier(zoneElapsed());enemy.shikamaruPlans=shikamaruPlans;enemy.guardianZone=zone;}enemy.maxHp=akatsuki?.maxHp??enemy.hp;if(tier==='normal'&&!challenge&&Math.random()<.07+.13*Math.min(1,zoneElapsed()/300))enemy.ranged=Math.floor(Math.random()*enemyWeapons.length);enemy.moveAfter=elapsed+3+Math.random()*5;if(megaElite){enemy.uid=++megaUid;enemy.motionLevel=level;enemy.motion=createPlayerMotion(scene,e,id,false,1.4);}enemyList.push(enemy);if(megaElite&&!accountSeal)bossCombat.attach(enemy,enemy.maxHp,guardian);return enemy;}
    const akatsukiEnemies=new Set<Enemy>();
    function spawnAkatsukiMember(member:AmbushMemberSave){
      const enemy=spawnEnemy(false,true,false,member.id,false,false,member);
      akatsukiEnemies.add(enemy);
      return enemy;
    }
    function startAkatsukiAmbush(){
      if(arena||!zetsuEvent.active||zetsuRise<AKATSUKI_AMBUSH.riseTime*.5||Math.hypot(player.position.x-zetsuEvent.x,player.position.z-zetsuEvent.z)>AKATSUKI_AMBUSH.interact)return false;
      if(enemyList.length+AKATSUKI_MEMBERS.length>FINAL_SWARM.maxEnemies){
        eventToast='Zetsu: abra espaço na horda para enfrentar a Akatsuki.';
        return true;
      }
      zetsuEvent.active=false;zetsuEvent.obj.visible=false;
      const hp=akatsukiAmbushHp(threatNow().hp);
      const ring=trapRing(player.position.x,player.position.z,AKATSUKI_MEMBERS.length,AKATSUKI_AMBUSH.spawnRadius,Math.random()*Math.PI*2);
      AKATSUKI_MEMBERS.forEach((id,index)=>{
        const point=ring[index];
        const {x,z}=solids.freeSpot(THREE.MathUtils.clamp(point.x,-WORLD_LIMIT,WORLD_LIMIT),THREE.MathUtils.clamp(point.z,-WORLD_LIMIT,WORLD_LIMIT));
        spawnAkatsukiMember({id,x,z,hp,maxHp:hp});
      });
      eventToast='Emboscada da Akatsuki! Derrote os '+akatsukiEnemies.size+' shinobis.';
      addRing(zetsuEvent.obj.position,'#a52b36',2);
      snapshotTimer=0;saveRun();
      return true;
    }
    // Guardião (chefe final da zona): 1 por zona. Invocado pelo jogador no Selo do guardião (E).
    let weatherEvent:ActiveWeatherEvent|undefined;
    // Rodada 96: eventos de clima sorteados por zona (planZoneWeather); fora do plano, nada acontece.
    let weatherPlan:WeatherPlan=planZoneWeather(WEATHER_BY_MAP[mapId],0);
    function scheduleWeather(){nextWeatherAt=weatherPlan[0]?.at??Infinity;}
    function startWeather(id:WeatherEventId){
      if(weatherEvent||arena||enemyList.length>=ENEMY_SCALING.maxEnemies)return false;
      const w=WEATHER_EVENTS[id];
      const candidates=w.elites.filter(family=>familyOf(heroId)!==family&&!hasAllyFamily(family)&&!enemyList.some(e=>e.heroId&&familyOf(e.heroId)===family)&&!fallenMegas.some(e=>familyOf(e.candidate.heroId)===family));
      const elite=candidates[Math.floor(Math.random()*candidates.length)];
      if(!elite)return false;
      const enemy=spawnEnemy(false,true,false,versionForEncounter(elite,zone,mission));
      // Rodada 63: com conjuração, o Mega Elite surge à vista (à frente do jogador, dentro da tela) e faz os selos.
      if(w.cast){const spot=solids.freeSpot(THREE.MathUtils.clamp(player.position.x+v1.x*CAST_DISTANCE,-WORLD_LIMIT,WORLD_LIMIT),THREE.MathUtils.clamp(player.position.z+v1.z*CAST_DISTANCE,-WORLD_LIMIT,WORLD_LIMIT));enemy.sprite.position.set(spot.x,standHeight(spot.x,spot.z)+enemy.sprite.scale.y*.46,spot.z);enemy.seen=true;}
      const {x,z}=enemy.sprite.position;
      weatherEvent={id,until:elapsed+WEATHER_EVENT_DURATION+(w.cast?.seconds??0),elite:enemy.heroId!,x,z,openingMega:enemy.openingMega,castEnd:w.cast?elapsed+w.cast.seconds:undefined};
      weather=w.name;applyWeather();eventToast=w.cast?w.cast.line:w.name+' · encontre o Mega Elite';snapshotTimer=0;
      return true;
    }
    function tickWeather(){
      if(weatherEvent){
        const elite=enemyList.find(e=>e.heroId===weatherEvent?.elite);
        if(elapsed>=weatherEvent.until||!elite){weatherEvent=undefined;weather=weatherDef.name;applyWeather();scheduleWeather();snapshotTimer=0;}
      }else if(!arena&&!hagoromoEvent&&weatherPlan.length&&elapsed>=weatherPlan[0].at){
        const next=weatherPlan.shift()!;startWeather(next.id);scheduleWeather();
      }
      zabuzaMistActive=mistHides(weatherEvent,elapsed)&&!!enemyList.find(e=>e.heroId===weatherEvent?.elite);
    }
    function weatherFog(){
      const active=!hagoromoEvent&&weatherEvent&&WEATHER_EVENTS[weatherEvent.id];
      if(!active)return null;
      const distance=camera.position.distanceTo(player.position);
      return new THREE.Fog(active.sky,distance+active.near,distance+active.far);
    }
    function zoneElapsed(){return Math.max(0,elapsed-zoneStart);}
    /** FINAL SWARM: segundos sobrevividos depois que o relógio da zona zerou (0 = relógio ainda correndo; arena não tem swarm). */
    function overtimeNow(){return arena?0:Math.max(0,zoneElapsed()-ZONE_SECONDS);}
    /** 25/11/2026: dano de alvo único da build atual contra um chefe com `defense` (piso de vida dos chefes, src/game/bossScaling.ts). */
    const playerBossDps=(defense:number)=>singleTargetDps({heroId,techniques,skillLevels,growth,stats,defense,affinity:heroNature,sageInfused:stats.sage>0||sageModeActive(),healthShare:hp/stats.maxHp,trained:config.trained,multiplier:damageMultiplier*tune().playerDamage*(1+ex('eliteDamage'))});
    const guardianHpNow=(hp=threatNow().hp)=>bossHpWithFloor(guardianVitality(hp,elapsed,zoneElapsed(),overtimeNow(),zone),playerBossDps(guardianDefense(elapsed,false,overtimeNow(),zone,shikamaruPlans)),BOSS_POWER.guardianSeconds,shikamaruPlans);
    function summonGuardian(){if(guardianSpawned||arena||portal)return null;guardianSpawned=true;const seal=events.find(e=>e.id==='guardian-seal');if(seal)seal.active=false;const g=spawnEnemy(false,true,true);g.seen=true;g.arrivalGuard=1;snapshotTimer=0;if(seal){g.sprite.position.set(seal.x,standHeight(seal.x,seal.z)+g.sprite.scale.y*.46,seal.z);addRing(g.sprite.position,'#ffd07c',2.3);}eventToast='Guardião invocado! '+HERO_BY_ID[g.heroId!].name+' · HP ×'+(g.hpMultiplier??1).toFixed(2)+(shikamaruPlans?' · Plano do Shikamaru '+shikamaruPlans+'/'+GUARDIAN_RULES.shikamaruMaxPlans:'');return g;}
    const gamabuntaSheet=new THREE.TextureLoader().load('/assets/gamabunta-oil-v1.png');
    gamabuntaSheet.colorSpace=THREE.SRGBColorSpace;
    gamabuntaSheet.minFilter=gamabuntaSheet.magFilter=THREE.NearestFilter;
    gamabuntaSheet.generateMipmaps=false;
    runCleanups.push(()=>gamabuntaSheet.dispose());
    const puppetSheets=new Map<string,THREE.Texture>();
    function puppetSheet(path:string){
      let texture=puppetSheets.get(path);
      if(!texture){
        texture=new THREE.TextureLoader().load(path);
        texture.colorSpace=THREE.SRGBColorSpace;
        texture.minFilter=texture.magFilter=THREE.NearestFilter;
        texture.generateMipmaps=false;
        puppetSheets.set(path,texture);
      }
      return texture;
    }
    runCleanups.push(()=>puppetSheets.forEach(texture=>texture.dispose()));
    runCleanups.push(()=>totem?.fixedArt?.dispose());
    /** O Totem mantém o selo de mãos. Os clones usam a locomoção do Naruto Clássico. */
    function spawnTotem(){if(totemSpawned)return null;totemSpawned=true;totemDiscovered=false;totemResult='';totemCloneTimer=1;
      const angle=Math.random()*Math.PI*2,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*TOTEM_RULES.distance,-44,44),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*TOTEM_RULES.distance,-44,44);
      const sprite=makeHero('naruto-genin',10);
      const fixedArt=missionNpcs.create('naruto-genin');
      sprite.material.colorWrite=false;
      fixedArt.root.scale.setScalar(2.25*ACTOR_SCALE*1.25);
      fixedArt.root.position.set(x,standHeight(x,z),z);
      scene.add(fixedArt.root);
      sprite.scale.multiplyScalar(1.5);sprite.position.set(x,terrainHeight(x,z)+1.7,z);scene.add(sprite);totemPos.set(x,0,z);
      const hp=TOTEM_RULES.baseHp*threatNow().hp;totem={sprite,hp,maxHp:hp,speed:0,hitTimer:99,totem:true,fixedArt};enemyList.push(totem);
      totemBar=createTotemBar(scene);totemBar.follow(sprite);totemBar.draw(1,TOTEM_RULES.end-elapsed);
      eventToast=`Naruto Totem apareceu a ${TOTEM_RULES.distance} m! Destrua-o antes de 6:00 para ganhar ${TOTEM_RULES.levels} níveis. Ele invoca clones das sombras sem parar.`;return totem;}
    /** Clone das sombras: nasce perto do Totem e persegue o jogador correndo. */
    function spawnTotemClone(){const angle=Math.random()*Math.PI*2,r=TOTEM_RULES.radiusMin+Math.random()*(TOTEM_RULES.radius-TOTEM_RULES.radiusMin),x=THREE.MathUtils.clamp(totemPos.x+Math.cos(angle)*r,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(totemPos.z+Math.sin(angle)*r,-WORLD_LIMIT,WORLD_LIMIT);
      const sprite=makeHero('naruto-genin',10);sprite.scale.multiplyScalar(.82);sprite.position.set(x,terrainHeight(x,z)+1,z);scene.add(sprite);const hp=TOTEM_RULES.cloneHp*threatNow().hp;
      enemyList.push({sprite,hp,maxHp:hp,speed:TOTEM_RULES.cloneSpeed,hitTimer:.3,clone:true,motionLevel:10,motion:createPlayerMotion(scene,sprite,'naruto-genin',false)});}
    /** Clones somem em fumaça (sem recompensa) quando o totem cai ou expira. */
    function dispelClones(){for(const e of enemyList.filter(e=>e.clone)){disposeEnemySprite(e);enemyList.splice(enemyList.indexOf(e),1);if(!hiddenEffects)addRing(e.sprite.position,'#f2f2f2',.5);}}
    function disposeEnemySprite(e:Enemy){e.motion?.dispose();e.fixedArt?.dispose();scene.remove(e.sprite);e.sprite.material.dispose();for(const child of e.sprite.children)if(child instanceof THREE.Sprite)child.material.dispose();if(e.marker){scene.remove(e.marker);e.marker.geometry.dispose();(e.marker.material as THREE.Material).dispose();e.marker=undefined;}}
    function endTotem(result:'derrotado'|'expirou'){if(!totem)return;const t=totem;totem=null;totemResult=result;const i=enemyList.indexOf(t);if(i>=0)enemyList.splice(i,1);disposeEnemySprite(t);totemBar?.dispose();totemBar=null;dispelClones();
      if(result==='derrotado'){countKill();pendingLevels+=TOTEM_RULES.levels;addRing(t.sprite.position,'#ffb34d',3);playSfx('ultimate');eventToast=`Naruto Totem derrotado! +${TOTEM_RULES.levels} níveis (escolha técnicas e pílulas).`;}
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
    function rescaleEnemyHp(enemy: Enemy, ratio: number) {
      if (enemy.maxHp) {
        const maxHp = capMegaEliteHp(enemy.maxHp * ratio, !!enemy.openingMega);
        ratio = maxHp / enemy.maxHp;
        enemy.maxHp = maxHp;
      }
      enemy.hp *= ratio;
      bossCombat.rescale(enemy, ratio);
    }
    function useShikamaruPlan(){const max=GUARDIAN_RULES.shikamaruMaxPlans;if(shikamaruPlans>=max){eventToast=`Plano do Shikamaru: limite de ${max}/${max} atingido nesta zona`;return false;}shikamaruPlans++;plansUsed++;const ratio=(1+.33*shikamaruPlans)/(1+.33*(shikamaruPlans-1));for(const enemy of enemyList)rescaleEnemyHp(enemy,ratio);const ev=events.find(e=>e.id==='shikamaru');if(ev)ev.uses=shikamaruPlans;for(const e of enemyList)if(e.guardian&&e.guardianZone===zone){e.shikamaruPlans=shikamaruPlans;e.defense=guardianDefense(e.summonedAt??elapsed,false,e.summonedOvertime??overtimeNow(),zone,shikamaruPlans);}eventToast=`Plano do Shikamaru ${shikamaruPlans}/${max}: ${shikamaruPlans*33}% mais dificuldade nesta zona${zone===3?' · Bijū mais forte por plano':''} · ${1+shikamaruPlans} kunais`;return true;}
    const groundModels=createDropModels(scene,260);
    const dropFrustum=new THREE.Frustum(), dropProjection=new THREE.Matrix4(),dropBounds=new THREE.Box3();
    const renderedDrops:Drop[]=[];
    const pickupShadows=createPickupShadows(itemSurface);
    runCleanups.push(pickupShadows.dispose,groundModels.dispose);
    const fallenScoutTexture=new THREE.TextureLoader().load('/assets/shinobi-motion/fallen-scout-v1.png');
    fallenScoutTexture.colorSpace=THREE.SRGBColorSpace;
    fallenScoutTexture.magFilter=THREE.NearestFilter;
    fallenScoutTexture.minFilter=THREE.LinearMipmapLinearFilter;
    const fallenScoutMaterial=new THREE.SpriteMaterial({map:fallenScoutTexture,transparent:true,alphaTest:.18,depthWrite:false});
    runCleanups.push(()=>{fallenScoutTexture.dispose();fallenScoutMaterial.dispose();});
    let activeBody:MapPickup|undefined;
    /** Rodada 73: farol (facho de luz + brilho) de cada pergaminho de recompensa grátis (sealDrop: G, Guardião, desafio). */
    const beacons=new Map<MapPickup,RewardBeacon>();
    const CURSED_SHURIKEN_DAMAGE=.08;
    function spawnPickup(kind:MapPickup['kind'],x:number,z:number){
      ({x,z}=solids.freeSpot(x,z));
      const names={kunai:'Pergaminho',shuriken:'Pergaminho',ryu:'Morro de bolinhos de arroz',sealDrop:'Pergaminho de recompensa grátis',cursedShuriken:'Shuriken Amaldiçoada',ninjaBody:'Corpo de ninja'};
      const mesh=new THREE.Group();
      mesh.position.set(x,itemSurface(x,z),z);
      if(kind==='ninjaBody'){
        const art=new THREE.Sprite(fallenScoutMaterial);
        art.scale.set(1.85,1.23,1);
        art.center.y=.32;
        art.position.y=.035;
        mesh.add(pickupShadows.place(x,z,art.scale.x),art);
      }else{
        const variant=kind==='ryu'||kind==='cursedShuriken'?0:pickupScrollVariant(kind,Math.random());
        const art=groundModels.mesh(kind==='ryu'?'riceMound':kind==='cursedShuriken'?'cursed':kind==='sealDrop'?'freeScroll':'scroll',variant);
        const shadow=pickupShadows.place(x,z,kind==='ryu'?1.6:1.45);
        art.quaternion.copy(shadow.quaternion);
        art.rotateY(x*.71+z*1.07);
        art.position.y=.022;
        art.scale.setScalar(kind==='ryu'?1.4:1.45);
        mesh.add(shadow,art);
      }
      scene.add(mesh);
      pickups.push({id:'pickup-'+pickups.length,kind,name:names[kind],x,z,mesh,active:true});
      // Rodada 73: o pergaminho grátis brilha, tem facho de luz e aparece no minimapa, no Tab e no M desde que cai.
      if(kind==='sealDrop'){const pickup=pickups.at(-1)!;pickup.discovered=true;beacons.set(pickup,createRewardBeacon(scene,x,z,itemSurface,mesh.position.y+.38));}
    }
    function startFieldAmbush(pickup:MapPickup){
      const body=pickup.kind==='ninjaBody';
      if(body&&activeBody){eventToast='Conclua a emboscada ativa antes de investigar outro corpo.';return;}
      // 25/11: o corpo invoca SEMPRE os 10 (antes a vaga até o teto de vivos zerava a emboscada com a horda cheia).
      const count=body?FALLEN_TRAP.enemies:Math.min(Math.round(4*Math.sqrt(MISSION_TIER[mission]))+(zone-1)*2,Math.max(0,threatNow().cap-enemyList.length));
      // Rodada 96: a armadilha do corpo soma +5% de inimigos na partida toda e cerca o jogador com 10 ninjas a 10 m.
      if(body){activeBody=pickup;pickup.mesh.visible=false;runBuffs.enemyCount=(runBuffs.enemyCount??0)+FALLEN_TRAP.enemyCount;refreshStats();}
      else{
        pickup.active=false;scene.remove(pickup.mesh);
        shuriken++;runBuffs.damage=(runBuffs.damage??0)+CURSED_SHURIKEN_DAMAGE;refreshStats();
      }
      const ring=trapRing(player.position.x,player.position.z,count,FALLEN_TRAP.radius,Math.random()*Math.PI*2);
      for(let i=0;i<count;i++){
        // 1 dos 10 ninjas do corpo é elite (forceElite só vale fora do modo desafio).
        const elite=body&&trapIsElite(i);forceElite=elite;const enemy=spawnEnemy(!elite);forceElite=false;enemy.challenge=false;
        if(body){enemy.bodyAmbush=pickup;const spot=ring[i],x=THREE.MathUtils.clamp(spot.x,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(spot.z,-WORLD_LIMIT,WORLD_LIMIT);enemy.sprite.position.set(x,standHeight(x,z)+enemy.sprite.scale.y*.46,z);}
      }
      eventToast=body?`Armadilha! +5% de inimigos na partida · derrote os ${count} ninjas em volta (1 elite) para ganhar 1 item.`
        :`Shuriken Amaldiçoada · +8% de dano total · emboscada de ${count} ninjas!`;
      playSfx('pickup');snapshotTimer=0;
    }
    function scatterPickups(){
      const count=Math.round((36+zone*8)*tune().mapPickups);
      for(let i=0;i<count;i++){
        const kind=i%5<3?'ryu':i%5===3?'kunai':'shuriken';
        const angle=Math.random()*Math.PI*2,radius=i<6?9+Math.random()*12:16+Math.random()*55;
        spawnPickup(kind,Math.cos(angle)*radius,Math.sin(angle)*radius);
      }
      if(!testRun)for(const kind of ['cursedShuriken','ninjaBody'] as const){
        const angle=Math.random()*Math.PI*2,radius=18+Math.random()*44;
        spawnPickup(kind,Math.cos(angle)*radius,Math.sin(angle)*radius);
      }
    }
    scatterPickups();
    const portalTitle=(kind:PortalKind)=>kind==='zone'?'Portal da próxima zona':kind==='arena'?'Portal para a Bijuu':'Portal de saída';
    function openPortal(kind:PortalKind,x:number,z:number,restoring=false){
      if(!restoring&&!arena)({x,z}=solids.freeSpot(x,z,1.5));
      x=THREE.MathUtils.clamp(x,-WORLD_LIMIT+1.5,WORLD_LIMIT-1.5);
      z=THREE.MathUtils.clamp(z,-WORLD_LIMIT+1.5,WORLD_LIMIT-1.5);
      const mesh=new THREE.Group(),color=kind==='exit'?'#ffcf76':kind==='arena'?'#cc84ff':'#73e8de';
      const rim=new THREE.TorusGeometry(1.25,.1,8,36),paint=new THREE.MeshBasicMaterial({color,fog:false});
      const sideArc=new THREE.Mesh(rim.clone(),paint);
      sideArc.rotation.y=Math.PI/2;
      mesh.add(new THREE.Mesh(rim,paint),sideArc,
        new THREE.Mesh(new THREE.CircleGeometry(1.18,36),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false,fog:false})));
      mesh.position.set(x,itemSurface(x,z)+1.25,z);scene.add(mesh);portal={kind,x,z,mesh};snapshotTimer=0;
    }
    function clearZone(){
      hagoromoGround.clear();
      for(const clone of shadowClones)disposeShadowClone(clone);
      shadowClones.length=0;
      enemyShots.length=0;
      for(const enemy of enemyList){bossCombat.dispose(enemy);disposeEnemySprite(enemy);}
      enemyList.length=0;akatsukiEnemies.clear();
      drops.clear();
      for(const p of pickups)scene.remove(p.mesh);pickups.length=0;activeBody=undefined;
      for(const shot of shots){scene.remove(shot.mesh);disposeObject(shot.mesh);}shots.length=0;
      for(const fx of visuals){scene.remove(fx.object);disposeObject(fx.object);}visuals.length=0;
      pendingHits.length=0;particles.clear();susanoo.clear();totem=null;totemBar?.dispose();totemBar=null;totemDiscovered=false;
      pendingSeals.length=0;while(fallenMegas.length)removeFallenMega(fallenMegas[0]);lockedTarget=null;currentPing=null;clearRoute();exploredCells.clear();
      defenseAltar=null;defenseActive=false;defenseTime=0;defenseDone=false;altarCircle.visible=false;altarProgress.clear();
      ebisuDeals=null;irukaLesson=null;irukaScroll=null;npcEvent=null;
    }
    function openBijuuArena(){
      arena=true;villageActive=false;traversal.reset();weatherEvent=undefined;weather='Arena da Bijuu';
      if(civicScene)civicScene.root.visible=false;
      if(legacyMemorial)legacyMemorial.visible=false;
      boundary.root.visible=false;
      scene.background=new THREE.Color('#282441');scene.fog=new THREE.Fog('#282441',15,55);
      for(const object of decor)object.visible=false;
      for(const event of events){event.active=false;event.discovered=false;event.obj.visible=false;}
      teuchi.visible=false;
    }
    function spawnBijuu(id=rollBijuu().id,saved?:Omit<SavedBijuu,'id'>,arrivalOvertime=0){
      const sprite=makeHero(id);sprite.scale.set(BIJUU_SIZE,BIJUU_SIZE,1);
      sprite.material.fog=false;
      const point=bijuuSpawnPoint(player.position.x,player.position.z,yaw);
      const x=THREE.MathUtils.clamp(saved?.x??point.x,-WORLD_LIMIT,WORLD_LIMIT);
      const z=THREE.MathUtils.clamp(saved?.z??point.z,-WORLD_LIMIT,WORLD_LIMIT);
      sprite.position.set(x,itemSurface(x,z)+BIJUU_SIZE*.46,z);scene.add(sprite);
      const overtime=saved?.overtime??arrivalOvertime;
      const curse=zoneCurse(zoneDifficulty,bijuuPlans(shikamaruPlans),ex('threat'));
      const threat=zoneThreat(mission,ZONE_SECONDS+overtime,curse,overtime,ex('enemyCount'),t=>tuneThreat(t,tune()));
      const maxHp=saved?.maxHp??bossHpWithFloor(bijuuVitality(threat.hp,elapsed,overtime),playerBossDps(bijuuDefense(elapsed,overtime,bijuuPlans(shikamaruPlans))),BOSS_POWER.bijuuSeconds,bijuuPlans(shikamaruPlans));
      const bossDamageScale=guardianAttackMultiplier(elapsed,overtime,3,true)*threat.damage/Math.max(.01,threatNow().damage);
      const beast:Enemy={heroId:id,bijuu:true,guardian:true,megaElite:true,hp:saved?.hp??maxHp,maxHp,sprite,speed:1.7,hitTimer:.5,dmgMult:2.1*bossDamageScale,bossDamageScale,summonedOvertime:overtime,defense:bijuuDefense(elapsed,overtime,bijuuPlans(shikamaruPlans)),uid:++megaUid,seen:true};
      enemyList.push(beast);bossCombat.attach(beast,maxHp,true);playBijuu();
      // Rodada 58: poeira de chakra no ponto onde a bijū surge (some no modo H).
      if(!hiddenEffects)for(const [r,c] of [[2.2,'#d8c6ff'],[3.6,'#9f7bff']] as const)addRing(sprite.position,c,r);
      return beast;
    }
    function enterPortal(){
      if(!portal||hagoromoEvent)return;
      const {kind,mesh}=portal;portal=null;scene.remove(mesh);disposeObject(mesh);keys.clear();
      if(kind==='exit'){victory=true;snapshotTimer=0;eventToast='Missão concluída!';return;}
      const arrivalOvertime=overtimeNow();
      for (const drop of drops.all()) {
        const distance = Math.hypot(drop.mesh.position.x-player.position.x,drop.mesh.position.z-player.position.z);
        if (xpCollectedAtPortal(drop.type,drop.magnet,distance,stats.pickup)) {
          xp+=collectedXp(drop.value,stats.xpGain,tune().xpGain);
        }
      }
      traversal.reset();clearZone();zoneStart=elapsed;weatherPlan=planZoneWeather(WEATHER_BY_MAP[mapId],zoneStart);scheduleWeather();hagoromoBossDown=false;youthOffer=null;
      walkingFloor=standHeight(0,0);player.position.set(0,walkingFloor+player.scale.y*.5,0);revealAround(0,0);
      invulnerability=2;
      if(kind==='arena'){
        openBijuuArena();
        const beast=spawnBijuu(undefined,undefined,arrivalOvertime);eventToast=BIJUU_BY_ID[beast.heroId!].name+' · Fase 1/3';
      }else{
        zone++;guardianSpawned=false;shikamaruPlans=0;zoneDifficulty=ZONE_DIFFICULTY[zone]??1;xpMultiplier=1;lootMultiplier=1;
        spawnTimer=1;spawnBudget=0;ambushTimer=AMBUSH_RULES.first;megaSchedule=rollMegaSchedule();megaElitesSpawned=0;accountEncounters=0;nextAccountAt=elapsed+20;totemSpawned=false;
        weatherEvent=undefined;weather=weatherDef.name;scheduleWeather();applyWeather();
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
    /** Rodada 47/49/50 (pedido do usuário: "pegar itens no chão, precisa sumir a opção de pegar" + "pergaminhos devem aparecer o E"
 * + Rodada 50 "os bolinhos de arroz você colocou para passar em cima e pegar automático, retire isso") —
 * coleta AO PISAR, sem "E": apenas o drop do mega elite (sealDrop). Rodada 50: morro de arroz (Ryu) agora também pede E.
 * Pergaminhos (kunai/shuriken) e emboscadas (ninjaBody/cursedShuriken) pedem E: são ações deliberadas (pago em Ryu / gatilho de risco), não coleta passiva. */
function collectPickup(pickup:MapPickup):boolean{let ryuGain=0;if(pickup.kind==='kunai'||pickup.kind==='shuriken'){const cost=kunaiPrice();if(runMoney<cost){eventToast='São necessários '+compactNumber(cost)+' Ryu para abrir esta recompensa.';return false;}runMoney-=cost;ryuSpent+=cost;paidWeapons++;}pickup.active=false;scene.remove(pickup.mesh);if(pickup.kind==='kunai'||pickup.kind==='shuriken'){if(pickup.kind==='kunai')kunai++;else shuriken++;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}else if(pickup.kind==='sealDrop'){choiceLevel=0;choiceData=rollMegaLoot();eventToast=`Sorte ${luck}: escolha o item deixado pelo mega elite`;}else{ryuGain=Math.round((14+zone*6)*MISSION_TIER[mission]*(1+Math.min(1,stats.luck*.01)));runMoney+=ryuGain;globalMagnetUntil=pickupClock+10;const rice=Math.random()<.5;if(rice)addDrop(new THREE.Vector3(pickup.x,0,pickup.z),'onigiri',RAMEN_DROP.heal);eventToast=`${pickup.name} · +${compactNumber(ryuGain)} Ryu · ímã 10 s${rice?' · bolinho de cura':''}`;}if(pickup.kind!=='sealDrop'&&pickup.kind!=='ryu')eventToast=`${pickup.name} coletado`;playSfx('pickup');return true;}
function interact(){if(hagoromoEvent){if(hagoromoEvent.completed)finishHagoromo();return;}const fallen=closestFallenMega();if(fallen){removeFallenMega(fallen);keys.clear();startSeal(fallen.candidate);snapshotTimer=0;return;}let bestPickup:MapPickup|undefined,bestDistance=2;for(const pickup of pickups){if(!pickup.active||pickup===activeBody||(pickup.kind!=='cursedShuriken'&&pickup.kind!=='ninjaBody'&&pickup.kind!=='kunai'&&pickup.kind!=='shuriken'&&pickup.kind!=='ryu'))continue;const d=Math.hypot(pickup.x-player.position.x,pickup.z-player.position.z);if(d<bestDistance){bestDistance=d;bestPickup=pickup;}}if(!bestPickup&&portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<2.2){const pt=portal;const left=pickups.filter(p=>p.active&&(p.kind==='sealDrop'||p.kind==='kunai'||p.kind==='shuriken')&&Math.hypot(p.x-pt.x,p.z-pt.z)<6).length;if(left&&elapsed-portalWarnedAt>4){portalWarnedAt=elapsed;eventToast=`Ainda há ${left} pergaminho${left>1?'s':''} perto do portal. Recolha com E antes ou aperte E de novo para entrar no portal.`;return;}enterPortal();return;}if(arena&&!bestPickup)return;if(bestPickup){if(bestPickup.kind==='ryu'||bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){collectPickup(bestPickup);return;}startFieldAmbush(bestPickup);return;}const event=events.filter(e=>e.active).sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0];if(!event||Math.hypot(event.x-player.position.x,event.z-player.position.z)>3.6)return;if(event===zetsuEvent){startAkatsukiAmbush();return;}if(event.id==='shikamaru'){useShikamaruPlan();return;}if(event.id==='guardian-seal'){summonGuardian();return;}if(event.id==='orochimaru'){event.active=false;zoneDifficulty*=1.2;xpMultiplier*=1.25;lootMultiplier*=1.25;eventToast='Maldição de Orochimaru: +20% dificuldade · +25% XP e saque';return;}if(event.id==='arsenal'){openKakashi(event);return;}if(event.id==='ebisu'){openEbisu(event);return;}if(event.id==='iruka'){openIruka(event);return;}if(event.id==='youth'){openYouth(event);return;}if(event.id==='sapos-sabios'){openSages();return;}if(event===ichiraku){openIchiraku();return;}if(event.id==='trader'){showMerchant();return;}if(event.id==='slot'){openRoulette();return;}if(event.altarTier!==undefined){eventToast=event.name+' · fique dentro do círculo para ativar o altar (sem E)';return;}
    }
    function addDrop(position:THREE.Vector3,type:Drop['type'],value:number,name=''){
      const mesh=new THREE.Object3D();
      restDrop(mesh,position.x+(Math.random()-.5)*.7,position.z+(Math.random()-.5)*.7,itemSurface,Math.random()*Math.PI*2);
      mesh.scale.setScalar(monsterDropScale(type,value,currentSettings().discreetDrops));
      mesh.userData.baseScale=mesh.scale.y;
      drops.add({mesh,type,value,name,born:pickupClock,magnet:false,speed:0});
    }
    function pullDrop(drop:Drop,globalPull=false){
      drops.startPull(drop);
      drop.magnet=true;
      drop.speed=DROP_RULES.magnetSpeed*.4;
      drop.mesh.userData.globalPull=globalPull;
    }
    function creditDrop(drop:Drop){
      if(drop.type==='xp')xp+=collectedXp(drop.value,stats.xpGain,tune().xpGain);
      if(drop.type==='ryu')runMoney+=Math.round(drop.value*stats.moneyGain*tune().moneyGain);
      if(drop.type==='chakra')chakra=Math.min(100,chakra+drop.value);
      if(drop.type==='onigiri')hp=Math.min(stats.maxHp,hp+stats.maxHp*drop.value);
    }
    function removeEnemy(enemy:Enemy){const i=enemyList.indexOf(enemy);if(i<0)return;
      if(akatsukiEnemies.delete(enemy)){
        const {x,z}=enemy.sprite.position;
        enemyList.splice(i,1);disposeEnemySprite(enemy);bossCombat.dispose(enemy);countKill();
        if(akatsukiEnemies.size){
          eventToast='Emboscada da Akatsuki · '+akatsukiEnemies.size+' shinobis restantes';
        }else{
          for(const point of trapRing(x,z,AKATSUKI_AMBUSH.rewards,2.8)){
            const spot=solids.freeSpot(THREE.MathUtils.clamp(point.x,-WORLD_LIMIT,WORLD_LIMIT),THREE.MathUtils.clamp(point.z,-WORLD_LIMIT,WORLD_LIMIT));
            spawnPickup('sealDrop',spot.x,spot.z);
          }
          eventToast='Akatsuki derrotada! Três pergaminhos grátis no chão.';
          playSfx('pickup');
        }
        snapshotTimer=0;saveRun();
        return;
      }
      // Naruto Totem e clones: recompensas próprias (2 níveis / só XP), nunca selamento nem saque de mega elite.
      if(enemy.totem){endTotem('derrotado');return;}
      if(enemy.bijuu){defeatedBijuu=BIJUU_BY_ID[enemy.heroId!].name;enemyList.splice(i,1);bossCombat.dispose(enemy);disposeEnemySprite(enemy);countKill();bijuuReward=bijuuLamens(MISSION_TIER[mission],plansUsed);openPortal('exit',enemy.sprite.position.x,enemy.sprite.position.z);eventToast=defeatedBijuu+' derrotada · +'+bijuuReward+' Lamens no portal de saída';saveRun();return;}
      if(enemy.clone){const at=enemy.sprite.position.clone();enemyList.splice(i,1);disposeEnemySprite(enemy);countKill();addDrop(at,'xp',Math.round(TOTEM_RULES.cloneXp*xpMultiplier*ENEMY_XP_MULTIPLIER));if(!hiddenEffects)addRing(at,'#f2f2f2',.45);return;}queueDeathBurst(enemy);const defeatedAt=enemy.sprite.position.clone();disposeEnemySprite(enemy);enemyList.splice(i,1);bossCombat.dispose(enemy);countKill();if(ex('killHeal')>0&&!defeated&&Math.random()<ex('killHeal'))hp=Math.min(stats.maxHp,hp+stats.maxHp*.02);if(enemy.account){const pending={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready' as const,account:true};/* Rodada 55: o Shinobi para selar também cai e fica deitado (halo ciano) até o E dentro de 10 m. */fallenMegas.push({candidate:pending,body:layFallenShinobi(pending.heroId,defeatedAt.x,defeatedAt.z,true,enemy.motionLevel??level)});eventToast='Shinobi para selar derrotado · aproxime-se do corpo e aperte E para selar e DESBLOQUEAR '+pending.target;return;}if(enemy.megaElite&&!enemy.guardian&&!enemy.hagoromo&&!enemy.youth){const pending={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready' as const};fallenMegas.push({candidate:pending,body:layFallenShinobi(pending.heroId,defeatedAt.x,defeatedAt.z,false,enemy.motionLevel??level)});eventToast='Mega Elite derrotado · aproxime-se do corpo e aperte E';}for(const id of allies)gainAffinity(id,AFFINITY_RULES.perKill);if(enemy.guardian){hagoromoBossDown=true;const plans=Math.min(GUARDIAN_RULES.shikamaruMaxPlans,enemy.shikamaruPlans??0);for(let n=0;n<1+plans;n++){const angle=Math.PI/2+n*Math.PI*2/(1+plans);spawnPickup('sealDrop',defeatedAt.x+Math.cos(angle)*3.4,defeatedAt.z+Math.sin(angle)*3.4);}openPortal(zone===3?'arena':'zone',defeatedAt.x,defeatedAt.z);eventToast='Portal aberto! Guardião derrotado. '+(1+plans)+' kunai'+(plans?'s grátis no chão (Plano do Shikamaru +'+plans+').':' grátis no chão.');}if(enemy.bodyAmbush&&enemy.bodyAmbush===activeBody&&!enemyList.some(e=>e.bodyAmbush===activeBody)){activeBody.active=false;scene.remove(activeBody.mesh);activeBody=undefined;spawnPickup('sealDrop',defeatedAt.x,defeatedAt.z);eventToast='Emboscada concluída! Pegue o pergaminho de recompensa (1 item grátis).';saveRun();}const t=tune(),tierKey:EnemyTier=enemy.guardian?'mega':enemy.tier??'normal',boosted=tierKey!=='normal',loot=lootScale(tierKey,enemy.maxHp??0,ENEMY_TIERS.normal.hp*threatNow().hp,MISSION_TIER[mission])*(tierKey==='elite'?t.eliteLoot:tierKey==='mega'?t.megaLoot:1),pieces=tierKey==='mega'?3:1;addDrop(defeatedAt,'xp',xpDropValue(xpLoot(loot,MISSION_TIER[mission]),xpMultiplier,elapsed));if(Math.random()<Math.min(RAMEN_DROP.chance,dropChance(RAMEN_DROP.chance,t.ramenDrop)))addDrop(defeatedAt,'onigiri',RAMEN_DROP.heal*t.ramenHeal);if(boosted||Math.random()<dropChance(BASE_LOOT.ryuChance,t.ryuDrop))for(let n=0;n<pieces;n++)addDrop(defeatedAt,'ryu',Math.max(1,Math.round(BASE_LOOT.ryu*lootMultiplier*loot/pieces)));if(boosted||Math.random()<dropChance(BASE_LOOT.chakraChance,t.chakraDrop))for(let n=0;n<(tierKey==='mega'?2:1);n++)addDrop(defeatedAt,'chakra',Math.round(BASE_LOOT.chakra*Math.sqrt(loot)*t.chakraGain));
      // SEM drop de item por abate (pedido do usuário, 06/11/2026): itens só por kunai/shuriken/eventos com interação.
      // Antes: 1,8% por abate (×Sorte) virava pendingItemRewards ao ser puxado pelo ímã — com emboscadas e horda grande, chovia item sem interação.
      playSfx('impact');}
    function damageNumber(position:THREE.Vector3,amount:number,tier=0,received=false){
      if(hiddenEffects||!currentSettings().damageNumbers||(!received&&numbers.length>300)||amount<=0||(!received&&amount<.5))return;
      const sprite=damageNumbers.spawn(amount,tier,received);
      sprite.position.set(position.x+(received?0:(Math.random()-.5)*.5),position.y+(received?1.1:1.5),position.z);
      numbers.push({sprite,life:.8});
    }
    function takeDamage(enemy:Enemy,damage:number,color:string,fromAlly=false,tier=0,name='Status'){if(!enemyList.includes(enemy)||enemy.arrivalGuard||enemy.boss?.arrival!==undefined)return;if(enemy.defense)damage*=1-enemy.defense;if(enemy.account&&damage>=1)damage=Math.max(damage,(enemy.maxHp||1)*.10);const dealt=Math.min(enemy.hp,damage);if(fromAlly)allyDamage+=dealt;else{totalDamage+=dealt;skillDamage[name]=(skillDamage[name]||0)+dealt;if(ex('lifesteal')>0&&!defeated)hp=Math.min(stats.maxHp,hp+dealt*ex('lifesteal'));}enemy.hp-=damage;
      // Lâmina do Carrasco: inimigos comuns abaixo de 8% (+4 pontos por cópia extra) morrem na hora.
      const executeAt=ex('execute')>0?.04*(ex('execute')/.08+1):0;if(executeAt>0&&enemy.hp>0&&!enemy.megaElite&&!enemy.guardian&&!enemy.totem&&enemy.hp<(enemy.maxHp||0)*executeAt)enemy.hp=0;damageNumber(enemy.sprite.position,damage,tier);if(enemy.hp<=0)removeEnemy(enemy);else if(!hiddenEffects){enemy.sprite.material.color.set(color);}}
    /** Rodada 103: Resfriado (2 acúmulos ou molhado congelam). */
    function chillEnemy(enemy:Enemy,stacks:number){if(addChill(enemy,stacks)&&!hiddenEffects)addRing(enemy.sprite.position,'#9fe7ff',1.1);}
    const near=(at:THREE.Vector3,radius:number,skip?:Enemy)=>enemyList.filter(e=>e!==skip&&!e.totem&&Math.hypot(e.sprite.position.x-at.x,e.sprite.position.z-at.z)<radius);
    /** Rodada 103: Quebra-Gelo e reações elementais do golpe. */
    function statusReactions(enemy:Enemy,t:Technique,damage:number,shatter:boolean){
      if(!enemyList.includes(enemy))return;
      if(shatter&&ex('shatter')>0){enemy.control=undefined;enemy.controlTime=0;for(const e of near(enemy.sprite.position,STATUS_RULES.shatter.radius,enemy))chillEnemy(e,1);if(!hiddenEffects)addRing(enemy.sprite.position,'#d8f6ff',STATUS_RULES.shatter.radius);}
      for(const reaction of reactionsFor(enemy,[t.element,t.secondaryElement])){
        if(reaction==='wet')enemy.wet=STATUS_RULES.wet.seconds;
        else if(reaction==='electro'){enemy.wet=0;const {targets,radius,share}=STATUS_RULES.electro;for(const e of near(enemy.sprite.position,radius,enemy).slice(0,targets))takeDamage(e,damage*share,'#9fd8ff',false,0,t.name);if(!hiddenEffects)addRing(enemy.sprite.position,'#9fd8ff',radius*.5);}
        else if(reaction==='scorch'){for(const e of near(enemy.sprite.position,STATUS_RULES.scorch.radius,enemy).slice(0,STATUS_RULES.scorch.targets))e.burn=Math.max(e.burn??0,enemy.burn??0);}
      }
    }
    /** Rodada 103: explosões na morte (Esfera Katon / Espelho de Gelo de Haku), resolvidas no quadro seguinte. */
    const deathBursts:{x:number;z:number;kind:'fire'|'ice'}[]=[];
    function queueDeathBurst(enemy:Enemy){const kind=deathBurstKind(enemy,ex('fireBurst'),ex('iceBurst'),Math.random());if(kind)deathBursts.push({x:enemy.sprite.position.x,z:enemy.sprite.position.z,kind});}
    function flushDeathBursts(){
      const D=STATUS_RULES.deathBurst;
      for(const b of deathBursts.splice(0,D.perFrame)){
        const at=new THREE.Vector3(b.x,0,b.z),fire=b.kind==='fire';
        for(const e of near(at,fire?D.fireRadius:D.iceRadius)){
          takeDamage(e,stats.damage*(fire?D.fireDamage*(1+ex('statusDamage'))*elementMultiplier(stats.extra,'Fogo'):D.iceDamage*elementMultiplier(stats.extra,'Gelo')),fire?'#ff9b46':'#9fe7ff',false,0,fire?'Esfera Katon':'Espelho de Gelo de Haku');
          if(!enemyList.includes(e))continue;
          if(fire){if(!((e.burn??0)>0))e.burstBurn=true;e.burn=Math.max(e.burn??0,2*stats.duration);}else chillEnemy(e,1);
        }
        if(!hiddenEffects)addRing(at.setY(terrainHeight(b.x,b.z)+.1),fire?'#ff9b46':'#9fe7ff',fire?D.fireRadius:D.iceRadius);
      }
    }
    /** Bônus condicionais do jogador, avaliados no momento do impacto. */
    function conditionalDamageBonus(enemy:Enemy){
      let bonus=1;
      if(!enemy.account&&(enemy.elite||enemy.megaElite||enemy.guardian||enemy.bijuu))bonus*=1+ex('eliteDamage');
      if((enemy.controlTime||0)>0||(enemy.slow||0)>0)bonus*=1+ex('controlledDamage');
      bonus*=1+Math.min(.3,damageStatusCount(enemy)*ex('statusStack'));
      bonus*=1+ex('lowHpDamage')*Math.min(1,Math.max(0,(1-hp/stats.maxHp)/.75));
      bonus*=1+Math.min(ex('noHitDamage'),timeSinceHit*.04);
      bonus*=1+Math.min(.3,Math.floor(kills/100)*ex('killDamage'));
      if(ex('bigCrit')>0&&Math.random()<ex('bigCrit'))bonus*=8;
      // Rodada 103: congelado +25% (Quebra-Gelo +50%) e o golpe que acorda +60%.
      bonus*=statusDamageMultiplier(enemy,ex('shatter'));
      return bonus;
    }
    function hit(enemy:Enemy,t:Technique,g:SkillGrowth,origin:THREE.Vector3,ally=false,effectLevel=ally||t.ultimate?1:(skillLevels[t.name]||1)){
      if(!enemyList.includes(enemy))return;
      const critical=techniqueCritical(t,effectLevel);
      const crit=rollCritical(stats.crit+critical.chance,stats.critDamage+critical.damage);
      const sageInfused=!ally&&(stats.sage>0||sageModeActive());
      const hitDamage=techniqueHitDamage(t,g,stats,{ally,affinity:heroNature,sageInfused,trained:config.trained?.includes(t.name)});
      const passive=ally?1:techniquePassiveMultiplier(heroId,t,hp/stats.maxHp,sageInfused);
      const damage=hitDamage*crit.multiplier*passive*(ally?.65*stats.allyDamage:damageMultiplier*tune().playerDamage*conditionalDamageBonus(enemy));
      if(!ally)toolHitHooks(enemy,damage,crit.tier>0);
      const frozenBefore=isFrozen(enemy),poisonBefore=enemy.poison;
      if(enemy.control==='Dormir')enemy.controlTime=0;
      if(t.gravity&&!enemy.bijuu&&!enemy.totem){
        const delta=origin.clone().sub(enemy.sprite.position).setY(0),distance=delta.length();
        const step=t.gravity==='push'?-2:Math.min(3,Math.max(0,distance-(t.gravity==='core'?.28:.82)));
        enemy.sprite.position.addScaledVector(delta.normalize(),step*(enemy.guardian?.4:1));
      }
      const status=t.status??(stats.status>0?'Lentidão':undefined);if(status&&Math.random()<techniqueProc(t.status?t.statusChance:0,effectLevel,stats.status)){const duration=(status==='Lentidão'?1.8:.65)*stats.duration*(1+g.duration);if(status==='Empurrar'){const away=enemy.sprite.position.clone().sub(origin);away.y=0;enemy.sprite.position.addScaledVector(away.normalize(),1.4);}else if(status==='Congelar')chillEnemy(enemy,STATUS_RULES.chill.techniqueStacks);else{enemy.control=status;enemy.controlTime=duration*(status==='Lentidão'?1:controlResist(enemy));if(status==='Lentidão')enemy.slow=duration;}}
      if(t.secondaryStatus&&Math.random()<techniqueProc(t.secondaryStatusChance??0,effectLevel,stats.status)){
        if(t.secondaryStatus==='Lentidão')enemy.slow=Math.max(enemy.slow??0,1.8*stats.duration*(1+g.duration));
        else if(t.secondaryStatus==='Empurrar')enemy.sprite.position.addScaledVector(enemy.sprite.position.clone().sub(origin).setY(0).normalize(),1.4);
        else if(t.secondaryStatus==='Congelar')chillEnemy(enemy,1);
        else if(!enemy.controlTime){enemy.control=t.secondaryStatus;enemy.controlTime=.65*stats.duration*(1+g.duration)*controlResist(enemy);}
      }
      if(stats.poison>0)enemy.poison={remaining:3*stats.duration*(1+g.duration),dps:damage*stats.poison*(1+ex('statusDamage'))/3};if(t.burn&&Math.random()<techniqueProc(BURN_CHANCE,effectLevel,stats.status)){enemy.burn=Math.max(enemy.burn??0,2*stats.duration*(1+g.duration));enemy.burstBurn=false;}
      if(t.poison&&Math.random()<techniqueProc(POISON_CHANCE,effectLevel,stats.status)){const duration=3*stats.duration*(1+g.duration);enemy.poison={remaining:duration,dps:Math.max(enemy.poison?.dps??0,damage*.45*(1+ex('statusDamage'))/duration)};}
      // Gatilhos por acerto dos itens (só técnicas do jogador).
      if(!ally){
        if(Math.random()<ex('burnChance')){enemy.burn=2*stats.duration;enemy.burstBurn=false;}
        if(Math.random()<ex('poisonChance'))enemy.poison={remaining:3*stats.duration,dps:damage*.35*(1+ex('statusDamage'))/3};
        if(Math.random()<ex('sleepChance')){enemy.control='Dormir';enemy.controlTime=2*stats.duration*controlResist(enemy);}
        if(Math.random()<ex('rootChance')){enemy.control='Paralisar';enemy.controlTime=1.2*stats.duration*controlResist(enemy);}
        if(Math.random()<ex('chillChance'))chillEnemy(enemy,1);
      }
      // Rodada 103: acúmulos de veneno, Quebra-Gelo e reações (molhado, eletrocutar, espalhar queimadura).
      if(enemy.poison&&enemy.poison!==poisonBefore)addPoisonStack(enemy);
      statusReactions(enemy,t,damage,frozenBefore&&!ally);
      // Impacto por natureza em partículas (limite por quadro dentro do particleFx; sem alocar malha por acerto).
      if(!hiddenEffects)particles.impact(t,enemy.sprite.position);
      takeDamage(enemy,damage,t.color,ally,crit.tier,t.name);
      // Linha Senjutsu (modo sábio): Ninjutsu infundido com Sábio tem chance de um golpe extra de 1,5× o dano deste acerto.
      if(!ally&&hasSenjutsu(t,sageInfused)&&enemyList.includes(enemy)&&Math.random()<(senjutsuOverride??techniqueProc(SENJUTSU.chance,effectLevel))){senjutsuProcs++;takeDamage(enemy,damage*SENJUTSU.multiplier,SENJUTSU.color,false,crit.tier,t.name);}
    }
    /** Setup (buff puro): só ativa com inimigo a até 9 m; sem acúmulo, reativar renova a duração. Não usa velocidade de ataque nem velocidade de projétil. */
    function activateSetup(t:Technique,g:SkillGrowth){
      if(!enemyList.some(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<=t.range))return false;
      const s=setupNumbers(t,g),current=activeSetups.find(a=>a.name===t.name);
      if(current&&!s.stack){current.remaining=s.duration;current.duration=s.duration;current.bonuses=s.bonuses;}
      else activeSetups.push({name:t.name,remaining:s.duration,duration:s.duration,bonuses:s.bonuses,sage:s.sage});
      refreshStats();playerMotion.attack(false,undefined,false,undefined,true);addRing(player.position,t.color,1);addRing(player.position,t.color,.6);if(!hiddenEffects)particles.aura(t,player.position,true);playTechniqueSound(t,false,heroId);return true;
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
    function showPuppet(origin:THREE.Vector3,target:THREE.Vector3,asset=KUROARI_ART){
      const effect=createKuroari(puppetSheet(asset),origin,target,v2);
      scene.add(effect.group);effect.group.visible=!hiddenEffects;
      let age=0;
      visuals.push({object:effect.group,life:KUROARI_TIME,tick:dt=>effect.tick(age+=dt)});
    }
    /** Selos de mão (docs/01): a sequência sobe acima de quem lança, um selo a cada 0,1 s, no máximo a cada 2,5 s por personagem. */
    const lastSeal=new Map<string,number>();
    function showHandSeals(t:Technique,at:THREE.Vector3,casterId:string){
      if(hiddenEffects||!sealDue(elapsed,lastSeal.get(casterId),t.ultimate))return;
      const seals=sealSequence(t);if(!seals.length)return;
      lastSeal.set(casterId,elapsed);
      seals.forEach((seal,k)=>pendingHits.push({time:k*SEAL_RULES.step,run:()=>{if(hiddenEffects)return;const label=damageNumbers.spawnText(sealLabel(seal),'#ffe29a');label.position.set(at.x,at.y+2.6,at.z);numbers.push({sprite:label,life:.6});}}));
    }
    function castTechnique(t:Technique,casterPosition:THREE.Vector3,g:SkillGrowth,ally=false,instant=false,allyMotion?:ReturnType<typeof createPlayerMotion>,part=false,casterId=heroId,effectLevel?:number):boolean{
      const merge=!part&&merges.get(t.name);
      if(merge&&merge.kind==='combine'){
        const sources=merge.names.map(name=>techniques.find(tech=>tech.name===name));
        const extra=sources[0]&&sources[1]?combineBonus(sources[0],sources[1]):undefined;
        const casts=merge.names.map((name,index)=>{const source=sources[index];const base=growth[name]??NO_GROWTH;return source&&extra&&castTechnique(combinedPart(source,extra),casterPosition,{damage:g.damage+base.damage,area:g.area+base.area,haste:g.haste+base.haste,duration:g.duration+base.duration},ally,instant,allyMotion,true,casterId,skillLevels[t.name]||1);});
        return casts.some(Boolean);
      }
      if(t.setup)return ally?false:activateSetup(t,g);
      // Modo Sábio: taijutsu corpo a corpo do jogador vira golpe em área ao redor (raio ×1,8, escala com área).
      const sageArea=!ally&&sageModeActive()&&t.school==='Taijutsu'&&t.shape==='Corpo a corpo';
      const range=ATTACK_SCALE*t.range*(sageArea?1.8:1)*(1+Math.min(1,(level-1)*.005))*Math.sqrt(stats.area*(1+g.area));
      const target=selectCombatTarget(enemyList,casterPosition,range,activeFocus());
      if(!target)return false;
      const origin=casterPosition.clone();
      const direction=target.sprite.position.clone().sub(origin).setY(0).normalize();
      const projectile=!t.gravity&&['Projétil','Em V','Onda'].includes(t.shape);
      const academyThrow=!ally&&heroId==='naruto'&&projectile&&/shuriken|kunai/i.test(t.name);
      if(t.name==='Kage Bunshin'||t.name==='Técnica de Substituição'){
        if(shadowClones.length>=12)return false;
        const cloneLevel=level,cloneId=t.name==='Kage Bunshin'&&familyOf(casterId)!=='naruto'?'naruto':casterId,sprite=makeHero(cloneId,cloneLevel);
        sprite.position.copy(origin);sprite.visible=!hiddenEffects;scene.add(sprite);
        shadowClones.push({sprite,motion:createPlayerMotion(scene,sprite,cloneId,false),target,life:1.9,technique:t,growth:g,ally,level:cloneLevel});
      }else if(t.name==='Invocação do Sapo'&&familyOf(heroId)==='naruto'&&!ally){
        const impact=target.sprite.position.clone(),fire={...t,element:'Fogo' as const,burn:true};
        if(!hiddenEffects)showGamabunta(origin,impact);
        pendingHits.push({time:GAMABUNTA_IGNITION,run:()=>{const radius=1.65*Math.sqrt(stats.area*(1+g.area));areas.mark({...fire,shape:'Área'},origin,direction,impact,radius,range,0,0,hiddenEffects);if(!hiddenEffects&&!areas.enabled())particles.footprint(fire,origin,direction,impact,radius,range,0);for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-impact.x,enemy.sprite.position.z-impact.z)<radius)hit(enemy,fire,g,impact);}});
      }else if(t.name==='Kuroari'&&!ally){
        // Kuroari (rodada 41): a Formiga Negra surge e atinge o ponto de impacto — o dano é IDÊNTICO ao
        // golpe em área atual (mesma fórmula ATTACK_SCALE×1,2×área), só ganha a entidade visual; o veneno do
        // Kankuro continua sendo aplicado via hit() (stats.poison), como já acontecia.
        const impact=target.sprite.position.clone();
        if(!hiddenEffects)showPuppet(origin,impact);
        pendingHits.push({time:KUROARI_STRIKE,run:()=>{const radius=ATTACK_SCALE*SHAPE_RADIUS.area*Math.sqrt(stats.area*(1+g.area));areas.mark({...t,shape:'Área'},origin,direction,impact,radius,range,0,0,hiddenEffects);if(!hiddenEffects&&!areas.enabled())particles.footprint(t,origin,direction,impact,radius,range,0);for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-impact.x,enemy.sprite.position.z-impact.z)<radius)hit(enemy,t,g,impact);}});
      }else if(projectile){
        const launch=(launchOrigin:THREE.Vector3,aimTarget:Enemy)=>{
          const aimDirection=aimTarget.sprite.position.clone().sub(launchOrigin).setY(0).normalize();
          if(aimDirection.lengthSq()===0)aimDirection.copy(v1);
          const fan=t.shape==='Em V',wave=t.shape==='Onda',count=fan?2:1;
          const chance=stats.projectileChance;
          const projectiles=Math.floor(stats.projectiles)+Math.floor(chance)+(Math.random()<chance%1?1:0);
          const focused=aimTarget===activeFocus();
          const radius=ATTACK_SCALE*(wave?.85:.4)*Math.sqrt(stats.area*(1+g.area));
          const speed=(t.name.includes('Bunshin')?6:10)*stats.projectileSpeed;
          const signature=hasSignatureVisual(t,true),axis=new THREE.Vector3(0,1,0);
          for(let i=0;i<Math.min(12,count+projectiles-1);i++){
            const aim=aimDirection.clone().applyAxisAngle(axis,projectileSpread(fan,i,projectiles,focused));
            const object=signature?cachedTechniqueVisual(t,()=>makeHero(ally?'naruto':heroId,ally?1:level)):new THREE.Object3D();
            if(!signature)object.userData.particleHead=true;
            object.position.copy(launchOrigin);
            animateTechniqueVisual(object,0,aim);
            object.scale.multiplyScalar(ATTACK_SCALE);
            object.visible=!hiddenEffects;
            scene.add(object);
            shots.push({mesh:object,direction:aim,remaining:range,range,speed,radius,technique:t,origin:launchOrigin.clone(),hit:new Set(),growth:g,ally,effectLevel,bounces:!ally&&!wave?stats.bounce:0});
            if(!ally&&i<3)areas.lane(t,launchOrigin,aim,range,radius+.4,range/Math.max(.1,speed),hiddenEffects);
          }
        };
        if(academyThrow&&!instant)pendingHits.push({time:.12,run:()=>{
          const current=selectCombatTarget(enemyList,casterPosition,range,activeFocus());
          if(current)launch(casterPosition,current);
        }});
        else launch(origin,target);
      }
      else{const center=aimedCenter(t,sageArea)==='target'?target.sprite.position.clone():origin.clone(),radius=t.shape==='Área'||t.shape==='Órbita'?ATTACK_SCALE*(t.shape==='Área'?SHAPE_RADIUS.area:SHAPE_RADIUS.orbit)*Math.sqrt(stats.area*(1+g.area)):t.shape==='Corpo a corpo'&&!sageArea?Math.max(MELEE_IMPACT.min,range*MELEE_IMPACT.share):range;
        // Golpes e lançamentos sem projétil têm um preparo curto até o acerto, reduzido pela velocidade de projétil.
        let areaTelegraphed=false;
        const resolve=()=>{
        // Rodada 55: área real do golpe no chão (mesmas medidas do teste abaixo); a Área já foi telegrafada no cast.
        if(!ally){if(areaTelegraphed)areaTelegraphed=false;else areas.mark(t,origin,direction,center,radius,range,ATTACK_SCALE*.65*Math.sqrt(stats.area*(1+g.area)),0,hiddenEffects);}
        for(const enemy of [...enemyList]){const delta=enemy.sprite.position.clone().sub(origin);delta.y=0;const d=delta.length(),along=delta.dot(direction),cross=Math.abs(delta.x*direction.z-delta.z*direction.x);let inside=false;if(t.shape==='Linha')inside=along>=0&&along<=range&&cross<ATTACK_SCALE*.65*Math.sqrt(stats.area*(1+g.area));else if(t.shape==='Cone')inside=d<=range&&(d<.2||delta.normalize().dot(direction)>CONE_COS);else inside=Math.hypot(enemy.sprite.position.x-center.x,enemy.sprite.position.z-center.z)<=radius;if(inside)hit(enemy,t,g,t.gravity?center:origin,ally,effectLevel);}
        // Visual: Susanoo procedural; malha própria só para técnicas assinatura (Rasengan, invocações…); o resto é partícula por natureza × forma, na área/alcance reais.
        if(t.gravity==='pull'&&!hiddenEffects){const object=techniqueVisual(t);object.position.copy(center);object.scale.setScalar(radius);scene.add(object);visuals.push({object,life:.52});}
        else if(!hiddenEffects){const half=ATTACK_SCALE*.65*Math.sqrt(stats.area*(1+g.area));
          if(ally||!areas.enabled())particles.footprint(t,origin,direction,center,radius,range,half);
          if(susanooStyle){if(instant||delay<=0)susanoo.trigger(susanooStyle,origin,direction,center,radius);}
          else{particles.cast(t,origin,direction,center,radius,range,half);if(t.secondaryElement)particles.cast({...t,element:t.secondaryElement},origin,direction,center,radius,range,half);}
          const puppet=puppetArt(t.name);if(puppet)showPuppet(origin,target.sprite.position,puppet);
          if(visuals.length<36&&hasSignatureVisual(t,false)&&!puppet&&!susanooStyle){const object=cachedTechniqueVisual(t);object.position.copy(center);if(object.userData.iceMirrors)object.position.y=terrainHeight(center.x,center.z);animateTechniqueVisual(object,0,direction);object.scale.multiplyScalar(Math.max(.55,radius));scene.add(object);visuals.push({object,life:.35});}}
        if(sageArea)addRing(center,SENJUTSU.color,Math.min(radius,4));};
        const delay=(t.school==='Taijutsu'?IMPACT_DELAY.Taijutsu:IMPACT_DELAY.other)/Math.max(.3,stats.projectileSpeed);
        const susanooStyle=susanooStyleFor(casterId,t.name);
        // Susanoo forma-se já no cast: o golpe da arma (~0,22 s) coincide com o acerto resolvido após o preparo.
        if(!instant&&!hiddenEffects&&delay>0){if(susanooStyle)susanoo.trigger(susanooStyle,origin,direction,center,radius,false,delay);else particles.windup(t,origin,center,delay);}
        if(!ally&&(t.shape==='Área'||t.gravity==='pull')){areaTelegraphed=true;areas.mark(t,origin,direction,center,radius,range,0,instant?0:Math.max(0,delay),hiddenEffects);}
        if(instant||delay<=0)resolve();else pendingHits.push({time:delay,run:resolve});
        // Rodada 55: `projectiles` vale como GOLPE extra nas técnicas sem projétil (corpo a corpo, cone, linha, área): cada projétil
        // além do 1º repete o acerto 0,14 s depois (mesma regra de chance fracionária do projétil; Ultimate fora).
        {const extra=extraStrikes(stats.projectiles,stats.projectileChance,!!t.ultimate);for(let k=1;k<=extra;k++)pendingHits.push({time:Math.max(0,delay)+k*.14,run:resolve});}}
      const motion=ally?allyMotion:playerMotion;
      if(!t.ultimate)showHandSeals(t,casterPosition,casterId);
      if(!t.ultimate)motion?.attack(t.school==='Taijutsu'||academyThrow,direction.dot(v2)<0,false,t.school!=='Taijutsu'?undefined:t.name==='Furacão da Folha'||t.name==='Lótus Primária'?'kick':'punch',!academyThrow,direction.dot(v1)>.001,t.school==='Taijutsu'?.22:Math.max(.25,IMPACT_DELAY.other/Math.max(.3,stats.projectileSpeed)));
      if(!ally)playTechniqueSound(t,false,heroId);return true;
    }
    function castUltimate(){if(chakra<100||defeated||pausedRef.current||choiceData||sealing||roulette)return;chakra=0;playerMotion.attack(false,undefined,true,familyOf(heroId)==='lee'?'kick':familyOf(heroId)==='guy'?'punch':undefined,/Bunshin/.test(hero.ultimate));if(ex('ultReset')>0){for(const k of Object.keys(cooldowns))cooldowns[k]=0;ultBuffTimer=6;eventToast='Pergaminho do Hokage: técnicas recarregadas e +30% de velocidade de ataque';}playSfx('ultimate');const projectile=isProjectileUltimate(heroId),base=ultimateBase(hero),repulsion=hero.ultimate==='Shinra Tensei',t:Technique={...base,...(repulsion?{element:'Neutro' as const,burn:false,status:undefined,statusChance:0,gravity:'push' as const,color:'#e1eaff'}:heroId==='kakuzu'?{secondaryElement:'Fogo' as const,burn:true}:{}),name:hero.ultimate,power:6,range:Math.max(8,ultimateBase(hero).range),ultimate:true,shape:projectile?'Projétil':'Área',setup:undefined};playTechniqueSound(t,true,heroId);showHandSeals(t,player.position,heroId);const susanooStyle=susanooStyleFor(heroId,t.name);if(projectile||susanooStyle==='kakashi'){castTechnique(t,player.position,NO_GROWTH,false,projectile);return;}const ultRadius=4.2*Math.sqrt(stats.area);areas.mark(t,player.position,player.position,player.position,ultRadius,ultRadius,0,0,hiddenEffects);if(!hiddenEffects){const near=selectCombatTarget(enemyList,player.position,ultRadius,activeFocus()),aim=near?near.sprite.position.clone().sub(player.position).setY(0).normalize():new THREE.Vector3(0,0,1);
        particles.footprint(t,player.position,aim,player.position,ultRadius,ultRadius,0);
        if(susanooStyle)susanoo.trigger(susanooStyle,player.position,aim,near?.sprite.position??player.position,ultRadius,true);
        else if(puppetArt(t.name))showPuppet(player.position,near?.sprite.position??player.position,puppetArt(t.name));
        else if(t.name==='Shinra Tensei'){const object=techniqueVisual(t);object.position.copy(player.position);object.position.y=terrainHeight(player.position.x,player.position.z)+.32;object.scale.set(ultRadius,2,ultRadius);scene.add(object);visuals.push({object,life:.66});}
        else{particles.cast(t,player.position,aim,player.position,ultRadius,ultRadius,ultRadius*.3);
          if(t.secondaryElement)particles.cast({...t,element:t.secondaryElement},player.position,aim,player.position,ultRadius,ultRadius,ultRadius*.3);
          if(hasSignatureVisual(t,false)){const object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(player.position);if(object.userData.iceMirrors)object.position.y=terrainHeight(player.position.x,player.position.z);object.scale.multiplyScalar(object.userData.iceMirrors?ultRadius:2.8);scene.add(object);visuals.push({object,life:.7});}}}
      for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<4.2*Math.sqrt(stats.area))hit(enemy,t,NO_GROWTH,player.position);
      if(repulsion){shinra=startShinra();shinraTech={...t,power:t.power*SHINRA.pulsePower};shinraRadius=ultRadius;}
      if(t.name===SEXY_JUTSU.name){const charm=SEXY_JUTSU.radius*Math.sqrt(stats.area);for(const enemy of enemyList)if(!enemy.bijuu&&!enemy.totem&&Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<charm){enemy.control='Atordoar';enemy.controlTime=Math.max(enemy.controlTime??0,(enemy.guardian||enemy.megaElite?SEXY_JUTSU.bossStun:SEXY_JUTSU.stun)*stats.duration);}if(!hiddenEffects)for(const [color,size] of [['#ffffff',.35],['#ffd1e8',.65],['#ff8fc7',1]] as const)addRing(player.position,color,charm*size);eventToast='Jutsu Sexy! Inimigos atordoados.';}}
    const frame=(now:number)=>{choiceArmed();{const ui=overlayUi();if(pointerLocked()&&!cameraCanMove()&&!ui)document.exitPointerLock();cursor.setActive(pointerLocked()&&ui);}if(debugOpenRef.current)keys.clear();const fpsCap=currentSettings().fpsLimit;if(fpsCap>0&&now-lastFrameAt<1000/fpsCap-1)return;lastFrameAt=now;const perfT0=performance.now();const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;
      yaw=THREE.MathUtils.damp(yaw,targetYaw,24,dt);
      pitch=THREE.MathUtils.damp(pitch,targetPitch,24,dt);
      v1.set(-Math.sin(yaw),0,-Math.cos(yaw));v2.set(Math.cos(yaw),0,-Math.sin(yaw));
      if(enabledRef.current&&!pausedRef.current&&!choiceData&&!roulette&&!defeated&&!victory&&!debugState.frozen&&(document.hasFocus()||testPointer||debugOpenRef.current||sealing)){
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
      animClock+=dt;
      if(!sealing)pickupClock+=dt;
      if(!sealing&&!hagoromoEvent){elapsed+=dt;
        // FINAL SWARM (pedido do usuário): o relógio zerar NÃO encerra a run. Aviso grande, o relógio passa a contar o tempo sobrevivido
        // (+mm:ss) e a dificuldade sobe ×FINAL_SWARM.multiplier (2 desde 25/11; HP, dano, defesa, quantidade) e cresce com o tempo.
        // O guardião/portal continuam funcionando: vencer o guardião e entrar no portal leva à próxima zona (relógio novo) ou à arena.
        if(overtimeNow()>0&&!finalSwarmAnnounced){finalSwarmAnnounced=true;eventToast='FINAL SWARM! O tempo acabou: sobreviva o máximo que puder · dificuldade ×'+FINAL_SWARM.multiplier+' e subindo.';playSfx('ultimate');snapshotTimer=0;}
        else if(overtimeNow()<=0)finalSwarmAnnounced=false;}if(sealing?.phase==='sealing'){sealTimer+=dt;if(sealTimer>=2.7){if(sealing.account){const duelNote=accountSeal(sealing.heroId);eventToast=sealing.target+' foi selado e agora está DESBLOQUEADO na sua conta para as próximas missões'+duelNote;}else{recruitAlly(sealing.heroId);eventToast=sealing.target+' foi selado e agora luta ao seu lado';}/* Rodada 47 (pedido do usuário: "se não tiver escolha de substituição, continuar a missão instantaneamente") — o jutsu termina e a missão
 * continua na hora: próximo candidato (ou volta à run), sem a tela/botão "Continuar missão". O 'complete' nunca mais fica visível. */nextSeal();recaptureAfterChoice();}}if(!sealing){if(!arena&&!hagoromoEvent&&zoneElapsed()>=(megaSchedule[megaElitesSpawned]??Infinity)/Math.max(.1,tune().megaRate)&&enemyList.length<(overtimeNow()>0?FINAL_SWARM.maxEnemies:ENEMY_SCALING.maxEnemies)){spawnEnemy(false,true);megaElitesSpawned++;eventToast='Alerta: um Mega Elite surgiu naturalmente nesta zona!';}
      if(!hagoromoEvent&&(!testRun||weatherEvent))tickWeather();
      // Missões de desbloqueio (src/game/unlockMissions.ts): o Shinobi para selar de cada shinobi bloqueado surge só no mapa e na
      // dificuldade da missão dele. Até dois candidatos elegíveis por zona, com intervalo sorteado. Testes não geram.
      if(duel&&duelFoe){if(!duelWon&&!arena&&!hagoromoEvent&&!sealing&&elapsed>=nextAccountAt&&duelReady(duel,elapsed,kills)&&!enemyList.some(e=>e.account&&e.heroId===duelFoe)){nextAccountAt=elapsed+30;spawnEnemy(false,false,false,duelFoe,true);eventToast='Prova Chūnin · '+duel.title+': '+(HERO_BY_ID[duelFoe]?.name??duelFoe)+' entrou na luta · derrote e sele!';}}
      else if(!arena&&!hagoromoEvent&&!testRun&&!sealing&&accountEncounters<2&&elapsed>=nextAccountAt&&enemyList.length<ENEMY_SCALING.maxEnemies){const candidates=accountCandidates();const candidate=candidates[Math.floor(Math.random()*candidates.length)];if(candidate){accountTried.add(candidate.id);accountEncounters++;nextAccountAt=elapsed+40+Math.random()*35;spawnEnemy(false,false,false,candidate.id,true);const m=UNLOCK_MISSIONS[candidate.id];eventToast=(m.legendary?'LENDÁRIO! ':'')+'Missão '+m.title+': '+candidate.name+' apareceu · derrote e sele para desbloquear na conta!';}else nextAccountAt=elapsed+5;}const speed=stats.moveSpeed*(weatherEvent?.id==='sand'?.73:weatherEvent?.id==='snow'?.64:1)*(playerSlow>0?.55:1)*(rushTimer>0?1.2:1);readMovement(dir);
      const gliding=jumpTime>0&&jumpTime<=jumpDuration*.5&&sandGlideLeft>0&&keys.has(' ');
      if(gliding)sandGlideLeft=Math.max(0,sandGlideLeft-dt);else jumpTime=Math.max(0,jumpTime-dt);
      jumpHeight=jumpTime>0?Math.sin(Math.PI*jumpTime/jumpDuration)*1.3:0;
      slideRecovery=Math.max(0,slideRecovery-dt);
      const dashing=slideTime>0;
      if(dashing){dir.copy(dashHeading);slideTime=Math.max(0,slideTime-dt);}
      tickHagoromo(dt);tickYouthRun(dt);
      moving=dir.lengthSq()>0;
      if(moving)heading.copy(dir).normalize();
      const distance=moving?speed*dt*(slideTime>0?2.6:1):0;
      if(villageActive){
        walkingFloor=moveVillageActor(player.position,moving?heading:dir,distance,jumpHeight,dt,traversal,solids,standHeight,WORLD_LIMIT);
      } else {
        if(moving){
          player.position.addScaledVector(heading,distance);
          player.position.x=THREE.MathUtils.clamp(player.position.x,-WORLD_LIMIT,WORLD_LIMIT);
          player.position.z=THREE.MathUtils.clamp(player.position.z,-WORLD_LIMIT,WORLD_LIMIT);
          if(!arena){if(slideTime<=0){if(dashing)solids.exitAlong(player.position,heading);else solids.resolve(player.position);}}
        }
        walkingFloor=standHeight(player.position.x,player.position.z);
      }
      if(moving)revealAround(player.position.x,player.position.z);
      // Rodada 93: Shinra Tensei — o Pain levita e solta ondas de repulsão que empurram, ferem e atordoam.
      let shinraHeight=0;
      if(shinra&&shinraTech){const waves=advanceShinra(shinra,dt);shinraHeight=shinraLift(shinra.elapsed);
        for(let w=0;w<waves;w++){if(!hiddenEffects){const object=techniqueVisual(shinraTech);object.position.copy(player.position);object.position.y=terrainHeight(player.position.x,player.position.z)+.32;object.scale.set(shinraRadius,2,shinraRadius);scene.add(object);visuals.push({object,life:.55});}addRing(player.position,'#e1eaff',shinraRadius);
          for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<shinraRadius){hit(enemy,shinraTech,NO_GROWTH,player.position);if(enemyList.includes(enemy)&&!enemy.bijuu){enemy.control='Atordoar';enemy.controlTime=Math.max(enemy.controlTime||0,SHINRA.stunSeconds);}}}
        if(shinraDone(shinra)){shinra=null;shinraTech=null;}}
      player.position.y=walkingFloor+player.scale.y*.5+jumpHeight+shinraHeight;
      {const level=waterSurfaceAt(MAP.id,player.position.x,player.position.z,villageActive?waters:undefined);
        const onWater=level>-Infinity&&walkingFloor<=level+.14,airborne=jumpHeight>.05||traversal.climbing;
        if(onWater&&!airborne){rippleTimer-=dt;const footY=walkingFloor;
          if(wasAirborne){water.ripple(player.position.x,player.position.z,1);splashes.burst(player.position.x,footY,player.position.z,16,1.4);chakraFeet.step();rippleTimer=RIPPLES.step;}
          else if(slideTime>0&&rippleTimer<=0){water.ripple(player.position.x,player.position.z,.8);splashes.burst(player.position.x,footY,player.position.z,8,1.1);rippleTimer=.1;}
          else if(moving&&rippleTimer<=0){water.ripple(player.position.x,player.position.z,.6);splashes.burst(player.position.x,footY,player.position.z,6,.7);chakraFeet.step();rippleTimer=RIPPLES.step;}}
        // Inimigos e aliados perto também mexem a água (poucos por vez, para não pesar).
        othersRippleTimer-=dt;if(othersRippleTimer<=0){othersRippleTimer=SPLASH.othersEvery;const actors=[...allyActors,...enemyList.map(e=>e.sprite)];let made=0;
          for(let k=0;k<actors.length&&made<SPLASH.othersMax;k++){const a=actors[(othersRippleIndex+k)%actors.length];if(Math.hypot(a.position.x-player.position.x,a.position.z-player.position.z)>SPLASH.othersRange)continue;if(waterSurfaceAt(MAP.id,a.position.x,a.position.z,villageActive?waters:undefined)===-Infinity)continue;water.ripple(a.position.x,a.position.z,.35);made++;}
          othersRippleIndex=(othersRippleIndex+SPLASH.othersMax)%Math.max(1,actors.length);}
        wasAirborne=airborne;chakraFeet.update(player.position.x,player.position.z,onWater&&!airborne,performance.now()/1000,dt);}
      const threat=threatNow();
      if(tune().enemyHp!==appliedEnemyHp){const ratio=tune().enemyHp/Math.max(.01,appliedEnemyHp);for(const e of enemyList)rescaleEnemyHp(e,ratio);appliedEnemyHp=tune().enemyHp;}
      if(!arena&&!hagoromoEvent)updateTotem(dt);
      ambushTimer-=dt;if(!arena&&!hagoromoEvent&&ambushTimer<=0){for(let n=0;n<Math.min(8+zone*2,threat.cap-enemyList.length);n++)spawnEnemy();ambushTimer=AMBUSH_RULES.min+Math.random()*AMBUSH_RULES.spread;eventToast='Emboscada! Ninjas cercando a área.';}
      if(!hagoromoEvent)tickAltar(dt);
      // Rodada 47/49/50 — auto-coleta ao pisar (sem "E"): apenas o drop do mega (sealDrop). Rodada 50 (pedido do usuário: "os bolinhos de arroz você colocou para passar em cima e pegar automático, retire isso"): morro de arroz (Ryu) agora também pede E, igual aos pergaminhos.
      if(!hagoromoEvent&&!choiceData&&!sealing&&!roulette&&!defeated&&!victory){const autoPickup=pickups.find(p=>p.active&&p.kind!=='cursedShuriken'&&p.kind!=='ninjaBody'&&p.kind!=='kunai'&&p.kind!=='shuriken'&&p.kind!=='ryu'&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<1.8);if(autoPickup)collectPickup(autoPickup);}
      // Spawn em LOTE (antes: 1 inimigo por intervalo, ~5/s aos 8 min — o jogador matava mais rápido do que nascia e a horda ficava em ~60).
      // Orçamento contínuo = spawns/s × dt; abaixo do teto a reposição acelera (até ×SPAWN_RULES.refill com a tela vazia); máximo SPAWN_RULES.perFrame por quadro.
      spawnTimer-=dt;if(!arena&&!hagoromoEvent&&spawnTimer<=0){const perFrame=threat.swarm>1?SPAWN_RULES.swarmPerFrame:SPAWN_RULES.perFrame,deficit=Math.max(0,1-enemyList.length/Math.max(1,threat.cap));spawnBudget=Math.min(perFrame,spawnBudget+dt/Math.max(.001,threat.spawnInterval)*(1+SPAWN_RULES.refill*deficit));let made=0;while(spawnBudget>=1&&enemyList.length<threat.cap&&made<perFrame){spawnEnemy();spawnBudget--;made++;}if(enemyList.length>=threat.cap)spawnBudget=Math.min(spawnBudget,1);}
      // Rodada 49 — hard cap 1600 (defesa em profundidade — pedido: "final swarm não respeitando os 1600 monstros totais"):
      // se passar do teto (ex.: emboscada/roleta por cima do lote), remove os últimos inimigos comuns — nunca bosses.
      if(enemyList.length>FINAL_SWARM.maxEnemies){for(let i=enemyList.length-1;i>=0&&enemyList.length>FINAL_SWARM.maxEnemies;i--){const e=enemyList[i];if(e.guardian||e.bijuu||e.totem||e.megaElite||e.account||e.boss||e.clone)continue;const j=enemyList.indexOf(e);scene.remove(e.sprite);disposeEnemySprite(e);enemyList.splice(j,1);}}
      hp=Math.min(stats.maxHp,hp+dt*stats.regen);
      for(let i=enemyShots.length-1;i>=0;i--){
        const shot=enemyShots[i],position=shot.object.position,step=shot.speed*Math.min(shot.life,dt);
        const px=player.position.x-position.x,pz=player.position.z-position.z;
        const along=THREE.MathUtils.clamp(px*shot.direction.x+pz*shot.direction.z,0,step);
        const hit=Math.hypot(px-along*shot.direction.x,pz-along*shot.direction.z)<shot.radius&&jumpHeight<.65;
        if(hit)damagePlayer(shot.damage);
        shot.life-=dt;
        if(hit||shot.life<=0){enemyShots.splice(i,1);continue;}
        position.addScaledVector(shot.direction,step);
        position.y=terrainHeight(position.x,position.z)+.68;
        if(shot.type!=='kunai')shot.object.rotateY(dt*14);
      }
      flushDeathBursts();
      for(const enemy of [...enemyList]){if(hagoromoEvent&&!enemy.hagoromo)continue;
        if(!hagoromoEvent&&mistHides(weatherEvent,elapsed)&&!enemyRenderer.isBatched(enemy.sprite))enemy.sprite.visible=Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<ZABUZA_MIST.reveal+ZABUZA_MIST.fade;
        else enemy.sprite.visible=true;
        if(enemy.poison){const duration=Math.min(dt,enemy.poison.remaining);enemy.poison.remaining-=duration;takeDamage(enemy,enemy.poison.dps*duration*poisonMultiplier(enemy.poisonStacks),'#b67bff');if(!enemyList.includes(enemy))continue;if(enemy.poison.remaining<=0){enemy.poison=undefined;enemy.poisonStacks=0;}}
        enemy.sprite.material.color.lerp(enemy.elite?ELITE_TINT:WHITE_TINT,dt*6);if(enemy.fixedArt)enemy.fixedArt.material.color.copy(enemy.sprite.material.color);if((enemy.burn??0)>0){enemy.burn=Math.max(0,(enemy.burn??0)-dt);takeDamage(enemy,stats.damage*.15*dt*(1+ex('statusDamage'))*elementMultiplier(stats.extra,'Fogo'),'#ff9b46');if(!enemyList.includes(enemy))continue;}if(enemy.totem)continue;enemy.controlTime=Math.max(0,(enemy.controlTime||0)-dt);enemy.slow=Math.max(0,(enemy.slow||0)-dt);tickStatus(enemy,dt);const channeling=!hagoromoEvent&&isChanneling(weatherEvent,enemy.heroId,elapsed);enemy.arrivalGuard=Math.max(0,(enemy.arrivalGuard??0)-dt);const stunned=channeling||enemy.arrivalGuard>0||!enemy.bijuu&&enemy.controlTime>0&&enemy.control!=='Lentidão';const casting=enemy.boss?bossCombat.update(enemy,dt,Boolean(enemy.guardian||enemy.megaElite&&!enemy.account)&&!stunned&&enemy.windup===undefined&&!defeated):false;if(defeated)break;
        const sprite=enemy.sprite,batched=enemyRenderer.isBatched(sprite),motion=enemy.motion;
        dir.set(player.position.x-sprite.position.x,0,player.position.z-sprite.position.z);
        const distance=dir.length();
        const ranged=enemy.ranged!==undefined,reach=ranged?8:enemy.megaElite?1.6:1;
        const movingEnemy=!stunned&&!casting&&enemy.windup===undefined&&distance>reach&&enemy.speed>0;
        enemyTravel.copy(dir);
        if(movingEnemy&&moving&&distance>2.8&&distance<12)enemyTravel.addScaledVector(heading,Math.min(1.4,distance*.14));
        enemyTravel.normalize();
        const {left,back,diagonal}=stableFacing(sprite.userData,enemyTravel.dot(v1),enemyTravel.dot(v2));
        const lateralEnemy=Math.abs(enemyTravel.dot(v1))<.26&&Math.abs(enemyTravel.dot(v2))>.32;
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
          sprite.userData.back=back;
          sprite.userData.side=lateralEnemy&&movingEnemy&&!movingSpecial;
          sprite.userData.frame=striking?ENEMY_FRAME.attack:movingSpecial
            ? (enemy.jumping?ENEMY_FRAME.jump:ENEMY_FRAME.dash)+Math.min(3,Math.floor(progress*4))
            :movingEnemy?Math.floor(animClock*10+sprite.id%4)%4:1;
        }
        if(motion&&((striking&&(enemy.windup??0)+dt>.2)||(casting&&enemy.boss?.cast&&enemy.boss.cast.windup<=.2&&enemy.boss.cast.windup+dt>.2))){
          const cast=enemy.boss?.cast;
          motion.attack(false,left,!!cast?.ultimate,['lee','guy'].includes(familyOf(enemy.heroId??''))?'kick':undefined,true,back,cast?.total);
        }
        if(stunned||casting){
          // Rodada 63: selos da conjuração (quadros de selo da folha, ou a pose de conjuração enquanto a arte não existe).
          if(channeling&&motion){enemy.sealTimer=(enemy.sealTimer??0)-dt;if(enemy.sealTimer<=0){enemy.sealTimer=.55;motion.attack(false,left,true,undefined,true,back);}}
          if(!motion)continue;
        }
        else if(enemy.windup!==undefined){enemy.windup-=dt;if(enemy.marker)enemy.marker.userData.opacity=.3+(1-Math.max(0,enemy.windup)/.65)*.5;
          if(enemy.windup<=0){const radius=enemy.megaElite?1.7:1;if(ranged&&enemy.attackPoint&&enemyShots.length<80){
            const weapon=enemy.ranged!,fuma=weapon===2,direction=enemy.attackPoint.clone().sub(sprite.position).setY(0).normalize();

            const type=weapon===0?'kunai':fuma?'fuma':'shuriken',object=new THREE.Object3D();
            object.scale.setScalar(fuma?1.1:.8);
            object.rotation.y=Math.atan2(direction.x,direction.z);
            object.position.copy(sprite.position).addScaledVector(direction,.45);
            enemyShots.push({object,type,direction,...commonEnemyProjectile(fuma),damage:(fuma?11:7)*threat.damage,radius:fuma?.72:.42});
          }else if(!ranged&&enemy.attackPoint&&Math.hypot(player.position.x-enemy.attackPoint.x,player.position.z-enemy.attackPoint.z)<radius&&invulnerability<=0){
            damagePlayer(10*(enemy.dmgMult??1)*threat.damage,enemy);
          }if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();enemy.marker=undefined;}enemy.windup=undefined;enemy.hitTimer=(ranged?2.25:.9)/threat.attackRate;}
        }else{enemy.hitTimer-=dt;if(distance>reach){enemy.sprite.position.addScaledVector(enemyTravel,enemy.speed*threat.speed*(enemy.slow?.75:1)*chillSlow(enemy)*(movingSpecial?(enemy.jumping?1.2:1.85):1)*dt);if(!arena&&!enemy.bijuu)solids.resolveBig(enemy.sprite.position);enemy.sprite.position.y=standHeight(enemy.sprite.position.x,enemy.sprite.position.z)+enemy.sprite.scale.y*.46+leap;}
          else if(enemy.hitTimer<=0){enemy.windup=Math.max(.28,.65/Math.sqrt(threat.attackRate));enemy.attackPoint=player.position.clone();/* Aviso no chão desenhado em lote (enemyRenderer); o Mesh é só dado. */const marker=enemyRenderer.marker(ranged?.7:enemy.megaElite?1.7:1);marker.position.set(enemy.attackPoint.x,terrainHeight(enemy.attackPoint.x,enemy.attackPoint.z)+.2,enemy.attackPoint.z);enemy.marker=marker;}
        }
        if(motion){
          motion.update(dt,terrainHeight(sprite.position.x,sprite.position.z),1,1,movingEnemy,back,left,enemy.motionLevel??1,leap,movingSpecial&&!enemy.jumping,diagonal,progress,progress,lateralEnemy);
          const outline=sprite.children[0];
          if(outline instanceof THREE.Sprite){outline.material.map=sprite.material.map;outline.material.rotation=sprite.material.rotation;}
        }
        if(defeated)break;
      }
      bossCombat.updateEffects(dt);updateTargetMarker();
      for(const [pickup,beacon] of beacons){if(!pickup.active||!pickups.includes(pickup)){beacon.dispose();beacons.delete(pickup);}else beacon.update(dt,hiddenEffects);} // Rodada 73: farol do pergaminho grátis.
      for(const fallen of fallenMegas)fallen.body.update(dt,hiddenEffects); // Rodada 55: queda, respiração e halo do corpo caído.
      // Aliados seguem em formação, atacam automaticamente e fornecem regeneração de suporte.
      allyTimer-=dt;if(!defeated&&!sealing)for(const id of allies)gainAffinity(id,dt*AFFINITY_RULES.perSecond);
      for(let i=0;i<allyActors.length;i++){
        const ally=allyActors[i],angle=i*Math.PI*.8+1,motion=allyMotions.get(ally);
        const goal=new THREE.Vector3(player.position.x+Math.cos(angle)*2.6,0,player.position.z+Math.sin(angle)*2.6);
        dir.copy(goal).sub(ally.position);dir.y=0;
        const gap=dir.length(),follows=gap>.18,dash=follows&&slideTime>0;
        dir.normalize();
        if(gap>12)ally.position.copy(goal);
        // Rodada 46 — follow amortecido: antes era stop-and-go (parava SECO dentro de 0,25 m do slot e saía
        // 'correndo' em speed+2; com o jogador andando isso alternava idle<->andar a ~10 Hz — a 'caminhada bugada').
        // Agora o aliado desacelera suavemente (lerp exponencial, ~0,13 s) e segue o slot em offset constante
        // (~velocidade/8 m) com passada CONTÍNUA — o mesmo controle de animação do jogador (playerMotion).
        else if(follows)ally.position.lerp(goal,1-Math.exp(-dt*(dash?16:8)));
        const floor=terrainHeight(ally.position.x,ally.position.z);
        ally.position.y=floor+ally.scale.y*.5+jumpHeight;
        const allyId=allies[i],form=formAt(allyId,level).level;
        if(ally.userData.form!==form){ally.material.dispose();ally.material=heroMaterial(allyId,level);ally.userData.form=form;}
        if(allyTimer<=0&&!defeated){
          const kit=HERO_BY_ID[allyId]?.techniques.filter(t=>!t.setup&&t.unlockLevel<=level)??[NPC_ALLIES[allyId].technique];
          const index=(ally.userData.nextTechnique??0)%Math.max(1,kit.length);
          if(kit[index]&&castTechnique(kit[index],ally.position,NO_GROWTH,true,false,motion,false,allyId))ally.userData.nextTechnique=index+1;
        }
        // Rodada 46 — dead zone de orientação idêntico ao jogador (±0,18): sem ele, a fileira da folha
        // (frente<->costas) 'flippava' a cada frame quando o aliado andava quase de lado para a tela.
        // Rodada 55: + histerese (stableFacing) — parado, mantém a última orientação em vez de ler o ruído do slot.
        const af=follows||!ally.userData.facing?stableFacing(ally.userData,dir.dot(v1),dir.dot(v2)):{...ally.userData.facing as {back:boolean;left:boolean},diagonal:false};
        motion?.update(dt,floor,1,1,follows,af.back,af.left,level,jumpHeight,dash,af.diagonal,1-jumpTime/jumpDuration,1-slideTime/slideDuration,Math.abs(dir.dot(v1))<.26&&Math.abs(dir.dot(v2))>.32);
      }if(allyTimer<=0)allyTimer=allyInterval();
      // Kuri (rodada 41): segue o Kankuro em formação e ataca no timer próprio (não compartilha o allyTimer).
      if(companionId&&kuriSprite&&kuriMotion&&!defeated){
        const kuriAngle=2.4,goal=new THREE.Vector3(player.position.x+Math.cos(kuriAngle)*2.1,0,player.position.z+Math.sin(kuriAngle)*2.1);
        dir.copy(goal).sub(kuriSprite.position);dir.y=0;
        const gap=dir.length(),follows=gap>.18;
        dir.normalize();
        if(gap>12)kuriSprite.position.copy(goal);
        // Rodada 46 — mesmo follow amortecido dos aliados (sem stop-and-go e sem flicker de fileira).
        else if(follows)kuriSprite.position.lerp(goal,1-Math.exp(-dt*(slideTime>0?16:8)));
        const kuriFloor=terrainHeight(kuriSprite.position.x,kuriSprite.position.z);
        kuriSprite.position.y=kuriFloor+kuriSprite.scale.y*.5;
        kuriTimer-=dt;
        if(kuriTimer<=0){
          const technique=companionId==='akamaru'?HERO_BY_ID.kiba.techniques[0]:NPC_ALLIES.kuri.technique;
          if(castTechnique(technique,kuriSprite.position,NO_GROWTH,true,false,kuriMotion,false,companionId))kuriTimer=allyInterval();
          else kuriTimer=.5; // sem inimigo no alcance: retry leve sem queimar o loop
        }
        const kf=follows||!kuriSprite.userData.facing?stableFacing(kuriSprite.userData,dir.dot(v1),dir.dot(v2)):{...kuriSprite.userData.facing as {back:boolean;left:boolean},diagonal:false};
        kuriMotion.update(dt,kuriFloor,1,1,follows,kf.back,kf.left,1,jumpHeight,follows&&slideTime>0,kf.diagonal,1-jumpTime/jumpDuration,1-slideTime/slideDuration,Math.abs(dir.dot(v1))<.26&&Math.abs(dir.dot(v2))>.32);
      }
      if(!defeated){
      chakra=Math.min(100,chakra+100*dt/55*stats.ultimateRate*tune().ultimateRate);if(autoUlt&&chakra>=100)castUltimate();
      for(const t of techniques){if(!skillLevels[t.name])continue;cooldowns[t.name]=(cooldowns[t.name]||0)-dt;if(cooldowns[t.name]<=0){const g=growth[t.name]??NO_GROWTH;if(castTechnique(t,player.position,g))cooldowns[t.name]=t.setup?setupNumbers(t,g,skillLevels[t.name]).cooldown:attackCooldown(t,skillLevels[t.name],g,stats.attackSpeed*tempAttackSpeed());}}
      for(let i=pendingHits.length-1;i>=0;i--){pendingHits[i].time-=dt;if(pendingHits[i].time<=0){const p=pendingHits.splice(i,1)[0];p.run();}}
      for(let i=shadowClones.length-1;i>=0;i--){
        const clone=shadowClones[i],sprite=clone.sprite;clone.life-=dt;sprite.visible=!hiddenEffects;
        if(!enemyList.includes(clone.target)||clone.life<=0){disposeShadowClone(clone);shadowClones.splice(i,1);continue;}
        const target=clone.target.sprite.position;dir.copy(target).sub(sprite.position).setY(0);
        const gap=dir.length();dir.normalize();
        if(gap<=.76){
          const substitution=clone.technique.name==='Técnica de Substituição';
          const radius=(substitution?.9:KAGE_BUNSHIN_RADIUS)*Math.sqrt(stats.area*(1+clone.growth.area));
          const victims=enemyList.filter(e=>e===clone.target||Math.hypot(e.sprite.position.x-target.x,e.sprite.position.z-target.z)<=radius);
          for(const victim of victims)hit(victim,clone.technique,clone.growth,sprite.position,clone.ally);
          if(!hiddenEffects){
            if(substitution){const wood=techniqueVisual({...clone.technique,name:'Técnica de Substituição'});wood.position.copy(target);scene.add(wood);visuals.push({object:wood,life:.38});}
            addRing(sprite.position,substitution?'#e4ba80':'#e4ecff',radius);
          }
          disposeShadowClone(clone);shadowClones.splice(i,1);continue;
        }
        sprite.position.addScaledVector(dir,Math.min(gap-.63,dt*(clone.technique.name==='Técnica de Substituição'?13:8.2)*stats.projectileSpeed));
        // Rodada 55: clones também com histerese (antes sem dead zone: >0/<0 piscava frente/costas e o espelho).
        const cf=stableFacing(sprite.userData,dir.dot(v1),dir.dot(v2));
        clone.motion.update(dt,terrainHeight(sprite.position.x,sprite.position.z),1,1,true,cf.back,cf.left,clone.level,0,false,cf.diagonal,0,0,Math.abs(dir.dot(v1))<.26&&Math.abs(dir.dot(v2))>.32);
      }
      for(let i=shots.length-1;i>=0;i--){
        const shot=shots[i],position=shot.mesh.position;
        const travel=Math.min(shot.remaining,shot.speed*dt),radius=shot.radius+.4;
        const singleHit=shot.technique.shape==='Projétil';
        const contact=singleHit?firstProjectileContact(enemyList,position,shot.direction,travel,radius,shot.hit):undefined;
        if(!singleHit){
          for(const enemy of [...enemyList]){
            if(enemy.hp<=0||shot.hit.has(enemy)||projectileContact(position,shot.direction,travel,radius,enemy.sprite.position)===Infinity)continue;
            shot.hit.add(enemy);
            hit(enemy,shot.technique,shot.growth,shot.origin,shot.ally,shot.effectLevel);
          }
        }
        position.addScaledVector(shot.direction,contact?.distance??travel);
        position.y=terrainHeight(position.x,position.z)+1.1;
        shot.remaining-=travel;
        animateTechniqueVisual(shot.mesh,dt,shot.direction);
        if(!hiddenEffects)particles.trail(shot.technique,shot,position,shot.direction,shot.radius,dt,!!shot.mesh.userData.particleHead);
        if(contact){
          shot.remaining=0;
          shot.hit.add(contact.target);
          hit(contact.target,shot.technique,shot.growth,shot.origin,shot.ally,shot.effectLevel);
        }
        if(shot.remaining<=0&&shot.bounces>0&&shot.hit.size>0){
          const next=selectCombatTarget(enemyList,position,Math.min(shot.range,6),activeFocus(),shot.hit);
          if(next){
            shot.bounces--;
            shot.direction.copy(next.sprite.position).sub(position).setY(0).normalize();
            if(shot.direction.lengthSq()===0)shot.direction.copy(v1);
            shot.remaining=Math.min(shot.range,6.5);
          }
        }
        if(shot.remaining<=0){scene.remove(shot.mesh);disposeObject(shot.mesh);shots.splice(i,1);}}
      const globalPull=pickupClock<globalMagnetUntil;
      const nearbyDrops=globalPull?drops.ground():drops.near(player.position.x,player.position.z,stats.pickup);
      for(const drop of nearbyDrops){
        const dist=Math.hypot(player.position.x-drop.mesh.position.x,player.position.z-drop.mesh.position.z);
        if(dropCanMagnetize(pickupClock-drop.born,DROP_RULES.settle,dist,stats.pickup,globalPull))pullDrop(drop,globalPull);
      }
      for(const drop of drops.pulled()){
        const ddx=player.position.x-drop.mesh.position.x,ddz=player.position.z-drop.mesh.position.z,dist=Math.hypot(ddx,ddz);
        // Rodada 55 (ímã do morro, mapa inteiro): drop puxado pelo ímã global chega em ≤ ~1,2 s de qualquer distância.
        if(drop.magnet){drop.mesh.scale.setScalar(drop.mesh.userData.baseScale*.72);drop.mesh.rotateY(dt*5);drop.speed+=DROP_RULES.magnetAccel*dt;drop.speed=magnetSpeed(drop.speed,dist,!!drop.mesh.userData.globalPull);const step=Math.min(dist,drop.speed*dt);if(dist>0){drop.mesh.position.x+=ddx/dist*step;drop.mesh.position.z+=ddz/dist*step;}drop.mesh.position.y=Math.max(itemSurface(drop.mesh.position.x,drop.mesh.position.z)+.035,THREE.MathUtils.damp(drop.mesh.position.y,player.position.y-.2,16,dt));}

        if(drop.magnet&&dist-(drop.speed*dt)<=DROP_RULES.touch){
          creditDrop(drop);
          if(drop.type==='onigiri'&&!hiddenEffects)addRing(player.position,'#7dffb0',1.2);
          if(currentSettings().pickupFx!=='nenhum'&&frames%3===0)playSfx('pickup');drops.collect(drop);
        }
      }
      if(!choiceData&&!sealing&&rouletteItems.length)showRouletteItem();
      if(!choiceData&&!sealing){if(xp>=xpNext||pendingLevels>0){if(pendingLevels>0)pendingLevels--;else xp-=xpNext;const oldForm=formAt(heroId,level).level;level++;refreshStats(true);xpNext=Math.ceil(xpToLevelUp(level)*tune().xpCurve);if(formAt(heroId,level).level!==oldForm){player.material.dispose();player.material=heroMaterial(heroId,level);eventToast=hero.name+' evoluiu: '+formAt(heroId,level).name+' · +25% do HP base';addRing(player.position,'#fff195',3);}choiceLevel=level;openLevelReward();invulnerability=3;}else if(pendingItemRewards>0){pendingItemRewards--;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}}
      } // Vivo
      } // Fora do ritual de selamento
      for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.scale.multiplyScalar(1+dt*2.4);const mat=fx.material as THREE.MeshBasicMaterial;mat.opacity-=dt*1.35;if(mat.opacity<=0){scene.remove(fx);if(!ringGeometries.has(fx.geometry))fx.geometry.dispose();mat.dispose();effects.splice(i,1);}}
      // Partículas/Susanoo avançam só com o jogo rodando (pausa congela). Aura contínua dos setups ativos.
      if(!hiddenEffects)for(const s of activeSetups){const st=techniques.find(x=>x.name===s.name);if(st)particles.aura(st,player.position,false,dt);}
      particles.update(dt);areas.update(dt);susanoo.update(dt,camera);
      for(let i=visuals.length-1;i>=0;i--){const fx=visuals[i];fx.life-=dt;fx.tick?.(dt);animateTechniqueVisual(fx.object,dt);if(fx.object instanceof THREE.LineSegments&&fx.object.userData.impact){fx.object.quaternion.copy(camera.quaternion);fx.object.scale.setScalar(1.4-3*fx.life);fx.object.material.opacity=Math.max(0,fx.life*5);}if(fx.life<=0){scene.remove(fx.object);disposeObject(fx.object);visuals.splice(i,1);}}
      for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.sprite.position.y+=dt*1.3;n.sprite.material.opacity=Math.max(0,n.life/.8);if(n.life<=0){damageNumbers.recycle(n.sprite);numbers.splice(i,1);}}
      // Só registra o evento depois que ele entra no campo visível da câmera.
      const frustum=viewFrustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      updateZetsu(dt);
      for(const event of events){if(event===zetsuEvent)continue;if(!event.discovered&&frustum.containsPoint(event.obj.position)&&event.obj.position.distanceTo(player.position)<60){event.discovered=true;event.obj.visible=true;if(event===ichiraku)placeTeuchi();}}
      if(totem&&!totemDiscovered&&frustum.containsPoint(totem.sprite.position)&&totem.sprite.position.distanceTo(player.position)<60)totemDiscovered=true;
      for(const pickup of pickups){if(!pickup.discovered&&frustum.containsPoint(pickup.mesh.position)&&pickup.mesh.position.distanceTo(player.position)<60)pickup.discovered=true;}
      // Mega elites/guardiões entram no mapa só depois de vistos na câmera.
      for(const e of enemyList){if(e.megaElite&&!e.seen&&frustum.containsPoint(e.sprite.position)&&e.sprite.position.distanceTo(player.position)<40)e.seen=true;}
      }
      if(zoom!==targetZoom){
        zoom=Math.abs(zoom-targetZoom)<.01?targetZoom:THREE.MathUtils.damp(zoom,targetZoom,18,dt);
        projectCamera();
      }
      if(!arena){
        const active=!hagoromoEvent&&weatherEvent&&WEATHER_EVENTS[weatherEvent.id];
        if(active){if(!(scene.fog instanceof THREE.Fog))scene.fog=weatherFog();
          // Rodada 63: durante os selos a névoa engrossa aos poucos (névoa aberta → névoa do evento).
          if(scene.fog instanceof THREE.Fog){const distance=camera.position.distanceTo(player.position),range=blendFog(active,castProgress(elapsed,weatherEvent?.castEnd,active.cast?.seconds??0));scene.fog.color.set(active.sky);scene.fog.near=distance+range.near;scene.fog.far=distance+range.far;}
        }else scene.fog=null;
      }const targetHeight=walkingFloor+player.scale.y*.5;
      // O centro permanece no jogador, mesmo durante a rotação e a interpolação do zoom.
      cameraTarget.set(player.position.x,targetHeight,player.position.z);
      const orbitDistance=perspective?perspectiveDistance(zoom):zoom*1.65+10;
      const ox=Math.sin(yaw),oz=Math.cos(yaw);
      // O jogador pode rotacionar a câmera para encontrar uma linha de visão livre.
      offset.set(ox*Math.cos(pitch),Math.sin(pitch),oz*Math.cos(pitch)).multiplyScalar(orbitDistance);
      camera.position.copy(cameraTarget).add(offset);
      camera.position.y=cameraHeightAboveTerrain(camera.position.y,camera.position.x,camera.position.z,terrainHeight);
      const viewLength=Math.hypot(offset.x,offset.z);
      const viewPitch=Math.atan2(camera.position.y-cameraTarget.y,viewLength);
      cameraViewPitch=viewPitch;
      // Em ortográfica, o chão visível na parte de baixo pode cair atrás da origem da câmera.
      const near=Math.min(-70,orbitDistance-(zoom*.5+4)/Math.sin(viewPitch));
      // Rodada 55: com a câmera bem deitada o chão visível no topo vai além de 240 m — o far acompanha (sem cortar o chão).
      const far=Math.max(380,orbitDistance+(zoom*.5+4)/Math.sin(viewPitch)+20);
      if(!perspective&&(Math.abs(camera.near-near)>.05||Math.abs(camera.far-far)>.5)){camera.near=near;camera.far=far;camera.updateProjectionMatrix();}
      const viewX=camera.position.x-player.position.x,viewZ=camera.position.z-player.position.z;
      for(const {obj,fadeMaterials} of occluders){
        const dx=obj.position.x-player.position.x,dz=obj.position.z-player.position.z;
        const depth=(dx*viewX+dz*viewZ)/viewLength,side=Math.abs(dx*viewZ-dz*viewX)/viewLength;
        const overlap=depth>0&&depth<obj.scale.y+2&&side<obj.scale.x*.45;
        for(const paint of fadeMaterials)paint.opacity=THREE.MathUtils.damp(paint.opacity,overlap?.22:1,20,dt);
      }
      camera.lookAt(cameraTarget);camera.updateMatrixWorld();
      if(enabledRef.current&&!defeated&&!victory)updateRoute();if(routeNotice&&performance.now()>routeNotice.until){routeNotice=null;snapshotTimer=0;}
      frames++;fpsTimer+=dt;if(fpsTimer>=.5){fps=Math.round(frames/fpsTimer);frames=0;fpsTimer=0;}snapshotTimer-=dt;if(snapshotTimer<=0){onSnapshotRef.current({youth:{panel:choiceLevel===-13&&!!choiceData,challenge:youthOffer,run:youthRun?{challenge:youthRun.challenge,difficulty:youthRun.difficulty,timeLeft:youthRun.timeLeft,progress:youthRun.progress,goal:youthRun.goal}:null},hagoromo:{keys:hagoromo.keys,progress:hagoromo.progress,need:HAGOROMO.killsPerKey,tools:[...hagoromo.tools],active:!!hagoromoEvent,stage:hagoromoStage(),recharge:hagoromoRecharges('classico',hagoromoBossDown)},protection:debugState.god?'debug':invulnerability>.25?'temporary':undefined,killStreak:recentStreak(streak,elapsed),sagesUsed:sagesUsedZone===zone,enemyCount:enemyList.length,powerlevel:{...powerlevel},allyCharge:allyActors.length?Math.min(1,Math.max(0,1-allyTimer/allyInterval())):0,victory,remaining:Math.max(0,ZONE_SECONDS-zoneElapsed()),overtime:overtimeNow(),phase:portal?.kind==='exit'?'exit':arena?'arena':'zone',bijuu:enemyList.find(e=>e.bijuu)?.boss?.name??defeatedBijuu,bijuuReward,plansUsed,hiddenEffects,totalDamage:Math.round(totalDamage),skillDamage:{...skillDamage},skillGrowth:{...growth},techniques:techniques.filter(t=>skillLevels[t.name]||(!banned.has(t.name)&&!config.archivedSkills.includes(t.name)&&!consumedTechniques.has(t.name))),banned:[...banned],synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),setups:activeSetups.map(s=>({name:s.name,remaining:s.remaining,duration:s.duration})),zone,skillTimers:Object.fromEntries(techniques.filter(t=>skillLevels[t.name]).map(t=>{const g=growth[t.name]??NO_GROWTH;return [t.name,{remaining:Math.max(0,cooldowns[t.name]||0),total:t.setup?setupNumbers(t,g,skillLevels[t.name]).cooldown:attackCooldown(t,skillLevels[t.name],g,stats.attackSpeed*tempAttackSpeed()),duration:activeSetups.find(setup=>setup.name===t.name)?.remaining??0}];})),boss:enemyList.filter(e=>e.guardian||e===hagoromoEvent?.mega).map(e=>(e.bijuu?e.boss?.name+' · Fase '+e.boss?.phase+'/3':HERO_BY_ID[e.heroId!].name)+' · '+compactNumber(Math.ceil(e.hp))+'/'+compactNumber(e.maxHp??e.hp)+' HP'+(e.guardian?' · '+Math.round((e.defense??0)*100)+'% defesa':'')+(e.shikamaruPlans?' · +'+e.shikamaruPlans+' kunai (Shikamaru)':'')).join(', '),defenseProgress:defenseActive&&defenseAltar?Math.floor(defenseTime/altarTimes[defenseAltar.altarTier??0]*100):0,hp:Math.ceil(hp),maxHp:stats.maxHp,stats:{...stats},defeated,allyDamage:Math.round(allyDamage),difficultyScale:threatNow().hp,level,xp,xpNext,chakra,kills,runMoney,elapsed,fps,kunai,shuriken,luck,autoUlt,allies:[...allies],affinity:{...allyAffinity},weather,weatherEvent:hagoromoEvent?undefined:weatherEvent?.id,weatherRemaining:!hagoromoEvent&&weatherEvent?Math.max(0,Math.ceil(weatherEvent.until-elapsed)):undefined,toast:eventToast,interaction:(()=>{if(hagoromoEvent)return hagoromoEvent.completed?{name:'Treinamento concluído',key:'E',description:'Concluir o treino e escolher uma ferramenta'}:null;if(sealing)return{name:`Mega Elite · ${sealing.target}`,key:sealing.phase==='ready'?'E':sealing.phase==='complete'?'Enter':undefined,description:sealing.phase==='ready'?'E sela · G recusa e deixa um drop':sealing.phase==='sealing'?'Concluindo o jutsu de selamento…':'Enter para continuar'};const fallen=closestFallenMega();if(fallen)return{name:fallen.candidate.target,key:'E',description:fallen.candidate.account?'E · selar e desbloquear o Shinobi na conta':'E · iniciar selamento do Mega Elite'};if(portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<3.2)return{name:portalTitle(portal.kind),key:'E',description:portal.kind==='exit'?'E · finalizar e receber '+bijuuReward+' Lamens':'E · atravessar portal'};/* Rodada 47/49/50 — emboscadas (ninjaBody/cursedShuriken), pergaminhos (kunai/shuriken) e morro de arroz (Ryu, Rodada 50) pedem E; apenas o drop do mega (sealDrop) coleta ao pisar (sem "E"). */const p=pickups.find(p=>p.active&&(p.kind==='cursedShuriken'||p.kind==='ninjaBody'||p.kind==='kunai'||p.kind==='shuriken'||p.kind==='ryu')&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<3.2);if(p)return{name:p.name,key:p===activeBody?undefined:'E',description:p===activeBody?'Derrote os ninjas da emboscada':p.kind==='ninjaBody'?'E · investigar · recompensa de 1 nível':p.kind==='ryu'?'E · colher morro de arroz · Ryu por zona/missão/sorte + ímã 10 s + chance de bolinho de cura':p.kind==='kunai'||p.kind==='shuriken'?`E · abrir recompensa · custo ${compactNumber(kunaiPrice())} Ryu`:'E · +8% dano total · atrai uma emboscada'};const e=events.find(e=>e.active&&Math.hypot(e.x-player.position.x,e.z-player.position.z)<3.6);return e?{name:e.name,key:e.altarTier===undefined?'E':undefined,description:e===zetsuEvent?'Clique no Zetsu ou aperte E para enfrentar a Akatsuki · 3 pergaminhos grátis':e.id==='guardian-seal'?`E · invocar o guardião agora · ~${compactNumber(guardianHpNow())} HP · ${Math.round(guardianDefense(elapsed,false,overtimeNow(),zone,shikamaruPlans)*100)}% de defesa`:e.id==='slot'?`E · abrir a roleta · giro ${compactNumber(slotPrice())} Ryu (×${String(ROULETTE_RULES.costGrowth).replace('.',',')} por giro e sobe com o tempo) · Sorte ${stats.luck}`:e.id==='shikamaru'?(shikamaruPlans>=GUARDIAN_RULES.shikamaruMaxPlans?`Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · limite atingido nesta zona`:`E · Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · +1 kunai ao derrotar o guardião`):e.altarTier!==undefined?'Fique no círculo para ativar o altar — a contagem já começa em cima (sem E)':'Aperte E para interagir'}:null;})(),pickups:pickups.filter(p=>weatherEvent?.id!=='mist'&&p.active&&p.discovered).map(p=>({kind:p.kind,x:p.x,z:p.z,id:p.id,name:p.name})),items:{...knownItems},pills:{...knownPills},pillQuality:{...pillQuality},skillLevels:{...skillLevels},choice:choiceData?{level:choiceLevel,cards:choiceData,sale:choiceLevel===0||choiceLevel===-9?saleValue():undefined,rerollCost:choiceLevel===-8?merchantRerollCost():undefined}:null,sealing:sealing?{...sealing}:null,enemies:mapEnemyDots(),events:mapMarkers(),route:mistHides(weatherEvent,elapsed)?null:routeView(),routeNotice:routeNotice?{text:routeNotice.text,kind:routeNotice.kind}:null,roulette:rouletteView(),totem:totem?{hp:Math.ceil(totem.hp),maxHp:Math.ceil(totem.maxHp||0),remaining:Math.max(0,TOTEM_RULES.end-elapsed)}:null,explored:mistHides(weatherEvent,elapsed)?[]:[...exploredCells.values()],player:{x:player.position.x,z:player.position.z,heading:Math.atan2(heading.x,-heading.z)},ping:currentPing,effects:effects.length,choices:{...uses,banning},weaponCost:kunaiPrice(),merchantRerollCost:merchantRerollCost(),tsunadeSpinCost:slotPrice(),permanent});snapshotTimer=.2;}
      const sliding=slideTime>0;
      const facing=sliding?dashHeading:heading;
      const walking=moving&&!defeated&&Boolean(moveHorizontal||moveVertical);
      const {back:viewBack,left:viewLeft,diagonal}=sliding||!walking
        ? movementFacing(facing.dot(v1),facing.dot(v2))
        : movementFacing(moveVertical,moveHorizontal);
      const zoomReadability=Math.max(1,64*zoom/(1.55*Math.max(1,renderer.domElement.clientHeight)));
      playerMotion.setBodyScale(zoomReadability*(familyOf(heroId)==='choji'&&activeSetups.some(setup=>setup.name==='Jutsu de Expansão')?1.48:1));
      playerMotion.update(pausedRef.current||choiceData||roulette||sealing?0:dt,walkingFloor,hp,stats.maxHp,walking,viewBack,viewLeft,level,jumpHeight,sliding,walking&&diagonal,1-jumpTime/jumpDuration,1-slideTime/slideDuration,sliding?Math.abs(facing.dot(v1))<.32:moveVertical===0&&moveHorizontal!==0);
      if(traversal.climbing){
        const side=traversal.facing.x*v2.x+traversal.facing.z*v2.z;
        player.material.rotation=side*.58;
      }
      const damageOptions={enabled:enabledRef.current&&currentSettings().damageFlash,hiddenEffects};
      if(damageVignette)damageVignette.style.opacity=String(vignetteOpacity(damageFlash,now,defeated?0:hp,stats.maxHp,damageOptions));
      if(damageImpact)damageImpact.style.opacity=String(impactOpacity(damageFlash,now,damageOptions));
      player.material.fog=false;
      player.material.depthTest=true;
      player.renderOrder=28;
      const playerOccluded=terrainOccludesActor(player.position.x,player.position.y,player.position.z,yaw,viewPitch,viewLength,terrainHeight);
      playerMotion.fitHealthBar(zoom/Math.max(1,renderer.domElement.clientHeight),!playerOccluded);
      if(sandCloud){sandCloud.visible=jumpHeight>0&&!defeated&&keys.has(' ')&&sandGlideLeft>0&&jumpTime<=jumpDuration*.5;sandCloud.position.set(player.position.x,player.position.y-player.scale.y*.5-.18,player.position.z);}
      sageAura.sprite.visible=enabledRef.current&&!hiddenEffects&&(sageModeActive()||heroId==='kabuto-sabio')&&!defeated;
      if(sageAura.sprite.visible){sageAura.sprite.position.copy(player.position);sageAura.sprite.position.y+=.43;sageAura.frame(Math.floor(animClock*9)%4);}
      setFocusView(focusView,camera.matrixWorld.elements);

      if(!hagoromoEvent&&mistHides(weatherEvent,elapsed)){
        // Rodada 96: todos os personagens aparecem a até ZABUZA_MIST.reveal m (antes só o Zabuza, a 5 m).
        const near=enemyList.filter(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<ZABUZA_MIST.reveal+ZABUZA_MIST.fade);
        for(const e of enemyList)if(e.boss)e.boss.bar.visible=near.includes(e);
        enemyRenderer.sync(near,enemyOpacity,dt);
      }else{
        for(const e of enemyList)if(e.boss)e.boss.bar.visible=true;
        enemyRenderer.sync(enemyList,enemyOpacity,dt);
      }const renderTime=performance.now()/1000;
      for(const event of events)if(event.obj.visible)event.actor?.update(elapsed,camera,false,player.position);
      if(teuchi.visible)teuchiActor.update(elapsed,camera,false,player.position);
      if(totem?.fixedArt){
        totem.fixedArt.root.visible=totem.sprite.visible;
        if(totem.sprite.visible)totem.fixedArt.update(elapsed,camera,totemCloneTimer<.24);
      }
      water.update(renderTime);civicScene?.update(renderTime);splashes.update(dt);landscape.setFogged(!!scene.fog);updateVillageLight(player.position.x,player.position.z);
      dropFrustum.setFromProjectionMatrix(dropProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      renderedDrops.length=0;
      for(const cell of drops.cells()){
        const x=cell.x*DROP_CELL_SIZE,z=cell.z*DROP_CELL_SIZE;
        dropBounds.min.set(x-1,cell.minY-1,z-1);
        dropBounds.max.set(x+DROP_CELL_SIZE+1,cell.maxY+2,z+DROP_CELL_SIZE+1);
        if(dropFrustum.intersectsBox(dropBounds))for(const drop of cell.entries)renderedDrops.push(drop);
      }
      for(const drop of drops.pulled())renderedDrops.push(drop);
      groundModels.update(renderedDrops,dropFrustum,enemyShots);
      hagoromoSeal.update(hagoromoPhase(),dt,hiddenEffects);
      const perfT1=performance.now();renderer.render(scene,camera);perfMonitor.record(perfT0,perfT1,performance.now());
    };
    // V-Sync (Gráficos): LIGADO = requestAnimationFrame (um quadro por quadro do monitor). DESLIGADO = spin loop acima da taxa do monitor
    // (melhor esforço no navegador — ele ainda pode limitar; no .exe a sincronização sai direto do motor).
    let spinTimer:number|null=null;
    const stopLoop=()=>{if(spinTimer!=null){clearTimeout(spinTimer);spinTimer=null;}};
    const startLoop=()=>{stopLoop();if(currentSettings().vsync){renderer.setAnimationLoop(frame);return;}renderer.setAnimationLoop(null);const spin=()=>{spinTimer=null;if(document.hidden){spinTimer=window.setTimeout(spin,500);return;}frame(performance.now());spinTimer=window.setTimeout(spin,0);};spin();};
    startLoop();
    const debugWindow=window as unknown as {__shinobiTest?:Record<string,unknown>};
    // ───── Salvar e retomar a run (Esc → "Salvar e sair", salvamento automático e ao fechar o navegador) ─────
    // Salva o progresso da run (tempo, abates, nível, itens, pílulas, técnicas, ajudantes, eventos, mapa explorado...).
    // Hordas, drops e projéteis vivos não são salvos: voltam a surgir naturalmente ao retomar.
    function serializeRun():SavedRun{return {eventDuel:duelId,mapLayout,villageSeed,surfaceElevation:traversal.elevation,hagoromo:{keys:hagoromo.keys,progress:hagoromo.progress,tools:[...hagoromo.tools]},rankTicket:getRankTicket?.(),killStreak:streak,powerlevel:{...powerlevel},v:1,heroId,mission,mapId,savedAt:Date.now(),elapsed,zone,level,xp,xpNext,kills,runMoney,kunai,shuriken,chakra,hp,bonusHp,totalDamage,allyDamage,skillDamage:{...skillDamage},knownItems:{...knownItems},knownPills:{...knownPills},pillQuality:{...pillQuality},skillLevels:{...skillLevels},growth:JSON.parse(JSON.stringify(growth)),allies:[...allies],allyAffinity:{...allyAffinity},runBuffs:{...runBuffs},uses:{...uses},banned:[...banned],events:events.map(e=>({id:e.id,active:e.active,uses:e.uses,discovered:!!e.discovered})),explored:[...exploredCells.keys()],ryuSpent,rouletteSpins,paidWeapons,guardianSpawned,shikamaruPlans,megaElitesSpawned,zoneDifficulty,xpMultiplier,lootMultiplier,totemSpawned,pendingItemRewards,defenseDone,player:{x:player.position.x,z:player.position.z},accountTried:[...accountTried],merchant:{...merchant,stock:[...merchant.stock],prices:[...merchant.prices]},rouletteItems:[...rouletteItems],rouletteSession:roulette,campaign:{openingMegaSpawned,akatsukiAmbush:akatsukiEnemies.size?[...akatsukiEnemies].map(e=>({id:e.heroId!,x:e.sprite.position.x,z:e.sprite.position.z,hp:e.hp,maxHp:e.maxHp!})):undefined,altarBlessing:pendingAltar&&choiceData&&choiceLevel===-10?{...pendingAltar,offers:choiceData}:undefined,fallenMegas:fallenMegas.map(({candidate,body})=>({heroId:candidate.heroId,x:body.position.x,z:body.position.z,account:candidate.account})),weatherEvent:weatherEvent?{...weatherEvent,...(()=>{const target=enemyList.find(e=>e.heroId===weatherEvent?.elite);return target?{x:target.sprite.position.x,z:target.sprite.position.z}:{};})()}:undefined,nextWeatherAt,weatherPlan,start:zoneStart,pendingLevels,sagesUsedZone,merges:[...merges.values()],megaSchedule:[...megaSchedule],accountEncounters,plans:plansUsed,arena,reward:bijuuReward,bijuu:defeatedBijuu,portal:portal?{kind:portal.kind,x:portal.x,z:portal.z}:undefined,boss:enemyList.filter(e=>e.bijuu).map(e=>({id:e.heroId!,hp:e.hp,maxHp:e.maxHp!,x:e.sprite.position.x,z:e.sprite.position.z,overtime:e.summonedOvertime}))[0],locations:events.map(e=>({id:e.id,x:e.x,z:e.z})),pickups:pickups.filter(p=>p.active).map(p=>({kind:p.kind,x:p.x,z:p.z,discovered:!!p.discovered}))}};}
    function saveRun(){if(defeated||victory)return;try{localStorage.setItem(SAVED_RUN_KEY,JSON.stringify(serializeRun()));}catch{/* sem armazenamento */}}
    function restoreRun(s:SavedRun){if(s.hagoromo){hagoromo.keys=s.hagoromo.keys;hagoromo.progress=s.hagoromo.progress;hagoromo.tools=[...s.hagoromo.tools];}Object.assign(powerlevel,readPowerlevel(s.powerlevel));elapsed=s.elapsed;streak=s.killStreak??{count:0,lastAt:0};zone=s.zone;const camp=s.campaign;weatherEvent=camp?.weatherEvent;nextWeatherAt=camp?.nextWeatherAt??elapsed+65;weatherPlan=camp?.weatherPlan??planZoneWeather(WEATHER_BY_MAP[mapId],elapsed);if(camp?.altarBlessing?.offers.length===3){const {tier,name,offers}=camp.altarBlessing;pendingAltar={tier,name};choiceLevel=-10;choiceData=offers;}pendingLevels=camp?.pendingLevels??0;sagesUsedZone=camp?.sagesUsedZone??(camp?.merges?.length?s.zone:0);zoneStart=camp?.start??Math.max(0,(zone-1)*200);for(const plan of camp?.merges??[]){let technique=mergedTechnique(plan,techniques)??(s.skillLevels['Fusão · '+plan.names.join(' / ')]?legacyFusion(plan,techniques):undefined);if(technique){const legacyName='Fusão · '+plan.names.join(' / ');if(plan.kind==='fuse'&&s.skillLevels[legacyName]&&technique.name!==legacyName){const [first,second]=plan.names.map(name=>techniques.find(t=>t.name===name)!);technique={...technique,name:legacyName,shape:'Área',status:first.status??second.status,statusChance:first.status?first.statusChance:second.statusChance,burn:first.burn||second.burn,poison:first.poison||second.poison};}techniques.push(technique);merges.set(technique.name,plan);plan.names.forEach(name=>consumedTechniques.add(name));}}megaSchedule=camp?.megaSchedule??megaSchedule;accountEncounters=camp?.accountEncounters??0;plansUsed=camp?.plans??s.shikamaruPlans;arena=camp?.arena??false;bijuuReward=camp?.reward??0;defeatedBijuu=camp?.bijuu??'';level=s.level;xp=s.xp;xpNext=s.xpNext;kills=s.kills;runMoney=s.runMoney;kunai=s.kunai;shuriken=s.shuriken;chakra=s.chakra;bonusHp=s.bonusHp;totalDamage=s.totalDamage;allyDamage=s.allyDamage;Object.assign(skillDamage,s.skillDamage);for(const [name,count] of Object.entries(s.knownItems)){const key=currentItemName(name);knownItems[key]=(knownItems[key]??0)+count;}Object.assign(knownPills,Object.fromEntries(Object.entries(s.knownPills).filter(([name,lv])=>PILL_BY_NAME[name]&&lv>0).sort((a,b)=>b[1]-a[1]).slice(0,PILL_SLOTS)));Object.assign(pillQuality,s.pillQuality??{});Object.assign(skillLevels,s.skillLevels);for(const t of techniques)if(merges.get(t.name)?.kind==='fuse'&&skillLevels[t.name]>techniqueLevelCap(t))skillLevels[t.name]=techniqueLevelCap(t);Object.assign(growth,s.growth);Object.assign(runBuffs,s.runBuffs);Object.assign(uses,s.uses);for(const b of s.banned)banned.add(b);
      for(const saved of s.events){const e=events.find(x=>x.id===saved.id);if(e){e.active=saved.active;e.uses=saved.uses;e.discovered=saved.discovered;e.obj.visible=saved.discovered;}}
      for(const key of s.explored){const [gx,gz]=key.split(',').map(Number);exploredCells.set(key,{x:gx*5,z:gz*5});}
      ryuSpent=s.ryuSpent;rouletteSpins=s.rouletteSpins;paidWeapons=s.paidWeapons;guardianSpawned=!!camp?.portal||arena;if(!guardianSpawned){const seal=events.find(e=>e.id==='guardian-seal');if(seal){seal.active=true;seal.discovered=true;seal.obj.visible=true;}}shikamaruPlans=s.shikamaruPlans;megaElitesSpawned=s.megaElitesSpawned;zoneDifficulty=s.zoneDifficulty;xpMultiplier=s.xpMultiplier;lootMultiplier=s.lootMultiplier;totemSpawned=s.totemSpawned;pendingItemRewards=s.pendingItemRewards;defenseDone=s.defenseDone;for(const id of s.accountTried)accountTried.add(id);
      if(s.merchant)Object.assign(merchant,{...s.merchant,stock:s.merchant.stock.map(name=>name===null?null:currentItemName(name))});
      rouletteItems.push(...(s.rouletteItems??[]).map(prize=>typeof prize==='string'?currentItemName(prize):prize));
      roulette=s.rouletteSession?{...s.rouletteSession,pending:s.rouletteSession.pending.map(prize=>prize.item?{...prize,item:currentItemName(prize.item)}:prize)}:null;rouletteSeq=roulette?.pending.at(-1)?.seq??0;
      for(const point of camp?.locations??[]){
        const e=events.find(event=>event.id===point.id);
        if(!e)continue;
        if(villageActive&&(!solids.isFree(point.x,point.z,.6,true)||waterSurfaceAt(MAP.id,point.x,point.z,waters)>-Infinity))continue;
        e.x=point.x;e.z=point.z;e.obj.position.set(e.x,standHeight(e.x,e.z)+e.groundOffset,e.z);
      }
      if(camp?.pickups){for(const p of pickups)scene.remove(p.mesh);pickups.length=0;for(const p of camp.pickups){spawnPickup(p.kind,p.x,p.z);pickups.at(-1)!.discovered=p.discovered||p.kind==='sealDrop';}}
      for(const entry of camp?.fallenMegas??[]){const shinobi=HERO_BY_ID[entry.heroId];if(shinobi)fallenMegas.push({candidate:{heroId:shinobi.id,target:shinobi.name,phase:'ready',account:entry.account},body:layFallenShinobi(shinobi.id,entry.x,entry.z,!!entry.account,level,true)});}
      if(camp?.portal)openPortal(camp.portal.kind,camp.portal.x,camp.portal.z,true);
      if(!arena&&camp?.akatsukiAmbush?.length){
        const restored=new Set<string>();
        for(const member of camp.akatsukiAmbush){
          if(!AKATSUKI_MEMBERS.includes(member.id)||restored.has(member.id)||!Number.isFinite(member.hp)||!Number.isFinite(member.maxHp)||member.hp<=0||!Number.isFinite(member.x)||!Number.isFinite(member.z))continue;
          restored.add(member.id);spawnAkatsukiMember(member);
        }
        if(restored.size){zetsuEvent.active=false;zetsuEvent.obj.visible=false;}
      }
      openingMegaSpawned=camp?.openingMegaSpawned??(s.zone>1||s.megaElitesSpawned>0||(camp?.fallenMegas?.some(mega=>!mega.account)??false));
      if(weatherEvent&&weatherEvent.until>elapsed&&!arena){const event=weatherEvent;const elite=spawnEnemy(false,true,false,event.elite,false,event.openingMega);event.openingMega=elite.openingMega;elite.sprite.position.set(event.x,standHeight(event.x,event.z)+elite.sprite.scale.y*.5,event.z);weather=WEATHER_EVENTS[event.id].name;}else weatherEvent=undefined;
      if(arena){
        openBijuuArena();
        player.position.set(s.player.x,standHeight(s.player.x,s.player.z)+player.scale.y*.5,s.player.z);
        if(camp?.boss&&BIJUU_BY_ID[camp.boss.id])spawnBijuu(camp.boss.id,camp.boss);
        else if(!portal&&!defeatedBijuu)spawnBijuu();
      }else placeTeuchi();
      refreshStats();for(const id of s.allies)recruitAlly(id);Object.assign(allyAffinity,s.allyAffinity);refreshStats();hp=Math.min(stats.maxHp,s.hp);if(!roulette)showRouletteItem();
      player.position.set(s.player.x,standHeight(s.player.x,s.player.z)+player.scale.y*.5,s.player.z);player.material.dispose();player.material=heroMaterial(heroId,level);invulnerability=3;
      walkingFloor=standHeight(player.position.x,player.position.z);
      if(villageActive){
        traversal.restore(player.position,s.surfaceElevation,walkingFloor);
        walkingFloor=traversal.elevation??walkingFloor;
        if(solids.resolve(player.position,COLLISION_RULES.playerRadius,walkingFloor)){
          walkingFloor=standHeight(player.position.x,player.position.z);
          traversal.restore(player.position,undefined,walkingFloor);
        }
        player.position.y=walkingFloor+player.scale.y*.5;
      }
      eventToast='Missão retomada de onde parou.';}
    if(resume&&resume.heroId===heroId)restoreRun(resume);
    let configuredZoom=currentSettings().cameraDistance,configuredFx=currentSettings().hideMyAttacks;
    const onSettings=()=>{const S=currentSettings();
      if(S.gpu!==activeGpu){
        activeGpu=S.gpu;
        const old=renderer;
        old.setAnimationLoop(null);stopLoop();
        renderer=createRenderer();shadowSize=-1;
        container.replaceChild(renderer.domElement,old.domElement);
        old.dispose();
        try{old.forceContextLoss();}catch{/* contexto já perdido */}
      }
      renderer.setPixelRatio(pixelRatioFor(S));
      if(S.cameraDistance!==configuredZoom){configuredZoom=S.cameraDistance;targetZoom=S.cameraDistance;}
      if(configuredFx!==S.hideMyAttacks){configuredFx=S.hideMyAttacks;setHiddenEffects(configuredFx);}
      startLoop();
      resize();
    };window.addEventListener('shinobi-settings',onSettings);runCleanups.push(()=>window.removeEventListener('shinobi-settings',onSettings));
    const autosave=window.setInterval(()=>{if(enabledRef.current&&!pausedRef.current)saveRun();},15000);
    const onPageHide=()=>saveRun();window.addEventListener('pagehide',onPageHide);window.addEventListener('beforeunload',onPageHide);
    const onSaveEvent=()=>saveRun();window.addEventListener('shinobi-save',onSaveEvent);
    const onForfeit=()=>{if(defeated||victory)return;hp=0;defeated=true;eventToast='Você desistiu da missão.';};window.addEventListener('shinobi-forfeit',onForfeit);
    const onStuck=()=>{traversal.reset();const len=Math.hypot(player.position.x,player.position.z)||1,step=Math.min(8,len);player.position.x-=player.position.x/len*step;player.position.z-=player.position.z/len*step;player.position.y=standHeight(player.position.x,player.position.z)+player.scale.y*.5;invulnerability=Math.max(invulnerability,2);eventToast='Preso? Você foi movido para uma área livre.';};window.addEventListener('shinobi-stuck',onStuck);
    runCleanups.push(()=>{window.clearInterval(autosave);window.removeEventListener('pagehide',onPageHide);window.removeEventListener('beforeunload',onPageHide);window.removeEventListener('shinobi-save',onSaveEvent);window.removeEventListener('shinobi-forfeit',onForfeit);window.removeEventListener('shinobi-stuck',onStuck);});    if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test'))debugWindow.__shinobiTest={
      finishMission:()=>{victory=true;snapshotTimer=0;eventToast='Missão concluída!';return victory;},
      dropShowcase:()=>{const p=player.position;const list:[Drop['type'],number][]=[['xp',8],['xp',25],['xp',100],['chakra',9],['ryu',3],['onigiri',RAMEN_DROP.heal],['pill',1],['item',1]];list.forEach(([type,value],n)=>{const at=new THREE.Vector3(p.x-5.6+n*1.6,0,p.z+3.2);addDrop(at,type,value,type==='pill'?Object.keys(knownPills)[0]||'':'');});return drops.size;},
      healingDrop:()=>addDrop(player.position,'onigiri',RAMEN_DROP.heal),
      drops:()=>Array.from(drops.all(),d=>({type:d.type,value:d.value,scale:+d.mesh.scale.y.toFixed(2)})),
      forceWeather:(id:WeatherEventId)=>startWeather(id),
      altarBlessing:(tier:number)=>openAltarBlessing(tier,'Altar de teste'),
      grantItem,spawn:(id:string)=>spawnEnemy(false,true,false,id),spawnMega:(id:string)=>spawnEnemy(false,true,false,versionForEncounter(familyOf(id),zone,mission)).heroId,defeatMega:(id:string,distance=5)=>{const e=spawnEnemy(false,true,false,versionForEncounter(familyOf(id),zone,mission));e.sprite.position.x=player.position.x+distance;e.sprite.position.z=player.position.z;removeEnemy(e);},
      reward:()=>{choiceLevel=level;const cards=rollLevelOffers();choiceData=cards.length?cards:null;},kakashi:()=>{openKakashi(events.find(e=>e.id==='arsenal')!);return choiceLevel;},kakashiActive:()=>events.find(e=>e.id==='arsenal')!.active,arsenal:()=>{openKakashi(events.find(e=>e.id==='arsenal')!);return choiceLevel;},accountShinobi:(id:string)=>{const e=spawnEnemy(false,false,false,id,true);e.speed=0;return {tier:e.tier,hp:e.maxHp,defense:e.defense};},spawnElite:()=>{forceElite=true;const e=spawnEnemy();forceElite=false;const a=Math.random()*6.28;e.sprite.position.set(player.position.x+Math.cos(a)*5,e.sprite.position.y,player.position.z+Math.sin(a)*5);e.speed=0;return {tier:e.tier,hp:e.maxHp,defense:e.defense,dmg:e.dmgMult};},enemyTiers:()=>enemyList.map(e=>({tier:e.tier,account:!!e.account,hp:Math.round(e.hp)})),killAll:()=>{for(const e of [...enemyList])if(!e.totem)takeDamage(e,1e9,'#fff');},ichiraku:()=>{openIchiraku();return choiceLevel;},teuchi:()=>({visible:teuchi.visible,offset:teuchi.position.distanceTo(ichiraku.obj.position),x:ichiraku.x,z:ichiraku.z}),grantPill:(name:string)=>{grantPill(knownPills,name,ex('pillCap'));refreshStats(true);},loot:()=>{choiceLevel=0;choiceData=rollMegaLoot();},
      setLevel:(n:number)=>{level=n;player.material.dispose();player.material=heroMaterial(heroId,n);refreshStats(true);},
      clearDrops:()=>{drops.clear();},clearPickups:()=>{for(const p of pickups)scene.remove(p.mesh);pickups.length=0;activeBody=undefined;},
      learn:(name:string)=>{skillLevels[name]=1;},clearEnemies:()=>{for(const e of [...enemyList]){scene.remove(e.sprite);if(e.marker)scene.remove(e.marker);bossCombat.dispose(e);}enemyList.length=0;},
      setTime:(n:number)=>{elapsed=n;},
      // Perfil de desempenho: horda de N inimigos comuns num disco ao redor do jogador (HP alto para sobreviverem aos golpes) e leitura do quadro.
      horde:(n:number,radius=14,hpEach=1e6,move=true)=>{for(let k=0;k<n;k++){const e=spawnEnemy(),a=Math.random()*Math.PI*2,r=2+Math.sqrt(Math.random())*radius,x=player.position.x+Math.cos(a)*r,z=player.position.z+Math.sin(a)*r;e.sprite.position.set(x,standHeight(x,z)+e.sprite.scale.y*.46,z);e.hp=hpEach;e.maxHp=hpEach;if(!move)e.speed=0;}return enemyList.length;},
      perf:(reset=false)=>{const out={...perfMonitor.read(),fpsHud:fps,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs?.length??0,sceneChildren:scene.children.length,instances:enemyRenderer.stats(),numberCache:damageNumbers.stats(),elites:enemyList.filter(e=>e.elite).length,enemies:enemyList.length,effects:effects.length,visuals:visuals.length,particles:particles.stats(),susanoo:susanoo.active(),numbers:numbers.length,drops:drops.size,shots:shots.length,heap:(performance as unknown as {memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize??0};if(reset)perfMonitor.reset();return out;},
      teleport:(x:number,z:number)=>{player.position.set(x,standHeight(x,z)+player.scale.y*.5,z);},
      setMoney:(n:number)=>{runMoney=n;},pickup:(kind:MapPickup['kind'])=>spawnPickup(kind,player.position.x,player.position.z),bodyAmbush:()=>{const wave=enemyList.filter(e=>e.bodyAmbush===activeBody&&activeBody);return wave.length;},defeatBodyAmbush:()=>{for(const e of [...enemyList])if(activeBody&&e.bodyAmbush===activeBody)removeEnemy(e);},dismiss:()=>{choiceData=null;sealing=null;xp=0;},
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
      // Caça-Níquel da Tsunade: abrir, girar N vezes sem animação (semente/casa forçada), estado, sair, simulação estatística.
      sageAuraVisible:()=>sageAura.sprite.visible,
      sages:()=>{openSages();return choiceData?.length??0;},
      cloneMotion:()=>shadowClones.map(clone=>clone.motion.state()),
      gamabuntaPhase:()=>visuals.find(effect=>effect.object.userData.gamabuntaPhase)?.object.userData.gamabuntaPhase,
      totemMotion:()=>({sign:!!totem?.fixedArt?.sealing(),clones:enemyList.filter(e=>e.clone).map(e=>({pose:e.motion?.state(),distance:Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)}))}),
      spawnRanged:()=>{const enemy=spawnEnemy();enemy.ranged=2;enemy.speed=0;enemy.sprite.position.copy(player.position).add(new THREE.Vector3(5,0,0));return enemy.hp;},
      rangedState:()=>({foes:enemyList.filter(e=>e.ranged!==undefined).length,shots:enemyShots.length}),
      enemyFrames:()=>enemyList.filter(e=>enemyRenderer.isBatched(e.sprite)).map(e=>e.sprite.userData.frame as number),
      supportMotion:()=>[...allyMotions.values()].map(motion=>({pose:motion.state(),atlas:motion.atlas()})),
      // Rodada 55 — caminhada de todos os atores (fileira 0 frente / 1 costas, espelho, quadro) e corpo caído.
      setYaw:(n:number)=>{yaw=targetYaw=n;v1.set(-Math.sin(yaw),0,-Math.cos(yaw));v2.set(Math.cos(yaw),0,-Math.sin(yaw));},
      actorMotion:()=>({yaw,player:playerMotion.debug(),allies:[...allyMotions.entries()].map(([s,m])=>({x:s.position.x,z:s.position.z,...m.debug()})),kuri:kuriMotion?.debug(),
        megas:enemyList.filter(e=>e.motion&&!e.clone).map(e=>({id:e.heroId,x:e.sprite.position.x,z:e.sprite.position.z,...e.motion!.debug()})),
        enemies:enemyList.filter(e=>enemyRenderer.isBatched(e.sprite)).map(e=>({frame:e.sprite.userData.frame as number,back:!!e.sprite.userData.back,flip:!!e.sprite.userData.flipped,x:e.sprite.position.x,z:e.sprite.position.z})),
        bijuu:enemyList.filter(e=>e.bijuu).map(e=>({id:e.heroId,pose:e.boss?.pose,flip:e.boss?.flip,x:e.sprite.position.x,z:e.sprite.position.z})),
        clones:shadowClones.map(c=>c.motion.debug())}),
      fallen:()=>fallenMegas.map(f=>({heroId:f.candidate.heroId,account:!!f.candidate.account,...f.body.debug()})),
      defeatAccount:(id:string,distance=5)=>{const e=spawnEnemy(false,true,false,id,true);e.sprite.position.x=player.position.x+distance;e.sprite.position.z=player.position.z;removeEnemy(e);},
      renderSettings:()=>({resolution:renderer.getPixelRatio(),zoom,alphaTest:player.material.alphaTest,filter:player.material.map?.minFilter,barWidth:playerMotion.healthBarWidth()}),
      motion:()=>({pose:playerMotion.state(),atlas:playerMotion.atlas(),anim:playerMotion.debug(),flipped:(player.material.map?.repeat.x??1)<0,jumpHeight,slideTime,slideRecovery,x:player.position.x,z:player.position.z,cameraHeight:cameraTarget.y,pitch,viewPitch:cameraViewPitch,cameraFar:camera.far,yaw,zoom}),
      // Rodada 55: compara o ângulo efetivo do scan antigo (pés visíveis + trava de altura) com o atual, no ponto/yaw atuais.
      cameraScan:(p=CAMERA_MIN_PITCH)=>{const ox=Math.sin(yaw),oz=Math.cos(yaw),ground=terrainHeight(player.position.x,player.position.z),scan=Math.min(140,(zoom*.5+4)/Math.sin(p));let old=Math.max(p,.05);const now=p;for(let d=5;d<=scan;d+=3){const s=terrainHeight(player.position.x+ox*d,player.position.z+oz*d);old=Math.max(old,Math.atan2(s-ground-.05,d));}const orbit=zoom*1.65+10,cx=player.position.x+ox*Math.cos(old)*orbit,cz=player.position.z+oz*Math.cos(old)*orbit,cy=Math.max(ground+1.15+Math.sin(old)*orbit,terrainHeight(cx,cz)+1.2);old=Math.atan2(cy-ground-1.15,Math.cos(old)*orbit);const profile:number[]=[];for(let d=0;d<=30;d+=2)profile.push(+(terrainHeight(player.position.x+ox*d,player.position.z+oz*d)-ground).toFixed(2));return{old,now,profile,playerY:player.position.y-ground,areas:areas.stats()};},
      campaign:()=>({zone,zoneElapsed:zoneElapsed(),arena,portal:portal?.kind,plansUsed,bijuuReward,beast:enemyList.find(e=>e.bijuu)?.heroId,events:events.map(e=>({id:e.id,x:e.x,z:e.z})),ryu:pickups.filter(p=>p.active&&p.kind==='ryu').length}),
      enterPortal:()=>enterPortal(),
      bossArt:(id:string)=>{
        const beast=enemyList.find(e=>e.bijuu&&e.heroId===id)??spawnBijuu(id);
        const art=beast.sprite.material.map?.image as HTMLImageElement|undefined;
        return art?.naturalWidth?art.src:'';
      },
      merchant:()=>showMerchant(),
      merchantState:()=>({...merchant,stock:[...merchant.stock],prices:[...merchant.prices],rerollCost:merchantRerollCost()}),
      roulette:{
        open:()=>openRoulette(),
        seed:(n:number|null)=>{rouletteRng=n==null?Math.random:seededRng(n);},
        spin:(n=1,forced?:SlotComboId)=>{const out:unknown[]=[];for(let i=0;i<n;i++){const r=spinRoulette(forced);out.push(r.ok?r.prize:r.reason);if(!r.ok)break;}return out;},
        state:()=>({open:!!roulette,view:rouletteView(),cost:slotPrice(),spins:rouletteSpins,ryuSpent,runMoney,kunai,shuriken,pendingItemRewards,luck:stats.luck,zoneDifficulty,zone,damage:stats.damage,setups:activeSetups.map(s=>({name:s.name,remaining:s.remaining,bonuses:{...s.bonuses}})),pills:{...knownPills},enemies:enemyList.length,choice:!!choiceData,toast:eventToast}),
        exit:()=>closeRoulette(),
        sim:(luck:number,pressure:number,n=20000,seed=1)=>{const w=rouletteWeights(luck,pressure),rng=seededRng(seed),count:Record<string,number>={};for(let i=0;i<n;i++){const id=rollRoulette(w,rng);count[id]=(count[id]||0)+1;}let good=0,bad=0;for(const [id,c] of Object.entries(count)){const k=ROULETTE_BY_ID[id as SlotComboId].kind;if(k==='bom')good+=c;else if(k==='ruim')bad+=c;}return{weights:w,count,good:good/n,bad:bad/n};},
        setCurse:(v:number)=>{zoneDifficulty=v;},setZone:(z:number)=>{zone=z;},
      },
      // Ebisu / Iruka / Naruto Totem.
      ebisu:()=>{openEbisu(events.find(e=>e.id==='ebisu')!);return choiceLevel;},iruka:()=>{openIruka(events.find(e=>e.id==='iruka')!);return choiceLevel;},
      npcState:()=>({choiceLevel,choice:choiceData,deals:npcDeals.map(d=>({...d})),runBuffs:{...runBuffs},extra:{...stats.extra},allies:[...allies],slots:stats.supportSlots,xpGain:stats.xpGain,ebisuActive:events.find(e=>e.id==='ebisu')!.active,irukaActive:events.find(e=>e.id==='iruka')!.active}),
      // Aliados/afinidade/substituição (testes do navegador).
      recruit:(id:string)=>recruitAlly(id),affinity:()=>({...allyAffinity}),addAffinity:(id:string,n:number)=>{gainAffinity(id,n);refreshStats();return allyAffinity[id];},
      replaceState:()=>({choiceLevel:choiceData?choiceLevel:null,candidate:replaceCandidate,allies:[...allies],affinity:{...allyAffinity},sealing:sealing?{...sealing}:null,pending:pendingSeals.length,cards:choiceData?.map(c=>({name:c.name,allyId:c.allyId,allyNew:c.allyNew})),synergies:activeSynergies(heroId,allies).map(s=>({id:s.id,tier:s.tier,members:s.members,bonuses:s.bonuses})),projectiles:stats.projectiles,projectileChance:stats.projectileChance,xpGain:stats.xpGain,pickup:stats.pickup,damage:stats.damage,toast:eventToast}),
      fillAllies:(n:number)=>{const ids=HEROES.filter(h=>h.family===h.id).map(h=>versionForEncounter(h.id,zone,mission)).filter(id=>familyOf(id)!==familyOf(heroId)&&!hasAllyFamily(id));for(let k=0;k<n&&ids.length;k++)recruitAlly(ids.shift()!);return allies.length;},
      totem:()=>({spawned:totemSpawned,alive:!!totem,hp:totem?.hp??0,maxHp:totem?.maxHp??0,discovered:totemDiscovered,result:totemResult,clones:enemyList.filter(e=>e.clone).length,enemies:enemyList.length,pendingLevels,level,xp,xpNext,elapsed,kills,sealing,choiceLevel:choiceData?choiceLevel:null,drops:Array.from(drops.all()).filter(d=>d.type==='xp').length,mapEvent:totemDiscovered&&!!totem}),
      damageTotem:(n:number)=>{if(totem)takeDamage(totem,n,'#ffffff');return totem?.hp??0;},
      killClones:(n=999)=>{let k=0;for(const e of enemyList.filter(e=>e.clone).slice(0,n)){takeDamage(e,1e9,'#ffffff');k++;}return k;},
      collectDrops:()=>{for(const d of drops.all()){if(!d.magnet)pullDrop(d);d.mesh.position.set(player.position.x,d.mesh.position.y,player.position.z);}},
      // Mapa/rota: definir rota por id de marcador, ping livre, inspecionar distância, revelar/consumir eventos e teleportar perto.
      mapRoute:{
        set:(id:string|null)=>setRoute(id),ping:(x:number,z:number)=>{setPingRoute(x,z);return routeView();},clear:()=>setRoute(null),
        state:()=>({route:routeView(),notice:routeNotice?{text:routeNotice.text,kind:routeNotice.kind}:null,ping:currentPing,player:{x:player.position.x,z:player.position.z},markers:mapMarkers().map(m=>m.id),toast:eventToast}),
        discover:(id?:string)=>{let n=0;for(const e of events)if(!id||e.id===id){e.discovered=true;e.obj.visible=true;if(e===ichiraku)placeTeuchi();n++;}return n;},
        discovered:()=>events.filter(e=>e.discovered).map(e=>e.id),
        consume:(id:string)=>{const e=events.find(e=>e.id===id);if(e)e.active=false;return !!e;},
        near:(id:string,d=6)=>{const t=findRouteTarget(id)??events.find(e=>e.id===id);if(!t)return null;const x=THREE.MathUtils.clamp(t.x+d,-WORLD_LIMIT,WORLD_LIMIT),z=t.z;player.position.set(x,standHeight(x,z)+player.scale.y*.5,z);return routeDistance(t);},
        step:(dx:number,dz:number)=>{const x=THREE.MathUtils.clamp(player.position.x+dx,-WORLD_LIMIT,WORLD_LIMIT),z=THREE.MathUtils.clamp(player.position.z+dz,-WORLD_LIMIT,WORLD_LIMIT);player.position.set(x,standHeight(x,z)+player.scale.y*.5,z);return route?routeDistance(route):null;},
        god:(on=true)=>{debugState.god=on;},
        megaSeen:(id:string,x?:number,z?:number)=>{const e=spawnEnemy(false,true,false,id);e.seen=true;e.speed=0;e.control='Paralisar';e.controlTime=1e9;if(x!==undefined&&z!==undefined)e.sprite.position.set(x,terrainHeight(x,z)+1.6,z);return 'mega-'+e.uid;},
        kill:(markerId:string)=>{const e=enemyList.find(e=>'mega-'+e.uid===markerId);if(!e)return false;removeEnemy(e);sealing=null;pendingSeals.length=0;return true;},
      },
      inspect:()=>({skillDamage:{...skillDamage},kunaiPrice:kunaiPrice(),defeated,pills:{...knownPills},hp,chakra,autoUlt,player:{x:player.position.x,z:player.position.z},atlasReady:!!(player.material.map?.image as HTMLImageElement)?.width,visibleShots:shots.filter(s=>s.mesh.visible).length,impacts:hiddenEffects?0:particles.stats().recentImpacts,visibleNumbers:numbers.filter(n=>n.sprite.visible).length,heroId,level,form:formAt(heroId,level).name,hiddenEffects,totalDamage,stats,allies,synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),skills:{...skillLevels},growth:{...growth},enemies:enemyList.map(e=>({maxHp:e.boss?.maxHp,casting:e.boss?.cast?.technique.name,bar:!!e.boss?.bar.parent,hp:e.hp,heroId:e.heroId,control:e.control,controlTime:e.controlTime})),items:{...knownItems},uses:{...uses},paidWeapons,runMoney,choice:choiceData,sealing,elapsed}),
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
    return()=>{beacons.forEach(beacon=>beacon.dispose());beacons.clear();while(fallenMegas.length)removeFallenMega(fallenMegas[0]);shadowClones.forEach(disposeShadowClone);playerMotion.dispose();allyMotions.forEach(motion=>motion.dispose());kuriSprite?.removeFromParent();kuriSprite?.material.dispose();kuriMotion?.dispose();for(const enemy of hagoromoEvent?.outsideEnemies??[]){bossCombat.dispose(enemy);disposeEnemySprite(enemy);}enemyList.forEach(enemy=>{bossCombat.dispose(enemy);enemy.motion?.dispose();});runCleanups.forEach(fn=>fn());debugApiRef.current=null;delete debugWindow.__shinobiTest;environmentMaps.forEach(t=>t.dispose());heroTextures.forEach(t=>t.dispose()); damageNumbers.dispose();enemyRenderer.dispose();observer.disconnect();stopLoop();renderer.setAnimationLoop(null);renderer.dispose();window.removeEventListener('shinobi-ping',onPing);window.removeEventListener('shinobi-route',onRoute);window.removeEventListener('shinobi-choose',onChoose);window.removeEventListener('shinobi-roulette',onRoulette);window.removeEventListener('shinobi-youth',onYouth);window.removeEventListener('shinobi-toggle-auto-ult',onToggleAuto);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);container.removeEventListener('pointerdown',onDown);container.removeEventListener('pointermove',onMove);container.removeEventListener('pointerup',onUp);container.removeEventListener('pointercancel',resetPointer);container.removeEventListener('pointerleave',resetPointer);container.removeEventListener('contextmenu',onContext);container.removeEventListener('wheel',onWheel);scene.traverse(o=>{if(o.userData.worldDropModel)return;if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}});groundLook.dispose();sky.texture.dispose();texture.dispose();orochimaruTexture.dispose();container.removeChild(renderer.domElement);};
  }, [heroId,mission,mapId]);
  return <><div className={`scene${enabled&&!paused&&!debugOpen?' scene-live':''}`} ref={host} aria-label="Cena 3D isométrica do ShinobiBonk"><div className="player-damage-vignette" aria-hidden="true" /><div className="player-damage-impact" aria-hidden="true" /></div>{debug&&enabled&&<DebugPanel getApi={getDebugApi} open={debugOpen} setOpen={setDebugOpen}/>}</>;
}


