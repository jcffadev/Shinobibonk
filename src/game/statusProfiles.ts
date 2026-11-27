import type { Control, Technique } from './heroes.ts';

/**
 * Rodada 102 — equilíbrio dos status (pedidos do usuário: "precisa balancear mais as condições de status para todas as
 * habilidades, tem muitas que só fazem dar dano crítico"; "Técnicas de gelo, igual Haku ou... kekkei genkais, elementos
 * que misturados formariam gelo, podem congelar"; "Nagato/Pain usam magnetismo, então suas habilidades deveriam depender
 * bastante disso").
 * Antes: 59 de 216 técnicas só davam crítico. Cada uma ganha o status que combina com o golpe na obra (Narutopedia);
 * o crítico fica só para golpes de precisão (`CRIT_ONLY`). Valores PROPOSTOS — calibrar no simulador.
 */
type Profile = { status?: Control; statusChance?: number; burn?: boolean; poison?: boolean; gravity?: Technique['gravity'] };

/** Golpes de precisão que continuam só com bônus de crítico. */
export const CRIT_ONLY: readonly string[] = ['Shuriken', 'Kunai Tática', 'Kunai Hiraishin', 'Kunai do Instrutor', 'Espada Kusanagi', 'Estilo Acrobático das Sete Espadas', 'Bisturi de Chakra'];

export const STATUS_PROFILES: Record<string, Profile> = {
  // Ninjutsu neutro
  'Agulhas de Cabelo': { status: 'Paralisar', statusChance: .2 },
  'Barreira Espaço-Tempo': { status: 'Empurrar', statusChance: .3 },
  'Bijūdama': { status: 'Atordoar', statusChance: .25, burn: true },
  'Esferas da Busca da Verdade': { status: 'Atordoar', statusChance: .2 },
  'Kuroari': { status: 'Paralisar', statusChance: .35 },
  'Palma Mística': { status: 'Lentidão', statusChance: .25 },
  'Serpentes Ocultas': { status: 'Paralisar', statusChance: .15, poison: true },
  'Shuriken de Papel': { status: 'Paralisar', statusChance: .2 },
  'Susanoo': { status: 'Atordoar', statusChance: .2 },
  'Yamata no Jutsu': { status: 'Atordoar', statusChance: .2, poison: true },
  // Taijutsu neutro
  'Agulhas de Karasu': { poison: true },
  'Arco de Guerra da Aranha': { status: 'Paralisar', statusChance: .2 },
  'Cento e Vinte e Oito Palmas': { status: 'Paralisar', statusChance: .3 },
  'Sessenta e Quatro Palmas': { status: 'Paralisar', statusChance: .3 },
  'Chute Ascendente': { status: 'Atordoar', statusChance: .25 },
  'Chute Giratório': { status: 'Empurrar', statusChance: .3 },
  'Chuva de Senbon': { status: 'Lentidão', statusChance: .25 },
  'Combo do Leão': { status: 'Atordoar', statusChance: .25 },
  'Corrente de Armas': { status: 'Paralisar', statusChance: .25 },
  'Dança da Camélia': { status: 'Atordoar', statusChance: .15 },
  'Entrada Dinâmica': { status: 'Empurrar', statusChance: .35 },
  'Furacão Dinâmico da Folha': { status: 'Empurrar', statusChance: .3 },
  'Furacão da Folha': { status: 'Empurrar', statusChance: .3 },
  'Kage Bunshin': { status: 'Atordoar', statusChance: .15 },
  'Kaiten': { status: 'Empurrar', statusChance: .45 },
  'Kunai Explosiva': { status: 'Atordoar', statusChance: .15, burn: true },
  'Leque Bashōsen': { status: 'Empurrar', statusChance: .35 },
  'Leque de Guerra': { status: 'Empurrar', statusChance: .35 },
  'Lótus Oculta': { status: 'Atordoar', statusChance: .35 },
  'Lótus Primária': { status: 'Atordoar', statusChance: .3 },
  'Mil Braços do Escorpião': { poison: true },
  'Palma de Ar': { status: 'Empurrar', statusChance: .35 },
  'Palmas Protetoras': { status: 'Lentidão', statusChance: .25 },
  'Punhos dos Leões Gêmeos': { status: 'Paralisar', statusChance: .3 },
  'Rendan Uzumaki': { status: 'Atordoar', statusChance: .25 },
  'Jutsu Sexy': { status: 'Atordoar', statusChance: .6 },
  'Senbon com Sinos': { status: 'Dormir', statusChance: .15 },
  'Tigre do Meio-Dia': { status: 'Empurrar', statusChance: .4, burn: true },
  // Sombra, Sábio, Terra e Água
  'Limbo': { status: 'Paralisar', statusChance: .3 },
  'Floresta Profunda': { status: 'Paralisar', statusChance: .3 },
  'Doton: Pedregulho': { status: 'Atordoar', statusChance: .25 },
  'Parede de Terra': { status: 'Empurrar', statusChance: .35 },
  'Chute Celestial': { status: 'Atordoar', statusChance: .3 },
  'Criação do Renascimento': { status: 'Atordoar', statusChance: .2 },
  'Golpe dos Cem Selos': { status: 'Atordoar', statusChance: .3 },
  'Impacto de Sakura': { status: 'Atordoar', statusChance: .3 },
  'Ruptura do Solo': { status: 'Lentidão', statusChance: .35 },
  'Agulhas de Água': { status: 'Lentidão', statusChance: .25 },
  'Corte de Água': { status: 'Lentidão', statusChance: .2 },
  'Dragão de Água': { status: 'Empurrar', statusChance: .35 },
  'Onda Explosiva': { status: 'Empurrar', statusChance: .4 },
  "Suiton: Jato d'Água": { status: 'Empurrar', statusChance: .3 },
};

/** Gelo (Haku, Hyōton) congela; Pain e Nagato usam magnetismo (puxar/repelir) — valem por cima do perfil antigo. */
export const OVERRIDES: Record<string, Profile> = {
  'Senbon de Gelo': { status: 'Congelar', statusChance: .22 },
  'Espelhos Demoníacos de Gelo': { status: 'Congelar', statusChance: .3 },
  'Barras de Chakra': { status: 'Paralisar', statusChance: .3, gravity: 'pull' },
  'Receptores de Chakra': { gravity: 'pull' },
  'Invocação dos Caminhos': { gravity: 'push' },
};

const hasStatus = (t: Technique) => Boolean((t.status && t.statusChance > 0) || (t.secondaryStatus && t.secondaryStatusChance) || t.burn || t.poison || t.gravity);

/** Aplica os perfis numa técnica (no lugar). Só preenche quem não tinha status; `OVERRIDES` vale sempre. */
export function applyStatusProfile(t: Technique) {
  if (t.setup) return t;
  const profile = OVERRIDES[t.name] ?? (!hasStatus(t) && !CRIT_ONLY.includes(t.name) ? STATUS_PROFILES[t.name] : undefined);
  if (profile) Object.assign(t, profile);
  return t;
}
