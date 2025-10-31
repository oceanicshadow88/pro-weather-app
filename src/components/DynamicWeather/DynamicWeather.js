import React, { useEffect, useRef } from 'react';

import './DynamicWeather.css';
import moment from 'moment';
import Lightning from './Lighting/Lighting';
import randomRange from './Utility';
import Rain from './Rain/Rain';
import SnowFlake from './Snow/Snow';
import Cloud from './Cloud/Cloud';
import BlowingLeaf from './BlowingLeaf/BlowingLeaf';
import Sun from './Sun/Sun';
import Ocean from './Ocean/Ocean';

const assets = [];

let canvas = false;
let context = false;
const timers = {};
let sunInstance = null; // Store reference to sun for position updates
let weatherDataRef = null; // Store reference to weather data
let oceanInstance = null; // Store reference to ocean

/**
 * Calculate moon position based on hour of day
 * 24-hour cycle:
 * 12:00pm (12) = top
 * 6:00pm (18) = bottom
 * 12:00am (0) = top
 * 6:00am (6) = bottom
 */
const calculateMoonPosition = (hour, moonRadius = 50) => {
  let progress = 0;

  if (hour >= 12 && hour < 18) {
    // 12pm-6pm: top to bottom (progress 0 to 1)
    progress = (hour - 12) / 6;
  } else if (hour >= 18 && hour < 24) {
    // 6pm-12am: bottom to top (progress 1 to 0)
    progress = 1 - (hour - 18) / 6;
  } else if (hour >= 0 && hour < 6) {
    // 12am-6am: top to bottom (progress 0 to 1)
    progress = hour / 6;
  } else if (hour >= 6 && hour < 12) {
    // 6am-12pm: bottom to top (progress 1 to 0)
    progress = 1 - (hour - 6) / 6;
  }

  // Clamp progress between 0 and 1
  progress = Math.max(0, Math.min(1, progress));

  // Calculate x and y positions
  // Position moon to the left of the city name
  // City name location: right: 100px, max-width: 200px
  // Position moon with spacing to the left of city name
  const cityLocationRight = canvas.width - 0; // Right edge of city location
  const estimatedCityNameWidth = 200; // Based on max-width in CSS
  const spacing = 30; // Spacing between moon and city name
  const x = cityLocationRight - estimatedCityNameWidth - spacing - moonRadius;

  const topPadding = moonRadius + 20;
  const bottomPadding = canvas.height - moonRadius - 20;
  const y = topPadding + (bottomPadding - topPadding) * progress;

  return { x, y };
};

// weather params
// let condition = {
//     clouds: true,
//     lightning: false,
//     rain: true,
//     snow: false,
//     wind: false
// };

// let spawnedClouds = false;
// let windSpeed = 30;
// let windDirection = 120;
// let temp = 0;
// let state = 'day';

const prefix = 'https://s3.amazonaws.com/gerwins/weather/';
let imageAssetsLoaded = false;
const imageAssets = {
  leaf: {
    fileName: `${prefix}weather_leaf.png`,
  },
  cloud_02: {
    fileName: `${prefix}weather_cloud_02.png`,
    width: 1792,
    height: 276,
  },
};

/** ******************************** */

const getShowTime = (hours) => {
  hours = parseInt(hours, 10);
  if (hours === 6) {
    return 'sunrise';
  }
  if (hours === 18) {
    return 'sunset';
  }
  if (hours > 6 && hours < 18) {
    return 'day';
  }
  return 'night';
};

/**
 * Calculate background gradient colors based on hour of day
 * Simulates sunset, sunrise, day, and night
 */
const getBackgroundGradient = (hour, canvasHeight) => {
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
    topColor = interpolateColor(nightTop, sunriseTop, progress);
    midColor = interpolateColor(nightBottom, sunriseMid, progress);
    bottomColor = interpolateColor(nightBottom, sunriseBottom, progress);
    useMidColor = true;
  } else if (hour >= 7 && hour < 17) {
    // Day (7-17)
    topColor = dayTop;
    bottomColor = dayBottom;
  } else if (hour >= 17 && hour < 19) {
    // Sunset (17-19) - transition from day to night
    const progress = (hour - 17) / 2; // 0 to 1
    topColor = interpolateColor(dayTop, sunsetTop, progress);
    midColor = interpolateColor(dayBottom, sunsetMid, progress);
    bottomColor = interpolateColor(dayBottom, sunsetBottom, progress);
    useMidColor = true;
  } else {
    // Night (19-24)
    topColor = nightTop;
    bottomColor = nightBottom;
  }

  return { topColor, midColor, bottomColor, useMidColor };
};

/**
 * Interpolate between two hex colors
 */
const interpolateColor = (color1, color2, factor) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Draw background gradient on canvas
 */
const drawBackground = (context, canvasWidth, canvasHeight, hour) => {
  const { topColor, midColor, bottomColor, useMidColor } = getBackgroundGradient(hour, canvasHeight);

  const gradient = context.createLinearGradient(0, 0, 0, canvasHeight);

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

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
};

const preLoadImageAssets = (callback) => {
  let imageAssetsCount = 0;
  let imageAssetsLoadedCount = 0;

  if (imageAssetsLoaded) {
    if (callback) {
      callback();
    }
    return;
  }

  const loadedHandler = () => {
    imageAssetsLoadedCount += 1;
    if (imageAssetsLoadedCount === imageAssetsCount) {
      imageAssetsLoaded = true;
      if (callback) {
        callback();
      }
    }
  };

  for (const imageAssetName in imageAssets) {
    const imageAsset = imageAssets[imageAssetName];
    imageAssetsCount += 1;
    imageAsset.image = new Image();
    imageAsset.image.onload = loadedHandler;
    imageAsset.image.src = imageAsset.fileName;
  }
};

const DynamicWeather = ({ data, width, height }) => {
  const canvasRef = useRef(null);
  const animateRef = useRef(null);
  const spawnFunctionsRef = useRef(null);

  // Setup spawn functions
  const spawnLightning = () => {
    const rand = randomRange(0, 10);
    if (rand > 7) {
      timers.secondFlash = setTimeout(() => {
        assets.push(new Lightning(canvas, context));
      }, 200);
    }
    assets.push(new Lightning(canvas, context));
    timers.lightning = setTimeout(spawnLightning, randomRange(500, 7000));
  };

  const spawnRain = () => {
    timers.rain = setInterval(() => {
      assets.push(new Rain(canvas, context));
    }, 60);
  };

  const spawnSnow = () => {
    timers.snow = setInterval(() => {
      assets.push(new SnowFlake(canvas, context, 1));
    }, 250);
  };

  const spawnCloud = (scale = 0.1) => {
    // Spawn clouds with scaling support
    // Default scale 0.3 (30% of original size) to fit smaller canvas (948x350)
    // Clouds positioned across the canvas and in visible Y range
    const cloud1X = -canvas.width * 0.2;
    const cloud2X = canvas.width * 0.3;
    const cloud3X = canvas.width * 0.7;


    const offset = 50
    // Position clouds in upper portion of canvas (top 15-25% area)
    const cloud1Y = canvas.height * 0.15 - offset;
    const cloud2Y = canvas.height * 0.12 - offset;
    const cloud3Y = canvas.height * 0.18 - offset;

    assets.push(new Cloud({ x: cloud1X, y: cloud1Y, scale }, canvas, context, 1, imageAssets));
    assets.push(new Cloud({ x: cloud2X, y: cloud2Y, scale }, canvas, context, 1, imageAssets));
    assets.push(new Cloud({ x: cloud3X, y: cloud3Y, scale }, canvas, context, 1, imageAssets));
  };

  const spawnLeaves = () => {
    for (let i = 0, n = randomRange(0, 3); i < n; i += 1) {
      assets.push(new BlowingLeaf(canvas, context, imageAssets, 1));
    }
    timers.wind = setTimeout(spawnLeaves, randomRange(500, 1500));
  };

  const spawnSun = () => {
    // Only spawn sun if it doesn't already exist
    if (sunInstance) {
      return;
    }
    const weatherData = weatherDataRef || data;
    const currentHour = parseInt(moment.unix(weatherData.currently.time).format('H'), 10);
    const moonRadius = 50;
    const { x, y } = calculateMoonPosition(currentHour, moonRadius);
    sunInstance = new Sun(canvas, context, x, y);
    assets.push(sunInstance);
  };

  // Store spawn functions in ref for access in beginSpawning
  spawnFunctionsRef.current = {
    snow: spawnSnow,
    'clear-day': [spawnSun],
    'partly-cloudy-day': [spawnSun, spawnCloud],
    'partly-cloudy-night': [spawnSun, spawnCloud],
    cloudy: [spawnCloud],
    'clear-night': [spawnSun, spawnCloud],
    rain: spawnRain,
    other: spawnLightning,
    wind: spawnLeaves,
  };

  const pause = () => { };

  const setConditionReady = () => {
    // stop spawning - clear all timers
    Object.values(timers).forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
        clearInterval(timer);
      }
    });
    Object.keys(timers).forEach((key) => {
      delete timers[key];
    });

    // clear assets
    for (let i = 0, n = assets.length; i < n; i++) {
      assets.splice(i, 1);
      n -= 1;
      i -= 1;
    }
    // reset instances
    sunInstance = null;
    oceanInstance = null;
    // Update data reference
    weatherDataRef = data;
    // start spawning
    beginSpawning();
  };

  const beginSpawning = () => {
    animateRef.current();
    spawnCloud();
    spawnSun();

    // Spawn ocean at the bottom
    const now = new Date();
    const currentHour = now.getHours();
    oceanInstance = new Ocean(canvas, context, currentHour);
    assets.push(oceanInstance);

    const currentData = weatherDataRef || data;
    const weather = spawnFunctionsRef.current[currentData.currently.icon];
    if (weather) {
      const weatherFunctions = Array.isArray(weather) ? weather : [weather];
      for (let i = 0, n = weatherFunctions.length; i < n; i += 1) {
        weatherFunctions[i]();
      }
    }
  };

  // Setup animation loop
  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const time = getShowTime(moment.unix(data.currently.time).format('H'));

    canvas = canvasRef.current;
    context = canvas.getContext('2d');
    canvas.className = `canvas ${time} fade-in`;

    // Store references for animate loop
    weatherDataRef = data;

    let animationFrameId = null;

    const animate = () => {
      // Update moon position based on current time if sun exists
      if (sunInstance && weatherDataRef) {
        const currentHour = parseInt(moment.unix(weatherDataRef.currently.time).format('H'), 10);
        const targetPos = calculateMoonPosition(currentHour, sunInstance.moonRadius);

        // Smooth animation toward target position
        const yVelocity = 0.1;
        const yDiff = targetPos.y - sunInstance.y;
        if (Math.abs(yDiff) > 0.5) {
          sunInstance.y += yDiff * yVelocity;
        } else {
          sunInstance.y = targetPos.y;
        }
      }

      // Get current real-time hour for background (not weather data time)
      const now = new Date();
      const currentHour = now.getHours(); // 0-23 based on local time

      // Update ocean hour for color changes
      if (oceanInstance) {
        oceanInstance.updateHour(currentHour);
      }

      // Draw background gradient (sunset/sunrise/day/night)
      drawBackground(context, canvas.width, canvas.height, currentHour);

      // Draw each asset, if false, remove particle from assets
      for (let i = 0, n = assets.length; i < n; i += 1) {
        if (!assets[i].draw()) {
          assets.splice(i, 1);
          n -= 1;
          i -= 1;
        }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animateRef.current = animate;

    preLoadImageAssets(() => {
      setConditionReady();
    });
    setConditionReady();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Clear all timers
      Object.values(timers).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
          clearInterval(timer);
        }
      });
      Object.keys(timers).forEach((key) => {
        delete timers[key];
      });
      // Clear assets
      assets.length = 0;
      sunInstance = null;
    };
  }, []); // Only run on mount

  // Update weather data when props change
  useEffect(() => {
    if (data) {
      weatherDataRef = data;
    }
  }, [data]);

  return (
    <canvas ref={canvasRef} width={width} height={height} id="canvas" className="canvas night" />
  );
};

export default DynamicWeather;
