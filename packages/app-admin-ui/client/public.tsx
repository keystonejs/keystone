import React, { useMemo, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'; // FIXME: Use the provided API when hooks ready
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import ApolloClient from './apolloClient';

import ConnectivityListener from './components/ConnectivityListener';
import { useAdminMeta } from './providers/AdminMeta';

import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';
import SigninPage from './pages/Signin';

/*
  NOTE:
  Using this page without an authStrategy of type PasswordAuthStrategy defined
  for the Admin UI would cause serious problems. It should also be impossible to
  actually do that, so we don't guard against it (yet).
*/

const Keystone = () => {
  let adminMeta = useAdminMeta();
  let { apiPath } = adminMeta;
  const apolloClient = useMemo(() => new ApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <ToastProvider>
          <ConnectivityListener />
          <Global styles={globalStyles} />

          {adminMeta.authStrategy ? (
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
          )}
        </ToastProvider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Suspense fallback={null}>
    <Keystone />
  </Suspense>,
  document.getElementById('app')
);
