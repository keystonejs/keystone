import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MoveToIcon = props => (
	<Icon icon="MoveToIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,0 C23.1,0 24,0.9 24,2 L24,22 C24,23.1 23.1,24 22,24 L4,24 C2.89,24 2,23.1 2,22 L2,18 L4,18 L4,22 L22,22 L22,2 L4,2 L4,6 L2,6 L2,2 C2,0.9 2.89,0 4,0 L22,0 Z M14,12 L8.015,18 L8.015,14 L0,14 L0,10 L8.015,10 L8.015,6 L14,12 Z"
		/>
	</Icon>
);

MoveToIcon.defaultProps = {
	...defaultProps,
	label: 'Move To',
};
MoveToIcon.propTypes = propTypes;
