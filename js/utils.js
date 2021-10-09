const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

const getPos = e => {
  if(map.isometric){
    const _y = e.offsetY / map.gridHeight
    const _x = e.offsetX / map.gridWidth - map.intH / 2
    return {y: Math.floor(_y-_x), x: Math.floor(_x+_y)}
  }else{
    return {x: Math.floor(e.offsetX / map.gridWidth),
            y: Math.floor(e.offsetY / map.gridHeight)}
  }    
}
