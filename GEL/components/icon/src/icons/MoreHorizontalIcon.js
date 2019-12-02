import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MoreHorizontalIcon = props => (
	<Icon icon="MoreHorizontalIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4.5,9.5 C5.875,9.5 7,10.625 7,12 C7,13.375 5.875,14.5 4.5,14.5 C3.125,14.5 2,13.375 2,12 C2,10.625 3.125,9.5 4.5,9.5 Z M19.5,9.5 C20.875,9.5 22,10.625 22,12 C22,13.375 20.875,14.5 19.5,14.5 C18.125,14.5 17,13.375 17,12 C17,10.625 18.125,9.5 19.5,9.5 Z M12,9.5 C13.375,9.5 14.5,10.625 14.5,12 C14.5,13.375 13.375,14.5 12,14.5 C10.625,14.5 9.5,13.375 9.5,12 C9.5,10.625 10.625,9.5 12,9.5 Z"
		/>
	</Icon>
);

MoreHorizontalIcon.defaultProps = {
	...defaultProps,
	label: 'More Horizontal',
};
MoreHorizontalIcon.propTypes = propTypes;
