# Cobertura das vistas de caminhada · 14/11/2026

O controlador usa cinco vistas e quatro quadros por vista nas **114 versões selecionáveis**. W exibe costas e S, frente. A e D usam a vista em perfil. WD e WA usam três quartos de costas, SD e SA, três quartos de frente. A, WA e SA espelham o recorte correspondente e a transição conserva a fase da caminhada.

Os Mega Elites e os ajudantes que usam essas versões consultam as mesmas folhas. Quatro modelos de inimigo comum passaram a usar perfil na perseguição lateral, além das vistas dianteira e traseira que já usavam. Akamaru e Kuri têm ciclos próprios. O retrato da seleção e da ficha usa a vista em perfil da mesma versão.

O dash acompanha o vetor e o lado das oito direções, com quatro fases de frente e de costas. A arte de perfil dedicada do dash está no Naruto Academia. Para as demais versões o dash e o pulo continuam apoiados nas vistas frontal e traseira. A aprovação visual dos ângulos, poses e transições em partida está pendente conforme a [política de testes](TESTING_POLICY.md).

A corrida é a animação do deslocamento normal das 114 versões. As mesmas entradas escolhem as cinco vistas dos atlas `corrida-01.png` a `corrida-57.png` em `public/assets/shinobi-motion`. A associação por versão fica em `src/game/runningArt.ts`. A tabela abaixo indica as folhas de caminhada usadas como referência de identidade e disponíveis durante o carregamento.

As imagens de corrida foram geradas com ImageGen usando retrato e quadros do próprio jogo como modelos. O pedido por dupla de versões foi uma grade 4 × 10 transparente, com tronco inclinado, braços para trás e quatro fases das pernas, preservando traje, cabelos e acessórios nas cinco vistas. Após a seleção, cada quadro foi recortado a partir dos vãos da folha original e ancorado pela base.

A partir de 24/11/2026, Haku e Hanzō têm atlas chibi dedicados. `*-chibi-v3.png` guarda a caminhada reta, o repouso de três quartos e as fases de ataque. `*-chibi-run-v1.png` usa cinco vistas de corrida. `*-chibi-acrobatics-v1.png` tem pulo de frente e costas, seguido de dash de frente e costas, com quatro quadros em cada fila.

Linhas das folhas começam em zero. A suíte em `tests/movimento.test.mjs` inspeciona os recortes efetivamente usados pelo controlador, os quatro quadros, o espelho e a margem transparente das células dos 26 atlas dedicados. Os atlas foram repaginados a partir dos originais para evitar recorte e vazamento da fileira vizinha.

| Versão | S/W · frente/costas | A/D · perfil | Diagonais · frente/costas |
| --- | --- | --- | --- |
| naruto | naruto-academia-cardinal-v2.png · 0/1 | naruto-academia-cardinal-v2.png · 2 | naruto-academia-diagonal-v1.png · 0/1 |
| gaara | walk-cardinal-1.png · 0/1 | walk-side-1.png · 0 | gaara-1-motion-v3.png · 0/1 |
| madara | walk-cardinal-6.png · 0/1 | walk-side-4.png · 0 | madara-walk-v1.png · 0/1 |
| hashirama | walk-cardinal-6.png · 6/7 | walk-side-4.png · 3 | hashirama-walk-v1.png · 0/1 |
| sasuke | walk-cardinal-1.png · 2/3 | walk-side-1.png · 3 | sasuke-classico-motion-v1.png · 0/1 |
| sakura | walk-cardinal-1.png · 4/5 | walk-side-1.png · 6 | sakura-classico-motion-v1.png · 0/1 |
| kakashi | walk-cardinal-3.png · 0/1 | walk-side-2.png · 1 | kakashi-walk-v1.png · 0/1 |
| itachi | walk-cardinal-3.png · 4/5 | walk-side-2.png · 3 | itachi-walk-v1.png · 0/1 |
| minato | walk-cardinal-7.png · 0/1 | walk-side-5.png · 0 | minato-walk-v1.png · 0/1 |
| tsunade | walk-cardinal-7.png · 4/5 | walk-side-5.png · 2 | tsunade-walk-v1.png · 0/1 |
| jiraiya | walk-cardinal-8.png · 0/1 | walk-side-5.png · 5 | jiraiya-walk-v1.png · 0/1 |
| orochimaru | walk-cardinal-8.png · 4/5 | walk-side-9.png · 0 | orochimaru-walk-v1.png · 0/1 |
| lee | walk-cardinal-2.png · 0/1 | walk-side-3.png · 2 | lee-walk-v1.png · 0/1 |
| neji | walk-cardinal-2.png · 2/3 | walk-side-3.png · 5 | neji-walk-v1.png · 0/1 |
| hinata | walk-cardinal-2.png · 4/5 | walk-side-7.png · 0 | hinata-walk-v1.png · 0/1 |
| shikamaru | walk-cardinal-5.png · 8/9 | walk-side-8.png · 2 | shikamaru-walk-v1.png · 0/1 |
| temari | walk-cardinal-10.png · 6/7 | walk-side-7.png · 6 | temari-walk-v1.png · 0/1 |
| tenten | walk-cardinal-2.png · 8/9 | walk-side-7.png · 4 | tenten-walk-v1.png · 0/1 |
| pain | walk-cardinal-12.png · 2/3 | walk-side-10.png · 0 | pain-walk-v1.png · 0/1 |
| tobirama | walk-cardinal-8.png · 8/9 | walk-side-5.png · 7 | tobirama-walk-v1.png · 0/1 |
| kankuro | walk-cardinal-2.png · 6/7 | walk-side-8.png · 5 | kankuro-1-walk-v1.png · 0/1 |
| guy | walk-cardinal-9.png · 4/5 | walk-side-3.png · 4 | guy-walk-v1.png · 0/1 |
| kushina | walk-cardinal-12.png · 0/1 | walk-side-4.png · 5 | kushina-walk-v1.png · 0/1 |
| asuma | walk-cardinal-3.png · 8/9 | walk-side-8.png · 0 | asuma-motion-v1.png · 0/1 |
| hiruzen | hiruzen-roster-v1.png · 0/1 | walk-side-13.png · 0 | hiruzen-directional-v2.png · 0/1 |
| raikage-terceiro | raikage-terceiro-roster-v1.png · 0/1 | walk-side-11.png · 0 | raikage-terceiro-directional-v2.png · 0/1 |
| raikage-quarto | raikage-quarto-roster-v1.png · 0/1 | walk-side-11.png · 1 | raikage-quarto-directional-v2.png · 0/1 |
| killer-b | killer-b-roster-v1.png · 0/1 | walk-side-11.png · 2 | killer-b-directional-v2.png · 0/1 |
| onoki | onoki-roster-v1.png · 0/1 | walk-side-11.png · 3 | onoki-directional-v2.png · 0/1 |
| ao | ao-roster-v1.png · 0/1 | walk-side-11.png · 7 | ao-directional-v2.png · 0/1 |
| rasa | rasa-roster-v1.png · 0/1 | walk-side-11.png · 4 | rasa-directional-v2.png · 0/1 |
| hanzo | hanzo-chibi-v3.png · 0/1 | hanzo-chibi-run-v1.png · 2 | hanzo-chibi-run-v1.png · 3/4 |
| mei | mei-roster-v1.png · 0/1 | walk-side-11.png · 5 | mei-directional-v2.png · 0/1 |
| gengetsu | gengetsu-roster-v1.png · 0/1 | walk-side-11.png · 6 | gengetsu-directional-v2.png · 0/1 |
| choji | choji-roster-v1.png · 0/1 | sakumo-choji-lateral-v1.png · 1 | choji-directional-v2.png · 0/1 |
| kiba | kiba-roster-v1.png · 0/1 | walk-side-12.png · 0 | kiba-directional-v2.png · 0/1 |
| shino | shino-roster-v1.png · 0/1 | walk-side-12.png · 2 | shino-directional-v2.png · 0/1 |
| ino | ino-roster-v1.png · 0/1 | walk-side-12.png · 4 | ino-directional-v2.png · 0/1 |
| kurenai | kurenai-roster-v1.png · 0/1 | walk-side-12.png · 6 | kurenai-directional-v2.png · 0/1 |
| iruka | iruka-roster-v1.png · 0/1 | walk-side-8.png · 1 | iruka-directional-v2.png · 0/1 |
| sai | sai-roster-v1.png · 0/1 | walk-side-10.png · 6 | sai-directional-v2.png · 0/1 |
| yamato | yamato-roster-v1.png · 0/1 | walk-side-10.png · 7 | yamato-directional-v2.png · 0/1 |
| shisui | shisui-roster-v1.png · 0/1 | walk-side-10.png · 5 | shisui-directional-v2.png · 0/1 |
| obito | obito-roster-v1.png · 0/1 | walk-side-10.png · 2 | obito-directional-v2.png · 0/1 |
| hiashi | hiashi-roster-v1.png · 0/1 | walk-side-13.png · 1 | hiashi-directional-v2.png · 0/1 |
| hanabi | hanabi-roster-v1.png · 0/1 | walk-side-13.png · 2 | hanabi-directional-v2.png · 0/1 |
| kisame | kisame-roster-v1.png · 0/1 | walk-side-6.png · 6 | kisame-directional-v2.png · 0/1 |
| zabuza | walk-cardinal-1.png · 6/7 | walk-side-2.png · 5 | zabuza-directional-v2.png · 0/1 |
| suigetsu | suigetsu-roster-v1.png · 0/1 | walk-side-9.png · 7 | suigetsu-directional-v2.png · 0/1 |
| mangetsu | mangetsu-roster-v1.png · 0/1 | walk-side-13.png · 5 | mangetsu-directional-v2.png · 0/1 |
| karin | karin-roster-v1.png · 0/1 | walk-side-12.png · 7 | karin-directional-v2.png · 0/1 |
| nagato | nagato-roster-v1.png · 0/1 | walk-side-10.png · 1 | nagato-directional-v2.png · 0/1 |
| sasori | sasori-roster-v1.png · 0/1 | walk-side-6.png · 5 | sasori-directional-v2.png · 0/1 |
| haku | haku-chibi-v3.png · 0/1 | haku-chibi-run-v1.png · 2 | haku-chibi-run-v1.png · 3/4 |
| chiriku | chiriku-roster-v1.png · 0/1 | walk-side-13.png · 4 | chiriku-directional-v2.png · 0/1 |
| sakumo | sakumo-roster-v1.png · 0/1 | sakumo-choji-lateral-v1.png · 0 | sakumo-directional-v2.png · 0/1 |
| deidara | deidara-roster-v1.png · 0/1 | walk-side-6.png · 0 | deidara-directional-v2.png · 0/1 |
| hidan | hidan-roster-v1.png · 0/1 | walk-side-6.png · 1 | hidan-directional-v2.png · 0/1 |
| kakuzu | kakuzu-roster-v1.png · 0/1 | walk-side-6.png · 2 | kakuzu-directional-v2.png · 0/1 |
| konan | konan-roster-v1.png · 0/1 | walk-side-6.png · 3 | konan-directional-v2.png · 0/1 |
| zetsu | zetsu-roster-v1.png · 0/1 | walk-side-6.png · 4 | zetsu-directional-v2.png · 0/1 |
| jugo | jugo-roster-v1.png · 0/1 | walk-side-9.png · 6 | jugo-directional-v2.png · 0/1 |
| kabuto | kabuto-roster-v1.png · 0/1 | walk-side-9.png · 3 | kabuto-directional-v2.png · 0/1 |
| kimimaro | kimimaro-roster-v1.png · 0/1 | walk-side-9.png · 5 | kimimaro-directional-v2.png · 0/1 |
| jirobo | jirobo-roster-v1.png · 0/1 | walk-side-13.png · 6 | jirobo-directional-v2.png · 0/1 |
| kidomaru | kidomaru-roster-v1.png · 0/1 | walk-side-13.png · 7 | kidomaru-directional-v2.png · 0/1 |
| tayuya | tayuya-roster-v1.png · 0/1 | walk-side-14.png · 0 | tayuya-directional-v2.png · 0/1 |
| sakon-ukon | sakon-ukon-roster-v1.png · 0/1 | walk-side-14.png · 1 | sakon-ukon-directional-v2.png · 0/1 |
| dosu | dosu-roster-v1.png · 0/1 | walk-side-14.png · 2 | dosu-directional-v2.png · 0/1 |
| zaku | zaku-roster-v1.png · 0/1 | walk-side-14.png · 3 | zaku-directional-v2.png · 0/1 |
| kin | kin-roster-v1.png · 0/1 | walk-side-14.png · 4 | kin-directional-v2.png · 0/1 |
| juzo | juzo-roster-v1.png · 0/1 | walk-side-6.png · 7 | juzo-directional-v2.png · 0/1 |
| naruto-genin | walk-cardinal-4.png · 0/1 | naruto-classic-cardinal-v2.png · 1 | naruto-classico-motion-v1.png · 0/1 |
| naruto-shippuden | walk-cardinal-4.png · 2/3 | naruto-classic-cardinal-v2.png · 3 | naruto-shippuden-motion-v1.png · 0/1 |
| naruto-kyuubi | walk-cardinal-4.png · 4/5 | naruto-classic-cardinal-v2.png · 5 | naruto-kyuubi-motion-v1.png · 0/1 |
| sasuke-shippuden | walk-cardinal-5.png · 4/5 | walk-side-1.png · 4 | sasuke-shippuden-motion-v1.png · 0/1 |
| sasuke-rinnegan | walk-cardinal-5.png · 6/7 | walk-side-1.png · 5 | sasuke-rinnegan-motion-v1.png · 0/1 |
| sakura-shippuden | walk-cardinal-4.png · 6/7 | walk-side-1.png · 7 | sakura-shippuden-motion-v1.png · 0/1 |
| sakura-byakugou | walk-cardinal-4.png · 8/9 | walk-side-2.png · 0 | sakura-byakugou-motion-v1.png · 0/1 |
| gaara-kazekage | walk-cardinal-5.png · 0/1 | walk-side-1.png · 1 | gaara-15-motion-v3.png · 0/1 |
| gaara-alianca | walk-cardinal-5.png · 2/3 | walk-side-1.png · 2 | gaara-30-motion-v3.png · 0/1 |
| madara-rinnegan | walk-cardinal-6.png · 2/3 | walk-side-4.png · 1 | madara-15-walk-v1.png · 0/1 |
| madara-seis-caminhos | walk-cardinal-6.png · 4/5 | walk-side-4.png · 2 | madara-walk-v1.png · 2/3 |
| hashirama-sabio | walk-cardinal-6.png · 8/9 | walk-side-4.png · 4 | hashirama-20-walk-v1.png · 0/1 |
| kakashi-hokage | walk-cardinal-3.png · 2/3 | walk-side-2.png · 2 | kakashi-walk-v1.png · 2/3 |
| itachi-akatsuki | walk-cardinal-3.png · 6/7 | walk-side-2.png · 4 | itachi-walk-v1.png · 2/3 |
| minato-hokage | walk-cardinal-7.png · 2/3 | walk-side-5.png · 1 | minato-walk-v1.png · 2/3 |
| tsunade-hokage | walk-cardinal-7.png · 6/7 | walk-side-5.png · 3 | tsunade-walk-v1.png · 2/3 |
| tsunade-byakugou | walk-cardinal-7.png · 8/9 | walk-side-5.png · 4 | tsunade-walk-v1.png · 4/5 |
| jiraiya-sabio | walk-cardinal-8.png · 2/3 | walk-side-5.png · 6 | jiraiya-walk-v1.png · 2/3 |
| orochimaru-som | walk-cardinal-8.png · 6/7 | walk-side-9.png · 1 | orochimaru-15-walk-v1.png · 0/1 |
| lee-shippuden | walk-cardinal-9.png · 0/1 | walk-side-3.png · 3 | lee-walk-v1.png · 2/3 |
| lee-portoes | walk-cardinal-9.png · 2/3 | walk-side-14.png · 5 | lee-walk-v1.png · 4/5 |
| neji-jonin | walk-cardinal-10.png · 0/1 | walk-side-7.png · 3 | neji-walk-v1.png · 2/3 |
| hinata-shippuden | walk-cardinal-10.png · 2/3 | walk-side-7.png · 1 | hinata-walk-v1.png · 2/3 |
| hinata-leoes | walk-cardinal-10.png · 4/5 | walk-side-7.png · 2 | hinata-walk-v1.png · 4/5 |
| shikamaru-estrategista | walk-cardinal-11.png · 6/7 | walk-side-8.png · 3 | shikamaru-15-walk-v1.png · 0/1 |
| shikamaru-conselheiro | walk-cardinal-11.png · 8/9 | walk-side-8.png · 4 | shikamaru-walk-v1.png · 2/3 |
| temari-shippuden | walk-cardinal-10.png · 8/9 | walk-side-7.png · 7 | temari-15-walk-v1.png · 0/1 |
| tenten-shippuden | walk-cardinal-11.png · 0/1 | walk-side-7.png · 5 | tenten-walk-v1.png · 2/3 |
| kankuro-shippuden | walk-cardinal-11.png · 2/3 | walk-side-8.png · 6 | kankuro-15-walk-v1.png · 0/1 |
| kankuro-alianca | walk-cardinal-11.png · 4/5 | walk-side-8.png · 7 | kankuro-30-walk-v1.png · 0/1 |
| guy-sexto-portao | walk-cardinal-9.png · 6/7 | walk-side-14.png · 6 | guy-walk-v1.png · 2/3 |
| guy-setimo-portao | walk-cardinal-9.png · 8/9 | walk-side-14.png · 7 | guy-walk-v1.png · 4/5 |
| naruto-hokage | naruto-hokage-roster-v1.png · 0/1 | walk-side-3.png · 1 | naruto-hokage-directional-v2.png · 0/1 |
| kabuto-sabio | kabuto-sabio-roster-v1.png · 0/1 | walk-side-9.png · 4 | kabuto-sabio-directional-v2.png · 0/1 |
| orochimaru-akatsuki | orochimaru-akatsuki-roster-v1.png · 0/1 | walk-side-9.png · 2 | orochimaru-akatsuki-directional-v2.png · 0/1 |
| choji-guerra | choji-guerra-roster-v1.png · 0/1 | walk-side-3.png · 0 | choji-guerra-directional-v2.png · 0/1 |
| kiba-shippuden | kiba-shippuden-roster-v1.png · 0/1 | walk-side-12.png · 1 | kiba-shippuden-directional-v2.png · 0/1 |
| shino-shippuden | shino-shippuden-roster-v1.png · 0/1 | walk-side-12.png · 3 | shino-shippuden-directional-v2.png · 0/1 |
| ino-guerra | ino-guerra-roster-v1.png · 0/1 | walk-side-12.png · 5 | ino-guerra-directional-v2.png · 0/1 |
| tobi-akatsuki | tobi-akatsuki-roster-v1.png · 0/1 | walk-side-10.png · 3 | tobi-akatsuki-directional-v2.png · 0/1 |
| obito-guerra | obito-guerra-roster-v1.png · 0/1 | walk-side-10.png · 4 | obito-guerra-directional-v2.png · 0/1 |
| hanabi-adulta | hanabi-adulta-roster-v1.png · 0/1 | walk-side-13.png · 3 | hanabi-adulta-directional-v2.png · 0/1 |
