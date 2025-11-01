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
import Sun from './Sun/Sun';
import Ocean from './Ocean/Ocean';
import Sky from './Sky/Sky';
import Airplane from './Airplane/Airplane';

const assets = [];

let canvas = false;
let context = false;
const timers = {};
let moonInstance = null; // Store reference to moon for position updates
let sunInstance = null; // Store reference to sun for position updates
let weatherDataRef = null; // Store reference to weather data
let oceanInstance = null; // Store reference to ocean
let skyInstance = null; // Store reference to sky

// Helper function to get current hour (with minute consideration)
// timeOverride: { hour: 0-23, minute: 0-59 } or null
const getCurrentHour = (timeOverride) => {
  if (timeOverride && typeof timeOverride === 'object' && timeOverride.hour !== undefined) {
    // Use hour from override, with minute fraction for smoother transitions
    return timeOverride.hour + (timeOverride.minute || 0) / 60;
  }
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
};

// Helper function to get current hour as integer (for day/night checks)
const getCurrentHourInt = (timeOverride) => {
  if (timeOverride && typeof timeOverride === 'object' && timeOverride.hour !== undefined) {
    return timeOverride.hour;
  }
  return new Date().getHours();
};

/**
 * Calculate sun position based on hour of day
 * Sun shows during 5am-7pm (5-19)
 * Journey:
 * 5:00 AM = bottom (below screen or just visible)
 * 12:00 PM (noon) = top
 * 7:00 PM = bottom (below screen or just visible)
 */
const calculateSunPosition = (hour, sunRadius = 50, currentCanvas = null) => {
  // Use provided canvas or fallback to module-level canvas
  const canvasToUse = currentCanvas || canvas;
  if (!canvasToUse) {
    // Return default position if canvas not ready
    return { x: 100, y: 100 };
  }

  let progress = 0;

  if (hour >= 5 && hour < 12) {
    // 5am-12pm: bottom to top (progress 1 to 0)
    // At 5 AM: progress = 1 (bottom)
    // At 12 PM: progress = 0 (top)
    progress = 1 - (hour - 5) / 7;
  } else if (hour >= 12 && hour < 19) {
    // 12pm-7pm: top to bottom (progress 0 to 1)
    // At 12 PM: progress = 0 (top)
    // At 7 PM: progress = 1 (bottom)
    progress = (hour - 12) / 7;
  } else {
    // Outside sun hours (shouldn't happen, but set to bottom)
    progress = 1;
  }

  // Clamp progress between 0 and 1
  progress = Math.max(0, Math.min(1, progress));

  // Calculate x and y positions (to the left of city name)
  const canvasWidth = canvasToUse.width || canvasToUse.clientWidth || 948;
  const cityLocationRight = canvasWidth;
  const estimatedCityNameWidth = 200;
  const spacing = 30;
  const x = Math.max(sunRadius + 10, cityLocationRight - estimatedCityNameWidth - spacing - sunRadius);

  const canvasHeight = canvasToUse.height || 350;
  const topPadding = sunRadius - 20;
  const bottomPadding = canvasHeight + sunRadius - 50; // Allow sun to go below screen (negative y or beyond canvas)

  // Progress 0 = top, Progress 1 = bottom (below screen)
  // When progress = 1, sun should be below the visible canvas
  const yRange = bottomPadding - topPadding;
  const y = topPadding + (yRange * progress);

  return { x, y };
};

/**
 * Calculate moon position based on hour of day
 * Moon shows during 7pm-5am (19-24, 0-5)
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
  const topPadding = moonRadius - 20; // Allow moon to go above screen
  const bottomPadding = canvasHeight + moonRadius; // Allow moon to go below screen

  // Progress 0 = top (above screen), Progress 1 = bottom (below screen)
  const yRange = bottomPadding - topPadding;
  const y = topPadding + (yRange * progress);

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


const preLoadImageAssets = (callback, cleanupRef = null) => {
  let imageAssetsCount = 0;
  let imageAssetsLoadedCount = 0;
  let isCancelled = false;

  if (imageAssetsLoaded) {
    if (callback && !isCancelled) {
      callback();
    }
    return () => { }; // Return empty cleanup function
  }

  const cleanupFunctions = [];

  const loadedHandler = () => {
    if (isCancelled) return;
    imageAssetsLoadedCount += 1;
    if (imageAssetsLoadedCount === imageAssetsCount) {
      imageAssetsLoaded = true;
      if (callback && !isCancelled) {
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

    // Store cleanup function to remove onload handler
    cleanupFunctions.push(() => {
      if (imageAsset.image) {
        imageAsset.image.onload = null;
      }
    });
  }

  // Return cleanup function
  const cleanup = () => {
    isCancelled = true;
    cleanupFunctions.forEach(fn => fn());
  };

  // Store cleanup ref if provided
  if (cleanupRef) {
    cleanupRef.current = cleanup;
  }

  return cleanup;
};

const DynamicWeather = ({ data, width, height, timeOverride = null }) => {
  const canvasRef = useRef(null);
  const animateRef = useRef(null);
  const spawnFunctionsRef = useRef(null);
  const timeOverrideRef = useRef(timeOverride);
  const animationFrameIdRef = useRef(null);
  const isMountedRef = useRef(true); // Track if component is mounted
  const imageCleanupRef = useRef(null); // Cleanup function for image loading
  const hasStartedAnimationRef = useRef(false); // Track if animation has been started

  // Update timeOverride ref when prop changes
  useEffect(() => {
    timeOverrideRef.current = timeOverride;
  }, [timeOverride]);

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

  const spawnAirplane = () => {
    if (!canvas || !context) return;

    // Spawn airplane (flies from right to left, takes 10 seconds)
    const airplane = new Airplane(canvas, context);
    assets.push(airplane);

    // Schedule next airplane in 15 seconds
    timers.airplane = setTimeout(spawnAirplane, 150000);
  };

  const spawnSun = () => {
    // Only spawn sun if it doesn't already exist
    if (sunInstance) {
      return;
    }
    if (!canvas) {
      console.warn('Cannot spawn sun: canvas not ready');
      return;
    }

    const weatherData = weatherDataRef || data;
    if (!weatherData || !weatherData.currently) {
      console.warn('Cannot spawn sun: weather data not ready');
      return;
    }

    // Use real-time hour for sun position (sun shows 5am-7pm)
    const currentHour = getCurrentHour(timeOverrideRef.current);
    const sunRadius = 30; // Base size (scales with canvas)

    let x, y;
    if (canvas.width && canvas.height) {
      const pos = calculateSunPosition(currentHour, sunRadius, canvas);
      x = pos.x;
      y = pos.y;
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
        console.warn('Sun position off-screen, using center:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
        x = canvas.width / 2;
        y = canvas.height / 2;
      }
    } else {
      x = 400;
      y = 200;
    }

    console.log('Spawning sun:', { x, y, sunRadius, currentHour, canvasWidth: canvas.width, canvasHeight: canvas.height });

    sunInstance = new Sun(canvas, context, x, y, sunRadius);
    assets.push(sunInstance);
    console.log('Sun spawned successfully, assets count:', assets.length, 'sunInstance:', !!sunInstance);
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

    // Use real-time hour for moon position (moon shows 7pm-5am)
    const currentHour = getCurrentHour(timeOverrideRef.current);
    const moonRadius = 30; // Base size (scales with canvas)

    // Try center position first to ensure it's visible, then use calculated position
    let x, y;
    if (canvas.width && canvas.height) {
      const pos = calculateMoonPosition(currentHour, moonRadius, canvas);
      x = pos.x;
      y = pos.y;
      // Moon can be off-screen (above or below canvas) - that's expected behavior
      // Only warn if x is off-screen (which shouldn't happen)
      if (x < 0 || x > canvas.width) {
        console.warn('Moon x position off-screen, using center:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
        x = canvas.width / 2;
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
    'clear-day': [spawnCloud],
    'partly-cloudy-day': [spawnCloud],
    'partly-cloudy-night': [spawnCloud],
    cloudy: [spawnCloud],
    'clear-night': [spawnCloud],
    rain: [spawnRain],
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
    moonInstance = null;
    sunInstance = null;
    oceanInstance = null;
    skyInstance = null;
    // Update data reference
    weatherDataRef = data;
    // start spawning
    beginSpawning();
  };

  const beginSpawning = () => {
    // Don't manually trigger animation - it's already running in the loop
    // animateRef.current() would cause double execution
    if (!hasStartedAnimationRef.current && animateRef.current) {
      hasStartedAnimationRef.current = true;
    }
    spawnCloud();

    // Start airplane spawning (every 15 seconds)
    spawnAirplane();

    // Spawn sun or moon based on time of day
    const currentHour = getCurrentHourInt(timeOverrideRef.current);
    if (currentHour >= 5 && currentHour < 19) {
      // Daytime: 5am-7pm - show sun
      spawnSun();
      // Remove moon if it exists
      if (moonInstance) {
        const index = assets.indexOf(moonInstance);
        if (index > -1) assets.splice(index, 1);
        moonInstance = null;
      }
    } else {
      // Nighttime: 7pm-5am - show moon
      spawnMoon();
      // Remove sun if it exists
      if (sunInstance) {
        const index = assets.indexOf(sunInstance);
        if (index > -1) assets.splice(index, 1);
        sunInstance = null;
      }
    }

    // Spawn sky background
    const currentHourFloat = getCurrentHour(timeOverrideRef.current);
    skyInstance = new Sky(canvas, context, currentHourFloat);
    assets.push(skyInstance);

    // Spawn ocean at the bottom
    oceanInstance = new Ocean(canvas, context, currentHourFloat);
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

    // Mark component as mounted
    isMountedRef.current = true;

    const animate = () => {
      // Stop animation if component is unmounted
      if (!isMountedRef.current) {
        return;
      }
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

        // Update moon and sun canvas references and scale
        if (moonInstance && moonInstance.updateCanvasSize) {
          moonInstance.updateCanvasSize(canvas);
        }
        if (sunInstance && sunInstance.updateCanvasSize) {
          sunInstance.updateCanvasSize(canvas);
        }
      }

      // Get current hour for sun/moon positioning and sky/ocean colors
      const currentHour = getCurrentHourInt(timeOverrideRef.current);
      const currentHourFloat = getCurrentHour(timeOverrideRef.current);

      // Update sun or moon based on time of day
      if (currentHour >= 5 && currentHour < 19) {
        // Daytime: update sun position
        if (!sunInstance && canvas) {
          spawnSun();
        }
        if (sunInstance && canvas) {
          const targetPos = calculateSunPosition(currentHourFloat, sunInstance.sunRadius, canvas);
          sunInstance.x = targetPos.x;
          const yVelocity = 0.1;
          const yDiff = targetPos.y - sunInstance.y;
          if (Math.abs(yDiff) > 0.5) {
            sunInstance.y += yDiff * yVelocity;
          } else {
            sunInstance.y = targetPos.y;
          }
        }
        // Remove moon if it exists during day
        if (moonInstance) {
          const index = assets.indexOf(moonInstance);
          if (index > -1) assets.splice(index, 1);
          moonInstance = null;
        }
      } else {
        // Nighttime: update moon position
        if (!moonInstance && canvas) {
          spawnMoon();
        }
        if (moonInstance && canvas) {
          const targetPos = calculateMoonPosition(currentHourFloat, moonInstance.moonRadius, canvas);
          moonInstance.x = targetPos.x;
          const yVelocity = 0.1;
          const yDiff = targetPos.y - moonInstance.y;
          if (Math.abs(yDiff) > 0.5) {
            moonInstance.y += yDiff * yVelocity;
          } else {
            moonInstance.y = targetPos.y;
          }
        }
        // Remove sun if it exists during night
        if (sunInstance) {
          const index = assets.indexOf(sunInstance);
          if (index > -1) assets.splice(index, 1);
          sunInstance = null;
        }
      }

      // Update sky and ocean hour for color changes (use float for smoother transitions)
      if (skyInstance) {
        skyInstance.updateHour(currentHourFloat);
      }
      if (oceanInstance) {
        oceanInstance.updateHour(currentHourFloat);
      }

      // Draw sky background FIRST (sunset/sunrise/day/night)
      if (skyInstance) {
        skyInstance.draw();
      }

      // ALWAYS draw sun/moon BEFORE ocean (behind ocean) - no conditions
      if (sunInstance) {
        const drawResult = sunInstance.draw();
        if (!drawResult) {
          console.warn('Sun draw returned false');
        }
      }
      if (moonInstance) {
        const drawResult = moonInstance.draw();
        if (!drawResult) {
          console.warn('Moon draw returned false');
        }
      }

      // Draw ocean (always drawn after sun/moon so it appears in front)
      if (oceanInstance) {
        oceanInstance.draw();
      }

      // Draw each asset, if false, remove particle from assets
      // Skip sun/moon instances since we already drew them above
      for (let i = 0, n = assets.length; i < n; i += 1) {
        const asset = assets[i];
        // Skip if it's the sun/moon (already drawn) or sky/ocean (already drawn)
        if (asset === sunInstance || asset === moonInstance || asset === skyInstance || asset === oceanInstance) {
          continue;
        }
        if (!asset.draw()) {
          assets.splice(i, 1);
          n -= 1;
          i -= 1;
        }
      }

      animationFrameIdRef.current = window.requestAnimationFrame(animate);
    };

    animateRef.current = animate;
    hasStartedAnimationRef.current = false;

    // Start the animation loop
    animationFrameIdRef.current = window.requestAnimationFrame(animate);

    // Load images and start spawning (only call setConditionReady once)
    const imageCleanup = preLoadImageAssets(() => {
      if (isMountedRef.current) {
        setConditionReady();
      }
    }, imageCleanupRef);

    // Also call setConditionReady immediately if images already loaded
    setConditionReady();

    // Cleanup
    return () => {
      // Mark component as unmounted to stop animation loop
      isMountedRef.current = false;
      hasStartedAnimationRef.current = false;

      // Cleanup image loading handlers
      if (imageCleanupRef.current) {
        imageCleanupRef.current();
        imageCleanupRef.current = null;
      }
      if (imageCleanup) {
        imageCleanup();
      }

      // Cancel animation frame
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
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

      // Clear assets array completely
      assets.length = 0;

      // Reset all instance references
      moonInstance = null;
      sunInstance = null;
      oceanInstance = null;
      skyInstance = null;
      weatherDataRef = null;

      // Clear canvas and context references
      canvas = false;
      context = false;

      // Clear animate ref
      animateRef.current = null;
    };
  }, [data]); // Re-run when data changes

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

    // Update moon and sun canvas references and scale
    if (moonInstance && moonInstance.updateCanvasSize) {
      moonInstance.updateCanvasSize(currentCanvas);
    }
    if (sunInstance && sunInstance.updateCanvasSize) {
      sunInstance.updateCanvasSize(currentCanvas);
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
