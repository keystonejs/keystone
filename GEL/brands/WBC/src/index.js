// @codegen
const build = require('../../../helpers/transformers/web');
const Brand = require('../package.json')
	.name.replace('@westpac/', '')
	.toUpperCase();

module.exports = `${build(Brand)}`;
