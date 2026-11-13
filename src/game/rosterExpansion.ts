import type { Bonuses } from './catalog.ts';
import type { Control, Element, School, Shape, Setup } from './heroes.ts';
import type { UnlockMission } from './unlockMissions.ts';

export type Signature = {
  name: string;
  school: School;
  element: Element;
  shape: Shape;
  visual: string;
  status?: Control;
  secondaryElement?: Element;
  setup?: Setup;
};

const strike = (name: string, school: School, element: Element, shape: Shape, visual: string, status?: Control, secondaryElement?: Element): Signature =>
  ({ name, school, element, shape, visual, status, secondaryElement });

const [taijutsu, ninjutsu, genjutsu] = ['Taijutsu', 'Ninjutsu', 'Genjutsu'] as const;
const [neutral, fire, water, wind, earth, lightning, wood, sand, shadow] = ['Neutro', 'Fogo', 'Água', 'Vento', 'Terra', 'Raio', 'Madeira', 'Areia', 'Sombra'] as const;
const [melee, projectile, line, wave, area, cone, orbit] = ['Corpo a corpo', 'Projétil', 'Linha', 'Onda', 'Área', 'Cone', 'Órbita'] as const;
const leaf = 'Vila da Folha', cloud = 'Vila da Nuvem', stone = 'Vila da Pedra', mist = 'Vila da Névoa', desert = 'Vila da Areia', rain = 'Vila da Chuva';
type Kit = readonly [Signature, Signature];
type Route = readonly [UnlockMission['map'], UnlockMission['difficulty'], number, number];
type Expansion = {
  id: string; name: string; family: string; form: number; title: string; village: string;
  stats: readonly [hp: number, damage: number, armor: number, speed: number];
  passive: string; bonuses: Bonuses; kit: Kit; ultimate: string; mission: UnlockMission;
  medical?: boolean;
};
function entry(
  id: string, name: string, title: string, village: string, stats: Expansion['stats'], passive: string, bonuses: Bonuses,
  kit: Kit, ultimate: string, route: Route, missionTitle: string, story: string, requires?: string[],
): Expansion {
  const [map, difficulty, minute, kills] = route;
  return { id, name, title, village, family: id, form: 1, stats, passive, bonuses, kit, ultimate,
    mission: { map, difficulty, minute, kills, title: missionTitle, story, requires } };
}
function variant(base: Expansion, id: string, title: string, form: number, playWith: string, kit: Kit, ultimate: string, route: Route, missionTitle: string, story: string): Expansion {
  const [map, difficulty, minute, kills] = route;
  const [hp, damage, armor, speed] = base.stats;
  const step = form >= 30 ? 2 : 1;
  return { ...base, id, title, form, stats: [Math.round(hp * (1 + .12 * step)), damage * (1 + .12 * step), armor + step, speed + .08 * step],
    kit, ultimate, mission: { map, difficulty, minute, kills, title: missionTitle, story, playWith } };
}
const sage = 'Sábio' as const;
const expansion: Signature = { ...strike('Jutsu de Expansão', taijutsu, neutral, 'Buff', 'impact'),
  setup: { cooldown: 14, duration: 5, bonuses: { area: .35, normal: .2, defense: 4 }, stack: false,
    summary: 'Expande o corpo de Chōji por 5 s. +35% de área, +20% de taijutsu e +4 de armadura.' } };
const choji = entry('choji','Chōji Akimichi','Genin',leaf,[102,25,7,6.15],'Força Akimichi · +15% taijutsu e +8% área.',{normal:.15,area:.08},
  [strike('Tanque Humano',taijutsu,neutral,wave,'wheel','Empurrar'),expansion],'Tanque Humano Espinhoso',['folha','Genin',2,170],'O Tanque Humano','Enfrente Chōji no campo de treino do Time 10.');
const kiba = entry('kiba','Kiba Inuzuka','Genin',leaf,[89,24,4,7.4],'Faro de Akamaru · +10% movimento e +1 coleta.',{move:.1,pickupFlat:1},
  [strike('Presa sobre Presa',taijutsu,neutral,wave,'fang','Empurrar'),strike('Marcação Dinâmica',ninjutsu,neutral,cone,'mark','Lentidão')],'Presa sobre Presa Dupla',['folha','Genin',2,150],'Faro da Floresta','Siga os rastros de Kiba e Akamaru até o campo de treino do Time 8.');
const shino = entry('shino','Shino Aburame','Genin',leaf,[87,25,5,6.6],'Colônia de Kikaichū · veneno de 18% e +15% duração de status.',{dot:.18,duration:.15},
  [strike('Enxame de Kikaichū',ninjutsu,neutral,projectile,'swarm','Lentidão'),strike('Esfera de Insetos',ninjutsu,neutral,area,'swarm','Paralisar')],'Nuvem Aburame',['folha','Genin',3,230],'Colônia Oculta','Rastreie a colônia Aburame sem perder Shino na mata.',['kiba']);
const ino = entry('ino','Ino Yamanaka','Genin',leaf,[83,24,4,6.8],'Mente Sensora · +15 pontos de chance de Genjutsu e +1 coleta.',{genjutsu:.15,pickupFlat:1},
  [strike('Transferência de Mente',genjutsu,shadow,line,'mind','Paralisar'),strike('Perturbação da Mente',genjutsu,shadow,area,'mind','Atordoar')],'Possessão da Mente',['folha','Genin',2,160],'A Mente do Time 10','Supere o teste de concentração da família Yamanaka.');
const obito = entry('obito','Obito Uchiha','Genin',leaf,[91,26,5,6.9],'Olho Desperto · +6 pontos de chance crítica e +10% ninjutsu.',{crit:.06,element:.1},
  [strike('Katon: Grande Bola de Fogo',ninjutsu,fire,cone,'fire'),strike('Técnica de Manipulação de Shuriken',taijutsu,neutral,line,'blade','Lentidão')],'Chamas de Kannabi',['pedra','Chunin',3,340],'A Ponte de Kannabi','Encontre Obito na rota da ponte de Kannabi.',['kakashi']);
const kabuto = {...entry('kabuto','Kabuto Yakushi','Clássico','Vila do Som',[96,26,5,6.95],'Ninjutsu Médico · +0,9 HP/s e +1,5 coleta.',{regen:.9,pickupFlat:1.5},
  [strike('Bisturi de Chakra',ninjutsu,neutral,melee,'scalpel'),strike('Templo do Nirvana',genjutsu,shadow,area,'sleep','Dormir')],'Bisturi de Chakra: Corte Cirúrgico',['folha','Chunin',4,345],'O Espião Médico','Identifique o espião nos arredores da arena do Exame Chūnin.',['orochimaru']),medical:true};
const hanabi = entry('hanabi','Hanabi Hyūga','Clássico',leaf,[86,25,5,6.9],'Olhos da Casa Principal · +10% taijutsu e +7 pontos de chance crítica.',{normal:.1,crit:.07},
  [strike('Palma dos Oito Trigramas',taijutsu,neutral,melee,'palms','Atordoar'),strike('Passos da Casa Principal',taijutsu,neutral,orbit,'palms','Empurrar')],'Oito Trigramas: Sessenta e Quatro Palmas',['folha','Chunin',3,320],'A Herdeira Hyūga','Prove sua técnica no pátio do clã Hyūga.',['hinata']);

export const ROSTER_EXPANSION: readonly Expansion[] = [
  entry('hiruzen','Hiruzen Sarutobi','Terceiro Hokage',leaf,[128,30,8,6.2],'Professor dos Cinco Elementos · +20% ninjutsu e +12% área.',{element:.2,area:.12},
    [strike('Bastão Adamantino',taijutsu,neutral,line,'staff','Empurrar'),strike('Liberação dos Cinco Elementos',ninjutsu,fire,area,'elements','Atordoar',earth)],'Formação dos Cinco Elementos',['folha','Kage',6,800],'A Vontade do Fogo','Enfrente o Terceiro Hokage na defesa de Konoha.',['orochimaru']),
  entry('raikage-terceiro','A','Terceiro Raikage',cloud,[153,29,12,6.45],'Escudo Supremo · +8 armadura e +12% taijutsu.',{defense:8,normal:.12},
    [strike('Estocada Infernal',ninjutsu,lightning,line,'lightning','Paralisar'),strike('Dedo Único do Inferno',ninjutsu,lightning,line,'lightning','Paralisar')],'Lança do Inferno',['pedra','Jonin',5,540],'Escudo e Lança','Quebre a defesa do Terceiro Raikage na frente da Aliança.'),
  entry('raikage-quarto','A','Quarto Raikage',cloud,[130,30,9,7.25],'Manto Relâmpago · +15% movimento e +16% taijutsu.',{move:.15,normal:.16},
    [strike('Lariat Relâmpago',taijutsu,lightning,wave,'lightning','Empurrar'),strike('Liger Bomb',taijutsu,lightning,area,'impact','Atordoar')],'Guilhotina de Relâmpago',['pedra','Kage',6,760],'O Quarto Raikage','Supere a investida do Quarto Raikage.',['raikage-terceiro']),
  entry('killer-b','Killer B','Jinchūriki',cloud,[118,30,7,6.95],'Ritmo de Oito Espadas · +18% velocidade de ataque e +12% taijutsu.',{attackSpeed:.18,normal:.12},
    [strike('Estilo Acrobático das Sete Espadas',taijutsu,neutral,orbit,'blade'),strike('Lariat de Gyūki',taijutsu,lightning,line,'fang','Empurrar')],'Bijūdama do Oito-Caudas',['pedra','Jonin',4,470],'A Ilha-Tartaruga','Alcance Killer B depois do treino de controle da besta.'),
  entry('onoki','Ōnoki','Terceiro Tsuchikage',stone,[99,30,8,6.25],'Pedra Leve · +15% ninjutsu e +15% velocidade de projétil.',{element:.15,projectileSpeed:.15},
    [strike('Punho de Rocha',ninjutsu,earth,melee,'impact','Empurrar'),strike('Jinton: Desprendimento do Mundo Primitivo',ninjutsu,earth,line,'cube','Atordoar',wind)],'Jinton: Desintegração',['pedra','Kage',5,700],'O Peso da Pedra','Teste o Estilo Poeira do Terceiro Tsuchikage.'),
  entry('ao','Ao','Veterano da Névoa',mist,[97,25,7,6.6],'Byakugan da Névoa · +6 pontos de chance crítica e +1,5 coleta.',{crit:.06,pickupFlat:1.5},
    [strike('Byakugan: Rastreamento de Chakra',ninjutsu,neutral,line,'scan','Lentidão'),strike('Byakugan: Campo Sensorial',ninjutsu,neutral,area,'scan','Paralisar')],'Barreira Sensorial',['nevoa','Chunin',3,320],'Olho da Névoa','Ache o sensor de Kirigakure antes que a neblina feche.'),
  entry('rasa','Rasa','Quarto Kazekage',desert,[123,29,10,6.4],'Pó de Ouro · +10 armadura e +15% área.',{defense:10,area:.15},
    [strike('Projétil de Pó de Ouro',ninjutsu,sand,projectile,'gold','Lentidão'),strike('Muralha de Ouro',ninjutsu,sand,line,'gold','Atordoar')],'Funeral de Ouro',['areia','Kage',5,710],'O Ouro do Deserto','Enfrente a areia dourada do pai de Gaara.',['gaara']),
  entry('hanzo','Hanzō','Salamandra',rain,[117,28,8,6.8],'Respirador de Ibuse · veneno de 28% e +15% duração de status.',{dot:.28,duration:.15},
    [strike('Foice e Corrente',taijutsu,neutral,cone,'blade','Lentidão'),strike('Ibuse: Névoa Tóxica',ninjutsu,shadow,area,'poison','Paralisar')],'Sopro de Ibuse',['nevoa','Jonin',5,520],'O Líder da Chuva','Sobreviva à nuvem de veneno da salamandra.',['jiraiya']),
  entry('mei','Mei Terumī','Quinta Mizukage',mist,[104,29,6,6.7],'Duas Linhagens · +18% ninjutsu e +15% duração de status.',{element:.18,duration:.15},
    [strike('Yōton: Torrente de Lava',ninjutsu,fire,wave,'lava','Lentidão',earth),strike('Futton: Névoa Corrosiva',ninjutsu,water,area,'steam','Lentidão',fire)],'Encontro da Lava e do Vapor',['nevoa','Jonin',5,520],'A Quinta Mizukage','Resista ao calor e ao vapor de Mei.',['ao']),
  entry('gengetsu','Gengetsu Hōzuki','Segundo Mizukage',mist,[108,29,7,6.7],'Miragem do Molusco · +8 pontos de evasão e +15% chance de Genjutsu.',{dodge:.08,genjutsu:.15},
    [strike('Suiton: Pistola de Água',ninjutsu,water,projectile,'water','Atordoar'),strike('Jōki Bōi',ninjutsu,water,area,'steam','Empurrar',fire)],'Miragem do Molusco Gigante',['nevoa','Kage',6,790],'O Segundo Mizukage','Localize Gengetsu por trás das miragens do molusco.',['mei']),
  {...entry('naruto-hokage','Naruto','Sétimo Hokage',leaf,[182,31,9,7.4],'Sétimo Hokage · +15% dano total e +12% movimento.',{damage:.15,move:.12},
    [strike('Rasengan do Sétimo Hokage',ninjutsu,wind,area,'spiral','Empurrar'),strike('Rasenshuriken do Sétimo',ninjutsu,wind,projectile,'spiral','Empurrar')],'Grande Rasenshuriken',['folha','Kage',8,1150],'O Sétimo Hokage','Com Naruto Kyuubi, abra caminho até o Sétimo Hokage.'),
    family:'naruto',form:70,mission:{map:'folha',difficulty:'Kage',minute:8,kills:1150,playWith:'naruto-kyuubi',title:'O Sétimo Hokage',story:'Com Naruto Kyuubi, abra caminho até o Sétimo Hokage.'}},
  choji, kiba, shino, ino,
  entry('kurenai','Kurenai Yūhi','Jōnin',leaf,[93,26,6,6.85],'Mestra da Ilusão · +20 pontos de chance de Genjutsu e +22% duração.',{genjutsu:.2,duration:.22},
    [strike('Árvore da Morte Ilusória',genjutsu,shadow,area,'mind','Dormir'),strike('Pétalas da Ilusão',genjutsu,shadow,cone,'mind','Paralisar')],'Aprisionamento na Árvore da Morte',['folha','Chunin',4,370],'A Prova da Ilusão','Encontre a líder do Time 8 e quebre seu genjutsu.',['shino']),
  entry('iruka','Iruka Umino','Chūnin',leaf,[96,24,6,6.7],'Lições da Academia · +12% experiência e +1 coleta.',{exp:.12,pickupFlat:1},
    [strike('Kunai do Instrutor',taijutsu,neutral,projectile,'blade'),strike('Formação de Selamento',ninjutsu,neutral,area,'scan','Paralisar')],'Disciplina da Academia',['folha','Genin',2,130],'A Lição da Floresta','Encontre Iruka na floresta que cerca a Academia.'),
  entry('sai','Sai','Time 7',leaf,[89,27,5,6.9],'Traço Preciso · +10% ninjutsu e +10% velocidade de projétil.',{element:.1,projectileSpeed:.1},
    [strike('Chōjū Giga: Leões de Tinta',ninjutsu,neutral,wave,'ink','Empurrar'),strike('Chōjū Giga: Ave de Tinta',ninjutsu,neutral,projectile,'ink','Atordoar')],'Chōjū Giga: Feras de Tinta',['folha','Chunin',4,350],'O Pergaminho em Branco','Intercepte os desenhos vivos de Sai.'),
  entry('yamato','Yamato','Capitão do Time 7',leaf,[108,26,8,6.65],'Madeira de Contenção · +18% duração de status e +5 armadura.',{duration:.18,defense:5},
    [strike('Mokuton: Pilares de Contenção',ninjutsu,wood,line,'roots','Lentidão'),strike('Mokuton: Prisão dos Quatro Pilares',ninjutsu,wood,area,'roots','Paralisar')],'Mokuton: Floresta de Pilares',['folha','Jonin',4,460],'Capitão do Time 7','Mostre controle de chakra ao capitão Yamato.',['sai']),
  entry('shisui','Shisui Uchiha','Shunshin',leaf,[94,28,5,7.45],'Shunshin · +12% movimento e +8 pontos de chance crítica.',{move:.12,crit:.08},
    [strike('Corte do Shunshin',taijutsu,neutral,line,'blade','Atordoar'),strike('Kotoamatsukami',genjutsu,shadow,area,'mind','Dormir')],'Olho da Vontade Celestial',['folha','Jonin',5,520],'Shisui do Teletransporte','Acompanhe os deslocamentos de Shisui no campo de treino.',['itachi']),
  obito,
  entry('hiashi','Hiashi Hyūga','Chefe do Clã',leaf,[105,27,8,6.65],'Defesa dos Trigramas · +16% taijutsu e +6 armadura.',{normal:.16,defense:6},
    [strike('Kaiten do Chefe Hyūga',taijutsu,neutral,orbit,'palms','Empurrar'),strike('Punho Gentil: Palma Dupla',taijutsu,neutral,line,'palms','Atordoar')],'Oito Trigramas: Rotação Celestial',['folha','Jonin',4,460],'A Casa Principal','Passe pela defesa do líder dos Hyūga.',['hanabi']),
  hanabi,
  entry('kisame','Kisame Hoshigaki','Akatsuki',mist,[130,29,9,6.35],'Chakra da Samehada · +18% ninjutsu e +0,8 HP/s.',{element:.18,regen:.8},
    [strike('Suiton: Tubarão Aquático',ninjutsu,water,projectile,'shark','Lentidão'),strike('Dança da Prisão de Água',ninjutsu,water,area,'water','Paralisar')],'Grande Tubarão-Bala',['nevoa','Jonin',5,510],'O Monstro da Névoa','Fique de pé dentro da cúpula de água de Kisame.',['zabuza']),
  entry('zabuza','Zabuza Momochi','Espadachim da Névoa',mist,[113,28,8,6.8],'Assassinato Silencioso · +6 pontos de evasão e +18% dano crítico.',{dodge:.06,critDamage:.18},
    [strike('Corte da Kubikiribōchō',taijutsu,neutral,cone,'blade','Atordoar'),strike('Kirigakure: Névoa Oculta',ninjutsu,water,area,'steam','Lentidão')],'Assassinato na Névoa',['nevoa','Chunin',3,325],'O Demônio da Névoa','Encontre Zabuza na névoa junto à ponte.',['kakashi']),
  entry('suigetsu','Suigetsu Hōzuki','Taka',mist,[99,27,6,7.1],'Corpo Hidratado · +8 pontos de evasão e +12% ninjutsu.',{dodge:.08,element:.12},
    [strike('Hidratação: Corte da Espada Decapitadora',taijutsu,water,cone,'water','Lentidão'),strike('Braço de Água',ninjutsu,water,line,'water','Empurrar')],'Onda da Espada Decapitadora',['nevoa','Chunin',4,355],'Herança da Lâmina','Dispute a herança da espada da Névoa.',['zabuza']),
  entry('mangetsu','Mangetsu Hōzuki','Espadachim da Névoa',mist,[106,28,7,7.05],'Mestre das Sete Lâminas · +18% taijutsu e +8% velocidade de ataque.',{normal:.18,attackSpeed:.08},
    [strike('Estilo das Sete Espadas da Névoa',taijutsu,neutral,orbit,'blade','Atordoar'),strike('Lâmina de Hidratação',ninjutsu,water,line,'water','Lentidão')],'Convergência das Sete Lâminas',['nevoa','Jonin',5,495],'As Sete Espadas','Desafie o mestre que empunhava as sete lâminas.',['suigetsu']),
  {...entry('karin','Karin Uzumaki','Taka','Vila da Grama',[88,24,5,6.9],'Sensor e Cura Uzumaki · +1,2 HP/s e +2 coleta.',{regen:1.2,pickupFlat:2},
    [strike('Correntes de Karin',ninjutsu,neutral,line,'chains','Paralisar'),strike('Prisão Adamantina',ninjutsu,neutral,area,'chains','Paralisar')],'Rede Adamantina',['pedra','Chunin',4,355],'O Chamado de Karin','Encontre Karin seguindo o chakra do Taka.'),medical:true},
  entry('nagato','Nagato Uzumaki','Edo Tensei',rain,[110,30,7,6.35],'Rinnegan dos Seis Caminhos · +18% ninjutsu e +15% área.',{element:.18,area:.15},
    [strike('Receptores de Chakra',ninjutsu,neutral,projectile,'staff','Paralisar'),strike('Invocação dos Caminhos',ninjutsu,neutral,area,'paths','Atordoar')],'Seis Caminhos do Rinnegan',['nevoa','Kage',6,810],'Por Trás de Pain','Encontre Nagato após conhecer o Caminho Deva.',['pain']),
  entry('sasori','Sasori','Akatsuki',desert,[106,28,7,6.7],'Veneno do Escorpião · veneno de 30% e +15% duração de status.',{dot:.3,duration:.15},
    [strike('Hiruko: Cauda de Escorpião',taijutsu,neutral,line,'chains','Lentidão'),strike('Terceiro Kazekage: Areia de Ferro',ninjutsu,sand,area,'iron','Paralisar')],'Performance das Cem Marionetes',['areia','Jonin',5,530],'O Escorpião da Areia','Atravesse o arsenal de marionetes do Escorpião.',['kankuro']),
  entry('haku','Haku','Caçador da Névoa',mist,[85,26,4,7.2],'Espelhos de Gelo · +12% movimento e +8 pontos de chance crítica.',{move:.12,crit:.08},
    [strike('Senbon de Gelo',ninjutsu,water,projectile,'ice','Lentidão',wind),strike('Espelhos Demoníacos de Gelo',ninjutsu,water,orbit,'ice','Atordoar',wind)],'Labirinto de Espelhos',['nevoa','Chunin',3,335],'Os Espelhos da Ponte','Encontre Haku depois do encontro com Zabuza.',['zabuza']),
  entry('chiriku','Chiriku','Templo do Fogo',leaf,[104,26,8,6.7],'Defesa do Templo · +7 armadura e +12% taijutsu.',{defense:7,normal:.12},
    [strike('Taijutsu dos Monges',taijutsu,neutral,cone,'palms','Atordoar'),strike('Assassinato de Mil Braços',ninjutsu,neutral,area,'palms','Empurrar')],'Ira dos Mil Braços',['folha','Chunin',4,350],'O Monge do Fogo','Visite o Templo do Fogo e enfrente seu guardião.',['asuma']),
  entry('sakumo','Sakumo Hatake','Canino Branco',leaf,[105,28,6,7.15],'Fio de Chakra Branco · +16% taijutsu e +7 pontos de chance crítica.',{normal:.16,crit:.07},
    [strike('Corte da Lâmina Branca',taijutsu,neutral,line,'blade','Atordoar'),strike('Investida do Canino Branco',taijutsu,neutral,wave,'fang','Empurrar')],'Clarão do Canino Branco',['folha','Jonin',5,485],'A Lâmina Branca','Siga o legado do Canino Branco da Folha.',['kakashi']),
  entry('deidara','Deidara','Akatsuki',stone,[91,29,4,7.05],'Argila Explosiva · +18% ninjutsu e +12% área.',{element:.18,area:.12},
    [strike('C1: Ave de Argila',ninjutsu,earth,projectile,'clay','Empurrar'),strike('C2: Dragão de Argila',ninjutsu,earth,line,'clay','Atordoar')],'C3: Bomba de Argila',['pedra','Jonin',4,490],'Arte Explosiva','Intercepte os explosivos de Deidara no País da Terra.'),
  entry('hidan','Hidan','Akatsuki','Vila das Fontes Termais',[118,28,6,6.9],'Imortalidade de Jashin · revive uma vez com 35% do HP.',{revive35:1},
    [strike('Foice de Três Lâminas',taijutsu,neutral,cone,'scythe','Empurrar'),strike('Ritual de Jashin',ninjutsu,neutral,area,'ritual','Paralisar')],'Maldição do Sangue',['folha','Jonin',4,480],'O Ritual de Jashin','Supere o ritual de Hidan na rota do Templo do Fogo.',['asuma']),
  entry('kakuzu','Kakuzu','Akatsuki','Vila da Cachoeira',[130,28,8,6.45],'Corações do Ressentimento · +1 HP/s e +15% ninjutsu.',{regen:1,element:.15},
    [strike('Jiongu: Fios Negros',ninjutsu,neutral,line,'threads','Paralisar'),strike('Fūton: Pressão',ninjutsu,wind,cone,'air-cannon','Empurrar')],'Fogo e Vento: Mar de Chamas',['folha','Jonin',5,550],'Corações Roubados','Enfrente as máscaras elementais de Kakuzu após o ritual.',['hidan']),
  entry('konan','Konan','Akatsuki',rain,[90,28,4,7.1],'Dança do Papel · +10% evasão e +1 projétil.',{dodge:.1,projectiles:1},
    [strike('Shuriken de Papel',ninjutsu,neutral,projectile,'paper'),strike('Dança do Shikigami',ninjutsu,neutral,cone,'paper','Lentidão')],'Técnica do Papel Divino',['nevoa','Jonin',5,535],'O Anjo da Chuva','Encontre Konan entre os origamis da Chuva.'),
  entry('zetsu','Zetsu','Akatsuki','Sem aldeia',[98,26,5,6.9],'Esporos · +0,7 HP/s e +20% duração de status.',{regen:.7,duration:.2},
    [strike('Técnica dos Esporos',ninjutsu,neutral,area,'spores','Lentidão'),strike('Técnica Parasita',ninjutsu,neutral,line,'spores','Paralisar')],'Parasita do Zetsu Negro',['pedra','Jonin',5,530],'O Espião da Akatsuki','Localize Zetsu antes que ele volte ao subsolo.'),
  entry('jugo','Jūgo','Taka','Vila do Som',[125,29,8,6.55],'Transformação Instintiva · +16% taijutsu e +5 armadura.',{normal:.16,defense:5},
    [strike('Transformação Sábia: Punho',taijutsu,neutral,melee,'mutant','Atordoar'),strike('Canhão de Chakra de Jūgo',ninjutsu,neutral,line,'mutant','Empurrar')],'Barragem do Canhão de Chakra',['pedra','Jonin',5,485],'A Origem do Selo Amaldiçoado','Encontre Jūgo na rota do refúgio do Norte.',['suigetsu','karin']),
  kabuto,
  {...variant(kabuto,'kabuto-sabio','Sábio do Dragão',30,'kabuto',
    [strike('Muki Tensei',ninjutsu,sage,area,'cave','Paralisar',earth),strike('Hakugeki',ninjutsu,sage,line,'white-rage','Atordoar')],
    'Arte Sábia: Hakugeki',['nevoa','Kage',6,780],'O Sábio da Caverna Ryūchi','Jogue com Kabuto Clássico e enfrente o Sábio do Dragão.'),
    passive:'Sábio do Dragão · Senjutsu ativo, +18% ninjutsu e +1 HP/s.',bonuses:{sage:1,element:.18,regen:1}},
  entry('kimimaro','Kimimaro','Clássico','Vila do Som',[111,29,7,7],'Shikotsumyaku · +16% taijutsu e +6 armadura.',{normal:.16,defense:6},
    [strike('Dança da Camélia',taijutsu,neutral,cone,'bone-blade'),strike('Dança da Samambaia',ninjutsu,neutral,area,'bones','Paralisar')],'Dança das Clematites: Flor',['folha','Jonin',5,550],'O Último Kaguya','Alcance Kimimaro na rota da recuperação de Sasuke.',['jirobo','kidomaru','tayuya','sakon-ukon']),
  entry('jirobo','Jirōbō','Quarteto do Som','Vila do Som',[125,27,9,6.2],'Força do Selo · +8 armadura e +12% área.',{defense:8,area:.12},
    [strike('Doton: Arremesso da Rocha',ninjutsu,earth,projectile,'boulder','Empurrar'),strike('Doton: Prisão da Cúpula de Terra',ninjutsu,earth,area,'dome','Paralisar')],'Doton: Retorno da Terra',['folha','Chunin',3,340],'A Cúpula do Som','Rompa a cúpula que bloqueia a rota da perseguição.',['orochimaru']),
  entry('kidomaru','Kidōmaru','Quarteto do Som','Vila do Som',[90,28,5,7],'Arqueiro de Seda Dourada · +15% velocidade de projétil e +8 pontos de chance crítica.',{projectileSpeed:.15,crit:.08},
    [strike('Teia de Aranha',ninjutsu,neutral,projectile,'web','Paralisar'),strike('Arco de Guerra da Aranha',taijutsu,neutral,projectile,'spider-arrow')],'Flecha da Aranha: Tiro Guiado',['folha','Chunin',4,380],'A Teia no Bosque','Rompa as teias e alcance Kidōmaru no bosque.',['jirobo']),
  entry('tayuya','Tayuya','Quarteto do Som','Vila do Som',[91,27,5,6.85],'Flauta Demoníaca · +18 pontos de chance de Genjutsu e +20% duração de status.',{genjutsu:.18,duration:.2},
    [strike('Correntes da Flauta Demoníaca',genjutsu,shadow,wave,'flute','Paralisar'),strike('Invocação dos Doki',ninjutsu,neutral,area,'doki','Atordoar')],'Flauta Demoníaca: Sonho das Correntes',['folha','Chunin',4,400],'A Flauta na Floresta','Resista à melodia de Tayuya e aos seus Doki.',['jirobo']),
  entry('sakon-ukon','Sakon e Ukon','Quarteto do Som','Vila do Som',[110,28,7,6.75],'Corpos Gêmeos · +14% taijutsu e +0,6 HP/s.',{normal:.14,regen:.6},
    [strike('Sequência de Punhos Múltiplos',taijutsu,neutral,melee,'twins','Atordoar'),strike('Invocação: Rashōmon',ninjutsu,neutral,line,'rashomon','Empurrar')],'Parasitismo dos Gêmeos',['folha','Jonin',4,490],'Os Gêmeos do Som','Sobreviva à emboscada de Sakon e Ukon.',['jirobo']),
  entry('dosu','Dosu Kinuta','Trio do Som','Vila do Som',[90,26,5,6.8],'Braço Ressonante · +14 pontos de chance de status e +10% área.',{status:.14,area:.1},
    [strike('Furadeira Ressonante',ninjutsu,neutral,melee,'resonance','Atordoar'),strike('Vibração do Amplificador',ninjutsu,neutral,cone,'resonance','Lentidão')],'Ressonância do Som',['folha','Genin',3,240],'A Ressonância do Exame','Enfrente Dosu na arena do Exame Chūnin.'),
  entry('zaku','Zaku Abumi','Trio do Som','Vila do Som',[87,26,4,7.1],'Dutos de Ar · +16% velocidade de projétil e +10% ninjutsu.',{projectileSpeed:.16,element:.1},
    [strike('Ondas Cortantes de Ar',ninjutsu,neutral,cone,'air-cannon','Empurrar'),strike('Ondas Cortantes Extremas',ninjutsu,neutral,line,'air-cannon','Atordoar')],'Ondas Cortantes: Descarga Total',['folha','Genin',2,190],'Os Dutos de Ar','Desvie das rajadas de Zaku na floresta do Exame.'),
  entry('kin','Kin Tsuchi','Trio do Som','Vila do Som',[86,25,4,7.1],'Sinos Ilusórios · +16 pontos de chance de Genjutsu e +10% duração de status.',{genjutsu:.16,duration:.1},
    [strike('Senbon com Sinos',taijutsu,neutral,projectile,'bells'),strike('Ilusão dos Sinos',genjutsu,shadow,area,'bells','Paralisar')],'Eco dos Sinos Ilusórios',['folha','Genin',2,180],'O Eco dos Sinos','Rastreie o som dos sinos de Kin na arena.'),
  entry('juzo','Jūzō Biwa','Akatsuki',mist,[111,28,7,6.8],'Espadachim Renegado · +14% taijutsu e +5 pontos de chance crítica.',{normal:.14,crit:.05},
    [strike('Kubikiribōchō: Corte de Jūzō',taijutsu,neutral,cone,'juzo-blade','Empurrar'),strike('Kubikiribōchō: Corte Ascendente',taijutsu,neutral,line,'juzo-blade','Atordoar')],'Investida de Jūzō',['nevoa','Jonin',5,565],'O Primeiro Parceiro de Itachi','Encontre Jūzō nos arredores da Névoa.',['itachi-akatsuki']),
  {...entry('orochimaru-akatsuki','Orochimaru','Akatsuki',leaf,[148,30,8,7.1],'Ambição da Serpente · +18% ninjutsu e +20% duração de status.',{element:.18,duration:.2},
    [strike('Mãos de Serpentes Ocultas',ninjutsu,neutral,line,'snake','Paralisar'),strike('Fūton: Grande Avanço',ninjutsu,wind,wave,'air-cannon','Empurrar')],'Mãos de Serpentes Ocultas Múltiplas',['nevoa','Kage',6,820],'O Manto da Serpente','Jogue com Orochimaru da Vila do Som e enfrente a versão de seu tempo na Akatsuki.'),
    family:'orochimaru',form:30,mission:{map:'nevoa',difficulty:'Kage',minute:6,kills:820,playWith:'orochimaru-som',title:'O Manto da Serpente',story:'Jogue com Orochimaru da Vila do Som e enfrente a versão de seu tempo na Akatsuki.'}},
  variant(choji,'choji-guerra','Quarta Guerra',15,'choji',[strike('Asas de Borboleta',taijutsu,neutral,wave,'wings','Empurrar'),expansion],'Bombardeio da Borboleta',['pedra','Jonin',5,600],'As Asas da Aliança','Jogue com Chōji Genin e alcance o campo de batalha.'),
  variant(kiba,'kiba-shippuden','Shippuden',15,'kiba',[strike('Presa sobre Presa Dupla de Duas Cabeças',taijutsu,neutral,wave,'fang','Empurrar'),strike('Presa Rotativa',taijutsu,neutral,cone,'fang','Atordoar')],'Lobo de Três Cabeças',['folha','Chunin',4,380],'Duas Cabeças, Uma Presa','Jogue com Kiba Genin e aperfeiçoe o ataque em dupla.'),
  variant(shino,'shino-shippuden','Shippuden',15,'shino',[strike('Nuvem de Kikaichū',ninjutsu,neutral,wave,'swarm','Lentidão'),strike('Prisão de Insetos',ninjutsu,neutral,area,'swarm','Paralisar')],'Cerco do Clã Aburame',['folha','Chunin',4,390],'Cerco Aburame','Jogue com Shino Genin e domine a formação do enxame.'),
  variant(ino,'ino-guerra','Quarta Guerra',15,'ino',[strike('Transmissão da Aliança',genjutsu,shadow,wave,'mind','Atordoar'),strike('Transferência de Mente em Dupla',genjutsu,shadow,line,'mind','Paralisar')],'Ligação da Aliança Shinobi',['pedra','Jonin',5,570],'A Voz da Aliança','Jogue com Ino Genin e estabeleça a rede sensorial.'),
  variant(obito,'tobi-akatsuki','Tobi · Akatsuki',15,'obito',[strike('Kamui: Passagem',ninjutsu,neutral,line,'spiral','Lentidão'),strike('Vórtice da Máscara Laranja',ninjutsu,neutral,area,'spiral','Paralisar')],'Kamui da Máscara Laranja',['nevoa','Jonin',5,555],'A Máscara Laranja','Jogue com Obito Genin e descubra o mascarado da Akatsuki.'),
  variant(obito,'obito-guerra','Máscara Branca',30,'tobi-akatsuki',[strike('Katon: Dança da Onda Explosiva',ninjutsu,fire,wave,'fire','Empurrar'),strike('Kamui: Correntes da Guerra',ninjutsu,neutral,line,'chains','Paralisar')],'Vórtice da Guerra',['pedra','Kage',7,940],'A Máscara Branca','Jogue com Tobi e atravesse o campo da Quarta Guerra.'),
  variant(hanabi,'hanabi-adulta','Adulta',15,'hanabi',[strike('Palma Veloz da Herdeira',taijutsu,neutral,line,'palms','Atordoar'),strike('Kaiten da Herdeira',taijutsu,neutral,orbit,'palms','Empurrar')],'Dança dos Trigramas',['folha','Jonin',4,490],'O Futuro dos Hyūga','Jogue com Hanabi Clássico para enfrentar a herdeira adulta.'),
];

export const EXPANSION_BY_ID = new Map(ROSTER_EXPANSION.map(hero => [hero.id, hero]));
const signatures = new Map<string, Signature>();
for (const hero of ROSTER_EXPANSION) {
  for (const technique of hero.kit) signatures.set(technique.name, technique);
  const finisher = hero.kit[1].setup ? hero.kit[0] : hero.kit[1];
  signatures.set(hero.ultimate, finisher);
}
export const expansionVisual = (name: string) => signatures.get(name)?.visual;
export const expansionSheet = (hero: string, form: number) => {
  const entry = ROSTER_EXPANSION.find(entry => entry.family === hero && entry.form === form);
  return entry || hero === 'akamaru' ? '/assets/shinobi-motion/' + (entry?.id ?? hero) + '-roster-v1.png' : undefined;
};
