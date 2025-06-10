
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
		background.scaleX = 0.5555212936806945;
		background.scaleY = 0.47314471077609577;

		// karton
		this.add.image(346, 245, "Karton");

		// plechovka
		this.add.image(471, 282, "Plechovka");

		// lahev
		this.add.image(406, 257, "Lahev");

		// baterka
		this.add.image(368, 319, "Baterie");

		// zvykacka
		const zvykacka = this.add.image(539, 274, "Zvykacka");
		zvykacka.scaleX = 0.7;
		zvykacka.scaleY = 0.7;

		// kapesnik
		this.add.image(265, 327, "Kapesnik");

		// ohryzek
		const ohryzek = this.add.image(188, 344, "Ohryzek");
		ohryzek.scaleX = 0.85;
		ohryzek.scaleY = 0.85;
		ohryzek.angle = 82;

		// banan
		this.add.image(296, 273, "Banan");

		// vajgl
		const vajgl = this.add.image(436, 326, "Vajgl");
		vajgl.scaleX = 0.8;
		vajgl.scaleY = 0.8;

		// petka
		this.add.image(209, 282, "PET");

		// motyl
		const motyl = this.add.image(248, 94, "Motyl");
		motyl.scaleX = 0.55;
		motyl.scaleY = 0.55;

		// duch
		const duch = this.add.image(161, 101, "Duch");
		duch.scaleX = 0.6;
		duch.scaleY = 0.6;

		// divkaStoji
		const divkaStoji = this.add.image(65, 236, "DivkaStoji");
		divkaStoji.scaleX = 0.6;
		divkaStoji.scaleY = 0.6;

		// prazdnyPytel
		const prazdnyPytel = this.add.image(579, 333, "prazdnyPytel");
		prazdnyPytel.scaleX = 0.25;
		prazdnyPytel.scaleY = 0.25;

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
