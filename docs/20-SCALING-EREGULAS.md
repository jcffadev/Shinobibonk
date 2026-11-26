# 20 · Scaling e regras — fórmulas e números do jogo

> Criado em **12/11/2026** (rodada 36 — consolidação de contexto). **Fonte da verdade: o código** (`src/game/`); este documento consolida os valores **lidos do código nesta data**. Ao alterar balance, atualize aqui o mesmo bloco. Estados: `IMPLEMENTADO` (no código) · `PROPOSTO` (aprovado no plano, ainda não codificado).

## Degraus do Final Swarm · 25/11/2026 (Claude Code)

- "A cada 5min no final swarm ter um buff consideravel nos inimigos dano/armadura/vida" → `SWARM_STEP = { seconds: 300, hp: .5, damage: .3, armor: .02, armorCap: .95 }`. Cada degrau multiplica vida ×1,5 e dano ×1,3 e soma 2 pontos de defesa (até 95%).

## Elites no começo e regeneração base · 25/11/2026 (Claude Code)

- "Diminuir um pouco a quantidade de elites que spawnam no começo do jogo, pelo menos 1m30 mais suavizado o spawn deles." → `ELITE_OPENING = { start: .25, seconds: 90 }`: chance de elite de 2% no início, cheia (8%) aos 1m30.
- "Ajustar regeneração por segundo para todos os personagens, iniciar com 1,0 Alguns estão começando com menos de 1.0" → `BASE_REGEN = 1`: 1,0 HP/s para todos; passivas de cura somam (Hashirama 1,8; Tsunade Byakugou 3,0).

## Dano no jogador: nerf da horda e teto por golpe · 25/11/2026 (Claude Code)

**Pedidos do usuário:** "Me mostre os números de dano do ataque básico dos monstros normais, acho que os danos estão muito fortes no início do jogo, as vezes tomamos hitkill aos 5minutos de jogo sem saber ao certo o que houve." e "Seria o teto por golpe, como nosso jogo tem muito mais monstros do que nosso jogo referência, temos que nerfar o dano dos monstros, menos dos megas/bosses/bijuus... Nerf 30% do dano de todos"

- `PLAYER_HIT_RULES` (`src/game/enemyTiers.ts`): horda (comuns e elites, kunai e fūma) −30% depois da armadura; horda e Mega Elites (golpe, técnicas e Ultimate) no máximo 40% da vida máxima por golpe; Guardião e Bijū sem nerf e sem teto (como pedido).
- O hitkill dos 5 min vinha da Ultimate do Mega Elite (110–230% da vida).

| Golpe aos 5 min | Genin antes → agora | Kage antes → agora |
|---|---|---|
| Comum | 29 (24%) → 20 (17%) | 70 (50%) → 49 (35%) |
| Kunai | 20 (17%) → 14 (12%) | 49 (35%) → 35 (24%) |
| Fūma | 32 (27%) → 22 (19%) | 77 (55%) → 54 (38%) |
| Elite | 46 (39%) → 32 (27%) | 113 (80%) → 56 (40%) |
| Mega Elite (golpe) | 75 (63%) → 48 (40%) | 183 (130%) → 56 (40%) |
| Mega Elite (Ultimate) | 135 (113%) → 48 (40%) | 330 (234%) → 56 (40%) |
| Guardião (Ultimate) | 135 (113%), sem mudança | 330 (234%), sem mudança |

Porcentagem da vida típica de conta nova aos 5 min (Genin ~119, Kage ~141).

## Bijū incontrolável, fases e fúria · 25/11/2026 (Claude Code)

**Pedido do usuário:** "as habilidades que empurram, não pode empurrar a bijuu pra área morta, na realidade, as bijuus tem resistência aos status/atordoamentos/congelamentos, elas tomam o dano, tomam o status, mas tem status incontrolável, faça elas terem fases e ao você atingir a fase, ela toma um stunzinho que você pode bater nela sem ela devolver dano, mas ela entra em furia e recebe mais dano e mais armadura"

- **Incontrolável:** a Bijū toma dano e status (veneno, queimadura, Resfriado, bônus de congelado), mas não é empurrada nem puxada e não fica lenta; atordoar, prender, dormir e congelar não a param.
- **Fases** (já existiam, `beastPhase`): 1ª acima de 2/3 da vida, 2ª até 1/3, 3ª abaixo. Ao entrar na 2ª e na 3ª, fica **3 s atordoada** (`BIJUU_FURY.stunSeconds`): não anda, não ataca e a técnica em preparação é cancelada.
- **Fúria:** a partir da 2ª fase, +25% de dano por fase (`damagePerPhase`) e a defesa fecha 30% do dano que ainda passava (`armorPerPhase`). Isso soma ao ritmo e à força de ataque que as fases já davam.
- Interpretação: "recebe mais dano e mais armadura" lido como a Bijū ganhando mais dano de ataque e mais armadura.

## Planos do Shikamaru só no chefe da zona · 25/11/2026 (Claude Code)

**Pedido do usuário:** "O Shikamaru ta aumentando a dificuldade do jogo todo? Ele deveria aumentar a dificuldade apenas do boss final da zona"

- Os planos (+33% cada, até 3 por zona) agora entram só na ameaça do chefe: Guardião (vida, dano e defesa) e Bijū. Monstros comuns, elites e Mega Elites ficam como sem planos. As kunais extras do Guardião e os Lamens da Bijū por plano continuam.

## Os 6 abaixo da média e o pool real da partida · 25/11/2026 (Claude Code)

**Pedido do usuário:** "Sim, os 6" (Hashirama Sábio, Lee Shippuden, Terceiro Raikage, Naruto Shippuden, Sasuke Shippuden e Haku).

- **Causa no simulador, não no jogo:** o simulador só deixava aprender as 4 técnicas do kit. No jogo, o pool da partida inclui as básicas da Academia, do elemento e da vila (Substituição em Órbita, Chute Giratório, Rajada…). Agora o simulador usa `skillPool(heroId)`, como o jogo (`SIM_KIT_ONLY=1` volta ao modo antigo, só para comparar).
- **Com o pool real, os 6 ficam perto da mediana** (morte relativa: Hashirama Sábio 0,81 · Terceiro Raikage 0,81 · Naruto Shippuden 0,88 · Haku 0,89 · Lee Shippuden 1,00 · Sasuke Shippuden 1,02). **Nenhum ajuste de personagem foi feito.**
- **Raio da Área 1,8 conferido com o pool real** (6 sementes, 5.520 partidas): faixa p10–p90 0,83–1,90 → 0,89–1,72; nenhum personagem abaixo de 0,5 nos dois casos; medianas sobem pouco (conta nova Jonin 36 → 40 min, Kage 27 → 30,5 min). Fica.
- **O que sobra:** no Kage com conta nova, Naruto Academia e Itachi ainda caem no começo (a 1ª técnica não mata o comum de um golpe). No topo, Quarto Raikage (2,1×), Kushina (1,9×), Chōji e Sai (1,8×) vivem bem mais que a mediana. A medição do topo é ruidosa: a partida inteira é bimodal (cai perto da zona 3 ou passa de 75 min), então precisa de mais sementes antes de mexer.

## Revisão do scale e do começo de partida de todos os personagens · 25/11/2026 (Claude Code)

**Pedidos do usuário:** "Reveja o scale de todos os personagens e veja o early game de todos os persoagens"; "Morrer se o player jogar mal, deve morrer, mesmo na dificuldade mais fácil..."; "Não é pros personagens ficarem brokens, é para ficar balanceados."

**Correções no simulador** (não mudam o jogo):
- **Geometria dos golpes igual à do `castTechnique`:** antes o alcance entrava sem `ATTACK_SCALE` e o corpo a corpo usava o alcance inteiro como raio. Isso inflava corpo a corpo, cone, linha, onda e Em V contra Área e Órbita. Alvos por uso numa horda densa, agora: Projétil 1 · Corpo a corpo ~1,6 · Área ~2,4 · Linha ~3,2 · Cone ~3,6 · Onda ~6,9 · Em V ~9,4.
- **Técnicas de preparo** (Modo Sábio, Portões, Byakugou…): o bônus entra pela fração do tempo em que fica ativo (`setupNumbers().uptime`). Antes o simulador ignorava o preparo.
- `CONE_COS` passou para `src/game/combat.ts` (`techniqueAreas.ts` reexporta), para o simulador ler sem a cena.
- **Novo `scripts/simulate-early.mjs`:** primeiros 5 min de todas as versões, com a **capacidade** (abates por segundo com a horda no teto ÷ nascimentos por segundo; abaixo de 1, a horda cresce).

**Medição** (régua: jogador que desvia bem, `desvio bom`; morrer jogando mal continua valendo até no Genin):
- **Dano:** sem problema de escala. A 1ª técnica mata o comum de um golpe no 1º minuto em quase todo o elenco (golpe ÷ vida: mediana 3,8× no Genin e 2,7× no Kage), e a sobra cresce com o tempo. No Kage, 9 versões precisam de 2 golpes no 1º minuto: Kankurō Aliança, Itachi, Orochimaru, Naruto Academia, Zetsu, Naruto Genin, Shino, Kin e Iruka.
- **O que separa os personagens é o formato dos ataques.** Por segundo, um ataque de Área limpa ~1,2 inimigo e um Em V ~6,3. Kits com Área e preparo ocupando um dos 3 espaços ficam para trás no pico dos 3–5 min:
  - capacidade aos 3 min (mediana 2,2 no Jonin): Naruto Shippuden 0,49 · Hashirama Sábio 0,78 · Sakura Byakugou 0,94 · Lee Shippuden e Lee Portões 1,05 · Tsunade Byakugou 1,07 · Kabuto Sábio 1,08;
  - partida inteira (2.760 partidas, morte relativa à mediana): Naruto Shippuden 0,17× · Hashirama Sábio 0,28× · Lee Shippuden 0,31× · Sasuke Shippuden 0,34×. Faixa p10–p90: 0,52× a 1,22×. 11 versões abaixo de 0,5×.
- **Testes de solução:**
  - preparo sem ocupar espaço de técnica: quase não muda (Naruto Shippuden continua morrendo aos 3–5 min);
  - trocar a ordem (4º ataque no Nv 12, Modo Sábio no Nv 20): quase não muda;
  - **raio da Área 1,2 → 1,8 — APLICADO em 25/11/2026 (decisão do usuário: "Sim, aplicar"; `SHAPE_RADIUS` em `combat.ts`, usado no GameCanvas, no Kuroari e no simulador). O círculo das 56 técnicas de Área passa de 0,84 m para 1,26 m de raio (×2,25 de chão); o dano por acerto não muda. Medição:** capacidade aos 3 min sem ninguém abaixo de 1,09 no Jonin; mediana e p90 iguais (2,2 e 3,0). Na partida inteira, abaixo de 0,5× cai de 11 para 6, o pior sobe de 0,17× para 0,39×, a faixa p10–p90 fica 0,58×–1,16× e a mediana quase não muda (Genin conta nova 43,8 → 44,2 min).

## Elemento Gelo e bônus de elemento em todos os danos · 25/11/2026 (Claude Code)

**Pedidos do usuário:** "todas as linhas de dano na realidade"; "sim, é legal os efeitos dos elementos que temos também fazer parte do calculo"; "o elemento gelo, você colocou como resfriar, pesquise, deveria ser gelo".

- **Regra:** todo dano parte do dano do personagem (nível e dano%) e soma o bônus da própria linha.
  - Queimadura e explosão da Esfera Katon: +% de Fogo.
  - Estilhaços do Espelho de Haku: +% de Gelo.
  - Ajudantes: +% de escola (já tinham) e +% do elemento da técnica deles.
- **Gelo (Hyōton)** virou elemento próprio (`elGelo`), como Madeira. No anime é a natureza de linhagem do clã Yuki, que junta Água e Vento.
  - Técnicas do Haku (Senbon de Gelo, Espelhos Demoníacos de Gelo): Gelo, com Congelar (acúmulos de Resfriado). A afinidade do Haku passa a Gelo (×1,5).
  - Fusão Água + Vento (Hyōton: Domo de Gelo): elemento Gelo.
  - Pergaminho Hyoton: +28% de dano de técnicas de Gelo, além do Resfriado e da armadura.
  - O visual de Gelo usa o de Água por enquanto (arte própria com o Codex). Ícone 氷 e cor #90eafb.
- Medição da proposta de status refeita com as regras novas (36 builds dos 8:00, 3 golpes): Esfera Katon +18% · −32% (proposta +6% · −8%); Espelho de Haku +16% · −47% (proposta +18% · −54%); o resto igual à tabela abaixo.

## Espinhos e medição do pacote de status · 25/11/2026 (Claude Code)

**Espinhos** (decisão do usuário: "Armadura × dano do personagem"; antes: dano fixo de 25 e 40):
- Contragolpe = `thorns` × armadura × dano do personagem (`thornsDamage`). O dano do personagem já inclui nível e dano%, então o dano% aumenta os Espinhos, como os outros danos.
- Armadura de Espinhos 100% por cópia; Armadura Samurai 150%, somando os +20 de armadura dela.
- Naruto sem itens de dano: ~22 no nível 1, ~550 no 30 e ~25 mil no 114.

**Pacote de status (Rodada 103): ferramenta nova `scripts/simulate-status.mjs`.** A build do bot enfrenta por 30 s uma horda de inimigos individuais (comuns e elites) com as regras de `statusRules.ts` e a ordem do `hit` do GameCanvas. Compara cada item de status (1 cópia) com +10% e +30% de dano. Medição preliminar no Chunin, 115 versões, semente 17:
- Na partida normal (3:00 e 8:00) o golpe vale 8× a 18× a vida do comum: tudo morre num golpe, então nem status nem +30% de dano mudam os abates.
- Horda cheia aos 8:00 com 3 golpes por inimigo: Esfera Katon +18% de abates e −27% de golpes recebidos (explosão em cadeia: a explosão queima, o vizinho morre queimando e explode); Espelho de Haku +14% e −41%; Hyoton ×5 + Quebra-Gelo +19% e −49%; Anel do Veneno ×5 + Erva ×2 +9%. Fio de Aço, Incenso, Correntes, Erva, Cinco Elementos e 1 Hyoton ficam perto de zero.
- Correção: as técnicas de gelo do Haku já congelavam (perfil de status de `statusProfiles.ts`); desde 25/11 elas são do elemento Gelo.
- Variantes medidas (`node scripts/simulate-status.mjs proposta Chunin 3 17`, 36 builds dos 8:00, horda cheia com 3 golpes por inimigo; abates · golpes recebidos, 1 cópia somada à build):
  - Katon sem cadeia (a queimadura que vem da explosão não explode de novo): Esfera Katon cai de +17% · −31% para +7% · −8%.
  - Congelar com 2 acúmulos em vez de 3: Quebra-Gelo sobe de +4% · −12% para +13% · −37%; Espelho de Haku de +14% · −45% para +17% · −52%.
  - Resfriado durando 5 s em vez de 3: sem efeito (o inimigo morre antes). Descartada.
  - Chances dos itens ×2 (Fio 8%, Incenso 5%, Hyoton 12%, Anel 12%): ganhos pequenos; Anel ×5 + Erva ×2 sobe de +9% para +13%.
- **APLICADO em 25/11/2026 (decisão do usuário: "Sim, aplicar"):** as três juntas.
  - `STATUS_RULES.chill.stacksToFreeze` = 2 (`src/game/statusRules.ts`). Como as técnicas de gelo dão 2 acúmulos, um acerto de Gelo que aplica o status já congela.
  - A queimadura criada pela explosão da Esfera Katon fica marcada (`burstBurn`) e não explode de novo. Queimadura de técnica, de item ou do Amaterasu tira a marca e volta a poder explodir.
  - Fio de Aço Ninja 8% de Paralisar, Incenso do Sono 5% de Dormir, Pergaminho Hyoton 12% de Resfriar e Anel do Veneno 12% de envenenar.
  - O simulador passou a usar as regras do jogo direto; a variante "proposta" saiu de `STATUS_VARIANTS`.

| Item ou combinação | Atual | Proposta |
|---|---|---|
| Esfera Katon (Incomum) | +17% · −31% | +6% · −8% |
| Anel do Veneno (Incomum) | +3% · −3% | +4% · −4% |
| Incenso do Sono (Incomum) | +1% · −1% | +1% · −3% |
| Fio de Aço Ninja (Comum) | +0% · −2% | +0% · −3% |
| Pergaminho Hyoton (Incomum) | +0% · −0% | +0% · −2% |
| Quebra-Gelo (Raro) | +4% · −12% | +13% · −39% |
| Espelho de Gelo de Haku (Lendário) | +14% · −45% | +17% · −53% |
| Hyoton ×5 + Quebra-Gelo | +21% · −60% | +24% · −75% |
| Anel do Veneno ×5 + Erva ×2 | +9% · −13% | +13% · −19% |
| +10% / +30% de dano | +0% · −0% | +0% · −0% |

Limites: o simulador não tem posição real, desvio, chefes nem elites com resistência a controle, então os itens de controle (Fio, Incenso, Correntes) aparecem subavaliados. Um item de +10% ou +30% de dano também não muda abates nessas hordas, porque o número de golpes para matar não muda.

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

**DECIDIDO pelo usuário em 25/11/2026: "3× e planos só da zona".** Implementado em `BIJUU_RULES.armorMultiplier = 3` e `bijuuPlans` (só os planos da zona 3, até 3, pesam no HP e na defesa da Bijū). A recompensa em lámens continua contando os planos da missão inteira. Medição depois da mudança (mediana e p90 da luta na chegada):

| Dificuldade | 0 planos | 1 plano | 2 planos | 3 planos |
|---|---:|---:|---:|---:|
| Genin | 2 min (4,2) | 3,6 min (6,6) | 6,8 min (11) | 8 min (14) |
| Chunin | 3,5 min (5,9) | 6 min (9,1) | 8,2 min (13) | 11 min (20) |
| Jonin | 3,5 min (6,4) | 5,6 min (11) | 7,6 min (18) | 13 min (27) |
| Kage | 6 min (15) | 12 min (27) | 23 min (38) | 33 min (47) |

Pior caso do modelo, sem ultimate, aliados, procs nem fusões. O Kage com 3 planos ainda passa de meia hora: se ficar pesado em partida, o próximo ajuste é o peso de cada plano na Bijū.

## Missão até a arena por dificuldade e planos · 25/11/2026 (Claude Code)

**Ferramenta:** cenário C de `scripts/simulate-bosses.mjs` (`missionProbe`). O bot invoca o Guardião em cada zona cedo (2:40) ou às 9:00. Cada Guardião solta 1 + planos pergaminhos grátis (até 4), agora também no simulador (`simulate-run.mjs`, antes era 1 item). Vencendo a zona 3, a Bijū é medida na chegada com a build final. Amostra: 115 versões, semente 17, conta nova, desvio médio. Pior caso do modelo: sem ultimate, aliados, procs nem fusões.

| Dificuldade · planos | Invocação | Chegam à arena | Guardiões z1 · z2 · z3 (HP mediano, luta) | Arena aos | Bijū na chegada (HP · defesa · luta) | Pergaminhos |
|---|---|---:|---|---:|---|---:|
| Genin · 0 | cedo | 115/115 | 2,9 mil · 6,8 mil · 13 mil · 2 s cada | 8,1 min | 328 mil · 93,5% · 2 min | 3 |
| Genin · 0 | 9:00 | 110/115 | 48 mil · 132 mil · 278 mil · 1 s cada | 27 min | 884 mil · 96,9% · 1 s | 3 |
| Genin · 3 | cedo | 115/115 | 5,8 mil · 14 mil · 27 mil · 5 a 6 s | 8,2 min | 663 mil · 96,7% · 6 min | 12 |
| Chunin · 3 | cedo | 110/115 | 8,5 mil · 20 mil · 39 mil · 6 a 7 s | 8,3 min | 1,2 mi · 96,7% · 9,6 min | 12 |
| Jonin · 3 | cedo | 99/115 | 12 mil · 29 mil · 56 mil · 6 a 9 s | 8,3 min | 2,0 mi · 96,7% · 14 min | 12 |
| Kage · 0 | cedo | 109/115 | 9,0 mil · 21 mil · 41 mil · 3 a 4 s | 8,1 min | 1,8 mi · 93,6% · 6 min | 3 |
| Kage · 0 | 9:00 | 97/115 | 256 mil · 711 mil · 1,5 mi · 2 s | 27 min | 4,8 mi · 96,9% · 10 s | 3 |
| Kage · 3 | cedo | 67/115 | 18 mil · 42 mil · 82 mil · 8 a 13 s | 8,5 min | 3,6 mi · 96,7% · 25 min | 12 |
| Kage · 3 | 9:00 | 59/115 | 509 mil · 1,4 mi · 3,0 mi · 3 a 6 s | 27 min | 9,5 mi · 98,4% · 27 s | 12 |

Leituras:
- **Pergaminhos preservados:** 3 Guardiões × (1 + planos) dá 3, 6, 9 ou 12 na missão, ou seja, 4 por Guardião com 3 planos.
- **Os Guardiões caem em segundos** em todas as dificuldades, mesmo com 3 planos (no máximo cerca de 13 s no Kage). O dano do jogador cresce muito mais que a vida deles.
- **A Bijū depende do ritmo:** quem invoca cedo chega à arena aos 8 min, com a build ainda fraca, e luta de 2 a 25 min. Quem espera até 9:00 em cada zona chega aos 27 min e derruba a Bijū em segundos. A vida da Bijū sobe cerca de 3× entre 8 e 27 min, mas o dano do jogador sobe muito mais.
- **Sobrevivência:** no Kage com 3 planos, só 59 a 67 de 115 vencem a zona 1. Quem morre cai na horda, não no Guardião.
- **Conclusão:** o tamanho da luta com chefes é decidido pela curva de dano do jogador. Esse é o próximo item da fila (dano de nível alto × pressão do Final Swarm). Nenhum número de jogo mudou nesta medição.

## Dano de nível alto × Final Swarm · 25/11/2026 (Claude Code)

**Ferramenta:** `scripts/simulate-damage.mjs`. O bot fica na zona 1 sem invocar o Guardião, e o Final Swarm começa aos 10:00. Em cada minuto, o golpe da 1ª técnica (com o crítico esperado) é refeito ligando uma parte da build por vez. Amostra: 115 versões, semente 17, conta nova, desvio médio. Pior caso do modelo: sem ultimate, aliados, procs nem fusões.

**De onde vem o dano (Kage, medianas):**

| Kage · minuto da zona | 1 | 5 | 10 | 11 (Final Swarm) | 13 |
|---|---:|---:|---:|---:|---:|
| Vivos (de 115) | 115 | 103 | 96 | 53 | 14 |
| Nível | 14 | 51 | 96 | 114 | 151 |
| Golpe ÷ HP de um comum | 3,4× | 10× | 20× | 7,1× | 6,9× |
| × nível | 3,4 | 22 | 97 | 156 | 364 |
| × afixos de dano da técnica | 4,1 | 5,7 | 5,7 | 5,8 | 6,3 |
| × itens | 1,2 | 1,9 | 2,3 | 2,3 | 2,6 |
| × pílulas | 1,0 | 1,0 | 1,0 | 1,0 | 1,8 |
| × treino | 1,0 | 1,0 | 1,0 | 1,0 | 1,1 |

No Genin, o golpe chega a 43× a vida de um comum no minuto 5 e a 126× no minuto 10. A horda morre antes de se acumular, e o dano recebido fica perto de zero até o Final Swarm.

**O que pesa:** o **nível** (`heroDamageScale`, termo cúbico `(1 + n/72)^3`) e os **afixos de dano das técnicas** (`GROWTH_ROLLS.damage`: +45% a +485% por nível da técnica, já ×4 a ×6 nos 3 primeiros minutos). Itens dão ×2 a ×3, e pílulas e treino pouco.

**O acoplamento:** o excesso de dano é o que segura o jogador no salto de ×3 do Final Swarm. Baixar só o dano derruba a sobrevivência: no Kage, a opção "nível ÷110" leva os vivos no minuto 11 de 53 para 22. Por isso a curva precisa mudar junto com a entrada do Final Swarm.

**Opções medidas** (mediana do golpe/HP de um comum e vivos em 115; nenhuma foi aplicada no jogo):

| Opção (minutos 5 · 10 · 11 · 13) | Kage: golpe/HP (vivos) | Jonin | Chunin |
|---|---|---|---|
| Atual | 10 · 20 · 7,1 (53) · 6,9 (14) | 17 · 33 · 12 (69) · 19 (27) | 23 · 43 · 15 (82) · 14 (81) |
| Afixos ½ | 6,6 · 12 · 6,1 (24) · 13 (3) | 9,9 · 16 · 12 (32) · 12 (16) | 12 · 25 · 8,6 (79) · 14 (54) |
| Nível ÷110 | 6,6 · 11 · 5,3 (22) · 9,8 (4) | 11 · 15 · 12 (30) · 13 (10) | 15 · 24 · 9,2 (72) · 11 (39) |
| Swarm ×2 | 10 · 20 · 9,7 (77) · 8,6 (41) | 17 · 33 · 16 (80) · 13 (75) | 23 · 43 · 22 (83) · 19 (82) |
| **Afixos ½ + swarm ×2** | 6,6 · 12 · 7,6 (47) · 7,3 (19) | 9,9 · 16 · 12 (60) · 12 (36) | 12 · 25 · 13 (82) · 11 (81) |
| Nível ÷110 + swarm ×2 | 6,6 · 11 · 6,4 (40) · 10 (12) | 11 · 15 · 12 (49) · 12 (29) | 15 · 24 · 12 (82) · 10 (80) |
| ÷110 + afixos ½ + swarm ×2 | 4,0 · 5,9 · 6,6 (14) · 19 (4) | 6,4 · 8,7 · 8,8 (28) · 7,6 (16) | 8,0 · 13 · 6,8 (74) · 8,8 (47) |

**APLICADO em 25/11/2026 (decisão do usuário: "Sim, aplicar"):** "afixos ½ + swarm ×2". `GROWTH_ROLLS.damage` agora tem base 22,5/40/67,5/112,5/187,5 e spread 11/15/22,5/35/55, e `FINAL_SWARM.multiplier` passou a 2. A defesa do Final Swarm entra em 60% e chega ao teto de 85% no 1º minuto. Medição depois da mudança, igual à opção: Kage com golpe/HP de 6,6× aos 5 min e 12× aos 10, e 47 vivos no minuto 11; Genin com 24× e 70×. Antes, a opção proposta era: Os afixos de dano das técnicas caem pela metade e o Final Swarm entra com ×2 em vez de ×3. Dentro da zona, o excesso cai cerca de 40% (Kage: 20× → 12× aos 10 min; Genin: 126× → 70×), e a sobrevivência no Final Swarm fica perto da atual. Os parâmetros estão expostos para o ajuste: `HERO_DAMAGE_CURVE` (progression.ts), `GROWTH_ROLLS` (combat.ts) e `FINAL_SWARM.multiplier`.

## Piso de vida dos chefes pelo poder do jogador · 25/11/2026 (Claude Code)

**Pedido do usuário:** "Precisamos do scale dos portais e das bijus escalem bastante e considerem o nivel atual no nosso personagem na partida para não nascer com a vida baixa demais e morrer com 1 ataque apenas".

**Regra** (`src/game/bossScaling.ts`):
- Na invocação, o jogo calcula o dano de alvo único da build naquele instante (`singleTargetDps`). Entram nível, itens, pílulas, afixos, crítico esperado, recarga, bônus contra elites e a defesa do próprio chefe.
- A vida do Guardião fica no mínimo em **30 s** desse dano, e a da Bijū em **60 s**. Cada plano do Shikamaru soma 33% (`BOSS_POWER`).
- A fórmula da zona (tempo, Final Swarm, dificuldade) continua valendo quando der mais. O aviso "E · invocar o guardião" já mostra a vida com o piso.
- Ultimate, aliados e procs não entram na estimativa, então a luta real tende a ser um pouco mais curta.

**Medição** (cenário C de `scripts/simulate-bosses.mjs`, 115 versões, semente 17; o simulador usa o mesmo piso e a mesma estimativa de dano):

| Dificuldade · planos · invocação | Guardiões (luta mediana) antes → agora | Bijū na chegada antes → agora | Vencem a zona 1 (de 115) antes → agora |
|---|---|---|---|
| Genin · 0 · cedo | 2 s → 25 a 29 s | 2 min → 2,9 min | 115 → 115 |
| Genin · 0 · 9:00 | 1 s → 28 a 29 s | 1 s → 60 s | 110 → 110 |
| Genin · 3 · 9:00 | 1 s → 51 a 56 s | 5 s → 2 min | 110 → 104 |
| Kage · 0 · cedo | 3 a 4 s → 25 a 28 s | 6 min → 11 min | 109 → 103 |
| Kage · 0 · 9:00 | 2 s → 29 s | 10 s → 60 s | 97 → 90 |
| Kage · 3 · cedo | 8 a 13 s → 43 a 51 s | 25 min → 23 min | 67 → 46 |
| Kage · 3 · 9:00 | 3 a 6 s → 53 a 56 s | 27 s → 2 min | 59 → 40 |

"Antes" é a medição anterior desta mesma data (commit 1edfc53), ainda com a curva antiga. "Agora" já tem a curva nova (afixos ½ e Final Swarm ×2) e o piso.

Efeito colateral: com lutas mais longas, o jogador fica mais tempo na horda. No Kage com 3 planos, menos personagens vencem a zona 1. Se ficar pesado em partida, dá para baixar `guardianSeconds` ou o peso dos planos no piso.

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

> **25/11/2026:** o multiplicador de entrada passou de ×3 para **×2** (decisão do usuário, junto com os afixos de dano pela metade). O texto abaixo é o registro anterior.

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

`PILL_MAX=9`, `PHARMACOLOGY_MAX=4`, Cabaça +2 e `PILL_SLOTS=5` (era 6 até 26/11/2026). O máximo simultâneo é 15 níveis por pílula. A qualidade altera o bônus de nível, enquanto cada escolha sobe exatamente um nível.

## Rodada 55 (13/11/2026) — HP, projéteis de bênção, zona e ímã (PROPOSTO, o usuário testa)

- **HP por nível:** ver §6 (`heroHpScale`, `progression.ts`).
- **Projétil/golpe da bênção** (`src/game/altarRewards.ts`): sai `projectileChance` do altar. `projectiles` inteiro por raridade: Comum 0 · Incomum 0 · **Raro +1 · Épico +2 · Lendário +3** (sem escala de Sorte). Nas técnicas sem projétil (corpo a corpo, cone, linha, área), cada projétil além do 1º repete o acerto 0,14 s depois (Ultimate fora; teto 11 extras). Konan/Tenten (afinidade) e a sinergia da Folha continuam com chance fracionária.
- **Escala por zona:** `difficultyAt(missão, zoneElapsed, ZONE_DIFFICULTY[zona] × planos × (1+threat), overtime)` — HP/dano/vivos/spawn/armadura/Final Swarm recomeçam do minuto 0 em cada zona; densidade `×(1+enemyCount)` por cima. HP do Mega Elite (`megaEliteHp`), defesa do Mega Elite e fração de inimigos à distância também usam o tempo da zona. Guardião (resistência por tempo total) e bijū (HP pela run inteira) mantidos.
- **Ímã do morro:** todo drop no chão (XP, Ryu, chakra, cura, pílula) entra no ímã global de 10 s e voa com velocidade ≥ distância/1,2 s — chega em ~1,2 s de qualquer ponto do mapa.

Exemplos para o jogador ficam no Guia do jogo, em src/game/glossary.ts. Sincronize-os com as mudanças das regras nesta seção.

## Sorte na qualidade dos buffs de evento · 26/11/2026

`luckQuality(sorte) = clamp((sorte − 10) / 60, 0, 1)` (src/game/luckQuality.ts). Hagoromo: `rollHagoromoRarity` e `rollToolOffers` multiplicam o peso de cada raridade por `1 + qualidade × índice`. Ebisu e lição do Iruka: `valor = mín + (máx − mín) × rng^(1/(1+2×qualidade))`. Altar: `altarLuckMultiplier = 1 + min(1,2; (sorte − 10) × 0,02)`.
