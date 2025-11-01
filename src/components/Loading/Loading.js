import React from 'react';
import { useEffect, useState } from 'react';
import './Loading.css';
import { getSkyTopColor, getCurrentHour } from '../../utils/skyColorsCalUtils';

const Loading = ({ timeOverride = null }) => {
  const [rippleColor, setRippleColor] = useState('#6B2AF1');

  useEffect(() => {
    const updateColor = () => {
      const hour = getCurrentHour(timeOverride);
      const skyColor = getSkyTopColor(hour);
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
  }, [timeOverride]);

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
