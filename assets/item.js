class Item extends Glyph {
    constructor(props) {
        props = props || {};
        super(props);
        this.name = props['name'] || "";
        this.text = props['text'] || "";
        this.options = props['options'] || ['drop'];
        this.quantity = props['quantity'] || 1;
    }

    drop(index) {
        // Game.message(`You drop the ${this.name}.`)
        Game._currentScreen._player.dropItem(index);
        return true;
    }
}


class Food extends Item {
    constructor() {
        let varieties = [
            {
                name: "loaf",
                heal: 2,
                text: "LOAF: A stale chunk of bread. It's hard and chewy, but filling."

            },
            {
                name: "apple",
                heal: 1,
                text: "APPLE: A bruised apple. It's not crisp or tart, but it'll have to do."

            },
            {
                name: "hunk of cheese",
                heal: 3,
                text: "HUNK OF CHEESE: A mouth-watering morsel of salty, tangy, cheese."

            }
        ]
        let variety = varieties[Math.floor(Math.random()*varieties.length)]
        super({
            name: variety.name,
            text: variety.text,
            fg: 'lightsalmon',
            char: ',',
            options: [
                'eat',
                'drop'
            ]

        });
        this.heal = variety.heal;
        // this.char = ',';
        // this._foreground = 'lightsalmon'
    }
    eat(index) {
        Game._currentScreen._player.hp += this.heal;
        Game.message(`You eat the ${this.name}. You feel a little better.`)
        Game._currentScreen._player.removeItem(index);
    }
    // examine() {
    //     Game.message(this.text);
    // 
}

class Pebble extends Item {
    constructor(props) {
        super({
            name: "pebble",
            text: "PEBBLE: A small rock, suitable for throwing at enemies. It won't do much damage, though.",
            fg: 'sandybrown',
            char: '*'
        })
        this.damage = Math.round(Math.random()); // each pebble has either 0 or 1 damage, 50/50
        // this.char = '*';
        // this._foreground = 'tan'
    }
    throw() {
        //TO DO
    }
}

class Corpse extends Item {
    constructor(props) {
        let text = '';
        let options = [];
        switch(props.name) {
            case 'fungus':
                text = 'The damp remains of a large fungus. Can be dried by a campfire to make decent tinder.'
                options = ['dry', 'drop']
                break;
            case 'shambler':
                text = 'The twisted remains of a shambling fungal creature. They bring the corpses of prey to their home patches to feed the fungus.'
                options = ['drop']
                break;
        }
        super({
            fg: 'silver',
            char: '☗',
            text: text,
            options: options,
        });
        this.name = `${props.name} remains`;
    }
}

class Scrap extends Item {
    constructor(props) {
        let name = '';
        let value = 0;
        let text = '';
        let char = '';

        let tiers = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
        let tier = tiers[Math.floor(Math.random()*tiers.length)]
        switch(tier) {
            case 1:
                value = 1;
                name = 'scrap of charred flesh';
                text = 'A bit of skin, branded with glyphs of flame. Study it to obtain glyphs.'
                char = '⚀'
                break;
            case 2:
                value = 3;
                name = 'torn patch of branded skin';
                text = 'A patch of skin ripped from a speaker of flame. Study it to obtain a few glyphs.'
                char = '⚁'
                break;
            case 3:
                value = 5;
                name = 'strip of marked hide';
                text = 'A narrow strip of hide from [somebody?]. Study it to obtain several glyphs.'
                char = '⚂'
                break;
            case 4:
                value = 7;
                name = 'sheet of smoldering vellum';
                text = 'A sheet of vellum from a manuscript of [place?]. Study it to obtain many glyphs.'
                char = '⚃'
                break;
        }

        super({
            char: char,
            text: text,
            fg: 'orangered',
            name: name,
            options: ['study', 'drop']
        })

        this.value = value;
    }
    study(index) {
        Game._currentScreen._player.glyphs += this.value;
        Game.message(`You study the ${this.name}. You gain ${this.value} glyphs.`)
        Game._currentScreen._player.removeItem(index);
    }
}

// maybe later
// class Gear extends Item {
//     constructor(props) {
//         super(props)
//         this.attackBuff = props['attackBuff'] || 0;
//         this.armorBuff = props['armorBuff'] || 0;
//     }
// }