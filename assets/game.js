// //import rot.js
// const ROT = import('../libraries/rot.min.js')


//everything goes here!

function shuffle(array) {
    var currentIndex = array.length, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
    
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
    array[randomIndex], array[currentIndex]];
    }
    
    return array;
    }

//game object
var Game =  {
    _display: null,
    _textDisplay: null,
    _currentScreen: null,
    _screenWidth: 96,
    _screenHeight: 30,
    messages: [],
    init: function() {
        // Any necessary initialization will go here.
        this._display = new ROT.Display({width: this._screenWidth, height: this._screenHeight + 1, fontSize: 20});
        this._textDisplay = new ROT.Display({width: 32, height: this._screenHeight+8, fontSize: 16})

        // Create a helper function for binding to an event
        // and making it send it to the screen
        var game = this; // So that we don't lose this
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the
                // screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard input events
        bindEventToScreen('keydown');
        // bindEventToScreen('keyup');
        bindEventToScreen('keypress');
        bindEventToScreen('mousemove');
    },
    refresh: function() {
        //clear the screen
        this._display.clear();
        this._textDisplay.clear();
        //re-render
        this._currentScreen.render({
            main: this._display,
            text: this._textDisplay
        });
    },
    getDisplay: function() {
        return this._display;
    },
    getTextDisplay: function() {
        return this._textDisplay;
    },
    getScreenWidth: function() {
        return this._screenWidth;
    },
    getScreenHeight: function() {
        return this._screenHeight;
    },
    message: function(message, args) {
        this.messages.push(message);

    },
    getNeighborPositions: function(x, y) {
        var tiles = [];
        // Generate all possible offsets
        for (var dX = -1; dX < 2; dX ++) {
            for (var dY = -1; dY < 2; dY++) {
                // Make sure it isn't the same tile
                if (dX == 0 && dY == 0) {
                    continue;
                }
                tiles.push({x: x + dX, y: y + dY});
            }
        }
        return shuffle(tiles);
    },
    switchScreen: function(screen) {
        //notify prev screen we left
        if (this._currentScreen !== null) {
            this._currentScreen.exit();
        }

        //clear display
        this.getDisplay().clear();

        //update the current screen, enter() it and render() it
        this._currentScreen = screen;
        // console.log(this._currentScreen)
        if (!this._currentScreen !== null) {
            this._currentScreen.enter();
            //refresh the screen
            this.refresh();
        }
    }
}
//onload
window.onload = function() {
    //initialize the game
    Game.init();
    //add the container to the page
    let mapContainer = document.getElementById('mapContainer')
    mapContainer.appendChild(Game.getDisplay().getContainer())
    mapContainer.appendChild(Game.getTextDisplay().getContainer())
    //load start screen
    Game.switchScreen(Game.Screen.startScreen)
}
