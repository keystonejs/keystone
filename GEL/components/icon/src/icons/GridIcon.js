import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const GridIcon = props => (
	<Icon icon="GridIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M20,2 L4,2 C2.9,2 2,2.9 2,4 L2,20 C2,21.1 2.9,22 4,22 L20,22 C21.1,22 22,21.1 22,20 L22,4 C22,2.9 21.1,2 20,2 Z M8,20 L4,20 L4,16 L8,16 L8,20 Z M8,14 L4,14 L4,10 L8,10 L8,14 Z M8,8 L4,8 L4,4 L8,4 L8,8 Z M14,20 L10,20 L10,16 L14,16 L14,20 Z M14,14 L10,14 L10,10 L14,10 L14,14 Z M14,8 L10,8 L10,4 L14,4 L14,8 Z M20,20 L16,20 L16,16 L20,16 L20,20 Z M20,14 L16,14 L16,10 L20,10 L20,14 Z M20,8 L16,8 L16,4 L20,4 L20,8 Z"
		/>
	</Icon>
);

GridIcon.defaultProps = {
	...defaultProps,
	label: 'Grid',
};
GridIcon.propTypes = propTypes;
