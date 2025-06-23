import Phaser from 'phaser';
import { DEBUG_MODE } from '../config/constants';

/**
 * Testovací scéna pro posun kamery v ose Y a fullscreen režim.
 * Ovládací prvek fullscreen je vpravo nahoře.
 */
export default class FullscreenZoomTestScene extends Phaser.Scene {
    private fsBtn?: Phaser.GameObjects.Text;
    private isDragging = false;
    private lastPointerY = 0;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
    }

    preload() {}

    create() {
        this.createStripes();
        this.createUI();
        this.positionUI();

        // Drag posun kamery v ose Y
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.lastPointerY = pointer.y;
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.lastPointerY;
                this.lastPointerY = pointer.y;
                // Posuň kameru, omez na rozsah scény
                const maxScroll = Math.max(0, this.scale.height - this.cameras.main.height);
                this.cameras.main.scrollY = Phaser.Math.Clamp(
                    this.cameras.main.scrollY - deltaY,
                    0,
                    maxScroll
                );
            }
        });

        // Přepočítej pozici fullscreen tlačítka při změně velikosti
        this.scale.on('resize', () => this.positionUI());

        if (DEBUG_MODE) {
            console.log('FullscreenZoomTestScene created');
        }
    }

    /**
     * Vykreslí 3 vodorovné pruhy pro testování posunu a fullscreen režimu.
     */
    private createStripes() {
        const { width, height } = this.scale;
        const COLORS = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55, 0x55ffff];
        const stripes = 5; // počet pruhů
        for (let i = 0; i < stripes; i++) {
            this.add.rectangle(
                width / 2,
                height / (stripes * 2) + (i * height) / stripes,
                width * 0.8,
                height / stripes - 10,
                COLORS[i % COLORS.length]
            );
        }

        // Přidej text POD poslední pruh (níže než je výška scény)
        this.add.text(
            width / 2,
            height + 40, // 40px pod spodní okraj scény
            'Toto je text pod posledním pruhem!',
            { fontSize: '28px', color: '#000', backgroundColor: '#fff' }
        ).setOrigin(0.5, 0);
    }

    /**
     * Vytvoří pouze fullscreen ovládací prvek.
     */
    private createUI() {
        // Detekce iOS zařízení
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (this.scale.fullscreen.available && !isIOS) {
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
     * Umístí fullscreen tlačítko do pravého horního rohu.
     */
    private positionUI() {
        const pad = 16;
        const { width } = this.scale.displaySize;
        if (this.fsBtn) {
            this.fsBtn.setPosition(width - this.fsBtn.width - pad, pad);
        }
    }
}