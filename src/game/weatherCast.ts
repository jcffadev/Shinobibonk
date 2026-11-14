/**
 * Conjuração dos eventos de clima (Rodada 63 — pedido do usuário: "quero um action time do Zabuza castando os selos…
 * para fazer a névoa oculta"). O Mega Elite do evento surge À VISTA do jogador, fica parado fazendo os selos por
 * `seconds` e a névoa engrossa aos poucos; só depois ele some nela. Lógica pura, testada em tests/.
 * Referência da técnica: Narutopedia, "Hidden Mist Technique" (Kirigakure no Jutsu), usada por Zabuza Momochi.
 */
export type WeatherCast = { seconds: number; line: string };
export type FogRange = { near: number; far: number };
/** Névoa "aberta" antes da conjuração (tão longe que não aparece). */
export const CLEAR_FOG: FogRange = { near: 300, far: 600 };
/** Distância (m) à frente do jogador, dentro da tela, onde o conjurador aparece. */
export const CAST_DISTANCE = 7;

/** Progresso da conjuração de 0 a 1 (suave). Sem conjuração (`castEnd` ausente) = 1. */
export function castProgress(elapsed: number, castEnd: number | undefined, seconds: number) {
  if (castEnd === undefined || seconds <= 0) return 1;
  const k = Math.min(1, Math.max(0, 1 - (castEnd - elapsed) / seconds));
  return k * k * (3 - 2 * k);
}
/** Névoa durante a conjuração: vai da névoa aberta até a do evento. */
export function blendFog(event: FogRange, k: number, from: FogRange = CLEAR_FOG): FogRange {
  return { near: from.near + (event.near - from.near) * k, far: from.far + (event.far - from.far) * k };
}
/** A névoa só esconde os inimigos depois que a conjuração termina. */
export function mistHides(event: { id: string; castEnd?: number } | undefined, elapsed: number) {
  return !!event && event.id === 'mist' && elapsed >= (event.castEnd ?? 0);
}
/** O conjurador fica parado (sem andar nem atacar) enquanto faz os selos. */
export function isChanneling(event: { elite: string; castEnd?: number } | undefined, heroId: string | undefined, elapsed: number) {
  return !!event && !!heroId && event.elite === heroId && event.castEnd !== undefined && elapsed < event.castEnd;
}
