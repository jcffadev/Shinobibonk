import { useEffect, useMemo, useState } from 'react';
import { HEROES } from '../game/heroes';
import { eventDuelsDone, isHeroPlayable } from '../game/account';
import { frameLock } from '../game/events';
import { PROFILE_FRAMES, type ProfileFrame, type ProfilePortrait } from '../game/profilePortrait';
import { Portrait } from './League';
import { matchesSearch } from './PoolFilters';

export function ProfilePortraitPicker({ initial, onSave, onClose }: { initial: ProfilePortrait; onSave:(value:ProfilePortrait)=>Promise<void>; onClose:()=>void }) {
  const [avatar,setAvatar]=useState(initial.avatar);
  const [frame,setFrame]=useState<ProfileFrame>(initial.frame??'default');
  const [search,setSearch]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const heroes=useMemo(()=>HEROES.filter(hero=>isHeroPlayable(hero.id)),[]);
  useEffect(()=>{
    const cancel=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!busy){event.stopImmediatePropagation();onClose();}};
    window.addEventListener('keydown',cancel,true);
    return ()=>window.removeEventListener('keydown',cancel,true);
  },[onClose,busy]);
  async function save(){
    setBusy(true);setError('');
    try{await onSave({avatar,frame});onClose();}catch{setError('Falha ao salvar o avatar. Tente novamente.');setBusy(false);}
  }
  return <div className="modal-backdrop"><section className="account-modal profile-picker" role="dialog" aria-modal="true" aria-labelledby="profile-picker-title">
    <header className="profile-picker-header"><Portrait id={avatar} frame={frame}/><h2 id="profile-picker-title">Avatar e moldura</h2></header>
    <label className="profile-picker-search"><span>Buscar shinobi</span><input autoFocus type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <div className="profile-avatar-grid" aria-label="Avatares">
      <button type="button" aria-pressed={!avatar||avatar==='default'} onClick={()=>setAvatar('default')}><Portrait/><span>Padrão</span></button>
      {heroes.filter(hero=>matchesSearch(hero.name,search)).map(hero=><button type="button" key={hero.id} aria-pressed={avatar===hero.id} onClick={()=>setAvatar(hero.id)}><Portrait id={hero.id}/><span>{hero.name}</span></button>)}
    </div>
    <div className="profile-frame-choices" aria-label="Molduras">{Object.entries(PROFILE_FRAMES).map(([id,name])=>{const lock=id!==initial.frame?frameLock(id,eventDuelsDone()):undefined;return <button type="button" key={id} aria-pressed={frame===id} disabled={!!lock} title={lock} onClick={()=>setFrame(id as ProfileFrame)}><Portrait id={avatar} frame={id as ProfileFrame}/><span>{lock?'🔒 ':''}{name}</span>{lock&&<small>{lock}</small>}</button>;})}</div>
    {error&&<p role="alert">{error}</p>}
    <div className="reward-actions"><button type="button" onClick={onClose} disabled={busy}>Cancelar</button><button type="button" onClick={()=>void save()} disabled={busy}>{busy?'Salvando…':'Salvar avatar'}</button></div>
  </section></div>;
}
