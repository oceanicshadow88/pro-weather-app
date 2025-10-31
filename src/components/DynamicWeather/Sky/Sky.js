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
        hour = parseInt(hour, 10);

        // Night colors (dark blue)
        const nightTop = '#1a1f3a';
        const nightBottom = '#0d1117';

        // Sunrise colors (orange/pink gradient)
        const sunriseTop = '#ff6b6b';
        const sunriseMid = '#ffa94d';
        const sunriseBottom = '#ff8787';

        // Day colors (sky blue)
        const dayTop = '#87ceeb';
        const dayBottom = '#e0f6ff';

        // Sunset colors (orange/red gradient)
        const sunsetTop = '#ff7849';
        const sunsetMid = '#ff6b35';
        const sunsetBottom = '#ff4757';

        let topColor, bottomColor, midColor = null;
        let useMidColor = false;

        if (hour >= 0 && hour < 5) {
            // Night (0-5)
            topColor = nightTop;
            bottomColor = nightBottom;
        } else if (hour >= 5 && hour < 7) {
            // Sunrise (5-7) - transition from night to day
            const progress = (hour - 5) / 2; // 0 to 1
            topColor = this.interpolateColor(nightTop, sunriseTop, progress);
            midColor = this.interpolateColor(nightBottom, sunriseMid, progress);
            bottomColor = this.interpolateColor(nightBottom, sunriseBottom, progress);
            useMidColor = true;
        } else if (hour >= 7 && hour < 17) {
            // Day (7-17)
            topColor = dayTop;
            bottomColor = dayBottom;
        } else if (hour >= 17 && hour < 19) {
            // Sunset (17-19) - transition from day to night
            const progress = (hour - 17) / 2; // 0 to 1
            topColor = this.interpolateColor(dayTop, sunsetTop, progress);
            midColor = this.interpolateColor(dayBottom, sunsetMid, progress);
            bottomColor = this.interpolateColor(dayBottom, sunsetBottom, progress);
            useMidColor = true;
        } else {
            // Night (19-24)
            topColor = nightTop;
            bottomColor = nightBottom;
        }

        return { topColor, midColor, bottomColor, useMidColor };
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

    draw() {
        const { topColor, midColor, bottomColor, useMidColor } = this.getBackgroundGradient(this.hour);

        const gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);

        if (useMidColor && midColor) {
            // Three-color gradient for sunrise/sunset
            gradient.addColorStop(0, topColor);
            gradient.addColorStop(0.5, midColor);
            gradient.addColorStop(1, bottomColor);
        } else {
            // Two-color gradient for day/night
            gradient.addColorStop(0, topColor);
            gradient.addColorStop(1, bottomColor);
        }

        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        return true;
    }
}

export default Sky;

