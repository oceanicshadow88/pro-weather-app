import React from 'react';
import './TodayWeatherCard.css';
import DynamicWeather from '../DynamicWeather/DynamicWeather';

class TodayWeatherCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            elementHeight: 0,
            elementWidth: 0,
        };
    }

    getHeight = (element) => {
        const { elementHeight } = this.state;
        if (element && !elementHeight) {
            // need to check that we haven't already set the height or we'll create an infinite render loop
            this.setState({ elementHeight: element.clientHeight, elementWidth: element.clientWidth });
        }
    };

    render() {
        const { data } = this.props;
        const { elementWidth, elementHeight } = this.state;
        return (
            <section className="card__current" ref={this.getHeight}>
                <DynamicWeather
                    data={data}
                    height={parseInt(elementHeight, 10)}
                    width={parseInt(elementWidth, 10)}
                    timeOverride={this.props.timeOverride}
                />
                <div className="card__current-temperature">
                    <div className="center">
                        <span className="card__current-temperature">
                            {parseInt(data.currently.temperature, 10)}°
                        </span>
                    </div>
                    <div className="center">
                        <p><span className="card__current-weather">{data.currently.summary}</span></p>
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
    }
}

export default TodayWeatherCard;

