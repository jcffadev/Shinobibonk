import type { Technique } from './heroes.ts';

/**
 * Selos de mão (pedido do usuário em 15/11: "Posições de mãos que todos os personagens devem fazer… aleatoriamente para
 * soltar as habilidades… Se você souber… para determinada jutsu… ótimo… TODOS os personagens"; plano em docs/01).
 * 25/11/2026: sem arte nova (o usuário pediu para usar só o que já existe). O corpo faz o selo com a pose que já existe
 * (Naruto e Zabuza); a sequência aparece com o texto flutuante do jogo, um selo a cada 0,1 s, acima do personagem.
 */
export const HAND_SEALS = {
  rato: { kanji: '子', name: 'Rato' }, boi: { kanji: '丑', name: 'Boi' }, tigre: { kanji: '寅', name: 'Tigre' },
  coelho: { kanji: '卯', name: 'Coelho' }, dragao: { kanji: '辰', name: 'Dragão' }, serpente: { kanji: '巳', name: 'Serpente' },
  cavalo: { kanji: '午', name: 'Cavalo' }, carneiro: { kanji: '未', name: 'Carneiro' }, macaco: { kanji: '申', name: 'Macaco' },
  passaro: { kanji: '酉', name: 'Pássaro' }, cachorro: { kanji: '戌', name: 'Cachorro' }, javali: { kanji: '亥', name: 'Javali' },
} as const;
export type HandSeal = keyof typeof HAND_SEALS;
const ORDER = Object.keys(HAND_SEALS) as HandSeal[];

/** Selo em cruz do Kage Bunshin (não é um dos 12). */
export const CROSS_SEAL = { kanji: '十', name: 'Selo em cruz' };

/** Intervalo mínimo entre duas sequências do mesmo personagem (as técnicas são automáticas). */
export const SEAL_RULES = { step: .1, interval: 2.5, minRandom: 2, maxRandom: 4 };

/** Sequências da obra (Narutopedia). O Dragão de Água tem 44 selos; aqui ficam os 6 primeiros. */
const KNOWN: readonly [RegExp, readonly HandSeal[]][] = [
  [/Grande Bola de Fogo|^Bola de Fogo$/, ['serpente', 'carneiro', 'macaco', 'javali', 'cavalo', 'tigre']],
  [/^Fênix de Fogo$/, ['rato', 'tigre', 'cachorro', 'boi', 'coelho', 'tigre']],
  [/Chidori|Raikiri/, ['boi', 'coelho', 'macaco']],
  [/^Invocação/, ['javali', 'cachorro', 'passaro', 'macaco', 'carneiro']],
  [/^Parede de Terra$/, ['tigre', 'coelho', 'javali', 'cachorro']],
  [/^Dragão de Água$/, ['boi', 'macaco', 'coelho', 'rato', 'javali', 'passaro']],
];

const hash = (text: string) => { let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0; return h; };

/**
 * Selos que a técnica mostra: a sequência da obra quando existe, o selo em cruz no Kage Bunshin e, nas outras de Ninjutsu
 * e Genjutsu, 2 a 4 selos sorteados pelo nome (sempre os mesmos para a mesma técnica). Taijutsu não tem selo, exceto a
 * Ultimate e o Kage Bunshin.
 */
export function sealSequence(t: Pick<Technique, 'name' | 'school' | 'ultimate'>): { kanji: string; name: string }[] {
  if (/^Kage Bunshin$|Bunshin/.test(t.name) && !t.ultimate) return [CROSS_SEAL];
  const known = KNOWN.find(([pattern]) => pattern.test(t.name));
  if (known) return known[1].map(id => HAND_SEALS[id]);
  if (t.school === 'Taijutsu' && !t.ultimate) return [];
  let h = hash(t.name) || 1;
  const count = SEAL_RULES.minRandom + h % (SEAL_RULES.maxRandom - SEAL_RULES.minRandom + 1);
  const out: { kanji: string; name: string }[] = [];
  // Sorteio pelos bits altos de um xorshift (25/11/2026: o LCG pelos bits baixos repetia Dragão, Macaco e Rato), sem o mesmo selo duas vezes seguidas.
  for (let i = 0; i < count; i++) {
    let pick: HandSeal;
    do { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; pick = ORDER[(h >>> 8) % ORDER.length]; } while (out.length && out.at(-1) === HAND_SEALS[pick]);
    out.push(HAND_SEALS[pick]);
  }
  return out;
}

/** Mostra a sequência agora? A Ultimate sempre; as outras no máximo a cada `SEAL_RULES.interval` s por personagem. */
export function sealDue(now: number, last: number | undefined, ultimate = false) {
  return ultimate || last === undefined || now - last >= SEAL_RULES.interval;
}

export const sealLabel = (s: { kanji: string; name: string }) => `${s.kanji} ${s.name}`;
