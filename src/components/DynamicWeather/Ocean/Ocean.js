import { getSkyGradientColors, hexToRgb } from '../../../utils/skyColorsCalUtils';

class Ocean {
    // Ocean height as percentage of canvas height
    static OCEAN_HEIGHT_PERCENTAGE = 0.2; // 40%

    constructor(canvas, context, hour, skyGradientParams = null) {
        this.canvas = canvas;
        this.context = context;
        this.hour = hour;
        this.skyGradientParams = skyGradientParams;

        // Ocean takes up bottom portion of canvas
        this.oceanHeight = 0;
        this.y = 0;
        // updateDimensions() will generate dashes, so no need to call it separately
        this.updateDimensions();
    }

    generateDashes() {
        const dashes = [];
        const dashCount = 20; // Number of horizontal dashes

        for (let i = 0; i < dashCount; i++) {
            dashes.push({
                x: Math.random() * this.canvas.width,
                y: this.y + Math.random() * this.oceanHeight,
                width: 30 + Math.random() * 50, // Random length
                opacity: 0.3 + Math.random() * 0.4, // Vary opacity
            });
        }

        return dashes;
    }

    getOceanColors(hour) {
        // Use getSkyGradientColors to get colors that match the sky
        // Ocean colors are darker versions of sky colors for reflection effect
        const { topColor: skyTopColor, bottomColor: skyBottomColor } = getSkyGradientColors(hour, this.skyGradientParams);

        // Darken sky colors for ocean reflection effect
        const darkenFactor = 0.4; // Make ocean 40% darker than sky

        const rgbTop = hexToRgb(skyTopColor);
        const rgbBottom = hexToRgb(skyBottomColor);

        // Darken colors for ocean
        const oceanTopR = Math.max(0, Math.round(rgbTop.r * (1 - darkenFactor)));
        const oceanTopG = Math.max(0, Math.round(rgbTop.g * (1 - darkenFactor)));
        const oceanTopB = Math.max(0, Math.round(rgbTop.b * (1 - darkenFactor)));

        const oceanBottomR = Math.max(0, Math.round(rgbBottom.r * (1 - darkenFactor)));
        const oceanBottomG = Math.max(0, Math.round(rgbBottom.g * (1 - darkenFactor)));
        const oceanBottomB = Math.max(0, Math.round(rgbBottom.b * (1 - darkenFactor)));

        // Convert to RGB strings for canvas
        const topColor = `rgb(${oceanTopR}, ${oceanTopG}, ${oceanTopB})`;
        const bottomColor = `rgb(${oceanBottomR}, ${oceanBottomG}, ${oceanBottomB})`;

        // Dash color is a slightly lighter version of top color
        const dashR = Math.min(255, oceanTopR + 30);
        const dashG = Math.min(255, oceanTopG + 30);
        const dashB = Math.min(255, oceanTopB + 30);
        const dashColor = `rgb(${dashR}, ${dashG}, ${dashB})`;

        return { topColor, bottomColor, dashColor };
    }

    updateHour(hour, skyGradientParams = null) {
        this.hour = hour;
        if (skyGradientParams !== null) {
            this.skyGradientParams = skyGradientParams;
        }
    }

    // Update ocean dimensions - single source of truth for dimension calculation
    updateDimensions() {
        this.oceanHeight = this.canvas.height * Ocean.OCEAN_HEIGHT_PERCENTAGE;
        this.y = this.canvas.height - this.oceanHeight;
        // Regenerate dashes for new canvas size
        this.dashes = this.generateDashes();
    }

    updateCanvasSize() {
        // Update ocean dimensions when canvas resizes
        this.updateDimensions();
    }

    draw() {
        // Update dimensions if canvas size changed
        const expectedHeight = this.canvas.height * Ocean.OCEAN_HEIGHT_PERCENTAGE;
        const expectedY = this.canvas.height - expectedHeight;
        if (this.oceanHeight !== expectedHeight || this.y !== expectedY) {
            this.updateDimensions();
        }

        // Get colors based on current hour
        const { topColor, bottomColor, dashColor } = this.getOceanColors(this.hour);

        // Draw ocean with rounded bottom corners
        this.context.beginPath();
        this.context.moveTo(0, this.y);
        this.context.lineTo(this.canvas.width, this.y);
        this.context.lineTo(this.canvas.width, this.canvas.height);
        // Bottom right rounded corner
        this.context.quadraticCurveTo(
            this.canvas.width,
            this.canvas.height,
            this.canvas.width - 20,
            this.canvas.height
        );
        this.context.lineTo(20, this.canvas.height);
        // Bottom left rounded corner
        this.context.quadraticCurveTo(0, this.canvas.height, 0, this.canvas.height);
        this.context.closePath();

        // Create gradient for ocean depth effect
        const gradient = this.context.createLinearGradient(0, this.y, 0, this.canvas.height);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        this.context.fillStyle = gradient;
        this.context.fill();

        // Draw horizontal dashes for ocean surface/light effects
        this.context.save();
        this.context.strokeStyle = dashColor;
        this.context.lineWidth = 2;
        this.context.lineCap = 'round';

        this.dashes.forEach((dash) => {
            this.context.globalAlpha = dash.opacity;
            this.context.beginPath();
            this.context.moveTo(dash.x, dash.y);
            this.context.lineTo(dash.x + dash.width, dash.y);
            this.context.stroke();
        });

        this.context.restore();

        return true;
    }
}

export default Ocean;

