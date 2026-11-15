---
name: proteger-publicacao
description: Mantém contas, ranking, dados privados e parâmetros de balanceamento protegidos ao preparar deploy, API, banco ou instalador do ShinobiBonk.
---

# Publicação, contas e distribuição

- Leia docs/development/RANKING-E-CLAS.md antes de editar autenticação, banco, placar ou instalador.
- Guarde chaves, tokens, senhas, strings de conexão e configuração interna somente no escopo privado do servidor. Use valores fictícios em exemplos e testes. Verifique o diff, os arquivos rastreados, o bundle e o conteúdo do instalador antes de publicar.
- Prefira API no domínio do jogo e sessão HttpOnly, Secure, SameSite. Reduza os dados de respostas públicas ao necessário. Use acesso mínimo no banco e valide vínculos e permissões na API. A chave de serviço do banco fica fora do cliente.
- Use identificadores de partida, submissão idempotente e invariantes no servidor. Quando uma métrica determinar competição ou prêmio, valide por replay verificável ou simulação autoritativa. Projeções podem ser calculadas sem gravar pontuação.
- Trate arquivos do executável como distribuídos. Mantenha fora do pacote mapas de fonte, documentos internos, material externo e segredos. Para confidencialidade, execute o balanceamento reservado no servidor.
- Ao auditar possível exposição, reporte só os caminhos, a classe de dado e o resultado. Preserve o conteúdo de credenciais e dados pessoais fora de commits, documentação, histórico de comandos e respostas.
