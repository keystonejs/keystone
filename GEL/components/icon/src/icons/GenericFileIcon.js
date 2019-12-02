import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const GenericFileIcon = props => (
	<Icon icon="GenericFileIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,0 L16,0 L22,6 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,2 L2,2 C2,0.8954305 2.8954305,2.02906125e-16 4,0 L4,0 Z M4,2 L4,22 L20,22 L20,6 L16,6 L16,2 L4,2 Z M6,12 L18,12 L18,10 L6,10 L6,12 Z M6,16 L18,16 L18,14 L6,14 L6,16 Z M6,20 L18,20 L18,18 L6,18 L6,20 Z"
		/>
	</Icon>
);

GenericFileIcon.defaultProps = {
	...defaultProps,
	label: 'Generic File',
};
GenericFileIcon.propTypes = propTypes;
