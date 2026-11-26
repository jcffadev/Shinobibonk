import type { Bonuses, StatKey } from './catalog';

/**
 * Treinamento da Juventude (pedido do usuário, 15/11/2026 — docs/13 item 47).
 * Might Guy fica no mapa como NPC. Ao falar com ele: "DEIXE A JUVENTUDE EXPLODIR EM SEU CORAÇÃO", seletor de dificuldade
 * (Fácil · Normal · Difícil) e, ao lado, TODOS os atributos com o buff que cada dificuldade dá. Um desafio sorteado:
 * chegar a 10 locais marcados, derrotar X monstros, não ser acertado, vencer o Might Guy ou vencer o Lee.
 * Vencer dá o buff em todos os atributos até o fim da missão. Valores PROPOSTOS — calibrar no simulador.
 * 26/11/2026 — usuário: "Fazer uma telinha mais bonita no treino do Might Guy e ser possível selecionar apenas 1 buff, ele está buffando a ficha inteira, não deveria ser possível, aumentar a % dos buffs de todos os níveis de dificuldade para compensar": o jogador escolhe 1 atributo antes do desafio e só ele sobe; a força por dificuldade ficou ×4 (era 1 / 2 / 4).
 */
export type YouthDifficulty = 'Fácil' | 'Normal' | 'Difícil';
export const YOUTH_DIFFICULTIES: readonly YouthDifficulty[] = ['Fácil', 'Normal', 'Difícil'];
export const YOUTH_TEXT = 'DEIXE A JUVENTUDE EXPLODIR EM SEU CORAÇÃO';

/** Força do buff por dificuldade (multiplica a escala de cada atributo). */
export const YOUTH_POWER: Record<YouthDifficulty, number> = { Fácil: 4, Normal: 8, Difícil: 16 };

/** Todos os atributos da ficha e quanto cada um ganha com força 1 (Fácil). */
export const YOUTH_STATS: readonly { key: StatKey; label: string; step: number; unit: '%' | 'pp' | '' }[] = [
  { key: 'healthPct', label: 'HP máximo', step: .03, unit: '%' },
  { key: 'damage', label: 'Dano total', step: .03, unit: '%' },
  { key: 'normal', label: 'Dano de Taijutsu', step: .03, unit: '%' },
  { key: 'element', label: 'Dano de Ninjutsu', step: .03, unit: '%' },
  { key: 'attackSpeed', label: 'Velocidade de ataque', step: .02, unit: '%' },
  { key: 'crit', label: 'Chance crítica', step: .01, unit: 'pp' },
  { key: 'critDamage', label: 'Dano crítico', step: .05, unit: '%' },
  { key: 'area', label: 'Área', step: .02, unit: '%' },
  { key: 'cool', label: 'Recarga', step: .02, unit: '%' },
  { key: 'duration', label: 'Duração de status', step: .03, unit: '%' },
  { key: 'status', label: 'Chance de status', step: .01, unit: 'pp' },
  { key: 'projectileSpeed', label: 'Velocidade de projétil', step: .03, unit: '%' },
  { key: 'move', label: 'Movimento', step: .02, unit: '%' },
  { key: 'dodge', label: 'Evasão', step: .005, unit: 'pp' },
  { key: 'defense', label: 'Armadura', step: 2, unit: '' },
  { key: 'regen', label: 'Regeneração de HP/s', step: .2, unit: '' },
  { key: 'exp', label: 'Experiência', step: .03, unit: '%' },
  { key: 'gold', label: 'Ryu', step: .03, unit: '%' },
  { key: 'luck', label: 'Sorte', step: 3, unit: '' },
  { key: 'pickup', label: 'Coleta', step: .05, unit: '%' },
];

export const YOUTH_STAT_BY_KEY = Object.fromEntries(YOUTH_STATS.map(s => [s.key, s])) as Partial<Record<StatKey, (typeof YOUTH_STATS)[number]>>;
/** Atributo válido do treino (o padrão é Dano total). */
export const youthStat = (key: unknown): StatKey => typeof key === 'string' && key in YOUTH_STAT_BY_KEY ? key as StatKey : 'damage';
/** Buff do treino: só o atributo escolhido, na força da dificuldade. */
export function youthBonuses(difficulty: YouthDifficulty, stat: StatKey): Bonuses {
  const def = YOUTH_STAT_BY_KEY[youthStat(stat)]!;
  return { [def.key]: def.step * YOUTH_POWER[difficulty] };
}
/** Texto do buff (tabela à direita). */
export function youthBonusText(stat: (typeof YOUTH_STATS)[number], difficulty: YouthDifficulty) {
  const value = stat.step * YOUTH_POWER[difficulty];
  const shown = stat.unit === '' ? value : value * 100;
  return '+' + shown.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + (stat.unit === '%' ? '%' : stat.unit === 'pp' ? ' p.p.' : '');
}

export type YouthChallengeId = 'spots' | 'kills' | 'nohit' | 'guy' | 'lee';
export const YOUTH_CHALLENGES: readonly YouthChallengeId[] = ['spots', 'kills', 'nohit', 'guy', 'lee'];
/** Meta e tempo de cada desafio por dificuldade. */
export const YOUTH_GOALS: Record<YouthChallengeId, Record<YouthDifficulty, { goal: number; seconds: number }>> = {
  spots: { Fácil: { goal: 10, seconds: 90 }, Normal: { goal: 10, seconds: 75 }, Difícil: { goal: 10, seconds: 60 } },
  kills: { Fácil: { goal: 100, seconds: 120 }, Normal: { goal: 200, seconds: 150 }, Difícil: { goal: 400, seconds: 180 } },
  nohit: { Fácil: { goal: 30, seconds: 30 }, Normal: { goal: 45, seconds: 45 }, Difícil: { goal: 60, seconds: 60 } },
  guy: { Fácil: { goal: 1, seconds: 120 }, Normal: { goal: 1, seconds: 100 }, Difícil: { goal: 1, seconds: 80 } },
  lee: { Fácil: { goal: 1, seconds: 120 }, Normal: { goal: 1, seconds: 100 }, Difícil: { goal: 1, seconds: 80 } },
};
/** Vida do Guy/Lee do desafio: multiplicador sobre o Mega Elite normal. */
export const YOUTH_FIGHTER_HP: Record<YouthDifficulty, number> = { Fácil: .7, Normal: 1, Difícil: 1.6 };

export function youthChallengeText(id: YouthChallengeId, difficulty: YouthDifficulty) {
  const { goal, seconds } = YOUTH_GOALS[id][difficulty];
  if (id === 'spots') return `Chegue aos ${goal} locais marcados no mapa em ${seconds} s.`;
  if (id === 'kills') return `Derrote ${goal} monstros em ${seconds} s.`;
  if (id === 'nohit') return `Fique ${goal} s sem ser acertado por nenhum monstro.`;
  if (id === 'guy') return `Derrote o Might Guy numa luta em até ${seconds} s.`;
  return `Derrote o Rock Lee numa luta em até ${seconds} s.`;
}

export const rollYouthChallenge = (rng: () => number = Math.random): YouthChallengeId => YOUTH_CHALLENGES[Math.min(YOUTH_CHALLENGES.length - 1, Math.floor(rng() * YOUTH_CHALLENGES.length))];

/** Locais marcados: espalhados entre `min` e `max` m do jogador, longe uns dos outros. */
export function youthSpots(x: number, z: number, count: number, rng: () => number = Math.random, min = 8, max = 26) {
  const spots: { x: number; z: number }[] = [];
  for (let tries = 0; spots.length < count && tries < count * 40; tries++) {
    const angle = rng() * Math.PI * 2, radius = min + rng() * (max - min), p = { x: x + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius };
    if (spots.every(s => Math.hypot(s.x - p.x, s.z - p.z) >= 4)) spots.push(p);
  }
  return spots;
}

export type YouthRun = { challenge: YouthChallengeId; difficulty: YouthDifficulty; timeLeft: number; progress: number; goal: number; stat?: StatKey };
/** Avança o tempo; devolve 'win', 'lose' ou null. `nohit` vence quando o tempo acaba sem golpe. */
export function tickYouth(run: YouthRun, dt: number): 'win' | 'lose' | null {
  run.timeLeft = Math.max(0, run.timeLeft - dt);
  if (run.challenge === 'nohit') { run.progress = YOUTH_GOALS.nohit[run.difficulty].seconds - run.timeLeft; return run.timeLeft <= 0 ? 'win' : null; }
  if (run.progress >= run.goal) return 'win';
  return run.timeLeft <= 0 ? 'lose' : null;
}
