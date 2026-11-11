import { useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_KEYS, DEFAULT_SETTINGS, KEY_LABELS, keyName, rebind, type GameSettings, type KeyAction } from '../game/settings';
import { resetAccount } from '../game/account';
import '../settings.css';

/**
 * Tela de Configurações no formato da referência do usuário: menu de categorias à esquerda e painel colorido à direita.
 * Tudo é salvo na hora (localStorage) e vale ao vivo na partida. O que o jogo ainda não tem aparece como "em breve".
 */
type Category = 'som' | 'graficos' | 'tela' | 'controles' | 'teclas' | 'interface' | 'idioma' | 'conta';
const CATEGORIES: { id: Category; icon: string; title: string; subtitle: string; color: string }[] = [
  { id: 'som', icon: '🔊', title: 'Som', subtitle: 'Volume, efeitos e vozes', color: '#f08a2c' },
  { id: 'graficos', icon: '✨', title: 'Gráficos', subtitle: 'Qualidade, FPS e efeitos', color: '#3b82f6' },
  { id: 'tela', icon: '🖥️', title: 'Tela', subtitle: 'Tela cheia e resolução', color: '#3b82f6' },
  { id: 'controles', icon: '🎮', title: 'Controles', subtitle: 'Câmera e Ultimate', color: '#22c55e' },
  { id: 'teclas', icon: '⌨️', title: 'Teclas', subtitle: 'Mude teclas e botões', color: '#eab308' },
  { id: 'interface', icon: '🧭', title: 'Interface', subtitle: 'Tamanho e o que aparece', color: '#ef4444' },
  { id: 'idioma', icon: '🌐', title: 'Idioma', subtitle: 'Textos do jogo', color: '#8b5cf6' },
  { id: 'conta', icon: '👤', title: 'Conta', subtitle: 'Nome, reinício e dados locais', color: '#ef4444' },
];

function Card({ title, hint, children, wide }: { title: string; hint?: string; children?: ReactNode; wide?: boolean }) {
  return <div className={`st-card ${wide ? 'wide' : ''}`}><div className="st-card-head"><b>{title}</b>{hint && <small>{hint}</small>}</div>{children}</div>;
}
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={value} className={`st-toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}><i /></button>;
}
function Slider({ value, min, max, step, format, onChange }: { value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return <div className="st-slider"><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /><em>{format(value)}</em></div>;
}
function Choice<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string; soon?: boolean }[]; onChange: (v: T) => void }) {
  return <div className="st-choice">{options.map((o) => <button type="button" key={String(o.value)} disabled={o.soon} title={o.soon ? 'Em breve' : undefined} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>{o.label}{o.soon && <small> · em breve</small>}</button>)}</div>;
}
const pct = (v: number) => Math.round(v * 100) + '%';

export function SettingsScreen({ settings, onChange, onClose }: { settings: GameSettings; onChange: (next: GameSettings) => void; onClose: () => void }) {
  const [category, setCategory] = useState<Category>('som');
  const [listening, setListening] = useState<KeyAction | null>(null);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch });
  const meta = CATEGORIES.find((c) => c.id === category)!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (listening) {
        e.preventDefault(); e.stopPropagation();
        if (e.key !== 'Escape') onChange(rebind(settings, listening, e.key.toLowerCase()));
        setListening(null); return;
      }
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', onKey, true);
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => { window.removeEventListener('keydown', onKey, true); document.removeEventListener('fullscreenchange', onFs); };
  }, [listening, settings, onChange, onClose]);

  const restore = () => {
    const d = DEFAULT_SETTINGS;
    const by: Record<Category, Partial<GameSettings>> = {
      som: { volume: d.volume, sfxVolume: d.sfxVolume, voiceVolume: d.voiceVolume, voiceLanguage:d.voiceLanguage, muteInBackground: d.muteInBackground },
      graficos: { quality: d.quality, fpsLimit: d.fpsLimit, autoPerformance: d.autoPerformance, hideMyAttacks: d.hideMyAttacks, discreetDrops: d.discreetDrops, pickupFx: d.pickupFx, showFps: d.showFps, damageNumbers: d.damageNumbers },
      tela: { resolution: d.resolution },
      controles: { mouseSensitivity: d.mouseSensitivity, invertY: d.invertY, cameraDistance: d.cameraDistance, autoUltimate: d.autoUltimate, sealAnimation: d.sealAnimation },
      teclas: { keys: { ...DEFAULT_KEYS } },
      interface: { hudScale: d.hudScale, hudOpacity: d.hudOpacity, minimap: d.minimap, minimapScale: d.minimapScale, toasts: d.toasts },
      idioma: {}, conta: {},
    };
    set(by[category]);
  };

  return <div className="st-backdrop" role="dialog" aria-label="Configurações">
    <header className="st-top"><button type="button" className="st-back" onClick={onClose}><kbd>Esc</kbd> Voltar</button><h1>Configurações <small>São salvas na hora</small></h1></header>
    <nav className="st-nav">{CATEGORIES.map((c) => <button type="button" key={c.id} className={category === c.id ? 'active' : ''} style={{ ['--cat' as string]: c.color }} onClick={() => { setCategory(c.id); setListening(null); }}><span className="st-icon">{c.icon}</span><span><b>{c.title}</b><small>{c.subtitle}</small></span></button>)}</nav>
    <section className="st-panel" style={{ ['--cat' as string]: meta.color }}>
      <div className="st-panel-head"><span className="st-icon">{meta.icon}</span><div><h2>{meta.title}</h2><small>{meta.subtitle}</small></div>{!['idioma', 'conta'].includes(category) && <button type="button" className="st-restore" onClick={restore}>↺ Restaurar</button>}</div>
      <div className="st-grid">
        {category === 'som' && <>
          <Card title="Volume geral"><Slider value={settings.volume} min={0} max={1} step={.05} format={pct} onChange={(v) => set({ volume: v })} /></Card>
          <Card title="Efeitos" hint="Golpes, coleta, Ultimate"><Slider value={settings.sfxVolume} min={0} max={1} step={.05} format={pct} onChange={(v) => set({ sfxVolume: v })} /></Card>
          <Card title="Vozes" hint="Gritos dos shinobis (ex.: Yoooo do Guy)"><Slider value={settings.voiceVolume} min={0} max={1} step={.05} format={pct} onChange={(v) => set({ voiceVolume: v })} /></Card>
          <Card title="Idioma das vozes" hint="Usa as vozes instaladas no dispositivo"><select value={settings.voiceLanguage} onChange={e=>set({voiceLanguage:e.target.value==='ja'?'ja':'pt'})}><option value="pt">Português</option><option value="ja">Japonês</option></select></Card>
          <Card title="Música" hint="O jogo ainda não tem trilha sonora · em breve" />
          <Card title="Silenciar em segundo plano" hint="Sem som quando a aba não está visível"><Toggle value={settings.muteInBackground} onChange={(v) => set({ muteInBackground: v })} /></Card>
        </>}
        {category === 'graficos' && <>
          <Card title="Qualidade" hint="Baixa dá mais desempenho"><Choice value={settings.quality} options={[{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Média' }, { value: 'baixa', label: 'Baixa' }]} onChange={(v) => set({ quality: v })} /></Card>
          <Card title="Limite de FPS" hint="Menos FPS = imagem mais estável e menos calor"><Choice value={settings.fpsLimit} options={[{ value: 0, label: 'Sem limite' }, { value: 30, label: '30' }, { value: 60, label: '60' }, { value: 90, label: '90' }, { value: 120, label: '120' }, { value: 144, label: '144' }]} onChange={(v) => set({ fpsLimit: v })} /></Card>
          <Card title="Ajuste automático de desempenho" hint="Quando o FPS cai, reduz a resolução da imagem até rodar liso e devolve quando sobra folga. Não altera o dano nem a jogabilidade"><Toggle value={settings.autoPerformance} onChange={(v) => set({ autoPerformance: v })} /></Card>
          <Card title="Ocultar meus ataques" hint="Começa a partida sem desenhar os efeitos dos seus golpes (H alterna). O dano continua igual"><Toggle value={settings.hideMyAttacks} onChange={(v) => set({ hideMyAttacks: v })} /></Card>
          <Card title="Números de dano"><Toggle value={settings.damageNumbers} onChange={(v) => set({ damageNumbers: v })} /></Card>
          <Card title="Drops discretos" hint="EXP, Ryu e Chakra menores; são coletados igual"><Toggle value={settings.discreetDrops} onChange={(v) => set({ discreetDrops: v })} /></Card>
          <Card title="Efeitos de coleta" hint="Nenhum: sem som ao coletar. Dá mais FPS com muitos drops"><Choice value={settings.pickupFx} options={[{ value: 'completos', label: 'Completos' }, { value: 'simples', label: 'Simples' }, { value: 'nenhum', label: 'Nenhum' }]} onChange={(v) => set({ pickupFx: v })} /></Card>
          <Card title="Mostrar FPS"><Toggle value={settings.showFps} onChange={(v) => set({ showFps: v })} /></Card>
          <Card title="Tremor de tela e brilho dos efeitos" hint="Em breve" />
        </>}
        {category === 'tela' && <>
          <Card title="Modo de tela" hint="Também com F11" wide><Choice value={fullscreen ? 'cheia' : 'janela'} options={[{ value: 'cheia', label: 'Tela cheia' }, { value: 'janela', label: 'Janela' }]} onChange={(v) => { void (v === 'cheia' ? document.documentElement.requestFullscreen() : document.fullscreenElement ? document.exitFullscreen() : Promise.resolve()).catch(() => { }); }} /></Card>
          <Card title="Resolução" hint="Automática baixa a resolução em telas grandes para rodar liso; Nativa usa todos os pixels da tela" wide><Choice value={settings.resolution} options={[{ value: 'auto', label: 'Automática' }, { value: 'nativa', label: 'Nativa' }, { value: '900p', label: '900p' }, { value: '720p', label: '720p' }]} onChange={(v) => set({ resolution: v })} /></Card>
          <Card title="Monitor e motor gráfico" hint="Escolhidos pelo navegador na versão web" wide />
        </>}
        {category === 'controles' && <>
          <Card title="Sensibilidade do mouse" hint="Giro e inclinação ao mover o mouse"><Slider value={settings.mouseSensitivity} min={.2} max={3} step={.05} format={(v) => v.toFixed(2)} onChange={(v) => set({ mouseSensitivity: v })} /></Card>
          <Card title="Inverter eixo Y"><Toggle value={settings.invertY} onChange={(v) => set({ invertY: v })} /></Card>
          <Card title="Distância da câmera" hint="Também com a roda do mouse"><Slider value={settings.cameraDistance} min={10} max={32} step={.5} format={(v) => v.toFixed(1)} onChange={(v) => set({ cameraDistance: v })} /></Card>
          <Card title="Ultimate automática ao começar" hint="Y (ou o selo AUTO) continua alternando na partida"><Toggle value={settings.autoUltimate} onChange={(v) => set({ autoUltimate: v })} /></Card>
          <Card title="Card e animação de captura" hint="Desligado: o shinobi é selado direto com um aviso; equipe cheia ainda abre a troca"><Toggle value={settings.sealAnimation} onChange={(v) => set({ sealAnimation: v })} /></Card>
          <Card title="Mira manual e controle (gamepad)" hint="Em breve" />
        </>}
        {category === 'teclas' && <>
          <Card title="Como mudar" hint="Clique numa caixa e aperte a tecla que quiser (Esc cancela). Se outra ação usava a tecla, as duas trocam. Esc é sempre a pausa; setas também movem" wide />
          {(Object.keys(KEY_LABELS) as KeyAction[]).map((a) => <div className="st-card st-key" key={a}><b>{KEY_LABELS[a]}</b><button type="button" className={listening === a ? 'listening' : ''} onClick={() => setListening(a)}>{listening === a ? 'Aperte…' : keyName(settings.keys[a])}</button></div>)}
          <div className="st-card st-key soon"><b>Pulo · Deslizar</b><button type="button" disabled>em breve</button></div>
        </>}
        {category === 'interface' && <>
          <Card title="Tamanho da interface" hint="Cartões e barras dentro da partida"><Slider value={settings.hudScale} min={.6} max={1.4} step={.05} format={pct} onChange={(v) => set({ hudScale: v })} /></Card>
          <Card title="Opacidade da interface"><Slider value={settings.hudOpacity} min={.3} max={1} step={.05} format={pct} onChange={(v) => set({ hudOpacity: v })} /></Card>
          <Card title="Minimapa"><Toggle value={settings.minimap} onChange={(v) => set({ minimap: v })} /></Card>
          <Card title="Tamanho do minimapa"><Slider value={settings.minimapScale} min={.6} max={1.6} step={.05} format={pct} onChange={(v) => set({ minimapScale: v })} /></Card>
          <Card title="Avisos" hint="Mensagens de itens, eventos e chefes"><Toggle value={settings.toasts} onChange={(v) => set({ toasts: v })} /></Card>
          <Card title="Tema claro e dicas das primeiras partidas" hint="Em breve" />
        </>}
        {category === 'idioma' && <Card title="Idioma do jogo" hint="Os textos do jogo estão em português; outros idiomas em breve" wide><Choice value="pt" options={[{ value: 'pt', label: 'Português (Brasil)' }, { value: 'es', label: 'Español', soon: true }, { value: 'en', label: 'English', soon: true }]} onChange={() => { }} /></Card>}
        {category === 'conta' && <>
          <Card title="Nome do jogador" hint="Apelido exibido ao passar sobre o cartão do perfil" wide><input className="st-input" maxLength={20} value={settings.playerName} onChange={(e) => set({ playerName: e.target.value })} /></Card>
          <Card title="Começar do zero" hint="Volta aos 3 shinobis iniciais, apaga selados, pesquisa e progresso dos mapas. Lamens e Passivas ficam" wide><button type="button" className="st-danger" onClick={() => { if (window.confirm('Começar do zero? Shinobis desbloqueados, pesquisa e progresso dos mapas serão apagados.')) resetAccount(); }}>Reiniciar progresso</button></Card>
          <Card title="Apagar todos os dados locais" hint="Apaga tudo do ShinobiBonk neste navegador (conta, Lamens, passivas, configurações, run salva)" wide><button type="button" className="st-danger" onClick={() => { if (window.confirm('Apagar TODOS os dados do jogo neste navegador?')) { try { Object.keys(localStorage).filter((k) => k.startsWith('sb_')).forEach((k) => localStorage.removeItem(k)); } catch { /* sem armazenamento */ } location.reload(); } }}>Apagar dados</button></Card>
        </>}
      </div>
    </section>
  </div>;
}
