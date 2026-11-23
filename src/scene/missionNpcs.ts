import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const outfits={
  shikamaru:{skin:0xd6a381,hair:0x292f30,coat:0x59694a,shirt:0x363f36,pants:0x373741,style:'tail'},
  tsunade:{skin:0xe8b892,hair:0xd5b45c,coat:0x527963,shirt:0xcac4af,pants:0x3c4b4a,style:'twins'},
  tenten:{skin:0xd49e79,hair:0x46302d,coat:0xbc7167,shirt:0xe6cbb4,pants:0x51434b,style:'buns'},
  ebisu:{skin:0xcc9d76,hair:0x363638,coat:0x3a5968,shirt:0x334554,pants:0x303c47,style:'cap'},
  iruka:{skin:0xb77d5d,hair:0x3a2927,coat:0x6b7850,shirt:0x444b51,pants:0x41424b,style:'tail'},
  guy:{skin:0xce986e,hair:0x292a2b,coat:0x55764a,shirt:0x426643,pants:0x496b47,style:'bowl'},
  orochimaru:{skin:0xdacbbd,hair:0x262731,coat:0xc1b69a,shirt:0x48434d,pants:0x343745,style:'long'},
  zetsu:{skin:0xe0dcd3,hair:0x759b57,coat:0x292e32,shirt:0x323639,pants:0x282e34,style:'venus'},
  teuchi:{skin:0xcf9d7b,hair:0x525059,coat:0xd6d5bd,shirt:0x727b72,pants:0x555749,style:'chef'},
  naruto:{skin:0xe4ad84,hair:0xe0b240,coat:0xd1682b,shirt:0x38485a,pants:0xd47132,style:'spikes'},
  merchant:{skin:0xba906e,hair:0x453d38,coat:0x71624b,shirt:0x5a5147,pants:0x49403c,style:'hood'},
} as const;
export type MissionNpcId=keyof typeof outfits|'sapos-sabios';
export function missionNpcForEvent(id:string):MissionNpcId|undefined {
  if(id==='slot')return 'tsunade';
  if(id==='arsenal')return 'tenten';
  if(id==='youth')return 'guy';
  if(id==='challenge')return 'zetsu';
  if(id==='trader')return 'merchant';
  if(id==='sapos-sabios')return id;
  if(id==='shikamaru'||id==='orochimaru'||id==='ebisu'||id==='iruka')return id;
}

/** Malhas com cores por vértice. Cada parte articulada usa uma só chamada de desenho. */
export function createMissionNpc(id:MissionNpcId) {
  const root=new THREE.Group();
  root.name='npc-3d-'+id;
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.91});
  const parts=new Map<THREE.Group,THREE.BufferGeometry[]>();
  const tint=new THREE.Color();
  const pivot=(parent:THREE.Group,name:string,x=0,y=0,z=0)=>{
    const node=new THREE.Group();node.name=name;node.position.set(x,y,z);parent.add(node);return node;
  };
  function solid(parent:THREE.Group,source:THREE.BufferGeometry,color:number,x:number,y:number,z:number,
    w:number,h:number,d:number,zTilt=0,xTilt=0,yaw=0) {
    const geo=source.index?source.toNonIndexed():source;
    if(geo!==source)source.dispose();
    geo.clearGroups();
    geo.scale(w,h,d).rotateZ(zTilt).rotateX(xTilt).rotateY(yaw).translate(x,y,z);
    tint.setHex(color);
    const colors=new Float32Array(geo.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3){colors[i]=tint.r;colors[i+1]=tint.g;colors[i+2]=tint.b;}
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const list=parts.get(parent)??[];
    list.push(geo);parts.set(parent,list);
  }
  const orb=(p:THREE.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,r=0,tilt=0)=>
    solid(p,new THREE.SphereGeometry(.5,12,8),c,x,y,z,w,h,d,r,tilt);
  const wrap=(p:THREE.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,r=0,tilt=0)=>
    solid(p,new THREE.CylinderGeometry(.46,.5,1,10),c,x,y,z,w,h,d,r,tilt);
  const box=(p:THREE.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,r=0,tilt=0,yaw=0)=>
    solid(p,new THREE.BoxGeometry(1,1,1),c,x,y,z,w,h,d,r,tilt,yaw);
  const cone=(p:THREE.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,r=0,tilt=0)=>
    solid(p,new THREE.ConeGeometry(.5,1,8),c,x,y,z,w,h,d,r,tilt);
  const ink=0x322a2b,metal=0xaeb9b7,band=0x4b5861;

  type Rig={spine:THREE.Group;head:THREE.Group;eyes:THREE.Group;arms?:THREE.Group[]};
  const rigs:Rig[]=[];
  function makeShinobi(key:keyof typeof outfits) {
    const {skin,hair,coat,shirt,pants,style}=outfits[key];
    const spine=pivot(root,'tronco',0,.41),head=pivot(spine,'cabeca',0,.413);
    const eyes=pivot(head,'olhos',0,-.014,.144);
    const arms:THREE.Group[]=[];
    for(const side of [-1,1]){
      const x=side*.084;
      orb(root,ink,x,.036,.039,.119,.070,.194);
      box(root,skin,x,.047,.107,.094,.023,.047);
      wrap(root,key==='guy'?0xb56436:pants,x,.139,0,.115,.192,.119);
      wrap(root,pants,x,.307,0,.150,.218,.145);
      const arm=pivot(spine,'braco',side*.178,.177,0);
      arms.push(arm);
      if(key==='naruto'||key==='teuchi'){
        orb(arm,coat,side*.012,-.063,.027,.105,.161,.106,-side*.19,.38);
        wrap(arm,shirt,-side*.031,-.113,.084,.083,.142,.085,-side*.95,-.82);
        const handZ=key==='naruto'?.155:.134;
        orb(arm,skin,-side*.106,-.095,handZ,.094,.081,.071,-side*.35);
        if(key==='naruto')box(arm,skin,-side*.125,-.048,handZ,.026,.095,.033,-side*.11);
        if(key==='teuchi'&&side===1){
          wrap(arm,0x674f32,-.095,-.050,.143,.022,.18,.023,0,.38);
          orb(arm,0xb5b4a2,-.095,.042,.172,.069,.085,.030,0,.40);
        }
      }else{
        wrap(arm,coat,0,-.080,0,.115,.186,.122,-side*.09);
        wrap(arm,shirt,side*.012,-.205,.009,.079,.116,.085);
        orb(arm,skin,side*.014,-.276,.020,.083,.084,.088);
      }
    }
    wrap(spine,coat,0,.087,0,.321,.325,.228);
    wrap(spine,shirt,0,-.025,0,.302,.089,.215);
    orb(spine,shirt,0,.157,.067,.155,.191,.125);
    for(const side of [-1,1]){
      box(spine,coat,side*.065,.112,.125,.041,.192,.014,side*.22);
      if(key==='shikamaru'||key==='iruka'||key==='guy'){
        box(spine,0x424f3a,side*.105,.102,.119,.081,.075,.027);
        box(spine,coat,side*.105,.123,.136,.089,.024,.018);
      }
    }
    if(style==='long'||style==='venus'||style==='twins'){
      wrap(spine,coat,0,-.092,0,.355,.195,.245);
      box(spine,ink,0,-.066,.128,.012,.153,.019);
    }
    if(key==='orochimaru'){
      wrap(spine,0x85669b,0,-.006,0,.349,.058,.255);
      orb(spine,0x8a69a6,.059,-.014,-.146,.222,.085,.112,.33);
    }
    if(key==='zetsu'){
      for(const [x,y,r] of [[-.040,.078,.045],[-.010,.100,.056],[.034,.089,.052]]){
        orb(spine,0xc8b1a0,x,y,.116,r*1.1,r*1.1,.031);
        orb(spine,0xaf3839,x,y,.132,r,r,.022);
      }
      for(const s of [-1,1]){
        orb(spine,0x41683d,s*.233,.38,-.034,.127,.585,.262,-s*.37,-.23);
        orb(spine,0x759757,s*.248,.42,.008,.088,.453,.230,-s*.36,-.26);
        for(let tooth=0;tooth<4;tooth++)cone(spine,0xaaba76,s*(.179+.027*tooth),.38+.089*tooth,.102,.051,.083,.059,s*.62);
      }
    }
    if(key==='tenten'||key==='merchant'){
      orb(spine,key==='tenten'?0x954b3e:0x695238,.101,.02,-.128,.234,.188,.128);
      if(key==='tenten')wrap(spine,0xd7bb87,-.145,.13,-.113,.083,.342,.086,.25);
    }
    orb(spine,skin,0,.227,.015,.097,.104,.101);
    if(key==='zetsu'){
      for(const side of [-1,1])solid(head,new THREE.SphereGeometry(.5,12,8,side<0?-Math.PI/2:Math.PI/2,Math.PI),
        side<0?0x484a4c:skin,0,0,0,.358,.323,.300);
    }else orb(head,skin,0,0,0,.358,.323,.300);
    for(const side of [-1,1]){
      orb(head,skin,side*.172,-.019,.009,.051,.077,.055);
      const eyeX=side*.065;
      if(key==='ebisu'){
        orb(eyes,ink,eyeX,0,.001,.098,.057,.030);
        orb(eyes,0x637f85,eyeX+.012,.008,.015,.031,.014,.012);
      }else if(key==='teuchi')box(eyes,ink,eyeX,.004,.001,.062,.010,.009,-side*.08,0,side*.20);
      else{
        orb(eyes,key==='zetsu'||key==='orochimaru'?0xd0b95f:0xe9e5d4,eyeX,0,.001,.067,.039,.023);
        orb(eyes,key==='naruto'?0x487aab:ink,eyeX,-.001,.012,.025,.028,.010);
      }
      if(key!=='teuchi'&&key!=='ebisu')box(head,ink,eyeX,.021,.148,.071,key==='guy'?.018:.012,.012,-side*.13,0,side*.10);
    }
    orb(head,skin,0,-.040,.146,.046,.051,.044);
    box(head,0x75534a,0,-.092,.126,.048,.009,.010);
    if(key==='iruka')box(head,0x805044,0,-.036,.171,.115,.009,.007,.011);
    if(key==='tsunade')box(head,0x8572a2,0,.052,.146,.029,.029,.009,Math.PI/4);
    if(key==='naruto')for(const s of [-1,1])for(let j=0;j<3;j++)
      box(head,0x8b5449,s*.1,-.048-j*.018,.123-j*.003,.050,.006,.008,s*.13,0,s*.28);

    solid(head,new THREE.SphereGeometry(.5,14,8,0,Math.PI*2,0,Math.PI*.59),hair,
      0,.028,-.025,.381,.328,.320);
    if(style==='tail'){
      for(const s of [-1,0,1])cone(head,hair,s*.071,.194,-.081,.108,.198,.145,-s*.52,-.49);
      wrap(head,0x605c4b,0,.121,-.148,.071,.041,.067,0,-.26);
    }
    if(style==='twins'||style==='long')for(const s of [-1,1]){
      orb(head,hair,s*.171,-.149,-.061,style==='long'?.13:.095,.348,.131,s*.065);
      orb(head,hair,s*.093,.066,.107,.090,.154,.105,s*.35);
    }
    if(style==='buns')for(const s of [-1,1])orb(head,hair,s*.148,.147,-.053,.139,.136,.141);
    if(style==='spikes')for(let i=0;i<7;i++){
      const angle=i/7*Math.PI*2;
      cone(head,hair,.121*Math.sin(angle),.158,.095*Math.cos(angle),.113,.184,.120,
        -.73*Math.sin(angle),.73*Math.cos(angle));
    }
    if(style==='chef'){
      wrap(head,0xe3e2d0,0,.155,-.019,.271,.104,.257);
      wrap(head,0xe4e5d5,0,.101,-.011,.365,.061,.314);
      box(head,0x7f6159,0,.130,.113,.131,.033,.014);
    }
    if(style==='bowl')orb(head,hair,0,.070,.123,.305,.071,.063);
    if(style==='hood'){
      orb(head,coat,0,.017,-.106,.408,.344,.182);
      box(head,shirt,0,-.077,.137,.262,.081,.042);
    }
    if(key==='naruto'||key==='iruka'||key==='ebisu'||key==='shikamaru'){
      wrap(head,band,0,.073,-.008,.375,.067,.328);
      box(head,metal,0,.073,.160,.156,.051,.026);
      box(head,0x697f76,0,.073,.177,.040,.019,.006);
    }
    rigs.push({spine,head,eyes,arms});
  }

  function makeToad(x:number,upper:number,dark:number,robe:number) {
    const body=pivot(root,'sapo',x,0,0),head=pivot(body,'cabeca',0,.51);
    const eyes=pivot(head,'olhos',0,.123,.077);
    orb(body,robe,0,.236,0,.330,.352,.262);
    orb(body,upper,0,.235,.106,.218,.229,.106);
    for(const side of [-1,1]){
      orb(body,dark,side*.148,.07,.045,.136,.118,.159);
      orb(body,upper,side*.151,.298,.057,.095,.199,.095,-side*.26);
      orb(head,upper,side*.112,.10,.025,.150,.170,.172);
      orb(eyes,0xe0be75,side*.108,0,.032,.083,.066,.043);
      box(eyes,ink,side*.108,0,.059,.061,.013,.008);
      orb(head,0xdccfba,side*.078,-.023,.125,.117,.076,.071,side*.25);
    }
    orb(head,upper,0,-.002,.021,.351,.233,.264);
    box(head,dark,0,-.035,.151,.170,.016,.010);
    rigs.push({spine:body,head,eyes});
  }
  if(id==='sapos-sabios'){
    makeToad(-.215,0x87975d,0x526743,0x5d5848);
    makeToad(.215,0x9a907c,0x635760,0x71604d);
  }else makeShinobi(id);

  for(const [parent,items] of parts){
    const geometry=mergeGeometries(items);
    items.forEach(item=>item.dispose());
    if(geometry){
      const mesh=new THREE.Mesh(geometry,material);
      mesh.castShadow=true;mesh.receiveShadow=true;
      parent.add(mesh);
    }
  }
  const phase=id.length*.81;
  return {
    root,material,
    update(time:number,action=false) {
      for(const [i,rig] of rigs.entries()){
        const t=time+phase+i*1.44,breath=Math.sin(t*2.48),sway=Math.sin(t*1.27);
        rig.spine.scale.y=1+breath*.019;
        rig.spine.rotation.z=sway*.025;
        rig.head.rotation.y=Math.sin(t*.86)*.14;
        rig.head.rotation.x=breath*.043;
        const blink=t%4.6;
        rig.eyes.scale.y=blink<.18?Math.max(.11,Math.abs(blink-.09)/.09):1;
        rig.arms?.forEach((arm,side)=>{
          const sign=side*2-1;
          arm.rotation.z=sign*(id==='naruto'?.11+.07*breath:.16+.06*sway);
          arm.rotation.x=id==='teuchi'&&side===1?-.24-.32*(.5+.5*Math.sin(t*3.4)):
            id==='naruto'&&action?-.20-.08*breath:breath*.085*sign;
        });
      }
    },
    dispose(){
      root.removeFromParent();
      root.traverse(node=>{if(node instanceof THREE.Mesh)node.geometry.dispose();});
      material.dispose();
    },
  };
}
