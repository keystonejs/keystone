import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const GelIcon = props => (
	<Icon icon="GelIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="nonzero"
			d="M11.998.034c5.797 0 10.496 4.697 10.496 10.491 0 8.673-8.083 12.257-10.496 13.464v-2.973c-5.797 0-10.496-4.697-10.496-10.49C1.502 4.73 6.202.033 11.998.033zM7.209 7.601c-1.881 0-3.282 1.286-3.282 3.193v.07c0 1.872 1.156 3.193 3.282 3.193 2.022 0 3.063-1.198 3.063-2.79v-.77h-2.94v1.25h1.173c-.036.5-.368.945-1.243.945-1.085 0-1.462-.787-1.462-1.802v-.07c0-1.128.534-1.81 1.418-1.81.665 0 1.042.306 1.129.892h1.777c-.123-1.627-1.436-2.3-2.915-2.3zm7.912.097h-4.323v6.254h4.463V12.57h-2.678v-1.137h2.022v-1.277h-2.022V9.08h2.538V7.698zm2.486 0h-1.803v6.254h4.166v-1.39h-2.363V7.697z"
		/>
	</Icon>
);

GelIcon.defaultProps = {
	...defaultProps,
	label: 'Gift',
};
GelIcon.propTypes = propTypes;
