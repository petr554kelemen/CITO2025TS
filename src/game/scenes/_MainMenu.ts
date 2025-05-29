
// ********************** //
// Vzorová data z editoru //
// ********************** //

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class _MainMenu extends Phaser.Scene {

	constructor() {
		super("MainMenu");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// background
		this.add.image(512, 384, "background");

		// freepik_forest_02
		this.add.image(583, 383, "freepik_forest_02");

		// logo
		const logo = this.add.text(512, 167, "", {});
		logo.setOrigin(0.5, 0.5);
		logo.text = "Virtuální CITO";
		logo.setStyle({ "align": "center", "color": "#d1d289ff", "fontFamily": "Barrio", "fontSize": "96px", "fontStyle": "bold", "stroke": "#931616ff", "strokeThickness": 5, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.fill": true });

		// text
		const text = this.add.text(517, 276, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "GEOCACHING GAME";
		text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

		// cito_logo
		const cito_logo = this.add.image(524, 448, "Cito_logo");
		cito_logo.scaleX = 0.25;
		cito_logo.scaleY = 0.25;

		// flag_cs
		this.add.image(374, 636, "flag_cs");

		// flag_en
		this.add.image(512, 633, "flag_en");

		// flag_pl
		this.add.image(664, 634, "flag_pl");

		// text_1
		const text_1 = this.add.text(496, 723, "", {});
		text_1.text = "(c) 2022 - 2025, pettr554\nlicence MIT";
		text_1.setStyle({  });

		// divkaStoji
		const divkaStoji = this.add.image(123, 421, "DivkaStoji");
		divkaStoji.scaleX = 0.75;
		divkaStoji.scaleY = 0.75;

		// plnyPytel
		const plnyPytel = this.add.image(874, 524, "plnyPytel");
		plnyPytel.scaleX = 0.25;
		plnyPytel.scaleY = 0.45;

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
