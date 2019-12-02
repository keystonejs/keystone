import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const RemoveIcon = props => (
	<Icon icon="RemoveIcon" {...props}>
		<polygon fill="currentColor" fillRule="evenodd" points="4 11 4 13 20 13 20 11" />
	</Icon>
);

RemoveIcon.defaultProps = {
	...defaultProps,
	label: 'Remove',
};
RemoveIcon.propTypes = propTypes;
