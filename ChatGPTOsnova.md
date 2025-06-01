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
Úlohy: načítání dialogů v 3 jazycích, správa scén (Boot, Preloader, MainMenu, Intro, atd.).

4. Struktura souborů

Doporučil jsi přechod na git (namísto kopírování nových verzí do projektu) a používáme git na odkaze: 
https://github.com/petr554kelemen/CITO2025TS.git

5. Načítání JSON lokalizací

Klíče v Preloader: this.load.json('lang-cs', 'assets/locales/cs.json'); (a obdobně pro en, pl).
V DialogManager: this.scene.cache.json.get('lang-cs') – musí se shodovat názvy.
Nepoužívat jako proměnnou locale v intro.ts (záměna s jinou třídou nebo funkcí, dochází k chybám při překladu)

6. Pravidla pro klíče a strukturu JSON

Objekt v JSON bude mít klíč dialogSequence (správně psané).
Příklad klíčů: duch-01, motyl-01 (konzistentně v kódu i JSON).

7. Vytváření instancí DialogManageru

Konstruktor: new DialogManager(this, lang) – vždy předat lang z nastavení json v cache.

8. Kontrola běžných chyb

Nesoulad jmenných konvencí (čeština vs angličtina).

9. Styl komunikace další fázi

Vysvětlovat „proč“ u každé změny, ne jen ukázat příklad.
Shrnutí na konci: klíčové body, co si zkopírovat popřípadě vložit do slabikáře TS (pracovně to nazýváme spíš BIBLE, co je rozsahu týče).

10. Místo pro tvé doplňky
- Repozitář na GitHubu platí a aktuální práce jede nad ním.
- Hlavní jazyk hry se určuje v MainMenu, texty předáváš při startu scény.
- Všechny jazykové soubory jsou v cache pod klíči lang-cs, lang-en, atd.
- Všechny scény, které potřebují texty, si je berou z parametru { texts, language }.
- DialogManager přijímá v konstruktoru vždy scene a texts (celý objekt s texty).
- Klíče v JSONu i v kódu jsou v jednotném stylu (např. dialogSequence.motyl-00).
- Všechny změny commitujete a pushujete na GitHub.
- Chcete jasné, konkrétní bloky kódu rovnou pro své konkrétní soubory, žádné obecné „možná tam bude tohle…“
- Chcete jasné komentáře, proč je změna taková, ne jen „dej tam tenhle řádek“.
- Jsi začátečník v TS a Phaseru, takže komentáře budou detailní.

Odkaz do repozitáře na Intro.ts: src/game/scenes/Intro.ts
kde první monolog by měl mít motýl v json jako motyl-00.

Poté se dostaneme k sekvenci (dialog motyl-01 až motyl-03 a duch-01 až duch-03), aby čas na přečtení dialogu byl dostatečně dlouhý a mezi dialogem by mohla být krátká prodledva 800-1000 ms.
Připrav přesný blok, jak vytvořit DialogManager, jak z něj zobrazit dialog, jak spustit sekvenci.

Až to společně rozjedeme, budu zkoušet dál rozšiřovat dialogy podle své představivosti!

Opět bych prosil přístup pro začínajícího programátora v TS.