# Câmera, mapa, eventos e performance

**CONFIRMADO** — Mundo explorável amplo, top-down/ângulo livre, rotação horizontal de 360°, mouse para orientar câmera, salto para alcançar elevações e descobrir áreas ocultas. Terreno e construções podem impedir visão/navegação, mas **não bloqueiam acerto** quando alvo está dentro da área válida da habilidade.

## Mapas planejados
1. **Vila da Folha/Konoha**: ruas, muralhas, telhados, bosques e plataformas; evento de defesa da vila; afinidade de aliados da Folha.
2. **Vila da Areia/Sunagakure**: dunas e cânions, tempestade de areia e visão reduzida; escolta de pergaminhos.
3. **Vila da Névoa/Kirigakure**: pontes, água e neblina dinâmica; inimigos com status de água e emboscadas.
4. **Vila da Pedra/Iwagakure**: penhascos, elevações e desfiladeiros; exploração vertical e queda de rochas.
5. **Vila da Nuvem/Kumogakure**: montanhas, pontes altas e relâmpagos; evento de descarga elétrica.
6. **Floresta**: vegetação que encobre a visão; rastreio de mega-elites.
7. **Dimensões especiais**: portais, terreno excepcional e chefes raros.

Essas condições são **propostas**; números de buffs, penalidades, frequência e geometria precisam de balanceamento.

## Hordas
- Spawns contínuos por orçamento de dificuldade, não por ondas; 1 kill = +1 abate.
- Limite-alvo de 1.500 inimigos **vivos** no mundo, sem contar cadáveres, efeitos ou objetos. Oclusão, LOD, spatial hash, pooling e simulação de IA por frequência são necessidades técnicas.
- Inimigos normais, elites com contornos por tier, mega-elites e chefes. Barras de HP somente para mega-elites e chefes.
- **Estado do código**: spawn contínuo com teto de **180 vivos** (`difficultyAt` em `src/game/progression.ts`). Não há instancing, pooling nem spatial hash. A meta de 1.500 está **PENDENTE** e não foi medida. Elites comuns têm tom laranja. **IMPLEMENTADO**: mega elites e guardiões têm barra de vida 3D com nome acima do personagem (roxa no mega elite, laranja no guardião) e **usam as técnicas do próprio shinobi** contra o jogador, sempre com aviso vermelho no chão; quem sai da área marcada antes do golpe não leva dano (ver [12](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md)). O guardião também continua com a faixa de HP no HUD.
- Bosses/bestas de caudas e shinobis de Edo Tensei sorteados por mapa, regras de elegibilidade e dificuldade.

## Eventos
Escolta, altar, emboscada opcional, selamento, desafio de Guy, fendas/portais, proteção de objetivo, tesouro com maldição, chefes de área. Cada evento define objetivo, duração, recompensa, penalidade opcional e feedback no HUD.

### Regras acrescentadas pelas referências de 05/11/2026
As referências vieram de outro jogo; por decisão do usuário, nada de Pokémon fica no ShinobiBonk. Os nomes abaixo são os usados no código.

- **Plano do Shikamaru (CONFIRMADO pelo usuário em 06/11/2026; substitui a antiga Provocação do guardião)**: NPC Shikamaru (sprite de herói) em x:14, z:8. **IMPLEMENTADO**: cada E dá +1 kunai grátis ao derrotar o guardião da zona; limite 3 por zona (o 4º é recusado). Sem penalidade de dificuldade e sem bônus de saque. Ao derrotar o guardião caem 1 + planos kunais grátis (máximo 4). Pode ser usado antes ou depois de invocar o guardião. A contagem zera na troca de zona.
- **Selo do guardião (CONFIRMADO pelo usuário em 06/11/2026)**: em x:2, z:-12. **IMPLEMENTADO**: E invoca o guardião da zona a qualquer momento. HP = 260 × ameaça × M, com M = 0,6 + 0,4 × (segundos na zona ÷ 160): 0,6× no início, 1,0× aos 160 s. O painel de interação mostra o ×M atual. Se não for invocado, o guardião ainda surge sozinho aos 160 s da zona. Um guardião por zona; a kill reward não duplica. Valores provisórios.
- **Ebisu (CONFIRMADO pelo usuário em 06/11/2026)**: NPC em x:25, z:5 (`src/game/npcs.ts`). **IMPLEMENTADO**: 3 cartas de troca. Cada carta dá um ganho sorteado de +8% a +20% num atributo e cobra ganho × 1,1 de outro atributo, sorteado e mostrado antes da escolha. 1 uso por zona; X recusa sem gastar, e as ofertas ficam guardadas.
- **Iruka (CONFIRMADO pelo usuário em 06/11/2026)**: NPC em x:−24, z:14. **IMPLEMENTADO**, 1 uso por zona, 3 opções:
  1. Lição: +3% a +6% num atributo sorteado e mostrado, sem custo.
  2. Pergaminho lendário: 3 atributos no valor máximo (`LEGENDARY_VALUES`); escolher um custa −20% de outro atributo, mostrado antes.
  3. Iruka entra como ajudante com passiva já no máximo: +25% de XP (× força de suporte), ataque "Kunai da Academia". Fica desativada com o motivo se as vagas estiverem cheias ou ele já estiver na equipe. Iruka não é jogável, não conta no elenco de 22 e não pode ser selado.
  - Não existe sistema de "afinidade" de aliados; "afinidade máxima" foi interpretada como passiva em força máxima (PENDENTE confirmação).
  - Trocas usam pontos percentuais aditivos em `runBuffs`, recalculados das fontes; um custo nunca leva o bônus abaixo de −50%.
- **Naruto Totem (CONFIRMADO pelo usuário em 06/11/2026)**: sempre no minuto 7 do relógio regressivo (7:00 → 6:00, elapsed 180–240 s). **IMPLEMENTADO** (`src/scene/narutoTotem.ts`):
  - Naruto em roupa da Academia surge a 14 m do jogador com HP 650 × ameaça e barra própria. Não ataca, não é mega elite e não pode ser selado.
  - Invoca 4 clones das sombras a cada 0,6 s (teto 48 vivos) a 6–50 m do jogador; os clones vão direto atacar o jogador. Cada clone dá 5 de XP (sem Ryu/itens).
  - Morto: 2 level-ups na fila normal (só técnicas e pílulas). Se não morrer, some às 6:00 sem recompensa; os clones restantes se dissipam.
  - Entra no mapa só depois de visto em tela. Valores provisórios; performance com 48 clones + horda não medida.
- **Roleta da Tsunade (CONFIRMADO pelo usuário em 06/11/2026; substitui o Caça-níquel e absorve a Bênção de Tsunade)**: evento `slot` com sprite da Tsunade. **IMPLEMENTADO** (`src/game/roulette.ts`, `src/ui/TsunadeRoulette.tsx`):
  - E abre o overlay da roleta; a run fica pausada enquanto está aberto.
  - Controles: toque em E = 1 giro animado (1,6 s); segurar E = giro rápido contínuo (280 ms/giro) enquanto houver Ryu; E durante a animação = resultado instantâneo; F/botão liga e desliga o giro rápido (`sb_roulette_fast`).
  - Prêmios e penalidades acumulam numa lista e só são entregues ao sair (Esc/X/"Sair e receber").
  - Custo por giro: (25 + 5 × giros na run) × (1 − desconto, máx. 40%); não reseta por zona.
  - Casas de recompensa: Kunai, Shuriken, Ryu, Bênção, Item e Sorte Grande. Penalidades: Dívida, Azar e Credores. Há também a casa vazia. Os pesos atuais vêm de `ROULETTE_CASAS`.
  - Sorte multiplica casas boas por 1 + min(2, sorte/100) (premium ao quadrado); a pressão de dificuldade (maldição, zona, missão) multiplica as ruins; a fatia ruim fica sempre entre 15% e 60%. Ex.: sorte 0 = 63% boas/25% ruins; sorte 100+ = ~81%/15%.
  - Buffs e debuffs são temporários e recalculados das fontes. Valores provisórios.
- **Altar de desafio (CONFIRMADO)**: interagir inicia uma pequena horda; concluir concede uma kunai grátis. **IMPLEMENTADO**: 6 inimigos de desafio surgem a 7 m. Escala e duração estão **PENDENTES**.
- **Maldição de Orochimaru (CONFIRMADO; substitui Gengar)**: risco/recompensa opcional. **IMPLEMENTADO**: +20% de dificuldade e +25% de XP/saque, uma vez por zona.
- **Mega elite (CONFIRMADO)**: encontros especiais surgem organicamente e podem ser selados após a derrota. **IMPLEMENTADO**: shinobi aleatório do elenco (que ainda não é aliado). O primeiro surge entre 30 e 55 s e os seguintes a cada 45–70 s, até 9 por run. Rotação por zona e elegibilidade estão **PENDENTES**.
- **Guardião de zona (IMPLEMENTADO)**: invocado pelo Selo do guardião quando o jogador quiser, ou automaticamente aos 160 s de cada zona de 200 s; sorteado da lista da zona em `src/game/missions.ts` (`GUARDIAN_RULES`, `guardianHpMultiplier`).
- **Proteção de altar (CONFIRMADO)**: defender o altar durante o evento. **IMPLEMENTADO PARCIAL**: ficar 20 s dentro do círculo de 4 m dá uma kunai grátis. Ondas dedicadas e falha ao sair estão **PENDENTES**.
- **Mercador (IMPLEMENTADO)**: troca kunai/shuriken guardadas por 5 Ryu cada.
- **Arsenal da Tenten (CONFIRMADO; IMPLEMENTADO; antes "Sharingan de Kakashi", trocado a pedido do usuário em 06/11/2026)**: NPC com sprite da Tenten no mapa (id `arsenal`). Ao interagir com E, o jogador escolhe um item que já carrega e ganha mais uma cópia dele, respeitando o limite do item. Pode ser usado uma vez por zona, e cancelar não gasta o uso.
- **Emboscadas (IMPLEMENTADO)**: a cada 18–30 s surgem 8 + 2×zona inimigos ao redor do jogador.
- **Tempo e clima (CONFIRMADO; IMPLEMENTADO)**: um clima sorteado a cada zona. Névoa reduz a visibilidade; tempestade de areia reduz o movimento em 27%. Outros climas por bioma estão **PENDENTES**.
- **Descoberta (CONFIRMADO)**: minimapa e mapa M mostram ícones só depois de o evento ser visto pela câmera. **IMPLEMENTADO**: teste de frustum da câmera até 40 m, com registro persistente. Oclusão por terreno ou árvores está **PENDENTE**. Tab abre o mapa rápido e P abre a ficha.

Mapas por bioma, mapa procedural, colisão, pulo, spawn configurável por zona, balanceamento e multiplayer seguem **PENDENTES**. A arena atual tem 100×100 m. Consulte [estado do código](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md).

## Mapas jogáveis e progressão (IMPLEMENTADO em 06/11/2026, pedido do usuário)
- `src/game/maps.ts`: **4 mapas** com paleta de chão/terreno, cenário (pesos e tinta do atlas), climas e 3 zonas com nomes e guardiões próprios.

| Mapa | País | Tema | Climas | Zonas |
|---|---|---|---|---|
| Vila da Folha 木 | Fogo | florestas e trilhas | Céu limpo, Névoa espectral | Arredores da Folha → Trilha dos renegados → Cerco dos Kage |
| Vila da Areia 砂 | Vento | dunas e cânions | Tempestade de areia (lentidão), Sol do deserto | Dunas de Suna → Cânion dos Ventos → Muralha do Kazekage |
| Vila da Pedra 岩 | Terra | montanhas rochosas | Ventania, Poeira de pedreira | Pedreira de Iwa → Ponte de Kannabi → Pico do Tsuchikage |
| Vila da Névoa Oculta 霧 | Água | pântanos enevoados | Névoa Oculta (visão curta), Garoa fria | Ponte de Tazuna → Lago Sangrento → Torre do Mizukage |

- **Progressão por mapa** (`sb_map_progress_v1`): Chunin só libera ao vencer o Genin daquele mapa, Jonin ao vencer o Chunin, Kage ao vencer o Jonin. Cards mostram ✓/▸/🔒 por dificuldade.
- **Missões de desbloqueio** (`src/game/unlockMissions.ts`): cada shinobi bloqueado tem mapa + dificuldade + minuto; nessa run o "Shinobi para selar" dele aparece (um por vez, 60 s de intervalo). **Lendários**: Madara (Pedra · Kage · 7 min) e Hashirama (Folha · Kage · 7 min), com retrato oculto e nome "???".
- **Pausa (Esc)**: abre a ficha com rodapé de comandos e botões Desistir, Salvar e sair, Reiniciar, Mapa grande, Tela cheia, Preso (move para área livre), Mapa, Configurações, Relatar (copia um relatório) e Continuar. A caixa de comandos saiu do HUD.
- **Salvar e retomar**: "Salvar e sair", salvamento automático a cada 15 s e ao fechar o navegador (`sb_saved_run_v1`). O hub oferece "Continuar missão salva". Salva tempo, nível, EXP, abates, Ryu, kunais, itens, pílulas, técnicas, ajudantes e afinidade, buffs, usos, eventos, mapa explorado e posição; hordas e drops vivos voltam a surgir.

## Mapa, rota e ping (IMPLEMENTADO em 06/11/2026, pedido do usuário)
- `src/ui/MapOverlay.tsx` + `src/map.css`. M (completo) e Tab (rápido) mostram ícones só do que já foi **visto em tela** na run:
  - NPCs com retrato e selo da função (Tenten 🗡️ no Arsenal, Shikamaru ♟️, Tsunade 🎰, Ebisu 🕶, Iruka 📚, Orochimaru 🐍);
  - eventos com ícone e cor próprios (Selo do guardião, altares, mercador, Ichiraku);
  - mega elites, guardião e Naruto Totem com retrato e borda pulsante;
  - recompensas no chão (kunai, shuriken, Ryu).
  - Evento já usado aparece em cinza. A lista "VISTO NESTA RUN" fica ordenada por distância.
- **Rota**:
  - Clicar num ícone (no mapa ou na lista) define o alvo; clicar numa área livre cria um ping 📍 com rota. Só um alvo por vez; clicar de novo ou "✕ Limpar rota" remove.
  - Uma linha tracejada liga o jogador ao alvo no mapa e no minimapa.
  - Na HUD, um cartão abaixo do minimapa mostra o nome e os metros. A seta na borda da tela (ou um pino ▼ quando o alvo está à vista) usa a projeção da câmera. Alvos móveis são seguidos.
- **Chegada**: a menos de 3 m (ou ao usar o evento a até 4,2 m) aparece **"Chegou!"** e o rastreio é limpo. Um alvo consumido, derrotado ou coletado limpa a rota com aviso.
- G continua marcando ping na posição do jogador, sem rota. O minimapa mantém o norte para cima, enquanto a seta da tela segue a câmera.
- Mega elites e guardiões passam a ser registrados quando aparecem na câmera (até 40 m). Hooks de teste: `__shinobiTest.mapRoute`.

## H e opções gráficas
Modo H: ocultar números flutuantes, trilhas e efeitos ofensivos opcionais, mas manter lógica de colisão, dano, status e animação de hit simplificada. **IMPLEMENTADO** para projéteis, anéis, visuais e números. Não existe menu de configurações gráficas; as opções a seguir são futuras: densidade visual, LOD de inimigos, minimapa 15/30/60 FPS, partículas, qualidade, limite de FPS e transparência da HUD.
# Atualização da câmera e da partida

O mouse gira e inclina a câmera de 0,12 a 1,48 radianos durante a partida. Clique direito fixa o alvo. A câmera fica acima do terreno. O volume ortográfico inclui o primeiro plano mesmo em inclinação baixa. A área jogável tem novas elevações e uma cadeia de montanhas ao redor dá profundidade ao horizonte. O céu usa um gradiente conforme o clima. O HUD conta os inimigos vivos da simulação e o minimapa amostra até 300 marcadores para manter a leitura.
