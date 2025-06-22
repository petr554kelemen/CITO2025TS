/**
 * UI – centrální konfigurace vzhledu a rozměrů pro celou hru.
 */
export const UI = {
    SCOREBOARD: {
        LEFT_MARGIN: 15, // Vzdálenost scoreboardu od levého okraje obrazovky (px)
        ICON_SCALE: 0.32, // Výchozí scale pro ikony pytlů
        ICON_SCALE_CORRECT: 0.5, // Scale pro správně označený pytel
        ICON_SIZE: 36, // Velikost ikony pytle (px)
        TIMER_FONT_SIZE: 28, // Velikost fontu časovače (px)
        BOX_BG_COLOR: 0x222222, // Barva pozadí scoreboardu (hex)
        BOX_BG_ALPHA: 0.8, // Průhlednost pozadí scoreboardu (0–1)
        TIMER_COLOR: '#f8f8f8' // Barva textu časovače
    },
    MONINA: {
        POS_X: 100, // Výchozí X pozice Moniny
        POS_Y: 250, // Výchozí Y pozice Moniny
        SCALE: 0.6 // Výchozí scale pro postavu Moniny
    },
    PYTEL: {
        SCALE: 0.22 // jednotná velikost pytle pro všechny scény
    },
    LOGO: {
        SCALE: 0.0012 // Násobek min(gameWidth, gameHeight) pro logo CITO
    },
    QUIZ: {
        QUESTION_FONT: 22, // Velikost fontu otázky v kvízu (px)
        OPTION_FONT: 20, // Velikost fontu možností v kvízu (px)
        HINT_FONT: 20, // Velikost fontu nápovědy v kvízu (px)
        OPTION_PADDING: { left: 12, right: 12, top: 6, bottom: 6 }, // Padding pro tlačítka možností
        HINT_PADDING: { left: 10, right: 10, top: 4, bottom: 4 } // Padding pro tlačítko nápovědy
    },
    COLORS: {
        CORRECT: '#a5d6a7', // Barva pro správnou odpověď
        WRONG: '#ffcdd2', // Barva pro špatnou odpověď
        HOVER: '#b3e5fc', // Barva při najetí myší
        DEFAULT: '#e0e0e0', // Výchozí barva tlačítek
        QUESTION: '#2e7d32', // Barva textu otázky
        HINT: '#1565c0', // Barva textu nápovědy
        HINT_BG: '#e3f2fd' // Barva pozadí nápovědy
    }
};

export const DESIGN = {
    WIDTH: 667,
    HEIGHT: 375
};
// N 50° 10.391 E 017° 36.226
export const COORDINATE = {
    N: "N 50° 10.391",
    E: "E 017° 36.226",
    FONT_FAMILY: 'Kings, monospace',
    FONT_SIZE: 72, // px
    FILL: 0x1976d2 // Barva textu souřadnic
};

export const DEBUG_MODE = false; // nastav na true jen při ladění