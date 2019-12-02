import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ThumbDownIcon = props => (
	<Icon icon="ThumbDownIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M16,4 L7,4 C6.17,4 5.46,4.5 5.16,5.22 L2.14,12.27 C2.05,12.5 2,13.5 2,14 C2,15.5 2.5,16 4,16 L10,16 L9.36,21.57 L9.33,21.89 C9.33,22.3 9.5,22.68 9.77,22.95 L10.83,24 L17.42,17.41 C17.78,17.05 18,16.55 18,16 L18,6 C18,4.9 17.1,4 16,4 Z M20,4 L20,16 L24,16 L24,4 L20,4 Z"
		/>
	</Icon>
);

ThumbDownIcon.defaultProps = {
	...defaultProps,
	label: 'Thumb Down',
};
ThumbDownIcon.propTypes = propTypes;
