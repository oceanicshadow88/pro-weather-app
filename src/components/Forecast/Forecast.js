import React from 'react';
import uuid from 'react-uuid';
import ForecastItem from './ForecastItem';
import './Forecast.css';
import { getSkyBottomColor, getCurrentHour } from '../../utils/skyColorsCalUtils';
import { useSkyGradient } from '../../context/SkyGradientContext';

const Forecast = (props) => {
  const { data } = props;
  const { timeOverride, skyGradientParams } = useSkyGradient();

  // Get sky color based on current time or timeOverride - use bottom color (horizon) for icons
  const currentHour = getCurrentHour(timeOverride);
  const skyColor = getSkyBottomColor(currentHour, skyGradientParams);

  const daily = data.daily.data.map((item) => (
    <ForecastItem key={uuid()} data={item} skyColor={skyColor} />
  ));

  return <section className="card__forecast flex space-between flex-warp">{daily}</section>;
};

export default Forecast;
