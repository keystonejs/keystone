import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const UmbrellaIcon = props => (
	<Icon icon="UmbrellaIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M9,22 C7.8954305,22 7,21.1045695 7,20 L5,20 C5,22.209139 6.790861,24 9,24 C11.209139,24 13,22.209139 13,20 L13,12 L23.9178524,12 C23.4380073,6.18357693 18.8100281,1.54335515 12.9990298,1.04444955 C13,0.44771525 12.5522847,0 12,0 C11.4477153,0 11,0.44771525 11,1 C5.15134535,1.49983643 0.482096586,6.15628579 0,12 L11,12 L11,20 C11,21.1045695 10.1045695,22 9,22 Z"
		/>
	</Icon>
);

UmbrellaIcon.defaultProps = {
	...defaultProps,
	label: 'Umbrella',
};
UmbrellaIcon.propTypes = propTypes;
