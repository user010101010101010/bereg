export type HeaderScrollState={lastY:number;anchorY:number;direction:-1|0|1;hidden:boolean};

export function createHeaderScrollState(y=0):HeaderScrollState{
 const position=Math.max(0,y);
 return {lastY:position,anchorY:position,direction:0,hidden:false};
}

export function updateHeaderScroll(state:HeaderScrollState,y:number,pinned=false):HeaderScrollState{
 const position=Math.max(0,y);
 if(pinned||position<=96)return createHeaderScrollState(position);
 const delta=position-state.lastY;
 if(delta===0)return state;
 const direction=delta>0?1:-1;
 const anchorY=direction===state.direction?state.anchorY:state.lastY;
 const threshold=direction===1?14:8;
 return {lastY:position,anchorY,direction,hidden:Math.abs(position-anchorY)>=threshold?direction===1:state.hidden};
}
