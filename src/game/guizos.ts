import type { Bonuses } from './catalog.ts';

/**
 * Guizos (26/11/2026 — pedido do usuário: "Na realidade faça dropar os guisos · faça um de cada cor para cada efeito ·
 * Coletou Guiso de Imã / de Dificuldade / de Isca / da Nevasca / do Raio / da Força da Juventude (Aumenta 60% movspeed) ·
 * Esses efeitos duram sempre 60 segundos · Eles dropam por rng, sem considerar a sorte do personagem eles tem drop fixo por
 * monstros" → "vamos manter os guisos de imã sempre" → "Para vermos se melhorarmos a questão do FPS do jogo").
 *
 * - Cada monstro abatido tem a mesma chance fixa (`chancePerKill`) de soltar um guizo; a Sorte não muda nada.
 * - O tipo é sorteado por igual entre os que não estão no chão nem ativos (um de cada no máximo), para não chover guizo.
 * - Pega ao pisar; o efeito dura `duration` s e aparece com o cronômetro no HUD.
 * - Ímã fica sempre no sorteio: puxa todos os drops do mapa enquanto dura (ajuda o FPS com o chão cheio).
 * - Dificuldade e Isca são risco por recompensa (mais ameaça ou mais monstros, logo mais XP e Ryu); os outros ajudam.
 * - Nevasca e Raio não pegam Guardião, Bijū nem Totem (chefes seguem as regras de fúria e incontrolável).
 * Valores de Dificuldade e Isca são PROPOSTOS (o usuário não fixou o número).
 */
export type GuizoId = 'ima' | 'dificuldade' | 'isca' | 'nevasca' | 'raio' | 'juventude';
export type Guizo = { id: GuizoId; name: string; color: string; effect: string; bonuses: Bonuses };

export const GUIZO_RULES = { duration: 60, chancePerKill: 1 / 2000 };

export const GUIZOS: readonly Guizo[] = [
  { id: 'ima', name: 'Guizo de Ímã', color: '#45b8ff', effect: 'puxa todos os itens do mapa', bonuses: {} },
  { id: 'dificuldade', name: 'Guizo de Dificuldade', color: '#ff4b4b', effect: '+20% de dificuldade (vida e dano dos monstros)', bonuses: { threat: .2 } },
  { id: 'isca', name: 'Guizo de Isca', color: '#ff9f2e', effect: '+30% de inimigos', bonuses: { enemyCount: .3 } },
  { id: 'nevasca', name: 'Guizo da Nevasca', color: '#e9f7ff', effect: 'todos os inimigos com lentidão', bonuses: {} },
  { id: 'raio', name: 'Guizo do Raio', color: '#ffe23d', effect: 'todos os inimigos paralisados', bonuses: {} },
  { id: 'juventude', name: 'Guizo da Força da Juventude', color: '#38d878', effect: '+60% de velocidade de movimento', bonuses: { move: .6 } },
];
export const GUIZO_BY_ID = Object.fromEntries(GUIZOS.map(g => [g.id, g])) as Record<GuizoId, Guizo>;
export const guizoPickupKind = (id: GuizoId) => `guizo-${id}` as const;
export type GuizoPickupKind = ReturnType<typeof guizoPickupKind>;
export const guizoFromKind = (kind: string): GuizoId | undefined => kind.startsWith('guizo-') && (kind.slice(6) in GUIZO_BY_ID) ? kind.slice(6) as GuizoId : undefined;

/** Guizo que cai deste abate (ou nenhum). `busy` = tipos já no chão ou com o efeito ativo. */
export function rollGuizo(busy: ReadonlySet<GuizoId>, rng: () => number = Math.random): GuizoId | undefined {
  if (rng() >= GUIZO_RULES.chancePerKill) return undefined;
  const free = GUIZOS.filter(g => !busy.has(g.id));
  if (!free.length) return undefined;
  return free[Math.min(free.length - 1, Math.floor(rng() * free.length))].id;
}

/** Texto do aviso ao coletar. */
export const guizoToast = (id: GuizoId) => `Coletou ${GUIZO_BY_ID[id].name}: ${GUIZO_BY_ID[id].effect} por ${GUIZO_RULES.duration} s`;
