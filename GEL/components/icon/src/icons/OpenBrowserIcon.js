import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const OpenBrowserIcon = props => (
	<Icon icon="OpenBrowserIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,0 L2,0 C0.89,0 0,0.9 0,2 L0,18 C0,19.1 0.89,20 2,20 L7,20 L7,18 L2,18 L2,6 L22,6 L22,18 L17,18 L17,20 L22,20 C23.1,20 24,19.1 24,18 L24,2 C24,0.9 23.11,0 22,0 Z M12,9 L6,15 L10,15 L10,24 L14,24 L14,15 L18,15 L12,9 Z"
		/>
	</Icon>
);

OpenBrowserIcon.defaultProps = {
	...defaultProps,
	label: 'Open Browser',
};
OpenBrowserIcon.propTypes = propTypes;
