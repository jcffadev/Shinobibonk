---
name: criar-personagem-3d
description: Cria e revisa personagens 3D chibi do ShinobiBonk a partir da pixel art da versão, da prancha de referência à malha, rig e animação. Use para protótipos de personagens e NPCs em 3D.
---

# Personagens 3D chibi

## Referência e prancha

1. Recorte a forma exata do atlas do jogo. Use a vista em três quartos e as vistas reta de frente, perfil e costas. A referência do Naruto Academia está em `public/assets/naruto-academia-diagonal-v1.png` e `public/assets/shinobi-motion/naruto-academia-cardinal-v2.png`. Preserve a fase, a proporção, a silhueta e o traje. Consulte a [skill de arte](../criar-arte-shinobibonk/SKILL.md).
2. Passe os recortes ao ImageGen e peça uma figura chibi anime com escultura estilizada e luz difusa. Use quatro vistas ortográficas do mesmo personagem, de frente, três quartos, perfil e costas, com os pés alinhados e braços ligeiramente afastados. No Naruto Academia, use a cabeça com cerca de 46% da altura, incluindo o cabelo. Preserve mechas loiras, óculos escuros com aros metálicos, olhos azuis, três marcas de cada lado do rosto, gola clara canelada, pala azul, roupa laranja e sandálias azul-escuras.
3. Para testar a aparência em movimento, use a prancha como referência de edição. Peça uma folha transparente 4×2 em três quartos, com a mesma altura, rosto, paleta e lente da câmera nos oito quadros. Use duas passadas alternadas, com contato, passagem, extensão e suspensão. Mantenha o tronco inclinado e os braços para trás. Recorte as células, alinhe a altura do apoio e monte um GIF para revisão.

## Malha, animação e aceite

Use Blender portátil em modo de linha de comando para preparar UVs, conferir clipes e exportar GLB quando a edição local estiver disponível. Os onze estudos de reconstrução e projeção de atlas foram reprovados por emendas, deformação do rosto e gestos rígidos. Os estudos com volumes arredondados de Teuchi e Shikamaru também foram reprovados. A revisão no Blender usa cortes próprios da silhueta, cabelo e rosto modelados, dobras no tecido, juntas articuladas, sombreamento em faixas e contorno. Compare sprite e malha em repouso na mesma escala de tela. Renderize a interação com câmera fixa e mais uma volta completa para verificar o volume, o figurino e os apoios. Guarde o arquivo `.blend` editável e a prévia fora do jogo até a revisão do usuário.

- Trate a prancha e a sequência de imagens como referência visual. Avance para uma malha de volume real quando a aparência fizer sentido para a versão. No Blender, modele e ajuste a silhueta das quatro vistas. Use UVs, materiais e formas separadas onde o personagem pede volume, como mechas, gola e óculos. ZBrush pode servir para escultura, com retopologia e rig na etapa seguinte.
- Preserve as junções orgânicas entre braços, pernas e tronco. O teste com projeções do atlas produziu faixas. O teste com volumes simples em OpenGL perdeu o rosto e as dobras da roupa. Use ambos como diagnóstico durante a comparação com a referência.
- Exporte GLB com materiais e clipes nomeados. Confira repouso, corrida com os braços para trás e os clipes específicos da função do personagem. Para NPCs, confira apoio dos pés, olhar e interação. Para capturáveis, entregue impacto, mão no peito, apoio no joelho e espera do selamento. A folha dedicada por versão segue a [skill de arte](../criar-arte-shinobibonk/SKILL.md#derrota-e-selamento). Compare de frente, costas e perfil e no tamanho de jogo.
- A prévia inicial fica separada do jogo. Após a aprovação da malha e dos clipes, valide iluminação, sombras, oclusão e custo em todos os ângulos e com a cena cheia. Renderize com a GPU quando disponível. OpenGL e WebGL ajudam a conferir o resultado. Documente quais imagens são conceito, quais são quadros reais da malha e qual versão foi integrada.
