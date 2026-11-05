# ShinobiBonk — Contexto consolidado deste chat

> **Aviso (revisão de 05/11/2026):** este arquivo é o **registro histórico** do chat anterior e não foi reescrito. Várias decisões mudaram depois.
> - **Tab, P e Y**: Tab abre o **mapa rápido** e **P abre a ficha**. A Ultimate automática é alternada pela **tecla Y** (obrigatória) e também pelo **selo AUTO no botão R**.
> - **Pokémon**: nomes de eventos de referência (Rhydon, Snorlax, Gengar) foram trocados por Provocação do guardião, Bênção de Tsunade e Maldição de Orochimaru.
> - **Base atual**: React/Three.js em `src/`, e não mais `game/index.html` (seções 12–13 abaixo).
>
> Para o estado atual, use [docs/00-LEIA-PRIMEIRO.md](docs/00-LEIA-PRIMEIRO.md) e [AGENTS.md](AGENTS.md).

**Data de consolidação:** 05/11/2026  
**Objetivo:** transferir para o Codex (ou outro chat/agente) as decisões, pedidos, histórico, estado de implementação, pendências e critérios de aceitação do projeto ShinobiBonk.  
**Escopo:** reconstrução temática e técnica abrangente do diálogo e dos requisitos registrados, **não transcrição literal integral de todas as mensagens**. Trechos exatos de código, imagens e anexos permanecem nos arquivos do projeto. Não inventar horários, testes, funcionalidades ou valores não especificados.

## 1. Visão e identidade

- **ShinobiBonk**: survivor/roguelite inspirado na experiência de PokéBonk, com identidade visual e temática ninja/Naruto, progressão entre partidas e builds aleatórias.
- **Meta visual obrigatória:** **mundo tridimensional (3D)**, cenários com relevo, elevações, montanhas, construções e exploração; personagens/inimigos em **mini pixel art 2D** orientados à câmera (billboards), combinados com cenário 3D leve.
- **Câmera:** isométrica/orbital, rotação livre horizontal de 360° pelo mouse, inclinação/pitch até quase vertical (visão de cima), zoom e movimento consistente com a câmera. O jogador deve conseguir observar locais distantes e subir/explorar elevações.
- **Plataforma prioritária:** navegador, jogável e leve, buscando FPS elevado e boa performance. Não confundir uma arte conceitual gerada com screenshot de jogo funcional.
- O usuário quer **código real, projeto completo, arquivos organizados, testes e screenshots reais**, com documentação utilizável pelo **Codex**.

## 2. Convenções de evidência e colaboração

Usar sempre: **CONFIRMADO** (decisão do usuário), **IMPLEMENTADO** (presente no código), **TESTADO** (executado de fato), **PROPOSTO** (ideia ainda não fechada) e **PENDENTE** (não implementado ou não definido). Uma decisão confirmada não implica implementação. Quando o código divergir de uma regra, prevalece a decisão do usuário, com correção e teste. Responder em português do Brasil, com clareza e sem inventar variáveis, funções, resultados de teste ou arquivos.

## 3. Comandos e ciclo de partida

| Entrada | Comportamento desejado |
|---|---|
| W/A/S/D | Movimento relativo à câmera |
| Mouse | Girar câmera livremente 360° e ajustar inclinação |
| Espaço | Pular; suporte à altura/relevo |
| Shift | Dash |
| E | Interagir com NPCs/eventos |
| **R** | Ativar manualmente a Ultimate natural |
| **Y** | Habilitar/desabilitar ativação automática da Ultimate quando pronta |
| **H** | Modo de desempenho: ocultar/reduzir efeitos e números flutuantes, sem alterar dano/hits |
| **M** | **Abrir mapa completo**, não ocultar o minimapa |
| **Tab** | Abrir ficha/build/inventário/pool/planejamento |
| P | Pausar |
| 1–4 | **Não são teclas de ativação**: habilidades comuns nesses slots disparam exclusivamente de forma automática, cada uma com sua cadência |

- Quatro slots de habilidades comuns: 1, 2 e 3 inicialmente; **slot 4 desbloqueável na árvore permanente**. Nenhuma habilidade comum depende de apertar 1–4.
- **Ultimate existe desde o nível 1**, com botão/ícone permanente e indicador visível de carga/cooldown. Todos os ninjas, inclusive Taijutsu, usam Chakra como recurso temático da Ultimate.
- Ultimate: recarga **passiva por tempo**, reinicia após uso; drops específicos dos monstros aceleram recarga. **Itens não concedem Chakra diretamente**: podem melhorar a velocidade de recarga.
- Ao subir de nível, **bolha de invulnerabilidade por 3 segundos**.
- Hordas contínuas, sem ondas como ciclo principal. **Cada monstro derrotado conta exatamente +1 kill**. Meta: suportar até **1500 inimigos vivos simultaneamente** com bom desempenho, sem afirmar que já há benchmark. Referência de objetivo de fluidez ~240 FPS no hardware-alvo, não garantia.

## 4. HUD e menus — posicionamento exigido

| Região/tecla | Conteúdo |
|---|---|
| Superior esquerdo | Retrato/identidade do shinobi, **nível desde o início**, HP, Chakra e informações básicas |
| Superior direito | **Minimapa permanente** |
| M | **Mapa grande** de toda a região, com eventos descobertos |
| Centro inferior | Habilidades automáticas e **Ultimate** com tecla R, indicador de carga e estado Y |
| **Acima das habilidades** | **Pílulas/vitaminas** equipadas e seus efeitos/níveis |
| Inferior direito | **Todos os itens adquiridos**, ícones pequenos e **quantidades/empilhamentos** |
| Tab | Ficha completa, itens atuais, itens **planejados na build**, itens arquivados, habilidades disponíveis no pool, habilidades equipadas, pílulas e atributos |

- Referência de interface: screenshots do **PokéBonk** enviados pelo usuário, com painéis escuros, cartões e ícones, sem copiar cegamente a identidade visual.
- A **ficha** precisa mostrar contribuição de cada origem: atributos base, ganhos por nível, árvore permanente, itens, pílulas, passivas de aliados, buffs/debuffs de eventos. Distinguir bônus aditivos de multiplicadores **[x]**, e apresentar valores finais e, quando possível, subtotais.
- Configurações gráficas: limite de FPS, escala da interface, transparência, taxa do minimapa, simplificação de inimigos, densidade de efeitos, números de dano, tela cheia, qualidade visual e opção H. Interface deve ser legível mesmo com muitos inimigos.
- Ranking de kills: **local**, comparando runs anteriores inclusive do próprio jogador, atualização durante a partida a cada kill; indicar posição, meta para superar recorde, filtros futuros por ninja/mapa/dificuldade, tela de fim com dano por fonte, DPS, tempo, recompensas. Ranking global exigirá backend e **não deve ser simulado como online**.

## 5. Drops e economia em combate

- Diferenciar visualmente os drops: **XP (azul)**, **dinheiro/Lamens (amarelo)**, **acelerador de recarga da Ultimate (roxo)**. O usuário reclamou explicitamente de enxergar só XP + dinheiro e não reconhecer o terceiro tipo.
- Recompensas variam com categoria do inimigo e dificuldade: XP, dinheiro e recarga de Ultimate. Inimigos mais fortes podem dar mais, sem conceder duas vezes a mesma recompensa de abate.
- **Lamens**: moeda de **progressão permanente**, distinta do Chakra. Ganha por partidas/conquistas; compra desbloqueio de itens não comuns **antes da run** e **todos** os upgrades/níveis da árvore permanente. Desbloquear item significa **inseri-lo no pool aleatório**, não recebê-lo imediatamente na partida.
- Itens **comuns** entram no pool sem compra. Não confundir Lamens com drops temporários ou Chakra.

## 6. Mapas, exploração, descoberta e eventos

- Mundo 3D com cenários inspirados em **Konoha, Suna, Kiri, Iwa, Kumo, florestas, montanhas e dimensões de Kaguya**; cada mapa deve ter terreno, perigos, atmosfera, eventos, recompensas e modificadores próprios.
- Eventos espalhados espacialmente: NPCs, altares, escoltas, defesa, desafios, encontros Edo Tensei, lojas, pactos, chefes, bijuu etc. Podem trazer bônus, maldições, dificuldade extra e recompensas. **Não aplicar penalidade/emboscada obrigatória ao Remédio do Rock Lee.**
- **Regra de descoberta:** um evento só passa a aparecer no minimapa e no mapa completo **depois que o personagem realmente o avistou na tela**. Depois de visto, deve permanecer registrado mesmo fora do campo de visão. Não revelar eventos apenas por proximidade ou antecipadamente.
- A câmera, ângulo, oclusão e campo de visão precisam ser considerados na descoberta; visibilidade do mundo e obstrução de navegação **não** devem impedir acerto de habilidades em inimigos que estejam dentro de uma área válida.
- Mini mapa orientado de modo consistente (por exemplo norte fixo) com seta de direção do jogador/câmera; terreno e construções representados gradualmente. M abre mapa grande; Tab abre ficha, não mapa.

## 7. Habilidades, identidade e RNG

- Cada habilidade tem identidade própria **desde nível 1**, sem depender de itens para ganhar status ou mecânica: dano bruto, dano persistente, perfuração, projéteis, crítico, controle (hard CC), suporte/setup e mobilidade.
- Geometrias compatíveis: círculo, cone, onda de choque, projétil perfurante, bumerangue, ataque em V e outras.
- Escalamentos por habilidade, quando fizer sentido: dano, área, quantidade de projéteis, velocidade/cadência, duração, chance de status, crítico, alcance e limites específicos.
- Buffs/setup como **Oito Portões**: bônus temporários de dano, movimento e velocidade de ataque, com sinergias/trade-offs e rotações.
- Habilidades do pool de level-up recebem **afixos aleatórios por raridade**, respeitando compatibilidade. Setup prioriza cooldown/duração e pode rolar intensidade de buff; ofensivas priorizam afixos próprios da geometria (projéteis, área, dano, crítico, status etc.).
- Faixas provisórias mencionadas: duração até **+10%** comum, acima de 10% até **+15%** incomum, progredindo nas raridades até teto provisório de **+45%**; **tiers exatos ainda não fechados**. Raridades superiores podem oferecer linhas adicionais.
- Level-up também oferece atributos básicos. Esgotado o pool elegível, níveis posteriores aumentam diretamente atributos da ficha, **exceto XP%**. Raio de coleta pode crescer, mas deve ser limitado às dimensões da tela visível em pixels.
- Há planejamento de **fusão de habilidades em Ichiraku**, consumindo duas habilidades normais e mantendo a Ultimate natural; implementação e fórmulas ainda pendentes.
- Há conceitos de itens lendários distintos para aumentar **nível máximo de habilidades 9→12** e **limite de pilhas 7→13**. Não confundir esses dois sistemas.

## 8. Itens, raridades e pílulas

- Objetivo de aproximadamente **80 itens**, abrangendo dano total, dano por status/DoT, crítico, Taijutsu, Ninjutsu, Genjutsu (sobretudo status), área, projéteis, velocidade, coleta, Luck, aliados, cooldown e utilidade.
- Raridades: comum, incomum, raro, épico e lendário; upgrades/afixos e limites por item precisam de balanceamento.
- Exemplos de progressão de dano crítico por raridade citados: comum +10%, incomum +20%, épico +40%, com limites de cópias individuais conforme item (exemplos até 10). **Não generalizar estes valores para todos os itens**.
- Lendários são desbloqueados pré-run com Lamens, entram no pool, e cada um tem **limite próprio de cópias na partida** (alguns 1, outros 2); compra não entrega o item automaticamente.
- **Remédio do Rock Lee**: primeiro lendário; tema saquê/Punho Bêbado; buffs de combate como dano, cadência, movimento/evasão; **sem debuff, penalidade ou emboscada obrigatória**.
- **Shuriken Selo da Tenten**: +30% dano total; quando ativa seu efeito, sela instantaneamente alvos shinobi. **Frequência do proc, tratamento de elite/chefes e balanceamento pendentes**.
- Referências a itens de Luck como colar Hashirama/Tsunade, bolsa de dinheiro/alcance, bônus para suportes e captura; alguns são propostas ainda não fechadas.
- **Shisui** NPC vende/esquece pílulas: remover **todas** as contribuições da pílula e **recalcular atributos derivados a partir das fontes de verdade**; sem buffs residuais ou stacking indevido.
- **Orochimaru é NPC, não item**.

## 9. Aliados, selamento e sinergias

- **Capacidade exata:** **3 aliados de suporte base +1 por item obtido na partida +1 por passiva permanente comprada com Lamens = 5 suportes máximo** nas regras atuais. **O shinobi principal não conta**. Não transformar o +1 permanente em vários níveis por suposição.
- Cada suporte fornece **1 buff passivo único** ao grupo e **1 habilidade de dano moderado**, escalando com nível do jogador. Itens podem aumentar dano/cadência do suporte e intensidade de seu buff.
- Sinergias de afinidade do protagonista, vila e equipes canônicas (ex. Time 7). Bônus secretos multiplicativos para 3, 4 ou 5 suportes da mesma vila/equipe; protagonista excluído da contagem de vila. Composição mista, como 3 Folha + 2 Areia, recebe sinergia reduzida; ativação exibe notificação. **Percentuais exatos pendentes**.
- Tema dos encontros: **Kabuto usando Edo Tensei** para ressuscitar shinobi hostis misturados às hordas.
- **Dois caminhos separados de selamento**:
  1. **Suporte temporário na run:** megaelite com até **3 tentativas** de selamento. Se falhar todas, escapa e não fornece buff pós-selamento, mas mantém recompensas de derrota previstas. Selamento bem-sucedido pode recrutar suporte ou convertê-lo em **item kunai**, com raridade aleatória influenciada por Luck.
  2. **Desbloqueio permanente de shinobi jogável:** megaelite com menos HP que variante suporte e **1 tentativa** de selamento, RNG influenciado por Luck, itens e passivas de captura da árvore.
- Separar bônus de selamento de RNG de captura; não duplicar recompensa de kill quando derrotar/selar.
- Futuramente, variantes cosméticas raras de shinobi (conceito semelhante a shiny), sem necessariamente alterar poder.
- Ainda não fechados: fórmulas de chance, spawn dos encontros, comportamento de falhas, valores de sinergia e regras detalhadas de conversão em kunai.

## 10. Inimigos, elites, chefes e performance

- Classes normal, elite/épico, lendário, **megaelite**, chefe/bijuu; escalamento com dificuldade do mapa e progressão da run.
- Elites comuns: **sem barra de HP**, distinção por contorno colorido e recompensas. Megaelites e chefes: **barras de HP visíveis**.
- Shinobi aleatórios hostis, chefes e bestas com cauda. Encontros e eventos devem ter leitura visual clara.
- 1500 inimigos vivos é **meta de capacidade**; otimização futura com pooling, instancing/batching, culling, LOD, spatial hashing, separação simulação/render, minimização de partículas/números e testes de FPS. **Não alegar que o protótipo já sustenta 1500 em FPS-alvo**.

## 11. Personagens e NPCs

- Protagonistas planejados/iniciais: **Naruto Genin, Gaara Genin, Madara e Hashirama**; outros jogáveis desbloqueáveis via progressão/selamento.
- NPCs discutidos: **Shisui** (pílulas), **Orochimaru**, **Guy**, **Ichiraku**, sapo sábio, NPC de máquina/roleta e **Kabuto** como eixo dos encontros Edo Tensei. Alguns papéis são conceituais.
- Ultimate natural por personagem e disponível desde nível 1, não deve ser removida por fusão de habilidades.

## 12. Histórico cronológico dos protótipos e reclamações do usuário

Todas as versões citadas foram trabalhadas em **05/11/2026**; não há horário exato confiável por mensagem. Nomes abaixo são referências aos arquivos conhecidos.

| Versão | Evolução / observação | Limitações |
|---|---|---|
| v0.1–v0.3 | Protótipos iniciais, arquivos históricos disponíveis | Não são base atual |
| v0.4 | Protótipo Canvas 2D com teste curto em Chromium, HUD/câmera simplificadas, controles básicos | Visuais geométricos, sem mundo 3D |
| v0.5 | Base copiada de v0.4, limite lógico ajustado para 1500 e removida emboscada/debuff obrigatório do Remédio do Rock Lee; docs e artes conceituais | Sem benchmark de 1500, sem relevo/câmera 3D |
| v0.5.1 | **Minimapa superior direito**; tecla M inicialmente alternava sua visibilidade | Usuário corrigiu: M deve abrir **mapa completo** |
| v0.5.2 | HUD e menus para M mapa completo, Tab ficha/build/pool, pílulas acima de habilidades, inventário inferior direito, nível superior esquerdo | Ícones provisórios, ficha parcial, teste visual não concluído nessa entrega |
| **v0.5.3** | Ultimate desde lv1 com R/barra de recarga; recarga passiva provisória de **55 s**; drop roxo para acelerar, XP azul e Lamens amarelos; eventos registrados após descoberta inicial | Descoberta ainda **por proximidade**, não por visibilidade real; continua Canvas 2D, sem 3D |
| Pacote Codex | Consolidação de `game/index.html`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `docs/`, `references/` e `history/` | É entrega de código + planejamento, **não** versão 3D pronta |

**Reclamações e correções explícitas recentes:**

1. O usuário **não conseguia baixar ZIP nem HTML** por links enviados no chat. Foram tentados links alternativos com nomes simplificados e ZIP menor; não presumir que problema de download está resolvido.
2. Pediu minimapa no canto direito; depois corrigiu que **M abre mapa total**, enquanto o minimapa fica sempre visível.
3. **Tab** deve mostrar ficha, itens, itens planejados da build, habilidades disponíveis no pool e demais informações.
4. **Pílulas/vitaminas acima das habilidades**; **itens com ícones e quantidades no inferior direito**; **nível do personagem no superior esquerdo**.
5. Questionou ausência do **botão e Ultimate desde o nível 1**, ausência de drop específico de carga, e como descobrir eventos sem revelá-los antes de avistar.
6. Reiterou exigência de **3D + pixel art + câmera isométrica**, não apenas aparência de 3D em Canvas plano.
7. Pediu **todo o código/projeto** para trabalhar com **Codex**, não apenas uma captura ou ideia.
8. Por fim, pediu **um único arquivo `.md` com todo o contexto deste chat** — este documento.

## 13. Estado técnico real e organização de arquivos

**Código principal conhecido:** `ShinobiBonk_Codex_Projeto_Completo/game/index.html` (v0.5.3, HTML/CSS/JS em arquivo único, renderização Canvas 2D). Sem build, npm ou dependência obrigatória de rede. Pode abrir diretamente em navegador moderno; para servir localmente: `python -m http.server 8000` e acessar `/game/`.

**Projeto Codex consolidado disponível no ambiente de trabalho da conversa:**

```text
ShinobiBonk_Codex_Projeto_Completo/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── game/index.html
├── docs/
│   ├── 00-LEIA-PRIMEIRO.md
│   ├── 01-CAMERA-MAPAS-EVENTOS.md
│   ├── 02-FICHA-HUD-RANKING.md
│   ├── 03-ALIADOS-E-SELAMENTO.md
│   ├── 04-ITENS-HABILIDADES-ECONOMIA.md
│   ├── 05-PERSONAGENS-E-ROADMAP.md
│   ├── 06-STATUS-V053.md
│   ├── 09-PROGRESSAO-ECONOMIA-RNG-EVENTOS.md
│   └── 10-PLANEJAMENTO-FUSAO-PROGRESSAO-V05.md
├── references/concept_art/  # imagens geradas, NÃO screenshots reais
├── references/screenshots/  # capturas reais do protótipo 2D
└── history/                 # versões antigas disponíveis
```

- Pacote anteriormente gerado: `ShinobiBonk_PROJETO_COMPLETO_PARA_CODEX.zip`, aproximadamente 6,3 MiB (apresentado anteriormente como ~6,6 MB), 27 arquivos informados na entrega.
- A arte conceitual ilustra o objetivo, mas não prova implementação.
- Houve teste curto em Chromium da v0.4 e teste pontual na v0.5.3 de início de partida, Ultimate e consumo de carga, sem erros JS relatados no teste; **não equivalem a validação completa**.
- `v0.5.3` continua usando **Canvas 2D** e câmera plana/simulada. **Não existe motor Three.js/Babylon.js ou mundo 3D implementado** nesta versão.
- O limite de 1500 é um ajuste/meta lógica; não foi comprovada performance. O sistema de ranking é local; não existe servidor global.
- Os sistemas avançados de aliados/selamento, mapas 3D, pool completo de 80 itens, efeitos e estatísticas completos estão em diferentes graus de planejamento; verificar código antes de marcar IMPLEMENTADO.

## 14. Prioridades objetivas para o Codex

1. **Ler** `AGENTS.md`, `README.md`, `docs/00-LEIA-PRIMEIRO.md` e este contexto. Inspecionar `game/index.html` antes de alterar; manter changelog.
2. **Migrar para cenário 3D real**, com câmera isométrica orbital 360°/pitch/zoom, movimento relativo à câmera, salto, terreno elevado e billboards mini pixel art. Escolher arquitetura leve e avaliar dependências/licenças. Manter versão jogável.
3. Corrigir **descoberta de eventos por visibilidade na tela** (não proximidade) e registro persistente no minimapa/M, com navegação e sinalização.
4. Consolidar HUD: nível superior esquerdo; minimapa superior direito; **M mapa completo**, **Tab ficha/build/pool**; pílulas acima das habilidades; inventário inferior direito com ícones e quantidades; Ultimate R desde lv1, Y automático e drop roxo visível.
5. Garantir invariantes: slots 1–4 automáticos, +3s invulnerabilidade no level-up, drops separados, aliados 3+1+1, ausência de debuff/emboscada do Remédio, habilidades atravessando obstáculos para hits válidos.
6. Modularizar código gradualmente; criar testes reproduzíveis para input, cooldown, saves, inventário, eventos e contagem de kills; **medir** FPS e consumo antes de alegar 1500 inimigos fluídos.
7. Implementar ficha por fontes, árvore Lamens, pool/raridade/afixos, selamento e sinergias em etapas verificáveis.
8. Manter screenshots **reais** separados de **conceitos**, com nome de versão e estado de teste.

## 15. Critérios mínimos de aceite da próxima entrega 3D

- Abrir no navegador e mostrar cenário tridimensional **com elevações identificáveis**, mini pixel-art do ninja e inimigos orientados à câmera.
- Mouse gira horizontalmente 360° e altera pitch até vista superior; WASD segue orientação coerente; personagem pula.
- HUD no layout pedido; Ultimate disponível no nível 1 e R/Y funcionando; XP, Lamens e carga da Ultimate distinguíveis.
- Evento fora da visão **não** consta do mapa; ao entrar no campo de visão, passa a constar no minimapa e no mapa M, persistindo após sair da visão.
- M abre mapa total, Tab abre ficha, H oculta efeitos sem desativar dano; habilidades 1–4 continuam automáticas.
- Relatar testes executados e limitações reais; não afirmar suporte estável a 1500 inimigos sem medição.

## 16. Decisões ainda em aberto

- Fórmulas e probabilidades de selamento/captura, efeitos exatos de Luck, raridade da kunai, limites de suporte além do máximo atual, spawn dos encontros.
- Percentuais de sinergia de vila/equipe, bônus do protagonista, força dos aliados e valores finais dos itens.
- Faixas exatas de afixos por raridade e compatibilidade individual de cada habilidade.
- Detalhes de mapas, eventos, condições climáticas e progressão de dificuldade.
- Frequência de ativação do Shuriken Selo da Tenten e efeito em elites/chefes.
- Duração final da recarga de cada Ultimate (55 segundos na v0.5.3 é **provisório**).
- Escolha da engine 3D, pipeline de arte, licenciamento dos ativos, persistência/backend e desempenho real.

## 17. Regras para continuidade

- **Este arquivo é documento de contexto**, não substitui o código-fonte nem a leitura dos docs técnicos. Para implementar, use o pacote do projeto completo.
- Tratar a intenção confirmada do usuário como requisito; documentar desvios do protótipo.
- Preservar cronologia e distinção entre **desejado, feito e testado**.
- Quando o usuário solicitar um ZIP, verificar integridade e caminho; como houve falhas de download, oferecer alternativas concretas sem prometer que links sempre funcionarão.
- Atualizar este contexto ao fechar novas decisões relevantes, preferindo registro incremental em Markdown e CHANGELOG; não presumir sincronização automática entre conversas.

---

**Resumo para iniciar outro chat ou Codex:** Desenvolver ShinobiBonk como roguelite survivor browser-first, mundo 3D isométrico com mini sprites pixel-art, câmera orbital 360°, hordas contínuas, habilidades 1–4 automáticas, Ultimate natural desde lv1 com R/Y e drops roxos, minimapa fixo e mapa total M com eventos revelados somente após vistos, Tab ficha/build/pool, pílulas acima de habilidades, itens/quantidades à direita, nível à esquerda, Lamens para desbloqueios permanentes, suporte 3+1+1, sistema Edo Tensei de selamento e meta de 1500 inimigos **a ser validada**. Código atual v0.5.3 é Canvas 2D, portanto a implementação 3D é a principal tarefa pendente.
