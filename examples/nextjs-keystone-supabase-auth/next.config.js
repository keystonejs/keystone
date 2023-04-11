// you don't need this if you're building something outside of the Keystone repo
const withPreconstruct = require('@preconstruct/next')

module.exports = withPreconstruct({
	webpack(config) {
		config.externals = [...config.externals, '.myprisma/client']
		return config
	},
	experimental: {
		appDir: true,
		serverComponentsExternalPackages: ['graphql'],
	},
})
