import React, { useEffect, useRef } from 'react';

import './DynamicWeather.css';
import moment from 'moment';
import Lightning from './Lighting/Lighting';
import randomRange from './Utility';
import Rain from './Rain/Rain';
import SnowFlake from './Snow/Snow';
import Cloud from './Cloud/Cloud';
import BlowingLeaf from './BlowingLeaf/BlowingLeaf';
import Moon from './Moon/Moon';
import Ocean from './Ocean/Ocean';
import Sky from './Sky/Sky';

const assets = [];

let canvas = false;
let context = false;
const timers = {};
let moonInstance = null; // Store reference to moon for position updates
let weatherDataRef = null; // Store reference to weather data
let oceanInstance = null; // Store reference to ocean
let skyInstance = null; // Store reference to sky

// HACK: Override time for testing (set to null to use real time, or set to hour 0-23)
// Example: const TIME_OVERRIDE = 18; // Forces 6pm for testing
const TIME_OVERRIDE = null; // Set to 0-23 to override current time, null to use real time

/**
 * Calculate moon position based on hour of day
 * 24-hour cycle:
 * 12:00pm (12) = top
 * 6:00pm (18) = bottom
 * 12:00am (0) = top
 * 6:00am (6) = bottom
 */
const calculateMoonPosition = (hour, moonRadius = 50, currentCanvas = null) => {
  // Use provided canvas or fallback to module-level canvas
  const canvasToUse = currentCanvas || canvas;
  if (!canvasToUse) {
    // Return default position if canvas not ready
    return { x: 100, y: 100 };
  }

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
  // City name location: right: 0px, max-width: 200px
  // Position moon with spacing to the left of city name
  const canvasWidth = canvasToUse.width || canvasToUse.clientWidth || 948;
  const cityLocationRight = canvasWidth;
  const estimatedCityNameWidth = 200; // Based on max-width in CSS
  const spacing = 30; // Spacing between moon and city name
  const x = Math.max(moonRadius + 10, cityLocationRight - estimatedCityNameWidth - spacing - moonRadius);

  const canvasHeight = canvasToUse.height || 350;
  const topPadding = moonRadius + 20;
  const bottomPadding = canvasHeight - moonRadius - 20;
  const y = Math.max(topPadding, Math.min(bottomPadding, topPadding + (bottomPadding - topPadding) * progress));

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

  const spawnMoon = () => {
    // Only spawn moon if it doesn't already exist
    if (moonInstance) {
      return;
    }
    if (!canvas) {
      console.warn('Cannot spawn moon: canvas not ready');
      return; // Wait for canvas to be ready
    }

    const weatherData = weatherDataRef || data;
    if (!weatherData || !weatherData.currently) {
      console.warn('Cannot spawn moon: weather data not ready');
      return;
    }

    const currentHour = parseInt(moment.unix(weatherData.currently.time).format('H'), 10);
    // Use smaller base radius - will scale proportionally with canvas
    const moonRadius = 30; // Base size (scales with canvas)

    // Try center position first to ensure it's visible, then use calculated position
    let x, y;
    if (canvas.width && canvas.height) {
      const pos = calculateMoonPosition(currentHour, moonRadius, canvas);
      x = pos.x;
      y = pos.y;
      // Fallback to center if position seems off-screen
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
        console.warn('Moon position off-screen, using center:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
        x = canvas.width / 2;
        y = canvas.height / 2;
      }
    } else {
      // Fallback to center if canvas dimensions not ready
      x = 400;
      y = 200;
    }

    console.log('Spawning moon:', { x, y, moonRadius, currentHour, canvasWidth: canvas.width, canvasHeight: canvas.height });

    moonInstance = new Moon(canvas, context, x, y, moonRadius);
    assets.push(moonInstance);
    console.log('Moon spawned successfully, assets count:', assets.length, 'moonInstance:', !!moonInstance);
  };

  // Store spawn functions in ref for access in beginSpawning
  spawnFunctionsRef.current = {
    snow: spawnSnow,
    'clear-day': [spawnMoon, spawnCloud],
    'partly-cloudy-day': [spawnMoon, spawnCloud],
    'partly-cloudy-night': [spawnMoon, spawnCloud],
    cloudy: [spawnMoon, spawnCloud], // Add moon to cloudy too
    'clear-night': [spawnMoon, spawnCloud],
    rain: [spawnMoon, spawnRain], // Add moon to rain
    other: [spawnMoon, spawnLightning], // Add moon to other
    wind: [spawnMoon, spawnLeaves], // Add moon to wind
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
    moonInstance = null;
    oceanInstance = null;
    skyInstance = null;
    // Update data reference
    weatherDataRef = data;
    // start spawning
    beginSpawning();
  };

  const beginSpawning = () => {
    animateRef.current();
    spawnCloud();
    spawnMoon();

    // Spawn sky background
    const currentHour = TIME_OVERRIDE !== null ? TIME_OVERRIDE : new Date().getHours();
    skyInstance = new Sky(canvas, context, currentHour);
    assets.push(skyInstance);

    // Spawn ocean at the bottom
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
      // Update canvas references for all assets if canvas changed
      if (canvas !== canvasRef.current) {
        canvas = canvasRef.current;
        context = canvas.getContext('2d');

        // Update canvas references for all cloud instances
        assets.forEach((asset) => {
          if (asset.type === 'cloud' && asset.updateCanvasSize) {
            asset.updateCanvasSize(canvas);
          }
        });

        // Update moon canvas reference and scale
        if (moonInstance && moonInstance.updateCanvasSize) {
          moonInstance.updateCanvasSize(canvas);
        }
      }

      // Update moon position based on current time if moon exists
      if (moonInstance && weatherDataRef && canvas) {
        const currentHour = parseInt(moment.unix(weatherDataRef.currently.time).format('H'), 10);
        const targetPos = calculateMoonPosition(currentHour, moonInstance.moonRadius, canvas);

        // Update both x and y positions
        moonInstance.x = targetPos.x;

        // Smooth animation toward target y position
        const yVelocity = 0.1;
        const yDiff = targetPos.y - moonInstance.y;
        if (Math.abs(yDiff) > 0.5) {
          moonInstance.y += yDiff * yVelocity;
        } else {
          moonInstance.y = targetPos.y;
        }
      }

      // Get current hour (use override if set, otherwise real time)
      const currentHour = TIME_OVERRIDE !== null ? TIME_OVERRIDE : new Date().getHours();

      // Update sky and ocean hour for color changes
      if (skyInstance) {
        skyInstance.updateHour(currentHour);
      }
      if (oceanInstance) {
        oceanInstance.updateHour(currentHour);
      }

      // Draw sky background FIRST (sunset/sunrise/day/night)
      if (skyInstance) {
        skyInstance.draw();
      }

      // Draw ocean
      if (oceanInstance) {
        oceanInstance.draw();
      }

      // Draw moon FIRST (before other assets) to ensure visibility
      if (moonInstance) {
        const drawResult = moonInstance.draw();
        if (!drawResult) {
          console.warn('Moon draw returned false');
        }
      }

      // Draw each asset, if false, remove particle from assets
      // Skip moonInstance since we already drew it above
      for (let i = 0, n = assets.length; i < n; i += 1) {
        const asset = assets[i];
        // Skip if it's the moon (already drawn) or sky/ocean (already drawn)
        if (asset === moonInstance || asset === skyInstance || asset === oceanInstance) {
          continue;
        }
        if (!asset.draw()) {
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
      moonInstance = null;
    };
  }, []); // Only run on mount

  // Update weather data when props change
  useEffect(() => {
    if (data) {
      weatherDataRef = data;
    }
  }, [data]);

  // Update canvas size and scale assets when width/height changes
  useEffect(() => {
    if (!canvasRef.current) return;

    // Update canvas reference in case it changed
    const currentCanvas = canvasRef.current;
    canvas = currentCanvas;
    context = currentCanvas.getContext('2d');

    // Update all cloud instances to scale with new canvas width
    assets.forEach((asset) => {
      if (asset.type === 'cloud' && asset.updateCanvasSize) {
        // Pass the updated canvas reference to ensure cloud uses latest canvas
        asset.updateCanvasSize(currentCanvas);
      }
    });

    // Update moon canvas reference and scale
    if (moonInstance && moonInstance.updateCanvasSize) {
      moonInstance.updateCanvasSize(currentCanvas);
    }

    // Update ocean size if needed
    if (oceanInstance && oceanInstance.updateCanvasSize) {
      oceanInstance.updateCanvasSize(currentCanvas);
    }

    // Update sky size if needed
    if (skyInstance && skyInstance.updateCanvasSize) {
      skyInstance.updateCanvasSize(currentCanvas);
    }
  }, [width, height]);

  return (
    <canvas ref={canvasRef} width={width} height={height} id="canvas" className="canvas night" />
  );
};

export default DynamicWeather;
