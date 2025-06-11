import Phaser from 'phaser';
import DialogManager from '../../utils/DialogManager';
import ResponsiveManager, { LayoutType } from '../../utils/ResponsiveManager';

type Odpadek = {
    typ: string;
    pozice: { x: number; y: number };
    scale?: number;
    angle?: number;
    status: string;
    sprite: Phaser.GameObjects.Sprite | null;
};

type DialogTexts = {
    dialogSequence: Record<string, string>;
    dialogGameSequence?: Record<string, string>;
};

export default class Intro extends Phaser.Scene {
    private dialog!: DialogManager;
    private responsive!: ResponsiveManager;

    // Desktop rozmístění (pouze zde je scale!)
    private odpadkyDataDesktop: Odpadek[] = [
        { typ: "Banan", pozice: { x: 985, y: 555 }, scale: 1.4, status: 'default', sprite: null },
        { typ: "Baterie", pozice: { x: 880, y: 485 }, scale: 0.75, status: 'default', sprite: null },
        { typ: "Lahev", pozice: { x: 535, y: 550 }, scale: 1.5, status: 'default', sprite: null },
        { typ: "Ohryzek", pozice: { x: 600, y: 720 }, scale: 0.65, angle: 70, status: 'default', sprite: null },
        { typ: "Kapesnik", pozice: { x: 490, y: 650 }, status: 'default', sprite: null },
        { typ: "Vajgl", pozice: { x: 725, y: 610 }, status: 'default', sprite: null },
        { typ: "Karton", pozice: { x: 670, y: 505 }, status: 'default', sprite: null },
        { typ: "Zvykacka", pozice: { x: 666, y: 566 }, status: 'default', sprite: null },
        { typ: "Plechovka", pozice: { x: 845, y: 565 }, angle: 14, status: 'default', sprite: null },
        { typ: "PET", pozice: { x: 310, y: 630 }, scale: 1.5, angle: -44, status: 'default', sprite: null }
    ];

    // Mobilní rozmístění (scale zde NEUVÁDĚJ!)
    private odpadkyDataMobile: Odpadek[] = [
        { typ: "Banan", pozice: { x: 296, y: 273 }, status: 'default', sprite: null },
        { typ: "Baterie", pozice: { x: 368, y: 319 }, status: 'default', sprite: null },
        { typ: "Lahev", pozice: { x: 406, y: 257 }, status: 'default', sprite: null },
        { typ: "Ohryzek", pozice: { x: 188, y: 344 }, angle: 82, status: 'default', sprite: null },
        { typ: "Kapesnik", pozice: { x: 265, y: 327 }, status: 'default', sprite: null },
        { typ: "Vajgl", pozice: { x: 436, y: 326 }, status: 'default', sprite: null },
        { typ: "Karton", pozice: { x: 346, y: 245 }, status: 'default', sprite: null },
        { typ: "Zvykacka", pozice: { x: 539, y: 274 }, status: 'default', sprite: null },
        { typ: "Plechovka", pozice: { x: 471, y: 282 }, status: 'default', sprite: null },
        { typ: "PET", pozice: { x: 209, y: 282 }, status: 'default', sprite: null }
    ];

    // Data odpadků na scéně (bude nastaveno v create)
    odpadkyData: Odpadek[] = [];

    // Další property
    pytel!: Phaser.GameObjects.Sprite;
    citoLogo!: Phaser.GameObjects.Image;
    background!: Phaser.GameObjects.Image;
    motyl!: Phaser.GameObjects.Sprite;
    duch!: Phaser.GameObjects.Sprite;
    prevX!: number;
    guides?: any;
    lang: any;
    texts!: DialogTexts;

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

        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
        }

        const DESKTOP_WIDTH = 1366;
        const MOBILE_WIDTH = 667;
        const scaleRatio = MOBILE_WIDTH / DESKTOP_WIDTH;

        if (this.responsive.isMobile()) {
            // Vezmi mobilní pozice, scale dopočítej z desktop dat
            this.odpadkyData = this.odpadkyDataMobile.map(mobObj => {
                const deskObj = this.odpadkyDataDesktop.find(d => d.typ === mobObj.typ);
                return {
                    ...mobObj,
                    scale: deskObj?.scale ? deskObj.scale * scaleRatio : scaleRatio,
                    sprite: null
                };
            });
            this.createMobileLayout();
        } else {
            this.odpadkyData = this.odpadkyDataDesktop.map(o => ({ ...o, sprite: null }));
            this.createDesktopLayout();
        }

        this.createOdpadky();
        this.createMotylAndAnimate();

        this.responsive.on('layoutchange', (layout: LayoutType) => {
            this.cleanExistingLayout();

            if (layout === LayoutType.MOBILE) {
                this.odpadkyData = this.odpadkyDataMobile.map(mobObj => {
                    const deskObj = this.odpadkyDataDesktop.find(d => d.typ === mobObj.typ);
                    return {
                        ...mobObj,
                        scale: deskObj?.scale ? deskObj.scale * scaleRatio : scaleRatio,
                        sprite: null
                    };
                });
                this.createMobileLayout();
            } else {
                this.odpadkyData = this.odpadkyDataDesktop.map(o => ({ ...o, sprite: null }));
                this.createDesktopLayout();
            }

            this.createOdpadky();
            this.createMotylAndAnimate();
        });

        this.input.once('pointerdown', () => {
            this.skipIntro();
        });
    }

    private createMobileLayout(): void {
        this.createBackground();
        this.createDuch(true);
        this.createPytel(true);
        this.createCitoLogo(true);
    }

    private createDesktopLayout(): void {
        this.createBackground();
        this.createDuch(false);
        this.createPytel(false);
        this.createCitoLogo(false);
    }

    private createBackground(): void {
        const { width, height } = this.responsive.getGameSize();
        this.background = this.add.image(width / 2, height / 2, "freepik_forest_01");
        const scaleX = width / this.background.width;
        const scaleY = height / this.background.height;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale);
    }

    private createDuch(isMobile: boolean): void {
        const { width, height } = this.responsive.getGameSize();
        if (isMobile) {
            this.duch = this.add.sprite(width * 0.24, height * 0.27, "Duch", 0).setAlpha(0).setVisible(false);
        } else {
            this.duch = this.add.sprite(width * 0.19, height * 0.36, "Duch", 0).setAlpha(0).setVisible(false);
        }
    }

    private createPytel(isMobile: boolean): void {
        const { width, height } = this.responsive.getGameSize();
        if (isMobile) {
            this.pytel = this.add.sprite(width * 0.87, height * 0.88, "prazdnyPytel");
            this.pytel.setScale(Math.min(0.25, width * 0.0005));
        } else {
            this.pytel = this.add.sprite(width * 0.79, height * 0.9, "prazdnyPytel");
            this.pytel.setScale(Math.min(0.5, width * 0.0008));
        }
        this.pytel.setVisible(false);
    }

    private createCitoLogo(isMobile: boolean): void {
        const { width, height } = this.responsive.getGameSize();
        if (isMobile) {
            this.citoLogo = this.add.image(width * 0.93, height * 0.14, "Cito_logo");
        } else {
            this.citoLogo = this.add.image(width * 0.89, height * 0.14, "Cito_logo");
        }
        this.citoLogo.setScale(Math.min(0.2, width * 0.0005));
        this.citoLogo.setAlpha(0.9);
    }

    private skipIntro(): void {
        this.input.enabled = false;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.startGameScene();
        });
    }

    private createOdpadky(): void {
        this.odpadkyData.forEach(odpadek => {
            odpadek.sprite = this.add.sprite(
                odpadek.pozice.x,
                odpadek.pozice.y,
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
        });
    }

    private createMotylAndAnimate(): void {
        if (this.motyl) {
            this.tweens.killTweensOf(this.motyl);
            this.motyl.destroy();
        }

        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const startX = gameWidth * 0.65;
        const startY = gameHeight * 0.62;

        this.motyl = this.add.sprite(startX, startY, 'Motyl').setScale(.2);

        const path = this.odpadkyData.map((o, i) => ({
            x: o.pozice.x,
            y: o.pozice.y + (i % 2 === 0 ? 20 : -20)
        }));
        path.push({ x: this.duch.x + 150, y: this.duch.y });

        const pathWithoutFinal = path.slice(0, -1);
        for (let i = pathWithoutFinal.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pathWithoutFinal[i], pathWithoutFinal[j]] = [pathWithoutFinal[j], pathWithoutFinal[i]];
        }
        const randomPath = pathWithoutFinal.slice(0, 4);
        randomPath.push(path[path.length - 1]);

        this.tweens.chain({
            targets: this.motyl,
            ease: 'Quad.easeInOut',
            onComplete: () => this.volejDucha(),
            tweens: [
                {
                    scale: 1,
                    duration: 3000,
                    onComplete: () => {
                        //this.dialog.showDialogAbove('motyl-00', this.motyl);
                    }
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
    }

    private volejDucha(): void {
        this.duch.setVisible(true);
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

    private startGameScene(): void {
        this.scene.start('Game', {
            odpadkyData: this.odpadkyData,
            language: this.lang,
            texts: this.texts
        });
    }

    private processDialogSequence(sequence: { key: string, obj: Phaser.GameObjects.Sprite }[], index: number): void {
        if (index >= sequence.length) {
            this.dialog.hideDialog();
            console.log('Sekvence dialogů dokončena.');
            return;
        }

        const currentDialog = sequence[index];
        const displayDuration = this.dialog.getDisplayDurationForKey(currentDialog.key);

        this.dialog.showDialogAbove(currentDialog.key, currentDialog.obj);
        console.log(`Zobrazuji dialog "${currentDialog.key}" na ${displayDuration}ms.`);

        this.time.delayedCall(displayDuration, () => {
            this.dialog.hideDialog();
            console.log(`Skrývám dialog "${currentDialog.key}".`);

            this.time.delayedCall(500, () => {
                this.processDialogSequence(sequence, index + 1);
            });
        });
    }

    update(): void {
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

    private cleanExistingLayout(): void {
        if (this.background) this.background.destroy();
        if (this.duch) this.duch.destroy();
        if (this.pytel) this.pytel.destroy();
        if (this.citoLogo) this.citoLogo.destroy();
        if (this.motyl) {
            this.tweens.killTweensOf(this.motyl);
            this.motyl.destroy();
        }
        this.odpadkyData.forEach(odpadek => {
            if (odpadek.sprite) odpadek.sprite.destroy();
        });
    }
}