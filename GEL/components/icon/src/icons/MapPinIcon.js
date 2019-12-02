import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MapPinIcon = props => (
	<Icon icon="MapPinIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,24 C6.66666667,16.278852 4,10.9455187 4,8 C4,3.581722 7.581722,0 12,0 C16.418278,0 20,3.581722 20,8 C20,10.9455187 17.3333333,16.278852 12,24 Z M12,14 C15.3137085,14 18,11.3137085 18,8 C18,4.6862915 15.3137085,2 12,2 C8.6862915,2 6,4.6862915 6,8 C6,11.3137085 8.6862915,14 12,14 Z"
		/>
	</Icon>
);

MapPinIcon.defaultProps = {
	...defaultProps,
	label: 'Map Pin',
};
MapPinIcon.propTypes = propTypes;
