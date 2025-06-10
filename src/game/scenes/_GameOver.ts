
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class _GameOver extends Phaser.Scene {

	constructor() {
		super("GameOver");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// background
		const background = this.add.image(331, 191, "background");
		background.scaleX = 0.6719623773560716;
		background.scaleY = 0.5329549532943552;
		background.alpha = 0.5;
		background.alphaTopLeft = 0.5;
		background.alphaTopRight = 0.5;
		background.alphaBottomLeft = 0.5;
		background.alphaBottomRight = 0.5;

		// pergamen_bkg
		const pergamen_bkg = this.add.image(324, 170, "pergamen_bkg");
		pergamen_bkg.scaleX = 0.85;
		pergamen_bkg.scaleY = 0.71;
		pergamen_bkg.setOrigin(0.5, 0.5);

		// prst_1
		const prst_1 = this.add.image(546, 281, "prst");
		prst_1.scaleX = 0.85;
		prst_1.scaleY = 0.85;

		// button
		const button = this.add.image(529, 608, "button");
		button.setInteractive(new Phaser.Geom.Rectangle(0, 0, 74, 50), Phaser.Geom.Rectangle.Contains);
		button.scaleX = 3.586583957401992;
		button.scaleY = 1.6404611937460216;

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
