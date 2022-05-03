class Map {
    constructor(tiles, player) {
        this._tiles = tiles;
        // cache the width and height based
        // on the length of the dimensions of
        // the tiles array
        this._depth = tiles.length;
        this._width = tiles[0].length;
        this._height = tiles[0][0].length;
        this._explored = new Array(this._depth);
        this.setupExploredArray();
        //object of items on map
        this._items = {};
        //object of entities on map
        this._entities = {};
        //FOVs
        this._fov = [];
        this.setupFOV();
        // console.log(this._fov)
        //engine and scheduler
        this._scheduler = new ROT.Scheduler.Simple();
        this._engine = new ROT.Engine(this._scheduler);
        //add the player
        this.addEntityAtRandomPosition(player, 0);
        //add enemies
        var enemyTypes = [Fungus];
        for (var z=0; z<this._depth; z++){
            for (var i=0; i < 20; i++) {
                var RandomEnemy = enemyTypes[Math.floor(Math.random()*enemyTypes.length)]
                this.addEntityAtRandomPosition(new RandomEnemy(), z);
            }
            // console.log(`spawned 20 enemies on floor ${z}`)
        }
        //add normal items
        var itemTypes = [Food, Pebble];
        for (var z = 0; z <this._depth; z++) {
            for (var i = 0; i < 15; i++) {
                var RandomItem = itemTypes[Math.floor(Math.random()*itemTypes.length)];
                this.addItemAtRandomPosition(new RandomItem(), z);
            }
            // console.log(`spawned 15 items on floor ${z}`)
        }
        //add scraps
        for (var z = 0; z <this._depth; z++) {
            for (var i = 0; i < 5; i++) {
                this.addItemAtRandomPosition(new Scrap(), z);
            }
            // console.log(`spawned 5 scraps on floor ${z}`)
        }

    }
    getItemsAt(x, y, z) {
        // if (this._items[`${x},${y},${z}`]) {
        //     console.log(this._items[`${x},${y},${z}`])
        // }
        if (this._items[`${x},${y},${z}`]) {
            return this._items[`${x},${y},${z}`];
        } else {
            return [];
        }
    }
    setItemsAt(x, y, z, items) {
        var key = `${x},${y},${z}`;
        if (items.length === 0) {
            if (this._items[key]) {
                delete this._items[key];
            } 
        } else {
            this._items[key] = items;
        }
    }
    addItem(x, y, z, item) {
        var key = `${x},${y},${z}`;
        if (this._items[key]) {
            this._items[key].push(item);
        } else {
            this._items[key] = [item];
        }
    }
    addItemAtRandomPosition(item, z) {
        var position = this.getRandomFloorPosition(z);
        this.addItem(position.x, position.y, position.z, item);
    };
    setupFOV() {
        var map = this;
        for (var z = 0; z < this._depth; z++) {
               
            let whatever = function() { 
                var depth = z;
                map._fov.push(
                    new ROT.FOV.PreciseShadowcasting(function(x, y) {
                        // console.log(`tile ${x}, ${y} on floor ${depth} type: ${map.getTile(x, y, z).constructor.name}`) //always returns NullTile for some reason? but the actual shadowcasting works
                        return !map.getTile(x, y, depth).isOpaque;
                    }
                ))
                }
            whatever();
        }
        // console.log(map._fov)
    }
    setupExploredArray() {
        for (var z = 0; z < this._depth; z++) {
            this._explored[z] = new Array(this._width);
            for (var x = 0; x < this._width; x++) {
                this._explored[z][x] = new Array(this._height);
                for (var y = 0; y < this._height; y++) {
                    this._explored[z][x][y] = false;
                }
            }
        }
    }
    setExplored(x, y, z, state) {
        // Only update if the tile is within bounds
        if (!(this.getTile(x, y, z) instanceof NullTile)) {
            this._explored[z][x][y] = state;
        }
    }
    isExplored(x, y, z) {
        // Only return the value if within bounds
        if (!(this.getTile(x, y, z) instanceof NullTile)) {
            return this._explored[z][x][y];
        } else {
            return false;
        }
    };
    getFOV(depth) {
        // console.log(depth);
        return this._fov[depth];
    }
    dig(x, y, z) {
        // If the tile is diggable, update it to a floor
        if (this.getTile(x, y, z).isDiggable) {
            this._tiles[z][x][y] = new FloorTile();
        }
    }
    getRandomFloorPosition(z) {
        // Randomly select a tile which is a floor

        var thisFloorTiles = this._tiles[z];
        // console.log(thisFloorTiles);

        var empties = [];

        for (var x=0; x < thisFloorTiles.length; x++) {
            let column = thisFloorTiles[x];
            for(var y=0; y < column.length; y++) {
                if ((thisFloorTiles[x][y] instanceof FloorTile) && !this.getEntityAt(x, y, z)) {
                    empties.push({
                        x: x,
                        y:y,
                        z: z
                    });
                }
            }
        }

        // console.log(empties);

        var shuffledEmpties = shuffle(empties);
        // console.log(shuffledEmptyTiles);

        var randFloor = shuffledEmpties.pop();
        // console.log(randFloor);

        return {x: randFloor.x, y: randFloor.y, z: randFloor.z};
        // var x; 
        // var y;
        // do {
        //     x = Math.floor(Math.random() * this._width);
        //     y = Math.floor(Math.random() * this._height);
        // } while(!this.isEmptyFloor(x, y, z));
        // return {x: x, y: y, z: z};
    };
    getWidth() {
        return this._width;
    };
    getHeight() {
        return this._height;
    };
    getDepth() {
        return this._depth;
    }
    getTile(x, y, z) {
        // Make sure we are inside the bounds. If we aren't, return
        // null tile.
        if (x < 0 || x >= this._width || y < 0 || y >= this._height || z < 0 ||z >= this._depth) {
            return new NullTile();
        } else {
            // console.log(z);
            return this._tiles[z][x][y];
        }
    }
    getEngine() {
        return this._engine;
    }
    getEntities() {
        return this._entities;
    }
    getEntityAt(x, y, z) {
            // Get the entity based on position key
            if (this._entities[x + ',' + y + ',' + z]) {
                return this._entities[x + ',' + y + ',' + z];
            } else {
                return false;
            }
    }
    updateEntityPosition(entity, oldX, oldY, oldZ) {
        // Delete the old key if it is the same entity and we have old positions.
        // console.log(`attempting to update the position of a ${entity.name}...`)
        if (true) { // maybe figure out what this is supposed to be
            var oldKey = oldX + ',' + oldY + ',' + oldZ;
            if (true) { //this too
                // console.log(`removing old entity position`)
                delete this._entities[oldKey];
            }
        }
        // Make sure the entity's position is within bounds
        if (entity.getX() < 0 || entity.getX() >= this._width ||
            entity.getY() < 0 || entity.getY() >= this._height ||
            entity.getZ() < 0 || entity.getZ() >= this._depth) {
            console.log("!! Entity's position is out of bounds !!");
        }
        // Sanity check to make sure there is no entity at the new position.
        var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
        if (this._entities[key]) {
            console.log('!! Tried to add an entity at an occupied position !!');
        }
        // Add the entity to the table of entities
        // console.log('adding entity at new position')
        this._entities[key] = entity;
    };
    getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
        let results = [];
        // Determine our bounds
        var leftX = centerX - radius;
        var rightX = centerX + radius;
        var topY = centerY - radius;
        var bottomY = centerY + radius;
        let counted = 0;
        // Iterate through our entities, adding any which are within the bounds
        for (var key in this._entities) {
            // console.log(entity) // what exactly is this iterating over? oh it's the key. but that wasn't working before either...
            let entity = this._entities[key]
            // console.log(`checking the ${entity.name} at ${entity.getX()}, ${entity.getY()}`) //ugh this prints fine
            // console.log(entity) // let's try this again... // this is printing entities appropriately. so why isn't the following ever pushing anyone to results?

            // if (entity.getX() >= leftX && entity.getX() <= rightX) { //as suspected, this is never "true"... // even if i switch from getters to the props as if that would matter
            //     console.log(`there's a ${entity.name} in the right columns...`)
            //     if (entity.getY() >= topY && entity.getY() <= bottomY) {
            //         console.log(`there's an ${entity.name} in the right rows...`)
            //         if (entity.getZ() === centerZ) {
            //             console.log('ding ding ding! it is on the correct floor! push that baby to the results array!!!')
            //             results.push(entity)
            //         }
            //     }
            // }

            if (entity.getX() >= leftX && entity.getX() <= rightX && //entity.getX() isn't a function...? // bc entity was the key, addressed that
            entity.getY() >= topY && entity.getY() <= bottomY &&
            entity.getZ() === centerZ) {
                console.log(entity.name+' detected!') // never fires???
                results.push(entity);
            }
            counted++
        }
        console.log(`${counted} entities counted, ${results.length} results!`) // counted increases as fungi spawn, but results.length is always zero. aaaaaaa
        // console.log(results) // always empty array... even though things *are* getting stored in the _entities object and can be retrieved just fine. baffling.
        return results;
    }
    addEntity(entity) {
        // Update the entity's map
        entity.setMap(this);
        // Update the map with the entity's position
        this.updateEntityPosition(entity);
        // Check if this entity is an actor, and if so add
        // them to the scheduler
        if (entity.actor) {
           this._scheduler.add(entity, true);
        }
    }
    addEntityAtRandomPosition(entity, z) {
        var position = this.getRandomFloorPosition(z);
        entity.setX(position.x);
        entity.setY(position.y);
        entity.setZ(position.z)
        this.addEntity(entity);
    }
    removeEntity(entity) {
        // Remove the entity from the map
        var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
        // console.log(`attempting to remove a ${this._entities[key].name}`)
        if (this._entities[key] == entity) {
            // console.log(`removing a ${this._entities[key].name}`)
            delete this._entities[key];
            
        }
        // If the entity is an actor, remove them from the scheduler
        if (entity.actor) {
            this._scheduler.remove(entity);
        }
    }
    // removeEntity(entity) {
    //     //find entity in the array if it exists
    //     for (var i=0; i < this._entities.length; i++) {
    //         if (this._entities[i] == entity) {
    //             this._entities.splice(i, 1);
    //             break;
    //         }
    //     }
    //     //remove them from scheduler if they are an actor
    //     if (entity.actor) {
    //         this._scheduler.remove(entity);
    //     }
    // }
    isEmptyFloor(x, y, z) {
        return (this.getTile(x, y, z) instanceof FloorTile) && !this.getEntityAt(x, y, z);
    }

};
//dig??
// Game.Map.prototype.dig = function(x, y) {
//     // If the tile is diggable, update it to a floor
//     if (this.getTile(x, y).isDiggable()) {
//         this._tiles[x][y] = Game.Tile.floorTile;
//     }
// }

//random floor tile
// Game.Map.prototype.getRandomFloorPosition = function() {
//     // Randomly generate a tile which is a floor
//     var x, y;
//     do {
//         x = Math.floor(Math.random() * this._width);
//         y = Math.floor(Math.random() * this._width);
//     } while(this.getTile(x, y) != Game.Tile.floorTile);
//     return {x: x, y: y};
// }

// // Standard getters
// // Game.Map.prototype.getWidth = function() {
// //     return this._width;
// // };
// Game.Map.prototype.getHeight = function() {
//     return this._height;
// };

// Gets the tile for a given coordinate set
// Game.Map.prototype.getTile = function(x, y) {
//     // Make sure we are inside the bounds. If we aren't, return
//     // null tile.
//     if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
//         return Game.Tile.nullTile;
//     } else {
//         return this._tiles[x][y] || Game.Tile.nullTile;
//     }
// };