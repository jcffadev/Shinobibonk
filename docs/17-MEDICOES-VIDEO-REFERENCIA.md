# Medições do vídeo de referência (PokéBonk, início de run, Normal) · 11/11/2026

Complementa `docs/16-ESTUDO-BALANCEAMENTO-OBSERVAVEL.md` (item 3 de "Próximas medições"). Somente observação de gameplay gravado pelo usuário: sem engenharia reversa, sem cópia de assets; o vídeo e os frames ficaram fora do repositório (pasta temporária da sessão). **Nenhum código ou parâmetro foi alterado.**

Legenda: **OBSERVADO** = lido no frame · **INFERIDO** = calculado a partir do observado · **INCERTO** = ilegível, estimado ou sem evidência suficiente. Propostas estão marcadas como **PROPOSTO**.

## 1. Fonte e método

| Item | Valor |
|---|---|
| Arquivo | `referencia.mp4` na pasta de clips do Medal do usuário (239.688.849 bytes) |
| Duração / resolução | 120,3 s · 1330×720 · HEVC ~60 fps (OBSERVADO via ffprobe) |
| Trecho da run | relógio da run de **0:00 a 1:26,5** — zona 1/3 "Ilha Canela", dificuldade **NORMAL**, personagem Gastly (OBSERVADO) |
| Tempo fora do relógio | ~34 s do vídeo são pausas, telas de level-up e uma cena de captura (INFERIDO: 120,3 − 86,5) |
| Extração | `ffmpeg7.exe` que acompanha o gravador Medal já instalado (nada baixado), sem áudio (`-an`): 1 frame a cada 5 s, depois 1 frame/s em resolução cheia (120 frames) e 12 folhas com recortes ampliados da HUD (nível, relógio, moedas, abates, "N inimigos") |
| Leitura | 1 amostra por segundo da HUD; telas de pausa (0:00, 0:35, 0:52, 1:04, 1:26) e os 5 level-ups lidos em resolução cheia |

**Limite principal:** a conta do vídeo **não é nova**. A ficha mostra Dano 135%, Dano especial 118,8%, Vel. de ataque 110%, Área 115%, HP 166, Armadura 19 (−30%), Velocidade 122,8%, Experiência 134%, Pokédólares 148%, Sorte 33, um item Lendário inicial (Max Revive) e 8/8/7 usos de Atualizar/Pular/Banir (OBSERVADO). O ritmo medido é de conta desenvolvida em Normal, não de primeira partida.

## 2. Linha do tempo (relógio da run)

Todos os valores são OBSERVADOS, salvo indicação. "Vivos" é o contador "N inimigos" do rodapé do jogo. Dano/DPS só aparecem nas telas de pausa.

| Run | Nível | XP | HP | Abates | Dano total | Dano/s (painel) | Moedas | Vivos | Evento |
|---|---:|---|---|---:|---:|---:|---:|---:|---|
| 0:00 | 1 | 0/15 | 166/166 | 0 | 0 | 0 | 0 | 0 | Pausa inicial; relógio da zona 10:00 regressivo |
| 0:05 | 1 | — | — | 0 | — | — | 10 | 2 | +10 moedas sem abate (pedra "Rock Smash"; origem INCERTA) |
| 0:10 | 1 | — | — | 0 | — | — | 10 | 4 | Aviso: ovo choca após 200 derrotas |
| 0:15 | 1 | — | — | 1 | — | — | 10 | 5 | Primeiro abate em ~0:12 |
| 0:21,3 | **2** | — | — | 5 | — | — | 11 | 4 | Level-up 2 |
| 0:30 | 2 | — | — | 11 | — | — | 16 | 4 | |
| 0:32,4 | **3** | — | — | 12 | — | — | 16 | 4 | Level-up 3 |
| 0:35 | 3 | 6/32 | 166/166 | 13 | 753 | 31 | 16 | 5 | Pausa |
| 0:45 | 3 | — | — | 20 | — | — | 18 | 6 | |
| 0:49,0 | **4** | — | — | 22 | — | — | 19 | 8 | Level-up 4 |
| 0:52 | 4 | 16/42 | 165/166 | 28 | 1.730 | 55 | 20 | 8 | Pausa |
| 1:00 | 4 | — | — | 34 | — | — | 22 | 7 | |
| 1:02,4 | **5** | — | — | 37 | — | — | 23 | 7 | Level-up 5; "Ultimate pronta" |
| 1:04 | 5 | 9/54 | 166/166 | 38 | 2.347 | 59 | 23 | 8 | Pausa; Ultimate usada 1× = 159 de dano |
| 1:10–1:16 | 5 | — | — | 42–43 | — | — | 25→34 | 13–18 | Alvo capturável com feixe de luz e marcador de distância; derrotado ≈1:14 (+8 moedas), captura (cena ~6 s, relógio parado) |
| 1:20 | 5 | — | — | 45 | — | — | 34 | 21 | Pico de vivos: 24 em 1:23–1:24 |
| 1:25,6 | **6** | — | — | 52 | — | — | 37 | 22 | Level-up 6; escolhe 2º ataque (armadilhas) |
| 1:26,5 | 6 | 38/66 | 139/141 | 63 | 4.122 | 198 | 37 (41 no painel) | 12–13 | +11 abates em ~1 s com o novo ataque; pausa final |

Observações adicionais (OBSERVADO): HP máximo caiu de 166 para 141 entre 1:04 e 1:26 sem escolha visível que explique (causa INCERTA). O jogador quase não sofreu dano em 86 s (perdeu no máximo 1–2 de HP). Nenhuma loja, baú, elite ou chefe apareceu no trecho; preços não foram observados.

## 3. Level-ups: o que foi oferecido

Sempre **4 cartas**, relógio parado, com Atualizar (8) / Pular (8) / Banir (7) (OBSERVADO).

| Nível | Carta 1 | Carta 2 | Carta 3 | Carta 4 | Escolha |
|---|---|---|---|---|---|
| 2 | Melhoria de ataque (Comum): +22% dano, +5% crítico; 37,7→50,9 | Vitamina nova (Comum): +18% surgimento de elites, +5% dano em elites | Vitamina nova (Comum): +10% duração | Vitamina nova (Incomum): +0,06 sobrecura | Carta 2 |
| 3 | Melhoria de ataque (Incomum): +1 golpe, +18% área; 37,7→42,3 | Vitamina nova (Raro): +14,5% área | Melhoria da vitamina (Comum) | Vitamina nova (Comum): +10% duração | Carta 3 |
| 4 | Ataque novo: 23,2×2, recarga 1 s | Melhoria da vitamina (Comum) | Vitamina nova (Comum): +0,5 projétil | Vitamina nova (Comum): +7% velocidade | Carta 2 |
| 5 | Ataque novo: 40,2, recarga 1,3 s | Vitamina nova (Comum): +10 espinhos | Vitamina nova (Comum): +5% crítico | Vitamina nova (Incomum): dado aleatório | Vitamina de moedas (+18%), via Atualizar (INFERIDO) |
| 6 | Ataque novo: 70,4×2, recarga 2,1 s | Melhoria de ataque (Comum): +1 golpe, +15% área | Vitamina nova (Comum): +10% dano especial | Vitamina nova (Incomum): +21,6 HP máx. | Carta 1 |

Contagem nas 20 cartas vistas (INFERIDO): 14 Comuns, 4 Incomuns, 1 Raro e 3 ataques novos sem raridade exibida; sempre 1–2 cartas de ataque e 2–3 vitaminas; nenhum item. A partir do nível 4, toda tela trouxe um ataque novo.

Ataque inicial (OBSERVADO na ficha): poder 30, **37,7 por golpe**, recarga 0,73 s, 51,3 de dano/s nominal, raio 3,8 m, golpe em arco; "Nv. 1 37,7 → Nv. 8 75,2 (×2) só por subir de nível".

## 4. Cálculos

### 4.1 Curva de XP
| Nível | XP para subir | Instante do level-up | Intervalo | Abates no intervalo |
|---:|---:|---:|---:|---:|
| 1→2 | 15 (OBSERVADO) | 0:21,3 | 21,3 s (≈9 s desde o 1º abate) | 5 |
| 2→3 | ≈22 (INFERIDO; não apareceu em tela) | 0:32,4 | 11,1 s | 7 |
| 3→4 | 32 (OBSERVADO) | 0:49,0 | 16,6 s | 10 |
| 4→5 | 42 (OBSERVADO) | 1:02,4 | 13,4 s | 15 |
| 5→6 | 54 (OBSERVADO) | 1:25,6 | 23,2 s (inclui a captura) | 15 |
| 6→7 | 66 (OBSERVADO) | fora do vídeo | — | — |

- Incremento por nível ≈ +10, +10, +12, +12 (INFERIDO). XP acumulada em 1:26,5 ≈ 15+22+32+42+54+38 = **203**, com 63 abates → **≈3,2 XP por abate** com Experiência 134% (INFERIDO; base ≈2,4).
- Abates por nível na prática: 5 · 7 · 10 · 15 · 15 → **52 abates para chegar ao nível 6 em 86 s**.

### 4.2 Abates, horda e surgimento
| Janela | Abates | Abates/min | Vivos (mín–máx) | Surgimento estimado |
|---|---:|---:|---:|---:|
| 0:00–0:35 | 13 | 22 | 0–6 | ≈0,5/s (18 nascidos) |
| 0:35–1:04 | 25 | 51 | 5–9 | ≈1,0/s (28 nascidos) |
| 1:04–1:25,6 | 14 | 39 (captura no meio) | 8–24 | ≈1,3/s (28 nascidos) |
| 0:00–1:26,5 | 63 | 44 | — | ≈0,9/s (76 nascidos) |

Surgimento = (abates + variação de vivos) ÷ tempo (INFERIDO; ignora inimigos que somem). Primeiro minuto: ~34 abates.

### 4.3 Dano e golpes para matar
- Número flutuante típico: **38** por golpe do ataque inicial (OBSERVADO), sem crescimento no trecho: o jogador não melhorou o ataque.
- Dano total ÷ abates: 58 (0:35) · 62 (0:52) · 62 (1:04) · 65 (1:26) → **HP do inimigo comum ≈55–60** e sem crescimento perceptível em 86 s (INFERIDO; assume que o painel conta dano efetivo). → **2 golpes por inimigo comum**, ≈1,5 s por alvo isolado; o arco acerta vários.
- Dano/s médio da run (dano ÷ relógio): 21 · 33 · 37 · 48. Dano/s do painel (janela de ~15 s): 31 · 55 · 59 · 198 (o último é o estouro do 2º ataque).
- Coerência com `docs/16`: o relato de terceiros (2:04 / nível 7 / 108 abates / 8.338 de dano) prolonga a mesma reta (1:26 / nível 6 / 63 abates / 4.122).

### 4.4 Moedas
27 moedas por abates/coleta em 86 s (37 − 10 iniciais; inclui +8 do alvo capturável) → **≈19/min** e **≈0,3–0,4 por abate**, com bônus de moedas de 148% a 174,6% (INFERIDO). Sem preços no vídeo, não dá para converter em poder de compra.

## 5. Comparação com o ShinobiBonk (Genin, zona 1, fórmulas atuais)

Valores do ShinobiBonk calculados de `src/game/progression.ts` e `src/game/enemyTiers.ts` (fórmula, **não** run medida).

| Medida | Vídeo (Normal, conta desenvolvida) | ShinobiBonk atual (fórmula) | Divergência |
|---|---|---|---|
| XP para subir (nív. 1–6) | 15 · ≈22 · 32 · 42 · 54 · 66 | 30 · 24,1 · 30,3 · 36,7 · 43,3 · 50,0 (`xpToLevelUp`) | Nosso nível 1 custa **mais** que o 2 (curva invertida no início) e cresce mais devagar depois |
| XP por abate comum | ≈3,2 (≈2,4 base) | 8 (`BASE_LOOT.xp`) | ×2,5–3,3 |
| Abates por nível (1–5) | 5 · 7 · 10 · 15 · 15 | 3,8 · 3,0 · 3,8 · 4,6 · 5,4 | Subimos de nível com ~1/3 dos abates |
| Abates até o nível 6 | 52 | ≈21 | ×2,5 mais rápido |
| Surgimento | ≈0,5/s → 1,0/s → 1,3/s | 1,32/s (0 s) · 3,6/s (30 s) · 6,4/s (60 s) · 9,5/s (90 s) | 3 a 7 vezes mais inimigos nascendo no início |
| Vivos / teto | 1–6 · 5–9 · até 24 | teto 39 (0 s) · 124 (60 s) · 181 (90 s) | O teto não limita nada no início; quem manda é o surgimento |
| HP do comum | ≈55–60, estável em 86 s | 22 (0 s) · 33,5 (60 s) · 40,4 (90 s): +84% em 90 s | A referência não endurece o comum no 1º minuto e meio |
| Golpes para matar | 2 (golpe 37,7 contra ≈58) | 22 ÷ 9,9 de dano-base do Naruto = 2,2 no início; ≈2,6 aos 60 s mesmo no nível 5 (INCERTO: depende do multiplicador da técnica) | Parecido no segundo 0, piora rápido |
| Moedas | ≈0,3–0,4 por abate | 3 × 72% = 2,16 Ryu por abate | Escalas monetárias diferentes; só comparável com preços |
| Primeiro alvo especial | ≈1:10, morto em poucos segundos | 1º mega entre 42–68 s com ~20.000 HP (`megaEliteHp`, `rollMegaSchedule`) | Classes diferentes; não comparável diretamente (INCERTO) |

Leitura: no ShinobiBonk o jogador recebe muito mais inimigos e muito mais XP por inimigo do que a referência nos primeiros 90 s; combinados, o tempo até os níveis 2–6 deve ser várias vezes menor (**PENDENTE** medir em run real, como já previsto em `docs/15` e `docs/16`). A referência usa abertura calma (1 level-up a cada 11–23 s, menos de 10 inimigos vivos no 1º minuto) e acelera a partir de ~1:05.

## 6. Propostas numéricas (PROPOSTO — nada aplicado)

1. **XP por abate e nível 1.** `BASE_LOOT.xp` 8 → **3** e `xpToLevelUp(1)` 30 → **15** (o restante da fórmula igual). Abates por nível passariam a 5 · 8 · 10 · 12 · 14 · 17 (≈50 até o nível 6; vídeo: 52). Teste sem tocar no código: debug "EXP ganha" = 0,375. **Risco:** desacelera a run inteira ×2,67; validar níveis aos 5/10/18 min antes de aprovar, ou compensar com a curva tardia.
2. **Alternativa mais conservadora ao item 1:** manter 8 de XP e multiplicar a exigência por nível (debug "EXP necessária por nível" ≈ 2,6: nível 2 = 63, nível 3 = 79...) e fixar o nível 1 em **40** (hoje 30, que viraria 78 com o multiplicador), para ele deixar de custar mais que o nível 2. Resultado em abates: 5 · 8 · 10 · 12 · 14, igual ao item 1.
3. **Abertura da horda (Genin).** Trocar a rampa `earlyGenin` de `.66+.34×min(1, min/2,5)` por **`.2+.8×min(1, min/2,5)²`**: surgimento 0,4/s (0 s) · 1,2/s (30 s) · 2,6/s (60 s) · 5,4/s (90 s) e idêntico ao atual de 2:30 em diante. Ainda fica ~2× acima da referência aos 60 s, preservando o pedido anterior de hordas densas mais tarde.
4. **HP do comum no início.** Só começar o crescimento de HP depois de 60–90 s em Genin (ex.: usar `max(0, min−1)` no termo de HP), mantendo 22 de base: 2 golpes por comum durante a abertura, como no vídeo. Prioridade baixa: o HP da referência é estimativa indireta e 86 s não mostram a curva dela.
5. **Cadência de ataques novos.** No vídeo, 3 dos 5 primeiros level-ups ofereceram ataque novo e o 2º ataque entrou no nível 6 (o nosso 2º slot abre no nível 5, `unlockLevel` [1,5,12,20]): já próximo; manter.
6. **Moedas:** sem proposta. Medir primeiro preço de kunai/roleta/mercador contra Ryu/min (item 4 de `docs/16`).

Ordem sugerida de teste: 3 → 1 (ou 2) → 4, um por vez, medindo tempo até os níveis 2/4/6, abates aos 60 s e vivos aos 30/60/90 s, com meta de abertura "nível 2 em 15–25 s, nível 6 em 80–100 s".

## 7. O que não foi possível medir

- Qualquer coisa depois de 1:26: elites, chefes/guardião, lojas e preços, baús, troca de zona, Final Swarm, crescimento de HP/dano dos inimigos.
- HP real de inimigos (sem barra numérica); dano recebido por golpe inimigo (o jogador quase não foi atingido).
- XP exigida no nível 2 e XP exata por abate (não há número de XP na HUD de jogo, só nas pausas).
- Efeito isolado da progressão da conta: os atributos já vinham inflados; uma conta nova teria ritmo mais lento.
- Versão do jogo (não aparece no trecho) e causa da queda de HP máximo 166 → 141.
- Lado ShinobiBonk: tudo aqui é fórmula; falta a run medida equivalente (Genin, zona 1, 0–90 s).
