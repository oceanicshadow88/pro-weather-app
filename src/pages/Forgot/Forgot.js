import React from 'react';
import { Link } from 'react-router-dom';
import './Forgot.css';
import DynamicWeather from '../../components/DynamicWeather/DynamicWeather';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import { forgotPassword } from '../../api/user';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';

class Forgot extends React.Component {
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
            email: 'Not valid Email',
            required: 'Email is required',
          },
          valid: true,
          value: '',
          cssClass: '',
          error: '',
        },
      },
      checkForget: false,
      data: {},
      loading: true,
      error: false,
    };
    this.loadDefaultData();
  }

  handleSubmitForgetMessage = async (data) => {
    try {
      const res = await forgotPassword({ email: data.email.value });
      if (res) {
        this.setState({ checkForget: true, error: false });
      }
    } catch (e) {
      this.setState({ error: true });
    }
  };

  async loadDefaultData() {
    try {
      const result = await getWeather('sydney');
      const convertedData = convertWeatherData(result.data);
      this.setState({ data: convertedData, loading: false, error: false });
    } catch (error) {
      this.setState({ loading: false, error: true });
    }
  }

  render() {
    const { loading, data, checkForget, formData, error } = this.state;
    return (
      <div>
        {loading ? (
          <img
            className="background__img"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFUoOzaBd_QpPk6HpTIOZZYXdqVUQJur72g&usqp=CAU"
            alt="bg"
          />
        ) : (
          <DynamicWeather data={data} height={parseInt(1080, 10)} />
        )}
        <FormContainer text="Forgot Password">
          <div className="Signup-body">
            {checkForget ? (
              <p className="color--white">We have sent an email for you to reset your passwords</p>
            ) : (
              <Form data={formData} formSubmit={this.handleSubmitForgetMessage} btnText="Submit" />
            )}
            {error ? <p className="color--white">Sorry we cannot find your email address</p> : ''}
            <div className="login-fotpas">
              <Link to="/login" className="switchSignup">
                Go back &gt
              </Link>
            </div>
            <div className="switchToSignup">
              <p>Don&apos;t have an account ?</p>
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

export default Forgot;
