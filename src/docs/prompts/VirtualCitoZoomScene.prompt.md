
mode: 'code-review'
---
importantFiles:  
- [zoomScene.ts](../../../src/utils/ZoomScene.ts)
- [constants.ts](../../config/constants.ts)
- [responsiveManager.ts](../../../src/utils/ResponsiveManager.ts)

---
# Zoomování scén ve hře

## Cíl
Vvtvořit kod pro existující hru, která by měla běžet převážně na MT (android, iOS) a zobrazení
omezují rozměry webového prohlížeče, zmenšené o systémovou lištu a ošetřit tím skrytí části herní scény, kde se původně fullscreen režit zapínal.
Tento kód bude sloužit jako testovací verze pro přepínání mezi fullscreen režimem a zoomováním ve hře.
Testovací verzi vytváříme v oddělené scéně `FullscreenZoomTestScene`, která bude testovat možnost přepínat mezi fullscreen režimem a zoomováním.
Po odladění bude kód přenesen do hlavní scény hry. 

## Instrukce
- **Ladící výpisy** (`console.log`) používej pouze v DEBUG_MODE.
- **Styl kódování:**
    - **private proměnné a funkce:** malá písmena
    - **konstanty:** VELKÁ_PÍSMENA
    - **třídy:** PascalCase
    - **proměnné a funkce:** camelCase
- Navrhuj kod pro Phaser 3 .
- Navrhovaný kod formou Patche v TS, doplňuj komentáři pro začátečníka
- Kód by měl být jednoduchý a snadno pochopitelný.
- Kód by měl být snadno přenositelný do hlavní scény hry
- Kód by měl umožnit uživateli přepnout mezi fullscreen režimem a zoomováním.

## Vstupy
- Uživatel buď aktivuje fullscreen režim (je- li k dispozici), nebo zvolí zoomování.

## Výstupy
- Popište, jaký výstup očekáváte
- Výstupní formát odpovídá pravidlům pro čistý kod.
- Testovací obrazec tvoří 3 vodorovné pruhy, které rozdělí obrazovku na tři třetiny, aby se dalo snáze sledovat chování na různých zařízeních.
- Delší celky rozdělte do samostatných funkcí, které budou mít jasně definované vstupy a výstupy.

## Příklady
### Příklad 1
**Vstup:**  
btn pro fullscreen režim, btn pro zoomování

**Očekávaný výstup:**  
- testovací obrazec s 3 vodorovnými pruhy
- btn pro fullscreen režim v horní části obrazovky (možnost emotionů)
- btn pro zoomování v horní části obrazovky (možnost emotionů)

---
