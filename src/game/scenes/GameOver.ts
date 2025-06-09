// Scene: Zobrazení konce hry

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {
	private texts: any; // nebo konkrétní typ, pokud máš

	constructor() {
		super("GameOver");

	}

	init(data: { texts: any }) {
		this.texts = data.texts;
	}

	// Inicializace scény
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
		const coordsText = "N 50°10.391\nE 017°36.226";
		const coords = this.add.text(512, 384, coordsText, {
			fontFamily: "Merienda, Arial, sans-serif",
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
		const playAgainText = this.texts?.gameOver?.playAgain ?? "Zahrát znovu";
		const confirmResetText = this.texts?.gameOver?.confirmReset ?? "Opravdu chcete začít znovu?\nTímto smažete uložené souřadnice a budete muset hru znovu úspěšně dokončit!";
		const btn = this.add.text(512, 650, playAgainText, {
			fontFamily: "Arial Black",
			fontSize: "32px",
			color: "#1565c0",
			backgroundColor: "#fff",
			padding: { left: 20, right: 20, top: 8, bottom: 8 }
		}).setOrigin(0.5).setInteractive({ useHandCursor: true });

		btn.on('pointerdown', () => {
			const confirmed = window.confirm(confirmResetText);
			if (confirmed) {
				localStorage.removeItem('cito2025_success');
				this.scene.start('Game');
			}
		});

		// Informace o uložení hry
		const infoText = this.texts.dialogSequence?.gameSavedInfo || "Tvůj postup byl uložen. Můžeš se vrátit později.";
		this.add.text(512, 680, infoText, {
			font: "18px Arial",
			color: "#fff"
		}).setOrigin(0.5);
	}
}
