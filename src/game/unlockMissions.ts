import type { Difficulty } from './progression';
import type { MapId } from './maps';
import { unlockedHeroes } from './account.ts';

/**
 * Missões de desbloqueio (pedido do usuário em 06/11/2026). Para cada shinobi bloqueado:
 * - jogar o MAPA na DIFICULDADE indicada;
 * - ter selado antes os shinobis de `requires` (cadeias de história, ex.: Neji só depois da Hinata; Hashirama só depois da Tsunade);
 * - na run, chegar a `kills` abates e ao minuto `minute` → o "Shinobi para selar" aparece; derrotar e selar libera na conta.
 * Lendários (Madara e Hashirama): retrato oculto, missão no Kage, aparecem só no fim da run.
 * Temas e ligações vêm dos arcos canônicos (Narutopedia); mapa, dificuldade, abates e minutos são regras do protótipo (PROPOSTO).
 */
/**
 * `playWith` (versões separadas, 06/11/2026): a missão só conta jogando COM essa versão anterior da família. O shinobi novo só
 * começa a aparecer (Shinobi para selar) quando, nessa run, mapa + dificuldade + abates + minuto forem cumpridos.
 */
export type UnlockMission = { map: MapId; difficulty: Difficulty; minute: number; kills: number; requires?: string[]; playWith?: string; legendary?: boolean; title: string; story: string };
const V = (playWith: string, map: MapId, difficulty: Difficulty, minute: number, kills: number, title: string, story: string, legendary = false): UnlockMission => ({ playWith, map, difficulty, minute, kills, title, story, ...(legendary ? { legendary } : {}) });
/**
 * Cadeia das VERSÕES: cada passo pede jogar com a versão anterior, em dificuldade igual ou maior e com mais abates/minutos
 * que o passo anterior da família. Arcos conforme a Narutopedia; mapa, dificuldade, abates e minutos são PROPOSTOS.
 */
export const VERSION_MISSIONS: Record<string, UnlockMission> = {
  'naruto-genin': V('naruto', 'folha', 'Chunin', 3, 300, 'A Bandana da Folha', 'Jogando com Naruto Academia, vença Mizuki na floresta e conquiste a bandana de genin.'),
  'naruto-shippuden': V('naruto-genin', 'pedra', 'Jonin', 5, 600, 'O Retorno de Naruto', 'Depois do treino com Jiraiya, Naruto Genin prova a força nova nas montanhas.'),
  'naruto-kyuubi': V('naruto-shippuden', 'nevoa', 'Kage', 7, 1000, 'Controle da Kurama', 'Naruto Shippuden enfrenta a Kurama dentro de si para dominar o manto de chakra.'),
  'sasuke-shippuden': V('sasuke', 'areia', 'Chunin', 4, 380, 'Rumo a Orochimaru', 'Jogando com Sasuke Genin, atravesse o deserto atrás do poder de Orochimaru.'),
  'sasuke-rinnegan': V('sasuke-shippuden', 'pedra', 'Kage', 7, 950, 'O Rinnegan de Sasuke', 'Sasuke Shippuden desperta o Rinnegan na Quarta Guerra Ninja.'),
  'sakura-shippuden': V('sakura', 'folha', 'Chunin', 4, 380, 'Aprendiz da Tsunade', 'Jogando com Sakura Genin, prove o controle de chakra que impressionou a Quinta Hokage.'),
  'sakura-byakugou': V('sakura-shippuden', 'pedra', 'Kage', 6, 900, 'Selo da Força dos Cem', 'Sakura Shippuden libera o Byakugou no campo de batalha da guerra.'),
  'gaara-kazekage': V('gaara', 'areia', 'Jonin', 4, 550, 'O Quinto Kazekage', 'Jogando com Gaara Genin, proteja Suna como o novo Kazekage.'),
  'gaara-alianca': V('gaara-kazekage', 'pedra', 'Kage', 6, 900, 'Comandante da Aliança', 'Gaara Kazekage lidera a Divisão de Ataque na Quarta Guerra Ninja.'),
  'madara-rinnegan': V('madara', 'nevoa', 'Kage', 8, 1400, 'Reencarnação de Madara', 'Jogando com Madara Armadura, sobreviva ao Edo Tensei que devolve o Rinnegan.', true),
  'madara-seis-caminhos': V('madara-rinnegan', 'folha', 'Kage', 9, 1800, 'Jinchuriki do Dez-Caudas', 'Madara Rinnegan absorve o Dez-Caudas e vira Sábio dos Seis Caminhos.', true),
  'hashirama-sabio': V('hashirama', 'pedra', 'Kage', 8, 1300, 'O Vale do Fim', 'Jogando com Hashirama Hokage, enfrente Madara no Vale do Fim com o Modo Sábio.', true),
  'kakashi-hokage': V('kakashi', 'folha', 'Jonin', 4, 500, 'O Sexto Hokage', 'Jogando com Kakashi Jonin, assuma a vila depois da Quarta Guerra.'),
  'itachi-akatsuki': V('itachi', 'nevoa', 'Kage', 5, 700, 'O Manto da Akatsuki', 'Jogando com Itachi ANBU, siga o caminho que o levou à Akatsuki.'),
  'minato-hokage': V('minato', 'folha', 'Kage', 6, 750, 'O Quarto Hokage', 'Jogando com Minato Jonin, defenda a Folha na noite do ataque da Kurama.'),
  'tsunade-hokage': V('tsunade', 'folha', 'Kage', 5, 650, 'A Quinta Hokage', 'Jogando com Tsunade Sannin, aceite o chapéu de Hokage.'),
  'tsunade-byakugou': V('tsunade-hokage', 'pedra', 'Kage', 7, 1000, 'A Força do Byakugou', 'Tsunade Hokage libera o selo da testa contra Madara.'),
  'jiraiya-sabio': V('jiraiya', 'areia', 'Kage', 6, 750, 'Monte Myōboku', 'Jogando com Jiraiya Sannin, domine o Modo Sábio com Fukasaku e Shima.'),
  'orochimaru-som': V('orochimaru', 'nevoa', 'Kage', 5, 650, 'A Vila do Som', 'Jogando com Orochimaru Sannin, funde a Vila Oculta do Som.'),
  'lee-shippuden': V('lee', 'folha', 'Chunin', 4, 380, 'Juventude Renovada', 'Jogando com Rock Lee Genin, volte a treinar com Guy depois da recuperação.'),
  'lee-portoes': V('lee-shippuden', 'nevoa', 'Jonin', 5, 650, 'Os Portões Internos', 'Rock Lee Shippuden abre os portões internos na névoa.'),
  'neji-jonin': V('neji', 'folha', 'Chunin', 4, 400, 'O Jonin Hyuga', 'Jogando com Neji Genin, mostre a evolução do Byakugan.'),
  'hinata-shippuden': V('hinata', 'folha', 'Chunin', 3, 350, 'Determinação de Hinata', 'Jogando com Hinata Genin, defenda a vila durante a invasão de Pain.'),
  'hinata-leoes': V('hinata-shippuden', 'nevoa', 'Jonin', 5, 650, 'Leões Gêmeos', 'Hinata Shippuden desperta os Punhos dos Leões Gêmeos na guerra.'),
  'shikamaru-estrategista': V('shikamaru', 'areia', 'Jonin', 4, 550, 'O Plano contra a Akatsuki', 'Jogando com Shikamaru Genin, monte a armadilha contra Hidan e Kakuzu.'),
  'shikamaru-conselheiro': V('shikamaru-estrategista', 'pedra', 'Kage', 6, 850, 'Conselheiro do Hokage', 'Shikamaru Estrategista comanda a Aliança e vira o braço direito do Hokage.'),
  'temari-shippuden': V('temari', 'areia', 'Chunin', 3, 320, 'Embaixadora de Suna', 'Jogando com Temari Genin, escolte o Kazekage pelas dunas.'),
  'tenten-shippuden': V('tenten', 'folha', 'Chunin', 3, 320, 'O Leque Bashōsen', 'Jogando com Tenten Genin, recupere a ferramenta lendária do Sábio.'),
  'kankuro-shippuden': V('kankuro', 'areia', 'Chunin', 4, 400, 'A Marionete de Sasori', 'Jogando com Kankuro Genin, conquiste a marionete do Escorpião Vermelho.'),
  'kankuro-alianca': V('kankuro-shippuden', 'pedra', 'Jonin', 5, 650, 'Marionetista da Aliança', 'Kankuro Shippuden lidera a defesa da Aliança Shinobi.'),
  'guy-sexto-portao': V('guy', 'nevoa', 'Jonin', 4, 550, 'O Sexto Portão', 'Jogando com Might Guy Jonin, enfrente Kisame abrindo o Portão da Visão.'),
  'guy-setimo-portao': V('guy-sexto-portao', 'pedra', 'Kage', 6, 900, 'O Sétimo Portão', 'Might Guy Sexto Portão abre o Portão da Admiração na guerra.'),
};
export const UNLOCK_MISSIONS: Record<string, UnlockMission> = {
  // Folha · Genin: os genin da Folha (Time Guy e Hinata)
  hinata: { map: 'folha', difficulty: 'Genin', minute: 1, kills: 120, title: 'Coragem Gentil', story: 'Encontre Hinata treinando escondida na floresta da Folha.' },
  neji: { map: 'folha', difficulty: 'Genin', minute: 2, kills: 200, requires: ['hinata'], title: 'Gaiola do Destino', story: 'Depois de conhecer Hinata, enfrente o primo prodígio do clã Hyuga.' },
  tenten: { map: 'folha', difficulty: 'Genin', minute: 2, kills: 180, requires: ['neji'], title: 'Chuva de Armas', story: 'A companheira de time de Neji testa seu arsenal na trilha.' },
  lee: { map: 'folha', difficulty: 'Genin', minute: 3, kills: 250, requires: ['tenten'], title: 'O Esforço da Juventude', story: 'Com o Time Guy reunido, Rock Lee desafia você.' },
  // Areia · Genin/Chunin: os irmãos da Areia
  temari: { map: 'areia', difficulty: 'Genin', minute: 1, kills: 150, title: 'Vendaval de Suna', story: 'Atravesse as dunas e vença a mestra do leque.' },
  kankuro: { map: 'areia', difficulty: 'Genin', minute: 2, kills: 220, requires: ['temari'], title: 'Teatro das Marionetes', story: 'O irmão de Temari corta o caminho com suas marionetes.' },
  gaara: { map: 'areia', difficulty: 'Chunin', minute: 3, kills: 350, requires: ['kankuro'], title: 'O Jinchuriki da Areia', story: 'Com os irmãos selados, resista à areia de Gaara.' },
  // Névoa · Genin: arco do País das Ondas
  kakashi: { map: 'nevoa', difficulty: 'Genin', minute: 2, kills: 200, title: 'A Ponte de Tazuna', story: 'Sobreviva à névoa e encontre o Ninja Copiador.' },
  // Folha · Chunin: Exame Chunin
  shikamaru: { map: 'folha', difficulty: 'Chunin', minute: 3, kills: 300, title: 'Exame Chunin', story: 'Supere a estratégia das sombras no exame.' },
  guy: { map: 'nevoa', difficulty: 'Chunin', minute: 3, kills: 350, requires: ['lee', 'kakashi'], title: 'Rival Eterno', story: 'O mestre de Lee e rival de Kakashi aceita o desafio no lago.' },
  // Pedra · Chunin/Jonin: os Sannin e o Quarto Hokage
  jiraiya: { map: 'pedra', difficulty: 'Chunin', minute: 3, kills: 320, requires: ['kakashi'], title: 'O Sábio dos Sapos', story: 'Encontre o mestre do mestre de Kakashi nas montanhas.' },
  tsunade: { map: 'pedra', difficulty: 'Jonin', minute: 4, kills: 450, requires: ['jiraiya'], title: 'A Busca por Tsunade', story: 'Jiraiya leva você até a Lendária Perdedora.' },
  orochimaru: { map: 'folha', difficulty: 'Jonin', minute: 4, kills: 450, requires: ['jiraiya'], title: 'Invasão de Konoha', story: 'O ex-companheiro de Jiraiya invade a Folha.' },
  minato: { map: 'pedra', difficulty: 'Jonin', minute: 5, kills: 500, requires: ['jiraiya', 'kakashi'], title: 'Ponte de Kannabi', story: 'O aluno de Jiraiya e mestre de Kakashi, o Relâmpago Amarelo.' },
  kushina: { map: 'folha', difficulty: 'Jonin', minute: 5, kills: 500, requires: ['minato'], title: 'A Habanero Sangrenta', story: 'A esposa de Minato e mãe de Naruto guarda a Kurama com suas correntes.' },
  itachi: { map: 'nevoa', difficulty: 'Jonin', minute: 4, kills: 480, requires: ['kakashi'], title: 'O Corvo na Névoa', story: 'Kakashi reconhece o genjutsu de Itachi na névoa.' },
  pain: { map: 'areia', difficulty: 'Jonin', minute: 5, kills: 520, requires: ['jiraiya'], title: 'Os Seis Caminhos', story: 'O antigo aluno de Jiraiya surge como Pain.' },
  // Kage: Hokages e lendas
  hashirama: { map: 'folha', difficulty: 'Kage', minute: 7, kills: 900, requires: ['tsunade'], legendary: true, title: 'O Deus dos Shinobi', story: 'A neta Tsunade abre o caminho até o Primeiro Hokage.' },
  tobirama: { map: 'nevoa', difficulty: 'Kage', minute: 5, kills: 750, requires: ['hashirama'], title: 'O Segundo Hokage', story: 'O irmão de Hashirama domina as águas da Névoa Oculta.' },
  madara: { map: 'pedra', difficulty: 'Kage', minute: 7, kills: 1000, requires: ['hashirama', 'itachi'], legendary: true, title: 'O Fantasma dos Uchiha', story: 'O rival de Hashirama retorna no Pico do Tsuchikage.' },
  ...VERSION_MISSIONS,
};
export const LEGENDARY = new Set(Object.entries(UNLOCK_MISSIONS).filter(([, m]) => m.legendary).map(([id]) => id));
/**
 * Requisitos de história ainda não cumpridos: shinobis que precisam ter sido selados antes e, nas versões, a versão anterior
 * (`playWith`) ainda bloqueada. Iniciais contam como liberados.
 */
export function missingRequirements(id: string, sealed: ReadonlySet<string>, playable: (id: string) => boolean = (r) => unlockedHeroes().has(r)) {
  const m = UNLOCK_MISSIONS[id];
  return [...(m?.requires ?? []).filter((r) => !sealed.has(r)), ...(m?.playWith && !playable(m.playWith) ? [m.playWith] : [])];
}
