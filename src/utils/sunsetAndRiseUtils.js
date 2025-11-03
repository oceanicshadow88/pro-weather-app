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
    // Twilight is maximum when sun is at horizon (solarAltitudeDeg = 0)
    // For sunset/sunrise conditions, solarAltitudeDeg should be around 0 to -6
    // When solarAltitudeDeg = 0: twilightFactor = 1.0 (maximum)
    // When solarAltitudeDeg = -6: twilightFactor = 0.0 (minimal twilight)
    // When solarAltitudeDeg > 0: twilightFactor decreases as sun rises
    const raw = 1 - Math.abs(solarAltitudeDeg) / CIVIL_TWILIGHT_BOUNDARY_DEG;
    return clampToUnit(raw);
}

function calcLowSunFactor(solarAltitudeDeg) {
    // LowSunFactor is maximum when sun is at horizon (solarAltitudeDeg ≈ 0)
    // This factor determines red intensity - should be high for sunset/sunrise
    // Clamp to range [-6, 6] degrees
    const clamped = Math.max(-CIVIL_TWILIGHT_BOUNDARY_DEG, Math.min(CIVIL_TWILIGHT_BOUNDARY_DEG, solarAltitudeDeg));
    // When clamped = 0: factor = 6/12 = 0.5 (should be higher)
    // When clamped = -6: factor = 12/12 = 1.0 (good)
    // When clamped = 6: factor = 0/12 = 0.0 (good)
    // For sunset (clamped ≈ 0), we want factor ≈ 1.0
    // Use: factor = (6 - abs(clamped)) / 12, but inverted so 0 gives 1.0
    const raw = 1 - (Math.abs(clamped) / CIVIL_TWILIGHT_BOUNDARY_DEG);
    return clampToUnit(raw);
}

export function getSkyGradientByFactors({
    redLightStrength,
    blueLightStrength,
    blueRatio,
    purpleMixFactor,
    twilightFactor,
    colorMuteStrength,
    // Add additional context about atmospheric conditions
    highCloudCoverage,
    aerosolConcentration,
    relativeHumidity,
    hasVolcanicAerosol
}) {
    let topColorHex, midColorHex, bottomColorHex;

    if (colorMuteStrength > 0.65) {
        // ☁️ Muted grey overcast
        topColorHex = "#A0A3A8";
        midColorHex = "#B6B9BC";
        bottomColorHex = "#D0D3D6";
    }
    // Clear blue sky: minimal clouds, aerosols, humidity (everything near 0)
    // In real world: clear conditions = blue sky, not purple
    else if ((highCloudCoverage || 0) < 0.1 && (aerosolConcentration || 0) < 0.1 && (relativeHumidity || 0) < 0.2) {
        // 🌤 Clear Blue Sky - minimal atmospheric conditions
        topColorHex = "#6FB8FF";
        midColorHex = "#A8C9FF";
        bottomColorHex = "#D3E2FF";
    }
    // Check for orange/red sunset - red significantly higher than blue
    else if (redLightStrength > 0.65 && blueRatio < 0.35 && redLightStrength > blueLightStrength * 1.3) {
        // 🌇 橙红日落 (Red / Orange Sunset) - 高云≈0.05, 气溶胶≈0.55, 湿度≈0.8, 非雨后
        // Low cloud + high aerosol + high humidity + no rain = orange/red sunset
        topColorHex = "#FF8C42";   // bright orange
        midColorHex = "#FF6230";   // orange-red core
        bottomColorHex = "#FF3B1F"; // deep red
    }
    // Blue/Violet Twilight: high cloud coverage + low aerosol + after rain + no volcanic
    // Check BEFORE purple to prioritize blue twilight when conditions match
    // Blue should dominate (blueRatio > 0.45) but not too high, and need specific atmospheric conditions
    else if (blueLightStrength > 0.65 && blueRatio > 0.45 &&
        (highCloudCoverage || 0) > 0.6 &&
        (aerosolConcentration || 0) < 0.2 &&
        !(hasVolcanicAerosol || false)) {
        // 💙 蓝紫暮光 (Blue / Violet Twilight) - 高云≈0.7, 气溶胶≈0.1, 湿度≈0.3, 雨后, 无火山灰
        topColorHex = "#4A6BFF";
        midColorHex = "#5E7EFF";
        bottomColorHex = "#8B9FFF";
    }
    // Purple requires specific atmospheric conditions: high clouds AND (volcanic aerosol OR high humidity)
    // Purple is NOT just balanced red/blue - it needs actual atmospheric mixing factors
    // Note: Purple check comes after blue twilight to avoid conflicts
    else if (purpleMixFactor > 0.5 && twilightFactor > 0.6 &&
        Math.abs(redLightStrength - blueLightStrength) < 0.3 &&
        ((highCloudCoverage || 0) > 0.4 || (hasVolcanicAerosol || false))) {
        // 🌌 浓烈紫色 (Vivid Purple) - needs high cloud OR volcanic aerosol
        // High cloud + volcanic aerosol + high twilight = vivid purple
        if (purpleMixFactor > 0.7 && ((highCloudCoverage || 0) > 0.6 || (hasVolcanicAerosol || false))) {
            topColorHex = "#7B3FFF";
            midColorHex = "#A042FF";
            bottomColorHex = "#D14EFF";
        } else {
            // 💜 粉紫暮光 (Magenta / Purple Tint)
            topColorHex = "#9541FF";
            midColorHex = "#D55AFF";
            bottomColorHex = "#FF6FA5";
        }
    }
    // Warm Peach/Pink: moderate conditions with red higher than blue
    // Requires high humidity (for warm tones) and moderate cloud/aerosol
    else if (redLightStrength > blueLightStrength &&
        redLightStrength > 0.5 &&
        (relativeHumidity || 0) > 0.6 &&
        (highCloudCoverage || 0) < 0.4 &&
        !(hasVolcanicAerosol || false)) {
        // 🌸 粉橙 (Warm Peach / Pink) - 高云≈0.2, 气溶胶≈0.4, 湿度≈0.7
        topColorHex = "#FFB27A";
        midColorHex = "#FF8A85";
        bottomColorHex = "#FF6C75";
    }
    else {
        // 🌤 中性暮光 (Neutral Twilight) - 中等云 ≈0.3, 气溶胶≈0.4, 湿度≈0.5
        topColorHex = "#6FB8FF";
        midColorHex = "#FFA34D";
        bottomColorHex = "#FF3B2E";
    }

    return { topColorHex, midColorHex, bottomColorHex };
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
    // Purple mix requires balanced red and blue intensities AND volcanic aerosol/high cloud
    // Reduce multiplier and add conditions to make it more selective
    // Purple typically needs: high cloud (scatters blue) + volcanic (adds red) + twilight
    const purpleMixFactor = Math.min(redIntensity, blueIntensity);


    return getSkyGradientByFactors({
        redLightStrength: redIntensity,
        blueLightStrength: blueIntensity,
        blueRatio: blueRatio,
        purpleMixFactor: purpleMixFactor,
        twilightFactor: twilightFactor,
        colorMuteStrength: 0,
        // Pass atmospheric conditions for better color matching
        highCloudCoverage: highCloudCoverage,
        aerosolConcentration: aerosolConcentration,
        relativeHumidity: relativeHumidity,
        hasVolcanicAerosol: hasVolcanicAerosol
    });
}