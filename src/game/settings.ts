/**
 * Configurações do jogador (locais, neste navegador), no formato da referência (Som, Gráficos, Tela, Controles,
 * Teclas, Interface, Idioma, Conta). Persistidas em localStorage com try/catch; se o armazenamento falhar vale o padrão.
 * `currentSettings()` é lido pela simulação a cada quadro, então mudanças valem na hora (evento `shinobi-settings`).
 */
export type Quality = 'alta' | 'media' | 'baixa';
export type Resolution = 'auto' | 'nativa' | '900p' | '720p';
/** Placa de vídeo escolhida pelo jogador (Gráficos). No .exe vira a seleção direta de GPU. */
export type GpuChoice = 'auto' | 'desempenho' | 'integrada';
/** Renderizador escolhido pelo jogador (Tela). No .exe/patch o jogador escolhe DirectX ou OpenGL; na web a renderização é sempre WebGL (melhor esforço do navegador). */
export type Renderer = 'directx' | 'opengl';
export type PickupFx = 'completos' | 'simples' | 'nenhum';
/** Ações remapeáveis. O valor é a tecla (event.key em minúsculas; ' ' = Espaço). Esc não é remapeável. */
export type KeyAction = 'up' | 'down' | 'left' | 'right' | 'jump' | 'slide' | 'interact' | 'ultimate' | 'autoUlt' | 'bigMap' | 'quickMap' | 'sheet' | 'ping' | 'hideFx' | 'reroll' | 'skip' | 'ban';
export const DEFAULT_KEYS: Record<KeyAction, string> = { up: 'w', down: 's', left: 'a', right: 'd', jump: ' ', slide: 'shift', interact: 'e', ultimate: 'r', autoUlt: 'y', bigMap: 'm', quickMap: 'tab', sheet: 'p', ping: 'g', hideFx: 'h', reroll: 'f', skip: 'x', ban: 'z' };
export const KEY_LABELS: Record<KeyAction, string> = { up: 'Avançar', down: 'Recuar', left: 'Mover para a esquerda', right: 'Mover para a direita', jump: 'Pular', slide: 'Deslizar', interact: 'Interagir', ultimate: 'Ultimate', autoUlt: 'Ultimate automática', bigMap: 'Mapa grande', quickMap: 'Mapa rápido', sheet: 'Ficha / pausa', ping: 'Marcar um ponto', hideFx: 'Ocultar efeitos e números', reroll: 'Atualizar (subida de nível)', skip: 'Pular (subida de nível)', ban: 'Banir (subida de nível)' };

export type GameSettings = {
  /** Card/animação de captura (ritual de selamento). Desligado: sela direto com um aviso. */
  sealAnimation: boolean;
  // Som
  volume: number; sfxVolume: number; voiceVolume: number; musicVolume: number; voiceLanguage: 'pt' | 'ja'; muteInBackground: boolean;
  // Gráficos
  quality: Quality; fpsLimit: number; vsync: boolean; gpu: GpuChoice; hideMyAttacks: boolean; showTechniqueAreas: boolean; discreetDrops: boolean; pickupFx: PickupFx; showFps: boolean; damageNumbers: boolean;
  // Tela
  resolution: Resolution; renderer: Renderer;
  // Controles
  mouseSensitivity: number; invertY: boolean; cameraDistance: number; autoUltimate: boolean;
  // Teclas
  keys: Record<KeyAction, string>;
  // Interface
  hudScale: number; hudOpacity: number; minimap: boolean; minimapScale: number; toasts: boolean;
  // Conta
  playerName: string;
  /** Versão do formato salvo (migrações de padrão). 2 = rodada 55 (música padrão 10%). */
  settingsVersion: number;
};
/** Rodada 55 (pedido do usuário: "abaixar a música na configuração padrão… cerca de 10%"): padrão da música 0,7 → 0,1. */
const MUSIC_DEFAULT = .1, OLD_MUSIC_DEFAULT = .7, SETTINGS_VERSION = 2;
export const DEFAULT_SETTINGS: GameSettings = {
  sealAnimation: true,
  volume: .7, sfxVolume: 1, voiceVolume: .8, musicVolume: MUSIC_DEFAULT, voiceLanguage: 'pt', muteInBackground: true,
  quality: 'alta', fpsLimit: 0, vsync: true, gpu: 'desempenho', hideMyAttacks: false, showTechniqueAreas: true, discreetDrops: false, pickupFx: 'simples', showFps: true, damageNumbers: true,
  resolution: 'auto', renderer: 'directx',
  mouseSensitivity: 1, invertY: false, cameraDistance: 19, autoUltimate: false,
  keys: { ...DEFAULT_KEYS },
  hudScale: 1, hudOpacity: 1, minimap: true, minimapScale: 1, toasts: true,
  playerName: 'Shinobi',
  settingsVersion: SETTINGS_VERSION,
};
const KEY = 'sb_settings_v1';

function load(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as Partial<GameSettings> : {};
    const keys = { ...DEFAULT_KEYS, ...(parsed.keys ?? {}) };
    if (keys.sheet === 'tab') { keys.sheet = 'p'; keys.quickMap = 'tab'; }
    // Migração v1 → v2: quem salvou a música exatamente no padrão antigo (70%) passa ao novo padrão (10%);
    // qualquer outro valor salvo é escolha do jogador e fica como está.
    if ((parsed.settingsVersion ?? 1) < SETTINGS_VERSION && parsed.musicVolume === OLD_MUSIC_DEFAULT) parsed.musicVolume = MUSIC_DEFAULT;
    return { ...DEFAULT_SETTINGS, ...parsed, keys, settingsVersion: SETTINGS_VERSION };
  } catch { return { ...DEFAULT_SETTINGS, keys: { ...DEFAULT_KEYS } }; }
}
let current: GameSettings = load();

export function readSettings(): GameSettings { return current; }
/** Leitura barata para a simulação (mesmo objeto de `readSettings`). */
export function currentSettings(): GameSettings { return current; }

export function saveSettings(next: GameSettings): void {
  current = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sem armazenamento: vale só nesta sessão */ }
  try { window.dispatchEvent(new CustomEvent('shinobi-settings')); } catch { /* fora do navegador */ }
}

/** Remapeia uma ação; se outra ação usava a mesma tecla, as duas trocam. */
export function rebind(settings: GameSettings, action: KeyAction, key: string): GameSettings {
  if (key === 'tab' && action !== 'quickMap') return settings;
  const keys = { ...settings.keys };
  const other = (Object.keys(keys) as KeyAction[]).find((a) => a !== action && keys[a] === key);
  if (other) keys[other] = keys[action];
  keys[action] = key;
  return { ...settings, keys };
}

/**
 * Traduz a tecla apertada para a tecla PADRÃO da ação (a simulação continua comparando com as teclas padrão).
 * Ex.: se "Interagir" foi trocado para F e "Atualizar" para E, apertar F vira 'e' e apertar E vira 'f'.
 */
export function translateKey(raw: string): string {
  const keys = current.keys;
  for (const action of Object.keys(keys) as KeyAction[]) if (keys[action] === raw) return DEFAULT_KEYS[action];
  // Tecla padrão que agora pertence a outra ação e não foi atribuída: deixa de valer (evita ação dupla).
  if ((Object.values(DEFAULT_KEYS) as string[]).includes(raw)) return '';
  return raw;
}

/** Nome legível da tecla para a interface. */
export function keyName(key: string) {
  if (key === ' ') return 'Espaço';
  if (key === 'tab') return 'Tab';
  if (key.startsWith('arrow')) return { arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→' }[key] ?? key;
  return key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
}

/** Pixel ratio do renderizador conforme resolução e qualidade. */
export function pixelRatioFor(s: GameSettings) {
  const dpr = window.devicePixelRatio || 1;
  const base = s.resolution === 'nativa' ? dpr : s.resolution === '900p' ? Math.min(dpr, 900 / Math.max(1, window.innerHeight)) : s.resolution === '720p' ? Math.min(dpr, 720 / Math.max(1, window.innerHeight)) : Math.min(dpr, 1.5);
  return Math.max(.4, base * (s.quality === 'alta' ? 1 : s.quality === 'media' ? .85 : .65));
}
