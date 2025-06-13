// Scene: Zobrazení konce hry

import Phaser from "phaser";
import { UI } from "../../config/constants";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    create(data: any) {
        const { width: gameWidth, height: gameHeight } = this.scale;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Pozadí
        this.add.rectangle(centerX, centerY, gameWidth, gameHeight, 0x222222, 0.7);

        // Pergamen (výhra)
        const pergamen = this.add.image(centerX, centerY - 60, "Pergamen")
            .setOrigin(0.5)
            .setScale(0.7); // Pokud chceš, přidej do UI např. UI.PERGAMEN.SCALE

        // Text výhra/prohra
        const isSuccess = data?.texts?.gameOverSuccess ?? false;
        const mainText = isSuccess ? "Gratulujeme!" : "Konec hry";
        const subText = isSuccess
            ? "Splnil jsi CITO výzvu!"
            : "Zkus to znovu a nasbírej víc správných odpovědí.";

        this.add.text(centerX, centerY + 60, mainText, {
            fontFamily: "Barrio",
            fontSize: `${UI.QUIZ.QUESTION_FONT * 2}px`,
            color: UI.COLORS.QUESTION,
            align: "center",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 120, subText, {
            fontFamily: "Arial",
            fontSize: `${UI.QUIZ.OPTION_FONT + 4}px`,
            color: "#fff",
            align: "center"
        }).setOrigin(0.5);

        // Tlačítko zpět na menu
        const btn = this.add.text(centerX, centerY + 200, "Zpět na hlavní menu", {
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
