import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CafeIcon = props => (
	<Icon icon="CafeIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,2 L2,2 L2,16 C2,18.21 3.79,20 6,20 L16,20 C18.21,20 20,18.21 20,16 L20,12 L22,12 C23.11,12 24,11.11 24,10 L24,4 C24,2.89 23.11,2 22,2 Z M22,10 L20,10 L20,4 L22,4 L22,10 Z M0,24 L24,24 L24,22 L0,22 L0,24 Z"
		/>
	</Icon>
);

CafeIcon.defaultProps = {
	...defaultProps,
	label: 'Cafe',
};
CafeIcon.propTypes = propTypes;
