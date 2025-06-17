// Scene: Zobrazení konce hry

import Phaser from "phaser";
import { UI } from "../../config/constants";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    create(data: any) {
        const { width: gameWidth, height: gameHeight } = this.scale;
        const scaleFactor = Math.min(gameWidth / 667, gameHeight / 375);
        const px = (x: number) => Math.round(gameWidth * (x / 667));
        const py = (y: number) => Math.round(gameHeight * (y / 375));

        // Pozadí
        const background = this.add.image(gameWidth / 2, gameHeight / 2, "freepik_forest_01");
        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        background.setScale(Math.max(scaleX, scaleY));
        background.setDepth(-1);

        // Tmavý overlay (volitelně)
        this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x222222, 0.7);

        // Pergamen
        const pergamen = this.add.image(gameWidth / 2, gameHeight / 2 - 60, "Pergamen")
            .setOrigin(0.5)
            .setScale(0.7 * scaleFactor);

        // Text výhra/prohra
        const isSuccess = data?.texts?.gameOverSuccess ?? false;
        const mainText = isSuccess ? "Gratulujeme!" : "Konec hry";
        const subText = isSuccess
            ? "Splnil jsi CITO výzvu!"
            : "Zkus to znovu a nasbírej víc správných odpovědí.";

        this.add.text(px(333), py(160), mainText, {
            fontFamily: "Barrio",
            fontSize: `${UI.QUIZ.QUESTION_FONT * 2}px`,
            color: UI.COLORS.QUESTION,
            align: "center",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(px(333), py(220), subText, {
            fontFamily: "Arial",
            fontSize: `${UI.QUIZ.OPTION_FONT + 4}px`,
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Tlačítko zpět na menu
        const btn = this.add.text(px(333), py(300), "Zpět na hlavní menu", {
            fontFamily: "Arial",
            fontSize: `${UI.QUIZ.OPTION_FONT + 2}px`,
            color: "#fff",
            backgroundColor: UI.COLORS.HINT_BG,
            padding: UI.QUIZ.OPTION_PADDING
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btn.on("pointerup", () => {
            this.scene.start("MainMenu");
        });
    }
}
