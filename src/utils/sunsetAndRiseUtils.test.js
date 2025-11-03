/**
 * Test suite for sky gradient color calculations
 * Tests all color cases to ensure correct color matching based on atmospheric conditions
 */

// Helper to compare hex colors (allow small tolerance for rounding)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

function colorsMatch(color1, color2, tolerance = 5) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return false;

    return Math.abs(rgb1.r - rgb2.r) <= tolerance &&
        Math.abs(rgb1.g - rgb2.g) <= tolerance &&
        Math.abs(rgb1.b - rgb2.b) <= tolerance;
}

// Run tests if executed directly
if (require.main === module || typeof require !== 'undefined') {
    console.log('Running sky gradient color tests...\n');

    // Import and run tests (use dynamic import for ESM or require for CJS)
    let calcIdealClearSkyGradient;
    try {
        // Try CommonJS first
        calcIdealClearSkyGradient = require('./sunsetAndRiseUtils.js').calcIdealClearSkyGradient;
    } catch (e) {
        // Fallback: read and eval the module (for ESM compatibility)
        const fs = require('fs');
        const path = require('path');
        const modulePath = path.join(__dirname, 'sunsetAndRiseUtils.js');
        const moduleCode = fs.readFileSync(modulePath, 'utf8');
        // Simple evaluation (may not work for all cases, but should work for our test)
        eval(moduleCode.replace(/export\s+/g, ''));
    }

    const tests = [
        {
            name: 'Clear Blue Sky',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0, aerosolConcentration: 0, relativeHumidity: 0, isAfterRain: false, hasVolcanicAerosol: false },
            expected: { top: "#6FB8FF", mid: "#A8C9FF", bottom: "#D3E2FF" }
        },
        {
            name: 'Vivid Purple',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.7, aerosolConcentration: 0.2, relativeHumidity: 0.4, isAfterRain: true, hasVolcanicAerosol: true },
            expected: { top: "#7B3FFF", mid: "#A042FF", bottom: "#D14EFF" }
        },
        {
            name: 'Magenta/Purple Tint',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.5, aerosolConcentration: 0.3, relativeHumidity: 0.5, isAfterRain: true, hasVolcanicAerosol: false },
            expected: { top: "#9541FF", mid: "#D55AFF", bottom: "#FF6FA5" }
        },
        {
            name: 'Orange/Red Sunset',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.05, aerosolConcentration: 0.55, relativeHumidity: 0.8, isAfterRain: false, hasVolcanicAerosol: false },
            expected: { top: "#FF8C42", mid: "#FF6230", bottom: "#FF3B1F" }
        },
        {
            name: 'Blue/Violet Twilight',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.7, aerosolConcentration: 0.1, relativeHumidity: 0.3, isAfterRain: true, hasVolcanicAerosol: false },
            expected: { top: "#4A6BFF", mid: "#5E7EFF", bottom: "#8B9FFF" }
        },
        {
            name: 'Warm Peach/Pink',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.2, aerosolConcentration: 0.4, relativeHumidity: 0.7, isAfterRain: false, hasVolcanicAerosol: false },
            expected: { top: "#FFB27A", mid: "#FF8A85", bottom: "#FF6C75" }
        },
        {
            name: 'Neutral Twilight',
            params: { solarAltitudeDeg: 0, highCloudCoverage: 0.3, aerosolConcentration: 0.4, relativeHumidity: 0.5, isAfterRain: false, hasVolcanicAerosol: false },
            expected: { top: "#6FB8FF", mid: "#FFA34D", bottom: "#FF3B2E" }
        }
    ];

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    }

    function colorsMatch(color1, color2, tolerance = 5) {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        if (!rgb1 || !rgb2) return false;
        return Math.abs(rgb1.r - rgb2.r) <= tolerance &&
            Math.abs(rgb1.g - rgb2.g) <= tolerance &&
            Math.abs(rgb1.b - rgb2.b) <= tolerance;
    }

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        const result = calcIdealClearSkyGradient(test.params);
        const topMatch = colorsMatch(result.topColorHex, test.expected.top);
        const midMatch = colorsMatch(result.midColorHex, test.expected.mid);
        const bottomMatch = colorsMatch(result.bottomColorHex, test.expected.bottom);

        if (topMatch && midMatch && bottomMatch) {
            console.log(`✓ ${test.name} - PASSED`);
            passed++;
        } else {
            console.log(`✗ ${test.name} - FAILED`);
            console.log(`  Expected: ${test.expected.top}, Got: ${result.topColorHex}`);
            console.log(`  Expected: ${test.expected.mid}, Got: ${result.midColorHex}`);
            console.log(`  Expected: ${test.expected.bottom}, Got: ${result.bottomColorHex}`);
            failed++;
        }
    });

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

