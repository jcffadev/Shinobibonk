import type { Difficulty } from './progression';

/**
 * Mapas jogáveis (pedido do usuário em 06/11/2026): cada um com temática, paleta, clima, cenário e guardiões próprios.
 * As 3 zonas de 200 s e o guardião aos 160 s de cada zona são iguais em todos os mapas (ZONES em missions.ts).
 * Progressão por mapa: Chunin libera ao vencer o Genin daquele mapa, Jonin ao vencer o Chunin e Kage ao vencer o Jonin.
 * Cenário: o atlas de ambiente tem árvore (0), pinheiro (1), bambu (2) e rocha (3); cada mapa pesa e tinge esses tipos.
 */
export type MapId = 'folha' | 'areia' | 'pedra' | 'nevoa';
export type MapWeather = { name: string; sky: string; near: number; far: number; slow?: number };
export type MapZone = { name: string; description: string; guardians: string[] };
export type GameMap = {
  id: MapId; name: string; country: string; symbol: string; color: string; description: string;
  /** Chão: cor base e pintas da textura; terreno: cores por faixa (planície, trilha, alto, detalhe). */
  ground: { base: string; flecks: string[] }; terrain: { low: string; trail: string; high: string; accent: string };
  /** Pesos dos 4 tipos de cenário e tinta aplicada aos sprites. */
  scenery: { weights: [number, number, number, number]; tint: string; count: number };
  weathers: MapWeather[]; zones: MapZone[];
};

export const MAPS: GameMap[] = [
  {
    id: 'folha', name: 'Vila da Folha', country: 'País do Fogo', symbol: '木', color: '#6fbf5a',
    description: 'Florestas densas, trilhas de treino e o portão de Konoha.',
    ground: { base: '#b7c698', flecks: ['#91a778', '#c5d4ad', '#acbd91', '#7f996a'] },
    terrain: { low: '#568c42', trail: '#98613d', high: '#555566', accent: '#db682f' },
    scenery: { weights: [6, 2, 2, 1], tint: '#ffffff', count: 150 },
    weathers: [{ name: 'Céu limpo da Folha', sky: '#8fb7d9', near: 30, far: 80 }, { name: 'Névoa espectral', sky: '#6d6a91', near: 12, far: 44 }],
    zones: [
      { name: 'Arredores da Folha', description: 'Bosque de treino · hordas, armas e altares. Guarde Ryu para abrir as kunais.', guardians: ['lee', 'neji', 'temari'] },
      { name: 'Trilha dos renegados', description: 'A ameaça cresce · elites e novos encontros de apoio.', guardians: ['kankuro', 'kakashi', 'orochimaru'] },
      { name: 'Cerco dos Kage', description: 'Pressão máxima · enfrente o guardião e sobreviva até o fim dos dez minutos.', guardians: ['gaara', 'hashirama', 'madara', 'pain'] },
    ],
  },
  {
    id: 'areia', name: 'Vila da Areia', country: 'País do Vento', symbol: '砂', color: '#e0a85a',
    description: 'Dunas escaldantes, cânions de arenito e tempestades de areia.',
    ground: { base: '#e3c48c', flecks: ['#d4ad6f', '#f0d9a8', '#c99a5c', '#e8cf9a'] },
    terrain: { low: '#d9b072', trail: '#b98546', high: '#a5703f', accent: '#f1d08e' },
    scenery: { weights: [0, 0, 1, 8], tint: '#f2c98a', count: 90 },
    weathers: [{ name: 'Tempestade de areia', sky: '#a9825c', near: 26, far: 72, slow: .73 }, { name: 'Sol do deserto', sky: '#f0c27a', near: 34, far: 90 }],
    zones: [
      { name: 'Dunas de Suna', description: 'Areia fofa e marionetes perdidas · kunais enterradas pelo caminho.', guardians: ['temari', 'kankuro', 'lee'] },
      { name: 'Cânion dos Ventos', description: 'Rajadas cortantes · elites do deserto e emboscadas.', guardians: ['gaara', 'orochimaru', 'sasuke'] },
      { name: 'Muralha do Kazekage', description: 'Pressão máxima no coração da vila escondida na areia.', guardians: ['gaara', 'pain', 'madara'] },
    ],
  },
  {
    id: 'pedra', name: 'Vila da Pedra', country: 'País da Terra', symbol: '岩', color: '#9a8f86',
    description: 'Montanhas rochosas, pontes de pedra e pedreiras abandonadas.',
    ground: { base: '#a39a90', flecks: ['#8c8379', '#b8afa4', '#7a726a', '#c2b9ad'] },
    terrain: { low: '#7f776d', trail: '#6b5440', high: '#4f4a52', accent: '#c06a3a' },
    scenery: { weights: [1, 4, 0, 7], tint: '#d6cdc2', count: 130 },
    weathers: [{ name: 'Ventania das montanhas', sky: '#9aa3ad', near: 22, far: 66 }, { name: 'Poeira de pedreira', sky: '#8a7f73', near: 16, far: 52 }],
    zones: [
      { name: 'Pedreira de Iwa', description: 'Terreno irregular · rochas, armas e altares escondidos.', guardians: ['sakura', 'neji', 'tenten'] },
      { name: 'Ponte de Kannabi', description: 'Campo de batalha da guerra · elites resistentes.', guardians: ['jiraiya', 'kakashi', 'tsunade'] },
      { name: 'Pico do Tsuchikage', description: 'Pressão máxima no topo da montanha.', guardians: ['minato', 'madara', 'pain'] },
    ],
  },
  {
    id: 'nevoa', name: 'Vila da Névoa Oculta', country: 'País da Água', symbol: '霧', color: '#6fa9b8',
    description: 'Pântanos enevoados, lagos frios e a ponte inacabada.',
    ground: { base: '#7f9a96', flecks: ['#6b8783', '#93aeaa', '#5f7a77', '#a3bcb7'] },
    terrain: { low: '#4f6f69', trail: '#5d5a4c', high: '#3f4f5a', accent: '#5a9bb0' },
    scenery: { weights: [4, 3, 2, 1], tint: '#9fc4c4', count: 140 },
    weathers: [{ name: 'Névoa Oculta', sky: '#8fa6a8', near: 8, far: 34 }, { name: 'Garoa fria', sky: '#6f8790', near: 14, far: 48 }],
    zones: [
      { name: 'Ponte de Tazuna', description: 'Névoa densa · os inimigos surgem de perto. Kunais pelo pântano.', guardians: ['kakashi', 'hinata', 'shikamaru'] },
      { name: 'Lago Sangrento', description: 'A Névoa Sangrenta · elites rápidos e emboscadas.', guardians: ['itachi', 'guy', 'tobirama'] },
      { name: 'Torre do Mizukage', description: 'Pressão máxima dentro da névoa.', guardians: ['tobirama', 'itachi', 'madara'] },
    ],
  },
];
export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m])) as Record<MapId, GameMap>;
export const DIFFICULTY_ORDER: Difficulty[] = ['Genin', 'Chunin', 'Jonin', 'Kage'];
