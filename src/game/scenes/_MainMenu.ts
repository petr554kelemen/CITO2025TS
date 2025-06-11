
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

		// freepik_forest_02
		const freepik_forest_02 = this.add.image(337, 187, "freepik_forest_02");
		freepik_forest_02.scaleX = 0.5824542029273708;
		freepik_forest_02.scaleY = 0.4735762549744301;

		// logo
		const logo = this.add.text(377, 61, "", {});
		logo.scaleX = 0.5877001169079235;
		logo.scaleY = 0.5215138914070222;
		logo.setOrigin(0.5, 0.5);
		logo.text = "Virtuální CITO";
		logo.setStyle({ "align": "center", "color": "#d1d289ff", "fontFamily": "Barrio", "fontSize": "96px", "fontStyle": "bold", "stroke": "#931616ff", "strokeThickness": 5, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.fill": true });

		// text
		const text = this.add.text(392, 113, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "GEOCACHING GAME";
		text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

		// cito_logo
		const cito_logo = this.add.image(370, 193, "Cito_logo");
		cito_logo.scaleX = 0.15;
		cito_logo.scaleY = 0.15;

		// flag_cs
		this.add.image(270, 296, "flag_cs");

		// flag_en
		this.add.image(370, 300, "flag_en");

		// flag_pl
		this.add.image(470, 300, "flag_pl");

		// text_1
		const text_1 = this.add.text(368, 347, "", {});
		text_1.setOrigin(0.5, 0.5);
		text_1.text = "(c) 2022 - 2025, pettr554\nlicence MIT";
		text_1.setStyle({  });

		// divkaStoji
		const divkaStoji = this.add.image(107, 218, "DivkaStoji");
		divkaStoji.scaleX = 0.6;
		divkaStoji.scaleY = 0.6;

		// plnyPytel
		const plnyPytel = this.add.image(604, 264, "plnyPytel");
		plnyPytel.scaleX = 0.2;
		plnyPytel.scaleY = 0.35;

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
