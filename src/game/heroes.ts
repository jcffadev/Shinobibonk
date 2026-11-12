import type { Bonuses } from './catalog';
export type School='Taijutsu'|'Ninjutsu'|'Genjutsu';
export type Element='Neutro'|'Fogo'|'Água'|'Vento'|'Terra'|'Raio'|'Madeira'|'Areia'|'Sombra'|'Sábio';
export type Shape='Projétil'|'Corpo a corpo'|'Cone'|'Onda'|'Em V'|'Linha'|'Área'|'Órbita'|'Buff';
export type Control='Atordoar'|'Paralisar'|'Dormir'|'Empurrar'|'Lentidão';
export type Technique={name:string;school:School;element:Element;secondaryElement?:Element;ultimate?:boolean;shape:Shape;color:string;power:number;range:number;cooldown:number;slow?:boolean;burn?:boolean;status?:Control;secondaryStatus?:Control;secondaryStatusChance?:number;statusChance:number;unlockLevel:number;setup?:Setup};
/**
 * Técnica de setup (buff puro): não causa dano, é ativada automaticamente (com inimigo a até 9 m) e dá bônus temporários.
 * Recarga própria: NÃO é reduzida pela velocidade de ataque nem pela velocidade de projétil (só pelo afixo de recarga do level-up).
 * stack=false: reativar apenas renova a duração. sage=true: Modo Sábio (elemento Sábio, Senjutsu no Ninjutsu e taijutsu corpo a corpo em área).
 */
export type Setup={cooldown:number;duration:number;bonuses:Bonuses;stack:boolean;sage?:boolean;summary:string};
/**
 * `family`: id do shinobi base (versões como `naruto-shippuden` pertencem à família `naruto`; o base é a própria família).
 * `form`: nível da forma de evolution.ts que a versão usa SEMPRE (a forma não muda dentro da run).
 * `title`: fase exibida (Academia, Genin, Shippuden…). Atlas, naturezas, clã e organizações vêm da família.
 */
export type Hero={id:string;name:string;village:string;color:string;passive:string;bonuses:Bonuses;base:{hp:number;damage:number;armor:number;speed:number;crit:number;regen:number};skills:string[];techniques:Technique[];ultimate:string;build:string;atlas?:number;family?:string;form?:number;title?:string};
const colors:Record<Element,string>={Neutro:'#d7e6ff',Fogo:'#ff7c45',Água:'#5fb6ef',Vento:'#8de8ca',Terra:'#c7a16c',Raio:'#b3c5ff',Madeira:'#8bd464',Areia:'#ddae70',Sombra:'#ad84e8',Sábio:'#f5da86'};
const t=(name:string,school:School,element:Element,shape:Shape,power=1):Technique=>({name,school,element,shape,color:colors[element],power,range:shape==='Corpo a corpo'?1.6:shape==='Cone'?2.8:shape==='Órbita'?1.7:4.5,cooldown:shape==='Corpo a corpo'?1.2:shape==='Área'?2:1.5,slow:element==='Sombra',burn:element==='Fogo',status:school==='Genjutsu'?(name.includes('Corvo')?'Dormir':name.includes('Tsukuyomi')?'Atordoar':'Paralisar'):element==='Raio'?'Paralisar':element==='Vento'?'Empurrar':element==='Madeira'||element==='Areia'?'Lentidão':shape==='Corpo a corpo'?'Atordoar':undefined,statusChance:school==='Genjutsu'?.3:.12,unlockLevel:1});
/** Cria uma técnica de setup. Valores provisórios. */
const s=(name:string,school:School,element:Element,setup:Setup):Technique=>({name,school,element,shape:'Buff',color:colors[element],power:0,range:9,cooldown:setup.cooldown,statusChance:0,unlockLevel:1,setup});
const SAGE_MODE:Setup={cooldown:16,duration:7,bonuses:{damage:.15,area:.2},stack:false,sage:true,summary:'Entra no Modo Sábio: +dano e +área; aplica o elemento Sábio, dá Senjutsu ao Ninjutsu e faz o taijutsu corpo a corpo acertar em área ao redor.'};
/** Rodada 47 (pedido do usuário: early game +200% de dificuldade) — dano base do herói ×0,41 (era ×0,55);
 *  o HP base do herói NÃO mudou (o teste fixa 85 de HP do Naruto Academia).
 *  Constante nomeada e exportada: `version()` divide pelo MESMO fator ao derivar as versões, então o fator
 *  muda num único lugar (evita o bug do `.55` hardcoded que deixou as versões mais fracas que a base). */
export const HERO_DAMAGE_FACTOR=.41;
function h(id:string,name:string,village:string,color:string,hp:number,damage:number,armor:number,speed:number,passive:string,bonuses:Bonuses,techniques:Technique[],ultimate:string,build:string,atlas?:number):Hero{return {id,name,village:village.startsWith('Clã')?'Vila da Folha':village,color,base:{hp,damage:damage*HERO_DAMAGE_FACTOR,armor,speed,crit:.05,regen:0},passive,bonuses,techniques:techniques.map((t,i)=>({...t,unlockLevel:[1,5,12,20][i]})),skills:techniques.map(t=>t.name),ultimate,build,atlas};}
/**
 * Biblioteca de técnicas COMPARTILHADAS (não pertencem a um shinobi só). Regra do usuário (06/11/2026):
 * cada shinobi tem 1–2 técnicas ÚNICAS; o resto do kit vem desta biblioteca. Duplicatas (vários Shuriken,
 * Punhos, Rasengan e Modo Sábio repetidos) foram removidas. Objetos únicos: kits diferentes compartilham a mesma definição.
 */
const L={
 shuriken:t('Shuriken','Taijutsu','Neutro','Projétil'),
 kunai:t('Kunai Tática','Taijutsu','Neutro','Em V'),
 punho:t('Punho da Folha','Taijutsu','Neutro','Corpo a corpo'),
 furacao:t('Furacão da Folha','Taijutsu','Neutro','Cone'),
 chute:t('Chute Ascendente','Taijutsu','Neutro','Cone'),
 punhoGentil:t('Punho Gentil','Taijutsu','Neutro','Corpo a corpo'),
 palmaAr:t('Palma de Ar','Taijutsu','Neutro','Onda'),
 senbon:t('Chuva de Senbon','Taijutsu','Neutro','Cone'),
 susanoo:t('Susanoo','Ninjutsu','Neutro','Órbita',1.3),
 portoes:s('Portões do Inferno','Taijutsu','Neutro',{cooldown:11,duration:6,bonuses:{damage:.22,attackSpeed:.2,move:.15},stack:false,summary:'Abre os portões internos: +dano, +velocidade de ataque e +movimento por alguns segundos.'}),
 bolaFogo:t('Bola de Fogo','Ninjutsu','Fogo','Área'),
 fenix:t('Fênix de Fogo','Ninjutsu','Fogo','Cone'),
 dragaoAgua:t('Dragão de Água','Ninjutsu','Água','Onda'),
 agulhasAgua:t('Agulhas de Água','Ninjutsu','Água','Em V'),
 laminas:t('Lâminas Cruzadas','Ninjutsu','Vento','Em V'),
 vendaval:t('Grande Vendaval','Ninjutsu','Vento','Onda',1.4),
 parede:t('Parede de Terra','Ninjutsu','Terra','Linha'),
 ruptura:t('Ruptura do Solo','Taijutsu','Terra','Onda'),
 corteRaio:t('Corte Relâmpago','Taijutsu','Raio','Linha'),
 raizes:t('Raízes','Ninjutsu','Madeira','Área'),
 agulhasAreia:t('Agulhas de Areia','Ninjutsu','Areia','Cone'),
 ondaAreia:t('Onda de Areia','Ninjutsu','Areia','Onda'),
 agulhasSombra:t('Agulhas da Sombra','Genjutsu','Sombra','Em V'),
 prisaoSombra:t('Prisão das Sombras','Genjutsu','Sombra','Área'),
 nevoa:t('Névoa Venenosa','Ninjutsu','Sombra','Área'),
 modoSabio:s('Modo Sábio','Ninjutsu','Sábio',SAGE_MODE),
 /**
  * Invocação do Sapo = Kuchiyose: Yatai Kuzushi no Jutsu (Narutopedia "Summoning: Food Cart Destroyer Technique",
  * consultado em 06/11/2026): o usuário invoca um sapo gigante no ar, que cai e esmaga a área, prendendo os alvos sob o peso.
  * Usuários canônicos: Jiraiya, Minato, Naruto → técnica COMPARTILHADA (Naruto e Jiraiya no kit). Ninjutsu de espaço-tempo
  * SEM natureza: elemento Neutro (o Suiton: Teppōdama de Gamabunta é técnica do sapo e Água fugiria da base Vento do Naruto).
  */
 sapo:{...t('Invocação do Sapo','Ninjutsu','Neutro','Área',1.5),status:'Atordoar' as Control,statusChance:.3,cooldown:2.6},
 /** Rasengan (Narutopedia): criado por Minato, ensinado por Jiraiya a Naruto; usado também por Kakashi → compartilhada. */
 rasengan:t('Rasengan','Ninjutsu','Vento','Área',1.5),
 /** Byakugou no In (Narutopedia): Tsunade e Sakura → compartilhada. */
 byakugou:s('Byakugou','Taijutsu','Neutro',{cooldown:18,duration:8,bonuses:{regen:3,defense:12,normal:.2},stack:false,summary:'Libera o selo da testa: regeneração intensa, +armadura e +dano de taijutsu.'}),
};
/**
 * Técnicas ÚNICAS de cada FAMÍLIA (06/11/2026, versões separadas): a mesma única pode estar em mais de uma versão do mesmo
 * shinobi (ex.: Rasenshuriken no Naruto Shippuden e no Naruto Kyuubi), nunca em outra família. Nomes e fases conferidos na
 * Narutopedia; forma, dano e recarga são valores do protótipo (PROPOSTO).
 */
const U={
 kageBunshin:t('Kage Bunshin','Taijutsu','Neutro','Projétil',1.2),
 rendan:t('Rendan Uzumaki','Taijutsu','Neutro','Cone',1.25),
 rasenshuriken:t('Rasenshuriken','Ninjutsu','Vento','Projétil',1.8),
 bijudama:t('Bijūdama','Ninjutsu','Neutro','Área',2),
 chidori:t('Chidori','Ninjutsu','Raio','Linha',1.5),
 leao:t('Combo do Leão','Taijutsu','Neutro','Cone',1.3),
 espadaChidori:t('Espada Chidori','Taijutsu','Raio','Linha',1.4),
 amaterasu:t('Amaterasu','Ninjutsu','Fogo','Área',1.4),
 indra:t('Flecha de Indra','Ninjutsu','Raio','Linha',1.9),
 shannaro:t('Shannaro!','Taijutsu','Terra','Corpo a corpo',1.3),
 impacto:t('Impacto de Sakura','Taijutsu','Terra','Área',1.5),
 cemGolpes:t('Golpe dos Cem Selos','Taijutsu','Terra','Área',1.9),
 caixao:t('Caixão de Areia','Ninjutsu','Areia','Área',1.5),
 sepultamento:t('Sepultamento','Ninjutsu','Areia','Área',1.6),
 sepultamentoImperial:t('Grande Sepultamento Imperial','Ninjutsu','Areia','Área',1.8),
 garraAreia:t('Garra de Areia','Ninjutsu','Areia','Cone',1.6),
 leque:t('Leque de Guerra','Taijutsu','Neutro','Cone'),
 chamas:t('Chamas Majestosas','Ninjutsu','Fogo','Cone',1.6),
 limbo:t('Limbo','Ninjutsu','Sombra','Órbita',1.5),
 esferas:t('Esferas da Busca da Verdade','Ninjutsu','Neutro','Órbita',1.9),
 estacas:t('Estacas Mokuton','Ninjutsu','Madeira','Linha'),
 floresta:t('Floresta Profunda','Ninjutsu','Sábio','Área',1.6),
 raikiri:t('Raikiri','Ninjutsu','Raio','Linha',1.6),
 purpura:t('Púrpura Elétrica','Ninjutsu','Raio','Linha',1.8),
 corvos:t('Corvos Ilusórios','Genjutsu','Sombra','Órbita'),
 tsukuyomi:t('Tsukuyomi','Genjutsu','Sombra','Área',1.4),
 hiraishin:t('Kunai Hiraishin','Taijutsu','Neutro','Em V'),
 barreira:t('Barreira Espaço-Tempo','Ninjutsu','Neutro','Onda',1.4),
 chuteCeleste:t('Chute Celestial','Taijutsu','Terra','Área',1.5),
 palmaMistica:t('Palma Mística','Ninjutsu','Neutro','Órbita',.9),
 renascimento:t('Criação do Renascimento','Taijutsu','Terra','Área',1.9),
 cabelo:t('Agulhas de Cabelo','Ninjutsu','Neutro','Cone'),
 oleo:t('Óleo Flamejante','Ninjutsu','Fogo','Onda'),
 goemon:t('Goemon Sábio','Ninjutsu','Fogo','Onda',1.8),
 serpentes:t('Serpentes Ocultas','Ninjutsu','Neutro','Linha'),
 kusanagi:t('Espada Kusanagi','Taijutsu','Neutro','Cone'),
 yamata:t('Yamata no Jutsu','Ninjutsu','Neutro','Área',1.8),
 lotus:t('Lótus Primária','Taijutsu','Neutro','Área',1.5),
 lotusOculta:t('Lótus Oculta','Taijutsu','Neutro','Área',1.8),
 furacaoDinamico:t('Furacão Dinâmico da Folha','Taijutsu','Neutro','Onda',1.9),
 kaiten:t('Kaiten','Taijutsu','Neutro','Órbita'),
 palmas64:t('Sessenta e Quatro Palmas','Taijutsu','Neutro','Linha',1.5),
 palmas128:t('Cento e Vinte e Oito Palmas','Taijutsu','Neutro','Linha',1.8),
 protetoras:t('Palmas Protetoras','Taijutsu','Neutro','Órbita'),
 leoes:t('Punhos dos Leões Gêmeos','Taijutsu','Neutro','Cone',1.6),
 possessao:t('Possessão das Sombras','Genjutsu','Sombra','Cone'),
 costura:t('Costura das Sombras','Genjutsu','Sombra','Linha'),
 sombrasMassa:t('Possessão em Massa','Genjutsu','Sombra','Área',1.7),
 corteLeque:t('Corte do Leque','Ninjutsu','Vento','Cone'),
 tornado:t('Tornado Cortante','Ninjutsu','Vento','Órbita'),
 foice:t('Dança da Foice','Ninjutsu','Vento','Onda',1.7),
 kunaiExplosiva:t('Kunai Explosiva','Taijutsu','Neutro','Área'),
 corrente:t('Corrente de Armas','Taijutsu','Neutro','Linha'),
 bashosen:t('Leque Bashōsen','Taijutsu','Neutro','Onda',1.7),
 karasu:t('Agulhas de Karasu','Taijutsu','Neutro','Em V'),
 kuroari:t('Kuroari','Ninjutsu','Neutro','Área'),
 milBracos:t('Mil Braços do Escorpião','Taijutsu','Neutro','Cone',1.6),
 chuteDinamico:t('Entrada Dinâmica','Taijutsu','Neutro','Linha',1.3),
 pavao:t('Pavão da Manhã','Taijutsu','Fogo','Em V'),
 tigre:t('Tigre do Meio-Dia','Taijutsu','Neutro','Onda',1.8),
};
/** Nomes das técnicas compartilhadas; qualquer outra técnica de um kit é ÚNICA daquele shinobi. */
export const SHARED_TECHNIQUES=new Set(Object.values(L).map(x=>x.name));
// Temas canônicos; percentuais, atributos e composições são regras originais de protótipo. U = única, L.* = compartilhada.
export const HEROES:Hero[]=[
 h('naruto','Naruto','Vila da Folha','#f4a23a',130,18,4,7,'Determinação · até +20% de dano conforme perde HP (+10% com metade da vida).',{},[U.kageBunshin,L.shuriken,L.kunai,U.rendan],'Jutsu Sexy','Clones em área, projéteis e atordoamento',0),
 h('gaara','Gaara','Vila da Areia','#c87557',145,22,4,6.3,'Defesa Ofensiva · +8 armadura e +1% de dano total para cada ponto de armadura.',{defense:8},[L.agulhasAreia,U.caixao,L.ondaAreia,U.sepultamento],'Funeral do Deserto','Área, armadura e duração',1),
 h('madara','Madara','Clã Uchiha','#b94f61',120,24,3,6.8,'Sharingan · +7 pontos de chance crítica: 12% total; críticos causam 250% do dano.',{crit:.07},[U.leque,L.bolaFogo,L.susanoo,U.chamas],'Susanoo Perfeito','Crítico, fogo e ninjutsu',2),
 h('hashirama','Hashirama','Vila da Folha','#62a678',155,23,8,6.2,'Poder Sábio · +20% de dano em ataques de elemento Sábio; infusão disponível por técnica ou item.',{regen:.8},[L.punho,U.estacas,L.raizes,L.dragaoAgua],'Nascimento das Árvores','Regeneração, vida e área',3),
 h('sasuke','Sasuke','Clã Uchiha','#818adc',120,21,5,7,'Afinidade Raiton · +20% dano de ninjutsu.',{element:.2},[L.kunai,L.bolaFogo,U.leao,U.chidori],'Selo Amaldiçoado do Céu','Ninjutsu, crítico e status'),
 h('sakura','Sakura','Vila da Folha','#e78fa8',140,25,7,6.5,'Controle de Chakra · +20% dano de taijutsu e +0,5 HP/s de regeneração.',{normal:.2,regen:.5},[L.kunai,L.punho,L.chute,U.shannaro],'Sakura Interior','Taijutsu, vida e velocidade de ataque'),
 h('kakashi','Kakashi','Vila da Folha','#aabccc',125,20,5,7,'Leitura de Combate · +5 pontos de chance crítica e +10% velocidade de ataque.',{crit:.05,attackSpeed:.1},[L.kunai,U.raikiri,L.dragaoAgua,L.parede],'Kamui','Crítico, ninjutsu e recarga'),
 h('itachi','Itachi','Clã Uchiha','#d75f68',110,21,3,6.8,'Ilusão do Corvo · +20 pontos de chance de lentidão e +25% duração de status.',{status:.2,duration:.25},[L.shuriken,L.fenix,U.corvos,L.bolaFogo],'Genjutsu Sharingan','Genjutsu, duração e crítico'),
 h('minato','Minato','Vila da Folha','#ffe19a',115,19,4,7,'Relâmpago Amarelo · +20% movimento e +15% velocidade de ataque.',{move:.2,attackSpeed:.15},[U.hiraishin,L.corteRaio,L.vendaval,L.rasengan],'Hiraishin em Cadeia','Movimento, velocidade de ataque e projéteis'),
 h('tsunade','Tsunade','Vila da Folha','#86be8e',165,25,8,6,'Vitalidade Senju · +0,9 HP/s de regeneração e +15% taijutsu.',{regen:.9,normal:.15},[L.punho,U.palmaMistica,L.ruptura,U.chuteCeleste],'Invocação de Katsuyu','HP, regeneração e taijutsu'),
 h('jiraiya','Jiraiya','Vila da Folha','#d77d72',145,22,6,6.3,'Sábio dos Sapos · +20% raio de área e +15% recarga da Ultimate.',{area:.2,cool:.15},[U.cabelo,L.sapo,U.oleo,L.rasengan],'Invocação de Gamabunta','Área, ninjutsu e recarga'),
 h('orochimaru','Orochimaru','Vila da Folha','#b898df',125,19,4,6.7,'Corpo Serpentino · +10 pontos de evasão e +20% duração de status.',{dodge:.1,duration:.2},[U.serpentes,U.kusanagi,L.nevoa,L.prisaoSombra],'Invocação de Manda','Veneno, duração e evasão'),
 h('lee','Rock Lee','Vila da Folha','#76c998',135,23,5,7,'Esforço Supremo · +25% taijutsu e +15% velocidade de ataque.',{normal:.25,attackSpeed:.15},[L.punho,L.furacao,U.lotus,L.portoes],'Portões Internos','Taijutsu, crítico e velocidade de ataque'),
 h('neji','Neji','Clã Hyuga','#d4d6e9',125,21,5,6.9,'Byakugan · +10 pontos de chance crítica e +15% taijutsu.',{crit:.1,normal:.15},[L.punhoGentil,U.kaiten,L.kunai,U.palmas64],'Oito Trigramas','Crítico e taijutsu'),
 h('hinata','Hinata','Clã Hyuga','#c1b2e9',130,19,6,6.7,'Proteção Gentil · +8 pontos de evasão e +15% taijutsu.',{dodge:.08,normal:.15},[L.punhoGentil,L.shuriken,L.kunai,U.protetoras],'Byakugan Desperto','Evasão, taijutsu e área'),
 h('shikamaru','Shikamaru','Clã Nara','#a5b783',120,17,5,6.6,'Estrategista · +30% duração de status e +10 pontos de chance de lentidão.',{duration:.3,status:.1},[U.possessao,L.kunai,L.agulhasSombra,L.prisaoSombra],'Estrangulamento das Sombras','Controle, duração e velocidade de ataque'),
 h('temari','Temari','Vila da Areia','#d1be8a',125,22,4,6.7,'Mestra do Leque · +25% raio dos ataques.',{area:.25},[U.corteLeque,L.laminas,L.vendaval,U.tornado],'Invocação de Kamatari','Área, projéteis e ninjutsu'),
 h('tenten','Tenten','Vila da Folha','#dc9f91',120,16,4,7,'Mestra de Armas · ×1,5 de dano em técnicas neutras ou de projétil. +1 projétil por disparo.',{projectiles:1},[L.shuriken,U.kunaiExplosiva,L.senbon,U.corrente],'Dragões Gêmeos','Projéteis, taijutsu e crítico'),
 h('pain','Pain','Vila da Chuva','#ca86cb',140,24,7,6.2,'Caminho Deva · +20% ninjutsu e +15% raio de área. Nagato (Clã Uzumaki) controla o corpo de Yahiko pelos receptores de chakra.',{element:.2,area:.15},[L.kunai,t('Shinra Tensei','Ninjutsu','Neutro','Área'),t('Bansho Tenin','Ninjutsu','Neutro','Cone'),L.bolaFogo],'Chibaku Tensei','Ninjutsu, área e recarga'),
 h('tobirama','Tobirama','Vila da Folha','#82cbe6',135,21,7,6.8,'Estratégia Suiton · +15% velocidade de ataque e +15% recarga da Ultimate.',{attackSpeed:.15,cool:.15},[t('Corte de Água','Ninjutsu','Água','Linha'),L.dragaoAgua,L.agulhasAgua,t('Onda Explosiva','Ninjutsu','Água','Área',1.4)],'Mar do Segundo Hokage','Velocidade de ataque, ninjutsu e recarga'),
 h('kankuro','Kankuro','Vila da Areia','#a48fc7',130,18,6,6.5,'Marionetista · +20% duração de status e ataques aplicam veneno de 20% do impacto em 3 s.',{duration:.2,dot:.2},[U.karasu,U.kuroari,L.parede,L.kunai],'Teatro das Marionetes','Veneno, duração e projéteis'),
 h('guy','Might Guy','Vila da Folha','#69cf81',145,25,7,6.8,'Poder da Juventude · +30% taijutsu e +10% movimento.',{normal:.3,move:.1},[L.furacao,L.punho,L.portoes,U.chuteDinamico],'Portões Internos','Taijutsu, velocidade de ataque e crítico'),
 /* Kushina Uzumaki (Narutopedia): kunoichi de Uzushio que viveu na Folha, a "Habanero Sangrenta", jinchuuriki da Kurama;
    chakra especial do clã Uzumaki e as Correntes de Selamento Adamantinas. Naturezas: Vento, Água, Yin. */
 h('kushina','Kushina','Vila da Folha','#c8323c',140,20,5,6.9,'Chakra Uzumaki · +15% HP máximo e +0,5 HP/s (vitalidade do clã) e +10 pontos de chance de status (correntes de selamento).',{healthPct:.15,regen:.5,status:.1},[L.kunai,{...t('Correntes de Selamento','Ninjutsu','Neutro','Linha',1.5),status:'Paralisar',statusChance:.35},L.dragaoAgua,s('Habanero Sangrento','Taijutsu','Neutro',{cooldown:13,duration:6,bonuses:{damage:.18,attackSpeed:.15,status:.1},stack:false,summary:'A fúria da Habanero Sangrenta: +dano, +velocidade de ataque e +chance de status por alguns segundos.'})],'Prisão de Correntes da Kurama','Controle, status e ninjutsu'),
 /* Asuma Sarutobi (teste da skill de arte): lâminas de chakra de Vento e Cinzas Ardentes (Katon). Naturezas: Vento, Fogo. */
 h('asuma','Asuma','Vila da Folha','#5f7f46',140,22,6,6.8,'Lâminas do Vento · +15% dano de taijutsu e +10% área.',{normal:.15,area:.1},[L.kunai,t('Lâminas de Chakra','Taijutsu','Vento','Cone',1.4),t('Cinzas Ardentes','Ninjutsu','Fogo','Área',1.4),L.vendaval],'Fúria do Rei Macaco','Taijutsu, vento e área'),
];/**
 * Técnicas BÁSICAS de Academia (pedido do usuário, 06/11/2026): sempre no pool, liberadas cedo (Nv. 2–4), para não faltar
 * opção nos níveis baixos. Neutras para todos; as elementais só para quem tem a natureza (HERO_NATURES). Dano baixo,
 * melhoram com o level-up como qualquer técnica. Substituição (Kawarimi) acerta ao redor e atordoa.
 */
export const ACADEMY:Technique[]=[
 {...t('Técnica de Substituição','Ninjutsu','Neutro','Órbita',.55),status:'Atordoar',statusChance:.4,unlockLevel:2},
 {...t('Chute Giratório','Taijutsu','Neutro','Cone',.7),unlockLevel:2},
 {...t('Bomba de Fumaça','Ninjutsu','Neutro','Área',.4),status:'Lentidão',statusChance:.5,unlockLevel:3},
 {...t('Katon: Fagulha','Ninjutsu','Fogo','Projétil',.7),unlockLevel:3},
 {...t('Suiton: Jato d\'Água','Ninjutsu','Água','Linha',.7),unlockLevel:3},
 {...t('Fuuton: Rajada','Ninjutsu','Vento','Cone',.7),unlockLevel:3},
 {...t('Doton: Pedregulho','Ninjutsu','Terra','Projétil',.75),unlockLevel:4},
 {...t('Raiton: Faísca','Ninjutsu','Raio','Linha',.7),unlockLevel:4},
];
/** Técnica-base da Ultimate (elemento/escola/cor): a última técnica de ataque do kit (setups não contam). */
export function isProjectileUltimate(id:string){const family=familyOf(id);if(id==='naruto')return false;/* Academia: Jutsu Sexy é em área */return family==='naruto'||family==='tenten'||family==='minato';}
/**
 * VERSÕES SEPARADAS (pedido do usuário, 06/11/2026): cada forma de evolution.ts virou um personagem jogável próprio, com kit,
 * passiva e atributos da fase. O id do shinobi base continua sendo a PRIMEIRA versão (ex.: `naruto` = Naruto Academia), por isso
 * saves antigos (`sb_hero`, desbloqueados, selados e run salva) seguem válidos sem migração. Cada versão fica sempre na própria
 * forma (sem evolução dentro da run); a versão seguinte se libera pela missão em `unlockMissions.ts` jogando com a anterior.
 */
const BASE_TITLES:Record<string,string>={naruto:'Academia',sasuke:'Genin',sakura:'Genin',gaara:'Genin',madara:'Armadura',hashirama:'Hokage',kakashi:'Jonin',itachi:'ANBU',minato:'Jonin',tsunade:'Sannin',jiraiya:'Sannin',orochimaru:'Sannin',lee:'Genin',neji:'Genin',hinata:'Genin',shikamaru:'Genin',temari:'Genin',tenten:'Genin',kankuro:'Genin',guy:'Jonin'};
const SHORT_NAMES=Object.fromEntries(HEROES.map(x=>[x.id,x.name])) as Record<string,string>;
for(const hero of HEROES){hero.family=hero.id;hero.form=1;const title=BASE_TITLES[hero.id];if(title){hero.title=title;hero.name+=' '+title;}}
/** Cria a versão `step` (1, 2, 3…) da família: HP/dano +12% por passo, +1 armadura e +0,08 de movimento por passo. */
function version(family:string,id:string,title:string,form:number,step:number,passive:string,bonuses:Bonuses,techniques:Technique[],ultimate:string,build:string):Hero{
  const b=HEROES.find(x=>x.id===family)!,scale=1+.12*step;
  /* Rodada 47 — BUG CORRIGIDO: era `b.base.damage/.55*scale`, divisão pelo multiplicador ANTIGO da fábrica (×0,55).
     Com a fábrica em ×0,41 (dano inicial menor), as versões seguintes ficavam MAIS FRACAS que a base
     (naruto-genin 6,16 < naruto 7,38), violando a regra do verify-rules "versões avançadas mais fortes".
     `b.base.damage` JÁ contém o multiplicador da fábrica e `h()` aplica o fator DE NOVO ao argumento,
     então o argumento é (dano guardado ÷ HERO_DAMAGE_FACTOR) × scale — o fator agora vem da constante, num lugar só. */
  const hero=h(id,SHORT_NAMES[family]+' '+title,id==='orochimaru-som'?'Vila do Som':b.village,b.color,Math.round(b.base.hp*scale),b.base.damage/HERO_DAMAGE_FACTOR*scale,b.base.armor+step,+(b.base.speed+.08*step).toFixed(2),passive,bonuses,techniques,ultimate,build,b.atlas);
  return {...hero,family,form,title};
}
export const HERO_VERSIONS:Hero[]=[
 version('naruto','naruto-genin','Genin',10,1,'Chakra da Kyuubi · até +25% de dano conforme perde HP e +0,5 HP/s.',{regen:.5},[U.kageBunshin,L.sapo,L.kunai,L.rasengan],'Chakra da Raposa','Clones, área e invocação'),
 version('naruto','naruto-shippuden','Shippuden',25,2,'Treino com Fukasaku · +15% área e determinação até +25% de dano conforme perde HP.',{area:.15},[L.rasengan,L.sapo,L.modoSabio,U.rasenshuriken],'Rasenshuriken Supremo','Área, Senjutsu e projéteis'),
 version('naruto','naruto-kyuubi','Kyuubi',50,3,'Manto da Kurama · +15% movimento, +15% velocidade de ataque e determinação até +30%.',{move:.15,attackSpeed:.15},[U.rasenshuriken,L.vendaval,L.modoSabio,U.bijudama],'Bijūdama Rasenshuriken','Velocidade, área e projéteis'),
 version('sasuke','sasuke-shippuden','Shippuden',15,1,'Mangekyō Sharingan · +20% ninjutsu e +5 pontos de chance crítica.',{element:.2,crit:.05},[U.espadaChidori,L.bolaFogo,L.fenix,U.amaterasu],'Kirin','Ninjutsu, fogo e crítico'),
 version('sasuke','sasuke-rinnegan','Rinnegan',30,2,'Rinnegan · +25% ninjutsu, +8 pontos de chance crítica e +15% área.',{element:.25,crit:.08,area:.15},[L.corteRaio,U.amaterasu,L.susanoo,U.indra],'Chidori de Indra','Ninjutsu, crítico e área'),
 version('sakura','sakura-shippuden','Shippuden',15,1,'Ninjutsu Médico · +25% taijutsu e +0,8 HP/s.',{normal:.25,regen:.8},[L.punho,L.chute,U.impacto,L.ruptura],'Ōkashō','Taijutsu, vida e área'),
 version('sakura','sakura-byakugou','Byakugou',30,2,'Selo da Força dos Cem · +30% taijutsu, +1,2 HP/s e +8 armadura.',{normal:.3,regen:1.2,defense:8},[U.impacto,L.ruptura,L.byakugou,U.cemGolpes],'Força dos Cem','Taijutsu, regeneração e armadura'),
 version('gaara','gaara-kazekage','Kazekage',15,1,'Escudo do Kazekage · +12 armadura e +1% de dano total para cada ponto de armadura.',{defense:12},[U.caixao,L.agulhasAreia,L.ondaAreia,U.sepultamentoImperial],'Funeral Imperial do Deserto','Armadura, área e controle'),
 version('gaara','gaara-alianca','Aliança',30,2,'Comandante da Aliança · +15 armadura, +1% de dano por armadura e +15% dano dos ajudantes.',{defense:15,allyDamage:.15},[U.sepultamento,L.ondaAreia,L.vendaval,U.garraAreia],'Deserto Imperial','Armadura, ajudantes e área'),
 version('madara','madara-rinnegan','Rinnegan',15,1,'Rinnegan · +10 pontos de chance crítica e +15% ninjutsu; críticos causam 250% do dano.',{crit:.1,element:.15},[U.chamas,L.raizes,L.susanoo,U.limbo],'Tengai Shinsei','Crítico, ninjutsu e controle'),
 version('madara','madara-seis-caminhos','Seis Caminhos',30,2,'Sábio dos Seis Caminhos · +12 pontos de chance crítica, +20% ninjutsu e +10 pontos de evasão.',{crit:.12,element:.2,dodge:.1},[U.limbo,L.bolaFogo,L.susanoo,U.esferas],'Tsukuyomi Infinito','Crítico, evasão e ninjutsu'),
 version('hashirama','hashirama-sabio','Sábio',20,1,'Modo Sábio Senju · +20% de dano Sábio e +1,2 HP/s.',{regen:1.2},[U.estacas,L.raizes,L.modoSabio,U.floresta],'Mil Mãos de Madeira','Senjutsu, regeneração e área'),
 version('kakashi','kakashi-hokage','Hokage',25,1,'Sexto Hokage · +8 pontos de chance crítica, +15% velocidade de ataque e +10% recarga da Ultimate.',{crit:.08,attackSpeed:.15,cool:.1},[U.raikiri,L.dragaoAgua,L.corteRaio,U.purpura],'Fera Relâmpago','Crítico, raio e recarga'),
 version('itachi','itachi-akatsuki','Akatsuki',15,1,'Mangekyō Sharingan · +25 pontos de chance de status e +35% duração de status.',{status:.25,duration:.35},[L.fenix,U.corvos,L.susanoo,U.tsukuyomi],'Espada de Totsuka','Genjutsu, duração e controle'),
 version('minato','minato-hokage','Hokage',15,1,'Quarto Hokage · +25% movimento e +20% velocidade de ataque.',{move:.25,attackSpeed:.2},[U.hiraishin,L.rasengan,L.vendaval,U.barreira],'Selo do Ceifador','Movimento, velocidade e projéteis'),
 version('tsunade','tsunade-hokage','Hokage',15,1,'Quinta Hokage · +1,2 HP/s, +20% taijutsu e +10% dano dos ajudantes.',{regen:1.2,normal:.2,allyDamage:.1},[L.punho,L.ruptura,L.byakugou,U.chuteCeleste],'Katsuyu Gigante','Regeneração, ajudantes e taijutsu'),
 version('tsunade','tsunade-byakugou','Byakugou',30,2,'Selo Byakugou · +2 HP/s, +25% taijutsu e +10 armadura.',{regen:2,normal:.25,defense:10},[U.chuteCeleste,L.byakugou,L.ruptura,U.renascimento],'Força dos Cem Sannin','HP, regeneração e taijutsu'),
 version('jiraiya','jiraiya-sabio','Sábio',20,1,'Modo Sábio dos Sapos · +25% área e +20% recarga da Ultimate.',{area:.25,cool:.2},[U.oleo,L.sapo,L.modoSabio,U.goemon],'Canto dos Sapos','Senjutsu, área e recarga'),
 version('orochimaru','orochimaru-som','Som',15,1,'Selo Amaldiçoado · +12 pontos de evasão, +25% duração de status e veneno de 15%.',{dodge:.12,duration:.25,dot:.15},[U.kusanagi,L.nevoa,L.prisaoSombra,U.yamata],'Rashōmon Triplo','Veneno, evasão e controle'),
 version('lee','lee-shippuden','Shippuden',15,1,'Juventude Explosiva · +30% taijutsu e +20% velocidade de ataque.',{normal:.3,attackSpeed:.2},[L.furacao,U.lotus,L.portoes,U.lotusOculta],'Lótus Oculta Suprema','Taijutsu e velocidade de ataque'),
 version('lee','lee-portoes','Portões',30,2,'Portões Internos · +35% taijutsu, +20% velocidade de ataque e +10% movimento.',{normal:.35,attackSpeed:.2,move:.1},[L.furacao,U.lotusOculta,L.portoes,U.furacaoDinamico],'Sexto Portão','Taijutsu, crítico e movimento'),
 version('neji','neji-jonin','Jonin',15,1,'Byakugan Jonin · +12 pontos de chance crítica e +20% taijutsu.',{crit:.12,normal:.2},[L.punhoGentil,L.palmaAr,U.kaiten,U.palmas128],'Kaiten Supremo','Crítico e taijutsu'),
 version('hinata','hinata-shippuden','Shippuden',15,1,'Proteção Gentil · +10 pontos de evasão e +20% taijutsu.',{dodge:.1,normal:.2},[L.punhoGentil,L.palmaAr,L.kunai,U.protetoras],'Leões Gêmeos','Evasão e taijutsu'),
 version('hinata','hinata-leoes','Leões',30,2,'Leões Gêmeos · +12 pontos de evasão, +25% taijutsu e +10% área.',{dodge:.12,normal:.25,area:.1},[L.palmaAr,U.protetoras,L.punhoGentil,U.leoes],'Passo dos Leões Gêmeos','Evasão, taijutsu e área'),
 version('shikamaru','shikamaru-estrategista','Estrategista',15,1,'Estrategista Chunin · +35% duração de status e +12 pontos de chance de lentidão.',{duration:.35,status:.12},[U.possessao,L.agulhasSombra,L.prisaoSombra,U.costura],'Estrangulamento das Sombras','Controle e duração'),
 version('shikamaru','shikamaru-conselheiro','Conselheiro',30,2,'Conselheiro do Hokage · +40% duração, +15 pontos de chance de status e +10% recarga da Ultimate.',{duration:.4,status:.15,cool:.1},[U.costura,L.prisaoSombra,L.agulhasSombra,U.sombrasMassa],'Plano Mestre Nara','Controle, status e recarga'),
 version('temari','temari-shippuden','Shippuden',15,1,'Leque de Suna · +30% raio dos ataques e +10% ninjutsu.',{area:.3,element:.1},[U.corteLeque,L.vendaval,L.laminas,U.foice],'Kamatari Supremo','Área e ninjutsu'),
 version('tenten','tenten-shippuden','Shippuden',15,1,'Arsenal Lendário · ×1,5 de dano em técnicas neutras ou de projétil, +1 projétil e +5 pontos de chance crítica.',{projectiles:1,crit:.05},[L.shuriken,U.corrente,L.senbon,U.bashosen],'Dragões Gêmeos Ascendentes','Projéteis e crítico'),
 version('kankuro','kankuro-shippuden','Shippuden',15,1,'Teatro de Sasori · +25% duração de status e veneno de 30% do impacto em 3 s.',{duration:.25,dot:.3},[U.karasu,L.kunai,L.parede,U.milBracos],'Teatro das Três Marionetes','Veneno e projéteis'),
 version('kankuro','kankuro-alianca','Aliança',30,2,'Marionetista da Aliança · +30% duração, veneno de 35% e +10% dano dos ajudantes.',{duration:.3,dot:.35,allyDamage:.1},[U.kuroari,L.parede,L.kunai,U.milBracos],'Prisão de Kuroari','Veneno, controle e ajudantes'),
 version('guy','guy-sexto-portao','Sexto Portão',15,1,'Sexto Portão · +35% taijutsu e +15% movimento.',{normal:.35,move:.15},[L.furacao,L.portoes,U.chuteDinamico,U.pavao],'Pavão da Manhã Supremo','Taijutsu e movimento'),
 version('guy','guy-setimo-portao','Sétimo Portão',30,2,'Sétimo Portão · +40% taijutsu, +15% movimento e +15% velocidade de ataque.',{normal:.4,move:.15,attackSpeed:.15},[U.pavao,L.portoes,L.furacao,U.tigre],'Tigre do Meio-Dia Supremo','Taijutsu, velocidade e crítico'),
];
HEROES.push(...HERO_VERSIONS);
/** Família (id do shinobi base) de qualquer id; ids que não são shinobis jogáveis voltam como estão. */
export function familyOf(id:string){return HERO_FAMILY[id]??id;}
const HERO_FAMILY:Record<string,string>=Object.fromEntries(HEROES.map(x=>[x.id,x.family??x.id]));
/** Versões de uma família, em ordem de forma (a primeira é o próprio id base). */
export function familyVersions(family:string){return HEROES.filter(x=>x.family===family).sort((a,b)=>(a.form??1)-(b.form??1));}
/** Passo da versão na família (0 = primeira versão, 1 = segunda…). */
export function versionStep(id:string){return Math.max(0,familyVersions(familyOf(id)).findIndex(x=>x.id===id));}
const DIFFICULTY_STEP:Record<string,number>={Genin:0,Chunin:1,Jonin:2,Kage:3};
/**
 * Versão da família que aparece como Mega Elite / ajudante (decisão de 06/11/2026): Genin na zona 1 → versão inicial;
 * Kage na zona 3 → versão mais avançada. Escala 0–5 = dificuldade (0–3) + zona − 1 (0–2), distribuída pelas versões.
 */
export function versionForEncounter(family:string,zone:number,difficulty:string){
  const list=familyVersions(family);if(list.length<=1)return list[0]?.id??family;
  const score=Math.max(0,Math.min(5,(DIFFICULTY_STEP[difficulty]??0)+Math.max(0,zone-1)));
  return list[Math.round(score/5*(list.length-1))].id;
}
/** Determinação (Naruto): bônus máximo de dano conforme perde HP, por versão. */
export const DETERMINATION:Record<string,number>={naruto:.2,'naruto-genin':.25,'naruto-shippuden':.25,'naruto-kyuubi':.3};
export function ultimateBase(hero:Hero):Technique{return [...hero.techniques].reverse().find(t=>!t.setup)??hero.techniques[0];}
export const HERO_BY_ID=Object.fromEntries(HEROES.map(h=>[h.id,h])) as Record<string,Hero>;
/**
 * Níveis por FASE DA OBRA (pedido do usuário, 06/11/2026): técnicas da fase criança/genin saem cedo; técnicas de fases
 * avançadas (Shippuden, guerra, Hokage) só quando o shinobi evolui na run, alinhadas às formas de `evolution.ts`.
 * Fase conferida na Narutopedia pelo capítulo de estreia (Parte I = cap. 1–244; Shippuden = cap. 245+), 06/11/2026.
 * Desde as versões separadas, cada versão só tem técnicas da PRÓPRIA fase (as avançadas foram para as versões seguintes);
 * aqui ficam só ajustes finos dentro de uma versão. Quem não aparece usa o padrão por posição no kit (1/5/12/20).
 */
export const PHASE_LEVELS:Record<string,Record<string,number>>={
 // Naruto Genin: Kage Bunshin (cap. 1) → Invocação do Sapo (treino com Jiraiya) → Rasengan (cap. 150, fim da Parte I).
 'naruto-genin':{'Kage Bunshin':1,'Invocação do Sapo':5,'Kunai Tática':8,'Rasengan':15},
 // Sasuke Genin: Bola de Fogo (cap. 7) → Combo do Leão (Exame Chunin) → Chidori (cap. 113).
 sasuke:{'Kunai Tática':1,'Bola de Fogo':5,'Combo do Leão':8,'Chidori':12},
 // Lee Genin: Furacão (cap. 37), Lótus (cap. 52), Portões (cap. 85).
 lee:{'Punho da Folha':1,'Furacão da Folha':5,'Lótus Primária':8,'Portões do Inferno':12},
};
for(const [id,levels] of Object.entries(PHASE_LEVELS))for(const tech of HERO_BY_ID[id].techniques)if(levels[tech.name]!==undefined)tech.unlockLevel=levels[tech.name];
/** Usuários canônicos do Modo Sábio (Narutopedia, Sage Mode): podem aprender técnicas de elemento Sábio. */
// Por versão: o Naruto Academia e o Genin ainda não treinaram o Senjutsu (Modo Sábio é do Shippuden em diante).
export const SAGE_USERS=new Set(['naruto-shippuden','naruto-kyuubi','jiraiya','jiraiya-sabio','hashirama','hashirama-sabio','minato','minato-hokage']);
/** Técnicas únicas de um shinobi: as do kit que não estão na biblioteca compartilhada (1–2 por versão; a mesma única pode se repetir só dentro da família). */
export function uniqueTechniques(heroId:string){return (HERO_BY_ID[heroId]?.techniques??[]).filter(t=>!SHARED_TECHNIQUES.has(t.name));}
/**
 * Elementos que o shinobi pode aprender (regra do usuário, 06/11/2026): Neutro + elemento BASE (afinidade, ex.: Naruto = Vento;
 * todas as naturezas só viriam com o Modo Sábio dos Seis Caminhos, que o jogo não tem) + Sábio para usuários do Modo Sábio
 * (+ os elementos do próprio kit). Elemento fora disso nunca entra no pool, mesmo que seja da mesma vila.
 */
export function allowedElements(heroId:string){const set=new Set<Element>(['Neutro',heroAffinity(heroId)]);if(SAGE_USERS.has(heroId))set.add('Sábio');for(const tech of HERO_BY_ID[heroId]?.techniques??[])set.add(tech.element);return set;}
/** Bônus de dano de técnicas do elemento natural (afinidade) do shinobi. */
export const NATURE_BONUS=1.5;
export type PoolSource='kit'|'basica'|'vila'|'elemento'|'única';
export type PoolTechnique=Technique&{source:PoolSource;origin:string;locked?:boolean};
/** Nível de desbloqueio no level-up: compartilhadas a partir do 8; únicas de outros shinobis a partir do 12. */
export const POOL_UNLOCK={shared:8,unique:12};
/**
 * Pool completo de técnicas do shinobi (Plano de build mostra tudo; a run usa só as liberadas):
 * - kit próprio (1–2 únicas + compartilhadas);
 * Regra do usuário (06/11/2026): técnicas de OUTROS shinobis só entram depois que aquele shinobi foi SELADO na conta
 * (vale também para Naruto/Sasuke/Sakura). No começo, o pool é só o kit próprio.
 * - compartilhadas de colegas da MESMA VILA com elemento compatível;
 * - compartilhadas de OUTRAS vilas só com o MESMO elemento (não Neutro) e compatível;
 * - únicas de outros shinobis com elemento compatível, liberadas só depois de selar aquele shinobi pela 1ª vez (`locked` até lá).
 */
export function techniquePool(heroId:string,sealed:ReadonlySet<string>=new Set()):PoolTechnique[]{
  const hero=HERO_BY_ID[heroId]??HEROES[0],allowed=allowedElements(hero.id),seen=new Set(hero.techniques.map(x=>x.name));
  const list:PoolTechnique[]=hero.techniques.map(x=>({...x,source:'kit',origin:hero.id}));
  if(SAGE_USERS.has(hero.id)&&!seen.has(L.modoSabio.name)){
    list.push({...L.modoSabio,unlockLevel:hero.id==='hashirama'?20:25,source:'kit',origin:hero.id});
    seen.add(L.modoSabio.name);
  }
  for(const basic of ACADEMY)if(allowed.has(basic.element)&&!seen.has(basic.name)){seen.add(basic.name);list.push({...basic,source:'basica',origin:hero.id});}
  // Outras versões da MESMA família não emprestam técnicas: cada versão fica com as técnicas da própria fase.
  const family=familyOf(hero.id),strangers=HEROES.filter(o=>familyOf(o.id)!==family);
  const others=[...strangers.filter(o=>o.village===hero.village),...strangers.filter(o=>o.village!==hero.village)];
  for(const other of others){if(!sealed.has(other.id))continue;for(const tech of other.techniques){
    if(seen.has(tech.name)||!allowed.has(tech.element))continue;
    if(SHARED_TECHNIQUES.has(tech.name)){const sameVillage=other.village===hero.village;if(!sameVillage&&tech.element==='Neutro')continue;seen.add(tech.name);list.push({...tech,unlockLevel:POOL_UNLOCK.shared,source:sameVillage?'vila':'elemento',origin:other.id});}
    else{seen.add(tech.name);list.push({...tech,unlockLevel:POOL_UNLOCK.unique,source:'única',origin:other.id});}
  }}
  return list;
}
/** Técnicas que podem aparecer na run (sem as únicas ainda bloqueadas). */
export function skillArchiveLimit(learnableCount:number){return Math.floor(Math.max(0,learnableCount)*.6);}
export function skillPool(heroId:string,sealed:ReadonlySet<string>=new Set()):Technique[]{return techniquePool(heroId,sealed).filter(x=>!x.locked);}
/**
 * Clã de origem (o campo `village` converte clãs da Folha para "Vila da Folha").
 * `pain` representa Nagato: na Narutopedia "Pain" é alcunha de Nagato (a página Pain redireciona para Nagato,
 * clã Uzumaki) e o kit mistura vários Caminhos (Deva, Asura, receptores). O Caminho Deva é o cadáver de
 * Yahiko controlado por Nagato; Yahiko NÃO tem clã nem é Uzumaki (naturezas próprias: Água, Fogo, Vento).
 */
export const HERO_CLAN:Record<string,string>={madara:'Clã Uchiha',sasuke:'Clã Uchiha',itachi:'Clã Uchiha',neji:'Clã Hyuga',hinata:'Clã Hyuga',shikamaru:'Clã Nara',hashirama:'Clã Senju',tobirama:'Clã Senju',tsunade:'Clã Senju',naruto:'Clã Uzumaki',pain:'Clã Uzumaki',kushina:'Clã Uzumaki'};
/**
 * Organizações/equipes canônicas usadas por filtros e sinergias. Um shinobi pode estar em várias.
 * Ids que ainda não existem no elenco (ex.: kisame, ino, zabuza) já ficam listados para o elenco futuro; não contam até existirem.
 */
export const ORGANIZATIONS:{id:string;name:string;members:string[]}[]=[
 {id:'akatsuki',name:'Akatsuki',members:['itachi','pain','kisame','deidara','sasori','hidan','kakuzu','konan','obito','zetsu']},
 {id:'alianca',name:'Aliança Shinobi',members:['naruto','sasuke','sakura','gaara','kankuro','hinata','guy','lee']},
 {id:'taka',name:'Taka',members:['sasuke','suigetsu','jugo','karin']},
 {id:'sannin',name:'Sannin Lendários',members:['jiraiya','tsunade','orochimaru']},
 {id:'hokage',name:'Hokages',members:['hashirama','tobirama','minato','tsunade','kakashi','naruto','hiruzen']},
 {id:'time7',name:'Time 7',members:['naruto','sasuke','sakura','kakashi','sai','yamato']},
 {id:'timeguy',name:'Time Guy',members:['guy','lee','neji','tenten']},
 {id:'areia',name:'Irmãos da Areia',members:['gaara','temari','kankuro']},
 {id:'uchiha',name:'Clã Uchiha',members:['madara','sasuke','itachi','obito','shisui']},
 {id:'hyuga',name:'Clã Hyuga',members:['neji','hinata','hiashi','hanabi']},
 {id:'senju',name:'Clã Senju',members:['hashirama','tobirama','tsunade']},
 {id:'uzumaki',name:'Clã Uzumaki',members:['naruto','kushina','pain','karin','nagato']},
 {id:'time10',name:'Ino-Shika-Chō',members:['shikamaru','ino','choji','asuma']},
 {id:'time8',name:'Time 8',members:['hinata','kiba','shino','kurenai']},
 {id:'espadachins',name:'Sete Espadachins da Névoa',members:['kisame','zabuza','mangetsu','suigetsu','chojuro','kushimaru','jinpachi','fuguki','jinin','ameyuri']},
];
// Fases representadas no jogo. A fonte canônica descreve a filiação; o recorte é da versão jogável.
const ORGANIZATION_VERSIONS: Partial<Record<string, readonly string[]>> = {
 akatsuki:['itachi-akatsuki','pain'],
 hokage:['hashirama','hashirama-sabio','tobirama','minato-hokage','tsunade-hokage','tsunade-byakugou','kakashi-hokage'],
 time7:['naruto-genin','naruto-shippuden','naruto-kyuubi','sasuke','sasuke-rinnegan','sakura','sakura-shippuden','sakura-byakugou','kakashi'],
 alianca:['naruto-kyuubi','sasuke-rinnegan','sakura-byakugou','gaara-alianca','kankuro-alianca','hinata-leoes','guy-setimo-portao','lee-portoes'],
 taka:['sasuke-shippuden'],
};
export function heroOrganizations(heroId:string){
 const family=familyOf(heroId);
 return ORGANIZATIONS.filter(o=>ORGANIZATION_VERSIONS[o.id]?.includes(heroId)??o.members.includes(family));
}
/** Clã de origem da família (versões herdam o clã do shinobi base). */
export function heroClan(heroId:string):string|undefined{return HERO_CLAN[familyOf(heroId)];}
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
 kankuro:['Vento','Raio','Terra','Água'],guy:['Fogo','Raio'],kushina:['Vento','Água','Sombra'],asuma:['Vento','Fogo'],
};
/** Afinidade marcada como "(Affinity)" na Narutopedia. */
const MARKED_AFFINITY:Record<string,Element>={naruto:'Vento',kakashi:'Raio',sasuke:'Raio'};
/**
 * Afinidade elemental do shinobi: a marcada na Narutopedia; senão a primeira natureza canônica usada no kit;
 * senão a primeira natureza canônica; Neutro para quem não tem natureza.
 */
export function heroAffinity(heroId:string):Element{const hero=HERO_BY_ID[heroId];if(!hero)return 'Neutro';const family=familyOf(heroId);if(MARKED_AFFINITY[family])return MARKED_AFFINITY[family];const natures=HERO_NATURES[family]??[];const kit=new Set(hero.techniques.map(t=>t.element));return natures.find(n=>kit.has(n))??natures[0]??'Neutro';}
export function sandSynergy(allies:readonly string[]){const families=allies.map(familyOf);return ['gaara','temari','kankuro'].every(id=>families.includes(id));}
export const NARUTO_FORMS=[{level:1,name:'Academia',file:'naruto-academia'},{level:10,name:'Clássico',file:'naruto-classico'},{level:25,name:'Shippuden',file:'naruto-shippuden'},{level:50,name:'Manto da Kyuubi',file:'naruto-kyuubi'}];
export function narutoForm(level:number){return [...NARUTO_FORMS].reverse().find(f=>level>=f.level)??NARUTO_FORMS[0];}