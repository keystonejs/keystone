import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const BackspaceIcon = props => (
	<Icon icon="BackspaceIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M22,2 L7,2 C6.31,2 5.77,2.35 5.41,2.88 L0,12 L5.41,21.11 C5.77,21.64 6.31,22 7,22 L22,22 C23.1,22 24,21.1 24,20 L24,4 C24,2.9 23.1,2 22,2 Z M19,15.59 L17.59,17 L14,13.41 L10.41,17 L9,15.59 L12.59,12 L9,8.41 L10.41,7 L14,10.59 L17.59,7 L19,8.41 L15.41,12 L19,15.59 Z"
		/>
	</Icon>
);

BackspaceIcon.defaultProps = {
	...defaultProps,
	label: 'Backspace',
};
BackspaceIcon.propTypes = propTypes;
