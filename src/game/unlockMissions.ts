import type { Difficulty } from './progression';
import type { MapId } from './maps';

/**
 * Missões de desbloqueio (pedido do usuário em 06/11/2026). Para cada shinobi bloqueado:
 * - jogar o MAPA na DIFICULDADE indicada;
 * - ter selado antes os shinobis de `requires` (cadeias de história, ex.: Neji só depois da Hinata; Hashirama só depois da Tsunade);
 * - na run, chegar a `kills` abates e ao minuto `minute` → o "Shinobi para selar" aparece; derrotar e selar libera na conta.
 * Lendários (Madara e Hashirama): retrato oculto, missão no Kage, aparecem só no fim da run.
 * Temas e ligações vêm dos arcos canônicos (Narutopedia); mapa, dificuldade, abates e minutos são regras do protótipo (PROPOSTO).
 */
export type UnlockMission = { map: MapId; difficulty: Difficulty; minute: number; kills: number; requires?: string[]; legendary?: boolean; title: string; story: string };
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
};
export const LEGENDARY = new Set(Object.entries(UNLOCK_MISSIONS).filter(([, m]) => m.legendary).map(([id]) => id));
/** Requisitos de história ainda não cumpridos (shinobis que precisam ter sido selados antes). */
export function missingRequirements(id: string, sealed: ReadonlySet<string>) { return (UNLOCK_MISSIONS[id]?.requires ?? []).filter((r) => !sealed.has(r)); }
