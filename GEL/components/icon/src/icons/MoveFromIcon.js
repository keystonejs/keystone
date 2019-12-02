import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MoveFromIcon = props => (
	<Icon icon="MoveFromIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,0 L20,0 C21.11,0 22,0.9 22,2 L22,7 L20,5 L20,2 L2,2 L2,22 L20,22 L20,19 L22,17 L22,22 C22,23.1 21.11,24 20,24 L2,24 C0.9,24 0,23.1 0,22 L0,2 C0,0.9 0.9,0 2,0 Z M24,12 L18.015,18 L18.015,14 L10,14 L10,10 L18.015,10 L18.015,6 L24,12 Z"
		/>
	</Icon>
);

MoveFromIcon.defaultProps = {
	...defaultProps,
	label: 'Move From',
};
MoveFromIcon.propTypes = propTypes;
