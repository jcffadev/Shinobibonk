---
name: simular-partida
description: Simular partidas inteiras do ShinobiBonk sem navegador (scripts/simulate-run.mjs e simulate-batch.mjs) para medir e calibrar balanceamento — nível, abates, ficha, minuto da morte e personagens fora da média.
metadata:
  short-description: Simulador de partidas para balanceamento
---

# Simular partidas (balanceamento sem navegador)

Pedido do usuário (15/11/2026): "Fazer um skill .md para todos os agentes usarem simulador de partida quando precisar".

## Quando usar

- **Antes de mexer** em números de balanceamento:
  - vida, dano ou armadura dos monstros;
  - nascimentos, teto de vivos, emboscadas ou Final Swarm;
  - curva de XP, Ryu ou kunais;
  - recarga ou poder de técnicas;
  - itens, pílulas ou bônus permanentes.
- **Depois da mudança:** para medir o efeito e comparar com a rodada anterior.
- **Quando o usuário perguntar** quanto tempo leva, em que nível chega, quantos abates faz, quando morre ou quais personagens estão fora da média.
- **Não substitui jogar.** O que só se confirma na tela segue como **PENDENTE DE VALIDAÇÃO E2E** (`docs/development/TESTING_POLICY.md`).

## Regra de navegador

O simulador roda só em Node, sem navegador. Ele não abre Edge, Chrome, Chromium nem Firefox, nem em modo headless. Pode ser usado mesmo com a restrição de navegador ativa. Nunca acrescente navegador a ele.

## Comandos

Node do projeto: `%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Rode um comando por vez, com timeout.

**Uma partida, com a linha do tempo a cada 5 min:**

```
node scripts/simulate-run.mjs <herói> <dificuldade> <minutos> <semente> <conta> <desvio>
node scripts/simulate-run.mjs naruto Kage 120 1 maximo medio
```

**Rodada em massa** (todos os personagens × Genin, Chunin, Jonin e Kage × sementes × contas nova e máxima):

```
node scripts/simulate-batch.mjs <rótulo> [minutos=120] [sementes=3] [desvio=medio]
node scripts/simulate-batch.mjs depois-do-ajuste 120 3 medio
```

A rodada completa (2.736 partidas) leva de 1 a 5 minutos.

**Em teste ou script:**

```js
import { simulateRun } from '../scripts/simulate-run.mjs';
simulateRun({ heroId, mission, minutes, seed, account, skill, record, policy, xpScale });
```

## Parâmetros

| Parâmetro | Valores | Efeito |
|---|---|---|
| herói | id do elenco (`naruto`, `madara-seis-caminhos`…) | personagem e técnicas |
| dificuldade | `Genin`, `Chunin`, `Jonin`, `Kage` | ameaça, vida do comum, abertura e Final Swarm |
| minutos | ex.: `30`, `120` | duração máxima simulada |
| semente | número inteiro | mesma semente dá o mesmo resultado |
| conta | `novo` ou `maximo` | sem passivas, ou com todas as Passivas Shinobi no máximo |
| desvio (`skill`) | `casual`, `medio`, `bom` | quanto o jogador desvia (`SKILL` → `pressureK`) |
| `record` | segundos | intervalo entre os pontos da linha do tempo |
| `policy` | `{ guardianAt, bossFightLimit, endless }` | quando invocar o Guardião, limite para lutar com chefes e se fica no Final Swarm da zona 3 |
| `xpScale` | número ou função do nível | só para explorar a curva de XP sem mexer no jogo |

**Desvio:** o acerto dos monstros depende de o jogador desviar ("A relação de acerto deve depender da inteligência e skill do jogador"). Por isso o desvio é um parâmetro. A evasão % entra à parte, como esquiva automática.

## O que o modelo cobre

Passo de 1 s com as **mesmas fórmulas do jogo**, importadas de `src/game`:
- ameaça (`zoneThreat`, `zoneCurse`, abertura, Final Swarm);
- vida e armadura dos monstros, com elites na proporção do jogo;
- XP (`xpDropValue`, `xpLoot`, `xpToLevelUp`) e Ryu;
- cartas de nível: técnicas com afixos (`rollGrowth`), pílulas e treinamento;
- kunais (`weaponPrice` + `rollItems`);
- Mega Elites (`rollMegaSchedule`, `megaEliteHp`) e Guardião (`guardianVitality`, `guardianDefense`);
- atributos (`calculateStats`) e recarga (`attackCooldown`);
- revives, regeneração, roubo de vida, cura por abate e bolinhos de arroz.

Horda: um disco em volta do jogador (`CROWD.density`). Cada forma de técnica acerta a fração do disco que a área dela cobre. Projétil acerta 1 alvo por tiro (+ricochete); linha, onda, Em V, cone, área e órbita acertam vários.

Bot: escolhe as cartas e os itens por uma nota fixa (`bonusScore`) e compra kunais sempre que pode.

## O que NÃO cobre

- **Motor 3D:** posição real, obstáculos, desvio de projéteis inimigos e caminho pelo mapa.
- **Fontes de dano e cura:** Ultimate, aliados e procs de item (raios, feixe, queimadura, veneno, gelo).
- **Eventos de mapa:** altares, Caça-Níquel, NPCs, Shikamaru, Orochimaru, clima, totem e bijuu.
- **Fusões e combinações de técnicas.**

Por isso o resultado é **forma da curva e comparação entre versões**, não um número exato da partida real. Ao relatar, diga isso.

## Saída

- **Uma partida:** console, com zona, nível, abates, vivos, abates/s, vida do comum, golpe da 1ª técnica, dano %, velocidade, área, projéteis, HP e itens.
- **Rodada em massa:**
  - console com o resumo por conta e dificuldade (minuto da morte p10/mediana/p90, abates, nível, 1º minuto, ficha) e os personagens fora da média (menos de 50% ou mais de 150% da mediana);
  - arquivo `artifacts/simulate-<rótulo>.json`, **não versionado**. Não faça commit dele, como `artifacts/rules-checks.json`.

## Procedimento

1. Rode a base **antes** da mudança: `node scripts/simulate-batch.mjs antes-<assunto>`.
2. Faça a mudança no código do jogo (`src/game/...`). O simulador lê dali. Nunca copie números para dentro dele.
3. Rode de novo com outro rótulo e compare os resumos.
4. Se uma regra nova tiver variável própria (ex.: `AMBUSH_RULES`), importe-a no simulador para ele seguir o jogo.
5. Registre o resultado como medição de modelo, não como validação, conforme `skills/documentar-projeto/SKILL.md`. Os testes do simulador ficam em `tests/balanceamento.test.mjs`.
6. Material do jogo de referência usado como meta segue `skills/referencia-externa/SKILL.md`: só a forma, nunca nome nem valor copiado.
