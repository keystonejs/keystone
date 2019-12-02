import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ListIcon = props => (
	<Icon icon="ListIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,13 L4,13 L4,11 L2,11 L2,13 Z M2,17 L4,17 L4,15 L2,15 L2,17 Z M2,9 L4,9 L4,7 L2,7 L2,9 Z M6,13 L22,13 L22,11 L6,11 L6,13 Z M6,17 L22,17 L22,15 L6,15 L6,17 Z M6,7 L6,9 L22,9 L22,7 L6,7 Z"
		/>
	</Icon>
);

ListIcon.defaultProps = {
	...defaultProps,
	label: 'List',
};
ListIcon.propTypes = propTypes;
