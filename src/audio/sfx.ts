import type { Technique } from '../game/heroes';
import { familyOf } from '../game/heroes';
import { currentSettings } from '../game/settings';
type Sound = 'attack' | 'impact' | 'pickup' | 'ultimate' | 'ui' | 'explosion';
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
    /** Explosão das armadilhas shinobi do Caça-Níquel (rodada 37): grave descendo, sem gravação externa. */
    explosion: [[160, .18, 'sawtooth'], [85, .3, 'triangle'], [48, .5, 'sawtooth']],
  };
  let offset = 0;
  for (const [frequency, duration, type] of notes[kind]) {
    const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now + offset);
    if (kind === 'ultimate') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.8, now + offset + duration);
    if (kind === 'explosion') oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, frequency * .45), now + offset + duration);
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
/** Fallback sintetizado do "YOOOO" (se o arquivo real falhar ou o áudio não estiver disponível). */
function yoooFallback(){
  const settings=currentSettings();
  if(speak('',true))return;
  const strength=settings.volume*settings.voiceVolume*.13;
  sweep(380,520,.65,strength);
  sweep(1450,820,.65,strength*.7);
}
let yoooClip:HTMLAudioElement|null=null;
/** "YOOOO" real do usuário (arquivo baixado por ele) — integra no botão Jogar/Jogar-como-convidado.
 *  Pedido do usuário (12/11): começa a partir do 1º segundo do áudio (corte). */
export function playYooo(){
  const settings=currentSettings();
  if(settings.muteInBackground&&document.hidden)return;
  const volume=Math.max(0,settings.volume*settings.voiceVolume);
  if(volume<=.001)return;
  try{
    if(!yoooClip){yoooClip=new Audio('/assets/audio/yooo.mp3');yoooClip.preload='auto';yoooClip.load();}
    const clip=yoooClip;
    clip.currentTime=1.0;
    clip.volume=Math.min(1,volume);
    const started=clip.play();
    if(started&&typeof started.catch==='function')started.catch(()=>yoooFallback());
    return;
  }catch{ /* áudio indisponível → fallback sintetizado */ }
  yoooFallback();
}
let lastCast=-Infinity;
/** Intervalos mínimos das falas de técnicas comuns (ms). */
export const VOICE_RULES={global:15000,perTechnique:60000};
let lastTechniqueVoice=-Infinity;const lastVoiceByTechnique:Record<string,number>={};
/** Anti-spam de som (regra do usuário, 12/11): o PRÓXIMO som de jutsu só pode tocar quando o ANTERIOR
 *  TERMINAR — NÃO é fila (evita pilha de áudios que se acumula até o fim da run). */
let jutsuSoundEndsAt=-Infinity;
function jutsuGate(lengthSeconds:number,slackMs=120){
  const now=performance.now();
  if(now<jutsuSoundEndsAt)return false;
  jutsuSoundEndsAt=now+lengthSeconds*1000+slackMs;
  return true;
}
// ---------- Rodada 43 — sons reais de jutsu (MP3 entregues pelo usuário, 12/11) ----------
// Kage Bunshin no Jutsu → apenas o Naruto (família) · Ultimate do Pain (Yahiko) → som de Shinra Tensei.
const JUTSU_CLIP_RULES:{test:(t:Technique,ultimate:boolean,family:string)=>boolean;src:string}[]=[
  {test:(t,_u,f)=>t.name==='Kage Bunshin'&&f==='naruto',src:'/assets/audio/kage-bunshin.mp3'},
  {test:(t,u,f)=>u&&f==='pain'&&t.name==='Chibaku Tensei',src:'/assets/audio/shinra-tensei.mp3'},
];
let activeJutsuClip:HTMLAudioElement|null=null;
function jutsuClipFor(t:Technique,ultimate:boolean,casterId?:string):string|undefined{
  if(!casterId)return;
  const family=familyOf(casterId);
  return JUTSU_CLIP_RULES.find(r=>r.test(t,ultimate,family))?.src;
}
/** Toca o MP3 do jutsu respeitando a regra anti-spam do usuário (12/11): o próximo som só entra quando o
 *  anterior TERMINAR — NÃO é fila (se o anterior ainda toca, o próximo é ignorado; sem pilha de áudios). */
function playJutsuClip(src:string){
  if(activeJutsuClip)return;
  const s=currentSettings();
  if(s.muteInBackground&&document.hidden)return;
  const volume=Math.max(0,s.volume*s.sfxVolume);
  if(volume<=.001)return;
  let clip:HTMLAudioElement;
  try{clip=new Audio(src);}catch{return;}
  clip.preload='auto';clip.volume=Math.min(1,volume);
  const release=()=>{if(activeJutsuClip===clip)activeJutsuClip=null;};
  clip.addEventListener('ended',release);
  clip.addEventListener('error',release);
  try{
    const started=clip.play();
    if(started&&typeof started.catch==='function')started.catch(release);
    activeJutsuClip=clip;
  }catch{release();}
}
export function playTechniqueSound(t:Technique,ultimate=false,casterId?:string){
  const now=performance.now();if(!ultimate&&now-lastCast<90)return;lastCast=now;
  const s=currentSettings(),volume=s.volume*s.sfxVolume;
  // Sons reais do usuário (rodada 43): têm prioridade e sozinhos representam o jutsu — sem efeito sintetizado
  // e sem fala em cima (regra do usuário: nenhum áudio por cima de outro, só quando o anterior terminar).
  const clip=jutsuClipFor(t,ultimate,casterId);
  if(clip){playJutsuClip(clip);lastTechniqueVoice=now;lastVoiceByTechnique[t.name]=now;return;}
  if(activeJutsuClip)return;
  // Efeito do jutsu: respeita o gate "terminou antes do próximo" (o som anterior precisa acabar).
  if(/kunai|shuriken|senbon|agulhas/i.test(t.name)){if(jutsuGate(.16))sweep(6500,900,.16,.22*volume,true);}
  else if(t.element==='Raio'){if(jutsuGate(.2))sweep(2500,580,.2,.18*volume,true);}
  else if(t.element==='Fogo'||t.element==='Areia'){if(jutsuGate(.28))sweep(480,170,.28,.23*volume,true);}
  else if(t.element==='Madeira'||t.school==='Taijutsu'){if(jutsuGate(.13))sweep(750,160,.13,.20*volume,true);}
  else{if(jutsuGate(.2))sweep(870,380,.2,.13*volume,t.shape==='Onda');}
  // Falas: a Ultimate sempre fala; técnicas comuns no máximo 1 vez a cada VOICE_RULES.perTechnique por técnica e
  // VOICE_RULES.global entre falas (antes a técnica inicial, lançada a cada ~1,5 s, repetia a fala a cada 6,5 s).
  // A fala em si já só entra quando a anterior termina (speak() ignora se synth.speaking).
  if(ultimate){if(speak(t.name))jutsuSoundEndsAt=performance.now()+2400;return;}
  if(!japanese[t.name]||now-lastTechniqueVoice<VOICE_RULES.global||now-(lastVoiceByTechnique[t.name]??-Infinity)<VOICE_RULES.perTechnique)return;
  if(speak(t.name)){lastTechniqueVoice=now;lastVoiceByTechnique[t.name]=now;jutsuSoundEndsAt=performance.now()+2400;}
}
