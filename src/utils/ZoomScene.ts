import Phaser from 'phaser';
import CameraControlManager from './CameraControlManager';

export default class FullscreenZoomTestScene extends Phaser.Scene {
    private cameraControl!: CameraControlManager;

    constructor() {
        super({ key: 'FullscreenZoomTestScene' });
    }

    preload() {}

    create() {
        // Vytvoř 3 obdélníky pro testování posunu
        const { width, height } = this.scale;
        const stripes = 3;
        const COLORS = [0xff5555, 0x55ff55, 0x5555ff];
        for (let i = 0; i < stripes; i++) {
            this.add.rectangle(
                width / 2,
                height / (stripes * 2) + (i * height) / stripes,
                width * 0.8,
                height / stripes - 10,
                COLORS[i % COLORS.length]
            );
        }

        // Ovládání kamery, fullscreen, info pro iOS řeší CameraControlManager
        this.cameraControl = new CameraControlManager(this, {
            enableFullscreen: true,
            enableDragY: true,
            iosZoom: 0.8,
            infoTextIOS: '⚠️ Pro plnohodnotné hraní použij PC prohlížeč.\nNa iOS nemusí být vše viditelné.'
        });
    }
}