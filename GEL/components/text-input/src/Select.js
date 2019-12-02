/** @jsx jsx */

import { jsx, useBrand, useMediaQuery } from '@westpac/core';
import svgToTinyDataURI from 'mini-svg-data-uri';
import { round, sizeMap } from './_utils';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

export const Select = ({ size, width, inline, invalid, children, data, ...props }) => {
	const { COLORS, PACKS, TYPE } = useBrand();
	const mq = useMediaQuery();

	const childrenData = [];
	if (data) {
		data.map(({ label, ...rest }, index) => {
			childrenData.push(
				<option key={index} {...rest}>
					{label}
				</option>
			);
		});
	}

	// Common styling
	// We'll add important to focus state for text inputs so they are always visible even with the useFocus helper
	const focus = { ...PACKS.focus };
	focus.outline += ' !important';
	const borderWidth = 1; //px
	const lineHeight = 1.5;
	const caretSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8"><path fill="${COLORS.muted}" fill-rule="evenodd" d="M0 0l7 8 7-8z"/></svg>`;
	const caretGap = '0.5rem';
	const caretWidth = '14px';
	const sub = `${(p => `${p} + ${p}`)(sizeMap[size].padding[1])} + ${(b => `${b} + ${b}`)(
		`${borderWidth}px`
	)}`;
	const extras = `${sub} + ${caretWidth} + ${caretGap}`; // Add width for caret if a select

	return (
		<select
			css={mq({
				boxSizing: 'border-box',
				display: inline ? ['block', 'inline-block'] : 'block',
				width: inline ? ['100%', 'auto'] : '100%',
				appearance: 'none',
				lineHeight: lineHeight,
				...TYPE.bodyFont[400],
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
				maxWidth:
					width && `calc(${extras} + ${caretWidth} + ${caretGap} + ${round(width * 1.81)}ex)`,
				paddingRight: `calc(${sizeMap[size].padding[1]} + ${caretWidth} + ${caretGap})`,
				backgroundImage: `url("${svgToTinyDataURI(caretSVG)}")`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: `right ${sizeMap[size].padding[1]} center`,

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
				':disabled': {
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

				// Remove the caret on `<select>`s in IE10+.
				'&::-ms-expand': {
					display: 'none',
				},

				'@media print': {
					backgroundColor: 'transparent',

					':disabled': {
						backgroundColor: '#fff',
					},
				},
			})}
			{...props}
		>
			{data ? childrenData : children}
		</select>
	);
};

// ==============================
// Types
// ==============================

Select.propTypes = {
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

	/**
	 * Component children.
	 *
	 * Note: Only `select` type inputs render children.
	 */
	children: PropTypes.node,
};

Select.defaultProps = {
	size: 'medium',
	inline: false,
	invalid: false,
};
