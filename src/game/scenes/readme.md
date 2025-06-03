## Přehled struktury souboru DialogManager.ts

# Třída:

export default class DialogManager { ... }

# Vlastnosti (fields):

private scene: Phaser.Scene; — reference na aktuální scénu.
private texts: { [key: string]: string }; — lokalizované texty (dialogSequence).
private bubbleContainer: Phaser.GameObjects.Container | null; — kontejner pro bublinu.
private isVisible: boolean; — označuje, zda je bublina zobrazená.
private followTarget?: Phaser.GameObjects.Sprite; — sprite, nad kterým bublina sleduje.

# Konstruktor:

constructor(scene: Phaser.Scene, texts: any) {
  this.scene = scene;
  this.texts = texts.dialogSequence || {};
  this.bubbleContainer = null;
  this.isVisible = false;
}

Ukládá scene a texts.dialogSequence.

# Metody:

public showDialog(key: string): void — zobrazí bublinu dole.
public showDialogAbove(key: string, obj: Phaser.GameObjects.Sprite): void — zobrazí bublinu nad obj.
public hideDialog(): void — skryje bublinu.
private show(text: string, target?: Phaser.GameObjects.Sprite): void — vykreslí bublinu na pozici target nebo dole.
private showAbove(text: string, obj: Phaser.GameObjects.Sprite): void — vykreslí bublinu nad obj.
private hide(): void — zničí bubbleContainer.
public getBubbleContainer(): Phaser.GameObjects.Container | null — vrací bubbleContainer.
public getFollowTarget(): Phaser.GameObjects.Sprite | undefined — vrací followTarget.

## Přehled struktury souboru MainMenu.ts

Třída:

export default class MainMenu extends Phaser.Scene { ... }

Vlastnosti (fields):

Žádné explicitní private nebo public proměnné; všechny instance (divkaStoji, plnyPytel, vlajky, nadpisy) jsou lokální proměnné v metodě create().

Metody:

constructor()

constructor() {
  super('MainMenu');
}

Zavolání rodičovského konstruktoru scény s klíčem 'MainMenu'.

preload(): void

preload(): void {
  // načtení JSONů i vlaječek v preloader.ts
}

Prázdná metoda, připravena pro budoucí načítání assetů.

create(): void

create(): void {
  // Vytvoření pozadí, textů, logo, vlajek pro výběr jazyka
}

Vkládá grafické prvky: pozadí (freepik_forest_02), texty, logo (Cito_logo), obrázky (divkaStoji, plnyPytel) a interaktivní vlajky.

selectLang(lang: string): void

private selectLang(lang: string): void {
  const texts = this.cache.json.get(`lang-${lang}`);
  if (!texts) {
    console.warn(`Texty pro jazyk ${lang} nenalezeny, přepínám na EN.`);
    localStorage.setItem('language', 'en');
    this.scene.restart();
    return;
  }
  this.scene.start('Intro', { texts, language: lang });
}

Načte JSON pro zvolený jazyk a spustí scénu Intro.

## Přehled struktury souboru Intro.ts

Třída:

export default class Intro extends Phaser.Scene { ... }

Vlastnosti (fields):

private dialog!: DialogManager;

odpadkyData: Odpadek[] = [...];

pytel!: Phaser.GameObjects.Sprite;

citoLogo!: Phaser.GameObjects.Image;

background!: Phaser.GameObjects.Image;

motyl!: Phaser.GameObjects.Sprite;

duch!: Phaser.GameObjects.Sprite;

prevX!: number;

guides?: any;

lang: any;

texts!: DialogTexts;

Typy:

type Odpadek = {
  typ: string;
  pozice: { x: number; y: number };
  scale?: number;
  angle?: number;
  status: string;
  sprite: Phaser.GameObjects.Sprite | null;
};

type DialogTexts = {
  dialogSequence: Record<string, string>;
  dialogGameSequence?: Record<string, string>;
};

Konstruktor:

constructor() {
  super('Intro');
}

Volá rodičovský konstruktor scény s klíčem 'Intro'.

Metody:

init(data: { texts: DialogTexts; language: string }): void

Ukládá language a texts předané z MainMenu.

create(): void

Vykreslí pozadí, ducha, pytel, odpadky, motýla, logo.

Inicializuje DialogManager.

Sestaví tweenový řetězec pro motýla, přidá showDialogAbove na každé zastávce.

dialogMotylDuch(): void

Spustí sekvenci dialogů mezi motýlem a duchem s časovým zpožděním.

update(): void

Aktualizuje pozici bubliny (bubbleContainer) podle followTarget.

Zajišťuje překlopení motýla (setFlipX) podle směru letu.

Pokud existuje bublina, ale followTarget ne, volá hideDialog().

