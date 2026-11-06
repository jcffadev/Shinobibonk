# ShinobiBonk — Progressão, economia, RNG, eventos e relatório
Versão de especificação: 0.3 (proposta original de design)

> **Nota de 05/11/2026:** este documento registra a proposta original e algumas decisões que mudaram depois.
> - **Moedas**: a moeda permanente é **Lamens**; **Ryu** é o dinheiro temporário da run (ver [04](04-ITENS-HABILIDADES-ECONOMIA.md)).
> - **Teclas 1–4**: não ativam nada; as habilidades comuns são só automáticas.
> - **RNG no código**: pesos 90 / 9,889 / 0,1 / 0,01 / 0,001 com fórmula `peso × (1+Sorte/100)^índice`, e não a distribuição 60/25/10/4/1 citada abaixo.
>
> Estado implementado: [00-LEIA-PRIMEIRO.md](00-LEIA-PRIMEIRO.md).

## Decisões confirmadas pelo usuário
- Plataforma inicial: navegador; expansão planejada para PC e mobile.
- Multiplayer cooperativo até 4 jogadores; clãs e rankings por jogador, clã, personagem e modo.
- Meta de 240 FPS fluidos, mesmo em combates intensos; requer benchmark, não é garantia.
- Quatro slots de habilidade nas teclas 1, 2, 3 e 4. Slot 4 desbloqueado permanentemente via moeda da conta.
- Árvore de passivas configurada antes da partida.
- Desbloqueios permanentes de itens, habilidades e pílulas adicionam entradas ao pool aleatório das partidas; não concedem o item imediatamente.
- Raridades: comum, incomum, raro, épico e lendário. Sorte influencia a qualidade de todo o pool.
- Atributos sem limite rígido universal de acumulação; implementar proteção contra overflow e fórmulas degeneradas.
- Eventos: altares, proteção de área, encontros com ninjas, chefes especiais e treinamento de Guy com dificuldades e recompensas escolhidas.
- Tela final detalhada com estatísticas, dano de habilidades e itens, gráficos, tempo, abates, DPS e progressão.

## Terminologia e referência Naruto
- Ryō: moeda monetária do mundo Naruto, proposta como moeda permanente.
- Chakra: recurso de combate, não moeda. O usuário sugeriu 'chakras' como nome da recompensa; decisão de nome final pendente.
- Colar do Primeiro Hokage: originalmente de Hashirama, herdado por Tsunade, depois presenteado a Nawaki e Dan Katō e finalmente Naruto. No jogo, propõe-se item de Sorte; este efeito não é canônico.
- Referência oficial: https://naruto-official.com/en/news/01_1868

## Slots e combate
- Slots 1–3 disponíveis; slot 4 bloqueado por upgrade permanente da conta.
- Separar input de habilidade da lógica de autoataque. Configuração de disparo manual/automático a decidir.
- Modificadores: aditivos +%, multiplicativos independentes [x]%; atribuir fonte a cada instância de dano para estatísticas.
- Taijutsu conta como dano físico/normal; Genjutsu como controle mental; Ninjutsu com afinidades elementais.
- Efeitos: queimadura, veneno, congelamento, paralisia, lentidão, desorientação; controle de imunidades e resistência de chefes.

## Pool, sorte e RNG
- Primeiro filtrar conteúdo desbloqueado, compatível com personagem, modo e restrições de exclusividade.
- Escolher categoria com pesos configuráveis; escolher raridade com pesos afetados por Sorte; escolher entrada com pesos próprios.
- Distribuição-base de teste: comum 60, incomum 25, raro 10, épico 4, lendário 1.
- Fórmula experimental: peso_r = peso_base_r * (1 + sorte/100)^indice_r; normalizar pesos para probabilidades. Indices 0..4.
- Sorte não altera efeitos de itens já obtidos, salvo regra específica.
- Determinismo: registrar seed, versão das regras, estado dos desbloqueios e decisões de RNG no servidor.
- Balancear com simulações Monte Carlo e proteção opcional contra sequências de má sorte.

## Progressão permanente
- Ryō por conclusão, duração, dificuldade, marcos, eventos e recompensas diárias.
- Árvore pré-partida: ofensiva, defensiva, mobilidade, fortuna, ninjutsu e suporte.
- Registrar custo, pré-requisitos, níveis, reembolso de pontos e versionamento dos nós.
- Evitar pay-to-win; rankings devem segmentar modos/temporadas e considerar normalização de progressão.

## Eventos
- Treino de Guy: fácil 500 abates, difícil 2.000, lendário 5.000; objetivos configuráveis e proteção de área opcional.
- Ao concluir, escolher exatamente 1 buff entre atributos elegíveis; dificuldade altera magnitude.
- Altar: defender zona por duração, com ondas e penalidades ao sair da área.
- Encontro de ninja: duelo com modificadores e recompensa temática.
- Chefes/Bijuu: eventos de combate e selamento; condições de desbloqueio de personagens definidas separadamente.
- Sistema de eventos orientado a dados: id, trigger, objetivo, dificuldade, timer, recompensa, estado e telemetria.

## Relatório final
- Resumo: personagem, modo, dificuldade, seed, duração, nível, abates, mortes, chefes, eventos, Ryō e recordes.
- Ofensiva: dano total, DPS médio, DPS em janela móvel, pico, dano por habilidade, por item, por DoT, por elemento, críticos, overkill.
- Defensiva: dano recebido, mitigado, esquivado, curas, escudos e tempo sob status.
- Economia: XP obtida, bônus de XP, moedas, raio de coleta, itens ofertados e escolhidos.
- Build: árvore pré-partida, quatro slots, níveis, ícones, raridades, pílulas, passivas, itens e ordem de obtenção.
- Gráficos: DPS ao longo do tempo, dano acumulado por fonte, distribuição de elementos e progressão de atributos.
- Coletar telemetria agregada em janelas de tempo, sem criar objetos de UI ou logs por hit; evitar impacto no FPS.

## Requisitos técnicos
- Renderização desacoplada da simulação; instancing, spatial hashing, object pools, agregação de textos de dano.
- Multiplayer: servidor autoritativo para resultados e recompensas; atualizações de rede compactas.
- Benchmark: 1400+ inimigos, quatro atacantes, muitos hits/status e coleta; medir p95/p99 de frametime e não apenas FPS médio.
- Limites numéricos de segurança e prevenção de exploits, apesar da intenção de crescimento ilimitado de atributos.

## Status
Documento de design elaborado; implementação, arte, servidor, testes e balanceamento NÃO realizados por este documento.
# Escolha de recompensa

Ao fechar a Roleta da Tsunade, cada item aguarda uma decisão. E pega, V vende, e a próxima recompensa aparece na mesma ordem dos giros. A fila é salva com a run. As recompensas do mapa e da roleta não concedem pílulas nem habilidades. Essas duas categorias só entram nas ofertas de subida de nível. Pílulas pendentes de roleta em saves antigos viram Ryu. A Sorte pode elevar o número de cartas de três para quatro, respeitando o mesmo teto ao banir ou atualizar.
