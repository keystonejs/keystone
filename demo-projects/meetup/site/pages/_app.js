import App, { Container } from 'next/app';
import fetch from 'isomorphic-unfetch';
import React from 'react';
import { ApolloProvider } from 'react-apollo';

import withApollo from '../lib/withApollo';
import { AuthProvider } from '../lib/authetication';

const apiEndpoint = 'http://localhost:3000/admin';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    // We need to forward the request headers on the server.
    const url = `${apiEndpoint}/session`;
    const headers = ctx.req ? { cookie: ctx.req.headers.cookie } : undefined;

    const { user } = await fetch(url, { headers }).then(res => res.json());

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    return { pageProps, user };
  }

  render() {
    const { Component, pageProps, apolloClient, user } = this.props;
    return (
      <Container>
        <AuthProvider intitialUserValue={user}>
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </AuthProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
