import { useState } from 'react';
import { YOUTH_DIFFICULTIES, YOUTH_GOALS, YOUTH_STATS, YOUTH_TEXT, youthBonusText, youthChallengeText, type YouthChallengeId, type YouthDifficulty } from '../game/youthTraining';
import { HeroPortrait } from './RunSheet';

/**
 * Rodada 98 — painel do Treinamento da Juventude (pedido do usuário: "Texto: DEIXE A JUVENTUDE EXPLODIR EM SEU CORAÇÃO ·
 * Tabela · Esquerda seletor de dificuldade · 3 dificuldades · Direita TODOS OS ATRIBUTOS do jogo, eles escalam a porcentagem
 * do buff por dificuldade").
 */
export function YouthPanel({ challenge }: { challenge: YouthChallengeId | null }) {
  const [difficulty, setDifficulty] = useState<YouthDifficulty>('Normal');
  const start = () => window.dispatchEvent(new CustomEvent('shinobi-youth', { detail: difficulty }));
  const close = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
  return <div className="level-choice-backdrop youth-backdrop"><section className="youth-panel" aria-label="Treinamento da Juventude">
    <header className="youth-heading"><aside className="choice-npc"><HeroPortrait id="guy" /></aside><div><small>MIGHT GUY · TREINAMENTO DA JUVENTUDE</small><h1>{YOUTH_TEXT}</h1>{challenge && <p className="youth-challenge">🔥 Desafio: {youthChallengeText(challenge, difficulty)}</p>}</div></header>
    <div className="youth-body">
      <nav className="youth-difficulties" aria-label="Dificuldade">
        {YOUTH_DIFFICULTIES.map(d => <button key={d} type="button" aria-pressed={d === difficulty} className={'youth-difficulty youth-' + d.toLowerCase()} onClick={() => setDifficulty(d)}>
          <b>{d}</b>{challenge && <small>{youthChallengeText(challenge, d)}</small>}{challenge && <small>{YOUTH_GOALS[challenge][d].seconds} s</small>}
        </button>)}
      </nav>
      <table className="youth-stats"><thead><tr><th>Atributo</th><th>Buff ({difficulty})</th></tr></thead>
        <tbody>{YOUTH_STATS.map(stat => <tr key={stat.key}><td>{stat.label}</td><td>{youthBonusText(stat, difficulty)}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="youth-note">Vencendo o desafio, todos esses atributos sobem até o fim da missão. Um desafio por zona.</p>
    <div className="youth-actions"><button className="button primary-button" type="button" onClick={start} disabled={!challenge}>Começar · {difficulty}</button><button className="button secondary-button" type="button" onClick={close}>Agora não · X</button></div>
  </section></div>;
}

/** Faixa do desafio em andamento (topo da tela). */
export function YouthBanner({ run }: { run: { challenge: YouthChallengeId; difficulty: YouthDifficulty; timeLeft: number; progress: number; goal: number } }) {
  const label = run.challenge === 'spots' ? `${run.progress}/${run.goal} locais` : run.challenge === 'kills' ? `${run.progress}/${run.goal} abates` : run.challenge === 'nohit' ? `${Math.floor(run.progress)}/${run.goal} s sem ser acertado` : run.challenge === 'guy' ? 'Vença o Might Guy' : 'Vença o Rock Lee';
  return <div className="youth-banner" role="status">🔥 Treinamento da Juventude · {run.difficulty} · {label} · {Math.ceil(run.timeLeft)} s</div>;
}
