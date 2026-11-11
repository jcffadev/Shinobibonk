---
name: referencia-externa
description: Consumir material (prints, vídeos, tabelas, textos) do jogo de referência e anotar o que for aprendido no contexto arquivado FORA do projeto. Nunca salvar o arquivo no projeto nem publicar o nome do jogo em lugar algum.
metadata:
  short-description: Material de referência — consumir e registrar fora do projeto
---

# Material do jogo de referência (zero rastro no projeto)

Use esta skill **sempre que o usuário enviar ou citar material sobre o jogo de referência** — prints/screenshots, vídeos, tabelas, textos, links, ou mesmo o nome/apelido do jogo — para estudar, medir ou calibrar o ShinobiBonk.

**Objetivo (decisão permanente do usuário, 11/11/2026):** quando o jogo for publicado, não pode existir **NADA** referente ao jogo de referência no projeto nem na publicação. O projeto aprende com o material, mas não guarda nada dele.

## Regras invariáveis

1. **Nunca salvar o arquivo do material no projeto/repositório** — nem em `references/`, `docs/`, `history/`, `assets/`, nem em qualquer lugar da pasta do projeto. Se um arquivo chegar no worktree, mova para o contexto arquivado (fora do projeto) ou descarte.
2. **Nunca escrever o nome do jogo em arquivo rastreado**: não em `src/`, `docs/`, `README.md`, `CHANGELOG.md`, `skills/` nem em mensagem de commit. Em texto versionado, sempre "jogo de referência" ou "material de referência".
3. **Nunca publicar** o material, o nome do jogo ou valores copiados dele (GitHub, Netlify, artes, código, documentação, prints).
4. **Anotar tudo que for aprendido no contexto arquivado FORA do projeto** — a pasta na raiz do workspace que contém `CONTEXTO-COMPLETO.md` e `prints/`. Sempre com data, para as referências ficarem atualizadas.
5. Propostas de balanceamento extraídas do material entram como **PROPOSTO** (aguardando o usuário), nunca como parâmetro aprovado.

## Procedimento

1. Receber o material (imagem, vídeo, arquivo, mensagem, link).
2. Consumir: extrair o que for útil — telas/UI, valores numéricos, mecânicas, referências visuais — e comparar com o estado atual do projeto quando relevante.
3. Atualizar o contexto arquivado fora do projeto: nova seção `## Material de referência · DD/MM/AAAA` em `CONTEXTO-COMPLETO.md` com resumo fiel, valores e origem; copiar imagens para `prints/` (fora do projeto) — nunca para o repositório.
4. Se o material gerar mudança no projeto: implementar normalmente **sem citar a origem** e registrar a decisão em docs/14 e docs/18 como decisão do usuário.
5. Antes de qualquer commit, rodar `git status --short` e conferir que nenhum arquivo ou nome do material esteja rastreado; se encontrar, remover.
6. Commit + push das mudanças do projeto em português, seguindo `skills/publicar-github/SKILL.md`.
