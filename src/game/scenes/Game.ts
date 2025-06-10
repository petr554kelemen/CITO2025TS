import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from "../../utils/quiz";
import Scoreboard from "../../utils/scoreboard";

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

    private quizCleanup: (() => void) | null = null;

    //private odpadyIcons: Phaser.GameObjects.Sprite[] = [];
    private odpadkyGroup!: Phaser.GameObjects.Group;

    //private bagIcons: Phaser.GameObjects.Image[] = [];

    private scoreboard!: Scoreboard;

    //score: number = 0;

    private totalHintsLeft: number = 2;
    private lastGameSuccess: boolean = false;

    private originalOdpadky: Odpadek[] = [];

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
        // Ulož originál pro restart
        this.originalOdpadky = data.odpadkyData.map(o => ({ ...o, sprite: null }));
        this.odpadky = data.odpadkyData.map(o => ({ ...o, sprite: null }));
    }

    async create(): Promise<void> {
        // LADICÍ REŽIM: Přeskoč intro a hned zobraz GameOver
        if ((window as any).DEBUG_MODE) {
            this.scene.start('GameOver', { texts: this.texts, language: this.language });
            return;
        }

        // Pokud už hráč úspěšně dokončil, rovnou GameOver
        if (localStorage.getItem('cito2025_success') === '1') {
            this.scene.start('GameOver', { texts: this.texts, language: this.language });
            return;
        }

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
                            duration: 300, // Sníženo z 600 na 300 (poloviční doba)
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
        this.monina.setScale(0.6); // <-- přidáno
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
        this.odpadky.forEach(o => o.sprite?.disableInteractive());

        const question = this.quiz.getQuestionForType(odpadek.typ);
        if (!question) {
            this.quizActive = false;
            this.odpadky.forEach(o => o.sprite?.setInteractive());
            onComplete();
            return;
        }

        // --- JEDEN BOX, vyšší neprůhlednost ---
        const questionMaxWidth = 600;
        const padding = 32;

        // Vytvoř text otázky
        const questionText = this.add.text(0, 0, question.question, {
            fontSize: '22px',
            color: '#2e7d32',
            fontFamily: 'Arial',
            wordWrap: { width: questionMaxWidth }
        }).setDepth(1002);

        // Výpočet šířky a výšky boxu
        let boxWidth = questionText.width + padding * 2;
        let boxHeight = questionText.height + padding * 2 + 60 + question.options.length * 44;

        // Vytvoř pouze jeden box s vyšší neprůhledností
        const box = this.add.rectangle(512, 384, boxWidth, boxHeight, 0xf5f5dc, 0.95)
            .setDepth(1001)
            .setStrokeStyle(3, 0x4caf50);

        // Zarovnej otázku do boxu s paddingem
        const boxX = 512 - boxWidth / 2;
        const boxY = 384 - boxHeight / 2;
        questionText.setPosition(boxX + padding, boxY + padding);

        // Hint tlačítko pod otázku, také uvnitř boxu
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
            if (!hintUsed && question.hint && this.totalHintsLeft > 0) {
                hintUsed = true;
                this.totalHintsLeft--;
                hintBtn.setText(hintTextTemplate.replace("{count}", String(this.totalHintsLeft))); hintBtn.setText(`💡 Nápověda (${this.totalHintsLeft})`);
                // První kliknutí: zobraz hint, druhé kliknutí: zvýrazni nebo zobraz znovu, další už ne
                if (!hintText) {
                    hintText = this.add.text(boxX + boxWidth / 2, optionsStartY, question.hint, {
                        fontSize: '20px',
                        color: '#555',
                        fontFamily: 'Arial',
                        wordWrap: { width: questionMaxWidth - 80 }
                    }).setOrigin(0.5).setDepth(1002);

                    // Posuň tlačítka ještě níž podle výšky hintu
                    const hintHeight = hintText.height + 16;
                    optionButtons.forEach((btn, i) => {
                        btn.setY(optionsStartY + hintHeight + i * 44);
                    });

                    // Zvětši box, pokud je potřeba
                    const newBoxHeight = questionText.height + padding * 2 + 60 + hintText.height + 16 + question.options.length * 44;
                    if (newBoxHeight > box.height) {
                        box.setSize(boxWidth, newBoxHeight);
                    }
                } else {
                    // Druhé kliknutí: můžeš třeba změnit barvu hintu, nebo ho jen zvýraznit
                    hintText.setStyle({ color: '#1976d2', fontStyle: 'bold' });
                }

                this.timeLeft -= 10;

                if (this.totalHintsLeft <= 0) {
                    hintBtn.setAlpha(0.5).disableInteractive();
                }
            }
            // Pokud už byl hint použit na tuto otázku, nebo došly nápovědy, nic nedělej
        });

        // --- Možnosti odpovědí ---
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
                // Vyhodnocení odpovědi
                if (i === question.answer) {
                    this.scoreboard.markCorrect();
                }
                // Zruš UI overlay
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

                // --- NOVÁ LOGIKA: Kontrola, zda už nejsou žádné odpadky ---
                const zbyva = this.odpadky.some(o => o.sprite !== null);
                if (!zbyva) {
                    this.timerEvent?.remove();
                    this.pytel.setTexture('plnyPytel');

                    let dialogKey: string;
                    const correct = this.scoreboard.getCorrectAnswers?.() ?? 0;
                    if (this.timeLeft <= 0) {
                        dialogKey = "finalFailTime";
                    } else if (correct < 8) { // Pevná hodnota pro úspěch (8 a více)
                        dialogKey = "finalFailScore";
                    } else {
                        dialogKey = "finalSuccess";
                    }

                    this.lastGameSuccess = dialogKey === "finalSuccess";
                    this.dialog.showDialog(dialogKey);
                    this.showFinalScene?.();

                    if ((window as any).DEBUG_MODE) {
                        const total = this.odpadky.length;
                        console.log('Konec hry: celkem odpadu:', total, 'správně:', correct);
                    }
                }
            });

            optionButtons.push(btn);
        });

        //console.log('Kvíz overlay by se měl zobrazit právě teď', question);

        this.quizCleanup = () => {
            // Zabrání opakovanému volání cleanup
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
                this.timeLeft--;
                this.scoreboard.updateTime(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.timerEvent.remove();
                    // --- NOVÉ: Ukonči probíhající kvíz ---
                    if (this.quizCleanup) {
                        this.quizCleanup();
                        this.quizCleanup = null;
                    }
                    
                    // --- Zkontroluj počet správných odpovědí před zobrazením závěrečného dialogu ---
                    const correct = this.scoreboard.getCorrectAnswers?.() ?? 0;
                    let dialogKey;
                    
                    if (correct >= 8) {  // Pokud hráč již získal 8+ správných odpovědí, hra je úspěšná
                        dialogKey = "finalSuccess";
                        this.lastGameSuccess = true;
                    } else {
                        dialogKey = "finalFailTime";
                        this.lastGameSuccess = false;
                    }
                    
                    this.dialog.showDialog(dialogKey);
                    this.showFinalScene?.();
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
                        pergamenY + 30,
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

                    // Po zobrazení pergamenu stačí kliknout kamkoliv a spustit GameOver
                    this.input.once('pointerdown', () => {
                        this.dialog.hideDialog();
                        if (pergamenImg) pergamenImg.destroy();
                        this.scene.start('GameOver', { texts: this.texts });
                    });
                    return; // Důležité: ukonči metodu, ať se nespustí kód níže
                } 
                else {
                    // NOVÉ: Při neúspěchu také počkej na kliknutí, místo automatického restartu
                    this.input.once('pointerdown', () => {
                        this.dialog.hideDialog();
                        // Proveď fade out a restart
                        this.cameras.main.fadeOut(800, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('Game', {
                                odpadkyData: this.odpadky,
                                language: this.language,
                                texts: this.texts
                            });
                        });
                    });
                    return; // Důležité: ukonči metodu, ať se nespustí automatický kód níže
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
}

