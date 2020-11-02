let	lastPos,
	deltaPos,
	elementToScroll,
	lButtonDown = false,
	rButtonDown = false
	
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

$('body').addEventListener('mousedown', e => {
    if(e.button == 2){
        e.preventDefault();
        lastPos = {x: e.clientX, y: e.clientY}
        rButtonDown = true
    }
})

$('body').addEventListener('mouseup', e => {
    if(e.button == 2){
        e.preventDefault();
        rButtonDown = false
        elementToScroll = null
    }
})

$('body').addEventListener('mousemove', e => {
    if(rButtonDown){
        deltaPos = {
            x: lastPos.x - e.clientX, y: lastPos.y - e.clientY
        }
        lastPos = {x: e.clientX, y: e.clientY}
        if(!elementToScroll){
            let path = e.path || e.composedPath()
            path = path.filter(el => ["canvasarea", "toolbar"].includes(el.id))
            elementToScroll = path[0]
        }
        elementToScroll.scrollBy(deltaPos.x, deltaPos.y)
    }
})

$('body').addEventListener('contextmenu', e => {
    e.preventDefault();
})

$('body').addEventListener('keydown', e => {
    if(e.target.tagName.toUpperCase() == 'INPUT' || !map)
        return
    switch(e.keyCode){
        case 66 : // B - paint Bucket
            selectTool('bucket')
            break;
        case 68 : // D - eye Dropper
            selectTool('drop')
            break;
        case 69 : // E - Eraser
            selectTool('eraser')
            break;
        case 80 : // P - pencil
            selectTool('pencil')
            break;
        case 90 :
            if(e.ctrlKey)
                console.log('undo')
    }
})
