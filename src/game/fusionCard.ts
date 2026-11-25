import type { Shape, Technique } from './heroes.ts';
import { BURN_CHANCE, POISON_CHANCE, TECHNIQUE_SCALE, attackCooldown, techniqueProc } from './combat.ts';
import { FUSION_KIND_LABEL, FUSION_LEVEL_CAP, fusionByName } from './techniqueMerge.ts';

/**
 * Cartão de fusão (25/11/2026 — plano do usuário em docs/10, itens 4 e 5): "Como funciona" (as partes da técnica, cada uma
 * com o seu tipo), "Quais melhorias afetam" (o que Área, Duração, Projéteis, Recarga e Ricochete mudam) e a ficha com os
 * números. Lógica pura, lida do mesmo jeito que o GameCanvas resolve cada forma (`castTechnique`).
 */
export type FusionPart = { kind: string; text: string };
export type FusionUpgrade = { stat: string; effect: string };

const SHAPE_PART: Record<Shape, FusionPart> = {
  'Projétil': { kind: 'Projétil', text: 'Disparo na direção do alvo.' },
  'Em V': { kind: 'Projéteis em leque', text: 'Dois disparos abertos em V na direção do alvo.' },
  'Onda': { kind: 'Onda de choque', text: 'Uma onda larga avança na direção do alvo.' },
  'Área': { kind: 'Explosão no alvo', text: 'Acerta todos num círculo em volta do alvo.' },
  'Órbita': { kind: 'Anel amplo', text: 'Acerta um círculo maior em volta do alvo.' },
  'Cone': { kind: 'Cone', text: 'Leque à frente do usuário, na direção do alvo.' },
  'Linha': { kind: 'Linha', text: 'Faixa reta do usuário até o fim do alcance.' },
  'Corpo a corpo': { kind: 'Golpe corpo a corpo', text: 'Golpe de perto no alvo, com impacto em volta dele.' },
  'Buff': { kind: 'Preparação', text: 'Bônus temporário, sem dano.' },
};
const SHOT_SHAPES: readonly Shape[] = ['Projétil', 'Em V', 'Onda'];
const BOUNCE_SHAPES: readonly Shape[] = ['Projétil', 'Em V'];
const pct = (n: number) => Math.round(n * 100) + '%';

/** Efeitos que duram (status, queimadura, veneno), na ordem em que aparecem na técnica. */
export function lastingEffects(t: Technique): string[] {
  return [t.status, t.secondaryStatus, t.burn && 'Queimadura', t.poison && 'Dano contínuo'].filter((x): x is string => !!x);
}

/** "Como funciona": o golpe principal pela forma e cada efeito como uma parte. */
export function fusionParts(t: Technique): FusionPart[] {
  const parts = [SHAPE_PART[t.shape]];
  if (t.status) parts.push({ kind: t.status === 'Lentidão' ? 'Lentidão' : 'Controle', text: `${t.status} com ${pct(techniqueProc(t.statusChance, FUSION_LEVEL_CAP))} de chance no Nv. ${FUSION_LEVEL_CAP}.` });
  if (t.secondaryStatus && t.secondaryStatusChance) parts.push({ kind: 'Efeito secundário', text: `${t.secondaryStatus} com ${pct(techniqueProc(t.secondaryStatusChance, FUSION_LEVEL_CAP))} de chance no Nv. ${FUSION_LEVEL_CAP}.` });
  if (t.burn) parts.push({ kind: 'Queimadura', text: `${pct(techniqueProc(BURN_CHANCE, FUSION_LEVEL_CAP))} de chance de queimar no Nv. ${FUSION_LEVEL_CAP}: dano por segundo enquanto durar.` });
  if (t.poison) parts.push({ kind: 'Dano contínuo', text: `${pct(techniqueProc(POISON_CHANCE, FUSION_LEVEL_CAP))} de chance de envenenar no Nv. ${FUSION_LEVEL_CAP}: dano ao longo de alguns segundos.` });
  if (t.gravity) parts.push({ kind: 'Gravidade', text: t.gravity === 'push' ? 'Empurra os inimigos para longe.' : 'Puxa os inimigos para o centro.' });
  return parts;
}

/** "Quais melhorias afetam": o que cada melhoria muda nesta técnica e o que não ajuda. */
export function fusionUpgrades(t: Technique): { helps: FusionUpgrade[]; noHelp: string[] } {
  const shot = SHOT_SHAPES.includes(t.shape), circle = t.shape === 'Área' || t.shape === 'Órbita';
  const effects = lastingEffects(t);
  const helps: FusionUpgrade[] = [
    { stat: 'Área', effect: circle ? 'Aumenta o raio do círculo e o alcance.' : shot ? 'Engrossa o disparo e aumenta o alcance.' : t.shape === 'Corpo a corpo' ? 'Aumenta o alcance do golpe.' : 'Alarga a faixa e aumenta o alcance.' },
    { stat: 'Projéteis', effect: shot ? '+1 disparo por ponto.' : 'Repete o golpe logo depois (golpe extra).' },
    { stat: 'Recarga', effect: 'Ataca mais vezes.' },
  ];
  const noHelp: string[] = [];
  if (effects.length) helps.push({ stat: 'Duração', effect: 'Estende ' + effects.join(', ').toLowerCase() + '.' }, { stat: 'Chance de status', effect: 'Sobe a chance de ' + effects.join(', ').toLowerCase() + '.' });
  else noHelp.push('Duração e chance de status (a técnica não aplica efeito)');
  if (BOUNCE_SHAPES.includes(t.shape)) helps.push({ stat: 'Ricochete', effect: 'O disparo pula para outro inimigo.' });
  else noHelp.push('Ricochete (só vale para projéteis)');
  return { helps, noHelp };
}

export type FusionSheet = { label: string; recipe: string; condition: string; base: string; cooldown: string; status: string; cap: string };
/** Ficha da fusão para o mouse em cima: tipo, condição, dano base, recarga, chance de status e teto de nível. */
export function fusionSheet(t: Technique, pair: readonly [string, string], level = 1): FusionSheet {
  const recipe = fusionByName(t.name);
  const effects = [
    t.status && `${t.status} ${pct(techniqueProc(t.statusChance, level))}`,
    t.secondaryStatus && t.secondaryStatusChance && `${t.secondaryStatus} ${pct(techniqueProc(t.secondaryStatusChance, level))}`,
    t.burn && `Queimadura ${pct(techniqueProc(BURN_CHANCE, level))}`,
    t.poison && `Dano contínuo ${pct(techniqueProc(POISON_CHANCE, level))}`,
  ].filter(Boolean);
  return {
    label: recipe ? FUSION_KIND_LABEL[recipe.kind] : 'Combinação',
    recipe: `${pair[0]} + ${pair[1]}`,
    condition: 'As duas técnicas no nível máximo da partida · Oficina dos Sapos Sábios, uma união por zona',
    base: Math.round(t.power * TECHNIQUE_SCALE * 100) + '% do dano do personagem por acerto',
    cooldown: attackCooldown(t, level).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' s',
    status: effects.length ? effects.join(' · ') : 'Sem efeito',
    cap: `Nv. 1 ao Nv. ${FUSION_LEVEL_CAP}`,
  };
}
