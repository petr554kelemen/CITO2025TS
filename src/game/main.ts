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
        mode: Phaser.Scale.FIT,                   // + přizpůsobí obsah oknu při změně rozměrů
        autoCenter: Phaser.Scale.CENTER_BOTH,     // + vycentruje hru horizontálně i vertikálně
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
    ],
    //physics: "Arcade",
};

const StartGame = (parent: string) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
