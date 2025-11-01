import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import './SignUpPage.css';
import { connect } from 'react-redux';
import * as action from '../../store/actions';
import DynamicWeather from '../../components/DynamicWeather/DynamicWeather';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';
import logo from '../../img/weather.png';

const SignUpPage = (props) => {
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
        email: 'Not valid Email',
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
        min: 7,
      },
      errorMessage: {
        required: 'Password is required',
        min: 'Password is minimum length is 7',
      },
      valid: true,
      value: '',
      cssClass: '',
      error: '',
      type: 'password',
    },
    city: {
      elementConfig: {
        placeholder: 'City',
      },
      validation: {
        required: true,
      },
      errorMessage: {
        required: 'City is required',
      },
      valid: true,
      value: '',
      cssClass: '',
      error: '',
      type: 'input',
    },
  });
  const [data, setData] = useState({});
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(true);

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

    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  const handleSubmit = (data, token) => {
    props.onSignUp(data.email.value, data.password.value, data.city.value, token);
  };

  if (props.isAuth) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="sign-up">
      {loading ? (
        <img
          className="background__img"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFUoOzaBd_QpPk6HpTIOZZYXdqVUQJur72g&usqp=CAU"
          alt="bg"
        />
      ) : (
        <DynamicWeather data={data} width={parseInt(width, 10)} height={parseInt(height, 10)} />
      )}
      <FormContainer text="Sign Up">
        <div className="login-img__container">
          <img src={logo} alt="weaths" className="login_img" />
        </div>
        <div className="Signup-body">
          <Form data={formData} formSubmit={handleSubmit} btnText="Sign Up" validate />
          <div className="switchToSignup">
            <p>Don't have an account ?</p>
            <Link to="/login" className="switchSignup">
              <p>Sign In</p>
            </Link>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  error: state.auth.error,
  isAuth: state.auth.token !== null,
});
const mapDispatchToProps = (dispatch) => ({
  onAuth: (email, password, token) => dispatch(action.auth(email, password, true, token)),
  onSignUp: (email, password, city, token) =>
    dispatch(action.signUp(email, password, city, true, token)),
});
export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage);
