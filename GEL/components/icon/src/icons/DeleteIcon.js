import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const DeleteIcon = props => (
	<Icon icon="DeleteIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,6 L20,6 L20,22 C20,23.1045695 19.1045695,24 18,24 L6,24 C4.8954305,24 4,23.1045695 4,22 L4,6 Z M17,2 L7,2 L8,0 L16,0 L17,2 Z M4,2 L20,2 C20.5522847,2 21,2.44771525 21,3 L21,4 L3,4 L3,3 C3,2.44771525 3.44771525,2 4,2 L4,2 Z"
		/>
	</Icon>
);

DeleteIcon.defaultProps = {
	...defaultProps,
	label: 'Delete',
};
DeleteIcon.propTypes = propTypes;
