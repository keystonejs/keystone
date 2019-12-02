require('dotenv').config();

const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { NextApp } = require('@keystonejs/app-next');
const { Text } = require('@keystonejs/fields');
const { Content } = require('@keystonejs/field-content');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { extendKeystoneGraphQLSchema } = require('./extend-schema');

const keystone = new Keystone({
	name: 'GEL3 Website',
	adapter: new KnexAdapter(),
});

extendKeystoneGraphQLSchema(keystone);

keystone.createList('Thing', {
	fields: {
		name: { type: Text },
		doc: { type: Content, blocks: [Content.blocks.blockquote, Content.blocks.image] },
		// packageName: { type: Computed, gqlType: `String`, resolver: resolveComponent },
		// name: { type: Computed, gqlType: `String`, resolver: resolveComponent },
		// version: { type: Computed, gqlType: `String`, resolver: resolveComponent },
		// description: { type: Computed, gqlType: `String`, resolver: resolveComponent },
		// author: { type: Computed, gqlType: `String`, resolver: resolveComponent },
	},
});

module.exports = {
	keystone,
	apps: [
		new GraphQLApp(),
		new AdminUIApp({
			adminPath: '/admin',
		}),
		// new NextApp({ dir: 'site' }),
	],
};
