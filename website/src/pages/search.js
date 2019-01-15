import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

import { colors } from '@voussoir/ui/src/theme';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			query: '',
			results: '',
		};
	}

	componentWillMount = async () => {
		const query = new URL(window.location.href).searchParams.get('q');
		const results = this.getSearchResults(query);
		await this.setState(() => ({ results, query }));
	}

	render() {
		console.log(this.state);

		return (
			<>
				<Global
					styles={{
						body: {
							margin: 0,
							color: colors.B.D55,
							background: colors.B.bg,
							fontFamily:
								'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
						},

						'pre[class*="language-"]': {
							background: 'white',
							fontSize: '0.8em',
							width: '100%',
							maxWidth: 600,
						},
					}}
				/>
				<Header />
				<div
					css={{
						maxWidth: 900,
						margin: '0 auto',
						padding: 16,
					}}
				>
					<h1>Search Results for '{this.state.query}'</h1>

					<input type="text" value={this.state.query} onChange={this.search} placeholder="Search" />
					{this.state.results.length ? (
						<ul css={{ padding: 0 }}>
							{this.state.results.map(result => (
								<li
									css={{
										padding: 10,
										borderBottom: `1px solid ${colors.B.A25}`,
										listStyle: 'none',
									}}
									key={result.slug}
								>
									<div>
										<Link
											style={{
												fontSize: '1.25em',
												color: colors.B.base,
												textTransform: 'capitalize',
											}}
											to={result.slug}
										>
											{this.prettyTitle(result)}
										</Link>{' '}
										<small style={{ color: 'grey' }}>({result.workspace})</small>
									</div>
									<p css={{ marginBottom: 0 }}>{result.preview}</p>
								</li>
							))}
						</ul>
					) : null}
				</div>
				<Footer />
			</>
		);
	}

	prettyTitle(node) {
		let pretty = node.slug
			.replace(node.workspace.replace('@', ''), '')
			.replace(new RegExp(/(\/)/g), ' ')
			.replace('-', ' ')
			.trim();

		if (pretty.startsWith('packages') || pretty.startsWith('types')) {
			pretty = pretty.replace('packages', '').replace('types', '');
		}

		return pretty === '' ? 'index' : pretty;
	}

	getSearchResults(query) {
		console.log(window.__LUNR__); // the query won't execute until this thing 'loads'.
		if (!query || !window.__LUNR__) return [];
		const lunrIndex = window.__LUNR__[this.props.lng || 'en'];
		const results = lunrIndex.index.search(query); // you can  customize your search , see https://lunrjs.com/guides/searching.html
		return (
			results
				.map(({ ref }) => lunrIndex.store[ref])
				// Make sure `tutorials` are always first
				.sort((a, b) => (a.workspace !== b.workspace && a.workspace === 'tutorials' ? -1 : 0))
		);
	}

	search = event => {
		const query = event.target.value;
		const results = this.getSearchResults(query);
		this.setState(() => ({ results, query }));
	};
}
