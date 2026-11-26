// Recompensa de Lamens (moeda permanente) ao fim da run, calculada só pelo desempenho.
// Regras: o Ryu da run NÃO vira Lamens; itens e pílulas (inclusive a Pílula do Mercador) não alteram este valor.
// Todos os números abaixo são balanceamento PROVISÓRIO (PROPOSTO). Referência: árvore completa = 21.300 Lamens.
// 26/11/2026 — pedido do usuário (run de 76 min no Kage deu 56.031 Lamens, 23.584 só do nível): "no máximo uma RUN bem
// sucedida nesse porte deveria dar em torno de 2.9k lamens a 3.1k e uns quebradinhos". Toda parcela agora tem teto: vitória
// completa no Kage = 1.240 × 2,2 + Bijū (156 a 310) ≈ 2.884 a 3.038 Lamens.

export type RunDifficulty = 'Genin' | 'Chunin' | 'Jonin' | 'Kage';
/** Recorte do WorldSnapshot usado na fórmula (mantém o módulo puro e testável). */
export type RunResult = { elapsed: number; kills: number; level: number; zone: number; victory: boolean; bijuuReward?: number; allies: readonly string[] };
export type LamenSource = { id: string; label: string; detail: string; value: number };
export type LamenReward = { total: number; subtotal: number; multiplier: number; sources: LamenSource[] };

export const LAMEN_RULES = {
  perMinute: 20,          // por minuto completo sobrevivido (máx. 30 min = 600)
  killsPerLamen: 15,      // 1 Lamen a cada 15 abates
  killCap: 200,           // teto da parcela de abates
  perLevel: 2,            // por nível acima do 1
  levelCap: 100,          // teto de níveis contados (máx. 200)
  perZone: 30,            // por zona alcançada além da 1ª (máx. +60)
  perSealedMega: 20,      // por mega elite selado (aliado recrutado)
  sealedCap: 4,           // teto de selados contados (máx. 80)
  victoryBonus: 100,      // bônus fixo de vitória
  difficulty: { Genin: 1, Chunin: 1.3, Jonin: 1.7, Kage: 2.2 } as Record<RunDifficulty, number>,
};

export function runLamens(result: RunResult, mission: RunDifficulty): LamenReward {
  const r = LAMEN_RULES;
  const minutes = Math.floor(Math.max(0, Math.min(1800, result.elapsed)) / 60);
  const kills = Math.max(0, Math.floor(result.kills));
  const levels = Math.max(0, Math.min(r.levelCap, Math.floor(result.level) - 1));
  const zones = Math.max(0, Math.min(3, Math.floor(result.zone)) - 1);
  const sealed = Math.min(r.sealedCap, result.allies.length);
  const sources: LamenSource[] = [
    { id: 'time', label: 'Tempo sobrevivido', detail: `${minutes} min × ${r.perMinute}`, value: minutes * r.perMinute },
    { id: 'kills', label: 'Abates', detail: `${kills} ÷ ${r.killsPerLamen} (máx. ${r.killCap})`, value: Math.min(r.killCap, Math.floor(kills / r.killsPerLamen)) },
    { id: 'level', label: 'Nível alcançado', detail: `${levels} níveis × ${r.perLevel} (máx. ${r.levelCap})`, value: levels * r.perLevel },
    { id: 'zone', label: 'Zona alcançada', detail: `${zones} zonas extras × ${r.perZone}`, value: zones * r.perZone },
    { id: 'sealed', label: 'Mega elites selados', detail: `${sealed} × ${r.perSealedMega} (máx. ${r.sealedCap})`, value: sealed * r.perSealedMega },
    { id: 'victory', label: 'Bônus de vitória', detail: result.victory ? 'missão concluída' : 'sem vitória', value: result.victory ? r.victoryBonus : 0 },
  ];
  const subtotal = sources.reduce((sum, s) => sum + s.value, 0);
  const multiplier = r.difficulty[mission] ?? 1;
  const bijuuReward=result.victory?Math.max(0,result.bijuuReward??0):0;
  if(bijuuReward) sources.push({id:'bijuu',label:'Bijū derrotada',detail:'Bônus do portal, já ajustado pela dificuldade',value:bijuuReward});
  return { total: Math.round(subtotal * multiplier)+bijuuReward, subtotal, multiplier, sources };
}
