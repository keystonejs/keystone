import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const DownloadIcon = props => (
	<Icon icon="DownloadIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M19.35,10.04 C21.95,10.22 24,12.36 24,15 C24,17.76 21.76,20 19,20 L6,20 C2.69,20 0,17.31 0,14 C0,10.91 2.34,8.36 5.35,8.04 C6.6,5.64 9.11,4 12,4 C15.64,4 18.67,6.59 19.35,10.04 Z M17,14 L14,14 L14,10 L10,10 L10,14 L7,14 L12,19 L17,14 Z"
		/>
	</Icon>
);

DownloadIcon.defaultProps = {
	...defaultProps,
	label: 'Download',
};
DownloadIcon.propTypes = propTypes;
