import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from '../../utils/quiz';
import Scoreboard from "../../utils/scoreboard";
import ResponsiveManager, { LayoutType } from '../../utils/ResponsiveManager';
import { UI } from "../../config/constants";

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
    private timerEvent?: Phaser.Time.TimerEvent;
    private timerStarted = false;
    private timeLeft: number = 120; // např. 2 minuty

    private moninaSequence: { key: string; obj: Phaser.GameObjects.Image }[] = [];
    private dialog!: DialogManager;

    private quizActive: boolean = false;
    private canPlay: boolean = false;
    private currentOdpadek: Odpadek | null = null;
    private currentQuestion: any = null;

    private hintBtn?: Phaser.GameObjects.Image;

    private quizContainer?: Phaser.GameObjects.Container;

    private quizCleanup: (() => void) | null = null;

    //private odpadyIcons: Phaser.GameObjects.Sprite[] = [];
    private odpadkyGroup!: Phaser.GameObjects.Group;

    //private bagIcons: Phaser.GameObjects.Image[] = [];

    private scoreboard!: Scoreboard;

    //score: number = 0;

    private totalHintsLeft: number = 2;
    private lastGameSuccess: boolean = false;

    private originalOdpadky: Odpadek[] = [];

    private responsive!: ResponsiveManager;

    constructor() {
        super("Game");
        // Přidáno: Povolení hraní po skončení úvodního dialogu
    }

    private enableGamePlay(): void {
        this.canPlay = true;
        // Nastav drag & drop pro odpadky
        this.odpadky.forEach(o => {
            if (o.sprite) {
                this.input.setDraggable(o.sprite, true);
            }
        });
    }

    init(data: { texts: DialogTexts; language: string; odpadkyData: Odpadek[] }): void {
        this.texts = data.texts;
        // Ověření, že jazyk je povolený
        if (['cs', 'en', 'pl'].includes(data.language)) {
            this.language = data.language as 'cs' | 'en' | 'pl';
        } else {
            this.language = 'cs'; // výchozí jazyk
        }
        // Ulož originál pro restart
        this.originalOdpadky = data.odpadkyData.map(o => ({ ...o, sprite: null }));
        this.odpadky = data.odpadkyData.map(o => ({ ...o, sprite: null }));
    }

    async create(): Promise<void> {
        // LADICÍ REŽIM: Přeskoč intro a hned zobraz GameOver
        /* if ((window as any).DEBUG_MODE) {
            this.scene.start('GameOver', { texts: this.texts });
            return;
        } */

        // Pokud už hráč úspěšně dokončil, rovnou GameOver
        if (localStorage.getItem('cito2025_success') === '1') {
            this.scene.start('GameOver', { texts: this.texts });
            return;
        }

        // Inicializace ResponsiveManager
        this.responsive = new ResponsiveManager(this);
        this.responsive.checkAndForceOrientation();

        /* // Debug info pro ladění
        if ((window as any).DEBUG_MODE) {
            this.responsive.addDebugOverlay();
        } */

        // --- NOVĚ: Rozpoznání layoutu a volání správné metody ---
        this.setupLayout();

        // Reaguj na změny layoutu (např. otočení, resize)
        this.responsive.on('layoutchange', (layout: LayoutType) => {
            this.resetLayout(layout);
        });

        // Na začátku scény
        this.quiz = new Quiz(this.language, {
            onCorrect: () => this.scoreboard.markCorrect(),
            onHintUsed: (_q, hintsLeft) => {
                if (hintsLeft <= 0 && this.hintBtn) {
                    this.hintBtn.setAlpha(0.5).disableInteractive();
                }
            },
            onTimePenalty: (seconds) => {
                this.timeLeft -= seconds;
                this.scoreboard.setTime(this.timeLeft);
            }
        });
        await this.quiz.loadQuestions();

        // --- NOVĚ: Přidání drag & drop logiky sem ---
        this.input.on(
            'drag',
            (
                _pointer: Phaser.Input.Pointer,
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

        interface DragEndPointer extends Phaser.Input.Pointer { }

        interface DragEndGameObject extends Phaser.GameObjects.Sprite { }

        this.input.on(
            'dragend',
            (pointer: DragEndPointer, gameObject: DragEndGameObject) => {
                const odpadek: Odpadek | undefined = this.odpadky.find((o: Odpadek) => o.sprite === gameObject);
                if (!odpadek) return;

                const pytelBounds: Phaser.Geom.Rectangle = this.pytel.getBounds();
                const odpadekBounds: Phaser.Geom.Rectangle = gameObject.getBounds();

                if (Phaser.Geom.Intersects.RectangleToRectangle(odpadekBounds, pytelBounds)) {
                    this.quizForOdpadek(odpadek);
                } else {
                    // vrátit odpadek na původní pozici nebo jiná logika
                }
            }
        );

        // --- NOVĚ: Přesun drag & drop logiky sem ---
        /* this.input.on(
            'drag',
            (
                _pointer: Phaser.Input.Pointer,
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

        this.input.on('dragend', (_: unknown, gameObject: Phaser.GameObjects.Sprite) => {
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
                    this.quizForOdpadek(odpadek);
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
        }); */
    }

    // --- NOVÁ METODA: Nastaví layout podle zařízení ---
    private setupLayout(): void {
        const { width: gameWidth, height: gameHeight } = this.responsive.getGameSize();
        const scaleFactor = Math.min(gameWidth / 667, gameHeight / 375);
        const px = (x: number) => Math.round(gameWidth * (x / 667));
        const py = (y: number) => Math.round(gameHeight * (y / 375));

        // Pozadí
        const backgroundGame = this.add.image(gameWidth / 2, gameHeight / 2, "freepik_forest_01");
        const scaleX = gameWidth / backgroundGame.width;
        const scaleY = gameHeight / backgroundGame.height;
        backgroundGame.setScale(Math.max(scaleX, scaleY));
        backgroundGame.setOrigin(0.5);
        backgroundGame.setDepth(-1);

        // Pytel
        this.pytel = this.add.image(gameWidth * 0.85, gameHeight * 0.88, 'prazdnyPytel').setInteractive();
        this.pytel.setScale(UI.PYTEL.SCALE * scaleFactor);
        this.pytel.setOrigin(0.5);

        // Scoreboard vlevo nahoře
        this.scoreboard = new Scoreboard(this, this.odpadky.length, this.timeLeft, this.texts);

        // --- 1. Odpadky v kruhu ---
        this.createOdpadkyResponsive(gameWidth, gameHeight);

        // --- 2. CITO logo doprostřed ---
        const citoLogo = this.add.image(gameWidth / 2, gameHeight / 2, "Cito_logo")
            .setOrigin(0.5)
            .setScale(0.15 * scaleFactor)
            .setDepth(10)
            .setAlpha(1);

        // --- 3. Po chvíli fade out loga a rozházení odpadků ---
        this.time.delayedCall(1200, () => {
            this.tweens.add({
                targets: citoLogo,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    citoLogo.destroy();

                    // --- Rozházej odpadky na pozice jako v intro scéně ---
                    // Použij stejné návrhové souřadnice jako v Intro.ts
                    const introOdpadky = [
                        { x: 359, y: 243 },
                        { x: 475, y: 278 },
                        { x: 427, y: 253 },
                        { x: 372, y: 304 },
                        { x: 539, y: 254 },
                        { x: 305, y: 329 },
                        { x: 188, y: 344 },
                        { x: 285, y: 268 },
                        { x: 436, y: 326 },
                        { x: 213, y: 307 }
                    ];

                    // Zamíchej pole pro náhodné rozmístění
                    const shuffled = Phaser.Utils.Array.Shuffle(introOdpadky.slice());

                    this.odpadky.forEach((odpadek, i) => {
                        const pos = shuffled[i % shuffled.length];
                        if (odpadek.sprite) {
                            this.tweens.add({
                                targets: odpadek.sprite,
                                x: px(pos.x),
                                y: py(pos.y),
                                duration: 700,
                                ease: 'Power2'
                            });
                        }
                    });

                    // --- 4. Po rozházení odpadků zobraz Moninu a spusť její monolog ---
                    this.time.delayedCall(800, () => {
                        this.setupMoninaResponsive(gameWidth, gameHeight);

                        if (this.monina) {
                            this.monina.alpha = 0.5;
                            this.monina.visible = true;

                            this.tweens.add({
                                targets: this.monina,
                                alpha: 1,
                                duration: 1000,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.dialog = new DialogManager(this, this.texts);

                                    const showMoninaDialogs = async () => {
                                        for (const item of this.moninaSequence) {
                                            if (!this.monina.visible) {
                                                this.dialog.hideDialog?.();
                                                break;
                                            }
                                            await this.dialog.showDialogAbove(item.key, this.monina, -60);
                                            await new Promise(resolve => this.time.delayedCall(2200, resolve));
                                            this.dialog.hideDialog?.();
                                        }
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
                                            this.enableGamePlay();
                                        }
                                    };
                                    showMoninaDialogs();
                                }
                            });

                            const skipMonina = () => {
                                if (this.monina && this.monina.visible) {
                                    this.dialog.showDialogAbove('monina-09', this.monina, -60).then(() => {
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
                        }
                    });
                }
            });
        });
    }

    // --- NOVÁ METODA: Responzivní Monina ---
    private setupMoninaResponsive(gameWidth: number, gameHeight: number): void {
        const { width, height } = this.responsive.getGameSize();
        const scaleFactor = Math.min(width / 667, height / 375);
        const px = (x: number) => Math.round(width * (x / 667));
        const py = (y: number) => Math.round(height * (y / 375));

        const moninaX = px(130); // nebo jiná vhodná pozice
        const moninaY = py(370); // nebo jiná vhodná pozice
        this.monina = this.add.sprite(moninaX, moninaY, "DivkaStoji")
            .setOrigin(0.5, 1)
            .setScale(0.6 * scaleFactor)
            .setAlpha(0)
            .setVisible(false);

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

    private createOdpadkyResponsive(gameWidth: number, gameHeight: number): void {
        this.odpadkyGroup = this.add.group();

        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        const radius = Math.min(gameWidth, gameHeight) * 0.35;

        this.odpadky.forEach((odpadek, i, arr) => {
            const angle = (2 * Math.PI * i) / arr.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            odpadek.sprite = this.add.sprite(x, y, odpadek.typ);
            odpadek.sprite.setScale(Math.min(0.5, gameWidth * 0.0007));
            odpadek.sprite.setInteractive();

            this.odpadkyGroup.add(odpadek.sprite);
        });

        // Pokud máš drag & drop logiku, ponech ji tak, jak je v původní metodě createOdpadky.
    }

    // Vytvoří odpadky na scéně
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
                _pointer: Phaser.Input.Pointer,
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

        interface DragEndPointer extends Phaser.Input.Pointer { }

        interface DragEndGameObject extends Phaser.GameObjects.Sprite { }

        this.input.on(
            'dragend',
            (pointer: DragEndPointer, gameObject: DragEndGameObject) => {
                const odpadek: Odpadek | undefined = this.odpadky.find((o: Odpadek) => o.sprite === gameObject);
                if (!odpadek) return;

                const pytelBounds: Phaser.Geom.Rectangle = this.pytel.getBounds();
                const odpadekBounds: Phaser.Geom.Rectangle = gameObject.getBounds();

                if (Phaser.Geom.Intersects.RectangleToRectangle(odpadekBounds, pytelBounds)) {
                    this.quizForOdpadek(odpadek);
                } else {
                    // vrátit odpadek na původní pozici nebo jiná logika
                }
            }
        );
    }

    // Spustí herní časovač
    private startTimer(): void {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.scoreboard.setTime(this.timeLeft);
                } else {
                    this.timerEvent?.remove(false);
                    this.endGame();
                }
            }
        });
    }

    // Odstraní odpadek ze scény a pole
    private removeOdpadek(odpadek: Odpadek): void {
        if (odpadek.sprite) {
            odpadek.sprite.destroy();
            odpadek.sprite = null;
        }
        odpadek.status = "removed";
        // Aktualizuj skóre nebo další logiku, pokud je potřeba
        //this.scoreboard.incrementScore();
    }

    // Přidej metodu pro spuštění kvízu k odpadku
    private async quizForOdpadek(odpadek: Odpadek) {
        const question = this.quiz.getQuestionForType(odpadek.typ);
        if (!question) {
            if ((window as any).DEBUG_MODE) {
                console.warn('Nenalezena otázka pro typ:', odpadek.typ);
            }
            this.removeOdpadek(odpadek);
            return;
        }
        this.currentOdpadek = odpadek;
        this.currentQuestion = question;
        this.showQuizUI(question);

        // Hint tlačítko
        if (this.hintBtn) {
            this.hintBtn.setAlpha(this.quiz.getHintsLeft() > 0 ? 1 : 0.5);
            this.hintBtn.setInteractive(this.quiz.getHintsLeft() > 0);
            this.hintBtn.off('pointerdown');
            this.hintBtn.on('pointerdown', () => {
                if (this.quiz.useHint()) {
                    this.showHint(question.hint ?? "");
                }
            });
        }
    }

    // Přidáno: Základní implementace showQuizUI
    private showQuizUI(question: any): void {
        // Smaž předchozí UI, pokud existuje
        if (this.quizContainer) {
            this.quizContainer.destroy();
        }

        this.quizContainer = this.add.container();

        // Otázka
        const questionText = this.add.text(
            this.scale.width / 2, 100,
            question.question,
            { fontSize: '24px', color: '#222', align: 'center', wordWrap: { width: 500 } }
        ).setOrigin(0.5);

        this.quizContainer.add(questionText);

        // Možnosti
        question.options.forEach((option: string, i: number) => {
            const btn = this.add.text(
                this.scale.width / 2, 180 + i * 50,
                option,
                { fontSize: '22px', color: '#005', backgroundColor: '#eee', padding: { left: 10, right: 10, top: 5, bottom: 5 } }
            )
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.quizContainer?.destroy();
                    this.onQuizAnswer(i);
                });
            this.quizContainer?.add(btn);
        });

        // Hint tlačítko (pokud je hint k dispozici a zbývá alespoň jeden hint)
        if (question.hint && this.quiz.getHintsLeft() > 0) {
            const hintBtn = this.add.text(
                this.scale.width / 2, 180 + question.options.length * 50 + 40,
                'Nápověda',
                { fontSize: '20px', color: '#fff', backgroundColor: '#0077cc', padding: { left: 16, right: 16, top: 8, bottom: 8 } }
            )
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    if (this.quiz.useHint()) {
                        this.showHint(question.hint ?? "");
                        hintBtn.setAlpha(0.5).disableInteractive();
                    }
                });
            this.quizContainer.add(hintBtn);
        }
    }

    // Přidáno: Implementace showHint pro zobrazení nápovědy
    private showHint(hint: string): void {
        // Zobraz nápovědu v dialogovém okně nebo jiném UI prvku
        // Toto je jednoduchá ukázka, nahraď dle potřeby vlastním UI
        if (this.dialog) {
            this.dialog.showDialog(hint);
        } else {
            // Fallback: alert
            alert(hint);
        }
    }

    // ...když hráč odpoví na otázku:
    private onQuizAnswer(optionIndex: number) {
        if (!this.currentQuestion || !this.currentOdpadek) return;
        const correct = this.quiz.answer(this.currentQuestion, optionIndex);

        // UI zvýraznění správné/špatné odpovědi, případně další akce
        if (correct) {
            // Správná odpověď – zvýraznění už řeší callback
        } else {
            // Špatná odpověď – případně zvýrazni v UI
        }

        // Po zodpovězení otázky pokračuj ve hře
        this.removeOdpadek(this.currentOdpadek);
        this.currentOdpadek = null;
        this.currentQuestion = null;

        // Vyhodnocení konce hry
        if (this.allOdpadkyOdpovezeny()) {
            this.endGame();
        }
    }

    // Vyhodnocení konce hry
    private endGame() {
        const success = this.quiz.isSuccess();
        if (success) {
            this.showPergamenAndTransition();
        } else {
            this.scene.start('Intro');
        }
    }

    // Přidáno: Metoda pro zobrazení závěrečné scény
    private showFinalScene(): void {
        const dialogContainer = this.dialog.getBubbleContainer();
        if (dialogContainer) {
            const textObj = dialogContainer.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text | undefined;
            let pergamenImg: Phaser.GameObjects.Image | undefined;

            if (textObj) {
                dialogContainer.setSize(textObj.width, textObj.height);

                // Přidej pergamen pouze při úspěchu
                if (this.lastGameSuccess) {
                    // Výška obrázku (po načtení) pro lepší zarovnání
                    const pergamenY = dialogContainer.y - (dialogContainer.height / 2) - 20;
                    pergamenImg = this.add.image(
                        -200, // start mimo scénu vlevo
                        pergamenY,
                        "Pergamen"
                    ).setOrigin(0.5, 1)
                        .setDepth(dialogContainer.depth + 1)
                        .setScale(0.7)
                        .setAlpha(0.5);

                    // Cílová pozice je střed obrazovky
                    const targetX = this.cameras.main.centerX;

                    this.tweens.add({
                        targets: pergamenImg,
                        x: targetX,
                        alpha: 1,
                        duration: 2000,
                        ease: 'Power2'
                    });

                    if ((window as any).DEBUG_MODE) {
                        console.log('Pergamen se zobrazuje:', pergamenImg);
                    }

                    pergamenImg.setInteractive({ useHandCursor: true });
                    pergamenImg.once('pointerdown', () => {
                        this.dialog.hideDialog();
                        if (pergamenImg) pergamenImg.destroy();
                        this.scene.start('GameOver');
                    });

                    dialogContainer.disableInteractive();
                }
            } else {
                dialogContainer.setSize(300, 100);
            }

            dialogContainer.setInteractive();
            dialogContainer.once('pointerdown', () => {
                this.dialog.hideDialog();
                if (pergamenImg) pergamenImg.destroy();

                // Fade out efekt (např. 800 ms, černá)
                this.cameras.main.fadeOut(800, 0, 0, 0);

                this.cameras.main.once('camerafadeoutcomplete', () => {
                    if (this.lastGameSuccess) {
                        this.scene.start('GameOver', { texts: this.texts });
                    } else {
                        this.scene.start('Game', {
                            odpadkyData: this.originalOdpadky.map(o => ({ ...o, sprite: null })), // ✅ Použij originální data
                            language: this.language,
                            texts: this.texts
                        });
                    }
                });
            });
        }
    }

    // Přidej metodu pro reset layoutu
    private resetLayout(layout: LayoutType): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Pozadí
        const background = this.children.list.find(
            child => child instanceof Phaser.GameObjects.Image &&
                (child as Phaser.GameObjects.Image).texture.key === "freepik_forest_01"
        ) as Phaser.GameObjects.Image;

        if (background) {
            background.setPosition(centerX, centerY);
            const scaleX = gameWidth / background.width;
            const scaleY = gameHeight / background.height;
            background.setScale(Math.max(scaleX, scaleY));
        }

        // Pytel
        if (this.pytel) {
            this.pytel.setPosition(gameWidth * 0.85, gameHeight * 0.88);
            this.pytel.setScale(Math.min(UI.PYTEL.SCALE, gameWidth * 0.0007));
        }

        // Monina
        if (this.monina && this.monina.visible) {
            this.monina.setPosition(gameWidth * 0.18, gameHeight * 0.73);
            this.monina.setScale(Math.min(UI.MONINA.SCALE, gameHeight * UI.LOGO.SCALE));
        }

        // Odpadky
        const centerX2 = gameWidth / 2;
        const centerY2 = gameHeight / 2;
        const radius = Math.min(gameWidth, gameHeight) * 0.35;
        this.odpadky.forEach((odpadek, i, arr) => {
            if (odpadek.sprite) {
                const angle = (2 * Math.PI * i) / arr.length;
                const x = centerX2 + radius * Math.cos(angle);
                const y = centerY2 + radius * Math.sin(angle);
                odpadek.sprite.setPosition(x, y);
                odpadek.sprite.setScale(Math.min(0.5, gameWidth * 0.0007));
            }
        });
    }

    // Odstraní odpadek pro aktuální otázku
    private removeOdpadekForCurrentQuestion(): void {
        // Odstraní odpadek, který byl naposledy použit v kvízu
        if (!this.currentQuestion) return;
        // Najdi odpadek podle typu otázky
        const odpadek = this.odpadky.find(o => o.typ === this.currentQuestion.type && o.sprite);
        if (odpadek) {
            this.removeOdpadek(odpadek);
        }
        this.currentQuestion = null;
    }

    // Zobrazí pergamen a přechod na GameOver scénu
    private showPergamenAndTransition(): void {
        const { width: gameWidth, height: gameHeight } = this.scale;
        const scaleFactor = Math.min(gameWidth / 667, gameHeight / 375);

        // Pergamen přijede shora do středu obrazovky
        const pergamen = this.add.image(gameWidth / 2, -300, "Pergamen")
            .setOrigin(0.5)
            .setScale(0.7 * scaleFactor)
            .setDepth(10);

        this.tweens.add({
            targets: pergamen,
            y: gameHeight / 2,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                pergamen.setInteractive({ useHandCursor: true });
                pergamen.once('pointerdown', () => {
                    this.cameras.main.fadeOut(800, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('GameOver', { texts: this.texts, gameOverSuccess: true });
                    });
                });
            }
        });
    }

    private allOdpadkyOdpovezeny(): boolean {
        // Pokud každý odpadek už nemá sprite (byl odstraněn), jsou všechny zodpovězeny
        return this.odpadky.every(o => !o.sprite);
    }
}

