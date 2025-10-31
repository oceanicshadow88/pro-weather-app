import React from 'react';
import './DashboardPage.css';

import Main from '../../components/Main/Main';
import Header from '../../components/Header/Header';
import BackGround from '../../components/BackGround';
import TimeControl from '../../components/TimeControl/TimeControl';
import '../../App.css';
import { connect } from 'react-redux';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import LoaderWeather from '../../components/LoaderWeather/LoaderWeather';

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: [],
            hasLogin: false,
            error: false,
            searchKey: 'sydney',
            timeOverride: null,
        };
        this.loadDefaultData();
    }

    handleSearchPress = (e) => {
        if (e.key === 'Enter') {
            this.setState({ isLoaded: false });
            const q = e.target.value.toLowerCase();
            getWeather(q)
                .then((response) => {
                    const convertedData = convertWeatherData(response.data);
                    convertedData.currently.summary = 'cloudy'
                    this.setState({ data: convertedData, isLoaded: true, error: false, searchKey: q });
                })
                .catch((error) => {
                    this.setState({ temp: 'Error', isLoaded: true, error: true });
                });
        }
    };

    async loadDefaultData() {
        try {
            const result = await getWeather(this.props.city);
            const convertedData = convertWeatherData(result.data);
            convertedData.currently.icon = 'cloudy'
            this.setState({ data: convertedData, isLoaded: true, error: false });
        } catch (error) {
            this.setState({ temp: 'Error', isLoaded: true, error: true });
        }
    }

    render() {
        const showCard = this.state.error ? (
            <p className="error">ERROR NOT CITY</p>
        ) : (
            <Main
                data={this.state.data}
                isLoaded={this.state.isLoaded}
                searchKey={this.state.searchKey}
                timeOverride={this.state.timeOverride}
            />
        );
        return (
            <div className="DashboardPage">
                <Header searchPressCallback={this.handleSearchPress} />
                <TimeControl onTimeChange={(timeOverride) => this.setState({ timeOverride })} />
                {!this.state.isLoaded ? (
                    <div className="loading--fixed">
                        <LoaderWeather />
                    </div>
                ) : (
                    showCard
                )}
                <BackGround />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.token !== null,
    city: state.auth.city,
});

export default connect(mapStateToProps)(DashboardPage);

