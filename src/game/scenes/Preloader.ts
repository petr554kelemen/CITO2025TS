// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

declare global {
    interface Window {
        WebFont: any;
    }
}

export default class Preloader extends Phaser.Scene {

    constructor() {
        super("Preloader");
    }

    editorCreate(): void {

        // image_56ba42f5-7d7b-4134-a21e-85c51411440a
        this.add.image(512, 384, "background");

        // progressBar
        const progressBar = this.add.rectangle(512, 384, 468, 32);
        progressBar.isFilled = true;
        progressBar.fillColor = 14737632;
        progressBar.isStroked = true;

        this.progressBar = progressBar;

        this.events.emit("scene-awake");
    }

    private progressBar!: Phaser.GameObjects.Rectangle;

    /* START-USER-CODE */

    // Write your code here
    init() {

        this.editorCreate();

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(this.progressBar.x - this.progressBar.width / 2 + 4, this.progressBar.y, 4, 28, 0xffffff)

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        // Use the 'pack' file to load in any assets you need for this scene
        this.load.pack('preload', 'assets/preload-asset-pack.json');
        // obrázky vlaječek
        // načtené v preload-asset-pack

        // překlady
        this.load.json('lang-cs', 'assets/locales/cs.json');
        this.load.json('lang-en', 'assets/locales/en.json');
        this.load.json('lang-pl', 'assets/locales/pl.json');

        // 1) Načtení WebFont Loaderu
        this.load.script(
            'webfont',
            'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
        );
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        window.WebFont.load({
            google: { families: ['Roboto:700'] },
            active: () => {
                // (volitelně) barva pozadí během čekání
                this.cameras.main.setBackgroundColor('#000000');
                // start next scene až fonty jsou načtené
                //this.scene.start('MainMenu');

                this.scene.transition({
                    target: 'MainMenu',
                    duration: 2000,      // délka přechodu v ms
                    moveBelow: true     // nová scéna se vykreslí pod tou starou, která pak mizí
                });
            }
        });
        //this.scene.start('MainMenu');
    }
}

