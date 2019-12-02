const { createUnits } = require('../../../helpers/transformers/utils');

const { major, minor } = createUnits(6, 3, 20);

module.exports = {
	SPACING: {
		major,
		minor,
	},
};
