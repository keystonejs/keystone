import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const DropUpIcon = props => (
	<Icon icon="DropUpIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="5 8 12 16 19 8"
			transform="rotate(-180 12 12)"
		/>
	</Icon>
);

DropUpIcon.defaultProps = {
	...defaultProps,
	label: 'Drop Up',
};
DropUpIcon.propTypes = propTypes;
