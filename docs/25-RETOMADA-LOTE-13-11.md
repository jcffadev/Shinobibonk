# 25 · Retomada do lote de 13/11/2026 (pausado)

> Documento de passagem para qualquer agente (Claude Code, Codex ou outro) continuar **sem perder nada**.
> Criado pelo Claude Code em 13/11/2026, logo após o usuário pedir para pausar.
> Antes de começar, siga `skills/contexto-e-decisao/SKILL.md` e leia `AGENTS.md`.

## 0. Regras que valem para esta retomada

- **Pasta única de trabalho:** `C:\Shinobibonk projeto - Copia\ShinobiBonk_Codex_Projeto_Completo`. Não usar `C:\Shinobibonk projeto\` nem caminhos do OneDrive (cópias antigas).
- **Fechar sempre com commit + push** em `origin main` (skill `publicar-github`), em português, sem force push. Documentar tudo antes (skill `documentar-projeto`: CHANGELOG, docs/13, docs/14, docs/18 e o doc temático).
- **TESTADO só depois de executar de verdade.** Testes no navegador sempre mudos (`--mute-audio` e `speechSynthesis` desligado).
- **Zero rastro do jogo de referência:** nunca escrever o nome dele em arquivo do projeto.
- **Fonte canônica de lore:** Narutopedia (https://naruto.fandom.com/).
- Node: `%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.
- Verificações: `node node_modules/typescript/bin/tsc -b` · `node node_modules/vite/bin/vite.js build` · `node scripts/verify-rules.mjs` · `node scripts/verify-motion-atlases.mjs` · `node scripts/verify-runtime.mjs` (porta 5176).

## 1. Estado no momento da pausa

| Item | Situação |
|---|---|
| GitHub (`main`) | Commit `daa5646` — Rodada 54: trabalho do Codex que estava sem commit, publicado (114 versões, arte nova, rebalanceamento de HP inicial/dano). Validado com tsc, build e verify-rules; `verify-runtime` ainda não rodou nessa rodada. |
| Pasta local | Trabalho **parcial e sem commit** dos três subagentes (abaixo). **Compila** (`tsc -b` ok), mas **não foi testado** e algumas partes estão pela metade. |
| Arquivos alterados | `scripts/verify-rules.mjs`, `skills/movimentar-shinobi/SKILL.md`, `src/game/progression.ts`, `src/game/settings.ts`, `src/scene/GameCanvas.tsx`, `src/scene/bossCombat.ts`, `src/scene/playerMotion.ts`, `src/ui/SettingsScreen.tsx` |
| Arquivos novos | `src/game/altarRewards.ts`, `src/scene/fallenShinobi.ts`, `src/scene/techniqueAreas.ts` |

**Atualização da 2ª pausa (13/11):**
- **Subagente 3: CONCLUÍDO e testado** (tsc, build, verify-rules, Playwright). Resultado registrado no relatório do chat:
  - HP com a curva `1+0,04n/(1+n/150)` (`HP_GROWTH` em progression.ts): Naruto Nv. 415 passa de 2.961 para 308 de HP, PROPOSTO.
  - Altar: Raro +1, Épico +2, Lendário +3 projéteis; Comum e Incomum sem projétil. `projectiles` agora repete o golpe também no corpo a corpo e em área.
  - Ameaça por `zoneElapsed()`, reiniciando a cada zona.
  - Ímã global mais rápido (~1,6 s para o mapa inteiro).
  - Decisões pendentes do usuário:
    - o golpe extra vale para os itens que já dão +1 projétil?
    - Konan, afinidade da Tenten e sinergia da Folha saem da chance fracionária?
- **Subagente 1:** parado quando já tinha verificado a caminhada do jogador em todos os ângulos e combinações de WASD. Faltam ajudantes, monstros, bijū, a queda e a pose deitada com a luz (`fallenShinobi.ts` parcial).
- **Subagente 2:** parado no meio. Música (`settings.ts`, `SettingsScreen.tsx`) e áreas (`techniqueAreas.ts`) parciais; fontes e câmera não iniciadas.
- O código parcial compila (`tsc -b` ok). Nada disso está no GitHub.

**Atualização da 3ª pausa (14/11) — sem subagentes, uma tarefa por vez (pedido do usuário):**

**Já feito no código (sem commit):**
- Música padrão 10% com migração.
- Opção "Mostrar áreas das técnicas" e contornos no chão (`techniqueAreas.ts`).
- Câmera: piso de 0,03 rad, scan de encosta mais permissivo e `far` dinâmico.
- `stableFacing` com histerese em ajudantes, clones, Kuri e monstros.
- Monstros usam a folha de costas também na diagonal.
- Bijū espelham pela câmera e só andam quando se deslocam.
- Corpo caído com queda, pose deitada, halo na cor do contorno e ícone ⛓ no mapa (`fallenShinobi.ts`).
- Tudo do Subagente 3.

**Medido em jogo (Edge, 4 ângulos de câmera):**
- Jogador certo nas 8 direções × 4 ângulos (W e diagonais para cima → costas; S → frente; A espelha).
- Ajudantes e Mega Elites com fileira e espelho corretos; parados, ficam em repouso.
- Monstros: 33 de 35 corretos (1 errado, possivelmente no meio de um golpe; falta conferir).
- **Bijū NÃO viram de costas:** o atlas `bijuu/motion-v1-*` só tem vista lateral. PENDENTE de arte (2 quadros de costas por bijū).

**Testes:**
- tsc, build, verify-rules e verify-motion-atlases (114 versões, 1140 estados) passaram.
- `verify-runtime`:
  - 1ª rodada parou na recusa com G (não reproduziu isolado; provável instabilidade);
  - 2ª parou na textura das bijū; o teste foi atualizado para `motion-v1` em `scripts/verify-runtime.mjs`;
  - 3ª rodada interrompida pela pausa.

**Próximos passos, em ordem:**
1. Rodar `verify-runtime` até passar e fazer o commit do que está pronto.
2. Conferir o Mega Elite caído com a luz e o E (de perto, de longe, na névoa).
3. Fontes da HUD: não iniciado.
4. Conferir áreas e câmera em capturas.
5. Documentar a Rodada 55 e publicar.

**Antes de continuar:** rodar `git status` e `git diff` para ver exatamente o que já foi feito em cada arquivo. Não descartar o parcial (sem `git checkout`/`stash`/`reset`); revisar e completar.

## 2. Pedido original do usuário (13/11/2026, texto integral)

> Separe em tarefas iguais aos subagentes 1, 2 e 3. Não esqueça a regra de dar os commits.
>
> Continuar de onde parou, atualizar o GitHub.
> Prioridade, arrumar as animações de caminhada de TODOS no JOGO, ajudantes, jogador, monstros, bijuus, TUDO. Para funcionar conforme alinhamos em relação ao WASD.
> Ao derrotar um mega-elite, fazer animação/folha do personagem sendo derrotado e ficar deitado no chão, chegar perto para apertar o E para capturar.
> Deixar mais evidente os hitbox das habilidades/áreas de efeito
> Aumentar um pouco as fontes, mas manter o hud organizado... tem algumas fontes muito pequenas, melhorar isso.
> Abaixar a musica configuração padrão, está muito alto quando abre o jogo a primeira vez, deixar um som agradável. Cerca de 10%
> O magnetismo do morro de bolinho não está puxando os itens do mapa todo, revisar.
> Ser possível deitar mais a câmera.
> Scale de HP ainda muito alto, revisar esse scale, estou level 415 e estou com 1613 de HP é muita coisa.
> Temos um buff +35% chance projétil extra/golpe extra, remova e coloque +1 projétil... lendário será +3 projéteis/golpes. Epico será 2, abaixo disso é raro é 1. Incomum/comum não tem projétil na lista de buffs.
> Isso para recompensa de altares e coisas dos tipo.
> Ao passar de zona, resetar e voltar do início a progressão dos monstros... como se fosse o jogo começando do 0 na zona 1, mas claro os buffs de %+inimigos/+%hordas que temos deve influenciar quando for tendo o scale para aparecer mais monstros no mapa.
>
> As invocações deitadas, precisa ficar mais em evidência no chão para serem capturados, colocar uma luz que dê para ver com facilidade, mas nada muito brilhoso.

## 3. Tarefas por subagente

Os três trabalham em paralelo. Para não se atropelarem, cada um tem seus arquivos. No `src/scene/GameCanvas.tsx`, cada um edita **só os seus trechos**, com edições pequenas e exatas (reler o trecho antes; nunca reescrever o arquivo inteiro). Subagentes não fazem commit: quem coordena consolida e publica.

### Subagente 1 — Animações (WASD) e Mega Elite caído
*Parou criando a pose deitada.*

| # | Tarefa | Feito? |
|---|---|---|
| 1.1 | Caminhada com WASD do **jogador**, **ajudantes** e **clones** | parcial |
| 1.2 | Caminhada dos **Mega Elites/guardiões** | pendente |
| 1.3 | Caminhada dos **monstros comuns e elites** (`enemyRenderer.ts`; usar `public/assets/shinobi-enemy-walk-back-v1.png` para costas) | pendente |
| 1.4 | Caminhada das **bijū** (`public/assets/bijuu/motion-v1-*.png`) | pendente |
| 1.5 | Em todos: frente/costas certas com a câmera em 0°/90°/180°/270°, espelhamento lateral, sem piscar entre fileiras, pés animando só enquanto anda | pendente |
| 1.6 | **Mega Elite derrotado:** animação de queda → deitado no chão até ser capturado com **E** (até 10 m) ou recusado com **G**. Vale para "Shinobi para selar" (contorno ciano) e Mega Elite (vermelho). Mantém a configuração de ritual × selamento direto. | parcial (`fallenShinobi.ts`) |
| 1.7 | **Luz suave no chão** em volta do corpo deitado, na cor do contorno: visível de longe e na névoa, pulsação lenta, sem brilho forte; versão mínima no modo H | pendente |
| 1.8 | Atualizar `skills/movimentar-shinobi/SKILL.md` com as regras | parcial |

- **O que já foi alinhado sobre WASD:** WASD imediato, a última tecla oposta vence; fileira de frente/costas pelo deslocamento relativo à câmera (que gira 360°); espelhamento esquerda/direita com dead zone; caminhada contínua (`stepTime` não zera); proporção estável (`propFactor` suavizado); andar atacando mostra os quadros de ataque com passada nas pernas (`CHAIN_AT` 75%); dash espelhado.
- **Arquivos dele:** `playerMotion.ts`, `playerPose.ts`, `directionalArt.ts`, `enemyRenderer.ts`, `bijuu.ts`, `bossCombat.ts`, `fallenShinobi.ts` e, no GameCanvas, só movimento/animação dos atores e o Mega Elite caído.
- **Teste:** ganchos `window.__shinobiTest` (`motion()`, `supportMotion()`, `enemyFrames()`, `cloneMotion()`), capturas recortadas e olhadas uma a uma; porta 5191.

### Subagente 2 — Áreas das técnicas, fontes, música e câmera
*Parou testando o build.*

| # | Tarefa | Feito? |
|---|---|---|
| 2.1 | **Áreas de efeito mais visíveis:** contorno nítido + preenchimento translúcido no chão, no alcance **real** do golpe (Área, Cone, Linha, Onda, Órbita, Corpo a corpo, Projétil), cor pela natureza. Não muda dano/alcance; sem custo de FPS com horda; contorno mínimo no modo H; talvez opção "Mostrar áreas das técnicas" (padrão ligado) | parcial (`techniqueAreas.ts`) |
| 2.2 | **Fontes maiores:** texto secundário com mínimo de ~12–13 px, títulos proporcionais, sem sobreposição em 1280×720 e 1600×900. Ajustar por tokens em `src/ninja-theme.css`. Respeitar os invariantes da HUD | pendente |
| 2.3 | **Música padrão em 10%** na primeira abertura. Preservar quem já ajustou; migrar só quem está no padrão antigo e nunca mexeu | parcial (`settings.ts`, `SettingsScreen.tsx`) |
| 2.4 | **Câmera deitando mais:** pitch mínimo menor que o atual (rodada 44: início 0,55 rad, piso 0,05 rad). Rever o que limita na prática (scan de terreno que sobe o `viewPitch`, near plane, névoa) sem cortar o chão nem esconder o jogador | pendente |

- **Arquivos dele:** `src/*.css`, `src/ui/*.tsx`, `src/game/settings.ts`, `src/audio/music.ts`, `particleFx.ts`, `techniqueEffects.ts`, `techniqueAreas.ts` e, no GameCanvas, só câmera/pitch e visualização das áreas.
- **Teste:** capturas antes/depois das fontes, áreas de cada forma em combate, câmera no pitch mínimo perto de morros/bordas, Configurações mostrando 10%; porta 5192.

### Subagente 3 — HP, projéteis, troca de zona e ímã
*Parou editando o altar no GameCanvas.*

| # | Tarefa | Feito? |
|---|---|---|
| 3.1 | **HP por nível:** reproduzir o caso nível 415 = 1.613 de HP, mostrar de onde vem cada parte e aplicar uma curva bem mais contida (crescimento que desacelera), mantendo a sobrevivência viável contra o dano dos monstros (zonas 1–3, Genin e Kage). Tabela antes/depois nos níveis 1, 10, 50, 100, 200 e 415, marcada PROPOSTO. Atualizar `verify-rules` | parcial (`progression.ts`, `verify-rules.mjs`) |
| 3.2 | **Projétil extra nas recompensas** (altares, bênçãos, caça-níquel, eventos): tirar o "+35% de chance"; Raro **+1**, Épico **+2**, Lendário **+3** projéteis/golpes; Comum e Incomum **não** sorteiam projétil. Conferir que vale como golpe extra no corpo a corpo e ajustar os textos. Itens do catálogo que usam a chance: informar, não alterar | parcial (`altarRewards.ts`) |
| 3.3 | **Troca de zona:** a progressão dos monstros (spawn, vivos, HP/dano por tempo, Final Swarm) recomeça do zero em cada zona, mantendo o multiplicador da zona (Z2 ×1,18 / Z3 ×1,38), a dificuldade da missão e os buffs de +% inimigos/horda por cima. Conferir save/retomada e a arena da bijū | pendente |
| 3.4 | **Ímã do morro de bolinhos:** puxar **todos** os drops do mapa inteiro (XP, Ryu, chakra, cura). Itens que exigem **E** continuam exigindo E | pendente |

- **Arquivos dele:** `progression.ts`, `enemyTiers.ts`, `catalog.ts`, `pills.ts`, `roulette*.ts`, `tuning.ts`, `altarRewards.ts`, `verify-rules.mjs`, `docs/20-SCALING-EREGULAS.md` e, no GameCanvas, só altar/recompensas, troca de zona/spawn/escala e ímã dos drops.
- **Teste:** HP nos níveis da tabela; altar sorteado muitas vezes por raridade; vivos/spawn/HP logo após trocar de zona × início da zona 1, com e sem buff; drops espalhados pelo mapa e coletados pelo morro; porta 5193.

## 4. Fechamento (coordenador, ao fim dos três)

1. Revisar o diff de cada subagente.
2. Rodar `tsc -b`, `vite build`, `verify-rules`, `verify-motion-atlases` e `verify-runtime` (todos mudos).
3. Documentar:
   - `CHANGELOG.md`: Rodada 55;
   - `docs/14`: pedido integral + resposta;
   - `docs/18`: §4 e §6;
   - `docs/13`: o que falta;
   - `docs/20`: fórmulas de HP, projéteis e zonas;
   - `docs/02`: fontes e áreas.
4. Commit em português + `git push origin main`; informar o hash ao usuário.

## 5. Pendências gerais que continuam na fila

- `TEST_UNLOCK_ALL = true` em `src/game/account.ts` (elenco todo liberado para teste): voltar a `false` antes da versão pública.
- Revisar os efeitos das técnicas comparando com o anime (`docs/24-AUDITORIA-DE-EFEITOS.md`).
- Inspeção em jogo das 114 versões, como jogador, ajudante e Mega Elite.
- Rodar `verify-runtime` na Rodada 54.
- Fase 5 da HUD: sequência de abates, card de temporada, glossário, layout dos blocos de combate.
- FPS com placa de vídeo real; run completa (3 zonas → bijū → ranking).
- Proposta de personagens novos e revisão canônica: `docs/22-PROPOSTA-NOVOS-SHINOBIS.md` (perguntas abertas).
- Skill `animar-jutsu-webgl` (jutsus em WebGL a partir dos 3 links do usuário): não criada.
- Pasta antiga `ShinobiBonk_Codex_Arte` (gitfile quebrado, conteúdo já integrado): pode ser apagada se o usuário quiser.
