import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ExpandMoreIcon = props => (
	<Icon icon="ExpandMoreIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="12 13.588 5.412 7 4 8.412 12 16.412 20 8.412 18.588 7"
		/>
	</Icon>
);

ExpandMoreIcon.defaultProps = {
	...defaultProps,
	label: 'Expand More',
};
ExpandMoreIcon.propTypes = propTypes;
