import { isProfileFrame, type ProfileFrame } from '../game/profilePortrait';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { HEROES, HERO_BY_ID } from '../game/heroes';
import { MAPS, MAP_BY_ID, type MapId } from '../game/maps';
import type { Difficulty } from '../game/progression';
import {
  TOP_LIMIT, DIFFICULTIES, clanMembers, clanStandings, createClan, joinClan, leagueSeason, leagueStandings, leaveClan,
  type League, type LeagueBuild, type LeagueMember, type LeagueMission, type Standing,
} from '../game/league';
import { compactNumber } from '../game/format';
import { ItemIcon } from './RunSheet';
import { CardPortrait } from './CharacterSelect';
import { SkillIcon } from './SkillIcon';
import './league.css';

type Tab = 'ranking' | 'clans';
export type LeagueStart = { tab: Tab; memberId?: number | string };
const exact = (n: number) => Math.floor(n).toLocaleString('pt-BR');
const heroName = (id: string) => HERO_BY_ID[id]?.name ?? id;
const clock = (seconds: number) => `${exact(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function useSeason() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return { now, ...leagueSeason(now) };
}

function timeLeft(ms: number) {
  const hours = Math.max(1, Math.ceil(ms / 3_600_000));
  return hours >= 24 ? `${Math.floor(hours / 24)} d ${hours % 24} h` : `${hours} h`;
}

export function Portrait({ id, frame }: { id?: string; frame?: ProfileFrame }) {
  return <span className="league-portrait" data-frame={isProfileFrame(frame)?frame:undefined}>{id && HERO_BY_ID[id] ? <CardPortrait id={id} decorative /> : <b aria-hidden="true">忍</b>}</span>;
}

function MemberLine({ entry, rank, open, title }: { entry: Standing; rank: number; open: () => void; /** Título de evento do próprio jogador (ex.: Chūnin). */ title?: string }) {
  const { member, featured, score } = entry;
  return <button type="button" className={`league-row rank-${rank}`} onClick={open}>
    <span className="league-place">{rank}</span><Portrait id={member.avatar ?? featured.heroId} frame={member.frame}/>
    <span className="league-name"><b>{member.name}{member.clan && <small className="league-tag">{member.clan}</small>}{title && <small className="league-tag league-title">{title}</small>}</b>
      <small>{heroName(featured.heroId)}</small></span>
    <strong className="league-score" title={exact(score) + ' abates'}>{compactNumber(score)}</strong>
  </button>;
}

export function LeagueHome({ board, profileId, open }: { board: League; profileId: number; open: (view: LeagueStart) => void }) {
  const season = useSeason();
  const standings = useMemo(() => leagueStandings(board, { season: season.number }), [board, season.number]);
  const mine = standings.findIndex(row => row.member.id === profileId);
  return <aside className="league-home" aria-label="Ranking da temporada">
    <header className="league-seal-header"><span className="league-stamp" aria-hidden="true">位</span><div>
      <h2>Temporada {season.number}</h2><p>Ranking local · termina em {timeLeft(season.endsAt - season.now)}</p>
    </div></header>
    <div className="league-home-body">
      <div className="league-section-line"><h3>Maiores abates</h3><span>Todas as regiões</span></div>
      {standings.length ? <div className="league-rows">{standings.slice(0, 5).map((row, i) =>
        <MemberLine key={row.member.id} entry={row} rank={i + 1} open={() => open({ tab: 'ranking', memberId: row.member.id })}/>
      )}</div> : <p className="league-empty">Conclua uma missão para abrir a classificação.</p>}
      <button type="button" className="league-personal" onClick={() => open({ tab: 'ranking', memberId: profileId })}>
        <span><b>Minha temporada</b><small>{mine < 0 ? 'Sem registro nesta temporada' : exact(standings[mine].score) + ' abates'}</small></span>
        <strong>{mine < 0 ? '—' : '#' + (mine + 1)}</strong>
      </button>
      <div className="league-actions">
        <button type="button" className="league-main-button" onClick={() => open({ tab: 'ranking' })}>Ver Ranking <span aria-hidden="true">→</span></button>
        <button type="button" onClick={() => open({ tab: 'clans' })}>Clãs</button>
      </div>
    </div>
  </aside>;
}

function BuildContents({ build, heroId }: { build: LeagueBuild; heroId: string }) {
  const groups = [
    { label: 'Técnicas', entries: Object.entries(build.skills), skill: true },
    { label: 'Pílulas', entries: Object.entries(build.pills), skill: false },
    { label: 'Itens', entries: Object.entries(build.items), skill: false },
  ];
  return <div className="league-build">
    {groups.map(({ label, entries, skill }) => <div key={label}><h4>{label}</h4>{entries.length ? <ul>
      {entries.map(([name, count]) => <li key={name}>{skill ? <SkillIcon heroId={heroId} name={name}/> : <ItemIcon name={name}/>}
        <span>{name}</span><b>{label === 'Itens' ? '×' : 'Nv. '}{count}</b></li>)}
    </ul> : <p>Vazio</p>}</div>)}
    {build.allies.length > 0 && <p className="league-supports">Ajudantes · {build.allies.map(heroName).join(' · ')}</p>}
  </div>;
}

function MissionDetails({ run, byHero = false }: { run: LeagueMission; byHero?: boolean }) {
  const location = (MAP_BY_ID[run.map]?.name ?? run.map) + ' · ' + run.difficulty;
  return <details className="league-mission">
    <summary><Portrait id={run.heroId}/><span><b>{byHero ? heroName(run.heroId) : location}</b>
      <small>{byHero ? location : heroName(run.heroId)} · {run.victory ? 'Vitória' : 'Zona ' + run.zone}</small></span>
      <strong>{exact(run.kills)} abates</strong></summary>
    <p className="league-mission-meta">{new Date(run.finishedAt).toLocaleDateString('pt-BR')} · {clock(run.elapsed)} · Nv. {exact(run.level)} · {exact(run.totalDamage)} de dano</p>
    {run.build ? <BuildContents build={run.build} heroId={run.heroId}/> : <p className="league-mission-meta">Build indisponível neste registro antigo.</p>}
  </details>;
}

export function MemberProfile({ member, rank }: { member: Omit<LeagueMember,'id'> & { avatar?: string }; rank?: number }) {
  const latest = member.history[0];
  const stats = [
    ['Missões', member.missions], ['Vitórias', member.wins], ['Abates', member.kills],
    ['Tempo jogado', clock(member.seconds)], ['Maior nível', member.highestLevel],
  ] as const;
  return <>
    <header className="league-profile-head">
      <Portrait id={member.avatar ?? latest?.heroId} frame={member.frame}/><div><p>Ficha shinobi</p><h2>{member.name}</h2>
        <span>Desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}{rank ? ` · #${rank} na temporada` : ''}</span></div>
      {member.clan && <span className="league-tag">{member.clan}</span>}
    </header>
    <dl className="league-profile-stats">{stats.map(([label, value]) => <div key={label}><dt>{label}</dt>
      <dd>{typeof value === 'number' ? exact(value) : value}</dd></div>)}</dl>
    <section className="league-card"><h3>Última build por shinobi</h3>
      {Object.values(member.builds).length ? Object.values(member.builds).sort((a, b) => b.finishedAt - a.finishedAt)
        .map(run => <MissionDetails key={run.heroId} run={run} byHero />) : <p className="league-empty">As builds aparecem aqui após concluir uma missão nesta versão do jogo.</p>}
    </section>
    <section className="league-card"><h3>Missões recentes</h3>
      {member.history.length ? member.history.map((run, i) => <MissionDetails key={`${run.finishedAt}:${i}`} run={run}/>)
        : <p className="league-empty">Nenhuma missão registrada.</p>}
    </section>
  </>;
}

function ClanBoard({ board, standings, profileId, act, onMember }: {
  board: League; standings: Standing[]; profileId: number;
  act: (update: (current: League) => League) => void; onMember: (id: number) => void;
}) {
  const mine = board.members[profileId]?.clan;
  const all = clanStandings(board, standings);
  const [selectedTag, selectTag] = useState<string>();
  const current = board.clans[selectedTag ?? mine ?? all[0]?.clan.tag];
  const [message, setMessage] = useState('');
  const change = (update: (current: League) => League) => {
    setMessage('');
    try { act(update); } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o clã.'); }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    change(state => createClan(state, profileId, String(fields.get('name')), String(fields.get('tag'))));
    selectTag(undefined);
  };
  return <div className="league-cols">
    <section className="league-card"><h3>Top 100 clãs</h3>
      {!all.length && <p className="league-empty">Crie o primeiro clã.</p>}
      <div className="league-rows">{all.slice(0, TOP_LIMIT).map(({ clan, members, score }, i) => <button type="button"
        key={clan.tag} className="league-row" onClick={() => selectTag(clan.tag)} aria-pressed={current?.tag === clan.tag}>
        <span className="league-place">{i + 1}</span><span className="league-name"><b>{clan.name} <small className="league-tag">{clan.tag}</small></b>
          <small>{members.length} {members.length === 1 ? 'membro' : 'membros'}</small></span><strong>{exact(score)}</strong>
      </button>)}</div>
    </section>
    <section className="league-card league-clan"><h3>{current ? current.name : 'Criar clã'}</h3>
      {current && <><p><span className="league-tag">{current.tag}</span> {current.tag === mine ? 'Meu clã' : 'Membros'}</p>
        <ul>{clanMembers(board, current.tag).map(member => <li key={member.id}><button type="button" onClick={() => onMember(member.id)}>
          <Portrait id={member.history[0]?.heroId}/><b>{member.name}</b><small>{member.id === current.owner ? 'Líder' : 'Membro'}</small>
        </button></li>)}</ul>
        {current.tag === mine ? <button type="button" onClick={() => { change(state => leaveClan(state, profileId)); selectTag(undefined); }}>Sair do clã</button>
          : !mine ? <button type="button" onClick={() => change(state => joinClan(state, profileId, current.tag))}>Entrar neste clã</button>
          : <button type="button" onClick={() => selectTag(mine)}>Ver meu clã</button>}
      </>}
      {!mine && <form onSubmit={submit}>
        {current && <h4>Criar outro clã</h4>}
        <label>Nome do clã <input name="name" minLength={3} maxLength={32} required autoComplete="off"/></label>
        <label>Sigla <input name="tag" minLength={2} maxLength={5} required pattern="[A-Za-z0-9]{2,5}" autoComplete="off"/></label>
        <button className="league-main-button" type="submit">Criar clã</button>
      </form>}
      {message && <p role="alert">{message}</p>}
    </section>
  </div>;
}

export function LeagueScreen({ board, profileId, start, onBack, act, ownTitle }: { ownTitle?: string;
  board: League; profileId: number; start: LeagueStart; onBack: () => void; act: (update: (state: League) => League) => void;
}) {
  const season = useSeason();
  const [tab, setTab] = useState<Tab>(start.tab);
  const [selected, setSelected] = useState<number | undefined>(typeof start.memberId === 'number' ? start.memberId : undefined);
  useEffect(() => { setTab(start.tab); setSelected(typeof start.memberId === 'number' ? start.memberId : undefined); }, [start]);
  const [map, setMap] = useState<MapId | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [hero, setHero] = useState('');
  const [byHero, setByHero] = useState(false);
  const global = useMemo(() => leagueStandings(board, { season: season.number }), [board, season.number]);
  const scoped = useMemo(() => leagueStandings(board, {
    season: season.number, map: map || undefined, difficulty: difficulty || undefined, heroId: hero || undefined,
  }), [board, season.number, map, difficulty, hero]);
  const heroPlaces = useMemo(() => {
    if (!byHero) return {};
    const keys = Object.keys(board.members[profileId]?.best ?? {});
    return Object.fromEntries([...new Set(keys.map(key => key.split('/').at(-1)!))].flatMap(id => {
      const position = leagueStandings(board, {season: season.number, map: map || undefined, difficulty: difficulty || undefined, heroId: id}).findIndex(row => row.member.id === profileId) + 1;
      return position ? [[id, position]] : [];
    }));
  },[board, byHero, map, difficulty, profileId, season.number]);
  const mine = scoped.findIndex(row => row.member.id === profileId);
  const pod = scoped.slice(0, 3);
  const focused = selected === undefined ? undefined : board.members[selected];
  const showTab = (next: Tab) => { setTab(next); setSelected(undefined); };
  return <section className="hub-page league-screen" aria-label="Ranking shinobi">
    <div className="league-heading"><button type="button" onClick={focused ? () => setSelected(undefined) : onBack}>← Voltar</button>
      <h1>{focused ? 'Ficha shinobi' : 'Ranking shinobi'}</h1><p>Temporada {season.number} · Local</p></div>
    {focused ? <MemberProfile member={focused} rank={global.findIndex(row => row.member.id === focused.id) + 1}/>
      : <>
        <nav className="league-tabs" aria-label="Modalidade"><button type="button" aria-pressed={tab === 'ranking'} onClick={() => showTab('ranking')}>Shinobis</button>
          <button type="button" aria-pressed={tab === 'clans'} onClick={() => showTab('clans')}>Clãs</button>
          <button type="button" disabled={!board.members[profileId]} onClick={() => setSelected(profileId)}>Minha ficha</button></nav>
        {tab === 'clans' ? <ClanBoard board={board} standings={global} profileId={profileId} act={act} onMember={setSelected}/>
          : <div className="league-cols standings">
            <aside className="league-card league-filters"><h3>Classificação</h3>
              <label>Região <select value={map} onChange={e => setMap(e.target.value as MapId | '')}>
                <option value="">Todas as regiões</option>{MAPS.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select></label>
              <label>Dificuldade <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty | '')}>
                <option value="">Todas as dificuldades</option>{DIFFICULTIES.map(entry => <option key={entry}>{entry}</option>)}
              </select></label>
              <label className="league-toggle-hero"><input type="checkbox" checked={byHero} onChange={e=>{setByHero(e.target.checked);if(!e.target.checked)setHero('');}}/> Por shinobi</label>
              <p>{map ? 'Melhor missão nesta região.' : 'Soma da melhor missão de cada região.'}</p>
            </aside>
            <section className="league-card league-results">
              <div className="league-section-line"><h3>{map ? MAP_BY_ID[map].name : 'Todas as regiões'}</h3>
                <span>Top {TOP_LIMIT} · {exact(scoped.length)} {scoped.length === 1 ? 'perfil' : 'perfis'}</span></div>
              {byHero&&<HeroRankPicker hero={hero} choose={setHero} places={heroPlaces}/>}
              {pod.length > 0 ? <div className="league-podium">{pod.map((row, i) =>
                <MemberLine key={row.member.id} entry={row} rank={i + 1} title={row.member.id === profileId ? ownTitle : undefined} open={() => setSelected(row.member.id)}/>
              )}</div> : <p className="league-empty">Ainda não há missões registradas com estes filtros.</p>}
              {scoped.length > 3 && <div className="league-rows">{scoped.slice(3, TOP_LIMIT).map((row, i) =>
                <MemberLine key={row.member.id} entry={row} rank={i + 4} title={row.member.id === profileId ? ownTitle : undefined} open={() => setSelected(row.member.id)}/>
              )}</div>}
              <button type="button" className="league-personal" disabled={!board.members[profileId]} onClick={() => setSelected(profileId)}>
                <span><b>Minha colocação</b><small>{mine < 0 ? 'Sem registro neste filtro' : exact(scoped[mine].score) + ' abates'}</small></span>
                <strong>{mine < 0 ? '—' : '#' + (mine + 1)}</strong>
              </button>
            </section>
          </div>}
      </>}
  </section>;
}

export function HeroRankPicker({hero, choose, places}:{hero:string; choose:(id:string)=>void;places:Record<string,number>}) {
  return <><div className="league-section-line"><button type="button" className="league-filter-reset" disabled={!hero} onClick={()=>choose('')}>Todos os shinobis</button></div>
    <div className="league-hero-picker" aria-label="Colocação por shinobi">{HEROES.map(entry=><button type="button" key={entry.id} aria-pressed={entry.id===hero} onClick={()=>choose(entry.id)}>
      <Portrait id={entry.id}/>{places[entry.id]&&<strong>#{exact(places[entry.id])}</strong>}<span>{entry.name}</span>
    </button>)}</div></>;
}
