import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const KeyIcon = props => (
	<Icon icon="KeyIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M18,13 L13.7101213,13 C12.8495721,15.8914889 10.1710206,18 7,18 C3.13400675,18 0,14.8659932 0,11 C0,7.13400675 3.13400675,4 7,4 C10.1710206,4 12.8495721,6.10851105 13.7101213,9 L24,9 L24,13 L22,13 L22,17 L18,17 L18,13 Z M7,14 C8.65685425,14 10,12.6568542 10,11 C10,9.34314575 8.65685425,8 7,8 C5.34314575,8 4,9.34314575 4,11 C4,12.6568542 5.34314575,14 7,14 Z"
		/>
	</Icon>
);

KeyIcon.defaultProps = {
	...defaultProps,
	label: 'Key',
};
KeyIcon.propTypes = propTypes;
