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

const changeBrush = tile => {
  if(!tile)
    return
  if(!brush)
    brush = {}
  if(brushDiv)
    brushDiv.classList.remove('selected')
  brush.type = 'default'
  brush.data = tile ? tile : null
  brushDiv = $(`#tile_${tile[0]*htile+tile[1]}`)
  if(brushDiv)
    brushDiv.classList.add('selected')
  $('#statusbar').innerHTML = `selected tile: ${brush.data.join(',')}`
}

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

const createLayerSelector = (nLayers = null, collision = 0) => {
  if(!nLayers)
    nLayers = map.nLayers
  const select = $c('select')
  select.id = 'layerSelector'
  if (collision) {
    const opt = $c('option')
    opt.value = -1
    opt.innerText = `Collision`
    select.appendChild( opt )
  }
  for(let i = 0; i < nLayers; i++){
    const opt = $c('option')
    opt.value = i
    opt.innerText = `Layer ${i}`
    select.appendChild( opt )
  }
  select.value = 0
  select.addEventListener('change', e => {
    map.activeLayer = select.value
    $('#statusbar').innerHTML = `Active layer: ${select.value < 0 ? 'Collision' : select.value}`
  })
  return select
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
  
  const gridLabel = $c('label')
  gridLabel.innerText = "Grid: "
  const gridCheck = $c('input')
  gridCheck.type = "checkbox"
  gridCheck.checked = true
  gridCheck.onclick = () => {
    map.grid = gridCheck.checked
    map.show(c)
  }
  gridLabel.appendChild(gridCheck)
  canvasToolbar.appendChild(gridLabel)
  
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

const createTexturePalette = (imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset) => {
  // reset everything
  $('#toolbar').innerHTML = ''
  brush = null
  brushDiv = null
  customTiles = {}
  customTileId = 0
  randomTiles = {}
  randomTileId = 0
  loadedTextures = {}

  imgName = imgName.replace(/.*\\/,'')
  texture = new Texture(imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset)
  loadedTextures[texture.name] = true
  const eraser = $c('div')
  eraser.id = 'eraser'
  eraser.title = 'Eraser'
  eraser.className = 'tool'
  eraser.innerText = '\uf12d'
  eraser.onclick = () => selectTool('eraser')
  const bucket = $c('div')
  bucket.id = 'bucket'
  bucket.title = 'Paint Bucket'
  bucket.className = 'tool'
  bucket.innerText = '\uf576'
  bucket.onclick = () => selectTool('bucket')
  const drop = $c('div')
  drop.id = 'drop'
  drop.title = 'Eye Dropper'
  drop.className = 'tool'
  drop.innerText = '\uf1fb'
  drop.onclick = () => selectTool('drop')
  const tools = $c('div')
  tools.id = 'tools'
  tools.appendChild(eraser)
  tools.appendChild(bucket)
  tools.appendChild(drop)
  $('#toolbar').appendChild(tools)

  texture.load(() => {
    $('#statusbar').innerHTML = `Texture file ${imgName} loaded`
    htile = Math.floor(texture.image.width / (texture.tileRealWidth+texture.border))
    vtile = Math.floor(texture.image.height / (texture.tileRealHeight+texture.border))
    const tileIcons = $c('div')
    tileIcons.id = 'tileIcons'
    tileIcons.style.width = `${htile * texture.tileRealWidth}px`
    for(let i = 0; i < vtile; i++){
      for(let j = 0; j < htile; j++){
        const tileIcon = $c('div')
        tileIcon.id = 'tile_' + (i * htile + j)
        tileIcon.className = 'tileIcon'
        tileIcon.style.width = tileRealWidth + 'px'
        tileIcon.style.height = tileRealHeight + 'px'
        tileIcon.style.background =
          `url('${texture.src}') -${j*(texture.tileRealWidth+texture.border)}px -${i*(texture.tileRealHeight+texture.border)}px`
        tileIcon.onclick = () => changeBrush([i,j])
        tileIcons.appendChild( tileIcon )
      }
    }
    $('#toolbar').appendChild( tileIcons )
  })
}

const createNewCustomBrush = (tileWidth, tileHeight, htile, vtile) => {
  ++customTileId
  const tile = $c('div')
  tile.id = customTileId
  tile.className = 'tile'
  tile.style.width = tileWidth * htile + 'px'
  tile.style.height = tileHeight * vtile + 10 + 'px'
  const border = $c('div')
  border.title = `Select tile: custom tile ${tile.id}`
  border.style.width = tileWidth * htile + 'px'
  border.style.height = '10px'
  border.className = 'tileBorder'
  border.onclick = () => {
    brush = {
      'type': 'custom',
      'data': customTiles[tile.id]
    }
    if(brushDiv){
      brushDiv.classList.remove('selected')
      brushDiv = null
    }
    $('#statusbar').innerHTML = `selected tile: custom tile ${tile.id}`
  }
  tile.appendChild( border )
  for(let i = 0; i < vtile; i++){
    for(let j = 0; j < htile; j++){
      const square = $c('div')
      square.className = 'square'
      square.style.width = tileWidth + 'px'
      square.style.height = tileHeight + 'px'
      square.onclick = () => {
        if( !brushDiv || brush.type != 'default' )
          return
        square.style.background = brushDiv.style.background
        customTiles[tile.id][i][j] = brush.data
        if(brushDiv){
          brushDiv.classList.remove('selected')
          brushDiv = null
        }
      }
      tile.appendChild( square )
    }
  }
  const borderDel = $c('div')
  borderDel.title = `Deleted tile: custom tile ${tile.id}`
  borderDel.style.width = tileWidth * htile + 'px'
  borderDel.style.height = '10px'
  borderDel.className = 'tileBorderDelete'
  borderDel.onclick = () => {
    tile.remove()
    brush = null
    delete customTiles[tile.id]
    $('#statusbar').innerHTML = `Deleted tile: custom tile ${tile.id}`
  }
  tile.appendChild( borderDel )
  $('#toolbar').appendChild( tile )
  customTiles[tile.id] = Array(vtile).fill().map( _ => Array(htile).fill(0) )
}

const createNewRandomBrush = (tileWidth, tileHeight, htile) => {
  ++randomTileId
  const tile = $c('div')
  tile.id = randomTileId
  tile.className = 'tile'
  tile.style.width = tileWidth * htile + 'px'
  tile.style.height = tileHeight + 10 + 'px'
  const border = $c('div')
  border.title = `Select tile: random tile ${tile.id}`
  border.style.width = tileWidth * htile + 'px'
  border.style.height = '10px'
  border.className = 'tileBorder'
  border.onclick = () => {
    brush = {
      'type': 'random',
      'data': randomTiles[tile.id]
    }
    if(brushDiv){
      brushDiv.classList.remove('selected')
      brushDiv = null
    }
    $('#statusbar').innerHTML = `selected tile: random tile ${tile.id}`
  }
  tile.appendChild( border )
  for(let j = 0; j < htile; j++){
    const square = $c('div')
    square.className = 'square'
    square.style.width = tileWidth + 'px'
    square.style.height = tileHeight + 'px'
    square.onclick = () => {
      if( !brushDiv || brush.type != 'default' )
        return
      square.style.background = brushDiv.style.background
      randomTiles[tile.id][j] = brush.data
      if(brushDiv){
        brushDiv.classList.remove('selected')
        brushDiv = null
      }
    }
    tile.appendChild( square )
  }
  const borderDel = $c('div')
  borderDel.title = `Deleted tile: random tile ${tile.id}`
  borderDel.style.width = tileWidth * htile + 'px'
  borderDel.style.height = '10px'
  borderDel.className = 'tileBorderDelete'
  borderDel.onclick = () => {
    tile.remove()
    brush = null
    delete randomTiles[tile.id]
    $('#statusbar').innerHTML = `Deleted tile: random tile ${tile.id}`
  }
  tile.appendChild( borderDel )
  $('#toolbar').appendChild( tile )
  randomTiles[tile.id] = Array(htile).fill(0)
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
  createCanvasMap(data.width, data.height, data.tileSize, data.border, data.tileSizeDraw, data.nLayers)
  map = new Map()
  map.load(data)
  map.show(c)
  $('#layerSelector').innerHTML = createLayerSelector(map.nLayers).innerHTML
  $('#statusbar').innerHTML = `Map ${file.name} loaded with success!`
}

// code here only for example
window.onload = () => {
  const init = () => {
    const url = new URL(document.location)
    example = url.searchParams.get('example')
    if(example === '01'){
      createTexturePalette(
        'myCityTiles/myCityTiles-64x32.png',
        'myCityTiles-64x32.png', 64, 96, 0, 64, 32, 0
      )
      createCanvasMap(20, 20, 64, 32, 1, 1)
      $('#canvasarea').style.width = '60%'
    }
  }
  init()
}
