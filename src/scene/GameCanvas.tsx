import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { activeTuning, dropChance, tuneThreat } from '../game/tuning';
import { createBossCombat, type BossState } from './bossCombat';
import { createTotemBar } from './narutoTotem';
import { NPC_ALLIES, NPC_RULES, TOTEM_RULES, dealBonuses, dealLabel, dealText, pctText, rollEbisuDeals, rollIrukaLegendary, rollIrukaLesson, type StatDeal } from '../game/npcs';
import { alliesBonuses } from '../game/allies';
import { DebugPanel, type DebugApi } from '../ui/DebugPanel';
import { playSfx } from '../audio/sfx';
import { choiceCount, choiceUses, weaponPrice } from '../game/preparation';
import { ITEM_BY_NAME, rollItems, type Item, type Rarity, type StatKey } from '../game/catalog';
import { HEROES, HERO_BY_ID, skillPool, sandSynergy, ultimateBase, type Technique, type Control } from '../game/heroes';
import { activeSynergies, synergyBonuses, type ActiveSynergy } from '../game/synergy';
import { ZONES, GUARDIAN_RULES, guardianHpMultiplier } from '../game/missions';
import { formAt, portraitRegion } from '../game/evolution';
import { NO_GROWTH, rollGrowth, growthText, ELEMENT_KEY, SENJUTSU, hasSenjutsu, setupNumbers, techniqueDetail, type SkillGrowth } from '../game/combat';
import type { Bonuses } from '../game/catalog';
import { techniqueVisual, disposeObject } from './techniqueEffects';
import { calculateStats, difficultyAt, incomingDamage, rollCritical, type Difficulty, type Stats } from '../game/progression';
import { PILL_NAMES, PILL_BY_NAME, PILL_MAX, pillOfferText, grantPill } from '../game/pills';

export type LevelOffer = { id: string; kind: 'skill'|'pill'|'item'|'stat'; name: string; rarity: Rarity; icon: string; description: string; planned?: boolean; growth?:SkillGrowth; bonus?:Bonuses; deal?:StatDeal; disabled?:string };
export type WorldSnapshot = { allyCharge:number; victory:boolean; remaining:number; hiddenEffects:boolean; totalDamage:number; skillDamage:Record<string,number>; skillGrowth:Record<string,SkillGrowth>; techniques:Technique[]; synergy:boolean; synergies:ActiveSynergy[]; setups:{name:string;remaining:number;duration:number}[]; zone:number; boss:string; defenseProgress:number; banned:string[]; hp: number; maxHp:number; stats:Stats; defeated:boolean; allyDamage:number; difficultyScale:number; level: number; xp: number; xpNext: number; chakra: number; kills: number; runMoney: number; elapsed: number; fps: number; kunai: number; shuriken: number; luck:number; autoUlt:boolean; allies:string[]; weather:string; toast:string; interaction:{name:string;description:string}|null; items: Record<string, number>; pills: Record<string, number>; skillLevels: Record<string,number>; choice: { level: number; cards: LevelOffer[] }|null; sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete'}|null; pickups:{kind:string;x:number;z:number}[];enemies: { x: number; z: number }[]; events: { id: string; name: string; x: number; z: number; icon: string }[]; explored: { x: number; z: number }[]; player: { x: number; z: number }; ping: {x:number;z:number}|null; effects: number; choices:{reroll:number;skip:number;ban:number;banning:boolean}; weaponCost:number; permanent:Record<string,number>; totem?:{hp:number;maxHp:number;remaining:number}|null };
type Drop = { mesh: THREE.Mesh; type: 'xp' | 'lamens' | 'chakra' | 'pill' | 'item'; value: number; name: string };
type Enemy = { heroId?:string; elite?:boolean; guardian?:boolean; control?:Control; controlTime?:number; burn?:number; sprite: THREE.Sprite; hp: number; speed: number; hitTimer: number; windup?:number; attackPoint?:THREE.Vector3; marker?:THREE.Mesh; poison?:{remaining:number;dps:number}; slow?:number; challenge?:boolean; megaElite?:boolean; boss?:BossState; maxHp?:number; shikamaruPlans?:number; hpMultiplier?:number; guardianZone?:number; totem?:boolean; clone?:boolean };
type MapPickup = { id:string; kind:'kunai'|'shuriken'|'ryu'|'sealDrop'; name:string; x:number; z:number; mesh:THREE.Object3D; active:boolean; discovered?:boolean };
type Projectile = {mesh:THREE.Object3D;direction:THREE.Vector3;remaining:number;speed:number;radius:number;technique:Technique;origin:THREE.Vector3;hit:Set<Enemy>;growth:SkillGrowth;ally?:boolean;bounces:number;range:number};
/** Setup (buff puro) ativo no jogador. */
type ActiveSetup = {name:string;remaining:number;duration:number;bonuses:Bonuses;sage:boolean};
/** Preparo base (s) até o acerto das técnicas sem projétil; dividido pela velocidade de projétil. */
const IMPACT_DELAY = { Taijutsu: .14, other: .24 };
export const emptySnapshot: WorldSnapshot = { allyCharge:0, victory:false,remaining:600,hiddenEffects:false,totalDamage:0,skillDamage:{},skillGrowth:{},techniques:skillPool('naruto'),synergy:false,synergies:[],setups:[],zone:1,boss:'',defenseProgress:0,banned:[],hp: 130, maxHp:130, stats:calculateStats('naruto',1), defeated:false, allyDamage:0, difficultyScale:1, level: 1, xp: 0, xpNext: 30, chakra: 0, kills: 0, runMoney: 0, elapsed: 0, fps: 0, kunai: 0, shuriken: 0, luck:0,autoUlt:false,allies:[],weather:'',toast:'',interaction:null,items: {}, pills: {}, skillLevels: {}, choice:null,sealing:null,pickups:[], enemies: [], events: [], explored: [{x:0,z:0}], player: { x: 0, z: 0 }, ping:null, effects: 0,choices:{reroll:3,skip:3,ban:3,banning:false},weaponCost:20,permanent:{} };

export function GameCanvas({ heroId, mission, itemPool, preparation, enabled, paused, onSnapshot, onPanel, debug=false }: { heroId: string; mission:Difficulty; itemPool:Item[]; preparation:{permanent:Record<string,number>;archivedSkills:string[];archivedPills:string[]}; enabled: boolean; paused: boolean; onSnapshot: (snapshot: WorldSnapshot) => void; onPanel: (panel: 'map' | 'quickmap' | 'sheet' | null) => void; debug?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  // Modo debug (F9, só no servidor de desenvolvimento): o painel e seus ganchos só existem com debug=true.
  // Os parâmetros salvos em `tuning` valem sempre, com ou sem o painel.
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
    // Estado do modo debug: god mode e congelamento só são alterados pelo painel debug.
    const debugState={god:false,frozen:false};
    const tune=()=>activeTuning();
    // Multiplicador de HP já aplicado aos inimigos vivos; mudar no painel reescala os vivos na hora.
    let appliedEnemyHp=tune().enemyHp;
    // Ameaça atual com os parâmetros salvos do debug (todos 1 = igual a difficultyAt).
    const threatNow=()=>{const t=tuneThreat(difficultyAt(mission,elapsed,zoneDifficulty),tune());return {...t,cap:Math.max(1,Math.round(t.cap*Math.max(.2,1+ex('enemyCount'))))};};
    const hero=HERO_BY_ID[heroId]??HEROES[0],techniques=skillPool(hero.id),growth:Record<string,SkillGrowth>={},cooldowns:Record<string,number>={},runBuffs:Bonuses={},skillDamage:Record<string,number>={};
    let totalDamage=0,hiddenEffects=false,victory=false,zone=1,ambushTimer=8,guardianSpawned=false,shikamaruPlans=0,defenseTime=0,defenseActive=false,defenseDone=false;
    const config=preparationRef.current,permanent={...config.permanent},uses=choiceUses(permanent),banned=new Set<string>();let banning=false,paidWeapons=0;
    let weather=Math.random()<.5?'Névoa espectral':'Tempestade de areia';const scene = new THREE.Scene(); scene.background = new THREE.Color(weather==='Névoa espectral'?'#6d6a91':'#a9825c'); scene.fog = new THREE.Fog(weather==='Névoa espectral'?'#6d6a91':'#a9825c',weather==='Névoa espectral'?12:26,weather==='Névoa espectral'?44:72);
    const camera = new THREE.OrthographicCamera(-12, 12, 7, -7, 0.1, 150);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight('#d4e9ff', '#35402d', 2.4)); const sun = new THREE.DirectionalLight('#ffe6b0', 3); sun.position.set(-8, 18, 7); scene.add(sun);
    const terrainHeight=(x:number,z:number)=>{const mound=(cx:number,cz:number,rx:number,rz:number,h:number)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));return .35*Math.sin(x*.19)*Math.cos(z*.15)+mound(-9,-8,12,10,5)+mound(13,7,10,13,3.5)+mound(3,-23,21,7,4);};
    const tile=document.createElement('canvas');tile.width=tile.height=64;const tileCtx=tile.getContext('2d')!;tileCtx.fillStyle='#b7c698';tileCtx.fillRect(0,0,64,64);for(let i=0;i<700;i++){const x=(i*37)%64,y=(i*17+Math.floor(i/64)*7)%64;tileCtx.fillStyle=['#91a778','#c5d4ad','#acbd91','#7f996a'][i%4];tileCtx.fillRect(x,y,1+(i%3),1+(i%2));}const groundTexture=new THREE.CanvasTexture(tile);groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;groundTexture.repeat.set(32,32);groundTexture.magFilter=THREE.NearestFilter;groundTexture.colorSpace=THREE.SRGBColorSpace;
    const terrainGeometry=new THREE.PlaneGeometry(100,100,90,90);const terrainPositions=terrainGeometry.attributes.position;const terrainColors:number[]=[];const grass=new THREE.Color('#568c42'),trail=new THREE.Color('#98613d'),stone=new THREE.Color('#555566'),lava=new THREE.Color('#db682f');for(let i=0;i<terrainPositions.count;i++){const x=terrainPositions.getX(i),z=-terrainPositions.getY(i),h=terrainHeight(x,z);terrainPositions.setZ(i,h);let c=grass;if(x<-22)c=trail;else if(h>4.1)c=stone;if(x>23&&z<0)c=lava;const fleck=.92+((Math.sin(x*4.7+z*2.1)*Math.cos(z*5.3))*.09);terrainColors.push(c.r*fleck,c.g*fleck,c.b*fleck);}terrainGeometry.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));terrainGeometry.computeVertexNormals();const ground=new THREE.Mesh(terrainGeometry,new THREE.MeshStandardMaterial({vertexColors:true,map:groundTexture,roughness:1,flatShading:true}));ground.rotation.x=-Math.PI/2;ground.position.y=0;scene.add(ground);
    const texture = new THREE.TextureLoader().load('/assets/shinobi-sprites-atlas.png'); texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;const orochimaruTexture=new THREE.TextureLoader().load('/assets/orochimaru-sprite.svg');orochimaruTexture.colorSpace=THREE.SRGBColorSpace;orochimaruTexture.magFilter=THREE.NearestFilter;orochimaruTexture.minFilter=THREE.NearestFilter;
    const spriteMaterial = (index: number) => { const map=texture.clone(); map.needsUpdate=true; map.repeat.set(.25,1/3); map.offset.set((index%4)*.25+.001, (2-Math.floor(index/4))/3+.001); const mat=new THREE.SpriteMaterial({map,transparent:true,depthWrite:false}); return mat; };
    const makeSprite=(index:number,w=1.8,h=2.2)=>{const sp=new THREE.Sprite(spriteMaterial(index));sp.scale.set(w,h,1);return sp;};
    const heroTextures=new Map<string,THREE.Texture>();
    const heroMaterial=(id:string,lv=1)=>{const r=portraitRegion(id,lv),key=r.path+':'+r.index;let map=heroTextures.get(key);if(!map){map=new THREE.TextureLoader().load(r.path);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(1/r.cols,1/r.rows);map.offset.set((r.index%r.cols)/r.cols,(r.rows-1-Math.floor(r.index/r.cols))/r.rows);heroTextures.set(key,map);}return new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false});};
    const makeHero=(id:string,lv=1)=>{const sprite=new THREE.Sprite(heroMaterial(id,lv));sprite.scale.set(1.65,2.25,1);return sprite;};
    const player=makeHero(heroId);player.position.y=terrainHeight(0,0)+1.15;scene.add(player);
    const environmentMaps=new Map<number,THREE.Texture>(),decor:THREE.Sprite[]=[];
    const environmentSprite=(index:number,width:number,height:number)=>{let map=environmentMaps.get(index);if(!map){map=new THREE.TextureLoader().load('/assets/environment-v2.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(.25,.5);map.offset.set((index%4)*.25,(1-Math.floor(index/4))*.5);environmentMaps.set(index,map);}const obj=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false}));obj.scale.set(width,height,1);return obj;};
    const scenery=(index:number,x:number,z:number,w:number,h:number)=>{const obj=environmentSprite(index,w,h);obj.position.set(x,terrainHeight(x,z)+h*.45,z);scene.add(obj);decor.push(obj);};
    // Keep paths and the spawn clearing open; scatter foliage across hills.
    for(let i=0;i<150;i++){const x=(Math.random()-.5)*94,z=(Math.random()-.5)*94;if(Math.hypot(x,z)<6||Math.abs(x-Math.sin(z*.15)*5)<2.5)continue;const kind=i%9===0?3:i%5===0?2:i%3===0?1:0;scenery(kind,x,z,kind===3?2.4:3.2,kind===3?1.8:4.2);}
    scenery(4,0,-12,7,6);for(const [x,z] of [[-7,-17],[7,-18],[-10,18],[12,19]])scenery(7,x,z,5.5,5.5);
    const eventDefs=[{id:'shikamaru',name:'Plano do Shikamaru',x:14,z:8,icon:'♟️',sprite:8},{id:'guardian-seal',name:'Selo do guardião',x:2,z:-12,icon:'⚔️',sprite:8},{id:'challenge',name:'Altar de desafio',x:-14,z:9,icon:'⛩️',sprite:9},{id:'orochimaru',name:'Maldição de Orochimaru',x:9,z:-18,icon:'🐍',sprite:10},{id:'altar',name:'Altar para proteger',x:-17,z:-13,icon:'🛕',sprite:11},{id:'trader',name:'Mercador de armas',x:-3,z:18,icon:'🥷',sprite:8},{id:'slot',name:'Caça-níquel',x:5,z:18,icon:'🎰',sprite:8},{id:'tsunade',name:'Bênção de Tsunade',x:20,z:-12,icon:'✚',sprite:8},{id:'kakashi',name:'Sharingan de Kakashi',x:-21,z:-1,icon:'👁',sprite:8},{id:'ichiraku',name:'Barraca Ichiraku',x:13,z:21,icon:'🍜',sprite:8},{id:'ebisu',name:'Treino de Elite do Ebisu',x:25,z:5,icon:'🕶',sprite:8},{id:'iruka',name:'Aula do Iruka',x:-24,z:14,icon:'📚',sprite:8}];
    const events=eventDefs.map(def=>{const obj=environmentSprite(def.id==='ichiraku'?5:def.id==='trader'?7:6,def.id==='ichiraku'?4:3.2,def.id==='ichiraku'?3.4:3.2);if(def.id==='tsunade'||def.id==='kakashi'||def.id==='shikamaru'||def.id==='ebisu'||def.id==='iruka'){obj.material.dispose();obj.material=heroMaterial(def.id);if(def.id==='ebisu'||def.id==='iruka')obj.scale.set(2,2.75,1);}if(def.id==='orochimaru'){obj.material.dispose();obj.material=heroMaterial('orochimaru');obj.scale.set(2.2,3.1,1);}obj.position.set(def.x,terrainHeight(def.x,def.z)+1.4,def.z);obj.visible=false;scene.add(obj);return { ...def, obj, discovered:false, uses:0, active:true };});
    // Kakashi (NPC): copia 1 item que o jogador já carrega. A escolha usa choiceLevel=-1; o evento só é gasto ao copiar.
    let kakashiEvent:(typeof events)[number]|null=null;
    const enemyList:Enemy[]=[],drops:Drop[]=[],shots:Projectile[]=[],keys=new Set<string>(),knownItems:Record<string,number>={},knownPills:Record<string,number>={},skillLevels:Record<string,number>={},exploredCells=new Map<string,{x:number;z:number}>(),pickups:MapPickup[]=[],allies:string[]=[];let choiceData:LevelOffer[]|null=null,choiceLevel=1,kunai=0,shuriken=0,sealing:{heroId:string;target:string;phase:'ready'|'sealing'|'complete'}|null=null,sealTimer=0,damageMultiplier=1,luck=0;
    const pendingSeals:{heroId:string;target:string;phase:'ready'}[]=[];
    let bonusHp=0,defeated=false,invulnerability=0,allyDamage=0,pendingItemRewards=0;
    let stats=calculateStats(heroId,1,{},{},0,permanent),allyTimer=0;
    const allyActors:THREE.Sprite[]=[];
    const activeSetups:ActiveSetup[]=[],pendingHits:{time:number;run:()=>void}[]=[];
    /** Teste: força a chance da linha Senjutsu (null = valor normal). */
    let senjutsuOverride:number|null=null,senjutsuProcs=0;
    const sageModeActive=()=>activeSetups.some(s=>s.sage);
    /** Intervalo do ataque dos ajudantes: velocidade dos ajudantes × metade do bônus de cadência do herói. */
    const allyInterval=()=>1.5/Math.max(.1,stats.allySpeed*(1+(stats.attackSpeed-1)*.5));
    const refreshStats=(healGrowth=false)=>{const oldMax=stats.maxHp;
      // Buffs da run = escolhas de "Powerlevel" + buff único de cada ajudante (× força de suporte) + sinergia da Areia. Recalculado das fontes a cada quadro.
      const buffs:Bonuses={...runBuffs};for(const [key,value] of Object.entries(alliesBonuses(allies,stats.allyBuff)))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      // Sinergias de aldeia/organização (src/game/synergy.ts); Irmãos da Areia completos mantêm +12 armadura / +15% dano.
      for(const [key,value] of Object.entries(synergyBonuses(activeSynergies(heroId,allies))))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      // Setups ativos (Portões, Byakugou, Modo Sábio...): bônus temporários, somados enquanto durarem.
      for(const setup of activeSetups)for(const [key,value] of Object.entries(setup.bonuses))buffs[key as keyof Bonuses]=(buffs[key as keyof Bonuses]||0)+(value as number);
      stats=calculateStats(heroId,level,knownItems,knownPills,bonusHp,permanent,buffs);luck=stats.luck;hp=Math.min(stats.maxHp,hp+(healGrowth?Math.max(0,stats.maxHp-oldMax):0));};
    // Mecânicas de item (catálogo): soma de bônus por chave, recalculada das fontes junto com os atributos.
    const ex=(key:StatKey)=>stats.extra[key]||0;
    const kunaiPrice=()=>Math.round(weaponPrice(paidWeapons)*(1-Math.min(.4,ex('kunaiDiscount'))));
    const slotPrice=()=>Math.round(25*(1-Math.min(.24,ex('slotDiscount'))));
    let timeSinceHit=99,rushTimer=0,shieldReady=true,shieldTimer=0,emergencyCd=0,periodicTimer=30,boltTimer=2.5,beamTimer=6,freezeCd=0,ultBuffTimer=0,stillTime=0,revives35=0,revives60=0;
    const lastPos=new THREE.Vector3();
    /** Multiplicador temporário de cadência: Selo de Adrenalina, Postura de Pedra parado e Pergaminho do Hokage após a Ultimate. */
    const tempAttackSpeed=()=>1+(rushTimer>0?.12:0)+(ex('stance')>0&&stillTime>.5?.08:0)+(ultBuffTimer>0?.3:0);
    const grantItem=(name:string)=>{const item=ITEM_BY_NAME[name];if(!item||(knownItems[name]||0)>=item.max)return;knownItems[name]=(knownItems[name]||0)+1;refreshStats(true);};
    const recruitAlly=(id:string)=>{if(allyActors.length>=stats.supportSlots||allies.includes(id))return false;const sprite=makeHero(id);sprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(sprite);allyActors.push(sprite);allies.push(id);addRing(sprite.position,'#61ffa8',1);refreshStats(true);return true;};
    const revealAround=(x:number,z:number)=>{const cx=Math.round(x/5),cz=Math.round(z/5);for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){if(ox*ox+oz*oz>2)continue;const gx=cx+ox,gz=cz+oz,key=`${gx},${gz}`;if(!exploredCells.has(key))exploredCells.set(key,{x:gx*5,z:gz*5});}};revealAround(0,0);
    const pillNames=PILL_NAMES.filter(name=>!config.archivedPills.includes(name));
    skillLevels[hero.skills[0]]=1;
    const toOffer=(item:Item,index:number):LevelOffer=>({id:item.id+'-'+index,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:item.description+' Você tem '+(knownItems[item.name]||0)+'/'+item.max+'.'});
    const reserveOffer=():LevelOffer=>{const options:[string,Bonuses,string][]=[['Vitalidade',{health:6},'+6 HP e cura do valor acrescentado.'],['Força',{damage:.02},'+2% dano total.'],['Precisão',{crit:.005},'+0,5 ponto de chance crítica.'],['Agilidade',{move:.01},'+1% movimento.'],['Resistência',{defense:1},'+1 armadura.'],['Cadência',{attackSpeed:.01},'+1% velocidade de ataque.']];const [name,bonus,description]=options[Math.floor(Math.random()*options.length)];return{id:'power-'+name,kind:'stat',name,rarity:'Comum',icon:'↑',bonus,description:'Powerlevel · '+description};};
    const rollMegaLoot=():LevelOffer[]=>{const rolled=rollItems(itemPoolRef.current.filter(i=>!banned.has(i.name)),knownItems,stats.luck,choiceCount(permanent));return rolled.length?rolled.map(toOffer):[reserveOffer()];};
    /** Afixos acumulados de uma técnica somados a um afixo oferecido (para mostrar os números após a escolha). */
    const growthAfter=(name:string,extra:SkillGrowth):SkillGrowth=>{const g={...(growth[name]??NO_GROWTH)};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])g[key]+=extra[key]||0;return g;};
    const knowsSageMode=()=>techniques.some(t=>t.setup?.sage&&skillLevels[t.name]);
    const rollLevelOffers=():LevelOffer[]=>{
      const learned=Object.keys(skillLevels).length,maxSkills=permanent['Quarta técnica']?4:3;
      const skills=techniques.filter(t=>t.unlockLevel<=level&&!config.archivedSkills.includes(t.name)&&!banned.has(t.name)&&(skillLevels[t.name]||0)<9+ex('skillCap')&&((skillLevels[t.name]||0)>0||learned<maxSkills));
      // Level-up oferece SOMENTE técnicas e pílulas (itens vêm apenas de recompensas via rollMegaLoot).
      // Regra: até 2 técnicas; o restante são pílulas distintas; se faltar um tipo, completa com o outro.
      const total=choiceCount(permanent),cards:LevelOffer[]=[];
      const pills=pillNames.filter(name=>!banned.has(name)&&(knownPills[name]||0)<(PILL_BY_NAME[name]?.max??PILL_MAX)+ex('pillCap'));
      const skillCard=()=>{const t=skills.splice(Math.floor(Math.random()*skills.length),1)[0],roll=rollGrowth(stats.luck,t),current=skillLevels[t.name]||0;cards.push({id:'skill-'+t.name,kind:'skill',name:t.name,rarity:roll.rarity,growth:roll.growth,icon:'⚔️',description:(current?'Nível '+current+' → '+(current+1):'Nova técnica · '+t.school+' · '+t.shape)+'. '+growthText(roll.growth,t)+(t.status?' · '+t.status:'')+' — '+techniqueDetail(t,growthAfter(t.name,roll.growth),stats.sage>0,knowsSageMode())});};
      const pillCard=()=>{const pill=pills.splice(Math.floor(Math.random()*pills.length),1)[0];cards.push({id:'pill-'+pill,kind:'pill',name:pill,rarity:'Comum',icon:PILL_BY_NAME[pill]?.glyph??'💊',description:pillOfferText(pill,knownPills[pill]||0)});};
      const skillTarget=Math.max(Math.min(2,skills.length),total-pills.length);
      while(cards.length<skillTarget&&skills.length)skillCard();
      while(cards.length<total&&pills.length)pillCard();
      while(cards.length<total&&skills.length)skillCard();
      if(!cards.length)cards.push(reserveOffer());
      return cards.slice(0,choiceCount(permanent));
    };
    // Barraca Ichiraku: esquecer pílula/técnica pagando Ryu, quantas vezes quiser (choiceLevel=-2; evento nunca se esgota).
    const forgetPrice=(level:number)=>10+5*Math.max(1,level);
    function openIchiraku(){
      const learned=Object.entries(skillLevels).filter(([,lv])=>lv>0),pills=Object.entries(knownPills).filter(([,lv])=>lv>0);
      const cards:LevelOffer[]=[];
      // A última técnica não pode ser esquecida: o personagem precisa atacar.
      if(learned.length>1)for(const [name,lv] of learned){const t=techniques.find(x=>x.name===name);cards.push({id:'forget-skill-'+name,kind:'skill',name,rarity:'Comum',icon:'⚔️',description:`Esquecer técnica Nv. ${lv}${t?' · '+t.school+' · '+t.shape:''}. Libera o espaço e ela pode voltar nas ofertas. Custa ${forgetPrice(lv)} Ryu.`});}
      for(const [name,lv] of pills)cards.push({id:'forget-pill-'+name,kind:'pill',name,rarity:'Comum',icon:'💊',description:`Esquecer pílula Nv. ${lv}: remove todos os níveis e recalcula os atributos. Custa ${forgetPrice(lv)} Ryu.`});
      if(!cards.length){choiceData=null;eventToast=learned.length===1&&!pills.length?'Ichiraku: sua única técnica não pode ser esquecida e você não tem pílulas.':'Ichiraku: nada para esquecer.';return false;}
      choiceLevel=-2;banning=false;choiceData=cards;keys.clear();return true;
    }
    function forgetAtIchiraku(offer:LevelOffer){
      const level=offer.kind==='pill'?knownPills[offer.name]||0:skillLevels[offer.name]||0,price=forgetPrice(level);
      if(runMoney<price){eventToast=`Ichiraku: faltam ${price-runMoney} Ryu para esquecer ${offer.name}.`;return;}
      runMoney-=price;
      if(offer.kind==='pill')delete knownPills[offer.name];
      else{delete skillLevels[offer.name];delete growth[offer.name];delete cooldowns[offer.name];const active=activeSetups.findIndex(a=>a.name===offer.name);if(active>=0)activeSetups.splice(active,1);}
      refreshStats();playSfx('pickup');
      eventToast=`Ichiraku: ${offer.name} esquecida por ${price} Ryu.`;
      if(!openIchiraku()){choiceData=null;keys.clear();}
    }
    function rewardAction(action:'reroll'|'skip'|'ban'){
      // Ebisu/Iruka: só X (sair sem gastar o evento); no pergaminho lendário, X volta ao menu da Iruka.
      if(choiceData&&choiceLevel<=-3){if(action!=='skip')return;if(choiceLevel===-5){choiceLevel=-4;choiceData=irukaMenu();keys.clear();return;}const who=npcEvent?.id==='ebisu'?'Ebisu':'Iruka';npcEvent=null;choiceData=null;keys.clear();eventToast=who+': volte quando quiser (a oferta continua guardada).';return;}
      if(choiceData&&choiceLevel===-2){if(action==='skip'){choiceData=null;keys.clear();eventToast='Volte à Barraca Ichiraku quando quiser.';}return;}
      // Na cópia do Kakashi não há atualizar/banir; X só fecha sem gastar o evento nem usos.
      if(choiceData&&choiceLevel===-1){if(action==='skip'){choiceData=null;kakashiEvent=null;keys.clear();eventToast='Kakashi: cópia adiada. Volte quando quiser.';}return;}
      if(!choiceData||defeated||sealing||uses[action]<=0)return;
      if(action==='ban'){banning=!banning;return;}
      uses[action]--;banning=false;
      if(action==='skip'){choiceData=null;keys.clear();eventToast='Recompensa pulada; usos restantes: '+uses.skip;}
      else choiceData=choiceLevel===0?rollMegaLoot():rollLevelOffers();
    }
    function openKakashi(event:(typeof events)[number]){
      const copyable=Object.entries(knownItems).filter(([name,count])=>count>0&&ITEM_BY_NAME[name]&&count<ITEM_BY_NAME[name].max).map(([name])=>ITEM_BY_NAME[name]);
      if(!copyable.length){eventToast=Object.keys(knownItems).length?'Kakashi: todos os itens da sua bolsa já estão no limite.':'Kakashi: você ainda não tem itens na bolsa para copiar.';return;}
      const order=['Lendário','Épico','Raro','Incomum','Comum'];copyable.sort((a,b)=>order.indexOf(a.rarity)-order.indexOf(b.rarity));
      choiceLevel=-1;banning=false;kakashiEvent=event;keys.clear();
      choiceData=copyable.map((item,i)=>({id:'copy-'+item.id+'-'+i,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:'Copiar: '+item.description+' Você tem '+knownItems[item.name]+'/'+item.max+' → '+(knownItems[item.name]+1)+'.'}));
      eventToast='Kakashi: escolha um item da sua bolsa para o Sharingan copiar.';
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
    function chooseLevelOffer(index:number){const offer=choiceData?.[index];if(!offer)return;
      if(choiceLevel<=-3){chooseNpcOffer(offer);return;}
      if(choiceLevel===-2){forgetAtIchiraku(offer);return;}
      if(choiceLevel===-1){grantItem(offer.name);if(kakashiEvent)kakashiEvent.active=false;kakashiEvent=null;choiceData=null;keys.clear();eventToast='Kakashi copiou '+offer.name+' (agora '+(knownItems[offer.name]||0)+'/'+(ITEM_BY_NAME[offer.name]?.max??'?')+').';playSfx('pickup');return;}
      if(banning){if(offer.kind==='stat'){eventToast='Vitalidade é a opção de reserva e não pode ser banida.';return;}banned.add(offer.name);uses.ban--;banning=false;eventToast=offer.name+' banido das próximas ofertas desta run';choiceData=choiceLevel===0?rollMegaLoot():rollLevelOffers();return;}if(offer.kind==='skill'){skillLevels[offer.name]=Math.min(9+ex('skillCap'),(skillLevels[offer.name]||0)+1);const previous=growth[offer.name]??{...NO_GROWTH};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])previous[key]+=offer.growth?.[key]||0;growth[offer.name]=previous;}if(offer.kind==='pill')grantPill(knownPills,offer.name,1,ex('pillCap'));if(offer.kind==='item')grantItem(offer.name);if(offer.kind==='stat'&&offer.bonus){for(const key of Object.keys(offer.bonus) as (keyof Bonuses)[])runBuffs[key]=(runBuffs[key]||0)+(offer.bonus[key]||0);}refreshStats(true);choiceData=null;keys.clear();}
    let yaw=Math.PI/4, pitch=.74, zoom=19, drag=false,lastX=0,lastY=0,spawnTimer=1,megaTimer=30+Math.random()*25,megaElitesSpawned=0,snapshotTimer=0,chakra=0,hp=stats.maxHp,level=1,xp=0,xpNext=30,kills=0,runMoney=0,frames=0,fps=0,fpsTimer=0,autoUlt=false,last=performance.now(),elapsed=0,eventToast='',zoneDifficulty=1,xpMultiplier=1,lootMultiplier=1;
    const effects:THREE.Mesh[]=[],visuals:{object:THREE.Object3D;life:number}[]=[],numbers:{sprite:THREE.Sprite;life:number}[]=[];let currentPing:{x:number;z:number}|null=null;
    const onKeyDown=(e:KeyboardEvent)=>{const key=e.key.toLowerCase(); if(e.target instanceof HTMLElement&&e.target.matches('input,select,textarea'))return;if(e.repeat&&['m','tab','p','e','r','g','y','h'].includes(key))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(key))e.preventDefault();if(!enabledRef.current||defeated||victory)return;if(sealing){if(key==='e'&&sealing.phase==='ready'){if(allyActors.length>=stats.supportSlots||allies.includes(sealing.heroId)){eventToast='Equipe cheia: G para receber um item.';return;}sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;eventToast='O selo está prendendo o chakra do inimigo…';playSfx('ultimate');}else if(key==='g'&&sealing.phase==='ready'){spawnPickup('sealDrop',player.position.x,player.position.z);sealing=pendingSeals.shift()??null;eventToast='Selamento recusado: recolha o drop do mega elite para escolher um item';}else if((key==='enter'||key==='e')&&sealing.phase==='complete'){sealing=pendingSeals.shift()??null;eventToast='Shinobi selado e adicionado à equipe desta missão';}return;}if(choiceData){if(key==='p'){onPanelRef.current('sheet');return;}if(key==='escape'){onPanelRef.current(null);return;}if(e.repeat||pausedRef.current&&document.querySelector('.game-panel-backdrop'))return;if(key==='f'){rewardAction('reroll');return;}if(key==='x'){rewardAction('skip');return;}if(key==='z'){rewardAction('ban');return;}if(/^[1-9]$/.test(key))chooseLevelOffer(Number(key)-1);return;}if(key==='m'){onPanelRef.current('map');return;}if(key==='tab'){onPanelRef.current('quickmap');return;}if(key==='p'){onPanelRef.current('sheet');return;}if(pausedRef.current){if(key==='escape')onPanelRef.current(null);return;}if(key==='g'){currentPing={x:player.position.x,z:player.position.z};return;}if(key==='e'){interact();return;}if(key==='escape'){onPanelRef.current(null);return;}if(key==='h'){hiddenEffects=!hiddenEffects;for(const effect of effects)effect.visible=!hiddenEffects;for(const shot of shots)shot.mesh.visible=!hiddenEffects;for(const fx of visuals)fx.object.visible=!hiddenEffects;for(const n of numbers)n.sprite.visible=!hiddenEffects;return;}if(key==='y'){onToggleAuto();return;}if(key==='r'){castUltimate();return;}keys.add(key);};
    // Ultimate automática: tecla Y ou clique no selo AUTO do botão R (evento shinobi-toggle-auto-ult).
    function onToggleAuto(){if(enabledRef.current&&!defeated&&!victory)autoUlt=!autoUlt;}window.addEventListener('shinobi-toggle-auto-ult',onToggleAuto);
    const onKeyUp=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());
    const onBlur=()=>keys.clear();
    const onDown=(e:PointerEvent)=>{if(e.button===2){drag=true;lastX=e.clientX;lastY=e.clientY;container.setPointerCapture(e.pointerId);}};
    const onMove=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.18,Math.min(1.48,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;};
    const onUp=()=>{drag=false;};const onContext=(e:MouseEvent)=>e.preventDefault();
    const onWheel=(e:WheelEvent)=>{zoom=Math.max(10,Math.min(32,zoom+Math.sign(e.deltaY)*1.6));resize();};
    const onPing=(event:Event)=>{const p=(event as CustomEvent<{x:number;z:number}>).detail;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z))currentPing={x:THREE.MathUtils.clamp(p.x,-48,48),z:THREE.MathUtils.clamp(p.z,-48,48)};};window.addEventListener('shinobi-ping',onPing);
    // Clique numa carta (qualquer quantidade de cartas, ex.: cópia do Kakashi com muitos itens).
    const onChoose=(event:Event)=>{const index=(event as CustomEvent<number>).detail;if(!enabledRef.current||defeated||victory||!choiceData||sealing||!Number.isInteger(index))return;if(document.querySelector('.game-panel-backdrop'))return;chooseLevelOffer(index);};window.addEventListener('shinobi-choose',onChoose);
    window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);
    container.addEventListener('pointerdown',onDown);container.addEventListener('pointermove',onMove);container.addEventListener('pointerup',onUp);container.addEventListener('pointercancel',onUp);container.addEventListener('contextmenu',onContext);container.addEventListener('wheel',onWheel,{passive:true});
    const resize=()=>{const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight,a=w/h;camera.left=-zoom*a/2;camera.right=zoom*a/2;camera.top=zoom/2;camera.bottom=-zoom/2;camera.updateProjectionMatrix();renderer.setSize(w,h);};resize();const observer=new ResizeObserver(resize);observer.observe(container);
    const v1=new THREE.Vector3(),v2=new THREE.Vector3(),dir=new THREE.Vector3(),offset=new THREE.Vector3();
    const addRing=(position:THREE.Vector3,color:string,size:number)=>{if(hiddenEffects)return;const ring=new THREE.Mesh(new THREE.TorusGeometry(size,.11,6,24),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.copy(position);ring.position.y=terrainHeight(position.x,position.z)+.18;scene.add(ring);effects.push(ring);};
    // Chefes (mega elites e guardiões): barra de vida 3D e técnicas do personagem com aviso no chão.
    let playerSlow=0;
    /** Todo dano recebido passa aqui: escudo, evasão, armadura (+Postura de Pedra), espinhos, adrenalina, fumaça, gelo de Haku e ressurreição. */
    function damagePlayer(raw:number,attacker?:Enemy,slow=0){
      if(invulnerability>0||defeated||debugState.god)return false;
      if(ex('shield')>0&&shieldReady){shieldReady=false;shieldTimer=14;invulnerability=.25;addRing(player.position,'#7fd3ff',1.1);eventToast='Escudo de Chakra bloqueou o golpe!';return false;}
      if(Math.random()<stats.evasion)return false;
      hp=Math.max(0,hp-incomingDamage(raw,stats.armor*(ex('stance')>0&&stillTime>.5?1.3:1)));invulnerability=.25;timeSinceHit=0;addRing(player.position,'#ff535a',.8);
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
    function spawnEnemy(challenge=false,megaElite=false,guardian=false,forcedId?:string){const candidates=HEROES.filter(h=>!allies.includes(h.id)),id=forcedId??(guardian?ZONES[zone-1].guardians[Math.floor(Math.random()*ZONES[zone-1].guardians.length)]:candidates[Math.floor(Math.random()*candidates.length)]?.id)??heroId,angle=Math.random()*Math.PI*2,r=challenge?7:megaElite?12:10+Math.random()*8,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*r,-47,47),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*r,-47,47),elite=!megaElite&&Math.random()<.08;
      const e=megaElite?makeHero(id,Math.max(1,level)):makeSprite(4+Math.floor(Math.random()*4),elite?1.9:1.55,elite?2.5:2);if(megaElite)e.scale.multiplyScalar(1.4);e.position.set(x,terrainHeight(x,z)+(megaElite?1.6:1),z);if(elite)e.material.color.set('#ffb969');scene.add(e);const threat=threatNow();const enemy:Enemy={sprite:e,hp:(megaElite?260:elite?60:challenge?30:22)*threat.hp*(guardian?guardianHpMultiplier(zoneElapsed()):1),speed:megaElite?2.6:elite?3.8:2.8+Math.random()*.8,hitTimer:.2,challenge,megaElite,elite,guardian,heroId:megaElite?id:undefined};if(guardian){enemy.hpMultiplier=guardianHpMultiplier(zoneElapsed());enemy.shikamaruPlans=shikamaruPlans;enemy.guardianZone=zone;}enemy.maxHp=enemy.hp;enemyList.push(enemy);if(megaElite)bossCombat.attach(enemy,enemy.hp,guardian);return enemy;}
    // Guardião (chefe final da zona): 1 por zona. Invocado pelo Selo do guardião (E) ou, se o jogador não invocar, automaticamente em guardianAt.
    function zoneElapsed(){return elapsed-ZONES[zone-1].start;}
    function summonGuardian(auto:boolean){if(guardianSpawned)return null;guardianSpawned=true;const seal=events.find(e=>e.id==='guardian-seal');if(seal)seal.active=false;const g=spawnEnemy(false,true,true);eventToast=(auto?'O guardião perdeu a paciência e chegou! ':'Guardião invocado! ')+HERO_BY_ID[g.heroId!].name+' · HP ×'+(g.hpMultiplier??1).toFixed(2)+(shikamaruPlans?' · Plano do Shikamaru '+shikamaruPlans+'/'+GUARDIAN_RULES.shikamaruMaxPlans:'');return g;}
    /** Naruto Totem (Academia): parado, sem ataque próprio, não é mega elite nem pode ser selado. */
    function spawnTotem(){if(totemSpawned)return null;totemSpawned=true;totemDiscovered=false;totemResult='';totemCloneTimer=1;
      const angle=Math.random()*Math.PI*2,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*TOTEM_RULES.distance,-44,44),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*TOTEM_RULES.distance,-44,44);
      const sprite=makeHero('naruto',1);sprite.scale.multiplyScalar(1.5);sprite.position.set(x,terrainHeight(x,z)+1.7,z);scene.add(sprite);totemPos.set(x,0,z);
      const hp=TOTEM_RULES.baseHp*threatNow().hp;totem={sprite,hp,maxHp:hp,speed:0,hitTimer:99,totem:true};enemyList.push(totem);
      totemBar=createTotemBar(scene);totemBar.follow(sprite);totemBar.draw(1,TOTEM_RULES.end-elapsed);
      eventToast=`Naruto Totem apareceu a ${TOTEM_RULES.distance} m! Destrua-o antes de 6:00 para ganhar ${TOTEM_RULES.levels} níveis. Ele invoca clones das sombras sem parar.`;return totem;}
    /** Clone das sombras: monstro fraco que corre direto até o jogador; surge a 6–50 m do jogador. */
    function spawnTotemClone(){const angle=Math.random()*Math.PI*2,r=TOTEM_RULES.radiusMin+Math.random()*(TOTEM_RULES.radius-TOTEM_RULES.radiusMin),x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*r,-47,47),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*r,-47,47);
      const sprite=makeHero('naruto',1);sprite.scale.multiplyScalar(.82);sprite.position.set(x,terrainHeight(x,z)+1,z);scene.add(sprite);const hp=TOTEM_RULES.cloneHp*threatNow().hp;
      enemyList.push({sprite,hp,maxHp:hp,speed:TOTEM_RULES.cloneSpeed,hitTimer:.3,clone:true});}
    /** Clones somem em fumaça (sem recompensa) quando o totem cai ou expira. */
    function dispelClones(){for(const e of enemyList.filter(e=>e.clone)){disposeEnemySprite(e);enemyList.splice(enemyList.indexOf(e),1);if(!hiddenEffects)addRing(e.sprite.position,'#f2f2f2',.5);}}
    function disposeEnemySprite(e:Enemy){scene.remove(e.sprite);e.sprite.material.dispose();if(e.marker){scene.remove(e.marker);e.marker.geometry.dispose();(e.marker.material as THREE.Material).dispose();e.marker=undefined;}}
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
    function useShikamaruPlan(){const max=GUARDIAN_RULES.shikamaruMaxPlans;if(shikamaruPlans>=max){eventToast=`Plano do Shikamaru: limite de ${max}/${max} atingido nesta zona`;return false;}shikamaruPlans++;const ev=events.find(e=>e.id==='shikamaru');if(ev)ev.uses=shikamaruPlans;for(const e of enemyList)if(e.guardian&&e.guardianZone===zone)e.shikamaruPlans=shikamaruPlans;eventToast=`Plano do Shikamaru ${shikamaruPlans}/${max}: guardião da zona deixará ${1+shikamaruPlans} kunais`;return true;}
    const pickupTextures=new Map<string,THREE.Texture>();
    function spawnPickup(kind:MapPickup['kind'],x:number,z:number){const icon=kind==='shuriken'?'shuriken':'kunai';let mesh:THREE.Object3D;if(kind==='ryu')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.1,8),new THREE.MeshBasicMaterial({color:'#ffd64e'}));else{let map=pickupTextures.get(icon);if(!map){map=new THREE.TextureLoader().load('/assets/icons/'+icon+'.svg');map.magFilter=THREE.NearestFilter;map.colorSpace=THREE.SRGBColorSpace;pickupTextures.set(icon,map);}mesh=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthWrite:false}));mesh.scale.set(1.2,1.2,1);}mesh.position.set(x,terrainHeight(x,z)+.7,z);scene.add(mesh);pickups.push({id:'pickup-'+pickups.length,kind,name:kind==='sealDrop'?'Kunai de recompensa grátis':kind==='ryu'?'Bolsa de Ryu':kind==='kunai'?'Kunai':'Shuriken',x,z,mesh,active:true});}
    for(let i=0;i<25;i++){spawnPickup((['kunai','shuriken','ryu'] as const)[i%3],(Math.random()-.5)*80,(Math.random()-.5)*80);}
    function interact(){let bestPickup:MapPickup|undefined,bestDistance=2;for(const pickup of pickups){if(!pickup.active)continue;const d=Math.hypot(pickup.x-player.position.x,pickup.z-player.position.z);if(d<bestDistance){bestDistance=d;bestPickup=pickup;}}if(bestPickup){if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){const cost=kunaiPrice();if(runMoney<cost){eventToast='São necessários '+cost+' Ryu para abrir esta recompensa.';return;}runMoney-=cost;paidWeapons++;}bestPickup.active=false;scene.remove(bestPickup.mesh);if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){if(bestPickup.kind==='kunai')kunai++;else shuriken++;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}else if(bestPickup.kind==='sealDrop'){choiceLevel=0;choiceData=rollMegaLoot();eventToast=`Sorte ${luck}: escolha o item deixado pelo mega elite`;}else runMoney+=10;if(bestPickup.kind!=='sealDrop')eventToast=`${bestPickup.name} coletado`;playSfx('pickup');return;}const event=events.filter(e=>e.active).sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0];if(!event||Math.hypot(event.x-player.position.x,event.z-player.position.z)>3.6)return;if(event.id==='shikamaru'){useShikamaruPlan();return;}if(event.id==='guardian-seal'){summonGuardian(false);return;}if(event.id==='orochimaru'){event.active=false;zoneDifficulty*=1.2;xpMultiplier*=1.25;lootMultiplier*=1.25;eventToast='Maldição de Orochimaru: +20% dificuldade · +25% XP e saque';return;}if(event.id==='tsunade'){event.active=false;const blessings=['+12% dano de ataque','+24 HP máximo e cura','+15% XP da run'],blessing=blessings[Math.floor(Math.random()*blessings.length)];if(blessing.includes('dano'))damageMultiplier*=1.12;else if(blessing.includes('HP')){bonusHp+=24;refreshStats(true);}else xpMultiplier*=1.15;eventToast=`Tsunade concedeu a bênção RNG: ${blessing}`;return;}if(event.id==='kakashi'){openKakashi(event);return;}if(event.id==='ebisu'){openEbisu(event);return;}if(event.id==='iruka'){openIruka(event);return;}if(event.id==='ichiraku'){if(openIchiraku())eventToast='Barraca Ichiraku: escolha o que esquecer (pague em Ryu).';return;}if(event.id==='trader'){const total=kunai+shuriken;if(!total){eventToast='Mercador: não há kunais ou shurikens para trocar';return;}runMoney+=total*5;kunai=0;shuriken=0;eventToast='Trocou armas por Ryu';return;}if(event.id==='slot'){const sc=slotPrice();if(runMoney<sc){eventToast='Caça-níquel: são necessários '+sc+' Ryu';return;}runMoney-=sc;const roll=Math.random();if(roll<.34)kunai++;else if(roll<.68)shuriken++;else if(roll<.86&&pillNames.length){const pill=pillNames[Math.floor(Math.random()*pillNames.length)];if(grantPill(knownPills,pill,1,ex('pillCap')))refreshStats(true);}else{pendingItemRewards++;}eventToast='Caça-níquel girado por '+sc+' Ryu';return;}if(event.id==='altar'){defenseActive=true;event.active=false;defenseTime=0;eventToast='Proteja o altar: permaneça no círculo por 20 segundos.';return;}event.active=false;for(let i=0;i<6;i++)spawnEnemy(true);eventToast=`Desafio iniciado em ${event.name}: derrote a horda para receber uma kunai grátis`;
    }
    function addDrop(position:THREE.Vector3,type:Drop['type'],value:number,name=''){const color=type==='xp'?'#51d7ff':type==='lamens'?'#ffd44e':type==='chakra'?'#be70ff':type==='pill'?'#ff77bc':'#f28448';const orb=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.42),new THREE.MeshBasicMaterial({color}));orb.position.copy(position);orb.position.y=terrainHeight(position.x,position.z)+.45;scene.add(orb);drops.push({mesh:orb,type,value,name});}
    function removeEnemy(enemy:Enemy){const i=enemyList.indexOf(enemy);if(i<0)return;
      // Naruto Totem e clones: recompensas próprias (2 níveis / só XP), nunca selamento nem saque de mega elite.
      if(enemy.totem){endTotem('derrotado');return;}
      if(enemy.clone){const at=enemy.sprite.position.clone();enemyList.splice(i,1);disposeEnemySprite(enemy);kills++;addDrop(at,'xp',Math.round(TOTEM_RULES.cloneXp*xpMultiplier));if(!hiddenEffects)addRing(at,'#f2f2f2',.45);return;}const defeatedAt=enemy.sprite.position.clone();scene.remove(enemy.sprite);enemy.sprite.material.dispose();if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();}enemyList.splice(i,1);bossCombat.dispose(enemy);kills++;if(ex('killHeal')>0&&!defeated&&Math.random()<ex('killHeal'))hp=Math.min(stats.maxHp,hp+stats.maxHp*.02);if(enemy.megaElite){const pending={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready' as const};if(sealing)pendingSeals.push(pending);else sealing=pending;eventToast='Mega elite derrotado: escolha selar com E ou recusar com G';}if(enemy.guardian){const plans=Math.min(GUARDIAN_RULES.shikamaruMaxPlans,enemy.shikamaruPlans??0);for(let n=0;n<1+plans;n++)spawnPickup('sealDrop',defeatedAt.x+n,defeatedAt.z);eventToast='Guardião derrotado! '+(1+plans)+' kunai'+(plans?'s grátis no chão (Plano do Shikamaru +'+plans+').':' grátis no chão.');}if(enemy.challenge&&!enemyList.some(e=>e.challenge)){spawnPickup('sealDrop',defeatedAt.x,defeatedAt.z);eventToast='Desafio concluído: kunai grátis no chão';}addDrop(defeatedAt,'xp',Math.round((enemy.megaElite?100:8)*xpMultiplier));const t=tune();if(Math.random()<dropChance(Math.min(.95,.72*lootMultiplier),t.ryuDrop))addDrop(defeatedAt,'lamens',Math.max(1,Math.round(3*lootMultiplier)));if(Math.random()<dropChance(.28,t.chakraDrop))addDrop(defeatedAt,'chakra',9);if(pillNames.length&&Math.random()<dropChance(.015,t.pillDrop))addDrop(defeatedAt,'pill',1,pillNames[Math.floor(Math.random()*pillNames.length)]);if(Math.random()<dropChance(.018,t.itemDrop))addDrop(defeatedAt,'item',1);playSfx('impact');}
    function damageNumber(position:THREE.Vector3,amount:number,tier=0){if(hiddenEffects||numbers.length>60||amount<.5)return;const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#111629';ctx.strokeText(Math.round(amount)+(tier===2?'!!':tier===1?'!':''),64,44);ctx.fillStyle=tier===2?'#ff8bdd':tier===1?'#ffe269':'#ffffff';ctx.fillText(Math.round(amount)+(tier===2?'!!':tier===1?'!':''),64,44);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false}));sprite.scale.set(2,1,1);sprite.position.copy(position).add(new THREE.Vector3((Math.random()-.5)*.5,1.5,0));scene.add(sprite);numbers.push({sprite,life:.8});}
    function takeDamage(enemy:Enemy,damage:number,color:string,fromAlly=false,tier=0,name='Status'){if(!enemyList.includes(enemy))return;const dealt=Math.min(enemy.hp,damage);if(fromAlly)allyDamage+=dealt;else{totalDamage+=dealt;skillDamage[name]=(skillDamage[name]||0)+dealt;if(ex('lifesteal')>0&&!defeated)hp=Math.min(stats.maxHp,hp+dealt*ex('lifesteal'));}enemy.hp-=damage;
      // Lâmina do Carrasco: inimigos comuns abaixo de 8% (+4 pontos por cópia extra) morrem na hora.
      const executeAt=ex('execute')>0?.04*(ex('execute')/.08+1):0;if(executeAt>0&&enemy.hp>0&&!enemy.megaElite&&!enemy.guardian&&!enemy.totem&&enemy.hp<(enemy.maxHp||0)*executeAt)enemy.hp=0;damageNumber(enemy.sprite.position,damage,tier);if(enemy.hp<=0)removeEnemy(enemy);else if(!hiddenEffects){enemy.sprite.material.color.set(color);}}
    /** Multiplicador de dano dos itens para uma técnica do jogador contra este inimigo. */
    function itemDamageBonus(enemy:Enemy,t:Technique){
      let bonus=(1+ex(ELEMENT_KEY[t.element]))*(t.school==='Genjutsu'?stats.genjutsu:1);
      // Infusão Sábia (Selo de Senjutsu ou Modo Sábio ativo): a técnica também conta como elemento Sábio.
      if(t.element!=='Sábio'&&(stats.sage>0||sageModeActive()))bonus*=1+ex('elSabio');
      if(enemy.elite||enemy.megaElite||enemy.guardian)bonus*=1+ex('eliteDamage');
      if((enemy.controlTime||0)>0||(enemy.slow||0)>0)bonus*=1+ex('controlledDamage');
      const statuses=[(enemy.controlTime||0)>0,(enemy.burn||0)>0,!!enemy.poison,(enemy.slow||0)>0].filter(Boolean).length;
      bonus*=1+Math.min(.3,statuses*ex('statusStack'));
      bonus*=1+ex('lowHpDamage')*Math.min(1,Math.max(0,(1-hp/stats.maxHp)/.75));
      bonus*=1+Math.min(ex('noHitDamage'),timeSinceHit*.04);
      bonus*=1+Math.min(.3,Math.floor(kills/100)*ex('killDamage'));
      if(t.school==='Taijutsu')bonus*=1+Math.min(.5,stats.armor*ex('armorPhysical'));
      if(ex('bigCrit')>0&&Math.random()<ex('bigCrit'))bonus*=8;
      return bonus;
    }
    function hit(enemy:Enemy,t:Technique,g:SkillGrowth,origin:THREE.Vector3,ally=false){if(!enemyList.includes(enemy))return;const crit=rollCritical(stats.crit,stats.critDamage),school=t.school==='Taijutsu'?stats.physical:t.school==='Ninjutsu'?stats.ninjutsu:1,sage=t.element==='Sábio'||stats.sage>0||(!ally&&sageModeActive()),passive=!ally&&heroId==='naruto'?1+.2*(1-hp/stats.maxHp):!ally&&heroId==='hashirama'&&sage?1.2:1;
      const damage=stats.damage*t.power*(1+g.damage)*school*passive*crit.multiplier*(ally?.65*stats.allyDamage:damageMultiplier*tune().playerDamage*itemDamageBonus(enemy,t));
      if(enemy.control==='Dormir')enemy.controlTime=0;
      const status=t.status??(stats.status>0?'Lentidão':undefined);if(status&&Math.random()<Math.min(.95,(t.status?t.statusChance:0)+stats.status)){const duration=(status==='Lentidão'?1.8:.65)*stats.duration*(1+g.duration);if(status==='Empurrar'){const away=enemy.sprite.position.clone().sub(origin);away.y=0;enemy.sprite.position.addScaledVector(away.normalize(),1.4);}else{enemy.control=status;enemy.controlTime=duration;if(status==='Lentidão')enemy.slow=duration;}}
      if(stats.poison>0)enemy.poison={remaining:3*stats.duration*(1+g.duration),dps:damage*stats.poison*(1+ex('statusDamage'))/3};if(t.burn)enemy.burn=2*stats.duration*(1+g.duration);
      // Gatilhos por acerto dos itens (só técnicas do jogador).
      if(!ally){
        if(Math.random()<ex('burnChance'))enemy.burn=2*stats.duration;
        if(Math.random()<ex('poisonChance'))enemy.poison={remaining:3*stats.duration,dps:damage*.35*(1+ex('statusDamage'))/3};
        if(Math.random()<ex('sleepChance')){enemy.control='Dormir';enemy.controlTime=2*stats.duration;}
        if(Math.random()<ex('rootChance')){enemy.control='Paralisar';enemy.controlTime=1.2*stats.duration;}
        if(Math.random()<ex('chillChance')){enemy.control='Lentidão';enemy.controlTime=1.8*stats.duration;enemy.slow=1.8*stats.duration;}
      }
      takeDamage(enemy,damage,t.color,ally,crit.tier,t.name);
      // Linha Senjutsu (modo sábio): Ninjutsu infundido com Sábio tem chance de um golpe extra de 1,5× o dano deste acerto.
      if(!ally&&hasSenjutsu(t,stats.sage>0||sageModeActive())&&enemyList.includes(enemy)&&Math.random()<(senjutsuOverride??SENJUTSU.chance)){senjutsuProcs++;takeDamage(enemy,damage*SENJUTSU.multiplier,SENJUTSU.color,false,crit.tier,t.name);}
    }
    /** Setup (buff puro): só ativa com inimigo a até 9 m; sem acúmulo, reativar renova a duração. Não usa cadência nem velocidade de projétil. */
    function activateSetup(t:Technique,g:SkillGrowth){
      if(!enemyList.some(e=>Math.hypot(e.sprite.position.x-player.position.x,e.sprite.position.z-player.position.z)<=t.range))return false;
      const s=setupNumbers(t,g),current=activeSetups.find(a=>a.name===t.name);
      if(current&&!s.stack){current.remaining=s.duration;current.duration=s.duration;current.bonuses=s.bonuses;}
      else activeSetups.push({name:t.name,remaining:s.duration,duration:s.duration,bonuses:s.bonuses,sage:s.sage});
      refreshStats();addRing(player.position,t.color,1.6);addRing(player.position,t.color,.9);playSfx('ultimate');return true;
    }
    function castTechnique(t:Technique,origin:THREE.Vector3,g:SkillGrowth,ally=false,instant=false){if(t.setup)return ally?false:activateSetup(t,g);
      // Modo Sábio: taijutsu corpo a corpo do jogador vira golpe em área ao redor (raio ×1,8, escala com área).
      const sageArea=!ally&&sageModeActive()&&t.school==='Taijutsu'&&t.shape==='Corpo a corpo';
      const range=t.range*(sageArea?1.8:1)*(1+Math.min(1,(level-1)*.005))*Math.sqrt(stats.area*(1+g.area));const target=enemyList.filter(e=>Math.hypot(e.sprite.position.x-origin.x,e.sprite.position.z-origin.z)<=range).sort((a,b)=>a.sprite.position.distanceToSquared(origin)-b.sprite.position.distanceToSquared(origin))[0];if(!target)return false;const direction=target.sprite.position.clone().sub(origin);direction.y=0;direction.normalize();
      if(['Projétil','Em V','Onda'].includes(t.shape)){const count=t.shape==='Em V'?2:1;for(let i=0;i<Math.min(12,count+Math.floor(stats.projectiles)-1);i++){const spread=t.shape==='Em V'?(i%2?.2:-.2):(i-(stats.projectiles-1)/2)*.1,aim=direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread),object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(origin);object.visible=!hiddenEffects;scene.add(object);shots.push({mesh:object,direction:aim,remaining:range,range,speed:(t.name.includes('Bunshin')?6:10)*stats.projectileSpeed,radius:(t.shape==='Onda'?.85:.4)*Math.sqrt(stats.area*(1+g.area)),technique:t,origin:origin.clone(),hit:new Set(),growth:g,ally,bounces:!ally&&(t.shape==='Projétil'||t.shape==='Em V')?stats.bounce:0});}}
      else{const center=['Área'].includes(t.shape)?target.sprite.position:origin,radius=(t.shape==='Área'?1.2:t.shape==='Órbita'?1.7:range)*Math.sqrt(stats.area*(1+g.area));
        // Golpes e lançamentos sem projétil têm um preparo curto até o acerto, reduzido pela velocidade de projétil.
        const resolve=()=>{
        for(const enemy of [...enemyList]){const delta=enemy.sprite.position.clone().sub(origin);delta.y=0;const d=delta.length(),along=delta.dot(direction),cross=Math.abs(delta.x*direction.z-delta.z*direction.x);let inside=false;if(t.shape==='Linha')inside=along>=0&&along<=range&&cross<.65*Math.sqrt(stats.area*(1+g.area));else if(t.shape==='Cone')inside=d<=range&&(d<.2||delta.normalize().dot(direction)>.65);else inside=Math.hypot(enemy.sprite.position.x-center.x,enemy.sprite.position.z-center.z)<=radius;if(inside)hit(enemy,t,g,origin,ally);}
        const object=techniqueVisual(t);object.position.copy(center);object.scale.multiplyScalar(Math.max(.8,radius));object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.35});addRing(center,sageArea?SENJUTSU.color:t.color,Math.min(radius,sageArea?4:3));};
        const delay=(t.school==='Taijutsu'?IMPACT_DELAY.Taijutsu:IMPACT_DELAY.other)/Math.max(.3,stats.projectileSpeed);
        if(instant||delay<=0)resolve();else pendingHits.push({time:delay,run:resolve});}
      if(!ally)playSfx('attack');return true;
    }
    function castUltimate(){if(chakra<100||defeated||pausedRef.current||choiceData||sealing)return;chakra=0;if(ex('ultReset')>0){for(const k of Object.keys(cooldowns))cooldowns[k]=0;ultBuffTimer=6;eventToast='Pergaminho do Hokage: técnicas recarregadas e +30% de cadência';}playSfx('ultimate');const t={...ultimateBase(hero),name:hero.ultimate,power:6,shape:'Área' as const,setup:undefined};addRing(player.position,hero.color,5);const object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(player.position);object.scale.multiplyScalar(4);object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.7});for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<6*Math.sqrt(stats.area))hit(enemy,t,NO_GROWTH,player.position);}
    renderer.setAnimationLoop((now)=>{const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;if(enabledRef.current&&!pausedRef.current&&!choiceData&&!defeated&&!victory&&!debugState.frozen){
      refreshStats();invulnerability=Math.max(0,invulnerability-dt);playerSlow=Math.max(0,playerSlow-dt);
      // Temporizadores dos itens.
      timeSinceHit+=dt;rushTimer=Math.max(0,rushTimer-dt);freezeCd=Math.max(0,freezeCd-dt);ultBuffTimer=Math.max(0,ultBuffTimer-dt);emergencyCd=Math.max(0,emergencyCd-dt);
      stillTime=Math.hypot(player.position.x-lastPos.x,player.position.z-lastPos.z)>.001?0:stillTime+dt;lastPos.copy(player.position);
      if(!shieldReady){shieldTimer-=dt;if(shieldTimer<=0)shieldReady=true;}
      if(!defeated&&ex('emergencyHeal')>0&&emergencyCd<=0&&hp>0&&hp<stats.maxHp*.3){hp=Math.min(stats.maxHp,hp+stats.maxHp*.35);emergencyCd=45;addRing(player.position,'#7dffb0',1.4);eventToast='Fruta Medicinal: +35% de HP';}
      if(!defeated&&ex('periodicHeal')>0){periodicTimer-=dt;if(periodicTimer<=0){periodicTimer=30;if(hp<stats.maxHp){hp=Math.min(stats.maxHp,hp+stats.maxHp*.12);addRing(player.position,'#7dffb0',1.2);}}}
      // Procs de item com golpe (raios/chamas) também seguem a cadência.
      if(!defeated&&!sealing&&ex('bolts')>0){boltTimer-=dt;if(boltTimer<=0){boltTimer=2.5/Math.max(.2,stats.attackSpeed);castBolts();}}
      if(!defeated&&!sealing&&ex('beam')>0){beamTimer-=dt;if(beamTimer<=0){beamTimer=6/Math.max(.2,stats.attackSpeed);castBeam();}}
      // Setups: a duração corre só fora do selamento; ao expirar, os atributos voltam a ser recalculados das fontes.
      if(!sealing){let expired=false;for(let i=activeSetups.length-1;i>=0;i--){activeSetups[i].remaining-=dt;if(activeSetups[i].remaining<=0){activeSetups.splice(i,1);expired=true;}}if(expired)refreshStats();}
      if(!sealing){elapsed+=dt;if(elapsed>=600){elapsed=600;victory=true;keys.clear();eventToast='Missão concluída: você sobreviveu aos dez minutos!';}const nextZone=Math.min(3,1+Math.floor(elapsed/200));if(nextZone!==zone){zone=nextZone;guardianSpawned=false;shikamaruPlans=0;weather=Math.random()<.5?'Névoa espectral':'Tempestade de areia';scene.background=new THREE.Color(weather==='Névoa espectral'?'#6d6a91':'#a9825c');scene.fog=new THREE.Fog(scene.background,weather==='Névoa espectral'?12:26,weather==='Névoa espectral'?44:72);eventToast='Zona '+zone+' · nova ameaça e eventos';for(const event of events){event.active=true;event.uses=0;}defenseDone=false;}}if(sealing?.phase==='sealing'){sealTimer+=dt;if(sealTimer>=2.7){sealing.phase='complete';recruitAlly(sealing.heroId);eventToast=sealing.target+' foi selado e agora luta ao seu lado';}}if(!sealing){megaTimer-=dt;if(megaTimer<=0&&megaElitesSpawned<9&&!sealing){spawnEnemy(false,true);megaElitesSpawned++;megaTimer=45+Math.random()*25;eventToast='Alerta: um Mega Elite surgiu naturalmente nesta zona!';}const speed=stats.moveSpeed*(weather==='Tempestade de areia'?.73:1)*(playerSlow>0?.55:1)*(rushTimer>0?1.2:1);dir.set(0,0,0);v1.set(-Math.sin(yaw),0,-Math.cos(yaw));v2.set(Math.cos(yaw),0,-Math.sin(yaw));if(keys.has('w')||keys.has('arrowup'))dir.add(v1);if(keys.has('s')||keys.has('arrowdown'))dir.sub(v1);if(keys.has('d')||keys.has('arrowright'))dir.add(v2);if(keys.has('a')||keys.has('arrowleft'))dir.sub(v2);if(dir.lengthSq()){dir.normalize();player.position.addScaledVector(dir,speed*dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-46,46);player.position.z=THREE.MathUtils.clamp(player.position.z,-46,46);player.position.y=terrainHeight(player.position.x,player.position.z)+1.15;revealAround(player.position.x,player.position.z);}
      const threat=threatNow();
      if(tune().enemyHp!==appliedEnemyHp){const ratio=tune().enemyHp/Math.max(.01,appliedEnemyHp);for(const e of enemyList){e.hp*=ratio;if(e.maxHp)e.maxHp*=ratio;bossCombat.rescale(e,ratio);}appliedEnemyHp=tune().enemyHp;}
      if(!guardianSpawned&&elapsed>=ZONES[zone-1].guardianAt)summonGuardian(true);
      updateTotem(dt);
      ambushTimer-=dt;if(ambushTimer<=0){for(let n=0;n<Math.min(8+zone*2,threat.cap-enemyList.length);n++)spawnEnemy();ambushTimer=18+Math.random()*12;eventToast='Emboscada! Ninjas cercando a área.';}
      if(defenseActive&&!defenseDone){const altar=events.find(e=>e.id==='altar')!;addRing(new THREE.Vector3(altar.x,0,altar.z),'#ffe98c',4);if(Math.hypot(player.position.x-altar.x,player.position.z-altar.z)<4)defenseTime+=dt;if(defenseTime>=20){defenseActive=false;defenseDone=true;spawnPickup('sealDrop',altar.x,altar.z);eventToast='Altar protegido: recompensa disponível!';}}
      spawnTimer-=dt;if(spawnTimer<=0&&enemyList.length<threat.cap){spawnEnemy();spawnTimer=threat.spawnInterval*(.8+Math.random()*.4);}
      hp=Math.min(stats.maxHp,hp+dt*stats.regen);
      for(const enemy of [...enemyList]){
        if(enemy.poison){const duration=Math.min(dt,enemy.poison.remaining);enemy.poison.remaining-=duration;takeDamage(enemy,enemy.poison.dps*duration,'#b67bff');if(!enemyList.includes(enemy))continue;if(enemy.poison.remaining<=0)enemy.poison=undefined;}
        enemy.sprite.material.color.lerp(new THREE.Color(enemy.elite?'#ffb969':'#ffffff'),dt*6);if(enemy.burn){enemy.burn-=dt;takeDamage(enemy,stats.damage*.15*dt*(1+ex('statusDamage')),'#ff9b46');if(!enemyList.includes(enemy))continue;}if(enemy.totem)continue;enemy.controlTime=Math.max(0,(enemy.controlTime||0)-dt);enemy.slow=Math.max(0,(enemy.slow||0)-dt);const stunned=enemy.controlTime>0&&enemy.control!=='Lentidão';const casting=enemy.boss?bossCombat.update(enemy,dt,!stunned&&enemy.windup===undefined&&!defeated):false;if(defeated)break;if(stunned||casting)continue;
        dir.set(player.position.x-enemy.sprite.position.x,0,player.position.z-enemy.sprite.position.z);const distance=dir.length();
        if(enemy.windup!==undefined){enemy.windup-=dt;if(enemy.marker)(enemy.marker.material as THREE.MeshBasicMaterial).opacity=.3+(1-Math.max(0,enemy.windup)/.65)*.5;
          if(enemy.windup<=0){const radius=enemy.megaElite?1.7:1;if(enemy.attackPoint&&Math.hypot(player.position.x-enemy.attackPoint.x,player.position.z-enemy.attackPoint.z)<radius&&invulnerability<=0){
            damagePlayer((enemy.megaElite?22:10)*threat.damage,enemy);
          }if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();enemy.marker=undefined;}enemy.windup=undefined;enemy.hitTimer=.9/threat.attackRate;}
        }else{enemy.hitTimer-=dt;if(distance>(enemy.megaElite?1.6:1)){dir.normalize();enemy.sprite.position.addScaledVector(dir,enemy.speed*threat.speed*(enemy.slow?.75:1)*dt);enemy.sprite.position.y=terrainHeight(enemy.sprite.position.x,enemy.sprite.position.z)+(enemy.megaElite?1.9:1);}
          else if(enemy.hitTimer<=0){enemy.windup=Math.max(.28,.65/Math.sqrt(threat.attackRate));enemy.attackPoint=player.position.clone();const marker=new THREE.Mesh(new THREE.RingGeometry(.1,enemy.megaElite?1.7:1,32),new THREE.MeshBasicMaterial({color:'#ff3b55',transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.position.set(enemy.attackPoint.x,terrainHeight(enemy.attackPoint.x,enemy.attackPoint.z)+.2,enemy.attackPoint.z);scene.add(marker);enemy.marker=marker;}
        }
        if(defeated)break;
      }
      bossCombat.updateEffects(dt);
      // Aliados seguem em formação, atacam automaticamente e fornecem regeneração de suporte.
      allyTimer-=dt;
      for(let i=0;i<allyActors.length;i++){const ally=allyActors[i],angle=i*Math.PI*.8+1,goal=new THREE.Vector3(player.position.x+Math.cos(angle)*2.6,0,player.position.z+Math.sin(angle)*2.6);dir.copy(goal).sub(ally.position);dir.y=0;if(dir.length()>12)ally.position.copy(goal);else if(dir.length()>.25)ally.position.addScaledVector(dir.normalize(),Math.min(speed+2,dir.length()/dt)*dt);ally.position.y=terrainHeight(ally.position.x,ally.position.z)+1.2;
        if(allyTimer<=0&&!defeated)castTechnique(HERO_BY_ID[allies[i]]?.techniques[0]??NPC_ALLIES[allies[i]].technique,ally.position,NO_GROWTH,true);
      }if(allyTimer<=0)allyTimer=allyInterval();
      if(!defeated){
      chakra=Math.min(100,chakra+100*dt/55*stats.ultimateRate*tune().ultimateRate);if(autoUlt&&chakra>=100)castUltimate();
      for(const t of techniques){if(!skillLevels[t.name])continue;cooldowns[t.name]=(cooldowns[t.name]||0)-dt;if(cooldowns[t.name]<=0){const g=growth[t.name]??NO_GROWTH;if(castTechnique(t,player.position,g))cooldowns[t.name]=t.setup?setupNumbers(t,g).cooldown:t.cooldown/Math.max(.1,stats.attackSpeed*(1+g.haste)*tempAttackSpeed());}}
      for(let i=pendingHits.length-1;i>=0;i--){pendingHits[i].time-=dt;if(pendingHits[i].time<=0){const p=pendingHits.splice(i,1)[0];p.run();}}
      for(let i=shots.length-1;i>=0;i--){const shot=shots[i],travel=Math.min(shot.remaining,shot.speed*dt);shot.mesh.position.addScaledVector(shot.direction,travel);shot.mesh.position.y=terrainHeight(shot.mesh.position.x,shot.mesh.position.z)+1.1;shot.remaining-=travel;shot.mesh.rotation.y+=dt*6;
        for(const enemy of [...enemyList])if(!shot.hit.has(enemy)&&Math.hypot(enemy.sprite.position.x-shot.mesh.position.x,enemy.sprite.position.z-shot.mesh.position.z)<shot.radius+.4){shot.hit.add(enemy);hit(enemy,shot.technique,shot.growth,shot.origin,shot.ally);if(shot.technique.shape==='Projétil')shot.remaining=0;}
        // Ricochete (Seixo Polido do Rio): ao terminar, o projétil salta para o inimigo mais próximo ainda não atingido (até 6 m).
        if(shot.remaining<=0&&shot.bounces>0&&shot.hit.size>0){const next=enemyList.filter(e=>!shot.hit.has(e)&&Math.hypot(e.sprite.position.x-shot.mesh.position.x,e.sprite.position.z-shot.mesh.position.z)<6).sort((a,b)=>a.sprite.position.distanceToSquared(shot.mesh.position)-b.sprite.position.distanceToSquared(shot.mesh.position))[0];if(next){shot.bounces--;shot.direction.copy(next.sprite.position).sub(shot.mesh.position);shot.direction.y=0;shot.direction.normalize();shot.remaining=Math.min(shot.range,6.5);}}
        if(shot.remaining<=0){scene.remove(shot.mesh);disposeObject(shot.mesh);shots.splice(i,1);}}
      for(let i=drops.length-1;i>=0;i--){const drop=drops[i];drop.mesh.rotation.y+=dt*2;drop.mesh.position.y=terrainHeight(drop.mesh.position.x,drop.mesh.position.z)+.45+Math.sin(elapsed*3+i)*.1;
        if(Math.hypot(drop.mesh.position.x-player.position.x,drop.mesh.position.z-player.position.z)<stats.pickup){
          if(drop.type==='xp')xp+=Math.round(drop.value*stats.xpGain*tune().xpGain);
          if(drop.type==='lamens')runMoney+=Math.round(drop.value*stats.moneyGain*tune().moneyGain);
          if(drop.type==='chakra')chakra=Math.min(100,chakra+drop.value);
          if(drop.type==='pill'&&!banned.has(drop.name)&&grantPill(knownPills,drop.name,1,ex('pillCap')))refreshStats(true);
          if(drop.type==='item')pendingItemRewards++;
          playSfx('pickup');scene.remove(drop.mesh);drop.mesh.geometry.dispose();(drop.mesh.material as THREE.Material).dispose();drops.splice(i,1);
        }
      }
      if(!choiceData&&!sealing){if(xp>=xpNext||pendingLevels>0){if(pendingLevels>0)pendingLevels--;else xp-=xpNext;const oldForm=formAt(heroId,level).level;level++;refreshStats(true);xpNext=Math.ceil(18+6*(level-1)+.08*(level-1)**2);if(formAt(heroId,level).level!==oldForm){player.material.dispose();player.material=heroMaterial(heroId,level);eventToast=hero.name+' evoluiu: '+formAt(heroId,level).name+' · +25% do HP base';addRing(player.position,'#fff195',3);}choiceLevel=level;choiceData=rollLevelOffers();invulnerability=3;keys.clear();}else if(pendingItemRewards>0){pendingItemRewards--;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}}
      } // Vivo
      } // Fora do ritual de selamento
      for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.scale.multiplyScalar(1+dt*2.4);const mat=fx.material as THREE.MeshBasicMaterial;mat.opacity-=dt*1.35;if(mat.opacity<=0){scene.remove(fx);fx.geometry.dispose();mat.dispose();effects.splice(i,1);}}
      for(let i=visuals.length-1;i>=0;i--){const fx=visuals[i];fx.life-=dt;fx.object.rotation.y+=dt*5;if(fx.life<=0){scene.remove(fx.object);disposeObject(fx.object);visuals.splice(i,1);}}
      for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.sprite.position.y+=dt*1.3;n.sprite.material.opacity=Math.max(0,n.life/.8);if(n.life<=0){scene.remove(n.sprite);n.sprite.material.map?.dispose();n.sprite.material.dispose();numbers.splice(i,1);}}
      for(const tree of decor)tree.material.opacity=tree.position.distanceTo(player.position)<3?.45:1;
      // Só registra o evento depois que ele entra no campo visível da câmera.
      const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      for(const event of events){if(!event.discovered&&frustum.containsPoint(event.obj.position)&&event.obj.position.distanceTo(player.position)<40){event.discovered=true;event.obj.visible=true;}}
      if(totem&&!totemDiscovered&&frustum.containsPoint(totem.sprite.position)&&totem.sprite.position.distanceTo(player.position)<40)totemDiscovered=true;
      for(const pickup of pickups){if(!pickup.discovered&&frustum.containsPoint(pickup.mesh.position)&&pickup.mesh.position.distanceTo(player.position)<40)pickup.discovered=true;}
      }
      offset.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(zoom);camera.position.copy(player.position).add(offset);camera.lookAt(player.position);camera.updateMatrixWorld();
      frames++;fpsTimer+=dt;if(fpsTimer>=.5){fps=Math.round(frames/fpsTimer);frames=0;fpsTimer=0;}snapshotTimer-=dt;if(snapshotTimer<=0){onSnapshotRef.current({allyCharge:allyActors.length?Math.min(1,Math.max(0,1-allyTimer/allyInterval())):0,victory,remaining:Math.max(0,600-elapsed),hiddenEffects,totalDamage:Math.round(totalDamage),skillDamage:{...skillDamage},skillGrowth:{...growth},techniques:techniques.filter(t=>!banned.has(t.name)&&(!config.archivedSkills.includes(t.name)||skillLevels[t.name])),banned:[...banned],synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),setups:activeSetups.map(s=>({name:s.name,remaining:s.remaining,duration:s.duration})),zone,boss:enemyList.filter(e=>e.guardian).map(e=>HERO_BY_ID[e.heroId!].name+' · '+Math.ceil(e.hp)+' HP · ×'+(e.hpMultiplier??1).toFixed(2)+(e.shikamaruPlans?' · +'+e.shikamaruPlans+' kunai (Shikamaru)':'')).join(', '),defenseProgress:defenseActive?Math.floor(defenseTime/20*100):0,hp:Math.ceil(hp),maxHp:stats.maxHp,stats:{...stats},defeated,allyDamage:Math.round(allyDamage),difficultyScale:difficultyAt(mission,elapsed,zoneDifficulty).hp,level,xp,xpNext,chakra,kills,runMoney,elapsed,fps,kunai,shuriken,luck,autoUlt,allies:[...allies],weather,toast:eventToast,interaction:(()=>{if(sealing)return{name:`Mega Elite · ${sealing.target}`,description:sealing.phase==='ready'?'E sela · G recusa e deixa um drop':sealing.phase==='sealing'?'Concluindo o jutsu de selamento…':'Enter para continuar'};const p=pickups.find(p=>p.active&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<3.2);if(p)return{name:p.name,description:p.kind==='kunai'||p.kind==='shuriken'?'E · '+kunaiPrice()+' Ryu · escolher 1 de '+choiceCount(permanent)+' itens':'E · coletar recompensa grátis'};const e=events.find(e=>e.active&&Math.hypot(e.x-player.position.x,e.z-player.position.z)<3.6);return e?{name:e.name,description:e.id==='guardian-seal'?`E · invocar o guardião agora · HP ×${guardianHpMultiplier(zoneElapsed()).toFixed(2)} (cresce com o tempo; surge sozinho em ${ZONES[zone-1].guardianAt-ZONES[zone-1].start}s da zona)`:e.id==='shikamaru'?(shikamaruPlans>=GUARDIAN_RULES.shikamaruMaxPlans?`Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · limite atingido nesta zona`:`E · Plano do Shikamaru ${shikamaruPlans}/${GUARDIAN_RULES.shikamaruMaxPlans} · +1 kunai ao derrotar o guardião`):"Aperte E para interagir"}:null;})(),pickups:pickups.filter(p=>p.active&&p.discovered).map(p=>({kind:p.kind,x:p.x,z:p.z})),items:{...knownItems},pills:{...knownPills},skillLevels:{...skillLevels},choice:choiceData?{level:choiceLevel,cards:choiceData}:null,sealing:sealing?{...sealing}:null,enemies:enemyList.map(e=>({x:e.sprite.position.x,z:e.sprite.position.z})),events:[...events.filter(e=>e.discovered).map(e=>({id:e.id,name:e.name,x:e.x,z:e.z,icon:e.icon})),...(totem&&totemDiscovered?[{id:'naruto-totem',name:'Naruto Totem',x:totem.sprite.position.x,z:totem.sprite.position.z,icon:'🍥'}]:[])],totem:totem?{hp:Math.ceil(totem.hp),maxHp:Math.ceil(totem.maxHp||0),remaining:Math.max(0,TOTEM_RULES.end-elapsed)}:null,explored:[...exploredCells.values()],player:{x:player.position.x,z:player.position.z},ping:currentPing,effects:effects.length,choices:{...uses,banning},weaponCost:kunaiPrice(),permanent});snapshotTimer=.2;}
      renderer.render(scene,camera);
    });
    const debugWindow=window as unknown as {__shinobiTest?:Record<string,unknown>};
    if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test'))debugWindow.__shinobiTest={
      grantItem,spawn:(id:string)=>spawnEnemy(false,true,false,id),defeatMega:(id:string)=>{const e=spawnEnemy(false,true,false,id);removeEnemy(e);},
      reward:()=>{choiceLevel=level;choiceData=rollLevelOffers();},kakashi:()=>{openKakashi(events.find(e=>e.id==='kakashi')!);return choiceLevel;},kakashiActive:()=>events.find(e=>e.id==='kakashi')!.active,ichiraku:()=>{openIchiraku();return choiceLevel;},grantPill:(name:string)=>{grantPill(knownPills,name,1,ex('pillCap'));refreshStats(true);},loot:()=>{choiceLevel=0;choiceData=rollMegaLoot();},
      setLevel:(n:number)=>{level=n;player.material.dispose();player.material=heroMaterial(heroId,n);refreshStats(true);},
      learn:(name:string)=>{skillLevels[name]=1;},clearEnemies:()=>{for(const e of [...enemyList]){scene.remove(e.sprite);if(e.marker)scene.remove(e.marker);bossCombat.dispose(e);}enemyList.length=0;},
      setTime:(n:number)=>{elapsed=n;},teleport:(x:number,z:number)=>{player.position.set(x,terrainHeight(x,z)+1.15,z);},
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
      summonGuardian:()=>{const g=summonGuardian(false);return g?{heroId:g.heroId,maxHp:g.maxHp,hpMultiplier:g.hpMultiplier}:null;},shikamaru:()=>useShikamaruPlan(),
      defeatGuardian:()=>{const g=enemyList.find(e=>e.guardian);if(!g)return null;const before=pickups.filter(p=>p.active&&p.kind==='sealDrop').length;removeEnemy(g);return pickups.filter(p=>p.active&&p.kind==='sealDrop').length-before;},
      guardian:()=>({zone,zoneElapsed:zoneElapsed(),spawned:guardianSpawned,shikamaruPlans,hpMultiplierNow:guardianHpMultiplier(zoneElapsed()),alive:enemyList.filter(e=>e.guardian).map(e=>({heroId:e.heroId,hp:e.hp,maxHp:e.maxHp,hpMultiplier:e.hpMultiplier,shikamaruPlans:e.shikamaruPlans})),freeKunaiOnGround:pickups.filter(p=>p.active&&p.kind==='sealDrop').length,kunai,shuriken,toast:eventToast}),
      // Ebisu / Iruka / Naruto Totem.
      ebisu:()=>{openEbisu(events.find(e=>e.id==='ebisu')!);return choiceLevel;},iruka:()=>{openIruka(events.find(e=>e.id==='iruka')!);return choiceLevel;},
      npcState:()=>({choiceLevel,choice:choiceData,deals:npcDeals.map(d=>({...d})),runBuffs:{...runBuffs},extra:{...stats.extra},allies:[...allies],slots:stats.supportSlots,xpGain:stats.xpGain,ebisuActive:events.find(e=>e.id==='ebisu')!.active,irukaActive:events.find(e=>e.id==='iruka')!.active}),
      fillAllies:(n:number)=>{const ids=HEROES.map(h=>h.id).filter(id=>id!==heroId&&!allies.includes(id));for(let k=0;k<n&&ids.length;k++)recruitAlly(ids.shift()!);return allies.length;},
      totem:()=>({spawned:totemSpawned,alive:!!totem,hp:totem?.hp??0,maxHp:totem?.maxHp??0,discovered:totemDiscovered,result:totemResult,clones:enemyList.filter(e=>e.clone).length,enemies:enemyList.length,pendingLevels,level,xp,xpNext,elapsed,kills,sealing,choiceLevel:choiceData?choiceLevel:null,drops:drops.filter(d=>d.type==='xp').length,mapEvent:totemDiscovered&&!!totem}),
      damageTotem:(n:number)=>{if(totem)takeDamage(totem,n,'#ffffff');return totem?.hp??0;},
      killClones:(n=999)=>{let k=0;for(const e of enemyList.filter(e=>e.clone).slice(0,n)){takeDamage(e,1e9,'#ffffff');k++;}return k;},
      collectDrops:()=>{for(const d of drops)d.mesh.position.set(player.position.x,d.mesh.position.y,player.position.z);},
      inspect:()=>({skillDamage:{...skillDamage},kunaiPrice:kunaiPrice(),defeated,pills:{...knownPills},hp,chakra,autoUlt,player:{x:player.position.x,z:player.position.z},atlasReady:!!(player.material.map?.image as HTMLImageElement)?.width,visibleShots:shots.filter(s=>s.mesh.visible).length,visibleNumbers:numbers.filter(n=>n.sprite.visible).length,heroId,level,form:formAt(heroId,level).name,hiddenEffects,totalDamage,stats,allies,synergy:sandSynergy(allies),synergies:activeSynergies(heroId,allies),skills:{...skillLevels},growth:{...growth},enemies:enemyList.map(e=>({maxHp:e.boss?.maxHp,casting:e.boss?.cast?.technique.name,bar:!!e.boss?.bar.parent,hp:e.hp,heroId:e.heroId,control:e.control,controlTime:e.controlTime})),items:{...knownItems},uses:{...uses},paidWeapons,runMoney,choice:choiceData,sealing,elapsed}),
    };
    // API do painel debug. GameCanvas só a entrega com debug=true (servidor de desenvolvimento).
    const disposeEnemy=(e:Enemy)=>{bossCombat.dispose(e);scene.remove(e.sprite);e.sprite.material.dispose();if(e.marker){scene.remove(e.marker);e.marker.geometry.dispose();(e.marker.material as THREE.Material).dispose();}};
    debugApiRef.current={
      inspect:()=>({hp,maxHp:stats.maxHp,level,xp,xpNext,chakra,runMoney,elapsed,zone,enemies:enemyList.length,megaElites:enemyList.filter(e=>e.megaElite).length,kills,god:debugState.god,frozen:debugState.frozen,stats:{...stats},threat:threatNow(),items:{...knownItems},pills:{...knownPills}}),
      grantItem,
      grantPill:(name:string)=>{if(grantPill(knownPills,name,1,ex('pillCap'))){refreshStats(true);eventToast='Debug: '+name+' concedida';}else eventToast='Debug: '+name+' já está no limite';},
      levelUp:()=>{xp=Math.max(xp,xpNext);},
      setLevel:(n:number)=>{const next=Math.max(1,Math.min(99,Math.floor(n)||1));level=next;xp=0;xpNext=Math.ceil(18+6*(level-1)+.08*(level-1)**2);player.material.dispose();player.material=heroMaterial(heroId,level);refreshStats(true);},
      heal:()=>{hp=stats.maxHp;},
      setGod:(on:boolean)=>{debugState.god=on;if(on)hp=stats.maxHp;},
      fillChakra:()=>{chakra=100;},
      addMoney:(n:number)=>{if(Number.isFinite(n))runMoney=Math.max(0,runMoney+Math.round(n));},
      spawnMega:(id:string)=>{if(HERO_BY_ID[id]){spawnEnemy(false,true,false,id);eventToast='Debug: mega elite '+HERO_BY_ID[id].name+' gerado';}},
      clearEnemies:()=>{for(const e of enemyList)disposeEnemy(e);enemyList.length=0;},
      advanceTime:(s:number)=>{if(Number.isFinite(s))elapsed=Math.max(0,Math.min(599.5,elapsed+s));},
      setFrozen:(on:boolean)=>{debugState.frozen=on;},
    };
    onSnapshotRef.current({...emptySnapshot,hp:stats.maxHp,maxHp:stats.maxHp,stats,permanent,skillLevels:{...skillLevels},choices:{...uses,banning:false}});
    return()=>{debugApiRef.current=null;delete debugWindow.__shinobiTest;environmentMaps.forEach(t=>t.dispose());heroTextures.forEach(t=>t.dispose());pickupTextures.forEach(t=>t.dispose());numbers.forEach(n=>n.sprite.material.map?.dispose());observer.disconnect();renderer.setAnimationLoop(null);renderer.dispose();window.removeEventListener('shinobi-ping',onPing);window.removeEventListener('shinobi-choose',onChoose);window.removeEventListener('shinobi-toggle-auto-ult',onToggleAuto);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);container.removeEventListener('pointerdown',onDown);container.removeEventListener('pointermove',onMove);container.removeEventListener('pointerup',onUp);container.removeEventListener('pointercancel',onUp);container.removeEventListener('contextmenu',onContext);container.removeEventListener('wheel',onWheel);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}});groundTexture.dispose();texture.dispose();orochimaruTexture.dispose();container.removeChild(renderer.domElement);};
  }, [heroId,mission]);
  return <><div className="scene" ref={host} aria-label="Cena 3D isométrica do ShinobiBonk" />{debug&&enabled&&<DebugPanel getApi={getDebugApi} />}</>;
}


