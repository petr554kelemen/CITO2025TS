import Phaser from 'phaser';

export default class FullscreenZoomTestScene extends Phaser.Scene {
    private fsBtn?: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
    }

    preload() {
        // Pokud už je obrázek načten v asset packu, není třeba znovu načítat
        // this.load.image('fullscreen', 'assets/fullscreen.png');
    }

    create() {
        const { width, height } = this.scale;

        // Okraj a barvy
        const border = 8;
        const fillColor = 0x55aaff;
        const borderColor = 0x003366;

        // Vyplň celou scénu obdélníkem s okrajem
        this.add.rectangle(
            width / 2,
            height / 2,
            width - border,
            height - border,
            fillColor
        ).setStrokeStyle(border, borderColor);

        // Ovládací prvek fullscreen (obrázek) – vždy dostupný
        this.fsBtn = this.add.image(width - 32, 32, 'fullscreen')
            .setOrigin(1, 0)
            .setScale(0.7)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });

        // Přepočítej pozici při změně velikosti
        this.scale.on('resize', () => this.positionUI());

        // Pro test: info o rozměrech
        this.add.text(width / 2, height - 24, `Rozměry: ${width} x ${height}`, {
            fontSize: '18px',
            color: '#fff',
            backgroundColor: '#003366'
        }).setOrigin(0.5, 1);
    }

    private positionUI() {
        const { width } = this.scale;
        if (this.fsBtn) {
            this.fsBtn.setPosition(width - 32, 32);
        }
    }
}