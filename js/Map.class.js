class Map {

	constructor(width = 0, height = 0, tileSize = 0, border = 0, tileSizeDraw = 0, nLayers = 1){
		this.tileSize = tileSize
		this.border = border
		this.tileSizeDraw = tileSizeDraw
		this.intW = width
		this.intH = height
		this.width = this.intW * this.tileSizeDraw
		this.height = this.intH * this.tileSizeDraw
		this.nLayers = nLayers
		this.activeLayer = 0
		this.grid = true
		this.layers = Array(this.nLayers).fill().map( __ => Array(this.intH).fill().map( _ => Array(this.intW).fill(0)))
		this.needCanvasUpdate = false
	}

	showGrid(c){
		for(let i = 0; i < this.intH; i++)
			for(let j = 0; j < this.intW; j++)
				c.strokeRect(j * this.tileSizeDraw, i * this.tileSizeDraw, this.tileSizeDraw, this.tileSizeDraw)	
	}

	show(c){
		if(this.needCanvasUpdate){
			c.canvas.width = this.width
			c.canvas.height = this.height
			c.imageSmoothingEnabled = false
			this.needCanvasUpdate = false
		}
		c.clearRect(0, 0, this.width, this.height)
		if(this.grid)
			this.showGrid(c)
		for(let l = 0; l < this.nLayers; l++)
			for(let i = 0; i < this.intH; i++)
				for(let j = 0; j < this.intW; j++)
					if( this.layers[l][i][j] ){
						const x = this.layers[l][i][j][1],
									y = this.layers[l][i][j][0]
						c.drawImage(
							tileImage, 
							x * (this.tileSize + this.border), 
							y * (this.tileSize + this.border), 
							this.tileSize, this.tileSize,
							j * this.tileSizeDraw, 
							i * this.tileSizeDraw, 
							this.tileSizeDraw, this.tileSizeDraw
						)
					}
	}
	
	load(data){
		this.width = data.width
		this.height = data.height
		this.tileSize = data.tileSize
		this.tileSizeDraw = data.tileSizeDraw
		this.intW = data.intW
		this.intH = data.intH
		this.nLayers = data.nLayers
		this.layers = data.layers
		this.textures = data.textures
		this.needCanvasUpdate = true
	}
	
	paintCustom(brush,nlayer,posy,posx){
		for(let i = 0; i < brush.data.length; i++){
			for(let j = 0; j < brush.data[0].length; j++){
				if( posy+i < this.intH && posx+j < this.intW )
					this.layers[nlayer][posy+i][posx+j] = brush.data[i][j]
			}
		}		
	}
	
	paintRandom(brush,nlayer,posy,posx){
		this.layers[nlayer][posy][posx] = brush.data[Math.floor(Math.random() * brush.data.length)]
	}
	
	paintBucket(brush,nlayer,posy,posx){
		const oldTile = this.layers[nlayer][posy][posx]
		const visited = {}
		const toVisit = [[posy,posx]]
		const toVisitCheck = {}
		while(toVisit.length){
			const current = toVisit.shift()
			this.layers[nlayer][current[0]][current[1]] = brush.data
			visited[current] = true
			toVisitCheck[current] = true
			
			if( current[0]-1 >= 0 && 
					!([current[0]-1,current[1]] in visited) &&
					!([current[0]-1,current[1]] in toVisitCheck) &&
					this.isEqual(this.layers[nlayer][current[0]-1][current[1]], oldTile)){
				toVisit.push( [current[0]-1,current[1]] )
				toVisitCheck[[current[0]-1,current[1]]] = true
			}
			
			if( current[0]+1 < this.intH && 
					!([current[0]+1,current[1]] in visited) &&
					!([current[0]+1,current[1]] in toVisitCheck) &&
					this.isEqual(this.layers[nlayer][current[0]+1][current[1]], oldTile)){
				toVisit.push( [current[0]+1,current[1]] )
				toVisitCheck[[current[0]-1,current[1]]] = true
			}
			
			if( current[1]-1 >= 0 && 
					!([current[0],current[1]-1] in visited) &&
					!([current[0],current[1]-1] in toVisitCheck) &&
					this.isEqual(this.layers[nlayer][current[0]][current[1]-1], oldTile)){
				toVisit.push( [current[0],current[1]-1] )
				toVisitCheck[[current[0],current[1]-1]] = true
			}
			
			if( current[1]+1 < this.intW && 
					!([current[0],current[1]+1] in visited) &&
					!([current[0],current[1]+1] in toVisitCheck) &&
					this.isEqual(this.layers[nlayer][current[0]][current[1]+1], oldTile)){
				toVisit.push( [current[0],current[1]+1] )
				toVisitCheck[[current[0],current[1]+1]] = true
			}
		}
	}

	isEqual(a,b){
		if( a instanceof Array && b instanceof Array ){
			return a[0] == b[0] && a[1] == b[1]
		}
		return a == b
	}

	addTile(brush,nlayer,posy,posx){
		switch(brush.type){
			case 'default' :
					this.layers[nlayer][posy][posx] = brush.data
				break
			case 'custom' :
					this.paintCustom(brush,nlayer,posy,posx)
				break
			case 'random' :
					this.paintRandom(brush,nlayer,posy,posx)
				break
			case 'bucket' :
					this.paintBucket(brush,nlayer,posy,posx)
				break
		}
	}
	
	expand(top, bottom, left, right){
		for(let l = 0; l < this.nLayers; l++){
			for(let i = 0; i < top; i++){
				this.layers[l].unshift( Array(this.intW).fill(0) )
			}
			for(let i = 0; i < bottom; i++){
				this.layers[l].push( Array(this.intW).fill(0) )
			}
			for(let i = 0; i < this.layers[l].length; i++){
				for(let j = 0; j < left; j++){
					this.layers[l][i].unshift(0)
				}
				for(let j = 0; j < right; j++){
					this.layers[l][i].push(0)
				}
			}
		}
		this.intH = this.layers[0].length
		this.intW = this.layers[0][0].length
		this.height = this.tileSizeDraw * this.intH
		this.width = this.tileSizeDraw * this.intW
		this.needCanvasUpdate = true 
	}

	shrink(top, bottom, left, right){
		for(let l = 0; l < this.nLayers; l++){
			for(let i = 0; i < top; i++){
				this.layers[l].shift()
			}
			for(let i = 0; i < bottom; i++){
				this.layers[l].pop()
			}
			for(let i = 0; i < this.layers[l].length; i++){
				for(let j = 0; j < left; j++){
					this.layers[l][i].shift()
				}
				for(let j = 0; j < right; j++){
					this.layers[l][i].pop()
				}
			}
		}
		this.intH = this.layers[0].length
		this.intW = this.layers[0][0].length
		this.height = this.tileSizeDraw * this.intH
		this.width = this.tileSizeDraw * this.intW
		this.needCanvasUpdate = true 
	}
	
	addLayer(){
		this.layers.push(Array(this.intH).fill().map( _ => Array(this.intW).fill(0)))
		this.nLayers = this.layers.length
	}
	
	removeLayer(){
		this.layers.pop()
		this.nLayers = this.layers.length
	}

}
