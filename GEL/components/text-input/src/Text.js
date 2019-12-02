/** @jsx jsx */

import { jsx, useBrand, useMediaQuery } from '@westpac/core';
import { round, sizeMap } from './_utils';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

export const Text = ({ size, width, inline, invalid, children, ...props }) => {
	const { COLORS, PACKS, TYPE } = useBrand();
	const mq = useMediaQuery();

	// We'll add important to focus state for text inputs so they are always visible even with the useFocus helper
	const focus = { ...PACKS.focus };
	focus.outline += ' !important';
	const borderWidth = 1; //px
	const lineHeight = 1.5;
	const extras = `${(p => `${p} + ${p}`)(sizeMap[size].padding[1])} + ${(b => `${b} + ${b}`)(
		`${borderWidth}px`
	)}`;

	return (
		<input
			css={mq({
				boxSizing: 'border-box',
				display: inline ? ['block', 'inline-block'] : 'block',
				width: inline ? ['100%', 'auto'] : '100%',
				appearance: 'none',
				lineHeight: lineHeight,
				color: COLORS.text,
				backgroundColor: '#fff',
				border: `${borderWidth}px solid ${
					invalid || props.ariaInvalid ? COLORS.danger : COLORS.borderDark
				}`,
				borderRadius: '0.1875rem',
				transition: 'border 0.2s ease',
				verticalAlign: inline && 'middle',
				padding: sizeMap[size].padding.join(' '),
				fontSize: sizeMap[size].fontSize,
				height: `calc(${lineHeight}em + ${(p => `${p[0]} + ${p[2] || p[0]}`)(
					sizeMap[size].padding
				)} + ${2 * borderWidth}px)`,
				...TYPE.bodyFont[400],

				'&::placeholder': {
					opacity: 1, // Override Firefox's unusual default opacity
					color: COLORS.tints.text50,
					...TYPE.bodyFont[300],
				},

				// Focus styling (for all, not just keyboard users)
				':focus': {
					...focus,
				},

				// Disabled and read-only inputs
				':disabled, &[readonly]': {
					cursor: 'not-allowed',
					opacity: 1, // iOS fix for unreadable disabled content
					backgroundColor: COLORS.light,
					color: COLORS.muted,
				},

				// Disable number input spinners/steppers
				'&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
					margin: 0,
					appearance: 'none',
				},
				maxWidth: width && `calc(${extras} + ${round(width * 1.81)}ex)`,
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

Text.propTypes = {
	/**
	 * Component size
	 */
	size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']).isRequired,

	/**
	 * Component width (in chars).
	 *
	 * This prop sets a fixed width, measured in characters.
	 */
	width: PropTypes.oneOf([2, 3, 4, 5, 10, 20, 30]),

	/**
	 * Inline mode
	 */
	inline: PropTypes.bool.isRequired,

	/**
	 * Invalid input mode
	 */
	invalid: PropTypes.bool.isRequired,
};

Text.defaultProps = {
	size: 'medium',
	inline: false,
	invalid: false,
	type: 'text',
};
