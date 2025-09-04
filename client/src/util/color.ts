export function hexToRgb(hex: string) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

export function componentToHex(c: number) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function rgbaToHex(r: number, g: number, b: number, a: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
}

export function sanitizeColor(color: string) {
    let {r, g, b} = hexToRgb(color);
    return rgbToHex(r, g, b);
}

export function categoryToCssRgb(str: string) {
    // Create a hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate RGB values
    let r = (hash >> 16) & 255; // Extract red
    let g = (hash >> 8) & 255;  // Extract green
    let b = hash & 255;         // Extract blue


    // Adjust brightness to keep colors from being too dark
    let adjust = (val: number) => Math.floor(50 + (val % 206)); // Keep in range [100, 255]

    // HEX
    return `#${componentToHex(adjust(r))}${componentToHex(adjust(g))}${componentToHex(adjust(b))}`;
}

const FILL_OPACITY = 50;
const BORDER_DARKNESS_MODIFIER = 25;

export function getChartColors(color: string): { fillColor: string, borderColor: string } {
    let {r, g, b} = hexToRgb(color);
    return {
        fillColor: rgbaToHex(r, g, b, FILL_OPACITY),
        borderColor: rgbaToHex(
            r - BORDER_DARKNESS_MODIFIER,
            g - BORDER_DARKNESS_MODIFIER,
            b - BORDER_DARKNESS_MODIFIER,
            255),
    }
}
