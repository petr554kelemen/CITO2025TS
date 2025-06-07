import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from "../../utils/quiz";
import Scoreboard from "../../utils/scoreboard";

// Extend the Window interface to include DEBUG_MODE
declare global {
    interface Window {
        DEBUG_MODE: boolean;
    }
}

window.DEBUG_MODE = true;

type DialogTexts = {
    dialogSequence: Record<string, string>;
    dialogGameSequence?: Record<string, string>;
};

type Odpadek = {
    typ: string;
    pozice: { x: number; y: number };
    scale?: number;
    angle?: number;
    status: string;
    sprite: Phaser.GameObjects.Sprite | null;
};

export default class Game extends Phaser.Scene {
    cam!: Phaser.Cameras.Scene2D.Camera;
    language: 'cs' | 'en' | 'pl';
    texts!: DialogTexts;

    //TODO: Přidat pole odpadků
    private odpadky: Odpadek[] = [];

    //TODO: Přidat proměnné pro pytel, Moninu, časovač, kvíz, skóre atd.
    private pytel!: Phaser.GameObjects.Image;
    private monina!: Phaser.GameObjects.Sprite;
    private quiz!: Quiz;
    private timeLeft: number = 120; // např. 2 minuty
    private timerEvent!: Phaser.Time.TimerEvent;

    private moninaSequence: { key: string; obj: Phaser.GameObjects.Image }[] = [];
    private dialog!: DialogManager;

    private quizActive: boolean = false;
    private canPlay: boolean = false;


    //private odpadyIcons: Phaser.GameObjects.Sprite[] = [];
    private odpadkyGroup!: Phaser.GameObjects.Group;

    //private bagIcons: Phaser.GameObjects.Image[] = [];

    private scoreboard!: Scoreboard;

    //score: number = 0;

    constructor() {
        super("Game");
    }

    init(data: { texts: DialogTexts; language: string; odpadkyData: Odpadek[] }): void {
        this.texts = data.texts;
        // Ověření, že jazyk je povolený
        if (['cs', 'en', 'pl'].includes(data.language)) {
            this.language = data.language as 'cs' | 'en' | 'pl';
        } else {
            this.language = 'cs'; // výchozí jazyk
        }
        this.odpadky = data.odpadkyData; // <-- přidej toto
    }

    async create(): Promise<void> {
        // pozadí pro hru s kvízem
        const backgroundGame = this.add.image(512, 385, "freepik_forest_01");
        backgroundGame.setOrigin(0.5);

        this.cam = this.cameras.main;

        // Nastavení kamery
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.cam.setBounds(0, 0, 1024, 768);
        this.cam.setZoom(1);

        // Nastavení scény

        // Nejprve pytel
        this.pytel = this.add.image(830, 690, 'prazdnyPytel').setInteractive();
        this.pytel.setOrigin(0.5);
        this.pytel.setScale(0.45);


        // Inicializace scoreboardu
        this.scoreboard = new Scoreboard(this, this.odpadky.length, 0);

        this.createOdpadky();

        this.setupMonina();
        this.monina = this.add.sprite(200, 540, "monina", 0); // frame 0

        if (this.monina) {
            this.monina.alpha = 0.5; // Nastavení průhlednosti Moniny
            this.monina.visible = true;

            this.tweens.add({
                targets: this.monina,
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    // Spusť sekvenci dialogu Moniny
                    this.dialog = new DialogManager(this, this.texts);

                    const showMoninaDialogs = async () => {
                        for (const item of this.moninaSequence) {
                            // Pokud Monina už není viditelná, ukonči sekvenci a skryj dialog
                            if (!this.monina.visible) {
                                this.dialog.hideDialog?.();
                                break;
                            }
                            await this.dialog.showDialogAbove(item.key, this.monina, -60);
                            await new Promise(resolve => this.time.delayedCall(2200, resolve));
                            this.dialog.hideDialog?.();
                        }
                        // Po posledním dialogu nech Moninu zmizet (pokud ještě nezmizela)
                        if (this.monina.visible) {
                            this.tweens.add({
                                targets: this.monina,
                                alpha: 0,
                                duration: 800,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.monina.visible = false;
                                    this.dialog.hideDialog?.();
                                    this.time.delayedCall(200, () => {
                                        this.enableGamePlay();
                                    });
                                }
                            });
                        } else {
                            // Pokud Monina už není viditelná (přeskočeno), povol hru rovnou
                            this.enableGamePlay();
                        }
                    };
                    showMoninaDialogs();
                }
            });

            // TODO: 1. Zobrazit úvodní sekvenci monologu (DialogManager)
            // TODO: 2. Po skončení dialogu přidat prázdný pytel na scénu

            // TODO: 4. Nastavit drag & drop pro odpadky
            // TODO: 5. Detekovat vhození odpadku do pytle, zvětšit pytel a spustit otázku z kvízu
            // TODO: 6. Spustit časovač a zobrazovat zbývající čas
            // TODO: 7. Penalizace za použití hintu (odečíst čas/skóre)
            // TODO: 8. Po sebrání všech odpadků nebo vypršení času zobrazit skóre a výsledek
            // TODO: 9. Po dokončení vyměnit pytel za plný

            const skipMonina = () => {
                if (this.monina && this.monina.visible) {
                    // Zobraz poslední monolog Moniny
                    this.dialog.showDialogAbove('monina-09', this.monina, -60).then(() => {
                        // Po zobrazení posledního dialogu Moninu animuj pryč
                        this.tweens.add({
                            targets: this.monina,
                            alpha: 0,
                            duration: 600,
                            onComplete: () => {
                                this.monina.visible = false;
                                this.dialog.hideDialog?.();
                                this.canPlay = true;
                                this.input.off('pointerdown', skipMonina);
                            }
                        });
                    });
                }
            };
            this.input.on('pointerdown', skipMonina);

            //this.score();
        }

        // Na začátku scény
        this.quiz = new Quiz(this.language);
        await this.quiz.loadQuestions();

        /* const test = this.add.sprite(400, 400, this.odpadky[0].typ).setInteractive();
        this.input.setDraggable(test, true);
        test.on('pointerdown', () => console.log('test sprite klik')); */
    }

    private setupMonina(): void {
        this.monina = this.add.sprite(200, 560, "Monina", 0); // frame 0
        this.monina.setOrigin(0.5);
        this.monina.visible = false;

        this.moninaSequence = [
            { key: 'monina-01', obj: this.monina },
            { key: 'monina-02', obj: this.monina },
            { key: 'monina-03', obj: this.monina },
            { key: 'monina-04', obj: this.monina },
            { key: 'monina-05', obj: this.monina },
            { key: 'monina-06', obj: this.monina },
            { key: 'monina-07', obj: this.monina },
            { key: 'monina-08', obj: this.monina },
            { key: 'monina-09', obj: this.monina }
        ];
    }

    /* private score(): void {
        for (let i = 0; i < this.odpadky.length; i++) {
            const icon = this.add.image(32 + i * 36, 40, 'miniBag')
                .setScale(0.32)
                .setAlpha(0.15)
                .setScrollFactor(0);
            this.bagIcons.push(icon);
        }
        this.timerText = this.add.text(32, 70, `Čas: ${this.timeLeft}`, {
            fontSize: '28px',
            color: '#222',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
    } */

    // private quiz(): void {
    //     //TODO: Vytvoreni quizu v ../../utils/quiz.ts
    // }

    private createOdpadky(): void {
        // Vytvoř skupinu pro odpadky
        this.odpadkyGroup = this.add.group();

        this.odpadky.forEach(odpadek => {
            odpadek.sprite = this.add.sprite(
                odpadek.pozice.x,
                odpadek.pozice.y,
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
            // this.input.setDraggable(odpadek.sprite);  // ZAKOMENTUJ nebo SMAŽ!

            if (odpadek.sprite) {
                this.odpadkyGroup.add(odpadek.sprite);
            }
        });

        // Drag & drop logika
        this.input.on(
            'drag',
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
                dragX: number,
                dragY: number
            ) => {
                if ((window as any).DEBUG_MODE) {
                    console.log('drag', gameObject, dragX, dragY);
                }
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        );

        let timerStarted = false;

        interface DragStartPointer extends Phaser.Input.Pointer {
            event: MouseEvent | TouchEvent;
        }

        interface DragStartGameObject extends Phaser.GameObjects.Sprite { }

        this.input.on(
            'dragstart',
            (
                pointer: DragStartPointer,
                gameObject: DragStartGameObject
            ) => {
                if (!this.canPlay || this.quizActive) {
                    pointer.event.preventDefault();
                    return;
                }
                // Zeslab všechny odpadky kromě právě taženého
                this.odpadkyGroup.getChildren().forEach(obj => {
                    (obj as Phaser.GameObjects.Sprite).alpha = obj === gameObject ? 1 : 0.5;
                });
                // Spusť časovač pouze při prvním drag
                if (!timerStarted) {
                    this.startTimer();
                    timerStarted = true;
                    // Pokud je Monina stále na scéně, odstraníme ji
                    if (this.monina && this.monina.visible) {
                        this.tweens.add({
                            targets: this.monina,
                            alpha: 0,
                            duration: 500,
                            onComplete: () => {
                                this.monina.visible = false;
                                this.dialog?.hideDialog?.();
                            }
                        });
                    }
                }
            }
        );

        this.input.on('dragend', ( _: unknown, gameObject: Phaser.GameObjects.Sprite) => {
            // Kontrola, zda byl odpadek "odložen" do pytle
            if (Phaser.Geom.Intersects.RectangleToRectangle(
                gameObject.getBounds(), this.pytel.getBounds()
            )) {
                const odpadek = this.odpadky.find(o => o.sprite === gameObject);
                if ((window as any).DEBUG_MODE) {
                    console.log('dragend: odpadek nalezen?', odpadek);
                }
                if (odpadek) {
                    // Nejprve spusť kvíz a až po jeho dokončení znič sprite:
                    this.quizForOdpadek(odpadek, () => {
                        // Po skončení kvízu odpadek znič
                        if (odpadek.sprite) {
                            this.odpadkyGroup.remove(odpadek.sprite, true, true);
                            odpadek.sprite = null;
                        }
                        this.odpadkyGroup.setAlpha(1);
                    });
                }
            } else {
                // Pokud nebyl odložen do pytle, obnov alpha všem (vše zůstává aktivní)
                this.odpadkyGroup.getChildren().forEach(obj => {
                    (obj as Phaser.GameObjects.Sprite).alpha = 1;
                });
                // OBNOV INTERAKTIVITU A DRAGGABLE
                this.odpadky.forEach(o => {
                    if (o.sprite) {
                        o.sprite.setInteractive();
                        this.input.setDraggable(o.sprite, true);
                    }
                });
            }
        });
    }

    // Přidej metodu pro spuštění kvízu k odpadku
    private quizForOdpadek(odpadek: Odpadek | undefined, onComplete: () => void) {
        if (!odpadek) return;
        if (this.quizActive) return;

        this.quizActive = true;

        // Zablokuj všechny odpadky
        this.odpadky.forEach(o => o.sprite?.disableInteractive());

        const question = this.quiz.getQuestionForType(odpadek.typ);
        if (!question) {
            console.warn('Chybí otázka pro typ odpadku:', odpadek.typ);
            this.quizActive = false;
            this.odpadky.forEach(o => o.sprite?.setInteractive());
            onComplete();
            return;
        }

        if ((window as any).DEBUG_MODE) {
            console.log('Spouštím kvíz pro odpadek:', odpadek, 'Otázka:', question);
        }

        // Overlay pro otázku – světlejší pozadí a box
        const overlay = this.add.rectangle(512, 384, 700, 380, 0xffffff, 0.25).setDepth(1000);
        const box = this.add.rectangle(512, 384, 660, 300, 0xf5f5dc, 1) // světle béžová
            .setDepth(1001)
            .setStrokeStyle(4, 0x4caf50); // zelený rámeček

        // Text otázky
        const questionText = this.add.text(512, 250, question.question, {
            fontSize: '22px',
            color: '#2e7d32', // tmavě zelená
            fontFamily: 'Arial',
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setDepth(1002);

        // Hint tlačítko
        const hintBtn = this.add.text(512, 310, '💡 Nápověda', {
            fontSize: '20px',
            color: '#1565c0', // modrá
            fontFamily: 'Arial',
            backgroundColor: '#e3f2fd', // světle modrá
            padding: { left: 10, right: 10, top: 4, bottom: 4 }
        }).setOrigin(0.5).setDepth(1002).setInteractive();

        // Hint text
        let hintText: Phaser.GameObjects.Text | null = null;
        let hintUsed = false;
        hintBtn.on('pointerdown', () => {
            if (!hintUsed && question.hint) {
                hintUsed = true;
                hintText = this.add.text(512, 370, question.hint, {
                    fontSize: '20px',
                    color: '#555',
                    fontFamily: 'Arial',
                    wordWrap: { width: 500 }
                }).setOrigin(0.5).setDepth(1002);
                // Penalizace za hint
                this.timeLeft -= 10;
                //this.timerText.setText(`Čas: ${this.timeLeft}`);
                hintBtn.setAlpha(0.5).disableInteractive();
            }
        });

        // Možnosti odpovědí
        const optionButtons: Phaser.GameObjects.Text[] = [];
        question.options.forEach((opt, i) => {
            const btn = this.add.text(512, 370 + i * 36, opt, {
                fontSize: '20px',
                color: '#222',
                fontFamily: 'Arial',
                backgroundColor: '#e0e0e0',
                padding: { left: 12, right: 12, top: 6, bottom: 6 }
            }).setOrigin(0.5).setDepth(1002).setInteractive();

            btn.on('pointerdown', () => {
                // Vyhodnocení odpovědi
                const correct = i === question.answer;
                if (correct) {
                    this.scoreboard.markCorrect();
                }
                // Zruš UI overlay
                overlay.destroy();
                box.destroy();
                questionText.destroy();
                hintBtn.destroy();
                optionButtons.forEach(b => b.destroy());
                if (hintText) hintText.destroy();

                // Opět povol interaktivitu odpadků
                this.odpadky.forEach(o => {
                    if (o.sprite) {
                        o.sprite.setInteractive();
                        this.input.setDraggable(o.sprite, true);
                    }
                });
                this.quizActive = false;
                onComplete();
            });

            optionButtons.push(btn);
        });

        //console.log('Kvíz overlay by se měl zobrazit právě teď', question);
    }

    private startTimer(): void {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.scoreboard.updateTime(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.timerEvent.remove();
                    // TODO: Konec hry, vyhodnocení skóre
                }
            },
            loop: true
        });
    }

    private enableGamePlay() {
        this.canPlay = true;
        this.odpadky.forEach(odpadek => {
            if (odpadek.sprite) {
                this.input.setDraggable(odpadek.sprite, true);
                if ((window as any).DEBUG_MODE) {
                    console.log('setDraggable TRUE', odpadek.sprite);
                }
            }
        });
    }

    update(): void {
        //TODO: Herní logika (např. kontrola dokončení, časovač, animace)


    }
}

