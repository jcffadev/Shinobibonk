import fs from 'node:fs';let s=fs.readFileSync('src/main.tsx','utf8');
function replace(a,b){if(!s.includes(a))throw Error(a.slice(0,120));s=s.replace(a,b);}
function between(a,b,next){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error(a);s=s.slice(0,start)+next+s.slice(end);}
replace("import { GameCanvas, type WorldSnapshot }", "import { GameCanvas, emptySnapshot, type WorldSnapshot }");
replace("import './sealing.css';",`import './sealing.css';
import './run-ui.css';
import { ITEMS as items, ITEM_BY_NAME, availableItems } from './game/catalog';
import { ItemIcon, HeroPortrait, RunSheet } from './ui/RunSheet';`);
between('const items =','const itemSprite:', '');
replace('const index=itemSprite[name] ?? 3;', 'const index=ITEM_BY_NAME[name]?.sprite ?? itemSprite[name] ?? 3;');
between('  const [world, setWorld]', '  const [gamePanel', `  const [world, setWorld] = useState<WorldSnapshot>(emptySnapshot);
  const [runId,setRunId]=useState(0);
  const [prototypePool,setPrototypePool]=useState(true);
`);
replace("  const beginMission = () => setPage('game');", "  const beginMission = () => {setWorld(emptySnapshot);setGamePanel(null);setRunId(n=>n+1);setPage('game');};\n  const pool=useMemo(()=>availableItems(unlocked,archived,prototypePool),[unlocked,archived,prototypePool]);");
replace('<GameCanvas heroId={heroId}', '<GameCanvas key={runId} heroId={heroId} mission={mission} itemPool={pool}');
replace('items.filter((item) => unlocked.includes(item.id))', "items.filter((item) => prototypePool || item.rarity==='Comum' || unlocked.includes(item.id))");
replace('<h1>Itens para seu <em>pool</em></h1>', '<h1>Arsenal <em>shinobi</em> · {items.length} itens</h1>');
replace('Comprar desbloqueia o item para futuras missões; não entrega o item diretamente.', 'Escolha os itens que poderão aparecer na missão. Arquivar remove do pool; desbloquear nunca entrega o item diretamente.');
replace("const owned = unlocked.includes(item.id);", "const owned = item.rarity==='Comum'||unlocked.includes(item.id);");
between("<p>{item.id === 'lee' ?",'</article>; })}', `<p>{item.description}</p><small>Limite na run: {item.max}</small><button className="buy-passive" disabled={owned || lamens < item.cost} onClick={() => buyItem(item)}>{owned ? '✓ Desbloqueado' : prototypePool ? 'Disponível no teste do protótipo' : \`Desbloquear · \${item.cost} 🍜\`}</button><button className="archive-item" aria-pressed={archived.includes(item.id)} onClick={()=>toggleArchived(item.id)}>{archived.includes(item.id)?'Restaurar ao pool':'Arquivar da run'}</button>`);
replace('<div className="item-grid">', '<label className="pool-toggle"><input type="checkbox" checked={prototypePool} onChange={e=>setPrototypePool(e.target.checked)}/> Testar catálogo completo nesta sessão <small>Ignora compras com Lamens, respeita itens arquivados. Não altera desbloqueios permanentes.</small></label><div className="item-grid">');
replace('Seleção visual pronta. Escalonamento de inimigos e recompensas por dificuldade ainda não implementados.', 'Inimigos ficam mais resistentes, perigosos e frequentes conforme o tempo passa. Até Genin pode terminar em derrota. Desvie das áreas vermelhas.');
replace('<section className="game-level"><b>', '<section className="game-level"><HeroPortrait id={hero.id}/><b>');
replace('world.hp/148*100', 'world.hp/world.maxHp*100');
replace('{world.hp}/148', '{world.hp}/{world.maxHp}');
replace('Aliado da run · {world.allies.join(", ")}', 'Suportes {world.allies.length}/{world.stats.supportSlots} · {world.allies.join(", ")}');
replace('title={name}><small>{count}</small>', 'title={`${name} · ${ITEM_BY_NAME[name]?.description??""}`}><small>{count}</small>');
replace("'RECOMPENSA DO MEGA ELITE'", "'SAQUE DA MISSÃO'");
replace("'Drop de Orochimaru'", "'Você encontrou itens!'");
replace('<div className="level-choice-cards">', '<div className="level-choice-cards" style={{gridTemplateColumns:`repeat(${world.choice.cards.length},minmax(0,1fr))`}}>');
replace('<span>{card.icon}</span>', "{card.kind==='item'||card.kind==='pill'?<ItemIcon name={card.name}/>:<span>{card.icon}</span>}");
replace('<b>1–3</b>', '<b>1–{world.choice.cards.length}</b>');
replace('<section className={`game-panel ${', '<section className={`game-panel ${gamePanel===\'sheet\'?\'sheet-panel\':\'\'} ${');
between(': <div className="sheet-grid">', '</section></div>}', ': <RunSheet world={world} hero={hero} planned={planned} pool={pool} onContinue={()=>setGamePanel(null)} onMap={()=>setGamePanel(\'map\')}/> }');
replace('      {world.choice&&page===',`      {world.defeated&&page==='game'&&<div className="defeat-backdrop"><section className="defeat-card"><small>MISSÃO {mission.toUpperCase()} · ENCERRADA</small><HeroPortrait id={hero.id}/><h1>Seu shinobi caiu</h1><p>Nível {world.level} · {world.kills} abates · {Math.floor(world.elapsed/60)}min {Math.floor(world.elapsed%60)}s</p><p>Ryu nesta run: {world.runMoney} · Dano dos suportes: {world.allyDamage}</p><p>Fique fora dos círculos vermelhos antes do impacto.</p><button className="continue-run" onClick={beginMission}>Tentar novamente</button><button onClick={missionSelect}>Preparar outra missão</button></section></div>}
      {world.choice&&page===`);
fs.writeFileSync('src/main.tsx',s);
