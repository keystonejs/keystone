import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { injectGlobal } from 'emotion';

import globalStyles from '@keystonejs/ui/src/globalStyles';
import { ToastProvider } from '@keystonejs/ui/src/primitives/toasts';
injectGlobal(globalStyles);

import apolloClient from './apolloClient';

import OfflineListener from './components/OfflineListener';
import { AdminMetaProvider } from './providers/AdminMeta';

import InvalidRoutePage from './pages/InvalidRoute';
import SignoutPage from './pages/Signout';
import SigninPage from './pages/Signin';

const Keystone = () => (
  <ApolloProvider client={apolloClient}>
    <ToastProvider>
      <OfflineListener />
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
