import { addGuides } from '../../utils/ZlatyRez';
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

	// Desktop rozmístění (původní hodnoty)
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

	// Mobilní rozmístění (tvé hodnoty)
	private odpadkyDataMobile: Odpadek[] = [
		{ typ: "Banan", pozice: { x: 296, y: 273 }, status: 'default', sprite: null },
		{ typ: "Baterie", pozice: { x: 368, y: 319 }, status: 'default', sprite: null },
		{ typ: "Lahev", pozice: { x: 406, y: 257 }, status: 'default', sprite: null },
		{ typ: "Ohryzek", pozice: { x: 188, y: 344 }, scale: 0.85, angle: 82, status: 'default', sprite: null },
		{ typ: "Kapesnik", pozice: { x: 265, y: 327 }, status: 'default', sprite: null },
		{ typ: "Vajgl", pozice: { x: 436, y: 326 }, scale: 0.8, status: 'default', sprite: null },
		{ typ: "Karton", pozice: { x: 346, y: 245 }, status: 'default', sprite: null },
		{ typ: "Zvykacka", pozice: { x: 539, y: 274 }, scale: 0.7, status: 'default', sprite: null },
		{ typ: "Plechovka", pozice: { x: 471, y: 282 }, status: 'default', sprite: null },
		{ typ: "PET", pozice: { x: 209, y: 282 }, status: 'default', sprite: null }
	];

	// data odpadků na scéně (bude nastaveno v create)
	odpadkyData: Odpadek[] = [];

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
		// Inicializace ResponsiveManager
		//this.responsive = new ResponsiveManager(this);
		// Přidej do metody create() každé scény po inicializaci ResponsiveManager
		this.responsive = new ResponsiveManager(this);
		this.responsive.checkAndForceOrientation();

		// Debug info pro ladění
		if ((window as any).DEBUG_MODE) {
			this.responsive.addDebugOverlay();
		}

		// Použij isMobile() pro výběr layoutu
		if (this.responsive.isMobile()) {
			this.odpadkyData = this.odpadkyDataMobile.map(o => ({ ...o, sprite: null }));
			this.createMobileLayout();
		} else {
			this.odpadkyData = this.odpadkyDataDesktop.map(o => ({ ...o, sprite: null }));
			this.createDesktopLayout();
		}

		this.createOdpadky();
		this.createMotylAndAnimate();

		// Reaguj na změny layoutu
		this.responsive.on('layoutchange', (layout: LayoutType) => {
			// Vyčisti existující layout
			this.cleanExistingLayout();

			// Vytvoř nový layout
			if (layout === LayoutType.MOBILE) {
				this.odpadkyData = this.odpadkyDataMobile.map(o => ({ ...o, sprite: null }));
				this.createMobileLayout();
			} else {
				this.odpadkyData = this.odpadkyDataDesktop.map(o => ({ ...o, sprite: null }));
				this.createDesktopLayout();
			}

			// Znovu vytvoř společné prvky
			this.createOdpadky();
			this.createMotylAndAnimate();
		});

		this.input.once('pointerdown', () => {
			this.skipIntro();
		});
	}

	private createMobileLayout(): void {
		const gameWidth = this.scale.width;
		const gameHeight = this.scale.height;
		const centerX = gameWidth / 2;
		const centerY = gameHeight / 2;

		// Pozadí
		this.background = this.add.image(centerX, centerY, "freepik_forest_01");
		const scaleX = gameWidth / this.background.width;
		const scaleY = gameHeight / this.background.height;
		const scale = Math.max(scaleX, scaleY);
		this.background.setScale(scale);

		// Duch
		this.duch = this.add.sprite(gameWidth * 0.24, gameHeight * 0.27, "Duch", 0).setAlpha(0).setVisible(false);

		// Pytel
		this.pytel = this.add.sprite(gameWidth * 0.87, gameHeight * 0.88, "prazdnyPytel");
		this.pytel.setScale(Math.min(0.25, gameWidth * 0.0005));
		this.pytel.setVisible(false);

		// Logo
		this.citoLogo = this.add.image(gameWidth * 0.93, gameHeight * 0.14, "Cito_logo");
		this.citoLogo.setScale(Math.min(0.2, gameWidth * 0.0005));
		this.citoLogo.setAlpha(0.9);
	}

	private createDesktopLayout(): void {
		const gameWidth = this.scale.width;
		const gameHeight = this.scale.height;
		const centerX = gameWidth / 2;
		const centerY = gameHeight / 2;

		// Pozadí
		this.background = this.add.image(centerX, centerY, "freepik_forest_01");
		const scaleX = gameWidth / this.background.width;
		const scaleY = gameHeight / this.background.height;
		const scale = Math.max(scaleX, scaleY);
		this.background.setScale(scale);

		// Duch
		this.duch = this.add.sprite(gameWidth * 0.19, gameHeight * 0.36, "Duch", 0).setAlpha(0).setVisible(false);

		// Pytel
		this.pytel = this.add.sprite(gameWidth * 0.79, gameHeight * 0.9, "prazdnyPytel");
		this.pytel.setScale(Math.min(0.5, gameWidth * 0.0008));
		this.pytel.setVisible(false);

		// Logo
		this.citoLogo = this.add.image(gameWidth * 0.89, gameHeight * 0.14, "Cito_logo");
		this.citoLogo.setScale(Math.min(0.2, gameWidth * 0.0005));
		this.citoLogo.setAlpha(0.9);
	}

	/**
	 * Okamžitě ukončí intro scénu a přejde do hry.
	 */
	private skipIntro(): void {
		// Zabrání opakovanému volání
		this.input.enabled = false;
		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.cameras.main.once('camerafadeoutcomplete', () => {
			this.startGameScene();
		});
	}

	/**
	 * Vytvoří pozadí scény.
	 */
	private createBackground(): void {
		this.background = this.add.image(512, 385, "freepik_forest_01");
		// POZOR: Správný klíč obrázku musí být načten v preload!
	}

	/**
	 * Přidá vodítka pro kompozici scény.
	 */
	private createGuides(): void {
		this.guides = addGuides(this, { thirds: true, golden: false, color: 0x82e6f6 });
	}

	/**
	 * Inicializuje správce dialogů.
	 */
	private createDialogManager(): void {
		this.dialog = new DialogManager(this, this.texts);
	}

	/**
	 * Vytvoří ducha na scéně, nastaví jeho počáteční vlastnosti.
	 */
	private createDuch(): void {
		this.duch = this.add.sprite(190, 280, "Duch", 0).setAlpha(0).setVisible(false);
		// POZOR: Pokud duch není vidět, zkontroluj klíč a souřadnice!
	}

	/**
	 * Vytvoří pytel na odpadky na scéně.
	 */
	private createPytel(): void {
		this.pytel = this.add.sprite(810, 690, "prazdnyPytel");
		this.pytel.scaleX = 0.5;
		this.pytel.scaleY = 0.5;
		this.pytel.setSize(153, 512);
		this.pytel.setVisible(false);
		// POZOR: Nastavení scale a velikosti musí odpovídat obrázku!
	}

	/**
	 * Vygeneruje všechny odpadky podle dat a přidá je na scénu.
	 */
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
			// POZOR: Nezapomeň na interaktivitu, pokud budeš chtít drag & drop!
		});
	}

	/**
	 * Vytvoří motýla, připraví jeho trasu a spustí animaci.
	 */
	private createMotylAndAnimate(): void {
		const startX = 835;
		const startY = 475;
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
		// POZOR: Pokud motýl "zamrzne", zkontroluj správnost cesty a tweenu!
	}

	/**
	 * Přidá CITO logo na scénu.
	 */
	private createCitoLogo(): void {
		this.citoLogo = this.add.image(910, 107, "Cito_logo");
		this.citoLogo.setScale(0.2);
		this.citoLogo.setAlpha(0.9);
	}

	/**
	 * Postupně zviditelní ducha a spustí dialog mezi motýlem a duchem.
	 */
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
					this.dialog.hideDialog(); // Skryjeme dialog motýla hned na začátku animace ducha
				}
			},
			onComplete: () => {
				this.motyl.setFlipX(false);
				this.dialogMotylDuch();
			}
		});
	}

	/**
	 * Krátká animace "zakolíbání" objektu.
	 * @param objekt Objekt, který se má otočit.
	 */
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

		// --- ZÁVĚR SCÉNY ---
		this.endIntroScene();
	}

	/**
 * Závěr intro scény: duch zmizí, motýl odletí, přepnutí na další scénu.
 */
	private endIntroScene(): void {
		// Duch zmizí (fade out)
		this.tweens.add({
			targets: this.duch,
			alpha: 0,
			duration: 3000, // 3 sekundy
			onComplete: () => {
				this.duch.setVisible(false); // Skryjeme ducha po zmizení
			}
		});

		// Motýl odletí doprava nahoru mimo scénu
		this.tweens.add({
			targets: this.motyl,
			x: 1200, // mimo obrazovku (přizpůsob podle rozměrů)
			y: -100,
			duration: 2500,
			ease: 'Quad.easeIn',
			onComplete: () => {
				// Po dokončení animací spustíme fade-out celé scény
				this.cameras.main.fadeOut(1000, 0, 0, 0); // 1s černý fade
				this.cameras.main.once('camerafadeoutcomplete', () => {
					this.startGameScene();
				});
			}
		});
	}

	/**
	 * Přepnutí na herní scénu a předání potřebných parametrů.
	 */
	private startGameScene(): void {
		this.scene.start('Game', {
			odpadkyData: this.odpadkyData,
			language: this.lang,
			texts: this.texts
		});
		// POZOR: Pokud předáváš celé objekty (např. sprite), doporučuji předat jen data, ne Phaser objekty!
		// V nové scéně si vytvoř nové instance sprite podle těchto dat.
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


	// Intro.ts - metoda update()
	update(): void {
		const curX = this.motyl.x;

		// NOVINKA: Jediný řádek pro aktualizaci pozice bubliny přes DialogManager
		// DialogManager se sám postará o správné umístění bubliny,
		// pokud má nastavený followTarget.
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

	// Přidej metodu pro čištění layoutu
	private cleanExistingLayout(): void {
		if (this.background) this.background.destroy();
		if (this.duch) this.duch.destroy();
		if (this.pytel) this.pytel.destroy();
		if (this.citoLogo) this.citoLogo.destroy();
		if (this.motyl) this.motyl.destroy();

		this.odpadkyData.forEach(odpadek => {
			if (odpadek.sprite) odpadek.sprite.destroy();
		});
	}
}