const { COLORS } = require('./colors');
const { TYPE } = require('./type');

module.exports = {
	PACKS: {
		headline: {
			1: {
				fontWeight: 700,
				fontSize: '3.375rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			2: {
				fontWeight: 700,
				fontSize: '3rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			3: {
				fontWeight: 700,
				fontSize: '2.625rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			4: {
				fontWeight: 700,
				fontSize: '2.25rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			5: {
				fontWeight: 700,
				fontSize: '1.875rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			6: {
				fontWeight: 700,
				fontSize: '1.5rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			7: {
				fontWeight: 700,
				fontSize: '1.125rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			8: {
				fontWeight: 700,
				fontSize: '1rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
			9: {
				fontWeight: 700,
				fontSize: '0.875rem',
				lineHeight: 1.2,
				fontFamily: TYPE.bodyFont.fontFamily,
			},
		},
		lead: {
			marginBottom: '1.3125rem',
			fontSize: ['1rem', '1.125rem'],
			fontWeight: 300,
			lineHeight: 1.4,
		},
		link: {
			color: COLORS.primary,
			textDecoration: 'underline',
			':hover': {
				color: COLORS.primary,
				textDecoration: 'underline',
			},
		},
		focus: {
			outline: `2px solid ${COLORS.focus}`,
			outlineOffset: '3px',
		},
	},
};
