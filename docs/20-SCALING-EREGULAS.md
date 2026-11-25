# 20 · Scaling e regras — fórmulas e números do jogo

> Criado em **12/11/2026** (rodada 36 — consolidação de contexto). **Fonte da verdade: o código** (`src/game/`); este documento consolida os valores **lidos do código nesta data**. Ao alterar balance, atualize aqui o mesmo bloco. Estados: `IMPLEMENTADO` (no código) · `PROPOSTO` (aprovado no plano, ainda não codificado).

## Guardiões e Bijū no Final Swarm · 25/11/2026

O Guardião pode ser invocado a qualquer momento, inclusive depois de 15 minutos de Final Swarm. A armadura base sobe 30 pontos por minuto da missão e mais 90 por minuto de Final Swarm. A parcela da zona é 28 pontos por faixa. A redução de dano é `armadura / (100 + armadura)`. Cada plano do Shikamaru soma 33% à armadura e à ameaça usada para o HP e o dano da zona. Até três planos rendem um pergaminho adicional cada. A Bijū aplica o multiplicador da arena, carrega a pressão e o tempo excedente da zona final e considera os planos acumulados na missão.

Em Kage, na zona 1, o cálculo dá 4,45 milhões de HP e 85,8% de redução aos +1 min de Final Swarm sem planos. Com três planos, são 8,86 milhões e 92,3%. Aos +15 min são 136,47 bilhões e 95,8% sem planos, ou 271,57 bilhões e 97,8% com três. A base anterior dava 2,59 milhões e 80,0% aos +1 min, e 30,33 bilhões e 86,9% aos +15 min sem planos. O multiplicador de dano aplicado em cima da ameaça da missão cresce com tempo e zona. A simulação de referência com Naruto Academia Kage e invocações cedo chegou à zona 3 aos 25 min nas duas versões. A janela de desvio e o impacto dos golpes na arena seguem pendentes de teste em partida.

### Próxima calibração · Claude Code

O usuário confirmou HP sem teto de gameplay para chefes de zona, incluindo trilhões e quadrilhões. O HUD já apresenta T e Q. A curva atual cresce com espera e Final Swarm. A próxima revisão deve validar o intervalo numérico suportado sem truncar a vida por um limite arbitrário. A defesa aproximadamente 20 vezes maior para a Bijū entra na fila de calibração. Use o multiplicador na armadura bruta como ponto de partida, antes da conversão para redução de dano, e valide se os golpes continuam descontando HP. Os parâmetros da curva atual seguem os valores deste documento até essa rodada de balanceamento.

## Medição de Guardiões e Bijū · 25/11/2026 (Claude Code)

**Ferramenta:** `scripts/simulate-bosses.mjs` (sem navegador). Usa as mesmas fórmulas do jogo: `guardianVitality`, `guardianDefense`, `bijuuVitality` e `bijuuDefense`. A vida e a defesa da Bijū saíram do GameCanvas para `src/game/bijuu.ts` (`BIJUU_RULES`), sem mudar nenhum número.

- **Cenário A:** o bot fica na zona 1 sem invocar o Guardião. Em cada marco, mede quanto tempo levaria para derrubá-lo ali com o dano de alvo único da build.
- **Cenário B:** o bot vence a zona 3 cedo. Com a build final, mede a Bijū chegando com 0, +1, +7 e +15 min de Final Swarm.
- **Amostra:** 115 versões × 4 dificuldades × 0 a 3 planos por zona, semente 17. A Bijū usa os planos somados na missão (até 9).
- **Limites:** o modelo não tem ultimate, aliados, procs, fusões nem desvio real. O dano real tende a ser maior, então os tempos abaixo são de pior caso.

**Guardião da zona 1** (mediana: HP · defesa · tempo de luta):

| Dificuldade · planos | Normal (2:40) | 10:00 | +1 min | +7 min | +15 min |
|---|---:|---:|---:|---:|---:|
| Genin · 0 | 2,9 mil HP · 72,6% · 1,3 s | 68 mil · 82,9% · 0,2 s | 750 mil · 85,8% · 1,2 s (16 vivos) | ninguém vivo | ninguém vivo |
| Kage · 0 | 8,9 mil · 72,6% · 2,3 s | 366 mil · 82,9% · 1,9 s | 4,4 mi · 85,8% · 13 s (53 vivos) | 635 mi · 93,0% · 4,6 h (1 vivo) | ninguém vivo |
| Kage · 3 | 17,7 mil · 84,1% · 8 s | 727 mil · 90,6% · 6 s | 8,7 mi · 92,3% · 33 s (11 vivos) | ninguém vivo | ninguém vivo |
| Chunin · 3 | 8,5 mil · 84,1% · 6 s | 240 mil · 90,6% · 5 s | 2,7 mi · 92,3% · 35 s | 274 mi · 96,3% · 85 s (5 vivos) | 36 bi · 97,8% · 14 min (5 vivos) |

O Guardião cai em segundos até +1 min. No Final Swarm, quase ninguém sobrevive até +7 min no modelo. Quem sobrevive enfrenta lutas de minutos a horas, porque a vida dobra a cada 6 min e a armadura sobe 90 por minuto.

**Bijū na chegada:** mediana do tempo de luta para cada opção de armadura, em vezes a armadura bruta do Guardião equivalente:

| Dificuldade | Planos por zona | 1,35× (atual) | 3× | 5× | 10× | 20× |
|---|---:|---:|---:|---:|---:|---:|
| Genin | 0 | 60 s | 2 min | 3,3 min | 6,5 min | 13 min |
| Genin | 3 | 14 min | 32 min | 52 min | 1,7 h | 3,4 h |
| Chunin | 0 | 1,7 min | 3,5 min | 5,6 min | 11 min | 22 min |
| Jonin | 0 | 1,7 min | 3,5 min | 5,6 min | 11 min | 22 min |
| Kage | 0 | 2,9 min | 6 min | 9,7 min | 19 min | 39 min |
| Kage | 1 | 12,5 min | 27 min | 43 min | 1,4 h | 2,9 h |
| Kage | 3 | 58 min | 2,1 h | 3,6 h | 7 h | 14 h |

Leituras:
- A defesa é uma redução proporcional (`a/(100+a)`). **20× a armadura equivale a cerca de 17× mais vida.** Por exemplo, com 86,7% de redução sobram 13,3% do dano, e com 99,2% sobram 0,8%.
- Os planos já pesam muito na Bijū. Ela soma os planos da missão inteira (até 9), e cada plano aumenta em 33% tanto a vida quanto a armadura. Com 3 planos por zona, a luta no Kage já leva cerca de 1 hora com a regra atual.
- Chegar atrasada ao Final Swarm pesa muito: a vida da Bijū sobe de 11 a 12 vezes só no primeiro minuto. Sem planos, a luta no Kage passa de 3 min na chegada para 43 min aos +1 e para cerca de 9 dias aos +7.

**Limite numérico:** `BOSS_HP_LIMIT` (1e300) em `src/game/missions.ts`. Não é teto de gameplay: a conta só passaria de `Infinity` depois de cerca de 24 h de Final Swarm. Acima de 2^53 de vida, cada golpe ainda desconta, desde que seja maior que 1 quatrilionésimo da vida. A defesa nunca chega a 100%, nem com 20× aos +24 h.

**PROPOSTO, aguardando decisão do usuário:** qual multiplicador de armadura usar e se os planos da Bijū devem contar só os da última zona (até 3) em vez da missão inteira. Os números continuam como estavam.

## Kakashi dos Dois Mangekyō · 24/11/2026

Como segundo avanço da família, parte de ×1,24 de HP e dano de base, +2 de armadura e +0,16 m/s de movimento em relação ao Kakashi Jōnin. A passiva da versão acrescenta +12% de Ninjutsu e +5 pontos de evasão, conforme a progressão de passivas do elenco. A missão em Iwa Kage usa Kakashi Hokage, 7 minutos e 950 abates. Nas sementes 17, 101 e 252, Kakashi Jōnin, Hokage e Dois Mangekyō chegaram à zona 2 no simulador em Kage, conta nova, até 12 minutos. O simulador aproxima a horda e deixa as ultimates fora do cálculo.

## 1. Dificuldade (rank da missão) — `progression.ts`

`MISSION_TIER` (IMPLEMENTADO): **Genin ×1 · Chunin ×1,4 · Jonin ×1,9 · Kage ×2,6**. Sem desconto de early game em nenhum rank (revisão 11/11 — pedido do usuário: todas nascem na força plena do tier, em suas devidas proporções).

## 2. Escala de inimigos por tempo de run (minutos) — `progression.ts`

`ENEMY_SCALING` (IMPLEMENTADO, atualizado nas rodadas 47 e **50**): `hpBase 3,2 · hpLinear 0,3 · hpPerMinute 1,17 · damageBase 1,45 · damageLinear 0,2 · damagePerMinute 1,06 · maxEnemies 1600 · capBase 36 · capLinear 52 · capQuad 3,8 · spawnBase 2 · spawnPerMinute 6 · maxSpawnPerSecond 90 · armorPerMinute 0,03 · maxArmor 0,72`. (Era `hpBase 1,6 · capBase 60 · capLinear 90 · capQuad 6,4 · armorPerMinute 0,015 · maxArmor 0,6` — a tabela abaixo foi recalculada com os valores atuais.)

Fórmulas (com `tier = MISSION_TIER`, `min` = minutos totais da run, `curse` = maldição):

```
HP inimigo    = tier × (3,2 + 0,3×min) × 1,17^min × curse × swarm
Dano inimigo  = tier × (1,45 + 0,2×min) × 1,06^min × curse × swarm
Teto da horda = min(1600, floor((36 + 52×min + 3,8×min²) × (0,85 + 0,15×tier)))
Spawn/s       = min(90, (2 + 6×min) × √tier)
Armadura      = min(0,72, 0,03×min)   (velocidade e cadência também escalam com tier/min)
```

**Tabela Genin (tier 1)** — referência do usuário para teste de gameplay (recalculada na **Rodada 50**, 12/11 — a coluna TETO é ~−40% no early game, **PROPOSTO**: o usuário testa e ajusta):

| Minuto | HP do inimigo | Dano | Teto da horda (era) |
|---|---|---|---|
| 1 | ×4,1 (era ×2,2) | ×1,7 | 91 (era 156) |
| 2 | ×5,2 (era ×3,0) | ×2,1 | 155 (era 265) |
| 5 | ×10,3 (era ×6,8) | ×3,3 | 391 (era 670) |
| **6** | **×12,8 (era ×8,7)** | **×3,8** | **484 (era 830)** |
| 8 | ×19,7 (era ×14,0) | ×4,9 | 695 (era 1.189) |
| 10 | ×29,8 (era ×22,1) | ×6,2 | 936 (era 1.600) |
| 15 | ×81,1 (era ×64,3) | ×10,7 | 1.600 (teto, era aos ~10 min) |
| 30 | ×1.355 (era ×1.177) | ×42,8 | 1.600 |

Kage (tier 2,6) multiplica HP/dano por 2,6 e o teto por ×1,24 (teto duro 1.600; ex.: 5 min = **484** · 10 min = 1.160). O **%inimigos de itens/pílulas/debuffs** (`enemyCount`) **multiplica o cap por cima** via densidade em `GameCanvas.tsx` (`threatNow`) — a progressão por buffs se mantém (rodadas 49/50). **PROPOSTO (rodada 35, 12/11):** monstros ainda mais fortes aos ~6 min e jogador inicial mais fraco/gradual — em iteração com o teste do usuário (fila docs/13).

## 3. Dificuldade individual por zona (fase) — `progression.ts`

`ZONE_DIFFICULTY` (IMPLEMENTADO, 11/11): **zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38** — aplicada em `GameCanvas` a HP, dano, spawn e pressão de roleta. Zona dura `ZONE_SECONDS = 600` s (10 min).

## 4. Final Swarm (tempo extra da zona) — `progression.ts`

`FINAL_SWARM` (IMPLEMENTADO, atualizado nas rodadas 48/49): ao zerar o relógio da zona — **×3** na hora (HP, dano, defesa, quantidade/spawn) + **+25%/min** sobrevivido; armadura até 0,85; **teto 1.600 inimigos** (era 8.000 — rodada 48) com **rampa progressiva (rodada 49)**: até **+4 min** (240 s) o teto é **min(teto normal, 800)**; depois sobe linearmente até **1.600** em **+7 min** (420 s) — `ramp800Cap:800 · ramp800Seconds:240 · rampSeconds:420`; **clamp por quadro** em `GameCanvas.tsx` (remove excedentes comuns, **nunca** boss/guardião/mega elite) + cap na emboscada (`startFieldAmbush`); reposição: spawn ≥ teto÷4 s (horda volta em ~4 s); spawns num anel de **14–28 m** do jogador.

## 5. Elite / Mega Elite — `tuning.ts` (valores base do painel F9)

- Elite amarelo: chance base **8%**, defesa base **30%** (IMPLEMENTADO; o painel F9 multiplica por cima).
- Mega Elite: o **primeiro da partida** tem **no máximo 3.000 HP**, seja natural ou de clima, em qualquer dificuldade. O limite também vale ao aplicar o Plano do Shikamaru ou alterar a vida dos inimigos no debug. Guardiões, bijū e Shinobis de desbloqueio usam suas próprias regras. Os próximos Mega Elites usam base **9.500** com **±5% por nascimento** × `2^(max(0, segundosDaZona−55)/80)` × ameaça da missão. A defesa base continua em **55%**. Fórmula em `enemyTiers.ts` (`megaEliteHp`).
- Shinobi para selar: HP próprio (campo `accountHp` do F9).
- Versão da família que vira Mega Elite/ajudante por dificuldade: Genin → inicial, Chunin → v.1, Jonin → v.2, Kage → última (`heroes.ts`).

## 6. Atributos do jogador — `progression.ts` (`calculateStats`)

- **Dano-base do herói:** `base × heroDamageScale(nível) × (1 + bônus de dano total + Treinamento efetivo × 0,04)`. Gaara aplica também o fator de armadura. A passiva Treinamento contribui com 8% do efeito no Nv. 1 e chega ao efeito completo no Nv. 25.
- **Crescimento do personagem:** `heroDamageScale = (0,74 + 0,26 × min(1, n/14)) × (1 + 0,04 × n) × (1 + n/72)³`, com `n = nível − 1`.

  | Nível do personagem | 1 | 10 | 22 | 50 | 100 | 200 | 415 |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | Dano-base em relação ao Nv. 1 | 1,00× | 2,37× | 5,36× | 18,99× | 89,79× | 645,63× | 7.298× |

### Comparação com a vida dos monstros · 24/11/2026

O dano sem itens e com o afixo da técnica fixo cresceu em todos os níveis de 1 a 2.000 nas 115 versões verificadas. Mesmo com o ganho percentual de cada novo nível desacelerando, o termo cúbico combinado ao linear produz uma escala absoluta que aumenta bem mais rápido que a vida dos inimigos comuns nas primeiras zonas.

A simulação usou 1.380 partidas de até 12 minutos (115 versões × 4 dificuldades × sementes 17, 101 e 252), conta nova e desvio médio. Os números abaixo são medianas entre as partidas que chegaram ao minuto. A razão compara o acerto bruto médio da primeira técnica, incluindo a expectativa de crítico, com o HP de um monstro comum.

| Dificuldade | Minuto 1 | Minuto 5 | Minuto 8 | Minuto 12 |
| --- | --- | --- | --- | --- |
| Genin | 4,57× | 37,85× | 78,67× | 411,64× |
| Chunin | 5,35× | 31,46× | 43,03× | 271,80× |
| Jonin | 4,72× | 20,69× | 28,52× | 178,74× |
| Kage | 3,45× | 13,71× | 20,13× | 152,01× |

No minuto 12 as medianas já estão na segunda zona. A ameaça volta para o início da nova zona enquanto o nível, os afixos e os itens seguem com o jogador. Esse salto pede revisão de balanceamento. A auditoria preserva a curva e o XP atuais. O modelo aproxima a horda e não inclui movimentação real, ultimates nem procs condicionais.

### Demais atributos

- **HP** (Rodada 55, **PROPOSTO**): `(46 + 0,085×min(215, hp base)) × heroHpScale(nível) + vida plana + bônus` × `(1 + healthPct)`, com `heroHpScale = 1 + 0,04n/(1+n/150)` (`HP_GROWTH`; teto assintótico ×7). Antes (rodada 54): `1 + 0,032n + 0,00022n²`. Naruto sem itens: Nv. 1 **57** · 10 **76** (era 74) · 50 **141** (era 176) · 100 **193** (era 361) · 200 **252** (era 917) · 415 **308** (era 2.961).
- **Velocidade de ataque**: `1 + 0,008×n + % + Agilidade×2%` (mín. 0,2).
- **Crítico**: base + `0,0015×n` + bônus; **dano crítico 2,5×** (a chance crítica acima de 100% dá chance de tier 2, que soma +0,5× ao multiplicador).
- **Sorte**: `floor(n/3)` + bônus; sorte efetiva em loot: `luck × (0,2 + 0,8 × min(1, tempo/150s))` (pleno aos 2,5 min).
- **Coleta (ímã)**: raio `2,5 × (1 + pickup) + flat + Magnetismo×0,6`.
- **Vagas de suporte**: `3 + (até 1 de item) + (1 permanente)`.
- **Armadura**: `base × (1+1%/nível) + 0,25×n` + bônus; um golpe elegível tira no mínimo 1 HP, conforme `max(1, bruto × 100/(100 + armadura))`. Subir de nível ativa 3 s de invulnerabilidade, também no treinamento automático. A HUD sinaliza a proteção e o dano efetivo aparece em vermelho.
- **EXP por nível** (`xpToLevelUp`): nível 1 = 30; depois `18 + 6n + 0,08n²/(1+n/250)`:

  | Nível | 10 | 25 | 50 | 100 | 150 |
  |---|---|---|---|---|---|
  | EXP | 78 | 204 | 473 | 1.173 | 2.024 |

- **Dano salvo do herói**: base real = valor exibido ÷ `HERO_DAMAGE_FACTOR` (**0,41** — rodada 47 removeu o `.55` hardcoded da `version()`; única fonte em `heroes.ts`).
- **Versões da família** (passo): HP/dano ×1,12, +1 armadura, +0,08 movimento por passo (`heroes.version`).

## 7. Crescimento das técnicas (level-up) — `combat.ts`

O teto de nível usado pela oficina é o mesmo da evolução das técnicas. Consulte a [regra de fusão e combinação](10-PLANEJAMENTO-FUSAO-PROGRESSAO-V05.md#oficina-dos-sapos-sábios).

`GROWTH_ROLLS` (IMPLEMENTADO, revisão 11/11 — base ×1,5 + spread maior, pedido do usuário): **dano por nível** (%), por raridade [Comum · Incomum · Raro · Épico · Lendário]: base **[45 · 80 · 135 · 225 · 375]** + aleatório **[22 · 30 · 45 · 70 · 110]** → faixas **45–67 · 80–110 · 135–180 · 225–295 · 375–485%**. Afixos "outros" (área/recarga/duração): base **[15 · 27 · 38 · 45 · 60]** + **[11 · 14 · 14 · 21 · 21]**. Técnica de ataque: dano garantido + 1–2 afixos (setup: 2 afixos de buff).

`TECHNIQUE_SCALE = 1,2` (IMPLEMENTADO, 11/11): escala global de dano das técnicas do jogador e ajudantes (kits de chefe já escalam por fase em `bossCombat.ts`).

## 8. Treinamento / nível esgotado — `GameCanvas.tsx`

- **IMPLEMENTADO (11/11):** pool de técnicas/pílulas esgotado → level-up dá **+0,8% de Sorte**.
- **CONFIRMADO (rodada 37, 12/11 — APROVADO) e IMPLEMENTADO (rodada 48):** substituir por **atributo ALEATÓRIO +0,6%/nível** — `grantTraining()` usa `rollPowerlevel` + HUD flutuante acima da cabeça (“Treinamento - <atributo> +0,6%”); a cláusula “somente na utilidade que ele treina apenas sorte” segue **EM ABERTO** (docs/23 §4.2).

## 9. Economia — roleta e Ryu

- **Caça-Níquel da Tsunade** (ex-"Roleta da Tsunade"; `roulette.ts`, **IMPLEMENTADO — rodada 37 fase 3**, commit `ec7c42a`): custo = `round(30 × 1,70^giros × 1,15^minutos inteiros × (1+(zona−1)×0,25) × (1 − desconto))` → giros 1..5 custam **30 · 51 · 87 · 147 · 251** (sem desconto/inflação; giro 0 na zona 2 = **38** · zona 3 = **45**). Desconto: Dente de Ouro −8% + Carteira Gama-chan −6%, **teto −40%** (mantido). Pressão de casas ruins: `maldição×2,5 + (zona−1)×0,15 + missão (Genin 0 · Chunin 0,1 · Jonin 0,2 · Kage 0,35)`. Sorte: `1 + min(2, luck/100)` (premium ao quadrado). Com apenas as cinco casas de personagem (15/11), os pesos existentes são renormalizados. Sem Sorte ou pressão extra, Hidan chega ao teto de 60% e as quatro casas boas somam 40%. **3 Kakuzus** = `round(120 × luckFactor × (1+pressão))` Ryu (`slotKakuzuRyu`: 120/240/480).
- **Spend** (`SPEND_RULES`): +dano a cada **250 Ryu** gastos (o % vem do item), **teto +30%**.
- **Drops base** (`tuning.ts`, IMPLEMENTADO): Ryu **72%** · Chakra **28%** · Pílula **1,5%** · Lamen ≤**5%** (cura 35% do HP) · item por abate **desativado** (só por kunai/shuriken/evento) · orbe de chakra **9%**.
- **Chão da run** (`GameCanvas.scatterPickups`, IMPLEMENTADO): 60% Ryu / 20% kunai / 20% shuriken (+1 shuriken amaldiçoada +1 emboscada de corpo fora de `testRun`). **IMPLEMENTADO (rodada 49):** kunai/shuriken no chão viram **PERGAMINHOS** — coletados com **E** (sem auto-coleta; custo em Ryu + mega-loot), visual `drawScrollShape` + ícone `public/assets/icons/scroll.svg` + labels; **Ryu no chão = MORRO DE BOLINHOS DE ARROZ** (onigiri) — ao coletar: **ímã global 10 s** (xp/lamen/chakra de todo o mapa — `globalMagnetUntil`) + **lamen de cura** (`RAMEN_DROP.heal`) + Ryu `(14+zona×6)×MISSION_TIER[missão]×(1+min(1,sorte×0,01))` (fórmula do agente — **PROPOSTO, aguardando teste do usuário**); ryu/sealDrop seguem com **auto-coleta ao pisar** (rodada 47). **Aviso do portal:** só com pergaminho a **≤6 m** (rodada 49 — a contagem global quebrava a suíte runtime).
- **Caça-Níquel da Tsunade** (APROVADO rodada 37 — **IMPLEMENTADO na fase 3**, commit `ec7c42a`): renomeado de "Roleta da Tsunade"; **combos de 3 iguais** entregues ao sair — 3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros até o fim da run (`runBuffs`) · 3 Jirayas = 1 item Raro/Épico/Lendário (respeita limite do item) · 3 Hiruzens = 4 escolhas de item (E pega · V vende) · 3 Hidan = −5% HP total (**piso 1 HP — não mata**) +5% dificuldade/+5% monstros · 3 Kakuzus = Ryu por sorte/dificuldade (`slotKakuzuRyu`); **emboscada invertida**: durante a interação a run pausa (jogador seguro); ao sair, **armadilhas shinobi explodem em 8 m** matando os monstros próximos (abate/saque contam; totem/bijuu/guardião **excluídos**; som `explosion`) — Credores e demais casas avulsas saíram do sorteio em 15/11; **custo ×1,70/giro + +25%/zona** (acima); **face da Tsunade** feliz/triste/nervosa por recompensa (retrato do roster + badge/glow — **arte das 3 expressões = PENDENTE**); UI = **3 rolos verticais** que param no mesmo símbolo (motor: 1 casa por giro). **Calibração em iteração com o teste do usuário.**

## 10. Pílulas — `pills.ts`

`PILL_MAX = 10` (IMPLEMENTADO) + Cabaça de Pílulas +2 = **12** hoje. **APROVADO (rodada 37, 12/11 — a implementar):** teto **padrão 9 · buff de conta 13 · buff de item 15** — "buff de conta" = **Passivas Shinobi** (desbloqueadas por Lamens; **aplicam no início da run**) · "buff de item" = Cabaça +2 por cima. 20 pílulas (bônus por nível): Soldado +10% taijutsu · Elemental +10% ninjutsu · Ferro +4 armadura · Vento +6% movimento · Akimichi +18 HP · Clone +0,5 projétil (2 nív = +1) · Relâmpago +8% vel. ataque · Arremesso +10% vel. projétil · Falcão +4% crítico · Névoa +3% evasão (teto 60%) · Genjutsu +12% status (teto 90%) · Expansão +10% área · Persistência +10% duração · Cura +0,6 HP/s · Mercador +12% Ryu · Pergaminho +10% EXP · Fortuna +5 sorte · Magnética +1 ímã · Hiden +8% recarga Ultimate (sem chakra) · **Incenso** +10% horda +5% ameaça +12% Ryu (**SE MANTÉM** — rodada 37). **White Flute = ITEM novo** (APROVADO rodada 37: horda maior + mais Ryu/leveling — a implementar).

## 11. Mundo e mapa — `worldScale.ts`

`MAP_SIZE = 160` · raio jogável `WORLD_LIMIT = 76` · `ZONE_SECONDS = 600` · `ACTOR_SCALE 0,68` · `ATTACK_SCALE 0,7` (IMPLEMENTADO). **APROVADO (rodada 37):** mapa **abrir mais** (referência de proposta: +30% do raio) + todos os spawns dentro da área alcançável (a implementar).

## 12. Debug de balanceamento (F9) — `tuning.ts`

Painel com **41 multiplicadores** (Inimigos · Elites/Mega · Personagem · Ganhos · Drops) salvos em `localStorage` (`sb_debug_tuning_v1`), padrão = todos 1, **valem como base Genin** e são multiplicados por `MISSION_TIER` nas outras dificuldades; alterações valem na hora, no meio da run. É a ferramenta de iteração do balanceamento com o usuário.

## Abertura e XP por zona · 14/11/2026

A abertura interpola de 0,34 a 1 no primeiro minuto. Em Genin, o primeiro quadro calcula teto 12 e 0,68 inimigos por segundo antes da reposição. O [diagnóstico de XP](development/DIAGNOSTICO-XP-ZONA.md) detalha a curva em níveis 100, 300 e 582 e a distinção entre relógio da zona e da missão.

## Sobrevivência na Zona 1 · 24/11/2026

Foram simuladas 2.070 partidas de até 13 minutos, sem invocar o Guardião. Cada grupo usa as 115 versões jogáveis e três sementes (17, 101 e 252). A conta simulada começa sem passivas permanentes. O catálogo fica aberto nos cinco primeiros grupos e o último restringe o sorteio a itens comuns. O bot escolhe técnicas, afixos de melhoria e pílulas nos níveis, treina quando o pool acaba, gasta Ryu nas kunais e recebe loot dos Mega Elites que consegue derrotar no tempo estimado. A coluna mostra quem estava vivo em cada minuto.

| Dificuldade e cenário | 8 min | 10 min | 11 min | 12 min | 13 min |
|---|---:|---:|---:|---:|---:|
| Genin, desvio médio | 333 | 331 | 188 | 188 | 180 |
| Chunin, desvio médio | 331 | 328 | 258 | 258 | 236 |
| Jonin, desvio médio | 322 | 318 | 104 | 103 | 33 |
| Kage, desvio médio | 301 | 292 | 159 | 134 | 45 |
| Kage, desvio bom | 315 | 302 | 168 | 149 | 55 |
| Kage, desvio médio e itens comuns | 295 | 285 | 146 | 124 | 35 |

### Evolução do Kage com catálogo completo e desvio médio

Medianas entre os sobreviventes de cada instante. O golpe inclui a expectativa do crítico e vem antes da defesa do alvo.

| Minuto da zona | Nível | HP de um comum | Golpe da primeira técnica | Itens |
|---|---:|---:|---:|---:|
| 8 | 77 | 1.052 | 21.172 | 17 |
| 10 | 96 | 1.594 | 39.783 | 18 |
| 11 | 114 | 8.742 | 65.956 | 18 |
| 12 | 131 | 15.417 | 106.253 | 18 |
| 13 | 151 | 26.379 | 198.108 | 18 |

O Final Swarm inicia após 10:00 na mesma zona. No Kage, sem bônus de densidade, o teto normal chega a 1.160 em 10:00. Durante os quatro primeiros minutos do Final Swarm, o teto base é 800. A subida para 1.600 termina aos 17:00 da zona (+7:00 de Final Swarm). O multiplicador base de HP e dano salta para aproximadamente 3,02 no primeiro segundo do Final Swarm e chega a 9,07 aos 13:00. A armadura base passa de 30% para o teto de 85% no primeiro segundo.

A curva concentra a pressão na virada dos 10 minutos. A sobrevivência de 13 minutos varia bastante com a build e o desvio simulado. O modelo agrega a horda em passos de um segundo e estima a esquiva e a cobertura dos golpes. Posicionamento, efeitos de clima, eventos, altares, mercador, fusões e coleta física ficam fora da simulação. A distribuição dos nascimentos por quadro segue o motor da partida e precisa de conferência em jogo. Os números de balanceamento ficaram como estavam.

## Pressão do Genin e armas comuns

A partir do minuto 1 de cada zona, o Genin sobe até **+7% de dano**, **+0,06 ao multiplicador base de frequência de ataque** e **até +9 pontos percentuais de armadura para a horda antes do Final Swarm**, atingindo esses bônus aos 5 minutos. Vale o teto de armadura correspondente à fase. A taxa de nascimento, o HP dos monstros e a progressão de XP ficam com os valores anteriores. Chunin, Jonin e Kage continuam com a curva anterior.

Numa comparação antes e depois com as mesmas regras de build, 115 versões e três sementes, os resultados de sobrevivência do Genin permaneceram em 333/345 aos 8 minutos e 180/345 aos 13 minutos, na Zona 1. O modelo agrega os inimigos e a esquiva em passos de um segundo. A diferença de pressão precisa ser conferida nos ataques e no deslocamento em partida.

As armas de inimigos comuns viajam mais devagar nos quatro ranks. Kunai e shuriken passam de 12 para 10,2 m/s, e Fūma de 8 para 6,8 m/s. A duração aumenta conforme a redução da velocidade para conservar 15 m e 10 m de alcance nominal, respectivamente. A velocidade das técnicas de chefes e Mega Elites segue a regra anterior.

## 13. Números de dano na tela — `GameCanvas.tsx`

Teto de números simultâneos **300** (era 60; revisão 11/11 — o usuário pode deixar spammando) com pool de sprites + cache LRU de textura.

## 14. APROVADO na rodada 37 (12/11) — fila de implementação (docs/13)

**Tudo abaixo foi AUTORIZADO pelo usuário na rodada 37** (12/11/2026) — implementar na ordem da fila docs/13:

Treinamento aleatório +0,6% · pílulas 9/13/15 (buff de conta = Passivas Shinobi) · Isca Shinobi → vitamina · **Caça-Níquel da Tsunade — CONCLUÍDA na fase 3** (combos 3-iguais + emboscada invertida + custo em escala por zona; **arte das 3 expressões = PENDENTE**) · renames **Células de Hashirama**/**Chakra de Hagoromo** (arte exclusiva) · **White Flute = ITEM** (Incenso mantido) · pergaminhos no chão · mapa maior + spawns alcançáveis · balanceamento de jogador inicial/monstros aos 6 min · HUD novo (tema Naruto · HP no pé do personagem · abates/streak · card de temporada · glossário · alfas com buffs) · **personagens novos: Kages + Hanzo + Mei Terumi + 17 Tier A + Tobi ×2 + Nagato + Yahiko=Pain** · folhas de caminhada frente/costas · arte dos menus · YOO MP3 no Jogar (corte 1 s) + sons de jutsu (anti-spam "terminou antes do próximo") · pool informativo (upgrades de itens/pílulas visíveis).

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

Bênção do altar: valores base da Rodada 51 de 5/8/12/18/25% por raridade e multiplicador de Sorte preservados. Cada altar escolhe um atributo de cada grupo. Raro, Épico e Lendário adicionam um terceiro distinto. A chance de projétil adicional usa escala 2 sobre a magnitude base e o status usa escala 1. Cura do bolinho é 35% do HP máximo antes de modificadores de debug.

## Teto de pílulas (rodada 53)

`PILL_MAX=9`, `PHARMACOLOGY_MAX=4`, Cabaça +2 e `PILL_SLOTS=6`. O máximo simultâneo é 15 níveis por pílula. A qualidade altera o bônus de nível, enquanto cada escolha sobe exatamente um nível.

## Rodada 55 (13/11/2026) — HP, projéteis de bênção, zona e ímã (PROPOSTO, o usuário testa)

- **HP por nível:** ver §6 (`heroHpScale`, `progression.ts`).
- **Projétil/golpe da bênção** (`src/game/altarRewards.ts`): sai `projectileChance` do altar. `projectiles` inteiro por raridade: Comum 0 · Incomum 0 · **Raro +1 · Épico +2 · Lendário +3** (sem escala de Sorte). Nas técnicas sem projétil (corpo a corpo, cone, linha, área), cada projétil além do 1º repete o acerto 0,14 s depois (Ultimate fora; teto 11 extras). Konan/Tenten (afinidade) e a sinergia da Folha continuam com chance fracionária.
- **Escala por zona:** `difficultyAt(missão, zoneElapsed, ZONE_DIFFICULTY[zona] × planos × (1+threat), overtime)` — HP/dano/vivos/spawn/armadura/Final Swarm recomeçam do minuto 0 em cada zona; densidade `×(1+enemyCount)` por cima. HP do Mega Elite (`megaEliteHp`), defesa do Mega Elite e fração de inimigos à distância também usam o tempo da zona. Guardião (resistência por tempo total) e bijū (HP pela run inteira) mantidos.
- **Ímã do morro:** todo drop no chão (XP, Ryu, chakra, cura, pílula) entra no ímã global de 10 s e voa com velocidade ≥ distância/1,2 s — chega em ~1,2 s de qualquer ponto do mapa.

Exemplos para o jogador ficam no Guia do jogo, em src/game/glossary.ts. Sincronize-os com as mudanças das regras nesta seção.
