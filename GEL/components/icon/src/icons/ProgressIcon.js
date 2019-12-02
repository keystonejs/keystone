import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ProgressIcon = props => (
	<Icon icon="ProgressIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 C18.62775,0 24,5.373 24,12 C24,18.627 18.62775,24 12,24 Z M2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 C22,6.47714286 17.5228571,2 12,2 C6.47714286,2 2,6.47714286 2,12 Z M5.26975551,16.3265857 L5.26975551,16.3265857 L12,12 L12,4 C16.418278,4 20,7.581722 20,12 C20,16.418278 16.418278,20 12,20 C9.17578388,20 6.69337779,18.5365373 5.26975551,16.3265857 Z"
		/>
	</Icon>
);

ProgressIcon.defaultProps = {
	...defaultProps,
	label: 'Progress',
};
ProgressIcon.propTypes = propTypes;
