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
- `ABRIR_JOGO.bat` usa o Node instalado pelo Codex em `%USERPROFILE%\.cache\codex-runtimes\...` e as dependências já presentes em `node_modules`. Sem esse Node, o script pede para instalar Node.js LTS e pnpm.
- `node scripts/verify-rules.mjs` verifica as regras puras (elenco, técnicas, itens, crítico, raridade, atributos).
- `scripts/verify-runtime.mjs` e `scripts/smoke-browser.mjs` rodam testes no navegador com Playwright e Microsoft Edge. Os caminhos de ambos estão fixados para este computador.

## Estrutura

- `src/main.tsx`: hub, elenco, ataques, plano de build, árvore permanente, loja, missões, HUD da run e modais.
- `src/scene/GameCanvas.tsx`: cena Three.js e simulação da run (jogador, terreno, inimigos, técnicas, aliados, drops, eventos, zonas e câmera).
- `src/scene/techniqueEffects.ts`: visuais das técnicas. Dano e hitbox ficam na simulação.
- `src/scene/bossCombat.ts`: chefes (mega elites e guardiões), com barra de vida e técnicas do personagem com aviso no chão.
- `src/game/`: dados e regras sem React.
  - `heroes.ts`: 22 shinobis e 88 técnicas.
  - `catalog.ts`: 36 itens e sorteio por raridade.
  - `progression.ts`: atributos, dificuldade e crítico.
  - `evolution.ts`: formas por nível.
  - `combat.ts`: afixos de técnica.
  - `preparation.ts`: árvore permanente e carteira.
  - `missions.ts`: três zonas.
  - `pills.ts`: 18 pílulas.
  - `tuning.ts`: parâmetros de balanceamento do modo debug (salvos e aplicados em todas as runs).
  - `rewards.ts`: Lamens ganhos pelo desempenho da run.
- `src/ui/`:
  - ficha da run (`RunSheet`);
  - resumo pós-run (`RunSummary`);
  - painel de debug (`DebugPanel`);
  - ícones de pílula (`PillIcon`);
  - cartões de ajudantes (`AllyCards`);
  - plano de build, filtros e ícones de técnica.
- `src/audio/sfx.ts`: efeitos sonoros sintetizados no navegador.
- `src/style.css`, `src/run-ui.css`, `src/sealing.css`, `src/summary.css`, `src/debug.css`, `src/hud-dock.css`: estilos do hub, da HUD/ficha, do selamento, do resumo pós-run, do debug e do bloco inferior (pílulas acima das habilidades).
- `public/assets/`: atlas e sprites provisórios (retratos, evoluções, cenário, ícones de itens, SVGs por shinobi).
- `scripts/` e `update-*.mjs` (raiz): scripts de manutenção que o Codex usou para editar o código por substituição de texto, mais os verificadores. Os `update-*.mjs` e `scripts/integrate-*.mjs` já foram aplicados; rodá-los de novo falha ou duplica alterações.
- `artifacts/`: screenshots reais e resultados JSON das verificações automatizadas.
- `game/index.html`: versão Canvas 2D preservada. Não é a entrada principal.
- `history/`: versões antigas (v0.1–v0.5.2). Não é fonte da verdade.
- `docs/`: requisitos, decisões de produto e estado do projeto.
- `skills/documentar-projeto/SKILL.md`: rotina para manter os Markdown sincronizados a cada alteração.
- `skills/publicar-github/SKILL.md`: rotina de commit e push para o GitHub ao fim de cada atualização. `.claude/skills/publicar-github/` aponta para ela, para uso no Claude Code (`/publicar-github`).
- `.gitignore`: exclui `node_modules/`, `dist/`, segredos, `Feedback da versão.txt` (tem credenciais) e a prévia com marca d'água.
- `assets/referencia/prints/`: capturas de referência, a maioria de outro jogo. Os 50 originais do chat ficam em `originais/`.
- `references/`: `concept_art/` são artes conceituais geradas; `screenshots/` são capturas do protótipo 2D antigo.

## Controles durante a run

- WASD ou setas: mover (relativo à câmera).
- Botão direito + arrastar: girar/inclinar a câmera. Scroll: zoom.
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
