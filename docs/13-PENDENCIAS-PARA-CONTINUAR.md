# Fila atual do ShinobiBonk · 12/11/2026

Este é o estado consolidado após os commits 11e0d18 e bee4bba. Substitui as listas antigas de integração e contagens de folhas pendentes. Histórico preservado no Git e no contexto do chat.

## Confirmado e entregue

- 56 versões jogáveis de 24 famílias, com versões independentes; não há evolução de traje durante a run.
- Caminhada direcional nas 56 versões. As folhas registradas são usadas pelo controlador compartilhado do jogador, ajudantes e clones.
- Integração dos rascunhos do Claude com a main do Codex concluída em 11e0d18.
- Nove folhas novas de pulo/dash para Naruto 10/25/50, Lee 1/15/30 e Guy 1/15/30.
- 27 folhas completas action-v3: Sasuke 15; Hashirama 1/20; Kakashi 1/25; Itachi 1; Minato 1/15; Tsunade 1/15/30; Jiraiya 1/20; Orochimaru 1/15; Hinata 1/15/30; Pain 1; Shikamaru 1/15/30; Tobirama 1; Temari 1/15; Tenten 1/15.
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

1. **Kankuro RESOLVIDO** (usuário confirmou em 11/11/2026: "kankuro já foi corrigido" — arte das folhas 1/15/30 + walk/action v3 está no repositório). Restam deste item: **Kushina (1)** (quarta versão ainda sem folha completa) + conferida rápida do ataque automático em combate/como ajudante nas novas folhas.
2. **Revisar as 56 versões visualmente.** Prioridade a Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. Conferir repouso → andar → ataque, frente/costas, pulo, dash direito/esquerdo e recuperação. Naruto Academia é o padrão; Lee/Guy/Gaara preservam exceções. Repetir como ajudantes e em contexto de horda.
3. **Estudar e medir balanceamento.** Preservar o sistema existente. Comparar versões datadas da referência, vídeo fornecido e runs equivalentes. Registrar dano por alvo, tempo para matar, XP/minuto, abates/minuto, economia e Sorte. Diagnóstico inicial: a fórmula do mega cresce muito mais que a do guardião na mesma abertura. Ver o arquivo de contexto arquivado, fora do projeto. Não copiar propostas antigas como se fossem parâmetros aprovados.
4. **Efeitos e prévias.** Validar Susanoo de Madara/Sasuke/Itachi no jogador, ajudante, Ultimate e prévia; Kakashi tem estilo preparado, mas não possui versão Susanoo no elenco. Refinar efeitos por nome/natureza, origem nas mãos/boca, trajetórias, impacto e H. Conferir clones correndo e óleo/fogo de Gamabunta.
5. **Mapas e física.** Conferir os quatro mapas, chão/construções regionais, bases apoiadas, bordas sem vazio, câmera/zoom, climas, colisões e diagonais. Melhorar prévia da seleção caso ainda use representação antiga.
6. **Run completa e regressões.** Três zonas → bijuu em três fases → saída → Lamens/ranking/save. Exercitar desbloqueio por selamento em run normal; roleta E/V, banimento por identidade, pílulas somente no level-up, seis tipos de pílula por run, oficina e mercador.
7. **Desempenho.** Medir 1.600 inimigos e Final Swarm com GPU real, em diferentes climas e com efeitos. Teto configurado do Final Swarm é 8.000; desempenho jogável ainda não está validado. Reduzir trabalho visual somente a partir de medidas.
8. **Sonoplastia.** Selecionar sons com licença verificada, integrar e validar volume/frequência. O pacote sb-swishes-source.zip foi reprovado e continua fora do Git.

## Lote do usuário · 12/11/2026 (rodada 35 — PROPOSTO, aguardando autorização)

Mega-lote de ~28 itens (pedido integral + resposta em docs/14; resumo em docs/18 §2 e linha 35 de §4; evidências do código em `arquivo-pokebonk/CONTEXTO-COMPLETO.md` §9 — FORA do repositório). **Nenhum código alterado nesta rodada** — o usuário pediu o retorno do que consigo/não consigo **antes** de autorizar a implementação.

### Fase 1 — Fundações e regressão (ordem sugerida)

1. **Corrigir a animação de ataque durante a caminhada** (regressão da rodada 33): o ataque normal deve **mostrar os quadros de folha de ataque** mesmo com o personagem andando (hoje `playerMotion.ts` suprime `showAttack` quando há input de movimento — sobra só o balanço procedural dos braços). Se não for possível manter as duas coisas, o usuário prefere **voltar ao estado anterior** (decisão em docs/18 §3).
2. **Infra de som + arquivos do usuário**: (a) "YOOOO" no botão Jogar/Jogar-como-convidado — o **sintetizado já existe** (`playYooo`), integrar o **arquivo real** quando o usuário baixar (link: https://www.youtube.com/shorts/weeVe4Kpsek); (b) efeitos de jutsu: som por técnica quando existir arquivo, senão o **padrão** (link: https://www.youtube.com/watch?v=xPgMmsJfrgY; exemplo Kage Bunshin: https://www.youtube.com/watch?v=aEQIi0drDhY); (c) **anti-spam: o próximo som só toca quando o anterior TERMINAR — NÃO É FILA** (regra permanente em docs/18 §3). O agente **não consegue** baixar do YouTube nesta sessão; o usuário baixa e entrega a pasta (proposta: `assets/sons/` no projeto).
3. **Caça-Níquel da Tsunade**: renomear a Roleta da Tsunade; arte com a Tsunade + caça-níquel, expressão **feliz/triste/nervosa** conforme a recompensa; custo por giro subindo **gradual e considerável** (proposta: crescimento ×1,35 → **×1,70 por giro**; validar no teste do usuário). O **desconto de custo JÁ EXISTE** (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%).
4. **Treinamento esgotado → atributo ALEATÓRIO +0,6%/nível** (NOVA decisão 12/11 — substitui "somente Sorte +0,8%" de 11/11; `grantTraining()` em `GameCanvas.tsx`). ⚠ O lote traz as duas frases; tratada a de 12/11 como válida — **confirmação pendente** com o usuário.
5. **Pílulas 9 / 13 / 15**: teto **padrão 9** (hoje `PILL_MAX=10` + Cabaça +2 = 12), "buff de conta" → **13** (mecanismo de conta não existe — interpretação pendente), "buff de item" → **15**. **Isca Shinobi vira vitamina** (hoje é item raro `shinobi-bait` no catálogo). White Flute: **JÁ EXISTE** como Pílula de Incenso (+10% horda · +5% ameaça · +12% Ryu).
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
    - **Kages ausentes até o Shippuden — conceito para APROVAÇÃO ANTES de criar (pedido do usuário):** Hiruzen Sarutobi (3º Hokage) · Killer B (6º Raikage) · A (5º Raikage) · Onoki (2º Tsuchikage) · Ao (2º Mizukage) · Rasa (3º Kazekage) · Naruto 7º Hokage.
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

- **Baixar áudio do YouTube** nesta sessão — o usuário baixa e entrega a pasta; eu distribuo/integro.
- **Ver a foto do late game** que o usuário mencionou ("foto do whatsapp") — **não chegou**; o frame v4 dos vídeos é a melhor referência recebida; pedido de reenvio feito.

### Perguntas em aberto (9)

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

## Retomar

1. Ler AGENTS.md, README, docs/00, docs/12 e esta fila. Conferir git status e remoto antes de editar.
2. Consultar skills/criar-arte-shinobibonk e skills/movimentar-shinobi. Prompts anteriores: docs/arte-atlas-2026-11-07.json. Empacotador: scripts/pack-sprite-atlas.ps1.
3. Verificações: node node_modules/typescript/bin/tsc -b; node node_modules/vite/bin/vite.js build; node scripts/verify-rules.mjs; node scripts/verify-runtime.mjs para gameplay/HUD; node scripts/verify-motion-atlases.mjs para atlas.
4. Atualizar contexto, documentos temáticos e changelog na mesma entrega. Publicar somente os arquivos do projeto autorizados, sem incluir executáveis ou pesquisa privada.
