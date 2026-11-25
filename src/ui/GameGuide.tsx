import { glossary } from '../game/glossary';
import { useEffect, useState } from 'react';
import { MAPS, WEATHER_BY_MAP, WEATHER_EVENTS, WEATHER_EVENT_DURATION, WEATHER_WAIT, type WeatherEventId } from '../game/maps';
import { GUARDIAN_RULES } from '../game/missions';
import { NPC_RULES, pctText, TOTEM_RULES } from '../game/npcs';
import { ROULETTE_CASAS, ROULETTE_RULES } from '../game/roulette';
import type { GameSettings, KeyAction } from '../game/settings';
import { FUSION_LEVEL_CAP } from '../game/techniqueMerge';
import { ZONE_SECONDS } from '../game/worldScale';
import { matchesSearch } from './PoolFilters';
import { villageName } from './VillageEmblem';
import { HeroPortrait } from './RunSheet';
import './game-guide.css';

const tabs=['Como jogar','Eventos','NPCs','Glossário'] as const;
type Tab=typeof tabs[number];
const controls:readonly [KeyAction[],string][]=[
  [['up','left','down','right'],'Mover'],[['jump'],'Pular'],[['slide'],'Deslizar'],[['interact'],'Interagir e selar'],
  [['ultimate'],'Usar Ultimate'],[['autoUlt'],'Alternar Ultimate automática'],[['quickMap'],'Mapa rápido'],
  [['bigMap'],'Mapa completo'],[['sheet'],'Abrir ficha e pausar'],[['hideFx'],'Reduzir efeitos próprios'],
];
const keyText=(key:string)=>({' ':'Espaço',shift:'Shift',tab:'Tab'}[key]??key.toUpperCase());
const clock=(seconds:number)=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');

const climateNotes:Record<WeatherEventId,string>={
  mist:'Zabuza aparece e faz os selos. A névoa reduz a visão do cenário, do mapa e do minimapa. Procure o Mega Elite de perto.',
  snow:'A nevasca de Haku desacelera o movimento. Continue na direção desejada para atravessá-la e encontrar Haku.',
  sand:'A areia reduz a velocidade. Gaara ou Rasa pode surgir como Mega Elite durante a tempestade.',
};

const fieldEvents=[
  ['Naruto Totem','Aos '+clock(TOTEM_RULES.start)+' de missão ('+clock(ZONE_SECONDS-TOTEM_RULES.start)+' no relógio da primeira zona), aparece um totem que invoca clones. Destrua-o antes de '+clock(TOTEM_RULES.end)+' de missão para ganhar '+TOTEM_RULES.levels+' níveis.'],
  ['Emboscadas e corpos shinobi','Emboscadas podem começar conforme o tempo passa. Investigar um corpo no chão provoca uma emboscada de 10 ninjas, 1 deles elite, e soma 5% de inimigos na partida. Derrote todos para ganhar um pergaminho de recompensa (1 item).'],
  ['Shuriken Amaldiçoada','Pegue a shuriken para ganhar +8% de dano total em troca de enfrentar uma emboscada.'],
  ['Altares de defesa','Entre no círculo e permaneça até concluir a defesa. Escolha uma de três bênçãos. A raridade altera a força da recompensa.'],
  ['Emboscada da Akatsuki','Ao se aproximar da nuvem vermelha no mapa, Zetsu emerge. Clique nele ou aperte E para enfrentar a Akatsuki na dificuldade atual. Derrote o grupo inteiro para ganhar três pergaminhos grátis.'],
  ['Mega Elites e Shinobis para selar','Procure o contorno vermelho dos Mega Elites e o ciano dos encontros de conta. Derrote o alvo, aproxime-se e interaja. Vermelho recruta na missão. Ciano desbloqueia na conta.'],
  ['Portal do Guardião','Invoque o guardião quando estiver pronto. Ele escala com a missão e a espera. Derrote-o e atravesse o portal. A terceira zona leva à arena da Bijū.'],
  ['Horda final','Quando o relógio zera, a horda fica mais forte e o tempo extra começa a contar. Você ainda pode enfrentar o guardião e avançar.'],
] as const;

const npcs=[
  {id:'tsunade',name:'Tsunade · Caça-Níquel',summary:'Pague Ryu para girar três rolos. Cada giro encarece o próximo. Sorte favorece os prêmios, enquanto zona, dificuldade e maldição aumentam a pressão. Confira as chances no painel. Os rolos têm Tsunade, Hiruzen, Kakuzu, Jiraiya e Hidan. Os combos são entregues ao sair.'},
  {id:'iruka',name:'Iruka · Aula da Academia',summary:'Escolha uma opção por zona: lição grátis de '+pctText(NPC_RULES.irukaLesson.min)+' a '+pctText(NPC_RULES.irukaLesson.max)+', pergaminho lendário com perda de '+pctText(NPC_RULES.irukaLegendaryCost)+' em outro atributo ou recrutamento. Como ajudante, Iruka ocupa uma vaga e dá +'+pctText(NPC_RULES.irukaAllyExp)+' de XP na afinidade máxima, antes do multiplicador de suporte.'},
  {id:'ebisu',name:'Ebisu · Treino de Elite',summary:'Escolha uma troca de atributos entre três ofertas. O ganho varia de '+pctText(NPC_RULES.ebisu.min)+' a '+pctText(NPC_RULES.ebisu.max)+'. O custo em outro atributo é '+pctText(NPC_RULES.ebisu.costFactor-1)+' maior que o ganho. A troca vale até o fim da partida.'},
  {id:'teuchi',name:'Teuchi · Barraca Ichiraku',summary:'Use Ryu para esquecer uma técnica ou pílula e abrir espaço para outra escolha. O preço aumenta conforme o nível e a última técnica fica protegida.'},
  {id:'tenten',name:'Tenten · Arsenal',summary:'Escolha um item que já esteja na bolsa para forjar uma cópia. Só aparecem itens abaixo do limite de cópias.'},
  {id:'sapos-sabios',name:'Fukasaku e Shima · Oficina dos Sapos',summary:'Leve duas técnicas de ataque no nível máximo da partida. Fundir cria uma técnica do Nv. 1 ao Nv. '+FUSION_LEVEL_CAP+'. Combinar mantém as duas no mesmo espaço com ×1,5 de dano por técnica. Há um uso por zona. Certos pares elementais liberam uma Kekkei Genkai; mesma natureza ou a Kekkei Genkai da linhagem dão +15% de dano. Uma fusão ou combinação não pode ser fundida de novo.'},
  {id:'shikamaru',name:'Shikamaru · Plano de combate',summary:'Use até '+GUARDIAN_RULES.shikamaruMaxPlans+' planos por zona. Cada plano fortalece os inimigos e acrescenta uma kunai à recompensa do guardião. Os planos da última zona também aumentam o HP e a defesa da Bijū.'},
  {id:'orochimaru',name:'Orochimaru · Maldição',summary:'Aceite a maldição para aumentar a dificuldade em 20% e ganhar 25% a mais de XP e saque na zona.'},
  {id:'',name:'Mercador de itens',summary:'Compre pelo preço da oferta atual em Ryu. Se quiser outro estoque, pague para roletar. Reabrir mostra as mesmas ofertas. Raridade, tempo e compras anteriores influenciam os preços dos novos itens.'},
] as const;

export function GameGuide({keys,onBack}:{keys:GameSettings['keys'];onBack:()=>void}){
  const [tab,setTab]=useState<Tab>('Como jogar');
  const [search,setSearch]=useState('');
  useEffect(()=>{
    function back(event:KeyboardEvent){if(event.key==='Escape'&&!event.defaultPrevented)onBack();}
    window.addEventListener('keydown',back);
    return()=>window.removeEventListener('keydown',back);
  },[onBack]);
  const entries=fieldEvents.filter(([name,body])=>matchesSearch(name+' '+body,search));

  const npcMatches=npcs.filter(npc=>matchesSearch(npc.name+' '+npc.summary,search));
  const climates=(Object.keys(WEATHER_EVENTS) as WeatherEventId[]).filter(id=>matchesSearch(WEATHER_EVENTS[id].name+' '+climateNotes[id],search));

  return <section className="hub-page game-guide" aria-labelledby="guide-title">
    <header className="page-heading"><h1 id="guide-title">Guia do <em>jogo</em></h1><button type="button" className="button secondary-button" onClick={onBack}>← Voltar ao início</button></header>
    <nav className="guide-nav" aria-label="Seções do guia">{tabs.map(next=><button type="button" key={next} aria-pressed={tab===next} onClick={()=>{setTab(next);setSearch('');}}>{next}</button>)}</nav>
    {tab!=='Como jogar'&&<label className="guide-search"><span>Buscar em {tab.toLocaleLowerCase('pt-BR')}</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label>}
    {tab==='Como jogar'&&<div className="guide-grid">
      <article className="guide-panel"><h2>Sua primeira missão</h2><ol>
        <li><b>Prepare a build.</b> Escolha um shinobi, planeje técnicas e pílulas, selecione seu arsenal, mapa e dificuldade.</li>
        <li><b>Sobreviva e evolua.</b> Técnicas comuns atacam automaticamente. Recolha XP, use o mapa para encontrar eventos e desvie dos avisos de golpes.</li>
        <li><b>Abra caminho para a Bijū.</b> Invoque e derrote o guardião de cada zona. Atravesse os portais e complete a arena final.</li>
      </ol><p>Cada zona começa com {ZONE_SECONDS/60} minutos. Você pode invocar o guardião antes de o tempo acabar.</p></article>
      <article className="guide-panel"><h2>Controles</h2><dl className="guide-keys">{controls.map(([actions,label])=><div key={actions[0]}><dt>{label}</dt><dd>{actions.map(action=><kbd key={action}>{keyText(keys[action])}</kbd>)}</dd></div>)}<div><dt>Câmera e zoom</dt><dd>Mouse · rolagem</dd></div><div><dt>Pausar</dt><dd><kbd>Esc</kbd></dd></div></dl></article>
    </div>}
    {tab==='Eventos'&&<>
      {climates.length>0&&<section className="guide-event-group"><h2>Clima da missão</h2><p>A primeira tentativa ocorre entre {clock(WEATHER_WAIT.min)} e {clock(WEATHER_WAIT.max)} de missão. Novas tentativas ocorrem após intervalo semelhante. Cada evento dura {WEATHER_EVENT_DURATION} segundos após a conjuração ou até a derrota do Mega Elite.</p>
        <div className="guide-grid">{climates.map(id=><article className="guide-panel guide-weather" key={id}><h3>{WEATHER_EVENTS[id].name}</h3><p>{climateNotes[id]}</p><div className="guide-villages">{MAPS.filter(map=>WEATHER_BY_MAP[map.id].includes(id)).map(map=><span key={map.id}>{villageName(map.name,true)}</span>)}</div></article>)}</div>
      </section>}
      {entries.length>0&&<section className="guide-event-group"><h2>Encontros e marcos</h2><div className="guide-grid">{entries.map(([name,body])=><article className="guide-panel" key={name}><h3>{name}</h3><p>{body}</p></article>)}</div></section>}
      {!entries.length&&!climates.length&&<p>Nenhum evento encontrado.</p>}
    </>}
    {tab==='NPCs'&&<div className="guide-grid">{npcMatches.map(npc=><article className="guide-panel" key={npc.name}>
      <header className="guide-npc-heading">{npc.id&&<HeroPortrait id={npc.id}/>}<h2>{npc.name}</h2></header><p>{npc.summary}</p>
      {npc.id==='tsunade'&&<details className="guide-roulette"><summary>Ver casas e combinações</summary><p>O giro base começa em {ROULETTE_RULES.baseCost} Ryu.</p><dl>{ROULETTE_CASAS.map(casa=><div key={casa.id}><dt>{casa.label}</dt><dd>{casa.description}</dd></div>)}</dl></details>}
    </article>)}{!npcMatches.length&&<p>Nenhum NPC encontrado.</p>}</div>}
    {tab==='Glossário'&&<GameGlossary search={search}/>}
  </section>;
}

export function GameGlossary({search}:{search:string}) {
  const [topic,setTopic]=useState('');
  const words=search.trim().split(/\s+/);
  const terms=glossary.filter(group=>!topic||group.title===topic).map(group=>({
    ...group, entries: group.entries.filter(entry=>words.every(word=>matchesSearch([group.title,entry.term,entry.detail,entry.example,entry.keywords].join(' '),word))),
  })).filter(group=>group.entries.length);
  return <>
    <label className="glossary-topic"><span>Assunto</span><select value={topic} onChange={e=>setTopic(e.target.value)}>
      <option value="">Todos os assuntos</option>{glossary.map(group=><option key={group.title}>{group.title}</option>)}
    </select></label>
    {terms.map(group=><section className="guide-event-group" key={group.title}><h2>{group.title}</h2>
      <dl className="guide-grid guide-glossary">{group.entries.map(entry=><div className="guide-panel" key={entry.term}>
        <dt>{entry.term}</dt><dd><p>{entry.detail}</p>{entry.example&&<p className="glossary-example"><b>Exemplo</b> {entry.example}</p>}</dd>
      </div>)}</dl>
    </section>)}
    {!terms.length&&<p>Nenhum termo encontrado neste assunto.</p>}
  </>;
}
