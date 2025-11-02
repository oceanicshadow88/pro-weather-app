import React from 'react';
import TodayWeatherCard from '../TodayWeatherCard/TodayWeatherCard';
import Forecast from '../Forecast/Forecast';
import SocialMedia from '../SoicalMedia/SocialMedia';
import '../Greeting';
import Spinner from '../UI/Spinner';

function Main(props) {
    let data = <Spinner />;
    if (props.isLoaded) {
        data = (
            <main className="card__main fade-in">
                <TodayWeatherCard data={props.data} timeOverride={props.timeOverride} skyGradientParams={props.skyGradientParams} />
                <div className="flex detail-info-container flex-warp">
                    <SocialMedia data={props.data} searchKey={props.searchKey} timeOverride={props.timeOverride} />
                    <Forecast data={props.data} timeOverride={props.timeOverride} skyGradientParams={props.skyGradientParams} />
                </div>
            </main>
        );
    }
    return data;
}

export default Main;

