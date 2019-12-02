/** @jsx jsx */

import { jsx, useMediaQuery, asArray } from '@westpac/core';
import PropTypes from 'prop-types';

// ==============================
// Utils
// ==============================

const round = f => Math.round(f * 10) / 10; //1DP

const SymbolWrapper = ({ width, height, viewBoxWidth, viewBoxHeight, ...props }) => {
	const mq = useMediaQuery();

	const ratio = viewBoxWidth / viewBoxHeight;

	// Size styling (responsive)
	const widthArr = asArray(width || viewBoxWidth);
	const heightArr = asArray(height || viewBoxHeight);
	const styleSize = {
		width: width ? widthArr : heightArr.map(h => (h !== null ? round(h * ratio) : null)),
		height: width ? widthArr.map(w => (w !== null ? round(w / ratio) : null)) : heightArr,
	};

	return (
		<span
			css={mq({
				display: 'inline-block',
				flexShrink: 0,
				lineHeight: 1,
				verticalAlign: 'middle',
				...styleSize,
			})}
			{...props}
		/>
	);
};

// ==============================
// Component
// ==============================

export const Symbol = ({
	label,
	width,
	height,
	viewBoxWidth,
	viewBoxHeight,
	children,
	...props
}) => {
	return (
		<SymbolWrapper
			width={width}
			height={height}
			viewBoxWidth={viewBoxWidth}
			viewBoxHeight={viewBoxHeight}
			{...props}
		>
			<svg
				aria-label={label}
				xmlns="http://www.w3.org/2000/svg"
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
				role="img"
				focusable="false"
				style={{ width: '100%', height: '100%' }}
			>
				{children}
			</svg>
		</SymbolWrapper>
	);
};

// ==============================
// Types
// ==============================

export const propTypes = {
	/**
	 * String to use as the aria-label for the symbol. Set to an empty string if you
	 * are rendering the symbol with visible text to prevent accessibility label
	 * duplication.
	 */
	label: PropTypes.string,

	/**
	 * Set a symbol width in pixels.
	 *
	 * Symbol will scale to fit (height will be set automatically). Note: If both "width" and "height" props are provided "height" will be ignored.
	 */
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),

	/**
	 * Set a symbol height in pixels.
	 *
	 * Symbol will scale to fit (width will be set automatically). Note: If both "width" and "height" props are provided "height" will be ignored.
	 */
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
};

export const defaultProps = {};

Symbol.propTypes = propTypes;
Symbol.defaultProps = defaultProps;
