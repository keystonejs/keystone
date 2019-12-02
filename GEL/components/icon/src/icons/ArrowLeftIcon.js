import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ArrowLeftIcon = props => (
	<Icon icon="ArrowLeftIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="9.824 12 16.412 18.588 15 20 7 12 15 4 16.412 5.412"
		/>
	</Icon>
);

ArrowLeftIcon.defaultProps = {
	...defaultProps,
	label: 'Arrow Left',
};
ArrowLeftIcon.propTypes = propTypes;
