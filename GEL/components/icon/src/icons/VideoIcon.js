import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const VideoIcon = props => (
	<Icon icon="VideoIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M18,10.375 L24,5.5 L24,18.5 L18,13.625 L18,18 C18,19.1045695 17.1045695,20 16,20 L2,20 C0.8954305,20 1.3527075e-16,19.1045695 0,18 L0,6 L0,6 C-1.3527075e-16,4.8954305 0.8954305,4 2,4 L2,4 L16,4 C17.1045695,4 18,4.8954305 18,6 L18,10.375 Z"
		/>
	</Icon>
);

VideoIcon.defaultProps = {
	...defaultProps,
	label: 'Video',
};
VideoIcon.propTypes = propTypes;
