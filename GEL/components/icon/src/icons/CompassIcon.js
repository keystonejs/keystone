import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const CompassIcon = props => (
	<Icon icon="CompassIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M24,12 C24,18.627 18.62775,24 12,24 C5.37225,24 0,18.627 0,12 C0,5.373 5.37225,0 12,0 C18.62775,0 24,5.373 24,12 Z M12,2 C6.47714286,2 2,6.47714286 2,12 C2,17.5228571 6.47714286,22 12,22 C17.5228571,22 22,17.5228571 22,12 C22,6.47714286 17.5228571,2 12,2 Z M14.25,9.75 L18,18 L9.75,14.25 L6,6 L14.25,9.75 Z M12,13.5 C12.82875,13.5 13.5,12.82875 13.5,12 C13.5,11.17125 12.82875,10.5 12,10.5 C11.17125,10.5 10.5,11.17125 10.5,12 C10.5,12.82875 11.17125,13.5 12,13.5 Z"
		/>
	</Icon>
);

CompassIcon.defaultProps = {
	...defaultProps,
	label: 'Compass',
};
CompassIcon.propTypes = propTypes;
