/**
 * Ímã de drops (Rodada 55 — pedido do usuário: "O magnetismo do morro de bolinho não está puxando os itens do mapa
 * todo"). Drop puxado pelo ímã global do morro chega ao jogador em no máximo GLOBAL_PULL_SECONDS, de qualquer distância;
 * o ímã normal (raio de coleta) só acelera. Lógica pura, testada em tests/.
 */
export const GLOBAL_PULL_SECONDS=1.2;
export function magnetSpeed(currentSpeed:number,distance:number,globalPull:boolean){
  return globalPull?Math.max(currentSpeed,distance/GLOBAL_PULL_SECONDS):currentSpeed;
}

/** A coleta continua ativa quando só o cronômetro da missão está congelado. */
export function dropCanMagnetize(age:number,settle:number,distance:number,radius:number,globalPull:boolean) {
  return age>=settle && (distance<radius || globalPull);
}

type GroundPosition = { x:number; y:number; z:number };
type DropCell<T> = { key:string; x:number; z:number; minY:number; maxY:number; entries:Set<T> };
export const DROP_CELL_SIZE=8;
/**
 * Junção de drops no chão (26/11/2026 — pedido do usuário: "quando matamos muitos monstros e não coletamos, dropa muito o fps
 * e quando pegamos de uma vez ele chega a travar o jogo"). Cada abate solta XP, Ryu e chakra; no fim de jogo eram dezenas de
 * milhares de drops recalculados em todo quadro, e o ímã global movia todos de uma vez. Agora cada quadrado de 8 m guarda no
 * máximo `perCell` drops de cada tipo juntável; o excedente soma o valor num drop que já está ali (nada se perde).
 */
export const DROP_MERGE={perCell:6,kinds:new Set(['xp','ryu','chakra'])};
/**
 * Orbe de XP some do chão (26/11/2026 — usuário: "Muitos itens estão sendo dropados no chão… passar uns 20s sem pegar o item
 * de EXP vamos fazer sumir do mapa os itens"): orbe de XP parado no chão há mais de `xpSeconds` desaparece (o que o ímã já
 * puxou continua até chegar). Receber valor de uma junção conta como drop novo (o relógio recomeça).
 */
export const DROP_EXPIRY={xpSeconds:20};
export const dropExpired=(type:string,age:number)=>type==='xp'&&age>DROP_EXPIRY.xpSeconds;

/** Indexa o ponto onde cada drop caiu. Só o ímã pode tirá-lo da célula para movê-lo. */
export function createGroundDropIndex<T>(position:(drop:T)=>GroundPosition) {
  const cells=new Map<string,DropCell<T>>();
  const grounded=new Map<T,DropCell<T>>();
  const moving=new Set<T>();
  const cellIndex=(value:number)=>Math.floor(value/DROP_CELL_SIZE);
  const cellKey=(x:number,z:number)=>x+':'+z;

  function detach(drop:T) {
    const cell=grounded.get(drop);
    if(!cell)return false;
    grounded.delete(drop);
    cell.entries.delete(drop);
    if(!cell.entries.size)cells.delete(cell.key);
    return true;
  }

  function* near(x:number,z:number,radius:number) {
    const minX=cellIndex(x-radius),maxX=cellIndex(x+radius),minZ=cellIndex(z-radius),maxZ=cellIndex(z+radius);
    if((maxX-minX+1)*(maxZ-minZ+1)>cells.size){
      for(const cell of cells.values()){
        if(cell.x>=minX&&cell.x<=maxX&&cell.z>=minZ&&cell.z<=maxZ)yield* cell.entries;
      }
      return;
    }
    for(let cx=minX;cx<=maxX;cx++)for(let cz=minZ;cz<=maxZ;cz++){
      const cell=cells.get(cellKey(cx,cz));
      if(cell)yield* cell.entries;
    }
  }
  function* all() {
    yield* grounded.keys();
    yield* moving;
  }
  return {
    get size(){return grounded.size+moving.size;},
    add(drop:T){
      const point=position(drop),x=cellIndex(point.x),z=cellIndex(point.z),key=cellKey(x,z);
      let cell=cells.get(key);
      if(!cell){
        cell={key,x,z,minY:point.y,maxY:point.y,entries:new Set()};
        cells.set(key,cell);
      }
      cell.minY=Math.min(cell.minY,point.y);
      cell.maxY=Math.max(cell.maxY,point.y);
      cell.entries.add(drop);
      grounded.set(drop,cell);
    },
    /** Drop do chão, na mesma célula de (x, z), que deve receber o valor de um novo, ou undefined se ainda cabe outro. */
    mergeTarget(x:number,z:number,match:(drop:T)=>boolean,limit:number){
      const cell=cells.get(cellKey(cellIndex(x),cellIndex(z)));
      if(!cell)return undefined;
      let count=0,last:T|undefined;
      for(const entry of cell.entries)if(match(entry)){count++;last=entry;}
      return count>=limit?last:undefined;
    },
    /** Tira do chão um drop parado (não mexe nos que o ímã já puxou). */
    removeGrounded(drop:T){return detach(drop);},
    startPull(drop:T){if(detach(drop))moving.add(drop);},
    collect(drop:T){moving.delete(drop);},
    clear(){cells.clear();grounded.clear();moving.clear();},
    cells:()=>cells.values(),
    ground:()=>grounded.keys(),
    pulled:()=>moving.values(),
    near,
    all,
  };
}

/** Aplica o ganho de XP a cada orbe, inclusive aos orbes em coleta na troca de zona. */
export function collectedXp(value: number, playerMultiplier: number, tuningMultiplier: number) {
  return Math.round(value * playerMultiplier * tuningMultiplier);
}

/** O portal conclui a coleta dos orbes já atraídos ou no alcance de coleta. */
export function xpCollectedAtPortal(type: string, magnet: boolean, distance: number, pickupRadius: number) {
  return type === 'xp' && (magnet || distance < pickupRadius);
}
