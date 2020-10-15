let brush = null,
	canvas,
	c,
	brushDiv = null,
	htile = null,
	vtile = null,
	tileImage, 
	tileImagePath, 
	mousedown = false, 
	map = null, 
	customTiles = {},
	customTileId = 0,
	randomTiles = {},
	randomTileId = 0,
	lastpos,
	loadedTextures = {},
	t

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

const getPos = e => {
    if(map.isometric){
        const _y = e.offsetY / map.gridHeight
        const _x = e.offsetX / map.gridWidth - map.intW / 2
        return {
            x: Math.floor(_y-_x),
            y: Math.floor(_x+_y)
        }
    }else{
        return {
            x: Math.floor(e.offsetX / map.gridWidth),
            y: Math.floor(e.offsetY / map.gridHeight)
        }
    }    
}

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

const createLayerSelector = (nLayers = null) => {
	if(!nLayers)
		nLayers = map.nLayers
	const select = $c('select')
	select.id = 'layerSelector'
	for(let i = 0; i < nLayers; i++){
		const opt = $c('option')
		opt.value = i
		opt.innerText = `Layer ${i}`
		select.appendChild( opt )
	}
	select.addEventListener('change', e => {
		map.activeLayer = select.value
		$('#statusbar').innerHTML = `Active layer: ${select.value}.png`
	})
	return select
}

const createCanvasMap = (width, height, gridWidth, gridHeight, nLayers, isometric) => {
	map = new Map(width, height, gridWidth, gridHeight, nLayers, isometric)
	const canvasToolbar = $c('div')
	const subLayer = $c('button')
	subLayer.innerText = "-"
	subLayer.onclick = () => {
		map.removeLayer()
		$('#layerSelector').innerHTML = createLayerSelector().innerHTML
		$('#layerSelector').value = map.activeLayer
		$('#statusbar').innerHTML = "Removed layer"
		map.show(c)
	}
	const addLayer = $c('button')
	addLayer.innerText = "+"
	addLayer.onclick = () => {
		map.addLayer()
		$('#layerSelector').innerHTML = createLayerSelector().innerHTML
		$('#layerSelector').value = map.activeLayer
		$('#statusbar').innerHTML = "Added new layer"
	}
	layerSelector = createLayerSelector(nLayers)
	canvasToolbar.appendChild(subLayer)
	canvasToolbar.appendChild(layerSelector)
	canvasToolbar.appendChild(addLayer)
	canvas = $c('canvas')
	canvas.width = width * gridWidth
	canvas.height = height * gridHeight
	c = canvas.getContext('2d')
	c.imageSmoothingEnabled = false
	canvas.addEventListener('mousedown', e => {
	    if(!brush)
	        return
		lastpos = [null,null]
		mousedown = true
		const pos = getPos(e)
		map.addTile( brush, map.activeLayer, pos.y, pos.x )
		lastpos[0] = pos.y
		lastpos[1] = pos.x
		map.show(c)
	})
	canvas.addEventListener('mouseup', e => {
		mousedown = false
		lastpos = [null,null]
	})
	canvas.addEventListener('mouseout', e => {
		mousedown = false
		lastpos = [null,null]	
	})
	canvas.addEventListener('mousemove', e => {
		if(!mousedown)	
			return
		const pos = getPos(e)
		if( (pos.y == lastpos[0] && pos.x == lastpos[1]) ||
			 pos.y < 0 || pos.x < 0 || pos.y >= map.intH || pos.x >= map.intW)
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

const createTexturePalette = (imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset) => {
	imgName = imgName.replace(/.*\\/,'')
    t = new Texture(imgSrc, imgName, tileRealWidth, tileRealHeight, border, tileWidth, tileHeight, bottomOffset)
	loadedTextures[t.name] = true

	const eraser = $c('div')
	eraser.id = 'eraser'
	eraser.className = 'tool'
	eraser.innerText = '\uf12d'
	eraser.onclick = () => {
		if(brush.type == 'custom')
			brush.type = 'default'
		brush.data = 0
		if(brushDiv){
		    brushDiv.classList.remove('selected')
		    brushDiv = null
		}
		$('#statusbar').innerHTML = "Eraser selected"
	}
	const bucket = $c('div')
	bucket.id = 'bucket'
	bucket.className = 'tool'
	bucket.innerText = '\uf576'
	bucket.onclick = () => {
		if(brush.type == 'custom')
			brush.type = 'default'
		brush.type = 'bucket'
		if(brushDiv){
		    brushDiv.classList.remove('selected')
		    brushDiv = null
		}
		$('#statusbar').innerHTML = "Paint Bucket selected"
	}
	const drop = $c('div')
	drop.id = 'drop'
	drop.className = 'tool'
	drop.innerText = '\uf1fb'
	drop.onclick = () => {
        brush.type = 'drop'
		if(brushDiv){
		    brushDiv.classList.remove('selected')
		    brushDiv = null
		}
        $('#statusbar').innerHTML = "Eye Drop selected"
	}
	const tools = $c('div')
	tools.id = 'tools'
	tools.appendChild(eraser)
	tools.appendChild(bucket)
	tools.appendChild(drop)
	$('#toolbar').appendChild(tools)

    t.load(() => {
		$('#statusbar').innerHTML = `Texture file ${imgName} loaded`
		htile = Math.floor(t.image.width / (t.tileRealWidth+t.border))
		vtile = Math.floor(t.image.height / (t.tileRealHeight+t.border))
		const tileIcons = $c('div')
		tileIcons.id = 'tileIcons'
		tileIcons.style.width = `${htile * t.tileRealWidth}px`
		for(let i = 0; i < vtile; i++){
			for(let j = 0; j < htile; j++){
				const tileIcon = $c('div')
				tileIcon.id = 'tile_' + (i * htile + j)
				tileIcon.className = 'tileIcon'
				tileIcon.style.width = tileRealWidth + 'px'
				tileIcon.style.height = tileRealHeight + 'px'
				tileIcon.style.background = `url('${t.src}') -${j*(t.tileRealWidth+t.border)}px -${i*(t.tileRealHeight+t.border)}px`
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
	$('#statusbar').innerHTML = `Map ${file.name} loaded with success!`
}

$('body').addEventListener('click', e => {
	document.querySelectorAll('.menu_content').forEach( elm => elm.style.display = "none" )
	switch(e.target.parentNode.className){
		case 'menu' :
				e.target.parentNode.querySelector(".menu_content").style.display = "block"
			break
		case 'menu_content' :
				const root = e.target.parentNode.parentNode.innerText.toLowerCase()
				const opt = e.target.innerText.toLowerCase()
				if( root in Menu && opt in Menu[root] )
					Menu[root][opt]()
			break
	}
})
