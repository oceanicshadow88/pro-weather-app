/**
 * Shared utility functions for sky color calculations
 * Used by Sky.js, BackGround.js, Forecast.js, and ForecastItem.js
 */
import { calcIdealClearSkyGradient } from './sunsetAndRiseUtils';

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
};

/**
 * Interpolate between two colors
 * @param {string} color1 - Hex color string
 * @param {string} color2 - Hex color string
 * @param {number} factor - 0 to 1, where 0 = color1, 1 = color2
 * @returns {string} Hex color string
 */
export const interpolateColor = (color1, color2, factor) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Get current hour as float (with minutes consideration)
 * @param {Object|null} timeOverride - { hour: 0-23, minute: 0-59 } or null
 * @returns {number} Hour as float (e.g., 14.5 for 2:30 PM)
 */
export const getCurrentHour = (timeOverride) => {
    if (timeOverride && typeof timeOverride === 'object' && timeOverride.hour !== undefined) {
        return timeOverride.hour + (timeOverride.minute || 0) / 60;
    }
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
};

/**
 * Get current hour as integer
 * @param {Object|null} timeOverride - { hour: 0-23, minute: 0-59 } or null
 * @returns {number} Hour as integer (0-23)
 */
export const getCurrentHourInt = (timeOverride) => {
    if (timeOverride && typeof timeOverride === 'object' && timeOverride.hour !== undefined) {
        return timeOverride.hour;
    }
    return new Date().getHours();
};

// Sky color constants (top colors for each phase)
export const SKY_COLORS = {
    night: {
        top: '#253366',
        mid: '#314a85',
        bottom: '#5374a7',
    },
    sunrise: {
        top: '#ff6b6b',
        mid: '#ffa94d',
        bottom: '#ff8787',
    },
    day: {
        top: '#87ceeb',
        bottom: '#e0f6ff',
    },
    sunset: {
        top: '#ff7849',
        mid: '#ff6b35',
        bottom: '#ff4757',
    },
};

/**
 * Get sky top color based on hour (simplified version for icons/foreground)
 * Uses getSkyGradientColors to ensure consistency with calculated colors
 * @param {number} hour - Hour as float (0-24)
 * @param {Object|null} skyGradientParams - Optional parameters for calcIdealClearSkyGradient
 * @returns {string} Hex color string for top of sky
 */
export const getSkyTopColor = (hour, skyGradientParams = null) => {
    const { topColor } = getSkyGradientColors(hour, skyGradientParams);
    return topColor;
};

/**
 * Get sky colors (top, mid, bottom) for gradient
 * @param {number} hour - Hour as float (0-24)
 * @param {Object|null} skyGradientParams - Optional parameters for calcIdealClearSkyGradient
 * @returns {Object} { topColor, midColor, bottomColor, useMidColor }
 */
export const getSkyGradientColors = (hour, skyGradientParams = null) => {
    const { night, sunrise, day, sunset } = SKY_COLORS;

    let topColor, bottomColor, midColor = null;
    let useMidColor = false;

    // Default parameters
    const defaultParams = {
        solarAltitudeDeg: 0.2,
        highCloudCoverage: 0.7,
        aerosolConcentration: 0.2,
        relativeHumidity: 0.4,
        isAfterRain: true,
        hasVolcanicAerosol: true,
    };

    // Use provided params or defaults
    const params = skyGradientParams || defaultParams;

    const { topColorHex, midColorHex, bottomColorHex } = calcIdealClearSkyGradient(params);


    if (hour >= 0 && hour < 5) {
        // Night (0-5) - use three-color gradient
        topColor = night.top;
        midColor = night.mid;
        bottomColor = night.bottom;
        useMidColor = true;
    } else if (hour >= 5 && hour < 6) {
        // Early sunrise (5-6) - transition from night to sunrise colors
        const progress = (hour - 5) / 1;

        topColor = interpolateColor(night.top, topColorHex, progress);
        midColor = interpolateColor(night.mid, midColorHex, progress);
        bottomColor = interpolateColor(night.bottom, bottomColorHex, progress);
        useMidColor = true;
    } else if (hour >= 6 && hour < 7) {
        // Late sunrise (6-7) - transition from sunrise to day colors
        const progress = (hour - 6) / 1;
        topColor = interpolateColor(topColorHex, day.top, progress);
        midColor = interpolateColor(midColorHex, day.top, progress); // Blend mid to day
        bottomColor = interpolateColor(bottomColorHex, day.bottom, progress);
        useMidColor = progress < 0.5; // Use mid color only in first half of transition
    } else if (hour >= 7 && hour < 17) {
        // Day (7-17) - pure day colors
        topColor = day.top;
        bottomColor = day.bottom;
    } else if (hour >= 17 && hour < 18) {
        // Early sunset (17-18) - transition from day to sunset colors
        const progress = (hour - 17) / 1;
        topColor = interpolateColor(day.top, topColorHex, progress);
        midColor = interpolateColor(day.bottom, midColorHex, progress);
        bottomColor = interpolateColor(day.bottom, bottomColorHex, progress);
        useMidColor = true;
    } else if (hour >= 18 && hour < 19) {
        // Late sunset (18-19) - transition from sunset to night colors
        const progress = (hour - 18) / 1;
        topColor = interpolateColor(topColorHex, night.top, progress);
        midColor = interpolateColor(midColorHex, night.mid, progress);
        bottomColor = interpolateColor(bottomColorHex, night.bottom, progress);
        useMidColor = true;
    } else {
        // Night (19-24) - use three-color gradient
        topColor = night.top;
        midColor = night.mid;
        bottomColor = night.bottom;
        useMidColor = true;
    }

    return { topColor, midColor, bottomColor, useMidColor };
};

/**
 * Darken a color by a percentage
 * @param {string} colorHex - Hex color string
 * @param {number} amount - 0 to 1, percentage to darken (default 0.15 = 15%)
 * @returns {string} Hex color string
 */
export const darkenColor = (colorHex, amount = 0.15) => {
    const rgb = hexToRgb(colorHex);
    const darkenedR = Math.max(0, rgb.r * (1 - amount));
    const darkenedG = Math.max(0, rgb.g * (1 - amount));
    const darkenedB = Math.max(0, rgb.b * (1 - amount));

    const toHex = (r, g, b) => {
        return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
    };

    return toHex(darkenedR, darkenedG, darkenedB);
};

