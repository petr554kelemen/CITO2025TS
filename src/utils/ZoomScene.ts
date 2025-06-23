import Phaser from 'phaser';
import { DEBUG_MODE } from '../config/constants';

/**
 * Testovací scéna pro přepínání mezi fullscreen a zoom režimem.
 * Ovládací prvky jsou v horní části obrazovky.
 */
export default class FullscreenZoomTestScene extends Phaser.Scene {
    private zoomLevel: number = 1;
    private zoomText!: Phaser.GameObjects.Text;
    private zoomInBtn!: Phaser.GameObjects.Text;
    private zoomOutBtn!: Phaser.GameObjects.Text;
    private fsBtn?: Phaser.GameObjects.Text;

    private readonly MIN_ZOOM = 0.65;
    private readonly MAX_ZOOM = 1.05;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
        this.zoomLevel = 0.85; // výchozí zoom pro MT
    }

    preload() {}

    create() {
        this.createStripes();
        this.createUI();
        this.positionUI();
        this.cameras.main.setZoom(this.zoomLevel);

        // Přepočítej pozice při změně velikosti
        this.scale.on('resize', () => this.positionUI());

        if (DEBUG_MODE) {
            console.log('FullscreenZoomTestScene created');
        }
    }

    /**
     * Vykreslí 3 vodorovné pruhy pro testování zoomu a fullscreen režimu.
     */
    private createStripes() {
        const { width, height } = this.scale;
        const COLORS = [0xff5555, 0x55ff55, 0x5555ff];
        for (let i = 0; i < 3; i++) {
            this.add.rectangle(
                width / 2,
                height / 6 + (i * height) / 3,
                width * 0.8,
                height / 3 - 10,
                COLORS[i]
            );
        }
    }

    /**
     * Vytvoří ovládací prvky pro zoom a fullscreen.
     */
    private createUI() {
        const { width } = this.scale;
        // Zoom in tlačítko
        this.zoomInBtn = this.add.text(0, 0, '＋', {
            fontSize: '28px',
            backgroundColor: '#f00',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel + 0.1));

        // Zoom out tlačítko
        this.zoomOutBtn = this.add.text(0, 0, '－', {
            fontSize: '28px',
            backgroundColor: '#fff',
            color: '#000',
            fontFamily: 'Arial, sans-serif'
        })
            .setInteractive()
            .on('pointerdown', () => this.setZoom(this.zoomLevel - 0.1));

        // Zobrazení aktuálního zoomu
        this.zoomText = this.add.text(0, 0, `Zoom: ${this.zoomLevel.toFixed(2)}`, {
            fontSize: '20px',
            color: '#000',
            fontFamily: 'Arial, sans-serif'
        });

        // Fullscreen tlačítko vpravo nahoře (pokud je podporováno)
        if (this.scale.fullscreen.available) {
            this.fsBtn = this.add.text(0, 0, '⛶', {
                fontSize: '32px',
                backgroundColor: '#fff',
                color: '#000',
                fontFamily: 'Arial, sans-serif'
            })
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.scale.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                });
        }
    }

    /**
     * Umístí ovládací prvky do horní části obrazovky.
     */
    private positionUI() {
        const pad = 16;
        const { width } = this.scale.displaySize;

        // Rozmístění tlačítek v horní části
        this.zoomInBtn.setPosition(width / 2 - 80, pad);
        this.zoomOutBtn.setPosition(width / 2 + 20, pad);
        this.zoomText.setPosition(width / 2 - 30, pad + 60);

        if (this.fsBtn) {
            this.fsBtn.setPosition(width - this.fsBtn.width - pad, pad);
        }
    }

    /**
     * Nastaví zoom hlavní kamery a aktualizuje text.
     * @param zoom Nová hodnota zoomu (omezeno na 0.5–2)
     */
    setZoom(zoom: number) {
        this.zoomLevel = Phaser.Math.Clamp(zoom, this.MIN_ZOOM, this.MAX_ZOOM);
        this.cameras.main.setZoom(this.zoomLevel);
        this.zoomText.setText(`Zoom: ${this.zoomLevel.toFixed(2)}`);
        this.positionUI();

        if (DEBUG_MODE) {
            console.log('Zoom set to', this.zoomLevel);
        }
    }
}