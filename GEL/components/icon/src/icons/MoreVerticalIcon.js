import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MoreVerticalIcon = props => (
	<Icon icon="MoreVerticalIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,7 C13.375,7 14.5,5.875 14.5,4.5 C14.5,3.125 13.375,2 12,2 C10.625,2 9.5,3.125 9.5,4.5 C9.5,5.875 10.625,7 12,7 Z M12,9.5 C10.625,9.5 9.5,10.625 9.5,12 C9.5,13.375 10.625,14.5 12,14.5 C13.375,14.5 14.5,13.375 14.5,12 C14.5,10.625 13.375,9.5 12,9.5 Z M12,17 C10.625,17 9.5,18.125 9.5,19.5 C9.5,20.875 10.625,22 12,22 C13.375,22 14.5,20.875 14.5,19.5 C14.5,18.125 13.375,17 12,17 Z"
		/>
	</Icon>
);

MoreVerticalIcon.defaultProps = {
	...defaultProps,
	label: 'More Vertical',
};
MoreVerticalIcon.propTypes = propTypes;
