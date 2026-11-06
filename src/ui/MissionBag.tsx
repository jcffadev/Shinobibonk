import { BuffText } from './BuffText';
import { useState, type ReactNode } from 'react';
import { ITEMS, type Item, type Rarity } from '../game/catalog';
import { RARITY_ORDER } from '../game/combat';
import { matchesSearch } from './PoolFilters';
import { ItemIcon } from './RunSheet';
import { PASSIVES } from '../game/preparation';
import { PRESET_LIMIT, PRESET_NAME_MAX, PRESET_DESCRIPTION_MAX, addPreset, duplicatePreset, editPreset, removePreset, type BagPresets } from '../game/missionBag';

/** Hudzinho do hub: Lamens, níveis das Passivas Shinobi, itens no pool e vagas em casa. */
export function HubHud({lamens,levels,poolCount,home,capacity}:{lamens:number;levels:Record<string,number>;poolCount:number;home:number;capacity:number}){
  const total=PASSIVES.reduce((s,p)=>s+p.max,0),bought=PASSIVES.reduce((s,p)=>s+Math.min(p.max,levels[p.name]||0),0);
  return <div className="hub-hud" aria-label="Resumo da preparação">
    <span className="hud-chip lamen">🍜 <b>{lamens.toLocaleString('pt-BR')}</b><small>Lamens</small></span>
    <span className="hud-chip">⛩ <b>{bought}/{total}</b><small>níveis de passivas</small></span>
    <span className="hud-chip">🎒 <b>{poolCount}/{ITEMS.length}</b><small>itens no pool</small></span>
    <span className="hud-chip">🏠 <b>{home}/{capacity}</b><small>em casa</small></span>
  </div>;
}

/** Card compacto de item (Bolsa da Missão e Arsenal): ícone, nome, raridade, efeito e ações no rodapé. */
export function CompactItemCard({item,status,className='',children,star}:{item:Item;status:string;className?:string;children?:ReactNode;star?:ReactNode}){
  return <article className={`compact-item rarity-${item.rarity.toLowerCase()} ${className}`}>
    <header><ItemIcon name={item.name}/><div><b>{item.name}</b><small className="compact-rarity"><i/>{item.rarity} · máx. {item.max}</small></div>{star}</header>
    <p><BuffText text={item.description}/></p>
    <footer><span>{status}</span>{children}</footer>
  </article>;
}

type Tab='Todos'|'Bloqueado'|'No pool'|'Em casa';
export function MissionBag({unlocked,home,capacity,fromUnlocks,priority,prioritySlots,presets,onToggleHome,onTogglePriority,onPresets,onApply}:{
  unlocked:string[];home:string[];capacity:number;fromUnlocks:number;priority:string[];prioritySlots:number;presets:BagPresets;
  onToggleHome:(id:string)=>void;onTogglePriority:(id:string)=>void;onPresets:(next:BagPresets)=>void;onApply:(index:number)=>void;
}){
  const [tab,setTab]=useState<Tab>('Todos'),[search,setSearch]=useState(''),[view,setView]=useState<'catalogo'|'listas'>('catalogo');
  const [rarity,setRarity]=useState<Rarity|null>(null);
  const isUnlocked=(i:Item)=>i.rarity==='Comum'||unlocked.includes(i.id);
  const stateOf=(i:Item):Tab=>!isUnlocked(i)?'Bloqueado':home.includes(i.id)?'Em casa':'No pool';
  const counts:Record<Tab,number>={Todos:ITEMS.length,Bloqueado:0,'No pool':0,'Em casa':0};for(const i of ITEMS)counts[stateOf(i)]++;
  const full=home.length>=capacity;
  const list=ITEMS.filter(i=>(tab==='Todos'||stateOf(i)===tab)&&(!rarity||i.rarity===rarity)&&matchesSearch(i.name+' '+i.description,search));
  const switcher=<div className="bag-views" role="tablist" aria-label="Seções da Bolsa da Missão">
    <button role="tab" aria-selected={view==='catalogo'} className={view==='catalogo'?'active':''} onClick={()=>setView('catalogo')}>Itens da bolsa</button>
    <button role="tab" aria-selected={view==='listas'} className={view==='listas'?'active':''} onClick={()=>setView('listas')}>Itens em casa <b>{presets.slots.length}/{PRESET_LIMIT} listas</b></button>
  </div>;
  if(view==='listas')return <div className="mission-bag">{switcher}<HomeLists home={home} capacity={capacity} presets={presets} onPresets={onPresets} onApply={onApply}/></div>;
  return <div className="mission-bag">
    {switcher}
    <div className="bag-toolbar">
      <div className="bag-tabs" role="tablist">{(['Todos','Bloqueado','No pool','Em casa'] as Tab[]).map(t=><button role="tab" aria-selected={tab===t} className={tab===t?'active':''} key={t} onClick={()=>setTab(t)}>{t} <b>{counts[t]}</b></button>)}</div>
      <input className="bag-search" type="search" placeholder="Buscar por nome ou efeito…" aria-label="Buscar itens da bolsa" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className={`bag-capacity ${full?'full':''}`} title="Vagas do Baú do Clã (Passivas Shinobi) + 1 a cada 2 itens desbloqueados"><b>Em casa {home.length}/{capacity}</b><small>+{fromUnlocks} por itens desbloqueados</small></div>
    </div>
    <div className="bag-rarities" role="group" aria-label="Filtrar itens por raridade">
      <button aria-pressed={rarity===null} onClick={()=>setRarity(null)}>Todas as raridades</button>
      {RARITY_ORDER.map(r=><button className={`rarity-${r.toLowerCase()}`} aria-pressed={rarity===r} key={r} onClick={()=>setRarity(r)}><span className="compact-rarity"><i/></span>{r}</button>)}
    </div>
    <p className="bag-note">Itens <b>em casa</b> não aparecem nas recompensas da run (kunai, shuriken, eventos). <b>★ Prioridade</b> ({priority.length}/{prioritySlots}): itens marcados aparecem com mais frequência nas recompensas, sem garantia.</p>
    <div className="compact-grid">{list.map(item=>{const state=stateOf(item),atHome=state==='Em casa',locked=state==='Bloqueado',prio=priority.includes(item.id);
      return <CompactItemCard key={item.id} item={item} status={state} className={`bag-card ${atHome?'at-home':''} ${locked?'locked':''}`} star={<button className={`prio-star ${prio?'on':''}`} title={prio?'Remover prioridade':'Marcar como prioridade'} aria-pressed={prio} disabled={locked||atHome||(!prio&&priority.length>=prioritySlots)} onClick={()=>onTogglePriority(item.id)}>{prio?'★':'☆'}</button>}>
        <button className="bag-action" disabled={locked||(!atHome&&full)} title={locked?'Desbloqueie no Arsenal para levar na missão':!atHome&&full?'Bolsa de casa cheia: compre níveis do Baú do Clã ou desbloqueie itens':undefined} onClick={()=>onToggleHome(item.id)}>{atHome?'Levar na missão':'Deixar em casa'}</button>
      </CompactItemCard>;})}
      {!list.length&&<p className="bag-empty">Nenhum item combina com os filtros.</p>}
    </div>
  </div>;
}

/**
 * Sub-aba "Itens em casa": listas salvas de itens que ficam fora do pool da run (estilo "Predefinições do Arquivo").
 * Criar (a partir da bolsa atual ou vazia), nomear, descrever, aplicar, duplicar e apagar. A lista em uso acompanha
 * as mudanças feitas na aba de itens. Formato salvo em sb_bag_presets_v1 (src/game/missionBag.ts).
 */
function HomeLists({home,capacity,presets,onPresets,onApply}:{home:string[];capacity:number;presets:BagPresets;onPresets:(next:BagPresets)=>void;onApply:(index:number)=>void}){
  const [confirm,setConfirm]=useState<number|null>(null);
  const full=presets.slots.length>=PRESET_LIMIT;
  const icons=(ids:string[],max=10)=><span className="preset-icons">{ids.slice(0,max).map(id=>{const it=ITEMS.find(i=>i.id===id);return it?<ItemIcon key={id} name={it.name}/>:null;})}{ids.length>max&&<small>+{ids.length-max}</small>}{!ids.length&&<small>Nada em casa</small>}</span>;
  return <section className="home-lists" aria-label="Listas de itens em casa">
    <header className="home-lists-head">
      <div><b>Itens em casa agora · {home.length}/{capacity}</b><small>{presets.active!==null&&presets.slots[presets.active]?`Em uso: ${presets.slots[presets.active].name||'Sem nome'} · as mudanças na bolsa ficam salvas nela`:'Nenhuma lista em uso · as mudanças na bolsa não são salvas em lista'}</small></div>
      {icons(home,14)}
      <div className="home-lists-actions">
        <button className="preset-apply" disabled={full} onClick={()=>onPresets(addPreset(presets,home))} title={full?`Limite de ${PRESET_LIMIT} listas`:'Cria uma lista com os itens em casa agora e a coloca em uso'}>+ Nova lista com a bolsa atual</button>
        <button disabled={full} onClick={()=>onPresets(addPreset(presets,[]))}>+ Lista vazia</button>
      </div>
    </header>
    {!presets.slots.length&&<p className="bag-empty">Nenhuma lista salva. Crie uma para alternar rapidamente entre conjuntos de itens deixados em casa.</p>}
    <div className="bag-preset-rows">{presets.slots.map((slot,index)=><div className={`bag-preset home-list ${presets.active===index?'in-use':''}`} key={index}>
      <span className="preset-number">{index+1}</span>
      <div className="home-list-text">
        <input aria-label={`Nome da lista ${index+1}`} placeholder="Nome da lista" value={slot.name} maxLength={PRESET_NAME_MAX} onChange={e=>onPresets(editPreset(presets,index,{name:e.target.value}))}/>
        <textarea aria-label={`Descrição da lista ${index+1}`} placeholder="Descrição (ex.: build de Ninjutsu de Fogo, sem itens de Taijutsu)" rows={2} value={slot.description??''} maxLength={PRESET_DESCRIPTION_MAX} onChange={e=>onPresets(editPreset(presets,index,{description:e.target.value}))}/>
      </div>
      {icons(slot.items)}
      <small className="home-list-count">{slot.items.length} {slot.items.length===1?'item':'itens'}</small>
      {confirm===index?<button className="preset-danger" onClick={()=>{setConfirm(null);onPresets(removePreset(presets,index));}}>Confirmar</button>:<button onClick={()=>setConfirm(index)}>Apagar</button>}
      <button disabled={full} onClick={()=>onPresets(duplicatePreset(presets,index))}>Duplicar</button>
      {presets.active===index?<button className="preset-used" disabled>Em uso</button>:<button className="preset-apply" onClick={()=>onApply(index)}>Aplicar</button>}
    </div>)}</div>
    <p className="bag-note">Aplicar troca os itens em casa pelos da lista (até {capacity} vagas). Itens bloqueados ou retirados do jogo são ignorados ao aplicar.</p>
  </section>;
}
