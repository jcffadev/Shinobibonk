import { PILL_BY_NAME } from '../game/pills';

/** Cápsula colorida com glifo da pílula (CSS inline, sem assets externos). */
export function PillIcon({ name, className = '' }: { name: string; className?: string }) {
  const def = PILL_BY_NAME[name];
  const color = def?.color ?? '#ff77bc';
  return <span
    aria-label={name}
    role="img"
    className={`catalog-icon pill-capsule ${className}`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${color} 0 50%, #f4efe6 50% 100%)`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      borderRadius: '999px',
      border: `2px solid ${color}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#111',
      fontWeight: 800,
      fontSize: '0.85em',
      lineHeight: 1,
      textShadow: '0 0 2px #fff, 0 0 3px #fff',
    }}
  >{def?.glyph ?? '💊'}</span>;
}
