import React from 'react';
import './TimeControl.css';
import { useSkyGradient } from '../../context/SkyGradientContext';

class TimeControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            enabled: false,
            skyGradientParams: {
                solarAltitudeDeg: 0, // 0 = sunset/sunrise (horizon), -6 to 0 = twilight range
                highCloudCoverage: 0.7,
                aerosolConcentration: 0.2,
                relativeHumidity: 0.4,
                isAfterRain: true,
                hasVolcanicAerosol: true,
            },
        };
    }

    static getDerivedStateFromProps(props, state) {
        // Update local state from context if needed
        return null;
    }

    componentDidMount() {
        // Initialize with current time and default params
        const { setTimeOverride, setSkyGradientParams } = this.props.skyGradientContext;
        if (setTimeOverride && setSkyGradientParams) {
            setTimeOverride(null); // Start with null (real time)
            setSkyGradientParams(this.state.skyGradientParams);
        }
    }

    handleHourChange = (e) => {
        const hour = parseInt(e.target.value, 10);
        if (hour >= 0 && hour <= 23) {
            this.setState({ hour });
            this.updateTime(hour, this.state.minute, this.state.enabled, this.state.skyGradientParams);
        }
    };

    handleMinuteChange = (e) => {
        const minute = parseInt(e.target.value, 10);
        if (minute >= 0 && minute <= 59) {
            this.setState({ minute });
            this.updateTime(this.state.hour, minute, this.state.enabled, this.state.skyGradientParams);
        }
    };

    handleToggle = (e) => {
        const enabled = e.target.checked;
        this.setState({ enabled });
        this.updateTime(this.state.hour, this.state.minute, enabled, this.state.skyGradientParams);
    };

    handleReset = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        this.setState({ hour, minute, enabled: false });
        this.updateTime(hour, minute, false, this.state.skyGradientParams);
    };

    handleSkyParamChange = (paramName, value) => {
        const newParams = {
            ...this.state.skyGradientParams,
            [paramName]: typeof value === 'boolean' ? value : parseFloat(value),
        };
        this.setState({ skyGradientParams: newParams });
        this.updateTime(this.state.hour, this.state.minute, this.state.enabled, newParams);
    };

    updateTime = (hour, minute, enabled, skyGradientParams) => {
        const { setTimeOverride, setSkyGradientParams } = this.props.skyGradientContext;
        if (setTimeOverride && setSkyGradientParams) {
            // Update context with new values
            setSkyGradientParams(skyGradientParams || this.state.skyGradientParams);
            if (enabled) {
                setTimeOverride({ hour, minute });
            } else {
                setTimeOverride(null); // null means use real time
            }
        }
    };

    render() {
        const { hour, minute, enabled, skyGradientParams } = this.state;

        return (
            <div className="time-control">
                <div className="time-control__header">
                    <h3>Time Control</h3>
                    <label className="time-control__toggle">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={this.handleToggle}
                        />
                        <span>Override Time</span>
                    </label>
                </div>
                <div className="time-control__inputs">
                    <div className="time-control__input-group">
                        <label htmlFor="hour">Hour</label>
                        <input
                            id="hour"
                            type="number"
                            min="0"
                            max="23"
                            value={hour}
                            onChange={this.handleHourChange}
                            disabled={!enabled}
                            className="time-control__input"
                        />
                    </div>
                    <div className="time-control__input-group">
                        <label htmlFor="minute">Minute</label>
                        <input
                            id="minute"
                            type="number"
                            min="0"
                            max="59"
                            value={minute}
                            onChange={this.handleMinuteChange}
                            disabled={!enabled}
                            className="time-control__input"
                        />
                    </div>
                </div>
                <div className="time-control__section">
                    <h4 className="time-control__section-title">Sky Gradient Parameters</h4>
                    <div className="time-control__input-group">
                        <label htmlFor="solarAltitudeDeg">Solar Altitude (deg)</label>
                        <input
                            id="solarAltitudeDeg"
                            type="number"
                            step="0.1"
                            value={skyGradientParams.solarAltitudeDeg}
                            onChange={(e) => this.handleSkyParamChange('solarAltitudeDeg', e.target.value)}
                            className="time-control__input"
                        />
                    </div>
                    <div className="time-control__input-group">
                        <label htmlFor="highCloudCoverage">High Cloud Coverage</label>
                        <input
                            id="highCloudCoverage"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={skyGradientParams.highCloudCoverage}
                            onChange={(e) => this.handleSkyParamChange('highCloudCoverage', e.target.value)}
                            className="time-control__input"
                        />
                    </div>
                    <div className="time-control__input-group">
                        <label htmlFor="aerosolConcentration">Aerosol Concentration</label>
                        <input
                            id="aerosolConcentration"
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={skyGradientParams.aerosolConcentration}
                            onChange={(e) => this.handleSkyParamChange('aerosolConcentration', e.target.value)}
                            className="time-control__input"
                        />
                    </div>
                    <div className="time-control__input-group">
                        <label htmlFor="relativeHumidity">Relative Humidity</label>
                        <input
                            id="relativeHumidity"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={skyGradientParams.relativeHumidity}
                            onChange={(e) => this.handleSkyParamChange('relativeHumidity', e.target.value)}
                            className="time-control__input"
                        />
                    </div>
                    <div className="time-control__input-group">
                        <label className="time-control__checkbox-label">
                            <input
                                type="checkbox"
                                checked={skyGradientParams.isAfterRain}
                                onChange={(e) => this.handleSkyParamChange('isAfterRain', e.target.checked)}
                                className="time-control__checkbox"
                            />
                            <span>After Rain</span>
                        </label>
                    </div>
                    <div className="time-control__input-group">
                        <label className="time-control__checkbox-label">
                            <input
                                type="checkbox"
                                checked={skyGradientParams.hasVolcanicAerosol}
                                onChange={(e) => this.handleSkyParamChange('hasVolcanicAerosol', e.target.checked)}
                                className="time-control__checkbox"
                            />
                            <span>Volcanic Aerosol</span>
                        </label>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={this.handleReset}
                    className="time-control__reset"
                >
                    Reset to Current Time
                </button>
                {enabled && (
                    <div className="time-control__preview">
                        Override: {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                    </div>
                )}
                {!enabled && (
                    <div className="time-control__preview">
                        Using Real Time
                    </div>
                )}
            </div>
        );
    }
}

// Wrapper component to inject context into class component
const TimeControlWithContext = () => {
    const skyGradientContext = useSkyGradient();
    return <TimeControl skyGradientContext={skyGradientContext} />;
};

export default TimeControlWithContext;

