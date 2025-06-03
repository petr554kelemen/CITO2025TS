import Phaser from 'phaser';

export default class DialogManager {
  // Referenční proměnné:
  private scene: Phaser.Scene;                           // odkaz na aktuální scénu (abychom mohli přidávat GameObjects)
  private texts: { [key: string]: string };              // slovník lokalizovaných textů (dialogSequence)
  private bubbleContainer: Phaser.GameObjects.Container | null; // kontejner, ve kterém držím pozadí + text bubliny
  private isVisible: boolean;                            // příznak, jestli je bublina právě zobrazená
  private followTarget?: Phaser.GameObjects.Sprite;      // Sprite, který bublina (bubbleContainer) „sleduje“

  constructor(scene: Phaser.Scene, texts: any) {
    this.scene = scene;
    // Z JSONu (předaného z MainMenu/Intro) beru pole dialogSequence:
    this.texts = texts.dialogSequence || {};
    this.bubbleContainer = null;
    this.isVisible = false;
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
    const arrowWidth  = 20;   // šířka základny šipky

    // 3) Spočítáme, jak velký je právě obrázek sprite (origin 0.5,0.5 předpoklad)
    const originWidth  = target.frame.width;
    const originHeight = target.frame.height;

    // 4) Body pro umístění šipky: chceme, aby špička šipky byla v bodě (centerX, topY)
    const centerX = target.x;
    const topY    = target.y - originHeight / 2;

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
    const debugDot = this.scene.add.circle(centerX, topY, 3, 0xff0000);
    this.scene.time.delayedCall(1000, () => debugDot.destroy());
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
  public showDialogAbove(key: string, obj: Phaser.GameObjects.Sprite): void {
    const txt = this.texts[key];
    if (!txt) {
      console.warn(`DialogManager: Text pro klíč "${key}" nenalezen.`);
      return;
    }
    // Zobrazím bublinu s daným textem nad objektem `obj`
    this.show(txt, obj);
  }

  // Veřejná metoda: skryje aktuální bublinu (pokud nějaká je)
  public hideDialog(): void {
    this.hide();
  }

  // Soukromá metoda: vykreslí bublinu s textem; pokud je target, začne ji sledovat
  private show(text: string, target?: Phaser.GameObjects.Sprite): void {
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
        topY - (bubbleHeight + arrowHeight)
      );

      // 9) Text uvnitř bubliny posuneme s odsazením padding od levého a horního okraje obdélníku:
      //    – Obdélník začíná v lokálním (0,0) containeru.
      //    – Text tedy na (padding, padding).
      content.setPosition(
        padding,
        padding
      );

    } else {
      // 10) Bez cílového sprite – klasická bublina dole uprostřed obrazovky
      const cam = this.scene.cameras.main;
      this.bubbleContainer.x = cam.width / 2 - bubbleWidth / 2;
      this.bubbleContainer.y = cam.height - bubbleHeight - 20;
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
    //if (this.bubbleContainer) {
    return this.bubbleContainer;
    //} else {
    //  console.error('Kontejner bubble neexistuje !');
    //  return null;
    //}
  }

  public getFollowTarget(): Phaser.GameObjects.Sprite | undefined {
    //if (this.followTarget){
    return this.followTarget;
    //} else {
    //  console.error('Objekt pro bubble neexistuje !');
    //  return undefined;
    //}
  }
}
