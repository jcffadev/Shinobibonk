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
export type Hero={id:string;name:string;village:string;color:string;passive:string;bonuses:Bonuses;base:{hp:number;damage:number;armor:number;speed:number;crit:number;regen:number};skills:string[];techniques:Technique[];ultimate:string;build:string;atlas?:number};
const colors:Record<Element,string>={Neutro:'#d7e6ff',Fogo:'#ff7c45',Água:'#5fb6ef',Vento:'#8de8ca',Terra:'#c7a16c',Raio:'#b3c5ff',Madeira:'#8bd464',Areia:'#ddae70',Sombra:'#ad84e8',Sábio:'#f5da86'};
const t=(name:string,school:School,element:Element,shape:Shape,power=1):Technique=>({name,school,element,shape,color:colors[element],power,range:shape==='Corpo a corpo'?1.6:shape==='Cone'?2.8:shape==='Órbita'?1.7:4.5,cooldown:shape==='Corpo a corpo'?1.2:shape==='Área'?2:1.5,slow:element==='Sombra',burn:element==='Fogo',status:school==='Genjutsu'?(name.includes('Corvo')?'Dormir':name.includes('Tsukuyomi')?'Atordoar':'Paralisar'):element==='Raio'?'Paralisar':element==='Vento'?'Empurrar':element==='Madeira'||element==='Areia'?'Lentidão':shape==='Corpo a corpo'?'Atordoar':undefined,statusChance:school==='Genjutsu'?.3:.12,unlockLevel:1});
/** Cria uma técnica de setup. Valores provisórios. */
const s=(name:string,school:School,element:Element,setup:Setup):Technique=>({name,school,element,shape:'Buff',color:colors[element],power:0,range:9,cooldown:setup.cooldown,statusChance:0,unlockLevel:1,setup});
const SAGE_MODE:Setup={cooldown:16,duration:7,bonuses:{damage:.15,area:.2},stack:false,sage:true,summary:'Entra no Modo Sábio: +dano e +área; aplica o elemento Sábio, dá Senjutsu ao Ninjutsu e faz o taijutsu corpo a corpo acertar em área ao redor.'};
function h(id:string,name:string,village:string,color:string,hp:number,damage:number,armor:number,speed:number,passive:string,bonuses:Bonuses,techniques:Technique[],ultimate:string,build:string,atlas?:number):Hero{return {id,name,village:village.startsWith('Clã')?'Vila da Folha':village,color,base:{hp,damage:damage*.55,armor,speed,crit:.05,regen:0},passive,bonuses,techniques:techniques.map((t,i)=>({...t,unlockLevel:[1,5,12,20][i]})),skills:techniques.map(t=>t.name),ultimate,build,atlas};}
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
};
/** Nomes das técnicas compartilhadas; qualquer outra técnica de um kit é ÚNICA daquele shinobi. */
export const SHARED_TECHNIQUES=new Set(Object.values(L).map(x=>x.name));
// Temas canônicos; percentuais, atributos e composições são regras originais de protótipo. U = única, L.* = compartilhada.
export const HEROES:Hero[]=[
 h('naruto','Naruto','Vila da Folha','#f4a23a',130,18,4,7,'Determinação · até +20% de dano conforme perde HP (+10% com metade da vida).',{},[t('Kage Bunshin','Taijutsu','Neutro','Projétil',1.2),L.sapo,t('Rasengan','Ninjutsu','Vento','Área',1.5),L.modoSabio],'Rasenshuriken Supremo','Área, velocidade de ataque e projéteis',0),
 h('gaara','Gaara','Vila da Areia','#c87557',145,22,4,6.3,'Defesa Ofensiva · +8 armadura e +1% de dano total para cada ponto de armadura.',{defense:8},[L.agulhasAreia,t('Caixão de Areia','Ninjutsu','Areia','Área',1.5),L.ondaAreia,t('Sepultamento','Ninjutsu','Areia','Área',1.6)],'Funeral do Deserto','Área, armadura e duração',1),
 h('madara','Madara','Clã Uchiha','#b94f61',120,24,3,6.8,'Sharingan · +7 pontos de chance crítica: 12% total; críticos causam 250% do dano.',{crit:.07},[t('Leque de Guerra','Taijutsu','Neutro','Cone'),L.bolaFogo,L.susanoo,t('Chamas Majestosas','Ninjutsu','Fogo','Cone',1.6)],'Meteorito','Crítico, fogo e ninjutsu',2),
 h('hashirama','Hashirama','Vila da Folha','#62a678',155,23,8,6.2,'Poder Sábio · +20% de dano em ataques de elemento Sábio; infusão disponível por técnica ou item.',{regen:.8},[L.punho,t('Estacas Mokuton','Ninjutsu','Madeira','Linha'),L.raizes,t('Floresta Profunda','Ninjutsu','Sábio','Área',1.6)],'Mil Mãos de Madeira','Regeneração, vida e área',3),
 h('sasuke','Sasuke','Clã Uchiha','#818adc',120,21,5,7,'Afinidade Raiton · +20% dano de ninjutsu.',{element:.2},[L.kunai,L.bolaFogo,t('Chidori','Ninjutsu','Raio','Linha',1.5),t('Amaterasu','Ninjutsu','Fogo','Área',1.4)],'Kirin','Ninjutsu, crítico e status'),
 h('sakura','Sakura','Vila da Folha','#e78fa8',140,25,7,6.5,'Controle de Chakra · +20% dano de taijutsu e +0,5 HP/s de regeneração.',{normal:.2,regen:.5},[L.punho,L.chute,t('Impacto de Sakura','Taijutsu','Terra','Área',1.5),L.ruptura],'Força dos Cem','Taijutsu, vida e velocidade de ataque'),
 h('kakashi','Kakashi','Vila da Folha','#aabccc',125,20,5,7,'Leitura de Combate · +5 pontos de chance crítica e +10% velocidade de ataque.',{crit:.05,attackSpeed:.1},[L.kunai,t('Raikiri','Ninjutsu','Raio','Linha',1.6),L.dragaoAgua,L.parede],'Kamui','Crítico, ninjutsu e recarga'),
 h('itachi','Itachi','Clã Uchiha','#d75f68',110,21,3,6.8,'Ilusão do Corvo · +20 pontos de chance de lentidão e +25% duração de status.',{status:.2,duration:.25},[L.shuriken,L.fenix,t('Corvos Ilusórios','Genjutsu','Sombra','Órbita'),t('Tsukuyomi','Genjutsu','Sombra','Área',1.4)],'Espada de Totsuka','Genjutsu, duração e crítico'),
 h('minato','Minato','Vila da Folha','#ffe19a',115,19,4,7,'Relâmpago Amarelo · +20% movimento e +15% velocidade de ataque.',{move:.2,attackSpeed:.15},[t('Kunai Hiraishin','Taijutsu','Neutro','Em V'),L.corteRaio,L.vendaval,t('Barreira Espaço-Tempo','Ninjutsu','Neutro','Onda')],'Hiraishin em Cadeia','Movimento, velocidade de ataque e projéteis'),
 h('tsunade','Tsunade','Vila da Folha','#86be8e',165,25,8,6,'Vitalidade Senju · +0,9 HP/s de regeneração e +15% taijutsu.',{regen:.9,normal:.15},[L.punho,t('Chute Celestial','Taijutsu','Terra','Área',1.5),L.ruptura,s('Byakugou','Taijutsu','Neutro',{cooldown:18,duration:8,bonuses:{regen:3,defense:12,normal:.2},stack:false,summary:'Libera o selo da testa: regeneração intensa, +armadura e +dano de taijutsu.'})],'Invocação de Katsuyu','HP, regeneração e taijutsu'),
 h('jiraiya','Jiraiya','Vila da Folha','#d77d72',145,22,6,6.3,'Sábio dos Sapos · +20% raio de área e +15% recarga da Ultimate.',{area:.2,cool:.15},[t('Agulhas de Cabelo','Ninjutsu','Neutro','Cone'),L.sapo,t('Óleo Flamejante','Ninjutsu','Fogo','Onda'),L.modoSabio],'Invocação de Gamabunta','Área, ninjutsu e recarga'),
 h('orochimaru','Orochimaru','Vila do Som','#b898df',125,19,4,6.7,'Corpo Serpentino · +10 pontos de evasão e +20% duração de status.',{dodge:.1,duration:.2},[t('Serpentes Ocultas','Ninjutsu','Neutro','Linha'),t('Espada Kusanagi','Taijutsu','Neutro','Cone'),L.nevoa,L.prisaoSombra],'Invocação de Manda','Veneno, duração e evasão'),
 h('lee','Rock Lee','Vila da Folha','#76c998',135,23,5,7,'Esforço Supremo · +25% taijutsu e +15% velocidade de ataque.',{normal:.25,attackSpeed:.15},[L.punho,L.furacao,t('Lótus Primária','Taijutsu','Neutro','Área',1.5),L.portoes],'Portões Internos','Taijutsu, crítico e velocidade de ataque'),
 h('neji','Neji','Clã Hyuga','#d4d6e9',125,21,5,6.9,'Byakugan · +10 pontos de chance crítica e +15% taijutsu.',{crit:.1,normal:.15},[L.punhoGentil,t('Kaiten','Taijutsu','Neutro','Órbita'),t('Sessenta e Quatro Palmas','Taijutsu','Neutro','Linha',1.5),L.palmaAr],'Cento e Vinte e Oito Palmas','Crítico e taijutsu'),
 h('hinata','Hinata','Clã Hyuga','#c1b2e9',130,19,6,6.7,'Proteção Gentil · +8 pontos de evasão e +15% taijutsu.',{dodge:.08,normal:.15},[L.punhoGentil,t('Palmas Protetoras','Taijutsu','Neutro','Órbita'),L.palmaAr,t('Punhos dos Leões Gêmeos','Taijutsu','Neutro','Cone',1.4)],'Passo dos Leões Gêmeos','Evasão, taijutsu e área'),
 h('shikamaru','Shikamaru','Clã Nara','#a5b783',120,17,5,6.6,'Estrategista · +30% duração de status e +10 pontos de chance de lentidão.',{duration:.3,status:.1},[t('Possessão das Sombras','Genjutsu','Sombra','Cone'),L.agulhasSombra,L.prisaoSombra,t('Costura das Sombras','Genjutsu','Sombra','Linha')],'Estrangulamento das Sombras','Controle, duração e velocidade de ataque'),
 h('temari','Temari','Vila da Areia','#d1be8a',125,22,4,6.7,'Mestra do Leque · +25% raio dos ataques.',{area:.25},[t('Corte do Leque','Ninjutsu','Vento','Cone'),L.laminas,L.vendaval,t('Tornado Cortante','Ninjutsu','Vento','Órbita')],'Invocação de Kamatari','Área, projéteis e ninjutsu'),
 h('tenten','Tenten','Vila da Folha','#dc9f91',120,16,4,7,'Mestra de Armas · ×1,5 de dano em técnicas neutras ou de projétil. +1 projétil por disparo.',{projectiles:1},[L.shuriken,t('Kunai Explosiva','Taijutsu','Neutro','Área'),L.senbon,t('Corrente de Armas','Taijutsu','Neutro','Linha')],'Dragões Gêmeos','Projéteis, taijutsu e crítico'),
 h('pain','Pain','Vila da Chuva','#ca86cb',140,24,7,6.2,'Caminho Deva · +20% ninjutsu e +15% raio de área. Nagato (Clã Uzumaki) controla o corpo de Yahiko pelos receptores de chakra.',{element:.2,area:.15},[L.kunai,t('Shinra Tensei','Ninjutsu','Neutro','Área'),t('Bansho Tenin','Ninjutsu','Neutro','Cone'),L.bolaFogo],'Chibaku Tensei','Ninjutsu, área e recarga'),
 h('tobirama','Tobirama','Vila da Folha','#82cbe6',135,21,7,6.8,'Estratégia Suiton · +15% velocidade de ataque e +15% recarga da Ultimate.',{attackSpeed:.15,cool:.15},[t('Corte de Água','Ninjutsu','Água','Linha'),L.dragaoAgua,L.agulhasAgua,t('Onda Explosiva','Ninjutsu','Água','Área',1.4)],'Mar do Segundo Hokage','Velocidade de ataque, ninjutsu e recarga'),
 h('kankuro','Kankuro','Vila da Areia','#a48fc7',130,18,6,6.5,'Marionetista · +20% duração de status e ataques aplicam veneno de 20% do impacto em 3 s.',{duration:.2,dot:.2},[t('Agulhas de Karasu','Taijutsu','Neutro','Em V'),t('Kuroari','Ninjutsu','Neutro','Área'),L.parede,L.kunai],'Teatro das Marionetes','Veneno, duração e projéteis'),
 h('guy','Might Guy','Vila da Folha','#69cf81',145,25,7,6.8,'Poder da Juventude · +30% taijutsu e +10% movimento.',{normal:.3,move:.1},[L.furacao,L.portoes,t('Pavão da Manhã','Taijutsu','Fogo','Em V'),t('Tigre do Meio-Dia','Taijutsu','Neutro','Onda',1.8)],'Oito Portões','Taijutsu, velocidade de ataque e crítico'),
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
export function isProjectileUltimate(id:string){return id==='naruto'||id==='tenten'||id==='minato';}
export function ultimateBase(hero:Hero):Technique{return [...hero.techniques].reverse().find(t=>!t.setup)??hero.techniques[0];}
export const HERO_BY_ID=Object.fromEntries(HEROES.map(h=>[h.id,h])) as Record<string,Hero>;
/**
 * Níveis por FASE DA OBRA (pedido do usuário, 06/11/2026): técnicas da fase criança/genin saem cedo; técnicas de fases
 * avançadas (Shippuden, guerra, Hokage) só quando o shinobi evolui na run, alinhadas às formas de `evolution.ts`.
 * Fase conferida na Narutopedia pelo capítulo de estreia (Parte I = cap. 1–244; Shippuden = cap. 245+), 06/11/2026.
 * Quem não aparece aqui usa o padrão por posição no kit (1/5/12/20). Os kits já estão na ordem cronológica.
 */
export const PHASE_LEVELS:Record<string,Record<string,number>>={
 // Kage Bunshin (cap. 1, Academia) → Invocação do Sapo com Jiraiya (Parte I, forma Clássico Nv. 10)
 // → Rasengan (cap. 150, fim da Parte I) → Modo Sábio (cap. 375, forma Shippuden Nv. 25).
 naruto:{'Kage Bunshin':1,'Invocação do Sapo':10,'Rasengan':15,'Modo Sábio':25},
 // Bola de Fogo (cap. 7, infância) → Chidori (cap. 113, Parte I) → Amaterasu do Sasuke (Shippuden, após a forma do Nv. 15).
 sasuke:{'Kunai Tática':1,'Bola de Fogo':5,'Chidori':8,'Amaterasu':20},
 // Força sobre-humana (Impacto de Sakura, cap. 246) é Shippuden: forma do Nv. 15.
 sakura:{'Punho da Folha':1,'Chute Ascendente':5,'Impacto de Sakura':15,'Ruptura do Solo':20},
 // Fênix (cap. 46) → Corvos → Tsukuyomi (Mangekyō, Akatsuki, cap. 142): forma Akatsuki do Nv. 15.
 itachi:{'Shuriken':1,'Fênix de Fogo':5,'Corvos Ilusórios':10,'Tsukuyomi':15},
 // Barreira Espaço-Tempo: Minato já Quarto Hokage (forma do Nv. 15).
 minato:{'Barreira Espaço-Tempo':15},
 // Tsunade é adulta na obra toda: Chute Celestial (cap. 163) e Byakugou (cap. 153) chegam junto da forma Quinta Hokage (Nv. 15).
 tsunade:{'Punho da Folha':1,'Chute Celestial':5,'Ruptura do Solo':12,'Byakugou':15},
 // Agulhas de cabelo (Needle Jizō, cap. 166) → Invocação do Sapo → Óleo Flamejante com Gamabunta (cap. 170) → Modo Sábio (forma Nv. 20).
 jiraiya:{'Agulhas de Cabelo':1,'Invocação do Sapo':5,'Óleo Flamejante':12,'Modo Sábio':20},
 // Lee: tudo da Parte I enquanto genin (forma Genin até o Nv. 14): Furacão (cap. 37), Lótus (cap. 52), Portões (cap. 85).
 lee:{'Punho da Folha':1,'Furacão da Folha':5,'Lótus Primária':8,'Portões do Inferno':12},
 // Neji: Kaiten e 64 Palmas (cap. 101, Parte I) → Palma de Ar (cap. 256, Shippuden): forma Jonin do Nv. 15.
 neji:{'Punho Gentil':1,'Kaiten':5,'Sessenta e Quatro Palmas':10,'Palma de Ar':15},
 // Hinata: Palmas Protetoras (Parte I no anime) → Palma de Ar (Shippuden) → Leões Gêmeos (cap. 437): forma Leões Gêmeos do Nv. 30.
 hinata:{'Punho Gentil':1,'Palmas Protetoras':8,'Palma de Ar':15,'Punhos dos Leões Gêmeos':30},
 // Shikamaru: Possessão das Sombras (cap. 55) → Costura das Sombras (cap. 283, Shippuden): forma Estrategista do Nv. 15.
 shikamaru:{'Possessão das Sombras':1,'Agulhas da Sombra':5,'Prisão das Sombras':12,'Costura das Sombras':15},
 // Guy: Pavão da Manhã (cap. 258, 6º portão) e Tigre do Meio-Dia (cap. 506, 7º portão) seguem as formas do Nv. 15 e 30.
 guy:{'Furacão da Folha':1,'Portões do Inferno':5,'Pavão da Manhã':15,'Tigre do Meio-Dia':30},
};
for(const [id,levels] of Object.entries(PHASE_LEVELS))for(const tech of HERO_BY_ID[id].techniques)if(levels[tech.name]!==undefined)tech.unlockLevel=levels[tech.name];
/** Usuários canônicos do Modo Sábio (Narutopedia, Sage Mode): podem aprender técnicas de elemento Sábio. */
export const SAGE_USERS=new Set(['naruto','jiraiya','hashirama','minato']);
/** Técnicas únicas de um shinobi: as do kit que não estão na biblioteca compartilhada (1–2 por shinobi). */
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
  const others=[...HEROES.filter(o=>o.id!==hero.id&&o.village===hero.village),...HEROES.filter(o=>o.village!==hero.village)];
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
 {id:'akatsuki',name:'Akatsuki',members:['itachi','pain','orochimaru','kisame','deidara','sasori','hidan','kakuzu','konan','obito','zetsu']},
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
 kankuro:['Vento','Raio','Terra','Água'],guy:['Fogo','Raio'],kushina:['Vento','Água','Sombra'],asuma:['Vento','Fogo'],
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