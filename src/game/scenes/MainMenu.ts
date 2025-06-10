import Phaser from 'phaser';
//import DialogManager from '../../utils/DialogManager';

// Pokud používáš vlastní pozici/scénu pro vlaječky a assety, uprav podle potřeby
//const supportedLanguages = ['cs', 'en', 'pl'];
type Lang = 'cs' | 'en' | 'pl';

//const flags: Record<Lang, Phaser.GameObjects.Image> = { ... };
//const labels: Record<Lang, Phaser.GameObjects.Text> = { ... };

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  preload(): void {
    // načtení JSONů i vlaječek v preloader.ts
  }

  // create(): void {
  //   const supportedLanguages = ['cs', 'en', 'pl'];
  //   let selectedLanguage = localStorage.getItem('language');
  //   if (!selectedLanguage) {
  //     const browserLang = navigator.language.slice(0, 2);
  //     selectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'cs';
  //     localStorage.setItem('language', selectedLanguage);
  //   }

  //   this.cameras.main.fadeIn(500, 0, 0, 0); //fadeIn ze staré scény

  //   // freepik_forest_02
  //   this.add.image(583, 383, "freepik_forest_02");

  //   // text
  //   const text = this.add.text(this.scale.width / 2, 276, "", {});
  //   text.setOrigin(0.5, 0.5);
  //   text.text = "GEOCACHING GAME";
  //   text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

  //   // Název hry - Nadpis
  //   const nazevHry = this.add.text(this.scale.width / 2, 180, "", {});
  //   nazevHry.setOrigin(0.5, 0.5);
  //   nazevHry.text = "Virtuální CITO";
  //   nazevHry.setStyle({ "align": "center", "color": "#d1d289ff", "fontFamily": "Kings", "fontSize": "96px", "stroke": "#931616ff", "strokeThickness": 5, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.fill": true });

  //   // cito_logo
  //   const cito_logo = this.add.image(524, 448, "Cito_logo").setOrigin(.5);
  //   cito_logo.scaleX = 0.25;
  //   cito_logo.scaleY = 0.25;

  //   // vlaječky pro výběr
  //   const langs: Lang[] = ['cs', 'en', 'pl'];
  //   const rozestup: number = 100;
  //   let xPosVlajek: number = this.scale.width / 2;
  //   langs.forEach((lang, idx) => {
  //     switch (idx) {
  //       case 0:
  //         // vlajka vlevo
  //         xPosVlajek -= rozestup;
  //         break;
  //       case 1:
  //         // vlajka na stred
  //         xPosVlajek = this.scale.width / 2;
  //         break;
  //       case 2:
  //         // vlajka vpravo
  //         xPosVlajek += rozestup;
  //         break;
  //       default:
  //         xPosVlajek = this.scale.width / 2;
  //         break;
  //     }
  //     this.add.image(xPosVlajek, 600, `flag_${lang}`)
  //       .setInteractive()
  //       .setOrigin(0.5, 0.5)
  //       .setScale(0.8)
  //       .on('pointerup', () => this.selectLang(lang));
  //   });

  //   // Info o licenci
  //   const licence = this.add.text(this.scale.width / 2, 725, "", {}).setOrigin(0.5);
  //   licence.text = "(c) 2022 - 2025, pettr554\nlicence MIT";
  //   licence.setStyle({ align: "center" });

  //   // divkaStoji
  //   const divkaStoji = this.add.image(123, 421, "DivkaStoji").setOrigin(.5);
  //   divkaStoji.scaleX = 0.75;
  //   divkaStoji.scaleY = 0.75;

  //   // plnyPytel
  //   const plnyPytel = this.add.image(874, 524, "plnyPytel").setOrigin(.5);
  //   plnyPytel.scaleX = 0.25;
  //   plnyPytel.scaleY = 0.45;
  // }

  create() {
    if (this.scale.width <= 700 || this.scale.height <= 400) {
        this.createMobileLayout();
    } else {
        this.createDesktopLayout();
    }
}

private createMobileLayout(): void {
    // Pozadí
    this.add.image(334, 188, "freepik_forest_02");

    // Název hry
    this.add.text(334, 80, "Virtuální CITO", {
        fontFamily: "Kings",
        fontSize: "48px",
        color: "#d1d289ff",
        stroke: "#931616ff",
        strokeThickness: 3,
        align: "center"
    }).setOrigin(0.5);

    // Podnadpis
    this.add.text(334, 130, "GEOCACHING GAME", {
        fontFamily: "Arial Black",
        fontSize: "22px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 5,
        align: "center"
    }).setOrigin(0.5);

    // Logo
    this.add.image(334, 200, "Cito_logo").setOrigin(0.5).setScale(0.18);

    // Dívka
    this.add.image(80, 300, "DivkaStoji").setOrigin(0.5).setScale(0.6);

    // Plný pytel
    this.add.image(590, 270, "plnyPytel").setOrigin(0.5).setScale(0.18, 0.32);

    // Vlajky pro výběr jazyka
    const langs: Lang[] = ['cs', 'en', 'pl'];
    const rozestup = 80;
    let xPosVlajek = 334;
    langs.forEach((lang, idx) => {
        let x = xPosVlajek + (idx - 1) * rozestup;
        this.add.image(x, 320, `flag_${lang}`)
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerup', () => this.selectLang(lang));
    });

    // Licence
    this.add.text(334, 360, "(c) 2022 - 2025, pettr554\nlicence MIT", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#fff",
        align: "center"
    }).setOrigin(0.5);
}

private createDesktopLayout(): void {
    // Pozadí
    this.add.image(583, 383, "freepik_forest_02");

    // Název hry
    this.add.text(512, 180, "Virtuální CITO", {
        fontFamily: "Kings",
        fontSize: "96px",
        color: "#d1d289ff",
        stroke: "#931616ff",
        strokeThickness: 5,
        align: "center"
    }).setOrigin(0.5);

    // Podnadpis
    this.add.text(512, 276, "GEOCACHING GAME", {
        fontFamily: "Arial Black",
        fontSize: "38px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 8,
        align: "center"
    }).setOrigin(0.5);

    // Logo
    this.add.image(524, 448, "Cito_logo").setOrigin(0.5).setScale(0.25);

    // Dívka
    this.add.image(123, 421, "DivkaStoji").setOrigin(0.5).setScale(0.75);

    // Plný pytel
    this.add.image(874, 524, "plnyPytel").setOrigin(0.5).setScale(0.25, 0.45);

    // Vlajky pro výběr jazyka
    const langs: Lang[] = ['cs', 'en', 'pl'];
    const rozestup = 100;
    let xPosVlajek = 512;
    langs.forEach((lang, idx) => {
        let x = xPosVlajek + (idx - 1) * rozestup;
        this.add.image(x, 600, `flag_${lang}`)
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.8)
            .on('pointerup', () => this.selectLang(lang));
    });

    // Licence
    this.add.text(512, 725, "(c) 2022 - 2025, pettr554\nlicence MIT", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#fff",
        align: "center"
    }).setOrigin(0.5);
}

  private selectLang(lang: string): void {
    const texts = this.cache.json.get(`lang-${lang}`);
    if (!texts) {
      // Pro případ, že by nebyl daný jazyk v cache, fallback na angličtinu
      console.warn(`Texty pro jazyk ${lang} nenalezeny, přepínám na EN.`);
      localStorage.setItem('language', 'en');
      this.scene.restart();
      return;
    }
    this.scene.start('Intro', { texts, language: lang });
  }
}
