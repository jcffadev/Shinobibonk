import fs from 'node:fs';
// Uso: node scripts/generate-sprites.mjs          → sprites dos heróis + NPCs + ícones
//      node scripts/generate-sprites.mjs --npcs   → só os NPCs (Ebisu e Iruka), sem tocar nos heróis

/*
 * NPCs (Ebisu e Iruka): pixel art chibi original desenhada por código, no mesmo enquadramento de uma célula
 * do atlas shinobi-roster-v2.png (quadrado, personagem centralizado, pés perto da base, cabeça grande,
 * contorno escuro de 1 pixel). Desenho em coordenadas 64×64 sobre grade 128×128, exportada como SVG 256×256
 * com shape-rendering crispEdges.
 * Aparência pela Narutopedia: Iruka (rabo de cavalo, cicatriz no nariz, colete chūnin verde, bandana da Folha);
 * Ebisu (óculos escuros, bandana usada como lenço cobrindo a cabeça, roupa padrão da Folha sem colete).
 */
function npcSprite(draw){
 // Desenho em coordenadas 64×64; a grade real tem S× a resolução para curvas, sombreado e contorno finos
 // (os sprites do atlas têm pixel menor que o "pixel" de desenho).
 const S=2,N=64*S,grid=Array.from({length:N},()=>Array(N).fill(null));
 const inside=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
 const fine=(x,y,c)=>{if(inside(x,y))grid[y][x]=c;};
 const px=(x,y,c)=>{for(let j=0;j<S;j++)for(let i=0;i<S;i++)fine(x*S+i,y*S+j,c);};
 const rect=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)px(x,y,c);};
 const at=f=>(f+.5)/S-.5;// centro do pixel fino em coordenadas de desenho
 const ellipse=(cx,cy,rx,ry,c,clip=()=>true)=>{for(let fy=Math.floor((cy-ry)*S);fy<=Math.ceil((cy+ry+1)*S);fy++)for(let fx=Math.floor((cx-rx)*S);fx<=Math.ceil((cx+rx+1)*S);fx++){const x=at(fx),y=at(fy);if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1&&clip(Math.round(x),Math.round(y)))fine(fx,fy,c);}};
 const poly=(pts,c)=>{const ys=pts.map(p=>p[1]),xs=pts.map(p=>p[0]);for(let fy=Math.min(...ys)*S;fy<=(Math.max(...ys)+1)*S;fy++)for(let fx=Math.min(...xs)*S;fx<=(Math.max(...xs)+1)*S;fx++){const x=at(fx),y=at(fy);let inPoly=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y+.5)!==(yj>y+.5)&&x+.5<(xj-xi)*(y+.5-yi)/(yj-yi)+xi)inPoly=!inPoly;}if(inPoly)fine(fx,fy,c);}};
 const get=(x,y)=>inside(x,y)?grid[y][x]:null;
 draw({px,rect,ellipse,poly,fine:(x,y,c)=>fine(Math.round(x*S),Math.round(y*S),c)});
 // Volume: borda direita/inferior da silhueta mais escura e borda superior/esquerda mais clara (luz vinda da esquerda).
 const tone=(hex,f)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');
 const base=grid.map(r=>[...r]),empty=(x,y)=>!inside(x,y)||!base[y][x];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=base[y][x];if(!c)continue;if(empty(x+1,y)||empty(x+2,y)||empty(x,y+1))grid[y][x]=tone(c,.78);else if(empty(x-1,y)||empty(x,y-1))grid[y][x]=tone(c,1.14);}
 // Contorno de 1 pixel em volta da silhueta, como nos sprites do atlas.
 const OUT='#181624',edge=[];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>get(x+dx,y+dy)&&get(x+dx,y+dy)!==OUT))edge.push([x,y]);
 for(const [x,y] of edge)grid[y][x]=OUT;
 let rects='';
 for(let y=0;y<N;y++){let x=0;while(x<N){const c=grid[y][x];if(!c){x++;continue;}let w=1;while(x+w<N&&grid[y][x+w]===c)w++;rects+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;x+=w;}}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges">${rects}</svg>`;
}
// Paleta comum (mesma família de cores do uniforme da Folha no atlas).
const P={skin:'#f2c8a0',skinShade:'#d9a27c',navy:'#27315e',navyShade:'#1b2346',navyLight:'#36437a',metal:'#c9d1da',metalShade:'#8e99a8',leaf:'#3b4352',sandal:'#2e3a66',wrap:'#e9e7ee',red:'#c23b32',eye:'#1d1a24',mouth:'#8b4a3c'};
/** Corpo padrão da Folha (pernas, sandálias, faixas na canela, braços e mãos). */
function konohaBody(d,{sleeve,shirt}){
 // Pernas e calça
 // Pernas levemente afastadas (pose de base dos sprites do atlas)
 d.poly([[26,46],[31,46],[31,55],[25,55]],P.navy);d.poly([[33,46],[38,46],[39,55],[33,55]],P.navy);d.rect(30,46,31,55,P.navyShade);d.rect(31,46,33,48,P.navy);
 // Faixas brancas nas canelas
 d.rect(25,51,31,52,P.wrap);d.rect(33,51,39,52,P.wrap);d.rect(25,52,31,52,'#bdbacb');d.rect(33,52,39,52,'#bdbacb');
 // Sandálias com dedos à mostra
 d.rect(24,56,31,59,P.sandal);d.rect(33,56,40,59,P.sandal);d.rect(24,56,31,56,'#3d4b80');d.rect(33,56,40,56,'#3d4b80');d.rect(24,57,28,58,P.skin);d.rect(36,57,40,58,P.skin);d.px(26,57,P.skinShade);d.px(38,57,P.skinShade);d.rect(24,59,31,59,'#1c2444');d.rect(33,59,40,59,'#1c2444');d.rect(26,55,30,55,P.skin);d.rect(34,55,38,55,P.skin);
 // Tronco (camisa) e braços, um pouco abertos
 d.poly([[24,32],[40,32],[41,46],[23,46]],shirt);
 d.poly([[20,33],[24,33],[24,41],[18,41]],sleeve);d.poly([[40,33],[44,33],[46,41],[40,41]],sleeve);
 d.ellipse(22,34.5,2.6,2,sleeve);d.ellipse(42,34.5,2.6,2,sleeve);d.rect(23,36,23,41,P.navyShade);d.rect(41,36,41,41,P.navyShade);
 // Espiral vermelha da Folha nos ombros
 d.ellipse(21,36,1.5,1.5,P.red);d.px(21,36,'#e4887d');d.ellipse(43,36,1.5,1.5,P.red);d.px(43,36,'#e4887d');
}
function hands(d,{forearm}){
 if(forearm){d.rect(18,41,22,43,P.skin);d.rect(42,41,46,43,P.skin);}
 // Punhos fechados
 d.ellipse(20,45.5,2.6,2.4,P.skin);d.ellipse(44,45.5,2.6,2.4,P.skin);d.rect(18,46,22,46,P.skinShade);d.rect(42,46,46,46,P.skinShade);d.px(20,44,P.skinShade);d.px(44,44,P.skinShade);
}
function face(d){
 d.rect(29,30,35,31,P.skinShade);// pescoço (a gola cobre o resto)
 d.ellipse(32,20,11.5,10.5,P.skin);
 d.ellipse(32,24.5,10,6.5,P.skin);
 d.ellipse(32,28.5,6,2.5,P.skin);// queixo
 d.ellipse(20,22.5,1.6,2.4,P.skin);d.ellipse(44,22.5,1.6,2.4,P.skin);d.px(20,23,P.skinShade);d.px(44,23,P.skinShade);// orelhas
 d.rect(39,27,41,28,P.skinShade);d.rect(36,30,38,30,P.skinShade);// sombra do maxilar
 d.px(33,26,P.skinShade);d.px(33,27,P.skinShade);// nariz
 d.rect(24,27,25,27,'#f0a89a');d.rect(39,27,40,27,'#f0a89a');// bochechas
}
/** Olhos grandes de anime: íris escura 3×4, brilho branco e canto branco. */
function eyes(d,brow){
 for(const x0 of [25,37]){d.rect(x0,23,x0+2,26,P.eye);d.px(x0,23,'#ffffff');d.px(x0+1,24,'#ffffff');d.rect(x0,26,x0+2,26,'#4a3a3a');d.px(x0+3,25,'#ffffff');d.rect(x0-1,22,x0+3,22,brow);}
}
function forehead(d,y){
 // Bandana: faixa azul + placa de metal com o símbolo da Folha
 d.rect(20,y,44,y+4,P.navy);d.rect(20,y+4,44,y+4,P.navyShade);
 d.rect(25,y-1,39,y+5,P.metal);d.rect(25,y+5,39,y+5,P.metalShade);d.rect(25,y-1,39,y-1,'#e6ebf0');
 const L=P.leaf,cx=32,cy=y+2;
 d.px(cx-2,cy-1,L);d.px(cx-1,cy-2,L);d.px(cx,cy-2,L);d.px(cx+1,cy-2,L);d.px(cx+2,cy-1,L);d.px(cx+2,cy,L);d.px(cx+1,cy+1,L);d.px(cx,cy+1,L);d.px(cx-1,cy,L);d.px(cx-2,cy+1,L);d.px(cx-3,cy+2,L);d.px(cx+3,cy-2,L);d.px(cx+4,cy-3,L);
}
const IRUKA=npcSprite(d=>{
 const hair='#4b2f22',hairLight='#6e4532',hairDark='#33201a';
 // Rabo de cavalo espetado no alto da cabeça, para trás
 d.poly([[34,9],[33,4],[36,5],[37,0],[39,4],[43,1],[42,5],[47,4],[43,9],[39,10]],hair);
 d.poly([[36,6],[37,2],[38,6]],hairLight);d.poly([[40,5],[42,2],[41,6]],hairLight);
 d.rect(35,8,39,9,'#2a2f55');d.rect(35,8,39,8,'#44507f');// prendedor do rabo de cavalo
 konohaBody(d,{sleeve:P.navy,shirt:P.navy});
 // Colete chūnin verde com gola alta, bolsos e zíper
 const vest='#62824a',vestShade='#4a6637',vestLight='#7a9b5e';
 d.poly([[24,33],[40,33],[41,46],[23,46]],vest);d.rect(24,34,25,45,vestShade);d.rect(39,34,40,45,vestShade);
 d.rect(25,31,39,34,vest);d.rect(25,31,39,31,vestLight);d.rect(28,33,36,34,vestShade);
 d.rect(32,34,32,46,'#3c5230');
 for(const x0 of [26,34]){d.rect(x0,37,x0+3,41,vestLight);d.rect(x0,37,x0+3,37,vestShade);d.rect(x0,41,x0+3,41,vestShade);d.rect(x0+1,38,x0+1,40,vestShade);}
 d.rect(23,45,41,46,vestShade);
 hands(d,{forearm:true});// mangas arregaçadas: antebraço à mostra
 d.rect(18,40,23,40,P.navyLight);d.rect(41,40,46,40,P.navyLight);
 // Estojo de kunai na coxa direita
 d.rect(35,47,38,50,'#202846');d.rect(34,48,39,48,P.wrap);
 face(d);
 // Cabelo por cima da cabeça, costeletas
 d.ellipse(32,15,12.5,8,hair,(x,y)=>y<=16);d.ellipse(29,12,7,4,hairLight,(x,y)=>y<=11);
 d.rect(20,15,22,21,hair);d.rect(42,15,44,21,hair);d.rect(21,19,22,21,hairDark);d.rect(42,19,43,21,hairDark);
 forehead(d,14);
 // Sobrancelhas, olhos e a cicatriz que atravessa o nariz
 eyes(d,hairDark);
 d.rect(28,25,36,25,'#b86a55');
 d.rect(30,29,34,29,P.mouth);d.px(29,28,P.mouth);d.px(35,28,P.mouth);
});
const EBISU=npcSprite(d=>{
 const cloth='#2d3d7a',clothShade='#1f2b5a',clothLight='#4256a0';
 // Pontas do lenço amarrado atrás da cabeça, caindo para o lado
 d.poly([[42,12],[50,17],[52,26],[48,24],[46,29],[43,20]],cloth);d.poly([[44,15],[49,18],[50,23],[47,21]],clothShade);
 konohaBody(d,{sleeve:P.navy,shirt:P.navy});
 // Camisa padrão da Folha sem colete: gola alta, dobras e porta-ferramentas na cintura
 d.rect(25,31,39,34,P.navyLight);d.rect(25,34,39,34,P.navyShade);
 d.rect(24,35,25,45,P.navyShade);d.rect(39,35,40,45,P.navyShade);d.rect(31,36,31,43,P.navyShade);d.rect(27,40,29,40,P.navyShade);
 d.rect(23,45,41,46,P.navyShade);d.rect(36,43,40,47,'#4c5268');d.rect(36,43,40,43,'#6f7690');d.rect(37,45,39,45,'#3a3f52');// bolsa de ferramentas no quadril
 hands(d,{forearm:false});
 face(d);
 // Bandana usada como lenço: cobre toda a cabeça (sem cabelo à mostra)
 d.ellipse(32,15,12.8,9.5,cloth,(x,y)=>y<=18);
 d.rect(20,15,22,21,cloth);d.rect(42,15,44,21,cloth);
 d.ellipse(28,10,6,3,clothLight,(x,y)=>y<=11);d.rect(20,18,21,21,clothShade);d.rect(43,18,44,21,clothShade);
 d.rect(42,12,44,15,clothShade);// nó
 forehead(d,15);
 // Óculos escuros (marca registrada), sobrancelha franzida
 d.rect(23,22,40,22,'#2a2230');
 d.rect(23,23,30,26,'#101018');d.rect(34,23,41,26,'#101018');d.rect(31,23,33,23,'#101018');
 d.rect(24,23,26,23,'#6f82b4');d.px(24,24,'#3d4a72');d.rect(35,23,37,23,'#6f82b4');d.px(35,24,'#3d4a72');
 d.rect(21,23,22,23,'#101018');d.rect(42,23,43,23,'#101018');
 d.rect(30,29,34,29,P.mouth);d.px(35,28,P.mouth);
});
/** Kushina Uzumaki (Narutopedia): cabelo ruivo muito longo com presilha na franja, blusa clara e vestido verde longo. */
const KUSHINA=npcSprite(d=>{
 const hair='#c4262e',hairLight='#e2464a',hairDark='#8a1720';
 // Camada de trás do cabelo: cai até a cintura dos dois lados
 d.poly([[19,14],[45,14],[49,30],[48,44],[44,46],[42,34],[22,34],[20,46],[16,44],[15,30]],hair);
 d.poly([[16,30],[19,28],[21,44],[18,45]],hairDark);d.poly([[48,30],[45,28],[43,44],[46,45]],hairDark);
 konohaBody(d,{sleeve:'#efe3c4',shirt:'#efe3c4'});
 // Vestido verde longo por cima (cobre o tronco e as pernas até a canela)
 const dress='#4f7a4a',dressShade='#3a5c37',dressLight='#6a9662';
 d.poly([[25,34],[39,34],[42,53],[22,53]],dress);d.rect(25,34,26,52,dressShade);d.rect(38,34,39,52,dressShade);d.rect(22,52,42,53,dressShade);
 d.rect(28,34,36,35,dressLight);d.rect(31,37,33,50,dressShade);
 d.rect(25,31,39,33,'#efe3c4');d.rect(25,33,39,33,'#d8c9a5');// gola da blusa
 hands(d,{forearm:false});
 face(d);
 // Cabelo da frente: topo, franja repartida e mechas laterais
 d.ellipse(32,14.5,13,8.5,hair,(x,y)=>y<=17);d.ellipse(28,11,7,3.5,hairLight,(x,y)=>y<=11);
 d.poly([[20,14],[24,14],[23,28],[19,30]],hair);d.poly([[44,14],[40,14],[41,28],[45,30]],hair);
 d.poly([[24,15],[31,15],[27,21]],hair);d.poly([[33,15],[40,15],[37,20]],hair);d.poly([[29,15],[35,15],[32,19]],hairDark);
 // Presilha prendendo a franja à esquerda
 d.rect(22,16,25,17,'#e8d8a8');d.rect(22,17,25,17,'#b9a777');
 eyes(d,hairDark);
 // Sorriso confiante
 d.rect(30,29,34,29,P.mouth);d.px(29,28,P.mouth);d.px(35,28,P.mouth);
});
fs.mkdirSync('public/assets/shinobis',{recursive:true});
fs.writeFileSync('public/assets/shinobis/kushina-1.svg',KUSHINA);
/** Asuma Sarutobi (teste da skill criar-arte): cabelo preto espetado, barba, colete jōnin verde, faixa da cintura, lâminas de chakra e cigarro. */
const ASUMA=npcSprite(d=>{
 const hair='#1f1b1e',hairLight='#3a3438',beard='#2a2326';
 konohaBody(d,{sleeve:P.navy,shirt:P.navy});
 const vest='#5f7f46',vestShade='#465f33',vestLight='#78985a';
 d.poly([[24,33],[40,33],[41,46],[23,46]],vest);d.rect(24,34,25,45,vestShade);d.rect(39,34,40,45,vestShade);
 d.rect(25,31,39,34,vest);d.rect(25,31,39,31,vestLight);d.rect(32,34,32,46,'#3a5229');
 for(const x0 of [26,34]){d.rect(x0,37,x0+3,41,vestLight);d.rect(x0,37,x0+3,37,vestShade);}
 d.rect(23,44,41,46,'#e8e4ea');d.rect(23,46,41,46,'#bdb8c6');d.rect(31,44,33,46,'#c23b32');
 hands(d,{forearm:false});
 d.poly([[17,44],[19,44],[19,52],[17,54]],'#c9d1da');d.poly([[45,44],[47,44],[47,54],[45,52]],'#c9d1da');
 face(d);
 d.ellipse(32,27.5,9.5,4.5,beard,(x,y)=>y>=25);d.rect(29,29,35,29,P.mouth);
 d.poly([[20,15],[22,6],[25,11],[27,3],[30,10],[33,2],[35,10],[38,4],[40,11],[43,6],[44,15]],hair);
 d.ellipse(32,14,12,5,hair,(x,y)=>y<=15);d.poly([[27,5],[29,10],[26,10]],hairLight);
 forehead(d,15);
 eyes(d,hair);
 d.rect(35,29,39,29,'#f1ece4');d.px(40,29,'#e8682c');
});
fs.writeFileSync('public/assets/shinobis/asuma-1.svg',ASUMA);
fs.writeFileSync('public/assets/shinobis/iruka-1.svg',IRUKA);
fs.writeFileSync('public/assets/shinobis/ebisu-1.svg',EBISU);
console.log('Gerados sprites dos NPCs: iruka-1.svg, ebisu-1.svg.');
if(process.argv.includes('--npcs'))process.exit(0);

const { FORMS } = await import('../src/game/evolution.ts');
// Sprites SVG originais do protótipo; silhuetas e adereços por personagem, sem assets externos.
const entries=[
 ['naruto-academia','#f7cb47','#d57e31','spike','goggles'],['naruto-classico','#f7cb47','#ee8d33','spike','blue'],['naruto-shippuden','#f7cb47','#ed8b35','spike','black'],['naruto-kyuubi','#ffc953','#ffcf52','spike','chakra'],
 ['gaara','#aa4b38','#a85d50','spike','gourd'],['hashirama','#302722','#8d4d43','long','sage'],['madara','#25222c','#a54649','mane','rinnegan'],['guy','#172922','#348453','bowl','vest'],
 ['sasuke','#18213a','#b6b4ca','spike','rope'],['sakura','#ef8b9d','#c84463','bob','gloves'],['kakashi','#d9e4ec','#687b5b','spike','mask'],['itachi','#191827','#222337','long','cloud'],['minato','#f6d76a','#f1e5cb','spike','cloak'],['tsunade','#e7cb82','#469577','long','diamond'],['jiraiya','#e6e7e8','#ba5947','mane','sage'],['orochimaru','#181625','#d9cfc0','long','rope'],['lee','#172922','#318355','bowl','wrap'],['neji','#524239','#e6e0c8','long','byakugan'],['hinata','#393656','#b3a4cf','bob','byakugan'],['shikamaru','#292c27','#718963','tail','vest'],['temari','#e1c775','#d9c3df','tails','fan'],['tenten','#714839','#e4d6c2','buns','scroll'],['pain','#d97d3e','#252236','spike','cloud'],['tobirama','#c2e1ed','#426f9b','spike','fur'],['kankuro','#3a2c32','#393243','hood','puppet'],
];
fs.mkdirSync('public/assets/shinobis',{recursive:true});
for(const [id,hair,baseOutfit,style,baseDetail] of entries){for(const form of FORMS[id]??[{level:1}]){
 const outfit=form.outfit??baseOutfit,detail=form.detail??baseDetail;
 const hairShape=style==='long'?'<path d="M10 10H34V41H29V22H14V42H8V18Z"/>':style==='spike'?'<path d="M8 18 4 12 11 12 9 5 17 9 20 2 24 7 31 3 30 9 38 6 34 14 40 15 34 20Z"/>':style==='mane'?'<path d="M10 9 5 16 7 23 3 32 9 31 6 40 17 35H29L39 39 35 29 41 31 36 20 39 16 32 8Z"/>':style==='tail'?'<path d="M10 11H34V23H10ZM19 11 15 4 26 1 30 7 25 12Z"/>':style==='tails'?'<path d="M11 10H33V24H11ZM11 9 5 5 3 15 11 14ZM32 9 38 4 42 14 33 16ZM11 18 4 21 7 29 14 23ZM32 18 41 20 38 28 31 23Z"/>':style==='buns'?'<path d="M11 9H33V23H11Z"/><circle cx="9" cy="9" r="5"/><circle cx="35" cy="9" r="5"/>':'<path d="M10 9H34V28H29V18H14V29H9Z"/>';
 const special=detail==='mask'?'<path d="M13 21H31V29H13Z" fill="#34445b"/>':detail==='cloud'?'<path d="M9 32H35V48H9Z" fill="#252236"/><path d="M14 37H21V34H26V38H29V42H17Z" fill="#c7495c"/>':detail==='rope'?'<path d="M9 42H35V46H9Z" fill="#9270b3"/><path d="M29 41H38V49H31Z" fill="#b69bd0"/>':detail==='diamond'?'<path d="M22 15 25 18 22 21 19 18Z" fill="#af80c7"/>':detail==='byakugan'?'<path d="M15 20H19V23H15ZM25 20H29V23H25Z" fill="#d8d6eb"/>':detail==='wrap'?'<path d="M5 36H12V43H5ZM32 36H39V43H32ZM12 47H20V52H12ZM24 47H32V52H24Z" fill="#ebe3ca"/>':detail==='fan'?'<path d="M34 19 44 21 39 49 30 45Z" fill="#ece2bd"/><path d="M38 27H42V32H36ZM34 39H38V44H32Z" fill="#91759d"/>':detail==='scroll'?'<path d="M31 28H40V47H31Z" fill="#ead4a0"/><path d="M30 28H41V32H30ZM30 43H41V47H30Z" fill="#bd5552"/>':detail==='puppet'?'<path d="M33 25H42V47H34Z" fill="#ad8a55"/><path d="M35 29H40V32H35ZM34 37H42V40H34Z" fill="#342a32"/><path d="M15 22H19V26H15ZM25 22H29V26H25Z" fill="#8d63b2"/>':detail==='fur'?'<path d="M9 30 13 28 16 32 20 29 24 32 28 28 34 30 31 36H13Z" fill="#dcebf1"/>':detail==='sage'?'<path d="M15 23H18V29H15ZM26 23H29V29H26Z" fill="#b94b4c"/>':detail==='cloak'?'<path d="M8 30H14V48H8ZM30 30H36V48H30Z" fill="#f3e8d1"/><path d="M8 46H14V49H8ZM30 46H36V49H30Z" fill="#d25c43"/>':detail==='gloves'?'<path d="M5 38H12V44H5ZM32 38H39V44H32Z" fill="#343444"/>':'<path d="M14 33H20V42H14ZM24 33H30V42H24Z" fill="#8e9c75"/>';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 60" shape-rendering="crispEdges"><g stroke="#172036" stroke-width="1"><g fill="${hair}">${hairShape}</g><path d="M12 15H32V25L28 31H17L12 25Z" fill="${id==='orochimaru'?'#e7dfd2':'#efd0ae'}"/><path d="M14 14H30V18H14Z" fill="#b7c4cd"/><path d="M17 21H19V23H17ZM26 21H28V23H26Z" fill="#243044"/><path d="M18 28H26V33H18Z" fill="#e5b899"/><path d="M11 31H33L38 42 32 45 29 38 31 49H13L14 38 10 45 5 42Z" fill="${outfit}"/><path d="M14 47H21V55H12V52ZM24 47H31L33 54H24Z" fill="#34394e"/><path d="M11 54H21V58H10ZM24 54H34V58H24Z" fill="#202f40"/>${special}</g></svg>`;
 const noBandana=id==='naruto-academia'?svg.replace('<path d="M14 14H30V18H14Z" fill="#b7c4cd"/>','<path d="M12 9H32V14H12Z" fill="#52768a"/><path d="M14 10H20V13H14ZM24 10H30V13H24Z" fill="#b8e7f4"/>'):svg;
 const detailArt=detail==='chakra'?'<path d="M10 31 15 35 11 43M34 31 29 35 33 43M18 32H26V35H18" fill="none" stroke="#8f4c21" stroke-width="2"/>':detail==='black'?'<path d="M11 31H33V37H11Z" fill="#272c3c"/>':detail==='blue'?'<path d="M11 31H33V35H11Z" fill="#42628d"/>':'';
 const finished=noBandana.replace('</svg>',detailArt+'</svg>');
 fs.writeFileSync(`public/assets/shinobis/${id}-${form.level}.svg`,finished);
 if(form.level===1)fs.writeFileSync(`public/assets/shinobis/${id}.svg`,finished);
}}
fs.mkdirSync('public/assets/icons',{recursive:true});
fs.writeFileSync('public/assets/icons/kunai.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M32 4 38 23 25 30 18 23Z" fill="#d4e2ef" stroke="#182337" stroke-width="3"/><path d="M32 4 25 30 18 23Z" fill="#8499b5"/><path d="M22 27 13 38" stroke="#a35c48" stroke-width="6"/><circle cx="10" cy="41" r="5" fill="none" stroke="#d8e4f4" stroke-width="3"/></svg>');
fs.writeFileSync('public/assets/icons/shuriken.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 3 29 18 45 24 30 29 24 45 18 30 3 24 18 18Z" fill="#b8d7e8" stroke="#263550" stroke-width="3"/><circle cx="24" cy="24" r="5" fill="#25334b"/></svg>');
console.log(`Gerados ${entries.length} sprites de shinobis e 2 ícones de chão.`);
