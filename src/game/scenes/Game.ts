import Phaser from "phaser";
import Scoreboard from "../../utils/scoreboard";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from "../../utils/quiz";
import { UI, DEBUG_MODE } from "../../config/constants";
import CameraControlManager from '../../utils/CameraControlManager';

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
    private timeLeft: number = UI.SCOREBOARD.TIMER_END;
    private responsive!: any; // Pokud máš typ, nahraď 'any'
    private odpadkyGroup!: Phaser.GameObjects.Group;
    private texts: any; // Pokud máš typ, nahraď 'any'
    private quizActive: boolean = false;
    private canPlay: boolean = false;
    private monina!: Phaser.GameObjects.Sprite;
    private totalHintsLeft: number = 2;

    private lastGameSuccess: boolean = false;

    private quizCleanup: (() => void) | null = null;

    // Sekvence dialogů Moniny
    private readonly moninaSequence: { key: string }[] = [
        { key: "monina-01" },
        { key: "monina-02" },
        { key: "monina-03" },
        { key: "monina-04" },
        { key: "monina-05" },
        { key: "monina-06" },
        { key: "monina-07" },
        { key: "monina-08" },
        { key: "monina-09" }
        // Přidej další klíče podle potřeby
    ];

    private moninaDestroyed: boolean = false;

    private cameraControl!: CameraControlManager;

    constructor() {
        super({ key: "Game" });
    }

    /**
     * Inicializuje scénu Game s daty o odpadcích, lokalizovanými texty a případně responzivitou.
     * @param data Objekt obsahující pole odpadků, texty a volitelně správce responzivity.
     */
    init(data: { odpadkyData: Odpadek[]; texts: any; responsive?: any }) {
        this.odpadky = data.odpadkyData.map(o => ({ ...o, sprite: undefined, inPytel: false }));
        this.texts = data.texts;
        if (data.responsive) this.responsive = data.responsive;
    }

    /**
     * Hlavní metoda pro vytvoření scény – nastaví pozadí, pytel, odpadky, scoreboard, dialogy, quiz a eventy.
     */
    create() {
        console.log('🚀 CREATE METHOD STARTED');

        const { width: gameWidth, height: gameHeight } = this.scale;
        this.createBackground(gameWidth, gameHeight);
        this.createPytel(gameWidth, gameHeight);
        this.createOdpadky();

        // Nastav maximální povolený čas (např. 1 hodina = 3600 sekund)
        const MAX_TIME = 3600; // 1 hodina v sekundách

        // Ověř, že časovač není nesmyslně vysoký
        if (this.timeLeft > MAX_TIME) {
            console.warn(`Zadaný časovač (${this.timeLeft}s) je příliš vysoký, nastavuji na ${MAX_TIME}s.`);
            this.timeLeft = MAX_TIME;
        }

        this.scoreboard = new Scoreboard(this, this.odpadky.length, this.timeLeft, this.texts);
        this.dialog = new DialogManager(this, this.texts);
        const language = (this as any).data?.language ?? this.texts.language ?? 'cs';
        this.quiz = new Quiz(language);

        // Reset časovače a skóre
        this.timeLeft = UI.SCOREBOARD.TIMER_END;
        this.scoreboard.reset?.();
        this.quiz?.reset?.();
        this.lastGameSuccess = false;
        
        // DŮLEŽITÉ: Reset stavu Moniny při restartu scény
        this.moninaDestroyed = false;
        this.canPlay = false;
        this.quizActive = false;
        this.gameEnded = false;

        // Přidej debug info na začátek
        if (DEBUG_MODE) {
            console.log('=== GAME CREATE START ===');
            console.log('Responsive info:', this.responsive?.getDebugInfo());
            console.log('Device type:', this.responsive?.getDeviceType());
            console.log('Is mobile:', this.responsive?.isMobile());
            console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
            console.log('Phaser size:', this.scale.width, 'x', this.scale.height);
            console.log('Camera control ready:', !!this.cameraControl);
            console.log('Quiz cleanup ready:', !!this.quizCleanup);
        }

        // Monina sprite vytvoř ihned, ale další logiku řeš až po načtení otázek
        this.monina = this.add.sprite(UI.MONINA.POS_X, UI.MONINA.POS_Y, 'DivkaStoji');
        this.monina.setScale(UI.MONINA.SCALE);
        this.monina.setOrigin(0.5);
        this.monina.setInteractive();

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

        // Přidej CameraControlManager
        this.cameraControl = new CameraControlManager(this, {
            enableFullscreen: true,
            enableDragY: false, // Vypnuto - nepotřebujeme s dobře vycentrovanou scénou
            iosZoom: 0.95,
            infoTextIOS: "🎯 Použijte zoom tlačítka pro přizpůsobení zobrazení."
        });

        // Spusť asynchronní inicializaci (načtení otázek, dialogy, handlery)
        this.initializeGameAsync();
    }

    // Nová metoda pro asynchronní inicializaci po synchronním create()
    private async initializeGameAsync() {
        if (DEBUG_MODE) {
            console.log('🔄 initializeGameAsync started. Monina destroyed:', this.moninaDestroyed);
            console.log('📋 Monina exists:', !!this.monina);
            console.log('🎭 Monina active:', this.monina?.active);
        }

        // DŮLEŽITÉ: načti otázky!
        await this.quiz.loadQuestions();

        // Handler na kliknutí na Moninu – přeruší dialogy a spustí hru
        this.monina.once('pointerdown', () => {
            if (DEBUG_MODE) console.log('👆 Monina clicked - skipping dialogs');
            this.time.delayedCall(800, () => {}, [], this);
            this.moninaDestroyed = true;
            this.forceDestroyMonina();
            this.enableGamePlay();
        });

        // Spusť dialogy Moniny asynchronně pouze pokud není zničena
        if (!this.moninaDestroyed && this.monina?.active) {
            if (DEBUG_MODE) console.log('🗣️ Starting Monina dialogs...');
            await this.startMoninaDialogs();
        } else if (DEBUG_MODE) {
            console.log('⚠️ Skipping dialogs - Monina destroyed or inactive');
        }

        // Pokud Monina nebyla zničena kliknutím, znič ji a povol hru až po všech dialozích
        if (!this.moninaDestroyed) {
            if (DEBUG_MODE) console.log('🎬 Dialogs completed - enabling gameplay');
            this.forceDestroyMonina();
            this.enableGamePlay();
        }
    }



    // Nová metoda pro jednoduché spuštění dialogů
    private async startMoninaDialogs(): Promise<void> {
        if (DEBUG_MODE) {
            console.log('💬 startMoninaDialogs called');
            console.log('📜 Dialog sequence length:', this.moninaSequence.length);
        }

        try {
            for (const item of this.moninaSequence) {
                // Kontrola existence Moniny před každým dialogem
                if (!this.monina || !this.monina.active || this.moninaDestroyed) {
                    if (DEBUG_MODE) console.log('❌ Breaking dialog loop - Monina state changed');
                    break;
                }

                if (DEBUG_MODE) console.log('💭 Showing dialog:', item.key);
                await this.dialog.showDialogAbove(item.key, this.monina, -60);
                await this.delay(2000);
                this.dialog.hideDialog?.();
            }
            
            if (DEBUG_MODE) console.log('✅ All dialogs completed successfully');
        } catch (error) {
            console.warn('Dialog chyba:', error);
        }
    }

    // Nová metoda pro vynucené zničení Moniny
    private forceDestroyMonina(): void {
        if (DEBUG_MODE) {
            console.log('💥 forceDestroyMonina called. Current state:', {
                exists: !!this.monina,
                active: this.monina?.active,
                destroyed: this.moninaDestroyed
            });
        }

        if (this.monina) {
            this.moninaDestroyed = true;
            this.dialog.hideDialog?.();
            this.monina.destroy();
            this.monina = null as any;
            console.log('✨ Monina byla zničena');
        } else if (DEBUG_MODE) {
            console.log('⚠️ Monina already destroyed or null');
        }
    }

    // Pomocná metoda pro delay
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.time.delayedCall(ms, () => resolve());
        });
    }

    /**
     * Povolení interaktivity pro všechny odpadky a nastavení jejich viditelnosti.
     * Spouští se po skončení dialogů Moniny.
     */
    private enableGamePlay() {
        if (DEBUG_MODE) {
            console.log('🎮 enableGamePlay called');
            console.log('🗑️ Odpadky count:', this.odpadky.length);
        }

        this.canPlay = true;
        this.odpadky.forEach(odpadek => {
            if (odpadek.sprite) {
                odpadek.sprite.setInteractive({ draggable: true });
                this.input.setDraggable(odpadek.sprite, true);
                odpadek.sprite.setAlpha(1); // Odpadek je plně viditelný
            }
        });
        
        if (!this.timerEvent) {
            // Timer nespouštíme automaticky, jen až při prvním tahu
            if (DEBUG_MODE) console.log('⏰ Timer ready to start on first drag');
        }
        
        if (DEBUG_MODE) console.log('✅ Game is now playable!');
    }

    /**
     * Vytvoří pozadí scény podle rozměrů okna.
     * @param gameWidth Šířka scény.
     * @param gameHeight Výška scény.
     */
    private createBackground(gameWidth: number, gameHeight: number) {
        const background = this.add.image(gameWidth / 2, gameHeight / 2, "freepik_forest_01");
        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        background.setScale(Math.max(scaleX, scaleY));
        background.setOrigin(0.5);
    }

    /**
     * Vytvoří pytel na odpadky na správné pozici a nastaví jej jako drop zónu.
     * @param gameWidth Šířka scény.
     * @param gameHeight Výška scény.
     */
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
                !odpadek?.pozice ||
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

            odpadek.sprite.setInteractive({ draggable: false }); // NEPOVOLUJ DRAGGABLE HNED!
            this.input.setDraggable(odpadek.sprite, false);

            odpadek.sprite.setAlpha(1);
            this.odpadkyGroup.add(odpadek.sprite);
        });
    }

    /**
     * Spustí kvíz pro konkrétní odpadek.
     * Během kvízu jsou ostatní odpadky neaktivní.
     * Po odpovědi se vyhodnotí výsledek a pokračuje hra.
     * @param odpadek Odpadek, pro který se spouští kvíz.
     * @param onComplete Callback, který se zavolá po dokončení kvízu.
     */
    private quizForOdpadek(odpadek: Odpadek | undefined, onComplete: () => void) {

        if (!odpadek) return;
        // 1: Zjisti, jaký typ hledáš
        console.log('Hledám otázku pro typ:', odpadek.typ);

        if (this.quizActive) return;

        this.quizActive = true;
        this.odpadky.forEach(o => {
            if (o.sprite && !o.inPytel) {
                o.sprite.setAlpha(1);
            }
        });

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

        const scaleFactor = this.responsive?.getScaleFactor?.(667, 375) ?? 1;
        const fontSize = Math.round(UI.QUIZ.QUESTION_FONT * scaleFactor);
        const questionMaxWidth = Math.min(this.scale.width * 0.8, 420 * scaleFactor);
        const padding = Math.round(16 * scaleFactor);

        const questionText = this.add.text(0, 0, question.question, {
            fontSize: `${fontSize}px`,
            color: UI.COLORS.QUESTION,
            fontFamily: 'Arial',
            wordWrap: { width: questionMaxWidth }
        }).setDepth(1002);

        let boxWidth = Math.min(questionText.width + padding * 2, questionMaxWidth + padding * 2);
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

                const zbyva = this.odpadky.some(o => o.sprite && !o.inPytel);
                if (!zbyva) {
                    this.stopTimer();
                    this.pytel.setTexture('plnyPytel');

                    const correct = this.scoreboard.getCorrectCount?.() ?? 0;
                    if (this.timeLeft <= 0) {
                        this.dialog.showDialog("finalFailTime");
                        this.lastGameSuccess = false;
                        this.endGame();
                    } else if (correct < 8) {
                        this.dialog.showDialog("finalFailScore");
                        this.lastGameSuccess = false;
                        this.endGame();
                    } else {
                        // ÚSPĚCH: NEZOBRAZUJ dialog, ale pouze klikací pergamen!
                        this.lastGameSuccess = true;
                        this.showPergamenAndTransition();
                        // this.endGame() už není potřeba, protože showPergamenAndTransition volá showFinalScene
                    }
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

            // DŮLEŽITÉ: Zviditelni všechny odpadky, které nejsou v pytli
            this.odpadky.forEach(o => {
                if (o.sprite && !o.inPytel) {
                    o.sprite.setAlpha(1);
                    o.sprite.setInteractive({ draggable: true });
                    this.input.setDraggable(o.sprite, true);
                }
            });
        };
    }

    /**
     * Spustí časovač hry, který každou sekundu snižuje čas a aktualizuje scoreboard.
     * Po vypršení času ukončí hru.
     */
    private startTimer(): void {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft = Math.max(0, this.timeLeft - 1);
                this.scoreboard.updateTime(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.endGame(); // Zavolej metodu pro ukončení hry
                }
            },
            loop: true
        });
    }

    /**
     * Zastaví časovač hry.
     */
    private stopTimer(): void {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = undefined as any;
        }
    }

    private gameEnded = false;

    private endGame(): void {
        if (this.gameEnded) return;  // Opravená syntaxe s oběma závorkami
        this.gameEnded = true;

        // Znepřístupni odpadky a kvíz
        this.canPlay = false;
        this.quizActive = false;
        this.odpadky.forEach(o => {
            if (o.sprite) {
                o.sprite.disableInteractive?.();
                this.input.setDraggable(o.sprite, false);
            }
        });

        const correct = this.scoreboard.getCorrectCount();
        const success = correct >= 8; // Jednoduché a jasné vyhodnocení

        this.lastGameSuccess = success;

        if (success) {
            localStorage.setItem("CITO2025_FINISHED", "1");
            this.showPergamenAndTransition();
        } else {
            this.showFailScreen();
        }
    }

    /**
     * Zobrazí animovaný pergamen po úspěšném dokončení hry.
     * Po kliknutí na pergamen přejde na finální scénu.
     */
    private showPergamenAndTransition(): void {
        // Zobraz dialog s úspěšným textem (nad pergamenem)
        this.dialog.showDialog("finalSuccess");

        // Pergamen začíná mimo obrazovku nahoře
        const pergamenStartY = -200;
        const pergamenTargetY = this.scale.height / 2;

        const pergamen = this.add.image(this.scale.width / 2, pergamenStartY, 'Pergamen')
            .setDepth(2000)
            .setScale(.8)
            .setInteractive({ cursor: 'pointer' });

        // Tween: pergamen sjede dolů na cílovou pozici
        this.tweens.add({
            targets: pergamen,
            y: pergamenTargetY,
            duration: 1800,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Po dokončení tweenu umožni kliknutí na pergamen
                pergamen.setInteractive();
            }
        });

        // Kliknutí na pergamen až po dokončení animace
        pergamen.on('pointerdown', () => {
            pergamen.destroy();
            this.dialog.hideDialog?.();
            this.showFinalScene();
        });
    }

    private failScreenObjects: Phaser.GameObjects.GameObject[] = [];

    /**
     * Zobrazí obrazovku neúspěchu s možností restartu hry.
     * Po kliknutí restartuje hru a přejde na hlavní menu.
     */
    private showFailScreen(): void {
        // Znič předchozí fail screen objekty, pokud existují
        this.failScreenObjects.forEach(obj => obj.destroy());
        this.failScreenObjects = [];

        // Použití správného klíče s informací o možnosti opakování hry
        const failKey = "finalFail"; // Nový klíč, který obsahuje text o opakování
        this.dialog.showDialog(failKey);

        // Vytvoř neviditelné tlačítko přes celou obrazovku pro zachycení kliknutí
        const restartButton = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.01  // téměř průhledné
        ).setInteractive();

        // Přidej do seznamu objektů pro vyčištění
        this.failScreenObjects.push(restartButton);

        // Nastav hloubku pod dialog, ale nad ostatními věcmi
        restartButton.setDepth(2500);

        // Přidej event listener - přesměrování na MainMenu pro kompletní restart
        restartButton.once('pointerdown', () => {
            if (DEBUG_MODE) console.log('Restart game clicked - returning to MainMenu');
            this.dialog.hideDialog();
            
            // Přejdi na MainMenu pro kompletní restart hry
            this.scene.start('MainMenu');
        });
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


}

