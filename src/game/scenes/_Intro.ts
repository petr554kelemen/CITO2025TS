
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
		this.add.image(512, 385, "freepik_forest_01");

		// arcadesprite_1
		const arcadesprite_1 = this.physics.add.sprite(814, 697, "Pytle_spritesheet");
		arcadesprite_1.scaleX = 0.28650211977903217;
		arcadesprite_1.scaleY = 0.23204674920312762;
		arcadesprite_1.body.setSize(1536, 1024, false);

		// triangle_1
		const triangle_1 = this.add.triangle(332, 270, 0, 128, 64, 0, 128, 128);
		triangle_1.scaleX = 0.3956147840914417;
		triangle_1.scaleY = 0.398221366866901;
		triangle_1.isFilled = true;

		// karton
		this.add.image(670, 505, "Karton");

		// plechovka
		this.add.image(844, 565, "Plechovka");

		// lahev
		this.add.image(536, 552, "Lahev");

		// baterka
		this.add.image(880, 487, "Baterka");

		// zvykacka
		this.add.image(666, 567, "Zvykacka");

		// kapesnik
		this.add.image(489, 650, "Kapesnik");

		// ohryzek
		const ohryzek = this.add.image(603, 722, "Ohryzek");
		ohryzek.angle = 82;

		// banan
		this.add.image(984, 559, "Banan");

		// vajgl
		this.add.image(729, 612, "Vajgl");

		// petka
		this.add.image(313, 629, "Petka");

		// motyl
		this.add.image(340, 271, "Motyl");

		// duch
		this.add.image(190, 278, "Duch");

		// divkaStoji
		this.add.image(93, 529, "DivkaStoji");

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
