let brush = null,
  canvas,
  c,
  brushDiv = null,
  htile = null,
  vtile = null,
  tileImage, 
  tileImagePath,  
  map = null, 
  customTiles = {},
  customTileId = 0,
  randomTiles = {},
  randomTileId = 0,
  lastpos,
  loadedTextures = {},
  texture

const exportPNG = name => {
  canvas.toBlob( blob => {
    const link = document.createElement('a')
    const url = window.URL || window.webkitURL
    link.href = url.createObjectURL(blob)
    link.download = `${name}.png`
    link.click()
    $('#statusbar').innerHTML = `Saved ${name}.png`
  })
}

const createCanvasMap = (width, height, gridWidth, gridHeight, nLayers, isometric, collision) => {
  map = new Map(width, height, gridWidth, gridHeight, nLayers, isometric, collision)
  const canvasToolbar = $c('div')
  canvasToolbar.id = "canvas-toolbar"
  const subLayer = $c('button')
  subLayer.innerText = "-"
  subLayer.onclick = () => {
    map.removeLayer()
    $('#layerSelector').innerHTML = createLayerSelector(null, collision).innerHTML
    $('#layerSelector').value = map.activeLayer
    $('#statusbar').innerHTML = "Removed layer"
    map.show(c)
  }
  const addLayer = $c('button')
  addLayer.innerText = "+"
  addLayer.onclick = () => {
    map.addLayer()
    $('#layerSelector').innerHTML = createLayerSelector(null, collision).innerHTML
    $('#layerSelector').value = map.activeLayer
    $('#statusbar').innerHTML = "Added new layer"
  }
  layerSelector = createLayerSelector(nLayers, collision)
  canvasToolbar.appendChild(subLayer)
  canvasToolbar.appendChild(layerSelector)
  canvasToolbar.appendChild(addLayer)
  
  const showGrid = createCheckbox('Show grid: ', function(){map.grid = this.checked, map.show(c)}, true)
  canvasToolbar.appendChild(showGrid)
  
  if (collision) {
    const showCollision = createCheckbox('Show collision: ', function(){map.showCollision = this.checked, map.show(c)}, false)
    canvasToolbar.appendChild(showCollision)
  }
  
  const clearLayer = $c('button')
  clearLayer.innerText = "Clear layer"
  clearLayer.onclick = () => {
    const layerName = map.activeLayer >= 0 ? map.activeLayer : 'collision'
    if (!confirm(`Are you sure you want to clear layer ${layerName}`))
      return
    let _map = map.collision
    if (map.activeLayer >= 0)
      _map = map.layers[map.activeLayer]
    for (let i = 0; i < _map.length; i++)
      for (let j = 0; j < _map[0].length; j++)
        _map[i][j] = 0
    map.show(c)
    $('#statusbar').innerHTML = `Cleared layer ${layerName}`
  }
  canvasToolbar.appendChild(clearLayer)
  
  canvas = $c('canvas')
  canvas.width = map.width
  canvas.height = map.height
  c = canvas.getContext('2d')
  c.imageSmoothingEnabled = false
  canvas.addEventListener('mousedown', e => {
    if(!brush || e.button != 0)
      return
    lastpos = [null,null]
    lButtonDown = true
    const pos = getPos(e)
    map.addTile( brush, map.activeLayer, pos.y, pos.x )
    lastpos[0] = pos.y
    lastpos[1] = pos.x
    map.show(c)
  })
  canvas.addEventListener('mouseup', e => {
    if(e.button !== 0)
      return
    lButtonDown = false
    lastpos = [null,null]
  })
  canvas.addEventListener('mouseout', e => {
    lButtonDown = false
    lastpos = [null,null]  
  })
  canvas.addEventListener('mousemove', e => {
    if(!lButtonDown)  
      return
    const pos = getPos(e)
    if( (pos.y == lastpos[0] && pos.x == lastpos[1])
       || pos.y < 0 || pos.x < 0 || pos.y >= map.intH || pos.x >= map.intW)
      return
    map.addTile( brush, map.activeLayer, pos.y, pos.x )
    lastpos[0] = pos.y
    lastpos[1] = pos.x
    map.show(c)
  })
  map.show(c)
  $('#canvasarea').innerHTML = ''
  $('#canvasarea').appendChild(canvasToolbar)
  $('#canvasarea').appendChild(canvas)
  $('#statusbar').innerHTML = `New map created`
}

const selectTool = tool => {
    switch(tool){
      case 'eraser' :
          if(!brush)
            brush = {
              'type': 'default'
            }
          if(brush.type == 'custom')
            brush.type = 'default'
          brush.data = 0
          if(brushDiv){
            brushDiv.classList.remove('selected')
            brushDiv = null
          }
          $('#statusbar').innerHTML = "Eraser selected"
        break
      case 'bucket' :
          if(!brush)
            return
          if(brush.type == 'custom')
            brush.type = 'default'
          brush.type = 'bucket'
          if(brushDiv){
            brushDiv.classList.remove('selected')
            brushDiv = null
          }
          $('#statusbar').innerHTML = "Paint Bucket selected"  
        break
      case 'drop' :
        brush.type = 'drop'
          if(brushDiv){
            brushDiv.classList.remove('selected')
            brushDiv = null
          }
          $('#statusbar').innerHTML = "Eye Dropper selected"
        break
      case 'pencil' :
          if(!brush)
            return
          brush.type = 'default'
          $('#statusbar').innerHTML = "Pencil selected"
        break;
    }
}

const save = (name) => {
  const URL = window.URL || window.webkitURL
  map['textures'] = Object.keys(loadedTextures)
  let blob = new Blob([JSON.stringify(map)], {type: 'text/json'})
  let link = $c('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${name}.json`
  link.click()
}

const load = async file => {
  const url = window.URL || window.webkitURL
  filePath = url.createObjectURL(file)
  const request = await fetch(filePath)
  const response = await request.json()
  data = response
  let valid = true
  for(const texture of data.textures)
    if( !(texture in loadedTextures) )
      valid = false
  if(!valid){
    $('#statusbar').innerHTML = `Missing textures: ${data.textures.join(', ')}`
    return
  }
  /*todo refactor createCanvasMap */
  const {intW, intH, gridWidth, gridHeight, nLayers, isometric, collision} = data
  createCanvasMap(intW, intH, gridWidth, gridHeight, nLayers, isometric, collision)
  map.load(data)
  map.show(c)
  // $('#layerSelector').innerHTML = createLayerSelector(map.nLayers, map.collision).innerHTML
  $('#statusbar').innerHTML = `Map ${file.name} loaded with success!`
}

createToolbar()

// code here only for example
window.onload = () => {
  const init = () => {
    const url = new URL(document.location)
    example = url.searchParams.get('example')
    if(example === '01'){
      createCanvasMap(20, 20, 64, 32, 1, 1)
      createTexturePalette(
        'myCityTiles/myCityTiles-64x32.png',
        'myCityTiles-64x32.png', 64, 96, 0, 64, 32, 0, 1
      )
      $('#canvasarea').style.width = '60%'
    }
  }
  init()
}
