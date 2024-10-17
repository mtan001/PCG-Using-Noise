class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load map tiles
        this.load.image("map_tiles", "mapPack_spritesheet.png");
    }

    create() {
         // ...and pass to the next Scene
         this.scene.start("mapGeneratorScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}