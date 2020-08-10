import React, { useMemo, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import { Global } from '@emotion/core';

import { globalStyles } from '@arch-ui/theme';

import { initApolloClient } from './apolloClient';

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

  const apolloClient = useMemo(() => initApolloClient({ uri: apiPath }), [apiPath]);

  return (
    <HooksProvider hooks={hooks}>
      <ApolloProvider client={apolloClient}>
        <ToastProvider>
          <Global styles={globalStyles} />

          {authStrategy ? (
            <BrowserRouter>
              <Switch>
                <Route exact path={signoutPath} children={<SignoutPage />} />
                <Route children={<SigninPage />} />
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
