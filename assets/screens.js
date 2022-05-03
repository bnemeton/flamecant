
// enter : function()
// exit : function()
// render : function(display)
// handleInput : function(inputType, inputData)

Game.Screen = {};

var fg = ROT.Color.toRGB([
    200,
    50,
    50
]);
var bg = ROT.Color.toRGB([
    0,
    0,
    0
]);
var fireColor = "%c{" + fg + "}%b{" + bg + "}";

fg = ROT.Color.toRGB([
    200,
    200,
    200
]);

var ashColor = "%c{" + fg + "}%b{" + bg + "}"

//start screen
Game.Screen.startScreen = {
    enter: function() {console.log('entered start screen...')},
    exit: function() {console.log('exited start screen.')},
    render: function(displays) {
        displays.main.drawText(32, 6, fireColor + "~ ^ ~ FLAMECANT ~ ^ ~");
        displays.main.drawText(32, 8, ashColor + "press [enter] to start");
        displays.main.drawText(22, 12, ashColor + `
                                            go to /help.html for basic instructions,
                                            & a reference of commands!
                                            
                                            an actual page with both the game & instructions
                                            & commands coming soon, along with actual basic 
                                            QoL features!
                                            `)
        displays.text.drawText(0, 0, ashColor + `
        You were perhaps a scholar--in one way or another you came upon the knowledge that in a certain place, a community of disciples of fire magic had long ago gathered together to pool their discoveries and attain deeper mystical understanding of fire. This community they founded, this cenobium of fire, sought ever-deeper the mysteries of the flame. But that was long ago, and their existence is known but to a few--most of these stay away, but you have felt in your heart the pull, the draw, of the fire--in the terms of the cenobium's own mysteries, you are a moth--and like a moth, you have been drawn in... You descended into the caves leading to the cloistered community, but the path ahead is less certain. 
        
        Message log will appear here.`)
    },
    handleInput: function(inputType, inputData) {
        // when [enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}

// option window
class OptionWindow {
    constructor(props) {
        this.index = props.index
        this.item = props.item
        this.options = props.options
        this.label = props.label
        this.indent = (Game._screenWidth/3)-12
        this.top = (Game._screenHeight/2)-12
    }

    setup(player) {
        this.player = player;
        console.log(`window should be labeled ${this.label}`)
    }

    okFunction(option) {
        switch(option){
            case 'eat':
                console.log(`trying to eat the ${this.item.name}`)
                this.item.eat(this.index);
                break;
            case 'use':
                this.item.use(this.index);
                break;
            // case examine:
            //     this.item.examine();
            //     break;
            case 'drop':
                this.item.drop(this.index);
                break;
            case 'study':
                this.item.study(this.index);
                break;
        }
        Game.Screen.playScreen.setSubScreen(null);
        return true;
    }

    render(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(this.indent, this.top, this.item.text)
        var row = 1;
        display.drawText(this.indent, this.top+row+1, this.label);
        row += 2
        for (var i = 0; i < this.options.length; i++) {
            // If we have an option, we want to render it.
            if (this.options[i]) {
                // Get the letter matching the option's index
                var letter = letters.substring(i, i + 1);
                // Render at the correct row and add 2.
                display.drawText(this.indent, this.top + 2 + row, letter + ' - ' + this.options[i]);
                row++;
            }
        }
        display.drawText(this.indent  + 6, this.top + 4+row, `[esc] - back`)
    }

    setGameEnded(gameEnded) {
        this._gameEnded = gameEnded;
    }

    handleInput(inputType, inputData) {
        // console.log('should be awaiting subscreen input...') // but it never hits any of the below ifs? but you can hit this console log again by hitting a key again
        console.log(`input data: ${inputData.keyCode}`)
        // console.log(`input type: ${inputType}`)
        if (inputType === 'keydown') {
            // If the user hit escape, hit enter and can't select an item, or hit
            // enter without any items selected, simply cancel out
            if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
                    console.log('returning to menu')
                    Game.Screen.inventoryScreen.setup(this.player, this.player.getBag())
                    Game.Screen.playScreen.setSubScreen(Game.Screen.inventoryScreen);
                    Game.refresh(); // is this necessary?
            // } else if (inputData.keyCode === ROT.KEYS.VK_RETURN) { // if they press return with an item selected
            //     console.log('should exit the subscreen...') //never hit this... let's check the keycode?
            //     this.okFunction();
            // Handle pressing a letter if we can select 
            } else {
                // console.log('trying to use something....????')
                let optionIndex;
                switch(inputData.keyCode) {
                    case ROT.KEYS.VK_A:
                        optionIndex = 0;
                        break;
                    case ROT.KEYS.VK_B:
                        optionIndex = 1;
                        break;
                    case ROT.KEYS.VK_C:
                        optionIndex = 2;
                        break;
                    case ROT.KEYS.VK_D:
                        optionIndex = 3;
                        break;
                    case ROT.KEYS.VK_E:
                        optionIndex = 4;
                        break;
                    case ROT.KEYS.VK_F:
                        optionIndex = 5;
                        break;
                    case ROT.KEYS.VK_G:
                        optionIndex = 6;
                        break;
                }
                if (this.options[optionIndex]) {
                    this.okFunction(this.options[optionIndex]);
                }
            }
        }
    }
}

//itemlist screen
class ItemListScreen {
    constructor(type) {
        this.label = type.label;
        this.okFunction = type.okFunction;
        this.selectable = type.selectable;
        this.multiselect = type.multiselect;
        this.indent = (Game._screenWidth/2) - 16;
        this.top = (Game._screenHeight/2) - 9;
    }

    setup(player, items) {
        if (items.length === 0) {
            Game.setSubScreen(null);
        }
        this.player = player;
        this.items = items;
        this.selectedIndices = [];
        // console.log(`here are the selected indices (should be none):`)
        // console.log(this.selectedIndices)
        // console.log(`window should be labeled ${this.label}`)
    }

    executeOkFunction(item, index) { //leaving these here in case i want them later
        // gather selected items
        // console.log('here are the selected indices:')
        // console.log(this.selectedIndices)
        var selectedItems = [];
        this.selectedIndices.forEach(entry => selectedItems.push(this.items[entry]));
        // console.log('Here are the selected items:')
        // console.log(selectedItems) // always the top item in the inventory screen, regardless of the input, despite the previous console log giving the correct index. why is it the top one, rather than all of them or something?
        // //return to playscreen
        // Game.Screen.playScreen.setSubScreen(null);
        // Call the OK function and end the player's turn if it return true.
        if (this.okFunction(selectedItems, this.selectedIndices)) {
            this.player.getMap().getEngine().unlock();
            Game.Screen.playScreen.setSubScreen(null);
        }
    }

    handleInput(inputType, inputData) {
        // console.log('should be awaiting subscreen input...') // but it never hits any of the below ifs? but you can hit this console log again by hitting a key again
        // console.log(`input keycode: ${inputData.keyCode}`)
        // console.log(`input type: ${inputType}`)
        if (inputType === 'keydown') {
            // If the user hit escape, hit enter and can't select an item, or hit
            // enter without any items selected, simply cancel out
            if (inputData.keyCode === ROT.KEYS.VK_ESCAPE || 
                (inputData.keyCode === ROT.KEYS.VK_RETURN && 
                (!this.selectable || this.selectedIndices.length === 0))) {
                    // console.log('setting subscreen to null')
                    Game.Screen.playScreen.setSubScreen(null);
                    Game.refresh(); // is this necessary?
            } else if (inputData.keyCode === ROT.KEYS.VK_RETURN) { // if they press return with an item selected
                // console.log('should exit the subscreen...') //never hit this... let's check the keycode?
                this.executeOkFunction();
            // Handle pressing a letter if we can select 
            } else if (this.selectable && inputData.keyCode >= ROT.KEYS.VK_A &&
                inputData.keyCode <= ROT.KEYS.VK_Z) {
                // Check if it maps to a valid item by subtracting 'a' from the character
                // to know what letter of the alphabet we used.
                var index = inputData.keyCode - ROT.KEYS.VK_A;
                console.log(`this is the index: ${index}`) //this is correct, but the actual update onscreen is always for the first item?
                if (this.items[index]) {
                    // If multiple selection is allowed, toggle the selection status, else
                    // select the item and exit the screen
                    if (this.multiselect) {
                        // console.log('multiselect enabled...')
                        if (this.selectedIndices.includes(index)) {
                            this.selectedIndices.forEach(entry => {
                                if (entry === index) {
                                this.selectedIndices.splice(this.selectedIndices.indexOf(entry), 1)
                            }
                        })
                        } else {
                            this.selectedIndices.push(index)
                        }
                        // Redraw screen
                        Game.refresh();
                    } else {
                        this.selectedIndices.push(index)
                        this.executeOkFunction(this.items[index], index);
                    }
                }
            }
        }
    }

    render(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(this.indent, this.top, this.label);
        var row = 0;
        for (var i = 0; i < this.items.length; i++) {
            // If we have an item, we want to render it.
            if (this.items[i]) {
                // Get the letter matching the item's index
                var letter = letters.substring(i, i + 1);
                // If we have selected an item, show a +, else show a dash between
                // the letter and the item's name.
                var selectionState = (this.selectable && this.multiselect &&
                    this.selectedIndices.includes(i)) ? '+' : '-';
                // Render at the correct row and add 2.
                display.drawText(this.indent, this.top + 2 + row, letter + ' ' + selectionState + ' ' + this.items[i].name);
                row++;
            }
        }
    }
}

//inventory screen
Game.Screen.inventoryScreen = new ItemListScreen({
    label: "~ inventory ~",
    multiselect: false,
    selectable: true,
    okFunction: function(selectedItems, selectedIndices) {
        var item = selectedItems[0];
        console.log(`attempting to use a(n) ${item.name}`)
        var window = new OptionWindow({
            index: selectedIndices[0],
            item: item,
            options: item.options,
            label: `What do you want to do with this ${item.name}?`
        })
        window.setup(this.player)
        Game.Screen.playScreen.setSubScreen(window);
        Game.refresh();
    }
})

//pickup screen
Game.Screen.pickupScreen = new ItemListScreen({
    label: "which items do you want to pick up?",
    multiselect: true,
    selectable: true,
    okFunction: function(selectedItems, selectedIndices) {
        // Try to pick up all items, messaging the player if they couldn't all be picked up.
        if (!this.player.pickupItems(selectedIndices)) {
            Game.message("Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
})

// //drop screen
// Game.Screen.dropScreen = new ItemListScreen({
//     label: "which item do you want to drop?",
//     multiselect: false,
//     selectable: true,
//     okFunction: function(selectedItems) {
//         // Drop the selected item
//         this.player.dropItem(Object.keys(selectedItems)[0]);
//         return true;
//     }
// })



//play screen
Game.Screen.playScreen = {
    map: null,
    _player: null,
    subScreen: null,
    _gameEnded: false,
    topLeftX: NaN,
    topLeftY: NaN,
    visibleCells: {},
    setSubScreen: function(subScreen) {
        this.subScreen = subScreen;
        Game.refresh()
    },
    enter: function() {
        // console.log("entering play screen..."); 
        // var map = []; //old map array
        var width = 128;
        var height = 64;
        var depth = 5;
        //create map from tiles and player
        var tiles = new Builder(width, height, depth).getTiles();
        this._player = new Player();
        this._map = new Map(tiles, this._player);
        this._map.getEngine().start();
    },
    exit: function() { console.log("Exited play screen."); },
    //move screen/camera/thing
    move: function(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;

        // Try to move to the new cell
        this._player.tryMove(newX, newY, newZ, this._map);
    },
    // exit: function() {console.log("exited play screen."); },
    render: function(displays) {
        if (this.subScreen) {
            this.subScreen.render(displays.main);
            return;
        }
        // console.log('rendering screen!')
        var screenWidth = (Game.getScreenWidth());
        var screenHeight = Game.getScreenHeight();
        // console.log('got screen dimensions!')
        // Make sure the x-axis doesn't go to the left of the left bound
        this.topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
        // Make sure we still have enough space to fit an entire game screen
        this.topLeftX = Math.min(this.topLeftX, this._map.getWidth() - screenWidth);
        // Make sure the y-axis doesn't above the top bound
        this.topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
        // Make sure we still have enough space to fit an entire game screen
        this.topLeftY = Math.min(this.topLeftY, this._map.getHeight() - screenHeight);

        //track which cells are visible
        var visibleCells = this.visibleCells;
        //find them and add to object
        // console.log(this._player.getZ())
        // console.log(this._map.getFOV(this._player.getZ())) //undefined...? no now it's not but it isn't working right. no it's undefined again
        var map = this._map;
        var currentDepth = this._player.getZ()
        this._map.getFOV(currentDepth).compute(
            this._player.getX(), this._player.getY(),
            this._player.getSightRadius(),
            function(x, y, radius, visbility) {
                visibleCells[`${x},${y}`] = true;
                // Mark cell as explored
                map.setExplored(x, y, currentDepth, true);
            });
        this.visibleCells = visibleCells;
        // console.log(visibleCells);

        // Iterate through all visible map cells
        // console.log('beginning tile render for loop!')
        // for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
        //     for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
        //         if (visibleCells[`${x},${y}`]) {
        //             // Fetch the glyph for the tile and render it to the screen at the offset position.
        //             var tile = this._map.getTile(x, y, this._player.getZ());
        //             // console.log(tile); //do not do this
        //             display.draw(
        //                 x - topLeftX,
        //                 y - topLeftY,
        //                 tile.getChar(), 
        //                 tile.getForeground(), 
        //                 tile.getBackground());
        //             }
        //     }
        // }

          // Render the explored map cells
        for (var x = this.topLeftX; x < this.topLeftX + screenWidth; x++) {
            for (var y = this.topLeftY; y < this.topLeftY + screenHeight; y++) {
                if (this._map.isExplored(x, y, currentDepth)) {
                    // Fetch the glyph for the tile and render it to the screen
                    // at the offset position.
                    var glyph = this._map.getTile(x, y, currentDepth);
                    var foreground = glyph.getForeground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first, since we want to draw entities
                        // over items.
                        var items = this._map.getItemsAt(x, y, currentDepth);
                        // If we have items, we want to render the top most item
                        // console.log(items)
                        if (items.length > 0) {
                            // console.log('there should be visible items...')
                            glyph = items[items.length - 1];
                            // console.log(`here's the ${glyph.name}'s foreground color: ${glyph._foreground}`)
                        }
                        // Check if we have an entity at the position
                        if (this._map.getEntityAt(x, y, currentDepth)) {
                            glyph = map.getEntityAt(x, y, currentDepth);
                        }
                        // Update the foreground color in case our glyph changed
                        // console.log(`here's the glyph's foreground: ${glyph._foreground}`) // getForeground() ""not a function""
                        foreground = glyph.getForeground(); //not a function...?
                    } else {
                        // Since the tile was previously explored but is not 
                        // visible, we want to change the foreground color to
                        // dark gray.
                        foreground = 'darkslategrey';
                    }
                    displays.main.draw(
                        x - this.topLeftX,
                        y - this.topLeftY,
                        glyph.getChar(), 
                        foreground, 
                        glyph.getBackground());
                }
            }
        }

         // Render the entities
        //  console.log('rendering entities!')
        //  var entities = this._map.getEntities();
        //  for (var key in entities) {
        //      var entity = entities[key];
        //      //render them if on screen
        //      if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
        //         entity.getX() < topLeftX + screenWidth &&
        //         entity.getY() < topLeftY + screenHeight && 
        //         entity.getZ() == this._player.getZ()) {
        //             if (visibleCells[`${entity.getX()},${entity.getY()}`]) {
        //                 console.log(`drawing a ${entity.name} at ${entity.getX() - topLeftX}, ${entity.getY() - topLeftY} `)
        //                 display.draw(
        //                     entity.getX() - topLeftX, 
        //                     entity.getY() - topLeftY,    
        //                     entity.getChar(), 
        //                     entity.getForeground(), 
        //                     entity.getBackground()
        //                 )
        //         };
        //     }
        //  }
         //render messages and stat bar
         var stats = `%c{white}%b{black} HP: ${this._player.getHp()} / ${this._player.getMaxHp()}   GLYPHS: ${this._player.glyphs}   ATK: ${this._player.damage}   ARMOR: ${this._player.armor}`
         displays.main.drawText(0, screenHeight, stats)
         let messages = Game.messages;
         let messageHeight = 0;
         for (let i=0; i < messages.length; i++) {
             //draw each message, adding its line count to height
             messageHeight += displays.text.drawText(
                0,
                 messageHeight,
                 '%c{white}%b{black}' + messages[i]
             );
         }
        if (messageHeight >= screenHeight+8) {
            messages.shift();
            Game.messages.shift();
            Game.refresh();
        }
    },
    handleInput: function(inputType, inputData) {
        if (this._map.getEngine()._lock === 1) {   
            if (this._gameEnded) {
                if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                    Game.switchScreen(Game.Screen.loseScreen);
                }
                // Return to make sure the user can't still play
                return;
            }
            //let subscreen handle input if there is one
            if (this.subScreen) {
                this.subScreen.handleInput(inputType, inputData);
                return;
            }    
            if (inputType === 'mousemove') {
                //reposition the tooltip
                // console.log(inputData) //position is indeed stored in x and y; why isn't this working?
                let x = inputData.x;
                let y = inputData.y;
                // console.log(`mouse at ${x}, ${y}`) //these work correctly
                let toolTip = document.getElementById('tooltip');

                toolTip.style.top = y-20 + 'px';
                toolTip.style.left = x+15 + 'px';

                //set these values to be easier to access
                var mouseCoords = Game._display.eventToPosition(inputData);
                var actualX = mouseCoords[0]+this.topLeftX;
                var actualY = mouseCoords[1]+this.topLeftY;
                
                // console.log(mouseCoords);
                // Game.message(`mouse coordinates: ${mouseCoords}`)
                // let splitCoords = mouseCoords.split(','); //whoops duh mouseCoords actually an array lmao
                let currentDepth = this._player.getZ();
                let text ='';
                // if(this._map.isExplored(mouseCoords[0],mouseCoords[1],currentDepth)) { //checking visible is better imo
                //     text = this._map.getTile(mouseCoords[0]+this.topLeftX,mouseCoords[1]+this.topLeftY,currentDepth).text
                // }
                // console.log(this.visibleCells);
                // console.log(`the tooltip text condition should be:`)
                // console.log(this.visibleCells[`${mouseCoords[0],mouseCoords[1]}`]) //returns undefined

                if (this.visibleCells[`${actualX},${actualY}`]) {
                    text = this._map.getTile(actualX,actualY,currentDepth).text;
                   
                    if (this._map.getEntityAt(actualX,actualY,currentDepth)) {
                        text = `There is a ${this._map.getEntityAt(actualX,actualY, currentDepth).name} here.`

                        if (this._map.getEntityAt(actualX,actualY, currentDepth).name === 'branded') {
                            text += ` It's you.`
                        }
                    }
                    
                    items = this._map.getItemsAt(actualX,actualY,currentDepth);

                    if (items.length >0) {
                        if (items.length === 1) {
                            text += ` There is also a(n) ${items[0].name} here.`
                        } else {
                            text += ` There are also some items here.`
                        }
                    }

                }

                let toolTipText = text
                // let toolTip = document.getElementById('tooltip'); //now this is declared up in repositioning
                toolTip.innerHTML = toolTipText;
                // toolTip.classList.add("tooltiptext")


                // inputData.target.appendChild(toolTip)

                Game.refresh();
            }    
            if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            //numpad 8-dir movement
            // console.log(inputData);
            switch (inputData.keyCode) {
                case ROT.KEYS.VK_RETURN:
                    Game.switchScreen(Game.Screen.winScreen);
                    break;
                case ROT.KEYS.VK_ESCAPE:
                    Game.switchScreen(Game.Screen.loseScreen);
                    break;
                case ROT.KEYS.VK_NUMPAD5:
                    //stay put for one turn
                    this.move(0, 0, 0);
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD8:
                    this.move(0,-1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD9:
                    this.move(1, -1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD6:
                    this.move(1, 0, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD3:
                    this.move(1, 1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD2:
                    this.move(0, 1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD1:
                    this.move(-1, 1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD4:
                    this.move(-1, 0, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_NUMPAD7:
                    this.move(-1, -1, 0); //move
                    //refresh screen
                    // Game.refresh();
                    // Unlock the engine
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_COMMA:
                    this.move(0, 0, 1);
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_PERIOD:
                    this.move(0, 0, -1);
                    this._map.getEngine().unlock();
                    break;
                case ROT.KEYS.VK_I:
                    console.log('inventory button hit')
                    if (this._player.getBag().length === 0) {
                        // If the player has no items, send a message and don't take a turn
                        Game.message("You are not carrying anything.");
                        Game.refresh();
                    } else {
                        // Show the inventory
                        Game.Screen.inventoryScreen.setup(this._player, this._player.getBag());
                        this.setSubScreen(Game.Screen.inventoryScreen);
                    }
                    break;
                // case ROT.KEYS.VK_D:
                //     if (this._player.getBag().filter(function(x){return x;}).length === 0) {
                //         // If the player has no items, send a message and don't take a turn
                //         Game.message("You have nothing to drop.");
                //         Game.refresh();
                //     } else {
                //         // Show the drop screen
                //         Game.Screen.dropScreen.setup(this._player, this._player.getBag());
                //         this.setSubScreen(Game.Screen.dropScreen); // this isn't happening, but doesn't throw an error?
                //     }
                //     break;
                case ROT.KEYS.VK_P:
                    console.log('pickup button hit')
                    var items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
                    // If there are no items, show a message
                    if (items.length === 0) {
                        // console.log('really should not have to check this......') //and i was right. so why isn't the below message happening??? it was not refreshing after, haha
                        Game.message("There is nothing here to pick up.");
                        Game.refresh(); //needed to add this, 
                    } else if (items.length === 1) {
                        // If only one item, try to pick it up
                        var item = items[0];
                        if (this._player.pickupItems([0])) {
                            Game.message(`You pick up the ${item.name}.`);
                            Game.refresh();
                        } else {
                            Game.message("Your inventory is full! Nothing was picked up.");
                            Game.refresh();
                        }
                    } else {
                        // Show the pickup screen if there are any items
                        Game.Screen.pickupScreen.setup(this._player, items);
                        this.setSubScreen(Game.Screen.pickupScreen);
                    }
                    break;
                    
            }
        }    
    }}
}

//win screen
Game.Screen.winScreen = {
    enter: function() {console.log("entering win screen..."); },
    exit: function() { console.log("exited win screen."); },
    render: function(displays) {
        // Render our prompt to the screen
        for (var i = 0; i < 19; i++) {
            // Generate random background colors
            var r = i*50;
            var g = i*15;
            var b = i*5;
            var background = ROT.Color.toRGB([r, g, b]);
            var fg = ROT.Color.toRGB ([
                255-(i*20),
                255-(i*20),
                255-(i*20)
            ])
            displays.main.drawText(5*i, 2*i, "%c{" + fg + "}%b{" + background + "}T R I U M P H   O F   F L A M E !");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}

//lose screen
Game.Screen.loseScreen = {
    enter: function() {console.log("entering lose screen..."); },
    exit: function() { console.log("exited lose screen."); },
    render: function(displays) {
        // Render our prompt to the screen
        for (var i = 0; i < 35; i++) {
            let r = 225 - (6*i);
            let g = 200 - (7*i);
            let b = 250 - (12*i);
            let color = ROT.Color.toRGB([
                r, g, b
            ])
            let mod = (Math.floor(Math.random()*23)-(Math.floor(Math.random()*23)))
            displays.main.drawText(50 + mod, i + 1, `%c{${color}}the flame goes out...`);
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}