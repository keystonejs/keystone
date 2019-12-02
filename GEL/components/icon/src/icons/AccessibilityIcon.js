import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const AccessibilityIcon = props => (
	<Icon icon="AccessibilityIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,0 C13.375,0 14.5,1.125 14.5,2.5 C14.5,3.875 13.375,5 12,5 C10.625,5 9.5,3.875 9.5,2.5 C9.5,1.125 10.625,0 12,0 Z M22,8 L16,8 L16,24 L13,24 L13,16 L11,16 L11,24 L8,24 L8,8 L2,8 L2,6 L22,6 L22,8 Z"
		/>
	</Icon>
);

AccessibilityIcon.defaultProps = {
	...defaultProps,
	label: 'Accessibility',
};
AccessibilityIcon.propTypes = propTypes;
