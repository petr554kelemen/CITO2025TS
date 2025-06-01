import Phaser from 'phaser';

export default class DialogManager extends Phaser.GameObjects.Container {
  private texts: Record<string, any>;

  constructor(scene: Phaser.Scene, texts: Record<string, any>) {
    super(scene);
    this.texts = texts;
    // Další inicializace, např. this.scene.add.existing(this);
  }

  /**
     * Zobrazí jeden dialog podle klíče na daný čas (ms)
     * @param key Klíč do JSON (např. "motyl-00")
     * @param durationMs Jak dlouho zůstane bublina zobrazená (defaultně 2000 ms)
     */
  // public showDialogByKey(key: string, durationMs: number = 2000) {
  //   //const text = this.dialogs[key]; // řadek s chybou dialogs neexistuje
  //   const text = this.getText(key);   // zkousim nahradit 
  //   if (!text) return;
  //   this.show(text);

  //   // Po uplynutí času dialog zmizí
  //   this.scene.time.delayedCall(durationMs, () => {
  //     this.hide();
  //   });
  // }

  /* public showDialogByKey(key: string, obj: Phaser.GameObjects.Sprite, durationMs: number = 2000) {
    const text = this.getText(key);
    if (!text) return;
    this.showAbove(text, obj);

    // Po uplynutí času dialog zmizí
    this.scene.time.delayedCall(durationMs, () => {
      this.hide();
    });
  }
 */

 /**
   * (Ukázka, pokud chceš zobrazit dialog nad sprite)
   */
  public showDialogAbove(key: string, obj: Phaser.GameObjects.Sprite, durationMs: number = 2000) {
    const text = this.getText(key);
    if (!text) return;
    this.showAbove(text, obj);
    this.scene.time.delayedCall(durationMs, () => this.hide());
  }

  // /** Skryje/zničí bublinu a odhlásí update */
  // public destroy(): void {
  //   if (this.container) {
  //     this.container.destroy();
  //     this.container = undefined;
  //   }
  //   if (this.followTarget) {
  //     this.scene.events.off('update', this.updateBubblePosition, this);
  //     this.followTarget = undefined;
  //   }
  //}

  /** Vytvoří bublinu jednorázově podle aktuální pozice followTarget */
  // private createBubble(key: string) {
  //   if (!this.followTarget) return;

  //   const text = this.getText(key);
  //   // textový objekt
  //   const textObj = this.scene.add.text(0, 0, text, {
  //     fontFamily: 'Arial',
  //     fontSize: '18px',
  //     color: '#000000',
  //     wordWrap: { width: 250 }
  //   });
  //   const bounds = textObj.getBounds();
  //   const pad = 8;
  //   const w = bounds.width + pad * 2;
  //   const h = bounds.height + pad * 2;

  //   // grafika bubliny
  //   const g = this.scene.add.graphics()
  //     .fillStyle(0xffffff, 1)
  //     .lineStyle(2, 0x000000, 1);
  //   g.fillRoundedRect(0, 0, w, h, 6);
  //   g.strokeRoundedRect(0, 0, w, h, 6);
  //   // špička
  //   g.fillTriangle(w / 2 - 6, h, w / 2 + 6, h, w / 2, h + 12);
  //   g.strokeTriangle(w / 2 - 6, h, w / 2 + 6, h, w / 2, h + 12);

  //   textObj.setPosition(pad, pad);

  //   // container se zatím vykreslí na (0,0); poloha se upraví hned v update
  //   this.container = this.scene.add.container(0, 0, [g, textObj]);
  // }

  // /** Každý frame nastaví container nad target */
  // private updateBubblePosition() {
  //   if (!this.container || !this.followTarget) return;

  //   const x = this.followTarget.x;
  //   const y = this.followTarget.y
  //     - this.followTarget.displayHeight / 2
  //     - this.offsetY;

  //   // container kreslíme od levého horního rohu
  //   const bounds = this.container.getBounds();
  //   this.container.setPosition(
  //     x - bounds.width / 2,
  //     y - bounds.height - 12  // 12 = výška špičky
  //   );
  //}

  /**
   * Vrátí text podle zadaného klíče ve stromu (např. 'dialogSequence.motyl-01')
   */
  public getText(key: string): string {
    const result = key.split('.').reduce(
      (o, k) => (o && o[k] !== undefined ? o[k] : undefined),
      this.texts
    );
    if (typeof result !== "string") {
      console.warn("Chybný klíč v lokalizaci:", key);
      return "";
    }
    return result;
  }

  /**
     * Zobrazí dialog podle klíče na daný čas (ms)
    */
  public showDialogByKey(key: string, durationMs: number = 2000) {
    const text = this.getText(key);
    if (!text) return;
    this.show(text);
    this.scene.time.delayedCall(durationMs, () => this.hide());
  }

  public show(key: string, x = 400, y = 300): void {
    //   this.container?.destroy();
    //   const content = this.getText(key);

    //   const bubble = this.scene.add.graphics();
    //   bubble.fillStyle(0xffffff, 1);
    //   bubble.lineStyle(2, 0x000000, 1);

    //   const padding = 10;
    //   const textObj = this.scene.add.text(0, 0, content, {
    //     fontFamily: 'Arial',
    //     fontSize: '18px',
    //     color: '#000000',
    //     wordWrap: { width: 300 }
    //   });

    //   const bounds = textObj.getBounds();
    //   const width = bounds.width + padding * 2;
    //   const height = bounds.height + padding * 2;

    //   bubble.fillRoundedRect(0, 0, width, height, 8);
    //   bubble.strokeRoundedRect(0, 0, width, height, 8);
    //   bubble.fillTriangle(
    //     width / 2 - 10, height,
    //     width / 2 + 10, height,
    //     width / 2, height + 20
    //   );
    //   bubble.strokeTriangle(
    //     width / 2 - 10, height,
    //     width / 2 + 10, height,
    //     width / 2, height + 20
    //   );

    //   textObj.setPosition(padding, padding);
    //   this.container = this.scene.add.container(
    //     x - width / 2,
    //     y - height - 20,
    //     [bubble, textObj]
    //   );
  }

  public hide(): void {
    // this.container?.destroy();
    // this.container = undefined;
  }
}
