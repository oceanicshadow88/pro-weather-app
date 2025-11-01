import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

import Main from '../../components/Main/Main';
import Header from '../../components/Header/Header';
import BackGround from '../../components/BackGround';
import TimeControl from '../../components/TimeControl/TimeControl';
import '../../App.css';
import { connect } from 'react-redux';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import LoaderWeather from '../../components/LoaderWeather/LoaderWeather';

const DashboardPage = (props) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);
    const [searchKey, setSearchKey] = useState('sydney');
    const [timeOverride, setTimeOverride] = useState(null);

    const loadDefaultData = async () => {
        try {
            const result = await getWeather(props.city);
            const convertedData = convertWeatherData(result.data);
            convertedData.currently.icon = 'cloudy'
            setData(convertedData);
            setIsLoaded(true);
            setError(false);
        } catch (error) {
            setData('Error');
            setIsLoaded(true);
            setError(true);
        }
    };

    useEffect(() => {
        loadDefaultData();
    }, [props.city]);

    const handleSearchPress = (e) => {
        if (e.key === 'Enter') {
            setIsLoaded(false);
            const q = e.target.value.toLowerCase();
            getWeather(q)
                .then((response) => {
                    const convertedData = convertWeatherData(response.data);
                    convertedData.currently.summary = 'cloudy'
                    setData(convertedData);
                    setIsLoaded(true);
                    setError(false);
                    setSearchKey(q);
                })
                .catch((error) => {
                    setData('Error');
                    setIsLoaded(true);
                    setError(true);
                });
        }
    };

    const showCard = error ? (
        <p className="error">ERROR NOT CITY</p>
    ) : (
        <Main
            data={data}
            isLoaded={isLoaded}
            searchKey={searchKey}
            timeOverride={timeOverride}
        />
    );

    return (
        <div className="DashboardPage">
            <Header searchPressCallback={handleSearchPress} />
            <TimeControl onTimeChange={(timeOverride) => setTimeOverride(timeOverride)} />
            {!isLoaded ? (
                <div className="loading--fixed">
                    <LoaderWeather />
                </div>
            ) : (
                showCard
            )}
            <BackGround timeOverride={timeOverride} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.token !== null,
    city: state.auth.city,
});

export default connect(mapStateToProps)(DashboardPage);

