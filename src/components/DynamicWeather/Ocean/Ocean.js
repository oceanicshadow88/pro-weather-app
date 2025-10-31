class Ocean {
    // Ocean height as percentage of canvas height
    static OCEAN_HEIGHT_PERCENTAGE = 0.2; // 40%

    constructor(canvas, context, hour) {
        this.canvas = canvas;
        this.context = context;
        this.hour = hour;

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
        // Keep hour as float to allow smooth interpolation with minutes
        // hour can be 5.5 (5:30 AM), 17.75 (5:45 PM), etc.

        // Day colors (7-17) - bright blue ocean with gradient
        const dayTop = '#4a90e2';
        const dayBottom = '#2c5aa0';
        const dayDash = '#6ba3e8';

        // Night colors (19-24, 0-5) - dark blue ocean with gradient
        const nightTop = '#19224c';  // Top color (rgb: 25, 34, 76)
        const nightBottom = '#32508c'; // Bottom color (rgb: 50, 80, 140)
        const nightDash = '#2a3f5f';

        // Sunrise colors (5-7)
        const sunriseTop = '#3d5a80';
        const sunriseBottom = '#1e3a5f';
        const sunriseDash = '#5a7fa3';

        // Sunset colors (17-19)
        const sunsetTop = '#2d4a6b';
        const sunsetBottom = '#1a2f4a';
        const sunsetDash = '#4a6b8f';

        let topColor, bottomColor, dashColor;

        if (hour >= 0 && hour < 5) {
            // Night
            topColor = nightTop;
            bottomColor = nightBottom;
            dashColor = nightDash;
        } else if (hour >= 5 && hour < 6) {
            // Early sunrise (5-6) - transition from night to sunrise colors
            const progress = (hour - 5) / 1; // 0 to 1
            topColor = this.interpolateColor(nightTop, sunriseTop, progress);
            bottomColor = this.interpolateColor(nightBottom, sunriseBottom, progress);
            dashColor = this.interpolateColor(nightDash, sunriseDash, progress);
        } else if (hour >= 6 && hour < 7) {
            // Late sunrise (6-7) - transition from sunrise to day colors
            const progress = (hour - 6) / 1; // 0 to 1
            topColor = this.interpolateColor(sunriseTop, dayTop, progress);
            bottomColor = this.interpolateColor(sunriseBottom, dayBottom, progress);
            dashColor = this.interpolateColor(sunriseDash, dayDash, progress);
        } else if (hour >= 7 && hour < 17) {
            // Day (7-17) - pure day colors
            topColor = dayTop;
            bottomColor = dayBottom;
            dashColor = dayDash;
        } else if (hour >= 17 && hour < 18) {
            // Early sunset (17-18) - transition from day to sunset colors
            const progress = (hour - 17) / 1; // 0 to 1
            topColor = this.interpolateColor(dayTop, sunsetTop, progress);
            bottomColor = this.interpolateColor(dayBottom, sunsetBottom, progress);
            dashColor = this.interpolateColor(dayDash, sunsetDash, progress);
        } else if (hour >= 18 && hour < 19) {
            // Late sunset (18-19) - transition from sunset to night colors
            const progress = (hour - 18) / 1; // 0 to 1
            topColor = this.interpolateColor(sunsetTop, nightTop, progress);
            bottomColor = this.interpolateColor(sunsetBottom, nightBottom, progress);
            dashColor = this.interpolateColor(sunsetDash, nightDash, progress);
        } else {
            // Night (19-24)
            topColor = nightTop;
            bottomColor = nightBottom;
            dashColor = nightDash;
        }

        return { topColor, bottomColor, dashColor };
    }

    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : { r: 0, g: 0, b: 0 };
    }

    updateHour(hour) {
        this.hour = hour;
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

