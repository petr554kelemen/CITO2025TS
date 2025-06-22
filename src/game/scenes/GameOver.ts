// Scene: Zobrazení konce hry

import Phaser from "phaser";
import { COORDINATE } from "../../config/constants";

export default class GameOver extends Phaser.Scene {
    private coordsText: Phaser.GameObjects.Text | undefined;
    private texts: any; // <-- přidat

    constructor() {
        super("GameOver");
    }

    // Přidej metodu init pro načtení dat
    init(data: { texts?: any }) {
        this.texts = data.texts || {};
    }

    create() {
        // Nastavení tmavého pozadí (velmi tmavá šedá)
        this.cameras.main.setBackgroundColor("#181818");

        // Přidání backgroundu pergamen_bkg přes celou scénu
        this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "pergamen_bkg"
        )
        .setOrigin(0.5)
        .setDisplaySize(this.scale.width, this.scale.height);

        // Spojení souřadnic do dvou řádků

        // Vytvoření textového objektu pro souřadnice (začíná prázdný)
        this.coordsText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "??\n??",
            {
                fontFamily: COORDINATE.FONT_FAMILY,
                fontSize: `${COORDINATE.FONT_SIZE}px`,
                fill: "#" + COORDINATE.FILL.toString(16).padStart(6, "0"), // Phaser 3 používá "fill"
                align: "center"
            } as any // Přetypování pro TypeScript
        ).setOrigin(0.5);

        // Přidání symbolu "prst" jako nápovědy (bude sledovat pointer)
        const prst = this.add.image(
            this.scale.width / 2,
            this.scale.height - 80,
            "prst"
        )
        .setOrigin(0.5)
        .setScale(0.35)
        .setAlpha(0.85);

        // Sledování pozice pointeru
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            prst.x = pointer.x;
            prst.y = pointer.y;
        });

        // Přidání decentního klikacího textu pro opakování hry (místo tlačítka)
        const playAgainLabel = this.texts?.gameOver?.playAgain ?? "[playAgain]";
        const confirmResetMsg = this.texts?.gameOver?.confirmReset ?? "[confirmReset]";

        const playAgainText = this.add.text(
            this.scale.width / 2,
            this.scale.height - 60,
            playAgainLabel,
            {
                fontFamily: COORDINATE.FONT_FAMILY,
                fontSize: "18px",
                fill: "#1976d2",
                align: "center",
                fontStyle: "italic"
            } as any
        ).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        playAgainText.on("pointerdown", () => {
            if (localStorage.getItem("CITO2025_FINISHED")) {
                const confirmed = window.confirm(confirmResetMsg);
                if (!confirmed) return;
                localStorage.removeItem("CITO2025_FINISHED");
                localStorage.removeItem("cilSplnen");
                localStorage.removeItem("hraDokoncena");
            }
            // Resetuj hru a vrať se na hlavní menu
            this.scene.stop(this);
            this.scene.start("MainMenu");
        });

        // Animace odhalování souřadnic pohybem prstu/myši s efektem inkoustu (alpha)
        let revealProgress = 0; // 0..1
        let lastX = 0;
        let isPointerDown = false;

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            isPointerDown = true;
            lastX = pointer.x;
        });

        this.input.on("pointerup", () => {
            isPointerDown = false;
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (isPointerDown && revealProgress < 1) {
                const dx = Math.abs(pointer.x - lastX);
                lastX = pointer.x;
                revealProgress = Math.min(1, revealProgress + dx / (this.scale.width * 0.7));
                this.coordsText?.setAlpha(revealProgress);
            }
            // Po dokončení animace skryj prst
            if (revealProgress >= 1) {
                if (this.coordsText) {
                    this.coordsText.setAlpha(1);
                }
                prst.setVisible(false);
                playAgainText.setVisible(true); // zobraz decentní text až po odhalení souřadnic
            }
        });

        // Na začátku je text neviditelný
        this.coordsText.setText(`${COORDINATE.N}\n${COORDINATE.E}`);
        this.coordsText.setAlpha(0);

        // nebo až po odhalení souřadnic

        // Zajisti, že je text na vrchu
        this.children.bringToTop(playAgainText);

        // Volitelně: zvýrazni text při hoveru
        playAgainText.on("pointerover", () => {
            playAgainText.setStyle({ fill: "#0d47a1" }); // tmavší modrá
        });
        playAgainText.on("pointerout", () => {
            playAgainText.setStyle({ fill: "#1976d2" }); // původní barva
        });
    }
}
