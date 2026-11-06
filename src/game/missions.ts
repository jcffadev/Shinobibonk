export const ZONES=[
 {name:'Arredores da Folha',start:0,guardianAt:160,guardians:['lee','neji','temari'],description:'Bosque de treino · hordas, armas e altares. Guarde Ryu para abrir as kunais.'},
 {name:'Trilha dos renegados',start:200,guardianAt:360,guardians:['kankuro','kakashi','orochimaru'],description:'A ameaça cresce · elites e novos encontros de apoio. Eventos ficam disponíveis novamente.'},
 {name:'Cerco dos Kage',start:400,guardianAt:560,guardians:['gaara','hashirama','madara','pain'],description:'Pressão máxima · enfrente o guardião e sobreviva até o fim dos dez minutos.'},
];

// Guardião (chefe final da zona): pode ser invocado a qualquer momento no Selo do guardião (E).
// Quanto mais tarde for invocado, mais HP ele tem.
export const GUARDIAN_RULES={minHpMultiplier:.6,fullHpAt:160,shikamaruMaxPlans:3};
/** Multiplicador de HP do guardião conforme os segundos decorridos na zona: 0,6× no início, 1,0× em 160 s, linear e sem teto. */
export function guardianHpMultiplier(zoneElapsed:number){const t=Math.max(0,zoneElapsed);return GUARDIAN_RULES.minHpMultiplier+(1-GUARDIAN_RULES.minHpMultiplier)*t/GUARDIAN_RULES.fullHpAt;}

export function guardianVitality(threatHp:number,runSeconds:number,zoneSeconds:number,overtimeSeconds:number,zone:number) {
  const minutes=Math.max(0,runSeconds)/60;
  const endurance=(1+.32*minutes)*2**(Math.max(0,overtimeSeconds)/405);
  return Math.round(260*threatHp*guardianHpMultiplier(zoneSeconds)*endurance*(1+.35*(zone-1)));
}

export function guardianDefense(runSeconds:number,boss=false) {
  return .65+.25*(1-Math.exp(-Math.max(0,runSeconds)/720))+(boss?.04:0);
}
