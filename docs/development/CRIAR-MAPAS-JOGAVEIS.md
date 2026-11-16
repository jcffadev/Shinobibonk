# Criar mapas jogáveis no ShinobiBonk

## Partir da imagem da seleção

1. Separe a ilustração da vila em `public/assets/map-previews-v1.png` e identifique entrada, ruas, praça, marco principal, curso d'água e fundo. As referências da obra e os atlas correspondentes estão na [skill de mapas](../../skills/criar-mapa-shinobibonk/SKILL.md).
2. Desenhe a planta em metros. Marque o início da missão, a entrada, as ligações entre bairros, as praças e os pontos de NPCs. Dê a cada prédio uma base visível e deixe espaço para contorná-lo. Mantenha a origem da missão acessível e coloque a vila no próprio espaço de jogo.
3. Gere uma vista com o campo de visão e os limites de zoom da missão. Compare lado a lado com a imagem da seleção. A vista deve mostrar o caminho do jogador. Um render isolado antecipa a composição antes de integrar a jogabilidade.

## Montar a vila

`src/scene/villageLayout.ts` concentra os acessos e posições de cada vila. O fundo, a ficha do mapa e o clima continuam nos módulos de cenário e mapas do jogo. Preserve os IDs das vilas para desbloqueios, ranking e campanhas salvas.

| Vila | Pátio e circulação | Marco e horizonte |
|---|---|---|
| Konoha | Rua de terra atravessa o portão da muralha e alcança a praça | Casas de telha e torre cilíndrica diante do Monte Hokage |
| Suna | Vão na muralha leva às ruas e casas de adobe | Sede do Kazekage no eixo, terraços e arcos de pedra nas bordas |
| Iwa | Vão de pedra, praça e pontes entre as plataformas | Fortaleza redonda e picos atrás dos terraços |
| Kiri | Ruas nas margens do canal, praça e três passagens em arco | Casas de telhado azul, torre do Mizukage e quedas d'água |

Os contornos dos bairros são de aproximadamente 52 × 50 m, 62 × 55 m, 60 × 57 m e 62 × 54 m, na mesma ordem. São dimensões da planta, incluindo as construções. O quadrado de origem da missão e o limite físico do mapa seguem `worldScale.ts`.

1. Em `villageTerrain.ts`, mantenha a entrada plana, o início livre e o terreno interno baixo. Use terraços para dar espaço ao pulo. Calcule platôs sob as bases das casas. Alinhe a máscara de chão à rede de ruas e praças. O jogo amostra as alturas numa grade antes da partida.
2. Em `villageScenery.ts`, escolha o recorte do atlas ou construa uma malha simples. Meça a base em XZ. Use um retângulo para muros e um círculo para troncos, rochas ou bases redondas. Registre a altura da parte escalável. Deixe livres o vão do portão, os espaços de acesso e a passagem entre imóveis.
3. Em `villageLayout.ts`, defina locais de NPCs e eventos com acesso a pé e espaço de interação. O jogo escolhe apenas locais livres. Verifique o Guardião, os portais, os altares e os eventos de clima. A chegada a uma nova zona volta à entrada.
4. Para canais, registre o corpo d'água em `villageTerrain.ts` e o tabuleiro da ponte em `villageLayout.ts`. Use a mesma função de altura para desenhar a ponte e posicionar os personagens. Confirme que as duas pontas encostam na margem e o arco passa acima da superfície.
5. Confirme o percurso pelo lado de fora, a aproximação e a escalada. Na vila, **Espaço** junto à base agarra a superfície. Segurar a direção de avanço sobe. **Espaço** solta. O telhado sustenta o personagem até sair pela borda. Confira o contato também no dash e a retomada de save no alto.

## Comparar com o Mapa Protótipo

Na cópia de validação, o menu inicial tem **Mapa Protótipo**. Konoha tem uma rua, praça, portão, casas e Iruka. A câmera permite arrastar e escalar o zoom com o scroll. **R** demonstra um selo. Alterne o Naruto Shippuden original e a malha low poly para avaliar a leitura dos dois.

O atlas de teste em `public/assets/prototipo-konoha/` contém `materiais-4096.jpg` e a redução para 1.024 × 1.024. O gerador original é `src/prototype/gerar_atlas.py`. A comparação preserva a malha e o enquadramento. Os tamanhos se referem ao atlas inteiro, compartilhado entre os materiais.

**Medir desempenho** executa 24 combinações de avatar, atlas, 0/400/1.600 instâncias e efeitos de teste ligados ou desligados. O relatório registra FPS médio, 1% low, p99 do tempo de quadro, triângulos, chamadas de desenho e resolução real do buffer. Ele mede a carga gráfica de um avatar e uma horda instanciada, com efeitos de amostra. A avaliação de uma missão completa precisa do loop de combate e dos efeitos do jogo.

## Validar e preservar versões

- A versão jogável anterior está no ref `mapas_basicos`, em `c7581be`. Saves existentes sem o campo `mapLayout` retomam no cenário anterior. Saves criados nas novas vilas registram o layout e o apoio elevado.
- Execute `TESTAR_JOGO.bat equilibrado` conforme a [política de testes](TESTING_POLICY.md). A suíte inclui a geometria, a navegação desde a origem, as bases de colisão, as pontes, os NPCs e a matriz de desempenho. Documente o resultado.
- A validação em partida deve conferir visual, fluidez em hardware real, telhados, missões e portais. Pode ser feita manualmente em qualquer navegador compatível com WebGL 2, respeitando a decisão atual sobre automação. A versão de validação fica separada da versão principal até esse aceite.
