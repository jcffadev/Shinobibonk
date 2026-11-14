# Pedido de arte — bijū de costas

> Para o **Codex** (gerador de imagens), seguindo `skills/criar-arte-shinobibonk/SKILL.md`. Criado pelo Claude Code em 14/11/2026, item 15 da fila (`docs/13`).
> Pedido do usuário: as bijū precisam andar de frente **e de costas**, como os shinobis.
> **O código já está pronto** (Rodada 59): só falta a arte e uma linha de registro.

## Entrega · 14/11/2026

Três páginas traseiras integradas e testadas por código. Conferir visualmente a contagem de caudas em cada pose e as trocas de vista em partida.

## Folhas dianteiras

- `public/assets/bijuu/motion-v1-1.png`, `-2.png` e `-3.png`: **1024 × 768**, grade de **4 colunas × 3 linhas**, células de **256 × 256**, fundo transparente.
- **Colunas** (iguais em todas as páginas): 1 = passo A · 2 = passo B · 3 = técnica (preparação/ataque) · 4 = rugido/recuo ao levar dano.
- **Linhas:** uma bijū por linha, na ordem de `BIJUU` em `src/game/bijuu.ts`, 3 por página:

| Página | Linha 1 | Linha 2 | Linha 3 |
|---|---|---|---|
| `motion-v1-1.png` | Shukaku | Matatabi | Isobu |
| `motion-v1-2.png` | Son Gokū | Kokuō | Saiken |
| `motion-v1-3.png` | Chōmei | Gyūki | Kurama |

- A arte olha para a **direita**. O jogo espelha sozinho quando o jogador está do outro lado.

## O que gerar

Três páginas novas, **no mesmo layout** (1024 × 768, 4 × 3 células de 256 × 256, transparente, mesmas linhas e colunas):

- `public/assets/bijuu/motion-costas-v1-1.png`
- `public/assets/bijuu/motion-costas-v1-2.png`
- `public/assets/bijuu/motion-costas-v1-3.png`

Cada célula mostra a **mesma bijū da célula correspondente da folha de frente, vista de costas** (andando para dentro da tela, câmera elevada 2.5D), três quartos de costas e virada para a direita, como na folha de frente:

- **Colunas 1 e 2:** passos alternados de costas (pernas trocadas, corpo levemente balançando).
- **Coluna 3:** técnica de costas (preparação: corpo recolhido, caudas erguidas).
- **Coluna 4:** rugido/recuo de costas (cabeça virando por cima do ombro).

Regras de arte (receita do projeto):
- Mesma resolução de pixel, paleta, contorno escuro e escala da folha de frente; pés no mesmo ponto de apoio, para não "pular" ao trocar de folha.
- **Contar as caudas** de cada bijū (1 a 9) e manter as marcas e cores da obra: areia e selos do Shukaku, chamas azuis da Matatabi, carapaça e corais do Isobu, lava do Son Gokū, chifres do Kokuō, lesma do Saiken, asas do Chōmei, tentáculos do Gyūki, nove caudas da Kurama.
- Chōmei voa: manter as asas abertas também de costas.
- Margem transparente entre as células; nada encostando na borda da célula (evita restos de poses vizinhas).
- Nunca usar sprites ou arte oficiais. Os prompts usados vão para um JSON em `docs/` (como `docs/arte-elenco-rodada-53.json`).

## Como integrar (1 linha)

Em `src/game/bijuu.ts`, preencher:

```ts
export const BIJUU_BACK_SHEETS: (string | undefined)[] = [
  '/assets/bijuu/motion-costas-v1-1.png',
  '/assets/bijuu/motion-costas-v1-2.png',
  '/assets/bijuu/motion-costas-v1-3.png',
];
```

Pode registrar só as páginas prontas; uma página vazia continua usando a vista de frente. O jogo troca para a folha de costas quando a bijū anda para dentro da tela, com a mesma histerese do jogador (vira acima de 0,26 e volta abaixo de 0,1), e mantém a vista quando para.

## Como testar

1. `TESTAR_JOGO.bat`: `tests/bijuu.test.mjs` já cobre a troca de folha com uma folha falsa.
2. Na validação manual em jogo, conforme a política central de navegador: arena da bijū, andar em volta dela com a câmera em 4 ângulos. Conferir:
   - costas ao se afastar, frente ao vir;
   - espelho lateral;
   - pés no mesmo apoio;
   - entrada de 1,2 s.
3. Registrar com a skill `documentar-projeto` (CHANGELOG, docs/13, docs/14, docs/18).
