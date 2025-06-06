import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from "../../utils/quiz";

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
    private scoreValue: number = 0;
    private timeLeft: number = 120; // např. 2 minuty
    private timerText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private timerEvent!: Phaser.Time.TimerEvent;

    private moninaSequence: { key: string; obj: Phaser.GameObjects.Image }[] = [];
    private dialog!: DialogManager;

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
        this.pytel.setAlpha(0.85);

        // Pak odpadky (budou nad pytlem)
        this.quiz = new Quiz(this.language);
        await this.quiz.loadQuestions(this.odpadky.length);

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
                            await this.dialog.showDialogAbove(item.key, this.monina, -60);
                            // Delší prodleva na přečtení
                            await new Promise(resolve => this.time.delayedCall(2200, resolve));
                            // Skryj dialog po každé větě (nebo jen po poslední, podle potřeby)
                            this.dialog.hideDialog?.();
                        }
                        // Po posledním dialogu nech Moninu zmizet
                        this.tweens.add({
                            targets: this.monina,
                            alpha: 0,
                            duration: 800,
                            ease: 'Power2',
                            onComplete: () => {
                                this.monina.visible = false;
                                // Skryj dialog i zde pro jistotu
                                this.dialog.hideDialog?.();
                                // Po 2-3 sekundách spusť kvíz nebo další logiku
                                this.time.delayedCall(2000, () => {
                                    // this.startQuiz();
                                });
                            }
                        });
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

            this.input.once('pointerdown', () => {
                //this.scene.start('GameOver');
            });

            this.score();
        }

        // Na začátku scény
        this.quiz = new Quiz(this.language);
        await this.quiz.loadQuestions(this.odpadky.length);
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

    private score(): void {
        // Zobraz skóre
        this.scoreText = this.add.text(32, 32, `Skóre: ${this.scoreValue}`, {
            fontSize: '28px',
            color: '#222',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        // Zobraz časovač
        this.timerText = this.add.text(32, 70, `Čas: ${this.timeLeft}`, {
            fontSize: '28px',
            color: '#222',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        // Časovač nespouštěj zde!
    }

    // private quiz(): void {
    //     //TODO: Vytvoreni quizu v ../../utils/quiz.ts
    // }

    private createOdpadky(): void {
        // Vytvoř skupinu pro odpadky
        const odpadkyGroup = this.add.group();

        this.odpadky.forEach(odpadek => {
            odpadek.sprite = this.add.sprite(
                odpadek.pozice.x,
                odpadek.pozice.y,
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
            this.input.setDraggable(odpadek.sprite);

            odpadkyGroup.add(odpadek.sprite);
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
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        );

        let timerStarted = false;

        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
            // Zeslab všechny odpadky kromě právě taženého
            odpadkyGroup.getChildren().forEach((obj: any) => {
                obj.alpha = obj === gameObject ? 1 : 0.5;
            });
            // Spusť časovač pouze při prvním drag
            if (!timerStarted) {
                this.startTimer();
                timerStarted = true;
            }
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
            // Kontrola, zda byl odpadek "odložen" do pytle
            if (Phaser.Geom.Intersects.RectangleToRectangle(
                gameObject.getBounds(), this.pytel.getBounds()
            )) {
                // Najdi odpadek podle sprite
                const odpadek = this.odpadky.find(o => o.sprite === gameObject);
                if (odpadek) {
                    // Skryj nebo deaktivuj odpadek
                    if (odpadek.sprite) {
                        odpadek.sprite.visible = false;
                    }
                    odpadek.status = 'in_bag';
                }

                // Zeslab celou group odpadků (nelze brát další)
                odpadkyGroup.setAlpha(0.3);

                // Spusť kvízovou otázku k tomuto odpadku
                this.quizForOdpadek(odpadek, () => {
                    // Po zodpovězení otázky opět povol group
                    odpadkyGroup.setAlpha(1);
                });
            } else {
                // Pokud nebyl odložen do pytle, obnov alpha všem (vše zůstává aktivní)
                odpadkyGroup.getChildren().forEach((obj: any) => {
                    obj.alpha = 1;
                });
            }
        });
    }

    // Přidej metodu pro spuštění kvízu k odpadku
    private quizForOdpadek(odpadek: Odpadek | undefined, onComplete: () => void) {
        if (!odpadek) return;

        // Získání otázky podle pořadí odpadku
        const index = this.odpadky.indexOf(odpadek);
        const question = this.quiz.getQuestion(index);
        if (!question) {
            onComplete();
            return;
        }

        console.log('Spouštím kvíz pro odpadek:', odpadek, 'Otázka:', question);

        // Overlay pro otázku
        const overlay = this.add.rectangle(512, 384, 600, 340, 0x000000, 0.7).setDepth(1000);
        const box = this.add.rectangle(512, 384, 560, 260, 0xffffff, 1).setDepth(1001).setStrokeStyle(2, 0x222222);

        // Text otázky
        const questionText = this.add.text(512, 270, question.question, {
            fontSize: '26px',
            color: '#222',
            fontFamily: 'Arial',
            wordWrap: { width: 520 }
        }).setOrigin(0.5).setDepth(1002);

        // Hint tlačítko
        let hintText: Phaser.GameObjects.Text | null = null;
        const hintBtn = this.add.text(512, 330, '💡 Nápověda', {
            fontSize: '22px',
            color: '#0077cc',
            fontFamily: 'Arial',
            backgroundColor: '#e0e0e0',
            padding: { left: 10, right: 10, top: 4, bottom: 4 }
        }).setOrigin(0.5).setDepth(1002).setInteractive();

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
                this.timerText.setText(`Čas: ${this.timeLeft}`);
                hintBtn.setAlpha(0.5).disableInteractive();
            }
        });

        // Možnosti odpovědí
        const optionButtons: Phaser.GameObjects.Text[] = [];
        question.options.forEach((opt, i) => {
            const btn = this.add.text(512, 410 + i * 40, opt, {
                fontSize: '24px',
                color: '#222',
                fontFamily: 'Arial',
                backgroundColor: '#e0e0e0',
                padding: { left: 12, right: 12, top: 6, bottom: 6 }
            }).setOrigin(0.5).setDepth(1002).setInteractive();

            btn.on('pointerdown', () => {
                // Vyhodnocení odpovědi
                const correct = i === question.answer;
                if (correct) {
                    this.scoreValue += 10;
                    this.scoreText.setText(`Skóre: ${this.scoreValue}`);
                }
                // Zruš UI overlay
                overlay.destroy();
                box.destroy();
                questionText.destroy();
                hintBtn.destroy();
                optionButtons.forEach(b => b.destroy());
                if (hintText) hintText.destroy();

                // Pokračuj ve hře
                onComplete();
            });

            optionButtons.push(btn);
        });
    }

    private startTimer(): void {
        if (this.timerEvent) return; // už běží
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`Čas: ${this.timeLeft}`);
                if (this.timeLeft <= 0) {
                    this.timerEvent.remove();
                    // TODO: Konec hry, vyhodnocení skóre
                }
            },
            loop: true
        });
    }

    update(): void {
        //TODO: Herní logika (např. kontrola dokončení, časovač, animace)
        

    }
}

