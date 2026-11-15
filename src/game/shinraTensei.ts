/**
 * Ultimate do Pain — Shinra Tensei (Rodada 93, pedido do usuário: "Fazer o Pain Levitar enquanto ulta... e sairá um dano em
 * ondas repetitivas que vai dar stun e dano e sempre que ele ultar ele vai levitar").
 * Lógica pura: o GameCanvas lê a altura da levitação e quando cada onda dispara.
 * - Ao ultar, o Pain sobe até `lift` m e fica no ar por `seconds` s (sobe e desce suave).
 * - Além do golpe inicial da Ultimate, saem `pulses` ondas de repulsão a cada `interval` s, cada uma com `pulsePower` do dano
 *   da Ultimate, empurrando e atordoando por `stunSeconds` s quem estiver no raio.
 */
export const SHINRA = { seconds: 2.6, lift: 1.5, pulses: 4, firstPulse: .45, interval: .5, pulsePower: .45, stunSeconds: 1.1 } as const;

export type ShinraState = { elapsed: number; fired: number };
export const startShinra = (): ShinraState => ({ elapsed: 0, fired: 0 });

/** Altura da levitação `elapsed` s depois de ultar: sobe em 0,35 s, flutua, desce nos últimos 0,45 s (0 fora). */
export function shinraLift(elapsed: number) {
  if (!(elapsed >= 0) || elapsed >= SHINRA.seconds) return 0;
  const rise = Math.min(1, elapsed / .35), fall = Math.min(1, (SHINRA.seconds - elapsed) / .45);
  const ease = (t: number) => t * t * (3 - 2 * t);
  return SHINRA.lift * Math.min(ease(rise), ease(fall)) * (1 + .05 * Math.sin(elapsed * 9));
}

/** Avança o tempo e devolve quantas ondas disparam neste quadro (0, 1 ou mais se o quadro for longo). */
export function advanceShinra(state: ShinraState, dt: number) {
  state.elapsed += dt;
  let fire = 0;
  while (state.fired < SHINRA.pulses && state.elapsed >= SHINRA.firstPulse + state.fired * SHINRA.interval) { state.fired++; fire++; }
  return fire;
}

export const shinraDone = (state: ShinraState) => state.elapsed >= SHINRA.seconds && state.fired >= SHINRA.pulses;
