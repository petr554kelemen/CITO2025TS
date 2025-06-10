import Phaser from "phaser";

export default class Scoreboard {
    private readonly bagIcons: Phaser.GameObjects.Image[] = [];
    private timerText!: Phaser.GameObjects.Text;
    private correctAnswers: number = 0;
    private timeLeft: number;
    private timerLabelTemplate: string;

    constructor(scene: Phaser.Scene, odpadkyCount: number, timeLeft: number) {
        this.timeLeft = timeLeft;
        
        // Získej lokalizovaný text pro časovač
        const texts = (scene as any).texts || {};
        this.timerLabelTemplate = texts?.dialogSequence?.timerLabel || "Čas: {time}";

        // Rozměry a pozice boxu
        const boxWidth = odpadkyCount * 36 + 80;
        const boxHeight = 60;
        const boxX = 60 + boxWidth / 2; // více od kraje
        const boxY = 48;

        // Tmavý box pod scoreboard
        scene.add.rectangle(
            boxX,
            boxY,
            boxWidth,
            boxHeight,
            0x222222,
            0.8
        ).setOrigin(0.5).setScrollFactor(0).setDepth(0);

        // Ikony pytlů – zarovnáno vlevo v boxu
        const iconsStartX = boxX - boxWidth / 2 + 36;
        for (let i = 0; i < odpadkyCount; i++) {
            const icon = scene.add.image(iconsStartX + i * 36, boxY, 'miniBag')
                .setScale(0.32)
                .setAlpha(0.15)
                .setScrollFactor(0)
                .setDepth(1);
            this.bagIcons.push(icon);
        }

        // Timer text - použijeme lokalizovaný formát
        const initialTimerText = this.timerLabelTemplate.replace("{time}", this.timeLeft.toString());
        this.timerText = scene.add.text(
            boxX,
            boxY + 15,
            initialTimerText,
            {
                fontSize: '28px',
                color: '#f8f8f8',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1);
    }

    public markCorrect(): void {
        if (this.bagIcons[this.correctAnswers]) {
            this.bagIcons[this.correctAnswers]
                .setAlpha(1)
                .setScale(0.5);
        }
        this.correctAnswers++;
    }

    public updateTime(timeLeft: number): void {
        this.timeLeft = timeLeft;
        // Použij lokalizovaný formát
        this.timerText.setText(this.timerLabelTemplate.replace("{time}", this.timeLeft.toString()));
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