import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/jcffa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server=await createServer({server:{host:'127.0.0.1',port:5177,strictPort:true}});
server.middlewares.use('/__motion-review',(_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<html><body style="margin:0;background:#1d2834;color:white;font:12px sans-serif"></body></html>');});
await server.listen();
let browser;const errors=[],missing=[],coverage=[];
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--mute-audio','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1320,height:2580}});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:5177/__motion-review');
 const count=await page.evaluate(async()=>{
  const {THREE,HEROES,portraitRegion,createPlayerMotion}=await import('/scripts/motion-review-entry.ts');
  const loader=new THREE.TextureLoader();
  const frameCanvas=document.createElement('canvas');frameCanvas.width=32;frameCanvas.height=32;
  const frameContext=frameCanvas.getContext('2d',{willReadFrequently:true});
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(1320,2520);renderer.setScissorTest(true);renderer.domElement.style.cssText='position:fixed;top:0;left:0;z-index:100000';document.body.appendChild(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-1.6,1.6,1.65,-1.55,.1,30);camera.position.set(0,1.5,10);camera.lookAt(0,1.5,0);
  const labels=document.createElement('div');labels.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:100001';document.body.appendChild(labels);
  const put=(x,y,s)=>{const label=document.createElement('div');label.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px';label.textContent=s;labels.appendChild(label);};
  window.reviewPage=async pageIndex=>{
   labels.innerHTML='';renderer.setScissor(0,0,1320,2520);renderer.setClearColor('#1d2834');renderer.clear();
   const results=[];
   const names=['Repouso','Andar frente','Andar costas','Ataque frente','Ataque costas','Pulo frente','Pulo costas','Dash direita','Dash esquerda','Dash costas'];
   for(let i=pageIndex*14;i<Math.min(HEROES.length,(pageIndex+1)*14);i++){
    const hero=HEROES[i],row=i%14,scene=new THREE.Scene(),region=portraitRegion(hero.id);
    const idle=await loader.loadAsync(region.path);idle.colorSpace=THREE.SRGBColorSpace;idle.minFilter=idle.magFilter=THREE.NearestFilter;
    idle.repeat.set(1/region.cols,1/region.rows);idle.offset.set(region.index%region.cols/region.cols,1-(1+Math.floor(region.index/region.cols))/region.rows);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:idle,transparent:true,alphaTest:.55}));sprite.scale.set(2.3,2.6,1);scene.add(sprite);
    const loaded=new Promise(resolve=>{THREE.DefaultLoadingManager.onLoad=resolve;});
    const motion=createPlayerMotion(scene,sprite,hero.id,false);
    const update=(dt,walking=false,back=false,left=false,jump=0,dash=false,jp=0,dp=0)=>motion.update(dt,0,100,100,walking,back,left,1,jump,dash,false,jp,dp);
    update(0);await loaded;
    const samples=[];let frontPixels;
    put(3,row*180+3,hero.name);
    for(let col=0;col<10;col++){
     update(1);
     if(col===1||col===2)update(.17,true,col===2);
     else if(col===3||col===4){update(.01,true,col===4);motion.attack(false,false,false,hero.family==='lee'?'kick':hero.family==='guy'?'punch':undefined,false,col===4);update(.08);}
     else if(col===5||col===6)update(.01,false,col===6,false,.15,false,.5);
     else if(col>=7)update(.01,false,col===9,col===8,0,true,0,.4);
     else update(.01);
     const expected=col===0?'idle':col<3?'walk':col<5?'attack':col<7?'jump':'dash';
     if(motion.state()!==expected)throw Error(hero.id+' '+names[col]+' returned '+motion.state());
     const map=sprite.material.map;
     if(!map?.image?.width)throw Error('Unloaded atlas '+hero.id+' '+expected);
     const {width,height}=map.image,cellW=Math.abs(map.repeat.x)*width,cellH=map.repeat.y*height;
     const sampleX=(map.offset.x+(map.repeat.x<0?map.repeat.x:0))*width,sampleY=(1-map.offset.y-map.repeat.y)*height;
     frameContext.clearRect(0,0,32,32);frameContext.drawImage(map.image,sampleX,sampleY,cellW,cellH,0,0,32,32);
     const pixels=frameContext.getImageData(0,0,32,32).data;
     if(!pixels.some((value,index)=>index%4===3&&value>141))throw Error('Quadro vazio: '+hero.id+' '+names[col]);
     if(col===1)frontPixels=pixels;
     if(col===2&&frontPixels.every((value,index)=>value===pixels[index]))throw Error(hero.id+' repete a imagem na caminhada de costas');
     if(col===8&&map.repeat.x>=0)throw Error('Left dash not mirrored: '+hero.id);
     renderer.setViewport(col*132,(13-row)*180,132,160);renderer.setScissor(col*132,(13-row)*180,132,160);
     renderer.setClearColor(row%2?'#213747':'#26313f');renderer.render(scene,camera);
     put(col*132+3,row*180+160,names[col]);
     samples.push({action:expected,atlas:motion.atlas(),uv:[map.offset.x,map.offset.y,map.repeat.x,map.repeat.y]});
    }
    if(samples.slice(1).some(sample=>!sample.atlas))throw Error(hero.id+' tem movimento sem folha de animação');
    if(samples[1].atlas.endsWith('-roster-v1.png')){
     for(const [col,row] of [[1,0],[2,1],[3,2],[4,3],[5,4],[6,4],[7,5],[8,5],[9,5]]){
      if(Math.abs(samples[col].uv[1]-(5-row)/6)>1e-6)throw Error(hero.id+' selecionou fileira errada em '+names[col]);
     }
    }
    if(samples[1].uv[1]===samples[2].uv[1])throw Error(hero.id+' usa a mesma fileira ao andar de frente e de costas');
    // Andar atacando: o golpe toca inteiro pelos quadros de ataque (sem virar caminhada no meio) e volta à caminhada ao fim.
    update(1);update(.2,true);motion.attack(false,false);const walkFrames=[];
    for(let k=0;k<7;k++){update(.03,true);if(motion.state()!=='attack')throw Error(hero.id+' andando: golpe cortado em '+motion.state());walkFrames.push(motion.debug().frame);}
    update(.05,true);if(motion.state()!=='walk')throw Error(hero.id+' andando: não voltou à caminhada');
    // Velocidade de ataque alta: pedidos a cada 0,05 s não reiniciam o golpe antes de 75%.
    motion.attack(false,false);let last=0;
    for(let k=0;k<12;k++){update(.02,true);motion.attack(false,false);const p=motion.debug().progress;if(p<last&&last+.02/.22<.75)throw Error(hero.id+' golpe reiniciado em '+last);last=p;}
    results.push({hero:hero.id,samples,walkAttackFrames:walkFrames});motion.dispose();idle.dispose();sprite.material.dispose();
   }
   return results;
  };
  return HEROES.length;
 });
 for(let index=0;index<Math.ceil(count/14);index++){
  coverage.push(...await page.evaluate(i=>window.reviewPage(i),index));
  await page.screenshot({path:'artifacts/motion-review-'+(index+1)+'.png'});
 }
 assert.equal(coverage.length,count);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 fs.writeFileSync('artifacts/motion-review.json',JSON.stringify({date:new Date().toISOString(),scope:'Controlador real em fixture isolada; inspeção visual pelas folhas de contato',coverage,errors,missing},null,2));
 console.log(JSON.stringify({versions:coverage.length,states:coverage.reduce((n,h)=>n+h.samples.length,0),errors,missing}));
}finally{await browser?.close();await server.close();}

