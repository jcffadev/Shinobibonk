import { useState } from 'react';
import type { WorldSnapshot } from '../scene/GameCanvas';
import { HeroPortrait, RunSheetButton } from './RunSheet';
import { SkillIcon } from './SkillIcon';
import './sages-workshop.css';

export function SagesWorkshop({world,heroId,onSheet}:{world:WorldSnapshot;heroId:string;onSheet:()=>void}) {
 const [kind,setKind]=useState<'fuse'|'combine'>(world.choice?.cards[0]?.merge?.kind??'fuse');
 const cards=(world.choice?.cards??[]).filter(card=>card.merge?.kind===kind);
 const change=(next:'fuse'|'combine')=>{
  setKind(next);window.dispatchEvent(new CustomEvent('shinobi-sages-tab',{detail:next}));
 };
 return <div className="sages-backdrop"><section className="sages-workshop" role="dialog" aria-modal="true" aria-labelledby="sages-title">
  <header><div><small>MONTE MYŌBOKU · FUKASAKU E SHIMA</small><h1 id="sages-title">Oficina dos Sapos Sábios</h1><p>Uma fusão ou combinação por zona · {world.sagesUsed?'usada nesta zona':'disponível nesta zona'}</p></div><HeroPortrait id="sapos-sabios"/></header>
  <div className="sages-tabs" role="tablist" aria-label="Tipo de união">
   <button role="tab" aria-selected={kind==='fuse'} onClick={()=>change('fuse')}>Fundir<small>Uma nova técnica, nível 1</small></button>
   <button role="tab" aria-selected={kind==='combine'} onClick={()=>change('combine')}>Combinar<small>Duas técnicas no mesmo espaço</small></button>
  </div>
  <p className="sages-help">{kind==='fuse'?'Soma os afixos e elementos. O dano inicial é duas vezes a média das técnicas.':'Mantém os dois ataques. Cada técnica causa ×1,5 de dano e ocupa o mesmo espaço.'}</p>
  <div className="sages-pairs" role="tabpanel">
   {world.sagesUsed?<p className="sages-empty">A oficina foi usada nesta zona. Outra união fica disponível na próxima zona.</p>:cards.length?cards.map((card,index)=>{
    const [a,b]=card.merge!.names;
    return <button key={card.id} className="sages-pair" aria-label={(kind==='fuse'?'Fundir ':'Combinar ')+a+' com '+b} onClick={()=>window.dispatchEvent(new CustomEvent('shinobi-choose',{detail:{index,id:card.id}}))}>
     <div className="sages-pair-art"><SkillIcon heroId={heroId} name={a}/><span>+</span><SkillIcon heroId={heroId} name={b}/></div>
     <div><h2>{a}</h2><h3>{b}</h3><p>{kind==='fuse'?'Nova técnica · afixos somados · nível 1':'Duas técnicas · um espaço · ×1,5 de dano'}</p></div><kbd>{index+1}</kbd>
    </button>;
   }):<p className="sages-empty">Aprenda duas técnicas de ataque para usar a oficina.</p>}
  </div>
  <footer><RunSheetButton onClick={onSheet}/><button className="button secondary-button" onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}))}>Voltar à missão <kbd>X</kbd></button></footer>
 </section></div>;
}
