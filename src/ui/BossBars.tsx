/**
 * Barras de vida dos chefes e Mega Elites no HUD (26/11/2026 — pedido do usuário: "Ao nascer um elite a vida dele precisa ter
 * a barrinha de hp aparecendo abaixo de onde mostra as informações do mapa centralizado um pouco mais acima do centro, hoje isso
 * está em cima das informações do mapa e está em números o hp").
 * Até 3 barras (Guardião/Bijū primeiro, depois os Mega Elites mais perto), centralizadas um pouco acima do meio da tela, sem
 * números: nome, barra e o selo "Fúria" quando o chefe enfureceu.
 */
import '../boss-bars.css';

/**
 * 27/11/2026 — usuário: "Na barrinha de HP em cima mostrar quando está em RAGE, também mostrando o carregamento da skill dos
 * bosses pro jogador saber exatamente o momento que ele vai lançar." Fúria com selo e barra pulsando; abaixo da vida, a carga
 * da próxima técnica (enchendo na recarga; vermelha com o nome da técnica quando o aviso no chão já está aberto).
 */
export type BossBar = { id: string; name: string; hp: number; maxHp: number; boss: boolean; rage: boolean; charge?: number; casting?: boolean; skill?: string };

export const bossBarShare = (bar: Pick<BossBar, 'hp' | 'maxHp'>) => Math.max(0, Math.min(1, bar.hp / Math.max(1, bar.maxHp)));

export function BossBars({ bars }: { bars: readonly BossBar[] }) {
  if (!bars.length) return null;
  return <div className="boss-bars" role="group" aria-label="Vida dos chefes">
    {bars.map(bar => <div key={bar.id} className={`boss-bar${bar.boss ? ' is-boss' : ''}${bar.rage ? ' is-rage' : ''}`}>
      <span className="boss-bar-name">{bar.name}{bar.rage && <em>🔥 Fúria</em>}</span>
      <span className="boss-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bossBarShare(bar) * 100)}>
        <i style={{ width: `${bossBarShare(bar) * 100}%` }} />
      </span>
      {bar.charge !== undefined && <span className={`boss-bar-cast${bar.casting ? ' is-casting' : ''}`} role="progressbar" aria-label={bar.casting ? 'Lançando ' + bar.skill : 'Carga da próxima técnica'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bar.charge * 100)}>
        <i style={{ width: `${Math.max(0, Math.min(1, bar.charge)) * 100}%` }} /><small>{bar.casting ? '⚠ ' + bar.skill : 'Próxima técnica'}</small>
      </span>}
    </div>)}
  </div>;
}
