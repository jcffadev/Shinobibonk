---
name: movimentar-shinobi
description: Implementa e valida caminhada, corrida, diagonais, pulo, deslize e dash dos shinobis em React e Three.js.
---

# Movimentação dos shinobis

Leia `AGENTS.md`, `src/scene/GameCanvas.tsx`, `src/scene/playerMotion.ts` e `src/game/settings.ts`. Preserve a câmera isométrica, a rotação ao mover o mouse, o zoom e os atalhos remapeáveis. Use a skill `criar-arte-shinobibonk` para criar poses e atlas.

## Simulação

- Calcule a direção horizontal na base direita/frente da câmera usando o yaw. Normalize diagonais e aplique a direção imediatamente, sem interpolar o deslocamento. Quando duas teclas opostas estiverem pressionadas, use a última naquele eixo; soltá-la retoma a outra ainda pressionada. Mantenha o vetor de movimento unitário ao virar, inclusive ao inverter o sentido, para preservar a velocidade ao adicionar ou soltar uma tecla. Pare ao soltar a última tecla.
- Use altura do terreno para o apoio. Guarde a altura do pulo e o estado do dash separadamente. Faça a câmera seguir um alvo em X/Z com altura baseada no terreno, independente da altura, escala e rotação do sprite.
- Espaço pula. A curva atual dura 0,54 s e chega a 1,3 m. Shift captura a direção das teclas ao ser pressionado (ou o último rumo, se nenhuma estiver pressionada) e desliza nessa direção por 0,24 s a até 2,6× a velocidade, com 0,9 s de recarga e 0,14 s de invulnerabilidade. São parâmetros do protótipo. Conserve controles remapeáveis e use o delta de simulação para os tempos.
- Pause a simulação em overlays de decisão/ficha, perda de foco ou fim da run. Tab é mapa rápido e mantém movimento e simulação ativos. Reserve Tab mesmo em configurações antigas. Ao fechar a ficha por P ou pelo botão, solicite a captura do ponteiro no mesmo evento do usuário. Limpe teclas ao perder foco. Considere a transição de zona antes de carregar estados de movimento.
- Separe preparação do golpe, pose de soltura e efeito. O arremesso do Naruto Academia usa 0,12 s até o lançamento. Preserve tempo de recarga, trajetória, alvos, colisão e dano quando mudar a pose.
- **Andar atacando (pedido do usuário, 11–12/11/2026):** o ataque nunca para nem desacelera o deslocamento (a simulação não depende da pose). Parado ou andando, o golpe toca **inteiro** pelos quadros de ataque da folha (preparação → selo/soltura → recuperação); nunca troque esses quadros pelos de caminhada no meio do golpe. Andando, a passada continua nas pernas do próprio quadro de ataque (`playerPose`, mesma fase de `stepTime` da caminhada), e ao fim do golpe a caminhada retoma na fase em que estaria, sem pulo de quadro. Exceções: Ultimate (pose especial, pernas paradas), chute de Lee/Guy (a perna é o golpe) e Gaara (flutua).
- **Fluidez da troca de folha (rodada 45 — pedido do usuário, 12/11/2026: “a mudança de sheet's/imagem entre animada e não animada deve ser sincrono, tem que ser totalmente fluído… revise os personagens mudando de tamanho perdendo proporção ao atacar”):** em `playerMotion.ts`, as transições entre repouso/andar/andar-atacando **suavizam** em vez de “pular”: (a) o fator de proporção (`propFactor`, bbox alfa da rodada 39, clamp 0,85–1,35) é aplicado via **lerp exponencial** `propCur` (≈0,15 s) — o personagem **não salta de tamanho/altura** a cada troca (a âncora nos pés e as exceções Choji/Gaara/Pain seguem valendo); (b) a passada `strideShown` **sobe/desce** (lerp exponencial ≈0,1 s) no início/fim do golpe em vez de ligar/desligar de uma vez; (c) `stepTime` é **contínuo** (não zera a cada parada) — a caminhada continua de onde parou. **Estado estacionário inalterado** — só as transições suavizam; a troca de textura em si segue binária (limitação de 1 sprite por estado). Se a mudança de tamanho no golpe ainda for perceptível, o próximo passo é reduzir a diferença de bbox entre as folhas de ação e o repouso na arte.
- **Passada procedural NUNCA sobrepõe folha desenhada (rodada 47 — pedido do usuário, 12/11/2026: “animação distorcida ainda… atacar + andar”):** em `playerMotion.ts`, `const strideTarget = proceduralMotion ? stride : 0;` — a deformação procedural de pernas/braços **só existe quando não há folha desenhada** (formas sem atlas, `playerPose` puro); com folha de ataque/ação, o quadro fica **100% íntegro** (zero distorção) e o andar-livre vem do **deslocamento da simulação** (regra permanente da rodada 33: o ataque nunca para o movimento). A suavização da passada (lerp ≈0,1 s da rodada 45) segue valendo na entrada/saída do modo procedural. Exceções (Choji cresce · Gaara flutua · Pain levita) intocadas.
- **Buff “Treinada” +15% do Treinamento com Jiraiya (região da rodada 39, visível na rodada 47):** técnicas do **jogador** (não dos aliados) com o nome em `config.trained` recebem **×1,15 de dano** em `hit()` (`GameCanvas.tsx`); o planner exibe o botão **Treinar para todas as técnicas** e treinar uma técnica ainda não planejada **auto-planeja** (`BuildPlanner.tsx`); a ficha da run mostra o **badge “★ Treinada · +15% de dano”** (prop `trained` em `RunSheet.tsx` + `.trained-badge`).
- **Encadeamento com velocidade de ataque alta:** um pedido de ataque que chega antes de 75% do golpe em andamento (`CHAIN_AT` em `playerMotion.ts`) fica na fila (o mais recente vence) e começa assim que o golpe passa de 75%. Assim o golpe nunca reinicia na preparação nem pisca. A Ultimate entra na hora. Vale igual para jogador, ajudantes, clones e mega elites (mesmo controlador). `motion.debug()` expõe estado, quadro, progresso e passada para testes; `scripts/verify-motion-atlases.mjs` verifica as 56 versões andando e atacando.

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
- **Follow dos aliados (rodada 46) — regra permanente:** o acompanhamento dos Ninjas Selados (e da Kuri) é **amortecido**: `posicao.lerp(slot, 1 − e^(−dt·R))` com **R = 8** (R = 16 no dash do jogador) — **nunca** stop-and-go binário (`gap > 0,25` + velocidade cheia parava seco e saía “correndo”, alternando idle↔andar a ~10 Hz: a “caminhada bugada”). Band de assentamento `gap > 0,18`; snap de segurança `gap > 12` (recrutamento) preservado.
- **Orientação dos aliados (rodada 46):** use o **mesmo dead zone do jogador** (`backwardView = dir.dot(v1) > 0,18` · `leftward = dir.dot(v2) < −0,18`) — sem dead zone, a fileira da folha (frente↔costas) flippa a cada frame ao andar de lado para a tela.
- Aliados e Kuri **compartilham** o controlador `playerMotion` (suavizações de escala/passa da rodada 45 valem para eles também); o ataque deles vem de `castTechnique(…, motion)` — não toque na cadência (`allyTimer`/`allyInterval`) ao mexer no follow.
- As ações com arte própria têm prioridade. Para as formas antigas ainda sem folha, registre o fallback e mantenha a revisão na fila. Em lote, selecione quadros e espelhamento por UV para manter o instanciamento da horda.
- Valide Tab em movimento, pulo parado e andando, dash em diagonal, perda de foco, F9 e retorno de uma escolha com o ponteiro capturado.

## Folhas separadas por ação · atualização 07/11/2026

Use `acrobaticsArt` quando a versão já tiver ataque aprovado e precisar somente de pulo/dash. Folha 4×2: frente/costas; colunas impulso, joelhos recolhidos, dash baixo, frenagem. Folha completa 4×4: duas linhas de ataque frente/costas e duas linhas de pulo/dash. Normalize com `scripts/pack-sprite-atlas.ps1`, preservando uma escala por folha e alinhamento dos pés. Mirar à esquerda deve espelhar a orientação. Arte integrada não equivale a revisão visual concluída; registre a cobertura real por versão e confira também como ajudante.

## Rodada 55 · 13/11/2026 — caminhada de TODOS os atores conforme o WASD

- **Regra única de fileira:** frente/costas e espelho vêm do deslocamento na base da câmera (`v1` = para longe da câmera, `v2` = direita da tela), então valem com a câmera girada em qualquer ângulo. Para longe da câmera = **costas**, inclusive na **diagonal** (W+A, W+D, e o mesmo para ajudantes/inimigos que sobem na tela). Nunca force a fileira de frente na diagonal (era o bug de `playerMotion.ts`: `!(walk && diagonal)`; e no lote dos inimigos: `!diagonal`).
- **Jogador:** teclas discretas (`moveVertical > 0` = costas, `moveHorizontal < 0` = espelho), última tecla oposta vence, como já alinhado.
- **Atores que andam sozinhos** (ajudantes, Kuri, clones, Mega Elites/guardiões/Shinobi para selar, inimigos comuns e elites): use `stableFacing(holder, vertical, horizontal)` de `playerMotion.ts` com a memória no próprio sprite (`sprite.userData`). Histerese: costas liga > 0,26 e desliga < 0,10; espelho liga < −0,10 e desliga > +0,10; no meio mantém o último lado. Nada de `> 0`/`< 0` sem dead zone. Ajudante parado (dentro do slot) mantém a última orientação.
- **Inimigos em lote (`enemyRenderer.ts`):** andando para longe da câmera usam `shinobi-enemy-walk-back-v1.png` (3 quadros), vindo usam a folha de frente (quadros 0–2); parados usam o quadro 1 de frente; golpe/pulo/dash só de frente.
- **Bijū (`bossCombat.ts`):** espelho pela direita da TELA (`viewRight` = `v2`), não pelo X do mundo, com histerese de ±0,6 m; passos só quando há deslocamento real (> 0,25 m/s, medido pela posição anterior); parada = quadro 0 + respiração de escala. As folhas `bijuu/motion-v1-*.png` só têm vista de frente (4 colunas: passo A, passo B, preparo, rugido) — costas da bijū dependem de arte nova.
- **Ganchos de teste:** `actorMotion()` (jogador, ajudantes, Kuri, megas, inimigos em lote, bijū e clones: `row` 0 frente/1 costas, `flip`, `frame`, `state`), `setYaw(rad)`, `fallen()` e `defeatAccount(id, distância)`.

## Corpo caído (Mega Elite / Shinobi para selar) · rodada 55

- `src/scene/fallenShinobi.ts` (`createFallenBody`): sem arte nova, o sprite estático da forma cambaleia (0,4 s), cai girando 90° em torno dos pés para o lado oposto ao jogador (até 0,95 s), quica com poeira e fica **deitado** com respiração leve. É um billboard girado em espaço de tela: deitado em qualquer ângulo de câmera. Contorno na cor (vermelho Mega Elite `#ff4d6d`, ciano Shinobi para selar `#5ff0ff`).
- Luz: halo no chão que acompanha o relevo (disco suave + anel) e feixe vertical bem fraco, mistura normal (sem aditivo/bloom), `fog:false` para aparecer na névoa, pulsação lenta (2,6 s) e opacidade ≤ 0,72 (cor do contorno clareada 25%). Modo H: só o anel, fixo em 0,45, sem feixe nem poeira. Minimapa/mapa: marcador com retrato e ⛓.
- E dentro de 10 m do **centro do corpo deitado** captura (ritual ou selamento direto conforme a configuração); G recusa no ritual; troca de zona remove o corpo. O save guarda o centro e `account`.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

Ao verificar o atlas, exija uma folha em todos os estados animados e fileiras de caminhada distintas para frente e costas. Na matriz de teste, use o chute de Lee e o soco de Guy como no controlador em jogo. Para uma folha 4×4, ataque de costas usa a segunda fileira e pulo/dash de costas usam a quarta. A inspeção de recorte e semelhança com o repouso continua separada da suíte.
