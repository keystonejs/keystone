import { getDataFromTree } from '@apollo/react-ssr';
import Head from 'next/head';
import React from 'react';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const getApolloClient = initialState =>
	new ApolloClient({
		link: new HttpLink({
			uri: `${process.env.KEYSTONE_URI || 'http://localhost:3000'}/admin/api`,
		}),
		cache: new InMemoryCache().restore(initialState || {}),
	});

export default App => {
	return class WithApollo extends React.Component {
		static getInitialProps = async appCtx => {
			const { AppTree, ctx } = appCtx;
			const apollo = getApolloClient();
			const apolloState = {};
			const getInitialProps = App.getInitialProps;

			let appProps = { pageProps: {} };

			if (getInitialProps) {
				ctx.apolloClient = apollo;
				appProps = await getInitialProps(appCtx);
			}

			if (ctx.res && (ctx.res.headersSent || ctx.res.finished)) {
				return {};
			}

			if (typeof window === 'undefined') {
				try {
					await getDataFromTree(
						<AppTree {...appProps} apolloState={apolloState} apollo={apollo} />
					);
				} catch (error) {
					// Prevent Apollo Client GraphQL errors from crashing SSR.
					if (process.env.NODE_ENV !== 'production') {
						console.error('GraphQL error occurred [getDataFromTree]', error);
					}
				}

				if (typeof window === 'undefined') {
					// getDataFromTree does not call componentWillUnmount
					// head side effect therefore need to be cleared manually
					Head.rewind();
				}

				apolloState.data = apollo.cache.extract();
			}

			apollo.toJSON = () => {
				return null;
			};

			return {
				...appProps,
				apolloState,
				apollo,
			};
		};

		constructor(props) {
			super(props);
			this.apollo = props.apollo || getApolloClient();
		}

		render() {
			return <App {...this.props} apollo={this.apollo} />;
		}
	};
};
