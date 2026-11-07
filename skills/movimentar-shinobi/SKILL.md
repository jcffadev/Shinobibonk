---
name: movimentar-shinobi
description: Implementa e valida caminhada, corrida, diagonais, pulo, deslize e dash dos shinobis em React e Three.js.
---

# Movimentação dos shinobis

Leia `AGENTS.md`, `src/scene/GameCanvas.tsx`, `src/scene/playerMotion.ts` e `src/game/settings.ts`. Preserve a câmera isométrica, a rotação ao mover o mouse, o zoom e os atalhos remapeáveis. Use a skill `criar-arte-shinobibonk` para criar poses e atlas.

## Simulação

- Calcule a direção horizontal na base direita/frente da câmera usando o yaw. Normalize diagonais e suavize a mudança de rumo pelo menor ângulo. Mantenha o vetor de movimento unitário ao virar, inclusive ao inverter o sentido, para preservar a velocidade ao adicionar ou soltar uma tecla. Pare ao soltar a última tecla.
- Use altura do terreno para o apoio. Guarde a altura do pulo e o estado do dash separadamente. Faça a câmera seguir um alvo em X/Z com altura baseada no terreno, independente da altura, escala e rotação do sprite.
- Espaço pula. A curva atual dura 0,54 s e chega a 1,3 m. Shift captura a direção das teclas ao ser pressionado (ou o último rumo, se nenhuma estiver pressionada) e desliza nessa direção por 0,24 s a até 2,6× a velocidade, com 0,9 s de recarga e 0,14 s de invulnerabilidade. São parâmetros do protótipo. Conserve controles remapeáveis e use o delta de simulação para os tempos.
- Pause a simulação em overlays, perda de foco ou fim da run. Limpe teclas ao perder foco. Considere a transição de zona antes de carregar estados de movimento.
- Separe preparação do golpe, pose de soltura e efeito. O arremesso do Naruto Academia usa 0,12 s até o lançamento. Preserve tempo de recarga, trajetória, alvos, colisão e dano quando mudar a pose.

## Sprites

- Use Naruto Academia como padrão de caminhada, dash, pulo e recuperação para quase todo o elenco. Preserve o sprite e a roupa de cada versão jogável. Lee e Guy usam poses próprias de soco e chute. Gaara usa gestos próprios de areia, com palma aberta no Caixão e na Ultimate.
- Use o selo cruzado do Naruto em conjuração onde a técnica pede selo. A folha tem quatro colunas: preparação e selo vistos de frente, preparação e selo vistos de costas. Arremessos reais e Taijutsu usam a pose do golpe. Gaara tem pose de palma aberta para o Caixão de Areia e a Ultimate.
- Use a forma atual do personagem. A caminhada do Naruto Academia usa quatro quadros por fileira, com frente em cima e costas embaixo. Espelhe em X para a esquerda. Use uma folha diagonal com a mesma ordem e o mesmo ponto de apoio.
- Cadastre a folha por ID do shinobi e nível da forma em `src/game/directionalArt.ts`. Os recortes de caminhada são 4×2. Em folhas 4×3, a terceira linha pode ter os quadros de conjuração. A pose parada continua vindo do sprite estático que orientou a arte.
- A entrega de um novo jogável ou evolução inclui quadros próprios de caminhada, ataque, pulo e dash/esquiva. Teste cada ação depois de trocar de forma. Use `actionArt` quando os quadros de ação estiverem em folha separada.
- Nas folhas de ação 4×4 (`kind: 'full'`), use as duas primeiras fileiras para preparação, selo, soltura e recuperação, de frente e de costas. Nas duas últimas, use decolagem, ápice, dash e frenagem, de frente e de costas. Centralize as células e ancore os pés na mesma altura. A simulação aplica a altura do salto.
- Mantenha a fase do ciclo ao trocar direção. Ancore os pés em todos os quadros. Deixe o deslocamento vertical a cargo do pulo e do terreno. Mova braços e pernas dentro do quadro, sem balançar câmera ou corpo para simular passos.
- Troque UVs de texturas exclusivas do jogador. Mantenha em cache os materiais do elenco e descarte recursos da animação ao sair. Em formas sem atlas, anime o sprite existente com `playerPose.ts`.
- Nas folhas de caminhada, reserve quatro colunas para os quadros e uma dupla de fileiras (frente e costas) por forma. Registre o número total de fileiras e o início da dupla em `directionalArt.ts`. Confira a troca de atlas e de retrato ao cruzar os níveis de evolução.
- A barra de HP deve acompanhar a posição abaixo dos pés, sem depender de qual quadro está em uso.

## Validação

- Valide o espelho da pose no dash para a esquerda em todas as famílias. O sprite segue o vetor do dash projetado na base da câmera, inclusive quando o jogador solta A durante a ação.
- Teste W, A, S, D, WA, WD, SA e SD. Compare distâncias de direções e diagonais pelo mesmo tempo e verifique troca de fileira, espelho e continuidade da passada. Confira o comportamento com yaw girado.
- Pule parado e em movimento, teste dash com movimento e sem tecla direcional, e troque o foco durante cada ação. Confira retorno ao solo, recarga, ausência de entrada presa e estabilidade da câmera.
- Confira arremesso, técnicas sem arma e evolução de forma. Execute os testes da base, inspecione um quadro real em jogo e atualize a documentação com a skill `documentar-projeto`.

## Ajudantes, inimigos e prévias

- Ligue o controlador de movimento também ao suporte selado, aos clones e à prévia de técnicas. Um sprite que muda de posição deve alternar quadros de caminhada/corrida. Teste a mudança de forma e a execução da técnica.
- As ações com arte própria têm prioridade. Para as formas antigas ainda sem folha, registre o fallback e mantenha a revisão na fila. Em lote, selecione quadros e espelhamento por UV para manter o instanciamento da horda.
- Valide Tab em movimento, pulo parado e andando, dash em diagonal, perda de foco, F9 e retorno de uma escolha com o ponteiro capturado.
