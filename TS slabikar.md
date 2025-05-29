# TYPE SCRIPT SLABIKÁŘ

## Obsah

* [Rychlý souhrn základních typů](#rychlý-souhrn-základních-typů)
* [Pole (arrays)](#pole-arrays)
* [Objektové typy a interface](#objektové-typy-a-interface)
* [Speciální typy pro Phaser](#speciální-typy-pro-phaser)
* [Další užitečné typy (enum, union)](#další-užitečné-typy-enum-union)
* [Příklady pro hru v Phaseru](#příklady-pro-hru-v-phaseru)
* [Nejčastější typy v metodách Phaser scény](#nejčastější-typy-v-metodách-phaser-scény)
* [Deklarace vlastností v těle třídy](#deklarace-vlastností-v-těle-třídy)
* [Sdílení typů napříč scénami](#sdílení-typů-napříč-scénami)
* [Typické chyby a rady](#typické-chyby-a-rady)

---

| Typ         | Použití                         | Příklad použití           |          |
| ----------- | ------------------------------- | ------------------------- | -------- |
| `number`    | čísla                           | `let x: number = 42`      |          |
| `string`    | text                            | `let s: string = "ahoj"`  |          |
| `boolean`   | pravda/nepravda                 | `let b: boolean = false`  |          |
| `any`       | (nedoporučeno, cokoliv)         | `let cokoliv: any`        |          |
| `void`      | návratová hodnota funkce        | `function foo(): void {}` |          |
| `T[]`       | pole hodnot                     | `let pole: string[]`      |          |
| `type`      | alias, jednoduché objekty       | viz výše                  |          |
| `interface` | větší datové objekty, dědičnost | viz výše                  |          |
| `enum`      | výčet několika možností         | viz výše                  |          |
| \`          | \`                              | „nebo“, unie více typů    | viz výše |

---

## Rychlý souhrn základních typů v TypeScriptu

**number**
Celá a desetinná čísla

```ts
let skore: number = 0;
```

**string**
Text

```ts
let jmeno: string = "Motýl";
```

**boolean**
Pravda/nepravda

```ts
let jeZivy: boolean = true;
```

**null a undefined**
Zvláštní hodnoty „nic“ a „nedefinováno“

```ts
let vybrano: string | null = null;
```

---

## Pole (arrays)

`number[]`, `string[]`, `any[]`

```ts
let cisla: number[] = [1, 2, 3];
let slova: string[] = ["banán", "baterie"];
```

---

## Objektové typy a interface

**Objekt s vlastnostmi:**

```ts
let odpadek: { typ: string; status: string; };
odpadek = { typ: "Banán", status: "default" };
```

**type alias:**

```ts
type Odpadek = { typ: string; status: string; };
let odpadky: Odpadek[] = [];
```

**interface:**
(Vhodnější pro větší objekty, lze rozšiřovat a dědit)

```ts
interface Odpadek {
  typ: string;
  pozice: { x: number; y: number };
  status: string;
  sprite: Phaser.GameObjects.Sprite | null;
}
```
---

**Použití const ve funkci/metodě (stejné jako v JS):**
```ts
create(): void {
    const pytel = this.add.sprite(400, 300, 'pytel');
    // pytel je platný jen uvnitř create()
    // dál pracuješ s pytel (ne s this.pytel)
}
```
---

***Výhoda:***
Proměnná je „jen pro tuto metodu“ – nemůžeš ji používat jinde v třídě.
Typ si TypeScript odvodí automaticky (nemusíš často uvádět, ale můžeš):

```ts
const pytel: Phaser.GameObjects.Sprite = this.add.sprite(400, 300, 'pytel');
```

Rozdíl mezi *const pytel* = ... a *this.pytel* = ...:

const pytel:
Použiješ jen ve funkci/metodě, kde ji vytvoříš (např. v create()).
Nejčastější pro jednorázové objekty, které nepotřebuješ dál v celé třídě.

this.pytel:
Potřebuješ-li k pytli přistupovat i v jiných metodách třídy (např. v update(), ve vlastních funkcích, při kolizích…), je lepší deklarovat jako vlastnost třídy.

### Praktický příklad obou variant:
```ts
export default class GameScene extends Phaser.Scene {
    // Pro opakované použití v celé třídě:
    pytel!: Phaser.GameObjects.Sprite;

    create(): void {
        // Varianta 1: vlastnost třídy
        this.pytel = this.add.sprite(400, 300, 'pytel');

        // Varianta 2: pouze lokální proměnná
        const pytel = this.add.sprite(400, 300, 'pytel');
        // pytel platí jen uvnitř create()
    }

    update(): void {
        // přístup jen k this.pytel, ne k 'const pytel'
    }
}
```
**Shrnutí:**
*const pytel* = ... – používej jen, když pytel nepotřebuješ jinde než v dané metodě.
*this.pytel* = ... – když potřebuješ pytel používat napříč třídou/scénou.

---

## Speciální typy pro Phaser

**Phaser.GameObjects.Sprite**
Odkaz na sprite objekt (přes import z Phaseru)
**void**
Funkce nic nevrací

```ts
function vypis(): void { ... }
```

**any**
Jakýkoli typ (používej co nejméně)

```ts
let cokoliv: any;
```

---

## Další užitečné typy (enum, union)

**enum**
Výčet možných hodnot

```ts
enum Stav { Default, Spravny, Spatny }
let aktualni: Stav = Stav.Default;
```

**Union (|)**
Proměnná může být jeden z typů

```ts
let stav: "default" | "spravne" | "spatne";
```

---

## Příklady pro hru v Phaseru

**Alias typu pro pole odpadků:**

```ts
type Odpadek = {
  typ: string;
  pozice: { x: number; y: number };
  status: string;
  sprite: Phaser.GameObjects.Sprite | null;
};

let odpadkyData: Odpadek[] = [];
```

---

## Nejčastější typy v metodách Phaser scény

```ts
init(): void { ... }
preload(): void { ... }
create(): void { ... }
update(time: number, delta: number): void { ... }
```

---

## Deklarace vlastností v těle třídy

**Bez aliasu:**

```ts
export default class Intro extends Phaser.Scene {
    odpadkyData: {
        typ: string;
        pozice: { x: number; y: number };
        status: string;
        sprite: Phaser.GameObjects.Sprite | null;
    }[];

    // ...
}
```

**S type aliasem:**

```ts
type Odpadek = {
    typ: string;
    pozice: { x: number; y: number };
    status: string;
    sprite: Phaser.GameObjects.Sprite | null;
};

export default class Intro extends Phaser.Scene {
    odpadkyData: Odpadek[];

    // ...
}
```

---

## Sdílení typů napříč scénami

**1. Vytvoř samostatný soubor s typem** (např. `types/Odpadek.ts`):

```ts
export interface Odpadek {
    typ: string;
    pozice: { x: number; y: number };
    status: string;
    sprite: Phaser.GameObjects.Sprite | null;
}
```

**2. Importuj typ v jiných souborech:**

```ts
import { Odpadek } from '../types/Odpadek';

export default class Intro extends Phaser.Scene {
    odpadkyData: Odpadek[];

    // ...
}
```

---

## Typické chyby a rady

* Pokud ti TypeScript píše, že vlastnost neexistuje v typu, musíš ji přidat do deklarace třídy.
* `string[]` a `Array<string>` znamená totéž, používej co ti vyhovuje.
* U vlastních typů používej raději interface, pokud budeš typ rozšiřovat na více místech.
* `any` používej jen výjimečně – přijdeš o výhody TypeScriptu!
* Čím víc budeš typovat, tím méně chyb později chytíš až při běhu hry.
* Pokud máš dlouhé typy, použij alias nebo interface, zjednodušíš si život.
* Kód si rozděluj na sekce a používej přehledné názvy (pro tebe i ostatní).

---

# Web fonty Google
do **index.html** vložit:
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wwght@700&display=swap" rel="stylesheet">
```
---

## PreloadScene (TypeScript) – čekání na Google Font Loader
V PreloadScene používáme WebFont Loader, aby se fonty skutečně stáhly před zobrazením textů v další scéně.

```ts
// src/game/scenes/PreloadScene.ts

/// <reference path="../../types/webfontloader.d.ts" />

declare global {
  interface Window {
    WebFont: any;
  }
}

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    // 1) Načtení WebFont Loaderu
    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
    );

    // 2) Ostatní assety: obrázky, vlaječky, překlady…
    this.load.image('menu-bg',   'assets/images/menu-background.png');
    this.load.image('flag-cs',   'assets/images/flag-cs.png');
    this.load.image('flag-en',   'assets/images/flag-en.png');
    this.load.image('flag-pl',   'assets/images/flag-pl.png');

    this.load.json('locale-cs',  'assets/locales/cs.json');
    this.load.json('locale-en',  'assets/locales/en.json');
    this.load.json('locale-pl',  'assets/locales/pl.json');
  }

  create(): void {
    // 3) Počkáme na načtení fontu a až poté spustíme MainMenu
    window.WebFont.load({
      google: { families: ['Roboto:700'] },
      active: () => {
        // (volitelně) barva pozadí během čekání
        this.cameras.main.setBackgroundColor('#000000');
        // start next scene až fonty jsou načtené
        this.scene.start('MainMenu');
      }
    });
  }
}
```
---

**Klíčové body**
this.load.script() – stáhne externí knihovnu WebFont Loader.
declare global { interface Window { WebFont: any } } – dává TS vědět o existenci window.WebFont.
window.WebFont.load({ …, active: () => { … } }) – callback active se vykoná, až jsou fonty k dispozici.
this.scene.start('MainMenu') se volá až v active, takže v MainMenu už můžete bezpečně používat Google Fonts