/**
 * Zlatý řez / pravidlo třetin overlay helper pro Phaser 3
 * @param {Phaser.Scene} scene - scénová instance, na kterou se overlay přidá
 * @param {Object} options
 * @param {boolean} options.thirds - zobrazit pravidlo třetin (výchozí: true)
 * @param {boolean} options.golden - zobrazit zlatý řez (výchozí: false)
 * @param {number} options.color - hex barva bodů/čar (výchozí: 0xffffff)
 * @returns {Phaser.GameObjects.Graphics} - vrací Graphics objekt, lze jej později destroy() pro odstranění overlay
 */
export function addGuides(scene, {
    thirds = true,
    golden = false,
    color = 0xffffff
} = {}) {
    const { width, height } = scene.scale;

    // připravíme Graphics pro vykreslení overlay
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, color, 0.8);

    const points = [];

    // body podle pravidla třetin
    if (thirds) {
        const tx1 = width / 3;
        const tx2 = 2 * width / 3;
        const ty1 = height / 3;
        const ty2 = 2 * height / 3;
        [tx1, tx2].forEach(x => [ty1, ty2].forEach(y => points.push({ x, y })));
    }

    // body podle zlatého řezu
    if (golden) {
        const phi = (1 + Math.sqrt(5)) / 2; // zlatý poměr
        const gx = width / phi;
        const gx2 = width - gx;
        const gy = height / phi;
        const gy2 = height - gy;
        [gx, gx2].forEach(x => [gy, gy2].forEach(y => points.push({ x, y })));
    }

    // vykreslíme malé křížky na každém bodě
    points.forEach(pt => {
        // vodorovný úsek křížku
        graphics.moveTo(pt.x - 5, pt.y);
        graphics.lineTo(pt.x + 5, pt.y);
        // svislý úsek křížku
        graphics.moveTo(pt.x, pt.y - 5);
        graphics.lineTo(pt.x, pt.y + 5);
    });

    graphics.strokePath();
    return graphics;
}
