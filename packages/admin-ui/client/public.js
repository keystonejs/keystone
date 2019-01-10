import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import apolloClient from './apolloClient';

import ConnectivityListener from './components/ConnectivityListener';
import { AdminMetaProvider } from './providers/AdminMeta';

import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';
import SigninPage from './pages/Signin';

/*
  NOTE:
  Using this page without an authStrategy of type PasswordAuthStrategy defined
  for the Admin UI would cause serious problems. It should also be impossible to
  actually do that, so we don't guard against it (yet).
*/

const Keystone = () => (
  <ApolloProvider client={apolloClient}>
    <ToastProvider>
      <ConnectivityListener />
      <Global styles={globalStyles} />
      <AdminMetaProvider>
        {adminMeta =>
          adminMeta.withAuth ? (
            <BrowserRouter>
              <Switch>
                <Route
                  exact
                  path={adminMeta.signoutPath}
                  render={() => <SignoutPage {...adminMeta} />}
                />
                <Route render={() => <SigninPage {...adminMeta} />} />
              </Switch>
            </BrowserRouter>
          ) : (
            <InvalidRoutePage {...adminMeta} />
          )
        }
      </AdminMetaProvider>
    </ToastProvider>
  </ApolloProvider>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
