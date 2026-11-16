import type { Control } from './heroes.ts';

/**
 * Rodada 103 — pacote de status (pedido do usuário: "vamos ter que aumentar um pouco os itens que tem efeito de congelar
 * para balancear e o dano..."; depois "Sim, implementar"). Lógica pura (testada em tests/status.test.mjs).
 *
 * - **Resfriado:** cada acúmulo tira 12% do movimento; 3 acúmulos congelam por 1,5 s. Sem novo frio por 3 s, some.
 * - **Congelado:** não age e recebe +25% de dano. Com o item Quebra-Gelo, o golpe quebra o gelo (+50%) e os estilhaços
 *   resfriam quem está a até 3 m.
 * - **Reações:** Água molha por 5 s. Molhado + gelo congela na hora; molhado + Raio eletrocuta (até 3 vizinhos a 6 m levam
 *   40% do golpe); queimando + Vento espalha a queimadura (até 4 vizinhos a 3 m).
 * - **Resistência a controle:** Mega Elite e Guardião 40%, bijū 25% (encurta a duração do controle).
 * - **Sono:** o golpe que acorda causa +60%.
 * - **Veneno:** acumula até 8; cada acúmulo além do primeiro dá +15% de dano por segundo.
 * - **Itens na morte:** Esfera Katon (quem morre queimando pode explodir) e Espelho de Gelo de Haku (quem morre congelado
 *   solta estilhaços que resfriam).
 * Valores PROPOSTOS — calibrar no simulador.
 */
export const STATUS_RULES = {
  chill: { slowPerStack: .12, stacksToFreeze: 3, decay: 3, techniqueStacks: 2 },
  freeze: { seconds: 1.5, damageBonus: .25 },
  wet: { seconds: 5 },
  electro: { targets: 3, radius: 6, share: .4 },
  scorch: { radius: 3, targets: 4 },
  sleepWake: .6,
  poison: { maxStacks: 8, perStack: .15 },
  resist: { mega: .4, guardian: .4, bijuu: .25 },
  shatter: { radius: 3 },
  deathBurst: { fireChance: .5, fireRadius: 3.5, fireDamage: 2, iceRadius: 3, iceDamage: 1.5, perFrame: 12 },
} as const;

export type StatusTarget = {
  control?: Control; controlTime?: number;
  megaElite?: boolean; guardian?: boolean; bijuu?: boolean;
  chill?: number; chillTime?: number; wet?: number; poisonStacks?: number; burn?: number;
};

/** Multiplicador da duração de controle (1 = sem resistência). */
export function controlResist(e: StatusTarget) {
  const r = STATUS_RULES.resist;
  return 1 - (e.bijuu ? r.bijuu : e.megaElite ? r.mega : e.guardian ? r.guardian : 0);
}

export const isFrozen = (e: StatusTarget) => e.control === 'Congelar' && (e.controlTime ?? 0) > 0;
export const isAsleep = (e: StatusTarget) => e.control === 'Dormir' && (e.controlTime ?? 0) > 0;

/** Congela pela duração dada (com resistência). Zera o Resfriado e a água. */
export function freezeTarget(e: StatusTarget, seconds: number = STATUS_RULES.freeze.seconds) {
  const current = isFrozen(e) ? e.controlTime ?? 0 : 0;
  e.control = 'Congelar';
  e.controlTime = Math.max(current, seconds * controlResist(e));
  e.chill = 0; e.chillTime = 0; e.wet = 0;
}

/** Soma acúmulos de Resfriado. Molhado congela na hora; 3 acúmulos congelam. Devolve true se congelou. */
export function addChill(e: StatusTarget, stacks = 1) {
  const c = STATUS_RULES.chill;
  if ((e.wet ?? 0) > 0 || (e.chill ?? 0) + stacks >= c.stacksToFreeze) { freezeTarget(e); return true; }
  e.chill = (e.chill ?? 0) + stacks;
  e.chillTime = c.decay;
  return false;
}

/** Movimento restante pelo Resfriado (1 = normal). */
export const chillSlow = (e: StatusTarget) => Math.max(0, 1 - STATUS_RULES.chill.slowPerStack * (e.chill ?? 0));

/** Passa o tempo do Resfriado e da água. */
export function tickStatus(e: StatusTarget, dt: number) {
  if ((e.chillTime ?? 0) > 0) { e.chillTime = Math.max(0, (e.chillTime ?? 0) - dt); if (e.chillTime === 0) e.chill = 0; }
  if ((e.wet ?? 0) > 0) e.wet = Math.max(0, (e.wet ?? 0) - dt);
}

/** Dano extra no alvo: congelado +25% (+ Quebra-Gelo), dormindo +60% (o golpe acorda). */
export function statusDamageMultiplier(e: StatusTarget, shatter = 0) {
  if (isFrozen(e)) return 1 + STATUS_RULES.freeze.damageBonus + shatter;
  if (isAsleep(e)) return 1 + STATUS_RULES.sleepWake;
  return 1;
}

/** Soma um acúmulo de veneno (até 8). */
export function addPoisonStack(e: StatusTarget) {
  e.poisonStacks = Math.min(STATUS_RULES.poison.maxStacks, (e.poisonStacks ?? 0) + 1);
}

/** Multiplicador do dano por segundo do veneno pelos acúmulos. */
export const poisonMultiplier = (stacks = 1) => 1 + STATUS_RULES.poison.perStack * Math.max(0, Math.min(STATUS_RULES.poison.maxStacks, stacks) - 1);

export type Reaction = 'wet' | 'electro' | 'scorch';
/** Reações do golpe por elemento (a ordem importa: Raio consome a água antes de a Água molhar de novo). */
export function reactionsFor(e: StatusTarget, elements: readonly (string | undefined)[]): Reaction[] {
  const out: Reaction[] = [];
  if (elements.includes('Raio') && (e.wet ?? 0) > 0) out.push('electro');
  if (elements.includes('Vento') && (e.burn ?? 0) > 0) out.push('scorch');
  if (elements.includes('Água')) out.push('wet');
  return out;
}

/** Explosão na morte: 'fire' (queimando + Esfera Katon, 50%), 'ice' (congelado + Espelho de Gelo de Haku). */
export function deathBurstKind(e: StatusTarget, fireItem: number, iceItem: number, roll: number): 'fire' | 'ice' | undefined {
  if (iceItem > 0 && isFrozen(e)) return 'ice';
  if (fireItem > 0 && (e.burn ?? 0) > 0 && roll < STATUS_RULES.deathBurst.fireChance) return 'fire';
  return undefined;
}
