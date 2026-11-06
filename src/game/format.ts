/** Formato curto para valores grandes (Ryu, custos): 1.234 → "1,2 mil", 2.000.000 → "2,0M", 5e9 → "5,0B", 3e12 → "3,0T". */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value), sign = value < 0 ? '-' : '';
  if (abs >= 1e15) return sign + abs.toExponential(1).replace('.', ',');
  const units: [number, string][] = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, ' mil']];
  for (const [size, suffix] of units) if (abs >= size) return sign + (abs / size).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + suffix;
  return sign + Math.round(abs).toLocaleString('pt-BR');
}