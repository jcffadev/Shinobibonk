export const KAKASHI_DMS = 'kakashi-dms';
export const KAKASHI_DMS_FORM = 30;
export const KAMUI_SHURIKEN = 'Shuriken do Kamui';

const susanooVersions = {
  madara: 'madara',
  'madara-rinnegan': 'madara',
  'madara-seis-caminhos': 'madara',
  itachi: 'itachi',
  'itachi-akatsuki': 'itachi',
  'sasuke-shippuden': 'sasuke',
  'sasuke-rinnegan': 'sasuke',
  shisui: 'shisui',
  [KAKASHI_DMS]: 'kakashi',
} as const;

export type SusanooStyle = typeof susanooVersions[keyof typeof susanooVersions];

export function susanooStyleFor(version: string | undefined, technique: string): SusanooStyle | undefined {
  if (!version || !Object.hasOwn(susanooVersions, version)) return undefined;
  const style = susanooVersions[version as keyof typeof susanooVersions];
  if (technique === 'Susanoo'
    || (style === 'itachi' && technique === 'Espada de Totsuka')
    || (style === 'madara' && technique === 'Susanoo Perfeito')
    || (style === 'kakashi' && technique === KAMUI_SHURIKEN)) return style;
}
