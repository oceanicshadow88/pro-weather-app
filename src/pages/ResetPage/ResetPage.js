import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ResetPage.css';
import { resetPassword } from '../../api/user';
import Form from '../../components/Form/Form/Form';
import FormContainer from '../../components/Container/FormContainer/FormContainer';

const ResetPage = ({ match }) => {
  const [formData] = useState({
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
    passwordConfirm: {
      elementConfig: {
        placeholder: 'Password',
      },
      validation: {
        required: true,
      },
      errorMessage: {
        required: 'Password Confirmed is required',
      },
      valid: true,
      value: '',
      cssClass: '',
      error: '',
      type: 'password',
    },
  });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitReset = async (data) => {
    try {
      const res = await resetPassword({
        password: data.password.value,
        t: match.params.token,
      });

      if (res) {
        setResetSuccess(true);
      } else {
        setResetSuccess(false);
        setErrorMessage('Unauthorized ');
      }
    } catch (e) {
      setResetSuccess(false);
      setErrorMessage('Unauthorized');
    }
  };

  return (
    <div>
      <img
        className="background__img"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFUoOzaBd_QpPk6HpTIOZZYXdqVUQJur72g&usqp=CAU"
        alt="bg"
      />
      <FormContainer text="Reset Password">
        {!resetSuccess ? (
          <div className="Signup-body">
            {errorMessage !== '' && <p className="color--red error-message">{errorMessage}</p>}
            <Form data={formData} formSubmit={handleSubmitReset} btnText="Confirm" />
          </div>
        ) : (
          <div>
            <p className="color--white">Password has been reset</p>
            <div className="login-fotpas">
              <Link to="/login" className="switchSignup">
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </FormContainer>
    </div>
  );
};

export default ResetPage;
