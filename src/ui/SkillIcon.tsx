import { BATTLE_EFFECT_ATLAS, SUMMON_EFFECT_ATLAS, battleEffectCell, hasNamedBattleEffect, summonEffectCell } from '../game/techniqueVisualProfiles';
import { expansionVisual } from '../game/rosterExpansion';
import { puppetArt } from '../scene/kuroari';
import { HEROES, HERO_BY_ID, familyOf, ultimateBase } from '../game/heroes';
const techniques = new Map(HEROES.flatMap(h=>h.techniques).map(t=>[t.name,t]));
const sageFaces:Record<string,number>={naruto:0,hashirama:1,jiraiya:2,minato:3,kabuto:4,orochimaru:5};
const namedIcons: Record<string,number> = {
  'Shuriken':0,'Kunai Tática':1,'Kunai Hiraishin':1,'Kunai Explosiva':1,
  'Rasengan':2,'Kage Bunshin':3,'Rasenshuriken Supremo':4,'Rasenshuriken':4,'Espada Chidori':10,'Púrpura Elétrica':10,'Flecha de Indra':10,'Cento e Vinte e Oito Palmas':16,'Lótus Oculta':17,'Sepultamento':12,'Grande Sepultamento Imperial':12,
  'Técnica de Substituição':6,'Bomba de Fumaça':7,'Dragão de Água':9,
  'Chidori':10,'Raikiri':10,'Kirin':10,'Palma de Ar':16,'Kaiten':16,'Sessenta e Quatro Palmas':16,
  'Punho da Folha':17,'Punho Gentil':16,'Chute Ascendente':17,'Furacão da Folha':18,
  'Lótus Primária':17,'Tigre do Meio-Dia':17,'Punhos dos Leões Gêmeos':16,
  'Agulhas de Água':19,'Byakugou':21,'Força dos Cem':21,'Modo Sábio':22,
  'Shinra Tensei':23,'Chibaku Tensei':14,'Correntes de Selamento':24,
  'Prisão de Correntes da Kurama':24,'Caixão de Areia':12,'Funeral do Deserto':12,
  'Mil Mãos de Madeira':13,'Meteorito':14,'Tengai Shinsei':14,'Bijūdama Rasenshuriken':4,'Kamui':15,'Oito Portões':17,
};
const expansionIcons:Record<string,number>={impact:17,wheel:18,fang:18,mark:16,swarm:7,mind:15,staff:13,elements:14,lightning:10,blade:1,cube:14,scan:22,gold:12,poison:7,lava:8,steam:9,water:5,fire:8,spiral:2,ink:7,roots:13,palms:16,shark:9,chains:24,paths:23,iron:12,ice:19,wings:11};
const elementIcon = {Fogo:8,Água:5,Vento:11,Raio:10,Madeira:13,Areia:12,Terra:14,Sombra:15,Sábio:22,Neutro:18};
// Arte do atlas por técnica ou família. O ícone vetorial cobre técnicas sem célula dedicada.
export function SkillIcon({heroId:versionId,index=0,name}:{heroId:string;index?:number;name:string}){
  // Versões (naruto-shippuden…) usam a arte da família.
  const heroId=familyOf(versionId);
  const merged=name.startsWith('Fusão · ')?name.slice(8).split(' / '):name.split(' + ');
  if(merged.length===2)return <span className="skill-art merged-skill-art" role="img" aria-label={name}><SkillIcon heroId={heroId} name={merged[0]}/><SkillIcon heroId={heroId} name={merged[1]}/></span>;
  const sage=sageFaces[heroId];
  if(sage!==undefined&&(name==='Modo Sábio'||name==='Mil Mãos de Madeira'&&heroId==='hashirama'||name.includes('Senjutsu')&&heroId==='orochimaru'))return <span className="skill-art sage-skill-art" role="img" aria-label={name} style={{backgroundPosition:(sage%3)*50+'% '+Math.floor(sage/3)*100+'%'}}/>;
  if(name.includes('Gamabunta')||heroId==='naruto'&&name==='Invocação do Sapo')return <span className="skill-art gamabunta-skill-art" role="img" aria-label={name}/>;
  const puppet=puppetArt(name);
  if(puppet)return <span className="skill-art" role="img" aria-label={name} style={{backgroundImage:'url('+puppet+')',backgroundSize:'400% 100%',backgroundPosition:'66.6667% 50%',backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>;
  const hero=HERO_BY_ID[versionId];
  const technique=techniques.get(name)??(hero?.ultimate===name?{...ultimateBase(hero),name}:undefined);
  if(name.startsWith('Espaço ')) return <span className="skill-art empty-skill-art" aria-label={name}>+</span>;
  const signature=expansionVisual(name);
  const summon=summonEffectCell(name);
  if(summon!==undefined)return <span className="skill-art" role="img" aria-label={name} style={{backgroundImage:'url('+SUMMON_EFFECT_ATLAS+')',backgroundSize:'400% 200%',backgroundPosition:(summon%4)*100/3+'% '+Math.floor(summon/4)*100+'%',backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>;
  if(technique&&hasNamedBattleEffect(name)&&namedIcons[name]===undefined){const i=battleEffectCell(technique);return <span className="skill-art" role="img" aria-label={name} style={{backgroundImage:`url(${BATTLE_EFFECT_ATLAS})`,backgroundSize:'400% 600%',backgroundPosition:`${(i%4)*100/3}% ${Math.floor(i/4)*20}%`,backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>;}
  const cell=(signature?expansionIcons[signature]:undefined)??namedIcons[name]??(name.includes('Sapo')||name.includes('Gamabunta')?undefined:technique?elementIcon[technique.element]
    :/Katon/.test(name)?8:/Suiton/.test(name)?5:/Raiton/.test(name)?10:/Doton/.test(name)?14:/Fuuton/.test(name)?11:undefined);
  if(cell!==undefined)return <span className="skill-art atlas-skill-art" role="img" aria-label={name} style={{backgroundPosition:`${cell%5*25}% ${Math.floor(cell/5)*25}%`}}/>;
  const color=technique?.color??(heroId==='gaara'?'#e4be77':heroId==='hashirama'?'#8bdd83':heroId==='madara'?'#ff845b':'#64d8ff');
  const glyph=name.includes('Rasengan')?'spiral':name.includes('Sapo')?'toad':name.includes('Bunshin')?'clone':technique?({Madeira:'roots',Areia:technique.shape==='Área'?'coffin':'spikes',Fogo:'fire',Sombra:'armor',Sábio:'forest',Água:'wave',Vento:'wave',Raio:'spikes',Terra:'meteor',Neutro:technique.shape==='Corpo a corpo'?'wood':'star'}[technique.element]):heroId==='hashirama'?['wood','spikes','roots','forest','forest'][Math.min(index,4)]:heroId==='gaara'?['spikes','coffin','wave','spikes','wave'][Math.min(index,4)]:heroId==='madara'?['star','fire','armor','fire','meteor'][Math.min(index,4)]:['star','spiral','clone','wave','spiral'][Math.min(index,4)];
  return <svg className="skill-art" viewBox="0 0 48 48" role="img" aria-label={name}><rect x="2" y="2" width="44" height="44" rx="10" fill="#172038" stroke={color} strokeWidth="2"/><g fill={color} stroke="#f2f5e7" strokeWidth="1" strokeLinejoin="round">
    {glyph==='toad'&&<><path d="M8 40Q8 26 24 25Q40 26 40 40Z" fill="#d9773f"/><circle cx="16" cy="19" r="6" fill="#d9773f"/><circle cx="32" cy="19" r="6" fill="#d9773f"/><circle cx="16" cy="19" r="2.4" fill="#1b1b1b"/><circle cx="32" cy="19" r="2.4" fill="#1b1b1b"/><path d="M15 33Q24 38 33 33" fill="none" stroke="#5a2a14" strokeWidth="2"/><path d="M6 44H42" stroke={color} strokeWidth="3"/></>}
    {glyph==='star'&&<path d="M24 7 28 18 41 15 31 25 40 38 26 31 16 42 17 28 6 22 19 20Z"/>}
    {glyph==='spiral'&&<><circle cx="24" cy="24" r="15" opacity=".35"/><path d="M14 28C7 8 39 6 38 25S12 42 14 23 34 15 31 26 20 30 22 22" fill="none" stroke={color} strokeWidth="4"/><circle cx="24" cy="23" r="3" fill="white"/></>}
    {glyph==='clone'&&<><path d="M9 22H19V38H8ZM29 22H39V38H28" opacity=".45"/><circle cx="13" cy="16" r="5"/><circle cx="35" cy="16" r="5"/><path d="M18 23H30V40H17Z" fill="#ffb353"/><circle cx="24" cy="16" r="6" fill="#ffe1a2"/><path d="M17 12H31V15H17Z" fill="#335f97"/></>}
    {glyph==='wave'&&<path d="M7 32Q23 4 40 20Q19 16 30 30L42 32Q24 47 7 32Z"/>}
    {glyph==='spikes'&&<path d="M7 38 14 15 21 38 26 7 32 38 39 20 43 38Z"/>}
    {glyph==='coffin'&&<><path d="M17 8H31L37 18 32 41H16L11 18Z"/><path d="M15 20H33M16 27H32M17 34H31" stroke="#8e542e" strokeWidth="3"/></>}
    {glyph==='wood'&&<><path d="M10 33 28 10 39 17 21 40Z" fill="#a97c4e"/><path d="M17 34 32 16M23 34 35 20" stroke={color} strokeWidth="3"/><path d="M16 18Q13 4 25 10Q28 21 16 18Z"/></>}
    {glyph==='roots'&&<path d="M21 8H28V20L39 28 43 41 31 31 25 26 21 37 9 42 16 32 18 25 6 21 8 15 21 21Z"/>}
    {glyph==='forest'&&<><path d="M23 9H27V41H23Z" fill="#a37852"/><path d="M24 6 39 23H31L43 34H7L17 23H10Z"/><path d="M15 35 12 42M34 35 37 42" stroke={color} strokeWidth="3"/></>}
    {glyph==='fire'&&<><path d="M24 6Q34 16 30 23L37 15Q47 38 26 42 5 41 11 25L20 14 19 27Q31 23 24 6Z"/><path d="M25 25Q37 38 25 39 15 37 25 25Z" fill="#ffda79"/></>}
    {glyph==='armor'&&<path d="M11 12 20 17 24 8 28 17 38 12 35 28 40 40H8L14 28ZM18 22V27H22V22ZM27 22V27H31V22Z" fill="#b391f7" fillRule="evenodd"/>}
    {glyph==='meteor'&&<><path d="M15 29 32 7 30 21 43 12 33 35Z" fill="#ffc34e"/><circle cx="18" cy="32" r="11" fill="#ae6d57"/><path d="M11 30 19 24 23 32 18 38Z" fill="#eab589"/></>}
  </g></svg>;
}
