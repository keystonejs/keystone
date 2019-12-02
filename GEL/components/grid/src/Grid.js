/** @jsx jsx */

import { jsx, useMediaQuery } from '@westpac/core';
import PropTypes from 'prop-types';

// ==============================
// Utils
// ==============================

export const stringVal = v => (typeof v === 'number' ? `${v}px` : v);
export const repeatNumeric = v => (typeof v === 'number' ? `repeat(${v}, 1fr)` : v);
export const formatAreas = areas => areas.map(area => `"${area}"`).join(' ');

// ==============================
// Component
// ==============================

/**
 * A group of `Cell` components must be wrapped in a `Grid`.
 */
export const Grid = ({
	alignContent,
	areas,
	columnGap,
	columns,
	flow,
	gap,
	height,
	justifyContent,
	minRowHeight,
	rowGap,
	rows,
	...props
}) => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				alignContent: alignContent,
				columnGap: columnGap,
				display: 'grid',
				gridAutoFlow: flow,
				gridAutoRows: `minmax(${stringVal(minRowHeight)}, auto)`,
				gridGap: gap,
				gridTemplateAreas: areas ? formatAreas(areas) : null,
				gridTemplateColumns: repeatNumeric(columns),
				gridTemplateRows: rows ? repeatNumeric(rows) : null,
				height: height,
				justifyContent: justifyContent,
				rowGap: rowGap,
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

Grid.propTypes = {
	/**
	 * The `align-content` CSS property.
	 */
	alignContent: PropTypes.oneOf([
		'baseline',
		'center',
		'end',
		'first baseline',
		'flex-end',
		'flex-start',
		'last baseline',
		'normal',
		'space-around',
		'space-between',
		'space-evenly',
		'start',
		'stretch',
	]),

	/**
	 * The `grid-template-areas` CSS property. Pass an array of strings, e.g. `["a a", "b c"]`.
	 */
	areas: PropTypes.arrayOf(PropTypes.string),

	/**
	 * The `column-gap` CSS property.
	 */
	columnGap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

	/**
	 * The `grid-template-columns` CSS property. When a number is passed it is a
	 * shorthand to specify the number of columns.
	 */
	columns: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

	/**
	 * The `grid-auto-flow` CSS property.
	 */
	flow: PropTypes.oneOf(['column dense', 'column', 'dense', 'row dense', 'row']).isRequired,

	/**
	 * The `grid-gap` CSS property.
	 */
	gap: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.number),
		PropTypes.arrayOf(PropTypes.string),
	]).isRequired,

	/**
	 * The `height` CSS property
	 */
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

	/**
	 * The `justify-content` CSS property.
	 */
	justifyContent: PropTypes.oneOf([
		'center',
		'end',
		'flex-end',
		'flex-start',
		'left',
		'normal',
		'right',
		'space-around',
		'space-between',
		'space-evenly',
		'start',
		'stretch',
	]),

	/**
	 * Minimum height of each row.
	 */
	minRowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

	/**
	 * The `row-gap` CSS property.
	 */
	rowGap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

	/**
	 * The `grid-template-rows` CSS property. When a number is passed it is a
	 * shorthand to specify the number of rows.
	 */
	rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Grid.defaultProps = {
	columns: 12,
	gap: ['1.2rem', '2.4rem'],
	flow: 'row',
	height: 'auto',
	minRowHeight: '2rem',
};
