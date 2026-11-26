/**
 * Barras de vida dos chefes e Mega Elites no HUD (26/11/2026 — pedido do usuário: "Ao nascer um elite a vida dele precisa ter
 * a barrinha de hp aparecendo abaixo de onde mostra as informações do mapa centralizado um pouco mais acima do centro, hoje isso
 * está em cima das informações do mapa e está em números o hp").
 * Até 3 barras (Guardião/Bijū primeiro, depois os Mega Elites mais perto), centralizadas um pouco acima do meio da tela, sem
 * números: nome, barra e o selo "Fúria" quando o chefe enfureceu.
 */
import '../boss-bars.css';

export type BossBar = { id: string; name: string; hp: number; maxHp: number; boss: boolean; rage: boolean };

export const bossBarShare = (bar: Pick<BossBar, 'hp' | 'maxHp'>) => Math.max(0, Math.min(1, bar.hp / Math.max(1, bar.maxHp)));

export function BossBars({ bars }: { bars: readonly BossBar[] }) {
  if (!bars.length) return null;
  return <div className="boss-bars" role="group" aria-label="Vida dos chefes">
    {bars.map(bar => <div key={bar.id} className={`boss-bar${bar.boss ? ' is-boss' : ''}${bar.rage ? ' is-rage' : ''}`}>
      <span className="boss-bar-name">{bar.name}{bar.rage && <em>Fúria</em>}</span>
      <span className="boss-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bossBarShare(bar) * 100)}>
        <i style={{ width: `${bossBarShare(bar) * 100}%` }} />
      </span>
    </div>)}
  </div>;
}
