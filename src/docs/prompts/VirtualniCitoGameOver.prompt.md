mode: 'code-review'
---
importantFiles:
  - [constants.ts](../../config/constants.ts)
  - [GameOver.ts](../../game/scenes/GameOver.ts)
  - [DialogManager.ts](../../../src/utils/DialogManager.ts)
  - [ResponsiveManager.ts](../../../src/utils/ResponsiveManager.ts)
  - [localization.json](../../../public/assets/locales/cs.json)
---
## Checklist pro GameOver scénu

 - [x] Použít background `pergamen_bkg` a správně ho škálovat
 - [x] Souřadnice jsou jako constanty v `constants.ts`
 - [x] Všechny texty jsou lokalizované (žádný hardcoded text)
 - [x] Souřadnice se zobrazují postupně pohybem prstu/myši
 - [x] Použít font vhodný pro čísla ('Kings' nebo jiný monospace)
 - [x] Zobrazit symbol „prst“ jako nápovědu
 - [x] Přidat klikací text pro restart hry (lokalizované)
 - [ ] Ověřit správné ukládání a reset localStorage
 - [ ] Otestovat responsivitu na mobilu i desktopu
 - [ ] Ověřit, že se GameOver scéna spustí po úspěšné hře
 - [ ] Používat jen vlastnosti a funkce, které nevyžadují webGL
 - [ ] Ověřit, restart hry od začátku (reset všech proměnných)
---

# GameOver Prompt

## Obecná pravidla
- **Ladící výpisy** (`console.log`) používej pouze v DEBUG_MODE.
- **Styl kódování:**
    - **private proměnné a funkce:** malá písmena
    - **konstanty:** VELKÁ_PÍSMENA
    - **třídy:** PascalCase
    - **proměnné a funkce:** camelCase
- **Všechny texty musí být lokalizované** (žádné hardcoded texty, používej lokalizační JSON).
- **Assety:** používej správné obrázky pro background a vizuální prvky (např. `pergamen_bkg` pro GameOver).
- **Responzivita:** škáluj podle okna, používej ResponsiveManager.
- **Animace souřadnic:** souřadnice se zobrazují postupně pohybem prstu/myši, použij vhodný font (monospace nebo jiný, který nedeformuje čísla).
- **Pojmenování:** kontroluj správné názvy proměnných a jejich použití.
- **Patch:** vždy uveď, zda je změna ověřena v kontextu všech důležitých souborů.
- **Vytvořit nebo zkontrolovat zda existují konstanty** pro souřadnice a další důležité hodnoty pro scénu v `constants.ts`.

---

## Herní logika a flow aktivní scény GameOver
- **GameOver scéna**: spouští se po úspěšném dokončení sběru odpadků a kvízu.
- **Možnost restartu hry**: klikací text pro opakování hry, resetuje všechny proměnné a spouští hru znovu.
- **Zobrazení souřadnic**: postupné odhalování souřadnic pomocí pohybu prstu/myši, použij text `"???\n???"` jako nápovědu před zobrazováním souřadnic.
<!--
- **Monolog Moniny**: začíná scénu, texty z lokalizace (cs, en, pl), lze přeskočit kliknutím.
- **Po monologu**: spustí se časovač a quiz (Quiz.ts).
- **Quiz.ts**: spravuje otázky a odpovědi, vyhodnocuje správnost.
- **DialogManager.ts**: spravuje dialogy a jejich zobrazení.
- **ResponsiveManager.ts**: zajišťuje responzivní chování hry.
- **Drag & drop odpadků**: při tahu je aktivní jen jeden, ostatní jsou neaktivní.
- **Po odpovědi**: vyhodnocení, aktualizace scoreboardu, zpřístupnění odpadků, přechod na další otázku.
-->
---

## GameOver scéna - aktivní
- **Pokud existuje záznam v localStorage**, zobrazí se rovnou GameOver scéna.
- **Po úspěšné hře**: ulož do localStorage záznam o úspěchu.
- **GameOver background**: použij rozmotaný pergamen (`pergamen_bkg`), přizpůsob velikosti okna.
- **Souřadnice**: zobrazuj pomalu a postupně pohybem prstu/myši, použij font vhodný pro čísla (např. monospace).
- **Symbol „prst“**: použij jako nápovědu pro odhalování souřadnic.
- **Možnost opakování hry**: klikací text pro restart, které resetuje všechny potřebné proměnné a spustí hru znovu.

---

## Příklady správného řešení

```typescript
// Lokalizovaný text
this.add.text(x, y, this.texts.gameOver?.playAgain ?? "Zahrát znovu", ...);

// Použití pergamenu se správným škálováním
import { PERGAMEN_BKG } from '../../config/constants';
const scaleFactor = (this as any).responsive?.getScaleFactor?.(667, 375, 'max') ?? 1;

const pergamen = this.add.image(
    this.scale.width / 2,
    this.scale.height / 2,
    "pergamen_bkg"
)
.setOrigin(0.5)
.setScale(scaleFactor);

// Animace souřadnic prstem
this.input.on("pointermove", (pointer) => {
    // postupné odhalování souřadnic podle pohybu prstu
});
```