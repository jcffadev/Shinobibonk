import { ITEM_BY_NAME } from '../game/catalog';
import { HERO_BY_ID } from '../game/heroes';
import { formAt } from '../game/evolution';
import { SkillIcon } from './SkillIcon';
import { ItemIcon, HeroPortrait, groups as STAT_GROUPS } from './RunSheet';
import type { WorldSnapshot } from '../scene/GameCanvas';
import type { LamenReward } from '../game/rewards';
import '../summary.css';

// Tela de estatísticas pós-run (somente leitura). Deriva tudo do WorldSnapshot final.
const fmt=(value:number,digits=1)=>value.toLocaleString('pt-BR',{maximumFractionDigits:digits});
const clock=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export function RunSummary({world,hero,mission,reward=null,onRetry,onPrepare}:{world:WorldSnapshot;hero:{id:string;name:string};mission:string;reward?:LamenReward|null;onRetry:()=>void;onPrepare:()=>void}){
  const elapsed=Math.max(0,world.elapsed);
  const dps=elapsed>0?world.totalDamage/elapsed:0;
  const allDamage=world.totalDamage+world.allyDamage;
  const techniqueByName=Object.fromEntries(world.techniques.map(t=>[t.name,t]));
  const damageRows=Object.entries(world.skillDamage).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const topDamage=damageRows[0]?.[1]||1;
  const inventory=Object.entries(world.items).sort((a,b)=>b[1]-a[1]);
  const pills=Object.entries(world.pills);
  const form=formAt(hero.id,world.level).name;
  const metrics:[string,string][]=[
    [clock(elapsed),'TEMPO SOBREVIVIDO'],[String(world.level),'NÍVEL'],[`Zona ${world.zone}`,'ZONA ALCANÇADA'],[fmt(world.kills,0),'ABATES'],
    [fmt(world.totalDamage,0),'DANO TOTAL'],[fmt(dps),'DPS MÉDIO'],[fmt(world.allyDamage,0),'DANO ALIADOS'],[fmt(world.runMoney,0),'RYU'],
    [String(world.kunai),'KUNAI'],[String(world.shuriken),'SHURIKEN'],[`×${fmt(world.difficultyScale,2)}`,'AMEAÇA FINAL'],[`${world.allies.length}/${world.stats.supportSlots}`,'SUPORTES'],
  ];
  return <div className="summary-backdrop" role="dialog" aria-modal="true" aria-label="Resumo da run">
    <section className={`summary-card ${world.victory?'won':'lost'}`}>
      <header className="summary-header">
        <HeroPortrait id={hero.id} level={world.level}/>
        <div className="summary-title">
          <small>MISSÃO {mission.toUpperCase()} · ENCERRADA</small>
          <h1>{world.victory?'Missão concluída!':'Seu shinobi caiu'}</h1>
          <p><b>{hero.name}</b> · {form} · Nv. {world.level}{world.boss?` · Chefe: ${world.boss}`:''}</p>
          <p className="summary-hint">{world.victory?'Você sobreviveu até o fim do cronômetro.':'Fique fora dos círculos vermelhos antes do impacto.'}</p>
        </div>
      </header>
      <div className="summary-metrics">{metrics.map(([value,label])=><div key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
      {reward&&<section className="summary-lamens" aria-label="Lamens ganhos">
        <div className="summary-lamens-total"><span>🍜</span><div><strong>+{fmt(reward.total,0)} Lamens</strong><small>Creditados na carteira · desempenho da run (Ryu não converte)</small></div></div>
        <ul>{reward.sources.map(s=><li key={s.id} className={s.value?'':'zero'}><span>{s.label}</span><small>{s.detail}</small><b>+{fmt(s.value,0)}</b></li>)}
          <li className="mult"><span>Dificuldade {mission}</span><small>subtotal {fmt(reward.subtotal,0)} × {fmt(reward.multiplier,2)}</small><b>= {fmt(reward.total,0)}</b></li></ul>
      </section>}
      <div className="summary-body">
        <section className="summary-col">
          <h2 className="stripe blue">Dano por técnica <small>{damageRows.length} fontes</small></h2>
          {damageRows.length?<ol className="summary-damage">{damageRows.map(([name,value])=>{const t=techniqueByName[name],share=world.totalDamage>0?value/world.totalDamage*100:0;return <li key={name}>
            {t?<SkillIcon heroId={hero.id} name={name}/>:<span className="summary-dot"/>}
            <div><b>{name}{world.skillLevels[name]?<small> Nv. {world.skillLevels[name]}</small>:null}</b><span className="summary-bar"><i style={{width:`${value/topDamage*100}%`}}/></span><small>{fmt(value,0)} · {fmt(share)}%{elapsed>0?` · ${fmt(value/elapsed)} DPS`:''}</small></div>
          </li>;})}</ol>:<p className="summary-empty">Nenhum dano registrado.</p>}
          {world.allyDamage>0&&<p className="summary-note">Aliados causaram {fmt(world.allyDamage,0)} de dano ({allDamage>0?fmt(world.allyDamage/allDamage*100):0}% do dano combinado), contado à parte do dano total do herói.</p>}
        </section>
        <section className="summary-col">
          <h2 className="stripe gold">Build final <small>{inventory.reduce((s,[,n])=>s+n,0)} itens</small></h2>
          <div className="summary-items">{inventory.length?inventory.map(([name,count])=><div className={`summary-item rarity-${ITEM_BY_NAME[name]?.rarity.toLowerCase()??'comum'}`} key={name} title={`${name} · ${ITEM_BY_NAME[name]?.rarity??''}`}><ItemIcon name={name}/><span>{name}</span><b>×{count}</b></div>):<p className="summary-empty">Nenhum item coletado.</p>}</div>
          <h3 className="section-label">PÍLULAS</h3>
          <div className="summary-items">{pills.length?pills.map(([name,count])=><div className="summary-item" key={name}><ItemIcon name={name}/><span title={name}>{name.replace(/^Pílula /,'')}</span><b>Nv. {count}</b></div>):<p className="summary-empty">Nenhuma pílula.</p>}</div>
          <h3 className="section-label">SUPORTES · {world.allies.length}/{world.stats.supportSlots}{world.synergy?' · SINERGIA ATIVA':''}</h3>
          <div className="summary-allies">{world.allies.length?world.allies.map((id,i)=><div key={i}><HeroPortrait id={id}/><small>{HERO_BY_ID[id]?.name??id}</small></div>):<p className="summary-empty">Nenhum suporte recrutado.</p>}</div>
        </section>
        <section className="summary-col">
          <h2 className="stripe purple">Atributos finais</h2>
          {STAT_GROUPS.map(group=><div className="stat-group" key={group.name}><h3>{group.name}</h3>{group.rows.map(([key,label,percent])=><div className="summary-stat" key={key}><span>{label}</span><b>{fmt(world.stats[key]*(percent?100:1))}{percent?'%':''}</b></div>)}</div>)}
        </section>
      </div>
      <footer className="summary-footer">
        <button className="continue-run" onClick={onRetry}>Tentar novamente</button>
        <button onClick={onPrepare}>Preparar outra missão</button>
      </footer>
    </section>
  </div>;
}
