# Contexto do chat do ShinobiBonk

Registro cronológico dos pedidos do usuário e das respostas do assistente. Complementa o [changelog](../CHANGELOG.md), que registra as mudanças do jogo, e a [fila de pendências](13-PENDENCIAS-PARA-CONTINUAR.md), que registra o trabalho restante.

Para cada nova solicitação, acrescente a mensagem do usuário e a resposta final. Registre também instruções complementares recebidas antes da resposta. Se houver dados sensíveis, resuma a parte necessária sem copiá-los.

## Ataques inimigos de volta a Kunai/Shuriken · altares dão bênção (buffs aleatórios por sorte/qualidade) · tiles da ficha em marrom · Netlify ok · .exe (proposta)

**Pedidos** (Rodada 51 · 12/11/2026)

> Houve uma alteração do Qwen seu novo parceiro de desenvolvimento que alterou os ataques dos monstros que eram Kunais/Shurikens para Pergaminhos, não é pra você fazer isso cara. [screenshot dos projéteis-pergaminho dos monstros]
>
> Cadê a ficha de personagem no P/ESC durante a partida? [screenshot da pausa com 2 colunas — build STALE do Netlify]
>
> Erro ao tentar iniciar o jogo. [screenshot: PARSE_ERROR em RunSheet.tsx:5308 — build STALE]
>
> Verifique se temos index para quando formos subir a pasta no netilify ele consiga criar o index.html do jogo para rodar em navegador.
>
> Depois me diga se você já consegue criar um executável seguro do nosso game, mesmo que ele abra pelo brownser dentro do aplicativo, sabe? O jogo de referência faz a mesma coisa, ele não abre um brownser em si, mas é como se fosse. (nome do jogo de referência omitido na citação — regra zero rastro, docs/18 §3)
>
> Esses lugares mais claros, você tem que colocar marrom igual a ficha do personagem [screenshot da ficha da run com as tiles creme assinaladas]
>
> Os altares não são para dar itens, mas buffs aleatórios de acordo com sua sorte/qualidade do altar.

**Resposta / o que foi feito** (Rodada 51 · 12/11/2026)

1. **Ataques inimigos = Kunai/Shuriken de novo** (pedido do usuário — corrige a visual trocada na Rodada 49): `src/scene/dropSprites.ts` ganhou os tipos **`enemyKunai`/`enemyShuriken`/`enemyShurikenFuma`** com arte de kunai de aço em pé (ponta para a direção do voo, sulco central, cabo com furo) — shuriken reaproveita a forma existente. `GameCanvas.tsx` (projétil) agora usa esses tipos. **Os PERGAMINHOS DO CHÃO PERMANECEM** (pedido do próprio usuário na Rodada 49 — só os ATAQUES voltaram a arma). Bônus: o sprite do drop passou a marcar `userData.shared=true` — a limpeza dos projéteis inimigos **não descarta mais o material compartilhado** do cache (evita re-link de programa GL a cada tiro).
2. **Ficha no P/ESC — já existe no código**: `src/ui/RunSheet.tsx` tem a coluna **“Ficha do personagem · Status da run”** (1ª das 3 colunas, Rodada 50). O print com 2 colunas + o PARSE_ERROR são da **build STALE do Netlify** (zip de 11/11, anterior à Rodada 48). → **re-upar o zip** (feito nesta rodada).
3. **PARSE_ERROR `RunSheet.tsx:5308`** — não existe no código atual (`tsc -b` ✓ · `vite build` ✓); é artefato do bundle antigo. O novo zip resolve.
4. **Netlify — verificado e corrigido**: `index.html` existe na raiz do projeto e do `dist/`; `netlify.toml` válido (build `pnpm install --frozen-lockfile && pnpm exec vite build` · publish `dist` · redirect SPA). O `Shinobibonk-netlify.zip` da raiz do workspace era **STALE** (JS de 11/11) — foi **rebuildado e reempacotado** com o build atual (`index.html` + `assets/` na raiz do zip, 371 arquivos). **O usuário precisa RE-UPAR no Netlify.**
5. **Executável seguro (pergunta → PROPOSTA, não implementado)**: sim, é viável — o jogo é 100% web (React + Three.js), então o caminho natural é um wrapper de navegador embutido: **Electron** (+ electron-builder → .exe Windows; mais maduro, abre pelo Chromium interno — o mesmo padrão do jogo de referência) ou **Tauri** (binário menor, WebView do sistema). Os controles atuais (pointer lock, teclas, WebGL, áudio) já funcionam nesse contexto; V-Sync/placa de vídeo/renderizador (rodadas 42–44) já estão preparados para o .exe. **Aguarda aprovação do usuário para implementar.**
6. **Tiles da ficha em marrom** (pedido do usuário: “colocar marrom igual a ficha do personagem”): `src/ninja-theme.css` — `.sheet-tile` saiu do creme (`--papel-claro`) para **marrom-tan** (`linear-gradient(180deg,#c8a76a,#a07f42)`, mesma família da coluna “Ficha do personagem” papel2→papel3, um pouco mais escura para destacar) + borda de madeira escura + **texto escuro** (`var(--tinta)` em h3/p/small; `h3 small` azul-escuro) para legibilidade sobre o fundo marrom. `.positive` (verde, `!important`) sobrevive.
7. **Altares → bênção (buffs aleatórios)** (pedido do usuário: “Os altares não são para dar itens, mas buffs aleatórios de acordo com sua sorte/qualidade do altar”): `GameCanvas.tsx` — novas constantes `ALTAR_BUFF_BASE` (Comum 5% → Lendário 25%) + `ALTAR_BUFF_POOL` (14 atributos: dano, crítico, dano crítico, velocidade de ataque, movimento, área, recarga da Ultimate, XP, Ryu, esquiva, armadura, regeneração, HP máximo, sorte). Ao completar o altar: **2 atributos sorteados (3 em Raro+)**, magnitude = base × escala × **(1 + sorte além de 10, +2%/ponto, teto +120%)**, aplicada direto em `runBuffs` + `refreshStats(true)` (mesmo padrão dos buffs de roleta/NPC — não entra no SavedRun) + SFX de pickup + toast “…bênção: +X% de dano · …”. **Sem tela de escolha.** Valores **PROPOSTOS** — o usuário testa a gameplay e ajusta (regra: nunca calibrar sem ele).

**Validado (5/5):** `tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (0 erros · 0 assets faltando · 1.600 inimigos instanciados).

**Pendente (usuário):** (a) testar a **bênção dos altares** em run real (valores PROPOSTOS); (b) conferir o marrom das tiles na pausa; (c) **RE-UPAR o novo zip** `Shinobibonk-netlify.zip` no Netlify; (d) aprovar a proposta de **executável** (Electron vs Tauri) para implementarmos.

## Morros de arroz com E (sem auto-coleta) · escada de monstros vivos ~−40% no early game (progressiva + %inimigos) · 1º mega elite ~9,5 mil HP ±5% · ficha de status de volta na pausa

**Pedidos** (Rodada 50 · 12/11/2026)

> Os bolinhos de arroz dentro da run, estão funcionando da mesma forma que eram os lamens? estão curando a vida em % do personagem? E eu falei que eu não queria os pergaminhos pegando automático, mas os bolinhos de arroz você colocou para passar em cima e pegar automático, retire isso.
>
> Ainda temos muito monstros com 1m de partida apenas, 114 é um número bem expressivo, o primeiro mega-elite nascer com 20K de vida também é um número elevado, deveria ser cerca de 9 a 10 meio aleatório... Diminua um pouco a escada de progressão de quantidade de monstros vivos no início da partida, mas faça ser progressivo tempo+%inimigos por itens/debuffs [screenshot do HUD aos 1 min: 114 monstros]
>
> [screenshot da pausa — Técnicas/Inventário/Plano de build/Crescimento por nível] cade a ficha com os status do personagem?
>
> Caiu minha energia, consegue continuar de onde parou? Me mostre a lista

**Resposta / o que foi feito** (Rodada 50 · 12/11/2026)

1. **Morros de arroz (Ryu) — sem auto-coleta, coletados com E** (pedido do usuário; **substitui** a auto-coleta da Rodada 49 — a mais recente prevalece): o morro **não é mais coletado ao pisar** (o filtro de auto-coleta agora exclui `ryu`; o único pickup que segue auto-coletado é o **drop do mega elite derrotado** — `sealDrop`); o **E coleta** o morro (→ `collectPickup`: Ryu + ímã global 10 s + lamen de cura); o hint de interação mostra **“E · colher morro de arroz · Ryu por zona/missão/sorte + ímã 10 s + lamen de cura”**. **Resposta à pergunta do usuário:** o morro **NÃO cura a vida diretamente** — ele dá **Ryu** (`(14+zona×6)×MISSION_TIER[missão]×(1+min(1,sorte×0,01))`), **ímã de 10 s** (puxa xp/lamen/chakra de todo o mapa) e **dropa uma LAMEN que cura 35% do HP** (`RAMEN_DROP.heal`) — a cura é da lamen (igual aos lamens, em % do HP), não do morro.
2. **Escada de monstros vivos (early game) — reduzida ~40%, progressiva + %inimigos de itens/debuffs** (**PROPOSTO** — o usuário testa e ajusta): `ENEMY_SCALING` em `src/game/progression.ts` — **capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8**. Nova escada (Genin): **1 min = 91 vivos (era 156) · 5 min = 391 (era 670) · 8 min = 695 (era 1.189) · 10 min = 936 (era 1.600) · teto 1.600 atingido aos ~15 min (era ~10 min)**. O **%inimigos de itens/pílulas/debuffs** (`enemyCount`: Incenso Repelente −8% · Flauta Provocadora +12% · Pílula de Incenso +10% · Isca Shinobi +15%) **JÁ multiplica o cap** via densidade em `GameCanvas.tsx` (`threatNow`) — a progressão por buffs **se mantém**; só a escada-base ficou mais suave. Asserções ajustadas em `verify-rules.mjs` (695@8 min · 936@10 min · 1.600@15 min).
3. **1º mega elite — 20 mil → 9,5 mil HP com variação aleatória ±5% por nascimento** (**PROPOSTO** — “cerca de 9 a 10 meio aleatório”): `megaEliteHp` em `src/game/enemyTiers.ts` — base **9.500** × (0,95–1,05 aleatório por spawn) + rampa `2^((seconds−55)/80)` × ameaça da missão (rampa e multiplicador se mantêm). Asserção determinística em `verify-rules.mjs` (`megaEliteHp(55,1,()=>.5)=9500`).
4. **Ficha de status do personagem — de volta, agora como 1ª coluna da pausa**: nova coluna **“Ficha do personagem · Status da run”** em `src/ui/RunSheet.tsx` (faixa roxa `.stripe.purple`) — todos os status da run em **TOTAIS** (base do shinobi + nível + itens + pílulas + passivas + sinergias + bônus por nível) agrupados **ATAQUE/DEFESA/UTILIDADE** + nota (crítico 250% · mega crítico 300%) + tile **“Ameaça da missão ×{difficultyScale}”**. **Conflito Rodada 48 × 50 resolvido:** o usuário quer os **STATUS do personagem** (sim — restaurados como totais); a **tabela de % de itens** (removida na Rodada 48) **continua fora**. `src/run-ui.css` — nova classe `.stat-line.total` (2 colunas: rótulo + valor).
5. **Regressão na suíte (corrigida na validação):** `verify-runtime.mjs` assumia que a **1ª** `.sheet-column` era “Técnicas” (a que tem o `<details>` do pool) — com a nova coluna “Ficha” à frente, o teste dava timeout. O seletor agora mira **`.run-sheet details`** (independente da ordem das colunas) + comentário de Rodada 50.

**Validado (5/5):** `tsc -b` (exit 0) · `vite build` (exit 0) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 94 + asserções da Rodada 50) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (passou completa após a correção do seletor: 183 drawCalls · 1.600 bodies · 138 outlines · 65 markers).

**Pendente (usuário):** (a) testar em run real a escada de vivos (91@1 min · 695@8 min · 936@10 min) e o 1º mega elite (9,5 mil HP ±5%) — **são PROPOSTOS, o usuário ajusta em iteração** (regra: nunca calibrar sem ele); (b) confirmar a leitura da ficha na pausa; (c) **re-upar o zip do Netlify** (o atual é de 11/11 — STALE, anterior à Rodada 48).

## Altar sem “E”, PERGAMINHOS com E, Final Swarm 800@+4min → 1.600 e morros de bolinhos de arroz

**Pedidos** (Rodada 49 · 12/11/2026)

> Toda vez que aperto E ta reiniciando o Altar, por isso falei que não é pra ter essa opção de E em altares...
>
> As KUNAIS que eu já falei que deveriam ter virado pergaminhos no chão, devem aparecer o E para pegarmos, não ser pegado automaticamente. [screenshots do altar e dos kunais no chão]
>
> Final swarm não respeitando os 1600 monstros totais. E outra a progressão deve limitar no máximo 800 monstros até chegar no +4minutos em final swarm, para ai sim ir aumentando até chegar a 1600 monstros TOTAIS e o máximo de cap de monstros invocando na tela! [screenshot do HUD com 5.468 monstros — build STALE do Netlify: o zip enviado é de 11/11, anterior à Rodada 48]
>
> Moedas no mapa devem virar morros de bolinhos de arroz, efeito magnetismo(puxa todos os drop's (exp/lamen/chakra) espalhados pelo mapa todo por 10S, dropa lamen que cura vida, monte de ryu escalando por zona/dificuldade/sorte. [screenshot das moedas no mapa]

**Resposta / o que foi feito** (Rodada 49 · 12/11/2026)

1. **Altar:** o E **não reinicia mais o altar** — toast “...fique dentro do círculo para ativar o altar (sem E)” + guard idempotente no `startAltar` + o prompt do altar **não exibe a tecla “E”** (o altar continua ativando AO PISAR, Rodada 47).
2. **PERGAMINHOS:** as kunai/shuriken do chão viraram **pergaminhos** (arte nova + ícone `scroll.svg` + renomes no mapa M); **não são mais auto-coletados ao pisar** — o **E abre** o pergaminho (custo em Ryu + pool de recompensa); a recompensa grátis do guardião é o “Pergaminho de recompensa grátis” (pergaminho + ✦ verde); a Shuriken Amaldiçoada mantém a arte de shuriken.
   - **Regressão corrigida:** o aviso do portal passou a contar pergaminhos em **todo o mapa** e travava a progressão de zona (a scatter espalha ~18 por zona); agora conta só os pergaminhos a **6 m do portal** — o E avisa antes de entrar e o segundo E ainda entra; pergaminhos distantes somem na troca de zona (como antes da 49).
3. **FINAL SWARM:** o cap em tela agora cresce **progressivamente** — **800 monstros aos +4 min** → **1.600 aos +7 min** (rampa linear) + clamp por quadro (nunca remove bosses/megas) + a emboscada respeita o cap.
4. **MORROS DE BOLINHOS DE ARROZ (ex-moedas):** cada morro dá **Ryu escalando por zona × dificuldade × sorte** (`(14+zona·6) × tier × (1+min(1,sorte·1%))`), **ímã de 10 s** que puxa todos os drops de xp/lamen/chakra do mapa e **dropa uma lamen que cura**.

**Validado:** tsc · vite build · verify-rules (56/97/94) · verify-motion-atlases (56/560/0) · verify-runtime (2 execuções verdes — incluindo a checagem nova “Pergaminho perto do portal avisa antes de entrar · coleta exige E”).

**Pendente (usuário):** testar em run real a fórmula de Ryu do morro e a rampa 800 → 1.600; **re-upar o zip do Netlify** (o atual é de 11/11, anterior à Rodada 48 — por isso o print do 5.468).

## Planner "Deixar em casa", mapa M/ESC/Tab, HUD de métricas, Final Swarm 1.600, ficha escura e Treinamento +0,6%

**Pedidos**

> Ao apertarmos M para abrir o mapa e ESC para fechar, ele sai do mapa abrindo a ficha do personagem, isso esta errado, ajustar agora mesmo. Se eu sair com o ESC ou apertar M novamente deve voltar ao jogo.
>
> Tem alguma coisa que faz ao segurar o TAB que é o mini mapa, apertar no ESC, ai estamos com o mesmo problema que já falei acima, também para a tecla tab, mas relacionado ao mapa.
>
> aparecer meu dano causado total e os valores, dano causado/s que seria o dano por segundo, remover dano por aliados. Também fazer exemplo 1.1M, seria 1milhão e 100mil de dano... essas nomenclaturas por exemplo e seguir escalando conforme for.
>
> Deixar só com as opções que eu te falei para ter tirar a tabela de porcentagem e subir a parte onde registra os ganhos.
>
> Não é pro jogo ter névoa o tempo todo é pra acontecer de tempos em tempos e quando acontecer névoa do mapa / visão ficar coberta dando pra ver só nosso personagem no centro da tela é para aparecer o Zabuza Momochi como Mega Elite no mapa.
>
> quando eu tiver dinheiro suficiente aparecer o valor + ryu em verde, quando tiver faltando, aparecer vermelho. Revisar que o botão E para interagir as vezes da uma engasgada, o mesmo acontece com selecionando as opções pressionando 1, 2, 3 e 4.
>
> Aparecer acima da cabeça do personagem um hudzinho de "Treinamento - <atributo aleatório que upou> +0,6%"
>
> me explique essa parte da sorte... a parte dos atributos treinados devem ficar: [screenshot do HUD] nessa região marcada em vermelho, organize o hud para isso e lembre-se ele treina TODOS os atributos aleatoriamente, somente na utilidade que ele treina apenas sorte.
>
> Movimentação ainda apresenta travamentos...
>
> Não sei se é por conta da dificuldade do jogo, mas parou de dropar novamente experiência ao derrotar os monstros, isso não pode acontecer, ao derrotar sempre tem que dropar experiência.
>
> O final swarm sempre vai ter o máximo de 1600 monstros, porém não vai bater final swarm e já chegar esse número, até os +7 mins o aumento vai ser progressivo conforme está acontecendo no jogo considerando calculos de %inimigos e estágios da zona. Após os +7mins, alcançamos a marca total dos 1600 monstros em tela. Lembrando... eles precisam ir evoluindo ao passar do tempo, ganhando vida, defesa/armadura, dano, para forçar o jogador a terminar a run.
>
> Olha como ficou esse HUD, antes estava visual... agora está ruim essa palheta mais clara que você colocou... deixe mais visual. Esse fundo bege não ficou legal para lermos as informações.
>
> Taxa de experiência muito alta também por mob já no normal... diminuir.
>
> Você esta atualizando o arquivo para o codex/claude revisar depois?
>
> esse hud ainda falta fundo raro ser azul, incomum verde, comum cinza(como esta), épico roxo, lendário amarelo/alaranjado.
>
> Porque o claude aparece na página do meu github como contribuinte?

**Resposta**

- **"Deixar em casa"**: o botão "Não aprender" do planner virou "Deixar em casa" (estado, resumo, texto inicial, filtro e alternância em `BuildPlanner.tsx`) — espelhando o conceito de build da referência com a particularidade por shinobi.
- **M/ESC/Tab**: fechar o mapa agora volta ao jogo **sem abrir a ficha** (`mapPanel` + `suppressUnlockPause` de 800 ms em `GameCanvas.tsx`) — M, ESC e TAB cobertos.
- **HUD de métricas (RunSheet)**: o banner mostra TEMPO · ABATES · **Dano causado** (total, formato 1,1M) · **Dano por segundo** · RYU; **removido** "Dano por aliados" e a tabela de porcentagens ("Ficha técnica"), com os ganhos no topo.
- **Zabuza + névoa intermitente**: **PENDENTE** — Zabuza não existe no roster; anotação completa em `docs/23` para Claude/Codex (personagem + evento de névoa).
- **Preço verde/vermelho**: OPCIONAL, **não feito** nesta rodada (falta expor `world.interaction` no snapshot).
- **Isca Shinobi**: **CONFIRMADA como Pílula** (Rodada 47) — o item `shinobi-bait` foi removido do catálogo e a pílula existe em `pills.ts`.
- **Treinamento esgotado**: agora sobe um **atributo aleatório +0,6% por nível** (`rollPowerlevel`, era Sorte fixa +0,8%) e exibe "Treinamento — <atributo> +0,6%" acima do personagem. A cláusula "somente na utilidade que ele treina apenas sorte" ficou **em aberto** — aguardando confirmação do usuário.
- **Final Swarm**: teto **1.600** (era 8.000) com **rampa progressiva até +7 min** (não salta para o teto) — pedido explícito; monstros evoluem com o tempo (HP/defesa/armadura/dano via `ENEMY_SCALING`).
- **XP por mob**: 8 → 5; XP por abate **sempre** dropado (regra existente — o que estava "alto" era a taxa, reduzida).
- **Ficha mais escura**: fundo das colunas `papel2→papel3` (mais contraste) em `ninja-theme.css`.
- **Engasgada E/1-4**: `CHOICE_GUARD.armSeconds` 0,5 → 0,2 s.
- **Raridade**: **JÁ ESTAVA assim** (comum cinza · incomum verde · raro azul · épico roxo · lendário amarelo) — `rarity.css`.
- **HP com número no centro**: **JÁ EXISTE** (RunSheet + HUD de combate).
- **Claude no GitHub**: o commit da Rodada 38 (trailer) tem trailer `Co-Authored-By: Claude Opus 5.5` — por isso o GitHub o lista como contribuinte; os 30/30 commits têm author `jcffadev`.
- **docs/23**: SIM — é atualizado a cada rodada com o inventário + anotações para Claude/Codex (Zabuza, corpo selado, armadilha "corpo ninja", travamentos atacar+andar/minionblock, folha frente/costas).
- Validado: tsc · vite build · verify-rules 56/97/94 · verify-motion-atlases 56/560/0 · verify-runtime (0 erros · 0 404 · stress com 1.600 inimigos). Teste do usuário pendente.

## Animações do elenco, prêmios, sinergia e horda

**Pedido**

> Eu mandei o claude finalizar o que você deixou pendente, mas revise o que ele fez para saber se chegamos ao resultado esperado.
> A roleta ainda esta estranha ao entregar os itens...
> Encontrei bug em algum evento que ficam entregando pílula sem escolha do jogador, isso não pode acontecer.
> Também encontrei bug referente a ter 5 personagens da folha e só contar 4 nas sinergias, provavelmente porque eu estava jogando com o Naruto e um dos ajudantes ser também Naruto.
>
> Como prioridade eu quero que você faça as animações de todos os personagens jogáveis e suas evoluções e corrija os bugs se tiver tempo, aumente o limite máximo de monstros pra 1600, acabei de testar o jogo e está em 300.
>
> Depois disso pode seguir a fila de pendência e me avise o que esta fazendo, lembre-se de sempre dar o commit no git e salvar as alterações, sempre ao finalizar.

> Ah, esqueci, você vai ter que criar o sprite relacionado ao Asuma, animações e etc.

**Resposta**

O Asuma tem retrato e atlas original com 16 quadros. Os 24 jogáveis e suas formas usam poses de caminhada, pulo, dash, ataque, dano e Ultimate. Asuma e Naruto Academia usam folhas dedicadas em seus estados ilustrados. As demais formas usam animação do sprite existente. Folhas direcionais individuais continuam na fila.

O trabalho anterior já implementava escala até 1.600 e renderização em lote, mas o HUD contava a amostra de até 300 marcadores do mapa. O contador agora lê o total da simulação. O Naruto recrutado conta nas sinergias mesmo quando o jogador também escolheu Naruto. A roleta enfileira os prêmios de item e pílula. Pílulas do chão também exigem escolha. E aceita e V vende.

O teste de navegador confirmou as poses de movimento do Asuma, a sequência de prêmios e o HUD com 1.600 inimigos. O teste de regras cobre cinco ajudantes da Folha com Naruto em duas funções. A medição de desempenho em partida real continua pendente.

## Mapa e inclinação da câmera

**Pedidos**

> Ah, pergunta:
> Você consegue transformar o mapa em 3D?

> Aquele ajuste da camera, para as partes cinzas, me fez perder o controle de deitar a camera, sabe porque? As vezes por isso estou estranhando a questão do 3d.

**Resposta**

O chão já é uma malha 3D. A aparência de parte do cenário vem de objetos representados por sprites planos. É possível converter esses objetos em modelos 3D por etapa. O ajuste anterior limitava a inclinação mínima a cerca de 32°. O arrasto vertical agora vai até cerca de 7°, com a posição da câmera protegida acima do terreno.

## Registro contínuo do chat

**Pedido**

> Crie um arquivo markdown sempre que você tiver uma nova requisição no contexto, você tem que escrever dentro deste arquivo, tanto a minha pergunta, quanto a sua resposta, sempre mantenha o contexto atualizado do chat.
>
> Isso funcionará de mãos dadas com aquele nosso markdown de documentação que a gente vê as atualizações.

**Resposta**

Este arquivo é o registro contínuo. O procedimento foi incluído no AGENTS.md e na skill de documentação, para que cada nova solicitação e sua resposta sejam registradas junto com as alterações do projeto.

## Andamento da animação

**Pedido**

> Como está o processo de animação de todos os personagens e estágios?

**Resposta**

Os 24 jogáveis têm animação base, que acompanha a troca de forma. Asuma tem 16 quadros próprios. Naruto Academia mantém suas folhas dedicadas de caminhada e arremesso. As outras formas usam poses animadas sobre os sprites existentes. Restam as folhas direcionais próprias e a conferência visual de cada forma.

## Folhas direcionais e identidade de cada forma

**Pedidos**

> crie as folhas direcionais dos outros personagens, usa como base o que você fez para o Naruto

> a sakura esta estranha, o estático eu ja falei pra você colocar ela com a skin início, igual na academia, igual fez com o Naruto... por conta que você não fez isso e agora fez a animação seguindo o que eu falei, esta juntando as 2 imagens e bugando a animação.

> Use as imagens que você tem estática, como referência para criar os movimentos animados, não faz sentido, você gerar algo novo para o que você já tem e ficar em discordância, por exemplo, se eu estou parado, fica uma coisa e se andando o personagem muda, entendeu o que eu quis dizer?

**Resposta**

As folhas do primeiro lote cobrem as formas do Naruto, Sasuke e Sakura. As folhas de Sasuke e Sakura foram refeitas usando como referência primária o sprite estático de cada forma. A Sakura inicial conserva cabelo longo, túnica vermelha, shorts verdes e sandálias azuis durante a caminhada. A folha do Naruto Academia é o modelo da organização dos quadros. Os próximos lotes seguem a mesma regra documentada na skill de arte.

## Itens e número de cartas

**Pedidos**

> Ele nunca deve encontra pílulas ou habilidades, apenas itens.
> Ele ainda as vezes, ao banir está aparecendo uma quinta opção de escolha.

> Só itens em recompensas do mapa, incluindo roleta e drops. Pílulas e habilidades só no level-up.

**Resposta**

Pílulas e habilidades ficam nas ofertas de subida de nível. A roleta e os drops do mapa seguem a nova regra. A quinta carta vinha da chance da Sorte somada à quarta opção. O teto de quatro vale também após banir ou atualizar.

## Mouse e relevo

**Pedidos**

> simplesmente ao movimentar o mouse a camera ja acompanha, coloque montanhas, parte elevadas no mapa, ainda estamos com aquele problema da parte cinzsa, mas vamos ver se corrigimos com montanhas o cenário

> Girar ao mover o mouse, sem segurar botão

**Resposta**

Mover o mouse gira e inclina a câmera durante a partida. Clique direito fixa o alvo. O mapa ganhou elevações internas, montanhas externas e um céu em gradiente para distinguir o horizonte da área cinza.

## Andamento e publicação

**Pedido**

> O que estamos fazendo?
> Mostre o que esta na fila, o que falta fazer, o que ja completou, você esta atualizando o github?

**Resposta**

O primeiro lote foi publicado no commit `729749a`: Asuma, animações base, sinergia, contador da horda e registro do chat. O lote seguinte cobre Time 7, regras das recompensas e câmera. A [fila](13-PENDENCIAS-PARA-CONTINUAR.md) guarda as folhas dos demais shinobis e formas, os testes de desempenho com a horda cheia, HUD, bijūs, efeitos e áudio.

## Caminhada direcional de todo o elenco

**Pedido**

> Faça de todos

**Resposta**

Integrei as 45 formas dos 20 shinobis restantes. Os 24 jogáveis agora têm folhas de caminhada nas 56 formas, com quatro quadros de frente e quatro de costas por forma e espelhamento para a esquerda. Cada folha segue o sprite estático correspondente. A compilação, a verificação de cobertura das 56 formas e os 30 testes de navegador passaram. A [fila](13-PENDENCIAS-PARA-CONTINUAR.md) registra as animações de ação que ainda precisam de folhas próprias.

## Banimento, interface e revisão das ações do elenco

**Pedidos**

> Encontrei bugs, quando  gente banir, é pra banir e não aparecer mais a habilidade/pilula, mas parece que ainda aparece em outro nível da habilidade/pilula no pool.
> A ideia é se eu bani, incomum, raro, comum... banir ela do pool.
>
> Outro problema, as pilulas estão acrescentando também a quantidade do nível de raridade dela, exemplo se eu pego uma pilula incomum, ela já conta 2 estágios de level da pilula, isso está errado.
>
> Outro problema, cadê as pilulas de incenso para colocar mais monstros, mais dificuldade, mais dinheiro?
> cadê a pilula de experiência?
> O mouse deve sumir não precisa ficar a cruszinha na tela.
> E a camera está quase perfeita
> Mudar o ícone do Portal do Boss no mapa, coloque um simbolo que remeta as bijuus.

> O spreet do Naruto na segunda forma, esta bugado quando ele ataca, revise, não está conforma da academia e com o manto da nove caudas...

> Faltando botão ir para o menu nesta tela.

> Sasuke com o mesmo problema na animação de atacar na versao base.
> Revise se você fez animação de ataque igual o naruto academia/manto da kurama para todos os personagens.

> O salto e o dash do sasuke também esta estranho/sem animação, deixar igual naruto academia

> Ao clicar em desistir, aparece no navegador opção desistir da run, deverá ficar dentro do jogo, confirmar o desistir ali mesmo clicando novamente, aparecendo: Realmente deseja desistir? Clique novamente
> Ai já desiste da run ao clicar.

> RockLee e Might Guy, terão movimentação de ataques unicas, usando chutes socos. Consegue fazer?

> Ja pedi pra você arrumar este hud, pra ficar compacto assim, ele ta sobrando o fadezinho atrás.
> O que esta na sua fila?

> Na realidade, você vai ter que revisar os ataques e movimentações de todos os personagens, incluindo da segunda forma do naruto, todos eles estão errados...

> Duas coisas, estou sofrendo body block perto de algumas estruturas.
> e além disso, essa estrutura com falta de terreno embaixo, fica feio demais, temos que corrigir isto.
>
> Outra coisa, ao andar com o WD ou WA pressionados, não podemos sofrer diferença de movimentação, tem que ser igual pressionando apenas um botão W, S, A, D.

> Coloque na sua lista e não esqueça de atualizar a documentação e o contexto...
> Revisar e atualizar o ataque de todos os personagens e em suas evoluções, também adicionar pulo e dash/esquiva a eles, estão faltando as animações para todos e já fique como nota, para sempre que fizermos a introdução de um novo personagem no jogo, você já criar tudo isso sem eu precisar pedir. (tirando Naruto Academia e Naruto Manto Kurama)

**Resposta**

A caminhada completa foi publicada no commit `9ff5dfb`. Nesta rodada, integrei quadros de conjuração do Naruto Clássico, ataque/pulo/dash do Sasuke inicial e socos e chutes próprios para Rock Lee e Might Guy em suas três formas. A fila registra a revisão das demais ações e evoluções, com Naruto Academia e Manto da Kurama fora da revisão. As skills e `AGENTS.md` exigem essas ações na entrega de novos jogáveis e formas.

Pílulas sobem um nível por escolha. A raridade aumenta a potência de 1× a 2×. Banir exclui o nome de novas ofertas na run. A Pílula do Pergaminho concede experiência e a Pílula de Incenso aumenta densidade, dificuldade e Ryu. O portal final recebeu o símbolo das bijū, a cena esconde a mira, o dock de pílulas perdeu a faixa de fundo, e o resumo ganhou Ir para o menu. Desistir pede um segundo clique na pausa. O terreno ganhou apoio mais largo sob as estátuas, com transparência em cenários próximos que ocultariam o jogador, e a transição para diagonais mantém a velocidade.

Passaram a compilação, as regras e 34 verificações no navegador, incluindo os novos quadros de Naruto e Sasuke, nível de pílula, banimento e saída da missão. Ainda falta reproduzir em jogo o bloqueio relatado perto da estrutura.

**Pedido**

> o que temos na fila?

**Resposta**

Primeiro vem a revisão de caminhada, ataque, pulo e dash/esquiva por forma, com Naruto Academia e Manto da Kurama fora da revisão. A fila anterior mantém o atlas de habilidades no HUD, impactos e áudio, escala de atributos, desempenho com 1.600 inimigos, acabamento do terreno e revisão de Chōmei e Gyūki.

## Efeitos da obra, bijū, Bolsa e desempenho

**Pedidos**

> Faça efeitos para as habilidades que se pareçam com as habilidades na obra... pegue referencia de outros jogos de naruto, Chomei e 8 caudas precisa de revisão.
> O desempenho de 1600 personagens acho que o Claude fez.
> Coloque filtro na bolsa de itens ao selecionar, botões referente as raridades.
> Depois faça a validação e a publicação Depois fica a revisão, forma por forma, de caminhada, ataque, pulo e dash/esquiva

> Choumei
> Use como referência para criar a nossa, seja fiel.

> Hachibi 8 caudas, use como referência para criar a nossa, seja fiel.

**Resposta**

Os efeitos usam a leitura visual de Ultimate Ninja STORM para técnicas como Rasengan e Chidori, com geometria original do projeto. Há efeitos por natureza, golpes característicos e impacto no alvo. Chōmei e Gyūki foram refeitos a partir das duas imagens anexadas e entram na arena com as novas texturas. A Bolsa da Missão ganhou botões de raridade combináveis com busca e estado.

O código do Claude já usa instanciamento para corpos, contornos e avisos dos inimigos. O teste automatizado agora registra uma amostra com 1.600 em movimento. A revisão de caminhada, ataque, pulo e dash por forma continua na fila conforme a ordem solicitada.

A compilação, as regras e 37 verificações no navegador passaram. A amostra final registrou 6,77 FPS no Edge headless com SwiftShader durante 2,51 s e 1.600 inimigos em movimento. A medição com aceleração por GPU está pendente.

## Rodada — jogabilidade, arte e planejamento

**Pedidos anteriores nesta rodada**
O usuário pediu HUD de escolhas e de habilidades mais legível, mapa rápido por Tab sem interromper o movimento, marcador direcional de kunai, ícone da bijū no portal, HP numérico de mega elites e chefes e escala de dano e de hordas próxima à referência. Também pediu trava do ponteiro, F9 com cursor e ações de corrida, ataque, pulo e dash para inimigos e ajudantes. O exemplo de escala foi um guardião perto de 990 M–1 B de HP após 18 min no Final Swarm e a meta de 5 M de abates.

**Pedidos e complementos**

> Ao clicar na barraca do Ichiraku, aparecer um personagem dele
>
> Colocar o Ichiraku na frente da barraca dele também, não esqueça.
>
> Não recarregar o mapa quando selecionar o personagem, ele tem que selecionar o mapa na tela de seleção e apenas isso.
>
> Colocar botão ver build/ficha do personal ao aparecer algum pool de seleção de itens, habilidades, pilulas, selamentos, eu vou direto pro P.
>
> Fazer o andar do personagem ficar mais fluido pressionando WASD...
> Revisar física ao passar perto das estruturas e não ficar bloqueando/travando o personagem
>
> o naruto totem tem que ficar com posição de mãos e os clones dele tem que correr em direção ao alvo, não serem lançados estáticos.
>
> abaixar a % do drop de lamen para até 5%
> no caso o item que dropa dos monstros, não o de recompensa final...
>
> Deixar mais smooth mexer a camera/rodar e o scroll
>
> Mouse ainda escapando da tela ao movimentar o mouse, tem que bloquear o mouse na janela do brownser/jogo
> Só aparecer mouse quando der alttab/esc no jogo colocar um mouse personalizado, uma "kunaizinha"
>
> Preciso de rebalanceamento do HP dos monstros, diminuir um pouco a quantidade de genin, os mega elites/criaturas para capturar tem que aparecer com mais aleatoriedade, ser um RNG, mas tem que pelo menos aparecer de 4 a 6 ajudantes por zona para selar e uns 2 para selar para conta
>
> Exemplo de rebalanceamento os megas tem que ter cerca de 20mil de hp o primeiro e ir escalando com o jogo, nos minutos finais já temos que estar na casa de milhão de HP...
> Mas, o scale do personagem tem que acompanhar os números
>
> Dash do naruto/pulo esta "bugado" estático, revise
>
> A sorte inicial esta influenciando demais...Este é um exemplo de um personagem no segundo 01 do jogo de referência
>
> Estude o scale e veja o que consegue aprender que podemos utilizar também referente ao jogo, no nosso projeto
>
> Revise animaçoes de ataques de Neji, ja vou mandar você revisar todos novamente... provavelmente você esqueceu de alguns, revise pulos/dashs também...
> Não esqueça de também implementar caso eles forem selados e virem ajudantes..
>
> Retire esse "clique para retomar controle da missão", após selecionar um upgrade/item/pilula/ajudante... não era para ter isto.
> Melhore o hud de aparição de escolhas, deixe mais clean, bonitinho.
>
> Melhore a IA dos inimigos para chegar em mim com mais facilidade, coloque monstros normais jogando Shurikens, Kunais, Shurikens Huuma.
> Esses ataques serão rangeds crie aleatoriedade
> aleatoriedade de spawn de ranged e meeles
>
> Pergunta: quanto tempo de vídeo você consegue processar, ler e aprender para fazermos o scale?
>
> Passiva da Tenten, dá mais dano com habilidades normais/projéteis 1,5[x]%
>
> Retire esse negócio de clique para retomar, por pena...
> Esta tirando a fluidez do jogo...
>
> para fazer a animação das habilidades, foque em que elemento ela é... se for fogo, busque fazer algo com chamas, bolas de fogo e siga o nome da habilidade também como base... siga com essa ideia para todos os elementos...

**Resposta**
Os controles de combate usam trava do ponteiro, movimento normalizado e câmera com rotação, inclinação e zoom interpolados. Teuchi está diante do Ichiraku e aparece no atendimento. O botão da ficha mantém as mesmas cartas quando se volta. Tab permite andar com mapa rápido, e F9 mostra a kunai do cursor. A escolha final devolve o controle sem tela de retomada. O mapa de preparação preserva sua cena ao trocar de personagem. Lamen de cura tem teto de 5%, com a recompensa final separada.

O clipe de dois minutos permitiu estudar a abertura por marcos. O personagem da referência chega ao nível 4 perto de um minuto e ao nível 6 com 63 abates em 1:26, com o golpe inicial perto de 38. Vídeos mais longos podem ser estudados por quadros em marcos de nível, abates, dano e luta de guardião. A escala implementada está em `docs/04-ITENS-HABILIDADES-ECONOMIA.md`. A meta de 5 milhões ainda exige medir reposição e desempenho sustentado.

Foram integradas folhas de ação de Naruto Academia e das duas formas de Neji. Aliados correm, saltam, esquivam e alternam ataques liberados. O Totem mantém o selo e os clones correm. Inimigos comuns alternam ataque, corrida, salto e esquiva, com sorteio corpo a corpo/à distância e três armas. A passiva de Tenten aplica ×1,5 uma vez a técnicas neutras ou de projétil. Quadros próprios de ataque, pulo e dash para todas as formas restantes seguem em revisão.

**Pedidos sobre preparação e técnicas**

> Ah, esqueci o negócio de não aprender habilidade tem que unico por personagem que você escolhe... o ideal é que tenha uma página assim:
>
> Se possível fundir habilidades, criar um npc no jogo que serão os 2 sapos do monte, coloque-os interativos no jogo, lá terá uma mecânica de fundir/combinar habilidades 2 em 1.
> Fundir: pega os status dos buffs das 2 habilidades e cria uma nova habilidade totalmente nova, juntando 2 elementos, ela será nv1 e vai poder upa de novo, ganhando mais dano ainda e ainda a habilidade por si só já ganha 2x[%] dano
> Combinar: Combinar 2 habilidades que você tem, junta 2 habilidades em 1 espaço de habilidade só, aparece as duas juntas, elas ganham + 1,5[x]% de dano ou seja.
> Faça a arte dos sapos sábios em cima do Gamakichi o sapo maior, aparecer também ao clicar no Npc a imagem deles...
> Todos os npcs que tem interação de abrir algum pop-up para decidir, colocar eles para aparecem ao lado do pool do escolhas.
>
> Na habilidade de Naruto, Invocação de Gamabunta: [Estilo Fogo: Bomba de Chamas do Óleo de Sapo | Wiki Naruto | Fandom](https://naruto.fandom.com/pt-br/wiki/Estilo_Fogo:_Bomba_de_Chamas_do_%C3%93leo_de_Sapo)
> Fazer ele ao aprender essa habilidade, aparecer o Gamabunta
>
> Cuspir fogo, me mostre como você esta criando essa animação, precisa ser fluída.
> Tem a questão de cuspir fogo e tudo mais...
>
> o clone das sombras que o naruto lança, enquanto jogador, não está correndo em direção ao inimigo, deve correr dar um hit e explodir, seguindo o que a habilidade deveria fazer como dano... seja dano em área, dano em v, sei la como você estruturou essa habilidade...
>
> Não deve ser possível deixar pílulas em casa, remova isso do planejamento inicial.
>
> No planejamento de itens, não precisa colocar deixar em casa... já temos a parte de plano pra isso, o "planejar" dos itens deve ser "Colocar na bolsa ninja"
>
> Essa animação do ataque do gamabunta está legal, mas não deveria sair fogo da boca dele?
> De preferência óleo no começo da animação e depois pegar fogo perto do inimigo?
> Manter a ESPADA e o cachimbo na boca dele para ficar fiel a animação.
> Gamabunta tem uma espada, não um pau/cajado... e usa um cachimbo.
>
> Lembre-se de usar os sites que falei como referência para pegar as referências.
>
> Já arrumou a animação dos personagens e colocou os monstros ranged?
> Aumente também a frequência que os mega elites/bosses usam habilidades e aumente as áreas de impacto delas...
>
> No botão Reset, escreva Reset de conta e ao clicar explique que a conta toda será resetada do 0, igual ao início do jogo.
>
> Revise o resto do elenco já, faça os ajudantes correrem e jogarem as habilidades... depois vá fazendo o restante, me mostre a fila agora.
>
> Eu te mandei um print do planejamento de missão do jogo de referência... a nossa não esta igual ainda... precisa ser clean daquela forma a nossa também, ser possível favoritar habilidades, até porque favoritar e melhorar habilidades ja é um upgrade que temos, só ser possível não levar 60% das habilidades que o ninja pode aprender em missão, isso ser escalonável conforme vamos liberando novos shinobis e o jogo ir liberando novas habilidades que os shinobis podem aprender...
> Se no inicio com o Time7 liberado ele pode aprender 10, no jogo ele levaria 4, bloquearia 6.
> Se no late game com todos os personagens ele pode aprender 100 habilidades, ele vai poder levar 40, bloquear 60... entendeu a mecânica?
>
> Aparecer "Planejado pra Missão" para habilidades/pilulas/itens que colocarmos no plano de missão
>
> Deixar o botão permitir aprender acesso... para o jogador saber que para habilitar a habilidade, só clicar ali e ela voltará ao plano de missão, pelo menos no pool.
>
> Você fez algo que bugou tudo, corrija
>
> Técnica de substituição o personagem tem que arremessar um clone no inimigo e ao acertar/entrar na área o personagem vira um Toco de madeira e explode dando o dano e os status da habilidade.
>
> colocar os ícones das habilidades, colocar a lista de status iniciais ao lado do personaagem na frente do nome no espaço vazio, subir os botões Ataques shinobi / Planejar Missão
>
> Mostrar o que melhora a ultimate do personagem, ela será afetada por dano total em todos os personagens e combara com todas as melhorias de dano do jogo
> Unica restrição é se ela for projétil ou não, o restante tudo melhora a ultimate dos personagens.
>
> Referência para o ícone de habilidade Modo Sábio, para o Naruto aparecer a fotinha do Naruto com esse ícone, para o Hashirama, colocar o hashirama, TODOS os personagens que tem modo sábio da Obra e entraram para o nosso jogo tem que ser assim... Orochimaru, Naruto, Hashirama, Kabuto... entendeu?
> Sempre pegar a foto do personal de refêrencia, criar o ícone ele com os olhos do personagem em modo sábio, tem muita referência de pesquisa para você fazer esse ícone.
> O mesmo para o ataque do Gamabunta em naruto, fazer o iconezinho com o gamebunta.
>
> Ao clicar em planejar que seria nosso "favoritar" e deveria ser planejar para missão as habilidades, mas ao clicar na estrelinha, se tivermos o buff da conta "Treinamento com Jiraya", temos 4 habilidades que conseguirmos habilitar treinamento do Jiraya e aumentar 15[x]% o dano dessas habilidades
>
> planejar para missão, já é um jeito de favoritar, ao fazer isso, aparecer para ele "treinar"
> Ai a habiulidade ficará planejada na missão e ainda vai aparecer no jogo "Planejado para Missão - Treinada" Acima aparecer +15%
>
> Após fazer isso siga a fila, bigbrain, vou deixar você trabalhar, isso se você ja revisou a animação de todos os personagens que faltaram, para ataques/dashs/pulos isso incluindo suas evoluções
>
> Aparecer os status base de quanto cada habilidade pode dar status, critico, nesse espaço vazio mostrar como ficará ingame a animaçãao da habilidade e o efeito acertando uns monstros para o usuário ver como funciona a habilidade.
> Fazer isso para todas as habilidades
>
> Porque os clones não estão correndo na direção do inimigo?
> ele está indo a imagem estática...
> Nunca deve ocorrer isso, sempre coloque as animações que planejamos
>
> Cadê a vila fazendo parte para fazer parte do link dos ajudantes dos personagens?
> E tem que aparecer o nome original das vilas, Konoha por exemplo... e o símbolo de konoha... fazer isso pra todos
>
> O "toco de árvore" ficou ridículo na técnica de substituição
>
> Em modo sábio, fazer uma "aura" em volta do personagem para mostrar ele enquanto estiver com o buff ativo... o efeito ta ridículo, use o mesmo conceito do atlas para fazer essas animaçoes, não sei porque você saiu dessa linha

**Resposta**
O planejamento separa uma lista com rolagem do painel de detalhes, com ícones, atributos base e prévia em alvos de treino. As linhas têm altura própria. Bloqueio é por personagem, limitado a 60% das técnicas aprendíveis, e “Permitir aprender” está destacado. Pílulas ficam disponíveis, itens planejados usam “Colocar na bolsa ninja” e as exclusões ficam na Bolsa da Missão. Após planejar uma técnica, a estrela permite treiná-la quando a passiva dá uma vaga. Até quatro técnicas recebem +15% de dano. A carta mostra o bônus e “Planejado para Missão · Treinada”. A seleção de personagem traz atributos e ações na parte superior, os ícones do kit e a explicação da Ultimate. O reset local exige confirmação.

Fukasaku e Shima sobre Gamakichi abrem a oficina. A fusão cria um ataque de área no nível 1, combina afixos e elementos e tem ×2 sobre a média de poder. A combinação usa um espaço para duas técnicas, com ×1,5 por ataque. As receitas são salvas na missão. Os NPCs mostram arte junto às escolhas. A Ultimate aplica as melhorias de dano, e os bônus de projétil se aplicam a Naruto, Tenten e Minato.

Gamabunta tem quatro poses com tantō e cachimbo. O óleo sai da boca e o fogo nasce próximo ao alvo. O Kage Bunshin acompanha o inimigo, acerta uma vez e se desfaz. A Substituição transforma o clone em toco com fumaça em quadros de atlas. A prévia do clone usa o mesmo controlador de corrida. O Modo Sábio tem retrato por personagem e aura de atlas enquanto o buff está ativo. A representação de Orochimaru segue a distinção entre senjutsu e Modo Sábio, e o ícone de Kabuto fica reservado para sua entrada no elenco.

As aldeias têm selo de vínculo com nome original e emblema, da seleção ao mapa e aos cartões de suporte. A contagem dos vínculos continua baseada nos ajudantes selados. A fila restante está em `docs/13-PENDENCIAS-PARA-CONTINUAR.md`.

> o que você esta fazendo agora? como esta sua fila?

A validação final no Edge passou em 47 verificações, incluindo aura ativa, corrida dos clones na prévia, treinamento e retomada do ponteiro. A fila restante é a revisão visual de cada forma sem ações próprias, seguida por escala de missões longas e testes com GPU real.

## Alinhamento do HUD em jogo e Ryu curto

**Pedido** (via coordenador, a partir do print do usuário com Naruto Nv. 194, 5 ajudantes e ~80 itens)

> Alinhar o HUD: grade de itens limitada com rolagem, minimapa sem ícones cortados e sem o selo DEBUG sobre o rótulo, barra da missão em blocos com preços numa linha menor e avisos fora da barra, SINERGIAS recolhível, dock sem cobertura. Aplicar o formato curto de Ryu aos preços, roleta, diálogo de troca e toasts. Revisar antes o que o Codex já resolveu.

**Resposta**

Já estavam resolvidos pelo Codex: grade de itens em 3 linhas com rolagem, cartões compactos com 4+ ajudantes e dock de pílulas compacto. Completei o contador dos itens, a barra da missão em blocos, o minimapa (ícones contidos, rótulo e selo DEBUG abaixo dele), o painel SINERGIAS recolhível e o Ryu curto em preços, roleta, mercador e avisos. Validado em 1440×900 e 1366×768 com 5 ajudantes e 80 itens; `tsc`, build, `verify-rules` e `verify-runtime` passaram.
## Final Swarm, pílulas sem escolha e altares por raridade

**Pedido** (via coordenador)

> Os monstros pararam de aumentar a quantidade em 300 no final swarm.
> Por algum motivo ele está pegando pílula sozinho em algum momento; estou com as habilidades todas selecionadas e dando upgrade, estou esquecendo as pílulas, mas acontece algum evento que faz ele pegar as pílulas aleatoriamente sozinho.
> O altar de desafio: só de ficar em cima deve começar a contar a porcentagem; ao sair de cima e do círculo em volta (limite de range) deve começar a cair; quanto mais raro o altar, mais rápido cai.

**Resposta**

Final Swarm: parcial — o swarm já existia, mas o teto era cortado em 1.600 (atingido aos 10 min) e o spawn perdia para o abate de builds fortes. Agora o teto é 1.600 × fator do swarm até 8.000, com reposição em ~4 s e nascimento a 14–28 m. Pílulas: a única fonte restante era a carta do level-up (roleta, chão e eventos já não davam pílula); com níveis em fila o clique ou a tecla da tela anterior caía na carta nova. Cada conjunto novo de cartas ignora entradas por 0,5 s. Altares: parcial — a barra já caía fora do círculo, mas exigia E e caía igual em toda raridade. Agora começa ao pisar, guarda progresso por altar e cai de 4%/s (Normal) a 18%/s (Lendário). Testes no Edge headless, `tsc`, build e `verify-rules` passaram.
## Versões separadas, pulo/dash do Naruto Academia e kunais do guardião

**Pedido** (via coordenador)

> Separar personagens, exemplo ter um personagem Naruto Academia, Naruto Genin, Naruto Kage e por aí vai... fazer as particularidades de cada um, separar todos os personagens que forem possíveis, criar missões, criar animações completas... ser obrigatório para liberar os novos personagens ter que jogar com um anterior e sempre dificultar mais e ter que capturar o personagem novo; o personagem novo só começa a aparecer quando completar as respectivas missões.
> Pulo e dash do Naruto inicial não estão com animação.
> Kunais do boss final: só deixou pegar 1 e não as 3.

Instruções complementares: revisar o que já existia antes de implementar; seguir as skills de arte, movimento, documentação e publicação.

**Resposta**

Versões: novo — as 56 formas viraram personagens próprios (24 famílias) com kit da fase, passiva e atributos; a versão não evolui na run e o id base continua sendo a primeira versão, então os saves seguem válidos. Cadeia: existia parcialmente (missões com requisitos, abates e selamento de conta); completei com `playWith`, missões por versão mais difíceis a cada passo e o passo "Jogar com …" no card. Animações: as folhas existentes por forma foram reaproveitadas; a lista do que falta para o Codex está no docs/13. Pulo/dash do Naruto Academia: a folha já existia, mas o estado de dano escondia os quadros; agora pulo e dash têm prioridade, com squash/stretch e rastro. Kunais: as kunais caíam em cima do portal e o E entrava nele, apagando as demais; agora ficam num círculo, a coleta tem prioridade e o portal avisa. `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Pílulas, pergaminhos de elemento e listas de itens em casa

**Pedido** (via coordenador)

> Pílulas devem mostrar o que melhoram (atributo, atual → novo) nas cartas, na ficha, na Bolsa/Plano e no inventário. Pergaminhos de elemento só devem listar técnicas do mesmo elemento. Criar na Bolsa da Missão a sub-aba "Itens em casa" com várias listas salvas (criar, nomear, descrever, aplicar, duplicar, apagar), evoluindo as predefinições 1–4.

**Resposta**

Pílulas: antes só mostravam o bônus ("+4% chance crítica") e o nível; agora mostram o atributo atual → novo nas cartas, na ficha, no plano de build e no tooltip da barra. Pergaminhos: o +3% de dano total fazia todas as técnicas aparecerem em "Melhora:"; agora só as do mesmo elemento. Bolsa: as 4 predefinições viraram a sub-aba "Itens em casa" com até 12 listas com descrição, compatível com o save antigo. Testes de navegador, `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Calibração com a wiki do jogo de referência e detalhes de interface

**Pedido** (via coordenador)

> Ponto de partida de calibração com a wiki pública do jogo de referência (sem engenharia reversa): tabelas referência × valor atual × proposta (arquivadas no arquivo de contexto fora do projeto), aplicando só o que for claramente inconsistente. Detalhes: prévia do atributo ao esquecer pílula no Ichiraku, reordenar as listas de "Itens em casa" e botão para expandir/recolher a grade de itens do HUD com estado salvo.

**Resposta**

Calibração: novo `docs/15-CALIBRACAO-REFERENCIA.md` com level-up, vitaminas × pílulas, Lab × Passivas, chefes, Survival × Final Swarm e economia, todos com URL da wiki. Nenhum valor foi alterado. As maiores diferenças ficaram como PROPOSTO para o usuário: venda de item fixa enquanto a kunai fica cara, Ryu por abate sem inflação, desbloqueios estruturais baratos e HP do guardião que não lê o dano do jogador.
## Ultimate por fase e Mega Elites/ajudantes como versões

**Pedido** (via coordenador; o usuário deixou a decisão com ele)

> 11. Ultimate por fase: conferir se as versões separadas resolvem e se a regra "Ultimate desde o Nv. 1" com Y obrigatório continua valendo.
> 12. Ajudantes e Mega Elites como versões avançadas conforme zona e dificuldade, com retrato, kit e buff da versão; sinergias por família; sem família repetida na equipe; saves válidos.

Confirmação do usuário: a Ultimate continua disponível desde o nível 1 em todas as versões; não mudar o AGENTS.md.

**Resposta**

Ultimate: parcial — as versões já davam Ultimate própria desde o Nv. 1, com R e Y valendo para todas; corrigi duas fora de fase (Madara Armadura → Susanoo Perfeito; Guy Sétimo Portão → Tigre do Meio-Dia Supremo). Mega Elites e ajudantes: novo — a versão segue zona e dificuldade, o buff é o da família escalado pela versão, sinergias e organizações contam por família e a equipe não repete família. Asuma ganhou o buff de ajudante que faltava. Saves com ids base continuam válidos.

## Filtro de raridade colorido no planejamento

**Pedido** (via coordenador)

> Criar um filtro de raridade com cores na aba de itens do planejamento da missão, com botões combináveis nas cores do jogo (Comum cinza, Incomum verde, Raro azul, Épico roxo, Lendário dourado), reaproveitando as cores e os botões que o Codex fez na Bolsa.

**Resposta**

A Bolsa já tinha botões de raridade, mas com uma raridade por vez e cor só no ponto; o plano tinha só um seletor. Criei o componente `RarityFilter`, colorido, combinável e com contagem, e o usei no plano (aba Itens) e na Bolsa. As cores foram para variáveis em `src/rarity.css`, com os valores que o jogo já usava. Testes de navegador, `tsc`, build, `verify-rules` e `verify-runtime` passaram.

## Auditoria do GitHub e folhas de ação dos usuários de Susanoo

**Pedidos**

> Leia os arquivos do github e da pasta e veja se estão iguais e atualizados, leia os .md para saber onde estamos.
>
> Depois leia e siga, atualize as sprite sheets, pegue o susano e a referência que ele usou e aplique para todos. Mostre a fila de a fazeres para decidirmos o que é mais importante após revisar onde estamos.

**Resposta**

Na conferência inicial, `HEAD` e `origin/main` apontavam para `2f7d7e9`. A pasta compartilhada tinha trabalho local em andamento, inclusive a integração de Susanoo e partículas WebGL. As cinco folhas de ataque, pulo e dash (Sasuke Rinnegan, Itachi Akatsuki e três Madaras) foram integradas numa cópia de trabalho separada. O Edge headless validou as 80 células e as poses no controlador compartilhado; as suítes de regras e de runtime passaram. A referência usada para revisar o efeito é a [Narutopedia](https://naruto.fandom.com/wiki/Susanoo). Restam a integração visual por lançador e a verificação em partida, prévia e apoio assim que a base WebGL estiver disponível em main. A [fila de pendências](13-PENDENCIAS-PARA-CONTINUAR.md) separa animação, combate, balanceamento e desempenho.

**Pergunta complementar**

> Você revisou a animação de todos os personagens?

**Resposta**

O elenco tem 56 versões com caminhada direcional. Neste lote, cinco receberam folhas completas de ação e passaram no teste do controlador no Edge. Contando a cobertura anterior, dez versões têm folhas para ataque, pulo e dash. Nove ainda precisam de quadros próprios de pulo e dash, e outras 37 precisam dos três tipos de ação. A revisão visual de cada versão em partida e como ajudante permanece na fila.

**Orientação permanente**

> Sempre coloque as perguntas e respostas lá

**Resposta**

Registrar em `docs/14-CONTEXTO-DO-CHAT.md` os pedidos, as perguntas, as respostas e as orientações complementares de cada rodada, junto com a documentação correspondente quando houver mudanças no projeto.

## Dash, arte de Sakura e Gaara, selo do Naruto e conta local

**Pedidos e complementos**

> ah, o dash para trás com o A está errado tem que inverter o boneco
>
> a sakura ainda estava bugada a animação, deixe todos os sprites revisados
>
> Se logado na conta, não aparecer mais jogar como Convidado em jogar... aparecer iniciar Missão, apenas mostrar convidado se a conta não for logado, ai aparecer guest...numeral crescente para contas criadas. (lembrando ser possível, simplesmente clicar em criar conta e atribuir a conta guest a um login/senha/email para salvar o conteúdo já conquistado.
>
> Você vai usar o naruto wiki, para saber quais vilas, elementos, organizações os ninjas do nosso jogo farão parte e montar os buffs de combo/passivas únicas para cada.
>
> Os ninjas médicos sempre darão cura, coleta, ninjas mais ofensivos, darão taijutsu, genjutsu, ninjutsu, seja qual for a propriedade/ataques que eles utilizem.
>
> Shurikens amaldiçoadas devem dar buff, mas acontecer emboscadas.
>
> Corpos de Ninja no chão, também são emboscadas, completa-los da 1 nível, progressivo pela dificuldade que estamos/zona.
>
> Faça em ordem, me mostre como esta a fila
>
> Você viu que separawmos os personagens ne? agora eles não evoluem mais, são únicos. Referencias para fazer/refazer o Gaara
>
> A cabaça dele estava muito feia.
>
> me mostre o naruto e posições de mãos
>
> tem uma posição que você fez ele arremessando algo, quero que troque por essa referencia
>
> faça para todos os personagens essa substituição, ok?
>
> consegue fazer unicamente essa posição para todos eles?
>
> Conte quantos personagens jogáveis temos agora, quantos estão com passivas/habilidades/ajudantes/movimentação completamente prontas e para implementar/implementadas.
>
> Você tem todas as movimetnações feitas para eles, certo? completinhas, revisadas.
>
> posição do gaara ter uma única pode ser quando ultar, caixão de areia
>
> Referencias para o Gaara posições de mãos
>
> TODOO o restante pode seguir as posições/movimentações iguais ao naruto
>
> ele tem que ter dash para a esquerda também viu? todos os personagens...
>
> gaara também pode flutuar na areia, se conseguir fazer ele voar seria maneiro
>
> como esta a fila?
>
> lembre-se que o naruto é a padronização de movimentação para quase todo o resto, exceto: lee, guy, gaara... por enquanto
>
> voce nao pode esquecer tem até uma skill para isso, você atualizou depois dos reparos nas movimentações ?
>
> O que esta fazendo agora?
>
> Deixe a movimentação de WASD mais fluído também
>
> o dash em si seria para todos os personagens, ok?

**Respostas e andamento**

- O dash de todo jogável usa a direção capturada ao apertar Shift, inclusive se soltar a tecla em seguida. A folha e a pose procedural espelham para a esquerda. WASD suaviza a troca de direção sem reduzir a velocidade na diagonal. A skill de movimentação registra o padrão Naruto e as exceções Lee, Guy e Gaara.
- Sakura Genin, Shippuden e Byakugou receberam folhas de soco, pulo e dash. As três versões do Gaara receberam cabaça de dois bojos em repouso e em movimento, palma aberta no Caixão de Areia e na Ultimate e folhas de caminhada e ações. Kazekage e Aliança flutuam por até 0,9 s se mantiverem Espaço pressionado no salto.
- Naruto Academia, Genin, Shippuden e Manto da Kyuubi têm folha de selo cruzado para os jutsus Bunshin, com a pose do Totem e a prévia reaproveitando o mesmo padrão. Arremesso de arma continua associado aos golpes que arremessam armas. A aplicação do selo no restante do elenco está na fila.
- Existem 56 versões independentes de 24 famílias. Todas têm passiva jogável, kit, Ultimate e caminhada. Após este lote, 16 têm folha que cobre ataque, pulo e dash, nove ainda precisam de pulo e dash dedicados e 31 precisam dos três. A auditoria visual individual em partida e como ajudante segue pendente. Na base publicada anterior havia passiva de apoio para 23 das 24 famílias; o Asuma e as versões avançadas estavam na cópia local em andamento do Claude.
- A tela inicial mostra Guest numerado fora da conta e Iniciar Missão quando conectado. Criar conta com login, e-mail e senha promove o convidado com seu progresso. O cadastro e a numeração valem neste navegador.
- A fila reúne a revisão por fase das afiliações usando a Narutopedia, os papéis dos ajudantes, as shurikens amaldiçoadas, os corpos com emboscada e a validação do restante do elenco.

O Edge confirmou o dash para ambos os lados com soltura imediata da tecla, o selo do Naruto e o cadastro com migração e retorno ao perfil. Em partidas separadas, Gaara Kazekage flutuou e desceu ao soltar Espaço, e Sakura Byakugou trocou a folha de caminhada pela de pulo.


## Continuação · 07/11/2026

### Pedidos do usuário

> as vezes aperto WASD e fica meio travada a movimentação, é pra ser continuo apertou o botão andou, apertou outro, mudou direção/andou.

> COmo esta a fila?

> Siga trabalhando

> O mercador de itens, não deve aumentar o preço ao comprar os itens do pool na hora de escolher. Ele tem que aumentar o valor da roletada e os novos itens que ir aparecendo. Se eu decidir não comprar nada, não aumenta se eu clicar novamente para ver os mesmo itens, só aumenta ao clicar na roleta, os itens devem seguir uma precificação de acordo com a raridade e o scale de valor ao ir comprando também.

> ao apertar tab, ele esta abrindo as estatisticas como se fosse o P e pausando, remova isso... Também toda vez que vejo a ficha do personagem tenho que clicar para soltar o jogo novamente, deve ser fluido, saiu da ficha ja continua jogando

> Nos sapos, deve ter 2 abas, fundir/combinar esse hud está ridiculo de feio, conserte mostrando os icones das habilidades, deixando bem mais bonito

> Só deve ser possivel fundir/combinar 1x por zona

### Respostas e implementação

A fila segue com a validação de controles, economia, oficina e eventos. O WASD passa a reagir diretamente, com prioridade à última tecla oposta pressionada. Tab abre o mapa rápido sem pausar. Fechar P solicita a captura do ponteiro para continuar a missão.

Os preços do estoque atual do mercador ficam fixos ao comprar e ao reabrir. Compras acumuladas entram na cotação do próximo estoque. Atualizar o estoque aumenta o preço da próxima atualização e das novas ofertas, considerando também raridade e tempo de run.

A oficina tem duas abas, com os ícones das técnicas de cada par. Fundir ou Combinar consome o mesmo uso único por zona, salvo na run e renovado ao avançar. Ver os pares ou trocar de aba preserva o uso.

As afiliações por fase, os bônus de apoio para as 56 versões e as emboscadas da shuriken e do corpo foram implementados nesta continuação. A revisão de animação do restante do elenco continua pendente.

As alterações são feitas no worktree ShinobiBonk_Codex_Arte. A pasta ShinobiBonk_Codex_Projeto_Completo conserva rascunhos locais do Claude e pode estar atrás do GitHub.


**Validação final desta continuação** — 56 verificações no Edge headless passaram, incluindo as duas abas, persistência do limite na run salva, novo uso por zona, mercador e retomada de P. Sem erros JavaScript ou assets 404. TypeScript, build e regras passaram. A revisão completa das animações continua pendente.


## Pergunta sobre o restante da fila · 07/11/2026

> O que resta fazer?

### Resposta

O lote atual foi publicado na main do GitHub em badcee4. Oficina com uso único compartilhado por zona, preços do mercador, WASD, Tab/P, afiliações e eventos passaram pela validação descrita acima.

1. Integrar as duas linhas de trabalho. A pasta ShinobiBonk_Codex_Projeto_Completo está em c41bd79, com trabalho parcial do Claude salvo na branch wip/parcial-subagentes-07-11. A main remota e o worktree ShinobiBonk_Codex_Arte seguem os commits publicados pelo Codex. É preciso conciliar ambas para a pasta principal reunir os dois lotes.
2. Finalizar e revisar as ações de todas as 56 versões. Há 16 versões com folhas cobrindo ataque/pulo/dash, nove com pulo/dash dedicados pendentes e 31 com os três tipos de ação pendentes. Todas têm caminhada. Ainda é necessária auditoria visual por versão e no papel de ajudante.
3. Aplicar os selos de mãos ao restante do elenco e refinar as poses especiais de Gaara, Lee e Guy. Naruto tem quatro versões do selo cruzado.
4. Integrar e validar o rascunho WebGL de Susanoo por lançador, incluindo suporte, Ultimate e prévia. Refinar efeitos por técnica e buscar sons com licença adequada.
5. Recalibrar dano e atributos por nível, HP/defesa dos monstros/chefes, Sorte, economia, bônus de ajudantes e emboscadas. As tabelas de proposta permanecem no arquivo de contexto arquivado, fora do projeto.
6. Validar terreno, bordas, colisões e câmera em mais climas. Medir desempenho de hordas em GPU real. A suíte headless usa renderização por software.
7. Completar testes prolongados de uma run comum, missões de desbloqueio, três zonas, bijuu, recompensas e ranking. Cadastro com servidor e hospedagem da alpha seguem como etapas posteriores, pois o perfil atual é local.

A fila completa continua em docs/13-PENDENCIAS-PARA-CONTINUAR.md.

## Continuação e publicação solicitada · 07/11/2026

### Pedidos complementares do usuário

> faça
>
> ponto 5. já existe no jogo
> 6. parece estar ok
> 7. Faça 1, 2, 4, 5, 7
>
> Lembrando os mapas devem ter o mesmo padrão de chão, construção do primeiro mapa, ou seja o atlas, exemplo liberei o mapa da areia e o chão não está polido... esta aquele mapa antigo, conserte e conserte pra todos.
>
> As construções e coisas marcantes também!
>
> AO SAIR DO ESC, ainda o jogo fica pausado se não clicar
>
> Continue o trabalho
>
> E continue com a fila de trabalho
>
> o que voce esta fazendo?
>
> Você precisa enviar para atualizar... envie logo, depois você atualiza

### Respostas e estado real

Codex informou que está conciliando os lotes do Claude e Codex, corrigindo Esc, integrando os atlas dos mapas e continuando as animações. Informou explicitamente que a revisão completa das 56 versões ainda não terminou e que este lote ainda não havia sido enviado ao GitHub naquele momento. Após o pedido de envio imediato, respondeu: “Vou enviar este lote agora, com a documentação indicando o que ainda falta validar. Depois continuo as atualizações e a fila.”

IMPLEMENTADO: nove folhas novas de pulo/dash (três Narutos, três Lees, três Guys), três folhas completas de ações (Sasuke Shippuden, Hashirama base/Sábio), chão de Areia/Pedra/Névoa e nove construções/marcos regionais. Folhas conectadas ao controlador compartilhado; auditoria visual completa PENDENTE. A retomada por Esc passou no fluxo automatizado; o relatório final da suíte será atualizado ao concluir. O balanceamento existente foi preservado conforme a correção do usuário. O envio solicitado agora é uma entrega incremental; as demais pendências continuam registradas em docs/13.

## Deploy Netlify e FPS · 11/11/2026

**Pedido**

> [print do erro 404 do Netlify: “page not found” / “index.html não existe”]
> Entenda do que se trata, veja os skills e toda documentação… Após isso corrija um problema que estamos com o index.html, quando carregamos no netlify ele fica dando page not found, porque fala que o index.html não existe/está gerado.

> [print do site rodando no Netlify]
> Olha como ficou subindo seu .zip no netlify

> acho que deu certo, vou fazer 1 teste apenas

> Porque o FPS está tão baixo? Eu não tinha problemas de FPS antes

> Resolva o FPS que eu subo no netilify

**Resposta e estado real**

- **Netlify 404 (CONFIRMADO)**: o erro veio de uma publicação parcial — o primeiro upload arrastou só o `index.html` da raiz sem a pasta `assets/` (drag & drop do Netlify fica instável acima de ~50 MB; o build tem ~204 MB / 343 arquivos). Subindo a pasta `dist` inteira (ou um zip com `index.html` + `assets/` na raiz), o site carregou: o print do usuário mostra o jogo rodando em `*.netlify.app`. O deploy é manual (sem Git/CLI).
- **FPS (IMPLEMENTADO)**: causa principal (CONFIRMADO) — as configurações ficam por domínio no `localStorage` (`sb_settings_v1`), então o domínio novo do Netlify começou com os padrões (qualidade `alta`, resolução automática até 1,5× os pixels do dispositivo, FPS sem limite), mais pesado que os ajustes usados localmente; versões recentes também somaram efeitos. A simulação não é o gargalo (TESTADO: 1,8 ms/frame com 1.200 inimigos). Solução: `src/scene/adaptiveGovernor.ts` (mede o intervalo real entre quadros e reduz/devolve o pixel ratio automaticamente) + opção **Ajuste automático de desempenho** em Gráficos (ligada por padrão). **TESTADO**: testes do governor, `tsc -b`, build, `verify-rules` e smoke headless com 1.200 inimigos (`autoRatio` 1 → 0,61 sob carga, sem erros de página). **PENDENTE**: validar em GPU real no deploy do usuário.
- Lote de feedback da comunidade (fusão/Kekkei Genkai, projéteis vermelhos dos inimigos comuns, água, som de hit, terreno/horizonte, câmera do jogo de referência, mouse, badges do pool) registrado em docs/13, aguardando definições do usuário sobre os itens ambíguos.


Validação concluída antes do envio: 58 verificações no navegador passaram, sem erros JavaScript nem assets 404; inclui Esc sem clique, Tab, mercador, oficina, ajudantes por versão e emboscadas. TypeScript, build e regras passaram. A medição de desempenho em renderização por software não comprova desempenho em GPU real.

## Pedido de publicação imediata e reserva de uso · 07/11/2026

> Faça a atualização do git, depois siga a sua fila
>
> atualize o github novamente agora, porque seus tokens semanais vão acabar, restam 2%

### Resposta e providências

Codex confirmou o primeiro push para origin/main em 11e0d18, com 58 verificações no navegador, TypeScript, build e regras aprovados. Continuou a criação de folhas de ações e a prévia do Susanoo. Ao receber o pedido de envio imediato do segundo lote, respondeu: “Vou publicar agora o segundo lote e salvar o ponto de continuação. Vou deixar registrado o que foi integrado, o que passou nos testes e o que ainda falta revisar.”


## Lote de animações salvo para continuação · 07/11/2026

IMPLEMENTADO: 24 folhas completas adicionais 4×4 de ataque/selo/pulo/dash: Kakashi 1/25, Itachi 1, Minato 1/15, Tsunade 1/15/30, Jiraiya 1/20, Orochimaru 1/15, Hinata 1/15/30, Pain 1, Shikamaru 1/15/30, Tobirama 1, Temari 1/15 e Tenten 1/15. Todas foram empacotadas em células uniformes e registradas em directionalArt.ts, usado também pelos ajudantes. As três folhas completas de Sasuke 15 e Hashirama 1/20 já foram publicadas no lote anterior. Os prompts e referências estão em docs/arte-atlas-2026-11-07.json, gerados com ImageGen.

IMPLEMENTADO: prévia de Susanoo utiliza o mesmo rig WebGL e partículas do combate, escolhendo o estilo pela família do lançador. TypeScript, build e regras passaram após as mudanças.

PENDENTE: criar folhas completas de Kankuro 1/15/30 e Kushina 1 (quatro versões); revisar/refinar ataques antigos de Neji 1/15, Sasuke Genin e Naruto Clássico/Shippuden. A existência da folha não confirma que todas as poses foram aprovadas visualmente. Conferir consistência com o sprite parado, frente/costas e dash esquerdo em cada versão e como ajudante.

O script scripts/verify-motion-atlases.mjs exercita o controlador em fixture isolada e produz artifacts/motion-review.json e quatro folhas de contato. A primeira execução tinha duas instâncias de Three.js; corrigido o import por scripts/motion-review-entry.ts. Conferir o resultado final antes de considerar a auditoria completa.

Continuam pendentes: inspeção visual dos quatro mapas, prévias/efeitos em combate de todos os lançadores, sons com licença verificada e uma run prolongada de três zonas até bijuu/saída/ranking. Preservar o balanceamento existente conforme instrução do usuário. Não publicar artifacts/sb-swishes-source.zip: é um arquivo preexistente de origem/licença não verificada.

Validação deste lote: scripts/verify-motion-atlases.mjs concluiu com 56 versões, 560 estados, zero erros JavaScript e zero assets ausentes. Foram geradas quatro folhas de contato; a aprovação visual completa e a revisão em combate continuam pendentes.

## Arquivar e remover o material do jogo de referência · 11/11/2026

> Pergunta: Você consegue gerar um arquivo com todo o contexto de referência de todos os vídeos/prints que relacionam o jogo de referência e deletar COMPLETAMENTE do projeto/pasta do projeto qualquer coisa que relacione o jogo de referência? Incluindo entender as prints que são referente ao jogo de referência? *(O nome próprio do jogo foi omitido aqui a pedido do usuário — 11/11/2026: nada em nenhum lugar do projeto referente a ele.)*

### Resposta e providências

CONCLUÍDO no commit `4ef107c`. O material saiu do repositório para uma pasta arquivada na raiz do workspace (fora do Git): `CONTEXTO-COMPLETO.md` reúne os docs antigos íntegros (ex-docs/15–17), as 44 prints com descrição, as 54 imagens originais, as citações do chat e as medições do vídeo de referência; `prints/` e `prints/originais/` guardam os PNGs. Foram removidos 101 arquivos do projeto e reescritos 11 arquivos para eliminarem a menção direta ao jogo de referência (passam a falar de “jogo de referência”/“arquivo arquivado”). O vídeo `referencia.mp4` (~240 MB) ficou na pasta de clips do Medal do usuário.

ATENÇÃO: os arquivos removidos continuam no **histórico do Git** (foram removidos apenas da ponta); apagá-los do histórico exigiria reescrever o histórico/force push — proibido pelas regras. Decisão separada do usuário, caso queira.

## Arquivo de contexto permanente de perguntas/respostas · 11/11/2026

> Crie um .md de contexto de perguntas/respostas para sempre manter o contexto de tudo que perguntamos/falamos para sempre manter a direção do que estamos conversando

### Resposta e providências

IMPLEMENTADO. Criado `docs/18-CONTEXTO-PERGUNTAS-RESPOSTAS.md` como arquivo de contexto permanente: §0 regras de manutenção (toda rodada atualiza o resumo/direção; nunca apagar entradas passadas), §1 o que é o ShinobiBonk, §2 direção atual, §3 decisões permanentes do usuário com data, §4 registro cronológico resumido das 25 rodadas com estados (CONFIRMADO/IMPLEMENTADO/TESTADO/PROPOSTO/PENDENTE), §5 estado atual, §6 pendências vivas e §7 mapa de onde cada conteúdo vive. O texto integral continua em docs/14 (evita manutenção dupla). Atualizados AGENTS.md (leitura inicial + regra de documentação contínua), README.md e docs/00 (ponteiros para o docs/18).

## Regra de idioma da comunicação · 11/11/2026

> Você sempre falará comigo em português, mesmo que eu entenda em inglês, nossa comunicação sempre será em português.

### Resposta

CONFIRMADO (permanente). A regra já constava no AGENTS.md ("Fale em português do Brasil. Seja objetivo, técnico e explícito."); agora também está registrada nas decisões permanentes do docs/18. Toda resposta a todo pedido, em qualquer canal, será em português.

## Remoção do ajuste automático de desempenho · 11/11/2026

> Eu não quero o auto-render para melhorar FPS, deixe o jogador configurar como quiser nas configurações gráficas isso, volte ao normal como estava!

### Resposta e providências

REMOVIDO (volta ao normal). Apagado `src/scene/adaptiveGovernor.ts`; removidos o uso em `GameCanvas.tsx` (tick no loop de render, `setCeiling`/`snapToCeiling` no handler de configurações, `autoRatio`/`autoDeficit` na leitura de debug), a opção "Ajuste automático de desempenho" de Gráficos (`SettingsScreen.tsx`) e o campo `autoPerformance` (`settings.ts`). O pixel ratio agora é definido apenas por Qualidade/Resolução, e o Limite de FPS segue disponível — o jogador configura como quiser, sem intervenção automática; configurações salvas antigas com o campo passam a ser ignoradas. `tsc -b`, `vite build` e `verify-rules` passaram. Decisão permanente registrada em docs/18 §3: **desempenho/imagem sem ajuste automático**.

## Material do jogo de referência: consumir fora do projeto (skill) · 11/11/2026

> (A mensagem do usuário cita o nome do jogo de referência; o nome é omitido aqui a pedido dele, para não ficar em lugar nenhum do projeto): "Você vai por no contexto de não termos nada referente ao [jogo de referência], fazer uma skill quando ele receber algo sobre [jogo de referência] para consumir o conteúdo, vai anotar tudo que aprender no contexto para termos nossas referencias atualizadas e não vai manter o arquivo no projeto. Isso servirá para quando publicarmos o jogo não ter NADA em nenhum lugar referente a [jogo de referência]"

### Resposta e providências

IMPLEMENTADO. Criada `skills/referencia-externa/SKILL.md`: quando qualquer agente receber material do jogo de referência (prints, vídeos, tabelas, textos, ou o nome em conversa), ele consome o conteúdo, anota tudo que for aprendido no contexto arquivado **fora** do projeto (`CONTEXTO-COMPLETO.md` + `prints/`, seção datada), nunca salva o arquivo no repositório e nunca escreve o nome em arquivo rastreado ou em commit. Propostas extraídas do material entram como PROPOSTO, aguardando o usuário. Regra adicionada ao AGENTS.md ("Material do jogo de referência (zero rastro)") e decisão permanente no docs/18 §3. O nome próprio do jogo também foi removido da citação da rodada 24 neste arquivo (antes preservado como palavra do usuário; a instrução de 11/11 é mais recente e vale: nada em lugar nenhum).

## Mouse sem aceleração (raw input) · 11/11/2026

> rawinputbuffer é em relação a aceleração do mouse, quanto mais mexe o mouse mais rápido fica, eu quero que isso não aconteça... quero que ele fique sempre a mesma velocidade e a sensibilidade funcione exatamente da forma que o jogador configurar nas configurações que temos no jogo

### Resposta e providências

CAUSA: a câmera perseguia o alvo do mouse com amortecimento exponencial (`MathUtils.damp` em `yaw`/`pitch`), então movimentos rápidos "apanhavam" a câmera e pareciam aceleração; e, sem `unadjustedMovement`, o `movementX/Y` que chega ao navegador já vem acelerado pelo sistema operacional do mouse. CORREÇÃO: (1) `captureGamePointer` agora pede o pointer lock com `{unadjustedMovement:true}` — raw input do navegador (Pointer Lock 2.0, baseline 2026; em navegadores antigos a opção é ignorada e o lock segue funcionando); (2) `turnCamera` aplica o movimento direto em `yaw`/`pitch` — removidos `targetYaw`/`targetPitch` e o `damp` do loop —, então o giro é exatamente `movimento × 0.006 (Y: 0.004) × sensibilidade`, constante, independente da velocidade do mouse; (3) a sensibilidade continua o multiplicador linear 0.20–3.00 de Controles, aplicada exatamente como o jogador configurar. `tsc -b`, `vite build` e `verify-rules` passaram.

## V-Sync, placa de vídeo e fim da suavização da câmera · 11/11/2026

> Retirar a suavizaçãao de câmera, colocar opção de v-sync no jogo.
> Não sei exatamente se da pra utilizar jogando o jogo via navegador, mas quando formos fazer o nosso .exe do jogo/patch do jogo, deverá ter nas configurações também, ligar e desligar e também opção para selecionar a placa de vídeo do jogador ou rodar em openGL.

### Resposta e providências

IMPLEMENTADO. (1) **Suavização da câmera retirada** (`src/scene/GameCanvas.tsx`): o zoom agora é instantâneo (muda direto para o alvo, sem perseguição exponencial) e a altura da câmera segue o jogador na hora (removido o `damp`/`jumpedZone`); o giro (yaw/pitch) já era direto desde a rodada 29. (2) **V-Sync** (Gráficos, `vsync` em `settings.ts`, padrão LIGADO): ligado = `requestAnimationFrame` (um quadro por quadro do monitor); desligado = loop acima da taxa do monitor (`setTimeout(0)`) — melhor esforço no navegador (ele ainda pode limitar; o usuário já sabia disso); no .exe a sincronização sai direto do motor. (3) **Placa de vídeo** (Gráficos, `gpu` em `settings.ts`, padrão "Alto desempenho (dedicada)"): Automática/Alto desempenho/Integrada → `powerPreference` do contexto WebGL (default/high-performance/low-power); trocar em tempo real recria o contexto (dispose + `forceContextLoss` do antigo) e reinicia o loop; saves antigos sem os campos são migrados pelo espalhamento dos padrões. (4) **"Rodar em openGL"**: a versão web não expõe escolha de API de render (o motor escolhe WebGL2/WebGL1); o card "Monitor e motor gráfico" (Tela) agora registra que no .exe/patch o jogador também escolhe o renderizador (OpenGL/DirectX). **Correção raiz do flake do `verify-runtime` (re-lock após escolha)**: a isenção de teste do `CHOICE_GUARD` (`guardOff`) só valia quando `testPointer` era `true` — e o teste de lock usa `?test=1&pointer=real` (onde `testPointer` é `false`); com o guard ativo, o clique na carta (chegando em < 0,5 s) era descartado pelo `onChoose` antes do re-acionamento do ponteiro, e o teste morria no `waitForFunction` do re-lock; a isenção agora vale para qualquer página `?test` sem `&guard=1` (só em desenvolvimento), como já documentado em docs/12 e no comentário do código. `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless — todos os checks verdes, sem exceções JS nem assets 404) passaram.

## Contexto, skills e registro completo · 11/11/2026

> Deixe o changelog atualizado e verifique se a skill de atualizar os log's manda exatamente documentar TUDO que nós fazemos de alteração, inclusive... você consegue também subir para o github as alterações e sempre atualizar lá?
>
> Criar uma skill .markdown para SEMPRE ler os contextos e .skills para tomar decisões de alterações, isso serve para quando resetar o contexto, você usar as outras skills já criadas, inclusive a que temos para salvar contexto, para você utiliza-la, assim como todas as outras, ler as documentações... e tomar a melhor decisão sempre.
>
> não se esqueça de atualizar o github

### Resposta e providências

IMPLEMENTADO. (1) **Nova skill `skills/contexto-e-decisao/SKILL.md`** — no início de toda tarefa, principalmente após reset de contexto ou handoff de outro agente: ler o contexto na ordem (AGENTS.md → docs/18 → docs/14 → docs/13 → CHANGELOG → README/docs/00/doc temático), ler e **usar** as skills do projeto (incluindo `documentar-projeto`, a que salva o contexto, e `publicar-github`), e decidir pela ordem decisão permanente do usuário > código (fonte da verdade do que existe) > documentação, com PROPOSTO para o que o usuário não aprovou; a rodada fecha com registro completo (TUDO) + commit/push + relatório em pt-BR. (2) **`documentar-projeto` agora manda explicitamente "documentar TUDO"**: toda alteração — código, configuração, controles, assets, sistemas, skills, textos, decisões, testes — entra no registro na mesma tarefa; `CHANGELOG.md` é atualizado em toda mudança (jogo, documentação, skills, processo), sem "mudança pequena demais para registrar"; `docs/14` guarda o pedido integral + resposta e `docs/18` o resumo/direção. (3) **`publicar-github` endurecida**: stage com `git add -u` + novos arquivos por nome (nunca `git add -A` em bloco) e commit + push ao fim de toda tarefa — **sim, eu subo para o GitHub sempre** (nesta sessão: `ab87de2` e `5aa28c6` da rodada 30, mais este commit). (4) AGENTS.md ganhou a seção "Antes de qualquer tarefa" (a skill nova como primeiro passo) e a regra de documentar TUDO em "Documentação contínua".

## Recriar o repositório no GitHub + fluxo do material de referência · 11/11/2026

> (A mensagem do usuário cita o nome do jogo de referência; o nome é omitido aqui a pedido dele, para não ficar em lugar nenhum do projeto): "Como você vai ler partir de agora quando eu enviar coisas relacionadas ao [jogo de referência]? Como Claude e Codex vão ler e interpretar as coisas que estamos fazendo por aqui?"
>
> "Você falou em preparar algo para o suporte do github, na realidade, eu vou excluir o repositório e depois criar outro para utilizarmos, não se preocupe mais com isso."
>
> "me fale o nome das skills que você criou."
>
> "Você tem subagentes?"

### Resposta e providências

ENTENDIDO + DECISÃO REGISTRADA. (1) **Material do jogo de referência**: quando você enviar prints, vídeos, tabelas ou textos, o fluxo é o da skill `referencia-externa` — eu consumo o conteúdo, anoto tudo que aprender no contexto arquivado **fora** do projeto (pasta arquivada na raiz do workspace, com `CONTEXTO-COMPLETO.md` + `prints/`), nunca salvo o arquivo no repositório e nunca escrevo o nome em lugar rastreado; o que eu extrair vira **PROPOSTA** (você aprova o que entra no jogo). Zero rastro na publicação. (2) **Claude e Codex**: eles não veem este chat — veem o **repositório**, na ordem `AGENTS.md` → `docs/18` (direção + decisões permanentes) → `docs/14` (mensagens integrais) → `docs/13` (fila) → `CHANGELOG` → `skills/`. Por isso a regra de documentar TUDO + commit/push: qualquer clone, em qualquer máquina, lê a mesma direção; e a skill `contexto-e-decisao` obriga esse caminho no início de toda tarefa (principalmente após reset de contexto). (3) **Exclusão/recriação do repositório**: decidido — o zip de origem não verificada e os materiais antigos saem **com o histórico**, sem reescrita, sem force push e **sem nada para o suporte da GitHub** (aquela pendência está encerrada); a decisão foi registrada em docs/18 §3 e §5 e no CHANGELOG. Até você criar o novo repositório, as publicações seguem no atual; quando ele existir, me passe a URL que eu atualizo o remoto (`git remote set-url origin <novo-url>`) e publico. (4) **Skills criadas por nós nesta conversa**: `contexto-e-decisao` (rodada 31) e `referencia-externa` (rodada 28); as demais do projeto são pré-existentes (`documentar-projeto`, `publicar-github`, `criar-arte-shinobibonk`, `movimentar-shinobi`). (5) **Subagentes**: sim, limitados — subagentes de **busca** em paralelo (`agentic_find`) e busca/extração da web (`web_search`/`web_extract`); o trabalho principal (código, docs, decisões) eu executo direto na sessão, com o contexto completo.

## Andar durante o ataque + FPS no computador do usuário · 11/11/2026

> "Porque no MEU computador o jogo está lagado, 20 FPS? Mesmo quando eu fecho tudo relacionado a IA?"
>
> "O personagem não deve travar/parar de andar na animação de ataque, se ele tem ataquespeed para atacar e consegue andar, deve continuar andando fazendo os movimentos."

### Resposta e providências

Feito. (1) **O personagem não para mais no ataque**: com o ataque normal, se você está andando, ele **continua andando e fazendo os movimentos** — o corpo segue o ciclo de caminhada e o golpe sai dos braços (parado, o ataque é exatamente o de sempre); a **Ultimate mantém a pose especial** de sempre; pulo, dash e dano não mudaram (`src/scene/playerMotion.ts`). (2) **Por que 20 FPS no seu computador**: (a) o domínio novo do Netlify tem configurações **zeradas** — o save é por navegador/domínio, então ele nasce em `Qualidade Alta` + resolução cheia (o mesmo problema que o 404 revelou na rodada 23; no domínio antigo você já tinha ajustado); (b) o jogo é pesado de propósito — hordas grandes com sprites 3D, efeitos e números de dano = centenas de desenhos por quadro, então "Alta" em resolução cheia pode passar do que a sua GPU entrega; (c) fechar os apps de IA não ajuda — o custo é do próprio jogo na GPU do navegador, não dos apps. (3) **O que fazer AGORA no jogo**: Gráficos → Qualidade **Média** (ou Baixa) e/ou Tela → Resolução **900p/720p**; ajuste até ficar liso — fica salvo naquele domínio/navegador. Confirme que a GPU é "Alto desempenho (dedicada)" (padrão) e que o navegador tem aceleração de hardware ligada (Configurações → Sistema). O contador de FPS já aparece (padrão ligado). (4) **Melhoria de performance no código**: os anéis de efeito (escudo, espinhos, Chidori Nagashi, Amaterasu, ressurreição etc.) pararam de criar e destruir geometria a cada uso — cache por tamanho, liberada só ao sair da cena — menos pressão de GPU e menos lixo; o resto (números de dano, terreno, partículas) já estava otimizado e não foi tocado. (5) **Se ainda ficar baixo**: é o teto da sua GPU rodando a versão web; o .exe/patch do jogo (DirectX, decisão já registrada) será mais leve. **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless, todos os checks verdes, sem exceções JS nem assets 404).

## Dificuldade, scale de habilidades, ficha e renderizador · 11/11/2026

> "Entenda que as configurações para melhoria do jogo de browser, também tem que acompanhar uma configuração semelhante para já ficar preparado um executável."
>
> "Kankuro já foi corrigido"
>
> "Dificulte mais o early game de todos os modos de jogo que temos em suas devidas proporções, veja o nível de dificuldade de scale de cada nível de dificuldade."
>
> "Verifique o nível de dificuldade também individual para cada fase do jogo."
>
> "Pode deixar os números spammando na tela."
>
> "Verifique o scale do jogo e deixe mais difícil, alguns personagens estão fazendo os mapas muito fáceis."
>
> "Aumente o scale de dano e % de todas as habilidades do jogo."
>
> "Volte a tabela de utilidades para a ficha do personagem, em outra rodada foi retirado."
>
> "Lembrando que a unica coisa que upa conforme passamos de level na parte do \"Training\" quando não temos mais nada para evoluir em habilidades/pilulas aumentar só a \"Sorte\" ..."
>
> (vídeo de referência enviado) "referencia para ter gráficos de scale de habilidade/dano/status... tudo veja o vídeo e aprenda..."
>
> "Pode ir atualizando o git, até eu falar que troquei o repositório."
>
> "Andar livre enquanto ataca, já foi implementado?"

### Resposta e providências

Feito, item por item. (1) **Renderizador (preparo do .exe)**: a aba **Tela** agora tem a opção **Renderizador — DirectX ou OpenGL** (padrão DirectX), salva nas configurações junto com a resolução. No navegador a renderização continua sendo sempre WebGL (melhor esforço do motor web); no .exe/patch do jogo a escolha sai direto do motor — a estrutura das configurações já nasce pronta para isso (`src/game/settings.ts`, `src/ui/SettingsScreen.tsx`). (2) **Kankuro**: marcado **RESOLVIDO** na fila — a arte dele (folhas 1/15/30 + caminhada/ação v3) já está no repositório; faltava só o registro. Restam Kushina (1) e a revisão de Neji/Sasuke/Naruto Clássico. (3) **Early game mais difícil em TODAS as dificuldades, em suas devidas proporções**: o Genin tinha um desconto de 66% nos primeiros 2,5 minutos (subindo a 100%) — **removido**; agora cada dificuldade nasce na força plena do seu tier (Genin ×1 · Chūnin ×1,4 · Jōnin ×1,9 · Kage ×2,6) e a base do minuto 0 subiu para **HP ×1,6 e dano ×1,45** em todas, com o efeito extra **decaindo proporcionalmente** (5 min ≈ ×1,20 · 10 min ≈ ×1,13 · 30 min ≈ ×1,05) — o late game já é íngreme (HP ×1,17/min) e não foi inflado de novo. (4) **Dificuldade individual por fase/zona**: nova escala `ZONE_DIFFICULTY` — zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38 — aplicada ao HP, dano, spawn e pressão de roleta de cada zona (antes as zonas tinham a mesma dificuldade). (5) **Scale do jogo + scale das habilidades**: o dano e o % de **todas as habilidades** cresceram — base do crescimento por nível **×1,5** em todas as raridades (ex.: Comum de +30–45%/nível para **+45–67%/nível**; Lendário de +250–330% para **+375–485%**) e **escale global de dano das técnicas ×1,2** (jogador e ajudantes; os kits dos chefes já escalam por fase e não mudaram). Personagens fortes (Gaara, Guy, Sakura, Madara…) agora enfrentam hordas ~45% mais fortes no início — os mapas deixam de ser fáceis sem nerfar ninguém. (6) **Números de dano**: o teto na tela subiu de 60 → **300** — podem seguir spammando, sem estourar o pool de sprites. (7) **Tabela de utilidades de volta na ficha**: o bloco **UTILIDADE** voltou para a ficha (P) com 9 linhas — velocidade, coleta, sorte, experiência, Ryu, recarga da Ultimate, vagas de suporte, dano de aliados e cadência de aliados (a mesma lista da versão original, que foi removida em outra rodada). (8) **Gráfico de scale por técnica** (referência do vídeo enviado): cada técnica aprendida agora mostra o bloco **"Crescimento por nível · dano por golpe"** — barras do nível 1 até o nível atual com o dano exato de cada nível (passar o mouse: "Nv. X · Y"). O vídeo serviu de referência visual desse painel de crescimento — anotei tudo (painel da habilidade, barras por nível, upgrades por raridade, bloco UTILITY da pausa) no contexto arquivado **fora do projeto** (pasta arquivada na raiz do workspace, com os frames do vídeo), e nenhum nome ou valor do material de referência entrou em código, docs ou repositório. (9) **Treinamento esgotado = somente Sorte**: quando não resta técnica nem pílula para evoluir, o level-up agora sobe **somente a Sorte (+0,8% extra)** — antes era atributo aleatório; alinhei o código com a sua regra. (10) **Git**: commit + push feitos neste repositório, como pedido, até você trocar o repositório. (11) **Andar livre enquanto ataca: SIM, já implementado** — na rodada 33 (commit `4d1e798`): com o ataque normal você continua andando fazendo os movimentos; a Ultimate mantém a pose especial. **TESTADO**: `tsc -b`, `vite build`, `verify-rules` (56/97/95) e `verify-runtime` (Edge headless, todos os checks verdes, sem exceções JS nem assets 404).

## Rodada 35 — mega-lote: HUD/menu, personagens, sons, scale, caça-níquel, pílulas, mapa, planner · 12/11/2026

> **Pedido (texto integral das linhas novas da rodada; as linhas anteriores da mesma mensagem são reenvios das rodadas 23–34 já registradas acima):**
>
> "Outra coisa, você consegue acessar o Youtube, baixar o áudio, apenas áudio dos vídeos para copiar os ataques?"
>
> "Exemplo de vídeo YOOOO: https://www.youtube.com/shorts/weeVe4Kpsek
> Ao clicar no botão 'Jogar' (para jogadores conectados) que seria o mesmo 'Jogar como convidado' (para jogadores guests), esse áudio deveria tocar. Ou apenas a parte do YOOOOOOOOO!
> efeitos de som para invocar jutsus: https://www.youtube.com/watch?v=xPgMmsJfrgY
> exemplo efeito kage bunshin: https://www.youtube.com/watch?v=aEQIi0drDhY
> Outros sons você tem a liberdade para pesquisar no youtube e baixar se CONSEGUIR, se você não conseguir ou precisar de autorizações demais, me avise que eu mesmo faço manualmente os downloads, coloco em uma pasta e você distribui.
> Sons que você não achar o Jutsu! você coloca https://www.youtube.com/watch?v=xPgMmsJfrgY como padrão.
> Porém, terá uma regra... para não acontecer sound spam, você vai colocar um delay de só permitir soltar o som, quando terminar o áudio do outro.
> Não funcionará exatamente como uma fila, porque se não uma hora vai encavalar tantos aúdios que vai acabar a run e ainda vai ter áudio reproduzindo (risos)."
>
> "Nós colocamos a questão de não 'travar' o personagem ao atacar, porém acabou 'bugando' a animação de ataque. O personagem 'perdeu' a animação que tinhamos de atacar, isso não é para acontecer. Se não for possível manter essa animação, eu prefiro que deixe como está, mas acredito que tenha sim como."
>
> "Além disso, você consegue pelas folhas de caminhar dos personagens, fazer uma posição de movimentação para ele andar na vertical para cima de costas para a câmera e na vertical para baixo frente para a câmera?"
>
> "- Crie todos os kages que estão faltando até o arco do Shippuden, use as nossas referências para criar a movimentação, habilidades, folhas do personagem, me envie antes para eu validar se o conceito/escopo está bom, crie as habilidades focadas nas habilidades que eles demonstram no anime."
>
> "Você já tem skills e base, contexto suficiente para trabalhar em cima disso."
>
> "Crie os personagens que estão faltando do naruto clássico e naruto Shipudden, você sabe que precisa criar com suas respectivas evoluções desde a academia se tem histórico deles nas referências até a era Shippuden. Crie cada um com habilidades únicas, passivas únicas, enfim tudo que você sabe."
>
> "- Eu quero o gráfico de upgrade das habilidades level a level que possamos colocar o mouse e ver os dados cada level, o que você fez foi só colocar um gráfico pequeno aumentando os valores, sem mostrar valor."
>
> "Colocar na barra de vida, os pontos de HP."
>
> "- Escalonamento de monstros, elites, megas, bosses finais e aumento de poder do personagem, vou te enviar todos os vídeos que tenho até então referente ao jogo referência e você tenta fazer o scale." (6 vídeos anexados nesta rodada)
>
> "Troque as kunais e shurikens no chão, por pergaminhos, o scale deles funcionará dando ryu por zona pela sorte também."
>
> "Também estou enviando referências de mudanças nos huds de menu de todo o jogo, trabalhe neles e crie um para nós." (7 telas anexadas nesta rodada)
>
> "Pegue referências também do planejador de itens de missão, referente as fusões, para fazermos preparação, salvarmos as builds."
>
> "Há, outra coisa importante... os itens/pílulas não estão mostrando os upgrades que os itens estão dando nas habilidades, deveria aparecer os informativos nos pool de escolha quando aparece no jogo.
> Também verifique se está aparecendo para as vitaminas."
>
> "A Isca Shinobi deveria ser uma Vitamina e não um item.
> Verifique se tem um item parecido com a White Flaute do nosso jogo referência, que invoca mais monstros e da mais outros atributos de leveling/ryu."
>
> "- Veja a foto de uma run, late game do [jogo de referência]... estou enviando... veja e aplique para nosso modelo, use como espelho. (foto do whatsapp)."
>
> "- Ter botão glossário com o guia para explicar o que cada coisa faz e como buffar.
> - Note do lado direito o card da temporada, mostrando informações do ranking, colocação.
> - Contador de sequência em tempo real
> - Contador de abates totais
> - Itens com ícones canto esquerdo
> - Habilidades e pílulas lado direito
> - Ajustar bug do Caça-níquel, nome Caça-Níquel da Tsunade, quando clicar, aparecer na tela a Tsunade e um caça-níquel, faça a arte, faça ela feliz, triste ou nervosa, dependendo da recompensa, faça o caça-níquel cobrar mais por rodada, gradualmente... escalando consideravelmente.
> - Criar item/pílula para permitir % do caça-níquel cobrar menos (verificar se já temos no jogo)
> - Ao não ter nada para aprimorar habilidades/pílulas, só aprimorar aleatoriamente os atributos em 0,6 por nível...
> - Personagem ainda muito forte, muito atributo ou dano já inicialmente, precisa ser mais gradual - aqui é a parte do scalling criar um sistema para as dificuldades (eu realizo o teste da gameplay e vamos ajustando).
> - Monstros ainda muito fracos já estou com 6m de jogo e deletando o mapa sem dificuldade alguma...
> - colocar os limites de pílulas, padrão 9, com buff da conta 13, buff de item 15
> - Quando aparecer o pool de opções, poder ser possível escolher com os botões 1,2,3,4 das opções em tela (aparecer abaixo no card da opção do pool para respectiva opção).
> - Trabalhar melhor no mapa, cenário, abrir mais o mapa, está muito pequeno, monstros estão nascendo em lugares que o personagem principal não consegue ir."
>
> "Entendeu tudo que eu disse?
> Se organize me dê o retorno do que consegue e não consegue e eu vou autorizar o começo do trabalho na sequência."
>
> **Regras permanentes reafirmadas na mesma mensagem (já registradas acima, citadas de novo pelo usuário):**
> "Quero que você trabalhe nessas alterações, vou deixar você com revisão automática, ai você consegue aprovar os acessos necessários para alterar, certo?
> Porém, você SÓ PODE, SÓ TEM PERMISSÃO, para alterar os arquivos que estão na pasta C:\Shinobibonk projeto - Copia do computador, nada além disso, nada de alteração em windows.
> Se precisar acessar o navegador para testes, por fazer no edge ou no outro que estava fazendo, mas APENAS isso."
>
> "O que não for melhoria, for desenvolvimento novo e já estiver no jogo você desconsidera e no final, você vai me trazer uma lista do que desconsiderou."

### Resposta e providências (rodada 35 — PLANO, aguardando autorização)

Rodada de **plano e organização** — o usuário pediu o retorno **antes** de autorizar a implementação; **nenhum código de jogo foi alterado nesta rodada** (apenas arquivamento do material de referência, fila e documentação). O material novo (7 telas de HUD/menu + 6 vídeos) foi **consumido e arquivado FORA do projeto** (pasta arquivada na raiz do workspace: `CONTEXTO-COMPLETO.md` §9 + `prints/r35-naruto-ui-*.png` + `prints/frames-6-videos/`); zero rastro no repositório (skill `referencia-externa`).

**(1) O que entendi (resumo):** ver o plano completo enviado ao usuário nesta resposta — 28 itens: escopo/permissoes (só `C:\Shinobibonk projeto - Copia`, navegador apenas para testes, aprovação automática); regra de descartar "desenvolvimento novo que já está no jogo" + listar os descartes; Kages ausentes (conceito para aprovação ANTES de criar); elenco clássico/Shippuden com evolução por era; lista de personagens com referência sólida; sons (YOOOO no Jogar, jutsus com default, anti-spam = "só quando o anterior terminar", usuário baixa os áudios e eu distribuo); regressão da animação de ataque ao andar; caminhada vertical frente/costas; HUD/menu no padrão das 7 telas (HP com números, glossário, card de temporada, streak em tempo real, abates totais, itens à esquerda, skills+pílulas à direita); Caça-Níquel da Tsunade (nome, arte feliz/triste/nervosa, custo subindo consideravelmente, desconto que já existe); treinamento esgotado = atributo aleatório +0,6%; balanceamento (jogador inicial menos forte, monstros mais fortes aos 6 min, escala por dificuldade — usuário testa e ajustamos); pergaminhos no chão (Ryu por zona + sorte); planner de fusões/builds com salvar; pool com prévia informativa de itens/pílulas + teclas 1–4; Isca Shinobi → vitamina; White Flute (já existe = Pílula de Incenso); foto do late game (NÃO chegou — reenviar); mapa maior + spawns alcançáveis. **(2) O que JÁ EXISTE (descartado, por regra do usuário):** HP com números (já está); teclas 1–N no pool (já está, 1–9); item que reduz custo da roleta (Dente de Ouro −8% + Carteira Gama-chan −6%, teto −40%); White Flute (Pílula de Incenso: +10% horda, +5% ameaça, +12% Ryu); YOOOO no botão Jogar (sintetizado — o arquivo real entra quando o usuário baixar); caminhada frente/costas (folhas direcionais já têm as duas — validar visualmente). **(3) O que CONSIGO:** tudo de código/animação/HUD/arte/balanceamento/planner + integração dos áudios baixados pelo usuário + build/verificações/commit/push. **(4) O que NÃO consigo:** baixar áudio do YouTube nesta sessão (sem ferramenta autorizada — o usuário baixa e me dá a pasta; eu distribuo/integro); a foto do late game não chegou (pedir reenvio). **(5) Personagens com referência sólida (aprovação pedida antes de criar):** Kages — Hiruzen (3º), Killer B (6º Raikage), A (5º Raikage), Onoki (2º Tsuchikage), Ao (2º Mizukage), Rasa (3º Kazekage), Naruto 7º Hokage (existem: Hashirama, Tobirama, Minato, Tsunade, Kakashi, Gaara). Clássico/Shippuden — Choji, Kiba (+Akamaru), Shino, Ino, Kurenai, Iruka, Sai, Yamato, Shisui, Obito, Hiashi, Hanabi, Kisame, Zabuza, Suigetsu, Mangetsu, Karin (Nagato = nuance: Pain já existe; Ebisu/Sete Espadachins menores = referência fraca, fora). **(6) Perguntas em aberto:** foto do late game; mecanismo do "buff da conta" nas pílulas 9/13/15; confirmação do treinamento 0,6% aleatório; aprovação dos conceitos dos Kages e da lista do elenco; pasta dos áudios; "consideravelmente" do caça-níquel (proposto ×1,7/giro); quanto abrir o mapa (proposto +30%); balanceamento por teste iterativo do usuário. Fila registrada em `docs/13` e direção em `docs/18` §2/§4/§5.

## Rodada 36 — 12/11/2026

### Pedido integral do usuário

> "Lembre-se nossas referências que de outros jogos, exemplo as que eu te enviei, não podem ficar na pasta do projeto.
>
> E me diga se é possível executar um prompt deste de forma segura, em todo caso, crie um backup do projeto completo.zip fora da pasta do projeto também, ANTES de executar o seguinte prompt, isso se você acredita que ele funcionará bem
>
> Segue prompt's:
> **Prompt 1 — REGRA DE SEGURANÇA PARA EXECUÇÃO AUTÔNOMA:** trabalhe exclusivamente nas pastas autorizadas; não modifique/exclua/mova/sobrescreva fora delas; nada de comandos destrutivos/instalações/alterações de Windows; preserve integralmente todos os contextos originais; antes de reorganizar documentos, crie e verifique backups; durante a execução autônoma, somente operações não destrutivas de leitura, criação de documentos segmentados, índices e relatórios; se uma operação exigir acesso fora das pastas autorizadas ou apresentar dúvida de segurança, interrompa e aguarde aprovação; ausência de resposta não é autorização; ao finalizar, apresente arquivos criados/modificados, verificações e pendências.
> **Prompt 2 — SHINOBIBONK: SEGMENTAÇÃO SEGURA DE CONTEXTO, SEM PERDA DE INFORMAÇÕES:** (DIRETRIZ PRINCIPAL) organizar o contexto existente em Markdown segmentado preservando integralmente TODAS as informações; NÃO APAGAR, NÃO DESCARTAR, NÃO SUBSTITUIR, NÃO RESUMIR DE FORMA DESTRUTIVA; não reimplementar sistemas, não modificar código do jogo nem assets. (1) Preservação: inventário com caminhos reais; backup integral imutável em área apropriada sem sobrescrever; hashes quando possível; preservar estrutura. (2) Contexto geral ativo: preservar tudo, seguir disponível integralmente, receber atualizações, apontar para os segmentados; **não deve ser substituído por resumo curto**; se composto por vários arquivos, manter a estrutura e **criar índice agregador, sem exigir consolidação física**. (3) Segmentação por domínio (exemplos: scaling/fórmulas, atributos, personagens, habilidades, itens, status, economia, missões, inimigos/chefes, mapas, selamento, arte, ComfyUI, animações, performance, arquitetura, histórico) — **não criar duplicados quando já existir documentação equivalente**. (4) Preservação do conteúdo: valores/fórmulas exatos, nomes, regras aprovadas, hipóteses com estado, exceções, referências cruzadas, histórico; não inventar; área de classificação pendente para o que não categorizar. (5) Rastreabilidade obrigatória: origem/destino/seções/estado/datas/dependências + **manifesto de migração**; não declarar preservação sem verificar. (6) Validação: inventário × preservado, integridade do backup, destino de cada bloco, valores/fórmulas, duplicações, links, recuperação para tarefas reais, registrar falhas; não marcar validada com trechos sem destino. (7) Recuperação seletiva: índice central → domínio → segmentados → dependências → código; **obrigatório consultar o contexto geral** quando incompleto, conflitante, multi-sistemas, dúvida de decisão ou investigação completa; **não limitar investigação para economizar tokens**. (8) Atualização contínua após cada alteração: segmentados + geral + índice + histórico; **sincronizados**; falhou em qualquer parte → registrar inconsistência; decisão nova substitui anterior **registrando a substituição**. (9) Conflitos: não escolher arbitrariamente, não apagar versão, diferenciar datas, **código real = estado implementado**, documentação aprovada = intenção; sem evidência, esclarecer. (10) Integração com QWEN/Codex: preservar instruções/skills existentes; não substituir AGENTS.md/QWEN.md sem verificar conteúdo; adicionar só o necessário; não afirmar operações não realizadas. (11) Referências visuais: **usar prioritariamente os personagens/spritesheets já criados no ShinobiBonk**; preservar identidade chibi 2.5D; não recriar por texto quando houver referência visual. (12) Execução em fases A–F (inventário/backup → proposta → criação sem remover → referências/índice → validação → ativação de regras). (13) Relatório final com estados CONFIRMADO/PROPOSTO/IMPLEMENTADO/VALIDADO/PENDENTE. REGRA FINAL: a segmentação não pode ser destrutiva; o contexto original preservado; o geral ativo continuando a ser atualizado; os segmentados como organização complementar."

### Resposta e providências (rodada 36 — segmentação executada de forma adaptada e não destrutiva)

**(0) Regra de referências reafirmada (pedido do usuário):** material de outros jogos **nunca** fica na pasta do projeto — verificado: `<pasta arquivada>/` (prints, vídeos, frames, `CONTEXTO-COMPLETO.md`) está na **raiz do workspace, fora do repositório**; 0 arquivos rastreados mencionam o jogo de referência; regra agora permanente em `docs/19` (regra 6) + skills `referencia-externa`/`contexto-e-decisao`.

**(1) Segurança do prompt (pergunta do usuário):** SIM, é possível executar de forma segura — o prompt é **não destrutivo** (leitura + criação de documentos novos, dentro da pasta autorizada, sem tocar código/assets/Windows, com parada em caso de dúvida). **Adaptações fiéis ao próprio texto do prompt:** (a) §2 do prompt autoriza manter a estrutura existente + **índice agregador** → não recriamos 15+ documentos duplicados (evita fonte de verdade paralela — risco que o próprio prompt quer evitar); (b) "QWEN.md" e "ComfyUI" **não existem neste projeto** — equivalentes: `AGENTS.md` + `skills/` e skill `criar-arte-shinobibonk` (registrado no manifesto);

**(2) Backup integral ANTES de qualquer alteração (pedido do usuário):** `backup-ShinobiBonk-2026-11-12.zip` na **raiz do workspace (fora da pasta do projeto)** — 980 MB, **2.882 arquivos** (exatamente a contagem do projeto sem `node_modules`), 0 entradas de `node_modules`, **hashes SHA-256 conferidos** em amostra (CHANGELOG.md e AGENTS.md extraídos do zip = idênticos ao original). `node_modules` excluído de propósito (regenerável via `npm ci`); `.git` (histórico completo) **incluído**.

**(3) FASES A–F executadas:** (A) inventário de contextos (14 docs + 6 skills + AGENTS.md + CHANGELOG) + backup validado; (B) estrutura modular proposta = índice + só os domínios ausentes; (C) **3 documentos novos criados (aditivos, zero remoção):** `docs/19-INDICE-DO-CONHECIMENTO.md` (índice agregador: mapa de 19 domínios → doc + código, regras de manutenção, manifesto de migração, validação), `docs/20-SCALING-EREGULAS.md` (TODAS as fórmulas/valores lidos do código em 12/11: dificuldades, escala por tempo com tabela Genin, zonas, Final Swarm, atributos, GROWTH_ROLLS, roleta, pílulas, drops, mundo, F9) e `docs/21-ELASTAO-DE-HEROIS.md` (24 famílias + 32 versões + fila de novos com estados); (D) referências cruzadas + `AGENTS.md`/`docs/18` apontando o índice; (E) validação: git mostra apenas **aditivos** + atualizações de sync; nenhum código/asset alterado; nenhum contexto original apagado; todos os blocos novos com origem e estado; 2 domínios do prompt registrados como **NÃO APLICÁVEL** (QWEN.md/ComfyUI) no manifesto; (F) **skills atualizadas**: `contexto-e-decisao` (índice é o 2º passo da leitura + regra sem duplicar) e `documentar-projeto` (regra de manter docs/19-21 sincronizados + registrar inconsistência se falhar).

**(4) Relatório final (padrão do prompt §13):** originais identificados ✓ (mapa em docs/19); backup localização+integridade ✓ (raiz do workspace, hash validado); estrutura modular ✓ (docs/19-21); manifesto ✓ (tabela em docs/19); não classificados ✓ (nenhum); divergências ✓ (nenhuma nova — as pendentes seguem em docs/13); verificações ✓ (contagens + hashes + git aditivo); regras de atualização ✓ (skills); limitações ✓ (QWEN/ComfyUI inaplicáveis; valores de balance são foto de 12/11 — docs/20 manda atualizar ao mudar). Estados: IMPLEMENTADO (docs/19-21, skills, backup), VALIDADO (backup), PROPOSTO (nada novo nesta rodada). GitHub: commit + push desta rodada.

## Rodada 37 — 12/11/2026 (AUTORIZAÇÃO GERAL + novas specs de HUD, caça-níquel, itens, pílulas, personagens, sons e arte)

### Pedido integral do usuário

> "Pergunta: Consegue criar imagens, animações, modelos, folhas de animação usando referências e copia-las e implementar as particularidades para cada novo personagem?
> Pergunta: Para eu te deixar trabalhando a noite toda e ir dormir, eu preciso te dar autorização completa, para não aparecer os pop-ups de autorização? Lembrando que não é para você fazer nada descontrutivo, destrutivo, rodar nada que altere windows/registro do windows, enfim... Eu já te enviei prompt's referente a isto...
>
> Todas as HUD's do jogo devem ser recriadas e baseadas no tema Naruto/Ninja/Japonês... para manter uma identidade visual/única e relacionada ao tema Naruto, você tem inspirações para isso.
>
> Eu já disse para você NÃO me enviar mensagens em inglês, sempre TODAS em português, eu quero saber o que você está fazendo, mas sempre enviar em português pt-br.
>
> O scale é influenciado pelos itens/eventos de dificuldade existentes no jogo! Também pelo tempo na RUN do jogo, ou seja quanto mais tempo vivo, mais monstros, mais dificuldade, totalmente progressivo, porém o personagem também terá chance de scalar, mas é um roguelite, o objetivo é ganhar level/atributos ter itens, para sobreviver o máximo possível, não existe run infinita, sempre os monstros vão evoluir, o desafio é sobreviver o máximo de tempo possível.
>
> O item que conhecemos no jogo referência como "Max Revive" deverá se chamar "Chakra de Hagoromo" e o outro que seria apenas "Revive" na referência, no nosso jogo deveria ser Células de Hashirama, ter arte/ícone dos itens exclusiva para ambos.
>
> Lembrando das regras que colocamos para os contextos segmentados e manter o contexto original atualizado, tudo se manterá atualizado, o que vai acontecer? Ao mexer em scale, ele vai ler o nosso arquivo segmentado e vai pesquisar com palavras chave no contexto total, caso não funcione, ele vai ler todo o contexto segmentado, todo o contexto total para entender TUDO que já foi feito relacionado ao scale e trabalhará em nova tratativa.
>
> Pergunta: Quando deu erro, ele conseguiu recuperar tudo que estava planejando/fazendo e seguir com segurança a configuração das orientações e prompt?
>
> O que seria o criar-arte-shinobibonk? Se for relacionado a ícones/personagens/hud visual, pode usar de referência, temos que manter a nossa identidade também.
>
> Respostas das perguntas que ficaram em aberto:
> Barra de HP no pé do personagem que quero com o número para fácil visualização.
> Caça Níquel deve ter: Emboscadas com armadilhas shinobi, papéis bomba, arma ninja utilizada no anime, explodiram ao redor do personagem matando os monstros ao redor do personagem, quando estiver em interação nele você não toma dano dos monstros, mas recebendo os itens e selecionando ao sair, os monstros já começam a "hitar".
> Buffs/debuffs do caça níquel: Fará um caça níquel tendo que acertar na roleta 3 itens do mesmo, ficaram roletando ao acionado.
> 3 Tsunades - Sorte da Tsunade - Dificuldade aumentada em 10% + 10% de monstros
> 3 Jirayas - Item raro ou superior
> 3 Hiruzen Sarutobi - 4 escolhas de itens aleatórios
> 3 Hidan - Perde 5% da vida total + 5% dificuldade + 5% monstros
> 3 Kakuzu - Bônus em dinheiro condicionado pela sorte + dificuldade do jogo
>
> A White Flute é um item no caso você colocou como pílua de Incenso, troque. E a pílula que da %Dificuldade, %Ryu, %experencia se mantem.
>
> As folhas direcionais não tem as folhas andando pra cima/baixo, só na diagonal, quero que você faça frente e costas, siga os modelos de criação do projeto não vá arruinar o trabalho até aqui...
>
> Sons: Você vai conseguir baixar o som dos vídeos do Youtube que eu te enviei? Se não conseguir tudo bem.
> https://ytmp3.yt — Você pode usar esse site para fazer os downloads, tome cuidado, você precisa desviar das armadilhas do site. Ao colar o link dos sons, você será enviado para uma página diferente com os modelos, você só irá descer a página e achar o botão Download MP3, abaixo o nome do vídeo. Conforme enviado na referência (salvar a print fora do projeto)
> [print do ytmp3.yt com a lista MP3 79.89 KB Original ... 64 Kbps e o botão verde "Download MP3" — arquivar FORA do projeto]
> [áudio enviado: "the yoo sound of naruto [weeVe4Kpsek].mp3" — 86 KB — "Exemplo do som que eu baixei lá."]
> Se possível começar o áudio após o tempo: 01segundo, preciso que corte ele pra mim e já integre ao jogo.
>
> Entendeu?
>
> As referencias do whatsapp eu criei uma pasta C:\Shinobibonk projeto - Copia\<pasta arquivada>\fotos lategame — Pode consumir: Acredito que você consiga entender e interpretar tudo, inclusive como aparecer os buffs que as habilidades estão recebendo por itens/pílulas somados, esses efeitos tem que refletir dentro do jogo também!
> Glossário
> Atributos no estágio do game
> Respectivos efeitos do que cada vitamina (jogo referencia) no nosso caso pilula esta fazendo
> Mostar % de mega crítico após atingir crítico 100%, lembrando a regra do mega-crítico.
> Alfas de apoio, são os ninjas que selamos... acho que deu pra entender, coloque-s mostrando os buffs, inclusive as nossas particularidades por combar ninjas de facção/aldeia/família.
> Esses Hokages estão bons, mas pode criar também desde os primeiros Kages de cada vila até o Shippuden, pode pesquisar na NarutoWiki para encontrar e parametrizar suas particularidades/visual e fazer a criação.
> Buff de conta são aqueles que desbloqueamos por Lamen, temos uma sessão para isso, as "Passivas Shinobi" tem que funcionar ao desbloquearmos no menu de Passivas Shinobi, no começo de jogo temos que receber os buffs.
> Você criará também o Tobi, tem o Tobi da Akatsuki e a outra versão dele, pesquise em Naruto Wiki.
> Claro que você vai criar o Nagato, tem fonte para você pesquisar sobre. O Yahiko é o PAIN, o Nagato é outro personagem, reveja.
> Se possível também criar habilidades únicas para o Nagato, já que ele usa as barras de chakra lá, Yahiko/Pain também deve ter em seu kit, assim como os "Tensei". Fazer o Yahiko ter o kit com as barras e os "Tensei" as habilidades que ele mostra. Já o kit do Nagato, você fará com os Tensei + Invocação dos Pain's que ele tem, os caminhos de Pain.
> Vai conseguir criar as artes dos Menus e aplicar?
> Aprovo os Kages
> Aprovo o Elenco Tier A
> Ok pasta com áudio, já inclua este que enviei no "Jogar".
> Pode colocar esse caça níquel, mas ele deve escalar cada vez mais, assim como o ryu dropado pela dificuldade do mapa/zonas."

### Resposta e providências (rodada 37 — AUTORIZAÇÃO concedida; início da implementação)

**(1) Perguntas respondidas:** (a) **Criar imagens/animações/modelos/folhas com referências e particularidades por personagem: SIM** — pela receita do projeto (skill `criar-arte-shinobibonk` + `movimentar-shinobi`), referenciando os 56 sprites já criados (identidade chibi 2.5D, paleta/proporção únicas) e usando a fonte canônica Naruto Wiki/Narutopedia para particularidades de cada personagem; (b) **Autorização total para a noite: SIM, já está concedida** (rodada 35) — trabalho restrito a `C:\Shinobibonk projeto - Copia`, nada destrutivo, nada em Windows/registro; dentro do escopo **não há pop-ups de autorização**; as únicas exceções seriam origem externa no navegador (ytmp3.yt) e escrita fora do workspace — e não preciso das duas (o YOO já chegou); (c) **Fluxo do contexto segmentado ao mexer em scale: EXATAMENTE como o usuário descreveu** — índice (`docs/19`) → doc do domínio (`docs/20`) → busca por palavra-chave no contexto total (`docs/14`/`docs/18`) → se não resolver, leitura integral dos segmentados + contexto total → nova tratativa → atualizar segmento + índice + registro (regras em `docs/19` + skill `contexto-e-decisao`); (d) **O erro anterior (docs/18): SIM, recuperado com segurança** — a edição falhou de forma **atômica** (nada foi aplicado), reli o arquivo, refiz corretamente, validei e publiquei (commit `3611f26`); nada se perdeu; (e) **`criar-arte-shinobibonk` = a skill de arte do projeto** (receita da pixel art chibi 2.5D, atlases, itens/pílulas, animação) — **SIM, será a referência** para ícones/personagens/HUD, mantendo a identidade; (f) **Baixar áudio do YouTube: vou tentar via ytmp3.yt (autorizado)**; se não conseguir, o usuário baixa e entrega a pasta (como fez com o YOO) e eu distribuo/integro — anti-spam: o próximo som só toca quando o anterior TERMINAR (não é fila);

**(2) Aprovações do usuário (valem como decisão):** (a) **Kages APROVADOS** — incluindo "desde os primeiros Kages de cada vila até o Shippuden" (corrigir numeração canônica: A = 3º Raikage, Killer B = 4º Raikage — o plano 35 tinha 5º/6º errado; pesquisar na NarutoWiki para particularidades/visual); (b) **Elenco Tier A APROVADO**; (c) **YOO MP3 APROVADO para o botão "Jogar"** (corte a partir do 1º segundo); (d) **Caça-Níquel APROVADO** com **custo escalando cada vez mais, como o Ryu dropado pela dificuldade da zona**; (e) **HUDs recriadas no tema Naruto/Ninja/Japonês** (identidade visual única); (f) **folhas direcionais frente/costas** (andando pra cima = costas, pra baixo = frente) — seguindo o modelo de criação do projeto;

**(3) Novas specs aprovadas (rodada 37):** (a) **Renomear itens de reviver** (única arte/ícone para cada): "Pergaminho de Ressurreição" (35%) → **Células de Hashirama**; "Rinne Tensei" (60%) → **Chakra de Hagoromo**; (b) **White Flute = ITEM novo** (atrai horda maior + mais Ryu/leveling), **não** é a Pílula de Incenso — e a **Pílula de Incenso MANTIDA** (é a pílula de %dificuldade/%Ryu/%horda); (c) **Teto de pílulas: padrão 9 · buff de conta 13 · buff de item 15** — "buff de conta" = **Passivas Shinobi** (comprada com Lamens no menu Passivas Shinobi) **deve aplicar o buff no começo da run**; (d) **Caça-Níquel da Tsunade**: 3 iguais na roleta — **3 Tsunades = "Sorte da Tsunade" (+10% dificuldade + 10% monstros)** · **3 Jirayas = item Raro ou superior** · **3 Hiruzen Sarutobi = 4 escolhas de itens aleatórios** · **3 Hidan = perde 5% do HP total + 5% dificuldade + 5% monstros** · **3 Kakuzu = bônus de Ryu condicionado por sorte + dificuldade**; **emboscada invertida**: armadilhas shinobi/papéis-bomba explodem ao redor do personagem **matando monstros ao redor** (jogador **seguro durante a interação**; ao sair, monstros voltam a acertar); (e) **Barra de HP no pé do personagem com número**; (f) **Glossário** no jogo (guia: atributos no estágio do game, efeito de cada pílula, **regra do mega-crítico** — mostrar % de mega crítico após atingir 100% de crítico); (g) **Alfas de apoio = ninjas selados** — mostrar no HUD com os **buffs que recebem** + **combinações por facção/aldeia/família**; (h) **Tobi ×2** (Akatsuki + a outra versão — NarutoWiki); **Nagato** (kit: Tensei + **Invocação dos Pain's** + caminhos de Pain) e **Yahiko = PAIN** (kit: **barras de chakra** + Tensei) — **correção do usuário: Yahiko é o Pain; Nagato é personagem separado** (o plano 35 tinha "Pain" como família única — revisar); (i) **treinamento esgotado = atributo aleatório +0,6%/nível** (decisão 12/11, substitui "somente Sorte"); (j) **scale progressivo**: influenciado por itens/eventos de dificuldade + **tempo de RUN** (quanto mais tempo vivo, mais monstros/dificuldade; roguelite: monstros sempre evoluem; não existe run infinita);

**(4) Estado da execução (nesta sessão):** registro completo (docs/14/18/13/20/21) → implementação em fases: som YOO (MP3 real, corte 1 s) + anti-spam de jutsu → regressão da animação de ataque+caminhada → Caça-Níquel (renomear + 3 iguais + armadilha + custo escalado + arte) → itens (renomear reviver + White Flute + teto 9/13/15 + Isca Shinobi → pílula) → HUD tema Naruto (HP no pé com número, streak, abates, itens à esquerda, skills+pílulas à direita, glossário, alfas com buffs) → balance (jogador inicial mais fraco, monstros fortes aos 6 min, pergaminhos no chão, mapa maior + spawns alcançáveis) → personagens novos (Kages + Tier A + Tobi ×2 + Nagato + Yahiko, com kits únicos) → folhas frente/costas → arte de menus. **Kankuro segue RESOLVIDO (não tocar).**

### Fase 1 — CONCLUÍDA (commit `d05f168`, push em `main`)

- **O que foi feito:**
  - `public/assets/audio/yooo.mp3` — MP3 real do usuário (86 KB) copiado do scratchpad para o repositório (arquivo **novo**, rastreado por nome; `git add -u` + `git add public/assets/audio/yooo.mp3`, **nunca** `git add -A`).
  - `src/audio/sfx.ts` — `playYooo()` reescrita: reproduz o MP3 com `clip.currentTime = 1.0` (offset de reprodução = corte de 1 s pedido; ffmpeg indisponível no host, então o "corte" é feito no playback — efeito funcional idêntico); volume respeita `settings.volume * settings.voiceVolume` + `muteInBackground`; fallback sintetizado (`yoooFallback()`) dispara se o `play()` rejeitar ou lançar. `main.tsx` já chamava `playYooo()` no fluxo Jogar/Jogar-como-convidado (linhas 136/138) — sem mudança lá.
  - `src/audio/sfx.ts` — `jutsuGate()` no `playTechniqueSound()`: o próximo som de jutsu só toca quando o anterior **terminou** (regra do usuário: anti-spam, **não fila**); cada efeito registra o fim previsto (`length` + margem); quando uma fala em voz toca, o gate estende +2400 ms (duração estimada de fala curta em japonês).
- **Validações (re-executadas nesta sessão, pós-compaction):** `tsc -b` ✓ · `vite build` ✓ (425 ms, rolldown) · `verify-rules` ✓ (roster 56 · motionForms 56 · techniques 97 · items 95).
- **Commit:** `d05f168` "Rodada 37 fase 1: YOO MP3 real no Jogar (corte 1s) + gate anti-spam de sons de jutsu" → `git push origin main` ✓.
- **Próxima:** Fase 2 — regressão da animação de ataque + caminhada (`src/game/playerMotion.ts`).


## Rodada 38 · 12/11/2026 — Subagentes 1/2/3: animação, ABRIR_JOGO + HUD ninja, novos shinobis

> Subagente 1
> Verificar toda a documentação/skills/github.
>
> * Corrigir a animação dos personagens, eu coloquei nas ultimas alterações o personagem continuar andando enquanto ele está se movendo, porém isso "bugou" a animação do personagem bater. Resolva este problema, ele tem que andar liso atacando, mas a animação de movimentação dele levantar os braços e usar o hit, tem que continuar fluído.
>
> Subagente 2
>
> * Corrigir a questão do ABRIR_JOGO não estar abrindo o jogo, aparentemente porque mudei a pasta de lugar/nome.
>
> Aplicar as alterações de huds que você fez, mas colocar mais imagens de fundo no menu inicial.
>
> Subagente 3
>
> Crie todos os kages que estão faltando até o arco do Shippuden, use as nossas referências para criar a movimentação, habilidades, folhas do personagem, me envie antes para eu validar se o conceito/escopo está bom, crie as habilidades focadas nas habilidades que eles demonstram no anime.
> Você já tem skills e base, contexto suficiente para trabalhar em cima disso.
> Crie os personagens que estão faltando do naruto clássico e naruto Shipudden, você sabe que precisa criar com suas respectivas evoluções desde a academia se tem histórico deles nas referências até a era Shippuden.
> Crie cada um com habilidades únicas, passivas únicas, enfim tudo que você sabe.
> Me liste os personagens que vai criar.

(Complemento da mesma rodada: o limite de uso interrompeu os três subagentes; retomados após o reset.)

### Resposta e providências (Claude Code)

- **Subagente 1 — animação (IMPLEMENTADO/TESTADO headless):** causa = `showAttack` desligado com input de movimento desde 4d1e798; agora o golpe toca os quadros da folha também andando, com passada nas pernas do quadro de ataque e retorno sem pulo; encadeamento a partir de 75% (`CHAIN_AT`). Verificado em fixture e no jogo (Naruto Academia, Sasuke Genin, Rock Lee, Naruto Shippuden). Auditoria: 0 ocorrências do nome do jogo de referência nos arquivos rastreados, nada sensível rastreado; ponteiros `.claude/skills` criados; divergências de docs corrigidas nesta rodada (docs/00, docs/12, README).
- **Subagente 2 — ABRIR_JOGO + HUD (IMPLEMENTADO/TESTADO headless):** `node_modules` reinstalado (a mudança de pasta quebrou os atalhos do pnpm); .bat refeito com detecção e reinstalação automática. HUD ninja aplicada ao jogo; menu com as 4 vilas alternando no fundo e marcos em camadas; fontes OFL locais. Capturas: `docs/previas/hud-ninja/jogo-*.png`.
- **Subagente 3 — proposta (PROPOSTO, nada implementado):** `docs/22-PROPOSTA-NOVOS-SHINOBIS.md` (renomeado de 19 para não colidir com `docs/19-INDICE`). Lista: Hiruzen, Rasa, Mei, Ōnoki, A (4º Raikage), A (3º Raikage), Mū, Gengetsu, Yagura, Killer B, Danzō (Onda K); Kiba+Akamaru, Shino, Ino, Chōji, Sai, Yamato, Zabuza, Haku (Onda 1); Akatsuki/Som (Onda 2); Taka e apoio (Onda 3); Kages sem nome/sem combate como NPC (Onda 4). Totais K–3: 40 famílias, 59 versões, ~93 técnicas únicas, 118 folhas. **Divergência canônica** com a lista aprovada na rodada 37 (Narutopedia): Killer B não foi Raikage (o 4º Raikage é A; o 3º também se chama A); Hanzō não foi Tsuchikage (líder da Chuva; 1º Tsuchikage = Ishikawa); Mei é a 5ª Mizukage (1º = Byakuren); Ōnoki é o 3º Tsuchikage (2º = Mū); Rasa é o 4º Kazekage; Ao não foi Mizukage (2º = Gengetsu). Aguardando o usuário revisar antes de alterar personagens.
- **Testes:** `tsc -b`, build, `verify-rules` (56/97/95), `verify-motion-atlases` (56/560/0 erros), `verify-runtime` (58 verificações, 0 erros, 0 404).

### Integração com a implementação paralela (Bionic — rodada 37, fase 2)

- O agente do Bionic, em sessão paralela, resolveu **a mesma regressão** (golpe invisível ao andar) com uma abordagem alternativa: **camada sobreposta** (`attackLayer`) em `playerMotion.ts` — sprite extra com os quadros do golpe por cima do corpo em caminhada + clonagem de texturas compartilhadas (Asuma/Gaara) + prioridade selo > Asuma > kunai da academia > ação > cast. Validações locais verdes (`tsc -b` · `vite build` 454 ms · `verify-rules` 56/56/97/95 · `verify-runtime` sem erros/404) + evidência visual headless (andando + golpe ativo).
- **Estado final (decisão de integração, 12/11):** a implementação da **rodada 38 (commit `fd79ced`) é a adotada** — animação do golpe **inteira** no sprite base (corpo completo) com a passada continuando nas pernas via `playerPose`, **encadeamento** de golpes a partir de 75% (`CHAIN_AT`, fim do "piscar" em builds de velocidade de ataque), exceções preservadas (Ultimate, chute de Lee/Guy, Gaara), vale para jogador/ajudantes/clones/mega elites + `verify-motion-atlases`. A camada sobreposta do Bionic foi **descartada** (menos completa: não continha encadeamento nem passada sobre o quadro de ataque) mas **preservada** na branch **`backup-r37-fase2-overlay`** (commit `841f5bd`) — recuperável se o usuário preferir comparar as duas visuais.
- **Sem perda de trabalho:** a fase 1 (YOO MP3 + gate anti-spam, `d05f168`/`7f8e564`) permanece no histórico de ambas as linhas; nada do trabalho do Bionic foi deletado, apenas não adotado como estado final.

## Rodada 37 · Fase 3 — Caça-Níquel da Tsunade (Bionic, 12/11) — CONCLUÍDA

**Pedido (specs aprovadas, docs/13 §specs 5):** renomear "Roleta da Tsunade" → **Caça-Níquel da Tsunade**; **combos de 3 iguais** (Tsunade/Jiraiya/Hiruzen/Hidan/Kakuzu com os efeitos exatos do usuário); **emboscada invertida** (armadilhas shinobi/papéis bomba explodem ao redor do jogador matando os monstros próximos; jogador seguro durante a interação; horda retoma ao sair); **custo por giro subindo gradual e considerável, escalando como o Ryu por zona**; **arte da Tsunade feliz/triste/nervosa** conforme a recompensa.

**Decisões de implementação (Bionic, documentadas ANTES do código — docs/13 "Decisões de implementação"):**
1. **Visual = 3 rolos** substituindo a roda (pedidos do usuário: "3 itens do mesmo... ficaram roletando"). Motor de sorteio permanece de 1 casa por giro; os 3 rolos param no mesmo símbolo (aparência clássica de caça-níquel). Adaptação registrada — não é um RNG de 3 rolos independentes (evita definir um espaço de recompensas 2-iguais/misturadas não especificado).
2. **5 novas casas** no `ROULETTE_CASAS` com pesos premium baixos (bom) / peso 6 (Hidan, ruim) — Sorte (fator²) favorece os combos bons; pressão (maldição/zona/missão) pesa o Hidan. Clamps existentes (ruins em [15%, 60%]) seguem valendo.
3. **Efeitos dos combos** centralizados em `SLOT_COMBOS` (roulette.ts): Tsunade threat+0,10/enemyCount+0,10 (runBuffs, até o fim da run) · Jiraiya 1 item Raro+ (pool filtrado por raridade) · Hiruzen 4 escolhas de item · Hidan −5% HP (piso 1 HP — **não mata**, decisão do Bionic) + threat+0,05/enemyCount+0,05 · Kakuzu `round(120 × luckFactor × (1+pressão))` Ryu (`slotKakuzuRyu` testável).
4. **Segurança durante a interação = JÁ EXISTE**: o gate do frame do GameCanvas (`!roulette`) pausa a simulação com o overlay aberto — horda congelada, zero dano (verificado no código; não foi necessário invulnerabilidade extra).
5. **Armadilha ao sair** em `closeRoulette()`: inimigos a ≤ 8 m do jogador sofrem 3× HP (garante morte) via `takeDamage(...,'Armadilhas shinobi')` — conta como abate (kills, saque de elite). **Excluídos**: totem, bijuu e guardião (encontros com fluxo próprio; decisão do Bionic). Casa "Credores" (spawna inimigos) mantida.
6. **Custo**: `round(30 × 1,70^giros × 1,15^minutos × (1+(zona−1)×0,25) × (1−desconto))` — 1,35→1,70 (proposta do docs/13) + fator zona 0,25 (escala como o Ryu por zona, pedido do usuário). Descontos de itens mantidos (teto −40%).
7. **Face da Tsunade**: retrato existente do `shinobi-roster-v2.png` (índice 9) + **humor por recompensa** (bom → feliz · neutro → triste · ruim → nervosa) com badge/glow. **Arte dedicada das 3 expressões = PENDENTE** (sem pipeline local de geração nesta sessão; registrar para a fase de arte).
8. **Nomes dos itens** (Dente de Ouro / Carteira Gama-chan) mantidos; descrições atualizadas para "Caça-Níquel da Tsunade".

**Resposta final — fase 3 CONCLUÍDA (12/11, sessão Bionic):**
- **O que foi implementado:** renome para "Caça-Níquel da Tsunade" em toda a UI (título, toasts, nome do evento no mapa, descrições dos itens Dente de Ouro/Carteira Gama-chan); **3 rolos verticais** (repetições 3/4/5 · durações 900/1.150/1.400 ms · turbo 240/300/360 ms) parando no MESMO símbolo de cada giro; **5 casas novas de combo** (tsunade 0,9 · jiraiya 0,9 · hiruzen 1,2 premium · hidan 6 ruim · kakuzu 0,7) sorteadas no motor de 1 casa (Sorte favorece premium; pressão de maldição/zona/missão pesa o ruim; clamps ruins [15%, 60%] inteiros); **entrega dos 5 combos ao sair** (Tsunade/Hidan via `runBuffs` até o fim da run, como as trocas do Ebisu; Hidan com **piso 1 HP — não mata**; Jiraiya/Hiruzen via `drawComboItem` respeitando o limite máximo do item com `comboReserved`); **emboscada invertida** — a simulação pausa com o overlay aberto (jogador seguro, zero dano) e ao sair as **armadilhas shinobi** explodem em **8 m** do jogador matando os monstros próximos (`takeDamage` ×3 HP, conta abate/saque; totem/bijuu/guardião excluídos; som `explosion` novo); **custo** `round(30 × 1,70^giros × 1,15^minutos × (1+(zona−1)×0,25) × (1−desconto))` (descontos Dente de Ouro/Gama-chan, teto −40%, mantidos); **face da Tsunade** (retrato do roster) com humor por recompensa (bom → feliz 😄 · neutro → triste 😢 · ruim → nervosa 😠, badge + glow).
- **Arquivos alterados (commit `ec7c42a`):** `src/game/roulette.ts` · `src/scene/GameCanvas.tsx` · `src/ui/TsunadeRoulette.tsx` (reescrito) · `src/tsunade-roulette.css` (reescrito) · `src/audio/sfx.ts` · `src/game/catalog.ts` · `scripts/verify-rules.mjs`.
- **Validações (todas verdes nesta sessão):** `tsc -b --force` ✓ · `vite build` ✓ (428 ms) · `verify-rules` ✓ (boa chance sorte 0 = 30,88% · giro 4 = 251 · zona 2 = 38 · zona 3 = 45 · Kakuzu 120/240/480) · `verify-runtime` (Edge headless) ✓ — 0 exceções JS, 0 assets 404, todos os checks de gameplay (inclusive 3.359 inimigos no teste de performance).
- **Commits:** `ec7c42a` (código) + commit de sync de docs desta entrega → `main`.
- **PENDENTE:** (a) **arte das 3 expressões da Tsunade** (feliz/triste/nervosa) — por ora o mesmo retrato do roster + badge/glow de humor (a Tsunade **reage**, mas não são 3 artes distintas) — fila da fase de arte (skill `criar-arte-shinobibonk`); (b) **teste do usuário com GPU real** — calibração de custo/combos em iteração (regra da rodada 35).
- **Descartado nesta rodada (JÁ EXISTE no jogo — regra do usuário 12/11):** HP com números na barra (já existe no HUD) · teclas 1–N no pool (já existe) · desconto de custo (Dente de Ouro −8% · Carteira Gama-chan −6% · teto −40% — mantido na nova fórmula) · White Flute (a Pílula de Incenso já existe; o **ITEM novo** "White Flute" aprovado na rodada 37 segue na fila da fase 4 — Incenso se mantém) · YOOOO sintetizado (MP3 real integrado na fase 1, `d05f168`) · HUD base/arte de menu (parcial na rodada 38, `fd79ced`) · animação de ataque + caminhada (rodada 38, `fd79ced`) · Kankuro (já resolvido — não tocar).

## Rodada 39 · 12/11/2026 — Planner individual por personagem (salvo na conta), Fusões no planejamento, Táticas, tabela, buff verde/debuff vermelho, badges do pool e escala do personagem

### Pedido integral do usuário

> "Só que se lembre e pegue a referencia na nossa fonte de referência referente aos itens, pelos atributos, o que é o Incenso e o que é a Pilula.
> Deve ser individual por personagem e ficar salvo na conta! PRINCIPALMENTE quando tivermos login funcionando, já teste.
> Outra coisa, itens como este: [print de card de item com texto de efeito] O buff deve aparecer em verde, o debuff em vermelho na linha debaixo.
> [print do planner — abas Habilidades/Pílulas/Itens] Quero em estilo tabela esse menu, reestilize
> [print] Faça o mesmo para itens a reestilização em tabela
> [print] Faça o mesmo para habilidades a reestrilização, em tabela
> Nesse planejamento de missão, ter Habilidades/Pilulas/Fusões/Itens
> Lembre-se do que falamos das fusões, são fusões das habilidades, com as regras que criamos...
> Com os novos ninjas e mais habilidades DIFERENTES aparecendo com a particularidade de cada um...
> Apareceram novas habilidades por elemento de chakra, ou seja vai aumentar as habilidades liberadas de elementos para TODOS os personagens que temos liberados...
> Ainda em habilidades...
> [print do Chute Giratório bloqueado no planner] Um exemplo do chute giratório, colocamos ele em planejar para missão (arrumar pra = para) se tivermos o buff Treinamento com Jiraya, será possível clicar em Treinar e ganhar o buff, vai aparecer também no pool de escolhas no jogo
> Ajustar também ao Hud para caber na seleção do pool:
> Planejado para Missão - Somente para planejadas
> Requisito de Fusão - se for/tiver fusão selecionada
> Treinada - Se estiver treinada
> Para habilidades, temos um buff de conta que aumenta a % de dano de habilidades, isso é por NINJA!
> Ser possível em planejar missão, salvar "Tática de Missão" um botão por personagem.
> Agora faça uma lista da fila completa do que temos a fazer e me responda se preciso te dar acesso total sim ou não para você fazer tudo enquanto vou dormir.
> Alguns personagens estão de um tamanho parados(maiores geralmente) quando andam diminuem, deixar a mesma proporção para qualquer movimento do jogo!
> O único que vai crescer por enquanto será Choji ao utilizar JUTSU de Expansão!"

### Interpretação e providências (resposta e trabalho desta rodada)

1. **Incenso vs Pílula (referência):** na fonte arquivada (FORA do projeto, `CONTEXTO-COMPLETO.md` §1.2), as "vitaminas" do jogo de referência são cartas de level-up (Incenso Amaldiçoado +12% inimigos/+6% EXP/+6% ₽ → no nosso jogo = **Pílula de Incenso** `incenso` em `pills.ts`: +10% horda/+5% ameaça/+12% Ryu — **SE MANTÉM**); a **White Flute** (ref.: +12% inimigos/+10% EXP/+5 sorte) → no nosso jogo será o **ITEM novo "Flauta Provocadora"** (horda maior + Ryu/leveling + sorte) — **fila da fase 4** (itens/pílulas), ainda **não implementado**; o teto de pílulas aprovado (base 9 · buff de conta 13 · buff de item 15) também segue na fase 4 — hoje o código usa `PILL_MAX=10` + Cabaça +2 = 12.
2. **Plano individual por personagem + salvo na conta (TESTADO com o login local):** `planned` (antiga global `sb_planned_attacks`), itens em casa (antiga global `sb_archived_items`), prioridade (antiga global `sb_priority_items`) e listas da bolsa (antiga global `sb_bag_presets_v1`) passam a ser **por herói**, em `sb_planned_by_hero_v1` / `sb_home_by_hero_v1` / `sb_priority_by_hero_v1` / `sb_bag_presets_by_hero_v1` — com **migração de fallback** (a chave antiga é lida como seed do herói atual e nunca apagada). `trained` e "Não aprender" **já eram** por herói. A conta continua **local ao navegador** (`localProfile.ts`); quando o login online existir, o mesmo formato viaja com o save.
3. **Buff verde / debuff vermelho na linha de baixo do card:** `BuffText.tsx` agora também divide as cláusulas pela conjunção **" e "** — antes, "+50% de experiência e -10% de movimento" caía numa cláusula só (a regex negativa casava o `-10` e pintava tudo de vermelho). Agora cada efeito ganha o próprio tom (cores já existiam em `style.css`/`ninja-theme.css`).
4. **Planner em TABELA (3 abas):** o menu do planejamento (Habilidades · Pílulas · Itens) foi **reestilizado como tabela** (colunas: opção · origem/efeito · raridade/estado · ações) — pedido literal do usuário ("Quero em estilo tabela esse menu, reestilize" + "Faça o mesmo para itens" + "para habilidades"). Todos os comportamentos preservados: filtros, raridades, visões (Todos/Planejado para Missão/Não aprender), ★Treinar, "Colocar na bolsa ninja", "Não aprender/Permitir aprender" e o painel de detalhe (prévia da técnica, status da pílula, dados base).
5. **Nova aba FUSÕES no planejamento de missão:** pares de técnicas do pool do herói (sem setup/bloqueadas) com as **regras que criamos** (`techniqueMerge.ts`: **Fundir** = nova técnica Nv.1, dano = soma dos poderes, forma Área · **Combinar** = mantém as duas, dano ×1,5) — o par planejado (até 4 por herói, `sb_fusion_plan_by_hero_v1`) marca as técnicas com o badge **"⚗ Requisito de Fusão"** no pool do jogo; no workshop dos sapos a execução continua 1 uso por zona (regra existente).
6. **Novos ninjas → novas habilidades elementais para TODOS:** a mecânica já existe (`techniquePool` em `heroes.ts`: compartilhadas **por vila e por elemento**; únicas só após selar) — quando a fase 7 criar kits novos com habilidades elementais, elas entram no pool de todos do mesmo elemento **automaticamente**. Registrado como regra (docs/13/18/21) para os kits da fase 7 respeitarem.
7. **Chute Giratório + "pra" → "para":** textos do planner padronizados para **"Planejar para Missão"** / **"Planejado para Missão"** (era "pra"). O fluxo ★Treinar com Jiraiya (+15% de dano) já existia; o estado "Indisponível" de uma técnica = limite de bloqueios (`Não aprender`) esgotado para o herói — comportamento existente, sem mudança.
8. **Badges no pool de level-up (HUD):** o card da carta agora mostra **"★ Planejado para Missão"** (somente planejadas — já existia), **"· Treinada"** (+15% — já existia) e o **novo "⚗ Requisito de Fusão"** (se a técnica faz parte de um par de fusão planejado do herói).
9. **Buff de conta de dano de habilidades POR NINJA:** interpretado como consequência do item 2 — o plano/treino (e o +15% das ★) agora são **individuais por herói**, então o buff de dano de habilidades de cada ninja vale só para ele. **PERGUNTA EM ABERTO:** se o usuário quis um **buff novo** de conta (Passiva Shinobi por Lamens que aumenta % de dano de habilidades por ninja), responder na próxima rodada — fica registrado como PROPOSTO.
10. **Tática de Missão (1 por personagem):** nova seção no planner — **"Salvar Tática de Missão"** grava um preset nomeado por herói (até 4: `sb_tactics_by_hero_v1`) com snapshot {planejado · treinadas · itens em casa · prioridade · fusões planejadas}; lista com **Aplicar**/**Excluir**. Um botão por personagem (a tática segue o herói atual).
11. **Proporção do personagem em qualquer movimento:** medição por pixels (bbox alfa) mostrou que o "diminui" vem das **folhas de ataque action-v3** (personagem ocupa ~67–91% da célula, contra ~98–100% no repouso) — o código já usa escala fixa. Correção em `playerMotion.ts`: **normalização de escala por quadro** — mede o conteúdo do quadro em uso e do quadro de repouso do mesmo shinobi e aplica o fator (clamp 0,85–1,35) à altura/largura do sprite (os pés continuam ancorados); Gaara e Asumo são autoconsistentes (o repouso vem da própria folha → fator ≈ 1, sem mudança). **Exceção futura registrada:** Choji cresce com o Jutsu de Expansão (quando for criado, fase 7) — regra em docs/21/18.
12. **Pergunta do usuário — acesso total?**: **NÃO precisa** — a leitura+escrita dentro de `C:\Shinobibonk projeto - Copia` já está autorizada; as únicas coisas fora do escopo são o download de áudio do YouTube (o usuário baixa) e a pasta arquivada (leitura, já funciona). Nada em Windows/registro é necessário.

### Estado desta rodada

- **IMPLEMENTADO + TESTADO** (validações na entrada do CHANGELOG e no commit): itens 2–8, 10 e 11; item 1 = referência aplicada ao registro (a implementação da White Flute/teto 9-13-15 segue na **fase 4**); item 9 = **PERGUNTA EM ABERTA** (buff novo × consequência do plano por ninja).
- **Fila completa** (resposta ao pedido "faça uma lista da fila completa"): ver **docs/13** (rodadas 35–39 com estados) — resumo no retorno final ao usuário.
- **Descartado nesta rodada (JÁ EXISTE — regra do usuário):** seleção do pool por teclas 1–N (já existe nos cards, `kbd [1..9]`); buffs de itens/pílulas visíveis na RunSheet (já existe — `PillStatPreview`/`affectedTechniquesText`); "★ Planejado para Missão" + "Treinada" no pool (já existiam — o novo é o badge de fusão); treino com Jiraiya +15% (já existe — agora individual por herói); limite de "Não aprender" por herói (já existe) · Kankuro (resolvido — não tocar).

## Rodada 41 · 12/11/2026 — Marionetes únicas do Kankuro e do Sasori (Kuri + Kuroari)

**Pedido do usuário:** "Para Kankuro e Sasori, fazer criações de suas marionetes unicas, utilizar os arquivos de criação/arte/movimentação/assets/arte 2.5D para criar."

**Escopo (interpretação consolidada):** criar as marionetes **como entidades visuais no jogo** (folhas 2.5D chibi + movimentação + integração de gameplay), seguindo o pipeline do projeto. **Kankuro já está CORREGIDO** (usuário confirmou repetidamente) — a rodada 41 é **adicionar** marionetes, não refazê-lo.

### O que foi feito

1. **Arte — 4 folhas geradas com Pillow** (`scripts/generate-puppets.py`, ~551 linhas; arte programática na tradição do projeto — precedente `scripts/generate-sprites.mjs`):
   - `kuri-1-walk-v1.png` (1280×640) + `kuri-1-action-v3.png` (1280×1280) — **Kuri**, marionete de máscara de raposa do Kankuro (canon: o Kankuro usa marionetes de areia; a raposa é a mais icônica).
   - `kuroari-1-walk-v1.png` (1280×640) + `kuroari-1-action-v3.png` (1280×1280) — **Kuroari**, o escorpião vermelho (canon: marionete-assinatura do **Sasori**, usada pelo Kankuro no arco da 4ª Guerra Ninja).
   - Âncora de pés pela convenção do pack (`pack-sprite-atlas.ps1`, 305–310/320 — Kankuro referência ~319/320); fileiras frente/costas (walk) e 4 fileiras (action: ataque frente · ataque costas · pulo frente · pulo costas — mapa confirmado no `playerMotion.ts`).
2. **Kuri = companheira PERMANENTE do Kankuro (estilo Kiba+Akamaru)** — `GameCanvas.tsx`:
   - Spawn automático para qualquer versão da família (`familyOf(heroId)==='kankuro'` cobre kankuro / kankuro-shippuden / kankuro-alianca), escala ×0,85, segue em formação (ângulo 2,4 rad · raio 2,1) com **timer de ataque próprio** (não compartilha o `allyTimer` dos ajudantes).
   - Ataca com **"Agulhas de Kuri"** (`NPC_ALLIES.kuri` — Projétil · alcance 8 · recarga 1,5 s) via `castTechnique(ally=true)` — o veneno do Kankuro (`stats.poison`) é aplicado automaticamente no `hit()`.
   - **NÃO consome `supportSlots`**, **NÃO entra em `allies`** (não é substituível, não conta em afinidade/sinergia), sem barra de vida, silenciosa (regra: ataques de aliado não tocam som).
   - Sem alvo no alcance → retry leve (0,5 s) sem queimar o loop.
3. **Kuroari = entidade visual da técnica EXISTENTE "Kuroari"** (nos kits de Kankuro e Kankuro-Aliança) — `src/scene/kuroari.ts` (mesma receita do Gamabunta):
   - 4 quadros (preparo → ferrão erguido → estouro do ferrão → recuperação), fade in/out, avanço da marionete até o ponto de impacto (easing cúbico), sprite 1,7 world units, ciclo de vida no `visuals` (respeita a tecla H de esconder efeitos; `group.addEventListener('removed', …)` descarta a textura).
   - **Dano IDÊNTICO** ao golpe em área atual (mesma fórmula `ATTACK_SCALE×1,2×√(área×(1+g.área))`), resolvido em `pendingHits` no instante `KUROARI_STRIKE` (0,55 s) — **zero mudança de balanceamento**.
4. **Registros:** `directionalArt.ts` (folha `kuri-1` + `revisedActionForms kuri:[1]`) · `evolution.ts` (`portraitRegion('kuri')` = célula (0,0) da folha de caminhada) · `npcs.ts` (`NPC_ALLIES.kuri` + `NPC_NAMES.kuri`).
5. **Sasori (herói) NÃO foi criado nesta rodada** — segue a fila aprovada **Onda 2** (docs/13/22; spec "Hiruko (1) · Escorpião Vermelho (15)"); a **Kuroari já fica pronta para o kit dele** (a entidade aparece quando ele castar).
6. **`verify-rules.mjs`:** bloco novo com **10 asserções** (Kuri em `NPC_ALLIES`/`NPC_NAMES`, existência + dimensões 1280×640/1280×1280 das 4 folhas, folha de ação `kind:'full'`, retrato na célula (0,0), marionetes fora do roster jogável).

### Estado desta rodada

- **IMPLEMENTADO + VALIDADO** (evidências no CHANGELOG e no commit): `tsc -b` limpo · `vite build` OK · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95 · +10 asserções) · `verify-motion-atlases.mjs` (56 versões/560 estados/0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 (a 1ª execução estourou timeout num check flaky do headless — portal do guardião — e a 2ª passou).
- **Decisões pendentes de aprovação do usuário:** (1) Kuri como companheira permanente do Kankuro; (2) Kuroari como visual da técnica (canon: ele usa a marionete do Sasori na 4ª Guerra); (3) adiantar o herói Sasori (Onda 2) ou manter a ordem K→1→2; (4) aceitar arte Pillow interina com opção de trocar por geração IA (mesmos nomes de arquivo = swap trivial).
- **Limitação declarada:** sem gerador de imagem nesta sessão — arte programática Pillow, qualidade abaixo das folhas IA; o usuário pode gerar pelas suas ferramentas e trocar os 4 PNGs (mesmos nomes) sem tocar no código.

## Rodada 42 · 12/11/2026 — Trilha sonora do jogo (OST de Naruto, 15 faixas)

**Pedido do usuário:** enviou **15 MP3s da OST de Naruto** (áudios originais que ele mesmo baixou e entregou para o jogo — não é material do jogo de referência) com a regra de uso de cada faixa, na íntegra:

| Música | Regra do usuário (literal) | Uso no jogo |
|---|---|---|
| Grief And Sorrow | "Ao morrer e perder a run, tocar essa música." | **DEFEAT** (fixa) |
| The Raising Fighting Spirit | "Durante as runs desde o inicio da run - ordem aleatória **ou ao iniciar luta contra as bijuus**" | **RUN** (pool) **+** trilha da luta bijū |
| Konohamaru's Theme | "Trilha Durante os menu's/fora da run ordem aleatória" | **MENU** (pool) |
| Heavy Violence | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |
| I'll Do It Right | "Música ao acessar o jogo sempre que abrir/navegador/.exe/.patch/ - primeira música do jogo sempre" | **BOOT** (fixa) |
| Ultimate Secrets | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |
| Afternoon of Konoha | "Trilha Durante os menu's/fora da run ordem aleatória" | **MENU** (pool) |
| Loneliness | "Trilha Durante os menu's/fora da run ordem aleatória" | **MENU** (pool) |
| Sarutobi | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |
| Swaying Necklace | "Trilha Durante os menu's/fora da run ordem aleatória" | **MENU** (pool) |
| Hinata vs Neji | "Quando jogar de 'Hinata/Neji' iniciar a run com essa música, **apenas essa condição**" | **HERO override** (famílias hinata/neji) |
| Sasuke's Theme | "Quando jogar com **alguma variante de Sasuke** iniciar a run com essa musica, **apenas essa condição**" | **HERO override** (família sasuke) |
| Bunta | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |
| Beautiful Green Wild Beast | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |
| Dance | "Durante as runs desde o inicio da run - ordem aleatória" | **RUN** (pool) |

**Contagem:** BOOT=1 · DEFEAT=1 · MENU=4 · RUN=7 (inclui Raising) · HERO=2 (Hinata/Neji · Sasuke).

### O que foi feito

1. **`public/assets/music/`** — 15 MP3s copiados do scratchpad com nomes limpos (`grief-and-sorrow.mp3`, `raising-fighting-spirit.mp3`, `konohamarus-theme.mp3`, `heavy-violence.mp3`, `ill-do-it-right.mp3`, `ultimate-secrets.mp3`, `afternoon-of-konoha.mp3`, `loneliness.mp3`, `sarutobi.mp3`, `swaying-necklace.mp3`, `hinata-vs-neji.mp3`, `sasukes-theme.mp3`, `bunta.mp3`, `beautiful-green-wild-beast.mp3`, `dance.mp3`). Seguem no build (`dist/assets/music/`).
2. **`src/audio/music.ts` (novo, ~190 linhas)** — manager singleton com máquina de estados `idle→boot→menu/run/bijuu/defeat`:
   - **Uma faixa por vez, SEM FILA** (mesma filosofia do anti-spam de som de jutsu da rodada 37): ao terminar, sorteia a próxima do pool atual **sem repetir a anterior**.
   - **Overrides por família** no início da run: `hinata`/`neji` → `hinata-vs-neji` · `sasuke` → `sasukes-theme` (`familyOf(id)` cobre todas as versões — "alguma variante de Sasuke").
   - **Bijū:** `playBijuu()` chama `raising-fighting-spirit` (só durante a run); ao terminar a faixa volta ao pool RUN.
   - **Derrota:** `grief-and-sorrow` em loop enquanto o resumo da run está aberto.
   - **Robustez no padrão `playYooo`** (sfx.ts): `play()` em promise com `catch` silencioso; autoplay bloqueado → pendência liberada na **primeira interação** (pointerdown/keydown, captura) — o clique nos botões Jogar/Jogar-convidado (que já chama `playYooo()`) é o gesto que destrava; **nunca** `unhandledrejection` (o verify-runtime captura `pageerror`).
   - **Volume ao vivo:** `settings.volume × settings.musicVolume`; evento `shinobi-settings` + `visibilitychange` atualizam a faixa em reprodução; "Silenciar em segundo plano" também silencia música.
   - Fade-in ~0,9 s por faixa (sem crossfade).
3. **Integração:**
   - `src/main.tsx`: boot no mount (efeito com `musicBooted` ref — primeira renderização toca `startBoot()`; nas trocas de página fora do jogo, `playMenu()` **idempotente**); `startRun(familyOf(hero.id))` em `beginMission` **e** no botão "continuar missão" (que inicia run sem passar por `beginMission`); efeito `runEnded`: `world.defeated → playDefeat()` · `world.victory → playMenu()`.
   - `src/scene/GameCanvas.tsx`: `playBijuu()` dentro de `spawnBijuu` (cobre arena, retomada de run com arena e debug — ponto único).
   - `src/game/settings.ts`: `musicVolume` no type (`GameSettings`) + default **0,7** — retrocompatível (`load()` espalha `DEFAULT_SETTINGS` primeiro; save antigo sem a chave recebe o default).
   - `src/ui/SettingsScreen.tsx`: card **"Música"** (slider 0–100%) no lugar do antigo "O jogo ainda não tem trilha sonora · em breve" + inclusão no "↺ Restaurar" da categoria Som.

### Estado desta rodada

- **IMPLEMENTADO + VALIDADO** (evidências no CHANGELOG e no commit): `tsc -b` limpo · `vite build` OK (15 MP3s no `dist/assets/music/`) · `verify-rules.mjs` (roster 56 · técnicas 97 · itens 95) · `verify-motion-atlases.mjs` (56 versões/560 estados/0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — 58 checks · 0 erros JS · 0 assets 404 · **probe dedicado da máquina de estados (Playwright + Edge headless com autoplay liberado): 5/5 PASS** — (1) boot `ill-do-it-right` ao abrir · (2) pool de menu após o boot · (3) run com **Sasuke Genin** inicia em `sasukes-theme` (override validado) · (4) desistência toca `grief-and-sorrow` · (5) zero pageerror/404.
- **Decisões pendentes de aprovação do usuário:** (1) Raising Fighting Spirit = pool RUN **e** trilha da luta bijū (leitura do "ou"); (2) Hinata/Neji na **mesma** faixa (regra do usuário num único MP3); (3) após a luta bijū terminar, volta ao pool RUN; (4) **vitória** volta ao pool de MENUS (a faixa de derrota é exclusiva de perder a run); (5) `musicVolume` default **0,7**; (6) sem crossfade (só fade-in).
- **Nota:** as 4 pendências da rodada 41 (Kuri · Kuroari · adiantar Sasori · arte Pillow) continuam em aberto.

## Rodada 43 · 12/11/2026 — Sons reais de jutsu (Kage Bunshin + Shinra Tensei) + pose ultimate do Pain + controle de revisão p/ Claude/Codex

**Pedido do usuário (dois MP3 + uma regra permanente), na íntegra:**

> **MP3 1** — "Activating Kage Bunshin no Jutsu (Naruto Anime) - Sound Effect for editing [aEQIi0drDhY].mp3" · regra: **"Kage Bunshin no Jutsu - Apenas naruto"**
>
> **MP3 2** — "Pain Shinra Tensei [IzJoviJjViw].mp3" · regra: **"Apenas Yahiko/Pain, ao utilizar ultimate o jogador deve Levitar com os braços abertos, fazer a arte/movimentos, a habilidade ultimate deve ter este som."**
>
> **Regra permanente (controle de revisão):** "Nota: para os personagens ajustes que você não conseguir fazer animação/habilidades deixar uma anotação no contexto/skills para o Claude ou Codex verificar e eles fazem/revisam. Deixar anotado tudo que você Qwen fez que eles podem revisar, como hud's, personagens/movimentação/sheets. Eles vão eles vão me passar a lista e eu continuo com eles o trabalho se for o caso. Por segurança, já prepare esse controle de tudo que você está fazendo/já fez para revisão deles."

### O que foi feito

1. **Sons reais de jutsu (2 MP3 do usuário)** — IMPLEMENTADO:
   - `public/assets/audio/kage-bunshin.mp3` (copiado do scratchpad — **áudio original que o usuário baixou e entregou para o jogo**, mesmo fluxo do `yooo.mp3` da rodada 37 — **não é** material do jogo de referência) + `public/assets/audio/shinra-tensei.mp3`.
   - `src/audio/sfx.ts`:
     - `JUTSU_CLIP_RULES` — regras **técnica + família → MP3**: (a) `t.name==='Kage Bunshin' && family==='naruto'` → `kage-bunshin.mp3`; (b) `ultimate && family==='pain' && t.name==='Chibaku Tensei'` → `shinra-tensei.mp3`.
     - `jutsuClipFor(t, ultimate, casterId?)` — resolve a regra (usa `familyOf(casterId)` — o lançador, **não** o herói da run; aliados/clones não tocam).
     - `playJutsuClip(src)` — novo `Audio`, `play()` em promise com `catch` silencioso; `release` em `ended`/`error`/catch (**zero unhandledrejection**); **bloqueado enquanto `activeJutsuClip` existir** = regra anti-spam do usuário (12/11): "para não acontecer sound spam… delay de só permitir soltar o som, quando terminar o áudio do outro. **Não funcionará exatamente como uma fila**".
     - `playTechniqueSound(t, ultimate=false, casterId?)` — **nova 3ª arg opcional**: se há clip → toca o MP3, marca `lastTechniqueVoice`/`lastVoiceByTechnique` e **retorna SEM o sweep sintetizado e SEM a fala TTS** (anti-spam); se não há clip mas `activeJutsuClip` ativo → **retorna sem som nenhum** (nem o padrão). Resto (sweeps + `speak`) inalterado.
   - `src/scene/GameCanvas.tsx` — os **3 call sites** passam o `heroId`: `activateSetup` · fim de `castTechnique` (`if(!ally)`) · `castUltimate`. **Verificado:** clones de Kage Bunshin atacam via `hit()` direto (linhas ~1289–1292) — **NÃO** chamam `playTechniqueSound` → sem som duplicado dos clones.
2. **Pose/levitação da Ultimate do Pain** — IMPLEMENTADO (`src/scene/playerMotion.ts`):
   - `const painUltimate = family==='pain' && ultimate && state==='ultimate';`
   - `castFrame = painUltimate ? 0 : …` (segura o **quadro 0** da folha durante o cast todo — receita do Gaara, que já existia).
   - `row = … (attacking ? (painUltimate ? 2 + Number(rear) : Number(rear)) : …)` — fileira **2** (frente) / **3** (costas).
   - `const painFloat = painUltimate ? Math.sin(Math.PI * attackProgress) * .38 : 0;` + `sprite.position.y = floor + jumpHeight + sprite.scale.y*.5 + painFloat;` (arco de elevação 0→pico→0).
   - **Por que funciona sem nova arte:** a folha `public/assets/shinobi-motion/pain-1-action-v3.png` (4×4, `kind:'full'` via `revisedActionForms.pain:[1]` em `directionalArt.ts`) **já tem** a pose de **braços levantados em V** na fileira 2 (frente) e 3 (costas), quadro 0 — confirmada visualmente.
3. **Controle de revisão para Claude/Codex** — IMPLEMENTADO: `docs/23-REVISAO-OUTROS-AGENTES.md` (novo) — como usar (AGENTS.md → docs/19 → este arquivo → CHANGELOG → `git log`) · **inventário por rodada** (cada commit resume a rodada) · **áreas de revisão** (HUDs · personagens/movimentação/sheets · áudio · caça-níquel · configs · planner · música) com caminhos de arquivos · **notas para Claude/Codex** — o que ficou para eles (pose/armadura da ultimate do Pain pode ganhar folha dedicada — hook `painUltimate` em `playerMotion.ts`; arte Pillow da Kuri/Kuroari aguardando IA/swap; sons de jutsu novos chegam pelo usuário; as pendências das rodadas 41/42) · regras permanentes resumidas (pt-BR · nada do jogo rival no projeto · MP3 do usuário = OK · stage por nome · etc.).
4. **`verify-rules.mjs`** — bloco "Rodada 43" (antes de `const result=`): +9 asserções (regra Kage Bunshin Naruto · regra ultimate do Pain · `activeJutsuClip` presente · os 2 MP3 existem >10 KB · `painUltimate` no playerMotion · call sites com `heroId` · kit do Pain: Shinra Tensei + ultimate Chibaku Tensei).

### Estado desta rodada

- **IMPLEMENTADO + VALIDADO** (evidências no CHANGELOG e no commit): `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** — sem regressão + asserções da 43) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404**.
- **Aviso de flakiness (importante):** o harness headless (SwiftShader, lento) tem **checks flaky que trocam a cada execução** — a 1ª execução da rodada 43 falhou no check "Rendan Uzumaki exibe impacto" (lin. 134) e a 2ª no "Teuchi/barraca Ichiraku" (lin. ~318, timeout 30 s), **ambos sem relação com os edits** (caminho Naruto/interação, não Pain/áudio) — a 3ª passou 58/0/0. O handoff da rodada 42 documenta o mesmo padrão (1ª falhou em "portal do guardião", 2ª passou). Se falhar de novo: **reexecutar** antes de investigar; registrar no docs/13.
- **Decisões pendentes de aprovação do usuário (4):** (1) o som de Shinra Tensei toca na **Ultimate `Chibaku Tensei`** do Pain (o MP3 é "Shinra Tensei", mas o usuário disse "a habilidade ultimate deve ter este som"; no jogo a ultimate do Pain é Chibaku Tensei — Shinra Tensei é técnica comum dele); (2) **Kage Bunshin** → som apenas para a **família naruto** (todas as versões dele); qualquer outra família usando a técnica (pool compartilhado) **não** toca o som (leitura de "Apenas naruto"); (3) enquanto um MP3 de jutsu toca, **nenhum** outro som de técnica (sweep/fala TTS) entra — e a fala TTS daquela técnica é suprimida no cast (anti-spam); (4) levitação do Pain: arco `sin(π·progresso) × 0,38` m + pose de braços levantados **segura** durante o cast (mesma receita do Gaara, que já existia no código).
- **Nota:** as 4 pendências da rodada 41 (Kuri · Kuroari · adiantar Sasori · arte Pillow + conferência das folhas) e as 6 da rodada 42 (decisões de trilha sonora) continuam em aberto — espelhadas em docs/13 §6 e docs/18 §6.

## Rodada 44 · 12/11/2026 — Câmera e mouse: giro mais calmo e simétrico, câmera mais deitada, centralizada no jogador

**Pedido do usuário, na íntegra:**

> "o rawinputmouse ainda está esquisito
> a câmera ainda parece muito rápida
> é possível deitar mais a câmera no nosso jogo referência, mas tome cuidado, faça testes para não dar bug's gráficos
> Lembre-se da câmera centralizar o jogador e não a paisagem/mapa ao redor/nosso foco é sempre ter visão limpa do personagem que estamos jogando"

### O que foi feito

1. **Giro mais calmo e simétrico (`src/scene/GameCanvas.tsx` — `turnCamera`)** — IMPLEMENTADO:
   - Taxa do yaw: `0.006` → **`0.0025` rad/px** (−58%) e taxa do pitch: `0.004` → **`0.0025` rad/px** (−53%) — **mesma taxa nos dois eixos** (a assimetria 1.5:1 antiga fazia o giro diagonal “pesar” para o yaw — parte do “esquisito” reportado).
   - 1:1 sem aceleração (rodada 29) **mantido**: `unadjustedMovement` + giro direto; a sensibilidade continua sendo multiplicador puro (slider 0.2–3×, inalterado).
2. **Câmera mais deitada (`src/scene/GameCanvas.tsx`)** — IMPLEMENTADO:
   - Piso do pitch: `0.12` → **`0.05 rad` (≈3°)** — o ângulo baixo do jogo de referência (teto `1.48` mantido).
   - Início da partida: `0.74` → **`0.55 rad` (≈31.5°)** — começa mais deitado.
   - Proteções de ângulo baixo **já existiam** (e foram mantidas): scan de terreno que auto-sobe em encostas (jogador nunca fica escondido), câmera nunca abaixo do chão (`terrainHeight+1.2`) e near ≤ −70 m (ortográfica, sem corte de primeiro plano).
3. **Câmera centraliza o JOGADOR** (pedido reconfirmado) — **já era assim**: `cameraTarget.set(player.position.x, terrainHeight+1.15, player.position.z)` + `camera.lookAt(cameraTarget)`. Verificado no código e documentado; nada mudou nesse ponto.
4. **Dica do Windows (`src/ui/SettingsScreen.tsx`)** — a hint do slider “Sensibilidade do mouse” agora avisa: padrão mais calmo e simétrico desde a rodada 44 + **deixar a velocidade do ponteiro do Windows em 6/11** (o multiplicador do sistema pode somar ao movimento do mouse mesmo com raw input — possível causa de “ainda parecer rápido/esquisito” no PC do usuário).
5. **Testes atualizados:**
   - `scripts/verify-runtime.mjs`: o teste de câmera agora **deita a câmera até o piso (0.05 rad)** e assera `pitch ≤ 0.055` + yaw gira (antes: `pitch < 0.3`); mantém o screenshot `artifacts/camera-horizonte.png`.
   - `scripts/verify-rules.mjs`: +6 asserções (taxas 0.0025 yaw/pitch · piso 0.05 · início 0.55 · dica “6/11”).
6. **Teste visual (pedido do usuário: “faça testes para não dar bug's gráficos”)** — `artifacts/camera-horizonte.png` no piso 0.05 rad inspecionado em alta qualidade: cena renderiza sem corte no horizonte, sem Z-fighting, jogador visível e centralizado, HUD/minimapa íntegros — **sem bug gráfico** no ângulo deitado.

### Validação

- **IMPLEMENTADO + VALIDADO**: `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95** + asserções da 44) · `verify-motion-atlases.mjs` (56 versões · 560 estados · 0 erros) · `verify-runtime.mjs` (Edge headless) **PASSOU** — **58 checks · 0 erros JS · 0 assets 404** (1ª execução, sem flake).

### Decisões desta rodada (registradas, aguardando validação do usuário)

1. Taxa única **0.0025 rad/px** para yaw **e** pitch (simetria 1:1; antes 0.006/0.004).
2. Piso do pitch **0.05 rad** (antes 0.12) — “deitar mais a câmera” como no jogo de referência.
3. Início da partida em **0.55 rad** (antes 0.74).
4. Se ainda parecer rápido no Windows: velocidade do ponteiro do sistema em **6/11** e/ou slider de sensibilidade para baixo.

### Nota

As pendências das rodadas 41/42/43 (Kuri/Kuroari/Sasori/arte Pillow · trilha sonora · sons de jutsu + levitação do Pain) seguem em aberto — espelhadas em docs/13 e docs/18 §6.

## Rodada 45 · 12/11/2026 — Fluidez da caminhada “livre” + proporção ao atacar (suavização de escala e passada)

**Pedido do usuário, na íntegra:**

> "A animação de andar 'livre' ainda está fazendo um 'bug' de movimentação, essa mudança de sheet's/imagem entre animada e não animada deve ser sincrono, não pode aparecer falhas nessa movimentação, tem que ser totalmente fluído, estava fluído antes... mas, parece que ao tentarmos mexer na melhora da movimentação, pioramos isto.
> TAMBÉM revise a questão dos personagens ficarem mudando de tamanho perdendo proporção ao atacar."

### Diagnóstico (regressões introduzidas nas rodadas 38/39 — `src/scene/playerMotion.ts`)

A troca de folha (repouso ↔ andar ↔ andar-atacando) tinha **três descontinuidades** que causavam o “pulo”/falha visível:

1. **`propFactor` instantâneo (rodada 39)** — o fator de proporção (bbox alfa, clamp 0,85–1,35) era aplicado de uma vez em `sprite.scale`. Como `sprite.position.y = floor + jumpHeight + sprite.scale.y*.5` **segue a escala**, a cada troca de folha o personagem **saltava de tamanho E de altura**. Era o “mudando de tamanho perdendo proporção ao atacar”.
2. **`strideShown` liga/desliga** — a deformação das pernas (`playerPose`) ia de `0` para o valor do passo (e vice-versa) **no mesmo frame** em que o golpe começava/terminava — a “falha de movimentação” na troca animada ↔ não animada.
3. **`stepTime` zerava a cada parada** — `stepTime = walkingInput ? stepTime + dt : 0`. Ao parar e retomar, o ciclo de passos **reiniciava do quadro 0** (o “snap”).

### O que foi feito (3 correções cirúrgicas — estado estacionário inalterado, só as transições suavizam)

1. **Fator de proporção SUAVIZADO** — novo estado `propCur` (início 1) faz lerp exponencial `propCur += (propTarget − propCur) × (1 − e^(−14·dt))` (≈0,15 s para assentar). O “pulo” de tamanho/altura vira uma **transição fluida**; **os pés seguem ancorados** (a âncora usa a escala final). **Choji** (Jutsu de Expansão, fase 7), **Gaara** (flutua) e **Pain** (levitação `painFloat`, arco 0,38 m) **preservados** — âncora e arco continuam valendo.
2. **Passada SUAVIZADA na troca de folha** — `strideShown` agora persegue o alvo `(proceduralMotion || walkAttack) ? stride : 0` com lerp exponencial `(1 − e^(−16·dt))` (≈0,1 s). A deformação das pernas **sobe/desce** no início/fim do golpe em vez de ligar/desligar — a passada termina e retoma **sem “pulo”**.
3. **Fase de caminhada CONTÍNUA** — `stepTime` deixa de zerar: `stepTime += dt`. Ao parar e retomar, o ciclo de passos **continua de onde parou** (mais fluido, como caminhada real) em vez de reiniciar do quadro 0.

**NÃO alterado (por segurança):** a troca de textura em si (repouso ↔ folha) segue binária — é a limitação de 1 sprite por estado; as correções acima eliminam os “pulos” de escala/passa/fase que tornavam essa troca visível. Exceções de movimento (Choji cresce · Gaara flutua · Pain levita · Naruto Academia tem atlas próprio · Asuma) **intocadas**.

### Validação

- **IMPLEMENTADO + VALIDADO**: `tsc -b` limpo · `vite build` OK (aviso de chunk >500 kB já existia antes — inofensivo) · `verify-rules.mjs` (roster **56** · técnicas **97** · itens **95**) · `verify-motion-atlases.mjs` (**56 versões · 560 estados · 0 erros**) · `verify-runtime.mjs` (Edge headless) **PASSOU — 0 erros JS · 0 assets 404**.
- **Inspeção visual**: `artifacts/combat.png` (Naruto com tamanho correto, pés no chão, HUD/minimapa íntegros) e `artifacts/camera-horizonte.png` (câmera deitada no piso 0,05 rad, sem corte no horizonte, sem bug gráfico).

### Decisões desta rodada (registradas, aguardando validação do usuário)

1. Suavizar `propFactor` com lerp exponencial (em vez de salto bruto) — **mantém** a regra da rodada 39 (proporção idêntica em movimento) sem o “pulo”.
2. Suavizar a amplitude da passada na troca de folha (em vez de ligar/desligar).
3. `stepTime` contínuo (em vez de zerar a cada parada).
4. Se o usuário ainda notar mudança perceptível de tamanho no golpe: o próximo passo é **reduzir a diferença de bbox entre as folhas de ação e o repouso na arte** (o clamp 0,85–1,35 da rodada 39 segue como teto).

### Nota

Aguardando o **teste do usuário no navegador** (fluidez da caminhada + sem “pulo” de tamanho ao atacar). Se aprovado, a regra 39 (proporção idêntica em movimento) volta a valer **sem** a regressão de fluidez.

## Rodada 46 — Caminhada dos Ninjas Selados (aliados) corrigida · 12/11/2026

### Pedido

> Corrigir o caminhar dos Ninjas Selados que entram no time para ajudar, a caminhada deles está bugada, devem caminhar/atacar/normalmente conforme seguem o jogador.

### Diagnóstico (causa raiz — `src/scene/GameCanvas.tsx`, loop de aliados)

1. **Stop-and-go binário do follow:** `follows = gap > .25` + movimento `min((speed+2)·dt, gap)` fazia o aliado **parar seco** dentro de 0,25 m do slot de formação (estado `idle`, textura de repouso) e **sair “correndo”** assim que o slot — ancorado no jogador — se afastava. Com o jogador andando (~5 m/s), o ciclo era ~0,05 s parado + ~0,12 s andando, a ~10 Hz: o sprite **alternava repouso ↔ caminhada** a cada 0,05–0,15 s. É isso que aparece na tela como “caminhada bugada” (tremeliquento, saltitante, com troca de pose a todo momento).
2. **Orientação sem dead zone:** os aliados passavam `dir.dot(v1) > 0` / `dir.dot(v2) < 0` para `backwardView`/`leftward` do `playerMotion.update`. O jogador usa **threshold ±0,18** (`viewBack`/`viewLeft`) exatamente para evitar que a fileira da folha (frente ↔ costas) troque a cada frame; os aliados, com threshold 0, **flippavam de frente/costas** a cada frame ao andar quase de lado para a tela.
3. **O que NÃO era o problema** (verificado): o ataque dos aliados já funciona — `castTechnique` chama `motion.attack(...)` com a orientação do alvo; a cadência (`allyTimer`/`allyInterval`) é independente; o controlador (`playerMotion.ts`) é o **mesmo** do jogador (já validado na rodada 45).

### Correção (2 pontos por ator: aliados + Kuri)

1. **Follow amortecido (sem stop-and-go):** `ally.position.lerp(goal, 1 − e^(−dt·R))` — **R = 8** em marcha normal, **R = 16** durante o dash do jogador. O aliado **desacelera suavemente** ao chegar no slot (assenta em ≈0,13 s) em vez de parar seco; com o jogador em movimento ele mantém **offset constante (~velocidade/8 m)** e anda com **passada contínua**. O snap `gap > 12` (recrutamento/teleporte) foi preservado. Band de assentamento: `follows = gap > .18` (era `.25` nos aliados, `.3` na Kuri).
2. **Dead zone de orientação idêntico ao jogador:** `backwardView = dir.dot(v1) > .18` · `leftward = dir.dot(v2) < −.18` — mesmos parâmetros de `viewBack`/`viewLeft` do jogador.

**Intocado:** ataque/repouso/cadência dos aliados · Kuri mantém `level=1` e o timer próprio · Kankuro (animações corrigidas pelo usuário — regra permanente) · Choji (único que cresce) · âncora nos pés e suavizações da rodada 45 (que agora também beneficiam os aliados, por usarem o mesmo controlador).

### Validação

- `tsc -b` limpo · `vite build` OK · `verify-rules` 56/97/95 · `verify-motion-atlases` 56/560/0 erros · `verify-runtime` **0 erros JS · 0 assets 404** (o cenário recruta Gaara + Kankuro e joga com eles).
- **Teste visual dedicado (Playwright, Edge headless):** recrutou Gaara + Kankuro, andou com W (frente) e A (esquerda), 7 frames — aliados seguem o jogador em **formação contínua** (offset estável), **atacam** com o efeito em área visível, **assentam em repouso** ao parar, **sem flicker de fileira** e **sem stop-and-go**.

### Decisões desta rodada

1. Follow amortecido (lerp exponencial) em vez do stop-and-go — **mantém** a formação (raio 2,6 m / Kuri 2,1 m) e o snap de segurança; o offset de acompanhamento (~vel/8) é uma consequência natural do amortecimento e ficou visualmente bom nos testes.
2. Dead zone ±0,18 igual ao jogador — consistência visual entre jogador e aliados.
3. Kuri recebeu a mesma correção (mesmo padrão de código).

### Nota

Aguardando o **teste do usuário no navegador** (caminhada/ataque/repouso dos aliados). Se aprovado, este item sai da fila; as pendências das rodadas 44 (FPS em GPU real) e 45 (fluidez da caminhada do jogador) seguem aguardando o mesmo teste.

## Rodada 47 · 12/11/2026 — 13 pedidos: crítico 250/300 · YOOOO rápido · Isca Shinobi → Pílula · Treinar auto-planeja · early game +200% (PROPOSTO) · raridade visual · bordas temáticas · botões do planner · badge Treinada · selamento instantâneo · pool adaptável · auto-coleta · passada sem distorção

**Pedidos do usuário, na íntegra (12/11/2026):**

> "Dano crítico 250% do dano base e Mega Crítico 300% do dano base."
> "O Som de YOOOO! tem que entrar mais rápido ao clicar no botão, está demorando alguns segundos... tem que ser mais rápido o som."
> "Você transformou a Isca Shinobi em item, ele é uma Pílula… mude."
> "ao treinar a passiva Treinamento com Jiraiya, já tem que habilitar o Treinar para selecionar no plano de build."
> "Early game desde o lv1 muito fácil, extremamente fácil... aumentar cerca de 200% a dificuldade, diminuir dano inicial dos personagens, aumentar hp/defesa dos mob's."
> "Se está fácil assim na dificuldade genin, também vai estar no restante."
> "Hud ficou excelente, porém precisamos que na opção de escolha seja mais visual a raridade do item/habilidade/pílula, você já tem as cores, coloque em volta do ícone preenchendo todo o quadradinho a cor da respectiva raridade."
> "Faça bordas para toda hud que combine com o tema, além disso coloque cores que combinem com o tema japones/naruto/planilha de cores para Técnicas, inventário, ficha técnica."
> "evidencie como botões essas opções."
> "E entender no jogo que as habilidades treinadas, irão aparecer e darão o buff da % corretamente."
> "Ao selar um shinobi se não tiver escolha de substituição por outro do time, continuar a missão instantaneamente, retirar a tela de clicar em 'continuar missão'"
> "quando tiver só 1 escolha, deixar o tamanho para 1 escolha, quando for 2, para duas e assim por diante. Não deixar a área do hud como se fosse o tamanho normal, pegando na tela como se tivesse 4 escolhas, se não fica feio dessa forma."
> "pegar itens no chão, precisa sumir a opção de pegar. Assim como em cima de altares, não ter opção de 'iniciar altar' apertando E, só de ficar em cima já ta contando o tempo"
> "animação distorcida ainda, documentar e tentar corrigir, ainda acontece o 'bug' de distorção ao tentar atacar + andar."

### O que foi feito (por item)

1. **Crítico 250% / Mega Crítico 300% — CONFIRMADO (já estava no código):** `src/game/progression.ts` — `rollCritical(chance, criticalMultiplier=2.5)`: dano crítico = **250%** do dano base; mega crítico (tier 2, chance de crítico ≥ 100%) = `criticalMultiplier + .5` = **300%**. Verificado no código real nesta rodada; nada alterado. (O glossário já documenta a regra do mega-crítico após o crítico 100%.)
2. **YOOOO mais rápido (item 2):** `src/audio/sfx.ts` — nova `preloadYooo()` (cria o `Audio`, `preload='auto'`, `load()` com fallback silencioso) + `src/main.tsx` — chamada no boot, junto do `startBoot()`. O atraso era o **download no 1º `play()`**: agora o 1º clique **não espera fetch**. Corte a partir do **1 s** (rodada 37) mantido; gate anti-spam inalterado.
3. **Isca Shinobi volta a ser PÍLULA (item 3):** `src/game/pills.ts` — pílula `isca` com os **mesmos valores** do item antigo (`enemyCount +15% · gold +12% · exp +8%` por nível, ícone 餌); `src/game/catalog.ts` — item `shinobi-bait` **removido** do catálogo (comentário de migração documenta); `src/game/inventoryArt.ts` — ícone avulso não necessário (a cápsula `PillIcon` cobre, como as demais pílulas). Saves antigos degradam graciosamente (sem erro). Reverte a transformação errada registrada em docs/18 §6 (item antigo).
4. **Treinar habilita direto no planner (item 4):** `src/ui/BuildPlanner.tsx` — o botão **Treinar** agora aparece para **todas** as técnicas do herói (antes: só para as já planejadas) e treinar uma técnica ainda não planejada **auto-planeja** ela junto (antes era no-op, pois `trained` filtra por `planned`). O buff **+15%** em si **já existia desde a rodada 39**: `src/scene/GameCanvas.tsx` `hit()` aplica `config.trained?.includes(t.name) ? 1.15 : 1` nas técnicas do jogador (não dos aliados).
5. **Early game +200% — IMPLEMENTADO com valores PROPOSTOS, o usuário testa e ajusta (item 5):**
   - `src/game/progression.ts` — `ENEMY_SCALING`: **hpBase 1,6 → 3,2** (HP inicial dos inimigos ×2) · **armorPerMinute 0,015 → 0,03** (defesa inicial 2× mais rápida) · **maxArmor 0,6 → 0,72**; demais parâmetros mantidos. O efeito extra é **máximo no início** e decai proporcionalmente (5 min: ×1,20 · 10 min: ×1,13 · 30 min: ×1,05) — o late game já é íngreme por si (1,17^min).
   - `src/game/heroes.ts` — **`export const HERO_DAMAGE_FACTOR=.41`** (era ×0,55 hardcoded): dano base do herói **×0,41**; o **HP base do herói NÃO mudou** (o teste fixa 85 de HP do Naruto Academia).
   - **Dificuldade total ≈ ×2,8–3,1 no minuto 0** (Genin; vale para **todas** as dificuldades em suas devidas proporções — "se fácil no Genin, fácil em todas").
   - **BUG CORRIGIDO (mesmo item):** `heroes.ts` `version()` dividia por **`.55` hardcoded** (o multiplicador antigo da fábrica) — com a fábrica em ×0,41, as versões seguintes ficavam **mais fracas que a base** (naruto-genin 6,16 < naruto 7,38), violando a regra "versões avançadas mais fortes". Agora `version()` divide por `HERO_DAMAGE_FACTOR` — **única fonte** do multiplicador (fábrica `h()` e `version()`).
   - `scripts/verify-rules.mjs` — faixas atualizadas com justificativa "Rodada 47": HP tardio do guardião `>=1.1e9 && <1.35e9` · armadura do FINAL SWARM `> d10.armor*2.5`.
6. **Raridade mais visual no pool (item 6):** `src/ninja-theme.css` — `.level-choice-card .choice-art` (e as variantes `rarity-*`) agora com a **área do ícone PREENCHIDA com o gradiente da raridade** (`--rarity-strong → --rarity`) + contorno interno de **2 px** (`inset 0 0 0 2px var(--rarity-strong)`) — antes era um brilho suave; o quadradinho inteiro da carta assume a cor da raridade.
7. **Bordas para toda HUD no tema japonês/naruto (item 7):** `src/ninja-theme.css` — **molduras temáticas** no painel da ficha da run: `.sheet-banner` (madeira/corda + pincelada) · `.sheet-column` · faixas `.stripe.blue` (Técnicas) / `.stripe.gold` (Inventário) / `.stripe.purple` (Ficha técnica) · `.sheet-tile` (pergaminho com borda) — por cima da base de `run-ui.css`, no tema ninja/japonês já estabelecido.
8. **Opções do planner evidenciadas como BOTÕES (item 8):** `src/ninja-theme.css` — `.build-cell-actions button` (Planejar para Missão · Treinar · Não aprender/Permitir aprender) agora com cara de **botão**: placa de pergaminho com borda de madeira; `aria-pressed` ativo = **selo hanko vermelho** (base em `hud-dock.css`); "Permitir aprender"/"Devolver" mantém o verde (`.enable-skill`).
9. **Habilidades treinadas visíveis + buff correto (item 9):** o buff +15% **já aplicava na run** (rodada 39 — `hit()` em `GameCanvas.tsx`); a rodada 47 torna isso **visível na ficha**: `src/ui/RunSheet.tsx` recebe a prop `trained` e exibe o **badge "★ Treinada · +15% de dano"** em cada técnica treinada (`.trained-badge` em `ninja-theme.css`; `src/main.tsx` passa `trained={trained}`); o item 4 (Treinar auto-planeja) garante que o buff seja alcançável direto do planner.
10. **Selamento instantâneo sem "continuar missão" (item 10):** `src/scene/GameCanvas.tsx` — ao terminar o selamento **sem substituto na fila**, `nextSeal(); recaptureAfterChoice()` — a missão **continua na hora** (próximo candidato, ou volta à run); o estado `complete` **nunca mais fica visível** nesse fluxo. Se houver substituto na fila, o pool de escolha segue normal.
11. **Pool adapta o tamanho ao nº de cartas (item 11):** `src/main.tsx` — o pool ganha a classe `cards-{1..4}` conforme o nº de cartas (`Math.max(1,Math.min(4,…))`); `src/ninja-theme.css` — `.level-choice.cards-1/2/3/4` (430/690/930/1060 px). A **largura da área de escolha se adapta**: 1 carta = estreita, 4 = largura original — sem área vazia "como se tivesse 4 escolhas".
12. **Auto-coleta ao pisar (item 12):** `src/scene/GameCanvas.tsx` — pickups comuns (Ryu · kunai/shuriken · drop do mega elite) agora são **coletados ao pisar** (raio 1,8 m, tick da simulação) — **sem "E"** e sem prompt de "pegar"; o `interact()` (tecla E) agora cobre **só as emboscadas** (`cursedShuriken`/`ninjaBody`, raio 2 m — gatilhos de risco, mantidos). **Altar**: já começava ao pisar (`tickAltar`) — comportamento pré-existente, sem mudança. Se o Ryu não cobre o preço da kunai, o item **fica no chão** (toast) e a auto-coleta tenta de novo no próximo tick. Rejeição de selamento (tecla G): o drop cai **sobre o jogador** → auto-coleta no tick seguinte.
13. **Passada sem distorção ao atacar + andar (item 13):** `src/scene/playerMotion.ts` — **`const strideTarget = proceduralMotion ? stride : 0;`** (~linha 263) — a passada procedural (deformação de pernas/braços da pose) **NUNCA** se sobrepõe a uma folha desenhada: o quadro de ataque fica **100% íntegro** (sem "distorção"); o andar-livre continua porque o **deslocamento vem da simulação**, não da deformação da pose. Suavização da passada (lerp `1−e^(−16·dt)` ≈0,1 s, rodada 45) e âncora nos pés mantidas; exceções (Choji cresce · Gaara flutua · Pain levita) intocadas.

### Testes reescritos (apoio ao item 12)

`scripts/verify-runtime.mjs` — os testes de kunai agora seguem o fluxo novo (**auto-coleta ao pisar**): "Recusa G" (`g` → `sealing=null` → pool de 3 cartas → tecla `1`) + loop de preço (auto-coleta → `paidWeapons` 1/2, custo 20/30 Ryu); **hardening** do loop do guardião: **removido o `press('e')`** (o teleport sobre a kunai já dispara a auto-coleta; o "E" perto do portal — raio 2,2 m — podia entrar na zona seguinte). `artifacts/runtime-checks.json` confirma: "Recusa G deixa kunai grátis com três escolhas · auto-coleta ao pisar, sem E (Rodada 47)" · "Kunais custam 20 e depois 30 Ryu · coletadas ao pisar, sem E (Rodada 47)" · "As 3 kunais do guardião (1 + 2 planos do Shikamaru) são coletáveis antes do portal".

### Validação

- `tsc -b --force` **EXIT 0** · `vite build` **EXIT 0** · `verify-motion-atlases.mjs` `{"versions":56,"states":560,"errors":[]}` · `verify-rules.mjs` **EXIT 0** (roster **56** · técnicas **97** · itens **94** — `shinobi-bait` saiu do catálogo) · `verify-runtime.mjs` **EXIT 0 · `errors:[]`** (~202 s, Edge headless).

### Decisões desta rodada

1. **Crítico 250% / mega 300% — CONFIRMADO** (regra já implementada; agora registrada como decisão permanente).
2. **YOOOO preload no boot** — o 1º clique não espera download; o corte de 1 s e o anti-spam seguem.
3. **Isca Shinobi = Pílula** (regra da rodada 35 reafirmada; a transformação em item da fase 4 da rodada 37 é revertida).
4. **Treinar aparece para TODAS as técnicas e auto-planeja** — o +15% (rodada 39) fica alcançável direto do planner e visível na ficha (badge).
5. **Early game +200% = PROPOSTO** (hpBase 3,2 · armor `.03`/`.72` · `HERO_DAMAGE_FACTOR` .41 → dificuldade ≈ ×2,8–3,1 no minuto 0) — **o usuário testa a gameplay e ajustamos em iteração** (regra das rodadas 34/35: nunca calibrar sem ele).
6. **`HERO_DAMAGE_FACTOR` é a única fonte do multiplicador** do dano base do herói (fábrica `h()` + `version()`).
7. **Raridade preenche o ícone da carta** no pool (gradiente + contorno 2 px).
8. **Ficha com molduras temáticas** (banner/colunas/faixas/tiles no tema ninja/japonês).
9. **Ações do planner como botões** (pergaminho + selo hanko).
10. **Selamento sem substituto = missão continua na hora** (sem tela "continuar missão").
11. **Pool adapta a largura a 1–4 cartas.**
12. **Coleta comum ao pisar** (sem "E"); **E só para emboscadas**; altar já iniciava ao pisar.
13. **Passada procedural nunca sobrepõe folha desenhada** (`strideTarget = proceduralMotion ? stride : 0`) — quadro de ataque íntegro; andar-livre via deslocamento da simulação.

### Nota

Aguardando o **teste do usuário no navegador** (13 itens — em especial os visuais: raridade preenchendo o ícone · bordas da ficha · botões do planner · badge Treinada · largura do pool · selamento instantâneo · auto-coleta sem "E" · YOOOO rápido · passada sem distorção). O **item 5 (early game +200%) é PROPOSTO**: o usuário testa e ajustamos os valores em iteração. As pendências das rodadas 41/42/43/44/45/46 seguem em aberto (docs/13 §6 e docs/18 §6).

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

**Pedido integral**

Temos um novo agente nos ajudando, é o Qwen, ele fez anotações para você trabalhar, leia toda a documentação dele e consulte o que está documentado para você trabalhar.

Verificar porque os áudios de musicas não estão tocando assim que abrimos o jogo, sempre que abrir/carregar o HOME do jogo já tem que começar a toca a musica junto.

Criar um iconezinho de drop de moedas ryu para dropar no chão junto com os outros itens, verificar se o bolinho de arroz que dropa dos monstros está curando o personagem na porcentagem que era o Lamen.
Diminuir o tamanho de todos os drops dos monstros que vão até o personagem para não poluir a tela, diminuir relativamente bem.

Imagem referência: Nosso planejador de habilidades - pilulas - itens - fusões tem que ser parecido em formato ao da referência.

Criar animações/estilo visual fiéis as habilidades para TODOS os personagens, seguir o modelo de qualidade que temos.
Algumas habilidades já tem criado, verificar quais faltam, quais estão genéricos, cuidado para não alterar o que já está bom.

Parte "Táticas de Missão" Deverá ser uma opção no topo da tela igual a Shinobis, Passivas, Itens, Bolsa da Missão, Bolsa da Missão pode ser possível alterar o arsenal de itens, Arsenal de Missão deverá ser o novo nome.
Ao selecionar o personagem para a missão, na parte do mapa, deve ter opção de selecionar o Arsenal e ter todos os arsenais salvos por personagem.

Botão de "Configurações" fica na tela inicial na página HOME e no ESC dentro das run's.

Botão de Reset de conta, ficará dentro das configurações em "Conta"

Parte de item's no planejamento para missão, deverá ser possível mexer no que temos já salvo em um build

Faça os altares pelas cores da raridade dele, hoje só temos uma cor no jogo. Além disso os altares devem dar recompensa de atributos, ele randomiza as opções, sendo uma de utilidade, armadura/hp/chancestatus/velocidade e a outra relacionado a dano/projétil/velocidade de ataque enfim... tem muito status para randomizar ai, faça uma mecânica legal.

Mostrar a raridade da recompensa no pool de escolha ao fundo do ícone preenchendo todo o "quadrado" você sabe as cores.

Além disso crie uma arte seguindo nossos modelos/skills para fazer um Susano'o, já temos uma base pronta, mas precisamos transformar com a qualidade das habilidades que temos.

O HP na parte esquerda, deixe o valor por inteiro ou melhor coloque na barra de HP no pé do personagem.

Além disso, você precisa para TODOS os personagens fazer a animação dele andando para cima e para baixo.

Fazer a animação do Shinra Tensei e colocar na ultimate do pain/Yahiko.

Pegue a referência dos corpos shinobi que estão deitados no chão e coloque o sprite.

Coloque para apertarmos E quando derrotarmos um mega-elite, chegarmos perto dele cerca de 10m e apertarmos E, para então selarmos, manter a prioridade em questão da configuração do selamento/animação.

Atualize os sprites das habilidades de invocação das marionetes de Kankuro e Sasori.

Criar as folhas de todos os personagens com todas as animações/ícones e implementar disponível para jogar sem bug's de animação no jogo.

Lembrar de atualizar a documentação e mostrar tudo que está sendo feito e atualizar o github, só seguir as documentações e os contextos, ler todas as skills para seguir desenvolvendo e as regras do desenvolvimento.
Bigbrain

**Complemento do usuário**

> A cópia é a nova pasta core do projeto

**Resposta registrada**

- **Áudio:** a Home tenta iniciar a faixa de abertura no carregamento. A faixa continua enquanto o jogador navega pelo hub. Se o navegador bloquear a reprodução automática, a primeira interação libera a mesma faixa e a Home exibe **Ativar música** enquanto ela estiver bloqueada.
- **Drops e HUD:** o Ryu de abates tem moeda dourada com 両. O bolinho de arroz recupera **35% do HP máximo** por padrão, com chance de até **5% por abate**. O morro continua sendo um ponto interativo separado. Os drops atraídos têm 55% do tamanho anterior no chão e cerca de 40% ao voar até o jogador. O HP aparece por inteiro no HUD e na barra sob os pés.
- **Planejamento:** quatro seções com ícones e contagem. **Táticas de Missão** abre pelo topo. Aplique uma tática, edite o plano e clique em **Atualizar** nela para salvar a edição. O antigo menu da bolsa agora se chama **Arsenal de Missão** e as listas por shinobi ficam selecionáveis no mapa. O seletor de tática também está na preparação.
- **Configurações:** acesso pela Home e pelo Esc da run. **Reset de conta** fica em **Configurações → Conta**, com confirmação dentro do jogo.
- **Altares:** estrutura e círculo seguem a cor de raridade. A bênção sorteia um atributo ofensivo e um de utilidade/defesa. A partir de Raro, sorteia um terceiro sem repetição. Os atributos entram diretamente ao completar o círculo e continuam na run salva. Os cartões de recompensa usam a cor da raridade em toda a área do ícone.
- **Selamento:** o Mega Elite derrotado fica no chão. Aproxime-se até 10 m e use **E**. A configuração atual decide se abre o ritual ou sela diretamente. A troca com equipe cheia e a recusa dentro do ritual continuam disponíveis. O corpo da armadilha tem uma arte própria.
- **Combate e artes:** Shinra Tensei é a Ultimate do Pain, com levitação, ondas radiais, destroços e repulsão. Chibaku Tensei ocupa o antigo lugar na lista de técnicas e ganha rochas convergentes. O Susano’o azul do Madara usa um atlas de quatro fases em cima da base 3D. Kuroari e a marionete do Terceiro Kazekage têm folhas próprias no campo e na prévia. Kaiten, Palmas Protetoras, Oito Trigramas, Leões Gêmeos, técnicas de sepultamento e Kamui ganharam efeitos reconhecíveis. Sasori ainda está fora do elenco jogável e a marionete aparece em Mil Braços do Escorpião, no kit de Kankuro.
- **Movimento:** três novas folhas de ataque, pulo e dash em frente e costas, para Sasuke Genin, Neji e Neji Shippuden. A verificação de atlas passou em **56 versões e 560 estados**, incluindo fileiras distintas de caminhada em frente e costas. A revisão manual de qualidade de cada ataque, Ultimate, ícone e ajudante continua na fila.

Pasta principal confirmada. Suíte completa no Edge: 62 verificações, 0 exceções JavaScript e 0 respostas 404. Testes dirigidos também confirmaram Shinra Tensei por R com dano e altar comum com um atributo ofensivo e um de utilidade/defesa. O navegador inicia a trilha sem clique quando a política de reprodução automática permite. A fila restante está no [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md).

## Rodada 53 · 13/11/2026

### Pedido do usuário

Segundo o Qwen faltava isso:
Eu quero que você implemente todos os personagens e as suas respectivas animações.
Temos os hokages e os tierA pra implementar conforme o Qwen listou.
Faça isso...
Também procure outros personagens que não temos nessas listas e monte eles, com suas respectivas missões de desbloqueio, suas habilidades únicas e movimentações...
Não esqueça de colocar na folha de TODOS os personagens tanto novos quanto antigos, a animação de andar para cima e a de andar para baixo.

Depois de fazer tudo isso, veja o que consegue continuar dessa lista.
Não esqueça de documentar e publicar.

### Complemento do usuário

Apenas persoagens da OBRA NARUTO devem ser mantidos, na minha opinião, você fugiu a obra em alguns personagens ai.
Fez a pode de andar pra frente e trás para todos os personagens do Rooster do jogo?

Adicione os efeitos a TODAS as habilidades fielmente igual as do ANIME no nosso jogo, você já tem MUITA referência para fazer isso no projeto.

### Resposta

O elenco tem 96 versões de 56 famílias, com 40 versões novas, suas missões, passivas, kits e folhas de movimento. As 96 têm caminhada de frente e de costas. Foram retirados os kits propostos para Ishikawa, Byakuren e Reto, que exigiam inventar técnicas. O atlas de efeitos está ligado ao combate e à prévia. Ainda falta comparar cada efeito com o anime e refinar as técnicas que compartilham arte. Zabuza aparece na névoa intermitente, o HUD ganhou o total de abates e foi concluída a Fase 4 de itens e pílulas.

A compilação, o teste de regras, as 62 verificações em navegador e os 960 estados de movimento passaram. A publicação desta rodada segue na main do GitHub.

## Rodada 54 · 13/11/2026 — retomada do trabalho do Codex (Claude Code)

> Olá, consegue verificar os arquivos e o que Codex estava fazendo quando parou?
> C:\Shinobibonk projeto - Copia — Você está trabalhando com este caminho de repositório local?
> Sim, usar a Copia

### Resposta

O Claude Code vinha trabalhando por engano em `C:\Shinobibonk projeto` (cópia antiga); a pasta principal é a "- Copia" (regra da rodada 35, reforçada na 52). Na "- Copia", o Codex tinha uma rodada inteira sem commit (18 versões novas — Akatsuki, Som, Taka —, arte nova e rebalanceamento de HP/dano). Validada (tsc, build, verify-rules 114/213/95) e publicada como Rodada 54; detalhes no CHANGELOG.

## Rodada 55 · 13–14/11/2026 — lote de caminhada, Mega Elite caído, HUD, HP, projéteis, zonas e testes

Pedido integral do lote (13/11): ver [docs/25](25-RETOMADA-LOTE-13-11.md) §2. Mensagens complementares:

> pausar · retomar · pausar e fazer sem subagentes, fazer 1 tarefa por vez ai · Tem certeza que todos os personagens estão andando normal? Respeitando as folhas de animação para a caminhada com o WASD, virando para as respectivas direções e andando reto, diagonal... enfim · Pause seus testes abrindo o microsoft edge por enquanto... crie software de teste automatizado na minha máquina por código · Apenas para o claude por enquanto, faça esse .md (política de testes sem navegador colada pelo usuário)

### Resposta

Caminhada medida no jogo antes da suspensão do navegador: jogador certo nas 8 direções × 4 ângulos; ajudantes e Mega Elites certos; monstros 33/35. As bijū não viram de costas, porque falta arte de costas (PENDENTE de arte).

Política de testes sem navegador registrada em `CLAUDE.md` (só para o Claude Code). Criados `tests/` (22 testes em node:test, sem navegador), `TESTAR_JOGO.bat` e `npm test`. O erro que o usuário viu ao rodar o .bat era da primeira versão, que passava a pasta `tests\` ao Node; já corrigido para o padrão `tests/*.test.mjs` e verificado (22 de 22).

Rodada 55 publicada. Detalhes e pendências E2E no CHANGELOG. Próxima tarefa: fontes da HUD.

## Rodada 56 · 14/11/2026 — testes confiáveis e política central de testes

> Eu quero que você veja como pode melhorar esse teste, entenda o que você fez e faça todas as melhoras para que consigamos extrair o máximo da pureza e certeza que os testes estão passando 100%, agora não quero que fique apenas no claude essa funcionalidade, pode expandir para codex/qwen... Porém, por enquanto ainda manter a forma de testes dele, só o claude por enquanto para de usar o edge.
>
> (Complementos da mesma rodada:)
> - "Pode seguir também" (fontes da HUD, depois desta tarefa).
> - "faça esse .md" — seção "Política de testes" apontando para docs/development/TESTING_POLICY.md — "Você vai criar esse ultimo markdown de testes e questão de não usar o edge, com a restrição apenas para o claude, no agents.md".
> - Prompt longo de evolução da infraestrutura de testes (camadas, stress de 1.500 monstros, métricas p95/p99, perfis, confiabilidade, relatório).
> - "crie um .md para isso": tarefa de centralizar a política em TESTING_POLICY.md + AGENTS.md + CLAUDE.md (capítulos A–H, perfis leve/equilibrado/profundo com metas de 40/65/85% de CPU, status PASSOU/FALHOU/INSTÁVEL/NÃO EXECUTADO/NÃO MENSURÁVEL, entregar diagnóstico antes de implementar infraestrutura nova).

### Resposta

- **Política e instruções:** criada `docs/development/TESTING_POLICY.md` (capítulos A–H, comandos reais, como acrescentar testes, propostas). `AGENTS.md` ganhou a seção "Política de testes" (todos os agentes). `CLAUDE.md` foi reorganizado para apontar para a política, mantendo a restrição de navegador ativa só para o Claude Code. Conflito registrado: o prompt colado pedia a restrição também ao Codex, mas a instrução direta do usuário foi "restrição apenas para o claude"; seguida a instrução direta, aguardando confirmação.
- **Lógica extraída para módulos puros:** altar, golpes extras, ameaça por zona, ímã e cone.
- **Testes:** reescritos por comportamento (42); executor com garantias; prova por mutação 13/13; perfis no `TESTAR_JOGO.bat`.
- **Resultados (PASSOU):** leve, equilibrado e mutação.
- **NÃO EXECUTADO:** E2E com navegador.
- **Proposta, sem implementar:** simulação headless e stress de 1.500 monstros, porque exigem extrair o núcleo de simulação do GameCanvas.
