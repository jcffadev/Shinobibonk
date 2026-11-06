---
name: movimentar-shinobi
description: Implementa e valida caminhada, corrida, diagonais, pulo, deslize e dash dos shinobis em React e Three.js.
---

# Movimentação dos shinobis

Leia `AGENTS.md`, `src/scene/GameCanvas.tsx`, `src/scene/playerMotion.ts` e `src/game/settings.ts`. Preserve a câmera isométrica, a rotação pelo mouse, o zoom e os atalhos remapeáveis. Use a skill `criar-arte-shinobibonk` para criar poses e atlas.

## Simulação

- Calcule a direção horizontal na base direita/frente da câmera usando o yaw. Normalize diagonais antes de aplicar a velocidade. Suavize mudanças enquanto há entrada e pare ao soltar a última tecla.
- Use altura do terreno para o apoio. Guarde a altura do pulo e o estado do dash separadamente. Faça a câmera seguir um alvo em X/Z com altura baseada no terreno, independente da altura, escala e rotação do sprite.
- Espaço pula. A curva atual dura 0,54 s e chega a 1,3 m. Shift desliza na direção recente por 0,24 s a até 2,6× a velocidade, com 0,9 s de recarga e 0,14 s de invulnerabilidade. São parâmetros do protótipo. Conserve controles remapeáveis e use o delta de simulação para os tempos.
- Pause a simulação em overlays, perda de foco ou fim da run. Limpe teclas ao perder foco. Considere a transição de zona antes de carregar estados de movimento.
- Separe preparação do golpe, pose de soltura e efeito. O arremesso do Naruto Academia usa 0,12 s até o lançamento. Preserve tempo de recarga, trajetória, alvos, colisão e dano quando mudar a pose.

## Sprites

- Use a forma atual do personagem. A caminhada do Naruto Academia usa quatro quadros por fileira, com frente em cima e costas embaixo. Espelhe em X para a esquerda. Use uma folha diagonal com a mesma ordem e o mesmo ponto de apoio.
- Mantenha a fase do ciclo ao trocar direção. Ancore os pés em todos os quadros. Deixe o deslocamento vertical a cargo do pulo e do terreno. Mova braços e pernas dentro do quadro, sem balançar câmera ou corpo para simular passos.
- Troque UVs de texturas exclusivas do jogador. Mantenha em cache os materiais do elenco e descarte recursos da animação ao sair. Em formas sem atlas, preserve o sprite estático.
- A barra de HP deve acompanhar a posição abaixo dos pés, sem depender de qual quadro está em uso.

## Validação

- Teste W, A, S, D, WA, WD, SA e SD. Compare distâncias de direções e diagonais pelo mesmo tempo e verifique troca de fileira, espelho e continuidade da passada. Confira o comportamento com yaw girado.
- Pule parado e em movimento, teste dash com movimento e sem tecla direcional, e troque o foco durante cada ação. Confira retorno ao solo, recarga, ausência de entrada presa e estabilidade da câmera.
- Confira arremesso, técnicas sem arma e evolução de forma. Execute os testes da base, inspecione um quadro real em jogo e atualize a documentação com a skill `documentar-projeto`.
