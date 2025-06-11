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
        // Designové rozměry z main.ts
        const DESIGN_WIDTH = 667;
        const DESIGN_HEIGHT = 375;
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = this.responsive.getScaleFactor(DESIGN_WIDTH, DESIGN_HEIGHT);

        // Přepočet souřadnic a scale z editoru (pro design 667x375)
        const px = (x: number) => x * (gameWidth / DESIGN_WIDTH);
        const py = (y: number) => y * (gameHeight / DESIGN_HEIGHT);

        // Pozadí
        const background = this.add.image(px(337), py(187), "freepik_forest_02");
        background.setScale(0.582 * scaleFactor, 0.474 * scaleFactor);

        // Název hry
        const logo = this.add.text(px(377), py(61), "Virtuální CITO", {
            fontFamily: "Barrio",
            fontSize: 96 * scaleFactor + "px",
            color: "#d1d289ff",
            fontStyle: "bold",
            stroke: "#931616ff",
            strokeThickness: 5 * scaleFactor,
            align: "center",
            shadow: {
                offsetX: 5 * scaleFactor,
                offsetY: 5 * scaleFactor,
                fill: true
            }
        }).setOrigin(0.5);
        logo.setScale(0.588 * scaleFactor, 0.522 * scaleFactor);

        // Podnadpis
        const subtitle = this.add.text(px(392), py(113), "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: 38 * scaleFactor + "px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8 * scaleFactor,
            align: "center"
        }).setOrigin(0.5);

        // Logo CITO
        const citoLogo = this.add.image(px(370), py(193), "Cito_logo");
        citoLogo.setScale(0.15 * scaleFactor);

        // Vlajky
        const flags: { lang: Lang, x: number, y: number }[] = [
            { lang: 'cs', x: 270, y: 296 },
            { lang: 'en', x: 370, y: 300 },
            { lang: 'pl', x: 470, y: 300 }
        ];
        flags.forEach(flag => {
            this.add.image(px(flag.x), py(flag.y), `flag_${flag.lang}`)
                .setInteractive()
                .setOrigin(0.5)
                .on('pointerup', () => this.selectLang(flag.lang));
        });

        // Licence
        this.add.text(px(368), py(347), "(c) 2022 - 2025, pettr554\nlicence MIT", {
            fontFamily: "Arial",
            fontSize: 18 * scaleFactor + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Dívka
        const divkaStoji = this.add.image(px(107), py(218), "DivkaStoji")
            .setOrigin(0.5)
            .setScale(0.6 * scaleFactor);

        // Plný pytel
        const plnyPytel = this.add.image(px(604), py(264), "plnyPytel")
            .setOrigin(0.5)
            .setScale(0.2 * scaleFactor, 0.35 * scaleFactor);
    }

    private createDesktopLayout(): void {
        // Designové rozměry z main.ts
        const DESIGN_WIDTH = 667;
        const DESIGN_HEIGHT = 375;
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = this.responsive.getScaleFactor(DESIGN_WIDTH, DESIGN_HEIGHT);

        // Přepočet souřadnic a scale z editoru (pro design 667x375)
        const px = (x: number) => x * (gameWidth / DESIGN_WIDTH);
        const py = (y: number) => y * (gameHeight / DESIGN_HEIGHT);

        // Pozadí
        const background = this.add.image(px(337), py(187), "freepik_forest_02");
        background.setScale(0.582 * scaleFactor, 0.474 * scaleFactor);

        // Název hry
        const logo = this.add.text(px(377), py(61), "Virtuální CITO", {
            fontFamily: "Barrio",
            fontSize: 96 * scaleFactor + "px",
            color: "#d1d289ff",
            fontStyle: "bold",
            stroke: "#931616ff",
            strokeThickness: 5 * scaleFactor,
            align: "center",
            shadow: {
                offsetX: 5 * scaleFactor,
                offsetY: 5 * scaleFactor,
                fill: true
            }
        }).setOrigin(0.5);
        logo.setScale(0.588 * scaleFactor, 0.522 * scaleFactor);

        // Podnadpis
        const subtitle = this.add.text(px(392), py(113), "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: 38 * scaleFactor + "px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8 * scaleFactor,
            align: "center"
        }).setOrigin(0.5);

        // Logo CITO
        const citoLogo = this.add.image(px(370), py(193), "Cito_logo");
        citoLogo.setScale(0.15 * scaleFactor);

        // Vlajky
        const flags: { lang: Lang, x: number, y: number }[] = [
            { lang: 'cs', x: 270, y: 296 },
            { lang: 'en', x: 370, y: 300 },
            { lang: 'pl', x: 470, y: 300 }
        ];
        flags.forEach(flag => {
            this.add.image(px(flag.x), py(flag.y), `flag_${flag.lang}`)
                .setInteractive()
                .setOrigin(0.5)
                .on('pointerup', () => this.selectLang(flag.lang));
        });

        // Licence
        this.add.text(px(368), py(347), "(c) 2022 - 2025, pettr554\nlicence MIT", {
            fontFamily: "Arial",
            fontSize: 18 * scaleFactor + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Dívka
        const divkaStoji = this.add.image(px(107), py(218), "DivkaStoji")
            .setOrigin(0.5)
            .setScale(0.6 * scaleFactor);

        // Plný pytel
        const plnyPytel = this.add.image(px(604), py(264), "plnyPytel")
            .setOrigin(0.5)
            .setScale(0.2 * scaleFactor, 0.35 * scaleFactor);
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
