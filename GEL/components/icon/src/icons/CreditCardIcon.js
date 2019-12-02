import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CreditCardIcon = props => (
	<Icon icon="CreditCardIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,2 L22,2 C23.1045695,2 24,2.8954305 24,4 L24,20 C24,21.1045695 23.1045695,22 22,22 L2,22 C0.8954305,22 1.3527075e-16,21.1045695 0,20 L0,4 C-1.3527075e-16,2.8954305 0.8954305,2 2,2 Z M2,6 L2,10 L22,10 L22,6 L2,6 Z"
		/>
	</Icon>
);

CreditCardIcon.defaultProps = {
	...defaultProps,
	label: 'Credit Card',
};
CreditCardIcon.propTypes = propTypes;
