import { useEffect, useRef } from 'react';

/**
 * Pontos de inimigos do minimapa/mapa desenhados num único <canvas> (antes: 1 elemento React por inimigo a cada snapshot,
 * o que custava dezenas de ms por atualização com hordas grandes). `project` devolve a posição em % (0–100) do contêiner.
 */
export function EnemyDots({ enemies, project, radius = 2.5 }: { enemies: { x: number; z: number }[]; project: (x: number, z: number) => [number, number]; radius?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f45c61'; ctx.shadowColor = '#ff3545'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (const e of enemies) { const [px, py] = project(e.x, e.z), x = px * w / 100, y = py * h / 100; ctx.moveTo(x + radius, y); ctx.arc(x, y, radius, 0, Math.PI * 2); }
    ctx.fill();
  });
  return <canvas ref={ref} className="enemy-dots" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />;
}
