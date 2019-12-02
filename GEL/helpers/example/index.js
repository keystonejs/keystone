/** @jsx jsx */

import React, { useEffect, useState, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';

import { Global, css, jsx } from '@westpac/core';
import { Container } from '@westpac/grid';

import { GEL } from '@westpac/core';

import bomBrand from '@westpac/bom';
import bsaBrand from '@westpac/bsa';
import btfgBrand from '@westpac/btfg';
import stgBrand from '@westpac/stg';
import wbcBrand from '@westpac/wbc';
import wbgBrand from '@westpac/wbg';

// ==============================
// Get the data
// ==============================

const BRANDS = {
	BOM: bomBrand,
	BSA: bsaBrand,
	BTFG: btfgBrand,
	STG: stgBrand,
	WBC: wbcBrand,
	WBG: wbgBrand,
};

// ==============================
// Compose the pieces
// ==============================

const App = ({ components, packageName, pkg }) => {
	const [searchValue, setSearchValue] = useState('');
	const [brand, setBrand] = useState('WBC');

	// update doc title
	useEffect(() => {
		document.title = `${packageName} Example - GEL`;
	}, [packageName]);

	// filter components for search
	const navItems = searchValue.length
		? components.filter(p => p.label.toLowerCase().includes(searchValue.toLowerCase()))
		: components;

	const primaryColor = BRANDS[brand].COLORS.primary;

	return (
		<Router>
			<StrictMode>
				<GEL brand={BRANDS[brand]}>
					<Body>
						<Global
							styles={css`
								code {
									font-family: Monaco, monospace;
									font-size: 0.85em;
								}
								p > code {
									background-color: #ffebe6;
									color: #bf2600;
									border-radius: '0.3rem';
									display: inline-block;
									padding: '0.1rem 0.3rem';
								}
							`}
						/>
						<Sidebar>
							<SidebarTitle to="/">{packageName}</SidebarTitle>
							<SidebarSearch
								onChange={e => setSearchValue(e.target.value)}
								placeholder="Search..."
								type="search"
								value={searchValue}
							/>

							<SidebarNav>
								{navItems.map(({ label, slug }) => (
									<SidebarItem
										primaryColor={primaryColor}
										key={slug}
										to={`/${slug}`}
										data-test-nav-link
									>
										{label}
									</SidebarItem>
								))}
							</SidebarNav>

							<SidebarSwitcher>
								{Object.keys(BRANDS).map(b => {
									const isChecked = brand === b;
									return (
										<SidebarSwitch key={b} checked={isChecked}>
											<input
												name="brand"
												type="radio"
												onChange={e => setBrand(b)}
												value={b}
												checked={isChecked}
											/>
											{b}
										</SidebarSwitch>
									);
								})}
							</SidebarSwitcher>
						</Sidebar>
						<Switch>
							<Route
								exact
								path="/"
								render={route => <Home {...route} packageName={packageName} pkg={pkg} />}
							/>
							{components.map(({ slug, ...props }) => (
								<Route
									key={slug}
									path={`/${slug}`}
									render={route => <Page {...route} {...props} brand={BRANDS[brand]} />}
								/>
							))}
						</Switch>
					</Body>
				</GEL>
			</StrictMode>
		</Router>
	);
};

class Page extends React.Component {
	state = { error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info });
	}
	render() {
		const { Module, filename, label, ...rest } = this.props;
		const { error, info } = this.state;

		if (error) {
			const errorLabel = `Error in ${filename}`;
			console.error(errorLabel, error);

			return (
				<Article>
					<Container>
						<h1>{errorLabel}</h1>
						<h2 css={{ color: '#BF2600' }}>
							<code>{error.message}</code>
						</h2>
						<pre
							css={{
								backgroundColor: '#FFEBE6',
								borderRadius: 4,
								color: '#DE350B',
								paddingBottom: '1em',
							}}
						>
							<code>{info.componentStack}</code>
						</pre>
					</Container>
				</Article>
			);
		}

		return (
			<Article>
				<Container css={{ marginBottom: '3rem' }}>
					<h1>{label}</h1>
					<Module.default {...rest} />
				</Container>
			</Article>
		);
	}
}

const Code = ({ children }) => (
	<pre
		css={{
			background: '#f9f9f9',
			padding: '1rem',
			border: '1px solid #ccc',
		}}
	>
		<code>{children}</code>
	</pre>
);

const Home = ({ packageName, pkg }) => (
	<Article>
		<Container>
			<h1>{packageName} Examples</h1>
			<p>Click one of the examples on the left to view it.</p>
			<Code>yarn add @westpac/{pkg}</Code>
			<p>To run this component locally:</p>
			<Code>yarn start {pkg}</Code>
			<p>To load the examples for another package run the above code with another package name</p>
		</Container>
	</Article>
);

// ==============================
// Styled components
// ==============================

const Body = props => (
	<div
		css={{
			alignItems: 'stretch',
			display: 'flex',
			height: '100vh',
		}}
		{...props}
	/>
);

const Article = props => (
	<article
		css={{
			flex: 1,
			overflowY: 'auto',
			paddingTop: '1rem',
			paddingBottom: '4rem',
		}}
		{...props}
	/>
);

const Sidebar = props => (
	<div
		css={{
			backgroundColor: '#F4F5F7',
			borderRight: '1px solid rgba(0, 0, 0, 0.075)',
			display: 'flex',
			flexDirection: 'column',
			width: 240,
		}}
		{...props}
	/>
);

const SidebarNav = props => (
	<nav css={{ flex: 1, overflowY: 'auto' }}>
		<ul css={{ listStyle: 'none', margin: '1rem 0', padding: 0 }} {...props} />
	</nav>
);

const SidebarSearch = props => (
	<input
		css={{
			background: 0,
			borderWidth: '1px 0',
			borderStyle: 'solid',
			borderColor: 'rgba(0, 0, 0, 0.075)',
			boxSizing: 'border-box',
			fontSize: 'inherit',
			padding: '0.625rem 1.25rem',
			width: '100%',

			':focus': {
				background: 'rgba(0,0,0,0.04)',
				outlineOffset: -3,
			},
		}}
		{...props}
	/>
);

const SidebarLink = ({ primaryColor, ...props }) => (
	<NavLink
		css={{
			backgroundColor: '#F4F5F7',
			borderLeft: '3px solid transparent',
			color: primaryColor,
			display: 'block',
			fontWeight: 500,
			padding: '0.625rem 1.0625rem',
			fontSize: '1rem',
			textDecoration: 'none',

			':hover, :focus': {
				background: '#fafbfc',
				textDecoration: 'inherit',
			},

			':focus': {
				outlineOffset: -3,
			},

			'&.active': {
				borderLeftColor: primaryColor,
				color: 'inherit',
			},
		}}
		{...props}
	/>
);

const SidebarItem = props => (
	<li data-test-nav>
		<SidebarLink {...props} />
	</li>
);

const SidebarTitle = props => (
	<NavLink
		css={{
			color: 'inherit',
			display: 'block',
			fontWeight: 500,
			fontSize: '1.25rem',
			padding: '1.25rem',
			textDecoration: 'none',

			':hover, :focus': {
				textDecoration: 'inherit',
			},

			':focus': {
				outlineOffset: -3,
			},
		}}
		{...props}
	/>
);

const SidebarSwitcher = props => (
	<div
		css={{
			display: 'flex',
			fontSize: '0.8125rem',
		}}
		{...props}
	/>
);

const SidebarSwitch = ({ checked, ...props }) => (
	<label
		css={{
			alignItems: 'center',
			borderTop: '1px solid',
			borderTopColor: checked ? '#1F252C' : 'rgba(0, 0, 0, 0.1)',
			boxSizing: 'border-box',
			color: checked ? 'inherit' : '#1F252C',
			cursor: 'pointer',
			flex: 1,
			fontWeight: 500,
			justifyContent: 'center',
			paddingBottom: '0.75rem',
			paddingTop: '0.75rem',
			textAlign: 'center',

			input: {
				height: 1,
				position: 'absolute',
				visibility: 'hidden',
				width: 1,
			},
		}}
		{...props}
	/>
);

// ==============================
// Render to node
// ==============================

export default (packageName, pkg, components) => {
	const rootElement = document.getElementById('root');
	ReactDOM.render(<App packageName={packageName} pkg={pkg} components={components} />, rootElement);
};
