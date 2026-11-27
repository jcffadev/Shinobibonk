import { compactNumber } from '../game/format';

export function RyuCost({value,available,signed=false}:{value:number;available?:number;signed?:boolean}){
  const short=compactNumber(value);
  return <span className="ryu-cost" data-insufficient={available!==undefined&&available<value?'true':undefined}
    title={Math.round(value).toLocaleString('pt-BR')+' Ryu'}>
    <span className="ryu-cost-coin" aria-hidden="true">両</span><strong>{signed?'+':''}{short}</strong><small>Ryu</small>
  </span>;
}
