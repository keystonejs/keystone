import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ExpandLessIcon = props => (
	<Icon icon="ExpandLessIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="12 9.824 18.588 16.412 20 15 12 7 4 15 5.412 16.412"
		/>
	</Icon>
);

ExpandLessIcon.defaultProps = {
	...defaultProps,
	label: 'Expand Less',
};
ExpandLessIcon.propTypes = propTypes;
