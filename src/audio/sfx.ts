import type { Technique } from '../game/heroes';
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


let lastVoice = -Infinity;
const japanese: Record<string,string> = {
  Rasengan:'螺旋丸！', 'Kage Bunshin':'影分身の術！', Chidori:'千鳥！', Raikiri:'雷切！',
  Amaterasu:'天照！', Tsukuyomi:'月読！', 'Modo Sábio':'仙人モード！', 'Punho Senju':'せんじゅ！',
};
function speak(name:string, intro=false) {
  const settings=currentSettings();
  const volume=settings.volume*settings.voiceVolume;
  if(volume<=.001||(settings.muteInBackground&&document.hidden)||!('speechSynthesis' in window))return false;
  const synth=window.speechSynthesis;
  if(!synth)return false;
  if(!intro&&(synth.speaking||performance.now()-lastVoice<6500))return false;
  const voices=synth.getVoices().filter(v=>v.localService);
  const voice=voices.find(v=>v.lang.toLowerCase().startsWith(settings.voiceLanguage==='ja'?'ja':'pt'));
  if(!voice)return false;
  if(intro)synth.cancel();
  const text=intro?(settings.voiceLanguage==='ja'?'よおおお！':'Iôôôôô!'):(settings.voiceLanguage==='ja'?japanese[name]:name+'!');
  if(!text)return false;
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.voice=voice;utterance.lang=voice.lang;utterance.volume=Math.min(1,volume);
  utterance.rate=intro?.75:1.12;utterance.pitch=intro?1.13:1;
  lastVoice=performance.now();synth.speak(utterance);return true;
}

function sweep(frequency:number,end:number,length:number,strength:number,noise=false){
  const settings=currentSettings();
  if(strength<=.001||(settings.muteInBackground&&document.hidden))return;
  const ctx=audio();if(!ctx)return;
  const now=ctx.currentTime,filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  filter.type='bandpass';filter.Q.value=noise?.85:3;
  filter.frequency.setValueAtTime(frequency,now);
  filter.frequency.exponentialRampToValueAtTime(end,now+length);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(strength,now+.024);
  gain.gain.exponentialRampToValueAtTime(.0001,now+length);
  filter.connect(gain);gain.connect(ctx.destination);
  if(noise){
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate);
    const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const source=ctx.createBufferSource();source.buffer=buffer;source.connect(filter);source.start(now);
  }else{
    const source=ctx.createOscillator();source.type='sawtooth';source.frequency.setValueAtTime(190,now);
    source.frequency.exponentialRampToValueAtTime(125,now+length);source.connect(filter);source.start(now);source.stop(now+length);
  }
}
export function playYooo(){
  const settings=currentSettings();
  if(speak('',true))return;
  const strength=settings.volume*settings.voiceVolume*.13;
  sweep(380,520,.65,strength);
  sweep(1450,820,.65,strength*.7);
}
let lastCast=-Infinity;
/** Intervalos mínimos das falas de técnicas comuns (ms). */
export const VOICE_RULES={global:15000,perTechnique:60000};
let lastTechniqueVoice=-Infinity;const lastVoiceByTechnique:Record<string,number>={};
export function playTechniqueSound(t:Technique,ultimate=false){
  const now=performance.now();if(!ultimate&&now-lastCast<90)return;lastCast=now;
  const s=currentSettings(),volume=s.volume*s.sfxVolume;
  if(/kunai|shuriken|senbon|agulhas/i.test(t.name))sweep(6500,900,.16,.22*volume,true);
  else if(t.element==='Raio')sweep(2500,580,.2,.18*volume,true);
  else if(t.element==='Fogo'||t.element==='Areia')sweep(480,170,.28,.23*volume,true);
  else if(t.element==='Madeira'||t.school==='Taijutsu')sweep(750,160,.13,.20*volume,true);
  else sweep(870,380,.2,.13*volume,t.shape==='Onda');
  // Falas: a Ultimate sempre fala; técnicas comuns no máximo 1 vez a cada VOICE_RULES.perTechnique por técnica e
  // VOICE_RULES.global entre falas (antes a técnica inicial, lançada a cada ~1,5 s, repetia a fala a cada 6,5 s).
  if(ultimate){speak(t.name);return;}
  if(!japanese[t.name]||now-lastTechniqueVoice<VOICE_RULES.global||now-(lastVoiceByTechnique[t.name]??-Infinity)<VOICE_RULES.perTechnique)return;
  if(speak(t.name)){lastTechniqueVoice=now;lastVoiceByTechnique[t.name]=now;}
}
