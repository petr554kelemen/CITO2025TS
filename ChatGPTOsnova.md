Osnova pro nové chaty

1. Účel souhrnu

Stručně zachytit klíčové body, které jsme probrali (technické detaily, názvy proměnných, struktura JSON, postupy).
Umožnit rychlé vložení do nového chatu jako výchozího bodu.

2. Preference komunikace

Jazyk: čeština.
Tón: přátelský, lidský, vysvětlující krok za krokem.
Úroveň: pro začátečníka v TypeScript a Phaser 3.
Komentování kódu: stručné vysvětlení každého přidaného řádku.

3. Přehled projektu

Engine: Phaser 3 (poslední dokumentace).
Úlohy: načítání dialogů v 3 jazycích, správa scén (Boot, Preloader, Intro, MainMenu, atd.).

4. Struktura souborů

Boot.ts – nastavení základní scény.
Preloader.ts – načtení assetů (obrázky, JSONy).
DialogManager.ts – třída pro správu a vykreslení dialogů.
MainMenu - úvod s výběm jazyka lokalizace (bez dynamického přepínání během hry)
Intro.ts / MainMenu.ts – příklady použití DialogManageru.
Game.ts - scena pro kvíz

5. Načítání JSON lokalizací

Klíče v Preloader: this.load.json('lang-cs', 'assets/locales/cs.json'); (a obdobně pro en, pl).
V DialogManager: this.scene.cache.json.get('lang-cs') – musí se shodovat názvy.
Nepoužívat jako proměnnou locale v intro.ts (záměna s jinou třídou nebo funkcí, dochází k chybám při překladu)

6. Pravidla pro klíče a strukturu JSON

Objekt v JSON musí mít klíč dialogSequence (správně psané).
Příklad klíčů: duch-01, motyl-01 (či přeložené do angličtiny, ale konzistentně v kódu i JSON).
Žádné nesprávné znaky (dvojtečka v klíči apod.).

7. Správné vytváření instancí DialogManageru

Konstruktor: new DialogManager(this, locale) – vždy předat locale z registry nebo z nastavení.

8. Kontrola běžných chyb

Nekonzistentní názvy klíčů mezi Preloader a DialogManager.
Překlepy v JSON (dialogSeqence vs dialogSequence).
Nesoulad jmenných konvencí (čeština vs angličtina).

9. Styl komunikace další fázi

Vysvětlovat „proč“ u každé změny, ne jen ukázat příklad.
Shrnutí na konci: klíčové body, co si zkopírovat popřípadě vložit do slabikáře TS.

10. Místo pro tvé doplňky
*Zde můžeš přidat další specifika nebo připomínky, co bys chtěl mít vždy zahrnuto.*

v DialogManager, jsi mě učil vytvořit dialogy a použít je v sekvenci. Potřeboval bych ukázat možnost, jak
vytvořit dialog jen z předem vybrané položky z .json, pokud nepotřebuji celou sekvenci, a jak takový dialog v kodu volat.
Opět bych prosil přístup pro začínajícího programátora v TS.