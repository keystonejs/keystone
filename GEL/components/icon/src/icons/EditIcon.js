import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const EditIcon = props => (
	<Icon icon="EditIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M0,19.0006943 L0,24 L4.99930565,24 L19.7439245,9.2553812 L14.7446188,4.25607555 L0,19.0006943 Z M23.6100542,5.38925149 C24.1299819,4.86932371 24.1299819,4.02944036 23.6100542,3.50951257 L20.4904874,0.389945841 C19.9705596,-0.129981947 19.1306763,-0.129981947 18.6107485,0.389945841 L16.1710873,2.829607 L21.170393,7.82891265 L23.6100542,5.38925149 Z"
		/>
	</Icon>
);

EditIcon.defaultProps = {
	...defaultProps,
	label: 'Edit',
};
EditIcon.propTypes = propTypes;
