type DirectionalSheet = { path: string; rows: number; cast?: boolean };
const sheets: Record<string, DirectionalSheet> = {
  'naruto-10': { path: '/assets/naruto-classico-motion-v1.png', rows: 2 },
  'naruto-25': { path: '/assets/naruto-shippuden-motion-v1.png', rows: 3, cast: true },
  'naruto-50': { path: '/assets/naruto-kyuubi-motion-v1.png', rows: 3, cast: true },
  'sasuke-1': { path: '/assets/sasuke-classico-motion-v1.png', rows: 2 },
  'sasuke-15': { path: '/assets/sasuke-shippuden-motion-v1.png', rows: 2 },
  'sasuke-30': { path: '/assets/sasuke-rinnegan-motion-v1.png', rows: 2 },
  'sakura-1': { path: '/assets/sakura-classico-motion-v1.png', rows: 2 },
  'sakura-15': { path: '/assets/sakura-shippuden-motion-v1.png', rows: 2 },
  'sakura-30': { path: '/assets/sakura-byakugou-motion-v1.png', rows: 2 },
};

export function directionalArt(hero: string, formLevel: number): DirectionalSheet | undefined {
  return sheets[`${hero}-${formLevel}`];
}
