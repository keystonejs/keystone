import React from 'react';
import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from '../lib/withApollo';
import DefaultLayout from '../components/layout';

class MyApp extends App {
	render() {
		const { Component, pageProps, apollo } = this.props;
		const Layout = Component.layout || DefaultLayout;

		return (
			<ApolloProvider client={apollo}>
				<Layout {...pageProps}>
					<Component {...pageProps} />
				</Layout>
			</ApolloProvider>
		);
	}
}

export default withApollo(MyApp);
