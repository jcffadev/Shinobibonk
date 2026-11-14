# Pedido de arte — Zabuza fazendo os selos da Névoa Oculta

> Para o **Codex** (gerador de imagens), seguindo `skills/criar-arte-shinobibonk/SKILL.md` e `skills/movimentar-shinobi/SKILL.md`.
> Criado pelo Claude Code em 14/11/2026, item 18 da fila (`docs/13`).
> Pedido do usuário: "quero um action time do Zabuza castando os selos, pegue do anime dele castando para fazer a névoa oculta".

## O que já está pronto no código (Rodada 63)

- **Entrada do Zabuza:** quando começa a "Névoa do Zabuza", ele surge **à vista**, 7 m à frente do jogador, e fica **parado fazendo os selos** por 2,6 s.
- **Aviso e névoa:** aparece "Zabuza: Ninpō · Kirigakure no Jutsu!" e a névoa engrossa aos poucos. Só depois ele some nela, como antes.
- **Até a arte existir:** ele repete a **pose de conjuração** da própria folha (`zabuza-roster-v1.png`, fileiras de ataque).
- **Arte nova:** quando a folha de selos for registrada, ela passa a ser usada automaticamente.

## O que gerar

`public/assets/shinobi-motion/zabuza-seal-v1.png`, **1280 × 1280**, no **mesmo layout** de `naruto-hand-seal-v1.png`:

- **4 colunas:**
  1. preparação vista de frente;
  2. selo vista de frente;
  3. preparação vista de costas;
  4. selo vista de costas.
- **4 fileiras** de 320 × 320. O jogo usa **só a fileira 1**; as outras podem repetir a primeira ou ficar transparentes.
- **Referência da cena:** o Zabuza no começo do arco da Ponte (Naruto clássico) fazendo os selos da Névoa Oculta antes de sumir. Técnica: Narutopedia, "Hidden Mist Technique" (Kirigakure no Jutsu). Confira lá os selos usados antes de desenhar; se a fonte não mostrar os selos, use o selo de uma mão erguido à frente do rosto, que é a pose mais reconhecível dele, e registre isso no JSON de prompts.
- **Identidade da versão:** traje do Zabuza (bandagens no rosto, protetor da Névoa de lado, Kubikiribōchō nas costas), na **mesma escala, paleta, contorno e ponto de apoio dos pés** da `zabuza-roster-v1.png`. Três quartos virado para a direita, como o padrão de caminhada (`docs/development/PEDIDO-ARTE-CAMINHADA-PADRAO.md`).
- **Arte original:** nunca usar sprites ou frames oficiais. Prompts num JSON em `docs/`.

## Como integrar (1 linha)

Em `src/game/directionalArt.ts`:

```ts
export const EXTRA_SEAL_SHEETS: Record<string, string> = {
  zabuza: '/assets/shinobi-motion/zabuza-seal-v1.png',
};
```

## Como testar

1. `TESTAR_JOGO.bat`: `tests/clima.test.mjs` cobre a conjuração, a névoa engrossando e o Zabuza parado durante os selos.
2. **Em jogo** (o Codex pode usar o navegador; o Claude Code está sem navegador), no mapa da Névoa, a partir de 1:10 da zona. Conferir:
   - o Zabuza aparece à vista;
   - faz os selos;
   - o aviso aparece;
   - a névoa engrossa;
   - ele some na névoa.
3. Registrar com a skill `documentar-projeto`.
