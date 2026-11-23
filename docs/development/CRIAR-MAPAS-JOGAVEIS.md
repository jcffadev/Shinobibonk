# Criação de vilas jogáveis

1. Compare a foto de seleção com a entrada, as ruas, os acessos e a silhueta da vila. Defina a posição da avenida e dos marcos antes de decorar. Preserve a escala do personagem, câmera e controles de missão.
2. Defina a vista geral e os pontos de passagem em `villageLayout.ts`. Cadastre os lotes em `villageDistricts.ts` e nivele suas bases em `villageTerrain.ts`. Confirme que as ligações entre ruas permanecem livres, inclusive atrás das construções.
3. Modele casas com volume, profundidade de telhado, materiais e janelas dos quatro lados. Use `villageArchitecture.ts` e o atlas local. As construções têm coordenadas e orientação no mundo. Vegetação plana pode usar os sprites de cenário.
4. Registre uma fundação retangular ou circular do tamanho da parede. Garanta acesso a escadas e beirais. Deixe espaço para o pé do personagem na borda e conserve a passagem livre embaixo do portão. No modelo do Kiri, confira o nível da água e das duas extremidades das pontes.
5. Reserve pontos de encontro na rua e na praça. Teste trajetos a partir do ponto em que a partida começa, com o raio do personagem mais a margem necessária para cada evento.
6. Ajuste o primeiro plano, as fachadas próximas da rua, a distribuição dos quarteirões e os marcos de fundo. Confira uma vista da frente, uma lateral e uma de trás. Renderize as malhas para comparar o arranjo antes de publicar. Use a [política de testes](TESTING_POLICY.md) para a validação em partida.
7. Preserve `mapas_basicos` para saves legados. Uma nova revisão precisa ser validada em branch própria antes de substituir a versão publicada. O experimento low poly é externo ao jogo.


## Sorteio por missão

A semente determina o posicionamento, a escala e os materiais dos lotes. Terreno e malhas leem os mesmos lotes do `VillageLayout`. Use ruas e marcos para orientação. Os NPCs usam o sorteio por zona e exigem espaço livre e seco. Salve as posições dos eventos e a semente. Escadas usam degraus maciços e altura de apoio por degrau.


## Escadas e ocupação urbana

Construa o piso e os espelhos a partir de um só perfil de degraus. Evite a sobreposição de acabamento e corpo no plano superior. Cada degrau compartilha sua largura, profundidade e altura com a fundação. Conecte o patamar a outra via, a um pátio ou à entrada de uma construção e exercite a travessia nos dois sentidos. Meça a área urbana pela grade jogável, incluindo áreas públicas. Reserve a água e os espaços de eventos antes de distribuir as casas.


## Marcos de referência e detalhe gráfico

Use referências verificadas da obra para as proporções, os materiais, a composição e os elementos de identificação. Modele volumes com frente, lados e fundo. Eventos, NPCs e portais de missão mantêm orientação de mundo. Nos monumentos texturizados, alinhe o verso ao contorno da arte e faça o apoio coincidir com o chão. Quando um mirante precisa ser acessível, siga o caminho de saliências no código e teste o contato desde a primeira subida.

Use mais detalhes perto da rota principal e nos marcos da vila. Agrupe construções por trecho. Desenhe uma área limitada de sombras em qualidade alta e média e confira o impacto no FPS. Trate a água como superfície com graus de profundidade, ondas direcionais e uma margem legível.

## Chão e acostamentos

Use o mesmo contorno para a transição de material e de altura nas ruas e praças. Mantenha o desenho macro das vias na máscara de cobertura e amostre o atlas de perto no shader. A prévia deve renderizar o detalhe do atlas separado da máscara. Compare o piso de perto e de ângulo baixo no mesmo enquadramento.

## Perímetro, encaixe no terreno e horizonte

A face interna da cerca acompanha o limite de movimento. Apoie os postes na altura local e use a altura da superfície da água para a travessa sobre rios. Mantenha as copas e as colinas do panorama além da área jogável. Enterre o recorte da arte e o verso dos monumentos na encosta, abaixo da linha visível. Valide ângulos baixos, a vista de costas, o apoio da rota e a folga da câmera em relação ao chão.

Para estátuas com silhueta humana, prepare arte própria para o verso no mesmo atlas de escala e apoie o pedestal no chão. Confira de costas e em três quartos. Para itens, use como âncora a base do desenho dentro da margem transparente. Apoie a sombra na inclinação da superfície e reserve o movimento vertical do drop para a coleta.

## Margens, NPCs e variação regional

Subdivida o terreno junto à água e compartilhe os vértices com a malha vizinha. Mantenha o leito em tons contínuos para a transparência revelar profundidade sem quadricular a superfície. Use malhas articuladas para os NPCs de evento, com olhos, cabeça e braços próprios e pés no plano do chão. Confira o clique nas malhas filhas ao girar a câmera.

Use as mesmas faixas de cobertura das ruas para Suna, Iwa e Kiri. Diferencie os bairros pelos marcos, revestimentos e coberturas da região. Posicione os lotes novos fora das áreas de água e teste a ligação entre a praça, os bairros e os pontos secos de evento.
