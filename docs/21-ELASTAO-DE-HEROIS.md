# 21 · Elenco de heróis — roster, versões por era e fila de novos

> Criado em **12/11/2026** (rodada 36 — consolidação de contexto). Fonte da verdade: `src/game/heroes.ts` (+ `evolution.ts` para formas). O detalhe completo de cada kit (técnicas, passivas, bônus exatos) está no código; este documento é o **índice do elenco** + fila de personagens novos.

## Rodada 53 · Expansão do elenco

**96 versões jogáveis de 56 famílias.** São 40 versões novas, 32 famílias a mais e Akamaru como companheiro do Kiba sem ocupar vaga de ajudante. As versões por era têm retrato, kit, passiva e missão próprios. O nível durante uma missão evolui os atributos da versão escolhida.

- **Kages e veteranos:** Hiruzen, A (Terceiro Raikage), A (Quarto Raikage), Killer B, Ōnoki, Ao, Rasa, Hanzō, Mei, Gengetsu e Naruto Sétimo Hokage. Killer B é jinchūriki, Ao é sensor de Kirigakure e Hanzō lidera Amegakure. Rasa é o Quarto Kazekage. A marionete do Terceiro Kazekage aparece no kit do Sasori.
- **Tier A:** Chōji, Kiba, Shino, Ino, Kurenai, Iruka, Sai, Yamato, Shisui, Obito, Hiashi, Hanabi, Kisame, Zabuza, Suigetsu, Mangetsu e Karin.
- **Outras versões e extras:** Tobi Akatsuki e Obito Máscara Branca compartilham a família Obito. Nagato Edo é separado de Pain (corpo de Yahiko). Entraram Sasori, Haku, Chiriku e Sakumo, além de Chōji e Ino da Guerra, Kiba e Shino Shippuden e Hanabi adulta.
- Ishikawa, Byakuren e Reto aparecem na obra. Suas propostas de kits foram retiradas por dependerem de golpes inventados para esta rodada. Os kits restantes ainda contêm adaptações de gameplay, sobretudo onde a obra mostra poucas técnicas. O mapa da Pedra recebe as missões da Nuvem enquanto Kumogakure não tiver mapa próprio.
- A fonte dos kits, passivas e missões é `src/game/rosterExpansion.ts`. As técnicas elementais compartilhadas do lote passam ao pool compatível a partir do nível 8. As técnicas exclusivas continuam sujeitas às regras de kit, afinidade e selamento. Iruka continua no evento da Academia, onde entra com afinidade máxima. Karin dá regeneração e coleta como ajudante.
- Folhas novas em `public/assets/shinobi-motion/*-roster-v1.png`. Fileiras 1–6: andar de frente, andar de costas, ataque de frente, ataque de costas, pulo e dash lateral espelhável. Repouso na primeira célula de ataque. Os demais shinobis mantêm as duplas direcionais registradas. [Prompts da arte](arte-elenco-rodada-53.json).

Referências: [Obito no site oficial](https://naruto-official.com/en/news/01_1706), [Espelhos de Gelo no episódio oficial](https://naruto-official.com/en/anime/naruto1/list/01_237), [Sasori e a marionete do Terceiro Kazekage](https://naruto-official.com/en/news/01_1308), [Gengetsu](https://naruto.fandom.com/wiki/Gengetsu_H%C5%8Dzuki) e [Rasa](https://naruto.fandom.com/wiki/Rasa).

## Elenco anterior à expansão — 56 versões jogáveis

| Família (base) | Título da base | Versões da era seguinte (passo · forma) |
|---|---|---|
| **Naruto** (Folha) | Academia | Genin (1·10) · Shippuden (2·25) · Kyuubi (3·50) |
| **Sasuke** (Uchiha) | Genin | Shippuden (1·15) · Rinnegan (2·30) |
| **Sakura** (Folha) | Genin | Shippuden (1·15) · Byakugou (2·30) |
| **Gaara** (Areia) | Genin | Kazekage (1·15) · Aliança (2·30) |
| **Madara** (Uchiha) | Armadura | Rinnegan (1·15) · Seis Caminhos (2·30) |
| **Hashirama** (Folha) | Hokage | Sábio (1·20) |
| **Kakashi** (Folha) | Jonin | Hokage (1·25) |
| **Itachi** (Uchiha) | ANBU | Akatsuki (1·15) |
| **Minato** (Folha) | Jonin | Hokage (1·15) |
| **Tsunade** (Folha) | Sannin | Hokage (1·15) · Byakugou (2·30) |
| **Jiraiya** (Folha) | Sannin | Sábio (1·20) |
| **Orochimaru** (Folha) | Sannin | Som (1·15) |
| **Rock Lee** (Folha) | Genin | Shippuden (1·15) · Portões (2·30) |
| **Neji** (Hyuga) | Genin | Jonin (1·15) |
| **Hinata** (Hyuga) | Genin | Shippuden (1·15) · Leões (2·30) |
| **Shikamaru** (Nara) | Genin | Estrategista (1·15) · Conselheiro (2·30) |
| **Temari** (Areia) | Genin | Shippuden (1·15) |
| **Tenten** (Folha) | Genin | Shippuden (1·15) |
| **Pain** (Chuva) | — (Nagato/Yahiko) | — |
| **Tobirama** (Folha) | — | — |
| **Kankuro** (Areia) | Genin | Shippuden (1·15) · Aliança (2·30) |
| **Might Guy** (Folha) | Jonin | Sexto Portão (1·15) · Sétimo Portão (2·30) |
| **Kushina** (Folha) | — (Uzumaki) | — |
| **Asuma** (Folha) | — | — |

Regras do elenco (CONFIRMADO, 06/11): cada shinobi tem **1–2 técnicas únicas**; o resto do kit vem da biblioteca compartilhada (`L`); versões só usam técnicas da **própria fase** (Narutopedia conferida); a versão seguinte se libera pela missão de selamento jogando com a anterior; Mega Elite/ajudante usa a versão do rank (Genin→inicial … Kage→última).

## Fila histórica de personagens novos

> **Rodada 38 (12/11):** fichas completas (versões, técnicas únicas, passivas, arte, efeitos) e a **revisão canônica** desta lista pela Narutopedia estão em [22-PROPOSTA-NOVOS-SHINOBIS.md](22-PROPOSTA-NOVOS-SHINOBIS.md) — divergências aguardando o usuário.
 (rodada 35, 12/11 — **APROVADO na rodada 37, 12/11/2026**)

### Kages ausentes até o Shippuden — **APROVADOS na rodada 37** (incluindo os primeiros Kages de cada vila)

| Kage | Conceito-base (fiel à obra — a aprovar) |
|---|---|
| **Hiruzen Sarutobi** (3º Hokage) | Fogo: Katon: Goukakyu (projétil), Muro de Chamas (linha), Ultimate em área de fogo; passiva de líder |
| **Killer B** (4º Raikage — correção de canon) | Raio: Modos Super Mortais, Edokoro (investida), Ultimate em área; passiva de ritmo |
| **A** (3º Raikage — correção de canon) | Raio: Lightning Sheath (armadura que amplifica dano), Yellow Flash (dash-ataque), Ultimate: Lightning Beast |
| **Onoki** (2º Tsuchikage) | Pedra/Poeira: Pedra Voadora, Muro de Pedra, Ultimate: Tempestade de Poeira em área |
| **Hanzo** (1º Tsuchikage — rodada 37) | Pedra/Chama: invocação de pedras, explosões; Ultimate em área; passiva de montanha (pesquisa NarutoWiki) |
| **Ao** (2º Mizukage) | Água: projéteis, Muro de Água, Ultimate: Grande Dragão Aquático |
| **Mei Terumi** (1ª Mizukage — rodada 37) | Água: projéteis, Muro de Água, Ultimate: Grande Dragão Aquático; passiva de líder da Névoa (pesquisa NarutoWiki) |
| **Rasa** (3º Kazekage) | Areia: Sand Coffin (prende), Muro de Areia, Ultimate: Coffin em área |
| **Naruto** (7º Hokage) | Rasengan, Modo Sábio, Ultimate: Rasenshuriken; passiva Kurama |

### Elenco clássico/Shippuden (Tier A) — **APROVADO na rodada 37** — com evolução por era (Academia → Shippuden → 4ª Guerra quando houver histórico)

**Choji · Kiba (+Akamaru) · Shino · Ino · Kurenai · Iruka · Sai · Yamato · Shisui · Obito · Hiashi · Hanabi · Kisame · Zabuza · Suigetsu · Mangetsu · Karin** (17).

**Rodada 37 — novos APROVADOS:** **Tobi ×2** (versão da Akatsuki + a outra versão — pesquisa NarutoWiki); **Nagato** (personagem **separado do Pain**: kit com **Tensei + Invocação dos Pain's + caminhos de Pain**); **Yahiko = o PAIN** (correção do usuário: "O Yahiko é o PAIN, o Nagato é outro personagem" — o Pain do roster é o corpo de Yahiko; kit com **barras de chakra + Tensei**, as habilidades que ele mostra na obra).

Fora do Tier A: **Ebisu** e espadas menores (referência fraca na obra); Kages sem nome (sem identidade para kit — 1º/2º Kazekage, 1º/2º Raikage).

### Impacto da implementação (fila APROVADA na rodada 37)

**≈ 29 novas versões** (7 Kages + Hanzo + Mei Terumi + 17 Tier A + 2 Tobi + 1 Nagato; Yahiko/Pain reusa o Pain existente no roster com kit atualizado — barras de chakra + Tensei) + evoluções por era quando houver histórico. `verify-rules` hoje espera **56 versões · 97 técnicas · 95 itens** — novos personagens mudam essas contagens (ajustar `scripts/verify-rules.mjs` a cada entrega). Arte: skill `criar-arte-shinobibonk` (identidade chibi 2.5D) + folhas de caminhada frente/costas via `movimentar-shinobi`.

## Rodada 52 · 12/11/2026 — áudio, preparação, selamento e arte

Pain (Yahiko como Caminho Deva) usa Shinra Tensei na Ultimate. Chibaku Tensei fica no kit comum. Sasuke Genin e as duas versões do Neji receberam novas folhas 4×4. A marionete de Sasori aparece na técnica Mil Braços do Escorpião, usada por versões de Kankuro. Referências consultadas: [site oficial Naruto](https://naruto-official.com/en/news/01_1321) e [Narutopedia, marionete do Terceiro Kazekage](https://naruto.fandom.com/wiki/Third_Kazekage_(puppet)).
