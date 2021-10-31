class Map {

  constructor(width = 0, height = 0, gridWidth = 0, gridHeight = 0, nLayers = 1, isometric = 0, collision = 0){
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.intW = width
    this.intH = height
    this.nLayers = nLayers
    this.activeLayer = 0
    this.isometric = isometric
    this.collision = collision == 0 ? null : Array(this.intH).fill().map( _ => Array(this.intW).fill(0))
    this.showCollision = false
    this.grid = true
    this.layers = Array(this.nLayers).fill().map( __ => Array(this.intH).fill().map( _ => Array(this.intW).fill(0)))
    this.calculateMapSize()
    this.needCanvasUpdate = false
  }

  calculateMapSize(){
    if(this.isometric){
      this.width = this.intW * this.gridWidth + (this.intH-this.intW) * this.gridWidth/2
      this.height = this.width / (this.gridWidth/this.gridHeight)
    }else{
      this.width = this.intW * this.gridWidth
      this.height = this.intH * this.gridHeight
    }
  }

  drawIsometricTile(c, x, y, fillColor, strokeColor){
    c.save()
    c.translate((y-x) * this.gridWidth/2, (x+y) * this.gridHeight/2)
    c.beginPath()
    c.moveTo(0, 0)
    c.lineTo(this.gridWidth/2, this.gridHeight/2)
    c.lineTo(0, this.gridHeight)
    c.lineTo(-this.gridWidth/2, this.gridHeight/2)
    c.closePath()
    c.fillStyle = fillColor
    c.fill()
    c.strokeStyle = strokeColor
    c.stroke()
    c.restore()
  }

  showIsometricGrid(c){
    c.save()
    c.translate( (this.intW * this.gridWidth)/2 + (this.intH-this.intW) * this.gridWidth/2, 0)
    for(let i = 0; i < this.intH; i++)
      for(let j = 0; j < this.intW; j++)
        this.drawIsometricTile(c, i, j, 'rgba(0,0,0,0)', 'black')
    c.restore()
  }

  showSquareGrid(c){
    for(let i = 0; i < this.intH; i++)
      for(let j = 0; j < this.intW; j++)
        c.strokeRect(j * this.gridWidth, i * this.gridHeight, this.gridWidth, this.gridHeight)
  }

  showGrid(c){
    if(this.isometric)
      this.showIsometricGrid(c)
    else
      this.showSquareGrid(c)
  }

  showSquaredTile(c, x, y, i, j){
    c.drawImage(
      texture.image, 
      x * (texture.tileRealWidth + texture.border), 
      y * (texture.tileRealHeight + texture.border), 
      texture.tileRealWidth, 
      texture.tileRealHeight,
      j * this.gridWidth, 
      i * this.gridHeight, 
      this.gridWidth,
      this.gridHeight
    )
  }
 
  showSquaredCollisionTile(c, i, j){
    c.fillStyle = $(`#collision_tile_${this.collision[i][j]}`).style.backgroundColor || "rgba(255, 0, 0, 0.25)"
    c.fillRect(
      j * this.gridWidth, 
      i * this.gridHeight, 
      this.gridWidth,
      this.gridHeight
    )
  }
    
  showIsometricTile(c, x, y, i, j){
    c.save()
    c.translate((j-i) * texture.tileWidth/2, (i+j) * texture.tileHeight/2)
    c.drawImage(
      texture.image,
      x * (texture.tileRealWidth + texture.border),
      y * (texture.tileRealHeight + texture.border), 
      texture.tileRealWidth, texture.tileRealHeight,
      -texture.tileWidth/2, -texture.tileRealHeight + texture.tileHeight+texture.bottomOffset,
      texture.tileRealWidth, texture.tileRealHeight
    )
    c.restore()
  }

  showIsometricCollisionTile(c, i, j){
    const color = $(`#collision_tile_${this.collision[i][j]}`).style.backgroundColor || "rgba(255, 0, 0, 0.25)"
    this.drawIsometricTile(c, i, j, color, 'rgba(0,0,0,0)')
  }

  show(c){
    if(this.needCanvasUpdate){
      c.canvas.width = this.width
      c.canvas.height = this.height
      c.imageSmoothingEnabled = false
      this.needCanvasUpdate = false
    }
    c.clearRect(0, 0, this.width, this.height)
    if(this.isometric){
      c.save()
      c.translate((this.intW * this.gridWidth)/2 + (this.intH-this.intW) * this.gridWidth/2, 0)
    }
    for(let l = 0; l < this.nLayers; l++){
      for(let i = 0; i < this.intH; i++){
        for(let j = 0; j < this.intW; j++){
          if( !this.layers[l][i][j] )
            continue
          const x = this.layers[l][i][j][1]
          const y = this.layers[l][i][j][0]
          if(this.isometric)
              this.showIsometricTile(c, x, y, i, j)
          else
              this.showSquaredTile(c, x, y, i, j)
        }
      }
    }
    c.globalAlpha = 0.6
    if(this.showCollision) {
      for(let i = 0; i < this.intH; i++){
        for(let j = 0; j < this.intW; j++){
          if(!map.collision[i][j])
            continue
          if(this.isometric)
            this.showIsometricCollisionTile(c, i, j)
          else
            this.showSquaredCollisionTile(c, i, j)
        }
      }
    }
    c.globalAlpha = 1
    if(this.isometric)  
      c.restore()
    if(this.grid)
      this.showGrid(c)
  }

  load(data){
    this.width = data.width
    this.height = data.height
    this.gridWidth = data.gridWidth
    this.gridHeight = data.gridHeight
    this.intW = data.intW
    this.intH = data.intH
    this.nLayers = data.nLayers
    this.layers = data.layers
    this.isometric = data.isometric
    this.collision = data.collision
    this.needCanvasUpdate = true
  }

  paintCustom(brush, layer, posy, posx){
    if(this.isometric)
      this.paintCustomIsometric(brush, layer, posy, posx)
    else
      this.paintCustomSquare(brush, layer, posy, posx)
  }

  paintCustomSquare(brush, layer, posy, posx){
    for(let i = 0; i < brush.data.length; i++){
      for(let j = 0; j < brush.data[0].length; j++){
        if( posy+i < this.intH && posx+j < this.intW )
          layer[posy+i][posx+j] = brush.data[i][j]
      }
    }
  }

  paintCustomIsometric(brush, layer, posy, posx){
    const scaleV = Math.floor(texture.tileRealHeight/texture.tileHeight)
    for(let i = 0; i < brush.data.length; i++){
      for(let j = 0; j < brush.data[0].length; j++){
        const posY = posy + (i * scaleV) + j
        const posX = posx + (i * scaleV) - j
        if( posY < this.intH && posX < this.intW )
          layer[posY][posX] = brush.data[i][j]
      }
    }
  }

  paintRandom(brush, layer, posy, posx){
    layer[posy][posx] = brush.data[Math.floor(Math.random() * brush.data.length)]
  }

  paintBucket(brush, layer, posy, posx){
    const oldTile = layer[posy][posx]
    const visited = {}
    const toVisit = [[posy,posx]]
    const toVisitCheck = {}
    while(toVisit.length){
      const current = toVisit.shift()
      layer[current[0]][current[1]] = brush.data
      visited[current] = true
      toVisitCheck[current] = true

      if( current[0]-1 >= 0
        && !([current[0]-1, current[1]] in visited)
        && !([current[0]-1, current[1]] in toVisitCheck)
        && this.isEqual(layer[current[0]-1][current[1]], oldTile)){
          toVisit.push( [current[0]-1,current[1]] )
          toVisitCheck[[current[0]-1,current[1]]] = true
      }

      if( current[0]+1 < this.intH
        && !([current[0]+1,current[1]] in visited)
        && !([current[0]+1,current[1]] in toVisitCheck)
        && this.isEqual(layer[current[0]+1][current[1]], oldTile)){
          toVisit.push( [current[0]+1,current[1]] )
          toVisitCheck[[current[0]-1,current[1]]] = true
      }

      if( current[1]-1 >= 0
        && !([current[0],current[1]-1] in visited)
        && !([current[0],current[1]-1] in toVisitCheck)
        && this.isEqual(layer[current[0]][current[1]-1], oldTile)){
        toVisit.push( [current[0],current[1]-1] )
        toVisitCheck[[current[0],current[1]-1]] = true
      }

      if( current[1]+1 < this.intW
        && !([current[0],current[1]+1] in visited)
        && !([current[0],current[1]+1] in toVisitCheck)
        && this.isEqual(layer[current[0]][current[1]+1], oldTile)){
          toVisit.push( [current[0],current[1]+1] )
          toVisitCheck[[current[0],current[1]+1]] = true
      }
    }
  }

  isEqual(a,b){
    if( a instanceof Array && b instanceof Array )
      return a[0] == b[0] && a[1] == b[1]
    return a == b
  }

  addTile(brush, nlayer, posy, posx){
    if (typeof brush.data == 'number' && brush.data > 0 && nlayer >= 0)
      return alert('collision tiles must be used on collision layer')
    if (brush.data instanceof Array && nlayer < 0)
      return alert('Tiles are not supposed to be used in collision layer')
    const layer = nlayer < 0 ? this.collision : this.layers[nlayer]
    switch(brush.type){
      case 'default' :
          layer[posy][posx] = brush.data
        break
      case 'custom' :
          this.paintCustom(brush, layer, posy, posx)
        break
      case 'random' :
          this.paintRandom(brush, layer, posy, posx)
        break
      case 'bucket' :
          this.paintBucket(brush, layer, posy, posx)
        break
      case 'drop' :
          changeBrush(layer[posy][posx])
        break
    }
  }

  expand(top, bottom, left, right){
    for(let l = 0; l < this.nLayers; l++){
      for(let i = 0; i < top; i++){
        this.layers[l].unshift( Array(this.intW).fill(0) )
        if (this.collision && l == this.nLayers - 1)
          this.collision.unshift( Array(this.intW).fill(0) )
      }
      for(let i = 0; i < bottom; i++){
        this.layers[l].push( Array(this.intW).fill(0) )
        if (this.collision && l == this.nLayers - 1)
          this.collision.push( Array(this.intW).fill(0) )
      }
      for(let i = 0; i < this.layers[l].length; i++){
        for(let j = 0; j < left; j++){
          this.layers[l][i].unshift(0)
          if (this.collision && l == this.nLayers - 1)
            this.collision[i].unshift( 0 )
        }
        for(let j = 0; j < right; j++){
          this.layers[l][i].push(0)
          if (this.collision && l == this.nLayers - 1)
            this.collision[i].push( 0 )
        }
      }
    }
    this.intH = this.layers[0].length
    this.intW = this.layers[0][0].length
    this.calculateMapSize()
    this.needCanvasUpdate = true 
  }

  shrink(top, bottom, left, right){
    for(let l = 0; l < this.nLayers; l++){
      for(let i = 0; i < top; i++){
        this.layers[l].shift()
        if (this.collision && l == this.nLayers - 1)
          this.collision.shift()
      }
      for(let i = 0; i < bottom; i++){
        this.layers[l].pop()
        if (this.collision && l == this.nLayers - 1)
          this.collision.pop()
      }
      for(let i = 0; i < this.layers[l].length; i++){
        for(let j = 0; j < left; j++){
          this.layers[l][i].shift()
          if (this.collision && l == this.nLayers - 1)
            this.collision[i].shift()
        }
        for(let j = 0; j < right; j++){
          this.layers[l][i].pop()
          if (this.collision && l == this.nLayers - 1)
            this.collision[i].pop()
        }
      }
    }
    this.intH = this.layers[0].length
    this.intW = this.layers[0][0].length
    this.calculateMapSize()
    this.needCanvasUpdate = true
  }

  addLayer(){
    this.layers.push(Array(this.intH).fill().map( _ => Array(this.intW).fill(0)))
    this.nLayers = this.layers.length
    this.activeLayer = this.nLayers-1
  }

  removeLayer(){
    this.layers.pop()
    this.nLayers = this.layers.length
    this.activeLayer = this.nLayers-1
  }

}
