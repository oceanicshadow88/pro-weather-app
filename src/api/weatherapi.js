import axios from 'axios';

/**
 * Maps OpenWeatherMap icon codes to DarkSky-style icon names
 */
const mapWeatherIcon = (iconCode) => {
  const iconMap = {
    // Clear sky
    '01d': 'clear-day',
    '01n': 'clear-night',
    // Few clouds
    '02d': 'partly-cloudy-day',
    '02n': 'partly-cloudy-night',
    // Scattered clouds
    '03d': 'cloudy',
    '03n': 'cloudy',
    // Broken clouds
    '04d': 'cloudy',
    '04n': 'cloudy',
    // Shower rain
    '09d': 'rain',
    '09n': 'rain',
    // Rain
    '10d': 'rain',
    '10n': 'rain',
    // Thunderstorm
    '11d': 'rain',
    '11n': 'rain',
    // Snow
    '13d': 'snow',
    '13n': 'snow',
    // Mist/Fog
    '50d': 'fog',
    '50n': 'fog',
  };
  return iconMap[iconCode] || 'cloudy';
};

/**
 * Converts OpenWeatherMap API response to the old format expected by components
 */
export const convertWeatherData = (openWeatherResponse) => {
  if (!openWeatherResponse || !openWeatherResponse.list || openWeatherResponse.list.length === 0) {
    throw new Error('Invalid weather data');
  }

  const { list, city } = openWeatherResponse;

  // Get current weather from the first forecast item
  const current = list[0];
  const currentWeather = current.weather[0];

  // Convert currently object
  const currently = {
    temperature: Math.round(current.main.temp - 273.15), // Kelvin to Celsius
    summary: currentWeather.description,
    icon: mapWeatherIcon(currentWeather.icon),
    humidity: current.main.humidity / 100, // Convert percentage to decimal
    windSpeed: current.wind.speed, // Already in m/s
    time: current.dt,
  };

  // Group forecasts by day and calculate daily max/min
  const dailyForecasts = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    const tempCelsius = item.main.temp - 273.15;

    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        time: item.dt,
        icon: mapWeatherIcon(item.weather[0].icon),
        temperatureMax: tempCelsius,
        temperatureMin: tempCelsius,
        date,
      };
    } else {
      dailyForecasts[dayKey].temperatureMax = Math.max(
        dailyForecasts[dayKey].temperatureMax,
        tempCelsius
      );
      dailyForecasts[dayKey].temperatureMin = Math.min(
        dailyForecasts[dayKey].temperatureMin,
        tempCelsius
      );
    }
  });

  // Convert to array, sort by date, limit to 5 days, and round temps
  const dailyData = Object.values(dailyForecasts)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)
    .map((day) => ({
      time: day.time,
      icon: day.icon,
      temperatureMax: Math.round(day.temperatureMax),
      temperatureMin: Math.round(day.temperatureMin),
    }));

  // Create timezone string from city name (formatted for component display)
  // Component expects format like "Continent/City" and extracts City for display
  const timezone = city.name
    ? `Location/${city.name.replace(/\s+/g, '_')}`
    : 'Location/Unknown';

  return {
    currently,
    daily: {
      data: dailyData,
    },
    timezone,
  };
};

// eslint-disable-next-line import/prefer-default-export
export const getWeather = (city) =>
  axios.get(
    'https://api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=d124156a6891227117a47c8c985555e7',
  );
