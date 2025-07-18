mode: 'code-review'
importantFiles:
 - ['src/config/constants.ts'](../../../src/config/constants.ts)
 - ['src/game/scenes/MainMenu.ts'](../../../src/game/scenes/MainMenu.ts)
 - ['src/game/scenes/Intro.ts'](../../../src/game/scenes/Intro.ts)
 - ['src/game/scenes/Game.ts'](../../../src/game/scenes/Game.ts)
 - ['src/game/scenes/GameOver.ts'](../../../src/game/scenes/GameOver.ts)
 - ['src/game/scenes/Quiz.ts'](./)
 - ['src/game/quiz/Quiz.ts'](./)
 - 'src/game/utils/DialogManager.ts'
 - 'src/game/utils/ResponsiveManager.ts'
 - 'src/game/utils/quiz.ts'
 - 'assets/locales/cs.json'

Expected output and any relevant constraints for this task.
# Celková kontrola kódu hry
- [x] console.log je používán pouze v režimu DEBUG_MODE
- [x]Ladící informace console.log() navrhuj jen pro DEBUG_MODE
- [x]Kontroluj konzistenci dat a kódu
- [x]Zkontroluj, zda jsou všechny funkce správně implementovány
- [x]Zkontroluj, zda jsou všechny proměnné správně pojmenovány a používány
- [x]Zkontroluj, zda jsou všechny třídy a moduly správně strukturovány
- Pokud navrhuješ patch, upozorni, zda je změna ověřená v kontextu všech důležitých souborů.

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
Dodržuj čistý kod a strukturu, aby bylo možné snadno rozšířit hru o další funkce
V game.ts je hlavní herní smyčka, která řídí průběh hry a interakce s uživatelským rozhraním
Jestliže existuje záznam v local.storage z aktuálního kódu (pozor na existenci stare verze), zobrazí se přímo GameOver scéna
//Po dokončení a vyhodnocení chybně odehrané hry se má použít dialog z dialog manažeru doplněný o text zda opakovat hru použiji příklad struktury (cs.json)
//V dialogu by mělo být tlačítko pro opakování hry, které spustí znovu hru a resetuje všechny potřebné proměnné
Dodržet responzivní design, aby hra fungovala na různých zařízeních
V případě kladného vyhodnocení se má vytvořit a uložit informace do local.storage
V GameOver ponechat možnost opakování hry, která resetuje všechny potřebné proměnné a spustí hru znovu
<!--//V případě kladného vyhodnocení se má na scénu přidat klikací obrázek "pergamen" s odkazem na scenu "GameOver"
//GameOver obsahuje okázkové kodování, které je třeba upravit aby odpovídalo původnímu záměru hry
-->

- [x] implementace CameraControlManager pro Android ve scénách
- [] implementace CameraControlManager pro iOS ve scénách
    - PRIORITA: implementace CameraControlManager pro iOS ve scénách
    - TODO: pro iOS je třeba upravit chování v CameraControlManager, s ohledem na specifika iOS zařízení
    - nastavit pro iOS zobrazení v měřítku camery 80%
    - možnost scrollování scény pro iOS zařízení
- [] Změna info textu ve scénách o horším UX zobrazení na iOS, doporučit PC 


# Description: This prompt is designed to review the code of a game project, focusing on the main game scene, quiz functionality, and dialog management.
- scenu game zacina monolog Moniny (podle DialogManager) a textů v cs, en a pl.json
- moninu umožnit kliknutím předčasně ukončit pro hráče, kteří hrají poněkolikráte a nepotřebují již nápovědný text dialogů
- po monologu se spustí časovač a quiz, který je v Quiz.ts
- v Quiz.ts je implementována logika pro správu otázek a odpovědí
- DialogManager.ts spravuje dialogy a jejich zobrazení
- ResponsiveManager.ts zajišťuje, že hra je responzivní a funguje na různých zařízeních
- při drag and drop odpadku, jsou neaktivní odpadky zobrazeny jako neaktivní
- po odpovědi se vyhodnotí odpověď, nastaví stav v scoreboard, zpřístupní a zviditelní se odpadky, přechod na další otázku
- jestliže existuje záznam v local.storage, zobrazí se přímo GameOver scéna
- pokud je hra úspěšně odehraná, přidá se do local.storage záznam o úspěšné hře
- v GameOver ponechat možnost opakování hry, která resetuje všechny potřebné proměnné a spustí hru znovu
- background GameOver má tvořit rozmotaný pergamen, který se přizpůsobuje zobrazení, hra je určena pro hráče geocachingu, kterým se zobrazí finální souřadnice, pro která je nutné zkontrolovat font takový, aby nedeformoval čísla. Souřadnice by se měly zobrazovat pomalu a postupně přejízděním prstu po obrazovce. K tomu mám připraven symbol "prst" v loaderu.

>Poslední závěr a doporučení z kontroly dle promptu
>Kód odpovídá požadavkům promptu a je připraven pro produkci.
>Všechny klíčové části jsou správně implementovány a dobře komentovány.
>Responzivita, iOS chování, drag & drop logika i dialogy jsou v pořádku.
>Restart hry a ukládání výsledků do localStorage funguje dle zadání.
>Všechny změny a návrhy jsou ověřeny v kontextu všech důležitých souborů.