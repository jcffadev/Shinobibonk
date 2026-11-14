/**
 * Ímã de drops (Rodada 55 — pedido do usuário: "O magnetismo do morro de bolinho não está puxando os itens do mapa
 * todo"). Drop puxado pelo ímã global do morro chega ao jogador em no máximo GLOBAL_PULL_SECONDS, de qualquer distância;
 * o ímã normal (raio de coleta) só acelera. Lógica pura, testada em tests/.
 */
export const GLOBAL_PULL_SECONDS=1.2;
export function magnetSpeed(currentSpeed:number,distance:number,globalPull:boolean){
  return globalPull?Math.max(currentSpeed,distance/GLOBAL_PULL_SECONDS):currentSpeed;
}
