import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ThumbUpIcon = props => (
	<Icon icon="ThumbUpIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M14,0 L5,0 C4.17,0 3.46,0.5 3.16,1.22 L0.14,8.27 C0.05,8.5 0,9.5 0,10 C7.34788079e-17,11.5 0.5,12 2,12 L8,12 L7.36,17.57 L7.33,17.89 C7.33,18.3 7.5,18.68 7.77,18.95 L8.83,20 L15.42,13.41 C15.78,13.05 16,12.55 16,12 L16,2 C16,0.9 15.1,0 14,0 Z M18,0 L18,12 L22,12 L22,0 L18,0 Z"
			transform="rotate(180 11 10)"
		/>
	</Icon>
);

ThumbUpIcon.defaultProps = {
	...defaultProps,
	label: 'Thumb Up',
};
ThumbUpIcon.propTypes = propTypes;
