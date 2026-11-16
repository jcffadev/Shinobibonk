import { HAGOROMO, TOOL_BY_ID } from '../game/hagoromoTraining';

/**
 * Rodada 97 — botão do Treinamento do Hagoromo (pedido do usuário: "coloque o ícone/foto do hagoromo e a tecla de acionamento
 * ao pequeno embaixo e 3 bolinhas para serem preenchidas em cima do icone"). Retrato em pixel art desenhado aqui (cabelo claro
 * espetado com os chifres, Rinnegan, tomoe vermelho na testa, manto branco de gola alta); sem imagem externa.
 */
const PX: [number, number, number, number, string][] = [
  // fundo
  [0, 0, 16, 16, '#3b2a5c'],
  // cabelo e chifres
  [3, 1, 10, 4, '#e8e0d4'], [2, 2, 1, 3, '#e8e0d4'], [13, 2, 1, 3, '#e8e0d4'], [4, 0, 2, 1, '#e8e0d4'], [10, 0, 2, 1, '#e8e0d4'],
  [3, 0, 1, 2, '#cfc3b2'], [12, 0, 1, 2, '#cfc3b2'], [2, 5, 2, 6, '#e8e0d4'], [12, 5, 2, 6, '#e8e0d4'],
  // rosto
  [4, 4, 8, 7, '#ecdcc8'], [4, 4, 8, 1, '#d8c6ae'],
  // tomoe vermelho na testa
  [7, 4, 2, 2, '#d3262e'],
  // Rinnegan (anéis roxos)
  [5, 7, 2, 1, '#9f8fe0'], [9, 7, 2, 1, '#9f8fe0'], [5, 6, 2, 1, '#6b5aa8'], [9, 6, 2, 1, '#6b5aa8'],
  // boca e barba curta
  [7, 9, 2, 1, '#8a6e58'], [6, 10, 4, 1, '#d8c6ae'],
  // manto branco de gola alta com magatama
  [3, 11, 10, 5, '#f4f1ea'], [5, 11, 6, 1, '#d9d3c6'], [4, 13, 1, 1, '#2b2b2b'], [6, 13, 1, 1, '#2b2b2b'], [9, 13, 1, 1, '#2b2b2b'], [11, 13, 1, 1, '#2b2b2b'],
];

export function HagoromoPortrait({ size = 40 }: { size?: number }) {
  return <svg className="hagoromo-portrait" width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    {PX.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
  </svg>;
}

export function HagoromoButton({ keys, progress, need, active, recharge, keyLabel }: { keys: number; progress: number; need: number; active: boolean; recharge: boolean; keyLabel: string }) {
  const ready = keys > 0 && !active;
  const title = active ? 'Treinamento do Hagoromo em andamento'
    : ready ? `Treinamento do Hagoromo · ${keys}/${HAGOROMO.maxKeys} chaves · ${keyLabel} para começar`
    : recharge ? `Treinamento do Hagoromo · ${need - progress} abates para a próxima chave` : 'Treinamento do Hagoromo · sem recarga depois do chefe da zona';
  return <button type="button" className={`hagoromo-button${ready ? ' ready' : ''}${active ? ' active' : ''}`} title={title} aria-label={title}
    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))}>
    <span className="hagoromo-keys" aria-hidden="true">{Array.from({ length: HAGOROMO.maxKeys }, (_, i) => <i key={i} className={i < keys ? 'on' : ''} />)}</span>
    <HagoromoPortrait />
    {!ready && !active && recharge && <span className="hagoromo-charge" style={{ height: `${Math.min(100, progress / Math.max(1, need) * 100)}%` }} aria-hidden="true" />}
    <small>{keyLabel}</small>
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
