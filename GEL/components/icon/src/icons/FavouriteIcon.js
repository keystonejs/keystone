import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const FavouriteIcon = props => (
	<Icon icon="FavouriteIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,23 L10.26,21.4174387 C4.08,15.8185286 0,12.1258856 0,7.59400545 C0,3.9013624 2.904,1 6.6,1 C8.688,1 10.692,1.97111717 12,3.50572207 C13.308,1.97111717 15.312,1 17.4,1 C21.096,1 24,3.9013624 24,7.59400545 C24,12.1258856 19.92,15.8185286 13.74,21.4294278 L12,23 Z"
		/>
	</Icon>
);

FavouriteIcon.defaultProps = {
	...defaultProps,
	label: 'Favourite',
};
FavouriteIcon.propTypes = propTypes;
