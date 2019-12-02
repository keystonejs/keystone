import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CalculatorIcon = props => (
	<Icon icon="CalculatorIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,0 L20,0 C21.1045695,-2.02906125e-16 22,0.8954305 22,2 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,2 C2,0.8954305 2.8954305,2.02906125e-16 4,0 Z M4,2 L4,8 L20,8 L20,2 L4,2 Z M12,16 L12,18 L20,18 L20,16 L12,16 Z M12,20 L12,22 L20,22 L20,20 L12,20 Z"
		/>
	</Icon>
);

CalculatorIcon.defaultProps = {
	...defaultProps,
	label: 'Calculator',
};
CalculatorIcon.propTypes = propTypes;
