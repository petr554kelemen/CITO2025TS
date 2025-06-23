import Phaser from 'phaser';

export default class FullscreenZoomTestScene extends Phaser.Scene {
    private zoomLevel: number = 1;
    private zoomText!: Phaser.GameObjects.Text;
    private zoomInBtn!: Phaser.GameObjects.Text;
    private zoomOutBtn!: Phaser.GameObjects.Text;
    private fsBtn?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
    }

    preload() { }

    create() {
        const { width, height } = this.scale;

        // Vykresli obdélník rozdělený na 3 pruhy
        const colors = [0xff5555, 0x55ff55, 0x5555ff];
        for (let i = 0; i < 3; i++) {
            this.add.rectangle(
                width / 2,
                height / 6 + (i * height) / 3,
                width * 0.8,
                height / 3 - 10,
                colors[i]
            );
        }

        // Lupa + (zoom in)
        this.zoomInBtn = this.add.text(0, 0, '🔍+', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel + 0.1));

        // Lupa - (zoom out)
        this.zoomOutBtn = this.add.text(0, 0, '🔍-', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel - 0.1));

        // Zobrazení aktuálního zoomu
        this.zoomText = this.add.text(0, 0, `Zoom: ${this.zoomLevel.toFixed(2)}`, { fontSize: '20px', color: '#000' });

        // Fullscreen tlačítko vpravo nahoře (pokud je podporováno)
        if (this.scale.fullscreen.available) {
            this.fsBtn = this.add.text(0, 0, '⛶', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.scale.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                });
            this.fsBtn.setScrollFactor(0);
        }

        // Ujisti se, že UI prvky zůstávají na místě při zoomu
        this.cameras.main.ignore(
            [this.zoomInBtn, this.zoomOutBtn, this.zoomText, this.fsBtn].filter(
                (obj): obj is Phaser.GameObjects.Text => obj !== undefined
            )
        );

        // Umístění tlačítek podle velikosti okna
        this.positionUI();

        // Přepočítej pozice při změně velikosti
        this.scale.on('resize', () => this.positionUI());

        alert('Fullscreen available: ' + this.scale.fullscreen.available);
    }

    private positionUI() {
        const pad = 12;
        const { width, height } = this.scale.displaySize;

        // Lupa vlevo nahoře
        this.zoomInBtn.setPosition(width / 2, height / 2);
        this.zoomOutBtn.setPosition(pad, pad + 50);
        this.zoomText.setPosition(pad, pad + 100);

        // Fullscreen tlačítko vpravo nahoře
        if (this.fsBtn) {
            this.fsBtn.setPosition(width - this.fsBtn.width - pad, pad);
        }
    }

    setZoom(zoom: number) {
        this.zoomLevel = Phaser.Math.Clamp(zoom, 0.5, 2);
        this.cameras.main.setZoom(this.zoomLevel);
        this.zoomText.setText(`Zoom: ${this.zoomLevel.toFixed(2)}`);
    }
}