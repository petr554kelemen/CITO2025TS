import Phaser from 'phaser';

type Locale = 'cs' | 'en' | 'pl';

interface Translations { [key: string]: any }

export default class DialogManager {
  private scene: Phaser.Scene;
  private locale: Locale;
  private texts: Record<Locale, Translations>;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, locale: Locale) {
    this.scene = scene;
    this.locale = locale;
    // Načteme přeložené texty z cache JSONů
    this.texts = {
      cs: this.scene.cache.json.get('lang_cs') as Translations,
      en: this.scene.cache.json.get('lang_en') as Translations,
      pl: this.scene.cache.json.get('lang_pl') as Translations
    };
  }

  // Změní aktuální jazyk
  public setLanguage(locale: Locale): void {
    this.locale = locale;
  }

  // Získá text podle klíče s tečkovanou cestou, např. 'intro.title'
  private getNestedText(path: string): string {
    const parts = path.split('.');
    let curr: any = this.texts[this.locale];
    for (const part of parts) {
      if (curr && curr[part] !== undefined) {
        curr = curr[part];
      } else {
        return '[missing text]';
      }
    }
    return typeof curr === 'string' ? curr : '[invalid key]';
  }

  // Zobrazí dialogovou bublinu s daným textem nad pozicí x, y
  public show(key: string, x = 400, y = 300): void {
    // Zrušíme předchozí bublinu
    if (this.container) {
      this.container.destroy();
    }

    const content = this.getNestedText(key);

    // Vytvoříme grafiku bubliny
    const bubble = this.scene.add.graphics();
    bubble.fillStyle(0xffffff, 1);
    bubble.lineStyle(2, 0x000000, 1);

    // Přidáme text
    const padding = 10;
    const textObject = this.scene.add.text(0, 0, content, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000',
      wordWrap: { width: 300 }
    });

    // Spočítáme rozměry bubliny
    const bounds = textObject.getBounds();
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    // Vykreslíme obdélník a okraje
    bubble.fillRoundedRect(0, 0, width, height, 8);
    bubble.strokeRoundedRect(0, 0, width, height, 8);

    // Přidáme "ocásek" trojúhelníkem
    bubble.fillTriangle(
      width / 2 - 10, height,
      width / 2 + 10, height,
      width / 2, height + 20
    );
    bubble.strokeTriangle(
      width / 2 - 10, height,
      width / 2 + 10, height,
      width / 2, height + 20
    );

    // Upravíme pozici textu
    textObject.setPosition(padding, padding);

    // Vložíme bubble a text do kontejneru a umístíme na scénu
    this.container = this.scene.add.container(
      x - width / 2,
      y - height - 20,
      [bubble, textObject]
    );
  }

  // Skryje dialogovou bublinu
  public hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}