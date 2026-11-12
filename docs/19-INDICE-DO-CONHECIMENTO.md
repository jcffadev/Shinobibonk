# 19 · Índice do conhecimento — onde cada coisa vive

> Criado em **12/11/2026** (rodada 36 — segmentação segura de contexto, pedido do usuário). Este arquivo é o **índice agregador**: ele **não duplica** conteúdo, apenas aponta para onde cada domínio do projeto está documentado e implementado. O contexto geral segue vivo em `docs/18` (direção/decisões) e `docs/14` (histórico integral) — nenhum deles foi resumido ou substituído.

**Como usar (recuperação seletiva):**
1. `AGENTS.md` — regras permanentes.
2. **Este índice** — localize o domínio da tarefa no mapa abaixo.
3. `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` — decisões permanentes (§3) e estado (§5).
4. O documento do domínio + o código-fonte correspondente (código = fonte da verdade do que **existe**).
5. Se a documentação estiver incompleta, conflitar ou a tarefa tocar múltiplos sistemas → leia `docs/14` (histórico integral) e o código, **sem limitar a investigação para economizar tokens**.

**Estados usados em todo o projeto:** `CONFIRMADO` (usuário aprovou) · `PROPOSTO` (ainda não aprovado) · `IMPLEMENTADO` (no código) · `VALIDADO` (testado) · `PENDENTE` (na fila).

## Mapa de domínios → onde vive

| Domínio | Documentação | Código-fonte (fonte da verdade) |
|---|---|---|
| **Scaling e fórmulas** (dificuldade, zonas, tempo, Final Swarm, crescimento, drops) | **[20-SCALING-E-REGULAS.md](20-SCALING-E-REGULAS.md)** | `src/game/progression.ts` · `combat.ts` · `tuning.ts` · `worldScale.ts` · `enemyTiers.ts` |
| **Atributos do jogador** (HP, dano, crítico, sorte, coleta…) | [20](20-SCALING-E-REGULAS.md) §6 + `docs/04` | `progression.ts` (`calculateStats`) · `powerlevel.ts` |
| **Personagens** (roster, versões por era, kits, passivas) | **[21-ELASTAO-DE-HEROIS.md](21-ELASTAO-DE-HEROIS.md)** + `docs/05` | `src/game/heroes.ts` · `evolution.ts` |
| **Habilidades** (técnicas, raridades, fusão, afixos) | `docs/04` · `docs/10` | `combat.ts` (GROWTH_ROLLS) · `techniqueMerge.ts` · `heroes.ts` (L/U) |
| **Itens e raridades** | `docs/04` | `src/game/catalog.ts` |
| **Pílulas e vitaminas** | [20](20-SCALING-E-REGULAS.md) §10 + `docs/04` | `src/game/pills.ts` · `pillPreview.ts` |
| **Status e efeitos** (veneno, queima, lentidão, genjutsu) | `docs/09` | `combat.ts` · `GameCanvas.tsx` |
| **Economia e progressão** (Ryu, EXP, roleta, inflação) | `docs/09` · `docs/10` · [20](20-SCALING-E-REGULAS.md) §9 | `itemTrade.ts` · `roulette.ts` · `progression.ts` |
| **Missões e desbloqueios** | `docs/10` · `docs/11` | `missions.ts` · `unlockMissions.ts` · `missionBag.ts` · `preparation.ts` |
| **Inimigos e chefes** (tiers, elites, megas, bijuu, boss) | [20](20-SCALING-E-REGULAS.md) §2–5 | `enemyTiers.ts` · `bijuu.ts` · `src/scene/bossCombat.ts` |
| **Mapas e eventos** (4 mapas, zonas, clima, construções) | `docs/01` · [20](20-SCALING-E-REGULAS.md) §11 | `maps.ts` · `worldScale.ts` · `terrainArt.ts` |
| **Selamento e suportes** (ajudantes, sinergias, altares) | `docs/03` | `allies.ts` · `synergy.ts` |
| **Arte e spritesheets** (atlas, pack, identidade chibi 2.5D) | skill `criar-arte-shinobibonk` · `docs/arte-atlas-2026-11-07.json` | `directionalArt.ts` · `inventoryArt.ts` · `assets/` |
| **Animações e movimento** (folhas, walk/action; fluidez da caminhada + proporção ao atacar — rodada 45; **follow amortecido dos aliados/Ninjas Selados + dead zone de orientação — rodada 46**) | skill `movimentar-shinobi` · `docs/14` (rodadas 38/39/45/46) | `src/scene/playerMotion.ts` (controlador compartilhado: `propCur` · `strideShown` · `stepTime`) · `src/scene/GameCanvas.tsx` (loop de aliados + Kuri, ~linhas 1249–1285) |
| **HUD, ficha, ranking** | `docs/02` | `src/main.tsx` · `src/ui/*` |
| **Performance e configurações** (FPS, GPU, V-Sync, debug F9) | `docs/12` · [20](20-SCALING-E-REGULAS.md) §12 | `settings.ts` · `tuning.ts` |
| **Arquitetura técnica** | `docs/12` | `src/scene/GameCanvas.tsx` · `README.md` |
| **Histórico e decisões** (todas as rodadas) | `docs/18` (resumo) · `docs/14` (integral) · `CHANGELOG.md` | — |
| **Fila de trabalho** | `docs/13-PENDENCIAS-PARA-CONTINUAR.md` | — |
| **Revisão para outros agentes** (o que o Qwen/Bionic fez + o que ficou p/ Claude-Codex — rodadas 41–49) | **[23-REVISAO-OUTROS-AGENTES.md](23-REVISAO-OUTROS-AGENTES.md)** (inventário por rodada · áreas de revisão com caminhos · notas p/ Claude-Codex · validações · push seguro) | `git log --oneline` (fonte da verdade do que entrou em cada commit) |

## Regras permanentes de manutenção (rodada 36, 12/11)

1. **Não destrutivo:** organização de contexto **nunca apaga, resume de forma destrutiva nem substitui** o contexto original (`docs/14` e `docs/18` seguem integrais).
2. **Sem fonte paralela:** um fato vive em **um** lugar canônico (o mapa acima); os demais apontam por link. Se um trecho pertence a vários domínios, use referência cruzada — não cópia.
3. **Atualização contínua:** toda alteração aprovada atualiza (a) o documento do domínio, (b) `docs/18`/`docs/14`/`CHANGELOG` (skill `documentar-projeto`) e (c) **este índice** se o mapa mudou. Se qualquer parte falhar, registre a inconsistência em `docs/13` — nunca declare sincronia sem verificar.
4. **Conflitos:** não escolha arbitrariamente; diferencie decisão antiga/atual/PROPOSTO; o **código** define o que existe; a documentação aprovada define a intenção; sem evidência, pergunte ao usuário. Decisão nova **substitui** a anterior **registrando a substituição** (nunca apagando).
5. **Referências visuais:** para personagens/sprites/animações, use **prioritariamente** as folhas e o atlas do ShinobiBonk já criados (identidade chibi 2.5D) + skills `criar-arte-shinobibonk`/`movimentar-shinobi`.
6. **Material externo (jogo de referência):** vive **fora do projeto** em `<pasta arquivada>/` (raiz do workspace) — prints, vídeos, frames e `CONTEXTO-COMPLETO.md`. **Nunca** entrar no repositório (skill `referencia-externa`). Zero menção ao nome do jogo de referência em qualquer arquivo rastreado.

## Manifesto da organização (rastreabilidade — rodada 36)

| Ação | Origem | Destino | Estado |
|---|---|---|---|
| Ín­dice agregador criado | pedido do usuário (prompt de segmentação, 12/11) | `docs/19` (este) | IMPLEMENTADO |
| Fórmulas consolidadas (com valores exatos do código) | `progression.ts`, `combat.ts`, `tuning.ts`, `roulette.ts`, `pills.ts`, `worldScale.ts` | `docs/20` | IMPLEMENTADO (valores lidos do código em 12/11; revisar ao mudar balance) |
| Elenco consolidado (24 base + 32 versões + fila de novos) | `heroes.ts`, `docs/13` (fila rodada 35) | `docs/21` | IMPLEMENTADO (roster); novos personagens = PROPOSTO |
| Backup integral do projeto (fora da pasta do projeto) | `ShinobiBonk_Codex_Projeto_Completo/` (2.882 arquivos, sem `node_modules`) | `backup-ShinobiBonk-2026-11-12.zip` na raiz do workspace | VALIDADO (contagem 2.882/2.882, 0 `node_modules`, hashes de amostra iguais) |
| Skills atualizadas para o fluxo de recuperação | `contexto-e-decisao`, `documentar-projeto` | ambas | IMPLEMENTADO |
| Domínios "ComfyUI" e "QWEN.md" do prompt | — | **NÃO APLICÁVEL** — o projeto não usa ComfyUI (arte via skill + gerador do usuário) e não tem QWEN.md (equivalente: `AGENTS.md` + `skills/`) | REGISTRADO |

## Validação da rodada 36 (FASE E)

- [x] Inventário de contextos/skills feito (mapa acima; 14 docs + 6 skills + AGENTS.md + CHANGELOG).
- [x] Backup integral criado e verificado **antes** de qualquer alteração (hashes de amostra conferidos).
- [x] Nenhum arquivo de contexto original apagado ou resumido (git: apenas **aditivos** + atualizações de sync).
- [x] Nenhum código do jogo ou asset alterado nesta rodada.
- [x] Todo bloco novo tem origem (código ou pedido do usuário) e estado.
- [ ] Trechos sem categoria segura: **nenhum** (todos os domínios do prompt mapeados; os 2 inaplicáveis registrados no manifesto).
- [x] Links relativos verificados ao finalizar.
