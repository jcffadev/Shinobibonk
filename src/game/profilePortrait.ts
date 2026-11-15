export const PROFILE_FRAMES = { default:'Clássica', bronze:'Bronze', gold:'Dourada', jade:'Jade' } as const;
export type ProfileFrame = keyof typeof PROFILE_FRAMES;
export type ProfilePortrait = { avatar?:string; frame?:ProfileFrame };
export function isProfileFrame(frame: unknown): frame is ProfileFrame {
  return typeof frame === 'string' && Object.hasOwn(PROFILE_FRAMES,frame);
}
