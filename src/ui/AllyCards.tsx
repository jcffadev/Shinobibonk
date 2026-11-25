import { useState } from 'react';
import { BuffText } from './BuffText';
import '../allies.css';
import { HERO_BY_ID } from '../game/heroes';
import { ALLY_BUFFS, AFFINITY_RULES, affinityLevel, affinityFactor, affinityProgress, allyBuffText, maxAffinityPoints } from '../game/allies';
import { NPC_ALLIES } from '../game/npcs';
import { activeSynergies, synergiesOf, villageOf, type ActiveSynergy } from '../game/synergy';
import type { LevelOffer } from '../scene/GameCanvas';
import { VillageEmblem, villageName } from './VillageEmblem';
import { CardPortrait } from './CharacterSelect';
import { RunSheetButton } from './RunSheet';


const allyInfo = (id: string): { name: string; village: string } | undefined => HERO_BY_ID[id] ?? NPC_ALLIES[id];

const SYNERGY_COLLAPSED_KEY = 'shinobibonk.hud.synergiesCollapsed';
const readCollapsed = () => { try { return localStorage.getItem(SYNERGY_COLLAPSED_KEY) !== '0'; } catch { return true; } };

/** Sinergias ativas abaixo da lista da equipe, com preferência salva entre partidas. */
function SynergyPanel({ synergies }: { synergies: ActiveSynergy[] }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  if (!synergies.length) return null;
  const toggle = () => setCollapsed((was) => { const next = !was; try { localStorage.setItem(SYNERGY_COLLAPSED_KEY, next ? '1' : '0'); } catch { /* armazenamento indisponível: só a sessão lembra */ } return next; });
  return <section className="synergy-panel" aria-label="Sinergias ativas">
    <button type="button" className="synergy-toggle" aria-expanded={!collapsed} title={collapsed ? 'Mostrar sinergias' : 'Recolher sinergias'} onClick={(e) => { e.currentTarget.blur(); toggle(); }}>
      <span aria-hidden="true">{collapsed ? '▸' : '▾'}</span> Sinergias <span className="ally-count">{synergies.length}</span>
    </button>
    {!collapsed && synergies.map((s) => <div className={`synergy-row ${s.kind}`} key={s.id} title={`${s.name} (${s.kind === 'vila' ? 'aldeia' : 'organização'}): ${s.members.map((id) => allyInfo(id)?.name ?? id).join(', ')}. Faixas: ${s.tiers.join(' / ')} ajudantes.${s.next ? ` Próxima faixa com ${s.next}.` : ' Faixa máxima.'}`}>
      <span className="synergy-icon">{s.icon}</span>
      <b>{s.name}</b>
      <em>{s.members.length}{s.next ? `/${s.next}` : ' MÁX'}</em>
      <p><BuffText text={s.text}/></p>
    </div>)}
  </section>;
}

/** Afinidade do ajudante: nível, barra de progresso e % da passiva ativa. */
function AffinityRow({ points }: { points: number }) {
  const level = affinityLevel(points), max = level >= AFFINITY_RULES.max;
  return <div className="ally-affinity" title={`Afinidade sobe com o tempo na equipe (+${AFFINITY_RULES.perSecond}/s) e com abates (+${String(AFFINITY_RULES.perKill).replace('.', ',')} cada). Passiva: ${AFFINITY_RULES.factor.map((f) => Math.round(f * 100) + '%').join(' / ')} nos níveis 1–${AFFINITY_RULES.max}.`}>
    <span>AFINIDADE {level}/{AFFINITY_RULES.max}</span>
    <i><s style={{ width: `${Math.round(affinityProgress(points) * 100)}%` }} /></i>
    <small>{max ? 'MÁX' : `${Math.round(affinityFactor(points) * 100)}%`}</small>
  </div>;
}

export function AllyCards({ synergies = [], allies, affinity = {}, slots, charge }: {
  synergies?: ActiveSynergy[];
  allies: string[];
  affinity?: Record<string, number>;
  slots: number;
  charge: number;
}) {
  if (!allies.length) return null;
  return <aside className="ally-cards" aria-labelledby="ally-hud-title">
    <div className="ally-cards-heading">
      <h2 id="ally-hud-title">Ajudantes <span className="ally-count">{allies.length}/{slots}</span></h2>
      <progress className="ally-charge" aria-label="Recarga de ataque dos ajudantes" value={charge} max={1}/>
    </div>
    <div className="ally-cards-body">
      <ul className="ally-list">
        {allies.map(id => {
          const name = allyInfo(id)?.name;
          if (!name) return null;
          const level = affinityLevel(affinity[id] ?? maxAffinityPoints());
          return <li className="ally-card" key={id}>
            <span className="ally-portrait"><CardPortrait id={id} fullBody decorative/></span>
            <div className="ally-info">
              <strong>{name}</strong>
              <small>Afinidade {level}/{AFFINITY_RULES.max}</small>
            </div>
          </li>;
        })}
      </ul>
      <SynergyPanel synergies={synergies}/>
    </div>
  </aside>;
}

/**
 * Tela de substituição (choiceLevel −7): equipe cheia ao capturar um mega elite.
 * Clicar no NOVO = dispensar (não ganha nada). Clicar num ajudante atual = ele sai e o novo entra (afinidade Nv. 1).
 */
export function AllyReplaceChoice({ heroId, cards, allies, affinity, slots, allyBuff, onSheet }: { heroId: string; cards: LevelOffer[]; allies: string[]; affinity: Record<string, number>; slots: number; allyBuff: number; onSheet:()=>void }) {
  const choose = (index: number) => window.dispatchEvent(new CustomEvent('shinobi-choose', { detail: index }));
  const fresh = cards.find((c) => c.allyNew);
  const current = activeSynergies(heroId, allies);
  const card = (offer: LevelOffer, index: number) => {
    const id = offer.allyId!, hero = allyInfo(id), isNew = Boolean(offer.allyNew);
    const points = isNew ? 0 : affinity[id] ?? maxAffinityPoints(), buff = ALLY_BUFFS[id];
    const after = isNew ? current : activeSynergies(heroId, [...allies.filter((a) => a !== id), fresh?.allyId ?? '']);
    const mine = isNew ? activeSynergies(heroId, [...allies, id]).filter((s) => s.members.includes(id)) : synergiesOf(id, current);
    return <button key={offer.id} className={`replace-card ${isNew ? 'is-new' : ''}`} onClick={() => choose(index)} title={offer.description}>
      <span className="replace-badge">{isNew ? 'NOVO · clique para dispensar' : 'clique para substituir'}</span>
      <span className="replace-portrait"><CardPortrait id={id} fullBody decorative/></span>
      <b>{hero?.name ?? id}</b>
      <em><VillageEmblem village={villageOf(id)??''}/>{villageName(villageOf(id)??'',true)}</em>
      <p className="replace-passive"><span className="ally-passive">PASSIVA</span>{buff?.title}</p>
      <p className="replace-value">Agora: {allyBuffText(id, allyBuff, points)}</p>
      <p className="replace-value max">Máx. (afinidade {AFFINITY_RULES.max}): {allyBuffText(id, allyBuff)}</p>
      <AffinityRow points={points} />
      {mine.length > 0 && <div className="ally-synergy-tags">{mine.map((s) => <em key={s.id} className={s.kind}>{s.icon} {s.tag}</em>)}</div>}
      <small className="replace-after">{isNew ? 'Dispensar: ninguém sai e você não ganha nada.' : `Após a troca: ${after.length ? after.map((s) => `${s.tag} ${s.members.length}`).join(' · ') : 'sem sinergias'}`}</small>
      {index < 9 && <kbd>[{index + 1}]</kbd>}
    </button>;
  };
  return <div className="level-choice-backdrop"><section className="level-choice replace-choice">
    <div className="level-choice-title"><small>EQUIPE CHEIA · {allies.length}/{slots} AJUDANTES</small><h1>{fresh?.name ?? 'Novo shinobi'} quer entrar na equipe</h1><p>Clique num ajudante atual para trocá-lo pelo novo (o novo começa na afinidade 1) ou clique no novo para dispensá-lo. A recompensa do abate já foi dada e não se repete.</p></div>
    <div className="replace-grid">
      <div className="replace-current">{cards.map((c, i) => c.allyNew ? null : card(c, i))}</div>
      <div className="replace-new">{cards.map((c, i) => c.allyNew ? card(c, i) : null)}</div>
    </div>
    <div className="reward-actions"><button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))}>✕ Dispensar o novo <kbd>X</kbd></button><RunSheetButton onClick={onSheet}/></div>
  </section></div>;
}
