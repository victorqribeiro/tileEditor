let brush = null,
	canvas,
	c,
	brushDiv = null,
	tileImage, 
	tileImagePath, 
	mousedown = false, 
	map = null, 
	customTiles = {},
	customTileId = 0,
	randomTiles = {},
	randomTileId = 0,
	lastpos,
	loadedTextures = {}

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

const getPos = e => { return {x: Math.floor(e.offsetX / map.tileSizeDraw), y: Math.floor(e.offsetY / map.tileSizeDraw)} }

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

const createCanvasMap = (width, height, tileSize, border, tileSizeDraw, nLayers) => {
	map = new Map(width, height, tileSize, border, tileSizeDraw, nLayers)
	const canvasToolbar = $c('div')
	const subLayer = $c('button')
	subLayer.innerText = "-"
	subLayer.onclick = () => {
		map.removeLayer()
		$('#layerSelector').innerHTML = createLayerSelector().innerHTML
		$('#statusbar').innerHTML = "Removed layer"
	}
	const addLayer = $c('button')
	addLayer.innerText = "+"
	addLayer.onclick = () => {
		map.addLayer()
		$('#layerSelector').innerHTML = createLayerSelector().innerHTML
		$('#statusbar').innerHTML = "Added new layer"
	}
	layerSelector = createLayerSelector(nLayers)
	canvasToolbar.appendChild(subLayer)
	canvasToolbar.appendChild(layerSelector)
	canvasToolbar.appendChild(addLayer)
	canvas = $c('canvas')
	canvas.width = width * tileSizeDraw
	canvas.height = height * tileSizeDraw
	c = canvas.getContext('2d')
	c.imageSmoothingEnabled = false
	canvas.addEventListener('mousedown', e => {
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

const createTexturePalette = (imgSrc, imgName, tilesize, border) => {
	imgName = imgName.replace(/.*\\/,'')
	loadedTextures[imgName] = true
	const url = window.URL || window.webkitURL
	tileImagePath = url.createObjectURL(imgSrc)
	tileImage = new Image()
	tileImage.src = tileImagePath
	tileImage.onerror = () => {
		$('#statusbar').innerHTML = `Error loading texture file ${imgName}`
	}
	tileImage.onload = () => {
		$('#statusbar').innerHTML = `Texture file ${imgName} loaded`
		const eraser = $c('div')
		eraser.id = 'eraser'
		eraser.innerText = 'E'
		eraser.onclick = () => {
			if(brush.type == 'custom')
				brush.type = 'default'
			brush.data = 0
		}
		const bucket = $c('div')
		bucket.id = 'bucket'
		bucket.innerText = 'B'
		bucket.onclick = () => {
			if(brush.type == 'custom')
				brush.type = 'default'
			brush.type = 'bucket'
		}
		$('#toolbar').appendChild( eraser )
		$('#toolbar').appendChild( bucket )
		const finalsize = tilesize+border
		const htile = Math.floor(tileImage.width / finalsize)
		const vtile = Math.floor(tileImage.height / finalsize)
		const tileIcons = $c('div')
		tileIcons.id = 'tileIcons'
		tileIcons.style.width = htile * tilesize + 'px'
		for(let i = 0; i < vtile; i++){
			for(let j = 0; j < htile; j++){
				const tileIcon = $c('div')
				tileIcon.id = i + j * htile
				tileIcon.className = 'tileIcon'
				tileIcon.style.width = tilesize + 'px'
				tileIcon.style.height = tilesize + 'px'
				tileIcon.style.background = `url('${tileImagePath}') -${j*(tilesize+border)}px -${i*(tilesize+border)}px`
				tileIcon.onclick = () => { 
					brush = {
						'type': 'default',
						'data': [i,j]
					}
					brushDiv = tileIcon
					$('#statusbar').innerHTML = `selected tile: ${i},${j}`
				}
				tileIcons.appendChild( tileIcon )
			}
		}
		$('#toolbar').appendChild( tileIcons )
	}
}

const createNewCustomBrush = (tileSize, htile, vtile) => {
	++customTileId
	const tile = $c('div')
	tile.id = customTileId
	tile.className = 'tile'
	tile.style.width = tileSize * htile + 'px'
	tile.style.height = tileSize * vtile + 10 + 'px'
	const border = $c('div')
	border.title = `Select tile: custom tile ${randomTileId}`
	border.style.width = tileSize * htile + 'px'
	border.style.height = '10px'
	border.className = 'tileBorder'
	border.onclick = () => {
		brush = {
			'type': 'custom',
			'data': customTiles[customTileId]
		}
		$('#statusbar').innerHTML = `selected tile: custom tile ${customTileId}`
	}
	tile.appendChild( border )
	for(let i = 0; i < vtile; i++){
		for(let j = 0; j < htile; j++){
			const square = $c('div')
			square.className = 'square'
			square.style.width = tileSize + 'px'
			square.style.height = tileSize + 'px'
			square.onclick = () => {
				if( !brushDiv || brush.type != 'default' )
					return
				square.style.background = brushDiv.style.background
				customTiles[customTileId][i][j] = brush.data
				brushDiv = null
			}
			tile.appendChild( square )
		}
	}
    const borderDel = $c('div')
    borderDel.title = `Deleted tile: custom tile ${randomTileId}`
	borderDel.style.width = tileSize * htile + 'px'
	borderDel.style.height = '10px'
	borderDel.className = 'tileBorderDelete'
	borderDel.onclick = () => {
	    tile.remove()
	    brush = null
		delete customTiles[customTileId]
		$('#statusbar').innerHTML = `Deleted tile: custom tile ${customTileId}`
	}
	tile.appendChild( borderDel )
	$('#toolbar').appendChild( tile )
	customTiles[customTileId] = Array(vtile).fill().map( _ => Array(htile).fill(0) )
}

const createNewRandomBrush = (tileSize, htile) => {
	++randomTileId
	const tile = $c('div')
	tile.id = randomTileId
	tile.className = 'tile'
	tile.style.width = tileSize * htile + 'px'
	tile.style.height = tileSize + 10 + 'px'
	const border = $c('div')
	border.title = `Select tile: random tile ${randomTileId}`
	border.style.width = tileSize * htile + 'px'
	border.style.height = '10px'
	border.className = 'tileBorder'
	border.onclick = () => {
		brush = {
			'type': 'random',
			'data': randomTiles[randomTileId]
		}
		$('#statusbar').innerHTML = `selected tile: random tile ${randomTileId}`
	}
	tile.appendChild( border )
	for(let j = 0; j < htile; j++){
		const square = $c('div')
		square.className = 'square'
		square.style.width = tileSize + 'px'
		square.style.height = tileSize + 'px'
		square.onclick = () => {
			if( !brushDiv || brush.type != 'default' )
				return
			square.style.background = brushDiv.style.background
			randomTiles[randomTileId][j] = brush.data
			brushDiv = null
		}
		tile.appendChild( square )
	}
    const borderDel = $c('div')
    borderDel.title = `Deleted tile: random tile ${randomTileId}`
	borderDel.style.width = tileSize * htile + 'px'
	borderDel.style.height = '10px'
	borderDel.className = 'tileBorderDelete'
	borderDel.onclick = () => {
	    tile.remove()
	    brush = null
		delete randomTiles[randomTileId]
		$('#statusbar').innerHTML = `Deleted tile: random tile ${randomTileId}`
	}
	tile.appendChild( borderDel )
	$('#toolbar').appendChild( tile )
	randomTiles[randomTileId] = Array(htile).fill(0)
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
