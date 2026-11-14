// Executor dos testes por código do ShinobiBonk (SEM navegador). Uso: node scripts/run-tests.mjs [--sem-cobertura]
//
// Garantias para o resultado ser confiável ("passou" = passou mesmo):
//  1. Recusa arquivos de teste que usem navegador (Playwright, Puppeteer, Selenium, Edge/Chrome) — política em
//     docs/development/TESTING_POLICY.md.
//  2. Roda um arquivo por vez (sem paralelismo, baixo uso de CPU).
//  3. Falha se algum teste falhar, for cancelado, pulado (skip) ou marcado como "todo" — nada passa por omissão.
//  4. Falha se um arquivo de teste não tiver nenhum teste, ou se o total cair abaixo do mínimo de tests/minimo.json
//     (evita que testes sumam sem ninguém perceber). Ao criar testes novos, suba o mínimo.
//  5. Mede a cobertura dos módulos de lógica pura e falha abaixo dos limites de tests/minimo.json.
import fs from 'node:fs';
import path from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(root, 'tests');
const config = JSON.parse(fs.readFileSync(path.join(testsDir, 'minimo.json'), 'utf8'));
const withCoverage = !process.argv.includes('--sem-cobertura');
/** Limite por arquivo de teste: um teste travado é encerrado e conta como falha (sem processo órfão). */
const TIMEOUT_MS = 120_000;
const started = Date.now();
const problems = [];

const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.mjs')).sort().map(f => path.join(testsDir, f));
if (!files.length) { console.error('Nenhum arquivo tests/*.test.mjs encontrado.'); process.exit(1); }

const BROWSER = /\b(playwright|puppeteer|selenium|webdriver|chromium\.launch|msedge|chrome\.exe|firefox)\b/i;
for (const file of files) {
  if (BROWSER.test(fs.readFileSync(file, 'utf8'))) problems.push(`${path.basename(file)} usa navegador — proibido nos testes por código (ver docs/development/TESTING_POLICY.md).`);
}
if (problems.length) { for (const p of problems) console.error('✖ ' + p); process.exit(1); }

// Ambiente e versão do código (política: registrar ambiente, configuração e versão em todo resultado).
import { execFileSync } from 'node:child_process';
import os from 'node:os';
const gitRev = (() => { try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() + (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() ? ' + alterações locais' : ''); } catch { return 'desconhecida'; } })();
console.log(`Testes por código · ${new Date().toISOString()} · código ${gitRev} · Node ${process.version} · ${os.type()} ${os.release()} · ${os.cpus().length} núcleos · ${files.length} arquivos · cobertura ${withCoverage ? 'ligada' : 'desligada'} · sequencial · limite ${TIMEOUT_MS / 1000}s por arquivo\n`);

const perFile = new Map(files.map(f => [path.resolve(f), 0]));
const count = { pass: 0, fail: 0, skip: 0, todo: 0, cancelled: 0 };
let coverage;

const stream = run({
  files, cwd: root, concurrency: 1, isolation: 'process', timeout: TIMEOUT_MS,
  coverage: withCoverage,
  coverageIncludeGlobs: withCoverage ? config.cobertura.map(c => c.arquivo) : undefined,
});
stream.on('test:pass', e => { if (e.details?.type === 'suite') return; if (e.skip) count.skip++; else if (e.todo) count.todo++; else count.pass++; if (e.file) perFile.set(path.resolve(e.file), (perFile.get(path.resolve(e.file)) ?? 0) + 1); });
stream.on('test:fail', e => { if (e.details?.error?.failureType === 'cancelledByParent') count.cancelled++; else count.fail++; if (e.file) perFile.set(path.resolve(e.file), (perFile.get(path.resolve(e.file)) ?? 0) + 1); });
stream.on('test:coverage', e => { coverage = e.summary; });
stream.compose(spec).pipe(process.stdout);
await new Promise(resolve => stream.on('end', resolve).on('close', resolve));

const total = count.pass + count.fail + count.skip + count.todo + count.cancelled;
if (count.fail) problems.push(`${count.fail} teste(s) falharam.`);
if (count.cancelled) problems.push(`${count.cancelled} teste(s) cancelados (erro ao carregar o arquivo?).`);
if (count.skip || count.todo) problems.push(`${count.skip} pulado(s) e ${count.todo} "todo": testes não podem ficar desligados.`);
for (const [file, n] of perFile) if (!n) problems.push(`${path.basename(file)} não executou nenhum teste.`);
if (total < config.minimoDeTestes) problems.push(`Só ${total} testes executados; o mínimo registrado é ${config.minimoDeTestes} (tests/minimo.json).`);

if (withCoverage) {
  console.log('\nCobertura da lógica pura (linhas · funções · ramificações):');
  for (const rule of config.cobertura) {
    const target = path.join(root, rule.arquivo);
    const entry = coverage?.files.find(f => path.resolve(f.path) === path.resolve(target));
    if (!entry) { problems.push(`Sem cobertura para ${rule.arquivo} (o módulo foi importado direto pelos testes?).`); continue; }
    const line = entry.coveredLinePercent, fn = entry.coveredFunctionPercent, branch = entry.coveredBranchPercent;
    const ok = line >= rule.linhas && fn >= rule.funcoes && branch >= rule.ramificacoes;
    console.log(`  ${ok ? '✔' : '✖'} ${rule.arquivo}: ${line.toFixed(1)}% · ${fn.toFixed(1)}% · ${branch.toFixed(1)}% (mínimo ${rule.linhas}% · ${rule.funcoes}% · ${rule.ramificacoes}%)`);
    if (!ok) problems.push(`Cobertura abaixo do mínimo em ${rule.arquivo}.`);
  }
}

console.log(`\nTotal: ${total} testes em ${files.length} arquivos · ${count.pass} passaram · ${count.fail} falharam · ${count.skip + count.todo} desligados · ${count.cancelled} cancelados · ${((Date.now() - started) / 1000).toFixed(1)} s · código ${gitRev}.`);
// Status padronizados da política (docs/development/TESTING_POLICY.md §H).
if (problems.length) { console.error('\nRESULTADO DOS TESTES: FALHOU'); for (const p of problems) console.error('  ✖ ' + p); process.exit(1); }
console.log('RESULTADO DOS TESTES: PASSOU (100% dos testes executados aprovados)');
