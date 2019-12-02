import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const PhoneIcon = props => (
	<Icon icon="PhoneIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M7,2 L17,2 C18.1045695,2 19,2.8954305 19,4 L19,22 C19,23.1045695 18.1045695,24 17,24 L7,24 C5.8954305,24 5,23.1045695 5,22 L5,4 L5,4 C5,2.8954305 5.8954305,2 7,2 L7,2 Z M17,19 L17,5 L7,5 L7,19 L17,19 Z M12,23 C12.83,23 13.5,22.33 13.5,21.5 C13.5,20.67 12.83,20 12,20 C11.17,20 10.5,20.67 10.5,21.5 C10.5,22.33 11.17,23 12,23 Z"
		/>
	</Icon>
);

PhoneIcon.defaultProps = {
	...defaultProps,
	label: 'Phone',
};
PhoneIcon.propTypes = propTypes;
