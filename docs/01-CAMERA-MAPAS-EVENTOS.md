# Câmera, mapa, eventos e performance

**CONFIRMADO** — Mundo explorável amplo, top-down/ângulo livre, rotação horizontal de 360°, mouse para orientar câmera, salto para alcançar elevações e descobrir áreas ocultas. Terreno e construções podem impedir visão/navegação, mas **não bloqueiam acerto** quando alvo está dentro da área válida da habilidade.

## Mapas planejados
1. **Vila da Folha/Konoha**: ruas, muralhas, telhados, bosques e plataformas; evento de defesa da vila; afinidade de aliados da Folha.
2. **Vila da Areia/Sunagakure**: dunas e cânions, tempestade de areia e visão reduzida; escolta de pergaminhos.
3. **Vila da Névoa/Kirigakure**: pontes, água e neblina dinâmica; inimigos com status de água e emboscadas.
4. **Vila da Pedra/Iwagakure**: penhascos, elevações e desfiladeiros; exploração vertical e queda de rochas.
5. **Vila da Nuvem/Kumogakure**: montanhas, pontes altas e relâmpagos; evento de descarga elétrica.
6. **Floresta**: vegetação que encobre a visão; rastreio de mega-elites.
7. **Dimensões especiais**: portais, terreno excepcional e chefes raros.

Essas condições são **propostas**; números de buffs, penalidades, frequência e geometria precisam de balanceamento.

## Hordas
- Spawns contínuos por orçamento de dificuldade, não por ondas; 1 kill = +1 abate.
- Limite-alvo de 1.500 inimigos **vivos** no mundo, sem contar cadáveres, efeitos ou objetos. Oclusão, LOD, spatial hash, pooling e simulação de IA por frequência são necessidades técnicas.
- Inimigos normais, elites com contornos por tier, mega-elites e chefes. Barras de HP somente para mega-elites e chefes.
- **Estado do código**: spawn contínuo com teto de **180 vivos** (`difficultyAt` em `src/game/progression.ts`). Não há instancing, pooling nem spatial hash. A meta de 1.500 está **PENDENTE** e não foi medida. Elites comuns têm tom laranja. **IMPLEMENTADO**: mega elites e guardiões têm barra de vida 3D com nome acima do personagem (roxa no mega elite, laranja no guardião) e **usam as técnicas do próprio shinobi** contra o jogador, sempre com aviso vermelho no chão; quem sai da área marcada antes do golpe não leva dano (ver [12](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md)). O guardião também continua com a faixa de HP no HUD.
- Bosses/bestas de caudas e shinobis de Edo Tensei sorteados por mapa, regras de elegibilidade e dificuldade.

## Eventos
Escolta, altar, emboscada opcional, selamento, desafio de Guy, fendas/portais, proteção de objetivo, tesouro com maldição, chefes de área. Cada evento define objetivo, duração, recompensa, penalidade opcional e feedback no HUD.

### Regras acrescentadas pelas referências de 05/11/2026
As referências vieram de outro jogo; por decisão do usuário, nenhum nome ou tema daquele jogo fica no ShinobiBonk. Os nomes abaixo são os usados no código.

- **Plano do Shikamaru (CONFIRMADO pelo usuário em 06/11/2026; substitui a antiga Provocação do guardião)**: NPC Shikamaru (sprite de herói) em x:14, z:8. **IMPLEMENTADO**: cada E dá +1 kunai grátis ao derrotar o guardião da zona; limite 3 por zona (o 4º é recusado). Sem penalidade de dificuldade e sem bônus de saque. Ao derrotar o guardião caem 1 + planos kunais grátis (máximo 4). Pode ser usado antes ou depois de invocar o guardião. A contagem zera na troca de zona.
- **Selo do Guardião (IMPLEMENTADO):** fica a 14–30 m do centro da zona e ganha o ícone no mapa ao ser visto. **E** no **Portal do Guardião · Myōjinmon** invoca o Guardião daquela zona quando o jogador decidir. O painel mostra HP e defesa estimados. Vencer abre a passagem para a próxima zona, ou para a arena da bijū ao vencer o Guardião da zona 3.
- **Ebisu (CONFIRMADO pelo usuário em 06/11/2026)**: NPC em x:25, z:5 (`src/game/npcs.ts`). **IMPLEMENTADO**: 3 cartas de troca. Cada carta dá um ganho sorteado de +8% a +20% num atributo e cobra ganho × 1,1 de outro atributo, sorteado e mostrado antes da escolha. 1 uso por zona; X recusa sem gastar, e as ofertas ficam guardadas.
- **Iruka (CONFIRMADO pelo usuário em 06/11/2026)**: NPC em x:−24, z:14. **IMPLEMENTADO**, 1 uso por zona, 3 opções:
  1. Lição: +3% a +6% num atributo sorteado e mostrado, sem custo.
  2. Pergaminho lendário: 3 atributos no valor máximo (`LEGENDARY_VALUES`); escolher um custa −20% de outro atributo, mostrado antes.
  3. Iruka entra como ajudante com passiva já no máximo: +25% de XP (× força de suporte), ataque "Kunai da Academia". Fica desativada com o motivo se as vagas estiverem cheias ou ele já estiver na equipe. Iruka não é jogável, não conta no elenco de 22 e não pode ser selado.
  - Não existe sistema de "afinidade" de aliados; "afinidade máxima" foi interpretada como passiva em força máxima (PENDENTE confirmação).
  - Trocas usam pontos percentuais aditivos em `runBuffs`, recalculados das fontes; um custo nunca leva o bônus abaixo de −50%.
- **Naruto Totem (CONFIRMADO pelo usuário em 06/11/2026)**: sempre no minuto 7 do relógio regressivo (7:00 → 6:00, elapsed 180–240 s). **IMPLEMENTADO** (`src/scene/narutoTotem.ts`):
  - Naruto em roupa da Academia surge a 14 m do jogador com HP 650 × ameaça e barra própria. Não ataca, não é mega elite e não pode ser selado.
  - Invoca 4 clones das sombras a cada 0,6 s (teto 48 vivos) a 6–50 m do jogador; os clones vão direto atacar o jogador. Cada clone dá 5 de XP (sem Ryu/itens).
  - Morto: 2 level-ups na fila normal (só técnicas e pílulas). Se não morrer, some às 6:00 sem recompensa; os clones restantes se dissipam.
  - Entra no mapa só depois de visto em tela. Valores provisórios; performance com 48 clones + horda não medida.
- **Caça-Níquel da Tsunade (ex-"Roleta da Tsunade" — CONFIRMADO pelo usuário em 06/11/2026; substitui o Caça-níquel e absorve a Bênção de Tsunade; rodada 37: combos de 3 iguais + emboscada invertida + custo por zona)**: evento `slot` com sprite da Tsunade. **IMPLEMENTADO (fase 3 da rodada 37, commit `ec7c42a`)** (`src/game/roulette.ts`, `src/ui/TsunadeRoulette.tsx`):
  - E abre o overlay da roleta; a run fica pausada enquanto está aberto.
  - Controles: toque em E = 1 giro animado (1,6 s); segurar E = giro rápido contínuo (280 ms/giro) enquanto houver Ryu; E durante a animação = resultado instantâneo; F/botão liga e desliga o giro rápido (`sb_roulette_fast`).
  - Prêmios e penalidades acumulam numa lista e só são entregues ao sair (Esc/X/"Sair e receber").
  - Custo por giro: `round(30 × 1,70^giros × 1,15^minutos × (1+(zona−1)×0,25) × (1 − desconto, teto 40%))`; não reseta por zona. (Rodada 37: crescimento ×1,35 → **×1,70** + **fator de zona 0,25** — escala como o Ryu por zona; descontos Dente de Ouro/Gama-chan mantidos.)
  - **Emboscada invertida (rodada 37):** durante a interação a run pausa (jogador seguro); ao sair, **armadilhas shinobi explodem em 8 m** matando os monstros próximos (Totem, bijū e Guardião excluídos).
  - **Casas vigentes (15/11):** Tsunade, Hiruzen, Kakuzu, Jiraiya e Hidan. Sorteio, chances e os três rolos usam `ROULETTE_CASAS`. Giros já registrados em saves antigos conservam o pagamento.
  - Sorte multiplica casas boas por 1 + min(2, sorte/100) (premium ao quadrado); a pressão de dificuldade (maldição, zona, missão) multiplica as ruins; a fatia ruim fica sempre entre 15% e 60%. Com as 5 casas de combo (rodada 37): sorte 0 = **~30,9% boas** (asserção no verify-rules).
  - Buffs e debuffs são temporários e recalculados das fontes. Valores provisórios.
- **Emboscada da Akatsuki (IMPLEMENTADO, 15/11)**: substitui o Altar do Desafio. Zetsu emerge ao se aproximar. Clique no sprite ou aperte **E** para enfrentar as 13 versões da Akatsuki que constam no elenco. O encontro usa a ameaça atual da zona. Vencer o grupo inteiro rende **3 pergaminhos grátis**. A nuvem vermelha marca o evento no mapa.
- **Maldição de Orochimaru (CONFIRMADO; substitui a maldição do evento de referência)**: risco/recompensa opcional. **IMPLEMENTADO**: +20% de dificuldade e +25% de XP/saque, uma vez por zona.
- **Mega elite (CONFIRMADO)**: encontros especiais surgem organicamente e podem ser selados após a derrota. **IMPLEMENTADO**: shinobi aleatório do elenco (que ainda não é aliado). O primeiro surge entre 30 e 55 s e os seguintes a cada 45–70 s, até 9 por run. Rotação por zona e elegibilidade estão **PENDENTES**.
- **Guardião de zona (IMPLEMENTADO):** invocado com E no Myōjinmon. Os candidatos são os de `MAPS[].zones` em `src/game/maps.ts`, e a vida segue `guardianVitality` em `src/game/missions.ts`.
- **Arena da bijū (15/11):** o chefe inicial surge a 7 m na direção da câmera. A cena final oculta as construções e a vegetação do mapa enquanto a luta acontece. A entrada começa ao carregar o atlas e a arena retoma a posição salva do chefe.
- **Altares por raridade ("Altar · Normal/Incomum/Raro/Épico/Lendário", CONFIRMADO pelo usuário em 06/11/2026)**: 8 por zona (os 5 primeiros cobrem as 5 raridades; os outros 3 são sorteados). **IMPLEMENTADO e TESTADO no navegador**:
  - Pisar no círculo (3 m, `ALTAR_RULES.radius` em `GameCanvas.tsx`) já começa a contar, sem apertar E (o E **não reinicia** o altar — Rodada 49: guard idempotente + toast). O círculo fica dourado com o jogador dentro e vermelho fora.
  - Dentro, sobe 1 s por segundo até `ALTAR_RULES.seconds` = 10/14/18/23/30 s (Normal → Lendário), ou seja ~10%/s no Normal e ~3,3%/s no Lendário.
  - Fora do círculo a porcentagem **cai**; quanto mais raro, mais rápido (`ALTAR_RULES.decayPerSecond`, fração da barra por segundo): Normal 4%/s (~25 s para zerar), Incomum 6%/s, Raro 9%/s, Épico 13%/s, Lendário 18%/s (~5,5 s). Cada altar guarda o próprio progresso e cai sozinho enquanto o jogador está longe; ao zerar fora do círculo, o altar sai da barra.
  - Barra/percentual no HUD: "Protegendo altar · X%". Em 100% concede uma **bênção** (Rodada 51 — pedido do usuário: "Os altares não são para dar itens, mas buffs aleatórios de acordo com sua sorte/qualidade do altar"): 2–3 atributos sorteados (3 em Raro+), magnitude = `ALTAR_BUFF_BASE[tier]` (Comum 5% → Lendário 25%) × escala do atributo × (1 + sorte além de 10, +2% por ponto, teto +120%); aplica direto nos buffs da run (sem tela de escolha) e o toast lista a bênção ("…bênção: +X% de dano · …"). Valores **PROPOSTOS** (o usuário testa e ajusta).
  - Medição (Edge headless): Normal 5→12→22→32% em 4 s dentro e 30→27→23→20% fora; Lendário 2→4→7→10% dentro e zerou em menos de 1 s fora.
  - Ondas dedicadas durante o altar: **PENDENTE**.
- **Mercador (IMPLEMENTADO)**: troca kunai/shuriken guardadas por 5 Ryu cada.
- **Arsenal da Tenten (CONFIRMADO; IMPLEMENTADO; antes "Sharingan de Kakashi", trocado a pedido do usuário em 06/11/2026)**: NPC com sprite da Tenten no mapa (id `arsenal`). Ao interagir com E, o jogador escolhe um item que já carrega e ganha mais uma cópia dele, respeitando o limite do item. Pode ser usado uma vez por zona, e cancelar não gasta o uso.
- **Emboscadas (IMPLEMENTADO)**: a cada 18–30 s surgem 8 + 2×zona inimigos ao redor do jogador.
- **Tempo e clima (CONFIRMADO; IMPLEMENTADO)**: um clima sorteado a cada zona. Névoa reduz a visibilidade; tempestade de areia reduz o movimento em 27%. Outros climas por bioma estão **PENDENTES**.
- **Descoberta (CONFIRMADO)**: minimapa e mapa M mostram ícones só depois de o evento ser visto pela câmera. **IMPLEMENTADO**: teste de frustum da câmera até 40 m, com registro persistente. Oclusão por terreno ou árvores está **PENDENTE**. Tab abre o mapa rápido e P abre a ficha.

## Mapas e física · revisão de 11/11/2026

**TESTADO** no Edge headless (capturas dos quatro mapas no centro, nos cantos, nas bordas, nas construções e com zoom máximo):

- **Bordas sem vazio**: no canto do mapa a cordilheira cortava o plano próximo da câmera e deixava ver o céu. O plano próximo da câmera ortográfica agora fica em −70 m ou menos, e a montanha aparece inteira.
- **Colisão de movimento** (`src/scene/collision.ts`): construções, estátuas, casas, árvores, pinheiros, bambus e rochas bloqueiam o deslocamento do jogador, que desliza pela borda. Medido: andando reto contra uma construção a distância mínima ao centro ficou igual ao limite (raio + corpo), e raspando de lado o jogador contorna e segue. Inimigos contornam só as construções. O portal torii da Folha continua atravessável. Para desligar tudo: `COLLISION_RULES.enabled = false`.
- **Eventos e coletáveis** não nascem mais dentro de construções (altares exigem 5 m de folga).
- **Vegetação por bioma**: a Areia deixou de ter pinheiros e quase não tem bambu (rochas); a Pedra troca bambu por pinheiros e rochas.
- **PENDENTE**: conferir em GPU real a câmera deitada (pitch baixo) nos cantos, os climas e a prévia da seleção de mapa. Ajudantes e clones ainda atravessam o cenário.

Mapa procedural, spawn configurável por zona, balanceamento e multiplayer seguem **PENDENTES**. A arena atual tem 100×100 m. Consulte [estado do código](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md).

## Mapas jogáveis e progressão (IMPLEMENTADO em 06/11/2026, pedido do usuário)
- `src/game/maps.ts`: **4 mapas** com paleta de chão/terreno, cenário (pesos e tinta do atlas), climas e 3 zonas com nomes e guardiões próprios.

| Mapa | País | Tema | Climas | Zonas |
|---|---|---|---|---|
| Vila da Folha 木 | Fogo | florestas e trilhas | Céu limpo, Névoa espectral | Arredores da Folha → Trilha dos renegados → Cerco dos Kage |
| Vila da Areia 砂 | Vento | dunas e cânions | Tempestade de areia (lentidão), Sol do deserto | Dunas de Suna → Cânion dos Ventos → Muralha do Kazekage |
| Vila da Pedra 岩 | Terra | montanhas rochosas | Ventania, Poeira de pedreira | Pedreira de Iwa → Ponte de Kannabi → Pico do Tsuchikage |
| Vila da Névoa Oculta 霧 | Água | pântanos enevoados | Névoa Oculta (visão curta), Garoa fria | Ponte de Tazuna → Lago Sangrento → Torre do Mizukage |

- **Progressão por mapa** (`sb_map_progress_v1`): Chunin só libera ao vencer o Genin daquele mapa, Jonin ao vencer o Chunin, Kage ao vencer o Jonin. Cards mostram ✓/▸/🔒 por dificuldade.
- **Missões de desbloqueio** (`src/game/unlockMissions.ts`): cada shinobi bloqueado tem mapa + dificuldade + minuto; nessa run o "Shinobi para selar" dele aparece (um por vez, 60 s de intervalo). **Lendários**: Madara (Pedra · Kage · 7 min) e Hashirama (Folha · Kage · 7 min), com retrato oculto e nome "???".
- **Pausa (Esc)**: abre a ficha com rodapé de comandos e botões Desistir, Salvar e sair, Reiniciar, Mapa grande, Tela cheia, Preso (move para área livre), Mapa, Configurações, Relatar (copia um relatório) e Continuar. A caixa de comandos saiu do HUD.
- **Salvar e retomar**: "Salvar e sair", salvamento automático a cada 15 s e ao fechar o navegador (`sb_saved_run_v1`). O hub oferece "Continuar missão salva". Salva tempo, nível, EXP, abates, Ryu, kunais, itens, pílulas, técnicas, ajudantes e afinidade, buffs, usos, eventos, mapa explorado e posição; hordas e drops vivos voltam a surgir.

## Mapa, rota e ping (IMPLEMENTADO em 06/11/2026, pedido do usuário)
- `src/ui/MapOverlay.tsx` + `src/map.css`. M (completo) e Tab (rápido) mostram ícones só do que já foi **visto em tela** na run:
  - NPCs com retrato e selo da função (Tenten 🗡️ no Arsenal, Shikamaru ♟️, Tsunade 🎰, Ebisu 🕶, Iruka 📚, Orochimaru 🐍);
  - eventos com ícone e cor próprios (Selo do guardião, altares, mercador, Ichiraku);
  - mega elites, guardião e Naruto Totem com retrato e borda pulsante;
  - recompensas no chão (kunai, shuriken, Ryu).
  - Evento já usado aparece em cinza. A lista "VISTO NESTA RUN" fica ordenada por distância.
- **Rota**:
  - Clicar num ícone (no mapa ou na lista) define o alvo; clicar numa área livre cria um ping 📍 com rota. Só um alvo por vez; clicar de novo ou "✕ Limpar rota" remove.
  - Uma linha tracejada liga o jogador ao alvo no mapa e no minimapa.
  - Na HUD, um cartão abaixo do minimapa mostra o nome e os metros. A seta na borda da tela (ou um pino ▼ quando o alvo está à vista) usa a projeção da câmera. Alvos móveis são seguidos.
- **Chegada**: a menos de 3 m (ou ao usar o evento a até 4,2 m) aparece **"Chegou!"** e o rastreio é limpo. Um alvo consumido, derrotado ou coletado limpa a rota com aviso.
- G continua marcando ping na posição do jogador, sem rota. O minimapa mantém o norte para cima, enquanto a seta da tela segue a câmera.
- Mega elites e guardiões passam a ser registrados quando aparecem na câmera (até 40 m). Hooks de teste: `__shinobiTest.mapRoute`.

## H e opções gráficas
Modo H: ocultar números flutuantes, trilhas e efeitos ofensivos opcionais, mas manter lógica de colisão, dano, status e animação de hit simplificada. **IMPLEMENTADO** para projéteis, anéis, visuais e números. Não existe menu de configurações gráficas; as opções a seguir são futuras: densidade visual, LOD de inimigos, minimapa 15/30/60 FPS, partículas, qualidade, limite de FPS e transparência da HUD.
# Atualização da câmera e da partida

O mouse gira e inclina a câmera de **0,05 a 1,48 radianos** durante a partida (**rodada 44, 12/11/2026**: piso deitado para 0,05 rad ≈ 3° para o ângulo baixo do jogo de referência · taxa de giro **simétrica 0,0025 rad/px** em yaw e pitch, ~58% mais calma — antes 0,006/0,004 · início da partida em **0,55 rad** · 1:1 sem aceleração mantido · dica do multiplicador do ponteiro do Windows na tela de Configurações). Clique direito fixa ou solta o alvo. As técnicas e os ricochetes dão prioridade ao alvo vivo dentro do alcance efetivo. Sem um foco ao alcance, a mira volta ao inimigo mais próximo. Um projétil simples para no primeiro inimigo que encontrar na trajetória. A câmera fica acima do terreno. O volume ortográfico inclui o primeiro plano mesmo em inclinação baixa. A área jogável tem novas elevações e uma cadeia de montanhas ao redor dá profundidade ao horizonte. O céu usa um gradiente conforme o clima. O HUD conta os inimigos vivos da simulação e o minimapa amostra até 300 marcadores para manter a leitura. **A câmera centraliza sempre o JOGADOR** (alvo = posição do player + terreno, com scan que auto-sobe em encostas) — nunca a paisagem/mapa ao redor (decisão do usuário, reconfirmada na rodada 44).
O portal da arena final usa o marcador de nove caudas no mapa e no minimapa. Durante o controle da câmera, o cursor fica oculto sobre o cenário. Na Vila da Folha, as estátuas do vale se apoiam em topos mais largos. Cenários que ficam à frente e próximos do jogador perdem opacidade para manter o shinobi visível.

As texturas de Chōmei e Gyūki seguem as duas imagens enviadas pelo usuário. Chōmei tem três pares de asas laranjas com bordas verdes e uma cauda separada. Gyūki tem oito tentáculos com ventosas e o rosto bovino da referência. Os dois carregam texturas individuais pelo mesmo registro de arte das demais bijū. [Referência oficial de Naruto](https://naruto-official.com/en/news/01_2376), [Chōmei](https://naruto.fandom.com/wiki/Ch%C5%8Dmei), [Gyūki](https://naruto.fandom.com/wiki/Gy%C5%ABki).


## Eventos e controles atuais · 07/11/2026

Uma Shuriken Amaldiçoada e um Corpo de Ninja são posicionados aleatoriamente por zona. E inicia a interação. A primeira concede +8% de dano total e uma shuriken, além da emboscada. O corpo exige eliminar a onda antes de conceder um nível. O nível mantém o pool normal de habilidades e pílulas. No Genin da zona 1 as ondas têm quatro e cinco ninjas, respectivamente. Quantidade cresce por √dificuldade e +2 por zona adicional. O HP usa a escala de inimigos/desafios da run. Saves preservam corpos ainda ativos, cuja onda pode reiniciar ao retomar.

Tab mostra o mapa rápido e permite continuar andando. P fecha a ficha pela mesma tecla e solicita a captura do ponteiro durante essa ação. A oficina dos sapos tem um uso compartilhado entre Fundir e Combinar por zona. O mercador atual oferece quatro itens e mantém a cotação do estoque até a próxima atualização. Isso substitui a antiga troca de armas por cinco Ryu.

## Atlas regionais e retomada · 07/11/2026

IMPLEMENTADO: Areia, Pedra e Névoa têm atlas de chão próprios e construções/marcos regionais no atlas `regional-landmarks-v1.png`. Areia inclui residência circular e entrada entre rochedos; Pedra inclui torres e ponte de pedra; Névoa inclui residência cilíndrica e passagem úmida. Referências de arquitetura: https://naruto.fandom.com/wiki/Sunagakure , https://naruto.fandom.com/wiki/Kazekage%27s_Office , https://naruto.fandom.com/wiki/Iwagakure e https://naruto.fandom.com/wiki/Kirigakure . As construções são interpretações originais para o atlas. Validação visual ingame dos quatro mapas: PENDENTE.

Esc fecha a pausa e permite continuar a simulação sem clique extra; a captura do ponteiro é solicitada na interação seguinte com WASD quando o navegador a adia.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

Os cinco graus de altar usam cinza, verde, azul, roxo e dourado na estrutura e no círculo. A bênção entra ao concluir a defesa e sorteia atributos da ficha. O morro de bolinhos continua coletável com E e gera o bolinho de cura além do Ryu e do ímã.

## Mapas — estado em 15/11/2026 e próximos passos (passagem para outro agente)

Pedido do usuário (rodada 88): "Deixar anotado tudo que você tem sobre… os mapas". O padrão completo (onde fica cada coisa, regras de terreno, câmera, visual de cada vila, passo a passo e erros) está na skill [`criar-mapa-shinobibonk`](../skills/criar-mapa-shinobibonk/SKILL.md). Esta seção guarda só o estado e a fila.

### Feito

- **Rodada 77:** ninja do tamanho do monstro comum; câmera mais perto (zoom 12, faixa 8–22).
- **Rodada 85:**
  - Terreno em terraços baixos (degraus de ~1,2 m, máximo ~3,5 m dentro do mapa), montanhas só no horizonte e centro plano.
  - Encostas pintadas como pedra.
  - Câmera em perspectiva por padrão; a ortográfica fica nas Configurações.
- **Rodada 86:** chão plano sob as construções da Folha (`LEAF_PLACES`); skill de mapas.
- **Rodada 87:** nomes da obra (Konohagakure, Sunagakure, Iwagakure, Kirigakure · Vila Oculta da …); zonas fora da vila trocadas; horizonte de cada vila (`horizonProfile`).
- **Rodada 88:** pé dos personagens nunca abaixo do chão (`footHeight` + recuo de profundidade do chão).

### Fila

0. **Feito na rodada 89:** água cavada e animada (`water.ts`), paisagem de fundo de cada vila (`landscape.ts`), câmera 60° / 0,46 rad.
1. **Arte das construções de cada vila** (referências do usuário descritas na skill, §5), pela skill `criar-arte-shinobibonk`:
   - **Konoha:** portão com 忍, barraca de lámen, torre do Hokage, casas com caixa-d'água e os rostos do Monte Hokage no horizonte.
   - **Suna:** casas redondas de adobe, cúpula do Kazekage com 風 e passarelas.
   - **Iwa:** torres de pedra em cone e a torre do Tsuchikage.
   - **Kiri:** torres de tijolo com vegetação no topo e a torre do Mizukage.
   - **Para todas:** áreas planas sob cada construção, como `LEAF_PLACES`.
2. **Fundo pintado (skybox ou cartões ao longe)**, com os picos, cachoeiras e névoa de cada vila. Hoje o horizonte é só relevo.
3. **Fenda** (evento novo, desenhado a partir de vídeos de referência; os números ficam a definir pelo usuário):
   - Um aviso abre um portal por um tempo curto.
   - Ao entrar, a arena é separada (tigela cercada de paredões) e o relógio da zona para.
   - Ondas numeradas, com uma onda de elites, e o botão "chamar a próxima onda".
   - Depois da última onda vem o chefe, com tempo limite. A raridade da fenda (Comum → Lendária) aumenta as ondas e o tempo.
   - **Recompensa:** itens e a escolha de **1 relíquia entre 2, ou nenhuma**, para o resto da partida. São **3 vagas**.
   - **Relíquia:** raridade + 1 atributo principal + 1 **subpassiva** com nome. Exemplos de forma: onda de choque periódica; bônus de dano por inimigos próximos; dano extra em inimigos com status.
4. **Névoa do Zabuza**:
   - branca e densa, cobrindo tudo, como gelo e névoa do anime;
   - enquanto estiver ativa, os alvos a até 2 m aparecem.
5. **Árvores bloqueando** andar e dash; hoje o dash atravessa.
6. **PENDENTE DE VALIDAÇÃO E2E (sem navegador para os agentes):**
   - degraus e encostas;
   - construções no chão;
   - horizonte de cada vila;
   - câmera em perspectiva: rotação, zoom, barra de vida e números de dano;
   - pés sobre o chão nas encostas;
   - FPS com a malha 340 × 340.

### Pedidos de arte para o gerador do usuário (rodada 89)

O atlas atual cobre a parte principal:
- Suna: prédio do Kazekage com 風, portão do cânion e casas de adobe.
- Iwa: torre do Tsuchikage com 土, ponte de pedra e torres gêmeas.
- Kiri: torre do Mizukage com 水, ponte e casas sobre palafitas.
- Folha: o Monte Hokage, as estátuas, o torii, a barraca de lámen e a casa.

Para as vilas ficarem com a cara das referências, faltam estes sprites. Todos no mesmo estilo do atlas: pixel art em três quartos, contorno escuro, fundo transparente, célula de 512 px, base reta para assentar no chão.

1. **Konoha · portão principal:** dois pilares de madeira com portas verdes abertas e os kanji 阿 e 吽 em vermelho, travessa com a placa 忍 e o símbolo da Folha.
2. **Konoha · torre do Hokage:** cilindro vermelho em andares, com telhados de telhas douradas, emblema 火 num disco branco, base branca e antenas.
3. **Konoha · casa com caixa-d'água:** casa redonda de reboco claro, telhado de telhas vermelhas e caixa-d'água cilíndrica de madeira no telhado.
4. **Iwa · torre em cone esculpida na rocha:** cinza, com janelas pequenas, telhadinho roxo ou laranja no topo e cabos saindo para os lados.
5. **Kiri · torre cilíndrica de tijolo rosado:** fileiras de janelas e vegetação no topo; uma versão baixa e outra alta.
6. **Suna · passarela sobre pilares** de adobe, para ligar casas.

## Passagem para o Codex · 15/11/2026 — tudo de mapa, cenário e itens feito pelo Claude Code nesta sessão

Pedido do usuário: "pause e anote tudo que você fez de mapa/cenario/itens nessa sessão, você vai trabalhar em desempenho, no código... e o codex vai trabalhar no resto".

**Divisão a partir de agora:**
- **Claude Code:** desempenho (docs/13, item 40).
- **Codex:** mapas, cenário, itens, selos de mão, fusões e o resto da fila.

Antes de mexer, leia a skill [`criar-mapa-shinobibonk`](../skills/criar-mapa-shinobibonk/SKILL.md). Ela tem o padrão, os alvos medidos e os erros que não podem voltar.

### O que foi feito (rodada, arquivo, o que conferir)

| Rodada | O quê | Onde no código | Testes |
|---|---|---|---|
| 77 | Ninja do tamanho do monstro comum; câmera mais perto (zoom 12, faixa 8–22) | `worldScale.ts` (`PLAYER_SIZE`), `settings.ts` (`CAMERA_ZOOM`) | `colisao`, `configuracoes` |
| 81–82 | Catálogo de fusões; receita na aba Habilidades; modelo salvo no planejamento; 1 clique planeja | `techniqueMerge.ts` (`fusionCatalog`), `BuildPlanner.tsx` | `fusoes` |
| 84 | Missão só sorteia itens da bolsa (bolsa vazia = pool completo) | `catalog.ts` (`missionItemPool`), `main.tsx` | `recompensas` |
| 85 | Terreno em terraços (~1,2 m), montanhas só no horizonte, câmera em perspectiva (vista antiga nas Configurações) | `terrainArt.ts` (`TERRAIN`, `terrace`), `settings.ts` (`CAMERA_VIEW`, `cameraProjection`), `GameCanvas.tsx` | `cena`, `configuracoes` |
| 86 | Chão plano sob construções da Folha; skill de mapas | `terrainArt.ts` (`LEAF_PLACES`, `LEAF_BUILDINGS`) | `cena` |
| 87 | Nomes da obra nos mapas; zonas dentro da vila; horizonte de cada vila | `maps.ts`, `terrainArt.ts` (`horizonProfile`) | `cena` |
| 88 | Pés nunca abaixo do chão (todos os personagens); Ultimate automática lembrada | `heightField.ts` (`footHeight`), `standHeight` no `GameCanvas` | `cena`, `configuracoes` |
| 89 | Água cavada e animada; paisagem de fundo pintada; câmera 60° / 0,46 rad | `water.ts`, `landscape.ts` | `cena` |
| 90 | Dano visível: vinheta forte, personagem pisca vermelho, baque dissonante | `damageFeedback.ts`, `playerMotion.ts`, `sfx.ts`, `style.css` | `vinheta-de-dano` |
| 91 | Ondas na água onde o ninja pisa; brilho de chakra azul nos pés | `water.ts` (`RIPPLES`, `createChakraFeet`) | `cena` |
| 92 | 8 desenhos de pergaminho no chão; Pedra Memorial de Konoha (−38, −26) | `dropSprites.ts` (`SCROLL_STYLES`), `memorialStone.ts` | `cena` |
| 93 | Shinra Tensei: Pain levita e solta 4 ondas que ferem, empurram e atordoam | `shinraTensei.ts`, `castUltimate` | `shinra-tensei` |

Nada disso foi visto na tela pelos agentes (sem navegador). Tudo está **PENDENTE DE VALIDAÇÃO E2E** (docs/13, itens 28–43).

### Fila que fica com o Codex

1. **Arte das construções de cada vila:** os pedidos, com descrição pronta para o gerador de arte, estão acima, em "Pedidos de arte para o gerador do usuário". Toda construção nova precisa de área plana (`LEAF_PLACES` / `REGIONAL_PLACES`) e entra no teste de chão plano.
2. **Água:** respingos em partículas ao correr e no dash, ondas de aliados e inimigos, anel de chakra no ritmo dos passos e arte própria do brilho (comentário "PARA O CODEX APRIMORAR" em `water.ts`).
3. **Selos de mão** (pedido do usuário: "Posições de mãos que todos os personagens devem fazer… aleatoriamente para soltar as habilidades… Se você souber… para determinada jutsu… ótimo… TODOS os personagens"). **Plano já desenhado, nada implementado:**
   - **Os 12 selos:** Rato 子, Boi 丑, Tigre 寅, Coelho 卯, Dragão 辰, Serpente 巳, Cavalo 午, Carneiro 未, Macaco 申, Pássaro 酉, Cachorro 戌, Javali 亥.
   - **Todos os personagens:** um selo flutuando acima da cabeça com o kanji do animal e o nome em português, mostrando a sequência um a um, cerca de 0,1 s por selo.
     - Aparece ao lançar Ninjutsu ou Genjutsu, no máximo a cada ~2,5 s, porque as técnicas são automáticas e o selo não pode virar ruído. Na Ultimate aparece sempre. Taijutsu não tem selo.
     - Ponto de entrada: `castTechnique(...)` no `GameCanvas` (`ally=false` para o jogador; aliados e companheiros também passam por ele).
   - **Corpo fazendo o selo:** só o Naruto e o Zabuza têm folha (`handSealArt` em `directionalArt.ts`, layout 4 × 4). Os outros precisam de arte nova, no mesmo layout.
   - **Sequências da obra** (conferir na Narutopedia antes de fixar):

     | Técnica | Sequência |
     |---|---|
     | Grande Bola de Fogo | Serpente → Carneiro → Macaco → Javali → Cavalo → Tigre |
     | Fênix de Fogo | Rato → Tigre → Cachorro → Boi → Coelho → Tigre |
     | Chidori e Raikiri | Boi → Coelho → Macaco |
     | Invocação | Javali → Cachorro → Pássaro → Macaco → Carneiro |
     | Parede de Terra | Tigre → Coelho → Javali → Cachorro |
     | Dragão de Água | começa com Boi → Macaco → Coelho → Rato → Javali → Pássaro |

     O Kage Bunshin usa o selo em cruz próprio, e as demais técnicas sorteiam de 2 a 4 selos.
4. **Fusões:** plano completo em `docs/10` (só receitas; lista proposta aguardando aprovação; atributos somados; sem raridade; cartão novo e ficha ao passar o mouse).
5. **Névoa do Zabuza:** branca e densa, cobrindo tudo; os alvos a até 2 m aparecem.
6. **Árvores bloqueando** andar e dash.
7. **Velocidade:** elite um pouco mais rápido que o monstro comum; Mega e chefe mais rápidos ainda.
8. **Orochimaru Sannin** com bandana da Folha e colete verde.
9. **Fenda:** desenho em "Fila" acima (portal, arena, ondas, chefe com tempo, relíquias em 3 vagas com subpassiva).
10. **Balancear os status:** muitas técnicas só dão crítico (Pedra e Água inclusive).

### Anotações do usuário para o Codex · 15/11/2026 (rodada 96)

> Anotações para o Codex: Aprimorar com tudo que você sabe, referências, ideias que já implemetamos, cenário, habilidades, tudo que o Claude fez e deixou anotado pra você. Os cenários, você tem a foto dos mapas no próprio jogo ao selecionar, porque você não usou isso para fazer os mapas? é literalmente fazer aquela foto ser jogável como um mapa do jogo... e aplicar para todos os mapas seguindo aquelas fotos que você tem, além disso te dei referência de todos os mapas.
>
> Casas, árvores, pedras, construções, tudo devem ser obstaculos, ou seja o personagem pode rodear, subir, fazer animação do personagem andando na parede para subir essas coisas, no desenho também acontece, imagino que é só virar a folha de caminhar no chão ao chegar perto que funciona, ou apertar o botão de pulo para ele grudar e caminhar na parede e apertar novamente faz ele pular e soltar.

**1. As fotos da seleção de mapa viram o mapa jogável.**
- A arte está em `public/assets/map-previews-v1.png`, 2 × 2: Folha em cima à esquerda, Areia em cima à direita, Pedra embaixo à esquerda, Névoa embaixo à direita.
- Cada mapa deve reproduzir a sua foto em 3D jogável, com os mesmos lugares, nas mesmas posições relativas:
  - **Konoha:**
    - o Monte Hokage com os rostos no fundo;
    - o prédio do Hokage, vermelho com cúpula, no meio;
    - a muralha e o portão vermelho com telhado na frente;
    - a rua de terra subindo até o prédio;
    - casas de telhado vermelho e amarelo entre árvores densas;
    - um penhasco cinza na borda.
  - **Suna:**
    - a cidade de adobe murada, com a grande cúpula do Kazekage no centro e torres redondas na muralha;
    - o portão em arco na frente;
    - arcos de rocha naturais;
    - mesas em degraus em volta;
    - dunas e tempestade de areia.
  - **Iwa:**
    - a fortaleza redonda no topo de um pico;
    - casas de pedra em plataformas nos penhascos;
    - pontes em arco entre os picos;
    - escadas na rocha;
    - névoa entre os picos;
    - montanhas nevadas ao fundo.
  - **Kiri:**
    - um canal de água com pontes de madeira em arco;
    - casas de telhado azul sobre palafitas com lanternas;
    - cachoeiras saindo de paredões de pedra;
    - pinheiros e garoa.
- O que já existe ajuda:
  - terraços (`terrace`);
  - água cavada (`water.ts`, que dá para virar canal em Kiri);
  - horizonte e paisagem por vila (`horizonProfile`, `landscape.ts`);
  - áreas planas para construções (`LEAF_PLACES` / `REGIONAL_PLACES`).
- Junto com a foto, use as referências de anime e de vídeo descritas na skill `criar-mapa-shinobibonk` §5.

**Prévias para revisão · 15/11/2026.** Entregues no chat quatro cenas isoladas, com comparações à arte da seleção. Konoha usa portão, muralha, rua e Monte Hokage. Suna usa recinto murado, arcos de rocha e a sede do Kazekage. Iwa usa passagens em arco e fortaleza sobre os terraços. Kiri usa canal, passarelas e casas com telhados azuis. São renders do protótipo de terreno e cenário, com os atlas do projeto, campo de visão de 60° e zoom 22. A integração de colisões, escalada, eventos e água em movimento depende da revisão das composições.

**Acesso durante a missão.** As entradas de Konoha, Suna, Iwa e Kiri devem conectar a área externa às ruas e praças da vila, com NPCs e eventos acessíveis no mesmo mapa. A escalada das superfícies fica no escopo abaixo.

**2. Tudo é obstáculo, e dá para subir.**

Confirmação do usuário em 15/11: preservar a câmera e a movimentação atuais. Obstáculos incluem casas, paredes, árvores e pedras e devem permitir caminhar sobre a superfície ao escalar. Enquanto segurar a tecla contra a base de um obstáculo, a animação de deslocamento continua. As capturas dos mapas novos devem ser enviadas ao usuário antes de aplicá-los à versão de teste.
- Casas, árvores, pedras e construções bloqueiam a passagem. O personagem contorna, sobe ou **anda na parede**.
- **Proposta de mecânica:**
  - Encostar numa parede e apertar **Pulo** gruda o ninja nela. Ele anda na parede com a mesma folha de caminhada, girada 90° e encostada na superfície. Apertar Pulo de novo salta e solta.
  - Ao chegar ao topo, ele sobe e anda por cima (telhado ou topo da rocha).
  - O dash continua atravessando, como hoje (`exitAlong`).
- **Onde mexer:**
  - `src/scene/collision.ts`: `createSolids`, `resolve` e `exitAlong`. Hoje há raio de colisão para árvores e rochas (`COLLISION_RULES.scenery`) e para construções (`addBuilding`), mas "as árvores deveriam ser objeto de bloqueio" ainda está na fila.
  - Movimento e pulo no `GameCanvas`: `jumpTime` e `standHeight`.
  - Poses em `playerMotion.ts` e na skill `movimentar-shinobi`.
- **Cada obstáculo precisa de uma altura** de topo para "subir em cima": construção pela altura do sprite, árvore pela copa, rocha pela altura.

**3. Base para tudo:** leia a passagem acima, o `docs/10` (fusões), a skill de mapas e o `CONTEXTO-COMPLETO.md` da pasta arquivada de referência (fora do projeto, ver skill `referencia-externa`). Nada do jogo de referência entra no repositório.

### Evento Treinamento do Hagoromo — especificação para o Codex (pedido do usuário, 15/11/2026)

É a versão do ShinobiBonk da "Fenda" descrita na fila acima (o equivalente do jogo de referência). O usuário pediu: "Anotações para o Codex… No nosso jogo podemos chamar de Treinamento do Hagoromo… Crie esse evento". As imagens enviadas foram uma clareira de treino cercada de floresta, com três troncos e a Pedra Memorial (o Campo de Treinamento 3 do anime), e a lista das ferramentas do Sábio dos Seis Caminhos.

**Chave (tentativa):**
- A cada **500 abates** o jogador ganha **1 chave**. Ela aparece ao lado dos itens na HUD.
- Acumula **até 3**.
- **Monstros das hordas do evento não contam** para recarregar a chave.

**Botão na HUD** (pedido do usuário: "botão, coloque o ícone/foto do hagoromo e a tecla de acionamento ao pequeno embaixo e 3 bolinhas para serem preenchidas em cima do icone"):
- **Ícone:** retrato do Hagoromo em pixel art, no estilo dos retratos do jogo, a partir da imagem do anime que o usuário enviou: cabelo claro espetado com os chifres, Rinnegan, o tomoe vermelho na testa e o manto branco de gola alta. A imagem do anime não entra no projeto.
- **Tecla:** pequena, embaixo do ícone (C, ou a tecla remapeada).
- **Chaves:** 3 bolinhas em cima do ícone, preenchidas conforme as chaves acumuladas (0–3).
- **Recarga:** com 0 chaves, o ícone fica apagado e mostra o progresso até os próximos 500 abates.
- **Lugar:** ao lado dos itens na HUD, junto do botão da Ultimate.

**Ativação:** tecla **C**. Respeita o remapeamento de teclas: acrescentar a ação em `KeyAction` / `DEFAULT_KEYS` (`src/game/settings.ts`); hoje C está livre.

**Raridade sorteada a cada ativação:**

| Raridade | Hordas | Monstros por horda |
|---|---|---|
| Comum | 3 | 50 |
| Incomum | 4 | 100 |
| Raro | 5 | 150 |
| Épico | 6 | 200 |
| Lendário | 7 | 400 |

**Como funciona (solo):**
1. O jogador é **teletransportado** para a arena do Hagoromo: clareira de grama com manchas de terra, cercada de floresta densa, com três troncos de treino e um círculo de pedra.
   - Pode reaproveitar `arena` (já existe para a Bijuu, `arena=true`).
   - O relógio da zona fica parado lá dentro.
2. As hordas nascem **em volta** do jogador, uma depois da outra. Aproveitar o anel da armadilha (`trapRing` em `src/game/fallenTrap.ts`). Um botão "Chamar a próxima horda" é opcional.
3. Derrotadas todas as hordas, aparece um **Mega Elite**.
4. **Dificuldade** das hordas e do Mega Elite:
   - acompanha a zona, mais os buffs ativos do jogador de %inimigos e %dificuldade;
   - também entra o **Final Swarm** pelo tempo sobrevivido: quanto mais tarde, mais difícil, até quase impossível. Isso é intencional.
5. Vencendo, o jogador recebe a recompensa e volta ao mapa, no mesmo ponto.

**Recompensa:**
- Escolha de **1 entre 3** ferramentas, ou nenhuma, cada uma com a sua raridade (Comum, Incomum, Raro, Épico ou Lendário).
- Ficam até o fim da partida.
- Sugestão de 3 vagas, como as relíquias do jogo de referência; o usuário confirma.

**Limite de 3 ferramentas e troca** (pedido do usuário: "no máximo podemos ter 3 dessas ferramentas… o jogador pode trocar entre ferramentas durante a partida"):
- **Com menos de 3:** clicar numa ferramenta do pool **acrescenta** ao conjunto.
- **Com as 3:** depois de escolher no pool, aparece a pergunta "Manter?", com a ferramenta nova e as 3 que ele já tem.
  - Clicar na **nova** a dispensa: o conjunto fica como está.
  - Clicar numa que ele **já tem** troca essa pela nova.

**Recarga da chave por modo:**
- **Clássico:** depois de derrotar o **chefe da zona** (guardião), as chaves **param de recarregar** naquela zona, para não ficar repetindo hordas e Mega Elite só para pegar ferramentas.
- **Sobrevivência:** as chaves continuam recarregando sempre (anotado a pedido do usuário).

**Na HUD do personagem:** os sprites das ferramentas aparecem em 3 quadradinhos **abaixo do nível e do XP** no cartão do personagem (retrato, nome, nível, barra de vida, barra de XP). Os vazios ficam com contorno apagado.

**Itens do pool do evento** (buscar a forma no material de referência arquivado, fora do projeto):
- um item que **aumenta a quantidade** de opções no pool da recompensa (+1 carta);
- um item que **melhora a qualidade** (raridade) das opções.

**As 9 ferramentas do Sábio dos Seis Caminhos** (nomes da lista do usuário):
- **Divisão por raridade:** 2 Comum, 2 Incomum, 2 Raro, 2 Épico, 1 Lendário.
- Cada uma dá **1 atributo da ficha** e **1 subefeito**. Os valores escalam com a raridade e são uma proposta para balancear no simulador.

| Raridade | Ferramenta | Atributo | Subefeito (proposta) |
|---|---|---|---|
| Comum | Amuleto de Selamento | +8% de HP máximo | A cada 100 abates, um selo explode em volta do jogador e paralisa os inimigos a 6 m por 1 s |
| Comum | Partículas Polares | +6% de área | Abates por técnica de área deixam partículas que puxam drops (Ryu, XP) a 4 m |
| Incomum | Shakujō | +10% de duração de status | Cada 5º golpe que aplica status espalha o mesmo status para 2 inimigos próximos |
| Incomum | Espada | +12% de dano físico (Taijutsu) | Crítico abre um corte em linha que atravessa 3 inimigos com 50% do dano |
| Raro | Bashōsen (leque) | +1 projétil | A cada 8 s, uma rajada de vento empurra e corta tudo a 8 m na direção do movimento |
| Raro | Kōkinjō (corda dourada) | +15% de dano em elites e Mega Elites | Ao acertar elite, prende com a corda por 1,5 s (atordoa); no máximo 1 a cada 10 s por alvo |
| Épico | Benihisago (cabaça vermelha) | +15% de Ryu e +10% de XP | Ao derrotar 100 monstros, recebe uma grande quantidade de Ryu (escala com a zona) |
| Épico | Kohaku no Jōhei (jarro de âmbar) | +12% de chance crítica | Crítico estoura uma bomba de fumaça shinobi: lentidão e cegueira (inimigos erram golpes) a 4 m por 2 s |
| Lendário | Shichiseiken (Espada de Sete Estrelas) | +25% de dano total | A cada 7 s, sete lâminas de luz caem sobre os 7 inimigos mais fortes a 15 m |

**Onde mexer (sugestão):**
- **Regras puras** num módulo novo, `src/game/hagoromoTraining.ts`: chaves, raridade, hordas, pool e ferramentas. Testes em `tests/`.
- **Partida:** `GameCanvas.tsx`. Teletransporte e arena como a Bijuu, `spawnEnemy` para as hordas e o Mega Elite, e a recompensa no mesmo fluxo de escolha das cartas.
- **Arte:** ícones das 9 ferramentas pela skill `criar-arte-shinobibonk`. A arena segue a skill `criar-mapa-shinobibonk`.
- **Regra do projeto:** nenhum nome do jogo de referência no código, nos textos ou nos commits.


## Validação das vilas jogáveis · 23/11/2026

A branch de revisão combina o terreno e os sistemas da versão principal com quatro vilas navegáveis. As fachadas e os telhados são malhas fixas. Árvores usam os sprites de cenário. Monte Hokage e estátuas têm frente texturizada e volume de rocha por trás. No novo terreno, as pontes dão apoio e o canal de Kiri usa o sistema de água da cena. Os eventos de missão preferem áreas secas acessíveis ao longo das ruas. A arena final descarta a sobreposição das vilas e a clareira de Hagoromo mantém seu espaço específico.

Partidas novas da branch iniciam nos bairros urbanos. A variante e o apoio dos pés ficam na partida salva. Um save anterior a esse campo abre em mapas básicos. As prévias nativas mostram geometria, composição de fachadas e materiais. Em partida, conferir os climas, a água, os efeitos e o resultado em movimento. [Guia de criação](development/CRIAR-MAPAS-JOGAVEIS.md).


### Tamanho e geração dos bairros

Konoha ocupa até 42 m de cada lado da avenida e ganhou 24 lotes laterais. A semente da missão varia posição, escala e acabamento de cada lote. A troca de zona reposiciona os NPCs. Retomar recupera os pontos e a semente originais. O Monte Hokage fica ao norte, com base de rocha. A cada subpasso, o movimento resolve contato e altura do apoio.


### Expansão urbana e malhas de degraus

A área urbana de Konoha ocupa 81,3% dos pontos da grade de 1 m dentro do limite jogável, incluindo ruas, praças, lotes e parques, com a clareira de Hagoromo reservada. Foram acrescentadas três praças e três pontes sobre o rio da Folha. As escadas usam perfis contínuos com uma face por piso. O terraço lateral se prolonga para o pátio do quarteirão e desce até a outra rua.


### Konoha, volumes fixos e orçamento de iluminação

Os eventos da missão deixam de usar sprites que acompanham a câmera. Os NPCs reutilizam o atlas em superfícies fixas de frente, verso e perfil. Altares, Myōjinmon, Ichiraku e mercador têm peças volumétricas agrupadas por material. Interações, sorteio da posição e cores de raridade usam as regras da missão.

Monte Hokage e estátuas usam o alfa da arte própria do projeto para limitar os volumes de rocha. O caminho do lado oeste leva a um mirante. As estátuas ficam em margens secas, com apoio ajustado ao terreno. A Academia e a casa dos Uzumaki compõem os marcos residenciais, e a casa de banhos e as pontes vermelhas fazem parte do passeio do canal.

Qualidade Alta e Média habilitam sombras locais na vila da Folha. A câmera da luz cobre o entorno do jogador e atualiza o mapa de sombras a cada 4 m. A água usa profundidade geométrica, normais animadas e reflexo aproximado do céu em uma passagem da própria superfície.

Referências consultadas: [A casa dos Uzumaki no anime](https://naruto-official.com/en/anime/boruto/list/01_962), [Academia Ninja](https://naruto.fandom.com/wiki/Academy), [Ichiraku no anime](https://naruto-official.com/en/anime/naruto1/list/01_392) e as imagens enviadas pelo usuário.

## Acabamento do chão de Konoha

As ruas mantêm terra batida, as praças usam pedra e o gramado se mistura aos acostamentos. O relevo usa as mesmas faixas suaves da pintura para evitar degraus artificiais nas bordas. A escala do atlas e a filtragem preservam detalhes no plano inclinado.

## Limite visível e vista acima do terreno

As missões usam um perímetro de postes e travessas no limite de movimento. Em Konoha, um bosque separa a cerca das colinas e da névoa do panorama. O Monte Hokage mergulha na encosta. A câmera conserva a inclinação pedida quando há folga e sobe quando a posição da órbita alcança o terreno. Uma superfície opaca fecha a junção inferior do panorama.

## Vale do Fim e objetos sobre o piso

Os versos de Hashirama e Madara mantêm a pose e usam arte própria sobre o relevo curvo. Os pergaminhos e os itens de cenário repousam na superfície e têm sombra de contato. Os drops de abate ficam apoiados até serem atraídos. O farol do pergaminho grátis continua visível.

## Margens e bairros regionais

A água usa borda que perde opacidade na margem, leito contínuo e maior resolução junto ao primeiro plano do canal. Teuchi e Zetsu mantêm seus alvos de clique. Suna, Iwa e Kiri ligam seus novos bairros pela mesma pintura de ruas e acostamentos de Konoha. As quatro vilas têm sombras locais configuradas pela qualidade gráfica.

## NPCs animados · 24/11/2026

A arte anterior de Shikamaru, Orochimaru, Ebisu, Iruka, Zetsu, Tsunade, Tenten, Guy, Sapos Sábios e Teuchi volta à cena. A malha do sprite anima tronco e cabeça, com os pés na altura do chão. O ponto de interação e o rumo do ator permanecem fixos. Os shinobis com vistas próprias usam perfil e costas conforme o ângulo. Ebisu, Teuchi e Sapos Sábios preservam a vista original de frente e têm uma folha suplementar de perfil e costas. A animação de repouso também funciona nesses ângulos, com uma única figura visível a cada instante. Naruto Totem alterna entre preparação e selo do Naruto Genin com vistas dianteira e traseira. O mercador é representado pela construção.

## Pátio da Academia e Pedra Memorial

O balanço fica à esquerda de quem olha para a Academia, no bairro noroeste de Konoha. O pátio de terra batida liga a rua transversal à entrada com o emblema redondo. As cordas e o assento oscilam juntos sob o galho. O tronco e as raízes mantêm suas posições no mundo. A textura da copa usa um recorte das folhas do atlas local `environment-v2.png`.

A Pedra Memorial fica na clareira a oeste da praça, em `(-38, -26)`. O corpo escuro facetado tem a ponta do memorial do anime, inscrições, lajes baixas e flores sobre o piso. A vegetação emoldura a clareira com acesso livre pelo sul. Os dois marcos podem receber rota por M/Tab desde a entrada na vila. A névoa do Zabuza continua ocultando os marcadores enquanto durar.

Foram usadas a imagem do pátio da Academia enviada pelo usuário e o desenho facetado do anime para a pedra. [Pedra Memorial na Narutopedia](https://naruto.fandom.com/wiki/Memorial_Stone) · [Cena do memorial no anime](https://x.com/danbito_/status/1212582164371521538) · [Obito e o memorial no site oficial](https://naruto-official.com/en/news/01_1706).
