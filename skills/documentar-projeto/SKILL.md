---
name: documentar-projeto
description: Keep the ShinobiBonk Markdown documentation synchronized with source code, controls, assets, and gameplay changes in this repository.
metadata:
  short-description: Atualizar documentação do projeto
---

# Documentar projeto

Use esta skill sempre que editar ou revisar código, configuração, controles, assets, skills ou sistemas de jogo do ShinobiBonk.

## Regra de ouro (pedido do usuário, 11/11/2026): documentar TUDO

Cada alteração feita — código, configuração, controle, asset, sistema, skill, texto, decisão do usuário, teste ou estado — entra no registro **na mesma tarefa**, sem exceção. Não existe "mudança pequena demais para registrar". Onde vai cada parte:

- `CHANGELOG.md`: **toda** mudança entregue (o que mudou, por quê, limitações e o que foi testado) — jogo, documentação, skills e processo.
- `docs/14-CONTEXTO-DO-CHAT.md`: o pedido **integral** do usuário + a resposta final, mesmo que a solicitação tenha sido só uma pergunta.
- `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md`: resumo da rodada (§4), direção/estado (§2/§5), decisão permanente quando for o caso (§3) — sem apagar entradas passadas.
- `docs/13-PENDENCIAS-PARA-CONTINUAR.md`: o que ainda falta da rodada.

## Procedimento

Registre cada nova solicitação e a resposta final em `docs/14-CONTEXTO-DO-CHAT.md`, mesmo quando a solicitação for apenas uma pergunta. Reúna pedidos complementares da mesma rodada. Em caso de credenciais ou dados sensíveis, registre só o contexto necessário sem copiar o dado. Atualize o `CHANGELOG.md` em **toda** mudança (jogo, documentação, skills, processo) e use `docs/13-PENDENCIAS-PARA-CONTINUAR.md` para indicar o que ainda falta.

1. Leia `AGENTS.md`, `README.md`, `docs/00-LEIA-PRIMEIRO.md` e os documentos específicos da funcionalidade alterada.
2. Inspecione o estado atual dos arquivos afetados. Trate o código executável como fonte da verdade para o que existe; requisitos e artes conceituais descrevem intenção, não implementação.
3. No mesmo conjunto de mudanças, atualize os Markdown necessários:
   - `README.md`: propósito, estrutura do repositório, tecnologias e comandos para iniciar/buildar.
   - `docs/00-LEIA-PRIMEIRO.md`: estado resumido, controles confirmados e divergências importantes.
   - `docs/12-ARQUITETURA-E-ESTADO-DO-CODIGO.md`: mapa dos módulos, fluxo de estado, cena, UI, conteúdo, assets e limitações atuais.
   - Documento temático existente em `docs/`: regras e comportamento da funcionalidade.
   - `CHANGELOG.md`: mudança entregue e eventual limitação relevante.
4. Classifique cada afirmação como **IMPLEMENTADO**, **TESTADO**, **PROPOSTO** ou **PENDENTE** quando o estado puder ser confundido. Só use **TESTADO** após executar a verificação correspondente. Não promova comportamento planejado a concluído.
5. Documente controles reais, teclas, atalhos e tratamento de conflito com controles anteriores. Registre entradas, saídas, estado salvo, dependências e pontos de integração que mudaram.
6. Remova ou corrija texto antigo que contradiga o código atual. Preserve decisões do usuário; se o código divergir delas, corrija o código ou marque a divergência como pendente.
7. Revise os links relativos, nomes de arquivos e comandos nos Markdown. Ao finalizar, resuma quais documentos foram sincronizados.

## Escopo

Esta skill mantém documentação técnica e de produto do repositório. Ela não atualiza automaticamente o arquivo Markdown remoto/de contexto do chat fora deste projeto, não altera decisões de design sem autorização e não afirma que uma tela ou mecânica funciona sem conferir sua implementação.
