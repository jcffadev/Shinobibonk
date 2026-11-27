---
name: criar-arte-shinobibonk
description: Cria e revisa sprites chibi fiéis à fase do anime Naruto, anima NPCs e integra pixel art de itens, pílulas, drops e cenários do ShinobiBonk.
---

# Arte do ShinobiBonk

Leia a direção de arte de `AGENTS.md`. Abra os atlases usados pelo módulo alvo antes de produzir. Use PNG com transparência para sprites, contorno escuro e silhueta reconhecível no tamanho do jogo. Crie arte original com os trajes e símbolos necessários da fase e mantenha a visão elevada 2.5D. As referências do usuário servem para orientar o estilo.

- Personagens usam cabeça maior, corpo compacto, paleta legível e pés no mesmo ponto de apoio. Confira o nível inicial, as evoluções e o NPC na cena antes de substituir uma região. Veja `src/game/evolution.ts` e `src/scene/GameCanvas.tsx`.
- Itens e pílulas usam desenhos distintos. Descreva o objeto e a cor de cada célula na geração. Confira a ordem visual e a associação por ID em `src/game/inventoryArt.ts`. Colete, bandana, pergaminho, kunai e shuriken precisam ter formas diferentes.
- Meça as bordas dos atlases entre as silhuetas. Separe fileiras pelos vãos transparentes do original antes de centralizar cada célula. Use os limites reais quando a geração vier irregular e verifique as quatro margens de cada quadro com o canal alfa. Valide tanto na oferta grande quanto no inventário pequeno. Confira vazamento, recorte e alinhamento.
- Para animação use a skill `movimentar-shinobi`. A referência primária é o sprite estático da forma já usado por `portraitRegion`. Indique a célula exata se ele estiver num atlas. Use a folha do Naruto Academia só como referência de poses e organização. Compare o personagem parado e em movimento, conferindo rosto, cabelo, roupas, cores, acessórios, proporções e apoio dos pés antes de integrar.
- Para cada novo jogável e cada evolução, entregue repouso, caminhada, ataque, pulo e dash/esquiva. Use quadros de ação que representem o golpe do personagem, como a rasteira de Lee e o chute alto de Guy. Confira preparação, execução e recuperação.
- Nos efeitos de técnicas, consulte a referência da obra e a direção visual de jogos oficiais quando houver. Recrie o efeito com a geometria e a paleta do projeto. Confira direção, escala, impacto e a tecla H sem depender de mudanças no dano. Em bijū, confira a silhueta e conte os apêndices visíveis antes de registrar a textura.
- Para ilustração de seleção, deixe área livre para o nome da região e os guardiões. Guarde as imagens de referência e os assets do jogo em caminhos separados. Use apenas arte autorizada no produto.
- Documente o caminho, a ordem do atlas, o que foi integrado e o que foi testado com a skill `documentar-projeto`.
## Derrota e selamento

- Cada versão capturável tem a própria folha de derrota 4×2. Desenhe oito poses no mesmo enquadramento, incluindo impacto, mão no peito, perda de apoio, primeiro joelho no chão, dois joelhos no chão, cabeça baixa e repouso. Preserve roupa, cabelo, mãos, armas e acessórios nas oito poses. A referência é o sprite atual daquela versão. Use as seis primeiras folhas aprovadas de `public/assets/shinobi-defeat/` para comparar o gesto, o apoio e a leitura em três quartos.
- Normalize o atlas com uma escala por folha, alinhe o apoio dos pés e dos joelhos e preserve a redução natural de altura. Registre em `DEFEAT_SHEETS` o ID exato de cada versão. Versões sem folha continuam pendentes para a auditoria de arte.
- Confira a queda no tamanho de jogo durante uma volta completa da câmera. A pose 2,5D mantém a vista em três quartos e gira em torno do apoio no terreno. Confira joelhos, leitura do rosto, continuidade dos oito quadros, plano inclinado e pose final restaurada de um save. O E fica disponível a 1,42 s, quando aparece a última pose.

## Técnicas e efeitos

- Use o nome e a natureza do golpe para escolher sua silhueta, trajetória e impacto. Para cenas como Gamabunta, separe os quadros do ator do efeito em movimento para alinhar a origem com a boca ou as mãos.
- Use o atlas de pixel art para a Substituição e a aura do Modo Sábio. A aura deve permanecer visível durante o buff. Reaproveite quadros e efeitos na prévia com alvos, inclusive a animação de corrida de clones.
- Para os ícones de Modo Sábio, mantenha a identidade e as marcas oculares de cada shinobi conforme a referência da obra. Para aldeias, mostre o emblema e o nome original.

## Fidelidade ao anime · padrão permanente

1. Identifique o personagem, a fase e o traje antes de desenhar. Localize uma cena do anime ou material oficial da versão. Compare rosto e corpo inteiro e busque perfil ou costas quando disponíveis. Use a Narutopedia para localizar episódios e cruzar detalhes com os quadros da obra.
2. Registre a referência e as características observáveis antes de gerar. Confira paleta, formato da cabeça, olhos, cabelo, marcas, piercings, proteção da testa, roupa, símbolos, armas e em qual mão ficam. Aplique a proporção chibi do Naruto Academia, Genin e Shippuden do projeto à identidade da versão retratada. Use a folha `public/assets/naruto-academia-diagonal-v1.png` para comparar a silhueta e consulte os exemplos de identificação no [registro do elenco](../../docs/21-ELASTAO-DE-HEROIS.md#referências-de-gengetsu-sakumo-e-orochimaru-akatsuki).
3. Use o mesmo desenho-base em seleção, ficha, repouso, corrida, ataque, pulo e dash. Valide frente, perfil, costas e as diagonais em folha de contato, no tamanho de jogo. Compare frente e costas com a referência para confirmar que nenhum detalhe muda de fase, cor, posição ou lado. Antecipe os casos assimétricos antes de espelhar.
4. Verifique as quatro fases de cada ação, a margem transparente e o apoio dos pés. Em conjuração, confirme a pose da técnica e os selos apropriados. Preserve as ações e proporções já aprovadas ao corrigir uma versão. Use as referências de terceiros para orientar arte original e registre os links na documentação.

## Consistência das versões

Use o Naruto Academia, Genin e Shippuden como referência chibi em todo o elenco. Cabeça bem marcada, mãos e pés legíveis, tronco e pernas compactos e contorno de pixel art. Compare seleção, repouso, caminhada/corrida e ações lado a lado. Preserve diferenças de idade, roupas, cabelo e acessórios dentro dessa linguagem. Para NPCs, parta dos sprites aprovados e preserve a identidade ao animar. Use desenhos próprios de perfil e costas quando disponíveis.

Crie o repouso em três quartos e o retrato em perfil a partir da mesma identidade. Use o mesmo recorte de retrato na seleção e na ficha. Na caminhada, separe frente reta, costas retas, perfil, diagonal frontal e diagonal traseira. Use a pose da vista e o enquadramento da mesma versão. A altura visível vem do corpo, com Gaara Genin como referência infantil. Compare o personagem dianteiro e traseiro lado a lado para reconhecer de imediato roupa, silhueta, idade e acessórios. Para a corrida, use a pose com braços para trás nas cinco vistas e preserve o traje da versão, incluindo cabelo, marcas, acessórios e silhueta. Compare a arte de frente, costas e perfil lado a lado com o modelo antes de integrar. Siga o layout e a verificação de cobertura da skill `movimentar-shinobi`.

Na seleção, ficha e ranking, use a pose em três quartos da própria versão. A cabeça fica centralizada no card pequeno e a silhueta inteira no card de detalhes, com margens regulares. Compare com Naruto Shippuden e confira o quadro real de cada versão numa folha de contato.
