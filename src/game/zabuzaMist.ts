/**
 * Névoa do Zabuza (Rodada 96 — pedidos do usuário):
 * - "A névoa de zabuza tem que ser branca, mas ofuscar tudo, parecendo gelo/névoa mesmo igual no anime".
 * - "Agora vai aparecer todos os personagem a 3m do jogador. Não é possível colocar target/focar enquanto Zabuza estiver vivo
 *   e/ou ao focar e eles entrarem no range da Névoa… perde o target".
 * Lógica pura: o GameCanvas aplica a visibilidade nos sprites e bloqueia/solta o alvo fixado.
 * A mecânica de desaparecer vale SÓ para a névoa do Zabuza (os outros eventos de clima não escondem inimigos).
 */
export const ZABUZA_MIST = { reveal: 3, fade: .6 } as const;

/** Opacidade de um personagem a `distance` m do jogador dentro da névoa: visível até `reveal`, some em `fade` m depois. */
export function mistVisibility(distance: number) {
  if (!(distance >= 0)) return 1;
  const t = (distance - ZABUZA_MIST.reveal) / ZABUZA_MIST.fade;
  return t <= 0 ? 1 : t >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
}

/** Com a névoa ativa e o Zabuza vivo não dá para fixar alvo, e um alvo já fixado é solto. */
export const canLockTarget = (zabuzaMistActive: boolean) => !zabuzaMistActive;
