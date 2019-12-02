/** @jsx jsx */

import { jsx, useMediaQuery } from '@westpac/core';
import PropTypes from 'prop-types';

// ==============================
// Utils
// ==============================

// allow string or array values for height/width
const span = n => `span ${n}`;
const getEndSpan = c => (Array.isArray(c) ? c.map(span) : span(c));

// ==============================
// Component
// ==============================

export const Cell = ({ area, center, height, left, middle, top, width, ...props }) => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				gridArea: area,
				gridColumnEnd: !area && getEndSpan(width),
				gridColumnStart: left,
				gridRowEnd: !area && getEndSpan(height),
				gridRowStart: top,
				height: '100%',
				minWidth: 0,
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

Cell.propTypes = {
	/**
	 * The `grid-area` that this cell belongs to (if any).
	 */
	area: PropTypes.string,

	/**
	 * The cell height in units. When using an array the units are applied to the applicable breakpoints.
	 */
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,

	/**
	 * The `grid-column-start` CSS property.
	 */
	left: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),

	/**
	 * The `grid-row-start` CSS property.
	 */
	top: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),

	/**
	 * The cell width in units. When using an array the units are applied to the applicable breakpoints.
	 */
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,
};

Cell.defaultProps = {
	height: 1,
	width: 1,
};
