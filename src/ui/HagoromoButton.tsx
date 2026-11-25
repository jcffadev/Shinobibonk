import { HAGOROMO, TOOL_BY_ID, type HagoromoEncounterHud } from '../game/hagoromoTraining';

export function HagoromoPortrait({ size = 40 }: { size?: number }) {
  return <img className="hagoromo-portrait" src="/assets/hagoromo-portrait-v1.png" width={size} height={size} alt="" draggable={false} />;
}

export function HagoromoStatus({ stage, boss }: { stage:HagoromoEncounterHud; boss:string }) {
  return <section className="guardian-banner hagoromo-status" data-phase={stage.phase} aria-label="Treinamento do Hagoromo">
    <HagoromoPortrait size={42} />
    <div className="hagoromo-status-copy">
      <small>Treinamento do Hagoromo · {stage.rarity}</small>
      {stage.phase==='wave' && <strong>Onda {stage.wave}/{stage.total} · {stage.remaining} restantes</strong>}
      {stage.phase==='boss' && <strong>{boss || 'O Mega Elite chegou'}</strong>}
      {stage.phase==='complete' && <strong>Treino concluído · recolha os drops e aperte E para voltar</strong>}
      <div className="hagoromo-wave-pips" aria-hidden="true">
        {Array.from({length:stage.total},(_,i)=><i key={i} className={stage.phase!=='wave'||i+1<stage.wave?'done':i+1===stage.wave?'current':''} />)}
      </div>
    </div>
  </section>;
}

export function HagoromoButton({ keys, progress, need, active, recharge, keyLabel }: { keys: number; progress: number; need: number; active: boolean; recharge: boolean; keyLabel: string }) {
  const ready = keys > 0 && !active;
  const status = active ? 'em andamento' : ready ? `${keyLabel} para começar`
    : recharge ? `${need - progress} abates para o próximo portal` : 'sem recarga depois do chefe da zona';
  const title = `Treinamento do Hagoromo · ${keys} de ${HAGOROMO.maxKeys} portais disponíveis · ${status}`;
  return <button type="button" className={`hagoromo-button${ready ? ' ready' : ''}${active ? ' active' : ''}`} title={title} aria-label={title}
    onClick={() => window.dispatchEvent(new Event('shinobi-hagoromo'))}>
    <span className="hagoromo-keys" aria-hidden="true">{Array.from({ length: HAGOROMO.maxKeys }, (_, i) => <i key={i} className={i < keys ? 'on' : ''} />)}</span>
    <HagoromoPortrait />
    {!ready && !active && recharge && <span className="hagoromo-charge" style={{ height: `${Math.min(100, progress / Math.max(1, need) * 100)}%` }} aria-hidden="true" />}
    <span className="hagoromo-button-footer"><kbd>{keyLabel}</kbd><b>{keys}/{HAGOROMO.maxKeys}</b></span>
  </button>;
}

const TOOL_ICONS: Record<string, string> = { amuleto: '🧿', particulas: '✨', shakujo: '🔱', espada: '🗡️', bashosen: '🪭', kokinjo: '🪢', benihisago: '🏺', kohaku: '⚱️', shichiseiken: '⚔️' };
/** As 3 vagas das ferramentas do Sábio no cartão do personagem (abaixo do nível e do XP). */
export function SageToolSlots({ tools }: { tools: readonly string[] }) {
  return <div className="sage-tool-slots" aria-label="Ferramentas do Sábio dos Seis Caminhos">
    {Array.from({ length: HAGOROMO.maxTools }, (_, i) => {
      const tool = tools[i] ? TOOL_BY_ID[tools[i]] : undefined;
      return <span key={i} className={`sage-tool${tool ? ' rarity-' + tool.rarity.toLowerCase() : ' empty'}`} title={tool ? `${tool.name} · ${tool.rarity} · ${tool.stat}. ${tool.detail}` : 'Vaga livre · ganhe ferramentas no Treinamento do Hagoromo'}>{tool ? TOOL_ICONS[tool.id] : ''}</span>;
    })}
  </div>;
}
