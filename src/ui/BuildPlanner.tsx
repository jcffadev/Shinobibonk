import { TechniquePreview } from './TechniquePreview';
import { calculateStats } from '../game/progression';
import { BuffText } from './BuffText';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ITEMS, ITEM_BY_NAME, type Rarity } from '../game/catalog';
import { PILL_NAMES, PILL_MAX, pillDescription } from '../game/pills';
import { pillStatPreview } from '../game/pillPreview';
import { PillStatPreview } from './PillStatPreview';
import { techniquePool, HERO_BY_ID, heroAffinity, type PoolTechnique, type Technique } from '../game/heroes';
import { sealedHeroes, researchProgress } from '../game/account';
import { PRESET_LIMIT } from '../game/missionBag';
import { mergedTechnique } from '../game/techniqueMerge';
/** Origem da técnica no pool (regra do usuário: 1–2 únicas por shinobi; compartilhadas por vila/elemento; únicas de outros só após selar). */
function sourceText(t:PoolTechnique){const who=HERO_BY_ID[t.origin]?.name??t.origin;if(t.source==='kit')return 'Kit próprio.';if(t.source==='basica')return 'Básica da Academia (sempre disponível).';if(t.source==='vila')return 'Compartilhada · mesma vila ('+who+').';if(t.source==='elemento')return 'Compartilhada · mesmo elemento '+t.element+' ('+who+').';return t.locked?'Única de '+who+' · bloqueada até selar '+who+' pela 1ª vez.':'Única de '+who+' (selado).';}
import { attackCooldown,setupNumbers,itemSchools,itemElement,itemAttribute,techniqueCritical,techniqueDetail,techniqueStatusText } from '../game/combat';
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

export function BuildPlanner({hero,unlocked,planned,togglePlanned,archivedItems,archiveItemLimit,toggleArchivedItem,saveItemPreset,itemPresetCount,archivedSkills,archiveLimit,trainingSlots,trained,trainTechnique,toggleSkill,fusionPlan,addFusionPair,removeFusionPair,tactics,saveTactic,applyTactic,deleteTactic,updateTactic}:{hero:{id:string;name:string;skills:string[]};unlocked:string[];planned:string[];togglePlanned:(name:string)=>void;archivedItems:string[];archiveItemLimit:number;toggleArchivedItem:(id:string)=>void;saveItemPreset:(name:string)=>void;itemPresetCount:number;archivedSkills:string[];archiveLimit:number;trainingSlots:number;trained:string[];trainTechnique:(name:string)=>void;toggleSkill:(name:string)=>void;fusionPlan:[string,string][];addFusionPair:(a:string,b:string)=>void;removeFusionPair:(index:number)=>void;tactics:MissionTactic[];saveTactic:(name:string)=>void;applyTactic:(index:number)=>void;deleteTactic:(index:number)=>void;updateTactic:(index:number)=>void;}){
 const [tab,setTab]=useState('Habilidades'),[filters,setFiltersState]=useState({...EMPTY_FILTERS}),[rarities,setRarities]=useState<Rarity[]>([]),[selected,setSelected]=useState(''),[view,setView]=useState<'all'|'planned'|'archived'>('all'),[,setTick]=useState(0);
 const [tip,setTip]=useState<{name:string;x:number;y:number}|null>(null);
 const [presetName,setPresetName]=useState('');
 const [fusionA,setFusionA]=useState(''),[fusionB,setFusionB]=useState('');
 useEffect(()=>{const on=()=>setTick(n=>n+1);window.addEventListener('shinobi-account',on);return ()=>window.removeEventListener('shinobi-account',on);},[]);
 const techniques=techniquePool(hero.id,sealedHeroes()),research=researchProgress();const researchOf=(t:PoolTechnique)=>t.source==='kit'||t.source==='basica'?1:research[t.name]||0;
 const setFilters=(next:Filters)=>{setFiltersState(next);if(Object.values(next).every(v=>!v))setRarities([]);};
 const itemsBeforeRarity=ITEMS.filter(i=>(!filters.school||itemSchools(i).includes(filters.school))&&(!filters.element||itemElement(i)===filters.element)&&(!filters.attribute||itemAttribute(i)===filters.attribute)&&matchesSearch(i.name+' '+i.description,filters.search));
 const excluded=[...techniques.filter(t=>archivedSkills.includes(t.name)&&t.name!==hero.skills[0]).map(t=>t.name),...ITEMS.filter(i=>archivedItems.includes(i.id)).map(i=>i.name)];
 const favorites=planned.filter(name=>!excluded.includes(name)&&(techniques.some(t=>t.name===name)||PILL_NAMES.includes(name)||ITEMS.some(i=>i.name===name)));
 const entries=tab==='Itens'?ITEMS.filter(i=>(!rarities.length||rarities.includes(i.rarity))&&(!filters.school||itemSchools(i).includes(filters.school))&&(!filters.element||itemElement(i)===filters.element)&&(!filters.attribute||itemAttribute(i)===filters.attribute)).map(i=>({id:i.id,name:i.name,description:i.description,archived:archivedItems.includes(i.id),unlocked:i.rarity==='Comum'||unlocked.includes(i.id),locked:false,toggle:undefined,icon:<ItemIcon name={i.name}/>,rarity:i.rarity})):tab==='Pílulas'?PILL_NAMES.map(name=>({id:name,name,description:pillDescription(name),archived:false,unlocked:true,locked:false,toggle:undefined,icon:<ItemIcon name={name}/>,rarity:`Pílula · máximo ${PILL_MAX} níveis`})):techniques.filter(t=>(!filters.school||t.school===filters.school)&&(!filters.shape||t.shape===filters.shape)&&(!filters.element||t.element===filters.element)).map(t=>({id:t.name,name:t.name,description:(t.setup?techniqueDetail(t)+' Nv. '+t.unlockLevel+'. ':t.school+' · '+t.element+' · '+t.shape+' · Nv. '+t.unlockLevel+'. '+(t.status?'Pode '+t.status.toLowerCase()+'. ':''))+sourceText(t)+(t.element!=='Neutro'&&t.element===heroAffinity(hero.id)?' Natureza do shinobi: ×1,5 de dano.':'')+(t.source!=='kit'&&!t.locked?' Pesquisa '+Math.round(researchOf(t)*100)+'% (aprenda/melhore na run; 100% libera planejar).':''),archived:archivedSkills.includes(t.name),unlocked:!t.locked&&researchOf(t)>=1,locked:t.name===hero.skills[0]||t.locked||(!archivedSkills.includes(t.name)&&archivedSkills.length>=archiveLimit),toggle:()=>toggleSkill(t.name),icon:<SkillIcon heroId={hero.id} name={t.name}/>,rarity:t.name===hero.skills[0]?'Inicial obrigatória':t.locked?'🔒 Única bloqueada':t.source==='kit'?'Kit · técnica automática':t.source==='basica'?'Básica · Academia':t.source==='única'?'Única de outro shinobi · '+Math.round(researchOf(t)*100)+'%':'Compartilhada · '+Math.round(researchOf(t)*100)+'%'}));
 const visible=entries.filter(e=>matchesSearch(e.name+' '+e.description,filters.search)&&(view==='all'||(view==='archived'?e.archived:planned.includes(e.name)&&!e.archived)));
 const focused=visible.find(e=>e.id===selected)??visible[0];
 const preview=tab==='Habilidades'?techniques.find(t=>t.name===focused?.name&&!t.locked):undefined;
 const base=calculateStats(hero.id,1);
 const estado=(e:{unlocked:boolean;archived:boolean})=>!e.unlocked?(tab==='Habilidades'?'Precisa pesquisar/selar':'Precisa desbloquear'):e.archived?(tab==='Habilidades'?'Deixar em casa':'Em casa'):'No pool';
 const inFusion=(name:string)=>fusionPlan.some(p=>p.includes(name));
 // Rodada 39 — Fusões: candidatos seguem a regra da Oficina dos Sapos Sábios (sem setup, sem bloqueio).
 // A execução continua na run (1 uso por zona); aqui apenas planeja o par e marca o pool da run com ⚗.
 const fusionOptions=techniques.filter(t=>!t.setup&&!t.locked&&!archivedSkills.includes(t.name));
 const candidate:[string,string]=[fusionA,fusionB];
 const canPreview=fusionOptions.some(t=>t.name===fusionA)&&fusionOptions.some(t=>t.name===fusionB)&&fusionA!==fusionB;
 const duplicate=fusionPlan.some(pair=>pair.includes(fusionA)&&pair.includes(fusionB));
 const fusionName=(pair:[string,string])=>mergedTechnique({kind:'fuse',names:pair},techniques)?.name??pair.join(' / ');
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
 const showTip=(name:string,node:HTMLElement)=>{const rect=node.getBoundingClientRect();setTip({name,x:Math.max(8,Math.min(rect.left,window.innerWidth-280)),y:rect.bottom+9});};
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
  {tip&&createPortal(<aside role="tooltip" className="planner-tooltip" style={{left:tip.x,top:Math.min(tip.y,window.innerHeight-140)}}>
    <b>{tip.name}</b>
    {tipTechnique&&<><small>{tipTechnique.school} · {tipTechnique.element} · {tipTechnique.shape}</small><span>{techniqueStatusText(tipTechnique)}</span><small>Aprende no Nv. {tipTechnique.unlockLevel} · Recarga {(tipTechnique.setup?setupNumbers(tipTechnique).cooldown:attackCooldown(tipTechnique,1)).toLocaleString('pt-BR')} s</small></>}
    {tipItem&&<><PlannerRarity rarity={tipItem.rarity} max={tipItem.max}/><span>{tipItem.description}</span></>}
    {PILL_NAMES.includes(tip.name)&&<span>{pillDescription(tip.name)}</span>}
   </aside>,document.body)}

  <div className="planner-active"><b>Plano ativo</b><small>{favorites.length+fusionPlan.length} opções planejadas</small></div>
  <section className="planner-categories" aria-label="Resumo do plano">
   {categories.map(category=><div className={tab===category?'active':''} key={category}>
    <button type="button" aria-pressed={tab===category} onClick={()=>selectTab(category)}>{category} <small>{plannedByCategory[category].length}</small></button>
    <div className="planner-slots">{plannedByCategory[category].length?plannedByCategory[category].map((name,index)=><span key={name} onMouseEnter={event=>showTip(name,event.currentTarget)} onMouseLeave={()=>setTip(null)} onFocus={event=>showTip(name,event.currentTarget)} onBlur={()=>setTip(null)}>
     {category==='Habilidades'||category==='Fusões'?<SkillIcon heroId={hero.id} name={name}/>:<ItemIcon name={name}/>}
     <button type="button" className="planner-remove" aria-label={'Remover '+name+' do plano'} onClick={()=>{setTip(null);if(category==='Fusões')removeFusionPair(index);else togglePlanned(name);}}>×</button>
    </span>):<i aria-hidden="true"/>}</div>
   </div>)}
  </section>
  <details className="planner-tactics">
   <summary>Táticas salvas · {tactics.length}/4</summary>
   <div className="planner-tactics-grid">
    <MissionTactics heroName={hero.name} tactics={tactics} saveTactic={saveTactic} applyTactic={applyTactic} deleteTactic={deleteTactic} updateTactic={updateTactic}/>
    <section className="planner-archives"><h3>Itens arquivados <small>{archivedItems.length}/{archiveItemLimit}</small></h3>
      <div className="planner-slots">{ITEMS.filter(item=>archivedItems.includes(item.id)).map(item=><span key={item.id} title={item.name}><ItemIcon name={item.name}/><button type="button" className="planner-remove" aria-label={'Retirar '+item.name+' do arquivo'} onClick={()=>toggleArchivedItem(item.id)}>×</button></span>)}{!archivedItems.length&&<small>Nenhum item arquivado.</small>}</div>
      <form onSubmit={event=>{event.preventDefault();if(!presetName.trim())return;saveItemPreset(presetName.trim());setPresetName('');}}>
       <input aria-label="Nome do arsenal" placeholder="Nome do arsenal" maxLength={32} value={presetName} onChange={event=>setPresetName(event.target.value)}/>
       <button type="submit" disabled={!presetName.trim()||itemPresetCount>=PRESET_LIMIT}>Salvar arsenal da conta</button>
      </form>
    </section>
   </div>
  </details>
  {tab!=='Fusões'&&<PoolFilters value={filters} onChange={setFilters} facets={tab==='Itens'?{school:['Taijutsu','Ninjutsu','Genjutsu'],element:ITEMS.map(itemElement),attribute:ITEMS.map(itemAttribute)}:tab==='Habilidades'?{school:techniques.map(t=>t.school),element:techniques.map(t=>t.element),shape:techniques.map(t=>t.shape)}:{}}/>}
  {tab==='Itens'&&<RarityFilter selected={rarities} onChange={setRarities} counts={rarityCounts(itemsBeforeRarity)}/>}
  {tab==='Fusões'
   ? <section className="planner-fusions" aria-label="Fusões de técnicas">
     <div className="planner-fusion-toolbar">
       <div><h2>Fusões de técnicas</h2><p>A Oficina dos Sapos Sábios permite fundir ou combinar uma vez por zona.</p></div>
       <div className="build-fusion-form">
        <select value={fusionA} onChange={e=>setFusionA(e.target.value)} aria-label="Primeira técnica da fusão"><option value="">Primeira técnica…</option>{fusionOptions.filter(t=>t.name!==fusionB).map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select>
        <span aria-hidden="true">+</span>
        <select value={fusionB} onChange={e=>setFusionB(e.target.value)} aria-label="Segunda técnica da fusão"><option value="">Segunda técnica…</option>{fusionOptions.filter(t=>t.name!==fusionA).map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select>
        <button type="button" disabled={!canPreview||duplicate||fusionPlan.length>=4} onClick={()=>{addFusionPair(...candidate);setFusionA('');setFusionB('');}}>Planejar par ({fusionPlan.length}/4)</button>
       </div>
     </div>
     {canPreview&&<div className="fusion-comparison">
       <FusionCard heroId={hero.id} pair={candidate} kind="fuse" pool={techniques}/>
       <FusionCard heroId={hero.id} pair={candidate} kind="combine" pool={techniques}/>
     </div>}
     <div className="planner-fusion-grid">
      {fusionPlan.map((pair,i)=><article className="planner-saved-fusion" key={pair.join(' / ')}>
       <header><b>{fusionName(pair)}</b><button type="button" aria-label={`Remover o par ${pair[0]} e ${pair[1]}`} onClick={()=>removeFusionPair(i)}>✕</button></header>
       <div className="fusion-comparison">
        <FusionCard heroId={hero.id} pair={pair} kind="fuse" pool={techniques}/>
        <FusionCard heroId={hero.id} pair={pair} kind="combine" pool={techniques}/>
       </div>
      </article>)}
     </div>
     {!fusionPlan.length&&!canPreview&&<p className="planner-empty">Selecione duas técnicas para ver o resultado.</p>}
    </section>
   : <>
    <div className="build-view-filters"><button aria-pressed={view==='all'} onClick={()=>setView('all')}>Todos</button><button aria-pressed={view==='planned'} onClick={()=>setView('planned')}>Planejado</button>{tab==='Itens'&&<button aria-pressed={view==='archived'} onClick={()=>setView('archived')}>Arquivados</button>}{tab==='Habilidades'&&<><button aria-pressed={view==='archived'} onClick={()=>setView('archived')}>Deixar em casa</button><small>{trained.length}/{trainingSlots} treinadas · {archivedSkills.length}/{archiveLimit} bloqueadas</small></>}</div>
    <div className="build-workspace">
     <div className="build-tech-list">
      <div className={`planner-card-grid ${tab==='Habilidades'?'planner-tech-grid':''}`}>
        {visible.map(e=>{
          const technique=tab==='Habilidades'?techniqueByName.get(e.name):undefined;
          return <article key={e.id} className={['pool-card','planner-option',planned.includes(e.name)?'planned':'',e.archived?'archived':'',focused?.id===e.id?'focused':'',tab==='Itens'?'rarity-'+e.rarity.toLowerCase():''].join(' ')}>
            <button type="button" className="build-entry" aria-pressed={focused?.id===e.id} onClick={()=>setSelected(e.id)}>
              {e.icon}<span><b>{e.name}</b><small>{technique?`Aprende no Nv. ${technique.unlockLevel} · ${technique.element} · ${technique.shape}`:tab==='Itens'?<><PlannerRarity rarity={ITEM_BY_NAME[e.name].rarity} max={ITEM_BY_NAME[e.name].max}/></>:estado(e)}</small></span>
            </button>
            {technique?<small className="planner-option-state">{e.archived?'Em casa':e.rarity}{trained.includes(e.name)?' · +15% de dano':''}<span className="planner-option-effect">{techniqueStatusText(technique)}</span></small>:<p><BuffText text={e.description}/></p>}
            {entryActions(e)}
          </article>;
        })}
      </div>
     </div>
     <aside className="build-detail" aria-label="Detalhes da opção">{focused?<><header className="planner-detail-heading">{focused.icon}<h2>{focused.name}</h2></header><p><BuffText text={focused.description}/></p>{tab==='Itens'&&<PlannerRarity rarity={ITEM_BY_NAME[focused.name].rarity} max={ITEM_BY_NAME[focused.name].max}/>}{tab==='Pílulas'&&<PillStatPreview title="No Nv. 1 do shinobi, com 1 nível da pílula" lines={pillStatPreview(focused.name,base,hero.id,1)}/>}{preview&&<><dl className="technique-base-data"><div><dt>Nível para aprender</dt><dd>{preview.unlockLevel} na missão</dd></div><div><dt>Status da técnica</dt><dd>{techniqueStatusText(preview)}</dd></div><div><dt>Chance crítica inicial</dt><dd>{preview.setup?'—':Math.round((base.crit+techniqueCritical(preview).chance)*100)+'%'}</dd></div><div><dt>Dano crítico inicial</dt><dd>{preview.setup?'—':Math.round((base.critDamage+techniqueCritical(preview).damage)*100)+'%'}</dd></div><div><dt>Recarga base</dt><dd>{(preview.setup?setupNumbers(preview).cooldown:attackCooldown(preview,1)).toLocaleString('pt-BR')} s</dd></div></dl><TechniquePreview technique={preview} heroId={hero.id}/><small>Prévia em alvos de treino</small></>}{planned.includes(focused.name)&&!focused.archived&&<b>Planejado</b>}{inFusion(focused.name)&&<b className="fusion-badge">⚗ Participa de uma fusão planejada</b>}</>:<p>Nenhuma opção com estes filtros.</p>}</aside>
    </div>
   </>}
 </div>;
}

function FusionCard({heroId,pair,kind,pool}:{heroId:string;pair:[string,string];kind:'fuse'|'combine';pool:readonly Technique[]}){
 const result=mergedTechnique({kind,names:pair},pool);
 const [first,second]=pair.map(name=>pool.find(technique=>technique.name===name));
 if(!result||!first||!second)return <div className="planner-fusion-card"><p>Par indisponível no pool atual.</p></div>;
 const fused=kind==='fuse', parts=fused?[result]:[first,second];
 const effects=fused?[result.status,result.secondaryStatus,result.burn?'Queimadura':null]:
  parts.flatMap(technique=>[technique.status,technique.burn?'Queimadura':null]);
 const projectiles=parts.some(t=>['Projétil','Em V'].includes(t.shape));
 return <article className={`planner-fusion-card ${fused?'is-fusion':'is-combination'}`}>
  <div className="fusion-result-heading"><SkillIcon heroId={heroId} name={result.name}/><div><small>{fused?'Fusão · Épico':'Combinação · Raro'}</small><h3>{result.name}</h3></div></div>
  <div className="fusion-sources">{[first,second].map(technique=><span key={technique.name}><SkillIcon heroId={heroId} name={technique.name}/>{technique.name}</span>)}</div>
  <div className="fusion-tags">
   {[...new Set([first.element,second.element])].map(element=><span key={element} style={{color:ELEMENT_COLOR[element]}}>{element}</span>)}
   {[...new Set(parts.flatMap(t=>[t.school,t.shape]))].map(label=><span key={label}>{label}</span>)}
  </div>
  <dl>
   <div><dt>Dano</dt><dd>{fused?'2× a média · afixos somados':'1,5× por técnica'}</dd></div>
   <div><dt>Recarga</dt><dd>{result.cooldown.toLocaleString('pt-BR')} s</dd></div>
   {effects.some(Boolean)&&<div><dt>Efeitos</dt><dd>{[...new Set(effects.filter(Boolean))].join(' · ')}</dd></div>}
   <div><dt>Melhorias</dt><dd>Dano, área, recarga{effects.some(Boolean)?', duração de status':''}{projectiles?', projéteis':''}</dd></div>
  </dl>
  <p>{fused?'Nova técnica em área a partir do Nv. 1.':'As duas técnicas usam o mesmo espaço.'}</p>
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
