# Contexto Permanente — Perguntas & Respostas

> **Para que serve:** preservar, para sempre, a direção da conversa — o que o usuário pediu, o que foi respondido, o que virou decisão e onde o projeto está. Este é o primeiro arquivo de contexto que qualquer agente (Claude Code, Codex, Bionic) deve ler, depois do `AGENTS.md`, antes de trabalhar.
>
> **Regra permanente de manutenção (todo agente, toda rodada):**
> 1. Ao terminar qualquer solicitação do usuário, atualizar a entrada correspondente em §4 (resumo P/R + estado) e, se for o caso, §5 (estado atual).
> 2. O texto **completo** das mensagens vai em [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) (regra do AGENTS.md); este arquivo guarda o resumo e a direção — não duplicar o texto integral.
> 3. Decisão que se torna permanente: promover para §3 com a data.
> 4. **Nunca apagar entradas passadas.** Mudança de decisão = nova entrada em §3 que referencia a substituída (com data).
> 5. Estados: **CONFIRMADO / IMPLEMENTADO / TESTADO / PROPOSTO / PENDENTE** (regra do AGENTS.md).
> 6. Se a rodada alterou o projeto, sincronizar também README.md, docs/00 e CHANGELOG.md.

## 1. O que é o ShinobiBonk

Survivor/roguelite de ninja (temática Naruto, identidade 100% original) para navegador, inspirado na **experiência** de um jogo de referência externo (nenhum nome, asset ou mecânica copiada; o material de referência foi arquivado fora do repositório em 11/11/2026 — ver §7).

- Mundo 3D estilizado (2.5D) em visão isométrica com relevo, montanhas e construções; personagens em pixel art chibi (billboards), câmera orbital 360°.
- 24 famílias / **56 versões independentes** de shinobis jogáveis (cada versão tem kit, passiva, Ultimate e caminhada próprios); missões em cadeia para liberar versões.
- Runs por zonas com hordas contínuas, eventos, altares, mega elites (selamento), guardiões, Final Swarm, bijū final e ranking local.
- Economia: **Ryu** (run) e **Lamens** (conta, só pelo desempenho da run). Técnicas, pílulas, itens, árvore permanente, oficina de fusão (sapos do monte).
- Stack: React 19 + TypeScript + Three.js, Vite 8 (`src/`). `game/index.html` é o protótipo Canvas 2D legado.
- Publicação: commit + push em português para `origin main`; deploy no Netlify **manual** (pasta `dist` ou zip com `index.html` + `assets/` na raiz — drag & drop instável acima de ~50 MB).

## 2. Direção atual (11/11/2026)

**Onde estamos:** o jogo roda no Netlify (404 resolvido — era upload parcial); o ajuste automático de desempenho foi **removido a pedido do usuário** — a imagem fica 100% nas configurações de Gráficos (Qualidade, Limite de FPS, Resolução); **PENDENTE**: validar FPS em GPU real. O material do jogo de referência saiu do projeto e vive numa pasta arquivada na raiz do workspace (fora do repositório).

**Próximos passos (fila viva em [13-PENDENCIAS-PARA-CONTINUAR.md](13-PENDENCIAS-PARA-CONTINUAR.md), em ordem do usuário):**
1. **Kankuro sem ataque animado (URGENTE)** — folhas completas de Kankuro 1/15/30 e Kushina 1; revisar/refinar Neji 1/15, Sasuke Genin, Naruto Clássico/Shippuden.
2. **Revisar as 56 versões visualmente** (repouso → andar → ataque → pulo → dash; frente/costas; como ajudante). Padrão: Naruto Academia; exceções Lee, Guy e Gaara.
3. **Medir balanceamento em run real** (tempo até níveis 2/4/6, abates aos 60 s, vivos aos 30/60/90 s; meta "nível 2 em 15–25 s, nível 6 em 80–100 s"); as propostas numéricas estão no arquivo arquivado, **nenhuma foi aprovada**.
4. Efeitos/prévias (Susanoo por lançador, Gamabunta, clones correndo).
5. Mapas com o mesmo padrão de chão/construções (atlas do primeiro mapa) — Areia/Pedra/Névoa já integrados, auditoria visual pendente.
6. Run completa de 3 zonas → bijū → saída → ranking; FPS em GPU real.

**Metas de longo prazo:** 1.500–1.600 inimigos simultâneos (Final Swarm até 8.000); meta de 5 milhões de abates; fluidez alta no hardware do usuário; depois, cadastro com servidor e hospedagem da alpha (hoje o perfil é local, por navegador).

## 3. Decisões permanentes do usuário

Decisões de longa duração. Mudança de qualquer item = nova entrada aqui com a data, sem apagar a antiga.

| Data | Decisão (CONFIRMADO) |
|---|---|
| 05/11 | **Sempre commit + push ao finalizar cada tarefa** (pedido repetido do usuário). |
| 05/11 | **Sempre registrar perguntas e respostas** no contexto do chat (docs/14) — e, desde 11/11, também o resumo/direção neste arquivo. |
| 05/11 | Nada de Pokémon nem nomes/tema do jogo de referência no projeto; eventos renomeados (Provocação do guardião, Bênção de Tsunade, Maldição de Orochimaru, Roleta da Tsunade, Plano do Shikamaru). Em 11/11 o material de referência foi **removido** do projeto e arquivado numa pasta fora do repositório (raiz do workspace). |
| 05/11 | **Naruto Academia e Manto da Kurama são o padrão** de movimentação/animação; fora de revisão. Exceções: Lee, Guy e Gaara (movimentação própria). |
| 06/11 | Level-up oferece **somente técnicas e pílulas**; itens só por recompensas (mapa, roleta, drops). Máximo de **4 cartas** (inclusive após banir/atualizar). |
| 06/11 | **Banir é por nome**, do pool inteiro da run (independente de raridade/nível). |
| 06/11 | Pílula **sobe 1 nível por escolha**; a raridade multiplica a potência (×1 a ×2). Pílulas **nunca** entram em casa/planejamento; itens planejam com "Colocar na bolsa ninja". |
| 06/11 | Mercador: **estoque atual com preço fixo** ao comprar/reabrir; o próximo estoque é cotado por raridade × compras acumuladas × tempo de run. |
| 06/11 | Fundir/Combinar (oficina dos sapos) **1× por zona**, uso compartilhado entre as duas ações. |
| 06/11 | Planejamento de missão: levar no máximo ~40% das técnicas aprendíveis por shinobi (60% bloqueado), **escalonável** conforme novos shinobis/habilidades; "planejar" = favoritar; estrela abre Treinamento com Jiraiya (até 4 técnicas +15%). |
| 06/11 | **Ultimate desde o nível 1 em todas as versões**; R manual e **tecla Y obrigatória** (AUTO no botão R é o mesmo). A Ultimate recebe melhorias de dano total (restrita a projétil ou não). |
| 06/11 | Mega elites: primeiro ~**20 mil HP** escalando para **milhões** nos minutos finais; o scale do personagem acompanha. **4–6 capturáveis por zona (RNG)** + ~2 para selar na conta. |
| 06/11 | Economia exponencial: kunai/shuriken podem custar **milhões** no late game (inflação de preço mantida). |
| 06/11 | Drops de lamen **até 5%** (drops de monstro; recompensa final separada). |
| 06/11 | Drops distinguíveis: orbe azul (Chakra), essência roxa (XP, maior em elite/mega/guardião), moeda dourada 両 (Ryu), tigela (cura), pílula rosa, item laranja. |
| 06/11 | Selamento: **Shinobi para selar** (ciano) desbloqueia na conta sem buff; **Mega Elite** (vermelho) vira ajudante da run; **Elite amarela** não é capturável. Kill reward não duplica. |
| 07/11 | Contas locais: **Guest numerado** fora da conta; "Criar conta" promove o convidado mantendo o progresso. |
| 07/11 | Afiliações (vilas/clãs/organizações), papéis de ajudantes (médicos curam/coletam; ofensivos dão taijutsu/genjutsu/ninjutsu) e shurikens/corpos com emboscada: **Naruto Wiki/Narutopedia** é a fonte canônica (citar a página). |
| 07/11 | **Direção de arte (receita do usuário):** pixel art chibi, cenário 3D isométrico (2.5D), paleta/proporção únicas, animações de caminhada/ataque/dano/Ultimate; nunca sprites/modelos oficiais; efeitos seguem **elemento + nome da habilidade** (referência visual STORM, geometria original). |
| 07/11 | Modo Sábio: ícone com a **cara do personagem** + aura de atlas enquanto ativo. Gamabunta: **espada (tantō) + cachimbo**; óleo na boca, fogo perto do alvo. Clones **correm** até o alvo (nunca estáticos). |
| 11/11 | **Nunca publicar** `artifacts/sb-swishes-source.zip` (origem/licença não verificada) nem credenciais. Nunca force push. |
| 11/11 | **Desempenho/imagem: sem ajuste automático** (pedido do usuário) — o jogador configura como quiser em Gráficos (Qualidade, Limite de FPS, Resolução). O governor de 11/11 foi removido no mesmo dia. |
| 11/11 | **Toda a comunicação com o usuário é sempre em português** (pedido reiterado do usuário), mesmo quando ele escreve em inglês. |
| — | Terminologia: `attackSpeed` = **velocidade de ataque** (nunca "cadência"). pt-BR, objetivo e técnico. |

## 4. Registro cronológico de P/R (todas as rodadas)

Resumo de cada rodada com o estado. Texto integral dos pedidos e respostas: [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) (seção de mesmo título) e, para o chat anterior, [ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md](../ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md) (raiz do projeto).

| # | Rodada (tema) | P (resumo) | R (resumo) | Estado |
|---|---|---|---|---|
| 1 | Animações + bugs (Asuma) | Animar todos os jogáveis e evoluções; bugs de roleta/pílula sem escolha/sinergia; limite de monstros 1.600; "sempre commit ao finalizar" | Asuma com atlas próprio; 24 jogáveis com poses; sinergia com Naruto duplicado corrigida; pílulas sempre com escolha; contador do HUD lê a simulação total; commit `729749a` | IMPLEMENTADO/TESTADO (navegador); GPU real PENDENTE |
| 2 | Mapa 3D + câmera | "Transformar o mapa em 3D"; inclinação da câmera travada | Chão já é malha 3D (objetos ainda sprites); inclinação mínima ~7° com proteção acima do terreno | IMPLEMENTADO |
| 3 | Arquivo de P/R permanente | "Crie um arquivo markdown… minha pergunta, sua resposta, sempre" | Nasceu o docs/14 + regra no AGENTS.md; este arquivo (18) é o índice de direção | CONFIRMADO (regra permanente) |
| 4 | Folhas direcionais | Folhas dos outros personagens no padrão do Naruto; Sakura com a skin inicial; usar o estático como base do movimento | Folhas de Naruto/Sasuke/Sakura refeitas do sprite estático; regra documentada na skill de arte | IMPLEMENTADO (lote 1) |
| 5 | Itens × cartas | "Só itens em recompensas do mapa"; 5ª carta após banir | Roleta/drops só itens; pílulas/habilidades só no level-up; teto de 4 cartas mesmo após banir | IMPLEMENTADO |
| 6 | Mouse + relevo | Girar sem segurar botão; montanhas para esconder o "cinza" | Mouse livre gira/inclina; elevações internas, montanhas externas, céu em gradiente | IMPLEMENTADO |
| 7 | Caminhada de todo o elenco | "Faça de todos" | 56 formas com 4 quadros frente + 4 costas por forma + espelhamento; commit `9ff5dfb` | IMPLEMENTADO/TESTADO |
| 8 | Banimento, pílulas, HUD, desistir | Banir por nome; pílula 1 nível por escolha; pílulas de incenso/XP; esconder mira; portal de bijū; desistir em 2 cliques; Lee/Guy com socos/chutes | Tudo aplicado; pílulas de Incenso e Pergaminho criadas; confirmação dupla no desistir | IMPLEMENTADO/TESTADO |
| 9 | Efeitos, Chōmei/Gyūki, bolsa, 1.600 | Efeitos fiéis à obra (STORM); Chōmei e Hachibi fiéis; filtro de raridade na bolsa; performance | Efeitos por natureza + golpes (geometria original); Chōmei/Gyūki refeitos das referências; botões de raridade; instanciamento | IMPLEMENTADO; TESTADO headless (6,77 FPS SwiftShader — GPU real PENDENTE) |
| 10 | Mega rodada: jogabilidade, arte, planejamento | Trava do ponteiro, F9 kunai, Ichiraku/Teuchi, remover "clique para retomar", lamen ≤5%, rebalancear HP (20 mil → milhões), RNG 4–6 capturáveis/zona, IA ranged, Tenten ×1,5, Gamabunta (espada+cacheiro→cachimbo, óleo→fogo), Kage Bunshin correndo, oficina de fusão/combinar (1×/zona), plano 40/60, ícones de Modo Sábio com a cara, Treinamento com Jiraiya +15%, Ultimate com dano total | Tudo implementado conforme §3; escala em docs/04; 47 verificações no Edge | IMPLEMENTADO/TESTADO (headless); balanceamento PENDENTE |
| 11 | HUD em jogo + Ryu curto | Grade de itens com rolagem, minimapa sem corte, barra de missão em blocos, SINERGIAS recolhível, Ryu curto | Aplicado e validado em 1440×900 e 1366×768 com 5 ajudantes + 80 itens | IMPLEMENTADO/TESTADO |
| 12 | Final Swarm + pílulas + altares | Swarm parava em 300/1.600; pílula "pegada sozinha"; altar por raridade pisar/cair | Teto 1.600×fator até 8.000 com reposição; cartas novas ignoram entrada por 0,5 s; altar começa ao pisar, dreno 4–18%/s por raridade | IMPLEMENTADO/TESTADO |
| 13 | Versões separadas | 56 personagens únicos (não evoluem); cadeia de missões (jogar com anterior + capturar); pulo/dash do Naruto Academia; 3 kunais do boss | Versões independentes com kit/passiva/atributos; `playWith` + missões escaladas; prioridade de pulo/dash; kunais em círculo com coleta prioritária; saves válidos | IMPLEMENTADO/TESTADO |
| 14 | Pílulas com prévia + listas | Pílula mostra atributo atual→novo; pergaminhos por elemento; "Itens em casa" com até 12 listas | `pillPreview.ts` em cartas/ficha/plano/barra; filtro por elemento; sub-aba de listas compatível com o save antigo | IMPLEMENTADO/TESTADO |
| 15 | Calibração com a wiki de referência | Tabelas referência × atual × proposta, só mudar o claramente inconsistente | docs/15 criado **sem alterar nada**; propostas (venda proporcional, Ryu com inflação, HP do guardião pelo dano do jogador, preços do Lab, máximos 5–8) ficaram PROPOSTO. Em 11/11 o doc foi arquivado fora do projeto | PROPOSTO (aguardando decisão) |
| 16 | Ultimate por fase + ajudantes como versões | Conferir Ultimate Nv. 1 em todas; mega/ajudante como versão avançada por zona, sem família repetida | Corrigidas 2 Ultimates fora de fase; buff da família escalado; equipe sem família duplicada; saves válidos | CONFIRMADO/IMPLEMENTADO |
| 17 | Filtro de raridade colorido | Botões combináveis nas cores do jogo no plano e na Bolsa | `RarityFilter` colorido, combinável, com contagem; cores em `src/rarity.css` | IMPLEMENTADO/TESTADO |
| 18 | Auditoria GitHub + Susanoo | Conferir GitHub × pasta; folhas de Susanoo (Sasuke Rinnegan, Itachi, 3 Madaras); "sempre coloque as perguntas e respostas lá" | HEAD × origin conferidos; 5 folhas integradas na cópia de trabalho; 80 células validadas; registro P/R virou regra | IMPLEMENTADO/TESTADO; integração WebGL PENDENTE |
| 19 | Dash, Sakura/Gaara, selo, contas | Dash para trás invertendo; Sakura revisada; Guest numerado + criar conta; afiliações via Narutopedia; emboscadas (shuriken/corpo); Gaara com cabaça + flutuar; selo nas mãos de todos | Dash captura a direção no Shift (ambos os lados); folhas de Sakura e Gaara; cadastro local com promoção de Guest; selo do Naruto em 4 versões | IMPLEMENTADO/TESTADO; restante do elenco PENDENTE |
| 20 | Continuação 07/11: WASD, mercador, oficina | WASD travada; mercador não deve subir preço do estoque atual; 2 abas nos sapos; fusão/combinar 1× por zona | Tecla oposta com prioridade; preço fixo do estoque atual + cotação do próximo; oficina com 2 abas e ícones; uso único por zona | IMPLEMENTADO/TESTADO (56 verificações) |
| 21 | "O que resta?" | Fila do que falta | Conciliar as duas linhas de trabalho; 56 versões; selos; Susanoo WebGL; recalibração; terreno/GPU; run prolongada | PENDENTE (docs/13) |
| 22 | Publicação imediata + mapas | Mesma padrão de chão/construções em todos os mapas; ESC sem clique; "envie logo" | 9 folhas de pulo/dash + 3 completas + chão de Areia/Pedra/Névoa + 9 construções; retomada por Esc; push `badcee4` | IMPLEMENTADO/TESTADO; auditoria visual PENDENTE |
| 23 | **Netlify 404 + FPS** (11/11) | 404 "index.html não existe"; depois "por que o FPS está tão baixo? Resolva o FPS" | 404 era **upload parcial** (só index.html, sem assets/) — resolver subindo `dist` inteira/zip na raiz; FPS: config por domínio no `localStorage` fez o domínio novo nascer pesado → `adaptiveGovernor.ts` (reduz/devolve pixel ratio) + opção "Ajuste automático de desempenho" | IMPLEMENTADO/TESTADO headless; **validação em GPU real PENDENTE** |
| 24 | **Arquivar e remover o jogo de referência** (11/11) | "Gerar um arquivo com todo o contexto… e deletar COMPLETAMENTE do projeto qualquer coisa que relate o jogo" | docs/15/16/17 íntegros + 44 prints descritos + 54 originais + citações de chat + medições do vídeo → pasta arquivada na raiz do workspace (`CONTEXTO-COMPLETO.md`, fora do repo); 101 arquivos apagados do projeto; 11 arquivos reescritos para "jogo de referência"; commit `4ef107c` | CONCLUÍDO |
| 25 | **Este arquivo** (11/11) | "Crie um .md de contexto de perguntas/respostas para sempre manter o contexto e a direção" | Criado `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` + regra no AGENTS.md de mantê-lo a cada rodada | IMPLEMENTADO |
| 26 | **Idioma da comunicação** (11/11) | "Você sempre falará comigo em português… nossa comunicação sempre será em português" | Regra permanente confirmada; já consta no AGENTS.md ("Fale em português do Brasil"); registrada nas decisões permanentes | CONFIRMADO (permanente) |
| 27 | **Remover o ajuste automático de FPS** (11/11) | "Eu não quero o auto-render para melhorar FPS, deixe o jogador configurar como quiser nas configurações gráficas isso, volte ao normal como estava!" | Removidos `adaptiveGovernor.ts`, o uso em `GameCanvas.tsx`, a opção em Gráficos e o campo `autoPerformance`; tsc/build/verify-rules passaram | IMPLEMENTADO (validação em GPU real: ajuste manual em Gráficos) |

## 5. Estado atual do projeto (11/11/2026)

- **Repositório:** `https://github.com/jcffadev/Shinobibonk.git`, branch `main`, último commit `4ef107c` (remoção do material de referência). Worktree limpo; `artifacts/sb-swishes-source.zip` deliberadamente fora do Git.
- **Build:** React 19 + TS + Three.js 0.187, Vite 8. Últimas validações: 56–58 verificações no Edge headless, `tsc -b`, build, `verify-rules` e `verify-runtime`.
- **Publicação:** Netlify manual funcionando (`*.netlify.app`); desempenho **sem ajuste automático** (removido a pedido do usuário) — o jogador define Qualidade/Limite de FPS/Resolução em Gráficos (simulação ~1,8 ms/frame com 1.200 inimigos).
- **Conteúdo:** 56 versões jogáveis com caminhada; ~24 versões com folhas completas de ação; 4 mapas (auditoria visual pendente); catálogo de 94 itens; 19 pílulas; árvore permanente; oficina de fusão; roleta; altares por raridade; Final Swarm até 8.000.
- **Fora do repositório:** pasta arquivada na raiz do workspace — contexto completo do jogo de referência (docs antigos íntegros, prints, vídeo medido). O vídeo `referencia.mp4` (~240 MB) ficou na pasta de clips do Medal do usuário.
- **Atenção ao GitHub:** os prints e docs/15–17 **continuam no histórico** do repositório (removidos só da ponta). Apagar do histórico exigiria reescrita/force push — proibido; decisão separada do usuário.

## 6. Pendências vivas (espelho de docs/13)

1. Kankuro (URGENTE) + Kushina + revisão Neji/Sasuke/Naruto Clássico.
2. Revisão visual das 56 versões (inclusive como ajudantes).
3. Medir balanceamento em run real (níveis 2/4/6; abates; vivos) — propostas no arquivo arquivado, **nenhuma aprovada**.
4. Efeitos/prévias: Susanoo por lançador, Gamabunta, clones, sons com licença.
5. Auditoria visual dos 4 mapas (chão/construções/atlas).
6. Run prolongada 3 zonas → bijū → ranking; FPS em GPU real; cadastro com servidor e alpha (etapas posteriores).
7. Decisões pendentes do usuário: propostas de calibração (arquivo arquivado), itens da comunidade (fusão/Kekkei Genkai, projéteis vermelhos, água, som de hit, badges do pool).

## 7. Mapa do que está onde

| Conteúdo | Onde |
|---|---|
| Regras permanentes e invariantes | [AGENTS.md](../AGENTS.md) |
| **Este arquivo — direção + P/R permanente** | `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` |
| Registro **integral** das mensagens (pedido/resposta) | [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) |
| Chat anterior (histórico consolidado de 05/11) | [ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md](../ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md) |
| Fila de trabalho | [13-PENDENCIAS-PARA-CONTINUAR.md](13-PENDENCIAS-PARA-CONTINUAR.md) |
| Estado do código | [12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md) · [00-LEIA-PRIMEIRO.md](00-LEIA-PRIMEIRO.md) |
| Sistemas (câmera/mapas, ficha/HUD, aliados, itens/economia, personagens, hub/plano) | docs/01, 02, 03, 04, 05, 09, 10, 11 |
| Mudanças do jogo | [CHANGELOG.md](../CHANGELOG.md) |
| Contexto do jogo de referência (fora do repo) | pasta arquivada na raiz do workspace: `CONTEXTO-COMPLETO.md` + `prints/` |
| Referências próprias do projeto (screenshots/concept art) | `references/` · `history/` (versões antigas) |
