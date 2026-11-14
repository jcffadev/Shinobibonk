# Pedido de arte — padrão único de caminhada para todo o elenco

> Para o **Codex** (gerador de imagens), seguindo `skills/criar-arte-shinobibonk/SKILL.md` e `skills/movimentar-shinobi/SKILL.md`.
> Criado pelo Claude Code em 14/11/2026, item 15b da fila (`docs/13`).
> Pedido do usuário: "os primeiros… estão andando com uma animação… e os últimos que criamos estão andando de outro. Preciso de um padrão para TODOS, respeitando a folha de movimentação."

## Diagnóstico (CONFIRMADO)

O **código** das 114 versões está ligado corretamente: repouso, andar de frente e de costas, ataque, pulo e dash. A diferença está no **desenho** das fileiras de caminhada.

| Grupo | Como a caminhada foi desenhada | Exemplos |
|---|---|---|
| Padrão do projeto (56 primeiras versões + Naruto Academia) | **Três quartos virado para a DIREITA**, de frente e de costas; o jogo espelha para andar para a esquerda | Naruto Academia (`naruto-academia-walk-v1.png`), Kakashi (`kakashi-walk-v1.png`), Tsunade, Gaara |
| Rodadas 53–54 (58 versões, folhas `*-roster-v1.png`) | **Reto para a câmera** (de frente) e reto de costas; só a fileira de dash é de três quartos | Kisame, Hidan, Hiruzen |

Resultado em jogo: andando para o lado, os primeiros aparecem virados para onde andam e os novos continuam olhando para a câmera.

## Cobertura a completar · revisão de 14/11/2026

O redesenho das fileiras 1–2 corrige a caminhada da expansão. A revisão de pulo e dash também faz parte da entrega para todo o elenco. Na expansão, as fileiras 5–6 servem às duas vistas. Asuma usa uma célula por ação. Os inimigos comuns só têm caminhada na folha de costas. Ao adicionar as poses ausentes, preserve os recortes de ataque que já existem e registre o layout final em `directionalArt.ts`. A matriz sem navegador está em `tests/movimento.test.mjs`.

## O que gerar

Para cada folha da tabela abaixo, **redesenhar só as fileiras 1 e 2 (caminhada)**. As fileiras 3 a 6 (ataque de frente, ataque de costas, pulo e dash) ficam exatamente como estão.

- **Fileira 1 — andar de frente:** 4 quadros, **três quartos virado para a direita** (rosto e peito visíveis, corpo girado ~45° para a direita da tela), pernas alternando (contato → passagem → contato → passagem).
- **Fileira 2 — andar de costas:** 4 quadros, **três quartos de costas virado para a direita** (nuca e costas visíveis, girado ~45° para a direita).
- **Referência de pose e ângulo:** `public/assets/naruto-academia-walk-v1.png` (frente e costas) e `public/assets/shinobi-motion/kakashi-walk-v1.png`.
- **Mesmo arquivo e layout:** 1024 × 1536, 4 colunas × 6 fileiras de 256 × 256, fundo transparente. Mesma escala, paleta, contorno e ponto de apoio dos pés das outras fileiras da própria folha, para não pular ao trocar de andar para atacar.
- **Identidade de cada versão:** traje, armas e acessórios da forma (ex.: a espada Samehada do Kisame, a foice do Hidan, o chapéu do Hiruzen). Nunca usar sprites ou arte oficiais.
- **Registro:** prompts num JSON em `docs/` (como `docs/arte-elenco-rodada-53.json`).

## Folhas a corrigir (58)

| Versão (id) | Nome | Arquivo em `public/assets/shinobi-motion/` |
|---|---|---|
| hiruzen | Hiruzen Sarutobi Terceiro Hokage | `hiruzen-roster-v1.png` |
| raikage-terceiro | A Terceiro Raikage | `raikage-terceiro-roster-v1.png` |
| raikage-quarto | A Quarto Raikage | `raikage-quarto-roster-v1.png` |
| killer-b | Killer B Jinchūriki | `killer-b-roster-v1.png` |
| onoki | Ōnoki Terceiro Tsuchikage | `onoki-roster-v1.png` |
| ao | Ao Veterano da Névoa | `ao-roster-v1.png` |
| rasa | Rasa Quarto Kazekage | `rasa-roster-v1.png` |
| hanzo | Hanzō Salamandra | `hanzo-roster-v1.png` |
| mei | Mei Terumī Quinta Mizukage | `mei-roster-v1.png` |
| gengetsu | Gengetsu Hōzuki Segundo Mizukage | `gengetsu-roster-v1.png` |
| choji | Chōji Akimichi Genin | `choji-roster-v1.png` |
| kiba | Kiba Inuzuka Genin | `kiba-roster-v1.png` |
| shino | Shino Aburame Genin | `shino-roster-v1.png` |
| ino | Ino Yamanaka Genin | `ino-roster-v1.png` |
| kurenai | Kurenai Yūhi Jōnin | `kurenai-roster-v1.png` |
| iruka | Iruka Umino Chūnin | `iruka-roster-v1.png` |
| sai | Sai Time 7 | `sai-roster-v1.png` |
| yamato | Yamato Capitão do Time 7 | `yamato-roster-v1.png` |
| shisui | Shisui Uchiha Shunshin | `shisui-roster-v1.png` |
| obito | Obito Uchiha Genin | `obito-roster-v1.png` |
| hiashi | Hiashi Hyūga Chefe do Clã | `hiashi-roster-v1.png` |
| hanabi | Hanabi Hyūga Clássico | `hanabi-roster-v1.png` |
| kisame | Kisame Hoshigaki Akatsuki | `kisame-roster-v1.png` |
| zabuza | Zabuza Momochi Espadachim da Névoa | `zabuza-roster-v1.png` |
| suigetsu | Suigetsu Hōzuki Taka | `suigetsu-roster-v1.png` |
| mangetsu | Mangetsu Hōzuki Espadachim da Névoa | `mangetsu-roster-v1.png` |
| karin | Karin Uzumaki Taka | `karin-roster-v1.png` |
| nagato | Nagato Uzumaki Edo Tensei | `nagato-roster-v1.png` |
| sasori | Sasori Akatsuki | `sasori-roster-v1.png` |
| haku | Haku Caçador da Névoa | `haku-roster-v1.png` |
| chiriku | Chiriku Templo do Fogo | `chiriku-roster-v1.png` |
| sakumo | Sakumo Hatake Canino Branco | `sakumo-roster-v1.png` |
| deidara | Deidara Akatsuki | `deidara-roster-v1.png` |
| hidan | Hidan Akatsuki | `hidan-roster-v1.png` |
| kakuzu | Kakuzu Akatsuki | `kakuzu-roster-v1.png` |
| konan | Konan Akatsuki | `konan-roster-v1.png` |
| zetsu | Zetsu Akatsuki | `zetsu-roster-v1.png` |
| jugo | Jūgo Taka | `jugo-roster-v1.png` |
| kabuto | Kabuto Yakushi Clássico | `kabuto-roster-v1.png` |
| kimimaro | Kimimaro Clássico | `kimimaro-roster-v1.png` |
| jirobo | Jirōbō Quarteto do Som | `jirobo-roster-v1.png` |
| kidomaru | Kidōmaru Quarteto do Som | `kidomaru-roster-v1.png` |
| tayuya | Tayuya Quarteto do Som | `tayuya-roster-v1.png` |
| sakon-ukon | Sakon e Ukon Quarteto do Som | `sakon-ukon-roster-v1.png` |
| dosu | Dosu Kinuta Trio do Som | `dosu-roster-v1.png` |
| zaku | Zaku Abumi Trio do Som | `zaku-roster-v1.png` |
| kin | Kin Tsuchi Trio do Som | `kin-roster-v1.png` |
| juzo | Jūzō Biwa Akatsuki | `juzo-roster-v1.png` |
| naruto-hokage | Naruto Sétimo Hokage | `naruto-hokage-roster-v1.png` |
| kabuto-sabio | Kabuto Yakushi Sábio do Dragão | `kabuto-sabio-roster-v1.png` |
| orochimaru-akatsuki | Orochimaru Akatsuki | `orochimaru-akatsuki-roster-v1.png` |
| choji-guerra | Chōji Akimichi Quarta Guerra | `choji-guerra-roster-v1.png` |
| kiba-shippuden | Kiba Inuzuka Shippuden | `kiba-shippuden-roster-v1.png` |
| shino-shippuden | Shino Aburame Shippuden | `shino-shippuden-roster-v1.png` |
| ino-guerra | Ino Yamanaka Quarta Guerra | `ino-guerra-roster-v1.png` |
| tobi-akatsuki | Obito Uchiha Tobi · Akatsuki | `tobi-akatsuki-roster-v1.png` |
| obito-guerra | Obito Uchiha Máscara Branca | `obito-guerra-roster-v1.png` |
| hanabi-adulta | Hanabi Hyūga Adulta | `hanabi-adulta-roster-v1.png` |

## Como integrar e testar

1. Substituir o PNG no mesmo caminho; não precisa mexer em código (`directionalArt` → `expansionSheet` já aponta para o arquivo).
2. `TESTAR_JOGO.bat` (sem navegador).
3. `node scripts/audit-walk-sheets.mjs` lista a assimetria e o lado da silhueta de cada folha de caminhada; use para comparar antes e depois. É uma medida auxiliar: confira também olhando a folha.
4. Em jogo (o Codex pode usar o navegador; o Claude Code está sem navegador), andar com W, A, S, D e diagonais, com a câmera em 4 ângulos, ao lado de um personagem do grupo padrão (ex.: Kakashi). Os dois devem virar do mesmo jeito.
5. Registrar com a skill `documentar-projeto`.

## Nota para quem continuar (Codex, Qwen ou outro agente)

- A medição de `scripts/audit-walk-sheets.mjs` **não separa sozinha** os dois grupos: o movimento das pernas também deixa a silhueta assimétrica (Kisame, reto para a câmera, mediu perto do Kakashi, que está de três quartos). Use o script para comparar antes e depois de cada folha, mas a decisão é **visual**: abrir o PNG e comparar com `naruto-academia-walk-v1.png`.
- Conferência visual já feita pelo Claude Code em 14/11: Kisame, Hidan e Hiruzen (retos, fora do padrão); Kakashi e Naruto Academia (padrão). As demais 55 folhas `*-roster-v1.png` seguem o mesmo gerador da rodada 53/54 e devem ter o mesmo problema. Confirme ao abrir cada uma.
- Ordem sugerida: comece pelos personagens mais jogados (Kages e Akatsuki), um PNG por vez, testando em jogo ao lado do Kakashi.
