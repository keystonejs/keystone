import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const EftposIcon = props => (
	<Icon icon="EftposIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M14,18 L14,22 L16,22 L16,18 L18,18 L18,23 C18,23.5522847 17.5522847,24 17,24 L7,24 C6.44771525,24 6,23.5522847 6,23 L6,18 L14,18 Z M6,0 L18,0 C19.1045695,-2.02906125e-16 20,0.8954305 20,2 L20,14 C20,15.1045695 19.1045695,16 18,16 L6,16 C4.8954305,16 4,15.1045695 4,14 L4,2 C4,0.8954305 4.8954305,2.02906125e-16 6,0 Z M6,2 L6,8 L18,8 L18,2 L6,2 Z"
		/>
	</Icon>
);

EftposIcon.defaultProps = {
	...defaultProps,
	label: 'Eftpos',
};
EftposIcon.propTypes = propTypes;
