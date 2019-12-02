import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const FilterIcon = props => (
	<Icon icon="FilterIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M2,12 L2,10 L4,10 L4,12 L2,12 Z M2,16 L2,14 L4,14 L4,16 L2,16 Z M2,8 L2,6 L4,6 L4,8 L2,8 Z M6,12 L6,10 L22,10 L22,12 L6,12 Z M6,16 L6,14 L22,14 L22,16 L6,16 Z M6,6 L22,6 L22,8 L6,8 L6,6 Z M16,18 L22,18 L19,21 L16,18 Z"
		/>
	</Icon>
);

FilterIcon.defaultProps = {
	...defaultProps,
	label: 'Filter',
};
FilterIcon.propTypes = propTypes;
