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

export const Badge = ({ look, value, ...props }) => {
	const { COLORS, BRAND, TYPE, [pkg.name]: overridesWithTokens } = useBrand();

	let color = '#fff';
	if (look === 'hero' && BRAND === 'STG') {
		color = COLORS.text;
	}
	if (look === 'faint') {
		color = COLORS.muted;
	}

	const overrides = {
		primary: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		hero: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		neutral: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		faint: {
			css: {
				color,
				backgroundColor: '#fff',
				borderColor: COLORS.border,
			},
		},
		success: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		info: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		warning: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		danger: {
			css: {
				color,
				backgroundColor: COLORS[look],
				borderColor: COLORS[look],
			},
		},
		Wrapper,
	};
	merge(overrides, overridesWithTokens);

	return (
		<span
			css={{
				border: `1px solid transparent`,
				borderRadius: '0.75rem',
				display: 'inline-block',
				fontSize: '0.875rem',
				lineHeight: 1,
				minWidth: '0.625rem',
				padding: '0.25rem 0.4375rem',
				textAlign: 'center',
				verticalAlign: 'baseline',
				whiteSpace: 'nowrap',
				...TYPE.bodyFont[700],
				...overrides[look].css,

				'@media print': {
					color: '#000',
					backgroundColor: '#fff',
					border: '1px solid #000',
				},
			}}
			{...props}
		>
			<overrides.Wrapper look={look}>{value}</overrides.Wrapper>
		</span>
	);
};

// ==============================
// Types
// ==============================

Badge.propTypes = {
	/**
	 * Badge look
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
	]),

	/**
	 * Badge text
	 */
	value: PropTypes.string.isRequired,
};

Badge.defaultProps = {
	look: 'neutral',
};
