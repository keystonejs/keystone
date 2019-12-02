import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const TabletIcon = props => (
	<Icon icon="TabletIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,1.77635684e-15 L20,1.77635684e-15 C21.1045695,1.57345071e-15 22,0.8954305 22,2 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,2 L2,2 C2,0.8954305 2.8954305,1.97926296e-15 4,1.77635684e-15 L4,1.77635684e-15 Z M4,2 L4,18 L20,18 L20,2 L4,2 Z M12,22.5 C12.8284271,22.5 13.5,21.8284271 13.5,21 C13.5,20.1715729 12.8284271,19.5 12,19.5 C11.1715729,19.5 10.5,20.1715729 10.5,21 C10.5,21.8284271 11.1715729,22.5 12,22.5 Z"
		/>
	</Icon>
);

TabletIcon.defaultProps = {
	...defaultProps,
	label: 'Tablet',
};
TabletIcon.propTypes = propTypes;
