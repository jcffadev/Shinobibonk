---
name: contexto-e-decisao
description: Antes de qualquer tarefa no ShinobiBonk — e principalmente após reset de contexto ou troca de agente — ler o contexto do projeto (AGENTS.md, docs/18, docs/14, docs/13, CHANGELOG) e as skills do projeto, e decidir com base nas regras permanentes do usuário.
metadata:
  short-description: Ler contexto e skills antes de decidir
---

# Contexto e decisão

Use esta skill no **início de toda tarefa** no ShinobiBonk — e principalmente após **reset de contexto**, nova sessão ou handoff de outro agente (Claude Code, Codex, Bionic). Objetivo: antes de alterar qualquer coisa, saber a direção do projeto, as decisões do usuário e os procedimentos que já existem, para tomar sempre a melhor decisão.

## 1. Ler o contexto (nesta ordem)

1. `AGENTS.md` — regras permanentes, invariantes de design e colaboração.
2. `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` — direção atual (§2), **decisões permanentes do usuário (§3, não negociáveis)**, P/R de todas as rodadas (§4), estado do projeto (§5), pendências (§6) e mapa do que está onde (§7).
3. `docs/14-CONTEXTO-DO-CHAT.md` — o texto **integral** das mensagens do usuário e das respostas (rodadas mais recentes no fim do arquivo).
4. `docs/13-PENDENCIAS-PARA-CONTINUAR.md` — a fila de trabalho em andamento.
5. `CHANGELOG.md` — o que já foi entregue (topo = mais recente).
6. `README.md`, `docs/00-LEIA-PRIMEIRO.md` e o documento temático da funcionalidade que a tarefa toca (docs/01–12).

## 2. Ler as skills do projeto e usá-las

- Liste `skills/*/SKILL.md` e leia as que a tarefa envolver:
  - `contexto-e-decisao` (esta) — começar bem e decidir bem.
  - `documentar-projeto` — a skill de **salvar contexto**: registrar TUDO que mudou (docs, CHANGELOG, docs/14 integral, docs/18 resumo) na mesma tarefa.
  - `publicar-github` — commit + push ao fim da tarefa (regra permanente do usuário).
  - `criar-arte-shinobibonk` / `movimentar-shinobi` — arte e movimento dos shinobis.
  - `referencia-externa` — material do jogo de referência (zero rastro no projeto).
- Se um procedimento já existe em skill ou doc, **siga-o**; não invente procedimento paralelo nem fonte de verdade extra.
- Se a tarefa exigir algo sem skill (ex.: novo fluxo de publicação), proponha a skill ao usuário antes de criar.

## 3. Decidir

- Ordem de prioridade: **(1) decisão permanente do usuário** (docs/18 §3 + AGENTS.md) > **(2) o que o código faz** (código executável é a fonte da verdade do que existe) > **(3) o que a documentação promete**. Se divergirem, corrija a divergência e documente a correção.
- Decisão nova do usuário = nova entrada com data em docs/18 §3 (e §4), **sem apagar** as anteriores.
- Jogabilidade, balanceamento, visual ou regra que o usuário ainda não aprovou entra como **PROPOSTO**, nunca como feito.
- **TESTADO** só depois de execução real: `tsc -b`, `vite build`, `verify-rules`, e `verify-runtime` quando a mudança tocar gameplay/HUD/hub.
- Nunca publicar: credenciais (`Feedback da versão.txt`, `.env`), o zip de origem não verificada, `node_modules/`, `dist/`.

## 4. Fechar a rodada (sempre, nesta ordem)

1. `documentar-projeto`: registrar **TUDO** — docs temáticos, `CHANGELOG.md` (toda mudança, sem exceção), `docs/14` (pedido integral + resposta) e `docs/18` (resumo + direção).
2. `publicar-github`: `git status --short` → `git add -u` + novos arquivos por nome → commit em português (resumo no imperativo + corpo com itens do CHANGELOG) → `git pull --rebase origin main` → `git push origin main`. Nunca force push.
3. Reportar ao usuário em **pt-BR**: o que foi feito, o que foi validado (com o que passou), o hash do commit e os links, e as pendências que ficaram — incluindo perguntas em aberto que ele precise decidir.
