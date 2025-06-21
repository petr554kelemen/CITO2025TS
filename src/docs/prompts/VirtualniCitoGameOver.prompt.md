mode: 'code-review'
---
importantFiles:
  - [constants.ts](../../config/constants.ts)
  - [GameOver.ts](../../game/scenes/GameOver.ts)
  - [DialogManager.ts](../../../src/utils/DialogManager.ts)
  - [ResponsiveManager.ts](../../../src/utils/ResponsiveManager.ts)
---
## Checklist pro GameOver scénu

 - [x] Použít background `pergamen_bkg` a správně ho škálovat
 - [x] Souřadnice mohou být jako constanty v `constants.ts`
 - [ ] Všechny texty jsou lokalizované (žádný hardcoded text)
 - [ ] Souřadnice se zobrazují postupně pohybem prstu/myši
 - [ ] Použít font vhodný pro čísla (monospace)
 - [ ] Zobrazit symbol „prst“ jako nápovědu
 - [ ] Přidat tlačítko pro restart hry (lokalizované)
 - [ ] Ověřit správné ukládání a reset localStorage
 - [ ] Otestovat responsivitu na mobilu i desktopu

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

## Herní logika a flow

- **Monolog Moniny**: začíná scénu, texty z lokalizace (cs, en, pl), lze přeskočit kliknutím.
- **Po monologu**: spustí se časovač a quiz (Quiz.ts).
- **Quiz.ts**: spravuje otázky a odpovědi, vyhodnocuje správnost.
- **DialogManager.ts**: spravuje dialogy a jejich zobrazení.
- **ResponsiveManager.ts**: zajišťuje responzivní chování hry.
- **Drag & drop odpadků**: při tahu je aktivní jen jeden, ostatní jsou neaktivní.
- **Po odpovědi**: vyhodnocení, aktualizace scoreboardu, zpřístupnění odpadků, přechod na další otázku.

---

# GameOver scéna - aktivní
- **Pokud existuje záznam v localStorage**, zobrazí se rovnou GameOver scéna.
- **Po úspěšné hře**: ulož do localStorage záznam o úspěchu.
- **GameOver background**: použij rozmotaný pergamen (`pergamen_bkg`), přizpůsob velikosti okna.
- **Souřadnice**: zobrazuj pomalu a postupně pohybem prstu/myši, použij font vhodný pro čísla (např. monospace).
- **Symbol „prst“**: použij jako nápovědu pro odhalování souřadnic.
- **Možnost opakování hry**: tlačítko pro restart, které resetuje všechny potřebné proměnné a spustí hru znovu.

---

## Příklady správného řešení

```typescript
// Lokalizovaný text
this.add.text(x, y, this.texts.gameOver?.playAgain ?? "Zahrát znovu", ...);

// Background GameOver
this.add.image(width / 2, height / 2, "pergamen_bkg")
    .setDisplaySize(width, height);

// Animace souřadnic prstem
this.input.on("pointermove", (pointer) => {
    // postupné odhalování souřadnic podle pohybu prstu
});
```