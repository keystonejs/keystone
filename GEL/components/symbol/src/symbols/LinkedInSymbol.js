import React from 'react';
import { propTypes, defaultProps, Symbol } from '../Symbol';

export const LinkedInSymbol = props => (
	<Symbol {...props}>
		<g fill="none" fillRule="evenodd">
			<rect fill="#0D7FB7" width="32" height="32" rx="2" />
			<path
				d="M22.2 26.65V19c0-1.9-.6-3.1-2.3-3.1-1.115.04-2.117.694-2.6 1.7-.21.335-.345.71-.4 1.1v8H12v-15h4.9v2.8h.4c.955-1.643 2.7-2.667 4.6-2.7 3.1 0 5.1 2.4 5.1 6.7v8.1h-4.8v.05z"
				fill="#FFF"
				fillRule="nonzero"
			/>
			<path fill="#FFF" d="M5 11.75h4.9v14.9H5z" />
			<circle fill="#FFF" cx="7.5" cy="7" r="2.5" />
		</g>
	</Symbol>
);

LinkedInSymbol.defaultProps = {
	...defaultProps,
	viewBoxWidth: 32,
	viewBoxHeight: 32,
	label: 'LinkedIn',
};
LinkedInSymbol.propTypes = propTypes;
