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
 * Typy zařízení pro rozlišení (jen mobil/desktop)
 */
export enum DeviceType {
    MOBILE = 'mobile',
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

    constructor(scene: Phaser.Scene, mobileBreakpoint: number = 700) {
        this.scene = scene;
        this.mobileBreakpoint = mobileBreakpoint;
        this.currentLayout = this.detectCurrentLayout();
        this.currentOrientation = this.detectCurrentOrientation();
        
        this.scene.scale.on('resize', this.handleResize, this);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        this.isInitialized = true;
    }

    public initialize(): LayoutType {
        return this.currentLayout;
    }

    public isMobile(): boolean {
        return this.currentLayout === LayoutType.MOBILE;
    }

    public isLandscape(): boolean {
        return this.currentOrientation === Orientation.LANDSCAPE;
    }

    public on(event: string, callback: Function): void {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

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
        return deviceType === DeviceType.MOBILE
            ? LayoutType.MOBILE
            : LayoutType.DESKTOP;
    }

    private detectCurrentOrientation(): Orientation {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        return width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        if (!this.isInitialized) return;
        
        const oldLayout = this.currentLayout;
        const oldOrientation = this.currentOrientation;
        
        this.currentLayout = this.detectCurrentLayout();
        this.currentOrientation = this.detectCurrentOrientation();
        
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

    public getDebugInfo(): string {
        return `Layout: ${this.currentLayout}, Orientation: ${this.currentOrientation}\nWindow: ${window.innerWidth}x${window.innerHeight}\nPhaser: ${this.scene.scale.width}x${this.scene.scale.height}`;
    }

    public addDebugOverlay(x: number = 10, y: number = 10): Phaser.GameObjects.Text {
        const debugText = this.scene.add.text(x, y, this.getDebugInfo(), {
            font: "16px Arial",
            color: "#fff",
            backgroundColor: "#000a",
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setScrollFactor(0).setDepth(1000);
        
        const updateText = () => {
            if (debugText && !debugText.scene) {
                this.off('layoutchange', updateText);
                this.off('orientationchange', updateText);
                return;
            }

            try {
                debugText.setText(this.getDebugInfo());
            } catch (error) {
                console.warn('Nepodařilo se aktualizovat debug text:', error);
                this.off('layoutchange', updateText);
                this.off('orientationchange', updateText);
            }
        };
        
        this.on('layoutchange', updateText);
        this.on('orientationchange', updateText);
        this.scene.events.once('destroy', () => {
            this.off('layoutchange', updateText);
            this.off('orientationchange', updateText);
        });
        
        return debugText;
    }

    public checkAndForceOrientation(): void {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if ((elem as any).webkitRequestFullscreen) {
                    (elem as any).webkitRequestFullscreen();
                } else if ((elem as any).msRequestFullscreen) {
                    (elem as any).msRequestFullscreen();
                }
                
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
     * Zjišťuje typ zařízení (pouze mobil/desktop)
     * @returns Typ zařízení (MOBILE, DESKTOP)
     */
    public getDeviceType(): DeviceType {
        return window.innerWidth < this.mobileBreakpoint
            ? DeviceType.MOBILE
            : DeviceType.DESKTOP;
    }
}