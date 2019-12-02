import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const AtmIcon = props => (
	<Icon icon="AtmIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,24 L2,22 L22,22 L22,24 L2,24 Z M23,10 L20.3333333,10 L22,20 L2,20 L3.66666667,10 L1,10 C0.44771525,10 0,9.55228475 0,9 L0,1 C0,0.44771525 0.44771525,0 1,0 L23,0 C23.5522847,0 24,0.44771525 24,1 L24,9 C24,9.55228475 23.5522847,10 23,10 Z M19.6390792,18 L17.3057458,4 L6.69425418,4 L4.36092084,18 L19.6390792,18 Z"
		/>
	</Icon>
);

AtmIcon.defaultProps = {
	...defaultProps,
	label: 'Atm',
};
AtmIcon.propTypes = propTypes;
