import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const SecurityIcon = props => (
	<Icon icon="SecurityIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,0 L22,4.5 L22,11 C22,17.0545455 17.7333333,22.6254545 12,24 C6.26666667,22.6254545 2,17.0545455 2,11 L2,4.5 L12,0 Z M4.04577037,12 L4.04577037,12 L12,12 L12,21.9311004 C16.274414,20.6811566 19.534648,16.5867485 19.9542296,12 L12,12 L12,2.19317122 L4,5.79317122 L4,11 C4,11.3353086 4.01548572,11.6689368 4.04577037,12 Z"
		/>
	</Icon>
);

SecurityIcon.defaultProps = {
	...defaultProps,
	label: 'Security',
};
SecurityIcon.propTypes = propTypes;
