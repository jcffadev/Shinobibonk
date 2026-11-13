/**
 * Bolsa da Missão (hub): itens "Em casa" (antigo "Arquivar") não entram no pool de recompensas da run.
 * A lista "em casa" continua salva em `sb_archived_items` (compatível com saves antigos).
 * Listas de itens em casa (antigas "Predefinições" 1–4): até PRESET_LIMIT listas com nome, descrição e itens;
 * a lista em uso acompanha as mudanças. Salvas em `sb_bag_presets_v1` (mesma chave e formato; listas vazias
 * antigas `null` são descartadas na leitura e o índice da lista em uso é remapeado).
 * Prioridade: itens marcados ganham peso extra no sorteio de recompensas (ver prioritySlots/PRIORITY_WEIGHT).
 */
export type BagPreset={name:string;items:string[];description?:string;plannedItems?:string[];originHeroId?:string};
export type BagPresets={active:number|null;slots:BagPreset[]};
/** Máximo de listas salvas. */
export const PRESET_LIMIT=12;
/** Mantido por compatibilidade: eram 4 vagas fixas. */
export const PRESET_SLOTS=4;
export const PRESET_NAME_MAX=32,PRESET_DESCRIPTION_MAX=160;
export const PRESETS_KEY='sb_bag_presets_v1',PRIORITY_KEY='sb_priority_items',HOME_KEY='sb_archived_items';
export const EMPTY_PRESETS=():BagPresets=>({active:null,slots:[]});
const strings=(value:unknown)=>Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'):[];
/** Normaliza o que veio do armazenamento (formato antigo com `null` nas vagas ou o novo, só com listas). */
export function normalizePresets(raw:unknown):BagPresets{
  if(!raw||typeof raw!=='object'||!Array.isArray((raw as {slots?:unknown}).slots))return EMPTY_PRESETS();
  const source=raw as {active?:unknown;slots:unknown[]};
  const slots:BagPreset[]=[];let active:number|null=null;
  source.slots.forEach((s,i)=>{
    if(!s||typeof s!=='object')return;
    const p=s as Partial<BagPreset>;
    if(source.active===i)active=slots.length;
    slots.push({name:typeof p.name==='string'&&p.name.trim()?p.name.slice(0,PRESET_NAME_MAX):`Lista ${slots.length+1}`,items:strings(p.items),description:typeof p.description==='string'?p.description.slice(0,PRESET_DESCRIPTION_MAX):'',...(Array.isArray(p.plannedItems)?{plannedItems:strings(p.plannedItems)}:{}),...(typeof p.originHeroId==='string'?{originHeroId:p.originHeroId}:{})});
  });
  return {active,slots};
}
/** Listas independentes por versão de shinobi. A migração das chaves globais ocorre ao abrir o perfil. */
export const PRESETS_BY_HERO_KEY='sb_bag_presets_by_hero_v1';
const ACTIVE_PRESET_KEY='sb_active_bag_preset_by_hero_v1';
export function readPresets(heroId:string):BagPresets{
  try {
    const base=normalizePresets(JSON.parse(localStorage.getItem(PRESETS_KEY)||'null'));
    const active=JSON.parse(localStorage.getItem(ACTIVE_PRESET_KEY)||'{}')?.[heroId];
    return {...base,active:Number.isInteger(active)&&base.slots[active]?active:null};
  } catch { return EMPTY_PRESETS(); }
}
export function savePresets(heroId:string,value:BagPresets,previous?:BagPresets){
  try {
    const actives=JSON.parse(localStorage.getItem(ACTIVE_PRESET_KEY)||'{}') as Record<string,number|null>;
    for(const [id,index] of Object.entries(actives)){
      if(id===heroId||index===null||!previous)continue;
      const slot=previous.slots[index];
      const next=value.slots.indexOf(slot);
      actives[id]=next>=0?next:value.slots.length===previous.slots.length&&value.slots[index]?index:null;
    }
    actives[heroId]=value.active;
    localStorage.setItem(PRESETS_KEY,JSON.stringify({active:null,slots:value.slots}));
    localStorage.setItem(ACTIVE_PRESET_KEY,JSON.stringify(actives));
  } catch { /* armazenamento indisponível */ }
}
export function migrateBagPresets(heroId:string){
  const marker='sb_shared_bag_imported_v2';
  try {
    if(localStorage.getItem(marker))return;
    const legacy=normalizePresets(JSON.parse(localStorage.getItem(PRESETS_KEY)||'null'));
    const byHero=JSON.parse(localStorage.getItem(PRESETS_BY_HERO_KEY)||'{}') as Record<string,unknown>;
    const slots=[...legacy.slots];
    const active=JSON.parse(localStorage.getItem(ACTIVE_PRESET_KEY)||'{}') as Record<string,number|null>;
    if(legacy.active!==null&&active[heroId]===undefined)active[heroId]=legacy.active;
    for(const [id,raw] of Object.entries(byHero)){
      const local=normalizePresets(raw);
      local.slots.forEach((slot,index)=>{
        let found=slots.findIndex(item=>(!item.originHeroId||item.originHeroId===id)&&item.name===slot.name&&item.description===slot.description&&item.items.join('|')===slot.items.join('|')&&(item.plannedItems??[]).join('|')===(slot.plannedItems??[]).join('|'));
        if(found<0){found=slots.length;slots.push({...slot,originHeroId:id});}
        else if(!slots[found].originHeroId)slots[found]={...slots[found],originHeroId:id};
        if(local.active===index&&active[id]===undefined)active[id]=found;
      });
    }
    if(slots.length)localStorage.setItem(PRESETS_KEY,JSON.stringify({active:null,slots}));
    localStorage.setItem(ACTIVE_PRESET_KEY,JSON.stringify(active));
    localStorage.setItem(marker,'1');
  } catch { /* mantém as listas legadas */ }
}
/** Cria uma lista com a configuração de itens e registra o shinobi de origem. */
export function addPreset(presets:BagPresets,items:string[],name?:string,plannedItems:string[]=[],originHeroId?:string):BagPresets{
  if(presets.slots.length>=PRESET_LIMIT)return presets;
  const slot:BagPreset={name:(name??'Arsenal '+(presets.slots.length+1)).slice(0,PRESET_NAME_MAX),items:[...items],description:'',plannedItems:[...plannedItems],originHeroId};
  return {active:presets.slots.length,slots:[...presets.slots,slot]};
}
export function duplicatePreset(presets:BagPresets,index:number):BagPresets{
  const src=presets.slots[index];
  if(!src||presets.slots.length>=PRESET_LIMIT)return presets;
  const copy:BagPreset={...src,name:(src.name+' (cópia)').slice(0,PRESET_NAME_MAX),items:[...src.items]};
  return {...presets,slots:[...presets.slots.slice(0,index+1),copy,...presets.slots.slice(index+1)],active:presets.active!==null&&presets.active>index?presets.active+1:presets.active};
}
export function removePreset(presets:BagPresets,index:number):BagPresets{
  if(!presets.slots[index])return presets;
  const active=presets.active===index?null:presets.active!==null&&presets.active>index?presets.active-1:presets.active;
  return {active,slots:presets.slots.filter((_,i)=>i!==index)};
}
/** Move a lista `from` para a posição `to` (subir/descer ou arrastar); a lista em uso continua em uso no novo índice. */
export function movePreset(presets:BagPresets,from:number,to:number):BagPresets{
  const n=presets.slots.length;
  if(!presets.slots[from]||!Number.isInteger(to)||to<0||to>=n||to===from)return presets;
  const slots=[...presets.slots];const [moved]=slots.splice(from,1);slots.splice(to,0,moved);
  let active=presets.active;
  if(active!==null){if(active===from)active=to;else if(from<active&&to>=active)active--;else if(from>active&&to<=active)active++;}
  return {active,slots};
}
export function editPreset(presets:BagPresets,index:number,patch:Partial<Pick<BagPreset,'name'|'description'>>):BagPresets{
  return {...presets,slots:presets.slots.map((s,i)=>i===index?{...s,...(patch.name!==undefined?{name:patch.name.slice(0,PRESET_NAME_MAX)}:{}),...(patch.description!==undefined?{description:patch.description.slice(0,PRESET_DESCRIPTION_MAX)}:{})}:s)};
}
