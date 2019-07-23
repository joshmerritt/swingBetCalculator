import React from 'react';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

import { AuthUserContext } from '../Session';

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.CREATE_SCORECARD}>New Round</Link>
    </li>
    <li>
      <Link to={ROUTES.SCORECARD}>Score Round</Link>
    </li>
    <li>
      <Link to={ROUTES.SCORECARD_HISTORY}>Round Results</Link>
    </li>
    <li>
      <Link to={ROUTES.ACCOUNT}>Update Account</Link>
    </li>
    <li>
      <Link to={ROUTES.ADMIN}>Users</Link>
    </li>
    <li>
      <SignOutButton />
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.LANDING}>Landing</Link>
    </li>
    <li>
      <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    </li>
  </ul>
);

export default Navigation;
