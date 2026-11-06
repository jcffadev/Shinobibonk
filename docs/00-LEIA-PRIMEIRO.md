# Estado real do ShinobiBonk · 05/11/2026

Este documento resume o que é decisão de produto e o que o código da base atual realmente executa. A referência técnica detalhada é [12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md).

## Como classificar

- **CONFIRMADO**: decisão passada pelo usuário.
- **IMPLEMENTADO**: há comportamento correspondente em `src/`.
- **TESTADO**: verificado por execução real (ver "Verificação" abaixo).
- **PROPOSTO**: desenho ainda sujeito a aprovação ou balanceamento.
- **PENDENTE**: não existe na base atual ou está incompleto.
- As imagens em `assets/referencia/prints` e `references/concept_art` são referências, não capturas do protótipo.

## Base executável

- React 19, TypeScript 7, Three.js 0.187 e Vite 8; iniciada com `pnpm dev`.
- `src/main.tsx`: hub local com elenco de **22 shinobis**, biblioteca de ataques, plano de build, árvore permanente, loja de itens e seleção de missão.
- `src/scene/GameCanvas.tsx`: cena 3D isométrica e simulação local da run.
- `src/game/`: dados e regras (heróis, técnicas, itens, atributos, dificuldade, evoluções, zonas, árvore).
- `game/index.html` é a versão Canvas 2D anterior, só legado.

## Decisões vigentes do usuário (CONFIRMADO)

- Shinobi e inimigos em pixel art (billboards) numa cena 3D. A câmera gira com o botão direito e o scroll controla o zoom.
- Missões nomeiam a dificuldade como Genin, Chunin, Jonin e Kage.
- Teclas: M abre o mapa completo; Tab o mapa rápido; P a ficha; G o ping “Aqui”; E interage.
- Ultimate manual no R. **A tecla Y é obrigatória** e alterna a Ultimate automática; o selo AUTO no botão R faz o mesmo por clique e mostra o estado.
- Economia da run: Ryu, kunai e shuriken. Kunai/shuriken são recompensas no mapa; o mercador troca armas por Ryu; o caça-níquel consome Ryu.
- Lamens é a moeda permanente da conta (árvore e desbloqueios), separada do Ryu da run.
- O pool de level-up/drop é escolhido pelo jogador.
- Orochimaru substitui Gengar no evento de maldição. Mega elites derrotados podem ser selados (E) ou recusados (G), e a recusa deixa um drop de item afetado por Sorte.
- Nada relacionado a Pokémon: os eventos de referência foram renomeados no código ("Plano do Shikamaru" e "Bênção de Tsunade").

## Implementado na base atual

- **Hub**:
  - Entrada como convidado e carteira local de teste ("Administrador", sem login) com 999.999 Lamens (o Ryu fica só dentro da run). O botão Reset devolve o que foi gasto e limpa a build.
  - Elenco de 22 shinobis em grade de retratos, com filtros por vila, elemento (afinidade principal) e organização/clã, mais busca por nome.
  - Biblioteca com 4 técnicas por shinobi e plano de build (planejar/arquivar técnicas, pílulas e itens).
  - Árvore permanente com 16 nós e loja de 91 itens com filtros e arquivamento.
  - Prévia da cena a partir do menu.
- **Run**:
  - Contagem regressiva de 10:00 e vitória ao chegar a 0:00. Derrota ao zerar o HP.
  - Três zonas de 200 s cada. Um guardião por zona: o jogador o invoca quando quiser no Selo do guardião (mais HP quanto mais tarde) ou ele chega sozinho aos 160 s da zona. O clima é sorteado a cada zona.
  - A dificuldade escala por rank da missão (Genin–Kage) e por tempo.
  - Inimigos telegrafam ataques com um marcador vermelho que pode ser evitado. Há armadura e evasão.
- **Técnicas**:
  - 1–4 são automáticas. Começa com 1 técnica; o máximo é 3 espaços, ou 4 com o nó "Quarta técnica". Nível máximo 9.
  - Algumas técnicas só ficam disponíveis a partir de certo nível.
  - Cada carta de técnica sorteia raridade e afixos (dano, raio, cadência, duração).
  - Estados: lentidão, atordoar, paralisar, dormir, empurrar, veneno e queimadura.
  - Crítico com faixa de "mega crítico" acima de 100% de chance.
- **Level-up**:
  - 3 cartas (4 com o nó "Quarta opção"), com clique ou 1–4.
  - **Só técnicas e pílulas; nunca itens.** Até 2 técnicas e o resto pílulas. Com todas as técnicas preenchidas e no nível máximo, só pílulas; com todas as pílulas no limite, só técnicas.
  - Itens vêm apenas de recompensas: kunai, shuriken, eventos, drop de item e recusa de selamento.
  - F/X/Z para atualizar, pular e banir; cada um tem 3 usos base, ampliáveis pela árvore. Banir exclui a opção pelo resto da run.
  - 3 s de invulnerabilidade ao subir de nível.
  - 18 pílulas com tema ninja (uma por atributo), até o nível 10 cada. Ver [04](04-ITENS-HABILIDADES-ECONOMIA.md).
- **Evoluções visuais por nível**: Naruto troca de forma nos níveis 10, 25 e 50; os outros shinobis aos 15/20/25/30, conforme o personagem. Cada evolução dá +25% do HP base.
- **Ultimate**:
  - Recarga passiva de 55 s, ajustada pela velocidade de recarga.
  - O drop roxo dá +9% de carga.
  - Tecla Y ou clique no selo AUTO do botão R ligam e desligam o uso automático.
- **Drops**: XP azul, Ryu amarelo, carga da Ultimate roxa, pílula rosa e recompensa de item laranja.
- **Eventos**:
  - Plano do Shikamaru: até 3 vezes por zona; cada vez dá +1 kunai grátis quando o guardião é derrotado, sem penalidade.
  - Altar de desafio: horda de 6.
  - Maldição de Orochimaru: +20% de dificuldade e +25% de XP/saque.
  - Altar para proteger: ficar 20 s no círculo.
  - Bênção de Tsunade: buff aleatório.
  - Mercador de armas.
  - Caça-níquel: 25 Ryu por giro.
  - **Barraca Ichiraku**: o sprite da barraca de lámen.
    - Esquecer uma pílula (todos os níveis) ou uma técnica custa 10 + 5 × nível em Ryu, quantas vezes quiser. A barraca nunca se esgota.
    - A última técnica não pode ser esquecida.
    - Os atributos são recalculados a partir das fontes, sem buff residual.
- **Cartões de ajudantes** (lado esquerdo, abaixo do herói), no padrão da referência do usuário:
  - retrato com moldura na cor da técnica, nome e selo da aldeia (ou "SINERGIA");
  - buff único do ajudante com o valor efetivo (por exemplo, "+1,5 HP/s de cura"), mais o bônus da Areia quando ativo;
  - técnica de ataque com barra de recarga;
  - elemento, escola, % de dano e intervalo.
  - Emboscadas periódicas.
  - **Sharingan de Kakashi (NPC)**:
    - Uma vez por zona, copia 1 item à escolha que o jogador já carrega (+1 cópia, até o limite do item).
    - A tela própria lista só itens abaixo do limite.
    - Não tem Atualizar/Banir; X cancela sem gastar o Kakashi.
- **Kunais/shurikens no mapa**: abrir custa Ryu (20, depois +10 por abertura) e oferece uma escolha de item.
- **Chefes (mega elites e guardiões)**: barra de vida com nome acima do personagem. Usam as técnicas do próprio shinobi contra o jogador, a cada 3–4,6 s conforme a zona, sempre com aviso vermelho no chão. Quem sai da área marcada não leva dano. Golpes com controle deixam o jogador lento. O guardião usa a Ultimate dele uma vez, abaixo de 50% de HP.
- **Mega elites e selamento**:
  - Mega elites são shinobis aleatórios do elenco (até 9 por run) e surgem naturalmente.
  - Ao derrotar um, E inicia o selamento animado de 2,7 s (instantâneo com a Shuriken Selo da Tenten) e o personagem entra na equipe.
  - G recusa e deixa uma kunai grátis.
- **Aliados selados**:
  - Seguem o jogador em formação e atacam sozinhos com a primeira técnica deles.
  - Cada aliado dá um **buff passivo único** ao grupo (tabela em [03](03-ALIADOS-E-SELAMENTO.md)). Os médicos curam; os outros dão o atributo que combina com o estilo deles.
  - Vagas: 3 base, +1 por item, +1 por passiva permanente; máximo 5.
  - Sinergias de vila e organização (`src/game/synergy.ts`): ativam com 2+ membros na equipe (herói + ajudantes, ao menos 1 ajudante) e acumulam (ex.: Itachi conta para Folha, Akatsuki e Uchiha). Painel "SINERGIAS" abaixo do card do herói; cada cartão de ajudante mostra a PASSIVA individual e as tags das sinergias para as quais contribui. Irmãos da Areia completos mantêm +12 armadura e +15% dano.
- **Descoberta**: eventos e kunais só entram no minimapa e no mapa depois de aparecerem no campo de visão da câmera (frustum, até 40 m).
- **H** oculta projéteis, efeitos e números sem desligar dano.
- **Ficha (P)**: atributos, técnicas com dano causado, itens, pílulas, aliados, sinergia e escala de dificuldade.
- **Resumo pós-run**: na vitória ou derrota, mostra:
  - resultado, forma final, tempo, zona, abates, dano total, DPS médio, dano dos aliados, Ryu, kunai e shuriken;
  - dano por técnica com % e DPS;
  - build final e atributos finais;
  - botões "Tentar novamente" e "Preparar outra missão".
  - **Lamens ganhos** pelo desempenho, com decomposição: tempo, abates, nível, zona, mega elites selados, vitória e multiplicador da dificuldade. São creditados uma vez por run, na vitória ou na derrota. O Ryu da run não vira Lamens.
- **HUD inferior**: pílulas numa linha própria acima das habilidades (quebra em até 2 linhas, com rolagem). Ajuda de teclas abaixo, à direita do botão "← Preparação".
- **Modo debug (sem login)**: existe só no servidor de desenvolvimento (`pnpm dev`/`ABRIR_JOGO.bat`); a build de produção não o tem. Na missão, F9 (ou a tecla à esquerda do 1) abre o painel para:
  - ler valores ao vivo;
  - ajustar no meio da run 13 parâmetros:
    - **Inimigos:** HP (inclusive dos vivos), dano, velocidade, spawn e teto.
    - **Personagem:** dano e recarga da Ultimate.
    - **Ganhos:** EXP e Ryu.
    - **Drops:** chance de Ryu, Chakra, pílula e item.
  - Os parâmetros ficam salvos em `sb_debug_tuning_v1` e **valem em todas as próximas runs**, com o painel aberto ou fechado, até "Restaurar padrões". Há também "Copiar/Colar JSON".
  - Ações: dar itens e pílulas, curar, ligar o god mode, encher Chakra, mudar nível, somar Ryu, gerar mega elite, limpar inimigos, avançar o tempo, congelar.
- **Login e senha admin removidos** do código e da configuração. O texto "Administrador" que ainda aparece no hub é só o nome da carteira local de teste.

## Ainda parcial ou pendente

- **Mapa**: arena única de 100×100 com relevo procedural simples. Não há colisão com cenário, biomas nem mapa procedural.
- **Limite de inimigos**: está fixado em **no máximo 180 vivos**. A meta de 1.500 não foi implementada nem medida.
- **Descoberta**: não considera oclusão por terreno ou árvores.
- **Selamento**: não tem tentativas nem chance de falha (a regra das 3 tentativas não está implementada). Também não existe selamento permanente para desbloquear personagens.
- **Aliados**: os valores dos buffs únicos são provisórios. Sinergias além da Areia (outras vilas e equipes canônicas) não existem.
- **Moeda**: a fórmula de Lamens por desempenho é provisória e não foi balanceada. Com o modo debug dá para inflar a recompensa (avançar tempo, mudar nível), e parâmetros salvos (por exemplo, mais EXP) também afetam os Lamens das próximas runs.
- **Conta**: login, cadastro, save da run, ranking, backend e multiplayer não existem. O progresso fica em `localStorage`.
- **Atributos e itens**: a Sorte só afeta a raridade das ofertas de item e de técnica. Remover pílula/item (Shisui/Ichiraku) não existe.
- **Visual**: atlas e sprites são provisórios, sem animação por quadro.
- **Balanceamento**: todos os números são provisórios.

## Verificação (05/11/2026)

- **TESTADO nesta data**: `tsc -b` e `vite build` concluídos sem erro. O Vite avisa que o bundle JS tem 879 kB, acima de 500 kB.
- **TESTADO nesta data**: `node scripts/verify-rules.mjs` passou (22 shinobis, 88 técnicas, 91 itens, distribuição de crítico e raridade).
- **TESTADO nesta data**: `node scripts/verify-runtime.mjs` (Playwright/Edge) passou nas 23 verificações sem erros de JS, inclusive a nova verificação da tecla Y, já com debug, resumo e pílulas integrados.
- **TESTADO nesta data (debug sem login)**: teste avulso no navegador confirmou:
  - o modal de conta não tem campos de login nem de senha;
  - o painel abre sem login no servidor de desenvolvimento;
  - mudar o HP para ×2 no meio da run dobrou o HP de um inimigo vivo;
  - a chance de item ×30 mostra 54% efetivo;
  - os valores ficam salvos e são recarregados na run seguinte;
  - "Restaurar padrões" volta tudo a 1.
  - `verify-runtime.mjs` (23 verificações) continua passando.
- **TESTADO nesta data**: teste avulso no navegador (fora de `scripts/`) confirmou:
  - F9 abre e fecha o painel;
  - as cartas sorteiam as pílulas novas (17 distintas em 40 rolagens);
  - o resumo aparece na vitória com DPS;
  - a 390 px de largura não há rolagem horizontal.
- O resumo pós-run só foi visto numa vitória forçada (tempo avançado), não numa derrota real. Os sliders do debug não foram exercitados um a um. O resultado está em `artifacts/runtime-checks.json`.
- Nenhuma dessas verificações valida FPS com muitos inimigos, balanceamento ou jogabilidade manual.

## Referências principais

- [Arquitetura e estado do código](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md)
- [Câmera, mapas e eventos](01-CAMERA-MAPAS-EVENTOS.md)
- [HUD e ficha](02-FICHA-HUD-RANKING.md)
- [Aliados e selamento](03-ALIADOS-E-SELAMENTO.md)
- [Itens, habilidades e economia](04-ITENS-HABILIDADES-ECONOMIA.md)
- [Personagens e roadmap](05-PERSONAGENS-E-ROADMAP.md)
- [Economia, RNG e eventos](09-PROGRESSAO-ECONOMIA-RNG-EVENTOS.md)
- [Hub, elenco e economia](11-HUB-ELENCO-PLANO-ECONOMIA.md)
- [Skill de documentação contínua](../skills/documentar-projeto/SKILL.md)
