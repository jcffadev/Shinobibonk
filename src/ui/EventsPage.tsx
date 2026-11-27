import { useEffect, useState } from 'react';
import { EVENTS, duelAvailable, eventPhases, eventProgress, type EventDuel } from '../game/events';
import { eventDuelsDone, eventPrizesClaimed, isHeroPlayable, sealedHeroes, unlockedHeroes } from '../game/account';
import { CAPTURE_CHANCE, ORGANIZATION_EVENT, SEAL_ATTEMPTS, captureOdds, organizationStatus } from '../game/season';
import { HERO_BY_ID, familyOf } from '../game/heroes';
import { HeroPortrait } from './RunSheet';
import '../events.css';

/**
 * Aba Eventos (25/11/2026 — pedido do usuário: "A parte da aba de eventos e tudo mais, você pode fazer"). Lista os eventos
 * da temporada; cada duelo mostra os dois lados, a condição e com quem dá para jogar. Visual simples, com os retratos que já
 * existem; o Codex pode refazer a arte depois.
 */
export function EventsPage({ heroId, onPlay, onBack }: { heroId: string; onPlay: (duelId: string, playAs: string) => void; onBack: () => void }) {
  const [, setTick] = useState(0);
  useEffect(() => { const on = () => setTick(n => n + 1); window.addEventListener('shinobi-account', on); return () => window.removeEventListener('shinobi-account', on); }, []);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onBack]);
  const done = eventDuelsDone(), claimed = new Set(eventPrizesClaimed());
  // Joga com a versão escolhida quando ela é da mesma família do lado (ex.: Naruto Genin no lado do Naruto).
  const playAs = (side: string) => familyOf(heroId) === familyOf(side) && isHeroPlayable(heroId) ? heroId : side;
  return <div className="ev-page">
    <header className="ms-top"><button type="button" className="ms-back" onClick={onBack}><kbd>Esc</kbd> Voltar</button><h1>Eventos</h1><span className="ev-season">Temporada 1 · Academia e Genin</span></header>
    {EVENTS.map(event => {
      const progress = eventProgress(event, done);
      const phases = [...new Set(event.duels.map(d => d.phase))];
      return <section className="ev-event" key={event.id} aria-label={event.title}>
        <div className="ev-event-head">
          <div><small>EVENTO DO ANIME</small><h2>{event.title}</h2><p>{event.story}</p><p className="ev-reward">{event.reward}</p></div>
          <div className="ev-progress" aria-label="Progresso do evento"><b>{progress.finished}/{progress.total}</b><small>duelos vencidos</small><i style={{ width: Math.round(progress.finished / progress.total * 100) + '%' }}/></div>
        </div>
        <ul className="ev-prizes" aria-label="Prêmios do evento">
          {eventPhases(event, done).map(p => <li key={p.phase} className={claimed.has(event.id + ':' + p.phase) ? 'got' : ''}><b>{p.phase}</b><span>🍜 {p.lamens.toLocaleString('pt-BR')} Lamens</span><small>{claimed.has(event.id + ':' + p.phase) ? '✓ recebido' : `${p.finished}/${p.total} duelos`}</small></li>)}
          <li className={claimed.has(event.id + ':completo') ? 'got final' : 'final'}><b>Prova completa</b><span>🍜 {event.prizes.complete.toLocaleString('pt-BR')} Lamens · título "{event.prizes.title}" · moldura Jade</span><small>{claimed.has(event.id + ':completo') ? '✓ recebido' : `${progress.finished}/${progress.total} duelos`}</small></li>
        </ul>
        {phases.map(phase => <div className="ev-phase" key={phase}><h3>{phase}</h3><div className="ev-duels">
          {event.duels.filter(d => d.phase === phase).map(d => <DuelCard key={d.id} duel={d} winner={done[d.id]} playAs={playAs} onPlay={onPlay}/>)}
        </div></div>)}
      </section>;
    })}
    <OrganizationEvent />
  </div>;
}

function DuelCard({ duel, winner, playAs, onPlay }: { duel: EventDuel; winner?: string; playAs: (side: string) => string; onPlay: (duelId: string, playAs: string) => void }) {
  const open = duelAvailable(duel, isHeroPlayable);
  const name = (id: string) => HERO_BY_ID[id]?.name ?? id;
  return <article className={'ev-duel' + (winner ? ' done' : '') + (open ? '' : ' locked')}>
    <div className="ev-sides">{duel.sides.map((side, i) => <span key={side} className={isHeroPlayable(side) ? '' : 'ev-locked-side'}>{i > 0 && <em>×</em>}<HeroPortrait id={side}/><b>{name(side)}</b></span>)}</div>
    <h4>{duel.title}</h4>
    <p>{duel.story}</p>
    <small className="ev-rule">Floresta da Morte · {duel.difficulty} · entrada da sala após {duel.minute} min e {duel.kills} abates</small>
    {winner ? <small className="ev-state">✓ Vencido com {name(winner)}</small> : !open ? <small className="ev-state">🔒 Libere {name(duel.sides[0])} ou {name(duel.sides[1])}</small> : null}
    {open && <div className="ev-actions">{duel.sides.filter(isHeroPlayable).map(side => {
      const as = playAs(side), foe = duel.sides.find(s => s !== side)!;
      return <button type="button" key={side} onClick={() => onPlay(duel.id, as)}>Jogar com {name(as)}<small>{isHeroPlayable(foe) ? 'enfrente ' + name(foe) : 'selar libera ' + name(foe)}</small></button>;
    })}</div>}
  </article>;
}

const MAP_NAME: Record<string, string> = { folha: 'Vila da Folha', areia: 'Vila da Areia', pedra: 'Vila da Pedra', nevoa: 'Vila da Névoa' };
const pct = (n: number) => Math.round(n * 100) + '%';
const when = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
/**
 * "Uma nova Organização surge!" (27/11/2026): evento rotativo da Akatsuki. Só Itachi e Kisame se liberam aqui, com metas
 * difíceis, chance baixa de aparecer e de selar (3 tentativas). As regras ficam em src/game/season.ts.
 */
function OrganizationEvent() {
  const status = organizationStatus(Date.now()), sealed = sealedHeroes(), unlocked = unlockedHeroes();
  const name = (id: string) => HERO_BY_ID[id]?.name ?? id;
  const odds = captureOdds(CAPTURE_CHANCE.akatsuki, SEAL_ATTEMPTS);
  return <section className={'ev-event ev-organization' + (status.active ? '' : ' closed')} aria-label={ORGANIZATION_EVENT.title}>
    <div className="ev-event-head">
      <div><small>EVENTO ROTATIVO · AKATSUKI</small><h2>{ORGANIZATION_EVENT.title}</h2><p>{ORGANIZATION_EVENT.story}</p>
        <p className="ev-reward">{status.active ? `Aberto até ${when(status.changesAt)}.` : `Fechado · volta em ${when(status.changesAt)}.`} Cumpridas as metas, cada membro tem uma chance de aparecer por partida. Derrotado, vira Shinobi para selar: {pct(CAPTURE_CHANCE.akatsuki)} por tentativa, {SEAL_ATTEMPTS} tentativas ({pct(odds)} no total); depois ele escapa.</p></div>
    </div>
    <div className="ev-duels">
      {ORGANIZATION_EVENT.targets.map(t => {
        const got = unlocked.has(t.heroId), missing = t.requires.filter(r => !sealed.has(r));
        return <article key={t.heroId} className={'ev-duel' + (got ? ' done' : '') + (status.active ? '' : ' locked')}>
          <div className="ev-sides"><span className={got ? '' : 'ev-locked-side'}><HeroPortrait id={t.heroId}/><b>{name(t.heroId)}</b></span></div>
          <h4>{t.title}</h4>
          <p>{t.story}</p>
          <small className="ev-rule">{MAP_NAME[t.map] ?? t.map} · {t.difficulty} · depois de {t.minute} min e {t.kills.toLocaleString('pt-BR')} abates · {pct(t.appearChance)} de chance de aparecer</small>
          <small className="ev-rule">Selados antes: {t.requires.map(r => (sealed.has(r) ? '✓ ' : '✗ ') + name(r)).join(' · ')}</small>
          {got ? <small className="ev-state">✓ Liberado na conta</small> : missing.length ? <small className="ev-state">🔒 Sele antes {missing.map(name).join(' e ')}</small> : !status.active ? <small className="ev-state">⏳ Espere o evento voltar</small> : null}
        </article>;
      })}
    </div>
  </section>;
}
