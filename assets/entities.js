// // Create our Mixins namespace
// Game.Mixins = {};

// // Define our Moveable mixin
// Game.Mixins.Moveable = {
//     name: 'Moveable',
    // tryMove: function(x, y, map) {
    //     var tile = map.getTile(x, y);
    //     // Check if we can walk on the tile
    //     // and if so simply walk onto it
    //     if (tile.isWalkable()) {
    //         // Update the entity's position
    //         this._x = x;
    //         this._y = y;
    //         return true;
    //     // Check if the tile is diggable, and
    //     // if so try to dig it
    //     } else if (tile.isDiggable()) {
    //         map.dig(x, y);
    //         return true;
    //     }
    //     return false;
    // }
// }

// //entities

// // Player template
// Game.PlayerTemplate = {
//     char: '@',
//     fg: 'white',
//     bg: 'black',
//     mixins: [Game.Mixins.Moveable]
// }