import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const HeadsetIcon = props => (
	<Icon icon="HeadsetIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,21 L22,10 C22,4.4771525 17.5228475,0 12,0 C6.4771525,0 2,4.4771525 2,10 L2,17 C2,18.6568542 3.34314575,20 5,20 L8,20 L8,12 L4,12 L4,10 C4,5.581722 7.581722,2 12,2 C16.418278,2 20,5.581722 20,10 L20,12 L16,12 L16,20 L20,20 L20,20.25 C20,21.2164983 19.3604068,22 18.5714286,22 L12,22 L12,24 L19,24 C20.6568542,24 22,22.6568542 22,21 Z"
		/>
	</Icon>
);

HeadsetIcon.defaultProps = {
	...defaultProps,
	label: 'Headset',
};
HeadsetIcon.propTypes = propTypes;
