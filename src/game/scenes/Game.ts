import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";
import { Quiz } from "../../utils/quiz";

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
    private pytel!: Phaser.GameObjects.Sprite;
    private monina!: Phaser.GameObjects.Sprite;
    //private quiz!: Quiz;
    // private timeLeft: number = 120;
    // private timerText!: Phaser.GameObjects.Text;

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

    create(): void {
        // pozadí pro hru s kvízem
        const backgroundGame = this.add.image(512, 385, "freepik_forest_01");
        backgroundGame.setOrigin(0.5);

        this.cam = this.cameras.main;

        // Nastavení kamery
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.cam.setBounds(0, 0, 1024, 768);
        this.cam.setZoom(1);

        // Nastavení scény

        this.createOdpadky();

        this.setupMonina();
        this.monina = this.add.sprite(200, 560, "monina", 0); // frame 0
        
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
                    for (const item of this.moninaSequence) {
                        // Zavoláme novou metodu, která se postará o zobrazení, čekání a skrytí
                        this.dialog.showDialogAbove(item.key, this.monina);
                    }
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
            { key: 'monina-05', obj: this.monina }
        ];
    }

    private score(): void {
        //TODO: Vytvoreni skore dialogu
    }

    private quiz(): void {
        //TODO: Vytvoreni quizu v ../../utils/quiz.ts
    }

    private createOdpadky(): void {
        this.odpadky.forEach(odpadek => {
            odpadek.sprite = this.add.sprite(
                odpadek.pozice.x,
                odpadek.pozice.y,
                odpadek.typ
            );
            if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
            if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
            odpadek.sprite.setInteractive();
            // Další logika pro drag & drop, eventy atd.
        });
    }

    update(): void {
        //TODO: Herní logika (např. kontrola dokončení, časovač, animace)
        

    }
}