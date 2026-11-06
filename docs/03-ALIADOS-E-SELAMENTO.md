# Shinobis de apoio, selamento e sinergias

## Capacidade CONFIRMADA
3 aliados base; +1 vaga por **um item da run**; +1 por **uma passiva permanente** adquirida com Lamens; máximo 5. Jogador não conta.

## Itens específicos de aliados (IMPLEMENTADO, valores provisórios)
- **Chá Verde de Konoha (incomum, até 3)**: ajudantes causam +25% de dano e atacam 15% mais rápido.
- **Estandarte da Aliança (raro, até 2)**: +40% de força dos buffs dos ajudantes.
- **Pergaminho de Recrutamento (épico, 1 cópia)**: +1 vaga de ajudante na run.
- Insígnia do Comandante, Tambor de Guerra e Selo de Cooperação saíram do catálogo na troca para o formato da referência (05/11/2026).

## Selamentos
**Regra vigente (IMPLEMENTADA em 06/11/2026, pedido do usuário; substitui o desenho abaixo onde divergir)** — `src/game/enemyTiers.ts`, `src/game/account.ts`:

| Tipo | Contorno | Captura | Força (base Genin, provisória) | Recompensa |
|---|---|---|---|---|
| Monstro normal | — | não | HP 22 | EXP 8, Ryu 3 (72%), Chakra 9 (28%), lamen 15% |
| Elite amarelo (8% dos spawns) | amarelo | não | HP 95, dano ×1,6, bloqueia 30% do dano, sem técnicas | Ryu e Chakra garantidos; EXP/Ryu/Chakra ×3 × peso do HP × √tier da missão |
| Mega Elite (a cada 45–70 s, até 9) | vermelho | sim, como ajudante da run (NÃO desbloqueia na conta) | HP 420, dano ×2,6, bloqueia 55%, sem técnicas | saque ×9 × peso do HP × √tier; 3 moedas e 2 orbes de chakra |
| Shinobi para selar (1º encontro especial da run, se houver shinobi bloqueado) | ciano | sim, 1 tentativa: E sela, G deixa escapar | HP 180, dano ×1,5, bloqueia 25% | só DESBLOQUEIA na conta (sem buff, EXP ou drops) |
| Guardião / Naruto Totem | — | regras próprias | guardião mantém técnicas de chefe | ver docs/01 |

- Missões de desbloqueio (src/game/unlockMissions.ts): cada shinobi bloqueado exige mapa + dificuldade, abates e minuto na run e, em cadeias de história, ter selado outros antes (Hinata → Neji → Tenten → Lee → Guy; Temari → Kankuro → Gaara; Kakashi → Jiraiya → Tsunade/Orochimaru/Minato/Pain; Minato → Kushina; Kakashi → Itachi; Tsunade → Hashirama → Tobirama; Hashirama + Itachi → Madara). O card de missão mostra o checklist.
- Iniciais jogáveis: Naruto, Sasuke e Sakura (PROPOSTO, ajustável em `STARTER_HEROES`). Os demais aparecem 🔒 na seleção até serem selados. Em testes automáticos (`?test`) todos ficam jogáveis e o Shinobi para selar não surge sozinho.
- Selar um shinobi na conta também libera as técnicas ÚNICAS dele para o pool dos outros (respeitando elemento).
1. **Apoio temporário**: mega-elite Edo Tensei, até 3 tentativas; se todas falham, foge, sem bônus de aliado. Ao derrotar o shinobi, mostrar o próprio personagem e a animação do selo antes de confirmar a entrada dele na equipe. Se o jogador recusar com G, o elite deixa uma kunai/shuriken; coletar o drop abre uma escolha de item cuja qualidade considera Sorte. O abate não pode duplicar a recompensa.
2. **Desbloqueio permanente**: mega-elite com menos HP, 1 tentativa; sucesso libera personagem jogável na conta.

Chance depende de Sorte, itens específicos e árvore permanente. **Recompensa de abate somente uma vez**, sem duplicar por selamento. Shuriken Selo da Tenten: lendário +30% dano total e efeito especial de selamento instantâneo, gatilho exato pendente.

## Estado do protótipo (05/11/2026)
- **IMPLEMENTADO: mega elites**
  - São um shinobi aleatório do elenco de 22 (exceto quem já é aliado) e surgem naturalmente, até 9 por run.
  - Ao derrotar um, a run para na decisão e mostra o retrato do alvo.
  - Se vários caem juntos, as decisões entram em fila.
- **IMPLEMENTADO: selar ou recusar**
  - E inicia o ritual de 2,7 s (selo, pergaminho, anéis). Com a Shuriken Selo da Tenten, o selamento é instantâneo. Ao concluir, o shinobi entra na equipe da run.
  - G recusa e deixa uma kunai grátis. Coletá-la abre uma escolha de 3 itens (4 com "Quarta opção"), com raridade influenciada pela Sorte.
  - Equipe cheia ou personagem repetido impede selar.
- **IMPLEMENTADO: aliados em combate**
  - Aparecem como sprite, seguem o jogador em formação e atacam sozinhos com a 1ª técnica deles.
  - Dano: 65% do dano do jogador × dano de aliados. Velocidade de ataque: 1,5 s ÷ velocidade de ataque de aliados.
  - Cada aliado dá um **buff passivo único** (`src/game/allies.ts`), multiplicado pela força de suporte (Estandarte da Aliança +40% por cópia). Os buffs entram em `calculateStats` como buffs da run e são recalculados das fontes a cada quadro. Projéteis não ficam fracionados. Valores provisórios:

| Ajudante | Buff | Ajudante | Buff |
|---|---|---|---|
| Naruto | +12% dano total | Jiraiya | +15% XP |
| Gaara | +10 armadura | Orochimaru | +25% duração de status |
| Madara | +6% chance crítica | Rock Lee | +15% dano de taijutsu |
| Hashirama | +1,2 HP/s de cura | Neji | +30% dano crítico |
| Sasuke | +15% dano de ninjutsu | Hinata | +6% evasão |
| Sakura | +1 HP/s de cura | Shikamaru | +15% recarga da Ultimate |
| Kakashi | +12% velocidade de ataque | Temari | +12% área |
| Itachi | +12% chance de status | Tenten | +1 projétil |
| Minato | +12% movimento | Pain | +40 HP máximo |
| Tsunade | +1,5 HP/s de cura | Tobirama | +1,5 m de coleta |
| Kankuro | +20% veneno | Might Guy | +10% taijutsu, +6% movimento |
  - Iruka (NPC, não jogável): entra como ajudante pelo evento do Iruka, já com afinidade máxima (+25% de XP); ataque "Kunai da Academia". Dados em `src/game/npcs.ts` (`NPC_ALLIES`).
  - Itens que afetam aliados: Chá Verde de Konoha, Estandarte da Aliança e Pergaminho de Recrutamento.
- **IMPLEMENTADO: afinidade do ajudante** (pedido do usuário em 06/11/2026, valores provisórios)
  - Níveis 1–5 (mínimo de 0 / 40 / 100 / 180 / 280 pontos). Ganha +1 ponto por segundo na equipe (fora do selamento) e +0,2 por abate da equipe.
  - A passiva individual vale 40% / 55% / 70% / 85% / 100% conforme o nível (× força de suporte). Quem entra por selamento ou substituição começa no Nv. 1; o Iruka entra no máximo. Aviso na tela ao subir de nível.
  - Cartões mostram passiva atual e máxima e "AFINIDADE n/5" com barra.
  - Projétil fracionário: a parte inteira é garantida e a fração vira chance por disparo (`projectileChance`); ex.: 1,5 = +1 projétil e 50% de chance de mais um.
- **IMPLEMENTADO: vagas, substituição e configuração de captura**
  - Vagas: 3 + 1 pelo Pergaminho de Recrutamento + 1 pelo nó permanente "Suporte adicional", máximo 5.
  - Equipe cheia → tela de substituição (choiceLevel −7): cards dos ajudantes atuais (atributo, afinidade, passiva atual/máx., sinergias após a troca) e o card do novo destacado. Clicar no novo (ou X) dispensa sem recompensa; clicar num atual (ou teclas 1–9) substitui, e o novo entra no Nv. 1 de afinidade. Mega elites simultâneos entram em fila. O abate é contado uma vez só.
  - Configurações (botão "⚙ Configurações" no hub ou caixa no card de selamento, `src/game/settings.ts`): desligar o card/animação de captura sela direto com um aviso; com equipe cheia, abre a tela de substituição. Com a opção desligada não há recusa com G (kunai grátis).
- **IMPLEMENTADO: combos de aldeia e organização** (`src/game/synergy.ts`, pedido do usuário em 06/11/2026)
  - Contam **só ajudantes** (o herói não conta). Cada faixa é o valor total, não soma com as anteriores.
  - Cada aldeia tem uma família de atributo tirada do tema na Narutopedia. **Nenhum combo dá dano % e projétil juntos.** Misturar vilas (ex.: 3 Nuvem + 2 Folha) ativa os dois combos.
  - Organizações ativam com 2+ ajudantes e acumulam com a vila: base com 2, ×1,6 com 3, ×2,2 com 4, ×3 com 5.
  - Listas já incluem ids do elenco futuro (Kisame, Deidara, Ino, Zabuza…), que contam quando existirem.
  - HUD: painel "SINERGIAS" abaixo do card do herói com membros/próxima faixa; cartões mostram as tags das sinergias.

| Aldeia (tema) | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Folha (projétil/XP/coleta) | +3% XP, +0,5 m coleta | +1 projétil, +5% XP, +2 m | +1,5 projétil, +5% XP, +2 m | +2 projéteis, +10% XP, +3 m |
| Nuvem (dano) | +4% dano | +8% | +12% | +20% dano, +5% velocidade de ataque |
| Névoa (crítico) | +3% crítico | +4% crít., +15% dano crít. | +6%, +25% | +9%, +45% |
| Pedra (armadura/HP) | +3 armadura | +5 armadura, +25 HP | +8, +40 | +12, +70 |
| Areia (área/armadura) | +5% área | +10% área, +3 armadura | +14%, +5 | +22%, +8 |
| Som (velocidade de ataque/vel. projétil) | +4% velocidade de ataque | +7% cad., +10% vel. proj. | +10%, +15% | +15%, +25% |
| Chuva (status) | +5% chance de status | +8%, +15% duração | +11%, +20% | +15%, +35% |
| Cachoeira (cura) | +0,4 HP/s | +0,7 HP/s, +20 HP | +1, +35 | +1,6, +60 |
| Grama (Ultimate/evasão) | +6% recarga Ultimate | +10%, +3% evasão | +14%, +4% | +22%, +6% |

| Organização | Base (2 ajudantes) |
|---|---|
| Akatsuki | +3% crítico, +10% dano crítico |
| Sannin | +30 HP, +0,6 HP/s |
| Hokages | +6% XP, +5% área |
| Time 7 | +5% dano |
| Time Guy | +10% taijutsu, +5% velocidade de ataque |
| Uchiha | +3% crítico, +15% dano crítico |
| Hyuga | +12% dano crítico, +3% evasão |
| Senju | +0,6 HP/s, +20 HP |
| Ino-Shika-Chō | +6% área, +10% duração |
| Time 8 | +0,8 m coleta, +5% movimento |
| Sete Espadachins | +20% dano crítico, +5% velocidade de ataque |
| Irmãos da Areia | faixas fixas: 2 → +6 armadura/+7% dano; 3 → +12/+15% |

- **Elementos pela Narutopedia (CORRIGIDO em 06/11/2026, pedido do usuário)**: `HERO_NATURES` em `src/game/heroes.ts` guarda as naturezas canônicas ("Nature Type") dos 22 shinobis (Yin → Sombra; Magnet Release do Gaara → Areia). A afinidade usada no filtro é a marcada como "(Affinity)" na wiki (Naruto Vento, Kakashi e Sasuke Raio); senão, a primeira natureza canônica presente no kit; senão, a primeira natureza canônica; sem natureza = Neutro (Lee, Tenten). Técnicas sem natureza canônica viraram Neutro: Furacão da Folha (Lee), Palma de Ar (Neji), Palma do Vazio (Hinata), Kunai Explosiva (Tenten, perdeu a queimadura), Tigre do Meio-Dia (Guy), Bansho Tenin (Pain), Kuroari e Chuva Venenosa (Kankuro). Afinidades resultantes que mudaram: Itachi Fogo, Neji/Hinata/Guy Fogo, Lee/Tenten Neutro, Pain Fogo, Kankuro Terra. Pain ganhou Clã Uzumaki: no jogo, "Pain" é o Nagato (Clã Uzumaki), que controla o corpo do Yahiko no Caminho Deva. O Yahiko não tem clã na Narutopedia (páginas Nagato, Yahiko, Six Paths of Pain e Deva Path); a passiva do Pain explica isso. Ainda divergem do cânone (não alterados): Orochimaru só como Vila do Som (canonicamente também Konoha/Akatsuki; já está na Akatsuki) e Temari só como Areia (também ligada a Konoha).
- **PENDENTE**:
  - Até 3 tentativas com chance de falha e fuga; minigame.
  - Selamento permanente (1 tentativa) para desbloquear personagem jogável.
  - Aviso na tela ao ativar sinergia; configuração de captura também no HUD da run.
  - Balanceamento dos combos e da afinidade.
- Sprites e animação são provisórios. As capturas em `assets/referencia/prints` servem como norte visual.

## Aliados e sinergias
Cada aliado oferece buff exclusivo e habilidade ofensiva de dano moderado escalado com nível do jogador. Afinidade do protagonista; bônus ocultos para 3/4/5 aliados da mesma vila e equipes canônicas (ex.: Time 7); composições mistas recebem bônus reduzido; notificação na tela. Percentuais finais pendentes. Barras de HP para mega-elites e chefes, não para elites comuns. Futuras skins raras sem vantagem obrigatória.
