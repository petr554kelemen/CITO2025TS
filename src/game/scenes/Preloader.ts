// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
import ResponsiveManager from '../../utils/ResponsiveManager';
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
        let device: Device = 'PC';
        const ua = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(ua)) {
            device = 'iOS';
        } else if (/Android/.test(ua)) {
            device = 'Android';
        }

        // Typ pro jazyk
        type Lang = 'cs' | 'en' | 'pl';
        // Typ pro zařízení
        type Device = 'PC' | 'Android' | 'iOS';

        // Lokalizované texty
        const infoTexts: Record<Lang, { PC: string; Android: string; iOS: string }> = {
            cs: {
                PC: "Detekováno zařízení: PC\nHra poběží bez omezení.",
                Android: "Detekováno zařízení: Android\nDoporučujeme hrát ve fullscreen režimu.",
                iOS: "Detekováno zařízení: iOS\nVaše zařízení není v současné době podporované.\nPoužijte PC nebo Android."
            },
            en: {
                PC: "Device detected: PC\nThe game will run without restrictions.",
                Android: "Device detected: Android\nWe recommend playing in fullscreen mode.",
                iOS: "Device detected: iOS\nYour device is not currently supported.\nPlease use a PC or Android."
            },
            pl: {
                PC: "Wykryto urządzenie: PC\nGra będzie działać bez ograniczeń.",
                Android: "Wykryto urządzenie: Android\nZalecamy grę w trybie pełnoekranowym.",
                iOS: "Wykryto urządzenie: iOS\nTwoje urządzenie nie jest obecnie obsługiwane.\nUżyj komputera PC lub Androida."
            }
        };

        // Výchozí jazyk
        let lang: Lang = 'cs';
        if (navigator.language.startsWith('en')) lang = 'en';
        if (navigator.language.startsWith('pl')) lang = 'pl';

        // Počkej na načtení fontů a pak zobraz info
        window.WebFont.load({
            google: {
                families: [
                    'Roboto:700',
                    'Single Day:400',
                    'DynaPuff:600',
                    'Barrio:400',
                    'WDXL Lubrifont TC:400',
                    'Kings:400',
                    'Merienda:400'
                ]
            },
            active: () => {
                this.cameras.main.setBackgroundColor('#000000');

                const posY = this.scale.height * 0.65;
                let infoTextObj: Phaser.GameObjects.Text | null = null;

                // Funkce pro zobrazení textu
                const showInfo = (text: string) => {
                    if (infoTextObj) infoTextObj.destroy();
                    infoTextObj = this.add.text(this.scale.width / 2, posY, text, {
                        fontFamily: 'Roboto, Arial, sans-serif',
                        fontSize: '22px',
                        color: '#fff',
                        backgroundColor: '#222',
                        padding: { left: 16, right: 16, top: 12, bottom: 12 },
                        align: 'center',
                        wordWrap: { width: this.scale.width * 0.8 }
                    }).setOrigin(0.5);
                };

                if (device === 'iOS') {
                    // Nekonečně střídej jazykové varianty po 3s
                    const langs: Lang[] = ['cs', 'en', 'pl'];
                    let idx = 0;
                    showInfo(infoTexts[langs[idx]].iOS);
                    this.time.addEvent({
                        delay: 3000,
                        loop: true,
                        callback: () => {
                            idx = (idx + 1) % langs.length;
                            showInfo(infoTexts[langs[idx]].iOS);
                        }
                    });
                } else {
                    // Zobrazit pouze text pro detekovaný jazyk a zařízení
                    showInfo(infoTexts[lang][device]);
                    // Po krátké prodlevě pokračovat do MainMenu
                    this.time.delayedCall(1500, () => {
                        this.scene.start('MainMenu');
                    });
                }
            }
        });
    }
}

