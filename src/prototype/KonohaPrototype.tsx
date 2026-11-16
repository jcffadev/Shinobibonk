import { useEffect, useRef, useState } from 'react';
import { BENCHMARK_CASES, benchmarkLabel, type BenchmarkConfig, type BenchmarkResult } from './prototypeBenchmark';
import { createPrototypeScene, type PrototypeReadout } from './prototypeScene';
import './prototype.css';

const count = new Intl.NumberFormat('pt-BR');

function saveReport(results:BenchmarkResult[]) {
  const blob=new Blob([JSON.stringify({prototype:'Konoha',measuredAt:new Date().toISOString(),results},null,2)],{type:'application/json'});
  const download=document.createElement('a');
  download.href=URL.createObjectURL(blob);
  download.download='shinobibonk-konoha-desempenho.json';
  download.click();
  window.setTimeout(()=>URL.revokeObjectURL(download.href),1000);
}

export default function KonohaPrototype({onExit}:{onExit:()=>void}) {
  const host=useRef<HTMLDivElement>(null);
  const scene=useRef<ReturnType<typeof createPrototypeScene>|null>(null);
  const [readout,setReadout]=useState<PrototypeReadout|null>(null);
  const [failed,setFailed]=useState(false);
  const [measuring,setMeasuring]=useState(false);
  useEffect(()=>{
    if(!host.current)return;
    try {
      scene.current=createPrototypeScene(host.current,data=>{
        setReadout(data);
        setMeasuring(data.progress!==null);
      });
    } catch(error) {
      console.error('Mapa Protótipo',error);
      setFailed(true);
    }
    return()=>{scene.current?.dispose();scene.current=null;};
  },[]);
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape') {event.preventDefault();onExit();}
    };
    window.addEventListener('keydown',key);
    return()=>window.removeEventListener('keydown',key);
  },[onExit]);
  const config=readout?.config;
  const set=(changes:Partial<BenchmarkConfig>)=>{
    if(config)scene.current?.setConfig({...config,...changes});
    host.current?.focus({preventScroll:true});
  };
  const current=readout?.progress==null?null:BENCHMARK_CASES[readout.progress];

  return <main className="konoha-prototype">
    <div className="prototype-viewport" ref={host} tabIndex={-1} aria-label="Cenário jogável do Mapa Protótipo"/>
    <header className="prototype-header">
      <div><div className="prototype-kicker">KONOHAGAKURE</div><h1>Mapa Protótipo</h1></div>
      <button type="button" className="prototype-button" onClick={onExit}>Voltar ao início <kbd>Esc</kbd></button>
    </header>
    {failed ? <p className="prototype-error" role="alert">O WebGL não abriu neste dispositivo.</p> : <>
      <aside className="prototype-panel" aria-label="Comparar gráficos">
        <fieldset disabled={measuring||!config}>
          <legend>Personagem e horda</legend>
          <div className="prototype-toggle">
            <button type="button" aria-pressed={config?.avatar==='sprite'} onClick={()=>set({avatar:'sprite'})}>Sprite atual</button>
            <button type="button" aria-pressed={config?.avatar==='low-poly'} onClick={()=>set({avatar:'low-poly'})}>Low poly</button>
          </div>
        </fieldset>
        <fieldset disabled={measuring||!config}>
          <legend>Atlas de materiais</legend>
          <div className="prototype-toggle">
            <button type="button" aria-pressed={config?.texture===1024} onClick={()=>set({texture:1024})}>1K</button>
            <button type="button" aria-pressed={config?.texture===4096} onClick={()=>set({texture:4096})}>4K</button>
          </div>
        </fieldset>
        <fieldset disabled={measuring||!config}>
          <legend>Inimigos de teste</legend>
          <div className="prototype-toggle">
            {[0,400,1600].map(enemies=><button type="button" key={enemies} aria-pressed={config?.enemies===enemies}
              onClick={()=>set({enemies})}>{count.format(enemies)}</button>)}
          </div>
          <label className="prototype-effects"><input type="checkbox" checked={config?.effects??false}
            onChange={event=>set({effects:event.currentTarget.checked})}/> Mostrar efeitos</label>
        </fieldset>
        <div className="prototype-metrics" aria-label="Desempenho atual">
          <span><b>{count.format(readout?.fps??0)}</b> FPS</span>
          <span title="Chamadas de desenho"><b>{count.format(readout?.calls??0)}</b> chamadas</span>
          <span><b>{count.format(readout?.triangles??0)}</b> triângulos</span>
        </div>
        <button type="button" className="prototype-button prototype-primary" disabled={!config}
          onClick={()=>{scene.current?.benchmark();setMeasuring(v=>!v);}}>
          {measuring?'Interromper medição':'Medir desempenho'}
        </button>
        {current&&<div className="prototype-progress"><progress max={BENCHMARK_CASES.length} value={readout!.progress!+1}/>
          <small>{readout!.progress!+1}/{BENCHMARK_CASES.length} · {benchmarkLabel(current)}</small></div>}
        {readout?.finished&&readout.finished.length>0&&
          <button type="button" className="prototype-button" onClick={()=>saveReport(readout.finished!)}>Baixar relatório</button>}
      </aside>
      <div className="prototype-location">
        <b>{readout?.place??'Konoha'}</b>
        {readout?.action&&<span>{readout.action}</span>}
        {readout?.preparing&&<span>Carregando atlas…</span>}
        {readout?.nearby&&!measuring&&<span><kbd>E</kbd> Falar com Iruka</span>}
        {readout?.message&&<p role="status">{readout.message}</p>}
      </div>
      <footer className="prototype-controls">
        <span><kbd>WASD</kbd> Mover</span><span>Arrastar para girar · Scroll para zoom</span>
        <span><kbd>Espaço</kbd> Pular ou escalar</span><span><kbd>Shift</kbd> Dash</span><span><kbd>R</kbd> Selo</span>
        <button type="button" className="prototype-button" disabled={measuring}
          onClick={()=>{scene.current?.reset();host.current?.focus({preventScroll:true});}}>Voltar ao portão</button>
      </footer>
    </>}
  </main>;
}
