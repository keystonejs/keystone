import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const HouseIcon = props => (
	<Icon icon="HouseIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="12 0 0 12 4 12 4 24 10 24 10 17 14 17 14 24 20 24 20 12 24 12"
		/>
	</Icon>
);

HouseIcon.defaultProps = {
	...defaultProps,
	label: 'House',
};
HouseIcon.propTypes = propTypes;
