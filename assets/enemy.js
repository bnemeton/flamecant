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
                message = `the ${this.name} critically hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
            } else {
                message = `the ${this.name} hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
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
            this.tryDropCorpse();
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
        console.log(`${this.name} attempting to move into ${target.name}`)
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
        if (this.attacker && target.name === 'player') { //removed some conditions to try to get shamblers to attack... this allows enemies to attack one another
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
            corpseRate: 50
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
            char: 'S',
            fg: 'darkseagreen',
            corpseRate: 50
        })
        this.name = 'shambler'
        this.hp = 5;
        this.damage = 1;
    }

    act() {
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
}
