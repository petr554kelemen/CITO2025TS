import Phaser from 'phaser';

export default class FullscreenZoomTestScene extends Phaser.Scene {
    private zoomLevel: number = 1;
    private zoomText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
    }

    preload() {}

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
        const zoomInBtn = this.add.text(20, 20, '🔍+', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel + 0.1));

        // Lupa - (zoom out)
        const zoomOutBtn = this.add.text(20, 70, '🔍-', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel - 0.1));

        // Zobrazení aktuálního zoomu
        this.zoomText = this.add.text(20, 120, `Zoom: ${this.zoomLevel.toFixed(2)}`, { fontSize: '20px', color: '#000' });

        // Fullscreen tlačítko vpravo nahoře (pokud je podporováno)
        if (this.scale.fullscreen.available) {
            const fsBtn = this.add.text(width - 60, 20, '⛶', { fontSize: '32px', backgroundColor: '#fff', color: '#000' })
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.scale.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                });
            fsBtn.setScrollFactor(0);
        }

        // Ujisti se, že UI prvky zůstávají na místě při zoomu
        this.cameras.main.ignore([zoomInBtn, zoomOutBtn, this.zoomText]);
    }

    setZoom(zoom: number) {
        this.zoomLevel = Phaser.Math.Clamp(zoom, 0.5, 2);
        this.cameras.main.setZoom(this.zoomLevel);
        this.zoomText.setText(`Zoom: ${this.zoomLevel.toFixed(2)}`);
    }
}