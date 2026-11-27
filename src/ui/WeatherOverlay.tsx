import type { WeatherEventId } from '../game/maps';

export function WeatherOverlay({event,golden}:{event?:WeatherEventId;golden?:boolean}){
  if(event!=='snow'&&event!=='sand')return null;
  return <div className={`climate-overlay climate-${golden?'gold':event}`} aria-hidden="true"><i/><i/><i/></div>;
}
