import App, { Container } from 'next/app';
import React from 'react';
import withApollo from '../lib/withApollo';
import { ApolloProvider } from 'react-apollo';

class MyApp extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
