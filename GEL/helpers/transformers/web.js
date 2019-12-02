const path = require('path');
const cfonts = require('cfonts');

const { makeTints } = require('./utils');

/**
 * Convert a font token object to a styled object for emotion to use
 *
 * @param  {array} fonts - An array or font objects for a font
 *
 * @return {object}      - The styled object for emotion
 */
function convertFonts(fonts) {
	const output = {};
	output[''] = [];

	fonts.map(font => {
		output[''].push({
			'@font-face': {
				fontFamily: font.name,
				src: `url("_PATH_${font.files.woff2}") format("woff2"), url("_PATH_${font.files.woff}") format("woff")`,
				fontWeight: font.weight,
				fontStyle: font.style,
			},
		});
	});

	return output;
}

/**
 * Transform the tokens into a web specific object that can be used in emotion
 *
 * @param  {string} BRAND - The brand string to find the right brand folder
 * @param  {string} dest - The destination path where the file should be written
 */
function build(BRAND) {
	const cwd = path.resolve(__dirname, `../../brands/${BRAND}`);

	const { COLORS: colors } = require(`${cwd}/tokens/colors`);
	// const { SPACING: spacing } = require(`${cwd}/tokens/spacing`);
	const { LAYOUT: layout } = require(`${cwd}/tokens/layout`);
	const {
		TYPE: { files, bodyFont, brandFont, ...typeRest },
	} = require(`${cwd}/tokens/type`);
	const { PACKS: packs } = require(`${cwd}/tokens/packs`);

	// spacing
	// const SPACING = {
	// 	minor: spacing.minor.map(space => space / 16 + (space > 0 ? 'rem' : 0)),
	// 	...spacing.major.map(space => space / 16 + (space > 0 ? 'rem' : 0)),
	// };

	// colors
	let tints = {};
	Object.keys(colors).map(color => (tints = { ...tints, ...makeTints(colors[color], color) }));
	const COLORS = {
		tints,
		...colors,
	};

	// layout
	const LAYOUT = layout;

	// type
	const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
	const errors = [];
	const TYPE = `
	{
		files: ${JSON.stringify(convertFonts(files))},
		bodyFont: {
			fontFamily: bodyFont,
			${weights.map((weight, i) => {
				if (typeof bodyFont.weights[i] !== 'string' || !weights.includes(bodyFont.weights[i])) {
					errors.push(
						`The weights array in the brand token for "${BRAND}" contains a wrong item "${bodyFont.weights[i]}"`
					);
				}

				return `${weight}: {
						fontFamily: bodyFont,
						fontWeight: ${bodyFont.weights[i]},
					}`;
			})}
		},
		brandFont: {
			fontFamily: brandFont,
			${weights.map((weight, i) => {
				if (typeof brandFont.weights[i] !== 'string' || !weights.includes(brandFont.weights[i])) {
					errors.push(
						`The weights array in the brand token for "${BRAND}" contains a wrong item "${brandFont.weights[i]}"`
					);
				}

				return `${weight}: {
						fontFamily: brandFont,
						fontWeight: ${brandFont.weights[i]},
					}`;
			})}
		},
	};`;

	if (errors.length > 0) {
		throw errors.join('\n');
	}

	// packs
	const PACKS = packs;

	console.log();
	cfonts.say(`${BRAND} TOKENS`, {
		font: 'chrome',
		colors: [COLORS.primary, COLORS.hero, COLORS.borderDark],
		space: false,
	});

	return `
		const bodyFont = ${JSON.stringify(bodyFont.fontFamily)};
		const brandFont = ${JSON.stringify(brandFont.fontFamily)};
		export const SPACING = ( unit, minor, rem = true ) => {
			return ( unit * 6 - (minor ? 3 : 0) ) / 16 + (rem ? (unit > 0 ? 'rem' : 0) : 0);
		};
		export const COLORS = ${JSON.stringify(COLORS)};
		export const LAYOUT = ${JSON.stringify(LAYOUT)};
		export const TYPE = ${TYPE};
		export const PACKS = ${JSON.stringify(PACKS)};
		export const BRAND = "${BRAND}";
		export default {
			SPACING,
			COLORS,
			LAYOUT,
			TYPE,
			PACKS,
			BRAND,
		};
	`;
}

module.exports = build;
