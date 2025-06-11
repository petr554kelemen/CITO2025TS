import Phaser from 'phaser';
import ResponsiveManager, { LayoutType, DeviceType } from '../../utils/ResponsiveManager';

// Pokud používáš vlastní pozici/scénu pro vlaječky a assety, uprav podle potřeby
//const supportedLanguages = ['cs', 'en', 'pl'];
type Lang = 'cs' | 'en' | 'pl';

//const flags: Record<Lang, Phaser.GameObjects.Image> = { ... };
//const labels: Record<Lang, Phaser.GameObjects.Text> = { ... };

export default class MainMenu extends Phaser.Scene {
    private responsive!: ResponsiveManager;

    constructor() {
        super('MainMenu');
    }

    preload(): void {
        // načtení JSONů i vlaječek v preloader.ts
    }

    // create(): void {
    //   const supportedLanguages = ['cs', 'en', 'pl'];
    //   let selectedLanguage = localStorage.getItem('language');
    //   if (!selectedLanguage) {
    //     const browserLang = navigator.language.slice(0, 2);
    //     selectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'cs';
    //     localStorage.setItem('language', selectedLanguage);
    //   }

    //   this.cameras.main.fadeIn(500, 0, 0, 0); //fadeIn ze staré scény

    //   // freepik_forest_02
    //   this.add.image(583, 383, "freepik_forest_02");

    //   // text
    //   const text = this.add.text(this.scale.width / 2, 276, "", {});
    //   text.setOrigin(0.5, 0.5);
    //   text.text = "GEOCACHING GAME";
    //   text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

    //   // Název hry - Nadpis
    //   const nazevHry = this.add.text(this.scale.width / 2, 180, "", {});
    //   nazevHry.setOrigin(0.5, 0.5);
    //   nazevHry.text = "Virtuální CITO";
    //   nazevHry.setStyle({ "align": "center", "color": "#d1d289ff", "fontFamily": "Kings", "fontSize": "96px", "stroke": "#931616ff", "strokeThickness": 5, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.fill": true });

    //   // cito_logo
    //   const cito_logo = this.add.image(524, 448, "Cito_logo").setOrigin(.5);
    //   cito_logo.scaleX = 0.25;
    //   cito_logo.scaleY = 0.25;

    //   // vlaječky pro výběr
    //   const langs: Lang[] = ['cs', 'en', 'pl'];
    //   const rozestup: number = 100;
    //   let xPosVlajek: number = this.scale.width / 2;
    //   langs.forEach((lang, idx) => {
    //     switch (idx) {
    //       case 0:
    //         // vlajka vlevo
    //         xPosVlajek -= rozestup;
    //         break;
    //       case 1:
    //         // vlajka na stred
    //         xPosVlajek = this.scale.width / 2;
    //         break;
    //       case 2:
    //         // vlajka vpravo
    //         xPosVlajek += rozestup;
    //         break;
    //       default:
    //         xPosVlajek = this.scale.width / 2;
    //         break;
    //     }
    //     this.add.image(xPosVlajek, 600, `flag_${lang}`)
    //       .setInteractive()
    //       .setOrigin(0.5, 0.5)
    //       .setScale(0.8)
    //       .on('pointerup', () => this.selectLang(lang));
    //   });

    //   // Info o licenci
    //   const licence = this.add.text(this.scale.width / 2, 725, "", {}).setOrigin(0.5);
    //   licence.text = "(c) 2022 - 2025, pettr554\nlicence MIT";
    //   licence.setStyle({ align: "center" });

    //   // divkaStoji
    //   const divkaStoji = this.add.image(123, 421, "DivkaStoji").setOrigin(.5);
    //   divkaStoji.scaleX = 0.75;
    //   divkaStoji.scaleY = 0.75;

    //   // plnyPytel
    //   const plnyPytel = this.add.image(874, 524, "plnyPytel").setOrigin(.5);
    //   plnyPytel.scaleX = 0.25;
    //   plnyPytel.scaleY = 0.45;
    // }

    create() {
        // Inicializace ResponsiveManager
        this.responsive = new ResponsiveManager(this);
        this.responsive.checkAndForceOrientation();
        
        // Debug info pro ladění
        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
        }
        
        const deviceType = this.responsive.getDeviceType();
        
        // Použij pouze mobilní nebo desktopový layout (tablety použijí mobilní)
        if (deviceType === DeviceType.MOBILE) {
            this.createMobileLayout();
        } else {
            this.createDesktopLayout();
        }
        
        // Reaguj na změny layoutu
        this.responsive.on('layoutchange', (layout: LayoutType) => {
            // Vyčisti existující layout
            this.children.list.forEach((child) => {
                if (child instanceof Phaser.GameObjects.GameObject) {
                    child.destroy();
                }
            });
            
            // Vytvoř nový layout podle typu zařízení
            if (layout === LayoutType.MOBILE) {
                this.createMobileLayout();
            } else {
                this.createDesktopLayout();
            }
        });
    }

    private createMobileLayout(): void {
        // Získáme skutečně dostupnou velikost hracího pole
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Pozadí - vždy centrováno
        const background = this.add.image(centerX, centerY, "freepik_forest_02");
        
        // Zachováme poměr stran a zajistíme, že bude pokrývat celou plochu
        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Název hry - umístěn relativně k horní části obrazovky
        const titleY = gameHeight * 0.22;
        this.add.text(centerX, titleY, "Virtuální CITO", {
            fontFamily: "Kings",
            fontSize: Math.min(48, gameWidth * 0.14) + "px", // Menší font pro malé displeje
            color: "#d1d289ff",
            stroke: "#931616ff",
            strokeThickness: 3,
            align: "center"
        }).setOrigin(0.5);

        // Podnadpis
        this.add.text(centerX, titleY + (gameHeight * 0.12), "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: Math.min(22, gameWidth * 0.065) + "px",
            color: "#fff",
            stroke: "#000",
            strokeThickness: 5,
            align: "center"
        }).setOrigin(0.5);

        // Logo - přizpůsobení velikosti obrazovce
        const logoScale = Math.min(0.18, gameWidth * 0.0005);
        this.add.image(centerX, centerY, "Cito_logo")
            .setOrigin(0.5)
            .setScale(logoScale);

        // Dívka - umístěna relativně vlevo
        this.add.image(gameWidth * 0.2, gameHeight * 0.75, "DivkaStoji")
            .setOrigin(0.5)
            .setScale(Math.min(0.6, gameHeight * 0.0015));

        // Plný pytel - umístěn relativně vpravo
        this.add.image(gameWidth * 0.8, gameHeight * 0.7, "plnyPytel")
            .setOrigin(0.5)
            .setScale(Math.min(0.18, gameHeight * 0.0005), Math.min(0.32, gameHeight * 0.0009));

        // Vlajky pro výběr jazyka - relativní k šířce obrazovky
        const langs: Lang[] = ['cs', 'en', 'pl'];
        const rozestup = gameWidth * 0.15; // Relativní rozestupy
        langs.forEach((lang, idx) => {
            let x = centerX + (idx - 1) * rozestup;
            this.add.image(x, gameHeight * 0.85, `flag_${lang}`)
                .setInteractive()
                .setOrigin(0.5)
                .setScale(Math.min(0.7, gameHeight * 0.002))
                .on('pointerup', () => this.selectLang(lang));
        });

        // Licence - umístěna relativně ke spodní části
        this.add.text(centerX, gameHeight * 0.95, "(c) 2022 - 2025, pettr554\nlicence MIT", {
            fontFamily: "Arial",
            fontSize: Math.min(12, gameWidth * 0.03) + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);
    }

    private createDesktopLayout(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Pozadí
        const background = this.add.image(centerX, centerY, "freepik_forest_02");
        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Název hry
        this.add.text(centerX, gameHeight * 0.22, "Virtuální CITO", {
            fontFamily: "Kings",
            fontSize: Math.min(96, gameWidth * 0.14) + "px",
            color: "#d1d289ff",
            stroke: "#931616ff",
            strokeThickness: 5,
            align: "center"
        }).setOrigin(0.5);

        // Podnadpis
        this.add.text(centerX, gameHeight * 0.36, "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: Math.min(38, gameWidth * 0.065) + "px",
            color: "#fff",
            stroke: "#000",
            strokeThickness: 8,
            align: "center"
        }).setOrigin(0.5);

        // Logo
        this.add.image(centerX, centerY, "Cito_logo")
            .setOrigin(0.5)
            .setScale(Math.min(0.25, gameWidth * 0.0005));

        // Dívka
        this.add.image(gameWidth * 0.12, gameHeight * 0.55, "DivkaStoji")
            .setOrigin(0.5)
            .setScale(Math.min(0.75, gameHeight * 0.0015));

        // Plný pytel
        this.add.image(gameWidth * 0.85, gameHeight * 0.68, "plnyPytel")
            .setOrigin(0.5)
            .setScale(Math.min(0.25, gameHeight * 0.0005), Math.min(0.45, gameHeight * 0.0009));

        // Vlajky pro výběr jazyka
        const langs: Lang[] = ['cs', 'en', 'pl'];
        const rozestup = gameWidth * 0.15;
        langs.forEach((lang, idx) => {
            let x = centerX + (idx - 1) * rozestup;
            this.add.image(x, gameHeight * 0.85, `flag_${lang}`)
                .setInteractive()
                .setOrigin(0.5)
                .setScale(Math.min(0.8, gameHeight * 0.002))
                .on('pointerup', () => this.selectLang(lang));
        });

        // Licence
        this.add.text(centerX, gameHeight * 0.95, "(c) 2022 - 2025, pettr554\nlicence MIT", {
            fontFamily: "Arial",
            fontSize: Math.min(18, gameWidth * 0.03) + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);
    }


    private selectLang(lang: string): void {
        // Pokus o fullscreen (funguje jen na základě uživatelské akce)
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }

        const texts = this.cache.json.get(`lang-${lang}`);
        if (!texts) {
            // Pro případ, že by nebyl daný jazyk v cache, fallback na angličtinu
            console.warn(`Texty pro jazyk ${lang} nenalezeny, přepínám na EN.`);
            localStorage.setItem('language', 'en');
            this.scene.restart();
            return;
        }
        this.scene.start('Intro', { texts, language: lang });
    }
}
