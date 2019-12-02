/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import PropTypes from 'prop-types';
import pkg from '../package.json';
import { Fragment } from 'react';

// ==============================
// Overwrite component
// ==============================

const Wrapper = ({ children, look }) => <Fragment>{children}</Fragment>;

// ==============================
// Component
// ==============================

export const Label = ({ look, value, tag: Tag, ...props }) => {
	const { COLORS, TYPE, BRAND, [pkg.name]: overridesWithTokens } = useBrand();

	let color = '#fff';
	if (look === 'hero' && BRAND === 'STG') {
		color = COLORS.text;
	}
	if (look === 'faint') {
		color = COLORS.muted;
	}

	if (props.href) {
		Tag = 'a';
	}
	if (props.onClick) {
		Tag = 'button';
	}

	const overrides = {
		primary: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		hero: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		neutral: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		faint: {
			css: {
				color,
				backgroundColor: COLORS.light,
				border: `1px solid ${COLORS.border}`,
			},
			hoverCSS: {
				backgroundColor: '#fff',
			},
		},
		success: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		info: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		warning: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		danger: {
			css: {
				color,
				backgroundColor: COLORS[look],
				border: `1px solid ${COLORS[look]}`,
			},
			hoverCSS: {
				backgroundColor: COLORS.tints[`${look}50`],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		Wrapper,
	};
	merge(overrides, overridesWithTokens);

	return (
		<Tag
			css={{
				display: 'inline-block',
				appearance: 'none',
				borderRadius: '0.125rem',
				fontSize: '0.75rem',
				lineHeight: 'normal',
				padding: '0.0625rem 0.375rem',
				textAlign: 'center',
				verticalAlign: 'baseline',
				whiteSpace: 'nowrap',
				...overrides[look].css,
				...TYPE.bodyFont[400],

				':empty': {
					display: 'none',
				},

				...(Tag === 'a' || Tag === 'button'
					? {
							textDecoration: 'none',
							':hover, :focus': {
								cursor: 'pointer',
								...overrides[look].hoverCSS,
							},
					  }
					: {}),

				'@media print': {
					color: '#000',
					backgroundColor: '#fff',
					border: '1px solid #000',
				},
			}}
			{...props}
		>
			<overrides.Wrapper look={look}>{value}</overrides.Wrapper>
		</Tag>
	);
};

// ==============================
// Types
// ==============================

Label.propTypes = {
	/**
	 * Label look
	 */
	look: PropTypes.oneOf([
		'primary',
		'hero',
		'neutral',
		'faint',
		'success',
		'info',
		'warning',
		'danger',
	]).isRequired,

	/**
	 * Label tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,

	/**
	 * Label text
	 */
	value: PropTypes.node.isRequired,
};

Label.defaultProps = {
	look: 'primary',
	tag: 'span',
};
