/**
 * Ultimate do Nagato · Kuchiyose: Pein Rikudō (26/11/2026 — pedido do usuário: "pain e nagato devem compartilhar todas as
 * mesmas habilidades de rinnegan, a diferença que nagato terá invocação: Seis Caminhos de Pain · Kuchiyose: Pein Rikudō…
 * quero que isso seja a ultimate do Nagato e fazer de maneira jogável/balanceado").
 *
 * Na obra (Narutopedia, "Six Paths of Pain"): técnica do Caminho Exterior em que o dono do Rinnegan controla até seis corpos
 * pelos receptores de chakra, com visão compartilhada; cada corpo usa um poder do Rinnegan. No jogo, a ultimate chama os Seis
 * Caminhos por `duration` segundos e cada um age no seu tempo (tabela `events`):
 * - Deva (Tendō): Shinra Tensei, repulsão em área ao redor do Nagato;
 * - Asura (Shuradō): mísseis no inimigo mais perto;
 * - Humano (Ningendō): arranca a alma de um alvo (golpe único que paralisa);
 * - Animal (Chikushōdō): invocações pisoteiam um grupo (área que atordoa);
 * - Preta (Gakidō): absorve os projéteis inimigos perto do Nagato e cura um pouco por projétil absorvido;
 * - Naraka (Jigokudō): Rei do Inferno — cura na chegada e corta à metade as recargas das técnicas perto do fim.
 * Balanceamento: o dano total (soma de `power`) fica um pouco acima da ultimate comum (6), mas espalhado em 10 s e com metade
 * em alvo único; em troca, cura, absorção e recarga. Não acumula: enquanto os Caminhos estão em campo a ultimate não reinicia.
 */
export type RikudoPath = 'deva' | 'asura' | 'human' | 'animal' | 'preta' | 'naraka';
export type RikudoEvent = { path: RikudoPath; at: number; power?: number; action?: 'heal' | 'restore' };

export const PEIN_RIKUDO = {
  name: 'Kuchiyose: Pein Rikudō',
  duration: 10,
  /** Naraka: cura na chegada (fração da vida máxima) e corte das recargas no fim. */
  healShare: .2, cooldownCut: .5,
  /** Preta: raio de absorção (m) e cura por projétil absorvido (fração da vida máxima). */
  pretaRadius: 4, pretaHeal: .02,
  events: [
    { path: 'deva', at: 0, power: 1 }, { path: 'naraka', at: 0, action: 'heal' },
    { path: 'asura', at: 1, power: .4 }, { path: 'animal', at: 1.5, power: .8 }, { path: 'human', at: 2, power: .9 },
    { path: 'asura', at: 3, power: .4 }, { path: 'deva', at: 5, power: 1 }, { path: 'asura', at: 5, power: .4 },
    { path: 'human', at: 6, power: .9 }, { path: 'animal', at: 6.5, power: .8 }, { path: 'asura', at: 7, power: .4 },
    { path: 'naraka', at: 8, action: 'restore' }, { path: 'asura', at: 9, power: .4 },
  ] as readonly RikudoEvent[],
};

/** Nome de cada caminho (para avisos na tela e para o Codex desenhar). */
export const RIKUDO_PATHS: Record<RikudoPath, { name: string; power: string }> = {
  deva: { name: 'Caminho Deva', power: 'Shinra Tensei' },
  asura: { name: 'Caminho Asura', power: 'Mísseis de Asura' },
  human: { name: 'Caminho Humano', power: 'Arrancar a Alma' },
  animal: { name: 'Caminho Animal', power: 'Invocações' },
  preta: { name: 'Caminho Preta', power: 'Absorção de Chakra' },
  naraka: { name: 'Caminho Naraka', power: 'Rei do Inferno' },
};

/** Ações que vencem entre `previous` (exclusivo) e `now` (inclusivo). Comece com previous < 0 para pegar as do segundo 0. */
export function rikudoDue(previous: number, now: number): RikudoEvent[] {
  return PEIN_RIKUDO.events.filter(e => e.at > previous && e.at <= now);
}

/** Soma do poder de dano (a ultimate comum tem poder 6 de uma vez). */
export const rikudoTotalPower = () => PEIN_RIKUDO.events.reduce((sum, e) => sum + (e.power ?? 0), 0);
