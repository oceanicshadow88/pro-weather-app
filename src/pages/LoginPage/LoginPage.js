import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import './LoginPage.css';
import { connect } from 'react-redux';
import * as action from '../../store/actions';
import DynamicWeather from '../../components/DynamicWeather/DynamicWeather';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';
import logo from '../../img/weather.png';

const LoginPage = (props) => {
  const [formData] = useState({
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
  });
  const [data, setData] = useState({});
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(true);

  const success = (pos) => {
    // var crd = pos.coords;
    // console.log('Your current position is:');
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
  };

  const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  const loadDefaultData = async () => {
    try {
      const result = await getWeather('sydney');
      const convertedData = convertWeatherData(result.data);
      setData(convertedData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const updateWindowDimensions = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    loadDefaultData();
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    navigator.geolocation.getCurrentPosition(success, error, options);

    return () => {
      // window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  const handleSubmit = (data, token = null) => {
    const { onAuth } = props;
    onAuth(data.email.value, data.password.value, token);
  };

  const { isAuth, authFailTimes, openModal } = props;

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
            formSubmit={handleSubmit}
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
};

const mapStateToProps = (state) => ({
  isAuth: state.auth.token !== null,
  authFailTimes: state.auth.authFailTimes,
});
const mapDispatchToProps = (dispatch) => ({
  onAuth: (email, password, token) => dispatch(action.auth(email, password, false, token)),
});
export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
