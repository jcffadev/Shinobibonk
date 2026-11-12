/**
 * Rodada 42 — Trilha sonora do jogo (OST de Naruto, 15 faixas em MP3 enviadas pelo usuário, em /assets/music/).
 *
 * Regras do usuário (12/11/2026), na íntegra:
 *  - "Música ao acessar o jogo sempre que abrir/navegador/.exe/.patch/ - primeira música do jogo sempre" → BOOT fixa.
 *  - "Trilha Durante os menu's/fora da run ordem aleatória" → pool de MENU (4 faixas).
 *  - "Durante as runs desde o inicio da run - ordem aleatória" → pool de RUN (7 faixas).
 *  - "ordem aleatória ou ao iniciar luta contra as bijuus" → "The Raising Fighting Spirit" entra no pool de RUN
 *    E é a trilha da luta contra a bijū (decisão registrada: gatilho momentâneo; após a luta volta ao pool de RUN).
 *  - "Ao morrer e perder a run, tocar essa música." → "Grief and Sorrow" (toca em loop no resumo da run).
 *  - "Quando jogar de 'Hinata/Neji' iniciar a run com essa música, apenas essa condição" → override por família.
 *  - "Quando jogar com alguma variante de Sasuke iniciar a run com essa musica, apenas essa condição" → override por família.
 *
 * Decisões desta rodada (registradas para o usuário validar):
 *  - UMA faixa por vez, SEM fila (mesma filosofia do anti-spam de som de jutsu): ao terminar, sorteia a próxima
 *    do pool atual, sem repetir a faixa anterior.
 *  - Vitória (missão concluída) volta ao pool de MENUS — a faixa de derrota é exclusiva de perder a run.
 *  - Fade-in curto (~0,9 s) na entrada de cada faixa; sem crossfade.
 *  - Volume = settings.volume × settings.musicVolume (novo slider "Música" em Configurações › Som);
 *    "Silenciar em segundo plano" também silencia a música quando a aba fica invisível.
 *  - Autoplay: o browser pode bloquear a faixa do boot; a pendência é liberada na primeira interação
 *    (click/keydown), o que coincide com os cliques "Jogar" que já chamam playYooo().
 *
 * Padrão de robustez copiado de sfx.ts (playYooo): play() em promise com catch silencioso —
 * falha de autoplay/arquivo NUNCA quebra o jogo nem gera unhandledrejection (o verify-runtime captura pageerror).
 */
import { currentSettings } from '../game/settings';

const BOOT_TRACK = 'ill-do-it-right';
const DEFEAT_TRACK = 'grief-and-sorrow';
const BIJUU_TRACK = 'raising-fighting-spirit';
const MENU_POOL = ['konohamarus-theme', 'afternoon-of-konoha', 'loneliness', 'swaying-necklace'];
const RUN_POOL = ['raising-fighting-spirit', 'heavy-violence', 'ultimate-secrets', 'sarutobi', 'bunta', 'beautiful-green-wild-beast', 'dance'];
/** Trilha de início de run por FAMÍLIA (familyOf) — "apenas essa condição" (qualquer variante do shinobi). */
const HERO_OVERRIDES: Record<string, string> = {
  hinata: 'hinata-vs-neji',
  neji: 'hinata-vs-neji',
  sasuke: 'sasukes-theme',
};

type MusicState = 'idle' | 'boot' | 'menu' | 'run' | 'bijuu' | 'defeat';

let state: MusicState = 'idle';
let lastTrack = '';
let activeClip: HTMLAudioElement | null = null;
let playRequest = 0;
let desired: { file: string; state: MusicState } | null = null;
let unlockArmed = false;
const clips = new Map<string, HTMLAudioElement>();

function targetVolume(): number {
  try {
    const s = currentSettings();
    if (s.muteInBackground && document.hidden) return 0;
    return Math.max(0, Math.min(1, s.volume * s.musicVolume));
  } catch { return 0; }
}

function ensureClip(file: string): HTMLAudioElement {
  let clip = clips.get(file);
  if (!clip) {
    clip = new Audio(`/assets/music/${file}.mp3`);
    clip.preload = 'auto';
    clips.set(file, clip);
  }
  return clip;
}

function stopCurrent(): void {
  if (!activeClip) return;
  try { activeClip.pause(); activeClip.currentTime = 0; } catch { /* elemento em transição de src/carregamento */ }
  activeClip = null;
}

function fadeIn(clip: HTMLAudioElement): void {
  clip.volume = 0;
  if (targetVolume() <= .001) return;
  const start = performance.now();
  const duration = 900;
  const tick = () => {
    if (activeClip !== clip) return;
    const k = Math.min(1, (performance.now() - start) / duration);
    clip.volume = targetVolume() * k;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Sorteia do pool sem repetir a faixa anterior (pool com 1 faixa: repete, inofensivo). */
function pick(pool: string[]): string {
  const candidates = pool.filter((file) => file !== lastTrack);
  const list = candidates.length ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

function armUnlock(): void {
  if (unlockArmed || typeof window === 'undefined') return;
  unlockArmed = true;
  const flush = () => {
    unlockArmed = false;
    window.removeEventListener('click', flush, true);
    window.removeEventListener('keydown', flush, true);
    if (!desired) return;
    const pending = desired;
    desired = null;
    requestPlay(pending.file, pending.state);
  };
  window.addEventListener('click', flush, true);
  window.addEventListener('keydown', flush, true);
}

function requestPlay(file: string, newState: MusicState): void {
  state = newState;
  desired = null;
  stopCurrent();
  const clip = ensureClip(file);
  lastTrack = file;
  activeClip = clip;
  clip.loop = newState === 'defeat'; // a faixa de derrota toca enquanto o resumo da run está aberto
  try { clip.currentTime = 0; } catch { /* ainda carregando */ }
  clip.onended = () => onEnded();
  clip.volume = 0;
  const request = ++playRequest;
  void clip.play().then(() => {
    if (request !== playRequest) return;
    window.dispatchEvent(new CustomEvent('shinobi-music-blocked', { detail: false }));
    fadeIn(clip);
  }).catch((error: unknown) => {
    if (request !== playRequest || !(error instanceof DOMException) || error.name !== 'NotAllowedError') return;
    desired = { file, state: newState };
    armUnlock();
    window.dispatchEvent(new CustomEvent('shinobi-music-blocked', { detail: true }));
  });
}

function onEnded(): void {
  if (state === 'boot') { requestPlay(pick(MENU_POOL), 'menu'); return; }
  if (state === 'defeat') return; // em loop
  const pool = state === 'menu' ? MENU_POOL : RUN_POOL;
  const next: MusicState = state === 'menu' ? 'menu' : 'run';
  requestPlay(pick(pool), next);
}

/** Abriu o jogo (navegador/.exe/.patch): SEMPRE "I'll Do It Right"; ao terminar → menus. */
export function startBoot(): void {
  if (state === 'boot') return;
  requestPlay(BOOT_TRACK, 'boot');
}

/** Menus / fora da run: pool aleatório. Idempotente — se já toca menu, continua a mesma faixa. */
export function playMenu(): void {
  if (state === 'menu' || state === 'boot') return;
  requestPlay(pick(MENU_POOL), 'menu');
}

/**
 * Início de run (chamar com `familyOf(heroId)`): override do herói primeiro (Hinata/Neji, qualquer Sasuke);
 * senão pool de RUN aleatório. Se já está em run, mantém a faixa atual.
 */
export function startRun(family: string): void {
  const override = HERO_OVERRIDES[family];
  if (override) { if (state !== 'run' || lastTrack !== override) requestPlay(override, 'run'); return; }
  if (state === 'run') return;
  requestPlay(pick(RUN_POOL), 'run');
}

/** Luta contra a bijū (gatilho em spawnBijuu): "The Raising Fighting Spirit". Só vale durante a run. */
export function playBijuu(): void {
  if (state !== 'run') return;
  if (lastTrack === BIJUU_TRACK) return;
  requestPlay(BIJUU_TRACK, 'bijuu');
}

/** Morte / perder a run: "Grief and Sorrow" (loop no resumo). */
export function playDefeat(): void {
  if (state === 'defeat') return;
  requestPlay(DEFEAT_TRACK, 'defeat');
}

// Configurações ao vivo: volume novo e "silenciar em segundo plano" valem para a faixa em reprodução.
try {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('shinobi-settings', () => { if (activeClip && !activeClip.paused) activeClip.volume = targetVolume(); });
    document.addEventListener('visibilitychange', () => { if (activeClip && !activeClip.paused) activeClip.volume = targetVolume(); });
  }
} catch { /* ambiente sem DOM (não acontece no jogo; só em testes) */ }
