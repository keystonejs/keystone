import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const PayToMobileIcon = props => (
	<Icon icon="PayToMobileIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,17 L2,19 C4.76,19 7,21.24 7,24 L9,24 C9,20.13 5.87,17 2,17 Z M2,21 L2,24 L5,24 C5,22.34 3.66,21 2,21 Z M2,13 C8.08,13 13,17.92 13,24 L11,24 C11,19.03 6.97,15 2,15 L2,13 Z M18,24 L15,24 C15,22.6043798 14.7800789,21.260125 14.3730012,20 L18,20 L18,4 L8,4 L8,12.4644213 C7.36250073,12.1321607 6.69400958,11.8511954 6,11.6269988 L6,2 C6,0.9 6.9,0 8,0 L18,0 C19.1,0 20,0.9 20,2 L20,22 C20,23.1 19.1,24 18,24 Z"
		/>
	</Icon>
);

PayToMobileIcon.defaultProps = {
	...defaultProps,
	label: 'Pay To Mobile',
};
PayToMobileIcon.propTypes = propTypes;
