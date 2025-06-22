**mode:** 'code-review'
importantFiles:
 - [constanty.ts](../../config/constants.ts)
 - [intro.ts](../../game/scenes/Intro.ts)
 - [game.ts](../../game/scenes/Game.ts)
 - [quiz.ts](../../utils/quiz.ts)
 - [dialogManager.ts](../../utils/DialogManager.ts)
 - [responsiveManager.ts](../../utils/ResponsiveManager.ts)
 - [quiz.ts](../../utils/quiz.ts)
 - assets/locales/cs.json

---
# Game Code Review Prompt
- Ladící informace console.log() navrhuj jen pro DEBUG_MODE
- Kontroluj konzistenci dat a kódu
//- Zkontroluj, zda jsou všechny funkce správně implementovány
- Zkontroluj, zda jsou všechny proměnné správně pojmenovány a používány
//- Zkontroluj, zda jsou všechny třídy a moduly správně strukturovány
- Pokud navrhuješ patch, upozorni, zda je změna ověřená v kontextu všech důležitých souborů.
---
# Task: Review the code for a game project
<!--
// Pokud bude prompt obsahovat jasné a konkrétní požadavky (například: všechny texty musí být lokalizované, žádné hardcoded texty, používat konkrétní assety pro background, správné škálování podle okna, animace souřadnic, atd.), dokážu na něj navázat i bez znalosti historie chatu.
// Doporučení pro prompt do budoucna:

// Specifikuj přesně, co je povinné: lokalizace, assety, názvy scén, pravidla pro responsivitu, logiku vyhodnocení, atd.
// Uveď příklady správného i špatného řešení (např. jak má vypadat lokalizovaný text vs. hardcoded).
// Popiš, jak mají vypadat klíčové scény (GameOver, Intro, atd.) – co je na pozadí, jaké prvky musí být vždy přítomné.
// Zmiň, že assety jako „pergamen_bkg“ a „Pergamen“ nejsou zaměnitelné.
// Pokud je důležitý styl nebo UX detail (např. animace souřadnic prstem), napiš to explicitně.
// Uveď, že všechny návrhy patchů musí být ověřeny v kontextu všech důležitých souborů.
//vytvářené konstanty v rámci projektu udržuj v constants.ts se stručným popisem, k čemu slouží
//u textů navrhuj vytvoření local verzí
//Projdi kod zda ti dává smysl, zda jsou všechny funkce správně implementovány a zda jsou všechny proměnné správně pojmenovány a používány a máš přístupné odkazované zdroje kodu.
//Zaměř se na viditelnost a nepřístupnost/přístupnost drag and drop odpadků, které jsou v zobrazení v Game.ts
-->
# Game Code Review Checklist
- **úkol:**
- [] Oprava logiky hry, kde po zobrazení volby opakovat hru lze stále odpadky hybat a spouští se kvíz
- [] Po posledním dialogu moniny, nechat ji alespoň 1 sekundu na obrazovce, aby si hráč mohl přečíst text 
- [] Dodržuj čistý kod a strukturu, aby bylo možné snadno rozšířit hru o další funkce
- [] V game.ts je hlavní herní smyčka, která řídí průběh hry a interakce s uživatelským rozhraním
- [] Jestliže existuje záznam v local.storage, zobrazí se přímo GameOver scéna
- [] Po dokončení a vyhodnocení chybně odehrané hry se má použít dialog z dialog manažeru doplněný o text zda opakovat hru použiji příklad struktury (cs.json)
- [] V dialog boxu implementuj tlačítko pro opakování hry, které spustí znovu hru a resetuje všechny potřebné proměnné
- [] Dodržuj responzivní design, aby hra fungovala na různých zařízeních
- [] V případě kladného vyhodnocení se má vytvořit a uložit informace do local.storage
- [] V případě kladného vyhodnocení se má na scénu přidat klikací obrázek "pergamen" s odkazem na scenu "GameOver"