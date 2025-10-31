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
        // Keep hour as float to allow smooth interpolation with minutes
        // hour can be 5.5 (5:30 AM), 17.75 (5:45 PM), etc.

        // Night colors (deep dark blue - distinctly not black)
        // Three-color gradient for night sky for better visibility
        const nightTop = '#253366';  // Lighter dark blue top (rgb: 78, 110, 157)
        const nightMid = '#314a85';  // Mid dark color (rgb: 33, 33, 33) for gradient depth
        const nightBottom = '#5374a7'; // Darker blue bottom (rgb: 45, 64, 89)

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
            // Night (0-5) - use three-color gradient
            topColor = nightTop;
            midColor = nightMid;
            bottomColor = nightBottom;
            useMidColor = true;
        } else if (hour >= 5 && hour < 6) {
            // Early sunrise (5-6) - transition from night to sunrise colors
            const progress = (hour - 5) / 1; // 0 to 1
            topColor = this.interpolateColor(nightTop, sunriseTop, progress);
            midColor = this.interpolateColor(nightMid, sunriseMid, progress);
            bottomColor = this.interpolateColor(nightBottom, sunriseBottom, progress);
            useMidColor = true;
        } else if (hour >= 6 && hour < 7) {
            // Late sunrise (6-7) - transition from sunrise to day colors
            const progress = (hour - 6) / 1; // 0 to 1
            topColor = this.interpolateColor(sunriseTop, dayTop, progress);
            midColor = this.interpolateColor(sunriseMid, dayTop, progress); // Blend mid to day
            bottomColor = this.interpolateColor(sunriseBottom, dayBottom, progress);
            useMidColor = progress < 0.5; // Use mid color only in first half of transition
        } else if (hour >= 7 && hour < 17) {
            // Day (7-17) - pure day colors
            topColor = dayTop;
            bottomColor = dayBottom;
        } else if (hour >= 17 && hour < 18) {
            // Early sunset (17-18) - transition from day to sunset colors
            const progress = (hour - 17) / 1; // 0 to 1
            topColor = this.interpolateColor(dayTop, sunsetTop, progress);
            midColor = this.interpolateColor(dayBottom, sunsetMid, progress);
            bottomColor = this.interpolateColor(dayBottom, sunsetBottom, progress);
            useMidColor = true;
        } else if (hour >= 18 && hour < 19) {
            // Late sunset (18-19) - transition from sunset to night colors
            const progress = (hour - 18) / 1; // 0 to 1
            topColor = this.interpolateColor(sunsetTop, nightTop, progress);
            midColor = this.interpolateColor(sunsetMid, nightMid, progress);
            bottomColor = this.interpolateColor(sunsetBottom, nightBottom, progress);
            useMidColor = true;
        } else {
            // Night (19-24) - use three-color gradient
            topColor = nightTop;
            midColor = nightMid;
            bottomColor = nightBottom;
            useMidColor = true;
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

