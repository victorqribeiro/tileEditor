class Texture {

  constructor(imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset, isometric){
    this.src = imgSrc
    this.name = imgName
    this.tileRealWidth = tileRealWidth
    this.tileRealHeight = tileRealHeight
    this.border = border
    this.tileWidth = tileWidth
    this.tileHeight = tileHeight
    this.bottomOffset = bottomOffset
    this.isometric = isometric
  }

  load(callback){
    const url = window.URL || window.webkitURL
    this.image = new Image()
    this.image.onload = callback
    this.src = this.src instanceof File ? url.createObjectURL(this.src) : this.src
    this.image.src = this.src
  }

}
