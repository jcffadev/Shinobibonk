# Kekkei Genkai e naturezas — decisões e pendências

Registro de 15/11/2026, rodadas 71 e 72. Serve para revisar depois ou implementar se for preciso. A fonte canônica é a Narutopedia.

## 1. Como funciona hoje (implementado na rodada 71)

**Onde fica cada parte:**
- regras puras: `src/game/techniqueMerge.ts`;
- naturezas do pool: `allowedElements` em `src/game/heroes.ts`;
- testes: `tests/fusoes.test.mjs` e `tests/jutsus.test.mjs`.

**Fundir** (Oficina dos Sapos, 1 uso por zona):
- Junta duas técnicas de ataque aprendidas numa técnica nova, do Nv 1 ao Nv 7.
- O dano é a soma das duas, e os efeitos se somam.
- Se forem **dois Ninjutsus de naturezas que formam uma Kekkei Genkai**, a fusão vira a técnica especial da tabela abaixo.
  - Vale para **qualquer personagem** que tenha as duas naturezas no pool.
- **+15% de dano** (`FUSION_KEKKEI_BONUS`) em dois casos:
  - fusão de duas técnicas da mesma natureza (Neutro não conta);
  - fusão da Kekkei Genkai da **própria linhagem** (`HERO_KEKKEI`).

**Combinar:**
- As duas técnicas atacam juntas no mesmo espaço, cada uma com ×1,5.
- Ganha mais **um atributo do par**: +10% de dano, +15% de alcance, −10% de recarga ou +5 pontos de status.
  - O status só entra no sorteio se uma das técnicas aplica status.
  - O sorteio é fixo por par, então o planejador mostra o mesmo atributo que a Oficina dá.

**Bloqueio:** uma fusão ou combinação nunca entra em outra fusão, nem com uma técnica comum (`isMergedName`). Pedido do usuário: "Não deve ser possível unir 2 fusões, ou fusão + skill."

### Receitas (8)

| Kekkei Genkai | Naturezas | Forma e efeito |
|---|---|---|
| Hyōton: Domo de Gelo | Água + Vento | Área, 55% de congelar |
| Mokuton: Nascimento da Floresta | Terra + Água | Área, 45% de paralisar |
| Yōton: Torrente de Lava | Fogo + Terra | Onda, queima e 24% de lentidão |
| Futton: Névoa Corrosiva | Água + Fogo | Área com veneno |
| Ranton: Circo Laser | Raio + Água | Em V, 40% de paralisar |
| Shakuton: Morte por Evaporação | Fogo + Vento | Órbita com queimadura |
| Jiton: Areia Magnética | Vento + Terra | Onda, 40% de lentidão |
| Bakuton: Argila Explosiva | Terra + Raio | Área com queimadura e 30% de atordoar |

### Linhagens (bônus de +15% e naturezas garantidas no pool)

Todas foram conferidas na Narutopedia em 15/11/2026 (propriedade "Kekkei Genkai" de cada página):

| Família | Kekkei Genkai na obra | No jogo |
|---|---|---|
| haku | Ice Release | Hyōton |
| hashirama, yamato | Wood Release | Mokuton |
| madara | Wood Release, Storm Release, além dos dōjutsu | Mokuton |
| obito | Wood Release, além dos dōjutsu | Mokuton |
| mei | Lava Release, Boil Release | Yōton, Futton |
| rasa | Magnet Release | Jiton |
| deidara | Explosion Release | Bakuton |

- As naturezas da Kekkei Genkai da linhagem entram em `allowedElements`. Exemplo: Haku recebe Água e Vento, Obito recebe Terra e Água.
  - Isso não cria natureza fora da obra: a Kekkei Genkai **é** a mistura dessas duas naturezas.
- **Gaara ficou fora.** O jogo já converte o Jiton dele em Areia (comentário de `HERO_NATURES`). A regra de elemento base de 06/11 também impede que ele aprenda Vento (`scripts/verify-rules.mjs`).

## 2. Decisões do usuário em vigor

1. **06/11/2026, regra de elemento base:** o pool só dá Neutro, o elemento base (afinidade), os elementos do próprio kit e Sábio para usuários do Modo Sábio.
   - Exemplo: o Naruto só tem Vento, porque todas as naturezas viriam do Modo dos Seis Caminhos, que o jogo não tem.
2. **15/11/2026:** "Se ele não tem natureza, igual no anime/obra/mangá, wiki não liberar." **Natureza fora da obra nunca entra no pool.**
   - Auditoria do mesmo dia: nenhuma das 25 famílias com dado canônico (`HERO_NATURES`) tem natureza liberada fora da obra.
3. **15/11/2026:** as fusões e Kekkei Genkai devem funcionar para **todos** que tenham 2+ naturezas. Um teste percorre todos os personagens.

## 3. Pendente de decisão: liberar as naturezas da obra no pool?

**Hoje:** só 18 das 72 famílias têm 2+ naturezas no pool. Exemplos:

| Personagem | Na obra | No jogo |
|---|---|---|
| Kakashi | Raio, Terra, Água, Fogo, Vento | Raio, Água, Terra |
| Itachi | Fogo, Água, Vento | só Fogo |
| Sasuke | 5 naturezas | Raio, Fogo |
| Naruto | 5 naturezas (via Seis Caminhos) | só Vento |

**Opções:**
- **A. Manter.** Cada personagem fica com a identidade do kit. As Kekkei Genkai ficam com quem tem as naturezas no kit ou a linhagem. É o estado atual.
- **B. Liberar todas as naturezas da obra.** Quase todos fundem Kekkei Genkai. Em troca:
  - derruba a regra de 06/11 (o Naruto passaria a aprender Katon);
  - aumenta o pool, o que dilui os sorteios de level-up.
- **C. Liberar só para fundir.** O pool de level-up continua igual. O Ninjutsu básico da segunda natureza canônica entra só quando o jogador planeja uma fusão de Kekkei Genkai.
- Em qualquer opção, **natureza fora da obra nunca entra**, pela decisão 2.

**Antes de B ou C, é preciso:**
- **Dados das naturezas de 48 famílias.** Hoje não existem. A consulta semântica da wiki (`action=ask`) não devolve a propriedade "Nature type", então será preciso ler a página de cada personagem.
  - Famílias sem dado: hiruzen, raikage-terceiro, raikage-quarto, killer-b, onoki, ao, rasa, hanzo, mei, gengetsu, choji, kiba, shino, ino, kurenai, iruka, sai, yamato, shisui, obito, hiashi, hanabi, kisame, zabuza, suigetsu, mangetsu, karin, nagato, sasori, haku, chiriku, sakumo, deidara, hidan, kakuzu, konan, zetsu, jugo, kabuto, kimimaro, jirobo, kidomaru, tayuya, sakon-ukon, dosu, zaku, kin, juzo.
- **Decidir o que conta como "da obra"**: as naturezas obtidas só com Seis Caminhos, Rinnegan ou células implantadas contam? A decisão de 06/11 diz que não, no caso do Naruto.

## 4. Candidatos anotados (não implementados)

- **Madara com Ranton** (Storm Release, confirmado na wiki): exige Raio + Água, e hoje o Madara não tem Raio no pool.
- **Kekkei Genkai de três naturezas** (Jinton do Ōnoki e do Mū: Fogo + Vento + Terra). O sistema funde só duas técnicas, então ficariam de fora.
- **Kekkei Genkai sem natureza** (Shikotsumyaku do Kimimaro, dōjutsu): não são fusão elementais e seguem como técnicas do kit.
- Os números (+15%, atributos do Combinar, chances das receitas) estão marcados como **proposta** para o usuário ajustar depois de testar.

## 5. Validação

- **PASSOU** por código: `tests/fusoes.test.mjs` (8 testes), 5 mutações acusadas e 125/125 na rodada 71.
- **PENDENTE DE VALIDAÇÃO E2E:** Oficina dos Sapos, cartas do planejador e efeito visual do Jiton e do Bakuton na partida.
