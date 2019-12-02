import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const GeolocationIcon = props => (
	<Icon icon="GeolocationIcon" {...props}>
		<polygon fill="currentColor" fillRule="evenodd" points="0 12 11.143 12.857 12 24 24 0" />
	</Icon>
);

GeolocationIcon.defaultProps = {
	...defaultProps,
	label: 'Geolocation',
};
GeolocationIcon.propTypes = propTypes;
