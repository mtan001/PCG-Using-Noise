class MapGenerator extends Phaser.Scene {
    constructor() {
        super("mapGeneratorScene");
    }

    preload() {
    }

    init() {
        this.TILESIZE = 180;
        this.SCALE = 2.0;
        this.TILEWIDTH = 20;
        this.TILEHEIGHT = 15;
        this.sampleSize = 16;
        this.GRASSTILE = 40;
        this.WATERTILE = 56;
        this.BOTTOMGRASSTILE = 25;
        this.TOPGRASSTILE = 55;
        this.RIGHTGRASSTILE = 26;
        this.LEFTGRASSTILE = 54;
        this.BOTLEFTCORNER = 24;
        this.BOTRIGHTCORNER = 191;
        this.TOPLEFTCORNER = 69;
        this.TOPRIGHTCORNER = 41;
        this.randArray = Array.from({ length: 15 }, () => Array(20).fill(0));
        this.map;
        this.tilesheet;
        this.layer;
    }

    create() {
        // GENERATE NOISE ARRAY AND ASSIGN TILES
        noise.seed(Math.random());
        this.createMap();
        this.addTransitions();

        // BACKGROUND TILES
        let waterArray = Array.from({ length: 15 }, () => Array(20).fill(0));
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                waterArray[x][y] = 56;
            }
        }
        const bg = this.make.tilemap({
            data: waterArray,
            tileWidth: 64,
            tileHeight: 64
        })
        const bg_tilesheet = bg.addTilesetImage("map_tiles")
        const bg_layer = bg.createLayer(0, "map_tiles", 0, 0);

        // LOAD RANDOMLY GENERATED MAP
        this.loadMap();
        this.addDecor();

        // COMMANDS
        this.rKey = this.input.keyboard.addKey('R');
        this.shrinkKey = this.input.keyboard.addKey(188);
        this.growKey = this.input.keyboard.addKey(190);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(this.shrinkKey)) {
            console.log("shrink");
            console.log(this.sampleSize);
            this.sampleSize += 5;
            this.clearMap();
            this.createMap();
            this.addTransitions();
            this.loadMap();
            this.addDecor();
        }
        if (Phaser.Input.Keyboard.JustDown(this.growKey)) {
            console.log("grow");
            console.log(this.sampleSize);
            if (this.sampleSize > 5){
                this.sampleSize -= 5;
            }
            this.clearMap();
            this.createMap();
            this.addTransitions();
            this.loadMap();
            this.addDecor();
        }
    }

    createMap(){
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                // All noise functions return values in the range of -1 to 1.
                // noise.simplex2 and noise.perlin2 for 2d noise
                var value = noise.simplex2(x / this.sampleSize, y / this.sampleSize);
                this.randArray[x][y] = Math.floor(Math.abs(value) * 256); // Or whatever. Open demo.html to see it used with canvas.
                // water
                if (this.randArray[x][y] > 100){
                    this.randArray[x][y] = this.WATERTILE;
                }
                // grass
                else if (this.randArray[x][y] <= 100){
                    this.randArray[x][y] = this.GRASSTILE;
                }
            }
        }
    }

    addTransitions(){
        //TRANSITION TILES
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                // if grass tile has water tile underneath
                if (x < this.TILEHEIGHT - 1){
                    if (this.randArray[x][y] == this.GRASSTILE && this.randArray[x+1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.BOTTOMGRASSTILE;
                    }
                }
                // if grass tile has water tile above
                if (x > 0){
                    if (this.randArray[x][y] == this.GRASSTILE && this.randArray[x-1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.TOPGRASSTILE;
                    }
                }
                // if grass tile has water tile to the right
                if (y < this.TILEWIDTH - 1){
                    if (this.randArray[x][y] == this.GRASSTILE && this.randArray[x][y+1] == this.WATERTILE){
                        this.randArray[x][y] = this.RIGHTGRASSTILE;
                    }
                }
                // if grass tile has water tile to the left
                if (y > 0){
                    if (this.randArray[x][y] == this.GRASSTILE && this.randArray[x][y-1] == this.WATERTILE){
                        this.randArray[x][y] = this.LEFTGRASSTILE;
                    }
                }
            }
        }

        // CORNER TILES
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                // bottom left corner
                if (x < this.TILEHEIGHT - 1 && y > 0){
                    if (this.randArray[x][y] == this.BOTTOMGRASSTILE && this.randArray[x][y-1] == this.WATERTILE && this.randArray[x+1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.BOTLEFTCORNER;
                    }
                }
                // bottom right corner
                if (x < this.TILEHEIGHT - 1 && y < this.TILEWIDTH - 1){
                    if (this.randArray[x][y] == this.BOTTOMGRASSTILE && this.randArray[x][y+1] == this.WATERTILE && this.randArray[x+1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.BOTRIGHTCORNER;
                    }
                }
                // top left corner
                if (x > 0 && y > 0){
                    if (this.randArray[x][y] == this.TOPGRASSTILE && this.randArray[x][y-1] == this.WATERTILE && this.randArray[x-1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.TOPLEFTCORNER;
                    }
                }
                // top right corner
                if (x > 0 && y < this.TILEWIDTH - 1){
                    if (this.randArray[x][y] == this.TOPGRASSTILE && this.randArray[x][y+1] == this.WATERTILE && this.randArray[x-1][y] == this.WATERTILE){
                        this.randArray[x][y] = this.TOPRIGHTCORNER;
                    }
                }
            }
        }

        // SIDE/CORNER TILE TRANSITION
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                //BOTTOM
                if (x < this.TILEHEIGHT - 1 && y < this.TILEWIDTH - 1){
                    if (this.randArray[x][y] == this.GRASSTILE && (this.randArray[x][y+1] == this.BOTTOMGRASSTILE || this.randArray[x][y+1] == this.BOTRIGHTCORNER) && (this.randArray[x+1][y] == this.RIGHTGRASSTILE || this.randArray[x+1][y] == this.BOTRIGHTCORNER)){
                        this.randArray[x][y] = 27;
                    }
                }
                if (x < this.TILEHEIGHT - 1 && y > 0){
                    if (this.randArray[x][y] == this.GRASSTILE && (this.randArray[x][y-1] == this.BOTTOMGRASSTILE || this.randArray[x][y-1] == this.BOTLEFTCORNER) && (this.randArray[x+1][y] == this.LEFTGRASSTILE || this.randArray[x+1][y] == this.BOTLEFTCORNER)){
                        this.randArray[x][y] = 13;
                    }
                }
                //TOP
                if (y < this.TILEWIDTH - 1) {
                        if (this.randArray[x][y] == this.GRASSTILE && (this.randArray[x][y+1] == this.TOPRIGHTCORNER)){
                            this.randArray[x][y] = 12;
                        }
                }
                if (y > 0){
                        if (this.randArray[x][y] == this.GRASSTILE && (this.randArray[x][y-1] == this.TOPGRASSTILE || this.randArray[x][y-1] == this.TOPLEFTCORNER)){
                            this.randArray[x][y] = 193;
                        }
                }
            }
        }
    }

    loadMap(){
        // CREATE RANDOMLY GENERATED MAP
        this.map = this.make.tilemap({
            data: this.randArray,
            tileWidth: 64,
            tileHeight: 64
        })
        this.tilesheet = this.map.addTilesetImage("map_tiles")
        this.layer = this.map.createLayer(0, "map_tiles", 0, 0);
    }

    addDecor(){
        let decorArray = Array.from({ length: 15 }, () => Array(20).fill(0));
        let badTiles = [this.WATERTILE, this.BOTTOMGRASSTILE, this.BOTLEFTCORNER, this.BOTRIGHTCORNER];
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                if (badTiles.includes(this.randArray[x][y]) == false && Phaser.Math.FloatBetween(0, 100) < 20){
                    decorArray[x][y] = 177; //tiny grass
                }
                else if (badTiles.includes(this.randArray[x][y]) == false && Phaser.Math.FloatBetween(0, 100) < 10){
                    decorArray[x][y] = 62; //red mushroom
                }
                else{
                    decorArray[x][y] = 195; //transparent
                }
            }
        }
        const decor = this.make.tilemap({
            data: decorArray,
            tileWidth: 64,
            tileHeight: 64
        })
        const decor_tilesheet = decor.addTilesetImage("map_tiles")
        const decor_layer = decor.createLayer(0, "map_tiles", 0, 0);
    }

    clearMap(){
        for (var x = 0; x < this.TILEHEIGHT; x++) {
            for (var y = 0; y < this.TILEWIDTH; y++) {
                this.layer.removeTileAt(y, x);
            }
        }
    }

}