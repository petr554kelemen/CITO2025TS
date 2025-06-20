import Phaser from "phaser";
import Scoreboard from "../../utils/scoreboard";
import DialogManager from "../../utils/DialogManager";
import { Quiz, QuizQuestion } from "../../utils/quiz";
import { UI } from "../../config/constants";

// Typ pro odpadek
type Odpadek = {
    typ: string;
    pozice: { x: number; y: number }; // Added pozice property
    x?: number;
    y?: number;
    scale?: number;
    angle?: number;
    sprite?: Phaser.GameObjects.Sprite;
    inPytel?: boolean;
    origX?: number;
    origY?: number;
};

export default class Game extends Phaser.Scene {
    private odpadky: Odpadek[] = [];
    private pytel!: Phaser.GameObjects.Image;
    private scoreboard!: Scoreboard;
    private dialog!: DialogManager;
    private quiz!: Quiz;
    private timerEvent?: Phaser.Time.TimerEvent;
    private timerStarted = false;
    private timeLeft: number = 120;
    private responsive!: any; // Pokud máš typ, nahraď 'any'
    private odpadkyGroup!: Phaser.GameObjects.Group;
    private currentOdpadek?: Odpadek;
    private texts: any; // Pokud máš typ, nahraď 'any'
    private quizActive: boolean = false;
    private canPlay: boolean = false;
    private currentQuestion: any = null;
    private monina!: Phaser.GameObjects.Sprite;
    private totalHintsLeft: number = 2;

    private lastGameSuccess: boolean = false;

    private quizCleanup: (() => void) | null = null;

    // Sekvence dialogů Moniny
    private moninaSequence: { key: string }[] = [
        { key: "monina-01" },
        { key: "monina-02" },
        { key: "monina-03" },
        // Přidej další klíče podle potřeby
    ];

    private moninaDestroyed: boolean = false;

    constructor() {
        super({ key: "Game" });
    }

    init(data: { odpadkyData: Odpadek[]; texts: any; responsive?: any }) {
        this.odpadky = data.odpadkyData.map(o => ({ ...o, sprite: undefined, inPytel: false }));
        this.texts = data.texts;
        if (data.responsive) this.responsive = data.responsive;
    }

    async create() {
 console.log('🚀 CREATE METHOD STARTED');

        const { width: gameWidth, height: gameHeight } = this.scale;
        this.createBackground(gameWidth, gameHeight);
        this.createPytel(gameWidth, gameHeight);
        this.createOdpadky();
        this.scoreboard = new Scoreboard(this, this.odpadky.length, this.timeLeft, this.texts);
        this.dialog = new DialogManager(this, this.texts);
        const language = this.texts.language || 'cs';
        this.quiz = new Quiz(language);

        // Reset časovače a skóre
        this.timeLeft = 120;
        this.scoreboard.reset?.();
        this.quiz?.reset?.();
        this.lastGameSuccess = false;

        // Přidej debug info na začátek
        console.log('=== GAME CREATE START ===');
        console.log('Responsive info:', this.responsive?.getDebugInfo());
        console.log('Device type:', this.responsive?.getDeviceType());
        console.log('Is mobile:', this.responsive?.isMobile());
        console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
        console.log('Phaser size:', this.scale.width, 'x', this.scale.height);

        // DŮLEŽITÉ: načti otázky!
        await this.quiz.loadQuestions();

        // 1. Monina a úvodní dialog - NOVÝ PŘÍSTUP
        this.monina = this.add.sprite(100, 300, 'DivkaStoji');
        this.monina.setScale(0.7);
        this.monina.setOrigin(0.5);
        this.monina.setInteractive();

        // Jednoduchý timer pro automatické zmizení Moniny
        const MONINA_LIFETIME = 8000; // 8 sekund celkem

        // Spustíme dialogy asynchronně
        this.startMoninaDialogs();

        // Timer pro vynucené zničení Moniny
        this.time.delayedCall(MONINA_LIFETIME, () => {
            this.forceDestroyMonina();
            this.enableGamePlay();
        });

        // Kliknutí na Moninu = okamžité zničení
        this.monina.once('pointerdown', () => {
            this.forceDestroyMonina();
            this.enableGamePlay();
        });

        // Drag & drop eventy pouze zde:
        this.input.on(
            'dragstart',
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) => {
                if (!this.canPlay || this.quizActive) {
                    (pointer.event as Event).preventDefault();
                    return;
                }
                // Při prvním tahu zničíme Moninu
                this.forceDestroyMonina();

                this.odpadkyGroup.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
                    (obj as Phaser.GameObjects.Sprite).alpha = obj === gameObject ? 1 : 0.5;
                });

                if (!this.timerEvent) {
                    this.startTimer();
                }
            }
        );

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (_: unknown, _gameObject: Phaser.GameObjects.Sprite) => {
            // Obnov alpha všem odpadkům
            this.odpadkyGroup.getChildren().forEach(obj => {
                (obj as Phaser.GameObjects.Sprite).alpha = 1;
            });
            // Obnov interaktivitu
            this.odpadky.forEach(o => {
                if (o.sprite) {
                    o.sprite.setInteractive();
                    o.sprite.setAlpha(1);
                    this.input.setDraggable(o.sprite, true);
                }
            });
        });

        // Sjednocené volání quizForOdpadek – pouze zde!
        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dropZone: Phaser.GameObjects.Image) => {
            if (!this.canPlay || this.quizActive) return;
            if (dropZone !== this.pytel) return;

            const odpadek = this.odpadky.find(o => o.sprite === gameObject);
            if (!odpadek) return;

            this.quizForOdpadek(odpadek, () => {
                if (odpadek.sprite) {
                    this.odpadkyGroup.remove(odpadek.sprite, true, true);
                    odpadek.sprite = undefined;
                }
                // Obnov interaktivitu ostatních odpadků
                this.odpadky.forEach(o => o.sprite?.setInteractive());
            });
        });

        // Scoreboard reset
        this.scoreboard.reset();

        //if (window.DEBUG_MODE) {
        this.children.list
            .filter(obj => obj instanceof Phaser.GameObjects.Sprite && (obj as Phaser.GameObjects.Sprite).texture.key === 'DivkaStoji')
            .forEach((obj, i) => {
                console.log(`Monina instance #${i + 1}:`, obj);
            });
        //}
    }

    private onOdpadekDragStart(gameObject: Phaser.GameObjects.Sprite): void {
        // Example implementation: highlight the dragged object
        gameObject.setAlpha(1);
        this.odpadkyGroup.getChildren().forEach(obj => {
            if (obj !== gameObject) {
                (obj as Phaser.GameObjects.Sprite).setAlpha(0.5);
            }
        });
    }

    private onOdpadekDragEnd(gameObject: Phaser.GameObjects.Sprite): void {
        // Restore alpha for all sprites
        this.odpadkyGroup.getChildren().forEach(obj => {
            (obj as Phaser.GameObjects.Sprite).setAlpha(1);
        });
        // Optionally, re-enable interactivity
        this.odpadky.forEach(o => {
            if (o.sprite) {
                o.sprite.setInteractive();
                this.input.setDraggable(o.sprite, true);
            }
        });
    }

    // Nová metoda pro jednoduché spuštění dialogů
    private async startMoninaDialogs(): Promise<void> {
        try {
            for (let i = 0; i < this.moninaSequence.length; i++) {
                // Kontrola existence Moniny před každým dialogem
                if (!this.monina || !this.monina.active || this.moninaDestroyed) {
                    break;
                }

                const item = this.moninaSequence[i];
                await this.dialog.showDialogAbove(item.key, this.monina, -60);
                await this.delay(1200);
                this.dialog.hideDialog?.();
            }
        } catch (error) {
            console.warn('Dialog chyba:', error);
        }
    }

    // Nová metoda pro vynucené zničení Moniny
    private forceDestroyMonina(): void {
        if (this.monina) {
            this.moninaDestroyed = true; // <-- přidej tuto řádku
            this.dialog.hideDialog?.();
            this.monina.destroy();
            this.monina = null as any;
            console.log('Monina byla zničena');
        }
    }

    // Pomocná metoda pro delay
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.time.delayedCall(ms, () => resolve());
        });
    }

    private enableGamePlay() {
        this.canPlay = true;
        this.odpadky.forEach(odpadek => {
            if (odpadek.sprite) {
                odpadek.sprite.setInteractive({ draggable: true });
            }
        });
        if (!this.timerEvent) {
            // Timer nespouštíme automaticky, jen až při prvním tahu
        }
    }

    private createBackground(gameWidth: number, gameHeight: number) {
        const background = this.add.image(gameWidth / 2, gameHeight / 2, "freepik_forest_01");
        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        background.setScale(Math.max(scaleX, scaleY));
        background.setOrigin(0.5);
    }

    private createPytel(gameWidth: number, gameHeight: number) {
        this.pytel = this.add.image(gameWidth * 0.85, gameHeight * 0.88, 'prazdnyPytel');
        this.pytel.setScale(Math.min(UI.PYTEL.SCALE, gameWidth * 0.0007));
        this.pytel.setOrigin(0.5);
        this.pytel.setInteractive({ dropZone: true });
    }

    // 1. Vytvoření odpadků (beze změny)
    private createOdpadky(): void {
        this.odpadkyGroup = this.add.group();

        this.odpadky.forEach((odpadek, idx) => {
            if (
                !odpadek ||
                !odpadek.pozice ||
                typeof odpadek.pozice.x !== "number" ||
                typeof odpadek.pozice.y !== "number" ||
                typeof odpadek.typ !== "string"
            ) {
                console.error(`Chybný odpadek na indexu ${idx}:`, odpadek);
                return;
            }

            odpadek.sprite = this.add.sprite(
                odpadek.pozice.x,
                odpadek.pozice.y,
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
            odpadek.sprite.setAlpha(1); // <-- přidej tuto řádku
            this.odpadkyGroup.add(odpadek.sprite);
        });
    }

    // 4. Kvíz pro odpadek – blokování ostatních odpadků během kvízu
    private quizForOdpadek(odpadek: Odpadek | undefined, onComplete: () => void) {

        if (!odpadek) return;
        // 1: Zjisti, jaký typ hledáš
        console.log('Hledám otázku pro typ:', odpadek.typ);

        if (this.quizActive) return;

        this.quizActive = true;
        this.odpadky.forEach(o => o.sprite?.disableInteractive());

        // 2: Vypiš všechny typy, které jsou v otázkách
        console.log('Typy v otázkách:', this.quiz ? (this.quiz as any).questions?.map((q: any) => q.type) : 'quiz nenastaven');

        const question = this.quiz.getQuestionForType(odpadek.typ);

        // 3: Vypiš, co metoda vrátila
        console.log('Výsledek getQuestionForType:', question);

        if (!question) {
            this.quizActive = false;
            this.odpadky.forEach(o => o.sprite?.setInteractive());
            onComplete();
            return;
        }

        const questionMaxWidth = 600;
        const padding = 32;

        const questionText = this.add.text(0, 0, question.question, {
            fontSize: '22px',
            color: '#2e7d32',
            fontFamily: 'Arial',
            wordWrap: { width: questionMaxWidth }
        }).setDepth(1002);

        let boxWidth = questionText.width + padding * 2;
        let boxHeight = questionText.height + padding * 2 + 60 + question.options.length * 44;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const box = this.add.rectangle(centerX, centerY, boxWidth, boxHeight, 0xf5f5dc, 0.95)
            .setDepth(1001)
            .setStrokeStyle(3, 0x4caf50);

        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        questionText.setPosition(boxX + padding, boxY + padding);

        let hintBtnY = boxY + padding + questionText.height + 24;
        const hintTextTemplate = this.texts.dialogSequence?.hintButton ?? "💡 Nápověda ({count})";
        const hintBtn = this.add.text(
            boxX + boxWidth / 2,
            hintBtnY,
            hintTextTemplate.replace("{count}", String(this.totalHintsLeft)),
            {
                fontSize: '20px',
                color: '#1565c0',
                fontFamily: 'Arial',
                backgroundColor: '#e3f2fd',
                padding: { left: 10, right: 10, top: 4, bottom: 4 }
            }
        ).setOrigin(0.5).setDepth(1002).setInteractive();

        let optionsStartY = hintBtnY + 44;
        let hintText: Phaser.GameObjects.Text | null = null;
        let hintUsed = false;

        hintBtn.on('pointerdown', () => {
            if (!hintUsed && question.hint && this.totalHintsLeft > 0 && this.timeLeft > 10) {
                hintUsed = true;
                this.totalHintsLeft--;
                hintBtn.setText(hintTextTemplate.replace("{count}", String(this.totalHintsLeft)));
                if (!hintText) {
                    hintText = this.add.text(boxX + boxWidth / 2, optionsStartY, question.hint, {
                        fontSize: '20px',
                        color: '#555',
                        fontFamily: 'Arial',
                        wordWrap: { width: questionMaxWidth - 80 }
                    }).setOrigin(0.5).setDepth(1002);

                    const hintHeight = hintText.height + 16;
                    optionButtons.forEach((btn, i) => {
                        btn.setY(optionsStartY + hintHeight + i * 44);
                    });

                    const newBoxHeight = questionText.height + padding * 2 + 60 + hintText.height + 16 + question.options.length * 44;
                    if (newBoxHeight > box.height) {
                        box.setSize(boxWidth, newBoxHeight);
                    }
                } else {
                    hintText.setStyle({ color: '#1976d2', fontStyle: 'bold' });
                }

                this.timeLeft -= 10;

                if (this.totalHintsLeft <= 0 || this.timeLeft <= 10) {
                    hintBtn.setAlpha(0.5).disableInteractive();
                }

                if (this.timeLeft < 1) {
                    box.destroy();
                    questionText.destroy();
                    hintBtn.destroy();
                    optionButtons.forEach(b => b.destroy());
                    if (hintText) hintText.destroy();
                    this.quizActive = false;
                    this.quizCleanup = null;
                    this.stopTimer();
                    this.showFinalScene();
                }
            }
        });

        const optionButtons: Phaser.GameObjects.Text[] = [];
        question.options.forEach((opt, i) => {
            const btn = this.add.text(boxX + boxWidth / 2, optionsStartY + i * 44, opt, {
                fontSize: '20px',
                color: '#222',
                fontFamily: 'Arial',
                backgroundColor: '#e0e0e0',
                padding: { left: 12, right: 12, top: 6, bottom: 6 }
            }).setOrigin(0.5).setDepth(1002).setInteractive();

            btn.on('pointerdown', () => {
                if (i === question.answer) {
                    this.scoreboard.markCorrect();
                }
                box.destroy();
                questionText.destroy();
                hintBtn.destroy();
                optionButtons.forEach(b => b.destroy());
                if (hintText) hintText.destroy();

                this.odpadky.forEach(o => {
                    if (o.sprite) {
                        o.sprite.setInteractive();
                        this.input.setDraggable(o.sprite, true);
                    }
                });
                this.quizActive = false;
                onComplete();

                const zbyva = this.odpadky.some(o => o.sprite !== null);
                if (!zbyva) {
                    this.stopTimer();
                    this.pytel.setTexture('plnyPytel');

                    let dialogKey: string;
                    const total = this.odpadky.length;
                    if (this.timeLeft <= 0) {
                        dialogKey = "finalFailTime";
                    } else if (this.scoreboard.getCorrectCount?.() ?? 0 < Math.ceil(total * 0.8)) {
                        dialogKey = "finalFailScore";
                    } else {
                        dialogKey = "finalSuccess";
                    }

                    this.lastGameSuccess = dialogKey === "finalSuccess";
                    this.dialog.showDialog(dialogKey);

                    // OPRAVA: vždy proveď vyhodnocení
                    this.endGame();
                }
            });

            optionButtons.push(btn);
        });

        this.quizCleanup = () => {
            if (!this.quizActive) return;
            this.quizActive = false;
            this.quizCleanup = null;

            box.destroy();
            questionText.destroy();
            hintBtn.destroy();
            optionButtons.forEach(b => b.destroy());
            if (hintText) hintText.destroy();
            this.odpadky.forEach(o => {
                if (o.sprite) {
                    o.sprite.setInteractive();
                    this.input.setDraggable(o.sprite, true);
                }
            });
        };
    }

    private startTimer(): void {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft = Math.max(0, this.timeLeft - 1);
                this.scoreboard.updateTime(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.stopTimer();
                    this.endGame();
                }
            },
            loop: true
        });
    }

    private stopTimer(): void {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = undefined as any;
        }
    }

    private gameEnded = false;

    private endGame(): void {
        if (this.gameEnded) return;
        this.gameEnded = true;

        const correct = this.scoreboard.getCorrectCount();
        let success = false;
        if (this.timeLeft <= 0) {
            // Pokud vypršel čas
            success = correct >= 8;
        } else {
            // Pokud hráč dokončil všechny odpovědi
            success = correct >= 8;
        }
        this.lastGameSuccess = success;

        if (success) {
            this.showPergamenAndTransition();
        } else {
            this.showFailScreen();
        }
    }

    // Zobraz pergamen s interakcí po úspěchu
    private showPergamenAndTransition(): void {
        const pergamen = this.add.image(this.scale.width / 2, this.scale.height / 2, 'pergamen')
            .setDepth(2000)
            .setInteractive();
        pergamen.on('pointerdown', () => {
            pergamen.destroy();
            this.showFinalScene();
        });
        // Můžeš přidat i text "Gratulujeme!" apod.
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "Gratulujeme!", {
            fontSize: '36px',
            color: '#2e7d32',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2001);
    }

    // Zobraz neúspěšný konec s tlačítkem pro návrat na Intro
    private showFailScreen(): void {
        const failText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
            "Bohužel, nesplnil(a) jsi úkol.\nZkus to znovu!", {
            fontSize: '28px',
            color: '#b71c1c',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);

        const btn = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40,
            "↩️ Zpět na začátek", {
            fontSize: '24px',
            color: '#1565c0',
            fontFamily: 'Arial',
            backgroundColor: '#e3f2fd',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(2001).setInteractive();

        btn.on('pointerdown', () => {
            // Reset časovače a skóre
            // this.timeLeft = 120;
            // this.scoreboard.reset?.();
            // this.quiz?.reset?.();
            // this.lastGameSuccess = false;
            this.scene.start('Intro');
        });
    }

    // Implement missing onOdpadekDrop method
    private onOdpadekDrop(gameObject: Phaser.GameObjects.Sprite, dropZone: Phaser.GameObjects.Image) {
        if (dropZone === this.pytel && this.currentOdpadek) {
            this.currentOdpadek.inPytel = true;
            this.scoreboard.markCorrect();
            gameObject.setVisible(false);

            // Zviditelni ostatní odpadky
            this.odpadky.forEach(o => {
                if (!o.inPytel && o.sprite) o.sprite.setAlpha(1);
            });

            if (this.allOdpadkyInPytel()) {
                this.stopTimer();
                this.endGame();
            }
        }
    }


    // Implementace metody showFinalScene
    private showFinalScene(): void {
        // Zobraz finální obrazovku nebo přejdi na další scénu
        // Toto je pouze příklad, uprav dle potřeby
        this.scene.start('GameOver', {
            score: this.scoreboard.getCorrectCount?.() ?? 0,
            timeLeft: this.timeLeft,
            success: this.lastGameSuccess ?? false
        });
    }

    // Přidáno: metoda pro kontrolu, zda jsou všechny odpadky v pytli
    private allOdpadkyInPytel(): boolean {
        return this.odpadky.every(o => o.inPytel);
    }

    // ...další metody a zbytek kódu...
}

