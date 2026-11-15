# Ranking e clãs

## Estado atual

O hub mostra os cinco primeiros e a colocação pessoal. A tela completa exibe até 100 perfis ou clãs. O placar geral soma o melhor resultado de cada região em abates. Os filtros de região, dificuldade e shinobi são aplicados antes de escolher os recordes. A temporada local dura 28 dias, a partir de 01/11/2026 às 00h de Brasília. Essas datas são configuração do protótipo.

A ficha mostra os totais do perfil, a última build usada por versão de shinobi e as 30 missões recentes. O final da missão grava técnicas, pílulas, itens, ajudantes e métricas. A migração importa uma vez o histórico que já existia para o perfil ativo. Registros antigos ficam com as métricas disponíveis e sem build. O identificador da conta local é preservado quando o convidado cria login.

A sigla de um clã é única. Um perfil pode criar um clã, entrar num existente ou sair. A pontuação soma os recordes de temporada dos membros atuais. Quando o líder sai, o primeiro membro restante assume. O último a sair encerra o clã. Reset de conta remove a ficha, os recordes e o vínculo de clã do perfil ativo.

A base compartilhada entre perfis do mesmo navegador fica em `shinobibonk.league.v1`. E-mail e verificador da senha continuam no cadastro de origem. O resumo de fim de missão mantém o ranking pessoal de região e dificuldade. Validação em partida segue pendente.

## Publicação online

A função Netlify usa a migração em supabase/migrations e registra partidas solo clássicas no PostgreSQL com a conta autenticada. A temporada, o Top 100, a posição pessoal além do Top 100, o histórico, as builds, os clãs e o avatar são calculados com os dados aceitos. O cartão na partida mostra os abates, a sequência de quatro segundos e a projeção atualizada a cada cinco segundos. A posição confirmada só muda com resultados aceitos.

1. Aplique a migração SQL no projeto PostgreSQL com Supabase Auth.
2. Configure o domínio oficial HTTPS e a confirmação de e-mail no Auth. No modelo de e-mail use {{ .SiteURL }}/.netlify/functions/ranking?confirm={{ .TokenHash }} para a confirmação do lado da função.
3. Configure VITE_RANKING_ONLINE=1 no escopo de build do Netlify. Defina RANK_SUPABASE_URL, RANK_SUPABASE_KEY (chave publicável do provedor), RANK_PUBLIC_ORIGIN (origem HTTPS exata) e RANK_SESSION_SECRET (32 bytes aleatórios em hexadecimal) no escopo da função.
4. Faça deploy e teste criação de conta, avatar, término de missão e filtros com uma conta de teste antes de anunciar o placar.

As tabelas ficam em esquema privado. As operações públicas acessam somente funções concedidas por papel. A sessão fica num cookie autenticado e cifrado, HttpOnly, Secure e SameSite=Lax. A resposta pública traz apelido, avatar e dados de partida. E-mail, tokens e configuração do provedor ficam fora das fichas e do bundle.

O servidor confere conta, identificação da partida, campos e plausibilidade, preserva idempotência e separa registros em revisão. A integridade competitiva depende de simulação autoritativa ou replay verificável. O sistema ainda recebe as métricas do cliente. A interface oferece os filtros de modo e equipe, que receberão dados quando os modos correspondentes tiverem integração. O modo solo clássico funciona para submissão. Credenciais e progresso do cadastro local permanecem no dispositivo.

O instalador Windows depende da distribuição final. Código, assets e parâmetros executados no dispositivo são inspecionáveis. Parâmetros reservados e cálculo autoritativo precisam residir no servidor para preservar confidencialidade. Ainda não há instalador nem ambiente de produção divulgado nesta rodada.
