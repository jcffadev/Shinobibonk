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
  const overtime=Math.max(0,overtimeSeconds);
  const endurance=(1+.32*minutes)*(1+.70*Math.sqrt(overtime/60))*2**(overtime/360);
  return Math.round(260*threatHp*guardianHpMultiplier(zoneSeconds)*endurance*(1+.35*(zone-1)));
}

/** +30 de armadura por minuto da missão e +90 por minuto do Final Swarm.
 * Armadura crescente nunca dá imunidade. Cada plano soma 33% ao total, como na ameaça da zona. */
export function guardianDefense(runSeconds:number,boss=false,overtimeSeconds=0,zone=1,plans=0) {
  const armor=(185+Math.max(0,runSeconds)/60*30+Math.max(0,overtimeSeconds)/60*90+28*Math.max(0,zone-1))
    *(boss?1.35:1)*(1+.33*plans);
  return armor/(100+armor);
}

export function guardianAttackMultiplier(runSeconds:number,overtimeSeconds:number,zone:number,boss=false) {
  return (1.2+.06*Math.max(0,runSeconds)/60+.13*Math.max(0,overtimeSeconds)/60+.14*Math.max(0,zone-1))*(boss?1.25:1);
}
