// Scene: Zobrazení konce hry

import Phaser from "phaser";
import ResponsiveManager, { LayoutType } from '../../utils/ResponsiveManager';
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {
    private texts: any;
    private responsive!: ResponsiveManager;

    constructor() {
        super("GameOver");
    }

    init(data: { texts: any }) {
        this.texts = data.texts;
    }

    private createMobileLayout(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Pergamen
        const pergamen_bkg = this.add.image(centerX, centerY, "pergamen_bkg");
        pergamen_bkg.setScale(Math.min(0.85, gameWidth * 0.0025), Math.min(0.71, gameHeight * 0.004));

        // Souřadnice
        const coordsText = "N 50°10.391\nE 017°36.226";
        const coords = this.add.text(centerX, centerY, coordsText, {
            fontFamily: "Merienda, Arial, sans-serif",
            fontSize: Math.min(40, gameWidth * 0.07) + "px",
            color: "#207a1e",
            align: "center",
            stroke: "#ffe066",
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: "#ffb300", blur: 8, fill: true }
        }).setOrigin(0.5);
        coords.setAlpha(0.05);

        // Prst
        const prst_1 = this.add.image(centerX + gameWidth * 0.34, centerY + gameHeight * 0.22, "prst");
        prst_1.setScale(Math.min(0.85, gameWidth * 0.0015));
        prst_1.setDepth(10).setVisible(true);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            prst_1.setPosition(pointer.x, pointer.y);

            if (coords.getBounds().contains(pointer.x, pointer.y)) {
                if (coords.alpha < 1) {
                    coords.setAlpha(Math.min(1, coords.alpha + 0.004));
                }
            }

            if (coords.alpha >= 1) {
                prst_1.setVisible(false);
            }
        });

        // Drobnější text dole
        this.add.text(centerX, gameHeight * 0.92, "Stav dokončení je uložen, souřadnice lze zobrazit kdykoliv znovu.", {
            fontFamily: "Arial",
            fontSize: Math.min(14, gameWidth * 0.025) + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Tlačítko "Zahrát znovu"
        const playAgainText = this.texts?.gameOver?.playAgain ?? "Zahrát znovu";
        const confirmResetText = this.texts?.gameOver?.confirmReset ?? "Opravdu chcete začít znovu?\nTímto smažete uložené souřadnice a budete muset hru znovu úspěšně dokončit!";
        const btn = this.add.text(centerX, centerY + gameHeight * 0.18, playAgainText, {
            fontFamily: "Arial Black",
            fontSize: Math.min(22, gameWidth * 0.04) + "px",
            color: "#1565c0",
            backgroundColor: "#fff",
            padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            const confirmed = window.confirm(confirmResetText);
            if (confirmed) {
                localStorage.removeItem('cito2025_success');
                this.scene.start('Intro');
            }
        });

        // Informace o uložení hry
        const infoText = this.texts.dialogSequence?.gameSavedInfo || "Tvůj postup byl uložen. Můžeš se vrátit později.";
        this.add.text(centerX, centerY + gameHeight * 0.22, infoText, {
            font: Math.min(14, gameWidth * 0.025) + "px Arial",
            color: "#fff"
        }).setOrigin(0.5);
    }

    private createDesktopLayout(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Pergamen
        const pergamen = this.add.image(centerX, centerY, "pergamen_bkg");
        pergamen.setScale(Math.min(1.2, gameWidth * 0.0025));

        // Souřadnice
        const coordsText = "N 50°10.391\nE 017°36.226";
        const coords = this.add.text(centerX, centerY, coordsText, {
            fontFamily: "Merienda, Arial, sans-serif",
            fontSize: Math.min(72, gameWidth * 0.11) + "px",
            color: "#207a1e",
            align: "center",
            stroke: "#ffe066",
            strokeThickness: 10,
            shadow: { offsetX: 2, offsetY: 2, color: "#ffb300", blur: 12, fill: true }
        }).setOrigin(0.5);
        coords.setAlpha(0.05);

        // Prst
        const finger = this.add.image(centerX, centerY + gameHeight * 0.28, "prst");
        finger.setScale(Math.min(0.5, gameWidth * 0.001));
        finger.setDepth(10).setVisible(true);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            finger.setPosition(pointer.x, pointer.y);

            if (coords.getBounds().contains(pointer.x, pointer.y)) {
                if (coords.alpha < 1) {
                    coords.setAlpha(Math.min(1, coords.alpha + 0.0025));
                }
            }

            if (coords.alpha >= 1) {
                finger.setVisible(false);
            }
        });

        // Drobnější text dole
        this.add.text(centerX, gameHeight * 0.92, "Stav dokončení je uložen, souřadnice lze zobrazit kdykoliv znovu.", {
            fontFamily: "Arial",
            fontSize: Math.min(20, gameWidth * 0.03) + "px",
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Tlačítko "Zahrát znovu"
        const playAgainText = this.texts?.gameOver?.playAgain ?? "Zahrát znovu";
        const confirmResetText = this.texts?.gameOver?.confirmReset ?? "Opravdu chcete začít znovu?\nTímto smažete uložené souřadnice a budete muset hru znovu úspěšně dokončit!";
        const btn = this.add.text(centerX, centerY + gameHeight * 0.34, playAgainText, {
            fontFamily: "Arial Black",
            fontSize: Math.min(32, gameWidth * 0.05) + "px",
            color: "#1565c0",
            backgroundColor: "#fff",
            padding: { left: 20, right: 20, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            const confirmed = window.confirm(confirmResetText);
            if (confirmed) {
                localStorage.removeItem('cito2025_success');
                this.scene.start('Intro');
            }
        });

        // Informace o uložení hry
        const infoText = this.texts.dialogSequence?.gameSavedInfo || "Tvůj postup byl uložen. Můžeš se vrátit později.";
        this.add.text(centerX, centerY + gameHeight * 0.38, infoText, {
            font: Math.min(18, gameWidth * 0.025) + "px Arial",
            color: "#fff"
        }).setOrigin(0.5);
    }

    // Inicializace scény
    create() {
        this.cameras.main.setBackgroundColor(0x222222);

        // Inicializace ResponsiveManager
        //this.responsive = new ResponsiveManager(this);
        // Přidej do metody create() každé scény po inicializaci ResponsiveManager
        this.responsive = new ResponsiveManager(this);
        this.responsive.checkAndForceOrientation();

        // Debug info pro ladění
        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
        }

        // Efekt: zoom + fade-in
        this.cameras.main.setZoom(0.5);
        this.cameras.main.fadeIn(1200, 0, 0, 0);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 1200,
            ease: 'Quad.easeOut'
        });

        // Použij isMobile() pro výběr layoutu
        if (this.responsive.isMobile()) {
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

            // Vytvoř nový layout
            if (layout === LayoutType.MOBILE) {
                this.createMobileLayout();
            } else {
                this.createDesktopLayout();
            }
        });
    }
}
