import React from 'react';
import uuid from 'react-uuid';
import ForecastItem from './ForecastItem';
import './Forecast.css';
import { getSkyTopColor, getCurrentHour } from '../../utils/skyColorsCalUtils';

const Forecast = (props) => {
  const { data, timeOverride, skyGradientParams } = props;

  // Get sky color based on current time or timeOverride
  const currentHour = getCurrentHour(timeOverride);
  const skyColor = getSkyTopColor(currentHour, skyGradientParams);

  const daily = data.daily.data.map((item) => (
    <ForecastItem key={uuid()} data={item} skyColor={skyColor} skyGradientParams={skyGradientParams} />
  ));

  return <section className="card__forecast flex space-between flex-warp">{daily}</section>;
};

export default Forecast;
