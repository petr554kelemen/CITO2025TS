import Phaser from 'phaser';

export default class DialogManager {
  // Referenční proměnné:
  private scene: Phaser.Scene;                           // odkaz na aktuální scénu (abychom mohli přidávat GameObjects)
  private texts: { [key: string]: string };              // slovník lokalizovaných textů (dialogSequence)
  private bubbleContainer: Phaser.GameObjects.Container | null; // kontejner, ve kterém držím pozadí + text bubliny
  private isVisible: boolean;                            // příznak, jestli je bublina právě zobrazená
  private followTarget?: Phaser.GameObjects.Sprite;      // Sprite, který bublina (bubbleContainer) „sleduje“
  private readonly BASE_DISPLAY_TIME_PER_CHAR = 40;      // ms na znak
  private readonly MIN_DISPLAY_TIME = 2000;              // Minimální doba zobrazení (2 sekundy)
  private lastOffsetY: number = 0;                       // Poslední použitý offsetY pro pozicování bubliny
  private dialogText?: Phaser.GameObjects.Text;          // Textový objekt pro zobrazení dialogu

  /**
   * Vytvoří nového správce dialogů pro danou scénu a lokalizované texty.
   * @param scene Aktuální Phaser scéna, kde se budou dialogy zobrazovat.
   * @param texts Objekt s lokalizovanými texty (např. dialogSequence).
   */
  constructor(scene: Phaser.Scene, texts: any) {
    this.scene = scene;
    // Z JSONu (předaného z MainMenu/Intro) beru pole dialogSequence:
    this.texts = texts.dialogSequence || {};
    this.bubbleContainer = null;
    this.isVisible = false;
  }

  /**
   * Vrátí lokalizovaný text pro daný klíč, nebo placeholder pokud text chybí.
   * @param key Klíč textu v lokalizačním slovníku.
   * @returns Lokalizovaný text nebo placeholder.
   */
  public getText(key: string): string {
    return this.texts[key] || `[TEXT MISSING: ${key}]`;
  }

  /**
   * Pro začátečníky: vykreslí rámeček kolem sledovaného sprite a případné bubliny.
   * Pomáhá vizuálně ladit pozice dialogů.
   * @param obj Sprite, jehož bounds se mají zvýraznit.
   */
  public beginnerTest(obj: Phaser.GameObjects.Sprite): void {
    // 1) Pokud existuje followTarget (např. motýl nebo duch), vykreslíme jeho bounds:
    this.followTarget = obj;
    if (this.followTarget) {
      // Zjistíme bounding box targetu
      const targetBounds = this.followTarget.getBounds();
      // Vytvoříme Graphics pro rámeček targetu
      const gTarget = this.scene.add.graphics();
      gTarget.lineStyle(2, 0x00ff00, 1); // zelená linka tl. 2px
      gTarget.strokeRect(
        targetBounds.x,
        targetBounds.y,
        targetBounds.width,
        targetBounds.height
      );
      gTarget.setDepth(9999); // vykreslíme nad vším ostatním
    }

    // 2) Pokud existuje bublina (container), vykreslíme její bounding box:
    if (this.bubbleContainer) {
      const bubbleBounds = this.bubbleContainer.getBounds();
      const gBubble = this.scene.add.graphics();
      gBubble.lineStyle(2, 0xff0000, 1); // červená linka tl. 2px
      gBubble.strokeRect(
        bubbleBounds.x,
        bubbleBounds.y,
        bubbleBounds.width,
        bubbleBounds.height
      );
      gBubble.setDepth(9999);
    }
  }

  /** Dočasně vykreslí jen šipku nad daným sprite (bez obdélníku a textu). */
  public showArrowOnly(target: Phaser.GameObjects.Sprite): void {
    // 1) Odstraníme předchozí container
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = null;
    }

    // 2) Parametry šipky
    const arrowHeight = 10;   // výška šipky
    const arrowWidth = 20;   // šířka základny šipky

    // 3) Spočítáme, jak velký je právě obrázek sprite (origin 0.5,0.5 předpoklad)
    //const originWidth = target.frame.width;
    const originHeight = target.frame.height;

    // 4) Body pro umístění šipky: chceme, aby špička šipky byla v bodě (centerX, topY)
    const centerX = target.x;
    const topY = target.y - originHeight / 2;

    // 5) Vytvoříme Graphics a nakreslíme pouze trojúhelník (šipku):
    //    – body trojúhelníku relativně k (0,0) containeru budou:
    //      A = [ arrowWidth/2 * -1, 0 ] (levý bod základny)
    //      B = [ arrowWidth/2, 0 ]       (pravý bod základny)
    //      C = [ 0, arrowHeight ]       (špička dolů)
    //    Ale my raději nakreslíme přímo v lokálních souřadnicích: 
    //      • levý bod:   ( (arrowWidth/2)*-1, 0 )  = ( -arrowWidth/2, 0 )
    //      • pravý bod:  (  arrowWidth/2, 0 )
    //      • špička:     ( 0, arrowHeight )
    //
    //    Když kontejne­r překlopíme posunem pozice, ukotvíme tu špičku na (centerX, topY).
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffaa00, 1); // např. oranžová šipka pro lepší viditelnost

    // Trojúhelník: body přesně pro šipku směřující dolů
    bg.fillTriangle(
      -arrowWidth / 2, 0,     // (levý bod základny)
      arrowWidth / 2, 0,     // (pravý bod základny)
      0, arrowHeight         // (špička dolů)
    );

    // 6) Vytvoříme container s jediným prvkem (bg)
    this.bubbleContainer = this.scene.add.container(0, 0, [bg]);

    // 7) Posuneme container tak, aby jeho lokální bod (0, arrowHeight) 
    //    (tj. špička šipky) ležel na (centerX, topY):
    this.bubbleContainer.setPosition(
      centerX,
      topY - arrowHeight
    );

    // 8) Pro ladění vykreslíme zkrátka malý puntík na centerX, topY (vrchol sprite)
    //    abychom viděli, zda šipka opravdu ukazuje na střed vrchu:
    //const debugDot = this.scene.add.circle(centerX, topY, 3, 0xff0000);
    //this.scene.time.delayedCall(1000, () => debugDot.destroy());
  }

  // Veřejná metoda: zobrazí bublinu dole (bez followTarget)
  public showDialog(key: string): void {
    const txt = this.texts[key];
    if (!txt) {
      console.warn(`DialogManager: Text pro klíč "${key}" nenalezen.`);
      return;
    }
    // Zobrazím bublinu s daným textem (bez cílového objektu)
    this.show(txt);
  }

  // Veřejná metoda: zobrazí bublinu nad zadaným objektem (např. nad motýlem)
  public showDialogAbove(key: string, obj: Phaser.GameObjects.Sprite, offsetY: number = 0): Promise<void> {
    const txt = this.texts[key];
    if (!txt) {
        console.warn(`DialogManager: Text pro klíč "${key}" nenalezen.`);
        return Promise.resolve();
    }
    // Ověření existence scény a objektu
    if (!obj || !obj.scene || !obj.scene.sys || !obj.scene.sys.isActive()) {
        this.hide();
        return Promise.resolve();
    }
    this.show(txt, obj, offsetY);

    // Vrátí Promise, která se vyřeší po určitém čase (např. 2,2 s)
    return new Promise(resolve => {
        if (obj.scene && obj.scene.time) {
            obj.scene.time.delayedCall(2200, () => {
                resolve();
            });
        } else {
            // Pokud není scéna platná, resolve hned
            resolve();
        }
    });
}

  // Veřejná metoda: skryje aktuální bublinu (pokud nějaká je)
  /**
   * Hides the currently displayed dialog by invoking the internal `hide` method.
   *
   * @remarks
   * This method should be called to programmatically close or hide the dialog managed by this instance.
   */
  public hideDialog(): void {
    this.hide();
  }

  // Soukromá metoda: vykreslí bublinu s textem; pokud je target, začne ji sledovat
  /**
   * Displays a dialog bubble with the specified text, optionally anchored to a target sprite.
   * 
   * If a target sprite is provided, the dialog bubble will appear above the sprite, offset by the specified Y value.
   * If no target is provided, the dialog bubble will be displayed centered at the bottom of the screen with a larger style.
   * 
   * The dialog bubble automatically adjusts its size and font based on the current scale factor for responsive design.
   * 
   * @param text - The text content to display inside the dialog bubble.
   * @param target - (Optional) The Phaser sprite to anchor the dialog bubble to. If omitted, the bubble is shown at the bottom of the screen.
   * @param offsetY - (Optional) Vertical offset in pixels to apply when positioning the bubble relative to the target. Defaults to 0.
   */
  private show(text: string, target?: Phaser.GameObjects.Sprite, offsetY: number = 0): void {
    this.hide();
    this.lastOffsetY = offsetY; // <-- přidej tento řádek

    // Získání scale faktoru (mobile-first, fallback 1)
    const scaleFactor = (this.scene as any).responsive?.getScaleFactor?.(667, 375) ?? 1;

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Merienda, Arial', // Použijeme font Barrio pro bublinu
      fontSize: `${14 * scaleFactor}px`, // větší písmo pro lepší čitelnost
      color: '#000000',
      wordWrap: { width: 220 * scaleFactor }
    };
    const padding = 10 * scaleFactor;
    const arrowHeight = 12 * scaleFactor;
    const arrowWidth = 24 * scaleFactor;

    const content = this.scene.add.text(0, 0, text, style);

    const bubbleWidth = content.width + padding * 2;
    const bubbleHeight = content.height + padding * 2;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 5 * scaleFactor);

    bg.fillTriangle(
      bubbleWidth / 2 - arrowWidth / 2, bubbleHeight,
      bubbleWidth / 2 + arrowWidth / 2, bubbleHeight,
      bubbleWidth / 2, bubbleHeight + arrowHeight
    );

    this.bubbleContainer = this.scene.add.container(0, 0, [bg, content]);
    this.isVisible = true;

    if (target) {
      this.followTarget = target;
      const spriteBounds = target.getBounds();
      const centerX = spriteBounds.centerX;
      const topY = spriteBounds.top;

      this.bubbleContainer.setPosition(
        centerX - bubbleWidth / 2,
        topY + offsetY
      );
      content.setPosition(padding, padding);
    } else {
      const cam = this.scene.cameras.main;
      const bigStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: 'Merienda, Arial',
        fontSize: `${24 * scaleFactor}px`,
        color: '#000000',
        wordWrap: { width: cam.width - 120 * scaleFactor }
      };
      content.destroy();
      const bigContent = this.scene.add.text(0, 0, text, bigStyle)
        .setOrigin(0, 0) // OPRAVA: zarovnat vlevo nahoře
        .setDepth(9999);

      const bigPadding = 16 * scaleFactor;
      const bubbleWidth = bigContent.width + bigPadding * 2;
      const bubbleHeight = bigContent.height + bigPadding * 2;

      const bigBg = this.scene.add.graphics();
      bigBg.fillStyle(0xffffff, 1);
      bigBg.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 12 * scaleFactor);

      bigContent.setPosition(bigPadding, bigPadding);

      this.bubbleContainer.removeAll(true);
      this.bubbleContainer.add([bigBg, bigContent]);

      this.bubbleContainer.x = cam.width / 2 - bubbleWidth / 2;
      this.bubbleContainer.y = cam.height - bubbleHeight - 32 * scaleFactor;
    }
  }


  // Soukromá metoda: zruší bublinu (odstraní container z scény)
  private hide(): void {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();    // smaže container i s obsahem (bg + text)
      this.bubbleContainer = null;
      this.isVisible = false;
      this.followTarget = undefined;
    }
  }


  /**
   * Vrací aktuální container s dialogovou bublinou, nebo null pokud není žádná zobrazena.
   * @returns Container s bublinou nebo null.
   */
  public getBubbleContainer(): Phaser.GameObjects.Container | null {

    return this.bubbleContainer;
  }


  /**
   * Vrací sprite, ke kterému je aktuálně bublina ukotvena (pokud existuje).
   * @returns Sprite nebo undefined.
   */
  public getFollowTarget(): Phaser.GameObjects.Sprite | undefined {

    return this.followTarget;
  }


  /**
   * Aktualizuje pozici dialogové bubliny podle aktuální pozice sledovaného sprite.
   * Vhodné volat v update() scén, pokud se sprite pohybuje.
   */
  public updateBubblePosition(): void {
    if (this.bubbleContainer && this.followTarget && this.followTarget.active) {
        const spriteBounds = this.followTarget.getBounds();
        const centerX = spriteBounds.centerX;
        const topY = spriteBounds.top;
        const arrowHeight = 10;
        const containerBounds = this.bubbleContainer.getBounds();
        const actualBubbleWidth = containerBounds.width;
        const actualBubbleHeight = containerBounds.height - arrowHeight;

        const offsetY = this.lastOffsetY ?? 0; // <-- použij uložený offset
        this.bubbleContainer.setPosition(
            centerX - actualBubbleWidth / 2,
            topY + offsetY // <-- offsetY se nyní použije vždy
        );
    } else if (this.bubbleContainer) {
        this.hide();
    }
  }


  /**
   * Odhadne dobu zobrazení dialogu podle délky textu (v ms).
   * @param key Klíč textu v lokalizačním slovníku.
   * @returns Doba zobrazení v milisekundách.
   */
  public getDisplayDurationForKey(key: string): number {
    const txt = this.texts[key];
    if (!txt) {
      console.warn(`DialogManager: Text pro klíč "${key}" nenalezen při výpočtu délky.`);
      return 1000; // Výchozí délka, pokud text není nalezen
    }
    // Odhad: 60ms na znak + minimálně 1500ms
    // Můžeš si tuto logiku upravit podle potřeby, aby dialogy byly čitelné.
    const duration = Math.max(1500, txt.length * 60);
    return duration;
  }


  /**
   * Vrací dobu zobrazení dialogu podle počtu znaků a minimální doby.
   * @param key Klíč textu v lokalizačním slovníku.
   * @returns Doba zobrazení v milisekundách.
   */
  public getDialogDisplayDuration(key: string): number {
    const text = this.getText(key);
    // Odhad doby zobrazení: počet znaků * čas na znak, s minimální dobou
    return Math.max(this.MIN_DISPLAY_TIME, text.length * this.BASE_DISPLAY_TIME_PER_CHAR);
  }


  /**
   * Zobrazí dialog nad zadaným objektem a čeká po dobu odpovídající délce textu.
   * Po uplynutí doby dialog skryje a čeká ještě krátkou prodlevu.
   * @param key Klíč textu v lokalizačním slovníku.
   * @param obj Objekt, nad kterým se má dialog zobrazit.
   * @param offsetY Volitelný posun bubliny ve směru Y.
   * @returns Promise, která se vyřeší po zobrazení a skrytí dialogu.
   */
  public async showDialogAboveAndDelay(key: string, obj: Phaser.GameObjects.GameObject, offsetY: number = 0): Promise<void> {
    if ((obj as Phaser.GameObjects.Sprite).getBounds) {
      this.showDialogAbove(key, obj as Phaser.GameObjects.Sprite, offsetY);
    } else {
      // fallback: zobraz nad středem objektu
      const txt = this.texts[key];
      if (txt) {
        const centerX = (obj as any).x ?? 0;
        const topY = (obj as any).y ?? 0;
        this.show(txt, undefined, offsetY);
        if (this.bubbleContainer) {
          this.bubbleContainer.setPosition(centerX, topY + offsetY);
        }
      }
    }
    const duration = this.getDialogDisplayDuration(key);
    await this.delay(duration);
    this.hideDialog();
    await this.delay(800);
  }

  /**
   * Pomocná metoda pro asynchronní zpoždění (delay).
   * @param ms Počet milisekund, po které se má čekat.
   * @returns Promise, která se vyřeší po uplynutí času.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
