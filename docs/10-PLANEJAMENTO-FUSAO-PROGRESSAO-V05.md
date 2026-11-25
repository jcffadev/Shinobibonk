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


## Oficina dos Sapos Sábios

Fundir ou combinar exige duas técnicas de ataque no teto vigente da partida. O nível padrão é 9. Com o Pergaminho Proibido, o teto sobe para 11. A oficina verifica os dois níveis ao listar os pares e ao confirmar a escolha. O planejador continua disponível antes da missão.

Fundir e Combinar aparecem em abas separadas, com ícones dos dois ataques, lista de pares e acesso à ficha. Uma união válida consome o único uso compartilhado da zona. Fechar ou trocar a aba preserva esse uso. A run salva o número da zona consumida. A zona seguinte libera outra operação. Não é possível reutilizar uma técnica já incorporada em outra união. A fusão começa no nível 1 com ×2 da média de dano e afixos somados. A combinação mantém os dois ataques no mesmo espaço, cada um com ×1,5 de dano.

## Receitas aplicadas · 25/11/2026 (Claude Code)

**Decisões do usuário:** "Aprovar e incluir Gelo" e, para Taijutsu e Genjutsu, "Incluir as duas".

- `FUSION_RECIPES` em `src/game/techniqueMerge.ts`, na ordem de prioridade:
  - **7 de assinatura**, com técnicas pelo nome: Ōdama Rasengan (Kage Bunshin + Rasengan), Shuriken Kage Bunshin (Kage Bunshin + Shuriken), Enton: Espada de Kagutsuchi (Amaterasu + Susanoo), Bijūdama Rasenshuriken (Bijūdama + Rasenshuriken), Chidori Senbon (Chidori + Chuva de Senbon), Fūton: Rasenshuriken (Rasengan + qualquer Ninjutsu de Vento) e Katon: Gamayu Endan (Óleo Flamejante + qualquer Ninjutsu de Fogo).
  - **8 Kekkei Genkai** (as de antes).
  - **7 de natureza**, dois Ninjutsu do mesmo elemento: Gōka Mekkyaku, Daibakufu, Shinkū Taigyoku, Doryū Taiga, Kirin, Ryūsa Bakuryū e **Hyōton: Sensatsu Suishō** (Gelo, incluída pelo usuário).
  - **2 de escola:** Kage Buyō (2 Taijutsu) e Magen: Narakumi (2 Genjutsu).
- **Par sem receita só combina.** `mergedTechnique` devolve `undefined` para fundir sem receita. A "Fusão · A / B" genérica só existe para partidas salvas antes (`legacyFusion`).
- **Atributos somados:** dano (A + B) × bônus de natureza ou linhagem; o status da receita soma a chance do mesmo status das duas técnicas (teto 95%); outro status vira secundário; queimadura, veneno, lentidão e gravidade passam para a fusão. Alcance e recarga ficam com o maior. Os afixos de nível continuam somados na Oficina.
- **Sem raridade:** o cartão do planejador mostra o tipo (Kekkei Genkai, Fusão de natureza, Fusão de escola, Fusão assinatura ou Combinação).
- **Cobertura** (115 versões): 3 sem fusão só com o próprio pool e **0** com todos selados; toda receita tem quem aprenda.
- **Falta:** o cartão novo (item 4 abaixo), a ficha ao passar o mouse (item 5) e os ícones e efeitos próprios das receitas novas (Codex). Hoje elas usam uma célula do atlas de efeitos e o visual do elemento.

## Fusões — estado em 15/11/2026 e plano para continuar (passagem para outro agente)

Pedido do usuário (rodada 88): "Deixar anotado tudo que você tem sobre as fusões, para outro agente continuar depois se for preciso".

### O que existe no código

- **Regras** em `src/game/techniqueMerge.ts`:
  - `KEKKEI_RECIPES`: 8 Kekkei Genkai por par de naturezas. Valem para dois Ninjutsu, um de cada natureza: Hyōton, Mokuton, Yōton, Futton, Ranton, Shakuton, Jiton e Bakuton.
  - `HERO_KEKKEI` + `fusionBonus`: +15% de dano para a mesma natureza ou para a Kekkei Genkai da linhagem do shinobi.
  - `mergedTechnique({kind:'fuse'|'combine', names})`:
    - Fundir com receita dá a técnica da receita: dano (A+B) × bônus, maior alcance, maior recarga.
    - Fundir sem receita dá "Fusão · A / B": forma Área, afixos de A e B somados.
    - Combinar dá ×1,5 por técnica + 1 atributo do par (`combineBonus`).
  - Sem fusão de fusão (`isMergedName`). Teto de nível da fusão: `FUSION_LEVEL_CAP` = 7.
  - `fusionCatalog(pool, family)` (rodada 81) lista toda fusão possível com o pool. `fusionDisplayName` e `fusionRecipeText` montam "A + B = Nome".
- **Planejamento** em `src/ui/BuildPlanner.tsx`:
  - A aba Fusões abre com o catálogo, Kekkei Genkai primeiro. Ele cresce ao selar shinobis.
  - Um clique planeja a fusão, até 4; outro clique tira (rodada 82). O par manual fica em "Montar o par à mão".
  - `FusionCard` compara fundir × combinar.
  - A aba Habilidades mostra a receita na técnica de uma fusão planejada.
- **Na partida**, a Oficina dos Sapos Sábios (`src/ui/SagesWorkshop.tsx`) funde ou combina uma vez por zona. O `GameCanvas.tsx` consulta `sagesMergeCandidates` para listar e confirmar os pares.
- **Testes:** `tests/fusoes.test.mjs`; mutações em `scripts/mutation-check.mjs` (Kekkei no topo, clique planeja).

### Decisões do usuário (15/11/2026)

1. **Só receitas** (aprovado): par sem receita só pode ser **Combinado**, não fundido. A "Fusão · A / B" genérica deixa de existir.
2. **Lista de receitas** (proposta montada pela Narutopedia, **aprovada em 25/11/2026** com Gelo e as duas opcionais):
   - **Kekkei Genkai**, um Ninjutsu de cada natureza: as 8 atuais.
   - **Comuns**, dois Ninjutsu da mesma natureza:

     | Natureza | Fusão |
     |---|---|
     | Fogo | Katon: Gōka Mekkyaku |
     | Água | Suiton: Daibakufu |
     | Vento | Fūton: Shinkū Taigyoku |
     | Terra | Doton: Doryū Taiga |
     | Raio | Raiton: Kirin |
     | Areia | Ryūsa Bakuryū |

   - **Específicas** (têm prioridade sobre as comuns):

     | Ingredientes | Fusão |
     |---|---|
     | Rasengan + qualquer Ninjutsu de Vento | Fūton: Rasenshuriken |
     | Kage Bunshin + Rasengan | Ōdama Rasengan |
     | Kage Bunshin + Shuriken | Shuriken Kage Bunshin |
     | Óleo Flamejante + qualquer Ninjutsu de Fogo | Katon: Gamayu Endan |
     | Amaterasu + Susanoo | Enton: Espada de Kagutsuchi |
     | Bijūdama + Rasenshuriken | Bijūdama Rasenshuriken |
     | Chidori + Chuva de Senbon | Chidori Senbon |

   - **Opcional**, para cobrir Taijutsu e Genjutsu: 2 Taijutsu = Kage Buyō; 2 Genjutsu = Magen: Narakumi. O usuário ainda não escolheu.
   - **Cobertura medida (114 versões):**
     - sem as opcionais: 63 sem fusão só com o próprio pool e 47 sem fusão com todos selados, quase todos de Taijutsu e Genjutsu;
     - exemplos: Kakashi 6, Madara Seis Caminhos 4–6, Naruto 1–4.
3. **Atributos somados** (pedido de 15/11): "os buffs que as antes da fusão tem, se somam e criam uma habilidade forte com aquele adicional de bônus".
   - A fusão soma **todos** os atributos das duas técnicas: dano, área, alcance, projéteis, quantidade, duração, chance e tipos de status, queimadura, veneno e gravidade.
   - Depois aplica o bônus combinado: +15% de mesma natureza ou linhagem, além do fator da fusão.
   - **Sem raridade**: nada de "Fusão · Épico" ou "Combinação · Raro".
4. **Cartão novo**, no modelo da imagem enviada pelo usuário. Hoje o `FusionCard` é uma tabela simples.
   - Nome da fusão e "Fusão assinatura", com etiquetas "A + B".
   - Natureza, escola e forma.
   - Descrição curta.
   - **Como funciona**: as partes da técnica, cada uma com seu tipo (zona persistente, onda de choque, projétil, invocação…).
   - **Quais melhorias afetam**: o que Área, Duração e +Projéteis/Contagem mudam em cada parte, e o que não ajuda.
   - A lista do catálogo usa o mesmo estilo.
5. **Ficha ao passar o mouse**: efeito, condição, dano base, dano final, recarga, chance de status e tudo o mais.

### Como continuar (passo a passo sugerido)

1. Confirmar com o usuário a lista de receitas e as opcionais de Taijutsu e Genjutsu.
2. Em `techniqueMerge.ts`:
   - trocar `KEKKEI_RECIPES` por `FUSION_RECIPES`, com tipo kekkei, mesma natureza ou específica, ingredientes por natureza, nome de técnica ou escola, e `parts` (partes da técnica, para o cartão);
   - `mergedTechnique` só funde se houver receita, e a soma de atributos segue o item 3;
   - `kekkeiFusion` vira a busca da receita pelo nome, porque é usada em `SkillIcon`, `techniqueVisualProfiles`, `SagesWorkshop` e `GameCanvas`.
3. Atualizar `fusionCatalog`: lista só receitas; o catálogo vazio mostra o aviso de selar mais shinobis.
4. Cartão e ficha ao passar o mouse, em `BuildPlanner.tsx`, e a Oficina na partida, em `SagesWorkshop.tsx`.
5. Testes em `tests/fusoes.test.mjs`:
   - par sem receita não funde;
   - a específica vence a comum;
   - todos os atributos somados;
   - sem raridade no texto;
   - cobertura mínima por versão.
6. Ícones e efeitos das receitas novas: `SkillIcon`, `techniqueVisualProfiles` e a skill `animar-jutsu-webgl`.
