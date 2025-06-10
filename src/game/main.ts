import Boot from './scenes/Boot';
import GameOver from './scenes/GameOver';
import MainGame from './scenes/Game';
import Intro from './scenes/Intro';
import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import MainMenu from './scenes/MainMenu';

const StartGame = (parent: string) => {
    // Nastavíme DEBUG_MODE pro ladění
    (window as any).DEBUG_MODE = true;
    
    // Základní konfigurace hry
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 667,
        height: 375,
        parent,
        backgroundColor: '#028af8',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 667,
            height: 375,
            // Obejití TypeScript kontroly pro nastavení orientace
            ...({"orientation": Phaser.Scale.LANDSCAPE} as any)
        },
        scene: [
            Boot,
            Preloader,
            MainMenu,
            Intro,
            MainGame,
            GameOver
        ]
    };
    
    // Vytvoření instance hry
    const game = new Phaser.Game(config);
    
    // // Přizpůsobení velikosti canvasu pomocí CSS
    // const limitCanvasSize = () => {
    //     const canvas = document.querySelector(`#${parent} canvas`);
    //     if (!canvas) return;
        
    //     // Použijeme CSS proměnné pro dynamické přizpůsobení velikosti
    //     document.documentElement.style.setProperty('--canvas-width', '667px');
    //     document.documentElement.style.setProperty('--canvas-height', '375px');
        
    //     // Pro jistotu explicitně nastavíme velikost samotného canvasu
    //     (canvas as HTMLCanvasElement).style.width = 'var(--canvas-width)';
    //     (canvas as HTMLCanvasElement).style.height = 'var(--canvas-height)';
        
    //     // Obnovíme scale manager
    //     game.scale.refresh();
    // };
     
    // Funkce pro kontrolu orientace zařízení
    const checkOrientation = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        let orientationMessage = document.getElementById('orientation-message');
        
        if (isPortrait) {
            // Jsme v portrait módu, zobraz výzvu k otočení
            if (!orientationMessage) {
                // Vytvoření elementu pro výzvu k otočení
                orientationMessage = document.createElement('div');
                orientationMessage.id = 'orientation-message';
                orientationMessage.style.position = 'fixed';
                orientationMessage.style.top = '0';
                orientationMessage.style.left = '0';
                orientationMessage.style.width = '100%';
                orientationMessage.style.height = '100%';
                orientationMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                orientationMessage.style.zIndex = '1000';
                orientationMessage.style.display = 'flex';
                orientationMessage.style.flexDirection = 'column';
                orientationMessage.style.justifyContent = 'center';
                orientationMessage.style.alignItems = 'center';
                orientationMessage.style.color = 'white';
                orientationMessage.style.fontFamily = 'Arial, sans-serif';
                orientationMessage.style.fontSize = '20px';
                
                // Ikona rotace
                const rotateIcon = document.createElement('div');
                rotateIcon.innerHTML = '↻';
                rotateIcon.style.fontSize = '64px';
                rotateIcon.style.marginBottom = '20px';
                rotateIcon.style.animation = 'rotate 1.5s infinite linear';
                
                // Přidání animace rotace
                const style = document.createElement('style');
                style.innerHTML = '@keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(90deg); } }';
                document.head.appendChild(style);
                
                // Text výzvy
                const text = document.createElement('div');
                text.textContent = 'Otočte zařízení do režimu na šířku';
                
                // Sestavení elementu
                orientationMessage.appendChild(rotateIcon);
                orientationMessage.appendChild(text);
                document.body.appendChild(orientationMessage);
            } else {
                // Element již existuje, jen ho zobrazíme
                orientationMessage.style.display = 'flex';
            }
            
            // Skryjeme hru
            const gameContainer = document.getElementById(parent);
            if (gameContainer) {
                gameContainer.style.display = 'none';
            }
        } else {
            // Jsme v landscape módu, skryjeme výzvu
            if (orientationMessage) {
                orientationMessage.style.display = 'none';
            }
            
            // Zobrazíme hru
            const gameContainer = document.getElementById(parent);
            if (gameContainer) {
                gameContainer.style.display = 'block';
            }
        }
    };
    
    // Spustíme kontrolu orientace při načtení a při změnách
    checkOrientation();
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 200);
    });
    window.addEventListener('resize', checkOrientation);
    
    return game;
}

export default StartGame;
