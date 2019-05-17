/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

// BASE
// ------------------------------

const Svg = ({ color, size, stroke, ...props }) => (
	<svg
		fill="none"
		height={size}
		stroke={color}
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth={stroke}
		viewBox="0 0 24 24"
		width={size}
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	/>
);
Svg.propTypes = {
	color: PropTypes.string,
	size: PropTypes.number,
	stroke: PropTypes.number,
};
Svg.defaultProps = {
	color: 'currentColor',
	size: 24,
	stroke: 2,
};

// Icons
// https://feathericons.com
// ------------------------------

export const MicrophoneIcon = props => (
	<Svg {...props}>
		<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
		<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
		<line x1="12" y1="19" x2="12" y2="23" />
		<line x1="8" y1="23" x2="16" y2="23" />
	</Svg>
);
export const PinIcon = props => (
	<Svg {...props}>
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</Svg>
);
export const UserIcon = props => (
	<Svg {...props}>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</Svg>
);
