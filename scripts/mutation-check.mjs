// "Prova dos testes" (teste de mutação, SEM navegador). Uso: node scripts/mutation-check.mjs
//
// Estraga de propósito, uma por vez, regras importantes do jogo e confirma que os testes de tests/ ACUSAM cada defeito.
// Se uma mutação passar despercebida, os testes daquela regra são fracos: o script falha e mostra qual.
// Cada arquivo é restaurado byte a byte logo depois (inclusive se o script for interrompido com Ctrl+C).
// Ao criar uma regra nova importante, acrescente aqui uma mutação que a quebre.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTATIONS = [
  { regra: 'shinobi dobra o joelho antes do tombo', arquivo: 'src/scene/fallenShinobi.ts', de: 'bend=THREE.MathUtils.smoothstep(t,stagger,kneel);', para: 'bend=0;' },
  { regra: 'estátua recebe arte de costas na própria célula', arquivo: 'src/scene/landmarkRelief.ts', de: '(index-1+.5-x)*.5', para: '(.5-x)*.5' },
  { regra: 'base do Monte Hokage entra no chão', arquivo: 'src/scene/landmarkRelief.ts', de: 'embedBase(faceGeometry,face.position.y,face.position.z);', para: '' },
  { regra: 'câmera orbita acima do terreno', arquivo: 'src/scene/heightField.ts', de: 'Math.max(y,footHeight(ground,x,z,.62)+.80)', para: 'y' },
  { regra: 'acostamento de Konoha mistura os materiais', arquivo: 'src/scene/villageLayout.ts', de: '1-MathUtils.smoothstep(distance+roughness,-.4,.57)', para: 'Number(distance<0)' },
  { regra: 'NPC de missão usa malhas, sem planos de rosto', arquivo: 'src/scene/missionNpcs.ts', de: "  root.name='npc-3d-'+id;", para: "  root.name='npc-3d-'+id; root.add(new THREE.Sprite());" },
  { regra: 'margem curva tem subdivisão local', arquivo: 'src/scene/terrainGeometry.ts', de: 'if(detailed[i])grid(sx,sz,sub);', para: 'if(detailed[i])grid(sx,sz,1);' },
  { regra: 'degraus têm uma só superfície de piso', arquivo: 'src/scene/villageArchitecture.ts', de: 'quad(floor,[left,top,to],[right,top,to],[right,top,from],[left,top,from]);', para: 'quad(floor,[left,top,to],[right,top,to],[right,top,from],[left,top,from]);quad(floor,[left,top,to],[right,top,to],[right,top,from],[left,top,from]);' },
  { regra: 'escadas das vilas apoiam passos sem pulo', arquivo: 'src/scene/collision.ts', de: 'stair.top!<=from+.205', para: 'stair.top!<=from+.05' },
  { regra: 'fade da horda não interfere na entrada da bijū', arquivo: 'src/scene/enemyRenderer.ts', de: 'else if(opacity&&!sp.userData.bijuuEntrance)', para: 'else if(opacity)' },
  { regra: 'roleta só tem as cinco casas de personagem', arquivo: 'src/game/roulette.ts', de: "{ id: 'tsunade', label: 'Tsunade'", para: "{ id: 'kunai', label: 'Tsunade'" },
  { regra: 'emboscada da Akatsuki rende três pergaminhos', arquivo: 'src/game/akatsukiAmbush.ts', de: 'rewards: 3', para: 'rewards: 1' },
  { regra: 'level-up não solta o WASD pressionado', arquivo: 'src/scene/GameCanvas.tsx', de: 'openLevelReward();invulnerability=3;', para: 'openLevelReward();invulnerability=3;movementInput.clear();' },
  { regra: 'primeiro Mega Elite limitado a 3.000 HP', arquivo: 'src/game/enemyTiers.ts', de: 'Math.min(hp, OPENING_MEGA_MAX_HP)', para: 'hp' },
  { regra: 'status inicia no teto de 10%', arquivo: 'src/game/combat.ts', de: 'const initial = Math.min(base, .1);', para: 'const initial = base;' },
  { regra: "bônus de Kekkei Genkai é +15%", arquivo: "src/game/techniqueMerge.ts", de: "FUSION_KEKKEI_BONUS = .15;", para: "FUSION_KEKKEI_BONUS = 0;" },
  { regra: "fusão não entra em outra fusão", arquivo: "src/game/techniqueMerge.ts", de: "a.setup||b.setup||isMergedName(a.name)||isMergedName(b.name))return;", para: "a.setup||b.setup)return;" },
  { regra: "Jiton é Vento + Terra", arquivo: "src/game/techniqueMerge.ts", de: "natures:['Vento','Terra'],name:'Jiton", para: "natures:['Vento','Raio'],name:'Jiton" },
  { regra: "linhagem recebe as naturezas da Kekkei Genkai", arquivo: "src/game/heroes.ts", de: "heroAffinity(heroId),...lineageNatures(familyOf(heroId))]);", para: "heroAffinity(heroId)]);" },
  { regra: "combinação mantém ×1,5", arquivo: "src/game/techniqueMerge.ts", de: "power:source.power*1.5*(", para: "power:source.power*(" },
  { regra: 'fusão não ultrapassa o nível 7', arquivo: 'src/game/techniqueMerge.ts', de: 'FUSION_LEVEL_CAP = 7', para: 'FUSION_LEVEL_CAP = 12' },
  { regra: 'ranking usa a melhor missão por região', arquivo: 'src/game/league.ts', de: 'if (!previous || compareRun(run, previous) < 0) best.set(run.map, run);', para: 'if (!previous || compareRun(run, previous) > 0) best.set(run.map, run);' },
  { regra: 'portal conserva XP atraído', arquivo: 'src/game/drops.ts', de: '(magnet || distance < pickupRadius)', para: 'distance < pickupRadius' },
  { regra: 'corpo do jogador na escala do desenho', arquivo: 'src/scene/collision.ts', de: 'playerRadius: .17,', para: 'playerRadius: .42,' },
  { regra: 'tronco da árvore do tamanho desenhado', arquivo: 'src/scene/collision.ts', de: 'scenery: [.3, .25, .55, .85],', para: 'scenery: [.5, .42, .55, .85],' },
  { regra: 'cenário escondido em construção é removido', arquivo: 'src/scene/collision.ts', de: 'if (s.big||s.stair) continue;', para: 'continue;' },
  { regra: 'dash sai pela frente', arquivo: 'src/scene/collision.ts', de: 'const t = -b + Math.sqrt', para: 'const t = -b - Math.sqrt' },
  { regra: 'marco grande não bloqueia além de 3 m', arquivo: 'src/scene/collision.ts', de: 'buildingMaxRadius: 3,', para: 'buildingMaxRadius: 7,' },
  { regra: 'Comum/Incomum sem projétil no altar', arquivo: 'src/game/altarRewards.ts', de: 'ALTAR_PROJECTILES=[0,0,1,2,3]', para: 'ALTAR_PROJECTILES=[0,1,1,2,3]' },
  { regra: 'Lendário dá +3 projéteis', arquivo: 'src/game/altarRewards.ts', de: 'ALTAR_PROJECTILES=[0,0,1,2,3]', para: 'ALTAR_PROJECTILES=[0,0,1,2,2]' },
  { regra: 'Ultimate não repete golpe', arquivo: 'src/game/altarRewards.ts', de: 'if(ultimate)return 0;', para: '' },
  { regra: 'Sorte com teto de +120%', arquivo: 'src/game/altarRewards.ts', de: 'Math.min(1.2,', para: 'Math.min(5,' },
  { regra: 'ímã do morro em ≤ 1,2 s', arquivo: 'src/game/drops.ts', de: 'GLOBAL_PULL_SECONDS=1.2', para: 'GLOBAL_PULL_SECONDS=3' },
  { regra: 'curva de HP contida', arquivo: 'src/game/progression.ts', de: 'HP_GROWTH={perLevel:.04,softLevels:150}', para: 'HP_GROWTH={perLevel:.04,softLevels:15000}' },
  { regra: '+% de inimigos respeita o teto', arquivo: 'src/game/progression.ts', de: 'cap:Math.min(t.swarm>1?FINAL_SWARM.maxEnemies:ENEMY_SCALING.maxEnemies,', para: 'cap:Math.min(1e9,' },
  { regra: 'troca de zona recomeça do 0', arquivo: 'src/scene/GameCanvas.tsx', de: 'arena?ZONE_SECONDS:zoneElapsed()', para: 'arena?ZONE_SECONDS:elapsed' },
  { regra: 'música padrão 10%', arquivo: 'src/game/settings.ts', de: 'const MUSIC_DEFAULT = .1', para: 'const MUSIC_DEFAULT = .7' },
  { regra: 'volume do jogador preservado', arquivo: 'src/game/settings.ts', de: '&& parsed.musicVolume === OLD_MUSIC_DEFAULT) parsed.musicVolume', para: ') parsed.musicVolume' },
  { regra: 'dash e caminhada viram para a esquerda', arquivo: 'src/scene/playerMotion.ts', de: 'left: horizontal < -.001', para: 'left: horizontal > .001' },
  { regra: 'dash traseiro usa a fileira de costas', arquivo: 'src/scene/playerMotion.ts', de: "(state === 'dash' ? 2 : 0) + Number(backwardView)", para: "(state === 'dash' ? 2 : 0)" },
  { regra: 'costas só acima do limiar (histerese)', arquivo: 'src/scene/playerMotion.ts', de: 'if (vertical > .26) memory.back = true; else if (vertical < .1) memory.back = false;', para: 'memory.back = vertical > 0;' },
  { regra: 'área do caído usa o raio do E', arquivo: 'src/scene/fallenShinobi.ts', de: 'const areaRadius = o.areaRadius ?? FALLEN_AREA.radius;', para: 'const areaRadius = 3;' },
  { regra: 'câmera começa perto', arquivo: 'src/game/settings.ts', de: 'default: 12, min: 8, max: 22,', para: 'default: 19, min: 8, max: 22,' },
  { regra: 'ninja do tamanho do monstro comum', arquivo: 'src/game/worldScale.ts', de: 'export const MONSTER_VISIBLE_HEIGHT = 2.0 * .83;', para: 'export const MONSTER_VISIBLE_HEIGHT = 2.0 * .83 * .55;' },
  { regra: 'catálogo de fusões com Kekkei Genkai no topo', arquivo: 'src/game/techniqueMerge.ts', de: 'Number(b.kekkei)-Number(a.kekkei)||', para: '' },
  { regra: 'um clique no catálogo planeja a fusão', arquivo: 'src/ui/BuildPlanner.tsx', de: 'else addFusionPair(...f.pair);', para: 'else {}' },
  { regra: 'missão só sorteia os itens da bolsa', arquivo: 'src/game/catalog.ts', de: 'return packed.length?packed:all;', para: 'return all;' },
  { regra: 'montanhas só no horizonte, baixas', arquivo: 'src/scene/terrainArt.ts', de: 'ridge: .4,', para: 'ridge: .9,' },
  { regra: 'câmera em perspectiva por padrão', arquivo: 'src/game/settings.ts', de: "cameraProjection: 'perspectiva', autoUltimate", para: "cameraProjection: 'ortografica', autoUltimate" },
  { regra: 'chão plano sob as construções da Folha', arquivo: 'src/scene/terrainArt.ts', de: 'if (distance >= 4) continue;', para: 'if (distance >= 0) continue;' },
  { regra: 'paredão de Suna com topo reto', arquivo: 'src/scene/terrainArt.ts', de: '(17 + 1.5 * Math.sin(3 * angle)) * wall', para: '(17 + 9 * Math.sin(3 * angle)) * wall' },
  { regra: 'pé do personagem sobre o chão', arquivo: 'src/scene/heightField.ts', de: 'export const FOOT_RADIUS = .45;', para: 'export const FOOT_RADIUS = 0;' },
  { regra: 'Ultimate automática salva entre partidas', arquivo: 'src/scene/GameCanvas.tsx', de: 'if(saved.autoUltimate!==autoUlt)saveSettings', para: 'if(false)saveSettings' },
  { regra: 'ninja de pé sobre a água', arquivo: 'src/scene/GameCanvas.tsx', de: 'Math.max(footHeight(terrainHeight,x,z),waterSurfaceAt(MAP.id,x,z))', para: 'Math.max(footHeight(terrainHeight,x,z),-Infinity)' },
  { regra: 'Suna com mesas de topo reto no fundo', arquivo: 'src/scene/landscape.ts', de: 'far: u => Math.round((.5 + .22 * s(u, 4, .7) + .1 * s(u, 9)) * 5) / 5,', para: 'far: u => .5 + .22 * s(u, 4, .7) + .1 * s(u, 9),' },
  { regra: 'personagem pisca vermelho vivo ao levar dano', arquivo: 'src/game/damageFeedback.ts', de: "on: '#ff2b2b'", para: "on: '#ff9a9a'" },
  { regra: "pouso na água faz onda", arquivo: 'src/scene/GameCanvas.tsx', de: "if(wasAirborne){water.ripple(player.position.x,player.position.z,1)", para: "if(false){water.ripple(player.position.x,player.position.z,1)" },
  { regra: "pergaminhos com vários estilos", arquivo: 'src/scene/dropSprites.ts', de: "kanji: '地', ink: '#2b2b33'", para: "kanji: '天', ink: '#2b2b33'" },
  { regra: "Pedra Memorial na Folha", arquivo: 'src/scene/terrainArt.ts', de: "  {x:-38,z:-26,rx:7,rz:7},\n", para: "  {x:-38,z:-26,rx:1,rz:1},\n" },
  { regra: "Pain levita na Ultimate", arquivo: 'src/game/shinraTensei.ts', de: "seconds: 2.6, lift: 1.5,", para: "seconds: 2.6, lift: 0," },
  { regra: "ondas do Shinra Tensei atordoam", arquivo: 'src/scene/GameCanvas.tsx', de: "enemy.control='Atordoar';enemy.controlTime=Math.max(enemy.controlTime||0,SHINRA.stunSeconds);", para: "" },
  { regra: 'chão pintado pela grade de alturas', arquivo: 'src/scene/GameCanvas.tsx', de: 'createGroundMaterial(MAP,terrainHeight)', para: 'createGroundMaterial(MAP)' },
  { regra: "todos os adultos do mesmo tamanho", arquivo: 'src/scene/playerMotion.ts', de: "  return ADULT_HEIGHT;\n", para: "  return family==='zabuza'?2.58:ADULT_HEIGHT;\n" },
  { regra: "na névoa todos aparecem a 3 m", arquivo: 'src/game/zabuzaMist.ts', de: "reveal: 3,", para: "reveal: 5," },
  { regra: "armadilha soma +5% de inimigos", arquivo: 'src/game/fallenTrap.ts', de: "enemyCount: .05", para: "enemyCount: 0" },
  { regra: "eventos de clima podem não acontecer", arquivo: 'src/game/maps.ts', de: "chance: .5,", para: "chance: 1," },
  { regra: "chave a cada 500 abates", arquivo: 'src/game/hagoromoTraining.ts', de: "killsPerKey: 500,", para: "killsPerKey: 50," },
  { regra: "hordas do evento não recarregam a chave", arquivo: 'src/game/hagoromoTraining.ts', de: "if (options.inEvent || !options.recharge", para: "if (!options.recharge" },
  { regra: "clicar numa ferramenta que já tem troca", arquivo: 'src/game/hagoromoTraining.ts', de: "return owned.map(id => id === replace ? newId : id);", para: "return [...owned];" },
  { regra: "Juventude: Difícil dá mais buff que Normal", arquivo: 'src/game/youthTraining.ts', de: "{ Fácil: 1, Normal: 2, Difícil: 4 }", para: "{ Fácil: 1, Normal: 2, Difícil: 2 }" },
  { regra: "Juventude: 400 abates no Difícil", arquivo: 'src/game/youthTraining.ts', de: "Difícil: { goal: 400, seconds: 180 }", para: "Difícil: { goal: 40, seconds: 180 }" },
  { regra: "Juventude: sem golpe vence quando o tempo acaba", arquivo: 'src/game/youthTraining.ts', de: "return run.timeLeft <= 0 ? 'win' : null; }", para: "return run.timeLeft <= 0 ? 'lose' : null; }" },
  { regra: "Susanoo sobe do chão ao se formar", arquivo: 'src/scene/susanooFx.ts', de: "rise: -.7 + .98 * grow + .9 * leaving,", para: "rise: .28 + .9 * leaving," },
  { regra: "respingo forte no pouso na água", arquivo: 'src/scene/GameCanvas.tsx', de: "splashes.burst(player.position.x,footY,player.position.z,16,1.4)", para: "splashes.burst(player.position.x,footY,player.position.z,0,1.4)" },
  { regra: 'areia do Gaara com efeito de areia', arquivo: 'src/game/techniqueVisualProfiles.ts', de: '  [/de Areia$/,7],', para: '' },
  { regra: "3 acúmulos de Resfriado congelam", arquivo: 'src/game/statusRules.ts', de: "stacksToFreeze: 3,", para: "stacksToFreeze: 4," },
  { regra: "Mega Elite resiste 40% ao controle", arquivo: 'src/game/statusRules.ts', de: "resist: { mega: .4,", para: "resist: { mega: 0," },
  { regra: "golpe que acorda causa +60%", arquivo: 'src/game/statusRules.ts', de: "sleepWake: .6,", para: "sleepWake: 0," },
  { regra: "gelo do Haku congela", arquivo: 'src/game/statusProfiles.ts', de: "'Senbon de Gelo': { status: 'Congelar', statusChance: .22 },", para: "'Senbon de Gelo': { status: 'Lentidão', statusChance: .22 }," },
  { regra: "golpes sem status ganham status", arquivo: 'src/game/statusProfiles.ts', de: "  'Impacto de Sakura': { status: 'Atordoar', statusChance: .3 },\n", para: "" },
  { regra: 'farol do pergaminho grátis é alto', arquivo: 'src/scene/rewardBeacon.ts', de: 'height: 30,', para: 'height: 4,' },
  { regra: 'luz do caído não estoura', arquivo: 'src/scene/fallenShinobi.ts', de: '(.52 + .2 * pulse) * grounded', para: '(1.2 + .2 * pulse) * grounded' },
  { regra: 'piso de fonte de 10px na HUD', arquivo: 'src/hud-dock.css', de: 'font-size:11.5px', para: 'font-size:7px' },
  { regra: 'cursor virtual não sai da tela', arquivo: 'src/scene/virtualCursor.ts', de: 'Math.min(Math.max(0, x), Math.max(0, width - 1))', para: 'x' },
  { regra: 'clique só no mesmo elemento', arquivo: 'src/scene/virtualCursor.ts', de: 'pressed && (pressed === target || pressed.contains(target) || target.contains(pressed))', para: 'pressed' },
  { regra: 'mouse continua preso nas telas da missão', arquivo: 'src/scene/GameCanvas.tsx', de: 'if(pointerLocked()&&!cameraCanMove()&&!ui)document.exitPointerLock();', para: 'if(pointerLocked()&&!cameraCanMove())document.exitPointerLock();' },
  { regra: 'bijū sem mipmaps no atlas', arquivo: 'src/scene/bossCombat.ts', de: 'map.generateMipmaps=false;', para: '' },
  { regra: 'bijū nasce com a folha nova', arquivo: 'src/scene/bossCombat.ts', de: 'host.sprite.material.map=map;host.sprite.material.transparent=true;', para: 'host.sprite.material.transparent=true;' },
  { regra: 'bijū sem esticar', arquivo: 'src/scene/bossCombat.ts', de: 'host.sprite.scale.set(BIJUU_SIZE*wide*grow,', para: 'host.sprite.scale.set(5*wide*grow,' },
  { regra: 'bijū de costas com histerese', arquivo: 'src/game/bijuu.ts', de: 'if (away > .26) return true;', para: 'if (away > 0) return true;' },
  { regra: 'sem quadrados brancos de inimigos (névoa do Zabuza)', arquivo: 'src/scene/enemyRenderer.ts', de: ' sprite.material.visible = false; },', para: ' },' },
  { regra: 'névoa só esconde depois dos selos', arquivo: 'src/game/weatherCast.ts', de: "elapsed >= (event.castEnd ?? 0)", para: 'true' },
  { regra: 'Zabuza parado durante os selos', arquivo: 'src/scene/GameCanvas.tsx', de: 'const stunned=channeling||', para: 'const stunned=' },
  { regra: 'cabeça do mesmo tamanho ao começar a andar', arquivo: 'src/scene/playerMotion.ts', de: 'const propTarget = headProportion(idleFrac, cellFrac, idleHead, cellHead);', para: 'const propTarget = idleFrac > 0 && cellFrac > 0 ? Math.min(1.35, Math.max(.85, idleFrac / cellFrac)) : 1;' },
  { regra: 'proporção iguala a cabeça', arquivo: 'src/scene/playerMotion.ts', de: 'Math.max(.6, idleHead / cellHead)', para: 'Math.max(.6, idleHeight / cellHeight)' },
  { regra: 'cone desenhado = cone do acerto', arquivo: 'src/scene/GameCanvas.tsx', de: 'dot(direction)>CONE_COS', para: 'dot(direction)>.5' },
  { regra: 'corpo a corpo recarrega em 0,6 s no Nv. 1', arquivo: 'src/game/heroes.ts', de: "'Corpo a corpo':.6,", para: "'Corpo a corpo':1.2," },
  { regra: 'Nv. 1 sem penalidade de recarga', arquivo: 'src/game/combat.ts', de: ' return 1-COOLDOWN_GROWTH.atMax*', para: ' return 1.55-COOLDOWN_GROWTH.atMax*' },
  { regra: 'vida do monstro comum 13', arquivo: 'src/game/enemyTiers.ts', de: 'normal: { hp: 13,', para: 'normal: { hp: 22,' },
  { regra: 'XP por abate igual em todas as dificuldades', arquivo: 'src/game/enemyTiers.ts', de: 'return loot / missionLootFactor(missionTier);', para: 'return loot;' },
  { regra: 'emboscada só aos 2:30', arquivo: 'src/game/progression.ts', de: 'first: 150,', para: 'first: 30,' },
  { regra: 'Órbita acerta no alvo, não no pé do jogador', arquivo: 'src/game/combat.ts', de: "t.shape==='Área'||t.shape==='Órbita'||t.shape==='Corpo a corpo'?'target'", para: "t.shape==='Área'?'target'" },
  { regra: 'partículas da Órbita no alvo', arquivo: 'src/scene/particleFx.ts', de: "case 'Órbita': orbit(t, p, center.x, center.y, center.z, radius)", para: "case 'Órbita': orbit(t, p, origin.x, oy, origin.z, radius)" },
  { regra: 'chefe desconta o poder por forma', arquivo: 'src/scene/bossCombat.ts', de: 'power = technique.power / (SHAPE_POWER[technique.shape] ?? 1);', para: 'power = technique.power;' },
];

const originals = new Map();
const restoreAll = () => { for (const [file, data] of originals) fs.writeFileSync(file, data); originals.clear(); };
process.on('SIGINT', () => { restoreAll(); process.exit(130); });
process.on('exit', restoreAll);

const survivors = [];
for (const m of MUTATIONS) {
  const file = path.join(root, m.arquivo);
  const original = fs.readFileSync(file);
  const text = original.toString('utf8');
  if (text.split(m.de).length !== 2) { survivors.push(`${m.regra}: trecho a mutar não encontrado em ${m.arquivo} (atualize a mutação).`); continue; }
  originals.set(file, original);
  fs.writeFileSync(file, text.replace(m.de, m.para));
  const run = spawnSync(process.execPath, ['scripts/run-tests.mjs', '--sem-cobertura'], { cwd: root, encoding: 'utf8' });
  fs.writeFileSync(file, original); originals.delete(file);
  const caught = run.status !== 0;
  console.log(`${caught ? '✔ acusada' : '✖ PASSOU DESPERCEBIDA'} · ${m.regra} (${m.arquivo})`);
  if (!caught) survivors.push(m.regra);
}
console.log(`\n${MUTATIONS.length - survivors.length}/${MUTATIONS.length} mutações acusadas pelos testes.`);
if (survivors.length) { console.error('PROVA DOS TESTES: FALHOU'); for (const s of survivors) console.error('  ✖ ' + s); process.exit(1); }
console.log('PROVA DOS TESTES: APROVADA — os testes detectam todos os defeitos plantados.');
