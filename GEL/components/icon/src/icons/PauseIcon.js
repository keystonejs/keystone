import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const PauseIcon = props => (
	<Icon icon="PauseIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M6,19 L10,19 L10,5 L6,5 L6,19 Z M14,5 L14,19 L18,19 L18,5 L14,5 Z"
		/>
	</Icon>
);

PauseIcon.defaultProps = {
	...defaultProps,
	label: 'Pause',
};
PauseIcon.propTypes = propTypes;
