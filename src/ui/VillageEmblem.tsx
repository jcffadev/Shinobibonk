const villages:Record<string,{name:string;short:string;color:string;path:string}> = {
  'Vila da Folha': {name:'Konohagakure',short:'Konoha',color:'#91d786',path:'M14 10c-3-3-7 1-4 4s8 0 8-4-6-8-10-5-4 7-1 10l-3 4 7-1m6-13 3-3'},
  'Vila da Areia': {name:'Sunagakure',short:'Suna',color:'#f4cb82',path:'M6 3h12m-12 18h12M8 3v4l4 5-4 5v4m8-18v4l-4 5 4 5v4'},
  'Vila da Névoa': {name:'Kirigakure',short:'Kiri',color:'#91cbdc',path:'M4 15 8 5m0 15 4-10m0 5 4-10m0 15 4-10'},
  'Vila da Pedra': {name:'Iwagakure',short:'Iwa',color:'#e1aa84',path:'M3 18h12V9l-6-5-6 5Zm12 0h6V9l-6-5-2 2'},
  'Vila da Nuvem': {name:'Kumogakure',short:'Kumo',color:'#d1beff',path:'M4 16a3 3 0 0 1 0-6l2 .2a4 4 0 0 1 7-3 3.6 3.6 0 0 1 6 3 3 3 0 0 1-1 5.8H4Z'},
  'Vila do Som': {name:'Otogakure',short:'Oto',color:'#cbb1f0',path:'M13 16V3l6 4m-6 9c0 4-8 6-8 2s8-6 8-2Z'},
  'Vila da Chuva': {name:'Amegakure',short:'Ame',color:'#a7c3ef',path:'M5 5v14m5-14v14m5-14v14m5-14v14'},
  'Vila da Cachoeira': {name:'Takigakure',short:'Taki',color:'#85e1eb',path:'M6 4h11l-5 6v10m-3-3 3 3 3-3M3 9h5m9 0h4'},
  'Vila das Fontes Termais': {name:'Yugakure',short:'Yuga',color:'#efbdad',path:'M5 18l4-12m2 12 4-12m2 12 4-12'},
  'Vila da Grama': {name:'Kusagakure',short:'Kusa',color:'#abe58c',path:'M3 17 6 8l4 9 3-9 3 9 4-9 1 9'},
};

function emblem(village:string){return villages[village==='Vila da Névoa Oculta'?'Vila da Névoa':village];}
export function villageName(village:string,short=false){
  const entry=emblem(village);
  return entry?(short?entry.short:entry.name):village;
}

export function VillageEmblem({village}:{village:string}){
  const entry=emblem(village);
  if(!entry)return null;
  return <svg className="village-emblem" viewBox="0 0 24 24" aria-hidden="true" style={{color:entry.color}}>
    <path d={entry.path} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
