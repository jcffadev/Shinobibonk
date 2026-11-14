import type { Element, Shape, Technique } from './heroes.ts';

const attack = (name: string, shape: Shape, element: Element, color: string, power: number, range: number, slow = false): Technique =>
  ({ name, shape, element, color, power, range, school:'Ninjutsu', cooldown:0, statusChance:0, unlockLevel:1, slow });

export const BIJUU = [
  { id:'shukaku', name:'Shukaku', attacks:[attack('Selo Fúnebre de Areia','Área','Areia','#e2ba7f',1.7,2.5,true),attack('Projéteis de Vento','Em V','Vento','#b3ead3',1.45,9)] },
  { id:'matatabi', name:'Matatabi', attacks:[attack('Rugido de Chamas Azuis','Cone','Fogo','#69c9ff',1.8,6),attack('Garras Flamejantes','Linha','Fogo','#81e5ff',1.5,9)] },
  { id:'isobu', name:'Isobu', attacks:[attack('Corais da Três Caudas','Área','Água','#ff9b9f',1.65,2.5,true),attack('Investida da Carapaça','Linha','Água','#75cbd9',1.95,10)] },
  { id:'son-goku', name:'Son Gokū', attacks:[attack('Erupção de Lava','Área','Fogo','#ff6e39',2.1,2.7),attack('Onda de Rocha Fundida','Onda','Terra','#ef9660',1.55,5)] },
  { id:'kokuo', name:'Kokuō', attacks:[attack('Investida de Chifres','Linha','Neutro','#ede7f2',2,11),attack('Vapor Escaldante','Cone','Água','#cbd4f5',1.65,6,true)] },
  { id:'saiken', name:'Saiken', attacks:[attack('Nuvem Corrosiva','Área','Sombra','#c8e67a',1.8,2.8,true),attack('Jato Alcalino','Cone','Água','#b6df9e',1.7,7)] },
  { id:'chomei', name:'Chōmei', attacks:[attack('Nuvem de Escamas','Área','Neutro','#dbf480',1.6,3,true),attack('Rasante Alada','Em V','Neutro','#a5e97e',1.75,11)] },
  { id:'gyuki', name:'Gyūki', attacks:[attack('Turbilhão de Tentáculos','Onda','Neutro','#e99aa4',1.9,5.6),attack('Nuvem de Tinta','Área','Sombra','#ab91d9',1.65,2.8,true)] },
  { id:'kurama', name:'Kurama', attacks:[attack('Varredura das Nove Caudas','Onda','Neutro','#ffab5b',2,5.6),attack('Garra de Chakra','Em V','Neutro','#ffd175',1.8,10)] },
];

export const BIJUU_BY_ID = Object.fromEntries(BIJUU.map(beast=>[beast.id,beast])) as Record<string, typeof BIJUU[number]>;
export const BIJUU_BOMB = attack('Bijūdama','Área','Sombra','#dfb2ff',2.8,3.3);
export const beastPhase = (ratio: number) => ratio > 2/3 ? 1 : ratio > 1/3 ? 2 : 3;
export const rollBijuu = (rng = Math.random) => BIJUU[Math.min(BIJUU.length-1,Math.floor(rng()*BIJUU.length))];
export const bijuuLamens = (difficulty: number, plans: number) => Math.round(180 * difficulty * (1 + .33 * plans));

/**
 * Folhas de COSTAS das bijū (Rodada 59 — pedido do usuário: bijū andando de frente e de costas). As folhas atuais
 * (`/assets/bijuu/motion-v1-1..3.png`) só têm a vista lateral/de frente. Quando o Codex gerar as folhas de costas no MESMO
 * layout (1024×768, 4 colunas × 3 linhas de 256×256: passo A, passo B, técnica, rugido/recuo; linhas na mesma ordem de
 * BIJUU, 3 bijū por página), basta registrar aqui o caminho de cada página (índice 0 = página 1). Página vazia = sem
 * costas (a bijū continua usando a folha de frente). Pedido de arte: docs/development/PEDIDO-ARTE-BIJUU-COSTAS.md.
 */
export const BIJUU_BACK_SHEETS: (string | undefined)[] = [];
/** Página da folha (0, 1, 2) e linha dentro dela para a bijū `index` de BIJUU. */
export const bijuuSheetCell = (index: number) => ({ page: Math.floor(index / 3), row: index % 3 });
/**
 * Vista de costas com histerese (mesma regra do jogador): andando para longe da câmera (`away` > 0,26) vira de costas;
 * volta de frente abaixo de 0,1; parada mantém a última vista. `away` = cosseno entre o passo e a direção "para dentro
 * da tela" no chão.
 */
export function bijuuFacesAway(previous: boolean, away: number | undefined) {
  if (away === undefined) return previous;
  if (away > .26) return true;
  if (away < .1) return false;
  return previous;
}
