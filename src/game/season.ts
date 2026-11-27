/**
 * Elenco da temporada, captura com 3 tentativas e o evento "Uma nova Organização surge!" (27/11/2026). Lógica pura.
 *
 * Pedido do usuário: "bloquear todos os personagens que não são iniciais academia/genin, deixar o trio do som · Deixar
 * Terceiro Hokage, Tsunade normal, Jiraya, Orochimaru como épicos · Todos os Kages serão lendários... · Deixar Iruka,
 * verificar se ele realmente é Chuunin ou Jounin em Naruto. · Deixar Hanabi/Hiashi · Deixar primeira versão · Os Jounins
 * liderees de time, Kakashi, Kurenai, Guy...etc · Deixar Zabuza e Haku · Porém... Os jogavéis serão apenas personagens
 * academia, os genins você vai deixar missões para desbloquea-los... assim como os Chounins pelo evento... Os personagens da
 * Akatsuki desbloqueáveis serão Itachi e Kisame... Porém só por evento que iremos criar um outro evento rotativo... que será
 * 'Uma nova Organização surge!' Faça quests difíceis de serem atingidas para liberar Itachi e Kisame... com chance de
 * aparecimento e chance de captura baixa, lembrando que todas as capturas devem apenas ser possível tentar 3x o selamento, se
 * não o personagem escapa · Aviso na tela quando eles escaparem".
 * Escolhas do usuário na mesma conversa: começa só o Naruto Academia; Kages só de primeira versão; os bloqueados aparecem como
 * "Em breve"; entre os Jōnins líderes de time também Minato Jonin e Yamato.
 *
 * Iruka é Chūnin na obra (Narutopedia: classificação Chūnin, professor da Academia), então vem pelo evento: completar o Exame
 * Chūnin libera o Iruka. Chances, rotação e metas do evento são PROPOSTAS — ajustar depois de jogar.
 */
export type SeasonRank = 'academia' | 'genin' | 'chunin' | 'jonin' | 'epico' | 'lendario' | 'akatsuki';

export const SEASON_ROSTER: Readonly<Record<string, SeasonRank>> = {
  naruto: 'academia',
  // Genin (missões), com o Trio do Som; Hanabi e Haku também saem por missão.
  'naruto-genin': 'genin', sasuke: 'genin', sakura: 'genin', ino: 'genin', shikamaru: 'genin', choji: 'genin', kiba: 'genin',
  hinata: 'genin', shino: 'genin', lee: 'genin', neji: 'genin', tenten: 'genin', gaara: 'genin', temari: 'genin',
  kankuro: 'genin', obito: 'genin', dosu: 'genin', zaku: 'genin', kin: 'genin', hanabi: 'genin', haku: 'genin',
  // Chūnin: pelo evento (Exame Chūnin completo).
  iruka: 'chunin',
  // Jōnins líderes de time e os outros mantidos (missões).
  kakashi: 'jonin', kurenai: 'jonin', guy: 'jonin', asuma: 'jonin', minato: 'jonin', yamato: 'jonin', hiashi: 'jonin', zabuza: 'jonin',
  // Épicos.
  tsunade: 'epico', jiraiya: 'epico', orochimaru: 'epico',
  // Lendários: os Kages de primeira versão (27/11: o Terceiro Hokage também — usuário: "HIruzen é um Kage, ele deveria ser lendário").
  hiruzen: 'lendario', hashirama: 'lendario', tobirama: 'lendario', rasa: 'lendario', 'raikage-terceiro': 'lendario', 'raikage-quarto': 'lendario',
  onoki: 'lendario', mei: 'lendario', gengetsu: 'lendario',
  // Akatsuki: só pelo evento "Uma nova Organização surge!".
  'itachi-akatsuki': 'akatsuki', kisame: 'akatsuki',
};
export const SEASON_STARTERS: readonly string[] = ['naruto'];
export const SEASON_RANK_LABEL: Readonly<Record<SeasonRank, string>> = {
  academia: 'Academia', genin: 'Genin', chunin: 'Chūnin', jonin: 'Jōnin', epico: 'Épico', lendario: 'Lendário', akatsuki: 'Akatsuki',
};
export const inSeason = (id: string) => Object.prototype.hasOwnProperty.call(SEASON_ROSTER, id);
export const seasonRank = (id: string): SeasonRank | undefined => inSeason(id) ? SEASON_ROSTER[id] : undefined;
/** Ranks que só saem por evento (não têm missão de desbloqueio comum). */
export const EVENT_ONLY_RANKS: readonly SeasonRank[] = ['chunin', 'akatsuki'];
/** O shinobi tem missão de desbloqueio comum nesta temporada? */
export const hasSeasonMission = (id: string) => inSeason(id) && !SEASON_STARTERS.includes(id) && !EVENT_ONLY_RANKS.includes(SEASON_ROSTER[id]);

/**
 * Captura (todas: Selamento de Conta e Edo Tensei). Cada tentativa tem a chance do rank; no máximo 3 tentativas, depois o
 * shinobi escapa. Chance total em 3 tentativas: Genin 99% · Jōnin 94% · Épico 83% · Lendário 66% · Akatsuki 39%.
 */
export const SEAL_ATTEMPTS = 3;
export const CAPTURE_CHANCE: Readonly<Record<SeasonRank, number>> = {
  academia: .9, genin: .8, chunin: .7, jonin: .6, epico: .45, lendario: .3, akatsuki: .15,
};
/** Chance por tentativa de selar este shinobi (fora da temporada, como Genin). */
export const captureChance = (id: string) => CAPTURE_CHANCE[seasonRank(id) ?? 'genin'];
/** Uma tentativa de selamento dá certo? */
export const sealSucceeds = (id: string, roll: number) => roll < captureChance(id);
/** Chance de selar em até `attempts` tentativas. */
export const captureOdds = (chance: number, attempts: number = SEAL_ATTEMPTS) => 1 - (1 - Math.max(0, Math.min(1, chance))) ** Math.max(0, attempts);
/** Depois de uma falha: tenta de novo ou escapa. */
export const afterFailedSeal = (attemptsUsed: number) => attemptsUsed >= SEAL_ATTEMPTS ? 'escape' as const : 'retry' as const;

/** Escolhe a versão da família para um encontro: só versões da temporada (a de `preferred` se estiver nela). */
export function seasonVersion(preferred: string, familyVersions: readonly string[]) {
  if (inSeason(preferred) && SEASON_ROSTER[preferred] !== 'akatsuki') return preferred;
  return familyVersions.find(id => inSeason(id) && SEASON_ROSTER[id] !== 'akatsuki');
}

/**
 * "Uma nova Organização surge!" — evento rotativo: fica aberto 7 dias a cada 14 (começou na segunda 23/11/2026). Na partida,
 * cumpridas as metas (mapa, dificuldade, minuto, abates e os selamentos pedidos), o membro da Akatsuki pode aparecer uma vez
 * por partida, com chance baixa; derrotado, vira "Shinobi para selar" com a chance de captura da Akatsuki.
 */
export const ORGANIZATION_ROTATION = { epoch: Date.UTC(2026, 10, 23, 3), periodDays: 14, activeDays: 7 } as const;
export type OrganizationTarget = {
  heroId: string; map: 'folha' | 'areia' | 'pedra' | 'nevoa'; difficulty: 'Genin' | 'Chunin' | 'Jonin' | 'Kage';
  minute: number; kills: number; requires: readonly string[]; appearChance: number; title: string; story: string;
};
export const ORGANIZATION_EVENT = {
  id: 'nova-organizacao', title: 'Uma nova Organização surge!',
  story: 'Mantos negros com nuvens vermelhas são vistos nas fronteiras. Dois desertores rondam as vilas atrás das Bijū.',
  targets: [
    { heroId: 'kisame', map: 'nevoa', difficulty: 'Jonin', minute: 10, kills: 2500, requires: ['zabuza', 'guy'], appearChance: .25,
      title: 'A Lâmina que Devora Chakra', story: 'Na névoa, um espadachim com uma espada envolta em bandagens caça quem ousa resistir.' },
    { heroId: 'itachi-akatsuki', map: 'folha', difficulty: 'Kage', minute: 12, kills: 4000, requires: ['kisame', 'kakashi'], appearChance: .15,
      title: 'O Retorno do Corvo', story: 'Com o parceiro ao lado, o Uchiha volta à Folha. Um olhar basta para prender o inimigo num pesadelo.' },
  ] as readonly OrganizationTarget[],
} as const;
const DAY = 86_400_000;
/** O evento está aberto agora? E quando fecha (aberto) ou abre (fechado). */
export function organizationStatus(now: number) {
  const { epoch, periodDays, activeDays } = ORGANIZATION_ROTATION;
  const day = Math.floor((now - epoch) / DAY), inPeriod = ((day % periodDays) + periodDays) % periodDays;
  const periodStart = epoch + (day - inPeriod) * DAY;
  const active = inPeriod < activeDays;
  return { active, changesAt: active ? periodStart + activeDays * DAY : periodStart + periodDays * DAY };
}
/** Metas de um alvo do evento cumpridas nesta partida (sem a chance de aparecer). */
export function organizationReady(t: OrganizationTarget, run: { map: string; difficulty: string; elapsed: number; kills: number }, sealed: ReadonlySet<string>) {
  return run.map === t.map && run.difficulty === t.difficulty && run.elapsed >= t.minute * 60 && run.kills >= t.kills && t.requires.every(r => sealed.has(r));
}

/**
 * Lista de personagens por time (27/11/2026 — usuário: "Colocar a lista de personagens organizados por time... Exemplo,
 * Naruto, Sasuke, Sakura, Kakashi... assim por diante"). Cada shinobi da temporada fica no time da obra; quem está fora da
 * temporada vai para o fim ("Em breve").
 */
export const SEASON_TEAMS: readonly { name: string; members: readonly string[] }[] = [
  { name: 'Time 7', members: ['naruto', 'naruto-genin', 'sasuke', 'sakura', 'kakashi', 'yamato'] },
  { name: 'Time 8', members: ['kiba', 'hinata', 'shino', 'kurenai'] },
  { name: 'Time 10', members: ['ino', 'shikamaru', 'choji', 'asuma'] },
  { name: 'Time Guy', members: ['lee', 'neji', 'tenten', 'guy'] },
  { name: 'Irmãos da Areia', members: ['gaara', 'temari', 'kankuro', 'rasa'] },
  { name: 'Trio do Som', members: ['dosu', 'zaku', 'kin'] },
  { name: 'Time Minato', members: ['minato', 'obito'] },
  { name: 'Clã Hyūga', members: ['hanabi', 'hiashi'] },
  { name: 'Academia e Hokages', members: ['iruka', 'hiruzen', 'hashirama', 'tobirama'] },
  { name: 'Sannin Lendários', members: ['jiraiya', 'tsunade', 'orochimaru'] },
  { name: 'Névoa', members: ['zabuza', 'haku', 'mei', 'gengetsu'] },
  { name: 'Kages', members: ['raikage-terceiro', 'raikage-quarto', 'onoki'] },
  { name: 'Akatsuki', members: ['itachi-akatsuki', 'kisame'] },
];
const TEAM_INDEX: Record<string, { team: number; slot: number }> = Object.fromEntries(
  SEASON_TEAMS.flatMap((t, team) => t.members.map((id, slot) => [id, { team, slot }])));
/** Time do shinobi na lista (ou "Em breve", fora da temporada). */
export const seasonTeam = (id: string) => TEAM_INDEX[id] ? SEASON_TEAMS[TEAM_INDEX[id].team].name : 'Em breve';
/** Ordem na lista por time: times na ordem acima, membros na ordem do time; fora da temporada no fim. */
export const teamOrder = (id: string) => TEAM_INDEX[id] ? TEAM_INDEX[id].team * 100 + TEAM_INDEX[id].slot : 100_000;
