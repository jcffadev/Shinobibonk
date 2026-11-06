# Arquitetura e estado do código

Atualizado em 05/11/2026 após leitura do código, `tsc -b`, `vite build` e `scripts/verify-rules.mjs`. Este é o inventário da base presente, não uma promessa de produto final.

## Mapa de arquivos

`directionalArt.ts` registra as folhas por shinobi e nível da forma. Os 24 shinobis jogáveis têm caminhada com quatro quadros de frente e quatro de costas por forma, com espelhamento em X. A pose parada continua usando o sprite de `portraitRegion`, referência para a caminhada. Nas folhas que reúnem formas, `firstRow` aponta para o primeiro quadro de frente da dupla de fileiras. A textura é carregada e reutilizada por caminho durante a missão. `terrainArt.ts` define a cadeia de montanhas fora da área jogável e o céu em gradiente. `choiceCount` concentra o teto de quatro ofertas. A lista da roleta exclui pílulas dos novos giros.

O fluxo de movimento usa `playerMotion.ts` para selecionar poses conforme o estado. `playerPose.ts` ajusta pernas e braços nos UVs da forma atual e mantém a câmera independente. `evolution.ts` aponta o Asuma para `public/assets/asuma-motion-v1.png`, folha original 4×4. A fila de recompensas fica em `GameCanvas.tsx` e aparece em `ItemTradeDialog.tsx`. O snapshot separa o total de inimigos (`enemyCount`) dos marcadores limitados do mapa (`enemies`).

`actionArt` aponta para os atlases 4×2 de ações por forma. `playerMotion` seleciona a segunda fileira pela direção no Naruto Clássico, pela ação de pulo/dash no Sasuke inicial e pelo chute no Lee/Guy. `SavedRun.pillQuality` guarda somente o bônus extra de raridade, separado de `knownPills`. Saves anteriores sem o campo mantêm os níveis e seus bônus base.

| Caminho | Responsabilidade |
|---|---|
| `index.html` | Entrada HTML do Vite, com o root React. |
| `src/main.tsx` | Componente `App`: páginas do hub, estado local (herói, carteira, árvore, desbloqueios, arquivamentos, plano), HUD da run, mapas, cartas de recompensa, selamento e telas de vitória/derrota. |
| `src/scene/GameCanvas.tsx` | Cena Three.js e simulação da run inteira; envia `WorldSnapshot` para o React. |
| `src/scene/bossCombat.ts` | Chefes: barra de vida 3D e técnicas dos mega elites/guardiões com aviso no chão (`BOSS_RULES`). |
| `src/scene/techniqueEffects.ts` | Geometria original por golpe e elemento, orientação na direção do ataque, rotação de efeitos, raios de impacto e descarte de recursos. O limite local de efeitos de impacto evita criar uma malha por inimigo em hordas grandes. |
| `src/game/heroes.ts` | 24 famílias e 56 versões jogáveis (`HERO_VERSIONS`; `family`, `form`, `title`; `familyOf`, `familyVersions`, `DETERMINATION`): aldeia, atributos base, passiva, bônus, 4 técnicas da fase (escola, elemento, forma, status), Ultimate. Bibliotecas `L` (compartilhadas) e `U` (únicas por família). `skillPool` respeita elemento, vila e selamento; versões da mesma família não emprestam técnicas. `sandSynergy` por família. Formas do Naruto. `HERO_CLAN`, `ORGANIZATIONS`, `HERO_NATURES` (naturezas canônicas da Narutopedia) e `heroAffinity`. |
| `src/game/catalog.ts` | 94 itens no formato da referência (raridade, custo, limite, bônus), `StatKey` com as chaves de mecânica, `availableItems` e `rollItems` (pesos por raridade afetados por Sorte). |
| `src/game/progression.ts` | `calculateStats` (recalcula tudo das fontes: base, nível, evoluções, itens, pílulas, árvore, buffs da run), `difficultyAt`, `incomingDamage`, `rollCritical`. |
| `src/game/progression.ts` (nota) | `Stats.extra` guarda a soma bruta de todos os bônus; `genjutsu` é o multiplicador da escola Genjutsu; `healthPct` e `regenMult` ajustam HP máximo e regeneração. |
| `src/game/combat.ts` | Afixos de técnica por raridade (`rollGrowth`) e classificação de itens para filtros. |
| `src/game/evolution.ts` | Formas de cada família, recorte de retrato nos atlas e nível de desbloqueio das técnicas. `formAt` devolve sempre a forma fixa da versão (sem evolução na run); `portraitRegion`/`spriteFile` aceitam id de versão e usam a família. |
| `src/game/preparation.ts` | 24 nós das Passivas Shinobi (seções Treinamento e Equipe da partida; `passiveCost`, `homeCapacity`, `prioritySlots`, `jiraiyaSlots`/`jiraiyaRolls`), usos de atualizar/pular/banir, preço das kunais, carteira administrativa (999.999), compra e reembolso. |
| `src/game/missions.ts` | Três zonas: nome, início, tempo do guardião e guardiões possíveis; `GUARDIAN_RULES` e `guardianHpMultiplier(zoneElapsed)` (0,6× → 1,0× aos 160 s). |
| `src/game/npcs.ts` | Ebisu e Iruka: `NPC_RULES`, `LEGENDARY_VALUES`, `TOTEM_RULES`, sorteio de trocas, `NPC_ALLIES.iruka`, `NPC_NAMES` e `NPC_PORTRAITS` (sprites pixel art `public/assets/shinobis/iruka-1.svg` e `ebisu-1.svg`, gerados por `node scripts/generate-sprites.mjs --npcs`). Telas de escolha: −3 Ebisu, −4 menu do Iruka, −5 pergaminho lendário. |
| `src/scene/narutoTotem.ts` | Barra 3D do Naruto Totem (nome, HP, segundos restantes). |
| `src/game/roulette.ts` + `src/ui/TsunadeRoulette.tsx` + `src/tsunade-roulette.css` | Roleta da Tsunade: casas, pesos por sorte/dificuldade, custo crescente e overlay. |
| `src/scene/dropSprites.ts` | Sprites procedurais (canvas) dos drops: essência roxa de XP (3 tamanhos), orbe azul de chakra, moeda 両 de Ryu, tigela de lamen de cura (`RAMEN_DROP` em GameCanvas: até 5%/35%), pílula e pergaminho. Hooks `dropShowcase`/`drops`. |
| `src/ui/MapOverlay.tsx` + `src/map.css` | Ícones do mapa M/Tab e do minimapa, rota/ping, seta e metros na HUD, "Chegou!". Evento `shinobi-route`. |
| `src/ui/MissionBag.tsx` + `src/game/missionBag.ts` + `src/mission-bag.css` | Bolsa da Missão: abas, busca, botões de raridade, "em casa", prioridade, sub-aba "Itens em casa" (até 12 listas com nome e descrição, em `sb_bag_presets_v1`) e hudzinho do hub. |
| `src/ui/BuffText.tsx` | Pinta ganhos em verde e perdas em vermelho nos textos dos cards. |
| `src/game/maps.ts` + `src/maps.css` | 4 mapas temáticos (`MAPS`, `MAP_BY_ID`), zonas e guardiões por mapa; CSS do seletor de mapas, seleção bloqueada e pausa. |
| `src/game/unlockMissions.ts` | Missões de desbloqueio por shinobi (`UNLOCK_MISSIONS`, `LEGENDARY`) e cadeia das versões (`VERSION_MISSIONS`, campo `playWith`). `missingRequirements` inclui a versão anterior bloqueada. O spawn fica em `accountCandidates()` do `GameCanvas`. |
| `src/game/account.ts` | Conta: iniciais, desbloqueados, selados, pesquisa e progresso por mapa (`isDifficultyUnlocked`, `markMapCompleted`). |
| `src/game/enemyTiers.ts` | Tipos de inimigo e saque por HP/dificuldade. |
| `src/scene/playerMotion.ts` | (Codex, EM ANDAMENTO) Movimento do jogador: direção pela câmera, diagonais normalizadas, pulo (Espaço, 0,54 s, 1,3 m), dash/deslize (Shift, 0,24 s, 2,6×, recarga 0,9 s, 0,14 s invulnerável), quadros de caminhada/arremesso/pulo/dash do Naruto Academia. Pulo e dash têm prioridade sobre o estado de dano; squash/stretch no pulo e rastro de duas cópias no dash do jogador. Folhas por família e forma da versão. |
| `src/scene/terrainArt.ts` + `public/assets/ground-materials-v1.png` | (Codex, EM ANDAMENTO) Materiais do chão e bordas do mapa; validação visual final pendente. |
| `src/game/worldScale.ts` | (Codex) Escala do mundo: mapa de 160 m, limite, duração de zona (600 s), escala dos atores e alcance de ataques. |
| `src/game/bijuu.ts` + `public/assets/bijuu-atlas-v1.png` + `public/assets/bijuu/` | Dados das nove bijū e texturas. Chōmei e Gyūki têm texturas próprias. Os outros sete continuam no atlas 3×3. |
| `src/game/powerlevel.ts` | (Codex) Recompensa extra por nível quando não há upgrades elegíveis (+0,8% conforme relatório do Codex); recalibração de atributos até o nível 50 pendente. |
| `src/game/ranking.ts` | (Codex) Ranking local por mapa/dificuldade (`sb_local_ranking_v1`, top 25). |
| `src/game/itemTrade.ts` + `src/ui/ItemTradeDialog.tsx` | (Codex) Compra/venda de itens por raridade na run. |
| `src/game/inventoryArt.ts` + `scripts/generate-inventory-icons.mjs` + `public/assets/inventory*` , `pills-v3.png` | (Codex) Atlas de ícones de itens e pílulas, com layout fixo por ID. |
| `public/assets/shinobi-folha-v3.png`, `sakura-genin-v1.png`, `naruto-academia-*-v1.png`, `leaf-landmarks-v1.png`, `map-previews-v1.png` | (Codex) Artes novas: elenco da Folha, Sakura Genin, caminhada/diagonal/arremesso do Naruto Academia, marcos da Folha e prévias dos mapas. Integração parcial (ver docs/13). |
| `src/game/settings.ts` + `src/ui/SettingsScreen.tsx` + `src/settings.css` | Configurações completas (som, gráficos, tela, controles, teclas remapeáveis via `translateKey`, interface, conta) em `sb_settings_v1`; `currentSettings()` lido ao vivo pela simulação e pelo som. |
| `src/game/synergy.ts` | Sinergias de vila e organização: `activeSynergies(heroId, allies)`, `synergyBonuses`, `synergiesOf`. Faixas 2/3/4+ membros. |
| `src/ui/CharacterSelect.tsx` + `src/character-select.css` | Seleção de shinobi em grade de retratos com filtros por vila, elemento, organização/clã e busca; `CharacterTags` para o painel de detalhes. |
| `src/game/pills.ts` | Catálogo de 20 pílulas, seis espaços distintos na run, limite base de dez níveis por tipo e potência por raridade. `grantPill` sempre concede um nível. |
| `src/game/pillPreview.ts` + `src/ui/PillStatPreview.tsx` | Prévia "atributo atual → novo" das pílulas (cartas de level-up, ficha P, plano de build, tooltip da barra), com as regras de `calculateStats`. |
| `src/game/tuning.ts` | 41 parâmetros de balanceamento do debug (`DEFAULT_TUNING` = 1) em 5 grupos: Inimigos, Elites e Mega Elites, Personagem (todos os atributos), Ganhos (EXP, curva de EXP, Ryu, Chakra, saque de elites), Drops e mapa (chances, lamen, kunais no chão, preço da kunai). Valem como base Genin; `MISSION_TIER` multiplica por cima. Inclui limites, persistência, `replaceTuning` (colar JSON), `tuneThreat` e `dropChance`. `activeTuning()` devolve sempre os valores salvos, com ou sem o painel. |
| `src/ui/RunSheet.tsx` | Ficha da run (P), ícones de item/pílula e retrato do herói; exporta os grupos de atributos. |
| `src/ui/RunSummary.tsx` + `src/summary.css` | Tela de resumo pós-run (vitória/derrota), derivada do `WorldSnapshot`, com a faixa de Lamens ganhos. |
| `src/game/allies.ts` | Buff passivo único de cada um dos 22 shinobis como ajudante (`ALLY_BUFFS`), soma escalada pela força de suporte (`alliesBonuses`) e texto do cartão (`allyBuffText`). |
| `src/game/rewards.ts` | `runLamens(result, mission)`: Lamens por desempenho (`LAMEN_RULES`). Em `main.tsx`, um `useEffect` credita o total na carteira uma única vez por `runId` (via `useRef`); `spent` não muda, então o Reset não remove Lamens ganhos. |
| `src/hud-dock.css` | Bloco inferior esquerdo: pílulas acima das habilidades, mais a posição da ajuda de teclas. |
| `src/hud-layout.css` | Alinhamento do HUD em jogo (importado por último, seletores `.game-shell`): barra da missão em blocos, rótulo do minimapa, posição do selo DEBUG, contador dos itens e SINERGIAS recolhível. |
| `src/ui/DebugPanel.tsx` + `src/debug.css` | Painel de debug (F9) e tipos `DebugApi`/`DebugLive`. |
| `src/ui/PillIcon.tsx` | Cápsula colorida com o glifo da pílula, em CSS inline. |
| `src/ui/BuildPlanner.tsx` | Plano pré-run: planejar ou deixar em casa técnicas, pílulas e itens. |
| `src/ui/PoolFilters.tsx` | Filtros de busca, raridade, escola, elemento, forma, atributo e aldeia. |
| `src/ui/SkillIcon.tsx` | Ícone desenhado por técnica. |
| `src/audio/sfx.ts` | Sons procedurais via Web Audio. |
| `src/style.css`, `src/run-ui.css`, `src/sealing.css` | Hub, HUD/ficha/cartas e ritual de selamento/AUTO. |
| `public/assets/shinobi-roster-v2.png` | Retratos base do elenco (grade 5×5). |
| `public/assets/shinobi-evolutions-v2.png` | Retratos das formas evoluídas (grade 6×5). |
| `public/assets/shinobi-motion/*.png` | Folhas de caminhada dos 20 shinobis adicionados ao lote do Time 7 e Asuma. Quatro colunas por folha e duas fileiras por forma registrada. |
| `public/assets/shinobis/*.svg` | Sprites SVG por shinobi/forma (`<id>-<nível>.svg`). |
| `public/assets/environment-v2.png` | Árvores, rochas, portão, construções e objetos de evento. |
| `public/assets/shinobi-sprites-atlas.png` | Atlas legado. Inimigos comuns usam a folha animada `shinobi-enemy-motion-v1.png`. |
| `public/assets/item-icons-atlas.png` | Ícones de itens (via CSS). |
| `public/assets/orochimaru-sprite.svg`, `icons/kunai.svg`, `icons/shuriken.svg` | Sprite antigo de Orochimaru; ícones de kunai/shuriken no chão. |
| `scripts/verify-rules.mjs` | Asserções de regras puras; grava `artifacts/rules-checks.json`. |
| `scripts/verify-runtime.mjs`, `scripts/smoke-browser.mjs` | Testes no navegador com Playwright + Edge; caminhos fixos deste PC. |
| `scripts/integrate-*.mjs`, `scripts/finalize-integration.mjs`, `scripts/add-runtime-checks.mjs`, `scripts/generate-sprites.mjs`, `update-*.mjs` (raiz) | Scripts de migração já aplicados pelo Codex (edição por substituição de texto). Não reexecutar. |
| `artifacts/` | Screenshots reais da base atual e resultados JSON dos testes. |
| `game/index.html` | Protótipo Canvas 2D legado; não carregado pelo Vite. |

## Fluxo de execução e estado

1. `index.html` carrega `src/main.tsx`.
2. `App` escolhe a página: `home`, `characters`, `attacks`, `build`, `passives`, `items`, `missions`, `preview` ou `game`.
3. Ao iniciar a missão, `App` cria um `GameCanvas` novo (chave `runId`) com herói, dificuldade, pool de itens e preparação (`permanent`, técnicas e pílulas arquivadas).
4. `GameCanvas` roda a simulação no loop do renderer e envia um `WorldSnapshot` a cada 0,2 s. O React usa esse snapshot para a HUD, mapas, ficha e cartas.
5. As teclas são tratadas em `GameCanvas`. Os botões da UI disparam `KeyboardEvent` sintéticos (por exemplo, F/X/Z, 1–4 e R). O clique no mapa dispara o evento `shinobi-ping`, e o selo AUTO dispara `shinobi-toggle-auto-ult`.
6. A simulação para quando há painel aberto, carta de recompensa, derrota ou vitória. O ritual de selamento congela o relógio e os spawns.
7. Persistência apenas em `localStorage`:
   - `sb_hero`: herói selecionado.
   - `sb_admin_wallet_v1`: saldo e total gasto.
   - `sb_permanent_levels`: níveis da árvore permanente.
   - `sb_unlocked_items`, `sb_archived_items`, `sb_archived_skills`, `sb_archived_pills`, `sb_planned_attacks`: desbloqueios, arquivamentos e plano.
   - `sb_debug_tuning_v1`: parâmetros de balanceamento salvos pelo debug, aplicados em **todas** as runs deste navegador.
   - Não existe mais login nem sessão admin. A chave antiga `sb_admin_session_v1`, se existir, é ignorada.
8. Não há save de run, backend ou conta online.
9. Com `pnpm dev` e `?test` na URL, `window.__shinobiTest` expõe ganchos de teste (dar item, gerar inimigo, ajustar nível/tempo/dinheiro, inspecionar estado).
10. **Modo debug**
    - **Ativação**: `main.tsx` passa `debug={import.meta.env.DEV}` ao `GameCanvas`. Só no servidor de desenvolvimento ele renderiza o `DebugPanel` e entrega a API do painel (separada de `__shinobiTest`). A build de produção não tem painel.
    - F9 ou `Backquote` (a tecla à esquerda do 1) abre e fecha o painel.
    - **Parâmetros**: `activeTuning()` devolve sempre os valores salvos, então os ajustes valem no meio da run e nas runs seguintes, com o painel aberto ou fechado. Onde cada um entra:
      - HP, dano, velocidade, spawn e teto dos inimigos: em `threatNow()` = `tuneThreat(difficultyAt(...))`. Quando o HP muda, o loop reescala também o HP dos inimigos vivos (`appliedEnemyHp`).
      - Dano do personagem: em `hit()`, sem afetar os aliados.
      - EXP e Ryu: na coleta dos drops.
      - Ultimate: no ganho passivo de Chakra.
      - Drops: em `removeEnemy`, via `dropChance(base, mult)`, limitado a 100%. As bases são Ryu 72% (×Maldição de Orochimaru, até 95%), Chakra 28%, pílula 1,5% e item 1,8%.
    - God mode ignora o dano recebido; "congelar" pausa a simulação. "Copiar/Colar JSON" exporta e reaplica os parâmetros.
    - A `difficultyScale` exibida na ficha não inclui os multiplicadores.

## Cena e simulação

- **Cena e câmera**:
  - Câmera ortográfica isométrica.
  - Botão direito: yaw livre e pitch entre 0,18 e 1,48 rad. Scroll: zoom de 10 a 32.
  - Terreno de 100×100 com relevo de senos e três montes gaussianos, colorido por grama, trilha, pedra e lava.
  - Vegetação e construções são sprites de `environment-v2.png`; ficam translúcidos quando o jogador está a menos de 3 m.
  - O jogador fica limitado a ±46. Não há colisão com cenário nem pulo.
- **Personagens**: o jogador, os aliados e os mega elites usam o controlador de animação e a forma correspondente. Inimigos comuns usam a folha instanciada.
- **Tempo e zonas**:
  - `elapsed` vai de 0 a 600 s; o HUD mostra a contagem regressiva.
  - Zona = 1 + ⌊elapsed/200⌋ (máximo 3).
  - Ao trocar de zona: novo clima (Névoa espectral reduz a visão; Tempestade de areia dá −27% de movimento), eventos reativados e guardião rearmado.
  - O guardião (shinobi da lista da zona) é invocado no Selo do guardião (`summonGuardian`, HP × `guardianHpMultiplier`) por interação. `guardianSpawned` garante um por zona.
- **Dificuldade** (`difficultyAt`):
  - Multiplicador por rank: Genin 1, Chunin 1,4, Jonin 1,9, Kage 2,6.
  - Escala pelo tempo total da run com `ENEMY_SCALING` (`src/game/progression.ts`): HP e dano lineares × exponenciais por minuto, resistência crescente e spawn em lote (`SPAWN_RULES` em `GameCanvas.tsx`: 40 por quadro, 120 no swarm).
  - Teto de inimigos vivos: (60 + 90·min + 6,4·min²) × fator da missão, até **1.600** (Genin chega a 1.600 aos 10 min).
  - **Final Swarm** (`FINAL_SWARM`): com o relógio da zona zerado, HP/dano/defesa ×3 +25% por minuto; o teto vira teto normal × fator do swarm, limitado a `FINAL_SWARM.maxEnemies` = **8.000**; o spawn nunca fica abaixo de teto ÷ `refillSeconds` (4 s) e os inimigos do swarm nascem a 14–28 m (`spawnRing`). O debug "Teto de inimigos vivos" multiplica por cima respeitando o mesmo limite.
  - A Maldição de Orochimaru multiplica a dificuldade da zona. O Plano do Shikamaru não altera dificuldade.
- **Inimigos**:
  - Perseguem o jogador. Ao alcançar, marcam um círculo vermelho e atacam após um tempo de preparo; sair do círculo evita o dano.
  - O dano recebido passa por armadura (`100/(100+armadura)`) e evasão (máximo 60%).
  - 8% dos inimigos comuns são elites (contorno laranja).
  - Emboscadas a cada 18–30 s geram 8 + 2×zona inimigos.
- **Técnicas**:
  - Cada técnica aprendida dispara sozinha pela própria recarga (velocidade de ataque e afixo "haste").
  - Projétil, Em V e Onda viram projéteis (o número de projéteis se aplica).
  - Corpo a corpo, Cone, Linha, Área e Órbita acertam por geometria instantânea.
  - Terreno não bloqueia acerto.
- **Dano**: atributo de dano × poder da técnica × afixo × escola (Taijutsu físico / Ninjutsu) × passiva × crítico.
  - Crítico: chance acima de 100% vira chance de mega crítico (+50 pontos de multiplicador).
  - Status por técnica, por Genjutsu ou por item. Veneno e queimadura causam dano contínuo.
- **Passivas especiais no código**:
  - Naruto: até +20% de dano conforme perde HP.
  - Hashirama: +20% em técnicas Sábias ou com Selo de Senjutsu.
  - Gaara: +1% de dano por ponto de armadura.
- **Ultimate**:
  - Chakra 0–100, recarga de 55 s × `ultimateRate`; o orbe azul de chakra dá +9.
  - R lança a Ultimate (área de raio 6 × √área, poder 6).
  - AUTO lança sozinho quando a carga está cheia. A tecla Y alterna o AUTO; o clique no selo faz o mesmo, disparando o evento `shinobi-toggle-auto-ult`. Os dois caminhos chamam `onToggleAuto`.
- **Progressão**:
  - XP para o próximo nível: `ceil(18 + 6(n−1) + 0,08(n−1)²)`.
  - Ao subir de nível: cartas de recompensa e 3 s de invulnerabilidade.
  - Se a forma muda, o sprite troca e o HP base sobe 25%.
- **Aliados**:
  - Seguem o jogador em formação.
  - A cada 1,5 s ÷ velocidade de ataque de aliados, cada um lança a 1ª técnica dele com 65% × dano de aliados.
  - Cada aliado dá um buff passivo único (`ALLY_BUFFS` em `src/game/allies.ts`) × força de suporte (`allyBuff`). Em `refreshStats`, `alliesBonuses(allies, stats.allyBuff)` é somado aos buffs da run, junto com `synergyBonuses(activeSynergies(heroId, allies))`. O snapshot leva `synergies` (lista ativa) para o painel SINERGIAS e os cartões; `synergy` (booleano do trio da Areia) ficou por compatibilidade. A regeneração genérica de +0,3 HP/s por aliado foi removida.
- **Descoberta**:
  - Eventos e kunais/shurikens entram no mapa quando ficam dentro do frustum da câmera a menos de 40 m, e continuam registrados depois.
  - Células exploradas no mapa: grade de 5 m ao redor do caminho percorrido.
  - Não há teste de oclusão.
- **H**: esconde efeitos, projéteis e números; a lógica de dano continua.
- **Desempenho**: cada inimigo, projétil e efeito é um objeto Three.js próprio. Não há instancing, pooling nem spatial hash.

## Mecânicas no código atual

### Hub pré-run

- **Conta e carteira**:
  - A tela inicial tem "Continuar como convidado" e uma carteira local de teste chamada "Administrador", sem login.
  - O modal de conta explica que o cadastro ainda não existe e que o debug abre com F9 no servidor local. Não há campos de login nem de senha.
  - A carteira começa com 999.999 Lamens (🍜). O Ryu (🪙) é só o dinheiro da run.
- **Elenco**: 22 shinobis em grade de retratos (`CharacterSelect`), com aldeia, passiva, atributos, kit e Ultimate. Filtros por vila, elemento (afinidade) e organização/clã, mais busca.
- **Ataques**: biblioteca do shinobi com nível de desbloqueio de cada técnica e filtros por escola, elemento e forma. Inclui técnicas de colegas da mesma aldeia.
- **Plano de build**: planejar (marca visual) e deixar em casa técnicas, pílulas e itens. Os itens em casa não aparecem na run; a técnica inicial não pode ficar em casa.
- **Árvore permanente** (`PASSIVES`):
  - 10 linhas de atributo com 10 níveis cada; custo = base + 25 × nível comprado.
  - Quarta opção, Atualizar/Pular/Banir (+1 uso por nível, até 10), Suporte adicional e Quarta técnica.
- **Loja**:
  - 94 itens. Itens comuns já vêm liberados; os demais custam 150, 300, 500 ou 900 conforme a raridade.
  - Desbloquear só adiciona ao pool. Há filtros; deixar em casa fica na Bolsa da Missão.
- **Missões**: Genin, Chunin, Jonin e Kage alteram a escala de dificuldade.
- **Reset**: devolve tudo o que foi gasto e limpa árvore, desbloqueios, arquivamentos e plano.

### Run, recompensas e eventos

- **Cartas de recompensa** (level-up):
  - Só técnicas e pílulas; itens nunca aparecem no level-up.
  - `skillTarget = max(min(2, técnicas elegíveis), total − pílulas elegíveis)`: entram até 2 técnicas, depois pílulas diferentes (as 18 de `pills.ts`, até 10 cada, via `grantPill`), e técnicas completam se faltarem pílulas.
  - Técnicas elegíveis: desbloqueadas, não deixadas em casa nem banidas, abaixo do nível 9, e nova só se houver espaço (3, ou 4 com "Quarta técnica").
  - Itens só vêm de `rollMegaLoot` (kunai, shuriken, eventos, drop de item, recusa de selamento).
  - Sem opções elegíveis, aparece uma carta de "Powerlevel" com um ganho pequeno de atributo.
- **Proteção contra escolha involuntária** (`CHOICE_GUARD.armSeconds = 0,5` em `GameCanvas.tsx`, `choiceArmed`): cada conjunto novo de cartas ignora clique, teclas 1–9, E, V, F, X e Z por 0,5 s. Evita que o clique/duplo clique dado na tela anterior (níveis em fila, troca, banimento) pegue a carta nova — era a origem das pílulas "pegas sozinhas". Testes `?test` dispensam a espera; `?test=1&guard=1` a liga.
- **Atualizar / pular / banir**: F, X e Z (ou botões), com 3 usos base cada. Banir exige escolher a carta em seguida e remove aquela opção pelo resto da run.
- **Sorteio de itens**: pesos 90 / 9,889 / 0,1 / 0,01 / 0,001 (comum → lendário), multiplicados por (1 + Sorte/100)^índice e divididos pela quantidade de itens da raridade. A Sorte é limitada a 500 no cálculo.
- **Pickups no mapa**: 25 entre kunai, shuriken e bolsa de Ryu (+10).
  - Kunai/shuriken custam 20 Ryu, +10 a cada abertura paga, e abrem uma escolha de item.
  - Kunais de recompensa (guardião, desafio, altar, recusa de selamento) são grátis.
- **Drops de inimigo**:
  - XP sempre.
  - Ryu com cerca de 72% de chance.
  - Carga da Ultimate com 28%.
  - Pílula com 1,5%.
  - Recompensa de item com 1,8% (abre uma escolha).
- **Eventos fixos no mapa**:
  - **Plano do Shikamaru** (NPC com sprite do Shikamaru): até 3 vezes por zona; cada uma dá +1 kunai grátis ao derrotar o guardião (1 + planos, máx. 4). Sem penalidade. As kunais caem num círculo de 3,4 m em volta do portal; o E coleta a kunai próxima antes de entrar no portal e o portal avisa enquanto houver kunai grátis no chão (E de novo entra). Correção de 06/11/2026: antes as kunais caíam em cima do portal, o E entrava nele e `clearZone` apagava as restantes (só 1 era coletada).
  - **Selo do guardião**: invoca o guardião da zona na hora; HP cresce com o tempo na zona.
  - Hooks de teste: `summonGuardian`, `shikamaru`, `defeatGuardian`, `guardian`.
  - **Ebisu/Iruka/Naruto Totem**: ver docs/01. Hooks: `ebisu`, `iruka`, `npcState`, `fillAllies`, `totem`, `damageTotem`, `killClones`, `collectDrops`.
  - **Técnicas**: `Technique.setup` (forma 'Buff'), `ultimateBase`, preparo de golpe dividido por `projectileSpeed`, Modo Sábio e linha Senjutsu (`SENJUTSU`, `hasSenjutsu`, `techniqueDetail` em `combat.ts`); snapshot `setups`. Hooks: `castDelayed`, `senjutsu`, `combat`, `setRunBuff`, `setGrowth`; `cast` resolve na hora. Ver docs/04.
  - **Altar de desafio**: 6 inimigos; vencer dá uma kunai grátis.
  - **Maldição de Orochimaru**: +20% de dificuldade, +25% de XP e saque.
  - **Altares por raridade** (`ALTAR_RULES` em `GameCanvas.tsx`, `startAltar`/`tickAltar`, progresso por altar em `altarProgress`): pisar no círculo de 3 m inicia sem E; sobe dentro, cai fora com taxa por raridade; 100% abre escolha de itens com um da raridade do altar.
  - **Mercador de armas**: troca cada kunai/shuriken guardada por 5 Ryu.
  - **Roleta da Tsunade** (evento `slot`, antigo Caça-níquel): overlay `TsunadeRoulette` pedindo giros via `CustomEvent('shinobi-roulette')`; regras puras em `src/game/roulette.ts` (`ROULETTE_RULES`, `rouletteWeights`, `rollRoulette`, `rouletteCost`, `spendBonuses`). Estado `roulette` pausa o loop; `ryuSpent` soma kunais, roleta e Ichiraku. Hook `__shinobiTest.roulette`.
  - **Barraca Ichiraku** (sprite 5 de `environment-v2.png`, em x 13, z 21):
    - `openIchiraku` abre uma escolha (`choiceLevel = −2`) com as técnicas aprendidas, só se houver mais de uma, e as pílulas.
    - `forgetAtIchiraku` cobra `10 + 5 × nível` em Ryu. Na pílula, apaga todos os níveis de `knownPills`; na técnica, apaga `skillLevels`, `growth` e `cooldowns`, liberando o espaço. Depois chama `refreshStats()`.
    - A barraca continua aberta para esquecer mais. Sem Ryu suficiente, mostra um aviso e não muda nada. X fecha.
    - O evento nunca é desativado.
  - **Bênção de Tsunade**: virou casa da Roleta da Tsunade (buff temporário de 90 s).
  - **Arsenal da Tenten** (id `arsenal`, antes Sharingan de Kakashi; sprite da Tenten em x −21, z −1): uma vez por zona.
    - `openKakashi` abre uma escolha (`choiceLevel = −1`) com os itens da bolsa que ainda estão abaixo do limite, do mais raro ao mais comum.
    - Escolher chama `grantItem`, que dá +1 cópia, e desativa o evento.
    - X (`rewardAction('skip')`) fecha sem gastar o evento nem os usos de pular. Atualizar e banir não se aplicam.
    - Sem itens copiáveis, só mostra um aviso.
    - Na UI: título "ARSENAL DA TENTEN", selo "CÓPIA" e grade de até 4 colunas com rolagem para muitas cartas.
    - Clicar numa carta dispara o evento `shinobi-choose` com o índice (funciona além da 4ª carta). O teclado aceita 1–9.
- **Mega elites**:
  - O primeiro surge entre 30 e 55 s; os seguintes a cada 45–70 s, até 9 por run.
  - São um shinobi aleatório que ainda não é aliado, com HP alto (sprite maior).
  - O guardião da zona aparece numa faixa "Guardião · nome · HP" no HUD.
- **Chefes (`src/scene/bossCombat.ts`)**: mega elites e guardiões.
  - **Barra de vida 3D:** sprite com canvas acima do personagem, roxa para mega elite e laranja para guardião, com o nome. Durante uma técnica mostra "⚠ nome do golpe". Fica visível mesmo com H e sobre o cenário.
  - **Técnicas do personagem:**
    - A cada 3,7 s / 2,9 s / 2,3 s (zonas 1/2/3; guardião ×0,8; ±15%) o chefe escolhe uma técnica do próprio kit. Mega elite usa as primeiras 1 + zona técnicas; guardião usa as 4.
    - Antes do golpe, marca a área em vermelho por 1,1 s, que vai ficando mais forte. O chefe para de andar enquanto conjura.
    - Formas: Área cai na posição do jogador (raio 2,4); Corpo a corpo é um círculo em volta do chefe; Cone de 6 m; Linha/Projétil de 10 m; Em V com duas linhas; Onda/Órbita é um anel em volta do chefe.
  - **Dano:** 18 × poder da técnica × ameaça, menos armadura, com evasão, invulnerabilidade e god mode respeitados. Técnicas com controle (Sombra, Areia, Madeira, Raio, Genjutsu, corpo a corpo) deixam o jogador 45% mais lento por 1,2 s.
  - **Ultimate do guardião:** uma vez, abaixo de 50% de HP, a Ultimate do personagem vira uma área de raio 5,6 em volta dele, com aviso de 1,7 s e poder 2,6.
  - **HP no debug:** a barra acompanha o multiplicador de HP do debug (`rescale`). Barra e avisos são descartados quando o chefe morre ou é removido.
  - Todos os números são provisórios.
- **Selamento**:
  - Ao derrotar um mega elite, a run pausa na decisão. E inicia o ritual de 2,7 s (instantâneo com a Shuriken Selo da Tenten); G recusa e deixa uma kunai grátis.
  - Equipe cheia ou personagem repetido impede selar.
  - Se vários mega elites caem, as decisões entram em fila.
- **Aliados e sinergia**: vagas 3 + Pergaminho de Recrutamento + nó "Suporte adicional" (máximo 5). Combos de vila/organização contando só ajudantes, afinidade por ajudante, substituição com equipe cheia (choiceLevel −7) e configuração de captura (`src/game/settings.ts`, `sb_settings_v1`); ver docs/03.
- **Fim da run**: vitória ao chegar a 0:00; derrota com HP 0.

### UI durante a run

- **Topo** (`game-topbar` em `main.tsx`, layout em `src/hud-layout.css`): grade em três blocos — missão + clima/zona (esquerda), relógio grande ou "FINAL SWARM +m:ss" (centro), Ryu curto e kunai/shuriken (direita) — e uma linha secundária menor com os preços de kunai, shuriken, roletar do mercador e giro da roleta, todos em `compactNumber`. Avisos (`.world-toast`, ex.: emboscada) ficam abaixo da barra, em `top:140px`.
- **Ryu em formato curto**: `compactNumber` (`src/game/format.ts`) no HUD, nos preços da barra, na Roleta da Tsunade (valor exato no `title`), no diálogo do mercador/prêmio (`ItemTradeDialog`) e nos toasts/interações de `GameCanvas.tsx` que mostram Ryu.
- **Faixas e telas**: faixa do guardião com HP, progresso da defesa do altar, interação próxima ("Aperte E").
- **Cartões de ajudantes** (`src/ui/AllyCards.tsx` + `src/allies.css`, à esquerda em `top:150px`), um por aliado selado:
  - retrato redondo com moldura na cor da 1ª técnica, nome e selo da aldeia (FOLHA/AREIA/SOM/CHUVA) ou "SINERGIA";
  - buff único com o valor efetivo (`allyBuffText(id, allyBuff)`; o nome do buff aparece no tooltip), mais "+12 armadura / +15% dano" da Areia;
  - nome da técnica com a barra de recarga compartilhada dos aliados (`allyCharge` no snapshot);
  - elemento, escola, % de dano (65 × `allyDamage`) e intervalo.
- **Resumo pós-run** (`RunSummary`), na vitória ou derrota:
  - resultado, forma final e chefe ativo;
  - 12 indicadores: tempo, nível, zona, abates, dano total, DPS médio, dano dos aliados, Ryu, kunai, shuriken, ameaça e suportes;
  - dano por técnica com barra, % e DPS;
  - build final (itens, pílulas, aliados, sinergia) e atributos finais;
  - "Tentar novamente" e "Preparar outra missão".
  - As regras `.defeat-backdrop`/`.defeat-card` em `run-ui.css` ficaram sem uso.
- **Cartão superior esquerdo**: retrato da forma atual, nível, HP e XP.
- **Canto superior direito**: minimapa com jogador, inimigos, pickups, ping e eventos descobertos.
  - Marcadores ficam num raio de 38% do minimapa (`MinimapMarkers`) e os pontos de inimigo num raio circular de 45%, para não serem cortados pela borda. Abaixo do círculo há o rótulo `.minimap-caption` ("Tab rápido · M mapa").
  - Tab: mapa rápido.
  - M: mapa completo; clicar nele marca um ping.
- **Base** (`src/hud-dock.css`):
  - `.skill-dock` (canto inferior esquerdo, `bottom:96px`) empilha a linha de pílulas (`.vitamin-row`: ícones de 30 px, até 2 linhas, depois rolagem) acima da barra de técnicas (4 espaços + botão R com o selo AUTO), sem sobreposição.
  - Ajuda de teclas em `left:124px; bottom:14px`, à direita do botão "← Preparação".
  - Itens no canto inferior direito: ícones de 25 px, no máximo 3 linhas (`max-height:90px`) com rolagem e contador de quantidade com fundo escuro; FPS e inimigos vivos no centro inferior.
- **Ajudantes** (`AllyCards.tsx`, `allies.css`): com 4+ ajudantes os cartões ficam compactos e a coluna para antes do dock, com rolagem. O painel SINERGIAS recolhe/expande pelo título; o estado fica em `localStorage` (`shinobibonk.hud.synergiesCollapsed`, com try/catch).
  - Até 700 px de largura, o bloco fica em `bottom:50px`, com pílulas de 26 px em 1 linha.
- **Ficha (P)**: atributos, escala de dificuldade, técnicas com dano e afixos acumulados, itens, pílulas, aliados e sinergia.
- **Cartas**: cartas de recompensa com botões Atualizar/Pular/Banir; painel de selamento com retrato e animação; telas de vitória e derrota.

## Lacunas e divergências conhecidas

- **Moeda**: a fórmula de Lamens é provisória. Abates de guardião não entram (o snapshot não informa). O debug permite inflar a recompensa.
- **Selamento**: não tem 3 tentativas nem chance de falha; também não existe o selamento permanente com 1 tentativa.
- **Aliados**: atacam só com a 1ª técnica do kit, e os valores dos buffs únicos são provisórios.
- **Sinergias**: só a da Areia existe.
- **Mapa**: arena única, sem colisão, pulo, dash, biomas ou mapa procedural.
- **Descoberta**: sem oclusão.
- **Inimigos**: teto de 180 vivos; meta de 1.500 não medida.
- **Remoção de pílula/item**: Ichiraku permite esquecer técnicas e pílulas. Sapos Sábios oferecem fusão e combinação.
- **Mega elites**: não há rotação de mega elite por zona. O aviso das técnicas é desenhado plano no chão e pode ficar parcialmente escondido em relevo forte. A dificuldade dos chefes não foi balanceada; em níveis baixos, 3 a 4 golpes podem derrubar o personagem.
- **Arte**: As formas usam sprites por quadro. Os efeitos mesclam atlas de pixel art e geometrias estilizadas.
- **Bundle**: o JavaScript tem 899 kB, sem code-splitting.
- **Painel de debug**: fica à direita, abaixo do minimapa e do rótulo dele (em jogo, `hud-layout.css` calcula o `top` a partir do tamanho do minimapa × escala do HUD/minimapa; fora do jogo vale `top:222px` de `debug.css`), sem cobrir o cartão do herói, o minimapa nem a barra superior. Abaixo de 640 px de largura, vira uma gaveta inferior. Botão e painel somem quando o resumo pós-run está aberto. No Edge, F9 também é atalho do Leitor Imersivo; o painel chama `preventDefault`, mas isso não foi verificado numa sessão real.
- **Ausentes**: sem conta real, save, ranking, rede ou multiplayer.

## Verificação

- **05/11/2026, nesta revisão**: `tsc -b` sem erros; `vite build` concluído (aviso de chunk acima de 500 kB); `node scripts/verify-rules.mjs` passou e regravou `artifacts/rules-checks.json` (22 shinobis, 88 técnicas, 36 itens na época; hoje 91).
- **05/11/2026, após a troca para Lamens e a restauração da tecla Y**: `node scripts/verify-runtime.mjs` passou nas 23 verificações no navegador (inclui "Tecla Y alterna a Ultimate automática"), sem exceções JS nem assets 404, e regravou `artifacts/runtime-checks.json`.
- Não houve teste manual de jogabilidade, medição de FPS com carga alta nem validação de balanceamento.

## Integração atual de preparação, combate e arte

- `BuildPlanner` separa lista com rolagem do detalhe. `TechniquePreview` desenha alvos de treino no Three.js usando os efeitos do jogo, o controlador de poses e a sequência de Gamabunta. O detalhe traz status, chance/dano crítico inicial e recarga. `SkillIcon` usa atlas de famílias, retratos Sábios e ícone de Gamabunta.
- `playerMotion` serve jogador, ajudantes, shinobis inimigos, clones e a prévia. Recebe o id da versão e usa as folhas da família na forma da versão. As folhas exclusivas de Naruto Academia, Sasuke Genin e Neji cobrem pulo/dash. As demais formas combinam folhas direcionais com pose procedural onde ainda faltam quadros próprios.
- `enemyRenderer` mantém corpos, contornos e avisos instanciados. A seleção de quadro é UV por instância. Projéteis inimigos usam sprites compartilhados, limite simultâneo e teste de colisão pelo segmento percorrido por quadro.
- `gamabunta.ts` escolhe as quatro poses, emite óleo pela boca e inicia ignição no ponto-alvo. A animação e o impacto compartilham o mesmo relógio. Referência: [Fire Release: Toad Oil Flame Bullet](https://naruto.fandom.com/wiki/Fire_Release%3A_Toad_Oil_Flame_Bullet).
- `techniqueMerge.ts` produz uma técnica a partir de duas receitas; as fusões e combinações são persistidas com os respectivos estados em `CampaignSave`. Combinação reutiliza as duas resoluções originais. Fusão combina naturezas e afixos.
- O retrato Sábio usa os traços de Naruto, Hashirama, Jiraiya e Minato. Kabuto tem arte reservada para quando entrar no elenco. Orochimaru tem olhos serpentinos para a representação de senjutsu, seguindo a distinção canônica. [Sage Mode](https://naruto.fandom.com/wiki/Sage_Mode)
- A seleção de herói/bioma não recria o cenário decorativo da preparação. O ponteiro é capturado pelo elemento estável da aplicação. A decisão atual fica em `GameCanvas` quando a ficha se sobrepõe ao pool.

- `atlasEffects.ts` anima quatro quadros de Substituição e quatro da aura de Modo Sábio. A aura segue o jogador enquanto o setup está ativo. A prévia reutiliza as duas sequências.
- `VillageEmblem` resolve nome original, abreviação e símbolo para seleção, suporte, missões e mapas. A chave portuguesa usada por `VILLAGE_COMBOS` permanece estável. [Símbolos da Narutopedia](https://naruto.fandom.com/wiki/Module%3AInfobox/icons)
