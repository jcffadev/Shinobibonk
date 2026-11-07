# Pendências para continuar (estado em 06/11/2026, commit 24ab2de)

Levantamento feito ao fim da sessão do Claude Code para continuar no Codex. Tudo abaixo está **PENDENTE** salvo indicação.
Antes de mexer: leia AGENTS.md (regras e invariantes), README.md, docs/00 e docs/12. Verificação padrão:
`tsc --noEmit -p .`, `vite build`, `node scripts/verify-rules.mjs`, `node scripts/verify-runtime.mjs` (Node do Codex em
`%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`; git em `C:\Program Files\Git\cmd\git.exe`).

## Fila do Codex
- **IMPLEMENTADO** — folhas direcionais de caminhada nas 56 formas dos 24 shinobis jogáveis. Os 20 shinobis deste lote acrescentam 45 formas ao Time 7 e Asuma.
- **IMPLEMENTADO NESTE LOTE** — quadros de conjuração do Naruto Clássico, ataque/pulo/dash de Sasuke inicial e socos/chutes nas três formas de Rock Lee e Might Guy.
- **PENDENTE** — revisar caminhada, ataque, pulo e dash/esquiva de todo o elenco por forma, inclusive transição do sprite estático para as ações. Priorizar formas com pose procedural e validar os quadros em jogo. Dano, Ultimate e animação dos monstros permanecem na fila.
- **IMPLEMENTADO (06/11/2026)** — versões separadas: 56 versões jogáveis de 24 famílias com cadeia de missões (`playWith`). **PENDENTE**: balancear kits, passivas e números das missões jogando; testar uma run real sem `?test` até o Shinobi para selar da versão surgir (o teste automático confere `accountCandidates`, não o selamento completo); decidir se ajudantes/mega elites também podem ser versões avançadas (hoje só shinobis base).
- **IMPLEMENTADO** — cinco folhas direcionais de ataque, pulo e dash para Sasuke Rinnegan, Itachi Akatsuki e Madara Armadura/Rinnegan/Seis Caminhos. Validação visual de uma missão real com cada versão e ajudante continua na fila.
- **PENDENTE (Susanoo WebGL)** — no trabalho local, o rig se baseia na Narutopedia. Validar estilo por lançador (Madara azul com lâminas, Sasuke roxo com arco, Itachi vermelho/laranja com Totsuka e Yata), Suporte, Ultimate e prévia. O rascunho de Kakashi usa Kamui, e a fase correspondente ainda não existe no elenco.
- **FOLHAS QUE FALTAM PARA O CODEX (versões separadas)** — repouso vem do sprite estático em todas. Caminhada direcional existe em todas. Onde falta ação, `playerMotion` usa pose procedural (squash/stretch no pulo, inclinação e rastro no dash, deformação de braços no ataque):
  - **Completas (repouso, caminhada, ataque, pulo, dash)**: Naruto Academia (`naruto`), Sasuke Genin (`sasuke`), Neji Genin e Neji Jonin (folha acrobática; ataque usa os mesmos quadros), Asuma.
  - **Falta pulo e dash**: Naruto Genin (`naruto-genin`, forma 10), Naruto Shippuden (25), Naruto Kyuubi (50) — já têm conjuração; Rock Lee Genin/Shippuden/Portões e Might Guy Jonin/Sexto/Sétimo Portão — já têm socos e chutes.
  - **Falta ataque, pulo e dash**: Sasuke Shippuden (15); Sakura Genin (1), Shippuden (15) e Byakugou (30); Gaara Genin/Kazekage/Aliança (1/15/30); Hashirama Hokage/Sábio (1/20); Kakashi Jonin/Hokage (1/25); Itachi ANBU (1); Minato Jonin/Hokage (1/15); Tsunade Sannin/Hokage/Byakugou (1/15/30); Jiraiya Sannin/Sábio (1/20); Orochimaru Sannin/Som (1/15); Hinata Genin/Shippuden/Leões (1/15/30); Shikamaru Genin/Estrategista/Conselheiro (1/15/30); Temari Genin/Shippuden (1/15); Tenten Genin/Shippuden (1/15); Kankuro Genin/Shippuden/Aliança (1/15/30); Pain, Tobirama e Kushina (1).
  - Para novas folhas completas, usar atlas 4×4 em `public/assets/shinobi-motion/<família>-<forma>-action-v2.png`, com conjuração frente/costas e pulo/dash frente/costas. Registrar em `actionArt` com `kind: 'full'`.
- **REGRA DE ENTREGA** — novos shinobis e evoluções precisam vir com repouso, caminhada, ataque, pulo e dash/esquiva. Atualizar as skills, documentação, contexto e GitHub a cada entrega.
- **IMPLEMENTADO:** fila de confirmação para itens da roleta, pílulas e habilidades reservadas para level-up, teto de quatro ofertas, contagem do ajudante com o mesmo ID do jogador, contador real da horda e inclinação da câmera por movimento do mouse.
- **Atlas de habilidades**: integrado ao HUD, às escolhas, ao elenco e ao plano de missão.
- **IMPLEMENTADO** — efeitos por natureza e golpes característicos, com impactos nos inimigos. **PENDENTE** — refinamento de efeitos por técnica e sons. O usuário reprovou os sons do pacote `artifacts/sb-swishes-source.zip` (licença não verificada). Procurar outros sons com licença livre verificada.
- **Atributos até nível 50**: recalibração pendente; o bônus de +0,8% quando acabam os upgrades é regra separada (`powerlevel.ts`).
- **Chão nas bordas**: relevo e céu em gradiente em `terrainArt.ts`. Falta conferir mais climas e os extremos do mapa em jogo.
- **IMPLEMENTADO** — revisão de Chōmei e Gyūki com as referências do usuário e botões de raridade na Bolsa da Missão. Progressão: bônus aleatório de 0,8% implementado e recalibração geral pendente.
- Skills do Codex: `skills/criar-arte-shinobibonk` (padrão de arte de shinobis, itens, pílulas, cenários) e `skills/movimentar-shinobi` (movimento, pulo, dash, sprites de animação), com ponteiros em `.claude/skills/`.
- Testes atualizados ao trabalho do Codex: o selamento espera o ritual terminar (navegador de teste roda a poucos FPS); vitória por gancho `finishMission` (a missão agora termina no portal de saída); saída da partida pela pausa (Esc → Salvar e sair).

## Final Swarm, pílulas e altares (06/11/2026)
- **IMPLEMENTADO e TESTADO (headless)** — Final Swarm cresce além de 1.600 até `FINAL_SWARM.maxEnemies` = 8.000; pílulas só por escolha (`CHOICE_GUARD` 0,5 s); altares por raridade começam ao pisar e caem fora do círculo (`ALTAR_RULES`).
- **PENDENTE** — medir FPS com 4.800–8.000 inimigos em GPU real; se cair demais, baixar `FINAL_SWARM.maxEnemies`. No headless (SwiftShader) ficou em ~20 FPS tanto com 1.600 quanto com 8.000.
- **PENDENTE** — confirmar jogando que não há mais pílula "sozinha". Se ainda ocorrer, observar se o jogador clica de forma contínua (a proteção cobre só os primeiros 0,5 s de cada conjunto de cartas). Ondas dedicadas durante o altar continuam pendentes.

## Desempenho com 1.600 inimigos

- **IMPLEMENTADO** — o código do Claude agrupa corpos, contornos e avisos dos inimigos comuns e elites em lotes instanciados.
- **TESTADO** — `verify-runtime` mediu 1.600 inimigos em movimento no Edge headless com ANGLE/SwiftShader. A amostra de 2,51 s ficou em 6,77 FPS e 101 chamadas de desenho no quadro final. O resultado mede renderização por software. **PENDENTE** — medir em GPU no navegador normal antes de declarar desempenho suficiente.

## HUD — correção de alinhamento (pedido do usuário, 06/11/2026; print com Naruto Nv. 194, 5 ajudantes, ~80 itens)
- **Ajudantes** — FEITO: cartões compactos com 4+ ajudantes e coluna limitada acima do dock, com rolagem (Codex). Painel SINERGIAS recolhível pelo título, estado salvo em `localStorage` (`shinobibonk.hud.synergiesCollapsed`).
- **Pílulas** — FEITO (Codex): dock de pílulas compacto acima das habilidades, sem faixa; não fica mais sob os cartões.
- **Ícones de habilidades** — FEITO: com 5 ajudantes a coluna termina antes do dock (1366×768: coluna até y=538, dock a partir de y=563).
- **Itens** — FEITO: grade limitada a 3 linhas com rolagem e ícones de 25 px (Codex); contador de quantidade com fundo escuro e fonte 9 px. PENDENTE opcional: botão de expandir a grade.
- **Mapa/minimapa** — FEITO: marcadores em raio de 38% e pontos de inimigo em raio circular de 45% (não cortam na borda); rótulo "Tab rápido · M mapa" sob o círculo; selo DEBUG e painel abaixo do rótulo, acompanhando a escala do HUD/minimapa.
- **Informações da missão no topo** — FEITO: grade em blocos (missão + clima/zona | relógio grande ou FINAL SWARM | Ryu curto + kunai/shuriken) e preços em linha secundária menor, todos em `compactNumber`. Avisos (toasts) ficam abaixo da barra.
- **Validação** — TESTADO em Edge headless (1440×900 e 1366×768, 5 ajudantes, 80 itens, Nv. 194, 123.456.789 Ryu), sem sobreposição medida entre barra, minimapa, rótulo, DEBUG, ajudantes, dock e itens. PENDENTE: conferir com 4 técnicas aprendidas e em resoluções menores que 1050 px.

## Pílulas, pergaminhos e listas em casa (06/11/2026)
- **FEITO** — pílulas com "atributo atual → novo" (cartas, ficha P, plano de build, tooltip da barra). Prévia aproximada: o bônus aleatório por nível (powerlevel) e bônus condicionais de combate não entram. PENDENTE opcional: prévia no Ichiraku ao esquecer pílula.
- **FEITO** — "Melhora:" dos pergaminhos de elemento lista só técnicas do mesmo elemento.
- **FEITO** — sub-aba "Itens em casa" na Bolsa da Missão com até 12 listas (nome, descrição, aplicar, duplicar, apagar). PENDENTE opcional: reordenar listas e escolher ícone próprio.

## Feito em 06/11/2026 (validar jogando)
- Técnicas por fase da obra, Invocação do Sapo, escala da horda até 1600, Final Swarm, pílulas com raridade, sorte, roleta nerfada e economia exponencial (ver CHANGELOG).
- Pendências desses itens: Ryu em formato curto (`compactNumber`) no HUD, preços da barra, roleta, mercador/prêmio e toasts — FEITO; Ryu por abate não escala com o tempo (ajustar se o fim ficar caro demais); saves antigos podem restaurar `pendingItemRewards` de drops antigos; slider `itemDrop` do debug não tem mais efeito; Ultimate por fase (Rasenshuriken só no Shippuden) é proposta que conflita com "Ultimate desde o Nv. 1"; fala e efeito visual próprios da Invocação do Sapo.

## Pedidos do usuário em 06/11/2026 (PENDENTES)
- **Escala do jogo** — FEITO em parte: inimigos exponenciais com o tempo, resistência crescente e hordas até 1400 (`ENEMY_SCALING`). FALTA: crescimento grande do dano pelas técnicas (ex.: +X% de dano por nível de técnica, mais projéteis), dano megacrítico, níveis de "Treino" após acabarem os upgrades (referência do vídeo: nível 1254, dano +2484%, técnicas Nv. 10 com +300%/nível). Referência original: dano do shinobi crescendo de forma exponencial, HP dos monstros subindo, hordas crescendo com o tempo, inimigos ficando mais fortes e resistentes até forçar o jogador a pular de zona.
- **Recalibração de atributos para todos os níveis** (não só até o 50).
- **Sorte** — FEITO (06/11/2026): curva de raridade e chance de uma quarta carta com Sorte. Validar jogando.
- **Roleta da Tsunade** — FEITO: entrega em fila, E aceita e V vende. Novos giros excluem pílulas; itens que ficarem no limite viram Ryu. Validar jogando.
- **Animações** — as folhas de caminhada estão integradas. A revisão de consistência e a criação de quadros próprios de ataque, pulo e dash por forma seguem conforme a fila acima. Consulte as skills `movimentar-shinobi` e `criar-arte-shinobibonk`.

## Calibração com ponto de partida
- O usuário quer um ponto inicial de calibração baseado no PokéBonk. Fonte permitida: wiki pública (https://pokebonk-wiki.wiki) e observação de vídeos/prints de gameplay. Não fazer engenharia reversa do aplicativo. Levantar: crescimento de técnicas por nível, upgrades, curva de nível/Treino, inimigos por minuto, HP/dano por zona.
- **FEITO (levantamento)** — [docs/15-CALIBRACAO-REFERENCIA.md](15-CALIBRACAO-REFERENCIA.md): tabelas ref. × atual × proposta. Nenhum valor alterado. **AGUARDANDO O USUÁRIO** (seção 7 do doc): venda de item proporcional ao preço da kunai, Ryu por abate com inflação, HP do guardião pelo dano do jogador e teto de golpe de chefe, preços dos desbloqueios estruturais, máximos das passivas, Atualizar/Pular/Banir 2/2/1, opção de desenhar só os N inimigos mais próximos. A wiki não publica a curva de HP por minuto: segue PENDENTE medir por vídeo.

## Decisões aguardando o usuário
1. **Hospedar a Alpha**: escolher GitHub Pages (repo precisa ficar público; criar workflow + `base` no vite.config), Netlify/Vercel/Cloudflare Pages (aceita repo privado) ou itch.io (zip do `dist`).
2. **Coluna "Passivas" na ficha (P/Esc)**: o usuário estranhou buffs no nível 1; vêm das Passivas Shinobi compradas. Proposta: mostrar coluna Base · Passivas · +Nível · Total em `src/ui/RunSheet.tsx`.
3. **Animações**: procedural (balanço, inclinação, squash no pulo, rastro no dash, recuo ao lançar) já é possível; sprite sheets dependem de arte. Direção preferida: personagem 3D low-poly com aparência pixelada (ver AGENTS.md, direção de arte).

## Arte
- **Sprites a revisar no Codex** (gerados por código, fora do padrão do atlas): **Iruka** (`public/assets/shinobis/iruka-1.svg`), **Ebisu** (`ebisu-1.svg`) e **Kushina** (`kushina-1.svg`), todos em `scripts/generate-sprites.mjs` (`--npcs`). Também procedurais: drops e kunai/shuriken no chão (`src/scene/dropSprites.ts`).
- Rever níveis de liberação de técnicas por fase do personagem (ex.: técnicas da fase Shippuden só nos níveis altos); hoje só Naruto (Modo Sábio 25) e Sasuke (Amaterasu 25) foram ajustados.
- Revisar **Iruka, Ebisu e Kushina** (`scripts/generate-sprites.mjs --npcs`, SVG) seguindo a receita de arte do AGENTS.md. Kushina ainda não tem célula no atlas `shinobi-roster-v2.png` (usa `NPC_PORTRAITS`).
- Tela "Escolha o mapa": a prévia usa gradiente CSS por mapa, não captura real do cenário.
- Mapas: Areia/Pedra/Névoa mudam só paleta, tinta e pesos do atlas de cenário; faltam objetos próprios (cactos, rochas, pontes, água).

## Sistemas "em breve" (aparecem desativados na UI)
- **Mochila** (itens levados antes da partida) na tela do mapa: sistema ainda a definir com o usuário.
- **Modo Sobrevivência**.
- Configurações: música/trilha, tremor de tela, brilho dos efeitos, mira manual, controle (gamepad), outros idiomas, tema claro, dicas das primeiras partidas.
- **Pulo e deslize** (teclas e itens da referência: +1 pulo, onda ao aterrissar, invulnerável no deslize etc.).

## Mecânicas incompletas
- Selamento de Mega Elite com até 3 tentativas/falha/fuga (invariante do AGENTS.md) e minigame: não implementado (hoje sempre sela).
- Aviso na tela ao ativar sinergia.
- "EXP necessária por nível" do debug só vale a partir do próximo nível.
- Debug: `setAllUnlocked` (account.ts) existe, mas não há botão "desbloquear tudo / resetar conta" no painel F9.
- Missões de desbloqueio com requisitos de história e abates: regras e UI prontas, **não testadas numa run real** até o shinobi surgir (testes automáticos usam `?test`, que não gera o Shinobi para selar). Testar sem `?test` ou criar hook.
- Alvo fixo (botão direito): implementado; falta tecla remapeável própria e indicador no HUD.

## Balanceamento (todos os valores são provisórios)
- Itens (94), pílulas (19), passivas (25), sinergias/combos, afinidade, setups, Senjutsu (25% · 1,5×), roleta, tiers de inimigo (elite 95 HP/30% defesa; mega 420 HP/55%), lamen de cura (até 5%/35%), abates e minutos das missões, custo da roleta.
- O limite da horda e a amostra de desempenho estão registrados na seção de desempenho acima.

## Divergências canônicas registradas (Narutopedia), não alteradas
- Orochimaru só como Vila do Som (canonicamente também Konoha/Akatsuki); Temari só Areia (também ligada a Konoha).

## Testes
- `verify-runtime` tem uma checagem instável de saldo de Ryu (um drop coletado durante a compra da kunai); rodar de novo resolve; correção sugerida: `clearEnemies` antes da compra.

## Próxima revisão após este lote

1. Revisão visual individual das ações nas 56 formas e em suporte. Há caminhada direcional para todas, ações dedicadas para as formas registradas em `actionArt` e poses procedurais compartilhadas onde ainda faltam folhas. Naruto Academia e Neji receberam folhas novas neste lote. As ações dedicadas de pulo/dash das demais formas do Naruto permanecem na fila.
2. Medir escala no meio e no final de missões reais. Comparar níveis, DPS, HP/defesa do guardião e abates por segundo. A curva já produz valores de milhões em mega elites e ~1 bilhão no cenário de guardião informado. O vídeo fornecido documenta a abertura.
3. Medir 1.600 inimigos com GPU real, em diferentes climas, e continuar validando o chão nas bordas. Sons novos dependem de fontes com licença verificável.
