# Shinobis de apoio, selamento e sinergias

## Capacidade CONFIRMADA
3 aliados base; +1 vaga por **um item da run**; +1 por **uma passiva permanente** adquirida com Lamens; máximo 5. Jogador não conta.

## Itens específicos de aliados (IMPLEMENTADO, valores provisórios)
- **Chá Verde de Konoha (incomum, até 3)**: ajudantes causam +25% de dano e atacam 15% mais rápido.
- **Estandarte da Aliança (raro, até 2)**: +40% de força dos buffs dos ajudantes.
- **Pergaminho de Recrutamento (épico, 1 cópia)**: +1 vaga de ajudante na run.
- Insígnia do Comandante, Tambor de Guerra e Selo de Cooperação saíram do catálogo na troca para o formato da referência (05/11/2026).

## Selamentos
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
  - Dano: 65% do dano do jogador × dano de aliados. Cadência: 1,5 s ÷ cadência de aliados.
  - Cada aliado dá um **buff passivo único** (`src/game/allies.ts`), multiplicado pela força de suporte (Estandarte da Aliança +40% por cópia). Os buffs entram em `calculateStats` como buffs da run e são recalculados das fontes a cada quadro. Projéteis não ficam fracionados. Valores provisórios:

| Ajudante | Buff | Ajudante | Buff |
|---|---|---|---|
| Naruto | +12% dano total | Jiraiya | +15% XP |
| Gaara | +10 armadura | Orochimaru | +25% duração de status |
| Madara | +6% chance crítica | Rock Lee | +15% dano de taijutsu |
| Hashirama | +1,2 HP/s de cura | Neji | +30% dano crítico |
| Sasuke | +15% dano de ninjutsu | Hinata | +6% evasão |
| Sakura | +1 HP/s de cura | Shikamaru | +15% recarga da Ultimate |
| Kakashi | +12% cadência | Temari | +12% área |
| Itachi | +12% chance de status | Tenten | +1 projétil |
| Minato | +12% movimento | Pain | +40 HP máximo |
| Tsunade | +1,5 HP/s de cura | Tobirama | +1,5 m de coleta |
| Kankuro | +20% veneno | Might Guy | +10% taijutsu, +6% movimento |
  - Iruka (NPC, não jogável): entra como ajudante pelo evento do Iruka com +25% de XP já no máximo; ataque "Kunai da Academia". Dados em `src/game/npcs.ts` (`NPC_ALLIES`).
  - Divergência registrada: o requisito original (contexto do chat) dizia que o protagonista não conta na contagem de vila, que composição mista recebe sinergia reduzida e que a ativação mostra notificação. O código atual conta o herói e não implementa as duas outras regras. Decisão do usuário PENDENTE.
  - Itens que afetam aliados: Chá Verde de Konoha, Estandarte da Aliança e Pergaminho de Recrutamento.
- **IMPLEMENTADO: vagas e sinergia**
  - Vagas: 3 + 1 pelo Pergaminho de Recrutamento + 1 pelo nó permanente "Suporte adicional", máximo 5.
  - Sinergias de vila e organização (`src/game/synergy.ts`, pedido do usuário em 06/11/2026):
    - A equipe é o herói + os ajudantes. Uma sinergia ativa com 2+ membros, desde que ao menos 1 seja ajudante.
    - Faixas 2 / 3 / 4+ multiplicam a base por ×1 / ×1,75 / ×2,5. Não escalam com a força de suporte.
    - Um membro acumula a vila e todas as organizações dele (ex.: Itachi + Pain ativam Akatsuki; Itachi também conta para Folha e Uchiha).
    - Organizações e clãs ficam em `ORGANIZATIONS`/`HERO_CLAN` de `src/game/heroes.ts`.
    - HUD: painel "SINERGIAS" abaixo do card do herói (ícone, nome, nº de membros, bônus; tooltip com membros). Cada cartão de ajudante mostra o selo PASSIVA com o nome e o valor da passiva individual, e as tags das sinergias às quais contribui. O resumo pós-run lista as sinergias.
    - Valores provisórios (base com 2 membros):

| Sinergia | Bônus base |
|---|---|
| Vila da Folha | +3% dano total |
| Vila da Areia | +4 armadura |
| Vila do Som | +5% chance de status (só 1 membro no elenco atual) |
| Vila da Chuva | +20 HP (só 1 membro no elenco atual) |
| Akatsuki (Itachi, Pain, Orochimaru) | +8% dano, +4% crítico |
| Sannin Lendários | +30 HP, +0,6 HP/s |
| Hokages | +8% XP, +6% área |
| Time 7 | +10% dano total |
| Time Guy | +10% taijutsu, +6% cadência |
| Irmãos da Areia | 2: +6 armadura/+7% dano; 3: +12 armadura/+15% dano |
| Clã Uchiha | +3% crítico, +15% dano crítico |
| Clã Hyuga | +12% dano crítico, +3% evasão |
| Clã Senju | +0,6 HP/s, +20 HP |
- **PENDENTE**:
  - Até 3 tentativas com chance de falha e fuga; minigame.
  - Selamento permanente (1 tentativa) para desbloquear personagem jogável.
  - Notificação (toast) ao ativar sinergia e conversão do selamento em item kunai.
  - Balanceamento das sinergias.
- Sprites e animação são provisórios. As capturas em `assets/referencia/prints` servem como norte visual.

## Aliados e sinergias
Cada aliado oferece buff exclusivo e habilidade ofensiva de dano moderado escalado com nível do jogador. Afinidade do protagonista; bônus ocultos para 3/4/5 aliados da mesma vila e equipes canônicas (ex.: Time 7); composições mistas recebem bônus reduzido; notificação na tela. Percentuais finais pendentes. Barras de HP para mega-elites e chefes, não para elites comuns. Futuras skins raras sem vantagem obrigatória.
