import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ContactIcon = props => (
	<Icon icon="ContactIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M18,2 L20,2 C21.1045695,2 22,2.8954305 22,4 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,4 C2,2.8954305 2.8954305,2 4,2 L6,2 L6,0 L8,0 L8,2 L16,2 L16,0 L18,0 L18,2 Z M6,18.6666667 L6,20 L18,20 L18,18.6666667 C18,16.8933333 14.0025,16 12,16 C9.9975,16 6,16.8933333 6,18.6666667 Z M12,14 C13.6575,14 15,12.6575 15,11 C15,9.3425 13.6575,8 12,8 C10.3425,8 9,9.3425 9,11 C9,12.6575 10.3425,14 12,14 Z"
		/>
	</Icon>
);

ContactIcon.defaultProps = {
	...defaultProps,
	label: 'Contact',
};
ContactIcon.propTypes = propTypes;
