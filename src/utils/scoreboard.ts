import Phaser from "phaser";
import { UI } from "../config/constants";

export default class Scoreboard {
    private scene: Phaser.Scene;
    private total: number;
    private time: number;
    private texts: any;
    private correct: number = 0;
    private readonly bagIcons: Phaser.GameObjects.Image[] = [];
    private timerText: Phaser.GameObjects.Text;
    private timeLeft: number;
    private bg: Phaser.GameObjects.Rectangle;
    private timerLabelTemplate: string;

    constructor(
        scene: Phaser.Scene,
        odpadkyCount: number,
        timeLeft: number,
        texts?: { dialogSequence?: Record<string, string> }
    ) {
        this.scene = scene;
        this.total = odpadkyCount;
        this.timeLeft = timeLeft;
        this.texts = texts;

        // Lokalizovaná šablona pro časovač
        this.timerLabelTemplate =
            texts?.dialogSequence?.timerLabel || "Čas: {time}";

        // Zmenšené hodnoty pro menší scoreboard
        const ICON_SIZE = 32;
        const ICON_SCALE = 0.7;
        const ICON_SCALE_CORRECT = 0.9;
        const TIMER_FONT_SIZE = 16;
        const BOX_HEIGHT = 36;
        const LEFT_MARGIN = 12;
        const BOX_BG_COLOR = 0x222222;
        const BOX_BG_ALPHA = 0.7;

        const gameWidth = scene.scale.width;
        const boxWidth = Math.min(odpadkyCount * ICON_SIZE + 60, gameWidth - 20);
        const boxX = LEFT_MARGIN + boxWidth / 2;
        const boxY = 28;

        // Tmavý průhledný box pod scoreboard
        this.bg = scene.add.rectangle(
            boxX,
            boxY,
            boxWidth,
            BOX_HEIGHT,
            BOX_BG_COLOR,
            BOX_BG_ALPHA
        ).setOrigin(0.5).setScrollFactor(0).setDepth(0);

        // Ikony pytlů – zarovnáno vlevo v boxu
        const iconsStartX = boxX - boxWidth / 2 + ICON_SIZE / 2 + 4;
        for (let i = 0; i < odpadkyCount; i++) {
            const icon = scene.add.image(iconsStartX + i * ICON_SIZE, boxY, 'miniBag')
                .setScale(ICON_SCALE)
                .setAlpha(0.15)
                .setScrollFactor(0)
                .setDepth(1);
            this.bagIcons.push(icon);
        }

        // Timer zarovnaný vpravo v boxu
        this.timerText = scene.add.text(
            boxX + boxWidth / 2 - 6,
            boxY,
            this.timerLabelTemplate.replace("{time}", this.formatTime(this.timeLeft)),
            {
                fontSize: `${TIMER_FONT_SIZE}px`,
                color: '#7CFC00',
                fontFamily: 'Arial'
            }
        ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1);

        // Ulož hodnoty pro další použití
        (this as any).ICON_SCALE_CORRECT = ICON_SCALE_CORRECT;
    }

    public markCorrect(): void {
        const ICON_SCALE_CORRECT = (this as any).ICON_SCALE_CORRECT ?? 0.9;
        if (this.bagIcons[this.correct]) {
            this.bagIcons[this.correct]
                .setAlpha(1)
                .setScale(ICON_SCALE_CORRECT);
        }
        this.correct++;
    }

    public reset(): void {
        this.correct = 0;
        this.bagIcons.forEach(icon => icon.setAlpha(0.15).clearTint());
        this.setTime(this.timeLeft);
    }

    public setTime(timeLeft: number): void {
        this.timeLeft = Math.max(0, timeLeft); // nikdy pod 0
        let color = '#7CFC00';
        if (this.timeLeft <= 10) {
            color = '#FF3333'; // červená
        }
        const timeStr = this.formatTime(this.timeLeft);
        // Lokalizovaný zápis
        this.timerText.setText(
            this.timerLabelTemplate.replace("{time}", timeStr)
        );
        this.timerText.setColor(color);
    }

    private formatTime(seconds: number): string {
        const safeSeconds = Math.max(0, seconds);
        const min = Math.floor(safeSeconds / 60);
        const sec = safeSeconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    public isFull(): boolean {
        return this.correct >= this.bagIcons.length;
    }

    public getCorrectCount(): number {
        return this.correct;
    }

    public updateTime(timeLeft: number): void {
        this.setTime(timeLeft);
    }
}