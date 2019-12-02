import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ExitIcon = props => (
	<Icon icon="ExitIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22.0144284,3.41682007 L12.4142136,13.0170349 L11,11.6028214 L20.6028214,2 L16.0144284,2 L16.0144284,0 L24.0144284,0 L24.0144284,8 L22.0144284,8 L22.0144284,3.41682007 Z M12,0 L12,2 C6.47714286,2 2,6.47714286 2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 L24,12 C24,18.627 18.62775,24 12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 Z"
		/>
	</Icon>
);

ExitIcon.defaultProps = {
	...defaultProps,
	label: 'Exit',
};
ExitIcon.propTypes = propTypes;
