import Phaser from 'phaser';

//type Translations = Record<string, any>;

export default class DialogManager {
  //private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  //private texts: Record<string, any>;
  // pod private texts: Record<string, any>;
  private followTarget?: Phaser.GameObjects.Sprite;    // kam se bude bublina přichytávat
  private offsetY: number = 10;                        // mezera nad objektem
  private locale: 'cs' | 'en' | 'pl';                  // zvolený jazyk

  constructor(private scene: Phaser.Scene, locale: 'cs' | 'en' | 'pl') {
    this.scene = scene;
    this.locale = locale;
    // načteme JSON podle zvoleného jazyka
    //this.texts = this.scene.cache.json.get(`locale-${locale}`) as Record<string, any>;
  }

  // nyní public, abyste z IntroScene mohl měřit délku
  // public getText(path: string): string {
  //   const parts = path.split('.');
  //   let curr: any = this.texts;
  //   for (const p of parts) {
  //     if (curr?.[p] !== undefined) curr = curr[p];
  //     else return '[missing text]';
  //   }
  //   return typeof curr === 'string' ? curr : '[invalid key]';
  // }

  public showAbove(
    key: string,
    target: Phaser.GameObjects.Sprite
  ): void {
    // 1) pokud už je nějaká bublina, zničíme ji (a odhlásíme update)
    this.destroy();

    // 2) uložíme si cíl a vykreslíme poprvé
    this.followTarget = target;
    this.createBubble(key);

    // 3) přihlásíme se k eventu update, který běží každý frame
    this.scene.events.on('update', this.updateBubblePosition, this);
  }

  /** Skryje/zničí bublinu a odhlásí update */
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
    if (this.followTarget) {
      this.scene.events.off('update', this.updateBubblePosition, this);
      this.followTarget = undefined;
    }
  }

  /** Vytvoří bublinu jednorázově podle aktuální pozice followTarget */
  private createBubble(key: string) {
    if (!this.followTarget) return;

    const text = this.getText(key);
    // textový objekt
    const textObj = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000',
      wordWrap: { width: 250 }
    });
    const bounds = textObj.getBounds();
    const pad = 8;
    const w = bounds.width + pad * 2;
    const h = bounds.height + pad * 2;

    // grafika bubliny
    const g = this.scene.add.graphics()
      .fillStyle(0xffffff, 1)
      .lineStyle(2, 0x000000, 1);
    g.fillRoundedRect(0, 0, w, h, 6);
    g.strokeRoundedRect(0, 0, w, h, 6);
    // špička
    g.fillTriangle(w / 2 - 6, h, w / 2 + 6, h, w / 2, h + 12);
    g.strokeTriangle(w / 2 - 6, h, w / 2 + 6, h, w / 2, h + 12);

    textObj.setPosition(pad, pad);

    // container se zatím vykreslí na (0,0); poloha se upraví hned v update
    this.container = this.scene.add.container(0, 0, [g, textObj]);
  }

  /** Každý frame nastaví container nad target */
  private updateBubblePosition() {
    if (!this.container || !this.followTarget) return;

    const x = this.followTarget.x;
    const y = this.followTarget.y
      - this.followTarget.displayHeight / 2
      - this.offsetY;

    // container kreslíme od levého horního rohu
    const bounds = this.container.getBounds();
    this.container.setPosition(
      x - bounds.width / 2,
      y - bounds.height - 12  // 12 = výška špičky
    );
  }

  /** Vrátí text z JSON (stejné jako dříve) */
  public getText(key: string): string {
  const obj = this.scene.cache.json.get(`locale-${this.locale}`) as any;
  return key.split('.').reduce((o, k) => o[k], obj);
}

  public show(key: string, x = 400, y = 300): void {
    this.container?.destroy();
    const content = this.getText(key);

    const bubble = this.scene.add.graphics();
    bubble.fillStyle(0xffffff, 1);
    bubble.lineStyle(2, 0x000000, 1);

    const padding = 10;
    const textObj = this.scene.add.text(0, 0, content, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000',
      wordWrap: { width: 300 }
    });

    const bounds = textObj.getBounds();
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    bubble.fillRoundedRect(0, 0, width, height, 8);
    bubble.strokeRoundedRect(0, 0, width, height, 8);
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

    textObj.setPosition(padding, padding);
    this.container = this.scene.add.container(
      x - width / 2,
      y - height - 20,
      [bubble, textObj]
    );
  }

  public hide(): void {
    this.container?.destroy();
    this.container = undefined;
  }
}
