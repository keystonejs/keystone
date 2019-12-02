import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CalendarIcon = props => (
	<Icon icon="CalendarIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M20,2 L22,2 C23.1045695,2 24,2.8954305 24,4 L24,22 C24,23.1045695 23.1045695,24 22,24 L2,24 C0.8954305,24 1.3527075e-16,23.1045695 0,22 L0,4 C-1.3527075e-16,2.8954305 0.8954305,2 2,2 L4,2 L4,0 L6,0 L6,2 L18,2 L18,0 L20,0 L20,2 Z M2,8 L2,22 L22,22 L22,8 L2,8 Z M14,14 L20,14 L20,20 L14,20 L14,14 Z"
		/>
	</Icon>
);

CalendarIcon.defaultProps = {
	...defaultProps,
	label: 'Calendar',
};
CalendarIcon.propTypes = propTypes;
