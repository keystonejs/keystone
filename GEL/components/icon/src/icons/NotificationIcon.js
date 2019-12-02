import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const NotificationIcon = props => (
	<Icon icon="NotificationIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M14,3.25203497 C17.4504544,4.14012056 20,7.27232114 20,11 L20,17 L22,19 L22,20 L2,20 L2,19 L4,17 L4,11 C4,7.27232114 6.54954557,4.14012056 10,3.25203497 L10,2 C10,0.8954305 10.8954305,0 12,0 C13.1045695,0 14,0.8954305 14,2 L14,3.25203497 L14,3.25203497 Z M9,21 L15.003,21 C15.003,22.6568542 13.6591827,24 12.0015,24 C10.3438173,24 9,22.6568542 9,21 Z"
		/>
	</Icon>
);

NotificationIcon.defaultProps = {
	...defaultProps,
	label: 'Notification',
};
NotificationIcon.propTypes = propTypes;
