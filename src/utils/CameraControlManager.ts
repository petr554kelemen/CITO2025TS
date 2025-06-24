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
        CameraControlManager.loadMaterialSymbolsFont();
        this.init();
    }

    private static loadMaterialSymbolsFont() {
        if (this.fontLoaded) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0';
        document.head.appendChild(link);
        this.fontLoaded = true;
    }

    private init() {
        const { enableFullscreen = true, enableDragY = true, iosZoom = 0.8, infoTextIOS } = this.options;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Nastav zoom a info pro iOS
        if (isIOS && iosZoom < 1) {
            this.scene.cameras.main.setZoom(iosZoom);
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
                    const sceneHeight = this.scene.scale.height;
                    const maxScroll = Math.max(0, sceneHeight - this.scene.cameras.main.height);
                    this.scene.cameras.main.scrollY = Phaser.Math.Clamp(
                        this.scene.cameras.main.scrollY - deltaY,
                        0,
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