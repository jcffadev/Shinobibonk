# Pendências para continuar (estado em 06/11/2026, commit 24ab2de)

Levantamento feito ao fim da sessão do Claude Code para continuar no Codex. Tudo abaixo está **PENDENTE** salvo indicação.
Antes de mexer: leia AGENTS.md (regras e invariantes), README.md, docs/00 e docs/12. Verificação padrão:
`tsc --noEmit -p .`, `vite build`, `node scripts/verify-rules.mjs`, `node scripts/verify-runtime.mjs` (Node do Codex em
`%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`; git em `C:\Program Files\Git\cmd\git.exe`).

## Fila do Codex (EM ANDAMENTO, relatada pelo Codex em 06/11/2026; nada disso deve ser dado como concluído)
- **Pulo e dash**: movimento implementado (`playerMotion.ts`), faltam poses próprias.
- **Outras formas do Naruto**: artes geradas, sem integração nem validação.
- **Outros shinobis**: faltam animações individuais (hoje só o Naruto Academia tem caminhada/arremesso).
- **Atlas de habilidades**: gerado, ainda não integrado ao HUD.
- **Impactos e sons**: faltam integração e revisão. O usuário reprovou os sons do pacote `artifacts/sb-swishes-source.zip` (não publicado, licença não verificada): procurar outros sons depois, com licença livre verificada.
- **Atributos até nível 50**: recalibração pendente; o bônus de +0,8% quando acabam os upgrades é regra separada (`powerlevel.ts`).
- **Chão nas bordas**: alterações feitas (`terrainArt.ts`), validação visual final pendente.
- Pedidos recentes do Codex em curso: bijuus, progressão extra e roleta.
- Skills do Codex: `skills/criar-arte-shinobibonk` (padrão de arte de shinobis, itens, pílulas, cenários) e `skills/movimentar-shinobi` (movimento, pulo, dash, sprites de animação), com ponteiros em `.claude/skills/`.
- Testes atualizados ao trabalho do Codex: o selamento espera o ritual terminar (navegador de teste roda a poucos FPS); vitória por gancho `finishMission` (a missão agora termina no portal de saída); saída da partida pela pausa (Esc → Salvar e sair).

## Pedidos do usuário em 06/11/2026 (PENDENTES)
- **Escala do jogo** (referência: hordas de até ~1400 inimigos, danos de milhões no fim): dano do shinobi crescendo de forma exponencial, HP dos monstros subindo, hordas crescendo com o tempo, inimigos ficando mais fortes e resistentes até forçar o jogador a pular de zona.
- **Recalibração de atributos para todos os níveis** (não só até o 50).
- **Sorte**: quase não afeta cartas e pílulas; buffar a chance de vir mais coisas (RNG muito rígido).
- **Roleta da Tsunade**: nerfar e corrigir a entrega dos bônus (o usuário viu bônus não entregues).
- **Animações**: levar a animação do Naruto (caminhada, diagonal, arremesso) para todos os shinobis com a skill `movimentar-shinobi`/`criar-arte-shinobibonk`; monstros correndo animados em direção ao jogador. Exige gerar arte (folhas de sprites) — o Claude Code não gera PNG de arte; fazer no Codex.

## Decisões aguardando o usuário
1. **Hospedar a Alpha**: escolher GitHub Pages (repo precisa ficar público; criar workflow + `base` no vite.config), Netlify/Vercel/Cloudflare Pages (aceita repo privado) ou itch.io (zip do `dist`).
2. **Coluna "Passivas" na ficha (P/Esc)**: o usuário estranhou buffs no nível 1; vêm das Passivas Shinobi compradas. Proposta: mostrar coluna Base · Passivas · +Nível · Total em `src/ui/RunSheet.tsx`.
3. **Animações**: procedural (balanço, inclinação, squash no pulo, rastro no dash, recuo ao lançar) já é possível; sprite sheets dependem de arte. Direção preferida: personagem 3D low-poly com aparência pixelada (ver AGENTS.md, direção de arte).

## Arte
- **Sprites a revisar no Codex** (gerados por código, fora do padrão do atlas): **Iruka** (`public/assets/shinobis/iruka-1.svg`), **Ebisu** (`ebisu-1.svg`) e **Kushina** (`kushina-1.svg`), todos em `scripts/generate-sprites.mjs` (`--npcs`). Também procedurais: drops e kunai/shuriken no chão (`src/scene/dropSprites.ts`).
- Rever níveis de liberação de técnicas por fase do personagem (ex.: técnicas da fase Shippuden só nos níveis altos); hoje só Naruto (Modo Sábio 25) e Sasuke (Amaterasu 25) foram ajustados.
- Revisar **Iruka, Ebisu e Kushina** (`scripts/generate-sprites.mjs --npcs`, SVG) seguindo a receita de arte do AGENTS.md. Kushina ainda não tem célula no atlas `shinobi-roster-v2.png` (usa `NPC_PORTRAITS`).
- Tela "Escolha o mapa": a prévia usa gradiente CSS por mapa, não captura real do cenário.
- Mapas: Areia/Pedra/Névoa mudam só paleta, tinta e pesos do atlas de cenário; faltam objetos próprios (cactos, rochas, pontes, água).

## Sistemas "em breve" (aparecem desativados na UI)
- **Mochila** (itens levados antes da partida) na tela do mapa: sistema ainda a definir com o usuário.
- **Modo Sobrevivência**.
- Configurações: música/trilha, tremor de tela, brilho dos efeitos, mira manual, controle (gamepad), outros idiomas, tema claro, dicas das primeiras partidas.
- **Pulo e deslize** (teclas e itens da referência: +1 pulo, onda ao aterrissar, invulnerável no deslize etc.).

## Mecânicas incompletas
- Selamento de Mega Elite com até 3 tentativas/falha/fuga (invariante do AGENTS.md) e minigame: não implementado (hoje sempre sela).
- Aviso na tela ao ativar sinergia.
- "EXP necessária por nível" do debug só vale a partir do próximo nível.
- Debug: `setAllUnlocked` (account.ts) existe, mas não há botão "desbloquear tudo / resetar conta" no painel F9.
- Missões de desbloqueio com requisitos de história e abates: regras e UI prontas, **não testadas numa run real** até o shinobi surgir (testes automáticos usam `?test`, que não gera o Shinobi para selar). Testar sem `?test` ou criar hook.
- Alvo fixo (botão direito): implementado; falta tecla remapeável própria e indicador no HUD.

## Balanceamento (todos os valores são provisórios)
- Itens (94), pílulas (19), passivas (25), sinergias/combos, afinidade, setups, Senjutsu (25% · 1,5×), roleta, tiers de inimigo (elite 95 HP/30% defesa; mega 420 HP/55%), lamen de cura (15%/35%), abates e minutos das missões, custo da roleta.
- Performance com 1600 inimigos não medida (há teto de 260 drops com fusão).

## Divergências canônicas registradas (Narutopedia), não alteradas
- Orochimaru só como Vila do Som (canonicamente também Konoha/Akatsuki); Temari só Areia (também ligada a Konoha).

## Testes
- `verify-runtime` tem uma checagem instável de saldo de Ryu (um drop coletado durante a compra da kunai); rodar de novo resolve; correção sugerida: `clearEnemies` antes da compra.
