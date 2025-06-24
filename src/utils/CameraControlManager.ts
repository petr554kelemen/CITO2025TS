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
    private static fontLoaded = false;

    constructor(
        private scene: Phaser.Scene,
        private options: CameraControlOptions = {}
    ) {
        this.init();
    }

    private init() {
        const { enableFullscreen = true, enableDragY = true, iosZoom = 0.8, infoTextIOS } = this.options;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Nastav zoom a info pro iOS
        if (isIOS && iosZoom < 1) {
            this.scene.cameras.main.setZoom(iosZoom);

            // Zarovnej scénu na střed ve vertikálním směru po zoomu
            const camera = this.scene.cameras.main;
            const sceneHeight = this.scene.scale.height;
            const viewHeight = camera.height / iosZoom;
            if (sceneHeight < viewHeight) {
                camera.scrollY = -(viewHeight - sceneHeight) / 2;
            } else {
                camera.scrollY = 0;
            }

            if (infoTextIOS) {
                this.scene.add.text(
                    this.scene.scale.width / 2,
                    24,
                    infoTextIOS,
                    {
                        fontSize: '18px',
                        color: '#fff',
                        backgroundColor: '#d00',
                        padding: { left: 8, right: 8, top: 4, bottom: 4 },
                        align: 'center'
                    }
                ).setOrigin(0.5, 0);
            }

            // Přidat tlačítka zoom_in a zoom_out (ikony PNG)
            const pad = 48;
            const btnSize = 48;
            const btnPlus = this.scene.add.image(this.scene.scale.width - pad, pad, 'zoom_in')
                .setOrigin(1, 0)
                .setDisplaySize(btnSize, btnSize)
                .setInteractive({ useHandCursor: true });

            const btnMinus = this.scene.add.image(this.scene.scale.width - pad, pad + btnSize + 8, 'zoom_out')
                .setOrigin(1, 0)
                .setDisplaySize(btnSize, btnSize)
                .setInteractive({ useHandCursor: true });

            btnPlus.on('pointerdown', () => {
                const camera = this.scene.cameras.main;
                camera.setZoom(Math.min(camera.zoom + 0.1, 1.2));
            });

            btnMinus.on('pointerdown', () => {
                const camera = this.scene.cameras.main;
                camera.setZoom(Math.max(camera.zoom - 0.1, 0.5));
            });
        }

        // Fullscreen tlačítko (ne na iOS)
        if (enableFullscreen && this.scene.scale.fullscreen.available && !isIOS) {
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