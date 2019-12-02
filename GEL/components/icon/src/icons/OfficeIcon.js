import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const OfficeIcon = props => (
	<Icon icon="OfficeIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M14,6 L24,6 L24,24 L0,24 L0,0 L14,0 L14,6 Z M14,8 L14,22 L22,22 L22,8 L14,8 Z M16,10 L20,10 L20,12 L16,12 L16,10 Z M16,14 L20,14 L20,16 L16,16 L16,14 Z M16,18 L20,18 L20,20 L16,20 L16,18 Z M2,4 L2,8 L6,8 L6,4 L2,4 Z M8,4 L8,8 L12,8 L12,4 L8,4 Z M2,10 L2,14 L6,14 L6,10 L2,10 Z M8,10 L8,14 L12,14 L12,10 L8,10 Z M2,16 L2,20 L6,20 L6,16 L2,16 Z M8,16 L8,20 L12,20 L12,16 L8,16 Z"
		/>
	</Icon>
);

OfficeIcon.defaultProps = {
	...defaultProps,
	label: 'Office',
};
OfficeIcon.propTypes = propTypes;
