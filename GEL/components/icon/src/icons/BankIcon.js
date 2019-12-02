import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const BankIcon = props => (
	<Icon icon="BankIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,10 L8,10 L8,20 L4,20 L4,10 Z M2,24 L2,22 L22,22 L22,24 L2,24 Z M16,10 L20,10 L20,20 L16,20 L16,10 Z M10,10 L14,10 L14,20 L10,20 L10,10 Z M12,0 L22,6 L22,8 L2,8 L2,6 L12,0 Z"
		/>
	</Icon>
);

BankIcon.defaultProps = {
	...defaultProps,
	label: 'Bank',
};
BankIcon.propTypes = propTypes;
