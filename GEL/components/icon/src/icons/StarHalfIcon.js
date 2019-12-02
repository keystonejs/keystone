import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const StarHalfIcon = props => (
	<Icon icon="StarHalfIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,0 L9,9 L0,9 L7.5,14.25 L4.5,23.25 L12,17.24925 L19.5,23.25 L16.49925,14.25 L24,9 L15,9 L12,0 Z M12.93675,16.0785 L12,15.32925 L12,4.743 L13.5765,9.474 L13.91925,10.49925 L15,10.49925 L19.24125,10.49925 L15.63975,13.02075 L14.72325,13.66275 L15.0765,14.724 L16.47075,18.90525 L12.93675,16.0785 Z"
		/>
	</Icon>
);

StarHalfIcon.defaultProps = {
	...defaultProps,
	label: 'Star Half',
};
StarHalfIcon.propTypes = propTypes;
