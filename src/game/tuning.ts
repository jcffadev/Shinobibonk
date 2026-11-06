// Parâmetros de balanceamento ajustados pelo modo debug (F9).
// Valor 1 = balanceamento padrão. Os valores salvos em localStorage (sb_debug_tuning_v1) valem em
// TODAS as runs deste navegador, com ou sem o painel aberto: o que foi salvo no debug passa a ser o
// balanceamento do jogo até "Restaurar padrões". Alterações valem na hora, no meio da run.
// Os valores salvos valem como base GENIN; Chunin/Jonin/Kage multiplicam por cima (MISSION_TIER em progression.ts),
// então o balanceamento feito no Genin se propaga naturalmente para as dificuldades seguintes.
import type { difficultyAt } from './progression';

export type TuningKey =
  | 'enemyHp' | 'enemyDamage' | 'enemySpeed' | 'spawnRate' | 'enemyCap'
  | 'eliteRate' | 'eliteHp' | 'eliteDamage' | 'eliteDefense' | 'megaHp' | 'megaDamage' | 'megaDefense' | 'megaRate' | 'accountHp'
  | 'playerDamage' | 'playerHp' | 'playerArmor' | 'playerMove' | 'playerAttackSpeed' | 'playerProjectileSpeed' | 'playerArea'
  | 'playerCrit' | 'playerCritDamage' | 'playerRegen' | 'playerPickup' | 'playerLuck' | 'ultimateRate'
  | 'xpGain' | 'xpCurve' | 'moneyGain' | 'chakraGain' | 'eliteLoot' | 'megaLoot'
  | 'ryuDrop' | 'chakraDrop' | 'pillDrop' | 'itemDrop' | 'ramenDrop' | 'ramenHeal' | 'mapPickups' | 'kunaiPrice';
export type Tuning = Record<TuningKey, number>;
export type TuningGroup = 'Inimigos' | 'Elites e Mega Elites' | 'Personagem' | 'Ganhos' | 'Drops e mapa';
export const TUNING_GROUPS: TuningGroup[] = ['Inimigos', 'Elites e Mega Elites', 'Personagem', 'Ganhos', 'Drops e mapa'];

export const TUNING_STORAGE_KEY = 'sb_debug_tuning_v1';

/** Rótulos, grupos e limites usados pelo painel debug. Todos são multiplicadores (1 = padrão). */
export const TUNING_FIELDS: { key: TuningKey; group: TuningGroup; label: string; min: number; max: number; step: number }[] = [
  { key: 'enemyHp', group: 'Inimigos', label: 'HP dos inimigos (inclui os vivos)', min: 0.1, max: 10, step: 0.05 },
  { key: 'enemyDamage', group: 'Inimigos', label: 'Dano dos inimigos', min: 0, max: 10, step: 0.05 },
  { key: 'enemySpeed', group: 'Inimigos', label: 'Velocidade dos inimigos', min: 0.1, max: 4, step: 0.05 },
  { key: 'spawnRate', group: 'Inimigos', label: 'Taxa de spawn', min: 0.1, max: 10, step: 0.05 },
  { key: 'enemyCap', group: 'Inimigos', label: 'Teto de inimigos vivos', min: 0.1, max: 10, step: 0.05 },
  { key: 'eliteRate', group: 'Elites e Mega Elites', label: 'Chance de elite amarelo (base 8%)', min: 0, max: 8, step: 0.05 },
  { key: 'eliteHp', group: 'Elites e Mega Elites', label: 'HP do elite amarelo', min: 0.1, max: 10, step: 0.05 },
  { key: 'eliteDamage', group: 'Elites e Mega Elites', label: 'Dano do elite amarelo', min: 0, max: 10, step: 0.05 },
  { key: 'eliteDefense', group: 'Elites e Mega Elites', label: 'Defesa do elite (base 30%)', min: 0, max: 3, step: 0.05 },
  { key: 'megaHp', group: 'Elites e Mega Elites', label: 'HP do Mega Elite', min: 0.1, max: 10, step: 0.05 },
  { key: 'megaDamage', group: 'Elites e Mega Elites', label: 'Dano do Mega Elite', min: 0, max: 10, step: 0.05 },
  { key: 'megaDefense', group: 'Elites e Mega Elites', label: 'Defesa do Mega Elite (base 55%)', min: 0, max: 1.7, step: 0.05 },
  { key: 'megaRate', group: 'Elites e Mega Elites', label: 'Frequência de Mega Elites', min: 0.1, max: 6, step: 0.05 },
  { key: 'accountHp', group: 'Elites e Mega Elites', label: 'HP do Shinobi para selar', min: 0.1, max: 10, step: 0.05 },
  { key: 'playerDamage', group: 'Personagem', label: 'Dano do personagem', min: 0.1, max: 20, step: 0.05 },
  { key: 'playerHp', group: 'Personagem', label: 'HP máximo', min: 0.1, max: 10, step: 0.05 },
  { key: 'playerArmor', group: 'Personagem', label: 'Armadura', min: 0, max: 10, step: 0.05 },
  { key: 'playerMove', group: 'Personagem', label: 'Movimento', min: 0.2, max: 4, step: 0.05 },
  { key: 'playerAttackSpeed', group: 'Personagem', label: 'Velocidade de ataque', min: 0.2, max: 6, step: 0.05 },
  { key: 'playerProjectileSpeed', group: 'Personagem', label: 'Velocidade de projétil', min: 0.2, max: 6, step: 0.05 },
  { key: 'playerArea', group: 'Personagem', label: 'Área', min: 0.2, max: 6, step: 0.05 },
  { key: 'playerCrit', group: 'Personagem', label: 'Chance crítica', min: 0, max: 10, step: 0.05 },
  { key: 'playerCritDamage', group: 'Personagem', label: 'Dano crítico', min: 0.2, max: 6, step: 0.05 },
  { key: 'playerRegen', group: 'Personagem', label: 'Regeneração', min: 0, max: 20, step: 0.05 },
  { key: 'playerPickup', group: 'Personagem', label: 'Área de coleta (ímã)', min: 0.2, max: 8, step: 0.05 },
  { key: 'playerLuck', group: 'Personagem', label: 'Sorte', min: 0, max: 10, step: 0.05 },
  { key: 'ultimateRate', group: 'Personagem', label: 'Recarga da Ultimate', min: 0, max: 20, step: 0.05 },
  { key: 'xpGain', group: 'Ganhos', label: 'EXP ganha', min: 0, max: 20, step: 0.05 },
  { key: 'xpCurve', group: 'Ganhos', label: 'EXP necessária por nível', min: 0.1, max: 10, step: 0.05 },
  { key: 'moneyGain', group: 'Ganhos', label: 'Ryu por coleta', min: 0, max: 20, step: 0.05 },
  { key: 'chakraGain', group: 'Ganhos', label: 'Chakra por orbe (base 9%)', min: 0, max: 10, step: 0.05 },
  { key: 'eliteLoot', group: 'Ganhos', label: 'Saque do elite amarelo', min: 0, max: 10, step: 0.05 },
  { key: 'megaLoot', group: 'Ganhos', label: 'Saque do Mega Elite', min: 0, max: 10, step: 0.05 },
  { key: 'ryuDrop', group: 'Drops e mapa', label: 'Chance de drop de Ryu (base 72%)', min: 0, max: 2, step: 0.05 },
  { key: 'chakraDrop', group: 'Drops e mapa', label: 'Chance de drop de Chakra (base 28%)', min: 0, max: 3.5, step: 0.05 },
  { key: 'pillDrop', group: 'Drops e mapa', label: 'Chance de drop de pílula (base 1,5%)', min: 0, max: 30, step: 0.1 },
  { key: 'itemDrop', group: 'Drops e mapa', label: 'Drop de item por abate (DESATIVADO: itens só por kunai/shuriken/eventos)', min: 0, max: 30, step: 0.1 },
  { key: 'ramenDrop', group: 'Drops e mapa', label: 'Chance de lamen de cura (teto de 5%)', min: 0, max: 1, step: 0.05 },
  { key: 'ramenHeal', group: 'Drops e mapa', label: 'Cura do lamen (base 35% do HP)', min: 0, max: 2.8, step: 0.05 },
  { key: 'mapPickups', group: 'Drops e mapa', label: 'Kunais/shurikens/Ryu no chão (início da run)', min: 0, max: 6, step: 0.05 },
  { key: 'kunaiPrice', group: 'Drops e mapa', label: 'Preço para abrir kunai/shuriken', min: 0, max: 5, step: 0.05 },
];

export const DEFAULT_TUNING: Readonly<Tuning> = Object.freeze(Object.fromEntries(TUNING_FIELDS.map((f) => [f.key, 1])) as Tuning);
function sanitize(raw: unknown): Tuning {
  const next: Tuning = { ...DEFAULT_TUNING };
  if (raw && typeof raw === 'object') {
    for (const field of TUNING_FIELDS) {
      const value = (raw as Record<string, unknown>)[field.key];
      if (typeof value === 'number' && Number.isFinite(value)) next[field.key] = Math.max(field.min, Math.min(field.max, value));
    }
  }
  return next;
}

function load(): Tuning {
  try { const saved = localStorage.getItem(TUNING_STORAGE_KEY); return sanitize(saved ? JSON.parse(saved) : null); } catch { return { ...DEFAULT_TUNING }; }
}

/** Objeto mutável único lido pela simulação a cada quadro; alterações valem na hora, sem recarregar. */
export const tuning: Tuning = load();

const listeners = new Set<() => void>();
export function subscribeTuning(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function persist() {
  try { localStorage.setItem(TUNING_STORAGE_KEY, JSON.stringify(tuning)); } catch { /* armazenamento indisponível: vale só nesta sessão */ }
  listeners.forEach((listener) => listener());
}
export function setTuning(key: TuningKey, value: number) {
  const field = TUNING_FIELDS.find((f) => f.key === key);
  if (!field || !Number.isFinite(value)) return;
  tuning[key] = Math.max(field.min, Math.min(field.max, value));
  persist();
}
export function resetTuning() { Object.assign(tuning, DEFAULT_TUNING); persist(); }
/** Substitui todos os valores (ex.: JSON colado no painel). Campos ausentes voltam ao padrão. */
export function replaceTuning(raw: unknown) { Object.assign(tuning, sanitize(raw)); persist(); }
export function isDefaultTuning(t: Readonly<Tuning> = tuning) { return TUNING_FIELDS.every((f) => t[f.key] === DEFAULT_TUNING[f.key]); }

/** Parâmetros em vigor: sempre os salvos (padrão = todos 1). */
export function activeTuning(): Readonly<Tuning> { return tuning; }

type Threat = ReturnType<typeof difficultyAt>;
/** Aplica os multiplicadores sobre o resultado de `difficultyAt` (HP, dano, velocidade, spawn e teto). */
export function tuneThreat(threat: Threat, t: Readonly<Tuning>): Threat {
  return {
    ...threat,
    hp: threat.hp * t.enemyHp,
    damage: threat.damage * t.enemyDamage,
    speed: threat.speed * t.enemySpeed,
    spawnInterval: threat.spawnInterval / Math.max(0.01, t.spawnRate),
    cap: Math.max(1, Math.round(threat.cap * t.enemyCap)),
  };
}

/** Probabilidade de drop ajustada e limitada a [0, 1]. */
export function dropChance(base: number, multiplier: number) { return Math.max(0, Math.min(1, base * multiplier)); }
