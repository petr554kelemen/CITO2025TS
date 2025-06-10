import Phaser from 'phaser';

/**
 * Typy layoutů pro rozlišení mezi mobilním a desktopovým zobrazením
 */
export enum LayoutType {
    MOBILE = 'mobile',
    DESKTOP = 'desktop'
}

/**
 * Orientace zařízení
 */
export enum Orientation {
    PORTRAIT = 'portrait',
    LANDSCAPE = 'landscape'
}

/**
 * Typy zařízení pro detailnější rozlišení
 */
export enum DeviceType {
    MOBILE = 'mobile',
    TABLET = 'tablet',
    DESKTOP = 'desktop'
}

/**
 * Třída pro správu responzivního chování ve hrách Phaser
 */
export default class ResponsiveManager {
    private scene: Phaser.Scene;
    private currentLayout: LayoutType;
    private currentOrientation: Orientation;
    private mobileBreakpoint: number;
    private isInitialized: boolean = false;
    private listeners: { [key: string]: Function[] } = {
        'layoutchange': [],
        'orientationchange': []
    };

    /**
     * Vytvoří novou instanci ResponsiveManager
     * @param scene Phaser scéna, která bude spravována
     * @param mobileBreakpoint Šířka v pixelech, pod kterou se považuje zařízení za mobilní
     */
    constructor(scene: Phaser.Scene, mobileBreakpoint: number = 700) {
        this.scene = scene;
        this.mobileBreakpoint = mobileBreakpoint;
        this.currentLayout = this.detectCurrentLayout();
        this.currentOrientation = this.detectCurrentOrientation();
        
        // Přidání listenerů na změnu velikosti a orientace
        this.scene.scale.on('resize', this.handleResize, this);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        this.isInitialized = true;
    }

    /**
     * Inicializuje responzivní chování a vrací aktuální layout
     * @returns Aktuální typ layoutu
     */
    public initialize(): LayoutType {
        return this.currentLayout;
    }

    /**
     * Zjišťuje, zda je zařízení mobilní
     * @returns true, pokud je zařízení mobilní
     */
    public isMobile(): boolean {
        return this.currentLayout === LayoutType.MOBILE;
    }

    /**
     * Zjišťuje, zda je zařízení v landscape módu
     * @returns true, pokud je zařízení v landscape módu
     */
    public isLandscape(): boolean {
        return this.currentOrientation === Orientation.LANDSCAPE;
    }

    /**
     * Přidá event listener na událost změny layoutu nebo orientace
     * @param event Typ události ('layoutchange' nebo 'orientationchange')
     * @param callback Funkce, která se má zavolat při události
     */
    public on(event: string, callback: Function): void {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Odebere event listener
     * @param event Typ události
     * @param callback Funkce, která se má odebrat
     */
    public off(event: string, callback: Function): void {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Detekuje aktuální typ layoutu na základě velikosti okna
     * @returns Typ layoutu (MOBILE nebo DESKTOP)
     */
    private detectCurrentLayout(): LayoutType {
        const deviceType = this.getDeviceType();
        if (deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET) {
            return LayoutType.MOBILE;
        }
        return LayoutType.DESKTOP;
    }

    /**
     * Detekuje aktuální orientaci zařízení
     * @returns Orientace zařízení (PORTRAIT nebo LANDSCAPE)
     */
    private detectCurrentOrientation(): Orientation {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        return width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    }

    /**
     * Zpracuje událost změny velikosti okna
     */
    private handleResize(gameSize: Phaser.Structs.Size): void {
        if (!this.isInitialized) return; // Nepokračuj, pokud není inicializovaný
        
        const oldLayout = this.currentLayout;
        const oldOrientation = this.currentOrientation;
        
        this.currentLayout = this.detectCurrentLayout();
        this.currentOrientation = this.detectCurrentOrientation();
        
        // Vyvolání událostí, pokud došlo ke změně
        try {
            if (oldLayout !== this.currentLayout) {
                this.listeners['layoutchange'].forEach(callback => {
                    try {
                        callback(this.currentLayout);
                    } catch (e) {
                        console.warn('Chyba v layoutchange callbacku:', e);
                    }
                });
            }
            
            if (oldOrientation !== this.currentOrientation) {
                this.listeners['orientationchange'].forEach(callback => {
                    try {
                        callback(this.currentOrientation);
                    } catch (e) {
                        console.warn('Chyba v orientationchange callbacku:', e);
                    }
                });
            }
        } catch (e) {
            console.warn('Chyba při zpracování resize události:', e);
        }
    }

    /**
     * Zpracuje událost změny orientace zařízení
     */
    private handleOrientationChange(): void {
        if (!this.isInitialized) return;
        
        const oldOrientation = this.currentOrientation;
        this.currentOrientation = this.detectCurrentOrientation();
        
        try {
            if (oldOrientation !== this.currentOrientation) {
                this.listeners['orientationchange'].forEach(callback => {
                    try {
                        callback(this.currentOrientation);
                    } catch (e) {
                        console.warn('Chyba v orientationchange callbacku:', e);
                    }
                });
            }
        } catch (e) {
            console.warn('Chyba při zpracování orientationchange události:', e);
        }
    }

    /**
     * Vrací informace o aktuálním zobrazení pro ladění
     * @returns Debug informace jako řetězec
     */
    public getDebugInfo(): string {
        return `Layout: ${this.currentLayout}, Orientation: ${this.currentOrientation}\nWindow: ${window.innerWidth}x${window.innerHeight}\nPhaser: ${this.scene.scale.width}x${this.scene.scale.height}`;
    }

    /**
     * Přidá debug overlay do scény
     * @param x X pozice textu
     * @param y Y pozice textu
     * @returns Vytvořený text objekt
     */
    public addDebugOverlay(x: number = 10, y: number = 10): Phaser.GameObjects.Text {
        const debugText = this.scene.add.text(x, y, this.getDebugInfo(), {
            font: "16px Arial",
            color: "#fff",
            backgroundColor: "#000a",
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setScrollFactor(0).setDepth(1000);
        
        // Aktualizace debugovacího textu při změnách
        const updateText = () => {
            // Kontrola, zda debugText stále existuje a není zničen
            if (debugText && !debugText.scene) {
                // Text byl zničen, odeber listenery
                this.off('layoutchange', updateText);
                this.off('orientationchange', updateText);
                return;
            }

            try {
                debugText.setText(this.getDebugInfo());
            } catch (error) {
                console.warn('Nepodařilo se aktualizovat debug text:', error);
                // Odstranit listenery, pokud nastala chyba
                this.off('layoutchange', updateText);
                this.off('orientationchange', updateText);
            }
        };
        
        // Přidání listenerů na události změny layoutu
        this.on('layoutchange', updateText);
        this.on('orientationchange', updateText);
        
        // Poslech na zničení scény pro automatické odstranění listenerů
        this.scene.events.once('destroy', () => {
            this.off('layoutchange', updateText);
            this.off('orientationchange', updateText);
        });
        
        return debugText;
    }

    /**
     * Zkontroluje orientaci a požádá o otočení do landscape
     */
    public checkAndForceOrientation(): void {
        // Zkontroluje orientaci a požádá o otočení do landscape
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            // Na iOS zkoušíme otočit pomocí fullscreen API
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if ((elem as any).webkitRequestFullscreen) {
                    (elem as any).webkitRequestFullscreen();
                } else if ((elem as any).msRequestFullscreen) {
                    (elem as any).msRequestFullscreen();
                }
                
                // Zkusíme vynutit landscape orientaci
                if ('orientation' in screen) {
                    (screen.orientation as any).lock('landscape').catch(() => {
                        console.log('Nepodařilo se vynutit landscape orientaci');
                    });
                }
            } catch (e) {
                console.warn('Nepodařilo se vynutit landscape orientaci:', e);
            }
        }
    }

    /**
     * Zjišťuje typ zařízení
     * @returns Typ zařízení (MOBILE, TABLET, DESKTOP)
     */
    public getDeviceType(): DeviceType {
        // Detekce tabletu - kombinace více metod
        const userAgent = navigator.userAgent.toLowerCase();
        const isTabletByUserAgent = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|puffin)/.test(userAgent);
        
        // Detekce na základě velikosti obrazovky (typicky tablety mají alespoň 768px)
        const isTabletBySize = window.innerWidth >= 768 && window.innerWidth <= 1366;
        
        // Detekce na základě poměru stran (tablety často mají poměr stran blíže k 4:3 než telefony)
        const aspectRatio = window.innerWidth / window.innerHeight;
        const isTabletByAspectRatio = aspectRatio >= 0.6 && aspectRatio <= 1.7;
        
        const isTablet = isTabletByUserAgent || (isTabletBySize && isTabletByAspectRatio);
        
        if (isTablet) {
            return DeviceType.TABLET;
        } else if (window.innerWidth < this.mobileBreakpoint) {
            return DeviceType.MOBILE;
        } else {
            return DeviceType.DESKTOP;
        }
    }
}