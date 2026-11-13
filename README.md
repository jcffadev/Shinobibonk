# ShinobiBonk

Protótipo jogável de um survivor roguelite inspirado no universo ninja. A base atual é React/TypeScript com cena Three.js isométrica (versão `0.6.0` no `package.json`). O protótipo Canvas 2D antigo fica preservado em `game/index.html`.

Repositório: https://github.com/jcffadev/Shinobibonk

## Começar

Requisitos: Node.js compatível com Vite 8 (testado com Node 24.22) e pnpm.

```sh
pnpm install
pnpm dev
```

Abra o endereço local do Vite. `pnpm build` executa `tsc -b` e `vite build`.

Atalhos locais:
- `ABRIR_JOGO.bat` acha o Node (runtime do Codex em `%USERPROFILE%\.cache\codex-runtimes\...` ou o do PATH) e, se o `node_modules` estiver ausente ou quebrado (ex.: pasta movida), reinstala as dependências sozinho. Opções: `--no-open`, `--port N`.
- Interface com tema ninja em `src/ninja-theme.css`; fontes Reggae One e Baloo 2 (OFL) locais em `public/assets/fonts/`. Prévias e capturas: `docs/previas/hud-ninja/`. Deploy: `netlify.toml` (build com pnpm, publica `dist`). Sem esse Node, o script pede para instalar Node.js LTS e pnpm.
- `node scripts/verify-rules.mjs` verifica as regras puras (elenco, técnicas, itens, crítico, raridade, atributos).
- `scripts/verify-runtime.mjs` e `scripts/smoke-browser.mjs` rodam testes no navegador com Playwright e Microsoft Edge. Os caminhos de ambos estão fixados para este computador.

O perfil local mostra um Guest numerado até o cadastro. Criar conta preserva o progresso do convidado e habilita **Iniciar Missão** no hub. A conta é armazenada no navegador.

## Estrutura

O elenco atual tem 56 famílias de shinobis e 96 versões jogáveis separadas (ex.: Naruto Academia, Genin, Shippuden e Kyuubi), cada uma com kit, passiva e atributos da fase, folhas direcionais de caminhada e 177 técnicas de kit no total. Cada versão nova é liberada por missão jogando com a anterior. As folhas usam o sprite estático da forma como referência. A horda escala até 1.600 inimigos aos 10 min; no Final Swarm o teto triplica e continua crescendo até 8.000 (`FINAL_SWARM` em `src/game/progression.ts`). O HUD exibe o total de abates e de inimigos vivos. Consulte [elenco e missões](docs/21-ELASTAO-DE-HEROIS.md) e [auditoria dos efeitos](docs/24-AUDITORIA-DE-EFEITOS.md).

O Naruto Clássico tem quadros de conjuração. Sasuke inicial tem quadros de ataque, pulo e dash. Rock Lee e Might Guy têm socos e chutes em suas três formas. Sasuke Rinnegan, Itachi Akatsuki e as três versões de Madara têm folhas próprias de conjuração, pulo e dash em frente e costas. A cobertura das demais ações está na [fila](docs/13-PENDENCIAS-PARA-CONTINUAR.md).

As técnicas combinam efeitos por natureza com visuais próprios para golpes como Rasengan, Chidori e Dragão de Água. A Bolsa da Missão tem filtros por raridade, e os visuais revisados de Chōmei e Gyūki aparecem na arena final.

O [contexto permanente de perguntas e respostas](docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md) guarda a direção da conversa e o resumo de todas as rodadas; o [texto integral do chat](docs/14-CONTEXTO-DO-CHAT.md) está em docs/14. A calibração com o jogo está em andamento ([fila de pendências](docs/13-PENDENCIAS-PARA-CONTINUAR.md)) e o [changelog](CHANGELOG.md) acompanham o trabalho.

- `src/main.tsx`: hub, elenco, ataques, plano de build, árvore permanente, loja, missões, HUD da run e modais.
- `src/scene/GameCanvas.tsx`: cena Three.js e simulação da run (jogador, terreno, inimigos, técnicas, aliados, drops, eventos, zonas e câmera).
- `src/scene/techniqueEffects.ts`: visuais das técnicas. Dano e hitbox ficam na simulação.
- `src/scene/bossCombat.ts`: chefes (mega elites e guardiões), com barra de vida e técnicas do personagem com aviso no chão.
- `src/game/`: dados e regras sem React.
  - `heroes.ts`: 56 famílias e 96 versões (`HERO_VERSIONS`, `familyOf`), 177 técnicas (1–2 únicas por versão, exclusivas da família, + compartilhadas), pool por vila/elemento, clãs, organizações e afinidade elemental.
  - `account.ts`: shinobis jogáveis, selados, pesquisa de técnicas e progresso por mapa.
  - `maps.ts`: 4 mapas temáticos (Folha, Areia, Pedra, Névoa Oculta).
  - `unlockMissions.ts`: missões de desbloqueio, Lendários e cadeia das versões (`playWith`).
  - `enemyTiers.ts`: inimigo normal, elite amarelo, Mega Elite e Shinobi para selar.
  - `synergy.ts`: sinergias de vila e organização entre herói e ajudantes.
  - `roulette.ts`: Caça-Níquel da Tsunade (ex-"Roleta da Tsunade").
  - `settings.ts`: configurações do jogador.
  - `npcs.ts`: eventos do Ebisu e do Iruka, Iruka como ajudante e regras do Naruto Totem.
  - `catalog.ts`: 95 itens no formato da referência (raridade · efeito · gatilho · limite) e sorteio por raridade.
  - `progression.ts`: atributos, dificuldade e crítico.
  - `evolution.ts`: formas de cada família; cada versão usa a sua forma fixa.
  - `combat.ts`: afixos de técnica.
  - `preparation.ts`: árvore permanente e carteira.
  - `missions.ts`: três zonas e HP do guardião invocável.
  - `pills.ts`: 19 pílulas.
  - `tuning.ts`: parâmetros de balanceamento do modo debug (salvos e aplicados em todas as runs).
  - `rewards.ts`: Lamens ganhos pelo desempenho da run.
  - `allies.ts`: buff único de cada shinobi como ajudante.
- `src/ui/`:
  - ficha da run (`RunSheet`);
  - resumo pós-run (`RunSummary`);
  - painel de debug (`DebugPanel`);
  - ícones de pílula (`PillIcon`);
  - cartões de ajudantes com passiva e painel de sinergias (`AllyCards`);
  - seleção de shinobi com retratos e filtros (`CharacterSelect`);
  - plano de build, filtros e ícones de técnica.
- `src/audio/sfx.ts`: efeitos sonoros sintetizados no navegador.
- `src/style.css`, `src/run-ui.css`, `src/sealing.css`, `src/summary.css`, `src/debug.css`, `src/hud-dock.css`, `src/hud-layout.css`: estilos do hub, da HUD/ficha, do selamento, do resumo pós-run, do debug, do bloco inferior (pílulas acima das habilidades) e do alinhamento do HUD em jogo (barra da missão, minimapa, selo DEBUG, sinergias).
- `public/assets/`: atlas e sprites provisórios (retratos, evoluções, cenário, ícones de itens, SVGs por shinobi).
- `scripts/` e `update-*.mjs` (raiz): scripts de manutenção que o Codex usou para editar o código por substituição de texto, mais os verificadores. Os `update-*.mjs` e `scripts/integrate-*.mjs` já foram aplicados; rodá-los de novo falha ou duplica alterações.
- `artifacts/`: screenshots reais e resultados JSON das verificações automatizadas.
- `game/index.html`: versão Canvas 2D preservada. Não é a entrada principal.
- `history/`: versões antigas (v0.1–v0.5.2). Não é fonte da verdade.
- `docs/`: requisitos, decisões de produto e estado do projeto.
- `skills/documentar-projeto/SKILL.md`: rotina para manter os Markdown sincronizados a cada alteração.
- `skills/criar-arte-shinobibonk/SKILL.md` e `skills/movimentar-shinobi/SKILL.md` (criadas no Codex): padrão para criar arte (shinobis, itens, pílulas, cenários) e para movimento/animações (pulo, dash, caminhada).
- `skills/publicar-github/SKILL.md`: rotina de commit e push para o GitHub ao fim de cada atualização. `.claude/skills/publicar-github/` aponta para ela, para uso no Claude Code (`/publicar-github`).
- `.gitignore`: exclui `node_modules/`, `dist/`, segredos, `Feedback da versão.txt` (tem credenciais) e a prévia com marca d'água.
- `assets/referencia/prints/`: capturas de referência, a maioria de outro jogo. Os 50 originais do chat ficam em `originais/`.
- `references/`: `concept_art/` são artes conceituais geradas; `screenshots/` são capturas do protótipo 2D antigo.

## Controles durante a run

- WASD ou setas: mover (relativo à câmera).
- Mover o mouse gira e inclina a câmera. Clique direito fixa o alvo. Scroll controla o zoom.
- Tab: mapa rápido. M: mapa completo (clique marca ping). P: ficha/build/pool. Esc: fecha painel.
- E: interagir/coletar; perto de mega elite derrotado, sela.
- G: ping “Aqui”; na decisão de selamento, recusa e deixa uma kunai grátis.
- R: Ultimate manual.
- Y: liga/desliga a Ultimate automática. O clique no selo AUTO do botão R faz o mesmo.
- H: oculta projéteis, efeitos e números sem desligar dano.
- Escolha de recompensa: clique ou 1–4. F atualiza, X pula, Z ativa o modo banir.
- F9 ou a tecla à esquerda do 1: abre/fecha o painel de debug (só rodando localmente com `pnpm dev`/`ABRIR_JOGO.bat`).

## Modo debug

Não há login. O painel existe só no servidor de desenvolvimento (`import.meta.env.DEV`); a build de produção não o inclui. Durante a missão, F9 abre o painel, que mostra valores ao vivo e permite ajustar, **no meio da run**:
- **Inimigos:** HP (inclusive dos que já estão vivos), dano, velocidade, spawn e teto de vivos.
- **Personagem:** dano e recarga da Ultimate.
- **Ganhos:** EXP e Ryu por coleta.
- **Drops:** chance de Ryu, Chakra, pílula e item. O painel mostra a chance efetiva.

Cada ajuste é salvo no navegador (`sb_debug_tuning_v1`) e passa a valer em **todas as próximas runs**, mesmo com o painel fechado, até "Restaurar padrões". O botão mostra "ajustes ativos" quando algo difere do padrão. Há também "Copiar JSON" e "Colar JSON" para guardar ou reaplicar um balanceamento.

O painel também permite:
- dar itens e pílulas;
- mudar nível, HP, Chakra e Ryu;
- gerar mega elites, limpar inimigos, avançar o tempo e congelar a simulação.

## Estado e limites

O estado completo está em [docs/12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](docs/12-ARQUITETURA-E-ESTADO-DO-CODIGO.md) e o resumo em [docs/00-LEIA-PRIMEIRO.md](docs/00-LEIA-PRIMEIRO.md).

Esta é uma base de protótipo. Arte, animações, balanceamento, mapas por bioma, contas, persistência online e multiplayer ainda precisam de trabalho. As imagens em `assets/referencia/prints` e `references/concept_art` são referências visuais, não screenshots do executável.

Personagens e nomes do universo Naruto são propriedade de terceiros. Publicação pública depende de licença (ver [docs/10](docs/10-PLANEJAMENTO-FUSAO-PROGRESSAO-V05.md)). A imagem `animação do personagem.jpeg` na raiz é uma prévia de banco de imagens com marca d'água e não pode virar asset sem licença.

### Preparação e controles

Escolher o shinobi atualiza o painel, preservando a cena de fundo. A região é escolhida na tela de mapas e a arena 3D é criada ao começar. Na preparação, abra uma técnica para ver seus atributos base e uma demonstração com alvos. Cada shinobi pode bloquear até 60% das técnicas que pode aprender. Planejar marca a técnica para a missão. Com o Treinamento com Jiraiya, até quatro técnicas planejadas podem ser treinadas (+15% de dano). Pílulas podem ser planejadas. Exclusão de itens continua na Bolsa da Missão.

Tab mostra o mapa enquanto pressionado, permitindo movimento. P ou **Ver build e ficha** abre a ficha sobre uma escolha pendente. Esc, perda de foco e F9 liberam a kunai do ponteiro. A escolha final devolve o controle ao jogo. **Reset de conta** confirma antes de limpar o progresso local.


## Oficina e controles · 07/11/2026

A oficina tem abas Fundir e Combinar, com um uso compartilhado por zona salvo na run. WASD muda a direção imediatamente, Tab mantém o mapa rápido sem pausa e P abre/fecha a ficha. O mercador conserva os preços do estoque atual ao comprar ou reabrir. Shurikens amaldiçoadas e corpos de ninja iniciam emboscadas por zona. Veja as regras e as limitações na documentação temática.

## Lote integrado · 07/11/2026

IMPLEMENTADO: integração dos rascunhos do Claude com a main do Codex; retomada da simulação ao fechar Esc sem clique adicional; atlas regionais de Areia, Pedra e Névoa com construções próprias; nove folhas novas de pulo/dash e três folhas completas de ações. TypeScript, build e regras passaram. A auditoria visual das 56 versões e dos mapas permanece PENDENTE. O balanceamento existente foi preservado.

## Lote de animações salvo para continuação · 07/11/2026

IMPLEMENTADO: 24 folhas completas adicionais 4×4 de ataque/selo/pulo/dash: Kakashi 1/25, Itachi 1, Minato 1/15, Tsunade 1/15/30, Jiraiya 1/20, Orochimaru 1/15, Hinata 1/15/30, Pain 1, Shikamaru 1/15/30, Tobirama 1, Temari 1/15 e Tenten 1/15. Todas foram empacotadas em células uniformes e registradas em directionalArt.ts, usado também pelos ajudantes. As três folhas completas de Sasuke 15 e Hashirama 1/20 já foram publicadas no lote anterior. Os prompts e referências estão em docs/arte-atlas-2026-11-07.json, gerados com ImageGen.

IMPLEMENTADO: prévia de Susanoo utiliza o mesmo rig WebGL e partículas do combate, escolhendo o estilo pela família do lançador. TypeScript, build e regras passaram após as mudanças.

PENDENTE: criar folhas completas de Kankuro 1/15/30 e Kushina 1 (quatro versões); revisar/refinar ataques antigos de Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. A existência da folha não confirma que todas as poses foram aprovadas visualmente. Conferir consistência com o sprite parado, frente/costas e dash esquerdo em cada versão e como ajudante.

O script scripts/verify-motion-atlases.mjs exercita o controlador em fixture isolada e produz artifacts/motion-review.json e quatro folhas de contato. A primeira execução tinha duas instâncias de Three.js; corrigido o import por scripts/motion-review-entry.ts. Conferir o resultado final antes de considerar a auditoria completa.

Continuam pendentes: inspeção visual dos quatro mapas, prévias/efeitos em combate de todos os lançadores, sons com licença verificada e uma run prolongada de três zonas até bijuu/saída/ranking. Preservar o balanceamento existente conforme instrução do usuário. Não publicar artifacts/sb-swishes-source.zip: é um arquivo preexistente de origem/licença não verificada.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

A Home tenta iniciar a trilha ao carregar. Táticas de Missão e Arsenal de Missão guardam planos e listas por shinobi. Na missão, o Mega Elite derrotado espera interação com E a até 10 m. Veja [os controles atuais](docs/00-LEIA-PRIMEIRO.md) e [o registro da rodada](CHANGELOG.md).
