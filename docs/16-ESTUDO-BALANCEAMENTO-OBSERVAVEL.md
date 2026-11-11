# Estudo de balanceamento observável · 07/11/2026

## Estado e fontes

**CONFIRMADO:** o usuário quer uma experiência de crescimento próxima ao PokéBonk, aproveitando o balanceamento que já existe no ShinobiBonk. Este estudo mede e diagnostica; nenhum parâmetro de gameplay foi alterado.

O domínio enviado, [poke-bonk.com](https://poke-bonk.com/), se apresenta como guia independente que incorpora o jogo original de [pokebonk.com](https://pokebonk.com/). Sua página [sobre as fontes](https://poke-bonk.com/about/) distingue versões e registros observados. As páginas não comprovam fórmulas atuais de servidor. A inspeção estática local do aplicativo foi tratada separadamente, sem publicar seus arquivos ou código.

| Fonte | O que foi consultado | Limite |
|---|---|---|
| [Guia de combate](https://poke-bonk.com/combat-mechanics/) | Separação entre dano base, atributos, categoria, afinidade, crítico, status e DPS | Base declarada 0.6.3; não é medição nossa da versão atual |
| [Modos](https://poke-bonk.com/game-modes/) | Três zonas, guardiões, portal final e Final Swarm | Página mistura referências solo e co-op de datas diferentes |
| [Testes publicados](https://pokebonk-wiki.wiki/in-game-tests/) | Duas runs de conta nova em 0.7.7; dados observados por terceiros | Não é uma curva oficial nem ensaio controlado |
| Código do ShinobiBonk | progression.ts, enemyTiers.ts, missions.ts, combat.ts | Fonte primária dos nossos cálculos; não mede uma partida |
| Vídeo fornecido pelo usuário | Arquivo local encontrado, ~240 MB | Ainda não foram extraídas medições de frames nesta rodada |

**OBSERVAÇÃO DE TERCEIROS:** o relato em [Testes publicados](https://pokebonk-wiki.wiki/in-game-tests/) registra 2:04 / nível 7 / 108 abates / 8.338 de dano e 2:43 / nível 9 / 210 abates / cerca de 18,7 mil de dano. São referências de ritmo inicial, não metas universais: mudam personagem, escolhas, versão e progressão da conta.

**INFERÊNCIA:** dividir dano acumulado pelo tempo dessas duas runs dá aproximadamente 67 e 115 de dano/s de média da run. Isso inclui vários alvos e períodos sem combate; não pode dimensionar sozinho a vida de um chefe. O próprio [guia de combate](https://poke-bonk.com/combat-mechanics/) explica que dano base dividido por recarga omite modificadores e execução real.

## Linha de base reproduzível do ShinobiBonk

Executar: node scripts/snapshot-balance.mjs.
Saída: artifacts/balance-baseline.json.

Hipóteses: Naruto Academia; Genin; zona 1; sem itens, pílulas, passivas compradas, eventos ou ajustes de debug; permanece na mesma zona; Final Swarm depois de 600 s. O snapshot chama as funções do projeto. Não representa uma run medida.

| Nível | Dano base calculado | Multiplicador de nível | HP | Velocidade de ataque |
|---|---:|---:|---:|---:|
| 1 | 9,90 | 1,00× | 85 | 1,00× |
| 10 | 17,66 | 1,78× | 108 | 1,072× |
| 25 | 39,16 | 3,96× | 146 | 1,192× |
| 50 | 110,51 | 11,16× | 210 | 1,392× |
| 100 | 490,78 | 49,57× | 337 | 1,792× |
| 250 | 6.760,36 | 682,86× | 720 | 2,992× |
| 1.000 | 900.337,74 | 90.943,21× | 2.632 | 8,992× |

Esse dano é um atributo de entrada. Técnica, afixos, itens, categoria, crítico, afinidade e alvo ainda alteram o resultado.

| Minutos na zona 1 | HP comum | HP mega | HP guardião | Defesa guardião |
|---|---:|---:|---:|---:|
| 0 | 22 | 20.000 | 156 | 65,0% |
| 2 | 48 | 35.125 | 841 | 68,8% |
| 5 | 121 | 167.084 | 5.002 | 73,5% |
| 10 | 423 | 2.248.003 | 44.092 | 79,1% |
| 18 | 21.389 | 143.872.177 | 12.822.664 | 84,4% |
| 30 | 439.816 | 73.662.554.613 | 2.190.980.310 | 87,9% |

O valor de 0 min é resultado matemático; não significa que um mega nasce no segundo zero. A agenda de megas é sorteada separadamente. Transições de zona, eventos e dificuldade alteram esse cenário.

**DIAGNÓSTICO CALCULADO:** aos 5 minutos, HP efetivo aproximado contra dano sujeito somente à defesa é 365 mil para o mega e 18,9 mil para o guardião. O mega oferece cerca de 19 vezes a resistência nessa comparação. Validar a intenção dessa hierarquia e medir em combate antes de ajustar.

## Como comparar sem confundir grandeza com dificuldade

Registrar a cada 30–60 s: versão/dificuldade/zona/tempo, nível, XP, técnicas e afixos, itens, pílulas, atributos, Ryu, preço atual, abates acumulados, inimigos vivos, buffs/debuffs e evento ativo. Registrar HP do alvo e instante de cada acerto, invocação e morte de elite/mega/guardião/bijuu.

- DPS total contra a horda mede limpeza. DPS contra um alvo mede a capacidade de matar chefes.
- Se o DPS medido já é após defesa, usar tempo para matar ≈ HP / DPS medido. Não descontar defesa duas vezes.
- Em simulação de dano antes da defesa, HP efetivo ≈ HP / (1 − redução), somente quando esse modelo de redução se aplica.
- Chance crítica, proc de status, cadência, número de projéteis, área e tempo em alcance alteram DPS de formas diferentes.
- Um recorde de milhões de abates é acumulado; não equivale a milhões de inimigos simultâneos.

**PROPOSTO:** ensaios com conta nova e conta desenvolvida, mesmos personagens e mesma região/dificuldade. Medir abertura, 5/10/18 minutos e passagem de zona em mais de uma build. Só então comparar crescimento do jogador, pressão da horda e duração dos chefes. Não impor uma fórmula única a partir de duas runs ou de uma wiki antiga.

## Próximas medições

1. Medir nosso tempo até nível 2 e XP/abates por minuto sem debug.
2. Medir alvo comum, elite, mega e guardião com a mesma build; separar ajuda e Ultimate.
3. Extrair pontos do vídeo local com timestamps, identificando passivas e versão quando visíveis.
4. Comparar renda com custo de kunai, roleta e mercador; custo crescente deve continuar acessível pelo desempenho.
5. Verificar Sorte de abertura e evolução de raridade, mantendo os usos 3 → 10 e demais decisões do usuário.
6. Registrar qualquer proposta de mudança e validar sua consequência no início e no late game. As propostas antigas de docs/15 continuam históricas, não aprovadas automaticamente.

## Limites desta entrega

Nenhuma run do PokéBonk foi executada ou monitorada por nós nesta rodada. Não há acesso a logs internos, servidor, saves privados ou fórmulas secretas. Não foram copiados assets nem código do outro jogo ao produto. Apenas dados públicos citados e cálculos do nosso próprio código compõem este documento.
