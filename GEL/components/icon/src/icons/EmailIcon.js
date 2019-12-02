import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const EmailIcon = props => (
	<Icon icon="EmailIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,2 L22,2 C23.1045695,2 24,2.8954305 24,4 L24,20 C24,21.1045695 23.1045695,22 22,22 L2,22 C0.8954305,22 -1.64108609e-15,21.1045695 -1.77635684e-15,20 L-1.77635684e-15,4 C-1.91162759e-15,2.8954305 0.8954305,2 2,2 Z M22,9 L22,6 L12,12 L2,6 L2,9 L12,15 L22,9 Z"
		/>
	</Icon>
);

EmailIcon.defaultProps = {
	...defaultProps,
	label: 'Email',
};
EmailIcon.propTypes = propTypes;
