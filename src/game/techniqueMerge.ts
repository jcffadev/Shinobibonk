import type { Technique } from './heroes';

export type TechniqueMerge = { kind:'fuse'|'combine'; names:[string,string] };

export function mergedTechnique(plan:TechniqueMerge, pool:readonly Technique[]):Technique|undefined {
  const [a,b]=plan.names.map(name=>pool.find(t=>t.name===name));
  if(!a||!b||a===b||a.setup||b.setup)return;
  const fused=plan.kind==='fuse';
  return {
    ...a,
    name:fused?'Fusão · '+a.name+' / '+b.name:a.name+' + '+b.name,
    secondaryElement:b.element===a.element?undefined:b.element,
    shape:fused?'Área':a.shape,
    unlockLevel:1,
    power:fused?(a.power+b.power):1.5,
    range:Math.max(a.range,b.range),
    cooldown:Math.max(a.cooldown,b.cooldown),
    status:a.status??b.status,
    statusChance:a.status?a.statusChance:b.statusChance,
    secondaryStatus:a.status&&b.status!==a.status?b.status:undefined,
    secondaryStatusChance:b.statusChance,
    burn:a.burn||b.burn,
  };
}
