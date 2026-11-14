# Instruções para o Claude Code — ShinobiBonk

Siga também o `AGENTS.md` (regras do projeto para todos os agentes). Este arquivo vale **apenas para o Claude Code**.

## Testing Policy — ShinobiBonk

### Status

**TEMPORÁRIO — Testes automatizados com navegador desabilitados** (pedido do usuário em 14/11/2026, válido só para o Claude Code por enquanto).

### 1. Restrições

Durante esta fase de desenvolvimento, o Claude Code **NÃO deve**:

- Abrir Microsoft Edge, Chrome, Chromium ou Firefox para testes.
- Executar Playwright, Puppeteer ou Selenium com navegador.
- Executar testes E2E ou visuais dependentes de navegador.
- Iniciar navegadores em modo headless.
- Executar múltiplos processos de testes simultaneamente.
- Iniciar múltiplas instâncias de navegadores para validação.
- Fazer capturas de tela ou automações de interface que dependam de navegador.

Neste repositório, ficam **suspensos**: `scripts/verify-runtime.mjs`, `scripts/verify-motion-atlases.mjs`, `scripts/smoke-browser.mjs` e qualquer script temporário com Playwright/Edge.

### 2. Testes permitidos

- Análise estática do código.
- Verificação de tipos: `node node_modules/typescript/bin/tsc -b`.
- ESLint, quando estiver configurado (hoje não está).
- Testes unitários e de integração sem navegador: `node --test --test-concurrency=1 "tests/*.test.mjs"` (atalho `TESTAR_JOGO.bat`).
- Regras do jogo sem navegador: `node scripts/verify-rules.mjs`.
- Build e validação de compilação: `node node_modules/vite/bin/vite.js build`.

Node: `%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.

Priorizar testes de baixo consumo de CPU e evitar paralelismo desnecessário. **Antes de executar qualquer comando de teste, verificar se ele inicia um navegador ou exige muita CPU.**

### 3. Testes pendentes

Quando uma alteração exigir validação no navegador:

1. Não executar automaticamente.
2. Registrar como **PENDENTE DE VALIDAÇÃO E2E** (CHANGELOG e `docs/13`).
3. Explicar o que precisa ser testado.
4. Continuar com as verificações disponíveis.

### 4. Preservação

- Não apagar testes existentes.
- Não modificar nem remover testes existentes apenas para contornar estas restrições.
- Não modificar configurações permanentes do projeto apenas para evitar testes.
- Não alterar arquivos fora do escopo autorizado (pasta principal: `C:\Shinobibonk projeto - Copia\ShinobiBonk_Codex_Projeto_Completo`).
- Não considerar um teste aprovado quando ele não foi executado.

### 5. Reativação

Os testes automatizados com navegador só podem ser retomados com **autorização explícita do usuário**.
