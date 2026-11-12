# Ficha, HUD, estatísticas e ranking

## HUD em partida
HP, XP, nível, Chakra/recarga da Ultimate, tempo, abates individuais, inimigos vivos, mapa/bioma, dificuldade, dinheiro da partida, slots 1–4, R, aliados 3/5, minimapa, evento ativo, meta Top 1 e colocação dinâmica. A meta deve comparar a run atual inclusive com recordes **do próprio jogador** salvos localmente. Ranking global entre jogadores exige servidor e validação antitrapaça; não alegar online quando apenas local.

- **Cores de ganho e perda (IMPLEMENTADO em 06/11/2026, pedido do usuário)**: `src/ui/BuffText.tsx` pinta os textos de efeito dos cards em **verde** (+%, ×1,x, ganho, cura, ressurreição, descontos/"custa menos") e **vermelho** (−%, perda, custo, dívida, emboscada). Vale para cartas de level-up, recompensa e NPC, troca de ajudante, passivas dos ajudantes, prêmios da roleta, ficha, Bolsa da Missão e Plano de build.
- **Rota no mapa**: cartão com nome e metros abaixo do minimapa, seta ou pino na tela e "Chegou!" (ver docs/01).

## Configurações (IMPLEMENTADO em 06/11/2026, referência do usuário)
- `src/ui/SettingsScreen.tsx` + `src/settings.css` + `src/game/settings.ts` (`sb_settings_v1`): menu de categorias e painel colorido; salvas na hora e aplicadas ao vivo na partida (evento `shinobi-settings`). Abre pelo hub (⚙) e pela pausa (Esc → Configurações).
- **Som**: volume geral, efeitos, vozes, silenciar em segundo plano (música: em breve).
- **Gráficos**: qualidade (pixel ratio), limite de FPS (30–144), V-Sync (ligado = um quadro por quadro do monitor; desligado = renderiza acima da taxa do monitor quando o sistema aguentar — no navegador é o melhor esforço, no .exe desliga direto do motor), placa de vídeo (automática/alto desempenho/integrada → `powerPreference` do contexto WebGL; a troca recria o contexto na hora), ocultar meus ataques, números de dano, drops discretos, efeitos de coleta, mostrar FPS.
- **Tela**: tela cheia/janela, resolução (automática, nativa, 900p, 720p); monitor escolhido pelo navegador (no .exe: renderizador OpenGL/DirectX também por escolha do jogador).
- **Controles**: sensibilidade do mouse (1:1, sem aceleração — raw input via `unadjustedMovement` no pointer lock), inverter Y, distância da câmera, Ultimate automática ao começar, card de captura.
- **Teclas**: 15 ações remapeáveis (troca automática se a tecla já era usada; Esc fixo). Pulo/deslize: em breve.
- **Interface**: tamanho e opacidade do HUD, minimapa on/off e tamanho, avisos on/off.
- **Idioma**: português (outros em breve). **Conta**: nome do jogador, começar do zero, apagar dados locais.

## Tela de pausa
1. **Progressão por nível**: melhorias permanentes à ficha obtidas ao esgotar o pool, excluindo XP%.
2. **Ataque**: dano total, Taijutsu, Ninjutsu, Genjutsu/status, velocidade de ataque, área, projéteis, duração, crítico, dano crítico, dano por status, chance de status, penetração.
3. **Defesa**: HP, armadura, redução, evasão, regeneração, resistências.
4. **Utilidade**: velocidade, sorte, coleta, XP%, Lamens, recarga da Ultimate.
5. **Itens**: nome, raridade, pilhas, origem e contribuição por atributo.
6. **Buffs dos eventos**: origem, valor, duração restante, penalidades e efeitos cumulativos.
7. **Resumo de contribuições**: base do personagem + nível + árvore + itens + pílulas + habilidades + aliados + eventos, respeitando bônus aditivos e multiplicativos [x].

### Cálculo seguro
A ficha derivada deve ser recalculada de fontes imutáveis/ativas sempre que um item/pílula for vendido ou esquecido com Shisui. Não subtrair diretamente de valores já multiplicados. Raio de coleta limitado à tela visível conforme viewport/zoom em pixels.

## Ranking
Atualizar a posição e distância até o Top 1 após cada abate. Guardar partidas com personagem, dificuldade, mapa, abates, duração, dano e data. O protótipo Canvas v0.5 tinha um ranking local simplificado. **A base React/Three.js atual não tem ranking**, nem local nem online (**PENDENTE**).

## Estado do código (05/11/2026)
- **IMPLEMENTADO na HUD**:
  - Retrato, nível, HP e XP no canto superior esquerdo.
  - No topo, em blocos: missão + clima/zona; contagem regressiva grande de 10:00 (ou "FINAL SWARM +m:ss"); Ryu em formato curto e kunai/shuriken. Linha secundária menor com os preços de kunai, shuriken, mercador (roletar) e roleta. Avisos ficam abaixo da barra.
  - Minimapa no canto superior direito, com ícones contidos no círculo e rótulo "Tab rápido · M mapa"; o selo DEBUG fica abaixo do rótulo.
  - Painel SINERGIAS recolhível pelo título (estado salvo no navegador). Itens: até 3 linhas com rolagem.
  - Barra de 4 técnicas automáticas com as pílulas acima e o botão R com o selo AUTO.
  - Itens no canto inferior direito.
  - FPS e inimigos vivos no centro inferior.
  - Faixa do guardião com HP e progresso da defesa do altar.
  - **Cartões de ajudantes** à esquerda, abaixo do herói, no padrão da referência do usuário: retrato, nome, selo da aldeia ou SINERGIA, buff, técnica com barra de recarga, elemento, escola e % de dano.
- **IMPLEMENTADO na ficha (P)**, em `src/ui/RunSheet.tsx`:
  - Atributos finais derivados de `calculateStats`.
  - Escala de dificuldade.
  - Técnicas com dano causado e afixos acumulados.
  - Itens e pílulas com quantidades.
  - Aliados e sinergia.
  - Os atributos são recalculados das fontes a cada quadro, sem subtrair de valores já multiplicados.
- **PENDENTE**:
  - Subtotais por origem (base, nível, árvore, itens, pílulas, aliados, eventos) com distinção visual entre aditivo e [x].
  - Contador de abates na HUD principal. Hoje os abates só aparecem na ficha (tempo, abates, Ryu, dano dos aliados) e na tela final.
  - Ranking e gráficos ao longo do tempo (DPS por janela, dano acumulado).
- **IMPLEMENTADO (tela final)**: `src/ui/RunSummary.tsx` mostra o resumo da run, no estilo da ficha P:
  - resultado, tempo, zona, abates, dano total, DPS médio, dano dos aliados, moedas e armas;
  - dano por técnica com % e DPS;
  - build final e atributos finais.
  - Ainda não mostra dano por item ou DoT, dano recebido nem curas.
  - Menu de configurações gráficas.
