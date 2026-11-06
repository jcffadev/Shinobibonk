---
name: criar-arte-shinobibonk
description: Cria e integra pixel art de shinobis, NPCs, itens, pílulas, drops, marcos e cenários do ShinobiBonk.
---

# Arte do ShinobiBonk

Leia a direção de arte de `AGENTS.md`. Abra os atlases usados pelo módulo alvo antes de produzir. Use PNG com transparência para sprites, contorno escuro e silhueta reconhecível no tamanho do jogo. Crie arte original com os trajes e símbolos necessários da fase e mantenha a visão elevada 2.5D. As referências do usuário servem para orientar o estilo.

- Personagens usam cabeça maior, corpo compacto, paleta legível e pés no mesmo ponto de apoio. Confira o nível inicial, as evoluções e o NPC na cena antes de substituir uma região. Veja `src/game/evolution.ts` e `src/scene/GameCanvas.tsx`.
- Itens e pílulas usam desenhos distintos. Descreva o objeto e a cor de cada célula na geração. Confira a ordem visual e a associação por ID em `src/game/inventoryArt.ts`. Colete, bandana, pergaminho, kunai e shuriken precisam ter formas diferentes.
- Meça as bordas dos atlases entre as silhuetas. Gere margens transparentes e use os limites reais se a folha vier irregular. Valide tanto na oferta grande quanto no inventário pequeno. Confira vazamento, recorte e alinhamento.
- Para animação use a skill `movimentar-shinobi`. A referência primária é o sprite estático da forma já usado por `portraitRegion`. Indique a célula exata se ele estiver num atlas. Use a folha do Naruto Academia só como referência de poses e organização. Compare o personagem parado e em movimento, conferindo rosto, cabelo, roupas, cores, acessórios, proporções e apoio dos pés antes de integrar.
- Para cada novo jogável e cada evolução, entregue repouso, caminhada, ataque, pulo e dash/esquiva. Use quadros de ação que representem o golpe do personagem, como a rasteira de Lee e o chute alto de Guy. Confira preparação, execução e recuperação.
- Nos efeitos de técnicas, consulte a referência da obra e a direção visual de jogos oficiais quando houver. Recrie o efeito com a geometria e a paleta do projeto. Confira direção, escala, impacto e a tecla H sem depender de mudanças no dano. Em bijū, confira a silhueta e conte os apêndices visíveis antes de registrar a textura.
- Para ilustração de seleção, deixe área livre para o nome da região e os guardiões. Guarde as imagens de referência e os assets do jogo em caminhos separados. Use apenas arte autorizada no produto.
- Documente o caminho, a ordem do atlas, o que foi integrado e o que foi testado com a skill `documentar-projeto`.
## Técnicas e efeitos

- Use o nome e a natureza do golpe para escolher sua silhueta, trajetória e impacto. Para cenas como Gamabunta, separe os quadros do ator do efeito em movimento para alinhar a origem com a boca ou as mãos.
- Use o atlas de pixel art para a Substituição e a aura do Modo Sábio. A aura deve permanecer visível durante o buff. Reaproveite quadros e efeitos na prévia com alvos, inclusive a animação de corrida de clones.
- Para os ícones de Modo Sábio, mantenha a identidade e as marcas oculares de cada shinobi conforme a referência da obra. Para aldeias, mostre o emblema e o nome original.
