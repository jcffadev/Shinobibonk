# Personagens, NPCs, cronologia e roadmap

## Personagens existentes no protótipo
**IMPLEMENTADO** em `src/game/heroes.ts` — **24 shinobis jogáveis** na seleção do hub:

Naruto, Gaara, Madara, Hashirama, Sasuke, Sakura, Kakashi, Itachi, Minato, Tsunade, Jiraiya, Orochimaru, Rock Lee, Neji, Hinata, Shikamaru, Temari, Tenten, Pain, Tobirama, Kankuro, Might Guy, Asuma e Kushina.

- **Ficha de cada um**: aldeia (Folha, Areia, Som, Chuva; clãs Uchiha/Hyuga/Nara contam como Folha), atributos base, passiva com bônus, 4 técnicas e Ultimate.
- **Elenco aberto**: não há bloqueio por selamento permanente; todos já estão liberados no protótipo.
- **Evoluções visuais por nível** (`src/game/evolution.ts`): Naruto Academia → Clássico (10) → Shippuden (25) → Manto da Kyuubi (50). Os outros trocam aos 15/20/25/30 conforme o personagem; Pain e Tobirama têm uma forma só. Cada evolução dá +25% do HP base.
- **Passivas com regra especial no combate**: Naruto (dano por HP perdido), Gaara (armadura vira dano), Hashirama (bônus Sábio). As demais são bônus de atributo.
- **Guardiões por zona** (`src/game/missions.ts`): zona 1 Lee/Neji/Temari; zona 2 Kankuro/Kakashi/Orochimaru; zona 3 Gaara/Hashirama/Madara/Pain.
- **Arte** — as 56 formas jogáveis têm caminhada por quadros. Cada forma usa seu próprio sprite estático como referência de roupa, cores e acessórios.

## NPCs e apoios
Shisui: vender/esquecer pílulas e recalcular atributos; Orochimaru: NPC de pacto/risco, não item; Guy: treinamento; sapo sábio: bênção; Ichiraku: fusão de habilidades (planejado). **No código atual** existem como evento: Maldição de Orochimaru, Bênção de Tsunade, **Sharingan de Kakashi** (copia 1 item da bolsa), **Barraca Ichiraku** (esquecer pílulas/técnicas por Ryu; a fusão continua pendente), Caça-níquel (roleta) e Mercador de armas. Shisui, Guy, sapo sábio e Kabuto **não estão implementados**. Apoios possíveis: Sakura, Sasuke, Shikamaru, Neji, Temari, Kankuro, Hinata, Rock Lee e outros, cada qual com buff único e golpe auxiliar. Kabuto/Edo Tensei: tema de encontros de selamento.

## Linha do tempo — 05/11/2026
A conversa disponível não fornece horários confiáveis para cada decisão individual; registrar **data confirmada** sem inventar minutos.
- Mecânicas de Ultimate R/Y, habilidades 1–4 automáticas e proteção de 3s ao subir de nível.
- Economia Lamens, desbloqueios da loja, raridade, limites de cópias e expansão do pool para ~80 itens.
- Remédio do Rock Lee sem penalidade; Shuriken Selo da Tenten; itens para elevar limite de habilidades 9→12.
- Habilidades com geometria e afixos RNG, setup com recarga/duração, ficha residual sem XP%.
- Dois tipos de selamento, aliados com sinergias de vila/equipe, mega-elites e bestas de caudas.
- **Correção posterior**: equipe base 3, +1 por item e +1 por passiva permanente, máximo 5.
- Reafirmação de câmera livre 360° com relevo, hordas contínuas e teto de 1.500 vivos; ficha com origens de buffs; tecla H de performance.

## Próximas entregas, em ordem sugerida
1. Escolher motor 3D leve para WebGL, com terreno em malha, colisão/navegação, câmera orbital livre e sprites billboard mini pixel art.
2. Sistema de entidades e LOD/instancing para benchmark de 1.500 inimigos.
3. Ficha baseada em fontes e HUD de pausa; eventos e minimapa.
4. Sistema de aliados e selamento, ranking local robusto, depois backend de ranking global.
5. Implementar catálogo de 80 itens, habilidades, fusões e balanceamento.

Estado em 05/11/2026:
- Item 1 está **IMPLEMENTADO parcialmente**: Three.js, câmera orbital e billboards existem; colisão, navegação e pulo não.
- Item 2 está **PENDENTE**.
- Itens 3 e 4 estão **parciais**: ficha, eventos, minimapa e aliados em combate existem; ranking e selamento com tentativas não.
- Item 5 está **parcial**: 94 itens e 69 técnicas existem (1–2 únicas por shinobi); fusão não.

## Nota visual
`references/concept_art/` contém artes de **referência visual geradas**, não capturas do jogo. `references/screenshots/` tem capturas do protótipo 2D antigo. `artifacts/` tem screenshots reais da base atual.
