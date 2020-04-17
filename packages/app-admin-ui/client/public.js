import React, { useMemo, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import ApolloClient from './apolloClient';

import ConnectivityListener from './components/ConnectivityListener';
import { AdminMetaProvider, useAdminMeta } from './providers/AdminMeta';
import { HooksProvider } from './providers/Hooks';

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
  const { authStrategy, apiPath, signoutPath, hooks } = useAdminMeta();

  const apolloClient = useMemo(() => new ApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <HooksProvider hooks={hooks}>
      <ApolloProvider client={apolloClient}>
        <ToastProvider>
          <ConnectivityListener />
          <Global styles={globalStyles} />

          {authStrategy ? (
            <BrowserRouter>
              <Switch>
                <Route exact path={signoutPath} render={() => <SignoutPage />} />
                <Route render={() => <SigninPage />} />
              </Switch>
            </BrowserRouter>
          ) : (
            <InvalidRoutePage />
          )}
        </ToastProvider>
      </ApolloProvider>
    </HooksProvider>
  );
};

ReactDOM.render(
  <Suspense fallback={null}>
    <AdminMetaProvider>
      <Keystone />
    </AdminMetaProvider>
  </Suspense>,
  document.getElementById('app')
);
