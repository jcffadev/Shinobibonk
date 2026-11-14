# Política de testes — ShinobiBonk

> **Documento central** de testes para todos os agentes (Claude Code, Codex, Qwen e outros) e para o usuário.
> Criado em 14/11/2026 a pedido do usuário. `AGENTS.md` e `CLAUDE.md` apontam para cá; as regras não são repetidas lá.
> Pasta do projeto: `C:\Shinobibonk projeto - Copia\ShinobiBonk_Codex_Projeto_Completo`.
> Node: `%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.

## Comandos disponíveis (estado real em 14/11/2026)

| Comando | O que faz | Navegador? | Perfil |
|---|---|---|---|
| `TESTAR_JOGO.bat leve` · `npm run test:leve` | Testes por código (`tests/`) sem cobertura | Não | LEVE |
| `TESTAR_JOGO.bat` · `TESTAR_JOGO.bat equilibrado` | Tipos (`tsc -b`) + testes por código com cobertura + build | Não | EQUILIBRADO (padrão) |
| `TESTAR_JOGO.bat profundo` | Equilibrado + prova dos testes (`scripts/mutation-check.mjs`) | Não | PROFUNDO |
| `npm test` · `node scripts/run-tests.mjs` | Executor dos testes por código com as garantias abaixo | Não | — |
| `npm run test:mutacao` · `node scripts/mutation-check.mjs` | Estraga 13 regras de propósito e exige que os testes acusem cada uma | Não | PROFUNDO |
| `node node_modules/typescript/bin/tsc -b` | Verificação de tipos | Não | todos |
| `node node_modules/vite/bin/vite.js build` | Build de produção | Não | EQUILIBRADO+ |
| `node scripts/verify-rules.mjs` | Regras do elenco, catálogo, técnicas e sorteios (também roda dentro de `tests/`) | Não | todos |
| `node scripts/verify-runtime.mjs` | Fluxo completo do jogo (~63 verificações) | **Sim (Edge headless)** | E2E — ver §A |
| `node scripts/verify-motion-atlases.mjs` | Animação das versões (fixture no navegador) | **Sim (Edge headless)** | E2E — ver §A |
| `node scripts/smoke-browser.mjs` | Fumaça no navegador | **Sim** | E2E — ver §A |

ESLint não está configurado no projeto.

## A. Política temporária de navegadores

**Decisão do usuário (14/11/2026): a restrição de navegador vale, por enquanto, SOMENTE para o Claude Code.** O Codex, o Qwen e os demais agentes continuam com a rotina de testes que já usavam (inclusive `verify-runtime` e `verify-motion-atlases`), seguindo o restante desta política. *Se o usuário estender a restrição a todos os agentes, basta trocar esta frase; as regras abaixo já valem para quem estiver restrito.*

Para o agente restrito (hoje, o Claude Code), até autorização explícita do usuário:

- Não abrir Edge, Chrome, Chromium ou Firefox para testes automatizados.
- Não executar Playwright, Puppeteer ou Selenium com navegador, inclusive headless.
- Não executar testes E2E visuais automaticamente (`verify-runtime`, `verify-motion-atlases`, `smoke-browser` e scripts temporários com navegador).
- Não iniciar navegadores por comandos indiretos, scripts ou ferramentas auxiliares.
- Não remover nem modificar testes existentes para contornar a restrição.
- Registrar validações visuais como **PENDENTE DE VALIDAÇÃO E2E** (CHANGELOG e `docs/13`), dizendo o que precisa ser visto.

A restrição é temporária: os testes de navegador continuam no repositório e voltam a ser usados quando o usuário autorizar. `scripts/run-tests.mjs` recusa qualquer arquivo de `tests/` que use navegador, então os testes por código nunca abrem um.

## B. Arquitetura de testes (camadas)

| Camada | Situação em 14/11/2026 | Onde |
|---|---|---|
| 1. Unitários | **IMPLEMENTADO** — HP, ameaça por zona, bênção do altar, golpes extras, ímã, orientação WASD, configurações | `tests/progressao`, `recompensas`, `movimento`, `configuracoes` |
| 2. Integração | **IMPLEMENTADO (parcial)** — Three.js no Node: corpo caído, áreas das técnicas; regras do elenco/catálogo; ligação do GameCanvas às funções testadas | `tests/cena`, `tests/regras-do-jogo` |
| 3. Simulação headless sem navegador | **PENDENTE** — o laço do jogo vive dentro de `src/scene/GameCanvas.tsx` (React + WebGL). Exige extrair um núcleo de simulação; avaliar impacto antes (ver §Propostas) | — |
| 4. Stress | **PENDENTE** — depende da camada 3 | — |
| 5. Regressão | **IMPLEMENTADO (parcial)** — piso de testes, cobertura mínima e prova por mutação | `tests/minimo.json`, `scripts/mutation-check.mjs` |
| 6. E2E visuais | **EXISTEM, temporariamente desativados para o Claude Code** (§A) | `scripts/verify-runtime.mjs`, `verify-motion-atlases.mjs` |

Princípios:
- Sempre que possível, testar a lógica de gameplay sem renderização. Regra nova importante vai para um módulo puro em `src/game/` (sem DOM nem Three.js) e o `GameCanvas` só chama esse módulo; os testes provam que o `GameCanvas` usa a função testada, e não uma cópia da lógica.
- Usar as regras reais do projeto (código + `docs/20-SCALING-EREGULAS.md`) como fonte de verdade. Não inventar fórmulas, atributos ou mecânicas.
- Não fazer grandes refatorações só para testar sem antes avaliar o impacto e propor ao usuário.

## C. Cenários de stress (planejados)

Reproduzíveis por seed, rodando no núcleo de simulação headless quando ele existir. Ainda **não implementados** (dependem da camada 3):

- **Monstros:** 1.500 vivos ao mesmo tempo; movimentação e IA em alta densidade; ataques simultâneos.
- **Combate:** projéteis e habilidades em área; efeitos de status simultâneos; críticos e multiplicadores de dano.
- **Buffs:** temporários e permanentes.
- **Abates e recompensas:** abates simultâneos; drops e coleta de XP; reposição de inimigos.
- **Progressão:** progressão prolongada; inventário e modificadores acumulados; recálculo de atributos após remover item/pílula/buff (sem resíduo).
- **Equipe:** selamento de shinobi e gerenciamento de suportes (máximo 5, recompensa sem duplicação); sinergias de equipe e vila.
- **Chefes:** Mega Elites, guardiões e bijū.

Hoje já há cenários de volume no nível unitário: 4.000 bênçãos por raridade, 500 áreas de técnica seguidas sem crescer a geometria, todas as 114 versões em 5 níveis.

## D. Confiabilidade

- Seeds determinísticas para reproduzir erros (`seeded(n)` em `tests/helpers/load.mjs`) e seeds variadas nos laços de volume.
- Isolamento: cada arquivo de teste roda em processo próprio; módulos que leem o ambiente ao carregar usam `loadFresh`. Nenhum teste depende da ordem de outro.
- Repetir medições de performance (quando existirem) e marcar como **INSTÁVEL** o resultado que oscila entre execuções.
- Validar invariantes: sem recompensa duplicada, sem buff residual após remover item, HP nunca diminui ao subir de nível, tetos respeitados.
- `scripts/run-tests.mjs` **falha** se algum teste falhar, for cancelado, pulado (`skip`) ou marcado `todo`; se um arquivo não executar teste; se o total cair abaixo de `tests/minimo.json`; ou se a cobertura da lógica pura cair abaixo do mínimo.
- `scripts/mutation-check.mjs` prova que os testes detectam defeitos: estraga regras de propósito e exige que cada mutação seja acusada. Os arquivos são restaurados em seguida.
- **Nunca declarar aprovado um teste que não foi executado.** Validação pendente não é aprovação.

## E. Performance e métricas

Quando houver simulação headless (camada 3), coletar: tempo médio por atualização, latência p95 e p99, memória e crescimento ao longo do tempo, entidades e projéteis ativos, tempo total dos testes, erros e exceções.

- Meta de renderização: **240 FPS ≈ 4,17 ms por quadro**.
- Desempenho de simulação sem navegador **não é FPS real**: mede só a lógica. FPS só se mede no jogo com a GPU do usuário.
- O `verify-runtime` (navegador) mede FPS em SwiftShader (renderização por software): também não é FPS de GPU real.
- Hoje o executor registra o tempo total e o tempo por teste. Latência e memória: **NÃO MENSURÁVEL** até existir o núcleo de simulação.

## F. Perfis de execução

| Perfil | Conteúdo | Paralelismo | Meta operacional de CPU* |
|---|---|---|---|
| **LEVE** | Testes por código sem cobertura (`TESTAR_JOGO.bat leve`) | Sequencial | ~40% |
| **EQUILIBRADO** (padrão de desenvolvimento) | Tipos + testes com cobertura + build (`TESTAR_JOGO.bat`) | Sequencial (limitado) | ~65% |
| **PROFUNDO** | Equilibrado + prova por mutação; stress prolongado e repetição quando existirem; navegador **só com autorização** | Limitado | ~85% |

\*Metas operacionais iniciais, não limites técnicos garantidos: monitorar o consumo real e reduzir o paralelismo se a máquina pesar. Hoje todos os perfis rodam os arquivos em sequência (`--test-concurrency=1` / `concurrency: 1`).

## G. Controle de execução

- Uma suíte por vez: não iniciar duas suítes ao mesmo tempo.
- Ler o comando antes de executar e confirmar que não abre navegador (para o agente restrito) nem pesa a máquina sem necessidade.
- Timeouts: `scripts/run-tests.mjs` encerra arquivo de teste travado após 120 s (conta como falha). Comandos longos de agentes devem ter timeout.
- Encerrar subprocessos ao terminar e não deixar servidores de teste ou processos órfãos (Vite, Node, navegador).
- Não rodar stress prolongado sem necessidade, nem iniciar tarefas pesadas automaticamente durante a edição de código.

## H. Relatórios

Todo resultado de teste reportado ao usuário ou registrado em docs usa um destes status:

| Status | Quando usar |
|---|---|
| **PASSOU** | Executado de verdade e aprovado |
| **FALHOU** | Executado e reprovado (com a mensagem) |
| **INSTÁVEL** | Resultado muda entre execuções com o mesmo código |
| **NÃO EXECUTADO** | Não rodou (por política, tempo ou erro de ambiente) |
| **NÃO MENSURÁVEL** | Não há como medir no ambiente atual (ex.: FPS real sem GPU) |

Registrar sempre: versão do código (commit), cenário, seed, configuração/perfil, métricas e limitações. O `run-tests.mjs` imprime data, commit, Node, sistema, núcleos, perfil e tempo total.

## Como acrescentar testes

1. Criar ou estender `tests/<area>.test.mjs` com `node:test` e `node:assert/strict`.
2. Lógica pura de `src/game/` com imports `.ts`: importar direto (entra na cobertura). Módulos de `src/scene/` ou com imports sem extensão: `load()` de `tests/helpers/load.mjs` (Vite dentro do Node, sem navegador).
3. Sorteios com `seeded(n)`; canvas 2D com `installCanvasStub()`; `localStorage` com `memoryStorage()`.
4. Subir `minimoDeTestes` em `tests/minimo.json` para o novo total (nunca abaixar para passar).
5. Regra importante nova: acrescentar uma mutação em `scripts/mutation-check.mjs` que a quebre.
6. Rodar `TESTAR_JOGO.bat` (equilibrado) e registrar o resultado com os status da §H.

## Propostas (aguardando decisão do usuário)

1. **Núcleo de simulação headless** (camadas 3 e 4): extrair de `GameCanvas.tsx` um módulo de simulação sem Three.js/DOM (inimigos, spawn, dano, status, drops, recompensas, selamento) para rodar 1.500 monstros e medir p95/p99 e memória. É uma refatoração grande e arriscada, porque o `GameCanvas` tem ~1.800 linhas com simulação e renderização misturadas. Sugestão: fazer em etapas, uma regra por vez, como já foi feito com altar, ímã e ameaça por zona.
2. **Invariantes de recompensa e atributos** já testáveis hoje sem refatoração grande: recálculo de `calculateStats` ao remover item/pílula, teto de suportes, `lootScale`/`megaEliteHp` por tier.
3. **Baseline de resultados**: salvar o relatório do `run-tests` (contagem, cobertura, tempo) em `artifacts/` e comparar com a execução anterior para acusar regressão de tempo ou cobertura.
4. **ESLint** com regras mínimas (`no-unused-vars`, `no-undef`) para análise estática.
