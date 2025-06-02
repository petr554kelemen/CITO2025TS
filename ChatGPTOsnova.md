Cíl:
Pracujeme na hře v Phaser 3 (Virtuální CITO) s více scénami, kde hlavní postava (motýl) přelétá mezi body a u každého bodu zobrazuje dialog (bublinu) – buď monolog, nebo později i dialog s další postavou.

Aktuální problém:
Při animaci motýla (Tween přelétání mezi body) se má nad motýlem zobrazit dialogová bublina.
Problémy jsou:

Bublina se někdy nezobrazí správně nad motýlem, nebo zůstane na špatném místě.

V určitých situacích (např. motýl už neexistuje) vzniká chyba „Cannot read property 'displayWidth' of undefined“.

Sekvence dialogů občas nedojede do konce (přeskočí některé kroky).

Architektura:

Motýl a bublina NEJSOU ve společném containeru (bublina je zvlášť, motýl zvlášť ve scéně).

Bublina (bubbleContainer) má být přiřazena k motýlovi a v update() scéně by měla sledovat jeho pozici.

Při ztrátě motýla (např. byl zničen) má být bublina skrytá/zničená.

Požadavek:

Jak zajistit, aby bublina vždy sledovala motýla a nikdy nezůstala viset, když motýl zmizí?

Jak bezpečně mazat bublinu bez rizika zničení motýla?

Jak synchronizovat dialogy s animací motýla, aby sekvence vždy proběhla správně a bublina byla vždy na správném místě?

Ostatní poznámky:

V JSONu jsou dialogy stromově, používají se klíče jako dialogSequence.motyl-00.

DialogManager zajišťuje zobrazování bublin a má ochranu proti volání na neexistující objekt.

Chci pokračovat ve „slabikářovém stylu“ – čisté, robustní řešení a co nejvíc pochopit princip.


Doporučil jsi přechod na git (namísto kopírování nových verzí do projektu) a používáme git na odkaze: 
https://github.com/petr554kelemen/CITO2025TS.git (public)

Vysvětlovat „proč“ u každé změny, ne jen ukázat příklad.
Shrnutí na konci: klíčové body, co si zkopírovat popřípadě vložit do slabikáře TS (pracovně to nazýváme spíš BIBLE, co je rozsahu týče).

Pozn z předešlých sezení:
- Repozitář na GitHubu platí a aktuální práce jede nad ním.
- Hlavní jazyk hry se určuje v MainMenu, texty předáváš při startu scény.
- Všechny jazykové soubory jsou v cache pod klíči lang-cs, lang-en, atd.
- Všechny scény, které potřebují texty, si je berou z parametru { texts, language }.
- DialogManager přijímá v konstruktoru vždy scene a texts (celý objekt s texty).
- Klíče v JSONu i v kódu jsou v jednotném stylu (např. dialogSequence.motyl-00).
- Všechny změny commitujete a pushujete na GitHub.
- Chcete jasné, konkrétní bloky kódu rovnou pro své konkrétní soubory, žádné obecné „možná tam bude tohle…“
- Chcete jasné komentáře, proč je změna taková, ne jen „dej tam tenhle řádek“.
- Jsem začátečník v TS a Phaseru, takže komentáře budou detailní.