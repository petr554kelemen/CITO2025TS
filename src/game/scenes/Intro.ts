import Phaser from 'phaser';
import DialogManager from '../../utils/DialogManager';
import ResponsiveManager from '../../utils/ResponsiveManager';
import { UI } from '../../config/constants';

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

    private odpadkyData: Odpadek[] = [
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

        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
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
            .setScale(0.6 * scaleFactor) // zvětšeno, aby duch byl výrazný
            .setAlpha(0);

        // --- Motýl startuje v dálce, malý scale ---
        const motylStartX = px(506);
        const motylStartY = py(233);
        this.motyl = this.add.sprite(motylStartX, motylStartY, 'motyl')
            .setScale(0.1)
            .setDepth(100);

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

        // --- Výběr 4 náhodných odpadků ---
        const shuffled = Phaser.Utils.Array.Shuffle(this.odpadkyData.slice());
        const points = shuffled.slice(0, 4).map(o => ({ x: px(o.x), y: py(o.y) }));

        // --- Přidej cílový bod u ducha s rozestupem ---
        const offsetX = Math.round(120 * scaleFactor);
        const offsetY = Math.round(40 * scaleFactor);
        const duchCilX = duchX + offsetX;
        const duchCilY = duchY + offsetY;

        // --- První tween: motýl se přiblíží k prvnímu odpadku a zvětší se ---
        this.tweens.add({
            targets: this.motyl,
            x: points[0].x,
            y: points[0].y,
            scale: 0.6 * scaleFactor,
            duration: 3000, // <-- STEJNÁ DÉLKA JAKO ODLET
            ease: 'Power2',
            onComplete: () => {
                this.dialog.showDialogAboveAndDelay('motyl-00', this.motyl).then(() => {
                    const tweens = [
                        ...points.slice(1).map(p => ({
                            targets: this.motyl,
                            x: p.x,
                            y: p.y,
                            duration: 1200,
                            ease: 'Power2',
                            onStart: () => {
                                this.dialog.showDialogAboveAndDelay('motyl-00', this.motyl);
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
                            this.tweens.add({
                                targets: this.duch,
                                alpha: 0.9,
                                duration: 1000,
                                onComplete: () => {
                                    this.dialogMotylDuch();
                                }
                            });
                        }
                    });
                });
            }
        });

        this.input.once('pointerdown', () => {
            this.skipIntro();
        });
    }

    private createMotylAndAnimate(px: (x: number) => number, py: (y: number) => number): void {
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = this.responsive.getScaleFactor(667, 375);

        // Pokud už motýl existuje, znič ho
        if (this.motyl) {
            this.tweens.killTweensOf(this.motyl);
            this.motyl.destroy();
        }

        // Vytvoř nového motýla na startovní pozici
        // const px = (x: number) => Math.round(gameWidth * (x / 667));
        // const py = (y: number) => Math.round(gameHeight * (y / 375));
        const startX = px(506);
        const startY = py(233);
        this.motyl = this.add.sprite(startX, startY, 'motyl')
            .setScale(UI.MONINA.SCALE * scaleFactor) // sjednoceno podle configu
            .setDepth(100);

        // Úvodní monolog motýla
        this.dialog.showDialogAboveAndDelay('motyl-00', this.motyl).then(() => {
            // Cesta motýla přes odpadky a k duchovi
            const path = this.odpadkyData.map((o, i) => ({
                x: px(o.x),
                y: py(o.y) + (i % 2 === 0 ? 20 : -20)
            }));

            // Bezpečný bod u ducha (ne mimo scénu)
            const safeX = Math.max(50, Math.min(this.duch.x + Math.round(80 * scaleFactor), gameWidth - 50));
            const safeY = Math.max(50, Math.min(this.duch.y + Math.round(40 * scaleFactor), gameHeight - 50));
            path.push({ x: safeX, y: safeY });

            const pathWithoutFinal = path.slice(0, -1);
            for (let i = pathWithoutFinal.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pathWithoutFinal[i], pathWithoutFinal[j]] = [pathWithoutFinal[j], pathWithoutFinal[i]];
            }
            const randomPath = pathWithoutFinal.slice(0, 4);
            randomPath.push(path[path.length - 1]);

            console.log('Motýlí dráha:', randomPath);

            this.tweens.chain({
                targets: this.motyl,
                ease: 'Quad.easeInOut',
                onComplete: () => this.volejDucha(),
                tweens: [
                    {
                        scale: .6,
                        duration: 3000
                    },
                    ...randomPath.map(pt => ({
                        x: pt.x,
                        y: pt.y,
                        duration: 3000,
                        ease: 'Quad.easeInOut',
                        onComplete: () => {
                            if (Math.random() <= 0.33) {
                                this.doFlip(this.motyl);
                            }
                            if (this.dialog && typeof this.dialog.showDialogAbove === 'function') {
                                this.dialog.showDialogAbove('motyl-00', this.motyl);
                            }
                        }
                    }))
                ]
            });
        });
    }

    private volejDucha(): void {
        this.duch.setVisible(true);
        this.duch.setScale(.6 * this.responsive.getScaleFactor(667, 375));
        this.tweens.add({
            x: this.duch.x,
            y: this.duch.y,
            targets: this.duch,
            alpha: .65,
            duration: 2500,
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
            await this.dialog.showDialogAboveAndDelay(item.key, item.obj);
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
        this.scene.start('Game', {
            odpadkyData: this.odpadkyData,
            language: this.lang,
            texts: this.texts
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
