# flamecant
a simple roguelike game in rot-js, just for fun.

## premise
> You were perhaps a scholar--in one way or another you came upon the knowledge that in a certain place, a community of disciples of fire magic had long ago gathered together to pool their discoveries and attain deeper mystical understanding of fire. This community they founded, this cenobium of fire, sought ever-deeper the mysteries of the flame. But that was long ago, and their existence is known but to a few--most of these stay away, but you have felt in your heart the pull, the draw, of the fire--in the terms of the cenobium's own mysteries, you are a moth--and like a moth, you have been drawn in...

## controls
you can view controls at the help page, reachable at /help.html, but here are the controls:

- enter/return starts the game
- escape backs out of menus
- numpad movement controls (5 = pass one turn, other numbers move you in that direction as if 5 is the center of a compass; remember to turn on numlock)
- comma descends downward stairs <, period ascends upward stairs > (I might have swapped these from their conventional assignments by accident)
- attack an enemy by moving into its space
- p picks up items in your tile (multiple items will cause a pickup menu, letting you select which things to pick up)
- i opens your inventory
- in menus, select an item by hitting the letter key associated with that item; multi-select menus like multi-pickup let you select several and then submit your choices with enter/return

## future plans
i have been thinking of my plans broadly as either short term or long term; focusing on short term for now (of course) with the hope that i stick with this project long enough to get to any of the long term ones.

### short term
- set up the magic system (glyphs, words, brands, tinder, the associated menu screens, etc)
- set up the light system (variable light intensities, seeing tiles illuminated by distant light sources, etc)
- implement temperature/flammability/fire
- implement animated tiles to indicate information like "this tile is on fire"
- implement NPCs, trading, and dialogue
- implement arrow key controls (with diagonals, somehow)
- implement cursor/selector and/or mouse controls for menus
- set up mouse tooltips for checking what something visible on the map is

### long term
- set up the framework for generating and loading zones of levels
- set up either a save file or password system for returning players to start at zones past the first

## technologies
right now this only uses rot.js, a library that facilitates certain aspects of building roguelike games in javascript. it's possible it will include other things in the future though, and i'll update this section as appropriate.
