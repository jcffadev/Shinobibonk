import { BuffText } from './BuffText';
import { useState, type ReactNode } from 'react';
import { ITEMS, type Item } from '../game/catalog';
import { matchesSearch } from './PoolFilters';
import { ItemIcon } from './RunSheet';
import { PASSIVES } from '../game/preparation';
import { PRESET_SLOTS, type BagPresets } from '../game/missionBag';

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
  const [tab,setTab]=useState<Tab>('Todos'),[search,setSearch]=useState(''),[presetsOpen,setPresetsOpen]=useState(false);
  const isUnlocked=(i:Item)=>i.rarity==='Comum'||unlocked.includes(i.id);
  const stateOf=(i:Item):Tab=>!isUnlocked(i)?'Bloqueado':home.includes(i.id)?'Em casa':'No pool';
  const counts:Record<Tab,number>={Todos:ITEMS.length,Bloqueado:0,'No pool':0,'Em casa':0};for(const i of ITEMS)counts[stateOf(i)]++;
  const full=home.length>=capacity;
  const list=ITEMS.filter(i=>(tab==='Todos'||stateOf(i)===tab)&&matchesSearch(i.name+' '+i.description,search));
  const setSlot=(index:number,value:BagPresets['slots'][number])=>onPresets({...presets,slots:presets.slots.map((s,i)=>i===index?value:s),active:value===null&&presets.active===index?null:presets.active});
  const duplicate=(index:number)=>{const free=presets.slots.findIndex(s=>!s);const src=presets.slots[index];if(free<0||!src)return;onPresets({...presets,slots:presets.slots.map((s,i)=>i===free?{name:(src.name+' (cópia)').slice(0,24),items:[...src.items]}:s)});};
  const used=presets.slots.filter(Boolean).length;
  return <div className="mission-bag">
    <div className="bag-toolbar">
      <div className="bag-tabs" role="tablist">{(['Todos','Bloqueado','No pool','Em casa'] as Tab[]).map(t=><button role="tab" aria-selected={tab===t} className={tab===t?'active':''} key={t} onClick={()=>setTab(t)}>{t} <b>{counts[t]}</b></button>)}</div>
      <input className="bag-search" type="search" placeholder="Buscar por nome ou efeito…" aria-label="Buscar itens da bolsa" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className={`bag-capacity ${full?'full':''}`} title="Vagas do Baú do Clã (Passivas Shinobi) + 1 a cada 2 itens desbloqueados"><b>Em casa {home.length}/{capacity}</b><small>+{fromUnlocks} por itens desbloqueados</small></div>
    </div>
    <section className={`bag-presets ${presetsOpen?'open':''}`}>
      <button className="bag-presets-head" aria-expanded={presetsOpen} onClick={()=>setPresetsOpen(v=>!v)}><b>Predefinições da Bolsa</b><small>{presetsOpen?'O que você deixar em casa ou levar fica salvo no modelo em uso':'Toque para abrir'} · {used} de {PRESET_SLOTS}</small><i>{presetsOpen?'▾':'›'}</i></button>
      {presetsOpen&&<div className="bag-preset-rows">{presets.slots.map((slot,index)=><div className={`bag-preset ${presets.active===index?'in-use':''}`} key={index}>
        <span className="preset-number">{index+1}</span>
        {slot?<>
          <input aria-label={`Nome do modelo ${index+1}`} value={slot.name} maxLength={24} onChange={e=>setSlot(index,{...slot,name:e.target.value})}/>
          <span className="preset-icons">{slot.items.slice(0,8).map(id=>{const it=ITEMS.find(i=>i.id===id);return it?<ItemIcon key={id} name={it.name}/>:null;})}{slot.items.length>8&&<small>+{slot.items.length-8}</small>}{!slot.items.length&&<small>Nada em casa</small>}</span>
          <button onClick={()=>setSlot(index,null)}>Apagar</button>
          <button disabled={presets.slots.every(Boolean)} onClick={()=>duplicate(index)}>Duplicar</button>
          {presets.active===index?<button className="preset-used" disabled>Em uso</button>:<button className="preset-apply" onClick={()=>onApply(index)}>Aplicar</button>}
        </>:<>
          <span className="preset-empty">Modelo vazio</span>
          <button className="preset-apply" onClick={()=>onPresets({...presets,slots:presets.slots.map((s,i)=>i===index?{name:`Modelo ${index+1}`,items:[...home]}:s),active:index})}>Salvar bolsa atual</button>
        </>}
      </div>)}</div>}
    </section>
    <p className="bag-note">Itens <b>em casa</b> não aparecem nas recompensas da run (kunai, shuriken, eventos). <b>★ Prioridade</b> ({priority.length}/{prioritySlots}): itens marcados aparecem com mais frequência nas recompensas, sem garantia.</p>
    <div className="compact-grid">{list.map(item=>{const state=stateOf(item),atHome=state==='Em casa',locked=state==='Bloqueado',prio=priority.includes(item.id);
      return <CompactItemCard key={item.id} item={item} status={state} className={`bag-card ${atHome?'at-home':''} ${locked?'locked':''}`} star={<button className={`prio-star ${prio?'on':''}`} title={prio?'Remover prioridade':'Marcar como prioridade'} aria-pressed={prio} disabled={locked||atHome||(!prio&&priority.length>=prioritySlots)} onClick={()=>onTogglePriority(item.id)}>{prio?'★':'☆'}</button>}>
        <button className="bag-action" disabled={locked||(!atHome&&full)} title={locked?'Desbloqueie no Arsenal para levar na missão':!atHome&&full?'Bolsa de casa cheia: compre níveis do Baú do Clã ou desbloqueie itens':undefined} onClick={()=>onToggleHome(item.id)}>{atHome?'Levar na missão':'Deixar em casa'}</button>
      </CompactItemCard>;})}
      {!list.length&&<p className="bag-empty">Nenhum item nesta aba.</p>}
    </div>
  </div>;
}
