# Fila atual do ShinobiBonk · 12/11/2026

O primeiro bloco registra a fila atual. Os blocos seguintes preservam os registros de rodadas anteriores.

## Rodada 53 · Estado e próximos passos

- Entregue: expansão para **96 versões de 56 famílias**, missões novas, Akamaru, expansão visual do Chōji, Zabuza na névoa, Fase 4 e contador de abates. Veja [elenco](21-ELASTAO-DE-HEROIS.md) e [efeitos](24-AUDITORIA-DE-EFEITOS.md).
- Pendente: comparar todos os jutsus com a obra e fazer efeitos próprios onde ainda há arte compartilhada. Nagato e Sasori já têm arte temática, com entidades completas ainda pendentes. Priorizar técnicas médicas, kits de pouco material canônico e Ultimates especiais.
- Pendente: inspeção em gameplay das versões novas como jogador, ajudante e Mega Elite, incluindo orientação em câmera girada, identidade de traje, pés e transições. A suíte de atlas verifica quadros e espelhamento.
- Fase 5 restante: sequência em tempo real, card de temporada, glossário e layout dos blocos de combate. Continuam pendentes a run completa com GPU real, a publicação externa e as propostas de escala de mapas.


## Confirmado e entregue

- 56 versões jogáveis de 24 famílias, com versões independentes; não há evolução de traje durante a run.
- Caminhada direcional nas 56 versões. As folhas registradas são usadas pelo controlador compartilhado do jogador, ajudantes e clones.
- Integração dos rascunhos do Claude com a main do Codex concluída em 11e0d18.
- Nove folhas novas de pulo/dash para Naruto 10/25/50, Lee 1/15/30 e Guy 1/15/30.
- 27 folhas completas action-v3: Sasuke 15; Hashirama 1/20; Kakashi 1/25; Itachi 1; Minato 1/15; Tsunade 1/15/30; Jiraiya 1/20; Orochimaru 1/15; Hinata 1/15/30; Pain 1; Shikamaru 1/15/30; Tobirama 1; Temari 1/15; Tenten 1/15.
- **Rodada 48 (12/11/2026):** **20 pedidos** (pedido integral em docs/14; resumo em docs/18) — (1) **"Não aprender" → "Deixar em casa"** no planner (`BuildPlanner.tsx`) · (2) **M/ESC/Tab**: fechar o mapa volta ao jogo sem abrir a ficha (`mapPanel` + `suppressUnlockPause`) · (3) **HUD de métricas** (RunSheet): Dano causado + Dano por segundo (formato 1,1M), sem "Dano por aliados", sem tabela de porcentagens, ganhos no topo · (4) **Zabuza Momochi** como Mega Elite no evento de névoa intermitente — **PENDENTE** (não existe no roster; anotação docs/23) · (5) **preço em verde/vermelho** — **OPCIONAL, não feito** · (6) **Isca Shinobi CONFIRMADA como PÍLULA** (rodada 47) · (7) **Treinamento esgotado**: atributo aleatório +0,6%/nível + HUD flutuante "Treinamento — <atributo> +0,6%" — cláusula "somente sorte na utilidade" **EM ABERTO** · (8) **Final Swarm 1.600** (era 8.000) + rampa progressiva até +7 min + monstros evoluem (pedido explícito) · (9) **XP por mob 8→5** (XP por abate sempre dropado — regra existente) · (10) **ficha mais escura** (papel2→papel3) · (11) **engasgada E/1-4**: `armSeconds` 0,5→0,2 s · (12) **raridade — JÁ ESTAVA ASSIM** (`rarity.css`) · (13) **HP com número — JÁ EXISTE** (RunSheet + HUD de combate) · (14) **Claude contribuinte no GitHub** — explicado (Co-Authored-By no commit da Rodada 38). **Travamentos atacar+andar + minionblock** persistem (anotação docs/23). Validado: tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404 (stress 1.600 inimigos). **Teste do usuário pendente.**
- **Rodada 47 (12/11/2026):** **13 pedidos** (pedido integral em docs/14; resumo em docs/18) — (1) **CONFIRMADO**: dano crítico **250%** / mega crítico **300%** (já estava no código — `rollCritical` em `progression.ts`) · (2) **YOOOO rápido**: `preloadYooo()` no boot (`sfx.ts` + `main.tsx`) — o 1º clique não espera mais o download · (3) **Isca Shinobi → Pílula** (a fase 4 da rodada 37 a transformou em item por engano — revertida): `pills.ts` (valores `enemyCount +15% · gold +12% · exp +8%` por nível) + item `shinobi-bait` **removido** do `catalog.ts` (saves antigos degradam graciosamente) · (4) **Treinar para todas as técnicas + auto-planeja** (`BuildPlanner.tsx` — antes era no-op nas não planejadas) · (5) **early game +200% (PROPOSTO — o usuário testa e ajusta)**: `ENEMY_SCALING` (hpBase 1,6→**3,2** · armorPerMinute .015→**.03** · maxArmor .6→**.72**) + `HERO_DAMAGE_FACTOR` **.41** (`heroes.ts`, era .55 hardcoded) — dificuldade total ≈ ×2,8–3,1 no minuto 0, em todas as dificuldades em suas devidas proporções; **BUG CORRIGIDO**: `version()` dividia pelo .55 antigo e fazia versões avançadas mais fracas que a base (naruto-genin 6,16 < naruto 7,38) · (6) **raridade visual**: ícone da carta no pool **preenchido** com gradiente da raridade + contorno interno 2 px (`ninja-theme.css`) · (7) **bordas temáticas** na ficha (`.sheet-banner`/`.sheet-column`/`.stripe.blue/.gold/.purple`/`.sheet-tile`) · (8) **botões do planner** (placa de pergaminho + selo hanko vermelho; "Permitir aprender" verde) · (9) **badge "★ Treinada · +15% de dano"** na RunSheet (o buff +15% já aplicava desde a rodada 39 — `hit()` em `GameCanvas.tsx`; agora visível na ficha) · (10) **selamento sem substituto continua a missão na hora** — sem tela/botão "continuar missão" (`nextSeal(); recaptureAfterChoice()`) · (11) **pool adapta a largura** ao nº de cartas: `cards-{1..4}` (430/690/930/1060 px) · (12) **auto-coleta ao pisar** (raio 1,8 m) para pickups comuns (Ryu · kunai/shuriken · drop do mega elite) — **sem "E"** e sem prompt; "E" agora cobre **só as emboscadas** (`cursedShuriken`/`ninjaBody`); altar **já** iniciava ao pisar (sem mudança); sem Ryu suficiente o item fica no chão (toast) · (13) **passada sem distorção**: `strideTarget = proceduralMotion ? stride : 0` (`playerMotion.ts`) — a passada procedural **nunca** sobrepõe folha desenhada; quadro de ataque 100% íntegro e o andar-livre vem do deslocamento da simulação. Validado: tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404 (testes de kunai reescritos para o fluxo de auto-coleta). **Aprovação do usuário dos 13 itens pendente (item 5 = PROPOSTO)**.
- **Rodada 46 (12/11/2026):** **caminhada dos Ninjas Selados (aliados) CORRIGIDA** (pedido do usuário: “a caminhada deles está bugada, devem caminhar/atacar/normalmente conforme seguem o jogador”) — causa raiz: **follow stop-and-go** do loop de aliados em `GameCanvas.tsx` (parava seco a cada 0,25 m do slot e saía “correndo” em `speed+2` → alternava idle↔andar a ~10 Hz, trocando de folha a cada ~0,05 s) + **orientação sem dead zone** (flip de fileira frente/costas ao andar de lado). Correção: **follow amortecido** `lerp(goal, 1−e^(−dt·R))` (R=8; R=16 no dash do jogador; band de assentamento `gap>0,18`; snap `gap>12` preservado) + **dead zone ±0,18 idêntico ao jogador** (`backwardView`/`leftward`); **Kuri** recebeu a mesma correção; ataque/repouso/cadência dos aliados **sem mudança** (já funcionavam — o bug era só a caminhada). Alterado: `src/scene/GameCanvas.tsx` (loop de aliados + bloco da Kuri). Validado: tsc · vite build · verify-rules (56/97/95) · verify-motion-atlases (56/560/0 erros) · verify-runtime (0 erros · 0 404) + **teste visual dedicado** (Playwright: Gaara + Kankuro recrutados, W/A, 7 frames — formação contínua, ataque visível, assentam em repouso, sem flicker/stop-and-go). **Teste do usuário pendente**.
- **Rodada 45 (12/11/2026):** **fluidez da caminhada “livre” + proporção ao atacar** (pedido do usuário: “a mudança de sheet's/imagem entre animada e não animada deve ser sincrono, tem que ser totalmente fluído… TAMBÉM revise os personagens mudando de tamanho perdendo proporção ao atacar”) — corrigidas **3 descontinuidades** na troca de folha em `playerMotion.ts`: **(a)** `propFactor` (bbox alfa da rodada 39, clamp 0,85–1,35) agora **suavizado** (lerp exponencial `propCur`, ≈0,15 s) — o personagem **não mais salta de tamanho/altura** a cada troca (âncora nos pés + exceções Choji/Gaara/Pain preservadas); **(b)** passada `strideShown` agora **sobe/desce** (lerp exponencial ≈0,1 s) no início/fim do golpe em vez de **ligar/desligar** de uma vez; **(c)** `stepTime` **contínuo** (não zera a cada parada) — a caminhada continua de onde parou em vez de reiniciar do quadro 0. **Estado estacionário inalterado** (só as transições suavizam). Alterado: `src/scene/playerMotion.ts` (3 pontos). Validado: tsc · vite build · verify-rules (56/97/95) · verify-motion-atlases (56/560/0 erros) · verify-runtime (0 erros · 0 404) + inspeção visual `combat.png`/`camera-horizonte.png` (sem bug gráfico). **Teste do usuário pendente.** Se aprovado, a regra 39 (proporção idêntica em movimento) volta a valer **sem** a regressão de fluidez; se ainda notar tamanho mudando no golpe, próximo passo é reduzir a diferença de bbox entre folhas de ação e repouso (arte).
- **Rodada 44 (12/11/2026):** **câmera e mouse** — câmera **mais deitada** (início pitch 0,74 → **0,55 rad**; piso deitado **0,05 rad (~3°)**, era 0,12), como no jogo de referência; sensibilidade do mouse em **taxa única e simétrica 0,0025 rad/px** em yaw e pitch (era 0,006/0,004 — a assimetria 1,5:1 era o “esquisito”), **1:1 sem aceleração** (rodada 29); **câmera centraliza o JOGADOR** (verificado: já era assim); hint do slider com **dica do Windows: velocidade do ponteiro 6/11** (o multiplicador do sistema pode somar ao raw input). Alterado: `GameCanvas.tsx` (pitch inicial + `turnCamera`) + `SettingsScreen.tsx` (hint do slider). Validado: tsc · vite build · verify-rules (56/97/95) · verify-motion-atlases (56/560) · verify-runtime (58 checks · 0 erros · 0 404) + inspeção visual do screenshot do piso (sem bug gráfico). Teste do usuário pendente. Decisões de interpretação aguardando aprovação do usuário (taxa 0,0025 · piso 0,05 · início 0,55 · dica Windows 6/11).
- **Rodada 41 (12/11/2026):** **marionetes únicas do Kankuro e do Sasori** — **Kuri** (máscara de raposa) como **companheira PERMANENTE** da família Kankuro (estilo Kiba+Akamaru: segue em formação, ataca com “Agulhas de Kuri”, **não** ocupa slot de ajudante, **não** entra em `allies`) + **Kuroari** (escorpião vermelho) como **entidade visual** da técnica “Kuroari” (dano **idêntico** ao golpe em área atual — zero mudança de balanceamento) · 4 folhas programáticas (Pillow, `scripts/generate-puppets.py`) · +10 asserções no `verify-rules`. Validado: tsc · build · verify-rules (56/97/95) · verify-motion-atlases (56/560) · verify-runtime (58 · 0 · 0). Pendente de aprovação do usuário: design da Kuri, visual da Kuroari, adiantar o herói Sasori (Onda 2), arte Pillow interina.
- **Rodada 40 (12/11/2026):** passiva **“Couraça” → “Colete Shinobi”** (pedido do usuário: “Deveria ser um colete Shinobi”) — buff inalterado (+2 armadura por nível), ícone do **colete** (sprite `jonin-vest` do atlas, mesma arte do item Colete Jonin) e **migração não destrutiva** do save `sb_permanent_levels` (a chave antiga é copiada para a nova e nunca apagada — quem já comprou os níveis mantém o buff; a conversão armadura→dano do Gaara também foi atualizada). Validado: tsc · build · verify-rules (56/97/95) · verify-runtime (58 checks · 0 erros · 0 404).
- Folhas anteriores: Naruto Academia, Sasuke Genin/Rinnegan, Neji Genin/Jonin, Asuma, três Sakuras, três Gaaras, três Madaras e Itachi Akatsuki. A existência da folha não equivale a aprovação visual.
- Retomada após Esc sem clique extra, Tab rápido sem pausa e ficha por P; mercador mantém preços do estoque atual; oficina tem Fundir/Combinar e um uso compartilhado por zona.
- Afiliações por versão e bônus de suporte; shuriken amaldiçoada e corpo de ninja com emboscadas.
- Chão de Areia/Pedra/Névoa e atlas de nove construções/marcos regionais conectados à cena.
- Susanoo por lançador no combate e prévia ligada ao mesmo rig WebGL.
- Reordenação das listas na Bolsa, prévia ao esquecer pílula no Ichiraku e botão de expandir inventário estão implementados. Conferir acabamento visual.

## Validação já executada

| Evidência | Cobertura | Limite |
|---|---|---|
| TypeScript, build e regras | Aprovados no lote bee4bba | Não aprovam aparência ou balanceamento |
| artifacts/runtime-checks.json | 58 verificações, sem exceções JS/404; lote integrado | Anterior às 24 folhas adicionais e à última integração da prévia Susanoo |
| artifacts/motion-review.json | 56 versões × 10 estados = 560 amostras; sem erros/404 | Fixture isolada; fallback também passa pelo estado. Não comprova que todas têm folhas próprias ou ataque correto em combate |
| artifacts/motion-review-1.png até -4.png | Folhas de contato reais do controlador | Inspeção visual completa ainda pendente |
| Performance headless | Última amostra: 3.029 inimigos, ~4,71 FPS em SwiftShader | Renderização por software; não é medição de GPU real |

## Prioridades em ordem

> **Rodada 56 (14/11/2026) — testes:**
> - **Feito:** política central em [development/TESTING_POLICY.md](development/TESTING_POLICY.md); 42 testes por código; prova por mutação 13/13; perfis no `TESTAR_JOGO.bat`.
> - **Feito (rodada 57):** fontes da HUD aumentadas, com teste de piso de 10 px. **PENDENTE DE VALIDAÇÃO E2E:** ver a HUD na tela.
> - **Depois, aguardando decisão do usuário:** núcleo de simulação headless para stress de 1.600 monstros (teto do jogo) e p95/p99; invariantes de recompensa e recálculo de atributos; baseline de resultados; ESLint.
> - **CONFIRMADO pelo usuário (14/11):** a restrição de navegador fica **só no Claude Code**. Codex e Qwen continuam como estão; o usuário vai testá-los e, se precisar, manda eles adicionarem a restrição.

> **Rodada 38 (12/11/2026):** animação andar+atacar **IMPLEMENTADA e TESTADA** (headless); HUD ninja **aplicada** (ficha P, Bolsa, Plano, Ataques, Passivas, configurações e resumo ainda só com os tokens — redesenho próprio PENDENTE); ABRIR_JOGO robusto; proposta de novos shinobis em [docs/22](22-PROPOSTA-NOVOS-SHINOBIS.md) com **15 perguntas e divergências canônicas** na lista aprovada da rodada 37 — **não implementar personagens novos antes da resposta do usuário**. Prioridade 5 (mapas): colisão e bordas IMPLEMENTADAS em 11/11; falta inspeção visual dos 4 mapas e da prévia da seleção. `TEST_UNLOCK_ALL = true` (elenco liberado para teste) — voltar a `false` antes da versão pública. Skill `animar-jutsu-webgl` (jutsus em WebGL, 3 links do usuário) PENDENTE: o subagente foi cortado pelo limite em 11/11.

1. **Kankuro RESOLVIDO** (usuário confirmou em 11/11/2026: "kankuro já foi corrigido" — arte das folhas 1/15/30 + walk/action v3 está no repositório). Restam deste item: **Kushina (1)** (quarta versão ainda sem folha completa) + conferida rápida do ataque automático em combate/como ajudante nas novas folhas.
2. **Revisar as 56 versões visualmente.** Prioridade a Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. Conferir repouso → andar → ataque, frente/costas, pulo, dash direito/esquerdo e recuperação. Naruto Academia é o padrão; Lee/Guy/Gaara preservam exceções. Repetir como ajudantes e em contexto de horda.
3. **Estudar e medir balanceamento.** Preservar o sistema existente. Comparar versões datadas da referência, vídeo fornecido e runs equivalentes. Registrar dano por alvo, tempo para matar, XP/minuto, abates/minuto, economia e Sorte. Diagnóstico inicial: a fórmula do mega cresce muito mais que a do guardião na mesma abertura. Ver o arquivo de contexto arquivado, fora do projeto. Não copiar propostas antigas como se fossem parâmetros aprovados.
4. **Efeitos e prévias.** Validar Susanoo de Madara/Sasuke/Itachi no jogador, ajudante, Ultimate e prévia; Kakashi tem estilo preparado, mas não possui versão Susanoo no elenco. Refinar efeitos por nome/natureza, origem nas mãos/boca, trajetórias, impacto e H. Conferir clones correndo e óleo/fogo de Gamabunta.
5. **Mapas e física.** Conferir os quatro mapas, chão/construções regionais, bases apoiadas, bordas sem vazio, câmera/zoom, climas, colisões e diagonais. Melhorar prévia da seleção caso ainda use representação antiga.
6. **Run completa e regressões.** Três zonas → bijuu em três fases → saída → Lamens/ranking/save. Exercitar desbloqueio por selamento em run normal; roleta E/V, banimento por identidade, pílulas somente no level-up, seis tipos de pílula por run, oficina e mercador.
7. **Desempenho.** Medir 1.600 inimigos e Final Swarm com GPU real, em diferentes climas e com efeitos. Teto configurado do Final Swarm é **1.600** (rodada 48; rampa progressiva até +7 min); desempenho jogável ainda não está validado. Reduzir trabalho visual somente a partir de medidas.
8. **Sonoplastia.** Selecionar sons com licença verificada, integrar e validar volume/frequência. O pacote sb-swishes-source.zip foi reprovado e continua fora do Git.

## Lote do usuário · 12/11/2026 (rodada 35 — **AUTORIZADO na rodada 37** · implementação em andamento)

Mega-lote de ~28 itens (pedido integral + resposta em docs/14; resumo em docs/18 §2 e linha 35 de §4; evidências do código em `<pasta arquivada>/CONTEXTO-COMPLETO.md` §9 — FORA do repositório). **Nenhum código alterado nesta rodada** — o usuário pediu o retorno do que consigo/não consigo **antes** de autorizar a implementação. **Autorizado em 12/11 (rodada 37)** — ver a seção da rodada 37 abaixo.

### Fase 1 — Fundações e regressão (ordem sugerida)

1. **[FEITO na rodada 38 — ver CHANGELOG]** **Corrigir a animação de ataque durante a caminhada** (regressão da rodada 33): o ataque normal deve **mostrar os quadros de folha de ataque** mesmo com o personagem andando (hoje `playerMotion.ts` suprime `showAttack` quando há input de movimento — sobra só o balanço procedural dos braços). Se não for possível manter as duas coisas, o usuário prefere **voltar ao estado anterior** (decisão em docs/18 §3).
2. **Infra de som + arquivos do usuário**: (a) "YOOOO" no botão Jogar/Jogar-como-convidado — o **sintetizado já existe** (`playYooo`), integrar o **arquivo real** quando o usuário baixar (link: https://www.youtube.com/shorts/weeVe4Kpsek); (b) efeitos de jutsu: som por técnica quando existir arquivo, senão o **padrão** (link: https://www.youtube.com/watch?v=xPgMmsJfrgY; exemplo Kage Bunshin: https://www.youtube.com/watch?v=aEQIi0drDhY); (c) **anti-spam: o próximo som só toca quando o anterior TERMINAR — NÃO É FILA** (regra permanente em docs/18 §3). O agente **não consegue** baixar do YouTube nesta sessão; o usuário baixa e entrega a pasta (proposta: `assets/sons/` no projeto).
3. **[FEITO na rodada 37 fase 3 — commit `ec7c42a` — ver CHANGELOG]** **Caça-Níquel da Tsunade**: renomear a Roleta da Tsunade; arte com a Tsunade + caça-níquel, expressão **feliz/triste/nervosa** conforme a recompensa (implementada com retrato do roster + badge/glow; **arte das 3 expressões = PENDENTE**); custo por giro subindo **gradual e considerável** (×1,35 → **×1,70 por giro** + **+25%/zona** + inflação por minuto; validar no teste do usuário). O **desconto de custo JÁ EXISTE** (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%) — mantido na nova fórmula. Combos de 3 iguais + emboscada invertida implementados (specs em §specs 5).
4. **Treinamento esgotado → atributo ALEATÓRIO +0,6%/nível** (NOVA decisão 12/11 — substitui "somente Sorte +0,8%" de 11/11; `grantTraining()` em `GameCanvas.tsx`). ⚠ O lote traz as duas frases; tratada a de 12/11 como válida — **confirmação pendente** com o usuário.
5. **Pílulas 9 / 13 / 15**: teto **padrão 9** (hoje `PILL_MAX=10` + Cabaça +2 = 12), "buff de conta" → **13** (**resolvido na rodada 37: = Passivas Shinobi, desbloqueadas por Lamens no menu Passivas Shinobi — devem aplicar no INÍCIO da run**), "buff de item" → **15** (Cabaça +2 por cima). **Isca Shinobi vira vitamina** — **RESOLVIDO (Rodada 47)**: Isca Shinobi agora é **pílula** (`pills.ts`, mesmos valores do item antigo) e o item `shinobi-bait` foi **removido** do catálogo (saves antigos degradam graciosamente). White Flute: **APROVADO COMO ITEM NOVO na rodada 37** (horda maior + mais Ryu/leveling) — a **Pílula de Incenso SE MANTÉM** (+10% horda · +5% ameaça · +12% Ryu).
6. **Pool com prévia informativa** dos upgrades que itens/pílulas dão nas habilidades (hoje há `PillStatPreview`/`affectedTechniquesText` na RunSheet — estender para os **cards do pool**; verificar vitaminas). Seleção por teclas 1–N **JÁ EXISTE**.

### Fase 2 — HUD e menus (padrão das 7 telas de referência arquivadas FORA do projeto)

7. **HUD**: **contador de abates totais** no HUD (hoje só pós-run); **contador de sequência (streak) em tempo real** (não existe); **card de temporada** (ranking/colocação — hoje só ranking local pós-run); botão **Glossário** (guia do que cada coisa faz e como buffar — não existe); **itens com ícones à esquerda** e **habilidades + pílulas à direita** (reorganizar o layout). **HP com números JÁ EXISTE**.
8. **Menus** conforme as telas de referência (prints `r35-naruto-ui-01..07` fora do projeto): ficha com **status numéricos + nível de habilidade**, loja em grade, roster com **versões bloqueadas**, etc.
9. **Planejador de fusões/builds** espelhando o planejador da referência (frames `frames-6-videos/` v5/v6): passes ativos, slots compartilhados, plano de batalha, **salvar builds**, progresso.

### Fase 3 — Conteúdo e balanceamento

10. **Balanceamento em iteração com o usuário**: jogador inicial **menos forte/mais gradual** (escala por dificuldade); monstros **mais fortes aos 6 min** (usuário: "estou com 6m de jogo e limpando o mapa sem dificuldade"); o usuário testa a gameplay e ajustamos.
11. **Mapa maior + spawns alcançáveis** (proposta: **+30% do raio jogável**; todos os spawns dentro da área alcançável — hoje os monstros nascem em lugares onde o jogador não chega).
12. **Pergaminhos no chão** no lugar das kunai/shurikens (hoje 60% ryu/20% kunai/20% shuriken em `scatterPickups`): pergaminho dá **Ryu por zona + sorte**.
13. **Personagens novos** (obra NARUTO/Naruto Shippuden; liberdade de copiar os ataques; respeitar características únicas):
    - **Kages ausentes — APROVADOS na rodada 37**, incluindo os **primeiros Kages de cada vila até o Shippuden** (Hanzo 1º Tsuchikage · Mei Terumi 1ª Mizukage; 1º/2º Kazekage e 1º/2º Raikage sem nome canônico = fora) com pesquisa na **NarutoWiki**: Hiruzen Sarutobi (3º Hokage) · **Killer B (4º Raikage — correção de canon; a lista da 35 tinha 6º)** · **A (3º Raikage — correção; tinha 5º)** · Onoki (2º Tsuchikage) · Ao (2º Mizukage) · Rasa (3º Kazekage) · Naruto (7º Hokage). **Tobi ×2** (Akatsuki + outra versão), **Nagato** (separado do Pain) e **Yahiko = PAIN** entram na fila (rodada 37).
    - **Elenco clássico/Shippuden (Tier A, com evolução por era — Academia → Shippuden → 4ª Guerra quando houver histórico):** Choji · Kiba (+Akamaru) · Shino · Ino · Kurenai · Iruka · Sai · Yamato · Shisui · Obito · Hiashi · Hanabi · Kisame · Zabuza · Suigetsu · Mangetsu · Karin. (Nagato = nuance — Pain já existe; Ebisu, espadas menores e Kages sem nome = referência fraca, fora.)
14. **Análise dos 6 vídeos de referência** (frames já extraídos em `frames-6-videos/`: v1×3 + v2–v6 em 30/60/90/115 s) → propor números de scale. O frame **v4** é a melhor leitura de late game recebida (Gengar Lv.1252, zona 3/3, 47 min, dano 1,7M–2,2M, streak ×57.868, 2,43M abates).

### Descartado (JÁ EXISTE no jogo — regra do usuário 12/11: "o que já estiver no jogo você desconsidera")

- HP com números na barra (já existe no HUD).
- Seleção do pool por teclas 1–N (já existe — "use as teclas 1–{n}").
- Desconto de custo da Roleta (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%).
- White Flute → já existe como **Pílula de Incenso**.
- "YOOOO" no Jogar → o **sintetizado** já existe (o arquivo real será integrado quando chegar).
- Caminhada vertical frente/costas → as folhas direcionais já têm as duas fileiras (**validar visualmente** antes de descartar 100%).

### Não consigo (limitações declaradas)

- **Baixar áudio do YouTube** nesta sessão — o usuário baixa e entrega a pasta; eu distribuo/integro. **(Atualizado na rodada 37: o usuário já baixou o YOO MP3 e me enviou — integrar no Jogar com corte a partir do 1 s; `ytmp3.yt` foi autorizado para eu tentar os demais sons de jutsu.)**
- **Ver a foto do late game** que o usuário mencionou ("foto do whatsapp") — **RESOLVIDO NA RODADA 37:** o usuário criou `<pasta arquivada>/fotos lategame/` (referências WhatsApp, **consumíveis**, fora do projeto); o frame v4 dos vídeos continua como referência de números.

### Perguntas em aberto (9) — **resolvidas na rodada 37 (12/11)**

**Respostas do usuário:** (1) foto do late game → criada a pasta `<pasta arquivada>/fotos lategame/` (WhatsApp, **consumível**, fora do projeto); (2) buff de conta = **Passivas Shinobi** (Lamens; aplicam no **início da run**); (3) treinamento esgotado → **aleatório +0,6%** (mantido do plano); (4) **Kages APROVADOS** (+ primeiros Kages de cada vila, via NarutoWiki); (5) **Tier A APROVADO**; (6) pasta de áudio OK → **YOO MP3 já recebido do usuário** (integrar no Jogar, corte a partir do 1 s); (7) Caça-Níquel: custo **subindo gradual e considerável, como o Ryu por zona** + **emboscada invertida** (armadilhas/papéis bomba matam monstros ao redor do jogador; jogador seguro durante a interação) + **combos de 3 iguais** (Tsunade/Jiraiya/Hiruzen/Hidan/Kakuzu); (8) mapa: **abrir mais + spawns alcançáveis** (pedido explícito); (9) balance = **iteração com o teste do usuário**. Demais specs aprovadas: White Flute = **ITEM** (Incenso mantido); Isca Shinobi → vitamina; HP com números **no pé do personagem**; folhas de caminhada **frente (baixo) e costas (cima)**; HUDs no **tema Naruto/ninja/japonês**; glossário (atributos no estágio, efeito de cada pílula, **% de mega crítico após 100% de crítico**, alfas com buffs + combos de facção/aldeia/família); **Tobi ×2 · Nagato · Yahiko=PAIN**; **ytmp3.yt autorizado** para os demais sons.

1. Reenviar a foto do late game?
2. Pílulas 9/13/15: o que é o "buff de conta" (mecanismo)?
3. Confirmar: treinamento esgotado = **atributo aleatório +0,6%** (substitui "somente Sorte +0,8%")?
4. Aprovar os **conceitos dos Kages** antes da criação?
5. Aprovar o **elenco Tier A**?
6. Pasta de áudio: `assets/sons/` no projeto, OK?
7. Fator de crescimento do Caça-Níquel (proposta **×1,70 por giro**)?
8. Expansão do mapa (proposta **+30%**)?
9. Balanceamento por **teste do usuário** (iteração), OK?

## Lote de feedback da comunidade · 11/11/2026 (PROPOSTO, aguardando definições do usuário)

Lista colada pelo usuário em 11/11/2026. Estado por item:

1. **Kekkei Genkai +15% de dano** combinando 2 habilidades do mesmo elemento (não Neutro) ou par de KG que o personagem tem (PROPOSTO). Pares (CONFIRMADO via Narutopedia, https://naruto.fandom.com/wiki/Kekkei_Genkai): Ranton = Vento+Água; Madeira = Terra+Água; Ímã = Terra+Raio (a naruto-wiki diz Vento+Terra — divergência a revisar com o usuário); Vapor = Fogo+Água; Lava = Fogo+Terra. Implementar em `src/game/techniqueMerge.ts`.
2. **Combinar: 1,5× + atributo aleatório relacionado às técnicas** (PROPOSTO). O ×1,5 já existe em `combine`; falta o bônus aleatório.
3. **Fundir: soma afixos + 2× dano** (CONFIRMADO já existir em `fuse` — validar o texto da descrição).
4. **Preparador/plano: mostrar quais habilidades são necessárias para a fusão** (PROPOSTO; `src/main.tsx` página de build).
5. **Pool: badge “Habilidade de fusão”** (PROPOSTO; o badge “★ Planejado para Missão” já existe).
6. **Inimigos comuns atiram kunai vermelho pequeno** em vez da marca no chão; bosses/elites mantêm a área de acerto (PROPOSTO; usar o mecanismo `enemyShots` existente, dano `10*(dmgMult??1)*threat.damage`, `makeDropSprite('kunai')`).
7. **Som dos hits “estourado”** (PROPOSTO): `playSfx('impact')` dispara por abate — limitar taxa em `src/audio/sfx.ts` e reduzir o ganho do impact (≈0,055×vol).
8. **Melhor visualização do inimigo focado/tomando dano** (PROPOSTO): `lockedTarget` + `targetMarker` já existem; plano é tingir o sprite do alvo travado de vermelho.
9. **Textura da água** (PROPOSTO; `src/scene/terrainArt.ts` linha ≈90).
10. **Horizonte mais bonito / perspectiva dos morros “esquisita”** (PROPOSTO; `groundHeight` em `terrainArt.ts` — item grande, precisa de revisão visual).
11. **Câmera do jogo de referência: “quem tem que andar é o personagem e não a câmera”** (AGUARDANDO CLAREZA — a câmera já segue o jogador com damping; pedir referência do que exatamente mudar; conferir os prints arquivados, fora do projeto).
12. **RawInput do mouse “fixo”** (RESOLVIDO em 11/11/2026 — pedido claro do usuário: sem aceleração, velocidade constante, sensibilidade como configurada): pointer lock com `{unadjustedMovement:true}` (raw input do navegador, Pointer Lock 2.0) + giro direto/linear da câmera (sem `damp`); `movementX/Y` 1:1 com o mouse.
13. **Andar livre enquanto ataca** (RESOLVIDO em 11/11/2026 — pedido do usuário: o ataque normal não interrompe a caminhada; o corpo continua andando e o golpe sai dos braços; a Ultimate mantém a pose especial): `playerMotion.ts` — estado `walk` preservado com ataque ativo + balanço `swing` aplicado em `pose.apply`; validado em `tsc -b`, build, `verify-rules` e `verify-runtime`.

### Desempenho e deploy · 11/11/2026

- **REMOVIDO (pedido do usuário, 11/11/2026)**: ajuste automático de desempenho (governor) — `adaptiveGovernor.ts` apagado, opção em Gráficos e campo `autoPerformance` removidos. A imagem é configurada apenas pelo jogador (Qualidade, Limite de FPS, Resolução).
- **PENDENTE**: validar FPS em GPU real no deploy Netlify (máquina do usuário). Se estiver baixo, o jogador ajusta em Gráficos: Qualidade `Média`/`Baixa` ou Resolução `900p`/`720p`.
- **CONFIRMADO**: deploy manual no Netlify funcionando (upload da pasta `dist`/zip). `netlify.toml` pronto para deploy via Git/CLI no futuro.

## Backlog posterior e propostas

- Contas atuais são locais ao navegador. Backend, login online, hospedagem da alpha, multiplayer e modo Sobrevivência são etapas posteriores.
- Revisar apresentação da ficha (fontes base/passivas/nível/itens) e HUD abaixo de 1050 px.
- Conferir arte de Iruka/Ebisu/Kushina e drops nos locais realmente usados; a presença de um SVG antigo não prova que ele esteja em uso.
- Minigame/probabilidade de selamento e aviso de sinergia são propostas antigas, ainda exigem definição final.
- O arquivo de contexto arquivado (fora do projeto) contém propostas históricas sobre preços permanentes, venda proporcional, ferramentas 2/2/1 e HP adaptado ao DPS. Elas não substituem as decisões já dadas pelo usuário (inclusive 3 usos iniciais e até 10).
- Bônus extra de +0,8% quando não restam upgrades (técnicas/pílulas): agora sobe **somente a Sorte** (regra do usuário, 11/11/2026: "aumentar só a Sorte"); antes era atributo aleatório. Regra separada do crescimento normal por nível.
- Análise dos arquivos externos do jogo de referência é local e não publica instalador, diretório, código, assets ou extrações no GitHub.
- **11/11/2026 (rodada 34):** early game mais difícil em todas as dificuldades (sem desconto inicial), dificuldade individual por zona (Z2 ×1,18 · Z3 ×1,38), scale de habilidades elevado (base do crescimento ×1,5 + escala global de dano das técnicas ×1,2), números de dano spamming (teto 300), ficha com utilidades + gráfico de crescimento por nível — **medir o impacto em run real** (prioridade 3).

## Rodada 36 · 12/11/2026 (segmentação de contexto — CONCLUÍDA)

- Backup de segurança: `backup-ShinobiBonk-2026-11-12.zip` na **raiz do workspace** (fora da pasta do projeto) — usar para restaurar se necessário.
- Novos documentos de contexto: `docs/19` (índice + manifesto), `docs/20` (fórmulas/valores), `docs/21` (elenco + fila de personagens).
- Skills `contexto-e-decisao`/`documentar-projeto` atualizadas para o fluxo de índice + docs de domínio.
- A fila da **rodada 35** foi **AUTORIZADA na rodada 37** (12/11/2026) — implementação em andamento (ver seção da rodada 37 abaixo).

## Rodada 37 · 12/11/2026 (autorização da rodada 35 + novos specs — IMPLEMENTAÇÃO EM ANDAMENTO)

**Status das fases (sincronizado em 12/11 após o commit `fd79ced` da sessão paralela do usuário):**

1. **Áudio YOO + gate anti-spam** — **CONCLUÍDA** (commits `d05f168` + `7f8e564`).
2. **Animação de ataque + caminhada** — **CONCLUÍDA** na rodada 38 (commit `fd79ced`): o golpe toca a animação completa também andando (passada nas pernas do quadro de ataque) + **encadeamento** a partir de 75% (`CHAIN_AT`) + `verify-motion-atlases` (56 versões/560 estados/0 erros). A implementação alternativa criada em paralelo no Bionic (camada sobreposta, commit `841f5bd`) foi **descartada por ser menos completa** — preservada na branch `backup-r37-fase2-overlay` para comparação.
3. **Caça-Níquel da Tsunade** — **CONCLUÍDA** (Bionic, 12/11; código no commit `ec7c42a`; registro em docs/14 + CHANGELOG) — renome + 5 combos de 3 iguais (Tsunade/Jiraiya/Hiruzen/Hidan/Kakuzu) + 3 rolos verticais + emboscada invertida (armadilhas shinobi 8 m que matam monstros; jogador seguro durante a interação; totem/bijuu/guardião excluídos) + custo em escala (×1,70/giro + +25%/zona + tempo) + face da Tsunade (retrato do roster + humor feliz/triste/nervosa; **arte de 3 expressões = PENDENTE** na fase de arte). **Validada:** `tsc -b --force` · `vite build` · `verify-rules` (boa chance 30,88% · giro 4 = 251 · zona 2 = 38 · zona 3 = 45) · `verify-runtime` (0 erros JS/404). Pendente: teste do usuário com GPU real (calibração em iteração).

**Decisões de implementação da fase 3 (Bionic, documentar ao concluir):**
- **Visual = 3 rolos de caça-níquel** (pega o lugar da roda): cada giro resolve UMA casa existente; os 3 rolos param no mesmo símbolo (aparência clássica de "3 iguais"). Mantém o motor de 1 casa (pesos, sorte, pressão, verificação) — adaptação registrada.
- **5 novas casas** (`roulette.ts`): `tsunade` (bom, premium, peso 0,9) · `jiraiya` (bom, premium, 0,9) · `hiruzen` (bom, premium, 1,2) · `hidan` (ruim, 6) · `kakuzu` (bom, premium, 0,7). Sorteadas como as demais (Sorte favorece as premium; pressão de maldição/zona/missão pesa as ruins).
- **Combos (constantes `SLOT_COMBOS`):** 3 Tsunades = `runBuffs` threat +0,10 e enemyCount +0,10 (até o fim da run, como as trocas do Ebisu) · 3 Jirayas = 1 item Raro/Épico/Lendário · 3 Hiruzens = 4 escolhas de item (pega com E / vende com V) · 3 Hidan = −5% do HP total (piso 1 HP — **não mata**, decisão do Bionic) + threat +0,05 + enemyCount +0,05 · 3 Kakuzus = `round(120 × luckFactor × (1 + pressão))` Ryu.
- **Segurança durante a interação: JÁ EXISTE** — o loop de simulação é pausado enquanto o overlay está aberto (`!roulette` no gate do frame, GameCanvas); horda congelada, zero dano. Ao sair: **armadilhas shinobi explodem** (raio 8 m; `takeDamage` ×3 HP dos alvos → matam; totem/bijuu/guardião **excluídos** do alcance da armadilha; som novo `explosion` em `sfx.ts`). A casa antiga "Credores" (emboscada que **spawna** inimigos) **se mantém** — agora com os dois sabores.
- **Custo (docs/20):** `round(30 × 1,70^giros × 1,15^minutos × (1 + (zona−1)×0,25) × (1 − desconto))` — crescimento 1,35 → **1,70** (proposta ×1,70 do docs/13) + **fator de zona 0,25** (novo, escala como o Ryu por zona). Descontos existentes (Dente de Ouro/Gama-chan, teto −40%) continuam.
- **verify-rules atualizado:** boa chance sorte 0 = **30,88%** (antes 30%) · `rouletteCost(4,0)` = **251** (antes 100) · novas asserções do fator zona.
- **Ícones:** Tsunade/Jiraiya = recorte do `shinobi-roster-v2.png` (índices 9/10, grade 5×5); Hiruzen 🏮 · Hidan 🦇 · Kakuzu 💰 (emoji — não estão no roster; arte dedicada = PENDENTE com a fase 7 de personagens).
4. **Itens/pílulas** — pendente (Células de Hashirama / Chakra de Hagoromo + ícones · White Flute novo · teto 9/13/15 · Isca → vitamina · pool informativo).
5. **HUD** — **PARCIALMENTE CONCLUÍDA** (`fd79ced`: tema ninja em hub/seleção/mapa + menu com as 4 vilas + fontes OFL locais; **restante**: streak/abates, card de temporada, glossário, alfas com buffs + combos facção/aldeia/família, buffs somados por itens/pílulas visíveis no pool).
6. **Balance** — pendente (início fraco/gradual · monstros fortes aos 6 min · treinamento +0,6% aleatório · pergaminhos no chão · mapa maior + spawns alcançáveis).
7. **Personagens novos** — **PROPOSTA em `docs/22`** (PROPOSTO, aguardando o usuário): 11 Kages/líderes + 3 ondas + NPCs; **divergências canônicas apontadas** (Killer B não foi Raikage · Hanzō não foi Tsuchikage · Mei = 5ª Mizukage · Ōnoki = 3º Tsuchikage · Ao não foi Mizukage).
8. **Folhas de caminhada frente/costas** — pendente (atlas: hoje só diagonal).
9. **Arte dos menus** — **PARCIALMENTE CONCLUÍDA** (`fd79ced`: fundos ilustrados do menu inicial + marcos em camadas).

O usuário **autorizou** a fila inteira da rodada 35 ("Aprovo os Kages · Aprovo o Elenco Tier A · Ok pasta com áudio, já inclua este que enviei no 'Jogar' · Pode colocar esse caça níquel") e respondeu às 9 perguntas em aberto (docs/18 §4, linha 37).

### Specs aprovadas (novas, 12/11)

1. **Kages — APROVADOS**, incluindo **primeiros Kages de cada vila até o Shippuden** (pesquisa na **NarutoWiki** para stats/visuais): **Hanzo (1º Tsuchikage)** e **Mei Terumi (1ª Mizukage)** entram na fila; 1º/2º Kazekage e 1º/2º Raikage sem nome canônico = fora. **Correção de canon: A = 3º Raikage · Killer B = 4º Raikage** (a lista da 35 tinha 5º/6º).
2. **Elenco Tier A — APROVADO** (17): Choji · Kiba(+Akamaru) · Shino · Ino · Kurenai · Iruka · Sai · Yamato · Shisui · Obito · Hiashi · Hanabi · Kisame · Zabuza · Suigetsu · Mangetsu · Karin — cada um com **evolução por era** quando houver histórico (Academia → Shippuden → 4ª Guerra).
3. **Tobi ×2 — APROVADO**: a versão da Akatsuki + a outra versão (pesquisar na NarutoWiki).
4. **Nagato — APROVADO, personagem SEPARADO do Pain** (correção do usuário: "O Yahiko é o PAIN, o Nagato é outro personagem"): kit com **Tensei + Invocação dos Pain's (os caminhos) + caminhos de Pain**. O **Pain** já no roster = corpo de **Yahiko** → kit com **barras de chakra + Tensei** (as habilidades que ele mostra na obra).
5. **Caça-Níquel da Tsunade — specs APROVADAS:**
   - **Combos de 3 iguais** na roleta: **3 Tsunades = "Sorte da Tsunade"** (dificuldade +10% + monstros +10%) · **3 Jirayas = item raro ou superior** · **3 Hiruzens = 4 escolhas de itens aleatórios** · **3 Hidan = −5% do HP total + 5% dificuldade + 5% monstros** · **3 Kakuzus = bônus de Ryu condicionado à sorte + dificuldade do jogo**.
   - **Emboscada invertida** (usuário: "armadilhas shinobi, papéis bomba... explodiram ao redor do personagem matando os monstros ao redor; quando estiver em interação você não toma dano dos monstros, mas selecionando ao sair, os monstros já começam a hitar"): durante a interação o jogador é **seguro** (a horda não atinge); ao sair, armadilhas/papéis bomba explodem **ao redor do jogador matando os monstros próximos**; a horda retoma o ataque.
   - **Custo por giro subindo gradual e considerável, escalando como o Ryu por zona** (usuário: "ele deve escalar cada vez mais, assim como o ryu dropado pela dificuldade do mapa/zonas").
   - Renomear "Roleta da Tsunade" → **"Caça-Níquel da Tsunade"** (UI, toasts, textos).
   - **Arte da Tsunade** feliz/triste/nervosa conforme a recompensa (rodada 35).
6. **Itens/pílulas — APROVADO:**
   - **Células de Hashirama** (era "Pergaminho de Ressurreição", revive 35%) e **Chakra de Hagoromo** (era "Rinne Tensei", revive 60%) — **arte/ícone exclusivos** para cada um.
   - **White Flute = ITEM novo** (invoca horda maior + mais Ryu/leveling) — **a Pílula de Incenso SE MANTÉM** (%dificuldade/%Ryu/%horda).
   - **Teto de pílulas: base 9 · 13 com buff de conta · 15 com buff de item** — "buff de conta" = **Passivas Shinobi** (desbloqueadas por Lamens no menu Passivas Shinobi; **devem aplicar no início da run**); "buff de item" = Cabaça (+2 por cima). Hoje: `PILL_MAX=10` + Cabaça +2 = 12.
   - **Isca Shinobi → vitamina** (não item).
7. **HUD/tema — APROVADO:** **barra de HP com números no PÉ DO PERSONAGEM** (fácil visualização); **todas as HUDs recriadas no tema Naruto/ninja/japonês** (identidade visual própria); **glossário** (atributos no estágio, efeito de cada pílula, **% de mega crítico após o crítico 100%** com a regra do mega-crítico, **alfas/ajudantes com seus buffs** + combos de facção/aldeia/família); layout itens à esquerda / habilidades+pílulas à direita; **streak em tempo real**; **abates totais**; **card de temporada** (ranking/colocação).
8. **Folhas de caminhada — frente e costas** (usuário: "não tem as folhas andando pra cima/baixo, só na diagonal, quero que você faça frente e costas, siga os modelos de criação do projeto, não vá arruinar o trabalho até aqui"): andar para **cima = costas** · andar para **baixo = frente**.
9. **Áudio — APROVADO:** **YOO MP3** (baixado pelo usuário, 86 KB) no botão **Jogar/Jogar-como-convidado**, **corte a partir do 1 s** + integração; **ytmp3.yt autorizado** para os demais sons de jutsu (desviar das armadilhas do site: rolar até o "Download MP3" abaixo do nome do vídeo; se não conseguir, o usuário baixa e entrega a pasta); **anti-spam mantido**: o próximo som de jutsu só toca quando o anterior **termina** (não é fila); quando não houver som específico do jutsu, usar o **padrão** (arquivo a ser fornecido pelo usuário).
10. **Late game (espelho)**: fotos do WhatsApp em `<pasta arquivada>/fotos lategame/` (fora do projeto, **consumíveis**) — aplicar o modelo no nosso (buffs somados visíveis, card de temporada, streak/abates, itens/ícones à esquerda, habilidades/pílulas à direita).

### Fases de implementação (ordem aprovada)

1. **Áudio YOO + gate anti-spam de jutsu** (MP3 → `public/assets/audio/`; `sfx.ts`).
2. **Animação de ataque + caminhada** (regressão da rodada 33 — `playerMotion.ts`).
3. **Caça-Níquel da Tsunade** (renome + combos + emboscada invertida + custo em escala + arte).
4. **Itens/pílulas** (renames + ícones · White Flute · teto 9/13/15 · Isca → vitamina · pool informativo).
5. **HUD** (tema Naruto · HP no pé · streak/abates · card de temporada · glossário · alfas com buffs).
6. **Balance** (início mais fraco/gradual · monstros fortes aos 6 min · treinamento +0,6% aleatório · pergaminhos no chão · mapa maior + spawns alcançáveis).
7. **Personagens novos** (Kages + primeiros de cada vila + Tier A + Tobi ×2 + Nagato + Yahiko/Pain — kits fiéis à obra, evolução por era).
8. **Folhas de caminhada frente/costas** (novas versões; padrão do projeto).
9. **Arte dos menus** (identidade Naruto).

Cada fase: implementar → `tsc -b` + `vite build` + `verify-rules` (+`verify-runtime` quando gameplay/HUD) → documentar (docs/14/18/20/21 + CHANGELOG) → commit + push.

## Rodada 39 · 12/11/2026 (Planner individual por personagem · tabela · Fusões · Táticas · buff verde/vermelho · badges do pool · proporção do personagem)

**Status (sincronizado nesta rodada — evidências no CHANGELOG):**

1. **Plano individual por personagem + salvo na conta (TESTADO com o login local)** — IMPLEMENTADO: `planned` (era global `sb_planned_attacks`) · itens em casa (era global `sb_archived_items`) · prioridade (era global `sb_priority_items`) · listas da bolsa (era global `sb_bag_presets_v1`) passam a ser **por herói** (`sb_planned_by_hero_v1` / `sb_home_by_hero_v1` / `sb_priority_by_hero_v1` / `sb_bag_presets_by_hero_v1`) com **migração de fallback** (a chave antiga é lida como seed do herói atual e **nunca é apagada**). `trained` e "Não aprender" **já eram** por herói. A conta segue **local ao navegador**; quando o login online existir, o mesmo formato viaja com o save.
2. **Buff verde / debuff vermelho na linha de efeito dos cards** — IMPLEMENTADO (`BuffText.tsx` agora divide também por " e "; cada cláusula ganha o próprio tom — as cores já existiam).
3. **Planner em TABELA** (Habilidades · Pílulas · Itens) — IMPLEMENTADO (colunas: opção · origem/efeito · raridade/estado · ações; **todos os comportamentos preservados**). Textos "pra" → **"para"**.
4. **Aba FUSÕES no planejamento** — IMPLEMENTADO (pares do pool do herói com preview das duas regras que criamos — **Fundir** (dano = soma, forma Área) · **Combinar** (×1,5) —; par planejado até 4 por herói em `sb_fusion_plan_by_hero_v1`; badge **"⚗ Requisito de Fusão"** no pool do jogo; o **workshop dos sapos segue 1 uso por zona**).
5. **Tática de Missão (1 por personagem)** — IMPLEMENTADO (botão **"Salvar Tática de Missão"** no planner; snapshot {planejado · treinadas · em casa · prioridade · fusões} até 4 por herói em `sb_tactics_by_hero_v1`; Aplicar/Excluir).
6. **Badges no pool** — IMPLEMENTADO ("★ Planejado para Missão" + "· Treinada" **já existiam**; o **novo** é o "⚗ Requisito de Fusão").
7. **Novos ninjas → habilidades elementais para TODOS** — REGRA CONFIRMADA (a mecânica **já existe** — `techniquePool` compartilhada por vila/elemento; únicas de outros só após selar): os kits da fase 7 devem criar habilidades elementais para que entrem no pool de todos do mesmo elemento **automaticamente**.
8. **Proporção do personagem idêntica em qualquer movimento** — IMPLEMENTADO (`playerMotion.ts` normaliza por bbox alfa do quadro em uso × repouso, clamp **0,85–1,35**; Gaara/Asumo **autoconsistentes** — sem mudança). **Exceção futura registrada: Choji cresce com o Jutsu de Expansão** (quando for criado — fase 7).
9. **Pergunta do usuário — acesso total?** — RESPOSTA: **NÃO PRECISA** (o escopo já é somente `C:\Shinobibonk projeto - Copia`; o único item fora do alcance é o download de áudio do YouTube — o usuário baixa e entrega a pasta).
10. **Incenso vs Pílula (referência)** — Pílula de Incenso **se mantém**; White Flute = **ITEM novo "Flauta Provocadora"** (fila da **fase 4**, ainda não implementado); teto 9/13/15 segue na fase 4.

**Pendências desta rodada:** (a) **PERGUNTA EM ABERTA** — "buff de conta que aumenta a % de dano de habilidades, isso é por NINJA!": implementado como **consequência** do plano individual (cada herói tem o +15% do próprio treino); se for um **buff NOVO** de conta (Passiva Shinobi por Lamens, por ninja), aguarda a resposta do usuário (PROPOSTO); (b) teste do usuário do planner em tabela + Fusões + Táticas.

**Descartado nesta rodada (JÁ EXISTE — regra do usuário 12/11):** teclas 1–N no pool · buffs de itens/pílulas visíveis na RunSheet (`PillStatPreview`/`affectedTechniquesText`) · badges "★ Planejado para Missão"/"· Treinada" no pool (o novo é o de fusão) · Treinamento com Jiraiya +15% (agora individual por herói) · limite de "Não aprender" por herói · Kankuro (resolvido — não tocar).

## Rodada 41 · 12/11/2026 (marionetes únicas — Kuri + Kuroari)

**Status (evidências no CHANGELOG):**

1. **Kuri (companheira do Kankuro)** — IMPLEMENTADO: spawn para qualquer versão da família Kankuro, segue em formação (ângulo 2,4 rad · raio 2,1), timer de ataque próprio (independente do `allyTimer`), técnica “Agulhas de Kuri” (Projétil · alcance 8 · recarga 1,5 s) com o veneno do Kankuro via `hit()`. **Fora de `allies`/slots/afinidade/sinergia** (decisão registrada; aguarda aprovação do usuário).
2. **Kuroari (entidade da técnica)** — IMPLEMENTADO: `src/scene/kuroari.ts` (receita do Gamabunta), 4 quadros + avanço + fades, respeita a tecla H; **dano idêntico** (mesma fórmula de área), acerto em 0,55 s via `pendingHits`.
3. **Arte** — 4 folhas Pillow (1280×640 walk / 1280×1280 action), âncora de pés pela convenção do pack; `scripts/generate-puppets.py` versionado no repositório. **Limitação declarada:** sem gerador de imagem na sessão — qualidade abaixo das folhas IA (swap trivial mantendo os nomes).
4. **Registros** — `directionalArt.ts` (`kuri-1` + `kuri:[1]`) · `evolution.ts` (`portraitRegion('kuri')`) · `npcs.ts` (`NPC_ALLIES.kuri` + `NPC_NAMES`) · `verify-rules.mjs` (10 asserções).
5. **Sasori (herói)** — NÃO criado nesta rodada (fila **Onda 2**); a Kuroari já fica pronta para o kit dele.

**Pendências desta rodada:** (a) aprovação do usuário dos 4 pontos do “Estado desta rodada” em docs/14 (Kuri, Kuroari, adiantar Sasori, arte Pillow); (b) conferência visual das 4 folhas pelo usuário (ou geração IA e swap dos PNGs).

## Rodada 42 · 12/11/2026 (trilha sonora do jogo — OST de Naruto, 15 faixas)

**Status (evidências no CHANGELOG):**

1. **15 MP3s no projeto** — IMPLEMENTADO: `public/assets/music/` com nomes limpos (copiados do scratchpad — **áudios originais que o usuário baixou e entregou para o jogo**, não material do jogo de referência): `ill-do-it-right` (BOOT) · `grief-and-sorrow` (DEFEAT) · `konohamarus-theme`/`afternoon-of-konoha`/`loneliness`/`swaying-necklace` (MENU) · `raising-fighting-spirit`/`heavy-violence`/`ultimate-secrets`/`sarutobi`/`bunta`/`beautiful-green-wild-beast`/`dance` (RUN) · `hinata-vs-neji`/`sasukes-theme` (overrides por família).
2. **`src/audio/music.ts` (novo)** — IMPLEMENTADO: manager singleton com máquina de estados `idle→boot→menu/run/bijuu/defeat`; **uma faixa por vez, sem fila** (ao terminar, sorteia a próxima do pool **sem repetir a anterior**); `playMenu()` idempotente (navegar no hub não troca a faixa no meio); retry de autoplay na primeira interação (padrão `playYooo` do `sfx.ts`, catch silencioso — zero `unhandledrejection`); fade-in ~0,9 s via rAF; volume = `settings.volume × settings.musicVolume` (ao vivo) + mudo em segundo plano.
3. **Configurações** — IMPLEMENTADO: `musicVolume` (default **0,7**, retrocompatível — `load()` espalha os defaults) em `settings.ts` + card/slider “Música” na tela de configurações + “↺ Restaurar” da categoria som.
4. **Gatilhos** — IMPLEMENTADO: boot na 1ª renderização (`main.tsx`) · pool de MENUS nas trocas de página fora do jogo · `startRun(familyOf(hero.id))` em `beginMission` **e** no botão “continuar missão” (override: família Hinata/Neji → `hinata-vs-neji`; qualquer Sasuke → `sasukes-theme`) · `playBijuu()` no `spawnBijuu` (`GameCanvas.tsx` — ponto único: arena, retomada de run com arena, debug) · fim de run via efeito `runEnded` (uma vez por run): `world.defeated → playDefeat()` (loop) · `world.victory → playMenu()`.

**Validações (todas passaram):** `tsc -b` limpo · `vite build` OK (15 MP3s no `dist`) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95 — sem regressão) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless — 58 checks · 0 erros JS · 0 assets 404) · **probe dedicado da trilha** (Playwright + Edge com autoplay liberado): **5/5 PASS** (boot `ill-do-it-right` → pool de menu → run com **Sasuke Genin** inicia em `sasukes-theme` → evento de desistência → `grief-and-sorrow` → zero pageerror/404).

**Pendências desta rodada:** (a) **aprovação do usuário das 6 decisões de interpretação** (registradas em docs/14 e CHANGELOG): 1. **Raising Fighting Spirit** = pool RUN **e** trilha da luta bijū; 2. **Hinata e Neji na mesma** faixa (`hinata-vs-neji`); 3. após a luta bijū terminar, volta ao **pool RUN** aleatório; 4. **vitória** volta ao pool de **MENUS** (a faixa de derrota é exclusiva de perder a run); 5. `musicVolume` default **0,7**; 6. **sem crossfade** (só fade-in ~0,9 s); (b) as **4 pendências da rodada 41 seguem em aberto** (Kuri · Kuroari · adiantar o herói Sasori · arte Pillow + conferência visual das folhas).

## Rodada 43 · 12/11/2026 (sons reais de jutsu + pose ultimate do Pain + controle de revisão p/ Claude-Codex)

**Status (evidências no CHANGELOG):**

1. **Sons reais de jutsu (2 MP3 do usuário)** — IMPLEMENTADO: `public/assets/audio/kage-bunshin.mp3` ("Kage Bunshin no Jutsu" — **apenas quando a família do lançador é `naruto`**) + `public/assets/audio/shinra-tensei.mp3` ("Shinra Tensei" — **na Ultimate do Pain**). `src/audio/sfx.ts`: `JUTSU_CLIP_RULES` (regras técnica+família→MP3) · `jutsuClipFor(t,ultimate,casterId)` · `playJutsuClip(src)` (novo `Audio`, `play()` em promise + catch silencioso, `release` em `ended`/`error`/catch — **zero unhandledrejection**; **bloqueado enquanto `activeJutsuClip` existir** = regra anti-spam "só quando o anterior termina", **não é fila**). `playTechniqueSound(t,ultimate,casterId?)` — se há clip: toca o MP3 e **retorna sem o sweep sintetizado e sem a fala TTS** (anti-spam); se não há clip mas `activeJutsuClip` ativo → retorna sem som nenhum. `src/scene/GameCanvas.tsx` — os 3 call sites passam o `heroId` (`activateSetup` · fim de `castTechnique` `if(!ally)` · `castUltimate`). **Verificado:** clones de Kage Bunshin atacam via `hit()` direto — **não** chamam `playTechniqueSound` → sem som duplicado dos clones.
2. **Pose/levitação da Ultimate do Pain** — IMPLEMENTADO (`src/scene/playerMotion.ts`): `painUltimate = family==='pain' && ultimate && state==='ultimate'` → segura o **quadro 0** da folha `pain-1-action-v3.png` (fileira **2** frente / **3** costas — pose de **braços levantados em V** já existe na folha) durante o cast todo (receita do Gaara) + arco de elevação `sin(π·attackProgress) × 0,38` m (0→pico→0). **Sem nova arte** — quadro existente da folha (a folha é `kind:'full'` via `revisedActionForms.pain:[1]`).
3. **Controle de revisão para Claude/Codex** — IMPLEMENTADO: `docs/23-REVISAO-OUTROS-AGENTES.md` (novo) — inventário por rodada (git log), áreas de revisão com caminhos, notas do que ficou para eles (arte da Tsunade · Kuri/Kuroari · download de áudio · pose dedicada da ultimate do Pain · pendências 41/42), regras permanentes resumidas, validações e push seguro.
4. **`verify-rules.mjs`** — +9 asserções (regra Kage Bunshin Naruto · regra ultimate do Pain · `activeJutsuClip` presente · os 2 MP3 existem >10 KB · `painUltimate` no playerMotion · call sites com `heroId` · kit do Pain: Shinra Tensei + ultimate Chibaku Tensei).

**Validações (todas passaram):** `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** — sem regressão + asserções da 43) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (a 1ª execução da rodada falhou num check flaky sem relação com os edits — "Rendan Uzumaki exibe impacto" — e a 2ª no "Teuchi/barraca Ichiraku" (timeout 30 s); a 3ª passou 58/0/0. Padrão documentado nas rodadas 41/42: **reexecutar antes de investigar**).

**Pendências desta rodada:** (a) **aprovação do usuário das 4 decisões de interpretação** — (1) som de Shinra Tensei na Ultimate `Chibaku Tensei` do Pain (a técnica comum Shinra Tensei do kit **não** toca o som); (2) Kage Bunshin → som apenas para a família `naruto` (outras famílias com a técnica no pool compartilhado não tocam o som); (3) enquanto um MP3 de jutsu toca, nenhum outro som de técnica (sweep/TTS) entra e a fala TTS da técnica é suprimida; (4) levitação do Pain: arco 0,38 m + pose de braços levantados segura durante o cast; (b) **as 4 pendências da rodada 41 seguem em aberto** (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência visual); (c) **as 6 pendências da rodada 42 seguem em aberto** (decisões de trilha sonora).

## Rodada 47 · 12/11/2026 (13 pedidos)

**Status por item (registro integral em docs/14; evidências no CHANGELOG):**

1. **Crítico 250% / mega crítico 300%** — **CONFIRMADO** (já no código: `rollCritical(chance, 2.5)` + tier 2 `+.5` em `progression.ts`).
2. **YOOOO rápido** — IMPLEMENTADO: `preloadYooo()` no boot (`sfx.ts` · `main.tsx`); corte de 1 s mantido.
3. **Isca Shinobi → Pílula** — IMPLEMENTADO (item `shinobi-bait` removido do catálogo; pílula com os mesmos valores; migração de saves antigos graciosa).
4. **Treinar auto-planeja** — IMPLEMENTADO (botão para todas as técnicas em `BuildPlanner.tsx` + auto-planejamento).
5. **Early game +200%** — **PROPOSTO (o usuário testa e ajusta)**: `ENEMY_SCALING` hpBase 3,2 · armor `.03` · teto `.72` + `HERO_DAMAGE_FACTOR` .41 (bug `.55` da `version()` corrigido).
6. **Raridade visual no pool** — IMPLEMENTADO (ícone preenchido com gradiente da raridade + contorno 2 px).
7. **Bordas temáticas na HUD/ficha** — IMPLEMENTADO (`.sheet-*` em `ninja-theme.css`).
8. **Botões do planner** — IMPLEMENTADO (`.build-cell-actions button` — pergaminho + selo hanko).
9. **Buff treinado visível + correto** — IMPLEMENTADO (badge "★ Treinada · +15%" na RunSheet; o buff já aplicava desde a rodada 39).
10. **Selamento instantâneo** — IMPLEMENTADO (sem tela "continuar missão" quando não há substituto).
11. **Pool adapta a 1–4 cartas** — IMPLEMENTADO (`cards-{1..4}`).
12. **Auto-coleta ao pisar** — IMPLEMENTADO (pickups comuns, raio 1,8 m; "E" só para emboscadas; altar já iniciava ao pisar).
13. **Passada sem distorção** — IMPLEMENTADO (`strideTarget = proceduralMotion ? stride : 0` em `playerMotion.ts`).

**Validações:** tsc · vite build · verify-rules (56/97/94 — `shinobi-bait` saiu do catálogo) · verify-motion-atlases (56/560/0) · verify-runtime (0 erros/0 404; testes de kunai reescritos para auto-coleta + hardening do guardião).

**Pendente:** aprovação do usuário dos 13 itens no navegador — o **item 5 (early game) é PROPOSTO**: o usuário testa a gameplay e ajustamos os valores em iteração (regra: nunca calibrar sem ele).

## Rodada 49 · 12/11/2026 (4 pedidos)

**Status por item (registro integral em docs/14; evidências no CHANGELOG):**

1. **Altar sem “E” (não reinicia)** — IMPLEMENTADO: branch do altar em `interact()` com toast “…fique dentro do círculo para ativar o altar (sem E)” + guard idempotente `if(defenseAltar===e)return;` no `startAltar` + `WorldSnapshot.interaction.key?` opcional (ausente no altar) + HUD só renderiza o `<kbd>` quando `key` existe. O altar continua ativando **ao pisar** (Rodada 47).
2. **Kunai/shuriken → PERGAMINHOS coletados com E (sem auto-coleta)** — IMPLEMENTADO: auto-coleta exclui `kunai`/`shuriken` (ryu/sealDrop seguem com auto-coleta); `interact()` aceita E para kunai/shuriken → `collectPickup` (custo Ryu + `rollMegaLoot`); visual de pergaminho (`drawScrollShape` em `dropSprites.ts`), ícone `public/assets/icons/scroll.svg` (novo), labels “Pergaminho”/“Morro de bolinhos de arroz”/“Pergaminho de recompensa grátis” em `spawnPickup`; `MapOverlay.tsx` (PickupIcon + labels).
3. **Final Swarm 1.600 + rampa 800@+4min → 1.600@+7min** — IMPLEMENTADO: `FINAL_SWARM={maxEnemies:1600, ramp800Cap:800, ramp800Seconds:240, rampSeconds:420, …}` + rampa linear em `difficultyAt` + **clamp por quadro** em `GameCanvas.tsx` (remove excedentes comuns, nunca bosses/guardiões/mega) + cap na emboscada (`startFieldAmbush` por `threatNow().cap - enemyList.length`).
4. **Moedas → MORROS DE BOLINHOS DE ARROZ** — IMPLEMENTADO: `drawOnigiri` em `dropSprites.ts` (scale ryu .8→1.05); ao coletar: **ímã global 10 s** (puxa xp/lamen/chakra de todo o mapa — `globalMagnetUntil`) + **lamen de cura** (`RAMEN_DROP.heal`) + Ryu `(14+zona×6)×MISSION_TIER[mission]×(1+min(1,sorte×0.01))` (fórmula do agente, não aprovada pelo usuário) + toast descritivo.

**Regressão detectada e corrigida nesta rodada:** a suíte `verify-runtime` falhava porque o aviso do portal contava **todos** os pergaminhos do mapa (o portal se recusava a abrir até E-coletar ~18 pergaminhos espalhados). Correção: aviso só com pergaminho **a ≤6 m** do portal + debug `clearPickups` no API de teste + nova checagem na suíte (pergaminho perto do portal avisa · coleta exige E · zona avança).

**Validações (5/5):** tsc -b · vite build · verify-rules (56/97/94) · verify-motion-atlases (56/560/0) · verify-runtime (0 erros/0 404, 2 execuções completas — a 1ª reexecução falhou flaky em 32 s, a 2ª passou).

**Pendente:** aprovação do usuário dos 4 itens + **re-upload do zip no Netlify** — o `Shinobibonk-netlify.zip` na raiz do workspace (11/11 20:15) é **STALE** (anterior à Rodada 48): o print de 5.468 monstros do usuário vem daquela build (o cap era 8.000 antes da 48). Teste em GPU real pendente.

## Rodada 50 · 12/11/2026 (4 pedidos)

**Status por item (registro integral em docs/14; evidências no CHANGELOG):**

1. **Morros de arroz (Ryu) — sem auto-coleta, coletados com E** — IMPLEMENTADO (pedido do usuário; **substitui** a auto-coleta da Rodada 49 — a mais recente prevalece): o filtro de auto-coleta ao pisar **exclui `ryu`** (o único pickup que segue auto-coletado é o `sealDrop` do mega elite derrotado) + `interact()` agora **inclui `ryu`** no `bestPickup` (→ `collectPickup`: Ryu + ímã global 10 s + lamen de cura) + hint **“E · colher morro de arroz · Ryu por zona/missão/sorte + ímã 10 s + lamen de cura”** (o `pickups.find` do snapshot inclui `ryu`). **Resposta à pergunta do usuário:** o morro **NÃO cura diretamente** — dá Ryu `(14+zona×6)×MISSION_TIER[missão]×(1+min(1,sorte×0,01))` + ímã 10 s + **lamen de cura 35% do HP** (`RAMEN_DROP.heal`).
2. **Escada de monstros vivos — reduzida ~40% no early game, progressiva + %inimigos de itens/debuffs** — IMPLEMENTADO (**PROPOSTO — o usuário testa e ajusta**): `ENEMY_SCALING` em `progression.ts`: **capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8** → Genin **1 min = 91 vivos (era 156) · 5 min = 391 (era 670) · 8 min = 695 (era 1.189) · 10 min = 936 (era 1.600) · teto 1.600 aos ~15 min (era ~10 min)**. O **%inimigos de itens/pílulas/debuffs** (`enemyCount`: Incenso Repelente −8% · Flauta Provocadora +12% · Pílula de Incenso +10% · Isca Shinobi +15%) **JÁ multiplica o cap** via densidade em `GameCanvas.tsx` (`threatNow`) — a progressão por buffs **se mantém**; só a escada-base ficou mais suave. Asserções ajustadas em `verify-rules.mjs` (695@8 min · 936@10 min · 1.600@15 min).
3. **1º mega elite — 20 mil → 9,5 mil HP com variação aleatória ±5% por nascimento** — IMPLEMENTADO (**PROPOSTO** — “cerca de 9 a 10 meio aleatório”): `megaEliteHp` em `enemyTiers.ts` — base **9.500** × (0,95–1,05 aleatório por spawn) + rampa `2^((seconds−55)/80)` × ameaça da missão (rampa e multiplicador se mantêm) + 3º parâmetro `rng` para testes determinísticos. Asserção: `megaEliteHp(55,1,()=>.5)=9500`.
4. **Ficha de status do personagem — de volta, como 1ª coluna da pausa** — IMPLEMENTADO: nova coluna **“Ficha do personagem · Status da run”** em `RunSheet.tsx` (faixa roxa `.stripe.purple`) — status em **TOTAIS** (base + nível + itens + pílulas + passivas + sinergias + bônus por nível) agrupados **ATAQUE/DEFESA/UTILIDADE** (export `groups`) + nota (crítico 250% · mega crítico 300%) + tile **“Ameaça da missão ×{difficultyScale}”**; `run-ui.css` — `.stat-line.total` (2 colunas). **Conflito Rodada 48 × 50 resolvido:** o usuário quer os **STATUS do personagem** (sim — totais); a **tabela de % de itens** (removida na Rodada 48) **continua fora**.
5. **Regressão na suíte (corrigida na validação)** — `verify-runtime.mjs` assumia que a **1ª** `.sheet-column` era “Técnicas” (a que tem o `<details>` do pool) — com a nova coluna “Ficha” à frente, o teste dava timeout. Correção: seletor **`.run-sheet details`** (independente da ordem das colunas) + comentário de Rodada 50.

**Validações (5/5):** `tsc -b` · `vite build` · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94 + asserções da Rodada 50) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (completa após a correção do seletor: 183 drawCalls · 1.600 bodies · 138 outlines · 65 markers).

**Pendente:** (a) **aprovação do usuário** dos itens 2/3 (PROPOSTOS — “o usuário testa a gameplay e ajustamos em iteração — nunca calibrar sem ele”) + leitura da ficha na pausa; (b) **re-upload do zip no Netlify** — o `Shinobibonk-netlify.zip` (11/11) é **STALE** (anterior à Rodada 48); (c) teste em GPU real.

## Rodada 51 · 12/11/2026 (7 pedidos)

**Status por item (registro integral em docs/14; evidências no CHANGELOG):**

1. **Ataques inimigos voltam a Kunai/Shuriken** — IMPLEMENTADO (pedido do usuário): tipos `enemyKunai`/`enemyShuriken`/`enemyShurikenFuma` em `dropSprites.ts` (kunai de aço em pé · shuriken reaproveita a forma) + projétil em `GameCanvas.tsx`; **os pergaminhos do chão PERMANECEM** como recompensa (rodada 49 — o usuário só reclamou dos ataques); bônus: `userData.shared=true` impede o `disposeObject` de descartar o material compartilhado do cache na limpeza dos projéteis.
2. **Ficha de personagem no P/ESC** — **JÁ EXISTE** no código (rodada 50, `RunSheet.tsx`); o print do usuário é da build STALE do Netlify (zip de 11/11).
3. **PARSE_ERROR `RunSheet.tsx:5308`** — não existe no código atual (tsc ✓ · vite build ✓); artefato do bundle antigo.
4. **Index para o Netlify** — VERIFICADO: `index.html` na raiz do projeto e do `dist/` + `netlify.toml` válido; o zip do workspace foi **rebuildado e reempacotado** (`index.html` + `assets/` na raiz, 371 arquivos, 235 MB).
5. **.exe seguro** — PROPOSTO (Electron/electron-builder → .exe, ou Tauri); **não implementar sem aprovação do usuário** (o jogo é 100% web; o wrapper embute o `dist/`).
6. **Tiles da ficha em marrom** — IMPLEMENTADO (`.sheet-tile` em `ninja-theme.css`: gradiente marrom-tan + borda de madeira + texto escuro; `.positive` verde sobrevive).
7. **Altares = bênção (buffs aleatórios por sorte/qualidade)** — IMPLEMENTADO (mecânica) — `ALTAR_BUFF_BASE` (Comum 5% → Lendário 25%) + `ALTAR_BUFF_POOL` (14 atributos), 2 atributos sorteados (3 no Raro+), magnitude × sorte, direto em `runBuffs`, **sem tela de escolha**, toast com a bênção — **valores PROPOSTOS (o usuário testa e ajusta)**; **substitui** a regra da Rodada 12 “altar 100% abre escolha de itens”.

**Redação (regra zero rastro do jogo de referência):** o nome do jogo de referência aparecia em `docs/14` (pedido da rodada 51) e em `docs/23` (regras de git) — substituído por “jogo de referência”.

**Validações (5/5):** `tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (0 erros · 0 assets faltando · 1.600 inimigos instanciados).

**Pendente:** (a) **aprovação do usuário** da bênção dos altares (PROPOSTO) e conferência do marrom das tiles; (b) **RE-UPAR o zip novo `Shinobibonk-netlify.zip` no Netlify** (o anterior era STALE — causa do PARSE_ERROR e do print da pausa sem a ficha); (c) .exe — Electron/Tauri aguardando aprovação; (d) teste em GPU real.

## Retomar

1. Ler AGENTS.md, **docs/19 (índice do conhecimento)**, README, docs/00, docs/12 e esta fila. Conferir git status e remoto antes de editar.
2. Consultar skills/criar-arte-shinobibonk e skills/movimentar-shinobi. Prompts anteriores: docs/arte-atlas-2026-11-07.json. Empacotador: scripts/pack-sprite-atlas.ps1.
3. Verificações: node node_modules/typescript/bin/tsc -b; node node_modules/vite/bin/vite.js build; node scripts/verify-rules.mjs; node scripts/verify-runtime.mjs para gameplay/HUD; node scripts/verify-motion-atlases.mjs para atlas.
4. Atualizar contexto, documentos temáticos e changelog na mesma entrega. Publicar somente os arquivos do projeto autorizados, sem incluir executáveis ou pesquisa privada.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

1. Conferir as técnicas restantes e as Ultimates por shinobi usando a [auditoria de efeitos](24-AUDITORIA-DE-EFEITOS.md). Parte do catálogo usa efeitos por natureza e forma. Revisar em partida e na prévia, preservando as assinaturas já boas. Priorizar técnicas dos Nara, jutsus médicos, projéteis específicos da Tenten e invocações que ainda usam geometria compartilhada.
2. Revisar os 56 shinobis e seus ajudantes em jogo para verificar qualidade de poses, ícones, transições e proporções. O teste de atlas cobre estados e folhas, e a aprovação visual é uma etapa separada.
3. Comparar as formas roxa do Sasuke e vermelha do Itachi com o novo Susano’o do Madara e criar seus próprios quadros se a direção visual for aprovada. Os rigs atuais já têm as armas por personagem.
4. Validar a jogabilidade no PC do usuário, inclusive a política de áudio do navegador, a legibilidade do HP, as cores dos altares e a escala dos drops. Deploy externo segue a fila existente.
