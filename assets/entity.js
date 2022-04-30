class Entity extends Glyph{
    constructor(properties) {
        properties = properties || {};
        super(properties);
        // Instantiate any properties from the passed object
        this.name = properties['name'] || '';
        this._x = properties['x'] || 0;
        this._y = properties['y'] || 0;
        this._z = properties['z'] || 0;
        this._map = null;
        this.actor = properties['actor'] || false;
        this.canDig = properties['canDig'] || false;
        this.sight = properties['sight'] || 3;
        // this.setX = function(x) {
        //     this._x = x;
        this.bagSlots = properties['bagSlots'] || 10;
        this.bag = new Array(this.bagSlots);
    }

    //methods ffs

    getBag() {
        return this.bag;
    }
    getItemFromBag(index) {
        return this.bag[index];
    }
    giveItem(item) {
        for (var i = 0; i < this.bag.length; i++) {
            if (!this.bag[i]) {
                this.bag[i] = item;
                return true;
            }
        }
        return false;
    }
    removeItem(index) {
        this.bag[index] = null;
    }
    hasFreeBagSlot() {
        for (var i = 0; i < this.bag.length; i++) {
            if (!this.bag[i]) {
                return true;
            }
        }
        return false;
    }
    pickupItems(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the 
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.giveItem(mapItems[indices[i]  - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    }
    dropItem(index) {
        // Drops an item to the current map tile
        if (this.bag[index]) {
            if (this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getZ(), this.bag[index]);
            }
            Game.message(`You put down the ${this.bag[index].name}.`)  
            this.removeItem(index);    
        }
        //no such item in bag??
        console.log(`${index} has no item in this bag, apparently`)
    }

    getSightRadius() {
        return this.sight;
    }
    setName(name) {
            this._name = name;
        }
    setPosition(x, y, z) {
        var oldX = this._x;
        var oldY = this._y;
        var oldZ = this._z;
        // Update position
        this._x = x;
        this._y = y;
        this._z = z;
        // If the entity is on a map, notify the map that the entity has moved.
        if (this._map) {
            this._map.updateEntityPosition(this, oldX, oldY, oldZ);
        }
    }
    setX(x) {
        this._x = x;
    }
    setY(y) {
        this._y = y;
    }
    setZ(z) {
        this._z = z;
    }
    setMap(map) {
        this._map = map;
    }
    getName() {
        return this._name;
    }
    getX() {
        return this._x;
    }
    getY() {
        return this._y;
    }
    getZ() {
        return this._z;
    }
    getMap() {
        return this._map;
    }

    // // Create an object which will keep track what mixins we have
    // // attached to this entity based on the name property
    // _attachedMixins = {};
    // // Setup the object's mixins
    // mixins = properties['mixins'] || [];
    // for (var i = 0; i < mixins.length; i++) {
    //     // Copy over all properties from each mixin as long
    //     // as it's not the name or the init property. We
    //     // also make sure not to override a property that
    //     // already exists on the entity.
    //     for (var key in mixins[i]) {
    //         if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
    //             this[key] = mixins[i][key];
    //         }
    //     }
    //     // Add the name of this mixin to our attached mixins
    //     this._attachedMixins[mixins[i].name] = true;
    //     // Finally call the init function if there is one
    //     if (mixins[i].init) {
    //         mixins[i].init.call(this, properties);
    //     }
    // }
}
// Make entities inherit all the functionality from glyphs
// Game.Entity.extend(Game.Glyph);

// Game.Entity.prototype.hasMixin = function(obj) {
//     // Allow passing the mixin itself or the name as a string
//     if (typeof obj === 'object') {
//         return this._attachedMixins[obj.name];
//     } else {
//         return this._attachedMixins[name];
//     }
// }

// var entityProto = Game.Entity.prototype;

// entityProto.setName = function(name) {
//     this._name = name;
// }
// entityProto.setX = function(x) {
//     this._x = x;
// }
// entityProto.setY = function(y) {
//     this._y = y;
// }
// entityProto.getName = function() {
//     return this._name;
// }
// entityProto.getX = function() {
//     return this._x;
// }
// entityProto.getY   = function() {
//     return this._y;
// }

