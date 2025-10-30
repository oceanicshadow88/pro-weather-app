import React from 'react';
import './Weather.css';

import Main from '../../components/Card/Main';
import Header from '../../components/Header/Header';
import BackGround from '../../components/BackGround';
import '../../App.css';
import { connect } from 'react-redux';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import LoaderWeather from '../../components/LoaderWeather/LoaderWeather';

class Weather extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data: [],
      hasLogin: false,
      error: false,
      searchKey: 'sydney',
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
      />
    );
    return (
      <div className="Weather">
        <Header searchPressCallback={this.handleSearchPress} />
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

export default connect(mapStateToProps)(Weather);
