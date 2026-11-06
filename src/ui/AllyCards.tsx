import '../allies.css';
import { HERO_BY_ID } from '../game/heroes';
import { ALLY_BUFFS, allyBuffText } from '../game/allies';
import { NPC_ALLIES } from '../game/npcs';
import { synergiesOf, type ActiveSynergy } from '../game/synergy';
import { HeroPortrait } from './RunSheet';

/** Nome curto da aldeia para o selo do cartão. */
const VILLAGE_TAG: Record<string, string> = { 'Vila da Folha': 'FOLHA', 'Vila da Areia': 'AREIA', 'Vila do Som': 'SOM', 'Vila da Chuva': 'CHUVA' };

/** Painel compacto das sinergias de aldeia/organização ativas (logo abaixo do cartão do herói). */
function SynergyPanel({ heroId, synergies }: { heroId: string; synergies: ActiveSynergy[] }) {
  if (!synergies.length) return null;
  return <section className="synergy-panel" aria-label="Sinergias ativas">
    <small className="ally-cards-title">SINERGIAS · {synergies.length}</small>
    {synergies.map((s) => <div className={`synergy-row ${s.kind}`} key={s.id} title={`${s.name} (${s.kind === 'vila' ? 'aldeia' : 'organização'}): ${s.members.map((id) => (HERO_BY_ID[id]?.name ?? id) + (id === heroId ? ' (você)' : '')).join(', ')}. Faixas: 2 / 3 / 4+ membros.`}>
      <span className="synergy-icon">{s.icon}</span>
      <b>{s.name}</b>
      <em>{s.members.length}×</em>
      <p>{s.text}</p>
    </div>)}
  </section>;
}

/**
 * Cartões dos ajudantes (shinobis selados), no canto esquerdo abaixo do cartão do herói.
 * Mostram o que o código realmente faz: passiva individual do ajudante (src/game/allies.ts, × força de suporte),
 * as sinergias de aldeia/organização para as quais ele contribui (src/game/synergy.ts) e a técnica de ataque
 * (1ª do kit) com a barra de recarga compartilhada dos aliados.
 */
export function AllyCards({ heroId, synergies = [], allies, slots, allyBuff, allyDamage, allySpeed, charge }: { heroId: string; synergies?: ActiveSynergy[]; allies: string[]; slots: number; allyBuff: number; allyDamage: number; allySpeed: number; charge: number }) {
  if (!allies.length) return null;
  const power = Math.round(65 * allyDamage);
  const cooldown = (1.5 / Math.max(0.1, allySpeed)).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return <aside className="ally-cards" aria-label={`Ajudantes ${allies.length}/${slots}`}>
    <SynergyPanel heroId={heroId} synergies={synergies} />
    <small className="ally-cards-title">AJUDANTES {allies.length}/{slots}</small>
    {allies.map((id) => {
      // Heróis jogáveis ou NPC ajudante (Iruka, src/game/npcs.ts), que não pertence ao elenco.
      const hero: { name: string; village: string } | undefined = HERO_BY_ID[id] ?? NPC_ALLIES[id];
      const technique = HERO_BY_ID[id]?.techniques[0] ?? NPC_ALLIES[id]?.technique;
      if (!hero || !technique) return null;
      const mine = synergiesOf(id, synergies);
      const buff = ALLY_BUFFS[id];
      return <article className="ally-card" key={id} style={{ ['--ally' as string]: technique.color }}>
        <span className="ally-portrait"><HeroPortrait id={id} /></span>
        <div className="ally-info">
          <header><b>{hero.name}</b><em>{VILLAGE_TAG[hero.village] ?? hero.village.toUpperCase()}</em></header>
          <p className="ally-buff" title={`Passiva individual de ${hero.name}${buff ? ': ' + buff.title : ''} (escala com a força de suporte)`}><span className="ally-passive">PASSIVA</span>{buff ? <b>{buff.title}</b> : null} {allyBuffText(id, allyBuff)}</p>
          {mine.length > 0 && <div className="ally-synergy-tags">{mine.map((s) => <em key={s.id} className={s.kind} title={`${s.name}: ${s.text}`}>{s.icon} {s.tag}</em>)}</div>}
          <div className="ally-skill" title={`${technique.name}: ${technique.school} · ${technique.element} · ${power}% do seu dano · a cada ${cooldown} s`}>
            <span>{technique.name}</span><i><s style={{ width: `${Math.round(Math.max(0, Math.min(1, charge)) * 100)}%` }} /></i>
          </div>
          <small className="ally-meta">{technique.element} · {technique.school} · {power}% dano · {cooldown} s</small>
        </div>
      </article>;
    })}
  </aside>;
}
