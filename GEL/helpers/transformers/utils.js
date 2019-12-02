const Color = require('color');

const tinting = (color, amount) =>
	Color('white')
		.mix(Color(color), amount / 100)
		.hex();

const makeTints = (color, name) => {
	const tints = {};
	[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(tint => (tints[name + tint] = tinting(color, tint)));
	return tints;
};

const createUnits = (majorStep, minorStep, amount) => {
	const major = Array.from({ length: amount + 1 }, (_, i) => i * majorStep);
	const minor = Array.from({ length: amount * 2 }).reduce(
		(acc, _, i) => {
			if (i % 2) acc.push(i * minorStep);
			return acc;
		},
		[0]
	);

	return { major, minor };
};

module.exports = {
	makeTints,
	createUnits,
};
