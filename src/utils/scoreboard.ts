import Phaser from "phaser";

export default class Scoreboard {
    private readonly bagIcons: Phaser.GameObjects.Image[] = [];
    private timerText!: Phaser.GameObjects.Text;
    private correctAnswers: number = 0;
    private timeLeft: number;
    
    constructor(scene: Phaser.Scene, odpadkyCount: number, timeLeft: number) {
        this.timeLeft = timeLeft;

        // Vykresli pytle
        for (let i = 0; i < odpadkyCount; i++) {
            const icon = scene.add.image(32 + i * 36, 40, 'miniBag')
                .setScale(0.32)
                .setAlpha(0.15)
                .setScrollFactor(0);
            this.bagIcons.push(icon);
        }
        this.timerText = scene.add.text(32, 70, `Čas: ${this.timeLeft}`, {
            fontSize: '28px',
            color: '#222',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
    }

    public markCorrect(): void {
        if (this.bagIcons[this.correctAnswers]) {
            this.bagIcons[this.correctAnswers]
                .setAlpha(1)
                .setTint(0x4caf50); // zelený pytel
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
}