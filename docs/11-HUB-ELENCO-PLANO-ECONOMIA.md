# Hub, elenco, plano de build e proposta de Lamens

Data: 05/11/2026. Valores da árvore marcados como proposta; não estão balanceados por telemetria.

## Fluxo do hub

1. **Tela inicial**: continuar como convidado, escolher shinobi, ver a prévia da cena, consultar progressão e abrir a loja. A carteira de teste se chama "Administrador", sem login; o modal de conta avisa que o cadastro ainda não existe.
2. **Elenco**: 22 shinobis com retrato, aldeia, passiva, atributos base, kit de quatro técnicas e Ultimate. Grade de retratos (`src/ui/CharacterSelect.tsx`, `src/character-select.css`) com selo de elemento e vila; filtros combináveis por vila, elemento (afinidade principal, `heroAffinity`) e organização/clã (`ORGANIZATIONS`, `HERO_CLAN`), busca por nome, contagem "X de 22" e botão Limpar filtros. O painel de detalhes mostra selos de elemento e organizações.
3. **Ataques**: biblioteca do shinobi selecionado, com nível de desbloqueio de cada técnica, técnicas de colegas da mesma aldeia e filtros por escola, elemento e forma.
4. **Plano**: planejar ou deixar em casa técnicas, pílulas e itens. O que fica em casa não aparece na run; a técnica inicial é obrigatória.
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

## Passivas Shinobi e Bolsa da Missão (IMPLEMENTADO em 06/11/2026, pedido do usuário, valores provisórios)
- A aba "Progressão" virou **Passivas Shinobi**, com 24 nós em duas seções, **Treinamento** e **Equipe da partida**. Custo: `base + nível × 25` Lamens. Os nomes antigos foram mantidos porque são a chave salva.
- **Nós criados nesta rodada**, comparados às referências:
  - **Chakra Curativo**: +0,2 HP/s por nível, 5 níveis.
  - **Expansão**: +3% de área, 5 níveis.
  - **Farmacologia Ninja**: +1 nível máximo em cada pílula, 2 níveis.
  - **Selo de Ressurreição**: começa a run com 1 ressurreição a 35% do HP.
  - **Baú do Clã**: 5 vagas "em casa" de base, +5 por nível, +1 a cada 2 itens desbloqueados.
  - **Meditação de Chakra**: a Ultimate carrega 4% mais rápido por nível.
  - **Bolsa Grande**: 3 itens com prioridade em vez de 2.
  - **Treinamento com Jiraiya**: 4 espaços para técnicas favoritas.
- **Treinamento com Jiraiya** (o card "Afinidade" da referência):
  - As técnicas marcadas como ★ Planejar são as favoritas.
  - Níveis 1–4 abrem os espaços como Raros, com 8% cada; níveis 5–8 promovem cada um a Lendário, com 15%.
  - A cada oferta de level-up, cada espaço rola a sua chance e pode forçar uma favorita na oferta.
  - Medido em 1000 ofertas: a favorita aparece em 10% das ofertas sem o nó, 35% no nível 4 e 54% no nível 8.
- **Fora ou adaptado**:
  - **Pesquisa**: PENDENTE, porque o jogo não tem sistema de pesquisa.
  - **Pular**: não dá Ryu, como já era antes.
  - **Mochila grande**: virou **Prioridade**. Levar itens de casa para a run quebraria a regra "itens só por recompensas".
- **Bolsa da Missão** (botão ao lado de Itens; `src/ui/MissionBag.tsx`, `src/game/missionBag.ts`, `src/mission-bag.css`):
  - Abas Todos, Bloqueado, No pool e Em casa, com busca e o selo "Em casa X/Y".
  - Cards compactos e um hudzinho (Lamens, passivas, itens no pool, em casa) nas páginas Passivas, Itens e Bolsa.
  - Predefinições 1–4: salvar, duplicar, apagar e aplicar (`sb_bag_presets_v1`).
  - Prioridade ★: até 2 itens (3 com Bolsa Grande) ganham peso ×3 no sorteio de recompensas, sem garantia (`sb_priority_items`).
- **Renomeações**: "Arquivar" virou **Deixar em casa**; "Restaurar ao pool" virou **Levar na missão**.
  - Itens em casa não entram no pool de recompensas (kunai, shuriken, eventos, roleta).
  - A lista continua salva em `sb_archived_items`, compatível com saves antigos.

## Regra proposta para preço da árvore

Cada passiva tem 10 níveis. O preço do próximo nível é `preço_base + 25 × níveis já comprados`. Bases variam por atributo entre 75 e 140 Lamens. Assim, completar uma linha custa de 1.875 a 2.525 Lamens.

Para as dez linhas iniciais (bases: 80, 85, 90, 75, 110, 130, 75, 100, 140 e 120), completar todas custa **21.300 Lamens**. Uma hipótese de 500 Lamens por missão daria aproximadamente **43 missões** para concluir a árvore toda, sem considerar descontos ou bônus de dificuldade. A recompensa por missão precisa ser definida e simulada antes de aprovar o balanceamento.

Buffs propostos por nível: Treinamento +4% dano; Resistência +8 HP; Agilidade +2,5% movimento; Estudo +5% XP; Comércio +5% Lamens; Fortuna +2 Sorte; Magnetismo +0,6 coleta; Couraça +2 armadura; Precisão +1 ponto percentual crítico; Celeridade +2% velocidade de ataque. Acúmulos finais e caps precisam de balanceamento.

## Referência visual e limites

As capturas enviadas servem de referência de organização: cartão de personagem e passiva, botão separado para ataques, planejamento de build, árvore de melhorias e catálogo de itens com ação de arquivar. Não copiar nomes, personagens, ativos ou marca Pokémon.

O contexto geral exige quatro habilidades comuns automáticas; a tela de plano deve preservar essa regra, mesmo que as imagens de referência mostrem oito ou mais ataques planejados. A tela de planejamento é pré-run; desbloqueios e arquivamento devem permanecer conceitos distintos.
