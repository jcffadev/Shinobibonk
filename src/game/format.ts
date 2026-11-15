/** Formato curto para valores grandes (Ryu, custos): 1.234 → "1,2 mil", 2.000.000 → "2,0M", 5e9 → "5,0B", 3e12 → "3,0T". */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value), sign = value < 0 ? '-' : '';
  if (abs >= 1e15) return sign + abs.toExponential(1).replace('.', ',');
  const units: [number, string][] = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, ' mil']];
  for (const [size, suffix] of units) if (abs >= size) return sign + (abs / size).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + suffix;
  return sign + Math.round(abs).toLocaleString('pt-BR');
}
/**
 * Rodada 76 (pedido do usuário: "os números de dano na tela… 50, 100, 1K, 10K, 100K, 1M, 10M, 1B, 1T, 1Q… e não o número
 * tipo 123148, seria 123.1K"): rótulo curto dos números de dano. Abaixo de 1.000 mostra o inteiro; acima, 1 casa decimal
 * com ponto (sem ".0") e sufixo K, M, B, T, Q, Qi, Sx, Sp, Oc, No, Dc. Além disso, notação científica curta (1.2e36).
 */
export const DAMAGE_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'] as const;
export function damageLabel(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  const sign = value < 0 ? '-' : '';
  let abs = Math.abs(value);
  if (abs < 999.5) return sign + Math.round(abs);
  let tier = Math.max(1, Math.floor(Math.log10(abs) / 3));
  let scaled = Math.round(abs / 10 ** (tier * 3) * 10) / 10;
  if (scaled >= 1000) { tier++; scaled = Math.round(scaled / 100) / 10; }
  if (tier >= DAMAGE_SUFFIXES.length) return sign + abs.toExponential(1).replace('.0e', 'e').replace('e+', 'e');
  return sign + String(scaled).replace(/\.0$/, '') + DAMAGE_SUFFIXES[tier];
}
