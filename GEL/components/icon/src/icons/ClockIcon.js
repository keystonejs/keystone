import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ClockIcon = props => (
	<Icon icon="ClockIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,2 C6.47714286,2 2,6.47714286 2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 C22,6.47714286 17.5228571,2 12,2 M24,12 C24,18.627 18.62775,24 12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 C18.62775,0 24,5.373 24,12 M18,13 L18,15 L10,15 L10,5 L12,5 L12,13 L18,13 Z"
		/>
	</Icon>
);

ClockIcon.defaultProps = {
	...defaultProps,
	label: 'Clock',
};
ClockIcon.propTypes = propTypes;
