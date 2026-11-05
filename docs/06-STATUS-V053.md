# ShinobiBonk v0.5.3 — correções parciais (HISTÓRICO)

> **Documento histórico.** Descreve o protótipo Canvas 2D em `game/index.html`, não a base atual React/Three.js (`package.json` 0.6.0). Para o estado atual, consulte [00-LEIA-PRIMEIRO.md](00-LEIA-PRIMEIRO.md) e [12-ARQUITETURA-E-ESTADO-DO-CODIGO.md](12-ARQUITETURA-E-ESTADO-DO-CODIGO.md). Itens listados como "não implementados" abaixo (mundo 3D, câmera orbital, descoberta pela câmera) já existem parcialmente na base atual.

## Implementado neste protótipo 2D
- Ultimate disponível desde o nível 1: botão na HUD, tecla R, indicador de carga, carregamento passivo em 55 s e aceleração por drops roxos. Y alterna ativação automática.
- Drops: XP azul, Lamens amarelos, carga de Ultimate roxa com borda.
- Eventos revelados quando jogador se aproxima (raio ilustrativo 210 unidades), persistindo no mapa/minimapa durante a partida.
- M abre mapa; Tab ficha; H esconde projéteis e efeitos visuais sem cancelar colisões.

## Não implementado na v0.5.3
- Mundo 3D verdadeiro, terreno elevado, sprites mini pixel art definitivos, câmera orbital isométrica 360° com inclinação livre, descoberta por frustum/oclusão visual real.
- Os eventos atualmente são descobertos por proximidade, não por verificação de visibilidade da câmera.
- Os valores de recarga e alcance são provisórios.
