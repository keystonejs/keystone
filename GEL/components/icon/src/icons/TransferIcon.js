import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const TransferIcon = props => (
	<Icon icon="TransferIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,12 L16,12 L16,8 L24,16 L16,24 L16,20 L12,20 L12,12 Z M0,8 L8,0 L8,4 L12,4 L12,12 L8,12 L8,16 L0,8 Z"
		/>
	</Icon>
);

TransferIcon.defaultProps = {
	...defaultProps,
	label: 'Transfer',
};
TransferIcon.propTypes = propTypes;
