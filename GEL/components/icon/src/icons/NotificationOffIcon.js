import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const NotificationOffIcon = props => (
	<Icon icon="NotificationOffIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M9,21 L15.003,21 C15.003,22.6568542 13.6591827,24 12.0015,24 C10.3438173,24 9,22.6568542 9,21 Z M10,3.25203497 L10,2 C10,0.8954305 10.8954305,-8.8817842e-16 12,-8.8817842e-16 C13.1045695,-8.8817842e-16 14,0.8954305 14,2 L14,3.25203497 C17.4504544,4.14012056 20,7.27232114 20,11 L20,16.4226821 L7.77974993,4.20243206 C8.45863802,3.78005235 9.20543208,3.45654262 10,3.25203497 Z M2.37898178,1.62101822 L22.3789818,21.6210182 L20.9647682,23.0352318 L17.9295364,20 L2,20 L2,19 L4,17 L4,11 C4,9.57970281 4.37012145,8.24585212 5.01917435,7.08963792 L0.964768219,3.03523178 L2.37898178,1.62101822 Z"
		/>
	</Icon>
);

NotificationOffIcon.defaultProps = {
	...defaultProps,
	label: 'Notification Off',
};
NotificationOffIcon.propTypes = propTypes;
