import Phaser from 'phaser';

export default class DialogManager {
  // Reference na aktivní scénu, ve které chceme vykreslovat dialogy
  private scene: Phaser.Scene;

  // Objekt s lokalizovanými texty (přijímá se z JSONu, např. texts.dialogSequence)
  private texts: { [key: string]: string };

  // Kontejner, do kterého dáváme Graphics + Text, aby se daly najednou zničit
  private bubbleContainer: Phaser.GameObjects.Container | null;

  // Flag, zda už je bublina viditelná
  private isVisible: boolean;

  constructor(scene: Phaser.Scene, texts: any) {
    this.scene = scene;
    // texts očekává strukturu { dialogSequence: { 'klíč': 'řetězec', … } }
    this.texts = texts.dialogSequence || {};
    this.bubbleContainer = null;
    this.isVisible = false;
  }

  /**
   * Verejná metoda pro zobrazení dialogu dole na obrazovce.
   * @param key Klíč ve formátu "dialogSequence.motyl-00" nebo jen "motyl-00".
   */
  public showDialog(key: string) {
    // Pokud předali formát s 'dialogSequence.', vezmeme jen tu část za tečkou
    const parts = key.split('.');
    const realKey = parts[parts.length - 1];

    // Najdeme text v načteném JSONu
    const text = this.texts[realKey];
    if (!text) {
      console.warn(`DialogManager: Text pro klíč "${realKey}" nebyl nalezen.`);
      return;
    }

    // Pokud už je něco vidět, nejprve to skryjeme
    if (this.isVisible) {
      this.hide();
    }

    // Vykreslíme bublinu dole
    this.show(text);
  }

  /**
   * Verejná metoda pro zobrazení dialogu nad konkrétním sprite objektem.
   * @param key Klíč podobně jako u showDialog.
   * @param obj Phaser.Sprite nad kterým se bublina vykreslí.
   */
  public showDialogAbove(key: string, obj: Phaser.GameObjects.Sprite) {
    const parts = key.split('.');
    const realKey = parts[parts.length - 1];
    const text = this.texts[realKey];
    if (!text) {
      this.show('MISSING');
      return;
    }
    if (!text) {
      console.warn(`DialogManager: Text pro klíč "${realKey}" nebyl nalezen.`);
      return;
    }

    if (this.isVisible) {
      this.hide();
    }

    this.showAbove(text, obj);
  }

  /**
   * Verejná metoda pro ruční skrytí dialogu (pokud ho chceš zavřít dříve, než skončí časovač).
   */
  public hideDialog() {
    this.hide();
  }

  /**
   * Interní metoda pro vykreslení bubliny s textem ve spodní části scény.
   * @param text Řetězec, který chceme zobrazit.
   */
  // private show(text: string) {
  //   // 1) Vypočítáme rozměry bubliny (80% šířky, 25% výšky)
  //   const width = this.scene.scale.width * 0.8;
  //   const height = this.scene.scale.height * 0.25;
  //   const x = (this.scene.scale.width - width) / 2;    // vystředění vodorovně
  //   const y = this.scene.scale.height - height - 20;   // 20 px nad spodní hranou

  //   // 2) Nakreslíme bílou obdélníkovou bublinu s černým orámováním
  //   const bubble = this.scene.add.graphics({ x: x, y: y });
  //   bubble.fillStyle(0xffffff, 1);      // bílá barva výplně
  //   bubble.lineStyle(4, 0x000000, 1);   // černý okraj tloušťky 4 px

  //   const radius = 16;                  // poloměr zaoblení rohů
  //   bubble.fillRoundedRect(0, 0, width, height, radius);
  //   bubble.strokeRoundedRect(0, 0, width, height, radius);

  //   // 3) Přidáme text do bubliny s word-wrap tak, aby se řádky zalamovaly
  //   const padding = 16; // odsazení textu od okrajů bubliny
  //   const content = this.scene.add.text(
  //     x + padding,
  //     y + padding,
  //     text,
  //     {
  //       fontFamily: 'Arial',
  //       fontSize: '20px',
  //       color: '#000000',
  //       wordWrap: { width: width - padding * 2, useAdvancedWrap: true }
  //     }
  //   );

  private show(text: string) {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
    }

    const bubbleWidth = 500;
    const bubbleHeight = 200;
    const x = this.scene.cameras.main.width / 2;
    const y = this.scene.cameras.main.height - bubbleHeight / 2 - 10;

    const bubble = this.scene.add.rectangle(x, y, bubbleWidth, bubbleHeight, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x333333);

    const bubbleText = this.scene.add.text(x, y, text, {
      fontSize: '18px',
      color: '#222',
      align: 'center',
      wordWrap: { width: bubbleWidth - 40 }
    }).setOrigin(0.5);

    this.bubbleContainer = this.scene.add.container(0, 0, [bubble, bubbleText]);

    this.isVisible = true;
  }

  /**
   * Interní metoda pro vykreslení bubliny nad daným Phaser.Sprite.
   * @param text Řetězec, který chceme zobrazit.
   * @param obj Sprite, nad kterým bublina sedne.
   */
  private showAbove(text: string, obj: Phaser.GameObjects.Sprite) {
    // 1) Rozměry bubliny odvodíme od velikosti sprite (např. mírně širší a menší výška)
    const bubbleWidth = obj.displayWidth * 1.5;
    const bubbleHeight = obj.displayHeight * 0.8;

    // Pozice bubliny nad středem sprite
    const x = obj.x - bubbleWidth / 2;
    const y = obj.y - obj.displayHeight / 2 - bubbleHeight - 10; // 10 px mezera

    // 2) Nakreslíme bílou bublinu se zaoblenými rohy
    const bubble = this.scene.add.graphics({ x: x, y: y });
    bubble.fillStyle(0x66887c, .85);
    bubble.lineStyle(3, 0x000000, 1);
    const radius = 18;
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, radius);
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, radius);

    // (Volitelně: šipka dolů uprostřed bubliny – pokud chceš,
    //  odkomentuj následující řádky a uprav podle potřeby)
    bubble.fillTriangle(
      bubbleWidth / 2 - 10, bubbleHeight,
      bubbleWidth / 2 + 10, bubbleHeight,
      bubbleWidth / 2, bubbleHeight + 10
    );
    bubble.lineStyle(3, 0x000000, 1);
    bubble.strokeTriangle(
      bubbleWidth / 2 - 10, bubbleHeight,
      bubbleWidth / 2 + 10, bubbleHeight,
      bubbleWidth / 2, bubbleHeight + 10
    );

    // 3) Přidáme text do bubliny
    const padding = 8;
    const content = this.scene.add.text(
      x + padding,
      y + padding,
      text,
      {
        fontFamily: 'DynaPuff',
        fontSize: '18px',
        color: '#ffffff',
        wordWrap: { width: bubbleWidth - padding * 2, useAdvancedWrap: true }
      }
    );

    // 4) Zabalíme do jednoho Containeru
    this.bubbleContainer = this.scene.add.container(0, 0, [bubble, content]);
    this.isVisible = true;
  }

  /**
   * Interní metoda pro skrytí (zrušení) aktuálně zobrazené bubliny.
   */
  private hide() {
    if (!this.bubbleContainer) {
      return;
    }
    // Zničíme nejprve všechny děti Containeru (Graphics a Text)
    this.bubbleContainer.each((child: Phaser.GameObjects.GameObject) => {
      child.destroy();
    });
    // A teprve pak samotný Container
    this.bubbleContainer.destroy();
    this.bubbleContainer = null;
    this.isVisible = false;
  }
}