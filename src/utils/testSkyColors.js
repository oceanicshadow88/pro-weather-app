/**
 * Comprehensive test suite for sky gradient color calculations
 * Run with: node --input-type=module src/utils/testSkyColors.js
 * 
 * Tests all color cases to ensure correct color matching based on atmospheric conditions
 */

import { calcIdealClearSkyGradient } from './sunsetAndRiseUtils.js';

// Helper functions
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

// Test cases based on ChatGPT's specifications
const testCases = [
    {
        name: '🌤 Clear Blue Sky',
        description: 'Minimal atmospheric conditions (everything near 0) - should be blue, not purple',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0,
            aerosolConcentration: 0,
            relativeHumidity: 0,
            isAfterRain: false,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#6FB8FF", mid: "#A8C9FF", bottom: "#D3E2FF" }
    },
    {
        name: '🌌 Vivid Purple',
        description: '高云≈0.7, 气溶胶≈0.2, 湿度≈0.4, 雨后, 火山气溶胶',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.7,
            aerosolConcentration: 0.2,
            relativeHumidity: 0.4,
            isAfterRain: true,
            hasVolcanicAerosol: true,
        },
        expected: { top: "#7B3FFF", mid: "#A042FF", bottom: "#D14EFF" }
    },
    {
        name: '💜 Magenta/Purple Tint',
        description: '高云≈0.5, 气溶胶≈0.3, 湿度≈0.5, 雨后',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.5,
            aerosolConcentration: 0.3,
            relativeHumidity: 0.5,
            isAfterRain: true,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#9541FF", mid: "#D55AFF", bottom: "#FF6FA5" }
    },
    {
        name: '🌇 Orange/Red Sunset',
        description: '高云≈0.05, 气溶胶≈0.55, 湿度≈0.8, 非雨后',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.05,
            aerosolConcentration: 0.55,
            relativeHumidity: 0.8,
            isAfterRain: false,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#FF8C42", mid: "#FF6230", bottom: "#FF3B1F" }
    },
    {
        name: '💙 Blue/Violet Twilight',
        description: '高云≈0.7, 气溶胶≈0.1, 湿度≈0.3, 雨后, 无火山灰',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.7,
            aerosolConcentration: 0.1,
            relativeHumidity: 0.3,
            isAfterRain: true,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#4A6BFF", mid: "#5E7EFF", bottom: "#8B9FFF" }
    },
    {
        name: '🌸 Warm Peach/Pink',
        description: '高云≈0.2, 气溶胶≈0.4, 湿度≈0.7',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.2,
            aerosolConcentration: 0.4,
            relativeHumidity: 0.7,
            isAfterRain: false,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#FFB27A", mid: "#FF8A85", bottom: "#FF6C75" }
    },
    {
        name: '🌤 Neutral Twilight',
        description: '中等云 ≈0.3, 气溶胶≈0.4, 湿度≈0.5',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.3,
            aerosolConcentration: 0.4,
            relativeHumidity: 0.5,
            isAfterRain: false,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#6FB8FF", mid: "#FFA34D", bottom: "#FF3B2E" }
    },
    {
        name: 'Edge Case: Very Low Values',
        description: 'Should still be clear blue (minimal conditions)',
        params: {
            solarAltitudeDeg: 0,
            highCloudCoverage: 0.05,
            aerosolConcentration: 0.05,
            relativeHumidity: 0.1,
            isAfterRain: false,
            hasVolcanicAerosol: false,
        },
        expected: { top: "#6FB8FF", mid: "#A8C9FF", bottom: "#D3E2FF" }
    },
    {
        name: 'Edge Case: High Solar Altitude',
        description: 'High solar altitude should reduce twilight effects (not vivid purple)',
        params: {
            solarAltitudeDeg: 5,
            highCloudCoverage: 0.7,
            aerosolConcentration: 0.2,
            relativeHumidity: 0.4,
            isAfterRain: true,
            hasVolcanicAerosol: true,
        },
        expected: { top: "#7B3FFF", mid: "#A042FF", bottom: "#D14EFF" },
        shouldNotMatch: true // This should NOT match vivid purple due to low twilightFactor
    }
];

console.log('═══════════════════════════════════════════════════════════');
console.log('Sky Gradient Color Test Suite');
console.log('═══════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;
const failedTests = [];

testCases.forEach((test, index) => {
    try {
        const result = calcIdealClearSkyGradient(test.params);
        const topMatch = colorsMatch(result.topColorHex, test.expected.top);
        const midMatch = colorsMatch(result.midColorHex, test.expected.mid);
        const bottomMatch = colorsMatch(result.bottomColorHex, test.expected.bottom);

        // For edge cases that should NOT match
        const allMatch = topMatch && midMatch && bottomMatch;
        const testPassed = test.shouldNotMatch ? !allMatch : allMatch;

        if (testPassed) {
            console.log(`✓ Test ${index + 1}: ${test.name} - PASSED`);
            console.log(`  ${test.description}`);
            if (!test.shouldNotMatch) {
                console.log(`  Colors: ${result.topColorHex}, ${result.midColorHex}, ${result.bottomColorHex}`);
            } else {
                console.log(`  Correctly did not match (got: ${result.topColorHex})`);
            }
            passed++;
        } else {
            console.log(`✗ Test ${index + 1}: ${test.name} - FAILED`);
            console.log(`  ${test.description}`);
            if (test.shouldNotMatch) {
                console.log(`  Expected: Should NOT match ${test.expected.top}`);
                console.log(`  Got: ${result.topColorHex} (incorrectly matched)`);
            } else {
                console.log(`  Expected Top: ${test.expected.top}, Got: ${result.topColorHex} (match: ${topMatch})`);
                console.log(`  Expected Mid: ${test.expected.mid}, Got: ${result.midColorHex} (match: ${midMatch})`);
                console.log(`  Expected Bottom: ${test.expected.bottom}, Got: ${result.bottomColorHex} (match: ${bottomMatch})`);
            }
            failed++;
            failedTests.push(test.name);
        }
        console.log('');
    } catch (error) {
        console.log(`✗ Test ${index + 1}: ${test.name} - ERROR`);
        console.log(`  ${test.description}`);
        console.log(`  Error: ${error.message}`);
        console.log(error.stack);
        failed++;
        failedTests.push(test.name);
        console.log('');
    }
});

console.log('═══════════════════════════════════════════════════════════');
console.log(`Test Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
    console.log(`Failed tests: ${failedTests.join(', ')}`);
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(1);
} else {
    console.log('All tests passed! ✓');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);
}
