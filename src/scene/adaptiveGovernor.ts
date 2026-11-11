/**
 * Ajuste automático de desempenho (governor da resolução do renderizador).
 *
 * Mede o intervalo médio entre quadros (EMA) — essa métrica inclui a espera do GPU,
 * então reflete o FPS real entregue (não só o tempo de CPU). Se o jogo cai abaixo
 * do alvo (~55 fps), o governor reduz o pixel ratio (menos pixels = mais FPS);
 * se sobra folga (~80 fps ou mais), devolve gradualmente.
 *
 * - Teto (ceiling) = ratio configurado pelo jogador (pixelRatioFor); o governor nunca passa dele.
 * - Piso (floor) = GOVERNOR_FLOOR (meia resolução), abaixo disso não desce.
 * - Histerese (18 ms para descer / 12 ms para subir) evita oscilação liga/desliga.
 * - Warmup de 4 s ignora os quadros iniciais (carga de texturas, compilação de shaders).
 * - Intervalos > 250 ms (aba oculta, travada, debugger) não contam na média.
 */
export const GOVERNOR_FLOOR = .5;

export type AdaptiveGovernor = {
  /** Chame a cada quadro com o intervalo real (ms) desde o quadro anterior. Retorna o novo ratio quando mudou, senão null. `active=false` pausa a medição. */
  tick(frameMs: number, active: boolean): number | null;
  /** Ratio configurado mudou (qualidade/resolução). Se o atual estivesse acima do novo teto, aplica o teto agora. */
  setCeiling(ratio: number): number | null;
  /** Força o ratio de volta ao teto (ex.: usuário desligou o ajuste automático). */
  snapToCeiling(): number | null;
  ratio(): number;
  ceiling(): number;
  /** 0–100: quão abaixo do teto está o ratio atual (100 = no piso). */
  deficit(): number;
};

export function createAdaptiveGovernor(initial: number): AdaptiveGovernor {
  const DOWN_MS = 18, UP_MS = 12, EVAL_MS = 1000, WARMUP_MS = 4000, WARMUP_SKIP = 250;
  let ceiling = Math.max(GOVERNOR_FLOOR, initial);
  let ratio = ceiling;
  let ema = 16.7;
  let evalAccum = 0;
  let warmup = WARMUP_MS;
  return {
    tick(frameMs, active) {
      if (!active || frameMs <= 0 || frameMs > WARMUP_SKIP) { evalAccum = 0; return null; }
      if (warmup > 0) { warmup -= frameMs; return null; }
      ema = ema * .9 + frameMs * .1;
      evalAccum += frameMs;
      if (evalAccum < EVAL_MS) return null;
      evalAccum = 0;
      if (ema > DOWN_MS && ratio - GOVERNOR_FLOOR > .01) { ratio = Math.max(GOVERNOR_FLOOR, ratio * .85); return ratio; }
      if (ema < UP_MS && ceiling - ratio > .01) { ratio = Math.min(ceiling, ratio * 1.12); return ratio; }
      return null;
    },
    setCeiling(next) {
      ceiling = Math.max(GOVERNOR_FLOOR, next);
      if (ratio > ceiling) { ratio = ceiling; return ratio; }
      return null;
    },
    snapToCeiling() {
      if (ratio === ceiling) return null;
      ratio = ceiling;
      return ratio;
    },
    ratio: () => ratio,
    ceiling: () => ceiling,
    deficit: () => Math.round(100 * (1 - ratio / Math.max(GOVERNOR_FLOOR, ceiling))),
  };
}
