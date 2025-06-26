import Phaser from 'phaser';

export interface CameraControlOptions {
    enableFullscreen?: boolean;
    enableDragY?: boolean;
    iosZoom?: number;
    infoTextIOS?: string;
}

export default class CameraControlManager {
    private isDragging = false;
    private lastPointerY = 0;
    private fsBtn?: Phaser.GameObjects.Image;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly options: CameraControlOptions = {}
    ) {
        this.init();
    }

    private init() {
        const { enableFullscreen = true, enableDragY = true, iosZoom = 0.95, infoTextIOS } = this.options;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Vylepšená podpora pro iOS - místo zmenšování použijeme smart scaling
        if (isIOS) {
            // Použijeme mírně menší zoom pouze jako fallback
            this.scene.cameras.main.setZoom(iosZoom);

            // Vycentrujeme scénu
            const camera = this.scene.cameras.main;
            const sceneHeight = this.scene.scale.height;
            const viewHeight = camera.height / iosZoom;
            if (sceneHeight < viewHeight) {
                camera.scrollY = -(viewHeight - sceneHeight) / 2;
            } else {
                camera.scrollY = 0;
            }

            // Pozitivní zpráva místo negativní
            if (infoTextIOS) {
                const infoText = this.scene.add.text(
                    this.scene.scale.width / 2,
                    24,
                    infoTextIOS,
                    {
                        fontSize: '16px',
                        color: '#fff',
                        backgroundColor: 'rgba(0,100,200,0.8)', // Změna na pozitivní modrou
                        padding: { left: 12, right: 12, top: 6, bottom: 6 },
                        align: 'center'
                    }
                ).setOrigin(0.5, 0).setDepth(2000);

                // Auto-hide po 5 sekundách
                this.scene.time.delayedCall(5000, () => {
                    if (infoText?.active) {
                        this.scene.tweens.add({
                            targets: infoText,
                            alpha: 0,
                            duration: 1000,
                            onComplete: () => infoText.destroy()
                        });
                    }
                });
            }

            // Vylepšené zoom ovládání pro iOS
            this.addIOSZoomControls();
        }

        // Fullscreen tlačítko (dostupné i na iOS, ale s upozorněním)
        if (enableFullscreen && this.scene.scale.fullscreen.available) {
            this.fsBtn = this.scene.add.image(0, 0, 'fullscreen')
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.scene.scale.isFullscreen) {
                        this.scene.scale.stopFullscreen();
                    } else {
                        this.scene.scale.startFullscreen();
                    }
                });
            this.positionUI();
            this.scene.scale.on('resize', () => this.positionUI());
        }

        // Dragování v ose Y
        if (enableDragY) {
            this.addDragSupport();
        }
    }

    private addIOSZoomControls() {
        const pad = 48;
        const btnSize = 48;
        const btnPlus = this.scene.add.image(this.scene.scale.width - pad, pad, 'zoom_in')
            .setOrigin(1, 0)
            .setDisplaySize(btnSize, btnSize)
            .setInteractive({ useHandCursor: true })
            .setDepth(1999);

        const btnMinus = this.scene.add.image(this.scene.scale.width - pad, pad + btnSize + 8, 'zoom_out')
            .setOrigin(1, 0)
            .setDisplaySize(btnSize, btnSize)
            .setInteractive({ useHandCursor: true })
            .setDepth(1999);

        // Smooth zoom s animací
        btnPlus.on('pointerdown', () => {
            const camera = this.scene.cameras.main;
            const newZoom = Math.min(camera.zoom + 0.1, 1.2);
            this.scene.tweens.add({
                targets: camera,
                zoom: newZoom,
                duration: 200,
                ease: 'Power2'
            });
        });

        btnMinus.on('pointerdown', () => {
            const camera = this.scene.cameras.main;
            const newZoom = Math.max(camera.zoom - 0.1, 0.6);
            this.scene.tweens.add({
                targets: camera,
                zoom: newZoom,
                duration: 200,
                ease: 'Power2'
            });
        });
    }

    private addDragSupport() {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.lastPointerY = pointer.y;
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.lastPointerY;
                this.lastPointerY = pointer.y;
                const camera = this.scene.cameras.main;
                const zoom = camera.zoom;
                const sceneHeight = this.scene.scale.height;
                const viewHeight = camera.height / zoom;
                // Výška scény mínus výška viewportu po zoomu
                const scrollRange = sceneHeight - viewHeight;
                // Pokud je scéna menší než viewport, scrollRange bude záporný
                // Chceme umožnit scroll od 0 (horní okraj) až po zápornou hodnotu (spodní okraj)
                const minScroll = Math.min(0, -scrollRange);
                const maxScroll = 0;
                camera.scrollY = Phaser.Math.Clamp(
                    camera.scrollY - deltaY,
                    minScroll,
                    maxScroll
                );
            }
        });
    }

    private positionUI() {
        if (this.fsBtn) {
            const pad = 32;
            const { width } = this.scene.scale.displaySize;
            this.fsBtn.setOrigin(1, .5);
            this.fsBtn.setPosition(width - pad, pad);
        }
    }
}