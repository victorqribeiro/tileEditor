const changeBrush = tile => {
  if(!tile)
    return
  if(!brush)
    brush = {}
  if(tile instanceof Array){
    if(brushDiv)
      brushDiv.classList.remove('selected')
    brush.type = 'default'
    brush.data = tile
    brushDiv = $(`#tile_${tile[0]*htile+tile[1]}`)
    if(brushDiv)
      brushDiv.classList.add('selected')
    $('#statusbar').innerHTML = `selected tile: ${brush.data.join(',')}`
  }else{
    brush.type = 'default'
    brush.data = tile
    $('#layerSelector').selectedIndex = 0
    map.activeLayer = -1
  } 
}

const createCheckbox = (text, func, checked) => {
  const label = $c('label')
  label.innerText = text
  const checkbox = $c('input')
  checkbox.type = "checkbox"
  checkbox.checked = checked
  checkbox.onclick = func
  label.appendChild(checkbox)
  return label
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

const createToolbar = () => {
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
}

const createCollisionPallete = (nCollisionTiles = 1, tileWidth, tileHeight) => {
  const collisionTiles = $c('div')
  collisionTiles.id = 'collisionTiles'
  collisionTiles.style.width = `${(nCollisionTiles + 1) * tileWidth}px`
  for(let i = 1; i < nCollisionTiles + 1; i++){
    const collisionTile = $c('div')
    collisionTile.id = 'collision_tile_' + i
    collisionTile.className = 'collisionTileIcon'
    collisionTile.style.width = tileWidth + 'px'
    collisionTile.style.height = tileHeight + 'px'
    collisionTile.style.backgroundColor = 'hsl(' + (i * 10) % 360 + ', 50%, 50%)'
    collisionTile.onclick = () => changeBrush(i)
    collisionTiles.appendChild(collisionTile)
  }
  $('#toolbar').appendChild(collisionTiles)
}

const createTexturePalette = (imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset, isometric) => {

  createCollisionPallete(10, tileWidth, tileHeight)

  brush = null
  brushDiv = null
  customTiles = {}
  customTileId = 0
  randomTiles = {}
  randomTileId = 0
  loadedTextures = {}

  imgName = imgName.replace(/.*\\/,'')
  texture = new Texture(imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset, isometric)
  loadedTextures[texture.name] = true

  texture.load(() => {
    $('#statusbar').innerHTML = `Texture file ${imgName} loaded`
    const tWidth = (isometric ? tileRealWidth : tileWidth)
    const tHeight = (isometric ? tileRealHeight : tileHeight)
    htile = Math.round(texture.image.width / (texture.tileRealWidth + texture.border))
    vtile = Math.round(texture.image.height / (texture.tileRealHeight + texture.border))
    const tileIcons = $c('div')
    tileIcons.id = 'tileIcons'
    tileIcons.style.width = `${htile * tWidth}px`
    for(let i = 0; i < vtile; i++){
      for(let j = 0; j < htile; j++){
        const tileIcon = $c('div')
        tileIcon.id = 'tile_' + (i * htile + j)
        tileIcon.className = 'tileIcon'
        tileIcon.style.width = tWidth + 'px'
        tileIcon.style.height = tHeight + 'px'
        tileIcon.style.imageRendering = 'crisp-edges'
        tileIcon.style.imageRendering = 'pixelated'
        tileIcon.style.backgroundImage = `url('${texture.src}')`
        tileIcon.style.backgroundSize = `${htile * tWidth}px ${vtile * tHeight}px`
        tileIcon.style.backgroundPosition = `-${j * tWidth}px -${i * tHeight}px`
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

