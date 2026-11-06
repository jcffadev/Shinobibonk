import { ItemIcon } from './RunSheet';
import { BuffText } from './BuffText';
import type { WorldSnapshot } from '../scene/GameCanvas';

export function tradeAction(action: 'sell' | 'reroll' | 'exit') {
  window.dispatchEvent(new CustomEvent('shinobi-trade', { detail: action }));
}

export function ItemTradeDialog({ choice, money }: { choice: NonNullable<WorldSnapshot['choice']>; money: number }) {
  const merchant = choice.level === -8;
  const title = merchant ? 'Mercador de itens' : 'Prêmio da Tsunade';
  const choose = (index: number) => window.dispatchEvent(new CustomEvent('shinobi-choose', { detail: index }));
  return <div className="level-choice-backdrop">
    <section className="level-choice" role="dialog" aria-label={title}>
      <div className="level-choice-title">
        <h1>{title}</h1>
        <p>{merchant ? `${money} Ryu disponíveis · cada compra aumenta o preço das próximas` : 'Pegue o item ou venda pelo valor indicado.'}</p>
      </div>
      <div className="level-choice-cards" style={{ gridTemplateColumns: `repeat(${choice.cards.length},minmax(0,1fr))` }}>
        {choice.cards.map((card, index) => <button key={card.id} className={`level-choice-card rarity-${card.rarity.toLowerCase()}`}
          onClick={() => choose(index)} disabled={!!card.disabled}>
          <div className="choice-art"><small>{card.rarity}</small>{card.kind === 'item' ? <ItemIcon name={card.name}/> : <span>—</span>}</div>
          <div className="choice-copy">
            <h2>{card.name}</h2><p><BuffText text={card.description}/></p>
            {card.price !== undefined && <strong>{card.price} Ryu</strong>}
            {card.disabled && <p>{card.disabled}</p>}
            {!card.disabled && <kbd>{merchant ? index + 1 : 'E'}</kbd>}
          </div>
        </button>)}
      </div>
      <div className="reward-actions">
        {merchant ? <>
          <button disabled={(choice.rerollCost ?? Infinity) > money} onClick={() => tradeAction('reroll')}>Roletar · {choice.rerollCost} Ryu <kbd>F</kbd></button>
          <button onClick={() => tradeAction('exit')}>Sair <kbd>Esc</kbd></button>
        </> : <>
          <button onClick={() => choose(0)}>Pegar <kbd>E</kbd></button>
          <button onClick={() => tradeAction('sell')}>Vender · +{choice.sale} Ryu <kbd>V</kbd></button>
        </>}
      </div>
    </section>
  </div>;
}
