class Enemy extends Entity {
    constructor(properties) {
        super(properties);
        this.actor = true;
        this.mortal = true;
        this.armor = properties['armor'] || 0;
        this.damage = properties['damage'] || 1;
        this.luck = properties['luck'] || 1.0;
        this.bagSlots = properties['bagSlots'] || 5;
        this.attacker = properties['attacker'] || true;
        this.corpseRate = properties['corpseRate'] || 0;
        this.foes = properties['foes'] || ['branded'];
        this.wants = properties['wants'] || [];
        this.friends = properties["friends"] || [];
        this.maxSpeed = properties['maxSpeed'] || 1;
        
    }
    canSee(entity) {
        if (!entity || this.getMap() !== entity.getMap() || this.getZ() !== entity.getZ()) {
            return false;
        }
        let otherX = entity.getX();
        let otherY = entity.getY();

        // If we're not in a square field of view, then we won't be in a real
        // field of view either.
        if ((otherX - this._x) * (otherX - this._x) +
            (otherY - this._y) * (otherY - this._y) >
            this.sight * this.sight) {
            return false;
        }
        let found = false;
        this.getMap().getFOV(this.getZ()).compute(
            this.getX(), this.getY(), this.sight,
            function(x, y, radius, visibility) {
                if (x === otherX && y === otherY) {
                    found = true;
                }
            }
        )
        return found;


    }
    lookout(type) {
        let results = [];
        let nearbyThings = [];
        switch(type){
            case "foes": 
                nearbyThings = this._map.getEntitiesWithinRadius(this._x, this._y, this._z, this.sight);
                results = nearbyThings.filter(guy => 
                    this.canSee(guy) && this.foes.includes(guy.name)
                )
                break;
            case "wants":
                nearbyThings = this._map.getItemsWithinRadius(this._x, this._y, this._z, this.smell);
                results = nearbyThings.filter(item => this.wants.includes(item.name))
                break;
            case "friends":
                nearbyThings = this._map.getEntitiesWithinRadius(this._x, this._y, this._z, this.sight);
                results = nearbyThings.filter(guy => this.friends.includes(guy.name))
                break;
        }
        return results;
    }
    seek(target) {
        // console.log(target); //why is it seeking an empty target?
        // console.log(this); //why is map undefined when checked on line 71? it's defined correctly here
        let thisEnemy = this;
        let z = this._z;
        let path = new ROT.Path.AStar(target._x, target._y, function (x, y) {
            // console.log(thisEnemy) //ah this is not callable within functions or whatever, sure
            let entity = thisEnemy._map.getEntityAt(x, y, z);
            if (entity && entity !== target & entity !== thisEnemy) {
                return false;
            }
            // console.log(`coords: ${x}, ${y}, ${z}`)
            return thisEnemy._map.getTile(x, y, z).isWalkable;
        }, {topology: 4});
        let count = 0;
        path.compute(thisEnemy._x, thisEnemy._y, function (x, y) {
            if (count === 1) {
                thisEnemy.tryMove( x, y, z)
            }
            count++;
        });
    }
    attack(target) {
        console.log(`enemy attacking/targeting ${target.name}`)
        //only do this if the target is mortal
        if(target.mortal) {
            let damage = this.damage;
            let critChance = 0.05*this.luck;
            let crit = false;
            let message = "";
            if (Math.random() <= critChance) {
                damage = damage * 2;
                crit = true;
            }
            if (crit) {
                message = `The ${this.name} critically hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
            } else {
                message = `The ${this.name} hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
            }
            Game.message(message)
            target.takeDamage(this, this.damage)
        }
    }
    takeDamage(attacker, damage) {
        // console.log(`${this.name} got hit by ${attacker.name} for ${damage - this.armor} point(s) of damage!`)
        this.hp -= damage - this.armor;
        console.log(`${this.name} has ${this.hp} hp remaining...`)
        if (this.hp <= 0) {
            if (this.corpseRate > 0) {
                this.tryDropCorpse();
            }
            // console.log(`attempting to remove a ${this.name}...`)
            this.getMap().removeEntity(this);
            Game.message(`The ${this.name} dies!`)
        }
    }
    getHp() {
        return this.hp
    }
    tryMove(x, y, z, map) {
        var map = this.getMap();
        // console.log(this.getZ());

        // console.log('trying to move!')
        var tile = map.getTile(x, y, this.getZ());
        var target = map.getEntityAt(x, y, this.getZ());
        // console.log(`${this.name} attempting to move into ${target.name}`)
        // console.log(target);
        //on stair?
        if (z < this.getZ()) {
            if (!(tile instanceof StairUp)) {
                // Game.message("You can't go up here.")
            } else {
                this.setPosition(x, y, z);
                // Game.message("You walk up the stairs.")
            }
        }
        if (z > this.getZ()) {
            if (!(tile instanceof StairDown)) {
                // Game.message("You can't go down here.")
            } else {
                this.setPosition(x, y, z);
                // Game.message("You walk down the stairs.")
            }
        }

        // If an entity was present at the tile, check if it's us. if it is, wait a turn
        if (target === this) {
            // console.log('waiting one turn.');
            return true;
        }
        if (this.attacker && (this.foes.includes[target.name])) { //removed some conditions to try to get shamblers to attack... this allows enemies to attack one another
            // console.log(`${this.name} targeting ${target.name}`)
            this.attack(target);
            // console.log(`${this.name} attacked ${target.name}!`)
            return true;
        }  else if (target) {
            // console.log(`${this.name} bumps into ${target.name} harmlessly.`)
            //cannot attack
            return false;
        }
        // Check if we can walk on the tile
        // and if so simply walk onto it
        if (tile.isWalkable) {
            // Update the entity's position
            this.setPosition(x, y, z);
            // console.log(`updated ${this.name} stored position!`)
            return true;
        // Check if the tile is diggable, and
        // if so try to dig it
        }
        //  else if (tile.isDiggable) { //only players can dig, for now
        //     map.dig(x, y, z);
        //     console.log('dug terrrain instead!')
        //     return true;
        // }
        return false;
    }
    tryDropCorpse() {
        if (Math.round(Math.random() * 100) < this.corpseRate) {
            // Create a new corpse item and drop it.
            this._map.addItem(this.getX(), this.getY(), this.getZ(), (new Corpse({
                name: this.name
            })));
        }
    }
}

class Fungus extends Enemy {
    constructor() {
        let colors = [
            '#33cc33',
            '#66cc00',
            '#00cc66',
            '#bbff99',
            '#99e600',
            '#59b300'
        ];

        let pickedColor = colors[Math.floor(Math.random()*colors.length)]

        super({
            char: '෴',
            fg: pickedColor,
            attacker: true,
            corpseRate: 50,
            text: "A thick sheet, it carpets the floor of the cave. Every so often, you catch it twitching in the corner of your eye.",
            sight: 2
        })
        this.name = 'fungus'
        this.hp = 3;
        this.growthsLeft = 5;
        this.damage = 1;
    }
    act() {
        // console.log('fungus acting!')
        // Check if we are going to try growing this turn
        if (this.growthsLeft > 0) {
            if (Math.random() <= 0.02) {

                //on growth attempt, check number of fungi in radius 2; if greater than 8, die and spawn a shambler instead
                let nearbyGuys = this._map.getEntitiesWithinRadius(this._x, this._y, this._z, this.sight) // this always returns empty for some reason, entities are never detected
                // console.log(nearbyGuys) //always returning an empty array, which explains why nothing below is working // lmao passed no radius to get entities etc // nope still returning empty
                let nearbyFungi = 0;
                nearbyGuys.forEach(guy => {
                    if (guy.name === "fungus") {
                        nearbyFungi++;
                        console.log('incrementing nearbyFungi...')
                    }
                })
                if (nearbyFungi >= 8) {
                    let shambler = new Shambler();
                    shambler.setX(this._x);
                    shambler.setY(this._y);
                    shambler.setZ(this._z);
                    this.getMap().addEntity(shambler);
                    this.getMap().removeEntity(this);
                    Game.message("A patch of fungus rises up as a shambler!")

                }
                // Generate the coordinates of a random adjacent square by
                // generating an offset between [-1, 0, 1] for both the x and
                // y directions. To do this, we generate a number from 0-2 and then
                // subtract 1.
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Make sure we aren't trying to spawn on the same tile as us
                if (xOffset != 0 || yOffset != 0) {
                    // Check if we can actually spawn at that location, and if so
                    // then we grow!
                    if (this.getMap().isEmptyFloor(this.getX() + xOffset,
                                                   this.getY() + yOffset,
                                                   this.getZ())) {
                        var entity = new Fungus();
                        entity.setX(this.getX() + xOffset);
                        entity.setY(this.getY() + yOffset);
                        entity.setZ(this.getZ());
                        this.getMap().addEntity(entity);
                        // console.log('fungus is growing...')
                        this.growthsLeft--;
                    }
                }
            }
        }
    }
}

class Shambler extends Enemy {
    constructor() {
        super({
            char: 's',
            fg: 'darkseagreen',
            corpseRate: 50,
            text: "An upright, ambulatory clump of fungus. It seems to take an interest in corpses.",
            smell: 10,
            friends: ["fungus"]
        })
        this.name = 'shambler'
        this.hp = 5;
        this.damage = 1;
        this.burdened = false;
    }

    wander() {
         // this.tryMove(this.getX(), this.getY(), this.getZ()) //stand still
        // Flip coin to determine if moving by 1 in the positive or negative direction
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
        } else {
            this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
        }
    }
    act() {
        if (this._map.getItemsAt(this._x, this._y, this._z) > 0) {
            let items = this._map.getItemsAt(this._x, this._y, this._z)
            let indices = [];
            for (let i = 0; i < items.length; i++) {
                if (this.wants.includes(items[i].name)) {
                    indices.push(i);
                }
            }
            this.pickupItems(indices);
            return;
        }
        if (this.burdened && this.lookout("friends")) {
            let nearbyFriends = this.lookout("friends");
            let closestFriend = this.getClosest(nearbyFriends)
            seek(closestFriend) // to be implemented
            return;
        }
       if (this.lookout("wants")) {
            let nearbyWants = this.lookout("wants");
            let closestWant = this.getClosest(nearbyWants)
           this.seek(closestWant) // to be implemented
           return;
       } else {
           this.wander()
       }
    }
}

class StarvelingSwarm extends Enemy {
    constructor() {
        super({
            char: '⁂',
            fg: 'wheat',
            corpseRate: 0,
            text: "A swarm of ravenous moths. They will devour all they find, be it flesh or fungus.",
            name: "starveling swarm",
            actor: true,
            mortal: true,
            damage: 1,
            armor: 1,
            luck: 0.5,
            bagSlots: 0,
            foes: ['branded', 'fungus', 'shambler'],
            hp: 5,
            sight: 12,
            smell: 12,
            maxSpeed: 2
        })
        this.swarmCount = 5;
        this.hunger = 0;
    }
    
    eat() {

    }

    wander() {
        let xOffset = Math.floor(Math.random()*4)-2;
        let yOffset = Math.floor(Math.random()*4)-2;
        this.tryMove(this.getX()+xOffset, this.getY()+yOffset, this.getZ());
    }

    act() {
        //always hungry++
        this.hunger++;
        //if sufficiently hungry, chance of eating a swarmCount to reset hunger, 5% per point of hunger above the threshold
        if (this.hunger > 10) {
            if (Math.random() < (this.hunger-10)*0.05) {
                this.swarmCount--;
                this.hunger = 0;
            }
            //if swarmCount reduced to zero, despawn
            if (this.swarmCount === 0) {
                this._map.removeEntity(this)
                Game.message("A swarm consumes itself, leaving nothing behind.")
            }
        }

        if (this.lookout("wants") > 0) {
            let nearbyWants = this.lookout("wants");
            let closestWant = this.getClosest(nearbyWants)
            this.seek(closestWant)
            return;
        }
        if (this.lookout("foes").length > 0) {
            let nearbyFoes = this.lookout("foes");
            let closestFoe = this.getClosest(nearbyFoes)
            var offsets = Math.abs(closestFoe.getX() - this.getX()) + 
            Math.abs(closestFoe.getY() - this.getY());
                if (offsets === 1) {
                    if (this.attacker) {
                    this.eat(closestFoe);
                    return;
                }
            }
            this.seek(closestFoe)
            return;
        }

        
    }

}