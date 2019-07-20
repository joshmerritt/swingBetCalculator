import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import '../../index.css';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import Scorecard from '../Scorecard';
import CreateScorecard from '../CreateScorecard';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';
import ScorecardHistory from '../ScorecardHistory';

const App = () => (
  <Router>
    <div className='wrapper'>
      <Navigation />

      <hr />

      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route exact path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route
        exact
        path={ROUTES.PASSWORD_FORGET}
        component={PasswordForgetPage}
      />
      <Route exact path={ROUTES.HOME} component={HomePage} />
      <Route exact path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route exact path={ROUTES.ADMIN} component={AdminPage} />
      <Route exact path={ROUTES.SCORECARD} component={Scorecard} />
      <Route exact path={ROUTES.CREATE_SCORECARD} component={CreateScorecard} />
      <Route exact path={ROUTES.SCORECARD_HISTORY} component={ScorecardHistory} />
    </div>
  </Router>
);

export default withAuthentication(App);
