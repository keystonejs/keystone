/** @jsx jsx */
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { jsx } from '@westpac/core';
import { Tab, Tabcordion } from '@westpac/tabcordion';
import { Heading } from '@westpac/heading';
import { Alert } from '@westpac/alert';

// import ReactLive from '../../components/react-live';
import { Playground } from '../../components/playground';
import ChangelogWrapper from '../../components/changelog';
import { ALL_COMPONENTS } from '../../graphql';
let Component = ({ component }) => {
	let DataComponent = useMemo(() => {
		return dynamic(
			() =>
				Promise.all([
					import(`@westpac/${component}/website`),
					import(`@westpac/${component}/CHANGELOG.md`).then(x => x.default),
				])
					.then(modules => ({ children }) => children(modules))
					.catch(error => () => <p>{JSON.stringify(error, null, 4)}</p>),
			{
				loading: () => <p>loading...</p>,
			}
		);
	}, [component]);

	return (
		<DataComponent>
			{([examples, changelog]) => {
				return (
					<div css={{ maxWidth: 700 }}>
						<Heading size={1} css={{ textTransform: 'capitalize' }}>
							{name}
						</Heading>
						<p>
							This is the intro text for the {name} component. It will probably come from Keystone.
						</p>
						<p>
							Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quos quae nulla dicta. Iure
							laudantium neque numquam omnis voluptates tempore alias animi porro, placeat eius
							dignissimos repellendus, excepturi obcaecati voluptatum nihil.
						</p>
						<Heading tag="h2" size={6} css={{ marginTop: 40, marginBottom: 10 }}>
							Code examples
						</Heading>
						<Examples examples={examples} name={name} />
						<Heading tag="h2" size={6} css={{ marginTop: 40, marginBottom: 10 }}>
							Changelog
						</Heading>
						<ChangelogWrapper data={changelog}></ChangelogWrapper>
					</div>
				);
			}}
		</DataComponent>
	);
};

// ==============================
// Examples
// ==============================

const Examples = ({ examples, name }) => {
	// Bail out if there are no examples in the snippets folder
	if (!Object.keys(examples).length > 0 || Object.keys(examples)[0] === 'default') {
		return (
			<Alert look="warning">
				No live code examples for this component. They can be added in{' '}
				<code>
					@westpac/{name}
					/website/snippets
				</code>
				.
			</Alert>
		);
	}

	// If we have examples, display each group (file) in a Tab
	return (
		<Tabcordion mode="tabs" appearance="soft">
			{Object.entries(examples).map(([name, snippets]) => (
				<Tab key={name} label={name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')}>
					<ExamplesGroup key={name} snippets={snippets} />
				</Tab>
			))}
		</Tabcordion>
	);
};

const Nest = () => {
	return <p>Hello</p>;
};

const Test = () => {
	return (
		<p>
			<Nest />
		</p>
	);
};

const myTest = elm => {
	const c = elm.props.children;
	console.log(React.Children.count(c));
	console.log(React.Children.toArray(c));
};

const ExamplesGroup = ({ snippets }) => {
	return Object.entries(snippets).map(([name, code]) => {
		if (name !== 'scope') {
			return (
				<Playground scope={{ Test }}>
					<Test prop="string" />
				</Playground>
			);
			//<Example key={name} name={name} code={code} scope={snippets.scope} />;
		}
	});
};

// const Example = ({ code, scope }) => <ReactLive code={code} scope={scope}></ReactLive>;

Component.getInitialProps = async ({ apolloClient, query: { component } }) => {
	try {
		const { data, error } = await apolloClient.query(ALL_COMPONENTS);

		return {
			components: data.allComponents,
			error: error,
			component,
		};
	} catch (error) {
		// If there was an error, we need to pass it down so the page can handle it.
		console.log('error', error);
		return { error, component };
	}
};

export default Component;
