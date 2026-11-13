import type { Technique } from './heroes.ts';
import { expansionVisual } from './rosterExpansion.ts';

export const SUMMON_EFFECT_ATLAS='/assets/technique-summons-v1.png';
const summons:readonly (readonly [RegExp,number])[]=[
  [/Leões de Tinta/,0],[/Ave de Tinta|Feras de Tinta/,1],[/Tubarão/,2],[/Hiruko/,3],
  [/Cem Marionetes/,4],[/Ibuse/,5],[/Molusco/,6],[/Invocação dos Caminhos|Seis Caminhos do Rinnegan/,7],
];
export const summonEffectCell=(name:string)=>summons.find(([pattern])=>pattern.test(name))?.[1];
export const BATTLE_EFFECT_ATLAS='/assets/technique-effects-roster-v1.png';
const profiles:readonly (readonly [RegExp,number])[]=[
  [/Amaterasu/,1],
  [/Chidori|Raikiri|Kirin|Relâmpago|Faísca|Estocada Infernal|Dedo Único|Lança do Inferno|Liger Bomb/,0],
  [/Fênix de Fogo/,3],
  [/Bola de Fogo|Chamas Majestosas|Katon|Chamas de Kannabi|Liberação dos Cinco Elementos|Formação dos Cinco Elementos/,2],
  [/Pavão da Manhã/,15],
  [/Tigre do Meio-Dia/,14],
  [/Dragão de Água/,5],
  [/Dragão de Madeira|Madeira|Mokuton|Floresta Profunda|Nascimento das Árvores|^Raízes/,8],
  [/Espelhos|Gelo/,17],
  [/Caixão|Sepultamento|Funeral do Deserto|Deserto Imperial/,7],
  [/Pó de Ouro|Muralha de Ouro|Funeral de Ouro/,20],
  [/Palma|Kaiten|Trigramas|Mil Braços|Byakugan/,12],
  [/Corrente|Correntes|Adamantina/,13],
  [/Chōjū Giga|Corvos/,21],
  [/Kamui|Tsukuyomi|Kotoamatsukami|Vórtice|Tensei|Bansho Tenin/,16],
  [/Kikaichū|Insetos|Aburame/,11],
  [/Sombras|Mente|Genjutsu Sharingan|Ilusória|^Limbo/,10],
  [/Tóxica|Venenosa|Corrosiva|^Sopro de Ibuse/,22],
  [/Fumaça|Névoa Oculta|Assassinato na Névoa|Cinzas Ardentes|Miragem/,19],
  [/Lava|Óleo Flamejante|Goemon|Kunai Explosiva|Bijūdama|Rendan Uzumaki/,23],
  [/Espada|Espadas|Lâmina|Lâminas|Foice|Kubikiribōchō/,18],
  [/Furacão|Vendaval|Fuuton|Tornado|Leque|Kamatari/,6],
  [/Onda Explosiva|Suiton|Água|Hidratação|^Mar do Segundo Hokage|Tubarão/,4],
  [/Lótus|Akimichi|Borboleta|Tanque Humano|^Entrada Dinâmica|^Presa/,9],
];

const visualCells:Record<string,number>={swarm:11,mind:10,chains:13,roots:8,shark:4,water:4,steam:19,poison:22,lava:23,lightning:0,fire:2,elements:2,gold:20,iron:7,ice:17,ink:21,palms:12,blade:18,staff:18,scan:12,paths:16,impact:9,wings:15,wheel:9,fang:9,mark:6,cube:9,spiral:16};
const elementCells:Record<Technique['element'],number>={Neutro:18,Fogo:2,Água:4,Vento:6,Terra:9,Raio:0,Madeira:8,Areia:20,Sombra:10,Sábio:12};
export function battleEffectCell(technique:Technique) {
  const named=profiles.find(([name])=>name.test(technique.name));
  const visual=expansionVisual(technique.name);
  return named?.[1] ?? (visual?visualCells[visual]:undefined) ?? elementCells[technique.element];
}
export function hasNamedBattleEffect(name:string) {
  return summonEffectCell(name)!==undefined || !!expansionVisual(name) || profiles.some(([pattern])=>pattern.test(name));
}
