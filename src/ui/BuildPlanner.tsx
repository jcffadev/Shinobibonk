import { TechniquePreview } from './TechniquePreview';
import { calculateStats } from '../game/progression';
import { BuffText } from './BuffText';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ITEMS, ITEM_BY_NAME, type Rarity } from '../game/catalog';
import { PILL_NAMES, PILL_MAX, pillDescription } from '../game/pills';
import { plannerCardInfo } from '../game/plannerCards';
import { techniquePool, upcomingTechniques, HERO_BY_ID, heroAffinity, familyOf, type PoolTechnique, type Technique } from '../game/heroes';
import { sealedHeroes, researchProgress } from '../game/account';
import { ArsenalControls, type ArsenalControlsProps } from './ArsenalControls';
import { inSeason } from '../game/season';
import { combinationCatalog, MERGE_PLAN, combineBonus, FUSION_KIND_LABEL, fusionBonus, fusionCatalog, fusionDisplayName, fusionRecipeText, isMergedName, kekkeiFusion, mergedTechnique } from '../game/techniqueMerge';
/** Origem da técnica no pool (regra do usuário: 1–2 únicas por shinobi; compartilhadas por vila/elemento; únicas de outros só após selar). */
/** 27/11/2026 — usuário: "As habilidades compartillhdas, deve mostrar de quem é compartilhada, ou seja para o jogadore saber quem tem que desbloquear para ganhar a habilidade." */
function providersText(ids:readonly string[]){const name=(id:string)=>(HERO_BY_ID[id]?.name??id)+(inSeason(id)?'':' (em breve)');const sorted=[...ids].sort((a,b)=>Number(!inSeason(a))-Number(!inSeason(b)));return sorted.slice(0,6).map(name).join(', ')+(sorted.length>6?' e mais '+(sorted.length-6):'');}
function sourceText(t:PoolTechnique){const who=HERO_BY_ID[t.origin]?.name??t.origin;if(t.source==='kit')return 'Kit próprio.';if(t.source==='basica')return 'Básica da Academia (sempre disponível).';if(t.providers?.length&&t.locked)return (t.source==='única'?'Única de ':'Compartilhada · ensinada por ')+providersText(t.providers)+'. 🔒 Sele '+(t.providers.length>1?'um deles':'esse shinobi')+' para ganhar.';if(t.source==='vila')return 'Compartilhada · mesma vila ('+who+').';if(t.source==='elemento')return 'Compartilhada · mesmo elemento '+t.element+' ('+who+').';return t.locked?'Única de '+who+' · bloqueada até selar '+who+' pela 1ª vez.':'Única de '+who+' (selado).';}
import { fusionParts, fusionSheet, fusionUpgrades } from '../game/fusionCard';
import { NO_GROWTH,techniqueHitDamage,attackCooldown,setupNumbers,itemSchools,itemElement,itemAttribute,techniqueCritical,techniqueDetail,techniqueSchool,techniqueStatusText } from '../game/combat';
import { ItemIcon } from './RunSheet';
import { SkillIcon } from './SkillIcon';
import { ELEMENT_COLOR } from './CharacterSelect';
import { PoolFilters,EMPTY_FILTERS,matchesSearch,type Filters } from './PoolFilters';
import { RarityFilter, rarityCounts } from './RarityFilter';

/** Tática de Missão (Rodada 39): snapshot do plano individual do herói — planejadas, treinadas, em casa,
 *  prioridade e fusões. Até 4 por personagem, salvo na conta (localStorage por herói; com login online,
 *  o mesmo formato viaja com o save). */
export type MissionTactic={name:string;planned:string[];trained:string[];home:string[];priority:string[];fusion:[string,string][];archivedSkills?:string[]};

/** Plano individual do shinobi e táticas salvas na conta. */
function PlannerRarity({rarity,max}:{rarity:Rarity;max:number}){return <span className="planner-item-meta"><span className={`planner-rarity rarity-${rarity.toLowerCase()}`}><i aria-hidden="true"/>{rarity}</span><span className="planner-stack-limit" title="Limite de cópias na missão">0/{max}</span></span>;}

export function BuildPlanner({hero,unlocked,planned,togglePlanned,archivedItems,archiveItemLimit,toggleArchivedItem,arsenalControls,archivedSkills,archiveLimit,trainingSlots,trained,trainTechnique,toggleSkill,fusionPlan,addFusionPair,removeFusionPair,tactics,saveTactic,applyTactic,deleteTactic,updateTactic}:{hero:{id:string;name:string;skills:string[]};unlocked:string[];planned:string[];togglePlanned:(name:string)=>void;archivedItems:string[];archiveItemLimit:number;toggleArchivedItem:(id:string)=>void;arsenalControls:ArsenalControlsProps;archivedSkills:string[];archiveLimit:number;trainingSlots:number;trained:string[];trainTechnique:(name:string)=>void;toggleSkill:(name:string)=>void;fusionPlan:[string,string][];addFusionPair:(a:string,b:string)=>void;removeFusionPair:(index:number)=>void;tactics:MissionTactic[];saveTactic:(name:string)=>void;applyTactic:(index:number)=>void;deleteTactic:(index:number)=>void;updateTactic:(index:number)=>void;}){
 const [tab,setTab]=useState('Habilidades'),[filters,setFiltersState]=useState({...EMPTY_FILTERS}),[rarities,setRarities]=useState<Rarity[]>([]),[selected,setSelected]=useState(''),[view,setView]=useState<'all'|'planned'|'archived'>('all'),[,setTick]=useState(0);
 const [tip,setTip]=useState<{name:string;x:number;y:number;pair?:[string,string]}|null>(null);
 const [fusionA,setFusionA]=useState(''),[fusionB,setFusionB]=useState('');
 useEffect(()=>{const on=()=>setTick(n=>n+1);window.addEventListener('shinobi-account',on);return ()=>window.removeEventListener('shinobi-account',on);},[]);
 const techniques=techniquePool(hero.id,sealedHeroes()),research=researchProgress();
 // 27/11/2026: técnicas que ainda faltam aparecem bloqueadas com quem precisa ser selado (upcomingTechniques).
 const upcoming=tab==='Habilidades'?upcomingTechniques(hero.id,sealedHeroes()):[];const researchOf=(t:PoolTechnique)=>t.source==='kit'||t.source==='basica'?1:research[t.name]||0;
 const setFilters=(next:Filters)=>{setFiltersState(next);if(Object.values(next).every(v=>!v))setRarities([]);};
 const itemsBeforeRarity=ITEMS.filter(i=>(!filters.school||itemSchools(i).includes(filters.school))&&(!filters.element||itemElement(i)===filters.element)&&(!filters.attribute||itemAttribute(i)===filters.attribute)&&matchesSearch(i.name+' '+i.description,filters.search));
 const excluded=[...techniques.filter(t=>archivedSkills.includes(t.name)&&t.name!==hero.skills[0]).map(t=>t.name),...ITEMS.filter(i=>archivedItems.includes(i.id)).map(i=>i.name)];
 const favorites=planned.filter(name=>!excluded.includes(name)&&(techniques.some(t=>t.name===name)||PILL_NAMES.includes(name)||ITEMS.some(i=>i.name===name)));
 const entries=tab==='Itens'?ITEMS.filter(i=>(!rarities.length||rarities.includes(i.rarity))&&(!filters.school||itemSchools(i).includes(filters.school))&&(!filters.element||itemElement(i)===filters.element)&&(!filters.attribute||itemAttribute(i)===filters.attribute)).map(i=>({id:i.id,name:i.name,description:i.description,archived:archivedItems.includes(i.id),unlocked:i.rarity==='Comum'||unlocked.includes(i.id),locked:false,toggle:undefined,icon:<ItemIcon name={i.name}/>,rarity:i.rarity})):tab==='Pílulas'?PILL_NAMES.map(name=>({id:name,name,description:pillDescription(name),archived:false,unlocked:true,locked:false,toggle:undefined,icon:<ItemIcon name={name}/>,rarity:`Pílula · máximo ${PILL_MAX} níveis`})):[...techniques,...upcoming].filter(t=>(!filters.school||techniqueSchool(t)===filters.school)&&(!filters.shape||t.shape===filters.shape)&&(!filters.element||t.element===filters.element)).map(t=>({id:t.name,name:t.name,description:(t.setup?techniqueDetail(t)+' Nv. '+t.unlockLevel+'. ':techniqueSchool(t)+' · '+t.element+' · '+t.shape+' · Nv. '+t.unlockLevel+'. '+(t.status?'Pode '+t.status.toLowerCase()+'. ':''))+sourceText(t)+(t.element!=='Neutro'&&t.element===heroAffinity(hero.id)?' Natureza do shinobi: ×1,5 de dano.':'')+(t.source!=='kit'&&!t.locked?' Pesquisa '+Math.round(researchOf(t)*100)+'% (aprenda/melhore na run; 100% libera planejar).':''),archived:archivedSkills.includes(t.name),unlocked:!t.locked&&researchOf(t)>=1,locked:t.name===hero.skills[0]||t.locked||(!archivedSkills.includes(t.name)&&archivedSkills.length>=archiveLimit),toggle:()=>toggleSkill(t.name),icon:<SkillIcon heroId={hero.id} name={t.name}/>,rarity:t.name===hero.skills[0]?'Inicial obrigatória':t.locked?'🔒 Única bloqueada':t.source==='kit'?'Kit · técnica automática':t.source==='basica'?'Básica · Academia':t.source==='única'?'Única de outro shinobi · '+Math.round(researchOf(t)*100)+'%':'Compartilhada · '+Math.round(researchOf(t)*100)+'%'}));
 const visible=entries.filter(e=>matchesSearch(e.name+' '+e.description,filters.search)&&(view==='all'||(view==='archived'?e.archived:planned.includes(e.name)&&!e.archived)));
 const focused=visible.find(e=>e.id===selected)??visible[0];
 const preview=tab==='Habilidades'?techniques.find(t=>t.name===focused?.name&&!t.locked):undefined;
 const base=calculateStats(hero.id,1);
 const estado=(e:{unlocked:boolean;archived:boolean})=>!e.unlocked?(tab==='Habilidades'?'Precisa pesquisar/selar':'Precisa desbloquear'):e.archived?(tab==='Habilidades'?'Deixar em casa':'Em casa'):'No pool';
 // Rodada 39 — Fusões: candidatos seguem a regra da Oficina dos Sapos Sábios (sem setup, sem bloqueio).
 // A execução continua na run (1 uso por zona); aqui apenas planeja o par e marca o pool da run com ⚗.
 const fusionOptions=techniques.filter(t=>!t.setup&&!t.locked&&!archivedSkills.includes(t.name)&&!isMergedName(t.name));
 const [fusionSearch,setFusionSearch]=useState('');
 // Rodada 81 (pedido do usuário: "é pra aparecer já as fusões que o ninja pode aprender… quando for liberando ninja na
 // conta… vai aparecer mais fusões também"): a aba abre com o catálogo de fusões do pool atual; o par manual fica opcional.
 const catalog=tab==='Fusões'?fusionCatalog(fusionOptions,familyOf(hero.id)):[];
 // 27/11/2026 — usuário: "em combinação... ele deveria conseguir combinar/fundir 1 por zona... aparentemente no planejador aparece apenas 1 combinação e 1 fusão, isso está errado."
 const combos=tab==='Fusões'?combinationCatalog(hero.skills,fusionOptions,familyOf(hero.id)).filter(c=>matchesSearch(c.name,fusionSearch)):[],planFull=fusionPlan.length>=MERGE_PLAN.limit;
 const shownCatalog=catalog.filter(f=>matchesSearch(f.name+' '+f.pair.join(' '),fusionSearch));
 const candidate:[string,string]=[fusionA,fusionB];
 const canPreview=fusionOptions.some(t=>t.name===fusionA)&&fusionOptions.some(t=>t.name===fusionB)&&fusionA!==fusionB;
 const duplicate=fusionPlan.some(pair=>pair.includes(fusionA)&&pair.includes(fusionB));
 const fusionName=(pair:[string,string])=>fusionDisplayName(mergedTechnique({kind:'fuse',names:pair},techniques,familyOf(hero.id))?.name??pair.join(' / '));
 // Receita na aba Habilidades: "Shuriken + Técnica de Vento = Nome da fusão" para cada fusão planejada que usa a técnica.
 const fusionRecipes=(name:string)=>fusionPlan.filter(pair=>pair.includes(name)).map(pair=>fusionRecipeText(pair,fusionName(pair)));
 const techniqueByName=new Map(techniques.map(t=>[t.name,t]));
 const categories=['Habilidades','Pílulas','Fusões','Itens'];
 const plannedByCategory:Record<string,string[]>={
  Habilidades:favorites.filter(name=>techniques.some(t=>t.name===name)),
  Pílulas:favorites.filter(name=>PILL_NAMES.includes(name)),
  Fusões:fusionPlan.map(([a,b])=>a+' + '+b),
  Itens:favorites.filter(name=>ITEMS.some(i=>i.name===name)),
 };
 const tipTechnique=tip?techniqueByName.get(tip.name):undefined;
 const tipItem=tip?ITEM_BY_NAME[tip.name]:undefined;
 const showTip=(name:string,node:HTMLElement,pair?:[string,string])=>{const rect=node.getBoundingClientRect();setTip({name,pair,x:Math.max(8,Math.min(rect.left,window.innerWidth-300)),y:rect.bottom+9});};
 const tipFusion=tip?.pair?mergedTechnique({kind:'fuse',names:tip.pair},techniques,familyOf(hero.id)):undefined;
 const tipSheet=tip?.pair&&tipFusion?fusionSheet(tipFusion,tip.pair):undefined;
 const entryActions=(e:(typeof visible)[number])=><div className="build-cell-actions">
          {/* Rodada 47 — o botão Treinar aparece para TODAS as técnicas (não só as planejadas): treinar uma técnica
              ainda não planejada auto-planeja ela junto (treinamento sem planejamento era no-op). */}
          {tab==='Habilidades'&&<button type="button" className="training-star" aria-label={trained.includes(e.name)?'Remover treinamento de '+e.name:'Treinar '+e.name+' com Jiraiya'} title={trainingSlots===0?'Libere a passiva Treinamento com Jiraiya':'+15% de dano na missão'+(planned.includes(e.name)?'':' · planeja a técnica automaticamente')} aria-pressed={trained.includes(e.name)} disabled={trainingSlots===0||e.archived||!e.unlocked||(!trained.includes(e.name)&&trained.length>=trainingSlots)} onClick={()=>trainTechnique(e.name)}>{trained.includes(e.name)?'★ Treinada':'☆ Treinar'}</button>}
          <button disabled={!e.unlocked} onClick={()=>togglePlanned(e.name)}>{tab==='Itens'?(planned.includes(e.name)?'Planejado':'Colocar na bolsa ninja'):(planned.includes(e.name)?'Planejado':'Planejar para Missão')}</button>
          {tab==='Itens'&&<button type="button" disabled={!e.unlocked||(!e.archived&&archivedItems.length>=archiveItemLimit)} className={e.archived?'enable-skill':undefined} onClick={()=>toggleArchivedItem(e.id)}>{e.archived?'Voltar ao pool':'Arquivar'}</button>}
          {e.toggle&&<button className={e.archived?'enable-skill':undefined} title={e.archived?'Devolver esta técnica ao pool da missão':undefined} disabled={e.locked} aria-pressed={e.archived} onClick={e.toggle}>{e.locked?(e.name===hero.skills[0]?'Inicial':'Indisponível'):tab==='Habilidades'?(e.archived?'Permitir aprender':'Deixar em casa'):(e.archived?'Levar na missão':'Deixar em casa')}</button>}
         </div>;
 function selectTab(next:string){
  setTab(next);setView('all');setSelected('');setFilters({...EMPTY_FILTERS});setRarities([]);
 }
 return <div className="mission-planner" onScrollCapture={()=>{if(tip)setTip(null);}}>
  {tip&&createPortal(<aside role="tooltip" className="planner-tooltip" style={{left:tip.x,top:Math.max(8,Math.min(tip.y,window.innerHeight-(tip.pair?300:140)))}}>
    <b>{tip.name}</b>
    {tipSheet&&tipFusion&&<dl className="fusion-tip-sheet" aria-label="Ficha da fusão">
     <div><dt>Tipo</dt><dd>{tipSheet.label} · {tipSheet.recipe}</dd></div>
     <div><dt>Efeito</dt><dd>{fusionParts(tipFusion).map(p=>p.kind).join(' · ')}</dd></div>
     <div><dt>Condição</dt><dd>{tipSheet.condition}</dd></div>
     <div><dt>Dano base</dt><dd>{tipSheet.base}</dd></div>
     <div><dt>Dano final</dt><dd>{Math.round(techniqueHitDamage(tipFusion,NO_GROWTH,base)).toLocaleString('pt-BR')} por acerto com o {hero.name} no Nv. 1, sem itens</dd></div>
     <div><dt>Recarga</dt><dd>{tipSheet.cooldown}</dd></div>
     <div><dt>Status</dt><dd>{tipSheet.status}</dd></div>
     <div><dt>Níveis</dt><dd>{tipSheet.cap}</dd></div>
    </dl>}
    {tip.pair&&!tipFusion&&<span>Par sem receita: só pode ser Combinado.</span>}
    {tipTechnique&&<><small>{tipTechnique.school} · {tipTechnique.element} · {tipTechnique.shape}</small><span>{techniqueStatusText(tipTechnique)}</span><small>Aprende no Nv. {tipTechnique.unlockLevel} · Recarga {(tipTechnique.setup?setupNumbers(tipTechnique).cooldown:attackCooldown(tipTechnique,1)).toLocaleString('pt-BR')} s</small></>}
    {tipItem&&<><PlannerRarity rarity={tipItem.rarity} max={tipItem.max}/><span>{tipItem.description}</span></>}
    {PILL_NAMES.includes(tip.name)&&<span>{pillDescription(tip.name)}</span>}
   </aside>,document.body)}

  <div className="planner-active"><b>Plano ativo</b><small>{favorites.length+fusionPlan.length} opções planejadas</small></div>
  <section className="planner-categories" aria-label="Resumo do plano">
   {categories.map(category=><div className={tab===category?'active':''} key={category}>
    <button type="button" aria-pressed={tab===category} onClick={()=>selectTab(category)}>{category} <small>{plannedByCategory[category].length}</small></button>
    <div className="planner-slots">{plannedByCategory[category].length?plannedByCategory[category].map((name,index)=><span key={name} onMouseEnter={event=>showTip(name,event.currentTarget,category==='Fusões'?fusionPlan[index]:undefined)} onMouseLeave={()=>setTip(null)} onFocus={event=>showTip(name,event.currentTarget,category==='Fusões'?fusionPlan[index]:undefined)} onBlur={()=>setTip(null)}>
     {category==='Habilidades'||category==='Fusões'?<SkillIcon heroId={hero.id} name={name}/>:<ItemIcon name={name}/>}
     <button type="button" className="planner-remove" aria-label={'Remover '+name+' do plano'} onClick={()=>{setTip(null);if(category==='Fusões')removeFusionPair(index);else togglePlanned(name);}}>×</button>
    </span>):<i aria-hidden="true"/>}</div>
   </div>)}
  </section>
  {/* Rodada 82 (pedido do usuário: "Colocar essa parte na parte do preparar missão… ao carregar o modelo que está salvo… já vai
      aparecer os itens" e "Deveria ficar acima de taticas salvas"): o seletor de modelo salvo saiu da escolha do shinobi. */}
  <section className="planner-arsenal" aria-label="Modelo salvo de itens"><b>Modelo salvo</b><small>Carregar um modelo coloca os itens dele no plano e em casa.</small><ArsenalControls {...arsenalControls}/></section>
  <details className="planner-tactics">
   <summary>Táticas salvas · {tactics.length}/4</summary>
   <div className="planner-tactics-grid">
    <MissionTactics heroName={hero.name} tactics={tactics} saveTactic={saveTactic} applyTactic={applyTactic} deleteTactic={deleteTactic} updateTactic={updateTactic}/>
    <section className="planner-archives"><h3>Itens arquivados <small>{archivedItems.length}/{archiveItemLimit}</small></h3>
      <div className="planner-slots">{ITEMS.filter(item=>archivedItems.includes(item.id)).map(item=><span key={item.id} title={item.name}><ItemIcon name={item.name}/><button type="button" className="planner-remove" aria-label={'Retirar '+item.name+' do arquivo'} onClick={()=>toggleArchivedItem(item.id)}>×</button></span>)}{!archivedItems.length&&<small>Nenhum item arquivado.</small>}</div>
    </section>
   </div>
  </details>
  {tab!=='Fusões'&&<PoolFilters value={filters} onChange={setFilters} facets={tab==='Itens'?{school:['Taijutsu','Ninjutsu','Genjutsu'],element:ITEMS.map(itemElement),attribute:ITEMS.map(itemAttribute)}:tab==='Habilidades'?{school:techniques.map(techniqueSchool),element:techniques.map(t=>t.element),shape:techniques.map(t=>t.shape)}:{}}/>}
  {tab==='Itens'&&<RarityFilter selected={rarities} onChange={setRarities} counts={rarityCounts(itemsBeforeRarity)}/>}
  {tab==='Fusões'
   ? <section className="planner-fusions" aria-label="Fusões de técnicas">
     <div className="planner-fusion-toolbar">
       <div><h2>Fusões e combinações</h2><p>Na missão, leve as duas técnicas ao nível máximo. A Oficina dos Sapos Sábios faz <b>1 fusão ou combinação por zona</b>: planeje até {MERGE_PLAN.limit}, uma para cada zona.</p></div>
       <button type="button" className="planner-fusion-save" disabled={!canPreview||duplicate||planFull}
         onClick={()=>{addFusionPair(...candidate);setFusionA('');setFusionB('');}}>{duplicate?'Par já planejado':'Planejar união'} ({fusionPlan.length}/{MERGE_PLAN.limit})</button>
     </div>
     <label className="fusion-search"><span>Buscar técnica ou fusão</span><input type="search" value={fusionSearch} onChange={e=>setFusionSearch(e.target.value)} placeholder="Ex. Gelo, Raio, Circo Laser"/></label>
     <h3>Fusões que você pode aprender · {catalog.length}</h3>
     <p className="planner-fusion-hint">Saem das técnicas do pool deste shinobi. Selar mais shinobis traz técnicas novas e libera mais fusões.</p>
     <div className="planner-fusion-catalog" aria-label="Fusões disponíveis">
       {shownCatalog.map(f=>{const planIndex=fusionPlan.findIndex(p=>p.includes(f.pair[0])&&p.includes(f.pair[1])),done=planIndex>=0;
         // Rodada 82 (pedido do usuário: "Ao clicar na fusão, ela já fica selecionada"): 1 clique planeja; clicar de novo tira do plano.
         return <button type="button" key={f.result.name} className={'fusion-catalog-entry kind-'+f.kind+(f.kekkei?' is-kekkei':'')} aria-pressed={done} disabled={!done&&planFull} onMouseEnter={event=>showTip(f.name,event.currentTarget,f.pair)} onMouseLeave={()=>setTip(null)} onFocus={event=>showTip(f.name,event.currentTarget,f.pair)} onBlur={()=>setTip(null)} title={done?'Clique para tirar do plano':planFull?`Limite de ${MERGE_PLAN.limit} uniões (1 por zona)`:'Clique para planejar'} onClick={()=>{setFusionA(f.pair[0]);setFusionB(f.pair[1]);if(done)removeFusionPair(planIndex);else addFusionPair(...f.pair);}}>
         <span className="fusion-catalog-icon"><SkillIcon heroId={hero.id} name={f.result.name}/></span><span className="fusion-catalog-text"><small className="fusion-kind">{FUSION_KIND_LABEL[f.kind]}</small><b>{f.name}</b><small>{f.pair[0]} + {f.pair[1]}</small><small className="fusion-catalog-effect">{[f.result.element,f.result.secondaryElement].filter(Boolean).join(' + ')} · {f.result.school} · {fusionParts(f.result).map(p=>p.kind).join(' · ')}</small>{done&&<small className="fusion-catalog-planned">✓ Planejada</small>}</span>
       </button>;})}
     </div>
     {!catalog.length&&<p className="planner-empty">Este pool ainda não tem duas técnicas que se fundem. Sele mais shinobis para liberar fusões.</p>}
     <h3>Combinações do kit · {combos.length}</h3>
     <p className="planner-fusion-hint">Qualquer par de técnicas de ataque pode ser combinado: as duas disparam juntas com ×1,5 e um atributo extra.</p>
     <div className="planner-fusion-catalog" aria-label="Combinações disponíveis">
       {combos.map(c=>{const planIndex=fusionPlan.findIndex(p=>p.includes(c.pair[0])&&p.includes(c.pair[1])),done=planIndex>=0;
         return <button type="button" key={c.name} className="fusion-catalog-entry kind-combinacao" aria-pressed={done} disabled={!done&&planFull} title={done?'Clique para tirar do plano':planFull?`Limite de ${MERGE_PLAN.limit} uniões (1 por zona)`:'Clique para planejar'} onClick={()=>{setFusionA(c.pair[0]);setFusionB(c.pair[1]);if(done)removeFusionPair(planIndex);else addFusionPair(...c.pair);}}>
         <span className="fusion-catalog-icon"><SkillIcon heroId={hero.id} name={c.pair[0]}/></span><span className="fusion-catalog-text"><small className="fusion-kind">Combinação</small><b>{c.name}</b><small>{[c.result.element,c.result.secondaryElement].filter(Boolean).join(' + ')} · {c.result.school}</small>{done&&<small className="fusion-catalog-planned">✓ Planejada · Zona {planIndex+1}</small>}</span>
       </button>;})}
     </div>
     {catalog.length>0&&!shownCatalog.length&&<p className="planner-empty">Nenhuma fusão com essa busca.</p>}
     {canPreview&&<div className="fusion-comparison">
       <FusionCard heroId={hero.id} pair={candidate} kind="fuse" pool={techniques}/>
       <FusionCard heroId={hero.id} pair={candidate} kind="combine" pool={techniques}/>
     </div>}
     <details className="fusion-manual">
     <summary>Montar o par à mão</summary>
     <h3>{fusionA&&!fusionB?'Escolha a segunda técnica':'Escolha as duas técnicas'}</h3>
     <div className="fusion-ingredient-grid" aria-label="Técnicas para fundir">
       {fusionOptions.filter(t=>matchesSearch(t.name+' '+t.element+' '+techniqueSchool(t),fusionSearch)||t.name===fusionA||t.name===fusionB).map(t=><button type="button" className="fusion-ingredient" key={t.name} aria-pressed={t.name===fusionA||t.name===fusionB}
         onClick={()=>{if(t.name===fusionA){setFusionA(fusionB);setFusionB('');}
           else if(t.name===fusionB)setFusionB('');
           else if(!fusionA)setFusionA(t.name);
           else setFusionB(t.name);}}>
         <SkillIcon heroId={hero.id} name={t.name}/><span><b>{t.name}</b><small>{t.element} · {t.shape}</small>
         <small>{techniqueStatusText(t)}</small></span>
       </button>)}
     </div>
     </details>
     <div className="planner-fusion-grid">
      {fusionPlan.map((pair,i)=><article className="planner-saved-fusion" key={pair.join(' / ')}>
       <header><b>{fusionName(pair)}</b><button type="button" aria-label={`Remover o par ${pair[0]} e ${pair[1]}`} onClick={()=>removeFusionPair(i)}>✕</button></header>
       <div className="fusion-comparison">
        <FusionCard heroId={hero.id} pair={pair} kind="fuse" pool={techniques}/>
        <FusionCard heroId={hero.id} pair={pair} kind="combine" pool={techniques}/>
       </div>
      </article>)}
     </div>
     {!fusionPlan.length&&!canPreview&&catalog.length>0&&<p className="planner-empty">Escolha uma fusão da lista para ver o resultado e planejar.</p>}
    </section>
   : <>
    <div className="build-view-filters"><button aria-pressed={view==='all'} onClick={()=>setView('all')}>Todos</button><button aria-pressed={view==='planned'} onClick={()=>setView('planned')}>Planejado</button>{tab==='Itens'&&<button aria-pressed={view==='archived'} onClick={()=>setView('archived')}>Arquivados</button>}{tab==='Habilidades'&&<><button aria-pressed={view==='archived'} onClick={()=>setView('archived')}>Deixar em casa</button><small>{trained.length}/{trainingSlots} treinadas · {archivedSkills.length}/{archiveLimit} bloqueadas</small></>}</div>
    {/* 25/11/2026 (pedido do usuário, print com X): sem o painel lateral na aba Pílulas — os cartões já mostram efeito, descrição e quantidade. */}
    <div className={`build-workspace${tab==='Pílulas'?' no-detail':''}`}>
     <div className="build-tech-list">
      <div className={`planner-card-grid ${tab==='Habilidades'?'planner-tech-grid':''}`}>
        {visible.map(e=>{
          const technique=tab==='Habilidades'?techniqueByName.get(e.name):undefined;
          return <article key={e.id} className={['pool-card','planner-option',planned.includes(e.name)?'planned':'',e.archived?'archived':'',focused?.id===e.id?'focused':'',tab==='Itens'?'rarity-'+e.rarity.toLowerCase():''].join(' ')}>
            <button type="button" className="build-entry" aria-pressed={focused?.id===e.id} onClick={()=>setSelected(e.id)}>
              {e.icon}<span><b>{e.name}</b><small>{technique?`Aprende no Nv. ${technique.unlockLevel} · ${techniqueSchool(technique)} · ${technique.element} · ${technique.shape}`:estado(e)}</small></span>
            </button>
            {technique?<small className="planner-option-state">{e.archived?'Em casa':e.rarity}{trained.includes(e.name)?' · +15% de dano':''}<span className="planner-option-effect">{techniqueStatusText(technique)}</span></small>:(()=>{const info=plannerCardInfo(e.name);return info?<dl className="planner-card-info"><div><dt>Efeito</dt><dd><BuffText text={info.effect}/></dd></div>{info.flavor&&<div><dt>Descrição</dt><dd>{info.flavor}</dd></div>}<div><dt>Quantidade</dt><dd>{info.quantity}</dd></div></dl>:<p><BuffText text={e.description}/></p>;})()}
            {technique&&fusionRecipes(e.name).map(recipe=><b key={recipe} className="fusion-badge planner-fusion-requirement" title="Requisito para Fusão">⚗ {recipe}</b>)}
            {entryActions(e)}
          </article>;
        })}
      </div>
     </div>
     {tab!=='Pílulas'&&<aside className="build-detail" aria-label="Detalhes da opção">{focused?<><header className="planner-detail-heading">{focused.icon}<h2>{focused.name}</h2></header><p><BuffText text={focused.description}/></p>{tab==='Itens'&&<PlannerRarity rarity={ITEM_BY_NAME[focused.name].rarity} max={ITEM_BY_NAME[focused.name].max}/>}{preview&&<><dl className="technique-base-data"><div><dt>Nível para aprender</dt><dd>{preview.unlockLevel} na missão</dd></div><div><dt>Status da técnica</dt><dd>{techniqueStatusText(preview)}</dd></div><div><dt>Chance crítica inicial</dt><dd>{preview.setup?'—':Math.round((base.crit+techniqueCritical(preview).chance)*100)+'%'}</dd></div><div><dt>Dano crítico inicial</dt><dd>{preview.setup?'—':Math.round((base.critDamage+techniqueCritical(preview).damage)*100)+'%'}</dd></div><div><dt>Recarga base</dt><dd>{(preview.setup?setupNumbers(preview).cooldown:attackCooldown(preview,1)).toLocaleString('pt-BR')} s</dd></div></dl><TechniquePreview technique={preview} heroId={hero.id}/><small>Prévia em alvos de treino</small></>}{planned.includes(focused.name)&&!focused.archived&&<b>Planejado</b>}{fusionRecipes(focused.name).map(recipe=><b key={recipe} className="fusion-badge" title="Requisito para Fusão">⚗ Requisito para Fusão: {recipe}</b>)}</>:<p>Nenhuma opção com estes filtros.</p>}</aside>}
    </div>
   </>}
 </div>;
}

function FusionCard({heroId,pair,kind,pool}:{heroId:string;pair:[string,string];kind:'fuse'|'combine';pool:readonly Technique[]}){
 const result=mergedTechnique({kind,names:pair},pool,familyOf(heroId));
 const [first,second]=pair.map(name=>pool.find(technique=>technique.name===name));
 if(!result||!first||!second)return <div className="planner-fusion-card"><p>{kind==='fuse'&&first&&second?'Este par não tem receita de fusão. Ele pode ser Combinado.':'Par indisponível no pool atual.'}</p></div>;
 const recipe=kekkeiFusion(result.name);
 const sources=<div className="fusion-sources">{[first,second].map((technique,i)=><span key={technique.name}>{i>0&&<i aria-hidden="true">+</i>}<SkillIcon heroId={heroId} name={technique.name}/>{technique.name}</span>)}</div>;
 if(kind==='combine'||!recipe){
  const effects=[first,second].flatMap(technique=>[technique.status,technique.burn?'Queimadura':null]).filter(Boolean);
  return <article className="planner-fusion-card is-combination">
   <div className="fusion-result-heading"><SkillIcon heroId={heroId} name={result.name}/><div><small>Combinação</small><h3>{result.name}</h3></div></div>
   {sources}
   <dl>
    <div><dt>Dano</dt><dd>1,5× por técnica · {combineBonus(first,second).label}</dd></div>
    <div><dt>Recarga no Nv. 1</dt><dd>{attackCooldown(result,1).toLocaleString('pt-BR',{maximumFractionDigits:2})} s</dd></div>
    {effects.length>0&&<div><dt>Efeitos</dt><dd>{[...new Set(effects)].join(' · ')}</dd></div>}
   </dl>
   <p>As duas técnicas atacam juntas e usam o mesmo espaço.</p>
  </article>;
 }
 const sheet=fusionSheet(result,pair),upgrades=fusionUpgrades(result),bonus=fusionBonus(first,second,familyOf(heroId));
 // 25/11/2026 — cartão novo (docs/10, item 4): nome e tipo, ingredientes, natureza/escola/forma, descrição, como funciona,
 // quais melhorias afetam e a ficha.
 return <article className={'planner-fusion-card is-fusion fusion-card-v2 kind-'+recipe.kind}>
  <div className="fusion-result-heading"><SkillIcon heroId={heroId} name={result.name}/><div><small>{sheet.label}</small><h3>{recipe.name}</h3></div></div>
  {sources}
  <div className="fusion-tags">
   {[result.element,result.secondaryElement].filter((e):e is Technique['element']=>!!e).map(element=><span key={element} style={{color:ELEMENT_COLOR[element]}}>{element}</span>)}
   <span>{result.school}</span><span>{result.shape}</span>
  </div>
  <p className="fusion-summary">{recipe.summary}</p>
  <section className="fusion-how" aria-label="Como funciona"><h4>Como funciona</h4>
   <ol>{fusionParts(result).map(part=><li key={part.kind}><b>{part.kind}</b><span>{part.text}</span></li>)}</ol>
  </section>
  <section className="fusion-upgrades" aria-label="Quais melhorias afetam"><h4>Quais melhorias afetam</h4>
   <ul>{upgrades.helps.map(u=><li key={u.stat}><b>{u.stat}</b><span>{u.effect}</span></li>)}</ul>
   {upgrades.noHelp.length>0&&<p className="fusion-nohelp">Não ajuda: {upgrades.noHelp.join('; ')}.</p>}
  </section>
  <dl className="fusion-sheet">
   <div><dt>Dano</dt><dd>{sheet.base}{bonus>0?' · +15% ('+(first.element===second.element?'mesma natureza':'Kekkei Genkai da linhagem')+')':''} · afixos somados</dd></div>
   <div><dt>Recarga</dt><dd>{sheet.cooldown} no Nv. 1</dd></div>
   <div><dt>Status</dt><dd>{sheet.status}</dd></div>
   <div><dt>Níveis</dt><dd>{sheet.cap}</dd></div>
  </dl>
 </article>;
}

export function MissionTactics({heroName,tactics,saveTactic,applyTactic,deleteTactic,updateTactic}:{heroName:string;tactics:MissionTactic[];saveTactic:(name:string)=>void;applyTactic:(index:number)=>void;deleteTactic:(index:number)=>void;updateTactic:(index:number)=>void;}){
 const [tacticName,setTacticName]=useState('');
 return (
  <section className="build-tactics">
   <h3>Táticas de Missão · {heroName}</h3>
   <p className="home-copy">Salve até quatro planos para este shinobi. Aplique uma tática, edite o plano e use Atualizar para gravar as mudanças nela.</p>
   <form onSubmit={(e)=>{e.preventDefault();saveTactic(tacticName);setTacticName('');}}>
    <input value={tacticName} onChange={e=>setTacticName(e.target.value)} maxLength={32} placeholder="Ex.: Rush de raiju" aria-label="Nome da tática de missão"/>
    <button type="submit" disabled={tactics.length>=4}>Salvar Tática de Missão ({tactics.length}/4)</button>
   </form>
   <div className="tactic-list">{tactics.map((t,i)=><div className="tactic-chip" key={t.name+i}><b>{t.name}</b><small>{t.planned.length} planejadas · {t.trained.length} treinadas · {t.home.length} em casa · {t.priority.length} prioritários · {t.fusion.length} fusões</small><button type="button" onClick={()=>applyTactic(i)}>Aplicar</button><button type="button" onClick={()=>updateTactic(i)}>Atualizar</button><button type="button" aria-label={`Excluir a tática ${t.name}`} onClick={()=>deleteTactic(i)}>✕</button></div>)}{!tactics.length&&<small>Nenhuma tática salva ainda.</small>}</div>
  </section>

 );
}
