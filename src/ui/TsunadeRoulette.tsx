import { ItemIcon } from './RunSheet';
import { BuffText } from './BuffText';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ROULETTE_CASAS, ROULETTE_RULES, badChance, goodChance, type RouletteCasa, type RouletteCasaId, type RoulettePrize, type RouletteView } from '../game/roulette';
import { itemArt } from '../game/inventoryArt';
import { compactNumber } from '../game/format';
import '../tsunade-roulette.css';

/**
 * Caça-Níquel da Tsunade (overlay, ex-"Roleta da Tsunade" — rodada 37). A simulação (GameCanvas) decide o resultado
 * e cobra na hora; aqui só animamos os 3 rolos: cada giro sorteia UMA casa e os 3 rolos param no MESMO símbolo
 * ("3 iguais" = o combo daquela casa). O retrato da Tsunade reage à recompensa (feliz/triste/nervosa).
 * Controles: toque em E = 1 giro animado · segurar E = giro rápido contínuo (se ligado) · apertar E durante a animação =
 * resultado instantâneo · F liga/desliga o giro rápido · Esc/X/"Sair e receber" entrega tudo e fecha (armadilhas shinobi explodem).
 */
const FAST_KEY = 'sb_roulette_fast';
const readFast = () => { try { return localStorage.getItem(FAST_KEY) !== '0'; } catch { return true; } };
const saveFast = (on: boolean) => { try { localStorage.setItem(FAST_KEY, on ? '1' : '0'); } catch { /* sem armazenamento: só nesta sessão */ } };
type SpinResult = { ok: boolean; reason?: string; prize?: RoulettePrize; view: RouletteView | null };
function send<T>(action: string): T | undefined {
  const detail: { action: string; result?: unknown } = { action };
  window.dispatchEvent(new CustomEvent('shinobi-roulette', { detail }));
  return detail.result as T | undefined;
}
const pct = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%';

// ───── Roleta de símbolos (3 rolos verticais) ─────
const CELL = 64; // altura da célula em px — precisa bater com `.tr-cell` em tsunade-roulette.css
const REEL_REPEATS = [3, 4, 5]; // repetições da lista por rolo → paradas escalonadas (o 3º rolo demora mais)
const NORMAL_MS = [900, 1150, 1400];
const TURBO_MS = [240, 300, 360];
/** Strip do rolo: a lista de casas repetida N vezes + a casa sorteada no final (o rolo termina centrando ela). */
function buildStrip(targetIndex: number, repeats: number): RouletteCasa[] {
  const strip: RouletteCasa[] = [];
  for (let r = 0; r < repeats; r++) for (const c of ROULETTE_CASAS) strip.push(c);
  strip.push(ROULETTE_CASAS[targetIndex]);
  return strip;
}

// ───── Retratos no atlas do elenco (shinobi-roster-v2.png, grade 5×5) ─────
const ROSTER = '/assets/shinobi-roster-v2.png';
const rosterCell = (col: number, row: number): CSSProperties => ({ backgroundImage: `url(${ROSTER})`, backgroundSize: '500% 500%', backgroundPosition: `${col * 25}% ${row * 25}%` });
const TSUNADE_FACE = rosterCell(4, 1); // índice 9 do roster (col 4, row 1)

/** Ícones das casas no atlas novo do inventário (inventoryArt.ts); combos de 3 iguais usam o roster ou símbolo. */
const CASA_ART: Partial<Record<RouletteCasaId, () => CSSProperties | undefined>> = {
  kunai: () => itemArt('swift-kunai'), shuriken: () => itemArt('tenten'), ryu: () => itemArt('coins'),
  item: () => itemArt('forbidden-scroll'), jackpot: () => itemArt('ryo-nugget'), buff: () => itemArt('life'), lose: () => itemArt('gold-tooth'),
  debuff: () => itemArt('red-moon'), ambush: () => itemArt('kubikiribocho'),
  tsunade: () => TSUNADE_FACE, jiraiya: () => rosterCell(0, 2),
};
function CasaIcon({ id, fallback, label }: { id: RouletteCasaId; fallback: string; label: string }) {
  const style = CASA_ART[id]?.();
  return style ? <span role="img" aria-label={label} className="catalog-icon tr-casa-icon" style={style} /> : <>{fallback}</>;
}
/** Ryu em formato curto (1,2 mil · 3,4M); o valor completo fica no title de cada campo. */
const fmtRyu = (n: number) => compactNumber(n);
const fullRyu = (n: number) => `${Math.round(n).toLocaleString('pt-BR')} Ryu`;
/** Humor da Tsunade por recompensa (rodada 37): bom → feliz · neutro → triste · ruim → nervosa. */
const MOOD: Record<'bom' | 'neutro' | 'ruim', { badge: string; word: string; cls: string }> = {
  bom: { badge: '😄', word: 'feliz', cls: 'mood-happy' },
  neutro: { badge: '😢', word: 'triste', cls: 'mood-sad' },
  ruim: { badge: '😠', word: 'nervosa', cls: 'mood-angry' },
};

export function TsunadeRoulette({ view }: { view: RouletteView }) {
  const [live, setLive] = useState<RouletteView>(view);
  const [strips, setStrips] = useState<RouletteCasa[][]>(() => REEL_REPEATS.map(() => ROULETTE_CASAS.slice(0, 3)));
  const [offsets, setOffsets] = useState<number[]>([0, 0, 0]);
  const [durations, setDurations] = useState<number[]>([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<RoulettePrize[]>(view.pending);
  const [last, setLast] = useState<RoulettePrize | null>(null);
  const [message, setMessage] = useState('');
  const [fast, setFast] = useState(readFast);
  const [turbo, setTurbo] = useState(false);
  const spinningRef = useRef(false), currentRef = useRef<RoulettePrize | null>(null), finalOffsetsRef = useRef<number[]>([0, 0, 0]);
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
    setDurations([0, 0, 0]); setOffsets(finalOffsetsRef.current); // trava os rolos no resultado (mesmo se revelado antes do fim)
    setSpinning(false); setLast(prize); setRevealed(list => [...list, prize]);
    if (heldRef.current && fastRef.current && turboRef.current) nextTimer.current = window.setTimeout(() => spinRef.current(true), 40);
  }, []);

  const spin = useCallback((fastMode: boolean) => {
    if (spinningRef.current) return;
    const r = send<SpinResult>('spin'); if (!r) return;
    if (r.view) setLive(r.view);
    if (!r.ok || !r.prize) { setMessage(r.reason ?? 'Não foi possível girar.'); turboRef.current = false; setTurbo(false); return; }
    setMessage('');
    const prize = r.prize;
    const targetIndex = Math.max(0, ROULETTE_CASAS.findIndex(c => c.id === prize.id));
    const strips = REEL_REPEATS.map(repeats => buildStrip(targetIndex, repeats));
    const finals = strips.map(s => -((s.length - 1) - 1) * CELL); // centraliza a última célula (a casa sorteada) em cada rolo
    currentRef.current = prize; spinningRef.current = true;
    // Fase 1: reposiciona os rolos SEM transição (strip reconstruído a cada giro)…
    setStrips(strips); setDurations([0, 0, 0]); setOffsets([0, 0, 0]); setSpinning(true);
    // Fase 2: após o paint, anima até o resultado com durações escalonadas por rolo.
    const ms = fastMode ? TURBO_MS : NORMAL_MS;
    finalOffsetsRef.current = finals;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!spinningRef.current) return;
      setDurations(ms); setOffsets(finals);
      window.clearTimeout(finishTimer.current);
      finishTimer.current = window.setTimeout(finish, Math.max(...ms) + 80);
    }));
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
  const mood = last ? MOOD[last.kind] : null;
  return <div className="tr-backdrop" data-testid="tsunade-roulette">
    <section className="tr-modal" role="dialog" aria-label="Caça-Níquel da Tsunade">
      <button className="tr-close" onClick={exit} aria-label="Sair e receber">×</button>
      <header className="tr-head">
        <div className={`tr-face${mood ? ' ' + mood.cls : ''}`} aria-label={`Tsunade ${mood ? mood.word : 'aguardando'}`}>
          <span className="tr-face-portrait" style={TSUNADE_FACE} aria-hidden />
          {mood && <span className="tr-face-badge" aria-hidden>{mood.badge}</span>}
        </div>
        <div className="tr-head-copy">
          <small>EVENTO · A LENDÁRIA PERDEDORA</small>
          <h1>Caça-Níquel da Tsunade</h1>
          <p>Cada giro cobra na hora e o preço sobe por giro, pelo tempo de run e pela zona. Você fica seguro durante a interação; ao sair, armadilhas shinobi explodem ao seu redor. Três símbolos iguais = combo.</p>
        </div>
      </header>
      <div className="tr-body">
        <div className="tr-wheel-col">
          <div className="tr-slot" aria-label="Caça-Níquel: 3 rolos">
            {strips.map((strip, reel) => <div key={reel} className={`tr-reel${spinning ? ' is-spinning' : ''}`} aria-hidden>
              <div className="tr-strip" style={{ transform: `translateY(${offsets[reel] ?? 0}px)`, transition: durations[reel] ? `transform ${durations[reel]}ms cubic-bezier(.18,.74,.2,1)` : 'none' }}>
                {strip.map((c, i) => <div key={i} className={`tr-cell kind-${c.kind}`}><b title={c.label}><CasaIcon id={c.id} fallback={c.icon} label={c.label} /></b></div>)}
              </div>
            </div>)}
            <div className="tr-payline" aria-hidden />
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
            <div><dt>Ryu</dt><dd title={fullRyu(live.money)}><CasaIcon id="ryu" fallback="🪙" label="Ryu" /> {fmtRyu(live.money)}</dd></div>
            <div><dt>Próximo giro</dt><dd title={fullRyu(live.cost)}>{fmtRyu(live.cost)} Ryu <small>(×{String(ROULETTE_RULES.costGrowth).replace('.', ',')}/giro · +{Math.round(ROULETTE_RULES.zoneCostWeight * 100)}%/zona · sobe com o tempo{live.discount > 0 ? ` · −${Math.round(live.discount * 100)}%` : ''})</small></dd></div>
            <div><dt>Giros na run</dt><dd>{live.spins}</dd></div>
            <div><dt>Ryu gasto na run</dt><dd title={fullRyu(live.ryuSpent)}>{fmtRyu(live.ryuSpent)}</dd></div>
            <div><dt>Sorte</dt><dd>🍀 {live.luck}</dd></div>
            <div><dt>Pressão da zona</dt><dd>⚠ {live.pressure.toFixed(2).replace('.', ',')}</dd></div>
          </dl>
          <div className="tr-odds"><b>Chances atuais</b> <span className="good">Boas {pct(good)}</span> · <span className="bad">Ruins {pct(bad)}</span>
            <ul>{ROULETTE_CASAS.map(c => <li key={c.id} className={`kind-${c.kind}`} title={c.description}><i><CasaIcon id={c.id} fallback={c.icon} label={c.label} /></i><span>{c.label}</span><em>{pct(live.weights[c.id] ?? 0)}</em></li>)}</ul>
          </div>
          <div className="tr-pending">
            <b>Ganhos desta visita · {revealed.length} giro(s) · {fmtRyu(live.sessionSpent)} Ryu</b> <small>{goods} bons · {bads} ruins</small>
            <ol>{[...revealed].reverse().map(p => <li key={p.seq} className={`kind-${p.kind}`}><i>{p.item||p.pill?<ItemIcon name={p.item??p.pill!}/>:<CasaIcon id={p.id} fallback={p.icon} label={p.label}/>}</i><span>{p.label}<small><BuffText text={p.detail}/></small></span></li>)}</ol>
            {!revealed.length && <p className="tr-empty">Nada ainda. Os resultados aparecem aqui e são entregues ao sair.</p>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
