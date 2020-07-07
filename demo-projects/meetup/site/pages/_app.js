import React from 'react';
import Head from 'next/head';
import { ToastProvider } from 'react-toast-notifications';
import { AuthProvider } from '../lib/authentication';
import StylesBase from '../primitives/StylesBase';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { useApollo } from '../lib/apolloClient';
import { ApolloProvider } from '@apollo/react-hooks';
const MyApp = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps.initialApolloState);
  return (
    <ToastProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <Head>
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
            />
          </Head>
          <StylesBase />
          <Component {...pageProps} />
        </AuthProvider>
      </ApolloProvider>
      <GoogleAnalytics />
    </ToastProvider>
  );
};

export default MyApp;
