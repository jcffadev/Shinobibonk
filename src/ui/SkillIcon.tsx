import { HEROES } from '../game/heroes';
// Ícones vetoriais próprios, mantidos no código e usados em HUD, biblioteca e cartas.
export function SkillIcon({heroId,index=0,name}:{heroId:string;index?:number;name:string}){
  const technique=HEROES.flatMap(h=>h.techniques).find(t=>t.name===name);
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
