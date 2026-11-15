# Ranking e clãs

## Estado atual

O hub mostra os cinco primeiros e a colocação pessoal. A tela completa exibe até 100 perfis ou clãs. O placar geral soma o melhor resultado de cada região em abates. Os filtros de região, dificuldade e shinobi são aplicados antes de escolher os recordes. A temporada local dura 28 dias, a partir de 01/11/2026 às 00h de Brasília. Essas datas são configuração do protótipo.

A ficha mostra os totais do perfil, a última build usada por versão de shinobi e as 30 missões recentes. O final da missão grava técnicas, pílulas, itens, ajudantes e métricas. A migração importa uma vez o histórico que já existia para o perfil ativo. Registros antigos ficam com as métricas disponíveis e sem build. O identificador da conta local é preservado quando o convidado cria login.

A sigla de um clã é única. Um perfil pode criar um clã, entrar num existente ou sair. A pontuação soma os recordes de temporada dos membros atuais. Quando o líder sai, o primeiro membro restante assume. O último a sair encerra o clã. Reset de conta remove a ficha, os recordes e o vínculo de clã do perfil ativo.

A base compartilhada entre perfis do mesmo navegador fica em `shinobibonk.league.v1`. E-mail e verificador da senha continuam no cadastro de origem. O resumo de fim de missão mantém o ranking pessoal de região e dificuldade. Validação em partida segue pendente.

## Publicação online · proposta

- Hospedar o frontend no Netlify e usar Supabase Auth com PostgreSQL. Manter preferências de tela e a partida em andamento no dispositivo. Guardar progresso, clãs, temporadas, resultados e builds concluídas no servidor.
- Usar tabelas relacionais para perfis, temporadas, clãs e membros. Registrar cada missão concluída com identificador único e guardar o retrato final da build em JSONB. Calcular o ranking a partir dos recordes aceitos, com índices por temporada e região.
- Usar políticas de acesso para separar os dados públicos da ficha e os dados privados da conta. A API autenticada cria o identificador da missão, confere o vínculo com a conta e a versão do jogo, trata reenvios e decide se o resultado entra no placar. Uma verificação de plausibilidade é uma primeira camada de revisão. Para competição com premiação, a pontuação precisa de replay verificável ou simulação no servidor.
- Importar progresso local por conta mediante confirmação. Preservar os recordes locais como histórico, mantendo a primeira temporada competitiva restrita a resultados registrados pelo servidor.

O serviço online depende de provisionamento, autenticação, API de resultados e validação. A interface atual usa a base local.
