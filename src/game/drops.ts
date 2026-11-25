/**
 * Ímã de drops (Rodada 55 — pedido do usuário: "O magnetismo do morro de bolinho não está puxando os itens do mapa
 * todo"). Drop puxado pelo ímã global do morro chega ao jogador em no máximo GLOBAL_PULL_SECONDS, de qualquer distância;
 * o ímã normal (raio de coleta) só acelera. Lógica pura, testada em tests/.
 */
export const GLOBAL_PULL_SECONDS=1.2;
export function magnetSpeed(currentSpeed:number,distance:number,globalPull:boolean){
  return globalPull?Math.max(currentSpeed,distance/GLOBAL_PULL_SECONDS):currentSpeed;
}

/** A coleta continua ativa quando só o cronômetro da missão está congelado. */
export function dropCanMagnetize(age:number,settle:number,distance:number,radius:number,globalPull:boolean) {
  return age>=settle && (distance<radius || globalPull);
}

type DropPile = { distance:number; magnet:boolean };

/** Consolida perto do abate. Se só houver pilhas distantes, traz a mais antiga para o abate novo. */
export function dropPileAtLimit(piles:readonly DropPile[],limit:number,mergeRadius:number) {
  if(piles.length<limit) return null;
  let nearby=-1, oldest=-1, nearest=mergeRadius;
  for(const [index,pile] of piles.entries()){
    if(pile.magnet)continue;
    if(oldest<0)oldest=index;
    if(pile.distance<=nearest){nearby=index;nearest=pile.distance;}
  }
  if(nearby>=0)return {index:nearby,relocate:false};
  // Todos já estão a caminho do jogador: uma pilha em trânsito pode levar o novo valor.
  return oldest<0?{index:0,relocate:false}:{index:oldest,relocate:true};
}

/** Aplica o ganho de XP a cada orbe, inclusive aos orbes em coleta na troca de zona. */
export function collectedXp(value: number, playerMultiplier: number, tuningMultiplier: number) {
  return Math.round(value * playerMultiplier * tuningMultiplier);
}

/** O portal conclui a coleta dos orbes já atraídos ou no alcance de coleta. */
export function xpCollectedAtPortal(type: string, magnet: boolean, distance: number, pickupRadius: number) {
  return type === 'xp' && (magnet || distance < pickupRadius);
}
