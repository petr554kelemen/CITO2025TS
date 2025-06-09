
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
		const background = this.add.image(512, 384, "background");
		background.alpha = 0.5;
		background.alphaTopLeft = 0.5;
		background.alphaTopRight = 0.5;
		background.alphaBottomLeft = 0.5;
		background.alphaBottomRight = 0.5;

		// textgameover
		const textgameover = this.add.text(509, 63, "", {});
		textgameover.setOrigin(0.5, 0.5);
		textgameover.text = "Game Over";
		textgameover.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "64px", "stroke": "#000000", "strokeThickness": 8 });

		// pergamen_bkg
		const pergamen_bkg = this.add.image(514, 437, "pergamen_bkg");
		pergamen_bkg.scaleX = 1.3649455924770206;
		pergamen_bkg.scaleY = 1.2673167189356493;

		// prst_1
		const prst_1 = this.add.image(801, 582, "prst_1");
		prst_1.scaleX = 1.5;
		prst_1.scaleY = 1.5;

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
