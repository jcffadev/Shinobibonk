import { VillageEmblem } from './VillageEmblem';
import { UNLOCK_MISSIONS, missingRequirements } from '../game/unlockMissions';
import { MAP_BY_ID } from '../game/maps';
import { HERO_BY_ID } from '../game/heroes';
import { sealedHeroes, isMapUnlocked, isDifficultyUnlocked, isHeroPlayable } from '../game/account';
import { HeroPortrait } from './RunSheet';
import '../mission-card.css';

/**
 * Card da missão de desbloqueio de um shinobi: história, onde jogar e checklist de requisitos
 * (shinobis selados antes, mapa e dificuldade liberados, abates e minuto na run). Usado na seleção (hover e painel) e no mapa.
 */
export function MissionCard({ id, compact = false, anonymous = false }: { id: string; compact?: boolean; anonymous?: boolean }) {
  const m = UNLOCK_MISSIONS[id]; if (!m) return null;
  const sealed = sealedHeroes(), missing = missingRequirements(id, sealed, isHeroPlayable), map = MAP_BY_ID[m.map];
  // Versões: liberar a versão anterior e jogar COM ela; o novo shinobi só aparece nessa run.
  const previous = m.playWith, previousOk = !!previous && isHeroPlayable(previous), previousName = previous ? HERO_BY_ID[previous]?.name ?? previous : '';
  const mapOk = isMapUnlocked(m.map), diffOk = isDifficultyUnlocked(m.map, m.difficulty);
  const steps: { ok: boolean; text: string; portrait?: string }[] = [
    ...(previous ? [{ ok: previousOk, text: anonymous && !previousOk ? 'Liberar a versão anterior deste shinobi' : 'Jogar com ' + previousName + (previousOk ? '' : ' (liberar antes)'), portrait: anonymous && !previousOk ? undefined : previous }] : []),
    ...(m.requires ?? []).map((r) => ({ ok: sealed.has(r), text: anonymous&&!sealed.has(r)?'Selar o shinobi da missão anterior':'Selar ' + (HERO_BY_ID[r]?.name ?? r) + ' antes', portrait: anonymous&&!sealed.has(r)?undefined:r })),
    { ok: mapOk, text: 'Liberar o mapa ' + map.name },
    { ok: diffOk, text: 'Liberar a dificuldade ' + m.difficulty + ' neste mapa' },
    { ok: false, text: `Na run${previous && !(anonymous && !previousOk) ? ' com ' + previousName : ''}: ${m.kills} abates e ${m.minute} min de missão` },
    { ok: false, text: 'Derrotar e selar o shinobi (1 tentativa)' },
  ];
  const ready = missing.length === 0 && mapOk && diffOk;
  return <div className={`mc ${compact ? 'compact' : ''} ${m.legendary ? 'legendary' : ''}`} style={{ ['--map' as string]: map.color }}>
    <header><span className="mc-symbol"><VillageEmblem village={map.name}/></span><div><small>{m.legendary ? 'MISSÃO LENDÁRIA' : previous ? 'MISSÃO DE VERSÃO' : 'MISSÃO DE DESBLOQUEIO'}</small><b>{anonymous?'Liberado com missão':m.title}</b></div><em className={ready ? 'ready' : ''}>{ready ? 'Pronta' : '🔒'}</em></header>
    <div className="mc-where"><i>{map.name}</i><i>{m.difficulty}</i><i>⚔ {m.kills} abates</i><i>⏱ {m.minute} min</i></div>
    {!compact && !anonymous && <p>{m.story}</p>}
    <ul>{steps.map((s, i) => <li key={i} className={s.ok ? 'ok' : ''}>{s.portrait ? <span className="mc-portrait"><HeroPortrait id={s.portrait} /></span> : <span className="mc-dot">{s.ok ? '✓' : '•'}</span>}{s.text}{s.portrait && <strong>{s.ok ? '✓' : '✗'}</strong>}</li>)}</ul>
  </div>;
}
