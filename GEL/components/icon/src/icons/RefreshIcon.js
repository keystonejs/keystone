import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const RefreshIcon = props => (
	<Icon icon="RefreshIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M21.5,12 L21.5,12 L24,12 L20.5,17 L17,12 L19.5,12 C19.5,7.85786438 16.1421356,4.5 12,4.5 C9.65136508,4.5 7.5548742,5.57955693 6.17967925,7.26951887 L5.02991296,5.54486944 C6.76508468,3.6721649 9.24565545,2.5 12,2.5 C17.2467051,2.5 21.5,6.75329488 21.5,12 Z M4.5,12 C4.5,16.1421356 7.85786438,19.5 12,19.5 C14.3486349,19.5 16.4451258,18.4204431 17.8203208,16.7304811 L18.970087,18.4551306 C17.2349153,20.3278351 14.7543445,21.5 12,21.5 C6.75329488,21.5 2.5,17.2467051 2.5,12 L0,12 L3.5,7 L7,12 L4.5,12 L4.5,12 Z"
		/>
	</Icon>
);

RefreshIcon.defaultProps = {
	...defaultProps,
	label: 'Refresh',
};
RefreshIcon.propTypes = propTypes;
