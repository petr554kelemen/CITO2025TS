import Phaser from 'phaser';
import DialogManager from '../../utils/DialogManager';
import ResponsiveManager from '../../utils/ResponsiveManager';
import CameraControlManager from '../../utils/CameraControlManager';
import { UI, DEBUG_MODE } from '../../config/constants';

type Odpadek = {
    typ: string;
    x: number;
    y: number;
    scale?: number;
    angle?: number;
    sprite?: Phaser.GameObjects.Sprite | null;
};

type DialogTexts = {
    dialogSequence: Record<string, string>;
    dialogGameSequence?: Record<string, string>;
};

export default class Intro extends Phaser.Scene {
    private dialog!: DialogManager;
    private responsive!: ResponsiveManager;
    private cameraControl!: CameraControlManager;

    private readonly odpadkyData: Odpadek[] = [
        { typ: "Karton", x: 359, y: 243, scale: 0.6 },
        { typ: "Plechovka", x: 475, y: 278, scale: 0.6 },
        { typ: "Lahev", x: 427, y: 253, scale: 0.6 },
        { typ: "Baterie", x: 372, y: 304, scale: 0.6 },
        { typ: "Zvykacka", x: 539, y: 254, scale: 0.5 },
        { typ: "Kapesnik", x: 305, y: 329, scale: 0.6 },
        { typ: "Ohryzek", x: 188, y: 344, scale: 0.6, angle: 82 },
        { typ: "Banan", x: 285, y: 268, scale: 0.6 },
        { typ: "Vajgl", x: 436, y: 326, scale: 0.5 },
        { typ: "PET", x: 213, y: 307, scale: 0.6, angle: -63 }
    ];

    private background!: Phaser.GameObjects.Image;
    private motyl!: Phaser.GameObjects.Sprite;
    private duch!: Phaser.GameObjects.Sprite;
    private pytel!: Phaser.GameObjects.Sprite;
    //private citoLogo!: Phaser.GameObjects.Image;
    private prevX: number = 0;
    private lang: any;
    private texts!: DialogTexts;

    constructor() {
        super("Intro");
    }

    init(data: { texts: DialogTexts; language: string }): void {
        this.texts = data.texts;
        this.lang = data.language;
    }

    create(): void {
        this.responsive = new ResponsiveManager(this);
        this.responsive.checkAndForceOrientation();

        this.dialog = new DialogManager(this, this.texts);

        // Přidej CameraControlManager
        this.cameraControl = new CameraControlManager(this, {
            enableFullscreen: true,
            enableDragY: false, // nebo true, pokud chceš povolit posun
            iosZoom: 0.95,
            infoTextIOS: "📱 Hra je optimalizována pro mobilní zařízení!"
        });

        if (DEBUG_MODE) {
            this.responsive.addDebugOverlay();
            console.log('Intro scene initialized. Camera control:', !!this.cameraControl);
            console.log('Helper methods available:', typeof this.doFlip, typeof this.px, typeof this.py);
        }

        // Výpočet scaleFactor a převodních funkcí
        const { width: gameWidth, height: gameHeight } = this.scale;
        const scaleFactor = Math.min(gameWidth / 667, gameHeight / 375);
        const px = (x: number) => Math.round(gameWidth * (x / 667));
        const py = (y: number) => Math.round(gameHeight * (y / 375));

        // Pozadí
        this.background = this.add.image(gameWidth / 2, gameHeight / 2, "freepik_forest_01");
        const scaleX = gameWidth / this.background.width;
        const scaleY = gameHeight / this.background.height;
        this.background.setScale(Math.max(scaleX, scaleY));
        this.background.setDepth(-1);

        // --- Duch ---
        const duchX = px(153);
        const duchY = py(132);
        this.duch = this.add.sprite(duchX, duchY, "Duch")
            .setScale(0.6 * scaleFactor)
            .setAlpha(0);

        // Odpadky
        this.odpadkyData.forEach(odpadek => {
            odpadek.sprite = this.add.sprite(
                px(odpadek.x),
                py(odpadek.y),
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale * scaleFactor);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
        });

        // Pytel (počáteční stav)
        this.pytel = this.add.sprite(gameWidth * 0.85, gameHeight * 0.88, 'prazdnyPytel').setInteractive();
        this.pytel.setScale(UI.PYTEL.SCALE * scaleFactor);
        this.pytel.setOrigin(0.5);

        // --- Motýlí animace ---
        this.createMotylAndAnimate(px, py, scaleFactor, duchX, duchY);

        this.input.once('pointerdown', () => {
            this.skipIntro();
        });

        if (localStorage.getItem("CITO2025_FINISHED")) {
            this.scene.start("GameOver", { texts: this.texts });
        }
    }

    // Refaktorovaná metoda pro motýla a jeho animaci
    private createMotylAndAnimate(
        px: (x: number) => number,
        py: (y: number) => number,
        scaleFactor: number,
        duchX: number,
        duchY: number
    ): void {
        // Motýl startuje v dálce, malý scale
        const motylStartX = px(506);
        const motylStartY = py(233);
        this.motyl = this.add.sprite(motylStartX, motylStartY, 'motyl')
            .setScale(0.1)
            .setDepth(100);

        // Výběr 4 náhodných odpadků
        const shuffled = Phaser.Utils.Array.Shuffle(this.odpadkyData.slice());
        const points = shuffled.slice(0, 4).map(o => ({ x: px(o.x), y: py(o.y) }));

        // Přidej cílový bod u ducha s rozestupem
        const offsetX = Math.round(120 * scaleFactor);
        const offsetY = Math.round(40 * scaleFactor);
        const duchCilX = duchX + offsetX;
        const duchCilY = duchY + offsetY;

        // První tween: motýl se přiblíží k prvnímu odpadku a zvětší se
        this.tweens.add({
            targets: this.motyl,
            x: points[0].x,
            y: points[0].y,
            scale: 0.6 * scaleFactor,
            duration: 2800,
            ease: 'Power2',
            onComplete: () => {
                this.dialog.showDialogAboveAndDelay('motyl-00', this.motyl, -60).then(() => {
                    const tweens = [
                        ...points.slice(1).map(p => ({
                            targets: this.motyl,
                            x: p.x,
                            y: p.y,
                            duration: 1200,
                            ease: 'Power2',
                            onStart: () => {
                                this.dialog.showDialogAboveAndDelay('motyl-00', this.motyl, -60);
                            }
                        })),
                        {
                            targets: this.motyl,
                            x: duchCilX,
                            y: duchCilY,
                            duration: 2800,
                            ease: 'Power2'
                        }
                    ];

                    this.tweens.chain({
                        tweens,
                        onComplete: () => {
                            this.volejDucha();
                        }
                    });
                });
            }
        });

        this.input.once('pointerdown', () => {
            this.skipIntro();
        });
    }

    // Metoda pro zjevení ducha a spuštění dialogu
    private volejDucha(): void {
        this.duch.setVisible(true);
        this.duch.setScale(0.6 * this.responsive.getScaleFactor(667, 375));
        this.tweens.add({
            targets: this.duch,
            alpha: 0.9,
            duration: 1200,
            onStart: () => {
                if (this.dialog && typeof this.dialog.hideDialog === 'function') {
                    this.dialog.hideDialog();
                }
            },
            onComplete: () => {
                this.motyl.setFlipX(false);
                this.dialogMotylDuch();
            }
        });
    }

    private doFlip(objekt: Phaser.GameObjects.Image): void {
        this.tweens.add({
            targets: objekt,
            angle: objekt.angle + 15,
            duration: 300,
            ease: 'Quad.easeInOut',
            yoyo: true
        });
    }

    async dialogMotylDuch(): Promise<void> {
        const sequence = [
            { key: 'motyl-01', obj: this.motyl },
            { key: 'duch-01', obj: this.duch },
            { key: 'motyl-02', obj: this.motyl },
            { key: 'duch-02', obj: this.duch },
            { key: 'motyl-03', obj: this.motyl },
            { key: 'duch-03', obj: this.duch }
        ];

        for (const item of sequence) {
            await this.dialog.showDialogAboveAndDelay(item.key, item.obj, -60);
        }

        this.endIntroScene();
    }

    private endIntroScene(): void {
        this.tweens.add({
            targets: this.duch,
            alpha: 0,
            duration: 3000,
            onComplete: () => {
                this.duch.setVisible(false);
            }
        });

        this.tweens.add({
            targets: this.motyl,
            x: 1200,
            y: -100,
            duration: 2500,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.startGameScene();
                });
            }
        });
    }

    private skipIntro(): void {
        this.input.enabled = false;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.startGameScene();
        });
    }

    private startGameScene(): void {
        // Převeď odpadky na strukturu s pozice: {x, y}
        const odpadkyDataForGame = this.odpadkyData.map(o => ({
            typ: o.typ,
            pozice: { x: o.x, y: o.y },
            scale: o.scale,
            angle: o.angle,
            sprite: undefined,
            inPytel: false
        }));

        this.scene.start('Game', {
            odpadkyData: odpadkyDataForGame,
            language: this.lang,      // <-- předáváme jazyk samostatně
            texts: { ...this.texts, language: this.lang } // <-- přidáme language do texts
        });
    }

    update(): void {
        if (!this.motyl) return;
        const curX = this.motyl.x;

        if (this.dialog && typeof this.dialog.updateBubblePosition === 'function') {
            this.dialog.updateBubblePosition();
        }

        if (curX > this.prevX) {
            this.motyl.setFlipX(true);
        } else if (curX < this.prevX) {
            this.motyl.setFlipX(false);
        }

        this.prevX = curX;
    }

    private px(x: number): number {
        return Math.round(this.scale.width * (x / 667));
    }
    private py(y: number): number {
        return Math.round(this.scale.height * (y / 375));
    }

}
