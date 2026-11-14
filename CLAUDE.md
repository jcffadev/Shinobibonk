# Instruções para o Claude Code — ShinobiBonk

Siga também o `AGENTS.md` (regras do projeto para todos os agentes). Este arquivo vale **apenas para o Claude Code**.

## Política de testes

Antes de executar testes, consulte:
`docs/development/TESTING_POLICY.md`

Respeite as restrições temporárias de execução de navegadores.
Não execute testes E2E com navegador sem autorização explícita.

### Restrição de navegador — ATIVA para o Claude Code (desde 14/11/2026)

Por decisão do usuário, **o Claude Code não abre navegador para testar** até nova autorização explícita. Detalhes na §A da política. Na prática:

- Não iniciar Edge, Chrome, Chromium ou Firefox, nem headless, nem por Playwright, Puppeteer, Selenium, scripts ou ferramentas auxiliares.
- Ficam suspensos para o Claude Code: `scripts/verify-runtime.mjs`, `scripts/verify-motion-atlases.mjs`, `scripts/smoke-browser.mjs` e qualquer script temporário com navegador. Eles **não** devem ser removidos nem alterados para contornar a restrição.
- O que só dá para validar no navegador fica registrado como **PENDENTE DE VALIDAÇÃO E2E**, com o que precisa ser visto.

### Como o Claude Code testa

- Perfil padrão: **EQUILIBRADO** (`TESTAR_JOGO.bat` → tipos + `scripts/run-tests.mjs` com cobertura + build). LEVE (`TESTAR_JOGO.bat leve`) para checagens rápidas durante a edição; PROFUNDO (`TESTAR_JOGO.bat profundo`, com a prova por mutação) antes de publicar mudanças grandes de regra.
- Antes de qualquer comando de teste, conferir se ele abre navegador ou pesa a CPU. Um comando de teste por vez, com timeout; encerrar subprocessos ao terminar.
- Respeitar as metas operacionais de CPU da §F e não rodar stress prolongado sem necessidade.
- Reportar ao usuário com os status da §H (PASSOU, FALHOU, INSTÁVEL, NÃO EXECUTADO, NÃO MENSURÁVEL), incluindo pendências e limitações. Nunca declarar aprovado o que não foi executado.
- Preservar a documentação existente: atualizar a política central em vez de duplicar regras aqui.
