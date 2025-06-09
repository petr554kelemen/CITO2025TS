// Scene: Zobrazení konce hry

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {
    private texts: any;
    private language: 'cs' | 'en' | 'pl';

    constructor() {
        super("GameOver");
    }

    init(data: { texts: any, language: 'cs' | 'en' | 'pl' }) {
        this.texts = data.texts;
        this.language = data.language;
    }

    // Inicializace scény
    create() {
        // Nastav tmavé pozadí pod pergamen
        this.cameras.main.setBackgroundColor(0x222222);

        // Pozadí: pergamen
        const pergamen = this.add.image(512, 384, "pergamen_bkg");
        pergamen.setOrigin(0.5).setScale(1.2).setDepth(9);

        // Efekt: zoom + fade-in
        //this.cameras.main.setZoom(0.5); // Zakomentovat zoom
        this.cameras.main.fadeIn(1200, 0, 0, 0);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 1200,
            ease: 'Quad.easeOut'
        });

        // Souřadnice - na začátku zcela neviditelné
        const coordsText = "N 50°10.391\nE 017°36.226";

        // Lehký nápis jako nápověda, kde hledat
        const coordsHint = this.add.text(512, 384, "?????", {
            fontFamily: "Merienda, Arial, sans-serif",
            fontSize: "30px",
            color: "#88775599", // světle béžová s průhledností
            align: "center",
        }).setOrigin(0.5).setDepth(9.5); // Mírně pod hlavním textem

        const coords = this.add.text(512, 384, coordsText, {
            fontFamily: "Merienda, Arial, sans-serif",
            fontSize: "72px",
            color: "#207a1e", // tmavě zelená
            align: "center",
            stroke: "#ffe066", // žlutý okraj
            strokeThickness: 10,
            shadow: { offsetX: 2, offsetY: 2, color: "#ffb300", blur: 12, fill: true } // teplý žlutý stín
        }).setOrigin(0.5).setDepth(10).setAlpha(0); // Nastaveno na zcela neviditelné

        // Odkrývání tahem prstu/myši
        const finger = this.add.image(512, 600, "prst"); // výchozí pozice
        finger.setScale(0.5).setDepth(1011).setVisible(true); // Nastav hloubku prstu

        // Proměnná pro sledování, zda byla nápověda zničena
        let hintDestroyed = false;
        let hintText: Phaser.GameObjects.Text | null = null;

        // Zobraz mírné vodítko nad prstem po 3 sekundách
        this.time.delayedCall(3000, () => {
            // Vytvoř nápovědu pouze pokud ještě nebyla zničena předchozím pohybem
            if (!hintDestroyed) {
                const hintMessage = this.texts?.gameOver?.exploreHint ?? ""; // Prázdný fallback
                
                hintText = this.add.text(512, 580, hintMessage, {
                    fontFamily: "Arial",
                    fontSize: "16px",
                    color: "#ffffff88", // bílá s průhledností
                    align: "center",
                }).setOrigin(0.5).setDepth(1012);
                
                // Jednoduchý fade-in efekt místo blikání
                hintText.setAlpha(0);
                this.tweens.add({
                    targets: hintText,
                    alpha: 0.7,
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            // Zruš nápovědu při prvním pohybu myši/prstu
            if (hintText && !hintDestroyed) {
                // Fade-out efekt pro nápovědu
                this.tweens.add({
                    targets: hintText,
                    alpha: 0,
                    duration: 500,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        if (hintText) {
                            hintText.destroy();
                            hintText = null;
                        }
                    }
                });
                hintDestroyed = true;
            }
            
            finger.setPosition(pointer.x, pointer.y);

            // Efekt neviditelného inkoustu
            if (coords.getBounds().contains(pointer.x, pointer.y)) {
                if (coords.alpha < 1) {
                    coords.setAlpha(Math.min(1, coords.alpha + 0.001)); // Menší krok pro pomalejší odhalování
                    
                    // Když začne být text viditelný, skryj nápovědu
                    if (coords.alpha > 0.1) {
                        coordsHint.setAlpha(1 - (coords.alpha * 5)); // Postupně mizí
                    }
                }
                
                // Přidej malý efekt tepla/svítivosti kolem prstu
                this.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 100,
                    onUpdate: (tween) => {
                        const value = tween.getValue();
                        if (value !== null) {
                            finger.setTint(Phaser.Display.Color.GetColor(255, 220 + (35 * value), 150 + (55 * value)));
                        }
                    },
                    onComplete: () => {
                        finger.clearTint();
                    }
                });
            }

            // Když jsou souřadnice plně viditelné, skryj prst
            if (coords.alpha >= 0.98) {
                finger.setVisible(false);
            }
        });

        // Načti text tlačítka z lokalizace
        const playAgainText = this.texts?.gameOver?.playAgain ?? "🔄 Zahrát znovu";

        // Interaktivní text s ikonkou
        const btnText = this.add.text(512, 555, playAgainText, {
            fontFamily: "Arial Black",
            fontSize: "24px",
            color: "#fff",
            align: "center",
            stroke: "#000", // Černý obrys textu pro lepší čitelnost
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1016);

        // Nastavení interaktivity přímo na text
        btnText.setInteractive({ useHandCursor: true });

        // Akce po kliknutí na text
        btnText.on('pointerdown', () => {
            const confirmResetText = this.texts?.gameOver?.confirmReset ?? 
                "Opravdu chcete začít znovu?\nTímto smažete uložené souřadnice a budete muset hru znovu úspěšně dokončit!";
            const confirmed = window.confirm(confirmResetText);
            if (confirmed) {
                localStorage.removeItem('cito2025_success');
                this.scene.start('Game', { language: this.language, texts: this.texts });
            }
        });

        // Přidání efektu při najetí myší
        btnText.on('pointerover', () => {
            btnText.setStyle({
                color: '#e05400', // Tmavší oranžová - lépe vynikne na béžovém pozadí
                stroke: "#000",
                strokeThickness: 3  // Silnější obrys při najetí myší
            });
        });

        btnText.on('pointerout', () => {
            btnText.setStyle({
                color: '#fff', // Návrat na původní barvu
                stroke: "#000",
                strokeThickness: 2
            });
        });

        // Odstraněn statický testovací obrázek

        // Informace o uložení hry
        const infoText = this.texts.dialogSequence?.gameSavedInfo || "Tvůj postup byl uložen. Můžeš se vrátit později.";
        this.add.text(512, 700, infoText, {
            font: "18px Arial",
            color: "#fff"
        }).setOrigin(0.5);
    }
}
