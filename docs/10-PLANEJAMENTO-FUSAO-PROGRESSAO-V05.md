# ShinobiBonk — Especificação v0.5
Data: 2026-11-05
Status: PROPOSTA DE DESIGN — não implementada nem validada no jogo.

> **Nota de 05/11/2026:** decisões posteriores substituem parte deste texto.
> - **Teclas e Ultimate**: 1–4 não ativam habilidades (são só automáticas). A Ultimate automática é alternada pela tecla Y ou pelo selo AUTO no botão R.
> - **Moedas**: a moeda permanente é Lamens e o Ryu é o dinheiro da run.
> - **Fusão e Shisui**: seguem **PENDENTES** no código.
> - **Fases da run**: a run implementada tem 10 minutos divididos em 3 zonas de 200 s, sem fase final de boss separada.

## Regras consolidadas
- Browser primeiro; depois PC e mobile; coop até 4 jogadores; clãs e rankings por indivíduo, clã, personagem, modo e dificuldade.
- Meta aspiracional de 240 FPS fluidos e teste de estresse com 1400+ inimigos e muitos hits; sem garantia antes de benchmark. Renderização desacoplada de simulação, dano e status em lote, agregação visual e networking eficiente.
- Teclas 1,2,3,4 para habilidades comuns; slot 4 desbloqueado permanentemente; R ativa ultimate manualmente; Y alterna auto-ultimate quando houver Chakra de combate suficiente. Todo ninja, inclusive Taijutsu, acumula Chakra para ultimate.
- Separar `chakra_combate` (barra da ultimate) de `chakra_recompensa` (moeda persistente sugerida pelo usuário), com nomes finais de UI a decidir. Ryō é moeda canônica de Naruto e pode servir como outra moeda se desejado; evitar confusão.

## Planejamento pré-partida
- Por personagem, salvar presets de build: itens, habilidades e pílulas em três estados: Planejado, Normal, Arquivado.
- Planejado: aparece no pool com selo 'Planejamento', sem garantia de oferta; Normal: aparece; Arquivado: excluído do pool comum da partida.
- Apenas recursos já desbloqueados podem ser planejados; regras especiais e habilidades naturais não podem ser arquivadas quando necessárias. Presets não alteram drops de eventos obrigatórios.
- A sorte influencia raridade comum/incomum/rara/épica/lendária, com pesos normalizados e limites de elegibilidade. Status e atributos podem crescer sem limite rígido de nível, mas fórmulas precisam controlar overflow e desempenho.

## Fusão — Casa do Lámen Ichiraku
- NPC/evento no mapa procedural; entrega de duas habilidades comuns compatíveis; cria habilidade fundida, com atributos derivados das duas fontes e de suas melhorias atuais.
- Fórmula conceitual: D_fusao_base = (D_A_base + D_B_base) * sinergia. Aplicar separadamente bônus aditivos de categoria, multiplicadores [x], crítico, resistências, DoTs e status. Evitar reaplicar buffs já embutidos nos valores para não dobrar multiplicadores.
- Definir por receita: elementos, compatibilidade, dano, projéteis, área, duração, recarga, custo, status e se a fusão é elegível como habilidade comum, ultimate alternativa ou ambas em contextos distintos.
- Ultimate natural não é sacrificada na fusão. Quando usada como ultimate alternativa, consome Chakra e respeita R/Y. Ao fundir, as duas habilidades de origem deixam seus slots e a fusão ocupa um slot; vagas liberadas podem receber novas habilidades, sujeito ao limite de quatro slots.
- Habilidades compartilhadas por afinidade elemental e aprendizagem; personagens multi-elemento acessam mais opções.

## Uchiha / Sharingan
- Passiva única da família: técnicas da afinidade própria recebem bônus multiplicativo [x]%; técnicas copiadas de elementos alheios recebem bônus aditivo +%.
- Sharingan desbloqueia cópia de técnicas elegíveis dos cinco elementos, mas não concede automaticamente Kekkei Genkai, habilidades biológicas ou exclusivas.
- Exigir progressão e condições de aprendizado; balancear o custo de versatilidade.

## Mapas e estágios
- Mapas proceduralmente montados a partir de módulos temáticos inspirados em Konoha, Suna, Kiri, Kumo, Iwa, florestas, desertos, vales e outros cenários conhecidos. Respeitar navegação, legibilidade e performance.
- Uma run tem 3 estágios de aproximadamente 10 minutos cada e fase final de boss com limite de 10 minutos. Overtime e portal dimensional inspirado em Kaguya como transição/desafio; regras exatas a validar.
- Progressão de dificuldade: Genin -> Chunin -> Jonin -> Kage. Desbloquear a seguinte ao vencer a anterior. Rankings segregados por dificuldade, modo, equipe e temporada.
- Escalonar spawn, HP, dano, defesa física, resistências elementais, velocidade de ataque, velocidade de movimento, resistência a status e variedade de elementos ao longo do tempo. A run sempre termina por vitória, derrota ou limite de tempo; crescimento do jogador não torna runs infinitas.
- NPCs, altares, treinos e áreas de proteção podem surgir proceduralmente. Exemplo treino Guy: 500/2000/5000 abates em dificuldades crescente e escolha de um atributo como recompensa.

## Shisui — NPC de repetição
- NPC de evento que cobra moeda da partida para repetir ou duplicar, conforme regra final, habilidades comuns adquiridas e pílulas. Não permite duplicar a ultimate natural.
- Estabelecer custos crescentes, elegibilidade, limites de slots e efeitos de stacking para evitar exploits e explosões de eventos.

## Progressão e recompensas
- Nível de personagem na partida sem teto fixo; curva de XP escalonada por nível e dificuldade; buffs de XP, coleta e ganho de moeda.
- Recompensa persistente ao fim da run com base em tempo, progresso, dificuldade, boss, marcos e eventos; recompensas diárias e conquistas.
- Árvore passiva pré-run, unlocks do pool por moeda persistente, quarto slot desbloqueável.
- Estatísticas de resultado: tempo, abates, dano total, DPS médio e pico, dano por skill/item/DoT, status, dano recebido, cura, XP, moedas, build final, upgrades, gráficos de evolução e comparação por dificuldade.

## Pendências explícitas
1. Nome e relação entre moedas (Chakra de combate, Chakra de recompensa, Ryō e moeda de NPC durante a run).
2. Mecânica exata de repetição do Shisui (duplicar item no inventário vs nova oferta no pool).
3. Fusão comum/ultimate: se é escolha no momento da fusão ou se pode alternar durante a run.
4. Objetivos e regras do overtime e portal dimensional.
5. Licenciamento dos personagens e sprites para publicação pública; não monetizar não dispensa autorização.

## Próximo marco de implementação
1. Motor de dados para atributos, status, itens, raridades e pool; 2. presets/arquivamento; 3. progressão de dificuldade e mapa procedural; 4. fusão e Shisui; 5. backend/coop e métricas de desempenho. Todos exigem execução e testes; este documento não afirma que foram implementados.


## Oficina atual · 07/11/2026

Fundir e Combinar aparecem em abas separadas, com ícones dos dois ataques, lista de pares e acesso à ficha. Uma união válida consome o único uso compartilhado da zona. Fechar ou trocar a aba preserva esse uso. A run salva o número da zona consumida. A zona seguinte libera outra operação. Não é possível reutilizar uma técnica já incorporada em outra união. A fusão começa no nível 1 com ×2 da média de dano e afixos somados. A combinação mantém os dois ataques no mesmo espaço, cada um com ×1,5 de dano.
