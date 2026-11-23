# Retomada do projeto em 23/11/2026

## Estado conferido

Foram relidos os 47 Markdown de documentação, histórico geral, instruções de agentes e skills da pasta principal. A revisão também conferiu os arquivos e o guia da cópia de validação, o arquivo externo do low poly e as branches remotas. A pasta de trabalho vigente continua sendo `C:/Shinobibonk projeto - Copia/ShinobiBonk_Codex_Projeto_Completo`.

| Linha de trabalho | Estado em 23/11 |
|---|---|
| `main` | Sincronizada com `origin/main` em `a394509`, rodada 103, antes deste registro documental. Última alteração funcional publicada em 16/11. |
| `mapas_basicos` | Backup local e remoto em `c7581be`, anterior às novas vilas e às rodadas 97–103. |
| `vilas-em-validacao` | Última publicação em `d0656ea`. Contém a primeira planta jogável das vilas, que o usuário considerou visualmente insuficiente. |
| Revisão posterior das vilas | Alterações locais na cópia de validação. Ainda não publicadas, integradas ou revalidadas como conjunto. |
| Personagem low poly | Código, atlas, comparação e conceito copiados para arquivo externo. Remoção efetuada localmente na cópia de validação, ainda pendente de commit. |

A cópia de validação fica em `C:/Users/jcffa/.codex/visualizations/2026/11/05/01a1ac4d-0369-73f1-810f-edd7eb771dd4/shinobibonk-vilas-validacao`. O arquivo low poly fica no diretório irmão `arquivo-low-poly-naruto`. O projeto principal continua usando os personagens em sprite e seus mapas anteriores.

## Trabalho interrompido

O usuário apontou que a vila entregue tinha muito menos conteúdo que as imagens apresentadas. Pediu revisão meticulosa da referência, quarteirões densos, ruas, casas como objetos, acessos, escalada e construções com orientação fixa ao girar a câmera. Pediu também manter os personagens atuais e guardar o experimento low poly fora do projeto. A entrada dos mapas novos na versão principal depende da conclusão e da validação.

Na cópia de validação foram encontrados estes arquivos locais em andamento.

- `src/scene/villageDistricts.ts` define lotes mais próximos, fachadas comerciais, casas e terraços por vila.
- `src/scene/villageArchitecture.ts` constrói volumes de fachadas, telhados, janelas, portas, toldos, lanternas, portões e torres. Agrupa a geometria por região para reduzir chamadas de desenho.
- `public/assets/vilas-arquitetura-v1.png` é o novo atlas de materiais.
- `villageTerrain.ts` já lê os lotes para ajustar o terreno.
- `villageLayout.ts` teve as casas antigas removidas da lista de sprites.

**A integração ficou incompleta.** `villageScenery.ts` ainda usa a implementação anterior com sprites e não importa nem chama `createVillageArchitecture`. A retirada das casas antigas da lista e a ausência dessa chamada tornam o parcial inadequado para entrega. A arquitetura com orientação fixa precisa assumir a construção dos prédios, as bases de colisão e as superfícies de apoio.

O guia `docs/development/CRIAR-MAPAS-JOGAVEIS.md` existe na branch de validação, mas ainda descreve o experimento low poly e o antigo botão Mapa Protótipo. Deve ser atualizado com a decisão posterior antes de nova publicação.

## Mudanças publicadas pelo Claude

Enquanto os mapas ficaram com o Codex, a versão principal recebeu as rodadas 97–103.

1. Hagoromo com chaves, clareira, hordas, Mega Elite, ferramentas e troca de ferramentas.
2. Treinamento da Juventude com Might Guy e cinco desafios.
3. Água com respingos, ondas de outros atores, chakra nos passos e margem molhada. Susanoo do Madara com transições entre quadros.
4. Efeitos próprios de atlas para 16 técnicas anteriormente genéricas.
5. Cartões de pílulas e itens e enquadramento do catálogo de fusões.
6. Revisão dos status das técnicas e pacote de Resfriado, congelamento, reações, resistência, sono e veneno. Quebra-Gelo e explosões de itens na morte.

Há testes por código registrados no histórico dessas rodadas. O mínimo atual da versão principal é 212. O resultado anterior de 208 testes da branch de mapas pertence a `d0656ea`, antes das alterações locais posteriores. Ele não valida o parcial atual.

## Ordem de continuação

1. Preservar o parcial local e levar as rodadas 97–103 para a branch de validação, conciliando principalmente `GameCanvas.tsx`, `water.ts`, `terrainArt.ts`, a tela inicial e os testes.
2. Concluir e verificar a retirada do experimento low poly do projeto, com arquivo externo íntegro e documentação coerente.
3. Integrar a arquitetura fixa e revisar a composição das quatro vilas contra as respectivas fotos da seleção. Conferir escala, densidade dos quarteirões, primeiro plano, fundo, fachadas, telhados, canais e pontes.
4. Conferir contato do personagem com a base real das construções, escalada, saída do telhado, posição dos NPCs, acesso às ruas e retomada dos saves.
5. Executar os testes apropriados sem navegador. Comparar imagens renderizadas do código com a referência e registrar a validação em partida ainda necessária.
6. Publicar a revisão na branch de validação. Integrar à versão principal após o aceite visual.

Depois dos mapas, permanecem a arte pintada de Susanoo de Sasuke e Itachi, a revisão por técnica, a corrida do Jūzō, a queda ajoelhada dos Mega Elites, o acabamento de fusões e a calibração dos status. A fila geral está em [docs/13](13-PENDENCIAS-PARA-CONTINUAR.md). As receitas pendentes de decisão ficam em [docs/10](10-PLANEJAMENTO-FUSAO-PROGRESSAO-V05.md).

## Como interpretar os documentos antigos

Os registros históricos preservam decisões e contagens antigas. Para o estado atual, cruzar a data com o código e o log de commits. Há trechos antigos com 56 ou 96 versões, ranking ausente e eventos ainda pendentes que foram superados por rodadas posteriores. A passagem [docs/26](26-PASSAGEM-PARA-O-PROXIMO-AGENTE.md) continua útil como histórico e lista de validação visual, mas antecede as rodadas 97–103.

A restrição de testes em navegador segue ativa para todos os agentes. A [política central](development/TESTING_POLICY.md) define os testes permitidos e o registro da validação visual pendente.

Nesta retomada passaram a checagem TypeScript, `verify-rules`, o build da versão principal e a conferência do diff documental. A suíte de 212 testes não foi repetida nesta revisão de documentação. O parcial dos mapas também não foi revalidado nesta retomada.
