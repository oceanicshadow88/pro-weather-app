import React from 'react';
import { useEffect, useState } from 'react';
import bot from '../img/wave-bot.png';
import mid from '../img/wave-bot.png';
import top from '../img/wave-bot.png';
import { getSkyGradientColors, getCurrentHour } from '../utils/skyColorsCalUtils';

function BackGround({ timeOverride = null }) {
  const Background = bot;
  const Background2 = mid;
  const Background3 = top;
  const [waveGradient, setWaveGradient] = useState('linear-gradient(to top, #253366 20%, #5374a7 80%)');

  useEffect(() => {
    const updateWaveColor = () => {
      const hour = getCurrentHour(timeOverride);
      const { topColor, bottomColor } = getSkyGradientColors(hour);
      setWaveGradient(`linear-gradient(to top, ${bottomColor} 20%, ${topColor} 80%)`);
    };

    // Update immediately
    updateWaveColor();

    // Only set up interval if no timeOverride (use real-time updates)
    // If timeOverride is set, we only update when timeOverride changes
    let interval = null;
    if (!timeOverride) {
      // Update every minute to smoothly transition colors
      interval = setInterval(updateWaveColor, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeOverride]);

  return (
    <section className="waveWrapper waveAnimation">
      <div className="waveWrapperInner bgTop" style={{ backgroundImage: waveGradient }}>
        <div className="wave waveTop" style={{ backgroundImage: `url(${Background2})` }} />
      </div>
      <div className="waveWrapperInner bgMiddle" style={{ backgroundImage: waveGradient }}>
        <div className="wave waveMiddle" style={{ backgroundImage: `url(${Background3})` }} />
      </div>
      <div className="waveWrapperInner bgBottom" style={{ backgroundImage: waveGradient }}>
        <div className="wave waveBottom" style={{ backgroundImage: `url(${Background})` }} />
      </div>
    </section>
  );
}

export default BackGround;
