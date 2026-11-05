# Hub, elenco, plano de build e proposta de Lamens

Data: 05/11/2026. Valores da árvore marcados como proposta; não estão balanceados por telemetria.

## Fluxo do hub

1. **Tela inicial**: continuar como convidado, escolher shinobi, ver a prévia da cena, consultar progressão e abrir a loja. A carteira de teste se chama "Administrador", sem login; o modal de conta avisa que o cadastro ainda não existe.
2. **Elenco**: 22 shinobis com retrato, aldeia, passiva, atributos base, kit de quatro técnicas e Ultimate. Filtros por aldeia, tipo de dano e elemento.
3. **Ataques**: biblioteca do shinobi selecionado, com nível de desbloqueio de cada técnica, técnicas de colegas da mesma aldeia e filtros por escola, elemento e forma.
4. **Plano**: planejar e arquivar técnicas, pílulas e itens. Os arquivados não aparecem na run; a técnica inicial é obrigatória.
5. **Árvore e loja**: a moeda permanente compra níveis permanentes ou desbloqueia itens. Desbloquear item só o inclui no pool.
6. **Missão**: Genin, Chunin, Jonin ou Kage. A escolha altera a escala de dificuldade da run.

**Estado do código (05/11/2026)**:
- **IMPLEMENTADO**:
  - Escolhas, árvore, desbloqueios e carteira ficam no `localStorage`.
  - Os efeitos da árvore são aplicados na run (atributos, 4ª opção, usos de atualizar/pular/banir, suporte adicional, 4ª técnica).
  - O pool de itens da run respeita desbloqueios e arquivamento.
  - Cada item tem limite de cópias.
  - A carteira de teste começa com 999.999 e o Reset devolve o gasto.
- **IMPLEMENTADO**: carteira, árvore e loja mostram a moeda permanente como Lamens (🍜).
- **IMPLEMENTADO**: Lamens ganhos pelo desempenho ao fim de cada missão (ver [04](04-ITENS-HABILIDADES-ECONOMIA.md)). Com os exemplos da fórmula, a árvore completa sai em cerca de 33 vitórias Genin ou 15 vitórias Kage.
- **PENDENTE**: login real e sincronização de conta; desbloqueio de shinobis (todos estão abertos).

**Árvore no código**: além das dez linhas abaixo, há seis nós especiais.
- Quarta opção: 500, 1 nível.
- Atualizar: 150, 7 níveis.
- Pular: 100, 7 níveis.
- Banir: 180, 7 níveis.
- Suporte adicional: 600, 1 nível.
- Quarta técnica: 400, 1 nível.

## Regra proposta para preço da árvore

Cada passiva tem 10 níveis. O preço do próximo nível é `preço_base + 25 × níveis já comprados`. Bases variam por atributo entre 75 e 140 Lamens. Assim, completar uma linha custa de 1.875 a 2.525 Lamens.

Para as dez linhas iniciais (bases: 80, 85, 90, 75, 110, 130, 75, 100, 140 e 120), completar todas custa **21.300 Lamens**. Uma hipótese de 500 Lamens por missão daria aproximadamente **43 missões** para concluir a árvore toda, sem considerar descontos ou bônus de dificuldade. A recompensa por missão precisa ser definida e simulada antes de aprovar o balanceamento.

Buffs propostos por nível: Treinamento +4% dano; Resistência +8 HP; Agilidade +2,5% movimento; Estudo +5% XP; Comércio +5% Lamens; Fortuna +2 Sorte; Magnetismo +0,6 coleta; Couraça +2 armadura; Precisão +1 ponto percentual crítico; Celeridade +2% velocidade de ataque. Acúmulos finais e caps precisam de balanceamento.

## Referência visual e limites

As capturas enviadas servem de referência de organização: cartão de personagem e passiva, botão separado para ataques, planejamento de build, árvore de melhorias e catálogo de itens com ação de arquivar. Não copiar nomes, personagens, ativos ou marca Pokémon.

O contexto geral exige quatro habilidades comuns automáticas; a tela de plano deve preservar essa regra, mesmo que as imagens de referência mostrem oito ou mais ataques planejados. A tela de planejamento é pré-run; desbloqueios e arquivamento devem permanecer conceitos distintos.
