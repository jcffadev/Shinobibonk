# 26 · Passagem para o próximo agente (14/11/2026)

> O usuário pediu para publicar tudo e continuar com outra IA ("publicar agora… vou continuar com outra IA… Anote tudo e deixe em fila"). Este documento é o ponto de partida. Leia antes: `AGENTS.md`, `docs/development/TESTING_POLICY.md`, `docs/13-PENDENCIAS-PARA-CONTINUAR.md` (tabela "Fila do usuário · 14/11/2026") e o topo do `CHANGELOG.md` (rodadas 54–63).

## Regras que valem

- **Pasta única:** `C:\Shinobibonk projeto - Copia\ShinobiBonk_Codex_Projeto_Completo`. Ao fim de cada item: documentar (CHANGELOG, docs/13, docs/14, docs/18) e fazer commit + push em `origin main`, sem force push.
- **Testes:** perfil EQUILIBRADO (`TESTAR_JOGO.bat` = tipos + `scripts/run-tests.mjs` com cobertura + build). Antes de publicar mudança de regra, rode `TESTAR_JOGO.bat profundo`, que inclui a prova por mutação (`scripts/mutation-check.mjs`, hoje 24/24).
  - Toda regra nova vem com teste em `tests/`.
  - Suba `tests/minimo.json` (hoje 80).
  - Para regra importante, acrescente uma mutação em `scripts/mutation-check.mjs`.
- **Navegador:** a restrição vale **só para o Claude Code**. Codex e Qwen podem rodar `verify-runtime` e `verify-motion-atlases` como antes.
  - A última execução do `verify-runtime` (13/11) parou num passo de configurações/câmera do Kimimaro, perto da linha 628 do script. Ele precisa ser rodado e revisado.
  - Desde então mudaram: cursor virtual, bijū, fontes, botão do Arquivo Shinobi e névoa do Zabuza.
- **Zero rastro do jogo de referência:** nada com o nome dele no projeto. O teste em `tests/regras-do-jogo.test.mjs` verifica os arquivos e o conteúdo dos .zip.
- `TEST_UNLOCK_ALL = true` (`src/game/account.ts`) deixa o elenco liberado para teste. Voltar a `false` antes de versão pública.

## Fila, em ordem

| # | Item | Estado e o que fazer |
|---|---|---|
| 19 | **Tester:** XP parou na zona 2 (Rock Lee, nível 582) e voltou na zona 3; no late game a barra de XP "não sobe unidade por unidade" | **PENDENTE — próximo.** Hipótese, não confirmada: desde a rodada 55 a ameaça recomeça a cada zona (`zoneThreat` com `zoneElapsed`, pedido do usuário), mas o XP por abate (em `removeEnemy`: `BASE_LOOT.xp × lootScale × xpMultiplier × (1 + (elapsed/60 − 3) × 0,075)`) e o XP necessário (`xpToLevelUp`) não acompanham. No início da zona 2 nascem poucos monstros e cada abate rende pouco no nível 582, então a barra parece parada. Confira também `xpMultiplier` e `lootMultiplier`, zerados a cada zona. Passos: (a) medir com um teste por código o XP por abate e o XP para subir nos níveis 100/300/582, no início e no fim de cada zona; (b) propor ao usuário a regra de escala (tempo total da run ou nível) e não decidir sozinho; (c) o HUD deve mostrar progresso mesmo com ganho pequeno (ex.: XP atual/necessário). |
| 20 | **Tester:** paredes invisíveis / colisão travando onde não há nada (print na Vila da Folha, perto do torii) | **PENDENTE.** Causa provável em `src/scene/collision.ts`: o raio das construções é a largura do sprite × 0,3 (`COLLISION_RULES.building`), com centro na base. Nos marcos grandes (monumento de 22 m → 6,6 m de raio) e nos lugares regionais, o círculo invade a área à frente do desenho, que parece chão livre. Sugestão: fator menor (ex.: 0,18) com teto de raio (ex.: 3 m); conferir árvores, bambus e rochas. Testar com teste unitário e andando em volta de cada construção no navegador. |
| 21 | **Tester:** engrossar a borda do círculo do altar, sem aumentar o raio | **PENDENTE.** No `GameCanvas.tsx` (procure `ALTAR_RULES` e o desenho do círculo), aumentar só a espessura do contorno, na cor da raridade. `ALTAR_RULES.radius` (3) não muda. |
| 22 | **Tester:** falta peso ao levar dano ("é preciso ficar muito atento ao HP") | **PENDENTE.** Sugestão: borda vermelha na tela proporcional ao dano; som curto de impacto com limite de frequência (`src/audio/sfx.ts` já tem trava contra repetição); pulso na barra de HP. Respeitar o modo H e o volume configurado. |
| 15 | Arte: bijū de costas | Código pronto (rodada 59b). **Codex:** gerar `motion-costas-v1-1..3.png` e registrar em `BIJUU_BACK_SHEETS`. Pedido: `docs/development/PEDIDO-ARTE-BIJUU-COSTAS.md`. |
| 15b | Arte: padrão único de caminhada | Diagnóstico feito (rodada 61): as 58 folhas `*-roster-v1.png` desenham a caminhada reta para a câmera, em vez de três quartos virado para a direita. **Codex:** redesenhar só as fileiras 1–2. Pedido com a lista: `docs/development/PEDIDO-ARTE-CAMINHADA-PADRAO.md`. A medição `scripts/audit-walk-sheets.mjs` é auxiliar; a decisão é visual. |
| 18 | Arte: selos do Zabuza | Código pronto (rodada 63). **Codex:** `zabuza-seal-v1.png` e registro em `EXTRA_SEAL_SHEETS`. Pedido: `docs/development/PEDIDO-ARTE-ZABUZA-SELOS.md`. |
| 16 | Skill de jutsus em WebGL a partir dos 3 links do usuário (pedido de 11/11, nunca criada) | **PENDENTE.** Links: uol.com.br/start/listas/os-13-jutsus-mais-legais-de-naruto.htm · legiaodosherois.com.br/lista/os-10-jutsus-mais-poderosos-de-naturo.html · animativa.com/pt-br/blog/os-jutsus-mais-poderosos-de-naruto/. Criar `skills/animar-jutsu-webgl/SKILL.md` e um ponteiro em `.claude/skills/`. Conteúdo: tabela dos jutsus (usuário, natureza, aparência, trajetória, impacto) com o link da Narutopedia de cada um, o estado de cada efeito em `src/scene/techniqueEffects.ts`/`particleFx.ts` e o passo a passo para refinar. Ver `docs/24-AUDITORIA-DE-EFEITOS.md`. |
| E2E | Validação visual pendente (o Claude Code está sem navegador) | Conferir na tela: caminhada sem piscar; Mega Elite caído com halo e E; áreas das técnicas; música 10%; câmera deitada; fontes da HUD em 1280×720 e 1600×900; cursor virtual nas cartas, roleta, selamento, NPCs, mapa e ficha (Esc sempre solta, regra do navegador); entrada das bijū; névoa do Zabuza sem quadrados e com os selos; botão Arquivo Shinobi. |
| Decisões | Do usuário | (1) O golpe extra no corpo a corpo vale para os itens que já dão +1 projétil? Hoje vale. (2) Konan, afinidade da Tenten e sinergia da Folha saem da "chance de projétil" fracionária? (3) Curva de HP e reinício por zona: o usuário testa. (4) Liberar o núcleo de simulação headless (stress de 1.600 monstros, p95/p99), proposto em `docs/development/TESTING_POLICY.md`? (5) Perguntas de `docs/22-PROPOSTA-NOVOS-SHINOBIS.md`. |

## Onde está cada coisa (rodadas 54–63)

- **Lógica pura testada:**
  - `src/game/altarRewards.ts`: bênção do altar e golpes extras.
  - `src/game/progression.ts`: `heroHpScale`, `zoneThreat`, `zoneCurse`.
  - `src/game/drops.ts`: ímã.
  - `src/game/weatherCast.ts`: selos e névoa.
  - `src/game/bijuu.ts`: `BIJUU_BACK_SHEETS`, `bijuuFacesAway`.
  - `src/game/directionalArt.ts`: `EXTRA_SEAL_SHEETS`.
- **Cena:**
  - `src/scene/virtualCursor.ts`: mouse preso.
  - `src/scene/fallenShinobi.ts`: Mega Elite caído.
  - `src/scene/techniqueAreas.ts`: áreas das técnicas.
  - `src/scene/bossCombat.ts`: bijū.
  - `src/scene/enemyRenderer.ts`: inimigos em lote.
  - `src/scene/collision.ts`: colisão (item 20).
- **Testes:** `tests/*.test.mjs` (11 arquivos, 80 testes), `tests/helpers/load.mjs`, `tests/minimo.json`, `scripts/run-tests.mjs`, `scripts/mutation-check.mjs`, `scripts/audit-walk-sheets.mjs`, `TESTAR_JOGO.bat`.
- **Material do jogo de referência:** só fora do projeto, na pasta arquivada na raiz do workspace (`skills/referencia-externa/SKILL.md`).
