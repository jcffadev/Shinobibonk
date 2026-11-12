# 23 · Revisão para outros agentes (Claude / Codex) — controle do que o Qwen/Bionic fez

> Criado em **12/11/2026** (rodada 43) a pedido do usuário: "para os personagens ajustes que você não conseguir fazer animação/habilidades **deixar uma anotação no contexto/skills para o Claude ou Codex verificar** e eles fazem/revisam. **Deixar anotado tudo que você Qwen fez** que eles podem revisar, como hud's, personagens/movimentação/sheets. Por segurança, já prepare esse controle de tudo que você está fazendo/já fez para revisão deles."
>
> Este arquivo é o **controle de revisão**: inventário do que foi feito por rodada, áreas de revisão com caminhos de arquivo, e as notas do que ficou para o Claude/Codex. Ele **não duplica** o contexto — aponta para `AGENTS.md`, `docs/19` (índice), `CHANGELOG.md` e o `git log`.

## 1. Como usar este documento

1. `AGENTS.md` — regras permanentes (leia primeiro).
2. `docs/19-INDICE-DO-CONHECIMENTO.md` — índice do conhecimento (mapa de domínios → onde vive cada coisa).
3. **Este arquivo** — o que foi feito e o que ficou para revisão.
4. `CHANGELOG.md` — entrada detalhada por rodada (implementado · arquivos · testado · pendente).
5. `git log --oneline -50` — cada commit resume uma rodada; use para auditoria exata do que entrou em cada entrega.
6. `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` — decisões permanentes e estado · `docs/14-CONTEXTO-DO-CHAT.md` — texto integral dos pedidos.

**Estados:** `CONFIRMADO` (usuário aprovou) · `PROPOSTO` (ainda não aprovado) · `IMPLEMENTADO` (no código) · `VALIDADO` (testado) · `PENDENTE` (na fila).

## 2. Inventário por rodada (git log — ponta em 12/11/2026)

Cada linha é um commit publicado. Destaques de revisão marcados com ⭐.

| Commit | Rodada | O que foi feito (resumo) |
|---|---|---|
| `3e3c99c` | **43** ⭐ | **Sons reais de jutsu** (Kage Bunshin — só família naruto · Shinra Tensei — ultimate do Pain) + **gate anti-spam** (não é fila) + **pose/levitação da Ultimate do Pain** (`painUltimate`, arco 0,38 m) + criação deste **`docs/23`** (controle de revisão p/ Claude-Codex). MP3s do usuário em `public/assets/audio/`. |
| `d140ade` | **42** ⭐ | Trilha sonora (OST Naruto, 15 faixas do usuário): `src/audio/music.ts` (máquina de estados boot→menu/run/bijuu/defeat, uma faixa por vez sem fila), `musicVolume` default 0,7, slider "Música", gatilhos em `main.tsx`/`GameCanvas.tsx`. Validações completas (58/0/0 + probe 5/5). |
| `cbfc968` | **41** ⭐ | Marionetes: **Kuri** (companheira permanente do Kankuro, `GameCanvas.tsx`) + **Kuroari** (entidade visual da técnica, `src/scene/kuroari.ts`) + 4 folhas Pillow (`scripts/generate-puppets.py`) + registros em `directionalArt`/`evolution`/`npcs` + 10 asserções. Dano idêntico (zero balanceamento). **Arte Pillow interina — pendente de conferência/swap IA.** |
| `e36d58a` | 40 | Passiva "Couraça" → **"Colete Shinobi"** (renome + ícone `jonin-vest` + migração não destrutiva de `sb_permanent_levels`). |
| `4dccb50` | 39 ⭐ | **Planner individual por personagem em TABELA** (Habilidades/Pílulas/Itens) + aba **Fusões** + **Táticas de Missão** + buff verde/debuff vermelho por cláusula (`BuffText.tsx`) + badge ⚗ no pool + "pra"→"para" + **proporção idêntica em movimento** (bbox alfa em `playerMotion.ts`). |
| `106c2a2` | 37 f3 | Docs/fila do Caça-Níquel (CONCLUÍDA). |
| `ec7c42a` | 37 f3 ⭐ | **Caça-Níquel da Tsunade**: 5 combos de 3 iguais, 3 rolos verticais, face com humor (feliz/triste/nervosa), emboscada shinobi (jogador seguro, mata monstros), custo por giro/tempo/zona. **Arte das 3 expressões = PENDENTE.** |
| `2b62cf1` | 37 f3 | Registro das decisões antes do código. |
| `9d8b652` | 37/38 | Integração: variante overlay da fase 2 preservada na branch `backup-r37-fase2-overlay`. |
| `fd79ced` | **38** ⭐ | **Animação andar+atacar** (golpe inteiro no sprite base + passada nas pernas + encadeamento a 75%) + **HUD ninja** (`src/ninja-theme.css` + prévias em `docs/previas/hud-ninja/`) + ABRIR_JOGO.bat auto-reparo + **proposta de novos shinobis em `docs/22`** (PROPOSTO). |
| `7f8e564` | 37 f1 | Registro da fase 1 concluída. |
| `d05f168` | 37 f1 | **YOO MP3 real** no botão Jogar (corte 1 s) + **gate anti-spam** de sons de jutsu (`sfx.ts` `playYooo`/`jutsuGate`). |
| `eacebaf` | 37 | Autorização do mega-lote da 35 + novos specs (Kages/Tier A/Tobi ×2/Nagato/Yahiko=Pain/Caça-Níquel/itens 9-13-15/HUD Naruto). |
| `3611f26` | 36 | Segmentação segura de contexto: `docs/19` (índice) + `docs/20` (fórmulas) + `docs/21` (elenco) + skills atualizadas + backup integral validado. **Sem código de jogo.** |
| `3d24831` | 35 | Plano do mega-lote (fila em 4 fases, sem código de jogo). |
| `fcbcf9d` | 34 | Dificuldade early game/por zona, scale de habilidades ×1,5, utilidades + gráfico de crescimento na ficha, Treinamento só com Sorte, renderizador (preparo .exe). |
| `4d1e798` | 33 | Andar durante o ataque + cache de geometria dos anéis. |
| `bfd687d` | — | Decisão de excluir/recriar o repositório + fluxo do material de referência. |
| `bdec49d` | — | Skill `contexto-e-decisao` + regra de documentar TUDO. |
| `ab87de2` | 30 | V-Sync, placa de vídeo e fim da suavização da câmera. |
| `5eeec9b` | 29 | Mouse 1:1 sem aceleração (raw input `unadjustedMovement`). |
| `a27ad7b` | — | Remove zip de origem não verificada + .gitignore. |
| `07c7bbd` | 28 | Skill `referencia-externa` + regra de zero rastro do jogo de referência. |
| `bd926e7` | 27 | Remove o ajuste automático de desempenho (pedido do usuário). |
| `f5b6130` | 26 | Regra permanente: toda comunicação em português. |
| `c86a46c` | 25 | Contexto permanente P/R (`docs/18`) + ponteiros. |
| `4ef107c` | 24 | Remove todo material de referência externa do projeto (arquivado fora). |
| `33d8195` | 23 | Ajuste automático de FPS (depois removido na 27) + deploy Netlify. |
| `bee4bba` | — | 24 folhas de ações + revisão das 56 versões. |
| `11e0d18` | — | Lotes + mapas + ações + retomada por Esc. |
| `78e6520` | — | Fila restante + integração local. |
| `badcee4` | — | Oficina por zona + controles + mercador. |
| `c41bd79` | — | Trabalho parcial de subagentes. |
| `ff298fb` | — | Dash/sprites + perfis locais. |
| `8b22c71` | — | Registro contínuo de P/R. |
| `04ad323` | — | Cobertura das animações do elenco. |
| `233b0fd` | — | Folhas de Susanoo. |
| `2f7d7e9` | 15 | Calibração com a wiki (docs/15 — depois arquivado). |
| `a5b29f8` | 13 | Versões separadas + pulo/dash + kunais. |
| `9781370` | 14 | Atributo das pílulas + pergaminhos + listas. |
| `bbfb76c` | 12 | Final Swarm + pílulas + altares. |

## 3. Áreas de revisão (o que o Qwen/Bionic fez, com caminhos)

### 3.1 HUDs e menus (tema ninja/japonês)
- **Rodada 38** (`fd79ced`): `src/ninja-theme.css` (pergaminho, placa de madeira, selo vermelho, barras em pincelada, slots ofuda, minimapa com aro de corda, cartas de nível com cor da raridade) · hub/seleção de shinobi/seleção de mapa redesenhados · `docs/previas/hud-ninja/` (prévias e capturas) · fontes locais OFL em `public/assets/fonts/`.
- **Rodada 39** (`4dccb50`): planner em **TABELA** em `src/ui/BuildPlanner.tsx` · buff verde/debuff vermelho por cláusula em `src/ui/BuffText.tsx` · badges no pool (★ Treinada · ⚗ Requisito de Fusão).
- **Rodada 42** (`d140ade`): slider "Música" em `src/ui/SettingsScreen.tsx`.
- **Pendente de arte:** as **3 expressões da Tsunade** no Caça-Níquel (feliz/triste/nervosa) — hoje é o mesmo retrato do roster + badge/glow de humor (`src/ui/TsunadeRoulette.tsx` + `src/tsunade-roulette.css`).

### 3.2 Personagens, movimentação e folhas (spritesheets)
- **Rodada 38** (`fd79ced`): animação andar+atacar em `src/scene/playerMotion.ts` (golpe inteiro no sprite base + passada nas pernas + encadeamento a 75%) · skill `movimentar-shinobi` com as regras.
- **Rodada 39** (`4dccb50`): proporção idêntica em qualquer movimento — `alphaFracOf`/normalização por bbox alfa em `src/scene/playerMotion.ts` (clamp 0,85–1,35).
- **Rodada 41** (`cbfc968`): Kuri + Kuroari — `src/scene/kuroari.ts` · `src/game/directionalArt.ts` · `src/game/evolution.ts` · `src/game/npcs.ts` · 4 folhas Pillow em `public/assets/shinobi-motion/` · gerador `scripts/generate-puppets.py`. **Qualidade abaixo das folhas IA — o usuário pode trocar os 4 PNGs (mesmos nomes) sem tocar no código.**
- **Rodada 43** (`3e3c99c`): pose/levitação da **Ultimate do Pain** em `src/scene/playerMotion.ts` — `painUltimate` segura o **quadro 0** da folha `pain-1-action-v3.png` (fileira 2 frente / 3 costas — pose de braços em V) + arco de elevação `sin(π·progresso) × 0,38` m. **Sem nova arte** — usa quadro existente.
- **Rodada 45** (este commit): **fluidez da caminhada + proporção ao atacar** em `src/scene/playerMotion.ts` — corrigidas 3 descontinuidades da troca de folha (regressões das 38/39): (a) `propFactor` agora **suavizado** (lerp exponencial `propCur`, ≈0,15 s) — o personagem não mais salta de tamanho/altura a cada troca (âncora nos pés + Choji/Gaara/Pain preservados); (b) passada `strideShown` agora **sobe/desce** (lerp exponencial ≈0,1 s) no início/fim do golpe em vez de ligar/desligar; (c) `stepTime` **contínuo** (não zera a cada parada). **Estado estacionário inalterado** — só as transições suavizam. **Revisão:** se o usuário ainda notar tamanho mudando no golpe, o próximo passo é reduzir a diferença de bbox entre as folhas de ação e o repouso (arte) — o clamp 0,85–1,35 segue como teto.
- **Padrão de movimento:** Naruto Academia + Manto da Kurama (decisão permanente); exceções Lee, Guy, Gaara. 56 versões · 560 estados validados por `verify-motion-atlases.mjs`.

### 3.3 Áudio (SFX de jutsu + trilha)
- **Rodada 37 f1** (`d05f168`): YOO MP3 real no Jogar (corte 1 s) + gate anti-spam em `src/audio/sfx.ts`.
- **Rodada 42** (`d140ade`): `src/audio/music.ts` (máquina de estados, uma faixa por vez sem fila) · 15 faixas em `public/assets/music/` · `musicVolume` em `src/game/settings.ts`.
- **Rodada 43** (este commit): **sons reais de jutsu** — `public/assets/audio/kage-bunshin.mp3` + `shinra-tensei.mp3` · `src/audio/sfx.ts` (`JUTSU_CLIP_RULES` + `playJutsuClip` + `activeJutsuClip` gate) · `src/scene/GameCanvas.tsx` (3 call sites passam o `heroId`).
- **Regra anti-spam (permanente):** o próximo som de jutsu só toca quando o anterior **termina** — **não é fila**.

### 3.4 Caça-Níquel da Tsunade
- **Rodada 37 f3** (`ec7c42a`): `src/game/roulette.ts` (5 casas + `SLOT_COMBOS` + `slotKakuzuRyu` + `rouletteCost` com zona) · `src/scene/GameCanvas.tsx` (giros, combos, armadilha shinobi) · `src/ui/TsunadeRoulette.tsx` (rolos + face + humor).
- **Pendente:** arte das 3 expressões (ver 3.1).

### 3.5 Planner / Fusões / Táticas
- **Rodada 39** (`4dccb50`): `src/ui/BuildPlanner.tsx` · `src/game/missionBag.ts` · `src/game/techniqueMerge.ts` (Fundir/Combinar) · chaves `sb_*_by_hero_v1` (fallback das antigas, nunca apagadas).

### 3.6 Balanceamento e scale
- **Rodada 34** (`fcbcf9d`): `src/game/progression.ts` · `combat.ts` · `tuning.ts` · `enemyTiers.ts` · `worldScale.ts` — fórmulas consolidadas em `docs/20-SCALING-EREGULAS.md`.
- **Rodada 40** (`e36d58a`): renome de passiva + migração de save.
- **Regra:** o **usuário testa a gameplay e ajustamos em iteração** — não calibrar sem ele.

### 3.7 Configurações (preparo .exe/patch)
- **Rodada 29/30** (`5eeec9b`/`ab87de2`): mouse 1:1 (raw input) + V-Sync on/off + placa de vídeo + câmera sem suavização + renderizador DirectX/OpenGL na aba Tela (na web = sempre WebGL; no .exe o jogador escolhe).
- **Rodada 27** (`bd926e7`): remoção do ajuste automático de FPS (pedido do usuário) — a imagem fica 100% nas configurações de Gráficos.
- **Rodada 44** (working tree): câmera **mais deitada** (início **0,55 rad**, piso **0,05 rad ~3°** — era 0,12) + sensibilidade do mouse em **taxa única e simétrica 0,0025 rad/px** (yaw+pitch; era 0,006/0,004) + **câmera centraliza o JOGADOR** (verificado) + dica **Windows: ponteiro 6/11** no slider. `GameCanvas.tsx` (pitch inicial + `turnCamera`) + `SettingsScreen.tsx` (hint).

## 4. Notas para Claude/Codex — o que ficou para vocês

### 4.1 O que o Qwen/Bionic NÃO conseguiu (precisa de vocês ou do usuário)

1. **Arte das 3 expressões da Tsunade** (Caça-Níquel: feliz/triste/nervosa) — hoje é retrato do roster + badge/glow. **Precisa de geração de imagem** (skill `criar-arte-shinobibonk` + gerador do usuário ou Claude/Codex com acesso a IA de imagem).
2. **Arte Pillow da Kuri/Kuroari** (rodada 41) — qualidade abaixo das folhas IA. **Opção:** gerar IA e trocar os 4 PNGs com os **mesmos nomes** (`kuri-1-walk-v1.png` · `kuri-1-action-v3.png` · `kuroari-1-walk-v1.png` · `kuroari-1-action-v3.png`) — swap trivial, zero código.
3. **Download de áudio do YouTube** — o agente **não consegue** baixar nesta sessão (ytmp3.yt falhou). **Fluxo aprovado pelo usuário:** ele baixa e entrega a pasta; o agente integra com o gate anti-spam. Se mais MP3s de jutsu chegarem, o padrão é: copiar para `public/assets/audio/` com nome limpo + adicionar regra em `JUTSU_CLIP_RULES` (`sfx.ts`) — o gate já cobre.
4. **Foto do late game do WhatsApp** (referência de HUD) — não chegou; o frame v4 dos vídeos enviados é a melhor referência recebida.
5. **Validação de FPS em GPU real** — o headless (SwiftShader) é ~6–7 FPS, esperado; o usuário precisa testar no PC dele (GPU real) e reportar.

### 4.2 O que o Claude/Codex PODEM revisar/refinar (decisões de interpretação pendentes)

- **Rodada 41 (4 pontos):** (a) Kuri como companheira permanente do Kankuro; (b) Kuroari como visual da técnica; (c) adiantar o herói Sasori (Onda 2) ou manter a ordem; (d) aceitar arte Pillow interina + conferência visual das 4 folhas.
- **Rodada 42 (6 pontos):** (a) Raising Fighting Spirit = pool RUN **e** luta bijū; (b) Hinata/Neji na mesma faixa; (c) pós-bijū volta ao pool RUN; (d) vitória → pool de MENUS; (e) `musicVolume` default 0,7; (f) sem crossfade (só fade-in ~0,9 s).
- **Rodada 43 (4 pontos — este commit):** (a) som de Shinra Tensei toca na **Ultimate `Chibaku Tensei`** do Pain (o MP3 é "Shinra Tensei", mas a ultimate do Pain é Chibaku Tensei — a técnica comum Shinra Tensei do kit dele **não** toca o som); (b) **Kage Bunshin** → som apenas para a **família naruto** (qualquer outra família com a técnica no pool compartilhado **não** toca o som); (c) enquanto um MP3 de jutsu toca, **nenhum** outro som de técnica (sweep/fala TTS) entra — e a fala TTS daquela técnica é suprimida no cast; (d) levitação do Pain: arco `sin(π·progresso) × 0,38` m + pose de braços levantados **segura** durante o cast (mesma receita do Gaara).
- **Rodada 44 (4 pontos):** (a) **taxa única e simétrica 0,0025 rad/px** em yaw e pitch (era 0,006/0,004 — a assimetria 1,5:1 era o “esquisito”; velocidade −53–58%); (b) **piso do pitch 0,05 rad (~3°)** (era 0,12) para “deitar mais a câmera” como no jogo de referência; (c) **início 0,55 rad (~31,5°)** (era 0,74); (d) **dica do Windows: velocidade do ponteiro 6/11** na hint do slider (o multiplicador do sistema pode somar ao raw input — possível causa de “ainda parecer rápido” no PC do usuário). Câmera centraliza o JOGADOR (verificado: já era assim); zoom/wheel/frustum **NÃO** alterados (usuário não pediu).
- **Rodada 45 (4 pontos):** (a) suavizar `propFactor` com lerp exponencial (em vez de salto bruto) — **mantém** a regra da rodada 39 (proporção idêntica em movimento) sem o “pulo” de tamanho/altura; (b) suavizar a amplitude da passada `strideShown` na troca de folha (em vez de ligar/desligar de uma vez); (c) `stepTime` contínuo (em vez de zerar a cada parada) — a caminhada continua de onde parou; (d) **não** suavizar a troca de textura em si (repouso ↔ folha) — é a limitação de 1 sprite por estado; as correções (a)–(c) eliminam os “pulos” que tornavam essa troca visível. Se o usuário ainda notar mudança perceptível de tamanho no golpe, o próximo passo é **reduzir a diferença de bbox entre as folhas de ação e o repouso na arte** (o clamp 0,85–1,35 da rodada 39 segue como teto).
- **Pose/armadura da Ultimate do Pain pode ganhar uma folha dedicada nova** — o hook é `painUltimate` em `src/scene/playerMotion.ts`; hoje usa o quadro 0 da folha existente (fileira 2/3). Se o Claude/Codex gerarem uma folha de "levitação com braços abertos" específica, basta trocar o `castFrame` para o quadro desejado.

### 4.3 Decisões do usuário que o Claude/Codex DEVEM respeitar (resumo)

- **Sempre pt-BR** em toda comunicação (o usuário já repreendeu por inglês).
- Alterar **SÓ** `C:\Shinobibonk projeto - Copia`; nada em Windows/registro; Edge só para testes.
- Material de referência do jogo rival **NUNCA** no projeto (skill `referencia-externa`). **Exceção:** os MP3 de jutsu/OST são áudios que o usuário baixou **para o jogo** → podem ir para `public/assets/audio/` e `public/assets/music/`.
- **Nunca `git add -A`** (stage por nome); nunca force push; nunca commitar `artifacts/`, `node_modules`, `dist`, `arquivo-pokebonk/`, `sb-swishes-source.zip`, `Feedback da versão.txt`.
- **Kankuro já foi corrigido** (usuário confirmou repetidamente) — **não tocar** nas animações dele a não ser para balanceamento.
- **Choji é o único que cresce** (Jutsu de Expansão, fase 7) — regra de proporção idêntica em qualquer movimento.
- **Usuário testa a gameplay e ajustamos em iteração** — não calibrar balanceamento sem ele.
- `TEST_UNLOCK_ALL=true` em `src/game/account.ts` — **voltar a false antes da versão pública**.

## 5. Validações (padrão de toda rodada)

Toda entrega passa por **5 verificações** (scripts em `scripts/`):

1. `tsc -b` — TypeScript limpo.
2. `vite build` — build OK.
3. `verify-rules.mjs` — asserções de regras (roster 56 · técnicas 97 · itens 95 + asserções específicas da rodada).
4. `verify-motion-atlases.mjs` — 56 versões · 560 estados · 0 erros.
5. `verify-runtime.mjs` — Edge headless (Playwright) · 58 checks · 0 erros JS · 0 assets 404.

**Aviso de flakiness (rodadas 41/42/43):** o harness headless (SwiftShader, lento) tem **checks flaky que trocam a cada execução** (rodada 41: "portal do guardião" · rodada 43: "Rendan Uzumaki exibe impacto" e "Teuchi/barraca Ichiraku" — ambos sem relação com os edits da rodada). Se falhar de novo: **reexecutar antes de investigar**; registrar no `docs/13`.

**Node não está no PATH** — usar:
```
C:/Users/jcffa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```
Comandos (dentro da pasta do projeto):
```
node.exe node_modules/typescript/lib/tsc.js -b
node.exe node_modules/vite/bin/vite.js build
node.exe scripts/verify-rules.mjs
node.exe scripts/verify-motion-atlases.mjs
node.exe scripts/verify-runtime.mjs
```

## 6. Estado atual (12/11/2026, ponta `1e212b9` + rodada 45)

- **Repositório:** `https://github.com/jcffadev/Shinobibonk.git`, branch `main`. O usuário decidiu **excluir e recriar o repositório** (11/11) para remover do histórico o zip de origem não verificada; até ele dizer que trocou, commit/push segue neste repositório; depois, `git remote set-url origin <novo-url>` + push.
- **Conteúdo:** 56 versões jogáveis · 97 técnicas · 95 itens · 4 mapas · 19 pílulas · árvore permanente · oficina de fusão · Caça-Níquel da Tsunade · trilha sonora (15 faixas) · sons de jutsu reais (YOO + Kage Bunshin + Shinra Tensei) · HUD ninja · planner em tabela · Fusões · Táticas de Missão.
- **Pendências vivas:** ver `docs/13-PENDENCIAS-PARA-CONTINUAR.md` (fila) e `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` §6 (pendências vivas).
- **Backup:** `backup-ShinobiBonk-2026-11-12.zip` na raiz do workspace (fora da pasta do projeto) — 980 MB · 2.882 arquivos · 0 `node_modules`.

## 7. Skills do projeto (como trabalhar)

- `skills/contexto-e-decisao/SKILL.md` — **primeiro passo** de qualquer agente: ler contexto → usar skills → decidir → fechar com registro + push.
- `skills/documentar-projeto/SKILL.md` — documentar TUDO (CHANGELOG + docs/14 + docs/18 + docs/19 + commit + push).
- `skills/publicar-github/SKILL.md` — commit + push controlado (stage por nome, nunca `git add -A`).
- `skills/criar-arte-shinobibonk/SKILL.md` — identidade visual chibi 2.5D, proporções, cores, roupas, acessórios, contornos, sombreamento.
- `skills/movimentar-shinobi/SKILL.md` — regras de animação (andar atacando, encadeamento, proporção idêntica).
- `skills/referencia-externa/SKILL.md` — material do jogo de referência: consumir, anotar fora do projeto, nunca salvar no projeto.

## 8. Regras de push seguro (paralelismo de sessões)

**Perigo nº 1: sessão paralela (Claude Code) no mesmo repo.** SEMPRE:
```
git fetch origin main
git rev-list --left-right --count main...origin/main
```
Se o remoto avançou (`0 N` com N>0): `git pull --rebase origin main` + push de novo. **Nunca force push.**
