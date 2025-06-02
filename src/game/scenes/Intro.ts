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

	init(data: { texts: DialogTexts; language: string }) {
		// pokud jsi volal(a) this.scene.start('Intro', { language: 'cs' }), tady to spadne do data.language = 'cs'
		if (data.language) {
			this.lang = data.language;
		} else {
			// pro jistotu můžeš mít default:
			this.lang = 'cs';
		}

		this.texts = data.texts;
	}

	create(): void {

		// background
		this.background = this.add.image(512, 385, "freepik_forest_01");

		//zlaty rez
		this.guides = addGuides(this, { thirds: true, golden: false, color: 0x82e6f6 });

		// vytvoreni dialogů
		this.dialog = new DialogManager(this, this.texts);
		//this.texts = this.cache.json.get(`lang-${this.lang}`);
		//console.log('=== Debug: this.texts v Intro ===', this.texts);

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
		this.motyl = this.add
			.sprite(startX, startY, 'Motyl')
			.setScale(0.2)     // začíná zmenšený
			.setDepth(2);      // nech ho nad backgroundem, ale pod logem

		// nastavíme počáteční hodnotu pro porovnání smeru pohybu motyla
		this.prevX = this.motyl.x;

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
				{ scale: 1, duration: 3000 }, // tady by mel motyl priletet z dalky a postupne preletavat z objektu na objekt

				// kroky 2+ – postupné pohyby mezi body
				...randomPath.map(pt => ({
					x: pt.x,
					y: pt.y,
					duration: 3000,
					ease: 'Quad.easeInOut',
					onComplete: () => {
						// s 50% šancí se zakolibe na odpadku
						if (Math.random() <= 0.5) {
							doFlip(this.motyl);
						}
						//console.log(this);

						//this.dialog.showDialogAbove('dialogSequence.motyl-00', this.motyl);
						//this.dialog.showDialog('dialogSequence.motyl-00');
						//console.log('DEBUG: Klíče v dialogSequence:', Object.keys(this.texts.dialogSequence || {}));
						this.dialog.showDialogAbove('dialogSequence.motyl-00', this.motyl);
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

	dialogMotylDuch() {
		const sequence = [
			{ key: 'dialogSequence.motyl-01', obj: this.motyl },
			{ key: 'dialogSequence.duch-01', obj: this.duch },
			{ key: 'dialogSequence.motyl-02', obj: this.motyl },
			{ key: 'dialogSequence.duch-02', obj: this.duch },
			{ key: 'dialogSequence.motyl-03', obj: this.motyl },
			{ key: 'dialogSequence.duch-03', obj: this.duch }
			// ... další zprávy
		];

		let totalDelay = 1500;
		sequence.forEach(item => {
			this.time.delayedCall(totalDelay, () => {
				//const x = item.obj.x;
				//const y = item.obj.y - item.obj.displayHeight / 2 - 10;
				//this.dialog.showDialog(item.key, x, y);
				this.dialog.showDialogAbove(item.key, item.obj);
			});
			//const text = this.dialog.getText(item.key);
			//totalDelay += this.texts.length * 40 + 1000;
			this.dialog.hideDialog();
		});
	}

	update(): void {
		const curX = this.motyl.x;
		const container = this.dialog.getBubbleContainer();
		const target = this.dialog.getFollowTarget();

		if (curX > this.prevX) {
			// motýl letí zleva doprava
			this.motyl.setFlipX(true);
		} else if (curX < this.prevX) {
			// motýl letí zprava doleva
			this.motyl.setFlipX(false);
		}

		if (this.dialog && container && target) {
			//const target = dialog.followTarget;
			const x = target.x;
			const y = target.y - 40; // stejné odsazení jako při vytvoření bubliny
			container.setPosition(x, y);
		}

		// uložíme si pro další update
		this.prevX = curX;
	}
}