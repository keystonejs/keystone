import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MapIcon = props => (
	<Icon icon="MapIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M21.4444444,2 C21.7555556,2 22,2.24444444 22,2.55555556 L22,19.3555556 C22,19.6111111 21.8333333,19.8111111 21.6,19.8888889 L15,22 L9,19 L2.73333333,21.9666667 L2.55555556,22 C2.24444444,22 2,21.7555556 2,21.4444444 L2,4.64444444 C2,4.38888889 2.16666667,4.18888889 2.4,4.11111111 L9,2 L15,4 L21.2666667,2.03333333 L21.4444444,2 Z M15,20 L15,6 L9,4 L9,17 L15,20 Z"
		/>
	</Icon>
);

MapIcon.defaultProps = {
	...defaultProps,
	label: 'Map',
};
MapIcon.propTypes = propTypes;
