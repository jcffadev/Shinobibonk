import { useState } from 'react';
import type { StatKey } from '../game/catalog';
import { YOUTH_DIFFICULTIES, YOUTH_GOALS, YOUTH_STATS, YOUTH_STAT_BY_KEY, YOUTH_TEXT, youthBonusText, youthChallengeText, type YouthChallengeId, type YouthDifficulty } from '../game/youthTraining';
import { HeroPortrait } from './RunSheet';

/**
 * Painel do Treinamento da Juventude (Rodada 98). 26/11/2026 — usuário: "Fazer uma telinha mais bonita no treino do Might Guy e ser possível selecionar apenas 1 buff, ele está buffando a ficha inteira, não deveria ser possível, aumentar a % dos buffs de todos os níveis de dificuldade para compensar":
 * à esquerda a dificuldade, à direita os atributos em cartões; o jogador escolhe UM e só ele sobe ao vencer.
 */
export function YouthPanel({ challenge }: { challenge: YouthChallengeId | null }) {
  const [difficulty, setDifficulty] = useState<YouthDifficulty>('Normal');
  const [stat, setStat] = useState<StatKey>('damage');
  const chosen = YOUTH_STAT_BY_KEY[stat]!;
  const start = () => window.dispatchEvent(new CustomEvent('shinobi-youth', { detail: { difficulty, stat } }));
  const close = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
  return <div className="level-choice-backdrop youth-backdrop"><section className="youth-panel" aria-label="Treinamento da Juventude">
    <header className="youth-heading"><aside className="choice-npc"><HeroPortrait id="guy" /></aside><div><small>MIGHT GUY · TREINAMENTO DA JUVENTUDE</small><h1>{YOUTH_TEXT}</h1>{challenge && <p className="youth-challenge">🔥 Desafio: {youthChallengeText(challenge, difficulty)}</p>}</div></header>
    <div className="youth-body">
      <nav className="youth-difficulties" aria-label="Dificuldade">
        {YOUTH_DIFFICULTIES.map(d => <button key={d} type="button" aria-pressed={d === difficulty} className={'youth-difficulty youth-' + d.toLowerCase()} onClick={() => setDifficulty(d)}>
          <b>{d}</b>{challenge && <small>{youthChallengeText(challenge, d)}</small>}{challenge && <small>⏱ {YOUTH_GOALS[challenge][d].seconds} s</small>}
        </button>)}
      </nav>
      <div className="youth-pick">
        <p className="youth-pick-title">Escolha <b>1 atributo</b> para treinar</p>
        <div className="youth-stat-grid" role="radiogroup" aria-label="Atributo do treino">
          {YOUTH_STATS.map(s => <button key={s.key} type="button" role="radio" aria-checked={s.key === stat} className="youth-stat-card" onClick={() => setStat(s.key)}>
            <span>{s.label}</span><b>{youthBonusText(s, difficulty)}</b>
          </button>)}
        </div>
      </div>
    </div>
    <p className="youth-note">Vencendo o desafio, <b>{chosen.label}</b> sobe <b>{youthBonusText(chosen, difficulty)}</b> até o fim da missão. Um desafio por zona.</p>
    <div className="youth-actions"><button className="button primary-button" type="button" onClick={start} disabled={!challenge}>Começar · {difficulty} · {chosen.label}</button><button className="button secondary-button" type="button" onClick={close}>Agora não · X</button></div>
  </section></div>;
}

/** Faixa do desafio em andamento (topo da tela). */
export function YouthBanner({ run }: { run: { challenge: YouthChallengeId; difficulty: YouthDifficulty; timeLeft: number; progress: number; goal: number; stat?: StatKey } }) {
  const label = run.challenge === 'spots' ? `${run.progress}/${run.goal} locais` : run.challenge === 'kills' ? `${run.progress}/${run.goal} abates` : run.challenge === 'nohit' ? `${Math.floor(run.progress)}/${run.goal} s sem ser acertado` : run.challenge === 'guy' ? 'Vença o Might Guy' : 'Vença o Rock Lee';
  const stat = run.stat ? YOUTH_STAT_BY_KEY[run.stat] : undefined;
  return <div className="youth-banner" role="status">🔥 Treinamento da Juventude · {run.difficulty}{stat ? ' · ' + stat.label : ''} · {label} · {Math.ceil(run.timeLeft)} s</div>;
}
