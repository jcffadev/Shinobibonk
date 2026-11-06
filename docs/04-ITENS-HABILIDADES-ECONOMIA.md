# Pool, habilidades, itens, economia

## Economia
Lamens = moeda permanente, ganha por partidas/conquistas; compra árvore, seus níveis, e desbloqueia itens não comuns para entrar no pool aleatório. Comuns entram sem compra. Desbloquear não concede item imediatamente. Chakra não é concedido diretamente por itens; efeitos podem acelerar recarga da Ultimate. Drops de normais/épicos/lendários escalam por dificuldade para XP, dinheiro e carga da Ultimate.

**Separação financeira confirmada em 05/11/2026:** o Ryu coletado durante a run é temporário (kunais, caça-níquel); Lamens continuam sendo a moeda permanente da conta para desbloqueios e passivas. Kunais e shurikens são as recompensas de mapa que abrem escolhas de item.

**Estado do código**:
- **IMPLEMENTADO**:
  - Ryu da run vem de drops amarelos e bolsas no mapa.
  - Kunai/shuriken no chão custam 20 Ryu, +10 por abertura paga; as kunais de recompensa são grátis.
  - Mercador paga 5 Ryu por arma; caça-níquel custa 25 Ryu.
  - Carteira permanente local de administrador com 999.999 de crédito e Reset que devolve o gasto.
- **IMPLEMENTADO**: o hub mostra a moeda permanente como Lamens (🍜); o Ryu (🪙) aparece só na run.
- **IMPLEMENTADO (PROPOSTO nos valores): Lamens por desempenho**, em `src/game/rewards.ts`, creditados uma vez por run em `main.tsx` e mostrados no resumo pós-run.
  - Tempo: 20 por minuto, máximo 200.
  - Abates: 1 a cada 15, máximo 200.
  - Nível: 4 por nível acima do 1.
  - Zona: 30 por zona além da 1ª, máximo 60.
  - Mega elites selados: 20 cada.
  - Vitória: +100.
  - Multiplicador: Genin ×1, Chunin ×1,3, Jonin ×1,7, Kage ×2,2.
  - Exemplos: vitória Genin forte ≈ 650; Kage com os mesmos números ≈ 1.430.
  - Ryu, itens e pílulas não afetam Lamens. A Pílula do Mercador e os itens de `gold` aumentam só o Ryu.
- **PENDENTE**: tabela final da roleta e limites de compra; balanceamento da fórmula de Lamens.

## Habilidades
Slots 1–4: **somente automáticos**, cada um com recarga própria; o quarto é desbloqueável permanentemente. R: Ultimate manual; a tecla Y (ou o clique no selo AUTO do botão R) alterna o uso automático. A Ultimate recarrega passivamente e os drops roxos aceleram. Level-up concede 3 s de invulnerabilidade. Geometrias: círculo, cone, onda, linha penetrante, V, bumerangue, projéteis, persistente. Cenário não bloqueia dano em área válida.

**Estado do código**:
- **Técnicas**: cada shinobi tem 4 técnicas (88 no total), com escola (Taijutsu, Ninjutsu, Genjutsu), elemento, forma (Projétil, Corpo a corpo, Cone, Onda, Em V, Linha, Área, Órbita) e status. Bumerangue e persistente não existem.
- **Desbloqueio**:
  - A técnica inicial é aprendida no nível 1. As outras ficam elegíveis nos níveis 5/12/20 (Naruto: 5/10/15; algumas exceções em Hinata e Guy).
  - A 1ª técnica de colegas da mesma aldeia entra no pool a partir do nível 8.
- **Limites**: máximo 3 técnicas aprendidas (4 com o nó "Quarta técnica"); nível máximo 9 por técnica.
- **Ultimate**: recarga base de 55 s; drop roxo +9% de carga.

## Recompensas de level-up (IMPLEMENTADO)
- **Cartas**: 3 por nível (4 com o nó "Quarta opção").
  - **Só técnicas e pílulas, nunca itens** (decisão do usuário).
  - Até 2 técnicas (com raridade e afixos sorteados) e o resto pílulas diferentes. Se faltar um tipo, o outro completa as cartas.
  - Técnicas todas preenchidas e no nível 9: só pílulas. Pílulas todas no limite (ou arquivadas/banidas): só técnicas.
  - Itens vêm só de recompensas: kunai, shuriken, eventos, drop de item e recusa de selamento.
  - Sem nada elegível, aparece uma carta de "Powerlevel" (+6 HP, +2% dano, +0,5 crítico, +1% movimento, +1 armadura ou +1% cadência).
- **Atualizar, pular e banir**: teclas F/X/Z ou botões, com 3 usos base cada e até 10 com a árvore. Banir remove a opção pelo resto da run.
- **Pílulas**: 18 pílulas em `src/game/pills.ts`, uma por atributo, com limite de 10 níveis cada. Aparecem como carta de level-up, como drop rosa raro e como resultado do caça-níquel, sempre pela função `grantPill`, que respeita o limite. Detalhes na seção abaixo.

## Pílulas (IMPLEMENTADO, valores provisórios)
O formato segue a página de vitaminas da wiki de referência: cada pílula aumenta **um atributo por nível**. Os nomes foram adaptados ao mundo ninja, sem Pokémon.

| Pílula | Por nível | Pílula | Por nível |
|---|---|---|---|
| do Soldado | +10% dano de Taijutsu | de Cura | +0,6 HP/s |
| Elemental | +10% dano de Ninjutsu | do Mercador | +12% Ryu |
| de Ferro | +4 armadura | do Pergaminho | +10% XP |
| do Vento | +6% movimento | da Fortuna | +5 Sorte |
| Akimichi | +18 HP máximo | Magnética | +1 m de coleta |
| do Clone | +0,5 projétil (arredonda para baixo) | Hiden | +8% recarga da Ultimate (não dá Chakra) |

A Pílula do Mercador afeta só o Ryu recebido na run, nunca os Lamens.
| do Relâmpago | +8% cadência | da Névoa | +3% evasão (teto 60%) |
| Olho de Falcão | +4% chance crítica | Genjutsu | +12% chance de status (teto 90%) |
| da Expansão | +10% área | da Persistência | +10% duração |

- **Pílulas antigas**: substituídas. A Rubra virou Soldado + Elemental, a Verde virou Akimichi e a Azul virou Hiden. Arquivamentos salvos com os nomes antigos passam a ser ignorados.
- **Cálculo**: `calculateStats` soma `pillBonuses` a cada recálculo, a partir das fontes, sem buff residual.
- **PENDENTE**:
  - pílulas de sistemas que o jogo ainda não tem (escudo, velocidade de projétil, roubo de vida, espinhos, sobrecura, maldição, elites, power-ups, atributo aleatório);
  - pílula mais forte conforme a raridade da carta;
  - limite de espaços de pílula;
  - balanceamento.

## RNG por raridade
**IMPLEMENTADO** (`rollGrowth` em `src/game/combat.ts`): cada carta de técnica sorteia a raridade com pesos 90 / 9,889 / 0,1 / 0,01 / 0,001, ajustados por Sorte.
- Rola 2 afixos, ou 3 em épico/lendário, entre dano, raio, cadência e duração (duração só em técnicas com status ou queimadura).
- Faixas por raridade: 10–18%, 18–28%, 25–35%, 30–45%, 40–55%.

Proposta original:

Afixos compatíveis com cada habilidade. Setup prioriza duração e recarga, podendo rolar potência dos buffs de dano, movimento e velocidade de ataque. Duração: comum até +10%, incomum >10–15%, raro até 25%, épico até 35%, lendário até 45% (faixas provisórias). Ofensivas: área, projéteis, crítico, dano, chance de status, duração etc. Raridades altas podem ter mais linhas. Ao esgotar pool, subir de nível aumenta ficha aleatoriamente, **exceto XP%**.

## Itens marcantes
- **Remédio do Rock Lee** (lendário): Punho Bêbado, bônus de combate/movimento/esquiva; **sem debuff nem emboscada obrigatória**.
- **Shuriken Selo da Tenten** (lendário): +30% dano total e selamento instantâneo de shinobis quando acionado, regras de proc pendentes.
- Lendários distintos para expandir máximo de habilidades de nível 9 para 12.
- Outro sistema de aumento de 7 para 13 pilhas: distinto de nível de habilidade, escopo ainda pendente.
- Lendários individuais: 1 ou 2 cópias conforme item; outros itens podem ter até 10, incluindo dano crítico comum +10%, incomum +20%, épico +40%.
- Itens de dano total, crítico, Taijutsu, Ninjutsu, Genjutsu (chance de status), dano por status, projéteis, área, coleta, buffs por abates e aliados.

## Catálogo
O catálogo de ~80 itens apresentado na conversa é uma **proposta de design**.

**IMPLEMENTADO** em `src/game/catalog.ts`: **91 itens** no formato da página de itens da wiki de referência (raridade · efeito · gatilho · limite de cópias). Os nomes foram adaptados ao mundo ninja, os valores levemente alterados e nada lembra Pokémon.
- **Raridades**: 25 comuns, 27 incomuns, 15 raros, 14 épicos e 10 lendários.
- **Custo de desbloqueio**: comum 0, incomum 150, raro 300, épico 500, lendário 900.
- **Limites**: "sem limite" da referência vira 10 cópias; itens únicos têm 1.
- **Pergaminhos de elemento** (comuns, molde dos itens de tipo): +28% de dano no elemento e +3% de dano total. Existem para Fogo (Katon), Água (Suiton), Vento (Fuuton), Terra (Doton), Raio (Raiton), Madeira (Mokuton), Areia, Sombra e Neutro.
- **Específicos pedidos pelo usuário, no mesmo molde**:
  - **Pergaminho do Monte Myoboku**: +28% de dano de técnicas Sábias (Senjutsu) e +3% de dano total.
  - **Pergaminho Genjutsu**: +28% de dano de técnicas de Genjutsu e +3% de dano total. Antes o Genjutsu não tinha multiplicador de escola; agora tem `stats.genjutsu`.
- **Mecânicas implementadas** (lidas de `Stats.extra` em `GameCanvas.tsx`):
  - **Dano condicional**:
    - contra elites e chefes (Etiqueta Exorcista);
    - contra inimigos controlados (Correntes de Selamento);
    - por status diferente no alvo, até +30% (Selo dos Cinco Elementos);
    - com HP baixo (Fúria da Kyuubi);
    - sem levar golpes, até +40% (Ritmo Ininterrupto);
    - por abates, até +30% (Manto do Shinigami);
    - armadura vira dano de Taijutsu (Clava de Ferro);
    - 3% de ×8 (Lâmina Kubikiribocho);
    - execução abaixo de 8% (Lâmina do Carrasco).
  - **Gatilhos por acerto**: queimar, envenenar, dormir, prender (paralisar) e congelar parcialmente. Há também +% de dano de queimadura/veneno.
  - **Defesa**:
    - roubo de vida (Raiz Vampira, Concha Sanguinária);
    - espinhos (Armadura de Espinhos, Armadura Samurai);
    - escudo a cada 14 s (Escudo de Chakra);
    - invisibilidade ao ser atingido (Fumaça Densa);
    - gelo ao ser atingido (Espelho de Gelo de Haku);
    - cura de emergência (Fruta Medicinal);
    - cura periódica (Chá de Ervas);
    - cura por abate (Chá Medicinal);
    - ressurreição com 35% ou 60% de HP;
    - HP % e redução de regeneração.
  - **Ritmo**:
    - +movimento e +cadência ao ser atingido (Selo de Adrenalina);
    - +armadura e +cadência parado (Postura de Pedra);
    - Ultimate que recarrega as técnicas (Pergaminho do Hokage).
  - **Ataques automáticos**:
    - raios a cada 2,5 s (Pergaminho Chidori Nagashi);
    - chamas negras no inimigo mais forte a cada 6 s (Chamas de Amaterasu).
  - **Economia e mapa**: desconto nas kunais (até −40%) e no caça-níquel (até −24%); ±% de inimigos no mapa.
  - **Limites**: Cabaça de Pílulas (pílulas até 12) e Pergaminho Proibido (técnicas até nível 11).
- **Mantidos por regra do projeto**: Remédio do Rock Lee (lendário, sem penalidade), Shuriken Selo da Tenten (+25% de dano e selamento instantâneo), Selo de Senjutsu (infusão Sábia de Hashirama), Pergaminho de Recrutamento e Colar do Primeiro Hokage.
- **Sorteio**: pesos fortemente concentrados em comum (90 / 9,889 / 0,1 / 0,01 / 0,001) e corrigidos pela quantidade de itens de cada raridade.

**Fora do catálogo** (dependem de sistemas que o jogo não tem):
- pulo e deslize;
- pesca;
- velocidade e ricochete de projétil;
- recuo (flinch);
- vantagem de tipo;
- pontos que crescem com o dinheiro gasto;
- altares de símbolos.

**PENDENTE**: balanceamento dos 91 itens; os efeitos visuais de raios e chamas são simples (anéis no chão).
