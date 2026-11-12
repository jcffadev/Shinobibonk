# 21 · Elenco de heróis — roster, versões por era e fila de novos

> Criado em **12/11/2026** (rodada 36 — consolidação de contexto). Fonte da verdade: `src/game/heroes.ts` (+ `evolution.ts` para formas). O detalhe completo de cada kit (técnicas, passivas, bônus exatos) está no código; este documento é o **índice do elenco** + fila de personagens novos.

## Roster atual — 24 famílias · 32 versões · 56 versões jogáveis

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

## Fila de personagens novos (rodada 35, 12/11 — PROPOSTO, aguardando aprovação do usuário)

### Kages ausentes até o Shippuden — **conceito deve ser aprovado ANTES de criar** (pedido do usuário)

| Kage | Conceito-base (fiel à obra — a aprovar) |
|---|---|
| **Hiruzen Sarutobi** (3º Hokage) | Fogo: Katon: Goukakyu (projétil), Muro de Chamas (linha), Ultimate em área de fogo; passiva de líder |
| **Killer B** (6º Raikage) | Raio: Modos Super Mortais, Edokoro (investida), Ultimate em área; passiva de ritmo |
| **A** (5º Raikage) | Raio: Lightning Sheath (armadura que amplifica dano), Yellow Flash (dash-ataque), Ultimate: Lightning Beast |
| **Onoki** (2º Tsuchikage) | Pedra/Poeira: Pedra Voadora, Muro de Pedra, Ultimate: Tempestade de Poeira em área |
| **Ao** (2º Mizukage) | Água: projéteis, Muro de Água, Ultimate: Grande Dragão Aquático |
| **Rasa** (3º Kazekage) | Areia: Sand Coffin (prende), Muro de Areia, Ultimate: Coffin em área |
| **Naruto** (7º Hokage) | Rasengan, Modo Sábio, Ultimate: Rasenshuriken; passiva Kurama |

### Elenco clássico/Shippuden (Tier A) — com evolução por era (Academia → Shippuden → 4ª Guerra quando houver histórico)

**Choji · Kiba (+Akamaru) · Shino · Ino · Kurenai · Iruka · Sai · Yamato · Shisui · Obito · Hiashi · Hanabi · Kisame · Zabuza · Suigetsu · Mangetsu · Karin** (17).

Fora do Tier A: **Nagato** (nuance — o **Pain já existe** no roster); **Ebisu** e espadas menores (referência fraca na obra); Kages sem nome (sem identidade para kit).

### Impacto de validar a fila

`verify-rules` hoje espera **56 versões · 97 técnicas · 95 itens** — novos personagens mudam essas contagens (ajustar `scripts/verify-rules.mjs` na implementação). Arte: skill `criar-arte-shinobibonk` (identidade chibi 2.5D) + folhas via `movimentar-shinobi`.
