import { currentSettings } from '../game/settings';
type Sound = 'attack' | 'impact' | 'pickup' | 'ultimate' | 'ui';
let context: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    const Ctx = window.AudioContext;
    if (!Ctx) return null;
    context ??= new Ctx();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch { return null; }
}

/** Efeitos curtos sintetizados no browser, sem gravações externas. */
export function playSfx(kind: Sound) {
  const S = currentSettings(); if (S.muteInBackground && document.hidden) return;
  const vol = Math.max(0, S.volume * S.sfxVolume); if (vol <= .001) return;
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  const notes: Record<Sound, [number, number, OscillatorType][]> = {
    attack: [[520, .07, 'triangle'], [760, .08, 'square']],
    impact: [[180, .1, 'sawtooth'], [90, .12, 'triangle']],
    pickup: [[660, .07, 'sine'], [880, .1, 'sine'], [1180, .12, 'sine']],
    ultimate: [[220, .12, 'sawtooth'], [330, .16, 'triangle'], [660, .25, 'sine']],
    ui: [[440, .055, 'sine']],
  };
  let offset = 0;
  for (const [frequency, duration, type] of notes[kind]) {
    const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now + offset);
    if (kind === 'ultimate') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.8, now + offset + duration);
    gain.gain.setValueAtTime(.0001, now + offset); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, (kind === 'attack' ? .025 : .055) * vol), now + offset + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
    oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(now + offset); oscillator.stop(now + offset + duration + .02);
    offset += kind === 'pickup' ? .075 : .035;
  }
}

export function playYooo() {
  playSfx('ultimate');
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const line = new SpeechSynthesisUtterance('Yoooo!');
  line.lang = 'pt-BR'; line.rate = .78; line.pitch = 1.18; line.volume = Math.max(0, Math.min(1, currentSettings().volume * currentSettings().voiceVolume));
  window.speechSynthesis.speak(line);
}
