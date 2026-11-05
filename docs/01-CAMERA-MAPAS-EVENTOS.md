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

- **Provocação do guardião (CONFIRMADO; substitui o “Rugido” da referência)**: evento do guardião da zona, com até três interações por zona. **IMPLEMENTADO**: cada interação dá +10% de dificuldade da zona, +10% de saque e +30% de HP do guardião. O guardião derrotado solta 1 + número de provocações em kunais grátis. Valores provisórios.
- **Bênção de Tsunade (CONFIRMADO; substitui a bênção da referência)**: buff aleatório para a run. **IMPLEMENTADO**: uma vez por zona, sorteia +12% de dano, +24 HP ou +15% de XP. A escolha entre opções e a tabela de raridade estão **PENDENTES**.
- **Altar de desafio (CONFIRMADO)**: interagir inicia uma pequena horda; concluir concede uma kunai grátis. **IMPLEMENTADO**: 6 inimigos de desafio surgem a 7 m. Escala e duração estão **PENDENTES**.
- **Maldição de Orochimaru (CONFIRMADO; substitui Gengar)**: risco/recompensa opcional. **IMPLEMENTADO**: +20% de dificuldade e +25% de XP/saque, uma vez por zona.
- **Mega elite (CONFIRMADO)**: encontros especiais surgem organicamente e podem ser selados após a derrota. **IMPLEMENTADO**: shinobi aleatório do elenco (que ainda não é aliado). O primeiro surge entre 30 e 55 s e os seguintes a cada 45–70 s, até 9 por run. Rotação por zona e elegibilidade estão **PENDENTES**.
- **Guardião de zona (IMPLEMENTADO)**: surge aos 160 s de cada zona de 200 s, sorteado da lista da zona em `src/game/missions.ts`.
- **Proteção de altar (CONFIRMADO)**: defender o altar durante o evento. **IMPLEMENTADO PARCIAL**: ficar 20 s dentro do círculo de 4 m dá uma kunai grátis. Ondas dedicadas e falha ao sair estão **PENDENTES**.
- **Mercador e caça-níquel (IMPLEMENTADO)**: o mercador troca kunai/shuriken guardadas por 5 Ryu cada. O caça-níquel do Ichiraku custa 25 Ryu e sorteia kunai, shuriken, pílula ou recompensa de item.
- **Kakashi interativo (CONFIRMADO; IMPLEMENTADO)**: NPC "Sharingan de Kakashi" no mapa. Ao interagir com E, o jogador escolhe um item que já carrega e ganha mais uma cópia dele, respeitando o limite do item. Pode ser usado uma vez por zona, e cancelar não gasta o uso.
- **Emboscadas (IMPLEMENTADO)**: a cada 18–30 s surgem 8 + 2×zona inimigos ao redor do jogador.
- **Tempo e clima (CONFIRMADO; IMPLEMENTADO)**: um clima sorteado a cada zona. Névoa reduz a visibilidade; tempestade de areia reduz o movimento em 27%. Outros climas por bioma estão **PENDENTES**.
- **Descoberta (CONFIRMADO)**: minimapa e mapa M mostram ícones só depois de o evento ser visto pela câmera. **IMPLEMENTADO**: teste de frustum da câmera até 40 m, com registro persistente. Oclusão por terreno ou árvores está **PENDENTE**. Tab abre o mapa rápido e P abre a ficha.

Mapas por bioma, mapa procedural, colisão, pulo, spawn configurável por zona, balanceamento e multiplayer seguem **PENDENTES**. A arena atual tem 100×100 m. Consulte [estado do código](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md).

## H e opções gráficas
Modo H: ocultar números flutuantes, trilhas e efeitos ofensivos opcionais, mas manter lógica de colisão, dano, status e animação de hit simplificada. **IMPLEMENTADO** para projéteis, anéis, visuais e números. Não existe menu de configurações gráficas; as opções a seguir são futuras: densidade visual, LOD de inimigos, minimapa 15/30/60 FPS, partículas, qualidade, limite de FPS e transparência da HUD.
