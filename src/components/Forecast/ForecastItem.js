import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import moment from 'moment';
import { getSkyTopColor, darkenColor, getCurrentHour } from '../../utils/skyColorsCalUtils';

const weatherMapping = {
  'clear-day': 'CLEAR_DAY',
  'partly-cloudy-day': 'PARTLY_CLOUDY_DAY',
  cloudy: 'CLOUDY',
  rain: 'RAIN',
  wind: 'WIND',
  fog: 'FOG',
  snow: 'SNOW',
};

const dayMapping = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const ForecastItem = (props) => {
  const { data, skyColor } = props;

  // Use provided skyColor or calculate from current time
  const baseSkyColor = skyColor || getSkyTopColor(getCurrentHour(null));

  // Darken slightly for better visibility (15% darker)
  const iconColor = darkenColor(baseSkyColor, 0.15);

  return (
    <div className="forecast-container align--center">
      <h2 className="card__forecast-day">{dayMapping[moment.unix(data.time).day()]}</h2>
      <ReactAnimatedWeather
        icon={weatherMapping[data.icon]}
        color={iconColor}
        size={50}
        animate
        className="weather"
      />
      <div className="flex temp">
        <p className="card__forecast-temperature">{parseInt(data.temperatureMax, 10)}°</p>
        <p className="card__forecast-temperature color--low">
          {' '}
          {parseInt(data.temperatureMin, 10)}°
        </p>
      </div>
    </div>
  );
};

export default ForecastItem;
