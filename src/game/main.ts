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
    width: 1024,
    height: 760,
    scale: {
        //mode: Phaser.Scale.FIT,                    // Zachová poměr stran
        // nebo použij:
        mode: Phaser.Scale.RESIZE,              // Roztáhne na celou obrazovku
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,                  // Dynamická šířka
        height: window.innerHeight,                // Dynamická výška
        min: {
            width: 320,                            // Minimální šířka
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
