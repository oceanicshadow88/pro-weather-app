import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './Login.css';
import { connect } from 'react-redux';
import * as action from '../../store/actions';
import DynamicWeather from '../../components/DynamicWeather/DynamicWeather';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';
import logo from '../../img/weather.png';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        email: {
          elementConfig: {
            placeholder: 'Email',
          },
          validation: {
            required: true,
            isEmail: true,
          },
          errorMessage: {
            email: 'Email invalid',
            required: 'Email is required',
          },
          valid: true,
          value: '',
          cssClass: '',
          error: '',
          type: 'input',
        },
        password: {
          elementConfig: {
            placeholder: 'Password',
          },
          validation: {
            required: true,
          },
          errorMessage: {
            required: 'Password is required',
          },
          valid: true,
          value: '',
          cssClass: '',
          error: '',
          type: 'password',
        },
      },
      data: {},
      width: 0,
      height: 0,
      loading: true,
    };
    this.loadDefaultData();
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(this.success, this.error, options);
  }

  success(pos) {
    // var crd = pos.coords;
    // console.log('Your current position is:');
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
  }

  error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  async loadDefaultData() {
    try {
      const result = await getWeather('sydney');
      const convertedData = convertWeatherData(result.data);
      this.setState({ data: convertedData, loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  handleSubmit = (data, token = null) => {
    const { onAuth } = this.props;
    onAuth(data.email.value, data.password.value, token);
  };

  componentWillUnmount() {
    // window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const { isAuth, authFailTimes, openModal } = this.props;
    const { loading, width, height, data, formData } = this.state;

    if (isAuth) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <div className="login">
        {loading ? (
          ''
        ) : (
          <DynamicWeather data={data} width={parseInt(width, 10)} height={parseInt(height, 10)} />
        )}
        <FormContainer text="Sign In">
          <div className="login-img__container">
            <img src={logo} alt="weaths" className="login_img" />
          </div>
          <div className="Signup-body">
            <Form
              data={formData}
              formSubmit={this.handleSubmit}
              btnText="Login"
              validate={authFailTimes > 2}
            />
            <div className="login-fotpas" onClick={openModal}>
              <Link to="/forgot" className="switchSignup">
                Forgot Password?
              </Link>
            </div>
            <div className="switchToSignup">
              <p>Don&apost have an account ?</p>
              <Link to="/sign-up" className="switchSignup">
                <p>Sign Up</p>
              </Link>
            </div>
          </div>
        </FormContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuth: state.auth.token !== null,
  authFailTimes: state.auth.authFailTimes,
});
const mapDispatchToProps = (dispatch) => ({
  onAuth: (email, password, token) => dispatch(action.auth(email, password, false, token)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Login);
