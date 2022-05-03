class Glyph {
    constructor(properties) {
        // Instantiate properties to default if they weren't passed
        properties = properties || {};
        // console.log(properties);
        this._char = properties['char'] || '';
        this._foreground = properties['fg'] || 'white';
        this._background = properties['bg'] || 'black';
        this.text = properties['text'] || '';
    }
    getChar() {
        return this._char;
    }
    getForeground() {
        return this._foreground;
    }
    getBackground() {
        return this._background;
    }
};

// // Create standard getters for glyphs
// Game.Glyph.prototype.getChar = function(){ 
//     return this._char; 
// }
// Game.Glyph.prototype.getBackground = function(){
//     return this._background;
// }
// Game.Glyph.prototype.getForeground = function(){ 
//     return this._foreground; 
// }