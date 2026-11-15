import type { Dojutsu } from '../game/dojutsu';

const tomoe = 'M24 9c-5 0-5 7 0 7 2 0 3-.9 3.6-2.2 1.2.2 2.4 1 3.2 2.2-.5-4.2-2.8-7-6.8-7z';
const blades:Partial<Record<Dojutsu,{count:number;path:string}>>={
 itachi:{count:3,path:'M21 25Q13 18 15 8Q18 15 26 19L28 24Z'},
 obito:{count:3,path:'M23 28Q13 27 9 13Q14 17 19 13L20 6Q23 15 30 21Z'},
 shisui:{count:4,path:'M20 27L19 15L27 7L26 15L30 23Z'},
 sasuke:{count:3,path:'M24 3L28 11L35 19L29 26L24 18L19 26L13 19L20 11Z'},
 'sasuke-eternal':{count:3,path:'M24 4L29 12L36 19L30 25L24 15L18 25L12 19L19 12Z'},
 madara:{count:3,path:'M19 22V12a5 5 0 0 1 10 0v10h-3v-8a2 2 0 0 0-4 0v8z'},
};

export function DojutsuIcon({eye,name}:{eye:Dojutsu;name:string}){
 const layered=eye.startsWith('rinne'), sageMoon=eye==='rinne-sharingan', hyuga=eye==='byakugan', blade=blades[eye];
 const iris=hyuga?'#e4ddf6':eye==='rinnegan'||eye==='rinnegan-sasuke'?'#b5a0e9':'#f83c4a';
 return <svg className="skill-art dojutsu-icon" viewBox="0 0 48 48" role="img" aria-label={name}>
   <path d="M2 25 Q24 3 46 25 Q24 43 2 25Z" fill={hyuga?'#dfc9dd':'#e9c4ba'} stroke="#311727" strokeWidth="2"/>
   {hyuga&&<path d="M2 13l5 3 3 7-6-2m41-7-5 3-3 6 6-2M7 36l5-3m29 3-5-3" fill="none" stroke="#735685" strokeWidth="1.5"/>}
   <circle cx="24" cy="24" r="16.5" fill={iris} stroke={hyuga?'#8875a3':'#2d1426'} strokeWidth="2.2"/>
   {layered&&[5,9,13].map(radius=><circle key={radius} cx="24" cy="24" r={radius} fill="none" stroke="#3e2546" strokeWidth="1.15"/>)}
   {(eye==='sharingan'||eye==='rinnegan-sasuke'||sageMoon)&&<g fill="#2a182c">
     {eye==='sharingan'&&<circle cx="24" cy="24" r="10.5" stroke="#541d2f" fill="none" strokeWidth=".7"/>}
     {[0,120,240].map(angle=><g key={angle} transform={'rotate('+angle+' 24 24)'}>
        <path d={tomoe} transform="translate(5.5 5.5) scale(.77)"/>
        {eye!=='sharingan'&&<path d={tomoe} transform="rotate(60 24 24) translate(9.6 9.6) scale(.60)"/>}
        {sageMoon&&<path d={tomoe} transform="rotate(34 24 24) translate(13.2 13.2) scale(.45)"/>}
     </g>)}
   </g>}
   {blade&&<g fill="#2a182c">{Array.from({length:blade.count},(_,i)=><path key={i} d={blade.path} transform={'rotate('+i*360/blade.count+' 24 24)'}/>)}</g>}
   {eye==='sasuke-eternal'&&<path d="M24 14l2 7 7 3-7 3-2 7-2-7-7-3 7-3z" fill="#ff525d"/>}
   <circle cx="24" cy="24" r={hyuga?5:3} fill={hyuga?'#d8ceef':'#2a182c'}/>
   <path d="M13 16q3-4 7-5" fill="none" stroke="#fff7ee" strokeWidth="1.5" strokeLinecap="round" opacity=".64"/>
 </svg>;
}
