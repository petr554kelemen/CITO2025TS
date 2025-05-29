
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class _MyGame extends MyGame {

	constructor() {
		super("MyGame");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// background
		this.add.image(512, 385, "freepik_forest_01");

		// karton
		this.add.image(938, 614, "Karton");

		// plechovka
		this.add.image(844, 579, "Plechovka");

		// lahev
		this.add.image(443, 588, "Lahev");

		// baterka
		this.add.image(840, 676, "Baterka");

		// zvykacka
		this.add.image(660, 583, "Zvykacka");

		// kapesnik
		this.add.image(399, 668, "Kapesnik");

		// ohryzek
		const ohryzek = this.add.image(566, 638, "Ohryzek");
		ohryzek.angle = 82;

		// banan
		this.add.image(288, 563, "Banan");

		// vajgl
		this.add.image(688, 666, "Vajgl");

		// petka
		this.add.image(228, 691, "Petka");

		// divkaStoji
		const divkaStoji = this.add.image(93, 529, "DivkaStoji");
		divkaStoji.visible = false;

		// prazdnyPytel
		const prazdnyPytel = this.add.image(135, 564, "prazdnyPytel");
		prazdnyPytel.scaleX = 0.32442592746834764;
		prazdnyPytel.scaleY = 0.43932686891124373;

		// quizBox
		const quizBox = this.add.rectangle(514, 244, 128, 128);
		quizBox.scaleX = 6.2632928192855015;
		quizBox.scaleY = 3.1861312980324406;
		quizBox.alpha = 0.7;
		quizBox.isFilled = true;

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
