/**
 * Bolsa da Missão (hub): itens "Em casa" (antigo "Arquivar") não entram no pool de recompensas da run.
 * A lista "em casa" continua salva em `sb_archived_items` (compatível com saves antigos).
 * Predefinições: 4 modelos com nome + lista de itens em casa; o modelo em uso acompanha as mudanças.
 * Prioridade: itens marcados ganham peso extra no sorteio de recompensas (ver prioritySlots/PRIORITY_WEIGHT).
 */
export type BagPreset={name:string;items:string[]};
export type BagPresets={active:number|null;slots:(BagPreset|null)[]};
export const PRESET_SLOTS=4;
export const PRESETS_KEY='sb_bag_presets_v1',PRIORITY_KEY='sb_priority_items',HOME_KEY='sb_archived_items';
export const EMPTY_PRESETS=():BagPresets=>({active:null,slots:Array.from({length:PRESET_SLOTS},()=>null)});
const strings=(value:unknown)=>Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'):[];
export function readPresets():BagPresets{
  try{
    const raw=JSON.parse(localStorage.getItem(PRESETS_KEY)||'null') as Partial<BagPresets>|null;
    if(!raw||!Array.isArray(raw.slots))return EMPTY_PRESETS();
    const slots=Array.from({length:PRESET_SLOTS},(_,i)=>{const s=raw.slots![i] as BagPreset|null|undefined;return s&&typeof s==='object'?{name:typeof s.name==='string'?s.name.slice(0,24):`Modelo ${i+1}`,items:strings(s.items)}:null;});
    const active=typeof raw.active==='number'&&slots[raw.active]?raw.active:null;
    return {active,slots};
  }catch{return EMPTY_PRESETS();}
}
export function savePresets(value:BagPresets){try{localStorage.setItem(PRESETS_KEY,JSON.stringify(value));}catch{/* armazenamento indisponível: segue só em memória */}}
export function saveList(key:string,value:string[]){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* idem */}}
/** Atualiza o modelo em uso com a lista atual de itens em casa. */
export function syncActive(presets:BagPresets,home:string[]):BagPresets{
  if(presets.active===null||!presets.slots[presets.active])return presets;
  const slots=presets.slots.map((s,i)=>i===presets.active&&s?{...s,items:[...home]}:s);
  return {...presets,slots};
}
