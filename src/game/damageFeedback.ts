/**
 * Retorno de dano no jogador (rodada 83, pedido do usuário: "a tela piscando vermelho… em jogo de FPS, que os cantos da
 * tela dão umas piscadas em vermelho… mais o som do hit recebido pelo personagem principal").
 *
 * Lógica pura (sem DOM, sem áudio, sem Three.js): o GameCanvas só chama estas funções e aplica o resultado na vinheta
 * `.player-damage-vignette` (gradiente radial vermelho só nas bordas) e no som `playHurt`.
 * - Intensidade do piscar cresce com o dano em relação à vida máxima e some em `flashMs`.
 * - Limite de frequência: com vários monstros batendo, um novo piscar só começa depois de `minGapMs`; golpes no meio só
 *   reforçam o piscar atual (sem reiniciar o brilho) — não vira estroboscópio.
 * - Vida baixa: abaixo de `lowHpRatio` fica uma vinheta fraca e contínua, com pulso lento.
 * - Som: no máximo um "hit recebido" a cada `sfxGapMs`, com volume = volume geral × volume de efeitos.
 */
export const DAMAGE_FEEDBACK = {
  /** Duração do piscar (ms). */
  flashMs: 420,
  /** Intervalo mínimo entre o início de dois piscares (ms). */
  minGapMs: 360,
  /** Opacidade mínima de um golpe qualquer e teto do piscar. */
  minStrength: .3,
  maxStrength: .9,
  /** Quanto cada fração da vida máxima perdida soma à opacidade (10% da vida → +0,24). */
  damageScale: 2.4,
  /** Abaixo desta fração da vida a vinheta fraca e contínua aparece. */
  lowHpRatio: .3,
  /** Opacidade da vinheta de vida baixa: no limite (`lowHpMin`) e quase sem vida (`lowHpMax`). */
  lowHpMin: .12,
  lowHpMax: .34,
  /** Pulso lento da vida baixa (vezes por segundo) e quanto ele varia. */
  lowHpPulseHz: 1.1,
  lowHpPulseDepth: .25,
  /** Com H (efeitos ocultos) a vinheta fica mais discreta. */
  hiddenEffectsFactor: .55,
  /** Intervalo mínimo entre dois sons de "hit recebido" (ms). */
  sfxGapMs: 320,
} as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

/** Opacidade do piscar para um golpe: 0 sem dano; senão entre `minStrength` e `maxStrength`, crescendo com dano/vida máxima. */
export function flashStrength(damage: number, maxHp: number): number {
  if (!(damage > 0)) return 0;
  const fraction = damage / Math.max(1, maxHp);
  return Math.min(DAMAGE_FEEDBACK.maxStrength, DAMAGE_FEEDBACK.minStrength + fraction * DAMAGE_FEEDBACK.damageScale);
}

export type DamageFlash = { startedAt: number; strength: number };
export const createDamageFlash = (): DamageFlash => ({ startedAt: -Infinity, strength: 0 });

/** Opacidade do piscar no instante `now` (cai em linha reta até zero em `flashMs`). */
export function flashOpacity(flash: DamageFlash, now: number): number {
  const age = now - flash.startedAt;
  if (!(age >= 0) || age >= DAMAGE_FEEDBACK.flashMs) return 0;
  return flash.strength * (1 - age / DAMAGE_FEEDBACK.flashMs);
}

/**
 * Registra um golpe recebido. Retorna `true` se começou um piscar novo.
 * Dentro de `minGapMs` do último início o piscar não reinicia (anti-estroboscópio); um golpe mais forte só eleva a
 * intensidade do piscar em andamento, sem fazer o brilho voltar ao topo.
 */
export function registerHit(flash: DamageFlash, now: number, damage: number, maxHp: number): boolean {
  const strength = flashStrength(damage, maxHp);
  if (strength <= 0) return false;
  if (now - flash.startedAt < DAMAGE_FEEDBACK.minGapMs) {
    flash.strength = Math.max(flash.strength, strength);
    return false;
  }
  flash.startedAt = now;
  flash.strength = Math.max(strength, flashOpacity(flash, now));
  return true;
}

/** Vinheta fraca e contínua de vida baixa: 0 acima de `lowHpRatio` (ou derrotado); mais forte quanto menos vida, com pulso lento. */
export function lowHpOpacity(hp: number, maxHp: number, now: number): number {
  const ratio = hp / Math.max(1, maxHp);
  if (!(ratio > 0) || ratio >= DAMAGE_FEEDBACK.lowHpRatio) return 0;
  const depth = clamp01((DAMAGE_FEEDBACK.lowHpRatio - ratio) / DAMAGE_FEEDBACK.lowHpRatio);
  const base = DAMAGE_FEEDBACK.lowHpMin + (DAMAGE_FEEDBACK.lowHpMax - DAMAGE_FEEDBACK.lowHpMin) * depth;
  const pulse = 1 - DAMAGE_FEEDBACK.lowHpPulseDepth * (.5 + .5 * Math.sin(now / 1000 * Math.PI * 2 * DAMAGE_FEEDBACK.lowHpPulseHz));
  return base * pulse;
}

/** Opacidade final da vinheta: o maior entre piscar e vida baixa; 0 com a opção desligada ou fora da partida. */
export function vignetteOpacity(flash: DamageFlash, now: number, hp: number, maxHp: number, options: { enabled: boolean; hiddenEffects?: boolean }): number {
  if (!options.enabled) return 0;
  const value = Math.max(flashOpacity(flash, now), lowHpOpacity(hp, maxHp, now));
  return clamp01(value * (options.hiddenEffects ? DAMAGE_FEEDBACK.hiddenEffectsFactor : 1));
}

/** Volume dos efeitos sonoros (volume geral × efeitos), entre 0 e 1. */
export const sfxGain = (settings: { volume: number; sfxVolume: number }) => clamp01(settings.volume * settings.sfxVolume);

/** Anti-spam do som de "hit recebido": libera se passou `sfxGapMs` desde o último. */
export const hurtSoundAllowed = (lastAt: number, now: number) => now - lastAt >= DAMAGE_FEEDBACK.sfxGapMs;
