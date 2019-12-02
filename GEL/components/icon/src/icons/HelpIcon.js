import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const HelpIcon = props => (
	<Icon icon="HelpIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M24,12 C24,18.627 18.62775,24 12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 C18.62775,0 24,5.373 24,12 Z M12,2 C6.47714286,2 2,6.47714286 2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 C22,6.47714286 17.5228571,2 12,2 Z M11,18 L11,16 L13,16 L13,18 L11,18 Z M12,6 C14.21,6 16,7.79 16,10 C16,12.5 13,12.75 13,15 L11,15 C11,11.75 14,12 14,10 C14,8.9 13.1,8 12,8 C10.9,8 10,8.9 10,10 L8,10 C8,7.79 9.79,6 12,6 Z"
		/>
	</Icon>
);

HelpIcon.defaultProps = {
	...defaultProps,
	label: 'Help',
};
HelpIcon.propTypes = propTypes;
