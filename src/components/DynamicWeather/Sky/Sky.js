import { getSkyGradientColors, hexToRgb } from '../../../utils/skyColorsCalUtils';

class Sky {
    constructor(canvas, context, hour) {
        this.canvas = canvas;
        this.context = context;
        this.hour = hour;
    }

    updateHour(hour) {
        this.hour = hour;
    }

    getBackgroundGradient(hour) {
        // Use shared utility function for gradient colors
        const colors = getSkyGradientColors(hour);

        // Convert hex to rgb format for canvas gradient
        const rgbTop = hexToRgb(colors.topColor);
        const rgbBottom = hexToRgb(colors.bottomColor);
        const rgbMid = colors.midColor ? hexToRgb(colors.midColor) : null;

        return {
            topColor: `rgb(${rgbTop.r}, ${rgbTop.g}, ${rgbTop.b})`,
            bottomColor: `rgb(${rgbBottom.r}, ${rgbBottom.g}, ${rgbBottom.b})`,
            midColor: rgbMid ? `rgb(${rgbMid.r}, ${rgbMid.g}, ${rgbMid.b})` : null,
            useMidColor: colors.useMidColor,
        };
    }

    draw() {
        const { topColor, midColor, bottomColor, useMidColor } = this.getBackgroundGradient(this.hour);

        const gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);

        if (useMidColor && midColor) {
            // Three-color gradient for sunrise/sunset
            gradient.addColorStop(0, topColor);
            gradient.addColorStop(0.5, midColor);
            gradient.addColorStop(1, bottomColor);
        } else {
            // Two-color gradient for day/night (always use gradient even if colors are similar)
            gradient.addColorStop(0, topColor);
            gradient.addColorStop(1, bottomColor);
        }

        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        return true;
    }
}

export default Sky;

