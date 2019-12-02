import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const LinkIcon = props => (
	<Icon icon="LinkIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M13,18 L13,16 L18,16 C20.209139,16 22,14.209139 22,12 C22,9.790861 20.209139,8 18,8 L13,8 L13,6 L18,6 C21.3137085,6 24,8.6862915 24,12 C24,15.3137085 21.3137085,18 18,18 L13,18 Z M11,18 L6,18 C2.6862915,18 -1.77635684e-15,15.3137085 -1.77635684e-15,12 C-1.77635684e-15,8.6862915 2.6862915,6 6,6 L11,6 L11,8 L6,8 C3.790861,8 2,9.790861 2,12 C2,14.209139 3.790861,16 6,16 L11,16 L11,18 L11,18 Z M8,11 L16,11 L16,13 L8,13 L8,11 Z"
		/>
	</Icon>
);

LinkIcon.defaultProps = {
	...defaultProps,
	label: 'Link',
};
LinkIcon.propTypes = propTypes;
