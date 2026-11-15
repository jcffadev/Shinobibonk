import { useEffect, useState, type FormEvent } from 'react';
import { MAPS, MAP_BY_ID, type MapId } from '../game/maps';
import { HERO_BY_ID } from '../game/heroes';
import { DIFFICULTIES } from '../game/league';
import type { Difficulty } from '../game/progression';
import {
  changeOnlineClan, onlineBoard, onlineClans, onlineHeroPlaces, onlineProfile, rankAuth, registerRankName,
  type RankPlayer, type OnlineFilters, type OnlineBoard, type OnlineEntry, type OnlineClans, type RankMode,
} from '../game/onlineRanking';
import { HeroRankPicker, MemberProfile, Portrait, type LeagueStart } from './League';

const fmt = (value: number) => value.toLocaleString('pt-BR');
const DEFAULT: OnlineFilters = { mode: 'classic', size: 1 };
type Player = RankPlayer;

function OnlineAccount({ player }: { player?: Player }) {
  const [mode, setMode] = useState<'login'|'create'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    const alias = String(form.get('alias')).trim();
    setBusy(true);
    setMessage('');
    try {
      if (player) {
        await registerRankName(alias);
        await rankAuth('alias', {alias});
      } else if (mode === 'create') {
        const data = await rankAuth('signup', {email,password,alias});
        if (data.confirmEmail) setMessage('Confirme seu e-mail para acessar o ranking.');
      } else {
        await rankAuth('login', {email,password});
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao acessar a conta.'); }
    finally { setBusy(false); }
  }
  if (player?.alias) return <div className="league-online-account">
    <span>Conta do ranking · <b>{player.alias}</b></span>
    {message&&<span role="status">{message}</span>}
    <button type="button" onClick={() => void rankAuth('logout').catch(() => setMessage('Não foi possível sair.'))}>Sair</button>
  </div>;
  return <details className="league-card league-login" open={player ? true : undefined}><summary>{player ? 'Escolher nome no ranking' : 'Entrar na conta do ranking'}</summary>
    <form onSubmit={submit} className="league-online-form">
      {!player && <label>E-mail <input name="email" type="email" required autoComplete="email"/></label>}
      {!player && <label>Senha <input name="password" type="password" minLength={8} required autoComplete={mode==='create'?'new-password':'current-password'}/></label>}
      {(player || mode==='create')&&<label>Nome no ranking <input name="alias" minLength={3} maxLength={20} required autoComplete="nickname"/></label>}
      <button type="submit" disabled={busy}>{player?'Salvar nome':mode==='create'?'Criar conta':'Entrar'}</button>
      {!player && <><button type="button" onClick={() => setMode(mode==='login'?'create':'login')}>{mode==='login'?'Criar conta':'Voltar ao login'}</button></>}
    </form>
    {message && <p role="status">{message}</p>}
  </details>;
}

function OnlineRow({ entry, open }: { entry: OnlineEntry; open: () => void }) {
  return <button type="button" className={`league-row rank-${entry.place}`} onClick={open}>
    <span className="league-place">{fmt(entry.place)}</span><Portrait id={entry.member.avatar ?? entry.featured.heroId} frame={entry.member.frame}/>
    <span className="league-name"><b>{entry.member.name}{entry.member.clan && <small className="league-tag">{entry.member.clan}</small>}</b>
    <small>{HERO_BY_ID[entry.featured.heroId]?.name ?? entry.featured.heroId}</small></span>
    <strong className="league-score">{fmt(entry.points)}</strong>
  </button>;
}

export function OnlineLeagueHome({ board, player, open }: { board?: OnlineBoard; player?: Player; open: (start: LeagueStart) => void }) {
  return <aside className="league-home"><header className="league-seal-header"><span className="league-stamp" aria-hidden="true">位</span><div>
    <h2>{board ? `Temporada ${board.season}` : 'Temporada online'}</h2>
    <p>{board ? `Encerra em ${new Date(board.endsAt).toLocaleDateString('pt-BR')}` : 'Ranking Shinobi'}</p>
    </div></header><div className="league-home-body">
      {board?.top.length ? <div className="league-rows">{board.top.slice(0,5).map(entry =>
        <OnlineRow key={entry.subject} entry={entry} open={() => open({tab:'ranking',memberId:entry.member.id})}/>
      )}</div> : <p className="league-empty">{board ? 'Ainda não há resultados na temporada.' : 'Placares disponíveis na tela de ranking.'}</p>}
      {player && <button className="league-personal" type="button" onClick={() => open({tab:'ranking',memberId:player.id})}>
        <span><b>Minha colocação</b><small>{board?.mine ? fmt(board.mine.points) + ' abates' : 'Sem registro na temporada'}</small></span>
        <strong>{board?.mine ? '#' + fmt(board.mine.place) : '—'}</strong>
      </button>}
      <div className="league-actions"><button className="league-main-button" type="button" onClick={() => open({tab:'ranking'})}>Ver Ranking →</button>
        <button type="button" onClick={() => open({tab:'clans'})}>Clãs</button></div>
    </div></aside>;
}

function ClanPanel({ player, open }: { player?: Player; open: (id: string) => void }) {
  const [tag, setTag] = useState<string>();
  const [data, setData] = useState<OnlineClans>();
  const [error, setError] = useState('');
  const [revision,setRevision] = useState(0);
  useEffect(() => {
    let current = true;
    onlineClans(tag).then(result => {
      if (!current) return;
      setData(result);
      if (!tag) setTag(result.mine ?? result.top[0]?.tag);
    }).catch(reason => { if(current) setError(reason.message); });
    return () => { current=false; };
  },[tag,player?.id,revision]);
  const act = async (action:'create'|'join'|'leave', clan?:string, name?:string) => {
    setError('');
    try { await changeOnlineClan(action,clan,name);setTag(action==='leave'?undefined:clan?.trim().toUpperCase());setRevision(n=>n+1); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Clã indisponível.'); }
  };
  const selected = data?.selected;
  return <div className="league-cols"><section className="league-card"><h3>Top 100 clãs</h3>
    <div className="league-rows">{data?.top.map(clan => <button key={clan.tag} type="button" className="league-row" aria-pressed={tag===clan.tag} onClick={()=>setTag(clan.tag)}>
      <span className="league-place">{clan.place}</span><span className="league-name"><b>{clan.name} <small className="league-tag">{clan.tag}</small></b>
      <small>{fmt(clan.members)} membros</small></span><strong>{fmt(clan.points)}</strong>
    </button>)}</div>{data?.top.length===0&&<p className="league-empty">Ainda não há clãs.</p>}
    </section><section className="league-card league-clan"><h3>{selected?.clan.name ?? 'Criar clã'}</h3>
    {selected&&<><ul>{selected.members.map(member=><li key={member.id}><button type="button" onClick={()=>open(member.id)}>
      <b>{member.name}</b><small>{member.id===selected.clan.owner?'Líder':'Membro'}</small>
    </button></li>)}</ul>{player&&(selected.clan.tag===data?.mine
      ? <button type="button" onClick={()=>void act('leave')}>Sair do clã</button>
      : !data?.mine&&<button type="button" onClick={()=>void act('join',selected.clan.tag)}>Entrar neste clã</button>)}</>}
    {player&&!data?.mine&&<form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void act('create',String(f.get('tag')),String(f.get('name')));}}>
      <label>Nome do clã <input name="name" minLength={3} maxLength={32} required/></label>
      <label>Sigla <input name="tag" pattern="[A-Za-z0-9]{2,5}" required/></label>
      <button className="league-main-button" type="submit">Criar clã</button></form>}
    {error&&<p role="alert">{error}</p>}
    </section></div>;
}

export function OnlineLeagueScreen({start,player,onBack}:{start:LeagueStart;player?:Player;onBack:()=>void}) {
  const [tab,setTab] = useState(start.tab);
  const [selected,setSelected] = useState(typeof start.memberId==='string'?start.memberId:undefined);
  const [scope,setScope] = useState<OnlineFilters>(DEFAULT);
  const [byHero,setByHero] = useState(false);
  const [board,setBoard] = useState<OnlineBoard>();
  const [places,setPlaces] = useState<Record<string,number>>({});
  const [member,setMember] = useState<Awaited<ReturnType<typeof onlineProfile>>>();
  const [error,setError] = useState('');
  useEffect(()=>{setTab(start.tab);setSelected(typeof start.memberId==='string'?start.memberId:undefined);},[start]);
  useEffect(()=>{
    if(tab!=='ranking'||selected)return;
    let current=true;
    setBoard(undefined);
    setError('');
    onlineBoard(scope).then(value=>{if(current)setBoard(value);}).catch(reason=>{if(current)setError(reason.message);});
    return()=>{current=false;};
  },[tab,selected,scope,player?.id]);
  useEffect(()=>{
    setPlaces({});
    if(!player||!byHero||scope.mode==='coop')return;
    let current=true;
    onlineHeroPlaces(scope).then(value=>{if(current)setPlaces(value);}).catch(()=>{});
    return()=>{current=false;};
  },[byHero,scope.map,scope.difficulty,scope.mode,player?.id]);
  useEffect(()=>{
    setMember(undefined);
    if(!selected)return;
    let current=true;
    setError('');
    onlineProfile(selected).then(value=>{if(current)setMember(value);}).catch(reason=>{if(current)setError(reason.message);});
    return()=>{current=false;};
  },[selected]);
  const setMode=(mode:RankMode)=>setScope({...scope,mode,size:mode==='coop'?2:1,heroId:undefined});
  return <section className="hub-page league-screen">
    <div className="league-heading"><button type="button" onClick={selected?()=>setSelected(undefined):onBack}>← Voltar</button>
      <h1>{selected?'Ficha shinobi':'Ranking shinobi'}</h1><p>{board ? `Temporada ${board.season} · Online` : 'Online'}</p></div>
    <OnlineAccount player={player}/>
    {error&&<p className="league-card" role="alert">{error}</p>}
    {selected ? member ? <MemberProfile member={member}/> : !error&&<p className="league-card">{member===null?'Perfil ainda sem cadastro no ranking.':'Carregando ficha…'}</p> : <>
      <nav className="league-tabs" aria-label="Modalidade">
        <button type="button" aria-pressed={tab==='ranking'} onClick={()=>setTab('ranking')}>Shinobis</button>
        <button type="button" aria-pressed={tab==='clans'} onClick={()=>setTab('clans')}>Clãs</button>
        {player&&<button type="button" onClick={()=>setSelected(player.id)}>Minha ficha</button>}
      </nav>
      {tab==='clans'?<ClanPanel player={player} open={setSelected}/>:<div className="league-cols standings">
      <aside className="league-card league-filters"><h3>Classificação</h3>
        <label>Modo <select value={scope.mode} onChange={e=>setMode(e.target.value as RankMode)}>
          <option value="classic">Clássico</option><option value="survival">Sobrevivência</option>
          <option value="time-attack">Contrarrelógio</option><option value="coop">Cooperativo</option></select></label>
        {scope.mode==='coop'&&<label>Equipe <select value={scope.size} onChange={e=>setScope({...scope,size:Number(e.target.value)})}>
          <option value={2}>Dupla</option><option value={3}>Trio</option><option value={4}>Quarteto</option></select></label>}
        <label>Região <select value={scope.map??''} onChange={e=>setScope({...scope,map:(e.target.value||undefined) as MapId|undefined})}>
          <option value="">Todas as regiões</option>{MAPS.map(map=><option key={map.id} value={map.id}>{map.name}</option>)}</select></label>
        <label>Dificuldade <select value={scope.difficulty??''} onChange={e=>setScope({...scope,difficulty:(e.target.value||undefined) as Difficulty|undefined})}>
          <option value="">Todas as dificuldades</option>{DIFFICULTIES.map(d=><option key={d}>{d}</option>)}</select></label>
        {scope.mode!=='coop'&&<label className="league-toggle-hero"><input type="checkbox" checked={byHero} onChange={e=>{setByHero(e.target.checked);if(!e.target.checked)setScope({...scope,heroId:undefined});}}/> Por shinobi</label>}
      </aside><section className="league-card league-results">
        <div className="league-section-line"><h3>{scope.map?MAP_BY_ID[scope.map].name:'Todas as regiões'}</h3><span>{board? `Top 100 · ${fmt(board.total)} registros`:'Visão da temporada'}</span></div>
        {byHero&&scope.mode!=='coop'&&<HeroRankPicker hero={scope.heroId??''} choose={id=>setScope({...scope,heroId:id||undefined})} places={places}/>}
        {board?.top.length ? <>
          <div className="league-podium">{board.top.slice(0,3).map(entry=><OnlineRow key={entry.subject} entry={entry} open={()=>setSelected(entry.member.id)}/>)}</div>
          <div className="league-rows">{board.top.slice(3).map(entry=><OnlineRow key={entry.subject} entry={entry} open={()=>setSelected(entry.member.id)}/>)}</div>
        </>:<p className="league-empty">{board ? 'Ainda não há resultados para esta seleção.' : 'Carregando classificação…'}</p>}
        {player&&<button type="button" className="league-personal" onClick={()=>setSelected(player.id)}>
          <span><b>Minha colocação</b><small>{board?.mine?fmt(board.mine.points)+' abates':'Sem resultado neste filtro'}</small></span>
          <strong>{board?.mine?'#'+fmt(board.mine.place):'—'}</strong></button>}
      </section></div>}</>}
  </section>;
}

export function LiveSeason({ board,kills,streak,online }: { board?: OnlineBoard; kills:number; streak:number; online:boolean }) {
  return <aside className="league-live" aria-label="Temporada e abates">
    <b>{board ? `Temporada ${board.season}` : 'Missão atual'}</b>
    <strong>{fmt(kills)} <small>abates</small></strong>
    <span>Sequência <b>×{fmt(streak)}</b></span>
    {online&&<span>{board?.projected ? <>Posição estimada <b>#{fmt(board.projected.place)}</b></>
      : board?.mine ? <>Posição oficial <b>#{fmt(board.mine.place)}</b></> : 'Sem posição oficial'}</span>}
  </aside>;
}
