/**
 * Carga da próxima técnica do chefe para a barra do HUD (27/11/2026 — usuário: "Na barrinha de HP em cima mostrar quando está em RAGE, também mostrando o carregamento da skill dos bosses pro jogador saber exatamente o momento que ele vai lançar.").
 * Esperando: 0 → 1 enquanto a recarga corre. Conjurando: 0 → 1 até o golpe sair (o aviso vermelho no chão), com o nome da técnica.
 */
export function bossCharge(state: { cooldown: number; cooldownTotal?: number } & { cast?: { windup: number; total: number; technique: { name: string } } } | undefined) {
  if (!state) return { charge: 0, casting: false, skill: '' };
  if (state.cast) return { charge: Math.max(0, Math.min(1, 1 - Math.max(0, state.cast.windup) / Math.max(.01, state.cast.total))), casting: true, skill: state.cast.technique.name };
  const total = Math.max(.01, state.cooldownTotal ?? state.cooldown);
  return { charge: Math.max(0, Math.min(1, 1 - Math.max(0, state.cooldown) / total)), casting: false, skill: '' };
}
