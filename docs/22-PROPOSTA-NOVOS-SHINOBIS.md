# Proposta — novos shinobis (Kages + elenco clássico/Shippuden)

> Rodada 53: propostas deste documento são históricas. As entradas implementadas e a revisão dos cargos estão no [elenco atual](21-ELASTAO-DE-HEROIS.md).

> **Revisão canônica (rodada 38):** a lista aprovada na rodada 37 (docs/13 e docs/21) diverge da Narutopedia — Killer B não foi Raikage (o 4º Raikage é A); Hanzō não foi Tsuchikage (líder da Chuva; 1º = Ishikawa); Mei é a 5ª Mizukage; Ōnoki é o 3º Tsuchikage (2º = Mū); Rasa é o 4º Kazekage; Ao não foi Mizukage (2º = Gengetsu). As fichas abaixo seguem a Narutopedia; o usuário decide.
>
> **Estado: PROPOSTO — aguardando validação do usuário. Nada foi implementado.** Nenhum código, arte ou arquivo existente foi alterado nesta rodada; este é o único arquivo criado.
> Pedido do usuário (12/11/2026): "Crie todos os kages que estão faltando até o arco do Shippuden… me envie antes para eu validar se o conceito/escopo está bom… Crie os personagens que estão faltando do naruto clássico e naruto Shipudden… com suas respectivas evoluções desde a academia… habilidades únicas, passivas únicas… Me liste os personagens que vai criar."
>
> **Convenções deste documento**
> - **CONFIRMADO** = fato de lore conferido na Narutopedia (link na ficha). As naturezas, Kekkei Genkai, afiliações e estreias foram lidas na infobox de cada página (`Infobox:<Nome>`) e as técnicas na seção *Abilities* da página principal, consultadas pela API pública da wiki em 12/11/2026.
> - **PROPOSTO** = tudo que é regra de jogo: versões, níveis de forma, atributos, passivas, buffs, missões, guardiões, formas (Projétil/Cone…), nomes de Ultimate.
> - **PERGUNTA** = decisão que só o usuário pode tomar (lista final na §8).
> - Formato do jogo, conforme o código atual: `h(id, nome, vila, cor, hp, dano, armadura, velocidade, passiva, bônus, [4 técnicas], Ultimate, build)` em `src/game/heroes.ts`; técnicas nos slots 1–4 liberam nos níveis 1/5/12/20; a versão seguinte usa `version(família, id, título, forma, passo, …)` (+12% HP/dano, +1 armadura e +0,08 de movimento por passo). Únicas = `U`, compartilhadas = `L`.
> - Regra de Técnicas (AGENTS.md): 1–2 ÚNICAS por versão; o resto vem de `L`; aprende Neutro + elemento BASE + elementos do kit (+ Sábio para usuários do Modo Sábio); elemento BASE dá ×1,5 (`NATURE_BONUS`).
> - Nenhum nome do jogo de referência aparece aqui (regra dura do projeto).

---

## 1. Elenco atual (lido do código, não da memória)

**24 famílias · 56 versões** (`HEROES` + `HERO_VERSIONS` em `src/game/heroes.ts`; formas em `src/game/evolution.ts`):

| Família | Versões (id · forma) | Vila (campo `village`) |
|---|---|---|
| Naruto | `naruto` Academia 1 · `naruto-genin` 10 · `naruto-shippuden` 25 · `naruto-kyuubi` 50 | Folha |
| Gaara | `gaara` Genin 1 · `gaara-kazekage` 15 · `gaara-alianca` 30 | Areia |
| Madara | `madara` Armadura 1 · `madara-rinnegan` 15 · `madara-seis-caminhos` 30 | Folha (Clã Uchiha) |
| Hashirama | `hashirama` Hokage 1 · `hashirama-sabio` 20 | Folha |
| Sasuke | `sasuke` Genin 1 · `sasuke-shippuden` 15 · `sasuke-rinnegan` 30 | Folha (Clã Uchiha) |
| Sakura | `sakura` Genin 1 · `sakura-shippuden` 15 · `sakura-byakugou` 30 | Folha |
| Kakashi | `kakashi` Jonin 1 · `kakashi-hokage` 25 | Folha |
| Itachi | `itachi` ANBU 1 · `itachi-akatsuki` 15 | Folha (Clã Uchiha) |
| Minato | `minato` Jonin 1 · `minato-hokage` 15 | Folha |
| Tsunade | `tsunade` Sannin 1 · `tsunade-hokage` 15 · `tsunade-byakugou` 30 | Folha |
| Jiraiya | `jiraiya` Sannin 1 · `jiraiya-sabio` 20 | Folha |
| Orochimaru | `orochimaru` Sannin 1 · `orochimaru-som` 15 | Folha / Som |
| Rock Lee | `lee` Genin 1 · `lee-shippuden` 15 · `lee-portoes` 30 | Folha |
| Neji | `neji` Genin 1 · `neji-jonin` 15 | Folha (Clã Hyuga) |
| Hinata | `hinata` Genin 1 · `hinata-shippuden` 15 · `hinata-leoes` 30 | Folha (Clã Hyuga) |
| Shikamaru | `shikamaru` Genin 1 · `shikamaru-estrategista` 15 · `shikamaru-conselheiro` 30 | Folha (Clã Nara) |
| Temari | `temari` Genin 1 · `temari-shippuden` 15 | Areia |
| Tenten | `tenten` Genin 1 · `tenten-shippuden` 15 | Folha |
| Kankuro | `kankuro` Genin 1 · `kankuro-shippuden` 15 · `kankuro-alianca` 30 | Areia |
| Might Guy | `guy` Jonin 1 · `guy-sexto-portao` 15 · `guy-setimo-portao` 30 | Folha |
| Pain · Tobirama · Kushina · Asuma | 1 versão cada (`pain`, `tobirama`, `kushina`, `asuma`) | Chuva · Folha · Folha · Folha |

**O que já existe fora do elenco jogável (para não duplicar):**
- **NPCs** (`src/game/npcs.ts`, não entram em `HEROES`): Iruka Umino (evento + ajudante NPC, `NPC_ALLIES.iruka`), Ebisu (evento de trocas), Teuchi (Ichiraku), Fukasaku e Shima (oficina dos Sapos Sábios). Eventos com nome de personagem: Maldição de Orochimaru, Bênção de Tsunade, Sharingan de Kakashi.
- **Orochimaru — esclarecimento:** ele é **as duas coisas** no código. É família jogável (`orochimaru`, `orochimaru-som`) **e** dá nome ao evento-NPC "Maldição de Orochimaru" (pacto de risco). A invariante "Orochimaru é NPC" do AGENTS.md vem da decisão antiga de que o pacto dele é **NPC/evento e não item**; não proíbe a família jogável. Nada muda nesta proposta.
- **Bijū** (`src/game/bijuu.ts`, chefes finais): Shukaku, Matatabi, Isobu, Son Gokū, Kokuō, Saiken, Chōmei, Gyūki, Kurama. Logo, os jinchūriki (Yugito, Yagura, Rōshi, Han, Utakata, Fū, Killer B) ainda **não** existem como shinobi — só as feras.
- **Itens com nome de personagem**: "Espelho de Gelo de Haku" (lendário, congela ao ser atingido) e "Pergaminho Hyoton" (`src/game/catalog.ts`). Haku jogável precisa conviver com eles (ver §5).
- **Planejados e não implementados** (docs/05): Shisui (NPC de pílulas), Kabuto (tema Edo Tensei).
- **Ids "reservados"** em `ORGANIZATIONS` (heroes.ts) que ainda não existem: `kisame, deidara, sasori, hidan, kakuzu, konan, obito, zetsu, suigetsu, jugo, karin, hiruzen, sai, yamato, shisui, hiashi, hanabi, ino, choji, kiba, shino, kurenai, zabuza, mangetsu, chojuro, kushimaru, jinpachi, fuguki, jinin, ameyuri, nagato`. Esta proposta usa esses mesmos ids. Atenção: `nagato` aparece na org Uzumaki **além** de `pain` (que já representa Nagato) — risco de duplicar (ver PERGUNTA 11).
- **Sinergias de vila sem membros hoje**: `VILLAGE_COMBOS` (synergy.ts) já define Nuvem, Névoa, Pedra, Cachoeira e Grama, mas nenhum jogável pertence a elas. Os Kages novos **ativam** Nuvem, Névoa e Pedra pela primeira vez.
- **Mapas** (`src/game/maps.ts`): `folha`, `areia`, `pedra`, `nevoa`. **Não existe Vila da Nuvem** (sinalizado em §6/§8).

---

## 2. Kages até o fim de Naruto Shippuden — conferência na Narutopedia

Fontes: [Kage](https://naruto.fandom.com/wiki/Kage), [Hokage](https://naruto.fandom.com/wiki/Hokage), [Kazekage](https://naruto.fandom.com/wiki/Kazekage), [Mizukage](https://naruto.fandom.com/wiki/Mizukage), [Raikage](https://naruto.fandom.com/wiki/Raikage), [Tsuchikage](https://naruto.fandom.com/wiki/Tsuchikage) e a página de cada um (abaixo).

### 2.1 Tabela de conferência

| Vila | Kage | Situação no jogo | Material de combate no anime/mangá (CONFIRMADO) | Recomendação |
|---|---|---|---|---|
| Folha | 1º Hashirama Senju | ✔ existe | — | — |
| Folha | 2º Tobirama Senju | ✔ existe | — | (fase Edo Tensei fica para depois) |
| Folha | 3º **Hiruzen Sarutobi** | falta | **Muito**: Invasão de Konoha (vs Orochimaru, Enma, Shuriken Kage Bunshin, Katon/Doton/Suiton), Edo Tensei na guerra (Formação dos Quatro Vermelhos Yang, Combinação das Cinco Liberações). [Hiruzen](https://naruto.fandom.com/wiki/Hiruzen_Sarutobi) | **Jogável (2 versões)** |
| Folha | 4º Minato · 5ª Tsunade · 6º Kakashi | ✔ existem (Kakashi Hokage como versão) | — | — |
| Folha | **Danzō Shimura** | falta | **Bom**: Cúpula dos Cinco Kage (vs Sasuke): Fūton de vácuo, Mokuton, Izanagi, Baku. Infobox: "Candidate Sixth Hokage" — **não foi Kage oficial**; a página Hokage o lista em "Candidates". [Danzō](https://naruto.fandom.com/wiki/Danz%C5%8D_Shimura) | **Jogável como personagem (não Kage)** |
| Areia | 1º **Reto** | falta | **Nenhum**: "Abilities" só diz que unificou os shinobi do deserto. Estreia: cap. 648 / ep. 369 (1ª Cúpula). [Reto](https://naruto.fandom.com/wiki/Reto) | **Pouco material — adiar ou NPC/retrato** |
| Areia | 2º **Shamon** | falta | **Quase nenhum**: usava marionetes com fios de chakra; pesquisou jinchūriki. Estreia: cap. 648 / ep. 382. [Shamon](https://naruto.fandom.com/wiki/Shamon) | **Pouco material — adiar ou NPC/retrato** |
| Areia | 3º **Kazekage** (sem nome) | falta | **Médio-baixo**: Areia de Ferro (Jiton). Luta quase só como **marionete humana de Sasori** (Shippuden, resgate do Gaara). Reanimado por Orochimaru contra Sasori só no anime (estreia anime ep. 457 / mangá 690 em flashback). [Third Kazekage](https://naruto.fandom.com/wiki/Third_Kazekage) | **Guardião/NPC + técnica da marionete do Sasori** (PERGUNTA 2) |
| Areia | 4º **Rasa** | falta | **Bom**: Pó de Ouro (Sepultamento Imperial, Muralha de Pó de Ouro Aéreo, Terceiro Olho) — Edo Tensei vs Gaara na guerra. [Rasa](https://naruto.fandom.com/wiki/Rasa) | **Jogável (1 versão)** |
| Areia | 5º Gaara | ✔ existe | — | — |
| Névoa | 1º **Byakuren** | falta | **Nenhum** ("legendary shinobi who excelled in worldly wisdom"). Estreia cap. 648 / ep. 369. [Byakuren](https://naruto.fandom.com/wiki/Byakuren) | **Pouco material — adiar ou NPC/retrato** |
| Névoa | 2º **Gengetsu Hōzuki** | falta | **Médio-bom**: Edo Tensei na guerra (Hidrificação, Pistola d'Água, Tirania do Vapor, miragem da Ostra Gigante). [Gengetsu](https://naruto.fandom.com/wiki/Gengetsu_H%C5%8Dzuki) | **Jogável (1 versão)** |
| Névoa | 3º **Mizukage** (sem nome) | falta | **Nenhum**: só aparece como guarda-costas do 1º na 1ª Cúpula (cap. 648 / ep. 382); habilidades "mostly unknown", kenjutsu só inferido. **Não foi reanimado** — os Mizukage do Edo Tensei/guerra foram o 2º (Gengetsu) e o 4º (Yagura, como Caminho de Pain do Tobi). [Third Mizukage](https://naruto.fandom.com/wiki/Third_Mizukage) | **Pouco material — adiar ou NPC/retrato** |
| Névoa | 4º **Yagura Karatachi** | falta | **Médio**: Espelho d'Água com o Bastão-Garra, jinchūriki perfeito do Isobu (Versão 2, Bijūdama). Parte do material é **só anime** (vento, luta vs Itachi/Jūzō). Tobi era o "Mizukage de fato". [Yagura](https://naruto.fandom.com/wiki/Yagura_Karatachi) | **Jogável (1 versão)** |
| Névoa | 5ª **Mei Terumī** | falta | **Bom**: Cúpula (vs Sasuke) e guerra (vs Madara): Lava (Yōton), Vapor (Futton), Suiton. [Mei](https://naruto.fandom.com/wiki/Mei_Terum%C4%AB) | **Jogável (2 versões)** |
| Pedra | 1º **Ishikawa** | falta | **Quase nenhum**: voo pela Rocha Leve; ninjutsu de abelhas só "aludido" no anime (clã Kamizuru = só anime). [Ishikawa](https://naruto.fandom.com/wiki/Ishikawa) | **Pouco material — adiar ou NPC/retrato** |
| Pedra | 2º **Mū** | falta | **Médio-bom**: Edo Tensei — Jinton, Fissão, Camuflagem sem Poeira (invisível), Rocha Leve. [Mū](https://naruto.fandom.com/wiki/M%C5%AB) | **Jogável (1 versão)** |
| Pedra | 3º **Ōnoki** | falta | **Muito**: Cúpula (Jinton vs Sasuke), guerra (Golem, Rocha de Peso Adicional, vs Madara). [Ōnoki](https://naruto.fandom.com/wiki/%C5%8Cnoki) | **Jogável (2 versões)** |
| Nuvem | 1º **A** | falta | **Nenhum** de combate (só política na 1ª Cúpula). [A (First Raikage)](https://naruto.fandom.com/wiki/A_(First_Raikage)) | **Pouco material — adiar ou NPC/retrato** |
| Nuvem | 2º **A** | falta | **Nenhum** ("not much is known about his abilities"); aparece em flashback (cap. 527 / ep. 269). [A (Second Raikage)](https://naruto.fandom.com/wiki/A_(Second_Raikage)) | **Pouco material — adiar ou NPC/retrato** |
| Nuvem | 3º **A** | falta | **Bom**: Edo Tensei — Lança do Inferno (Jigokuzuki), Relâmpago Negro, Armadura de Raio, "escudo mais forte". [A (Third Raikage)](https://naruto.fandom.com/wiki/A_(Third_Raikage)) | **Jogável (1 versão)** |
| Nuvem | 4º **A** (Raikage) | falta | **Muito**: Cúpula (vs Sasuke) e guerra (vs Madara): Laço Relâmpago, Bomba Liger, Guilhotina, Armadura de Raio. [A (Fourth Raikage)](https://naruto.fandom.com/wiki/A_(Fourth_Raikage)) | **Jogável (2 versões)** |
| Nuvem | **Killer B** | falta | **Muito** (jinchūriki do Gyūki, **não Kage**): vs Taka, guerra. Infobox: "Guardian of Kumogakure". [Killer B](https://naruto.fandom.com/wiki/Killer_B) | **Jogável (2 versões)**, na onda dos Kages por ser a dupla A–B |

### 2.2 Correções na lista recebida (CONFIRMADO)
1. **3º Mizukage**: não tem nome e **não foi usado no Edo Tensei**. Os Mizukage reanimados por Kabuto foram o 2º (Gengetsu); Yagura voltou como um dos Seis Caminhos de Pain do Tobi. Os quatro Kages reanimados por Kabuto: **2º Mizukage, 2º Tsuchikage, 3º Raikage e 4º Kazekage** ([Mū](https://naruto.fandom.com/wiki/M%C5%AB)).
2. **3º Kazekage**: também **não tem nome** (a lista tratava como nome próprio; está certo só como título). Luta quase só como marionete de Sasori.
3. **Ordem dos fundadores (anime ep. 369)**: Hokage (1º), Raikage (2º), Tsuchikage (3º), Mizukage (4º), Kazekage (5º, o último). Divergência registrada pela própria wiki: o **3º databook troca o 1º e o 2º Kazekage** (Reto/Shamon) — usamos a ordem da wiki (Reto 1º, Shamon 2º).
4. **4º Mizukage "de fato"**: a página Mizukage registra Obito/Tobi como o Mizukage real (Yagura controlado por genjutsu).
5. **Danzō**: "Candidate Sixth Hokage" — candidato nomeado pelo daimyō, **nunca empossado** (a página Hokage o lista em "Candidates"). Entra como personagem, não como Kage.
6. **Kages pós-Shippuden**: Darui (5º Raikage), Kurotsuchi (4ª Tsuchikage) e Chōjūrō (6º Mizukage) só assumem **depois** da guerra; no Shippuden são Jōnin. Ficam como personagens comuns (Onda 3), sem versão Kage nesta rodada.
7. **Killer B não é Kage** — é jinchūriki e "Guardião de Kumogakure"; foi tratado à parte, junto do 4º Raikage.
8. **Yagura**: as naturezas Vento e o clã Karatachi são **só anime** (marcado na infobox).
9. **Ishikawa**: clã Kamizuru e ninjutsu de abelhas são **só anime**.
10. Contagem total de títulos (para referência): Hokage 7, Kazekage 5, Mizukage 6, Raikage 5, Tsuchikage 4.

---

## 3. Personagens não-Kage que faltam (clássico + Shippuden)

Levantamento feito nas infoboxes (estreia mangá/anime, rank por parte, naturezas). Proposta priorizada em ondas (PROPOSTO):

| Onda | Personagens | Critério |
|---|---|---|
| **K (Kages)** | Hiruzen, Rasa, Mei, Ōnoki, A (4º Raikage), A (3º Raikage), Mū, Gengetsu, Yagura + Killer B e Danzō | Pedido principal do usuário; ativa as sinergias Névoa/Pedra/Nuvem |
| **1** | Kiba (+Akamaru), Shino, Ino, Chōji, Sai, Yamato, Zabuza, Haku | Fecham Time 8, Ino-Shika-Chō, Time 7 (Kakashi) e o arco do País das Ondas; têm Parte I + Shippuden ("desde a academia") |
| **2** | Akatsuki: Deidara, Sasori, Kisame, Hidan, Kakuzu, Konan, Obito; Kabuto; Kimimaro | Antagonistas centrais; muitas técnicas próprias |
| **3** | Taka (Suigetsu, Karin, Jūgo), Konohamaru, Kurenai, Anko, Shizune, Chiyo, Darui, Kurotsuchi, Chōjūrō | Elenco de apoio com material suficiente |
| **4 (NPC/guardião/opcional)** | Quatro do Som (Jirōbō, Kidōmaru, Sakon e Ukon, Tayuya), jinchūriki (Yugito, Rōshi, Han, Utakata, Fū), Mifune, Hanzō, Kinkaku/Ginkaku, espadachins (Mangetsu etc.), Ao, Shisui, Zetsu, 3º Kazekage, Kages sem material | Pouco tempo de luta, papel de chefe/evento, ou já planejados como NPC |

**Já existem e ficam como estão:** Iruka e Ebisu (NPCs — recomendo manter NPC; PERGUNTA 12), Kushina e Asuma (jogáveis), Pain (Nagato), as nove bijū, Orochimaru.
**Zetsu Branco** cabe melhor como **tipo de inimigo de horda** (exército de Zetsu Branco na guerra) do que como jogável — PROPOSTO.

---

## 4. Fichas completas — Onda K (Kages + Killer B + Danzō)

> Atributos = parâmetros de `h()` (HP · dano bruto antes do ×0,55 · armadura · velocidade); crítico 5% e regen 0 vêm fixos de `h()`. Valores **PROPOSTOS**, sempre comparados a um jogável existente. "Forma" = nível de forma em `evolution.ts`. Técnicas com `U.` = única nova; `L.` = chave real da biblioteca; `L+` = **compartilhada nova** proposta (vários usuários canônicos — mesmo critério usado quando Rasengan e Byakugou viraram compartilhadas).

### Compartilhadas novas propostas nesta onda (L+)
| Chave | Nome PT (japonês) | Escola · Elemento · Forma | Usuários canônicos |
|---|---|---|---|
| `L+.armaduraRaio` | Armadura de Raio (Raiton no Yoroi / Lightning Release Chakra Mode) | Ninjutsu · Raio · **Buff** (+movimento, +velocidade de ataque, +armadura) | 3º Raikage, 4º Raikage, Killer B ([Lightning Release Chakra Mode](https://naruto.fandom.com/wiki/Lightning_Release_Chakra_Mode)) |
| `L+.laco` | Laço Relâmpago (Raiton: Rariatto) | Taijutsu · Raio · Linha | 4º Raikage, Killer B (citado nas duas páginas) |
| `L+.jinton` | Desprendimento do Mundo Primitivo (Jinton: Genkai Hakuri no Jutsu) | Ninjutsu · Poeira* · Linha (ou Área) | Mū, Ōnoki |
| `L+.rochaLeve` | Rocha de Peso Leve (Doton: Keijūgan no Jutsu) | Ninjutsu · Terra · **Buff** (voo: +movimento, ignora lentidão) | Ishikawa, Mū, Ōnoki ("a habilidade de voar do Tsuchikage é bem conhecida", página Tsuchikage) |
| `L+.esconderijoNevoa` | Esconderijo na Névoa (Kirigakure no Jutsu) | Ninjutsu · Água · Área (Lentidão + evasão) | Zabuza, Mei (citado nas duas) |

\* Poeira, Lava, Vapor, Gelo, Explosão: ver §5 (PERGUNTA 4).

---

### K1. Hiruzen Sarutobi — Terceiro Hokage
- **Fonte**: [Hiruzen Sarutobi](https://naruto.fandom.com/wiki/Hiruzen_Sarutobi) (CONFIRMADO: Kage na Parte I; Sensor; Folha + Aliança Shinobi; Clã Sarutobi; times "Team Tobirama", "Team Hiruzen" (Sannin); naturezas Fogo, Vento, Raio, Terra, Água, Yin, Yang; "Hiruzen favoured Fire Release"; estreia cap. 1 / ep. 1).
- **Família** `hiruzen` · Vila da Folha · Clã Sarutobi · orgs: **Hokages** (o id `hiruzen` já está em `ORGANIZATIONS.hokage`), Aliança (versão Edo Tensei).
- **Naturezas no jogo**: Fogo, Vento, Raio, Terra, Água, Sombra (Yin→Sombra; Yang fica de fora, como hoje). **Elemento BASE: Fogo** (preferência citada na fonte). Sem Modo Sábio/Kekkei Genkai.
- **Escola principal**: Ninjutsu (com taijutsu de bastão).
- **Atributos PROPOSTOS**: 145 · 22 · 6 · 6,4 — papel de Jiraiya (145 · 22 · 6 · 6,3): veterano de área/ninjutsu.

| Versão | Forma | Arco | Kit (slots 1–4) | Ultimate | Passiva única (PROPOSTO) |
|---|---|---|---|---|---|
| `hiruzen` · **Professor** | 1 | Parte I — Invasão de Konoha (vs Orochimaru) | `U.shurikenKB` **Shuriken Kage Bunshin** (Shuriken Kage Bunshin no Jutsu) Taijutsu · Neutro · Em V · ×1,3 — usado contra Orochimaru · `L.parede` (Doton: Doryūheki, também usado na luta) · `L.bolaFogo` · `U.enma` **Bastão Adamantino de Enma** (Kongō Nyoi) Taijutsu · Neutro · Corpo a corpo · ×1,5 · Atordoar — invocação do Rei Macaco Enma | **Prisão Adamantina de Enma** (Kongōrōheki) | **O Professor** · +10% ninjutsu, +10% taijutsu e técnicas BÁSICAS de Academia (`ACADEMY`) com +40% de dano ("conhece todos os jutsu da vila") |
| `hiruzen-edo` · **Edo Tensei** | 15 | Shippuden — Quarta Guerra (Hokages reanimados) | `L.fenix` (Katon: Hōsenka) · `L.dragaoAgua` (Suiryūdan, citado na fonte) · `U.enma` · `U.cincoLiberacoes` **Combinação das Cinco Liberações** (Five Release Great Combo — intercepta o elemento inimigo com a natureza oposta) Ninjutsu · Neutro + `secondaryElement` rotativo · Onda · ×1,8 | **Formação dos Quatro Vermelhos Yang** (Shisekiyōjin, barreira com os outros Hokages) | **Deus dos Shinobi** · +12% dano total e cada técnica de elemento diferente usada em sequência dá +4% de dano (até 5 acúmulos) |

- **Nota de conflito**: o **Selo do Ceifador da Morte** (Shiki Fūjin) é canônico do Hiruzen, mas já é o nome da Ultimate do Minato Hokage ("Selo do Ceifador"). Proponho não repetir — PERGUNTA 8.
- **Fase opcional**: Hiruzen jovem (Time Tobirama) aparece em flashbacks com pouco combate → não proposto (PERGUNTA 9).
- **Buff de ajudante**: *Vontade do Fogo do Professor* — +12% XP e +5% dano total. Sinergias: Hokages, Folha; nova org **Clã Sarutobi** (Hiruzen, Asuma, Konohamaru, Kurenai*) — *Kurenai consta como "Sarutobi Clan" na infobox dela (por casamento).
- **Entrada no jogo**: `hiruzen` — mapa `folha`, **Kage**, minuto 6, 800 abates, `requires: ['orochimaru']`, "Invasão de Konoha". `hiruzen-edo` — `playWith: 'hiruzen'`, `pedra`, Kage, 7 min, 1.100 abates, "Os Hokages Reanimados". Guardião: zona 3 da Folha ("Cerco dos Kage").
- **Arte/movimento**: chibi idoso, barba curta, cavanhaque; v1 com **armadura de combate preta** (traje da luta contra Orochimaru) e capacete; v2 mesma armadura com rachaduras de Edo Tensei (pele cinzenta, olhos escuros). Folhas: repouso, caminhada direcional 4×2, ação completa 4×4 (selo de mão do Naruto como base + **pose de bastão giratório** para o Enma), pulo e dash padrão Naruto Academia. **Exceção**: o Enma aparece como bastão preto com pontas douradas na mão durante o golpe (quadros de ataque próprios, não arma fixa).
- **WebGL**: Shuriken Kage Bunshin reaproveita o ramo `Kunai|Shuriken` (multiplica projéteis); Enma = **novo** (bastão alongado + anel de impacto); Cinco Liberações = **novo** (anel com 5 cores dos elementos, pode reusar `particles.cast` com `secondaryElement`); Fênix/Dragão d'Água já existem.

### K2. Rasa — Quarto Kazekage
- **Fonte**: [Rasa](https://naruto.fandom.com/wiki/Rasa) (CONFIRMADO: Kage na Parte I; Kazekage, Chefe do Clã Kazekage; naturezas Ímã (Jiton), Vento, Terra, Água, Yin; Kekkei Genkai Jiton; Areia; estreia cap. 95 / ep. 57; Pó de Ouro: Sepultamento Imperial de Pó de Ouro, Muralha de Pó de Ouro Aéreo, Terceiro Olho; a lâmina d'água é citada só como dado de databook → **não usada**).
- **Família** `rasa` · Vila da Areia · Clã Kazekage · orgs: nova **Família do Kazekage** (Rasa, Gaara, Temari, Kankuro — PERGUNTA 13) e **Cinco Kage** (nova, ver §6).
- **Naturezas no jogo**: Areia (Jiton→Areia, **mesma conversão já usada no Gaara**), Vento, Terra, Água, Sombra. **BASE: Areia.** Kekkei Genkai: Jiton.
- **Escola**: Ninjutsu. **Atributos**: 145 · 22 · 5 · 6,2 — papel de Gaara (145 · 22 · 4 · 6,3), mais controle que defesa.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `rasa` · **Kazekage** | 1 | Parte I (Kazekage, morto por Orochimaru) e Shippuden (Edo Tensei vs Gaara) | `L.ondaAreia` · `U.muralhaOuro` **Muralha de Pó de Ouro Aéreo** Ninjutsu · Areia · Órbita · ×1,0 (escudo que fere ao redor) · `L.vendaval` · `U.sepultamentoOuro` **Sepultamento Imperial de Pó de Ouro** (Jiton: Sakin Taisō) Ninjutsu · Areia · Área · ×1,7 · Lentidão | **Avalanche de Pó de Ouro** (nome de jogo) | **Peso do Ouro** · técnicas de Areia ganham +20 pontos de chance de Lentidão e inimigos lentos recebem +12% de dano; +6 armadura |

- Versão única: a versão Edo Tensei usa as mesmas técnicas (não há fase nova de combate). PERGUNTA 9.
- **Buff**: *Peso do Pó de Ouro* — +6 armadura e +8% área. Sinergias: Areia, Família do Kazekage, Cinco Kage.
- **Entrada**: `rasa` — `areia`, Jonin, 5 min, 600 abates, `requires: ['gaara']`, "O Pai do Jinchūriki". Guardião: zona 3 da Areia ("Muralha do Kazekage").
- **Arte**: túnica e chapéu de Kazekage (a wiki registra que o anime trocou a cor do traje de azul para o verde do mangá a partir do ep. 199 — usar **verde**), cabelo ruivo-escuro, olheiras escuras quando usa Jiton. **Exceção de movimento**: palma aberta como Gaara (reaproveitar o padrão de gestos de areia do Gaara, `movimentar-shinobi`), com **pó dourado** em vez de areia bege.
- **WebGL**: ramo `Areia` existente com **variante dourada** (hoje a cor do ramo é fixa — precisa aceitar a cor da técnica); Muralha = anel de grãos dourados em `Órbita`.

### K3. Mei Terumī — Quinta Mizukage
- **Fonte**: [Mei Terumī](https://naruto.fandom.com/wiki/Mei_Terum%C4%AB) (CONFIRMADO: Kage no Shippuden; Névoa + Aliança; naturezas Água, Fogo, Terra, **Lava**, **Vapor (Futton)**, Raio; Kekkei Genkai Lava e Vapor; técnicas na fonte: Yōton: Yōkai no Jutsu (lama ácida cuspida), Futton: Kōmu no Jutsu (névoa ácida), Suiton: Suijinchū (Pilar de Água), Suiton: Suiryūdan, Kirigakure no Jutsu; estreia cap. 454 / ep. 199).
- **Família** `mei` · Vila da Névoa · sem clã · orgs: Cinco Kage, Aliança (v2).
- **Naturezas no jogo**: Água, Fogo, Terra, Raio + Lava/Vapor (§5). **BASE: Água** se Lava/Vapor forem mapeados; **Lava** se virarem elementos (PERGUNTA 5).
- **Escola**: Ninjutsu. **Atributos**: 135 · 22 · 5 · 6,6 — papel de Tobirama (135 · 21 · 7 · 6,8), menos armadura, mais dano em área.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `mei` · **Mizukage** | 1 | Shippuden — Cúpula dos Cinco Kage (vs Sasuke) | `L.dragaoAgua` · `L+.esconderijoNevoa` · `U.yokai` **Aparição Derretida** (Yōton: Yōkai no Jutsu) Ninjutsu · Lava (Terra+Fogo) · Cone · ×1,5 · queima · `U.komu` **Névoa Hábil** (Futton: Kōmu no Jutsu) Ninjutsu · Vapor (Fogo+Água) · Área · ×1,4 · Lentidão + veneno | **Névoa Corrosiva Total** (nome de jogo) | **Duas Kekkei Genkai** · técnicas de Lava/Vapor aplicam corrosão: −15% armadura do alvo por 3 s e veneno de 15% |
| `mei-alianca` · **Aliança** | 15 | Shippuden — Quarta Guerra (Cinco Kage vs Madara, Lava derrete o Susanoo) | `L.dragaoAgua` · `U.pilarAgua` **Pilar de Água** (Suiton: Suijinchū) Ninjutsu · Água · Linha · ×1,3 (anula projéteis) · `U.komu` · `U.yokai` | **Lava contra o Susanoo** (nome de jogo) | **Kage da Aliança** · corrosão −20% de armadura, veneno de 20% e +10% dano contra guardiões/bijū |

- **Buff**: *Névoa Corrosiva* — +20% veneno. Sinergias: Névoa (crítico), Cinco Kage, Aliança.
- **Entrada**: `mei` — `nevoa`, Jonin, 5 min, 600 abates, `requires: ['gaara']`, "A Cúpula dos Cinco Kage". `mei-alianca` — `playWith: 'mei'`, `pedra`, Kage, 7 min, 1.050 abates. Guardião: zona 3 da Névoa ("Torre do Mizukage").
- **Arte**: cabelo ruivo longo com coque, franja sobre o olho, vestido azul-marinho; v2 com colete da Aliança. **Exceção**: Yōkai é **cuspido pela boca** (como a regra do óleo do Gamabunta: origem do efeito na boca, alinhar quadro do ator e efeito); Kōmu também sai da boca (névoa). Folha de ação com quadro de "sopro".
- **WebGL**: Lava = **novo** (gotas marrom-alaranjadas + poça; dá para derivar do ramo `Fogo` com cor própria); Vapor = **novo** (névoa branco-amarelada; derivar do ramo `Água`). Pilar de Água = ramo `Água` em Linha vertical.

### K4. Ōnoki — Terceiro Tsuchikage
- **Fonte**: [Ōnoki](https://naruto.fandom.com/wiki/%C5%8Cnoki) (CONFIRMADO: Kage no Shippuden; Pedra + Aliança; naturezas Poeira (Jinton), Terra, Fogo, Vento, Raio, Yang; Kekkei Tōta Jinton; técnicas: Jinton: Genkai Hakuri no Jutsu, Doton: Gōremu no Jutsu (Golem), Doton: Kajūgan / Chō Kajūgan (peso adicional), Doton: Keijūgan / Chō Keijūgan (peso leve), "Fist Rock Technique" (romaji a conferir); estreia cap. 454 / ep. 199).
- **Família** `onoki` · Vila da Pedra · orgs: Cinco Kage, Aliança (v2).
- **Naturezas no jogo**: Terra, Fogo, Vento, Raio + Poeira (§5). **BASE: Terra** (ou Poeira — PERGUNTA 5).
- **Escola**: Ninjutsu. **Atributos**: 125 · 24 · 5 · 6,6 — papel de Pain (140 · 24 · 7 · 6,2), mais frágil e mais móvel (voa).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `onoki` · **Tsuchikage** | 1 | Shippuden — Cúpula (Jinton contra Sasuke) | `L.parede` · `L+.rochaLeve` · `U.kajugan` **Rocha de Peso Adicional** (Doton: Kajūgan no Jutsu) Ninjutsu · Terra · Área · ×1,4 · Lentidão forte · `L+.jinton` | **Rocha de Peso Ultra-Adicional** (Chō Kajūgan) | **Peso e Leveza** · +15% movimento; inimigos sob Lentidão sofrem +15% dano de técnicas de Terra/Poeira |
| `onoki-alianca` · **Aliança** | 15 | Shippuden — Quarta Guerra (Golem; vs Madara) | `U.golem` **Golem de Rocha** (Doton: Gōremu no Jutsu) Ninjutsu · Terra · Onda · ×1,5 · Atordoar · `L+.rochaLeve` · `U.kajugan` · `L+.jinton` | **Desprendimento do Mundo Primitivo Supremo** (nome de jogo) | **Velho Teimoso** · +20% movimento, +15% área e Jinton com +20% de dano |

- **Buff**: *Rocha Leve* — +10% movimento. Sinergias: Pedra (armadura/HP), Cinco Kage, Aliança, nova **Linhagem do Tsuchikage** (Ōnoki, Mū, Kurotsuchi — PERGUNTA 13).
- **Entrada**: `onoki` — `pedra`, Jonin, 5 min, 600 abates, `requires: ['gaara']`. `onoki-alianca` — `playWith: 'onoki'`, `pedra`, Kage, 7 min, 1.050. Guardião: zona 3 da Pedra ("Pico do Tsuchikage").
- **Arte**: idoso baixinho de nariz vermelho grande, barba e coque branco, manto/chapéu de Tsuchikage (v1), colete da Aliança (v2). **Exceção de movimento**: **levitação** — ele voa; o pulo vira flutuação longa e o dash é um voo baixo. Reaproveitar a flutuação breve já usada em Gaara Kazekage/Aliança, mais alta e mais longa. Repouso flutuando a poucos cm do chão (pés NÃO ancorados — precisa exceção no `playerMotion`).
- **WebGL**: Jinton = **novo** (cubo/cone translúcido branco com núcleo brilhante que "apaga" a área); Golem = ramo `Terra` ampliado; Kajūgan = anel de pedra caindo.

### K5. A — Quarto Raikage
- **Fonte**: [A (Fourth Raikage)](https://naruto.fandom.com/wiki/A_(Fourth_Raikage)) (CONFIRMADO: Kage no Shippuden; Raikage e Líder Supremo da Aliança; naturezas Raio, Terra, Água; times "A–B Combo"; técnicas na fonte: Raiton no Yoroi, Raiton: Rariatto, Liger Bomb, Guillotine Drop, Raigyaku Suihei Chop (Lightning Oppression Horizontal), Lightning Straight; estreia cap. 416 / ep. 152).
- **Família** `raikage` · Vila da Nuvem · orgs: Cinco Kage, Aliança (v2), nova **Dupla A–B** (`raikage` + `killer-b`).
- **Naturezas**: Raio, Terra, Água. **BASE: Raio.** Escola: Taijutsu.
- **Atributos**: 150 · 25 · 7 · 7,0 — papel de Might Guy (145 · 25 · 7 · 6,8).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `raikage` · **Raikage** | 1 | Shippuden — Cúpula (vs Sasuke; perde o braço) | `L+.armaduraRaio` · `L+.laco` · `L.punho` · `U.liger` **Bomba Liger** (Raigā Bomu) Taijutsu · Raio · Área · ×1,6 · Atordoar | **Guilhotina Descendente** (Girochin Doroppu — U só como Ultimate da v1) | **Armadura do Raikage** · com a Armadura de Raio ativa: +20% taijutsu e +15% velocidade de ataque; +15% movimento sempre |
| `raikage-alianca` · **Aliança** | 15 | Shippuden — Quarta Guerra (vs Madara, com Ōnoki) | `L+.armaduraRaio` · `U.raigyaku` **Corte Horizontal Opressor** (Raiton: Raigyaku Suihei Chop) Taijutsu · Raio · Cone · ×1,5 · `L+.laco` · `U.guilhotina` **Guilhotina Descendente** Taijutsu · Raio · Área · ×1,8 | **Velocidade Máxima do Raikage** (nome de jogo) | **Líder Supremo** · +25% taijutsu, +20% velocidade de ataque e +10% dano dos ajudantes |

- **Buff**: *Armadura Relâmpago* — +12% taijutsu e +6% movimento. Sinergias: Nuvem (dano), Dupla A–B, Cinco Kage, Aliança.
- **Entrada**: `raikage` — mapa **Nuvem (novo)**; enquanto não existir, `pedra`, Jonin, 5 min, 650 abates, `requires: ['killer-b']`, "O Irmão do Oito Caudas". `raikage-alianca` — `playWith: 'raikage'`, Kage, 7 min, 1.100. Guardião: zona 3 da Nuvem.
- **Arte**: muito alto e musculoso (chibi "largo"), pele escura, cabelo loiro platinado para trás, bigode; manto de Raikage aberto no peito (v1); v2 **sem o braço esquerdo** (canônico após a Cúpula) e com colete. **Exceção**: aura de raio azul-branca **persistente** enquanto a Armadura estiver ativa (mesmo padrão da aura do Modo Sábio, atlas); poses próprias de luta livre (laço com braço estendido, salto + queda de perna para a Guilhotina) — como Lee/Guy têm socos e chutes próprios.
- **WebGL**: `Raio` existente para os golpes; **novo** atlas de aura para a Armadura (reaproveitável por 3º Raikage e Killer B).

### K6. A — Terceiro Raikage
- **Fonte**: [A (Third Raikage)](https://naruto.fandom.com/wiki/A_(Third_Raikage)) (CONFIRMADO: Kage; naturezas Raio, Terra, Fogo; "strongest shield"; Lança do Inferno (Jigokuzuki) com 4/3/2/1 dedos, "strongest spear"; Relâmpago Negro; Armadura de Raio; lutou 3 dias e 3 noites; estreia cap. 494 / ep. 244; reanimado na guerra).
- **Família** `raikage-terceiro` · Nuvem · BASE Raio · Taijutsu. **Atributos**: 165 · 23 · 10 · 6,2 — papel de Tsunade (165 · 25 · 8 · 6,0), tanque.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `raikage-terceiro` · **Edo Tensei** | 1 | Shippuden — Quarta Guerra (vs Naruto e a 4ª Divisão) | `L+.armaduraRaio` · `L.punho` · `U.relampagoNegro` **Relâmpago Negro** (Kuro Kaminari) Ninjutsu · Raio · Área · ×1,4 · Paralisar · `U.jigokuzuki` **Lança do Inferno: Quatro Dedos** (Jigokuzuki Yonhon Nukite) Taijutsu · Raio · Linha · ×1,7 | **Lança do Inferno: Um Dedo** (Ippon Nukite — o único golpe que feriu o próprio corpo) | **O Escudo Mais Forte** · +12 armadura, +15% HP máximo; abaixo de 30% de HP, recebe −20% de dano |

- **Buff**: *Escudo Mais Forte* — +10 armadura. **Entrada**: Nuvem (ou `pedra`), **Kage**, 7 min, 1.100 abates, `requires: ['raikage']`, **lendário** (retrato oculto), "O Raikage que Lutou Três Dias". Guardião: zona 3 da Nuvem.
- **Arte**: parecido com o filho, mais velho, cicatriz no peito, rachaduras de Edo Tensei. Exceção: pose de **estocada com dedos** (mão em lança) na folha de ação; mesma aura de raio do filho.
- **WebGL**: Relâmpago Negro = ramo `Raio` com paleta escura (roxo/preto); Jigokuzuki = linha fina perfurante.

### K7. Mū — Segundo Tsuchikage
- **Fonte**: [Mū](https://naruto.fandom.com/wiki/M%C5%AB) (CONFIRMADO: Kage; Sensor; naturezas Poeira, Terra, Água, Fogo, Vento, Raio, Yang; Kekkei Tōta Jinton; Técnica da Fissão (Bunretsu); Camuflagem sem Poeira (invisível); Rocha Leve; reanimado por Kabuto; estreia cap. 515 / ep. 256).
- **Família** `mu` · Vila da Pedra · BASE Terra (ou Poeira) · Ninjutsu. **Atributos**: 120 · 23 · 4 · 6,8 — papel de Itachi (110 · 21 · 3 · 6,8), assassino frágil.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `mu` · **Edo Tensei** | 1 | Shippuden — Quarta Guerra (vs Gaara e a 4ª Divisão; reanimou os outros Kages) | `L+.rochaLeve` · `U.invisivel` **Camuflagem sem Poeira** (Jinton? — a fonte só nomeia "Dustless Bewildering Cover"; romaji a conferir) **Buff** (+evasão, +crítico) · `U.fissao` **Técnica da Fissão** (Bunretsu no Jutsu) Ninjutsu · Neutro · Projétil · ×1,2 (um clone dividido ataca) · `L+.jinton` | **Desprendimento Duplo** (as duas metades da Fissão usam Jinton juntas — nome de jogo) | **Invisível** · ao sair da invisibilidade, o próximo golpe é crítico garantido; +8 pontos de evasão |

- **Buff**: *Sem Poeira* — +6 pontos de evasão. **Entrada**: `pedra`, Kage, 7 min, 1.000 abates, `requires: ['onoki']`.
- **Arte**: corpo todo enfaixado (múmia), gola alta, olhos só. **Exceções**: levita como Ōnoki; buff de invisibilidade = sprite semitransparente (opacidade ~30%) enquanto durar; Fissão = sprite se divide em dois menores (o clone corre como os Kage Bunshin — regra "clones correm").
- **WebGL**: Jinton (novo, mesmo do Ōnoki); Fissão reaproveita o ramo `Bunshin`.

### K8. Gengetsu Hōzuki — Segundo Mizukage
- **Fonte**: [Gengetsu Hōzuki](https://naruto.fandom.com/wiki/Gengetsu_H%C5%8Dzuki) (CONFIRMADO: Kage; Clã Hōzuki; naturezas Água, Fogo, Raio, Terra, Yin, Yang; técnicas: Hidrificação, Pistola d'Água (Water Gun), Balão d'Água, Tirania do Vapor (Steaming Danger Tyranny — clones de vapor que explodem), Ostra Gigante (miragem/genjutsu); estreia cap. 525 / ep. 267).
- **Família** `gengetsu` · Vila da Névoa · Clã Hōzuki · BASE Água · Ninjutsu. **Atributos**: 130 · 21 · 5 · 6,7 — papel de Tobirama.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `gengetsu` · **Edo Tensei** | 1 | Shippuden — Quarta Guerra (Kages reanimados; duelo-lembrança com o 2º Tsuchikage) | `U.pistolaAgua` **Pistola d'Água** (Mizudeppō no Jutsu) Ninjutsu · Água · Projétil · ×1,3 · `L.agulhasAgua` · `L.dragaoAgua` · `U.tirania` **Tirania do Vapor** (Jōki Bōi) Ninjutsu · Água · Área · ×1,6 (clone explode) | **Miragem da Ostra Gigante** (genjutsu da Ostra — Genjutsu · Sombra · Área · Paralisar) | **Hidrificação** · +12 pontos de evasão; ao esquivar, cura 2% do HP |

- Nota: a fonte não define a natureza da Tirania do Vapor no resumo consultado — mantida como Água (PROPOSTO, conferir antes de implementar).
- **Buff**: *Hidrificação* — +5 evasão e +0,4 HP/s. Sinergias: Névoa; nova **Clã Hōzuki** (Gengetsu, Suigetsu, Mangetsu). **Entrada**: `nevoa`, Kage, 6 min, 900 abates, `requires: ['mei']`.
- **Arte**: cabelo azul-claro, sorriso de dentes de tubarão, manto de Mizukage. **Exceção**: dash vira **corpo líquido** (quadros de dash com o corpo se desmanchando em água) — Hidrificação.
- **WebGL**: Pistola d'Água = ramo `Água` em Projétil; Tirania = **novo** (clone de vapor + explosão branca); Ostra = variante do ramo de invocações.

### K9. Yagura Karatachi — Quarto Mizukage
- **Fonte**: [Yagura Karatachi](https://naruto.fandom.com/wiki/Yagura_Karatachi) (CONFIRMADO: Kage; jinchūriki perfeito do Isobu; Água (Vento só anime); Bastão-Garra; Espelho d'Água; Versão 2 e Bijūdama; manipulado por Tobi; voltou como Caminho de Pain do Tobi; estreia cap. 458 / ep. 200).
- **Família** `yagura` · Névoa · BASE Água · Ninjutsu. **Atributos**: 140 · 21 · 6 · 6,6 — papel de Kushina (140 · 20 · 5 · 6,9).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `yagura` · **Mizukage** | 1 | Shippuden — flashbacks (anime) e Quarta Guerra (Caminho de Pain do Tobi, vs B e Naruto) | `L.agulhasAgua` · `U.espelhoAgua` **Espelho d'Água** (Suiton: Suikagami no Jutsu) Ninjutsu · Água · Órbita · ×1,1 (reflete — usa o sistema de espinhos existente) · `L.dragaoAgua` · `U.palmaCoral` **Palma de Coral** (Coral Palm, Versão 2) Ninjutsu · Água · Área · ×1,6 · Lentidão | **Bijūdama do Três Caudas** | **Jinchūriki Perfeito** · +20% HP máximo e reflete 10% do dano recebido |

- O nome "Corais da Três Caudas" já é ataque do Isobu (bijuu.ts) — por isso "Palma de Coral".
- **Buff**: *Chakra do Isobu* — +40 HP máximo. Sinergias: Névoa; nova **Jinchūriki** (Naruto, Gaara Genin, Killer B, Yagura… PERGUNTA 13). **Entrada**: `nevoa`, Jonin, 5 min, 650 abates, `requires: ['mei']`, "O Mizukage Manipulado".
- **Arte**: aparência de criança (baixinho), cabelo cinza, cicatriz sob o olho, bastão grande com flor verde na ponta. Exceção: golpe de bastão (pose própria), olho com Sharingan/Rinnegan **não** (seria a fase de Caminho de Pain; manter a fase Mizukage).
- **WebGL**: Espelho = **novo** (placas d'água circulares em órbita); Coral = ramo `Água` + espinhos rosados.

### K10. Killer B — jinchūriki do Oito Caudas (não Kage)
- **Fonte**: [Killer B](https://naruto.fandom.com/wiki/Killer_B) (CONFIRMADO: Guardião de Kumogakure; jinchūriki do Gyūki; naturezas Raio, Água, Fogo, Yang; técnicas: estilo Acrobata com sete espadas, Raiton: Rariatto / Double Lariat (com A), Clone de Tinta, Selo do Polvo, Modo Bijū, Bijūdama, Bijūdama em sequência, uso da Samehada; estreia cap. 408 / ep. 142).
- **Família** `killer-b` · Nuvem · BASE Raio · Taijutsu. **Atributos**: 145 · 24 · 7 · 6,8 — papel de Might Guy.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `killer-b` · **Jinchūriki** | 1 | Shippuden — Caçada ao Oito Caudas (vs Taka) | `U.acrobata` **Estilo Acrobata das Sete Espadas** Taijutsu · Neutro · Cone · ×1,3 · `L+.laco` · `L+.armaduraRaio` · `U.tintaPolvo` **Clone de Tinta** (Sumi Bunshin) Ninjutsu · Neutro · Área · ×1,2 · Paralisar | **Bijūdama do Oito Caudas** | **Rimas do Hachibi** · +15% taijutsu, +10% velocidade de ataque; a cada 8 golpes, tentáculo de chakra acerta em área |
| `killer-b-hachibi` · **Modo Bijū** | 15 | Shippuden — Quarta Guerra (Ilha Tartaruga, Modo Bijū total) | `U.acrobata` · `L+.laco` · `L.punho` · `U.bijudamaSerie` **Bijūdama em Sequência** (Renzoku Bijūdama) Ninjutsu · Neutro · Área · ×1,9 | **Oito Caudas Liberado** (nome de jogo) | **Parceiro do Gyūki** · +20% HP, +15% taijutsu e +15% dano contra bijū |

- **Conflito**: `Bijūdama` é **única** do Naruto (`U.bijudama`). B, Yagura e os jinchūriki também usam → proponho **mover Bijūdama para `L`** (mesmo caminho do Rasengan/Byakugou). Enquanto isso, B usa "Bijūdama em Sequência" como única. PERGUNTA 8.
- **Gyūki continua bijū-chefe** (bijuu.ts) — Killer B é o shinobi; sem duplicar.
- **Buff**: *Rap do Oito Caudas* — +8% velocidade de ataque e +8% taijutsu. Sinergias: Nuvem, Dupla A–B, Jinchūriki, Aliança (v2).
- **Entrada**: `killer-b` — Nuvem (ou `pedra`), Jonin, 4 min, 550 abates, `requires: ['sasuke']`, "Caçada ao Oito Caudas". `killer-b-hachibi` — `playWith: 'killer-b'`, `nevoa`, Kage, 6 min, 950, "Ilha Tartaruga".
- **Arte**: alto, pele escura, óculos escuros, tatuagem de chifre no rosto, **sete espadas nas costas**, colete de Kumo. Exceção: ataque de sete espadas (pose própria: espadas em axilas, boca e mãos) — como Lee/Guy com poses próprias; v2 com manto de chakra roxo/tentáculos.
- **WebGL**: tinta e tentáculos **já existem** (ramos `Nuvem de Tinta` e `Turbilhão de Tentáculos` do Gyūki); Bijūdama já existe.

### K11. Danzō Shimura — candidato a Sexto Hokage (personagem)
- **Fonte**: [Danzō Shimura](https://naruto.fandom.com/wiki/Danz%C5%8D_Shimura) (CONFIRMADO: líder da Raiz, Candidato a Sexto Hokage; naturezas Vento, Madeira, Terra, Água, Fogo, Yin, Yang; Kekkei Genkai Sharingan, Mangekyō, Mokuton (enxertados); técnicas: Fūton: Shinkū Gyoku / Shinkū Renpa / Shinkū Daigyoku, Mokuton, Izanagi, Kotoamatsukami, invocação de Baku; estreia cap. 281 / ep. 32).
- **Por que não é Kage**: foi nomeado candidato pelo daimyō durante a Cúpula, mas morreu antes de ser empossado; a lista oficial de Hokage não o inclui.
- **Família** `danzo` · Folha · Clã Shimura · org nova **Raiz** (Danzō, Sai, Yamato*, Torune, Fū Yamanaka) — *Yamato consta como "Root" na infobox. BASE **Vento** · Ninjutsu. **Atributos**: 130 · 22 · 5 · 6,5 — papel de Orochimaru (125 · 19 · 4 · 6,7).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `danzo` · **Raiz** | 1 | Shippuden — Cúpula dos Cinco Kage (vs Sasuke) | `U.vacuo` **Esferas de Vácuo** (Fūton: Shinkū Renpa) Ninjutsu · Vento · Em V · ×1,3 · `L.laminas` · `L.raizes` (Mokuton enxertado) · `U.baku` **Invocação de Baku** (Kuchiyose: Baku) Ninjutsu · Neutro · Área · ×1,5 (puxa inimigos) | **Grande Esfera de Vácuo** (Fūton: Shinkū Daigyoku) | **Izanagi** · revive até 2× por run com 30% do HP (reusa o efeito de ressurreição de item, `revive35`) |

- **Buff**: *Raiz da Folha* — +25% dano crítico. **Entrada**: `folha`, Kage, 6 min, 850, `requires: ['hiruzen', 'sai']`.
- **Arte**: bandagens no olho direito e no braço direito, bengala, roupa cinza. Exceção: quadro de ação revelando o braço com Sharingans (Ultimate).
- **WebGL**: vácuo = ramo `Vento` em Projétil; Baku = variante de invocação (focinho que suga).

### Kages com pouco material — ficha curta (sem técnicas inventadas)
| Kage | O que a fonte dá | Proposta |
|---|---|---|
| 1º Kazekage Reto | só "unificou os shinobi do deserto" | Retrato/estátua no hub ou evento "Primeira Cúpula dos Kage"; **não jogável** |
| 2º Kazekage Shamon | marionetes com fios de chakra | Idem; no máximo Elite amarelo temático (sem técnicas) |
| 3º Kazekage | Areia de Ferro (luta como marionete) | **Guardião não jogável** ou técnica da marionete do **Sasori** (Onda 2) — PERGUNTA 2 |
| 1º Mizukage Byakuren | nada de combate | Retrato/estátua |
| 3º Mizukage (sem nome) | nada; kenjutsu só inferido | Retrato/estátua |
| 1º Tsuchikage Ishikawa | Rocha Leve (voo); abelhas só anime | Retrato/estátua; Rocha Leve já entra como `L+.rochaLeve` |
| 1º e 2º Raikage | nada de combate | Retrato/estátua |

---

## 4B. Fichas completas — Onda 1

### O1. Kiba Inuzuka (+ Akamaru)
- **Fonte**: [Kiba Inuzuka](https://naruto.fandom.com/wiki/Kiba_Inuzuka) (CONFIRMADO: Genin na Parte I, Chūnin na Parte II; Clã Inuzuka; Time 8, Equipe de Resgate do Sasuke, Aliança; naturezas Terra, Yang; técnicas: Shikyaku no Jutsu (Quatro Patas), Jūjin Bunshin, Gatsūga, Sōtōrō (Lobo de Duas Cabeças), Garōga, Lobo de Três Cabeças; estreia cap. 34 / ep. 1, na sala da Academia).
- **Família** `kiba` · Folha · Clã Inuzuka · orgs: Time 8 (já existe com `kiba`), Aliança (v2). BASE Terra · Taijutsu. **Atributos**: 130 · 22 · 4 · 7,1 — papel de Rock Lee (135 · 23 · 5 · 7,0).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `kiba` · **Genin** | 1 | Parte I — Exame Chunin (vs Naruto) e Resgate do Sasuke | `U.quatroPatas` **Técnica das Quatro Patas** (Shikyaku no Jutsu) Buff (+movimento, +taijutsu) · `L.kunai` · `L.shuriken` · `U.gatsuga` **Presa sobre Presa** (Gatsūga) Taijutsu · Neutro · Linha · ×1,4 | **Lobo de Duas Cabeças** (Sōtōrō) | **Faro Inuzuka** · +2 m de coleta, +15% taijutsu; Gatsūga acerta 2× (Kiba + Akamaru) |
| `kiba-shippuden` · **Chunin** | 15 | Shippuden (caça ao Bikōchū/anime, Quarta Guerra) | `U.quatroPatas` · `L.ruptura` · `L.chute` · `U.garoga` **Presa do Lobo** (Garōga) Taijutsu · Neutro · Linha · ×1,8 | **Lobo de Três Cabeças** (Jinjū Konbi Henge: Sanbi no Kyōken? — romaji a conferir; a fonte o cita na seção de habilidades) | **Matilha Inuzuka** · +2,5 m de coleta, +20% taijutsu, +10% movimento |

- **Academia**: Kiba está na turma do Naruto desde o ep. 1, mas **não luta** na Academia → versão Academia não proposta.
- **Buff**: *Faro de Akamaru* — +1,5 m coleta e +5% movimento. **Entrada**: `kiba` — `folha`, Genin, 1 min, 140, `requires: ['hinata']`, "Time 8". `kiba-shippuden` — `playWith: 'kiba'`, `folha`, Chunin, 3 min, 350.
- **Arte**: capuz de pele, marcas vermelhas nas bochechas; **Akamaru** filhote no capuz (v1) e cão grande ao lado (v2). **Exceções**: (1) **acompanhante** — Akamaru precisa de sprite/caminhada própria seguindo o Kiba (sistema novo, §6); (2) Quatro Patas muda a caminhada para **corrida em quatro apoios** enquanto o buff durar (folha de caminhada alternativa); (3) Gatsūga = Kiba e Akamaru viram **brocas giratórias** (quadro de ação "rolamento").
- **WebGL**: **novo** — broca/redemoinho cinza giratório em Linha (pode partir do ramo `Rasengan` com cor cinza e `spin`).

### O2. Shino Aburame
- **Fonte**: [Shino Aburame](https://naruto.fandom.com/wiki/Shino_Aburame) (CONFIRMADO: Genin→Chūnin; Clã Aburame; Time 8; naturezas Terra, Fogo, Yang; técnicas: Kikaichū (destruição parasita), Clone de Insetos, Esfera de Insetos, Casulo de Insetos, Jarro de Insetos, Shuriken Manipulada, sensor; estreia cap. 34 / ep. 1).
- **Família** `shino` · Folha · Clã Aburame · Time 8. BASE Terra (kit é Neutro de insetos) · Ninjutsu. **Atributos**: 125 · 17 · 5 · 6,5 — papel de Kankuro (130 · 18 · 6 · 6,5).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `shino` · **Genin** | 1 | Parte I — Exame Chunin (vs Zaku; vs Kankuro) | `U.kikaichu` **Enxame Kikaichū** (Kikaichū no Jutsu) Ninjutsu · Neutro · Cone · ×1,2 · veneno (dreno de chakra) · `L.shuriken` (Shuriken Manipulada) · `L.kunai` · `U.cloneInsetos` **Clone de Insetos** (Mushi Bunshin no Jutsu) Ninjutsu · Neutro · Projétil · ×1,2 | **Jarro de Insetos** (Insect Jar Technique — romaji a conferir) | **Colmeia Aburame** · ataques aplicam veneno de 20% do impacto em 3 s; +10 pontos de chance de Lentidão |
| `shino-shippuden` · **Chunin** | 15 | Shippuden — busca do Bikōchū (anime), Quarta Guerra (vs Torune/Zetsu) | `U.kikaichu` · `L.parede` · `L.shuriken` · `U.esferaInsetos` **Esfera de Insetos** (Hijutsu: Mushidama) Ninjutsu · Neutro · Área · ×1,6 · Lentidão | **Casulo de Insetos** (Hijutsu: Mushi Kame? — romaji a conferir) | **Colmeia Rinkaichū** · veneno de 30%, +12 pontos de Lentidão, +15% duração |

- **Buff**: *Kikaichū* — +20% veneno. **Entrada**: `shino` — `folha`, Genin, 2 min, 200, `requires: ['kiba']`. v2: `playWith`, `folha`, Chunin, 3 min, 380.
- **Arte**: casaco de gola alta, óculos escuros redondos; v2 capa longa com capuz. Exceção: pose com **braços abertos soltando insetos das mangas** (preparação/soltura da ação).
- **WebGL**: **novo** — enxame (dezenas de pontos pretos em `grains` com movimento senoidal; leve no modo H).

### O3. Ino Yamanaka
- **Fonte**: [Ino Yamanaka](https://naruto.fandom.com/wiki/Ino_Yamanaka) (CONFIRMADO: Genin→Chūnin; Sensor e Médica; Clã Yamanaka; Time 10; naturezas Terra, Água, Fogo (anime), Yin, Yang; técnicas: Shintenshin (Transferência de Mente), Shinranshin (Perturbação Mente-Corpo), Armadilha de Cabelo de Chakra, Palma Mística, Transmissão Mental; estreia cap. 34 / ep. 1).
- **Família** `ino` · Folha · Clã Yamanaka · Ino-Shika-Chō (`time10`, já com `ino`), Aliança (v2). BASE **Sombra** (Yin; mesma conversão do Shikamaru) · Genjutsu (técnicas mentais tratadas como Genjutsu, como as sombras do Shikamaru). **Atributos**: 120 · 17 · 4 · 6,7 — papel de Shikamaru (120 · 17 · 5 · 6,6).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `ino` · **Genin** | 1 | Parte I — Exame Chunin (vs Sakura) | `L.kunai` · `L.shuriken` · `U.armadilhaCabelo` **Armadilha de Cabelo** (Chakra Hair Trap) Genjutsu · Sombra · Linha · Paralisar · `U.shintenshin` **Transferência de Mente** (Shintenshin no Jutsu) Genjutsu · Sombra · Projétil · ×1,4 · Atordoar | **Flor Yamanaka** (nome de jogo) | **Florista Yamanaka** · +25% duração de status e +10 pontos de chance de status |
| `ino-shippuden` · **Chunin** | 15 | Shippuden — Quarta Guerra (Divisão de Inteligência, Ino-Shika-Chō vs Obito) | `U.shintenshin` · `L.agulhasSombra` · `L.prisaoSombra` · `U.shinranshin` **Perturbação Mente-Corpo** (Shinranshin no Jutsu) Genjutsu · Sombra · Área · ×1,5 · Paralisar | **Transmissão Mental** (nome de jogo; Ino-Shika-Chō) | **Médica e Sensora** · +30% duração, +0,6 HP/s e +1 m de coleta |

- **Médica**: a regra de ajudantes (docs/18 §3) diz que médicos curam/coletam — Ino Shippuden entra no ramo `medical` de `allies.ts` (como Sakura v2+). **Palma Mística** é única da Tsunade (`U.palmaMistica`); Ino, Sakura, Shizune, Kabuto também usam → PERGUNTA 8 (mover para `L`).
- **Buff**: v1 *Transferência de Mente* — +10% recarga da Ultimate; v2 médico (cura + coleta). **Entrada**: `ino` — `folha`, Genin, 1 min, 140, `requires: ['shikamaru']`. v2 `playWith`, `folha`, Chunin, 3 min, 350.
- **Arte**: rabo de cavalo loiro, franja sobre o olho, roupa roxa (v1) e top/saia roxos (v2). Exceção: selo do **losango com as mãos** (Shintenshin) na folha de conjuração.
- **WebGL**: ramo `Sombra/Genjutsu` existente, com variante rosa-lilás para técnicas mentais.

### O4. Chōji Akimichi
- **Fonte**: [Chōji Akimichi](https://naruto.fandom.com/wiki/Ch%C5%8Dji_Akimichi) (CONFIRMADO: Genin→Chūnin; Clã Akimichi; Time 10; naturezas Terra, Fogo, Yang; técnicas: Baika (Expansão), Nikudan Sensha (Tanque Bala Humano), Nikudan Hari Sensha (com espinhos), Bubun Baika (parcial), Chō Baika (super), Pílulas das Três Cores, Modo Borboleta, Chōdan Bakugeki (Bombardeio da Bala Borboleta); estreia cap. 34 / ep. 1).
- **Família** `choji` · Folha · Clã Akimichi · Ino-Shika-Chō. BASE Terra · Taijutsu. **Atributos**: 165 · 22 · 8 · 6,0 — papel de Tsunade (165 · 25 · 8 · 6,0), tanque.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `choji` · **Genin** | 1 | Parte I — Resgate do Sasuke (vs Jirōbō) | `L.punho` · `U.nikudan` **Tanque Bala Humano** (Nikudan Sensha) Taijutsu · Neutro · Linha · ×1,4 · Empurrar · `L.ruptura` · `U.pilulas` **Pílulas das Três Cores** (Buff: +dano, +HP, −regen) | **Bala Borboleta** (Chōdan Bakugeki, Pílula Vermelha) | **Coração Akimichi** · +25% HP máximo e +15% taijutsu |
| `choji-shippuden` · **Chunin** | 15 | Shippuden — Akatsuki (vs Kakuzu) e invasão de Pain | `U.nikudan` · `L.punho` · `L.ruptura` · `U.chobaika` **Super Expansão** (Chō Baika no Jutsu) Taijutsu · Neutro · Área · ×1,6 · Atordoar | **Tanque Bala Humano com Espinhos** (Nikudan Hari Sensha) | **Peso Pesado** · +30% HP, +20% taijutsu, golpes corpo a corpo com +15% área |
| `choji-borboleta` · **Modo Borboleta** | 30 | Shippuden — Quarta Guerra (vs Obito/Dez Caudas) | `U.chobaika` · `L.punho` · `L.chute` · `U.borboleta` **Bombardeio da Bala Borboleta** (Chōdan Bakugeki) Taijutsu · Neutro · Área · ×1,9 | **Asas de Chakra Borboleta** (nome de jogo) | **Modo Borboleta** · +30% HP, +25% taijutsu, +10% movimento |

- **Buff**: *Coração Akimichi* — +50 HP máximo. **Entrada**: `choji` — `folha`, Genin, 2 min, 200, `requires: ['ino']`. v2 `playWith`, `folha`, Chunin, 4 min, 420. v3 `playWith: 'choji-shippuden'`, `pedra`, Jonin, 6 min, 800.
- **Arte**: rechonchudo, bochechas com espirais, cachecol branco e "comida" (v1); armadura vermelha (v2); asas de chakra borboleta (v3). **Exceções**: Expansão = **escala do sprite** aumenta durante a técnica (sistema novo §6); Nikudan = rola como bola (quadro de ação "bola").
- **WebGL**: **novo** — bola rolando com rastro (Nikudan); Borboleta = asas de chakra translúcidas.

### O5. Sai
- **Fonte**: [Sai](https://naruto.fandom.com/wiki/Sai) (CONFIRMADO: ANBU (Raiz) na Parte II; Time Kakashi, Raiz, Aliança; naturezas Terra, Água, Fogo, Yang; técnicas: Chōjū Giga (Imitação de Bestas Super), Chōshin Giga (Deuses), Clone de Tinta, Névoa de Tinta, selo do Tigre (Sealing Technique: Tiger Vision Staring Bullet); estreia cap. 281 / ep. 32 do Shippuden).
- **Família** `sai` · Folha · orgs: Time 7 (id `sai` já está em `time7`), Raiz, Aliança (v2). BASE Terra (kit é Neutro de tinta) · Ninjutsu. **Atributos**: 115 · 19 · 4 · 7,0 — papel de Tenten (120 · 16 · 4 · 7,0), projéteis.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `sai` · **Raiz** | 1 | Shippuden — Ponte do Céu e da Terra (Time Yamato) | `L.kunai` (tantō) · `L.shuriken` · `U.chojuGiga` **Imitação de Bestas Super** (Chōjū Giga) Ninjutsu · Neutro · Em V · ×1,3 · `U.cloneTinta` **Clone de Tinta** — **conflito**: Killer B também usa → proposto como `L+.cloneTinta` (Ninjutsu · Neutro · Projétil) | **Leões de Tinta** (nome de jogo) | **Pincel da Raiz** · +1 projétil nas técnicas de tinta e +10% velocidade de ataque |
| `sai-alianca` · **Aliança** | 15 | Shippuden — Quarta Guerra (Divisão de Ataque Surpresa) | `U.chojuGiga` · `L+.cloneTinta` · `L.kunai` · `U.choshinGiga` **Imitação de Deuses Super** (Chōshin Giga) Ninjutsu · Neutro · Área · ×1,7 | **Selo do Olhar do Tigre** (romaji a conferir) | **Pintor da Aliança** · +1 projétil, +15% velocidade de ataque, +10% XP |

- **Academia**: Sai não tem fase Academia/Genin mostrada (entra no Shippuden) → 2 versões.
- **Buff**: *Reconhecimento de Tinta* — +12% XP. **Entrada**: `sai` — `folha`, Chunin, 3 min, 350, `requires: ['yamato']`. v2 `playWith`, `pedra`, Jonin, 5 min, 650.
- **Arte**: pele muito pálida, cabelo preto curto, top curto preto, pergaminho e pincel. Exceção: **pose de pintar** (pergaminho aberto + pincel) como ação; bestas de tinta **correm** até o alvo (regra dos clones).
- **WebGL**: tinta existe (`Nuvem de Tinta`); bestas de tinta = **novo** (silhuetas pretas de leão/pássaro).

### O6. Yamato
- **Fonte**: [Yamato](https://naruto.fandom.com/wiki/Yamato) (CONFIRMADO: ANBU; Mokuton (Kekkei Genkai); naturezas Madeira, Terra, Água, Yang; Raiz, Time Kakashi; técnicas: Mokujōheki, Shichūrō (Prisão de Quatro Pilares), Daijurin (Grande Floresta), Clone de Madeira, colar do Primeiro e supressão de bijū, Suiton: Hahonryū; estreia cap. 284 / ep. 34 do Shippuden).
- **Família** `yamato` · Folha · orgs: Time 7 (`yamato` já em `time7`), Raiz. BASE **Madeira** · Ninjutsu. **Atributos**: 145 · 20 · 7 · 6,4 — papel de Hashirama (155 · 23 · 8 · 6,2), versão menor.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `yamato` · **Time Kakashi** | 1 | Shippuden — Ponte do Céu e da Terra, treino do Rasenshuriken | `U.muralhaMadeira` **Muralha de Madeira** (Mokuton: Mokujōheki) Ninjutsu · Madeira · Órbita · ×1,0 · `L.raizes` · `L.parede` · `U.quatroPilares` **Prisão de Quatro Pilares** (Mokuton: Shichūrō no Jutsu) Ninjutsu · Madeira · Área · ×1,5 · Paralisar | **Grande Floresta** (Mokuton: Daijurin no Jutsu) | **Células do Primeiro** · +0,8 HP/s, +20% duração de status e +20% dano contra bijū/guardiões (supressão de bijū) |

- "Floresta Profunda" já é única do Hashirama → a Ultimate do Yamato usa "Grande Floresta". Fase ANBU "Tenzō" (anime, arco Kakashi ANBU) → opcional, PERGUNTA 9.
- **Buff**: *Supressão do Primeiro* — +0,8 HP/s e +4 armadura. **Entrada**: `folha`, Jonin, 4 min, 450, `requires: ['kakashi']`.
- **Arte**: capacete de proteção de rosto (estilo Kakashi Gaiden), colete Jonin. Exceção: madeira **saindo do braço** na conjuração.
- **WebGL**: ramo `Madeira` existente; Shichūrō = 4 pilares em quadrado (variante).

### O7. Zabuza Momochi
- **Fonte**: [Zabuza Momochi](https://naruto.fandom.com/wiki/Zabuza_Momochi) (CONFIRMADO: Névoa, missing-nin; Sete Espadachins; Água; técnicas: Kubikiribōchō, Suirō no Jutsu (Prisão de Água), Suiryūdan, Daibakufu no Jutsu (Grande Cachoeira), Kirigakure no Jutsu, Assassinato Silencioso, clones d'água; reanimado por Kabuto; estreia cap. 10 / ep. 6).
- **Família** `zabuza` · Vila da Névoa · Espadachins (id já na org). BASE Água · Taijutsu (kenjutsu). **Atributos**: 135 · 24 · 5 · 6,8 — papel de Kakashi (125 · 20 · 5 · 7,0).

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `zabuza` · **Demônio da Névoa** | 1 | Parte I — País das Ondas (vs Kakashi) | `U.kubikiribocho` **Lâmina Kubikiribōchō** Taijutsu · Neutro · Cone · ×1,3 · `L+.esconderijoNevoa` · `L.dragaoAgua` · `U.prisaoAgua` **Prisão de Água** (Suirō no Jutsu) Ninjutsu · Água · Área · ×1,3 · Paralisar | **Grande Cachoeira** (Suiton: Daibakufu no Jutsu) | **Demônio da Névoa** · +10 pontos de crítico; críticos dentro da névoa causam +25% |
| `zabuza-edo` · **Edo Tensei** | 15 | Shippuden — Quarta Guerra (vs Kakashi, com Haku) | `U.kubikiribocho` · `L+.esconderijoNevoa` · `L.dragaoAgua` · `U.assassinato` **Assassinato Silencioso** (Silent Killing) Taijutsu · Neutro · Linha · ×1,7 | **Último Golpe do Demônio** (nome de jogo) | **Espadachim Reanimado** · +12 crítico, +30% dano crítico |

- "Prisão de Água" também é de Kisame → se Kisame entrar (Onda 2), mover para `L` (PERGUNTA 8).
- **Buff**: *Demônio da Névoa* — +5 pontos de crítico. **Entrada**: `zabuza` — `nevoa`, Genin, 2 min, 220, `requires: ['haku']`, "O Demônio da Névoa". v2 `playWith`, `nevoa`, Jonin, 5 min, 650. Guardião: zona 1 da Névoa ("Ponte de Tazuna").
- **Arte**: faixas na boca, sem camisa com cinto cruzado, **espada gigante nas costas** (v1) e rachaduras de Edo (v2). Exceção: golpe de espada larga (pose própria de corte horizontal); caminhada com a espada nas costas.
- **WebGL**: Prisão = **novo** (esfera d'água ao redor do alvo); Cachoeira = ramo `Água` em Onda grande.

### O8. Haku
- **Fonte**: [Haku](https://naruto.fandom.com/wiki/Haku) (CONFIRMADO: Névoa, mercenário; Clã Yuki; **Gelo (Hyōton)** Kekkei Genkai, Vento, Água; técnicas: Makyō Hyōshō (Espelhos Demoníacos de Gelo Cristalino), Sensatsu Suishō (Mil Agulhas de Água da Morte), senbon, Lanças de Gelo (Certain-Kill Ice Spears); estreia cap. 15 / ep. 9).
- **Família** `haku` · Vila da Névoa · Clã Yuki. BASE Água (ou Gelo — PERGUNTA 4/5) · Ninjutsu. **Atributos**: 115 · 19 · 3 · 7,1 — papel de Hinata (130 · 19 · 6 · 6,7), mais rápido e frágil.

| Versão | Forma | Arco | Kit | Ultimate | Passiva |
|---|---|---|---|---|---|
| `haku` · **Caçador-nin** | 1 | Parte I — País das Ondas (vs Naruto e Sasuke) | `L.senbon` · `L.agulhasAgua` · `U.milAgulhas` **Mil Agulhas de Água da Morte** (Sensatsu Suishō) Ninjutsu · Água · Área · ×1,4 · `U.espelhosGelo` **Espelhos Demoníacos de Gelo** (Makyō Hyōshō) Ninjutsu · Gelo (Água+Vento) · Órbita · ×1,6 · Lentidão | **Lanças de Gelo** (Certain-Kill Ice Spears — conferir se é só anime) | **Sangue Yuki** · 8% de chance de congelar (Lentidão forte) e +8 pontos de evasão |

- Versão única (o Haku reanimado não mostra técnicas novas). **Itens**: "Espelho de Gelo de Haku" e "Pergaminho Hyoton" continuam itens; Haku jogável não altera esses itens, mas ganha sinergia temática (PROPOSTO: Haku com o Espelho na bolsa +10% dano de Gelo).
- **Buff**: *Gelo Protetor* — +5 pontos de evasão. **Entrada**: `nevoa`, Genin, 1 min, 160, `requires: ['kakashi']`, "O Menino da Máscara".
- **Arte**: máscara de caçador da Névoa (v1, retirável na Ultimate), cabelo longo preso, quimono verde. Exceção: **espelhos de gelo** em círculo (efeito, não sprite) e arremesso de senbon (pose de arremesso do Naruto Academia).
- **WebGL**: **novo** — painéis de gelo azul-claros em órbita; agulhas reusam `Senbon`.

---

## 4C. Ondas 2, 3 e 4 — fichas curtas

Formato: versões (forma) · vila · BASE · escola · únicas candidatas (CONFIRMADAS na seção *Abilities*) · papel/atributos de referência · observação.

### Onda 2 — Akatsuki, Kabuto, Kimimaro
| Personagem (fonte) | Versões | Vila · BASE · escola | Únicas candidatas | Papel (comparar) | Observações |
|---|---|---|---|---|---|
| [Deidara](https://naruto.fandom.com/wiki/Deidara) | Akatsuki (1) | Pedra/Akatsuki · **Explosão** (Terra+Raio) · Ninjutsu | Argila Explosiva C1, C2 (dragão), C3, C0 | Temari (área) | Kekkei Genkai Explosão; exige pássaro de argila (voo) |
| [Sasori](https://naruto.fandom.com/wiki/Sasori) | Akatsuki/Hiruko (1) · Escorpião Vermelho (15) | Areia/Akatsuki · Neutro · Taijutsu (marionetes) | Marionete do 3º Kazekage (Areia de Ferro), Cem Marionetes, Oito Ondas de Agulhas | Kankuro | Absorve o 3º Kazekage como técnica (PERGUNTA 2) · **Kuroari pronta (rodada 41)**: a entidade escorpião de `src/scene/kuroari.ts` + folhas `kuroari-1-*` já existem (hoje no kit do Kankuro) — ao criar o Sasori, basta a técnica dele se chamar “Kuroari” (ou reutilizar o branch) para o escorpião aparecer quando ele castar |
| [Kisame Hoshigaki](https://naruto.fandom.com/wiki/Kisame_Hoshigaki) | Akatsuki (1, já na Parte I) · Fusão Samehada (15) | Névoa/Akatsuki · Água · Taijutsu | Samehada, Cinco Tubarões Famintos, Prisão de Água dos Tubarões, Onda Explosiva de Colisão | Guy (tanque) | Espadachim; Prisão de Água compartilhada com Zabuza |
| [Hidan](https://naruto.fandom.com/wiki/Hidan) | Akatsuki (1) | Fontes Termais/Akatsuki · Neutro · Taijutsu | Ritual de Jashin (Death Controlling Possessed Blood), foice tripla | Lee (glass cannon) | Imortal: passiva de "sobrevive com 1 HP" |
| [Kakuzu](https://naruto.fandom.com/wiki/Kakuzu) | Akatsuki (1) | Cachoeira/Akatsuki · Terra · Ninjutsu | Jiongu (cinco corações), Fogo: Zukokku, Raio: Gian, Vento: Atsugai | Pain | Ativa a sinergia Cachoeira; 5 corações = 5 elementos |
| [Konan](https://naruto.fandom.com/wiki/Konan) | Akatsuki (1) | Chuva/Akatsuki · Vento · Ninjutsu | Dança do Shikigami, Shuriken de Papel, Técnica do Anjo de Papel | Temari | Ativa a vila da Chuva com Pain |
| [Obito Uchiha](https://naruto.fandom.com/wiki/Obito_Uchiha) | Genin (1, Kakashi Gaiden) · Tobi/Akatsuki (15) · Jinchūriki do Dez-Caudas (30) | Folha/Akatsuki · Fogo · Ninjutsu | Bola de Fogo (L), Kamui, Mokuton, Bastão Gunbai/Esferas | Madara | "Desde a academia" com histórico real (Kakashi Gaiden) |
| [Kabuto Yakushi](https://naruto.fandom.com/wiki/Kabuto_Yakushi) | Genin espião (1) · Som (15) · Modo Sábio do Dragão (30) | Folha/Som/Akatsuki · Terra · Ninjutsu | Bisturi de Chakra/Palma Mística, Edo Tensei, Senjutsu: Muki Tensei, Templo do Nirvana (genjutsu) | Orochimaru | Sábio (SAGE_USERS); tema Edo Tensei |
| [Kimimaro](https://naruto.fandom.com/wiki/Kimimaro) | Som (1) | Som · Neutro · Taijutsu | Dança do Salgueiro / Camélia / Lariço / Clematite / Broto de Samambaia (Shikotsumyaku) | Lee | Kekkei Genkai de ossos; selo amaldiçoado da Terra |

### Onda 3 — elenco de apoio
| Personagem | Versões | Vila · BASE · escola | Únicas candidatas | Observações |
|---|---|---|---|---|
| [Suigetsu Hōzuki](https://naruto.fandom.com/wiki/Suigetsu_H%C5%8Dzuki) | Taka (1) | Névoa/Taka · Água · Taijutsu | Kubikiribōchō (herdada), Hidrificação, Grande Braço d'Água | Kubikiribōchō vira compartilhada com Zabuza? (PERGUNTA 8) |
| [Karin](https://naruto.fandom.com/wiki/Karin) | Taka (1) | Grama/Som · Terra · Ninjutsu | Correntes de Chakra Adamantinas, mordida de cura | Uzumaki; médica (cura/coleta); ativa vila da Grama |
| [Jūgo](https://naruto.fandom.com/wiki/J%C5%ABgo) | Taka (1) | Som · Vento · Taijutsu | Transformação do Clã de Jūgo, Selo Amaldiçoado | "Sage" na infobox → candidato a SAGE_USERS |
| [Konohamaru Sarutobi](https://naruto.fandom.com/wiki/Konohamaru_Sarutobi) | **Academia** (1) · Genin (15) | Folha · Fogo · Ninjutsu | Jutsu Sexy/Kage Bunshin (Academia), Rasengan (L) | Único com fase Academia real com combate (comédia) |
| [Kurenai Yūhi](https://naruto.fandom.com/wiki/Kurenai_Y%C5%ABhi) | Jonin (1) | Folha · Sombra · Genjutsu | Genjutsu da Árvore (Demonic Illusion: Tree Binding Death) | Time 8; Clã Sarutobi (infobox) |
| [Anko Mitarashi](https://naruto.fandom.com/wiki/Anko_Mitarashi) | Tokubetsu Jonin (1) | Folha · Fogo (anime) · Ninjutsu | Mãos de Serpentes Ocultas | Ex-aluna de Orochimaru |
| [Shizune](https://naruto.fandom.com/wiki/Shizune) | Jonin (1) | Folha · Neutro · Ninjutsu | Agulhas envenenadas, Névoa Venenosa (L.nevoa) | Médica (cura/coleta) |
| [Chiyo](https://naruto.fandom.com/wiki/Chiyo) | Conselheira (1) | Areia · Neutro · Taijutsu | Pais Sábios (Chikamatsu), Cem Marionetes, Reanimação de Um Só Corpo | Médica; "Honoured Siblings" |
| [Darui](https://naruto.fandom.com/wiki/Darui) | Jonin (1) | Nuvem · **Tempestade** (Raio+Água) · Ninjutsu | Laser Circus (Ranton), Relâmpago Negro | 5º Raikage só depois da guerra |
| [Kurotsuchi](https://naruto.fandom.com/wiki/Kurotsuchi) | Jonin (1) | Pedra · **Lava** · Ninjutsu | Cal Viva (Yōton) | 4ª Tsuchikage só depois da guerra |
| [Chōjūrō](https://naruto.fandom.com/wiki/Ch%C5%8Dj%C5%ABr%C5%8D) | Jonin (1) | Névoa · Água (anime) · Taijutsu | Hiramekarei | Espadachim; 6º Mizukage só depois da guerra |

### Onda 4 — NPC / guardião não jogável / opcional
Quatro do Som ([Jirōbō](https://naruto.fandom.com/wiki/Jir%C5%8Db%C5%8D), [Kidōmaru](https://naruto.fandom.com/wiki/Kid%C5%8Dmaru), [Sakon e Ukon](https://naruto.fandom.com/wiki/Sakon_and_Ukon), [Tayuya](https://naruto.fandom.com/wiki/Tayuya)) como mini-chefes do Som; jinchūriki ([Yugito](https://naruto.fandom.com/wiki/Yugito_Nii), [Rōshi](https://naruto.fandom.com/wiki/R%C5%8Dshi) Lava, [Han](https://naruto.fandom.com/wiki/Han) Vapor, [Utakata](https://naruto.fandom.com/wiki/Utakata), [Fū](https://naruto.fandom.com/wiki/F%C5%AB)) como **portadores** das bijū já existentes (ex.: o jinchūriki aparece antes da fera no fim da run); [Mifune](https://naruto.fandom.com/wiki/Mifune) (samurai, País do Ferro), [Hanzō](https://naruto.fandom.com/wiki/Hanz%C5%8D) (Chuva), [Kinkaku](https://naruto.fandom.com/wiki/Kinkaku)/[Ginkaku](https://naruto.fandom.com/wiki/Ginkaku), [Mangetsu](https://naruto.fandom.com/wiki/Mangetsu_H%C5%8Dzuki) e espadachins, [Ao](https://naruto.fandom.com/wiki/Ao) (Byakugan), [Shisui](https://naruto.fandom.com/wiki/Shisui_Uchiha) (já planejado como NPC), Zetsu (inimigo de horda), Pakura (Calor) e Gari (Explosão).

---

## 5. Elementos e sistemas que o jogo ainda não tem

Hoje `Element = Neutro | Fogo | Água | Vento | Terra | Raio | Madeira | Areia | Sombra | Sábio` (heroes.ts). Cada elemento tem cor em `colors`, pergaminho em `catalog.ts` (`el-fire`…), chave de bônus (`elFogo`…), `ELEMENT_KEY`/partículas em `GameCanvas.tsx`/`particleFx.ts`, ramo em `techniqueEffects.ts` e checagens em `scripts/verify-rules.mjs`. A técnica **já aceita `secondaryElement`** (usado pela fusão de técnicas e pelas partículas).

| Natureza (CONFIRMADO) | Quem usa | Opção A — mapear (sem tipo novo) | Opção B — elemento novo |
|---|---|---|---|
| Lava (Yōton) | Mei, Kurotsuchi, Rōshi | `Terra` + `secondaryElement: Fogo` (queima) | `Lava` (cor `#e0662c`), pergaminho Yōton |
| Vapor (Futton) | Mei, Han | `Fogo` + `secondaryElement: Água` (veneno/lentidão) | `Vapor` |
| Poeira (Jinton, Kekkei Tōta) | Mū, Ōnoki | `Terra` + `secondaryElement: Vento` (e Fogo visual) | `Poeira` |
| Ímã (Jiton) | Rasa, 3º Kazekage (e Gaara) | `Areia` (**já é a conversão usada no Gaara**) | — (manter Areia) |
| Gelo (Hyōton) | Haku | `Água` + `secondaryElement: Vento` (Lentidão) | `Gelo` (há o item "Pergaminho Hyoton", hoje só efeito de lentidão) |
| Explosão (Bakuton) | Deidara, Gari | `Terra` + `secondaryElement: Raio` | `Explosão` |
| Tempestade (Ranton) | Darui | `Raio` + `secondaryElement: Água` | `Tempestade` |
| Calor (Shakuton) | Pakura | `Fogo` + `secondaryElement: Vento` | `Calor` |
| Tinta, insetos, marionetes, ossos, papel | Sai/B, Shino, Sasori/Chiyo, Kimimaro, Konan | **Não são naturezas** → `Neutro` (como Kankuro hoje) | — |
| Edo Tensei | Kabuto (e versões "Edo Tensei") | **Não é elemento** → título de versão + tema de evento | — |

**Recomendação (PROPOSTO): Opção A** — custo baixo, nenhuma migração de save, sem novos pergaminhos/sinergias; a identidade vem do efeito visual e do status. Opção B dá pergaminhos e bônus de afinidade próprios, mas toca ~8 arquivos e o validador. **PERGUNTA 4.**
Consequência para o elemento BASE (`heroAffinity`): com a opção A, Mei = Água, Ōnoki/Mū = Terra, Haku = Água, Deidara = Terra. Com a B, a base seria a Kekkei Genkai. **PERGUNTA 5.**

### Outros sistemas exigidos
1. **Acompanhante** (Akamaru; opcionalmente Enma): sprite que segue o herói com caminhada própria — não existe hoje.
2. **Escala de sprite durante técnica** (Expansão do Chōji; Golem é efeito).
3. **Levitação persistente** (Ōnoki, Mū): estender a flutuação breve do Gaara para voo longo + repouso sem ancorar os pés.
4. **Aura de buff por atlas** para a Armadura de Raio (mesmo mecanismo da aura do Modo Sábio).
5. **Invisibilidade** (Mū): opacidade do sprite durante o buff (gameplay = evasão/crítico; inimigos continuam mirando).
6. **Reflexão** (Yagura): reaproveitar o "espinhos" já existente no pipeline de dano (`GameCanvas.tsx`).
7. **Ressurreição** (Danzō/Izanagi): reaproveitar `revive35` (item Pergaminho de Ressurreição).
8. **Guardião/NPC não jogável**: hoje `guardians` em `maps.ts`/`missions.ts` só aceita ids de jogáveis; Kages sem material e mini-chefes da Onda 4 precisariam de um tipo "guardião NPC" (ou só aparecem como retrato/estátua).
9. **Mapa Vila da Nuvem** (`MapId` novo, País do Relâmpago, 雲): Raikage, 3º Raikage, Killer B, Darui. Sem ele, usar `pedra` provisoriamente.
10. **Mudanças na biblioteca compartilhada**: novas `L+` (§4) e possíveis migrações U→L (Palma Mística, Bijūdama, Prisão de Água, Kubikiribōchō).
11. **Tela de seleção** com 100+ versões: agrupar por família (versões recolhidas), filtros por vila/organização — já existe filtro por organização; precisa de paginação/grupo.

---

## 6. Tamanho do trabalho, ordem e riscos (PROPOSTO)

| Onda | Famílias | Versões | Únicas novas | `L+` novas | Folhas de sprite (caminhada 4×2 + ação 4×4 por versão) + retratos | Efeitos WebGL novos | Sistemas novos |
|---|---|---|---|---|---|---|---|
| K | 11 (Hiruzen, Rasa, Mei, Ōnoki, Raikage, 3º Raikage, Mū, Gengetsu, Yagura, Killer B, Danzō) | 16 | 26 | 5 | 32 folhas + 16 retratos (+1 atlas de aura de raio) | ~11 (Enma, 5 Liberações, Pó de Ouro, Lava, Vapor, Jinton, Golem, Relâmpago Negro, Espelho d'Água, Tirania do Vapor, Baku) | levitação, aura, invisibilidade, reflexão, revive, mapa Nuvem |
| 1 | 8 (Kiba, Shino, Ino, Chōji, Sai, Yamato, Zabuza, Haku) | 15 | 22 | 1 (`cloneTinta`) | 30 folhas + 15 retratos (+ Akamaru 2 folhas) | ~8 (broca Gatsūga, enxame, Nikudan, Borboleta, bestas de tinta, 4 Pilares, Prisão de Água, espelhos de gelo) | acompanhante, escala de sprite |
| 2 | 9 | 15 | ~25 | 1–2 | 30 + 15 | ~10 (argila/explosão, marionetes, tubarões, papel…) | voo (Deidara), Edo Tensei como tema |
| 3 | 12 | 13 | ~20 | — | 26 + 13 | ~6 | — |
| **Total K–3** | **40** | **59** | **~93** | **~8** | **118 folhas + 59 retratos** | **~35** | — |

Elenco resultante: **24 → 64 famílias e 56 → 115 versões** (só K–3; a Onda 4 não entra na seleção).

**Ordem recomendada**: (1) decisões da §8; (2) sistemas de base: `L+` novas e mapeamento de elementos (§5), tipo de guardião NPC; (3) **Onda K em 3 blocos**: Cúpula dos Cinco Kage (Mei, Ōnoki, Raikage + Killer B) → Hokage/Areia (Hiruzen, Rasa, Danzō) → Kages reanimados (Mū, Gengetsu, 3º Raikage, Yagura); (4) mapa Vila da Nuvem; (5) Onda 1 (Ondas → País das Ondas primeiro: Haku/Zabuza; depois Time 8/10; Sai/Yamato); (6) Ondas 2 e 3. Cada personagem só fecha com repouso/caminhada/ataque/pulo/dash testados em cada versão e como ajudante (`movimentar-shinobi`), `tsc -b`, build, `verify-rules` e `verify-runtime`.

**Riscos**
- **Volume de arte** é o gargalo: 118 folhas + 59 retratos; hoje ainda há folhas pendentes no elenco atual (Kushina 1, revisões de Neji/Sasuke/Naruto — docs/13).
- **Balanceamento**: Raikage/Killer B/Chōji (tanques de taijutsu) e Ōnoki/Mū (Jinton de alto dano) podem quebrar a curva de dificuldade recém-endurecida (rodada 34). Balanceamento atual ainda não medido em run real.
- **Sinergias**: Nuvem/Névoa/Pedra passam a ter membros; a faixa de 5 da Nuvem (+20% dano, +5% vel. de ataque) pode ficar forte com 4 Raikage/B/Darui.
- **Validador**: `verify-rules` conta 56 versões/97 técnicas/95 itens — os números esperados mudam.
- **Pool/planejamento**: a regra dos 40% de técnicas aprendíveis por shinobi escala com o elenco (decisão de 06/11), mas o pool por vila cresce muito na Folha.
- **Seleção**: 115 versões exigem agrupamento por família.
- **Nomes repetidos**: Ultimates e únicas não podem colidir (Selo do Ceifador, Floresta Profunda, Corais da Três Caudas, Nuvem de Tinta — todos tratados acima).

---

## 7. PERSONAGENS QUE VOU CRIAR (lista enxuta)

| Personagem | Versões (forma) | Vila | Papel | Onda |
|---|---|---|---|---|
| Hiruzen Sarutobi (3º Hokage) | Professor (1) · Edo Tensei (15) | Folha | Ninjutsu de área / versátil | K |
| Rasa (4º Kazekage) | Kazekage (1) | Areia | Controle (Pó de Ouro) | K |
| Mei Terumī (5ª Mizukage) | Mizukage (1) · Aliança (15) | Névoa | Ninjutsu de área / corrosão | K |
| Ōnoki (3º Tsuchikage) | Tsuchikage (1) · Aliança (15) | Pedra | Ninjutsu de alto dano / móvel (voa) | K |
| A (4º Raikage) | Raikage (1) · Aliança (15) | Nuvem | Taijutsu veloz | K |
| A (3º Raikage) | Edo Tensei (1) — lendário | Nuvem | Tanque taijutsu | K |
| Mū (2º Tsuchikage) | Edo Tensei (1) | Pedra | Assassino (invisível) | K |
| Gengetsu Hōzuki (2º Mizukage) | Edo Tensei (1) | Névoa | Ninjutsu de Água / evasão | K |
| Yagura Karatachi (4º Mizukage) | Mizukage (1) | Névoa | Tanque / reflexão | K |
| Killer B | Jinchūriki (1) · Modo Bijū (15) | Nuvem | Taijutsu / jinchūriki | K |
| Danzō Shimura (candidato a Hokage) | Raiz (1) | Folha | Ninjutsu de Vento / revive | K |
| Kiba Inuzuka + Akamaru | Genin (1) · Chunin (15) | Folha | Taijutsu rápido / coleta | 1 |
| Shino Aburame | Genin (1) · Chunin (15) | Folha | Veneno / controle | 1 |
| Ino Yamanaka | Genin (1) · Chunin (15) | Folha | Genjutsu mental / médica | 1 |
| Chōji Akimichi | Genin (1) · Chunin (15) · Modo Borboleta (30) | Folha | Tanque taijutsu | 1 |
| Sai | Raiz (1) · Aliança (15) | Folha | Projéteis (tinta) | 1 |
| Yamato | Time Kakashi (1) | Folha | Controle Mokuton / anti-bijū | 1 |
| Zabuza Momochi | Demônio da Névoa (1) · Edo Tensei (15) | Névoa | Crítico / kenjutsu | 1 |
| Haku | Caçador-nin (1) | Névoa | Controle de gelo / evasão | 1 |
| Deidara | Akatsuki (1) | Pedra | Área explosiva | 2 |
| Sasori | Hiruko (1) · Escorpião Vermelho (15) | Areia | Marionetes / veneno | 2 |
| Kisame Hoshigaki | Akatsuki (1) · Fusão Samehada (15) | Névoa | Tanque de Água | 2 |
| Hidan | Akatsuki (1) | Fontes Termais | Glass cannon imortal | 2 |
| Kakuzu | Akatsuki (1) | Cachoeira | Multielemento | 2 |
| Konan | Akatsuki (1) | Chuva | Projéteis de papel | 2 |
| Obito Uchiha | Genin (1) · Tobi (15) · Jinchūriki do Dez-Caudas (30) | Folha | Ninjutsu / espaço-tempo | 2 |
| Kabuto Yakushi | Genin espião (1) · Som (15) · Modo Sábio (30) | Folha/Som | Médico / Sábio | 2 |
| Kimimaro | Som (1) | Som | Taijutsu de ossos | 2 |
| Suigetsu · Karin · Jūgo | Taka (1) cada | Névoa · Grama · Som | Taijutsu · médica · berserker | 3 |
| Konohamaru Sarutobi | Academia (1) · Genin (15) | Folha | Ninjutsu | 3 |
| Kurenai · Anko · Shizune | 1 cada | Folha | Genjutsu · Ninjutsu · médica | 3 |
| Chiyo | Conselheira (1) | Areia | Marionetes / médica | 3 |
| Darui · Kurotsuchi · Chōjūrō | Jonin (1) cada | Nuvem · Pedra · Névoa | Tempestade · Lava · espadachim | 3 |
| Reto, Shamon, 3º Kazekage, Byakuren, 3º Mizukage, Ishikawa, 1º e 2º Raikage | — | — | **NPC/retrato/guardião** (pouco material) | 4 |
| Quatro do Som, jinchūriki, Mifune, Hanzō, Kinkaku/Ginkaku, espadachins, Ao, Shisui, Zetsu | — | — | NPC/guardião/inimigo | 4 |

---

## 8. PERGUNTAS para o usuário (responder antes de começar)

1. **Kages com pouco material** (Reto, Shamon, Byakuren, 3º Mizukage, Ishikawa, 1º e 2º Raikage): ficam só como **retrato/estátua/NPC** (recomendado), viram guardiões não jogáveis, ou quer jogáveis com kit em grande parte inventado?
2. **3º Kazekage**: guardião não jogável, técnica/marionete do Sasori (Onda 2), ou jogável curto (só Areia de Ferro)?
3. **Killer B e Danzō** entram na onda dos Kages (como proposto) ou vão para a Onda 1/2?
4. **Kekkei Genkai** (Lava, Vapor, Poeira, Gelo, Explosão, Tempestade, Calor): Opção A — mapear para elementos existentes com `secondaryElement` (recomendado) — ou Opção B — elementos novos com pergaminhos e sinergias próprias?
5. **Elemento BASE** de Mei/Ōnoki/Mū/Haku: elemento simples (Água/Terra) ou a Kekkei Genkai (depende da 4)?
6. **Mapa Vila da Nuvem**: criar junto com a Onda K (recomendado) ou usar a Pedra provisoriamente?
7. **Ordem das ondas**: K → 1 → 2 → 3 está boa? Algum personagem que quer antes?
8. **Biblioteca compartilhada**: posso mover para `L` as técnicas de vários usuários canônicos (Palma Mística, Bijūdama, Prisão de Água, Kubikiribōchō) e criar as `L+` propostas? E o **Selo do Ceifador** (Hiruzen e Minato): repetir o nome como Ultimate ou manter só no Minato?
9. **Versões Edo Tensei/fases extras**: aceitar "Edo Tensei" como versão própria (Hiruzen, Zabuza)? Incluir fases com pouco combate (Hiruzen jovem, Yamato ANBU, Rasa Edo) ou deixar de fora? E quer que eu proponha também as **fases que faltam no elenco atual** (ex.: Kakashi criança/Gaiden, Minato Genin, Guy Genin, Itachi criança)?
10. **Técnicas só do anime** (filler): contam? (ex.: vento do Yagura, Lobo de Três Cabeças do Kiba, Lanças de Gelo do Haku, abelhas do Ishikawa).
11. **Nagato × Pain**: a org Uzumaki já lista `nagato` além de `pain`. Nagato vira versão do Pain (ex.: "Nagato Edo Tensei") ou fica fora?
12. **Iruka e Ebisu** continuam NPC (recomendado)? **Darui/Kurotsuchi/Chōjūrō** sem versão Kage (pós-Shippuden) está ok?
13. **Organizações novas** propostas: Cinco Kage, Família do Kazekage, Linhagem do Tsuchikage, Dupla A–B, Jinchūriki, Raiz, Clã Sarutobi, Clã Hōzuki — aprova (valores de bônus serão PROPOSTOS depois)?
14. **Tela de seleção** com 115 versões: agrupar versões dentro da família (recomendado)?
15. **Atributos/passivas**: os números deste documento são só ponto de partida — prefere que eu calibre depois da medição de balanceamento em run real (pendência viva) antes de liberar as ondas?

---
*Registro: proposta gerada em 12/11/2026 a pedido do usuário; nenhuma alteração de código, arte ou documentação existente. Na rodada de implementação (após a validação), registrar o pedido integral e a resposta em docs/14, o resumo/direção em docs/18, a fila em docs/13 e o CHANGELOG, conforme a skill `documentar-projeto`.*
