# Pedido de arte: corrida do Jūzō de frente e de costas

> Para o **Codex** (gerador de imagens), seguindo `skills/criar-arte-shinobibonk/SKILL.md` e `skills/movimentar-shinobi/SKILL.md`.
> Criado pelo Claude Code em 15/11/2026.
> **Pedido do usuário:** "Revisar animações do Juzo ingame, está travado, como ajudante tbm". Decisão do usuário sobre a correção: "Pedir arte nova", sem paliativo no código.

## Diagnóstico

- **O código está certo.** O Jūzō (`juzo`) escolhe as folhas igual a Kabuto, Kisame e Mangetsu:
  - corrida em `corrida-23.png`, fileiras 0 a 4;
  - andar e ataque em `juzo-roster-v1.png`;
  - costas, pulo e dash em `juzo-directional-v2.png`;
  - perfil em `walk-side-6.png`, fileira 7.
- Nada prende o movimento durante o ataque.
- **O defeito está no desenho** de `public/assets/shinobi-motion/corrida-23.png`:
  - **fileira 0, corrida de frente:** as pernas aparecem como um toco só, quase igual nos 4 quadros;
  - **fileira 1, corrida de costas:** o mesmo defeito, e a espada cobre o centro do corpo;
  - por isso, no WASD ele desliza sem dar passos e parece travado. Como ajudante o efeito é o mesmo, porque usa as mesmas folhas.
- **Comparação:** o Kabuto, nas fileiras 5 a 9 da mesma folha, alterna as pernas com clareza. O perfil do Jūzō (fileira 2) também se mexe.

## O que gerar

Redesenhar **só as fileiras 0, 1, 3 e 4** de `corrida-23.png`. São as cinco vistas do Jūzō menos o perfil (fileira 2), que já está bom. As fileiras 5 a 9 (Kabuto) **não podem mudar**.

| Fileira | Vista | O que precisa ter |
|---|---|---|
| 0 | corrida de frente | 4 quadros com as pernas alternando (contato, passagem, contato, passagem), um pé claramente no ar em pelo menos 2 quadros |
| 1 | corrida de costas | igual à anterior, de costas. A Kubikiribōchō fica nas costas **sem cobrir as pernas** (alta no ombro ou na diagonal) |
| 3 | diagonal de frente | conferir e, se as pernas estiverem paradas, redesenhar com a mesma alternância |
| 4 | diagonal de costas | idem |

- **Padrão do elenco:** corrida com os braços para trás, como as outras 113 versões (ver `skills/movimentar-shinobi`).
- **Referência de ritmo e pose:** as fileiras do Kabuto na mesma folha, e a corrida do Kisame em `corrida-30.png`, fileiras 5 a 9.
- **Mesmo arquivo e layout:**
  - 704 × 1760, 4 colunas × 10 fileiras de 176 × 176, fundo transparente;
  - mesma escala, paleta, contorno e linha dos pés do resto da folha, para a troca entre parado e correndo não pular;
  - a cabeça deve ter o mesmo tamanho da pose parada (regra da Rodada 69, verificada em `tests/proporcao.test.mjs`).
- **Identidade:** manto da Akatsuki, bandana da Névoa riscada, máscara de bandagens e a Kubikiribōchō. Nunca usar sprites ou arte oficiais.
- **Registro:** os prompts num JSON em `docs/`, como nas outras entregas.

## Como conferir a entrega (sem navegador)

- Rodar `TESTAR_JOGO.bat`. Os testes de proporção e de cobertura das vistas leem os PNG reais no Node.
- Gerar a silhueta das fileiras e comparar com as do Kabuto: as pernas precisam mudar de posição entre os quadros.
- **PENDENTE DE VALIDAÇÃO E2E:** ver o Jūzō correndo em WASD, como jogador e como ajudante.
