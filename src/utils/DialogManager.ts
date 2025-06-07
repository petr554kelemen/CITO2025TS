import Phaser from 'phaser';

export default class DialogManager {
  // Referenční proměnné:
  private scene: Phaser.Scene;                           // odkaz na aktuální scénu (abychom mohli přidávat GameObjects)
  private texts: { [key: string]: string };              // slovník lokalizovaných textů (dialogSequence)
  private bubbleContainer: Phaser.GameObjects.Container | null; // kontejner, ve kterém držím pozadí + text bubliny
  private isVisible: boolean;                            // příznak, jestli je bublina právě zobrazená
  private followTarget?: Phaser.GameObjects.Sprite;      // Sprite, který bublina (bubbleContainer) „sleduje“
  private readonly BASE_DISPLAY_TIME_PER_CHAR = 40; // ms na znak
  private readonly MIN_DISPLAY_TIME = 2000;         // Minimální doba zobrazení (2 sekundy)

  constructor(scene: Phaser.Scene, texts: any) {
    this.scene = scene;
    // Z JSONu (předaného z MainMenu/Intro) beru pole dialogSequence:
    this.texts = texts.dialogSequence || {};
    this.bubbleContainer = null;
    this.isVisible = false;
  }

  // Nová pomocná metoda pro získání textu
  public getText(key: string): string {
    return this.texts[key] || `[TEXT MISSING: ${key}]`;
  }

  // Testovací kod pro vykreslování grafických objektů
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

  /** Dočasně vykreslíme jen šipku nad daným sprite (bez obdélníku a textu). */
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
    this.show(txt, obj, offsetY);

    // Vrátí Promise, která se vyřeší po určitém čase (např. 2,2 s)
    return new Promise(resolve => {
        obj.scene.time.delayedCall(2200, () => {
            resolve();
        });
    });
}

  // Veřejná metoda: skryje aktuální bublinu (pokud nějaká je)
  public hideDialog(): void {
    this.hide();
  }

  // Soukromá metoda: vykreslí bublinu s textem; pokud je target, začne ji sledovat
  private show(text: string, target?: Phaser.GameObjects.Sprite, offsetY: number = 0): void {
    // 1) Skryjeme existující bublinu, pokud nějaká je
    this.hide();

    // 2) Vytvoříme Text objekt (levý horní roh v lokálním prostoru containeru)
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#000000',
      wordWrap: { width: 200 }
    };
    const content = this.scene.add.text(0, 0, text, style);

    // 3) Parametry bubliny a šipky
    const padding = 5;       // odsazení textu od okrajů bubliny
    const arrowHeight = 10;  // výška dolů směřující šipky
    const arrowWidth = 20;   // šířka základny šipky

    // 4) Vypočítáme rozměr obdélníku bubliny (bez šipky), včetně paddingu
    const bubbleWidth = content.width + padding * 2;
    const bubbleHeight = content.height + padding * 2;

    // 5) Vytvoříme Graphics a nakreslíme do něj:
    //    – Zaoblený obdélník od (0,0) do (bubbleWidth, bubbleHeight)
    //    – Dolů směřující šipku s bodem na (bubbleWidth/2, bubbleHeight + arrowHeight)
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 1);

    // 5A) Obdélník (roundedRect) – základ bubliny:
    bg.fillRoundedRect(
      0,                 // X-ová lokální pozice levého horního rohu obdélníku
      0,                 // Y-ová lokální pozice levého horního rohu obdélníku
      bubbleWidth,
      bubbleHeight,
      5                  // poloměr zaoblení rohů
    );

    // 5B) Trojúhelník – dolů směřující šipka:
    //     Základna trojúhelníku = (bubbleWidth/2 - arrowWidth/2, bubbleHeight) až (bubbleWidth/2 + arrowWidth/2, bubbleHeight)
    //     Špička trojúhelníku = (bubbleWidth/2, bubbleHeight + arrowHeight)
    bg.fillTriangle(
      bubbleWidth / 2 - arrowWidth / 2, bubbleHeight,            // levý bod základny
      bubbleWidth / 2 + arrowWidth / 2, bubbleHeight,            // pravý bod základny
      bubbleWidth / 2, bubbleHeight + arrowHeight                // špička dolů
    );

    // 6) Vytvoříme container a vložíme do něj oba GameObjecty: Graphics i Text
    this.bubbleContainer = this.scene.add.container(0, 0, [bg, content]);
    this.isVisible = true;
    console.log(this.isVisible);
    

    if (target) {
      this.followTarget = target;

      // 7) Získáme přesné světové souřadnice vrcholu sprite:
      //    – Použijeme getBounds(), aby to bralo v potaz aktuální scale/origin.
      const spriteBounds = target.getBounds();
      const centerX = spriteBounds.centerX; // střed sprite v ose X
      const topY = spriteBounds.top;        // horní hrana sprite v ose Y

      // 8) Vypočítáme pozici containeru tak, aby špička šipky (lokálně [bubbleWidth/2, bubbleHeight + arrowHeight])
      //    ležela přesně na (centerX, topY). Tedy:
      //      container.x = centerX - (bubbleWidth/2)
      //      container.y = topY - (bubbleHeight + arrowHeight)
      this.bubbleContainer.setPosition(
        centerX - bubbleWidth / 2,
        topY + offsetY // <-- zde použij offsetY
      );

      // 9) Text uvnitř bubliny posuneme s odsazením padding od levého a horního okraje obdélníku:
      //    – Obdélník začíná v lokálním (0,0) containeru.
      //    – Text tedy na (padding, padding).
      content.setPosition(
        padding,
        padding
      );

    } else {
      // 10) Bez cílového sprite – klasická bublina dole uprostřed obrazovky, ale bez šipky
      const cam = this.scene.cameras.main;

      // Vytvoříme nový styl pro větší text
      const bigStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: 'Arial',
        fontSize: '28px', // větší text
        color: '#000000',
        wordWrap: { width: cam.width - 120 } // širší bublina
      };

      // Odstraníme původní textový objekt a vytvoříme nový s větším stylem
      content.destroy();
      const bigContent = this.scene.add.text(0, 0, text, bigStyle);

      const padding = 16;
      const bubbleWidth = bigContent.width + padding * 2;
      const bubbleHeight = bigContent.height + padding * 2;

      // Vytvoř nový Graphics objekt pro pozadí bubliny
      const bigBg = this.scene.add.graphics();
      bigBg.fillStyle(0xffffff, 1);
      bigBg.fillRoundedRect(
        0, 0,
        bubbleWidth,
        bubbleHeight,
        12 // větší zaoblení
      );

      bigContent.setPosition(
        padding,
        padding
      );

      // Odeber starý obsah a přidej nový text a nové pozadí
      this.bubbleContainer.removeAll(true);
      this.bubbleContainer.add([bigBg, bigContent]);

      this.bubbleContainer.x = cam.width / 2 - bubbleWidth / 2;
      this.bubbleContainer.y = cam.height - bubbleHeight - 32;
      this.followTarget = undefined;
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


  // Přístupové metody pro případ, že chce scéna (Intro) v update() kontrolovat pozici:
  public getBubbleContainer(): Phaser.GameObjects.Container | null {

    return this.bubbleContainer;
  }


  public getFollowTarget(): Phaser.GameObjects.Sprite | undefined {

    return this.followTarget;
  }


  public updateBubblePosition(): void {
    // Kontrolujeme, zda bublina existuje a zda má nějaký sledovaný cíl.
    if (this.bubbleContainer && this.followTarget) {
      // Získáme aktuální globální ohraničující rámeček cílového spritu.
      // Toto je klíčové, protože getBounds() zohledňuje scale a origin spritu.
      const spriteBounds = this.followTarget.getBounds();
      const centerX = spriteBounds.centerX; // Střed X cílového spritu
      const topY = spriteBounds.top;       // Horní hrana cílového spritu

      // Získáme rozměry samotné bubliny (žlutý obdélník + šipka),
      // aby se zachovalo správné odsazení.
      // Použijeme getBounds() celého containeru, ale musíme zvážit,
      // že celková výška containeru zahrnuje i šipku.
      // Pokud jsi si uložil `bubbleWidth`, `bubbleHeight` a `arrowHeight`
      // jako privátní proměnné v `show()`, použij je pro maximální přesnost.
      // Jinak je musíme odhadnout z container.getBounds().
      // Pro jednoduchost a přesnost v tomto kontextu použijeme:
      //const padding = 5;       // Tyto by měly být stejné jako při tvorbě bubliny
      const arrowHeight = 10;
      // Šířka a výška *obsahu* bubliny, jak byly použity pro výpočet `bubbleWidth` a `bubbleHeight` v `show()`
      // Tady by bylo ideální mít tyto hodnoty uložené z `show()` metody.
      // Protože je nemáme, musíme je buď znovu vypočítat, nebo odhadnout.
      // Pro nejlepší výsledky si uložte `bubbleWidth` a `bubbleHeight` (bez šipky)
      // jako privátní proměnné při vytváření bubliny a použijte je zde.

      // Pokud nemáme uložené bubbleWidth/Height, můžeme je získat z bounds containeru.
      // Nicméně, getBounds() containeru zahrnuje i šipku.
      // Proto musíme od celkové výšky odečíst arrowHeight, abychom dostali výšku samotného obdélníku.
      const containerBounds = this.bubbleContainer.getBounds();
      const actualBubbleWidth = containerBounds.width;
      const actualBubbleHeight = containerBounds.height - arrowHeight; // Výška obdélníku bubliny

      // Nastavení pozice containeru tak, aby špička šipky lícovala s (centerX, topY)
      this.bubbleContainer.setPosition(
        centerX - actualBubbleWidth / 2, // Posun X tak, aby střed bubliny byl pod centerX
        topY - (actualBubbleHeight + arrowHeight) // Posun Y tak, aby špička šipky byla na topY
      );
    }
  }


  // Nová metoda: Vrátí odhadovanou délku zobrazení textu na základě jeho délky
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


  // Nová pomocná metoda pro odhad doby zobrazení dialogu
  public getDialogDisplayDuration(key: string): number {
    const text = this.getText(key);
    // Odhad doby zobrazení: počet znaků * čas na znak, s minimální dobou
    return Math.max(this.MIN_DISPLAY_TIME, text.length * this.BASE_DISPLAY_TIME_PER_CHAR);
  }


  // Nová asynchronní metoda, která zobrazí dialog a počká
  public async showDialogAboveAndDelay(key: string, obj: Phaser.GameObjects.Sprite): Promise<void> {
    this.showDialogAbove(key, obj); // Zobrazí bublinu
    const duration = this.getDialogDisplayDuration(key); // Získá délku zobrazení
    await this.delay(duration); // Počká po určenou dobu
    this.hideDialog(); // Skryje bublinu
    await this.delay(800); // Malá pauza mezi dialogy (např. 0.5 sekundy)
  }

  // Pomocná asynchronní metoda pro zpoždění
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
