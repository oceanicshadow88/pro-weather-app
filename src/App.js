import React, { useEffect } from 'react';
import './App.css';
import { Route, withRouter, Switch } from 'react-router-dom';
import { loadReCaptcha } from 'react-recaptcha-google';
import { connect } from 'react-redux';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import Logout from './containers/Auth/Logout/Logout';
import * as action from './store/actions';
import LoginPage from './pages/LoginPage/LoginPage';

import SignUpPage from './pages/SignUpPage/SignUpPage';
import ResetPage from './pages/ResetPage/ResetPage';
import ProtectedRoute from './routes/ProtectedRoute/ProtectedRoute';
import ForgotPage from './pages/ForgotPage/ForgotPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import { SkyGradientProvider } from './context/SkyGradientContext';

const App = ({ onTryAutoSignup }) => {
  // https://rawgit.com/darkskyapp/skycons/master/skycons.js
  // https://codepen.io/Gerwinnz/pen/RVzrRG
  useEffect(() => {
    loadReCaptcha();
    onTryAutoSignup();
  }, [onTryAutoSignup]);

  return (
    <SkyGradientProvider>
      <Switch>
        <Route path="/" exact component={LoginPage} />
        <Route path="/reset-password/:token" exact component={ResetPage} />
        <Route path="/forgot" exact component={ForgotPage} />
        <Route path="/sign-up" exact component={SignUpPage} />
        <Route path="/dashboard" exact component={DashboardPage} />
        <Route path="/settings" exact component={SettingsPage} />
        <Route path="/logout" exact component={Logout} />
        <Route path="/login" component={LoginPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </SkyGradientProvider>
  );
};

const mapDispatchToProps = (dispatch) => ({
  // onTryAutoSettings: () => dispatch(action.getSettings()),
  onTryAutoSignup: () => dispatch(action.authCheckState()),
});
export default withRouter(connect(null, mapDispatchToProps)(App));
