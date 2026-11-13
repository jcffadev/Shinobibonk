# Estado real do ShinobiBonk · 05/11/2026

Este documento resume o que é decisão de produto e o que o código da base atual realmente executa. A referência técnica detalhada é [12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md).

A direção permanente e o registro resumido de todas as perguntas e respostas estão em [18-CONTEXTO-PERGUNTAS-RESPOSTAS.md](18-CONTEXTO-PERGUNTAS-RESPOSTAS.md); o texto integral do chat está em [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md).

## Como classificar

- **CONFIRMADO**: decisão passada pelo usuário.
- **IMPLEMENTADO**: há comportamento correspondente em `src/`.
- **TESTADO**: verificado por execução real (ver "Verificação" abaixo).
- **PROPOSTO**: desenho ainda sujeito a aprovação ou balanceamento.
- **PENDENTE**: não existe na base atual ou está incompleto.
- As imagens em `assets/referencia/prints` e `references/concept_art` são referências, não capturas do protótipo.

## Base executável

- **IMPLEMENTADO** — cinco folhas novas de ação para Sasuke Rinnegan, Itachi Akatsuki e as três versões de Madara. As 56 versões têm caminhada direcional. Veja a cobertura de ataque, pulo e dash na [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

- React 19, TypeScript 7, Three.js 0.187 e Vite 8; iniciada com `pnpm dev`.
- `src/main.tsx`: hub local com elenco de **56 famílias / 96 versões**, biblioteca de ataques, plano de build, árvore permanente, loja de itens e seleção de missão.
- `src/scene/GameCanvas.tsx`: cena 3D isométrica e simulação local da run.
- `src/game/`: dados e regras (heróis, técnicas, itens, atributos, dificuldade, evoluções, zonas, árvore).
- `game/index.html` é a versão Canvas 2D anterior, só legado.

## Decisões vigentes do usuário (CONFIRMADO)

- Shinobi e inimigos em pixel art numa cena 3D. Mover o mouse gira e inclina a câmera. Clique direito fixa o alvo e o scroll controla o zoom.
- Missões nomeiam a dificuldade como Genin, Chunin, Jonin e Kage.
- Teclas: M abre o mapa completo; Tab o mapa rápido; P a ficha; G o ping “Aqui”; E interage.
- Ultimate manual no R. **A tecla Y é obrigatória** e alterna a Ultimate automática; o selo AUTO no botão R faz o mesmo por clique e mostra o estado.
- Economia da run: Ryu, kunai e shuriken. Kunai/shuriken são recompensas no mapa; o mercador troca armas por Ryu; a Caça-Níquel da Tsunade consome Ryu.
- Lamens é a moeda permanente da conta (árvore e desbloqueios), separada do Ryu da run.
- O pool de level-up/drop é escolhido pelo jogador.
- Orochimaru comanda o evento de maldição (substitui o nome da referência). Mega elites derrotados podem ser selados (E) ou recusados (G), e a recusa deixa um drop de item afetado por Sorte.
- Nada relacionado ao jogo de referência: os eventos foram renomeados no código ("Plano do Shikamaru" e "Caça-Níquel da Tsunade" — ex-"Roleta da Tsunade", rodada 37).

## Implementado na base atual

- **Movimento e combate** — caminhada em quatro direções nas 96 versões jogáveis de 56 famílias, com quadros próprios por forma. WASD muda o rumo imediatamente e prioriza a última tecla oposta pressionada. Shift captura a direção no início do dash e espelha o sprite à esquerda. Gaara Kazekage e Aliança podem manter Espaço para flutuar brevemente na areia. A câmera mantém a proteção de altura sobre o terreno.
- **Ações com quadros próprios neste lote** — conjuração do Naruto Clássico, ataque/pulo/dash do Sasuke inicial e socos/chutes de Lee e Guy em todas as suas formas. A fila registra a revisão do restante do elenco.
- **Efeitos e preparação** — técnicas com visuais por natureza e golpes característicos. Chōmei e Gyūki seguem as referências do usuário. A Bolsa da Missão permite combinar busca, estado e raridade.
- **Ofertas e saída** — uma pílula por escolha e um nível por pílula. A raridade aumenta a potência. Banir remove a opção do sorteio pelo nome durante a run. Na pausa, clique duas vezes em Desistir para confirmar. O resumo tem o botão Ir para o menu.
- **Contagem da horda:** o HUD lê o total real de inimigos vivos e o minimapa mantém sua amostragem separada.
- **Pílulas, pergaminhos e listas (06/11/2026):** pílulas mostram o atributo atual → novo nas cartas, na ficha, no plano e na barra; pergaminhos de elemento só listam técnicas do mesmo elemento; a Bolsa da Missão tem a sub-aba "Itens em casa" com até 12 listas salvas (nome, descrição, aplicar, duplicar, apagar).
- **Alinhamento do HUD (06/11/2026):** barra da missão em blocos (missão/zona, relógio grande, recursos) com preços numa linha menor; Ryu em formato curto também nos preços, roleta, mercador e avisos; ícones do minimapa dentro do círculo, com rótulo "Tab rápido · M mapa" e o selo DEBUG abaixo dele; painel SINERGIAS recolhível pelo título (estado salvo). Validado em 1440×900 e 1366×768 com 5 ajudantes e 80 itens.
- **Recompensas:** a fila de itens da Tsunade pede E para pegar ou V para vender. Habilidades e pílulas são escolhas de level-up. O máximo de cartas de recompensa é quatro, inclusive ao banir. A sinergia conta o ajudante de mesmo nome do jogador quando recrutado.

- **Hub**:
  - Entrada como convidado e carteira local de teste ("Administrador", sem login) com 999.999 Lamens (o Ryu fica só dentro da run). O botão Reset devolve o que foi gasto e limpa a build.
  - Elenco de 96 versões (56 famílias) em grade de retratos, com filtros por vila, elemento (afinidade principal) e organização/clã, mais busca por nome.
  - Kit de 4 técnicas por shinobi (1–2 únicas, o resto compartilhado) e plano de build (planejar ou deixar em casa técnicas, pílulas e itens).
  - Árvore permanente com 16 nós e loja de 95 itens com filtros e arquivamento.
  - Prévia da cena a partir do menu.
- **Run**:
  - Contagem regressiva de 10:00 e vitória ao chegar a 0:00. Derrota ao zerar o HP.
  - Três zonas com 10 min de relógio cada. O jogador invoca o guardião no Selo do Guardião. Ele fica mais resistente conforme o tempo. O clima é sorteado a cada zona.
  - A dificuldade escala por rank da missão (Genin–Kage) e por tempo.
  - Inimigos telegrafam ataques com um marcador vermelho que pode ser evitado. Há armadura e evasão.
- **Técnicas**:
  - 1–4 são automáticas. Começa com 1 técnica; o máximo é 3 espaços, ou 4 com o nó "Quarta técnica". Nível máximo 9.
  - Algumas técnicas só ficam disponíveis a partir de certo nível.
  - Cada carta de técnica sorteia raridade e afixos (dano, raio, velocidade de ataque, duração).
  - Estados: lentidão, atordoar, paralisar, dormir, empurrar, veneno e queimadura.
  - Crítico com faixa de "mega crítico" acima de 100% de chance.
- **Level-up**:
  - 3 cartas (4 com o nó "Quarta opção"), com clique ou 1–4.
  - **Só técnicas e pílulas; nunca itens.** Até 2 técnicas e o resto pílulas. Com todas as técnicas preenchidas e no nível máximo, só pílulas; com todas as pílulas no limite, só técnicas.
  - Itens vêm apenas de recompensas: kunai, shuriken, eventos, drop de item e recusa de selamento.
  - F/X/Z para atualizar, pular e banir; cada um tem 3 usos base, ampliáveis pela árvore. Banir exclui a opção pelo resto da run.
  - 3 s de invulnerabilidade ao subir de nível.
  - 19 pílulas com tema ninja (uma por atributo), até o nível 10 cada. Ver [04](04-ITENS-HABILIDADES-ECONOMIA.md).
- **Versões separadas (06/11/2026)**: cada forma virou personagem próprio — 56 versões de 24 famílias (ex.: Naruto Academia, Genin, Shippuden e Kyuubi), com kit, passiva e atributos da fase. A versão não muda de forma na run. A seguinte só surge para selar depois da missão cumprida jogando com a anterior, sempre mais difícil (`unlockMissions.ts`, `playWith`). Saves antigos continuam válidos: o id base é a primeira versão.
- **Ultimate**:
  - Recarga passiva de 55 s, ajustada pela velocidade de recarga.
  - O orbe azul de chakra dá +9% de carga.
  - Tecla Y ou clique no selo AUTO do botão R ligam e desligam o uso automático.
- **Drops** (sprites próprios em `src/scene/dropSprites.ts`): XP = essência roxa (8 comum, 25 elite, 100 mega elite/guardião, tamanho cresce com o valor); carga da Ultimate = orbe azul de chakra; Ryu = moeda dourada com 両; tigela de lamen (até 5% por abate) cura 35% do HP; pílula = cápsula rosa; item = pergaminho laranja.
- **Eventos**:
  - Plano do Shikamaru: até 3 vezes por zona; cada vez dá +1 kunai grátis quando o guardião é derrotado, sem penalidade.
  - Altar de desafio: horda de 6.
  - Maldição de Orochimaru: +20% de dificuldade e +25% de XP/saque.
  - Altares por raridade (Normal → Lendário): pisar no círculo começa a contar (sem E; o E não reinicia — Rodada 49); fora do círculo a porcentagem cai, mais rápido quanto mais raro; ao completar, concede uma **bênção** (2–3 atributos aleatórios, raridade do altar × sorte — não é mais itens, Rodada 51) (`ALTAR_RULES` + `ALTAR_BUFF_POOL`, ver docs/01).
  - Mercador de armas.
  - Caça-Níquel da Tsunade: overlay de 3 rolos com casas boas e ruins (incluindo 5 combos de 3 iguais), giro rápido segurando E, prêmios entregues ao sair, custo 30 × 1,70^giros (sobe com o tempo e a zona); ao sair, armadilhas shinobi matam os monstros próximos (jogador seguro durante a interação); Sorte melhora as chances (nunca 100%) e a dificuldade compensa.
  - **Barraca Ichiraku**: o sprite da barraca de lámen.
    - Esquecer uma pílula (todos os níveis) ou uma técnica custa 10 + 5 × nível em Ryu, quantas vezes quiser. A barraca nunca se esgota.
    - A última técnica não pode ser esquecida.
    - Os atributos são recalculados a partir das fontes, sem buff residual.
- **Cartões de ajudantes** (lado esquerdo, abaixo do herói), no padrão da referência do usuário:
  - retrato com moldura na cor da técnica, nome e selo da aldeia (ou "SINERGIA");
  - buff único do ajudante com o valor efetivo (por exemplo, "+1,5 HP/s de cura"), mais o bônus da Areia quando ativo;
  - técnica de ataque com barra de recarga;
  - elemento, escola, % de dano e intervalo.
  - Emboscadas periódicas.
  - **Arsenal da Tenten (NPC, antes Sharingan de Kakashi)**:
    - Uma vez por zona, copia 1 item à escolha que o jogador já carrega (+1 cópia, até o limite do item).
    - A tela própria lista só itens abaixo do limite.
    - Não tem Atualizar/Banir; X cancela sem gastar o Arsenal.
- **Kunais/shurikens no mapa**: abrir custa Ryu (20, depois +10 por abertura) e oferece uma escolha de item.
- **Chefes (mega elites e guardiões)**: barra de vida com nome acima do personagem. Usam as técnicas do próprio shinobi contra o jogador, a cada 3–4,6 s conforme a zona, sempre com aviso vermelho no chão. Quem sai da área marcada não leva dano. Golpes com controle deixam o jogador lento. O guardião usa a Ultimate dele uma vez, abaixo de 50% de HP.
- **Mega elites e selamento**:
  - Mega elites são shinobis aleatórios do elenco (até 9 por run) e surgem naturalmente.
  - Ao derrotar um, E inicia o selamento animado de 2,7 s (instantâneo com a Shuriken Selo da Tenten) e o personagem entra na equipe.
  - G recusa e deixa uma kunai grátis.
- **Aliados selados**:
  - Seguem o jogador em formação e atacam sozinhos com a primeira técnica deles.
  - Cada aliado dá um **buff passivo único** ao grupo (tabela em [03](03-ALIADOS-E-SELAMENTO.md)). Os médicos curam; os outros dão o atributo que combina com o estilo deles.
  - Vagas: 3 base, +1 por item, +1 por passiva permanente; máximo 5.
  - Sinergias de vila e organização (`src/game/synergy.ts`): contam só AJUDANTES (o herói não conta); combos por aldeia com faixas 2/3/4/5 e família de atributo própria (nenhum combo dá dano % e projétil juntos), mais organizações acumuláveis. Cada ajudante tem afinidade 1–5 que sobe durante a run e escala a passiva individual (40% → 100%). Equipe cheia abre a tela de substituição. A captura pode ser feita sem card/animação (Configurações). Ver [03](03-ALIADOS-E-SELAMENTO.md).
- **Descoberta**: eventos e kunais só entram no minimapa e no mapa depois de aparecerem no campo de visão da câmera (frustum, até 40 m).
- **H** oculta projéteis, efeitos e números sem desligar dano.
- **Ficha (P)**: atributos, técnicas com dano causado, itens, pílulas, aliados, sinergia e escala de dificuldade.
- **Resumo pós-run**: na vitória ou derrota, mostra:
  - resultado, forma final, tempo, zona, abates, dano total, DPS médio, dano dos aliados, Ryu, kunai e shuriken;
  - dano por técnica com % e DPS;
  - build final e atributos finais;
  - botões "Tentar novamente" e "Preparar outra missão".
  - **Lamens ganhos** pelo desempenho, com decomposição: tempo, abates, nível, zona, mega elites selados, vitória e multiplicador da dificuldade. São creditados uma vez por run, na vitória ou na derrota. O Ryu da run não vira Lamens.
- **HUD inferior**: pílulas numa linha própria acima das habilidades (quebra em até 2 linhas, com rolagem). Ajuda de teclas abaixo, à direita do botão "← Preparação".
- **Modo debug (sem login)**: existe só no servidor de desenvolvimento (`pnpm dev`/`ABRIR_JOGO.bat`); a build de produção não o tem. Na missão, F9 (ou a tecla à esquerda do 1) abre o painel para:
  - ler valores ao vivo;
  - ajustar no meio da run 41 parâmetros (base Genin; Chunin/Jonin/Kage multiplicam por cima):
    - **Inimigos:** HP (inclusive dos vivos), dano, velocidade, spawn e teto.
    - **Personagem:** dano e recarga da Ultimate.
    - **Ganhos:** EXP e Ryu.
    - **Drops:** chance de Ryu, Chakra, pílula e item.
  - Os parâmetros ficam salvos em `sb_debug_tuning_v1` e **valem em todas as próximas runs**, com o painel aberto ou fechado, até "Restaurar padrões". Há também "Copiar/Colar JSON".
  - Ações: dar itens e pílulas, curar, ligar o god mode, encher Chakra, mudar nível, somar Ryu, gerar mega elite, limpar inimigos, avançar o tempo, congelar.
- **Login e senha admin removidos** do código e da configuração. O texto "Administrador" que ainda aparece no hub é só o nome da carteira local de teste.

## Ainda parcial ou pendente

- **Mapa**: 4 mapas (Folha/Areia/Pedra/Névoa) de 160×160 com colisão de movimento (`src/scene/collision.ts`); inspeção visual pendente; sem mapa procedural.
- **Limite de inimigos**: `ENEMY_SCALING.maxEnemies` = 1.600 e Final Swarm até 8.000 (`progression.ts`); FPS em GPU real não medido.
- **Elenco liberado para teste**: `TEST_UNLOCK_ALL = true` em `src/game/account.ts` — voltar a `false` antes da versão pública.
- **Interface**: tema ninja (`src/ninja-theme.css`, fontes OFL locais); ficha P, Bolsa, Plano e configurações ainda só com os tokens.
- **Descoberta**: não considera oclusão por terreno ou árvores.
- **Selamento**: não tem tentativas nem chance de falha (a regra das 3 tentativas não está implementada). Também não existe selamento permanente para desbloquear personagens.
- **Aliados**: os valores dos buffs únicos são provisórios. Combos de vila/organização e afinidade são provisórios; não há aviso na tela ao ativar uma sinergia.
- **Moeda**: a fórmula de Lamens por desempenho é provisória e não foi balanceada. Com o modo debug dá para inflar a recompensa (avançar tempo, mudar nível), e parâmetros salvos (por exemplo, mais EXP) também afetam os Lamens das próximas runs.
- **Conta**: login, cadastro, save da run, ranking, backend e multiplayer não existem. O progresso fica em `localStorage`.
- **Atributos e itens**: a Sorte só afeta a raridade das ofertas de item e de técnica. Remover pílula/item (Shisui/Ichiraku) não existe.
- **Visual**: atlas e sprites são provisórios, sem animação por quadro.
- **Balanceamento**: todos os números são provisórios.

## Verificação (05/11/2026)

- **TESTADO nesta data**: `tsc -b` e `vite build` concluídos sem erro. O Vite avisa que o bundle JS tem 879 kB, acima de 500 kB.
- **TESTADO nesta data**: `node scripts/verify-rules.mjs` passou (23 shinobis, 69 técnicas, 94 itens, distribuição de crítico e raridade).
- **TESTADO nesta data**: `node scripts/verify-runtime.mjs` (Playwright/Edge) passou nas 23 verificações sem erros de JS, inclusive a nova verificação da tecla Y, já com debug, resumo e pílulas integrados.
- **TESTADO nesta data (debug sem login)**: teste avulso no navegador confirmou:
  - o modal de conta não tem campos de login nem de senha;
  - o painel abre sem login no servidor de desenvolvimento;
  - mudar o HP para ×2 no meio da run dobrou o HP de um inimigo vivo;
  - a chance de item ×30 mostra 54% efetivo;
  - os valores ficam salvos e são recarregados na run seguinte;
  - "Restaurar padrões" volta tudo a 1.
  - `verify-runtime.mjs` (23 verificações) continua passando.
- **TESTADO nesta data**: teste avulso no navegador (fora de `scripts/`) confirmou:
  - F9 abre e fecha o painel;
  - as cartas sorteiam as pílulas novas (17 distintas em 40 rolagens);
  - o resumo aparece na vitória com DPS;
  - a 390 px de largura não há rolagem horizontal.
- O resumo pós-run só foi visto numa vitória forçada (tempo avançado), não numa derrota real. Os sliders do debug não foram exercitados um a um. O resultado está em `artifacts/runtime-checks.json`.
- Nenhuma dessas verificações valida FPS com muitos inimigos, balanceamento ou jogabilidade manual.

## Referências principais

- [Arquitetura e estado do código](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md)
- [Câmera, mapas e eventos](01-CAMERA-MAPAS-EVENTOS.md)
- [HUD e ficha](02-FICHA-HUD-RANKING.md)
- [Aliados e selamento](03-ALIADOS-E-SELAMENTO.md)
- [Itens, habilidades e economia](04-ITENS-HABILIDADES-ECONOMIA.md)
- [Personagens e roadmap](05-PERSONAGENS-E-ROADMAP.md)
- [Economia, RNG e eventos](09-PROGRESSAO-ECONOMIA-RNG-EVENTOS.md)
- [Hub, elenco e economia](11-HUB-ELENCO-PLANO-ECONOMIA.md)
- [Skill de documentação contínua](../skills/documentar-projeto/SKILL.md)

## Estado atual da missão

O Genin abre com menos inimigos e menor HP dos comuns. Eles alternam caminhada/corrida, ataque, pulo e dash; parte deles é sorteada para atacar de longe com kunai, shuriken ou shuriken Fūma. Mega elites, guardiões e bijū mostram HP atual/máximo. Os encontros de conta preservam os requisitos do mapa, dificuldade, história, abates e minutos.

Teuchi fica diante da barraca do Ichiraku. Os Sapos Sábios sobre Gamakichi combinam dois ataques em um espaço ou fundem em uma técnica nova. NPCs com cartas mostram sua arte junto ao atendimento. A tigela de cura tem teto de 5% por abate e recupera 35% do HP máximo no padrão. A recompensa permanente continua por desempenho da missão.


## Oficina, controles, mercador e eventos · 07/11/2026

**IMPLEMENTADO**

- Oficina dos Sapos Sábios com abas Fundir e Combinar, ícones das duas técnicas e ficha acessível pelo botão P. As duas operações compartilham um único uso por zona. Abrir, fechar ou trocar de aba conserva o uso. O consumo ocorre após a união válida.
- O save guarda `campaign.sagesUsedZone`. Ao retomar, a zona usada continua bloqueada. Ao passar para outra zona, há um novo uso. Saves antigos com uniões e sem esse campo consideram o uso consumido na zona atual.
- WASD responde imediatamente. Em teclas opostas sobrepostas, vence a última pressionada naquele eixo. Soltá-la retoma a outra ainda segurada. Diagonais mantêm velocidade normalizada.
- Tab é reservado ao mapa rápido, com movimento e simulação ativos. P abre e fecha a ficha. Fechar a ficha por uma ação do usuário solicita a captura do ponteiro naquele mesmo evento.
- O estoque atual do mercador conserva os preços ao comprar e ao reabrir. Cada novo estoque considera raridade, compras acumuladas, atualizações acumuladas e tempo. O preço da atualização sobe por uso, com desconto dos itens.
- Cada zona sorteia uma Shuriken Amaldiçoada e um Corpo de Ninja. A shuriken concede +8% de dano total e chama emboscada. O corpo chama emboscada e concede um nível ao concluir, mantendo a escolha normal de level-up. O tamanho da onda cresce com dificuldade e zona. O +8% é calibração provisória do protótipo.
- Afiliações filtram a versão representada. As 96 versões possuem bônus de suporte. Curadores recebem regeneração e coleta. Ofensivos recebem bônus de sua escola, preservando os demais efeitos próprios. Valores são originais do jogo e seguem sujeitos a balanceamento.

**PENDENTE**

A revisão visual individual de caminhada, ataque, pulo e dash de todas as 56 versões continua na fila. Este lote não cria novas folhas de ação.

## Integração de 07/11/2026

A pasta principal reúne as duas linhas de trabalho nesta entrega. IMPLEMENTADO: Esc retoma a simulação ao fechar a pausa; WASD tenta recuperar a captura do ponteiro. Novos atlas regionais e ações estão conectados ao controlador compartilhado. Auditoria visual completa e revisão do restante do elenco continuam PENDENTES. Não houve recalibração dos números de combate neste lote.

## Lote de animações salvo para continuação · 07/11/2026

IMPLEMENTADO: 24 folhas completas adicionais 4×4 de ataque/selo/pulo/dash: Kakashi 1/25, Itachi 1, Minato 1/15, Tsunade 1/15/30, Jiraiya 1/20, Orochimaru 1/15, Hinata 1/15/30, Pain 1, Shikamaru 1/15/30, Tobirama 1, Temari 1/15 e Tenten 1/15. Todas foram empacotadas em células uniformes e registradas em directionalArt.ts, usado também pelos ajudantes. As três folhas completas de Sasuke 15 e Hashirama 1/20 já foram publicadas no lote anterior. Os prompts e referências estão em docs/arte-atlas-2026-11-07.json, gerados com ImageGen.

IMPLEMENTADO: prévia de Susanoo utiliza o mesmo rig WebGL e partículas do combate, escolhendo o estilo pela família do lançador. TypeScript, build e regras passaram após as mudanças.

PENDENTE: criar folhas completas de Kankuro 1/15/30 e Kushina 1 (quatro versões); revisar/refinar ataques antigos de Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. A existência da folha não confirma que todas as poses foram aprovadas visualmente. Conferir consistência com o sprite parado, frente/costas e dash esquerdo em cada versão e como ajudante.

O script scripts/verify-motion-atlases.mjs exercita o controlador em fixture isolada e produz artifacts/motion-review.json e quatro folhas de contato. A primeira execução tinha duas instâncias de Three.js; corrigido o import por scripts/motion-review-entry.ts. Conferir o resultado final antes de considerar a auditoria completa.

Continuam pendentes: inspeção visual dos quatro mapas, prévias/efeitos em combate de todos os lançadores, sons com licença verificada e uma run prolongada de três zonas até bijuu/saída/ranking. Preservar o balanceamento existente conforme instrução do usuário. Não publicar artifacts/sb-swishes-source.zip: é um arquivo preexistente de origem/licença não verificada.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

**Home:** Configurações e reprodução da trilha. **Configurações → Conta:** Reset de conta. **Preparação:** Táticas de Missão e Arsenal de Missão no topo. Escolha os salvos na tela de mapa. **Na run:** Esc abre a pausa com Configurações, o bolinho restaura HP e E junto ao Mega Elite caído inicia o selamento. Veja [a fila](13-PENDENCIAS-PARA-CONTINUAR.md).


## Rodada 53 · Estado e próximos passos

- Entregue: expansão para **96 versões de 56 famílias**, missões novas, Akamaru, expansão visual do Chōji, Zabuza na névoa, Fase 4 e contador de abates. Veja [elenco](21-ELASTAO-DE-HEROIS.md) e [efeitos](24-AUDITORIA-DE-EFEITOS.md).
- Pendente: comparar todos os jutsus com a obra e fazer efeitos próprios onde ainda há arte compartilhada. Priorizar as invocações de Nagato, o ataque das cem marionetes de Sasori, a névoa de Zabuza, técnicas médicas, kits de pouco material canônico e Ultimates especiais.
- Pendente: inspeção em gameplay das versões novas como jogador, ajudante e Mega Elite, incluindo orientação em câmera girada, identidade de traje, pés e transições. A suíte de atlas verifica quadros e espelhamento.
- Fase 5 restante: sequência em tempo real, card de temporada, glossário e layout dos blocos de combate. Continuam pendentes a run completa com GPU real, a publicação externa e as propostas de escala de mapas.
