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
