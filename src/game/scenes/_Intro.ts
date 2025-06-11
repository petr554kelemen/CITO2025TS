
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class _Intro extends Phaser.Scene {

	constructor() {
		super("Intro");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// background
		const background = this.add.image(334, 188, "freepik_forest_01");
		background.scaleX = 0.57;
		background.scaleY = 0.47;

		// karton
		const karton = this.add.image(359, 243, "Karton");
		karton.scaleX = 0.6;
		karton.scaleY = 0.6;

		// plechovka
		const plechovka = this.add.image(475, 278, "Plechovka");
		plechovka.scaleX = 0.6;
		plechovka.scaleY = 0.6;

		// lahev
		const lahev = this.add.image(427, 253, "Lahev");
		lahev.scaleX = 0.6;
		lahev.scaleY = 0.6;

		// baterie
		const baterie = this.add.image(372, 304, "Baterie");
		baterie.scaleX = 0.6;
		baterie.scaleY = 0.6;

		// zvykacka
		const zvykacka = this.add.image(539, 254, "Zvykacka");
		zvykacka.scaleX = 0.5;
		zvykacka.scaleY = 0.5;

		// kapesnik
		const kapesnik = this.add.image(305, 329, "Kapesnik");
		kapesnik.scaleX = 0.6;
		kapesnik.scaleY = 0.6;

		// ohryzek
		const ohryzek = this.add.image(188, 344, "Ohryzek");
		ohryzek.scaleX = 0.6;
		ohryzek.scaleY = 0.6;
		ohryzek.angle = 82;

		// banan
		const banan = this.add.image(285, 268, "Banan");
		banan.scaleX = 0.6;
		banan.scaleY = 0.6;

		// vajgl
		const vajgl = this.add.image(436, 326, "Vajgl");
		vajgl.scaleX = 0.5;
		vajgl.scaleY = 0.5;

		// PET
		const pET = this.add.image(213, 307, "PET");
		pET.scaleX = 0.6;
		pET.scaleY = 0.6;
		pET.angle = -62.99999999999994;

		// motyl
		const motyl = this.add.image(240, 129, "Motyl");
		motyl.scaleX = 0.5;
		motyl.scaleY = 0.5;

		// duch
		const duch = this.add.image(153, 132, "Duch");
		duch.scaleX = 0.6;
		duch.scaleY = 0.6;
		duch.alpha = 0.1;
		duch.alphaTopLeft = 0.1;
		duch.alphaTopRight = 0.1;
		duch.alphaBottomLeft = 0.1;
		duch.alphaBottomRight = 0.1;

		// startMotyla
		const startMotyla = this.add.ellipse(506, 233, 128, 128);
		startMotyla.scaleX = 0.1;
		startMotyla.scaleY = 0.1;
		startMotyla.isFilled = true;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
