# Ficha, HUD, estatísticas e ranking

## HUD em partida
HP, XP, nível, Chakra/recarga da Ultimate, tempo, abates individuais, inimigos vivos, mapa/bioma, dificuldade, dinheiro da partida, slots 1–4, R, aliados 3/5, minimapa, evento ativo, meta Top 1 e colocação dinâmica. A meta deve comparar a run atual inclusive com recordes **do próprio jogador** salvos localmente. Ranking global entre jogadores exige servidor e validação antitrapaça; não alegar online quando apenas local.

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
  - No topo: missão, contagem regressiva de 10:00, Ryu, kunai/shuriken, clima e zona.
  - Minimapa no canto superior direito.
  - Barra de 4 técnicas automáticas com as pílulas acima e o botão R com o selo AUTO.
  - Itens no canto inferior direito.
  - FPS e inimigos vivos no centro inferior.
  - Faixa do guardião com HP, progresso da defesa do altar, aliados e sinergia.
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
