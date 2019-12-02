import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const StarIcon = props => (
	<Icon icon="StarIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="12 0 9 9 0 9 7.5 14.25 4.5 23.25 12 17.249 19.5 23.25 16.499 14.25 24 9 15 9"
		/>
	</Icon>
);

StarIcon.defaultProps = {
	...defaultProps,
	label: 'Star',
};
StarIcon.propTypes = propTypes;
