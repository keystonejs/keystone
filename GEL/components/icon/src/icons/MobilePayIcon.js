import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MobilePayIcon = props => (
	<Icon icon="MobilePayIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M6,0 C4.8954305,2.02906125e-16 4,0.8954305 4,2 L4,22 C4,23.1045695 4.8954305,24 6,24 L16,24 C17.1045695,24 18,23.1045695 18,22 L18,14 L16,14 L16,20 L6,20 L6,4 L10,4 L10,0 L6,0 Z M12,9 C13.66,9 15,10.34 15,12 L12,12 L12,9 Z M12,5 C15.87,5 19,8.13 19,12 L17,12 C17,9.24 14.76,7 12,7 L12,5 Z M12,1 C18.08,1 23,5.92 23,12 L21,12 C21,7.03 16.97,3 12,3 L12,1 Z"
		/>
	</Icon>
);

MobilePayIcon.defaultProps = {
	...defaultProps,
	label: 'Mobile Pay',
};
MobilePayIcon.propTypes = propTypes;
