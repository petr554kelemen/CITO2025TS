// Scene: Zobrazení konce hry

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {

	constructor() {
		super("GameOver");

	}

	editorCreate(): void {

		// background
		this.add.image(512, 384, "bckPergamen").setOrigin(0.5, 0.5);
		//background.alpha = 0.5;
		//background.alphaTopLeft = 0.5;
		//background.alphaTopRight = 0.5;
		//background.alphaBottomLeft = 0.5;
		//background.alphaBottomRight = 0.5;

		// textgameover
		const textgameover = this.add.text(512, 384, "", {});
		textgameover.setOrigin(0.5, 0.5);
		textgameover.text = "Game Over";
		textgameover.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "64px", "stroke": "#000000", "strokeThickness": 8 });

		this.events.emit("scene-awake");
	}

	create() {

		this.editorCreate();

		this.cameras.main.setBackgroundColor(0x222222);

		// Efekt: začni s menším zoomem a fade-in
		this.cameras.main.setZoom(0.5);
		this.cameras.main.fadeIn(1200, 0, 0, 0);
		this.tweens.add({
			targets: this.cameras.main,
			zoom: 1,
			duration: 1200,
			ease: 'Quad.easeOut'
		});

		const coordsText = "N 50°00.000\nE 017°00.000";
		this.add.text(512, 384, coordsText, {
			fontFamily: "Arial Black",
			fontSize: "48px",
			color: "#fff",
			align: "center",
			stroke: "#000",
			strokeThickness: 8
		}).setOrigin(0.5);

		this.input.once('pointerdown', () => {
			this.scene.start('MainMenu');
		});
	}

	//TODO: Doplnit vespod drobnější text s informací, že stav hra dokončena budou uložená.
	//TODO: Tlačítko pro možnost odehrát hru znovu
	//TODO: místo pozadí použít obrázek rozevřeného pergamenu (až bude v assets)
	//TODO: souřadnice zobrazit výrazně na pergamenu (velký font, stín)
	//TODO: text souřadnic na začátku neviditelný (alpha 0.05), odkrývat tažením prstu/myši
	//TODO: obrázek prstu pro návod, jak odkrývat souřadnice
	//TODO: drobný text dole: "Stav dokončení je uložen, souřadnice lze zobrazit kdykoliv znovu."
	//TODO: tlačítko "Zahrát znovu" pro reset localStorage a návrat do hry
}
