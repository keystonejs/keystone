import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ArrowRightIcon = props => (
	<Icon icon="ArrowRightIcon" {...props}>
		<polygon
			fill="currentColor"
			fillRule="evenodd"
			points="14.588 12 8 18.588 9.412 20 17.412 12 9.412 4 8 5.412"
		/>
	</Icon>
);

ArrowRightIcon.defaultProps = {
	...defaultProps,
	label: 'Arrow Right',
};
ArrowRightIcon.propTypes = propTypes;
