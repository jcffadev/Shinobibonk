# Instruções para o Qwen Code — ShinobiBonk

Siga o `AGENTS.md` (regras do projeto para todos os agentes). Este arquivo existe porque o Qwen Code procura o `QWEN.md`. Não duplique regras aqui; a política central fica em `docs/development/TESTING_POLICY.md`.

## Programa de testes (o mesmo do Claude Code e do Codex)

- **Perfil padrão EQUILIBRADO:** `TESTAR_JOGO.bat`, que roda tipos (tsc), `scripts/run-tests.mjs` com cobertura e piso mínimo, e o build.
- **LEVE** para checagens rápidas: `TESTAR_JOGO.bat leve`.
- **PROFUNDO** antes de publicar mudanças grandes de regra: `TESTAR_JOGO.bat profundo`, que inclui a prova por mutação de `scripts/mutation-check.mjs`.
- **Se o `.bat` não abrir** (por exemplo, num terminal sem cmd ou com espaço no caminho), rode os mesmos passos com o Node do projeto:
  - `node node_modules/typescript/bin/tsc -b`;
  - `node scripts/run-tests.mjs`;
  - `node node_modules/vite/bin/vite.js build`.
- **Toda mudança de regra de jogo vem com teste** em `tests/`:
  - suba `minimoDeTestes` em `tests/minimo.json` para o novo total, sem nunca abaixar;
  - para uma regra importante, acrescente uma mutação em `scripts/mutation-check.mjs`.

## Restrição de navegador (todas as IAs, desde 15/11/2026)

- Não abra Edge, Chrome, Chromium ou Firefox para testar, nem em modo headless, nem por Playwright, Puppeteer, Selenium ou scripts.
- `scripts/verify-runtime.mjs`, `scripts/verify-motion-atlases.mjs` e `scripts/smoke-browser.mjs` ficam suspensos. Não remova nem altere esses scripts para contornar a restrição.
- O que só dá para validar na tela fica registrado como **PENDENTE DE VALIDAÇÃO E2E**.

## Como reportar

Use os status da política: PASSOU, FALHOU, INSTÁVEL, NÃO EXECUTADO, NÃO MENSURÁVEL. Nunca declare aprovado o que não foi executado.
