# Instruções para Codex — ShinobiBonk

Leia primeiro README.md e docs/00-LEIA-PRIMEIRO.md; consulte os demais docs conforme a tarefa. A base atual executável é React + Three.js em src/; game/index.html é a versão Canvas 2D legada. Histórico em history/ não é fonte de verdade do código atual.

## Documentação contínua
- Sempre que alterar código, configuração, controles, assets ou sistemas, siga `skills/documentar-projeto/SKILL.md` e sincronize os Markdown afetados na mesma tarefa.
- Mantenha README.md, docs/00-LEIA-PRIMEIRO.md, docs/12-ARQUITETURA-E-ESTADO-DO-CODIGO.md, o documento temático e CHANGELOG.md alinhados ao estado real.

## Publicação no GitHub
- Ao fim de **toda** tarefa que alterou arquivos, depois de documentar e verificar, siga `skills/publicar-github/SKILL.md`: commit em português e push para `origin main` (`https://github.com/jcffadev/Shinobibonk.git`). Nunca use force push. Nunca publique credenciais (ex.: `Feedback da versão.txt`, que está no `.gitignore`).

## Regras de colaboração
- Fale em português do Brasil. Seja objetivo, técnico e explícito.
- Classifique fatos como CONFIRMADO, IMPLEMENTADO, TESTADO, PROPOSTO ou PENDENTE. Não declare funcionalidade testada sem execução real.
- Não confunda imagens em references/concept_art com screenshots reais.
- Preserve decisões de gameplay do usuário; quando houver divergência entre código e requisitos, documente e corrija com cuidado.
- Faça mudanças incrementais e registre mudanças no CHANGELOG.md; não declare teste de sintaxe ou jogabilidade sem executá-lo.
- Fonte de conhecimento canônico (vilas, clãs, organizações, técnicas, natureza de chakra/elemento): **Naruto Wiki/Narutopedia** (https://naruto.fandom.com/). Cite a página consultada. Se encontrar fonte mais atualizada ou divergente, avise o usuário para revisar antes de alterar o personagem. Percentuais e atributos de gameplay continuam regras originais do protótipo.
- Terminologia: o atributo `attackSpeed` chama-se **velocidade de ataque** em todo texto (nunca "cadência"). Velocidade de projétil (`projectileSpeed`) é outro atributo.
- Direção de arte (receita do usuário, 06/11/2026): personagens em pixel art chibi (cabeça grande, corpo compacto, silhueta e cores reconhecíveis de Naruto clássico/Shippuden), vistos de câmera elevada; cenário 3D estilizado em visão isométrica (2.5D); resolução-base, proporções e paleta únicas para todo o elenco; animações de caminhada, ataque, dano e Ultimate. Como a câmera gira 360°, a direção preferida a longo prazo é personagem 3D de baixa complexidade com aparência pixelada (alternativa: sprites direcionais de 4/8 direções). Nunca usar sprites ou modelos oficiais. Iruka, Ebisu e Kushina (SVG gerados em scripts/generate-sprites.mjs) devem ser revisados nessa receita.
- Não inclua bibliotecas externas ou ativos de terceiros sem verificar licença e necessidade.

## Invariantes de design
- 4 habilidades comuns em slots 1–4, ativadas **somente automaticamente**, slot 4 desbloqueável na progressão permanente.
- Ultimate natural disponível desde nível 1: R manual; a **tecla Y é obrigatória** e alterna o uso automático (o selo AUTO embutido no botão R faz o mesmo por clique). Não remover Y. A recarga é passiva por tempo e pode receber aceleradores por drop azul (orbe de chakra); Chakra também é usado por ninjas Taijutsu. Itens não concedem Chakra diretamente.
- Drops no chão devem ser distinguíveis (decisão do usuário em 06/11/2026): Chakra/carga da Ultimate = orbe azul; XP = essência roxa (maior para elite/mega elite/guardião); Ryu = moeda dourada com 両; tigela de lamen = cura 35% do HP (15% por abate, não dá Lamens); pílula rosa; item laranja.
- M abre mapa completo; minimapa permanente superior direito; eventos só são registrados após serem **vistos em tela**. Conforme orientação mais recente do usuário, Tab abre o mapa rápido e P abre ficha/build/itens/pool.
- HUD: nível superior esquerdo, pílulas acima das habilidades, inventário com ícones/quantidades inferior direito.
- 3 shinobi de suporte base +1 por item da run +1 passiva permanente comprada com Lamens = máximo atual 5, sem contar herói.
- Lamens compra desbloqueios pré-run de itens não comuns e níveis da árvore permanente; desbloquear item só o adiciona ao pool. Lamens são ganhos **só pelo desempenho da run**; Ryu da run, itens e pílulas (inclusive a Pílula do Mercador) não geram Lamens.
- Level-up oferece **somente técnicas e pílulas**, nunca itens. Técnicas todas no máximo → só pílulas; pílulas todas no limite → só técnicas. Itens só por recompensas (kunai, shuriken, eventos).
- Remédio do Rock Lee lendário **sem penalidade nem emboscada obrigatória**; Orochimaru é NPC.
- H reduz renderização de efeitos/números sem desabilitar hits; 1500 inimigos simultâneos é meta de performance, não fato validado.
- Geometria de terreno/obstáculos não impede hits dentro da área válida da habilidade.
- Selamento (06/11/2026): o 1º encontro especial da run, se houver shinobi bloqueado, é o **Shinobi para selar** (contorno ciano): selar o DESBLOQUEIA na conta, sem buff, EXP ou drops. Os demais são **Mega Elites** (contorno vermelho): selados viram ajudantes da run e NÃO desbloqueiam na conta. **Elite amarelo** (contorno amarelo) não é capturável: mais forte, mais defesa, sem habilidades, mais Ryu/Chakra/EXP conforme HP e dificuldade. Mega Elites e elites não usam técnicas; só o guardião usa. Kill reward não duplica.
- Técnicas: cada shinobi tem 1–2 técnicas ÚNICAS; o resto do kit vem da biblioteca compartilhada. Só aprende elementos das naturezas canônicas (+ Neutro; Sábio para usuários do Modo Sábio). Compartilhadas entram pelo pool da mesma vila (elemento compatível) ou de outra vila com o mesmo elemento. Únicas de outro shinobi só entram depois de selá-lo pela 1ª vez. Técnicas de outros precisam de 100% de pesquisa para entrar no Plano de build.
- Debug: os parâmetros salvos são a base Genin; Chunin/Jonin/Kage multiplicam por cima.
- Ao remover pílula, recalcular atributos desde as fontes, sem buffs residuais.

## Arquitetura
A aplicação atual está modularizada em React/TypeScript e Three.js; `game/index.html` mantém o protótipo Canvas legado. Consulte `docs/12-ARQUITETURA-E-ESTADO-DO-CODIGO.md` para a estrutura atual. Sprites em atlas são provisórios, não assets finais.
