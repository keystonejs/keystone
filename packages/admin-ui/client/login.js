import React from 'react';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import ConnectivityListener from './components/ConnectivityListener';

import SigninPage from './pages/Signin';

/*
  NOTE:
  Using this page without an authStrategy of type PasswordAuthStrategy defined
  for the Admin UI would cause serious problems. It should also be impossible to
  actually do that, so we don't guard against it (yet).
*/

export default () => (
  <ToastProvider>
    <ConnectivityListener />
    <Global styles={globalStyles} />
    <SigninPage />
  </ToastProvider>
);
