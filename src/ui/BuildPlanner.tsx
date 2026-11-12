import { TechniquePreview } from './TechniquePreview';
import { calculateStats } from '../game/progression';
import { BuffText } from './BuffText';
import { useEffect, useState } from 'react';
import { ITEMS } from '../game/catalog';
import { PILL_NAMES, PILL_MAX, pillDescription } from '../game/pills';
import { pillStatPreview } from '../game/pillPreview';
import { PillStatPreview } from './PillStatPreview';
import { techniquePool, HERO_BY_ID, heroAffinity, type PoolTechnique } from '../game/heroes';
import { sealedHeroes, researchProgress } from '../game/account';
import { mergedTechnique } from '../game/techniqueMerge';
/** Origem da técnica no pool (regra do usuário: 1–2 únicas por shinobi; compartilhadas por vila/elemento; únicas de outros só após selar). */
function sourceText(t:PoolTechnique){const who=HERO_BY_ID[t.origin]?.name??t.origin;if(t.source==='kit')return 'Kit próprio.';if(t.source==='basica')return 'Básica da Academia (sempre disponível).';if(t.source==='vila')return 'Compartilhada · mesma vila ('+who+').';if(t.source==='elemento')return 'Compartilhada · mesmo elemento '+t.element+' ('+who+').';return t.locked?'Única de '+who+' · bloqueada até selar '+who+' pela 1ª vez.':'Única de '+who+' (selado).';}
import { itemSchools,itemElement,itemAttribute,techniqueDetail } from '../game/combat';
import { ItemIcon } from './RunSheet';
import { SkillIcon } from './SkillIcon';
import { PoolFilters,EMPTY_FILTERS,matchesSearch,type Filters } from './PoolFilters';
import { RarityFilter, rarityCounts } from './RarityFilter';
import type { Rarity } from '../game/catalog';

/** Tática de Missão (Rodada 39): snapshot do plano individual do herói — planejadas, treinadas, em casa,
 *  prioridade e fusões. Até 4 por personagem, salvo na conta (localStorage por herói; com login online,
 *  o mesmo formato viaja com o save). */
export type MissionTactic={name:string;planned:string[];trained:string[];home:string[];priority:string[];fusion:[string,string][];archivedSkills?:string[]};

/** Rodada 39 — planner em TABELA (Opção · Origem/efeito · Raridade/estado · Ações), nova aba FUSÕES
 *  (pares até 4 por herói, preview das regras Fundir/Combinar de techniqueMerge.ts) e seção
 *  TÁTICAS DE MISSÃO (snapshot do plano, aplicar/excluir). Tudo individual por personagem. */
export function BuildPlanner({hero,unlocked,planned,togglePlanned,archivedItems,archivedSkills,archiveLimit,trainingSlots,trained,trainTechnique,toggleSkill,fusionPlan,addFusionPair,removeFusionPair,tactics,saveTactic,applyTactic,deleteTactic,updateTactic}:{hero:{id:string;name:string;skills:string[]};unlocked:string[];planned:string[];togglePlanned:(name:string)=>void;archivedItems:string[];archivedSkills:string[];archiveLimit:number;trainingSlots:number;trained:string[];trainTechnique:(name:string)=>void;toggleSkill:(name:string)=>void;fusionPlan:[string,string][];addFusionPair:(a:string,b:string)=>void;removeFusionPair:(index:number)=>void;tactics:MissionTactic[];saveTactic:(name:string)=>void;applyTactic:(index:number)=>void;deleteTactic:(index:number)=>void;updateTactic:(index:number)=>void;}){
 const [tab,setTab]=useState('Habilidades'),[filters,setFiltersState]=useState({...EMPTY_FILTERS}),[rarities,setRarities]=useState<Rarity[]>([]),[selected,setSelected]=useState(''),[view,setView]=useState<'all'|'planned'|'archived'>('all'),[,setTick]=useState(0);
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
 const fusionOptions=techniques.filter(t=>!t.setup&&!t.locked);
 const bothSelected=fusionA&&fusionB&&fusionA!==fusionB;
 const fusePreview=bothSelected?mergedTechnique({kind:'fuse',names:[fusionA,fusionB]},techniques):undefined;
 const combinePreview=bothSelected?mergedTechnique({kind:'combine',names:[fusionA,fusionB]},techniques):undefined;
 const categories=['Habilidades','Pílulas','Fusões','Itens'];
 const plannedByCategory:Record<string,string[]>={
  Habilidades:favorites.filter(name=>techniques.some(t=>t.name===name)),
  Pílulas:favorites.filter(name=>PILL_NAMES.includes(name)),
  Fusões:fusionPlan.map(([a,b])=>a+' + '+b),
  Itens:favorites.filter(name=>ITEMS.some(i=>i.name===name)),
 };
 const entryActions=(e:(typeof visible)[number])=><div className="build-cell-actions">
          {/* Rodada 47 — o botão Treinar aparece para TODAS as técnicas (não só as planejadas): treinar uma técnica
              ainda não planejada auto-planeja ela junto (treinamento sem planejamento era no-op). */}
          {tab==='Habilidades'&&<button type="button" className="training-star" aria-label={trained.includes(e.name)?'Remover treinamento de '+e.name:'Treinar '+e.name+' com Jiraiya'} title={trainingSlots===0?'Libere a passiva Treinamento com Jiraiya':'+15% de dano na missão'+(planned.includes(e.name)?'':' · planeja a técnica automaticamente')} aria-pressed={trained.includes(e.name)} disabled={trainingSlots===0||e.archived||!e.unlocked||(!trained.includes(e.name)&&trained.length>=trainingSlots)} onClick={()=>trainTechnique(e.name)}>{trained.includes(e.name)?'★ Treinada':'☆ Treinar'}</button>}
          <button disabled={!e.unlocked||e.archived} onClick={()=>togglePlanned(e.name)}>{tab==='Itens'?(planned.includes(e.name)?'✓ Na bolsa ninja':'Colocar na bolsa ninja'):(planned.includes(e.name)?'Planejado para Missão':'Planejar para Missão')}</button>
          {e.toggle&&<button className={e.archived?'enable-skill':undefined} title={e.archived?'Devolver esta técnica ao pool da missão':undefined} disabled={e.locked} aria-pressed={e.archived} onClick={e.toggle}>{e.locked?(e.name===hero.skills[0]?'Inicial':'Indisponível'):tab==='Habilidades'?(e.archived?'Permitir aprender':'Deixar em casa'):(e.archived?'Levar na missão':'Deixar em casa')}</button>}
         </div>;
 function selectTab(next:string){
  setTab(next);setView('all');setSelected('');setFilters({...EMPTY_FILTERS});setRarities([]);
 }
 return <div className="mission-planner">
  <div className="planner-active"><b>Plano ativo</b><small>{favorites.length} opções planejadas</small></div>
  <section className="planner-categories" aria-label="Resumo do plano">
   {categories.map(category=><button type="button" className={tab===category?'active':''} key={category} onClick={()=>selectTab(category)}>
    <b>{category} <small>{plannedByCategory[category].length}</small></b>
    <span className="planner-slots">{plannedByCategory[category].length?plannedByCategory[category].map(name=><span key={name} title={name}>
     {category==='Habilidades'?<SkillIcon heroId={hero.id} name={name}/>:category==='Fusões'?<span aria-label={name}>⚗</span>:<ItemIcon name={name}/>}
    </span>):<i aria-hidden="true"/>}</span>
   </button>)}
  </section>
  <details className="planner-tactics"><summary>Táticas salvas · {tactics.length}/4</summary><MissionTactics heroName={hero.name} tactics={tactics} saveTactic={saveTactic} applyTactic={applyTactic} deleteTactic={deleteTactic} updateTactic={updateTactic}/></details>
  <div className="build-tabs">{categories.map(t=><button type="button" aria-pressed={tab===t} className={tab===t?'active':''} key={t} onClick={()=>selectTab(t)}>{t} <small>{plannedByCategory[t].length}</small></button>)}</div>
  {tab!=='Fusões'&&<PoolFilters value={filters} onChange={setFilters} facets={tab==='Itens'?{school:['Taijutsu','Ninjutsu','Genjutsu'],element:ITEMS.map(itemElement),attribute:ITEMS.map(itemAttribute)}:tab==='Habilidades'?{school:techniques.map(t=>t.school),element:techniques.map(t=>t.element),shape:techniques.map(t=>t.shape)}:{}}/>}
  {tab==='Itens'&&<RarityFilter selected={rarities} onChange={setRarities} counts={rarityCounts(itemsBeforeRarity)}/>}
  {tab==='Fusões'
   ? <section className="build-fusion">
     <h3>⚗ Fusões de Técnicas · {hero.name}</h3>
     <p className="home-copy">Planeje os pares que você quer fundir ou combinar — na run, a fusão é executada na Oficina dos Sapos Sábios (1 uso por zona). Técnicas de preparação (setup) não entram na fusão. Até 4 pares por shinobi, salvos na conta.</p>
     <div className="build-fusion-form">
      <select value={fusionA} onChange={e=>setFusionA(e.target.value)} aria-label="Primeira técnica da fusão"><option value="">Primeira técnica…</option>{fusionOptions.map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select>
      <span aria-hidden="true">⚗</span>
      <select value={fusionB} onChange={e=>setFusionB(e.target.value)} aria-label="Segunda técnica da fusão"><option value="">Segunda técnica…</option>{fusionOptions.map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select>
      <button type="button" disabled={!fusionA||!fusionB||fusionA===fusionB||fusionPlan.length>=4} onClick={()=>{addFusionPair(fusionA,fusionB);setFusionA('');setFusionB('');}}>Adicionar par ({fusionPlan.length}/4)</button>
     </div>
     {bothSelected&&<div className="fusion-preview"><b>Prévia do par:</b><p><span>✦ Fundir (Épico):</span> {fusePreview?`${fusePreview.name} · ${fusePreview.element} + ${fusePreview.secondaryElement??'—'} · ${fusePreview.shape} · recarga ${fusePreview.cooldown.toLocaleString('pt-BR')} s`:'par inválido'}</p><p><span>⛓ Combinar (Raro):</span> {combinePreview?`${combinePreview.name} · ${combinePreview.shape} · recarga ${combinePreview.cooldown.toLocaleString('pt-BR')} s`:'par inválido'}</p><small>Na run: Fundir = técnica nova no nível 1, ×2 de dano sobre a média e afixos somados. Combinar = as duas atacam juntas no mesmo espaço, cada uma ×1,5 de dano.</small></div>}
     <div className="fusion-pairs">{fusionPlan.map((p,i)=><div className="fusion-pair" key={p[0]+'·'+p[1]+'·'+i}><b className="planner-fusion-icons"><SkillIcon heroId={hero.id} name={p[0]}/>{p[0]} <span aria-hidden="true">+</span> <SkillIcon heroId={hero.id} name={p[1]}/>{p[1]}</b><button type="button" aria-label={`Remover o par ${p[0]} e ${p[1]}`} onClick={()=>removeFusionPair(i)}>✕</button></div>)}{!fusionPlan.length&&<small>Nenhum par planejado ainda — na run, as técnicas de um par aparecem com ⚗ no pool.</small>}</div>
    </section>
   : <>
    <p className="home-copy">Planejar destaca a oferta. A estrela marca uma técnica para o Treinamento com Jiraiya (+15% de dano). {tab==='Habilidades'?'“Deixar em casa” remove a técnica do sorteio.':tab==='Pílulas'?'Pílulas continuam disponíveis no level-up.':'Itens marcados ficam no plano da Bolsa Ninja.'} A run começa com uma técnica; os outros espaços são preenchidos pelas suas escolhas.</p>
    <div className="build-view-filters"><button aria-pressed={view==='all'} onClick={()=>setView('all')}>Todos</button><button aria-pressed={view==='planned'} onClick={()=>setView('planned')}>Planejado para Missão</button>{tab==='Habilidades'&&<><button aria-pressed={view==='archived'} onClick={()=>setView('archived')}>Deixar em casa</button><small>{trained.length}/{trainingSlots} treinadas · {archivedSkills.length}/{archiveLimit} bloqueadas</small></>}</div>
    <div className="build-workspace">
     <div className="build-tech-list">
      {tab==='Habilidades'?<table className="build-table">
       <colgroup><col/><col className="col-desc"/><col className="col-state"/><col className="col-actions"/></colgroup>
       <thead><tr><th scope="col">Opção</th><th scope="col">Origem / efeito</th><th scope="col">Raridade · estado</th><th scope="col" className="th-actions">Ações</th></tr></thead>
       <tbody>
        {visible.map(e=><tr className={`pool-card ${e.archived?'archived':''} ${planned.includes(e.name)?'planned':''}`} key={e.id}>
         <td><button type="button" className="build-entry" aria-pressed={focused?.id===e.id} onClick={()=>setSelected(e.id)}>{e.icon}<span><b>{e.name}</b></span></button></td>
         <td><div className="build-cell-desc"><span>{e.description}</span></div></td>
         <td><div className="build-cell-state"><span>{e.rarity}</span><small className={!e.unlocked?'state-off':e.archived?'state-warn':'state-on'}>{estado(e)}</small></div></td>
         <td>{entryActions(e)}</td>
        </tr>)}
       </tbody>
      </table>:<div className="planner-card-grid">
        {visible.map(e=><article key={e.id} className={['planner-option',planned.includes(e.name)?'planned':'',tab==='Itens'?'rarity-'+e.rarity.toLowerCase():''].join(' ')}>
          <button type="button" className="build-entry" aria-pressed={focused?.id===e.id} onClick={()=>setSelected(e.id)}>
            {e.icon}<span><b>{e.name}</b><small>{tab==='Itens'?e.rarity:estado(e)}</small></span>
          </button>
          <p><BuffText text={e.description}/></p>
          {entryActions(e)}
        </article>)}
      </div>}
     </div>
     <aside className="build-detail">{focused?<>{focused.icon}<h2>{focused.name}</h2><p><BuffText text={focused.description}/></p>{tab==='Pílulas'&&<PillStatPreview title="No Nv. 1 do shinobi, com 1 nível da pílula" lines={pillStatPreview(focused.name,base,hero.id,1)}/>}{preview&&<><dl className="technique-base-data"><div><dt>Status da técnica</dt><dd>{preview.status?preview.status+' · '+Math.round(preview.statusChance*100)+'%':preview.burn?'Queimadura · 100% ao acertar':'Sem status próprio'}</dd></div><div><dt>Chance crítica inicial</dt><dd>{preview.setup?'—':Math.round(base.crit*100)+'%'}</dd></div><div><dt>Dano crítico inicial</dt><dd>{preview.setup?'—':Math.round(base.critDamage*100)+'%'}</dd></div><div><dt>Recarga base</dt><dd>{preview.cooldown.toLocaleString('pt-BR')} s</dd></div></dl><TechniquePreview technique={preview} heroId={hero.id}/><small>Prévia em alvos de treino · sem bônus da missão.</small></>}{planned.includes(focused.name)&&!focused.archived&&<b>★ Planejado para Missão</b>}{inFusion(focused.name)&&<b className="fusion-badge">⚗ Participa de uma fusão planejada</b>}</>:<p>Nenhuma opção com estes filtros.</p>}</aside>
    </div>
   </>}
 </div>;
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
