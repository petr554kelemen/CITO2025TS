import Phaser from "phaser";
import Scoreboard from "../../utils/scoreboard";
import DialogManager from "../../utils/DialogManager";
import { Quiz, QuizQuestion } from "../../utils/quiz";
import { UI } from "../../config/constants";

// Typ pro odpadek
type Odpadek = {
    typ: string;
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

    constructor() {
        super({ key: "Game" });
    }

    init(data: { odpadkyData: Odpadek[]; texts: any; responsive?: any }) {
        this.odpadky = data.odpadkyData.map(o => ({ ...o, sprite: undefined, inPytel: false }));
        this.texts = data.texts;
        if (data.responsive) this.responsive = data.responsive;
    }

    create() {
        const { width: gameWidth, height: gameHeight } = this.scale;
        this.createBackground(gameWidth, gameHeight);
        this.createPytel(gameWidth, gameHeight);
        this.createOdpadky(gameWidth, gameHeight);
        this.scoreboard = new Scoreboard(this, this.odpadky.length, this.timeLeft, this.texts);
        this.dialog = new DialogManager(this, this.texts);
        const language = this.texts.language || 'cs';
        this.quiz = new Quiz(language);

        // Nastavení drag & drop
        this.input.on("dragstart", (_: any, gameObject: Phaser.GameObjects.Sprite) => {
            this.onOdpadekDragStart(gameObject);
        });
        this.input.on("drag", (_: any, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        this.input.on("dragend", (_: any, gameObject: Phaser.GameObjects.Sprite) => {
            this.onOdpadekDragEnd(gameObject);
        });
        this.input.on("drop", (_: any, gameObject: Phaser.GameObjects.Sprite, dropZone: Phaser.GameObjects.Image) => {
            this.onOdpadekDrop(gameObject, dropZone);
        });

        // Nastav pytel jako drop zónu
        this.pytel.setInteractive({ dropZone: true });

        // Scoreboard reset
        this.scoreboard.reset();
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
    }

    private createOdpadky(gameWidth: number, gameHeight: number) {
        this.odpadkyGroup = this.add.group();

        // Výpočet scaleFactor a převodních funkcí stejně jako v Intro
        const scaleFactor = Math.min(gameWidth / 667, gameHeight / 375);
        const px = (x: number) => Math.round(gameWidth * (x / 667));
        const py = (y: number) => Math.round(gameHeight * (y / 375));

        this.odpadky.forEach((odpadek: any) => {
            // Použij uložené pozice a vlastnosti z Intro
            const x = odpadek.x !== undefined ? px(odpadek.x) : gameWidth / 2;
            const y = odpadek.y !== undefined ? py(odpadek.y) : gameHeight / 2;
            odpadek.sprite = this.add.sprite(x, y, odpadek.typ);
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale * scaleFactor);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
            this.input.setDraggable(odpadek.sprite, true);
            this.odpadkyGroup.add(odpadek.sprite);

            // Ulož výchozí pozici pro případné vrácení
            odpadek.origX = x;
            odpadek.origY = y;
        });
    }

    private onOdpadekDragStart(gameObject: Phaser.GameObjects.Sprite) {
        if (!this.timerStarted) {
            this.startTimer();
        }
        // Najdi odpadek podle sprite
        this.currentOdpadek = this.odpadky.find(o => o.sprite === gameObject);
    }

    private onOdpadekDragEnd(gameObject: Phaser.GameObjects.Sprite) {
        if (this.currentOdpadek && !this.currentOdpadek.inPytel) {
            gameObject.x = this.currentOdpadek.origX;
            gameObject.y = this.currentOdpadek.origY;
        }
    }

    private onOdpadekDrop(gameObject: Phaser.GameObjects.Sprite, dropZone: Phaser.GameObjects.Image) {
        if (dropZone === this.pytel && this.currentOdpadek) {
            this.currentOdpadek.inPytel = true;
            this.scoreboard.markCorrect();
            gameObject.setVisible(false);
            if (this.allOdpadkyInPytel()) {
                this.stopTimer();
                this.endGame();
            }
        }
    }

    private allOdpadkyInPytel(): boolean {
        return this.odpadky.every((o: Odpadek) => o.inPytel);
    }

    private startTimer(): void {
        this.timerStarted = true;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.scoreboard.setTime(this.timeLeft);
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
            this.timerEvent.remove(false);
            this.timerEvent = undefined;
        }
        this.timerStarted = false;
    }

    private endGame(): void {
        // Zde můžeš zobrazit závěrečnou scénu, dialog, skóre apod.
        this.dialog.showDialog("gameOver");
        // this.scene.start("Intro"); // nebo přechod na další scénu
    }
}

