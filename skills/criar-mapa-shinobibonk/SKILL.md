---
name: criar-mapa-shinobibonk
description: Criar ou reformar um mapa do ShinobiBonk (vila, terreno, câmera, cenário de fundo, construções, clima, zonas e guardiões) com o padrão já validado na Vila Oculta da Folha. Use antes de mexer em terreno, horizonte, construções ou num mapa novo.
metadata:
  short-description: Mapas — terreno em terraços, horizonte, vila canônica, construções sem desnível
---

# Criar ou reformar um mapa

Esta skill junta o que foi aprendido nas rodadas 70, 77, 85 e 86, desde as mudanças da Vila Oculta da Folha (Konoha). Leia antes de mexer em `src/game/maps.ts`, `src/scene/terrainArt.ts`, `src/scene/heightField.ts`, `src/scene/collision.ts` ou na parte de cenário do `src/scene/GameCanvas.tsx`.

Siga também, na mesma tarefa:
- `skills/referencia-externa/SKILL.md` se o pedido vier com material do jogo de referência;
- `skills/criar-arte-shinobibonk/SKILL.md` para sprites, atlas e texturas;
- `skills/documentar-projeto/SKILL.md` e `skills/publicar-github/SKILL.md` no fim.

## 1. Pedidos do usuário que valem para todo mapa

- "as montanhas do mapa ainda estão muito grandes, e o terreno deveria ter vários locais para pular, esse terreno todo plano com umas montanhas está bem esquisito" (15/11/2026).
- Câmera "muito distante" no início; o jogador pode afastar, com limite (rodada 77).
- "aumente os ninja para ficar do tamanho dos monstros" (rodada 77): a escala dos atores não muda por mapa.
- Nomes da obra (Narutopedia é a fonte canônica): "Coloque os nomes corretos nos mapas".
- Nada do jogo de referência no projeto: nem nome, nem arquivo, nem valor copiado. No texto versionado, escreva "jogo de referência".

## 2. Onde fica cada coisa

| O quê | Arquivo | Notas |
|---|---|---|
| Ficha do mapa | `src/game/maps.ts` (`MAPS`, `GameMap`) | id, nome, país, símbolo, cores do chão e do terreno, pesos do cenário, climas, 3 zonas com guardiões |
| Relevo | `src/scene/terrainArt.ts` → `groundHeight(map, x, z)` | função exata; o jogo usa a grade de `createHeightField` (passo 0,5 m) |
| Terraços | `TERRAIN` e `terrace()` em `terrainArt.ts` | degrau `step` 2 × 0,58 ≈ 1,2 m, encosta `riser` 22% do degrau, teto `maxInside` |
| Horizonte | `horizonProfile(map, ângulo, distância)` em `terrainArt.ts`, × `TERRAIN.ridge` (0,4) | montanhas só fora de `MAP_SIZE/2`, < 8 m; uma forma por vila (seção 5) |
| Áreas planas | `LEAF_PLACES` (Folha) e `REGIONAL_PLACES` (outros mapas) | chão plano sob construção, com 4–5 m de transição |
| Pintura do chão | `groundArt` em `terrainArt.ts` | grama, trilha, pedra nas encostas (inclinação > 0,55) com estrias, praça e rio |
| Texturas do chão | `public/assets/ground-materials-v1.png` (Folha) e `ground-<id>-v2.png` | atlas 2×2 por superfície |
| Malha do chão | `terrainGeometry.ts` | ~1 m por célula longe da água e 0,25 m perto das margens, com vértices de transição compartilhados |
| Construções e marcos | `GameCanvas.tsx` (`landmarks`, `REGIONAL_PLACES`, `solids.addBuilding`) | sprites com `center (.5,.03)` na altura do chão |
| Árvores e rochas | `scenery()` em `GameCanvas.tsx`, atlas `environment-v2.png` | `MAP.scenery.weights` (árvore, pinheiro, bambu, rocha) e `tint` |
| Colisão | `src/scene/collision.ts` (`COLLISION_RULES`) | raios medidos no desenho; `prune` tira cenário dentro de construção |
| Câmera | `src/game/settings.ts` (`CAMERA_ZOOM`, `CAMERA_VIEW`, `perspectiveDistance`) | perspectiva padrão (60°, 0,46 rad: o topo passa do horizonte), ortográfica nas Configurações |
| Água | `src/scene/water.ts` (`WATER_BODIES`, `carveWater`, `createWater`) | lagos e rios cavados; malha com ondas, cor por profundidade, espuma; os ninjas andam na superfície |
| Paisagem de fundo | `src/scene/landscape.ts` (`LANDSCAPE_SHAPES`, `paintLandscape`) | panorama em pixel art pintado em canvas num cilindro (raio 240) em volta do mapa |
| Escala | `src/game/worldScale.ts` (`MAP_SIZE` 160, `PLAYER_SIZE`, `ACTOR_SCALE`) | não mude por mapa |

## 3. Regras de terreno (o padrão que funciona)

1. **Terraços, não montanhas.** O relevo de base é suave e passa por `terrace()`: platôs planos e encostas curtas. Alvos medidos no teste `tests/cena.test.mjs`:
   - altura máxima dentro do mapa < 5 m (Folha ~4,7 com o monumento; outros ~3,5);
   - mais de 60% do chão plano e de 1,5% em encosta;
   - mais de 30% acima do nível do chão (há degraus para pular).
2. **Montanhas altas só no horizonte**, fora da área de jogo, e baixas (< 8 m). Elas são fundo, não obstáculo.
3. **Começo plano.** Até ~6 m do centro (`calm`) o chão é plano: o ninja nasce em (0, 0).
4. **Construção nunca na beira de um degrau.** Todo ponto com `addBuilding`, estátua ou marco precisa de área plana (`LEAF_PLACES` ou `REGIONAL_PLACES`). Casas próximas ficam numa praça única; áreas planas sobrepostas com alturas diferentes brigam entre si. O teste confere cada coordenada.
5. **Encosta é pedra.** A pintura usa a inclinação (> 0,55) e não a altura; as estrias horizontais dão o paredão em camadas.
6. **Malha fina.** Com degraus de ~1,2 m, a malha do chão precisa de ~1 m por célula (340 × 340), senão os degraus viram rampas serrilhadas.
7. **Caminho livre.** Árvores e rochas nunca no começo (raio 6) nem na trilha (`trailX`), e o `prune` remove cenário dentro de construção.
8. **Desempenho.** `groundHeight` é a função exata e pode ser cara. O jogo usa a grade (`createHeightField`) para inimigos, drops e projéteis. Não chame `groundHeight` por quadro.

## 3.1 Água e paisagem

- Água sempre cavada no terreno (`carveWater`), com margem baixando até o nível 0 em 5 m: nunca uma superfície flutuando sobre terraço. Longe do começo (> 15 m), da trilha e das construções (> 8 m); o teste confere.
- Árvores e rochas não nascem a menos de 1,5 m da água. O leito escuro e a areia da margem têm variação contínua. O shader reduz a opacidade ao se aproximar da borda e mantém as ondas de contato.
- A paisagem de fundo tem uma forma por vila em `LANDSCAPE_SHAPES` (camada longe e perto) e detalhes pintados (Monte Hokage, cachoeiras, estratos, névoa). Mapa novo = nova entrada nos dois e na paleta.

## 4. Câmera

- Perspectiva padrão: campo de visão de 50°, inclinação inicial de 0,5 rad (~29°). O topo da tela mostra o horizonte e as montanhas de fundo.
- O zoom (padrão 12, faixa 8–22) mede a altura visível no ponto do ninja nas duas projeções: `perspectiveDistance(zoom)`.
- A vista antiga (ortográfica, 0,55 rad) fica em Configurações → Controles → Vista da câmera, e vale na próxima missão.
- Barra de vida e números de dano usam `zoom / altura da tela` (vale nas duas vistas).
- O horizonte faz parte do mapa: o que aparece no fundo precisa combinar com a vila.

## 5. Identidade de cada vila (nomes e visual canônicos)

Use o nome da obra. No mapa: "Konohagakure · Vila Oculta da Folha" e o mesmo padrão nas outras. O campo `village` dos personagens é usado para dividir técnicas entre ninjas da mesma vila; não troque esse texto sem revisar `techniquePool`.

| Vila | País | Visual a reproduzir (referências de anime enviadas pelo usuário) |
|---|---|---|
| Konohagakure · Vila Oculta da Folha | País do Fogo | portão principal de madeira com a placa 忍 + símbolo da Folha e portas verdes com os kanji vermelhos; ruas de terra batida rachada; casas redondas de reboco claro com telhado de telhas e caixas-d'água cilíndricas nos telhados; cerejeiras; barraca de lámen com cortina de pano (noren), bancos altos e botijões; prédio do Hokage = torre cilíndrica vermelha em andares com telhados dourados, emblema 火 e base branca; Monte Hokage (rostos esculpidos na rocha) com cúpulas e pinheiros no topo; floresta densa e montes verdes ao fundo, céu claro |
| Sunagakure · Vila Oculta da Areia | País do Vento | vista de cima: vale cercado por paredões de rocha amarela em platôs, com uma única entrada estreita (fenda) e a cidade no fundo; casas redondas de adobe cor de areia com cúpulas, portas em arco escuras e varandas em camadas; becos estreitos entre paredes altas; fios esticados entre as casas; árvores secas, toldos vermelhos, caixotes e cercas de madeira; prédio do Kazekage = grande cúpula esférica com o emblema 風 vermelho num oval branco e fileiras de janelinhas redondas; passarelas elevadas sobre pilares; dunas; névoa de tempestade de areia e luz alaranjada no fim da tarde |
| Iwagakure · Vila Oculta da Pedra | País da Terra | paredões de pedra cinza altos e pontudos com cachoeiras finas e uma faixa de névoa no meio; torres de pedra em cone e cúpula esculpidas na rocha, com telhadinhos roxos, laranja e vermelhos; torre do Tsuchikage com cúpula e símbolo; cabos entre as torres; degraus de pedra |
| Kirigakure · Vila Oculta da Névoa | País da Água | torres cilíndricas de tijolo rosado com vegetação no topo; torre do Mizukage com cúpula de telhas e faixa de janelas; arcos e muralhas; picos de pedra finos ao fundo; névoa densa e úmida, verde-acinzentado |

As descrições vêm de imagens de anime e de vídeos de fãs que o usuário enviou (15/11/2026). Use só como guia de estilo: nenhuma imagem, modelo ou logotipo desses materiais entra no projeto.

Cuidado com lugares fora da vila: a Ponte Kannabi fica no País da Grama, e a Ponte de Tazuna (Grande Ponte Naruto) no País das Ondas. Confira na Narutopedia antes de nomear zona ou guardião.

## 6. Passo a passo para um mapa novo ou uma reforma

1. Leia o contexto (`skills/contexto-e-decisao/SKILL.md`) e esta skill. Confirme na Narutopedia o nome, o país, o símbolo e os lugares da vila.
2. Ficha em `maps.ts`: id, nome canônico, país, símbolo, cores (`terrain.low`, `trail`, `high`, `accent`), pesos e tinta do cenário, 2 climas e 3 zonas com guardiões da obra.
3. Relevo: reaproveite `rollingBase` e `terrace`. Varie só os montes de base (posição e altura) para mudar o desenho do mapa, dentro dos alvos da seção 3.
4. Construções: defina lotes, ruas e fundações planas. Modele o volume com faces e telhado, fixe a orientação no mundo e confira a colisão no contato. Siga o [guia de vilas jogáveis](../../docs/development/CRIAR-MAPAS-JOGAVEIS.md).
5. Horizonte: acrescente um caso em `horizonProfile` com a forma do fundo da vila. Já existem: Konoha (montes arredondados), Suna (paredão de platô com topo reto e borda íngreme), Iwa (picos altos e pontudos, os mais altos), Kiri (agulhas finas). O teste confere a forma de cada um.
6. Arte (atlas de chão, marcos, fundo): siga `criar-arte-shinobibonk`. Nenhum arquivo de referência entra no repositório.
7. Testes sem navegador (`docs/development/TESTING_POLICY.md`): estenda `tests/cena.test.mjs` com os alvos do mapa novo (altura, platôs, horizonte, chão plano sob construções) e acrescente uma mutação em `scripts/mutation-check.mjs`.
8. Rode o perfil EQUILIBRADO (`TESTAR_JOGO.bat`: tipos, testes, build). O que só se vê na tela fica como **PENDENTE DE VALIDAÇÃO E2E**, dizendo o que olhar (degraus, construções no chão, horizonte, câmera, FPS).
9. Documente (CHANGELOG, docs/13, docs/14, docs/18) e publique.

Para marcos citados na obra, desenhe também o espaço público que permite chegar a eles. Reserve o acesso antes de sortear os lotes. Registre locais fixos no mapa com nome e rota. Modele o chão, o apoio e os lados visíveis e confira a praça ou o pátio a partir da rua, com mais de uma semente. Em Konoha, o balanço fica no pátio da Academia e a Pedra Memorial ocupa a clareira a oeste da praça.

## 7. Erros que já aconteceram (não repita)

- Montanhas de 10 m dentro do mapa: ficaram "muito grandes" e bloqueavam a vista.
- Terreno plano com poucos morros: "esquisito", sem lugar para pular.
- Construções em cima da beira de um degrau, flutuando ou enterradas (corrigido na rodada 86 com `LEAF_PLACES`).
- Árvore ou rocha escondida dentro de construção, travando o caminho sem aparecer (rodada 70, `prune`).
- Raio de colisão maior que o desenho: "paredes invisíveis" (rodada 70).
- Teste de regra antigo que exigia um número literal da câmera: ao mudar uma regra a pedido do usuário, atualize a conferência para a regra nova, nunca apague nem afrouxe.


Para escadas definitivas, alinhe pé, espelho e piso do degrau ao perfil da fundação. Cada piso tem uma única superfície visível. Termine no terreno, em uma rua, na entrada de uma construção ou num pátio ligado à rota. Confira a travessia nos dois sentidos e procure superfícies sobrepostas durante a validação.
