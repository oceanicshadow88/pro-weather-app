import React, { useState } from 'react';
import './TodayWeatherCard.css';
import DynamicWeather from '../DynamicWeather/DynamicWeather';

const TodayWeatherCard = (props) => {
    const [elementHeight, setElementHeight] = useState(0);
    const [elementWidth, setElementWidth] = useState(0);

    const getHeight = (element) => {
        if (element && !elementHeight) {
            // need to check that we haven't already set the height or we'll create an infinite render loop
            setElementHeight(element.clientHeight);
            setElementWidth(element.clientWidth);
        }
    };

    const { data, timeOverride, skyGradientParams } = props;

    return (
        <section className="card__current" ref={getHeight}>
            <DynamicWeather
                data={data}
                height={parseInt(elementHeight, 10)}
                width={parseInt(elementWidth, 10)}
                timeOverride={timeOverride}
                skyGradientParams={skyGradientParams}
            />
            <div className="card__current-temperature">
                <div className="center">
                    <span>
                        {parseInt(data.currently.temperature, 10)}°
                    </span>
                </div>
                <div className="center">
                    <p className="clear-margin clear-padding card_current_summary">{data.currently.summary}</p>
                </div>
                <ul className="card__current-details-list flex space-between list-style--disable center">
                    <li className="card__current-details">
                        <p>HUMIDITY</p>
                        <p>{parseInt(data.currently.humidity * 100, 10)}%</p>
                    </li>
                    <li className="card__current-details">
                        <p>WIND</p>
                        <p>{data.currently.windSpeed} m/s</p>
                    </li>
                </ul>
            </div>
            <div className="card__current-location">
                <p className="card__current-country">{data.timezone.split('/')[1].replace('_', ' ')}</p>
            </div>
        </section>
    );
};

export default TodayWeatherCard;

