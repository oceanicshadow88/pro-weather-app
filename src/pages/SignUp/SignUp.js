import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './SignUp.css';
import { connect } from 'react-redux';
import * as action from '../../store/actions';
import DynamicWeather from '../../components/DynamicWeather/DynamicWeather';
import { getWeather, convertWeatherData } from '../../api/weatherapi';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';
import logo from '../../img/weather.png';

class SignUp extends React.Component {
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
      },
      checkForget: false,
      data: {},
      width: 0,
      height: 0,
      loading: true,
    };
    this.loadDefaultData();
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  async loadDefaultData() {
    try {
      const result = await getWeather('sydney');
      const convertedData = convertWeatherData(result.data);
      this.setState({ data: convertedData, loading: false, error: false });
    } catch (error) {
      this.setState({ loading: false, error: true });
    }
  }

  handleSubmit = (data, token) => {
    this.props.onSignUp(data.email.value, data.password.value, data.city.value, token);
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    if (this.props.isAuth) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <div className="sign-up">
        {this.state.loading ? (
          <img
            className="background__img"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFUoOzaBd_QpPk6HpTIOZZYXdqVUQJur72g&usqp=CAU"
            alt="bg"
          />
        ) : (
          <DynamicWeather
            data={this.state.data}
            width={parseInt(this.state.width)}
            height={parseInt(this.state.height)}
          />
        )}
        <FormContainer text="Sign Up">
          <div className="login-img__container">
            <img src={logo} alt="weaths" className="login_img" />
          </div>
          <div className="Signup-body">
            <Form
              data={this.state.formData}
              formSubmit={this.handleSubmit}
              btnText="Sign Up"
              validate
            />
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
  }
}

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
export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
