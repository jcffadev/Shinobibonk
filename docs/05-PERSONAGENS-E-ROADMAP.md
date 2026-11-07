# Personagens, NPCs, cronologia e roadmap

## Personagens existentes no protótipo
**IMPLEMENTADO** em `src/game/heroes.ts` — **24 famílias de shinobis e 56 versões jogáveis** na seleção do hub (06/11/2026, pedido do usuário: "separar personagens… Naruto Academia, Naruto Genin…"):

Naruto, Gaara, Madara, Hashirama, Sasuke, Sakura, Kakashi, Itachi, Minato, Tsunade, Jiraiya, Orochimaru, Rock Lee, Neji, Hinata, Shikamaru, Temari, Tenten, Pain, Tobirama, Kankuro, Might Guy, Asuma e Kushina.

Sasuke Rinnegan, Itachi Akatsuki e Madara Armadura, Rinnegan e Seis Caminhos usam folhas próprias de conjuração, pulo e dash. A identidade visual de cada folha vem da arte da própria forma.

Sakura Genin, Shippuden e Byakugou têm folhas dedicadas de soco, pulo e dash. As três versões do Gaara compartilham o desenho da cabaça de dois bojos e têm quadros próprios de movimento e palma aberta, cada uma com seu traje. Kazekage e Aliança também flutuam brevemente no salto. As quatro versões do Naruto têm o selo cruzado de mãos para golpes Bunshin.

### Versões separadas (IMPLEMENTADO e TESTADO em `verify-rules`/`verify-runtime`)
- Cada forma de `evolution.ts` virou um **personagem próprio** (`Hero.family`, `Hero.form`, `Hero.title`). O id do shinobi base é a **primeira versão** (`naruto` = Naruto Academia, `sasuke` = Sasuke Genin…); as outras têm id próprio (`naruto-genin`, `naruto-shippuden`, `naruto-kyuubi`…).
- **Sem evolução dentro da run**: a versão fica sempre na própria forma (`formAt` ignora o nível para shinobis jogáveis). A troca de forma passou a ser a troca de personagem, liberada pela cadeia de missões. O bônus de +25% de HP por forma continua valendo para as versões avançadas.
- **Kit da fase**: cada versão só tem técnicas da própria fase da obra (Narutopedia). Técnicas avançadas saíram das versões iniciais (ex.: Naruto Academia não tem Rasengan nem Modo Sábio; Sasuke Genin não tem Amaterasu). Única: 1–2 por versão; a mesma única pode se repetir só dentro da família. Rasengan e Byakugou viraram compartilhadas (vários usuários canônicos).
- **Mais fortes a cada passo**: HP e dano base +12% por passo, +1 armadura e +0,08 de movimento; passivas próprias mais fortes (valores PROPOSTOS). Arte: retrato de `portraitRegion` e folhas de `directionalArt`/`actionArt` da forma da família.
- Versões de uma família não emprestam técnicas entre si; ajudantes e mega elites usam só os shinobis base.

| Família | Versões (id · forma) | Destaques do kit |
|---|---|---|
| Naruto | Academia (`naruto`, 1) · Genin (`naruto-genin`, 10) · Shippuden (`naruto-shippuden`, 25) · Kyuubi (`naruto-kyuubi`, 50) | Kage Bunshin/Rendan → Sapo/Rasengan → Modo Sábio/Rasenshuriken → Bijūdama |
| Sasuke | Genin (1) · Shippuden (15) · Rinnegan (30) | Combo do Leão/Chidori → Espada Chidori/Amaterasu → Susanoo/Flecha de Indra |
| Sakura | Genin (1) · Shippuden (15) · Byakugou (30) | Shannaro! → Impacto de Sakura → Byakugou/Golpe dos Cem Selos |
| Gaara | Genin (1) · Kazekage (15) · Aliança (30) | Caixão/Sepultamento → Grande Sepultamento Imperial → Garra de Areia |
| Madara | Armadura (1) · Rinnegan (15) · Seis Caminhos (30) | Leque/Chamas → Limbo → Esferas da Busca da Verdade |
| Hashirama | Hokage (1) · Sábio (20) | Estacas Mokuton → Modo Sábio/Floresta Profunda |
| Kakashi | Jonin (1) · Hokage (25) | Raikiri → Púrpura Elétrica |
| Itachi | ANBU (1) · Akatsuki (15) | Corvos → Susanoo/Tsukuyomi |
| Minato | Jonin (1) · Hokage (15) | Kunai Hiraishin/Rasengan → Barreira Espaço-Tempo |
| Tsunade | Sannin (1) · Hokage (15) · Byakugou (30) | Palma Mística/Chute Celestial → Byakugou → Criação do Renascimento |
| Jiraiya | Sannin (1) · Sábio (20) | Agulhas de Cabelo/Óleo → Modo Sábio/Goemon |
| Orochimaru | Sannin (1) · Som (15) | Serpentes/Kusanagi → Yamata no Jutsu |
| Rock Lee | Genin (1) · Shippuden (15) · Portões (30) | Lótus Primária → Lótus Oculta → Furacão Dinâmico |
| Neji | Genin (1) · Jonin (15) | Kaiten/64 Palmas → 128 Palmas |
| Hinata | Genin (1) · Shippuden (15) · Leões (30) | Palmas Protetoras → Palma de Ar → Leões Gêmeos |
| Shikamaru | Genin (1) · Estrategista (15) · Conselheiro (30) | Possessão → Costura → Possessão em Massa |
| Temari / Tenten | Genin (1) · Shippuden (15) | Corte do Leque → Dança da Foice · Kunai Explosiva → Leque Bashōsen |
| Kankuro | Genin (1) · Shippuden (15) · Aliança (30) | Karasu/Kuroari → Mil Braços do Escorpião |
| Might Guy | Jonin (1) · Sexto Portão (15) · Sétimo Portão (30) | Entrada Dinâmica → Pavão da Manhã → Tigre do Meio-Dia |
| Pain, Tobirama, Kushina, Asuma | uma versão | sem mudança |

- **Ficha de cada um**: aldeia (Folha, Areia, Som, Chuva; clãs Uchiha/Hyuga/Nara contam como Folha), atributos base, passiva com bônus, 4 técnicas e Ultimate. Clã, naturezas, organizações e afinidade vêm da família (`familyOf`).
- **Passivas com regra especial no combate**: Naruto (dano por HP perdido, por versão em `DETERMINATION`: 20/25/25/30%), Gaara (armadura vira dano), Hashirama (bônus Sábio), Tenten (×1,5 em neutras/projéteis). Valem para todas as versões da família. As demais são bônus de atributo.
- **Guardiões por zona** (`src/game/missions.ts`): zona 1 Lee/Neji/Temari; zona 2 Kankuro/Kakashi/Orochimaru; zona 3 Gaara/Hashirama/Madara/Pain.
- **Arte** — as 56 versões têm caminhada por quadros. Cada forma usa seu próprio sprite estático como referência de roupa, cores e acessórios.
- **Ações** — Naruto Academia tem arremesso, pulo e dash próprios; Naruto Genin/Shippuden/Kyuubi têm conjuração; Sasuke Genin tem arremesso, salto e dash; Neji tem salto e dash nas duas versões; Rock Lee e Might Guy têm socos e chutes por versão. Onde falta folha, `playerMotion` usa pose procedural (squash/stretch no pulo, inclinação e rastro no dash). A lista de folhas que faltam para o Codex está em `docs/13`.

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
- Item 5 está **parcial**: 94 itens e 97 técnicas existem (1–2 únicas por versão); fusão não.

## Nota visual
`references/concept_art/` contém artes de **referência visual geradas**, não capturas do jogo. `references/screenshots/` tem capturas do protótipo 2D antigo. `artifacts/` tem screenshots reais da base atual.


## Afiliações por fase · 07/11/2026

A filiação usada pelos filtros e combos considera a fase representada. Itachi ANBU fica fora da Akatsuki. Naruto Academia fica fora do Time 7. Os Narutos disponíveis ficam fora dos Hokages. Minato e Tsunade só entram como Hokage nas respectivas versões. Orochimaru Sannin usa Konoha, e Orochimaru do Som usa Otogakure. Sasuke Shippuden representa Taka. Versões avançadas da guerra podem compor a Aliança Shinobi.

O recorte das fases do jogo é uma interpretação das afiliações narradas. As fontes descrevem a história e o treinamento médico de Sakura após a fase Genin. Percentuais de combos são regras próprias do protótipo. [Team 7](https://naruto.fandom.com/wiki/Team_7_(Kakashi)), [Taka](https://naruto.fandom.com/wiki/Taka), [Aliança Shinobi](https://naruto.fandom.com/wiki/Allied_Shinobi_Forces), [Sakura](https://naruto.fandom.com/wiki/Sakura_Haruno), [Itachi](https://naruto.fandom.com/wiki/Itachi_Uchiha), [Orochimaru](https://naruto.fandom.com/wiki/Orochimaru).

A antiga nota deste documento que atribuía fusão ao Ichiraku está superada. Ichiraku remove técnicas e pílulas. A oficina dos Sapos Sábios realiza Fundir/Combinar, uma operação por zona.
