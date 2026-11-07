# Calibração com referência (PokéBonk)

Este documento é o ponto de partida de calibração pedido pelo usuário. A fonte é a **wiki pública e não oficial** https://pokebonk-wiki.wiki (lida em 06/11/2026, versão do jogo v0.9.17). A wiki diz se cada número foi medido em partida ("Played & measured") ou lido na interface ("Read in game UI"). Não houve engenharia reversa do aplicativo. Algumas páginas citam "game files", e isso fica registrado aqui como **dado da wiki**, sem verificação nossa.

Legenda:
- **Ref.**: valor da wiki, com a página de origem.
- **Atual**: constante em vigor no código.
- **Proposta**: todas as propostas são **PROPOSTO**. Nenhum valor foi alterado neste lote, porque nenhum era claramente inconsistente. Os mais destoantes estão marcados com ⚠.

Páginas usadas:
- [Level-up](https://pokebonk-wiki.wiki/level-up/)
- [Lab](https://pokebonk-wiki.wiki/lab/)
- [Itens e vitaminas](https://pokebonk-wiki.wiki/items/)
- [Testes em jogo](https://pokebonk-wiki.wiki/in-game-tests/)
- [Survival](https://pokebonk-wiki.wiki/survival/)
- [Modos](https://pokebonk-wiki.wiki/modes/)
- [Guia inicial](https://pokebonk-wiki.wiki/beginner-guide/)
- [Patch notes](https://pokebonk-wiki.wiki/patch-notes/), em especial [Patch #2](https://pokebonk-wiki.wiki/patch-notes/patch-2/), [#3](https://pokebonk-wiki.wiki/patch-notes/patch-3/) e [#5](https://pokebonk-wiki.wiki/patch-notes/patch-5/)

## 1. Level-up, técnicas e ferramentas de escolha

| Tema | Ref. PokéBonk | Atual ShinobiBonk | Proposta |
|---|---|---|---|
| Cartas por level-up | 3. Com o Lab "Fourth option", 4 ([level-up](https://pokebonk-wiki.wiki/level-up/)) | 3. Com "Quarta opção", 4; a Sorte dá chance de 4ª carta (Sorte/150, até 60%) (`choiceCount`, `preparation.ts`) | Manter. A chance de 4ª carta por Sorte é nossa |
| Primeiro level-up | ~30 s de partida (medido) | `xpToLevelUp(1)` = 30 EXP; EXP base por abate 8 (`BASE_LOOT`) | PENDENTE: medir o tempo real até o Nv. 2 |
| Tipos de carta | Nova técnica, melhoria e vitamina; item nunca aparece (Cursed Incense aparece como vitamina) | Técnica e pílula; item nunca aparece | Já alinhado |
| Atualizar / Pular / Banir | 2 / 2 / 1 por run. +1 por nível do Lab, até 6 níveis cada; preço inicial 120 / 80 / 150 ✦ | 3 / 3 / 3. +1 por nível, até 7 (10 no total); preço inicial 150 / 100 / 180 Lamens (`choiceUses`) | PROPOSTO: 2/2/1 iniciais e até 6 níveis. É mais escasso e valoriza o Lab |
| Nível máximo da técnica | 8. "TM Case" (Lendário) +2 = 10 ([items](https://pokebonk-wiki.wiki/items/)) | 9 + `skillCap` de item | Manter 9, ou PROPOSTO 8 + item lendário +2 |
| Ganho por melhoria (Comum) | Vine Whip Nv. 1→2: **+22% de dano** e +1 projétil (24,8 → 33,5 por golpe, medido) | `GROWTH_ROLLS.damage` Comum: +30% a +45% de dano; mais 1–2 afixos de 10–18% (`combat.ts`) | Manter. O nosso Comum é um pouco mais forte, para compensar a falta de +1 projétil por nível |
| Ganho por raridade | "Cartas mais raras dão mais" (sem números) | Incomum +55–75%, Raro +90–120%, Épico +150–200%, Lendário +250–330% | Manter até medir. A referência do vídeo (+300%/nível no Nv. 10) já foi considerada |
| Espaços de técnica | 3. O 4º custa 1.500 ✦ | 3. O 4º ("Quarta técnica") custa 400 Lamens | Ver custos do Lab (seção 3) |
| Treino após tudo no máximo | "Cada nível dá um pequeno bônus permanente (+dano, +HP, +área, +sorte...)" (Patch #5, sem número) | +0,8% num atributo aleatório (`POWERLEVEL_RATE`, `powerlevel.ts`) | Manter |
| Nível alto | Nível 1000 aparece no patch (resultado cortado em 423, corrigido) | Sem teto de nível na partida | Manter |

## 2. Vitaminas (PokéBonk) × pílulas (ShinobiBonk)

Na referência, cada vitamina sobe 1 nível por carta. O valor abaixo é por nível em carta Comum, e cartas mais raras dão mais. São 3 espaços, +2 pelo Lab. O teto é de 10 níveis, e o item Épico "Max Ether" dá +2 (até 12) ([items](https://pokebonk-wiki.wiki/items/)).
- **Atual**: `PILL_MAX` = 10, +2 com "Farmacologia Ninja"; `PILL_SLOTS` = 6; raridade ×1 / 1,25 / 1,5 / 1,75 / 2 (`PILL_RARITY_POWER`, `pills.ts`).

| Vitamina (ref.) | Ref. por nível | Pílula equivalente | Atual por nível | Proposta |
|---|---|---|---|---|
| Protein / Calcium | +10% dano físico / especial | Soldado (taijutsu) / Elemental | +10% / +10% | Igual |
| Iron | +5 armadura | Ferro | +4 armadura | PROPOSTO +5 |
| Carbos | +7% movimento | Vento | +6% | PROPOSTO +7% |
| HP Up | +18 HP | Akimichi | +18 HP | Igual |
| PP Up | +0,5 projétil | Clone | +0,5 | Igual |
| Ether | +8% vel. de ataque | Relâmpago | +8% | Igual |
| Direct X | +5% crítico | Olho de Falcão | +4% | PROPOSTO +5% |
| X Speed | +12% vel. de projétil | Arremesso | +10% | PROPOSTO +12% |
| X Defense | +3,5% evasão | Névoa | +3% | Manter (teto de 60%) |
| X Attack | +15% chance de status | Genjutsu | +12% | PROPOSTO +15% |
| Stardust | +10% área | Expansão | +10% | Igual |
| Elixir | +10% duração | Persistência | +10% | Igual |
| Super Potion | +0,7 HP/s | Cura | +0,6 | PROPOSTO +0,7 |
| Nugget | +15% ₽ | Mercador | +12% Ryu | Manter (Ryu não vira Lamens) |
| Exp. Candy | +10% EXP | Pergaminho | +10% | Igual |
| Star Piece | +10 sorte | Fortuna | +5 sorte | ⚠ PROPOSTO +8 a +10. Nossa curva de Sorte é mais sensível (Sorte 50 ≈ 15% raro+) |
| Escape Rope | +1,2 de coleta | Magnética | +1 | Manter |
| Cursed Incense | +12% inimigos e mais fortes; +6% EXP e +6% ₽ | Incenso | +10% horda, +5% ameaça, +12% Ryu | Manter |
| Espaços | 3 (+2 Lab = 5) | — | 6 | PROPOSTO: 4 iniciais +2 pela passiva. Hoje o jogador pega quase todas as pílulas |

## 3. Melhorias permanentes (Lab × Passivas Shinobi)

Preço do nível 1 na referência, em Stardust (✦). Na Season 2 todos os preços ficaram 15% mais baratos e a wiki ainda mostra os da Season 1 ([lab](https://pokebonk-wiki.wiki/lab/)). Nosso preço é `base + 25 × nível` em Lamens (`passiveCost`, `preparation.ts`).

| Melhoria | Ref. (efeito · máx. · preço 1) | Atual (efeito · máx. · base) | Proposta |
|---|---|---|---|
| Training / Treinamento | +4% dano · 8 · 100 | +4% · 10 · 80 | PROPOSTO máx. 8 |
| Stamina / Resistência | +8 HP · 8 · 100 | +8 HP · 10 · 85 | PROPOSTO máx. 8 |
| Agility / Agilidade | +2,5% movimento · 6 · 120 | +2,5% · 10 · 90 | PROPOSTO máx. 6 |
| Study / Estudo | +5% EXP · 6 · 120 | +5% · 10 · 75 | PROPOSTO máx. 6 |
| Trading / Comércio | +8% ₽ · 6 · 100 | +5% Ryu · 10 · 110 | Manter (soma igual a +50%) |
| Fortune / Fortuna | +5 sorte · 6 · 140 | +2 · 10 · 130 | Manter (curva de Sorte mais sensível) |
| Magnetism / Magnetismo | +0,6 coleta · 5 · 80 | +0,6 · 10 · 75 | PROPOSTO máx. 5 |
| Leftovers / Chakra Curativo | +0,2 HP/s · 5 · 120 | +0,2 · 5 · 90 | Igual |
| Shell / Couraça | +2 armadura · 6 · 120 | +2 · 10 · 100 | PROPOSTO máx. 6 |
| Precision / Precisão | +1% crítico · 5 | +1 p.p. · 10 · 140 | PROPOSTO máx. 5 |
| Swiftness / Celeridade | +2% vel. de ataque · 5 | +2% · 10 · 120 | PROPOSTO máx. 5 |
| Expansion / Expansão | +3% área · 5 | +3% · 5 · 110 | Igual |
| Harmony / Meditação de Chakra | Ultimate 4% mais rápida · 5 | 4% · 5 · 120 | Igual |
| Research / Pesquisa | +25% · 4 · 250 | +25% · 4 · 140 | Igual |
| 4th move / Quarta técnica | 1.500 (15× um nível de atributo) | 400 (5×) | ⚠ PROPOSTO ~1.000 Lamens |
| Fourth option / Quarta opção | 3.000 (30×) | 500 | ⚠ PROPOSTO ~1.500 |
| Revive / Selo de Ressurreição | 5.000 | 500 | ⚠ PROPOSTO ~2.000 |
| Support team / Suporte adicional | 3.500 (+1 Alpha, de 2 para 3) | 600 (+1 ajudante, até 5) | PROPOSTO ~1.500 |
| Vitamin slots / Farmacologia | +1 espaço · 2 · 1.200 | +1 nível máx. de pílula · 2 · 300 | São coisas diferentes. Ver seção 2 |
| Archive / Baú do Clã | 5 vagas/nível (6 níveis) +1 a cada 2 itens desbloqueados (até 59) · 800 | 5/nível (6) +1 a cada 2 desbloqueados · 60 | Regra igual. PROPOSTO preço ~300 |
| Big Bag / Bolsa Grande | 3 itens na Bag em vez de 2 | 3 prioridades em vez de 2 · 250 | Igual |
| Ganho por run | Corrida curta da Zona 1 (2–3 min) = 15–22 ✦ (medido) | Lamens só pelo desempenho da run | PENDENTE: medir Lamens de uma run de 2–3 min para calibrar a razão preço/ganho |

**Leitura:** a relação entre atributos e desbloqueios estruturais é a maior diferença. Na referência, um desbloqueio grande custa de 15 a 50 níveis de atributo; aqui custa de 5 a 7. Os máximos de 10 níveis em quase todos os atributos também passam do teto da referência (5–8).

## 4. Inimigos, zonas e chefes

| Tema | Ref. | Atual | Proposta |
|---|---|---|---|
| Estrutura do Clássico | 3 zonas + santuário do lendário; guardião acordado no altar com E; portal | Zonas de 10 min (`ZONE_SECONDS` = 600) + arena da bijū; guardião pelo Selo; portal | Igual em espírito |
| HP do guardião da Zona 1 | Scyther 4.203 HP; acordado aos ~2:00 no Nv. 7, derrubou o jogador em 4 s (medido) | Fórmula em `missions.ts` (260 × ameaça × tempo × Final Swarm × zona) | Manter. Na referência o guardião cedo é intencionalmente letal |
| HP de chefe x dano do jogador | O HP do chefe se adapta ao dano trazido: ~60 s do seu dano no santuário e no Mewtwo, ~50 s no Survival (Patch #2/#3) | Fórmula fixa pelo tempo; não lê o dano do jogador | ⚠ PROPOSTO: piso de HP do guardião = dano médio dos últimos 30 s × 50–60 s |
| Golpe de chefe | No máximo 1/3 do HP do jogador por golpe; "Ferido" corta a cura pela metade por 4 s (Patch #2) | Sem teto | PROPOSTO: teto de 33% do HP máximo por golpe de chefe |
| Duas fases | O guardião entra em Fúria ao perder vida e vem com escolta de elites | Bijū em 3 fases; guardião comum sem fúria | PROPOSTO |
| Dificuldades | Difícil: mais inimigos, mais rápidos e mais elites. Pesadelo: hordas maiores, elites que explodem (Patch #3) | `MISSION_TIER` Genin 1 · Chunin 1,4 · Jonin 1,9 · Kage 2,6 (HP, dano e teto) | Manter |
| Crescimento com o tempo | Sem número na wiki. A Daily Mutation "Candy Fever" acelera o fortalecimento em 60% | `ENEMY_SCALING`: HP ×(1+0,3·min)·1,17^min, dano ×(1+0,2·min)·1,06^min, resistência +1,5%/min até 60% | PENDENTE: não há número público para comparar |
| Survival / pós-relógio | Chefe a cada 5 min; Noite sem fim aos 45 min (Season 3: Noite aos 30, Mewtwo aos 35, Apocalipse aos 40); depois de 1 h a horda nunca para de acelerar | Final Swarm ao zerar o relógio: HP/dano ×3 +25%/min, teto até 8.000 (`FINAL_SWARM`) | PROPOSTO: um chefe ou Mega Elite garantido a cada 5 min de Final Swarm |
| Inimigos desenhados | "Enemies drawn": Perto / Muito perto desenham só os 300 / 120 mais próximos; as sombras continuam | Todos desenhados em lote instanciado | ⚠ PROPOSTO: opção de desenhar só os N mais próximos, pela meta de 8.000 no swarm |
| Textos flutuantes | No máximo 8 ao mesmo tempo (Patch #3) | Números de dano com pool próprio; H esconde | Manter |
| Elite | O primeiro elite de cada zona solta uma Poké Ball grátis | Elites dão mais saque; sem kunai grátis | PROPOSTO: primeiro elite da zona solta uma kunai grátis |

## 5. Economia da run

| Tema | Ref. | Atual | Proposta |
|---|---|---|---|
| Recompensa paga no mapa | Poké Ball em ₽; depois do Patch #5 a 15ª compra custa 1.570 ₽ e a 20ª 4.673 ₽ (antes 5.627 / 28.357). Razão ≈ ×1,24 por compra nessa faixa | Kunai/shuriken = 20 × 1,5^aberturas × 1,15^minutos (`WEAPON_PRICE`, `PRICE_INFLATION`). Sem a inflação, a 15ª custa ~5,8 mil e a 20ª ~44 mil | Decisão do usuário: ele pediu economia exponencial ("kunai a milhões"). PROPOSTO: crescimento de ×1,3 por abertura se o late game ficar travado |
| Ryu por abate | O Patch #5 deu +25% de ₽ por abate | `BASE_LOOT.ryu` = 3 com chance de 72%; não escala com o tempo | ⚠ PROPOSTO: Ryu por abate × inflação da run, para acompanhar os preços |
| Venda de item | Vale uma fração do preço da Poké Ball pela raridade; um Lendário vale 1,5 Poké Ball (Patch #5) | Fixo: 12 / 18 / 28 / 45 / 75 Ryu (`itemTrade.ts`) | ⚠ PROPOSTO: venda = preço atual da kunai × 0,25 / 0,4 / 0,6 / 0,9 / 1,5. Hoje vender um item fica sem valor quando a kunai custa milhares |
| Loja (Meowth × Mercador) | Preços sobem durante a run; botão "Restock" | Novo estoque cotado por raridade ×1,35^compras ×1,12^atualizações × inflação; preços atuais ficam fixos. Atualizar custa 20 ×1,5^usos, com desconto (`PRICE_GROWTH`) | Igual em espírito |
| Caça-níquel × Roleta | Existe; segurar E gira sem parar | 30 × 1,35^giros × inflação (`ROULETTE_RULES`); segurar E gira rápido | Igual em espírito |
| Itens de densidade | Repel: −8% inimigos e +6% velocidade. White Flute: +12% inimigos, +10% EXP, +5 sorte | Incenso Repelente e Flauta Provocadora com os mesmos números | Igual |
| Altar de carregar | Unown: só carrega dentro do círculo e drena ao sair. "Secret Key" carrega 30% mais rápido e drena pela metade | `ALTAR_RULES`: sobe dentro e cai fora, mais rápido conforme a raridade | PROPOSTO: item que acelera a carga e reduz a queda, como o Secret Key |
| Crítico | Crítico acima de 100% vira "mega crítico"; dano crítico sem teto. Leek: 3% de chance de ×8 | `rollCritical`: chance > 1 dá mega crítico (+0,5 no multiplicador) | Igual |

## 6. Itens-chave da referência que ainda não temos

PROPOSTO, para o usuário escolher:
- **TM Case** (Lendário): técnicas +2 níveis máximos.
- **Max Ether** (Épico): pílulas +2 níveis máximos (hoje só pela passiva).
- **Rare Candy** (Lendário): +2 níveis na hora e +5% de dano.
- **Dowsing Machine** (Raro): +1 altar e +2 recompensas por zona.
- **Silph Scope** (Épico): marca o inimigo mais forte, que recebe +40% de dano.
- **Reaper Cloth** (Épico): +1% de dano a cada 100 abates, até +30%.

Os demais têm equivalentes no catálogo (`catalog.ts`, 94 itens) ou dependem de mecânicas de tipo/elemento.

## 7. O que mudar primeiro (PROPOSTO, aguardando decisão do usuário)

1. Venda de item proporcional ao preço atual da kunai (seção 5). É a maior inconsistência interna.
2. Ryu por abate acompanhando a inflação.
3. HP do guardião com piso pelo dano do jogador e teto de dano por golpe de chefe.
4. Preços dos desbloqueios estruturais do Lab (4ª técnica, 4ª opção, ressurreição, suporte).
5. Máximos de 5–8 níveis nos atributos permanentes e Atualizar/Pular/Banir iniciais 2/2/1.
6. Opção de desenhar só os N inimigos mais próximos.
