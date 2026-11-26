# CHANGELOG

## 26/11/2026 · Eventos na home (Claude Code)

- **Pedido do usuário:** "Os eventos devem aparecer na home do jogo e não lá no planejar missão"
- **Home** (`src/main.tsx`): cartão "Evento · Prova Chūnin" ao lado de "Build preparada", com o progresso (x/15 duelos vencidos ou "Concluído") e o botão "Abrir evento →". O "Voltar" da aba Eventos leva à home.
- **Planejar missão** (`src/ui/MapSelect.tsx`): sai o botão "Eventos · Prova Chūnin". O botão "Eventos" do menu do topo continua.
- **Testes:** 1 teste novo em `tests/eventos.test.mjs` (mínimo 351) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver o cartão na home.

## 26/11/2026 · Chefes inabaláveis e em fúria; aviso ao Codex sobre os climas de Haku, Gaara e Zabuza (Claude Code)

- **Pedido do usuário:** "Os bosses não podem ser empurrados e entram em rage ao perder 30% do HP" → "adicione essa mecânica"
- **Novo `src/game/bossRage.ts`** (`BOSS_RAGE`, `bossRageDue`, `rageDefense`, `immovableBoss`): Guardião, Bijū e Totem não são empurrados nem puxados (status Empurrar, Bansho Tenin, Chibaku Tensei, Shinra Tensei e a repulsão do Deva). Antes o Guardião ainda andava 40% do puxão. Continuam tomando dano e os outros status.
- **Fúria do Guardião:** ao chegar a 70% da vida (perdeu 30%), entra em fúria uma vez: +25% de dano nos golpes e técnicas e fecha 30% do dano que ainda passava pela defesa (ex.: 60% → 72%). Aviso na tela e anel vermelho. A Bijū segue as fases dela (fúria ao perder 1/3 e 2/3 da vida, com atordoamento).
- **Pedido do usuário:** "Haku nasceu e não fez o efeito de névoa de gelo, tempestade de gelo na tela, anote para o codex · revisar os efeitos em tela de Haku/Gaara/Zabuza · Vamos aprimorar 'gráficamente' o Codex precisa me enviar como ficará o efeito em tela, antes de aprovarmos" → anotado para o Codex em docs/01 e docs/13, com a regra de mandar a prévia antes da aprovação.
- **Pergunta do usuário:** "O buff de treinamento com Jiraya, ao passar de nivel sem nada para upar, esta aumentando velocidade de movimento?" → não especificamente: o treino sorteia 1 de 19 atributos (+0,6% cada), e Movimento é um deles (~5% de chance por nível). Nenhum código alterado.
- **Testes:** novo `tests/chefe-furia.test.mjs` (2 testes, mínimo 350), `tests/chefes.test.mjs` ajustado à regra nova e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver o Guardião parado sob Bansho/Shinra e o aviso de fúria.

## 26/11/2026 · Nagato com o kit do Pain e ultimate Kuchiyose: Pein Rikudō (Claude Code)

- **Pedido do usuário:** "pain e nagato devem compartilhar todas as mesmas habilidades de rinnegan, a diferença que nagato terá invocação: Seis Caminhos de Pain · Kuchiyose: Pein Rikudō · Entenda/pesquise como funciona essa habilidade e coloque no jogo, pegue referencias para o Codex implementar, quero que isso seja a ultimate do Nagato e fazer de maneira jogável/balanceado"
- **Kit:** o Nagato passa a ter exatamente o kit do Rinnegan do Pain (`rinneganKit` em `src/game/heroes.ts`): Kunai Tática (Nv 1), Chibaku Tensei (Nv 5), Bansho Tenin (Nv 12) e Barras de Chakra (Nv 20). Saem do Nagato Receptores de Chakra e Invocação dos Caminhos (a invocação virou a ultimate). O Pain não muda.
- **Regra de únicas:** `RINNEGAN_FAMILIES`/`sameTechniqueOwner` fazem Chibaku Tensei e Bansho Tenin contarem como únicas das duas famílias (a regra de 1–2 únicas por versão continua valendo).
- **Ultimate do Nagato: Kuchiyose: Pein Rikudō** (novo `src/game/peinRikudo.ts`). Os Seis Caminhos ficam 10 s em campo e cada um age no seu tempo: Deva (Shinra Tensei em área, 2×), Asura (mísseis de fogo no inimigo mais perto, 5×), Humano (arranca a alma: golpe único que paralisa, 2×), Animal (invocações pisoteiam o grupo e atordoam, 2×), Preta (absorve projéteis inimigos num raio de 4 m e cura 2% da vida por projétil) e Naraka (Rei do Inferno: cura 20% na chegada e corta à metade as recargas no 8º segundo).
- **Balanceamento:** poder total 7,4 espalhado em 10 s (a ultimate comum é 6 de uma vez), metade em alvo único; a ultimate não reinicia enquanto os Caminhos estão em campo.
- **Visual:** por enquanto anéis coloridos no lugar de cada ação; arte e animação dos Seis Caminhos anotadas para o Codex (docs/01).
- **Testes:** novo `tests/nagato-pain.test.mjs` (3 testes, mínimo 348), `tests/jutsus.test.mjs` e `verify-rules` ajustados à regra nova, e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** jogar com o Nagato e usar a ultimate.

## 26/11/2026 · Ichiraku: "Tente lembrar o planejado" (Claude Code)

- **Pedido do usuário:** "No Ichiraku teremos uma opção: 'Tente lembrar o planejado'. Vai dar pra selecionar, faltando habilidades para completar todas as primárias ou esquecermos, vai aparecer um pop-up que terá 50% de chance de aparecer 1 habilidade que planejamos para a missão... Sera uma escolha de 1 a 3 habilidades aleatórias, porém o peso para habilidades planejadas será 50% a mais. Uma vez por zona"
- **Nova carta no Ichiraku** (`src/game/ichirakuRecall.ts` + GameCanvas): com espaço livre de técnica (menos de 3, ou 4 com "Quarta técnica"), abre de 1 a 3 técnicas novas sorteadas sem repetir; técnica planejada no plano da missão pesa ×1,5. Escolher uma aprende a técnica com raridade e afixos sorteados pela Sorte, pela mesma regra do level-up (`learnSkillOffer`).
- **Uma vez por zona, sem custo em Ryu.** Fechar sem escolher guarda a mesma oferta até o fim da zona (reabrir não sorteia de novo). A zona usada vai no save.
- **Interface:** título "Tente lembrar o planejado", botões "Lembrar" e "Aprender"; técnicas planejadas mostram o selo "Planejado" como no level-up.
- **Interpretação:** o "50% de chance" foi aplicado como peso 50% maior para cada técnica planejada (a frase final do pedido).
- **Testes:** novo `tests/ichiraku-lembrar.test.mjs` (4 testes, mínimo 345) e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** abrir no Ichiraku depois de esquecer uma técnica.

## 26/11/2026 · Sorte na qualidade de Hagoromo, Ebisu e Iruka (Claude Code)

- **Pedido do usuário:** "A qualidade dos buffs dos altares/npcs/hagoromo também são influenciados pela sorte" · "Não sei se hoje isso esta sendo considerado"
- **Como estava:** cartas de nível, Mercador e Caça-Níquel já usavam a Sorte; o altar só no valor da bênção (+2% por ponto acima de 10, até +120%). Hagoromo, Ebisu e a lição do Iruka ignoravam a Sorte.
- **Novo `src/game/luckQuality.ts`:** `luckQuality` (0 até Sorte 10, 1 em Sorte 70, a mesma faixa do altar) e `skewedRoll` (sorteio que tende ao máximo: média 0,5 sem Sorte e 0,75 com qualidade 1).
- **Hagoromo:** a Sorte puxa a raridade do treino e das ferramentas oferecidas (o parâmetro `quality` existia e nunca era passado).
- **Ebisu e lição rápida do Iruka:** o ganho tende ao máximo da faixa; o custo do Ebisu continua 10% acima do ganho. O pergaminho lendário do Iruka já dá o valor máximo.
- **Altar:** sem mudança; a raridade de cada altar continua fixa no mapa.
- **Testes:** novo `tests/sorte-qualidade.test.mjs` (4 testes, mínimo 341) e 2 mutações novas, verificadas à mão.

## 26/11/2026 · Cinco espaços de pílula e Mercador sem alta ao roletar (Claude Code)

- **Pedidos do usuário:** "Temos 6 espaços, eu quero 5 no jogo e no hud" · "No mercador, quando não selecionarmos nenhum item, só aumentar o valor de roletar não dos itens disponíveis pra escolha, a % de aumento do preço dos itens, só aumentam considerando quantos itens eu comprei por pool. Hoje eles estão aumentando roletando mesmo sem comprar nada."
- **`PILL_SLOTS`** (`src/game/pills.ts`): 6 → 5 tipos de pílula por run. Vale para as cartas, a roleta, os drops, o HUD (espaços vazios "+") e a ficha ("x/5 tipos"). Save antigo com 6 tipos mantém as 5 de nível mais alto.
- **`merchantPrice`** (`src/game/itemTrade.ts`): sai o fator de 12% por roletada (`merchantStockReroll`). O preço dos itens sobe só 35% por item comprado (`merchantBuy`); roletar encarece apenas a própria roletada (×1,5 por uso). A inflação geral de 15% por minuto de partida continua igual à de kunai, shuriken e roleta.
- **Testes:** novo `tests/loja-e-pilulas.test.mjs` (2 testes, mínimo 337), `verify-rules` ajustado e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver 5 espaços no HUD e os preços do Mercador ao roletar.

## 26/11/2026 · Aviso ao Codex: escadaria sem sólido (Claude Code)

- **Pedido do usuário:** "Essa escadaria esta permitindo passar por dentro dela e também não esta fazendo ela estar ai... deixe aviso pro Codex sobre isso, os monstros estão passando dentro dela e se escondendo"
- Anotado em docs/01 e docs/13 para o Codex: a escadaria de pedra da Vila da Folha não bloqueia o jogador nem os monstros, que entram e se escondem dentro dela. Nenhum código alterado.
- **Bijū:** o usuário está investigando por conta própria; fica em docs/13.

## 26/11/2026 · Final Swarm enche a tela até o teto em todas as zonas (Claude Code)

- **Pedido do usuário:** "No final swarm só tava aparecendo 400 monstros, precisamos que a progressão vá até os 1600, revise" e "Isso para todas as zonas, na zona 1 a progressão funcionou direito".
- **Causa:** no começo do Final Swarm a horda nascia a teto ÷ 4 s (200/s com teto 800). Nas zonas 2 e 3 o herói chega forte e a horda recomeça fraca, então ele matava mais rápido do que a horda repunha (a run de 76 min teve média de 1.265 abates/s) e a tela ficava quase vazia até +7 min.
- **`spawnBudgetFor`** (`src/game/progression.ts`): no Final Swarm, cada quadro repõe o que falta até o teto (até 120 por quadro, `SPAWN_RULES.swarmPerFrame`). A rampa continua a mesma: 800 até +4 min, sobe até 1.600 em +7 min. Fora do swarm o ritmo é o de antes.
- **Medição (sem navegador, 15 s a 60 quadros/s):** com 2.000 abates/s, +1 min de swarm ia de 0 para 766 vivos (teto 800) e +7 min de 741 para 1.566 (teto 1.600).
- **Testes:** 1 teste novo em `tests/progressao.test.mjs` (mínimo 335) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver 1.600 na tela nas zonas 2 e 3 e conferir o FPS com a reposição.

## 26/11/2026 · Lamens com teto em toda parcela e ficha final abreviada (Claude Code)

- **Pedido do usuário** (run de 76 min no Kage, Nv 5.897, deu 56.031 Lamens; 23.584 só do nível): "no máximo uma RUN bem sucedida nesse porte deveria dar em torno de 2.9k lamens a 3.1k e uns quebradinhos" e "abreviar os números em K, M, T, Q".
- **`LAMEN_RULES`** (`src/game/rewards.ts`): nível passa a valer 2 por nível com teto de 100 níveis (máx. 200; era 4 por nível sem teto); selados contam até 4 (máx. 80). Subtotal máximo 1.240.
- **`bijuuLamens`** (`src/game/bijuu.ts`): 180 → 60 por dificuldade, com no máximo 3 planos contados (`BIJUU_LAMENS`); antes os 9 planos das 3 zonas davam ×3,97.
- **Resultado:** a mesma run agora dá 3.038 Lamens (2.884 sem planos). Vitória completa: Genin 1.300, Chūnin 1.779, Jōnin 2.335 e Kage 2.884 a 3.038.
- **Ficha final** (`src/ui/RunSummary.tsx`): dano total, DPS, dano dos aliados, Ryu, abates, nível, dano por técnica, golpe final, ranking local e atributos usam K, M, B, T, Q (`damageLabel`) a partir de mil. Os Lamens continuam exatos.
- **Testes:** novo `tests/lamens.test.mjs` (4 testes, mínimo 334) e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver a ficha final abreviada.

## 26/11/2026 · Susano'o no pool de quem o usa na obra (Claude Code)

- **Pedido do usuário:** "Todos os personagens que deveriam ter Susano'o, tem a habilidade para pegar no pool?" → "sim"
- **`techniquePool`** (`src/game/heroes.ts`): Itachi ANBU, Shisui e Sasuke Shippuden passam a ter o Susano'o no próprio pool (Nv 12, como técnica do kit), sem precisar selar outro usuário. As outras 6 versões já o tinham. Sasuke Genin continua sem.
- **Testes:** 1 teste novo em `tests/jutsus.test.mjs` (mínimo 330) e 1 mutação nova, verificada à mão.

## 25/11/2026 · Inimigos contornam construções e não nascem dentro delas (Claude Code)

- **Pedido do usuário:** "Revisar alguns elites ficarem bugados no cenário 3D." → "Presos em construções"
- **Causa:** inimigos andam em linha reta até o jogador e a construção só os empurra para fora; com a construção no meio, travavam encostados na parede (o elite, maior, chama mais atenção).
- **`slideAlong`** (`src/scene/collision.ts`): quando a construção empurra o inimigo, ele desliza ao longo da parede para o lado que o aproxima do jogador.
- **Nascimento:** o ponto de nascimento passa por `solids.freeSpot`, fora das construções.
- **Testes:** 1 teste novo em `tests/colisao.test.mjs` (mínimo 329) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver elites contornando casas na vila.

## 25/11/2026 · Arquivo de status de personagens e monstros (Claude Code)

- **Pedido do usuário:** "Crie um .md referente ao status de todos os personagens e monstros para termos um track das alterações e suas respectivas datas/builds."
- **Novo `scripts/gen-status-doc.mjs`** gera [docs/28-STATUS-PERSONAGENS-E-MONSTROS.md](docs/28-STATUS-PERSONAGENS-E-MONSTROS.md) direto do código: regras gerais, tipos de monstro, vida/defesa/golpe de comum, elite, Mega Elite e Guardião por dificuldade e tempo, e a ficha das 115 versões (vida, dano, armadura, velocidade, crítico, regeneração, passiva, técnicas e Ultimate), com a data e o build.
- **Novo [docs/28-HISTORICO-STATUS.md](docs/28-HISTORICO-STATUS.md):** uma linha por mudança de status com data e build; já traz as mudanças de 25/11.

## 25/11/2026 · Preço em cima dos itens do chão e da roleta (Claude Code)

- **Pedido do usuário:** "Colocar o valor de custo das kunais/shurikens/pergaminhos/valor atual da roleta em cima do item no chão, pro jogador visualizar ao chegar perto"
- **Novo `src/game/priceTags.ts`** + `updatePriceTag` no GameCanvas: a até 5 m, o item pago mais perto (kunai, shuriken = pergaminho pago em Ryu) mostra o preço atual em Ryu acima dele; o pergaminho de recompensa mostra "Grátis"; o Caça-Níquel da Tsunade mostra o valor atual da rodada. Usa o texto flutuante que já existe, sem arte nova.
- **Testes:** 1 teste novo em `tests/interface.test.mjs` (mínimo 328). **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · HUD com todos os itens (Claude Code)

- **Pedido do usuário:** "Ajustar o hud para aparecer todos os itens que temos, não minimizar e aparecer +60 por exemplo"
- **`src/ui/InventoryCorner.tsx`:** a grade de itens mostra sempre todos os itens, sem recolher em 3 linhas com rolagem e sem o botão com o total; com mais de 24 e de 48 itens os ícones ficam menores para caber (`hud-dock.css`).
- **Testes:** 1 teste novo em `tests/interface.test.mjs` (mínimo 327). **PENDENTE DE VALIDAÇÃO E2E:** ver a grade com muitos itens na tela.

## 25/11/2026 · Degraus do Final Swarm a cada 5 min (Claude Code)

- **Pedido do usuário:** "A cada 5min no final swarm ter um buff consideravel nos inimigos dano/armadura/vida"
- **`SWARM_STEP`/`swarmStep`** (`src/game/progression.ts`): a cada 5 min de Final Swarm os inimigos ganham +50% de vida e +30% de dano (multiplicativo, por cima da escala que já existia) e +2 pontos de defesa, que passa do teto de 85% até 95%. Aviso na tela a cada degrau. Chefes que usam a ameaça da zona sobem junto.
- Exemplo no Genin: vida ×584 aos +4:59 → ×882 aos +5:00; defesa 85% → 87%.
- **Testes:** 1 teste novo (mínimo 326), `verify-rules` atualizado (Guardião do Genin aos +18 min ≈ 76,7 bilhões, antes 22,7) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Elites suaves no começo e regeneração base 1,0 (Claude Code)

- **Pedidos do usuário:** "Diminuir um pouco a quantidade de elites que spawnam no começo do jogo, pelo menos 1m30 mais suavizado o spawn deles."; "Ajustar regeneração por segundo para todos os personagens, iniciar com 1,0 Alguns estão começando com menos de 1.0"
- **Elites (`ELITE_OPENING`, `eliteOpening` em `src/game/enemyTiers.ts`):** a chance de elite amarelo começa em 25% do valor (2% em vez de 8%) e sobe em curva suave até o valor cheio aos 1m30 de partida. Jogo e simulador usam a mesma regra.
- **Regeneração (`BASE_REGEN` em `src/game/progression.ts`):** todo shinobi começa com 1,0 HP/s; a regeneração própria (passivas de cura) soma por cima. Antes 108 de 115 começavam com 0.
- **Testes:** 2 testes novos (mínimo 325) e 2 mutações novas, verificadas à mão.

## 25/11/2026 · Ficha final mostra o golpe que te derrubou (Claude Code)

- **Pedido do usuário:** "Quanto de dano os personagens estavam dando com 8m de jogo? Colocar na ficha final o dano que você tomou que te matou e quem te matou."
- **GameCanvas:** cada golpe recebido guarda quem deu e quanto tirou (comum, elite, Mega Elite, Akatsuki, Shinobi para selar, Guardião, Bijū, kunai ou fūma de monstro, com o nome da técnica quando é um chefe ou Mega Elite). Na derrota, o último golpe vai para o snapshot (`killedBy`).
- **RunSummary:** "Golpe final: <quem> · <dano> (x% da sua vida máxima)".
- **Testes:** 1 teste novo em `tests/interface.test.mjs` (mínimo 323), 3 testes antigos ajustados às novas chamadas e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**
- **Medições respondidas no chat (simulador):** golpe da 1ª técnica aos 8 min (mediana 15,6 mil no Genin a 21 mil no Kage) e tabela de vida/defesa/golpe dos inimigos por dificuldade ("Me mostre a dificuldade dos níveis de jogo HP/Armadura/Dano dos inimigos").

## 25/11/2026 · Plano do Shikamaru só antes de invocar o Guardião (Claude Code)

- **Pedido do usuário:** "Não pode buffar o guardião no Shikamaru, se já invocamos ele Guardião."
- **GameCanvas (`useShikamaruPlan`):** com o Guardião da zona já invocado, o plano é recusado com aviso; saiu o reforço do Guardião vivo.
- **Testes:** teste antigo atualizado para a regra nova e 1 mutação nova, verificada à mão.

## 25/11/2026 · FPS livre por padrão (Claude Code)

- **Pedido do usuário:** "Porque o FPS ta cravando no hz do monitor? Deixa livre ou sem essa configuração, temos opções de FPS nas configurações deixe o jogador escolher se for o caso."
- **Causa:** o V-Sync vinha ligado por padrão e prende o FPS na taxa do monitor.
- **`src/game/settings.ts`:** V-Sync desligado por padrão (FPS livre; limite "Sem limite"); migração v3 → v4 desliga o V-Sync de quem estava no padrão antigo. O jogador escolhe V-Sync e limite de FPS em Configurações → Gráficos.
- No navegador o FPS livre é o melhor esforço (o navegador ainda pode segurar); usa mais CPU e esquenta mais que o V-Sync.
- **Testes:** 1 teste novo em `tests/configuracoes.test.mjs` (mínimo 322) e 1 mutação nova, verificada à mão.

## 25/11/2026 · Horda com 30% menos dano e teto de 40% da vida por golpe (Claude Code)

- **Pedidos do usuário:** "Me mostre os números de dano do ataque básico dos monstros normais, acho que os danos estão muito fortes no início do jogo, as vezes tomamos hitkill aos 5minutos de jogo sem saber ao certo o que houve."; "Seria o teto por golpe, como nosso jogo tem muito mais monstros do que nosso jogo referência, temos que nerfar o dano dos monstros, menos dos megas/bosses/bijuus... Nerf 30% do dano de todos"
- **`PLAYER_HIT_RULES` + `playerHitDamage`** (`src/game/enemyTiers.ts`), usados no `damagePlayer` do GameCanvas e no simulador: comuns e elites (inclusive projéteis) −30%; nenhum golpe de comum, elite ou Mega Elite (inclusive a Ultimate) tira mais de 40% da vida máxima; Guardião e Bijū ficam como estavam. `bossCombat` passa o chefe que conjura para o jogo saber a origem do golpe.
- **Efeito aos 5 min:** Ultimate do Mega Elite de 113% → 40% da vida no Genin e de 234% → 40% no Kage; comum de 24% → 17% (Genin) e 50% → 35% (Kage). Tabela em docs/20.
- **Testes:** 1 teste novo em `tests/balanceamento.test.mjs` (mínimo 321) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Nagato com as técnicas do Rinnegan (Claude Code)

- **Pedido do usuário:** "Porque o Nagato não tem as habilidades do Pain? Ja que ele é o dono do Rinnegan?" → "Corrija isso"
- **Kit do Nagato (Edo Tensei):** Receptores de Chakra (Nv 1) · **Bansho Tenin** (Nv 5) · **Chibaku Tensei** (Nv 12) · Invocação dos Caminhos (Nv 20); saíram Shuriken e Kunai Tática. Ultimate igual. O Pain não muda.
- `rinneganTechnique` em `heroes.ts` define as duas técnicas uma vez para Pain e Nagato.
- **Regra de únicas:** `uniqueTechniques` conta como única só a técnica cujo dono é a família da versão (a 1ª que a tem no kit). Bansho e Chibaku seguem únicas do Pain; o Nagato as usa sem quebrar a regra de 1–2 únicas e sem abrir essas técnicas para o resto do elenco.
- **Testes:** 1 teste novo em `tests/jutsus.test.mjs` (mínimo 320); `verify-rules` passa.

## 25/11/2026 · Zetsu visto entra no mapa (Claude Code)

- **Pedido do usuário:** "Confirmar se ao ver o Zetsu o ícone está aparecendo no M/TAB."
- **Erro:** a distância para marcar o Zetsu como visto usava o z do jogador sem subtrair o do Zetsu; ele quase nunca era marcado e o ícone não aparecia no M/Tab.
- **Correção:** `zetsuSeen` em `src/game/akatsukiAmbush.ts` (7 m até ele), usado no GameCanvas. O ícone da nuvem da Akatsuki já existia no mapa.
- **Testes:** 1 teste novo em `tests/akatsuki.test.mjs` (mínimo 319) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** chegar perto do Zetsu e abrir M e Tab.

## 25/11/2026 · Bijū incontrolável, atordoamento de fase e fúria (Claude Code)

- **Pedidos do usuário:** "as habilidades que empurram, não pode empurrar a bijuu pra área morta, na realidade, as bijuus tem resistência aos status/atordoamentos/congelamentos, elas tomam o dano, tomam o status, mas tem status incontrolável, faça elas terem fases e ao você atingir a fase, ela toma um stunzinho que você pode bater nela sem ela devolver dano, mas ela entra em furia e recebe mais dano e mais armadura"; "Anotação para o Codex: Revisar a cabaça do Gaara, ele andando pra frente, ela fica estranha, não fica o padrão."
- **Incontrolável:** a Bijū não é empurrada (status Empurrar) nem desacelerada (lentidão e Resfriado no movimento); controles já não a paravam. Toma dano e status normalmente. Aviso ao chegar.
- **Fases e fúria** (`BIJUU_FURY`, `bijuuFury`, `furyDamage`, `furyDefense` em `src/game/bijuu.ts`): ao chegar a 2/3 e 1/3 da vida, 3 s atordoada sem andar nem atacar (`bossCombat.interrupt` cancela a técnica em preparo); depois +25% de dano por fase e +30% de armadura sobre o dano que passa. Partida retomada aplica a fúria da fase atual sem atordoar.
- **Codex:** anotada a revisão da cabaça do Gaara andando para a frente (docs/01).
- **Testes:** 1 teste novo em `tests/chefes.test.mjs` (mínimo 318) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Inimigos e Bijū não saem da área do jogador (Claude Code)

- **Pedido do usuário:** "As Bijuus estão indo para uma área morta do mata, onde nosso personagem não consegue ir para mata-la"
- **Causa:** o jogador fica preso no limite do mapa (`WORLD_LIMIT`), mas os inimigos não; golpes que empurram ou puxam levavam a Bijū para fora.
- **`keepInPlayArea`** (`src/game/worldScale.ts`): o laço dos inimigos no GameCanvas traz de volta para dentro do limite quem saiu.
- **Testes:** 1 teste novo em `tests/chefes.test.mjs` (mínimo 317) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Jogador grudado na cerca não fica mais imortal (Claude Code)

- **Pedido do usuário:** "Verificar o personagem grudado na cerca, não tomar dano e ficar imortal."
- A cerca do limite do mapa é só visual; pelo código não apareceu uma barreira única. Sem navegador não deu para reproduzir.
- **Correção geral (`stuckReach` em `src/game/enemyTiers.ts`, usada no GameCanvas):** um inimigo corpo a corpo a menos de 3 m que passa 1 s sem chegar mais perto (preso em cerca, parede ou terreno) ataca de onde está; o alcance vira a distância + 0,2 m. Quem continua se aproximando não ganha alcance extra.
- **Testes:** 1 teste novo em `tests/balanceamento.test.mjs` (mínimo 316) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** encostar na cerca (e em paredes) e ver os inimigos acertarem.

## 25/11/2026 · Planos do Shikamaru só no chefe da zona (Claude Code)

- **Pedido do usuário:** "O Shikamaru ta aumentando a dificuldade do jogo todo? Ele deveria aumentar a dificuldade apenas do boss final da zona"
- **Antes:** cada plano somava +33% na ameaça da zona inteira (monstros comuns, elites, Mega Elites e Guardião) e reescalava a vida de todos os inimigos vivos.
- **Agora (`GameCanvas`):** `threatNow` (horda, elites e Mega Elites) sai sem os planos; `bossThreatNow` leva os planos só para o Guardião (vida, dano e defesa) e a Bijū da zona 3 continua com `bijuuPlans`. Usar um plano com o Guardião vivo reescala só ele. As kunais extras da recompensa continuam.
- **Textos:** aviso do plano ("Guardião da zona 33% mais forte") e guia.
- **Simulador:** a horda sem os planos; a vida do Guardião com eles.
- **Testes:** 3 testes antigos atualizados para a regra nova e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Selos: sai o texto acima da cabeça (Claude Code)

- **Pedido do usuário:** "Os selos em cima do personagem é errado, eu queria a animaçao dos selos, não eles aparecendo em cima da cabeça."
- **GameCanvas:** saiu `showHandSeals` (o texto "寅 Tigre" subindo acima de quem lança). O corpo continua com a pose de selo que já existia (Naruto e Zabuza).
- **`src/game/handSeals.ts` fica como lógica para a animação dos selos**, que é do Codex: `sealSequence`, `SEAL_RULES.step` e `sealDue`. Plano em docs/01.
- **Testes:** o teste dos selos agora confere que não há texto de selo no jogo.

## 25/11/2026 · Tab gira a câmera e NPCs olham para o jogador (Claude Code)

- **Pedidos do usuário:** "Quando apertamos tab deve ser possível girar a tela"; "Com o TAB deve ser possível selecionar um npc para marcar a rota, também deve ser possivel continuar girando a câmera."; "Os npcs tem que olhar pro jogador, ficar sempre olhando pra ele... mesmo se girarmos a câmera."
- **Tab (mapa rápido):** o mouse continua girando a câmera. Segurar o botão direito mostra a kunai do cursor para clicar num NPC ou ponto do mapa e marcar a rota; soltar o direito volta a girar, e soltar o Tab some com a kunai. O mapa rápido mostra a dica.
- **NPCs:** `update(…, lookAt)` em `src/scene/missionNpcs.ts` aponta a frente do NPC para o jogador; a câmera só escolhe a vista (frente, perfil ou costas). Vale para os NPCs dos eventos e o Teuchi.
- **Testes:** 1 teste novo em `tests/vilas.test.mjs`, 1 em `tests/interface.test.mjs` (mínimo 315), o teste antigo do cursor atualizado para a regra nova do Tab e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Selos do Madara mostravam só Dragão (Claude Code)

- **Pergunta do usuário:** "porque no ataque do madara ta aparecendo umas coisas, tipo dragão em cima do ataque dele?" — é o texto dos selos de mão ("辰 Dragão"). O sorteio fixo dos selos (técnicas sem sequência da obra) repetia quase sempre Dragão, Macaco e Rato; a Susanoo Perfeito tinha 3 Dragões seguidos.
- **`src/game/handSeals.ts`:** o sorteio usa os bits altos de um xorshift e não repete o mesmo selo seguido. Agora os 12 selos aparecem distribuídos (nenhum acima de 15%).
- **Testes:** 1 teste novo em `tests/selos.test.mjs` (mínimo 313) e 1 mutação nova, verificada à mão.

## 25/11/2026 · Prêmios da Prova Chūnin (Claude Code)

- **Escolha do usuário: "Lamens", "Título Chūnin", "Moldura de perfil" e "Lamens por fase".**
- **`src/game/events.ts`:** `prizes` no evento (Floresta 300 · Preliminares 600 · Final 600 · completa 2.000 Lamens · título "Chūnin" · moldura `jade`), `eventPhases`, `eventPrizes`, `earnedTitle` e `frameLock`.
- **Conta:** `claimEventPrize` guarda os prêmios já creditados (`sb_event_prizes_v1`), para cada um valer uma vez.
- **Tela:** `main.tsx` credita os Lamens ao fechar fase ou prova; título ao lado do nome no topo e na linha do jogador no ranking local; moldura Jade travada no seletor até completar a prova (quem já usa continua com ela); a aba Eventos mostra os prêmios e o que já foi recebido.
- **Testes:** 2 testes novos em `tests/eventos.test.mjs` (mínimo 312) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Simulador com o pool real da partida (Claude Code)

- **Pedido do usuário:** "Sim, os 6".
- **`scripts/simulate-run.mjs`:** as cartas de técnica saem de `skillPool(heroId)` (kit + básicas), como no jogo; antes só o kit de 4.
- **Resultado:** os 6 personagens ficam perto da mediana (0,81 a 1,02); nenhum ajuste de personagem foi necessário. O raio da Área 1,8 foi conferido de novo com o pool real e continua equilibrando (p10–p90 0,83–1,90 → 0,89–1,72).
- **Testes:** conferência no teste do simulador e 1 mutação verificada à mão.

## 25/11/2026 · Raio da Área 1,2 → 1,8 (Claude Code)

- **Decisão do usuário:** "Sim, aplicar". Pergunta: "o que seria esse raio da área?" — o círculo em volta do alvo que as 56 técnicas de Área (Rasengan, Bola de Fogo, Caixão de Areia…) acertam; passa de 0,84 m para 1,26 m de raio, sem mudar o dano.
- **`SHAPE_RADIUS`** em `src/game/combat.ts` (Área 1,8 · Órbita 1,7), usado no acerto do GameCanvas, no golpe do Kuroari e no simulador. A marca no chão acompanha.
- **Efeito medido:** no Jonin, capacidade aos 3 min sem ninguém abaixo de 1,09 (antes 0,49); mediana e p90 iguais. Partida inteira: abaixo de 0,5× da mediana cai de 11 para 6; mediana quase igual.
- **Testes:** valor conferido em `tests/balanceamento.test.mjs` e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Revisão do scale e do começo de partida (Claude Code)

- **Pedidos do usuário:** "Reveja o scale de todos os personagens e veja o early game de todos os persoagens"; "Morrer se o player jogar mal, deve morrer, mesmo na dificuldade mais fácil..."; "Não é pros personagens ficarem brokens, é para ficar balanceados."
- **Simulador (`scripts/simulate-run.mjs`):** geometria dos golpes igual à do jogo (alcance em `ATTACK_SCALE`, corpo a corpo pelo raio do impacto) e bônus das técnicas de preparo pela fração ativa. `CONE_COS` foi para `combat.ts`.
- **Novo `scripts/simulate-early.mjs`:** primeiros 5 min de todas as versões, com capacidade de limpar a horda.
- **Resultado:** o dano escala bem. O que separa os personagens é o formato dos ataques (Área limpa ~1,2 inimigo/s, Em V ~6,3). Proposta medida: raio da Área 1,2 → 1,8. Nada mudou no jogo; tabela em docs/20.
- **Testes:** 1 teste novo em `tests/balanceamento.test.mjs` (mínimo 310) e 1 mutação nova, verificada à mão.

## 25/11/2026 · Aba Eventos: Prova Chūnin (Claude Code)

- **Pedidos do usuário:** "A parte da aba de eventos e tudo mais, você pode fazer, se ficar ruim a gente mexe com o Codex... Faz o que tu quer fazer, pode seguir com o plano."; "A principio a primeira season só vai ter personagens da academia e genins, então se baseie nisso para a gente ir liberando personagens, os chunnins e tudo mais..."
- **Novo `src/game/events.ts`:** a Prova Chūnin com 15 duelos da obra em três fases (Floresta da Morte, Preliminares e Final) e o elenco da temporada 1 (Academia e Genin). Joga-se com um lado; o outro aparece depois do minuto e dos abates e, selado, fica liberado na conta. Partindo dos iniciais, a corrente libera os 16 genin do evento.
- **Conta:** `eventDuelsDone` e `completeEventDuel` guardam quem venceu cada duelo.
- **GameCanvas:** prop `eventDuel`; o oponente nasce como "Shinobi para selar" e selar marca o duelo. A run de evento desliga as missões de desbloqueio comuns e salva o duelo.
- **Interface:** nova `src/ui/EventsPage.tsx` (aba Eventos, com progresso, fases e cartões de duelo), botão "Eventos" no menu e na escolha de mapa; "Tentar de novo" repete o duelo. Sem arte nova.
- **Testes:** `tests/eventos.test.mjs` com 5 testes (mínimo 309) e 3 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Selos de mão (Claude Code)

- **Pedidos do usuário:** "Sim, selos"; "lembrando que você não fará mais questões de gráficos/animações, coisa do tipo, tente implementar o que já tem feito".
- **Novo `src/game/handSeals.ts`:** os 12 selos (Rato 子 … Javali 亥), as sequências da obra (Grande Bola de Fogo, Fênix de Fogo, Chidori/Raikiri, Invocação, Parede de Terra, início do Dragão de Água), o selo em cruz do Kage Bunshin e 2 a 4 selos fixos pelo nome nas outras técnicas de Ninjutsu e Genjutsu. Taijutsu não tem selo; a Ultimate sempre tem.
- **GameCanvas (`showHandSeals`):** ao lançar, a sequência sobe acima do jogador, aliado ou companheiro com o texto flutuante que já existe, um selo a cada 0,1 s, no máximo uma vez a cada 2,5 s por personagem. Some com "Ocultar meus ataques". Nenhuma arte nova; a pose de selo continua a que já existia (Naruto e Zabuza).
- **Testes:** `tests/selos.test.mjs` com 4 testes (mínimo 304) e 3 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Cartão novo de fusão e ficha ao passar o mouse (Claude Code)

- **Pedido do usuário:** "Sim, fazer o cartão" (docs/10, itens 4 e 5).
- **Novo `src/game/fusionCard.ts`:** `fusionParts` (como funciona, por forma e por efeito), `fusionUpgrades` (o que Área, Projéteis, Recarga, Duração, Chance de status e Ricochete mudam e o que não ajuda) e `fusionSheet` (tipo, condição, dano base, recarga, status e níveis).
- **Planejador (`BuildPlanner.tsx`):** o cartão de fusão mostra tipo, nome, ingredientes, natureza/escola/forma, descrição, "Como funciona", "Quais melhorias afetam" e a ficha. A Combinação ganhou um cartão próprio e mais curto. A lista do catálogo segue o mesmo estilo.
- **Ficha ao passar o mouse** no catálogo e nos espaços de fusão do plano, com o dano final do shinobi no Nv. 1 sem itens.
- **Testes:** `tests/fusao-cartao.test.mjs` com 4 testes (mínimo 300) e 3 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver o cartão e a ficha na tela.

## 25/11/2026 · Fusões só por receita, com atributos somados (Claude Code)

- **Decisões do usuário:** "Aprovar e incluir Gelo"; "Incluir as duas" (Taijutsu e Genjutsu).
- **`FUSION_RECIPES`** (`src/game/techniqueMerge.ts`): 7 de assinatura, 8 Kekkei Genkai, 7 de natureza (com Hyōton: Sensatsu Suishō para dois Ninjutsu de Gelo) e 2 de escola (Kage Buyō, Magen: Narakumi). A de assinatura vence as outras.
- **Par sem receita só combina.** Partidas salvas com a fusão genérica antiga continuam com ela (`legacyFusion`).
- **A fusão soma os atributos das duas técnicas:** dano A + B com o bônus, chance do mesmo status somada à da receita (teto 95%), outro status como secundário, queimadura, veneno, lentidão e gravidade.
- **Interface:** o cartão do planejador mostra o tipo da fusão em vez de raridade; a Oficina e o guia explicam a regra; par sem receita mostra "pode ser Combinado".
- **Cobertura:** com a conta completa, as 115 versões têm fusão e toda receita tem quem aprenda.
- **Testes:** 6 testes novos em `tests/fusoes.test.mjs` (mínimo 296) e 3 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Pacote de status calibrado (Claude Code)

- **Decisão do usuário:** "Sim, aplicar" (proposta medida em `scripts/simulate-status.mjs`).
- **Esfera Katon sem cadeia:** a queimadura que nasce da explosão fica marcada (`burstBurn`) e não explode de novo. Queimadura de técnica, de item ou do Amaterasu volta a poder explodir.
- **Congelar com 2 acúmulos de Resfriado** em vez de 3 (`STATUS_RULES.chill.stacksToFreeze`).
- **Chances de item ×2:** Fio de Aço Ninja 8%, Incenso do Sono 5%, Pergaminho Hyoton 12%, Anel do Veneno 12%. Textos dos itens atualizados.
- **Efeito medido** (Chūnin, 36 builds dos 8:00, horda com 3 golpes por inimigo; abates · golpes recebidos): Esfera Katon +18% · −32% → +6% · −8%; Espelho de Haku +16% · −47% → +18% · −54%; Quebra-Gelo +4% · −12% → +13% · −39%; Hyoton ×5 + Quebra-Gelo +21% · −60% → +24% · −75%.
- **Simulador:** `simulate-status.mjs` usa a regra do jogo direto (saiu a opção `chain` e as variantes da proposta).
- **Testes:** 1 teste novo em `tests/status.test.mjs` (mínimo 290), teste do Resfriado ajustado para 2 acúmulos e `verify-rules` com o Fio ×2 = 16%. 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E.**

## 25/11/2026 · Elemento Gelo e bônus de elemento em todos os danos (Claude Code)

- **Pedidos do usuário:** "todas as linhas de dano na realidade"; "sim, é legal os efeitos dos elementos que temos também fazer parte do calculo"; "o elemento gelo, você colocou como resfriar, pesquise, deveria ser gelo".
- **`src/game/combat.ts`:**
  - `elementMultiplier` dá o bônus de um elemento.
  - Os ajudantes passam a somar o bônus de elemento da técnica deles.
  - `ELEMENT_KEY.Gelo = 'elGelo'`.
- **GameCanvas:** queimadura e explosão da Katon usam +% de Fogo; os estilhaços do Espelho de Haku usam +% de Gelo.
- **Gelo (Hyōton) como elemento:**
  - Tipo `Element`, cor, ícone 氷, célula de visual e área.
  - Técnicas do Haku passam a Gelo com Congelar.
  - A fusão Água + Vento passa a Gelo (`KekkeiRecipe.element`).
  - Pergaminho Hyoton ganha +28% de Gelo.
  - O visual usa o de Água por enquanto.
- **Simulador de status:** as mesmas regras.
- **Testes:** 2 testes novos em `tests/elementos.test.mjs` (o mínimo subiu para 289) e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** jogar com o Haku (visual das técnicas de Gelo, ícone e cor) e ver a queimadura subir com o Pergaminho Katon.

## 25/11/2026 · Espinhos escalam com armadura × dano e simulador de status (Claude Code)

- **Pedido do usuário:** "o dano% deve ser responsável por aumentar todos os danos do personagem"; "o espinhos seria com armadura"; "e sim dano% do dano do espinhos"; decisão "Armadura × dano do personagem".
- **`src/game/combat.ts`:** `thornsDamage(thorns, armadura, dano)`. O contragolpe dos Espinhos deixa de ser fixo (25 e 40) e passa a armadura × dano do personagem, que inclui nível e dano%.
- **`src/game/catalog.ts`:** Armadura de Espinhos 100% por cópia, Armadura Samurai 150%, com textos novos.
- **GameCanvas:** o contragolpe usa a fórmula, também com o ajuste de dano da dificuldade.
- **Novo `scripts/simulate-status.mjs`:** mede o pacote de status com inimigos individuais e as regras do jogo. O modo `proposta` mede variantes de regra (`STATUS_VARIANTS`, `withVariant`) sem mudar o jogo. Proposta de ajuste e tabela em [docs/20](docs/20-SCALING-EREGULAS.md), aguardando decisão.
- **Testes:** 1 teste novo em `tests/espinhos.test.mjs` (o mínimo subiu para 287) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** apanhar com a Armadura de Espinhos em níveis diferentes e ver o número do contragolpe.

## 25/11/2026 · Guardiões e Bijū escalam com o poder atual do jogador (Claude Code)

- **Pedido do usuário:** "Precisamos do scale dos portais e das bijus escalem bastante e considerem o nivel atual no nosso personagem na partida para não nascer com a vida baixa demais e morrer com 1 ataque apenas".
- **Novo `src/game/bossScaling.ts`:**
  - `singleTargetDps` mede o dano de alvo único da build no momento da invocação: nível, itens, pílulas, afixos, crítico, recarga e a defesa do chefe.
  - `bossHpWithFloor` garante ao Guardião pelo menos **30 s** desse dano e à Bijū **60 s**, com +33% por plano do Shikamaru (`BOSS_POWER`).
  - A fórmula da zona continua valendo quando for maior.
- **GameCanvas:** `guardianHpNow`, também mostrado no aviso de invocação, e a vida da Bijū usam o piso.
- **Simulador:** `simulate-run.mjs` e `simulate-bosses.mjs` usam a mesma estimativa (`expectedHit`) e o mesmo piso.
- **Resultado no simulador:**
  - Guardiões passam de 1 a 13 s para 25 a 56 s.
  - A Bijū dura no mínimo 1 min, ou 2 min com 3 planos, em vez de segundos.
  - No Kage com 3 planos, menos personagens vencem a zona 1 (67 → 46), porque ficam mais tempo na horda.
  - Tabela em [docs/20](docs/20-SCALING-EREGULAS.md#piso-de-vida-dos-chefes-pelo-poder-do-jogador--25112026-claude-code).
- **Testes:** 3 testes novos em `tests/chefes-piso.test.mjs` (o mínimo subiu para 286) e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** invocar o Guardião e a Bijū com uma build forte e ver a vida e a duração da luta.

## 25/11/2026 · Curva de dano: afixos pela metade e Final Swarm ×2 (Claude Code)

- **Decisão do usuário:** "Sim, aplicar", sobre a proposta medida em `scripts/simulate-damage.mjs`.
- **`src/game/combat.ts`:** os afixos de dano das técnicas (`GROWTH_ROLLS.damage`) caíram pela metade. Comum agora dá +23% a +34% por nível da técnica (antes +45% a +67%), e Lendário +188% a +243% (antes +375% a +485%).
- **`src/game/progression.ts`:** o Final Swarm entra com **×2** em vez de ×3 (HP, dano, defesa e quantidade), e continua crescendo com o tempo. A defesa entra em 60% e chega a 85% no 1º minuto. O aviso de Final Swarm mostra o valor novo.
- **Resultado no simulador** (mediana do golpe ÷ vida de um comum, e vivos em 115):
  - Kage: 20× → 12× aos 10 min, com 47 vivos no minuto 11 (antes 53).
  - Genin: 126× → 70× aos 10 min.
  - Chunin: os vivos no Final Swarm não mudaram (82).
- **Efeito nos chefes:** o Guardião tardio do Genin aos +18 min cai de ~34 para ~23 bilhões de HP, porque o Final Swarm pesa menos.
- **Testes:**
  - 1 teste novo em `tests/dano-curva.test.mjs` (o mínimo subiu para 283) e 2 mutações novas, verificadas à mão.
  - Em `verify-rules`, as conferências do Final Swarm (×2, defesa de 60% → 85%), do HP tardio do Guardião e do afixo mínimo passaram para a regra nova.
  - Dois testes de chefes trocaram o personagem do caso: no simulador os planos valem desde o segundo 0, e o Naruto Academia com 3 planos não chega mais ao Guardião.
  - **PENDENTE DE VALIDAÇÃO E2E:** sentir a curva em partida.

## 25/11/2026 · Medição do dano de nível alto contra o Final Swarm (Claude Code)

- **Pedido:** item da fila de balanceamento: revisar a relação entre dano de nível alto, excesso de proteção e pressão do Final Swarm, isolando cada variável.
- **Novo `scripts/simulate-damage.mjs`:** separa o golpe em nível, itens, pílulas, treino e afixos, mede a proteção do jogador e testa opções de curva em memória (`CURVE_OPTIONS`, `withCurve`).
- **`src/game/progression.ts`:** `HERO_DAMAGE_CURVE` expõe os parâmetros de `heroDamageScale`, com os mesmos valores. A sonda do `simulate-run.mjs` passou a trazer a build completa.
- **Resultado:** o nível e os afixos de dano das técnicas fazem o golpe chegar a 20× (Kage) e 126× (Genin) a vida de um comum aos 10 min. Só baixar o dano mata o jogador no Final Swarm. **Proposta: afixos de dano pela metade + Final Swarm entrando com ×2.** Tabelas em [docs/20](docs/20-SCALING-EREGULAS.md#dano-de-nível-alto--final-swarm--25112026-claude-code). **Nenhum número de jogo mudou**; aguarda decisão do usuário.
- **Testes:** 2 testes novos em `tests/dano-curva.test.mjs` (o mínimo subiu para 282) e 1 mutação nova, verificada à mão.

## 25/11/2026 · Medição da missão até a arena por dificuldade e planos (Claude Code)

- **Pedido:** item da fila de balanceamento: simular Genin, Chunin, Jonin e Kage com 0 a 3 planos, registrando HP, defesa, dano, tempo até derrotar e o avanço da arena, sem perder os 4 pergaminhos grátis com 3 planos.
- **`scripts/simulate-bosses.mjs`:** cenário C (`missionProbe`, `summarizeMission`, `SUMMON_POLICIES`). Mede cada Guardião (HP, defesa, luta, minuto) e a Bijū na chegada, com invocação cedo (2:40) ou às 9:00.
- **`scripts/simulate-run.mjs`:** o Guardião solta 1 + planos pergaminhos (até 4), como no jogo; antes o simulador dava só 1 item. O resultado traz o registro `bosses` de cada luta.
- **Resultado:** os 4 pergaminhos com 3 planos estão preservados. Os Guardiões caem em segundos. A Bijū leva de 2 a 25 min para quem invoca cedo e segundos para quem espera até 9:00. Tabela em [docs/20](docs/20-SCALING-EREGULAS.md#missão-até-a-arena-por-dificuldade-e-planos--25112026-claude-code).
- **Nenhum número de jogo mudou.** O próximo passo é a curva de dano do jogador.
- **Testes:** 1 teste novo em `tests/chefes.test.mjs` (o mínimo subiu para 280) e 1 mutação nova, verificada à mão. É medição de modelo, não validação em partida.

## 25/11/2026 · Planejador: aba Pílulas sem o painel lateral (Claude Code)

- **Pedido do usuário** (print com X no painel da direita): "Remover onde está o X para melhorar a visualização das pílulas".
- **`src/ui/BuildPlanner.tsx`:** na aba Pílulas o painel lateral de detalhes não aparece mais, porque os cartões já mostram efeito, descrição e quantidade. A grade ocupa a largura toda (`.build-workspace.no-detail` em `src/mission-planner.css`). As abas Habilidades e Itens continuam com o painel.
- **Testes:** 1 teste novo em `tests/interface.test.mjs` (o mínimo subiu para 279) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** abrir a aba Pílulas no planejador da missão.

## 25/11/2026 · Armadilha do ninja caído: 10 ninjas sempre, 1 elite e 1 item (Claude Code)

- **Pedido do usuário:** "armadilha do ninja deitado no chão deveria dar 1 item por matar os ninjas que invoca, além disso não está invocando ninjas · a ideia é invocar 10 ninjas e 1 deles sendo elite".
- **Causa de não invocar:** os ninjas da armadilha eram limitados pela vaga até o teto de inimigos vivos. Com a horda cheia, a conta dava 0, ninguém aparecia e a emboscada ficava ativa para sempre, bloqueando outros corpos.
- **Correção** (`startFieldAmbush` no GameCanvas e `FALLEN_TRAP`/`trapIsElite` em `src/game/fallenTrap.ts`):
  - o corpo invoca sempre os 10 ninjas num anel de 10 m, e **1 deles é elite**;
  - vencer a emboscada solta um **pergaminho de recompensa grátis (1 item)** onde caiu o último ninja, no lugar do +1 nível;
  - os +5% de inimigos na partida continuam.
- A Shuriken Amaldiçoada continua com a emboscada limitada pelo teto. O Guia foi atualizado.
- **Testes:** 1 teste novo e 1 conferência ajustada em `tests/armadilha-ninja-caido.test.mjs` (o mínimo subiu para 278), mais 2 mutações novas verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** investigar um corpo com a horda cheia e pegar o pergaminho no fim.

## 25/11/2026 · Opção "Pegar sozinha a única carta" (Claude Code)

- **Pedido do usuário:** "Coloque uma opção nas configurações, quando não tiver mais opção de escolha no pool, tiver só 1, com a opção marcada, ele pega automático sem aparecer para selecionar."
- **Configurações → Controles:** nova opção **Pegar sozinha a única carta**, desligada por padrão e salva entre partidas (`autoPickSingle` em `src/game/settings.ts`).
- **Na partida:** ao subir de nível com uma única carta disponível, ela é escolhida sem abrir a tela, e um aviso mostra o que foi pego (`shouldAutoPick` em `openLevelReward`). Com 2 cartas ou mais, a escolha abre como sempre.
- **Testes:** 1 teste novo em `tests/configuracoes.test.mjs` (o mínimo subiu para 277) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ligar a opção e subir de nível com o pool quase vazio.

## 25/11/2026 · HUD dos ajudantes com corações, passiva, ataque e combo (Claude Code)

- **Pedido do usuário:** "Eu tinha pedido pro codex deixar minimalista a parte do hud dos ajudantes, mas o jogador tem que saber o que cada um faz e o combo faz, também mostrar como está os ataques deles, afinidade coloque coraçãozinhos".
- **`src/ui/AllyCards.tsx`:** cada cartão continua compacto e passou a mostrar:
  - a afinidade em corações (`AffinityHearts`);
  - a passiva com o valor atual e o máximo;
  - o ataque com dano, recarga e barra, na cor da técnica;
  - as etiquetas de sinergia.
- **Sinergias:** o painel começa aberto. Recolher continua salvo entre partidas.
- **`src/main.tsx`:** passa o nível e os atributos para o cartão. Estilos em `src/allies.css`.
- **Testes:** 1 teste novo em `tests/hud-ajudantes.test.mjs` (o mínimo subiu para 276) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver os cartões com a equipe cheia, em telas estreitas e na escala do HUD de 60% a 140%.

## 25/11/2026 · Animação da horda no Treinamento do Hagoromo (Claude Code)

- **Pedido do usuário:** "Os personagens na luta com Hagoromo estão todos sem animação... conserte isso".
- **Causa:** o relógio da missão (`elapsed`) para de propósito durante o treinamento, e o quadro de caminhada dos inimigos desenhados em lote era calculado a partir dele. Por isso a horda deslizava parada.
- **Correção:** novo relógio só de animação (`animClock`, em `GameCanvas.tsx`), que sempre anda. A caminhada da horda e a aura do Modo Sábio usam esse relógio. O relógio da missão continua parado no treinamento.
- **Testes:** 1 teste novo em `tests/hagoromo.test.mjs` (o mínimo subiu para 275) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver a horda e o Mega Elite andando na clareira do Hagoromo.

## 25/11/2026 · Bijū com 3× a armadura e só os planos da zona (Claude Code)

- **Decisão do usuário:** "3× e planos só da zona", depois da medição de Guardiões e Bijū.
- **`src/game/bijuu.ts`:**
  - `BIJUU_RULES.armorMultiplier` passou de 1,35 para **3** (× a armadura bruta do Guardião equivalente).
  - `bijuuPlans`: só os planos da zona 3 (até 3) pesam no HP e na defesa da Bijū. Antes contavam os da missão inteira, até 9.
  - A recompensa em lámens continua contando todos os planos.
- **Textos:** o aviso do plano só fala da Bijū na zona 3, e o Guia explica que os planos da última zona fortalecem a Bijū.
- **Resultado no simulador** (mediana na chegada, pior caso): Kage passa de 3 para 6 min sem planos e de 58 para 33 min com 3 planos por zona; Genin sem planos passa de 1 para 2 min. Tabela em [docs/20](docs/20-SCALING-EREGULAS.md#medição-de-guardiões-e-bijū--25112026-claude-code).
- **Testes:** testes de chefes atualizados e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** sentir a luta com a Bijū em partida.

## 25/11/2026 · Medição de Guardiões e Bijū no simulador (Claude Code)

- **Pedido:** fila do Claude Code em docs/13 (balanceamento): calibrar Guardiões e Bijū nos marcos +1, +7 e +15 min e além, simular de 0 a 3 planos do Shikamaru, partir de cerca de 20× a armadura do Guardião para a Bijū e manter os números finitos.
- **Novo `scripts/simulate-bosses.mjs`:** mede o Guardião da zona 1 em cada marco e a Bijū com a build de quem venceu a zona 3, com opções de armadura de 1,35× a 20×. Grava `artifacts/simulate-<rótulo>.json` (não versionado).
- **`scripts/simulate-run.mjs`:** aceita `plans` (planos do Shikamaru por zona) e uma sonda `probe` por segundo.
- **Bijū:** a vida e a defesa saíram do GameCanvas para `bijuuVitality` e `bijuuDefense` (`src/game/bijuu.ts`, `BIJUU_RULES`). `guardianArmor` expõe a armadura bruta. **Nenhum número de jogo mudou.**
- **Limite numérico:** `BOSS_HP_LIMIT` (1e300) impede a vida de virar infinito depois de cerca de 24 h de Final Swarm. Não é teto de gameplay.
- **Resultado:** 20× a armadura deixaria a Bijū do Kage sem planos com 39 min de luta (hoje são 3 min), e com 3 planos por zona com 14 h. Tabelas e leituras em [docs/20](docs/20-SCALING-EREGULAS.md#medição-de-guardiões-e-bijū--25112026-claude-code). **Multiplicador final aguardando decisão do usuário.**
- **Testes:** 3 testes novos em `tests/chefes.test.mjs` (o mínimo subiu para 274) e 2 mutações novas, verificadas à mão. Simulação de modelo, não validação em partida.

## 25/11/2026 · Drops fixos, Hagoromo e pose de selamento

- Novos drops são registrados mesmo com milhares de recompensas no chão. A busca usa células de proximidade para a coleta e células visíveis para renderizar. XP, Ryu, chakra e cura permanecem no ponto onde caíram, até serem atraídos.
- O Hagoromo recebeu um retrato original em pixel art, selo animado na clareira, contador de ondas e aviso de conclusão. Depois da última luta, é possível recolher os drops. Aperte E para sair e escolher a ferramenta. Drops restantes ficam naquela clareira para outra visita na mesma zona.
- Todos os shinobis capturáveis usam descida gradual até os joelhos e esperam o selamento nessa pose. A mão no peito fica para a revisão com as referências do usuário.
- Indicadores de chefes exibem T e Q. A fila separa a arte e a apresentação do Codex da calibração de chefes e das regressões a cargo do Claude Code e do Qwen. A defesa da Bijū de aproximadamente 20 vezes a do Guardião fica na fila de balanceamento.
- Tipos, regras, 271 testes e build passaram sem navegador. O índice preservou a posição de um drop antigo após mais de 10 mil novos registros. A conferência da pose com câmera em movimento e da clareira em partida permanece pendente.

## 25/11/2026 · Mapa rápido, recompensas e chefes

- Segurar Tab abre o mapa rápido e a kunai do cursor pode marcar rotas sem pausar a missão ou interromper WASD. Soltar Tab devolve o mouse à câmera. NPCs usados saem dos mapas da zona. Compras e serviços que admitem novas interações continuam disponíveis no cenário.
- XP, Ryu, chakra e bolinhos têm vagas próprias nos lotes de drops. No limite, pilhas compactam perto do abate e podem trazer o valor de uma pilha antiga deixada longe. O ímã tem um relógio independente do cronômetro da missão.
- O Hagoromo mostra os portais como **0/3** a **3/3**. As hordas e o chefe surgem dentro da clareira, separados dos inimigos da zona. As recompensas da clareira são creditadas ao concluir o treino.
- Guardião, chefe do Hagoromo e Bijū têm uma janela de entrada antes de receber dano. O Guardião, os portais de progressão e a Bijū têm marcadores imediatos. Os portais usam a altura da superfície navegável.
- Guardiões ganham HP, dano e armadura com a espera e o Final Swarm. A Bijū herda a pressão da terceira zona na entrada. Os planos do Shikamaru se aplicam à defesa, ao HP e ao dano dos chefes, além de renderem até quatro pergaminhos grátis no Guardião da zona.
- Tipos, regras, build e 271 testes passaram sem navegador. A simulação de 10.000 abates preservou o total de XP entre o que foi coletado normalmente e o que restou no chão. A validação em partida segue pendente para o cursor do Tab em movimento, a leitura dos chefes sob a câmera, o impacto do balanceamento e as animações em horda máxima.

## 25/11/2026 · HUD compacto dos ajudantes

- Os ajudantes de missão usam uma lista uniforme com retrato de corpo inteiro da seleção, nome com quebra de linha e nível de afinidade. A equipe tem uma barra de recarga compartilhada.
- O painel acompanha a ficha do jogador, respeita a escala do HUD e rola quando falta altura. Em telas estreitas a barra da missão e a lista ficam em linhas distintas.
- Passivas, técnica de ataque, recarga e bônus de sinergia também podem ser consultados na ficha (P). Os retratos da troca seguem a mesma moldura.
- Testes em Node conferem nomes e atlas das versões do elenco e dos ajudantes NPC, equipe cheia e detalhes da ficha. A conferência visual em partida continua pendente.

## 25/11/2026 · Feedback de dano, Genin e itens 3D

- O clarão vermelho cobre a cena por até 0,46 s quando há perda de HP. A vinheta pulsa nas bordas abaixo de 30% de vida. O som de dano ganhou um baque mais presente e um estalo com ataque mais rápido. Os controles de Gráficos e volume continuam ativos.
- Kunais, shurikens e shurikens Fūma comuns voam 15% mais devagar nas quatro dificuldades, com o mesmo alcance. O Genin ganha pressão entre os minutos 1 e 5 por dano, frequência de ataque e armadura. A abertura e os demais ranks preservam a curva anterior.
- Pergaminhos abertos e fechados, recompensa gratuita, shuriken amaldiçoada, morro de bolinhos e drops de monstros usam malhas 3D. As armas dos inimigos comuns também usam volume. Drops abundantes e armas compartilham até nove lotes.
- Medição isolada em Node com 1.600 inimigos, 260 drops e 80 armas em voo. Preparação dos itens e armas em 0,033 ms no percentil 95, com nove chamadas de desenho. FPS do jogo completo no navegador e uma rodada do instalador Windows continuam pendentes. [Medição](docs/development/CRIAR-MAPAS-JOGAVEIS.md#itens-da-missão-em-3d).

## 24/11/2026 · Foco de combate e sobrevivência na Zona 1

- Técnicas priorizam o inimigo fixado pelo botão direito dentro do alcance efetivo. Disparos em V e múltiplos têm um tiro central sob foco. Arremessos com preparo conferem a mira ao sair.
- O projétil simples para no primeiro contato ao longo da trajetória, mesmo com dois inimigos cruzados no mesmo quadro. Onda, Em V e ricochete conservam suas regras de acerto.
- Simulados 2.070 cenários de 13 minutos na Zona 1. No Kage com desvio médio e catálogo aberto, 301 de 345 chegaram aos 8 minutos, 292 aos 10 e 45 aos 13. [Medições](docs/20-SCALING-EREGULAS.md#sobrevivência-na-zona-1--24112026).
- **PENDENTE DE VALIDAÇÃO E2E.** Conferir a mira com um Mega Elite atrás de inimigos comuns, os disparos em V, o preparo e a passagem de 10 minutos na mesma zona.

## 24/11/2026 · Shikamaru e auditoria do dano

- O NPC do Plano do Shikamaru usa o Estrategista de frente, perfil e costas, inclusive na troca entre câmeras.
- A ficha usa o cálculo de dano por acerto do combate, mostra Genjutsu e exibe os dois danos de uma combinação. O simulador passa a usar afinidade, passivas e a linha de escola correta, inclusive mega crítico por expectativa.
- Corrigidos Genjutsu no dano dos ajudantes, bônus repetido do mesmo elemento e lentidão contada duas vezes para o Selo dos Cinco Elementos.
- Conferidos os bônus de 25 itens em 218 técnicas ofensivas e 115 ultimates. A curva do dano-base foi conferida até o nível 2.000. A comparação de 1.380 simulações registra por onde o dano ultrapassa o HP da horda e mantém a curva atual para decisão de balanceamento.

## 24/11/2026 · Nível máximo para fundir e combinar

- A Oficina dos Sapos Sábios só monta e aplica pares com os dois ataques no teto de nível da partida. Com o Pergaminho Proibido, o requisito sobe para o nível 11. A oficina informa o requisito quando faltam técnicas elegíveis. O planejador continua aceitando pares para a próxima missão.

## 24/11/2026 · Kakashi dos Dois Mangekyō

- Nova versão jogável com retrato chibi, corrida nas cinco vistas, selo, golpe, pulo e dash. A missão em Iwa Kage usa Kakashi Hokage, com encontro a partir de 7 minutos e 950 abates.
- Kit com Raikiri do Kamui, Shuriken, Susanoo e Kamui. A ultimate Shuriken do Kamui usa a forma azul alada, com trajetória e impacto na área do alvo. Aparece também quando a forma conjura como guardião.
- Nove versões do elenco têm acesso ao Susanoo. Passaram a compilação, a verificação das 115 versões e os 250 testes por código. A vistoria da missão no jogo continua pendente.

## 24/11/2026 · Susanoo, espelhos de Haku e validação da fila

- Sasuke recebeu uma folha violeta de quatro fases, com arco e flecha. Itachi recebeu a folha com a Espada de Totsuka e o Espelho de Yata, também usada na prévia da Totsuka. A orientação do golpe acompanha o lado do alvo na câmera.
- As oito versões que podem usar Susanoo têm a arte vinculada ao ID do conjurador. Mega Elites e guardiões usam esse efeito no momento do acerto. Lançamentos de dois portadores ficam independentes.
- Os Espelhos Demoníacos de Gelo e a ultimate de Haku usam painéis que surgem em sequência no perímetro da área de acerto e depois baixam.
- A auditoria verifica o retorno ao repouso nas 114 versões, cobre o controlador de Jūzō como jogador e ajudante e acrescenta as referências da primeira entrega chibi. A função Netlify agora tem teste em Node para sessão, envio de partida e leitura do placar. A proposta de verificação competitiva está no documento de ranking.
- O registro de efeitos traz as chances por nível e 60 simulações. A vistoria das quatro vilas em partida, o FPS com GPU e a validação do ranking hospedado continuam pendentes.

## 24/11/2026 · Contagem das duas entregas de revisão chibi

- O registro do elenco distingue as oito versões redesenhadas na primeira entrega das nove versões ajustadas após a auditoria. As duas entregas somam 17 versões trabalhadas nas 114 jogáveis. Foram conferidos os nove retratos no build da cópia principal.

## 24/11/2026 · Ajuste nas nove versões da auditoria chibi

- Chiriku, Jūgo Taka e Obito Máscara Branca receberam novas proporções no retrato, no repouso, no ataque e nas acrobacias. Chiriku também recebeu corrida nas cinco vistas com o traje do Templo do Fogo.
- Sakura Genin, Sakura Shippuden, Sakura Byakugō, Kushina, Tobi Akatsuki e Hanabi Adulta receberam novas poses de repouso e ataque, com a proporção mais próxima da corrida. O retrato da versão também aparece na ficha.
- **TESTADO.** TypeScript, build, 244 testes por código e recortes conferidos nas folhas de contato.
- **PENDENTE DE VALIDAÇÃO E2E.** Conferir as transições de repouso, corrida e ataque em partida, inclusive no jogador, nos ajudantes e nos Mega Elites. [Auditoria e referências](docs/development/AUDITORIA-CHIBI-ELENCO.md#ajuste-das-nove-versões).

## 24/11/2026 · Auditoria visual das 114 versões jogáveis

- Conferidos 1.026 recortes no seletor e no controlador de movimento. A [auditoria chibi](docs/development/AUDITORIA-CHIBI-ELENCO.md) identifica 105 versões consistentes nos recortes, três para redesenho e seis para harmonizar as poses. A fila recebe os nove casos.

## 24/11/2026 · Fila de revisão de arte

- A documentação registra a diferença entre a comparação chibi das 114 versões, as oito artes refeitas e a validação de referências por versão ainda pendente. Jūzō tem folha nova e segue para conferência em partida. A fila também reúne os jutsus, a vistoria das vilas e a validação do ranking público.

## 24/11/2026 · Balanço da Academia e Pedra Memorial de Konoha

- O pátio da Academia ganhou a árvore com raízes, duas cordas e um assento que balança. Os lotes da frente cedem espaço ao pátio de terra batida. A entrada tem o emblema redondo da Academia.
- A Pedra Memorial ganhou um volume facetado inspirado na kunai do anime, inscrições, base no chão, lajes laterais e flores. A antiga clareira `(-38, -26)` continua sendo sua localização. Os dois marcos têm rota pelo mapa (M/Tab) desde o início nas novas missões da Folha.
- **TESTADO.** TypeScript, build e 243 testes por código. O teste de mutação acusou a remoção do movimento do balanço. As prévias das malhas foram renderizadas em OpenGL.
- **PENDENTE DE VALIDAÇÃO E2E.** Percorrer o pátio e o memorial em partida e verificar as rotas no mapa e a leitura com a câmera baixa.

## 24/11/2026 · Gengetsu, Sakumo e Orochimaru fiéis ao anime

- Após a revisão da prévia, os três shinobis receberam novas folhas baseadas em cenas do anime. Gengetsu tem o traje cinza listrado de gola rosada e o rosto sem sobrancelhas. Sakumo tem a manga branca, a faixa diagonal, a bainha e o cabelo preso longo. Orochimaru usa a capa fechada da Akatsuki, com gola alta, mechas e marcas faciais da fase.
- Os novos recortes vão da seleção e ficha à corrida em cinco vistas, ataques, pulo e dash. A [skill de arte](skills/criar-arte-shinobibonk/SKILL.md) registra o padrão permanente. As [referências da rodada](docs/21-ELASTAO-DE-HEROIS.md#referências-de-gengetsu-sakumo-e-orochimaru-akatsuki) ficam no registro do elenco.
- **PENDENTE DE VALIDAÇÃO E2E:** conferir as transições e as animações em partida.

## 24/11/2026 · Revisão chibi do elenco e vistas completas dos NPCs

- A comparação visual percorreu as 114 versões em seleção, repouso, corrida e ação. Além de Haku e Hanzō, Nagato, Sasori e Jūzō ganharam folhas chibi de repouso, caminhada, ataque, corrida, pulo e dash.
- Ebisu, Teuchi e Sapos Sábios receberam arte própria de perfil e costas, com a vista anterior de frente. Os quadros do Totem incluem a preparação e o selo vistos de frente e de costas.
- **PENDENTE DE VALIDAÇÃO E2E:** ver os NPCs ao girar a câmera e as transições entre repouso, corrida, ataque, pulo e dash das cinco versões em partida.

## 24/11/2026 · Primeiras folhas da revisão chibi

- Haku e Hanzō Salamandra receberam novas folhas com a proporção chibi de Naruto, mantendo os trajes das versões do jogo. A mesma arte aparece no retrato, repouso, ataques, corrida nas cinco vistas, pulo e dash.
- **TESTADO.** A suíte de movimento verificou os quadros nas oito direções e as quatro fases de pulo e dash das 114 versões jogáveis e dois companheiros. **PENDENTE DE VALIDAÇÃO E2E:** conferir enquadramento e transições em partida.
- A comparação do elenco identificou Gengetsu, Nagato e Sakumo como os próximos redesenhos.

## 24/11/2026 · NPCs animados com a arte original

- **IMPLEMENTADO.** Os NPCs voltam à pixel art anterior e ganham movimentos de cabeça e tronco com os pés apoiados. Nos shinobis com atlas direcional, a câmera revela perfil e costas em uma única figura. Teuchi, Ebisu e Sapos Sábios mantêm a vista original animada.
- Zetsu conserva a subida e o clique, e Naruto Totem usa a folha de selos do Naruto Genin. Casas, altares e o mercador continuam no mundo em seus pontos fixos.
- **TESTADO.** TypeScript, build e 241 testes por código com cobertura. **PENDENTE DE VALIDAÇÃO E2E:** ver os NPCs em partida com câmera baixa e alta, giro, neblina e aproximação.

## 23/11/2026 · Mapas novos para teste no Live

- O usuário autorizou promover as quatro vilas para teste. O código revisado e validado em `5b72a16` segue para `main`.
- O estado anterior de `main` foi preservado em `backup/live-antes-vilas-2026-11-23` (`5955bb0`). A branch histórica `mapas_basicos` permanece em `c7581be`.
- As quatro vilas estão ativas nas novas missões da seleção normal na cópia principal. `pnpm build` atualizou o `dist`. O usuário fará a publicação manual no site.

## 23/11/2026 · Água, NPCs 3D e acabamento das quatro vilas

- A malha tem subdivisão localizada nas margens, com vértices compartilhados nas transições. A água ganha leito contínuo, borda translúcida e reflexos sinuosos. Passos, ondulações e respingos continuam ativos.
- NPCs de posto e evento ganharam corpos 3D articulados. Teuchi mexe a concha, Zetsu continua surgindo do chão e Naruto Totem faz o selo com os braços. A orientação permanece fixa, com respiração e movimento de cabeça no repouso.
- Suna, Iwa e Kiri ganham bairros laterais e ao sul, acostamentos suaves e novas construções próprias. Suna tem rotundas de mercado, Iwa casas com vigias de pedra e Kiri varandas de cais. Os picos regionais receberam perfis irregulares, pontes receberam apoios e as vilas usam sombras locais.
- **TESTADO.** TypeScript, 240 testes, duas mutações focadas, regras e build de produção. As quatro vilas e os NPCs foram conferidos no renderizador nativo. A validação em partida e a medição de FPS seguem pendentes.

## 23/11/2026 · Versos das estátuas, itens apoiados e queda antes do selamento

- Hashirama e Madara ganharam costas pintadas com cabelo, placas de armadura e pedestal próprios. O atlas projetado sobre o relevo mistura a arte com a pedra das laterais.
- Pergaminhos, shuriken amaldiçoada e itens do mapa têm apoio na superfície, respeitam o recorte transparente e recebem uma pequena sombra de contato. Drops de abate ficam apoiados até o ímã puxá-los. Os pergaminhos grátis mantêm o farol.
- O shinobi derrotado cambaleia, dobra o joelho, tomba para longe do jogador e repousa apoiado no terreno. O selamento aparece quando a queda termina. Os corpos restaurados do save já entram deitados.
- **TESTADO.** TypeScript, 238 testes, duas mutações focadas, verificação de regras e build. O renderizador nativo conferiu o atlas, três poses da queda e os quatro lados de Konoha. A validação contínua em partida está pendente.

## 23/11/2026 · Base do Monte Hokage e limite visível

- A face e o verso do Monte Hokage terminam dentro da encosta. A arte se abre levemente na base para esconder o vão que aparecia nos giros de câmera. A rota de escalada continua acessível até o mirante.
- As quatro regiões de missão ganharam um perímetro com postes e travessas na borda já usada pelo movimento. Konoha tem um bosque depois da cerca e mais camadas de colinas ao fundo.
- A posição de câmera ganha altura só quando toca o relevo. Um piso distante e opaco cobre a junção do terreno com o panorama, e o alcance ortográfico inclui o fundo.
- **TESTADO.** TypeScript, 235 testes, duas mutações focadas, verificação de regras, build e renderização nativa. A rotação da câmera em uma partida continua pendente de validação.

## 23/11/2026 · Acabamento do chão de Konoha

- As ruas de terra batida têm acostamentos que se misturam ao gramado. As praças mantêm o piso de pedra, com os cantos suavizados. O relevo acompanha a transição entre as superfícies.
- O shader usa o atlas em escala menor e com filtragem anisotrópica maior, para preservar detalhes vistos de ângulo baixo. A pintura em cache acompanha a semente da vila.
- A comparação visual nativa foi feita com o shader e o atlas separados. A conferência do chão durante a partida fica na validação da branch de vilas.
- **TESTADO.** TypeScript, 232 testes, mutação focada, verificação de regras e build de produção passaram.

## 23/11/2026 · Eventos fixos e marcos de Konoha

- Portais, altares, mercador e Ichiraku usam volumes fixos. Os NPCs, Zetsu e o Totem usam arte em malhas fixas. O clique continua disponível nas faces do Ichiraku e do Zetsu. Cada altar conserva a cor de raridade.
- Madara e Hashirama têm bases secas nas margens opostas, com verso de pedra limitado à silhueta do atlas. O Monte Hokage usa a mesma técnica de relevo, com saliências escaláveis desde o lado oeste até o mirante.
- Novas fachadas inspiradas nas referências da obra: Academia com torres e emblema, residência Uzumaki com cobertura circular, casa de banhos do canal com venezianas e placa ゆ, moradias mais altas com tanques. O portão tem travessa clara e folhas verdes abertas. As pontes da Folha têm corrimão vermelho.
- A água usa duas ondas na malha, brilho direcional, reflexo simulado de céu, margem transparente com espuma e leitura de profundidade. Ondas dos passos, respingos e deslocamento continuam disponíveis.
- Konoha tem sombras locais em qualidade Alta (2048) e Média (1024), atualizadas ao avançar pelo mapa. A qualidade Baixa dispensa essa passagem. A arquitetura continua agrupada por trecho.
- **PASSOU:** TypeScript, 231 testes, cobertura, build e compilação nativa do núcleo visual da água. **PENDENTE DE VALIDAÇÃO E2E:** iluminação da partida, desempenho, rota do monte em movimento e interação por mouse em torno dos NPCs.


## 23/11/2026 · Escadas ligadas às ruas e expansão de Konoha

- As escadas do portão e do terraço usam uma face de piso por degrau, com espelhos e laterais em pedra. O pátio lateral encosta no quarteirão, conecta duas ruas e tem floreiras e muretas. Acabamento e apoio seguem o mesmo perfil.
- Konoha ocupa 81,3% da área jogável amostrada. Na semente de revisão há 161 lotes, três praças novas, três pontes e bairros ao sul e nas laterais. A clareira de Hagoromo e áreas ao redor da água continuam livres.
- A geração usa lotes e pontos de NPCs sorteados na missão. Eventos deixam folga das escadas, e ao retomar posições que passaram a ficar sob construção usam um ponto válido. O Guardião recebe prioridade nos locais próximos do início.
- As amostras de terreno consultam os lotes próximos. A colisão de inimigos consulta as construções da célula atual e da vizinha quando há empurrão entre células.
- Perfil equilibrado sem navegador **PASSOU**: tipos, 228 testes, cobertura e build. O teste também acusou a duplicação deliberada de um piso.
- **PENDENTE DE VALIDAÇÃO E2E:** conferir a ausência de cintilação durante giros de câmera, percorrer o pátio e explorar os distritos com inimigos e eventos em partida.


## 23/11/2026 · Konoha maior, escadas e bairros sorteados

- Konoha cresceu de 52 para 84 m na largura do distrito, com 24 lotes laterais, ruas transversais e mais árvores. As fachadas da entrada se voltam para a avenida, com beirais, barris e pedras baixas no acostamento.
- As quatro vilas sorteiam posições, dimensões e materiais dos lotes na nova missão. A semente fica no save. Os pontos dos NPCs são embaralhados por zona, com folga entre si, fora das construções e da água. Os NPCs comuns e as estruturas de atendimento ficaram 17% maiores nas vilas.
- As escadas de Konoha têm degraus maciços, inclusive na entrada do portão. A locomoção testa colisão e apoio em trechos curtos para caminhar e dar dash.
- O Monte Hokage foi elevado ao fundo e deslocado para a direita da torre. O pé do monte usa rocha no terreno e volumes atrás da frente esculpida.
- Perfil equilibrado sem navegador **PASSOU**: tipos, 225 testes, cobertura e build.
- **PENDENTE DE VALIDAÇÃO E2E**: conferir escadas, o entorno do monumento e os NPCs em partidas com sementes diferentes.


## 23/11/2026 · Vilas em 3D e Susanoo por personagem

- Na branch de validação, Konoha, Suna, Iwa e Kiri ganharam bairros jogáveis com volumes fixos, fachadas em vários lados, telhados inclinados, entrada, marcos, escada em Konoha e pontes em Kiri. Os materiais são originais e compartilham um atlas.
- As fundações bloqueiam por contato. Espaço e movimento em direção à parede iniciam a escalada. Tetos servem de apoio e a escada de Konoha é transitável a pé. A partida salva registra a variante do mapa e a altura de apoio. Saves anteriores carregam os mapas básicos.
- Mantidas as rodadas 97–103, incluindo os dois treinamentos, os respingos e as regras de status. A branch parte da versão principal e exclui os arquivos do protótipo low poly.
- Madara usa a folha azul com duas lâminas onduladas. Sasuke prepara arco e flecha roxos. Itachi equipa o Espelho de Yata e a espada que sai da cabaça de Totsuka. Kakashi usa a malha azul-clara com o shuriken do Kamui em voo. Shisui usa chakra verde e agulhas na versão de referência animada Ninja Escapades. O efeito da técnica comum segue a espera do acerto existente.
- Perfil equilibrado sem navegador **PASSOU**: tipos, 223 testes, cobertura e build. A mutação da escada foi detectada.
- Prévia por renderização nativa das malhas. **PENDENTE DE VALIDAÇÃO E2E** em partida: comparação visual com a composição aprovada, giro de câmera, portas e escalada, colocação de eventos, quadros e legibilidade dos Susanoo.


## 23/11/2026 · Recuperação de contexto e estado das vilas

- Revisados os Markdown do projeto principal, as instruções e skills, o guia da cópia de validação, as branches e o parcial local das vilas. A `main` está na rodada 103. A branch dos mapas ainda precisa incorporar as rodadas 97–103.
- Registradas as últimas decisões do usuário sobre sprites atuais, arquivo externo do low poly, densidade das cidades e orientação fixa das construções.
- Identificado que a arquitetura local nova ainda não é chamada pela cena. Os 208 testes registrados anteriormente pertencem à primeira versão publicada da branch, antes do parcial atual.
- [Retomada e próximos passos](docs/27-RETOMADA-MAPAS-23-11.md). Esta rodada atualiza apenas a documentação.
- Passaram TypeScript, verificação de regras, build da versão principal e conferência do diff documental. Os testes de gameplay e do parcial das vilas não foram repetidos nesta revisão.

## 16/11/2026 · Pacote de status: Resfriado, reações, resistência e itens que explodem (Rodada 103)

- **Pedido do usuário:** "vamos ter que aumentar um pouco os itens que tem efeito de congelar para balancear e o dano..." e, depois das sugestões, "Sim, implementar".
- **Regras em `src/game/statusRules.ts`** (lógica pura, valores PROPOSTOS para calibrar no simulador):
  - **Resfriado:** cada acúmulo tira 12% do movimento; 3 acúmulos congelam por 1,5 s; sem frio novo por 3 s, os acúmulos somem. Técnicas com Congelar dão 2 acúmulos; o Pergaminho Hyoton dá 1.
  - **Congelado:** não age e recebe +25% de dano.
  - **Reações:** técnicas de Água molham por 5 s. Molhado + gelo congela na hora. Molhado + Raio eletrocuta: até 3 vizinhos a 6 m levam 40% do golpe. Queimando + Vento espalha a queimadura para até 4 vizinhos a 3 m.
  - **Resistência a controle:** Mega Elite e Guardião 40%, bijū 25% (encurta a duração).
  - **Sono:** o golpe que acorda causa +60%.
  - **Veneno:** acumula até 8; cada acúmulo além do primeiro dá +15% de dano por segundo.
- **Itens:**
  - **Novo: Quebra-Gelo** (Raro): acertar um inimigo congelado quebra o gelo (+50% no golpe) e os estilhaços resfriam quem está a até 3 m.
  - **Esfera Katon:** inimigo que morre queimando tem 50% de chance de explodir (dano em 3,5 m e queimadura).
  - **Espelho de Gelo de Haku:** inimigo que morre congelado solta estilhaços (dano e Resfriado em 3 m). O congelamento ao ser atingido agora é Congelar de verdade (antes era Paralisar), com resistência.
- As explosões na morte são resolvidas no quadro seguinte (até 12 por quadro), para não mexer na lista de inimigos durante a morte.
- **Testes:** 4 testes novos em `tests/status.test.mjs` (o mínimo subiu para 212) e 3 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver na tela o Resfriado deixando o inimigo lento, o congelamento, os anéis das reações e as explosões na morte.

## 16/11/2026 · Equilíbrio dos status: menos crítico, gelo que congela e magnetismo do Pain (Rodada 102)

- **Pedidos do usuário:**
  - "Sim, equilibrar" (depois da contagem: 59 de 216 técnicas só davam crítico);
  - "Técnicas de gelo, igual Haku ou... kekkei genkais, elementos que misturados formariam gelo, podem congelar";
  - "Nagato/Pain usam magnetismo, então suas habilidades deveriam depender bastante disso".
- **Perfis de status** (`src/game/statusProfiles.ts`, aplicados uma vez em todas as técnicas, em `heroes.ts`):
  - **Ficam só no crítico 7 golpes de precisão:** Shuriken, as três Kunais, Espada Kusanagi, Sete Espadas e Bisturi de Chakra.
  - **As outras 52 ganham o status que combina com a obra:**
    - Taijutsu de impacto atordoa (Lótus, Impacto de Sakura, Chute Celestial);
    - os de giro e vento empurram (Kaiten, Furacão da Folha, Palma de Ar);
    - os Punhos Gentis paralisam;
    - Água empurra ou deixa lento;
    - Terra atordoa ou deixa lento;
    - as cobras do Orochimaru e as marionetes de veneno envenenam;
    - Bijūdama, Kunai Explosiva e Tigre do Meio-Dia queimam;
    - Senbon com Sinos faz dormir.
  - **Gelo congela:** Senbon de Gelo e Espelhos Demoníacos de Gelo, do Haku. A fusão Hyōton (Água + Vento) já congelava.
  - **Magnetismo do Pain e do Nagato:**
    - Barras de Chakra e Receptores de Chakra puxam;
    - Invocação dos Caminhos repele;
    - continuam Bansho Tenin (puxa), Chibaku Tensei (núcleo) e Shinra Tensei (repele).
- **Antes → agora:**

  | Status | Antes | Agora |
  |---|---|---|
  | Só crítico | 59 | 7 |
  | Paralisar | 41 | 53 |
  | Empurrar | 37 | 51 |
  | Atordoar | 33 | 49 |
  | Lentidão | 29 | 34 |
  | Queimadura | 13 | 16 |
  | Veneno | 3 | 7 |
  | Dormir | 4 | 5 |
  | Gravidade | 2 | 5 |
  | Congelar | 0 | 2 |

- **Testes:** 1 teste novo (o mínimo subiu para 208) e 2 mutações novas, verificadas à mão. Valores propostos, a calibrar no simulador. **PENDENTE DE VALIDAÇÃO E2E.**

## 16/11/2026 · Cartões de pílula e item e catálogo de fusões enquadrado (Rodada 101)

- **Pedidos do usuário:**
  - "Em pilulas e itens… você vai por assim: Nome · Se esta no pool · Efeito · Descrição · Quantidade".
  - "Enquadrar as habilidades, ainda não mostra certo as descrições" (print do catálogo de fusões).
- **Cartões de pílula e item no planejamento** (`plannerCardInfo` em `src/game/plannerCards.ts`): o nome, embaixo se está no pool, e depois as linhas **Efeito**, **Descrição** e **Quantidade** (pílula: "Até 9 níveis"; item: "Comum · até 10 cópias"). Itens ainda não têm texto de descrição próprio; a linha aparece quando houver.
- **Catálogo de fusões:**
  - **Causa do ícone fora do quadro:** a regra de CSS do texto do cartão (rodada 81) pegava também o ícone de fusão, que é feito de dois ícones, e os empilhava na vertical.
  - Agora o ícone fica num quadro fixo de 44 px, e cada fusão mostra, além da receita, o que faz: natureza, forma e efeitos ou status.
- O cartão completo no modelo de referência ("Como funciona", "Quais melhorias afetam") continua na tarefa das fusões, que espera a aprovação da lista de receitas (`docs/10`).
- **Testes:** 2 testes novos (o mínimo subiu para 207). **PENDENTE DE VALIDAÇÃO E2E:** ver os cartões e o catálogo na tela.

## 16/11/2026 · Revisão de jutsus: efeitos próprios no lugar do genérico (Rodada 100)

- **Pedido do usuário:** "Revisar outros jutsus".
- **Medido:** 39 de 221 técnicas só tinham o efeito genérico do elemento. 16 ganharam o efeito do atlas de batalha que combina com a obra:
  - **Areia do Gaara** (Agulhas, Garra e Onda de Areia): agora usam o efeito de areia; antes usavam o pó de ouro do Rasa.
  - **Esferas da Busca da Verdade e Barreira Espaço-Tempo:** vazio.
  - **Yamata no Jutsu e Serpentes Ocultas:** veneno.
  - **Possessão em Massa e Agulhas da Sombra:** sombras.
  - **Punho Gentil e Punhos dos Leões Gêmeos:** palmas.
  - **Chuva de Senbon:** lâminas.
  - **Chutes, Combo do Leão e Punho da Folha:** impacto de Taijutsu.
- O restante e o que ainda falta estão em `docs/24` → "Revisão de 16/11/2026".
- **Testes:** 1 teste novo (o mínimo subiu para 205) e 1 mutação nova, verificada à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver os efeitos na partida.

## 16/11/2026 · Água com respingos e Susanoo do Madara mais bonito (Rodada 99)

- **Pedido do usuário:** "Sim, água e jutsus". Fila do Codex: refinar a água (respingos, atores que atravessam, chakra nos pés) e revisar as animações, começando pelo Susanoo: "o claude montou a animação dele via código, mas você tem que fazer uma animação dela mais bonitinha, aquilo é só esboço".
- **Água** (`src/scene/water.ts`):
  - **Respingos** (`createSplashes`): gotas que saltam e caem, num único objeto. Cada passo dá 6 gotas, o dash 8 a cada 0,1 s e o pouso de um pulo 16, mais fortes.
  - **Ondas dos outros:** inimigos e aliados a até 22 m que estão na água também fazem ondas (até 6 a cada 0,45 s, para não pesar). Agora são até 16 ondas ao mesmo tempo.
  - **Chakra no ritmo:** o anel de chakra dos pés pulsa a cada passo.
  - **Margem:** faixa de areia molhada (mais escura) colada à água.
- **Susanoo do Madara** (`susanooFx.ts`, `susanooPaintedLook`):
  - Os 4 quadros da folha pintada (costelas → armadura → lâminas cruzadas → golpe) agora se **fundem** um no outro, em vez de trocar de uma vez.
  - Ele **sobe do chão crescendo**, com uma rajada de chamas de chakra, respira, **avança no golpe** e **dissolve subindo**.
  - O esqueleto procedural ficou mais apagado por trás da arte. O momento do acerto (0,22 s) não mudou.
- **Sasuke e Itachi** continuam com o Susanoo procedural, porque só existe arte pintada do Madara. Pedido de arte: folhas de 4 quadros no mesmo formato de `susanoo-madara-v1.png`:
  - Sasuke: roxo, com arco e flecha;
  - Itachi: laranja, com a Espada de Totsuka e o Espelho de Yata.
- **Testes:** 2 testes novos (o mínimo subiu para 204) e 2 mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E:** ver os respingos e as ondas de outros atores, a margem molhada e o Susanoo do Madara na tela.

## 16/11/2026 · Treinamento da Juventude (Rodada 98)

- **Pedido do usuário** (docs/13 item 47): "Terá Might Guy no Mapa como NPC… Texto: DEIXE A JUVENTUDE EXPLODIR EM SEU CORAÇÃO · Tabela · Esquerda seletor de dificuldade · Fácil, Normal, Difícil · Direita TODOS OS ATRIBUTOS do jogo, eles escalam a porcentagem do buff por dificuldade". Os desafios pedidos foram: locais marcados, abates, não ser acertado, vencer o Guy e vencer o Lee.
- **Regras** (`src/game/youthTraining.ts`):
  - **Atributos:** 20 da ficha (HP, dano total, Taijutsu, Ninjutsu, velocidade de ataque, crítico, dano crítico, área, recarga, duração e chance de status, velocidade de projétil, movimento, evasão, armadura, regeneração, XP, Ryu, sorte, coleta). Cada um ganha ×1 no Fácil, ×2 no Normal e ×4 no Difícil (dano total: +3% / +6% / +12%). Valores propostos.
  - **Desafio sorteado** a cada visita:

    | Desafio | Fácil | Normal | Difícil |
    |---|---|---|---|
    | 10 locais marcados no mapa | 90 s | 75 s | 60 s |
    | Abates | 100 em 120 s | 200 em 150 s | 400 em 180 s |
    | Sem ser acertado | 30 s | 45 s | 60 s |
    | Vencer o Might Guy | 120 s | 100 s | 80 s |
    | Vencer o Rock Lee | 120 s | 100 s | 80 s |

- **Na partida** (`GameCanvas.tsx`):
  - O Might Guy é um NPC em (−30, −42). O E abre o painel e pausa o jogo; X sai sem gastar.
  - Começar gasta o Guy na zona. Os locais aparecem como anéis verdes. Um golpe que passa das defesas encerra o desafio "sem ser acertado". O Guy ou o Lee da luta não deixam corpo para selar.
  - **Vencendo**, todos os atributos ganham o buff até o fim da missão.
- **Tela:**
  - painel `src/ui/YouthPanel.tsx`: retrato do Guy, o texto, a dificuldade à esquerda com o desafio de cada uma e a tabela de atributos à direita;
  - faixa no topo com o progresso e o tempo.
- **Testes:**
  - `tests/juventude.test.mjs` com 4 testes. O mínimo subiu para 202.
  - 3 mutações novas, verificadas à mão.
  - **PENDENTE DE VALIDAÇÃO E2E:** falar com o Guy, ver o painel, jogar cada desafio e conferir o buff na ficha.

## 16/11/2026 · Treinamento do Hagoromo (Rodada 97)

- **Pedido do usuário:** continuar o trabalho do Codex ("Entao faça o restante, deixa aquilo pro codex": os mapas jogáveis das vilas ficam com o Codex). Evento especificado em `docs/01` → "Evento Treinamento do Hagoromo".
- **Regras** (`src/game/hagoromoTraining.ts`):
  - **Chave:** 1 a cada 500 abates, até 3. Abates das hordas do evento não contam. No Clássico, depois do chefe da zona, a chave para de recarregar até a próxima zona.
  - **Raridade sorteada a cada ativação:** Comum 3×50 · Incomum 4×100 · Raro 5×150 · Épico 6×200 · Lendário 7×400. Os pesos da raridade são uma proposta.
- **Na partida** (`GameCanvas.tsx`):
  1. A tecla **C** (remapeável) leva o jogador à **clareira do treinamento**: campo plano cercado de floresta, no mesmo ponto (−56, 56) em todos os mapas.
  2. Durante o evento:
     - o relógio da zona para;
     - o surgimento normal, as emboscadas, os encontros de selamento e o clima pausam;
     - os inimigos do mapa ficam parados.
  3. As hordas nascem em anel em volta do jogador. Depois da última vem um **Mega Elite**, que não deixa corpo para selar.
  4. A dificuldade é a da zona com os buffs ativos, e o Final Swarm continua contando.
  5. No fim, o jogador volta ao ponto onde estava.
- **Recompensa:**
  - Escolha de 1 entre 3 **ferramentas do Sábio dos Seis Caminhos**, ou nenhuma (X).
  - No máximo 3. Com as 3, aparece "Manter?": clicar na nova a dispensa; clicar numa que já tem troca essa pela nova.
- **As 9 ferramentas** (2 Comum, 2 Incomum, 2 Raro, 2 Épico, 1 Lendário), cada uma com atributo e subefeito. Valores propostos, a calibrar no simulador:
  - Amuleto de Selamento
  - Partículas Polares
  - Shakujō
  - Espada
  - Bashōsen
  - Kōkinjō
  - Benihisago
  - Kohaku no Jōhei
  - Shichiseiken
- **HUD** (`src/ui/HagoromoButton.tsx`):
  - Botão ao lado da Ultimate com o retrato do Hagoromo em pixel art (desenhado no código), 3 bolinhas de chave em cima e a tecla embaixo. Com 0 chaves, ele mostra o progresso até os próximos 500 abates.
  - As ferramentas aparecem em 3 quadradinhos abaixo do nível e do XP no cartão do personagem. Os ícones das ferramentas são provisórios (emoji) até a arte própria.
- **Salvar:** chaves, progresso e ferramentas entram na partida salva.
- **Testes:**
  - `tests/hagoromo.test.mjs` com 6 testes. O mínimo subiu para 198.
  - 3 mutações novas, verificadas à mão.
  - **PENDENTE DE VALIDAÇÃO E2E:** jogar o evento inteiro (C, clareira, hordas, Mega Elite, volta, escolha e troca), ver o botão e as vagas e conferir os subefeitos.
  - O modo **Sobrevivência** ainda não existe em partida. Quando existir, ligar `hagoromoRecharges('sobrevivencia', …)`.

## 15/11/2026 · Acesso às vilas nos mapas planejados

- Registrado o plano de conectar os acessos às ruas, praças e eventos de cada vila no próprio mapa da missão. Implementação pendente.

## 15/11/2026 · Prévias de composição das quatro vilas

- Montadas quatro cenas isoladas em projeção 3D para Konoha, Suna, Iwa e Kiri, com os atlas do jogo e a imagem de seleção de cada vila como referência de composição. As comparações lado a lado e os renders foram entregues no chat. A integração ao jogo fica para depois da revisão visual.
- O protótipo usa campo de visão de 60° e zoom 22, com giro e inclinação por enquadramento. Colisões, escalada, eventos e água em movimento ficam para a versão jogável.
- TypeScript, verificação de regras e build passaram.


## 15/11/2026 · Sprite da bijū na arena final

- A bijū surge a 7 m à frente da câmera e a animação de entrada começa quando a folha está pronta. O fade genérico dos inimigos deixa de escrever na opacidade da bijū. Se o atlas dianteiro falhar, há imagem de reserva da mesma bijū.
- A arena oculta a decoração da vila e reaplica a ambientação ao retomar. O save conserva a posição do chefe. Em um save da arena sem chefe e sem portal de saída, a luta pode começar ao retomar.
- **PASSOU:** 192 de 192 testes por código, TypeScript e build (perfil equilibrado).
- **PENDENTE DE VALIDAÇÃO E2E:** entrar e retomar a arena, conferir a emergência, o caminhar e os ataques das nove bijū.

## 15/11/2026 · Emboscada da Akatsuki e cinco casas na roleta

- O Altar do Desafio deu lugar à Emboscada da Akatsuki. Zetsu emerge usando a arte do elenco e a nuvem vermelha aparece no mapa. Clique no Zetsu ou use E perto dele.
- As 13 versões da organização registradas no elenco entram no encontro, com suas técnicas e HP multiplicado pela ameaça atual, incluindo a zona e o Final Swarm. Derrotar o último deixa três pergaminhos grátis. Uma emboscada em andamento guarda os participantes vivos no save.
- Caça-Níquel com Tsunade, Hiruzen, Kakuzu, Jiraiya e Hidan. Rolos e painel de chances usam a mesma tabela. Pesos dos cinco preservados e renormalizados; pagamentos de giros pendentes em saves antigos seguem válidos.
- O Portal do Guardião · Myōjinmon invoca o Guardião com E e a vitória libera a passagem. Atualizada a referência do fluxo na documentação.
- **PASSOU:** 189 de 189 testes por código, TypeScript e build (perfil equilibrado).
- **PENDENTE DE VALIDAÇÃO E2E:** emergência e clique no Zetsu, combate, recompensa, nuvem nos mapas, rolos e pagamento na saída.

## 15/11/2026 · WASD contínuo, Treinamento sem cartas e dano recebido

- O movimento acompanha o teclado físico separado das ações limpas pela interface. Segurar WASD ou uma direção remapeada mantém a ordem das teclas ao concluir uma escolha ou Treinamento. A colisão pode bloquear o avanço enquanto a passada permanece ativa. Perda de foco limpa a entrada.
- O pool esgotado aplica Treinamento com o painel fechado, inclusive após atualizar ou banir a última opção. Cada nível concede seu bônus; o texto flutuante tem intervalo de 0,4 s entre avisos.
- A invulnerabilidade de 3 s por nível permanece. O cartão de HP mostra **Protegido** ou **Debug** conforme a fonte. Dano confirmado mostra número vermelho, flash do personagem e som de acerto mesmo se o HP for recuperado rapidamente.
- **PASSOU:** 185 de 185 testes por código, TypeScript e build (perfil equilibrado).
- **PENDENTE DE VALIDAÇÃO E2E**: manter movimento em nível alto com 300+ inimigos, verificar ataque à distância durante e depois da proteção e legibilidade de HP em tela estreita. Alterações de mapa ficam para apresentação em capturas antes de entrar na versão de teste.

## 15/11/2026 · Primeiro Mega Elite e ícone do Chute Giratório

- Primeiro Mega Elite da partida limitado a **3.000 HP** em todas as dificuldades. Aplica ao primeiro encontro natural ou de clima e persiste na retomada. A escala dos próximos continua por tempo da zona e ameaça. O teto permanece ao usar o plano do Shikamaru.
- Chute Giratório usa a arte dedicada já presente no projeto, centralizada em `SkillIcon` para recompensas, planejamento, ficha e HUD.
- Simulador: 36 partidas pareadas de cinco minutos, sementes 7, 23 e 47, conta nova, desvio médio, Naruto Academia, Kushina e Pain nas quatro dificuldades. Para Naruto em Kage, os abates de Mega Elites somados foram de 1 para 5, com 2 mortes antes e 1 depois. Trata-se de uma estimativa do modelo, que não simula clima nem efeitos de arte.
- **PASSOU:** perfil equilibrado do HP (180 testes, tipos e build), mais 5 testes de interface, tipos e build com o ícone. **PENDENTE DE VALIDAÇÃO E2E:** conferir o HP e a aparência do ícone em partida.
- Retomada e fila de mapas, água, animações e eventos registradas em `docs/13`; a queda ajoelhada de todos os Mega Elites fica para um lote posterior.

## 15/11/2026 · Zabuza, eventos sorteados por zona, armadilha do ninja caído, nomes repetidos e testers (Rodada 96)

- **Pedidos do usuário:**
  - "Ele parece um personagem um pouco maior que os demais, ajustar, todos precisam ter o mesmo tamanho, tirando as versões que são Genin/Academia, ai precisam ser ligeramente menores";
  - "Agora vai aparecer todos os personagem a 3m do jogador. Não é possível colocar target/focar enquanto Zabuza estiver vivo e/ou ao focar e eles entrarem no range da Névoa… perde o target";
  - "os eventos que temos no jogo que mudam o cenário, devem acontecer aleatoriamente por partida… são por zona, pode acontecer 2 Zabuzas 1 em cada zona";
  - "Ao clicar nos eventos dos ninjas caídos, na armadilha aumentar 5% de inimigos da partida toda e aparecer 10 inimigos a 10m em redor do nosso personagem";
  - "o Jutsu bomba de fumaça, quando selecionado, adiciona um item na lista pool também… isso nunca deve acontecer";
  - "Deixar todas as dificuldades/mapas liberados para tester's".
- **Tamanho** (`ADULT_HEIGHT` / `CHILD_HEIGHT` em `playerMotion.ts`):
  - Todo adulto tem a mesma altura (o Zabuza tinha 2,58 contra 2,32), e o aumento de 10% do Gaara como inimigo ou aliado saiu.
  - Genin e Academia ficam ~10% menores (antes ~17%).
- **Névoa do Zabuza** (`src/game/zabuzaMist.ts`):
  - Branca e densa (cor #e3eaee, some a 6 m da câmera).
  - **Todos** os personagens aparecem só a até 3 m do jogador, sumindo suave até 3,6 m. Antes só o Zabuza aparecia, a 5 m.
  - Com o Zabuza vivo não dá para fixar alvo, e um alvo fixado é solto.
- **Eventos de clima sorteados por zona** (`planZoneWeather` / `WEATHER_ZONE` em `maps.ts`):
  - No começo de cada zona, cada evento do mapa tem 50% de chance de acontecer uma vez, entre 45 s e 510 s da zona, e nunca dois ao mesmo tempo.
  - Pode haver partida sem evento e dois Zabuzas em zonas diferentes. Antes o evento se repetia a cada 65–120 s.
- **Armadilha do ninja caído** (`src/game/fallenTrap.ts`): +5% de inimigos até o fim da partida e 10 ninjas num anel de 10 m em volta do jogador. Vencer ainda dá 1 nível.
- **Nomes repetidos entre item e técnica:**
  - O item "Bomba de Fumaça" virou **Esfera de Fumaça**, e o item "Correntes de Selamento" virou **Correntes de Contenção**. Planejar a técnica não põe mais o item na bolsa.
  - Partidas salvas com os nomes antigos continuam valendo.
  - Um teste impede nomes repetidos daqui em diante.
- **Testers:** com `TEST_UNLOCK_ALL` (já ligado), todos os mapas e dificuldades ficam liberados. **Voltar para false antes de publicar.**
- **Anotações do usuário para o Codex** em `docs/01`: transformar a foto de cada mapa da seleção em mapa jogável; tudo como obstáculo, com escalada na parede.
- **Testes:** 6 testes novos (tamanho, névoa, sorteio por zona, armadilha ×2, nomes) e mutações novas, verificadas à mão. **PENDENTE DE VALIDAÇÃO E2E** de tudo na tela.

## 15/11/2026 · Desempenho: carregamento do mapa ~0,7 s mais rápido (Rodada 95)

- **Pedido do usuário:** "melhorar a performance sem perder nada, desempenho para carregar os mapas… o carregamento esta meio lento, demora alguns segundos algumas coisas". Divisão: o Claude Code fica com o desempenho e o Codex com o resto.
- **Medido sem navegador**, no Node, com o mesmo código do jogo:
  - a **pintura do chão** levava ~1,0 s em toda partida: 3 alturas pela fórmula exata em cada um dos ~1 milhão de pixels;
  - grade de alturas, malha e água ficavam em ~30 ms cada.
- **Agora** (`paintGround` em `src/scene/terrainArt.ts`):
  - A pintura lê a grade de alturas que o jogo já monta, estendida para cobrir todo o chão desenhado.
  - **Antes:** ~1.010 ms. **Agora:** ~295 ms (grade 133 + pintura 161), ~70% a menos.
  - O chão pintado do último mapa fica guardado: jogar de novo o mesmo mapa não repinta.
  - O desenho é o mesmo: o teste compara com a fórmula exata (> 99,5% das superfícies iguais e diferença de cor média < 2 de 255).
- **Testes:** 1 teste novo (o mínimo subiu para 172) e 1 mutação nova, verificada à mão: acusada.
  - **NÃO MENSURÁVEL** sem navegador: o tempo total de carregamento na tela, que inclui compilar os shaders e carregar as texturas.
  - **PENDENTE DE VALIDAÇÃO E2E:** sentir o carregamento mais rápido.

## 15/11/2026 · Shinra Tensei: o Pain levita e solta ondas (Rodada 93)

- **Pedido do usuário:** "Fazer o Pain Levitar enquanto ulta... e sairá um dano em ondas repetitivas que vai dar stun e dano e sempre que ele ultar ele vai levitar… Shinra Tensei é a habilidade".
- **Agora** (`src/game/shinraTensei.ts` + `castUltimate` no `GameCanvas`):
  - Toda Ultimate do Pain o faz **levitar** (sobe ~1,5 m, flutua e desce suave em 2,6 s).
  - Além do golpe inicial, saem **4 ondas de repulsão**, uma a cada 0,5 s. Cada onda causa 45% do dano da Ultimate, **empurra** e **atordoa** por 1,1 s quem estiver no raio (bestas com cauda não são atordoadas).
- **Balanceamento:** a Ultimate do Pain ficou mais forte (+180% de dano somando as ondas). Conferir com a skill `simular-partida` se ele sair da média.
- **Testes:** `tests/shinra-tensei.test.mjs` com 3 testes (o mínimo subiu para 171) e 2 mutações novas, verificadas à mão: acusadas. **PENDENTE DE VALIDAÇÃO E2E:** ver o Pain levitando e as ondas.

## 15/11/2026 · Pergaminhos variados e Pedra Memorial de Konoha (Rodada 92)

- **Pedidos do usuário:**
  - "Aprenda vários tipos de pergaminhos para colocar os pergaminhos no chão, serem diferentes, só o sprite mesmo... para ficar mais bonito o jogo" (com imagens de pergaminhos da obra).
  - "Fazer a pedra memorial em konoha, uma área para ela" (com uma cena do anime).
- **Pergaminhos no chão** (`SCROLL_STYLES` em `src/scene/dropSprites.ts`). Só visual: a recompensa é a mesma. 8 desenhos, sorteados ao nascer:
  - ninja (o original);
  - selamento 封;
  - invocação 口寄;
  - dos Sapos 蝦;
  - Céu 天 e Terra 地 (os rolos fechados do exame Chunin);
  - técnica secreta 秘術;
  - Proibido 禁.
- **Pedra Memorial** (`src/scene/memorialStone.ts`):
  - Clareira plana na Folha (−38, −26), cercada de árvores.
  - Pedra negra polida com nomes gravados e topo em ponta, lajes laterais, piso de tijolos com juntas azuladas e buquê de flores. Tudo desenhado em pixel art no próprio jogo.
- **Testes:** 2 testes novos (o mínimo subiu para 168) e mutações novas, verificadas à mão: acusadas. **PENDENTE DE VALIDAÇÃO E2E:** ver os pergaminhos e a Pedra Memorial na partida.

## 15/11/2026 · Água que mexe e pés de chakra (Rodada 91)

- **Pedido do usuário:** "personagem ao pisar na água deve fazer a água mexer, em naruto eles andam acima da água, mas deve ter um efeito dos pés de chakra, azulzinho… igual no naruto anime? Sei que isso quem vai fazer é o codex, mas já prepare em código o que conseguir e deixe anotado para o codex aprimorar depois".
- **Ondas:** cada passo na água abre uma onda circular clara que cresce e some em 1,6 s, até 8 ao mesmo tempo. O pouso de um pulo faz uma onda mais forte. Fica no shader da água, em `src/scene/water.ts`.
- **Pés de chakra:** um brilho azul pulsante sob os pés enquanto o ninja está sobre a água (`createChakraFeet`).
- **Anotado para o Codex aprimorar** (comentário "PARA O CODEX APRIMORAR" em `water.ts`):
  - respingos em partículas ao correr e no dash;
  - ondas de aliados e inimigos;
  - anel de chakra no ritmo dos passos;
  - arte própria do brilho.
- **Testes:** 1 teste novo. **PENDENTE DE VALIDAÇÃO E2E:** ver as ondas e o brilho andando, correndo e pulando na água.

## 15/11/2026 · Dano bem visível e audível (Rodada 90)

- **Relato do usuário:** "O piscar da tela em vermelho quando recebemos dano, ainda não esta visivel, ta piscando o personagem, precisa fazer algum som meio negativo de dano e pelo menos piscar com mais enfase o personagem".
- **Causas da borda vermelha quase invisível:**
  - as bordas chegavam a ~10% de opacidade num golpe comum;
  - a vinheta sumia por completo quando o sistema estava com "animações reduzidas".
- **Agora:**
  - **Vinheta:** bordas bem mais fortes (golpe fraco a partir de 50% de força, teto 100%), centro da tela continua limpo, e ela aparece mesmo com animações reduzidas.
  - **Personagem:** pisca **vermelho vivo ↔ rosa forte** a cada 0,06 s por 0,36 s (antes: rosa claro fixo por 0,23 s).
  - **Som:** além do estalo, um **baque grave dissonante** (duas serras desafinadas descendo, abafadas), mais forte quanto maior o golpe.
- **Testes:** 1 teste novo (o mínimo subiu para 165) e 1 mutação nova, verificada à mão: acusada (o teste foi reforçado para exigir o pico em vermelho vivo). **PENDENTE DE VALIDAÇÃO E2E:** ver e ouvir o golpe na partida.
- **Anotado para depois** (docs/13 item 40): revisão de desempenho de carregamento, menus e cliques, sem perder qualidade.

## 15/11/2026 · Água de verdade e paisagem de fundo das vilas (Rodada 89)

- **Pedido do usuário:** "Ainda em terrenos, precisamos melhoras MUITO a qualidade da água, não está de acordo com o nosso jogo. E a paisagem do jogo, não existe, né? Você precisa conseguir fazer essa paisagem...". Ordem pedida: arte das vilas + água, selos de mão, fusões; "bigbrain" = usar tudo o que o projeto sabe para um bom resultado.
- **Água** (`src/scene/water.ts`). Antes, o rio da Folha era só pintado no chão. Agora:
  - lagos e rios **cavados no terreno**, com margem de areia e leito escuro;
  - superfície animada em pixel art: ondas, cor pela profundidade, espuma na margem e brilhos;
  - os ninjas **andam sobre a água**, como na obra;
  - por mapa: Folha (rio e lago), Suna (oásis), Iwa (lagos de montanha) e Kiri (três lagos de pântano).
- **Paisagem de fundo** (`src/scene/landscape.ts`): panorama pintado em pixel art em volta do mapa, com o fundo de cada vila.
  - Konoha: montanhas azuladas, colinas de floresta e o Monte Hokage.
  - Suna: mesas de topo reto com estratos e dunas.
  - Iwa: picos cinza pontudos com cachoeiras e névoa.
  - Kiri: agulhas de pedra na névoa.
  - Com névoa de clima, o fundo fica mais apagado.
- **Câmera:** campo de visão de 50° para 60°, inclinação de ~29° para ~26°. O topo da tela passa um pouco do horizonte e mostra a paisagem. O zoom no ninja não muda.
- **Construções:** a arte atual está boa e no estilo do jogo. A arte que falta (torre do Hokage, portão de Konoha, torres de Iwa e Kiri) está listada em `docs/01` para o gerador de arte do usuário.
- **Testes:**
  - 2 testes novos (água em todos os mapas, longe do começo e das construções, de pé na superfície; forma da paisagem de cada vila e câmera que mostra o horizonte). O mínimo subiu para 164.
  - 2 mutações novas, verificadas à mão: acusadas.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver a água (ondas, espuma, transparência), andar sobre ela, a paisagem de cada vila, a câmera nova e o FPS.

## 15/11/2026 · Ultimate automática lembrada, pés sobre o chão e anotações de fusões e mapas (Rodada 88)

- **Pedidos do usuário:**
  - "Se no ultimo jogo eu deixei a ultimate automática, na próxima partida, ela já começa automática, o mesmo para a configuração de selamento".
  - "as vezes o pé do personagem está indo para abaixo do solo… corrigir em todos os mapas… todos os personagens".
  - "Deixar anotado tudo que você tem sobre as fusões, para outro agente continuar depois… também sobre os mapas".
- **Ultimate automática:** trocar na partida (tecla Y ou selo AUTO) agora salva em Configurações → "Ultimate automática ao começar", e a próxima partida já começa assim.
- **Selamento direto:** já era salvo. A tela principal partia de uma cópia velha das configurações e podia desfazer outra opção ao salvar. Agora sempre parte do que está salvo e acompanha o que a partida salva.
- **Pés sobre o chão** (`footHeight` em `src/scene/heightField.ts`):
  - Todo personagem (jogador, aliados, inimigos, elites, guardiões, NPCs) fica de pé no ponto mais alto do chão sob os pés (raio de 0,45 m). As 18 posições do `GameCanvas` usam `standHeight`.
  - O chão recua um pouco na profundidade, para a encosta não cortar a base dos sprites.
- **Anotações para outro agente:**
  - fusões em `docs/10` (estado, decisões, lista de receitas proposta, soma de atributos, cartão novo, passo a passo);
  - mapas em `docs/01` (feito, fila: construções de cada vila, fundo pintado, Fenda, névoa do Zabuza, árvores, E2E).
- **Testes:**
  - 2 testes novos. O mínimo subiu para 162.
  - 2 mutações novas, verificadas à mão: acusadas.
  - **PENDENTE DE VALIDAÇÃO E2E:** pés nas encostas e a Ultimate automática continuando na partida seguinte.

## 15/11/2026 · Nomes da obra nos mapas e horizonte de cada vila (Rodada 87)

- **Pedidos do usuário:** "Coloque os nomes corretos nos mapas" e "Mapas primeiro", com imagens e vídeos de Konoha, Sunagakure, Iwagakure e Kirigakure como referência.
- **Nomes (Narutopedia):**
  - Os mapas passam a se chamar "Konohagakure · Vila Oculta da Folha", "Sunagakure · Vila Oculta da Areia", "Iwagakure · Vila Oculta da Pedra" e "Kirigakure · Vila Oculta da Névoa".
  - O campo de vila dos personagens não mudou, porque é ele que divide técnicas entre ninjas da mesma vila.
- **Zonas fora da vila trocadas:**
  - "Ponte de Kannabi" (País da Grama) → **Desfiladeiros de Iwa**.
  - "Ponte de Tazuna" (País das Ondas) → **Pântano da Névoa**.
- **Horizonte de cada vila** (`horizonProfile` em `src/scene/terrainArt.ts`), sempre fora da área de jogo e abaixo de 8 m:
  - Konoha: montes arredondados.
  - Suna: paredão de platô com topo reto em volta do vale.
  - Iwa: picos altos e pontudos.
  - Kiri: agulhas de pedra finas.
- **Skill de mapas** atualizada com o `horizonProfile`.
- **Testes:**
  - 1 teste novo (nomes e zonas) e o teste de terreno estendido às quatro vilas e à forma do horizonte. O mínimo subiu para 160.
  - 1 mutação nova, verificada à mão: acusada.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver o horizonte de cada vila e os nomes nas telas de mapa.
- **Próximo nos mapas:** arte das construções de cada vila (torre do Hokage, barraca de lámen, portão; cúpula do Kazekage e casas de adobe; torres de pedra de Iwa; torres de tijolo de Kiri).

## 15/11/2026 · Skill de mapas e chão plano sob as construções da Folha (Rodada 86)

- **Pedido do usuário:** "Crie um skill com tudo que está aprendendo sobre mapas, desde as alterações que fez em konoha, para que em novos mapas esse .md, já crie com expertise suficiente para um bom trabalho".
- **Skill nova** `skills/criar-mapa-shinobibonk/SKILL.md` (com o atalho em `.claude/skills/`, citada no AGENTS.md e no docs/19). Ela reúne:
  - onde fica cada parte do mapa no código;
  - as regras de terreno em terraços e os alvos medidos;
  - a câmera;
  - o visual canônico das quatro vilas (imagens de anime de Iwagakure, Kirigakure e Sunagakure e vídeos de Konoha e Sunagakure enviados pelo usuário, só como guia de estilo);
  - o passo a passo de um mapa novo e os erros que já aconteceram.
- **Correção da Rodada 85:** com os terraços, algumas casas e estátuas da Folha ficavam na beira de um degrau (até 1,2 m de desnível sob elas). Agora o chão é plano sob todas: a praça central cobre as casas do centro, e as outras têm área própria (`LEAF_PLACES` em `src/scene/terrainArt.ts`).
- **Testes:** 1 teste novo (chão plano sob cada construção da Folha; o mínimo subiu para 159) e 1 mutação nova, verificada à mão: acusada. **PENDENTE DE VALIDAÇÃO E2E:** ver as construções da Folha assentadas no chão.

## 15/11/2026 · Terreno em terraços e câmera em perspectiva (Rodada 85)

- **Pedidos do usuário:** "A nossa câmera, nosso cenário ainda está muito precário... Precisamos corrigir mais isso, as montanhas do mapa ainda estão muito grandes, e o terreno deveria ter vários locais para pular, esse terreno todo plano com umas montanhas está bem esquisito"; com 3 vídeos de partida do jogo de referência: "mapeie o mapa… e modifique o nosso para ficar semelhante em nível de terreno/camera".
- **Terreno** (`src/scene/terrainArt.ts`):
  - O relevo virou **terraços**: platôs planos em degraus de ~1,2 m, ligados por encostas curtas. São lugares para subir e pular de um nível para o outro.
  - Sem montanha grande dentro do mapa: o ponto mais alto passou de ~5,8 m para ~3,5 m (~4,7 m no monumento da Folha).
  - As montanhas da borda ficaram só no horizonte e com metade da altura (~7 m).
  - O começo da partida (até ~6 m do centro) é plano.
  - As encostas dos degraus são pintadas como paredão de pedra com estrias. A malha do chão ficou mais fina (340 × 340) para os degraus aparecerem.
- **Câmera:**
  - Agora é em **perspectiva**, com campo de visão de 50° e inclinação inicial de ~29°: aparecem o horizonte e as montanhas ao fundo.
  - O zoom continua igual (padrão 12, faixa 8–22) e mede a mesma altura visível no ponto do ninja.
  - A vista antiga (ortográfica) continua em **Configurações → Controles → Vista da câmera**. A troca vale a partir da próxima missão.
- **Testes:**
  - 2 testes novos (terraços, centro plano, horizonte; perspectiva padrão e zoom igual). O mínimo subiu para 158.
  - 2 mutações novas, verificadas à mão: acusadas.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver os terraços, as construções da Folha sobre o relevo novo, a câmera em perspectiva (rotação, zoom, barra de vida, números de dano) e o desempenho.

## 15/11/2026 · A missão só sorteia os itens da bolsa (Rodada 84)

- **Relato do usuário:** "Eu escolhi o Arsenal de Kushina para o Madara, mas está aparecendo itens que eu tenhon 100% de certeza que não levei na Bolsa para a MIssão".
- **Causa:** a missão sorteava todos os itens desbloqueados menos os deixados em casa. A bolsa ninja (itens planejados) só dava preferência.
- **Decisão do usuário:** "Só os da bolsa".
- **Agora** (`missionItemPool` em `src/game/catalog.ts`):
  - Com algum item na bolsa ninja, baús, mercador, roleta e eventos só sorteiam os itens da bolsa (menos os deixados em casa).
  - Com a bolsa vazia, vale o pool completo, como antes.
  - Item bloqueado na bolsa não conta.
- **Testes:** 1 teste novo em `tests/recompensas.test.mjs` (mínimo 156) e 1 mutação nova, verificada à mão: acusada.
- **PENDENTE DE VALIDAÇÃO E2E:** jogar com um modelo salvo carregado e conferir que só aparecem os itens da bolsa.

## 15/11/2026 · Tela pisca vermelho nas bordas ao levar dano + som do hit (Rodada 83)

- **Pedido do usuário:** "A questão da tela piscando vermelho tipo... em jogo de FPS, que os cantos da tela da umas piscadas em vermelho... sabe? Mais o som do hit recebido pelo personagem principal."
- **Antes:** ao perder HP, a tela inteira ficava vermelha por 0,28 s (gradiente cobrindo também o centro) e tocava um som grave (`hurt`, limite de 320 ms).
- **Vinheta (`src/game/damageFeedback.ts`, lógica pura):**
  - Vermelho só nas bordas e cantos: centro transparente até 48% do raio (`src/style.css`, `.player-damage-vignette`, `pointer-events:none`).
  - Intensidade = 0,3 + 2,4 × (dano ÷ vida máxima), com teto 0,9. Some em linha reta em 0,42 s.
  - Limite de frequência: um piscar novo só começa 0,36 s depois do anterior. Golpes no meio só elevam a intensidade, sem reiniciar o brilho.
  - Vida baixa: abaixo de 30% do HP, vinheta fraca e contínua (0,12 → 0,34 conforme a vida cai), com pulso lento de 1,1 por segundo.
  - Com H (efeitos ocultos) a vinheta fica a 55%. Some na derrota e fora da partida.
- **Som (`playHurt` em `src/audio/sfx.ts`):** os dois tons graves do `hurt` + um estalo curto de ruído que cresce com a força do golpe. Volume = volume geral × efeitos (`sfxGain`); no máximo um a cada 0,32 s (`hurtSoundAllowed`).
- **Configurações → Gráficos:** nova opção **"Tela vermelha ao levar dano"** (`damageFlash`), ligada por padrão; "Restaurar padrão" a inclui. Desligada, tira o piscar e a vinheta de vida baixa; o som continua (controlado pelo volume de efeitos).
- **Testes:**
  - 9 testes novos em `tests/vinheta-de-dano.test.mjs`: intensidade pelo dano, duração, anti-estroboscópio, reforço sem reinício, vida baixa, opção desligada, volume e anti-spam do som, e a ligação no GameCanvas/sfx/Configurações/CSS. Cobertura de `damageFeedback.ts` exigida em `tests/minimo.json`; mínimo subiu para 154.
  - `tests/regras-do-jogo.test.mjs` passou a conferir o novo fluxo (`registerHit` + `playHurt`) no lugar de `playSfx('hurt')`.
  - tsc, `scripts/run-tests.mjs` (154/154) e build: PASSOU.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver em partida o piscar só nas bordas, a diferença entre golpe leve e forte, a ausência de estroboscópio com muitos monstros, a vinheta de vida baixa, o som e a opção desligada.

## 15/11/2026 · Modelo salvo no planejamento e fusão com um clique (Rodada 82)

- **Pedidos do usuário:**
  - "Colocar essa parte na parte do preparar missão, faz mais sentido, ao carregar o modelo que está salvo... exemplo eu salvei da Kushina, já vai aparecer os itens."
  - "A opção ainda está ali do que está na bolsa do personagem... Deveria ficar acima de taticas salvas..."
  - "Ao clicar na fusão, ela já fica selecionada."
- **Modelo salvo:**
  - O seletor (Configuração atual / modelos salvos, Salvar, Duplicar, Excluir) saiu da tela de escolha do shinobi.
  - Agora fica no Plano de missão, logo acima de **Táticas salvas**. Carregar um modelo coloca os itens dele no plano e em casa, como antes.
  - O antigo "Salvar arsenal da conta" dentro de Táticas salvas saiu, porque o seletor já salva.
- **Fusões:** um clique numa fusão do catálogo já planeja (até 4). Clicar de novo tira do plano.
- **Testes:**
  - 1 teste novo e 1 conferência a mais no teste do planejador (`tests/fusoes.test.mjs`). O mínimo sobe 1.
  - 1 mutação nova (clique planeja).
  - **PENDENTE DE VALIDAÇÃO E2E:** ver o seletor acima de Táticas salvas e o clique no catálogo.
- **Aviso de publicação:** duas sessões montaram o commit ao mesmo tempo na mesma pasta. O código desta rodada saiu no commit 6cdc579 junto com a Rodada 83 (borda vermelha e som ao levar dano), e estes textos e o mínimo de testes (155 = 154 + 1) saíram no commit seguinte. O conjunto foi testado de novo numa cópia limpa.

## 15/11/2026 · Fusões que o shinobi pode aprender (Rodada 81)

- **Pedido do usuário:** "nas fusões, é pra aparecer já as fusões que o ninja pode aprender… Quando for liberando ninja na conta, vai aparecer mais habilidades que ele pode aprender e vai aparecer, mais fusões também... ele vai selecionar a fusão que ele sabe e ai, na aba de Habilidades, vai aparecer que ele precisa por exemplo, shuriken + vento = Rasenshuriken Fuuton".
- **Aba Fusões do planejamento (`src/ui/BuildPlanner.tsx`):**
  - Abre com a lista **"Fusões que você pode aprender"**, montada com as técnicas do pool do shinobi (`fusionCatalog` em `src/game/techniqueMerge.ts`): Kekkei Genkai no topo, depois as demais em ordem alfabética.
  - A lista cresce ao selar shinobis, porque o pool ganha técnicas novas. Técnicas deixadas em casa, buffs, técnicas bloqueadas e resultados de outra fusão não entram.
  - Clicar numa fusão mostra o resultado (fundir × combinar) e libera **Planejar fusão** (até 4).
  - Escolher as duas técnicas à mão continua possível, em **"Montar o par à mão"** (fechado por padrão).
- **Aba Habilidades:** cada técnica de uma fusão planejada mostra a receita, por exemplo "Shuriken + Técnica de Vento = Nome da fusão", no cartão e no painel de detalhes. Antes aparecia só "Requisito para Fusão".
- **Testes:**
  - 2 testes novos em `tests/fusoes.test.mjs` (catálogo cresce ao selar, Kekkei no topo, sem buff/bloqueio/fusão de fusão; a tela liga o catálogo e a receita). O mínimo subiu para 145.
  - 1 mutação nova (Kekkei no topo), verificada à mão: acusada.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver a aba Fusões e a receita na aba Habilidades.

## 15/11/2026 · Dificuldades na mesma proporção (Rodada 80)

- **Decisão do usuário:** "podem ser iguais nas suas proporções de dificuldade, como falei os erros do jogador vão decretar sua partida e o scale dos monstros tem que ser sentido de uma diferença para a outra". Antes: "se o jogador for bom, isso é normal, mais mobs, mais dinheiro, mais exp, mais level".
- **Resultado:** o Kage render mais XP, Ryu e nível para quem sobrevive é **intencional** (risco e recompensa). O item 29 do docs/13 foi encerrado sem mudar regra.
- **O que fica protegido:** cada degrau (Genin→Chunin→Jonin→Kage) sobe a vida do comum em ao menos 1,2× e o dano em ao menos 1,3×, com degraus proporcionais entre si (diferença ≤ 15%). Teto de vivos, nascimentos, ritmo de ataque e velocidade nunca caem ao subir de dificuldade. Medido: vida 1,23–1,79× e dano 1,36–1,52× por degrau.
- **Testes:** 1 teste novo em `tests/balanceamento.test.mjs`; mínimo 143.

## 15/11/2026 · Skill do simulador de partidas para todos os agentes (Rodada 79)

- **Pedido do usuário:** "Fazer um skill .md para todos os agentes usarem simulador de partida quando precisar".
- **Nova skill** `skills/simular-partida/SKILL.md` (com atalho em `.claude/skills/simular-partida/`):
  - quando usar, comandos, parâmetros e o que o modelo cobre e não cobre;
  - o relatório sai em `artifacts/` (não versionado);
  - roda sem navegador.
- Citada no `AGENTS.md` e na lista de skills de `skills/contexto-e-decisao/SKILL.md`.
- Nenhuma regra de jogo mudou.

## 15/11/2026 · Técnicas miram o alvo, nunca o pé do jogador (Rodada 78)

- **Pedido do usuário:** "Ataques ou devem ser meele, chegar perto para acertar, mas mirando os alvos ou arremessados/lançados, nunca usados no pé do jogador, igual o madara seis caminhos… Revise todas as habilidades que funcionam igual e altere."
- **Causa:** as 14 técnicas em Órbita (Susanoo, Limbo, Esferas da Busca da Verdade, Corvos Ilusórios, Kaiten, Palmas Protetoras, Espelhos de Gelo e outras) acertavam um círculo centrado no próprio shinobi; o corpo a corpo também acertava em volta dele.
- **Agora** (`aimedCenter`, `src/game/combat.ts`):
  - Área, Órbita e corpo a corpo acertam um círculo **no alvo**. O corpo a corpo usa 60% do alcance (mínimo 0,6 m): é preciso chegar perto, mas o golpe vai no inimigo.
  - Órbitas lançadas (Susanoo, Limbo, Esferas da Busca da Verdade, Corvos Ilusórios, Tornado Cortante, Espelhos Demoníacos de Gelo) alcançam 4,5 m, como um projétil (`LAUNCHED_ORBITS`). As de contato (Kaiten, Palmas, estilos de espada) seguem curtas, 1,7.
  - Cone e linha continuam saindo do shinobi na direção do alvo. Ficam no usuário só o puxão (Bansho Tenin), o Modo Sábio (taijutsu girando em volta) e as Ultimates.
- **Visual:** a área marcada, as partículas da Órbita, o golpe do Susanoo e a prévia da técnica também vão para o alvo. O glossário foi atualizado.
- **Testes:**
  - 3 testes novos em `tests/mira.test.mjs`; mínimo 142.
  - 2 mutações novas, as duas acusadas.
  - **PASSOU:** tsc, 142/142 com cobertura e build.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver o Madara Seis Caminhos e as demais técnicas em Órbita acertando o inimigo.

## 15/11/2026 · Balanceamento por forma de técnica, abertura calma, curva de XP e simulador de partidas (Rodada 76)

- **Pedidos do usuário:**
  - "4s de cooldown para uma skill é MUITA coisa… ataques meele 0.5 ou 0.7, projeteis que acertam mais de 1 cerca de 1,5 e area 2s".
  - "Diminuir também um pouco a velocidade de respawn nos primeiros níveis, ir nascendo 1 monstro por segundo no começo… um pouquinho mais longe… as emboscadas também devem ser eventos com maiores intervalos".
  - "você precisa balancear as outras dificuldades também, considerando que nosso Kage é a dificuldade máxima do jogo de referência… Faça a ferramenta que precisa e faça várias simulações".
  - Números de dano curtos: "123148, seria 123.1K".
- **Números de dano:** `damageLabel` (`src/game/format.ts`) mostra 50, 999, 1K, 123.1K, 1M, 1B, 1T, 1Q, Qi, Sx… e depois notação curta (3e36). Os números flutuantes usam esse formato.
- **Recarga por forma, mostrada no Nv 1** (`SHAPE_COOLDOWN`, `src/game/heroes.ts`):
  - corpo a corpo 0,6 s · projétil de 1 alvo 0,8 · órbita 1,0 · cone 1,2 · linha, onda e Em V 1,5 · área 2,0 · Invocação do Sapo 2,6;
  - o Nv 1 deixou de ser punido (antes ×1,55); a recarga cai até −35% no Nv 9;
  - técnicas de buff mantêm a escala antiga (`setupCooldownScale`).
- **Poder por forma** (`SHAPE_POWER`): corpo a corpo ×1,5 · projétil ×1,6 · órbita ×1,3 · cone ×1,35 · linha e onda ×1,45 · Em V ×1,4 · área ×1,4. Os chefes descontam esse fator e batem como antes (`bossCombat.ts`).
- **Vida do monstro comum:** 22 → 13, e por dificuldade 1 / 1,3 / 1,6 / 2 (Genin a Kage) em vez de 1 / 1,4 / 1,9 / 2,6 (`MISSION_HP`, `normalHpFactor`). Elites, Mega Elites e chefes não mudam.
- **Abertura calma** (`OPENING`, `difficultyAt`):
  - nascem 1 / 1,3 / 1,6 / 2 monstros por s no início (Genin a Kage) e a curva se mistura à antiga até os 4 min, quando volta a ser igual;
  - teto de vivos (8 + 10 × min) × fator da dificuldade na abertura;
  - o termo extra de vida das dificuldades altas só começa depois de 2 min e chega ao máximo em 6 min (`HP_RAMP`).
- **Nascimento e emboscadas:** nos 2 primeiros min de cada zona os comuns nascem a 16–24 m (antes 10–18); a 1ª emboscada vem aos 2:30 e depois a cada 50–80 s (antes 30 s e 18–30 s) (`SPAWN_RING`, `AMBUSH_RULES`).
- **Curva longa (calibrada pelo simulador):**
  - XP pedida ×1 até o Nv 10, subindo até ×5 no Nv 60 (`XP_RULES`);
  - XP por abate igual em todas as dificuldades (`xpLoot`); Ryu e chakra continuam maiores nas difíceis;
  - Final Swarm compõe +10%/min × fator da dificuldade (`SWARM_COMPOUND`).
- **Simulador de partidas sem navegador:**
  - `scripts/simulate-run.mjs`: modelo passo a passo de 1 s com as fórmulas do jogo (ameaça, vida, XP, cartas, kunais, Mega Elites, Guardião, Final Swarm, recarga). O desvio do jogador é um parâmetro (casual, médio, bom); a evasão entra à parte.
  - `scripts/simulate-batch.mjs`: 114 personagens × 4 dificuldades × sementes × contas. Gera `artifacts/simulate-<rótulo>.json` (não versionado).
- **Resultado simulado (desvio médio, 2.736 partidas):**
  - antes: cerca de 10% das partidas morriam no 1º minuto; quem passava disparava até 120 min com Nv 5.000–13.000;
  - depois do pacote e da curva: morte mediana da conta máxima entre 46 e 73 min, melhores partidas até 106–120 min; conta nova entre 38 e 73 min; parede do Final Swarm aos ~28–30 min.
- **Limites:** é um modelo, sem posição, obstáculos, ultimate, aliados nem procs de item. A ordem entre dificuldades ainda não é estável (às vezes o Chunin dura mais que o Genin, porque mais monstros dão mais XP).
- **Testes:**
  - 7 testes novos em `tests/balanceamento.test.mjs`; 2 testes de `tests/progressao.test.mjs` e a faixa do Guardião em `scripts/verify-rules.mjs` atualizados para as novas regras; mínimo 139.
  - 6 mutações novas, todas acusadas.
  - **PASSOU:** tsc, 139/139 com cobertura e build.
  - **PENDENTE DE VALIDAÇÃO E2E:** sentir a abertura, as recargas e as emboscadas na partida.

## 15/11/2026 · Ninja do tamanho do monstro e câmera mais perto (Rodada 77)

- **Pedidos do usuário:**
  - "Ninja extramamente pequeno, revise todos, ache os ninjas que estão com esse problema" e "aumente os ninja para ficar do tamanho dos monstros".
  - "Diminuir mais o zoom padrão do jogo, se o usuário quiser pode subir com certo limite, mas o inicial está MUITO distante".
- **Causa do ninja pequeno:** `PLAYER_SIZE = .4` (pedido antigo de reduzir 50% e depois mais 20%) valia para todos os personagens jogáveis. Aliados, clones e Mega Elites já usavam o tamanho normal.
- **Agora:**
  - `PLAYER_SIZE ≈ .72`, calculado a partir da arte: a figura do monstro comum ocupa 83% da célula do atlas de inimigos e o ninja adulto tem 2,32 de altura visível de base.
  - O ninja passa de ~0,63 m para ~1,13 m de altura visível, igual ao monstro comum.
  - O raio de colisão (andar livre, Rodada 70) não mudou.
- **Câmera** (`CAMERA_ZOOM` em `src/game/settings.ts`):
  - Padrão 19 → **12** (mais perto).
  - Limites da roda do mouse e do controle nas Configurações: 10–32 → **8–22**.
  - Migração: quem tinha o padrão antigo (19) salvo vai para 12; outra escolha do jogador fica, dentro da faixa nova.
  - Corrigido junto: a migração antiga da música (v1 → v2) não roda de novo para quem já está na v2.
- **Testes:**
  - 2 testes novos (tamanho do ninja e câmera); o mínimo subiu para 132.
  - 2 mutações novas, a do tamanho verificada à mão (acusada).
  - tsc **PASSOU**; testes e build verificados numa cópia limpa do commit (ver docs/14).
  - **PENDENTE DE VALIDAÇÃO E2E:** ver o tamanho do ninja e o zoom inicial na partida.

## 15/11/2026 · Medição: tempo para matar um monstro com a primeira técnica (Rodada 75)

- **Pedido do usuário:** "faça um teste, em todos os personagens, quanto em média em todas as dificuldades os personagens demoram para matar um monstro usando a primeira skill? Estamos buscando balanceamento de CD."
- **Novo script sem navegador:** `scripts/balance-first-skill.mjs` usa as fórmulas do jogo (`calculateStats`, `difficultyAt`, `attackCooldown`, `techniqueCritical`). Gera `artifacts/first-skill-ttk.json` (não versionado).
- **Hipóteses:**
  - zona 1, monstro comum;
  - sem itens, pílulas, bônus permanentes ou ajudantes;
  - técnica no Nv 1 sem afixos;
  - crítico pela média e 1 acerto por inimigo por uso;
  - 3 cenários: min 0 no Nv 1, min 5 no Nv 10, min 10 no Nv 20 (os níveis são suposição).
- **Resultado (114 personagens):**
  - Média por dificuldade nos 3 cenários: Genin 21,2 s · Chunin 36,7 s · Jonin 61,2 s · Kage 105,3 s.
  - No início (min 0), em Genin: 12,8 s em média, cerca de 6,6 usos; nenhum personagem mata com 1 uso.
  - Spread entre personagens de cerca de 4×: do Madara Seis Caminhos (25,6 s) ao Shikamaru Genin (99,5 s).
- **Achado sobre a recarga:** ela não é individual. Sai só da forma da técnica (Corpo a corpo 1,2 · Área 2 · demais 1,5), × 1,55 no Nv 1, dividida pela velocidade de ataque. A diferença entre personagens vem do poder da técnica e dos multiplicadores de escola.
- Nenhuma regra de jogo mudou.

## 15/11/2026 · Caça-Níquel: retrato de cada personagem das combinações (Rodada 74)

- **Pedido do usuário:** "Ajuste as imagens do caça-níquel de acordo coma roleta e os personagens que rodam com as regras, acredito que temos todos, me confirme."
- **Confirmado:** os 5 personagens das combinações de 3 iguais são jogáveis e têm retrato no jogo: Tsunade, Jiraiya, Hiruzen, Hidan e Kakuzu.
- **Antes:**
  - Hiruzen, Hidan e Kakuzu apareciam como emoji (🏮 🦇 💰) nos rolos, na tabela de chances e no histórico.
  - Tsunade e Jiraiya usavam recortes fixos do atlas `shinobi-roster-v2.png` (corretos, mas fora da regra única).
- **Agora:** `SLOT_HEROES` em `src/game/roulette.ts` liga cada combo ao personagem, e o caça-níquel usa `HeroPortrait`, o mesmo retrato do elenco, com o recorte dos marcadores do mapa. O rosto da Tsunade no topo também.
- As outras 10 casas (kunai, shuriken, Ryu, item, Sorte Grande, bênção, dívida, azar, credores, vazia) já tinham imagem e não mudaram.
- **Testes:**
  - 1 teste novo em `tests/recompensas.test.mjs` (todo combo tem personagem jogável com o nome da casa, e a tela usa o retrato); o mínimo subiu para 130.
  - **PASSOU:** tsc, 130/130 com cobertura e build.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver os retratos nos rolos, na tabela e no histórico.

## 15/11/2026 · Luz e área no Mega Elite caído; farol do pergaminho de boss (Rodada 73)

- **Pedidos do usuário:**
  - "Colocar uma luz nos Mega ELites mortos e uma área ao redor deles pra indicar que estão mortos".
  - "se apertar G, aparecer um pergaminho brilhando com uma luz que mostra no mapa todo, inclusive no tab e no M pra indentificar drop de boss, fazer isso para todos amuletos que dropam dos bosses do jogo".
- **Mega Elite e Shinobi para selar caídos** (`src/scene/fallenShinobi.ts`):
  - **Área de captura no chão:** círculo com o raio do E (10 m, `FALLEN_AREA`), na cor do contorno (vermelho ou ciano), com preenchimento fraco e borda marcada, acompanhando o relevo. Pulsa devagar; no modo H fica fixo.
  - **Facho de luz** mais forte e mais alto (de 3,6 m para 6 m), sem estourar. O halo pequeno de antes continua.
- **Pergaminho de recompensa grátis** (`sealDrop`), em todos os casos: o do G (selamento recusado), os do Guardião (boss da zona) e o do desafio.
  - **Farol** (`src/scene/rewardBeacon.ts`): facho verde de 30 m, sem névoa, visível de longe; brilho em volta do pergaminho e halo no chão. No modo H o facho fica, mais fraco e fixo.
  - **Mapas:** aparece no minimapa (a qualquer distância, preso na borda), no Tab e no M desde que cai, sem precisar ter sido visto. O ícone verde pulsa com brilho. O save restaurado mantém a marcação.
  - O aviso do G agora diz "siga a luz verde do pergaminho".
- **Testes:**
  - 4 testes novos em `tests/cena.test.mjs`; o mínimo subiu para 129.
  - 2 mutações novas (raio da área e altura do farol), as duas acusadas.
  - **PASSOU:** tsc, 129/129 com cobertura e build.
  - **PENDENTE DE VALIDAÇÃO E2E:** ver a área e os fachos na partida, no minimapa, no Tab e no M.

## 15/11/2026 · Jūzō travado: pedido de arte

- **Pedido do usuário:** "Revisar animações do Juzo ingame, está travado, como ajudante tbm."
- **Diagnóstico:** o código escolhe as folhas igual aos outros personagens. O defeito está no desenho da corrida de frente e de costas em `corrida-23.png`, onde as pernas ficam paradas nos 4 quadros.
- **Decisão do usuário:** pedir arte nova, sem paliativo no código.
- **Pedido para o Codex:** `docs/development/PEDIDO-ARTE-JUZO-CORRIDA.md`. Nenhum código foi alterado.

## 15/11/2026 · Qwen encontra o programa de testes

- `QWEN.md` novo, porque o Qwen Code só carrega esse arquivo por padrão. Ele aponta para o `AGENTS.md` e para a política de testes.
- `.qwen/settings.json` (`context.fileName`) faz o Qwen carregar também o `AGENTS.md`.
- O `AGENTS.md` diz onde cada IA lê as instruções. O programa de testes é o mesmo para Claude Code, Codex e Qwen.

## 15/11/2026 · Decisão sobre naturezas e Kekkei Genkai (Rodada 72)

- **Decisão do usuário:** "Se ele não tem natureza, igual no anime/obra/mangá, wiki não liberar."
- **Auditoria:** nenhuma natureza fora da obra está liberada nas 25 famílias com dado canônico. As 9 linhagens da rodada 71 foram conferidas na Narutopedia em 15/11/2026.
- **Anotado para revisar** em `docs/development/DECISAO-KEKKEI-GENKAI.md`:
  - liberar ou não as naturezas da obra (opções A, B e C);
  - as 48 famílias sem dado de natureza;
  - candidatos como o Madara com Ranton.
- Nenhum código alterado.

## 15/11/2026 · Fusões e Kekkei Genkai completas (Rodada 71)

- **Pedidos do usuário:**
  - "Sim, implementar", sobre as pendências de fusão da lista de 11/11.
  - "as fusões/kekkei genkais tem que funcionar para TODOS os personagens que conseguem pegar + de 1 elemento".
  - "Não deve ser possível unir 2 fusões, ou fusão + skill."
- **Duas Kekkei Genkai novas**, com os pares da Narutopedia:
  - **Jiton: Areia Magnética** (Vento + Terra): onda com 40% de lentidão.
  - **Bakuton: Argila Explosiva** (Terra + Raio): área com queimadura e 30% de atordoar.
  - Agora são 8 receitas, uma por par de naturezas.
- **+15% de dano na fusão** (`FUSION_KEKKEI_BONUS`) em dois casos:
  - fusão de duas técnicas da mesma natureza (Neutro não conta);
  - fusão da Kekkei Genkai da própria linhagem (`HERO_KEKKEI`).
- **Linhagens cadastradas:**
  - Haku: Hyōton.
  - Hashirama, Yamato, Madara e Obito: Mokuton.
  - Mei: Yōton e Futton.
  - Rasa: Jiton.
  - Deidara: Bakuton.
  - O Gaara ficou de fora: o jogo já converte o Jiton dele em Areia, e a regra de elemento base impede que ele aprenda Vento.
- **Naturezas da linhagem no pool:** `allowedElements` passa a incluir as naturezas da Kekkei Genkai da linhagem. Antes, Hashirama não alcançava o Mokuton e Haku não alcançava o Hyōton.
- **Combinar** ganha, além do ×1,5, um atributo do par: +10% de dano, +15% de alcance, −10% de recarga ou +5 pontos de chance de status.
  - O status só entra no sorteio se uma das técnicas aplica status.
  - O sorteio é fixo por par, então o planejador mostra o mesmo atributo que a Oficina dá.
- **Bloqueio:** uma fusão ou combinação não entra em outra fusão, nem com uma técnica comum (`isMergedName` na regra pura).
  - Antes o bloqueio existia só na lista da partida e podia falhar ao restaurar uma partida salva.
- **Telas atualizadas:** a Oficina dos Sapos e as cartas do planejador mostram o bônus e o atributo. O glossário e o guia também foram atualizados.
- **Alcance medido:** 18 das 72 famílias chegam a 2 ou mais naturezas no pool. Todas alcançam cada Kekkei Genkai das suas naturezas.
- **Testes:**
  - `tests/fusoes.test.mjs` (8 testes); o mínimo subiu para 125.
  - 5 mutações novas, todas acusadas isoladamente.
  - **PASSOU:** tsc, 125/125 com cobertura e build.
  - A prova por mutação completa não foi rodada.
  - **PENDENTE DE VALIDAÇÃO E2E:** Oficina dos Sapos e cartas do planejador na tela.

## 15/11/2026 · Andar livre: sem paredes invisíveis e dash atravessa (Rodada 70)

- **Pedidos do usuário:** "Verifique ainda as paredes invisiveis e os blocks invisiveis no caminhar do personagem" e "Precisamos andar livre, o máximo que pode ter é travar ao esbarrar, mas ao dar dash conseguir passar."
- **Causas encontradas:**
  - O corpo do jogador continuava com 0,42 m de raio quando o desenho foi reduzido a 40%, ou seja, quase o dobro do sprite (~0,45 m de largura).
  - O tronco da árvore tinha 0,5 m de raio, mas o desenho mede ~0,57 m de largura.
  - Árvores e rochas eram espalhadas antes das casas e monumentos e podiam ficar escondidas atrás ou dentro deles, bloqueando sem aparecer.
- **Correção** (`src/scene/collision.ts`, `src/scene/GameCanvas.tsx`):
  - Novos raios: jogador 0,17 m (0,42 × 0,4); árvore 0,3, pinheiro 0,25, bambu 0,55, rocha 0,85.
  - Novo `solids.prune` remove a árvore ou rocha a menos de 1 m de uma construção, junto com o sprite.
  - Ao esbarrar o jogador só trava e desliza pela borda.
  - Durante o dash não há colisão com cenário nem construções. Se o dash acabar dentro de algo, `solids.exitAlong` tira o jogador pela frente, nunca de volta.
  - Inimigos continuam contornando só as construções.
- **Testes:**
  - `tests/colisao.test.mjs` com 7 testes; o mínimo subiu para 117.
  - 4 mutações novas em `scripts/mutation-check.mjs`, as 4 acusadas isoladamente.
  - **PASSOU:** tsc, 117/117 com cobertura, build.
  - A prova por mutação completa não foi rodada (pesada).
  - **PENDENTE DE VALIDAÇÃO E2E:** andar pela Folha e pelos mapas regionais rente a casas, árvores e monumentos, e dar dash atravessando.

## 15/11/2026 · Cabeça do mesmo tamanho ao começar a andar (Rodada 69)

- **Pedido do usuário:** "A cabeça dos personagens ao iniciar o movimento, estava ficando desproporcional ao personagem e a ele parado, corrija isso."
- **Causa:** ao trocar de folha (parado → correndo), o controlador igualava a **altura da silhueta** do quadro à do repouso. Na corrida com os braços para trás o corpo é inclinado e mais baixo, então o desenho inteiro crescia até 35% e a cabeça junto. Medido nas 2.280 células de corrida das 114 versões: cabeça **20% maior** na mediana e **80% maior** em 5% dos quadros; 110 versões passavam de 15%.
- **Correção** (`src/scene/playerMotion.ts`): a proporção agora iguala a **largura da cabeça** (mediana das linhas do topo 28% da silhueta, medida em 64×64), entre 60% e 135%, com piso de 70% da altura parada para o corpo não encolher demais. Fórmula pura `headProportion`. Vale para todas as folhas (corrida, ataque, pulo, dash), jogador, ajudantes e Mega Elites.
- **Resultado medido:** cabeça correndo ÷ parada com mediana **1,00** (antes 1,20); 90% dos quadros até +25% (antes até +80% em 5%).
- **Testes:** `tests/proporcao.test.mjs` (6 testes; lê os PNG reais no Node), mínimo 110, 2 mutações novas acusadas. **PASSOU:** tsc, build, 110/110. A prova por mutação completa não foi rodada desta vez (≈45 min de CPU); só as 2 novas, isoladamente. **PENDENTE DE VALIDAÇÃO E2E:** ver na tela a troca parado → andando.

## 15/11/2026 · Glossário e saldo na inicial

- Glossário pesquisável por assunto e por termo, com explicações e exemplos sobre dano, críticos, tempo entre golpes, projéteis, status, defesa, economia e aliados.
- O saldo de Lamens aparece entre Arquivo Shinobi e o perfil. A entrada de prévia estática do Naruto saiu da tela inicial.

- Build, verificação de todos os atributos, busca renderizada em Node e 104 testes por código passaram. Validação visual do hub e do guia pendente.

## 15/11/2026 · Guia do jogo

- A tela inicial abre um guia com controles configurados, progressão de missão, eventos com condição e duração, funcionamento dos NPCs e glossário pesquisável.
- O guia usa as mesmas janelas de clima, lista de regiões, opções do caça-níquel e limites de Iruka e dos Sapos Sábios que o jogo. TypeScript, build, renderização em Node e 14 testes de clima e regras passaram. Validação visual no navegador pendente.


## 15/11/2026 · Jutsus, preparo de missão, HUD e ranking

- Banshō Ten’in atrai em onda circular, Chibaku Tensei puxa para o núcleo e Shinra Tensei repele. Chance de status e queimadura no Nv. 1 até 10% antes de buffs; crítico e dano crítico próprios sobem por nível. Cartas mostram a escola e as chances efetivas.
- Fusões param no Nv. 7. Planejador com ícones, efeitos, requisitos na aba Habilidades e comparação com combinação. Seis receitas de Kekkei Genkai, usáveis na Oficina dos Sapos com os ingredientes aprendidos.
- Animação compartilhada de malhas com movimento por natureza e impacto no alvo. Ícones de dōjutsu por portador, validação do recorte dos 114 retratos e troca do quadro de Killer B. A revisão autoral de cada jutsu e a validação em partida continuam pendentes.
- Jogador a 40% da escala visual anterior, terreno a 58% da altura e oclusão pela câmera. Flash vermelho de tela inteira e som ao perder HP. Cursor virtual de menu em 55%. Habilidades e pílulas à direita, inventário à esquerda e ícones centralizados.
- Bolinhos com 2,5% de chance por abate e 50% nos pontos de Ryu. XP por inimigo −12% e surgimento normal até −20% no primeiro minuto de cada zona em todos os ranks.
- Avatar e moldura por conta, apelido configurado visível e cartão da temporada em partida. Base de ranking solo online preparada para Netlify e PostgreSQL. Ambiente hospedado e outros modos seguem pendentes.
- Barra com HP atual e máximo restaura a leitura aos pés quando o terreno deixa o jogador à vista. Ação vermelha Esquecer no Ichiraku e seta do GPS dentro das margens da janela.
- Skill de segurança de publicação compartilhada entre agentes. Skill de jutsus registra selos durante o tempo real de conjuração para qualquer shinobi que lança habilidades.


Validação em 15/11: 104 testes por código com cobertura, TypeScript, builds local e online, teste da função e migração PostgreSQL com 105 perfis. E2E visual pendente.

## 14/11/2026 — temporada, ranking e clãs no hub

- A inicial mostra a prévia da temporada e a posição pessoal. A aba Ranking lista até 100 perfis, com pódio e filtros de região, dificuldade e shinobi.
- Clãs locais podem ser criados, acessados e deixados. A ficha do perfil mostra estatísticas, builds usadas por shinobi e missões recentes. Resultados antigos são migrados com as informações que já guardavam.
- O placar usa os perfis deste navegador. [Proposta para publicação online](docs/development/RANKING-E-CLAS.md). Validação em partida pendente.

## 14/11/2026 — corrida com os braços para trás no elenco

- As 114 versões usam a corrida no deslocamento normal em WASD, com cinco vistas, quatro fases por vista e espelhamento à esquerda. São 2.280 quadros em 57 atlas. Ajudantes e Mega Elites usam a folha da versão. A velocidade e os comandos de ação seguem os parâmetros da missão.
- Atualizado o padrão de criação e revisada a orientação antiga de W/S. A arte foi inspecionada em folhas de contato e submetida a verificação de transparência e quadros únicos. Os 93 testes por código, os tipos e o build passaram. Validação em partida pendente.
- Fusões até Nv. 7, inversão do HUD, ranking com contadores e GPS registrados na fila a pedido do usuário.

## 14/11/2026 — avaliação da animação de corrida

- Registrada a proposta de corrida com braços para trás em todas as versões, com reaproveitamento do controlador de cinco vistas. A alteração é documental.

## 14/11/2026 — cinco vistas de caminhada em todas as versões

- As 114 versões têm quatro quadros para cada uma das cinco vistas de caminhada. W e S selecionam costas e frente; A e D, perfil; as combinações de teclas, três quartos. Ajudantes e Mega Elites compartilham os recortes. Quatro modelos de inimigos comuns também receberam fileiras laterais.
- As fotos da seleção e da ficha usam o mesmo perfil da versão. Hanzō recebe perfil próprio. A normalização preserva a escala de cada ator ao alternar vistas.
- O dash acompanha o vetor das oito direções. Pulo e dash contam com quatro fases de frente e de costas; a maioria das versões ainda precisa de arte lateral e diagonal dedicada. A avaliação visual em partida segue na fila.
- Os 26 atlas novos foram repaginados pelas margens reais da arte. Isso corrigiu 320 células retas que invadiam a margem, com partes da fileira vizinha visíveis em alguns quadros. O teste verifica também a transparência das margens.
- Nova skill de jutsus WebGL com referências e mapa de implementação. Verificação de tipos, build e 93 testes por código passaram.

## 14/11/2026 — direção de caminhada, foco do jogador e correções da fila

- A ficha reutiliza o retrato enquadrado da seleção. Hanzō agora tem roupa cinza-violeta e respirador com dois filtros. Haku recebe túnica verde-azulada, máscara, senbons e novas folhas de movimento. Zabuza usa quatro poses dedicadas para a Névoa Oculta.
- A câmera suaviza rotação, inclinação e zoom em torno do jogador. O herói permanece visível diante do relevo, os inimigos sobrepostos perdem opacidade e o terreno central fica mais aberto, com os marcos e texturas atuais.
- O controlador diferencia a frente, as costas, as diagonais e o perfil quando há arte específica. A altura de referência usa Gaara Genin para crianças e valores próprios para adultos e Zabuza. A auditoria das 114 versões registra a cobertura parcial das vistas específicas.
- A abertura da horda Genin começa com teto de 12 vivos e taxa base de 0,68 por segundo. A rampa volta à densidade anterior no primeiro minuto.
- O portal preserva XP já atraído ou no alcance. O HUD exibe números completos. Colisão de construções usa 18% da largura, com raio máximo de 3 m. O altar tem contorno de 0,28 m e mantém 3 m de raio. Golpe que tira HP aciona borda, pulso da barra e som curto.
- Tipos, build e 92 testes por código passaram. Pendente de validação E2E em partida conforme a política central. A arte lateral, as vistas retas faltantes e o enquadramento em três quartos de todo o elenco seguem na fila.

## 14/11/2026 — folhas de movimento do elenco completo

- Padroniza caminhada, pulo e dash dos 114 jogáveis em quatro quadros por vista. As 58 versões da expansão recebem caminhada em três quartos e novas acrobacias traseiras. A montagem do Naruto Academia e do Manto da Kurama reaproveita as poses principais existentes.
- Ajudantes e mega-elites usam os mesmos recortes das versões jogáveis. Akamaru recebe caminhada e acrobacias de costas, e Kuri recebe quatro fases de acrobacias nas duas vistas. Os quatro inimigos comuns usam atlas em lote com 13 células por vista: quatro de caminhada, uma de ataque, quatro de pulo e quatro de dash.
- As nove bijū recebem folhas traseiras. Enquanto se deslocam, o espelho segue o passo real.
- A validação em partida e a revisão de contagem visual de caudas seguem na fila. Verificação de tipos, build, 85 testes e 26 mutações passaram. A matriz verificou também Akamaru e Kuri.

## 14/11/2026 — orientação e auditoria das 114 versões

- Caminhada e dash do jogador compartilham a seleção da vista e do espelho. Inimigos comuns e Mega Elites usam o vetor real de perseguição para orientar a pose. Kuri só exibe dash se estiver acompanhando o jogador.
- A matriz no Node lê os PNGs e verifica os recortes usados pelo controlador. Caminhada com quatro células por vista em 114 versões. Pulo e dash ainda variam entre 1, 2 e 4 células. Expansão (58 versões) e Asuma repetem as células dianteiras no dash traseiro. A arte pendente está na fila.
- Testes com navegador suspensos para Claude Code, Qwen e Codex conforme a política central. A execução de atlas iniciada antes da mudança passou 1.140 amostras; a revisão visual em partida continua pendente.

- Validação sem navegador concluída: verificação de tipos, build, 83 testes por código e 25 mutações detectadas.

## Rodada 63 · 14/11/2026 — Zabuza faz os selos antes da Névoa Oculta (item 18) e passagem para o próximo agente

- **Selos do Zabuza:**
  - Ele surge à vista, 7 m à frente do jogador, e fica parado fazendo os selos por 2,6 s, com o aviso "Zabuza: Ninpō · Kirigakure no Jutsu!".
  - A névoa engrossa aos poucos; só depois ele e os inimigos somem nela. Mapa, rota e minimapa também só escondem depois dos selos.
  - Regras em `src/game/weatherCast.ts`; configuração em `WEATHER_EVENTS.mist.cast`.
  - Sem arte fiel ainda: usa a pose de conjuração da própria folha. O código está pronto para a folha de selos (`EXTRA_SEAL_SHEETS`); pedido em [docs/development/PEDIDO-ARTE-ZABUZA-SELOS.md](docs/development/PEDIDO-ARTE-ZABUZA-SELOS.md).
- **Testes:** `tests/clima.test.mjs` (7). **PASSOU:** tsc, build, 80/80 e mutação 24/24. **PENDENTE DE VALIDAÇÃO E2E:** ver a cena no mapa da Névoa.
- **Passagem:** o usuário vai continuar com outra IA. Fila completa em [docs/26-PASSAGEM-PARA-O-PROXIMO-AGENTE.md](docs/26-PASSAGEM-PARA-O-PROXIMO-AGENTE.md):
  - itens do tester (XP, colisão, borda do altar, dano);
  - artes pendentes;
  - skill de jutsus;
  - validação E2E;
  - decisões do usuário.

## Rodada 62 · 14/11/2026 — névoa do Zabuza sem quadrados brancos (item 17)

- **Pedido do usuário:** "Corrija a névoa do bug do Zabuza…" (print com dezenas de quadrados brancos e cinza e um laranja).
- **Causa:** os monstros comuns são desenhados em lote (instâncias). O sprite próprio de cada um é criado **sem textura** e só sai da cena quando o lote é sincronizado. Durante a névoa, o jogo deixa de sincronizar os comuns (para escondê-los), então os que **nasciam durante a névoa** ficavam na cena como quadrados brancos. Os cinza estavam mais longe, apagados pela névoa; o laranja era um elite.
- **Correção na raiz** (`src/scene/enemyRenderer.ts`): o sprite adotado pelo lote nunca é desenhado sozinho (`material.visible = false`). O lote continua lendo posição, escala e cor. Vale para qualquer situação, não só para a névoa.
- **Testes:** `tests/inimigos.test.mjs` (4 testes com o renderizador real no Node), incluindo o caso "nasce durante a névoa"; mutação nova acusada. **PASSOU:** tsc, build, 73/73 e mutação 22/22.
- **PENDENTE DE VALIDAÇÃO E2E:** ver a névoa na tela, no mapa da Névoa.

## Rodada 61 · 14/11/2026 — padrão único de caminhada: diagnóstico das 114 versões (item 15b)

- **Pedido do usuário:** "os primeiros… estão andando com uma animação… e os últimos que criamos estão andando de outro. Preciso de um padrão para TODOS."
- **CONFIRMADO:**
  - O código está certo: as 114 versões têm andar de frente e de costas, ataque, pulo e dash ligados. Naruto Academia e Asuma usam atlas próprios.
  - A diferença está no **desenho**. O padrão (Naruto Academia, Kakashi e os primeiros 56) desenha a caminhada **de três quartos, virada para a direita**.
  - As **58 folhas `*-roster-v1.png`** das rodadas 53–54 desenham a caminhada **reta para a câmera** e reta de costas. Por isso, andando para o lado, os novos não viram para onde andam.
- **Arte pendente (Codex):** redesenhar só as fileiras 1–2 dessas 58 folhas no padrão. Pedido com a lista completa e as referências em [docs/development/PEDIDO-ARTE-CAMINHADA-PADRAO.md](docs/development/PEDIDO-ARTE-CAMINHADA-PADRAO.md). Não precisa mexer em código: basta substituir o PNG.
- **Novo `scripts/audit-walk-sheets.mjs`** (sem navegador): lê os PNG e mede a silhueta das fileiras de caminhada de todas as versões. É uma medida auxiliar; a confirmação final é olhando a folha.
- **Skill `movimentar-shinobi`:** padrão único de caminhada registrado como regra.
- **Fila:** entram os itens novos do usuário (névoa do Zabuza e selos) e do tester (XP, colisão, borda do altar, feedback de dano).

## Rodada 60 · 14/11/2026 — botão "Arquivo Shinobi", tela branca e varredura do material de referência

- **Botão branco no topo do hub** (usuário: "o que é o botão branco ali? simplesmente não consigo ver, mudar a cor e deixar parecido com os outros"). Era o **Arquivo Shinobi**: sem fundo próprio, ficava com o fundo branco do navegador e o texto branco do `.button`. Agora usa a mesma placa de madeira do perfil ao lado (`src/ninja-theme.css`). Novo teste: os botões do topo precisam ter fundo próprio.
- **"Por que não consegui abrir pelo ABRIR_JOGO?"** O servidor estava no ar (a janela mostrava o Vite atualizando arquivos). A página branca era a aba aberta enquanto o código era editado; o print seguinte do usuário já mostra o hub carregado. Todos os módulos do jogo carregam sem erro no Node (verificado). Se acontecer de novo: **Ctrl+F5** na aba.
- **Material do jogo de referência** (usuário: "Confira se temos referência… na pasta do projeto… precisa ficar em uma pasta fora"). Não havia vídeos, prints, executáveis ou pastas do jogo de referência no projeto. O único rastro era o protótipo antigo `history/v03_ShinobiBonk_v03_corrigido.zip`, que citava o nome numa linha interna. Ele foi **movido intacto** para a pasta externa arquivada e removido do repositório. O teste de zero rastro agora procura o nome também **dentro dos .zip** rastreados.
- **PASSOU:** tsc, build e 69/69 testes.

## Rodada 59b · 14/11/2026 — bijū de frente e de costas: código pronto, arte pendente (item 15)

- **Código pronto:** `src/scene/bossCombat.ts` troca para a folha de **costas** quando a bijū anda para dentro da tela, com a mesma histerese do jogador (vira acima de 0,26, volta abaixo de 0,1; parada mantém a vista). Usa a direção da câmera (`viewForward` = v1).
- **Sem 404:** a folha de costas só é carregada se estiver registrada em `BIJUU_BACK_SHEETS` (`src/game/bijuu.ts`), que hoje está **vazia**. Enquanto isso, nada muda na tela.
- **Arte pendente (Codex):** pedido detalhado em [docs/development/PEDIDO-ARTE-BIJUU-COSTAS.md](docs/development/PEDIDO-ARTE-BIJUU-COSTAS.md) — 3 páginas `motion-costas-v1-1..3.png` no mesmo layout 1024×768 (4×3 células de 256×256) e uma linha de registro.
- **Testes:** 4 testes novos com folha falsa (afastar → costas, parar → mantém, voltar → frente, sem arte → sem carregar); 1 mutação nova. **PASSOU:** tsc, build, 67/67 e mutação 21/21.

## Rodada 59 · 14/11/2026 — aparecimento e animação das bijū (item 14 da fila)

- **Pedido do usuário:** "Corrigir o aparecimento das bijuus, animação."
- **Três defeitos corrigidos** (`src/scene/bossCombat.ts`):
  1. **Troca de arte ao nascer:** a bijū aparecia com a arte antiga (`bijuu-atlas-v1`, outro tamanho) até a folha de movimento carregar e então trocava. Agora já nasce com a folha `bijuu/motion-v1-*`.
  2. **Restos de outras poses nas bordas:** o atlas gerava mipmaps, que de longe misturam os quadros vizinhos. Agora usa filtro "nearest" sem mipmaps, como as folhas dos shinobis.
  3. **Esticada:** as células do atlas são quadradas (256×256), mas o sprite era 5 × 5,5. Agora largura = altura (`BIJUU_SIZE` = 5,5).
- **Entrada nova (só visual):** surge do chão em 1,2 s (`BIJUU_ARRIVAL`: tamanho de 35% a 100% e opacidade de 0 a 1), com dois anéis de chakra no ponto de surgimento; os anéis não aparecem no modo H. Dano e tempo de ataque não mudam.
- **Limite de arte:** as bijū espelham para o lado do jogador e alternam passos, mas **não têm vista de costas** — falta arte (item 15, Codex).
- **Testes:** `tests/bijuu.test.mjs` (7 testes com a lógica real do combate no Node); 3 mutações novas. **PASSOU:** tsc, build, 63/63 e mutação 20/20.
- **PENDENTE DE VALIDAÇÃO E2E:** ver a entrada e a animação na arena da bijū.

## Rodada 58 · 14/11/2026 — mouse preso na missão (item 13 da fila)

- **Pedido do usuário:** "O jogo deve prender o mouse na tela, ficar como foco principal... apenas se dermos alttab ou tecla Windows, sair, ai o jogo pausa normalmente."
- **Causa:** o laço do jogo soltava o ponteiro (`exitPointerLock`) sempre que abria uma tela por cima do jogo (cartas de nível, roleta, selamento, NPCs, mapa, ficha P). Com o cursor solto, o mouse podia sair da janela.
- **Correção — cursor virtual** (`src/scene/virtualCursor.ts`):
  - Durante a missão o ponteiro continua preso também nessas telas.
  - Uma kunai virtual, movida 1:1 pelo mouse, faz o papel do cursor: passa por cima, clica (só quando aperta e solta no mesmo elemento), botão direito e roda do mouse nas listas.
  - A kunai nasce no centro da tela, onde as cartas aparecem, e não sai da janela.
- **O que solta o mouse:**
  - Alt+Tab, tecla Windows ou janela escondida: o mouse sai e o jogo pausa (como antes).
  - Debug, derrota e vitória: o mouse é solto.
  - **Esc:** o navegador sempre solta o ponteiro (regra dele) e o jogo abre a pausa. No .exe (Electron) dá para prender de verdade.
- **Testes:** `tests/cursor.test.mjs` (10 testes, DOM simulado no Node); cobertura de `virtualCursor.ts` em 100% das linhas e 92% dos caminhos; 3 mutações novas. **PASSOU:** tsc, build, 56/56 e mutação 17/17.
- **PENDENTE DE VALIDAÇÃO E2E** (navegador suspenso para o Claude Code), ver na prática:
  - escolher cartas, roleta, selamento e NPCs com a kunai virtual;
  - mapa e ficha P;
  - Alt+Tab e tecla Windows pausando;
  - voltar ao jogo.

## Correção do teto de monstros · 14/11/2026

- **Teto de monstros vivos = 1.600** (correção do usuário: "nosso cap máximo de monstros é 1600"). O código já usava 1.600; AGENTS.md, TESTING_POLICY.md, docs/13 e docs/18 diziam 1.500 e foram corrigidos. Novo teste trava o teto em todas as dificuldades, no Final Swarm e com +% de inimigos (46 testes, PASSOU).

## Rodada 57 · 14/11/2026 — fontes da HUD maiores

- **Pedido do usuário:** "Aumentar um pouco as fontes, mas manter o hud organizado... tem algumas fontes muito pequenas, melhorar isso."
- **369 tamanhos ajustados em 20 arquivos CSS**, em degraus pequenos e só onde a leitura era difícil:

  | Antes | Depois |
  |---|---|
  | 7 / 7,5 px | 10 px |
  | 8 px | 10,5 px |
  | 9 px | 11 px |
  | 9,5 / 10 px | 11,5 px |
  | 10,5 / 11 px | 12 px |
  | 12 / 12,5 px | 13 px |
  | rem pequenos (0,67–0,76) | 0,75–0,8 rem |

  Títulos e textos de 13 px ou mais não mudaram.
- **Checagem estática:** nenhuma caixa com altura ou entrelinha fixa ficou menor que o texto novo.
- **Novo `tests/interface.test.mjs`**, que vira trava permanente:
  - piso de 10 px para todas as fontes;
  - texto sem corte nas caixas fixas;
  - os arquivos CSS foram encontrados.
- **Testes:** mínimo de testes passa a 45; uma mutação nova (fonte de 7 px na HUD) foi acusada.
- **PASSOU:** `tsc`, build, 45/45 testes e prova por mutação 14/14.
- **PENDENTE DE VALIDAÇÃO E2E** (navegador suspenso para o Claude Code): ver na tela, em 1280×720 e 1600×900, se a HUD continua organizada. Atenção a slots, contadores do inventário, cartões de ajudantes e minimapa.

## Rodada 56 · 14/11/2026 — testes por código confiáveis e política central de testes

- **Política central** em [docs/development/TESTING_POLICY.md](docs/development/TESTING_POLICY.md): navegador (§A), camadas (§B), stress planejado (§C), confiabilidade (§D), métricas (§E), perfis LEVE/EQUILIBRADO/PROFUNDO (§F), controle de execução (§G) e status de relatório (§H). `AGENTS.md` (todos os agentes) e `CLAUDE.md` (só Claude Code) apontam para ela. **A restrição de navegador vale só para o Claude Code** (decisão do usuário); Codex/Qwen mantêm a rotina atual.
- **Lógica extraída do `GameCanvas` para módulos puros testáveis**, sem mudar o comportamento:
  - `buildAltarOffers`, `extraStrikes` e `altarLuckMultiplier` em `src/game/altarRewards.ts` (o pool e as bases do altar foram para lá);
  - `zoneThreat` e `zoneCurse` em `src/game/progression.ts`;
  - `magnetSpeed` em `src/game/drops.ts`;
  - o acerto do Cone passou a usar a mesma constante `CONE_COS` da área desenhada.
- **Testes reescritos por comportamento** (antes vários só procuravam texto no código): 42 testes em 6 arquivos, cobrindo:
  - fórmula exata do HP nos níveis 1–3000 e nas 114 versões;
  - zona nova = início da zona 1 × multiplicador, nas 4 dificuldades;
  - +% de inimigos com tetos;
  - 4.000 bênçãos por raridade com semente fixa;
  - golpes extras e chance observada;
  - migração da música (4 cenários + save corrompido);
  - queda, luz e modo H do Mega Elite caído com Three.js no Node;
  - expiração e reaproveitamento das áreas das técnicas;
  - simulação do voo do ímã;
  - ausência do nome do jogo de referência.
- **`scripts/run-tests.mjs`**: sequencial, 120 s por arquivo, registra ambiente/commit, recusa teste com navegador. Falha com:
  - qualquer falha, skip, todo ou cancelamento;
  - arquivo sem testes;
  - total abaixo de `tests/minimo.json`;
  - cobertura abaixo do mínimo (altarRewards 100%/100%/97%, drops 100%).
- **`scripts/mutation-check.mjs` (prova dos testes):** estraga 13 regras de propósito e exige que os testes acusem cada uma. Resultado: 13/13 acusadas; arquivos restaurados.
- **Perfis:** `TESTAR_JOGO.bat [leve|equilibrado|profundo]`; `npm test`, `npm run test:leve`, `npm run test:mutacao`.
- **PASSOU:** perfil leve (42/42, 2,5 s), equilibrado (tipos + 42/42 com cobertura + build) e prova por mutação (13/13). **NÃO EXECUTADO** (navegador suspenso para o Claude): `verify-runtime`, `verify-motion-atlases`. **PENDENTE:** simulação headless e stress de 1.500 monstros (proposta na política).

## Rodada 55 · 14/11/2026 — caminhada, Mega Elite caído, HP, projéteis, zonas e testes sem navegador

Lote do usuário de 13/11 (pedido integral em docs/14 e em [docs/25](docs/25-RETOMADA-LOTE-13-11.md)). Feito em parte por subagentes e concluído pelo Claude Code, uma tarefa por vez.

- **Caminhada (WASD × câmera):** nova `stableFacing` com histerese (`playerMotion.ts`) em ajudantes, clones, Kuri e monstros, sem piscar entre frente e costas nem no espelho. Monstros usam a folha de costas também na diagonal. Bijū espelham pela direita da tela e só alternam os passos quando de fato se deslocam (`bossCombat.ts`). Medição feita no navegador antes da suspensão desses testes: jogador certo nas 8 direções × 4 ângulos; ajudantes e Mega Elites certos; monstros 33/35. **PENDENTE de arte:** as bijū não viram de costas, porque o atlas `bijuu/motion-v1-*` só tem vista lateral.
- **Mega Elite caído** (`src/scene/fallenShinobi.ts`): cambaleia, cai e fica deitado com halo suave no chão, na cor do contorno (vermelho para Mega Elite, ciano para Shinobi para selar). Aparece com ⛓ no minimapa/mapa e é capturado com **E** até 10 m (G recusa). Restaurado já deitado ao retomar a run.
- **Áreas das técnicas** (`src/scene/techniqueAreas.ts`): contorno + preenchimento no chão com o alcance real do golpe; opção **Configurações → Gráficos → Mostrar áreas das técnicas** (padrão ligado; com H fica só o contorno).
- **Música** padrão 70% → **10%**; quem tinha o padrão antigo e nunca mexeu migra para 10%, e volumes escolhidos são mantidos.
- **Câmera:** piso do ângulo 0,05 → 0,03 rad; a encosta pode cobrir até a canela antes de o ângulo subir; plano distante dinâmico; sem a trava de altura que inclinava a vista.
- **HP por nível (PROPOSTO):** `1 + 0,04n/(1+n/150)` (`HP_GROWTH`). Naruto sem itens: Nv. 100 361→193 · Nv. 415 2.961→308.
- **Projétil nas recompensas:** sai "+35% de chance de projétil extra" do altar. Raro +1, Épico +2, Lendário +3 projéteis/golpes; Comum e Incomum não sorteiam projétil (`src/game/altarRewards.ts`). `projectiles` agora também repete o golpe nas técnicas corpo a corpo/área (0,14 s depois; Ultimate fora).
- **Troca de zona:** a progressão dos monstros (HP, dano, vivos, spawn, Final Swarm, Mega Elite) usa o tempo **da zona** e recomeça do minuto 0, com ×1,18 (Z2) / ×1,38 (Z3), a dificuldade e os +% de inimigos/ameaça por cima.
- **Ímã do morro de bolinhos:** drop puxado pelo ímã global chega em ≤ ~1,2 s de qualquer ponto do mapa.
- **Testes sem navegador (pedido do usuário):** nova pasta `tests/` (`node:test`, módulos do jogo carregados pelo Vite dentro do Node), `TESTAR_JOGO.bat` (tipos + testes + build) e `npm test`. Política em `CLAUDE.md`: o Claude Code não abre navegador para testes até nova autorização. `verify-runtime` atualizado para as texturas `motion-v1` das bijū.
- **TESTADO:** `tsc -b`, `vite build`, `verify-rules` (114/213/95) e `tests/` (22 testes, 0 falhas).
- **PENDENTE DE VALIDAÇÃO E2E** (o navegador está suspenso): visual do corpo caído com o halo (perto, longe, névoa); áreas das técnicas em combate; câmera deitada perto de morros e bordas; caminhada com a GPU real; `verify-runtime` completo (a última execução parou no passo de configurações/câmera do Kimimaro, linha ~628, e deve ser revista na reativação).
- **Não feito:** aumento das fontes da HUD (próxima tarefa).

## Rodada 54 · 13/11/2026 — trabalho do Codex retomado e publicado pelo Claude Code

O Codex parou com esta rodada sem commit (última edição 08:48 de 13/11). Publicada como estava, após validação:

- **Elenco: 96 → 114 versões.** Akatsuki: Deidara, Hidan, Kakuzu, Konan, Zetsu, Jūzō e Orochimaru Akatsuki (família Orochimaru, forma 30). Som: Kabuto e Kabuto Sábio do Dragão, Kimimaro, Quarteto do Som (Jirōbō, Kidōmaru, Tayuya, Sakon e Ukon) e Trio do Som (Dosu, Zaku, Kin). Taka: Jūgo. Cada um com missão, passiva, kit, Ultimate e folha `*-roster-v1.png`.
- **Arte:** folhas v3 de movimento dos três Gaaras, atlas de movimento das bijū, inimigos andando de costas, 5 atlas de retratos da seleção, efeitos por facção e do Kabuto, ícones da Pílula ANBU, Pílula de Incenso e Chute Giratório, cartões de informação ninja.
- **Balanceamento (aguardando teste do usuário):** HP inicial ~57 (50–68 por personagem; antes 85); escala de dano por nível 0,74 no Nv. 1 e ~14–15 no Nv. 50; recarga de setups ×1,55; ganhos menores das passivas permanentes (regen/área/Ultimate).
- **Regras de técnicas:** afinidade de elemento não ensina mais técnica exclusiva de outro shinobi (ex.: Jōki Bōi, Agulhas de Karasu, Mil Braços).
- **Interface:** novo `src/ui/ArsenalControls.tsx`; mudanças no Plano de build, seleção de shinobi, mapa, Bolsa e tema ninja.
- **TESTADO** (Claude Code, 13/11 09:40): `tsc -b`, `vite build`, `verify-rules` (114 versões, 213 técnicas, 95 itens). `verify-runtime` não executado nesta publicação. Documentação temática desta rodada não foi escrita pelo Codex: registrar detalhes ao revisar.

## Rodada 53 · 13/11/2026 — elenco, animações e efeitos

- Expande o elenco com 40 versões jogáveis. Cada versão tem missão, passiva, kit, retrato, caminhada frontal e traseira, ataque, pulo e dash. Adiciona Akamaru e o aumento de tamanho do Chōji durante o Jutsu de Expansão. Revisa os cargos pela obra e retira três kits de fundadores inventados.
- Integra dois atlas com 32 motivos de efeitos ao combate, ícones e prévia, preservando os caminhos dedicados de clones, Gamabunta, Susanoo e Shinra Tensei. Corrige a reativação das partículas pela tecla H. As técnicas usam efeitos por nome, motivo ou elemento. A revisão de fidelidade individual continua na fila.
- Na Névoa Oculta, a partir de 1:10 de cada zona, a névoa engrossa durante 16 s a cada 110 s e pode trazer Zabuza como Mega Elite. A aparição evita duplicatas da família.
- Conclui a Fase 4: Células de Hashirama (35%) e Chakra de Hagoromo (60%), com PNGs exclusivos e migração dos nomes de itens nas runs salvas. Pílulas: 9 níveis de base, 13 com Farmacologia Ninja e 15 com a Cabaça. Mantém 6 tipos por run. O HUD mostra o total de abates.
- Verificações de movimento cobrem 96 versões e 960 estados. O Edge passou 62 verificações de fluxo, sem exceções JavaScript nem respostas 404. A suíte checa pixels não vazios, caminhada frontal/traseira e dash espelhado. Os prompts usados pela ferramenta de imagem estão em [docs/arte-elenco-rodada-53.json](docs/arte-elenco-rodada-53.json).

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

- **Áudio:** a Home tenta iniciar a faixa de abertura no carregamento. A faixa continua enquanto o jogador navega pelo hub. Se o navegador bloquear a reprodução automática, a primeira interação libera a mesma faixa e a Home exibe **Ativar música** enquanto ela estiver bloqueada.
- **Drops e HUD:** o Ryu de abates tem moeda dourada com 両. O bolinho de arroz recupera **35% do HP máximo** por padrão, com chance de até **5% por abate**. O morro continua sendo um ponto interativo separado. Os drops atraídos têm 55% do tamanho anterior no chão e cerca de 40% ao voar até o jogador. O HP aparece por inteiro no HUD e na barra sob os pés.
- **Planejamento:** quatro seções com ícones e contagem, listas de habilidades e cartões de pílulas e itens. **Táticas de Missão** abre pelo topo. Aplique uma tática, edite o plano e clique em **Atualizar** nela para salvar a edição. O antigo menu da bolsa agora se chama **Arsenal de Missão** e as listas por shinobi ficam selecionáveis no mapa. O seletor de tática também está na preparação.
- **Configurações:** acesso pela Home e pelo Esc da run. **Reset de conta** fica em **Configurações → Conta**, com confirmação dentro do jogo.
- **Altares:** estrutura e círculo seguem a cor de raridade. A bênção sorteia um atributo ofensivo e um de utilidade/defesa. A partir de Raro, sorteia um terceiro sem repetição. Os atributos entram diretamente ao completar o círculo e continuam na run salva. Os cartões de recompensa usam a cor da raridade em toda a área do ícone.
- **Selamento:** o Mega Elite derrotado fica no chão. Aproxime-se até 10 m e use **E**. A configuração atual decide se abre o ritual ou sela diretamente. A troca com equipe cheia e a recusa dentro do ritual continuam disponíveis. O corpo da armadilha tem uma arte própria.
- **Combate e artes:** Shinra Tensei é a Ultimate do Pain, com levitação, ondas radiais, destroços e repulsão. Chibaku Tensei ocupa o antigo lugar na lista de técnicas e ganha rochas convergentes. O Susano’o azul do Madara usa um atlas de quatro fases em cima da base 3D. Kuroari e a marionete do Terceiro Kazekage têm folhas próprias no campo e na prévia. Kaiten, Palmas Protetoras, Oito Trigramas, Leões Gêmeos, técnicas de sepultamento e Kamui ganharam efeitos reconhecíveis. Sasori ainda está fora do elenco jogável e a marionete aparece em Mil Braços do Escorpião, no kit de Kankuro.
- **Movimento:** três novas folhas de ataque, pulo e dash em frente e costas, para Sasuke Genin, Neji e Neji Shippuden. A verificação de atlas passou em **56 versões e 560 estados**, incluindo fileiras distintas de caminhada em frente e costas. A revisão manual de qualidade de cada ataque, Ultimate, ícone e ajudante continua na fila.

**Validação:** TypeScript, build, regras de elenco/catálogo e verificação das 56 versões (560 estados, sem erros ou 404 no teste de atlas). Teste no Edge confirmou autoplay na abertura quando permitido, a seleção de tática/arsenal no mapa, a cura de 35% e o selamento por E dentro do alcance.

**Teste em jogo:** Suíte completa no Edge: 62 verificações, 0 exceções JavaScript e 0 respostas 404. Testes dirigidos também confirmaram Shinra Tensei por R com dano e altar comum com um atributo ofensivo e um de utilidade/defesa.

**Fila:** [docs/13](docs/13-PENDENCIAS-PARA-CONTINUAR.md) e [auditoria de efeitos](docs/24-AUDITORIA-DE-EFEITOS.md).

## Rodada 51 — 7 pedidos: ataques inimigos voltam a Kunai/Shuriken · altares dão bênção (buffs aleatórios por sorte/qualidade) · tiles da ficha em marrom · Netlify ok (zip novo) · .exe (proposta) · 12/11/2026

- **IMPLEMENTADO (item 1 — “Houve uma alteração do Qwen seu novo parceiro de desenvolvimento que alterou os ataques dos monstros que eram Kunais/Shurikens para Pergaminhos, não é pra você fazer isso cara”):** `src/scene/dropSprites.ts` — novos tipos de projétil inimigo **`enemyKunai`/`enemyShuriken`/`enemyShurikenFuma`** (kunai de aço em pé com ponta na direção do voo, sulco central, cabo com furo; shuriken reaproveita `drawShurikenShape`) + `DRAW` + cabeceiro atualizado; `src/scene/GameCanvas.tsx` — o projétil agora usa `makeDropSprite(weapon===0?'enemyKunai':weapon===2?'enemyShurikenFuma':'enemyShuriken',0)` (resto da linha — scale/fuma/cor/rotação — intocado). **Os PERGAMINHOS DO CHÃO PERMANECEM** como recompensa (pedido do próprio usuário na Rodada 49 — ele reclamou só dos ataques). Bônus: `makeDropSprite` agora seta `sprite.userData.shared=true` → o `disposeObject` (techniqueEffects.ts) **não descarta mais o material compartilhado** do cache na limpeza de projéteis (evita re-link GL a cada tiro; alinha com o comentário “Nunca descarte” da `dropMaterial`).
- **JÁ EXISTE (item 2 — “Cadê a ficha de personagem no P/ESC durante a partida?”):** `src/ui/RunSheet.tsx` tem a coluna **“Ficha do personagem · Status da run”** (1ª das 3 colunas, Rodada 50). O print do usuário com 2 colunas é da **build STALE do Netlify** (zip de 11/11, anterior à Rodada 48). → resolvido com o re-upload do zip novo.
- **JÁ OK (item 3 — “Erro ao tentar iniciar o jogo” — PARSE_ERROR `RunSheet.tsx:5308`):** não existe no código atual (`tsc -b` ✓ · `vite build` ✓); é artefato do bundle antigo (11/11). O novo zip resolve.
- **VERIFICADO E CORRIGIDO (item 4 — “Verifique se temos index para quando formos subir a pasta no Netlify”):** `index.html` existe na raiz do projeto e na raiz do `dist/`; `netlify.toml` válido (build `pnpm install --frozen-lockfile && pnpm exec vite build` · publish `dist` · redirect SPA). O `Shinobibonk-netlify.zip` da raiz do workspace era **STALE** (JS de 11/11) — foi **rebuildado e reempacotado** com o build atual (`index.html` + `assets/` na raiz do zip, 371 arquivos, 235 MB). **O usuário precisa RE-UPAR no Netlify.**
- **PROPOSTO, NÃO IMPLEMENTADO (item 5 — “me diga se você já consegue criar um executável seguro do nosso game, mesmo que ele abra pelo browser dentro do aplicativo”):** sim, é viável — o jogo é 100% web (React 19 + Three.js + Vite), então o caminho natural é um **wrapper de navegador embutido**: **Electron** (+ electron-builder → .exe Windows; mais maduro, Chromium interno — o mesmo padrão do jogo de referência) ou **Tauri** (binário menor, WebView do sistema). Os controles atuais (pointer lock, teclas, áudio, saves) já funcionam; o Electron só embutiria o `dist/`. **NÃO implementar sem aprovação do usuário** (escopo: apenas a pasta do projeto; nada de instalação no Windows).
- **IMPLEMENTADO (item 6 — “Esses lugares mais claros, você tem que colocar marrom igual a ficha do personagem”):** `src/ninja-theme.css` — `.sheet-tile` saiu do creme (`--papel-claro`) para **marrom-tan** (`linear-gradient(180deg,#c8a76a,#a07f42)`, mesma família da coluna “Ficha do personagem” papel2→papel3, um pouco mais escura para destacar) + borda `--madeira-borda` + **texto escuro** `var(--tinta)` em h3/p/`>small` (`h3 small` em `#245e8f`); `.positive` (verde, `!important`) sobrevive.
- **IMPLEMENTADO — valores PROPOSTOS (item 7 — “Os altares não são para dar itens, mas buffs aleatórios de acordo com sua sorte/qualidade do altar”):** `src/scene/GameCanvas.tsx` — novas constantes `ALTAR_BUFF_BASE=[.05,.08,.12,.18,.25]` (Comum→Lendário) + `ALTAR_BUFF_POOL` (14 `StatKey`: damage/crit/critDamage/attackSpeed/move/area/cool/exp/gold/dodge/defense/regen/health/luck) após `ALTAR_RULES`; o bloco de conclusão do altar (que escolhia **ITENS** via `eligibleItemPool`/`drawStock`/`toOffer`) foi substituído por: 2 atributos sorteados (3 no tier≥2), magnitude = base × escala do atributo × `(1+min(1.2,max(0,stats.luck−10)×.02))`, aplicado em `runBuffs[key]` + `refreshStats(true)` + `playSfx('pickup')` + toast “…bênção: …”. **Sem tela de escolha.** `eligibleItemPool`/`drawStock`/`toOffer`/`altarRarities` continuam usados em outros fluxos (mercador/roleta/nomes de eventos) — sem import órfão.
- **REGRA “ZERO RASTRO” do jogo de referência (pedido permanente do usuário, 11/11) — redação aplicada nesta rodada:** o nome do jogo de referência aparecia em `docs/14` (pedido da Rodada 51) e em `docs/23` (regras de git) — substituído por “jogo de referência” (regra: nada de arquivo, nome ou valor do jogo de referência em lugar nenhum do repositório).

### Decisões (aguardando teste do usuário — regra: nunca calibrar sem ele)

1. **Altares = bênção** (PROPOSTO): 2–3 atributos aleatórios, magnitude Comum 5% → Lendário 25% (× escala do atributo) × sorte (acima de 10, +2% por ponto, teto +120%), direto em `runBuffs` (mesmo padrão da roleta/NPCs — não entra no `SavedRun`; `refreshStats` recalcula sempre das fontes); **substitui** a regra antiga da Rodada 12 “altar 100% abre escolha de itens”.
2. **Ataques inimigos = Kunai/Shuriken** (pedido do usuário); **pergaminhos do chão permanecem** como recompensa (Rodada 49) — visuais separadas (projéteis inimigos vs pickups do chão).
3. **.exe = PROPOSTA** (Electron/electron-builder ou Tauri) — não implementar sem aprovação do usuário.
4. **Tiles marrom** = gradiente `#c8a76a→#a07f42` + texto escuro (tons exatos = escolha do agente; o pedido do usuário era “marrom igual a ficha do personagem”).

### Validado

`tsc -b` (exit 0) · `vite build` (exit 0 — dist novo: `index-DxLQdvr3.js` 1,28 MB) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (0 erros · 0 assets faltando · 1.600 inimigos instanciados) + **zip Netlify novo** (371 arquivos, `index.html` na raiz do zip — verificado via `System.IO.Compression`).

## Rodada 50 — 4 pedidos: morros de arroz coletados com E (sem auto-coleta) · escada de monstros vivos reduzida ~40% no early game (progressiva + %inimigos de itens/debuffs) · 1º mega elite ~9,5 mil HP ±5% · ficha de status do personagem de volta na pausa · 12/11/2026

- **IMPLEMENTADO (item 1 — “os bolinhos de arroz você colocou para passar em cima e pegar automático, retire isso”):** `src/scene/GameCanvas.tsx` — o **morro de arroz (Ryu) NÃO é mais auto-coletado ao pisar** (pedido do usuário; substitui a auto-coleta da Rodada 49 — a mais recente prevalece): (a) o filtro de auto-coleta ao pisar agora **exclui `ryu`** — o único que segue auto-coletado é o drop do mega elite derrotado (`sealDrop`); (b) **o E coleta o morro**: o filtro de `bestPickup` em `interact()` agora **inclui `ryu`** (→ `collectPickup`: Ryu + ímã 10 s + lamen de cura — comportamento da Rodada 49); (c) o hint de interação mostra **“E · colher morro de arroz · Ryu por zona/missão/sorte + ímã 10 s + lamen de cura”** (o `pickups.find` do snapshot inclui `ryu`).
- **IMPLEMENTADO (item 2 — “114 é um número bem expressivo… Diminua um pouco a escada de progressão de quantidade de monstros vivos no início da partida, mas faça ser progressivo tempo+%inimigos por itens/debuffs”):** `src/game/progression.ts` — `ENEMY_SCALING`: **capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8** (redução ~40% no início; **PROPOSTO**). Nova escada (Genin): **1 min = 91 (era 156) · 5 min = 391 (era 670) · 8 min = 695 (era 1.189) · 10 min = 936 (era 1.600) · teto 1.600 atingido aos ~15 min (era ~10 min)**. O **%inimigos de itens/pílulas/debuffs** (`enemyCount`: Incenso Repelente −8% · Flauta Provocadora +12% · Pílula de Incenso +10% · Isca Shinobi +15%) **JÁ multiplica o cap** via densidade em `GameCanvas.tsx` (`threatNow`) — a progressão por buffs **se mantém**; só a escada-base ficou mais suave. Asserções ajustadas em `verify-rules.mjs` (695@8 min · 936@10 min · 1.600@15 min).
- **IMPLEMENTADO (item 3 — “o primeiro mega-elite nascer com 20K de vida também é um número elevado, deveria ser cerca de 9 a 10 meio aleatório”):** `src/game/enemyTiers.ts` — `megaEliteHp`: base **20.000 → 9.500** com **variação aleatória ±5% por nascimento** (9.025–9.975) + novo 3º parâmetro `rng` (testes determinísticos). A rampa de tempo `2^((seconds−55)/80)` e o `threatMultiplier` se mantêm. Asserção ajustada em `verify-rules.mjs` (`megaEliteHp(55,1,()=>.5)=9500`).
- **IMPLEMENTADO (item 4 — “cade a ficha com os status do personagem?” — o print da pausa mostrava Técnicas/Inventário/Plano de build/Crescimento por nível, sem a ficha de status):** `src/ui/RunSheet.tsx` — nova **1ª coluna** da pausa **“Ficha do personagem · Status da run”** (faixa roxa `.stripe.purple`): todos os status da run em **TOTAIS** (base do shinobi + nível + itens + pílulas + passivas + sinergias + bônus por nível) agrupados **ATAQUE/DEFESA/UTILIDADE** (export `groups` já existente) + nota (crítico 250% · mega crítico 300%) + tile **“Ameaça da missão ×{difficultyScale}”**. `src/run-ui.css` — nova classe `.stat-line.total` (2 colunas: rótulo + valor; a `.stat-line` padrão tem 4). **Conflito Rodada 48 × 50 resolvido:** o usuário quer os **STATUS do personagem** (sim — restaurados como totais); a **tabela de % de itens** (removida na Rodada 48) **continua fora**.
- **REGRESSÃO NA SUÍTE (corrigida na validação):** `verify-runtime.mjs` assumia que a **1ª** `.sheet-column` era “Técnicas” (a que tem o `<details>` do pool) — com a nova coluna “Ficha” à frente, o teste dava timeout. Correção: o seletor agora mira **`.run-sheet details`** (independente da ordem das colunas) + comentário de Rodada 50.

### Decisões próprias (aguardando teste do usuário — regra: nunca calibrar sem ele)

1. **Escada de vivos** (PROPOSTO): `capBase 36 · capLinear 52 · capQuad 3,8` — 91@1 min · 695@8 min · 936@10 min · teto 1.600 aos ~15 min. “O usuário testa a gameplay e ajustamos.”
2. **1º mega elite** (PROPOSTO): base **9.500** com **±5% aleatório por nascimento** (9.025–9.975) — “cerca de 9 a 10 meio aleatório.”
3. **Ficha do personagem = TOTAIS** (sem a tabela de % de itens — pedido da Rodada 48 mantido) + tile de ameaça da missão.
4. **Morro de arroz NÃO cura diretamente** (comportamento da Rodada 49): ele dá **Ryu** `(14+zona×6)×MISSION_TIER[missão]×(1+min(1,sorte×0,01))` + **ímã global 10 s** (xp/lamen/chakra do mapa) + **dropa uma LAMEN que cura 35% do HP** (`RAMEN_DROP.heal`) — o jogador coleta a lamen. **Resposta à pergunta do usuário** (estavam curando a vida em %? — a cura é da lamen, não do morro).
5. **`sealDrop` do mega elite derrotado** mantém a auto-coleta ao pisar (único pickup com esse comportamento agora).

### Validado

`tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94 + asserções da Rodada 50) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (passou completa após a correção do seletor: 183 drawCalls · 1600 bodies · 138 outlines · 65 markers).

## Rodada 49 — 4 pedidos: altar sem “E” (não reinicia) · kunai/shuriken viram PERGAMINHOS coletados com E (sem auto-coleta) · Final Swarm cap 1.600 + rampa 800@+4min → 1.600@+7min + clamp por quadro · moedas viram MORROS DE BOLINHOS DE ARROZ (+ímã 10 s, +lamen de cura, Ryu por zona/dificuldade/sorte) · aviso do portal só perto do portal (6 m) · 12/11/2026

- **IMPLEMENTADO (item 1 — “Toda vez que aperto E ta reiniciando o Altar, por isso falei que não é pra ter essa opção de E em altares”):** `src/scene/GameCanvas.tsx`: apertar E em cima do altar ativo **não reinicia o altar** — (a) o branch do altar em `interact()` agora mostra o toast **“…fique dentro do círculo para ativar o altar (sem E)”** (o altar já é ativado AO PISAR, Rodada 47) e não zera o progresso; (b) **guard idempotente** `if(defenseAltar===e)return;` no topo de `startAltar` — nem dois gatilhos no mesmo tick reiniciam o mesmo altar; (c) o prompt de interação do altar **não mostra a tecla “E”** — o `WorldSnapshot.interaction` ganhou o campo opcional `key?:string` (ausente no altar) e o `src/main.tsx` só renderiza o `<kbd>` quando `key` existe.
- **IMPLEMENTADO (item 2 — “As KUNAIS que eu já falei que deveriam ter virado pergaminhos no chão, devem aparecer o E para pegarmos, não ser pegado automaticamente”):** as kunai/shuriken do chão viraram **PERGAMINHOS** — (a) `src/scene/GameCanvas.tsx`: a **auto-coleta ao pisar (Rodada 47) NÃO se aplica mais a kunai/shuriken** (o morro de arroz/Ryu e o drop do mega elite seguem auto-coletados); a **tecla E abre** o pergaminho (`interact()` → `collectPickup` — custo em Ryu + pool de recompensa, fluxo já existente); (b) renomes em `spawnPickup`: kunai/shuriken → **“Pergaminho”** · sealDrop → **“Pergaminho de recompensa grátis”** · ryu → **“Morro de bolinhos de arroz”**; (c) `src/scene/dropSprites.ts`: nova **`drawScrollShape`** — `drawKunai`/`drawShuriken` agora desenham **pergaminho** (a Shuriken Amaldiçoada mantém a shuriken roxa; a recompensa grátis do guardião = pergaminho + ✦ verde); (d) ícone novo `public/assets/icons/scroll.svg` + labels/ícone de pergaminho no `src/ui/MapOverlay.tsx` (mapa M).
- **REGRESSÃO CORRIGIDA (item 2, encontrada na verificação):** a extensão do **aviso do portal** da Rodada 49 (de “pergaminhos do guardião” para **todos** os pergaminhos do mapa) **travava a progressão de zona** — `scatterPickups()` espalha ~18 pergaminhos por zona e o portal se recusava a abrir até o jogador perambular o mapa inteiro apertando E (a suíte `verify-runtime` falhava de forma determinística por isso). Correção: o aviso agora conta só os pergaminhos **num raio de 6 m do portal** (protegendo os pergaminhos do guardião, que nascem a 3,4 m do ponto de morte); o segundo E ainda entra (rate-limit existente). Pergaminhos distantes somem na troca de zona (mesmo comportamento de antes da Rodada 49). Adicionado o debug `clearPickups` na API de teste + nova checagem na suíte: **“Pergaminho perto do portal avisa antes de entrar · coleta exige E, sem auto-coleta (Rodada 49)”** (pergaminho a 3,4 m do portal → E avisa e a zona fica em 1 → coleta com E → o portal entra).
- **IMPLEMENTADO (item 3 — “Final swarm não respeitando os 1600 monstros totais. E outra a progressão deve limitar no máximo 800 monstros até chegar no +4minutos em final swarm, para ai sim ir aumentando até chegar a 1600 monstros TOTAIS e o máximo de cap de monstros invocando na tela!”):** `src/game/progression.ts`: `FINAL_SWARM` ganhou `ramp800Cap:800` · `ramp800Seconds:240` · `rampSeconds:420` — o cap em tela cresce **progressivamente**: **800 aos +4 min** → **1.600 aos +7 min** (rampa linear; reaproveitou `rampMinutes:7` da Rodada 48); `difficultyAt` calcula a rampa; **defesa em profundidade** em `src/scene/GameCanvas.tsx`: **clamp por quadro** remove o excedente de monstros comuns (bosses/guardiões/megas/ajudantes/clones NUNCA) e `startFieldAmbush` respeita o cap remanescente. O print do usuário com **5.468 monstros** veio do zip STALE do Netlify (11/11, anterior à Rodada 48 — avisado para re-upar).
- **IMPLEMENTADO (item 4 — “Moedas no mapa devem virar morros de bolinhos de arroz, efeito magnetismo(puxa todos os drop's (exp/lamen/chakra) espalhados pelo mapa todo por 10S, dropa lamen que cura vida, monte de ryu escalando por zona/dificuldade/sorte.”):** `src/scene/dropSprites.ts`: nova **`drawOnigiri`** (o drop de Ryu agora é um **morro de bolinhos de arroz**, escala .8 → 1.05); `src/scene/GameCanvas.tsx` (`collectPickup`, ramo ryu): **Ryu = `(14+zone*6) × MISSION_TIER[dificuldade] × (1 + min(1, sorte × 1%))`** (escala por zona × dificuldade × sorte) + **ímã global de 10 s** (`globalMagnetUntil` — puxa TODOS os drops de xp/lamen/chakra do mapa, reusando o loop de drops) + **dropa uma lamen de cura** (`RAMEN_DROP.heal`); toast próprio: “Morro de bolinhos de arroz · +N Ryu · ímã 10 s · lamen de cura”. Auto-coleta ao pisar **mantida** (Rodada 47).

### Decisões próprias (aguardando teste do usuário — regra: nunca calibrar sem ele)

1. **Ryu do morro de arroz:** `(14+zone*6) × MISSION_TIER[dificuldade] × (1 + min(1, sorte × 1%))` — o usuário pediu “escala por zona/dificuldade/sorte” sem números.
2. **Rampa do Final Swarm:** 800 aos +4 min → 1.600 aos +7 min (o usuário fixou o cap aos +4 min e a meta 1.600; o +7 min reaproveita a Rodada 48).
3. **Ryu (morro) e sealDrop mantêm a auto-coleta ao pisar** (aprovada na Rodada 47); **somente os pergaminhos (kunai/shuriken) exigem E** (pedido explícito da Rodada 49).
4. **Aviso do portal limitado a 6 m** ao redor do portal (correção da regressão — ver acima).
5. **`key?:string`** no snapshot: o altar não exibe “E” (sem string mágica no HUD).

### Validado

`tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (2 execuções verdes no código final · 0 erros · 0 assets 404 · Edge headless · stress de horda com o cap 1.600).

## Rodada 48 — 20 pedidos: “Deixar em casa” (planner) · M/ESC/Tab fecham o mapa de volta ao jogo · HUD métricas (Dano causado/DPS, sem aliados, sem tabela %) · Treinamento atributo aleatório +0,6% + HUD flutuante · Final Swarm 1.600 + rampa 7 min · XP por mob 8→5 · ficha mais escura · engasgada E/1-4 · Zabuza+névoa (PENDENTE) · 12/11/2026

- **IMPLEMENTADO (item 1 — “a parte de 'Treinar/Deixar em casa' a habilidade seja por Shinobi... já ajustou isso conforme eu te falei?”):** `src/ui/BuildPlanner.tsx`: o botão **“Não aprender” virou “Deixar em casa”** (estado, resumo, texto inicial, filtro e alternância) — espelhando o conceito de build da referência com a particularidade por shinobi.
- **IMPLEMENTADO (item 2 — “Ao apertarmos M para abrir o mapa e ESC para fechar, ele sai do mapa abrindo a ficha do personagem, isso esta errado, ajustar agora mesmo” + “tem o mesmo problema... também para a tecla tab”):** `src/scene/GameCanvas.tsx`: fechar o mapa (M, ESC ou TAB) agora **volta ao jogo sem abrir a ficha** (`mapPanel` + `suppressUnlockPause` de 800 ms).
- **IMPLEMENTADO (item 3 — “aparecer meu dano causado total e os valores, dano causado/s ... remover dano por aliados ... exemplo 1.1M” + “tirar a tabela de porcentagem e subir a parte onde registra os ganhos”):** `src/ui/RunSheet.tsx`: o banner mostra TEMPO · ABATES · **Dano causado** (total) · **Dano por segundo** (formato compacto 1,1M) · RYU; **removido** “Dano por aliados” e a coluna **“Ficha técnica”** (tabela de porcentagens). **Substitui** a decisão da Rodada 34 de “tabela de utilidades de volta” — a decisão mais recente prevalece.
- **IMPLEMENTADO (item 4 — “Aparecer acima da cabeça do personagem um hudzinho de 'Treinamento - <atributo aleatório que upou> +0,6%'” + “ele treina TODOS os atributos aleatoriamente”):** `src/scene/GameCanvas.tsx` (`grantTraining()` agora usa `rollPowerlevel` — atributo **aleatório** +0,6%, era Sorte fixa +0,8%) + `src/scene/damageNumbers.ts` (nova API `spawnText(label, color)` para o HUD flutuante) + `src/game/powerlevel.ts` (`POWERLEVEL_RATE` 0,008 → **0,006**). **EM ABERTO:** a cláusula “somente na utilidade que ele treina apenas sorte” — aguardando confirmação do usuário (anotação em `docs/23` §4.2).
- **IMPLEMENTADO (item 5 — “O final swarm sempre vai ter o máximo de 1600 monstros... até os +7 mins o aumento vai ser progressivo... eles precisam ir evoluindo ao passar do tempo”):** `src/game/progression.ts`: `FINAL_SWARM.maxEnemies` 8.000 → **1.600** + nova rampa `rampMinutes: 7` — o limite **cresce progressivamente** até +7 min e **não salta** para o teto; `difficultyAt` agora calcula `swarmRamp`. Monstros evoluem com o tempo (HP/defesa/armadura/dano via `ENEMY_SCALING` — regra existente).
- **IMPLEMENTADO (item 6 — “Taxa de experiência muito alta também por mob já no normal... diminuir”):** `src/game/enemyTiers.ts`: `BASE_LOOT.xp` 8 → **5**. XP por abate **sempre** dropado (regra existente — o que estava “alto” era a taxa).
- **IMPLEMENTADO (item 7 — “esse fundo bege não ficou legal para lermos as informações... deixe mais visual”):** `src/ninja-theme.css`: fundo das colunas da ficha `papel-claro→papel` → **`papel2→papel3`** (mais escuro/contraste, usando os tokens do tema).
- **IMPLEMENTADO (item 8 — “o botão E para interagir as vezes da uma engasgada, o mesmo acontece com selecionando as opções pressionando 1, 2, 3 e 4”):** `src/scene/GameCanvas.tsx`: `CHOICE_GUARD.armSeconds` 0,5 → **0,2 s**.
- **CONFIRMADO (item 9 — “Você transformou a isca shinobi em pílula que seria nossas vitaminas?”):** **JÁ É PÍLULA** desde a Rodada 47 — `src/game/pills.ts` (Isca Shinobi: `enemyCount +15% · gold +12% · exp +8%` por nível); o item `shinobi-bait` foi removido do catálogo. Nada a fazer.
- **JÁ ESTAVA (item 10 — “raro ser azul, incomum verde, comum cinza, épico roxo, lendário amarelo/alaranjado”):** as cores da raridade **já estavam assim** em `src/rarity.css` (comum #cbd1d6 · incomum #6fd27b · raro #6eb8ff · épico #c59aff · lendário #f3c35d). Nada a fazer.
- **JÁ EXISTE (item 11 — “falei que queria o HP mostrando aqui tem o número no centro”):** o HP com número **já existe** na RunSheet (banner) e no HUD de combate. Nada a fazer.
- **PENDENTE (item 12 — “quando acontecer névoa do mapa... é para aparecer o Zabuza Momochi como Mega Elite no mapa”):** **Zabuza NÃO existe no roster** (`src/game/heroes.ts`; só id futuro em `ORGANIZATIONS` de Névoa) — anotação completa em `docs/23` §4.1 (personagem + evento de névoa intermitente).
- **OPCIONAL, NÃO FEITO (item 13 — “quando eu tiver dinheiro suficiente aparecer o valor + ryu em verde, quando tiver faltando, aparecer vermelho”):** falta expor `world.interaction` no `WorldSnapshot` + `main.tsx` + CSS — registrado em `docs/13`.
- **EXPLICADO (item 14 — “Porque o claude aparece na página do meu github como contribuinte?”):** o commit da Rodada 38 (`fd79ced`, trailer) tem trailer `Co-Authored-By: Claude Opus 5.5` — por isso o GitHub o lista como contribuinte; os 30/30 commits têm author `jcffadev`.
- **PENDENTE (itens 15–16 — “Movimentação ainda apresenta travamentos” + bug de animação atacar+andar + minionblock com horda grande):** persistem apesar das Rodadas 45–47 — anotação em `docs/23` §4.1 (candidatos: `enemyRenderer.ts` batches com horda grande · `collision.ts` minionblock · `playerMotion.ts`/`combatMotion.ts`).
- **PENDENTE (item 17 — andar vertical frente/costas):** a estrutura de folha já tem `rows: 2` (`src/game/directionalArt.ts`); falta a **pose na arte** (folhas atuais têm só diagonal) — anotação em `docs/23` §4.1.
- **TESTE ATUALIZADO:** `scripts/verify-runtime.mjs` — asserção do planner passa a esperar “Deixar em casa”.

### Validado

`tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (0 erros · 0 ausências · Edge headless · stress com 1.600 inimigos).

## Rodada 47 — 13 pedidos: crítico 250%/300% · YOOOO rápido · Isca Shinobi → Pílula · Treinar auto-planeja · early game +200% (PROPOSTO) · raridade visual · bordas temáticas · botões do planner · badge Treinada · selamento instantâneo · pool adaptável · auto-coleta · passada sem distorção · 12/11/2026

- **CONFIRMADO (item 1 — pedido do usuário, 12/11/2026 — “Dano crítico 250% do dano base e Mega Crítico 300% do dano base”):** já estava no código — `src/game/progression.ts`: `rollCritical(chance, criticalMultiplier=2.5)`: crítico = **250%** do dano base; mega crítico (tier 2, chance ≥ 100%) = `criticalMultiplier + .5` = **300%**. Verificado no código real; nada alterado.
- **IMPLEMENTADO (item 2 — “O Som de YOOOO! tem que entrar mais rápido ao clicar no botão, está demorando alguns segundos… tem que ser mais rápido o som”):** `src/audio/sfx.ts`: nova `preloadYooo()` (cria o `Audio` + `preload='auto'` + `load()` no boot, fallback silencioso) + `src/main.tsx`: `preloadYooo()` junto do `startBoot()` — o 1º clique **não espera mais o download** (a lentidão era o fetch no 1º play). Corte a partir do 1 s (rodada 37) mantido.
- **IMPLEMENTADO (item 3 — “Você transformou a Isca Shinobi em item, ele é uma Pílula… mude”):** `src/game/pills.ts`: **Isca Shinobi** volta a ser **pílula** com os mesmos valores do item antigo (`enemyCount +15% · gold +12% · exp +8%` por nível); `src/game/catalog.ts`: item `shinobi-bait` **removido** do catálogo (comentário de migração); `src/game/inventoryArt.ts`: lista de ícones avulsos documentada como vazia (a cápsula de pílula `PillIcon` cobre o ícone, como as demais pílulas). Saves antigos degradam graciosamente (sem erro).
- **IMPLEMENTADO (item 4 — “ao treinar a passiva Treinamento com Jiraiya, já tem que habilitar o Treinar para selecionar no plano de build”):** `src/ui/BuildPlanner.tsx`: o botão **Treinar** agora aparece para **todas** as técnicas do herói (antes: só as planejadas) e treinar uma técnica ainda não planejada **auto-planeja** ela junto (antes era no-op, pois `trained` filtra por `planned` — ver também o comentário em `src/main.tsx`). O buff +15% em si **já existia** (rodada 39): `src/scene/GameCanvas.tsx` `hit()` aplica `config.trained?.includes(t.name) ? 1.15 : 1` nas técnicas do jogador (não dos aliados).
- **IMPLEMENTADO — valores PROPOSTOS, o usuário testa e ajusta (item 5 — “Early game desde o lv1 muito fácil, extremamente fácil… aumentar cerca de 200% a dificuldade, diminuir dano inicial dos personagens, aumentar hp/defesa dos mob's” + “Se está fácil assim na dificuldade genin, também vai estar no restante”):**
  - `src/game/progression.ts` — `ENEMY_SCALING`: **hpBase 1,6 → 3,2** (HP inicial dos inimigos ×2) · **armorPerMinute 0,015 → 0,03** (defesa inicial 2× mais rápida) · **maxArmor 0,6 → 0,72**; demais parâmetros mantidos. O efeito extra é máximo no início e decai proporcionalmente (5 min: ×1,20 · 10 min: ×1,13 · 30 min: ×1,05) — o late game já é íngreme por si (1,17^min).
  - `src/game/heroes.ts` — **`export const HERO_DAMAGE_FACTOR=.41`** (era ×0,55 hardcoded): dano base do herói **×0,41**; o HP base do herói **NÃO mudou** (o teste fixa 85 de HP do Naruto Academia).
  - **Dificuldade total ≈ ×2,8–3,1 no minuto 0** (Genin; vale para **todas** as dificuldades, em suas devidas proporções de tier — “se fácil no Genin, fácil em todas”).
  - **BUG CORRIGIDO (mesmo item):** `heroes.ts` `version()` dividia por **`.55` hardcoded** (o multiplicador antigo da fábrica) — com a fábrica em ×0,41, as versões seguintes ficavam **mais fracas que a base** (naruto-genin 6,16 < naruto 7,38), violando a regra “versões avançadas mais fortes”. Agora `version()` divide por `HERO_DAMAGE_FACTOR` — **única fonte** do multiplicador (fábrica `h()` e `version()`).
  - `scripts/verify-rules.mjs` — faixas atualizadas com justificativa “Rodada 47”: HP tardio do guardião `>=1.1e9 && <1.35e9` · armadura do FINAL SWARM `> d10.armor*2.5`.
- **IMPLEMENTADO (item 6 — “na opção de escolha seja mais visual a raridade do item/habilidade/pílula… coloque em volta do ícone preenchendo todo o quadradinho a cor da respectiva raridade”):** `src/ninja-theme.css`: `.level-choice-card .choice-art` (e as variantes `rarity-*`) agora com a **área do ícone PREENCHIDA com o gradiente da raridade** (`--rarity-strong → --rarity`) + contorno interno 2 px (`inset 0 0 0 2px var(--rarity-strong)`) — antes era um brilho suave; o quadradinho inteiro da carta assume a cor da raridade.
- **IMPLEMENTADO (item 7 — “Faça bordas para toda hud que combine com o tema… cores que combinem com o tema japonês/naruto… para Técnicas, inventário, ficha técnica”):** `src/ninja-theme.css`: **molduras temáticas** no painel da ficha da run — `.sheet-banner` (madeira/corda + pincelada) · `.sheet-column` · faixas `.stripe.blue` (Técnicas) / `.gold` (Inventário) / `.purple` (Ficha técnica) · `.sheet-tile` (pergaminho com borda) — no tema ninja/japonês, por cima da base de `run-ui.css`.
- **IMPLEMENTADO (item 8 — “evidencie como botões essas opções”):** `src/ninja-theme.css`: `.build-cell-actions button` (Planejar para Missão · Treinar · Não aprender/Permitir aprender) agora com cara de **botão** — placa de pergaminho com borda de madeira, `aria-pressed` ativo = **selo hanko vermelho** (base em `hud-dock.css`); “Permitir aprender”/“Devolver” mantém o verde (`.enable-skill`).
- **IMPLEMENTADO (item 9 — “entender no jogo que as habilidades treinadas, irão aparecer e darão o buff da % corretamente”):** o buff +15% já aplicava na run (rodada 39 — `hit()` em `GameCanvas.tsx`); a Rodada 47 torna isso **visível**: `src/ui/RunSheet.tsx` recebe a prop `trained` e exibe o **badge “★ Treinada · +15% de dano”** em cada técnica treinada da ficha (`.trained-badge` em `src/ninja-theme.css`; `src/main.tsx` passa `trained={trained}`); o item 4 (Treinar auto-planeja) garante que o buff seja alcançável direto do planner.
- **IMPLEMENTADO (item 10 — “Ao selar um shinobi se não tiver escolha de substituição por outro do time, continuar a missão instantaneamente, retirar a tela de clicar em 'continuar missão'”):** `src/scene/GameCanvas.tsx`: ao terminar o selamento **sem substituto na fila**, `nextSeal(); recaptureAfterChoice()` — a missão **continua na hora** (próximo candidato, ou volta à run); o estado `complete` **nunca mais fica visível** nesse fluxo.
- **IMPLEMENTADO (item 11 — “quando tiver só 1 escolha, deixar o tamanho para 1 escolha… Não deixar a área do hud como se fosse o tamanho normal, pegando na tela como se tivesse 4 escolhas, se não fica feio”):** `src/main.tsx`: o pool ganha a classe `cards-{1..4}` conforme o nº de cartas (`Math.max(1,Math.min(4,…))`); `src/ninja-theme.css`: `.level-choice.cards-1/2/3/4` (430/690/930/1060 px) — a **largura da área de escolha se adapta** ao nº de cartas.
- **IMPLEMENTADO (item 12 — “pegar itens no chão, precisa sumir a opção de pegar… altares… só de ficar em cima já ta contando o tempo”):** `src/scene/GameCanvas.tsx`: **auto-coleta ao pisar** (raio 1,8 m, tick da simulação) para pickups comuns (Ryu · kunai/shuriken · drop do mega elite) — **sem “E”** e sem prompt; o `interact()` (tecla E) agora cobre **só as emboscadas** (`cursedShuriken`/`ninjaBody`, raio 2 m — gatilhos de risco). **Altar**: já começava ao pisar (`tickAltar`) — mantido, sem mudança. Se o Ryu não cobre o preço da kunai, o item **fica no chão** (toast) e a auto-coleta tenta de novo no próximo tick.
- **IMPLEMENTADO (item 13 — “animação distorcida ainda, documentar e tentar corrigir, ainda acontece o 'bug' de distorção ao tentar atacar + andar”):** `src/scene/playerMotion.ts`: **`const strideTarget = proceduralMotion ? stride : 0;`** — a passada procedural (deformação de pernas/braços da pose) **NUNCA** se sobrepõe a uma folha desenhada: o quadro de ataque fica **100% íntegro** (sem “distorção”); o andar-livre continua porque o **deslocamento vem da simulação**, não da deformação. Suavização da passada (lerp ≈0,1 s, rodada 45) e âncora nos pés mantidas; exceções (Choji cresce · Gaara flutua · Pain levita) intocadas.
- **Testes reescritos (apoio ao item 12):** `scripts/verify-runtime.mjs` — os testes de kunai agora seguem o fluxo novo (**auto-coleta ao pisar**): “Recusa G” (`g` → `sealing=null` → pool de 3 cartas → tecla `1`) + loop de preço (auto-coleta → `paidWeapons` 1/2, custo 20/30 Ryu); **hardening** do loop do guardião: **removido o `press('e')`** (o teleport sobre a kunai já dispara a auto-coleta; o “E” perto do portal — raio 2,2 m — podia entrar na zona seguinte). `artifacts/runtime-checks.json` confirma: “Recusa G deixa kunai grátis com três escolhas · auto-coleta ao pisar, sem E (Rodada 47)” · “Kunais custam 20 e depois 30 Ryu · coletadas ao pisar, sem E (Rodada 47)” · “As 3 kunais do guardião (1 + 2 planos do Shikamaru) são coletáveis antes do portal”.
- **Arquivos alterados:** `src/audio/sfx.ts` · `src/main.tsx` · `src/game/catalog.ts` · `src/game/pills.ts` · `src/game/inventoryArt.ts` · `src/ui/BuildPlanner.tsx` · `src/game/progression.ts` · `src/game/heroes.ts` · `src/scene/GameCanvas.tsx` · `src/scene/playerMotion.ts` · `src/ui/RunSheet.tsx` · `src/ninja-theme.css` · `scripts/verify-rules.mjs` · `scripts/verify-runtime.mjs`.
- **TESTADO:** `tsc -b --force` ✓ (EXIT 0) · `vite build` ✓ (EXIT 0) · `verify-motion-atlases.mjs` ✓ (`{"versions":56,"states":560,"errors":[]}`) · `verify-rules.mjs` ✓ (EXIT 0 · roster 56 · técnicas 97 · itens **94** — `shinobi-bait` saiu do catálogo) · `verify-runtime.mjs` ✓ (EXIT 0 · `errors:[]` · ~202 s · Edge headless).
- **PENDENTE (aprovação do usuário):** **item 5 — os valores de early game são PROPOSTOS** (hpBase 3,2 · armorPerMinute .03 · maxArmor .72 · `HERO_DAMAGE_FACTOR` .41 → dificuldade ≈ ×2,8–3,1 no minuto 0) — o usuário testa a gameplay e ajustamos em iteração; demais itens: teste visual do usuário (raridade preenchendo o ícone · bordas da ficha · botões do planner · badge Treinada · largura do pool 1–4 · selamento instantâneo · auto-coleta sem “E” · YOOOO rápido · passada sem distorção).

## Rodada 46 — Caminhada dos Ninjas Selados (aliados) corrigida · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “Corrigir o caminhar dos Ninjas Selados que entram no time para ajudar, a caminhada deles está bugada, devem caminhar/atacar/normalmente conforme seguem o jogador”):**
  - **Diagnóstico (causa raiz):** o follow dos aliados em `src/scene/GameCanvas.tsx` era **stop-and-go binário**: `follows = gap > .25` fazia o aliado **parar seco** dentro de 0,25 m do slot de formação e **sair “correndo” em `speed+2`** quando o slot (ancorado no jogador) se afastava. Com o jogador andando (~5 m/s), o aliado alternava **idle ↔ andar a ~10 Hz** — o sprite trocava de textura (folha de repouso ↔ folha de caminhada) a cada ~0,05 s: a “caminhada bugada”. **Segundo fator:** a orientação dos aliados usava **sem dead zone** (`dir.dot(v1) > 0` / `dir.dot(v2) < 0`), então, ao andar quase de lado para a tela, a fileira da folha (frente ↔ costas) **flippava a cada frame** — o jogador usa threshold ±0,18 exatamente para evitar isso.
  - **Correção (loop de aliados + Kuri, em `src/scene/GameCanvas.tsx`):**
    - **Follow amortecido:** `ally.position.lerp(goal, 1 − e^(−dt·R))` com **R = 8** (R = 16 durante o dash do jogador) — o aliado **desacelera suavemente** ao chegar no slot (≈0,13 s) em vez de parar seco; com o jogador em movimento ele segue em **offset constante (~velocidade/8 m)** com **passada contínua**. Snap `gap > 12` (recrutamento/teleporte) **preservado**.
    - **Band de assentamento** `follows = gap > .18` (era `.25` nos aliados, `.3` na Kuri) — o aliado para de animar só quando já está no slot.
    - **Dead zone de orientação idêntico ao jogador:** `backwardView = dir.dot(v1) > .18` · `leftward = dir.dot(v2) < −.18` — fim do flicker de fileira (frente/costas) ao andar de lado. Mesmos parâmetros de `viewBack`/`viewLeft` do jogador (linha do `playerMotion.update`).
    - **Ataque/repouso sem mudança de regra:** `castTechnique(..., motion)` continua chamando `motion.attack()` (a animação de ataque dos aliados já tocava — o bug era só a caminhada); o cadência `allyTimer`/`allyInterval` é intacta; Kuri (companheira do Kankuro) recebeu o mesmo follow amortecido e dead zone.
  - **Arquivos:** `src/scene/GameCanvas.tsx` (loop de aliados ~linha 1249 + bloco da Kuri ~linha 1273).
  - **Testado:** `tsc -b` ✓ · `vite build` ✓ · `verify-rules` 56/97/95 ✓ · `verify-motion-atlases` 56/560/0 erros ✓ · `verify-runtime` 0 erros/0 404 (o cenário recruta Gaara + Kankuro e joga com eles) ✓ · **teste visual dedicado** (Playwright: recrutou Gaara + Kankuro, andou W e A, 7 frames) — aliados seguem em formação contínua, atacam com o efeito visível, assentam em repouso, **sem flicker de fileira e sem stop-and-go** ✓.
  - **Pendente:** teste do usuário no navegador (junto com os testes pendentes das rodadas 44/45: FPS em GPU real + fluidez da caminhada do jogador).

## Rodada 45 — Fluidez da caminhada + proporção ao atacar (suavização de escala e passada) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “a animação de andar 'livre' ainda está fazendo um 'bug' de movimentação, essa mudança de sheet's/imagem entre animada e não animada deve ser sincrono, não pode aparecer falhas nessa movimentação, tem que ser totalmente fluído, estava fluído antes… mas, parece que ao tentarmos mexer na melhora da movimentação, pioramos isto. TAMBÉM revise a questão dos personagens ficarem mudando de tamanho perdendo proporção ao atacar”):**
  - **Diagnóstico (regressões das rodadas 38/39):** em `src/scene/playerMotion.ts`, três descontinuidades na troca de folha (repouso ↔ andar ↔ andar-atacando) causavam o “pulo”: **(a)** o fator de proporção `propFactor` (rodada 39 — bbox alfa) era aplicado **instantaneamente** — como `position.y = floor + jumpHeight + scale.y*.5` segue a escala, o personagem **saltava de tamanho E de altura** a cada troca; **(b)** a passada `strideShown` **ligava/desligava de uma vez** no início/fim do golpe (a deformação das pernas ia de 0 para o valor do passo e vice-versa — a “falha de movimentação”); **(c)** `stepTime` **zerava a cada parada**, então ao retomar a caminhada “reiniciava” do quadro 0 (o “snap”).
  - **Correção (3 pontos em `src/scene/playerMotion.ts`, estado estacionário inalterado — só as transições suavizam):**
    - **(a) Fator de proporção SUAVIZADO** — novo estado `propCur` (início 1) faz lerp exponencial `propCur += (propTarget − propCur) × (1 − e^(−14·dt))` (≈0,15 s para assentar). O “pulo” de tamanho/altura vira uma transição fluida; **os pés seguem ancorados** (a âncora usa a escala final). Choji (Jutsu de Expansão), Gaara e Pain (levitação `painFloat`) **preservados** — a âncora e o arco do Pain continuam valendo.
    - **(b) Passada SUAVIZADA na troca de folha** — `strideShown` agora persegue o alvo `(proceduralMotion || walkAttack) ? stride : 0` com lerp exponencial `(1 − e^(−16·dt))` (≈0,1 s). A deformação das pernas **sobe/desce** no início/fim do golpe em vez de ligar/desligar — a passada termina e retoma sem “pulo”.
    - **(c) Fase de caminhada CONTÍNUA** — `stepTime` deixa de zerar: `stepTime += dt`. Ao parar e retomar, o ciclo de passos **continua de onde parou** (mais fluido, como caminhada real) em vez de reiniciar do quadro 0.
  - **NÃO alterado (por segurança):** a troca de textura em si (repouso ↔ folha) segue binária — é a limitação de 1 sprite por estado; as correções (a)/(b)/(c) eliminam os “pulos” de escala/passa/fase que tornavam essa troca visível. Exceções de movimento (Choji cresce · Gaara flutua · Pain levita · Naruto Academia tem atlas próprio · Asuma) **intocadas**.
  - **Testes/validação:** `tsc -b` limpo · `vite build` OK · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95**) · `verify-motion-atlases.mjs` (**56 versões · 560 estados · 0 erros**) · `verify-runtime.mjs` (Edge headless) **PASSOU — 0 erros JS · 0 assets 404** + **inspeção visual** dos screenshots `combat.png` (personagem com tamanho correto, pés no chão, HUD íntegro) e `camera-horizonte.png` (câmera deitada, sem bug gráfico).
  - **Aguardando:** teste do usuário no navegador (fluidez da caminhada + sem “pulo” de tamanho ao atacar). Se ainda houver mudança perceptível de tamanho no golpe, o próximo passo é reduzir a diferença de bbox entre as folhas de ação e o repouso (arte) — o clamp 0,85–1,35 da rodada 39 segue como teto.

## Rodada 44 — Câmera e mouse: giro mais calmo e simétrico + câmera mais deitada (piso 0.05 rad) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — “o rawinputmouse ainda está esquisito · a câmera ainda parece muito rápida · é possível deitar mais a câmera no nosso jogo referência, mas tome cuidado, faça testes para não dar bug's gráficos · Lembre-se da câmera centralizar o jogador e não a paisagem/mapa ao redor — nosso foco é sempre ter visão limpa do personagem que estamos jogando”):**
  - **`src/scene/GameCanvas.tsx` — `turnCamera`:** taxa do yaw `0.006` → **`0.0025` rad/px** (−58%) e taxa do pitch `0.004` → **`0.0025` rad/px** (−53%) — **taxa única e simétrica yaw/pitch** (antes havia assimetria 1.5:1, que fazia o giro diagonal “pesar” para o yaw — parte do “esquisito”); 1:1 sem aceleração (rodada 29) **mantido** — `unadjustedMovement` + giro direto; a sensibilidade continua sendo multiplicador puro (slider 0.2–3×).
  - **`src/scene/GameCanvas.tsx` — câmera deitada:** piso do pitch `0.12` → **`0.05 rad (≈3°)`** para o ângulo baixo do jogo de referência (teto `1.48` mantido) + **início da partida `0.74` → `0.55 rad (≈31.5°)`** (começa mais deitado). Proteções de ângulo baixo **já existiam** e foram mantidas: scan de terreno que auto-sobe em encostas (jogador nunca escondido), câmera nunca abaixo do chão (`terrainHeight+1.2`) e near ≤ −70 m (ortográfica, sem corte de primeiro plano).
  - **Câmera centraliza o JOGADOR** (pedido reconfirmado): `cameraTarget.set(player.position.x, terrainHeight+1.15, player.position.z)` + `camera.lookAt(cameraTarget)` — **já era assim**; verificado e documentado, sem mudança nesse ponto.
  - **`src/ui/SettingsScreen.tsx`:** a hint do slider “Sensibilidade do mouse” agora cita o padrão mais calmo (rodada 44) e a **dica do Windows** (velocidade do ponteiro do sistema em **6/11** — o multiplicador do Windows pode somar ao movimento do mouse mesmo com raw input).
  - **`scripts/verify-runtime.mjs`:** o teste de câmera agora **deita a câmera até o piso (0.05 rad)** e assera `pitch ≤ 0.055` (antes `pitch < 0.3`) + yaw gira; mantém o screenshot `artifacts/camera-horizonte.png` para inspeção visual.
  - **`scripts/verify-rules.mjs`:** +6 asserções (taxa 0.0025 yaw · taxa 0.0025 pitch · piso 0.05 · início 0.55 · dica “6/11” na tela de configurações).
- **Arquivos alterados:** `src/scene/GameCanvas.tsx` · `src/ui/SettingsScreen.tsx` · `scripts/verify-runtime.mjs` · `scripts/verify-rules.mjs` · `docs/01` · `docs/13` · `docs/14` · `docs/18` · `docs/23` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** + asserções da 44) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (1ª execução, sem flake) · **inspeção visual** de `artifacts/camera-horizonte.png` no piso 0.05 rad (pedido “faça testes para não dar bug's gráficos”): cena renderiza sem corte no horizonte, sem Z-fighting, jogador visível e centralizado, HUD/minimapa íntegros.
- **PENDENTE (aprovação do usuário):** (1) taxa única **0.0025 rad/px** para yaw e pitch (simetria 1:1); (2) piso do pitch **0.05 rad** (antes 0.12); (3) início **0.55 rad** (antes 0.74); (4) se ainda parecer rápido no Windows → ponteiro do sistema em **6/11** e/ou slider de sensibilidade para baixo. **As pendências das rodadas 41/42/43 seguem em aberto** (docs/18 §6).

## Rodada 43 — Sons reais de jutsu (Kage Bunshin + Shinra Tensei) + pose/levitação da Ultimate do Pain + controle de revisão p/ Claude-Codex · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — 2 MP3s enviados com regras de uso + regra permanente de controle de revisão):**
  - **MP3 1** ("Kage Bunshin no Jutsu") — regra: **"Apenas naruto"** → som da técnica **Kage Bunshin** **somente quando a família do lançador é `naruto`** (qualquer outra família com a técnica no pool compartilhado **não** toca o som).
  - **MP3 2** ("Pain Shinra Tensei") — regra: **"Apenas Yahiko/Pain, ao utilizar ultimate o jogador deve Levitar com os braços abertos, fazer a arte/movimentos, a habilidade ultimate deve ter este som"** → som na **Ultimate do Pain** (no jogo: `Chibaku Tensei`) + **pose de levitação com braços levantados** durante o cast.
  - **`public/assets/audio/`** — 2 MP3s novos copiados do scratchpad (`kage-bunshin.mp3` + `shinra-tensei.mp3`) — **áudios originais que o usuário baixou e entregou para o jogo** (mesmo fluxo do `yooo.mp3` da rodada 37), não material do jogo de referência.
  - **`src/audio/sfx.ts`:** `JUTSU_CLIP_RULES` (regras técnica+família→MP3) · `jutsuClipFor(t,ultimate,casterId?)` · `playJutsuClip(src)` (novo `Audio`, `play()` em promise + catch silencioso, `release` em `ended`/`error`/catch — **zero unhandledrejection**; **bloqueado enquanto `activeJutsuClip` existir** = regra anti-spam do usuário: "só permitir soltar o som quando terminar o áudio do outro — **não é fila**") · `playTechniqueSound(t,ultimate=false,casterId?)` (nova 3ª arg opcional) — se há clip: toca o MP3, marca `lastTechniqueVoice`/`lastVoiceByTechnique` e **retorna SEM o sweep sintetizado e SEM a fala TTS**; se não há clip mas `activeJutsuClip` ativo → retorna sem som nenhum; resto (sweeps + `speak`) inalterado.
  - **`src/scene/GameCanvas.tsx`:** os 3 call sites passam o `heroId` (`activateSetup` · fim de `castTechnique` `if(!ally)` · `castUltimate`); **verificado:** clones de Kage Bunshin atacam via `hit()` direto — **não** chamam `playTechniqueSound` → sem som duplicado dos clones.
  - **`src/scene/playerMotion.ts`:** `painUltimate = family==='pain' && ultimate && state==='ultimate'` → segura o **quadro 0** da folha `pain-1-action-v3.png` (fileira **2** frente / **3** costas — pose de **braços levantados em V** já existe na folha) durante o cast todo (receita do Gaara, que já existia) + arco de elevação `sin(π·attackProgress) × 0,38` m (0→pico→0) — **sem nova arte** (a folha é `kind:'full'` via `revisedActionForms.pain:[1]`).
  - **`docs/23-REVISAO-OUTROS-AGENTES.md` (novo):** controle de revisão para o Claude/Codex (pedido do usuário: "Deixar anotado tudo que você Qwen fez que eles podem revisar, como hud's, personagens/movimentação/sheets… Por segurança, já prepare esse controle de tudo que você está fazendo/já fez para revisão deles") — como usar (AGENTS.md → docs/19 → este arquivo → CHANGELOG → `git log`) · **inventário por rodada** (cada commit resume a rodada) · **áreas de revisão** (HUDs · personagens/movimentação/sheets · áudio · caça-níquel · configs · planner · música) com caminhos · **notas para Claude/Codex** (o que ficou para eles: pose/armadura da ultimate do Pain pode ganhar folha dedicada — hook `painUltimate` em `playerMotion.ts`; arte Pillow da Kuri/Kuroari aguardando IA/swap; sons de jutsu novos chegam pelo usuário; as pendências das rodadas 41/42) · regras permanentes resumidas · validações · push seguro.
  - **`scripts/verify-rules.mjs`:** +9 asserções (regra Kage Bunshin Naruto · regra ultimate do Pain · `activeJutsuClip` presente · os 2 MP3 existem >10 KB · `painUltimate` no playerMotion · call sites com `heroId` · kit do Pain: Shinra Tensei + ultimate Chibaku Tensei).
- **Arquivos alterados/criados:** `public/assets/audio/kage-bunshin.mp3` + `shinra-tensei.mp3` (novos) · `src/audio/sfx.ts` · `src/scene/GameCanvas.tsx` · `src/scene/playerMotion.ts` · `scripts/verify-rules.mjs` · `docs/23-REVISAO-OUTROS-AGENTES.md` (novo) · `docs/13` · `docs/14` · `docs/18` · `docs/19` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** — sem regressão + asserções da 43) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (a 1ª execução falhou no check flaky "Rendan Uzumaki exibe impacto" e a 2ª no "Teuchi/barraca Ichiraku" (timeout 30 s), **ambos sem relação com os edits** — a 3ª passou 58/0/0; padrão documentado nas rodadas 41/42: reexecutar antes de investigar).
- **PENDENTE (aprovação do usuário):** (1) som de Shinra Tensei na Ultimate `Chibaku Tensei` do Pain (a técnica comum Shinra Tensei do kit **não** toca o som); (2) Kage Bunshin → som apenas para a família `naruto`; (3) anti-spam: nenhum outro som de técnica (sweep/TTS) entra enquanto o MP3 toca e a fala TTS da técnica é suprimida; (4) levitação do Pain: arco 0,38 m + pose de braços levantados segura durante o cast + **as 4 pendências da rodada 41** (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência das folhas) e **as 6 da rodada 42** (decisões de trilha sonora) seguem em aberto.

## Rodada 42 — Trilha sonora do jogo (OST de Naruto, 15 faixas do usuário) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário, 12/11/2026 — 15 MP3s enviados com regras de uso):** sistema completo de música em `src/audio/music.ts` (novo) + 15 faixas em `public/assets/music/` (nomes limpos, copiadas do scratchpad — **são áudios originais entregues pelo usuário para o jogo**, não material do jogo de referência):
  - **BOOT** (abrir o jogo, navegador/.exe/.patch → sempre a mesma): `ill-do-it-right.mp3` ("I'll Do It Right"); ao terminar → pool de MENUS.
  - **MENUS** (fora da run, ordem aleatória): `konohamarus-theme` · `afternoon-of-konoha` · `loneliness` · `swaying-necklace`.
  - **RUN** (desde o início da run, ordem aleatória): `raising-fighting-spirit` · `heavy-violence` · `ultimate-secrets` · `sarutobi` · `bunta` · `beautiful-green-wild-beast` · `dance`.
  - **BIJŪ** (luta contra a bijū, gatilho em `spawnBijuu` do `GameCanvas.tsx`): `raising-fighting-spirit` — **também** está no pool de RUN (regra do usuário "ordem aleatória **ou** ao iniciar luta contra as bijuus").
  - **DEFEAT** (morrer/perder a run): `grief-and-sorrow` — toca em loop enquanto o resumo da run está aberto.
  - **OVERRIDES POR FAMÍLIA** (início de run, `familyOf(id)` cobre todas as versões): Hinata e Neji → `hinata-vs-neji`; qualquer Sasuke → `sasukes-theme` (regra "apenas essa condição").
  - **Máquina de estados** (idle→boot→menu/run/bijuu/defeat): UMA faixa por vez, **sem fila** (ao terminar, sorteia a próxima do pool sem repetir a anterior); `playMenu()` idempotente (navegar no hub não troca a faixa no meio); fade-in ~0,9 s; volume = `settings.volume × settings.musicVolume`; "Silenciar em segundo plano" também silencia a música; autoplay bloqueado → pendência liberada na primeira interação (pointerdown/keydown, coincide com o clique "Jogar" que já chama `playYooo()`); `play()` sempre em promise com catch silencioso (mesma robustez do `playYooo` — nunca quebra o jogo).
  - **Integração:** `src/main.tsx` (boot no mount + pool de menus nas trocas de página + `startRun(familyOf(...))` em `beginMission` e no botão "continuar missão" + `playDefeat()`/`playMenu()` no fim da run via efeito `runEnded`) · `src/scene/GameCanvas.tsx` (`playBijuu()` em `spawnBijuu`) · `src/game/settings.ts` (`musicVolume` no type + default **0,7** — retrocompatível: `load()` espalha os defaults primeiro) · `src/ui/SettingsScreen.tsx` (slider **"Música"** no lugar do card "em breve" + restauração de padrão).
  - **Decisões desta rodada (registradas, aguardam validação do usuário):** (1) Raising Fighting Spirit = pool RUN **e** trilha da luta bijū; (2) Hinata/Neji compartilham a mesma faixa (regra do usuário num único MP3); (3) após a luta bijū terminar, volta ao pool RUN; (4) **vitória** volta ao pool de MENUS (a faixa de derrota é só para perder a run); (5) `musicVolume` default 0,7; (6) sem crossfade (só fade-in).
- **Arquivos alterados/criados:** `src/audio/music.ts` (novo) · `public/assets/music/` (15 MP3s) · `src/game/settings.ts` · `src/ui/SettingsScreen.tsx` · `src/main.tsx` · `src/scene/GameCanvas.tsx` · `docs/13` · `docs/14` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK (15 MP3s presentes no `dist/assets/music/`) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-motion-atlases.mjs` (56/560/0) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 · **probe dedicado da máquina de estados da música (Playwright + Edge, autoplay liberado): 5/5 PASS** — boot `ill-do-it-right` → pool de menu → run com família Sasuke toca `sasukes-theme` (override validado) → desistência toca `grief-and-sorrow` → zero pageerror/404.
- **PENDENTE (aprovação do usuário):** as 6 decisões acima + o volume/pad de 0,7 do slider "Música".

## Rodada 41 — Marionetes únicas do Kankuro e do Sasori (Kuri companheira + entidade Kuroari) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário: “Para Kankuro e Sasori, fazer criações de suas marionetes unicas, utilizar os arquivos de criação/arte/movimentação/assets/arte 2.5D para criar”):**
  - **Kuri** (marionete de máscara de raposa, canon do Kankuro): **companheira PERMANENTE** da família Kankuro (estilo Kiba+Akamaru) — spawn em qualquer versão do Kankuro (kankuro / kankuro-shippuden / kankuro-alianca), segue em formação (ângulo 2,4 rad · raio 2,1), timer de ataque próprio (independente do `allyTimer`), ataca com **“Agulhas de Kuri”** (Projétil · alcance 8 · recarga 1,5 s) — o veneno do Kankuro (`stats.poison`) é aplicado via `hit()`; **NÃO consome slot de ajudante, NÃO entra em `allies`** (sem troca/afinidade/sinergia), sem barra de vida, silenciosa; sem alvo → retry leve de 0,5 s.
  - **Kuroari** (escorpião vermelho, canon: marionete-assinatura do **Sasori**, usada pelo Kankuro na 4ª Guerra Ninja): **entidade visual** da técnica EXISTENTE “Kuroari” (`src/scene/kuroari.ts`, receita do Gamabunta) — 4 quadros (preparo → ferrão erguido → estouro → recuperação), avanço da marionete até o impacto (easing), fade in/out, sprite 1,7 world units, ciclo de vida no `visuals` (respeita a tecla H; descarta a textura ao remover); **dano IDÊNTICO** ao golpe em área atual (`ATTACK_SCALE×1,2×√(área×(1+g.área))`), acerto em 0,55 s via `pendingHits` — **zero mudança de balanceamento**.
  - **Arte (4 folhas novas)**: `kuri-1-walk-v1.png` (1280×640) · `kuri-1-action-v3.png` (1280×1280) · `kuroari-1-walk-v1.png` (1280×640) · `kuroari-1-action-v3.png` (1280×1280) — geração programática com Pillow (`scripts/generate-puppets.py`, tradição do projeto), âncora de pés pela convenção do pack, fileiras frente/costas (walk) e ataque frente/costas + pulo frente/costas (action).
  - **Registros:** `directionalArt.ts` (folha `kuri-1` + `revisedActionForms kuri:[1]`) · `evolution.ts` (`portraitRegion('kuri')` = célula (0,0) da walk sheet) · `npcs.ts` (`NPC_ALLIES.kuri` + `NPC_NAMES.kuri`) · `GameCanvas.tsx` (spawn/loop/cleanup da Kuri + branch da Kuroari + sheet).
  - **Sasori (herói) NÃO foi criado nesta rodada** — segue a fila aprovada **Onda 2** (docs/13/22: spec “Hiruko (1) · Escorpião Vermelho (15)”) — a **Kuroari já fica pronta para o kit dele** (a entidade aparece quando ele castar).
- **Arquivos alterados/criados:** `src/scene/kuroari.ts` (novo) · `src/scene/GameCanvas.tsx` · `src/game/directionalArt.ts` · `src/game/evolution.ts` · `src/game/npcs.ts` · `scripts/generate-puppets.py` (novo) · `public/assets/shinobi-motion/` (4 folhas) · `scripts/verify-rules.mjs` (+10 asserções) · `docs/13` · `docs/14` · `docs/18` · `docs/22` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b` limpo · `vite build` OK · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95 · +10 asserções das marionetes) · `verify-motion-atlases.mjs` (56 versões/560 estados/0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (1ª execução estourou timeout num check flaky do headless — portal do guardião —; 2ª execução passou).
- **PENDENTE (aprovação do usuário):** (1) Kuri como companheira permanente do Kankuro; (2) Kuroari como visual da técnica; (3) adiantar o herói Sasori (Onda 2) ou manter a ordem K→1→2; (4) aceitar a arte Pillow interina (opção: gerar IA e trocar os 4 PNGs com os MESMOS nomes = swap trivial, zero código) + conferência visual das folhas.

## Rodada 40 — Passiva “Couraça” → “Colete Shinobi” (renome + ícone do colete + migração de save não destrutiva) · 12/11/2026

- **IMPLEMENTADO (pedido do usuário: “Deveria ser um colete Shinobi” — print da passiva com ícone de bandana):**
  - Passiva **Couraça** renomeada para **Colete Shinobi** (buff inalterado: **+2 armadura por nível** · base 100 · máx 10 · seção Treinamento).
  - Ícone: bandana (`bandana`) → **colete shinobi** — sprite do atlas `jonin-vest` (mesma arte do item “Colete Jonin”).
  - **Migração de save não destrutiva** (`migratePermanentLevels` em `preparation.ts`): a chave antiga `Couraça` de `sb_permanent_levels` é **copiada** para `Colete Shinobi` no load e **nunca apagada** — quem já comprou os níveis mantém o buff; a conversão armadura→dano do Gaara em `progression.ts` também atualizada para o novo nome.
- **Arquivos alterados:** `src/game/preparation.ts` · `src/game/progression.ts` · `src/main.tsx` · `docs/11` · `docs/13` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b --force` limpo · `vite build` OK · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404.
- **PENDENTE:** conferência visual do ícone da passiva (colete) pelo usuário.

## Rodada 39 — Planner individual por personagem, tabela, Fusões, Táticas, buff verde/vermelho, badge de fusão, proporção idêntica · 12/11/2026

- **IMPLEMENTADO (código nesta rodada; docs/13 e docs/14 registraram o estado final antes do código):**
  - **Planner em TABELA** (colunas: Opção · Origem/efeito · Raridade/estado · Ações) nas abas Habilidades/Pílulas/Itens, comportamento e filtros preservados; painel de detalhe mantido.
  - **Aba FUSÕES** no planner: pares de técnicas (sem setup/bloqueio), **até 4 por herói**, preview das regras **Fundir** (Épico)/**Combinar** (Raro) de `techniqueMerge.ts`; a execução continua na Oficina dos Sapos Sábios (1 uso por zona).
  - **Táticas de Missão**: snapshot nomeado do plano {planejadas · treinadas · em casa · prioridade · fusões}, **até 4 por herói**, Aplicar/Excluir.
  - **Buff verde / debuff vermelho** por cláusula no `BuffText.tsx` (split por vírgula · “ e ” · “;” · “.” · “/” e “ · ”).
  - **Badge ⚗ Requisito de Fusão** no card do pool da run (técnicas de um par planejado).
  - **“pra” → “para”** nos textos do planner.
  - **Plano individual por personagem** salvo na conta: `sb_planned_by_hero_v1` · `sb_home_by_hero_v1` · `sb_priority_by_hero_v1` · `sb_bag_presets_by_hero_v1` · `sb_fusion_plan_by_hero_v1` · `sb_tactics_by_hero_v1` — chaves globais antigas lidas como fallback e **nunca apagadas** (migração não destrutiva); recarga ao trocar de herói (`useEffect([heroId])`).
  - **Proporção idêntica em qualquer movimento**: `alphaFracOf` em `playerMotion.ts` (bbox alfa da célula em uso vs. repouso medido dinamicamente — a textura de repouso muda por nível —, cache por célula, fator clampado 0,85–1,35) — vale para jogador, ajudantes, clones e mega elites; Choji (Jutsu de Expansão, fase 7) seguirá a mesma regra.
- **Arquivos alterados:** `src/main.tsx` · `src/ui/BuildPlanner.tsx` · `src/ui/BuffText.tsx` · `src/game/missionBag.ts` · `src/scene/playerMotion.ts` · `src/hud-dock.css` · `src/rarity.css` · `docs/13` · `docs/14` · `docs/18` · `CHANGELOG.md`.
- **TESTADO:** `tsc -b --force` limpo · `vite build` OK (109 módulos; 1,27 MB JS / 378 kB gzip) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros · 0 ausentes) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (FPS 6,4 é o render SwiftShader/software do headless, esperado; GPU real valida em separado).
- **PENDENTE:** teste do usuário (planner em tabela · aba Fusões · Táticas · badge ⚗ · proporção em movimento) · buff de conta de dano de habilidades **por ninja** (pergunta em aberta — o +15% do Treinamento com Jiraiya já é individual por herói) · fases 4/6/7/8 em docs/13.
- **Descartado nesta rodada (JÁ EXISTE):** teclas 1–N no pool · buffs de itens/pílulas visíveis na RunSheet · badges “★ Planejado para Missão”/“· Treinada” · Treinamento com Jiraiya +15% (agora individual por herói) · limite “Não aprender” por herói · Kankuro (RESOLVIDO — não tocado).

## Rodada 37 · Fase 3 — Caça-Níquel da Tsunade · 12/11/2026

- **IMPLEMENTADO (código no commit `ec7c42a`; registro anterior ao código em `2b62cf1`):** renomear "Roleta da Tsunade" → **Caça-Níquel da Tsunade** (UI, toasts, nome do evento, descrições dos itens) + **combos de 3 iguais** (3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros até o fim da run · 3 Jirayas = 1 item Raro/Épico/Lendário · 3 Hiruzens = 4 escolhas de item (E pega · V vende) · 3 Hidan = −5% HP total (**piso 1 HP — não mata**) +5% dificuldade/+5% monstros · 3 Kakuzus = `round(120 × luckFactor × (1+pressão))` Ryu) + **emboscada invertida** (jogador **seguro** durante a interação — simulação pausada; ao sair, **armadilhas shinobi explodem em 8 m** e **matam os monstros próximos** — totem/bijuu/guardião excluídos; som novo `explosion`; a casa "Credores" que spawna inimigos se mantém) + **custo por giro em escala** (1,35 → **1,70/giro** + **fator de zona 0,25** + inflação por minuto — escala como o Ryu por zona) + **face da Tsunade** com humor por recompensa (feliz/triste/nervosa; retrato do roster + badge/glow; **arte das 3 expressões = PENDENTE**).
- **Visual = 3 rolos verticais** (durações 900/1.150/1.400 ms · turbo 240/300/360 ms) no lugar da roda: cada giro resolve **uma** casa e os 3 rolos param no **mesmo** símbolo (aparência clássica de "3 iguais"); o motor de 1 casa (pesos, sorte, pressão, verificação) foi preservado — adaptação registrada (docs/13 §Decisões da fase 3).
- **Arquivos alterados:** `src/game/roulette.ts` (5 casas novas + `SLOT_COMBOS` + `slotKakuzuRyu` + `rouletteCost` com zona) · `src/scene/GameCanvas.tsx` (ramos dos giros, entrega dos combos com limite de item, armadilha shinobi, renome) · `src/ui/TsunadeRoulette.tsx` (rolos + face + humor) · `src/tsunade-roulette.css` · `src/audio/sfx.ts` (`explosion`) · `src/game/catalog.ts` (Dente de Ouro/Carteira Gama-chan) · `scripts/verify-rules.mjs` (asserções).
- **TESTADO (12/11, sessão Bionic):** `tsc -b --force` ✓ · `vite build` ✓ (428 ms) · `verify-rules` ✓ (boa chance sorte 0 = **30,88%** · giro 4 = **251** · zona 2 = **38** · zona 3 = **45** · Kakuzu 120/240/480) · `verify-runtime` (Edge headless) ✓ — 0 exceções JS, 0 assets 404, todos os checks de gameplay.
- **PENDENTE:** (a) **arte das 3 expressões da Tsunade** (feliz/triste/nervosa) — por ora o mesmo retrato do roster + badge/glow de humor (reage, mas não são 3 artes distintas) — fila da fase de arte (skill `criar-arte-shinobibonk`); (b) teste do usuário com GPU real — calibração de custo/combos em iteração (regra da rodada 35: o usuário testa a gameplay e ajustamos).
- **Descartado nesta rodada (JÁ EXISTE no jogo — regra do usuário 12/11):** HP com números na barra (já existe no HUD) · teclas 1–N no pool de escolha (já existe) · desconto de custo da roleta (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40% — **mantido** na nova fórmula) · White Flute (a Pílula de Incenso já existe; a rodada 37 aprovou o **ITEM novo** "White Flute" na fila da fase 4 — Incenso se mantém) · YOOOO sintetizado (o MP3 real foi integrado na fase 1, commit `d05f168`) · HUD base/arte de menu (parcialmente entregue na rodada 38, commit `fd79ced`) · animação de ataque + caminhada (resolvida na rodada 38, commit `fd79ced`) · Kankuro (já resolvido pelo usuário — não tocar).

## Rodada 38 — Animação andar+atacar, HUD ninja, ABRIR_JOGO e proposta de novos shinobis · 12/11/2026

- **Andar atacando com a animação completa** (usuário: "ele tem que andar liso atacando, mas a animação de movimentação dele levantar os braços e usar o hit, tem que continuar fluído"). Causa: desde 4d1e798 o estado ficava `walk` durante o golpe e os quadros da folha de ação nunca apareciam. Agora, parado ou andando, o golpe toca inteiro (preparação → selo/soltura → recuperação); andando, a passada continua nas pernas do quadro de ataque, na mesma fase da caminhada, e a caminhada retoma sem pular quadro. O deslocamento não muda. Exceções preservadas: Ultimate (pose especial), chute de Lee/Guy e Gaara (flutua). Vale para jogador, ajudantes, clones e mega elites. (`src/scene/playerMotion.ts`)
- **Encadeamento com velocidade de ataque alta**: um pedido de ataque antes de 75% do golpe (`CHAIN_AT`) entra na fila e começa ao passar de 75%; o golpe não reinicia nem pisca.
- **Testes**: `motion().anim` no gancho `?test=1` (GameCanvas.tsx); `verify-motion-atlases` verifica as 56 versões andando+atacando e o encadeamento. Skill `movimentar-shinobi` com as regras "Andar atacando" e "Encadeamento".
- **ABRIR_JOGO.bat à prova de pasta movida**: a mudança da pasta para `C:\Shinobibonk projeto\` quebrou os atalhos internos do `node_modules` (o Vite deixou de existir) — dependências reinstaladas com `pnpm install --frozen-lockfile`. O .bat agora acha o Node (runtime do Codex ou PATH), detecta Vite ausente/quebrado e reinstala sozinho (pnpm do Codex → corepack pnpm → pnpm → npm); mensagens em português, `pause` no erro, opções `--no-open`/`--port N`.
- **HUD e interface com tema ninja** (prévia de `docs/previas/hud-ninja/` aplicada ao jogo): pergaminho, placa de madeira, selo vermelho, barras em pincelada, slots ofuda, Ultimate em selo com AUTO (Y mantido), minimapa com aro de corda, cartas de nível com a cor da raridade; hub, seleção de shinobi e seleção de mapa redesenhados. Ficha P, Bolsa, Plano, Ataques, Passivas, configurações e resumo **só herdaram os tokens** (cores/fontes/molduras). Novo `src/ninja-theme.css`; paleta fria dos CSS convertida para madeira/papel.
- **Menu inicial com fundos ilustrados** (só arte do projeto): as 4 vilas de `map-previews-v1.png` se alternam (respeita "reduzir movimento"), monumento/estátuas/torii em camadas, vinheta e losangos, faixa de miniaturas das vilas e o shinobi escolhido com fala.
- **Fontes locais** Reggae One e Baloo 2 (SIL OFL 1.1) em `public/assets/fonts/` com as licenças; sem CDN (pronto para o .exe/offline).
- **Correção**: cartões de ajudantes não encolhem mais dentro da coluna com rolagem (o texto vazava).
- **Proposta de novos shinobis** em [docs/22](docs/22-PROPOSTA-NOVOS-SHINOBIS.md) (PROPOSTO, nada implementado): 11 Kages/líderes + 3 ondas de elenco clássico/Shippuden, fichas com versões, técnicas únicas, passivas, arte e efeitos, pesquisa na Narutopedia; aponta **divergências canônicas** na lista aprovada na rodada 37 (aguardando o usuário).
- **Ponteiros** `.claude/skills/` criados para `contexto-e-decisao`, `documentar-projeto` e `referencia-externa`.
- **Registro tardio** (código já publicado no commit 33d8195, sem entrada no changelog): colisão de movimento com cenário (`src/scene/collision.ts`) e bordas sem vazio; elenco todo liberado para teste (`TEST_UNLOCK_ALL = true` em `src/game/account.ts` — **voltar a false antes de publicar a versão final**); Ultimate do Naruto Academia = **Jutsu Sexy** (área 6,5 m, atordoa 3,5 s, chefes 1,2 s); **Kage Bunshin** explode em área (raio 1,5 m); item **Isca Shinobi** (Raro, provisório; a rodada 37 decidiu que vira vitamina); o drop de Ryu deixou de depender da Sorte e não é mais descartado no teto de drops.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95), `verify-motion-atlases` (56 versões, 560 estados, 0 erros), `verify-runtime` (58 verificações, 0 erros JS, 0 assets 404) e capturas reais em 1600×900 e 1280×720. **PENDENTE**: revisão visual do usuário com GPU real (animação e custo de FPS da HUD) e a reinstalação automática do .bat exercitada de verdade.
- **Integração com sessão paralela (Bionic, 12/11):** a fase 2 da fila da rodada 37 (animação de ataque + caminhada) foi resolvida por **duas sessões em paralelo** — o Bionic criou uma camada sobreposta (`attackLayer`, validada localmente, commit `841f5bd`) e esta rodada 38 a resolveu com o modelo adotado (golpe inteiro no sprite base + passada nas pernas + encadeamento). **Estado final = este commit**; a variante do Bionic foi descartada (menos completa) mas **preservada na branch `backup-r37-fase2-overlay`** para comparação visual. Status da fila da rodada 37 sincronizado em [docs/13](docs/13-PENDENCIAS-PARA-CONTINUAR.md): 1 ✅ · 2 ✅ · 5 e 9 parciais · 3 (Caça-Níquel) próxima · 4/6/8 pendentes · 7 em proposta (`docs/22`, aguardando o usuário).

## Rodada 37 — Autorização do mega-lote + novos specs · 12/11/2026

- **AUTORIZADO pelo usuário** ("Aprovo os Kages · Aprovo o Elenco Tier A · Ok pasta com áudio, já inclua este que enviei no 'Jogar' · Pode colocar esse caça níquel") — a fila inteira da rodada 35 (docs/13) foi liberada para implementação e as 9 perguntas em aberto foram respondidas (docs/18 §4, linha 37 · integral em docs/14).
- **Novos specs aprovados (12/11):**
  - **Elenco:** Kages **APROVADOS** + **primeiros Kages de cada vila até o Shippuden** (Hanzo 1º Tsuchikage · Mei Terumi 1ª Mizukage; pesquisa na NarutoWiki) + **correção de canon (A = 3º Raikage · Killer B = 4º Raikage)**; **Tier A (17) APROVADO**; **Tobi ×2** (Akatsuki + outra versão); **Nagato = personagem SEPARADO do Pain** (kit: Tensei + Invocação dos Pain's + caminhos de Pain); **Yahiko = o PAIN** (kit: barras de chakra + Tensei).
  - **Caça-Níquel da Tsunade:** **combos de 3 iguais** (3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros · 3 Jirayas = item raro+ · 3 Hiruzens = 4 escolhas de itens · 3 Hidan = −5% HP +5% dificuldade +5% monstros · 3 Kakuzus = bônus de Ryu por sorte/dificuldade), **emboscada invertida** (armadilhas shinobi/papéis bomba explodem ao redor do jogador e **matam os monstros próximos** — jogador **seguro** durante a interação; a horda retoma ao sair) e **custo por giro subindo gradual e considerável, escalando como o Ryu por zona**.
  - **Itens/pílulas:** renames com arte/ícone exclusivos — "Pergaminho de Ressurreição" (35%) → **Células de Hashirama** · "Rinne Tensei" (60%) → **Chakra de Hagoromo**; **White Flute = ITEM novo** (horda maior + mais Ryu/leveling) — a **Pílula de Incenso SE MANTÉM**; teto de pílulas **9/13/15** (base 9 · buff de conta = **Passivas Shinobi** por Lamens aplicando no **início da run** → 13 · buff de item Cabaça +2 → 15); **Isca Shinobi → vitamina**.
  - **HUD/tema:** **barra de HP com números no PÉ DO PERSONAGEM**; **HUDs recriadas no tema Naruto/ninja/japonês**; **glossário** (atributos no estágio, efeito de cada pílula, **% de mega crítico após o crítico 100%**, alfas/ajudantes com buffs + combos de facção/aldeia/família); streak em tempo real; abates totais; card de temporada.
  - **Áudio:** **YOO MP3** (baixado pelo usuário) no botão Jogar/Jogar-como-convidado com **corte a partir do 1 s**; **ytmp3.yt autorizado** para os demais sons de jutsu (falhou → o usuário baixa e entrega a pasta); anti-spam mantido (o próximo som só toca quando o anterior **termina** — não é fila).
  - **Folhas:** caminhada **frente (baixo) e costas (cima)** seguindo o modelo de criação do projeto.
- **Fases de implementação (ordem):** 1) áudio YOO + gate anti-spam → 2) animação de ataque + caminhada (regressão da 33) → 3) Caça-Níquel da Tsunade → 4) itens/pílulas → 5) HUD (tema Naruto) → 6) balance (início fraco/gradual, monstros aos 6 min, treinamento +0,6% aleatório, pergaminhos no chão, mapa maior + spawns alcançáveis) → 7) personagens novos → 8) folhas frente/costas → 9) arte dos menus.
- **Fase 1 — IMPLEMENTADO (commit `d05f168`):** `playYooo()` agora reproduz o **MP3 real** do usuário (`public/assets/audio/yooo.mp3`) com **offset de reprodução em 1,0 s** (equivalente funcional ao corte de 1 s; ffmpeg indisponível no host — documentado); fallback sintetizado mantido para falhas; `jutsuGate()` no `playTechniqueSound()` impede o próximo som de jutsu enquanto o anterior **não terminou** (regra anti-spam, não fila; fala em voz também estende o gate +2,4 s). Validações: `tsc -b` ✓ · `vite build` ✓ (425 ms) · `verify-rules` ✓ (56/56/97/95).
- **Documentação sincronizada:** docs/13 (fila AUTORIZADO + specs da 37), docs/18 (§2/§3/§4 linha 37/§5/§6), docs/20 (estados APROVADO + fila), docs/21 (roster APROVADO + Hanzo/Mei/Tobi×2/Nagato/Yahiko).
- **GitHub:** commit + push deste registro.

## Rodada 36 — Segurança, backup e segmentação segura de contexto · 12/11/2026

- **Regra reafirmada (pedido do usuário):** material de outros jogos **nunca** fica na pasta do projeto — verificado: `<pasta arquivada>/` (prints/vídeos/frames/`CONTEXTO-COMPLETO.md`) na raiz do workspace, **fora do repositório**; 0 arquivos rastreados mencionam o jogo de referência. Regra permanente em `docs/19` (regra 6) + skills.
- **Avaliação de segurança (pergunta do usuário):** o prompt de segmentação é **seguro para executar** — não destrutivo, dentro da pasta autorizada, sem tocar código/assets/Windows, com parada em caso de dúvida. Executado **adaptado ao próprio texto do prompt** (§2 autoriza "manter a estrutura + índice agregador, sem consolidação física" e §3 proíbe duplicados): não se criaram 15+ documentos paralelos — apenas índice + os domínios que **faltavam**.
- **Backup integral ANTES de qualquer alteração (pedido do usuário):** `backup-ShinobiBonk-2026-11-12.zip` na **raiz do workspace (fora da pasta do projeto)** — 980 MB; **2.882 arquivos** (exatamente a contagem do projeto sem `node_modules`); 0 entradas de `node_modules`; hashes SHA-256 de amostra (CHANGELOG.md, AGENTS.md) extraídos do zip = idênticos ao original. `node_modules` excluído de propósito (regenerável via `npm ci`); `.git` incluído.
- **FASE A — Inventário + backup:** 14 docs + 6 skills + AGENTS.md + CHANGELOG inventariados; backup criado e validado (contagem, ausência de node_modules, hashes).
- **FASE C — Documentos novos (aditivos, zero remoção):**
  - `docs/19-INDICE-DO-CONHECIMENTO.md` — **índice agregador**: mapa de 19 domínios → onde vive (doc + código), fluxo de recuperação seletiva, 6 regras permanentes de manutenção (não destrutivo, sem fonte paralela, atualização contínua, conflitos, referências visuais do próprio jogo, material externo fora do projeto), **manifesto de migração com rastreabilidade** (inclui os 2 domínios do prompt **NÃO APLICÁVEIS**: QWEN.md/ComfyUI) e validação da rodada.
  - `docs/20-SCALING-EREGULAS.md` — **todas as fórmulas e valores lidos do código em 12/11**: dificuldades (Genin 1/Chunin 1,4/Jonin 1,9/Kage 2,6), escala de inimigos por minuto (com tabela Genin), zonas (×1/1,18/1,38), Final Swarm (×3 + 25%/min, teto 8.000), elite/mega (8%, 30%, 55%), atributos do jogador (dano/HP/EXP/crítico/sorte), crescimento de técnicas (GROWTH_ROLLS + TECHNIQUE_SCALE 1,2), roleta (30 × 1,35^giros, desconto teto 40%), pílulas (10 hoje · 9/13/15 PROPOSTO), drops (Ryu 72% etc.), mundo (raio 76, zona 10 min), painel F9 (41 multiplicadores, base Genin).
  - `docs/21-ELASTAO-DE-HEROIS.md` — roster completo (24 famílias + 32 versões = 56) com títulos/eras, regras do elenco e **fila de novos** (7 Kages com conceito a aprovar + 17 Tier A) com estados.
- **FASE F — Skills atualizadas:** `contexto-e-decisao` (docs/19 como 2º passo da leitura + regra sem duplicar + material externo fora do projeto) e `documentar-projeto` (regra de manter `docs/19-21` sincronizados com a alteração; falhou → registrar inconsistência em `docs/13`).
- **Validação (FASE E):** git da rodada apenas **aditivos** + atualizações de sync; **nenhum código de jogo ou asset alterado**; nenhum contexto original (`docs/14`/`docs/18`) apagado ou resumido; todos os blocos novos com origem (código ou pedido do usuário) e estado; links verificados.
- **Adaptações registradas:** "QWEN.md" (não existe — equivalente `AGENTS.md` + `skills/`) e "ComfyUI" (não usado — arte via `criar-arte-shinobibonk`) marcados **NÃO APLICÁVEL** no manifesto, sem suposição.
- **GitHub:** commit + push desta rodada.

## Rodada 35 — Plano do mega-lote (HUD, personagens, sons, scale, pílulas, mapa) · 12/11/2026

- **Somente plano — nenhum código de jogo alterado** (pedido do usuário: "me dê o retorno do que consegue e não consegue e eu vou autorizar o começo do trabalho").
- **Material novo consumido e arquivado FORA do projeto** (skill `referencia-externa`, zero rastro no repositório): 7 telas de HUD/menu de referência (prints `r35-naruto-ui-*`) + 23 frames de 6 vídeos de gameplay (`frames-6-videos/`) + links de áudio (YOOOO, jutsu padrão, Kage Bunshin) — tudo em `<pasta arquivada>/` (raiz do workspace, fora do repositório), registro em `CONTEXTO-COMPLETO.md` §9.
- **Fila da rodada 35** registrada em [docs/13](docs/13-PENDENCIAS-PARA-CONTINUAR.md) (PROPOSTO/aguardando autorização) em 4 fases: (1) regressão da animação de ataque + infra de som + Caça-Níquel da Tsunade + treinamento esgotado → aleatório +0,6% + pílulas 9/13/15 + Isca Shinobi → vitamina + pool informativo; (2) HUD (abates, streak, temporada, glossário, itens esquerda/skills+pílulas direita) + menus no padrão das 7 telas + planejador de fusões/builds com salvar builds; (3) balanceamento em iteração (jogador inicial mais fraco, monstros fortes aos 6 min, escala por dificuldade) + mapa +30% com spawns alcançáveis + pergaminhos no chão (Ryu por zona + sorte) + personagens novos (7 Kages com **aprovação de conceito ANTES de criar** + 17 do Tier A clássico/Shippuden com evolução por era); (4) análise dos 6 vídeos para números de scale.
- **Novas decisões permanentes** (docs/18 §3, datadas 12/11): escopo do agente (somente `C:\Shinobibonk projeto - Copia`; navegador só para testes; aprovação automática de acessos); regra de descarte (novo que já está no jogo → descartar + listar ao final); anti-spam de som (o próximo som só toca quando o anterior **termina** — não é fila); treinamento esgotado = **atributo aleatório +0,6%/nível** (substitui "somente Sorte +0,8%"); pílulas **9/13/15**; Isca Shinobi → vitamina; **Caça-Níquel da Tsunade** (renomear + arte feliz/triste/nervosa + custo subindo gradual e considerável); personagens (Kages com aprovação antes de criar + Tier A); pergaminhos no chão; mapa maior + spawns alcançáveis; HUD no padrão das referências; animação de ataque deve coexistir com a caminhada (senão, voltar ao estado anterior).
- **Descartado (JÁ EXISTE, pela regra do usuário):** HP com números, teclas 1–N no pool, desconto de custo da Roleta (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%), White Flute (Pílula de Incenso), "YOOOO" sintetizado, frente/costas na caminhada (validar visualmente).
- **Limitações declaradas ao usuário:** o agente **não baixa áudio do YouTube** nesta sessão (o usuário baixa e entrega a pasta; proposta `assets/sons/`); a **foto do late game não chegou** (pedido de reenvio; o frame v4 dos vídeos é a referência recebida).
- **Perguntas em aberto (9)** em docs/13 (foto, buff de conta, 0,6%, Kages, Tier A, pasta de áudio, ×1,70, +30%, iteração de balance).
- **GitHub:** commit + push deste registro (sem código de jogo).

## Dificuldade, scale de habilidades, ficha e renderizador (preparo .exe) · 11/11/2026

- **Early game mais difícil em todas as dificuldades** (usuário: "dificulte mais o early game de todos os modos de jogo que temos em suas devidas proporções"): o Genin perdeu o desconto inicial de 66% — todas as dificuldades nascem na força plena do tier (1 / 1,4 / 1,9 / 2,6) e a base do minuto 0 subiu (HP ×1,6 · dano ×1,45), decaindo proporcionalmente com o tempo (5 min ≈ ×1,20 · 10 min ≈ ×1,13 · 30 min ≈ ×1,05). (`src/game/progression.ts`)
- **Dificuldade individual por zona (fase)** (usuário: "verifique o nível de dificuldade também individual para cada fase do jogo"): nova `ZONE_DIFFICULTY` (zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38) aplicada ao HP, dano, spawn e pressão de roleta de cada zona. (`progression.ts`, `src/scene/GameCanvas.tsx`)
- **Scale de dano e % de todas as habilidades aumentado** (usuário: "aumente o scale de dano e % de todas as habilidades do jogo" + "deixe mais difícil, alguns personagens estão fazendo os mapas muito fáceis"): `GROWTH_ROLLS` com base ×1,5 e spread maior em todas as raridades (Comum +45–67% · Lendário +375–485% por nível) e novo `TECHNIQUE_SCALE` (×1,2) aplicado ao dano das técnicas do jogador e dos ajudantes (kits dos chefes já escalam por fase e não mudaram). (`src/game/combat.ts`, `GameCanvas.tsx`)
- **Números de dano podem seguir spammando** (usuário: "pode deixar os números spammando na tela"): teto na tela de 60 → 300 (pool de sprites preservado). (`GameCanvas.tsx`)
- **Tabela de utilidades de volta na ficha** (usuário: "volte a tabela de utilidades para a ficha do personagem, em outra rodada foi retirado"): bloco UTILIDADE com 9 linhas — velocidade, coleta, sorte, experiência, Ryu, recarga da Ultimate, vagas de suporte, dano de aliados, cadência de aliados. (`src/ui/RunSheet.tsx`)
- **Gráfico de crescimento por nível na ficha** (referência visual: vídeo enviado pelo usuário, arquivado FORA do repositório): cada técnica aprendida mostra barras "Crescimento por nível · dano por golpe" (nível 1 → atual, dano exato por nível). (`RunSheet.tsx`, `src/run-ui.css`)
- **Treinamento esgotado sobe somente Sorte** (usuário: "quando não temos mais nada para evoluir em habilidades/pílulas aumentar só a 'Sorte'"): pool de técnicas/pílulas esgotado → level-up agora dá +0,8% de Sorte; antes era atributo aleatório. (`GameCanvas.tsx`)
- **Renderizador DirectX/OpenGL nas configurações** (preparo do .exe/patch, pedido do usuário em rodada anterior e confirmado agora: "também tem que acompanhar uma configuração semelhante para já ficar preparado um executável"): nova opção na aba Tela — no navegador a renderização é sempre WebGL (melhor esforço); no .exe/patch o jogador escolhe o motor. (`src/game/settings.ts`, `src/ui/SettingsScreen.tsx`)
- **Kankuro RESOLVIDO** (usuário: "kankuro já foi corrigido"): arte das folhas 1/15/30 + walk/action v3 confirmada no repositório; fila atualizada. (docs/13)
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless, todos os checks verdes, sem exceções JS nem assets 404).

## Andar durante o ataque + economia de geometria dos anéis · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Porque no MEU computador o jogo está lagado, 20 FPS? Mesmo quando eu fecho tudo relacionado a IA?" + "O personagem não deve travar/parar de andar na animação de ataque, se ele tem ataquespeed para atacar e consegue andar, deve continuar andando fazendo os movimentos."
- **Andar durante o ataque** (`src/scene/playerMotion.ts`): o ataque normal não interrompe mais a caminhada — com input de movimento o estado fica `walk` e o corpo continua o ciclo de caminhada, com o golpe nos braços (balanço `swing` aplicado em `pose.apply`, inclusive por cima dos quadros de folha de caminhada); parado, o ataque é exatamente como antes. A **Ultimate mantém a pose especial** (prioridade de sempre); pulo, dash e dano não mudaram.
- **Anéis de efeito sem churn de geometria** (`src/scene/GameCanvas.tsx`): os anéis (escudo, espinhos, Chidori Nagashi, Amaterasu, ressurreição etc.) criavam `TorusGeometry` nova a cada uso e a disporiam ao terminar (upload de GPU + GC contínuo); agora há **cache por tamanho** (mesmo visual: torus .11 por size), criada uma vez por size e liberada **só no unmount** (via `runCleanups`); o material segue por anel (dispõe ao terminar, como antes).
- **Diagnóstico do 20 FPS**: o domínio novo do Netlify é um `localStorage` novo → configurações nascem no padrão `Qualidade Alta` + resolução cheia (o mesmo diagnóstico da rodada 23); o jogo é GPU-heavy por design (hordas de 60+ inimigos em tela, teto 1.600, Final Swarm 8.000; sprites 3D + efeitos + números de dano = centenas de draw calls); fechar apps de IA não muda o custo do jogo na GPU do navegador. **Ação do jogador**: Gráficos → Qualidade `Média`/`Baixa` e/ou Tela → Resolução `900p`/`720p` (fica salvo naquele domínio/navegador); GPU "Alto desempenho (dedicada)" (padrão) e aceleração de hardware do navegador ligada.
- **Não otimizar o que já está otimizado** (verificado no código): números de dano já com pool + cache LRU de textura (teto de 60 ativos), terreno pré-amostrado em grade, pixel ratio limitado (≤1,5) — o ganho real é das configurações do jogador + esta economia de geometria.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless — todos os checks verdes, sem exceções JS nem assets 404).

## Decisão: excluir e recriar o repositório no GitHub · 11/11/2026

- Decisão do usuário (CONFIRMADO): "eu vou excluir o repositório e depois criar outro para utilizarmos, não se preocupe mais com isso" — a pendência do **suporte da GitHub foi encerrada** (não se prepara mais nada).
- **Efeito:** o zip de origem não verificada (`artifacts/sb-swishes-source.zip`) e os prints/docs antigos saem do GitHub **com a exclusão do repositório** — sem reescrita de histórico, sem force push.
- **Até a recriação:** commit + push segue no repositório atual (`main`); o `.gitignore` já protege o zip contra nova entrada.
- **Quando o novo repositório existir:** atualizar o remoto (`git remote set-url origin <novo-url>`) e publicar; a pasta arquivada do jogo de referência segue fora do projeto (raiz do workspace).
- Registro: decisão permanente em docs/18 §3, estado do repositório em §5, resumo da rodada em §4 (linha 32), mensagem integral + respostas em docs/14.

## Contexto, skills e registro completo · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Deixe o changelog atualizado e verifique se a skill de atualizar os log's manda exatamente documentar TUDO que nós fazemos de alteração, inclusive... você consegue também subir para o github as alterações e sempre atualizar lá? Criar uma skill .markdown para SEMPRE ler os contextos e .skills para tomar decisões de alterações, isso serve para quando resetar o contexto, você usar as outras skills já criadas, inclusive a que temos para salvar contexto, para você utiliza-la, assim como todas as outras, ler as documentações... e tomar a melhor decisão sempre. não se esqueça de atualizar o github"
- **Nova skill `skills/contexto-e-decisao/SKILL.md`**: no início de toda tarefa — e principalmente após reset de contexto ou handoff de outro agente — (1) ler o contexto na ordem (AGENTS.md → docs/18 → docs/14 → docs/13 → CHANGELOG → README/docs/00/doc temático); (2) ler e usar as skills do projeto (`documentar-projeto`, `publicar-github`, `criar-arte-shinobibonk`, `movimentar-shinobi`, `referencia-externa`); (3) decidir pela ordem decisão permanente do usuário > código (fonte da verdade) > documentação, com PROPOSTO para o que o usuário não aprovou; (4) fechar a rodada com registro completo (TUDO) + commit/push + relatório em pt-BR.
- **`documentar-projeto` agora manda explicitamente "documentar TUDO"** (regra do usuário, 11/11): toda alteração — código, configuração, controles, assets, sistemas, skills, textos, decisões, testes — entra no registro na mesma tarefa, sem exceção; `CHANGELOG.md` em toda mudança (jogo, documentação, skills, processo), sem "mudança pequena demais para registrar"; `docs/14` com o pedido integral + resposta, `docs/18` com resumo/direção, `docs/13` com o que falta.
- **`publicar-github` endurecida**: stage com `git add -u` + novos arquivos por nome — nunca `git add -A` em bloco (poderia estagiar não rastreado); commit em português + push para `origin main` ao fim de toda tarefa; nunca force push.
- **AGENTS.md**: nova seção "Antes de qualquer tarefa" aponta a skill `contexto-e-decisao` como primeiro passo; "Documentação contínua" ganhou a regra de documentar TUDO.
- **GitHub sempre atualizado**: commit + push ao fim de toda tarefa é regra permanente (AGENTS.md + skill); nesta sessão: `ab87de2`/`5aa28c6` (rodada 30) + este commit.
- **CONFIRMADO**: documentação e skills em sincronia; repositório publicado e worktree limpo (push para `origin main` OK).

## V-Sync, placa de vídeo e fim da suavização da câmera · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Retirar a suavizaçãao de câmera, colocar opção de v-sync no jogo. Não sei exatamente se da pra utilizar jogando o jogo via navegador, mas quando formos fazer o nosso .exe do jogo/patch do jogo, deverá ter nas configurações também, ligar e desligar e também opção para selecionar a placa de vídeo do jogador ou rodar em openGL."
- **Suavização da câmera retirada** (`src/scene/GameCanvas.tsx`): zoom instantâneo (muda direto para o alvo, sem perseguição exponencial) e altura da câmera seguindo o jogador na hora (removidos `damp`/`jumpedZone`). O giro (yaw/pitch) já era direto desde a rodada 29 (mouse 1:1).
- **V-Sync** (Gráficos; `vsync` em `settings.ts`, padrão LIGADO): ligado = `requestAnimationFrame` (um quadro por quadro do monitor); desligado = loop acima da taxa do monitor (`setTimeout(0)`, pausado em aba oculta) — melhor esforço no navegador (ele ainda pode limitar); no .exe a sincronização sai direto do motor.
- **Placa de vídeo** (Gráficos; `gpu` em `settings.ts`, padrão "Alto desempenho (dedicada)"): Automática / Alto desempenho (dedicada) / Integrada (economia) → `powerPreference` do contexto WebGL (default / high-performance / low-power); trocar em tempo real recria o contexto (dispose + `forceContextLoss` do antigo) e reinicia o loop; saves antigos sem os campos são migrados pelo espalhamento dos padrões.
- **"Rodar em openGL"**: a versão web não expõe escolha de API de render (o motor escolhe WebGL2/WebGL1); o card "Monitor e motor gráfico" (Tela) agora registra que no .exe/patch o jogador também escolhe o renderizador (OpenGL/DirectX).
- **Corrigido flake do `verify-runtime` (re-lock após escolha)**: a isenção de teste do `CHOICE_GUARD` (`guardOff`) só valia quando `testPointer` era `true` — e o teste de lock usa `?test=1&pointer=real`, onde `testPointer` é `false`; com o guard ativo, o clique na carta (chegando em < 0,5 s) era descartado pelo `onChoose` antes do re-acionamento do ponteiro, e o teste morria no `waitForFunction` do re-lock. A isenção agora vale para qualquer página `?test` sem `&guard=1` (só em desenvolvimento), como já documentado em docs/12 e no comentário do código.
- **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56 versões, 97 técnicas, 95 itens) e `verify-runtime` (Edge headless — todos os checks verdes, incluindo "P fecha a ficha…", "Esc fecha a pausa…" e "ponteiro volta após escolha"; sem exceções JS nem assets 404).

## Mouse sem aceleração (raw input) · 11/11/2026

- Pedido do usuário (CONFIRMADO): "rawinputbuffer é em relação a aceleração do mouse, quanto mais mexe o mouse mais rápido fica, eu quero que isso não aconteça... quero que ele fique sempre a mesma velocidade e a sensibilidade funcione exatamente da forma que o jogador configurar nas configurações que temos no jogo".
- Causa: a câmera perseguia o alvo do mouse com amortecimento exponencial (`MathUtils.damp` em `yaw`/`pitch`), então movimentos rápidos "apanhavam" a câmera e pareciam aceleração; e, sem `unadjustedMovement`, o `movementX/Y` que chega ao navegador já vem acelerado pelo sistema operacional do mouse.
- `captureGamePointer` (`src/scene/GameCanvas.tsx`) agora pede o pointer lock com `{unadjustedMovement:true}` — raw input do navegador (Pointer Lock 2.0, baseline 2026); em navegadores antigos a opção é ignorada e o lock segue funcionando.
- `turnCamera` aplica o movimento direto em `yaw`/`pitch`: removidos `targetYaw`/`targetPitch` e o `damp` do loop de render. O giro passa a ser exatamente `movimento × 0.006 (Y: 0.004) × sensibilidade`, constante, independente da velocidade do mouse.
- A sensibilidade continua o multiplicador linear 0.20–3.00 de Controles (inverter Y e distância da câmera inalterados); o hint da opção agora explica o 1:1.
- **TESTADO**: `tsc -b`, `vite build` e `verify-rules` passaram (56 personagens, 97 técnicas, 95 itens).

## Remoção do ajuste automático de desempenho · 11/11/2026

- Pedido do usuário (CONFIRMADO): "Eu não quero o auto-render para melhorar FPS, deixe o jogador configurar como quiser nas configurações gráficas isso, volte ao normal como estava!"
- Removido `src/scene/adaptiveGovernor.ts` e todo o uso em `GameCanvas.tsx` (loop de render, handler `shinobi-settings`, leitura de debug `autoRatio`/`autoDeficit`).
- Removidos a opção **Ajuste automático de desempenho** de Gráficos (`SettingsScreen.tsx`) e o campo `autoPerformance` (`settings.ts`); configurações salvas antigas que o continham passam a ser ignoradas.
- O pixel ratio volta a ser definido apenas por Qualidade/Resolução; Limite de FPS continua em Gráficos. Se o FPS estiver baixo, o jogador ajusta: Qualidade `Média`/`Baixa` ou Resolução `900p`/`720p`.
- **TESTADO**: `tsc -b`, `vite build` e `verify-rules` passaram após a remoção. A entrada anterior permanece como registro histórico.

## Ajuste automático de desempenho (FPS) · 11/11/2026

- Novo `src/scene/adaptiveGovernor.ts`: mede o intervalo real entre quadros (inclui a espera do GPU) e, se o FPS cair abaixo de ~55, reduz o pixel ratio do renderizador em passos (×0,85, piso 0,5); se sobrar folga (~80 fps ou mais), devolve (×1,12, nunca além do ratio configurado). Warmup de 4 s, histerese 18/12 ms contra oscilação, pausa quando o jogo está parado e ignora intervalos >250 ms (aba oculta/travada).
- Nova opção **Ajuste automático de desempenho** em Gráficos (ligada por padrão); desligar devolve o ratio ao valor configurado. Não altera dano nem jogabilidade — só a resolução da imagem.
- Motivo (CONFIRMADO): as configurações ficam por navegador/domínio (`sb_settings_v1` no localStorage), então um domínio novo (ex.: Netlify) começa com os padrões — qualidade `alta`, resolução automática (até 1,5× os pixels do dispositivo) e FPS sem limite — mais pesado que os ajustes usados em `localhost`. Versões recentes também somaram efeitos (partículas, Susanoo, totens). A simulação não é o gargalo (TESTADO: 1,8 ms/frame com 1.200 inimigos).
- **TESTADO**: testes do governor (descida em carga pesada, recuperação, piso, inativo, teto novo, snap), `tsc -b`, `vite build`, `verify-rules` e smoke no Edge headless com 1.200 inimigos — `autoRatio` caiu de 1 → 0,61 sob carga, sem erros de página.
- **PENDENTE**: validar em GPU real (máquina do usuário) no deploy Netlify. Se ainda estiver baixo: Gráficos → Qualidade `Média`/`Baixa` ou Tela → Resolução `900p`/`720p`.

## Deploy Netlify · 11/11/2026

- O 404 "page not found" do Netlify (CONFIRMADO pelo print do usuário) veio da publicação parcial: o primeiro upload arrastou só o `index.html` raiz sem a pasta `assets/` (drag & drop do Netlify fica instável acima de ~50 MB; o site construído tem ~204 MB / 343 arquivos). Subindo a pasta `dist` (ou um zip com a estrutura `index.html` + `assets/` na raiz) o site carregou — usuário: "acho que deu certo".
- `netlify.toml` existe no projeto (build `npm run build`, public `dist`, SPA fallback) para uso futuro via Git/CLI; o deploy atual é manual, sem conexão com o GitHub.

## Filtro de raridade com as cores do jogo

- O plano de build (aba Itens) ganha botões de raridade coloridos e combináveis: Comum (cinza), Incomum (verde), Raro (azul), Épico (roxo) e Lendário (dourado), com contagem por raridade, "Todas as raridades" e aviso de raridades combinadas. Funciona com a busca e com os filtros de tipo, elemento e atributo; "Limpar filtros" também limpa as raridades. Os itens da lista ganham uma faixa lateral na cor da raridade.
- A Bolsa da Missão passa a usar o mesmo componente (`src/ui/RarityFilter.tsx`), agora combinável (antes era uma raridade por vez).
- Cores centralizadas em `src/rarity.css` (`--rarity-comum` … `--rarity-lendario` e variantes `-strong`), com os mesmos valores já usados no texto de raridade, nos pontos dos cards da Bolsa e nas bordas das cartas de oferta. As classes `rarity-*` expõem `--rarity`/`--rarity-strong`.
- Validado no Edge headless: Raro + Épico no plano (16 + 14 itens), busca combinada, Limpar filtros e Raro + Lendário na Bolsa. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Ultimate por fase e Mega Elites/ajudantes como versões

- **Ultimate por fase**: conferidas as 56 versões; todas têm Ultimate própria desde o Nv. 1 (R manual e Y/AUTO), baseada numa técnica do próprio kit. Corrigidas duas fora de fase: Madara Armadura → Susanoo Perfeito; Might Guy Sétimo Portão → Tigre do Meio-Dia Supremo.
- **Mega Elites e ajudantes como versões**: a versão segue zona e dificuldade (Genin/zona 1 → inicial; Kage/zona 3 → mais avançada), com retrato, kit e buff da versão (buff da família +25% por passo). Sinergias e organizações por família; a equipe não repete família. Asuma ganhou buff de ajudante (Lâminas de Chakra), que faltava.
- Testes: `verify-rules` (Ultimate no kit da fase, mapeamento zona/dificuldade, buffs e sinergias por família) e `verify-runtime` (Kage: Mega Elite Sasuke Shippuden, selamento de Gaara Kazekage, família repetida recusada, Irmãos da Areia com versões).

## Oficina por zona, controles, mercador e emboscadas · 07/11/2026

- Cria a oficina com abas Fundir/Combinar, ícones das técnicas, retrato dos sapos e acesso à ficha. As operações compartilham um uso por zona, consumido após a união válida e persistido no save.
- Torna WASD imediato ao alternar teclas opostas. Reserva Tab para o mapa rápido e permite fechar P com retomada do ponteiro no mesmo comando.
- Fixa os preços do estoque atual do mercador. Compras afetam a cotação de novos estoques. O custo da atualização cresce ao usar.
- Acrescenta suporte por versão e afiliações por fase. Shuriken Amaldiçoada dá +8% dano total com emboscada. O Corpo de Ninja concede um nível após eliminar a onda.
- **TESTADO** — TypeScript, build, regras e 56 verificações no Edge headless. A oficina conserva o bloqueio ao salvar/retomar e renova o uso na próxima zona. Sem exceções JavaScript e sem assets 404. Captura em `artifacts/sages-workshop.png`.
- **PENDENTE** — auditoria visual de todas as ações das 56 versões e balanceamento em partida comum. O teste de desempenho usa renderização por software e não valida FPS em GPU real.



## Dash, Sakura, Gaara, Naruto e perfis locais

- Corrige a orientação do dash para todo o elenco e suaviza as mudanças de direção no WASD.
- Adiciona folhas de ações às três Sakuras, redesenha a cabaça e as ações dos três Gaaras e aplica o selo cruzado às quatro versões de Naruto nos golpes Bunshin.
- Adiciona perfis locais com Guest numerado e cadastro que preserva o progresso no mesmo navegador.

## Folhas direcionais de ação para o elenco com Susanoo

- Adiciona cinco folhas 4×4 de conjuração, pulo e dash em frente e costas para Sasuke Rinnegan, Itachi Akatsuki e Madara Armadura, Rinnegan e Seis Caminhos. O controlador compartilhado seleciona as poses pela versão em jogo. As 80 células, direções e poses foram conferidas no Edge headless; build e suítes de regras e runtime passaram.

## Calibração com referência pública

- Adiciona a calibração com o jogo de referência (level-up, pílulas, melhorias permanentes, chefes, Survival e economia) ao lado das constantes atuais e de propostas. Nenhum valor de jogo mudou; as propostas aguardam o usuário. (Documento arquivado fora do projeto)

## Pílulas com atributo atual → novo, pergaminhos por elemento e listas de itens em casa

- Pílulas mostram o atributo do personagem com o valor atual e o novo: nas cartas de level-up ("Seu atributo"), na ficha (P, "Próximo nível"), no plano de build (aba Pílulas, no Nv. 1 do shinobi) e no tooltip da barra de pílulas. Prévia em `src/game/pillPreview.ts`, com as mesmas regras de `calculateStats` (tetos de evasão e status, % de HP e multiplicador de regeneração).
- Pergaminhos de elemento (Katon, Suiton, Fuuton etc.) listam em "Melhora:" só as técnicas do mesmo elemento. O +3% de dano total não é mais listado por técnica. Sem técnica daquele elemento, a carta diz "Nenhuma técnica de Fogo aprendida ainda."
- Bolsa da Missão ganha a sub-aba "Itens em casa": até 12 listas salvas com nome, descrição e ícones, com Nova lista (bolsa atual ou vazia), Aplicar, Em uso, Duplicar e Apagar (com confirmação). Substitui as 4 predefinições fixas e mantém a chave `sb_bag_presets_v1`; saves antigos com vagas vazias são convertidos ao abrir.
- Validado no Edge headless: lista antiga convertida, criar/nomear/descrever/duplicar/aplicar/apagar e persistência após recarregar; carta de pílula, ficha, plano e barra com atual → novo; Katon e Suiton sem técnica do elemento. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Versões separadas do elenco, pulo/dash do Naruto Academia e kunais do guardião

- **Versões separadas**: as 56 formas viraram personagens jogáveis próprios (24 famílias), com kit da fase, passiva e atributos próprios (versões avançadas +12% de HP/dano por passo, +1 armadura, passivas mais fortes). Ex.: Naruto Academia → Genin → Shippuden → Kyuubi. A versão não muda de forma dentro da run. Rasengan e Byakugou viraram técnicas compartilhadas; 25 técnicas novas únicas por família (Rendan Uzumaki, Rasenshuriken, Bijūdama, Espada Chidori, Flecha de Indra, Limbo, 128 Palmas…). Total: 97 técnicas.
- **Cadeia de missões**: cada versão nova (`VERSION_MISSIONS`, campo `playWith`) só aparece para selar jogando com a versão anterior, no mapa/dificuldade da missão, depois dos abates e minutos. Cada passo é mais difícil que o anterior. O card mostra "MISSÃO DE VERSÃO" e o passo "Jogar com …"; o retrato do pré-requisito agora aparece no círculo.
- **Saves**: o id base é a primeira versão (`naruto` = Naruto Academia); `sb_hero`, desbloqueados, selados e run salva seguem válidos sem migração.
- **Pulo/dash do Naruto Academia**: a folha acrobática já existia; o estado de dano (0,23 s a cada golpe) tinha prioridade sobre pulo e dash e escondia os quadros no meio da horda. Agora pulo e dash vêm primeiro, com squash/stretch no pulo e rastro de duas cópias no dash.
- **Kunais do guardião**: as kunais grátis (1 + planos do Shikamaru) caíam em cima do portal; o E checava o portal primeiro, entrava nele e `clearZone` apagava as restantes. Agora caem num círculo de 3,4 m, a coleta próxima tem prioridade e o portal avisa enquanto houver kunai grátis no chão.
- Verificação: `tsc`, `vite build`, `verify-rules` (56 versões, cadeia, únicas por família) e `verify-runtime` (pulo/dash com dano, Naruto Genin com Gamabunta, 3 kunais coletadas antes do portal, missão de versão só com o Academia) passaram.

## Final Swarm crescente, pílulas só por escolha e altares por raridade

- **Final Swarm**: o teto do swarm era cortado em 1.600 (já atingido aos 10 min), então a horda não triplicava; com build forte, o spawn ×3 perdia para o abate e a horda estabilizava perto de 300. Agora o teto é 1.600 × fator do swarm (×3, +25%/min) até `FINAL_SWARM.maxEnemies` = 8.000, o spawn repõe o teto em ~4 s (`refillSeconds`), até 120 por quadro, e os inimigos do swarm nascem a 14–28 m. Medido no Edge headless: +1 min → 6.094 vivos; +3 min → 8.000; matando tudo a cada 2 s a horda volta a ~1.800–2.000.
- **Pílulas sem escolha**: a única fonte é a carta do level-up, mas com níveis em fila o novo conjunto de cartas surgia sob o cursor e o clique/duplo clique ou tecla 1–9 dado na tela anterior pegava a carta nova (muitas vezes pílula). Cada conjunto novo agora ignora clique e teclas por 0,5 s (`CHOICE_GUARD`). Teste: 6 aberturas com clique + tecla imediatos → 0 escolhas; duplo clique com níveis em fila → exatamente 1 escolha (sem a proteção: 6 escolhas involuntárias e um duplo clique que pegou 2).
- **Altares por raridade**: pisar no círculo começa a contar, sem E; fora do círculo a porcentagem cai, mais rápido quanto mais raro (Normal 4%/s … Lendário 18%/s), com progresso por altar e círculo vermelho fora (`ALTAR_RULES`).

## Alinhamento do HUD e Ryu em formato curto

- Barra da missão em blocos: missão e clima/zona à esquerda, relógio grande (ou "FINAL SWARM +m:ss") no centro, Ryu curto e kunai/shuriken à direita. Os preços de kunai, shuriken, mercador e roleta ficam numa linha secundária menor. Novo `src/hud-layout.css`, importado por último.
- Minimapa: marcadores e pontos de inimigo ficam dentro do círculo, sem corte na borda. Rótulo "Tab rápido · M mapa" sob o círculo. O selo DEBUG e o painel descem para baixo do rótulo e acompanham a escala do HUD/minimapa.
- Painel SINERGIAS recolhível pelo título, com estado salvo no navegador. O título das tags de sinergia nos cartões deixa de mostrar "[object Object]".
- Contador de quantidade dos itens com fundo escuro e fonte maior. A grade de itens já estava limitada a 3 linhas com rolagem, e os cartões de ajudante já ficavam compactos com 4 ou mais.
- Ryu em formato curto (`compactNumber`) nos preços da barra, na Roleta da Tsunade (valor exato no tooltip), no diálogo do mercador/prêmio e nos avisos de venda, Ichiraku, roleta e kunai pagas.
- A fala sintetizada ignora navegadores sem `speechSynthesis` em vez de lançar erro.
- Validado no Edge headless em 1440×900 e 1366×768 com 5 ajudantes, 80 itens, nível 194 e 123,5M Ryu. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Combate, animação e preparação da missão

- HUD de escolhas e ficha compactados. Botão da ficha em escolhas, selamento e troca de suporte. Tab mantém o mapa rápido aberto sem interromper o movimento. Kunai direcional no mapa, ícone próprio do Selo do Guardião e câmera/zoom interpolados.
- Trava do ponteiro durante a missão, com kunai de interface e liberação por Esc, perda de foco e F9. Escolher um prêmio recaptura o ponteiro diretamente.
- Teuchi na frente da barraca e retrato ao abrir o atendimento. Fukasaku e Shima sobre Gamakichi abrem fusão e combinação. Retratos dos NPCs aparecem junto das escolhas.
- Planejamento de técnicas por shinobi, teto de 60% de exclusão, restauração destacada, treinamento de até quatro técnicas com +15% de dano e pílulas disponíveis no pool. Ícones do atlas, Modo Sábio por personagem e prévias animadas com alvos.
- Genin abre com menos inimigos e HP comum menor. Sorte pesa 20% na abertura e chega a 100% em 2:30. Quatro a seis encontros de Mega Elite previstos por zona e até dois encontros de conta elegíveis. Chefes com HP numérico, mais defesa, técnicas mais frequentes e áreas maiores.
- Folhas novas de Naruto Academia, Neji nas duas formas e inimigos comuns. Suportes seguem, saltam, esquivam e alternam técnicas. O Totem mantém o selo de mãos. Clones correm até o alvo. Substituição usa um toco no impacto. Gamabunta usa óleo e ignição perto do alvo, com espada e cachimbo.
- Ultimate recebe os bônus de dano, com modificadores de projétil apenas em Naruto, Minato e Tenten. Tenten ganha ×1,5 em técnicas neutras ou de projétil. Lamen de cura em até 5%. Reset de conta exige confirmação e limpa o progresso local.

## Efeitos das técnicas, bijū e filtros da Bolsa

- Adiciona efeitos visuais por natureza e golpes característicos com impacto no alvo. Dragão de Água, Chidori, Rasengan, Mokuton, areia e invocações têm visuais próprios.
- Redesenha Chōmei e Gyūki com as duas referências do usuário e liga as texturas à arena. As demais bijū continuam no atlas.
- Acrescenta botões de raridade à Bolsa da Missão, combináveis com busca e estado do item.

## Ações, ofertas e interface da missão

- Adiciona conjuração do Naruto Clássico, arremesso/pulo/dash do Sasuke inicial e socos e chutes nas três formas de Rock Lee e Might Guy.
- Cada pílula ganha um nível por carta. Raridade aumenta a potência. Inclui Pílula de Incenso e confirma a Pílula do Pergaminho como fonte de experiência.
- Banimento exclui o mesmo nome em qualquer nível e raridade. O clique identifica a carta exibida para evitar selecionar um índice antigo.
- Adiciona confirmação de desistência na pausa, botão Ir para o menu no resumo, dock de pílulas compacto sem faixa e símbolo das bijū no portal da arena.
- Oculta o cursor no cenário durante a partida, mantém a velocidade durante a transição para diagonais e melhora o apoio e a visibilidade perto das estátuas.

## Caminhada direcional de todo o elenco

- Adiciona folhas direcionais às 45 formas dos 20 shinobis restantes. O elenco de 24 shinobis passa a ter 56 formas com caminhada por quadros, baseada na arte de repouso de cada forma.
- O jogo escolhe a dupla de fileiras da forma ativa e espelha o movimento para a esquerda. A pose parada conserva o sprite estático.

## Folhas do Time 7, terreno e regras de oferta

- Integra folhas direcionais de caminhada ao Naruto Clássico, Shippuden e Manto da Kyuubi, e às três formas de Sasuke e Sakura. As folhas de Sasuke e Sakura seguem a arte estática de cada forma. A Sakura inicial mantém o cabelo longo, traje da Academia e cores ao começar a caminhar.
- Girar e inclinar a câmera passou a ser pelo movimento do mouse, com clique direito para fixar alvo. O terreno ganha montanhas externas e elevações internas, com céu em gradiente conforme o clima.
- Pílulas e técnicas aparecem como escolhas apenas na subida de nível. A roleta mantém sua economia e penalidades, mas o prêmio de equipamento só vem como item. A roleta e as recompensas do mapa deixam de conceder pílulas. A fila de itens preserva a opção de aceitar ou vender.
- O número de ofertas fica limitado a quatro mesmo quando Sorte, passiva permanente e banimento se combinam.
- Build, regras e 29 verificações no navegador passaram. A captura em ângulo baixo registra o terreno visível até o rodapé e o shinobi em foco na Vila da Folha.

## Animações do elenco e correções de partida

- Asuma ganha atlas original 4×4. O retrato usa a célula de repouso e a partida usa quadros de caminhada, salto, dash, dano, selo, lâminas e Ultimate.
- Os 24 shinobis jogáveis e suas formas usam poses de movimento e combate a partir do próprio sprite. Naruto Academia mantém suas folhas dedicadas. As formas sem folha dedicada usam deformação localizada dos braços e pernas.
- Prêmios de item e pílula da Tsunade entram numa fila salva na partida. Pílulas encontradas no chão também pedem confirmação. E aceita e V vende a recompensa exibida.
- Sinergias contam ajudantes recrutados que tenham o mesmo ID do jogador. O personagem controlado fica fora da contagem.
- O HUD mostra o total real de inimigos vivos. A horda escala até 1.600 e o mapa limita apenas seus marcadores. A câmera volta a inclinar até aproximadamente 7°.
- Adiciona o registro contínuo de pedidos e respostas em `docs/14-CONTEXTO-DO-CHAT.md`, integrado à skill de documentação.
- Validação no navegador com 28 verificações, incluindo Asuma, ordem dos prêmios e contagem de 1.600 inimigos.

## 2026-11-06 — Asuma (teste da skill de arte)
- Asuma Sarutobi jogável e liberado desde o início (`STARTER_HEROES`): Lâminas de Chakra (Vento, Cone) e Cinzas Ardentes (Fogo, Área) como únicas, Kunai Tática e Grande Vendaval compartilhadas; naturezas Vento/Fogo; sprite pixel art por código (`asuma-1.svg`). PROPOSTO para revisão de arte no padrão do atlas (Codex).

## 2026-11-06 — falas de técnicas sem spam
- `sfx.ts`: técnicas comuns falam no máximo 1 vez a cada 60 s por técnica e 15 s entre falas (`VOICE_RULES`); a Ultimate sempre fala. Antes o Kage Bunshin (técnica inicial do Naruto) repetia a fala a cada 6,5 s.

## 2026-11-06 — HUD: cartões de ajudante compactos
- Com 4+ ajudantes os cartões ficam compactos e a coluna termina antes do dock de técnicas/pílulas, com rolagem (`allies.css`).

## 2026-11-06 — Ryu em formato curto
- `src/game/format.ts` (`compactNumber`): Ryu do HUD em formato curto (1,2 mil · 2,0M · 5,0B · 3,0T; acima disso notação científica), valor exato no tooltip.

## 2026-11-06 — técnicas por fase, escala/Final Swarm, pílulas com raridade, sorte, roleta e economia exponencial
- **Técnicas por fase da obra** (`PHASE_LEVELS` em heroes.ts): Naruto começa com Kage Bunshin; **Invocação do Sapo** (compartilhada com Jiraiya; Kuchiyose: Yatai Kuzushi, Neutro, Área, atordoa) no Nv. 10; Rasengan Nv. 15; Modo Sábio Nv. 25. Revisão por estreia na Narutopedia em Sasuke, Sakura, Itachi, Minato, Tsunade, Jiraiya, Lee, Neji, Hinata e Shikamaru. 70 técnicas.
- **Itens só por interação**: removido o drop de item por abate (era a origem dos itens no nível máximo; a emboscada só aumentava os abates). Nível máximo dá só Treino.
- **Pílulas**: raridade pela Sorte (Comum 1 nível … Lendário 5); pílula no limite não aparece em cartas, drops nem roleta; tudo no máximo vira Treino.
- **Sorte**: `rollItems` sorteia a raridade e depois o item (antes caía em Comum quando a raridade não tinha item desbloqueado); Comum cai mais rápido com a Sorte.
- **Horda e escala**: spawn em lote (`SPAWN_RULES`), tempo total da run para a ameaça, teto até 1600, HP ×(1+0,3·min)·1,15^min; técnicas ganham +30% a +250% de dano por level-up.
- **Final Swarm**: ao zerar o tempo, aviso, relógio "+m:ss" de sobrevivência e dificuldade ×3 crescendo +25% por minuto (`FINAL_SWARM`).
- **Roleta**: nerf 2 (boas ~35% com Sorte 0), porcentagens exibidas = sorteio real, entrega total verificada, ícones do atlas novo.
- **Economia exponencial**: kunai/shuriken 20×1,5^usos, roleta 30×1,35^giros, mercador ×1,35, tudo ×1,15 por minuto de run (`PRICE_INFLATION`); kunai chega a milhões no late game.
- Verificação: tsc, verify-rules e verify-runtime (24 checks) passaram nos subagentes.

## 2026-11-06 — roleta nerfada e corrigida, sorte recalibrada
- **Roleta da Tsunade — entrega corrigida**: bênçãos iguais agora acumulam (até 3×) em vez de se sobrescrever; pílula que chega no limite vira Ryu; item que já está no limite vira Ryu em vez de travar a escolha.
- **Roleta — nerf**: giro 30 Ryu +10 por giro; casas boas reduzidas (kunai/shuriken/pílula 9, Ryu 7, bênção 6, item 4, Sorte Grande 1) e ruins/vazia aumentadas (dívida 12, azar 10, credores 9, vazia 17). Boas: Sorte 0 = 48% (antes 63%), Sorte 200 = 77%.
- **Sorte**: curva de raridade bem mais sensível (raro ou melhor: Sorte 0 ≈ 0,7%, 20 ≈ 6%, 50 ≈ 15%, 100 ≈ 26%); chance de +1 carta nas ofertas (Sorte/150, até 60%); drop de pílula ×(1 + Sorte/100) e de item ×(1 + Sorte/150).

## 2026-11-06 — escala dos inimigos e hordas
- `difficultyAt` (`progression.ts`): HP dos inimigos ×1,10 por minuto e dano ×1,05 por minuto (além do crescimento linear), resistência a dano de +1,5% por minuto até 60% (`armor`, somada à defesa do tier), teto de inimigos até 1400 e spawn mais rápido (mín. 0,03 s). Constantes em `ENEMY_SCALING`. Ex. Genin: 10 min = HP ×8,3, 320 inimigos; 30 min = HP ×133, 1400 inimigos, 45% de resistência.
- Crescimento por nível do shinobi segue linear (+3%): o nível passa de 1000 (referência do jogo de referência); o dano massivo deve vir de técnicas, projéteis, críticos e itens.

## 2026-11-06 — elemento base e bônus de natureza
- Shinobis aprendem só Neutro + elemento base (afinidade) + elementos do próprio kit (+ Sábio para usuários do Modo Sábio); o Naruto deixa de aprender todos os elementos.
- Técnicas do elemento base causam ×1,5 de dano (`NATURE_BONUS` em `heroes.ts`, aplicado em `itemDamageBonus`); o Plano de build mostra o bônus.

## 2026-11-06 — técnicas básicas da Academia
- `ACADEMY` em `heroes.ts`: sempre no pool, liberadas cedo, dano baixo, melhoram no level-up. Para todos: Técnica de Substituição (Nv. 2, ao redor, atordoa), Chute Giratório (Nv. 2), Bomba de Fumaça (Nv. 3, lentidão). Por natureza: Katon: Fagulha, Suiton: Jato d'Água, Fuuton: Rajada (Nv. 3), Doton: Pedregulho, Raiton: Faísca (Nv. 4). Lee e Tenten (sem natureza) só recebem as neutras. Plano de build mostra "Básica da Academia" (sem exigir pesquisa).
- Verificação: tsc, verify-rules e verify-runtime passaram.

## 2026-11-06 — técnicas liberadas por nível na fase certa
- Modo Sábio do Naruto só no nível 25 (forma Shippuden); Amaterasu do Sasuke no nível 25. O painel do shinobi mostra o nível de liberação de cada técnica do kit (Nv. 1/5/12/20 por padrão, com ajustes por personagem).

## 2026-11-06 — alvo fixo, ordem do elenco e card de missão
- **Alvo fixo**: clique com o botão direito (sem arrastar) fixa o alvo com prioridade guardião > Mega Elite/Shinobi para selar > elite > maior HP entre os visíveis até 30 m; anel vermelho no alvo; as técnicas miram nele quando está no alcance; clicar de novo solta. Arrastar continua girando a câmera.
- **Elenco ordenado**: jogáveis primeiro; bloqueados por dificuldade da missão (Genin → Kage) e Lendários por último.
- **Card de missão** em camada fixa por cima da grade (antes ficava atrás dos outros cards).

## 2026-11-06 — Kushina, missões com história e abates, mapas em sequência, pausa corrigida
- **Kushina Uzumaki** (Narutopedia: Vento/Água/Yin, Clã Uzumaki, Correntes de Selamento Adamantinas, Habanero Sangrenta): 2 únicas (Correntes de Selamento, linha que paralisa; Habanero Sangrento, setup), kit com Kunai Tática e Dragão de Água, Ultimate Prisão de Correntes da Kurama, buff de ajudante Correntes Adamantinas, sprite pixel art SVG e nova sinergia Clã Uzumaki. Missão: Folha · Jonin · 500 abates · 5 min, depois de selar Minato.
- **Missões de desbloqueio** com requisitos de **história** (ex.: Neji só depois da Hinata, Hashirama depois da Tsunade, Tobirama depois do Hashirama, Madara depois do Hashirama e Itachi) e **abates na run**. Novo card de missão (história, onde jogar, checklist) no hover da seleção, no painel do shinobi bloqueado e na tela do mapa.
- **Mapas em sequência**: Areia só após vencer o Genin da Folha, Pedra após o Genin da Areia, Névoa após o Genin da Pedra; dificuldades seguem por mapa.
- **Pausa**: barra de comandos e botões fixa no rodapé da tela (antes era cortada); texto de teclas da ficha oculto na pausa.
- **Direção de arte** registrada no AGENTS.md.
- Verificação: tsc, build, verify-rules (23 shinobis, 69 técnicas) e verify-runtime passaram; teste de navegador da pausa, seleção e mapa.

## 2026-11-06 — tela Escolha o mapa
- `src/ui/MapSelect.tsx` + `src/map-select.css`: abas dos 4 mapas com progresso, prévia grande da região (selos de elemento, descrição, climas, shinobi escolhido com Trocar, shinobis para selar no mapa, guardiões por zona) e painel Preparar partida (modo Clássico; Sobrevivência em breve; dificuldades com multiplicadores e cadeados; build selecionada; mochila em breve; Bolsa da Missão com predefinições; Começar com Enter).
- verify-runtime passa a iniciar pelo botão Começar.

## 2026-11-06 — Configurações completas
- Tela de Configurações no formato da referência (Som, Gráficos, Tela, Controles, Teclas, Interface, Idioma, Conta), salva na hora e aplicada ao vivo: volume/efeitos/vozes, qualidade, limite de FPS, resolução, tela cheia, sensibilidade e inversão da câmera, distância da câmera, teclas remapeáveis, tamanho/opacidade do HUD, minimapa, avisos, nome do jogador e reinício/apagar dados. Itens sem suporte aparecem como "em breve".
- Verificação: tsc, build, verify-rules e verify-runtime passaram.

## 2026-11-06 — 4 mapas, missões de desbloqueio, Lendários, pausa no Esc e salvar/retomar
- **Pool de técnicas**: só o kit no começo; técnicas de outros (inclusive Naruto/Sasuke/Sakura) entram só depois de selá-los.
- **Mapas**: Folha, Areia, Pedra e Névoa Oculta, com tema, clima, cenário, zonas e guardiões próprios; Chunin/Jonin/Kage liberam ao vencer a dificuldade anterior em cada mapa.
- **Missões de desbloqueio** para os 19 shinobis bloqueados (mapa + dificuldade + minuto); **Lendários** Madara e Hashirama com retrato oculto. Seleção mostra silhueta com símbolo da vila e a missão ao passar o mouse.
- **Esc**: ficha com rodapé de comandos e ações (Desistir, Salvar e sair, Reiniciar, Mapa grande, Tela cheia, Preso, Mapa, Configurações, Relatar, Continuar); ajuda removida do HUD.
- **Salvar e retomar** a run (manual, automático a cada 15 s e ao fechar).
- Verificação: tsc, verify-rules, verify-runtime e teste de navegador (19 bloqueados, tooltip do Lendário, 4 mapas, 3 dificuldades bloqueadas, pausa, salvar e retomar no mapa da Areia).

## 2026-11-06 — técnicas únicas, selamento de conta, tipos de inimigo, debug completo e ímã de drops
- **Técnicas**: 1–2 únicas por shinobi + 26 compartilhadas (67 no total; duplicatas removidas). Pool por vila/elemento canônico; únicas de outros só após selar o dono. Plano de build mostra a origem e exige 100% de **pesquisa** (nova passiva Pesquisa).
- **Conta**: iniciais Naruto/Sasuke/Sakura; os demais 🔒 até selar o **Shinobi para selar** (contorno ciano, 1º encontro especial da run), que só desbloqueia na conta.
- **Inimigos**: **elite amarelo** (contorno, não capturável, mais forte e resistente, mais saque), **Mega Elite** (contorno vermelho, capturável como ajudante, sem técnicas, muito mais saque). Saque escala com HP e dificuldade.
- **Debug**: 41 parâmetros (todos os atributos do personagem, elites, EXP/curva, Ryu, Chakra, lamen, kunais no chão, preço da kunai) como base Genin; dificuldades multiplicam por cima.
- **Drops**: coleta por ímã dentro da área de coleta, teto de 260 com fusão, materiais compartilhados; kunai/shuriken no chão com sprites desenhados.
- **Mapa**: inimigos no mapa só quando visíveis na câmera; câmera inclina mais (pitch 0,08) e descoberta até 60 m.
- **Arsenal da Tenten** substitui o Sharingan de Kakashi (cópia de item).
- Verificação: tsc, build, verify-rules (asserts das regras de técnica) e verify-runtime passaram; teste de navegador para elite, Shinobi para selar (desbloqueou Kakashi), kunai e debug.

## 2026-11-06 — Passivas Shinobi, Bolsa da Missão, mapa com rota, drops novos e cores de ganho/perda
- **Passivas Shinobi** (antiga Progressão): 24 nós em Treinamento/Equipe da partida; novos Chakra Curativo, Expansão, Farmacologia Ninja, Selo de Ressurreição, Baú do Clã, Meditação de Chakra, Bolsa Grande e **Treinamento com Jiraiya** (técnicas favoritas aparecem mais). Pesquisa PENDENTE.
- **Bolsa da Missão**: abas, busca, capacidade em casa, prioridade ★, predefinições 1–4 e hudzinho. "Arquivar" virou **Deixar em casa**; itens em casa não entram no pool.
- **Mapa M/Tab**: ícones e retratos do que foi visto, rota por clique ou ping, seta e metros na HUD, "Chegou!" e limpeza automática.
- **Drops com sprites próprios**: XP = essência roxa (8/25/100, tamanho por tier), Chakra = orbe azul, Ryu = moeda 両, pílula e pergaminho; nova **tigela de lamen** (15% por abate) que cura 35% do HP. Invariante de cores atualizada no AGENTS.md.
- **Cores**: ganhos em verde e perdas em vermelho nos cards (BuffText).
- **Terminologia**: "cadência" virou **velocidade de ataque** em todo o jogo e nos docs.
- **Pain = Nagato** (Clã Uzumaki) controlando o corpo do Yahiko (sem clã), conforme a Narutopedia. Ebisu e Iruka ganharam sprites pixel art no estilo do elenco.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram; testes de navegador à parte para Passivas/Bolsa/Jiraiya, mapa/rota, sprites dos NPCs e drops (lamen curou 20 → 49,75 de 85 HP).

## 2026-11-06 — elementos corrigidos pela Narutopedia
- `HERO_NATURES` com as naturezas canônicas dos 22 shinobis (Narutopedia, Nature Type); `heroAffinity` passa a usar a afinidade marcada na wiki ou a primeira natureza canônica do kit, em vez de contar elementos do kit.
- Técnicas sem natureza canônica viraram Neutro: Furacão da Folha, Palma de Ar, Palma do Vazio, Kunai Explosiva, Tigre do Meio-Dia, Bansho Tenin, Kuroari, Chuva Venenosa. Pain ganhou Clã Uzumaki.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram.

## 2026-11-06 — combos de aldeia, afinidade de ajudantes, substituição e Roleta da Tsunade
- **Combos de aldeia/organização** (`synergy.ts` reescrito): contam só ajudantes; faixas 2/3/4/5 por aldeia com família de atributo própria (Folha projétil/XP/coleta, Nuvem dano, Névoa crítico, Pedra armadura/HP, Areia área, Som cadência, Chuva status, Cachoeira cura, Grama Ultimate); nenhum combo junta dano % e projétil. Organizações acumulam (Akatsuki, Sannin, Hokages, Time 7, Time Guy, clãs, Ino-Shika-Chō, Time 8, Sete Espadachins).
- **Afinidade de ajudante** 1–5: sobe com tempo e abates; a passiva individual escala de 40% a 100%. Projétil fracionário vira chance (`projectileChance`).
- **Equipe cheia → tela de substituição** (choiceLevel −7): clicar no novo dispensa; clicar num atual substitui.
- **Configurações** no hub (`settings.ts`): desligar card/animação de captura.
- **Roleta da Tsunade** substitui o Caça-níquel e absorve a Bênção de Tsunade: overlay animado, casas boas e ruins, giro rápido segurando E (liga/desliga), E repetido mostra o resultado na hora, prêmios entregues ao sair, custo 25 +5 por giro, Sorte melhora as chances com piso de 15% de casas ruins e a dificuldade compensa.
- **Item novo**: Carteira Gama-chan (Raro): +12% Ryu, −6% custo da roleta, +1% dano a cada 250 Ryu gastos (até +30%).
- **Verificação**: tsc, vite build, verify-rules (94 itens) e verify-runtime passaram; testes de navegador à parte para combos, afinidade, configuração, substituição e roleta (inclusive estatística). Balanceamento PENDENTE.

## 2026-11-06 — velocidade de projétil, setups, Senjutsu, Ebisu, Iruka e Naruto Totem
- **Cadência** revisada: também acelera os ajudantes (metade do bônus) e os procs periódicos de item.
- **Velocidade de projétil** (atributo novo): acelera a viagem dos projéteis e o preparo dos golpes e lançamentos. Itens novos: Lente do Atirador e Seixo Polido do Rio (com ricochete); pílula nova: Pílula do Arremesso. Itens de pulo/deslize ficam PENDENTES.
- **Técnicas de setup** (buff puro, automáticas): Portões do Inferno (Lee), Portão da Dor (Guy), Byakugou (Tsunade), Modo Sábio (Naruto, Jiraiya). Cards mostram recarga, duração, bônus, % do tempo ativo e acumulável. A Ultimate da Tsunade virou Invocação de Katsuyu.
- **Modo Sábio**: elemento Sábio e taijutsu corpo a corpo em área. **Linha Senjutsu** em ninjutsu: 25% de chance de um extra de 1,5× o dano.
- **Eventos**: Ebisu (troca: ganho × 1,1 de custo), Iruka (lição grátis, pergaminho lendário com −20% de custo, ou Iruka como ajudante de +25% XP) e Naruto Totem (7:00–6:00, clones dão XP, totem dá 2 níveis, não selável).
- **Fonte canônica**: Naruto Wiki/Narutopedia, registrada no AGENTS.md.
- **Verificação**: tsc, vite build, verify-rules (93 itens) e verify-runtime passaram; testes de navegador à parte para velocidade, setups, Modo Sábio, Senjutsu e os três eventos. Balanceamento PENDENTE.

## 2026-11-06 — sinergias, seleção com filtros e guardião invocável
- **Sinergias de vila e organização** (`src/game/synergy.ts`): ativam com 2+ membros (herói + ajudantes, ao menos 1 ajudante), faixas 2/3/4+, acumulam vila + organizações (ex.: Akatsuki). Substituem a antiga sinergia fixa da Areia (Irmãos da Areia completos mantêm +12 armadura/+15% dano). Painel "SINERGIAS" abaixo do card do herói; cartões de ajudante mostram a PASSIVA individual e as tags das sinergias. Dados de clã/organização/afinidade em `heroes.ts` (`HERO_CLAN`, `ORGANIZATIONS`, `heroOrganizations`, `heroAffinity`).
- **Seleção de shinobi** (`src/ui/CharacterSelect.tsx`): grade de retratos com selo de elemento; filtros por vila, elemento, organização/clã e busca; contagem "X de 22".
- **Guardião invocável**: Selo do guardião (E) invoca o guardião da zona quando o jogador quiser; HP × (0,6 + 0,4 × segundos na zona ÷ 160). Continua surgindo sozinho aos 160 s se não for invocado.
- **Plano do Shikamaru** substitui a Provocação do guardião (ex-nome do jogo de referência): +1 kunai por acionamento ao derrotar o guardião, limite 3 por zona, sem penalidade de dificuldade/saque. Nenhuma referência a esse jogo resta em `src/`.
- **Verificação**: tsc, vite build, verify-rules (com asserts de sinergia) e verify-runtime (24 checks) passaram; testes de navegador à parte para sinergias, filtros (desktop e 375px) e guardião/Shikamaru. Balanceamento PENDENTE.

## 2026-11-05 — catálogo de 91 itens no formato da referência
- **Catálogo:** `src/game/catalog.ts` foi refeito com 91 itens (25 comuns, 27 incomuns, 15 raros, 14 épicos, 10 lendários) seguindo o formato da página de itens da wiki: raridade, efeito, gatilho e limite. Os nomes são ninjas, os valores foram levemente alterados e nada lembra o jogo de referência.
- **Itens pedidos:** Pergaminho do Monte Myoboku (+28% Sábio) e Pergaminho Genjutsu (+28% Genjutsu), no molde dos pergaminhos de elemento (Katon, Suiton, Fuuton, Doton, Raiton, Mokuton, Areia, Sombra, Neutro).
- **Mecânicas novas na simulação** (`GameCanvas.tsx`, via `Stats.extra`):
  - dano por elemento e Genjutsu, dano condicional e gatilhos por acerto;
  - roubo de vida, espinhos, escudo, fumaça, gelo ao ser atingido;
  - curas (emergência, periódica, por abate) e ressurreição;
  - adrenalina, postura parada e reset da Ultimate;
  - raios e Amaterasu automáticos;
  - descontos de kunai e caça-níquel, quantidade de inimigos e limites de pílula (12) e técnica (11).
  - Todo dano recebido agora passa por `damagePlayer`.
- **Filtros:** `combat.ts` classifica as chaves novas (filtros da loja e o "Melhora:" das cartas).
- **Itens removidos ou trocados:** Insígnia do Comandante, Tambor de Guerra e Selo de Cooperação saíram. O Estandarte da Aliança agora é raro com +40%. A Bandana dá +6 de armadura. A Pedra da Juventude dá +15% de XP.
- **Testes:** `verify-rules.mjs` foi atualizado (≥80 itens, ids únicos, itens pedidos, Selo Amaldiçoado, Fúria da Kyuubi, Genjutsu, gatilhos).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - Pergaminho Fuuton deu ×1,318 no Rasengan;
    - Genjutsu numa técnica de Ninjutsu deu só +3%;
    - Raiz Vampira curou de 20 para 54 de HP;
    - o Escudo bloqueou o 1º golpe;
    - a Ressurreição voltou com 35%;
    - o Chidori Nagashi causou dano sozinho;
    - a pílula chegou ao nível 12;
    - a kunai caiu de 20 para 12 com 5 Pepitas;
    - a loja mostra 91 itens e o filtro Sábio funciona.
- **Não testado:** balanceamento e cada um dos 91 itens individualmente em jogo.

## 2026-11-05 — buff único de cada ajudante
- **Buffs:** novo `src/game/allies.ts` com um buff passivo para cada um dos 22 shinobis (tabela em `docs/03`).
  - Médicos curam (Tsunade +1,5 HP/s, Sakura +1, Hashirama +1,2).
  - Os demais dão o atributo do estilo deles (Naruto +12% dano, Gaara +10 armadura, Neji +30% dano crítico, Tenten +1 projétil...).
- **Na simulação:** os buffs entram em `calculateStats` via `refreshStats` e escalam com a força de suporte. A regeneração genérica de +0,3 HP/s por aliado saiu.
- **Itens:** Estandarte da Aliança e Selo de Cooperação agora reforçam os buffs dos ajudantes; o texto foi atualizado.
- **Cartões:** cada cartão de ajudante mostra o buff real com o valor efetivo.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram, e os testes avulsos anteriores também.
  - Teste novo:
    - os 22 têm buff;
    - os buffs somam e escalam;
    - recrutar Tsunade, Gaara e Tenten deu +1,5 HP/s, +10 armadura e +1 projétil;
    - com o Estandarte, a cura vira +1,8 HP/s e os cartões mostram esses valores.
- **Não testado:** balanceamento em runs completas.

## 2026-11-05 — cartões de ajudantes e Barraca Ichiraku
- **Cartões de ajudantes:**
  - Novos `src/ui/AllyCards.tsx` e `src/allies.css`; a linha de texto "Suportes …" foi substituída por cartões no padrão da referência do usuário.
  - Cada cartão tem: retrato redondo com moldura na cor da técnica, nome, selo da aldeia ou SINERGIA, buff real (regeneração e bônus da Areia), técnica com barra de recarga, elemento, escola, % de dano e intervalo.
  - O snapshot ganhou `allyCharge`.
- **Barraca Ichiraku:**
  - Novo evento no mapa com o sprite da barraca de lámen.
  - Esquecer uma pílula (todos os níveis) ou uma técnica custa 10 + 5 × nível em Ryu, quantas vezes quiser. A última técnica é protegida.
  - Os atributos são recalculados a partir das fontes.
  - A tela é própria ("ESQUECER", "Sair da barraca").
- **Caça-níquel:** saiu "do Ichiraku" do nome e o sprite da barraca passou a ser da Barraca Ichiraku.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Os testes avulsos do Kakashi, dos chefes e do debug continuaram passando.
  - Teste novo no navegador:
    - 3 cartões com SINERGIA, sem cobrir o herói nem as habilidades;
    - Ichiraku recusa com Ryu insuficiente;
    - esquecer a Pílula do Soldado por 20 Ryu baixou o Taijutsu de 120% para 100%;
    - esquecer Kage Bunshin por 15 Ryu;
    - a barraca fechou e não reabriu com só a última técnica.
- **Não testado:** 5 ajudantes ao mesmo tempo em telas pequenas; balanceamento do preço.

## 2026-11-05 — Kakashi interativo copia item da bolsa
- **Novo evento "Sharingan de Kakashi":** NPC com sprite do Kakashi. Ao apertar E, o jogador escolhe 1 item que já carrega e ganha +1 cópia, até o limite do item. Pode ser usado uma vez por zona.
- **Tela da escolha:** própria ("Copiar um item da bolsa"), com selo "CÓPIA", sem Atualizar/Banir. "Cancelar (X)" fecha sem gastar o Kakashi nem os usos de pular. Itens já no limite não aparecem; com a bolsa vazia, só aparece um aviso.
- **Escolha de cartas em geral:**
  - O clique usa o evento `shinobi-choose` (índice) e funciona com qualquer número de cartas; o teclado aceita 1–9.
  - Com mais de 4 cartas, a grade fica em 4 colunas com rolagem (`hud-dock.css`).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - sem itens, o Kakashi não abre;
    - com 6 itens (1 no limite), lista 5;
    - X cancela sem gastar;
    - clicar na 5ª carta copiou o Talismã de Vida (1 → 2) e gastou o Kakashi;
    - os usos de pular, atualizar e banir ficaram intactos.
  - O teste dos chefes também passou de novo.

## 2026-11-05 — chefes com barra de vida e técnicas próprias
- Novo `src/scene/bossCombat.ts`, integrado ao `GameCanvas.tsx`.
- **Barra de vida:** mega elites e guardiões ganham barra 3D acima do personagem, com nome; durante um golpe ela mostra "⚠ golpe".
- **Técnicas:**
  - Os chefes usam as técnicas do próprio shinobi contra o jogador. Mega elite: 1 + zona técnicas; guardião: o kit todo.
  - Cada golpe tem aviso vermelho de 1,1 s no chão, no formato da técnica (área, cone, linha, V, anel). Sair da área evita o dano.
  - Golpes com controle deixam o jogador lento.
  - O guardião usa a Ultimate dele uma vez, abaixo de 50% de HP.
- **Valores provisórios:** `BOSS_RULES`.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Um teste avulso no navegador confirmou: barra criada; Gaara conjurando "Agulhas de Areia"; HP 101 → 63 ficando parado; 122 → 122 saindo do "Caixão de Areia"; remoção sem erro.
- **Não testado:** balanceamento em runs completas, guardião usando a Ultimate em jogo real e o aviso em relevo forte.

## 2026-11-05 — login admin removido e debug com ajustes ao vivo salvos
**Login removido**
- Removidos `src/game/adminAuth.ts` (login e hash da senha) e `src/ui/AdminLogin.tsx`.
- O modal de conta não tem mais campos de login ou senha, e os estilos `.admin-login` saíram de `debug.css`.
- Nenhum arquivo do projeto contém o login ou a senha. `Feedback da versão.txt` continua fora do git.
- **Histórico reescrito**, a pedido do usuário. Os commits `be528e9` (que tinha o login e o hash da senha) e `5f81fdf` foram juntados num único commit limpo, `be738b5`, publicado com `git push --force-with-lease`. O GitHub ficou com 1 commit, e os objetos antigos foram removidos do repositório local (`reflog expire` + `gc --prune=now`). O GitHub ainda pode guardar o commit antigo por algum tempo para quem souber o hash exato; o suporte do GitHub consegue apagá-lo de vez.

**Ativação do debug**
- O debug não depende de conta: `debug={import.meta.env.DEV}`. Existe ao rodar com `pnpm dev`/`ABRIR_JOGO.bat`; a build de produção não tem o painel.

**Painel de debug** (`src/game/tuning.ts`, `DebugPanel.tsx`, `GameCanvas.tsx`)
- 13 parâmetros em 4 grupos:
  - Inimigos: HP, dano, velocidade, spawn e teto.
  - Personagem: dano e Ultimate.
  - Ganhos: EXP e Ryu.
  - Drops (novos): chance de Ryu, Chakra, pílula e item, com a chance efetiva exibida.
- Mudar o HP dos inimigos reescala também os que já estão vivos.
- Os parâmetros salvos (`sb_debug_tuning_v1`) agora valem em **todas** as runs, com o painel aberto ou fechado (antes só com o debug ligado).
- O botão mostra "ajustes ativos" quando algo difere do padrão.
- Novos botões "Copiar JSON" e "Colar JSON".

**Verificado**
- `tsc -b`, `vite build` e `verify-rules.mjs` passaram.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador confirmou: modal sem login; painel sem login; HP ×2 dobrando o inimigo vivo; item ×30 = 54%; valores salvos e recarregados na run seguinte; restaurar padrões.

**Não testado**
- Os demais sliders, um a um, em gameplay real.

## 2026-11-05 — versionamento no GitHub
- O projeto passa a ser um repositório git, com remoto `origin` em https://github.com/jcffadev/Shinobibonk.git e branch `main`.
- Novo `.gitignore`. Ficam fora do repositório:
  - dependências, build e segredos;
  - `Feedback da versão.txt`, por conter credenciais;
  - `animação do personagem.jpeg`, uma prévia de banco de imagens com marca d'água.
- Nova skill `skills/publicar-github/SKILL.md`, com um atalho em `.claude/skills/publicar-github/`: ao fim de cada tarefa com alterações, documentar, verificar, conferir segredos, fazer commit em português e push sem force.
- `AGENTS.md` ganhou a seção "Publicação no GitHub".

## 2026-11-05 — HUD de pílulas, level-up sem itens e Lamens por desempenho
Feito por três subagentes e integrado depois.

**HUD**
- Novo `src/hud-dock.css`. Em `main.tsx`, `.vitamin-row` e `.ability-bar` ficam dentro de `.skill-dock`: pílulas numa linha própria acima das habilidades, quebrando em até 2 linhas, com rolagem.
- Na integração, o bloco subiu para `bottom:96px` e a ajuda de teclas foi para a direita do botão "← Preparação", porque o selo AUTO encostava na ajuda.
- No resumo, os nomes das pílulas não são mais cortados com "…": aparecem sem o prefixo "Pílula" e quebram linha.

**Level-up** (`rollLevelOffers`)
- Só técnicas e pílulas, até 2 técnicas; nunca itens.
- Técnicas todas no máximo: só pílulas. Pílulas todas no limite: só técnicas.
- Itens só por recompensas (kunai, shuriken, eventos, drop, recusa de selamento).

**Pílula do Mercador**
- O texto agora cita só Ryu ("+12% Ryu recebido").

**Lamens por desempenho**
- Novo `src/game/rewards.ts`: tempo, abates, nível, zona, mega elites selados e vitória, multiplicados pela dificuldade. Valores provisórios.
- Creditados uma vez por run (vitória ou derrota) e mostrados no resumo com a decomposição.

**Testes**
- `scripts/verify-runtime.mjs`: a verificação da carteira passou a ser relativa (antes esperava o saldo fixo 999.699, que mudou com o crédito de Lamens). Nova verificação: "Vitória credita Lamens uma única vez e mostra no resumo".

**Verificado**
- `tsc -b` e `vite build` sem erros.
- `verify-runtime.mjs` passou com 24 verificações.
- Um teste avulso no navegador confirmou: level-up só com técnicas e pílulas em 60 rolagens; 16 pílulas no HUD sem sobrepor as habilidades nem a ajuda; resumo com Lamens.

**Não testado**
- O caso "só pílulas com técnicas no máximo" em jogo real.
- Layout do HUD entre 700 e 1100 px e no celular.
- Balanceamento da fórmula de Lamens.

## 2026-11-05 — posição do painel de debug
- `src/debug.css`:
  - O botão "DEBUG · F9" e o painel foram para a direita, abaixo do minimapa, e não cobrem mais o cartão do herói.
  - Botão e painel ficam ocultos enquanto o resumo pós-run está aberto (regra CSS com `:has(.summary-backdrop)`).
- **Verificado** com `vite build` e um teste avulso no navegador a 1440×900:
  - o painel não se sobrepõe ao cartão do herói, ao minimapa nem à barra superior;
  - o botão some no resumo.
- O layout de celular do painel não foi conferido visualmente.

## 2026-11-05 — modo debug admin, resumo pós-run e 18 pílulas
Feito por três subagentes em paralelo e integrado depois.

**Modo debug (admin)**
- Novos arquivos: `src/game/adminAuth.ts`, `src/game/tuning.ts`, `src/ui/AdminLogin.tsx`, `src/ui/DebugPanel.tsx` e `src/debug.css`.
- Login admin local no modal de conta. A senha é guardada só como hash SHA-256 e verificada no navegador; é proteção de protótipo, não segurança real.
- Na missão, F9 (ou a tecla à esquerda do 1) abre o painel:
  - leitura ao vivo;
  - 9 multiplicadores salvos em `sb_debug_tuning_v1`;
  - dar item ou pílula, curar, god mode, Chakra, nível, Ryu;
  - mega elite, limpar inimigos, avançar o tempo, congelar.
- Sem admin, o balanceamento padrão não muda.

**Resumo pós-run**
- Novos arquivos: `src/ui/RunSummary.tsx` e `src/summary.css`.
- Substitui a tela final simples. Mostra resultado, 12 indicadores (inclui DPS médio), dano por técnica com % e DPS, build final e atributos finais.
- Mantém o botão "Preparar outra missão" e adiciona "Tentar novamente".

**Pílulas**
- Novos arquivos: `src/game/pills.ts` e `src/ui/PillIcon.tsx`.
- 18 pílulas com tema ninja, uma por atributo, no formato da wiki de referência. Substituem Rubra, Verde e Azul.
- `progression.ts`, `preparation.ts`, `GameCanvas.tsx`, `RunSheet.tsx` e `BuildPlanner.tsx` agora leem de `pills.ts`.

**Verificado**
- `tsc -b` e `vite build` sem erros; o bundle passou a 899 kB.
- `verify-rules.mjs` passou.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador cobriu login admin (errado e certo), F9 abrindo e fechando, sorteio das pílulas novas, resumo na vitória e layout a 390 px.

**Não testado**
- Derrota real.
- Cada slider do debug.
- Conflito do F9 com o Leitor Imersivo do Edge.
- Balanceamento das pílulas.

## 2026-11-05 — tecla Y restaurada (decisão do usuário)
- **CONFIRMADO** pelo usuário: a tecla Y tem que existir.
- `src/scene/GameCanvas.tsx`: Y volta a alternar a Ultimate automática. A tecla e o clique no selo AUTO chamam a mesma função `onToggleAuto`.
- `scripts/verify-runtime.mjs`: nova verificação "Tecla Y alterna a Ultimate automática".
- **Verificado**: `tsc -b` e `vite build` sem erros; `verify-runtime.mjs` passou nas 23 verificações, sem erros JS.
- README, docs 00, 04, 10 e 12, contexto do chat e `AGENTS.md` atualizados.

## 2026-11-05 — moeda Lamens no hub e AUTO sem tecla Y (Y revertido na entrada acima)
- `src/main.tsx`: carteira, árvore permanente, loja, nota de teste, Reset e rodapé do hub agora mostram a moeda permanente como **Lamens** (🍜) em vez de "Ryu". O Ryu (🪙) continua sendo o dinheiro da run (HUD, kunais, mercador, caça-níquel). A função interna `spendRyu` foi renomeada para `spendLamens`. A chave `sb_admin_wallet_v1` não mudou, então o saldo salvo é mantido.
- `src/scene/GameCanvas.tsx`: removido o atalho oculto **Y**. O selo AUTO do botão R agora dispara o evento `shinobi-toggle-auto-ult` em vez de simular a tecla Y.
- README, docs 00, 04, 11 e 12 atualizados; as duas divergências saíram da lista de pendências.
- **Verificado**: `tsc -b` e `vite build` sem erros. `node scripts/verify-runtime.mjs` reexecutado com as 22 verificações passando (inclusive "Ultimate R e selo AUTO" por clique e reembolso do Reset), sem erros JS. A execução regravou `artifacts/runtime-checks.json` e as screenshots em `artifacts/`.

## 2026-11-05 — sincronização da documentação com o código
Os docs foram editados até cerca de 15h; o código continuou mudando até cerca de 17h53 sem registro. Esta entrada documenta, a partir da leitura do código, as mudanças que não estavam registradas, e corrige os Markdown. Nenhum código foi alterado.

**Registrado retroativamente (IMPLEMENTADO no código, sem entrada anterior):**
- Dados extraídos para `src/game/`:
  - 22 shinobis e 88 técnicas com escola, elemento, forma e status.
  - Catálogo de 36 itens.
  - `calculateStats` recalculando atributos das fontes.
  - Dificuldade por rank e tempo.
  - Crítico com mega crítico.
  - Afixos de técnica por raridade.
  - Evoluções visuais por nível.
  - Árvore permanente com 16 nós.
  - Três zonas com guardião.
- UI nova em `src/ui/`: ficha da run, plano de build e filtros.
- Hub:
  - Filtros por aldeia, escola e elemento.
  - Carteira administrativa local (999.999) com Reset que devolve o gasto.
  - Prévia da cena.
- Run:
  - Contagem regressiva de 10:00 com vitória e derrota; três zonas de 200 s com clima e guardião.
  - Ataques inimigos telegrafados; armadura e evasão.
  - Cartas com atualizar, pular e banir (F/X/Z).
  - Kunais no mapa com preço crescente de Ryu.
  - Defesa de altar de 20 s.
  - Emboscadas.
  - Mega elites aleatórios do elenco (até 9).
  - Aliados que seguem e atacam.
  - Sinergia da Areia.
  - Descoberta por frustum da câmera.
  - Ganchos de teste `window.__shinobiTest` (dev com `?test`).
- Eventos renomeados: os nomes dos eventos do jogo de referência viraram Provocação do guardião e Bênção de Tsunade.
- Scripts `scripts/verify-rules.mjs`, `scripts/verify-runtime.mjs`, `scripts/smoke-browser.mjs` e scripts de integração já aplicados (`scripts/integrate-*.mjs`, `update-*.mjs`).

**Documentação corrigida:**
- README, `00-LEIA-PRIMEIRO` e `12-ARQUITETURA` reescritos conforme o código.
- 01, 02, 03, 04, 05 e 11 receberam seções de estado do código.
- 06 marcado como histórico.
- 09, 10 e o contexto do chat receberam notas sobre as decisões que mudaram (Tab/P, AUTO no lugar de Y, moedas, nomes sem referência ao jogo de referência).

**Divergências registradas como PENDENTES:**
- A moeda permanente aparece como "Ryu" no hub (a decisão é Lamens).
- A tecla Y ainda alterna o AUTO como atalho oculto.
- Teto real de 180 inimigos vivos.
- Selamento sem tentativas nem falha.
- Descoberta sem oclusão.

**Verificado nesta data:** `tsc -b` sem erros; `vite build` concluído com aviso de chunk de 879 kB; `node scripts/verify-rules.mjs` passou. Os testes de navegador em `artifacts/runtime-checks.json` são da execução anterior do Codex e não foram reexecutados.

## 2026-11-05 — run, selamento de Orochimaru, skill e referências
- Copiados os 50 PNGs de clipboard disponíveis desta conversa para `assets/referencia/prints/originais/`, preservando os nomes originais; mantidas cópias organizadas na pasta principal.
- Implementadas aparições naturais do mega elite Orochimaru e sequência após derrota: retrato do alvo, escolha E/G, animação do selo, registro de aliado temporário ou drop que abre três itens. Sorte do Talismã altera chance de raridade nessa escolha.
- Substituída a maldição do evento do jogo de referência pela Maldição de Orochimaru; mantém o efeito de risco/recompensa provisório.
- A roleta/eventos, coleta de armas/Ryu, altar de desafio, escolha de level-up, HUD de run, clima simples e mapa da zona estão implementados em `src/`; defesa de altar completa, zonas e IA de aliados continuam pendentes.
- Ultimate automática agora é alternada pelo selo AUTO dentro do botão R; removido Y do guia visual do HUD. Naruto alterna VFX de shuriken, Rasengan, clone e rajada de chakra.
- Criada `skills/documentar-projeto/SKILL.md` e integrada ao `AGENTS.md`: toda alteração em código/configuração/assets deve sincronizar Markdown na mesma tarefa.
- README, guia inicial, arquitetura, câmera/eventos e selamento atualizados para distinguir código real de plano visual. `pnpm build` concluído em 05/11/2026; Vite avisou sobre bundle acima de 500 kB.

## 2026-11-05 — hub de elenco e progressão
- Adicionadas telas do elenco com passivas/kit, catálogo de ataques por shinobi, plano de build, árvore permanente e loja de itens.
- Planejamento permite marcar ataques e bloquear itens desbloqueados para a próxima run; preferências ficam no navegador local.
- Proposta econômica documentada: dez passivas, dez níveis, custo crescente; total projetado de 21.300 Lamens para a árvore apresentada.
- Login, recompensas de Lamens, efeitos de passivas e integração real do pool seguem pendentes.

## 2026-11-05 — tela inicial e entrada de jogador
- Criada tela inicial inspirada na referência enviada, com cenário 3D ao fundo, opção de convidado e área de conta.
- Adicionada seleção de missões Genin, Chunin, Jonin e Kage, com rótulo de início da missão escolhida.
- Preparado modal explicando que login/cadastro por e-mail e senha dependem de implementação futura; nenhum dado de senha é coletado.
- Placar indica claramente dados locais e ausência de ranking/contas online.

## 2026-11-05 — movimento e inimigos na base 3D
- Adicionados movimento WASD/setas, câmera que acompanha o protagonista e rotação por arraste do mouse.
- Inimigos geométricos surgem aleatoriamente ao redor do jogador e avançam em sua direção; contador aparece na HUD.
- Controles e estado continuam em uma simulação Three.js separada da interface React.

## 2026-11-05 — base inicial 3D
- Adicionada base de desenvolvimento com Three.js e TypeScript; React controla a interface, enquanto cena e renderização ficam isoladas.
- Configurado Vite para iniciar a nova base pela raiz do projeto, preservando `game/index.html` como protótipo 2D jogável.
- Adicionada cena isométrica de teste com terreno em blocos e personagem geométrico provisório.
- Instaladas dependências Three.js, React, TypeScript, Vite e tipos associados.
- A base não migra ainda as mecânicas do protótipo 2D nem representa arte final.

## 2026-11-05 — pacote para Codex
- Consolidado código executável mais recente (v0.5.3), docs, artes conceituais, screenshots e histórico disponível.
- Não houve migração para 3D nesta consolidação.
- Origem: arquivos locais de versões anteriores desta conversa.

## 07/11/2026 — Integração dos lotes e continuação de arte

- Concilia os rascunhos locais do Claude e a main do Codex, preservando ambas as linhas.
- Corrige retomada da simulação após Esc e identificação do lançador no Susanoo de ajudantes.
- Integra chão e construções regionais de Areia, Pedra e Névoa.
- Integra nove folhas de pulo/dash e três folhas completas de ações; adiciona empacotador de atlas.
- Preserva a calibração existente. Revisão visual integral dos mapas e das 56 versões continua pendente.

## Lote de animações salvo para continuação · 07/11/2026

IMPLEMENTADO: 24 folhas completas adicionais 4×4 de ataque/selo/pulo/dash: Kakashi 1/25, Itachi 1, Minato 1/15, Tsunade 1/15/30, Jiraiya 1/20, Orochimaru 1/15, Hinata 1/15/30, Pain 1, Shikamaru 1/15/30, Tobirama 1, Temari 1/15 e Tenten 1/15. Todas foram empacotadas em células uniformes e registradas em directionalArt.ts, usado também pelos ajudantes. As três folhas completas de Sasuke 15 e Hashirama 1/20 já foram publicadas no lote anterior. Os prompts e referências estão em docs/arte-atlas-2026-11-07.json, gerados com ImageGen.

IMPLEMENTADO: prévia de Susanoo utiliza o mesmo rig WebGL e partículas do combate, escolhendo o estilo pela família do lançador. TypeScript, build e regras passaram após as mudanças.

PENDENTE: criar folhas completas de Kankuro 1/15/30 e Kushina 1 (quatro versões); revisar/refinar ataques antigos de Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. A existência da folha não confirma que todas as poses foram aprovadas visualmente. Conferir consistência com o sprite parado, frente/costas e dash esquerdo em cada versão e como ajudante.

O script scripts/verify-motion-atlases.mjs exercita o controlador em fixture isolada e produz artifacts/motion-review.json e quatro folhas de contato. A primeira execução tinha duas instâncias de Three.js; corrigido o import por scripts/motion-review-entry.ts. Conferir o resultado final antes de considerar a auditoria completa.

Continuam pendentes: inspeção visual dos quatro mapas, prévias/efeitos em combate de todos os lançadores, sons com licença verificada e uma run prolongada de três zonas até bijuu/saída/ranking. Preservar o balanceamento existente conforme instrução do usuário. Não publicar artifacts/sb-swishes-source.zip: é um arquivo preexistente de origem/licença não verificada.

Validação deste lote: scripts/verify-motion-atlases.mjs concluiu com 56 versões, 560 estados, zero erros JavaScript e zero assets ausentes. Foram geradas quatro folhas de contato; a aprovação visual completa e a revisão em combate continuam pendentes.
