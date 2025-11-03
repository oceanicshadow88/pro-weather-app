import React from 'react';
import { useEffect, useState } from 'react';
import './Loading.css';
import { getSkyBottomColor, getCurrentHour } from '../../utils/skyColorsCalUtils';
import { useSkyGradient } from '../../context/SkyGradientContext';

const Loading = () => {
  const { timeOverride, skyGradientParams } = useSkyGradient();
  const [rippleColor, setRippleColor] = useState('#6B2AF1');

  useEffect(() => {
    const updateColor = () => {
      const hour = getCurrentHour(timeOverride);
      const skyColor = getSkyBottomColor(hour, skyGradientParams);
      setRippleColor(skyColor);
    };

    updateColor();

    let interval = null;
    if (!timeOverride) {
      interval = setInterval(updateColor, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeOverride, skyGradientParams]);

  return (
    <div className="loading-container">
      <div className="multi-ripple">
        <span style={{ borderColor: rippleColor }} />
        <span style={{ borderColor: rippleColor }} />
      </div>
    </div>
  );
};
export default Loading;
