import Phaser from 'phaser';
import ResponsiveManager, { LayoutType, DeviceType } from '../../utils/ResponsiveManager';
import { UI, DESIGN } from '../../config/constants'; // <-- přidán DESIGN

type Lang = 'cs' | 'en' | 'pl';

export default class MainMenu extends Phaser.Scene {
    private responsive!: ResponsiveManager;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.responsive = new ResponsiveManager(this);
        this.responsive.checkAndForceOrientation();

        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
        }

        const deviceType = this.responsive.getDeviceType();

        if (deviceType === DeviceType.MOBILE) {
            this.createMobileLayout();
        } else {
            this.createDesktopLayout();
        }

        this.responsive.on('layoutchange', (layout: LayoutType) => {
            this.children.list.forEach((child) => {
                if (child instanceof Phaser.GameObjects.GameObject) {
                    child.destroy();
                }
            });
            if (layout === LayoutType.MOBILE) {
                this.createMobileLayout();
            } else {
                this.createDesktopLayout();
            }
        });
    }

    private createMobileLayout(): void {
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = this.responsive.getScaleFactor(DESIGN.WIDTH, DESIGN.HEIGHT);

        const px = (x: number) => x * (gameWidth / DESIGN.WIDTH);
        const py = (y: number) => y * (gameHeight / DESIGN.HEIGHT);

        // Pozadí
        this.add.image(px(337), py(187), "freepik_forest_02")
            .setScale(0.582 * scaleFactor, 0.474 * scaleFactor);

        // Název hry
        this.add.text(px(377), py(61), "Virtuální CITO", {
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
        }).setOrigin(0.5).setScale(0.588 * scaleFactor, 0.522 * scaleFactor);

        // Podnadpis
        this.add.text(px(392), py(113), "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: 38 * scaleFactor + "px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8 * scaleFactor,
            align: "center"
        }).setOrigin(0.5);

        // Logo CITO
        this.add.image(px(370), py(193), "Cito_logo")
            .setScale(Math.min(0.15 * scaleFactor, gameWidth * UI.LOGO.SCALE));

        // Vlajky
        const flags: { lang: Lang, x: number, y: number }[] = [
            { lang: 'cs', x: 270, y: 300 },
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
        this.add.image(px(107), py(218), "DivkaStoji")
            .setOrigin(0.5)
            .setScale(UI.MONINA.SCALE * scaleFactor);

        // Plný pytel
        this.add.image(px(604), py(264), "plnyPytel")
            .setOrigin(0.5)
            .setScale(UI.PYTEL.SCALE * scaleFactor, UI.PYTEL.SCALE * scaleFactor); // sjednoceno
}

    private createDesktopLayout(): void {
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = this.responsive.getScaleFactor(DESIGN.WIDTH, DESIGN.HEIGHT);

        const px = (x: number) => x * (gameWidth / DESIGN.WIDTH);
        const py = (y: number) => y * (gameHeight / DESIGN.HEIGHT);

        // Pozadí
        this.add.image(px(337), py(187), "freepik_forest_02")
            .setScale(0.582 * scaleFactor, 0.474 * scaleFactor);

        // Název hry
        this.add.text(px(377), py(61), "Virtuální CITO", {
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
        }).setOrigin(0.5).setScale(0.588 * scaleFactor, 0.522 * scaleFactor);

        // Podnadpis
        this.add.text(px(392), py(113), "GEOCACHING GAME", {
            fontFamily: "Arial Black",
            fontSize: 38 * scaleFactor + "px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8 * scaleFactor,
            align: "center"
        }).setOrigin(0.5);

        // Logo CITO
        this.add.image(px(370), py(193), "Cito_logo")
            .setScale(Math.min(0.15 * scaleFactor, gameWidth * UI.LOGO.SCALE));

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
                .setScale(.85* scaleFactor)
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
        this.add.image(px(107), py(218), "DivkaStoji")
            .setOrigin(0.5)
            .setScale(UI.MONINA.SCALE * scaleFactor);

        // Plný pytel
        this.add.image(px(604), py(264), "plnyPytel")
            .setOrigin(0.5)
            .setScale(UI.PYTEL.SCALE * scaleFactor, UI.PYTEL.SCALE * scaleFactor); // sjednoceno
    }

    private selectLang(lang: string): void {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
        const texts = this.cache.json.get(`lang-${lang}`);
        if (!texts) {
            localStorage.setItem('language', 'en');
            this.scene.restart();
            return;
        }
        this.scene.start('Intro', { texts, language: lang });
    }
}
