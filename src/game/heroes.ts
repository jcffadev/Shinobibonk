import type { Bonuses } from './catalog';
export type School='Taijutsu'|'Ninjutsu'|'Genjutsu';
export type Element='Neutro'|'Fogo'|'Água'|'Vento'|'Terra'|'Raio'|'Madeira'|'Areia'|'Sombra'|'Sábio';
export type Shape='Projétil'|'Corpo a corpo'|'Cone'|'Onda'|'Em V'|'Linha'|'Área'|'Órbita'|'Buff';
export type Control='Atordoar'|'Paralisar'|'Dormir'|'Empurrar'|'Lentidão';
export type Technique={name:string;school:School;element:Element;shape:Shape;color:string;power:number;range:number;cooldown:number;slow?:boolean;burn?:boolean;status?:Control;statusChance:number;unlockLevel:number;setup?:Setup};
/**
 * Técnica de setup (buff puro): não causa dano, é ativada automaticamente (com inimigo a até 9 m) e dá bônus temporários.
 * Recarga própria: NÃO é reduzida pela velocidade de ataque nem pela velocidade de projétil (só pelo afixo de recarga do level-up).
 * stack=false: reativar apenas renova a duração. sage=true: Modo Sábio (elemento Sábio, Senjutsu no Ninjutsu e taijutsu corpo a corpo em área).
 */
export type Setup={cooldown:number;duration:number;bonuses:Bonuses;stack:boolean;sage?:boolean;summary:string};
export type Hero={id:string;name:string;village:string;color:string;passive:string;bonuses:Bonuses;base:{hp:number;damage:number;armor:number;speed:number;crit:number;regen:number};skills:string[];techniques:Technique[];ultimate:string;build:string;atlas?:number};
const colors:Record<Element,string>={Neutro:'#d7e6ff',Fogo:'#ff7c45',Água:'#5fb6ef',Vento:'#8de8ca',Terra:'#c7a16c',Raio:'#b3c5ff',Madeira:'#8bd464',Areia:'#ddae70',Sombra:'#ad84e8',Sábio:'#f5da86'};
const t=(name:string,school:School,element:Element,shape:Shape,power=1):Technique=>({name,school,element,shape,color:colors[element],power,range:shape==='Corpo a corpo'?1.6:shape==='Cone'?2.8:shape==='Órbita'?1.7:4.5,cooldown:shape==='Corpo a corpo'?1.2:shape==='Área'?2:1.5,slow:element==='Sombra',burn:element==='Fogo',status:school==='Genjutsu'?(name.includes('Corvo')?'Dormir':name.includes('Tsukuyomi')?'Atordoar':'Paralisar'):element==='Raio'?'Paralisar':element==='Vento'?'Empurrar':element==='Madeira'||element==='Areia'?'Lentidão':shape==='Corpo a corpo'?'Atordoar':undefined,statusChance:school==='Genjutsu'?.3:.12,unlockLevel:1});
/** Cria uma técnica de setup. Valores provisórios. */
const s=(name:string,school:School,element:Element,setup:Setup):Technique=>({name,school,element,shape:'Buff',color:colors[element],power:0,range:9,cooldown:setup.cooldown,statusChance:0,unlockLevel:1,setup});
const SAGE_MODE:Setup={cooldown:16,duration:7,bonuses:{damage:.15,area:.2},stack:false,sage:true,summary:'Entra no Modo Sábio: +dano e +área; aplica o elemento Sábio, dá Senjutsu ao Ninjutsu e faz o taijutsu corpo a corpo acertar em área ao redor.'};
function h(id:string,name:string,village:string,color:string,hp:number,damage:number,armor:number,speed:number,passive:string,bonuses:Bonuses,techniques:Technique[],ultimate:string,build:string,atlas?:number):Hero{return {id,name,village:village.startsWith('Clã')?'Vila da Folha':village,color,base:{hp,damage:damage*.55,armor,speed,crit:.05,regen:0},passive,bonuses,techniques:techniques.map((t,i)=>({...t,unlockLevel:[1,5,12,20][i]})),skills:techniques.map(t=>t.name),ultimate,build,atlas};}
// Temas canônicos; percentuais, atributos e composições são regras originais de protótipo.
export const HEROES:Hero[]=[
 h('naruto','Naruto','Vila da Folha','#f4a23a',130,18,4,7,'Determinação · até +20% de dano conforme perde HP (+10% com metade da vida).',{},[t('Shuriken','Taijutsu','Neutro','Projétil'),t('Rasengan','Ninjutsu','Vento','Área',1.5),t('Kage Bunshin','Taijutsu','Neutro','Projétil',1.2),s('Modo Sábio','Ninjutsu','Sábio',SAGE_MODE)],'Rasenshuriken Supremo','Área, velocidade de ataque e projéteis',0),
 h('gaara','Gaara','Vila da Areia','#c87557',145,22,4,6.3,'Defesa Ofensiva · +8 armadura e +1% de dano total para cada ponto de armadura.',{defense:8},[t('Agulhas de Areia','Ninjutsu','Areia','Cone'),t('Caixão de Areia','Ninjutsu','Areia','Área',1.5),t('Onda de Areia','Ninjutsu','Areia','Onda'),t('Sepultamento','Ninjutsu','Areia','Área',1.6)],'Funeral do Deserto','Área, armadura e duração',1),
 h('madara','Madara','Clã Uchiha','#b94f61',120,24,3,6.8,'Sharingan · +7 pontos de chance crítica: 12% total; críticos causam 250% do dano.',{crit:.07},[t('Leque de Guerra','Taijutsu','Neutro','Cone'),t('Katon','Ninjutsu','Fogo','Onda'),t('Susanoo','Ninjutsu','Neutro','Órbita',1.3),t('Chamas Majestosas','Ninjutsu','Fogo','Cone',1.6)],'Meteorito','Crítico, fogo e ninjutsu',2),
 h('hashirama','Hashirama','Vila da Folha','#62a678',155,23,8,6.2,'Poder Sábio · +20% de dano em ataques de elemento Sábio; infusão disponível por técnica ou item.',{regen:.8},[t('Punho Senju','Taijutsu','Neutro','Corpo a corpo'),t('Estacas Mokuton','Ninjutsu','Madeira','Linha'),t('Raízes','Ninjutsu','Madeira','Área'),t('Floresta Profunda','Ninjutsu','Sábio','Área',1.6)],'Mil Mãos de Madeira','Regeneração, vida e área',3),
 h('sasuke','Sasuke','Clã Uchiha','#818adc',120,21,5,7,'Afinidade Raiton · +20% dano de ninjutsu.',{element:.2},[t('Shuriken Uchiha','Taijutsu','Neutro','Em V'),t('Chidori','Ninjutsu','Raio','Linha',1.5),t('Bola de Fogo','Ninjutsu','Fogo','Área'),t('Amaterasu','Ninjutsu','Fogo','Área',1.4)],'Kirin','Ninjutsu, crítico e status'),
 h('sakura','Sakura','Vila da Folha','#e78fa8',140,25,7,6.5,'Controle de Chakra · +20% dano de taijutsu e +0,5 HP/s de regeneração.',{normal:.2,regen:.5},[t('Punho Demolidor','Taijutsu','Neutro','Corpo a corpo'),t('Impacto de Sakura','Taijutsu','Terra','Área',1.5),t('Chute Ascendente','Taijutsu','Neutro','Cone'),t('Ruptura do Solo','Taijutsu','Terra','Onda')],'Força dos Cem','Taijutsu, vida e velocidade de ataque'),
 h('kakashi','Kakashi','Vila da Folha','#aabccc',125,20,5,7,'Leitura de Combate · +5 pontos de chance crítica e +10% velocidade de ataque.',{crit:.05,attackSpeed:.1},[t('Kunai Tática','Taijutsu','Neutro','Em V'),t('Raikiri','Ninjutsu','Raio','Linha',1.6),t('Dragão de Água','Ninjutsu','Água','Onda'),t('Parede de Terra','Ninjutsu','Terra','Linha')],'Kamui','Crítico, ninjutsu e recarga'),
 h('itachi','Itachi','Clã Uchiha','#d75f68',110,21,3,6.8,'Ilusão do Corvo · +20 pontos de chance de lentidão e +25% duração de status.',{status:.2,duration:.25},[t('Shuriken do Corvo','Taijutsu','Neutro','Em V'),t('Corvos Ilusórios','Genjutsu','Sombra','Órbita'),t('Fênix de Fogo','Ninjutsu','Fogo','Cone'),t('Tsukuyomi','Genjutsu','Sombra','Área',1.4)],'Espada de Totsuka','Genjutsu, duração e crítico'),
 h('minato','Minato','Vila da Folha','#ffe19a',115,19,4,7,'Relâmpago Amarelo · +20% movimento e +15% velocidade de ataque.',{move:.2,attackSpeed:.15},[t('Kunai Hiraishin','Taijutsu','Neutro','Em V'),t('Corte Relâmpago','Taijutsu','Raio','Linha'),t('Rasengan de Minato','Ninjutsu','Vento','Área',1.5),t('Barreira Espaço-Tempo','Ninjutsu','Neutro','Onda')],'Hiraishin em Cadeia','Movimento, velocidade de ataque e projéteis'),
 h('tsunade','Tsunade','Vila da Folha','#86be8e',165,25,8,6,'Vitalidade Senju · +0,9 HP/s de regeneração e +15% taijutsu.',{regen:.9,normal:.15},[t('Punho da Hokage','Taijutsu','Neutro','Corpo a corpo'),t('Chute Celestial','Taijutsu','Terra','Área',1.5),s('Byakugou','Taijutsu','Neutro',{cooldown:18,duration:8,bonuses:{regen:3,defense:12,normal:.2},stack:false,summary:'Libera o selo da testa: regeneração intensa, +armadura e +dano de taijutsu.'}),t('Impacto Sísmico','Taijutsu','Terra','Onda')],'Invocação de Katsuyu','HP, regeneração e taijutsu'),
 h('jiraiya','Jiraiya','Vila da Folha','#d77d72',145,22,6,6.3,'Sábio dos Sapos · +20% raio de área e +15% recarga da Ultimate.',{area:.2,cool:.15},[t('Agulhas de Cabelo','Ninjutsu','Neutro','Cone'),t('Óleo Flamejante','Ninjutsu','Fogo','Onda'),t('Rasengan do Sábio','Ninjutsu','Sábio','Área',1.5),s('Modo Sábio dos Sapos','Ninjutsu','Sábio',SAGE_MODE)],'Invocação de Gamabunta','Área, ninjutsu e recarga'),
 h('orochimaru','Orochimaru','Vila do Som','#b898df',125,19,4,6.7,'Corpo Serpentino · +10 pontos de evasão e +20% duração de status.',{dodge:.1,duration:.2},[t('Serpentes Ocultas','Ninjutsu','Neutro','Linha'),t('Espada Kusanagi','Taijutsu','Neutro','Cone'),t('Névoa Venenosa','Ninjutsu','Sombra','Área'),t('Mar de Serpentes','Ninjutsu','Neutro','Onda',1.4)],'Invocação de Manda','Veneno, duração e evasão'),
 h('lee','Rock Lee','Vila da Folha','#76c998',135,23,5,7,'Esforço Supremo · +25% taijutsu e +15% velocidade de ataque.',{normal:.25,attackSpeed:.15},[t('Punho da Folha','Taijutsu','Neutro','Corpo a corpo'),t('Lótus Primária','Taijutsu','Neutro','Área',1.5),t('Furacão da Folha','Taijutsu','Neutro','Cone'),s('Portões do Inferno','Taijutsu','Neutro',{cooldown:11,duration:6,bonuses:{damage:.22,attackSpeed:.2,move:.15},stack:false,summary:'Abre os portões internos: +dano, +velocidade de ataque e +movimento por alguns segundos.'})],'Portões Internos','Taijutsu, crítico e velocidade de ataque'),
 h('neji','Neji','Clã Hyuga','#d4d6e9',125,21,5,6.9,'Byakugan · +10 pontos de chance crítica e +15% taijutsu.',{crit:.1,normal:.15},[t('Punho Gentil','Taijutsu','Neutro','Corpo a corpo'),t('Kaiten','Taijutsu','Neutro','Órbita'),t('Palma de Ar','Taijutsu','Neutro','Onda'),t('Sessenta e Quatro Palmas','Taijutsu','Neutro','Linha',1.5)],'Cento e Vinte e Oito Palmas','Crítico e taijutsu'),
 h('hinata','Hinata','Clã Hyuga','#c1b2e9',130,19,6,6.7,'Proteção Gentil · +8 pontos de evasão e +15% taijutsu.',{dodge:.08,normal:.15},[t('Palma Gentil','Taijutsu','Neutro','Corpo a corpo'),t('Punhos dos Leões Gêmeos','Taijutsu','Neutro','Cone',1.4),t('Palma do Vazio','Taijutsu','Neutro','Onda'),t('Palmas Protetoras','Taijutsu','Neutro','Órbita')],'Passo dos Leões Gêmeos','Evasão, taijutsu e área'),
 h('shikamaru','Shikamaru','Clã Nara','#a5b783',120,17,5,6.6,'Estrategista · +30% duração de status e +10 pontos de chance de lentidão.',{duration:.3,status:.1},[t('Costura das Sombras','Genjutsu','Sombra','Linha'),t('Possessão das Sombras','Genjutsu','Sombra','Cone'),t('Agulhas da Sombra','Genjutsu','Sombra','Em V'),t('Prisão das Sombras','Genjutsu','Sombra','Área')],'Estrangulamento das Sombras','Controle, duração e velocidade de ataque'),
 h('temari','Temari','Vila da Areia','#d1be8a',125,22,4,6.7,'Mestra do Leque · +25% raio dos ataques.',{area:.25},[t('Corte do Leque','Ninjutsu','Vento','Cone'),t('Lâminas Cruzadas','Ninjutsu','Vento','Em V'),t('Grande Vendaval','Ninjutsu','Vento','Onda',1.4),t('Tornado Cortante','Ninjutsu','Vento','Órbita')],'Invocação de Kamatari','Área, projéteis e ninjutsu'),
 h('tenten','Tenten','Vila da Folha','#dc9f91',120,16,4,7,'Mestra de Armas · +1 projétil por disparo.',{projectiles:1},[t('Shurikens Gêmeas','Taijutsu','Neutro','Em V'),t('Kunai Explosiva','Taijutsu','Neutro','Área'),t('Chuva de Senbon','Taijutsu','Neutro','Cone'),t('Corrente de Armas','Taijutsu','Neutro','Linha')],'Dragões Gêmeos','Projéteis, taijutsu e crítico'),
 h('pain','Pain','Vila da Chuva','#ca86cb',140,24,7,6.2,'Caminho Deva · +20% ninjutsu e +15% raio de área. Nagato (Clã Uzumaki) controla o corpo de Yahiko pelos receptores de chakra.',{element:.2,area:.15},[t('Receptor de Chakra','Taijutsu','Neutro','Linha'),t('Shinra Tensei','Ninjutsu','Neutro','Área'),t('Bansho Tenin','Ninjutsu','Neutro','Cone'),t('Mísseis Asura','Ninjutsu','Fogo','Em V')],'Chibaku Tensei','Ninjutsu, área e recarga'),
 h('tobirama','Tobirama','Vila da Folha','#82cbe6',135,21,7,6.8,'Estratégia Suiton · +15% velocidade de ataque e +15% recarga da Ultimate.',{attackSpeed:.15,cool:.15},[t('Corte de Água','Ninjutsu','Água','Linha'),t('Dragão Aquático','Ninjutsu','Água','Onda'),t('Agulhas de Água','Ninjutsu','Água','Em V'),t('Onda Explosiva','Ninjutsu','Água','Área',1.4)],'Mar do Segundo Hokage','Velocidade de ataque, ninjutsu e recarga'),
 h('kankuro','Kankuro','Vila da Areia','#a48fc7',130,18,6,6.5,'Marionetista · +20% duração de status e ataques aplicam veneno de 20% do impacto em 3 s.',{duration:.2,dot:.2},[t('Agulhas de Karasu','Taijutsu','Neutro','Em V'),t('Kuroari','Ninjutsu','Neutro','Área'),t('Escudo de Sansho','Ninjutsu','Terra','Cone'),t('Chuva Venenosa','Ninjutsu','Neutro','Onda')],'Teatro das Marionetes','Veneno, duração e projéteis'),
 h('guy','Might Guy','Vila da Folha','#69cf81',145,25,7,6.8,'Poder da Juventude · +30% taijutsu e +10% movimento.',{normal:.3,move:.1},[t('Chute da Juventude','Taijutsu','Neutro','Corpo a corpo'),s('Portão da Dor','Taijutsu','Neutro',{cooldown:14,duration:7,bonuses:{normal:.35,attackSpeed:.15,crit:.08},stack:false,summary:'Força o quarto portão: +dano de taijutsu, +velocidade de ataque e +chance crítica.'}),t('Pavão da Manhã','Taijutsu','Fogo','Em V'),t('Tigre do Meio-Dia','Taijutsu','Neutro','Onda',1.8)],'Oito Portões','Taijutsu, velocidade de ataque e crítico'),
];
/** Técnica-base da Ultimate (elemento/escola/cor): a última técnica de ataque do kit (setups não contam). */
export function ultimateBase(hero:Hero):Technique{return [...hero.techniques].reverse().find(t=>!t.setup)??hero.techniques[0];}
export const HERO_BY_ID=Object.fromEntries(HEROES.map(h=>[h.id,h])) as Record<string,Hero>;
HERO_BY_ID.naruto.techniques[1].unlockLevel=10;
HERO_BY_ID.naruto.techniques[2].unlockLevel=5;
HERO_BY_ID.naruto.techniques[3].unlockLevel=15;
export function skillPool(heroId:string):Technique[]{const hero=HERO_BY_ID[heroId]??HEROES[0];return [...hero.techniques,...HEROES.filter(other=>other.id!==hero.id&&other.village===hero.village).map(other=>({...other.techniques[0],unlockLevel:8}))];}
/**
 * Clã de origem (o campo `village` converte clãs da Folha para "Vila da Folha").
 * `pain` representa Nagato: na Narutopedia "Pain" é alcunha de Nagato (a página Pain redireciona para Nagato,
 * clã Uzumaki) e o kit mistura vários Caminhos (Deva, Asura, receptores). O Caminho Deva é o cadáver de
 * Yahiko controlado por Nagato; Yahiko NÃO tem clã nem é Uzumaki (naturezas próprias: Água, Fogo, Vento).
 */
export const HERO_CLAN:Record<string,string>={madara:'Clã Uchiha',sasuke:'Clã Uchiha',itachi:'Clã Uchiha',neji:'Clã Hyuga',hinata:'Clã Hyuga',shikamaru:'Clã Nara',hashirama:'Clã Senju',tobirama:'Clã Senju',tsunade:'Clã Senju',naruto:'Clã Uzumaki',pain:'Clã Uzumaki'};
/**
 * Organizações/equipes canônicas usadas por filtros e sinergias. Um shinobi pode estar em várias.
 * Ids que ainda não existem no elenco (ex.: kisame, ino, zabuza) já ficam listados para o elenco futuro; não contam até existirem.
 */
export const ORGANIZATIONS:{id:string;name:string;members:string[]}[]=[
 {id:'akatsuki',name:'Akatsuki',members:['itachi','pain','orochimaru','kisame','deidara','sasori','hidan','kakuzu','konan','obito','zetsu']},
 {id:'sannin',name:'Sannin Lendários',members:['jiraiya','tsunade','orochimaru']},
 {id:'hokage',name:'Hokages',members:['hashirama','tobirama','minato','tsunade','kakashi','naruto','hiruzen']},
 {id:'time7',name:'Time 7',members:['naruto','sasuke','sakura','kakashi','sai','yamato']},
 {id:'timeguy',name:'Time Guy',members:['guy','lee','neji','tenten']},
 {id:'areia',name:'Irmãos da Areia',members:['gaara','temari','kankuro']},
 {id:'uchiha',name:'Clã Uchiha',members:['madara','sasuke','itachi','obito','shisui']},
 {id:'hyuga',name:'Clã Hyuga',members:['neji','hinata','hiashi','hanabi']},
 {id:'senju',name:'Clã Senju',members:['hashirama','tobirama','tsunade']},
 {id:'time10',name:'Ino-Shika-Chō',members:['shikamaru','ino','choji','asuma']},
 {id:'time8',name:'Time 8',members:['hinata','kiba','shino','kurenai']},
 {id:'espadachins',name:'Sete Espadachins da Névoa',members:['kisame','zabuza','mangetsu','suigetsu','chojuro','kushimaru','jinpachi','fuguki','jinin','ameyuri']},
];
export function heroOrganizations(heroId:string){return ORGANIZATIONS.filter(o=>o.members.includes(heroId));}
/**
 * Naturezas de chakra canônicas (Narutopedia, campo "Nature Type", consultado em 06/11/2026), na ordem da wiki,
 * convertidas para os elementos do jogo: Yin → Sombra; Magnet Release do Gaara → Areia. Yang e naturezas
 * avançadas sem equivalente (Tempestade, Lava etc.) ficam de fora. Lista vazia = sem natureza (Lee, Tenten).
 */
export const HERO_NATURES:Record<string,Element[]>={
 naruto:['Vento','Terra','Fogo','Água','Raio','Sombra'],gaara:['Areia','Vento','Terra','Raio'],
 madara:['Fogo','Vento','Terra','Água','Raio','Madeira','Sombra'],hashirama:['Madeira','Terra','Água','Fogo','Vento','Raio','Sombra'],
 sasuke:['Raio','Fogo','Terra','Água','Vento','Sombra'],sakura:['Terra','Água','Fogo','Sombra'],
 kakashi:['Raio','Terra','Água','Fogo','Vento','Sombra'],itachi:['Fogo','Água','Vento','Sombra'],
 minato:['Fogo','Vento','Raio','Sombra'],tsunade:['Raio','Terra','Água','Fogo','Sombra'],
 jiraiya:['Fogo','Vento','Terra','Água','Sombra'],orochimaru:['Vento','Raio','Terra','Água','Fogo','Madeira','Sombra'],
 lee:[],neji:['Fogo','Terra','Água'],hinata:['Fogo','Raio'],shikamaru:['Fogo','Terra','Sombra'],temari:['Vento'],tenten:[],
 pain:['Fogo','Vento','Raio','Terra','Água'],/* naturezas do Nagato (quem usa as técnicas), não as do Yahiko */tobirama:['Água','Fogo','Vento','Raio','Terra','Sombra'],
 kankuro:['Vento','Raio','Terra','Água'],guy:['Fogo','Raio'],
};
/** Afinidade marcada como "(Affinity)" na Narutopedia. */
const MARKED_AFFINITY:Record<string,Element>={naruto:'Vento',kakashi:'Raio',sasuke:'Raio'};
/**
 * Afinidade elemental do shinobi: a marcada na Narutopedia; senão a primeira natureza canônica usada no kit;
 * senão a primeira natureza canônica; Neutro para quem não tem natureza.
 */
export function heroAffinity(heroId:string):Element{const hero=HERO_BY_ID[heroId];if(!hero)return 'Neutro';if(MARKED_AFFINITY[heroId])return MARKED_AFFINITY[heroId];const natures=HERO_NATURES[heroId]??[];const kit=new Set(hero.techniques.map(t=>t.element));return natures.find(n=>kit.has(n))??natures[0]??'Neutro';}
export function sandSynergy(allies:readonly string[]){return ['gaara','temari','kankuro'].every(id=>allies.includes(id));}
export const NARUTO_FORMS=[{level:1,name:'Academia',file:'naruto-academia'},{level:10,name:'Clássico',file:'naruto-classico'},{level:25,name:'Shippuden',file:'naruto-shippuden'},{level:50,name:'Manto da Kyuubi',file:'naruto-kyuubi'}];
export function narutoForm(level:number){return [...NARUTO_FORMS].reverse().find(f=>level>=f.level)??NARUTO_FORMS[0];}

HERO_BY_ID.hinata.techniques[1].unlockLevel=15;
HERO_BY_ID.guy.techniques[2].unlockLevel=15;
HERO_BY_ID.guy.techniques[3].unlockLevel=30;
