
import Phaser from "phaser";
import DialogManager from "../../utils/DialogManager";

type DialogTexts = {
	dialogSequence: Record<string, string>;
	dialogGameSequence?: Record<string, string>;
};

type Odpadek = {
	typ: string;
	pozice: { x: number; y: number };
	scale?: number;
	angle?: number;
	status: string;
	sprite: Phaser.GameObjects.Sprite | null;
};

export default class Game extends Phaser.Scene {
	cam: any;
	language: 'cs' | 'en' | 'pl';
	texts!: DialogTexts;

	//TODO: prevzit parametr predchozi sceny
	constructor() {
		super("Game");

	}


	init(data: { texts: DialogTexts; language: string }): void {
		this.texts = data.texts;
		this.language = 'cs';
	}


	create(): void {
		
		//TODO: Vytvoreni dialogu s kvizem

		// pozadí pro hru s kvízem
		const backgroundGame = this.add.image(512, 384, "background");
		backgroundGame.setOrigin(0.5);

		this.cam = this.cameras.main;

		this.input.once('pointerdown', () => {

			//this.scene.start('GameOver');

		});

		this.score();

	}

	private score():void {
		//TODO: Vytvoreni skore dialogu
	}

	private quiz():void{
		//TODO: Vytvoreni quizu v ../../utils/quiz.ts
	}

	update(): void {

	}
}