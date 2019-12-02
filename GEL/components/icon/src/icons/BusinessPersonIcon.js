import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const BusinessPersonIcon = props => (
	<Icon icon="BusinessPersonIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12.2608696,19.6521739 L14,24 L10,24 L11.7391304,19.6521739 L9,16 L15,16 L12.2608696,19.6521739 Z M15.9967737,24 L24,24 L24,21.3333333 C24,18.7701873 19.8243469,17.1262595 15.9967737,16.4116152 L15,19 L15.9967737,24 Z M7.98543588,16.4149431 C4.162726,17.131355 0,18.7741579 0,21.3333333 L0,24 L7.98543588,24 L9,19 L7.98543588,16.4149431 Z M12,12 C15.315,12 18,9.315 18,6 C18,2.685 15.315,0 12,0 C8.685,0 6,2.685 6,6 C6,9.315 8.685,12 12,12"
		/>
	</Icon>
);

BusinessPersonIcon.defaultProps = {
	...defaultProps,
	label: 'Business Person',
};
BusinessPersonIcon.propTypes = propTypes;
