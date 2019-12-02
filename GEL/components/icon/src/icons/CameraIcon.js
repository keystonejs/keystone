import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CameraIcon = props => (
	<Icon icon="CameraIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M6,4 L8,2 L16,2 L18,4 L22,4 C23.1045695,4 24,4.8954305 24,6 L24,20 C24,21.1045695 23.1045695,22 22,22 L2,22 C0.8954305,22 1.3527075e-16,21.1045695 0,20 L0,6 C-1.3527075e-16,4.8954305 0.8954305,4 2,4 L6,4 Z M12,19 C15.3137085,19 18,16.3137085 18,13 C18,9.6862915 15.3137085,7 12,7 C8.6862915,7 6,9.6862915 6,13 C6,16.3137085 8.6862915,19 12,19 Z"
		/>
	</Icon>
);

CameraIcon.defaultProps = {
	...defaultProps,
	label: 'Camera',
};
CameraIcon.propTypes = propTypes;
