import { addGuides } from '../../utils/ZlatyRez';
import Phaser from 'phaser';
import DialogManager from '../../utils/DialogManager';

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


	// data odpadků na scéně
	odpadkyData: Odpadek[] = [
		{ typ: "Banan", pozice: { x: 985, y: 555 }, scale: 1.4, status: 'default', sprite: null },
		{ typ: "Baterka", pozice: { x: 880, y: 485 }, scale: 0.75, status: 'default', sprite: null },
		{ typ: "Lahev", pozice: { x: 535, y: 550 }, scale: 1.5, status: 'default', sprite: null },
		{ typ: "Ohryzek", pozice: { x: 600, y: 720 }, scale: 0.65, angle: 70, status: 'default', sprite: null },
		{ typ: "Kapesnik", pozice: { x: 490, y: 650 }, status: 'default', sprite: null },
		{ typ: "Vajgl", pozice: { x: 725, y: 610 }, status: 'default', sprite: null },
		{ typ: "Karton", pozice: { x: 670, y: 505 }, status: 'default', sprite: null },
		{ typ: "Zvykacka", pozice: { x: 666, y: 566 }, status: 'default', sprite: null },
		{ typ: "Plechovka", pozice: { x: 845, y: 565 }, angle: 14, status: 'default', sprite: null },
		{ typ: "Petka", pozice: { x: 310, y: 630 }, scale: 1.5, angle: -44, status: 'default', sprite: null }
	];

	// Další property (třeba sprite pro pytel, logo...)
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

		// background
		this.background = this.add.image(512, 385, "freepik_forest_01");

		//zlaty rez
		this.guides = addGuides(this, { thirds: true, golden: false, color: 0x82e6f6 });

		// vytvoreni dialogů
		this.dialog = new DialogManager(this, this.texts);

		// objekt ducha na scenu
		this.duch = this.add.sprite(190, 280, "Duch", 0).setAlpha(0).setVisible(false);

		// pytel na odpadky na scéně
		this.pytel = this.add.sprite(810, 690, "prazdnyPytel");
		this.pytel.scaleX = 0.5;
		this.pytel.scaleY = 0.5;
		this.pytel.setSize(153, 512);

		// Vygeneruj všechny odpadky podle dat
		this.odpadkyData.forEach(odpadek => {
			odpadek.sprite = this.add.sprite(
				odpadek.pozice.x,
				odpadek.pozice.y,
				odpadek.typ
			);
			if (odpadek.scale !== undefined) odpadek.sprite.setScale(odpadek.scale);
			if (odpadek.angle !== undefined) odpadek.sprite.setAngle(odpadek.angle);
			odpadek.sprite.setInteractive();
			// případné další eventy, logika...
		});

		// vytvoření pytle na scéně
		//this.pytel = this.add.sprite(400, 300, 'prazdnyPytel').setScale(.25);
		//this.pytel.setInteractive();

		// umístění motýla na scénu
		const startX = 835; // pozor existuje jen v create()
		const startY = 475; // pozor existuje jen v create()

		// 1) Vytvoříme motýla (sprite s klíčem 'motyl'; předpokládejme, že preload už máme hotové)
		this.motyl = this.add.sprite(startX, startY, 'Motyl').setScale(.2);

		// 2) Vygenerujeme pole bodů z odpadků
		const path = this.odpadkyData.map((o, i) => ({
			x: o.pozice.x,
			// přidáme malou „cik-cak“ odchylku podle indexu
			y: o.pozice.y + (i % 2 === 0 ? 20 : -20)
		}));

		// 3) Přidáme ještě finální bod (podle pozice ducha)
		path.push({ x: this.duch.x + 150, y: this.duch.y });

		// Vybírám jen náhodné body pro motýla
		// 1a) Zkopíruj pole bez posledního bodu (ten je finální a musí zůstat)
		const pathWithoutFinal = path.slice(0, -1); // vezme všechny kromě posledního

		// 2a) Zamíchej pole - použijeme Fisher-Yates shuffle
		for (let i = pathWithoutFinal.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pathWithoutFinal[i], pathWithoutFinal[j]] = [pathWithoutFinal[j], pathWithoutFinal[i]];
		}
		// 3a) Vyber první 3 náhodné body
		const randomPath = pathWithoutFinal.slice(0, 4); // max 3 prvky
		// 4a) Přidej zpět finální bod
		randomPath.push(path[path.length - 1]); // přidá poslední bod jako finální
		// Výsledek: randomPath obsahuje 3 náhodné body + finální bod na konci

		// 4) Sestavíme si 'timeline' pomoci 
		//    řetězce tweenů (metoda.timeline jiz neexistuje v novem Phaseru)
		this.tweens.chain({
			targets: this.motyl,
			ease: 'Quad.easeInOut',
			onComplete: () => volejDucha(), // po dokonceni se objevi duch na scene
			tweens: [
				// krok 1 – scale
				{
					scale: 1,
					duration: 3000,
					onComplete: () => {
						//this.dialog.showDialogAbove('motyl-00', this.motyl);
						//this.dialog.beginnerTest(this.motyl);
					}
				}, // tady by mel motyl priletet z dalky a postupne preletavat z objektu na objekt

				// kroky 2+ – postupné pohyby mezi body
				...randomPath.map(pt => ({
					x: pt.x,
					y: pt.y,
					duration: 3000,
					ease: 'Quad.easeInOut',
					onComplete: () => {
						// s 33% šancí se zakolibe na odpadku
						if (Math.random() <= 0.33) {
							doFlip(this.motyl);
						}

						// první dialog motýla na scéně
						this.dialog.showDialogAbove('motyl-00', this.motyl);
						//this.time.delayedCall(2200, () => this.dialog.hideDialog());
					}
				}))
			]
			// chain se spustí automaticky, nemusíme volat play()
		});

		// Příklad: přidání CITO loga
		this.citoLogo = this.add.image(910, 107, "Cito_logo");
		this.citoLogo.setScale(0.2);
		this.citoLogo.setAlpha(0.9);

		// Volani (postupne zviditelneni) ducha na scene
		const volejDucha = () => {
			this.duch.setVisible(true);
			this.tweens.add({
				x: this.duch.x,
				y: this.duch.y,
				targets: this.duch,
				alpha: .65,
				duration: 2500,
				onComplete: () => {
					this.motyl.setFlipX(false); // zajistuje aby se divali duch a motyl FaceToFace
					this.dialogMotylDuch();		// spusti dialog mezi motylem a duchem
				}
			});
		}

		// Dále animace, tweeny, spouštění dalších scén...
		const doFlip = (objekt: Phaser.GameObjects.Image) => {
			this.tweens.add({
				targets: objekt,
				angle: objekt.angle + 15,   // otočí o 15°
				duration: 300,
				ease: 'Quad.easeInOut',
				yoyo: true
			});
		};
	}

	async dialogMotylDuch(): Promise<void> {
		const sequence = [
			{ key: 'motyl-01', obj: this.motyl },
			{ key: 'duch-01', obj: this.duch },
			{ key: 'motyl-02', obj: this.motyl },
			{ key: 'duch-02', obj: this.duch },
			{ key: 'motyl-03', obj: this.motyl },
			{ key: 'duch-03', obj: this.duch }
			// ... další zprávy
		];

		//this.processDialogSequence(sequence, 0);
		// Můžeme přidat počáteční zpoždění před prvním dialogem, pokud je potřeba
		//await this.dialog.delay(1500); // Použijeme delay metodu z DialogManageru

		// Projdeme sekvenci a zobrazíme každý dialog postupně
		for (const item of sequence) {
			// Zavoláme novou metodu, která se postará o zobrazení, čekání a skrytí
			await this.dialog.showDialogAboveAndDelay(item.key, item.obj);
		}
	}


	/**
	  * Rekurzivní funkce pro zpracování sekvence dialogů.
	  * @param sequence Pole objektů { key: string, obj: Phaser.GameObjects.Sprite }
	  * @param index Aktuální index dialogu v sekvenci
	  */
	private processDialogSequence(sequence: { key: string, obj: Phaser.GameObjects.Sprite }[], index: number): void {
		// Pokud jsme prošli všechny dialogy, ukončíme rekurzi
		if (index >= sequence.length) {
			this.dialog.hideDialog(); // Skryjeme poslední bublinu po dokončení celé sekvence
			console.log('Sekvence dialogů dokončena.');
			return;
		}

		const currentDialog = sequence[index];
		const displayDuration = this.dialog.getDisplayDurationForKey(currentDialog.key);
		//const delay = displayDuration + 500; // 500ms pauza mezi dialogy
		//const delay = this.delay();

		// Zobrazíme aktuální dialog
		this.dialog.showDialogAbove(currentDialog.key, currentDialog.obj);
		console.log(`Zobrazuji dialog "${currentDialog.key}" na ${displayDuration}ms.`);

		// Nastavíme zpožděné volání pro skrytí dialogu a spuštění dalšího
		this.time.delayedCall(displayDuration, () => {
			this.dialog.hideDialog(); // Skryjeme aktuální dialog
			console.log(`Skrývám dialog "${currentDialog.key}".`);

			// Po krátké pauze spustíme další dialog v sekvenci
			this.time.delayedCall(500, () => { // Krátká pauza před dalším dialogem
				this.processDialogSequence(sequence, index + 1); // Rekurzivní volání pro další dialog
			});
		});
	}

	private playMotylDuchDialog(): void {
		// TODO:
		// zde sekvence dialogů motýla/ducha
		// na konci sekvence a animací zavoláš:
		// this.playMoninaDialog();
		this.playMoninaDialog();
	}

	private playMoninaDialog(): void {
		// TODO:
		// zde sekvence dialogů pro Moninu
		// TODO:
		// po odehrání dialogu přechod na scénu s kvízem: Game.ts
		this.scene.start('game'); // TODO: predat s parametry text a language podle MainMenu
	}

	// Intro.ts - metoda update()
	update(): void {
		const curX = this.motyl.x;

		// NOVINKA: Jediný řádek pro aktualizaci pozice bubliny přes DialogManager
		// DialogManager se sám postará o správné umístění bubliny,
		// pokud má nastavený followTarget.
		this.dialog.updateBubblePosition(); // <--- Zde se volá nová metoda

		if (curX > this.prevX) {
			this.motyl.setFlipX(true);
		} else if (curX < this.prevX) {
			this.motyl.setFlipX(false);
		}

		this.prevX = curX;
	}
}