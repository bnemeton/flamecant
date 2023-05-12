class Tile extends Glyph{

 constructor(properties) {
    //call glyph constructor!!
    super(properties);
    // console.log(properties);
    this.isWalkable = properties['isWalkable'] || false;
    this.isDiggable = properties['isDiggable'] || false;
    this.isOpaque = properties['isOpaque'] || false;
    
 }
};

class FloorTile extends Tile {
    constructor() {
        super({
            char: '.',
            fg: 'darkslategrey',
            isWalkable: true,
            text: 'This is open floor.'
        });
        // this.char = '.'
        // this.fg = 'darkslategrey';
        // this.isWalkable = true;
    }
}

class WallTile extends Tile {
    constructor() {
        super({
            char: '#',
            fg: 'peachpuff',
            isDiggable: true,
            isOpaque: true,
            text: "This is a wall of solid stone. You can currently dig through these, for some reason."
        });
        // this.isOpaque = true;
        // this.char = '#',
        // this.fg = 'peachpuff',
        // this.isDiggable = true
    }
}

class NullTile extends Tile {
    constructor() {
        super({})
    }
}

class StairDown extends Tile {
    constructor() {
        super({
            char: '>',
            fg: 'white',
            isWalkable: true,
            text: "There is a staircase descending to a lower floor here."
        })
    }
}

class StairUp extends Tile {
    constructor() {
        super({
            char: '<',
            fg: 'white',
            isWalkable: true,
            text: "There is a staircase ascending to an upper floor here."
        })
    }
}

// //getters

// Game.Tile.prototype.isWalkable = function() {
//     return this._isWalkable;
// }
// Game.Tile.prototype.isDiggable = function() {
//     return this._isDiggable;
// }

// Game.Tile.nullTile = new Game.Tile({});
// Game.Tile.floorTile = new Game.Tile({
//     char: '.',
//     isWalkable: true
// // });
// Game.Tile.wallTile = new Game.Tile({
//     char: '#',
//     fg: 'peachpuff',
//     isDiggable: true
// });