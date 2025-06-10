import Boot from './scenes/Boot';
import GameOver from './scenes/GameOver';
import MainGame from './scenes/Game';
import Intro from './scenes/Intro';
import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import MainMenu from './scenes/MainMenu';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 667,
    height: 375,
    scale: {
        mode: Phaser.Scale.FIT,                    // Zachová poměr stran a přizpůsobí velikost
        autoCenter: Phaser.Scale.CENTER_BOTH,     // Vycentruje hru
        width: window.innerWidth,                  // Dynamická šířka
        height: window.innerHeight,                // Dynamická výška
        min: {
            width: 320,                            // Minimální šířka pro mobily
            height: 240                            // Minimální výška
        },
        max: {
            width: 1920,                           // Maximální šířka
            height: 1080                           // Maximální výška
        }
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Intro,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    (window as any).DEBUG_MODE = false;
    return new Phaser.Game({ ...config, parent });

}

export default StartGame;

// Přidej po vytvoření hry
const game = new Phaser.Game(config);

// Přizpůsobení při změně orientace nebo velikosti
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        game.scale.refresh();
    }, 100);
});
