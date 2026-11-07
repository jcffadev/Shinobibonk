/**
 * Bolsa da Missão (hub): itens "Em casa" (antigo "Arquivar") não entram no pool de recompensas da run.
 * A lista "em casa" continua salva em `sb_archived_items` (compatível com saves antigos).
 * Listas de itens em casa (antigas "Predefinições" 1–4): até PRESET_LIMIT listas com nome, descrição e itens;
 * a lista em uso acompanha as mudanças. Salvas em `sb_bag_presets_v1` (mesma chave e formato; listas vazias
 * antigas `null` são descartadas na leitura e o índice da lista em uso é remapeado).
 * Prioridade: itens marcados ganham peso extra no sorteio de recompensas (ver prioritySlots/PRIORITY_WEIGHT).
 */
export type BagPreset={name:string;items:string[];description?:string};
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
    if(!s||typeof s!=='object'||slots.length>=PRESET_LIMIT)return;
    const p=s as Partial<BagPreset>;
    if(source.active===i)active=slots.length;
    slots.push({name:typeof p.name==='string'&&p.name.trim()?p.name.slice(0,PRESET_NAME_MAX):`Lista ${slots.length+1}`,items:strings(p.items),description:typeof p.description==='string'?p.description.slice(0,PRESET_DESCRIPTION_MAX):''});
  });
  return {active,slots};
}
export function readPresets():BagPresets{
  try{return normalizePresets(JSON.parse(localStorage.getItem(PRESETS_KEY)||'null'));}catch{return EMPTY_PRESETS();}
}
export function savePresets(value:BagPresets){try{localStorage.setItem(PRESETS_KEY,JSON.stringify(value));}catch{/* armazenamento indisponível: segue só em memória */}}
export function saveList(key:string,value:string[]){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* idem */}}
/** Atualiza a lista em uso com a lista atual de itens em casa. */
export function syncActive(presets:BagPresets,home:string[]):BagPresets{
  if(presets.active===null||!presets.slots[presets.active])return presets;
  const slots=presets.slots.map((s,i)=>i===presets.active?{...s,items:[...home]}:s);
  return {...presets,slots};
}
/** Cria uma lista nova com os itens informados (por padrão, a bolsa atual) e a coloca em uso. */
export function addPreset(presets:BagPresets,items:string[],name?:string):BagPresets{
  if(presets.slots.length>=PRESET_LIMIT)return presets;
  const slot:BagPreset={name:(name??`Lista ${presets.slots.length+1}`).slice(0,PRESET_NAME_MAX),items:[...items],description:''};
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
