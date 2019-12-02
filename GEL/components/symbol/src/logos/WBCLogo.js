import React from 'react';
import { propTypes, defaultProps, Symbol } from '../Symbol';

export const WBCLogo = props => (
	<Symbol {...props}>
		<path
			d="M24.4 25L17.6 4.1C16.7 0.9 15 0 12.6 0H0c1 0.4 1.6 2.9 1.6 2.9l6.1 21c0.7 2.6 2.9 4 5.4 4h13.3C25.4 27.8 24.4 25 24.4 25"
			fill="#D5002B"
		/>
		<path
			d="M44.6 25l6.8-20.9C52.3 0.9 54 0 56.4 0H69c-1 0.4-1.6 2.9-1.6 2.9l-6.1 21c-0.7 2.6-2.9 4-5.4 4H42.6C43.6 27.8 44.6 25 44.6 25"
			fill="#D5002B"
		/>
		<rect x="27" width="15" height="28" fill="#D5002B" />
	</Symbol>
);

WBCLogo.defaultProps = {
	...defaultProps,
	viewBoxWidth: 69,
	viewBoxHeight: 28,
	label: 'Westpac',
};
WBCLogo.propTypes = propTypes;
