import { compactNumber } from './game/format';
import { PILL_NAMES, PILL_SLOTS, pillEffectText } from './game/pills';
import { pillForgetPreview, pillLevelsGained, pillStatPreview, pillStatText } from './game/pillPreview';
import { PillStatPreview } from './ui/PillStatPreview';
import { recordLocalRun, type LocalRank } from './game/ranking';
import { MissionCard } from './ui/MissionCard';
import { EnemyDots } from './ui/EnemyDots';
import { MapSelect } from './ui/MapSelect';
import { SettingsScreen } from './ui/SettingsScreen';
import { BuffText } from './ui/BuffText';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { captureGamePointer, GameCanvas, emptySnapshot, type WorldSnapshot } from './scene/GameCanvas';
import './style.css';
import './sealing.css';
import './run-ui.css';
import './hud-dock.css';
import { ITEMS as items, ITEM_BY_NAME, availableItems } from './game/catalog';
import { ItemIcon, HeroPortrait, RunSheet, RunSheetButton } from './ui/RunSheet';
import { InventoryCorner } from './ui/InventoryCorner';
import { RunSummary } from './ui/RunSummary';
import { SkillIcon } from './ui/SkillIcon';
import { PoolFilters,EMPTY_FILTERS,matchesSearch } from './ui/PoolFilters';

import { calculateStats } from './game/progression';
import { HEROES as heroes, HERO_BY_ID, techniquePool, skillArchiveLimit, isProjectileUltimate, SHARED_TECHNIQUES, familyOf } from './game/heroes';
import { SAVED_RUN_KEY, type SavedRun } from './scene/GameCanvas';
import { sealedHeroes, isHeroPlayable, isDifficultyUnlocked, markMapCompleted } from './game/account';
import { MAP_BY_ID, type MapId } from './game/maps';
import './maps.css';
import { formAt } from './game/evolution';
import { affectedTechniquesText, itemSchools, itemElement, itemAttribute, techniqueDetail, NO_GROWTH } from './game/combat';
import { PASSIVES, PASSIVE_SECTIONS, passiveCost, homeCapacity, prioritySlots, jiraiyaSlots, NEW_ADMIN, purchase, migratePermanentLevels, type AdminWallet } from './game/preparation';
import { readPresets, savePresets, addPreset, duplicatePreset, removePreset, migrateBagPresets, PRIORITY_KEY, type BagPresets } from './game/missionBag';
import { BuildPlanner, MissionTactics, type MissionTactic } from './ui/BuildPlanner';
import { ArsenalControls, type ArsenalControlsProps } from './ui/ArsenalControls';
import { MissionBag, HubHud, CompactItemCard } from './ui/MissionBag';
import './mission-bag.css';
import './mission-planner.css';
import { playYooo, preloadYooo } from './audio/sfx';
// Rodada 42 — trilha sonora (OST de Naruto, 15 faixas do usuário): boot, menus, run, bijū e derrota.
import { startBoot, startRun, playMenu, playDefeat } from './audio/music';
import { runLamens, type LamenReward } from './game/rewards';
import { ItemTradeDialog, tradeAction } from './ui/ItemTradeDialog';
import { TsunadeRoulette } from './ui/TsunadeRoulette';
import { AllyCards, AllyReplaceChoice } from './ui/AllyCards';
import { readSettings, saveSettings, type GameSettings } from './game/settings';
import { MapPanel, MapPlayerIcon, MinimapMarkers, RouteHud } from './ui/MapOverlay';
import { CharacterSelect, CharacterTags } from './ui/CharacterSelect';
import './character-select.css';
import './hud-layout.css';
import { readLocalProfile } from './game/localProfile';
import { SagesWorkshop } from './ui/SagesWorkshop';
import { LocalAccountDialog } from './ui/LocalAccountDialog';
// Tema ninja da HUD (pergaminho, madeira, selo, pincel): importado por último para prevalecer sobre as folhas antigas.
import './ninja-theme.css';

type Difficulty = 'Genin' | 'Chunin' | 'Jonin' | 'Kage';
type Page = 'home' | 'characters' | 'attacks' | 'build' | 'passives' | 'items' | 'bag' | 'archive' | 'tactics' | 'missions' | 'game' | 'preview';
function readJson<T,>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function readByHero<T>(key: string, heroId: string, fallback: T): T {
  return readJson<Record<string,T>>(key,{})?.[heroId]??fallback;
}
function migrateLegacyPlan(heroId:string){
  const keys=[
    ['sb_home_by_hero_v1','sb_archived_items'],
    ['sb_planned_by_hero_v1','sb_planned_attacks'],
    ['sb_priority_by_hero_v1',PRIORITY_KEY],
    ['sb_archived_skills_by_hero','sb_archived_skills'],
  ];
  try {
    if(localStorage.getItem('sb_legacy_plan_imported_v1'))return;
    for(const [key,legacy] of keys){
      const value=readJson<unknown>(legacy,undefined);
      if(value!==undefined&&readByHero(key,heroId,undefined)===undefined)writeByHero(key,heroId,value);
    }
    localStorage.setItem('sb_legacy_plan_imported_v1','1');
  } catch { /* armazenamento indisponível */ }
}
function writeByHero<T>(key: string, heroId: string, value: T) {
  try {
    const raw = localStorage.getItem(key);
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj[heroId] = value;
    localStorage.setItem(key, JSON.stringify(obj));
  } catch { /* armazenamento indisponível: segue só em memória */ }
}
function SkillTimer({timer}:{timer?:{remaining:number;total:number;duration:number}}){
  if(!timer||(timer.remaining<=.05&&timer.duration<=0))return null;
  return <span className="skill-timer" title={timer.duration>0?'Duração restante do efeito':'Recarga da técnica'}>{timer.duration>0?<b className="skill-duration">{timer.duration.toFixed(1)}s</b>:timer.remaining>.05?<b>{timer.remaining.toFixed(1)}s</b>:null}<i style={{width:Math.min(100,100*timer.remaining/Math.max(.1,timer.total))+'%'}}/></span>;
}
function App() {
  const [world, setWorld] = useState<WorldSnapshot>(emptySnapshot);
  const [runId,setRunId]=useState(0);
  const [itemFilters,setItemFilters]=useState({...EMPTY_FILTERS}),[attackFilters,setAttackFilters]=useState({...EMPTY_FILTERS});

  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const [gamePanel, setGamePanel] = useState<'map' | 'quickmap' | 'sheet' | 'pause' | null>(null);
  // Run salva (Esc → Salvar e sair / salvamento automático): oferecida no hub para continuar de onde parou.
  const [resumeRun, setResumeRun] = useState<SavedRun|null>(null);
  const savedRun = (() => { try { const raw = localStorage.getItem(SAVED_RUN_KEY); return raw ? JSON.parse(raw) as SavedRun : null; } catch { return null; } })();
  const clearSavedRun = () => { try { localStorage.removeItem(SAVED_RUN_KEY); } catch { /* sem armazenamento */ } };
  const [page, setPage] = useState<Page>('home');
  const [modal, setModal] = useState(false);
  const [confirmReset,setConfirmReset]=useState(false);
  // Configurações locais (src/game/settings.ts): GameCanvas lê o valor salvo no momento do selamento.
  const [settings, setSettings] = useState<GameSettings>(readSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const updateSettings = (patch: Partial<GameSettings>) => { const next = { ...settings, ...patch }; setSettings(next); saveSettings(next); };
  const [profile, setProfile] = useState(readLocalProfile);
  // Modo debug (F9) sem login: disponível só ao rodar localmente com o servidor de desenvolvimento (pnpm dev / ABRIR_JOGO.bat).
  const debugEnabled = import.meta.env.DEV;
  const [heroId, setHeroId] = useState(() => {
    const stored=localStorage.getItem('sb_hero')??'naruto';
    const id=HERO_BY_ID[stored]?stored:'naruto';
    migrateLegacyPlan(id);
    migrateBagPresets(id);
    return id;
  });
  const [mission, setMission] = useState<Difficulty>('Genin');
  // Mapa da missão (4 mapas temáticos) e progresso da conta (Chunin libera ao vencer Genin daquele mapa, etc.).
  const [mapId, setMapIdState] = useState<MapId>(() => { try { const saved = localStorage.getItem('sb_map') as MapId | null; return saved && MAP_BY_ID[saved] ? saved : 'folha'; } catch { return 'folha'; } });
  const [, setAccountTick] = useState(0);
  useEffect(() => { const on = () => setAccountTick((n) => n + 1); window.addEventListener('shinobi-account', on); return () => window.removeEventListener('shinobi-account', on); }, []);
  // Rodada 42 — música: ao abrir o jogo toca SEMPRE "I'll Do It Right" (boot; ao terminar → menus). Nas trocas de
  // página fora do jogo, pool de menus aleatório. A run entra por startRun() em beginMission/"continuar missão".
  useEffect(() => {
    const onBlocked = (event: Event) => setMusicBlocked(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('shinobi-music-blocked', onBlocked);
    return () => window.removeEventListener('shinobi-music-blocked', onBlocked);
  }, []);
  const musicBooted = useRef(false);
  useEffect(() => {
    if (!musicBooted.current) { musicBooted.current = true; startBoot(); preloadYooo(); return; }
    if (page !== 'game') playMenu();
  }, [page]);
  const setMapId = (id: MapId) => { setMapIdState(id); try { localStorage.setItem('sb_map', id); } catch { /* sem armazenamento */ } if (!isDifficultyUnlocked(id, mission)) setMission('Genin'); };
  const [wallet,setWallet]=useState<AdminWallet>(()=>{const saved=readJson<AdminWallet|null>('sb_admin_wallet_v1',null);if(saved&&Number.isFinite(saved.balance)&&Number.isFinite(saved.spent))return saved;localStorage.setItem('sb_admin_wallet_v1',JSON.stringify(NEW_ADMIN));return {...NEW_ADMIN};});
  const lamens=wallet.balance;
  const saveWallet=(next:AdminWallet)=>{setWallet(next);localStorage.setItem('sb_admin_wallet_v1',JSON.stringify(next));};
  const spendLamens=(cost:number)=>{const next=purchase(wallet,cost);if(!next)return false;saveWallet(next);return true;};
  const [archivesByHero,setArchivesByHero]=useState<Record<string,string[]>>(()=>readJson('sb_archived_skills_by_hero',{}));
  const learnable=techniquePool(heroId,sealedHeroes()).filter(t=>!t.locked);
  const archiveLimit=skillArchiveLimit(learnable.length);
  const archivable=new Set(learnable.filter(t=>t.name!==HERO_BY_ID[heroId]?.skills[0]).map(t=>t.name));
  const archivedSkills=[...new Set(archivesByHero[heroId]??[])].filter(name=>archivable.has(name)).slice(0,archiveLimit);

  // Rodada 40 — migração não destrutiva do rename "Couraça" → "Colete Shinobi" (a chave antiga do save nunca é apagada).
  const [levels, setLevels] = useState<Record<string, number>>(() => migratePermanentLevels(readJson('sb_permanent_levels', {})));
  const [unlocked, setUnlocked] = useState<string[]>(() => readJson('sb_unlocked_items', ['damage']));
  const [archived, setArchived] = useState<string[]>(() => readByHero('sb_home_by_hero_v1',heroId,[]));
  const [storedPlanned, setPlanned] = useState<string[]>(() => readByHero('sb_planned_by_hero_v1',heroId,[]));
  const validPlanNames=new Set([...learnable.map(t=>t.name),...PILL_NAMES,...items.map(item=>item.name)]);
  const planned=storedPlanned.filter(name=>validPlanNames.has(name)&&!archivedSkills.includes(name)&&!archived.includes(ITEM_BY_NAME[name]?.id));
  const savePlan=(next:string[])=>{setPlanned(next);writeByHero('sb_planned_by_hero_v1',heroId,next);};
  // Rodada 39 — Fusões planejadas (pares de técnicas, até 4 por herói) e Táticas de Missão (snapshot do plano).
  const [fusionPlan, setFusionPlan] = useState<[string, string][]>(() => readByHero('sb_fusion_plan_by_hero_v1',heroId,[]));
  const [tactics, setTactics] = useState<MissionTactic[]>(() => readByHero('sb_tactics_by_hero_v1',heroId,[]));
  const [trainingByHero,setTrainingByHero]=useState<Record<string,string[]>>(()=>readJson('sb_jiraiya_training',{}));
  const trainingSlots=jiraiyaSlots(levels).length;
  const trained=(trainingByHero[heroId]??[]).filter(name=>archivable.has(name)||learnable.some(t=>t.name===name)) .filter(name=>planned.includes(name)&&!archivedSkills.includes(name)).slice(0,trainingSlots);
  // Rodada 47 (pedido do usuário: "ao treinar a passiva... já tem que habilitar o Treinar para selecionar no
  // plano de build") — treinar uma técnica que ainda NÃO está planejada agora auto-planeja junto (antes era no-op,
  // pois `trained` filtra por `planned`). Remover o treinamento apenas desmarca a estrela.
  const trainTechnique=(name:string)=>{const removing=trained.includes(name);const next=removing?trained.filter(t=>t!==name):trained.length<trainingSlots?[...trained,name]:trained;const map={...trainingByHero,[heroId]:next};setTrainingByHero(map);localStorage.setItem('sb_jiraiya_training',JSON.stringify(map));if(!removing&&!planned.includes(name)){const nextPlanned=[...planned,name];setPlanned(nextPlanned);writeByHero('sb_planned_by_hero_v1',heroId,nextPlanned);}};

  const togglePlanned=(name:string)=>{
    if(!validPlanNames.has(name))return;
    if(planned.includes(name)){savePlan(planned.filter(n=>n!==name));return;}
    const item=ITEM_BY_NAME[name];
    if(item&&archived.includes(item.id))setHome(archived.filter(id=>id!==item.id));
    if(archivedSkills.includes(name))toggleSkill(name);
    savePlan([...planned,name]);
  };
  const toggleSkill=(name:string)=>{if(!archivedSkills.includes(name)&&(!archivable.has(name)||archivedSkills.length>=archiveLimit))return;const next=archivedSkills.includes(name)?archivedSkills.filter(n=>n!==name):[...archivedSkills,name];const archives={...archivesByHero,[heroId]:next};setArchivesByHero(archives);localStorage.setItem('sb_archived_skills_by_hero',JSON.stringify(archives));if(next.includes(name)){savePlan(planned.filter(n=>n!==name));const pairs=fusionPlan.filter(pair=>!pair.includes(name));setFusionPlan(pairs);writeByHero('sb_fusion_plan_by_hero_v1',heroId,pairs);}};

  const resetAccount=()=>{if(page==='game')window.dispatchEvent(new CustomEvent('shinobi-forfeit'));for(const key of Object.keys(localStorage))if(key.startsWith('sb_'))localStorage.removeItem(key);location.reload();};
  const hero = heroes.find((entry) => entry.id === heroId) ?? heroes[0];
  const updateWorld = useCallback((snapshot: WorldSnapshot) => setWorld(snapshot), []);
  const changeGamePanel = useCallback((panel: 'map' | 'quickmap' | 'sheet' | 'pause' | null) => {
    setConfirmForfeit(false);setGamePanel(panel);
    const params=new URLSearchParams(location.search);
    const testWithoutPointer=params.has('test')&&params.get('pointer')!=='real';
    if(panel===null&&page==='game'&&!settingsOpen&&!world.choice&&!world.sealing&&!world.roulette&&!world.defeated&&!world.victory&&!testWithoutPointer)
      captureGamePointer();
  }, [page,settingsOpen,world.choice,world.sealing,world.roulette,world.defeated,world.victory]);
  const choiceNpc=world.choice?({'-1':'tenten','-2':'teuchi','-3':'ebisu','-4':'iruka','-5':'iruka','-6':'sapos-sabios','-9':'tsunade'} as Record<number,string>)[world.choice.level]:undefined;
  const hasPendingChoice=Boolean(world.choice||world.sealing||world.roulette);
  const openRunSheet=()=>changeGamePanel('sheet');
  const changePage = (target: Page) => setPage(target);
  const updateLevels = (next: Record<string, number>) => { setLevels(next); localStorage.setItem('sb_permanent_levels', JSON.stringify(next)); };
  // Arsenal de Missão: "Deixar em casa" (antigo Arquivar) tira o item do pool da run; limite de vagas do Baú do Clã.
  const [priority,setPriority]=useState<string[]>(()=>readByHero('sb_priority_by_hero_v1',heroId,[]));
  const [presets,setPresetsState]=useState<BagPresets>(()=>readPresets(heroId));
  const updatePresets=(next:BagPresets)=>{setPresetsState(next);savePresets(heroId,next,presets);};
  const unlockedCount=unlocked.filter(id=>{const it=items.find(i=>i.id===id);return it&&it.rarity!=='Comum';}).length;
  const homeCap=homeCapacity(levels,unlockedCount);
  const setHome=(next:string[],active:number|null=presets.active)=>{
    setArchived(next);
    writeByHero('sb_home_by_hero_v1',heroId,next);
    if(presets.active!==active)updatePresets({...presets,active});
    const pr=priority.filter(id=>!next.includes(id));
    if(pr.length!==priority.length){setPriority(pr);writeByHero('sb_priority_by_hero_v1',heroId,pr);}
    savePlan(planned.filter(name=>!next.includes(ITEM_BY_NAME[name]?.id)));
  };
  const toggleArchived=(id:string)=>{
    if(!archived.includes(id)&&archived.length>=homeCap.total)return;
    setHome(archived.includes(id)?archived.filter(item=>item!==id):[...archived,id]);
  };
  const togglePriority=(id:string)=>{
    const next=priority.includes(id)?priority.filter(p=>p!==id):priority.length<prioritySlots(levels)?[...priority,id]:priority;
    setPriority(next);writeByHero('sb_priority_by_hero_v1',heroId,next);
  };
  const itemAvailable=(id:string)=>items.some(item=>item.id===id&&(item.rarity==='Comum'||unlocked.includes(id)));
  const applyPreset=(index:number|null)=>{
    if(index===null){updatePresets({...presets,active:null});return;}
    const slot=presets.slots[index];if(!slot)return;
    const home=slot.items.filter(itemAvailable).slice(0,homeCap.total);
    setHome(home,index);
    {
      const names=items.filter(item=>slot.plannedItems?.includes(item.id)&&itemAvailable(item.id)&&!home.includes(item.id)).map(item=>item.name);
      savePlan([...planned.filter(name=>!ITEM_BY_NAME[name]),...names]);
    }
  };
  const currentPlannedItems=planned.flatMap(name=>ITEM_BY_NAME[name]?[ITEM_BY_NAME[name].id]:[]);
  const saveItemPreset=(name:string,index:number|null=null)=>{
    const slot=index===null?undefined:presets.slots[index];
    if(!slot){updatePresets(addPreset(presets,archived,name,currentPlannedItems,heroId));return;}
    updatePresets({...presets,slots:presets.slots.map((entry,i)=>i===index?{
      ...entry,name,items:[...archived],plannedItems:[...currentPlannedItems],originHeroId:entry.originHeroId??heroId,
    }:entry)});
  };
  const arsenalControls:ArsenalControlsProps={
    presets,homeCount:archived.length,onSelect:applyPreset,onSave:saveItemPreset,
    onDuplicate:index=>updatePresets(duplicatePreset(presets,index)),
    onDelete:index=>updatePresets(removePreset(presets,index)),
  };
  // Rodada 39 — Fusões planejadas: pares de técnicas do pool do herói (até 4); a execução continua na
  // Oficina dos Sapos Sábios (1 uso por zona). O badge ⚗ no pool do jogo marca as técnicas de um par.
  const fusionNames=useMemo(()=>new Set(fusionPlan.flat()),[fusionPlan]);
  const addFusionPair=(a:string,b:string)=>{if(!a||!b||a===b||fusionPlan.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a))||fusionPlan.length>=4)return;const next=[...fusionPlan,[a,b] as [string,string]];setFusionPlan(next);writeByHero('sb_fusion_plan_by_hero_v1',heroId,next);};
  const removeFusionPair=(index:number)=>{const next=fusionPlan.filter((_,i)=>i!==index);setFusionPlan(next);writeByHero('sb_fusion_plan_by_hero_v1',heroId,next);};
  // Tática de Missão: preset nomeado por herói com snapshot {planejado · treinadas · em casa · prioridade · fusões}.
  const snapshotTactic=(name:string):MissionTactic=>({
    name,planned:[...planned],trained:[...trained],home:[...archived],priority:[...priority],
    fusion:fusionPlan.map(([a,b])=>[a,b]),archivedSkills:[...archivedSkills],
  });
  const persistTactics=(next:MissionTactic[])=>{
    setTactics(next);
    writeByHero('sb_tactics_by_hero_v1',heroId,next);
  };
  const updateTactic=(index:number)=>{
    const selected=tactics[index];
    if(selected)persistTactics(tactics.map((t,i)=>i===index?snapshotTactic(selected.name):t));
  };
  const saveTactic=(name:string)=>{
    const clean=(name??'').trim().slice(0,32)||'Tática '+(tactics.length+1);
    if(tactics.length>=4)return;
    persistTactics([...tactics,snapshotTactic(clean)]);
  };
  const applyTactic=(index:number)=>{
    const t=tactics[index];if(!t)return;
    const home=[...new Set(t.home)].filter(itemAvailable).slice(0,homeCap.total);
    const blockedSkills=[...new Set(t.archivedSkills??archivedSkills)].filter(name=>archivable.has(name)).slice(0,archiveLimit);
    savePlan(t.planned.filter(name=>validPlanNames.has(name)&&!blockedSkills.includes(name)&&!home.includes(ITEM_BY_NAME[name]?.id)));
    setArchived(home);writeByHero('sb_home_by_hero_v1',heroId,home);
    updatePresets({...presets,active:null});
    if(t.archivedSkills){
      const skills=blockedSkills;
      const archives={...archivesByHero,[heroId]:skills};
      setArchivesByHero(archives);localStorage.setItem('sb_archived_skills_by_hero',JSON.stringify(archives));
    }
    const pr=[...new Set(t.priority)].filter(id=>!home.includes(id)).slice(0,prioritySlots(levels));
    setPriority(pr);writeByHero('sb_priority_by_hero_v1',heroId,pr);
    const fusion=t.fusion.filter(pair=>pair.every(name=>!blockedSkills.includes(name)&&learnable.some(tech=>tech.name===name&&!tech.setup))).slice(0,4);
    setFusionPlan(fusion);writeByHero('sb_fusion_plan_by_hero_v1',heroId,fusion);
    const training={...trainingByHero,[heroId]:[...t.trained]};
    setTrainingByHero(training);localStorage.setItem('sb_jiraiya_training',JSON.stringify(training));
  };
  const deleteTactic=(index:number)=>{const next=tactics.filter((_,i)=>i!==index);setTactics(next);writeByHero('sb_tactics_by_hero_v1',heroId,next);};
  // Troca de herói no MESMO componente montado (CharacterSelect → setHeroId): o estado acima não
  // remonta, então recarrega o plano individual do novo herói (fallback: chaves globais antigas).
  useEffect(()=>{
    setPlanned(readByHero('sb_planned_by_hero_v1',heroId,[]));
    setArchived(readByHero('sb_home_by_hero_v1',heroId,[]));
    setPriority(readByHero('sb_priority_by_hero_v1',heroId,[]));
    setPresetsState(readPresets(heroId));
    setFusionPlan(readByHero('sb_fusion_plan_by_hero_v1',heroId,[]));
    setTactics(readByHero('sb_tactics_by_hero_v1',heroId,[]));
  },[heroId]);
  const buyItem=(item:typeof items[number])=>{if(item.rarity==='Comum'||unlocked.includes(item.id)||!spendLamens(item.cost))return;const next=[...unlocked,item.id];setUnlocked(next);localStorage.setItem('sb_unlocked_items',JSON.stringify(next));};
  const attackList = useMemo(() => techniquePool(hero.id,sealedHeroes()).map(t=>({...t,source:t.source==='basica'?'Básica da Academia':t.source==='kit'?(SHARED_TECHNIQUES.has(t.name)?'Kit do shinobi · compartilhada':'Kit do shinobi · ÚNICA'):t.source==='vila'?'Compartilhada · mesma vila ('+(HERO_BY_ID[t.origin]?.name??t.origin)+')':t.source==='elemento'?'Compartilhada · mesmo elemento ('+(HERO_BY_ID[t.origin]?.name??t.origin)+')':(t.locked?'🔒 ':'')+'Única de '+(HERO_BY_ID[t.origin]?.name??t.origin)+(t.locked?' · selar para liberar':''),level:'Nível '+t.unlockLevel})), [hero]);

  const playEntry = () => { playYooo(); setPage(profile.signedIn ? 'missions' : 'characters'); };
  const missionSelect = () => setPage('missions');
  const beginMission = () => {writeByHero('sb_planned_by_hero_v1',heroId,planned);if(!new URLSearchParams(location.search).has('test')||new URLSearchParams(location.search).get('pointer')==='real')captureGamePointer();playYooo();startRun(familyOf(hero.id));setResumeRun(null);setWorld(emptySnapshot);setGamePanel(null);setRunId(n=>n+1);setPage('game');};
  const pool=useMemo(()=>availableItems(unlocked,archived,false),[unlocked,archived]);
  // Lamens por desempenho: credita UMA vez por run (guarda o runId já pago), na vitória ou na derrota.
  const creditedRun=useRef<number|null>(null);
  const [runReward,setRunReward]=useState<{runId:number;reward:LamenReward;rank:LocalRank}|null>(null);
  const runEnded=page==='game'&&(world.defeated||world.victory);
  useEffect(()=>{
    if(!runEnded||creditedRun.current===runId)return;
    creditedRun.current=runId;
    if(world.defeated)playDefeat();else playMenu(); // Rodada 42 — fim de run: derrota toca "Grief and Sorrow"; vitória volta ao pool de menus.
    clearSavedRun();const reward=runLamens(world,mission);if(world.victory)markMapCompleted(mapId,mission);
    const {victory,zone,kills,elapsed,level,totalDamage}=world;
    const rank=recordLocalRun(mapId,mission,{heroId:hero.id,victory,zone,kills,elapsed,level,totalDamage});
    setRunReward({runId,reward,rank});
    if(reward.total>0)setWallet(prev=>{const next={...prev,balance:prev.balance+reward.total};localStorage.setItem('sb_admin_wallet_v1',JSON.stringify(next));return next;});
  },[runEnded,runId,world,mission,mapId,hero.id]);

  return <main className={`game-shell ${settings.minimap?'':'hide-minimap'} ${settings.toasts?'':'hide-toasts'} ${settings.showFps?'':'hide-fps'}`} style={{['--hud-scale' as string]:settings.hudScale,['--hud-opacity' as string]:settings.hudOpacity,['--minimap-scale' as string]:settings.minimapScale}}>
    <GameCanvas key={runId} heroId={page==='game'?hero.id:'naruto'} mission={page==='game'?mission:'Genin'} mapId={page==='game'?mapId:'folha'} resume={resumeRun} itemPool={pool} preparation={{permanent:levels,archivedSkills,planned,trained,priorityItems:priority}} enabled={page === 'game'} paused={(gamePanel !== null && gamePanel!=='quickmap') || settingsOpen} onSnapshot={updateWorld} onPanel={changeGamePanel} debug={debugEnabled} />
    {page !== 'game' && page !== 'preview' ? <div className={`home-shade hub-on-${page}`}>
      {/* Fundo ilustrado do hub: as 4 vilas (map-previews-v1) se alternam; marcos do próprio projeto em camadas. Só decoração. */}
      <div className="hub-backdrop" data-map={mapId} aria-hidden="true"><i className="hub-vila vila-folha"/><i className="hub-vila vila-areia"/><i className="hub-vila vila-pedra"/><i className="hub-vila vila-nevoa"/><i className="hub-marco marco-monumento"/><i className="hub-marco marco-estatua-a"/><i className="hub-marco marco-estatua-b"/><i className="hub-marco marco-torii"/><i className="hub-vinheta"/></div>
      <header className="home-topbar"><button className="language-chip" onClick={() => changePage('home')}>忍 <span>SHINOBIBONK</span></button><nav className="hub-nav"><button className={page === 'characters' || page === 'attacks' ? 'active' : ''} onClick={() => changePage('characters')}>Shinobis</button><button className={page === 'passives' ? 'active' : ''} onClick={() => changePage('passives')}>Passivas Shinobi</button><button className={page === 'items' ? 'active' : ''} onClick={() => changePage('items')}>Itens</button><button className={page === 'bag' ? 'active' : ''} onClick={() => changePage('bag')}>Arsenal de Missão</button><button className={page==='tactics'?'active':''} onClick={()=>changePage('tactics')}>Táticas de Missão</button>{page==='home'&&<><button onClick={() => setSettingsOpen(true)}>⚙ Configurações</button>{musicBlocked&&settings.volume>0&&settings.musicVolume>0&&<button type="button" onClick={()=>setMusicBlocked(false)}>♫ Ativar música</button>}</>}</nav><div className="account-area"><button type="button" className="button archive-button" onClick={()=>changePage('archive')}>Arquivo Shinobi</button><div className="account-badge" title={settings.playerName !== 'Shinobi' ? settings.playerName : undefined}><span className="account-avatar">🥷</span><span><b>{profile.name}</b><small>{`${lamens.toLocaleString('pt-BR')} Lamens · local`}</small></span></div><button className="button account-button" onClick={() => setModal(true)}>{profile.signedIn ? 'Minha conta' : 'Entrar / Criar conta'}</button></div></header>
      <section className="hub-body">
        {page === 'home' && <div className="hub-home"><section className="home-left"><div className="game-logo"><span className="logo-mark">忍</span><div>SHINOBI<span>BONK</span><small>UM SURVIVOR NINJA</small></div></div><p className="eyebrow">SUA JORNADA NINJA COMEÇA AQUI</p><h1>Monte sua equipe.<br /><em>Enfrente as hordas.</em></h1><p className="home-copy">Escolha um shinobi, conheça suas técnicas e prepare uma build antes de entrar na missão.</p><div className="home-actions"><button className="button primary-button" onClick={playEntry}><span className="button-icon">▶</span><span><b>{profile.signedIn ? 'Iniciar Missão' : 'Jogar como convidado'}</b><small>{profile.signedIn ? 'Escolha o mapa e a dificuldade' : profile.name + ' · escolha seu shinobi'}</small></span></button><button className="button secondary-button" onClick={() => changePage('characters')}><span className="button-icon">🥷</span><span><b>Escolher shinobi</b><small>{hero.name} · {hero.village}</small></span></button>{savedRun&&HERO_BY_ID[savedRun.heroId]&&<button className="button primary-button resume-button" onClick={() => { captureGamePointer();startRun(familyOf(savedRun.heroId));setHeroId(savedRun.heroId); setMapIdState(savedRun.mapId); setMission(savedRun.mission); setResumeRun(savedRun); setWorld(emptySnapshot); setGamePanel(null); setRunId(n=>n+1); setPage('game'); }}><span className="button-icon">⏯</span><span><b>Continuar missão salva</b><small>{HERO_BY_ID[savedRun.heroId].name} · {MAP_BY_ID[savedRun.mapId]?.name} · {savedRun.mission} · {Math.max(0,Math.ceil((600-savedRun.elapsed)/60))} min restantes · nível {savedRun.level}</small></span></button>}<button className="button preview-button" onClick={() => { setHeroId('naruto'); setPage('preview'); setGamePanel(null); }}><span className="button-icon">🍥</span><span><b>Ver Naruto no cenário</b><small>Prévia estática do sprite</small></span></button></div><div className="mode-cards"><article><span>🍜</span><div><b>Lamens disponíveis</b><small>Moeda permanente local</small></div><strong>{lamens.toLocaleString('pt-BR')}</strong></article><article><span>📋</span><div><b>Build preparada</b><small>{planned.length} ataques planejados</small></div><button onClick={() => changePage('build')}>Abrir plano →</button></article></div><div className="hub-vilas-tira" aria-hidden="true"><span className="vila-folha"><i/>Folha</span><span className="vila-areia"><i/>Areia</span><span className="vila-pedra"><i/>Pedra</span><span className="vila-nevoa"><i/>Névoa</span></div></section><aside className="local-panel"><div className="home-hero" aria-hidden="true"><HeroPortrait id={hero.id} decorative/></div><p className="home-fala"><b>{hero.name}</b>Pronto para a missão? Siga os passos abaixo e vamos enfrentar as hordas!</p><div className="panel-title"><span>📌</span><div><b>PRÓXIMOS PASSOS</b><small>PREPARAÇÃO DA RUN</small></div></div>{[['01','Selecionar shinobi','Passiva e kit de ataques'],['02','Planejar build','Ataques, vitaminas e itens'],['03','Escolher missão','Genin até Kage']].map(([n,t,d])=><button className="step-card" key={n} onClick={() => changePage(n === '01' ? 'characters' : n === '02' ? 'build' : 'missions')}><b>{n}</b><span><strong>{t}</strong><small>{d}</small></span><i>›</i></button>)}<div className="offline-note">Perfil e progresso salvos neste navegador.</div></aside></div>}

        {page === 'characters' && <div className="hub-page"><div className="page-heading"><div><p className="eyebrow">ELENCO JOGÁVEL</p><h1>Escolha seu <em>shinobi</em></h1></div><button className="button secondary-button" onClick={() => changePage('attacks')}>Ver todos os ataques →</button></div><div className="character-layout"><CharacterSelect selectedId={hero.id} onSelect={(id) => { setHeroId(id); localStorage.setItem('sb_hero', id); }}/><article className="detail-panel"><div className={`detail-title ${isHeroPlayable(hero.id)?'':'detail-locked'}`}><HeroPortrait id={hero.id} decorative={!isHeroPlayable(hero.id)}/><div><p className="eyebrow">{hero.village}</p><h2>{isHeroPlayable(hero.id)?hero.name:'Liberado com missão'}</h2>{isHeroPlayable(hero.id)&&<CharacterTags id={hero.id}/>}</div>{isHeroPlayable(hero.id)&&<div className="base-stats">{(()=>{const b=calculateStats(hero.id,1);return [[b.maxHp,'HP base'],[b.damage,'Dano base'],[b.armor,'Armadura'],[b.moveSpeed,'Movimento / s'],[Math.round(b.crit*100)+'%','Chance crítica'],[b.regen,'Regeneração / s']].map(([value,label])=><div key={label}><small>{label}</small><b>{typeof value==='number'?value.toLocaleString('pt-BR',{maximumFractionDigits:1}):value}</b></div>);})()}</div>}</div>{!isHeroPlayable(hero.id)&&<div className="detail-mission"><MissionCard id={hero.id} anonymous/></div>}{isHeroPlayable(hero.id)&&<><div className="detail-actions"><button className="button secondary-button" onClick={() => changePage('attacks')}>Ataques do shinobi</button><button className="button primary-button" onClick={()=>changePage('build')}>Planejar missão →</button></div><ArsenalControls key={hero.id} {...arsenalControls}/><div className="passive-box"><small>PASSIVA EXCLUSIVA</small><p>{hero.passive}</p></div><small>Ficha base no nível 1. Passiva natural incluída; compras e itens somam durante a missão.</small><h3>Kit · técnicas automáticas (liberadas por nível do personagem)</h3><div className="skill-chips">{hero.techniques.map((tech, i) => <span key={tech.name} title={`Liberada a partir do nível ${tech.unlockLevel}`}><SkillIcon heroId={hero.id} index={i} name={tech.name}/>{tech.name}<small className="kit-level">Nv. {tech.unlockLevel}</small></span>)}</div><div className="passive-box ultimate-box"><small>ULTIMATE NATURAL · R</small><p><SkillIcon heroId={hero.id} name={hero.ultimate}/>{hero.ultimate}</p><small>Dano total, Taijutsu, Ninjutsu, Genjutsu, bônus elementais, críticos e efeitos condicionais válidos. {isProjectileUltimate(hero.id)?'Recebe quantidade, velocidade e ricochete de projéteis.':'Ataque em área.'}</small></div></>}</article></div></div>}

        {page === 'attacks' && <div className="hub-page"><div className="page-heading"><div><p className="eyebrow">GOLPES DE {hero.name.toUpperCase()}</p><h1>Biblioteca de <em>ataques</em></h1><p className="home-copy">Os quatro ataques do kit aparecem conforme o nível. Habilidades comuns disparam automaticamente.</p></div><button className="button secondary-button" onClick={() => changePage('characters')}>← Voltar ao shinobi</button></div><PoolFilters value={attackFilters} onChange={setAttackFilters} facets={{school:attackList.map(t=>t.school),element:attackList.map(t=>t.element),shape:attackList.map(t=>t.shape)}}/><div className="attack-grid">{attackList.filter(t=>matchesSearch(t.name,attackFilters.search)&&(!attackFilters.school||t.school===attackFilters.school)&&(!attackFilters.element||t.element===attackFilters.element)&&(!attackFilters.shape||t.shape===attackFilters.shape)).map((attack, i) => <article className="attack-card" key={`${attack.name}-${i}`}><SkillIcon heroId={hero.id} index={i<4?i:4} name={attack.name}/><div><small>{attack.source} · {attack.level}</small><h3>{attack.name}</h3><p>{attack.setup?techniqueDetail(attack):<>{attack.school} · {attack.element} · Alcance inicial {attack.range} m · Recarga {attack.cooldown} s. {attack.status&&`Pode ${attack.status.toLowerCase()}: ${Math.round(attack.statusChance*100)}% base.`}{attack.school==='Ninjutsu'&&attack.element==='Sábio'?' Linha Senjutsu (modo sábio).':''}</>}</p><div className="attack-tags"><span>{attack.setup?'Setup (buff)':attack.shape}</span><span>Automática</span></div></div><button className={`star-button ${planned.includes(attack.name) ? 'marked' : ''}`} title="Planejar ataque" onClick={() => togglePlanned(attack.name)}>{planned.includes(attack.name) ? '★' : '☆'}</button></article>)}</div></div>}

        {page === 'build' && <div className="hub-page planner-page"><div className="page-heading"><h1>Plano de missão <em>{hero.name}</em></h1><button className="button primary-button" onClick={missionSelect}>Escolher missão →</button></div><BuildPlanner key={hero.id} hero={hero} unlocked={unlocked} planned={planned} togglePlanned={togglePlanned} archivedItems={archived} archiveItemLimit={homeCap.total} toggleArchivedItem={toggleArchived} saveItemPreset={saveItemPreset} itemPresetCount={presets.slots.length} archivedSkills={archivedSkills} archiveLimit={archiveLimit} trainingSlots={trainingSlots} trained={trained} trainTechnique={trainTechnique} toggleSkill={toggleSkill} fusionPlan={fusionPlan} addFusionPair={addFusionPair} removeFusionPair={removeFusionPair} tactics={tactics} saveTactic={saveTactic} applyTactic={applyTactic} deleteTactic={deleteTactic} updateTactic={updateTactic}/></div>}

    {page==='passives'&&<div className="hub-page"><div className="page-heading"><div><p className="eyebrow">TREINAMENTO PERMANENTE · ADMIN LOCAL</p><h1>Passivas <em>Shinobi</em></h1><p className="home-copy">Compras aplicadas na próxima missão. Reset de conta apaga o progresso local.</p></div></div><HubHud lamens={lamens} levels={levels} poolCount={pool.length} home={archived.length} capacity={homeCap.total}/>{PASSIVE_SECTIONS.map(section=><section className="passive-section" key={section.id}><h2 className="passive-section-title">{section.id} <small>{section.subtitle}</small></h2><div className="passive-grid">{PASSIVES.filter(p=>p.section===section.id).map(def=>{const {name,buff,max,icon}=def,level=levels[name]||0,cost=passiveCost(def,level),art=items.find(i=>i.id===icon);return <article className="passive-card" key={name}><div className="passive-art">{art&&<ItemIcon name={art.name}/>}<b>{level>=max?'MÁX.':`Nv. ${level}/${max}`}</b></div><h3>{name}</h3><p>{buff}</p>{name==='Treinamento com Jiraiya'&&<div className="jiraiya-slots" aria-label="Espaços do Treinamento com Jiraiya">{Array.from({length:4},(_,i)=>{const slot=jiraiyaSlots(levels)[i];return <span key={i} className={slot?slot.rarity==='Lendário'?'legendary':'rare':'empty'} title={slot?`${slot.rarity} · ${Math.round(slot.chance*100)}%`:'Espaço fechado'}>{slot?`${Math.round(slot.chance*100)}%`:'—'}</span>;})}</div>}{name==='Baú do Clã'&&<small className="passive-extra">Você tem {homeCap.total} vagas: {homeCap.fromChest} do Baú e {homeCap.fromUnlocks} pelos seus {unlockedCount} itens desbloqueados.</small>}<div className="level-pips">{Array.from({length:max},(_,i)=><i className={i<level?'filled':''} key={i}/>)}</div><button className="buy-passive" disabled={level>=max||lamens<cost} onClick={()=>{if(level>=max||!spendLamens(cost))return;updateLevels({...levels,[name]:level+1});}}>{level>=max?'Concluído':`Comprar · ${cost} Lamens`}</button></article>;})}</div></section>)}</div>}

        {page === 'items' && <div className="hub-page"><div className="page-heading"><div><p className="eyebrow">LOJA PRÉ-MISSÃO</p><h1>Arsenal <em>shinobi</em> · {items.length} itens</h1><p className="home-copy">Desbloqueie itens para o pool da missão; desbloquear nunca entrega o item diretamente. Para deixar itens em casa, use a Arsenal de Missão.</p></div><button className="button secondary-button" onClick={() => changePage('bag')}>🎒 Arsenal de Missão →</button></div><HubHud lamens={lamens} levels={levels} poolCount={pool.length} home={archived.length} capacity={homeCap.total}/><PoolFilters value={itemFilters} onChange={setItemFilters} facets={{rarity:items.map(i=>i.rarity),school:['Taijutsu','Ninjutsu','Genjutsu'],element:items.map(itemElement),attribute:items.map(itemAttribute)}}/><div className="compact-grid">{items.filter(i=>matchesSearch(i.name+' '+i.description,itemFilters.search)&&(!itemFilters.rarity||i.rarity===itemFilters.rarity)&&(!itemFilters.school||itemSchools(i).includes(itemFilters.school))&&(!itemFilters.element||itemElement(i)===itemFilters.element)&&(!itemFilters.attribute||itemAttribute(i)===itemFilters.attribute)).map((item) => { const owned = item.rarity==='Comum'||unlocked.includes(item.id); return <CompactItemCard key={item.id} item={item} className="shop-card" status={!owned?'Bloqueado':archived.includes(item.id)?'Em casa':'No pool'}><button className="compact-buy" disabled={owned || lamens < item.cost} onClick={() => buyItem(item)}>{owned ? '✓ Desbloqueado' : `Desbloquear · ${item.cost} 🍜`}</button></CompactItemCard>; })}</div><div className="prototype-note">Conta Administrador local: crédito inicial de 999.999 Lamens para testes. Compras e saldo ficam neste navegador. Preços provisórios; Reset de conta apaga o progresso local.</div></div>}

        {(page === 'bag'||page==='archive') && <div className="hub-page"><div className="page-heading"><div><p className="eyebrow">PREPARAÇÃO DA MOCHILA</p><h1>{page==='archive'?'Arquivo Shinobi':'Arsenal de Missão'}</h1><p className="home-copy">{hero.name} · predefinições de itens</p></div><button className="button secondary-button" onClick={()=>changePage('characters')}>Trocar shinobi</button></div><HubHud lamens={lamens} levels={levels} poolCount={pool.length} home={archived.length} capacity={homeCap.total}/><MissionBag key={page+hero.id} heroId={heroId} arsenalControls={arsenalControls} showArchive={page==='archive'} plannedItems={currentPlannedItems} unlocked={unlocked} home={archived} capacity={homeCap.total} fromUnlocks={homeCap.fromUnlocks} priority={priority} prioritySlots={prioritySlots(levels)} presets={presets} onToggleHome={toggleArchived} onTogglePriority={togglePriority} onPresets={updatePresets} onApply={applyPreset}/></div>}

        {page === 'tactics' && <div className="hub-page">
          <div className="page-heading"><div><h1>Táticas de Missão</h1><p className="home-copy">{hero.name}</p></div><button className="button secondary-button" onClick={()=>changePage('characters')}>Trocar shinobi</button><button className="button primary-button" onClick={()=>changePage('build')}>Editar plano</button></div>
          <MissionTactics key={hero.id} heroName={hero.name} tactics={tactics} saveTactic={saveTactic} applyTactic={applyTactic} deleteTactic={deleteTactic} updateTactic={updateTactic}/>
        </div>}
        {page === 'missions' && <MapSelect heroId={hero.id} mapId={mapId} onMap={setMapId} mission={mission} onMission={setMission} planned={planned} tactics={tactics} onApplyTactic={applyTactic} arsenalControls={arsenalControls} onStart={beginMission} onBack={() => changePage('build')} onChangeHero={() => changePage('characters')} onEditPlan={() => changePage('build')} onBag={() => changePage('bag')} />}
      </section>
      {page !== 'home' && <footer className="home-footer"><button onClick={() => changePage('home')}>← HUB INICIAL</button><span>SHINOBIBONK · PROTÓTIPO EM DESENVOLVIMENTO · {hero.name.toUpperCase()} · 🍜 {lamens.toLocaleString('pt-BR')} Lamens</span></footer>}
    </div> : <><header className="game-topbar">{page==='preview'&&<button className="return-button" onClick={()=>changePage('home')}>← Menu</button>}<div className="topbar-block topbar-mission"><span className="game-mission">{page === 'preview' ? 'PRÉVIA ESTÁTICA · NARUTO' : `MISSÃO ${mission.toUpperCase()} · ${hero.name.toUpperCase()}`}</span><span className="run-weather">{world.weather} · {world.phase==='exit'?'Portal de saída':world.phase==='arena'?'Arena da Bijū':'Zona '+world.zone+'/3'}</span></div><div className="topbar-block topbar-clock">{(world.overtime??0)>0?<span className="run-clock final-swarm-clock" title="FINAL SWARM: tempo sobrevivido depois que o relógio zerou" style={{color:'#ff5a5a',fontWeight:800}}>☠ FINAL SWARM +{Math.floor((world.overtime??0)/60)}:{String(Math.floor((world.overtime??0)%60)).padStart(2,'0')}</span>:<span className="run-clock">⏱ {Math.floor(world.remaining/60)}:{String(Math.floor(world.remaining%60)).padStart(2,'0')}</span>}</div><div className="topbar-block topbar-resources"><span className="run-weapons" title={world.kills.toLocaleString('pt-BR')+' abates na missão'}>{compactNumber(world.kills)} abates</span><span className="run-wallet" title={`${Math.round(world.runMoney).toLocaleString('pt-BR')} Ryu`}>🪙 {compactNumber(world.runMoney)} Ryu</span><span className="run-weapons" title={`${world.kunai} Kunai · ${world.shuriken} Shuriken`}>🗡 {world.kunai} · 🌀 {world.shuriken}</span></div><div className="run-prices" aria-label="Preços atuais da missão"><span>Kunai <b>{compactNumber(world.weaponCost)}</b></span><span>Shuriken <b>{compactNumber(world.weaponCost)}</b></span><span>Mercador <b>{world.merchantRerollCost==null?'…':compactNumber(world.merchantRerollCost)}</b></span><span>Roleta <b>{world.tsunadeSpinCost==null?'…':compactNumber(world.tsunadeSpinCost)}</b></span><small>Ryu</small></div></header><section className="game-level"><HeroPortrait id={hero.id} level={world.level}/><span className="level-seal" aria-hidden="true">{world.level}</span><b>🥷 {hero.name}</b><strong>NÍVEL {world.level} · {formAt(hero.id,world.level).name}</strong><div className="hp-track"><i style={{width:`${Math.max(0,world.hp/world.maxHp*100)}%`}} /></div><small>❤️ {Math.ceil(world.hp).toLocaleString('pt-BR')} / {Math.ceil(world.maxHp).toLocaleString('pt-BR')}</small><div className="xp-track"><i style={{width:`${world.xp/world.xpNext*100}%`}} /></div><small>XP {world.xp}/{world.xpNext}</small></section><AllyCards heroId={hero.id} synergies={world.synergies} allies={world.allies} affinity={world.affinity} slots={world.stats.supportSlots} allyBuff={world.stats.allyBuff} allyDamage={world.stats.allyDamage} allySpeed={world.stats.allySpeed} charge={world.allyCharge} />{page === 'preview' && <aside className="game-help">Naruto estático no cenário 3D</aside>}
      <div className={`minimap${world.weatherEvent==='mist'?' mist-map':''}`} aria-label="Minimapa" title="Segure Tab para o mapa rápido · M para o mapa completo"><div className="map-grid"/><span className="map-player"><MapPlayerIcon heading={world.player.heading}/></span><MinimapMarkers world={world}/><EnemyDots enemies={world.enemies} project={(x,z)=>{const dx=(x-world.player.x)*1.55,dy=(z-world.player.z)*1.55,r=Math.hypot(dx,dy),k=r>45?45/r:1;return [50+dx*k,50+dy*k];}}/></div><div className="minimap-caption" aria-hidden="true"><kbd>Tab</kbd> rápido · <kbd>M</kbd> mapa</div>{page==='game'&&<RouteHud world={world}/>}
      <div className="skill-dock">
      <section className="vitamin-row" aria-label="Pílulas e vitaminas">{Object.entries(world.pills).map(([name,count])=><div className="inv-icon pill-icon" title={(()=>{const next=pillStatText(pillStatPreview(name,world.stats,hero.id,pillLevelsGained(name,count,world.stats.extra.pillCap??0)));return `${name} · Nv. ${count} · ${pillEffectText(name,count+(world.pillQuality?.[name]||0))}${next?' · Próximo nível: '+next:' · Nível máximo'}`;})()} key={name}><ItemIcon name={name}/><small>{count}</small></div>)}{Array.from({length:Math.max(0,PILL_SLOTS-Object.keys(world.pills).length)},(_,i)=><div className="inv-icon pill-slot-empty" title="Espaço livre para outro tipo de pílula" key={i}>+</div>)}</section>
      <section className="ability-bar" aria-label="Habilidades automáticas">{[...Object.keys(world.skillLevels),...Array.from({length:Math.max(0,4-Object.keys(world.skillLevels).length)},(_,i)=>'Espaço '+(Object.keys(world.skillLevels).length+i+1))].map((skill,i)=><button key={skill} className={`${world.skillLevels[skill]?'learned':'unlearned'}${world.setups.some(s=>s.name===skill)?' setup-on':''}`} title={`${skill} · ${world.skillLevels[skill]?'Nv. '+world.skillLevels[skill]:i===3&&!world.permanent['Quarta técnica']?'Desbloqueie Quarta técnica nas Passivas Shinobi':'Aprenda no level-up'}${(()=>{const tech=world.techniques.find(x=>x.name===skill);return tech&&world.skillLevels[skill]?' — '+techniqueDetail(tech,world.skillGrowth[skill]??NO_GROWTH,world.stats.sage>0||world.setups.some(s=>world.techniques.find(x=>x.name===s.name)?.setup?.sage),world.techniques.some(x=>x.setup?.sage&&world.skillLevels[x.name])):'';})()}`}><SkillIcon heroId={hero.id} index={i} name={skill}/><SkillTimer timer={world.skillTimers?.[skill]}/><small>{i+1} · {world.skillLevels[skill]?'Nv. '+world.skillLevels[skill]:'—'}{(()=>{const active=world.setups.find(s=>s.name===skill);return active?' · '+Math.ceil(active.remaining)+' s':'';})()}</small></button>)}<button className={`ultimate ${world.autoUlt?'auto-enabled':''}`} aria-label={hero.ultimate+(world.chakra>=100?' · Pronta':' · Carregando')} onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'r'}))}><span className="ultimate-charge" aria-hidden="true" style={{'--charge':Math.min(100,Math.max(0,world.chakra))+'%'} as React.CSSProperties}/><SkillIcon heroId={hero.id} index={4} name={hero.ultimate}/><small>R</small><span className="ultimate-auto-mark" title="Alternar Ultimate automática" onClick={(event)=>{event.stopPropagation();window.dispatchEvent(new Event('shinobi-toggle-auto-ult'));}}>{world.autoUlt?'AUTO':'MANUAL'}</span></button></section>
      </div>
      <InventoryCorner items={world.items}/><div className="runtime-readout">{world.fps} FPS <i /> {world.enemyCount??0} inimigos vivos</div>{world.interaction&&<div className="world-interaction">{world.interaction.key&&<kbd>{world.interaction.key}</kbd>}<span><b>{world.interaction.name}</b><small>{world.interaction.description}</small></span></div>}{world.boss&&<div className="guardian-banner">Guardião · {world.boss}</div>}{world.totem&&<div className="guardian-banner" style={{top:world.boss?196:110,background:'#4a2a12ea',borderColor:'#ffb34d'}}>🍥 Naruto Totem · {world.totem.hp}/{world.totem.maxHp} HP · some em {Math.ceil(world.totem.remaining)} s</div>}{world.defenseProgress>0&&<div className="defense-progress">Protegendo altar · {world.defenseProgress}%</div>}{world.toast&&<div className="world-toast">{world.toast}</div>}{page==='game'&&(world.overtime??0)>0&&(world.overtime??0)<5&&!world.defeated&&!world.victory&&<div className="final-swarm-banner" role="alert" style={{position:'absolute',top:'28%',left:'50%',transform:'translateX(-50%)',zIndex:40,pointerEvents:'none',textAlign:'center',color:'#ff4d4d',fontSize:'clamp(36px,7vw,84px)',fontWeight:900,letterSpacing:'.08em',textShadow:'0 0 18px #000,0 4px 0 #3a0000',opacity:Math.min(1,(5-(world.overtime??0))/1.5)}}>FINAL SWARM<small style={{display:'block',fontSize:'clamp(14px,2vw,22px)',color:'#ffd27a',letterSpacing:'.02em'}}>O tempo acabou · sobreviva! Dificuldade ×3 e subindo</small></div>}
      {(world.defeated||world.victory)&&page==='game'&&<RunSummary world={world} hero={hero} mission={mission} reward={runReward?.runId===runId?runReward.reward:null} rank={runReward?.runId===runId?runReward.rank:null} onRetry={beginMission} onPrepare={missionSelect} onMenu={()=>{changeGamePanel(null);setPage('home');}}/>}
      {world.choice&&page==='game'&&world.choice.level===-7&&<AllyReplaceChoice onSheet={openRunSheet} heroId={hero.id} cards={world.choice.cards} allies={world.allies} affinity={world.affinity} slots={world.stats.supportSlots} allyBuff={world.stats.allyBuff}/>}
      {world.choice&&page==='game'&&world.choice.level<=-8&&<ItemTradeDialog onSheet={openRunSheet} choice={world.choice} money={world.runMoney}/>}
      {world.choice&&page==='game'&&world.choice.level===-6&&<SagesWorkshop world={world} heroId={hero.id} onSheet={openRunSheet}/>}
      {world.choice&&page==='game'&&(world.choice.level===-10||world.choice.level>-7&&world.choice.level!==-6)&&<div className="level-choice-backdrop"><section className={`level-choice cards-${Math.max(1,Math.min(4,world.choice.cards.length))}`}><div className="level-choice-title">{choiceNpc&&<aside className="choice-npc"><HeroPortrait id={choiceNpc}/></aside>}<small>{world.choice.level===-10?'ALTAR CONQUISTADO':world.choice.level===-6?'MONTE MYŌBOKU · FUKASAKU E SHIMA':world.choice.level===-3?'EBISU · TREINO DE ELITE':world.choice.level===-4?'IRUKA · AULA DA ACADEMIA':world.choice.level===-5?'IRUKA · PERGAMINHO LENDÁRIO':world.choice.level===-2?'TEUCHI · BARRACA ICHIRAKU':world.choice.level===-1?'ARSENAL DA TENTEN':world.choice.level===0?'SAQUE DA MISSÃO':'VOCÊ FICOU MAIS FORTE'}</small><h1>{world.choice.level===-10?'Escolha uma bênção':world.choice.level===-6?'Fundir ou combinar técnicas':world.choice.level===-3?'Troque um atributo por outro':world.choice.level===-4?'Escolha uma aula':world.choice.level===-5?'Escolha 1 atributo lendário':world.choice.level===-2?'Esquecer pílula ou técnica':world.choice.level===-1?'Copiar um item da bolsa':world.choice.level===0?'Você encontrou itens!':`Nível ${world.choice.level}!`}</h1><p>{world.choice.level===-10?'Escolha um atributo para aprimorar nesta missão.':world.choice.level===-6?(world.choice.cards.length?'Escolha duas técnicas aprendidas para liberar um espaço.':'Aprenda duas técnicas de ataque para usar a oficina dos Sapos Sábios.'):world.choice.level===-3?'Cada carta mostra o ganho e o custo: você perde 10% a mais do que ganha, em outro atributo da ficha (P). X sai sem gastar o Ebisu.':world.choice.level===-4?'Uma lição grátis, um pergaminho lendário com custo ou o próprio Iruka como ajudante. X sai sem gastar a aula.':world.choice.level===-5?'Cada atributo vem no valor máximo; o custo de 20% aparece na carta antes de confirmar. X volta às aulas.':world.choice.level===-2&&!world.choice.cards.length?'Por aqui ainda não há pílulas ou técnicas que possam ser esquecidas.':world.choice.level===-2?`Você tem ${compactNumber(world.runMoney)} Ryu. Pague para esquecer quantas vezes quiser; a sua última técnica não pode ser esquecida.`:world.choice.level===-1?'Escolha um item que você já carrega para ganhar mais uma cópia (respeita o limite do item).':world.choice.level===0?`Sorte ${world.luck} · escolha um item`: 'Escolha uma recompensa para continuar a missão'}</p></div><div className={`level-choice-cards ${world.choice.cards.length>4?'many-cards':''}`} style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,world.choice.cards.length))},minmax(0,1fr))`}}>{world.choice.cards.map((card,index)=><button className={`${world.choices.banning?'ban-target':''} ${planned.includes(card.name)?'planned-choice':''} level-choice-card rarity-${card.rarity.toLowerCase()}`} key={card.id} disabled={Boolean(card.disabled)} title={card.disabled} style={card.disabled?{opacity:.5,cursor:'not-allowed',filter:'grayscale(.7)'}:undefined} onClick={()=>window.dispatchEvent(new CustomEvent('shinobi-choose',{detail:{index,id:card.id}}))}><div className="choice-art"><small>{card.rarity}</small><b>{card.disabled?'INDISPONÍVEL':world.choice?.level===-3?'TROCA':world.choice?.level===-4?'AULA':world.choice?.level===-5?'LENDÁRIO':world.choice?.level===-2?'ESQUECER':world.choice?.level===-1?'CÓPIA':card.kind==='skill'&&world.skillLevels[card.name]?'MELHORIA':'NOVA'}</b>{card.kind==='item'||card.kind==='pill'?<ItemIcon name={card.name}/>:card.kind==='skill'?<SkillIcon heroId={hero.id} index={hero.skills.indexOf(card.name)} name={card.name}/>:<span>{card.icon}</span>}{planned.includes(card.name)&&<em>{trained.includes(card.name)&&<strong>+15% de dano</strong>}Planejado{trained.includes(card.name)?' · Treinada':''}</em>}{card.kind==='skill'&&fusionNames.has(card.name)&&<em className="fusion-badge">⚗ Requisito de Fusão</em>}</div><div className="choice-copy"><h2>{card.name}</h2><p><BuffText text={card.description}/></p>{world.choice?.level===-2&&card.price!==undefined&&<span className="ichiraku-cost"><span aria-hidden="true">🪙</span> {card.price} Ryu</span>}{card.disabled&&<small className="affects-skills">Indisponível: {card.disabled}</small>}{card.kind==='item'&&ITEM_BY_NAME[card.name]&&<small className="affects-skills">{affectedTechniquesText(ITEM_BY_NAME[card.name],world.techniques.filter(t=>world.skillLevels[t.name]))}</small>}{card.kind==='pill'&&world.choice?.level!==-2&&<PillStatPreview title="Seu atributo" lines={pillStatPreview(card.name,world.stats,hero.id,pillLevelsGained(card.name,world.pills[card.name]||0,world.stats.extra.pillCap??0,card.rarity))}/>}{card.kind==='pill'&&world.choice?.level===-2&&<PillStatPreview title="Ao esquecer" lines={pillForgetPreview(card.name,world.stats,hero.id,(world.pills[card.name]||0)+(world.pillQuality?.[card.name]||0))}/>}{index<9&&<kbd>[{index+1}]</kbd>}</div></button>)}</div>{world.choice.level===-10?null:world.choice.level<0?<div className="reward-actions"><button onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}))}>{world.choice.level===-6?'✕ Voltar à missão':world.choice.level===-3?'✕ Recusar (sem gastar o Ebisu)':world.choice.level===-4?'✕ Sair (sem gastar a aula)':world.choice.level===-5?'← Voltar às aulas':world.choice.level===-2?'✕ Sair da barraca':'✕ Cancelar (sem gastar o Arsenal)'} <kbd>X</kbd></button></div>:<div className="reward-actions"><button disabled={!world.choices.reroll} onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'f'}))}>↻ Atualizar ({world.choices.reroll}) <kbd>F</kbd></button><button disabled={!world.choices.skip} onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}))}>» Pular ({world.choices.skip}) <kbd>X</kbd></button><button className={world.choices.banning?'banning':''} disabled={!world.choices.ban} onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'z'}))}>⊗ {world.choices.banning?'Cancelar banimento':'Banir'} ({world.choices.ban}) <kbd>Z</kbd></button>{Boolean(world.choice.sale)&&<button disabled={world.choices.banning} onClick={()=>tradeAction('sell')}>Vender recompensa · +{world.choice.sale} Ryu <kbd>V</kbd></button>}</div>}{world.choices.banning&&<p className="ban-instruction">Clique na carta que deseja retirar das próximas ofertas desta run.</p>}<div className="choice-sheet-row"><RunSheetButton onClick={openRunSheet}/></div>{world.choice.cards.length>0&&<div className="choice-controls">Escolha clicando em uma carta ou use as teclas <b>1–{world.choice.cards.length}</b>. A partida está pausada.</div>}</section></div>}
      {world.roulette&&page==='game'&&!world.defeated&&!world.victory&&<TsunadeRoulette view={world.roulette}/>}
      {world.sealing&&page==='game'&&<div className={`sealing-backdrop phase-${world.sealing.phase}`}><section className="sealing-modal"><div className="sealing-heading"><small>{world.sealing.account?'SHINOBI PARA SELAR':'MEGA ELITE DERROTADO'}</small><h1>{world.sealing.account?'Selamento de Conta':'Selamento Edo Tensei'}</h1><p>Você venceu <b>{world.sealing.target}</b>. O que fará?</p></div><div className={`seal-stage phase-${world.sealing.phase}`}><div className="seal-scroll">巻</div><div className="seal-glyph">封</div><div className="seal-character" role="img" aria-label={world.sealing.target+' sendo selado'}><HeroPortrait id={world.sealing.heroId} level={world.level}/></div><div className="seal-orbit orbit-one"/><div className="seal-orbit orbit-two"/><div className="seal-energy"/></div><p className="seal-caption">{world.sealing.phase==='ready'?'O shinobi aguarda sua decisão':world.sealing.phase==='sealing'?'Os selos prendem o chakra do inimigo…':(world.sealing.account?'Selamento concluído · '+world.sealing.target+' está DESBLOQUEADO na sua conta':'Selamento concluído · '+world.sealing.target+' entrou na equipe')}</p>{world.sealing.phase==='ready'?<div className="seal-actions"><button className="button primary-button" onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'e'}))}>{world.sealing.account?'E · Selar e desbloquear na conta':world.allies.length>=world.stats.supportSlots?`E · Selar e trocar um ajudante (${world.allies.length}/${world.stats.supportSlots})`:'E · Selar e recrutar'}</button><button className="button secondary-button" onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'g'}))}>{world.sealing.account?'G · Deixar escapar':'G · Recusar e receber drop'}</button></div>:world.sealing.phase==='complete'&&<button className="button primary-button" onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'enter'}))}>Continuar missão</button>}{world.sealing.phase!=='sealing'&&<div className="choice-sheet-row"><RunSheetButton onClick={openRunSheet}/></div>}<label className="seal-skip-setting"><input type="checkbox" checked={!settings.sealAnimation} onChange={(event)=>updateSettings({sealAnimation:!event.target.checked})}/> Selar direto nas próximas capturas (sem card/animação · muda em ⚙ Configurações)</label></section></div>}
      {gamePanel && <div className={`game-panel-backdrop${gamePanel==='quickmap'?' quickmap-backdrop':''}${gamePanel==='sheet'&&hasPendingChoice?' over-choice':''}`}><section className={`game-panel ${gamePanel==='sheet'||gamePanel==='pause'?'sheet-panel':''} ${gamePanel==='pause'?'pause-panel':''} ${gamePanel==='map'?'map-panel':''} ${gamePanel==='quickmap'?'quickmap-panel':''}`}><header><div><small>{gamePanel==='map'?'EXPLORAÇÃO COMPLETA':gamePanel==='quickmap'?'MAPA RÁPIDO':gamePanel==='pause'?'PAUSA · FICHA DO SHINOBI':'FICHA DO SHINOBI'}</small><h2>{gamePanel==='map'||gamePanel==='quickmap'?'Mapa da região':`${hero.name} · Nv. ${world.level}`}</h2></div><button onClick={()=>changeGamePanel(null)}>Fechar · Esc</button></header>
      {(gamePanel==='map'||gamePanel==='quickmap') ? <MapPanel world={world} quick={gamePanel==='quickmap'}/> : <RunSheet world={world} hero={hero} planned={planned} trained={trained} pool={pool} returningToChoice={gamePanel==='sheet'&&hasPendingChoice} onContinue={()=>changeGamePanel(null)} onMap={()=>changeGamePanel('map')}/> }
      {gamePanel==='pause'&&<footer className="pause-footer">
        <p className="pause-keys"><kbd>Esc</kbd> continuar · <kbd>WASD</kbd> mover · <kbd>Espaço</kbd> pular · <kbd>Shift</kbd> deslizar · <kbd>Mouse</kbd> girar/inclinar câmera · <kbd>Botão direito</kbd> fixar alvo · <kbd>Roda</kbd> zoom · <kbd>E</kbd> interagir · <kbd>R</kbd> Ultimate · <kbd>Y</kbd> Ultimate automática · <kbd>Tab</kbd> mapa rápido · <kbd>M</kbd> mapa grande · <kbd>P</kbd> ficha (também pausa) · <kbd>G</kbd> marcar ponto · <kbd>H</kbd> ocultar efeitos · <kbd>F</kbd>/<kbd>X</kbd>/<kbd>Z</kbd> atualizar/pular/banir no level-up</p>
        <div className="pause-actions">
          <button className="pause-danger" onClick={()=>{if(!confirmForfeit){setConfirmForfeit(true);return;}window.dispatchEvent(new CustomEvent('shinobi-forfeit'));changeGamePanel(null);}}>{confirmForfeit?'Realmente deseja desistir? Clique novamente':'Desistir'}</button>
          <button onClick={()=>{window.dispatchEvent(new CustomEvent('shinobi-save'));setGamePanel(null);setPage('home');}}>Salvar e sair</button>
          <button onClick={()=>{clearSavedRun();setResumeRun(null);beginMission();}}>Reiniciar</button>
          <button onClick={()=>changeGamePanel('map')}>Mapa grande</button>
          <button title="Tela cheia" onClick={()=>{void (document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});}}>⛶</button>
          <button onClick={()=>{window.dispatchEvent(new CustomEvent('shinobi-stuck'));setGamePanel(null);}}>Preso</button>
          <button onClick={()=>changeGamePanel('quickmap')}>Mapa</button>
          <button onClick={()=>{setConfirmForfeit(false);setSettingsOpen(true);}}>Configurações</button>
          <button onClick={()=>{const report=`ShinobiBonk · ${hero.name} · ${MAP_BY_ID[mapId].name} · ${mission} · nível ${world.level} · ${Math.floor(world.elapsed)} s · ${world.kills} abates · ${world.fps} FPS · ${navigator.userAgent}`;void navigator.clipboard?.writeText(report).then(()=>window.alert('Relatório copiado. Cole onde quiser relatar o problema.'),()=>window.alert(report));}}>🐞 Relatar</button>
        </div>
        <button className="pause-continue" onClick={()=>changeGamePanel(null)}>Continuar</button>
      </footer>}
      </section></div>}
      </>}
    {settingsOpen && <SettingsScreen onResetAccount={()=>setConfirmReset(true)} settings={settings} onChange={(next) => { setSettings(next); saveSettings(next); }} onClose={() => setSettingsOpen(false)} />}
    {confirmReset&&<div className="modal-backdrop account-reset-backdrop"><section className="account-modal" role="alertdialog" aria-label="Confirmar reset de conta"><h2>Reset de conta</h2><p>Todo o progresso desta conta será apagado. Shinobis, mapas, Lamens, builds, ranking local e missão salva voltarão ao estado inicial do jogo.</p><div className="reward-actions"><button onClick={()=>setConfirmReset(false)}>Cancelar</button><button className="reset-danger" onClick={resetAccount}>Confirmar reset de conta</button></div></section></div>}
    {modal && <LocalAccountDialog profile={profile} close={() => setModal(false)} onCreate={setProfile} />}
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
