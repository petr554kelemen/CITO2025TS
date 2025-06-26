
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class _Preloader extends Phaser.Scene {

	constructor() {
		super("Preloader");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// Dark green background instead of blue bg.png
		const gameWidth = this.scale.width || 1024;
		const gameHeight = this.scale.height || 768;
		this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x1a4a2e);

		// progressBar
		const progressBar = this.add.rectangle(512, 384, 468, 32);
		progressBar.isFilled = true;
		progressBar.fillColor = 14737632;
		progressBar.isStroked = true;

		this.progressBar = progressBar;

		this.events.emit("scene-awake");
	}

	private progressBar!: Phaser.GameObjects.Rectangle;

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
