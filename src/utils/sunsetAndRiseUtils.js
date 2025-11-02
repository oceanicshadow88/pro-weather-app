const CIVIL_TWILIGHT_BOUNDARY_DEG = 6

const TWILIGHT_SMOOTH_RANGE_DEG = CIVIL_TWILIGHT_BOUNDARY_DEG * 2

const WARM_COLOR_START_HEX = "#FFA34D"; // orange
const WARM_COLOR_END_HEX = "#FF3B2E";   // red
const COOL_COLOR_START_HEX = "#6FB8FF"; // sky blue
const COOL_COLOR_END_HEX = "#5A4BFF";   // indigo-violet


const RED_LOW_SUN_WEIGHT = 0.65;       // dominant red enhancement factor at low solar angle
const RED_HUMIDITY_WEIGHT = 0.25;      // proportion of red enhancement by humidity (moist air increases scattering)
const RED_AEROSOL_WARM_WEIGHT = 0.35;  // empirical warm enhancement from medium aerosol concentration
const RED_VOLCANIC_ENHANCE_WEIGHT = 0.10; // additional red/purple edge boost from volcanic aerosols

const BLUE_TWILIGHT_WEIGHT = 0.50;       // twilight factor’s main influence on blue light
const BLUE_HIGHCLOUD_WEIGHT = 0.30;      // contribution of high-altitude clouds to blue-violet scattering
const BLUE_AIR_CLEANLINESS_WEIGHT = 0.20;// cleaner air produces purer blue/violet tones
const BLUE_VOLCANIC_ENHANCE_WEIGHT = 0.05; // minor boost to blue tail from volcanic aerosols


const POST_RAIN_AIR_CLEAN_GAIN = 1.15; // after rain, air is cleaner → blue enhanced
const AEROSOL_WARM_PEAK = 0.4;         // warm color enhancement peaks around aerosol concentration 0.4
const AEROSOL_WARM_WIDTH = 0.35;       // Gaussian width controlling range of warm enhancement



function clampToUnit(value) {
    return Math.max(0, Math.min(1, value));
}

function mixHexColors(colorA, colorB, ratio0to1) {
    const intA = parseInt(colorA.slice(1), 16);
    const intB = parseInt(colorB.slice(1), 16);

    const rA = (intA >> 16) & 255;
    const gA = (intA >> 8) & 255;
    const bA = intA & 255;

    const rB = (intB >> 16) & 255;
    const gB = (intB >> 8) & 255;
    const bB = intB & 255;

    const rMix = Math.round(rA + (rB - rA) * ratio0to1);
    const gMix = Math.round(gA + (gB - gA) * ratio0to1);
    const bMix = Math.round(bA + (bB - bA) * ratio0to1);

    return "#" + ((1 << 24) + (rMix << 16) + (gMix << 8) + bMix).toString(16).slice(1);
}

function adjustHexBrightness(hexColor, brightnessFactorNegToPos) {
    const x = clampToUnit((brightnessFactorNegToPos + 1) / 2); // map [-1,1] → [0,1]
    const targetGray = mixHexColors("#000000", "#FFFFFF", x);
    return mixHexColors(hexColor, targetGray, Math.abs(brightnessFactorNegToPos));
}

function calcTwilightFactor(solarAltitudeDeg) {
    const raw = 1 - Math.abs(solarAltitudeDeg) / CIVIL_TWILIGHT_BOUNDARY_DEG;
    return clampToUnit(raw);
}

function calcLowSunFactor(solarAltitudeDeg) {
    const clamped = Math.max(-CIVIL_TWILIGHT_BOUNDARY_DEG, Math.min(CIVIL_TWILIGHT_BOUNDARY_DEG, solarAltitudeDeg));
    const raw = (CIVIL_TWILIGHT_BOUNDARY_DEG - clamped) / TWILIGHT_SMOOTH_RANGE_DEG;
    return clampToUnit(raw);
}


export function calcIdealClearSkyGradient(input) {
    const {
        solarAltitudeDeg,
        highCloudCoverage,
        aerosolConcentration,
        relativeHumidity,
        isAfterRain,
        hasVolcanicAerosol
    } = input;

    const twilightFactor = calcTwilightFactor(solarAltitudeDeg);
    const lowSunFactor = calcLowSunFactor(solarAltitudeDeg);

    const aerosolWarmEnhanceFactor = Math.exp(
        -Math.pow((aerosolConcentration - AEROSOL_WARM_PEAK) / AEROSOL_WARM_WIDTH, 2)
    );

    let redIntensity =
        RED_LOW_SUN_WEIGHT * lowSunFactor +
        RED_HUMIDITY_WEIGHT * relativeHumidity +
        RED_AEROSOL_WARM_WEIGHT * aerosolWarmEnhanceFactor;

    if (hasVolcanicAerosol) {
        redIntensity += RED_VOLCANIC_ENHANCE_WEIGHT * twilightFactor;
    }

    const airCleanFactor =
        clampToUnit(1 - aerosolConcentration) *
        (isAfterRain ? POST_RAIN_AIR_CLEAN_GAIN : 1);

    let blueIntensity =
        BLUE_TWILIGHT_WEIGHT * twilightFactor +
        BLUE_HIGHCLOUD_WEIGHT * highCloudCoverage +
        BLUE_AIR_CLEANLINESS_WEIGHT * airCleanFactor;

    if (hasVolcanicAerosol) {
        blueIntensity += BLUE_VOLCANIC_ENHANCE_WEIGHT * twilightFactor;
    }

    const warmBase = mixHexColors(
        WARM_COLOR_START_HEX,
        WARM_COLOR_END_HEX,
        clampToUnit(lowSunFactor)
    );
    const coolBase = mixHexColors(
        COOL_COLOR_START_HEX,
        COOL_COLOR_END_HEX,
        clampToUnit(twilightFactor)
    );

    const totalIntensity = redIntensity + blueIntensity + 1e-6;
    const blueRatio = clampToUnit(blueIntensity / totalIntensity);

    const bottomWarmCoolMix = clampToUnit(0.15 + 0.35 * twilightFactor);
    let bottomColorHex = mixHexColors(warmBase, coolBase, bottomWarmCoolMix);
    bottomColorHex = adjustHexBrightness(bottomColorHex, -0.06); // slightly darker near horizon

    // Middle: balanced red & blue → use overall blend, slightly brighter
    const blendedBase = mixHexColors(warmBase, coolBase, blueRatio);
    let midColorHex = adjustHexBrightness(blendedBase, +0.05);

    // Top: upper sky → cooler; shifts toward indigo as twilight grows, slightly brightened
    const topCoolShiftRatio = clampToUnit(0.4 + 0.6 * twilightFactor);
    let topColorHex = mixHexColors(COOL_COLOR_START_HEX, COOL_COLOR_END_HEX, topCoolShiftRatio);
    topColorHex = adjustHexBrightness(topColorHex, +0.10);

    return {
        topColorHex,
        midColorHex,
        bottomColorHex
    };
}