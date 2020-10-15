const Menu  = {

	'showWindow': (conf, func) => {
		const bg = $c('div')
		bg.className = 'popup'
		const div = $c('div')
		div.className = 'window'
		for(const key in conf){
			const row = $c('div')
			row.className = 'row'
			const label = $c('label')
			label.innerText = key
			const input = $c('input')
			input.type = conf[key]
			input.id = key
			if(key == "image")
				input.accept = "image/*"
			if(conf[key] == "number")
				input.value = 0
			row.appendChild( label )
			row.appendChild( input )
			div.appendChild( row )
		}
		const btns = $c('div')
		btns.className = 'row'
		const ok = $c('button')
		ok.innerText = "Ok"
		ok.onclick = _ => {
			const args = []
			for(const key in conf){
			    if(conf[key] == 'checkbox')
			        $(`#${key}`).value = $(`#${key}`).checked ? 1 : 0
				if(conf[key] == 'file')
					args.push( $(`#${key}`).files[0] )
				args.push( $(`#${key}`).value )
			}
			func(args)
			bg.remove()
		}
		div.addEventListener('keypress', e => {
		    const path = e.path || (e.composedPath && e.composedPath())
			if(e.keyCode == 13 && path[0].innerText !== "Ok")
				ok.click()
		})
		const cancel = $c('button')
		cancel.innerText = "Cancel"
		cancel.onclick = _ => bg.remove()
		btns.appendChild(cancel)
		btns.appendChild(ok)
		div.appendChild(btns)
		bg.appendChild(div)
		$('body').appendChild(bg)
	},

	'map': {

		'new': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'width': 'number',
					'height': 'number',
					'gridWidth': 'number',
					'gridHeight': 'number',
					'nlayers': 'number',
					'isometric': 'checkbox'
				}
				return Menu.showWindow( conf, Menu.map.new )
			}
			createCanvasMap(...arguments.map(x => parseInt(x)))
		},
	
		'save': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'name': 'text'
				}
				return Menu.showWindow( conf, Menu.map.save )
			}
			save( arguments[0] )
		},
		
		'load': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'file': 'file'
				}
				return Menu.showWindow( conf, Menu.map.load )
			}
			load(arguments.shift())
		},
	
		'export': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'name': 'text'
				}
				return Menu.showWindow( conf, Menu.map.export )
			}
			exportPNG(arguments[0])
		},
		
		'expand': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'top': 'number',
					'bottom': 'number',
					'left': 'number',
					'right': 'number'
				}
				return Menu.showWindow( conf, Menu.map.expand )
			}
			map.expand(...arguments.map(x => parseInt(x)))
			map.show(c)
		},

		'shrink': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'top': 'number',
					'bottom': 'number',
					'left': 'number',
					'right': 'number'
				}
				return Menu.showWindow( conf, Menu.map.shrink )
			}
			map.shrink(...arguments.map(x => parseInt(x)))
			map.show(c)
		}		

	},
	
	'texture': {
	
		'load': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'image': 'file',
					'tileRealWidth': 'number',
					'tileRealHeight': 'number',
					'border': 'number',
					'tileWidth': 'number',
					'tileHeight': 'number',
					'bottomOffset': 'number'
				}
				return Menu.showWindow( conf, Menu.texture.load )
			}
			createTexturePalette(arguments.shift(), arguments.shift(), ...arguments.map(x => parseInt(x)))
		}
		
	},
	
	'brushes': {
	
		'custom': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'tileWidth': 'number',
					'tileHeight': 'number',
					'htile': 'number',
					'vtile': 'number'
				}
				return Menu.showWindow( conf, Menu.brushes.custom )
			}
			createNewCustomBrush(...arguments.map(x => parseInt(x)))
		},
		
		'random': (arguments = null) => {
			if( !arguments ){
				const conf = {
					'tileWidth': 'number',
					'tileHeight': 'number',
					'htile': 'number'
				}
				return Menu.showWindow( conf, Menu.brushes.random )
			}
			createNewRandomBrush(...arguments.map(x => parseInt(x)))
		}
	}
	
}
