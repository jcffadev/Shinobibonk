export type AvatarMode = 'sprite' | 'low-poly';
export type TextureSize = 1024 | 4096;
export type BenchmarkConfig = { avatar: AvatarMode; texture: TextureSize; enemies: number; effects: boolean };

export const BENCHMARK_CASES: BenchmarkConfig[] = [];
for (const avatar of ['sprite','low-poly'] as const)
  for (const texture of [1024,4096] as const)
    for (const enemies of [0,400,1600])
      for (const effects of [false,true])
        BENCHMARK_CASES.push({avatar,texture,enemies,effects});

export function frameStats(frameTimes: readonly number[]) {
  const sorted = frameTimes.filter(value=>value>0&&Number.isFinite(value)).sort((a,b)=>a-b);
  if(!sorted.length) return {frames:0,fps:0,p99Ms:0,low1:0};
  const fps=1000*sorted.length/sorted.reduce((sum,value)=>sum+value,0);
  const p99Ms=sorted[Math.ceil(sorted.length*.99)-1];
  const tail=sorted.slice(-Math.max(1,Math.ceil(sorted.length*.01)));
  return {frames:sorted.length,fps:Math.round(fps*10)/10,p99Ms:Math.round(p99Ms*10)/10,
    low1:Math.round(10000*tail.length/tail.reduce((sum,value)=>sum+value,0))/10};
}

export function benchmarkLabel(config: BenchmarkConfig) {
  return `${config.avatar==='sprite'?'Sprite':'Low poly'} · ${config.texture===4096?'4K':'1K'} · ${config.enemies.toLocaleString('pt-BR')} inimigos · Efeitos ${config.effects?'ligados':'desligados'}`;
}

export type BenchmarkResult = BenchmarkConfig & ReturnType<typeof frameStats> & {
  triangles:number; calls:number; width:number; height:number; pixelRatio:number; available:boolean;
};
