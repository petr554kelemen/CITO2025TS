import Phaser from 'phaser';

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

    // umistit background na scenu
    this.add.image(583, 383, "freepik_forest_02");

    // Výběr jazyka z localStorage nebo uložení do localStorage 
    let selectedLanguage = localStorage.getItem('language') as Lang;
    if (!selectedLanguage) localStorage.setItem('language', selectedLanguage);

    // for (const lang of supportedLanguages) {
    //   flags[lang].on('pointerdown', () => {
    //     // 3. Volitelně rovnou spusť intro ve zvoleném jazyce
    //     this.selectLang(selectedLanguage);
    //   });
    // }

    // text
    const text = this.add.text(this.scale.width / 2, 276, "", {});
    text.setOrigin(0.5, 0.5);
    text.text = "GEOCACHING GAME";
    text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

    // Název hry - Nadpis
    const nazevHry = this.add.text(this.scale.width / 2, 180, "", {});
    nazevHry.setOrigin(0.5, 0.5);
    nazevHry.text = "Virtuální CITO";
    nazevHry.setStyle({ "align": "center", "color": "#d1d289ff", "fontFamily": "Kings", "fontSize": "96px", "stroke": "#931616ff", "strokeThickness": 5, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.fill": true });

    // cito_logo
    const cito_logo = this.add.image(524, 448, "Cito_logo").setOrigin(.5);
    cito_logo.scaleX = 0.25;
    cito_logo.scaleY = 0.25;

    // umistěni divkaStoji na scenu
    const divkaStoji = this.add.image(123, 421, "DivkaStoji").setOrigin(.5);
    divkaStoji.scaleX = 0.75;
    divkaStoji.scaleY = 0.75;

    // plnyPytel
    const plnyPytel = this.add.image(874, 524, "plnyPytel").setOrigin(.5);
    plnyPytel.scaleX = 0.25;
    plnyPytel.scaleY = 0.45;

    // obrazky vlajek pro vyber jazyka
    const langs: Lang[] = ['cs', 'en', 'pl'];
    const rozestup: number = 100;
    let xPosVlajek: number = this.scale.width / 2;

    langs.forEach((lang, idx) => {
      switch (idx) {
        case 0:
          // vlajka vlevo
          xPosVlajek -= rozestup;
          break;
        case 1:
          // vlajka na stred
          xPosVlajek = this.scale.width / 2;
          break;
        case 2:
          // vlajka vpravo
          xPosVlajek += rozestup;
          break;
        default:
          xPosVlajek = this.scale.width / 2;
          break;
      }
      this.add.image(xPosVlajek, 600, `flag_${lang}`)
        .setInteractive()
        .setOrigin(0.5, 0.5)
        .setScale(0.8)
        .on('pointerup', () => this.selectLang(lang));
    });

    // Info o licenci
    const licence = this.add.text(this.scale.width / 2, 725, "", {}).setOrigin(0.5);
    licence.text = "(c) 2022 - 2025, pettr554\nlicence MIT";
    licence.setStyle({ align: "center" });
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
