import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const AddIcon = props => (
	<Icon icon="AddIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="11 11 4 11 4 13 11 13 11 20 13 20 13 13 20 13 20 11 13 11 13 4 11 4"
		/>
	</Icon>
);

AddIcon.defaultProps = {
	...defaultProps,
	label: 'Add',
};
AddIcon.propTypes = propTypes;
