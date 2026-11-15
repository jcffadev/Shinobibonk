export type Dojutsu = 'sharingan'|'itachi'|'obito'|'shisui'|'sasuke'|'sasuke-eternal'|'madara'|'rinnegan'|'rinnegan-sasuke'|'rinne-sharingan'|'byakugan';

/** A origem da técnica identifica o olho. Quando há dois usuários, vale a forma que a conjura. */
export function techniqueEye(name: string, heroId: string): Dojutsu|undefined {
  if(/Tsukuyomi Infinito/.test(name))return 'rinne-sharingan';
  if(/Byakugan|Punho Gentil|Trigramas|Kaiten|Palmas Protetoras|Palmas|Leões Gêmeos|Barreira Sensorial/.test(name))return 'byakugan';
  if(/Kotoamatsukami|Olho da Vontade Celestial/.test(name))return 'shisui';
  if(/Kamui|Vórtice da Máscara|Vórtice da Guerra/.test(name))return 'obito';
  if(/Genjutsu Sharingan/.test(name))return 'sharingan';
  if(/Tsukuyomi|Espada de Totsuka/.test(name))return 'itachi';
  if(/Chibaku Tensei|Shinra Tensei|Bansho Tenin|Tengai Shinsei|Rinnegan|Limbo|Invocação dos Caminhos|Receptores de Chakra|Barras de Chakra|Flecha de Indra/.test(name))
    return heroId==='sasuke-rinnegan'||/Flecha de Indra/.test(name)?'rinnegan-sasuke':'rinnegan';
  if(/Amaterasu|Susanoo/.test(name)){
    if(heroId==='sasuke-rinnegan')return 'sasuke-eternal';
    if(heroId.startsWith('sasuke'))return 'sasuke';
    if(heroId.startsWith('madara'))return 'madara';
    if(heroId==='shisui')return 'shisui';
    if(heroId.startsWith('kakashi')||heroId.startsWith('obito'))return 'obito';
    if(heroId.startsWith('itachi')||name==='Amaterasu')return 'itachi';
  }
}
