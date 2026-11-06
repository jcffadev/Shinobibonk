import type { Difficulty } from './progression';
import type { MapId } from './maps';

/**
 * Missões de desbloqueio (pedido do usuário em 06/11/2026). Cada shinobi bloqueado tem uma missão: jogar o MAPA na
 * DIFICULDADE indicada; a partir do minuto indicado (tempo decorrido) o "Shinobi para selar" dele aparece; derrotar e
 * selar libera o shinobi na conta (e libera as técnicas dele para o pool dos outros).
 * Lendários (Madara e Hashirama): retrato oculto, missão no Kage e aparecem só no fim da run.
 * Temas inspirados em arcos canônicos (Narutopedia); a escolha de mapa/dificuldade é regra do protótipo (PROPOSTO).
 */
export type UnlockMission = { map: MapId; difficulty: Difficulty; minute: number; legendary?: boolean; title: string; story: string };
export const UNLOCK_MISSIONS: Record<string, UnlockMission> = {
  lee: { map: 'folha', difficulty: 'Genin', minute: 1, title: 'O Esforço da Juventude', story: 'Prove sua força nos Arredores da Folha.' },
  neji: { map: 'folha', difficulty: 'Genin', minute: 1, title: 'Gaiola do Destino', story: 'Enfrente o prodígio Hyuga nos campos de treino.' },
  hinata: { map: 'folha', difficulty: 'Genin', minute: 2, title: 'Coragem Gentil', story: 'Encontre Hinata treinando escondida na floresta.' },
  tenten: { map: 'folha', difficulty: 'Genin', minute: 2, title: 'Chuva de Armas', story: 'Desvie do arsenal de Tenten na trilha.' },
  temari: { map: 'areia', difficulty: 'Genin', minute: 1, title: 'Vendaval de Suna', story: 'Atravesse as dunas e vença a mestra do leque.' },
  kankuro: { map: 'areia', difficulty: 'Genin', minute: 2, title: 'Teatro das Marionetes', story: 'Corte os fios de Kankuro no deserto.' },
  kakashi: { map: 'nevoa', difficulty: 'Genin', minute: 2, title: 'A Ponte de Tazuna', story: 'Sobreviva à névoa e encontre o Ninja Copiador.' },
  shikamaru: { map: 'folha', difficulty: 'Chunin', minute: 3, title: 'Exame Chunin', story: 'Supere a estratégia das sombras no exame.' },
  gaara: { map: 'areia', difficulty: 'Chunin', minute: 3, title: 'O Jinchuriki da Areia', story: 'Resista à areia de Gaara no Cânion dos Ventos.' },
  guy: { map: 'nevoa', difficulty: 'Chunin', minute: 3, title: 'Rival Eterno', story: 'Aceite o desafio da Fera Verde no lago enevoado.' },
  jiraiya: { map: 'pedra', difficulty: 'Chunin', minute: 3, title: 'O Sannin Pervertido', story: 'Encontre o Sábio dos Sapos nas montanhas de pedra.' },
  tsunade: { map: 'pedra', difficulty: 'Jonin', minute: 4, title: 'A Busca por Tsunade', story: 'Convença a Lendária Perdedora a voltar.' },
  orochimaru: { map: 'folha', difficulty: 'Jonin', minute: 4, title: 'Invasão de Konoha', story: 'Detenha a serpente durante a invasão.' },
  itachi: { map: 'nevoa', difficulty: 'Jonin', minute: 4, title: 'O Corvo na Névoa', story: 'Enfrente o genjutsu de Itachi.' },
  minato: { map: 'pedra', difficulty: 'Jonin', minute: 5, title: 'Ponte de Kannabi', story: 'Alcance o Relâmpago Amarelo na guerra contra Iwa.' },
  pain: { map: 'areia', difficulty: 'Jonin', minute: 5, title: 'Os Seis Caminhos', story: 'Resista ao Caminho Deva na Muralha do Kazekage.' },
  tobirama: { map: 'nevoa', difficulty: 'Kage', minute: 5, title: 'O Segundo Hokage', story: 'Domine as águas da Névoa Oculta.' },
  madara: { map: 'pedra', difficulty: 'Kage', minute: 7, legendary: true, title: 'O Fantasma dos Uchiha', story: 'Sobreviva até o fim no Pico do Tsuchikage e sele a lenda.' },
  hashirama: { map: 'folha', difficulty: 'Kage', minute: 7, legendary: true, title: 'O Deus dos Shinobi', story: 'Resista ao Cerco dos Kage e sele o Primeiro Hokage.' },
};
export const LEGENDARY = new Set(Object.entries(UNLOCK_MISSIONS).filter(([, m]) => m.legendary).map(([id]) => id));
