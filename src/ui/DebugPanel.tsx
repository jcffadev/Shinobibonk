import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import '../debug.css';
import { ITEMS } from '../game/catalog';
import { HEROES } from '../game/heroes';
import { PILL_NAMES } from '../game/pills';
import type { Stats } from '../game/progression';
import { TUNING_FIELDS, DEFAULT_TUNING, dropChance, isDefaultTuning, replaceTuning, resetTuning, setTuning, subscribeTuning, tuning, type Tuning, type TuningGroup } from '../game/tuning';

const GROUPS: TuningGroup[] = ['Inimigos', 'Personagem', 'Ganhos', 'Drops'];
const pct = (value: number) => (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

/** Valores lidos ao vivo da simulação pelo painel debug. */
export type DebugLive = {
  hp: number; maxHp: number; level: number; xp: number; xpNext: number; chakra: number; runMoney: number;
  elapsed: number; zone: number; enemies: number; megaElites: number; kills: number; god: boolean; frozen: boolean;
  stats: Stats; threat: { hp: number; damage: number; speed: number; attackRate: number; spawnInterval: number; cap: number };
  items: Record<string, number>; pills: Record<string, number>;
};
/** Ganchos de debug criados dentro da simulação do GameCanvas (só existem no servidor de desenvolvimento). */
export type DebugApi = {
  inspect(): DebugLive;
  grantItem(name: string): void;
  grantPill(name: string): void;
  levelUp(): void;
  setLevel(level: number): void;
  heal(): void;
  setGod(on: boolean): void;
  fillChakra(): void;
  addMoney(amount: number): void;
  spawnMega(heroId: string): void;
  clearEnemies(): void;
  advanceTime(seconds: number): void;
  setFrozen(on: boolean): void;
};

// Lista de pílulas vem do catálogo em src/game/pills.ts.
const BASE_PILLS = PILL_NAMES;
const fmt = (value: number, digits = 1) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
/** F9 ou a tecla à esquerda do "1" (código Backquote: ` no teclado US, ' no ABNT2). */
export const isDebugToggleKey = (event: KeyboardEvent) => event.key === 'F9' || event.code === 'Backquote';

export function DebugPanel({ getApi }: { getApi: () => DebugApi | null }) {
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState<DebugLive | null>(null);
  const [values, setValues] = useState<Tuning>(() => ({ ...tuning }));
  const [item, setItem] = useState(ITEMS[0]?.name ?? '');
  const [pill, setPill] = useState(BASE_PILLS[0]);
  const [mega, setMega] = useState(HEROES[0]?.id ?? 'naruto');
  const [money, setMoney] = useState(100);
  const [seconds, setSeconds] = useState(30);
  const [targetLevel, setTargetLevel] = useState(10);

  useEffect(() => subscribeTuning(() => setValues({ ...tuning })), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isDebugToggleKey(event) || event.repeat) return;
      if (event.target instanceof HTMLElement && event.target.matches('input[type=text],input[type=number],textarea')) return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    const read = () => setLive(getApi()?.inspect() ?? null);
    read();
    const timer = window.setInterval(read, 250);
    return () => window.clearInterval(timer);
  }, [open, getApi]);

  // Executa a ação e tira o foco do botão (Enter/Espaço não podem repetir a ação durante o jogo).
  const act = (fn: (api: DebugApi) => void) => (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.blur();
    const api = getApi(); if (!api) return;
    fn(api); setLive(api.inspect());
  };
  const pillOptions = BASE_PILLS;
  const [notice, setNotice] = useState('');
  const copyJson = async () => {
    const text = JSON.stringify(tuning, null, 2);
    try { await navigator.clipboard.writeText(text); setNotice('Parâmetros copiados (JSON).'); } catch { window.prompt('Copie os parâmetros:', text); }
  };
  const pasteJson = () => {
    const text = window.prompt('Cole o JSON de parâmetros (campos ausentes voltam ao padrão):');
    if (!text) return;
    try { replaceTuning(JSON.parse(text)); setNotice('Parâmetros aplicados e salvos.'); } catch { setNotice('JSON inválido; nada mudou.'); }
  };
  const tuned = !isDefaultTuning(values);

  if (!open) return <button className={`debug-toggle ${tuned ? 'tuned' : ''}`} title="Painel debug (F9 ou a tecla à esquerda do 1)" onClick={(e) => { e.currentTarget.blur(); setOpen(true); }}>DEBUG · F9{tuned ? ' · ajustes ativos' : ''}</button>;

  const s = live?.stats;
  return <aside className="debug-panel" aria-label="Painel debug de balanceamento">
    <header><div><small>BALANCEAMENTO · TEMPO REAL</small><h2>Modo debug</h2></div><button onClick={() => setOpen(false)} title="Fechar (F9)">×</button></header>

    <Section title="Leitura ao vivo">
      {live && s ? <div className="debug-live">
        <span>HP <b>{fmt(live.hp, 0)}/{fmt(live.maxHp, 0)}</b></span>
        <span>Nível <b>{live.level}</b> · XP <b>{fmt(live.xp, 0)}/{live.xpNext}</b></span>
        <span>Chakra <b>{fmt(live.chakra, 0)}%</b></span>
        <span>Ryu <b>{live.runMoney}</b></span>
        <span>Tempo <b>{Math.floor(live.elapsed / 60)}:{String(Math.floor(live.elapsed % 60)).padStart(2, '0')}</b> · Zona <b>{live.zone}</b></span>
        <span>Inimigos <b>{live.enemies}</b> / teto <b>{live.threat.cap}</b> · mega <b>{live.megaElites}</b></span>
        <span>Abates <b>{live.kills}</b></span>
        <span>Ameaça HP ×<b>{fmt(live.threat.hp, 2)}</b> · dano ×<b>{fmt(live.threat.damage, 2)}</b></span>
        <span>Vel. inimigo ×<b>{fmt(live.threat.speed, 2)}</b> · spawn a cada <b>{fmt(live.threat.spawnInterval, 2)} s</b></span>
        <span>Dano <b>{fmt(s.damage)}</b> · Armadura <b>{fmt(s.armor)}</b></span>
        <span>Vel. ataque ×<b>{fmt(s.attackSpeed, 2)}</b> · Mov. <b>{fmt(s.moveSpeed, 2)}</b></span>
        <span>Crítico <b>{fmt(s.crit * 100)}%</b> · ×<b>{fmt(s.critDamage, 2)}</b></span>
        <span>Evasão <b>{fmt(s.evasion * 100)}%</b> · Regen <b>{fmt(s.regen, 2)}/s</b></span>
        <span>Sorte <b>{s.luck}</b> · Área ×<b>{fmt(s.area, 2)}</b> · Proj. <b>{fmt(s.projectiles, 0)}</b></span>
        <span>XP ×<b>{fmt(s.xpGain, 2)}</b> · Ryu ×<b>{fmt(s.moneyGain, 2)}</b> · Ult ×<b>{fmt(s.ultimateRate, 2)}</b></span>
      </div> : <p className="debug-note">Inicie uma missão para ler os valores.</p>}
    </Section>

    {GROUPS.map((group) => <Section title={group} key={group}>
      {TUNING_FIELDS.filter((field) => field.group === group).map((field) => <label className="debug-slider" key={field.key}>
        <span>{field.label}<b className={values[field.key] !== DEFAULT_TUNING[field.key] ? 'changed' : ''}>×{fmt(values[field.key], 2)}</b></span>
        <input type="range" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(e) => setTuning(field.key, Number(e.target.value))} onPointerUp={(e) => e.currentTarget.blur()} />
        {/* Campo numérico confirma no Enter ou ao sair do campo, para permitir digitar valores como 0,5. */}
        <input key={values[field.key]} type="number" min={field.min} max={field.max} step={field.step} defaultValue={values[field.key]} onBlur={(e) => setTuning(field.key, Number(e.target.value))} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
      </label>)}
      {group === 'Drops' && <p className="debug-note">Chance efetiva por abate: Ryu {pct(dropChance(.72, values.ryuDrop))} · Chakra {pct(dropChance(.28, values.chakraDrop))} · pílula {pct(dropChance(.015, values.pillDrop))} · item {pct(dropChance(.018, values.itemDrop))} (Ryu antes da Maldição/Provocação).</p>}
    </Section>)}
    <Section title="Parâmetros salvos">
      <div className="debug-row">
        <button onClick={(e) => { e.currentTarget.blur(); resetTuning(); setNotice('Padrões restaurados.'); }}>Restaurar padrões</button>
        <button onClick={(e) => { e.currentTarget.blur(); void copyJson(); }}>Copiar JSON</button>
        <button onClick={(e) => { e.currentTarget.blur(); pasteJson(); }}>Colar JSON</button>
      </div>
      {notice && <p className="debug-note">{notice}</p>}
      <p className="debug-note">Cada ajuste vale na hora, no meio da run, e fica salvo neste navegador. Os valores salvos passam a ser o balanceamento de todas as próximas runs, mesmo com o painel fechado, até restaurar os padrões.</p>
    </Section>

    <Section title="Jogador">
      <div className="debug-row">
        <button onClick={act((api) => api.heal())}>Curar</button>
        <button className={live?.god ? 'on' : ''} onClick={act((api) => api.setGod(!live?.god))}>{live?.god ? 'God mode ON' : 'God mode'}</button>
        <button onClick={act((api) => api.fillChakra())}>Encher Chakra</button>
        <button onClick={act((api) => api.levelUp())}>+1 nível (cartas)</button>
      </div>
      <div className="debug-row">
        <input type="number" min={1} max={99} value={targetLevel} onChange={(e) => setTargetLevel(Number(e.target.value))} />
        <button onClick={act((api) => api.setLevel(targetLevel))}>Definir nível</button>
        <input type="number" min={1} step={10} value={money} onChange={(e) => setMoney(Number(e.target.value))} />
        <button onClick={act((api) => api.addMoney(money))}>+ Ryu</button>
      </div>
    </Section>

    <Section title="Itens e pílulas">
      <div className="debug-row">
        <select value={item} onChange={(e) => setItem(e.target.value)}>{ITEMS.map((entry) => <option key={entry.id} value={entry.name}>{entry.name} · {entry.rarity} ({live?.items[entry.name] ?? 0}/{entry.max})</option>)}</select>
        <button onClick={act((api) => api.grantItem(item))}>Dar item</button>
      </div>
      <div className="debug-row">
        <select value={pill} onChange={(e) => setPill(e.target.value)}>{pillOptions.map((name) => <option key={name} value={name}>{name} ({live?.pills[name] ?? 0})</option>)}</select>
        <button onClick={act((api) => api.grantPill(pill))}>Dar pílula</button>
      </div>
    </Section>

    <Section title="Mundo">
      <div className="debug-row">
        <select value={mega} onChange={(e) => setMega(e.target.value)}>{HEROES.map((hero) => <option key={hero.id} value={hero.id}>{hero.name}</option>)}</select>
        <button onClick={act((api) => api.spawnMega(mega))}>Gerar mega elite</button>
      </div>
      <div className="debug-row">
        <button onClick={act((api) => api.clearEnemies())}>Limpar inimigos</button>
        <input type="number" min={1} step={10} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} />
        <button onClick={act((api) => api.advanceTime(seconds))}>Avançar tempo (s)</button>
        <button className={live?.frozen ? 'on' : ''} onClick={act((api) => api.setFrozen(!live?.frozen))}>{live?.frozen ? 'Retomar' : 'Congelar'}</button>
      </div>
    </Section>
    <p className="debug-note">F9 (ou a tecla à esquerda do 1) abre/fecha. Disponível só ao rodar o jogo localmente (pnpm dev).</p>
  </aside>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="debug-section"><h3>{title}</h3>{children}</section>;
}
