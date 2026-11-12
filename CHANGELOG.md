# CHANGELOG

## Rodada 46 — Caminhada dos Ninjas Selados (aliados) corrigida · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “Corrigir o caminhar dos Ninjas Selados que entram no time para ajudar, a caminhada deles está bugada, devem caminhar/atacar/normalmente conforme seguem o jogador”):**
  - **Diagnóstico (causa raiz):** o follow dos aliados em `src/scene/GameCanvas.tsx` era **stop-and-go binário**: `follows = gap > .25` fazia o aliado **parar seco** dentro de 0,25 m do slot de formação e **sair “correndo” em `speed+2`** quando o slot (ancorado no jogador) se afastava. Com o jogador andando (~5 m/s), o aliado alternava **idle ↔ andar a ~10 Hz** — o sprite trocava de textura (folha de repouso ↔ folha de caminhada) a cada ~0,05 s: a “caminhada bugada”. **Segundo fator:** a orientação dos aliados usava **sem dead zone** (`dir.dot(v1) > 0` / `dir.dot(v2) < 0`), então, ao andar quase de lado para a tela, a fileira da folha (frente ↔ costas) **flippava a cada frame** — o jogador usa threshold ±0,18 exatamente para evitar isso.
  - **Correção (loop de aliados + Kuri, em `src/scene/GameCanvas.tsx`):**
    - **Follow amortecido:** `ally.position.lerp(goal, 1 − e^(−dt·R))` com **R = 8** (R = 16 durante o dash do jogador) — o aliado **desacelera suavemente** ao chegar no slot (≈0,13 s) em vez de parar seco; com o jogador em movimento ele segue em **offset constante (~velocidade/8 m)** com **passada contínua**. Snap `gap > 12` (recrutamento/teleporte) **preservado**.
    - **Band de assentamento** `follows = gap > .18` (era `.25` nos aliados, `.3` na Kuri) — o aliado para de animar só quando já está no slot.
    - **Dead zone de orientação idêntico ao jogador:** `backwardView = dir.dot(v1) > .18` · `leftward = dir.dot(v2) < −.18` — fim do flicker de fileira (frente/costas) ao andar de lado. Mesmos parâmetros de `viewBack`/`viewLeft` do jogador (linha do `playerMotion.update`).
    - **Ataque/repouso sem mudança de regra:** `castTechnique(..., motion)` continua chamando `motion.attack()` (a animação de ataque dos aliados já tocava — o bug era só a caminhada); o cadência `allyTimer`/`allyInterval` é intacta; Kuri (companheira do Kankuro) recebeu o mesmo follow amortecido e dead zone.
  - **Arquivos:** `src/scene/GameCanvas.tsx` (loop de aliados ~linha 1249 + bloco da Kuri ~linha 1273).
  - **Testado:** `tsc -b` ✓ · `vite build` ✓ · `verify-rules` 56/97/95 ✓ · `verify-motion-atlases` 56/560/0 erros ✓ · `verify-runtime` 0 erros/0 404 (o cenário recruta Gaara + Kankuro e joga com eles) ✓ · **teste visual dedicado** (Playwright: recrutou Gaara + Kankuro, andou W e A, 7 frames) — aliados seguem em formação contínua, atacam com o efeito visível, assentam em repouso, **sem flicker de fileira e sem stop-and-go** ✓.
  - **Pendente:** teste do usuário no navegador (junto com os testes pendentes das rodadas 44/45: FPS em GPU real + fluidez da caminhada do jogador).

## Rodada 45 — Fluidez da caminhada + proporção ao atacar (suavização de escala e passada) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “a animação de andar 'livre' ainda está fazendo um 'bug' de movimentação, essa mudança de sheet's/imagem entre animada e não animada deve ser sincrono, não pode aparecer falhas nessa movimentação, tem que ser totalmente fluído, estava fluído antes… mas, parece que ao tentarmos mexer na melhora da movimentação, pioramos isto. TAMBÉM revise a questão dos personagens ficarem mudando de tamanho perdendo proporção ao atacar”):**
  - **Diagnóstico (regressões das rodadas 38/39):** em `src/scene/playerMotion.ts`, três descontinuidades na troca de folha (repouso ↔ andar ↔ andar-atacando) causavam o “pulo”: **(a)** o fator de proporção `propFactor` (rodada 39 — bbox alfa) era aplicado **instantaneamente** — como `position.y = floor + jumpHeight + scale.y*.5` segue a escala, o personagem **saltava de tamanho E de altura** a cada troca; **(b)** a passada `strideShown` **ligava/desligava de uma vez** no início/fim do golpe (a deformação das pernas ia de 0 para o valor do passo e vice-versa — a “falha de movimentação”); **(c)** `stepTime` **zerava a cada parada**, então ao retomar a caminhada “reiniciava” do quadro 0 (o “snap”).
  - **Correção (3 pontos em `src/scene/playerMotion.ts`, estado estacionário inalterado — só as transições suavizam):**
    - **(a) Fator de proporção SUAVIZADO** — novo estado `propCur` (início 1) faz lerp exponencial `propCur += (propTarget − propCur) × (1 − e^(−14·dt))` (≈0,15 s para assentar). O “pulo” de tamanho/altura vira uma transição fluida; **os pés seguem ancorados** (a âncora usa a escala final). Choji (Jutsu de Expansão), Gaara e Pain (levitação `painFloat`) **preservados** — a âncora e o arco do Pain continuam valendo.
    - **(b) Passada SUAVIZADA na troca de folha** — `strideShown` agora persegue o alvo `(proceduralMotion || walkAttack) ? stride : 0` com lerp exponencial `(1 − e^(−16·dt))` (≈0,1 s). A deformação das pernas **sobe/desce** no início/fim do golpe em vez de ligar/desligar — a passada termina e retoma sem “pulo”.
    - **(c) Fase de caminhada CONTÍNUA** — `stepTime` deixa de zerar: `stepTime += dt`. Ao parar e retomar, o ciclo de passos **continua de onde parou** (mais fluido, como caminhada real) em vez de reiniciar do quadro 0.
  - **NÃO alterado (por segurança):** a troca de textura em si (repouso ↔ folha) segue binária — é a limitação de 1 sprite por estado; as correções (a)/(b)/(c) eliminam os “pulos” de escala/passa/fase que tornavam essa troca visível. Exceções de movimento (Choji cresce · Gaara flutua · Pain levita · Naruto Academia tem atlas próprio · Asuma) **intocadas**.
  - **Testes/validação:** `tsc -b` limpo · `vite build` OK · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95**) · `verify-motion-atlases.mjs` (**56 versões · 560 estados · 0 erros**) · `verify-runtime.mjs` (Edge headless) **PASSOU — 0 erros JS · 0 assets 404** + **inspeção visual** dos screenshots `combat.png` (personagem com tamanho correto, pés no chão, HUD íntegro) e `camera-horizonte.png` (câmera deitada, sem bug gráfico).
  - **Aguardando:** teste do usuário no navegador (fluidez da caminhada + sem “pulo” de tamanho ao atacar). Se ainda houver mudança perceptível de tamanho no golpe, o próximo passo é reduzir a diferença de bbox entre as folhas de ação e o repouso (arte) — o clamp 0,85–1,35 da rodada 39 segue como teto.

## Rodada 44 — Câmera e mouse: giro mais calmo e simétrico + câmera mais deitada (piso 0.05 rad) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “o rawinputmouse ainda está esquisito · a câmera ainda parece muito rápida · é possível deitar mais a câmera no nosso jogo referência, mas tome cuidado, faça testes para não dar bug's gráficos · Lembre-se da câmera centralizar o jogador e não a paisagem/mapa ao redor — nosso foco é sempre ter visão limpa do personagem que estamos jogando”):**
  - **`src/scene/GameCanvas.tsx` — `turnCamera`:** taxa do yaw `0.006` → **`0.0025` rad/px** (−58%) e taxa do pitch `0.004` → **`0.0025` rad/px** (−53%) — **taxa única e simétrica yaw/pitch** (antes havia assimetria 1.5:1, que fazia o giro diagonal “pesar” para o yaw — parte do “esquisito”); 1:1 sem aceleração (rodada 29) **mantido** — `unadjustedMovement` + giro direto; a sensibilidade continua sendo multiplicador puro (slider 0.2–3×).
  - **`src/scene/GameCanvas.tsx` — câmera deitada:** piso do pitch `0.12` → **`0.05 rad (≈3°)`** para o ângulo baixo do jogo de referência (teto `1.48` mantido) + **início da partida `0.74` → `0.55 rad (≈31.5°)`** (começa mais deitado). Proteções de ângulo baixo **já existiam** e foram mantidas: scan de terreno que auto-sobe em encostas (jogador nunca escondido), câmera nunca abaixo do chão (`terrainHeight+1.2`) e near ≤ −70 m (ortográfica, sem corte de primeiro plano).
  - **Câmera centraliza o JOGADOR** (pedido reconfirmado): `cameraTarget.set(player.position.x, terrainHeight+1.15, player.position.z)` + `camera.lookAt(cameraTarget)` — **já era assim**; verificado e documentado, sem mudança nesse ponto.
  - **`src/ui/SettingsScreen.tsx`:** a hint do slider “Sensibilidade do mouse” agora cita o padrão mais calmo (rodada 44) e a **dica do Windows** (velocidade do ponteiro do sistema em **6/11** — o multiplicador do Windows pode somar ao movimento do mouse mesmo com raw input).
  - **`scripts/verify-runtime.mjs`:** o teste de câmera agora **deita a câmera até o piso (0.05 rad)** e assera `pitch ≤ 0.055` (antes `pitch < 0.3`) + yaw gira; mantém o screenshot `artifacts/camera-horizonte.png` para inspeção visual.
  - **`scripts/verify-rules.mjs`:** +6 asserções (taxa 0.0025 yaw · taxa 0.0025 pitch · piso 0.05 · início 0.55 · dica “6/11” na tela de configurações).
- **Arquivos alterados:** `src/scene/GameCanvas.tsx` · `src/ui/SettingsScreen.tsx` · `scripts/verify-runtime.mjs` · `scripts/verify-rules.mjs` · `docs/01` · `docs/13` · `docs/14` · `docs/18` · `docs/23` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** + asserções da 44) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (1ª execução, sem flake) · **inspeção visual** de `artifacts/camera-horizonte.png` no piso 0.05 rad (pedido “faça testes para não dar bug's gráficos”): cena renderiza sem corte no horizonte, sem Z-fighting, jogador visível e centralizado, HUD/minimapa íntegros.
- **PENDENTE (aprovação do usuário):** (1) taxa única **0.0025 rad/px** para yaw e pitch (simetria 1:1); (2) piso do pitch **0.05 rad** (antes 0.12); (3) início **0.55 rad** (antes 0.74); (4) se ainda parecer rápido no Windows → ponteiro do sistema em **6/11** e/ou slider de sensibilidade para baixo. **As pendências das rodadas 41/42/43 seguem em aberto** (docs/18 §6).

## Rodada 43 — Sons reais de jutsu (Kage Bunshin + Shinra Tensei) + pose/levitação da Ultimate do Pain + controle de revisão p/ Claude-Codex · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — 2 MP3s enviados com regras de uso + regra permanente de controle de revisão):**
  - **MP3 1** ("Kage Bunshin no Jutsu") — regra: **"Apenas naruto"** → som da técnica **Kage Bunshin** **somente quando a família do lançador é `naruto`** (qualquer outra família com a técnica no pool compartilhado **não** toca o som).
  - **MP3 2** ("Pain Shinra Tensei") — regra: **"Apenas Yahiko/Pain, ao utilizar ultimate o jogador deve Levitar com os braços abertos, fazer a arte/movimentos, a habilidade ultimate deve ter este som"** → som na **Ultimate do Pain** (no jogo: `Chibaku Tensei`) + **pose de levitação com braços levantados** durante o cast.
  - **`public/assets/audio/`** — 2 MP3s novos copiados do scratchpad (`kage-bunshin.mp3` + `shinra-tensei.mp3`) — **áudios originais que o usuário baixou e entregou para o jogo** (mesmo fluxo do `yooo.mp3` da rodada 37), não material do jogo de referência.
  - **`src/audio/sfx.ts`:** `JUTSU_CLIP_RULES` (regras técnica+família→MP3) · `jutsuClipFor(t,ultimate,casterId?)` · `playJutsuClip(src)` (novo `Audio`, `play()` em promise + catch silencioso, `release` em `ended`/`error`/catch — **zero unhandledrejection**; **bloqueado enquanto `activeJutsuClip` existir** = regra anti-spam do usuário: "só permitir soltar o som quando terminar o áudio do outro — **não é fila**") · `playTechniqueSound(t,ultimate=false,casterId?)` (nova 3ª arg opcional) — se há clip: toca o MP3, marca `lastTechniqueVoice`/`lastVoiceByTechnique` e **retorna SEM o sweep sintetizado e SEM a fala TTS**; se não há clip mas `activeJutsuClip` ativo → retorna sem som nenhum; resto (sweeps + `speak`) inalterado.
  - **`src/scene/GameCanvas.tsx`:** os 3 call sites passam o `heroId` (`activateSetup` · fim de `castTechnique` `if(!ally)` · `castUltimate`); **verificado:** clones de Kage Bunshin atacam via `hit()` direto — **não** chamam `playTechniqueSound` → sem som duplicado dos clones.
  - **`src/scene/playerMotion.ts`:** `painUltimate = family==='pain' && ultimate && state==='ultimate'` → segura o **quadro 0** da folha `pain-1-action-v3.png` (fileira **2** frente / **3** costas — pose de **braços levantados em V** já existe na folha) durante o cast todo (receita do Gaara, que já existia) + arco de elevação `sin(π·attackProgress) × 0,38` m (0→pico→0) — **sem nova arte** (a folha é `kind:'full'` via `revisedActionForms.pain:[1]`).
  - **`docs/23-REVISAO-OUTROS-AGENTES.md` (novo):** controle de revisão para o Claude/Codex (pedido do usuário: "Deixar anotado tudo que você Qwen fez que eles podem revisar, como hud's, personagens/movimentação/sheets… Por segurança, já prepare esse controle de tudo que você está fazendo/já fez para revisão deles") — como usar (AGENTS.md → docs/19 → este arquivo → CHANGELOG → `git log`) · **inventário por rodada** (cada commit resume a rodada) · **áreas de revisão** (HUDs · personagens/movimentação/sheets · áudio · caça-níquel · configs · planner · música) com caminhos · **notas para Claude/Codex** (o que ficou para eles: pose/armadura da ultimate do Pain pode ganhar folha dedicada — hook `painUltimate` em `playerMotion.ts`; arte Pillow da Kuri/Kuroari aguardando IA/swap; sons de jutsu novos chegam pelo usuário; as pendências das rodadas 41/42) · regras permanentes resumidas · validações · push seguro.
  - **`scripts/verify-rules.mjs`:** +9 asserções (regra Kage Bunshin Naruto · regra ultimate do Pain · `activeJutsuClip` presente · os 2 MP3 existem >10 KB · `painUltimate` no playerMotion · call sites com `heroId` · kit do Pain: Shinra Tensei + ultimate Chibaku Tensei).
- **Arquivos alterados/criados:** `public/assets/audio/kage-bunshin.mp3` + `shinra-tensei.mp3` (novos) · `src/audio/sfx.ts` · `src/scene/GameCanvas.tsx` · `src/scene/playerMotion.ts` · `scripts/verify-rules.mjs` · `docs/23-REVISAO-OUTROS-AGENTES.md` (novo) · `docs/13` · `docs/14` · `docs/18` · `docs/19` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** — sem regressão + asserções da 43) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (a 1ª execução falhou no check flaky "Rendan Uzumaki exibe impacto" e a 2ª no "Teuchi/barraca Ichiraku" (timeout 30 s), **ambos sem relação com os edits** — a 3ª passou 58/0/0; padrão documentado nas rodadas 41/42: reexecutar antes de investigar).
- **PENDENTE (aprovação do usuário):** (1) som de Shinra Tensei na Ultimate `Chibaku Tensei` do Pain (a técnica comum Shinra Tensei do kit **não** toca o som); (2) Kage Bunshin → som apenas para a família `naruto`; (3) anti-spam: nenhum outro som de técnica (sweep/TTS) entra enquanto o MP3 toca e a fala TTS da técnica é suprimida; (4) levitação do Pain: arco 0,38 m + pose de braços levantados segura durante o cast + **as 4 pendências da rodada 41** (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência das folhas) e **as 6 da rodada 42** (decisões de trilha sonora) seguem em aberto.

## Rodada 42 — Trilha sonora do jogo (OST de Naruto, 15 faixas do usuário) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — 15 MP3s enviados com regras de uso):** sistema completo de música em `src/audio/music.ts` (novo) + 15 faixas em `public/assets/music/` (nomes limpos, copiadas do scratchpad — **são áudios originais entregues pelo usuário para o jogo**, não material do jogo de referência):
  - **BOOT** (abrir o jogo, navegador/.exe/.patch → sempre a mesma): `ill-do-it-right.mp3` ("I'll Do It Right"); ao terminar → pool de MENUS.
  - **MENUS** (fora da run, ordem aleatória): `konohamarus-theme` · `afternoon-of-konoha` · `loneliness` · `swaying-necklace`.
  - **RUN** (desde o início da run, ordem aleatória): `raising-fighting-spirit` · `heavy-violence` · `ultimate-secrets` · `sarutobi` · `bunta` · `beautiful-green-wild-beast` · `dance`.
  - **BIJŪ** (luta contra a bijū, gatilho em `spawnBijuu` do `GameCanvas.tsx`): `raising-fighting-spirit` — **também** está no pool de RUN (regra do usuário "ordem aleatória **ou** ao iniciar luta contra as bijuus").
  - **DEFEAT** (morrer/perder a run): `grief-and-sorrow` — toca em loop enquanto o resumo da run está aberto.
  - **OVERRIDES POR FAMÍLIA** (início de run, `familyOf(id)` cobre todas as versões): Hinata e Neji → `hinata-vs-neji`; qualquer Sasuke → `sasukes-theme` (regra "apenas essa condição").
  - **Máquina de estados** (idle→boot→menu/run/bijuu/defeat): UMA faixa por vez, **sem fila** (ao terminar, sorteia a próxima do pool sem repetir a anterior); `playMenu()` idempotente (navegar no hub não troca a faixa no meio); fade-in ~0,9 s; volume = `settings.volume × settings.musicVolume`; "Silenciar em segundo plano" também silencia a música; autoplay bloqueado → pendência liberada na primeira interação (pointerdown/keydown, coincide com o clique "Jogar" que já chama `playYooo()`); `play()` sempre em promise com catch silencioso (mesma robustez do `playYooo` — nunca quebra o jogo).
  - **Integração:** `src/main.tsx` (boot no mount + pool de menus nas trocas de página + `startRun(familyOf(...))` em `beginMission` e no botão "continuar missão" + `playDefeat()`/`playMenu()` no fim da run via efeito `runEnded`) · `src/scene/GameCanvas.tsx` (`playBijuu()` em `spawnBijuu`) · `src/game/settings.ts` (`musicVolume` no type + default **0,7** — retrocompatível: `load()` espalha os defaults primeiro) · `src/ui/SettingsScreen.tsx` (slider **"Música"** no lugar do card "em breve" + restauração de padrão).
  - **Decisões desta rodada (registradas, aguardam validação do usuário):** (1) Raising Fighting Spirit = pool RUN **e** trilha da luta bijū; (2) Hinata/Neji compartilham a mesma faixa (regra do usuário num único MP3); (3) após a luta bijū terminar, volta ao pool RUN; (4) **vitória** volta ao pool de MENUS (a faixa de derrota é só para perder a run); (5) `musicVolume` default 0,7; (6) sem crossfade (só fade-in).
- **Arquivos alterados/criados:** `src/audio/music.ts` (novo) · `public/assets/music/` (15 MP3s) · `src/game/settings.ts` · `src/ui/SettingsScreen.tsx` · `src/main.tsx` · `src/scene/GameCanvas.tsx` · `docs/13` · `docs/14` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (15 MP3s presentes no `dist/assets/music/`) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-motion-atlases.mjs` (56/560/0) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 · **probe dedicado da máquina de estados da música (Playwright + Edge, autoplay liberado): 5/5 PASS** — boot `ill-do-it-right` → pool de menu → run com família Sasuke toca `sasukes-theme` (override validado) → desistência toca `grief-and-sorrow` → zero pageerror/404.
- **PENDENTE (aprovação do usuário):** as 6 decisões acima + o volume/pad de 0,7 do slider "Música".

## Rodada 41 — Marionetes únicas do Kankuro e do Sasori (Kuri companheira + entidade Kuroari) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário: “Para Kankuro e Sasori, fazer criações de suas marionetes unicas, utilizar os arquivos de criação/arte/movimentação/assets/arte 2.5D para criar”):**
  - **Kuri** (marionete de máscara de raposa, canon do Kankuro): **companheira PERMANENTE** da família Kankuro (estilo Kiba+Akamaru) — spawn em qualquer versão do Kankuro (kankuro / kankuro-shippuden / kankuro-alianca), segue em formação (ângulo 2,4 rad · raio 2,1), timer de ataque próprio (independente do `allyTimer`), ataca com **“Agulhas de Kuri”** (Projétil · alcance 8 · recarga 1,5 s) — o veneno do Kankuro (`stats.poison`) é aplicado via `hit()`; **NÃO consome slot de ajudante, NÃO entra em `allies`** (sem troca/afinidade/sinergia), sem barra de vida, silenciosa; sem alvo → retry leve de 0,5 s.
  - **Kuroari** (escorpião vermelho, canon: marionete-assinatura do **Sasori**, usada pelo Kankuro na 4ª Guerra Ninja): **entidade visual** da técnica EXISTENTE “Kuroari” (`src/scene/kuroari.ts`, receita do Gamabunta) — 4 quadros (preparo → ferrão erguido → estouro → recuperação), avanço da marionete até o impacto (easing), fade in/out, sprite 1,7 world units, ciclo de vida no `visuals` (respeita a tecla H; descarta a textura ao remover); **dano IDÊNTICO** ao golpe em área atual (`ATTACK_SCALE×1,2×√(área×(1+g.área))`), acerto em 0,55 s via `pendingHits` — **zero mudança de balanceamento**.
  - **Arte (4 folhas novas)**: `kuri-1-walk-v1.png` (1280×640) · `kuri-1-action-v3.png` (1280×1280) · `kuroari-1-walk-v1.png` (1280×640) · `kuroari-1-action-v3.png` (1280×1280) — geração programática com Pillow (`scripts/generate-puppets.py`, tradição do projeto), âncora de pés pela convenção do pack, fileiras frente/costas (walk) e ataque frente/costas + pulo frente/costas (action).
  - **Registros:** `directionalArt.ts` (folha `kuri-1` + `revisedActionForms kuri:[1]`) · `evolution.ts` (`portraitRegion('kuri')` = célula (0,0) da walk sheet) · `npcs.ts` (`NPC_ALLIES.kuri` + `NPC_NAMES.kuri`) · `GameCanvas.tsx` (spawn/loop/cleanup da Kuri + branch da Kuroari + sheet).
  - **Sasori (herói) NÃO foi criado nesta rodada** — segue a fila aprovada **Onda 2** (docs/13/22: spec “Hiruko (1) · Escorpião Vermelho (15)”) — a **Kuroari já fica pronta para o kit dele** (a entidade aparece quando ele castar).
- **Arquivos alterados/criados:** `src/scene/kuroari.ts` (novo) · `src/scene/GameCanvas.tsx` · `src/game/directionalArt.ts` · `src/game/evolution.ts` · `src/game/npcs.ts` · `scripts/generate-puppets.py` (novo) · `public/assets/shinobi-motion/` (4 folhas) · `scripts/verify-rules.mjs` (+10 asserções) · `docs/13` · `docs/14` · `docs/18` · `docs/22` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95 · +10 asserções das marionetes) · `verify-motion-atlases.mjs` (56 versões/560 estados/0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (1ª execução estourou timeout num check flaky do headless — portal do guardião —; 2ª execução passou).
- **PENDENTE (aprovação do usuário):** (1) Kuri como companheira permanente do Kankuro; (2) Kuroari como visual da técnica; (3) adiantar o herói Sasori (Onda 2) ou manter a ordem K→1→2; (4) aceitar a arte Pillow interina (opção: gerar IA e trocar os 4 PNGs com os MESMOS nomes = swap trivial, zero código) + conferência visual das folhas.

## Rodada 40 — Passiva “Couraça” → “Colete Shinobi” (renome + ícone do colete + migração de save não destrutiva) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário: “Deveria ser um colete Shinobi” — print da passiva com ícone de bandana):**
  - Passiva **Couraça** renomeada para **Colete Shinobi** (buff inalterado: **+2 armadura por nível** · base 100 · máx 10 · seção Treinamento).
  - Ícone: bandana (`bandana`) → **colete shinobi** — sprite do atlas `jonin-vest` (mesma arte do item “Colete Jonin”).
  - **Migração de save não destrutiva** (`migratePermanentLevels` em `preparation.ts`): a chave antiga `Couraça` de `sb_permanent_levels` é **copiada** para `Colete Shinobi` no load e **nunca apagada** — quem já comprou os níveis mantém o buff; a conversão armadura→dano do Gaara em `progression.ts` também atualizada para o novo nome.
- **Arquivos alterados:** `src/game/preparation.ts` · `src/game/progression.ts` · `src/main.tsx` · `docs/11` · `docs/13` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b --force` limpo · `vite build` OK · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404.
- **PENDENTE:** conferência visual do ícone da passiva (colete) pelo usuário.

## Rodada 39 — Planner individual por personagem, tabela, Fusões, Táticas, buff verde/vermelho, badge de fusão, proporção idêntica · 12/11/2026

- **IMPLEMENTADO (código nesta rodada; docs/13 e docs/14 registraram o estado final antes do código):**
  - **Planner em TABELA** (colunas: Opção · Origem/efeito · Raridade/estado · Ações) nas abas Habilidades/Pílulas/Itens, comportamento e filtros preservados; painel de detalhe mantido.
  - **Aba FUSÕES** no planner: pares de técnicas (sem setup/bloqueio), **até 4 por herói**, preview das regras **Fundir** (Épico)/**Combinar** (Raro) de `techniqueMerge.ts`; a execução continua na Oficina dos Sapos Sábios (1 uso por zona).
  - **Táticas de Missão**: snapshot nomeado do plano {planejadas · treinadas · em casa · prioridade · fusões}, **até 4 por herói**, Aplicar/Excluir.
  - **Buff verde / debuff vermelho** por cláusula no `BuffText.tsx` (split por vírgula · “ e ” · “;” · “.” · “/” e “ · ”).
  - **Badge ⚗ Requisito de Fusão** no card do pool da run (técnicas de um par planejado).
  - **“pra” → “para”** nos textos do planner.
  - **Plano individual por personagem** salvo na conta: `sb_planned_by_hero_v1` · `sb_home_by_hero_v1` · `sb_priority_by_hero_v1` · `sb_bag_presets_by_hero_v1` · `sb_fusion_plan_by_hero_v1` · `sb_tactics_by_hero_v1` — chaves globais antigas lidas como fallback e **nunca apagadas** (migração não destrutiva); recarga ao trocar de herói (`useEffect([heroId])`).
  - **Proporção idêntica em qualquer movimento**: `alphaFracOf` em `playerMotion.ts` (bbox alfa da célula em uso vs. repouso medido dinamicamente — a textura de repouso muda por nível —, cache por célula, fator clampado 0,85–1,35) — vale para jogador, ajudantes, clones e mega elites; Choji (Jutsu de Expansão, fase 7) seguirá a mesma regra.
- **Arquivos alterados:** `src/main.tsx` · `src/ui/BuildPlanner.tsx` · `src/ui/BuffText.tsx` · `src/game/missionBag.ts` · `src/scene/playerMotion.ts` · `src/hud-dock.css` · `src/rarity.css` · `docs/13` · `docs/14` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b --force` limpo · `vite build` OK (109 módulos; 1,27 MB JS / 378 kB gzip) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros · 0 ausentes) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (FPS 6,4 é o render SwiftShader/software do headless, esperado; GPU real valida em separado).
- **PENDENTE:** teste do usuário (planner em tabela · aba Fusões · Táticas · badge ⚗ · proporção em movimento) · buff de conta de dano de habilidades **por ninja** (pergunta em aberta — o +15% do Treinamento com Jiraiya já é individual por herói) · fases 4/6/7/8 em docs/13.
- **Descartado nesta rodada (JÁ EXISTE):** teclas 1–N no pool · buffs de itens/pílulas visíveis na RunSheet · badges “★ Planejado para Missão”/“· Treinada” · Treinamento com Jiraiya +15% (agora individual por herói) · limite “Não aprender” por herói · Kankuro (RESOLVIDO — não tocado).

## Rodada 37 · Fase 3 — Caça-Níquel da Tsunade · 12/11/2026

- **IMPLEMENTADO (código no commit `ec7c42a`; registro anterior ao código em `2b62cf1`):** renomear "Roleta da Tsunade" → **Caça-Níquel da Tsunade** (UI, toasts, nome do evento, descrições dos itens) + **combos de 3 iguais** (3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros até o fim da run · 3 Jirayas = 1 item Raro/Épico/Lendário · 3 Hiruzens = 4 escolhas de item (E pega · V vende) · 3 Hidan = −5% HP total (**piso 1 HP — não mata**) +5% dificuldade/+5% monstros · 3 Kakuzus = `round(120 × luckFactor × (1+pressão))` Ryu) + **emboscada invertida** (jogador **seguro** durante a interação — simulação pausada; ao sair, **armadilhas shinobi explodem em 8 m** e **matam os monstros próximos** — totem/bijuu/guardião excluídos; som novo `explosion`; a casa "Credores" que spawna inimigos se mantém) + **custo por giro em escala** (1,35 → **1,70/giro** + **fator de zona 0,25** + inflação por minuto — escala como o Ryu por zona) + **face da Tsunade** com humor por recompensa (feliz/triste/nervosa; retrato do roster + badge/glow; **arte das 3 expressões = PENDENTE**).
- **Visual = 3 rolos verticais** (durações 900/1.150/1.400 ms · turbo 240/300/360 ms) no lugar da roda: cada giro resolve **uma** casa e os 3 rolos param no **mesmo** símbolo (aparência clássica de "3 iguais"); o motor de 1 casa (pesos, sorte, pressão, verificação) foi preservado — adaptação registrada (docs/13 §Decisões da fase 3).
- **Arquivos alterados:** `src/game/roulette.ts` (5 casas novas + `SLOT_COMBOS` + `slotKakuzuRyu` + `rouletteCost` com zona) · `src/scene/GameCanvas.tsx` (ramos dos giros, entrega dos combos com limite de item, armadilha shinobi, renome) · `src/ui/TsunadeRoulette.tsx` (rolos + face + humor) · `src/tsunade-roulette.css` · `src/audio/sfx.ts` (`explosion`) · `src/game/catalog.ts` (Dente de Ouro/Carteira Gama-chan) · `scripts/verify-rules.mjs` (asserções).
- **TESTADO (12/11, sessão Bionic):** `tsc -b --force` ✓ · `vite build` ✓ (428 ms) · `verify-rules` ✓ (boa chance sorte 0 = **30,88%** · giro 4 = **251** · zona 2 = **38** · zona 3 = **45** · Kakuzu 120/240/480) · `verify-runtime` (Edge headless) ✓ — 0 exceções JS, 0 assets 404, todos os checks de gameplay.
- **PENDENTE:** (a) **arte das 3 expressões da Tsunade** (feliz/triste/nervosa) — por ora o mesmo retrato do roster + badge/glow de humor (reage, mas não são 3 artes distintas) — fila da fase de arte (skill `criar-arte-shinobibonk`); (b) teste do usuário com GPU real — calibração de custo/combos em iteração (regra da rodada 35: o usuário testa a gameplay e ajustamos).
- **Descartado nesta rodada (JÁ EXISTE no jogo — regra do usuário 12/11):** HP com números na barra (já existe no HUD) · teclas 1–N no pool de escolha (já existe) · desconto de custo da roleta (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40% — **mantido** na nova fórmula) · White Flute (a Pílula de Incenso já existe; a rodada 37 aprovou o **ITEM novo** "White Flute" na fila da fase 4 — Incenso se mantém) · YOOOO sintetizado (o MP3 real foi integrado na fase 1, commit `d05f168`) · HUD base/arte de menu (parcialmente entregue na rodada 38, commit `fd79ced`) · animação de ataque + caminhada (resolvida na rodada 38, commit `fd79ced`) · Kankuro (já resolvido pelo usuário — não tocar).

## Rodada 38 — Animação andar+atacar, HUD ninja, ABRIR_JOGO e proposta de novos shinobis · 12/11/2026

- **Andar atacando com a animação completa** (usuário: "ele tem que andar liso atacando, mas a animação de movimentação dele levantar os braços e usar o hit, tem que continuar fluído"). Causa: desde 4d1e798 o estado ficava `walk` durante o golpe e os quadros da folha de ação nunca apareciam. Agora, parado ou andando, o golpe toca inteiro (preparação → selo/soltura → recuperação); andando, a passada continua nas pernas do quadro de ataque, na mesma fase da caminhada, e a caminhada retoma sem pular quadro. O deslocamento não muda. Exceções preservadas: Ultimate (pose especial), chute de Lee/Guy e Gaara (flutua). Vale para jogador, ajudantes, clones e mega elites. (`src/scene/playerMotion.ts`)
- **Encadeamento com velocidade de ataque alta**: um pedido de ataque antes de 75% do golpe (`CHAIN_AT`) entra na fila e começa ao passar de 75%; o golpe não reinicia nem pisca.
- **Testes**: `motion().anim` no gancho `?test=1` (GameCanvas.tsx); `verify-motion-atlases` verifica as 56 versões andando+atacando e o encadeamento. Skill `movimentar-shinobi` com as regras "Andar atacando" e "Encadeamento".
- **ABRIR_JOGO.bat à prova de pasta movida**: a mudança da pasta para `C:\Shinobibonk projeto\` quebrou os atalhos internos do `node_modules` (o Vite deixou de existir) — dependências reinstaladas com `pnpm install --frozen-lockfile`. O .bat agora acha o Node (runtime do Codex ou PATH), detecta Vite ausente/quebrado e reinstala sozinho (pnpm do Codex → corepack pnpm → pnpm → npm); mensagens em português, `pause` no erro, opções `--no-open`/`--port N`.
- **HUD e interface com tema ninja** (prévia de `docs/previas/hud-ninja/` aplicada ao jogo): pergaminho, placa de madeira, selo vermelho, barras em pincelada, slots ofuda, Ultimate em selo com AUTO (Y mantido), minimapa com aro de corda, cartas de nível com a cor da raridade; hub, seleção de shinobi e seleção de mapa redesenhados. Ficha P, Bolsa, Plano, Ataques, Passivas, configurações e resumo **só herdaram os tokens** (cores/fontes/molduras). Novo `src/ninja-theme.css`; paleta fria dos CSS convertida para madeira/papel.
- **Menu inicial com fundos ilustrados** (só arte do projeto): as 4 vilas de `map-previews-v1.png` se alternam (respeita "reduzir movimento"), monumento/estátuas/torii em camadas, vinheta e losangos, faixa de miniaturas das vilas e o shinobi escolhido com fala.
- **Fontes locais** Reggae One e Baloo 2 (SIL OFL 1.1) em `public/assets/fonts/` com as licenças; sem CDN (pronto para o .exe/offline).
- **Correção**: cartões de ajudantes não encolhem mais dentro da coluna com rolagem (o texto vazava).
- **Proposta de novos shinobis** em [docs/22](docs/22-PROPOSTA-NOVOS-SHINOBIS.md) (PROPOSTO, nada implementado): 11 Kages/líderes + 3 ondas de elenco clássico/Shippuden, fichas com versões, técnicas únicas, passivas, arte e efeitos, pesquisa na Narutopedia; aponta **divergências canônicas** na lista aprovada na rodada 37 (aguardando o usuário).
- **Ponteiros** `.claude/skills/` criados para `contexto-e-decisao`, `documentar-projeto` e `referencia-externa`.
- **Registro tardio** (código já publicado no commit 33d8195, sem entrada no changelog): colisão de movimento com cenário (`src/scene/collision.ts`) e bordas sem vazio; elenco todo liberado para teste (`TEST_UNLOCK_ALL = true` em `src/game/account.ts` — **voltar a false antes de publicar a versão final**); Ultimate do Naruto Academia = **Jutsu Sexy** (área 6,5 m, atordoa 3,5 s, chefes 1,2 s); **Kage Bunshin** explode em área (raio 1,5 m); item **Isca Shinobi** (Raro, provisório; a rodada 37 decidiu que vira vitamina); o drop de Ryu deixou de depender da Sorte e não é mais descartado no teto de drops.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95), `verify-motion-atlases` (56 versões, 560 estados, 0 erros), `verify-runtime` (58 verificações, 0 erros JS, 0 assets 404) e capturas reais em 1600×900 e 1280×720. **PENDENTE**: revisão visual do usuário com GPU real (animação e custo de FPS da HUD) e a reinstalação automática do .bat exercitada de verdade.
- **Integração com sessão paralela (Bionic, 12/11):** a fase 2 da fila da rodada 37 (animação de ataque + caminhada) foi resolvida por **duas sessões em paralelo** — o Bionic criou uma camada sobreposta (`attackLayer`, validada localmente, commit `841f5bd`) e esta rodada 38 a resolveu com o modelo adotado (golpe inteiro no sprite base + passada nas pernas + encadeamento). **Estado final = este commit**; a variante do Bionic foi descartada (menos completa) mas **preservada na branch `backup-r37-fase2-overlay`** para comparação visual. Status da fila da rodada 37 sincronizado em [docs/13](docs/13-PENDENCIAS-PARA-CONTINUAR.md): 1 ✅ · 2 ✅ · 5 e 9 parciais · 3 (Caça-Níquel) próxima · 4/6/8 pendentes · 7 em proposta (`docs/22`, aguardando o usuário).

## Rodada 37 — Autorização do mega-lote + novos specs · 12/11/2026

- **AUTORIZADO pelo usuário** ("Aprovo os Kages · Aprovo o Elenco Tier A · Ok pasta com áudio, já inclua este que enviei no 'Jogar' · Pode colocar esse caça níquel") — a fila inteira da rodada 35 (docs/13) foi liberada para implementação e as 9 perguntas em aberto foram respondidas (docs/18 §4, linha 37 · integral em docs/14).
- **Novos specs aprovados (12/11):**
  - **Elenco:** Kages **APROVADOS** + **primeiros Kages de cada vila até o Shippuden** (Hanzo 1º Tsuchikage · Mei Terumi 1ª Mizukage; pesquisa na NarutoWiki) + **correção de canon (A = 3º Raikage · Killer B = 4º Raikage)**; **Tier A (17) APROVADO**; **Tobi ×2** (Akatsuki + outra versão); **Nagato = personagem SEPARADO do Pain** (kit: Tensei + Invocação dos Pain's + caminhos de Pain); **Yahiko = o PAIN** (kit: barras de chakra + Tensei).
  - **Caça-Níquel da Tsunade:** **combos de 3 iguais** (3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros · 3 Jirayas = item raro+ · 3 Hiruzens = 4 escolhas de itens · 3 Hidan = −5% HP +5% dificuldade +5% monstros · 3 Kakuzus = bônus de Ryu por sorte/dificuldade), **emboscada invertida** (armadilhas shinobi/papéis bomba explodem ao redor do jogador e **matam os monstros próximos** — jogador **seguro** durante a interação; a horda retoma ao sair) e **custo por giro subindo gradual e considerável, escalando como o Ryu por zona**.
  - **Itens/pílulas:** renames com arte/ícone exclusivos — "Pergaminho de Ressurreição" (35%) → **Células de Hashirama** · "Rinne Tensei" (60%) → **Chakra de Hagoromo**; **White Flute = ITEM novo** (horda maior + mais Ryu/leveling) — a **Pílula de Incenso SE MANTÉM**; teto de pílulas **9/13/15** (base 9 · buff de conta = **Passivas Shinobi** por Lamens aplicando no **início da run** → 13 · buff de item Cabaça +2 → 15); **Isca Shinobi → vitamina**.
  - **HUD/tema:** **barra de HP com números no PÉ DO PERSONAGEM**; **HUDs recriadas no tema Naruto/ninja/japonês**; **glossário** (atributos no estágio, efeito de cada pílula, **% de mega crítico após o crítico 100%**, alfas/ajudantes com buffs + combos de facção/aldeia/família); streak em tempo real; abates totais; card de temporada.
  - **Áudio:** **YOO MP3** (baixado pelo usuário) no botão Jogar/Jogar-como-convidado com **corte a partir do 1 s**; **ytmp3.yt autorizado** para os demais sons de jutsu (falhou → o usuário baixa e entrega a pasta); anti-spam mantido (o próximo som só toca quando o anterior **termina** — não é fila).
  - **Folhas:** caminhada **frente (baixo) e costas (cima)** seguindo o modelo de criação do projeto.
- **Fases de implementação (ordem):** 1) áudio YOO + gate anti-spam → 2) animação de ataque + caminhada (regressão da 33) → 3) Caça-Níquel da Tsunade → 4) itens/pílulas → 5) HUD (tema Naruto) → 6) balance (início fraco/gradual, monstros aos 6 min, treinamento +0,6% aleatório, pergaminhos no chão, mapa maior + spawns alcançáveis) → 7) personagens novos → 8) folhas frente/costas → 9) arte dos menus.
- **Fase 1 — IMPLEMENTADO (commit `d05f168`):** `playYooo()` agora reproduz o **MP3 real** do usuário (`public/assets/audio/yooo.mp3`) com **offset de reprodução em 1,0 s** (equivalente funcional ao corte de 1 s; ffmpeg indisponível no host — documentado); fallback sintetizado mantido para falhas; `jutsuGate()` no `playTechniqueSound()` impede o próximo som de jutsu enquanto o anterior **não terminou** (regra anti-spam, não fila; fala em voz também estende o gate +2,4 s). Validações: `tsc -b` ✓ · `vite build` ✓ (425 ms) · `verify-rules` ✓ (56/56/97/95).
- **Documentação sincronizada:** docs/13 (fila AUTORIZADO + specs da 37), docs/18 (§2/§3/§4 linha 37/§5/§6), docs/20 (estados APROVADO + fila), docs/21 (roster APROVADO + Hanzo/Mei/Tobi×2/Nagato/Yahiko).
- **GitHub:** commit + push deste registro.

## Rodada 36 — Segurança, backup e segmentação segura de contexto · 12/11/2026

- **Regra reafirmada (pedido do usuário):** material de outros jogos **nunca** fica na pasta do projeto — verificado: `<pasta arquivada>/` (prints/vídeos/frames/`CONTEXTO-COMPLETO.md`) na raiz do workspace, **fora do repositório**; 0 arquivos rastreados mencionam o jogo de referência. Regra permanente em `docs/19` (regra 6) + skills.
- **Avaliação de segurança (pergunta do usuário):** o prompt de segmentação é **seguro para executar** — não destrutivo, dentro da pasta autorizada, sem tocar código/assets/Windows, com parada em caso de dúvida. Executado **adaptado ao próprio texto do prompt** (§2 autoriza "manter a estrutura + índice agregador, sem consolidação física" e §3 proíbe duplicados): não se criaram 15+ documentos paralelos — apenas índice + os domínios que **faltavam**.
- **Backup integral ANTES de qualquer alteração (pedido do usuário):** `backup-ShinobiBonk-2026-11-12.zip` na **raiz do workspace (fora da pasta do projeto)** — 980 MB; **2.882 arquivos** (exatamente a contagem do projeto sem `node_modules`); 0 entradas de `node_modules`; hashes SHA-256 de amostra (CHANGELOG.md, AGENTS.md) extraídos do zip = idênticos ao original. `node_modules` excluído de propósito (regenerável via `npm ci`); `.git` incluído.
- **FASE A — Inventário + backup:** 14 docs + 6 skills + AGENTS.md + CHANGELOG inventariados; backup criado e validado (contagem, ausência de node_modules, hashes).
- **FASE C — Documentos novos (aditivos, zero remoção):**
  - `docs/19-INDICE-DO-CONHECIMENTO.md` — **índice agregador**: mapa de 19 domínios → onde vive (doc + código), fluxo de recuperação seletiva, 6 regras permanentes de manutenção (não destrutivo, sem fonte paralela, atualização contínua, conflitos, referências visuais do próprio jogo, material externo fora do projeto), **manifesto de migração com rastreabilidade** (inclui os 2 domínios do prompt **NÃO APLICÁVEIS**: QWEN.md/ComfyUI) e validação da rodada.
  - `docs/20-SCALING-EREGULAS.md` — **todas as fórmulas e valores lidos do código em 12/11**: dificuldades (Genin 1/Chunin 1,4/Jonin 1,9/Kage 2,6), escala de inimigos por minuto (com tabela Genin), zonas (×1/1,18/1,38), Final Swarm (×3 + 25%/min, teto 8.000), elite/mega (8%, 30%, 55%), atributos do jogador (dano/HP/EXP/crítico/sorte), crescimento de técnicas (GROWTH_ROLLS + TECHNIQUE_SCALE 1,2), roleta (30 × 1,35^giros, desconto teto 40%), pílulas (10 hoje · 9/13/15 PROPOSTO), drops (Ryu 72% etc.), mundo (raio 76, zona 10 min), painel F9 (41 multiplicadores, base Genin).
  - `docs/21-ELASTAO-DE-HEROIS.md` — roster completo (24 famílias + 32 versões = 56) com títulos/eras, regras do elenco e **fila de novos** (7 Kages com conceito a aprovar + 17 Tier A) com estados.
- **FASE F — Skills atualizadas:** `contexto-e-decisao` (docs/19 como 2º passo da leitura + regra sem duplicar + material externo fora do projeto) e `documentar-projeto` (regra de manter `docs/19-21` sincronizados com a alteração; falhou → registrar inconsistência em `docs/13`).
- **Validação (FASE E):** git da rodada apenas **aditivos** + atualizações de sync; **nenhum código de jogo ou asset alterado**; nenhum contexto original (`docs/14`/`docs/18`) apagado ou resumido; todos os blocos novos com origem (código ou pedido do usuário) e estado; links verificados.
- **Adaptações registradas:** "QWEN.md" (não existe — equivalente `AGENTS.md` + `skills/`) e "ComfyUI" (não usado — arte via `criar-arte-shinobibonk`) marcados **NÃO APLICÁVEL** no manifesto, sem suposição.
- **GitHub:** commit + push desta rodada.

## Rodada 35 — Plano do mega-lote (HUD, personagens, sons, scale, pílulas, mapa) · 12/11/2026

- **Somente plano — nenhum código de jogo alterado** (pedido do usuário: "me dê o retorno do que consegue e não consegue e eu vou autorizar o começo do trabalho").
- **Material novo consumido e arquivado FORA do projeto** (skill `referencia-externa`, zero rastro no repositório): 7 telas de HUD/menu de referência (prints `r35-naruto-ui-*`) + 23 frames de 6 vídeos de gameplay (`frames-6-videos/`) + links de áudio (YOOOO, jutsu padrão, Kage Bunshin) — tudo em `<pasta arquivada>/` (raiz do workspace, fora do repositório), registro em `CONTEXTO-COMPLETO.md` §9.
- **Fila da rodada 35** registrada em [docs/13](docs/13-PENDENCIAS-PARA-CONTINUAR.md) (PROPOSTO/aguardando autorização) em 4 fases: (1) regressão da animação de ataque + infra de som + Caça-Níquel da Tsunade + treinamento esgotado → aleatório +0,6% + pílulas 9/13/15 + Isca Shinobi → vitamina + pool informativo; (2) HUD (abates, streak, temporada, glossário, itens esquerda/skills+pílulas direita) + menus no padrão das 7 telas + planejador de fusões/builds com salvar builds; (3) balanceamento em iteração (jogador inicial mais fraco, monstros fortes aos 6 min, escala por dificuldade) + mapa +30% com spawns alcançáveis + pergaminhos no chão (Ryu por zona + sorte) + personagens novos (7 Kages com **aprovação de conceito ANTES de criar** + 17 do Tier A clássico/Shippuden com evolução por era); (4) análise dos 6 vídeos para números de scale.
- **Novas decisões permanentes** (docs/18 §3, datadas 12/11): escopo do agente (somente `C:\Shinobibonk projeto - Copia`; navegador só para testes; aprovação automática de acessos); regra de descarte (novo que já está no jogo → descartar + listar ao final); anti-spam de som (o próximo som só toca quando o anterior **termina** — não é fila); treinamento esgotado = **atributo aleatório +0,6%/nível** (substitui "somente Sorte +0,8%"); pílulas **9/13/15**; Isca Shinobi → vitamina; **Caça-Níquel da Tsunade** (renomear + arte feliz/triste/nervosa + custo subindo gradual e considerável); personagens (Kages com aprovação antes de criar + Tier A); pergaminhos no chão; mapa maior + spawns alcançáveis; HUD no padrão das referências; animação de ataque deve coexistir com a caminhada (senão, voltar ao estado anterior).
- **Descartado (JÁ EXISTE, pela regra do usuário):** HP com números, teclas 1–N no pool, desconto de custo da Roleta (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%), White Flute (Pílula de Incenso), "YOOOO" sintetizado, frente/costas na caminhada (validar visualmente).
- **Limitações declaradas ao usuário:** o agente **não baixa áudio do YouTube** nesta sessão (o usuário baixa e entrega a pasta; proposta `assets/sons/`); a **foto do late game não chegou** (pedido de reenvio; o frame v4 dos vídeos é a referência recebida).
- **Perguntas em aberto (9)** em docs/13 (foto, buff de conta, 0,6%, Kages, Tier A, pasta de áudio, ×1,70, +30%, iteração de balance).
- **GitHub:** commit + push deste registro (sem código de jogo).

## Dificuldade, scale de habilidades, ficha e renderizador (preparo .exe) · 11/11/2026

- **Early game mais difícil em todas as dificuldades** (usuário: "dificulte mais o early game de todos os modos de jogo que temos em suas devidas proporções"): o Genin perdeu o desconto inicial de 66% — todas as dificuldades nascem na força plena do tier (1 / 1,4 / 1,9 / 2,6) e a base do minuto 0 subiu (HP ×1,6 · dano ×1,45), decaindo proporcionalmente com o tempo (5 min ≈ ×1,20 · 10 min ≈ ×1,13 · 30 min ≈ ×1,05). (`src/game/progression.ts`)
- **Dificuldade individual por zona (fase)** (usuário: "verifique o nível de dificuldade também individual para cada fase do jogo"): nova `ZONE_DIFFICULTY` (zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38) aplicada ao HP, dano, spawn e pressão de roleta de cada zona. (`progression.ts`, `src/scene/GameCanvas.tsx`)
- **Scale de dano e % de todas as habilidades aumentado** (usuário: "aumente o scale de dano e % de todas as habilidades do jogo" + "deixe mais difícil, alguns personagens estão fazendo os mapas muito fáceis"): `GROWTH_ROLLS` com base ×1,5 e spread maior em todas as raridades (Comum +45–67% · Lendário +375–485% por nível) e novo `TECHNIQUE_SCALE` (×1,2) aplicado ao dano das técnicas do jogador e dos ajudantes (kits dos chefes já escalam por fase e não mudaram). (`src/game/combat.ts`, `GameCanvas.tsx`)
- **Números de dano podem seguir spammando** (usuário: "pode deixar os números spammando na tela"): teto na tela de 60 → 300 (pool de sprites preservado). (`GameCanvas.tsx`)
- **Tabela de utilidades de volta na ficha** (usuário: "volte a tabela de utilidades para a ficha do personagem, em outra rodada foi retirado"): bloco UTILIDADE com 9 linhas — velocidade, coleta, sorte, experiência, Ryu, recarga da Ultimate, vagas de suporte, dano de aliados, cadência de aliados. (`src/ui/RunSheet.tsx`)
- **Gráfico de crescimento por nível na ficha** (referência visual: vídeo enviado pelo usuário, arquivado FORA do repositório): cada técnica aprendida mostra barras "Crescimento por nível · dano por golpe" (nível 1 → atual, dano exato por nível). (`RunSheet.tsx`, `src/run-ui.css`)
- **Treinamento esgotado sobe somente Sorte** (usuário: "quando não temos mais nada para evoluir em habilidades/pílulas aumentar só a 'Sorte'"): pool de técnicas/pílulas esgotado → level-up agora dá +0,8% de Sorte; antes era atributo aleatório. (`GameCanvas.tsx`)
- **Renderizador DirectX/OpenGL nas configurações** (preparo do .exe/patch, pedido do usuário em rodada anterior e confirmado agora: "também tem que acompanhar uma configuração semelhante para já ficar preparado um executável"): nova opção na aba Tela — no navegador a renderização é sempre WebGL (melhor esforço); no .exe/patch o jogador escolhe o motor. (`src/game/settings.ts`, `src/ui/SettingsScreen.tsx`)
- **Kankuro RESOLVIDO** (usuário: "kankuro já foi corrigido"): arte das folhas 1/15/30 + walk/action v3 confirmada no repositório; fila atualizada. (docs/13)
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless, todos os checks verdes, sem exceções JS nem assets 404).

## Andar durante o ataque + economia de geometria dos anéis · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Porque no MEU computador o jogo está lagado, 20 FPS? Mesmo quando eu fecho tudo relacionado a IA?" + "O personagem não deve travar/parar de andar na animação de ataque, se ele tem ataquespeed para atacar e consegue andar, deve continuar andando fazendo os movimentos."
- **Andar durante o ataque** (`src/scene/playerMotion.ts`): o ataque normal não interrompe mais a caminhada — com input de movimento o estado fica `walk` e o corpo continua o ciclo de caminhada, com o golpe nos braços (balanço `swing` aplicado em `pose.apply`, inclusive por cima dos quadros de folha de caminhada); parado, o ataque é exatamente como antes. A **Ultimate mantém a pose especial** (prioridade de sempre); pulo, dash e dano não mudaram.
- **Anéis de efeito sem churn de geometria** (`src/scene/GameCanvas.tsx`): os anéis (escudo, espinhos, Chidori Nagashi, Amaterasu, ressurreição etc.) criavam `TorusGeometry` nova a cada uso e a disporiam ao terminar (upload de GPU + GC contínuo); agora há **cache por tamanho** (mesmo visual: torus .11 por size), criada uma vez por size e liberada **só no unmount** (via `runCleanups`); o material segue por anel (dispõe ao terminar, como antes).
- **Diagnóstico do 20 FPS**: o domínio novo do Netlify é um `localStorage` novo → configurações nascem no padrão `Qualidade Alta` + resolução cheia (o mesmo diagnóstico da rodada 23); o jogo é GPU-heavy por design (hordas de 60+ inimigos em tela, teto 1.600, Final Swarm 8.000; sprites 3D + efeitos + números de dano = centenas de draw calls); fechar apps de IA não muda o custo do jogo na GPU do navegador. **Ação do jogador**: Gráficos → Qualidade `Média`/`Baixa` e/ou Tela → Resolução `900p`/`720p` (fica salvo naquele domínio/navegador); GPU "Alto desempenho (dedicada)" (padrão) e aceleração de hardware do navegador ligada.
- **Não otimizar o que já está otimizado** (verificado no código): números de dano já com pool + cache LRU de textura (teto de 60 ativos), terreno pré-amostrado em grade, pixel ratio limitado (≤1,5) — o ganho real é das configurações do jogador + esta economia de geometria.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless — todos os checks verdes, sem exceções JS nem assets 404).

## Decisão: excluir e recriar o repositório no GitHub · 11/11/2026

- Decisão do usuário (CONFIRMADO): "eu vou excluir o repositório e depois criar outro para utilizarmos, não se preocupe mais com isso" — a pendência do **suporte da GitHub foi encerrada** (não se prepara mais nada).
- **Efeito:** o zip de origem não verificada (`artifacts/sb-swishes-source.zip`) e os prints/docs antigos saem do GitHub **com a exclusão do repositório** — sem reescrita de histórico, sem force push.
- **Até a recriação:** commit + push segue no repositório atual (`main`); o `.gitignore` já protege o zip contra nova entrada.
- **Quando o novo repositório existir:** atualizar o remoto (`git remote set-url origin <novo-url>`) e publicar; a pasta arquivada do jogo de referência segue fora do projeto (raiz do workspace).
- Registro: decisão permanente em docs/18 §3, estado do repositório em §5, resumo da rodada em §4 (linha 32), mensagem integral + respostas em docs/14.

## Contexto, skills e registro completo · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Deixe o changelog atualizado e verifique se a skill de atualizar os log's manda exatamente documentar TUDO que nós fazemos de alteração, inclusive... você consegue também subir para o github as alterações e sempre atualizar lá? Criar uma skill .markdown para SEMPRE ler os contextos e .skills para tomar decisões de alterações, isso serve para quando resetar o contexto, você usar as outras skills já criadas, inclusive a que temos para salvar contexto, para você utiliza-la, assim como todas as outras, ler as documentações... e tomar a melhor decisão sempre. não se esqueça de atualizar o github"
- **Nova skill `skills/contexto-e-decisao/SKILL.md`**: no início de toda tarefa — e principalmente após reset de contexto ou handoff de outro agente — (1) ler o contexto na ordem (AGENTS.md → docs/18 → docs/14 → docs/13 → CHANGELOG → README/docs/00/doc temático); (2) ler e usar as skills do projeto (`documentar-projeto`, `publicar-github`, `criar-arte-shinobibonk`, `movimentar-shinobi`, `referencia-externa`); (3) decidir pela ordem decisão permanente do usuário > código (fonte da verdade) > documentação, com PROPOSTO para o que o usuário não aprovou; (4) fechar a rodada com registro completo (TUDO) + commit/push + relatório em pt-BR.
- **`documentar-projeto` agora manda explicitamente "documentar TUDO"** (regra do usuário, 11/11): toda alteração — código, configuração, controles, assets, sistemas, skills, textos, decisões, testes — entra no registro na mesma tarefa, sem exceção; `CHANGELOG.md` em toda mudança (jogo, documentação, skills, processo), sem "mudança pequena demais para registrar"; `docs/14` com o pedido integral + resposta, `docs/18` com resumo/direção, `docs/13` com o que falta.
- **`publicar-github` endurecida**: stage com `git add -u` + novos arquivos por nome — nunca `git add -A` em bloco (poderia estagiar não rastreado); commit em português + push para `origin main` ao fim de toda tarefa; nunca force push.
- **AGENTS.md**: nova seção "Antes de qualquer tarefa" aponta a skill `contexto-e-decisao` como primeiro passo; "Documentação contínua" ganhou a regra de documentar TUDO.
- **GitHub sempre atualizado**: commit + push ao fim de toda tarefa é regra permanente (AGENTS.md + skill); nesta sessão: `ab87de2`/`5aa28c6` (rodada 30) + este commit.
- **CONFIRMADO**: documentação e skills em sincronia; repositório publicado e worktree limpo (push para `origin main` OK).

## V-Sync, placa de vídeo e fim da suavização da câmera · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Retirar a suavizaçãao de câmera, colocar opção de v-sync no jogo. Não sei exatamente se da pra utilizar jogando o jogo via navegador, mas quando formos fazer o nosso .exe do jogo/patch do jogo, deverá ter nas configurações também, ligar e desligar e também opção para selecionar a placa de vídeo do jogador ou rodar em openGL."
- **Suavização da câmera retirada** (`src/scene/GameCanvas.tsx`): zoom instantâneo (muda direto para o alvo, sem perseguição exponencial) e altura da câmera seguindo o jogador na hora (removidos `damp`/`jumpedZone`). O giro (yaw/pitch) já era direto desde a rodada 29 (mouse 1:1).
- **V-Sync** (Gráficos; `vsync` em `settings.ts`, padrão LIGADO): ligado = `requestAnimationFrame` (um quadro por quadro do monitor); desligado = loop acima da taxa do monitor (`setTimeout(0)`, pausado em aba oculta) — melhor esforço no navegador (ele ainda pode limitar); no .exe a sincronização sai direto do motor.
- **Placa de vídeo** (Gráficos; `gpu` em `settings.ts`, padrão "Alto desempenho (dedicada)"): Automática / Alto desempenho (dedicada) / Integrada (economia) → `powerPreference` do contexto WebGL (default / high-performance / low-power); trocar em tempo real recria o contexto (dispose + `forceContextLoss` do antigo) e reinicia o loop; saves antigos sem os campos são migrados pelo espalhamento dos padrões.
- **"Rodar em openGL"**: a versão web não expõe escolha de API de render (o motor escolhe WebGL2/WebGL1); o card "Monitor e motor gráfico" (Tela) agora registra que no .exe/patch o jogador também escolhe o renderizador (OpenGL/DirectX).
- **Corrigido flake do `verify-runtime` (re-lock após escolha)**: a isenção de teste do `CHOICE_GUARD` (`guardOff`) só valia quando `testPointer` era `true` — e o teste de lock usa `?test=1&pointer=real`, onde `testPointer` é `false`; com o guard ativo, o clique na carta (chegando em < 0,5 s) era descartado pelo `onChoose` antes do re-acionamento do ponteiro, e o teste morria no `waitForFunction` do re-lock. A isenção agora vale para qualquer página `?test` sem `&guard=1` (só em desenvolvimento), como já documentado em docs/12 e no comentário do código.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56 versões, 97 técnicas, 95 itens) e `verify-runtime` (Edge headless — todos os checks verdes, incluindo "P fecha a ficha…", "Esc fecha a pausa…" e "ponteiro volta após escolha"; sem exceções JS nem assets 404).

## Mouse sem aceleração (raw input) · 11/11/2026

- Pedido do usuário (CONFIRMADO): "rawinputbuffer é em relação a aceleração do mouse, quanto mais mexe o mouse mais rápido fica, eu quero que isso não aconteça... quero que ele fique sempre a mesma velocidade e a sensibilidade funcione exatamente da forma que o jogador configurar nas configurações que temos no jogo".
- Causa: a câmera perseguia o alvo do mouse com amortecimento exponencial (`MathUtils.damp` em `yaw`/`pitch`), então movimentos rápidos "apanhavam" a câmera e pareciam aceleração; e, sem `unadjustedMovement`, o `movementX/Y` que chega ao navegador já vem acelerado pelo sistema operacional do mouse.
- `captureGamePointer` (`src/scene/GameCanvas.tsx`) agora pede o pointer lock com `{unadjustedMovement:true}` — raw input do navegador (Pointer Lock 2.0, baseline 2026); em navegadores antigos a opção é ignorada e o lock segue funcionando.
- `turnCamera` aplica o movimento direto em `yaw`/`pitch`: removidos `targetYaw`/`targetPitch` e o `damp` do loop de render. O giro passa a ser exatamente `movimento × 0.006 (Y: 0.004) × sensibilidade`, constante, independente da velocidade do mouse.
- A sensibilidade continua o multiplicador linear 0.20–3.00 de Controles (inverter Y e distância da câmera inalterados); o hint da opção agora explica o 1:1.
- **TESTADO**: `tsc -b`, `vite build` e `verify-rules` passaram (56 personagens, 97 técnicas, 95 itens).

## Remoção do ajuste automático de desempenho · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Eu não quero o auto-render para melhorar FPS, deixe o jogador configurar como quiser nas configurações gráficas isso, volte ao normal como estava!"
- Removido `src/scene/adaptiveGovernor.ts` e todo o uso em `GameCanvas.tsx` (loop de render, handler `shinobi-settings`, leitura de debug `autoRatio`/`autoDeficit`).
- Removidos a opção **Ajuste automático de desempenho** de Gráficos (`SettingsScreen.tsx`) e o campo `autoPerformance` (`settings.ts`); configurações salvas antigas que o continham passam a ser ignoradas.
- O pixel ratio volta a ser definido apenas por Qualidade/Resolução; Limite de FPS continua em Gráficos. Se o FPS estiver baixo, o jogador ajusta: Qualidade `Média`/`Baixa` ou Resolução `900p`/`720p`.
- **TESTADO**: `tsc -b`, `vite build` e `verify-rules` passaram após a remoção. A entrada anterior permanece como registro histórico.

## Ajuste automático de desempenho (FPS) · 11/11/2026

- Novo `src/scene/adaptiveGovernor.ts`: mede o intervalo real entre quadros (inclui a espera do GPU) e, se o FPS cair abaixo de ~55, reduz o pixel ratio do renderizador em passos (×0,85, piso 0,5); se sobrar folga (~80 fps ou mais), devolve (×1,12, nunca além do ratio configurado). Warmup de 4 s, histerese 18/12 ms contra oscilação, pausa quando o jogo está parado e ignora intervalos >250 ms (aba oculta/travada).
- Nova opção **Ajuste automático de desempenho** em Gráficos (ligada por padrão); desligar devolve o ratio ao valor configurado. Não altera dano nem jogabilidade — só a resolução da imagem.
- Motivo (CONFIRMADO): as configurações ficam por navegador/domínio (`sb_settings_v1` no localStorage), então um domínio novo (ex.: Netlify) começa com os padrões — qualidade `alta`, resolução automática (até 1,5× os pixels do dispositivo) e FPS sem limite — mais pesado que os ajustes usados em `localhost`. Versões recentes também somaram efeitos (partículas, Susanoo, totens). A simulação não é o gargalo (TESTADO: 1,8 ms/frame com 1.200 inimigos).
- **TESTADO**: testes do governor (descida em carga pesada, recuperação, piso, inativo, teto novo, snap), `tsc -b`, `vite build`, `verify-rules` e smoke no Edge headless com 1.200 inimigos — `autoRatio` caiu de 1 → 0,61 sob carga, sem erros de página.
- **PENDENTE**: validar em GPU real (máquina do usuário) no deploy Netlify. Se ainda estiver baixo: Gráficos → Qualidade `Média`/`Baixa` ou Tela → Resolução `900p`/`720p`.

## Deploy Netlify · 11/11/2026

- O 404 "page not found" do Netlify (CONFIRMADO pelo print do usuário) veio da publicação parcial: o primeiro upload arrastou só o `index.html` raiz sem a pasta `assets/` (drag & drop do Netlify fica instável acima de ~50 MB; o site construído tem ~204 MB / 343 arquivos). Subindo a pasta `dist` (ou um zip com a estrutura `index.html` + `assets/` na raiz) o site carregou — usuário: "acho que deu certo".
- `netlify.toml` existe no projeto (build `npm run build`, public `dist`, SPA fallback) para uso futuro via Git/CLI; o deploy atual é manual, sem conexão com o GitHub.

## Filtro de raridade com as cores do jogo

- O plano de build (aba Itens) ganha botões de raridade coloridos e combináveis: Comum (cinza), Incomum (verde), Raro (azul), Épico (roxo) e Lendário (dourado), com contagem por raridade, "Todas as raridades" e aviso de raridades combinadas. Funciona com a busca e com os filtros de tipo, elemento e atributo; "Limpar filtros" também limpa as raridades. Os itens da lista ganham uma faixa lateral na cor da raridade.
- A Bolsa da Missão passa a usar o mesmo componente (`src/ui/RarityFilter.tsx`), agora combinável (antes era uma raridade por vez).
- Cores centralizadas em `src/rarity.css` (`--rarity-comum` … `--rarity-lendario` e variantes `-strong`), com os mesmos valores já usados no texto de raridade, nos pontos dos cards da Bolsa e nas bordas das cartas de oferta. As classes `rarity-*` expõem `--rarity`/`--rarity-strong`.
- Validado no Edge headless: Raro + Épico no plano (16 + 14 itens), busca combinada, Limpar filtros e Raro + Lendário na Bolsa. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Ultimate por fase e Mega Elites/ajudantes como versões

- **Ultimate por fase**: conferidas as 56 versões; todas têm Ultimate própria desde o Nv. 1 (R manual e Y/AUTO), baseada numa técnica do próprio kit. Corrigidas duas fora de fase: Madara Armadura → Susanoo Perfeito; Might Guy Sétimo Portão → Tigre do Meio-Dia Supremo.
- **Mega Elites e ajudantes como versões**: a versão segue zona e dificuldade (Genin/zona 1 → inicial; Kage/zona 3 → mais avançada), com retrato, kit e buff da versão (buff da família +25% por passo). Sinergias e organizações por família; a equipe não repete família. Asuma ganhou buff de ajudante (Lâminas de Chakra), que faltava.
- Testes: `verify-rules` (Ultimate no kit da fase, mapeamento zona/dificuldade, buffs e sinergias por família) e `verify-runtime` (Kage: Mega Elite Sasuke Shippuden, selamento de Gaara Kazekage, família repetida recusada, Irmãos da Areia com versões).

## Oficina por zona, controles, mercador e emboscadas · 07/11/2026

- Cria a oficina com abas Fundir/Combinar, ícones das técnicas, retrato dos sapos e acesso à ficha. As operações compartilham um uso por zona, consumido após a união válida e persistido no save.
- Torna WASD imediato ao alternar teclas opostas. Reserva Tab para o mapa rápido e permite fechar P com retomada do ponteiro no mesmo comando.
- Fixa os preços do estoque atual do mercador. Compras afetam a cotação de novos estoques. O custo da atualização cresce ao usar.
- Acrescenta suporte por versão e afiliações por fase. Shuriken Amaldiçoada dá +8% dano total com emboscada. O Corpo de Ninja concede um nível após eliminar a onda.
- **TESTADO** — TypeScript, build, regras e 56 verificações no Edge headless. A oficina conserva o bloqueio ao salvar/retomar e renova o uso na próxima zona. Sem exceções JavaScript e sem assets 404. Captura em `artifacts/sages-workshop.png`.
- **PENDENTE** — auditoria visual de todas as ações das 56 versões e balanceamento em partida comum. O teste de desempenho usa renderização por software e não valida FPS em GPU real.



## Dash, Sakura, Gaara, Naruto e perfis locais

- Corrige a orientação do dash para todo o elenco e suaviza as mudanças de direção no WASD.
- Adiciona folhas de ações às três Sakuras, redesenha a cabaça e as ações dos três Gaaras e aplica o selo cruzado às quatro versões de Naruto nos golpes Bunshin.
- Adiciona perfis locais com Guest numerado e cadastro que preserva o progresso no mesmo navegador.

## Folhas direcionais de ação para o elenco com Susanoo

- Adiciona cinco folhas 4×4 de conjuração, pulo e dash em frente e costas para Sasuke Rinnegan, Itachi Akatsuki e Madara Armadura, Rinnegan e Seis Caminhos. O controlador compartilhado seleciona as poses pela versão em jogo. As 80 células, direções e poses foram conferidas no Edge headless; build e suítes de regras e runtime passaram.

## Calibração com referência pública

- Adiciona a calibração com o jogo de referência (level-up, pílulas, melhorias permanentes, chefes, Survival e economia) ao lado das constantes atuais e de propostas. Nenhum valor de jogo mudou; as propostas aguardam o usuário. (Documento arquivado fora do projeto)

## Pílulas com atributo atual → novo, pergaminhos por elemento e listas de itens em casa

- Pílulas mostram o atributo do personagem com o valor atual e o novo: nas cartas de level-up ("Seu atributo"), na ficha (P, "Próximo nível"), no plano de build (aba Pílulas, no Nv. 1 do shinobi) e no tooltip da barra de pílulas. Prévia em `src/game/pillPreview.ts`, com as mesmas regras de `calculateStats` (tetos de evasão e status, % de HP e multiplicador de regeneração).
- Pergaminhos de elemento (Katon, Suiton, Fuuton etc.) listam em "Melhora:" só as técnicas do mesmo elemento. O +3% de dano total não é mais listado por técnica. Sem técnica daquele elemento, a carta diz "Nenhuma técnica de Fogo aprendida ainda."
- Bolsa da Missão ganha a sub-aba "Itens em casa": até 12 listas salvas com nome, descrição e ícones, com Nova lista (bolsa atual ou vazia), Aplicar, Em uso, Duplicar e Apagar (com confirmação). Substitui as 4 predefinições fixas e mantém a chave `sb_bag_presets_v1`; saves antigos com vagas vazias são convertidos ao abrir.
- Validado no Edge headless: lista antiga convertida, criar/nomear/descrever/duplicar/aplicar/apagar e persistência após recarregar; carta de pílula, ficha, plano e barra com atual → novo; Katon e Suiton sem técnica do elemento. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Versões separadas do elenco, pulo/dash do Naruto Academia e kunais do guardião

- **Versões separadas**: as 56 formas viraram personagens jogáveis próprios (24 famílias), com kit da fase, passiva e atributos próprios (versões avançadas +12% de HP/dano por passo, +1 armadura, passivas mais fortes). Ex.: Naruto Academia → Genin → Shippuden → Kyuubi. A versão não muda de forma dentro da run. Rasengan e Byakugou viraram técnicas compartilhadas; 25 técnicas novas únicas por família (Rendan Uzumaki, Rasenshuriken, Bijūdama, Espada Chidori, Flecha de Indra, Limbo, 128 Palmas…). Total: 97 técnicas.
- **Cadeia de missões**: cada versão nova (`VERSION_MISSIONS`, campo `playWith`) só aparece para selar jogando com a versão anterior, no mapa/dificuldade da missão, depois dos abates e minutos. Cada passo é mais difícil que o anterior. O card mostra "MISSÃO DE VERSÃO" e o passo "Jogar com …"; o retrato do pré-requisito agora aparece no círculo.
- **Saves**: o id base é a primeira versão (`naruto` = Naruto Academia); `sb_hero`, desbloqueados, selados e run salva seguem válidos sem migração.
- **Pulo/dash do Naruto Academia**: a folha acrobática já existia; o estado de dano (0,23 s a cada golpe) tinha prioridade sobre pulo e dash e escondia os quadros no meio da horda. Agora pulo e dash vêm primeiro, com squash/stretch no pulo e rastro de duas cópias no dash.
- **Kunais do guardião**: as kunais grátis (1 + planos do Shikamaru) caíam em cima do portal; o E checava o portal primeiro, entrava nele e `clearZone` apagava as restantes. Agora caem num círculo de 3,4 m, a coleta próxima tem prioridade e o portal avisa enquanto houver kunai grátis no chão.
- Verificação: `tsc`, `vite build`, `verify-rules` (56 versões, cadeia, únicas por família) e `verify-runtime` (pulo/dash com dano, Naruto Genin com Gamabunta, 3 kunais coletadas antes do portal, missão de versão só com o Academia) passaram.

## Final Swarm crescente, pílulas só por escolha e altares por raridade

- **Final Swarm**: o teto do swarm era cortado em 1.600 (já atingido aos 10 min), então a horda não triplicava; com build forte, o spawn ×3 perdia para o abate e a horda estabilizava perto de 300. Agora o teto é 1.600 × fator do swarm (×3, +25%/min) até `FINAL_SWARM.maxEnemies` = 8.000, o spawn repõe o teto em ~4 s (`refillSeconds`), até 120 por quadro, e os inimigos do swarm nascem a 14–28 m. Medido no Edge headless: +1 min → 6.094 vivos; +3 min → 8.000; matando tudo a cada 2 s a horda volta a ~1.800–2.000.
- **Pílulas sem escolha**: a única fonte é a carta do level-up, mas com níveis em fila o novo conjunto de cartas surgia sob o cursor e o clique/duplo clique ou tecla 1–9 dado na tela anterior pegava a carta nova (muitas vezes pílula). Cada conjunto novo agora ignora clique e teclas por 0,5 s (`CHOICE_GUARD`). Teste: 6 aberturas com clique + tecla imediatos → 0 escolhas; duplo clique com níveis em fila → exatamente 1 escolha (sem a proteção: 6 escolhas involuntárias e um duplo clique que pegou 2).
- **Altares por raridade**: pisar no círculo começa a contar, sem E; fora do círculo a porcentagem cai, mais rápido quanto mais raro (Normal 4%/s … Lendário 18%/s), com progresso por altar e círculo vermelho fora (`ALTAR_RULES`).

## Alinhamento do HUD e Ryu em formato curto

- Barra da missão em blocos: missão e clima/zona à esquerda, relógio grande (ou "FINAL SWARM +m:ss") no centro, Ryu curto e kunai/shuriken à direita. Os preços de kunai, shuriken, mercador e roleta ficam numa linha secundária menor. Novo `src/hud-layout.css`, importado por último.
- Minimapa: marcadores e pontos de inimigo ficam dentro do círculo, sem corte na borda. Rótulo "Tab rápido · M mapa" sob o círculo. O selo DEBUG e o painel descem para baixo do rótulo e acompanham a escala do HUD/minimapa.
- Painel SINERGIAS recolhível pelo título, com estado salvo no navegador. O título das tags de sinergia nos cartões deixa de mostrar "[object Object]".
- Contador de quantidade dos itens com fundo escuro e fonte maior. A grade de itens já estava limitada a 3 linhas com rolagem, e os cartões de ajudante já ficavam compactos com 4 ou mais.
- Ryu em formato curto (`compactNumber`) nos preços da barra, na Roleta da Tsunade (valor exato no tooltip), no diálogo do mercador/prêmio e nos avisos de venda, Ichiraku, roleta e kunai pagas.
- A fala sintetizada ignora navegadores sem `speechSynthesis` em vez de lançar erro.
- Validado no Edge headless em 1440×900 e 1366×768 com 5 ajudantes, 80 itens, nível 194 e 123,5M Ryu. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Combate, animação e preparação da missão

- HUD de escolhas e ficha compactados. Botão da ficha em escolhas, selamento e troca de suporte. Tab mantém o mapa rápido aberto sem interromper o movimento. Kunai direcional no mapa, ícone próprio do Selo do Guardião e câmera/zoom interpolados.
- Trava do ponteiro durante a missão, com kunai de interface e liberação por Esc, perda de foco e F9. Escolher um prêmio recaptura o ponteiro diretamente.
- Teuchi na frente da barraca e retrato ao abrir o atendimento. Fukasaku e Shima sobre Gamakichi abrem fusão e combinação. Retratos dos NPCs aparecem junto das escolhas.
- Planejamento de técnicas por shinobi, teto de 60% de exclusão, restauração destacada, treinamento de até quatro técnicas com +15% de dano e pílulas disponíveis no pool. Ícones do atlas, Modo Sábio por personagem e prévias animadas com alvos.
- Genin abre com menos inimigos e HP comum menor. Sorte pesa 20% na abertura e chega a 100% em 2:30. Quatro a seis encontros de Mega Elite previstos por zona e até dois encontros de conta elegíveis. Chefes com HP numérico, mais defesa, técnicas mais frequentes e áreas maiores.
- Folhas novas de Naruto Academia, Neji nas duas formas e inimigos comuns. Suportes seguem, saltam, esquivam e alternam técnicas. O Totem mantém o selo de mãos. Clones correm até o alvo. Substituição usa um toco no impacto. Gamabunta usa óleo e ignição perto do alvo, com espada e cachimbo.
- Ultimate recebe os bônus de dano, com modificadores de projétil apenas em Naruto, Minato e Tenten. Tenten ganha ×1,5 em técnicas neutras ou de projétil. Lamen de cura em até 5%. Reset de conta exige confirmação e limpa o progresso local.

## Efeitos das técnicas, bijū e filtros da Bolsa

- Adiciona efeitos visuais por natureza e golpes característicos com impacto no alvo. Dragão de Água, Chidori, Rasengan, Mokuton, areia e invocações têm visuais próprios.
- Redesenha Chōmei e Gyūki com as duas referências do usuário e liga as texturas à arena. As demais bijū continuam no atlas.
- Acrescenta botões de raridade à Bolsa da Missão, combináveis com busca e estado do item.

## Ações, ofertas e interface da missão

- Adiciona conjuração do Naruto Clássico, arremesso/pulo/dash do Sasuke inicial e socos e chutes nas três formas de Rock Lee e Might Guy.
- Cada pílula ganha um nível por carta. Raridade aumenta a potência. Inclui Pílula de Incenso e confirma a Pílula do Pergaminho como fonte de experiência.
- Banimento exclui o mesmo nome em qualquer nível e raridade. O clique identifica a carta exibida para evitar selecionar um índice antigo.
- Adiciona confirmação de desistência na pausa, botão Ir para o menu no resumo, dock de pílulas compacto sem faixa e símbolo das bijū no portal da arena.
- Oculta o cursor no cenário durante a partida, mantém a velocidade durante a transição para diagonais e melhora o apoio e a visibilidade perto das estátuas.

## Caminhada direcional de todo o elenco

- Adiciona folhas direcionais às 45 formas dos 20 shinobis restantes. O elenco de 24 shinobis passa a ter 56 formas com caminhada por quadros, baseada na arte de repouso de cada forma.
- O jogo escolhe a dupla de fileiras da forma ativa e espelha o movimento para a esquerda. A pose parada conserva o sprite estático.

## Folhas do Time 7, terreno e regras de oferta

- Integra folhas direcionais de caminhada ao Naruto Clássico, Shippuden e Manto da Kyuubi, e às três formas de Sasuke e Sakura. As folhas de Sasuke e Sakura seguem a arte estática de cada forma. A Sakura inicial mantém o cabelo longo, traje da Academia e cores ao começar a caminhar.
- Girar e inclinar a câmera passou a ser pelo movimento do mouse, com clique direito para fixar alvo. O terreno ganha montanhas externas e elevações internas, com céu em gradiente conforme o clima.
- Pílulas e técnicas aparecem como escolhas apenas na subida de nível. A roleta mantém sua economia e penalidades, mas o prêmio de equipamento só vem como item. A roleta e as recompensas do mapa deixam de conceder pílulas. A fila de itens preserva a opção de aceitar ou vender.
- O número de ofertas fica limitado a quatro mesmo quando Sorte, passiva permanente e banimento se combinam.
- Build, regras e 29 verificações no navegador passaram. A captura em ângulo baixo registra o terreno visível até o rodapé e o shinobi em foco na Vila da Folha.

## Animações do elenco e correções de partida

- Asuma ganha atlas original 4×4. O retrato usa a célula de repouso e a partida usa quadros de caminhada, salto, dash, dano, selo, lâminas e Ultimate.
- Os 24 shinobis jogáveis e suas formas usam poses de movimento e combate a partir do próprio sprite. Naruto Academia mantém suas folhas dedicadas. As formas sem folha dedicada usam deformação localizada dos braços e pernas.
- Prêmios de item e pílula da Tsunade entram numa fila salva na partida. Pílulas encontradas no chão também pedem confirmação. E aceita e V vende a recompensa exibida.
- Sinergias contam ajudantes recrutados que tenham o mesmo ID do jogador. O personagem controlado fica fora da contagem.
- O HUD mostra o total real de inimigos vivos. A horda escala até 1.600 e o mapa limita apenas seus marcadores. A câmera volta a inclinar até aproximadamente 7°.
- Adiciona o registro contínuo de pedidos e respostas em `docs/14-CONTEXTO-DO-CHAT.md`, integrado à skill de documentação.
- Validação no navegador com 28 verificações, incluindo Asuma, ordem dos prêmios e contagem de 1.600 inimigos.

## 2026-11-06 — Asuma (teste da skill de arte)
- Asuma Sarutobi jogável e liberado desde o início (`STARTER_HEROES`): Lâminas de Chakra (Vento, Cone) e Cinzas Ardentes (Fogo, Área) como únicas, Kunai Tática e Grande Vendaval compartilhadas; naturezas Vento/Fogo; sprite pixel art por código (`asuma-1.svg`). PROPOSTO para revisão de arte no padrão do atlas (Codex).

## 2026-11-06 — falas de técnicas sem spam
- `sfx.ts`: técnicas comuns falam no máximo 1 vez a cada 60 s por técnica e 15 s entre falas (`VOICE_RULES`); a Ultimate sempre fala. Antes o Kage Bunshin (técnica inicial do Naruto) repetia a fala a cada 6,5 s.

## 2026-11-06 — HUD: cartões de ajudante compactos
- Com 4+ ajudantes os cartões ficam compactos e a coluna termina antes do dock de técnicas/pílulas, com rolagem (`allies.css`).

## 2026-11-06 — Ryu em formato curto
- `src/game/format.ts` (`compactNumber`): Ryu do HUD em formato curto (1,2 mil · 2,0M · 5,0B · 3,0T; acima disso notação científica), valor exato no tooltip.

## 2026-11-06 — técnicas por fase, escala/Final Swarm, pílulas com raridade, sorte, roleta e economia exponencial
- **Técnicas por fase da obra** (`PHASE_LEVELS` em heroes.ts): Naruto começa com Kage Bunshin; **Invocação do Sapo** (compartilhada com Jiraiya; Kuchiyose: Yatai Kuzushi, Neutro, Área, atordoa) no Nv. 10; Rasengan Nv. 15; Modo Sábio Nv. 25. Revisão por estreia na Narutopedia em Sasuke, Sakura, Itachi, Minato, Tsunade, Jiraiya, Lee, Neji, Hinata e Shikamaru. 70 técnicas.
- **Itens só por interação**: removido o drop de item por abate (era a origem dos itens no nível máximo; a emboscada só aumentava os abates). Nível máximo dá só Treino.
- **Pílulas**: raridade pela Sorte (Comum 1 nível … Lendário 5); pílula no limite não aparece em cartas, drops nem roleta; tudo no máximo vira Treino.
- **Sorte**: `rollItems` sorteia a raridade e depois o item (antes caía em Comum quando a raridade não tinha item desbloqueado); Comum cai mais rápido com a Sorte.
- **Horda e escala**: spawn em lote (`SPAWN_RULES`), tempo total da run para a ameaça, teto até 1600, HP ×(1+0,3·min)·1,15^min; técnicas ganham +30% a +250% de dano por level-up.
- **Final Swarm**: ao zerar o tempo, aviso, relógio "+m:ss" de sobrevivência e dificuldade ×3 crescendo +25% por minuto (`FINAL_SWARM`).
- **Roleta**: nerf 2 (boas ~35% com Sorte 0), porcentagens exibidas = sorteio real, entrega total verificada, ícones do atlas novo.
- **Economia exponencial**: kunai/shuriken 20×1,5^usos, roleta 30×1,35^giros, mercador ×1,35, tudo ×1,15 por minuto de run (`PRICE_INFLATION`); kunai chega a milhões no late game.
- Verificação: tsc, verify-rules e verify-runtime (24 checks) passaram nos subagentes.

## 2026-11-06 — roleta nerfada e corrigida, sorte recalibrada
- **Roleta da Tsunade — entrega corrigida**: bênçãos iguais agora acumulam (até 3×) em vez de se sobrescrever; pílula que chega no limite vira Ryu; item que já está no limite vira Ryu em vez de travar a escolha.
- **Roleta — nerf**: giro 30 Ryu +10 por giro; casas boas reduzidas (kunai/shuriken/pílula 9, Ryu 7, bênção 6, item 4, Sorte Grande 1) e ruins/vazia aumentadas (dívida 12, azar 10, credores 9, vazia 17). Boas: Sorte 0 = 48% (antes 63%), Sorte 200 = 77%.
- **Sorte**: curva de raridade bem mais sensível (raro ou melhor: Sorte 0 ≈ 0,7%, 20 ≈ 6%, 50 ≈ 15%, 100 ≈ 26%); chance de +1 carta nas ofertas (Sorte/150, até 60%); drop de pílula ×(1 + Sorte/100) e de item ×(1 + Sorte/150).

## 2026-11-06 — escala dos inimigos e hordas
- `difficultyAt` (`progression.ts`): HP dos inimigos ×1,10 por minuto e dano ×1,05 por minuto (além do crescimento linear), resistência a dano de +1,5% por minuto até 60% (`armor`, somada à defesa do tier), teto de inimigos até 1400 e spawn mais rápido (mín. 0,03 s). Constantes em `ENEMY_SCALING`. Ex. Genin: 10 min = HP ×8,3, 320 inimigos; 30 min = HP ×133, 1400 inimigos, 45% de resistência.
- Crescimento por nível do shinobi segue linear (+3%): o nível passa de 1000 (referência do jogo de referência); o dano massivo deve vir de técnicas, projéteis, críticos e itens.

## 2026-11-06 — elemento base e bônus de natureza
- Shinobis aprendem só Neutro + elemento base (afinidade) + elementos do próprio kit (+ Sábio para usuários do Modo Sábio); o Naruto deixa de aprender todos os elementos.
- Técnicas do elemento base causam ×1,5 de dano (`NATURE_BONUS` em `heroes.ts`, aplicado em `itemDamageBonus`); o Plano de build mostra o bônus.

## 2026-11-06 — técnicas básicas da Academia
- `ACADEMY` em `heroes.ts`: sempre no pool, liberadas cedo, dano baixo, melhoram no level-up. Para todos: Técnica de Substituição (Nv. 2, ao redor, atordoa), Chute Giratório (Nv. 2), Bomba de Fumaça (Nv. 3, lentidão). Por natureza: Katon: Fagulha, Suiton: Jato d'Água, Fuuton: Rajada (Nv. 3), Doton: Pedregulho, Raiton: Faísca (Nv. 4). Lee e Tenten (sem natureza) só recebem as neutras. Plano de build mostra "Básica da Academia" (sem exigir pesquisa).
- Verificação: tsc, verify-rules e verify-runtime passaram.

## 2026-11-06 — técnicas liberadas por nível na fase certa
- Modo Sábio do Naruto só no nível 25 (forma Shippuden); Amaterasu do Sasuke no nível 25. O painel do shinobi mostra o nível de liberação de cada técnica do kit (Nv. 1/5/12/20 por padrão, com ajustes por personagem).

## 2026-11-06 — alvo fixo, ordem do elenco e card de missão
- **Alvo fixo**: clique com o botão direito (sem arrastar) fixa o alvo com prioridade guardião > Mega Elite/Shinobi para selar > elite > maior HP entre os visíveis até 30 m; anel vermelho no alvo; as técnicas miram nele quando está no alcance; clicar de novo solta. Arrastar continua girando a câmera.
- **Elenco ordenado**: jogáveis primeiro; bloqueados por dificuldade da missão (Genin → Kage) e Lendários por último.
- **Card de missão** em camada fixa por cima da grade (antes ficava atrás dos outros cards).

## 2026-11-06 — Kushina, missões com história e abates, mapas em sequência, pausa corrigida
- **Kushina Uzumaki** (Narutopedia: Vento/Água/Yin, Clã Uzumaki, Correntes de Selamento Adamantinas, Habanero Sangrenta): 2 únicas (Correntes de Selamento, linha que paralisa; Habanero Sangrento, setup), kit com Kunai Tática e Dragão de Água, Ultimate Prisão de Correntes da Kurama, buff de ajudante Correntes Adamantinas, sprite pixel art SVG e nova sinergia Clã Uzumaki. Missão: Folha · Jonin · 500 abates · 5 min, depois de selar Minato.
- **Missões de desbloqueio** com requisitos de **história** (ex.: Neji só depois da Hinata, Hashirama depois da Tsunade, Tobirama depois do Hashirama, Madara depois do Hashirama e Itachi) e **abates na run**. Novo card de missão (história, onde jogar, checklist) no hover da seleção, no painel do shinobi bloqueado e na tela do mapa.
- **Mapas em sequência**: Areia só após vencer o Genin da Folha, Pedra após o Genin da Areia, Névoa após o Genin da Pedra; dificuldades seguem por mapa.
- **Pausa**: barra de comandos e botões fixa no rodapé da tela (antes era cortada); texto de teclas da ficha oculto na pausa.
- **Direção de arte** registrada no AGENTS.md.
- Verificação: tsc, build, verify-rules (23 shinobis, 69 técnicas) e verify-runtime passaram; teste de navegador da pausa, seleção e mapa.

## 2026-11-06 — tela Escolha o mapa
- `src/ui/MapSelect.tsx` + `src/map-select.css`: abas dos 4 mapas com progresso, prévia grande da região (selos de elemento, descrição, climas, shinobi escolhido com Trocar, shinobis para selar no mapa, guardiões por zona) e painel Preparar partida (modo Clássico; Sobrevivência em breve; dificuldades com multiplicadores e cadeados; build selecionada; mochila em breve; Bolsa da Missão com predefinições; Começar com Enter).
- verify-runtime passa a iniciar pelo botão Começar.

## 2026-11-06 — Configurações completas
- Tela de Configurações no formato da referência (Som, Gráficos, Tela, Controles, Teclas, Interface, Idioma, Conta), salva na hora e aplicada ao vivo: volume/efeitos/vozes, qualidade, limite de FPS, resolução, tela cheia, sensibilidade e inversão da câmera, distância da câmera, teclas remapeáveis, tamanho/opacidade do HUD, minimapa, avisos, nome do jogador e reinício/apagar dados. Itens sem suporte aparecem como "em breve".
- Verificação: tsc, build, verify-rules e verify-runtime passaram.

## 2026-11-06 — 4 mapas, missões de desbloqueio, Lendários, pausa no Esc e salvar/retomar
- **Pool de técnicas**: só o kit no começo; técnicas de outros (inclusive Naruto/Sasuke/Sakura) entram só depois de selá-los.
- **Mapas**: Folha, Areia, Pedra e Névoa Oculta, com tema, clima, cenário, zonas e guardiões próprios; Chunin/Jonin/Kage liberam ao vencer a dificuldade anterior em cada mapa.
- **Missões de desbloqueio** para os 19 shinobis bloqueados (mapa + dificuldade + minuto); **Lendários** Madara e Hashirama com retrato oculto. Seleção mostra silhueta com símbolo da vila e a missão ao passar o mouse.
- **Esc**: ficha com rodapé de comandos e ações (Desistir, Salvar e sair, Reiniciar, Mapa grande, Tela cheia, Preso, Mapa, Configurações, Relatar, Continuar); ajuda removida do HUD.
- **Salvar e retomar** a run (manual, automático a cada 15 s e ao fechar).
- Verificação: tsc, verify-rules, verify-runtime e teste de navegador (19 bloqueados, tooltip do Lendário, 4 mapas, 3 dificuldades bloqueadas, pausa, salvar e retomar no mapa da Areia).

## 2026-11-06 — técnicas únicas, selamento de conta, tipos de inimigo, debug completo e ímã de drops
- **Técnicas**: 1–2 únicas por shinobi + 26 compartilhadas (67 no total; duplicatas removidas). Pool por vila/elemento canônico; únicas de outros só após selar o dono. Plano de build mostra a origem e exige 100% de **pesquisa** (nova passiva Pesquisa).
- **Conta**: iniciais Naruto/Sasuke/Sakura; os demais 🔒 até selar o **Shinobi para selar** (contorno ciano, 1º encontro especial da run), que só desbloqueia na conta.
- **Inimigos**: **elite amarelo** (contorno, não capturável, mais forte e resistente, mais saque), **Mega Elite** (contorno vermelho, capturável como ajudante, sem técnicas, muito mais saque). Saque escala com HP e dificuldade.
- **Debug**: 41 parâmetros (todos os atributos do personagem, elites, EXP/curva, Ryu, Chakra, lamen, kunais no chão, preço da kunai) como base Genin; dificuldades multiplicam por cima.
- **Drops**: coleta por ímã dentro da área de coleta, teto de 260 com fusão, materiais compartilhados; kunai/shuriken no chão com sprites desenhados.
- **Mapa**: inimigos no mapa só quando visíveis na câmera; câmera inclina mais (pitch 0,08) e descoberta até 60 m.
- **Arsenal da Tenten** substitui o Sharingan de Kakashi (cópia de item).
- Verificação: tsc, build, verify-rules (asserts das regras de técnica) e verify-runtime passaram; teste de navegador para elite, Shinobi para selar (desbloqueou Kakashi), kunai e debug.

## 2026-11-06 — Passivas Shinobi, Bolsa da Missão, mapa com rota, drops novos e cores de ganho/perda
- **Passivas Shinobi** (antiga Progressão): 24 nós em Treinamento/Equipe da partida; novos Chakra Curativo, Expansão, Farmacologia Ninja, Selo de Ressurreição, Baú do Clã, Meditação de Chakra, Bolsa Grande e **Treinamento com Jiraiya** (técnicas favoritas aparecem mais). Pesquisa PENDENTE.
- **Bolsa da Missão**: abas, busca, capacidade em casa, prioridade ★, predefinições 1–4 e hudzinho. "Arquivar" virou **Deixar em casa**; itens em casa não entram no pool.
- **Mapa M/Tab**: ícones e retratos do que foi visto, rota por clique ou ping, seta e metros na HUD, "Chegou!" e limpeza automática.
- **Drops com sprites próprios**: XP = essência roxa (8/25/100, tamanho por tier), Chakra = orbe azul, Ryu = moeda 両, pílula e pergaminho; nova **tigela de lamen** (15% por abate) que cura 35% do HP. Invariante de cores atualizada no AGENTS.md.
- **Cores**: ganhos em verde e perdas em vermelho nos cards (BuffText).
- **Terminologia**: "cadência" virou **velocidade de ataque** em todo o jogo e nos docs.
- **Pain = Nagato** (Clã Uzumaki) controlando o corpo do Yahiko (sem clã), conforme a Narutopedia. Ebisu e Iruka ganharam sprites pixel art no estilo do elenco.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram; testes de navegador à parte para Passivas/Bolsa/Jiraiya, mapa/rota, sprites dos NPCs e drops (lamen curou 20 → 49,75 de 85 HP).

## 2026-11-06 — elementos corrigidos pela Narutopedia
- `HERO_NATURES` com as naturezas canônicas dos 22 shinobis (Narutopedia, Nature Type); `heroAffinity` passa a usar a afinidade marcada na wiki ou a primeira natureza canônica do kit, em vez de contar elementos do kit.
- Técnicas sem natureza canônica viraram Neutro: Furacão da Folha, Palma de Ar, Palma do Vazio, Kunai Explosiva, Tigre do Meio-Dia, Bansho Tenin, Kuroari, Chuva Venenosa. Pain ganhou Clã Uzumaki.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram.

## 2026-11-06 — combos de aldeia, afinidade de ajudantes, substituição e Roleta da Tsunade
- **Combos de aldeia/organização** (`synergy.ts` reescrito): contam só ajudantes; faixas 2/3/4/5 por aldeia com família de atributo própria (Folha projétil/XP/coleta, Nuvem dano, Névoa crítico, Pedra armadura/HP, Areia área, Som cadência, Chuva status, Cachoeira cura, Grama Ultimate); nenhum combo junta dano % e projétil. Organizações acumulam (Akatsuki, Sannin, Hokages, Time 7, Time Guy, clãs, Ino-Shika-Chō, Time 8, Sete Espadachins).
- **Afinidade de ajudante** 1–5: sobe com tempo e abates; a passiva individual escala de 40% a 100%. Projétil fracionário vira chance (`projectileChance`).
- **Equipe cheia → tela de substituição** (choiceLevel −7): clicar no novo dispensa; clicar num atual substitui.
- **Configurações** no hub (`settings.ts`): desligar card/animação de captura.
- **Roleta da Tsunade** substitui o Caça-níquel e absorve a Bênção de Tsunade: overlay animado, casas boas e ruins, giro rápido segurando E (liga/desliga), E repetido mostra o resultado na hora, prêmios entregues ao sair, custo 25 +5 por giro, Sorte melhora as chances com piso de 15% de casas ruins e a dificuldade compensa.
- **Item novo**: Carteira Gama-chan (Raro): +12% Ryu, −6% custo da roleta, +1% dano a cada 250 Ryu gastos (até +30%).
- **Verificação**: tsc, vite build, verify-rules (94 itens) e verify-runtime passaram; testes de navegador à parte para combos, afinidade, configuração, substituição e roleta (inclusive estatística). Balanceamento PENDENTE.

## 2026-11-06 — velocidade de projétil, setups, Senjutsu, Ebisu, Iruka e Naruto Totem
- **Cadência** revisada: também acelera os ajudantes (metade do bônus) e os procs periódicos de item.
- **Velocidade de projétil** (atributo novo): acelera a viagem dos projéteis e o preparo dos golpes e lançamentos. Itens novos: Lente do Atirador e Seixo Polido do Rio (com ricochete); pílula nova: Pílula do Arremesso. Itens de pulo/deslize ficam PENDENTES.
- **Técnicas de setup** (buff puro, automáticas): Portões do Inferno (Lee), Portão da Dor (Guy), Byakugou (Tsunade), Modo Sábio (Naruto, Jiraiya). Cards mostram recarga, duração, bônus, % do tempo ativo e acumulável. A Ultimate da Tsunade virou Invocação de Katsuyu.
- **Modo Sábio**: elemento Sábio e taijutsu corpo a corpo em área. **Linha Senjutsu** em ninjutsu: 25% de chance de um extra de 1,5× o dano.
- **Eventos**: Ebisu (troca: ganho × 1,1 de custo), Iruka (lição grátis, pergaminho lendário com −20% de custo, ou Iruka como ajudante de +25% XP) e Naruto Totem (7:00–6:00, clones dão XP, totem dá 2 níveis, não selável).
- **Fonte canônica**: Naruto Wiki/Narutopedia, registrada no AGENTS.md.
- **Verificação**: tsc, vite build, verify-rules (93 itens) e verify-runtime passaram; testes de navegador à parte para velocidade, setups, Modo Sábio, Senjutsu e os três eventos. Balanceamento PENDENTE.

## 2026-11-06 — sinergias, seleção com filtros e guardião invocável
- **Sinergias de vila e organização** (`src/game/synergy.ts`): ativam com 2+ membros (herói + ajudantes, ao menos 1 ajudante), faixas 2/3/4+, acumulam vila + organizações (ex.: Akatsuki). Substituem a antiga sinergia fixa da Areia (Irmãos da Areia completos mantêm +12 armadura/+15% dano). Painel "SINERGIAS" abaixo do card do herói; cartões de ajudante mostram a PASSIVA individual e as tags das sinergias. Dados de clã/organização/afinidade em `heroes.ts` (`HERO_CLAN`, `ORGANIZATIONS`, `heroOrganizations`, `heroAffinity`).
- **Seleção de shinobi** (`src/ui/CharacterSelect.tsx`): grade de retratos com selo de elemento; filtros por vila, elemento, organização/clã e busca; contagem "X de 22".
- **Guardião invocável**: Selo do guardião (E) invoca o guardião da zona quando o jogador quiser; HP × (0,6 + 0,4 × segundos na zona ÷ 160). Continua surgindo sozinho aos 160 s se não for invocado.
- **Plano do Shikamaru** substitui a Provocação do guardião (ex-nome do jogo de referência): +1 kunai por acionamento ao derrotar o guardião, limite 3 por zona, sem penalidade de dificuldade/saque. Nenhuma referência a esse jogo resta em `src/`.
- **Verificação**: tsc, vite build, verify-rules (com asserts de sinergia) e verify-runtime (24 checks) passaram; testes de navegador à parte para sinergias, filtros (desktop e 375px) e guardião/Shikamaru. Balanceamento PENDENTE.

## 2026-11-05 — catálogo de 91 itens no formato da referência
- **Catálogo:** `src/game/catalog.ts` foi refeito com 91 itens (25 comuns, 27 incomuns, 15 raros, 14 épicos, 10 lendários) seguindo o formato da página de itens da wiki: raridade, efeito, gatilho e limite. Os nomes são ninjas, os valores foram levemente alterados e nada lembra o jogo de referência.
- **Itens pedidos:** Pergaminho do Monte Myoboku (+28% Sábio) e Pergaminho Genjutsu (+28% Genjutsu), no molde dos pergaminhos de elemento (Katon, Suiton, Fuuton, Doton, Raiton, Mokuton, Areia, Sombra, Neutro).
- **Mecânicas novas na simulação** (`GameCanvas.tsx`, via `Stats.extra`):
  - dano por elemento e Genjutsu, dano condicional e gatilhos por acerto;
  - roubo de vida, espinhos, escudo, fumaça, gelo ao ser atingido;
  - curas (emergência, periódica, por abate) e ressurreição;
  - adrenalina, postura parada e reset da Ultimate;
  - raios e Amaterasu automáticos;
  - descontos de kunai e caça-níquel, quantidade de inimigos e limites de pílula (12) e técnica (11).
  - Todo dano recebido agora passa por `damagePlayer`.
- **Filtros:** `combat.ts` classifica as chaves novas (filtros da loja e o "Melhora:" das cartas).
- **Itens removidos ou trocados:** Insígnia do Comandante, Tambor de Guerra e Selo de Cooperação saíram. O Estandarte da Aliança agora é raro com +40%. A Bandana dá +6 de armadura. A Pedra da Juventude dá +15% de XP.
- **Testes:** `verify-rules.mjs` foi atualizado (≥80 itens, ids únicos, itens pedidos, Selo Amaldiçoado, Fúria da Kyuubi, Genjutsu, gatilhos).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - Pergaminho Fuuton deu ×1,318 no Rasengan;
    - Genjutsu numa técnica de Ninjutsu deu só +3%;
    - Raiz Vampira curou de 20 para 54 de HP;
    - o Escudo bloqueou o 1º golpe;
    - a Ressurreição voltou com 35%;
    - o Chidori Nagashi causou dano sozinho;
    - a pílula chegou ao nível 12;
    - a kunai caiu de 20 para 12 com 5 Pepitas;
    - a loja mostra 91 itens e o filtro Sábio funciona.
- **Não testado:** balanceamento e cada um dos 91 itens individualmente em jogo.

## 2026-11-05 — buff único de cada ajudante
- **Buffs:** novo `src/game/allies.ts` com um buff passivo para cada um dos 22 shinobis (tabela em `docs/03`).
  - Médicos curam (Tsunade +1,5 HP/s, Sakura +1, Hashirama +1,2).
  - Os demais dão o atributo do estilo deles (Naruto +12% dano, Gaara +10 armadura, Neji +30% dano crítico, Tenten +1 projétil...).
- **Na simulação:** os buffs entram em `calculateStats` via `refreshStats` e escalam com a força de suporte. A regeneração genérica de +0,3 HP/s por aliado saiu.
- **Itens:** Estandarte da Aliança e Selo de Cooperação agora reforçam os buffs dos ajudantes; o texto foi atualizado.
- **Cartões:** cada cartão de ajudante mostra o buff real com o valor efetivo.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram, e os testes avulsos anteriores também.
  - Teste novo:
    - os 22 têm buff;
    - os buffs somam e escalam;
    - recrutar Tsunade, Gaara e Tenten deu +1,5 HP/s, +10 armadura e +1 projétil;
    - com o Estandarte, a cura vira +1,8 HP/s e os cartões mostram esses valores.
- **Não testado:** balanceamento em runs completas.

## 2026-11-05 — cartões de ajudantes e Barraca Ichiraku
- **Cartões de ajudantes:**
  - Novos `src/ui/AllyCards.tsx` e `src/allies.css`; a linha de texto "Suportes …" foi substituída por cartões no padrão da referência do usuário.
  - Cada cartão tem: retrato redondo com moldura na cor da técnica, nome, selo da aldeia ou SINERGIA, buff real (regeneração e bônus da Areia), técnica com barra de recarga, elemento, escola, % de dano e intervalo.
  - O snapshot ganhou `allyCharge`.
- **Barraca Ichiraku:**
  - Novo evento no mapa com o sprite da barraca de lámen.
  - Esquecer uma pílula (todos os níveis) ou uma técnica custa 10 + 5 × nível em Ryu, quantas vezes quiser. A última técnica é protegida.
  - Os atributos são recalculados a partir das fontes.
  - A tela é própria ("ESQUECER", "Sair da barraca").
- **Caça-níquel:** saiu "do Ichiraku" do nome e o sprite da barraca passou a ser da Barraca Ichiraku.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Os testes avulsos do Kakashi, dos chefes e do debug continuaram passando.
  - Teste novo no navegador:
    - 3 cartões com SINERGIA, sem cobrir o herói nem as habilidades;
    - Ichiraku recusa com Ryu insuficiente;
    - esquecer a Pílula do Soldado por 20 Ryu baixou o Taijutsu de 120% para 100%;
    - esquecer Kage Bunshin por 15 Ryu;
    - a barraca fechou e não reabriu com só a última técnica.
- **Não testado:** 5 ajudantes ao mesmo tempo em telas pequenas; balanceamento do preço.

## 2026-11-05 — Kakashi interativo copia item da bolsa
- **Novo evento "Sharingan de Kakashi":** NPC com sprite do Kakashi. Ao apertar E, o jogador escolhe 1 item que já carrega e ganha +1 cópia, até o limite do item. Pode ser usado uma vez por zona.
- **Tela da escolha:** própria ("Copiar um item da bolsa"), com selo "CÓPIA", sem Atualizar/Banir. "Cancelar (X)" fecha sem gastar o Kakashi nem os usos de pular. Itens já no limite não aparecem; com a bolsa vazia, só aparece um aviso.
- **Escolha de cartas em geral:**
  - O clique usa o evento `shinobi-choose` (índice) e funciona com qualquer número de cartas; o teclado aceita 1–9.
  - Com mais de 4 cartas, a grade fica em 4 colunas com rolagem (`hud-dock.css`).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - sem itens, o Kakashi não abre;
    - com 6 itens (1 no limite), lista 5;
    - X cancela sem gastar;
    - clicar na 5ª carta copiou o Talismã de Vida (1 → 2) e gastou o Kakashi;
    - os usos de pular, atualizar e banir ficaram intactos.
  - O teste dos chefes também passou de novo.

## 2026-11-05 — chefes com barra de vida e técnicas próprias
- Novo `src/scene/bossCombat.ts`, integrado ao `GameCanvas.tsx`.
- **Barra de vida:** mega elites e guardiões ganham barra 3D acima do personagem, com nome; durante um golpe ela mostra "⚠ golpe".
- **Técnicas:**
  - Os chefes usam as técnicas do próprio shinobi contra o jogador. Mega elite: 1 + zona técnicas; guardião: o kit todo.
  - Cada golpe tem aviso vermelho de 1,1 s no chão, no formato da técnica (área, cone, linha, V, anel). Sair da área evita o dano.
  - Golpes com controle deixam o jogador lento.
  - O guardião usa a Ultimate dele uma vez, abaixo de 50% de HP.
- **Valores provisórios:** `BOSS_RULES`.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Um teste avulso no navegador confirmou: barra criada; Gaara conjurando "Agulhas de Areia"; HP 101 → 63 ficando parado; 122 → 122 saindo do "Caixão de Areia"; remoção sem erro.
- **Não testado:** balanceamento em runs completas, guardião usando a Ultimate em jogo real e o aviso em relevo forte.

## 2026-11-05 — login admin removido e debug com ajustes ao vivo salvos
**Login removido**
- Removidos `src/game/adminAuth.ts` (login e hash da senha) e `src/ui/AdminLogin.tsx`.
- O modal de conta não tem mais campos de login ou senha, e os estilos `.admin-login` saíram de `debug.css`.
- Nenhum arquivo do projeto contém o login ou a senha. `Feedback da versão.txt` continua fora do git.
- **Histórico reescrito**, a pedido do usuário. Os commits `be528e9` (que tinha o login e o hash da senha) e `5f81fdf` foram juntados num único commit limpo, `be738b5`, publicado com `git push --force-with-lease`. O GitHub ficou com 1 commit, e os objetos antigos foram removidos do repositório local (`reflog expire` + `gc --prune=now`). O GitHub ainda pode guardar o commit antigo por algum tempo para quem souber o hash exato; o suporte do GitHub consegue apagá-lo de vez.

**Ativação do debug**
- O debug não depende de conta: `debug={import.meta.env.DEV}`. Existe ao rodar com `pnpm dev`/`ABRIR_JOGO.bat`; a build de produção não tem o painel.

**Painel de debug** (`src/game/tuning.ts`, `DebugPanel.tsx`, `GameCanvas.tsx`)
- 13 parâmetros em 4 grupos:
  - Inimigos: HP, dano, velocidade, spawn e teto.
  - Personagem: dano e Ultimate.
  - Ganhos: EXP e Ryu.
  - Drops (novos): chance de Ryu, Chakra, pílula e item, com a chance efetiva exibida.
- Mudar o HP dos inimigos reescala também os que já estão vivos.
- Os parâmetros salvos (`sb_debug_tuning_v1`) agora valem em **todas** as runs, com o painel aberto ou fechado (antes só com o debug ligado).
- O botão mostra "ajustes ativos" quando algo difere do padrão.
- Novos botões "Copiar JSON" e "Colar JSON".

**Verificado**
- `tsc -b`, `vite build` e `verify-rules.mjs` passaram.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador confirmou: modal sem login; painel sem login; HP ×2 dobrando o inimigo vivo; item ×30 = 54%; valores salvos e recarregados na run seguinte; restaurar padrões.

**Não testado**
- Os demais sliders, um a um, em gameplay real.

## 2026-11-05 — versionamento no GitHub
- O projeto passa a ser um repositório git, com remoto `origin` em https://github.com/jcffadev/Shinobibonk.git e branch `main`.
- Novo `.gitignore`. Ficam fora do repositório:
  - dependências, build e segredos;
  - `Feedback da versão.txt`, por conter credenciais;
  - `animação do personagem.jpeg`, uma prévia de banco de imagens com marca d'água.
- Nova skill `skills/publicar-github/SKILL.md`, com um atalho em `.claude/skills/publicar-github/`: ao fim de cada tarefa com alterações, documentar, verificar, conferir segredos, fazer commit em português e push sem force.
- `AGENTS.md` ganhou a seção "Publicação no GitHub".

## 2026-11-05 — HUD de pílulas, level-up sem itens e Lamens por desempenho
Feito por três subagentes e integrado depois.

**HUD**
- Novo `src/hud-dock.css`. Em `main.tsx`, `.vitamin-row` e `.ability-bar` ficam dentro de `.skill-dock`: pílulas numa linha própria acima das habilidades, quebrando em até 2 linhas, com rolagem.
- Na integração, o bloco subiu para `bottom:96px` e a ajuda de teclas foi para a direita do botão "← Preparação", porque o selo AUTO encostava na ajuda.
- No resumo, os nomes das pílulas não são mais cortados com "…": aparecem sem o prefixo "Pílula" e quebram linha.

**Level-up** (`rollLevelOffers`)
- Só técnicas e pílulas, até 2 técnicas; nunca itens.
- Técnicas todas no máximo: só pílulas. Pílulas todas no limite: só técnicas.
- Itens só por recompensas (kunai, shuriken, eventos, drop, recusa de selamento).

**Pílula do Mercador**
- O texto agora cita só Ryu ("+12% Ryu recebido").

**Lamens por desempenho**
- Novo `src/game/rewards.ts`: tempo, abates, nível, zona, mega elites selados e vitória, multiplicados pela dificuldade. Valores provisórios.
- Creditados uma vez por run (vitória ou derrota) e mostrados no resumo com a decomposição.

**Testes**
- `scripts/verify-runtime.mjs`: a verificação da carteira passou a ser relativa (antes esperava o saldo fixo 999.699, que mudou com o crédito de Lamens). Nova verificação: "Vitória credita Lamens uma única vez e mostra no resumo".

**Verificado**
- `tsc -b` e `vite build` sem erros.
- `verify-runtime.mjs` passou com 24 verificações.
- Um teste avulso no navegador confirmou: level-up só com técnicas e pílulas em 60 rolagens; 16 pílulas no HUD sem sobrepor as habilidades nem a ajuda; resumo com Lamens.

**Não testado**
- O caso "só pílulas com técnicas no máximo" em jogo real.
- Layout do HUD entre 700 e 1100 px e no celular.
- Balanceamento da fórmula de Lamens.

## 2026-11-05 — posição do painel de debug
- `src/debug.css`:
  - O botão "DEBUG · F9" e o painel foram para a direita, abaixo do minimapa, e não cobrem mais o cartão do herói.
  - Botão e painel ficam ocultos enquanto o resumo pós-run está aberto (regra CSS com `:has(.summary-backdrop)`).
- **Verificado** com `vite build` e um teste avulso no navegador a 1440×900:
  - o painel não se sobrepõe ao cartão do herói, ao minimapa nem à barra superior;
  - o botão some no resumo.
- O layout de celular do painel não foi conferido visualmente.

## 2026-11-05 — modo debug admin, resumo pós-run e 18 pílulas
Feito por três subagentes em paralelo e integrado depois.

**Modo debug (admin)**
- Novos arquivos: `src/game/adminAuth.ts`, `src/game/tuning.ts`, `src/ui/AdminLogin.tsx`, `src/ui/DebugPanel.tsx` e `src/debug.css`.
- Login admin local no modal de conta. A senha é guardada só como hash SHA-256 e verificada no navegador; é proteção de protótipo, não segurança real.
- Na missão, F9 (ou a tecla à esquerda do 1) abre o painel:
  - leitura ao vivo;
  - 9 multiplicadores salvos em `sb_debug_tuning_v1`;
  - dar item ou pílula, curar, god mode, Chakra, nível, Ryu;
  - mega elite, limpar inimigos, avançar o tempo, congelar.
- Sem admin, o balanceamento padrão não muda.

**Resumo pós-run**
- Novos arquivos: `src/ui/RunSummary.tsx` e `src/summary.css`.
- Substitui a tela final simples. Mostra resultado, 12 indicadores (inclui DPS médio), dano por técnica com % e DPS, build final e atributos finais.
- Mantém o botão "Preparar outra missão" e adiciona "Tentar novamente".

**Pílulas**
- Novos arquivos: `src/game/pills.ts` e `src/ui/PillIcon.tsx`.
- 18 pílulas com tema ninja, uma por atributo, no formato da wiki de referência. Substituem Rubra, Verde e Azul.
- `progression.ts`, `preparation.ts`, `GameCanvas.tsx`, `RunSheet.tsx` e `BuildPlanner.tsx` agora leem de `pills.ts`.

**Verificado**
- `tsc -b` e `vite build` sem erros; o bundle passou a 899 kB.
- `verify-rules.mjs` passou.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador cobriu login admin (errado e certo), F9 abrindo e fechando, sorteio das pílulas novas, resumo na vitória e layout a 390 px.

**Não testado**
- Derrota real.
- Cada slider do debug.
- Conflito do F9 com o Leitor Imersivo do Edge.
- Balanceamento das pílulas.

## 2026-11-05 — tecla Y restaurada (decisão do usuário)
- **CONFIRMADO** pelo usuário: a tecla Y tem que existir.
- `src/scene/GameCanvas.tsx`: Y volta a alternar a Ultimate automática. A tecla e o clique no selo AUTO chamam a mesma função `onToggleAuto`.
- `scripts/verify-runtime.mjs`: nova verificação "Tecla Y alterna a Ultimate automática".
- **Verificado**: `tsc -b` e `vite build` sem erros; `verify-runtime.mjs` passou nas 23 verificações, sem erros JS.
- README, docs 00, 04, 10 e 12, contexto do chat e `AGENTS.md` atualizados.

## 2026-11-05 — moeda Lamens no hub e AUTO sem tecla Y (Y revertido na entrada acima)
- `src/main.tsx`: carteira, árvore permanente, loja, nota de teste, Reset e rodapé do hub agora mostram a moeda permanente como **Lamens** (🍜) em vez de "Ryu". O Ryu (🪙) continua sendo o dinheiro da run (HUD, kunais, mercador, caça-níquel). A função interna `spendRyu` foi renomeada para `spendLamens`. A chave `sb_admin_wallet_v1` não mudou, então o saldo salvo é mantido.
- `src/scene/GameCanvas.tsx`: removido o atalho oculto **Y**. O selo AUTO do botão R agora dispara o evento `shinobi-toggle-auto-ult` em vez de simular a tecla Y.
- README, docs 00, 04, 11 e 12 atualizados; as duas divergências saíram da lista de pendências.
- **Verificado**: `tsc -b` e `vite build` sem erros. `node scripts/verify-runtime.mjs` reexecutado com as 22 verificações passando (inclusive "Ultimate R e selo AUTO" por clique e reembolso do Reset), sem erros JS. A execução regravou `artifacts/runtime-checks.json` e as screenshots em `artifacts/`.

## 2026-11-05 — sincronização da documentação com o código
Os docs foram editados até cerca de 15h; o código continuou mudando até cerca de 17h53 sem registro. Esta entrada documenta, a partir da leitura do código, as mudanças que não estavam registradas, e corrige os Markdown. Nenhum código foi alterado.

**Registrado retroativamente (IMPLEMENTADO no código, sem entrada anterior):**
- Dados extraídos para `src/game/`:
  - 22 shinobis e 88 técnicas com escola, elemento, forma e status.
  - Catálogo de 36 itens.
  - `calculateStats` recalculando atributos das fontes.
  - Dificuldade por rank e tempo.
  - Crítico com mega crítico.
  - Afixos de técnica por raridade.
  - Evoluções visuais por nível.
  - Árvore permanente com 16 nós.
  - Três zonas com guardião.
- UI nova em `src/ui/`: ficha da run, plano de build e filtros.
- Hub:
  - Filtros por aldeia, escola e elemento.
  - Carteira administrativa local (999.999) com Reset que devolve o gasto.
  - Prévia da cena.
- Run:
  - Contagem regressiva de 10:00 com vitória e derrota; três zonas de 200 s com clima e guardião.
  - Ataques inimigos telegrafados; armadura e evasão.
  - Cartas com atualizar, pular e banir (F/X/Z).
  - Kunais no mapa com preço crescente de Ryu.
  - Defesa de altar de 20 s.
  - Emboscadas.
  - Mega elites aleatórios do elenco (até 9).
  - Aliados que seguem e atacam.
  - Sinergia da Areia.
  - Descoberta por frustum da câmera.
  - Ganchos de teste `window.__shinobiTest` (dev com `?test`).
- Eventos renomeados: os nomes dos eventos do jogo de referência viraram Provocação do guardião e Bênção de Tsunade.
- Scripts `scripts/verify-rules.mjs`, `scripts/verify-runtime.mjs`, `scripts/smoke-browser.mjs` e scripts de integração já aplicados (`scripts/integrate-*.mjs`, `update-*.mjs`).

**Documentação corrigida:**
- README, `00-LEIA-PRIMEIRO` e `12-ARQUITETURA` reescritos conforme o código.
- 01, 02, 03, 04, 05 e 11 receberam seções de estado do código.
- 06 marcado como histórico.
- 09, 10 e o contexto do chat receberam notas sobre as decisões que mudaram (Tab/P, AUTO no lugar de Y, moedas, nomes sem referência ao jogo de referência).

**Divergências registradas como PENDENTES:**
- A moeda permanente aparece como "Ryu" no hub (a decisão é Lamens).
- A tecla Y ainda alterna o AUTO como atalho oculto.
- Teto real de 180 inimigos vivos.
- Selamento sem tentativas nem falha.
- Descoberta sem oclusão.

**Verificado nesta data:** `tsc -b` sem erros; `vite build` concluído com aviso de chunk de 879 kB; `node scripts/verify-rules.mjs` passou. Os testes de navegador em `artifacts/runtime-checks.json` são da execução anterior do Codex e não foram reexecutados.

## 2026-11-05 — run, selamento de Orochimaru, skill e referências
- Copiados os 50 PNGs de clipboard disponíveis desta conversa para `assets/referencia/prints/originais/`, preservando os nomes originais; mantidas cópias organizadas na pasta principal.
- Implementadas aparições naturais do mega elite Orochimaru e sequência após derrota: retrato do alvo, escolha E/G, animação do selo, registro de aliado temporário ou drop que abre três itens. Sorte do Talismã altera chance de raridade nessa escolha.
- Substituída a maldição do evento do jogo de referência pela Maldição de Orochimaru; mantém o efeito de risco/recompensa provisório.
- A roleta/eventos, coleta de armas/Ryu, altar de desafio, escolha de level-up, HUD de run, clima simples e mapa da zona estão implementados em `src/`; defesa de altar completa, zonas e IA de aliados continuam pendentes.
- Ultimate automática agora é alternada pelo selo AUTO dentro do botão R; removido Y do guia visual do HUD. Naruto alterna VFX de shuriken, Rasengan, clone e rajada de chakra.
- Criada `skills/documentar-projeto/SKILL.md` e integrada ao `AGENTS.md`: toda alteração em código/configuração/assets deve sincronizar Markdown na mesma tarefa.
- README, guia inicial, arquitetura, câmera/eventos e selamento atualizados para distinguir código real de plano visual. `pnpm build` concluído em 05/11/2026; Vite avisou sobre bundle acima de 500 kB.

## 2026-11-05 — hub de elenco e progressão
- Adicionadas telas do elenco com passivas/kit, catálogo de ataques por shinobi, plano de build, árvore permanente e loja de itens.
- Planejamento permite marcar ataques e bloquear itens desbloqueados para a próxima run; preferências ficam no navegador local.
- Proposta econômica documentada: dez passivas, dez níveis, custo crescente; total projetado de 21.300 Lamens para a árvore apresentada.
- Login, recompensas de Lamens, efeitos de passivas e integração real do pool seguem pendentes.

## 2026-11-05 — tela inicial e entrada de jogador
- Criada tela inicial inspirada na referência enviada, com cenário 3D ao fundo, opção de convidado e área de conta.
- Adicionada seleção de missões Genin, Chunin, Jonin e Kage, com rótulo de início da missão escolhida.
- Preparado modal explicando que login/cadastro por e-mail e senha dependem de implementação futura; nenhum dado de senha é coletado.
- Placar indica claramente dados locais e ausência de ranking/contas online.

## 2026-11-05 — movimento e inimigos na base 3D
- Adicionados movimento WASD/setas, câmera que acompanha o protagonista e rotação por arraste do mouse.
- Inimigos geométricos surgem aleatoriamente ao redor do jogador e avançam em sua direção; contador aparece na HUD.
- Controles e estado continuam em uma simulação Three.js separada da interface React.

## 2026-11-05 — base inicial 3D
- Adicionada base de desenvolvimento com Three.js e TypeScript; React controla a interface, enquanto cena e renderização ficam isoladas.
- Configurado Vite para iniciar a nova base pela raiz do projeto, preservando `game/index.html` como protótipo 2D jogável.
- Adicionada cena isométrica de teste com terreno em blocos e personagem geométrico provisório.
- Instaladas dependências Three.js, React, TypeScript, Vite e tipos associados.
- A base não migra ainda as mecânicas do protótipo 2D nem representa arte final.

## 2026-11-05 — pacote para Codex
- Consolidado código executável mais recente (v0.5.3), docs, artes conceituais, screenshots e histórico disponível.
- Não houve migração para 3D nesta consolidação.
- Origem: arquivos locais de versões anteriores desta conversa.

## 07/11/2026 — Integração dos lotes e continuação de arte

- Concilia os rascunhos locais do Claude e a main do Codex, preservando ambas as linhas.
- Corrige retomada da simulação após Esc e identificação do lançador no Susanoo de ajudantes.
- Integra chão e construções regionais de Areia, Pedra e Névoa.
- Integra nove folhas de pulo/dash e três folhas completas de ações; adiciona empacotador de atlas.
- Preserva a calibração existente. Revisão visual integral dos mapas e das 56 versões continua pendente.

## Lote de animações salvo para continuação · 07/11/2026

IMPLEMENTADO: 24 folhas completas adicionais 4×4 de ataque/selo/pulo/dash: Kakashi 1/25, Itachi 1, Minato 1/15, Tsunade 1/15/30, Jiraiya 1/20, Orochimaru 1/15, Hinata 1/15/30, Pain 1, Shikamaru 1/15/30, Tobirama 1, Temari 1/15 e Tenten 1/15. Todas foram empacotadas em células uniformes e registradas em directionalArt.ts, usado também pelos ajudantes. As três folhas completas de Sasuke 15 e Hashirama 1/20 já foram publicadas no lote anterior. Os prompts e referências estão em docs/arte-atlas-2026-11-07.json, gerados com ImageGen.

IMPLEMENTADO: prévia de Susanoo utiliza o mesmo rig WebGL e partículas do combate, escolhendo o estilo pela família do lançador. TypeScript, build e regras passaram após as mudanças.

PENDENTE: criar folhas completas de Kankuro 1/15/30 e Kushina 1 (quatro versões); revisar/refinar ataques antigos de Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. A existência da folha não confirma que todas as poses foram aprovadas visualmente. Conferir consistência com o sprite parado, frente/costas e dash esquerdo em cada versão e como ajudante.

O script scripts/verify-motion-atlases.mjs exercita o controlador em fixture isolada e produz artifacts/motion-review.json e quatro folhas de contato. A primeira execução tinha duas instâncias de Three.js; corrigido o import por scripts/motion-review-entry.ts. Conferir o resultado final antes de considerar a auditoria completa.

Continuam pendentes: inspeção visual dos quatro mapas, prévias/efeitos em combate de todos os lançadores, sons com licença verificada e uma run prolongada de três zonas até bijuu/saída/ranking. Preservar o balanceamento existente conforme instrução do usuário. Não publicar artifacts/sb-swishes-source.zip: é um arquivo preexistente de origem/licença não verificada.

Validação deste lote: scripts/verify-motion-atlases.mjs concluiu com 56 versões, 560 estados, zero erros JavaScript e zero assets ausentes. Foram geradas quatro folhas de contato; a aprovação visual completa e a revisão em combate continuam pendentes.
