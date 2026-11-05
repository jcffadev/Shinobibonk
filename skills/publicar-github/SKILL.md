---
name: publicar-github
description: Commit e push do ShinobiBonk para o GitHub (jcffadev/Shinobibonk) ao fim de toda tarefa que alterou arquivos do projeto.
metadata:
  short-description: Publicar atualização no GitHub
---

# Publicar no GitHub

Use esta skill **sempre que uma tarefa terminar com alterações** em código, configuração, assets ou documentação do ShinobiBonk. Também use quando o usuário pedir "subir", "dar push" ou "publicar".

- Repositório: `https://github.com/jcffadev/Shinobibonk.git` (remoto `origin`, branch `main`).
- Git no Windows: se `git` não estiver no PATH, use `& "C:\Program Files\Git\cmd\git.exe"`.

## Antes de publicar

1. A documentação precisa estar sincronizada. Siga `skills/documentar-projeto/SKILL.md`: README, `docs/00`, `docs/12`, o doc temático e o `CHANGELOG.md` devem descrever a mudança.
2. Rode as verificações e só continue se passarem. Use o Node do sistema ou o do Codex (`%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`).
   - `tsc -b` (`node node_modules/typescript/bin/tsc -b`).
   - `vite build` (`node node_modules/vite/bin/vite.js build`).
   - `node scripts/verify-rules.mjs`.
   - `node scripts/verify-runtime.mjs` quando a mudança afetar gameplay, HUD ou hub.
   - Se algo falhar, **não publique**: corrija ou relate a falha ao usuário.
3. Confira o que vai subir com `git status --short`.
   - Nunca publique `Feedback da versão.txt`: ele tem credenciais em texto puro e está no `.gitignore`.
   - Nunca publique `.env`, chaves, tokens ou senhas em texto puro. Procure com `git diff --cached` e uma busca por "senha", "password", "token" e "api_key".
   - Assets de terceiros só entram com licença verificada (regra do `AGENTS.md`). A prévia com marca d'água `animação do personagem.jpeg` fica fora.
   - Não suba `node_modules/`, `dist/` nem `*.tsbuildinfo`.

## Publicar

1. `git add -A`
2. Faça um commit em português, com uma linha de resumo no imperativo (até ~72 caracteres) e, se precisar, um corpo com os itens do CHANGELOG. Exemplo: `Adiciona modo debug admin e resumo pós-run`.
3. `git pull --rebase origin main`. Se houver conflito, pare e mostre ao usuário. Não resolva descartando trabalho dele.
4. `git push origin main`.
5. Informe o hash curto do commit, a branch e o link `https://github.com/jcffadev/Shinobibonk/commit/<hash>`.

## Regras

- **Nunca** use `git push --force`, `reset --hard`, `--no-verify` nem reescreva histórico já publicado sem pedido explícito do usuário.
- **Autenticação**: o Git usa o Git Credential Manager. Se o push pedir login, rode-o no terminal do usuário (ou peça que ele rode) para que a janela de login do GitHub apareça. Nunca digite senha nem token pelo usuário.
- Se o usuário disser que não quer publicar uma mudança, não faça push. O commit local pode ficar.
- Não declare publicado sem ver o push concluir com sucesso.
