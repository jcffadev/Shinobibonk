import { ItemIcon } from './RunSheet';
import { BuffText } from './BuffText';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ROULETTE_CASAS, ROULETTE_RULES, badChance, goodChance, type RouletteCasaId, type RoulettePrize, type RouletteView } from '../game/roulette';
import { itemArt } from '../game/inventoryArt';
import '../tsunade-roulette.css';

/**
 * Roleta da Tsunade (overlay). A simulação (GameCanvas) decide o resultado e cobra na hora; aqui só animamos a roda.
 * Controles: toque em E = 1 giro animado · segurar E = giro rápido contínuo (se ligado) · apertar E durante a animação =
 * resultado instantâneo · F liga/desliga o giro rápido · Esc/X/"Sair e receber" entrega tudo e fecha.
 */
const FAST_KEY = 'sb_roulette_fast';
const readFast = () => { try { return localStorage.getItem(FAST_KEY) !== '0'; } catch { return true; } };
const saveFast = (on: boolean) => { try { localStorage.setItem(FAST_KEY, on ? '1' : '0'); } catch { /* sem armazenamento: só nesta sessão */ } };
const SEG = 360 / ROULETTE_CASAS.length;
const COLORS = { bom: ['#2f8f5b', '#3aa86b'], ruim: ['#a8323e', '#c2414d'], neutro: ['#55586b', '#666a80'] };
const WHEEL_BG = `conic-gradient(${ROULETTE_CASAS.map((c, i) => `${COLORS[c.kind][i % 2]} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(',')})`;
type SpinResult = { ok: boolean; reason?: string; prize?: RoulettePrize; view: RouletteView | null };
function send<T>(action: string): T | undefined {
  const detail: { action: string; result?: unknown } = { action };
  window.dispatchEvent(new CustomEvent('shinobi-roulette', { detail }));
  return detail.result as T | undefined;
}
const pct = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%';
/** Ícones das casas no atlas novo do inventário (inventoryArt.ts); casas sem arte equivalente (vazia) mantêm o símbolo. */
const CASA_ART: Partial<Record<RouletteCasaId, () => CSSProperties | undefined>> = {
  kunai: () => itemArt('swift-kunai'), shuriken: () => itemArt('tenten'), ryu: () => itemArt('coins'),
  item: () => itemArt('forbidden-scroll'), jackpot: () => itemArt('ryo-nugget'), buff: () => itemArt('life'), lose: () => itemArt('gold-tooth'),
  debuff: () => itemArt('red-moon'), ambush: () => itemArt('kubikiribocho'),
};
function CasaIcon({ id, fallback, label }: { id: RouletteCasaId; fallback: string; label: string }) {
  const style = CASA_ART[id]?.();
  return style ? <span role="img" aria-label={label} className="catalog-icon tr-casa-icon" style={style} /> : <>{fallback}</>;
}
const fmtRyu = (n: number) => n.toLocaleString('pt-BR');

export function TsunadeRoulette({ view }: { view: RouletteView }) {
  const [live, setLive] = useState<RouletteView>(view);
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<RoulettePrize[]>(view.pending);
  const [last, setLast] = useState<RoulettePrize | null>(null);
  const [message, setMessage] = useState('');
  const [fast, setFast] = useState(readFast);
  const [turbo, setTurbo] = useState(false);
  const rotationRef = useRef(0), spinningRef = useRef(false), currentRef = useRef<RoulettePrize | null>(null);
  const heldRef = useRef(false), turboRef = useRef(false), fastRef = useRef(fast);
  const finishTimer = useRef<number>(0), holdTimer = useRef<number>(0), nextTimer = useRef<number>(0);
  const spinRef = useRef<(fastMode: boolean) => void>(() => {});
  fastRef.current = fast;
  // O snapshot (a cada 0,2 s) só substitui a visão local se não for mais antigo que o último giro.
  useEffect(() => { setLive(prev => view.sessionSpins >= prev.sessionSpins ? view : prev); }, [view]);

  const finish = useCallback(() => {
    window.clearTimeout(finishTimer.current);
    const prize = currentRef.current; if (!spinningRef.current || !prize) return;
    spinningRef.current = false; currentRef.current = null;
    setDuration(0); setSpinning(false); setLast(prize); setRevealed(list => [...list, prize]);
    if (heldRef.current && fastRef.current && turboRef.current) nextTimer.current = window.setTimeout(() => spinRef.current(true), 40);
  }, []);

  const spin = useCallback((fastMode: boolean) => {
    if (spinningRef.current) return;
    const r = send<SpinResult>('spin'); if (!r) return;
    if (r.view) setLive(r.view);
    if (!r.ok || !r.prize) { setMessage(r.reason ?? 'Não foi possível girar.'); turboRef.current = false; setTurbo(false); return; }
    setMessage('');
    const prize = r.prize, index = ROULETTE_CASAS.findIndex(c => c.id === prize.id);
    const base = rotationRef.current, floor = base - (((base % 360) + 360) % 360);
    const jitter = (Math.random() - .5) * SEG * .6;
    const target = floor + 360 * (fastMode ? 2 : 5) + (360 - (index * SEG + SEG / 2)) + jitter;
    const ms = fastMode ? ROULETTE_RULES.fastSpinMs : ROULETTE_RULES.spinMs;
    rotationRef.current = target; currentRef.current = prize; spinningRef.current = true;
    setDuration(ms); setRotation(target); setSpinning(true);
    finishTimer.current = window.setTimeout(finish, ms);
  }, [finish]);
  spinRef.current = spin;

  const exit = useCallback(() => { finish(); turboRef.current = false; heldRef.current = false; send('exit'); }, [finish]);
  const toggleFast = useCallback(() => setFast(on => { saveFast(!on); if (on) { turboRef.current = false; setTurbo(false); } return !on; }), []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'x') { e.preventDefault(); exit(); return; }
      if (key === 'f' && !e.repeat) { toggleFast(); return; }
      if (key !== 'e' || e.repeat) return; // repetição automática do SO não conta como toque
      heldRef.current = true;
      if (spinningRef.current) finish(); // toque durante a animação: resultado na hora
      else spin(false);
      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(() => {
        if (!heldRef.current || !fastRef.current) return;
        turboRef.current = true; setTurbo(true);
        if (spinningRef.current) finish(); else spin(true);
      }, ROULETTE_RULES.holdMs);
    };
    const release = () => { heldRef.current = false; turboRef.current = false; setTurbo(false); window.clearTimeout(holdTimer.current); window.clearTimeout(nextTimer.current); };
    const onUp = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'e') release(); };
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp); window.addEventListener('blur', release);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', release); window.clearTimeout(holdTimer.current); window.clearTimeout(nextTimer.current); window.clearTimeout(finishTimer.current); };
  }, [exit, finish, spin, toggleFast]);

  const good = goodChance(live.weights), bad = badChance(live.weights);
  const goods = revealed.filter(p => p.kind === 'bom').length, bads = revealed.filter(p => p.kind === 'ruim').length;
  return <div className="tr-backdrop" data-testid="tsunade-roulette">
    <section className="tr-modal" role="dialog" aria-label="Roleta da Tsunade">
      <button className="tr-close" onClick={exit} aria-label="Sair e receber">×</button>
      <header className="tr-head">
        <small>EVENTO · A LENDÁRIA PERDEDORA</small>
        <h1>Roleta da Tsunade</h1>
        <p>Cada giro cobra na hora. Prêmios e penalidades são entregues ao sair. Para cada item, escolha pegar com E ou vender com V.</p>
      </header>
      <div className="tr-body">
        <div className="tr-wheel-col">
          <div className="tr-pointer" aria-hidden>▼</div>
          <div className={`tr-wheel${spinning ? ' is-spinning' : ''}${turbo ? ' is-turbo' : ''}`} style={{ background: WHEEL_BG, transform: `rotate(${rotation}deg)`, transition: duration ? `transform ${duration}ms cubic-bezier(.15,.75,.2,1)` : 'none' }}>
            {ROULETTE_CASAS.map((c, i) => <span key={c.id} className={`tr-casa kind-${c.kind}`} style={{ transform: `rotate(${i * SEG + SEG / 2}deg)` }}><b title={c.label}><CasaIcon id={c.id} fallback={c.icon} label={c.label} /></b></span>)}
            <div className="tr-hub">綱</div>
          </div>
          <div className={`tr-result${last ? ' kind-' + last.kind : ''}`} aria-live="polite">
            {spinning ? <span>Girando…{turbo ? ' (giro rápido)' : ''}</span> : last ? <><b>{last.item||last.pill?<ItemIcon name={last.item??last.pill!}/>:<CasaIcon id={last.id} fallback={last.icon} label={last.label}/>} {last.label}</b><small>{last.detail}</small></> : <span>Aperte E para girar</span>}
          </div>
          {message && <p className="tr-message">{message}</p>}
          <div className="tr-actions">
            <button className="tr-spin" onClick={() => spin(false)} disabled={spinning}>Girar · {fmtRyu(live.cost)} Ryu <kbd>E</kbd></button>
            <button className={`tr-fast${fast ? ' on' : ''}`} onClick={toggleFast} aria-pressed={fast}>Giro rápido ao segurar E: {fast ? 'Ligado' : 'Desligado'} <kbd>F</kbd></button>
            <button className="tr-exit" onClick={exit}>Sair e receber <kbd>Esc</kbd></button>
          </div>
          <p className="tr-help">Toque em E: 1 giro animado · Segure E: giro rápido contínuo · Aperte E durante a animação: resultado instantâneo.</p>
        </div>
        <div className="tr-side">
          <dl className="tr-stats">
            <div><dt>Ryu</dt><dd><CasaIcon id="ryu" fallback="🪙" label="Ryu" /> {fmtRyu(live.money)}</dd></div>
            <div><dt>Próximo giro</dt><dd>{fmtRyu(live.cost)} Ryu <small>(×{String(ROULETTE_RULES.costGrowth).replace('.', ',')}/giro · sobe com o tempo{live.discount > 0 ? ` · −${Math.round(live.discount * 100)}%` : ''})</small></dd></div>
            <div><dt>Giros na run</dt><dd>{live.spins}</dd></div>
            <div><dt>Ryu gasto na run</dt><dd>{fmtRyu(live.ryuSpent)}</dd></div>
            <div><dt>Sorte</dt><dd>🍀 {live.luck}</dd></div>
            <div><dt>Pressão da zona</dt><dd>⚠ {live.pressure.toFixed(2).replace('.', ',')}</dd></div>
          </dl>
          <div className="tr-odds"><b>Chances atuais</b> <span className="good">Boas {pct(good)}</span> · <span className="bad">Ruins {pct(bad)}</span>
            <ul>{ROULETTE_CASAS.map(c => <li key={c.id} className={`kind-${c.kind}`} title={c.description}><i><CasaIcon id={c.id} fallback={c.icon} label={c.label} /></i><span>{c.label}</span><em>{pct(live.weights[c.id] ?? 0)}</em></li>)}</ul>
          </div>
          <div className="tr-pending">
            <b>Ganhos desta visita · {revealed.length} giro(s) · {live.sessionSpent} Ryu</b> <small>{goods} bons · {bads} ruins</small>
            <ol>{[...revealed].reverse().map(p => <li key={p.seq} className={`kind-${p.kind}`}><i>{p.item||p.pill?<ItemIcon name={p.item??p.pill!}/>:<CasaIcon id={p.id} fallback={p.icon} label={p.label}/>}</i><span>{p.label}<small><BuffText text={p.detail}/></small></span></li>)}</ol>
            {!revealed.length && <p className="tr-empty">Nada ainda. Os resultados aparecem aqui e são entregues ao sair.</p>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
