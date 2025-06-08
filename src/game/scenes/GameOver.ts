// Scene: Zobrazení konce hry

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {

	constructor() {
		super("GameOver");

	}

	/* editorCreate(): void {

		// pergamen_bkg
		const pergamen_bkg = this.add.image(514, 437, "pergamen_bkg");
		pergamen_bkg.scaleX = 1.37;
		pergamen_bkg.scaleY = 1.27;

		// textgameover
		const textgameover = this.add.text(512, 384, "", {});
		textgameover.setOrigin(0.5, 0.5);
		textgameover.text = "Game Over";
		textgameover.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "64px", "stroke": "#000000", "strokeThickness": 8 });

		this.events.emit("scene-awake");
	} */

	create() {
		// Nastav tmavé pozadí pod pergamen
		this.cameras.main.setBackgroundColor(0x222222);

		// Pozadí: pergamen
		const pergamen = this.add.image(512, 384, "pergamen_bkg");
		pergamen.setOrigin(0.5).setScale(1.2);

		// Efekt: zoom + fade-in
		this.cameras.main.setZoom(0.5);
		this.cameras.main.fadeIn(1200, 0, 0, 0);
		this.tweens.add({
			targets: this.cameras.main,
			zoom: 1,
			duration: 1200,
			ease: 'Quad.easeOut'
		});

		// Souřadnice - na začátku téměř neviditelné
		const coordsText = "N 50°00.000\nE 017°00.000";
		const coords = this.add.text(512, 384, coordsText, {
			fontFamily: "Arial Black",
			fontSize: "72px",
			color: "#207a1e", // tmavě zelená
			align: "center",
			stroke: "#ffe066", // žlutý okraj
			strokeThickness: 10,
			shadow: { offsetX: 2, offsetY: 2, color: "#ffb300", blur: 12, fill: true } // teplý žlutý stín
		}).setOrigin(0.5);
		coords.setAlpha(0.05);

		// Odkrývání tahem prstu/myši
		const finger = this.add.image(512, 600, "prst"); // výchozí pozice
		finger.setScale(0.5).setDepth(10).setVisible(true);

		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			finger.setPosition(pointer.x, pointer.y);

			if (coords.getBounds().contains(pointer.x, pointer.y)) {
				if (coords.alpha < 1) {
					coords.setAlpha(Math.min(1, coords.alpha + 0.0025));
				}
			}

			if (coords.alpha >= 1) {
				finger.setVisible(false);
			}
		});

		// Drobnější text dole
		this.add.text(512, 700, "Stav dokončení je uložen, souřadnice lze zobrazit kdykoliv znovu.", {
			fontFamily: "Arial",
			fontSize: "20px",
			color: "#fff",
			align: "center"
		}).setOrigin(0.5);

		// Tlačítko "Zahrát znovu"
		const btn = this.add.text(512, 650, "Zahrát znovu", {
			fontFamily: "Arial Black",
			fontSize: "32px",
			color: "#1565c0",
			backgroundColor: "#fff",
			padding: { left: 20, right: 20, top: 8, bottom: 8 }
		}).setOrigin(0.5).setInteractive({ useHandCursor: true });

		btn.on('pointerdown', () => {
			localStorage.removeItem('cito2025_success');
			this.scene.start('Game');
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
