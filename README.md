# Tile Editor

A 2D tile editor that runs on the browser.

![screenshot](https://img.youtube.com/vi/L2loTeaPBJY/maxresdefault.jpg)

Live version [here](https://victorribeiro.com/tileEditor/)  
Alternative link [here](https://victorqribeiro.github.io/tileEditor/)

# About

I made this tool for personal use, but now I'm releasing it under MIT license. You can learn more about this project by watching the videos I made while working on it.

[YouTube playlist](https://www.youtube.com/playlist?list=PL3pnEx5_eGm88UxHH2OlzRRdnj7zT6Cla)

# Menus

## MAP

### New
Create a new map.  
width - Width of the map (grid size)  
height - Height of the map (grid size)  
tileSize - Size of the tile you're using  
border - Border around the tile  
tileSizeDraw - Size you want your tile to be drawn  
nLayers - Number of layers on your map

### Save
Save your map as a json format.  
name - Name of the file

### Load
Load the map you saved before.  
file - JSON file to load  

### Export
Export the map as a PNG image.  
name - Name of the image to be saved  

### Expand
Expand the map size.  
top - How many rows on top to be added  
bottom - How many rows on bottom to be added
left - How many rows on left to be added
right - How many rows on right to be added

### Shrink
Shrink the map size.  
top - How many rows on top to be removed  
bottom - How many rows on bottom to be removed
left - How many rows on left to be removed
right - How many rows on right to be removed

## Texture

### Load
Load an image texture.  
image - The image file with the texture  
tileSize - The tile size of each tile  
border - Is there a border separating each tile?  

## Brushes
Create a new brush.  
custom - Create a custom brush that will be defined by you (selecting from the tiles on the texture)  
random - Create a random brush that will be defined by you (selecting from the tiles on the texture)  

## Buttons
layers - Add or remove a layer  
E - Erase brush (erase a tile from the map)  
B - Paint bucket tool (paint a whole region on the map)  


# Disclaimer

I'm releasing this tool as it is cause I don't have time right now to work on it. There's still a lot of things that I would love to implement and improve, but that will have to wait.
