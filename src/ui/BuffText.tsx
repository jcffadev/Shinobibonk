import { Fragment } from 'react';

/** Trecho negativo: número com sinal de menos (−8%, -12 armadura) ou palavras de perda/custo. */
const NEGATIVE = /(^|[\s(:])[−-]\s?\d|\bperde|\bcusto\b|\bcusta\s+[−-]|\bpenalidade|\bdívida|\bdebuff|\bemboscada/i;
/** Trecho positivo: número com sinal de mais (+12%, +1 projétil) ou multiplicador acima de 1 (×1,4). */
const POSITIVE = /(^|[\s(:])\+\s?\d|×\s?(1[.,]\d*[1-9]|[2-9])|\bganha|\bcura\b|\brevive|\bressurrei/i;

export type BuffTone = 'buff' | 'debuff' | 'neutral';
/** Reduções que são vantagem (desconto, custa menos, recarga mais rápida) contam como bônus. */
const GOOD_REDUCTION = /\bmenos\b|\bdesconto|mais rápid|recarga\s+[−-]/i;
export function buffTone(clause: string): BuffTone {
  if (GOOD_REDUCTION.test(clause)) return 'buff';
  if (NEGATIVE.test(clause)) return 'debuff';
  if (POSITIVE.test(clause)) return 'buff';
  return 'neutral';
}

/**
 * Pinta um texto de efeito: trechos de bônus em verde e de perda/custo em vermelho, para o jogador ver
 * rapidamente o que ganha e o que perde. Divide por vírgula, "·", ";" e ponto final.
 */
export function BuffText({ text }: { text: string | undefined | null }) {
  if (!text) return null;
  const parts = text.split(/(,\s+|\s+·\s+|;\s+|\.\s+|\s+\/\s+)/);
  return <>{parts.map((part, i) => {
    if (i % 2 === 1) return <Fragment key={i}>{part}</Fragment>;
    const tone = buffTone(part);
    return tone === 'neutral' ? <Fragment key={i}>{part}</Fragment> : <span key={i} className={`tone-${tone}`}>{part}</span>;
  })}</>;
}
