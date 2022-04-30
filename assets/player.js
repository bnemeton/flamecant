class Player extends Entity {
    constructor() {
        super({
            char: '@',
            fg: 'white',
            bg: 'black',
            actor: true,
            canDig: true,
            bagSlots: 26
        });
        this.name = 'branded';
        this.hp = 10;
        this.maxHp = 10;
        this.mortal = true;
        this.attacker = true;
        this.damage = 1;
        this.armor = 0;
        this.luck = 1.0;
        this.sight = 10;
        this.alive = true;
        this.glyphs = 3;
    }
    getHp() {
        return this.hp
    }
    getMaxHp() {
        return this.maxHp;
    }
    attack(target) {
        //who is the target?
        // console.log(`player targeting ${target.name}`)
        //only do this if the target is mortal5
        if(target.mortal) {
            let damage = this.damage;
            let critChance = 0.05*this.luck;
            let crit = false;
            let message = "";
            if (Math.random() <= critChance) {
                damage = damage * 2;
                crit = true;
            }
            if(crit) {
                message = `You critically hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
            } else {
                message = `You hit the ${target.name} for ${damage - target.armor} point(s) of damage!`
            }
            Game.message(message)
            target.takeDamage(this, damage - target.armor)
        }
    }
    takeDamage(attacker, damage) {
        this.hp -= damage - this.armor;
        if (this.hp <= 0) {
            Game.switchScreen(Game.Screen.loseScreen);
        }
    }
    tryMove(x, y, z, map) {
        var map = this.getMap();
        // console.log(this.getZ());

        // console.log('trying to move!')
        var tile = map.getTile(x, y, this.getZ());
        var target = map.getEntityAt(x, y, this.getZ());
        // console.log(target);
        //on stair?
        if (z < this.getZ()) {
            if (!(tile instanceof StairUp)) {
                Game.message("You can't go up here.")
            } else {
                this.setPosition(x, y, z);
                Game.message("You walk up the stairs.")
            }
        }
        if (z > this.getZ()) {
            if (!(tile instanceof StairDown)) {
                Game.message("You can't go down here.")
            } else {
                this.setPosition(x, y, z);
                Game.message("You walk down the stairs.")
            }
        }

        // If an entity was present at the tile, check if it's us. if it is, wait a turn
        if (target === this) {
            console.log('waiting one turn.');
            return true;
        }
        if (target && this.attacker) {
            this.attack(target);
            console.log(`player attacked ${target.name}!`)
            return true;
        }  else if (target) {
            //cannot attack
            return false;
        }
        // Check if we can walk on the tile
        // and if so simply walk onto it
        if (tile.isWalkable) {
            // Update the entity's position
            this.setPosition(x, y, z);
            // console.log('updated player-stored position!')
            var items = this.getMap().getItemsAt(x, y, z);
            if (items.length > 0) {
                if (items.length === 1) {
                    Game.message(`You see a(n) ${items[0].name} here.`);
                } else {
                    Game.message("There are several things here.");
                }
            }
            return true;
        // Check if the tile is diggable, and
        // if so try to dig it
        } else if (tile.isDiggable) {
            map.dig(x, y, z);
            console.log('dug terrrain!')
            return true;
        }
        return false;
    }
    act() {
        // Detect if the game is over
        if (!this.alive) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.message('Press [Enter] to continue!');
        }
        // console.log('player acting!')
        // Re-render the screen
        Game.refresh();
        // Lock the engine and wait asynchronously
        // for the player to press a key.
        this.getMap().getEngine().lock();
        console.log('awaiting player input...')
    }
}