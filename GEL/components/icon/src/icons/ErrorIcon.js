import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ErrorIcon = props => (
	<Icon icon="ErrorIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M24,12 C24,18.627 18.62775,24 12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 C18.62775,0 24,5.373 24,12 Z M12,2 C6.47714286,2 2,6.47714286 2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 C22,6.47714286 17.5228571,2 12,2 Z M11,14 L11,6 L13,6 L13,14 L11,14 Z M11,18 L11,16 L13,16 L13,18 L11,18 Z"
		/>
	</Icon>
);

ErrorIcon.defaultProps = {
	...defaultProps,
	label: 'Error',
};
ErrorIcon.propTypes = propTypes;
