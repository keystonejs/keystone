import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const StopwatchIcon = props => (
	<Icon icon="StopwatchIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M18.6181506,6.50316976 L20.1213203,5 L21.5355339,6.41421356 L19.9788158,7.9709317 C21.2474477,9.64720474 22,11.7357184 22,14 C22,19.5228475 17.5228475,24 12,24 C6.4771525,24 2,19.5228475 2,14 C2,8.4771525 6.4771525,4 12,4 C14.5378379,4 16.854872,4.94537379 18.6181506,6.50316976 L18.6181506,6.50316976 Z M12,22 C16.418278,22 20,18.418278 20,14 C20,9.581722 16.418278,6 12,6 C7.581722,6 4,9.581722 4,14 C4,18.418278 7.581722,22 12,22 Z M8,0 L16,0 L16,2 L8,2 L8,0 Z M11,8 L13,8 L13,16 L11,16 L11,8 Z"
		/>
	</Icon>
);

StopwatchIcon.defaultProps = {
	...defaultProps,
	label: 'Stopwatch',
};
StopwatchIcon.propTypes = propTypes;
