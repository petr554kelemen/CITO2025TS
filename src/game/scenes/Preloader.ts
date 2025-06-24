// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
import ResponsiveManager from '../../utils/ResponsiveManager';
import { DEBUG_MODE } from '../../config/constants';
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
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        progressBar.setPosition(gameWidth / 2, gameHeight * 0.6);
        progressBar.displayWidth = Math.min(468, gameWidth * 0.7);
        progressBar.isFilled = true;
        progressBar.fillColor = 14737632;
        progressBar.isStroked = true;

        this.progressBar = progressBar;

        this.events.emit("scene-awake");
    }

    private progressBar!: Phaser.GameObjects.Rectangle;
    private responsive!: ResponsiveManager;

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
        this.load.spritesheet('monina', 'assets/images/Divka00.png', { frameWidth: 141, frameHeight: 450 });
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
        // Inicializace ResponsiveManager
        this.responsive = new ResponsiveManager(this);

        // Přizpůsobit pozice loading baru podle zařízení
        if (this.responsive.isMobile()) {
            this.progressBar.setPosition(334, 200);
            this.progressBar.displayWidth = 300;
        }

        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        this.progressBar.setPosition(gameWidth / 2, gameHeight * 0.6);
        this.progressBar.displayWidth = Math.min(468, gameWidth * 0.7);

        // Detekce zařízení
        let device = 'PC';
        const ua = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(ua)) {
            device = 'iOS';
        } else if (/Android/.test(ua)) {
            device = 'Android';
        }

        // Text podle zařízení
        let info = `Detekováno zařízení: ${device}\n`;
        if (device === 'PC') {
            info += 'Hra poběží bez omezení.';
        } else if (device === 'Android') {
            info += 'Doporučujeme hrát ve fullscreen režimu.';
        } else if (device === 'iOS') {
            info += 'Vaše zařízení není v současné době podporované. Použijte PC nebo Android.';
        }

        // Počkej na načtení fontů a pak zobraz info
        window.WebFont.load({
            google: {
                families: [
                    'Roboto:700',
                    'Single Day:400',
                    'DynaPuff:600',
                    'Barrio',
                    'WDXL Lubrifont TC:400',
                    'Kings:400',
                    'Merienda:400'
                ]
            },
            active: () => {
                this.cameras.main.setBackgroundColor('#000000');
                this.add.text(gameWidth / 2, gameHeight * 0.75, info, {
                    fontFamily: 'Roboto, Arial, sans-serif',
                    fontSize: '22px',
                    color: '#fff',
                    backgroundColor: '#222',
                    padding: { left: 16, right: 16, top: 12, bottom: 12 },
                    align: 'center'
                }).setOrigin(0.5);

                // Pokud není iOS, pokračuj do MainMenu
                if (device !== 'iOS') {
                    this.scene.start('MainMenu');
                }
            }
        });
    }
}

