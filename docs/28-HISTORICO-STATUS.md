# 28 · Histórico de status de personagens e monstros

Pedido do usuário (25/11/2026): "Crie um .md referente ao status de todos os personagens e monstros para termos um track das alterações e suas respectivas datas/builds".

- **Valores atuais:** [28-STATUS-PERSONAGENS-E-MONSTROS.md](28-STATUS-PERSONAGENS-E-MONSTROS.md), gerado pelo código (`node scripts/gen-status-doc.mjs`).
- **Este arquivo:** uma linha por mudança de status, com data e build (commit). Ao mudar um número de personagem ou monstro: rode o gerador, acrescente a linha aqui e faça commit dos dois juntos.

## 26/11/2026

| Build | O que mudou | Antes → agora |
|---|---|---|
| (este commit) | Degraus do Final Swarm | +50% vida, +30% dano, +2 pontos de defesa por degrau (até 95%) → o degrau k vale k vezes (+30 min: vida ×315, dano ×61, +42 pontos até 97%) |
| `3e1f14b` | Roleta da Tsunade | ×1,7 por giro + 15%/min + 25%/zona → +20% por giro, só |
| `3e1f14b` | Kunai/shuriken/pergaminho pago | ×1,5 por abertura + 15%/min → +20% por abertura, só |
| `173b290` | Guardião: empurrão e puxão | puxões o moviam 40% → Guardião, Bijū e Totem não se movem |
| `173b290` | Guardião: fúria | sem fúria → aos 70% da vida, +25% de dano e +30% de fechamento da defesa (uma vez) |
| `09ec2d5` | Kit do Nagato | Receptores de Chakra, Bansho Tenin, Chibaku Tensei, Invocação dos Caminhos → Kunai Tática, Chibaku Tensei, Bansho Tenin, Barras de Chakra (igual ao Pain) |
| `09ec2d5` | Ultimate do Nagato | Seis Caminhos do Rinnegan (explosão de poder 6) → Kuchiyose: Pein Rikudō (seis caminhos por 10 s, poder 7,4 espalhado, cura, absorção e recarga) |
| `fdd2597` | Sorte em Hagoromo, Ebisu e Iruka | sem efeito → qualidade 0 (Sorte ≤ 10) a 1 (Sorte 70): raridade do treino e das ferramentas, e ganho do Ebisu/lição do Iruka puxado ao máximo |
| `635981d` | Espaços de pílula | 6 → 5 tipos por run |
| `635981d` | Preço dos itens do Mercador | +35% por compra e +12% por roletada → só +35% por compra (roletar encarece só a roletada) |
| `230f28d` | Reposição da horda no Final Swarm | teto ÷ 4 s por segundo (tela ~400 com herói forte nas zonas 2 e 3) → repõe até o teto a cada quadro (até 120 por quadro) |
| `b474f9c` | Lamens do fim da run | nível 4/nível sem teto → 2/nível até 100 níveis; selados até 4; Bijū 180 → 60 por dificuldade e até 3 planos; vitória Kage ≈ 3 mil (a run de 76 min caiu de 56.031 para 3.038) |
| `342da25` | Susano'o no pool | Itachi ANBU, Shisui e Sasuke Shippuden só depois de selar outro usuário → no próprio pool (Nv 12) |
| `4fdd4a9` | Inimigos e construções | travavam na parede → contornam; nascem fora das construções |

## 25/11/2026

| Build | O que mudou | Antes → agora |
|---|---|---|
| `bae7eb6` | (base deste histórico) | — |
| `3b6b905` | Final Swarm ganha um degrau a cada 5 min | +50% de vida, +30% de dano e +2 pontos de defesa por degrau (defesa até 95%) |
| `7eb4b23` | Regeneração base de todo shinobi | 0 HP/s (108 de 115 versões) → 1,0 HP/s; passivas somam |
| `7eb4b23` | Elites no começo da partida | 8% desde o 1º segundo → 2% no início, 8% aos 1m30 |
| `2133eab` | Plano do Shikamaru | podia reforçar o Guardião já invocado → bloqueado depois da invocação |
| `532a29e` | Dano da horda (comuns e elites, kunai e fūma) | ×1 → ×0,7 |
| `532a29e` | Teto por golpe (horda e Mega Elite, inclusive a Ultimate) | sem teto → 40% da vida máxima; Guardião e Bijū sem teto |
| `e8e98f7` | Kit do Nagato | Shuriken e Kunai Tática → Bansho Tenin (Nv 5) e Chibaku Tensei (Nv 12) |
| `d9b4eea` | Bijū | incontrolável; atordoamento de 3 s na troca de fase; fúria +25% de dano por fase e +30% de armadura sobre o dano que passa |
| `c4732a5` | Planos do Shikamaru | +33% na zona inteira → +33% só no Guardião (e na Bijū) |
| `681c51d` | Raio das técnicas de Área | 1,2 → 1,8 (× ATTACK_SCALE × √área) |
| `9a6f16d` | Pacote de status | Katon sem cadeia; congela com 2 acúmulos (eram 3); Fio 8%, Incenso 5%, Hyoton 12%, Anel 12% (eram a metade) |
| `da369b2` | Gelo vira elemento | Haku, Domo de Gelo e Pergaminho Hyoton (+28% de Gelo) |
| `2a78fdd` | Espinhos | dano fixo → armadura × dano do personagem (Samurai 1,5×) |
| `ea83a19` | Guardiões e Bijū | piso de vida = 30 s (Guardião) e 60 s (Bijū) do dano atual do jogador, +33% por plano |
| `b1a392c` | Afixos de dano das técnicas e Final Swarm | afixos pela metade; Final Swarm entra com ×2 (era ×3) |
| `37a5986` | Bijū | 3× a armadura do Guardião e só os planos da última zona |
