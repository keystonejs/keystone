import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const TickIcon = props => (
	<Icon icon="TickIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="8.6 15.6 4.4 11.4 3 12.8 8.6 18.4 20.6 6.4 19.2 5"
		/>
	</Icon>
);

TickIcon.defaultProps = {
	...defaultProps,
	label: 'Tick',
};
TickIcon.propTypes = propTypes;
