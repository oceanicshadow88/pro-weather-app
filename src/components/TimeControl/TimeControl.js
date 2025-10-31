import React from 'react';
import './TimeControl.css';

class TimeControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            enabled: false,
        };
    }

    componentDidMount() {
        // Initialize with current time
        if (this.props.onTimeChange) {
            this.props.onTimeChange(null); // Start with null (real time)
        }
    }

    handleHourChange = (e) => {
        const hour = parseInt(e.target.value, 10);
        if (hour >= 0 && hour <= 23) {
            this.setState({ hour });
            this.updateTime(hour, this.state.minute, this.state.enabled);
        }
    };

    handleMinuteChange = (e) => {
        const minute = parseInt(e.target.value, 10);
        if (minute >= 0 && minute <= 59) {
            this.setState({ minute });
            this.updateTime(this.state.hour, minute, this.state.enabled);
        }
    };

    handleToggle = (e) => {
        const enabled = e.target.checked;
        this.setState({ enabled });
        this.updateTime(this.state.hour, this.state.minute, enabled);
    };

    handleReset = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        this.setState({ hour, minute, enabled: false });
        this.updateTime(hour, minute, false);
    };

    updateTime = (hour, minute, enabled) => {
        if (this.props.onTimeChange) {
            if (enabled) {
                this.props.onTimeChange({ hour, minute });
            } else {
                this.props.onTimeChange(null); // null means use real time
            }
        }
    };

    render() {
        const { hour, minute, enabled } = this.state;

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

export default TimeControl;

