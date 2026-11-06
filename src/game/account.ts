/**
 * Progresso da CONTA (neste navegador): shinobis jogáveis, shinobis já selados e pesquisa de técnicas.
 * Regras do usuário (06/11/2026):
 * - Só os iniciais (`STARTER_HEROES`) começam jogáveis; os demais são liberados ao selar o "Shinobi para selar" na run.
 * - As técnicas ÚNICAS de um shinobi só entram no pool de outros depois que ele foi selado pela primeira vez.
 * - Técnicas de outros shinobis precisam de 100% de pesquisa para entrar no Plano de build (passiva "Pesquisa" acelera).
 * Tudo em localStorage com try/catch; sem armazenamento, vale só nesta sessão.
 */
export const STARTER_HEROES = ['naruto', 'sasuke', 'sakura'];
const UNLOCKED_KEY = 'sb_unlocked_heroes_v1';
const SEALED_KEY = 'sb_sealed_heroes_v1';
const RESEARCH_KEY = 'sb_research_v1';

/** Pesquisa ganha por técnica quando ela é aprendida/melhorada na run (× (1 + 25% por nível da passiva Pesquisa)). */
export const RESEARCH_RULES = { perLearn: .25, perLevel: .25 };

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: vale só nesta sessão */ }
  try { window.dispatchEvent(new CustomEvent('shinobi-account')); } catch { /* fora do navegador */ }
}

/** Em DEV com ?test todos os shinobis ficam jogáveis (testes automáticos escolhem qualquer um). */
function testMode() {
  try { return Boolean(import.meta.env?.DEV) && new URLSearchParams(location.search).has('test'); } catch { return false; }
}
let allUnlockedOverride = false;
/** Debug: libera todos os shinobis nesta sessão (não grava). */
export function setAllUnlocked(on: boolean) { allUnlockedOverride = on; write('sb_account_ping', Date.now()); }

export function unlockedHeroes(): Set<string> {
  return new Set([...STARTER_HEROES, ...read<string[]>(UNLOCKED_KEY, [])]);
}
export function isHeroPlayable(id: string) { return allUnlockedOverride || testMode() || unlockedHeroes().has(id); }
export function sealedHeroes(): Set<string> { return new Set(read<string[]>(SEALED_KEY, [])); }

/** Selamento de conta: libera o shinobi para jogar e libera as técnicas únicas dele para os outros. */
export function sealForAccount(id: string) {
  const unlocked = new Set(read<string[]>(UNLOCKED_KEY, [])); unlocked.add(id); write(UNLOCKED_KEY, [...unlocked]);
  const sealed = sealedHeroes(); sealed.add(id); write(SEALED_KEY, [...sealed]);
}

export function researchProgress(): Record<string, number> { return read<Record<string, number>>(RESEARCH_KEY, {}); }
export function addResearch(technique: string, amount: number) {
  const all = researchProgress();
  all[technique] = Math.min(1, (all[technique] || 0) + Math.max(0, amount));
  write(RESEARCH_KEY, all);
  return all[technique];
}
export function researchGain(base: number, pesquisaLevel: number) { return base * (1 + .25 * Math.max(0, Math.min(4, pesquisaLevel))); }

/** Reset da conta (debug): volta aos iniciais, sem selados e sem pesquisa. */
export function resetAccount() { write(UNLOCKED_KEY, []); write(SEALED_KEY, []); write(RESEARCH_KEY, {}); }
