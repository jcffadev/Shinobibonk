# 20 · Scaling e regras — fórmulas e números do jogo

> Criado em **12/11/2026** (rodada 36 — consolidação de contexto). **Fonte da verdade: o código** (`src/game/`); este documento consolida os valores **lidos do código nesta data**. Ao alterar balance, atualize aqui o mesmo bloco. Estados: `IMPLEMENTADO` (no código) · `PROPOSTO` (aprovado no plano, ainda não codificado).

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
- Mega Elite: defesa base **55%** (IMPLEMENTADO) · **HP base 9.500** (Rodada 50; era 20.000) com **variação aleatória ±5% por nascimento** (9.025–9.975) + rampa `2^((seconds−55)/80)` × ameaça da missão — `megaEliteHp` em `enemyTiers.ts` (**PROPOSTO — o usuário testa e ajusta**).
- Shinobi para selar: HP próprio (campo `accountHp` do F9).
- Versão da família que vira Mega Elite/ajudante por dificuldade: Genin → inicial, Chunin → v.1, Jonin → v.2, Kage → última (`heroes.ts`).

## 6. Atributos do jogador — `progression.ts` (`calculateStats`)

- **Dano do herói**: `base × heroDamageScale(level) × (1 + %dano + Treinamento×4%)` (Gaara: bônus extra por armadura). `heroDamageScale(nível)` = `(1 + 0,03×n) × (1 + n/75)³` (n = nível−1):

  | Nível | 1 | 10 | 25 | 50 | 100 | 150 |
  |---|---|---|---|---|---|---|
  | Escala de dano | 1,0 | 1,8 | 4,0 | 11,2 | 49,6 | 146 |

- **HP**: base × (família multi-forma ×0,65 / single ×1,1) × `(1 + 3%/nível + 25%/evolução)` + bônus.
- **Velocidade de ataque**: `1 + 0,008×n + % + Agilidade×2%` (mín. 0,2).
- **Crítico**: base + `0,0015×n` + bônus; **dano crítico 2,5×** (com sorte alta, tier 2 = 3,0×).
- **Sorte**: `floor(n/3)` + bônus; sorte efetiva em loot: `luck × (0,2 + 0,8 × min(1, tempo/150s))` (pleno aos 2,5 min).
- **Coleta (ímã)**: raio `2,5 × (1 + pickup) + flat + Magnetismo×0,6`.
- **Vagas de suporte**: `3 + (até 1 de item) + (1 permanente)`.
- **Armadura**: `base × (1+1%/nível) + 0,25×n` + bônus; dano recebido = `bruto × 100/(100 + armadura)`.
- **EXP por nível** (`xpToLevelUp`): nível 1 = 30; depois `18 + 6n + 0,08n²/(1+n/250)`:

  | Nível | 10 | 25 | 50 | 100 | 150 |
  |---|---|---|---|---|---|
  | EXP | 78 | 204 | 473 | 1.173 | 2.024 |

- **Dano salvo do herói**: base real = valor exibido ÷ `HERO_DAMAGE_FACTOR` (**0,41** — rodada 47 removeu o `.55` hardcoded da `version()`; única fonte em `heroes.ts`).
- **Versões da família** (passo): HP/dano ×1,12, +1 armadura, +0,08 movimento por passo (`heroes.version`).

## 7. Crescimento das técnicas (level-up) — `combat.ts`

`GROWTH_ROLLS` (IMPLEMENTADO, revisão 11/11 — base ×1,5 + spread maior, pedido do usuário): **dano por nível** (%), por raridade [Comum · Incomum · Raro · Épico · Lendário]: base **[45 · 80 · 135 · 225 · 375]** + aleatório **[22 · 30 · 45 · 70 · 110]** → faixas **45–67 · 80–110 · 135–180 · 225–295 · 375–485%**. Afixos "outros" (área/recarga/duração): base **[15 · 27 · 38 · 45 · 60]** + **[11 · 14 · 14 · 21 · 21]**. Técnica de ataque: dano garantido + 1–2 afixos (setup: 2 afixos de buff).

`TECHNIQUE_SCALE = 1,2` (IMPLEMENTADO, 11/11): escala global de dano das técnicas do jogador e ajudantes (kits de chefe já escalam por fase em `bossCombat.ts`).

## 8. Treinamento / nível esgotado — `GameCanvas.tsx`

- **IMPLEMENTADO (11/11):** pool de técnicas/pílulas esgotado → level-up dá **+0,8% de Sorte**.
- **CONFIRMADO (rodada 37, 12/11 — APROVADO) e IMPLEMENTADO (rodada 48):** substituir por **atributo ALEATÓRIO +0,6%/nível** — `grantTraining()` usa `rollPowerlevel` + HUD flutuante acima da cabeça (“Treinamento - <atributo> +0,6%”); a cláusula “somente na utilidade que ele treina apenas sorte” segue **EM ABERTO** (docs/23 §4.2).

## 9. Economia — roleta e Ryu

- **Caça-Níquel da Tsunade** (ex-"Roleta da Tsunade"; `roulette.ts`, **IMPLEMENTADO — rodada 37 fase 3**, commit `ec7c42a`): custo = `round(30 × 1,70^giros × 1,15^minutos inteiros × (1+(zona−1)×0,25) × (1 − desconto))` → giros 1..5 custam **30 · 51 · 87 · 147 · 251** (sem desconto/inflação; giro 0 na zona 2 = **38** · zona 3 = **45**). Desconto: Dente de Ouro −8% + Carteira Gama-chan −6%, **teto −40%** (mantido). Pressão de casas ruins: `maldição×2,5 + (zona−1)×0,15 + missão (Genin 0 · Chunin 0,1 · Jonin 0,2 · Kage 0,35)`. Sorte: `1 + min(2, luck/100)` (premium ao quadrado). Com as 5 casas de combo, **boa chance sorte 0 = 30,88%** (asserção no verify-rules). **3 Kakuzus** = `round(120 × luckFactor × (1+pressão))` Ryu (`slotKakuzuRyu`: 120/240/480).
- **Spend** (`SPEND_RULES`): +dano a cada **250 Ryu** gastos (o % vem do item), **teto +30%**.
- **Drops base** (`tuning.ts`, IMPLEMENTADO): Ryu **72%** · Chakra **28%** · Pílula **1,5%** · Lamen ≤**5%** (cura 35% do HP) · item por abate **desativado** (só por kunai/shuriken/evento) · orbe de chakra **9%**.
- **Chão da run** (`GameCanvas.scatterPickups`, IMPLEMENTADO): 60% Ryu / 20% kunai / 20% shuriken (+1 shuriken amaldiçoada +1 emboscada de corpo fora de `testRun`). **IMPLEMENTADO (rodada 49):** kunai/shuriken no chão viram **PERGAMINHOS** — coletados com **E** (sem auto-coleta; custo em Ryu + mega-loot), visual `drawScrollShape` + ícone `public/assets/icons/scroll.svg` + labels; **Ryu no chão = MORRO DE BOLINHOS DE ARROZ** (onigiri) — ao coletar: **ímã global 10 s** (xp/lamen/chakra de todo o mapa — `globalMagnetUntil`) + **lamen de cura** (`RAMEN_DROP.heal`) + Ryu `(14+zona×6)×MISSION_TIER[missão]×(1+min(1,sorte×0,01))` (fórmula do agente — **PROPOSTO, aguardando teste do usuário**); ryu/sealDrop seguem com **auto-coleta ao pisar** (rodada 47). **Aviso do portal:** só com pergaminho a **≤6 m** (rodada 49 — a contagem global quebrava a suíte runtime).
- **Caça-Níquel da Tsunade** (APROVADO rodada 37 — **IMPLEMENTADO na fase 3**, commit `ec7c42a`): renomeado de "Roleta da Tsunade"; **combos de 3 iguais** entregues ao sair — 3 Tsunades = "Sorte da Tsunade" +10% dificuldade/+10% monstros até o fim da run (`runBuffs`) · 3 Jirayas = 1 item Raro/Épico/Lendário (respeita limite do item) · 3 Hiruzens = 4 escolhas de item (E pega · V vende) · 3 Hidan = −5% HP total (**piso 1 HP — não mata**) +5% dificuldade/+5% monstros · 3 Kakuzus = Ryu por sorte/dificuldade (`slotKakuzuRyu`); **emboscada invertida**: durante a interação a run pausa (jogador seguro); ao sair, **armadilhas shinobi explodem em 8 m** matando os monstros próximos (abate/saque contam; totem/bijuu/guardião **excluídos**; som `explosion`) — a casa "Credores" (spawna inimigos) **se mantém**, coexistem os dois sabores; **custo ×1,70/giro + +25%/zona** (acima); **face da Tsunade** feliz/triste/nervosa por recompensa (retrato do roster + badge/glow — **arte das 3 expressões = PENDENTE**); UI = **3 rolos verticais** que param no mesmo símbolo (motor: 1 casa por giro). **Calibração em iteração com o teste do usuário.**

## 10. Pílulas — `pills.ts`

`PILL_MAX = 10` (IMPLEMENTADO) + Cabaça de Pílulas +2 = **12** hoje. **APROVADO (rodada 37, 12/11 — a implementar):** teto **padrão 9 · buff de conta 13 · buff de item 15** — "buff de conta" = **Passivas Shinobi** (desbloqueadas por Lamens; **aplicam no início da run**) · "buff de item" = Cabaça +2 por cima. 20 pílulas (bônus por nível): Soldado +10% taijutsu · Elemental +10% ninjutsu · Ferro +4 armadura · Vento +6% movimento · Akimichi +18 HP · Clone +0,5 projétil (2 nív = +1) · Relâmpago +8% vel. ataque · Arremesso +10% vel. projétil · Falcão +4% crítico · Névoa +3% evasão (teto 60%) · Genjutsu +12% status (teto 90%) · Expansão +10% área · Persistência +10% duração · Cura +0,6 HP/s · Mercador +12% Ryu · Pergaminho +10% EXP · Fortuna +5 sorte · Magnética +1 ímã · Hiden +8% recarga Ultimate (sem chakra) · **Incenso** +10% horda +5% ameaça +12% Ryu (**SE MANTÉM** — rodada 37). **White Flute = ITEM novo** (APROVADO rodada 37: horda maior + mais Ryu/leveling — a implementar).

## 11. Mundo e mapa — `worldScale.ts`

`MAP_SIZE = 160` · raio jogável `WORLD_LIMIT = 76` · `ZONE_SECONDS = 600` · `ACTOR_SCALE 0,68` · `ATTACK_SCALE 0,7` (IMPLEMENTADO). **APROVADO (rodada 37):** mapa **abrir mais** (referência de proposta: +30% do raio) + todos os spawns dentro da área alcançável (a implementar).

## 12. Debug de balanceamento (F9) — `tuning.ts`

Painel com **41 multiplicadores** (Inimigos · Elites/Mega · Personagem · Ganhos · Drops) salvos em `localStorage` (`sb_debug_tuning_v1`), padrão = todos 1, **valem como base Genin** e são multiplicados por `MISSION_TIER` nas outras dificuldades; alterações valem na hora, no meio da run. É a ferramenta de iteração do balanceamento com o usuário.

## 13. Números de dano na tela — `GameCanvas.tsx`

Teto de números simultâneos **300** (era 60; revisão 11/11 — o usuário pode deixar spammando) com pool de sprites + cache LRU de textura.

## 14. APROVADO na rodada 37 (12/11) — fila de implementação (docs/13)

**Tudo abaixo foi AUTORIZADO pelo usuário na rodada 37** (12/11/2026) — implementar na ordem da fila docs/13:

Treinamento aleatório +0,6% · pílulas 9/13/15 (buff de conta = Passivas Shinobi) · Isca Shinobi → vitamina · **Caça-Níquel da Tsunade — CONCLUÍDA na fase 3** (combos 3-iguais + emboscada invertida + custo em escala por zona; **arte das 3 expressões = PENDENTE**) · renames **Células de Hashirama**/**Chakra de Hagoromo** (arte exclusiva) · **White Flute = ITEM** (Incenso mantido) · pergaminhos no chão · mapa maior + spawns alcançáveis · balanceamento de jogador inicial/monstros aos 6 min · HUD novo (tema Naruto · HP no pé do personagem · abates/streak · card de temporada · glossário · alfas com buffs) · **personagens novos: Kages + Hanzo + Mei Terumi + 17 Tier A + Tobi ×2 + Nagato + Yahiko=Pain** · folhas de caminhada frente/costas · arte dos menus · YOO MP3 no Jogar (corte 1 s) + sons de jutsu (anti-spam "terminou antes do próximo") · pool informativo (upgrades de itens/pílulas visíveis).
