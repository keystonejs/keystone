import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const WearableIcon = props => (
	<Icon icon="WearableIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M14,22 L14,22 L14,19 L17,19 C19.209139,19 21,17.209139 21,15 C21,12.790861 19.209139,11 17,11 L7,11 C4.790861,11 3,12.790861 3,15 C3,17.209139 4.790861,19 7,19 L10,19 L10,22 L7,22 C3.13400675,22 0,18.8659932 0,15 C0,11.1340068 3.13400675,8 7,8 L17,8 C20.8659932,8 24,11.1340068 24,15 C24,18.8659932 20.8659932,22 17,22 L14,22 Z M7,2 L17,2 C17.5522847,2 18,2.44771525 18,3 L18,6 L6,6 L6,3 L6,3 C6,2.44771525 6.44771525,2 7,2 Z"
		/>
	</Icon>
);

WearableIcon.defaultProps = {
	...defaultProps,
	label: 'Wearable',
};
WearableIcon.propTypes = propTypes;
