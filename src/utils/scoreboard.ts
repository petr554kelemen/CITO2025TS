import Phaser from "phaser";
import { UI } from "../config/constants";

export default class Scoreboard {
    private readonly bagIcons: Phaser.GameObjects.Image[] = [];
    private timerText!: Phaser.GameObjects.Text;
    private correctAnswers: number = 0;
    private timeLeft: number;

    constructor(scene: Phaser.Scene, odpadkyCount: number, timeLeft: number) {
        this.timeLeft = timeLeft;

        const gameWidth = scene.scale.width;
        const boxWidth = Math.min(odpadkyCount * UI.SCOREBOARD.ICON_SIZE + 80, gameWidth - 40);
        const boxHeight = 60;
        const boxX = UI.SCOREBOARD.LEFT_MARGIN + boxWidth / 2;
        const boxY = 48;

        // Tmavý box pod scoreboard
        scene.add.rectangle(
            boxX,
            boxY,
            boxWidth,
            boxHeight,
            UI.SCOREBOARD.BOX_BG_COLOR,
            UI.SCOREBOARD.BOX_BG_ALPHA
        ).setOrigin(0.5).setScrollFactor(0).setDepth(0);

        // Ikony pytlů – zarovnáno vlevo v boxu
        const iconsStartX = boxX - boxWidth / 2 + UI.SCOREBOARD.ICON_SIZE;
        for (let i = 0; i < odpadkyCount; i++) {
            const icon = scene.add.image(iconsStartX + i * UI.SCOREBOARD.ICON_SIZE, boxY, 'miniBag')
                .setScale(UI.SCOREBOARD.ICON_SCALE)
                .setAlpha(0.15)
                .setScrollFactor(0)
                .setDepth(1);
            this.bagIcons.push(icon);
        }

        // Timer zarovnaný vpravo v boxu
        this.timerText = scene.add.text(
            boxX + boxWidth / 2 - 10,
            boxY,
            `Čas: ${this.timeLeft}`,
            {
                fontSize: `${UI.SCOREBOARD.TIMER_FONT_SIZE}px`,
                color: UI.SCOREBOARD.TIMER_COLOR,
                fontFamily: 'Arial'
            }
        ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1);
    }

    public markCorrect(): void {
        if (this.bagIcons[this.correctAnswers]) {
            this.bagIcons[this.correctAnswers]
                .setAlpha(1)
                .setScale(UI.SCOREBOARD.ICON_SCALE_CORRECT);
        }
        this.correctAnswers++;
    }

    public updateTime(timeLeft: number): void {
        this.timeLeft = timeLeft;
        this.timerText.setText(`Čas: ${this.timeLeft}`);
    }

    public reset(): void {
        this.correctAnswers = 0;
        this.bagIcons.forEach(icon => icon.setAlpha(0.15).clearTint());
        this.updateTime(this.timeLeft);
    }

    public isFull(): boolean {
        return this.correctAnswers >= this.bagIcons.length;
    }

    public getCorrectAnswers(): number {
        return this.correctAnswers;
    }
}