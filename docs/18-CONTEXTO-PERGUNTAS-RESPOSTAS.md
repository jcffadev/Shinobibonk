# Contexto Permanente — Perguntas & Respostas

> **Para que serve:** preservar, para sempre, a direção da conversa — o que o usuário pediu, o que foi respondido, o que virou decisão e onde o projeto está. Este é o primeiro arquivo de contexto que qualquer agente (Claude Code, Codex, Bionic) deve ler, depois do `AGENTS.md`, antes de trabalhar.
>
> **Regra permanente de manutenção (todo agente, toda rodada):**
> 1. Ao terminar qualquer solicitação do usuário, atualizar a entrada correspondente em §4 (resumo P/R + estado) e, se for o caso, §5 (estado atual).
> 2. O texto **completo** das mensagens vai em [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) (regra do AGENTS.md); este arquivo guarda o resumo e a direção — não duplicar o texto integral.
> 3. Decisão que se torna permanente: promover para §3 com a data.
> 4. **Nunca apagar entradas passadas.** Mudança de decisão = nova entrada em §3 que referencia a substituída (com data).
> 5. Estados: **CONFIRMADO / IMPLEMENTADO / TESTADO / PROPOSTO / PENDENTE** (regra do AGENTS.md).
> 6. Se a rodada alterou o projeto, sincronizar também README.md, docs/00 e CHANGELOG.md.

## 1. O que é o ShinobiBonk

Survivor/roguelite de ninja (temática Naruto, identidade 100% original) para navegador, inspirado na **experiência** de um jogo de referência externo (nenhum nome, asset ou mecânica copiada; o material de referência foi arquivado fora do repositório em 11/11/2026 — ver §7).

- Mundo 3D estilizado (2.5D) em visão isométrica com relevo, montanhas e construções; personagens em pixel art chibi (billboards), câmera orbital 360°.
- 72 famílias / **114 versões independentes** de shinobis jogáveis (cada versão tem kit, passiva, Ultimate e caminhada próprios); missões em cadeia para liberar versões.
- Runs por zonas com hordas contínuas, eventos, altares, mega elites (selamento), guardiões, Final Swarm, bijū final e ranking local.
- Economia: **Ryu** (run) e **Lamens** (conta, só pelo desempenho da run). Técnicas, pílulas, itens, árvore permanente, oficina de fusão (sapos do monte).
- Stack: React 19 + TypeScript + Three.js, Vite 8 (`src/`). `game/index.html` é o protótipo Canvas 2D legado.
- Publicação: commit + push em português para `origin main`; deploy no Netlify **manual** (pasta `dist` ou zip com `index.html` + `assets/` na raiz — drag & drop instável acima de ~50 MB).

## 2. Direção atual

**25/11/2026.** Codex assume imagem, arte, animação e apresentação visual. Claude Code e Qwen assumem balanceamento e regressões de sistemas. A fila por responsável está em [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md#divisão-entre-os-agentes--25112026).

**25/11/2026.** O momento da invocação do Guardião é uma decisão do jogador. A ameaça do chefe continua crescendo no Final Swarm. O mapa rápido continua interativo durante o movimento e os objetivos de progressão têm destaque em partida.

**14/11/2026.** Prioridade para igualar a cobertura de animações e conferir a seleção da direção real por folha, em todo o elenco. Testes de navegador suspensos para Claude Code, Qwen e Codex até nova autorização explícita. Ver [política central](development/TESTING_POLICY.md).

Rodada 53: manter somente personagens da obra Naruto, com técnicas e efeitos baseados no anime. Elenco atual e limites de fidelidade em [docs/21](21-ELASTAO-DE-HEROIS.md) e [docs/24](24-AUDITORIA-DE-EFEITOS.md).

**Onde estamos:** o jogo roda no Netlify (404 resolvido — era upload parcial); o ajuste automático de desempenho foi **removido a pedido do usuário** — a imagem fica 100% nas configurações de Gráficos (Qualidade, Limite de FPS, Resolução); agora Gráficos também tem **V-Sync (ligado/desligado)** e **placa de vídeo** (automática/alto desempenho/integrada), e a **câmera perdeu a suavização** (zoom/altura instantâneos); o personagem **continua andando durante o ataque normal** (o golpe sai dos braços; a Ultimate mantém a pose especial) e os anéis de efeito usam cache de geometria (sem realocar a cada uso) — tudo pensando no **.exe/patch do jogo**, onde o usuário quer ligar/desligar V-Sync, escolher a placa de vídeo e o renderizador (OpenGL/DirectX); **PENDENTE**: validar FPS em GPU real. O material do jogo de referência saiu do projeto e vive numa pasta arquivada na raiz do workspace (fora do repositório). **Rodada 34 (11/11/2026)** endureceu o jogo conforme o usuário: early game mais difícil em **todas** as dificuldades (Genin perdeu o desconto inicial de 66%; base do minuto 0 HP ×1,6 / dano ×1,45, decaindo proporcionalmente), dificuldade **individual por zona** (Z2 ×1,18 · Z3 ×1,38), scale de habilidades elevado (base do crescimento ×1,5 em todas as raridades + escala global de dano das técnicas ×1,2), números de dano podem seguir **spammando** (teto 60→300), ficha com a **tabela de utilidades** de volta (9 linhas) e **gráfico de crescimento por nível** por técnica (referência visual: vídeo externo, arquivado FORA do repositório), e Treinamento esgotado agora sobe **somente Sorte**. Nas configurações, nova opção de **Renderizador (DirectX/OpenGL)** na aba Tela — preparo do .exe/patch. Kankuro **resolvido** (arte confirmada no repositório); Kushina (1) pendente. **Rodada 35 (12/11/2026)** foi **somente de plano** (o usuário pediu o retorno **antes** de autorizar a implementação): mega-lote de ~28 itens — (a) **regras permanentes novas**: escopo restrito a `C:\Shinobibonk projeto - Copia` (nada em Windows; navegador só para testes; aprovação automática de acesso) e **descartar "desenvolvimento novo que já está no jogo" + listar os descartes**; (b) **sons**: "YOOOO" no botão Jogar (o sintetizado já existe; o **áudio real** entra quando o usuário baixar — o agente **não consegue** baixar do YouTube nesta sessão) + efeitos de jutsu com **default** + **anti-spam = o próximo som só toca quando o anterior TERMINA (não é fila)**; (c) **regressão reportada**: ao andar, o personagem **perdeu a animação de ataque** (a implementação de 11/11 suprime o quadro de ataque durante a caminhada — `playerMotion.ts`) — corrigir mantendo as duas, senão voltar ao estado anterior (decisão do usuário); (d) **HUD/menu** no padrão das 7 telas de referência (arquivadas FORA do projeto): HP com números (já existe), glossário, card de temporada/ranking, streak em tempo real (não existe), abates totais no HUD, itens à esquerda, skills+pílulas à direita, roster com versões bloqueadas; (e) **Caça-Níquel da Tsunade** (renomear, arte Tsunade feliz/triste/nervosa por recompensa, custo subindo "consideravelmente"; o desconto de custo **já existe** — Dente de Ouro −8% + Carteira Gama-chan −6%); (f) **treinamento esgotado agora = atributo ALEATÓRIO +0,6%/nível** (NOVA decisão de 12/11 que **substitui** a de 11/11 "somente Sorte +0,8%"); (g) **pílulas: padrão 9 / buff de conta 13 / buff de item 15** (hoje: 10 + Cabaça +2 = 12; o mecanismo de "conta" não existe — interpretação pendente); **Isca Shinobi → vitamina**; White Flute **já existe** (Pílula de Incenso); (h) **balanceamento**: jogador inicial **menos forte/mais gradual** (escala por dificuldade) e monstros **mais fortes aos 6 min** — o usuário testa a gameplay e ajustamos em iteração; (i) **pergaminhos no chão** no lugar das kunai/shurikens (Ryu por zona + sorte); (j) **planner de fusões/builds** espelhando o planejador da referência (frames arquivados) + salvar builds; (k) **mapa maior + spawns sempre alcançáveis**; (l) **personagens novos**: Kages ausentes até o Shippuden (conceito para **aprovação ANTES** de criar: Hiruzen 3º, Killer B 6º, A 5º, Onoki 2º, Ao 2º, Rasa 3º, Naruto 7º) + elenco clássico/Shippuden com **evolução por era** (Choji, Kiba+Akamaru, Shino, Ino, Kurenai, Iruka, Sai, Yamato, Shisui, Obito, Hiashi, Hanabi, Kisame, Zabuza, Suigetsu, Mangetsu, Karin); (m) **pool** com prévia informativa de itens/pílulas (teclas 1–N **já existem**); (n) **foto do late game NÃO chegou** (o frame v4 dos vídeos enviados é a melhor referência recebida; pedido de reenvio feito). **Nenhum código de jogo foi alterado na rodada 35** — material novo arquivado FORA do projeto (skill `referencia-externa`), fila em docs/13, aguardando autorização do usuário. **Rodada 36 (12/11/2026)**: **segmentação segura de contexto** executada de forma **não destrutiva** (com **backup integral verificado ANTES** — `backup-ShinobiBonk-2026-11-12.zip` na raiz do workspace, fora do projeto) — o projeto ganhou um **índice agregador** (`docs/19-INDICE-DO-CONHECIMENTO.md`) + documentos de domínio (`docs/20-SCALING-EREGULAS.md` fórmulas/valores · `docs/21-ELASTAO-DE-HEROIS.md` elenco) e as skills de contexto passaram a usar esse fluxo; **nenhum código de jogo ou asset foi alterado** e o contexto original segue **íntegro**; o material do jogo de referência segue **sempre fora do projeto** (regra permanente). **Rodada 37 (12/11/2026)**: o usuário **AUTORIZOU** o mega-lote da rodada 35 inteiro ("Aprovo os Kages · Aprovo o Elenco Tier A · Ok pasta com áudio, já inclua este que enviei no 'Jogar' · Pode colocar esse caça níquel") e respondeu às 9 perguntas em aberto — **Kages APROVADOS** (incluindo os **primeiros Kages de cada vila até o Shippuden**: Hanzo 1º Tsuchikage · Mei Terumi 1ª Mizukage; pesquisa na NarutoWiki) com **correção de canon (A = 3º Raikage · Killer B = 4º)**; **Tier A APROVADO** (17); **Tobi ×2** (Akatsuki + outra versão); **Nagato APROVADO como personagem SEPARADO do Pain** (kit: Tensei + Invocação dos Pain's + caminhos de Pain) e **Yahiko = o PAIN** (kit: barras de chakra + Tensei); **Caça-Níquel** com **combos de 3 iguais** (3 Tsunades = Sorte da Tsunade +10% dificuldade/+10% monstros · 3 Jirayas = item raro+ · 3 Hiruzens = 4 escolhas de itens · 3 Hidan = −5% HP +5% dificuldade +5% monstros · 3 Kakuzus = bônus de Ryu por sorte/dificuldade), **emboscada invertida** (armadilhas shinobi/papéis bomba explodem ao redor do jogador e **matam os monstros próximos** — jogador **seguro** durante a interação; ao sair a horda retoma) e **custo subindo gradual e considerável, como o Ryu por zona**; **renames**: "Pergaminho de Ressurreição" (35%) → **Células de Hashirama** · "Rinne Tensei" (60%) → **Chakra de Hagoromo** (arte/ícone exclusivos); **White Flute = ITEM novo** (horda maior + mais Ryu/leveling) — a **Pílula de Incenso SE MANTÉM**; **pílulas 9/13/15** (base 9 · buff de conta = **Passivas Shinobi** compradas por Lamens, aplicam no **início da run** → 13 · buff de item Cabaça +2 → 15); **Isca Shinobi → vitamina**; **barra de HP com números no PÉ DO PERSONAGEM**; **HUDs recriadas no tema Naruto/ninja/japonês**; glossário (atributos no estágio, efeito de cada pílula, **% de mega crítico após crítico 100%**, alfas com buffs + combos facção/aldeia/família); folhas de caminhada **frente (baixo) e costas (cima)**; **YOO MP3** (baixado pelo usuário) no Jogar com **corte a partir do 1 s**; **ytmp3.yt autorizado** para os demais sons de jutsu (falhou → o usuário baixa e entrega a pasta); fotos de late game do WhatsApp em `<pasta arquivada>/fotos lategame/` (fora do projeto, **consumíveis**). **Implementação iniciada** (fila docs/13 · IMPLEMENTAÇÃO INICIADA). **Rodada 39 (12/11/2026)** — planner em **TABELA** (Opção · Origem/efeito · Raridade/estado · Ações) nas abas Habilidades/Pílulas/Itens + nova aba **FUSÕES** (pares de técnicas, até 4 por herói, preview das regras Fundir/Combinar) + **Táticas de Missão** (snapshot do plano, até 4 por herói, Aplicar/Excluir) + **buff verde/debuff vermelho** por cláusula no BuffText + **badge ⚗ Requisito de Fusão** no pool da run + **“pra” → “para”** + **plano individual por personagem** (chaves `sb_*_by_hero_v1`, chaves globais antigas como fallback e nunca apagadas) + **proporção idêntica em qualquer movimento** (bbox alfa em `playerMotion.ts`, fator 0,85–1,35). Código implementado e validado (`tsc`, `vite build`, `verify-rules`, `verify-motion-atlases`); teste do usuário pendente. **Rodada 44 (12/11/2026)** — câmera e mouse: câmera **mais deitada** no início (pitch 0,74 → **0,55 rad**) e desce até **piso deitado 0,05 rad (~3°)** (era 0,12), como no jogo de referência; sensibilidade do mouse em **taxa única e simétrica 0,0025 rad/px** em yaw e pitch (era 0,006/0,004 — a assimetria 1,5:1 era o “esquisito”), mantendo **1:1 sem aceleração** (rodada 29); **câmera centraliza o JOGADOR** (não o mapa — verificado) e a hint do slider ganhou a **dica do Windows: velocidade do ponteiro 6/11** (o multiplicador do sistema pode somar ao raw input). Implementado e validado (tsc · vite build · verify-rules · verify-motion-atlases · verify-runtime 58 checks + inspeção visual do screenshot sem bug gráfico); teste do usuário pendente. **Rodada 45 (12/11/2026)** — **fluidez da caminhada “livre” + proporção ao atacar**: corrigidas **3 descontinuidades** na troca de folha (repouso ↔ andar ↔ andar-atacando) em `playerMotion.ts` que causavam o “pulo”/falha visível reportado — **(a)** o fator de proporção `propFactor` (bbox alfa da rodada 39, clamp 0,85–1,35) agora é **suavizado** (lerp exponencial `propCur`, ≈0,15 s) em vez de aplicado instantaneamente, então o personagem **não mais salta de tamanho/altura** a cada troca (a âncora nos pés e as exceções Choji/Gaara/Pain seguem valendo); **(b)** a passada `strideShown` agora **sobe/desce** (lerp exponencial ≈0,1 s) no início/fim do golpe em vez de **ligar/desligar** de uma vez; **(c)** `stepTime` deixou de **zerar a cada parada** — agora contínuo, então a caminhada **continua de onde parou** em vez de reiniciar do quadro 0. **Estado estacionário inalterado** — só as transições suavizam. Validado (tsc · vite build · verify-rules 56/97/95 · verify-motion-atlases 56/560/0 erros · verify-runtime 0 erros/0 404) + inspeção visual de `combat.png` e `camera-horizonte.png` (sem bug gráfico). **Teste do usuário pendente**; se ainda notar mudança perceptível de tamanho no golpe, o próximo passo é reduzir a diferença de bbox entre as folhas de ação e o repouso na arte. **Rodada 46 (12/11/2026)** — **caminhada dos Ninjas Selados (aliados) corrigida** (pedido: “a caminhada deles está bugada, devem caminhar/atacar/normalmente conforme seguem o jogador”): a causa era o **follow stop-and-go** do loop de aliados em `GameCanvas.tsx` (parava seco a cada 0,25 m do slot e saía “correndo” em `speed+2` → alternava idle↔andar a ~10 Hz) + **orientação sem dead zone** (flip de fileira frente/costas ao andar de lado). Correção: **follow amortecido** (`lerp(goal, 1−e^(−dt·R))`, R=8, R=16 no dash; band de assentamento 0,18; snap `gap>12` preservado) + **dead zone ±0,18 idêntico ao jogador** (`backwardView`/`leftward`); **Kuri** recebeu a mesma correção; ataque/repouso/cadência dos aliados **sem mudança** (já funcionavam). Validado (tsc · build · verify-rules 56/97/95 · verify-motion-atlases 56/560 · verify-runtime 0 erros/0 404) + **teste visual dedicado** (Playwright: Gaara + Kankuro recrutados, W/A, 7 frames — formação contínua, ataque visível, assentam em repouso, sem flicker). **Teste do usuário pendente**. **Rodada 47 (12/11/2026)** — **13 pedidos** (texto integral em [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md)): (1) **CONFIRMADO** — dano crítico **250%** do dano base · mega crítico **300%** (já estava no código — `rollCritical` em `progression.ts`); (2) **YOOOO rápido** — `preloadYooo()` no boot (`sfx.ts` + `main.tsx`), o 1º clique não espera mais o download; (3) **Isca Shinobi volta a ser PÍLULA** (a fase 4 da 37 a transformou em item por engano — revertida: `pills.ts` + item `shinobi-bait` removido do catálogo); (4) **Treinar para todas as técnicas + auto-planeja** (`BuildPlanner.tsx`); (5) **early game +200% (PROPOSTO — o usuário testa e ajusta)** — `ENEMY_SCALING` hpBase 1,6→3,2 · armor .015→.03 (teto .6→.72) + `HERO_DAMAGE_FACTOR` **.41** (dano base do herói; **bug corrigido**: `version()` dividia por .55 hardcoded e fazia as versões avançadas ficarem mais fracas que a base) → dificuldade ≈ ×2,8–3,1 no minuto 0 em todas as dificuldades; (6) **raridade preenchendo o ícone** da carta no pool (`ninja-theme.css`); (7) **bordas temáticas na ficha** (banner/colunas/faixas Técnicas·Inventário·Ficha técnica/tiles); (8) **botões no planner** (pergaminho + selo hanko); (9) **badge "★ Treinada · +15%"** na RunSheet (o buff já aplicava desde a 39 — agora visível na ficha); (10) **selamento sem substituto continua a missão na hora** (sem tela "continuar missão"); (11) **pool adapta a largura a 1–4 cartas** (`cards-{1..4}`); (12) **auto-coleta ao pisar** (raio 1,8 m — "E" só para emboscadas; altar já iniciava ao pisar); (13) **passada sem distorção** — `strideTarget = proceduralMotion ? stride : 0` (a passada procedural **nunca** sobrepõe folha desenhada; andar-livre vem do deslocamento da simulação). Testes reescritos (kunai: auto-coleta; guardião: sem "E" perto do portal). Validado (tsc · vite build · verify-rules 56/97/**94** · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404). **Aprovação do usuário dos 13 itens pendente (item 5 = PROPOSTO)**. **Rodada 48 (12/11/2026)** — **20 pedidos** (texto integral em [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md)): (1) **Planner "Não aprender" → "Deixar em casa"** (conceito de build da referência com particularidade por shinobi) — `BuildPlanner.tsx`; (2) **M/ESC/Tab corrigidos** (fechar o mapa volta ao jogo sem abrir a ficha — `mapPanel` + `suppressUnlockPause` 800 ms); (3) **HUD de métricas**: Dano causado total + Dano por segundo (formato compacto 1,1M), **sem** "Dano por aliados", **sem** tabela de porcentagens, ganhos no topo (substitui a decisão da Rodada 34 de "tabela de utilidades de volta" — a mais recente prevalece) — `RunSheet.tsx`; (4) **Zabuza Momochi** como Mega Elite no evento de névoa **intermitente** — **PENDENTE** (não existe no roster; anotação em docs/23); (5) **preço em verde/vermelho** conforme Ryu — **OPCIONAL, não feito**; (6) **Isca Shinobi CONFIRMADA como PÍLULA** (Rodada 47 — a dúvida do usuário confirmou o estado atual); (7) **Treinamento esgotado**: atributo **aleatório** +**0,6%**/nível (era Sorte fixa +0,8%) + HUD flutuante "Treinamento — <atributo> +0,6%" — **EM ABERTO**: a cláusula "somente na utilidade que ele treina apenas sorte"; (8) **Final Swarm 1.600** (era 8.000) com **rampa progressiva até +7 min** (não salta para o teto) + monstros evoluem com o tempo (pedido explícito); (9) **XP por mob reduzido** (8→5) + XP sempre dropado por abate (regra existente); (10) **ficha mais escura** (papel2→papel3) — a palheta bege clara foi rejeitada pelo usuário; (11) **engasgada do E/1-4**: `CHOICE_GUARD.armSeconds` 0,5→0,2 s; (12) **raridade cinza/verde/azul/roxo/amarelo — JÁ ESTAVA ASSIM** (`rarity.css`); (13) **HP com número no centro — JÁ EXISTE** (RunSheet + HUD de combate); (14) **Claude contribuinte no GitHub** — explicação: commit da Rodada 38 com `Co-Authored-By: Claude Opus 5.5` (trailer); os 30/30 commits têm author `jcffadev`. **Travamentos atacar+andar + minionblock com horda grande** persistem (não investigado nesta rodada; anotação docs/23). Validado (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404, stress 1.600 inimigos). **Teste do usuário pendente**.

**Rodada 51 (12/11/2026)** — ataques inimigos **voltam a ser Kunai/Shuriken** (pedido do usuário; os **pergaminhos do chão permanecem** como recompensa da Rodada 49 — visuais separadas: projéteis inimigos vs pickups do chão) · **altares = bênção**: 2–3 atributos aleatórios (3 no Raro+), magnitude pela qualidade do altar (Comum 5% → Lendário 25%) × sorte (acima de 10, +2% por ponto, teto +120%), aplicados direto na run **sem tela de escolha** — **valores PROPOSTOS, o usuário testa** (substitui a regra da Rodada 12 “altar 100% abre escolha de itens”) · **tiles da ficha em marrom** (`.sheet-tile` marrom-tan, texto escuro) · **Netlify**: `index.html` + `netlify.toml` OK e o zip do workspace foi **rebuildado e reempacotado** (371 arquivos, 235 MB — o anterior era STALE) — **o usuário precisa RE-UPAR** · **.exe**: **PROPOSTA** (Electron/electron-builder ou Tauri) — **não implementar sem aprovação do usuário** · “ficha no P/ESC” + PARSE_ERROR dos prints do usuário = **build STALE** (já existem no código).

**Próximos passos (fila viva em [13-PENDENCIAS-PARA-CONTINUAR.md](13-PENDENCIAS-PARA-CONTINUAR.md), em ordem do usuário):**
1. **Kankuro sem ataque animado (URGENTE)** — folhas completas de Kankuro 1/15/30 e Kushina 1; revisar/refinar Neji 1/15, Sasuke Genin, Naruto Clássico/Shippuden.
2. **Revisar as 56 versões visualmente** (repouso → andar → ataque → pulo → dash; frente/costas; como ajudante). Padrão: Naruto Academia; exceções Lee, Guy e Gaara.
3. **Medir balanceamento em run real** (tempo até níveis 2/4/6, abates aos 60 s, vivos aos 30/60/90 s; meta "nível 2 em 15–25 s, nível 6 em 80–100 s"); as propostas numéricas estão no arquivo arquivado, **nenhuma foi aprovada**.
4. Efeitos/prévias (Susanoo por lançador, Gamabunta, clones correndo).
5. Mapas com o mesmo padrão de chão/construções (atlas do primeiro mapa) — Areia/Pedra/Névoa já integrados, auditoria visual pendente.
6. Run completa de 3 zonas → bijū → saída → ranking; FPS em GPU real.

**Metas de longo prazo:** teto de **1.600 inimigos vivos** (normal e Final Swarm; correção do usuário em 14/11: "nosso cap máximo de monstros é 1600"; o Final Swarm já tinha descido de 8.000 para 1.600 na rodada 48); meta de 5 milhões de abates; fluidez alta no hardware do usuário; depois, cadastro com servidor e hospedagem da alpha (hoje o perfil é local, por navegador).

**Atualização da rodada 52:** a cópia em `C:\Shinobibonk projeto - Copia` é a pasta principal. A Home tem trilha ao carregar, o Arsenal e as Táticas são selecionáveis na preparação e o Mega Elite caído espera E no campo.

## 3. Decisões permanentes do usuário

**25/11/2026.** Cada drop permanece onde caiu até ser atraído pelo jogador. Novos abates continuam deixando drops independentemente das recompensas já no chão. Guardiões crescem sem teto artificial de HP, e a defesa das Bijū deve ser calibrada como muito superior à dos Guardiões. Na derrota para captura, o shinobi fica ajoelhado até o selamento.

- **24/11/2026 · Oficina dos Sapos Sábios.** Fundir ou combinar só com os dois ataques no nível máximo da partida.

- **24/11/2026 · Arte dos personagens.** NPCs devem conservar os desenhos originais animados. O elenco inteiro segue o padrão chibi das primeiras versões do Naruto, com o traje e os traços da própria versão. Revisar seleção e cenas da partida, incluindo Hanzō e Haku.

- **15/11/2026 — Restrição de navegador vale para TODAS as IAs** (Claude Code, Codex, Qwen e outras), confirmada pelo usuário: "Está para todas as IAs". Substitui a decisão de 14/11 ("por enquanto só no claude"). Validação visual fica PENDENTE DE VALIDAÇÃO E2E até nova autorização explícita.
- **14/11/2026 (rodada 56) — Política central de testes:** `docs/development/TESTING_POLICY.md` vale para todos os agentes (perfil padrão EQUILIBRADO, status PASSOU/FALHOU/INSTÁVEL/NÃO EXECUTADO/NÃO MENSURÁVEL, toda regra nova com teste em `tests/`). A restrição de navegador continua só para o Claude Code — **CONFIRMADO pelo usuário em 14/11**: "por enquanto só no claude, vou testar no codex e qwen depois, se for preciso mando eles a adicionar a restrição para eles".
- **14/11/2026 — Testes sem navegador (temporário, só Claude Code):** não abrir Edge/Chrome/Firefox, nem headless/Playwright, para testar; validar com tsc, build, verify-rules e `tests/` (`TESTAR_JOGO.bat`); o que exigir navegador fica "PENDENTE DE VALIDAÇÃO E2E". Política completa em `CLAUDE.md`; só volta com autorização explícita.

Decisões de longa duração. Mudança de qualquer item = nova entrada aqui com a data, sem apagar a antiga.

| Data | Decisão (CONFIRMADO) |
|---|---|
| 05/11 | **Sempre commit + push ao finalizar cada tarefa** (pedido repetido do usuário). |
| 05/11 | **Sempre registrar perguntas e respostas** no contexto do chat (docs/14) — e, desde 11/11, também o resumo/direção neste arquivo. |
| 05/11 | Nada de Pokémon nem nomes/tema do jogo de referência no projeto; eventos renomeados (Provocação do guardião, Bênção de Tsunade, Maldição de Orochimaru, Roleta da Tsunade, Plano do Shikamaru). Em 11/11 o material de referência foi **removido** do projeto e arquivado numa pasta fora do repositório (raiz do workspace). |
| 05/11 | **Naruto Academia e Manto da Kurama são o padrão** de movimentação/animação; fora de revisão. Exceções: Lee, Guy e Gaara (movimentação própria). |
| 06/11 | Level-up oferece **somente técnicas e pílulas**; itens só por recompensas (mapa, roleta, drops). Máximo de **4 cartas** (inclusive após banir/atualizar). |
| 06/11 | **Banir é por nome**, do pool inteiro da run (independente de raridade/nível). |
| 06/11 | Pílula **sobe 1 nível por escolha**; a raridade multiplica a potência (×1 a ×2). Pílulas **nunca** entram em casa/planejamento; itens planejam com "Colocar na bolsa ninja". |
| 06/11 | Mercador: **estoque atual com preço fixo** ao comprar/reabrir; o próximo estoque é cotado por raridade × compras acumuladas × tempo de run. |
| 06/11 | Fundir/Combinar (oficina dos sapos) **1× por zona**, uso compartilhado entre as duas ações. |
| 06/11 | Planejamento de missão: levar no máximo ~40% das técnicas aprendíveis por shinobi (60% bloqueado), **escalonável** conforme novos shinobis/habilidades; "planejar" = favoritar; estrela abre Treinamento com Jiraiya (até 4 técnicas +15%). |
| 06/11 | **Ultimate desde o nível 1 em todas as versões**; R manual e **tecla Y obrigatória** (AUTO no botão R é o mesmo). A Ultimate recebe melhorias de dano total (restrita a projétil ou não). |
| 06/11 | Mega elites: primeiro ~**20 mil HP** escalando para **milhões** nos minutos finais; o scale do personagem acompanha. **4–6 capturáveis por zona (RNG)** + ~2 para selar na conta. |
| 06/11 | Economia exponencial: kunai/shuriken podem custar **milhões** no late game (inflação de preço mantida). |
| 06/11 | Drops de lamen **até 5%** (drops de monstro; recompensa final separada). |
| 06/11 | Drops distinguíveis: orbe azul (Chakra), essência roxa (XP, maior em elite/mega/guardião), moeda dourada 両 (Ryu), tigela (cura), pílula rosa, item laranja. |
| 06/11 | Selamento: **Shinobi para selar** (ciano) desbloqueia na conta sem buff; **Mega Elite** (vermelho) vira ajudante da run; **Elite amarela** não é capturável. Kill reward não duplica. |
| 07/11 | Contas locais: **Guest numerado** fora da conta; "Criar conta" promove o convidado mantendo o progresso. |
| 07/11 | Afiliações (vilas/clãs/organizações), papéis de ajudantes (médicos curam/coletam; ofensivos dão taijutsu/genjutsu/ninjutsu) e shurikens/corpos com emboscada: **Naruto Wiki/Narutopedia** é a fonte canônica (citar a página). |
| 07/11 | **Direção de arte (receita do usuário):** pixel art chibi, cenário 3D isométrico (2.5D), paleta/proporção únicas, animações de caminhada/ataque/dano/Ultimate; nunca sprites/modelos oficiais; efeitos seguem **elemento + nome da habilidade** (referência visual STORM, geometria original). |
| 07/11 | Modo Sábio: ícone com a **cara do personagem** + aura de atlas enquanto ativo. Gamabunta: **espada (tantō) + cachimbo**; óleo na boca, fogo perto do alvo. Clones **correm** até o alvo (nunca estáticos). |
| 11/11 | **Nunca publicar** `artifacts/sb-swishes-source.zip` (origem/licença não verificada) nem credenciais. Nunca force push. |
| 11/11 | **Desempenho/imagem: sem ajuste automático** (pedido do usuário) — o jogador configura como quiser em Gráficos (Qualidade, Limite de FPS, Resolução). O governor de 11/11 foi removido no mesmo dia. |
| 11/11 | **Zero rastro do jogo de referência no projeto/publicação** (pedido do usuário) — nada de arquivo, nome ou valor copiado em lugar nenhum do repositório. Material recebido: consumir, anotar tudo no contexto arquivado FORA do projeto, nunca salvar o arquivo no projeto (skill `referencia-externa`). |
| 11/11 | **Toda a comunicação com o usuário é sempre em português** (pedido reiterado do usuário), mesmo quando ele escreve em inglês. |
| 11/11 | **V-Sync ligado/desligado + placa de vídeo nas configurações** (pedido do usuário, pensando no .exe/patch do jogo, onde também deve haver escolha de renderizador OpenGL/DirectX); **câmera sem suavização** (zoom e altura instantâneos). Na web, V-Sync desligado e GPU são "melhor esforço" do navegador; no .exe saem direto do motor. |
| 11/11 | **Sempre ler o contexto e as skills antes de decidir** (skill `contexto-e-decisao`, pedido do usuário) — principalmente após reset de contexto ou troca de agente; **documentar TUDO** (toda alteração entra no registro na mesma tarefa — CHANGELOG, docs/14 integral, docs/18 resumo/direção; sem exceção); **GitHub sempre atualizado** (commit + push ao fim de toda tarefa; nunca `git add -A` em bloco). |
| 11/11 | **GitHub: excluir e recriar o repositório** (decisão do usuário, 11/11) — para remover do histórico o zip de origem não verificada e os prints/docs antigos; **sem** pedido ao suporte da GitHub (aquela pendência está encerrada). Até a recriação, commit/push segue no repositório atual; quando o usuário criar o novo, basta atualizar o remoto (`git remote set-url origin <novo-url>`) e publicar. |
| 11/11 | **Ataque normal não interrompe a caminhada** (pedido do usuário, 11/11) — se o personagem anda, ele continua andando fazendo os movimentos (o golpe sai dos braços); a **Ultimate mantém a pose especial** de sempre; pulo/dash/dano com prioridade inalterados. |
| 11/11 | **Rodada 34 — dificuldade e scale** (pedidos do usuário, 11/11): early game mais difícil em **todas** as dificuldades, em suas devidas proporções (sem desconto inicial; cada rank nasce na força plena do tier) e dificuldade **individual por zona** (Z1 ×1 · Z2 ×1,18 · Z3 ×1,38); **aumentar o scale de dano e % de todas as habilidades** (base do crescimento ×1,5 + spread maior em todas as raridades, e escala global de dano das técnicas do jogador/ajudantes ×1,2); números de dano podem seguir **spammando** (teto de 60→300 na tela); **tabela de utilidades** voltou para a ficha (9 linhas) com **gráfico de crescimento por nível** por técnica (referência visual: vídeo externo — arquivado FORA do repositório, zero rastro no projeto); pool de Treinamento esgotado sobe **somente Sorte** (+0,8% extra; antes era atributo aleatório — **SUBSTITUÍDO pela decisão de 12/11 abaixo**); configurações: **Renderizador DirectX/OpenGL** na aba Tela (na web a renderização é sempre WebGL; no .exe/patch o jogador escolhe o motor). |
| 12/11 | **Escopo do agente (rodada 35):** alterar **somente** arquivos dentro de `C:\Shinobibonk projeto - Copia`; nada no sistema Windows; navegador (Edge) **apenas** para testes; aprovação automática de acessos para o trabalho (pedido do usuário). |
| 12/11 | **Regra de descarte (rodada 35):** pedido que "não for melhoria, for desenvolvimento novo e já estiver no jogo" é **descartado** e listado ao final (pedido do usuário). |
| 12/11 | **Treinamento esgotado = atributo ALEATÓRIO +0,6%/nível** (pedido do usuário, 12/11) — **substitui** a decisão de 11/11 ("somente Sorte +0,8%"); antes de 11/11 já era atributo aleatório. Código atual: `grantTraining()` → somente Sorte +0,8% (a aplicar na implementação). |
| 12/11 | **Anti-spam de som (rodada 35):** o próximo som de jutsu só pode tocar quando o **anterior TERMINAR** — **não é fila** (pedido do usuário). Sons de jutsu sem específico usam o **padrão** (link fornecido pelo usuário; o arquivo é baixado por ele). "YOOOO" no botão Jogar/Jogar-como-convidado (o sintetizado já existe; o áudio real será integrado quando chegar). |
| 12/11 | **Pílulas (rodada 35):** teto **padrão 9 · buff de conta 13 · buff de item 15** (pedido do usuário; o mecanismo de "buff de conta" ainda não existe — interpretação pendente). **Isca Shinobi vira vitamina** (não item). |
| 12/11 | **Caça-Níquel da Tsunade (rodada 35):** renomear a Roleta da Tsunade para **Caça-Níquel da Tsunade**; arte com a Tsunade + caça-níquel (expressão **feliz/triste/nervosa** conforme a recompensa); custo por giro subindo **gradual e considerável**; desconto de custo já existe (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40%) (pedido do usuário; **IMPLEMENTADO na rodada 37 fase 3** — 3 rolos, 5 combos de 3 iguais, emboscada invertida, custo ×1,70/giro + +25%/zona, face com humor; **arte das 3 expressões = PENDENTE**). |
| 12/11 | **Personagens (rodada 35):** criar os **Kages ausentes até o Shippuden** (Hiruzen 3º Hokage · Killer B 6º Raikage · A 5º Raikage · Onoki 2º Tsuchikage · Ao 2º Mizukage · Rasa 3º Kazekage · Naruto 7º Hokage) com o **conceito para aprovação ANTES de criar** + o **elenco clássico/Shippuden ausente** com **evolução por era** (Academia → Shippuden → 4ª Guerra quando houver histórico) e habilidades únicas/passivas próprias, fiéis à obra (Naruto/Naruto Shippuden) (pedido do usuário). |
| 12/11 | **Chão e mapa (rodada 35):** kunai/shuriken no chão viram **pergaminhos** que dão **Ryu por zona + sorte**; o mapa **abrir mais** e os monstros **sempre nascem onde o jogador alcança** (pedido do usuário). |
| 12/11 | **HUD/menu (rodada 35):** padrão das telas de referência (arquivadas FORA do projeto) — HP com **números** (já existe), **glossário** com guia, **card de temporada** (ranking/colocação) à direita, **contador de sequência em tempo real**, **contador de abates totais** no HUD, **itens com ícones à esquerda**, **habilidades+pílulas à direita**; pool com **prévia informativa** dos upgrades de itens/pílulas; seleção por teclas 1–N (já existe) (pedido do usuário). |
| 12/11 | **Animação de ataque + caminhada (correção da rodada 33):** o ataque normal **deve manter a animação de ataque** mesmo com o personagem andando (a implementação de 11/11 a suprimiu); se não for possível as duas, o usuário prefere o **estado atual** (pedido do usuário, 12/11). |
| 12/11 | **Organização do contexto (rodada 36):** segmentação **segura e não destrutiva** — **nunca apagar/resumir destrutivamente** o contexto (`docs/14`/`docs/18` seguem integrais); **sem fonte paralela/duplicada** (cada fato vive em um lugar canônico; os demais apontam por link); leitura **índice primeiro** (`docs/19-INDICE-DO-CONHECIMENTO.md`); ao mudar balance/elojamento/estrutura, **atualizar o doc do domínio + o índice + o registro**; **antes de reorganizar, backup integral verificado FORA do projeto**; material do jogo de referência **sempre fora do projeto** (reafirmado); conflito = **código = estado implementado**, docs aprovadas = **intenção**, sem evidência → **perguntar ao usuário** (pedido do usuário, 12/11). |
| 12/11 | **Elenco (rodada 37) — APROVADO:** **Kages** com os **primeiros Kages de cada vila até o Shippuden** (Hanzo 1º Tsuchikage · Mei Terumi 1ª Mizukage; 1º/2º Kazekage e 1º/2º Raikage sem nome canônico = fora) + pesquisa **NarutoWiki** para stats/visuais; **correção de canon: A = 3º Raikage · Killer B = 4º Raikage** (a lista da 35 tinha 5º/6º); **Tier A APROVADO** (17); **Tobi ×2** (Akatsuki + outra versão); **Nagato = personagem SEPARADO do Pain** (kit: Tensei + Invocação dos Pain's + caminhos de Pain); **Yahiko = o PAIN** (kit: barras de chakra + Tensei) (pedido do usuário). |
| 12/11 | **Caça-Níquel da Tsunade — specs aprovadas (rodada 37):** **combos de 3 iguais** — 3 Tsunades = "Sorte da Tsunade" (+10% dificuldade +10% monstros) · 3 Jirayas = item raro ou superior · 3 Hiruzens = 4 escolhas de itens aleatórios · 3 Hidan = −5% do HP total +5% dificuldade +5% monstros · 3 Kakuzus = bônus de Ryu condicionado à sorte + dificuldade; **emboscada invertida**: armadilhas shinobi/papéis bomba explodem ao redor do jogador **matando os monstros próximos** (jogador **seguro** durante a interação; ao sair a horda retoma); **custo por giro subindo gradual e considerável, escalando como o Ryu por zona** (pedido do usuário). |
| 12/11 | **Itens/pílulas (rodada 37):** revives renomeados com **arte/ícone exclusivos** — "Pergaminho de Ressurreição" (35%) → **Células de Hashirama** · "Rinne Tensei" (60%) → **Chakra de Hagoromo**; **White Flute = ITEM novo** (horda maior + mais Ryu/leveling) — **não é a Pílula de Incenso, que SE MANTÉM** (+%dificuldade/%Ryu/%horda); **pílulas 9/13/15** (base 9 · buff de conta = **Passivas Shinobi** por Lamens, aplicam no início da run → 13 · buff de item Cabaça +2 → 15); **Isca Shinobi → vitamina** (pedido do usuário). |
| 12/11 | **HUD/áudio (rodada 37):** **barra de HP com números no pé do personagem**; **HUDs recriadas no tema Naruto/ninja/japonês**; **glossário** (atributos no estágio, efeito de cada pílula, **% de mega crítico após crítico 100%**, alfas com buffs + combos facção/aldeia/família); **folhas de caminhada frente (baixo) e costas (cima)**; **YOO MP3** no Jogar **cortado a partir do 1 s**; **ytmp3.yt autorizado** para os demais sons de jutsu (o agente tenta; falhou → o usuário baixa e entrega a pasta); anti-spam de som mantido (o próximo só toca quando o anterior **termina** — não é fila) (pedido do usuário). |
| 12/11 | **Plano individual por personagem (rodada 39):** cada herói guarda **planejado · em casa · prioridade · listas · fusões · táticas** nas chaves `sb_*_by_hero_v1` (chaves globais antigas como fallback, **nunca apagadas**); **Fusões** = pares de técnicas (até 4 por herói) planejados no planner e executados na Oficina dos Sapos Sábios (1 uso por zona); **Táticas de Missão** = snapshot nomeado do plano (até 4 por herói); **Choji é o único que cresce** (Jutsu de Expansão — fase 7); **proporção idêntica em qualquer movimento** (normalização por bbox alfa, clamp 0,85–1,35 — Gaara/Asumo autoconsistentes). |
| 12/11 | **Renome de passiva (rodada 40):** “Couraça” → **“Colete Shinobi”** (buff inalterado: +2 armadura/nível) + ícone do **colete** (`jonin-vest` do atlas); migração do save `sb_permanent_levels` **não destrutiva** (chave antiga copiada, nunca apagada — quem comprou mantém o buff). |
| 12/11 | **Câmera e mouse (rodada 44):** câmera **mais deitada** (início **0,55 rad**, piso **0,05 rad ~3°** — era 0,12) + sensibilidade do mouse em **taxa única e simétrica 0,0025 rad/px** (yaw e pitch — era 0,006/0,004), **1:1 sem aceleração** (rodada 29) + **câmera centraliza o JOGADOR** (não o mapa) + dica **Windows: velocidade do ponteiro 6/11** no slider. |
| 12/11 | **Crítico/mega crítico (rodada 47 — pedido do usuário, CONFIRMADO):** dano crítico = **250%** do dano base · mega crítico (chance de crítico ≥ 100%) = **300%** — `rollCritical(chance, 2.5)` + tier 2 `+.5` em `progression.ts` (já estava no código; verificado na rodada 47). |
| 12/11 | **Early game (rodada 47 — PROPOSTO, o usuário testa e ajusta):** early game **~+200% mais difícil** em **todas** as dificuldades, em suas devidas proporções — HP base dos inimigos ×2 (`hpBase` 1,6→3,2) + armadura inicial 2× mais rápida (`.015`→`.03`, teto `.6`→`.72`) + dano base do herói ×0,41 (`HERO_DAMAGE_FACTOR`, única fonte — era 0,55 hardcoded; **bug corrigido** na `version()`, que fazia versões avançadas mais fracas que a base). O usuário testa a gameplay e ajustamos em iteração (regra das rodadas 34/35). |
| 12/11 | **Morros de arroz = Ryu coletados com E (rodada 50 — substitui a auto-coleta da Rodada 49; a mais recente prevalece):** o morro **NÃO é auto-coletado ao pisar** (o único pickup que segue auto-coletado é o drop do mega elite derrotado — `sealDrop`); o **E** coleta: Ryu `(14+zona×6)×missão×(1+min(1,sorte×0,01))` + ímã global 10 s (xp/lamen/chakra) + **lamen de cura 35% do HP** — o morro **não cura diretamente** (a cura é da lamen) (pedido do usuário, 12/11). |
| 12/11 | **Escada de monstros vivos (rodada 50 — PROPOSTO, o usuário testa e ajusta):** early game ~**40% mais suave** — `capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8` (Genin: **91 vivos @1 min** · 391@5 · 695@8 · 936@10 · teto 1.600 aos ~15 min) — **progressiva em tempo + %inimigos de itens/debuffs** (`enemyCount` já multiplica o cap via `threatNow` — a progressão por buffs se mantém; pedido do usuário, 12/11). |
| 12/11 | **1º mega elite (rodada 50 — PROPOSTO, o usuário testa e ajusta):** base **9,5 mil HP** com **variação aleatória ±5% por nascimento** (9.025–9.975) — “cerca de 9 a 10 meio aleatório” (pedido do usuário, 12/11); rampa `2^((seg−55)/80)` × ameaça da missão se mantém. |
| 12/11 | **Altares (rodada 51 — pedido do usuário, 12/11):** o altar concede **bênção** (2–3 atributos aleatórios, magnitude pela qualidade do altar × sorte — Comum 5% → Lendário 25%), aplicada **sem tela de escolha** — **não itens** (substitui a regra da Rodada 12 “altar 100% abre escolha de itens”); **valores PROPOSTOS — o usuário testa e ajusta**. |
| 12/11 | **Ataques inimigos (rodada 51 — pedido do usuário, 12/11):** os projéteis inimigos voltam a ser **Kunai/Shuriken** (o usuário reclamou da troca para pergaminhos); os **pergaminhos do chão permanecem como recompensa** (rodada 49) — visuais separadas entre projéteis inimigos e pickups do chão. |
| — | Terminologia: `attackSpeed` = **velocidade de ataque** (nunca "cadência"). pt-BR, objetivo e técnico. |

## Direção atual de arte e câmera · 14/11

O usuário exige vistas distintas para todas as versões. W e S usam costas e frente retas, A e D perfil, combos diagonais em três quartos. A ficha e a seleção compartilham o retrato em três quartos. A faixa infantil usa Gaara Genin como mínimo. Adultos mantêm a altura do grupo, com Zabuza acima dela. Câmera mantém o jogador central e visível sobre relevo e inimigos sobrepostos.

## 4. Registro cronológico de P/R (todas as rodadas)

**Rodada 67 (14/11)** — ranking na inicial, Top 100, clãs e fichas com builds e missões foram integrados entre os perfis do navegador. O usuário perguntou pela publicação compartilhada. PostgreSQL, Supabase Auth e API autenticada são [proposta](development/RANKING-E-CLAS.md). O jogo de referência informa que guarda os registros no servidor, sem especificar o produto de banco em sua política pública.

**Rodada 66 (14/11)** — corrida com braços para trás integrada às 114 versões, com cinco vistas e quatro passos por vista. A skill foi alinhada ao padrão de W/S, margens, enquadramento e identidade da versão. Fusões até Nv. 7, HUD invertida, ranking de temporada, contadores e GPS foram colocados em fila. Validação visual em partida pendente.

**Rodada 65 (14/11)** — corrida com braços para trás em todas as versões é viável com o controlador comum. Até 2.280 quadros com cinco vistas e quatro fases. Usar como animação de WASD foi sugerido. **PROPOSTO.**

**Rodada 64 (14/11)** — integrou cinco vistas de caminhada e retratos em perfil nas 114 versões, com o mesmo controlador para ajudantes e Mega Elites. Quatro inimigos comuns receberam perfil. A revisão dos 26 atlas eliminou vazamentos de quadros vizinhos. Atualizou Hanzō, Haku, Zabuza, altura do elenco, foco e câmera. Tipos, build e 93 testes passaram. Arte de pulo/dash em ângulos adicionais e validação em partida seguem na [fila](13-PENDENCIAS-PARA-CONTINUAR.md). Pedido completo em [docs/14](14-CONTEXTO-DO-CHAT.md) e vistas por versão na [matriz](development/COBERTURA-DE-VISTAS.md).

Resumo de cada rodada com o estado. Texto integral dos pedidos e respostas: [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) (seção de mesmo título) e, para o chat anterior, [ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md](../ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md) (raiz do projeto).

| # | Rodada (tema) | P (resumo) | R (resumo) | Estado |
|---|---|---|---|---|
| 1 | Animações + bugs (Asuma) | Animar todos os jogáveis e evoluções; bugs de roleta/pílula sem escolha/sinergia; limite de monstros 1.600; "sempre commit ao finalizar" | Asuma com atlas próprio; 24 jogáveis com poses; sinergia com Naruto duplicado corrigida; pílulas sempre com escolha; contador do HUD lê a simulação total; commit `729749a` | IMPLEMENTADO/TESTADO (navegador); GPU real PENDENTE |
| 2 | Mapa 3D + câmera | "Transformar o mapa em 3D"; inclinação da câmera travada | Chão já é malha 3D (objetos ainda sprites); inclinação mínima ~7° com proteção acima do terreno | IMPLEMENTADO |
| 3 | Arquivo de P/R permanente | "Crie um arquivo markdown… minha pergunta, sua resposta, sempre" | Nasceu o docs/14 + regra no AGENTS.md; este arquivo (18) é o índice de direção | CONFIRMADO (regra permanente) |
| 4 | Folhas direcionais | Folhas dos outros personagens no padrão do Naruto; Sakura com a skin inicial; usar o estático como base do movimento | Folhas de Naruto/Sasuke/Sakura refeitas do sprite estático; regra documentada na skill de arte | IMPLEMENTADO (lote 1) |
| 5 | Itens × cartas | "Só itens em recompensas do mapa"; 5ª carta após banir | Caça-níquel/drops só itens; pílulas/habilidades só no level-up; teto de 4 cartas mesmo após banir | IMPLEMENTADO |
| 6 | Mouse + relevo | Girar sem segurar botão; montanhas para esconder o "cinza" | Mouse livre gira/inclina; elevações internas, montanhas externas, céu em gradiente | IMPLEMENTADO |
| 7 | Caminhada de todo o elenco | "Faça de todos" | 56 formas com 4 quadros frente + 4 costas por forma + espelhamento; commit `9ff5dfb` | IMPLEMENTADO/TESTADO |
| 8 | Banimento, pílulas, HUD, desistir | Banir por nome; pílula 1 nível por escolha; pílulas de incenso/XP; esconder mira; portal de bijū; desistir em 2 cliques; Lee/Guy com socos/chutes | Tudo aplicado; pílulas de Incenso e Pergaminho criadas; confirmação dupla no desistir | IMPLEMENTADO/TESTADO |
| 9 | Efeitos, Chōmei/Gyūki, bolsa, 1.600 | Efeitos fiéis à obra (STORM); Chōmei e Hachibi fiéis; filtro de raridade na bolsa; performance | Efeitos por natureza + golpes (geometria original); Chōmei/Gyūki refeitos das referências; botões de raridade; instanciamento | IMPLEMENTADO; TESTADO headless (6,77 FPS SwiftShader — GPU real PENDENTE) |
| 10 | Mega rodada: jogabilidade, arte, planejamento | Trava do ponteiro, F9 kunai, Ichiraku/Teuchi, remover "clique para retomar", lamen ≤5%, rebalancear HP (20 mil → milhões), RNG 4–6 capturáveis/zona, IA ranged, Tenten ×1,5, Gamabunta (espada+cacheiro→cachimbo, óleo→fogo), Kage Bunshin correndo, oficina de fusão/combinar (1×/zona), plano 40/60, ícones de Modo Sábio com a cara, Treinamento com Jiraiya +15%, Ultimate com dano total | Tudo implementado conforme §3; escala em docs/04; 47 verificações no Edge | IMPLEMENTADO/TESTADO (headless); balanceamento PENDENTE |
| 11 | HUD em jogo + Ryu curto | Grade de itens com rolagem, minimapa sem corte, barra de missão em blocos, SINERGIAS recolhível, Ryu curto | Aplicado e validado em 1440×900 e 1366×768 com 5 ajudantes + 80 itens | IMPLEMENTADO/TESTADO |
| 12 | Final Swarm + pílulas + altares | Swarm parava em 300/1.600; pílula "pegada sozinha"; altar por raridade pisar/cair | Teto 1.600×fator até 8.000 com reposição; cartas novas ignoram entrada por 0,5 s; altar começa ao pisar, dreno 4–18%/s por raridade | IMPLEMENTADO/TESTADO |
| 13 | Versões separadas | 56 personagens únicos (não evoluem); cadeia de missões (jogar com anterior + capturar); pulo/dash do Naruto Academia; 3 kunais do boss | Versões independentes com kit/passiva/atributos; `playWith` + missões escaladas; prioridade de pulo/dash; kunais em círculo com coleta prioritária; saves válidos | IMPLEMENTADO/TESTADO |
| 14 | Pílulas com prévia + listas | Pílula mostra atributo atual→novo; pergaminhos por elemento; "Itens em casa" com até 12 listas | `pillPreview.ts` em cartas/ficha/plano/barra; filtro por elemento; sub-aba de listas compatível com o save antigo | IMPLEMENTADO/TESTADO |
| 15 | Calibração com a wiki de referência | Tabelas referência × atual × proposta, só mudar o claramente inconsistente | docs/15 criado **sem alterar nada**; propostas (venda proporcional, Ryu com inflação, HP do guardião pelo dano do jogador, preços do Lab, máximos 5–8) ficaram PROPOSTO. Em 11/11 o doc foi arquivado fora do projeto | PROPOSTO (aguardando decisão) |
| 16 | Ultimate por fase + ajudantes como versões | Conferir Ultimate Nv. 1 em todas; mega/ajudante como versão avançada por zona, sem família repetida | Corrigidas 2 Ultimates fora de fase; buff da família escalado; equipe sem família duplicada; saves válidos | CONFIRMADO/IMPLEMENTADO |
| 17 | Filtro de raridade colorido | Botões combináveis nas cores do jogo no plano e na Bolsa | `RarityFilter` colorido, combinável, com contagem; cores em `src/rarity.css` | IMPLEMENTADO/TESTADO |
| 18 | Auditoria GitHub + Susanoo | Conferir GitHub × pasta; folhas de Susanoo (Sasuke Rinnegan, Itachi, 3 Madaras); "sempre coloque as perguntas e respostas lá" | HEAD × origin conferidos; 5 folhas integradas na cópia de trabalho; 80 células validadas; registro P/R virou regra | IMPLEMENTADO/TESTADO; integração WebGL PENDENTE |
| 19 | Dash, Sakura/Gaara, selo, contas | Dash para trás invertendo; Sakura revisada; Guest numerado + criar conta; afiliações via Narutopedia; emboscadas (shuriken/corpo); Gaara com cabaça + flutuar; selo nas mãos de todos | Dash captura a direção no Shift (ambos os lados); folhas de Sakura e Gaara; cadastro local com promoção de Guest; selo do Naruto em 4 versões | IMPLEMENTADO/TESTADO; restante do elenco PENDENTE |
| 20 | Continuação 07/11: WASD, mercador, oficina | WASD travada; mercador não deve subir preço do estoque atual; 2 abas nos sapos; fusão/combinar 1× por zona | Tecla oposta com prioridade; preço fixo do estoque atual + cotação do próximo; oficina com 2 abas e ícones; uso único por zona | IMPLEMENTADO/TESTADO (56 verificações) |
| 21 | "O que resta?" | Fila do que falta | Conciliar as duas linhas de trabalho; 56 versões; selos; Susanoo WebGL; recalibração; terreno/GPU; run prolongada | PENDENTE (docs/13) |
| 22 | Publicação imediata + mapas | Mesma padrão de chão/construções em todos os mapas; ESC sem clique; "envie logo" | 9 folhas de pulo/dash + 3 completas + chão de Areia/Pedra/Névoa + 9 construções; retomada por Esc; push `badcee4` | IMPLEMENTADO/TESTADO; auditoria visual PENDENTE |
| 23 | **Netlify 404 + FPS** (11/11) | 404 "index.html não existe"; depois "por que o FPS está tão baixo? Resolva o FPS" | 404 era **upload parcial** (só index.html, sem assets/) — resolver subindo `dist` inteira/zip na raiz; FPS: config por domínio no `localStorage` fez o domínio novo nascer pesado → `adaptiveGovernor.ts` (reduz/devolve pixel ratio) + opção "Ajuste automático de desempenho" | IMPLEMENTADO/TESTADO headless; **validação em GPU real PENDENTE** |
| 24 | **Arquivar e remover o jogo de referência** (11/11) | "Gerar um arquivo com todo o contexto… e deletar COMPLETAMENTE do projeto qualquer coisa que relate o jogo" | docs/15/16/17 íntegros + 44 prints descritos + 54 originais + citações de chat + medições do vídeo → pasta arquivada na raiz do workspace (`CONTEXTO-COMPLETO.md`, fora do repo); 101 arquivos apagados do projeto; 11 arquivos reescritos para "jogo de referência"; commit `4ef107c` | CONCLUÍDO |
| 25 | **Este arquivo** (11/11) | "Crie um .md de contexto de perguntas/respostas para sempre manter o contexto e a direção" | Criado `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` + regra no AGENTS.md de mantê-lo a cada rodada | IMPLEMENTADO |
| 26 | **Idioma da comunicação** (11/11) | "Você sempre falará comigo em português… nossa comunicação sempre será em português" | Regra permanente confirmada; já consta no AGENTS.md ("Fale em português do Brasil"); registrada nas decisões permanentes | CONFIRMADO (permanente) |
| 27 | **Remover o ajuste automático de FPS** (11/11) | "Eu não quero o auto-render para melhorar FPS, deixe o jogador configurar como quiser nas configurações gráficas isso, volte ao normal como estava!" | Removidos `adaptiveGovernor.ts`, o uso em `GameCanvas.tsx`, a opção em Gráficos e o campo `autoPerformance`; tsc/build/verify-rules passaram | IMPLEMENTADO (validação em GPU real: ajuste manual em Gráficos) |
| 28 | **Material de referência: skill + zero rastro** (11/11) | "Fazer uma skill para quando receber algo sobre o jogo de referência: consumir o conteúdo, anotar tudo que aprender no contexto para as referências atualizadas, e não manter o arquivo no projeto… quando publicarmos o jogo não ter NADA em nenhum lugar referente a ele" (nome omitido, a pedido) | Criada `skills/referencia-externa/SKILL.md` + regra no AGENTS.md; nome removido também da citação da rodada 24 no docs/14 | IMPLEMENTADO |
| 29 | **Mouse sem aceleração (raw input)** (11/11) | "rawinputbuffer é em relação a aceleração do mouse… quero que ele fique sempre a mesma velocidade e a sensibilidade funcione exatamente da forma que o jogador configurar nas configurações" | `{unadjustedMovement:true}` no pointer lock (raw input do navegador) + giro direto/linear (removido o `damp` de `yaw`/`pitch`); sensibilidade = multiplicador puro 0.20–3.00 | IMPLEMENTADO/TESTADO (tsc, build, verify-rules) |
| 30 | **V-Sync + placa de vídeo + câmera sem suavização** (11/11) | "Retirar a suavização de câmera, colocar opção de v-sync… quando formos fazer o nosso .exe do jogo/patch, deverá ter nas configurações ligar/desligar e opção de selecionar a placa de vídeo ou rodar em openGL" | Suavização retirada (zoom/altura instantâneos); V-Sync on/off (off = loop `setTimeout(0)`, melhor esforço na web); GPU via `powerPreference` (troca recria o contexto); renderizador OpenGL/DirectX documentado como opção do .exe; **corrigido flake** do verify-runtime (isenção do `CHOICE_GUARD` não cobria `?test=1&pointer=real`) | IMPLEMENTADO/TESTADO (tsc, build, verify-rules, verify-runtime verde) |
| 31 | **Contexto, skills e registro completo** (11/11) | "Deixe o changelog atualizado e verifique se a skill de atualizar os log's manda documentar TUDO… você consegue subir para o github e sempre atualizar? Criar uma skill .md para SEMPRE ler os contextos e as .skills para tomar decisões, para quando resetar o contexto você usar as skills já criadas (inclusive a de salvar contexto), ler as documentações e tomar a melhor decisão sempre" | Nova skill `contexto-e-decisao` (ler contexto → usar skills → decidir → fechar com registro + push); `documentar-projeto` com regra explícita de **documentar TUDO**; `publicar-github` com stage controlado (`git add -u` + novos por nome); AGENTS.md com seção "Antes de qualquer tarefa" | IMPLEMENTADO/CONFIRMADO (repositório publicado, worktree limpo) |
| 32 | **Recriar o repositório + fluxo do material de referência** (11/11) | "Como você vai ler coisas do [jogo de referência] a partir de agora? Como Claude e Codex vão ler o que fazemos? Vou excluir o repositório e criar outro — não se preocupe com o suporte; me fale o nome das skills que você criou; você tem subagentes?" (nome do jogo de referência omitido, a pedido do usuário) | (1) Material do jogo de referência: skill `referencia-externa` (consumir → anotar fora do projeto → PROPOSTO); (2) Claude/Codex leem pelo **repositório** (AGENTS.md → docs/18 → docs/14 → docs/13 → CHANGELOG → skills) — por isso documentar TUDO + commit/push; (3) **Decisão: excluir e recriar o repositório** (o zip sai com o histórico; nada preparado para o suporte da GitHub); (4) Skills criadas por nós: `contexto-e-decisao` + `referencia-externa`; (5) Subagentes: sim, limitados (busca `agentic_find` + web) — trabalho principal direto na sessão | CONFIRMADO/DECIDIDO (repositório a recriar pelo usuário) |
| 33 | **Andar durante o ataque + FPS 20** (11/11) | "Porque no MEU computador o jogo está lagado, 20 FPS? Mesmo quando eu fecho tudo relacionado a IA?" + "O personagem não deve travar/parar de andar na animação de ataque, se ele tem ataquespeed para atacar e consegue andar, deve continuar andando fazendo os movimentos." | Ataque normal não interrompe a caminhada (corpo segue andando, golpe nos braços; Ultimate mantém a pose especial; parado = como antes); anéis de efeito com cache de geometria (sem realocar a cada uso, liberados só no unmount); diagnóstico 20 FPS = config zerada no domínio novo (padrão "Alta") + jogo GPU-heavy por design → Qualidade `Média`/`Baixa` e/ou Resolução `900p`/`720p` em Gráficos/Tela | IMPLEMENTADO/TESTADO (tsc, build, verify-rules 56/97/95, verify-runtime verde); validação final: ajuste manual do jogador em GPU real |
| 35 | **Mega-lote: plano de HUD/menu, personagens, sons, scale, caça-níquel, pílulas, mapa, planner** (12/11) | ~28 itens: escopo/permissoes + regra de descarte; Kages + elenco clássico/Shippuden com evolução por era (conceito antes de criar); sons YOOOO/jutsus + anti-spam "só quando o anterior termina" (usuário baixa; agente integra); regressão da animação de ataque ao andar; caminhada vertical frente/costas; HUD no padrão das 7 telas (HP números, glossário, temporada, streak, abates, itens esquerda, skills+pílulas direita); Caça-Níquel da Tsunade (nome/arte/custo); treinamento esgotado → aleatório +0,6%; pílulas 9/13/15; Isca Shinobi → vitamina; White Flute; balanceamento (jogador inicial mais fraco, monstros fortes aos 6 min, escala por dificuldade); pergaminhos no chão; planner de fusões/builds; pool informativo + teclas 1–4; mapa maior + spawns alcançáveis; foto do late game (não chegou) | **PLANO entregue aguardando autorização** — nada de código alterado; material novo (7 telas + 6 vídeos) consumido e arquivado FORA do projeto (CONTEXTO-COMPLETO §9 + prints + frames); lista do que **já existe** (descartado por regra): HP números, teclas 1–9, desconto da roleta, White Flute (Pílula de Incenso), YOOOO sintetizado, frente/costas; lista do que **não consigo**: baixar áudio do YouTube (usuário baixa e entrega a pasta) e ver a foto do late game (reenviar); lista de personagens com referência sólida + Kages para aprovação; 9 perguntas em aberto | PENDENTE (autorização do usuário; fila em docs/13) |
| 34 | **Dificuldade, scale de habilidades, ficha e renderizador** (11/11) | "Dificulte mais o early game de todos os modos de jogo que temos em suas devidas proporções" + "Verifique o nível de dificuldade também individual para cada fase do jogo" + "Pode deixar os números spammando na tela" + "Verifique o scale do jogo e deixe mais difícil, alguns personagens estão fazendo os mapas muito fáceis" + "Aumente o scale de dano e % de todas as habilidades do jogo" + "Volte a tabela de utilidades para a ficha do personagem" + "a única coisa que upa... aumentar só a 'Sorte'" + vídeo de referência dos gráficos de scale (arquivado fora do repositório) + "Kankuro já foi corrigido" + "Pode ir atualizando o git" + "Andar livre enquanto ataca, já foi implementado?" | Early game sem desconto inicial (Genin perdeu os 66%) + base do minuto 0 HP ×1,6 / dano ×1,45 decaindo proporcionalmente; `ZONE_DIFFICULTY` por zona (Z2 ×1,18 · Z3 ×1,38); `GROWTH_ROLLS` base ×1,5 / spread maior + `TECHNIQUE_SCALE` ×1,2 (técnicas do jogador/ajudantes); teto de números de dano 60→300; ficha com UTILIDADE (9 linhas) + gráfico de barras de crescimento por nível por técnica; Treinamento esgotado → somente Sorte (+0,8%); aba Tela com Renderizador DirectX/OpenGL (preparo .exe); **Kankuro RESOLVIDO** (arte no repositório, confirmado pelo usuário); "andar livre enquanto ataca": **já implementado na rodada 33** (commit `4d1e798`) | IMPLEMENTADO/TESTADO (tsc, build, verify-rules 56/97/95, verify-runtime); pendente: medir o balanceamento em run real |
| 36 | **Segurança do prompt + backup + segmentação segura de contexto** (12/11) | "Lembre-se nossas referências que de outros jogos, exemplo as que eu te enviei, não podem ficar na pasta do projeto. E me diga se é possível executar um prompt deste de forma segura, em todo caso, crie um backup do projeto completo.zip fora da pasta do projeto também, ANTES de executar o seguinte prompt, isso se você acredita que ele funcionará bem" + **Prompt 1** (regras de segurança para execução autônoma: só pastas autorizadas, nada destrutivo, backup antes de reorganizar, parar em dúvida, ausência de resposta ≠ autorização, relatório final) + **Prompt 2** (segmentação segura de contexto sem perda de informações, fases A–F, rastreabilidade/manifesto, validação, estados) | **Seguro: SIM** — não destrutivo, dentro da pasta autorizada, sem tocar código/asset/Windows, com parada em dúvida. **Backup ANTES de tudo:** `backup-ShinobiBonk-2026-11-12.zip` na raiz do workspace (fora do projeto) — 980 MB · 2.882 arquivos · 0 `node_modules` · hashes de amostra conferidos. Executado **adaptado** ao próprio texto do prompt (índice agregador em vez de 15+ duplicados; QWEN.md/ComfyUI marcados **NÃO APLICÁVEL** no manifesto): criados `docs/19` (índice + manifesto + validação), `docs/20` (fórmulas/valores lidos do código), `docs/21` (elenco + fila); skills `contexto-e-decisao`/`documentar-projeto` atualizadas; **nenhum código de jogo ou asset alterado**; contexto original íntegro | IMPLEMENTADO/VALIDADO (backup + estrutura + sync); **commit + push pendentes**; fila da rodada 35 segue aguardando autorização (superado pela rodada 37) |
| 37 | **Autorização do mega-lote da 35 + novos specs** (12/11) | **AUTORIZADO** ("Aprovo os Kages · Aprovo o Elenco Tier A · Ok pasta com áudio… · Pode colocar esse caça níquel") + 9 perguntas respondidas: Kages + primeiros Kages de cada vila (canon corrigido: A 3º · Killer B 4º Raikage) · Tier A (17) · **Tobi ×2** · **Nagato** (separado do Pain: Tensei + Invocação dos Pain's + caminhos) · **Yahiko = PAIN** (barras + Tensei); **YOO MP3** no Jogar (corte 1 s) + **ytmp3.yt autorizado**; **Caça-Níquel** (combos 3-iguais + emboscada invertida + custo em escala por zona); renames **Células de Hashirama/Chakra de Hagoromo** (arte exclusiva); **White Flute = ITEM** (Incenso mantido); pílulas **9/13/15** (buff de conta = Passivas Shinobi no início da run); **Isca Shinobi → vitamina**; HP com números **no pé do personagem**; folhas **frente/costas**; HUDs no **tema Naruto**; late game em `<pasta arquivada>/fotos lategame/` (consumível) | **AUTORIZADO** — implementação iniciada em 9 fases (áudio → animação de ataque → caça-níquel → itens/pílulas → HUD → balance → personagens → folhas → menus) | IMPLEMENTAÇÃO INICIADA (fase 1: áudio YOO) |
| 38 | **Animação andar+atacar · ABRIR_JOGO · HUD ninja · proposta de novos shinobis** (12/11) | Subagente 1: "ele tem que andar liso atacando, mas a animação... levantar os braços e usar o hit, tem que continuar fluído" + verificar docs/skills/github · Subagente 2: "Corrigir o ABRIR_JOGO... mudei a pasta de lugar/nome" + "Aplicar as alterações de huds... mais imagens de fundo no menu inicial" · Subagente 3: Kages até o Shippuden + personagens do clássico/Shippuden com evoluções, "me envie antes para eu validar", "Me liste os personagens" | Golpe toca os quadros da folha também andando (passada nas pernas, encadeamento a 75%); node_modules reinstalado + .bat que se conserta; HUD ninja no jogo + 4 vilas no fundo do menu + fontes OFL locais; proposta em docs/22 com 15 perguntas e **divergências canônicas** na lista da rodada 37 (Killer B/Hanzō/Mei/Ōnoki/Rasa/Ao) | IMPLEMENTADO + TESTADO (headless) · personagens = PROPOSTO, aguardando o usuário |
| 41 | **Marionetes únicas do Kankuro e do Sasori** (12/11) | “Para Kankuro e Sasori, fazer criações de suas marionetes unicas, utilizar os arquivos de criação/arte/movimentação/assets/arte 2.5D para criar” | **Kuri** (máscara de raposa) como companheira PERMANENTE da família Kankuro (segue em formação · “Agulhas de Kuri” · **sem** slot/allies/sinergia) + **Kuroari** (escorpião vermelho) como entidade visual da técnica “Kuroari” (dano **idêntico** — zero balanceamento) · 4 folhas Pillow 1280×640/1280×1280 (`scripts/generate-puppets.py`) · registros em directionalArt/evolution/npcs · +10 asserções no verify-rules · **Sasori (herói) NÃO criado** (fila Onda 2; Kuroari pronta para o kit dele) | IMPLEMENTADO + VALIDADO (tsc · build · verify-rules 56/97/95 · verify-motion-atlases 56/560 · verify-runtime 58/0/0) · pendente aprovação do usuário (Kuri · Kuroari · adiantar Sasori · arte Pillow) |
| 42 | **Trilha sonora — OST de Naruto, 15 faixas** (12/11) | 15 MP3s enviados pelo usuário (áudios originais que ele baixou **para o jogo**) com a regra de cada faixa: "Ao morrer e perder a run, tocar essa música" (Grief And Sorrow) · "Durante as runs desde o inicio da run - ordem aleatória **ou ao iniciar luta contra as bijuus**" (Raising Fighting Spirit) · "Trilha Durante os menu's/fora da run ordem aleatória" (4 faixas) · "Música ao acessar o jogo sempre que abrir/navegador/.exe/.patch/ - primeira música do jogo sempre" (I'll Do It Right) · "Quando jogar de Hinata/Neji iniciar a run com essa música, apenas essa condição" (Hinata vs Neji) · "Quando jogar com alguma variante de Sasuke iniciar a run com essa musica, apenas essa condição" (Sasuke's Theme) | `public/assets/music/` (15 MP3s) + `src/audio/music.ts` (boot→menu/run/bijuu/defeat; **uma faixa por vez, sem fila**, sem repetir a anterior; retry de autoplay na 1ª interação; mudo em 2º plano; fade-in ~0,9 s) + `musicVolume` (default 0,7) + slider “Música” nas configurações + gatilhos em `main.tsx` (boot/menu/run/derrota/vitória) e `GameCanvas.tsx` (bijū); overrides por família (Hinata/Neji · qualquer Sasuke) | IMPLEMENTADO + VALIDADO (tsc · build · verify-rules 56/97/95 · verify-motion-atlases 56/560 · verify-runtime 58/0/0 · **probe de música 5/5**) · pendente aprovação das 6 decisões de interpretação (docs/14) |
| 43 | **Sons reais de jutsu (Kage Bunshin + Shinra Tensei) + pose ultimate do Pain + controle de revisão p/ Claude-Codex** (12/11) | 2 MP3s do usuário (áudios originais que ele baixou **para o jogo**): **Kage Bunshin no Jutsu** — "Apenas naruto" · **Pain Shinra Tensei** — "Apenas Yahiko/Pain, ao utilizar ultimate o jogador deve **Levitar com os braços abertos**, fazer a arte/movimentos, a habilidade ultimate deve ter este som" + **regra permanente**: "para os personagens ajustes que você não conseguir fazer animação/habilidades deixar uma anotação no contexto/skills para o Claude ou Codex verificar e eles fazem/revisam. Deixar anotado tudo que você Qwen fez que eles podem revisar, como hud's, personagens/movimentação/sheets. Por segurança, já prepare esse controle de tudo que você está fazendo/já fez para revisão deles" | `public/assets/audio/` (kage-bunshin.mp3 + shinra-tensei.mp3) + `src/audio/sfx.ts` (`JUTSU_CLIP_RULES` técnica+família→MP3 · `playJutsuClip` com gate anti-spam **não é fila** · `playTechniqueSound(t,ultimate,casterId?)` — com clip: só o MP3, sem sweep/TTS) + `src/scene/GameCanvas.tsx` (3 call sites passam `heroId`; clones de Kage Bunshin via `hit()` direto — sem som duplicado) + `src/scene/playerMotion.ts` (`painUltimate`: quadro 0 da folha `pain-1-action-v3.png` fileira 2/3 = pose de braços em V + arco de levitação `sin(π·progresso)×0,38` m) + `scripts/verify-rules.mjs` (+9 asserções) + **`docs/23-REVISAO-OUTROS-AGENTES.md` (novo)** — inventário por rodada, áreas de revisão, notas p/ Claude-Codex | IMPLEMENTADO + VALIDADO (tsc · build · verify-rules 56/97/95 · verify-motion-atlases 56/560 · verify-runtime 58/0/0 — com 2 execuções flaky do headless sem relação com os edits, 3ª passou) · pendente aprovação das 4 decisões de interpretação (docs/14) · pendências 41/42 em aberto |
| 40 | **Passiva “Couraça” → “Colete Shinobi”** (12/11) | “Deveria ser um colete Shinobi” (print da passiva com ícone de bandana) | Renome + ícone do colete (sprite `jonin-vest` do atlas, mesma arte do item Colete Jonin) + migração não destrutiva de `sb_permanent_levels` (chave antiga copiada, nunca apagada) + Gaara (armadura→dano) atualizado | IMPLEMENTADO + VALIDADO (tsc · build · verify-rules · verify-runtime 58/0/0) |
| 39 | **Planner individual por personagem · tabela · Fusões · Táticas · buff verde/vermelho · badge ⚗ · proporção idêntica** (12/11) | "Quero em estilo tabela esse menu, reestilize" · "Faça o mesmo para itens... para habilidades" · "Nesse planejamento de missão, ter Habilidades/Pilulas/Fusões/Itens" · "salvar Tática de Missão um botão por personagem" · "O buff deve aparecer em verde, o debuff em vermelho na linha debaixo" · "Alguns personagens estão de um tamanho parados... quando andam diminuem, deixar a mesma proporção para qualquer movimento" | Tabela em 3 abas + aba **Fusões** (pares até 4 por herói, preview Fundir/Combinar) + **Táticas de Missão** (snapshot, até 4, Aplicar/Excluir) + BuffText **verde/vermelho por cláusula** + **badge ⚗** no pool da run + “pra”→“para” + estado por-herói (`sb_planned/home/priority/bag_presets/fusion_plan/tactics_by_hero_v1`, fallback das chaves antigas) + `alphaFracOf` em `playerMotion.ts` (clamp 0,85–1,35) | IMPLEMENTADO + VALIDADO (tsc · build · verify-rules · verify-motion-atlases) · teste do usuário pendente |
| 44 | **Câmera e mouse — deitar mais · sem aceleração · centralizar no jogador** (12/11) | “o rawinputmouse ainda está esquisito” · “a câmera ainda parece muito rápida” · “é possível deitar mais a câmera no nosso jogo referência, mas tome cuidado, faça testes para não dar bug's gráficos” · “a câmera centralizar o jogador e não a paisagem/mapa ao redor” | Pitch inicial 0,74 → **0,55 rad** + **piso deitado 0,05 rad (~3°)** (era 0,12) · **taxa única e simétrica 0,0025 rad/px** em yaw e pitch (era 0,006/0,004 — a assimetria 1,5:1 era o “esquisito”) · **câmera centraliza o JOGADOR** (verificado: já era assim no código) · hint **Windows: ponteiro 6/11** no slider (multiplicador do sistema) | IMPLEMENTADO + VALIDADO (tsc · vite build · verify-rules 56/97/95 · verify-motion-atlases 56/560 · verify-runtime 58 checks · inspeção visual do screenshot do piso sem bug gráfico) · teste do usuário pendente |
| 47 | **13 pedidos: crítico 250/300 · YOOOO rápido · Isca→Pílula · Treinar auto-planeja · early game +200% (PROPOSTO) · raridade visual · bordas temáticas · botões do planner · badge Treinada · selamento instantâneo · pool adaptável · auto-coleta · passada sem distorção** (12/11) | (1) "Dano crítico 250% do dano base e Mega Crítico 300%" · (2) "O Som de YOOOO! tem que entrar mais rápido ao clicar no botão" · (3) "Você transformou a Isca Shinobi em item, ele é uma Pílula… mude" · (4) "ao treinar a passiva Treinamento com Jiraiya, já tem que habilitar o Treinar para selecionar no plano de build" · (5) "Early game desde o lv1 muito fácil… aumentar cerca de 200% a dificuldade, diminuir dano inicial dos personagens, aumentar hp/defesa dos mob's… Se está fácil assim na dificuldade genin, também vai estar no restante" · (6) "preenchendo todo o quadradinho a cor da respectiva raridade" · (7) "bordas para toda hud que combine com o tema… japones/naruto… Técnicas, inventário, ficha técnica" · (8) "evidencie como botões essas opções" · (9) "habilidades treinadas, irão aparecer e darão o buff da % corretamente" · (10) "se não tiver escolha de substituição… continuar a missão instantaneamente, retirar a tela de 'continuar missão'" · (11) "quando tiver só 1 escolha, deixar o tamanho para 1 escolha… se não fica feio" · (12) "pegar itens no chão, precisa sumir a opção de pegar… altares… só de ficar em cima já ta contando o tempo" · (13) "animação distorcida ainda… atacar + andar" | (1) **CONFIRMADO** — já no código (`rollCritical` 2,5/3,0) · (2) `preloadYooo()` no boot (1º clique sem fetch) · (3) Isca Shinobi → **Pílula** (`pills.ts`; item `shinobi-bait` removido do catálogo) · (4) **Treinar** para todas as técnicas + **auto-planeja** (`BuildPlanner.tsx`) · (5) `ENEMY_SCALING` hpBase **3,2** · armor **.03**/teto **.72** + `HERO_DAMAGE_FACTOR` **.41** (**bug `.55` da `version()` corrigido**) — **PROPOSTO, o usuário testa** · (6) ícone da carta **preenchido** com gradiente da raridade · (7) **molduras temáticas** na ficha (`.sheet-*`) · (8) **botões do planner** (pergaminho + selo hanko) · (9) **badge "★ Treinada · +15%"** na RunSheet (buff já aplicava desde a 39 — `hit()` em `GameCanvas.tsx`) · (10) selamento sem substituto → **missão continua na hora** (sem tela) · (11) pool **`cards-{1..4}`** adapta a largura · (12) **auto-coleta ao pisar** (raio 1,8 m) — "E" só para emboscadas; altar já iniciava ao pisar · (13) `strideTarget = proceduralMotion ? stride : 0` — passada procedural **nunca** sobrepõe folha desenhada (quadro de ataque 100% íntegro). Testes reescritos (kunai: auto-coleta · guardião: sem "E" perto do portal) | IMPLEMENTADO + VALIDADO (tsc · vite build · verify-rules 56/97/**94** · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404) · **aprovação do usuário dos 13 itens pendente (item 5 = PROPOSTO)** |
| 49 | **Altar sem “E” · PERGAMINHOS coletados com E (sem auto-coleta) · Final Swarm 800@+4min → 1.600@+7min · MORROS DE BOLINHOS DE ARROZ** (12/11) | (1) “Toda vez que aperto E ta reiniciando o Altar… não é pra ter essa opção de E em altares” · (2) “As KUNAIS… deveriam ter virado pergaminhos no chão, devem aparecer o E para pegarmos, não ser pegado automaticamente” · (3) “Final swarm não respeitando os 1600… limitar no máximo 800 até +4minutos… aumentando até 1600 TOTAIS” (print com 5.468 monstros = **build STALE** do Netlify — zip de 11/11, anterior à Rodada 48) · (4) “Moedas no mapa devem virar morros de bolinhos de arroz, efeito magnetismo (10S, todos os drops do mapa), dropa lamen que cura vida, monte de ryu escalando por zona/dificuldade/sorte” | (1) **altar**: E **não reinicia** (toast “…fique dentro do círculo para ativar o altar (sem E)” + guard idempotente `if(defenseAltar===e)return;` + prompt **sem a tecla “E”** — `key?:string` opcional no `WorldSnapshot.interaction`) · (2) **kunai/shuriken → PERGAMINHOS** (sprite `drawScrollShape` + ícone `scroll.svg` + labels “Pergaminho”/“Morro de bolinhos de arroz”) coletados com **E** — **sem auto-coleta** (custo em Ryu + mega-loot mantidos; ryu/sealDrop seguem com auto-coleta da Rodada 47) · (3) **Final Swarm** teto **1.600** + rampa progressiva (800 até +4 min, 1.600 em +7 min) + **clamp por quadro** (remove excedentes comuns, **nunca** bosses/guardiões/mega) + cap na emboscada · (4) **moedas → morros de bolinhos de arroz** (onigiri) + **ímã global 10 s** (xp/lamen/chakra de todo o mapa) + **lamen de cura** + Ryu `(14+zona×6)×tarefa×(1+min(1,sorte×0,01))` · **regressão corrigida:** aviso do portal agora só com pergaminho a **≤6 m** (a contagem global quebrava a suíte) + debug `clearPickups` | IMPLEMENTADO + VALIDADO (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404, 2 execuções completas) · **aprovação do usuário pendente** · **re-upload do zip no Netlify (o atual é STALE)** |
| 50 | **Morros de arroz com E (sem auto-coleta) · escada de vivos ~−40% no early game (progressiva + %inimigos) · 1º mega elite ~9,5 mil HP ±5% · ficha de status de volta na pausa** (12/11) | (1) “os bolinhos de arroz você colocou para passar em cima e pegar automático, retire isso” + “estão curando a vida em % do personagem?” · (2) “114 é um número bem expressivo… Diminua um pouco a escada de progressão de quantidade de monstros vivos no início da partida, mas faça ser progressivo tempo+%inimigos por itens/debuffs” · (3) “o primeiro mega-elite nascer com 20K de vida também é um número elevado, deveria ser cerca de 9 a 10 meio aleatório” · (4) “cade a ficha com os status do personagem?” (print da pausa sem a ficha) | (1) morro **sem auto-coleta** (excluído do filtro ao pisar; único auto = `sealDrop` do mega elite) + **E coleta** (`interact()` inclui `ryu`) + hint “E · colher morro de arroz · …” — **resposta à pergunta:** o morro NÃO cura; dá Ryu + ímã 10 s + **lamen de cura 35% do HP** · (2) `ENEMY_SCALING` **capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8** — **PROPOSTO**: Genin **91@1 min** (era 156) · 391@5 · 695@8 · 936@10 · teto 1.600 aos ~15 min; %inimigos de itens/debuffs **JÁ multiplica o cap** (`threatNow`) · (3) `megaEliteHp` base **20.000→9.500** com **±5% aleatório por spawn** + 3º parâmetro `rng` — **PROPOSTO** · (4) **nova 1ª coluna** da pausa “Ficha do personagem · Status da run” (TOTAIS ATAQUE/DEFESA/UTILIDADE + crítico 250%/mega 300% + “Ameaça da missão ×{difficultyScale}”) — **conflito 48×50:** status = sim (totais); **tabela de % de itens continua fora** · (5) regressão da suíte corrigida: seletor `verify-runtime` → `.run-sheet details` | IMPLEMENTADO + VALIDADO (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime completa — 183 drawCalls/1.600 bodies/138 outlines/65 markers) · **aprovação do usuário pendente (itens 2/3 = PROPOSTOS)** · **re-upload do zip no Netlify (STALE)** |
| 51 | **Ataques inimigos voltam a Kunai/Shuriken · altares = bênção (buffs aleatórios por sorte/qualidade) · tiles da ficha em marrom · Netlify ok (zip novo) · .exe (proposta)** (12/11) | (1) “Houve uma alteração do Qwen… que alterou os ataques dos monstros que eram Kunais/Shurikens para Pergaminhos, não é pra você fazer isso cara” (screenshot dos projéteis) · (2) “Cadê a ficha de personagem no P/ESC durante a partida?” (screenshot da pausa) · (3) “Erro ao tentar iniciar o jogo” (PARSE_ERROR) · (4) “Verifique se temos index para quando formos subir a pasta no Netlify ele consiga criar o index.html do jogo para rodar em navegador” · (5) “me diga se você já consegue criar um executável seguro do nosso game” (o nome do jogo de referência foi omitido na citação — regra zero rastro) · (6) “Esses lugares mais claros, você tem que colocar marrom igual a ficha do personagem” (screenshot das tiles creme) · (7) “Os altares não são para dar itens, mas buffs aleatórios de acordo com sua sorte/qualidade do altar” | (1) projéteis inimigos = **Kunai/Shuriken de novo** (`enemyKunai`/`enemyShuriken`/`enemyShurikenFuma` em `dropSprites.ts` + `GameCanvas.tsx`); **pergaminhos do chão permanecem** (rodada 49) + `userData.shared` (limpeza dos projéteis **não** descarta o material compartilhado) · (2) **ficha JÁ EXISTE** no código (rodada 50) — print = build STALE · (3) PARSE_ERROR = artefato do bundle antigo (tsc/build limpos) · (4) **zip novo `Shinobibonk-netlify.zip`** (index na raiz · 371 arquivos · 235 MB) — **o usuário RE-UPA** · (5) **.exe = PROPOSTA** (Electron ou Tauri — sem implementar sem aprovação) · (6) **tiles marrom** (`.sheet-tile` marrom-tan + texto escuro; `.positive` verde sobrevive) · (7) **altar → bênção** (`ALTAR_BUFF_BASE` 5%→25% + `ALTAR_BUFF_POOL` com 14 atributos — 2 atributos, 3 no Raro+, × sorte, direto em `runBuffs`, **sem tela de escolha**, toast com a bênção) — **PROPOSTO** | IMPLEMENTADO + VALIDADO (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros · 1.600 inimigos) · **aprovação do usuário pendente (altar = PROPOSTO)** · **RE-UPAR o zip novo no Netlify** · .exe aguardando aprovação |

| 52 | Áudio, drops, planejador, altares, selamento e folhas de ação | Corrigir a trilha da Home, separar moeda e cura, reorganizar a preparação e atualizar o visual de técnicas e shinobis. A cópia em C: é a pasta principal. | Implementação e detalhes no [contexto integral](14-CONTEXTO-DO-CHAT.md) e no [CHANGELOG](../CHANGELOG.md). Folhas testadas para as 56 versões. Revisão visual das técnicas restantes em [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md). |
| 55 | **Caminhada, Mega Elite caído, HP, projéteis, zonas e testes sem navegador** (13–14/11) | Lote de 13/11 (docs/25) + "fazer sem subagentes, 1 tarefa por vez" + "Tem certeza que todos os personagens estão andando normal?" + "crie software de teste automatizado… por código" + política de testes sem navegador "apenas para o claude" | stableFacing com histerese; corpo caído com halo e E; áreas das técnicas; música 10%; câmera mais deitada; HP desacelerado (PROPOSTO); projétil inteiro por raridade; ameaça por tempo da zona; ímã ≤1,2 s; tests/ + TESTAR_JOGO.bat + CLAUDE.md | IMPLEMENTADO · TESTADO sem navegador (tsc, build, verify-rules, 22 testes) · visuais PENDENTES DE VALIDAÇÃO E2E · fontes pendentes |
| 56 | **Testes confiáveis + política central de testes** (14/11) | "faça todas as melhoras para… certeza que os testes estão passando 100%… expandir para codex/qwen… só o claude por enquanto para de usar o edge" + TESTING_POLICY.md (capítulos A–H, perfis, status) + AGENTS.md/CLAUDE.md | Lógica pura extraída do GameCanvas; 42 testes por comportamento; run-tests com garantias (skip/todo/mínimo/cobertura/timeout/ambiente); prova por mutação 13/13; perfis leve/equilibrado/profundo; política central; restrição de navegador só no Claude | PASSOU (leve, equilibrado, mutação) · E2E NÃO EXECUTADO · simulação headless/stress = PROPOSTO |

**Rodada 53** — P: implementar Kages, Tier A e extras da obra com missões e caminhada nos dois sentidos, aplicar efeitos às técnicas. R: 40 novas versões, atlas e movimento técnico verificado. A comparação visual jutsu a jutsu continua. Fase 4 concluída e abates no HUD.

**14/11/2026 — P:** retomar a passagem do Claude, verificar todas as folhas incluindo WASD e Shift, igualar cobertura por ação e estender a restrição de navegador a Codex e Qwen. **R:** matriz em Node cobre as oito direções das 114 versões. Corrigida a direção da perseguição e unificada a seleção por vetor do jogador. Ainda faltam redesenho da caminhada da expansão, uniformização de pulo/dash, arte traseira e revisão visual dos retratos. A regra de navegador ficou registrada na política central. [Pedido integral](14-CONTEXTO-DO-CHAT.md).

**14/11/2026 — P:** a revisão cobre todas as folhas e W/S funcionam sozinhos? Qual a fila? **R:** o Node confirmou W de costas e S de frente nas 114 versões e testou as oito direções. Ficaram quatro quadros por vista em caminhada, pulo e dash. Os quatro modelos comuns receberam o mesmo padrão, e as nove bijū ganharam vista traseira. Veja a [passagem](26-PASSAGEM-PARA-O-PROXIMO-AGENTE.md).

### Rodada 68 · 15/11/2026

As fichas usam a foto em três quartos e centralizam a silhueta. Apelido, avatar e moldura escolhidos aparecem no ranking. O jogador tem 40% do tamanho visual original, com oclusão pelo terreno; o flash vermelho cobre a cena. A barra de HP aparece aos pés enquanto a visão estiver livre e o Ichiraku destaca a ação Esquecer em vermelho. Bolinhos e XP foram recalibrados e a abertura das zonas tem surgimento mais lento em todos os ranks. Fusões elementais seguem referências de Kekkei Genkai, com ingredientes, efeitos e teto Nv. 7. A pose de selos durante a conjuração é regra permanente para todos os papéis. A comparação com a obra segue na auditoria de jutsus.

O menu inicial tem Guia do jogo com navegação e busca. O conteúdo descreve controles, eventos por tempo, NPCs e glossário a partir da implementação vigente.

Glossário ampliado em 15/11 com exemplos de todos os atributos, busca e filtro por assunto. O saldo de Lamens fica entre Arquivo Shinobi e o perfil, e a prévia estática do Naruto saiu da tela inicial.

### Rodada 70 · 15/11/2026

Andar livre (decisão do usuário): ao esbarrar o jogador só trava e desliza; o **dash atravessa** árvores, rochas e construções e, se terminar dentro de algo, sai pela frente. Corpo do jogador 0,17 m (escala do desenho de 40%); troncos do tamanho desenhado; árvore/rocha a menos de 1 m de construção é removida.

### Rodada 71 · 15/11/2026

Fusões (decisões do usuário):

- Kekkei Genkai valem para todo personagem que tenha as duas naturezas no pool.
- Uma fusão ou combinação não entra em outra fusão, nem com uma técnica comum.
- +15% de dano na fusão de mesma natureza ou da Kekkei Genkai da linhagem.
- Combinar dá ×1,5 e um atributo do par, sorteado de forma fixa por par.
- São 8 receitas, com Jiton e Bakuton.
- As naturezas da linhagem entram no pool do personagem.

### Rodada 72 · 15/11/2026

Decisão do usuário: "Se ele não tem natureza, igual no anime/obra/mangá, wiki não liberar." Natureza fora da obra nunca entra no pool. A auditoria não achou nenhuma fora. As linhagens da rodada 71 foram conferidas na Narutopedia. Liberar as naturezas da obra que ainda faltam ficou anotado para revisar depois, em `docs/development/DECISAO-KEKKEI-GENKAI.md`.

### Rodada 73 · 15/11/2026

- Mega Elite e Shinobi para selar caídos mostram a área de captura (raio do E, 10 m) no chão e um facho de luz.
- Todo pergaminho de recompensa grátis (G, Guardião, desafio) tem farol verde de 30 m e aparece sempre no minimapa, no Tab e no M.

### Rodada 74 · 15/11/2026

- Caça-Níquel: cada combo de 3 iguais mostra o retrato do personagem (Tsunade, Jiraiya, Hiruzen, Hidan, Kakuzu) via `SLOT_HEROES` e `HeroPortrait`.

### Rodada 75 · 15/11/2026

- Medição do tempo para matar 1 monstro com a 1ª técnica: `node scripts/balance-first-skill.mjs`. Média de Genin 21,2 s, Chunin 36,7 s, Jonin 61,2 s e Kage 105,3 s; spread de cerca de 4× entre personagens.
- A recarga vem só da forma da técnica; o balanceamento de CD está pendente de decisão (docs/13, item 27).

### Rodada 77 · 15/11/2026

- O ninja controlado tem a mesma altura visível do monstro comum (`PLAYER_SIZE` derivado de `MONSTER_VISIBLE_HEIGHT` em `src/game/worldScale.ts`).
- Câmera: padrão 12, faixa 8–22 (`CAMERA_ZOOM` em `src/game/settings.ts`), com migração do padrão antigo.

### Rodada 76 · 15/11/2026

- Recarga por forma mostrada no Nv 1 (corpo a corpo 0,6 · projétil 0,8 · órbita 1 · cone 1,2 · linha/onda/Em V 1,5 · área 2) e −35% no Nv 9; poder por forma ×1,3–1,6 (chefes descontam).
- Vida do comum 13, por dificuldade 1/1,3/1,6/2; abertura de 1 a 2 monstros/s até 4 min; nascimento a 16–24 m nos 2 primeiros min; emboscada aos 2:30 e a cada 50–80 s.
- XP ×5 entre o Nv 10 e o 60, igual em todas as dificuldades; Final Swarm compõe +10%/min × dificuldade.
- Números de dano curtos (1K, 123.1K, 1M…).
- Simulador de partidas: `node scripts/simulate-run.mjs <herói> <dificuldade> <min> <semente> <novo|maximo> <casual|medio|bom>` e `node scripts/simulate-batch.mjs <rótulo>`.

### Rodada 78 · 15/11/2026

- Área, Órbita e corpo a corpo acertam um círculo no alvo (`aimedCenter`); só puxão, Modo Sábio e Ultimates ficam no usuário.
- Órbitas lançadas (`LAUNCHED_ORBITS`) alcançam 4,5 m; as de contato, 1,7.

### Rodada 79 · 15/11/2026

- Skill `simular-partida` (`skills/simular-partida/SKILL.md`): todos os agentes usam o simulador de partidas antes e depois de mexer em balanceamento.

### Rodada 80 · 15/11/2026

- Dificuldades na mesma proporção: o Kage dar mais XP/nível a quem sobrevive é intencional. Teste garante que cada degrau pesa (vida ≥1,2×, dano ≥1,3×) e que os degraus são proporcionais.

### Rodada 81 · 15/11/2026

- A aba Fusões do planejamento lista as fusões possíveis com o pool do shinobi (`fusionCatalog` em `src/game/techniqueMerge.ts`), Kekkei Genkai primeiro; selar shinobis aumenta a lista.
- A aba Habilidades mostra a receita (`fusionRecipeText`: "A + B = Fusão") nas técnicas das fusões planejadas.

### Rodada 83 · 15/11/2026

- Ao levar dano, as bordas e cantos da tela piscam em vermelho (intensidade pelo dano ÷ vida máxima, some em 0,42 s, no máximo um piscar novo a cada 0,36 s). Abaixo de 30% de vida fica uma vinheta fraca e pulsando. Lógica pura em `src/game/damageFeedback.ts`.
- Som de hit recebido (`playHurt`): tons graves + estalo que cresce com o golpe, volume geral × efeitos, no máximo um a cada 0,32 s.
- Opção "Tela vermelha ao levar dano" em Configurações → Gráficos, ligada por padrão. Visual PENDENTE DE VALIDAÇÃO E2E.

### Rodada 82 · 15/11/2026

- O seletor de modelo salvo de itens (`ArsenalControls`) fica no Plano de missão (`BuildPlanner`), acima de Táticas salvas; não fica mais na escolha do shinobi.
- No catálogo de fusões, um clique planeja e outro tira do plano.

### Rodada 84 · 15/11/2026

- Pool de itens da missão = itens da bolsa ninja (planejados), quando há algum; senão, desbloqueados menos os deixados em casa (`missionItemPool` em `src/game/catalog.ts`).

### Rodada 85 · 15/11/2026

- Terreno em terraços (`TERRAIN` e `terrace` em `src/scene/terrainArt.ts`): degrau de 2 × 0,58 ≈ 1,2 m, máximo ~3,5 m dentro do mapa, montanhas da borda ×0,4, centro plano até ~6 m.
- Câmera: `cameraProjection` (perspectiva padrão; ortográfica nas Configurações), `CAMERA_VIEW` (50°, inclinação 0,5 rad) e `perspectiveDistance` em `src/game/settings.ts`.

### Rodada 86 · 15/11/2026

- Skill `skills/criar-mapa-shinobibonk/SKILL.md`: padrão de mapas (terraços, horizonte, câmera, vila canônica, construções sem desnível).
- `LEAF_PLACES` e `LEAF_BUILDINGS` em `src/scene/terrainArt.ts`: áreas planas da Folha sob construções e estátuas.

### Rodada 87 · 15/11/2026

- Mapas com nome da obra (Konohagakure, Sunagakure, Iwagakure, Kirigakure · Vila Oculta da …); `village` dos personagens inalterado.
- `horizonProfile` em `src/scene/terrainArt.ts`: horizonte por vila.

### Rodada 88 · 15/11/2026

- `footHeight`/`FOOT_RADIUS`/`GROUND_DEPTH_OFFSET` em `src/scene/heightField.ts`; `standHeight` no GameCanvas para todo personagem.
- Ultimate automática salva ao alternar na partida; `updateSettings` em `main.tsx` parte de `readSettings()`.
- Passagem para outro agente: fusões em `docs/10`, mapas em `docs/01`.

### Rodada 89 · 15/11/2026

- Água: `src/scene/water.ts` (`WATER_BODIES` por mapa, `carveWater` no `groundHeight`, `createWater`, `waterSurfaceAt` no `standHeight`).
- Paisagem: `src/scene/landscape.ts` (panorama em canvas num cilindro de raio 240).
- `CAMERA_VIEW` = 60° / 0,46 rad.
- Ordem do usuário: arte das vilas + água → selos de mão → fusões. "Bigbrain" = usar tudo o que o projeto sabe.

### Rodada 90 · 15/11/2026

- Dano: `DAMAGE_FEEDBACK` (mín. .5, teto 1), `HURT_BLINK`/`hurtColor` em `src/game/damageFeedback.ts`, `HURT_SOUND` em `src/audio/sfx.ts`.

### Rodadas 91 e 92 · 15/11/2026

- Água: `RIPPLES`, `ripple()` e `createChakraFeet` em `src/scene/water.ts`.
- Pergaminhos: `SCROLL_STYLES`/`scrollStyle` em `src/scene/dropSprites.ts` (`makeDropSprite(kind, value, variant)`).
- Pedra Memorial: `src/scene/memorialStone.ts`, área plana em `LEAF_PLACES`.

### Rodada 93 · 15/11/2026

- Shinra Tensei: `SHINRA` em `src/game/shinraTensei.ts` (levitação 1,5 m por 2,6 s, 4 ondas a 45% com atordoamento de 1,1 s).

### Divisão de trabalho · 15/11/2026

- Claude Code: desempenho. Codex: mapas, cenário, itens, selos de mão, fusões e o resto. Passagem em `docs/01`.

### Rodada 95 · 15/11/2026

- Desempenho: `paintGround(map, ground)` pinta o chão pela grade de alturas (`createHeightField` cobre `RENDERED_GROUND_SIZE/2`); cache do último mapa em `groundArt`.

### Rodada 96 · 15/11/2026

- `ADULT_HEIGHT`/`CHILD_HEIGHT` (playerMotion), `zabuzaMist.ts`, `planZoneWeather` (maps.ts), `fallenTrap.ts`, itens Esfera de Fumaça e Correntes de Contenção, `TEST_UNLOCK_ALL` também libera mapas e dificuldades.

### Retomada do Codex · 15/11/2026

- **Confirmado e implementado.** Primeiro Mega Elite da partida até 3.000 HP nas quatro dificuldades. Aparecimento natural e por clima compartilham o limite do primeiro encontro. Os posteriores escalam pela ameaça e pelo tempo na zona.
- **Implementado.** Chute Giratório tem o desenho próprio nas interfaces que usam `SkillIcon`.
- **Fila.** Recriar os mapas a partir das quatro artes de seleção, aprimorar água, revisar os jutsus com prioridade para o Susanoo e implementar Juventude e Hagoromo. Queda ajoelhada de todo o elenco como Mega Elite fica para depois. Ver a passagem em [docs/01](01-CAMERA-MAPAS-EVENTOS.md) e a [fila atual](13-PENDENCIAS-PARA-CONTINUAR.md).

### Entrada de movimento, dano e mapas · 15/11/2026

- **Implementado.** WASD e setas permanecem ativos até soltar a tecla ou perder foco. Durante escolhas o jogo pausa, e ao voltar usa as teclas ainda pressionadas. Pool esgotado em level-up, rerrolagem ou banimento aplica Treinamento com o painel fechado.
- **Confirmado.** Preservar a invulnerabilidade após subir de nível (3 s). O cartão mostra a proteção ou God mode, e HP perdido aparece em vermelho.
- **Confirmado.** Preservar câmera e deslocamento no chão na reforma dos mapas. Obstáculos devem permitir escalada caminhando. Mostrar capturas das vilas novas antes de aplicá-las à versão de teste.

### Roleta, Akatsuki e Guardião · 15/11/2026

- **Confirmado e implementado.** A roleta sorteia só Tsunade, Hiruzen, Kakuzu, Jiraiya e Hidan. Giros antigos já pagos são honrados.
- **Confirmado e implementado.** Emboscada da Akatsuki substitui o Altar do Desafio. Zetsu surge do chão e inicia por clique ou E. Dificuldade acompanha a partida e a zona. O grupo completo derrotado dá três pergaminhos grátis.
- **Guardião.** O Myōjinmon continua sendo o ponto de invocação com E. O portal que avança a zona abre ao derrotar o Guardião.

### Aparição das bijū · 15/11/2026

- **Implementado.** A arena final mostra a entrada da bijū à frente da câmera e aguarda a folha. O fade dos inimigos comuns ficou separado da opacidade do chefe. O save da arena restaura o chefe na posição gravada.

### Prévia das quatro vilas · 15/11/2026

- **Proposto.** Entregues no chat os renders de Konoha, Suna, Iwa e Kiri com comparação lado a lado à imagem da seleção. A implementação em partida aguarda revisão visual.

- **Planejado.** Entrar nas quatro vilas pelos acessos do cenário e jogar nas ruas e praças durante a missão. Integração pendente.
### Rodada 97 · 16/11/2026

- Treinamento do Hagoromo: `src/game/hagoromoTraining.ts` (regras), `HAGOROMO_ARENA` em `terrainArt.ts`, evento em `GameCanvas.tsx` (tecla C, choiceLevel −11/−12), `src/ui/HagoromoButton.tsx`.
- Divisão: Claude Code faz eventos, água e jutsus; o Codex faz os mapas jogáveis das vilas.

### Rodada 98 · 16/11/2026

- Treinamento da Juventude: `src/game/youthTraining.ts`, NPC `youth` (Might Guy em −30, −42) no GameCanvas (choiceLevel −13, evento `shinobi-youth`), painel `src/ui/YouthPanel.tsx`.

### Rodada 99 · 16/11/2026

- Água: `createSplashes`, `SPLASH`, `RIPPLES.max` 16, `chakraFeet.step()`, margem molhada no `paintGround`.
- Susanoo: `susanooPaintedLook` / `SUSANOO_FRAMES` em `src/scene/susanooFx.ts`.

### Rodada 100 · 16/11/2026

- Revisão de jutsus: 16 técnicas genéricas ligadas a efeitos do atlas em `techniqueVisualProfiles.ts` (docs/24, "Revisão de 16/11/2026").

### Rodada 101 · 16/11/2026

- Cartões de pílula/item: `plannerCardInfo` (src/game/plannerCards.ts) — Efeito · Descrição · Quantidade. Catálogo de fusões: ícone em `.fusion-catalog-icon` 44 px e linha do efeito.

### Rodada 102 · 16/11/2026

- Status: `src/game/statusProfiles.ts` (`STATUS_PROFILES`, `OVERRIDES`, `CRIT_ONLY`), aplicado no fim de `heroes.ts`. Só 7 golpes de precisão ficam no crítico.

### Rodada 103 · 16/11/2026

- Pacote de status: `src/game/statusRules.ts` (`STATUS_RULES`, `addChill`, `controlResist`, `statusDamageMultiplier`, `reactionsFor`, `deathBurstKind`). No GameCanvas: `chillEnemy`, `statusReactions`, `queueDeathBurst`/`flushDeathBursts`. Item novo `ice-breaker` (Quebra-Gelo, chave `shatter`); chaves `fireBurst` e `iceBurst` na Esfera Katon e no Espelho de Gelo de Haku.

### 23/11/2026 · Vilas jogáveis e Susanoo por personagem

**P:** Transformar a arte aprovada em uma vila jogável e respeitar cor e armamento de cada Susanoo.
**R:** A branch de validação liga os volumes texturizados e as colisões das quatro vilas, inclui prévias nativas e dá a cada portador a animação correspondente. A análise de dano, jutsus e status fica para a rodada de decisão com o usuário. A integração ao principal depende do aceite visual.

### 23/11/2026 · Feedback sobre as escadas e a escala da vila

**P:** Corrigir o apoio da escada e ampliar o espaço, com mais árvores e NPCs e casas maiores em posições sorteadas. Subir o Monte Hokage e ajustar o chão.
**R:** Subdividimos o deslocamento, ampliamos Konoha, escalamos os NPCs e sorteamos os lotes e pontos de evento com persistência. O monte está mais alto, com base rochosa. A prévia das malhas e os testes de circulação antecedem a revisão em partida.

### 23/11/2026 · Piscar dos degraus e escala da vila

**P:** Corrigir as escadas piscando ou isoladas e ocupar aproximadamente 80% do cenário jogável com a vila.
**R:** Os degraus usam malhas com um piso por trecho. O terraço dá acesso ao pátio junto à fachada e liga duas ruas. A área urbana de Konoha ocupa 81,3% da área jogável amostrada e a semente de teste contém 161 lotes. O sorteio distribui os pontos de evento com folga das escadas.

### 23/11/2026 · Eventos fixos e referências para Konoha

**P:** Parar a rotação dos eventos, acabar com os blocos atrás dos monumentos, melhorar a água e usar os marcos e as fachadas da obra. O Monte Hokage precisa ser escalável. A vila pode usar mais gráficos.
**R:** Eventos com volumes e NPCs em faces fixas, monumentos com relevo, caminho de subida e estilos de edifício distintos. A Folha recebeu sombras locais ajustáveis e água com profundidade, espuma e reflexo aproximado. Desempenho e composição final ainda serão conferidos em partida.

### Por que o chão de Konoha ficou esquisito? · 23/11/2026

**IMPLEMENTADO.** O borrão vinha da composição de baixa resolução da prévia. As manchas também tinham origem no recorte abrupto de material e altura da vila. O piso agora tem acostamentos com transição, cantos de praça arredondados e atlas mais nítido, conferido em prévia nativa. Ver [mapas e câmera](01-CAMERA-MAPAS-EVENTOS.md).

### Como esconder a base do Monte Hokage e deixar claro até onde dá para correr? · 23/11/2026

**IMPLEMENTADO.** A base do monumento entra na encosta. A cerca marca o limite de movimento, com bosque e colinas no horizonte de Konoha. A câmera ganha folga quando toca o relevo e o panorama tem uma superfície opaca abaixo do terreno. Ver [mapas e câmera](01-CAMERA-MAPAS-EVENTOS.md).

### Costas das estátuas, itens no chão e queda para selamento · 23/11/2026

**IMPLEMENTADO.** Os dois monumentos do Vale do Fim ganharam arte própria no verso. Itens repousam no terreno e a queda para selamento passa por um apoio de joelho. Houve revisão visual das quatro bordas de Konoha. Ver [mapas e câmera](01-CAMERA-MAPAS-EVENTOS.md).

### Como tirar o quadriculado da água, dar volume aos NPCs e refinar as outras vilas? · 23/11/2026

**IMPLEMENTADO.** A margem recebe subdivisão seletiva e o leito tem variação contínua. NPCs estacionários usam modelos articulados e os eventos preservam seus controles. Suna, Iwa e Kiri ganharam bairros e acabamento próprios com o mesmo sistema de ruas de Konoha. Ver [mapas e câmera](01-CAMERA-MAPAS-EVENTOS.md).

### Mapas novos no Live com retorno à versão anterior · 23/11/2026

**CONFIRMADO.** O usuário liberou testar as quatro vilas no Live e pediu backup dos outros mapas. O código anterior está em `backup/live-antes-vilas-2026-11-23`, e a referência histórica `mapas_basicos` continua disponível. O status do endereço hospedado é acompanhado na [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

**P.** “To falando pra por no projeto pra todos jogarmos, eu subo no site”

**R.** Os mapas novos estão na seleção normal da cópia principal para partidas novas. O `dist` foi recompilado para o usuário publicar no site. As partidas antigas salvas conservam o mapa em que começaram.

### Por que os NPCs mudaram de estilo e dá para animá-los na cena 3D? · 24/11/2026

A troca veio da revisão que substituiu os sprites por personagens modelados. A arte original voltou animada na cena, com vistas direcionais nas folhas que já as têm e selos no Naruto Totem. A primeira comparação das 114 versões em seleção, repouso, corrida e ação foi feita. A primeira entrega inclui Haku, Hanzō, Nagato, Sasori e Jūzō. Ebisu, Teuchi e Sapos Sábios mantêm sua frente original e têm perfil e costas próprios. O resultado em partida segue para validação visual.

### Como manter os próximos personagens fiéis ao anime? · 24/11/2026

Antes de gerar, confirme a fase em cenas e materiais oficiais. Compare rosto, traje, paleta e acessórios em várias vistas. Use o Naruto do jogo como referência de proporção chibi e mantenha o mesmo desenho na ficha e em cada ação. A revisão de Gengetsu, Sakumo e Orochimaru Akatsuki segue a [lista de referências](21-ELASTAO-DE-HEROIS.md#referências-de-gengetsu-sakumo-e-orochimaru-akatsuki).

### Onde fica o balanço e como foi refeita a Pedra Memorial? · 24/11/2026

O balanço fica à esquerda da entrada da Academia, no pátio de terra batida. A Pedra Memorial permanece na clareira a oeste da praça, com corpo facetado, inscrições, lajes, piso e flores. Em novas missões de Konoha, os dois nomes aparecem no mapa desde o início e aceitam rota. A [revisão de mapas](01-CAMERA-MAPAS-EVENTOS.md#pátio-da-academia-e-pedra-memorial) registra o acesso e as referências. A conferência em partida segue pendente.

### Todos os personagens foram conferidos no estilo chibi e com referência do anime? · 24/11/2026

As 114 versões jogáveis foram comparadas com o padrão chibi de Naruto Academia em recortes de seleção, repouso, corrida e ações. Oito receberam atlas novos. O [registro do elenco](21-ELASTAO-DE-HEROIS.md) detalha as fontes do anime para Gengetsu, Sakumo e Orochimaru Akatsuki. A validação canônica documentada das 114 versões e a conferência visual em partida ficam na [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

### Quais versões ainda destoam do padrão chibi? · 24/11/2026

A nova [auditoria por versão](development/AUDITORIA-CHIBI-ELENCO.md) mostrou 105 versões consistentes nos recortes, três para redesenho e seis para ajuste entre poses. As correções entraram na [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

### O que foi corrigido após a auditoria chibi? · 24/11/2026

Chiriku, Jūgo Taka e Obito Máscara Branca receberam proporções novas. As três Sakuras, Kushina, Tobi Akatsuki e Hanabi Adulta ganharam repouso e ataque mais próximos das proporções da corrida. Chiriku passou a usar o manto do Templo do Fogo em todas as ações, de acordo com a referência do anime. A [auditoria](development/AUDITORIA-CHIBI-ELENCO.md#ajuste-das-nove-versões) registra os atlas e as referências. Falta conferir as transições em partida.

### Foram oito ou nove versões e o que falta? · 24/11/2026

O primeiro lote teve oito versões redesenhadas. O segundo ajustou nove versões de seis personagens. As nove artes foram confirmadas no build da cópia principal. Seguem pendentes a validação visual em partida, a conferência de referências por fase, os efeitos e fusões, a vistoria das vilas e o ranking online. Veja o [registro do elenco](21-ELASTAO-DE-HEROIS.md) e a [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

### Quais partes da fila foram executadas? · 24/11/2026

Foram integrados os Susanoo de Sasuke e Itachi e a animação dos espelhos de Haku. Testados em Node o controlador das 114 versões, Jūzō nos dois papéis, a geometria e os pontos de interação das vilas e a função Netlify com serviço simulado. A documentação registra 60 simulações e as chances de status. A vistoria em partida, a medição de FPS e a integração com o serviço hospedado continuam na [fila](13-PENDENCIAS-PARA-CONTINUAR.md).

### Quais versões têm Susanoo e onde o efeito aparece? · 24/11/2026

Oito versões têm acesso no elenco. Os testes percorrem os 114 pools e exercitam as animações, incluindo o preparo de Mega Elites e guardiões. O estilo vem da versão do conjurador. A checagem identificou que Kakashi dos dois Mangekyō ainda aguardava uma versão jogável, acrescentada no pedido seguinte. [Portadores e acesso](24-AUDITORIA-DE-EFEITOS.md#versões-jogáveis-e-caminhos-de-execução).

### Como entrou o Kakashi dos Dois Mangekyō? · 24/11/2026

A versão 115 tem missão de selamento em Iwa Kage usando Kakashi Hokage, arte para repouso, corrida, selos, ataque e acrobacias, e ultimate Shuriken do Kamui pelo Susanoo alado. A conferência por código cobre a integração da nova versão, inclusive o Guardião. [Registro do elenco](21-ELASTAO-DE-HEROIS.md).

### Por que os Sapos aceitavam técnicas abaixo do nível máximo? · 24/11/2026

A oficina verificava apenas se as duas técnicas foram aprendidas. Agora verifica o teto ao listar a oferta e ao confirmar. O catálogo de planejamento pode ser consultado antes da partida. [Regra da oficina](10-PLANEJAMENTO-FUSAO-PROGRESSAO-V05.md#oficina-dos-sapos-sábios).

### Como funciona o foco e o que acontece após 8 minutos? · 24/11/2026

- **Implementado e testado por código.** A mira prioriza o alvo fixado ao alcance da técnica. O projétil simples para no primeiro inimigo da trajetória. Em V e disparos múltiplos reservam um tiro central sob foco.
- **Medido em simulação.** O Final Swarm começa aos 10 minutos na mesma zona. O Kage com desvio médio e catálogo aberto teve 45 sobreviventes de 345 aos 13 minutos. O simulador escolhe técnicas, afixos, pílulas e itens usando as ofertas da run. [Resultados completos](20-SCALING-EREGULAS.md#sobrevivência-na-zona-1--24112026).

### Como o Shikamaru e os cálculos de dano foram revisados? · 24/11/2026

O NPC fixa a versão Estrategista. O dano por escola e elemento agora tem um cálculo comum à ficha e ao acerto. Os itens de dano direto foram cruzados com todos os pools e ultimates. A curva sobe continuamente por nível, mas avança mais rápido que a vida do inimigo comum principalmente a partir do quinto minuto. A [auditoria de dano e itens](04-ITENS-HABILIDADES-ECONOMIA.md#dano-por-acerto-e-itens--24112026) e o [registro de escala](20-SCALING-EREGULAS.md#comparação-com-a-vida-dos-monstros--24112026) mantêm os valores para decisão de balanceamento.

### Como reforçar o perigo, ajustar projéteis e dar volume aos itens? · 25/11/2026

- Perder HP gera um clarão vermelho sobre a cena e um baque com estalo mais presente. A opção Gráficos controla o clarão e a vinheta. O som segue o volume de efeitos.
- Kunais, shurikens e Fūma de inimigos comuns ficam 15% mais lentas em todas as dificuldades, com o mesmo alcance. O Genin ganha pressão gradual a partir do minuto 1. Nas simulações, a contagem de sobreviventes do Genin aos 13 minutos ficou em 180 de 345 nas duas versões. [Ajuste e medição](20-SCALING-EREGULAS.md#pressão-do-genin-e-armas-comuns).
- Itens do chão e armas comuns usam modelos 3D. O teste em CPU mediu os lotes com 1.600 inimigos. A medição de FPS da partida completa e do instalador está pendente. [Teste dos lotes](development/CRIAR-MAPAS-JOGAVEIS.md#itens-da-missão-em-3d).

### Como deixar o HUD dos ajudantes compacto e padronizado? · 25/11/2026

Os retratos usam o enquadramento de corpo inteiro da seleção. Nome e afinidade aparecem em cada linha, com quebra automática do nome. A equipe divide a barra de recarga e o detalhe de ataques e passivas fica na ficha (P). [HUD e ficha](02-FICHA-HUD-RANKING.md#hud-em-partida).

### Por que os drops sumiam e os chefes podiam ser deletados ao entrar? · 25/11/2026

**IMPLEMENTADO.** A coleta usa um relógio independente e a consolidação mantém drops perto do abate. O treino isola a horda da zona, anuncia o chefe e mostra a contagem de portais no HUD. A entrada protege Guardiões, Bijū e o chefe do treino. A invocação tardia cresce em HP, dano e armadura, considerando os planos do Shikamaru. Tab permite traçar rotas sem interromper o movimento. NPC já usado deixa o mapa. O Benihisago entrega 150% do preço de um pergaminho pago a cada 100 abates. A aparência e o fluxo da partida aguardam verificação visual.

### Como dividir arte, balanceamento e regressões? · 25/11/2026

**IMPLEMENTADO.** A fila tem responsáveis e critérios de verificação. O índice de drops mantém as posições originais. O Hagoromo ganhou retrato, selo, indicador de fase e coleta antes de sair. As versões capturáveis usam a pose ajoelhada. **PENDENTE.** Gesto da mão no peito conforme as referências e calibração da defesa das Bijū.

### Quantos Lamens uma run deve dar? · 26/11/2026

**IMPLEMENTADO.** Vitória completa no Kage fica entre 2,9 mil e 3,1 mil Lamens. Toda parcela de `LAMEN_RULES` tem teto (tempo 30 min, abates 200, nível 100 níveis × 2, zonas +60, selados 4 × 20, vitória 100); Bijū = 60 × dificuldade × (1 + 0,33 × até 3 planos). Números grandes da ficha final usam K, M, B, T, Q.

### Final Swarm com poucos monstros nas zonas 2 e 3? · 26/11/2026

**IMPLEMENTADO.** O teto (800 até +4 min, 1.600 a partir de +7 min) estava certo; faltava ritmo de nascimento. `spawnBudgetFor` (progression.ts) repõe até o teto a cada quadro no Final Swarm, até `SPAWN_RULES.swarmPerFrame` (120). **PENDENTE.** Validar FPS e contagem no navegador; Bijū que não apareceu aguarda detalhes do usuário.

### Quantas pílulas e como sobe o preço do Mercador? · 26/11/2026

**IMPLEMENTADO.** 5 tipos de pílula por run (`PILL_SLOTS`). No Mercador, o item custa base da raridade × 1,35^compras × inflação por minuto; roletar não mexe nesse preço, só no da próxima roletada (×1,5 por uso).

### A Sorte entra nos buffs de evento? · 26/11/2026

**IMPLEMENTADO.** Régua única em `src/game/luckQuality.ts` (`luckQuality`, `skewedRoll`): Hagoromo (raridade e ferramentas), Ebisu e lição do Iruka. Altar: `altarLuckMultiplier` no valor. Cartas, Mercador e Caça-Níquel: regras próprias de Sorte. **Em aberto:** a raridade do altar no mapa não usa Sorte.

### Como funciona o "Tente lembrar o planejado" do Ichiraku? · 26/11/2026

**IMPLEMENTADO.** `src/game/ichirakuRecall.ts` (`ICHIRAKU_RECALL`, `recallCardCount`, `rollRecall`, `recallBlocked`); no GameCanvas, `openRecall`, `learnRecall`, `learnSkillOffer` e `recallZone` (salvo em `campaign.ichirakuRecall`). Condição: espaço de técnica livre e técnica nova disponível no nível; 1 a 3 cartas; planejada ×1,5; uma vez por zona; grátis. **Interpretado:** "50% de chance" = peso 50% maior.

### Como é a ultimate do Nagato? · 26/11/2026

**IMPLEMENTADO.** `src/game/peinRikudo.ts` (`PEIN_RIKUDO`, `RIKUDO_PATHS`, `rikudoDue`, `rikudoTotalPower`) e `runRikudo`/`updateRikudo` no GameCanvas. Kit igual ao do Pain via `rinneganKit`; únicas divididas por `RINNEGAN_FAMILIES`/`sameTechniqueOwner`. **PENDENTE.** Arte dos Seis Caminhos (Codex) e validação em partida.

### Chefes podem ser empurrados? Têm fúria? · 26/11/2026

**IMPLEMENTADO.** `src/game/bossRage.ts`: `immovableBoss` (Guardião, Bijū, Totem) bloqueia Empurrar e gravidade; `checkBossRage` no GameCanvas aplica `BOSS_RAGE` (70% da vida, +25% de dano, defesa `rageDefense`). Bijū continua com `BIJUU_FURY`.

### O treino sem nada para subir aumenta só o Movimento? · 26/11/2026

**NÃO.** `rollPowerlevel` (src/game/powerlevel.ts) sorteia por igual entre os 19 atributos de `POWERLEVEL_ATTRIBUTES` com valor acima de 0; cada sorteio dá +0,6% naquele atributo.

### Onde ficam os Eventos? · 26/11/2026

**IMPLEMENTADO.** Na home (cartão `home-event-card` em main.tsx, um por evento de `EVENTS`) e no menu do topo; não mais no planejar missão (MapSelect).

### Qual inimigo da horda atira? · 26/11/2026

**IMPLEMENTADO.** Só o ninja de capuz roxo (linha 0 de `shinobi-enemy-front-v3.png`), por `hordeLook` em `src/game/hordeRoles.ts`. Chance de atirador `rangedChance` (7% → 20% em 5 min da zona), só em comuns fora de desafio.

### Por que o FPS cai com muitos drops no chão? · 26/11/2026

**IMPLEMENTADO.** `DROP_MERGE`/`mergeTarget` em src/game/drops.ts: no máximo 6 drops de XP, Ryu e chakra por célula de 8 m; o resto soma no valor. **Em aberto:** custo da roleta da Tsunade (`ROULETTE_RULES.costGrowth` 1,7 por giro, sem zerar) — o usuário acha que o Ryu some rápido.

### Quanto sobem a roleta da Tsunade e as kunais? · 26/11/2026

**IMPLEMENTADO.** +20% por uso, sem inflação: `rouletteCost(giros, desconto)` (base 30) e `weaponPrice(aberturas)` (base 20). Só o Mercador ainda usa `runInflation`.

### Como funcionam os guizos? · 26/11/2026

**IMPLEMENTADO.** `src/game/guizos.ts`; no GameCanvas `activateGuizo`, `updateGuizos`, `guizoBusy` e o tipo de pickup `guizo-<id>`. Efeitos via `applyTimedBuff` (aparecem no HUD); Ímã usa `globalMagnetUntil`. **PROPOSTO:** Dificuldade +20% e Isca +30%.

### Onde aparece a vida dos chefes e Mega Elites? · 26/11/2026

**IMPLEMENTADO.** `BossBars` (src/ui/BossBars.tsx, estilo em src/boss-bars.css), alimentado por `bossBars()` no snapshot do GameCanvas. Sem números; até 3 barras.

### Build fraca deve sofrer aos 5 min? · 26/11/2026

**IMPLEMENTADO.** `MID_HP_RAMP`/`midHpRamp` em src/game/progression.ts (×12 aos 8 min de zona, some aos 30 min). Medir com `node scripts/simulate-early.mjs Genin,Kage 1 novo` e `… maximo` (marcos 1, 2, 3, 5 e 8 min).

### O que derrubou o navegador por falta de memória? · 26/11/2026

**CORRIGIDO.** Fila `deathBursts` sem teto (agora `enqueueDeathBurst`, máx. 120). Regra para filas novas: toda fila que cresce com abates precisa de teto ou de vida curta (ver tests/memoria.test.mjs).

### Como cada zona fica mais difícil? · 26/11/2026

**IMPLEMENTADO.** A curva recomeça por zona (decisão do usuário); `ZONE_TOUGHNESS` multiplica a vida e soma defesa por zona (zona 2: ×6, +0,05; zona 3: ×20, +0,10), passado em `zoneThreat(…, tuning, zona)`. Dano: `ZONE_DIFFICULTY`. A defesa dos monstros tem teto de 97% (`SWARM_STEP.armorCap`).

### Como funcionam o treino do Guy e as ferramentas do Hagoromo? · 26/11/2026

**IMPLEMENTADO.** Guy: `youthBonuses(dificuldade, atributo)` dá só o atributo escolhido (`YOUTH_POWER` 4/8/16); o painel manda `{difficulty, stat}` no evento `shinobi-youth`. Hagoromo: `SAGE_TOOLS` com 34 ferramentas (9 com efeito, 25 `passive`), `icon` em cada uma.

### Chefes · 25/11/2026

- Medição de chefes: `scripts/simulate-bosses.mjs` (`guardianProbe`, `bijuuProbe`, `ARMOR_OPTIONS`). Bijū: `BIJUU_RULES`, `bijuuVitality`, `bijuuDefense` em `src/game/bijuu.ts`. Armadura bruta: `guardianArmor`. Limite numérico: `BOSS_HP_LIMIT` / `finiteBossHp` em `src/game/missions.ts`.

- Animação: quadros de sprite usam `animClock` (sempre anda), nunca `elapsed` (para no Treinamento do Hagoromo e no selamento).

- Configuração `autoPickSingle` / `shouldAutoPick` (settings.ts): escolha automática da única carta de nível, aplicada em `openLevelReward`.

- Armadilha do corpo (25/11): `FALLEN_TRAP.elites`, `trapIsElite`; 10 ninjas sempre (sem limite do teto), recompensa `spawnPickup('sealDrop',…)`.

- Piso de vida dos chefes (25/11): `src/game/bossScaling.ts` (`BOSS_POWER`, `singleTargetDps`, `expectedHit`, `bossHpWithFloor`); `playerBossDps` e `guardianHpNow` no GameCanvas.

- Espinhos (25/11): `thornsDamage` em `src/game/combat.ts` (armadura × dano do personagem). Simulador de status: `scripts/simulate-status.mjs` (`statusFight`, `measureBuild`, `summarizeStatus`, `STRESS`).

- Elemento Gelo e bônus de elemento (25/11): `elementMultiplier` e `ELEMENT_KEY.Gelo` em `src/game/combat.ts`; `KekkeiRecipe.element` em `techniqueMerge.ts`; `look()` em `particleFx.ts` (Gelo usa o visual de Água).

- Pacote de status calibrado (25/11): `STATUS_RULES.chill.stacksToFreeze` = 2, `burstBurn` em `statusRules.ts`/GameCanvas (Katon sem cadeia), chances dos itens em `catalog.ts`.

- Fusões por receita (25/11): `FUSION_RECIPES`, `fusionRecipe`, `fusionByName` (alias `kekkeiFusion`), `FUSION_KIND_LABEL` e `legacyFusion` em `src/game/techniqueMerge.ts`; regra e lista em docs/10.

- Cartão de fusão (25/11): `src/game/fusionCard.ts` (`fusionParts`, `fusionUpgrades`, `fusionSheet`) e `FusionCard` / tooltip com `pair` em `src/ui/BuildPlanner.tsx`.

- Selos de mão (25/11): `src/game/handSeals.ts` (`sealSequence`, `sealDue`, `SEAL_RULES`) e `showHandSeals` no GameCanvas. Desde 25/11 o Claude Code não faz arte nem animação nova.

- Eventos do anime (25/11): `src/game/events.ts` (`CHUNIN_EXAM`, `SEASON_ONE_ROSTER`, `duelOpponent`, `duelReady`), `completeEventDuel` em `account.ts`, `src/ui/EventsPage.tsx` e prop `eventDuel` no GameCanvas.

- Começo de partida de todo o elenco (25/11): `node scripts/simulate-early.mjs [dificuldades] [sementes] [conta] [desvio]`; capacidade = abates/s com a horda no teto ÷ nascimentos/s.

- Prêmios de evento (25/11): `prizes`, `eventPrizes`, `earnedTitle`, `frameLock` em `events.ts`; `claimEventPrize` em `account.ts`; crédito em `main.tsx`.

- **Status de personagens e monstros (25/11):** valores em `docs/28-STATUS-PERSONAGENS-E-MONSTROS.md` (gerado por `node scripts/gen-status-doc.mjs`); histórico com datas e builds em `docs/28-HISTORICO-STATUS.md`. Ao mudar balanceamento: rodar o gerador e acrescentar a linha no histórico.

## 5. Estado atual do projeto

**24/11/2026.** As quatro vilas já são usadas em novas missões na cópia principal. Em Konoha, a Academia e o memorial foram revisados após a integração. Os personagens aprovados Gengetsu, Sakumo e Orochimaru Akatsuki estão em `bb092d0`.

**Retomada de 23/11/2026.** A versão principal recebeu as rodadas 97–103 do Claude, até `a394509`. Os mapas continuam com o Codex, em branch de validação e com parcial local. O usuário pediu manter os personagens atuais, guardar o low poly externamente e aproximar a densidade e o acabamento das cidades às fotos de seleção. Construções precisam mostrar laterais e fundos com a rotação da câmera. A arquitetura nova ainda precisa ser ligada à cena. [Estado conferido e fila de continuação](27-RETOMADA-MAPAS-23-11.md).

**14/11/2026.** As 114 versões jogáveis usam quatro quadros por vista na caminhada, no pulo e no dash. Os quatro inimigos comuns têm quatro quadros nas mesmas três ações. As nove bijū têm os atlas dianteiro e traseiro. A prova visual em partida continua pendente. Ver [elenco](21-ELASTAO-DE-HEROIS.md) e [fila do Claude](26-PASSAGEM-PARA-O-PROXIMO-AGENTE.md).

- **Repositório:** `https://github.com/jcffadev/Shinobibonk.git`, branch `main`, commits das rodadas 35 (plano) e 36 (segmentação de contexto — ver git log). O usuário decidiu (11/11) **excluir e recriar o repositório** para remover do histórico o zip de origem não verificada e os materiais antigos (execução pendente do usuário; nada preparado para o suporte da GitHub). Até a recriação, commit/push segue neste repositório; depois, `git remote set-url origin <novo-url>` + push. `artifacts/sb-swishes-source.zip` fora do índice e no .gitignore — sai com a exclusão do repositório.
- **Backup de segurança (rodada 36, 12/11):** `backup-ShinobiBonk-2026-11-12.zip` na **raiz do workspace** (fora da pasta do projeto) — 980 MB, **2.882 arquivos** (sem `node_modules`, com `.git`), integridade validada (contagem + hashes de amostra de CHANGELOG.md e AGENTS.md).
- **Documentação (rodada 36, 12/11):** índice agregador `docs/19-INDICE-DO-CONHECIMENTO.md` (mapa de 19 domínios + 6 regras permanentes + manifesto de migração) + domínios `docs/20-SCALING-EREGULAS.md` (fórmulas/valores — foto do código em 12/11) e `docs/21-ELASTAO-DE-HEROIS.md` (roster 56 + fila de novos); skills `contexto-e-decisao`/`documentar-projeto` atualizadas para o fluxo índice + domínio.
- **Rodada 37 (12/11):** mega-lote da 35 **AUTORIZADO** — fila em [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md) com os novos specs (combos do Caça-Níquel, emboscada invertida, custo em escala por zona, renames dos revives, White Flute como ITEM, pílulas 9/13/15 com buff de conta = Passivas Shinobi, Isca Shinobi → vitamina, Tobi ×2/Nagato/Yahiko=PAIN, primeiros Kages de cada vila, HP no pé do personagem, folhas frente/costas, ytmp3.yt autorizado); **implementação em curso** (docs/20 + docs/21 sincronizados).
- **Rodada 39 (12/11):** planner em **TABELA** (Opção · Origem/efeito · Raridade/estado · Ações) + aba **FUSÕES** (pares até 4 por herói, preview Fundir/Combinar) + **Táticas de Missão** (snapshot do plano, até 4 por herói) + **buff verde/debuff vermelho** por cláusula + **badge ⚗ Requisito de Fusão** no pool da run + **“pra” → “para”** + **plano individual por personagem** (chaves `sb_*_by_hero_v1` com fallback das chaves globais antigas, nunca apagadas; recarga ao trocar de herói) + **proporção idêntica em qualquer movimento** (bbox alfa em `playerMotion.ts`, clamp 0,85–1,35). IMPLEMENTADO + validado (`tsc` · `vite build` · `verify-rules` 56/97/95 · `verify-motion-atlases` 56/560/0); `verify-runtime` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (FPS baixo é o SwiftShader do headless, esperado; GPU real valida em separado).
- **Rodada 40 (12/11):** passiva **“Couraça” → “Colete Shinobi”** — buff inalterado (+2 armadura/nível), ícone do **colete** (`jonin-vest` do atlas) e **migração não destrutiva** do save `sb_permanent_levels` (chave antiga copiada, nunca apagada; quem já comprou mantém o buff). IMPLEMENTADO + validado (tsc · build · verify-rules 56/97/95 · verify-runtime 58/0/0).
- **Rodada 47 (12/11):** **13 pedidos** — crítico 250%/mega 300% (**CONFIRMADO**, já no código) · **YOOOO rápido** (`preloadYooo()` no boot) · **Isca Shinobi → Pílula** (item `shinobi-bait` removido do catálogo) · **Treinar auto-planeja** (botão para todas as técnicas) + **badge “★ Treinada · +15%”** na ficha · **early game +200% (PROPOSTO — o usuário testa e ajusta)** (`ENEMY_SCALING` hpBase 3,2 · armor `.03`/`.72` · `HERO_DAMAGE_FACTOR` .41 + bug `.55` da `version()` corrigido) · **raridade preenchendo o ícone** no pool · **bordas temáticas** na ficha · **botões do planner** · **selamento instantâneo** (sem tela “continuar missão”) · **pool adapta a largura** a 1–4 cartas · **auto-coleta ao pisar** (sem “E” — só emboscadas) · **passada sem distorção** (`strideTarget`). IMPLEMENTADO + validado (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros/0 404); **aprovação do usuário pendente**.
- **Rodada 49 (12/11/2026):** **4 pedidos** — (1) **altar sem “E”**: E em cima do altar **não reinicia** (toast + guard idempotente + prompt sem a tecla — o altar continua ativando AO PISAR, Rodada 47) · (2) **kunai/shuriken → PERGAMINHOS** coletados com **E** (sem auto-coleta; ícone `scroll.svg` + sprite de pergaminho) · (3) **Final Swarm** teto **1.600** com rampa progressiva (800 até +4 min, 1.600 em +7 min) + clamp por quadro + cap na emboscada · (4) **moedas → MORROS DE BOLINHOS DE ARROZ** (ímã global 10 s puxando xp/lamen/chakra + lamen de cura + Ryu por zona/dificuldade/sorte). Regressão do portal corrigida (aviso só com pergaminho a ≤6 m). IMPLEMENTADO + validado (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 0 erros); **aprovação do usuário pendente** — **o zip do Netlify (11/11) é STALE: re-upar após esta rodada (o print de 5.468 monstros vem daquela build).**
- **Rodada 50 (12/11/2026):** **4 pedidos** — (1) **morros de arroz sem auto-coleta, coletados com E** (o único pickup auto-coletado é o `sealDrop` do mega elite derrotado; o morro **não cura diretamente** — dá Ryu por zona/missão/sorte + ímã global 10 s + **lamen de cura 35% do HP**) · (2) **escada de monstros vivos ~−40% no early game** (**PROPOSTO — o usuário testa e ajusta**): `capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8` → Genin **91 vivos @1 min** · 695@8 · 936@10 · teto 1.600 aos ~15 min; %inimigos de itens/debuffs **JÁ multiplica o cap** (`threatNow`) · (3) **1º mega elite ~9,5 mil HP ±5% aleatório por spawn** (**PROPOSTO**) — era 20 mil · (4) **ficha de status do personagem de volta** — nova **1ª coluna** da pausa “Ficha do personagem · Status da run” (TOTAIS ATAQUE/DEFESA/UTILIDADE + crítico 250%/mega 300% + “Ameaça da missão ×{difficultyScale}”); **conflito Rodada 48×50 resolvido:** status = sim (totais), **tabela de % de itens continua fora**. Regressão da suíte corrigida (seletor `.run-sheet details`). IMPLEMENTADO + validado (tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime 183 drawCalls/1.600 bodies); **aprovação do usuário pendente (itens 2/3 = PROPOSTOS)** — **re-upar o zip do Netlify (STALE).**
- **Build:** React 19 + TS + Three.js 0.187, Vite 8. Últimas validações (11/11): `tsc -b`, build, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless, todos os checks verdes).
- **Publicação:** Netlify manual funcionando (`*.netlify.app`); desempenho **sem ajuste automático** (removido a pedido do usuário) — o jogador define Qualidade/Limite de FPS/Resolução em Gráficos (simulação ~1,8 ms/frame com 1.200 inimigos).
- **Conteúdo:** 56 versões jogáveis com caminhada; ~24 versões com folhas completas de ação; 4 mapas (auditoria visual pendente); catálogo de 94 itens; 19 pílulas; árvore permanente; oficina de fusão; roleta (Caça-Níquel da Tsunade — renome/combos em implementação); altares por raridade; **Final Swarm com teto 1.600** (rampa progressiva — rodadas 48/49; pergaminhos coletados com E; morros de bolinhos de arroz com ímã 10 s). **Rodada 37:** fila da 35 **AUTORIZADA** (implementação em curso); personagens novos APROVADOS (Kages + primeiros de cada vila + Tier A 17 + Tobi ×2 + Nagato + Yahiko=Pain).
- **Fora do repositório:** pasta arquivada na raiz do workspace — contexto completo do jogo de referência (docs antigos íntegros, prints, vídeo medido) + **rodada 35 (12/11)**: 7 telas de HUD/menu de referência (`prints/r35-naruto-ui-*.png`) + 23 frames de 6 vídeos de gameplay (`prints/frames-6-videos/`) + links de áudio (CONTEXTO-COMPLETO.md §9). Os 6 vídeos (150–240 MB cada) ficaram na pasta de clips do Medal do usuário.
- **Atenção ao GitHub:** os prints e docs/15–17 **continuam no histórico** do repositório (removidos só da ponta). Resolvido pela decisão do usuário de **excluir e recriar o repositório** (11/11) — o zip e os materiais saem com o histórico; sem reescrita, sem force push, sem contato com o suporte.

## 6. Pendências vivas (espelho de docs/13)

1. **Kankuro RESOLVIDO** (usuário confirmou em 11/11; arte 1/15/30 + walk/action v3 no repositório); restam: Kushina (1) + revisão Neji/Sasuke/Naruto Clássico.
2. Revisão visual das 56 versões (inclusive como ajudantes).
3. Medir balanceamento em run real (níveis 2/4/6; abates; vivos) — propostas no arquivo arquivado, **nenhuma aprovada**.
4. Efeitos/prévias: Susanoo por lançador, Gamabunta, clones, sons com licença.
5. Auditoria visual dos 4 mapas (chão/construções/atlas).
6. Run prolongada 3 zonas → bijū → ranking; FPS em GPU real; cadastro com servidor e alpha (etapas posteriores).
7. Decisões pendentes do usuário: propostas de calibração (arquivo arquivado), itens da comunidade (fusão/Kekkei Genkai, projéteis vermelhos, água, som de hit, badges do pool).
9. **Rodada 57 (14/11):** fontes da HUD aumentadas (pendente ver na tela). **Rodada 38 (12/11):** responder as 15 perguntas e a revisão canônica de [docs/22](22-PROPOSTA-NOVOS-SHINOBIS.md) antes de criar personagens; redesenho próprio da ficha P/Bolsa/Plano/configurações no tema ninja; validar animação e FPS da HUD em GPU real; voltar `TEST_UNLOCK_ALL` a false antes da versão pública.
8. **Rodada 37 (12/11):** mega-lote da 35 **AUTORIZADO** — 9 perguntas em aberto respondidas; fila atualizada em docs/13 (IMPLEMENTAÇÃO INICIADA).
10. **Rodada 39 (12/11):** **teste do usuário** do planner em tabela · aba Fusões · Táticas de Missão · badge ⚗ no pool · proporção do personagem em movimento; **buff de conta de dano de habilidades POR NINJA** (pergunta em aberta — o +15% do Treinamento com Jiraiya já é individual por herói; se for Passiva Shinobi nova por Lamens, aguarda aprovação); fases 4/6/7/8 seguem em docs/13.
11. **Rodada 40 (12/11):** **conferência visual** do ícone da passiva “Colete Shinobi” (colete) pelo usuário.
12. **Rodada 41 (12/11):** **aprovação do usuário** — (a) Kuri como companheira permanente do Kankuro · (b) Kuroari como visual da técnica · (c) adiantar o herói Sasori (Onda 2) ou manter a ordem · (d) aceitar a arte Pillow interina (ou gerar IA e trocar os 4 PNGs com os mesmos nomes) · (e) conferência visual das 4 folhas.
13. **Rodada 42 (12/11):** **aprovação do usuário das 6 decisões de interpretação da trilha sonora** (Raising Fighting Spirit = pool RUN + luta bijū · Hinata/Neji na mesma faixa · pós-bijū volta ao pool RUN · vitória → pool de menus · `musicVolume` 0,7 · sem crossfade) + **as 4 pendências da rodada 41 seguem em aberto** (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência das folhas).
14. **Rodada 43 (12/11):** **aprovação do usuário das 4 decisões de interpretação** (som de Shinra Tensei na Ultimate `Chibaku Tensei` do Pain · Kage Bunshin só família naruto · anti-spam: nenhum outro som de técnica entra enquanto o MP3 toca e a fala TTS da técnica é suprimida · levitação do Pain: arco 0,38 m + pose de braços levantados segura) + **as 4 pendências da rodada 41 seguem em aberto** (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência das folhas) + **as 6 da rodada 42 seguem em aberto** (decisões de trilha sonora) + **controle de revisão** em [docs/23](23-REVISAO-OUTROS-AGENTES.md) para o Claude/Codex (o que o Qwen fez + o que ficou para eles: arte das 3 expressões da Tsunade · arte Pillow Kuri/Kuroari (swap IA) · pose dedicada da ultimate do Pain (hook `painUltimate`) · download de áudio (usuário baixa e entrega) · validação FPS em GPU real).
15. **Rodada 44 (12/11):** **pedido do usuário** — “o rawinputmouse ainda está esquisito” · “a câmera ainda parece muito rápida” · “é possível deitar mais a câmera no nosso jogo referência, mas tome cuidado, faça testes para não dar bug's gráficos” · “a câmera centralizar o jogador e não a paisagem/mapa ao redor”. **Decisões de interpretação (aguardando aprovação do usuário):** (a) **taxa única e simétrica 0,0025 rad/px** em yaw e pitch (era 0,006/0,004 — a assimetria de 1,5:1 causava o “esquisito”; velocidade −53–58%) · (b) **piso do pitch 0,05 rad (~3°)** (era 0,12) para “deitar mais a câmera” como no jogo de referência · (c) **início 0,55 rad (~31,5°)** (era 0,74) · (d) **dica do Windows: velocidade do ponteiro 6/11** na hint do slider (o multiplicador do sistema pode somar ao raw input — possível causa de “ainda parecer rápido” no PC do usuário) · (e) **câmera centraliza o JOGADOR** (pedido 4) — **verificado: já era assim** no código (câmera mira no jogador via `camera.lookAt`), não alterado · (f) **zoom/wheel/frustum NÃO alterados** (usuário não pediu). Implementado em `GameCanvas.tsx` (pitch inicial + `turnCamera`) + `SettingsScreen.tsx` (hint do slider) · validado (tsc · vite build · verify-rules · verify-motion-atlases · verify-runtime 58 checks + inspeção visual do screenshot do piso sem bug gráfico) · teste do usuário pendente.
16. **Rodada 47 (12/11/2026):** **aprovação do usuário dos 13 pedidos** — (a) **early game +200% (PROPOSTO)**: valores `hpBase 3,2` · `armorPerMinute .03` · `maxArmor .72` · `HERO_DAMAGE_FACTOR .41` (dificuldade ≈ ×2,8–3,1 no minuto 0, em todas as dificuldades) — o usuário testa a gameplay e ajustamos em iteração · (b) YOOOO rápido (preload no boot — 1º clique sem fetch) · (c) **Isca Shinobi → Pílula RESOLVIDA (Rodada 47)** (item `shinobi-bait` removido do catálogo; pílula com os mesmos valores) · (d) Treinar auto-planeja + badge “★ Treinada” na ficha · (e) raridade preenchendo o ícone no pool · (f) bordas temáticas na ficha · (g) botões do planner · (h) selamento sem substituto continua a missão na hora (sem tela “continuar missão”) · (i) pool adapta a largura a 1–4 cartas · (j) auto-coleta ao pisar (sem “E” — só emboscadas) · (k) passada sem distorção ao atacar + andar (`strideTarget`) · (l) crítico 250%/mega 300% (**CONFIRMADO** — já no código). Teste do usuário no navegador pendente.
17. **Rodada 49 (12/11/2026):** **aprovação do usuário** — (a) **altar sem “E”** (só pisar; E não reinicia) · (b) **pergaminhos coletados com E** (kunai/shuriken no chão viraram pergaminhos; sem auto-coleta) · (c) **Final Swarm 1.600** + rampa 800@+4min → 1.600@+7min + clamp por quadro · (d) **morros de bolinhos de arroz** (ímã 10 s + lamen de cura + Ryu por zona/dificuldade/sorte — **fórmula minha, não aprovada**: `(14+zona×6)×tarefa×(1+min(1,sorte×0,01))`) · **re-upload do zip no Netlify** (o zip atual, de 11/11, é **STALE** — o print de 5.468 monstros vem daquela build) · teste do usuário em GPU real pendente.
18. **Rodada 50 (12/11/2026):** **aprovação do usuário** — (a) **morros de arroz coletados com E, sem auto-coleta** (substitui a auto-coleta da Rodada 49 — a mais recente prevalece; único auto = `sealDrop` do mega elite derrotado) + **resposta à pergunta:** o morro **não cura diretamente** — dá Ryu por zona/missão/sorte + ímã global 10 s + **lamen de cura 35% do HP** · (b) **escada de monstros vivos ~−40% no early game (PROPOSTO)**: `capBase 36 · capLinear 52 · capQuad 3,8` → Genin **91@1 min** · 695@8 · 936@10 · teto 1.600 aos ~15 min — progressiva em tempo + %inimigos de itens/debuffs (que já multiplicam o cap) · (c) **1º mega elite 9,5 mil HP ±5% por spawn (PROPOSTO)** — “cerca de 9 a 10 meio aleatório” · (d) **ficha de status do personagem** — nova 1ª coluna da pausa (TOTAIS ATAQUE/DEFESA/UTILIDADE + “Ameaça da missão”); **tabela de % de itens continua fora** (decisão da Rodada 48 mantida) · (e) **re-upload do zip no Netlify (STALE)** + teste do usuário em GPU real pendente.

## 7. Mapa do que está onde

| Conteúdo | Onde |
|---|---|
| Regras permanentes e invariantes | [AGENTS.md](../AGENTS.md) |
| **Este arquivo — direção + P/R permanente** | `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` |
| Registro **integral** das mensagens (pedido/resposta) | [14-CONTEXTO-DO-CHAT.md](14-CONTEXTO-DO-CHAT.md) |
| Chat anterior (histórico consolidado de 05/11) | [ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md](../ShinobiBonk_CONTEXTO_COMPLETO_DO_CHAT.md) |
| Fila de trabalho | [13-PENDENCIAS-PARA-CONTINUAR.md](13-PENDENCIAS-PARA-CONTINUAR.md) |
| **Índice do conhecimento + domínios (rodada 36)** | [19-INDICE-DO-CONHECIMENTO.md](19-INDICE-DO-CONHECIMENTO.md) · [20-SCALING-EREGULAS.md](20-SCALING-EREGULAS.md) · [21-ELASTAO-DE-HEROIS.md](21-ELASTAO-DE-HEROIS.md) |
| **Proposta de novos shinobis (rodada 38)** | [22-PROPOSTA-NOVOS-SHINOBIS.md](22-PROPOSTA-NOVOS-SHINOBIS.md) |
| HUD ninja (prévias e capturas) | `docs/previas/hud-ninja/` · `src/ninja-theme.css` |
| Estado do código | [12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md) · [00-LEIA-PRIMEIRO.md](00-LEIA-PRIMEIRO.md) |
| Sistemas (câmera/mapas, ficha/HUD, aliados, itens/economia, personagens, hub/plano) | docs/01, 02, 03, 04, 05, 09, 10, 11 |
| Mudanças do jogo | [CHANGELOG.md](../CHANGELOG.md) |
| Contexto do jogo de referência (fora do repo) | pasta arquivada na raiz do workspace: `CONTEXTO-COMPLETO.md` + `prints/` |
| Skills do projeto (como trabalhar) | [skills/contexto-e-decisao](../skills/contexto-e-decisao/SKILL.md) (primeiro passo) · [skills/documentar-projeto](../skills/documentar-projeto/SKILL.md) · [skills/publicar-github](../skills/publicar-github/SKILL.md) · [skills/criar-arte-shinobibonk](../skills/criar-arte-shinobibonk/SKILL.md) · [skills/movimentar-shinobi](../skills/movimentar-shinobi/SKILL.md) · [skills/referencia-externa](../skills/referencia-externa/SKILL.md) |
| Referências próprias do projeto (screenshots/concept art) | `references/` · `history/` (versões antigas) |


### Qual é o padrão de personagens 3D chibi? · 26/11/2026

A pixel art do atlas da versão orienta as vistas, a silhueta e a roupa. O ImageGen produz uma prancha e uma sequência de corrida para testar a direção. Uma malha 3D articulada com acabamento pixelado é a meta para o NPC aprovado. O estudo de OpenGL revelou articulações e formas simples demais para reproduzir a prancha. A skill registra o fluxo, as vistas e o limite de qualidade. [Criação de personagem 3D](../skills/criar-personagem-3d/SKILL.md).

### Como funcionam os megas de clima e a queda para selamento? · 26/11/2026

Névoa, nevasca e areia rodam nas quatro vilas. Haku usa flocos, Gaara poeira e Rasa partículas douradas. O Mega do clima tem marca de origem persistente que impede selamento. Os capturáveis recuam, trazem a manga em direção ao peito, baixam o joelho e assentam antes de liberar E. Validação offline concluída. Conferência em partida fica na fila.


### Como entram nas arenas do Exame e do Hagoromo? · 27/11/2026

A porta do Exame liga a floresta à sala de duelos. O E libera a passagem ao completar tempo e abates. C leva a um espaço separado com o Sábio ao fundo. Ao voltar ou retomar uma missão salva durante o treinamento, restaura-se a origem.

### Como está a cobertura de derrota e a amostra de NPCs? · 27/11/2026

Seis versões têm poses próprias com oito quadros e apoio ao joelho. A matriz e as skills exigem folha por versão, com a aparência do atlas atual. Os onze NPCs da missão têm estudo 3D chibi com textura pixel art, clipe próprio e GIF individual, fora da versão jogável até revisar acabamento.

### Por que a shuriken e o corpo davam o bônus sem os ninjas? · 27/11/2026

A Shuriken Amaldiçoada só invocava ninjas até o teto de vivos: com a horda cheia, nenhum. No Final Swarm, o corte de 1.600 removia os inimigos mais novos, que eram os da armadilha. Agora a shuriken sempre invoca 4·√(peso da missão) + 2 por zona depois da 1ª, e os ninjas das duas armadilhas nascem a 10 m fora das casas e ficam fora do corte (Claude Code).

### Como saber quando o chefe vai lançar a técnica? · 27/11/2026

Abaixo da barra de vida do chefe há a barra "Próxima técnica". Ela enche durante a recarga; quando fica vermelha com "⚠" e o nome da técnica, o aviso vermelho já está no chão e o golpe sai quando ela enche. Na fúria, a barra de vida pulsa em vermelho com o selo "🔥 Fúria". Vale também para o Mega do Hagoromo (Claude Code).

### O que faz o Incenso Repelente? · 27/11/2026

Por unidade (até 3): −8% de inimigos no mapa, +6% de movimento, +8% de Ryu e +8% de experiência. Com 30% de HP ou menos, empurra 6 m para longe os monstros a 7 m (+1 m por unidade extra), com recarga de 20 s. Guardião, Bijū e totem não se movem (Claude Code).

### Quem joga nesta temporada e como liberar? · 27/11/2026

Começa só o Naruto Academia. Genin e Jōnins saem por missão; Épicos (Tsunade, Jiraiya, Orochimaru) pedem missão em Jōnin ou mais; Lendários (Terceiro Hokage e os Kages de primeira versão) pedem Kage. Iruka sai ao completar o Exame Chūnin. Itachi Akatsuki e Kisame só no evento rotativo "Uma nova Organização surge!". Os outros ficam "Em breve" (Claude Code).

### Por que o selo falhou e o shinobi fugiu? · 27/11/2026

Toda captura tem chance por tentativa (Genin 80% · Chūnin 70% · Jōnin 60% · Épico 45% · Lendário 30% · Akatsuki 15%) e no máximo 3 tentativas. Na 3ª falha ele escapa e a faixa "ESCAPOU!" aparece. O card mostra a tentativa e a chance (Claude Code).

### Dá para ver a lista de personagens mais compacta? · 27/11/2026

Sim: no topo da lista há "☰ Por time" (com os títulos dos times) e "▦ Compacto" (quadradinhos menores lado a lado). A escolha fica salva neste navegador (Claude Code).

### Como os mapas e as dificuldades são liberados? · 27/11/2026

Conta nova começa só com Konoha e só o Genin. Vencer uma dificuldade abre a seguinte no mesmo mapa (Genin → Chūnin → Jōnin → Kage). O mapa seguinte (Areia, depois Pedra, depois Névoa) só abre ao vencer o Kage do anterior. O progresso fica salvo no navegador (Claude Code).

### Os monstros podem passar pela escadaria? · 27/11/2026

Só por cima, subindo degrau por degrau, ou pelo lado. Um degrau mais alto que os pés do monstro + 0,3 m é parede para ele (Claude Code).
