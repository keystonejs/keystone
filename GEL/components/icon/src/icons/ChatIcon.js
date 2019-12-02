import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ChatIcon = props => (
	<Icon icon="ChatIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 L22,0 C23.1045695,-2.02906125e-16 24,0.8954305 24,2 L24,16 C24,17.1045695 23.1045695,18 22,18 L6,18 L0,24 L0,2 Z M4,4 L4,6 L20,6 L20,4 L4,4 Z M4,8 L4,10 L20,10 L20,8 L4,8 Z M4,12 L4,14 L14,14 L14,12 L4,12 Z"
		/>
	</Icon>
);

ChatIcon.defaultProps = {
	...defaultProps,
	label: 'Chat',
};
ChatIcon.propTypes = propTypes;
