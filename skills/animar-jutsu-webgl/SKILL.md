---
name: animar-jutsu-webgl
description: Cria e revisa efeitos Three.js/WebGL de jutsus do ShinobiBonk, alinhando pose, trajetória, natureza, área de acerto, impacto e prévia ao anime.
---

# Animação dos jutsus no ShinobiBonk

Leia a [auditoria de efeitos](../../docs/24-AUDITORIA-DE-EFEITOS.md). Confira a técnica e o usuário na Narutopedia ou na fonte oficial citada na auditoria. Use a versão da obra que corresponde ao personagem jogável. Siga a skill `criar-arte-shinobibonk` para a arte original e a skill `movimentar-shinobi` para a pose.

1. Parta do ID, nome e forma em `src/game/heroes.ts` ou `rosterExpansion.ts`. Abra `GameCanvas.tsx`, `techniqueEffects.ts`, `particleFx.ts` e a prévia em `TechniquePreview.tsx`. Rastreie o preparo, o lançamento, o acerto e a expiração. Confirme se já existe efeito dedicado para preservar o que funciona.
2. Escolha formas e movimento coerentes com a técnica. Uma esfera na mão, um projétil, uma invocação e um campo persistente têm origens e silhuetas diferentes. Use o emissor atual para conjuração, rastro, impacto e aura. Para um efeito articulado em camadas, use a sequência do `susanooFx.ts` como referência de implementação.
3. Trabalhe em unidades de mundo. Posicione a origem na mão, boca ou ponto do solo já usado pelo golpe. Passe a direção e o centro reais. Derive a área visível e o impacto dos mesmos dados usados para acertar. Use `techniqueAreas.ts` para ler a área no chão e preserve as regras de dano, tempo e status durante a revisão da arte.
4. Para invocações ou clones, use sprites com a própria animação. Preserve contato com o alvo, impacto e recuperação. Tintas, partículas e geometria acompanham o relógio da cena. Reaproveite geometrias e buffers, limite emissores vivos e descarte recursos ao sair. Verifique a tecla H e as opções de gráficos.
5. Reuse as fases na prévia da habilidade. Valide a área e a ordem das fases com testes Node e a política do projeto. Registre em changelog a fonte visual, os casos conferidos em jogo e o que falta ver.

Referências de seleção de técnicas [UOL Start](https://www.uol.com.br/start/listas/os-13-jutsus-mais-legais-de-naruto.htm), [Legião dos Heróis](https://www.legiaodosherois.com.br/lista/os-10-jutsus-mais-poderosos-de-naturo.html) e [Animativa](https://www.animativa.com/pt-br/blog/os-jutsus-mais-poderosos-de-naruto/).

## Mecânica e pose de conjuração

- Identifique a execução na obra, a versão do usuário, o alcance, a forma e o efeito. Mantenha a função reconhecível em combate e na prévia, como a atração do Banshō, a repulsão do Shinra e o núcleo do Chibaku. Ajuste dano, chance e duração conforme a curva do jogo.
- O controlador de casting deve acionar preparação de mãos desde o começo e manter a sequência até o lançamento. A regra vale ao incluir ou revisar qualquer versão, tanto no jogador quanto em ajudantes, mega-elites, guardiões, totens e personagens de eventos. Preserve preparações e finalizações próprias de cada golpe. Confira a folha real e a duração do casting de cada papel.
- Integre preparo, movimento, impacto, reação do alvo e dissipação. O ícone pode servir à interface. Use quadros ou malha animada na execução, com área e impacto no ponto real de acerto. Confira o resultado em partida e na prévia.
- O efeito próprio começa com até 10% no Nv. 1 e cresce pelo nível da técnica e pelos buffs da missão. Para ataques sem efeito, confira chance e dano crítico por nível. Em fusões, aplique o teto até Nv. 7 e use a mesma fórmula e descrição no plano e na oficina.
- Para Kekkei Genkai, confirme as duas naturezas e a execução do jutsu na Narutopedia e, quando disponível, em fonte oficial. Receitas futuras entram se as naturezas forem sustentadas pela obra. O plano depende do pool daquele shinobi, e a oficina exige os dois Ninjutsu aprendidos. O desbloqueio por fusão é uma mecânica do ShinobiBonk e não concede linhagem ou amplia o pool ordinário.
- Em dōjutsu, identifique olho, portador e forma. Kamui compartilha o desenho com Obito e Kakashi, o Kotoamatsukami usa o de Shisui e Amaterasu varia entre Itachi e Sasuke. Siga o atlas do projeto e mantenha a diferença entre ícone do olho e efeito real da técnica.


Para os Susanoo, confirme portador, versão, cor e armamento antes de reutilizar um rig. Consulte a [tabela de fontes](../../docs/24-AUDITORIA-DE-EFEITOS.md#susanoo-por-portador--23112026). Alinhe a fase de impacto da técnica comum à espera real do acerto. Quando o efeito existir apenas numa animação especial ou num jogo licenciado, registre a mídia da referência.
