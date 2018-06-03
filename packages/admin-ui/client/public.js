import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { injectGlobal } from 'emotion';

import globalStyles from '@keystonejs/ui/src/globalStyles';
import { ToastProvider } from '@keystonejs/ui/src/primitives/toasts';
injectGlobal(globalStyles);

import ScrollToTop from './components/ScrollToTop';
import OfflineListener from './components/OfflineListener';
import AdminMetaProvider from './providers/AdminMeta';
import apolloClient from './providers/apolloClient';

import SessionPage from './pages/Session';
import InvalidRoutePage from './pages/InvalidRoute';

const Keystone = () => (
  <ApolloProvider client={apolloClient}>
    <ToastProvider>
      <OfflineListener />
      <AdminMetaProvider>
        {adminMeta => <SessionPage {...adminMeta} />}
      </AdminMetaProvider>
    </ToastProvider>
  </ApolloProvider>
);

ReactDOM.render(<Keystone />, document.getElementById('app'));
