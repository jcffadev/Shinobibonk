/**
 * Configurações do jogador (locais, neste navegador). Persistidas em localStorage com try/catch:
 * se o armazenamento falhar (janela privada, bloqueio), vale o padrão.
 */
export type GameSettings = {
  /**
   * Card/animação de captura do mega elite (ritual de selamento).
   * Desligado: o shinobi derrotado é selado direto, sem pausar a run, e só aparece um aviso (toast).
   * Com a equipe cheia, a tela de substituição de ajudantes abre mesmo assim (é uma decisão do jogador).
   */
  sealAnimation: boolean;
};
export const DEFAULT_SETTINGS: GameSettings = { sealAnimation: true };
const KEY = 'sb_settings_v1';

export function readSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(next: GameSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sem armazenamento: vale só nesta sessão */ }
}
