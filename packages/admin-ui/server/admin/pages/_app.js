import React from 'react';
import { Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { ToastProvider } from 'react-toast-notifications';
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import { prepareClientPortals } from '@jesstelford/react-portal-universal';

import ConnectivityListener from '../client/components/ConnectivityListener';
import KeyboardShortcuts from '../client/components/KeyboardShortcuts';
import withApolloClient from '../lib/with-apollo';
import Nav from '../client/components/Nav';

if (process.browser) {
  // On the client, we have to run this once before React attempts a render.
  // Here in _app is a great place to do it as this file is only required once,
  // and right now (outside the constructor) is before React is invoked.
  prepareClientPortals();
}

export default withApolloClient(
  class MyApp extends App {
    render() {
      const { Component, pageProps, apolloClient } = this.props;
      return (
        <ApolloProvider client={apolloClient}>
          <KeyboardShortcuts>
            <ToastProvider>
              <ConnectivityListener />
              <Global styles={globalStyles} />
              <Container>
                <Nav>
                  <Component {...pageProps} />
                </Nav>
              </Container>
            </ToastProvider>
          </KeyboardShortcuts>
        </ApolloProvider>
      );
    }
  }
);
