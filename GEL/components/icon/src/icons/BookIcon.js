import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const BookIcon = props => (
	<Icon icon="BookIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,24 L6,24 C3.790861,24 2,22.209139 2,20 L2,4 C2,1.790861 3.790861,4.05812251e-16 6,0 L18,0 L18,16 L7,16 C5.34314575,16 4,17.3431458 4,19 C4,20.6568542 5.34314575,22 7,22 L20,22 L20,0 L22,0 L22,24 Z M6,18 L18,18 L18,20 L6,20 L6,18 Z"
		/>
	</Icon>
);

BookIcon.defaultProps = {
	...defaultProps,
	label: 'Book',
};
BookIcon.propTypes = propTypes;
