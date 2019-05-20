import App, { Container } from 'next/app';
import React from 'react';
import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { ToastProvider } from 'react-toast-notifications';

import withApollo from '../lib/withApollo';
import { AuthProvider } from '../lib/authetication';
import StylesBase from '../primitives/StylesBase';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    const data = await ctx.apolloClient.query({
      query: gql`
        query {
          authenticatedUser {
            id
            name
            isAdmin
          }
        }
      `,
      fetchPolicy: 'network-only',
    });

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, user: data.data ? data.data.authenticatedUser : undefined };
  }

  render() {
    const { Component, pageProps, apolloClient, user } = this.props;
    return (
      <ToastProvider>
        <Container>
          <ApolloProvider client={apolloClient}>
            <AuthProvider initialUserValue={user}>
              <ApolloHooksProvider client={apolloClient}>
                <StylesBase />
                <Component {...pageProps} />
              </ApolloHooksProvider>
            </AuthProvider>
          </ApolloProvider>
        </Container>
      </ToastProvider>
    );
  }
}

export default withApollo(MyApp);
