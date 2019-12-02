const withPreconstruct = require('@preconstruct/next');

const config = {
	webpack: (config, { isServer }) => {
		config.module.rules.push({
			test: /\.md$/,
			use: 'raw-loader',
		});

		if (!isServer) {
			config.node = {
				fs: 'empty',
			};
		}

		return config;
	},
};
module.exports = withPreconstruct(config);
