# CHANGELOG

## Ações, ofertas e interface da missão

- Adiciona conjuração do Naruto Clássico, arremesso/pulo/dash do Sasuke inicial e socos e chutes nas três formas de Rock Lee e Might Guy.
- Cada pílula ganha um nível por carta. Raridade aumenta a potência. Inclui Pílula de Incenso e confirma a Pílula do Pergaminho como fonte de experiência.
- Banimento exclui o mesmo nome em qualquer nível e raridade. O clique identifica a carta exibida para evitar selecionar um índice antigo.
- Adiciona confirmação de desistência na pausa, botão Ir para o menu no resumo, dock de pílulas compacto sem faixa e símbolo das bijū no portal da arena.
- Oculta o cursor no cenário durante a partida, mantém a velocidade durante a transição para diagonais e melhora o apoio e a visibilidade perto das estátuas.

## Caminhada direcional de todo o elenco

- Adiciona folhas direcionais às 45 formas dos 20 shinobis restantes. O elenco de 24 shinobis passa a ter 56 formas com caminhada por quadros, baseada na arte de repouso de cada forma.
- O jogo escolhe a dupla de fileiras da forma ativa e espelha o movimento para a esquerda. A pose parada conserva o sprite estático.

## Folhas do Time 7, terreno e regras de oferta

- Integra folhas direcionais de caminhada ao Naruto Clássico, Shippuden e Manto da Kyuubi, e às três formas de Sasuke e Sakura. As folhas de Sasuke e Sakura seguem a arte estática de cada forma. A Sakura inicial mantém o cabelo longo, traje da Academia e cores ao começar a caminhar.
- Girar e inclinar a câmera passou a ser pelo movimento do mouse, com clique direito para fixar alvo. O terreno ganha montanhas externas e elevações internas, com céu em gradiente conforme o clima.
- Pílulas e técnicas aparecem como escolhas apenas na subida de nível. A roleta mantém sua economia e penalidades, mas o prêmio de equipamento só vem como item. A roleta e as recompensas do mapa deixam de conceder pílulas. A fila de itens preserva a opção de aceitar ou vender.
- O número de ofertas fica limitado a quatro mesmo quando Sorte, passiva permanente e banimento se combinam.
- Build, regras e 29 verificações no navegador passaram. A captura em ângulo baixo registra o terreno visível até o rodapé e o shinobi em foco na Vila da Folha.

## Animações do elenco e correções de partida

- Asuma ganha atlas original 4×4. O retrato usa a célula de repouso e a partida usa quadros de caminhada, salto, dash, dano, selo, lâminas e Ultimate.
- Os 24 shinobis jogáveis e suas formas usam poses de movimento e combate a partir do próprio sprite. Naruto Academia mantém suas folhas dedicadas. As formas sem folha dedicada usam deformação localizada dos braços e pernas.
- Prêmios de item e pílula da Tsunade entram numa fila salva na partida. Pílulas encontradas no chão também pedem confirmação. E aceita e V vende a recompensa exibida.
- Sinergias contam ajudantes recrutados que tenham o mesmo ID do jogador. O personagem controlado fica fora da contagem.
- O HUD mostra o total real de inimigos vivos. A horda escala até 1.600 e o mapa limita apenas seus marcadores. A câmera volta a inclinar até aproximadamente 7°.
- Adiciona o registro contínuo de pedidos e respostas em `docs/14-CONTEXTO-DO-CHAT.md`, integrado à skill de documentação.
- Validação no navegador com 28 verificações, incluindo Asuma, ordem dos prêmios e contagem de 1.600 inimigos.

## 2026-11-06 — Asuma (teste da skill de arte)
- Asuma Sarutobi jogável e liberado desde o início (`STARTER_HEROES`): Lâminas de Chakra (Vento, Cone) e Cinzas Ardentes (Fogo, Área) como únicas, Kunai Tática e Grande Vendaval compartilhadas; naturezas Vento/Fogo; sprite pixel art por código (`asuma-1.svg`). PROPOSTO para revisão de arte no padrão do atlas (Codex).

## 2026-11-06 — falas de técnicas sem spam
- `sfx.ts`: técnicas comuns falam no máximo 1 vez a cada 60 s por técnica e 15 s entre falas (`VOICE_RULES`); a Ultimate sempre fala. Antes o Kage Bunshin (técnica inicial do Naruto) repetia a fala a cada 6,5 s.

## 2026-11-06 — HUD: cartões de ajudante compactos
- Com 4+ ajudantes os cartões ficam compactos e a coluna termina antes do dock de técnicas/pílulas, com rolagem (`allies.css`).

## 2026-11-06 — Ryu em formato curto
- `src/game/format.ts` (`compactNumber`): Ryu do HUD em formato curto (1,2 mil · 2,0M · 5,0B · 3,0T; acima disso notação científica), valor exato no tooltip.

## 2026-11-06 — técnicas por fase, escala/Final Swarm, pílulas com raridade, sorte, roleta e economia exponencial
- **Técnicas por fase da obra** (`PHASE_LEVELS` em heroes.ts): Naruto começa com Kage Bunshin; **Invocação do Sapo** (compartilhada com Jiraiya; Kuchiyose: Yatai Kuzushi, Neutro, Área, atordoa) no Nv. 10; Rasengan Nv. 15; Modo Sábio Nv. 25. Revisão por estreia na Narutopedia em Sasuke, Sakura, Itachi, Minato, Tsunade, Jiraiya, Lee, Neji, Hinata e Shikamaru. 70 técnicas.
- **Itens só por interação**: removido o drop de item por abate (era a origem dos itens no nível máximo; a emboscada só aumentava os abates). Nível máximo dá só Treino.
- **Pílulas**: raridade pela Sorte (Comum 1 nível … Lendário 5); pílula no limite não aparece em cartas, drops nem roleta; tudo no máximo vira Treino.
- **Sorte**: `rollItems` sorteia a raridade e depois o item (antes caía em Comum quando a raridade não tinha item desbloqueado); Comum cai mais rápido com a Sorte.
- **Horda e escala**: spawn em lote (`SPAWN_RULES`), tempo total da run para a ameaça, teto até 1600, HP ×(1+0,3·min)·1,15^min; técnicas ganham +30% a +250% de dano por level-up.
- **Final Swarm**: ao zerar o tempo, aviso, relógio "+m:ss" de sobrevivência e dificuldade ×3 crescendo +25% por minuto (`FINAL_SWARM`).
- **Roleta**: nerf 2 (boas ~35% com Sorte 0), porcentagens exibidas = sorteio real, entrega total verificada, ícones do atlas novo.
- **Economia exponencial**: kunai/shuriken 20×1,5^usos, roleta 30×1,35^giros, mercador ×1,35, tudo ×1,15 por minuto de run (`PRICE_INFLATION`); kunai chega a milhões no late game.
- Verificação: tsc, verify-rules e verify-runtime (24 checks) passaram nos subagentes.

## 2026-11-06 — roleta nerfada e corrigida, sorte recalibrada
- **Roleta da Tsunade — entrega corrigida**: bênçãos iguais agora acumulam (até 3×) em vez de se sobrescrever; pílula que chega no limite vira Ryu; item que já está no limite vira Ryu em vez de travar a escolha.
- **Roleta — nerf**: giro 30 Ryu +10 por giro; casas boas reduzidas (kunai/shuriken/pílula 9, Ryu 7, bênção 6, item 4, Sorte Grande 1) e ruins/vazia aumentadas (dívida 12, azar 10, credores 9, vazia 17). Boas: Sorte 0 = 48% (antes 63%), Sorte 200 = 77%.
- **Sorte**: curva de raridade bem mais sensível (raro ou melhor: Sorte 0 ≈ 0,7%, 20 ≈ 6%, 50 ≈ 15%, 100 ≈ 26%); chance de +1 carta nas ofertas (Sorte/150, até 60%); drop de pílula ×(1 + Sorte/100) e de item ×(1 + Sorte/150).

## 2026-11-06 — escala dos inimigos e hordas
- `difficultyAt` (`progression.ts`): HP dos inimigos ×1,10 por minuto e dano ×1,05 por minuto (além do crescimento linear), resistência a dano de +1,5% por minuto até 60% (`armor`, somada à defesa do tier), teto de inimigos até 1400 e spawn mais rápido (mín. 0,03 s). Constantes em `ENEMY_SCALING`. Ex. Genin: 10 min = HP ×8,3, 320 inimigos; 30 min = HP ×133, 1400 inimigos, 45% de resistência.
- Crescimento por nível do shinobi segue linear (+3%): o nível passa de 1000 (referência do PokéBonk); o dano massivo deve vir de técnicas, projéteis, críticos e itens.

## 2026-11-06 — elemento base e bônus de natureza
- Shinobis aprendem só Neutro + elemento base (afinidade) + elementos do próprio kit (+ Sábio para usuários do Modo Sábio); o Naruto deixa de aprender todos os elementos.
- Técnicas do elemento base causam ×1,5 de dano (`NATURE_BONUS` em `heroes.ts`, aplicado em `itemDamageBonus`); o Plano de build mostra o bônus.

## 2026-11-06 — técnicas básicas da Academia
- `ACADEMY` em `heroes.ts`: sempre no pool, liberadas cedo, dano baixo, melhoram no level-up. Para todos: Técnica de Substituição (Nv. 2, ao redor, atordoa), Chute Giratório (Nv. 2), Bomba de Fumaça (Nv. 3, lentidão). Por natureza: Katon: Fagulha, Suiton: Jato d'Água, Fuuton: Rajada (Nv. 3), Doton: Pedregulho, Raiton: Faísca (Nv. 4). Lee e Tenten (sem natureza) só recebem as neutras. Plano de build mostra "Básica da Academia" (sem exigir pesquisa).
- Verificação: tsc, verify-rules e verify-runtime passaram.

## 2026-11-06 — técnicas liberadas por nível na fase certa
- Modo Sábio do Naruto só no nível 25 (forma Shippuden); Amaterasu do Sasuke no nível 25. O painel do shinobi mostra o nível de liberação de cada técnica do kit (Nv. 1/5/12/20 por padrão, com ajustes por personagem).

## 2026-11-06 — alvo fixo, ordem do elenco e card de missão
- **Alvo fixo**: clique com o botão direito (sem arrastar) fixa o alvo com prioridade guardião > Mega Elite/Shinobi para selar > elite > maior HP entre os visíveis até 30 m; anel vermelho no alvo; as técnicas miram nele quando está no alcance; clicar de novo solta. Arrastar continua girando a câmera.
- **Elenco ordenado**: jogáveis primeiro; bloqueados por dificuldade da missão (Genin → Kage) e Lendários por último.
- **Card de missão** em camada fixa por cima da grade (antes ficava atrás dos outros cards).

## 2026-11-06 — Kushina, missões com história e abates, mapas em sequência, pausa corrigida
- **Kushina Uzumaki** (Narutopedia: Vento/Água/Yin, Clã Uzumaki, Correntes de Selamento Adamantinas, Habanero Sangrenta): 2 únicas (Correntes de Selamento, linha que paralisa; Habanero Sangrento, setup), kit com Kunai Tática e Dragão de Água, Ultimate Prisão de Correntes da Kurama, buff de ajudante Correntes Adamantinas, sprite pixel art SVG e nova sinergia Clã Uzumaki. Missão: Folha · Jonin · 500 abates · 5 min, depois de selar Minato.
- **Missões de desbloqueio** com requisitos de **história** (ex.: Neji só depois da Hinata, Hashirama depois da Tsunade, Tobirama depois do Hashirama, Madara depois do Hashirama e Itachi) e **abates na run**. Novo card de missão (história, onde jogar, checklist) no hover da seleção, no painel do shinobi bloqueado e na tela do mapa.
- **Mapas em sequência**: Areia só após vencer o Genin da Folha, Pedra após o Genin da Areia, Névoa após o Genin da Pedra; dificuldades seguem por mapa.
- **Pausa**: barra de comandos e botões fixa no rodapé da tela (antes era cortada); texto de teclas da ficha oculto na pausa.
- **Direção de arte** registrada no AGENTS.md.
- Verificação: tsc, build, verify-rules (23 shinobis, 69 técnicas) e verify-runtime passaram; teste de navegador da pausa, seleção e mapa.

## 2026-11-06 — tela Escolha o mapa
- `src/ui/MapSelect.tsx` + `src/map-select.css`: abas dos 4 mapas com progresso, prévia grande da região (selos de elemento, descrição, climas, shinobi escolhido com Trocar, shinobis para selar no mapa, guardiões por zona) e painel Preparar partida (modo Clássico; Sobrevivência em breve; dificuldades com multiplicadores e cadeados; build selecionada; mochila em breve; Bolsa da Missão com predefinições; Começar com Enter).
- verify-runtime passa a iniciar pelo botão Começar.

## 2026-11-06 — Configurações completas
- Tela de Configurações no formato da referência (Som, Gráficos, Tela, Controles, Teclas, Interface, Idioma, Conta), salva na hora e aplicada ao vivo: volume/efeitos/vozes, qualidade, limite de FPS, resolução, tela cheia, sensibilidade e inversão da câmera, distância da câmera, teclas remapeáveis, tamanho/opacidade do HUD, minimapa, avisos, nome do jogador e reinício/apagar dados. Itens sem suporte aparecem como "em breve".
- Verificação: tsc, build, verify-rules e verify-runtime passaram.

## 2026-11-06 — 4 mapas, missões de desbloqueio, Lendários, pausa no Esc e salvar/retomar
- **Pool de técnicas**: só o kit no começo; técnicas de outros (inclusive Naruto/Sasuke/Sakura) entram só depois de selá-los.
- **Mapas**: Folha, Areia, Pedra e Névoa Oculta, com tema, clima, cenário, zonas e guardiões próprios; Chunin/Jonin/Kage liberam ao vencer a dificuldade anterior em cada mapa.
- **Missões de desbloqueio** para os 19 shinobis bloqueados (mapa + dificuldade + minuto); **Lendários** Madara e Hashirama com retrato oculto. Seleção mostra silhueta com símbolo da vila e a missão ao passar o mouse.
- **Esc**: ficha com rodapé de comandos e ações (Desistir, Salvar e sair, Reiniciar, Mapa grande, Tela cheia, Preso, Mapa, Configurações, Relatar, Continuar); ajuda removida do HUD.
- **Salvar e retomar** a run (manual, automático a cada 15 s e ao fechar).
- Verificação: tsc, verify-rules, verify-runtime e teste de navegador (19 bloqueados, tooltip do Lendário, 4 mapas, 3 dificuldades bloqueadas, pausa, salvar e retomar no mapa da Areia).

## 2026-11-06 — técnicas únicas, selamento de conta, tipos de inimigo, debug completo e ímã de drops
- **Técnicas**: 1–2 únicas por shinobi + 26 compartilhadas (67 no total; duplicatas removidas). Pool por vila/elemento canônico; únicas de outros só após selar o dono. Plano de build mostra a origem e exige 100% de **pesquisa** (nova passiva Pesquisa).
- **Conta**: iniciais Naruto/Sasuke/Sakura; os demais 🔒 até selar o **Shinobi para selar** (contorno ciano, 1º encontro especial da run), que só desbloqueia na conta.
- **Inimigos**: **elite amarelo** (contorno, não capturável, mais forte e resistente, mais saque), **Mega Elite** (contorno vermelho, capturável como ajudante, sem técnicas, muito mais saque). Saque escala com HP e dificuldade.
- **Debug**: 41 parâmetros (todos os atributos do personagem, elites, EXP/curva, Ryu, Chakra, lamen, kunais no chão, preço da kunai) como base Genin; dificuldades multiplicam por cima.
- **Drops**: coleta por ímã dentro da área de coleta, teto de 260 com fusão, materiais compartilhados; kunai/shuriken no chão com sprites desenhados.
- **Mapa**: inimigos no mapa só quando visíveis na câmera; câmera inclina mais (pitch 0,08) e descoberta até 60 m.
- **Arsenal da Tenten** substitui o Sharingan de Kakashi (cópia de item).
- Verificação: tsc, build, verify-rules (asserts das regras de técnica) e verify-runtime passaram; teste de navegador para elite, Shinobi para selar (desbloqueou Kakashi), kunai e debug.

## 2026-11-06 — Passivas Shinobi, Bolsa da Missão, mapa com rota, drops novos e cores de ganho/perda
- **Passivas Shinobi** (antiga Progressão): 24 nós em Treinamento/Equipe da partida; novos Chakra Curativo, Expansão, Farmacologia Ninja, Selo de Ressurreição, Baú do Clã, Meditação de Chakra, Bolsa Grande e **Treinamento com Jiraiya** (técnicas favoritas aparecem mais). Pesquisa PENDENTE.
- **Bolsa da Missão**: abas, busca, capacidade em casa, prioridade ★, predefinições 1–4 e hudzinho. "Arquivar" virou **Deixar em casa**; itens em casa não entram no pool.
- **Mapa M/Tab**: ícones e retratos do que foi visto, rota por clique ou ping, seta e metros na HUD, "Chegou!" e limpeza automática.
- **Drops com sprites próprios**: XP = essência roxa (8/25/100, tamanho por tier), Chakra = orbe azul, Ryu = moeda 両, pílula e pergaminho; nova **tigela de lamen** (15% por abate) que cura 35% do HP. Invariante de cores atualizada no AGENTS.md.
- **Cores**: ganhos em verde e perdas em vermelho nos cards (BuffText).
- **Terminologia**: "cadência" virou **velocidade de ataque** em todo o jogo e nos docs.
- **Pain = Nagato** (Clã Uzumaki) controlando o corpo do Yahiko (sem clã), conforme a Narutopedia. Ebisu e Iruka ganharam sprites pixel art no estilo do elenco.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram; testes de navegador à parte para Passivas/Bolsa/Jiraiya, mapa/rota, sprites dos NPCs e drops (lamen curou 20 → 49,75 de 85 HP).

## 2026-11-06 — elementos corrigidos pela Narutopedia
- `HERO_NATURES` com as naturezas canônicas dos 22 shinobis (Narutopedia, Nature Type); `heroAffinity` passa a usar a afinidade marcada na wiki ou a primeira natureza canônica do kit, em vez de contar elementos do kit.
- Técnicas sem natureza canônica viraram Neutro: Furacão da Folha, Palma de Ar, Palma do Vazio, Kunai Explosiva, Tigre do Meio-Dia, Bansho Tenin, Kuroari, Chuva Venenosa. Pain ganhou Clã Uzumaki.
- Verificação: tsc, vite build, verify-rules e verify-runtime passaram.

## 2026-11-06 — combos de aldeia, afinidade de ajudantes, substituição e Roleta da Tsunade
- **Combos de aldeia/organização** (`synergy.ts` reescrito): contam só ajudantes; faixas 2/3/4/5 por aldeia com família de atributo própria (Folha projétil/XP/coleta, Nuvem dano, Névoa crítico, Pedra armadura/HP, Areia área, Som cadência, Chuva status, Cachoeira cura, Grama Ultimate); nenhum combo junta dano % e projétil. Organizações acumulam (Akatsuki, Sannin, Hokages, Time 7, Time Guy, clãs, Ino-Shika-Chō, Time 8, Sete Espadachins).
- **Afinidade de ajudante** 1–5: sobe com tempo e abates; a passiva individual escala de 40% a 100%. Projétil fracionário vira chance (`projectileChance`).
- **Equipe cheia → tela de substituição** (choiceLevel −7): clicar no novo dispensa; clicar num atual substitui.
- **Configurações** no hub (`settings.ts`): desligar card/animação de captura.
- **Roleta da Tsunade** substitui o Caça-níquel e absorve a Bênção de Tsunade: overlay animado, casas boas e ruins, giro rápido segurando E (liga/desliga), E repetido mostra o resultado na hora, prêmios entregues ao sair, custo 25 +5 por giro, Sorte melhora as chances com piso de 15% de casas ruins e a dificuldade compensa.
- **Item novo**: Carteira Gama-chan (Raro): +12% Ryu, −6% custo da roleta, +1% dano a cada 250 Ryu gastos (até +30%).
- **Verificação**: tsc, vite build, verify-rules (94 itens) e verify-runtime passaram; testes de navegador à parte para combos, afinidade, configuração, substituição e roleta (inclusive estatística). Balanceamento PENDENTE.

## 2026-11-06 — velocidade de projétil, setups, Senjutsu, Ebisu, Iruka e Naruto Totem
- **Cadência** revisada: também acelera os ajudantes (metade do bônus) e os procs periódicos de item.
- **Velocidade de projétil** (atributo novo): acelera a viagem dos projéteis e o preparo dos golpes e lançamentos. Itens novos: Lente do Atirador e Seixo Polido do Rio (com ricochete); pílula nova: Pílula do Arremesso. Itens de pulo/deslize ficam PENDENTES.
- **Técnicas de setup** (buff puro, automáticas): Portões do Inferno (Lee), Portão da Dor (Guy), Byakugou (Tsunade), Modo Sábio (Naruto, Jiraiya). Cards mostram recarga, duração, bônus, % do tempo ativo e acumulável. A Ultimate da Tsunade virou Invocação de Katsuyu.
- **Modo Sábio**: elemento Sábio e taijutsu corpo a corpo em área. **Linha Senjutsu** em ninjutsu: 25% de chance de um extra de 1,5× o dano.
- **Eventos**: Ebisu (troca: ganho × 1,1 de custo), Iruka (lição grátis, pergaminho lendário com −20% de custo, ou Iruka como ajudante de +25% XP) e Naruto Totem (7:00–6:00, clones dão XP, totem dá 2 níveis, não selável).
- **Fonte canônica**: Naruto Wiki/Narutopedia, registrada no AGENTS.md.
- **Verificação**: tsc, vite build, verify-rules (93 itens) e verify-runtime passaram; testes de navegador à parte para velocidade, setups, Modo Sábio, Senjutsu e os três eventos. Balanceamento PENDENTE.

## 2026-11-06 — sinergias, seleção com filtros e guardião invocável
- **Sinergias de vila e organização** (`src/game/synergy.ts`): ativam com 2+ membros (herói + ajudantes, ao menos 1 ajudante), faixas 2/3/4+, acumulam vila + organizações (ex.: Akatsuki). Substituem a antiga sinergia fixa da Areia (Irmãos da Areia completos mantêm +12 armadura/+15% dano). Painel "SINERGIAS" abaixo do card do herói; cartões de ajudante mostram a PASSIVA individual e as tags das sinergias. Dados de clã/organização/afinidade em `heroes.ts` (`HERO_CLAN`, `ORGANIZATIONS`, `heroOrganizations`, `heroAffinity`).
- **Seleção de shinobi** (`src/ui/CharacterSelect.tsx`): grade de retratos com selo de elemento; filtros por vila, elemento, organização/clã e busca; contagem "X de 22".
- **Guardião invocável**: Selo do guardião (E) invoca o guardião da zona quando o jogador quiser; HP × (0,6 + 0,4 × segundos na zona ÷ 160). Continua surgindo sozinho aos 160 s se não for invocado.
- **Plano do Shikamaru** substitui a Provocação do guardião (ex-referência Pokémon): +1 kunai por acionamento ao derrotar o guardião, limite 3 por zona, sem penalidade de dificuldade/saque. Nenhuma referência a Pokémon resta em `src/`.
- **Verificação**: tsc, vite build, verify-rules (com asserts de sinergia) e verify-runtime (24 checks) passaram; testes de navegador à parte para sinergias, filtros (desktop e 375px) e guardião/Shikamaru. Balanceamento PENDENTE.

## 2026-11-05 — catálogo de 91 itens no formato da referência
- **Catálogo:** `src/game/catalog.ts` foi refeito com 91 itens (25 comuns, 27 incomuns, 15 raros, 14 épicos, 10 lendários) seguindo o formato da página de itens da wiki: raridade, efeito, gatilho e limite. Os nomes são ninjas, os valores foram levemente alterados e não há Pokémon.
- **Itens pedidos:** Pergaminho do Monte Myoboku (+28% Sábio) e Pergaminho Genjutsu (+28% Genjutsu), no molde dos pergaminhos de elemento (Katon, Suiton, Fuuton, Doton, Raiton, Mokuton, Areia, Sombra, Neutro).
- **Mecânicas novas na simulação** (`GameCanvas.tsx`, via `Stats.extra`):
  - dano por elemento e Genjutsu, dano condicional e gatilhos por acerto;
  - roubo de vida, espinhos, escudo, fumaça, gelo ao ser atingido;
  - curas (emergência, periódica, por abate) e ressurreição;
  - adrenalina, postura parada e reset da Ultimate;
  - raios e Amaterasu automáticos;
  - descontos de kunai e caça-níquel, quantidade de inimigos e limites de pílula (12) e técnica (11).
  - Todo dano recebido agora passa por `damagePlayer`.
- **Filtros:** `combat.ts` classifica as chaves novas (filtros da loja e o "Melhora:" das cartas).
- **Itens removidos ou trocados:** Insígnia do Comandante, Tambor de Guerra e Selo de Cooperação saíram. O Estandarte da Aliança agora é raro com +40%. A Bandana dá +6 de armadura. A Pedra da Juventude dá +15% de XP.
- **Testes:** `verify-rules.mjs` foi atualizado (≥80 itens, ids únicos, itens pedidos, Selo Amaldiçoado, Fúria da Kyuubi, Genjutsu, gatilhos).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - Pergaminho Fuuton deu ×1,318 no Rasengan;
    - Genjutsu numa técnica de Ninjutsu deu só +3%;
    - Raiz Vampira curou de 20 para 54 de HP;
    - o Escudo bloqueou o 1º golpe;
    - a Ressurreição voltou com 35%;
    - o Chidori Nagashi causou dano sozinho;
    - a pílula chegou ao nível 12;
    - a kunai caiu de 20 para 12 com 5 Pepitas;
    - a loja mostra 91 itens e o filtro Sábio funciona.
- **Não testado:** balanceamento e cada um dos 91 itens individualmente em jogo.

## 2026-11-05 — buff único de cada ajudante
- **Buffs:** novo `src/game/allies.ts` com um buff passivo para cada um dos 22 shinobis (tabela em `docs/03`).
  - Médicos curam (Tsunade +1,5 HP/s, Sakura +1, Hashirama +1,2).
  - Os demais dão o atributo do estilo deles (Naruto +12% dano, Gaara +10 armadura, Neji +30% dano crítico, Tenten +1 projétil...).
- **Na simulação:** os buffs entram em `calculateStats` via `refreshStats` e escalam com a força de suporte. A regeneração genérica de +0,3 HP/s por aliado saiu.
- **Itens:** Estandarte da Aliança e Selo de Cooperação agora reforçam os buffs dos ajudantes; o texto foi atualizado.
- **Cartões:** cada cartão de ajudante mostra o buff real com o valor efetivo.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram, e os testes avulsos anteriores também.
  - Teste novo:
    - os 22 têm buff;
    - os buffs somam e escalam;
    - recrutar Tsunade, Gaara e Tenten deu +1,5 HP/s, +10 armadura e +1 projétil;
    - com o Estandarte, a cura vira +1,8 HP/s e os cartões mostram esses valores.
- **Não testado:** balanceamento em runs completas.

## 2026-11-05 — cartões de ajudantes e Barraca Ichiraku
- **Cartões de ajudantes:**
  - Novos `src/ui/AllyCards.tsx` e `src/allies.css`; a linha de texto "Suportes …" foi substituída por cartões no padrão da referência do usuário.
  - Cada cartão tem: retrato redondo com moldura na cor da técnica, nome, selo da aldeia ou SINERGIA, buff real (regeneração e bônus da Areia), técnica com barra de recarga, elemento, escola, % de dano e intervalo.
  - O snapshot ganhou `allyCharge`.
- **Barraca Ichiraku:**
  - Novo evento no mapa com o sprite da barraca de lámen.
  - Esquecer uma pílula (todos os níveis) ou uma técnica custa 10 + 5 × nível em Ryu, quantas vezes quiser. A última técnica é protegida.
  - Os atributos são recalculados a partir das fontes.
  - A tela é própria ("ESQUECER", "Sair da barraca").
- **Caça-níquel:** saiu "do Ichiraku" do nome e o sprite da barraca passou a ser da Barraca Ichiraku.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Os testes avulsos do Kakashi, dos chefes e do debug continuaram passando.
  - Teste novo no navegador:
    - 3 cartões com SINERGIA, sem cobrir o herói nem as habilidades;
    - Ichiraku recusa com Ryu insuficiente;
    - esquecer a Pílula do Soldado por 20 Ryu baixou o Taijutsu de 120% para 100%;
    - esquecer Kage Bunshin por 15 Ryu;
    - a barraca fechou e não reabriu com só a última técnica.
- **Não testado:** 5 ajudantes ao mesmo tempo em telas pequenas; balanceamento do preço.

## 2026-11-05 — Kakashi interativo copia item da bolsa
- **Novo evento "Sharingan de Kakashi":** NPC com sprite do Kakashi. Ao apertar E, o jogador escolhe 1 item que já carrega e ganha +1 cópia, até o limite do item. Pode ser usado uma vez por zona.
- **Tela da escolha:** própria ("Copiar um item da bolsa"), com selo "CÓPIA", sem Atualizar/Banir. "Cancelar (X)" fecha sem gastar o Kakashi nem os usos de pular. Itens já no limite não aparecem; com a bolsa vazia, só aparece um aviso.
- **Escolha de cartas em geral:**
  - O clique usa o evento `shinobi-choose` (índice) e funciona com qualquer número de cartas; o teclado aceita 1–9.
  - Com mais de 4 cartas, a grade fica em 4 colunas com rolagem (`hud-dock.css`).
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Teste avulso no navegador:
    - sem itens, o Kakashi não abre;
    - com 6 itens (1 no limite), lista 5;
    - X cancela sem gastar;
    - clicar na 5ª carta copiou o Talismã de Vida (1 → 2) e gastou o Kakashi;
    - os usos de pular, atualizar e banir ficaram intactos.
  - O teste dos chefes também passou de novo.

## 2026-11-05 — chefes com barra de vida e técnicas próprias
- Novo `src/scene/bossCombat.ts`, integrado ao `GameCanvas.tsx`.
- **Barra de vida:** mega elites e guardiões ganham barra 3D acima do personagem, com nome; durante um golpe ela mostra "⚠ golpe".
- **Técnicas:**
  - Os chefes usam as técnicas do próprio shinobi contra o jogador. Mega elite: 1 + zona técnicas; guardião: o kit todo.
  - Cada golpe tem aviso vermelho de 1,1 s no chão, no formato da técnica (área, cone, linha, V, anel). Sair da área evita o dano.
  - Golpes com controle deixam o jogador lento.
  - O guardião usa a Ultimate dele uma vez, abaixo de 50% de HP.
- **Valores provisórios:** `BOSS_RULES`.
- **Verificado:**
  - `tsc -b`, `vite build`, `verify-rules.mjs` e `verify-runtime.mjs` (23 verificações) passaram.
  - Um teste avulso no navegador confirmou: barra criada; Gaara conjurando "Agulhas de Areia"; HP 101 → 63 ficando parado; 122 → 122 saindo do "Caixão de Areia"; remoção sem erro.
- **Não testado:** balanceamento em runs completas, guardião usando a Ultimate em jogo real e o aviso em relevo forte.

## 2026-11-05 — login admin removido e debug com ajustes ao vivo salvos
**Login removido**
- Removidos `src/game/adminAuth.ts` (login e hash da senha) e `src/ui/AdminLogin.tsx`.
- O modal de conta não tem mais campos de login ou senha, e os estilos `.admin-login` saíram de `debug.css`.
- Nenhum arquivo do projeto contém o login ou a senha. `Feedback da versão.txt` continua fora do git.
- **Histórico reescrito**, a pedido do usuário. Os commits `be528e9` (que tinha o login e o hash da senha) e `5f81fdf` foram juntados num único commit limpo, `be738b5`, publicado com `git push --force-with-lease`. O GitHub ficou com 1 commit, e os objetos antigos foram removidos do repositório local (`reflog expire` + `gc --prune=now`). O GitHub ainda pode guardar o commit antigo por algum tempo para quem souber o hash exato; o suporte do GitHub consegue apagá-lo de vez.

**Ativação do debug**
- O debug não depende de conta: `debug={import.meta.env.DEV}`. Existe ao rodar com `pnpm dev`/`ABRIR_JOGO.bat`; a build de produção não tem o painel.

**Painel de debug** (`src/game/tuning.ts`, `DebugPanel.tsx`, `GameCanvas.tsx`)
- 13 parâmetros em 4 grupos:
  - Inimigos: HP, dano, velocidade, spawn e teto.
  - Personagem: dano e Ultimate.
  - Ganhos: EXP e Ryu.
  - Drops (novos): chance de Ryu, Chakra, pílula e item, com a chance efetiva exibida.
- Mudar o HP dos inimigos reescala também os que já estão vivos.
- Os parâmetros salvos (`sb_debug_tuning_v1`) agora valem em **todas** as runs, com o painel aberto ou fechado (antes só com o debug ligado).
- O botão mostra "ajustes ativos" quando algo difere do padrão.
- Novos botões "Copiar JSON" e "Colar JSON".

**Verificado**
- `tsc -b`, `vite build` e `verify-rules.mjs` passaram.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador confirmou: modal sem login; painel sem login; HP ×2 dobrando o inimigo vivo; item ×30 = 54%; valores salvos e recarregados na run seguinte; restaurar padrões.

**Não testado**
- Os demais sliders, um a um, em gameplay real.

## 2026-11-05 — versionamento no GitHub
- O projeto passa a ser um repositório git, com remoto `origin` em https://github.com/jcffadev/Shinobibonk.git e branch `main`.
- Novo `.gitignore`. Ficam fora do repositório:
  - dependências, build e segredos;
  - `Feedback da versão.txt`, por conter credenciais;
  - `animação do personagem.jpeg`, uma prévia de banco de imagens com marca d'água.
- Nova skill `skills/publicar-github/SKILL.md`, com um atalho em `.claude/skills/publicar-github/`: ao fim de cada tarefa com alterações, documentar, verificar, conferir segredos, fazer commit em português e push sem force.
- `AGENTS.md` ganhou a seção "Publicação no GitHub".

## 2026-11-05 — HUD de pílulas, level-up sem itens e Lamens por desempenho
Feito por três subagentes e integrado depois.

**HUD**
- Novo `src/hud-dock.css`. Em `main.tsx`, `.vitamin-row` e `.ability-bar` ficam dentro de `.skill-dock`: pílulas numa linha própria acima das habilidades, quebrando em até 2 linhas, com rolagem.
- Na integração, o bloco subiu para `bottom:96px` e a ajuda de teclas foi para a direita do botão "← Preparação", porque o selo AUTO encostava na ajuda.
- No resumo, os nomes das pílulas não são mais cortados com "…": aparecem sem o prefixo "Pílula" e quebram linha.

**Level-up** (`rollLevelOffers`)
- Só técnicas e pílulas, até 2 técnicas; nunca itens.
- Técnicas todas no máximo: só pílulas. Pílulas todas no limite: só técnicas.
- Itens só por recompensas (kunai, shuriken, eventos, drop, recusa de selamento).

**Pílula do Mercador**
- O texto agora cita só Ryu ("+12% Ryu recebido").

**Lamens por desempenho**
- Novo `src/game/rewards.ts`: tempo, abates, nível, zona, mega elites selados e vitória, multiplicados pela dificuldade. Valores provisórios.
- Creditados uma vez por run (vitória ou derrota) e mostrados no resumo com a decomposição.

**Testes**
- `scripts/verify-runtime.mjs`: a verificação da carteira passou a ser relativa (antes esperava o saldo fixo 999.699, que mudou com o crédito de Lamens). Nova verificação: "Vitória credita Lamens uma única vez e mostra no resumo".

**Verificado**
- `tsc -b` e `vite build` sem erros.
- `verify-runtime.mjs` passou com 24 verificações.
- Um teste avulso no navegador confirmou: level-up só com técnicas e pílulas em 60 rolagens; 16 pílulas no HUD sem sobrepor as habilidades nem a ajuda; resumo com Lamens.

**Não testado**
- O caso "só pílulas com técnicas no máximo" em jogo real.
- Layout do HUD entre 700 e 1100 px e no celular.
- Balanceamento da fórmula de Lamens.

## 2026-11-05 — posição do painel de debug
- `src/debug.css`:
  - O botão "DEBUG · F9" e o painel foram para a direita, abaixo do minimapa, e não cobrem mais o cartão do herói.
  - Botão e painel ficam ocultos enquanto o resumo pós-run está aberto (regra CSS com `:has(.summary-backdrop)`).
- **Verificado** com `vite build` e um teste avulso no navegador a 1440×900:
  - o painel não se sobrepõe ao cartão do herói, ao minimapa nem à barra superior;
  - o botão some no resumo.
- O layout de celular do painel não foi conferido visualmente.

## 2026-11-05 — modo debug admin, resumo pós-run e 18 pílulas
Feito por três subagentes em paralelo e integrado depois.

**Modo debug (admin)**
- Novos arquivos: `src/game/adminAuth.ts`, `src/game/tuning.ts`, `src/ui/AdminLogin.tsx`, `src/ui/DebugPanel.tsx` e `src/debug.css`.
- Login admin local no modal de conta. A senha é guardada só como hash SHA-256 e verificada no navegador; é proteção de protótipo, não segurança real.
- Na missão, F9 (ou a tecla à esquerda do 1) abre o painel:
  - leitura ao vivo;
  - 9 multiplicadores salvos em `sb_debug_tuning_v1`;
  - dar item ou pílula, curar, god mode, Chakra, nível, Ryu;
  - mega elite, limpar inimigos, avançar o tempo, congelar.
- Sem admin, o balanceamento padrão não muda.

**Resumo pós-run**
- Novos arquivos: `src/ui/RunSummary.tsx` e `src/summary.css`.
- Substitui a tela final simples. Mostra resultado, 12 indicadores (inclui DPS médio), dano por técnica com % e DPS, build final e atributos finais.
- Mantém o botão "Preparar outra missão" e adiciona "Tentar novamente".

**Pílulas**
- Novos arquivos: `src/game/pills.ts` e `src/ui/PillIcon.tsx`.
- 18 pílulas com tema ninja, uma por atributo, no formato da wiki de referência. Substituem Rubra, Verde e Azul.
- `progression.ts`, `preparation.ts`, `GameCanvas.tsx`, `RunSheet.tsx` e `BuildPlanner.tsx` agora leem de `pills.ts`.

**Verificado**
- `tsc -b` e `vite build` sem erros; o bundle passou a 899 kB.
- `verify-rules.mjs` passou.
- `verify-runtime.mjs` passou nas 23 verificações.
- Um teste avulso no navegador cobriu login admin (errado e certo), F9 abrindo e fechando, sorteio das pílulas novas, resumo na vitória e layout a 390 px.

**Não testado**
- Derrota real.
- Cada slider do debug.
- Conflito do F9 com o Leitor Imersivo do Edge.
- Balanceamento das pílulas.

## 2026-11-05 — tecla Y restaurada (decisão do usuário)
- **CONFIRMADO** pelo usuário: a tecla Y tem que existir.
- `src/scene/GameCanvas.tsx`: Y volta a alternar a Ultimate automática. A tecla e o clique no selo AUTO chamam a mesma função `onToggleAuto`.
- `scripts/verify-runtime.mjs`: nova verificação "Tecla Y alterna a Ultimate automática".
- **Verificado**: `tsc -b` e `vite build` sem erros; `verify-runtime.mjs` passou nas 23 verificações, sem erros JS.
- README, docs 00, 04, 10 e 12, contexto do chat e `AGENTS.md` atualizados.

## 2026-11-05 — moeda Lamens no hub e AUTO sem tecla Y (Y revertido na entrada acima)
- `src/main.tsx`: carteira, árvore permanente, loja, nota de teste, Reset e rodapé do hub agora mostram a moeda permanente como **Lamens** (🍜) em vez de "Ryu". O Ryu (🪙) continua sendo o dinheiro da run (HUD, kunais, mercador, caça-níquel). A função interna `spendRyu` foi renomeada para `spendLamens`. A chave `sb_admin_wallet_v1` não mudou, então o saldo salvo é mantido.
- `src/scene/GameCanvas.tsx`: removido o atalho oculto **Y**. O selo AUTO do botão R agora dispara o evento `shinobi-toggle-auto-ult` em vez de simular a tecla Y.
- README, docs 00, 04, 11 e 12 atualizados; as duas divergências saíram da lista de pendências.
- **Verificado**: `tsc -b` e `vite build` sem erros. `node scripts/verify-runtime.mjs` reexecutado com as 22 verificações passando (inclusive "Ultimate R e selo AUTO" por clique e reembolso do Reset), sem erros JS. A execução regravou `artifacts/runtime-checks.json` e as screenshots em `artifacts/`.

## 2026-11-05 — sincronização da documentação com o código
Os docs foram editados até cerca de 15h; o código continuou mudando até cerca de 17h53 sem registro. Esta entrada documenta, a partir da leitura do código, as mudanças que não estavam registradas, e corrige os Markdown. Nenhum código foi alterado.

**Registrado retroativamente (IMPLEMENTADO no código, sem entrada anterior):**
- Dados extraídos para `src/game/`:
  - 22 shinobis e 88 técnicas com escola, elemento, forma e status.
  - Catálogo de 36 itens.
  - `calculateStats` recalculando atributos das fontes.
  - Dificuldade por rank e tempo.
  - Crítico com mega crítico.
  - Afixos de técnica por raridade.
  - Evoluções visuais por nível.
  - Árvore permanente com 16 nós.
  - Três zonas com guardião.
- UI nova em `src/ui/`: ficha da run, plano de build e filtros.
- Hub:
  - Filtros por aldeia, escola e elemento.
  - Carteira administrativa local (999.999) com Reset que devolve o gasto.
  - Prévia da cena.
- Run:
  - Contagem regressiva de 10:00 com vitória e derrota; três zonas de 200 s com clima e guardião.
  - Ataques inimigos telegrafados; armadura e evasão.
  - Cartas com atualizar, pular e banir (F/X/Z).
  - Kunais no mapa com preço crescente de Ryu.
  - Defesa de altar de 20 s.
  - Emboscadas.
  - Mega elites aleatórios do elenco (até 9).
  - Aliados que seguem e atacam.
  - Sinergia da Areia.
  - Descoberta por frustum da câmera.
  - Ganchos de teste `window.__shinobiTest` (dev com `?test`).
- Eventos renomeados: "Rugido de Rhydon" → Provocação do guardião; "Bênção de Snorlax" → Bênção de Tsunade.
- Scripts `scripts/verify-rules.mjs`, `scripts/verify-runtime.mjs`, `scripts/smoke-browser.mjs` e scripts de integração já aplicados (`scripts/integrate-*.mjs`, `update-*.mjs`).

**Documentação corrigida:**
- README, `00-LEIA-PRIMEIRO` e `12-ARQUITETURA` reescritos conforme o código.
- 01, 02, 03, 04, 05 e 11 receberam seções de estado do código.
- 06 marcado como histórico.
- 09, 10 e o contexto do chat receberam notas sobre as decisões que mudaram (Tab/P, AUTO no lugar de Y, moedas, nomes sem Pokémon).

**Divergências registradas como PENDENTES:**
- A moeda permanente aparece como "Ryu" no hub (a decisão é Lamens).
- A tecla Y ainda alterna o AUTO como atalho oculto.
- Teto real de 180 inimigos vivos.
- Selamento sem tentativas nem falha.
- Descoberta sem oclusão.

**Verificado nesta data:** `tsc -b` sem erros; `vite build` concluído com aviso de chunk de 879 kB; `node scripts/verify-rules.mjs` passou. Os testes de navegador em `artifacts/runtime-checks.json` são da execução anterior do Codex e não foram reexecutados.

## 2026-11-05 — run, selamento de Orochimaru, skill e referências
- Copiados os 50 PNGs de clipboard disponíveis desta conversa para `assets/referencia/prints/originais/`, preservando os nomes originais; mantidas cópias organizadas na pasta principal.
- Implementadas aparições naturais do mega elite Orochimaru e sequência após derrota: retrato do alvo, escolha E/G, animação do selo, registro de aliado temporário ou drop que abre três itens. Sorte do Talismã altera chance de raridade nessa escolha.
- Substituída a Maldição de Gengar pela Maldição de Orochimaru; mantém o efeito de risco/recompensa provisório.
- A roleta/eventos, coleta de armas/Ryu, altar de desafio, escolha de level-up, HUD de run, clima simples e mapa da zona estão implementados em `src/`; defesa de altar completa, zonas e IA de aliados continuam pendentes.
- Ultimate automática agora é alternada pelo selo AUTO dentro do botão R; removido Y do guia visual do HUD. Naruto alterna VFX de shuriken, Rasengan, clone e rajada de chakra.
- Criada `skills/documentar-projeto/SKILL.md` e integrada ao `AGENTS.md`: toda alteração em código/configuração/assets deve sincronizar Markdown na mesma tarefa.
- README, guia inicial, arquitetura, câmera/eventos e selamento atualizados para distinguir código real de plano visual. `pnpm build` concluído em 05/11/2026; Vite avisou sobre bundle acima de 500 kB.

## 2026-11-05 — hub de elenco e progressão
- Adicionadas telas do elenco com passivas/kit, catálogo de ataques por shinobi, plano de build, árvore permanente e loja de itens.
- Planejamento permite marcar ataques e bloquear itens desbloqueados para a próxima run; preferências ficam no navegador local.
- Proposta econômica documentada: dez passivas, dez níveis, custo crescente; total projetado de 21.300 Lamens para a árvore apresentada.
- Login, recompensas de Lamens, efeitos de passivas e integração real do pool seguem pendentes.

## 2026-11-05 — tela inicial e entrada de jogador
- Criada tela inicial inspirada na referência enviada, com cenário 3D ao fundo, opção de convidado e área de conta.
- Adicionada seleção de missões Genin, Chunin, Jonin e Kage, com rótulo de início da missão escolhida.
- Preparado modal explicando que login/cadastro por e-mail e senha dependem de implementação futura; nenhum dado de senha é coletado.
- Placar indica claramente dados locais e ausência de ranking/contas online.

## 2026-11-05 — movimento e inimigos na base 3D
- Adicionados movimento WASD/setas, câmera que acompanha o protagonista e rotação por arraste do mouse.
- Inimigos geométricos surgem aleatoriamente ao redor do jogador e avançam em sua direção; contador aparece na HUD.
- Controles e estado continuam em uma simulação Three.js separada da interface React.

## 2026-11-05 — base inicial 3D
- Adicionada base de desenvolvimento com Three.js e TypeScript; React controla a interface, enquanto cena e renderização ficam isoladas.
- Configurado Vite para iniciar a nova base pela raiz do projeto, preservando `game/index.html` como protótipo 2D jogável.
- Adicionada cena isométrica de teste com terreno em blocos e personagem geométrico provisório.
- Instaladas dependências Three.js, React, TypeScript, Vite e tipos associados.
- A base não migra ainda as mecânicas do protótipo 2D nem representa arte final.

## 2026-11-05 — pacote para Codex
- Consolidado código executável mais recente (v0.5.3), docs, artes conceituais, screenshots e histórico disponível.
- Não houve migração para 3D nesta consolidação.
- Origem: arquivos locais de versões anteriores desta conversa.
