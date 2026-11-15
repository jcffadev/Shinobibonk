# 26 · Passagem para o próximo agente (14/11/2026)

> O usuário pediu para publicar tudo e continuar com outra IA ("publicar agora… vou continuar com outra IA… Anote tudo e deixe em fila"). Este documento é o ponto de partida. Leia antes: `AGENTS.md`, `docs/development/TESTING_POLICY.md`, `docs/13-PENDENCIAS-PARA-CONTINUAR.md` (tabela "Fila do usuário · 14/11/2026") e o topo do `CHANGELOG.md` (rodadas 54–63).

## Regras que valem

- **Pasta única:** `C:\Shinobibonk projeto - Copia\ShinobiBonk_Codex_Projeto_Completo`. Ao fim de cada item: documentar (CHANGELOG, docs/13, docs/14, docs/18) e fazer commit + push em `origin main`, sem force push.
- **Testes:** perfil EQUILIBRADO (`TESTAR_JOGO.bat` = tipos + `scripts/run-tests.mjs` com cobertura + build). Antes de publicar mudança de regra, rode `TESTAR_JOGO.bat profundo`, que inclui a prova por mutação (`scripts/mutation-check.mjs`, hoje 26/26).
  - Toda regra nova vem com teste em `tests/`.
  - Suba `tests/minimo.json` (hoje 93).
  - Para regra importante, acrescente uma mutação em `scripts/mutation-check.mjs`.
- **Navegador:** testes suspensos para Claude Code, Qwen e Codex até nova autorização explícita. Política central em `docs/development/TESTING_POLICY.md`.
  - A última execução do `verify-runtime` (13/11) parou num passo de configurações/câmera do Kimimaro, perto da linha 628 do script. Ele precisa ser rodado e revisado.
  - Desde então mudaram: cursor virtual, bijū, fontes, botão do Arquivo Shinobi e névoa do Zabuza.
- **Zero rastro do jogo de referência:** nada com o nome dele no projeto. O teste em `tests/regras-do-jogo.test.mjs` verifica os arquivos e o conteúdo dos .zip.
- `TEST_UNLOCK_ALL = true` (`src/game/account.ts`) deixa o elenco liberado para teste. Voltar a `false` antes de versão pública.

## Estado após a rodada 66

- Corrida com os braços para trás para as 114 versões. A próxima rodada deve seguir os novos pedidos de fusões, HUD, ranking e navegação em [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md).

## Estado após a rodada 64

- Caminhada em cinco vistas nas 114 versões. A seleção e a ficha usam o mesmo perfil. Ajudantes e Mega Elites compartilham as folhas. Os quatro modelos comuns têm vista em perfil na perseguição lateral. Consulte a [matriz](development/COBERTURA-DE-VISTAS.md).
- Hanzō e Haku têm arte original atualizada. Zabuza usa a folha de selos. Foco do jogador, fade, câmera e terreno foram atualizados. Revisão visual em partida segue aberta.
- Portal conserva XP próximo ou atraído. Colisão, borda do altar e feedback de dano foram implementados. As propostas sobre XP e projéteis aguardam decisão.
- A skill de jutsus WebGL está registrada. Tipos, build e 93 testes passaram nesta revisão.

## Fila, em ordem

| # | Item | Estado e o que fazer |
|---|---|---|
| 19 | XP ao trocar de zona | Correção de perda de orbes e leitura do HUD implementada. [Diagnóstico numérico](development/DIAGNOSTICO-XP-ZONA.md). Uma curva nova de XP por zona continua em proposta. |
| 20 | Paredes invisíveis junto a construções | Colisão por 18% da largura, com teto de 3 m. Conferência manual do entorno pendente. |
| 21 | Borda do altar | Contorno de 0,28 m voltado para dentro. Raio de 3 m. Conferência manual pendente. |
| 22 | Feedback de dano | Vinheta proporcional ao HP perdido, pulso da barra e som breve. Conferência manual pendente. |
| 15 | Arte: bijū de costas | **INTEGRADO E TESTADO POR CÓDIGO.** Três atlas em `public/assets/bijuu/motion-costas-v1-*.png`. Restam a prova visual em partida e a contagem de caudas em cada pose. |
| 15b | Movimento e retratos do elenco | Cinco vistas de caminhada, quatro fases por vista nas 114 versões. Quatro fases de pulo e dash de frente e costas. Faltam artes dedicadas de pulo/dash em perfil e diagonal na maioria das versões e validação visual. |
| 18 | Selos do Zabuza | Folha original dianteira e traseira integrada. Conferência do fluxo em partida pendente. |
| 16 | Skill de jutsus WebGL | [Skill](../skills/animar-jutsu-webgl/SKILL.md) e [auditoria de efeitos](24-AUDITORIA-DE-EFEITOS.md) atualizadas. Faltam aplicar as revisões por técnica. |
| E2E | Validação visual pendente | Conferir na tela: caminhada sem piscar; Mega Elite caído com halo e E; áreas das técnicas; música 10%; câmera deitada; fontes da HUD em 1280×720 e 1600×900; cursor virtual nas cartas, roleta, selamento, NPCs, mapa e ficha (Esc sempre solta, regra do navegador); entrada das bijū; névoa do Zabuza sem quadrados e com os selos; botão Arquivo Shinobi. |
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
