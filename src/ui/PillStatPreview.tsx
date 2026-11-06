import type { PillStatLine } from '../game/pillPreview';

/** Lista "atributo: atual → novo" de uma pílula (src/game/pillPreview.ts). */
export function PillStatPreview({ lines, title }: { lines: PillStatLine[]; title?: string }) {
  if (!lines.length) return null;
  return <small className="pill-stat-preview">
    {title && <i>{title}</i>}
    {lines.map(line => <span key={line.label}><b>{line.label}</b> {line.from} → <em>{line.to}</em></span>)}
  </small>;
}
