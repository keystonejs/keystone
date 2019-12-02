import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const WordFileIcon = props => (
	<Icon icon="WordFileIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,0 L16,0 L22,6 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,2 L2,2 C2,0.8954305 2.8954305,2.02906125e-16 4,0 L4,0 Z M4,2 L4,22 L20,22 L20,6 L16,6 L16,2 L4,2 Z M14.5697731,10 L18,10 L15.3919202,20 L13.3722839,20 L11.9990343,14.0870163 L10.4648318,20 L8.27458555,20 L6,10 L8.24110736,10 L9.40318687,16.2124148 L10.9547723,10 L13.0986641,10 L14.4339289,16.2124148 L15.4595204,11.7940864 L14.5697731,11.7940864 L14.5697731,10 Z"
		/>
	</Icon>
);

WordFileIcon.defaultProps = {
	...defaultProps,
	label: 'Word File',
};
WordFileIcon.propTypes = propTypes;
