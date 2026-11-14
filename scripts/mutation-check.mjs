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
  { regra: 'costas só acima do limiar (histerese)', arquivo: 'src/scene/playerMotion.ts', de: 'if (vertical > .26) memory.back = true; else if (vertical < .1) memory.back = false;', para: 'memory.back = vertical > 0;' },
  { regra: 'luz do caído não estoura', arquivo: 'src/scene/fallenShinobi.ts', de: '(.52 + .2 * pulse) * grounded', para: '(1.2 + .2 * pulse) * grounded' },
  { regra: 'cone desenhado = cone do acerto', arquivo: 'src/scene/GameCanvas.tsx', de: 'dot(direction)>CONE_COS', para: 'dot(direction)>.5' },
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
