import '../allies.css';
import { HERO_BY_ID, sandSynergy } from '../game/heroes';
import { ALLY_BUFFS, allyBuffText } from '../game/allies';
import { HeroPortrait } from './RunSheet';

/** Nome curto da aldeia para o selo do cartão. */
const VILLAGE_TAG: Record<string, string> = { 'Vila da Folha': 'FOLHA', 'Vila da Areia': 'AREIA', 'Vila do Som': 'SOM', 'Vila da Chuva': 'CHUVA' };
const SAND = ['gaara', 'temari', 'kankuro'];

/**
 * Cartões dos ajudantes (shinobis selados), no canto esquerdo abaixo do cartão do herói.
 * Mostram o que o código realmente faz: buff único do ajudante (src/game/allies.ts, × força de suporte),
 * técnica de ataque (1ª do kit) com a barra de recarga compartilhada dos aliados, e a sinergia da Areia.
 */
export function AllyCards({ allies, slots, allyBuff, allyDamage, allySpeed, charge }: { allies: string[]; slots: number; allyBuff: number; allyDamage: number; allySpeed: number; charge: number }) {
  if (!allies.length) return null;
  const power = Math.round(65 * allyDamage);
  const cooldown = (1.5 / Math.max(0.1, allySpeed)).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const synergy = sandSynergy(allies);
  return <aside className="ally-cards" aria-label={`Ajudantes ${allies.length}/${slots}`}>
    <small className="ally-cards-title">AJUDANTES {allies.length}/{slots}</small>
    {allies.map((id) => {
      const hero = HERO_BY_ID[id]; if (!hero) return null;
      const technique = hero.techniques[0];
      const inSynergy = synergy && SAND.includes(id);
      return <article className="ally-card" key={id} style={{ ['--ally' as string]: technique.color }}>
        <span className="ally-portrait"><HeroPortrait id={id} /></span>
        <div className="ally-info">
          <header><b>{hero.name}</b><em className={inSynergy ? 'synergy' : ''}>{inSynergy ? 'SINERGIA' : VILLAGE_TAG[hero.village] ?? hero.village.toUpperCase()}</em></header>
          <p className="ally-buff" title={ALLY_BUFFS[id]?.title}>{allyBuffText(id, allyBuff)}{inSynergy ? ' · Areia +12 armadura / +15% dano' : ''}</p>
          <div className="ally-skill" title={`${technique.name}: ${technique.school} · ${technique.element} · ${power}% do seu dano · a cada ${cooldown} s`}>
            <span>{technique.name}</span><i><s style={{ width: `${Math.round(Math.max(0, Math.min(1, charge)) * 100)}%` }} /></i>
          </div>
          <small className="ally-meta">{technique.element} · {technique.school} · {power}% dano · {cooldown} s</small>
        </div>
      </article>;
    })}
  </aside>;
}
